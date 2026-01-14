import { FaPenToSquare } from "react-icons/fa6";
import api from "../api/axios";
import { useState, useEffect } from "react";

function OPDReportList({ onEdit, refreshKey }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get("/api/opds/").then(res => setRecords(res.data));
  }, [refreshKey]);

  return (
    <div className="bg-gray-800 rounded p-3 w-full">
      <table className="w-full">
        <thead className="border bg-gray-900">
          <tr className="border">
            <th className="border p-2">ID</th>
            <th className="border p-2">Worker</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Complaint</th>
            <th className="border p-2 w-[5%]">Action</th>
          </tr>
        </thead>
        <tbody className="border">
          {records.map(r => (
            <tr key={r.id}>
              <td className="border p-1">{r.id}</td>
              <td className="border p-1">{r.worker_id}</td>
              <td className="border p-1">{new Date(r.created_at).toLocaleDateString()}</td>
              <td className="border p-1">{r.presenting_complaint}</td>
              <td className="border p-1 flex justify-center">
                <button
                  className=" flex items-center text-green-500 rounded p-1"
                  onClick={() => onEdit(r.id)}
                //   disabled={!!editingFormReports}
                >
                  <FaPenToSquare/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OPDReportList;