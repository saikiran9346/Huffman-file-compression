const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());

const uploadDir = path.join(__dirname, "uploads");
const outputDir = path.join(__dirname, "output");

// Ensure folders exist
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const upload = multer({ dest: uploadDir });

app.post("/encode", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const inputPath = req.file.path;
  const outputPath = path.join(outputDir, `${Date.now()}.huff`);
  const exePath = path.join(__dirname, "..", "cpp_engine", "huffman.exe");

  const command = `"${exePath}" encode "${inputPath}" "${outputPath}"`;

  exec(command, (error) => {
    if (error) {
      console.error("C++ error:", error);
      return res.status(500).send("Compression failed");
    }

    // ✅ Check file exists before sending
    if (!fs.existsSync(outputPath)) {
      return res.status(500).send("Output file not created");
    }

    res.download(outputPath, "compressed.huff");
  });
});
app.post("/decode", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const inputPath = req.file.path;
  const outputPath = path.join(outputDir, `${Date.now()}.txt`);
  const exePath = path.join(__dirname, "..", "cpp_engine", "huffman.exe");

  const command = `"${exePath}" decode "${inputPath}" "${outputPath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Decode exec error:", error);
      console.error("stderr:", stderr);
      return res.status(500).send("Decompression failed");
    }

    if (!fs.existsSync(outputPath)) {
      console.error("Decoded file not created");
      return res.status(500).send("Decoded file missing");
    }

    res.download(outputPath, "decoded.txt");
  });
});


app.listen(5000, () => {
  console.log("Express server running on http://localhost:5000");
});
