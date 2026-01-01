import { useState } from "react";
import api from "../api/axios";

function SingleWorkerForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    employee_id: "",
    fathers_name: "",
    aadhar_no: "",
    gender: "MALE",
    dob: "",
    weight: "",
    phone_no: "",
    designation: "",
    contractor_name: "",
    date_of_joining: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        weight: form.weight ? Number(form.weight) : undefined,
        dob: form.dob || undefined,
        date_of_joining: form.date_of_joining || undefined
      };

      await api.post("/api/workers/add", payload);

      alert("Worker added successfully");

      setForm({
        name: "",
        employee_id: "",
        fathers_name: "",
        aadhar_no: "",
        gender: "MALE",
        dob: "",
        weight: "",
        phone_no: "",
        designation: "",
        contractor_name: "",
        date_of_joining: ""
      });

      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add worker");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl text-white">
      <h2 className="text-lg font-bold mb-4">Add New Worker</h2>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <input
          placeholder="Name *"
          className="p-2 bg-gray-700 rounded"
          value={form.name}
          onChange={e => handleChange("name", e.target.value)}
        />

        <input
          placeholder="Employee ID"
          className="p-2 bg-gray-700 rounded"
          value={form.employee_id}
          onChange={e => handleChange("employee_id", e.target.value)}
        />

        <input
          placeholder="Father's Name"
          className="p-2 bg-gray-700 rounded"
          value={form.fathers_name}
          onChange={e => handleChange("fathers_name", e.target.value)}
        />

        <input
          placeholder="Aadhaar No"
          className="p-2 bg-gray-700 rounded"
          value={form.aadhar_no}
          onChange={e => handleChange("aadhar_no", e.target.value)}
        />

        <select
          className="p-2 bg-gray-700 rounded"
          value={form.gender}
          onChange={e => handleChange("gender", e.target.value)}
        >
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>

        <div className="w-full">
          <input
          type="text"
          className="p-2 bg-gray-700 rounded w-full"
          value={form.dob}
          placeholder="Date of Birth"
          onFocus={(e) => e.target.type = "date"}
          onBlur={(e) => e.target.type = "text"}
          onChange={e => handleChange("dob", e.target.value)}
        />
        </div>
        

        <input
          placeholder="Weight (kg)"
          type="number"
          className="p-2 bg-gray-700 rounded"
          value={form.weight}
          onChange={e => handleChange("weight", e.target.value)}
        />

        <input
          placeholder="Phone No"
          className="p-2 bg-gray-700 rounded"
          value={form.phone_no}
          onChange={e => handleChange("phone_no", e.target.value)}
        />

        <input
          placeholder="Designation"
          className="p-2 bg-gray-700 rounded"
          value={form.designation}
          onChange={e => handleChange("designation", e.target.value)}
        />

        <input
          placeholder="Contractor Name"
          className="p-2 bg-gray-700 rounded"
          value={form.contractor_name}
          onChange={e => handleChange("contractor_name", e.target.value)}
        />

        <input
          type="text"
          className="p-2 bg-gray-700 rounded"
          value={form.date_of_joining}
          placeholder="Date of Joining"
          onBlur={e => e.target.type = "text"}
          onFocus={e => e.target.type = "date"}
          onChange={e => handleChange("date_of_joining", e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Worker"}
      </button>
    </div>
  );
}

export default SingleWorkerForm;
