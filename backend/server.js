const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
const upload = multer({ dest: "uploads/" });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// POST /upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  // File upload handler
  try {
    if (!req.file) {
      console.error("No file received in the request.");
      return res
        .status(400)
        .json({ error: "No file received in the request." });
    }

    console.log("Uploading file to Cloudinary...");
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "raw",
      public_id: "my_pdf",
      pages: true,
    });
    console.log("File uploaded to Cloudinary.");

    const url = result.url; // Get the URL of the uploaded file
    const python = exec("python ocr.py", { maxBuffer: 1024 * 5000 });
    python.stdin.write(url);
    python.stdin.end();

    let output = "";
    python.stdout.on("data", function (data) {
      output += data;
    });

    python.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    python.on("close", (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        return res.status(500).json({ error: "Error processing the text." });
      }

      res.json({ summary: output });
    });
  } catch (err) {
    console.error("Error occurred during file upload:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(5001, () => console.log("Server started on port 5001"));
