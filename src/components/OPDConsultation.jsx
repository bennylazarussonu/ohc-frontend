import { FaMagnifyingGlass, FaNotesMedical, FaPenToSquare, FaFileExcel } from "react-icons/fa6";
import api from "../api/axios";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { formatDateDMY } from "../utils/date";

function OPDConsultation({ onEdit, refreshKey }) {
    const [records, setRecords] = useState([]);
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        api.get("/api/opds/for-consultation").then(res => setRecords(res.data));
    }, [refreshKey]);

    const downloadExcel = () => {
        const data = filteredRecords.map(opd => ({
            "OPD ID": opd.id,
            "Employee ID": opd.worker?.employee_id,
            "Worker": opd.worker?.name,
            "Designation": opd.worker?.designation,
            "Aadhar": opd.worker?.aadhar_no,
            "Date": formatDateDMY(opd.created_at),
            "Complaint": opd.presenting_complaint,
            "Paramedic": opd?.case_dealt_by?.userId
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "For Consultation"
        );

        XLSX.writeFile(
            workbook,
            `For_Consultation_${new Date().toISOString().split("T")[0]}.xlsx`
        );
    };

    const filteredRecords = records.filter(opd => {
        const q = search.toLowerCase();

        const matchesSearch =
            !search ||
            String(opd.id).includes(q) ||
            opd.worker?.employee_id?.toLowerCase().includes(q) ||
            opd.worker?.name?.toLowerCase().includes(q) ||
            opd.worker?.designation?.toLowerCase().includes(q) ||
            opd.worker?.aadhar_no?.toLowerCase().includes(q) ||
            opd.presenting_complaint?.toLowerCase().includes(q) ||
            opd.case_dealt_by?.userId?.toLowerCase().includes(q);

        const recordDate = new Date(opd.created_at);

        const matchesFrom =
            !fromDate ||
            recordDate >= new Date(fromDate);

        const matchesTo =
            !toDate ||
            recordDate <= new Date(`${toDate}T23:59:59`);

        return matchesSearch && matchesFrom && matchesTo;
    });

    return (
        <div className="bg-gray-800 rounded w-full">
            <div className="flex justify-between">
                    <h2 className="text-sm font-bold">OPDs For Consultation</h2>
                    <button
                className="bg-green-600 p-2 text-sm rounded text-sm flex items-center gap-2"
                onClick={downloadExcel}
            >
              <FaFileExcel />
                <p className="text-xs">Download Excel</p>
            </button>
                  </div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
                <FaMagnifyingGlass />

                <input
                    type="text"
                    placeholder="Search OPD"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-gray-700 rounded p-1 text-xs w-72"
                />

                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="bg-gray-700 rounded p-1 text-xs"
                />

                <span className="text-xs">To</span>

                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="bg-gray-700 rounded p-1 text-xs"
                />

                <button
                    className="bg-red-600 px-2 py-1 rounded text-xs"
                    onClick={() => {
                        setSearch("");
                        setFromDate("");
                        setToDate("");
                    }}
                >
                    Clear
                </button>
            </div>
            <table className="w-full text-xs">
                <thead className="border bg-gray-900">
                    <tr className="border">
                        <th className="border p-2">OPD ID</th>
                        <th className="border p-2">Employee ID</th>
                        <th className="border p-2">Worker</th>
                        <th className="border p-2">Designation</th>
                        <th className="border p-1">Aadhar</th>
                        <th className="border p-2">Date</th>
                        <th className="border p-2">Complaint</th>
                        <th className="border p-2">Paramedic</th>
                        <th className="border p-2 w-[5%]">Action</th>
                    </tr>
                </thead>
                <tbody className="border">
                    {filteredRecords.map(opd => (
                        <tr key={opd.id}>
                            <td className="border p-1">{opd.id}</td>
                            <td className="border p-1">{opd.worker.employee_id}</td>
                            <td className="border p-1">{opd.worker.name}</td>
                            <td className="border p-1">{opd.worker.designation}</td>
                            <td className="border p-1">{opd.worker.aadhar_no}</td>
                            <td className="border p-1">{formatDateDMY(opd.created_at)}</td>
                            <td className="border p-1">{opd.presenting_complaint}</td>
                            <th className="border p-1">{opd.case_dealt_by.userId}</th>
                            <td className="border p-2">
                                <button
                                    className=" flex items-center bg-blue-600 rounded p-1 gap-1 text-xs"
                                    onClick={() => onEdit(opd.id)}
                                //   disabled={!!editingFormReports}
                                >
                                    <FaNotesMedical />
                                    Consult
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default OPDConsultation;