#include <iostream>
#include <fstream>
#include <unordered_map>
#include <queue>
#include <vector>
#include <string>

using namespace std;

/* ---------------- Huffman Node ---------------- */
struct Node {
    char ch;
    int freq;
    Node *left, *right;

    Node(char c, int f) {
        ch = c;
        freq = f;
        left = right = nullptr;
    }
};

/* ---------------- Comparator ---------------- */
struct Compare {
    bool operator()(Node* a, Node* b) {
        return a->freq > b->freq;
    }
};

/* ---------------- Generate Codes ---------------- */
void generateCodes(Node* root, string code,
                   unordered_map<char, string>& codes) {
    if (!root) return;

    if (!root->left && !root->right)
        codes[root->ch] = code;

    generateCodes(root->left, code + "0", codes);
    generateCodes(root->right, code + "1", codes);
}
/* ---------------- Compression ---------------- */
void compressFile(const string& inputFile, const string& outputFile) {
    ifstream in(inputFile, ios::binary);
    if (!in) {
        cerr << "Cannot open input file\n";
        return;
    }

    string text((istreambuf_iterator<char>(in)),
                 istreambuf_iterator<char>());
    in.close();

    unordered_map<char, int> freq;
    for (char c : text) freq[c]++;

    priority_queue<Node*, vector<Node*>, Compare> pq;
    for (auto& p : freq)
        pq.push(new Node(p.first, p.second));

    while (pq.size() > 1) {
        Node* left = pq.top(); pq.pop();
        Node* right = pq.top(); pq.pop();
        Node* parent = new Node('\0', left->freq + right->freq);
        parent->left = left;
        parent->right = right;
        pq.push(parent);
    }

    Node* root = pq.top();

    unordered_map<char, string> codes;
    generateCodes(root, "", codes);

    ofstream out(outputFile, ios::binary);
    if (!out) {
        cerr << "Cannot open output file\n";
        return;
    }

    /* Write Huffman table */
    for (auto& p : codes)
        out << (unsigned char)p.first << " " << p.second << "\n";
    out << "###\n";   // separator

    /* Write encoded data */
    for (char c : text)
        out << codes[c];

    out.close();
}

/* ---------------- Decompression ---------------- */
void decompressFile(const string& inputFile, const string& outputFile) {
    ifstream in(inputFile, ios::binary);
    if (!in) {
        cerr << "Cannot open compressed file\n";
        return;
    }

    unordered_map<string, char> table;
    string code;
    char ch;

    // Read header safely
    while (true) {
        in.get(ch);
        if (!in) return;

        if (ch == '#') {
            in.get(); // #
            in.get(); // #
            in.get(); // \n
            break;
        }

        in.get(); // space
        getline(in, code);
        table[code] = ch;
    }

    // Decode bitstream
    string bits, decoded;
    char bit;

    while (in.get(bit)) {
        if (bit != '0' && bit != '1') continue;
        bits += bit;
        if (table.count(bits)) {
            decoded += table[bits];
            bits.clear();
        }
    }

    in.close();

    ofstream out(outputFile, ios::binary);
    out << decoded;
    out.close();
}


/* ---------------- Main ---------------- */
int main(int argc, char* argv[]) {
    if (argc != 4) {
        cout << "Usage:\n";
        cout << "  huffman encode <input> <output>\n";
        cout << "  huffman decode <input> <output>\n";
        return 1;
    }

    string mode = argv[1];
    if (mode == "encode")
        compressFile(argv[2], argv[3]);
    else if (mode == "decode")
        decompressFile(argv[2], argv[3]);
    else
        cout << "Invalid mode\n";

    return 0;
}
