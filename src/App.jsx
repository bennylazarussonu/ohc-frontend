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
import Dashboard from "./components/Dashboard.jsx";
import Procurement from './components/Procurement.jsx';
import BUListUpload from './components/BUListUpload.jsx';
import Stock from './components/Stock.jsx';
import Dispense from './components/Dispense.jsx';
import OPDReportList from "./components/OPDReportList.jsx";
import OPDConsultation from './components/OPDConsultation.jsx';
import OpeningStock from "./components/OpeningStock.jsx";

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
  const [dispensaryTab, setDispensaryTab] = useState("dispense");
  const [opdTab, setOpdTab] = useState("new"); // "new" | "reports"
  const [editingOpdId, setEditingOpdId] = useState(null);
  const [editingFromReports, setEditingFromReports] = useState(false);
  const [opdListVersion, setOpdListVersion] = useState(0);
  const [editingFromConsultation, setEditingFromConsultation] = useState(false);
  const isEditing = !!editingOpdId;
  const hasDoctorInRecord = !!opd?.treating_doctor_id;
  // const [forConsultation, setForConsultation] = useState(false);
  console.log(user);



  // const isLegacyOpd = editingOpdId && !opd?.treating_doctor_id;

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
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

        if (
  user.role === "DOCTOR" &&
  matchedDoctor &&
  (opdTab === "new" || editingFromConsultation)
) {
  setSelectedDoctorId(matchedDoctor.id);
}


      }
    });
  }, [user, opdTab, editingFromConsultation]);


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

  const validateOPDSubmission = () => {
    if (!selectedWorker && !isNewWorker) {
      alert("Please select a worker or add a new worker");
      return false;
    }

    // already computed globally
if (!effectiveDoctorId) {
  alert("Please select a treating doctor");
  return false;
}


    // if (!effectiveDoctorId) {
    //   alert("Please select a treating doctor");
    //   return false;
    // }




    if (!opd.presenting_complaint || opd.presenting_complaint.trim() === "") {
      alert("Presenting complaint is required");
      return false;
    }

    if (!opd.weight || opd.weight.trim() === "") {
      alert("Weight is required");
      return false;
    }

    return true;
  };

  const handleEditOpd = async (opdId, source = "reports") => {
    try {
    const res = await api.get(`/api/opds/${opdId}/full`);
    const opdData = res.data.opd;

    setOpd(opdData);
    setPrescription(res.data.prescriptions);

    const workerRes = await api.get(`/api/workers/${opdData.worker_id}`);
    setSelectedWorker(workerRes.data);

    // 🔑 Consultation logic
    if (source === "consultation") {
  setEditingFromConsultation(true);
  setEditingFromReports(false);
  setOpdTab("consultation");

  if (user.role === "DOCTOR") {
    const myDoctor = doctors.find(d =>
      d.name.toLowerCase().includes(user.userId.toLowerCase())
    );
    if (!myDoctor) {
      alert("Doctor profile not linked");
      return;
    }
    setSelectedDoctorId(myDoctor.id);
  } else {
  setSelectedDoctorId(opdData.treating_doctor_id ?? null);
}

}
 else {
      // Reports edit
      setEditingFromReports(true);
      setEditingFromConsultation(false);
      setSelectedDoctorId(opdData.treating_doctor_id || null);
      setOpdTab("reports");
    }

    setEditingOpdId(opdId);
    setIsNewWorker(false);
    setIsEditingWorker(false);
  } catch (err) {
    console.error(err);
    alert("Failed to load OPD");
  }
  };

  const handleSubmit = async (forConsultation = false) => {
    try {
      const isEditMode = !!editingOpdId;
      if (!validateOPDSubmission()) return;

      if (isEditingWorker) {
        alert("Finish editing worker before saving OPD");
        return;
      }

      // if (!selectedWorker) {
      //   alert("Please select a worker");
      //   return;
      // }
      // console.log(selectedDoctorId)
      // const saveWorkerIfNew = async () => {
      //   if (selectedWorker) return selectedWorker;

      //   const res = await api.post("/api/workers", workerForm);
      //   return res.data; // newly created worker
      // };

      // if(!selectedDoctorId){
      //   alert("Please select a Doctor");
      //   return;
      // }


      // if (!opd.presenting_complaint) {
      //   alert("Presenting complaint is required");
      //   return;
      // }

      // if(!opd.weight){
      //   alert("Weight is required");
      //   return;
      // }

      setworkerSearchLoading(true);
      const worker = selectedWorker || await saveWorkerIfNew();
      const doctorId = effectiveDoctorId;
      const case_dealt_by = {
        role: user.role,
        userId: user.userId
      }
      let status = "Finished";

      if (!editingFromConsultation && forConsultation) {
        status = "For Consultation";
      }


      const opdPayload = {
        worker_id: worker.id ? Number(worker.id) : undefined,
        treating_doctor_id: doctorId,
        presenting_complaint: opd["presenting_complaint"],
        exam_findings_and_clinical_notes: opd["exam_findings_and_clinical_notes"],
        weight: opd["weight"],
        temperature: opd["temperature"],
        heart_rate: opd.heart_rate ? Number(opd.heart_rate) : undefined,
        blood_pressure: opd["blood_pressure"],
        spo2: opd.spo2 ? Number(opd.spo2) : undefined,
        diagnosis: opd["diagnosis"],
        investigations_recommended: opd["investigations_recommended"],
        further_advice: opd["further_advice"],
        referral_advice: opd["referral_advice"],
        case_dealt_by,
        status
      };

      let opdId;

      if (editingOpdId) {
        // 📝 UPDATE OPD
        const editedOPD = await api.put(`/api/opds/${editingOpdId}`, opdPayload);
        opdId = editingOpdId;
        opdPayload.created_at = editedOPD.data.created_at;

        // 🔁 Replace prescriptions
        await api.put(`/api/prescriptions/opd/${editingOpdId}`, prescription.map(row => ({
          opd_id: editingOpdId,
          worker_id: worker.id,
          medicine_id: row.medicine_id,
          drug_name_and_dose: row.drug_name_and_dose,
          route_of_administration: row.route_of_administration,
          frequency: row.frequency,
          brand: row.brand,
          days: row.days ? Number(Math.abs(row.days)) : 0
        })));

        alert("OPD updated successfully");
        setEditingOpdId(null);
        // setOpdTab("reports");
        setEditingFromReports(false);setEditingFromConsultation(false);

        setOpd({});
        setPrescription([]);
        setSelectedWorker(null);
        setOpdTab("reports")
        setOpdListVersion(v => v + 1);
        setLatestReportData({
          worker,
          opd: {
            ...opdPayload,
            id: editingOpdId,
            treating_doctor_id: selectedDoctorId || opd.treating_doctor_id
          },
          prescription,
          doctor: doctors.find(d =>
            d.id === (selectedDoctorId || opd.treating_doctor_id)
          )
        });
        setOpdTab("new");

      } else {
        // ➕ CREATE OPD
        const opdRes = await api.post("/api/opds/add", opdPayload);
        opdId = opdRes.data.id;
        opdPayload.created_at = opdRes.data.created_at;

        if (prescription.length > 0) {
          await api.post("/api/prescriptions/add", prescription.map(row => ({
            opd_id: opdId,
            worker_id: worker.id,
            medicine_id: row.medicine_id,
            drug_name_and_dose: row.drug_name_and_dose,
            route_of_administration: row.route_of_administration,
            frequency: row.frequency,
            brand: row.brand,
            days: row.days ? Number(Math.abs(row.days)) : 0
          })));
        }

        if(forConsultation){
          alert("OPD Saved and Set for Doctor's Consultation");
        }else{
          alert("OPD Saved Successfully");
        }
      }


      // const opdRes = await api.post("/api/opds/add", opdPayload);
      // const opdId = opdRes.data.id;

      // 2️⃣ Prepare prescription rows
      // if (prescription.length > 0) {
      //   const prescriptionPayload = prescription.map(row => ({
      //     opd_id: opdId,
      //     worker_id: worker.id,
      //     medicine_id: row.medicine_id, // if you store it
      //     drug_name_and_dose: row.drug_name_and_dose,
      //     route_of_administration: row.route_of_administration,
      //     frequency: row.frequency,
      //     brand: row.brand,
      //     days: (row.days) ? Number(Math.abs(row.days)) : 0
      //   }));

      //   // 3️⃣ Save prescriptions
      //   await api.post("/api/prescriptions/add", prescriptionPayload);
      // }

      // alert("OPD & prescriptions saved successfully");

      if (!isEditMode && !forConsultation) {
        setLatestReportData({
          worker,
          opd: { ...opdPayload, treating_doctor_id: selectedDoctorId },
          prescription,
          doctor: doctors.find(d => d.id === selectedDoctorId)
        });
      }



      // 4️⃣ Reset page
      if (!editingFromReports) {
        setOpd({});
        setPrescription([]);
        setSelectedWorker(null);
      }

      // setOpd({});
      // setPrescription([]);
      // setSelectedWorker(null);
      if (user?.role !== "DOCTOR") {
        setSelectedDoctorId(null);
      }
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

  const isDoctor = user?.role === "DOCTOR";
const isAdmin = user?.role === "ADMIN";
const isEmployee = user?.role === "EMPLOYEE";

const isNew = opdTab === "new" && !editingOpdId;
const isReportsEdit = editingFromReports;
const isConsultation = editingFromConsultation;

const effectiveDoctorId =
  isDoctor
    ? selectedDoctorId
    : selectedDoctorId ?? opd?.treating_doctor_id ?? null;


    const isDoctorSelectable = (() => {
  // DOCTOR: never selectable
  if (isDoctor){
    if(isReportsEdit && !opd.treating_doctor_id){ return true;}
    return false;
  }

  // ADMIN rules
  if (isAdmin) {
    if (isReportsEdit && (opd?.treating_doctor_id && (opd.treating_doctor_id !== null || opd.treating_doctor_id !== ""))) return false;
    return true;
  }

  // EMPLOYEE rules
  if (isEmployee) {
    return isNew;
  }

  return false;
})();


  const DoctorSelect = () => (
    <div className="flex flex-row-reverse items-center gap-2 w-full mt-2">
      <select
  className="w-2/8 p-1 bg-gray-700 rounded text-[12.5px]"
  value={effectiveDoctorId}
  disabled={!isDoctorSelectable}
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
    </div>
  );

  const resetNewOpd = () => {
  setEditingOpdId(null);
  setEditingFromConsultation(false);
  setEditingFromReports(false);

  setOpd({});
  setPrescription([]);
  setSelectedWorker(null);

  setIsNewWorker(false);
  setIsEditingWorker(false);

  setWorkerSearch("");
  setWorkerResults([]);

  setLatestReportData(null);

  if (user?.role !== "DOCTOR") {
    setSelectedDoctorId(null);
  }

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
};



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
            {user.role !== "EMPLOYEE" && (
              <div className="flex bg-gray-800 w-full  rounded p-2 gap-2 mb-3">

                <button
                  className={`px-3 w-1/3 py-1 rounded text-sm font-semibold ${opdTab === "new" ? "bg-blue-600" : "bg-gray-700"}`}
                  onClick={() => {
  resetNewOpd();
  setOpdTab("new");
}}

                >
                  New OPD
                </button>

                <button
                  className={`px-3 w-1/3 py-1 rounded text-sm font-semibold ${opdTab === "consultation" ? "bg-blue-600" : "bg-gray-700"}`}
                  onClick={() => {
  setOpdTab("consultation");
  setEditingOpdId(null);
  setEditingFromConsultation(false);
  setEditingFromReports(false);
}}

                >
                  For Consultation
                </button>


                <button
                  className={`px-3 w-1/3 rounded py-1 text-sm rounded font-semibold ${opdTab === "reports" ? "bg-blue-600" : "bg-gray-700"}`}
                  onClick={() => {
  setOpdTab("reports");
  setEditingOpdId(null);
  setEditingFromConsultation(false);
  setEditingFromReports(false);
}}

                >
                  Reports
                </button>
              </div>
            )}
            <div className="bg-gray-800 rounded-xl p-6 w-full">
              {opdTab === "reports" && user.role !== "EMPLOYEE" && !editingFromReports && (
                <OPDReportList onEdit={handleEditOpd} refreshKey={opdListVersion} />
              )}
              {opdTab === "reports" && user.role !== "EMPLOYEE" && editingFromReports && (
                <div className="w-full">
                  {/* Worker summary */}
                  <p className='flex items-center gap-2 text-lg font-bold'>
                    <FaPenToSquare />
                    Edit OPD
                  </p>
                  {selectedWorker && (
                    <div className="mt-2 bg-gray-900 p-3 rounded-lg w-full">
                      <h3 className="font-bold mb-2 text-[16px] flex items-center gap-2">
                        <FaUser /> WORKER DETAILS
                      </h3>
                      <p><b>{selectedWorker.name}</b></p>
                      <p className="text-xs text-gray-300">
                        Employee ID: <b>{selectedWorker.employee_id}</b> | ID: <b>{selectedWorker.id}</b>
                      </p>
                    </div>
                  )}

                  <DoctorSelect />

                  {/* OPD + Prescription */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <OPDSection opd={opd} setOpd={setOpd} />
                    <PrescriptionSection
                      prescription={prescription}
                      setPrescription={setPrescription}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => {handleSubmit(false)}}
                      className="bg-green-600 px-4 py-2 rounded"
                    >
                      <FaRegFloppyDisk /> Save Changes
                    </button>

                    <button
                      onClick={() => {
                        setEditingFromReports(false);
                        setEditingOpdId(null);
                        setOpd({});
                        setPrescription([]);
                        setSelectedWorker(null);
                        setOpdTab("reports");
                      }}
                      className="bg-gray-600 px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {opdTab === "consultation" && !editingFromConsultation && (
                <OPDConsultation
                  onEdit={(opdId) => {
                    // setEditingFromConsultation(true);
                    // setEditingFromReports(false);
                    handleEditOpd(opdId, "consultation");
                  }}
                  refreshKey={opdListVersion}
                />
              )}
              {opdTab === "consultation" && editingFromConsultation && (
  <div className="w-full">
    <p className="flex items-center gap-2 text-lg font-bold">
      <FaPenToSquare />
      Consultation
    </p>

    {selectedWorker && (
      <div className="mt-2 bg-gray-900 p-3 rounded-lg w-full">
        <h3 className="font-bold mb-2 text-[16px] flex items-center gap-2">
          <FaUser /> WORKER DETAILS
        </h3>
        <p><b>{selectedWorker.name}</b></p>
        <p className="text-xs text-gray-300">
          Employee ID: <b>{selectedWorker.employee_id}</b> | ID: <b>{selectedWorker.id}</b>
        </p>
      </div>
    )}

    <DoctorSelect />

    <div className="grid grid-cols-2 gap-4 mt-4">
      <OPDSection opd={opd} setOpd={setOpd} />
      <PrescriptionSection
        prescription={prescription}
        setPrescription={setPrescription}
      />
    </div>

    <div className="flex gap-3 mt-4">
      <button
        onClick={() => handleSubmit(false)} // doctor finishes consultation
        className="bg-green-600 px-4 py-2 rounded"
      >
        <FaRegFloppyDisk /> Finish Consultation
      </button>

      <button
        onClick={() => {
          setEditingFromConsultation(false);
          setEditingOpdId(null);
          setOpd({});
          setPrescription([]);
          setSelectedWorker(null);
          setOpdTab("consultation");
          setSelectedDoctorId(null);
        }}
        className="bg-gray-600 px-4 py-2 rounded"
      >
        Cancel
      </button>
    </div>
  </div>
)}


              {opdTab === "new" && (
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
                          disabled={!!editingOpdId}
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
                          disabled={isEditingWorker || !!editingOpdId}
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
                        <div className="mt-2 bg-gray-900 p-3 rounded-lg w-full">
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
                          <p className='font-light text-gray-300 text-[12.5px]'>Phone No: <b>{selectedWorker.phone_no}</b> | DOB: <b>{formatDate(selectedWorker.dob)}</b> | Contractor Name: <b>{selectedWorker.contractor_name}</b></p>
                        </div>
                      )}
                      {(isNewWorker || isEditingWorker) && (
                        <div className="mt-2 bg-gray-900 p-3 rounded-lg w-full">
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
                                  className="p-2 bg-gray-800 rounded w-full"
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
                              <span className='text-xs text-gray-300'>Gender</span>
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

                      {/* <div className="flex flex-row-reverse items-center gap-2 w-full mt-2">
                        <select
                          className="w-2/8 p-1 bg-gray-700 rounded text-[12.5px]"
                          value={selectedDoctorId || ""}
                          disabled={
  // Doctor handling consultation → locked to themselves
  (editingFromConsultation && user.role === "DOCTOR") ||

  // Historical report → doctor already fixed
  (editingFromReports && hasDoctorInRecord)
}



                          onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                        >
                          <option value="">Select a Treating Doctor</option>
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
                      </div> */}
                      <DoctorSelect/>
                      <div className="grid grid-cols-2 gap-4">
                        <OPDSection opd={opd} setOpd={setOpd} onTemplateSelect={handleTemplateSelect} />
                        <PrescriptionSection prescription={prescription} setPrescription={setPrescription} />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => 
                            handleSubmit(false)
                          }
                          disabled={workerSearchLoading}
                          className="my-3 bg-green-600 hover:bg-green-700 p-2 rounded text-[14px] disabled:opacity-50"
                        >
                          {workerSearchLoading ? "Saving..." : (
                            <span className="flex items-center gap-2">
                              <FaRegFloppyDisk />
                              Save OPD
                            </span>
                          )}
                        </button>
                        {user.role === "EMPLOYEE" && (
                          <button
                          onClick={() => {
                            handleSubmit(true)
                          }}
                          disabled={workerSearchLoading}
                          className="my-3 bg-green-600 hover:bg-green-700 p-2 rounded text-[14px] disabled:opacity-50"
                        >
                          {workerSearchLoading ? "Saving..." : (
                            <span className="flex items-center gap-2">
                              <FaRegFloppyDisk />
                              Save OPD & Set for Doctor's Consultation
                            </span>
                          )}
                        </button>
                        )}
                      </div>
                    </div>)}
                </>
              )}
            </div>
          </>
        )}

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
          <div className='w-full'>
            <div className="bg-gray-800 rounded p-2 flex justify-center gap-2">
              <div className="w-1/2 bg-blue-600 rounded p-1 font-semibold text-sm text-center">
                ID Renewal
              </div>
              <div className="w-1/2 bg-gray-700 rounded p-1 font-semibold text-sm text-center">
                List of Renewed IDs
              </div>
            </div>
            <IdRenewal />
          </div>
        )}
        {activeMenu === "dashboard" && (
          <Dashboard />
        )}
        {activeMenu === "opening-stock" && (
          <OpeningStock/>
        )}

        {activeMenu === "dispensary" && (
          // <BUListUpload/>
          <div className='w-full'>
            <div className="w-full flex bg-gray-800 p-2 rounded gap-2">
              <div className={`bg-gray-700 w-1/3 rounded `}>
                <button className={`text-sm p-1 text-center rounded font-semibold w-full ${dispensaryTab === "procurement" ? ("bg-blue-600") : ("")}`} onClick={() => setDispensaryTab("procurement")}>Procurement</button>
              </div>
              <div className="bg-gray-700 w-1/3 rounded">
                <button className={`text-sm p-1 text-center font-semibold w-full rounded ${dispensaryTab === "dispense" ? ("bg-blue-600") : ("")}`} onClick={() => setDispensaryTab("dispense")}>Dispense Medicine</button>
              </div>
              <div className="bg-gray-700 w-1/3 rounded">
                <button className={`text-sm p-1 text-center font-semibold w-full rounded ${dispensaryTab === "stock" ? ("bg-blue-600") : ("")}`} onClick={() => setDispensaryTab("stock")}>Stock</button>
              </div>
            </div>
            {dispensaryTab === "procurement" && (
              <div>
                <h2 className='text-sm font-bold mt-4'>PROCUREMENT</h2>
                <Procurement />
              </div>
            )}
            {dispensaryTab === "dispense" && (
              <div>
                <h2 className='text-sm font-bold mt-4'>DISPENSE</h2>
                <Dispense />
              </div>
            )}
            {dispensaryTab === "stock" && (
              <div>
                <h2 className='text-sm font-bold mt-4'>STOCK</h2>
                <Stock />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
