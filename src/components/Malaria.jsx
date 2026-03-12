import { FaMagnifyingGlass } from "react-icons/fa6";
import { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import MalariaModal from "./MalariaModal";
import { FaMosquito } from "react-icons/fa6";
import { formatDateDMY } from "../utils/date";

function Malaria() {
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [malariaTests, setMalariaTests] = useState([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [tab, setTab] = useState("new");
    console.log(malariaTests);

    const filteredWorkers = useMemo(() => {
        if (!debouncedSearch) return workers;

        return workers.filter(worker =>
            worker.searchText?.includes(debouncedSearch)
        );
    }, [workers, debouncedSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.toLowerCase());
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const res = await api.get("/api/malaria/workers/all");

                const prepared = res.data.map(w => ({
                    ...w,
                    searchText: (
                        `${w.name || ""} ${w.employee_id || ""} ${w.fathers_name || ""} ${w.aadhar_no || ""} ${w.phone_no || ""} ${w.contractor_name || ""} ${w.id || ""}`
                    ).toLowerCase()
                }));

                setWorkers(prepared);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchMalariaTests = async () => {
            try {
                const res = await api.get("/api/malaria");
                const data = res.data;
                setMalariaTests(data);
            } catch (err) {
                console.error(err);
            }
        }

        fetchWorkers();
        fetchMalariaTests();
    }, []);


    const displayWorkers = debouncedSearch
        ? filteredWorkers
        : workers.slice(0, 200);

    return (
        <div className="bg-gray-800 p-6 w-full rounded-xl overflow-auto no-scrollbar">
            <h2 className="text-lg font-bold mb-3">MALARIA TEST</h2>

            <div className="w-full rounded grid grid-cols-2 gap-2 my-4">
                <div onClick={() => setTab("new")} className={`cursor-pointer w-full text-center p-1 font-semibold rounded text-sm ${tab === "new" ? "bg-blue-600" : "bg-gray-700"}`}>
                    New
                </div>
                <div onClick={() => setTab("tests")} className={`cursor-pointer w-full text-center p-1 font-semibold rounded text-sm ${tab === "tests" ? "bg-blue-600" : "bg-gray-700"}`}>
                    Tests Done
                </div>
            </div>

            {tab === "new" && (
                <>
                    <div className="flex items-center gap-2 mb-4">
                        <FaMagnifyingGlass />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="text-sm bg-gray-700 rounded p-2 w-full"
                        />
                    </div>


                    {workers.length > 0 ? (
                        <table className="w-full text-sm border">
                            <thead className="bg-gray-900">
                                <tr>
                                    <th className="p-2 border">ID</th>
                                    <th className="p-2 border">Name</th>
                                    <th className="p-2 border">Employee ID</th>
                                    <th className="p-2 border">Fathers Name</th>
                                    <th className="p-2 border">Aadhar No</th>
                                    <th className="p-2 border">Date of Birth</th>
                                    <th className="p-2 border">Phone Number</th>
                                    <th className="p-2 border">Contractor Name</th>
                                    <th className="p-2 border">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayWorkers.length > 0 ? (displayWorkers.map((worker) => (
                                    <tr key={worker.id}>
                                        <td className="p-2 border">{worker.id}</td>
                                        <td className="p-2 border">{worker.name}</td>
                                        <td className="p-2 border">{worker.employee_id}</td>
                                        <td className="p-2 border">{worker.fathers_name}</td>
                                        <td className="p-2 border">{worker.aadhar_no}</td>
                                        <td className="p-2 border">{formatDateDMY(worker.dob)}</td>
                                        <td className="p-2 border">{worker.phone_no}</td>
                                        <td className="p-2 border">{worker.contractor_name}</td>
                                        <td className="p-2 border w-[10%]">
                                            <button
                                                className="bg-blue-600 text-sm gap-2 hover:bg-blue-700 flex items-center text-white px-3 rounded"
                                                onClick={() => setSelectedWorker(worker)}
                                            >
                                                <FaMosquito />
                                                Test for Malaria
                                            </button>
                                        </td>
                                    </tr>
                                ))) : (
                                    <p className="col-span-9 text-red-400 font-semibold">No records matching your search</p>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <td className="text-center text-gray-400">No workers found.</td>
                    )}
                    {selectedWorker && (
                        <MalariaModal
                            worker={selectedWorker}
                            onClose={() => setSelectedWorker(null)}
                        />
                    )}
                </>
            )}

            {tab === "tests" && (
                <>
                    <table className="text-sm w-full border">
                        <thead className="bg-gray-900">
                            <tr>
                                <th className="p-2 border">ID</th>
                                <th className="p-2 border">Worker Name</th>
                                <th className="p-2 border">Employee ID</th>
                                <th className="p-2 border">Contractor Name</th>
                                <th className="p-2 border">Phone No</th>
                                <th className="p-2 border">Date of Test</th>
                                <th className="p-2 border">Tested By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {malariaTests.map((t) => (
                                <tr key={t.id}>
                                    <td className="p-2 border">{t.id}</td>
                                    <td className="p-2 border">{t.worker.name}</td>
                                    <td className="p-2 border">{(t.worker.employee_id !== "undefined" && t.worker.employee_id !== "") ? (t.worker.employee_id) : ("-")}</td>
                                    <td className="p-2 border">{t.worker.contractor_name}</td>
                                    <td className="p-2 border">{t.worker.phone_no}</td>
                                    <td className="p-2 border">{formatDateDMY(t.date_of_test)}</td>
                                    <td className="p-2 border">{t.tested_by}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </>
            )}



        </div>
    );
}

export default Malaria;