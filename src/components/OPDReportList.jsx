import { FaMagnifyingGlass, FaPenToSquare } from "react-icons/fa6";
import api from "../api/axios";
import { useState, useEffect } from "react";
import {formatDateDMY} from "../utils/date";

function OPDReportList({ onEdit, refreshKey }) {
  const [records, setRecords] = useState([]);
  console.log(records);

  useEffect(() => {
    api.get("/api/opds/finished").then(res => setRecords(res.data));
  }, [refreshKey]);

  return (
    <div className="bg-gray-800 rounded w-full">
      <div className="flex items-center gap-2 mb-2">
        <FaMagnifyingGlass/>
        <input 
          type="text"
          placeholder="Search OPD"
          className="bg-gray-700 rounded p-1 text-sm w-72"
        />
      </div>
      <table className="w-fullt text-sm">
        <thead className="border bg-gray-900">
          <tr className="border">
            <th className="border p-2">OPD ID</th>
            <th className="border p-2">Employee ID</th>
            <th className="border p-2">Worker</th>
            <th className="border p-2">Designation</th>
            <th className="border p-1">Aadhar</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Complaint</th>
            <th className="border p-2">Handled By</th>
            <th className="border p-2 w-[5%]">Action</th>
          </tr>
        </thead>
        <tbody className="border">
          {records.map(opd => (
            <tr key={opd.id}>
              <td className="border p-1">{opd.id}</td>
              <td className="border p-1">{opd.worker.employee_id}</td>
              <td className="border p-1">{opd.worker.name}</td>
              <td className="border p-1">{opd.worker.designation}</td>
              <td className="border p-1">{opd.worker.aadhar_no}</td>
              <td className="border p-1">{formatDateDMY(opd.created_at)}</td>
              <td className="border p-1">{opd.presenting_complaint}</td>
              <td className="border p-1">{opd.case_dealt_by.userId}</td>
              <td className="border p-1 flex justify-center h-full w-full">
                <button
                  className=" flex items-center text-green-500 rounded p-1"
                  onClick={() => onEdit(opd.id)}
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