import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaEye } from "react-icons/fa6";
import OPDReport from "./OPDReport";

function Reports() {
    const [opds, setOpds] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedReport, setSelectedReport] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingReport, setLoadingReport] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [opdRes, workerRes] = await Promise.all([
            api.get("/api/opds"),
            api.get("/api/workers")
        ]);
        setOpds(opdRes.data);
        setWorkers(workerRes.data);
    };

    function formatISTDate(date) {
        return new Date(date).toLocaleDateString("en-GB", {
            timeZone: "Asia/Kolkata"
        });
    }



    const getWorkerById = (id) =>
        workers.find(w => w.id === id);

    const matchesSearch = (worker, query) => {
        if (!worker || !query) return true;

        const q = query.toLowerCase();

        return (
            worker.name?.toLowerCase().includes(q) ||
            worker.employee_id?.toLowerCase().includes(q) ||
            worker.fathers_name?.toLowerCase().includes(q) ||
            String(worker.id).includes(q) ||
            worker.aadhar_no?.includes(q)
        );
    };

    const filteredOpds = opds.filter(opd => {
        const opdDate = new Date(opd.created_at);
        const worker = getWorkerById(opd.worker_id);

        // Date filter
        if (fromDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            if (opdDate < from) return false;
        }

        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            if (opdDate > to) return false;
        }

        // Search filter
        if (!matchesSearch(worker, searchQuery)) return false;

        return true;
    });



    if (selectedReport) {
        return (
            <div className="w-full">
                <OPDReport data={selectedReport} />

                <div className="flex justify-center gap-4 mt-4">
                    <button
                        onClick={() => window.print()}
                        className="bg-blue-600 px-4 py-2 rounded"
                    >
                        Print / Save PDF
                    </button>

                    <button
                        onClick={() => setSelectedReport(null)}
                        className="bg-gray-600 px-4 py-2 rounded"
                    >
                        Back to Reports
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-800 p-4 rounded-xl">
            <h2 className="text-lg font-bold mb-4">OPD REPORTS</h2>

            {/* Filters */}
            <div className="flex gap-4 mb-4 text-sm">
                <input
                    type="date"
                    className="bg-gray-700 p-2 rounded"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                />
                <input
                    type="date"
                    className="bg-gray-700 p-2 rounded"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Search by name / emp id / father / aadhaar / id"
                    className="bg-gray-700 p-2 rounded flex-1"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Table */}
            <table className="w-full text-sm border">
                <thead>
                    <tr className="bg-gray-700">
                        <th className="p-2 border">Date</th>
                        <th className="p-2 border">Worker</th>
                        <th className="p-2 border">Complaint</th>
                        <th className="p-2 border">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOpds.map(opd => {
                        const worker = getWorkerById(opd.worker_id);
                        return (
                            <tr key={opd.id} className="hover:bg-gray-700">
                                <td className="p-2 border">
                                    {formatISTDate(opd.created_at)}
                                </td>
                                <td className="p-2 border">
                                    {worker?.name || "Unknown"}
                                </td>
                                <td className="p-2 border">
                                    {opd.presenting_complaint}
                                </td>
                                <td className="p-2 border text-center">
                                    <button
                                        onClick={async () => {
                                            try {
                                                setLoadingReport(true);
                                                const presRes = await api.get(`/api/prescriptions/by-opd/${opd.id}`);
                                                console.log(presRes.data);
                                                setSelectedReport({
                                                    worker,
                                                    opd,
                                                    prescription: presRes.data
                                                })
                                            } catch (err) {
                                                console.error(err);
                                                alert("Failed to load prescription");
                                            } finally {
                                                setLoadingReport(false);
                                            }
                                        }
                                        }
                                        className="text-blue-400 hover:text-blue-600"
                                    >
                                        <FaEye />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {filteredOpds.length === 0 && (
                <p className="text-gray-400 text-sm mt-4">
                    No records found for selected date range
                </p>
            )}
        </div>
    );
}

export default Reports;
