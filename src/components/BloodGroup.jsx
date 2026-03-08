import api from "../api/axios";
import { useState, useEffect } from "react";
import { formatDateDMY } from "../utils/date";
function BloodGroup(){
    const [preEmploymentData, setPreEmploymentData] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
const [group, setGroup] = useState("");
const [rh, setRh] = useState("");
const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get("/api/pre-employment/empty-blood-group");
                setPreEmploymentData(response.data);
            } catch (error) {
                console.error("Error fetching pre-employment data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="w-full bg-gray-800 p-6 rounded-xl space-y-4">
            <h1 className="text-lg font-bold">BLOOD GROUP</h1>

            {preEmploymentData.length === 0 ? (
                <p className="text-sm text-gray-400">No data available.</p>
            ) : (
                <div className="space-y-2">
                    <table className="w-full text-sm border">
                        <thead className="bg-gray-900">
                            <tr>
                                <th className="p-2 border">ID</th>
                                <th className="p-2 border">Name</th>
                                <th className="p-2 border">Father's Name</th>
                                <th className="p-2 border">Aadhar</th>
                                <th className="p-2 border">Pre-Employment Examination Date</th>
                                <th className="p-2 border">Contractor Name</th>
                                <th className="p-2 border">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {preEmploymentData.map((item) => (
                                <tr key={item.id} className="bg-gray-700">
                                    <td className="p-2 border">{item.id}</td>
                                    <td className="p-2 border">{item.name}</td>
                                    <td className="p-2 border">{item.fathers_name}</td>
                                    <td className="p-2 border">{item.aadhar_no}</td>
                                    <td className="p-2 border">{item.contractor_name}</td>
                                    <td className="p-2 border">{formatDateDMY(item.date_of_examination)}</td>
                                    <td className="p-2 border">
                                        <button
  onClick={() => {
    setSelectedWorker(item);
    setShowModal(true);
  }}
  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
>
  Enter Blood Group
</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={async () => {
        await api.put("/api/workers/temp-blood");
        alert("Temporary blood field update successful");
      }}>Click</button>
                    {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    
    <div className="bg-gray-800 p-6 rounded-xl w-[400px] space-y-4">

      <h2 className="text-lg font-bold">Enter Blood Group</h2>

      <div className="text-sm space-y-1">
        <p><b>ID:</b> {selectedWorker.id}</p>
        <p><b>Name:</b> {selectedWorker.name}</p>
        <p><b>Father:</b> {selectedWorker.fathers_name}</p>
        <p><b>Aadhar:</b> {selectedWorker.aadhar_no}</p>
      </div>

      <div className="space-y-3">

        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
        >
          <option value="">Select Blood Group</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="AB">AB</option>
          <option value="O">O</option>
        </select>

        <select
          value={rh}
          onChange={(e) => setRh(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
        >
          <option value="">Select Rh Factor</option>
          <option value="POSITIVE">Positive</option>
          <option value="NEGATIVE">Negative</option>
        </select>

      </div>

      <div className="flex justify-end gap-3">

        <button
          onClick={() => setShowModal(false)}
          className="bg-gray-500 px-3 py-1 rounded"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            await api.put(`/api/pre-employment/blood-group/${selectedWorker.id}`, {
              group,
              rh_factor: rh
            });

            setShowModal(false);

            const res = await api.get("/api/pre-employment/empty-blood-group");
            setPreEmploymentData(res.data);
          }}
          className="bg-green-500 px-3 py-1 rounded"
        >
          Save
        </button>

      </div>
      
    </div>
  </div>
)}
                    {/* {preEmploymentData.map((item) => (
                        <div key={item.id} className="bg-gray-700 p-4 rounded-lg">
                            <p className="text-sm text-gray-300">Name: {item.name}</p>
                            <p className="text-sm text-gray-300">Blood Group: {item.blood_group}</p>
                        </div>
                    ))} */}
                </div>
            )}
        </div>
    );
}

export default BloodGroup;