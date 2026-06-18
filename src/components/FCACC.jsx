import { FaEye, FaFileExcel, FaFloppyDisk, FaMagnifyingGlass, FaPenToSquare, FaUser, FaUserPlus } from "react-icons/fa6";
import { useState, useEffect } from "react";
import api from "../api/axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { formatDateDMY } from "../utils/date";
import VisionCheckModal from "./VisionCheckModal";
import FCACCReportModal from "./FCACCReportModal";
import FCACCEditModal from "./FCACCEditModal";

function FCACC({ tab }) {
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
    const [openVision, setOpenVision] = useState(false);
    const [openReport, setOpenReport] = useState(false);
    const [visionForm, setVisionForm] = useState(null);
    const [viewRecord, setViewRecord] = useState(null);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedFCACC, setSelectedFCACC] = useState(null);
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
        date_of_issuance_of_certificate_for_competency_clearance: new Date().toISOString().split("T")[0],
        competency_assessment_by: "",
        general_examination: "",
        pulse: "",
        systolic: "",
        diastolic: "",
        spo2: "",
        height: "",
        weight: "",
        vertigo_test_passed: "Passed"
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

    const handleEditFCACC = (record) => {
        setSelectedFCACC(record);
        setOpenEditModal(true);
    };

    const handleUpdateFCACC = async (data) => {
        try {

            await api.put(
                `/api/fcacc/fitness-clearance/${selectedFCACC._id}`,
                data
            );

            const res = await api.get(
                "/api/fcacc/fitness-clearance"
            );

            setFcaccResults(res.data.records);

            setOpenEditModal(false);
            setSelectedFCACC(null);

            alert("FCACC Updated Successfully");

        } catch (err) {
            console.error(err);
            alert("Failed to update FCACC");
        }
    };

    const submitFCACC = async () => {
        if (!selectedWorker) {
            alert("Please select or add a worker first");
            return;
        }
        try {

            let payload = {
                ...fcaccForm,
                opthalmic_examination: visionForm
            };

            if (selectedWorker.id) {
                payload.worker_id = selectedWorker.id;
            } else {
                payload.worker_data = selectedWorker;
            }

            await api.post("/api/fcacc/fitness-clearance", payload);

            alert("FCACC Saved");
            // Refresh list
            setWorkerForm({
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
            setFcaccForm({
                date_of_issuance_of_certificate_for_competency_clearance: "",
                competency_assessment_by: "",
                general_examination: "",
                pulse: "",
                systolic: "",
                diastolic: "",
                spo2: "",
                height: "",
                weight: "",
                vertigo_test_passed: "Passed"
            });
            setSelectedWorker(null);
            setVisionForm(null);
            setOpenVision(false);
            setNewWorkerFormDisplay(false);
            setResults([]);
            setQuery("");
            setShowDropdown(false);
            setOpenReport(false);

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

    if (tab === "fcacc") {
        return (
            <div className="bg-gray-800 p-6 w-full rounded-xl mt-4 overflow-auto no-scrollbar">
                <h2 className="text-sm font-bold mb-3">FITNESS CLEARANCE AGAINST COMPETENCY CERTIFICATE - FCACC</h2>

                <div className="flex items-center gap-2">
                    <div className="w-4/5 flex items-center gap-2">
                        <FaMagnifyingGlass />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={query}
                            disabled={newWorkerFormDisplay}
                            onChange={(e) => setQuery(e.target.value)}
                            className={`p-2 rounded text-white text-xs w-full ${newWorkerFormDisplay
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
                                            ID: {worker.employee_id} | Father: {worker.fathers_name} | {worker.designation} | {worker.contractor_name} | Phn: {worker.phone_no} | Aadhar: {worker.aadhar_no}
                                        </div>

                                    </div>

                                ))}

                            </div>
                        )}
                    </div>
                    <button
                        className="w-1/5 bg-blue-600 p-2 rounded flex items-center text-xs gap-2"
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

                    <div className="bg-gray-900 p-4 rounded mt-4">

                        <h3 className="font-semibold mb-2">Add New Worker</h3>

                        <div className="grid grid-cols-3 gap-3">

                            <input
                                placeholder="Name"
                                value={workerForm.name}
                                className="w-full p-2 text-xs rounded bg-gray-800"
                                onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                            />

                            <input
                                placeholder="Employee ID"
                                value={workerForm.employee_id}
                                className="w-full p-2 text-xs rounded bg-gray-800"
                                onChange={(e) => setWorkerForm({ ...workerForm, employee_id: e.target.value })}
                            />

                            <input
                                placeholder="Father Name"
                                value={workerForm.fathers_name}
                                className="w-full p-2 text-xs rounded bg-gray-800"
                                onChange={(e) => setWorkerForm({ ...workerForm, fathers_name: e.target.value })}
                            />

                            <input
                                placeholder="Phone"
                                value={workerForm.phone_no}
                                className="w-full p-2 text-xs rounded bg-gray-800"
                                onChange={(e) => setWorkerForm({ ...workerForm, phone_no: e.target.value })}
                            />

                            <input
                                placeholder="Designation"
                                value={workerForm.designation}
                                className="w-full p-2 text-xs rounded bg-gray-800"
                                onChange={(e) => setWorkerForm({ ...workerForm, designation: e.target.value })}
                            />

                            <input
                                placeholder="Contractor Name"
                                value={workerForm.contractor_name}
                                className="w-full p-2 text-xs rounded bg-gray-800"
                                onChange={(e) => setWorkerForm({ ...workerForm, contractor_name: e.target.value })}
                            />



                            <input
                                placeholder="Aadhaar No"
                                value={workerForm.aadhar_no}
                                className="w-full p-2 text-xs rounded bg-gray-800"
                                onChange={(e) => setWorkerForm({ ...workerForm, aadhar_no: e.target.value })}
                            />

                            <select
                                placeholder="Gender"
                                value={workerForm.gender}
                                className="w-full p-2 text-xs rounded bg-gray-800"
                                onChange={(e) => setWorkerForm({ ...workerForm, gender: e.target.value })}
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
                                    className="w-full p-2 text-xs rounded bg-gray-800"
                                    onChange={(e) => setWorkerForm({ ...workerForm, dob: e.target.value })}
                                />
                                <span className="text-xs text-gray-300">Date of Birth</span>
                            </div>

                            <div className="w-full">
                                <input
                                    type="date"
                                    value={workerForm.date_of_joining}
                                    className="w-full p-2 text-xs rounded bg-gray-800"
                                    onChange={(e) => setWorkerForm({ ...workerForm, date_of_joining: e.target.value })}
                                />
                                <span className="text-xs text-gray-300">Date of Joining</span>
                            </div>

                        </div>

                        <button
                            className="mt-3 bg-green-600 px-3 text-xs py-1 rounded"
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

                    <div className="bg-gray-900 p-3 rounded mt-4">

                        {/* <h3 className="font-semibold text-sm flex items-center gap-2">
                            <FaUser /> Selected Worker</h3> */}

                        <div className="flex justify-between mb-2">
                            <div>
                                <p className="text-xs text-gray-400 flex items-center gap-2"><FaUser className="text-xs" /> Selected Worker</p>
                                <p className="font-bold text-sm">{selectedWorker.name}</p>
                            </div>
                            <button className="flex items-center gap-2 text-xs text-green-400">
                                <FaPenToSquare />
                                Edit
                            </button>
                        </div>
                        <div className="grid grid-cols-4 w-full gap-x-16 gap-y-2">
                            <div className="text-xs">
                                <p className="text-gray-400">Father Name:</p>
                                <p className="font-semibold text-xs">{selectedWorker.fathers_name}</p>
                            </div>
                            <div className="text-xs">
                                <p className="text-gray-400">Employee ID:</p>
                                <p className="font-semibold text-xs">{selectedWorker.employee_id}</p>
                            </div>
                            <div className="text-xs">
                                <p className="text-gray-400">Phone No.:</p>
                                <p className="font-semibold text-xs">{selectedWorker.phone_no}</p>
                            </div>
                            <div className="text-xs">
                                <p className="text-gray-400">Aadhar No.:</p>
                                <p className="font-semibold text-xs">{selectedWorker.aadhar_no}</p>
                            </div>
                            <div className="text-xs">
                                <p className="text-gray-400">Date of Joining:</p>
                                <p className="font-semibold text-xs">{formatDateDMY(selectedWorker.date_of_joining)}</p>
                            </div>
                            <div className="text-xs">
                                <p className="text-gray-400">Designation:</p>
                                <p className="font-semibold text-xs">{selectedWorker.designation}</p>
                            </div>
                        </div>
                    </div>

                )}

                <div className="grid grid-cols-4 gap-3 mt-3">
                    <div className="col-start-1">
                        <span className="text-xs text-gray-300">Competency Assessment By</span>
                        <input
                            placeholder="Competency Assessment By"
                            value={fcaccForm.competency_assessment_by}
                            className="p-2 text-xs rounded w-full bg-gray-900"
                            onChange={(e) => setFcaccForm({ ...fcaccForm, competency_assessment_by: e.target.value })}
                        />
                    </div>

                    <div className="col-start-4">
                        <span className=" text-xs text-gray-300">Date of Issuance</span>
                        <input type="date"
                            value={fcaccForm.date_of_issuance_of_certificate_for_competency_clearance}
                            className="p-2 text-xs rounded w-full bg-gray-900"
                            onChange={(e) => setFcaccForm({ ...fcaccForm, date_of_issuance_of_certificate_for_competency_clearance: e.target.value })}
                        />
                    </div>
                </div>


                <div className="col-span-4 text-sm text-gray-400 mt-4 mb-2">Parameters</div>

                {/* <div className="col-span-3"></div> */}
                <div className="grid grid-cols-4 gap-3 rounded-lg">
                    <input
                        placeholder="General Examination"
                        value={fcaccForm.general_examination}
                        className="p-2 text-xs rounded bg-gray-900"
                        onChange={(e) => setFcaccForm({ ...fcaccForm, general_examination: e.target.value })}
                    />

                    <input
                        placeholder="Pulse"
                        value={fcaccForm.pulse}
                        className="p-2 text-xs rounded bg-gray-900"
                        onChange={(e) => setFcaccForm({ ...fcaccForm, pulse: e.target.value })}
                    />

                    <input
                        placeholder="Systolic"
                        value={fcaccForm.systolic}
                        className="p-2 text-xs rounded bg-gray-900"
                        onChange={(e) => setFcaccForm({ ...fcaccForm, systolic: e.target.value })}
                    />

                    <input
                        placeholder="Diastolic"
                        value={fcaccForm.diastolic}
                        className="p-2 text-xs rounded bg-gray-900"
                        onChange={(e) => setFcaccForm({ ...fcaccForm, diastolic: e.target.value })}
                    />

                    <input
                        placeholder="SpO2"
                        value={fcaccForm.spo2}
                        className="p-2 text-xs rounded bg-gray-900"
                        onChange={(e) => setFcaccForm({ ...fcaccForm, spo2: e.target.value })}
                    />

                    <input
                        placeholder="Height"
                        value={fcaccForm.height}
                        className="p-2 text-xs rounded bg-gray-900"
                        onChange={(e) => setFcaccForm({ ...fcaccForm, height: e.target.value })}
                    />

                    <input
                        placeholder="Weight"
                        value={fcaccForm.weight}
                        className="p-2 text-xs rounded bg-gray-900"
                        onChange={(e) => setFcaccForm({ ...fcaccForm, weight: e.target.value })}
                    />

                    <button
                        className="border-2 border-blue-900 bg-transparent text-blue-500 p-2 rounded text-xs"
                        onClick={() => {
                            if (!selectedWorker) {
                                alert("Please select a worker first");
                                return;
                            }

                            setOpenVision(true);
                        }}
                    >
                        Vision Examination
                    </button>
                </div>


                <p className="text-xs text-gray-400 mt-3">Vertigo Test: </p>
                <div className="grid grid-cols-4 gap-3 rounded-lg mt-2">
                    <div className="col-span-4 grid grid-cols-9 flex items-center">
                        <label className="flex items-center text-xs gap-2">
                            <input
                                type="radio"
                                name="vertigo_test_passed"
                                checked={fcaccForm.vertigo_test_passed === "Passed"}
                                onChange={() => setFcaccForm({ ...fcaccForm, vertigo_test_passed: "Passed" })}
                            />
                            <p>Passed</p>
                        </label>
                        <label className="flex items-center text-xs gap-2">
                            <input
                                type="radio"
                                name="vertigo_test_passed"
                                checked={fcaccForm.vertigo_test_passed === "Failed"}
                                onChange={() => setFcaccForm({ ...fcaccForm, vertigo_test_passed: "Failed" })}
                            />
                            <p>Failed</p>
                        </label>
                        <label className="flex items-center text-xs gap-2">
                            <input
                                type="radio"
                                name="vertigo_test_passed"
                                checked={fcaccForm.vertigo_test_passed === "Not Done"}
                                onChange={() => setFcaccForm({ ...fcaccForm, vertigo_test_passed: "Not Done" })}
                            />
                            <p>Not Done</p>
                        </label>
                    </div>
                </div>

                <button
                    disabled={!selectedWorker}
                    className={`mt-4 px-4 text-xs flex items-center gap-2 py-2 rounded ${selectedWorker
                        ? "bg-blue-600"
                        : "bg-gray-600 cursor-not-allowed"
                        }`}
                    onClick={() => setOpenReport(true)}
                >
                    <FaFloppyDisk className="text-sm" />
                    Save FCACC
                </button>

                {/* </div> */}
                {openVision && (
                    <VisionCheckModal
                        vision={visionForm}
                        worker={selectedWorker}
                        instance={"fcacc"}
                        onClose={() => {
                            setOpenVision(false);
                        }}
                        onSave={(data) => {
                            setVisionForm(data.opthalmic_examination);
                        }}
                    />
                )}
                {openReport && (
                    <FCACCReportModal
                        data={{
                            fcaccForm,
                            opthalmic_examination: visionForm,
                            name: selectedWorker?.name || workerForm.name,
                            designation: selectedWorker?.designation || workerForm.designation,
                            employee_id: selectedWorker?.employee_id || workerForm.employee_id,
                            contractor_name: selectedWorker?.contractor_name || workerForm.contractor_name
                        }}
                        onClose={() => setOpenReport(false)}
                        onConfirm={() => submitFCACC()}
                    />
                )}
            </div>
        );
    } else {
        return (
            <div className="bg-gray-800 p-6 w-full rounded-xl mt-4 overflow-auto no-scrollbar">
                <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold">List of FCACCs</h2>
                    <button
                        className="bg-green-600 flex items-center gap-2 px-3 py-2 rounded text-xs"
                        onClick={downloadExcel}
                    >
                        <FaFileExcel  className="text-sm"/>
                        Download Excel
                    </button>
                </div>

                <div className="flex gap-3 w-full mb-4">

                    <div className="w-2/4">
                        <span className="text-xs text-gray-400">Search</span>
                        <div className="flex items-center gap-2 bg-gray-900 p-2 rounded">
                            <FaMagnifyingGlass className="text-gray-400" />
                            <input
                            placeholder="Search Worker Name..."
                            className="bg-transparent outline-none w-full text-xs block"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        </div>
                    </div>


                    <div>
                        <span className="text-xs text-gray-400">From</span>
                        <input
                            type="date"
                            className="p-2 rounded bg-gray-900 text-xs block"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <span className="text-xs text-gray-400">To</span>
                        <input
                            type="date"
                            className="p-2 rounded bg-gray-900 text-xs block"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>

                </div>
                <table className="w-full text-xs border">
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
                                <td className="p-2 border flex justify-evenly items-center">
                                    <button
                                        className="text-green-500"
                                        onClick={() => { setViewRecord(record) }}
                                    >
                                        <FaEye />
                                    </button>
                                    <button
                                        className="text-yellow-500 text-xs px-2 py-1 rounded"
                                        onClick={() => handleEditFCACC(record)}
                                    >
                                        <FaPenToSquare />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* {editModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-gray-900 p-6 rounded w-1/2">
                            <h2 className="text-lg font-bold mb-4">Edit FCACC Record</h2>

                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label className="text-xs text-gray-400">Competency Assessment By</label>
                                    <input
                                        value={editData.competency_assessment_by}
                                        className="p-2 rounded bg-gray-800 w-full"
                                        onChange={(e) => setEditData({ ...editData, competency_assessment_by: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">General Examination</label>
                                    <input
                                        value={editData.general_examination}
                                        className="p-2 rounded bg-gray-800 w-full"
                                        onChange={(e) => setEditData({ ...editData, general_examination: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">Pulse</label>
                                    <input
                                        value={editData.pulse}
                                        className="p-2 rounded bg-gray-800 w-full"
                                        onChange={(e) => setEditData({ ...editData, pulse: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">SpO₂</label>
                                    <input
                                        value={editData.spo2}
                                        className="p-2 rounded bg-gray-800 w-full"
                                        onChange={(e) => setEditData({ ...editData, spo2: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">Systolic BP</label>
                                    <input
                                        value={editData.systolic}
                                        className="p-2 rounded bg-gray-800 w-full"
                                        onChange={(e) => setEditData({ ...editData, systolic: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">Diastolic BP</label>
                                    <input
                                        value={editData.diastolic}
                                        className="p-2 rounded bg-gray-800 w-full"
                                        onChange={(e) => setEditData({ ...editData, diastolic: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">Height (cm)</label>
                                    <input
                                        value={editData.height}
                                        className="p-2 rounded bg-gray-800 w-full"
                                        onChange={(e) => setEditData({ ...editData, height: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">Weight (kg)</label>
                                    <input
                                        value={editData.weight}
                                        className="p-2 rounded bg-gray-800 w-full"
                                        onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-xs text-gray-400">Vertigo Test</label>
                                    <div className="flex gap-4 mt-1">
                                        <label>
                                            <input
                                                type="radio"
                                                checked={editData.vertigo_test_passed === "Passed" ? true : false}
                                                onChange={() => setEditData({ ...editData, vertigo_test_passed: "Passed" })}
                                            /> Passed
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                checked={editData.vertigo_test_passed === "Failed" ? true : false}
                                                onChange={() => setEditData({ ...editData, vertigo_test_passed: "Failed" })}
                                            /> Failed
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                checked={editData.vertigo_test_passed === "Not Done" ? true : false}
                                                onChange={() => setEditData({ ...editData, vertigo_test_passed: "Not Done" })}
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
                )}*/}
                {viewRecord && (
                    console.log("VIEW RECORD", viewRecord),
                    <FCACCReportModal
                        data={{
                            fcaccForm: {
                                date_of_issuance_of_certificate_for_competency_clearance:
                                    viewRecord.date_of_issuance_of_certificate_for_competency_clearance,

                                competency_assessment_by:
                                    viewRecord.competency_assessment_by,

                                general_examination:
                                    viewRecord.examination_findings?.general_examination,

                                pulse:
                                    viewRecord.examination_findings?.pulse,

                                systolic:
                                    viewRecord.examination_findings?.blood_pressure?.systolic,

                                diastolic:
                                    viewRecord.examination_findings?.blood_pressure?.diastolic,

                                spo2:
                                    viewRecord.examination_findings?.spo2,

                                height:
                                    viewRecord.examination_findings?.height,

                                weight:
                                    viewRecord.examination_findings?.weight,

                                vertigo_test_passed:
                                    viewRecord.examination_findings?.vertigo_test_passed
                            },

                            opthalmic_examination:
                                viewRecord.opthalmic_examination ||
                                viewRecord.examination_findings?.opthalmic_examination,

                            name:
                                viewRecord.worker_details?.name,

                            designation:
                                viewRecord.worker_details?.designation,

                            employee_id:
                                viewRecord.worker_details?.employee_id,

                            contractor_name:
                                viewRecord.worker_details?.contractor_name
                        }}
                        viewOnly={true}
                        onClose={() => setViewRecord(null)}
                        onConfirm={() => { }}
                    />
                )}
                {openEditModal && selectedFCACC && (
                    <FCACCEditModal
                        fcacc={selectedFCACC}
                        worker={selectedFCACC.worker_details}
                        onClose={() => {
                            setOpenEditModal(false);
                            setSelectedFCACC(null);
                        }}
                        onSave={handleUpdateFCACC}
                    />
                )}

            </div>
        );
    }
}

export default FCACC;