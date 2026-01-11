import BulkUpload from './components/Workers.jsx';
import BulkMedicineUpload from './components/Medicines.jsx';
import { FaPenToSquare, FaRegFloppyDisk, FaUser, FaUserDoctor, FaUserPlus } from 'react-icons/fa6'
import { useState, useEffect } from 'react';
import api from './api/axios';
import WorkerSection from './components/WorkerSection';
import OPDSection from './components/OPDSection';
import PrescriptionSection from './components/PrescriptionSection';
import OPDReport from './components/OPDReport';
import Navbar from './components/Navbar';
import Reports from './components/Reports';
import Doctor from './components/Doctor';
import { useAuth } from './context/AuthContext.jsx';
import Login from './components/Login.jsx';
import Profile from './components/Profile.jsx';
import Staff from './components/Staff.jsx';
import PreEmployment from './components/PreEmployment.jsx';
import IdRenewal from './components/IdRenewal.jsx';

function App() {
  const { user, loading } = useAuth();
  const [activeMenu, setActiveMenu] = useState("profile");
  const [msg, setMsg] = useState("");
  const [isNewWorker, setIsNewWorker] = useState(false);
  const [isEditingWorker, setIsEditingWorker] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [prescription, setPrescription] = useState([]);
  const [workerSearchLoading, setworkerSearchLoading] = useState(false);
  const [latestReportData, setLatestReportData] = useState(null);
  const [opd, setOpd] = useState({});
  const [workerSearch, setWorkerSearch] = useState("");
  const [workerResults, setWorkerResults] = useState([]);

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(1);
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

  useEffect(() => {
    if (!user) return;

    api.get("/api/doctors").then(res => {
      setDoctors(res.data);

      // 🔒 If logged-in user is DOCTOR, auto-select themselves
      if (user.role === "DOCTOR") {
        const matchedDoctor = res.data.find(d =>
          d.name.toLowerCase().includes(user.userId.toLowerCase())
        );

        if (matchedDoctor) {
          setSelectedDoctorId(matchedDoctor.id);
        }
      }
    });
  }, [user]);


  let timer;
  const searchWorkers = (value) => {
    setWorkerSearch(value);
    clearTimeout(timer);

    if (value.trim().length < 2) {
      setWorkerResults([]);
      return;
    }

    try {
      timer = setTimeout(async () => {
        const res = await api.get("/api/workers/search", {
          params: { q: value }
        });
        setWorkerResults(res.data);
      }, 300)
    } catch (err) {
      console.error(err);
    }
  };



  function formatDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB");
  }

  const handleTemplateSelect = async (type, value) => {
    setOpd(prev => ({
      ...prev,
      [type === "complaint"
        ? "presenting_complaint"
        : "diagnosis"]: value
    }));
    console.log("Template selected:", type, value);


    const res = await api.get("/api/prescriptions/prescription-template", {
      params: { type, value }
    });

    // Map DB prescriptions → UI format
    setPrescription(
      res.data.map(p => ({
        medicine_id: p.medicine_id,
        drug_name_and_dose: p.drug_name_and_dose,
        route_of_administration: p.route_of_administration,
        frequency: p.frequency,
        brand: p.brand,
        days: p.days
      }))
    );
  };


  const handleSubmit = async () => {
    try {
      if (isEditingWorker) {
        alert("Finish editing worker before saving OPD");
        return;
      }

      // if (!selectedWorker) {
      //   alert("Please select a worker");
      //   return;
      // }
      const worker = selectedWorker || await saveWorkerIfNew();
      console.log(selectedDoctorId)
      // const saveWorkerIfNew = async () => {
      //   if (selectedWorker) return selectedWorker;

      //   const res = await api.post("/api/workers", workerForm);
      //   return res.data; // newly created worker
      // };


      if (!opd.presenting_complaint) {
        alert("Presenting complaint is required");
        return;
      }

      setworkerSearchLoading(true);

      // 1️⃣ Save OPD
      const opdPayload = {
        worker_id: worker.id ? Number(worker.id) : undefined,
        presenting_complaint: opd["presenting_complaint"],
        exam_findings_and_clinical_notes: opd["exam_findings_and_clinical_notes"],
        temperature: opd["temperature"],
        heart_rate: opd.heart_rate ? Number(opd.heart_rate) : undefined,
        blood_pressure: opd["blood_pressure"],
        spo2: opd.spo2 ? Number(opd.spo2) : undefined,
        diagnosis: opd["diagnosis"],
        investigations_recommended: opd["investigations_recommended"],
        further_advice: opd["further_advice"],
        referral_advice: opd["referral_advice"]
      };

      const opdRes = await api.post("/api/opds/add", opdPayload);
      const opdId = opdRes.data.id;

      // 2️⃣ Prepare prescription rows
      if (prescription.length > 0) {
        const prescriptionPayload = prescription.map(row => ({
          opd_id: opdId,
          worker_id: worker.id,
          medicine_id: row.medicine_id, // if you store it
          drug_name_and_dose: row.drug_name_and_dose,
          route_of_administration: row.route_of_administration,
          frequency: row.frequency,
          brand: row.brand,
          days: (row.days) ? Number(Math.abs(row.days)) : 0
        }));

        // 3️⃣ Save prescriptions
        await api.post("/api/prescriptions/add", prescriptionPayload);
      }

      alert("OPD & prescriptions saved successfully");

      setLatestReportData({
        worker,
        opd: { ...opdPayload, treating_doctor_id: selectedDoctorId },
        prescription,
        doctor: doctors.find(d => d.id === selectedDoctorId)
      });

      // 4️⃣ Reset page
      setOpd({});
      setPrescription([]);
      setSelectedWorker(null);
      setSelectedDoctorId(null);
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

    } catch (err) {
      console.log(err);
      alert("Failed to save OPD / prescription");
    } finally {
      setworkerSearchLoading(false);
    }
  };

  const saveWorkerIfNew = async () => {
    if (!isNewWorker) return selectedWorker;

    if (!workerForm.name) {
      alert("Worker name is required");
      throw new Error("Invalid worker data");
    }

    console.log(workerForm.dob)


    const res = await api.post("/api/workers/add", workerForm);
    return res.data; // newly created worker
  };




  useEffect(() => {
    const fetchMsg = async () => {
      try {
        let response = await api.get("/");
        setMsg(response.data);
      } catch (error) {
        console.error("Error fetching data from backend:", error);
      }
    };
    fetchMsg();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Login />;

  return (
    <>
      <Navbar active={activeMenu} onChange={setActiveMenu} border={"profile"} />
      <div className="p-6 min-h-screen flex flex-col items-center bg-gray-900 w-full text-white">
        {activeMenu === "workers" && (
          <BulkUpload />
        )}

        {activeMenu === "medicines" && (
          <BulkMedicineUpload />
        )}

        {activeMenu === "opd" && (
          <>
            {latestReportData ? (
              <>
                <div className="print-area">
                  <OPDReport data={latestReportData} />
                </div>
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={() => window.print()}
                    className="bg-blue-600 px-4 py-2 rounded"
                  >
                    Print / Save PDF
                  </button>

                  <button
                    onClick={() => setLatestReportData(null)}
                    className="bg-gray-600 px-4 py-2 rounded"
                  >
                    New OPD
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full">
                <div className="flex w-full gap-2">
                  {/* <WorkerSection onSelect={(worker) => {
                    setSelectedWorker(worker);
                    setIsNewWorker(false);
                    setWorkerForm({
                      name: worker.name || "",
                      fathers_name: worker.fathers_name || "",
                      dob: worker.dob ? worker.dob.split("T")[0] : "",
                      phone_no: worker.phone_no || "",
                      employee_id: worker.employee_id || "",
                      aadhar_no: worker.aadhar_no || "",
                      gender: worker.gender || "Male",
                      designation: worker.designation || "",
                      contractor_name: worker.contractor_name || "",
                      date_of_joining: worker.date_of_joining ? worker.date_of_joining.split("T")[0] : "",
                    })
                  }} /> */}
                  <WorkerSection
                    search={workerSearch}
                    results={workerResults}
                    onSearch={searchWorkers}
                    onSelect={(worker) => {
                      setSelectedWorker(worker);
                      setIsNewWorker(false);
                      setWorkerForm({
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
                      setWorkerSearch("");
                      setWorkerResults([]);
                    }}
                  />

                  <button
                    disabled = {isEditingWorker}
                    onClick={() => {
                      setSelectedWorker(null);
                      setIsNewWorker(true);
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
                    className="w-1/5 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <FaUserPlus /> Add New Worker
                    </span>
                  </button>
                </div>


                {selectedWorker && !isNewWorker && !isEditingWorker && (
                  <div className="mt-2 bg-gray-800 p-3 rounded-lg w-full">
                    <div className="flex items-center justify-between gap-2">
                      <div className='flex items-center gap-2'>
                        <FaUser className='text-[16px] mb-2' /> <h3 className="font-bold mb-2 text-[16px]">WORKER DETAILS</h3>
                      </div>
                      <button
                        className="flex items-center gap-2 text-sm text-green-400"
                        onClick={() => setIsEditingWorker(true)}
                      >
                        <FaPenToSquare />
                        <p>Edit Worker</p>
                      </button>
                    </div>
                    <div className="col-span-3">
                      <p className='text-[14px]'><b>{selectedWorker.name}</b></p>
                    </div>
                    <p className='font-light text-gray-300 text-[12.5px]'>Employee ID: <b>{selectedWorker.employee_id}</b> | Father's Name: <b>{selectedWorker.fathers_name}</b> | ID: <b>{selectedWorker.id}</b> | Aadhaar: <b>{selectedWorker.aadhar_no}</b></p>
                    <p className='font-light text-gray-300 text-[12.5px]'>Phone No: <b>{selectedWorker.phone_no}</b> | DOB: <b>{formatDate(selectedWorker.dob)}</b></p>
                  </div>
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
                        setWorkerForm({
                          name: selectedWorker.name || "",
                          fathers_name: selectedWorker.fathers_name || "",
                          dob: selectedWorker.dob ? selectedWorker.dob.split("T")[0] : "",
                          phone_no: selectedWorker.phone_no || "",
                          employee_id: selectedWorker.employee_id || "",
                          aadhar_no: selectedWorker.aadhar_no || "",
                          gender: selectedWorker.gender || "Male",
                          designation: selectedWorker.designation || "",
                          contractor_name: selectedWorker.contractor_name || "",
                          date_of_joining: selectedWorker.date_of_joining
                            ? selectedWorker.date_of_joining.split("T")[0]
                            : ""
                        });
                      }}
                      className="bg-gray-600 px-3 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}


                <div className="flex flex-row-reverse items-center gap-2 w-full mt-2">
                  <select
                    className="w-2/8 p-1 bg-gray-700 rounded text-[12.5px]"
                    value={selectedDoctorId || ""}
                    disabled={user.role === "DOCTOR"}
                    onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                  >
                    <option value="">Select Treating Doctor</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} – {d.qualification}
                      </option>
                    ))}
                  </select>
                  <FaUserDoctor className="text-[13.5px]" />
                  {user.role === "DOCTOR" && (
                    <p className="text-xs text-gray-400 mt-1">
                      You are logged in as a doctor. Treating doctor cannot be changed.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <OPDSection opd={opd} setOpd={setOpd} onTemplateSelect={handleTemplateSelect} />
                  <PrescriptionSection prescription={prescription} setPrescription={setPrescription} />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={workerSearchLoading}
                  className="my-3 bg-green-600 hover:bg-green-700 p-2 rounded text-[14px] disabled:opacity-50"
                >
                  {workerSearchLoading ? "Saving..." : (
                    <span className="flex items-center gap-2">
                      <FaRegFloppyDisk />
                      Save OPD & Prescription
                    </span>

                  )}
                </button>
              </div>)}
          </>)}
        {activeMenu === "reports" && (
          <Reports />
        )}
        {activeMenu === "doctors" && (
          <Doctor />
        )}
        {activeMenu === "profile" && (
          <Profile />
        )}
        {activeMenu === "staff" && (
          <Staff />
        )}
        {activeMenu === "pre-emp" && (
          <PreEmployment />
        )}

        {activeMenu === "id-renew" && (
          <IdRenewal />
        )}
      </div>
    </>
  );
}

export default App;
