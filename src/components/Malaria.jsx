import { FaMagnifyingGlass } from "react-icons/fa6";
import { useState, useEffect } from "react";
import api from "../api/axios";
import MalariaModal from "./MalariaModal";
import { formatDateDMY } from "../utils/date";
import malaria_top from "../assets/malaria_top.png";
import malaria_bottom from "../assets/malaria_bottom.png";
import malaria_table from "../assets/malaria_table.png";

function Malaria(){
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [search, setSearch] = useState("");

    const filteredWorkers = workers.filter(worker => {
  const term = search.toLowerCase();

  return (
    worker.name?.toLowerCase().includes(term) ||
    worker.fathers_name?.toLowerCase().includes(term) ||
    worker.aadhar_no?.includes(term) ||
    worker.phone_no?.includes(term) ||
    worker.contractor_name?.toLowerCase().includes(term) ||
    worker.id?.toString().includes(term)
  );
});

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const res = await api.get("/api/malaria/workers/all");
                setWorkers(res.data);
            }catch(err){
                console.error(err);
            }
        }
        fetchWorkers();
    }, []);

    return (
        <div className="bg-gray-800 p-6 w-full rounded-xl overflow-auto no-scrollbar">
            <h2 className="text-lg font-bold mb-3">Malaria Test</h2>

            <div className="flex items-center gap-2 mb-4">
                <FaMagnifyingGlass />
                <input
  type="text"
  placeholder="Search..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="text-sm bg-gray-700 rounded p-2 w-full"
/>
            </div>
            

            {workers.length > 0 && (
                <table className="w-full text-sm border">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Fathers Name</th>
                            <th className="p-2 border">Aadhar No</th>
                            <th className="p-2 border">Date of Birth</th>
                            <th className="p-2 border">Phone Number</th>
                            <th className="p-2 border">Contractor Name</th>
                            <th className="p-2 border">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWorkers.map((worker) => (
                            <tr key={worker.id}>
                                <td className="p-2 border">{worker.id}</td>
                                <td className="p-2 border">{worker.name}</td>
                                <td className="p-2 border">{worker.fathers_name}</td>
                                <td className="p-2 border">{worker.aadhar_no}</td>
                                <td className="p-2 border">{worker.dob}</td>
                                <td className="p-2 border">{worker.phone_no}</td>
                                <td className="p-2 border">{worker.contractor_name}</td>
                                <td className="p-2 border">
                                    <button
  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
  onClick={() => setSelectedWorker(worker)}
>
  Select for Test
</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {selectedWorker && (
  <MalariaModal
    worker={selectedWorker}
    onClose={() => setSelectedWorker(null)}
  />
)}
            
        </div>
    );
}

export default Malaria;