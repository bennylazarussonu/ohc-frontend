import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaUserDoctor, FaPlus } from "react-icons/fa6";

function Doctor() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    name: "",
    qualification: "",
    designation: "",
    regn_no: ""
  });
  const [loading, setLoading] = useState(false);

  const fetchDoctors = async () => {
    const res = await api.get("/api/doctors");
    setDoctors(res.data);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async () => {
    if (!form.name || !form.regn_no) {
      alert("Name and Registration No are required");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/api/doctors/add", form);
      alert(`Doctor added!
Username: ${res.data.credentials.userId}
Password: doctor$123`);
      setForm({ name: "", qualification: "", designation: "", regn_no: "" });
      fetchDoctors();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to add doctor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">

      {/* ADD NEW DOCTOR */}
      <div className="bg-gray-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <FaPlus />
          <h2 className="font-bold text-lg">Add New Doctor</h2>
        </div>

        <div className="grid grid-cols-4 gap-3 text-sm">
          {[
            ["name", "Doctor Name"],
            ["qualification", "Qualification"],
            ["designation", "Designation"],
            ["regn_no", "Registration No"]
          ].map(([key, label]) => (
            <input
              key={key}
              placeholder={label}
              className="p-2 bg-gray-700 rounded"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          ))}
        </div>

        <button
          onClick={handleAddDoctor}
          disabled={loading}
          className="mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
        >
          {loading ? "Saving..." : "Add Doctor"}
        </button>
      </div>

      {/* LIST DOCTORS */}
      <div className="bg-gray-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <FaUserDoctor />
          <h2 className="font-bold text-lg">Doctors</h2>
        </div>

        <table className="w-full text-sm border">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Qualification</th>
              <th className="p-2 border">Designation</th>
              <th className="p-2 border">Regn No</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map(d => (
              <tr key={d.id} className="hover:bg-gray-700">
                <td className="p-2 border">{d.id}</td>
                <td className="p-2 border">{d.name}</td>
                <td className="p-2 border">{d.qualification}</td>
                <td className="p-2 border">{d.designation}</td>
                <td className="p-2 border">{d.regn_no}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {doctors.length === 0 && (
          <p className="text-gray-400 text-sm mt-3">No doctors added yet</p>
        )}
      </div>
    </div>
  );
}

export default Doctor;
