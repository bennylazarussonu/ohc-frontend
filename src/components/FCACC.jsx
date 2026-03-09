import { FaMagnifyingGlass, FaUserPlus } from "react-icons/fa6";
import { useState, useEffect } from "react";
import api from "../api/axios";

function FCACC() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [newWorkerFormDisplay, setNewWorkerFormDisplay] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [workerForm, setWorkerForm] = useState({
        name: "",
        employee_id: "",
        fathers_name: "",
        aadhar_no: "",
        gender: "",
        phone_no: "",
        designation: "",
        contractor_name: ""
    });

    const [fcaccForm, setFcaccForm] = useState({
        competency_assessment_by: "",
        pulse: "",
        systolic: "",
        diastolic: "",
        spo2: "",
        height: "",
        weight: "",
        vertigo_test_passed: true
    });

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

    return (
        <div className="bg-gray-800 p-6 w-full rounded-xl mt-4 overflow-auto no-scrollbar">
            <h2 className="text-lg font-bold mb-3">Fitness Clearance against Competency Certification - FCACC</h2>

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
                            onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                        />

                        <input
                            placeholder="Employee ID"
                            value={workerForm.employee_id}
                            onChange={(e) => setWorkerForm({ ...workerForm, employee_id: e.target.value })}
                        />

                        <input
                            placeholder="Father Name"
                            value={workerForm.fathers_name}
                            onChange={(e) => setWorkerForm({ ...workerForm, fathers_name: e.target.value })}
                        />

                        <input
                            placeholder="Phone"
                            value={workerForm.phone_no}
                            onChange={(e) => setWorkerForm({ ...workerForm, phone_no: e.target.value })}
                        />

                        <input 
                            placeholder="designation"
                        />

                        <div>
                            <input 
                        type="date"
                        value={workerForm.dob}
                        onChange={(e) => setWorkerForm({ ...workerForm, dob: e.target.value })}
                        />
                        <span className="text-xs text-gray-300">Date of Birth</span>
                        </div>

                        <input
                            placeholder="Aadhaar No"
                            value={workerForm.aadhar_no}
                            onChange={(e) => setWorkerForm({ ...workerForm, aadhar_no: e.target.value })}
                        />

                        <select 
                            placeholder="Gender"
                            value={workerForm.gender}
                            onChange={(e) => setWorkerForm({...workerForm, gender: e.target.value })}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>

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
    )
}

export default FCACC;