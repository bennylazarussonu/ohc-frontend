import { useState } from "react";
import * as XLSX from "xlsx";
import api from "../api/axios";
import SingleMedicineForm from "./SingleMedicineForm";

function BulkMedicineUpload() {
    const [file, setFile] = useState(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadType, setUploadType] = useState("single");

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet);
            setRows(json);
        };

        reader.readAsArrayBuffer(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return alert("Select a file");

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            await api.post("/api/medicines/bulk", formData);
            alert("Medicines uploaded successfully");
            setRows([]);
            setFile(null);
        } catch {
            alert("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
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
                <button
                    onClick={() => setUploadType("group")}
                    className={`w-1/2 py-1 text-sm font-semibold transition rounded
            ${uploadType === "group"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"}
          `}>
            Group Medicines
          </button>
            </div>
            {uploadType === "bulk" && (
                <>
                    <div className="p-6 bg-gray-800 h-min text-white rounded-xl mb-2">
                        <p className="text-lg mb-2">Bulk Upload Medicines Data</p>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="p-6 bg-gray-800 h-min text-white rounded-xl mt-2">
                        <p className="text-lg mb-2">Preview of the Medicines Data: </p>
                        {rows.length > 0 && (
                            <>
                                <div className="mt-4 max-h-full overflow-auto border border-gray-700 no-scrollbar">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-900 sticky top-0">
                                            <tr>
                                                {Object.keys(rows[0]).map((key) => (
                                                    <th key={key} className="p-2 border">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, i) => (
                                                <tr key={i} className="odd:bg-gray-600 even: bg-gray-700">
                                                    {Object.values(row).map((val, j) => (
                                                        <td key={j} className="p-2 border">
                                                            {String(val)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <button
                                    onClick={handleUpload}
                                    disabled={loading}
                                    className="mt-4 bg-green-600 px-4 py-2 rounded disabled:opacity-50"
                                >
                                    {loading ? "Uploading..." : "Confirm & Upload"}
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}
            {uploadType === "single" && (
                <SingleMedicineForm />
            )}
            {uploadType === "group" && (
                "🚧 Will be here soon..."
            )}
        </div>

    );
}

export default BulkMedicineUpload;
