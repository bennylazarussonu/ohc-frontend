import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaHeartPulse, FaEye } from "react-icons/fa6";
import VitalsCheckModal from "./VitalsCheckModal";
import VisionCheckModal from "./VisionCheckModal";

function ExaminationParameters() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedWorkersVitals, setSelectedWorkerVitals] = useState(null);
  const [selectedWorkersVision, setSelectedWorkerVision] = useState(null);
  const [openVitals, setOpenVitals] = useState(false);
  const [openVision, setOpenVision] = useState(false);

  const fetchWorkerVitals = async (worker_id) => {
    try {
      const vitals = await api.get(`/api/pre-employment/vitals/${worker_id}`);
      setSelectedWorkerVitals(vitals.data.physical_parameters);
    }catch(err){
      console.error(err);
      console.log(err);
      alert("Failed to fetch Worker Vitals");
    }
  }

  const handleCancel = async (record) => {
    record.preemployment_id = record.id;
    const res = await api.put("/api/pre-employment/cancel", record);
    alert("Record Cancelled");
    fetchOnGoingWorkers();
  }

  const fetchWorkerVision = async (worker_id) => {
    try {
      const vision = await api.get(`/api/pre-employment/vision/${worker_id}`);
      setSelectedWorkerVision(vision.data.opthalmic_examination);
    }catch(err){
      console.error(err);
      console.log(err);
      alert("Failed to fetch Worker Vision");
    }
  }

  const fetchOnGoingWorkers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/pre-employment/on-going", {
        params: { status: "On-Going" }
      });
      setWorkers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch on-going examinations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnGoingWorkers();
  }, []);

  return (
    <div className="w-full bg-gray-800 p-6 rounded-xl">
      <h2 className="text-lg font-bold mb-4">EXAMINATION PARAMETERS</h2>

      {loading && <p className="text-sm text-gray-400">Loading...</p>}

      {!loading && workers.length === 0 && (
        <p className="text-sm text-gray-400">
          No on-going pre-employment examinations.
        </p>
      )}

      {workers.length > 0 && (
        <table className="w-full text-sm border">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Aadhar</th>
              <th className="p-2 border">Vitals</th>
              <th className="p-2 border">Vision</th>
              <th className="p-2 border">Cancel</th>
            </tr>
          </thead>
          <tbody>
            {workers.map(w => (
              <tr key={w.id} className="odd:bg-gray-700 even:bg-gray-800">
                <td className="p-2 border">{w.id}</td>
                <td className="p-2 border">{w.name}</td>
                <td className="p-2 border">{w.aadhar_no || "-"}</td>

                <td className="p-2 border text-center">
                  <button
                    onClick={() => {
                      fetchWorkerVitals(w.id);
                      setSelectedWorker(w);
                      setOpenVitals(true);
                    }}
                    className={`px-3 py-1 rounded text-xs flex items-center gap-2 mx-auto
                      ${w.physical_parameters?.status === "Done"
                        ? "bg-gray-400 bg-opacity-60 text-black"
                        : "bg-blue-600 hover:bg-blue-700"}
                    `}
                  >
                    <FaHeartPulse />
                    {w.physical_parameters?.status === "Done"
                      ? "Completed"
                      : "Vitals Check"}
                  </button>
                </td>

                <td className="p-2 border text-center">
                  <button
                    onClick={() => {
                      fetchWorkerVision(w.id)
                      setSelectedWorker(w);
                      setOpenVision(true);
                    }}
                    className={`px-3 py-1 rounded text-xs flex items-center gap-2 mx-auto
                      ${w.opthalmic_examination?.status === "Done"
                        ? "bg-gray-400 bg-opacity-60 text-black"
                        : "bg-purple-600 hover:bg-purple-700"}
                    `}
                  >
                    <FaEye />
                    {w.opthalmic_examination?.status === "Done"
                      ? "Completed"
                      : "Vision Check"}
                  </button>
                </td>
                <td className="p-2 border text-center">
                  <button className="px-3 py-1 rounded text-xs flex items-center gap-2 mx-auto bg-red-600 text-white"
                    onClick={() => handleCancel(w)}
                  >
                    <p className="font-bold">X</p> Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 🔜 Modals will be plugged here */}
      
        {openVitals && (
          <VitalsCheckModal
            vitals={selectedWorkersVitals}
            worker={selectedWorker}
            onClose={() => {
              setOpenVitals(false);
              fetchOnGoingWorkers();
            }}
          />
        )}

        {openVision && (
          <VisionCheckModal
            vision={selectedWorkersVision}
            worker={selectedWorker}
            onClose={() => {
              setOpenVision(false);
              fetchOnGoingWorkers();
            }}
          />
        )}
     
    </div>
  );
}

export default ExaminationParameters;
