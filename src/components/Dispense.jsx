import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { formatDateDMY } from "../utils/date";
import { FaMagnifyingGlass, FaPills, FaPlus, FaXmark } from "react-icons/fa6";
import FillPrescriptionModal from "./FillPrescriptionModal.jsx";

function Dispense() {
    const [opdData, setOpdData] = useState([]);
    const [selectedOpd, setSelectedOpd] = useState({});
    const [history, setHistory] = useState([]);
    const [fillPrescriptionModalOpen, setFillPrescriptionModalOpen] = useState(false);
    // console.log(opdData);
    const [nameFilter, setNameFilter] = useState("");
    const [complaintFilter, setComplaintFilter] = useState("");
    const [tab, setTab] = useState("dispense");
    const today = new Date().toISOString().split("T")[0];

    const [historySearch, setHistorySearch] = useState("");
    const [historyFromDate, setHistoryFromDate] = useState(today);
    const [historyToDate, setHistoryToDate] = useState(today);

    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);

    const [workerSearch, setWorkerSearch] = useState("");
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [medicineSearch, setMedicineSearch] = useState("");
    const [stockResults, setStockResults] = useState([]);
    const [dispenseItems, setDispenseItems] = useState([]);
    const workerTimeout = useRef(null);
    const medicineTimeout = useRef(null);
    const [submitting, setSubmitting] = useState(false);

    const [balanceDate, setBalanceDate] = useState(today);
    const [balanceData, setBalanceData] = useState([]);

    console.log(balanceData);


    const fetchOPDs = async () => {
        const res = await api.get("/api/dispense/opds");
        setOpdData(res.data.data);
    }

    const fetchHistory = async () => {
        const res = await api.get("/api/dispense/history");
        setHistory(res.data.data);
    };

    useEffect(() => {
        fetchOPDs();
    }, []);

    useEffect(() => {
        if (tab === "history") {
            fetchHistory();
        }
        if (tab === "balance-sheet") {
            fetchBalanceSheet(balanceDate);
        }
    }, [tab]);

    const filteredOpds = opdData.filter(opd => {
        const workerNameMatch =
            opd.worker.name.toLowerCase().includes(nameFilter.toLowerCase());

        const complaintMatch =
            opd.presenting_complaint
                ?.toLowerCase()
                .includes(complaintFilter.toLowerCase());

        const opdDate = new Date(opd.created_at)
            .toLocaleDateString("en-CA"); // YYYY-MM-DD in local time


        const dateMatch =
            (!fromDate || opdDate >= fromDate) &&
            (!toDate || opdDate <= toDate);

        return workerNameMatch && complaintMatch && dateMatch;
    });

    const filteredHistory = history.filter((dispense) => {

        const workerName =
            dispense.worker?.[0]?.name?.toLowerCase() || "";

        const dispensedBy = dispense.dispensed_by?.userId?.toLowerCase() || "";

        const itemNames =
            dispense.stocks
                ?.map(item => item.item_name)
                .join(" ")
                .toLowerCase() || "";

        const search =
            historySearch.toLowerCase();

        const searchMatch =
            workerName.includes(search) ||
            itemNames.includes(search) ||
            dispensedBy.includes(search);

        const dispenseDate = new Date(
            dispense.dispensed_on
        ).toLocaleDateString("en-CA");

        const dateMatch =
            (!historyFromDate || dispenseDate >= historyFromDate) &&
            (!historyToDate || dispenseDate <= historyToDate);

        return searchMatch && dateMatch;
    });

    const fetchBalanceSheet = async (date) => {

        const res = await api.get(
            `/api/dispense/balance-sheet?date=${date}`
        );

        setBalanceData(res.data.data);
    };

    return (
        <div className="w-full my-3">
            <div className="w-full bg-gray-800 p-2 rounded text-sm flex justify-center items-center gap-2">
                <div onClick={() => setTab("dispense")} className={`cursor-pointer flex w-1/3 rounded p-1 justify-center font-semibold ${tab === "dispense" ? "bg-blue-600" : "bg-gray-700"}`}>
                    <p>Dispense Medicine</p>
                </div>
                <div onClick={() => setTab("fill-prescription")} className={`cursor-pointer flex w-1/3 rounded p-1 justify-center font-semibold ${tab === "fill-prescription" ? "bg-blue-600" : "bg-gray-700"}`}>
                    <p>Fill Prescription</p>
                </div>
                <div onClick={() => setTab("history")} className={`cursor-pointer flex w-1/3 rounded p-1 justify-center font-semibold ${tab === "history" ? "bg-blue-600" : "bg-gray-700"}`}>
                    <p>History</p>
                </div>
                <div onClick={() => setTab("balance-sheet")} className={`cursor-pointer flex w-1/3 rounded p-1 justify-center font-semibold ${tab === "balance-sheet" ? "bg-blue-600" : "bg-gray-700"}`}>
                    <p>Balance Sheet</p>
                </div>
            </div>
            {tab === "dispense" && (
                <div>
                    <div className="bg-gray-800 my-3 rounded-lg p-4 w-full">

                        {/* WORKER SEARCH */}
                        <div className="mb-3">
                            <p className="text-xs font-semibold mb-2">
                                SEARCH WORKER
                            </p>

                            <div className="flex gap-3">
                                <div className="flex items-center gap-3 w-full bg-gray-700 rounded p-2">
                                    <FaMagnifyingGlass />

                                    <input
                                        type="text"
                                        value={workerSearch}
                                        onChange={(e) => {

                                            const value = e.target.value;

                                            setWorkerSearch(value);

                                            clearTimeout(workerTimeout.current);

                                            if (!value.trim()) {
                                                setWorkers([]);
                                                setSelectedWorker(null);
                                                return;
                                            }

                                            workerTimeout.current = setTimeout(async () => {

                                                try {

                                                    const res = await api.get(
                                                        `/api/dispense/workers/search?q=${value}`
                                                    );

                                                    setWorkers(res.data.data);

                                                } catch (err) {
                                                    console.log(err);
                                                }

                                            }, 400);
                                        }}
                                        className="w-full bg-transparent outline-none text-xs"
                                        placeholder="Search Worker by Name, Employee ID..."
                                    />
                                </div>
                            </div>

                            {/* SEARCH RESULTS */}
                            {workers.length > 0 && (
                                <div className="bg-gray-700 rounded mt-2 max-h-52 overflow-y-auto">
                                    {workers.map(worker => (
                                        <div
                                            key={worker.id}
                                            onClick={() => {
                                                setSelectedWorker(worker);
                                                setWorkers([]);
                                                setWorkerSearch(worker.name);
                                            }}
                                            className="p-2 border-b mb-2 border-gray-900 cursor-pointer hover:bg-gray-700 text-xs"
                                        >
                                            <div className="font-bold font- mb-2">

                                                <p>
                                                    {worker.name}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">

                                                <div>
                                                    <p className="text-gray-400">
                                                        Fathers Name
                                                    </p>

                                                    <p>
                                                        {worker.fathers_name}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-gray-400">
                                                        Employee ID
                                                    </p>

                                                    <p>
                                                        {worker.employee_id}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-gray-400">
                                                        Designation
                                                    </p>

                                                    <p>
                                                        {worker.designation}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-gray-400">
                                                        Contractor
                                                    </p>

                                                    <p>
                                                        {worker.contractor_name}
                                                    </p>
                                                </div>

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* SELECTED WORKER */}
                        {selectedWorker ? (
                            <div className="bg-gray-900 rounded p-3 mb-5">
                                <p className="text-xs font-semibold mb-2">
                                    SELECTED WORKER
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">

                                    <div>
                                        <p className="text-gray-400">
                                            Name
                                        </p>

                                        <p>
                                            {selectedWorker.name}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-400">
                                            Fathers Name
                                        </p>

                                        <p>
                                            {selectedWorker.fathers_name}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-400">
                                            Employee ID
                                        </p>

                                        <p>
                                            {selectedWorker.employee_id}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-400">
                                            Designation
                                        </p>

                                        <p>
                                            {selectedWorker.designation}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-400">
                                            Contractor
                                        </p>

                                        <p>
                                            {selectedWorker.contractor_name}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        ) : (
                            <div className="text-xs bg-gray-900 rounded p-3 mb-2">
                                <p className="text-gray-500">Select a Worker</p>
                            </div>
                        )}

                        {/* MEDICINE SEARCH */}


                    </div>
                    <div className="bg-gray-800 my-3 rounded-lg p-4 w-full">
                        <div className="mb-5">

                            <p className="text-xs font-semibold mb-2">
                                SEARCH MEDICINES
                            </p>

                            <div className="flex items-center gap-2 ">

                                <FaPills />

                                <input
                                    type="text"
                                    value={medicineSearch}
                                    onChange={(e) => {

                                        const value = e.target.value;

                                        setMedicineSearch(value);

                                        clearTimeout(medicineTimeout.current);

                                        if (!value.trim()) {
                                            setStockResults([]);
                                            return;
                                        }

                                        medicineTimeout.current = setTimeout(async () => {

                                            try {

                                                const res = await api.get(
                                                    `/api/dispense/stock/search?q=${value}`
                                                );

                                                setStockResults(res.data.data);

                                            } catch (err) {
                                                console.log(err);
                                            }

                                        }, 400);

                                    }}
                                    className="w-1/5 bg-gray-700 rounded p-2 outline-none text-xs"
                                    placeholder="Search Medicine..."
                                />
                            </div>

                            {/* STOCK RESULTS */}
                            {stockResults.length > 0 && (
                                <div className="bg-gray-900 rounded mt-2 max-h-72 overflow-y-auto">

                                    {stockResults.map(stock => (

                                        <div
                                            key={stock.id}
                                            className="flex justify-between items-center border-b border-gray-700 p-2"
                                        >

                                            <div className="text-xs w-4/5">

                                                <p className="font-semibold mb-2">
                                                    {stock.item_name}
                                                </p>

                                                <div className="flex w-full justify-between">
                                                    <div>
                                                        <p className="text-gray-400">Brand</p>
                                                        <p>
                                                            {stock.brand}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-gray-400">Price</p>
                                                        <p>
                                                            ₹ {stock.per_unit_cost} per unit
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-gray-400">Available Units</p>
                                                        <p>
                                                            {stock.units}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-gray-400">Expiry Date</p>
                                                        <p>
                                                            {formatDateDMY(stock.expiry_date)}
                                                        </p>
                                                    </div>
                                                </div>

                                            </div>

                                            <button
                                                onClick={() => {

                                                    const exists = dispenseItems.find(
                                                        i => i.stock_id === stock.id
                                                    );

                                                    if (exists) return;

                                                    setDispenseItems(prev => [
                                                        ...prev,
                                                        {
                                                            stock_id: stock.id,
                                                            item_name: stock.item_name,
                                                            brand: stock.brand,
                                                            available_units: stock.units,
                                                            units: 1
                                                        }
                                                    ]);
                                                    setMedicineSearch("");
                                                    setStockResults([]);
                                                }}
                                                className="bg-green-600 rounded px-3 py-1 text-xs flex items-center gap-2"
                                            >
                                                <FaPlus />
                                                Add
                                            </button>

                                        </div>

                                    ))}
                                </div>
                            )}
                        </div>

                        {/* DISPENSE ITEMS */}
                        <div>

                            <p className="text-xs font-semibold mb-2">
                                DISPENSE ITEMS
                            </p>

                            {dispenseItems.length === 0 && (
                                <div className="bg-gray-900 rounded p-3 text-xs text-gray-400">
                                    No medicines selected
                                </div>
                            )}

                            {dispenseItems.length > 0 && (
                                <div className="overflow-x-auto">

                                    <table className="w-full border text-xs">

                                        <thead className="bg-gray-900">
                                            <tr>

                                                <th className="border p-2">
                                                    Medicine
                                                </th>

                                                <th className="border p-2">
                                                    Brand
                                                </th>

                                                <th className="border p-2">
                                                    Available
                                                </th>

                                                <th className="border p-2">
                                                    Units
                                                </th>

                                                <th className="border p-2">
                                                    Remove
                                                </th>

                                            </tr>
                                        </thead>

                                        <tbody>

                                            {dispenseItems.map(item => (

                                                <tr key={item.stock_id}>

                                                    <td className="border p-2">
                                                        {item.item_name}
                                                    </td>

                                                    <td className="border p-2">
                                                        {item.brand}
                                                    </td>

                                                    <td className="border p-2">
                                                        {item.available_units}
                                                    </td>

                                                    <td className="border p-2">

                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={item.available_units}
                                                            value={item.units}
                                                            onChange={(e) => {

                                                                const rawValue = e.target.value;

                                                                setDispenseItems(prev =>
                                                                    prev.map(i => {

                                                                        if (i.stock_id !== item.stock_id) {
                                                                            return i;
                                                                        }

                                                                        // Allow empty input while typing
                                                                        if (rawValue === "") {
                                                                            return {
                                                                                ...i,
                                                                                units: ""
                                                                            };
                                                                        }

                                                                        let value = Number(rawValue);

                                                                        if (isNaN(value)) {
                                                                            return i;
                                                                        }

                                                                        if (value < 1) {
                                                                            value = 1;
                                                                        }

                                                                        if (value > item.available_units) {
                                                                            value = item.available_units;
                                                                        }

                                                                        return {
                                                                            ...i,
                                                                            units: value
                                                                        };
                                                                    })
                                                                );

                                                            }}
                                                            className="bg-gray-700 rounded p-1 w-20"
                                                        />

                                                    </td>

                                                    <td className="border p-2">

                                                        <button
                                                            onClick={() => {

                                                                setDispenseItems(prev =>
                                                                    prev.filter(
                                                                        i => i.stock_id !== item.stock_id
                                                                    )
                                                                );

                                                            }}
                                                            className="bg-red-600 rounded p-2"
                                                        >
                                                            <FaXmark />
                                                        </button>

                                                    </td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>
                            )}
                        </div>

                        {/* SUBMIT */}
                        <div className="mt-5 flex justify-end">

                            <button
                                disabled={submitting}
                                onClick={async () => {
                                    if (!selectedWorker) {
                                        return alert("Select worker");
                                    }

                                    if (!dispenseItems.length) {
                                        return alert("Add medicines");
                                    }
                                    const invalidUnits = dispenseItems.some(
                                        item =>
                                            item.units === "" ||
                                            isNaN(Number(item.units)) ||
                                            Number(item.units) < 1
                                    );

                                    if (invalidUnits) {
                                        return alert("Invalid units entered");
                                    }
                                    setSubmitting(true);
                                    try {

                                        const payload = {

                                            opd_id: null,

                                            dispensed_to_worker_id:
                                                selectedWorker.id,

                                            dispensed_items:
                                                dispenseItems.map(item => ({
                                                    stock_ids: [item.stock_id],
                                                    units: item.units
                                                }))
                                        };

                                        const res = await api.post(
                                            "/api/dispense/fill-prescription",
                                            payload
                                        );

                                        alert(res.data.message);

                                        setDispenseItems([]);
                                        setSelectedWorker(null);
                                        setWorkerSearch("");
                                        setMedicineSearch("");
                                        setStockResults([]);

                                    } catch (err) {

                                        alert(
                                            err.response?.data?.message ||
                                            err.message
                                        );

                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                                className="bg-blue-600 px-4 py-2 rounded text-xs font-semibold"
                            >
                                {submitting ? "Dispensing" : "Dispense Medicine"}
                            </button>

                        </div>
                    </div>
                </div>
            )}
            {tab === "fill-prescription" && (
                <div className="bg-gray-800 my-3 rounded-lg p-4 w-full">
                    <p className="font-semibold mb-2 text-xs">SELECT AN OPD TO FILL PRESCRIPTION</p>
                    <div className="flex flex-wrap gap-3 mb-3">
                        <input
                            type="text"
                            placeholder="Search by Worker Name"
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                            className="bg-gray-700 rounded px-2 py-1 text-xs w-48"
                        />

                        <input
                            type="text"
                            placeholder="Search by Presenting Complaint"
                            value={complaintFilter}
                            onChange={(e) => setComplaintFilter(e.target.value)}
                            className="bg-gray-700 rounded px-2 py-1 text-xs w-64"
                        />

                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="bg-gray-700 rounded px-2 py-1 text-xs"
                        />

                        <span className="text-xs text-gray-400 self-center">to</span>

                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="bg-gray-700 rounded px-2 py-1 text-xs"
                        />


                        <button
                            className="bg-gray-600 px-3 py-1 rounded text-xs"
                            onClick={() => {
                                setNameFilter("");
                                setComplaintFilter("");
                                setFromDate(today);
                                setToDate(today);
                            }}

                        >
                            Reset
                        </button>
                    </div>

                    <div className="w-full">
                        <table className="border w-full text-sm">
                            <thead className="border bg-gray-900">
                                <tr className="border">
                                    <th className="border">OPD ID</th>
                                    <th className="border">Employee ID</th>
                                    <th className="border">Worker Name</th>
                                    <th className="border">Designation</th>
                                    {/* <th className="border">Contractor Name</th> */}
                                    <th className="border">Presenting Complaint</th>
                                    <th className="border">OPD Date</th>
                                    <th className="border">Fill Prescription</th>
                                </tr>
                            </thead>
                            <tbody className="border">
                                {filteredOpds.map(opd => (
                                    <tr key={opd.id} className="border">
                                        <td className="border">{opd.id}</td>
                                        <td className="border">{opd.worker.employee_id}</td>
                                        <td className="border">{opd.worker.name}</td>
                                        <td className="border">{opd.worker.designation}</td>
                                        {/* <td className="border">{opd.worker.contractor_name}</td> */}
                                        <td className="border">{opd.presenting_complaint}</td>
                                        <td className="border">{formatDateDMY(opd.created_at)}</td>
                                        <td className="border p-2">
                                            <button
                                                className="bg-green-600 rounded p-1 gap-2 text-xs flex items-center"
                                                onClick={() => { setSelectedOpd(opd); setFillPrescriptionModalOpen(true) }}
                                            >
                                                <FaPills />
                                                Fill Prescription
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* {opdData.map((opd) => (
                    <></>
                ))} */}
                </div>
            )}
            {tab === "history" && (
                <div className="bg-gray-800 my-3 rounded-lg p-4 w-full">
                    <p className="font-semibold mb-2 text-xs">DISPENSE HISTORY</p>
                    <div className="flex flex-wrap gap-3 mb-3">

                        <input
                            type="text"
                            placeholder="Search Worker / Medicine"
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                            className="bg-gray-900  w-4/5 rounded px-2 py-1 text-xs w-64"
                        />

                        <input
                            type="date"
                            value={historyFromDate}
                            onChange={(e) => setHistoryFromDate(e.target.value)}
                            className="bg-gray-900 rounded px-2 py-1 text-xs"
                        />

                        <span className="text-xs text-gray-400 self-center">
                            to
                        </span>

                        <input
                            type="date"
                            value={historyToDate}
                            onChange={(e) => setHistoryToDate(e.target.value)}
                            className="bg-gray-900 rounded px-2 py-1 text-xs"
                        />

                        <button
                            className="bg-red-600 px-3 py-1 rounded text-xs"
                            onClick={() => {
                                setHistoryFromDate("");
                                setHistoryToDate("");
                            }}
                        >
                            Clear Dates
                        </button>

                        <button
                            className="bg-gray-600 px-3 py-1 rounded text-xs"
                            onClick={() => {
                                setHistorySearch("");
                                setHistoryFromDate(today);
                                setHistoryToDate(today);
                            }}
                        >
                            Reset
                        </button>

                    </div>
                    <div className="w-full">
                        <table className="border w-full text-sm">
                            <thead className="border bg-gray-900">
                                <tr className="border">
                                    <th className="border">Dispensed To</th>
                                    <th className="border">Items Dispensed</th>
                                    <th className="border">Dispensed Quantity</th>
                                    <th className="border">Dispensed On</th>
                                    <th className="border">Dispensed By</th>
                                    <th className="border">Type</th>
                                </tr>
                            </thead>
                            <tbody className="border">
                                {filteredHistory.map((dispense) => (
                                    <tr key={dispense._id} className="border">
                                        <td className="border p-1">{dispense.worker[0]?.name === "TEST WORKER" ? "-" : dispense.worker[0]?.name}</td>
                                        <td className="border p-1">{dispense.stocks.map((item) => item.item_name).join(", ")}</td>
                                        <td className="border p-1">{dispense.stocks.map((item) => item.dispensed_units).join(", ")}</td>
                                        <td className="border p-1">{formatDateDMY(dispense.dispensed_on)}</td>
                                        <td className="border p-1">{dispense.dispensed_by.userId}</td>
                                        <td className="border p-1">{dispense.adjustment ? "Adjustment" : (dispense.opd_id ? "OPD Prescription Fill" : "Regular")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {tab === "balance-sheet" && (
                <div className="bg-gray-800 my-3 rounded-lg p-4">
                    <p className="text-xs font-semibold mb-3">BALANCE SHEET</p>
                    <div className="flex gap-3 mb-3">
                        <input
                            type="date"
                            value={balanceDate}
                            onChange={(e) =>
                                setBalanceDate(e.target.value)
                            }
                            className="bg-gray-700 rounded px-2 py-1 text-xs"
                        />

                        <button
                            onClick={() =>
                                fetchBalanceSheet(balanceDate)
                            }
                            className="bg-blue-600 px-3 py-1 rounded text-xs"
                        >
                            Generate
                        </button>
                    </div>
                    
                    
                    <div className="flex justify-end">
                        <h2 className="text-xs font-semibold py-1">DATE: {formatDateDMY(balanceDate)}</h2>
                    </div>
                    <table className="w-full border text-xs">
                        <thead className="bg-gray-900">
                            <tr>
                                <th className="border p-2">Item Name</th>
                                <th className="border p-2">Opening Balance</th>
                                <th className="border p-2">Procured Units</th>
                                <th className="border p-2">Dispensed Units</th>
                                <th className="border p-2">Closing Balance</th>
                            </tr>
                        </thead>

                        <tbody>
                            {balanceData.map(item => (
                                <tr key={item.medicine_id}>
                                    <td className="border p-1">{item.medicine_name}</td>
                                    <td className="border p-1 text-center">{item.opening_units}</td>
                                    <td className="border p-1 text-center">{item.procured_units}</td>
                                    <td className="border p-1 text-center">{item.dispensed_units}</td>
                                    <td className="border p-1 text-center">{item.closing_units}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            )}
            {fillPrescriptionModalOpen && (
                <FillPrescriptionModal
                    record={selectedOpd}
                    onSuccess={() => {
                        fetchOPDs(); // reload pending prescriptions
                    }}
                    onClose={() => {
                        setSelectedOpd({});
                        setFillPrescriptionModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}

export default Dispense;