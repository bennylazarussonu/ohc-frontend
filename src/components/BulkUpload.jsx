import { useState } from "react";
import * as XLSX from "xlsx";
import api from "../api/axios";
import SingleWorkerForm from "./SingleWorkerForm";

function BulkUpload() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [uploadType, setUploadType] = useState("single");

  function formatExcelDate(value) {
    if (!value) return "";

    if (value instanceof Date) {
      return value.toLocaleDateString("en-GB");
    }

    if (typeof value === "number") {
      const jsDate = new Date((value - 25569) * 86400 * 1000);
      return jsDate.toLocaleDateString("en-GB");
    }

    return String(value);
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setRows(jsonData);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/api/workers/bulk", formData);
      alert("Bulk upload successful");
      setRows([]);
      setFile(null);
    } catch {
      alert("Upload failed");
    }
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex bg-gray-800 rounded mb-4 overflow-hidden p-2 gap-2">
        <button
          onClick={() => setUploadType("bulk")}
          className={`w-1/2 py-1 text-sm font-semibold transition rounded 
            ${uploadType === "bulk"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"}
          `}
        >
          Bulk Upload
        </button>

        <button
          onClick={() => setUploadType("single")}
          className={`w-1/2 py-1 text-sm font-semibold transition rounded
            ${uploadType === "single"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"}
          `}
        >
          Single Entry
        </button>
      </div>

      {/* BULK UPLOAD */}
      {uploadType === "bulk" && (
        <>
          <div className="p-6 bg-gray-800 text-white rounded-xl mb-3">
            <p className="text-lg font-bold mb-2">Bulk Upload Worker Data</p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
          </div>

          {rows.length > 0 && (
            <div className="p-6 bg-gray-800 text-white rounded-xl">
              <p className="text-lg font-bold mb-2">Preview</p>

              <div className="max-h-64 overflow-auto border border-gray-700 no-scrollbar">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-900 sticky top-0">
                    <tr>
                      {Object.keys(rows[0]).map((key) => (
                        <th key={key} className="p-2 border">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className="odd:bg-gray-600 even:bg-gray-700">
                        {Object.entries(row).map(([key, value], j) => (
                          <td key={j} className="p-2 border">
                            {key === "dob" || key === "date_of_joining"
                              ? formatExcelDate(value)
                              : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleUpload}
                className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
              >
                Upload Excel
              </button>
            </div>
          )}
        </>
      )}

      {/* SINGLE ENTRY (placeholder) */}
      {uploadType === "single" && (
        // <div className="p-6 bg-gray-800 text-white rounded-xl text-center text-gray-400">
        //   🚧 Single worker entry form coming next
        // </div>
        <SingleWorkerForm />
      )}
    </div>
  );
}

export default BulkUpload;
