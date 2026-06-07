import { FaMagnifyingGlass, FaUserPlus, FaUser, FaPenToSquare, FaIdCardClip, FaFloppyDisk, FaEye, FaFileExcel } from "react-icons/fa6";
import api from "../api/axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useState, useRef, useEffect } from "react";
import VisionCheckModal from "./VisionCheckModal.jsx";
import IdRenewalReportModal from "./IdRenewalReportModal.jsx";
import IdRenewalEditModal from "./IdRenewalEditModal.jsx";
import { formatDateDMY } from "../utils/date.js";
import { useAuth } from "../context/AuthContext.jsx";

function IdRenewal() {
    const { user, loading } = useAuth();
    const [tab, setTab] = useState("renewal");
    const [workerSearch, setWorkerSearch] = useState("");
    const [workerResults, setWorkerResults] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [workerSearchLoading, setWorkerSearchLoading] = useState(false);
    const [isNewWorker, setIsNewWorker] = useState(false);
    const [isEditingWorker, setIsEditingWorker] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [openVision, setOpenVision] = useState(false);
    const [selectedWorkersVision, setSelectedWorkerVision] = useState(null);
    const [openReport, setOpenReport] = useState(false);
    const [finalPayload, setFinalPayload] = useState(null);
    const [visionForm, setVisionForm] = useState(null);
    const [renewedIds, setRenewedIds] = useState([]);
    const [renewedIdsLoading, setRenewedIdsLoading] = useState(false);
    const [renewedSearch, setRenewedSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [viewReportData, setViewReportData] = useState(null);
    const [workerForm, setWorkerForm] = useState({
        name: "",
        employee_id: "",
        fathers_name: "",
        aadhar_no: "",
        gender: "Male",
        dob: "",
        phone_no: "",
        designation: "",
        contractor_name: "",
        date_of_joining: "",
    });
    const [renewalForm, setRenewalForm] = useState({
        previous_renewal_date: "",
        blood_group: "",
        general_condition: "",
        pulse: "",
        systolic: "",
        diastolic: "",
        spo2: "",
        height: "",
        weight: "",
        remarks: "",
        vertigo_test_passed: "Passed",
    });
    const [pulseDiagnosis, setPulseDiagnosis] = useState({ text: "", color: "", border: "" })
    const [bpDiagnosis, setBpDiagnosis] = useState({ text: "", color: "", border: "" })
    const [spo2Diagnosis, setSpo2Diagnosis] = useState({ text: "", color: "", border: "" })
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedRenewal, setSelectedRenewal] = useState(null);

    const mapWorkerToForm = (worker) => ({
        name: worker.name || "",
        fathers_name: worker.fathers_name || "",
        dob: worker.dob ? worker.dob.split("T")[0] : "",
        phone_no: worker.phone_no || "",
        employee_id: worker.employee_id || "",
        aadhar_no: worker.aadhar_no || "",
        gender: worker.gender || "Male",
        designation: worker.designation || "",
        contractor_name: worker.contractor_name || "",
        date_of_joining: worker.date_of_joining
            ? worker.date_of_joining.split("T")[0]
            : ""
    });


    // 🔑 debounce timer that survives renders
    const debounceRef = useRef(null);

    const searchWorkers = (value) => {
        setWorkerSearch(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (value.trim().length < 2) {
            setWorkerResults([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                setWorkerSearchLoading(true);
                const res = await api.get("/api/workers/search", {
                    params: { q: value }
                });
                setWorkerResults(res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setWorkerSearchLoading(false);
            }
        }, 300);
    };

    const handleSelectWorker = async (worker) => {
        const today = new Date();

        if (
            worker.id_status === "Active" &&
            worker.last_id_renewal_date
        ) {
            const expiryDate = new Date(
                worker.last_id_renewal_date
            );

            // ID valid for 3 months
            expiryDate.setMonth(
                expiryDate.getMonth() + 3
            );

            const daysLeft = Math.ceil(
                (expiryDate - today) /
                (1000 * 60 * 60 * 24)
            );

            // Allow renewal only within 5 days before expiry
            if (daysLeft > 5) {
                alert(
                    `ID renewal is allowed only within 5 days before expiry.\nExpiry Date: ${expiryDate.toLocaleDateString()}`
                );
                return;
            }
        }

        try {
            setSelectedWorker(worker);
            setWorkerSearch(worker.name);
            setWorkerResults([]);
            setIsEditingWorker(false);
            setIsNewWorker(false);

            let latestRenewal = null;

            try {
                const res = await api.get(
                    `/api/id-renewal/latest/${worker.id}`
                );

                latestRenewal = res.data;
            } catch (err) {
                console.log("No previous renewal found");
            }

            setRenewalForm({
                previous_renewal_date:
                    worker.last_id_renewal_date
                        ? worker.last_id_renewal_date.split("T")[0]
                        : "",

                blood_group:
                    latestRenewal?.blood_group || "",

                general_condition:
                    latestRenewal?.general_condition || "",

                pulse: "",
                systolic: "",
                diastolic: "",
                spo2: "",

                height:
                    latestRenewal?.height || "",

                weight: "",

                remarks: "",

                vertigo_test_passed:
                    (latestRenewal?.vertigo_test_passed === "true") ? "Passed" : (latestRenewal?.vertigo_test_passed === "false" ? "Failed" : (latestRenewal?.vertigo_test_passed || "Passed")),
            });

        } catch (err) {
            console.error(err);
            alert("Failed to fetch previous renewal");
        }
    };

    useEffect(() => {
        if (tab === "list") {
            fetchRenewedIds();
        }
    }, [tab]);

    useEffect(() => {
        const pulse = renewalForm.pulse;
        if (!pulse) {
            setPulseDiagnosis({ text: "", color: "", border: "" })
            return;
        };

        let text = "Normal Pulse";
        let color = "text-green-400";
        let border = "focus:border-2 focus:border-green-400";
        if (pulse < 50) {
            text = "Severe Bradycardia";
            color = "text-red-500";
            border = "focus:border-2 focus:border-red-500";
        } else if (pulse < 60) {
            text = "Mild Bradycardia";
            color = "text-orange-400";
            border = "focus:border-2 focus:border-orange-400";
        } else if (pulse <= 104) {
            // normal
        } else if (pulse <= 120) {
            text = "Mild Tachycardia";
            color = "text-yellow-400";
            border = "focus:border-2 focus:border-yellow-400";
        } else if (pulse <= 150) {
            text = "Moderate Tachycardia";
            color = "text-orange-400";
            border = "focus:border-2 focus:border-orange-400";
        } else {
            text = "Severe Tachycardia";
            color = "text-red-500";
            border = "focus:border-2 focus:border-red-500";
        }

        setPulseDiagnosis({ text, color, border })
    }, [renewalForm.pulse]);

    useEffect(() => {
        const s = Number(renewalForm.systolic);
        const d = Number(renewalForm.diastolic);
        if (!s || !d) {
            setBpDiagnosis({ text: "", color: "", border: "" })
            return
        };

        let text = "Normal Blood Pressure";
        let color = "text-green-400";
        let border = "focus:border-2 focus:border-green-400";

        // Hypotension
        if (s < 90 || d < 60) {
            text = "Hypotension";
            color = "text-orange-400";
            border = "focus:border-2 focus:border-orange-400";

            // Normal
        } else if (s < 120 && d < 80) {
            text = "Normal Blood Pressure";
            color = "text-green-400";
            border = "focus:border-2 focus:border-green-400";

            // Elevated BP (THIS captures 120/80 correctly)
        } else if (s >= 120 && s < 130 && d < 80) {
            text = "Elevated Blood Pressure";
            color = "text-yellow-400";
            border = "focus:border-2 focus:border-yellow-400";

            // Stage 1 Hypertension
        } else if (
            (s >= 130 && s < 140) ||
            (d >= 80 && d < 90 && s >= 130)
        ) {
            text = "Hypertension – Stage 1";
            color = "text-orange-400";
            border = "focus:border-2 focus:border-orange-400";

            // Stage 2 Hypertension
        } else if (
            (s >= 140 && s < 180) ||
            (d >= 90 && d < 120)
        ) {
            text = "Hypertension – Stage 2";
            color = "text-red-400";
            border = "focus:border-2 focus:border-red-400";

            // Crisis
        } else if (s >= 180 || d >= 120) {
            text = "Hypertensive Crisis";
            color = "text-red-500";
            border = "focus:border-2 focus:border-red-500";
        }

        setBpDiagnosis({ text, color, border });
    }, [renewalForm.systolic, renewalForm.diastolic]);

    useEffect(() => {
        const spo2 = Number(renewalForm.spo2);
        if (!spo2) {
            setSpo2Diagnosis({ text: "", color: "", border: "" });
            return;
        };

        let text = "Normal Oxygen Saturation";
        let color = "text-green-400";
        let border = "focus:border-2 focus:border-green-400";

        if (spo2 >= 95) {
            // normal
        } else if (spo2 >= 90) {
            text = "Mild Hypoxia";
            color = "text-yellow-400";
            border = "focus:border-2 focus:border-yellow-400";
        } else if (spo2 >= 85) {
            text = "Moderate Hypoxia";
            color = "text-orange-400";
            border = "focus:border-2 focus:border-orange-400";
        } else {
            text = "Severe Hypoxia";
            color = "text-red-500";
            border = "focus:border-2 focus:border-red-500";
        }

        setSpo2Diagnosis({ text, color, border });
    }, [renewalForm.spo2]);

    //   const fetchWorkerVision = async (worker_id) => {
    //   try {
    //     const vision = await api.get(`/api/pre-employment/vision/${worker_id}`);
    //     setSelectedWorkerVision(vision.data.opthalmic_examination);
    //   } catch (err) {
    //     console.error(err);
    //     alert("Failed to fetch Worker Vision");
    //   }
    // };

    const fetchRenewedIds = async () => {
        try {
            setRenewedIdsLoading(true);

            const res = await api.get("/api/id-renewal/list");

            setRenewedIds(res.data || []);

        } catch (err) {
            console.error(err);
            alert("Failed to fetch renewed IDs");
        } finally {
            setRenewedIdsLoading(false);
        }
    };

    const filteredRenewedIds = renewedIds.filter((item) => {

        const search = renewedSearch.toLowerCase();

        const matchesSearch =
            item.worker?.name?.toLowerCase().includes(search) ||
            item.worker?.employee_id?.toLowerCase().includes(search) ||
            item.worker?.fathers_name?.toLowerCase().includes(search);

        const renewalDate = new Date(item.date_of_renewal);

        let matchesFromDate = true;
        let matchesToDate = true;

        if (fromDate) {
            matchesFromDate =
                renewalDate >= new Date(fromDate);
        }

        if (toDate) {
            const endDate = new Date(toDate);
            endDate.setHours(23, 59, 59, 999);

            matchesToDate =
                renewalDate <= endDate;
        }

        return (
            matchesSearch &&
            matchesFromDate &&
            matchesToDate
        );
    });

    const downloadRenewedIdsExcel = () => {

        const excelData = filteredRenewedIds.map((item, index) => ({
            "Sr No": index + 1,
            "Worker Name": item.worker?.name || "",
            "Father Name": item.worker?.fathers_name || "",
            "Employee ID": item.worker?.employee_id || "",
            "General Condition": item.general_condition || "",
            "Blood Group": item.blood_group || "",
            "Pulse": item.pulse || "",
            "Blood Pressure":
                `${item.blood_pressure?.systolic || ""}/${item.blood_pressure?.diastolic || ""}`,
            "SpO2": item.spo2 || "",
            "Height": item.height || "",
            "Weight": item.weight || "",
            "Vertigo Test": item.vertigo_test_passed || "",
            "Remarks": item.remarks || "",
            "Renewal Date": formatDateDMY(item.date_of_renewal),
            "Previous Renewal Date":
                item.previous_renewal_date
                    ? formatDateDMY(item.previous_renewal_date)
                    : ""
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Renewed IDs"
        );

        const excelBuffer = XLSX.write(
            workbook,
            {
                bookType: "xlsx",
                type: "array"
            }
        );

        const fileData = new Blob(
            [excelBuffer],
            {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        );

        saveAs(
            fileData,
            `Renewed_IDs_${new Date().toISOString().split("T")[0]}.xlsx`
        );
    };

    return (
        <div className="">
            <div className="bg-gray-800 rounded p-2 flex justify-center gap-2">
                <div onClick={() => { setTab("renewal") }} className={`cursor-pointer w-1/2 ${tab === "renewal" ? ("bg-blue-600") : ("bg-gray-700")} rounded p-1 font-semibold text-xs text-center`}>
                    ID Renewal
                </div>
                <div onClick={() => { setTab("list") }} className={`cursor-pointer w-1/2 ${tab === "list" ? ("bg-blue-600") : ("bg-gray-700")} rounded p-1 font-semibold text-xs text-center`}>
                    List of Renewed IDs
                </div>
            </div>
            {tab === "renewal" && (
                <div className="bg-gray-800 p-6 w-full rounded-xl mt-4 overflow-auto no-scrollbar">
                    <h2 className="text-sm font-bold mb-3">ID RENEWAL</h2>

                    {/* Search box */}
                    <div className="relative">
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 w-4/5">
                                <FaMagnifyingGlass />
                                <input
                                    type="text"
                                    className="bg-gray-700 rounded w-full p-2 text-xs"
                                    placeholder="Search by Name, EmpID, Father Name, Aadhar, Phone"
                                    value={workerSearch}
                                    onChange={(e) => {
                                        searchWorkers(e.target.value);
                                    }}
                                />
                            </div>
                            <button
                                className="w-1/5 bg-blue-600 rounded hover:bg-blue-700 p-2 text-xs"
                                onClick={() => {
                                    setSelectedWorker(null);
                                    setIsNewWorker(true);
                                    setIsEditingWorker(false);
                                    setWorkerForm({
                                        name: "",
                                        employee_id: "",
                                        fathers_name: "",
                                        aadhar_no: "",
                                        gender: "Male",
                                        dob: "",
                                        phone_no: "",
                                        designation: "",
                                        contractor_name: "",
                                        date_of_joining: ""
                                    });
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    <FaUserPlus />
                                    Add New Worker
                                </span>
                            </button>
                        </div>

                        {/* Results dropdown */}
                        {workerResults.length > 0 && (
                            <div className="absolute z-100 bg-gray-900 w-3/4 mt-1 ml-5 rounded border border-gray-700 max-h-40 overflow-auto no-scrollbar">
                                {workerResults.map((worker, idx) => (
                                    <div
                                        key={worker.id}
                                        onClick={() => {
                                            handleSelectWorker(worker);
                                            setIsNewWorker(false);
                                        }}
                                        className="px-3 py-2 cursor-pointer hover:bg-gray-800 flex justify-between border-b border-gray-400"
                                    >
                                        <div>
                                            <p className="font-bold text-sm mb-2">{worker.name}</p>
                                            <div className="grid grid-cols-4 gap-x-16 gap-y-2 w-full text-xs mb-2">
                                                <div className="text-xs">
                                                    <p className="text-gray-400">Father Name</p>
                                                    <p className="font-semibold">{worker.fathers_name}</p>
                                                </div>
                                                <div className="text-xs">
                                                    <p className="text-gray-400">Employee ID</p>
                                                    <p className="font-semibold">{worker.employee_id}</p>
                                                </div>
                                                <div className="text-xs">
                                                    <p className="text-gray-400">Aadhar No.</p>
                                                    <p className="font-semibold">{worker.aadhar_no}</p>
                                                </div>
                                                <div className="text-xs">
                                                    <p className="text-gray-400">Phone No.</p>
                                                    <p className="font-semibold">{worker.phone_no}</p>
                                                </div>
                                                <div className="text-xs">
                                                    <p className="text-xs text-gray-400">Last Renewal Date: </p>
                                                    <p className="font-semibold">{worker.last_id_renewal_date ? worker.last_id_renewal_date.split("T")[0] : ("")}</p>
                                                </div>
                                                <div className="text-xs">
                                                    <p className="text-gray-400 text-xs">Status:</p>
                                                    {(() => {
                                                        if (!worker.id_status) return null;

                                                        let daysLeft = null;

                                                        if (worker.last_id_renewal_date) {
                                                            const expiryDate = new Date(worker.last_id_renewal_date);
                                                            expiryDate.setMonth(expiryDate.getMonth() + 3);

                                                            daysLeft = Math.ceil(
                                                                (expiryDate - new Date()) /
                                                                (1000 * 60 * 60 * 24)
                                                            );
                                                        }

                                                        if (worker.id_status === "Active") {
                                                            return (
                                                                <p className="text-green-400 text-xs">
                                                                    ID Renewed
                                                                    {daysLeft !== null &&
                                                                        ` (Expires in ${Math.max(daysLeft, 0)} days)`}
                                                                </p>
                                                            );
                                                        }

                                                        if (worker.id_status === "Expired") {
                                                            return (
                                                                <p className="text-red-400 text-xs">
                                                                    ID Requires Renewal
                                                                    {daysLeft !== null &&
                                                                        ` (Expired ${Math.abs(daysLeft)} days ago)`}
                                                                </p>
                                                            );
                                                        }

                                                        return null;
                                                    })()}
                                                </div>
                                            </div>


                                        </div>
                                        <p className="text-xs text-gray-400">
                                            {idx + 1} / {workerResults.length}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Loading */}
                        {workerSearchLoading && (
                            <p className="text-xs text-gray-400 mt-1">Searching…</p>
                        )}

                        {(isNewWorker || isEditingWorker) && (
                            <div className="mt-2 bg-gray-900 p-3 rounded w-full">
                                <div className="flex items-center gap-2 mb-2 text-sm">
                                    <FaUser className="" />
                                    <h3 className="font-bold">WORKER DETAILS</h3>
                                </div>

                                <div className="grid grid-cols-3 gap-3 text-xs">
                                    {[
                                        ["name", "Name"],
                                        ["employee_id", "Employee ID"],
                                        ["fathers_name", "Father's Name"],
                                        ["aadhar_no", "Aadhaar No"],
                                        ["phone_no", "Phone No"],
                                        ["designation", "Designation"],
                                        ["contractor_name", "Contractor Name"],
                                        ["date_of_joining", "Date of Joining"]
                                    ].map(([key, label]) => (
                                        <div>
                                            <input
                                                key={key}
                                                type={(key === "date_of_joining" ? ("date") : ("text"))}
                                                placeholder={label}
                                                className="p-2 bg-gray-800 text-xs rounded w-full"
                                                value={workerForm[key]}
                                                onChange={(e) =>
                                                    setWorkerForm({ ...workerForm, [key]: e.target.value })
                                                }
                                            />
                                            {(<span className='p-1 text-xs text-gray-300'>{label}</span>)}
                                        </div>
                                    ))}
                                    <div>
                                        <select
                                            className="p-2 bg-gray-800 rounded w-full"
                                            value={workerForm.gender}
                                            onChange={(e) =>
                                                setWorkerForm({ ...workerForm, gender: e.target.value })
                                            }
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <span className='p-1 text-xs text-gray-300'>Gender</span>
                                    </div>


                                    <div>
                                        <input
                                            type="date"
                                            className="p-2 bg-gray-800 rounded w-full"
                                            value={workerForm.dob}
                                            onChange={(e) =>
                                                setWorkerForm({ ...workerForm, dob: e.target.value })
                                            }
                                        />
                                        <span className="p-1 text-xs text-gray-300">Date of Birth</span>
                                    </div>
                                </div>

                                {!selectedWorker && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        Enter details to create a new worker
                                    </p>
                                )}
                            </div>
                        )}
                        {isEditingWorker && (
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await api.put(
                                                `/api/workers/${selectedWorker.id}`,
                                                workerForm
                                            );

                                            setSelectedWorker(res.data);
                                            setIsEditingWorker(false);
                                            alert("Worker updated successfully");
                                        } catch (err) {
                                            console.error(err);
                                            alert("Failed to update worker");
                                        }
                                    }}
                                    className="flex items-center text-xs gap-2 bg-green-600 p-2 rounded text-sm"
                                >
                                    <FaFloppyDisk />
                                    Save Changes
                                </button>

                                <button
                                    onClick={() => {
                                        setIsEditingWorker(false);
                                        setWorkerForm(mapWorkerToForm(selectedWorker));
                                    }}
                                    className="bg-gray-600 px-3 py-1 rounded text-xs"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>


                    {/* Selected Worker */}
                    {selectedWorker && !isNewWorker && !isEditingWorker && (
                        <div className="mt-4 p-3 bg-gray-900 rounded">
                            <div className="flex justify-between mb-2">
                                <div>
                                    <p className="text-xs text-gray-300">Selected Worker</p>
                                    <p className="font-bold text-sm">{selectedWorker.name}</p>
                                </div>
                                <button
                                    className="flex items-center gap-2 text-xs text-green-400"
                                    onClick={() => {
                                        setIsEditingWorker(true);
                                        setWorkerForm(mapWorkerToForm(selectedWorker))
                                    }}
                                >
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
                    <div className="grid grid-cols-4 gap-3 rounded-lg mt-3">
                        <div className="col-start-1">
                            <p className="text-xs text-gray-400 mb-1">Last Date of Renewal:</p>
                            <input
                                max={new Date().toISOString().split("T")[0]}
                                type="date"
                                className="bg-gray-900 rounded text-xs p-2 w-full"
                                value={
                                    selectedWorker?.last_id_renewal_date
                                        ? (selectedWorker.last_id_renewal_date.split("T")[0])
                                        : renewalForm.previous_renewal_date
                                }
                                disabled={!!selectedWorker?.last_id_renewal_date}
                                onChange={(e) =>
                                    setRenewalForm({
                                        ...renewalForm,
                                        previous_renewal_date: e.target.value,
                                    })
                                }
                            />

                        </div>
                        <div className="col-start-4">
                            <p className="text-xs text-gray-400 mb-1">Current Renewal Date:</p>
                            <input
                                type="date"
                                disabled={true}
                                value={new Date().toISOString().split("T")[0]}
                                className="bg-gray-900 rounded text-xs p-2 w-full"
                            />
                        </div>
                    </div>
                    <div className="col-span-4 text-sm text-gray-400 mt-4 mb-2">Parameters</div>
                    <div className="grid grid-cols-4 gap-3 rounded-lg">
                        <select
                            className="w-full bg-gray-900 outline-none border-none col-span-2 rounded text-xs p-2"
                            placeholder="Blood Group"
                            value={renewalForm.blood_group}
                            onChange={(e) => setRenewalForm({ ...renewalForm, blood_group: e.target.value })}
                        >
                            <option value="">Blood Group</option>
                            <option value="A+">A POSITIVE</option>
                            <option value="A-">A NEGATIVE</option>
                            <option value="B+">B POSITIVE</option>
                            <option value="B-">B NEGATIVE</option>
                            <option value="AB+">AB POSITIVE</option>
                            <option value="AB-">AB NEGATIVE</option>
                            <option value="O+">O POSITIVE</option>
                            <option value="O-">O NEGATIVE</option>
                        </select>
                        <input
                            type="text"
                            className="col-span-2 bg-gray-900 p-2 rounded text-xs"
                            placeholder="General Condition"
                            value={renewalForm.general_condition}
                            onChange={(e) => setRenewalForm({ ...renewalForm, general_condition: e.target.value })}
                        />
                        {[
                            ["pulse", "Heart Rate"],
                        ].map(([key, label]) => (
                            <div>
                                <input
                                    type="number"
                                    key={key}
                                    placeholder={label}
                                    className={`bg-gray-900 p-2 rounded text-xs w-full focus:outline-none ${pulseDiagnosis.border}`}
                                    value={renewalForm[key]}
                                    onChange={(e) => setRenewalForm({ ...renewalForm, [key]: e.target.value })}
                                />
                                <p className={`text-xs ${pulseDiagnosis.color}`}>{pulseDiagnosis.text}</p>
                            </div>
                        ))}
                        {[
                            ["systolic", "Sytolic Pressure"],
                            ["diastolic", "Diastolic Pressure"],
                        ].map(([key, label]) => (
                            <div>
                                <input
                                    type="number"
                                    key={key}
                                    placeholder={label}
                                    className={`bg-gray-900 p-2 rounded text-xs w-full focus:outline-none ${bpDiagnosis.border}`}
                                    value={renewalForm[key]}
                                    onChange={(e) => setRenewalForm({ ...renewalForm, [key]: e.target.value })}
                                />
                                <p className={`text-xs ${bpDiagnosis.color} ${key === "diastolic" ? ("hidden") : ("")}`}>{bpDiagnosis.text}</p>
                            </div>
                        ))}
                        {[
                            ["spo2", "SpO2"]
                        ].map(([key, label]) => (
                            <div>
                                <input
                                    type="number"
                                    key={key}
                                    placeholder={label}
                                    className={`bg-gray-900 p-2 rounded text-xs w-full focus:outline-none ${spo2Diagnosis.border}`}
                                    value={renewalForm[key]}
                                    onChange={(e) => setRenewalForm({ ...renewalForm, [key]: e.target.value })}
                                />
                                <p className={`text-xs ${spo2Diagnosis.color}`}>{spo2Diagnosis.text}</p>
                            </div>
                        ))}
                        {[
                            ["height", "Height"],
                            ["weight", "Weight"]
                        ].map(([key, label]) => (
                            <div>
                                <input
                                    type="number"
                                    key={key}
                                    placeholder={label}
                                    className={`bg-gray-900 p-2 rounded text-xs w-full focus:outline-none`}
                                    value={renewalForm[key]}
                                    onChange={(e) => setRenewalForm({ ...renewalForm, [key]: e.target.value })}
                                />
                            </div>
                        ))}
                        <div>
                            <input
                                type="text"
                                className="bg-gray-900 p-2 rounded w-full text-xs"
                                placeholder="Remarks"
                                value={renewalForm.remarks}
                                onChange={(e) => setRenewalForm({ ...renewalForm, remarks: e.target.value })}
                            />
                        </div>
                        <button
                            className="border-2 border-blue-900 bg-transparent text-blue-500 p-2 rounded text-xs"
                            onClick={() => {
                                if (!selectedWorker) {
                                    alert("Please select a worker first");
                                    return;
                                }

                                // fetchWorkerVision(selectedWorker.id);
                                setOpenVision(true);
                            }}
                        >
                            Vision Examination
                        </button>
                    </div>

                    <p className="text-xs text-gray-400 mt-3">Vertigo Test:</p>
                    <div className="grid grid-cols-4 gap-3 rounded-lg mt-2">
                        <div className="col-span-4 grid grid-cols-9 flex items-center">

                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="vertigo_test_passed"
                                    checked={renewalForm.vertigo_test_passed === "Passed"}
                                    onChange={(e) => setRenewalForm({ ...renewalForm, vertigo_test_passed: "Passed" })}
                                />
                                <p className="text-xs">Passed</p>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    name="vertigo_test_passed"
                                    type="radio"
                                    checked={renewalForm.vertigo_test_passed === "Failed"}
                                    onChange={(e) => setRenewalForm({ ...renewalForm, vertigo_test_passed: "Failed" })}
                                />
                                <p className="text-xs">Not Passed</p>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    name="vertigo_test_passed"
                                    type="radio"
                                    checked={renewalForm.vertigo_test_passed === "Not Done"}
                                    onChange={(e) => setRenewalForm({ ...renewalForm, vertigo_test_passed: "Not Done" })}
                                />
                                <p className="text-xs">Not Done</p>
                            </label>
                        </div>
                        <div className="col-span-4 grid grid-cols-4">
                            <div className="flex justify-end col-start-4">
                                <button
                                    className="bg-green-700 w-1/2 p-2 flex items-center justify-center gap-2 rounded"
                                    disabled={saveLoading}
                                    onClick={async () => {
                                        try {

                                            if (!selectedWorker && !isNewWorker) {
                                                alert("Please Select a Worker or Add New Worker for Renewal");
                                                return;
                                            }

                                            if (!renewalForm.previous_renewal_date || renewalForm.previous_renewal_date === null) {
                                                alert("'Last Date of Renewal' cannot be empty");
                                                return;
                                            }

                                            if (renewalForm.pulse > 104) {
                                                alert("Elevated Heart Rate. Candidate not eligible for ID Renewal");
                                                return;
                                            }

                                            if (renewalForm.systolic > 140 || renewalForm.diastolic > 90) {
                                                alert("Elevated Blood Pressure. Candidate not eligible for ID Renewal");
                                                return;
                                            }

                                            if (renewalForm.spo2 && renewalForm.spo2 < 95) {
                                                alert("Low Oxygen Saturation. Candidate not eligible for ID Renewal");
                                                return;
                                            }

                                            // const payload = {
                                            //     ...renewalForm,
                                            //     opthalmic_examination: visionForm
                                            // };

                                            // setSaveLoading(true);

                                            // // Existing worker
                                            // if (selectedWorker) {
                                            //     payload.worker_id = selectedWorker.id;
                                            // }

                                            // // New worker
                                            // if (isNewWorker) {
                                            //     payload.worker_data = workerForm;
                                            // }

                                            // const res = await api.post("/api/id-renewal/renew", payload);


                                            // alert("ID renewed successfully");

                                            // setSelectedWorker(null);
                                            // setRenewalForm({
                                            //     previous_renewal_date: "",
                                            //     blood_group: "",
                                            //     general_condition: "",
                                            //     pulse: "",
                                            //     systolic: "",
                                            //     diastolic: "",
                                            //     spo2: "",
                                            //     height: "",
                                            //     weight: "",
                                            //     remarks: "",
                                            //     vertigo_test_passed: true,
                                            // });
                                            // setIsNewWorker(false);
                                            const payload = {
                                                ...renewalForm,
                                                opthalmic_examination: visionForm,
                                                worker_id: selectedWorker?.id,
                                                ...(isNewWorker && { worker_data: workerForm })
                                            };

                                            setFinalPayload(payload);   // 🔥 store it
                                            setOpenReport(true);       // 🔥 open modal

                                        } catch (err) {
                                            console.error(err);
                                            console.log(err);
                                            alert("Failed to renew ID");
                                        } finally {
                                            setSaveLoading(false);
                                        }
                                    }}
                                >
                                    {saveLoading ? (
                                        "Loading"
                                    ) : (
                                        <>
                                            <FaIdCardClip />
                                            Renew ID</>)}
                                </button>
                            </div>
                        </div>
                    </div>
                    {openVision && (
                        <VisionCheckModal
                            vision={visionForm}
                            worker={selectedWorker}
                            instance={"id-renewal"}
                            onClose={() => {
                                setOpenVision(false);
                            }}
                            onSave={(data) => {
                                setVisionForm(data.opthalmic_examination);
                            }}
                        />
                    )}

                </div>
            )}
            {tab === "list" && (
                <div className="bg-gray-800 p-6 w-full rounded-xl mt-4 overflow-auto no-scrollbar">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-sm font-bold">
                            LIST OF RENEWED IDs
                        </h2>

                        <button
                            onClick={downloadRenewedIdsExcel}
                            className="bg-green-700 hover:bg-green-800 px-3 py-2 rounded text-xs flex items-center gap-2"
                        >
                            <FaFileExcel />
                            Download Excel
                        </button>
                    </div>
                    <div className="flex gap-3 mb-4 items-end">

                        <div className="w-1/2">
                            <p className="text-xs text-gray-400 mb-1">
                                Search
                            </p>

                            <div className="flex items-center gap-2 bg-gray-900 rounded px-2">
                                <FaMagnifyingGlass className="text-gray-400 text-xs" />

                                <input
                                    type="text"
                                    placeholder="Search Name, Employee ID, Father Name"
                                    className="bg-transparent outline-none p-2 text-xs w-full"
                                    value={renewedSearch}
                                    onChange={(e) =>
                                        setRenewedSearch(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 mb-1">
                                From
                            </p>

                            <input
                                type="date"
                                className="bg-gray-900 rounded p-2 text-xs"
                                value={fromDate}
                                onChange={(e) =>
                                    setFromDate(e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 mb-1">
                                To
                            </p>

                            <input
                                type="date"
                                className="bg-gray-900 rounded p-2 text-xs"
                                value={toDate}
                                onChange={(e) =>
                                    setToDate(e.target.value)
                                }
                            />
                        </div>

                        <button
                            className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-xs"
                            onClick={() => {
                                setRenewedSearch("");
                                setFromDate("");
                                setToDate("");
                            }}
                        >
                            Clear
                        </button>

                    </div>

                    <div className="flex w-full justify-between mb-2">

                        <div>
                            <p className="text-xs text-gray-400">Showing: <b className="font-semibold text-xs text-white">{filteredRenewedIds.length} Records</b></p>

                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Total Records: <b className="text-white font-semibold">{renewedIds.length}</b></p>
                        </div>
                    </div>
                    <div className="h-[315px] overflow-scroll no-scrollbar">
                        <table className="w-full text-sm border">
                            <thead className="bg-gray-900">
                                <tr>
                                    <th className="p-2 border">Worker Name</th>
                                    <th className="p-2 border">Fathers Name</th>
                                    <th className="p-2 border">Employee ID</th>
                                    <th className="p-2 border">General Condition</th>
                                    <th className="p-2 border">Renewal Date</th>
                                    <th className="p-2 border">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renewedIdsLoading ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center p-4 text-gray-400"
                                        >
                                            Loading...
                                        </td>
                                    </tr>
                                ) : filteredRenewedIds.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center p-4 text-gray-400"
                                        >
                                            No Renewed IDs Found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRenewedIds.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-700"
                                        >
                                            <td className="p-2 border text-xs">
                                                {item.worker?.name || "-"}
                                            </td>

                                            <td className="p-2 border text-xs">
                                                {item.worker?.fathers_name || "-"}
                                            </td>

                                            <td className="p-2 border text-xs">
                                                {item.worker?.employee_id || "-"}
                                            </td>

                                            <td className="p-2 border text-xs">
                                                {item.general_condition || "-"}
                                            </td>

                                            <td className="p-2 border text-xs">
                                                {formatDateDMY(item.date_of_renewal)}
                                            </td>

                                            <td className="p-2 border text-xs flex justify-between">
                                                <button
                                                    className="text-blue-400 hover:text-blue-700 px-2 py-1 rounded"
                                                    onClick={() => {

                                                        setViewReportData({
                                                            ...item,

                                                            name: item.worker?.name,
                                                            designation: item.worker?.designation,
                                                            employee_id: item.worker?.employee_id,
                                                            contractor_name: item.worker?.contractor_name,

                                                            systolic: item.blood_pressure?.systolic,
                                                            diastolic: item.blood_pressure?.diastolic,
                                                        });

                                                        setOpenReport(true);
                                                    }}
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    className="text-green-500 hover:text-green-700 px-2 py-2 rounded"
                                                    onClick={() => {
                                                        setSelectedRenewal(item);
                                                        setOpenEditModal(true);
                                                    }}
                                                >
                                                    <FaPenToSquare />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {openReport && (
                <IdRenewalReportModal
                    data={
                        viewReportData
                            ? viewReportData
                            : {
                                ...finalPayload,
                                date_of_renewal: new Date().toISOString(),
                                name: selectedWorker?.name || workerForm.name,
                                designation: selectedWorker?.designation || workerForm.designation,
                                employee_id: selectedWorker?.employee_id || workerForm.employee_id,
                                contractor_name: selectedWorker?.contractor_name || workerForm.contractor_name,
                                test_done_by: {
                                    id: user.id,
                                    role: user.role,
                                    userId: user.userId,
                                }
                            }
                    }

                    viewOnly={!!viewReportData}

                    onClose={() => {
                        setOpenReport(false);
                        setViewReportData(null);
                    }}

                    onConfirm={async () => {

                        try {


                            setSaveLoading(true);

                            await api.post(
                                "/api/id-renewal/renew",
                                {
                                    ...finalPayload, test_done_by: {
                                        id: user.id,
                                        role: user.role,
                                        userId: user.userId,
                                    }
                                }
                            );

                            alert("ID renewed successfully ✅");

                            setOpenReport(false);

                            setViewReportData(null);

                            setSelectedWorker(null);

                            setVisionForm(null);

                            setRenewalForm({
                                previous_renewal_date: "",
                                blood_group: "",
                                general_condition: "",
                                pulse: "",
                                systolic: "",
                                diastolic: "",
                                spo2: "",
                                height: "",
                                weight: "",
                                remarks: "",
                                vertigo_test_passed: true,
                            });

                        } catch (err) {

                            console.error(err);

                            alert("Failed to renew ID ❌");

                        } finally {

                            setSaveLoading(false);

                        }
                    }}
                />
            )}
            {
    openEditModal && (
        <IdRenewalEditModal
            renewal={selectedRenewal}
            worker={selectedRenewal?.worker}
            onClose={() => {
                setOpenEditModal(false);
                setSelectedRenewal(null);
            }}
            onSave={async (updatedData) => {
                try {
                    await api.put(
                        `/api/id-renewal/${selectedRenewal.id}`,
                        updatedData
                    );

                    alert("Renewal updated successfully");

                    fetchRenewedIds();

                    setOpenEditModal(false);
                    setSelectedRenewal(null);

                } catch (err) {
                    console.error(err);
                    alert("Failed to update renewal");
                }
            }}
        />
    )
}
        </div>
    );
}

export default IdRenewal;
