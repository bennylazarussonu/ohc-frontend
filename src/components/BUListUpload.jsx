import { useState } from "react";
import api from "../api/axios";

function BUListUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  console.log(file);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage("");

      const res = await api.post("/api/bulist/bulk", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setMessage(
  `Upload successful: ${res.data.total} items
Matched: ${res.data.matched}
Unmatched: ${res.data.unmatched}

Unmatched items:
${res.data.unmatchedItems.join("\n")}`
);

    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded max-w-md">
      <h2 className="font-semibold mb-2">BU List – One Time Upload</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-3"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload Excel"}
      </button>

      {message && (
        <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">
          {message}
        </p>
      )}
    </div>
  );
}

export default BUListUpload;
