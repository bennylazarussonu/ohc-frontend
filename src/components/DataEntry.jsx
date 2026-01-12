import { useState, useRef } from "react";
import api from "../api/axios";
import { FaFloppyDisk } from "react-icons/fa6";

function DataEntry({form, setForm}) {
  const dobRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [dobFocus, setDobFocus] = useState(false);
  const [dojFocus, setDojFocus] = useState(false);

  const handleChange = (e) => {
    let { name, value } = e.target;
  setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name) {
      alert("Name is required");
      return;
    }

    if(!form.designation){
      alert("Designation is required");
      return;
    }

    if(!form.identification_marks){
      alert("Identification Mark is required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        identification_marks: form.identification_marks
          ? form.identification_marks.split(",").map(s => s.trim())
          : []
      };

      await api.post("/api/pre-employment/add", payload);

      alert("Pre-employment record created (Status: On-Going)");

      // reset form
      setForm({
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

    } catch (err) {
      console.error(err);
      alert("Failed to save worker data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-800 p-6 rounded-xl space-y-4">
      <h2 className="text-lg font-bold">CANDIDATE DATA ENTRY</h2>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <input
          name="name"
          placeholder="Name *"
          className="p-2 bg-gray-700 rounded"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="employee_id"
          placeholder="Employee ID"
          className="p-2 bg-gray-700 rounded"
          value={form.employee_id}
          onChange={handleChange}
        />

        <input
          name="fathers_name"
          placeholder="Father's Name"
          className="p-2 bg-gray-700 rounded"
          value={form.fathers_name}
          onChange={handleChange}
        />

        <input
          name="aadhar_no"
          placeholder="Aadhar No"
          className="p-2 bg-gray-700 rounded"
          value={form.aadhar_no}
          onChange={handleChange}
        />

        <select
          name="gender"
          className="p-2 bg-gray-700 rounded"
          value={form.gender}
          onChange={handleChange}
        >
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>

        <input
  type={dobFocus ? "date" : "text"}
  name="dob"
  placeholder="Date of Birth"
  className="p-2 bg-gray-700 rounded text-white"
  value={form.dob}
  onFocus={() => setDobFocus(true)}
  // onBlur={() => setDobFocus(false)}
  onChange={handleChange}
/>


        <input
          name="phone_no"
          placeholder="Phone No"
          className="p-2 bg-gray-700 rounded"
          value={form.phone_no}
          onChange={handleChange}
        />

        <input
          name="designation"
          placeholder="Designation"
          className="p-2 bg-gray-700 rounded"
          value={form.designation}
          onChange={handleChange}
        />

        <input
          name="contractor_name"
          placeholder="Contractor Name"
          className="p-2 bg-gray-700 rounded"
          value={form.contractor_name}
          onChange={handleChange}
        />

        <input
        type={dojFocus ? "date" : "text"}
          name="date_of_joining"
          placeholder="Date of Joining"
          className="p-2 bg-gray-700 rounded"
          value={form.date_of_joining}
          onFocus={() => setDojFocus(true)}
  // onBlur={() => setDojFocus(false)}
          onChange={handleChange}
        />

        <input 
          name="residence"
          placeholder="Residence"
          type="text"
          className="p-2 bg-gray-700 rounded"
          value={form.residence}
          onChange={handleChange}
        />

        <input
          name="identification_marks"
          placeholder="Identification Marks (comma separated)"
          className="p-2 bg-gray-700 rounded col-span-3"
          value={form.identification_marks}
          onChange={handleChange}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm flex items-center gap-2 disabled:opacity-50"
      >
        <FaFloppyDisk />
        {loading ? "Saving..." : "Save & Start Examination"}
      </button>

      <p className="text-xs text-gray-400">
        Status will be set to <b>On-Going</b> automatically.
      </p>
    </div>
  );
}

export default DataEntry;
