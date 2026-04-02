import { FaMagnifyingGlass, FaUserPlus } from "react-icons/fa6";
import { useState, useEffect } from "react";
import api from "../api/axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { formatDateDMY } from "../utils/date";

function FCACC({tab}) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [newWorkerFormDisplay, setNewWorkerFormDisplay] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [fcaccResults, setFcaccResults] = useState([]);
    const [searchText, setSearchText] = useState("");
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [filteredResults, setFilteredResults] = useState([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
const [editData, setEditData] = useState(null);
const [editId, setEditId] = useState(null);
    const [workerForm, setWorkerForm] = useState({
        name: "",
        employee_id: "",
        fathers_name: "",
        aadhar_no: "",
        dob: "",
        gender: "Male",
        phone_no: "",
        designation: "",
        contractor_name: "",
        date_of_joining: ""
    });

    const [fcaccForm, setFcaccForm] = useState({
        date_of_issuance_of_certificate_for_competency_clearance: "",
        competency_assessment_by: "",
        general_examination: "",
        pulse: "",
        systolic: "",
        diastolic: "",
        spo2: "",
        height: "",
        weight: "",
        vertigo_test_passed: true
    });
    console.log(fcaccForm);
    console.log(fcaccResults);

    useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await api.get("/api/fcacc/fitness-clearance");
            setFcaccResults(res.data.records);
        } catch (err) {
            console.error(err);
        }
    };

    if (tab !== "fcacc") {
        fetchData();
    }
}, [tab]);

useEffect(() => {
    let data = [...fcaccResults];

    // Filter by search
    if (searchText) {
        data = data.filter(r =>
            r.worker_details.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }

    // Filter by date
    if (fromDate) {
        data = data.filter(r =>
            new Date(r.date_of_medical_examination) >= new Date(fromDate)
        );
    }

    if (toDate) {
        data = data.filter(r =>
            new Date(r.date_of_medical_examination) <= new Date(toDate)
        );
    }

    setFilteredResults(data);
}, [searchText, fromDate, toDate, fcaccResults]);

    useEffect(() => {

        if (selectedWorker) return; // stop searching after selection

        const delay = setTimeout(async () => {

            if (!query) {
                setResults([]);
                setShowDropdown(false);
                return;
            }

            try {
                const res = await api.get(`/api/workers/search?q=${query}`);
                setResults(res.data);
                setShowDropdown(true);
            } catch (err) {
                console.error(err);
            }

        }, 300);

        return () => clearTimeout(delay);

    }, [query, selectedWorker]);

    const handleEditFCACC = (id) => {
    const record = fcaccResults.find(r => r._id === id);

    setEditId(id);
    setEditData({
        competency_assessment_by: record.competency_assessment_by,
        general_examination: record.examination_findings?.general_examination,
        pulse: record.examination_findings?.pulse,
        systolic: record.examination_findings?.blood_pressure?.systolic,
        diastolic: record.examination_findings?.blood_pressure?.diastolic,
        spo2: record.examination_findings?.spo2,
        height: record.examination_findings?.height,
        weight: record.examination_findings?.weight,
        vertigo_test_passed: record.examination_findings?.vertigo_test_passed
    });

    setEditModalOpen(true);
};

const updateFCACC = async () => {
    if (!editData.competency_assessment_by) {
        alert("Assessment By is required");
        return;
    }

    if (!editData.pulse || !editData.systolic || !editData.diastolic) {
        alert("Pulse and BP are required");
        return;
    }

    try {
        await api.put(`/api/fcacc/fitness-clearance/${editId}`, editData);

        const res = await api.get("/api/fcacc/fitness-clearance");
        setFcaccResults(res.data.records);

        setEditModalOpen(false);
        alert("Updated successfully");

    } catch (err) {
        console.error(err);
    }
};

    const submitFCACC = async () => {
        if (!selectedWorker) {
            alert("Please select or add a worker first");
            return;
        }
        try {

            let payload = {
                ...fcaccForm
            };

            if (selectedWorker.id) {
                payload.worker_id = selectedWorker.id;
            } else {
                payload.worker_data = selectedWorker;
            }

            await api.post("/api/fcacc/fitness-clearance", payload);

            alert("FCACC Saved");

        } catch (err) {
            console.error(err);
        }

    };
    const downloadExcel = () => {
    const data = filteredResults.map(r => ({
        ID: r.id,
        Worker: r.worker_details.name,
        Contractor: r.worker_details.contractor_name,
        Designation: r.worker_details.designation,
        Exam_Date: formatDateDMY(r.date_of_medical_examination),
        Assessment_By: r.competency_assessment_by,
        General_Examination: r.examination_findings.general_examination,
        Pulse: r.examination_findings.pulse,
        BP: `${r.examination_findings.blood_pressure.systolic}/${r.examination_findings.blood_pressure.diastolic}`,
        SpO2: r.examination_findings.spo2,
        Height: r.examination_findings.height,
        Weight: r.examination_findings.weight,
        Vertigo: r.examination_findings.vertigo_test_passed ? "Passed" : "Failed"
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FCACC");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(file, "FCACC_List.xlsx");
};

    if(tab === "fcacc"){
        return (
            <div className="bg-gray-800 p-6 w-full rounded-xl mt-4 overflow-auto no-scrollbar">
                <h2 className="text-lg font-bold mb-3">FITNESS CLEARANCE AGAINST COMPETENCY CERTIFICATE - FCACC</h2>

                <div className="flex items-center gap-2">
                    <div className="w-4/5 flex items-center gap-2">
                        <FaMagnifyingGlass />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={query}
                            disabled={newWorkerFormDisplay}
                            onChange={(e) => setQuery(e.target.value)}
                            className={`p-2 rounded text-white text-sm w-full ${newWorkerFormDisplay
                                    ? "bg-gray-600 cursor-not-allowed"
                                    : "bg-gray-700"
                                }`}
                        />
                        {showDropdown && results.length > 0 && (
                            <div className="absolute top-52 left-16 w-3/4 bg-gray-900 border border-gray-700 rounded max-h-60 overflow-auto z-50">

                                {results.map(worker => (

                                    <div
                                        key={worker.id}
                                        onClick={() => {
                                            setSelectedWorker(worker);
                                            setShowDropdown(false);
                                            setResults([]);
                                            setQuery(worker.name);

                                            setNewWorkerFormDisplay(false); // close new worker mode
                                        }}
                                        className="p-2 hover:bg-gray-700 cursor-pointer text-sm"
                                    >

                                        <div className="font-semibold">
                                            {worker.name}
                                        </div>

                                        <div className="text-xs text-gray-400">
                                            {worker.designation} • {worker.contractor_name}
                                        </div>

                                    </div>

                                ))}

                            </div>
                        )}
                    </div>
                    <button
                        className="w-1/5 bg-blue-600 p-2 rounded flex items-center text-sm gap-2"
                        onClick={() => {

                            const nextState = !newWorkerFormDisplay;

                            setNewWorkerFormDisplay(nextState);

                            if (nextState) {
                                setSelectedWorker(null);
                                setQuery("");
                                setResults([]);
                                setShowDropdown(false);
                            }

                        }}>
                        <FaUserPlus />
                        Add New Worker
                    </button>
                </div>
                {newWorkerFormDisplay && (

                    <div className="bg-gray-900 p-4 rounded mt-3">

                        <h3 className="font-semibold mb-2">Add New Worker</h3>

                        <div className="grid grid-cols-3 gap-3">

                            <input
                                placeholder="Name"
                                value={workerForm.name}
                                className="w-full p-2 text-sm rounded bg-gray-800"
                                onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                            />

                            <input
                                placeholder="Employee ID"
                                value={workerForm.employee_id}
                                className="w-full p-2 text-sm rounded bg-gray-800"
                                onChange={(e) => setWorkerForm({ ...workerForm, employee_id: e.target.value })}
                            />

                            <input
                                placeholder="Father Name"
                                value={workerForm.fathers_name}
                                className="w-full p-2 text-sm rounded bg-gray-800"
                                onChange={(e) => setWorkerForm({ ...workerForm, fathers_name: e.target.value })}
                            />

                            <input
                                placeholder="Phone"
                                value={workerForm.phone_no}
                                className="w-full p-2 text-sm rounded bg-gray-800"
                                onChange={(e) => setWorkerForm({ ...workerForm, phone_no: e.target.value })}
                            />

                            <input 
                                placeholder="Designation"
                                value={workerForm.designation}
                                className="w-full p-2 text-sm rounded bg-gray-800"
                                onChange={(e) => setWorkerForm({ ...workerForm, designation: e.target.value })}
                            />

                            <input 
                                placeholder="Contractor Name"
                                value={workerForm.contractor_name}
                                className="w-full p-2 text-sm rounded bg-gray-800"
                                onChange={(e) => setWorkerForm({ ...workerForm, contractor_name: e.target.value })}
                            />



                            <input
                                placeholder="Aadhaar No"
                                value={workerForm.aadhar_no}
                                className="w-full p-2 text-sm rounded bg-gray-800"
                                onChange={(e) => setWorkerForm({ ...workerForm, aadhar_no: e.target.value })}
                            />

                            <select 
                                placeholder="Gender"
                                value={workerForm.gender}
                                className="w-full p-2 text-sm rounded bg-gray-800"
                                onChange={(e) => setWorkerForm({...workerForm, gender: e.target.value })}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>

                            <div></div>

                            <div>
                                <input 
                            type="date"
                            value={workerForm.dob}
                            className="w-full p-2 text-sm rounded bg-gray-800"
                            onChange={(e) => setWorkerForm({ ...workerForm, dob: e.target.value })}
                            />
                            <span className="text-xs text-gray-300">Date of Birth</span>
                            </div>

                            <div className="w-full">
                                <input 
                            type="date"
                            value={workerForm.date_of_joining}
                            className="w-full p-2 text-sm rounded bg-gray-800"
                            onChange={(e) => setWorkerForm({ ...workerForm, date_of_joining: e.target.value })}
                            />
                            <span className="text-xs text-gray-300">Date of Joining</span>
                            </div>

                        </div>

                        <button
                            className="mt-3 bg-green-600 px-3 py-1 rounded"
                            onClick={() => {

                                setSelectedWorker(workerForm);
                                setNewWorkerFormDisplay(false);

                            }}
                        >
                            Use Worker
                        </button>

                    </div>

                )}
                {selectedWorker && (

                    <div className="bg-gray-900 p-3 rounded mt-3">

                        <h3 className="font-semibold">Selected Worker</h3>

                        <div className="text-sm mt-1">

                            <div>{selectedWorker.name}</div>
                            <div className="text-gray-400">
                                {selectedWorker.designation} • {selectedWorker.contractor_name}
                            </div>

                        </div>

                    </div>

                )}

                {/* <div className="bg-gray-900 p-4 rounded mt-4"> */}

                <div className="bg-gray-900 p-4 rounded mt-4">

                    {/* <h3 className="font-semibold mb-3">FCACC Examination</h3> */}

                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <span className="text-xs text-gray-300">Competency Assessment By</span>
                            <input
                            placeholder="Competency Assessment By"
                            value={fcaccForm.competency_assessment_by}
                            className="p-2 text-sm rounded w-full bg-gray-800"
                            onChange={(e) => setFcaccForm({ ...fcaccForm, competency_assessment_by: e.target.value })}
                        />
                        </div>

                        <div>
                        <span className="text-xs text-gray-300">Date of Issuance</span>
                            <input type="date"
                            value={fcaccForm.date_of_issuance_of_certificate_for_competency_clearance}
                            className="p-2 text-sm w-full rounded bg-gray-800"
                            onChange={(e) => setFcaccForm({ ...fcaccForm, date_of_issuance_of_certificate_for_competency_clearance: e.target.value })}
                        />
                        </div>

                        <div className="col-span-3"></div>

                        <input
                            placeholder="General Examination"
                            value={fcaccForm.general_examination}
                            className="p-2 text-sm rounded bg-gray-800"
                            onChange={(e) => setFcaccForm({ ...fcaccForm, general_examination: e.target.value })}
                        />

                        <input
                            placeholder="Pulse"
                            value={fcaccForm.pulse}
                            className="p-2 text-sm rounded bg-gray-800"
                            onChange={(e) => setFcaccForm({ ...fcaccForm, pulse: e.target.value })}
                        />

                        <input
                            placeholder="Systolic"
                            value={fcaccForm.systolic}
                            className="p-2 text-sm rounded bg-gray-800"
                            onChange={(e) => setFcaccForm({ ...fcaccForm, systolic: e.target.value })}
                        />

                        <input
                            placeholder="Diastolic"
                            value={fcaccForm.diastolic}
                            className="p-2 text-sm rounded bg-gray-800"
                            onChange={(e) => setFcaccForm({ ...fcaccForm, diastolic: e.target.value })}
                        />

                        <input
                            placeholder="SpO2"
                            value={fcaccForm.spo2}
                            className="p-2 text-sm rounded bg-gray-800"
                            onChange={(e) => setFcaccForm({ ...fcaccForm, spo2: e.target.value })}
                        />

                        <input
                            placeholder="Height"
                            value={fcaccForm.height}
                            className="p-2 text-sm rounded bg-gray-800"
                            onChange={(e) => setFcaccForm({ ...fcaccForm, height: e.target.value })}
                        />

                        <input
                            placeholder="Weight"
                            value={fcaccForm.weight}
                            className="p-2 text-sm rounded bg-gray-800"
                            onChange={(e) => setFcaccForm({ ...fcaccForm, weight: e.target.value })}
                        />

                        <div className="col-span-2 flex items-center gap-4">
                            <p className="text-sm text-gray-400 font-semibold">Vertigo Test: </p>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="vertigo_test_passed"
                                    checked = {fcaccForm.vertigo_test_passed === true}
                                    onChange={() => setFcaccForm({ ...fcaccForm, vertigo_test_passed: "Passed" })}
                                />
                                <p>Passed</p>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="vertigo_test_passed"
                                    checked = {fcaccForm.vertigo_test_passed === false}
                                    onChange={() => setFcaccForm({ ...fcaccForm, vertigo_test_passed: "Failed" })}
                                />
                                <p>Failed</p>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="vertigo_test_passed"
                                    checked = {fcaccForm.vertigo_test_passed === false}
                                    onChange={() => setFcaccForm({ ...fcaccForm, vertigo_test_passed: "Not Done" })}
                                />
                                <p>Not Done</p>
                            </label>
                        </div>

                    </div>

                    <button
                        disabled={!selectedWorker}
                        className={`mt-4 px-4 py-2 rounded ${selectedWorker
                            ? "bg-blue-600"
                            : "bg-gray-600 cursor-not-allowed"
                            }`}
                        onClick={submitFCACC}
                    >
                        Save FCACC
                    </button>

                </div>

                {/* </div> */}
            </div>
        );
    }else{
        return (
            <div className="bg-gray-800 p-6 w-full rounded-xl mt-4 overflow-auto no-scrollbar">
                <h2 className="text-lg font-bold mb-3">List of FCACCs</h2>

                <div className="flex gap-3 w-full mb-4">

    <input
        placeholder="Search Worker Name..."
        className="p-2 rounded bg-gray-900 text-sm"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
    />

    <div>
        <span className="text-xs text-gray-400">From</span>
        <input
            type="date"
            className="p-2 rounded bg-gray-900 text-sm block"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
        />
    </div>

    <div>
        <span className="text-xs text-gray-400">To</span>
        <input
            type="date"
            className="p-2 rounded bg-gray-900 text-sm block"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
        />
    </div>

    <button
        className="bg-green-600 px-3 py-2 rounded text-sm"
        onClick={downloadExcel}
    >
        Download Excel
    </button>

</div>
                <table className="w-full text-sm border">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Worker Name</th>
                            <th className="p-2 border">FCACC Examination Date</th>
                            <th className="p-2 border">Assessment Done By</th>
                            <th className="p-2 border">General Examination</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredResults.map(record => (
                            <tr key={record._id} className="bg-gray-800">
                                <td className="p-2 border">{record.id}</td>
                                <td className="p-2 border">{record.worker_details.name}</td>
                                <td className="p-2 border">{formatDateDMY(record.date_of_medical_examination)}</td>
                                <td className="p-2 border">{record.competency_assessment_by}</td>
                                <td className="p-2 border">{record.examination_findings.general_examination}</td>
                                <td className="p-2 border">
                                    <button
                                        className="bg-blue-600 text-white px-2 py-1 rounded"
                                        onClick={() => handleEditFCACC(record._id)}
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {editModalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-gray-900 p-6 rounded w-1/2">
            <h2 className="text-lg font-bold mb-4">Edit FCACC Record</h2>

            <div className="grid grid-cols-2 gap-4">

                <div>
                    <label className="text-xs text-gray-400">Competency Assessment By</label>
                    <input
                        value={editData.competency_assessment_by}
                        className="p-2 rounded bg-gray-800 w-full"
                        onChange={(e) => setEditData({...editData, competency_assessment_by: e.target.value})}
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-400">General Examination</label>
                    <input
                        value={editData.general_examination}
                        className="p-2 rounded bg-gray-800 w-full"
                        onChange={(e) => setEditData({...editData, general_examination: e.target.value})}
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-400">Pulse</label>
                    <input
                        value={editData.pulse}
                        className="p-2 rounded bg-gray-800 w-full"
                        onChange={(e) => setEditData({...editData, pulse: e.target.value})}
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-400">SpO₂</label>
                    <input
                        value={editData.spo2}
                        className="p-2 rounded bg-gray-800 w-full"
                        onChange={(e) => setEditData({...editData, spo2: e.target.value})}
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-400">Systolic BP</label>
                    <input
                        value={editData.systolic}
                        className="p-2 rounded bg-gray-800 w-full"
                        onChange={(e) => setEditData({...editData, systolic: e.target.value})}
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-400">Diastolic BP</label>
                    <input
                        value={editData.diastolic}
                        className="p-2 rounded bg-gray-800 w-full"
                        onChange={(e) => setEditData({...editData, diastolic: e.target.value})}
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-400">Height (cm)</label>
                    <input
                        value={editData.height}
                        className="p-2 rounded bg-gray-800 w-full"
                        onChange={(e) => setEditData({...editData, height: e.target.value})}
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-400">Weight (kg)</label>
                    <input
                        value={editData.weight}
                        className="p-2 rounded bg-gray-800 w-full"
                        onChange={(e) => setEditData({...editData, weight: e.target.value})}
                    />
                </div>

                <div className="col-span-2">
                    <label className="text-xs text-gray-400">Vertigo Test</label>
                    <div className="flex gap-4 mt-1">
                        <label>
                            <input
                                type="radio"
                                checked={editData.vertigo_test_passed === "Passed" ? true : false}
                                onChange={() => setEditData({...editData, vertigo_test_passed: "Passed"})}
                            /> Passed
                        </label>
                        <label>
                            <input
                                type="radio"
                                checked={editData.vertigo_test_passed === "Failed" ? true : false}
                                onChange={() => setEditData({...editData, vertigo_test_passed: "Failed"})}
                            /> Failed
                        </label>
                        <label>
                            <input
                                type="radio"
                                checked={editData.vertigo_test_passed === "Not Done" ? true : false}
                                onChange={() => setEditData({...editData, vertigo_test_passed: "Not Done"})}
                            /> Not Done
                        </label>
                    </div>
                </div>

            </div>

            <div className="flex justify-end gap-2 mt-6">
                <button
                    className="bg-gray-600 px-4 py-2 rounded"
                    onClick={() => setEditModalOpen(false)}
                >
                    Cancel
                </button>

                <button
                    className="bg-blue-600 px-4 py-2 rounded"
                    onClick={updateFCACC}
                >
                    Save Changes
                </button>
            </div>
        </div>
    </div>
)}
            </div>
        );
    }
}

export default FCACC;