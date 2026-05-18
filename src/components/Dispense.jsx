import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { formatDateDMY } from "../utils/date";
import { FaMagnifyingGlass, FaPills, FaPlus, FaXmark } from "react-icons/fa6";
import FillPrescriptionModal from "./FillPrescriptionModal.jsx";

function Dispense() {
    const [opdData, setOpdData] = useState([]);
    const [selectedOpd, setSelectedOpd] = useState({});
    const [fillPrescriptionModalOpen, setFillPrescriptionModalOpen] = useState(false);
    // console.log(opdData);
    const [nameFilter, setNameFilter] = useState("");
    const [complaintFilter, setComplaintFilter] = useState("");
    const [tab, setTab] = useState("dispense");
    const today = new Date().toISOString().split("T")[0];

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


    const fetchOPDs = async () => {
        const res = await api.get("/api/dispense/opds");
        setOpdData(res.data.data);
    }

    useEffect(() => {
        fetchOPDs();
    }, []);

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


    return (
        <div className="w-full my-3">
            <div className="w-full bg-gray-800 p-2 rounded text-sm flex justify-center items-center gap-2">
                <div onClick={() => setTab("dispense")} className={`cursor-pointer flex w-1/2 rounded p-1 justify-center font-semibold ${tab === "dispense" ? "bg-blue-600" : "bg-gray-700"}`}>
                    <p>Dispense Medicine</p>
                </div>
                <div onClick={() => setTab("fill-prescription")} className={`cursor-pointer flex w-1/2 rounded p-1 justify-center font-semibold ${tab === "fill-prescription" ? "bg-blue-600" : "bg-gray-700"}`}>
                    <p>Fill Prescription</p>
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
                            <div className="bg-gray-900 rounded mt-2 max-h-52 overflow-y-auto">
                                {workers.map(worker => (
                                    <div
                                        key={worker.id}
                                        onClick={() => {
                                            setSelectedWorker(worker);
                                            setWorkers([]);
                                            setWorkerSearch(worker.name);
                                        }}
                                        className="p-2 border-b border-gray-700 cursor-pointer hover:bg-gray-700 text-xs"
                                    >
                                        <p className="font-semibold">
                                            {worker.name}
                                        </p>

                                        <p>
                                            Fathers Name: {worker.fathers_name}
                                        </p>

                                        <p>
                                            EMP ID: {worker.employee_id}
                                        </p>

                                        <p>
                                            {worker.designation}
                                        </p>
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

                                        <div className="text-xs">

                                            <p className="font-semibold">
                                                {stock.item_name}
                                            </p>

                                            <p>
                                                {stock.brand}
                                            </p>

                                            <p>
                                                Available: {stock.units}
                                            </p>

                                            <p>
                                                Exp: {formatDateDMY(stock.expiry_date)}
                                            </p>

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
            {fillPrescriptionModalOpen && (
                <FillPrescriptionModal record={selectedOpd} onClose={() => {
                    setSelectedOpd({});
                    setFillPrescriptionModalOpen(false);
                }} />
            )}
        </div>
    );
}

export default Dispense;