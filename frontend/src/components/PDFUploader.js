import React, { useState } from "react";
import axios from "axios";

const PDFUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [summary, setSummary] = useState("");

  // Handler function for file input change event
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Function to upload PDF file
  const uploadPDF = async () => {
    if (!selectedFile) {
      console.error("No file selected for upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    let res;
    try {
      res = await axios.post("http://localhost:5001/upload", formData);
    } catch (error) {
      console.error(error);
      return;
    }

    console.log(res.data);
    setSummary(res.data.summary);
  };

  // Render function
  return (
    <div>
      <input
        type="file"
        name="file"
        placeholder="Upload a PDF"
        onChange={handleFileChange}
      />
      <button type="button" onClick={uploadPDF}>
        Submit
      </button>
      {summary && (
        <div>
          <h2>Summary:</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
