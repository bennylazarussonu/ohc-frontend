import DataEntry from "./DataEntry";
import ExaminationParameters from "./ExaminationParameters";
import PreEmploymentReports from "./PreEmploymentReports";
import { useState } from "react";
function PreEmployment() {
  const [tab, setTab] = useState("entry");

  const [form, setForm] = useState({
    name: "",
    employee_id: "",
    fathers_name: "",
    aadhar_no: "",
    gender: "MALE",
    dob: "",
    phone_no: "",
    designation: "",
    contractor_name: "",
    date_of_joining: "",
    identification_marks: "",
    residence: ""
  });

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4 bg-gray-800 p-2 rounded">
        {["entry", "exam", "reports"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`w-1/2 rounded transition w-full text-sm py-1 font-semibold ${
              tab === t ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            {t === "entry" && "Candidate Data Entry"}
            {t === "exam" && "Examination Parameters"}
            {t === "reports" && "Reports"}
          </button>
        ))}
      </div>

      {tab === "entry" && <DataEntry form={form} setForm={setForm}/>}
      {tab === "exam" && <ExaminationParameters />}
      {tab === "reports" && <PreEmploymentReports />}
    </div>
  );
}

export default PreEmployment;
