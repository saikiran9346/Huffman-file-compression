import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [encodeFile, setEncodeFile] = useState(null);
  const [decodeFile, setDecodeFile] = useState(null);
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const uploadFile = async (file, type) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `http://localhost:5000/${type}`,
        formData,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(res.data);
      setDownloadUrl(url);

      setMessage(
        type === "encode"
          ? "File encoded successfully"
          : "File decoded successfully"
      );
    } catch (err) {
      console.error(err);
      setMessage("Operation failed");
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Huffman File Encoder and Decoder</h1>

        {/* Encode */}
        <div className="section">
          <div className="file-box">
            <input
              type="file"
              onChange={(e) => setEncodeFile(e.target.files[0])}
            />
          </div>
          <button
            disabled={!encodeFile}
            onClick={() => uploadFile(encodeFile, "encode")}
          >
            Upload and Encode
          </button>
        </div>

        {/* Decode */}
        <div className="section">
          <div className="file-box">
            <input
              type="file"
              onChange={(e) => setDecodeFile(e.target.files[0])}
            />
          </div>
          <button
            disabled={!decodeFile}
            onClick={() => uploadFile(decodeFile, "decode")}
          >
            Upload and Decode
          </button>
        </div>

        {/* Result */}
        {message && (
          <div className="result-box">
            <p><b>Message:</b> {message}</p>
            {downloadUrl && (
              <p>
                <b>Download File:</b>{" "}
                <a href={downloadUrl} download>
                  Download
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
