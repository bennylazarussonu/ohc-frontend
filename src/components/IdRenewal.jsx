import { FaMagnifyingGlass, FaUserPlus, FaUser, FaPenToSquare, FaIdCardClip } from "react-icons/fa6";
import api from "../api/axios";
import { useState, useRef, useEffect } from "react";

function IdRenewal() {
    const [workerSearch, setWorkerSearch] = useState("");
    const [workerResults, setWorkerResults] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [workerSearchLoading, setWorkerSearchLoading] = useState(false);
    const [isNewWorker, setIsNewWorker] = useState(false);
    const [isEditingWorker, setIsEditingWorker] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
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
        vertigo_test_passed: true,
    });
    const [pulseDiagnosis, setPulseDiagnosis] = useState({ text: "", color: "", border: "" })
    const [bpDiagnosis, setBpDiagnosis] = useState({ text: "", color: "", border: "" })
    const [spo2Diagnosis, setSpo2Diagnosis] = useState({ text: "", color: "", border: "" })

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

    const handleSelectWorker = (worker) => {
        if (worker.id_status === "Active") {
            alert("Worker's ID is Active. Cannot be Renewed.");
        } else {
            setSelectedWorker(worker);
            setWorkerSearch(worker.name);
            setWorkerResults([]);
            setIsEditingWorker(false);
            setIsNewWorker(false);
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
            if (worker.last_id_renewal_date) {
                setRenewalForm({
                    ...renewalForm,
                    previous_renewal_date: worker.last_id_renewal_date
                })
            }

        }
    };

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
        setSpo2Diagnosis({text: "", color: "", border: ""});
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

    return (
        <div className="bg-gray-800 p-6 w-full rounded-xl mt-2 overflow-auto no-scrollbar">
            <h2 className="text-lg font-bold mb-3">ID RENEWAL</h2>

            {/* Search box */}
            <div className="relative">
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 w-4/5">
                        <FaMagnifyingGlass />
                        <input
                            type="text"
                            className="bg-gray-700 rounded w-full p-2 text-sm"
                            placeholder="Search by Name, EmpID, Father Name, Aadhar, Phone"
                            value={workerSearch}
                            onChange={(e) => {
                                searchWorkers(e.target.value);
                            }}
                        />
                    </div>
                    <button
                        className="w-1/5 bg-blue-600 rounded hover:bg-blue-700 px-3 py-1 text-sm"
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
                                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-800 flex justify-between"
                            >
                                <div>
                                    <p className="font-semibold">{worker.name}</p>
                                    <p className="text-xs text-gray-400">
                                        EmpID: {worker.employee_id} | Father: {worker.fathers_name} | Aadhar: {worker.aadhar_no} | Phone: {worker.phone_no}
                                    </p>
                                    <p className="text-xs text-gray-400">Last Renewal Date: {worker.last_id_renewal_date ? worker.last_id_renewal_date.split("T")[0] : ("")}</p>
                                    {(worker.id_status && worker.id_status === "Active") ? (
                                        <p className="text-green-400 text-sm">ID Renewed</p>
                                    ) : (worker.id_status && worker.id_status === "Expired") ? (
                                        <p className="text-red-400 text-sm">ID Requires Renewal</p>
                                    ) : ("")}
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
                    <div className="mt-2 bg-gray-800 p-3 rounded-lg w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <FaUser className="text-[16px]" />
                            <h3 className="font-bold text-[16px]">WORKER DETAILS</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-[12.5px]">
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
                                        className="p-2 bg-gray-700 rounded w-full"
                                        value={workerForm[key]}
                                        onChange={(e) =>
                                            setWorkerForm({ ...workerForm, [key]: e.target.value })
                                        }
                                    />
                                    {(<span className='text-xs text-gray-300'>{label}</span>)}
                                </div>
                            ))}
                            <div>
                                <select
                                    className="p-2 bg-gray-700 rounded w-full"
                                    value={workerForm.gender}
                                    onChange={(e) =>
                                        setWorkerForm({ ...workerForm, gender: e.target.value })
                                    }
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                <span className='text-xs text-gray-300'>Gender</span>
                            </div>


                            <div>
                                <input
                                    type="date"
                                    className="p-2 bg-gray-700 rounded w-full"
                                    value={workerForm.dob}
                                    onChange={(e) =>
                                        setWorkerForm({ ...workerForm, dob: e.target.value })
                                    }
                                />
                                <span className="text-xs text-gray-300">Date of Birth</span>
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
                            className="bg-green-600 px-3 py-1 rounded text-sm"
                        >
                            Save Changes
                        </button>

                        <button
                            onClick={() => {
                                setIsEditingWorker(false);
                                setWorkerForm(mapWorkerToForm(selectedWorker));
                            }}
                            className="bg-gray-600 px-3 py-1 rounded text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>


            {/* Selected Worker */}
            {selectedWorker && !isNewWorker && !isEditingWorker && (
                <div className="mt-4 p-3 border border-gray-600 rounded">
                    <div className="flex justify-between">
                        <p className="font-bold">{selectedWorker.name}</p>
                        <button
                            className="flex items-center gap-2 text-sm text-green-400"
                            onClick={() => {
                                setIsEditingWorker(true);
                                setWorkerForm(mapWorkerToForm(selectedWorker))
                            }}
                        >
                            <FaPenToSquare />
                            Edit Worker
                        </button>
                    </div>
                    <p>
                        <span className="font-light text-sm">
                            {selectedWorker.fathers_name} | Emp ID: {selectedWorker.employee_id} | Phone: {selectedWorker.phone_no}
                            <br />
                            DOJ: {selectedWorker.date_of_joining
                                ? selectedWorker.date_of_joining.split("T")[0]
                                : "—"} | {selectedWorker.designation}
                        </span></p>

                </div>
            )}
            <br />
            <div className="grid grid-cols-4 gap-3 rounded-lg mt-3">
                <div className="col-start-1">
                    <p className="text-sm text-gray-400 font-bold">Last Date of Renewal:</p>
                    <input
                        max={new Date().toISOString().split("T")[0]}
                        type="date"
                        className="bg-gray-700 rounded text-sm p-2 w-full"
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
                    <p className="text-sm text-gray-400 font-bold">Current Renewal Date:</p>
                    <input
                        type="date"
                        disabled={true}
                        value={new Date().toISOString().split("T")[0]}
                        className="bg-gray-700 rounded text-sm p-2 w-full"
                    />
                </div>
                <div className="col-span-4 font-bold text-gray-400">Parameters</div>
                <select
                    className="w-full bg-gray-700 outline-none border-none col-span-2 rounded text-sm p-2"
                    placeholder="Blood Group"
                    value={renewalForm.blood_group}
                    onChange={(e) => setRenewalForm({ ...renewalForm, blood_group: e.target.value })}
                >
                    <option value="">Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                </select>
                <input
                    type="text"
                    className="col-span-2 bg-gray-700 p-2 rounded text-sm"
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
                            className={`bg-gray-700 p-2 rounded text-sm w-full focus:outline-none ${pulseDiagnosis.border}`}
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
                            className={`bg-gray-700 p-2 rounded text-sm w-full focus:outline-none ${bpDiagnosis.border}`}
                            value={renewalForm[key]}
                            onChange={(e) => setRenewalForm({ ...renewalForm, [key]: e.target.value })}
                        />
                        <p className={`text-xs ${bpDiagnosis.color} ${key === "diastolic"? ("hidden"): ("")}`}>{bpDiagnosis.text}</p>
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
                            className={`bg-gray-700 p-2 rounded text-sm w-full focus:outline-none ${spo2Diagnosis.border}`}
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
                            className={`bg-gray-700 p-2 rounded text-sm w-full focus:outline-none`}
                            value={renewalForm[key]}
                            onChange={(e) => setRenewalForm({ ...renewalForm, [key]: e.target.value })}
                        />
                    </div>
                ))}
                <input
                    type="text"
                    className="bg-gray-700 p-2 rounded text-sm"
                    placeholder="Remarks"
                    value={renewalForm.remarks}
                    onChange={(e) => setRenewalForm({ ...renewalForm, remarks: e.target.value })}
                />
                <div className="col-span-3 grid grid-cols-9 flex items-center">
                    <p className="text-sm text-gray-400 font-semibold">Vertigo Test:</p>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="vertigo_test_passed"
                            checked={renewalForm.vertigo_test_passed === true}
                            onChange={(e) => setRenewalForm({ ...renewalForm, vertigo_test_passed: true })}
                        />
                        <p>Passed</p>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            name="vertigo_test_passed"
                            type="radio"
                            checked={renewalForm.vertigo_test_passed === false}
                            onChange={(e) => setRenewalForm({ ...renewalForm, vertigo_test_passed: false })}
                        />
                        <p>Not Passed</p>
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

                                    const payload = {
                                        ...renewalForm,
                                    };

                                    setSaveLoading(true);

                                    // Existing worker
                                    if (selectedWorker) {
                                        payload.worker_id = selectedWorker.id;
                                    }

                                    // New worker
                                    if (isNewWorker) {
                                        payload.worker_data = workerForm;
                                    }

                                    const res = await api.post("/api/id-renewal/renew", payload);


                                    alert("ID renewed successfully");

                                    setSelectedWorker(null);
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
                                    setIsNewWorker(false);

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
        </div>
    );
}

export default IdRenewal;
