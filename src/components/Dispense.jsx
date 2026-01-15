import { useState, useEffect } from "react";
import api from "../api/axios";
import { formatDateDMY } from "../utils/date";
import { FaPills, FaXmark} from "react-icons/fa6";
import FillPrescriptionModal from "./FillPrescriptionModal.jsx";

function Dispense(){
    const [opdData, setOpdData] = useState([]);
    const [selectedOpd, setSelectedOpd] = useState({});
    const [fillPrescriptionModalOpen, setFillPrescriptionModalOpen] = useState(false);
    // console.log(opdData);
    const [nameFilter, setNameFilter] = useState("");
const [complaintFilter, setComplaintFilter] = useState("");
const today = new Date().toISOString().split("T")[0];

const [fromDate, setFromDate] = useState(today);
const [toDate, setToDate] = useState(today);


    
    const fetchOPDs = async () => {
        const res = await api.get("/api/dispense/opds");
        setOpdData(res.data.data);
    }

    useEffect( () => {
        fetchOPDs();
    }, []);

    const filteredOpds = opdData.filter(opd => {
  const workerNameMatch =
    opd.worker.name.toLowerCase().includes(nameFilter.toLowerCase());

  const complaintMatch =
    opd.presenting_complaint
      ?.toLowerCase()
      .includes(complaintFilter.toLowerCase());

  const opdDate = new Date(opd.created_at)
  .toLocaleDateString("en-CA"); // YYYY-MM-DD in local time


  const dateMatch =
    (!fromDate || opdDate >= fromDate) &&
    (!toDate || opdDate <= toDate);

  return workerNameMatch && complaintMatch && dateMatch;
});


    return (
        <div className="w-full">
            <div className="bg-gray-800 my-3 rounded-lg p-4 w-full">
                <p className="font-semibold mb-2 text-xs">SELECT AN OPD TO FILL PRESCRIPTION</p>
                <div className="flex flex-wrap gap-3 mb-3">
  <input
    type="text"
    placeholder="Search by Worker Name"
    value={nameFilter}
    onChange={(e) => setNameFilter(e.target.value)}
    className="bg-gray-700 rounded px-2 py-1 text-xs w-48"
  />

  <input
    type="text"
    placeholder="Search by Presenting Complaint"
    value={complaintFilter}
    onChange={(e) => setComplaintFilter(e.target.value)}
    className="bg-gray-700 rounded px-2 py-1 text-xs w-64"
  />

  <input
  type="date"
  value={fromDate}
  onChange={(e) => setFromDate(e.target.value)}
  className="bg-gray-700 rounded px-2 py-1 text-xs"
/>

<span className="text-xs text-gray-400 self-center">to</span>

<input
  type="date"
  value={toDate}
  onChange={(e) => setToDate(e.target.value)}
  className="bg-gray-700 rounded px-2 py-1 text-xs"
/>


  <button
    className="bg-gray-600 px-3 py-1 rounded text-xs"
    onClick={() => {
  setNameFilter("");
  setComplaintFilter("");
  setFromDate(today);
  setToDate(today);
}}

  >
    Reset
  </button>
</div>

                <div className="w-full">
                    <table className="border w-full text-sm">
                        <thead className="border bg-gray-900">
                            <tr className="border">
                                <th className="border">OPD ID</th>
                                <th className="border">Employee ID</th>
                                <th className="border">Worker Name</th>
                                <th className="border">Designation</th>
                                {/* <th className="border">Contractor Name</th> */}
                                <th className="border">Presenting Complaint</th>
                                <th className="border">OPD Date</th>
                                <th className="border">Fill Prescription</th>
                            </tr>
                        </thead>
                        <tbody className="border">
                            {filteredOpds.map(opd => (
                                <tr key={opd.id} className="border">
                                    <td className="border">{opd.id}</td>
                                    <td className="border">{opd.worker.employee_id}</td>
                                    <td className="border">{opd.worker.name}</td>
                                    <td className="border">{opd.worker.designation}</td>
                                    {/* <td className="border">{opd.worker.contractor_name}</td> */}
                                    <td className="border">{opd.presenting_complaint}</td>
                                    <td className="border">{formatDateDMY(opd.created_at)}</td>
                                    <td className="border p-2">
                                        <button 
                                            className="bg-green-600 rounded p-1 gap-2 text-xs flex items-center"
                                            onClick={() => {setSelectedOpd(opd);setFillPrescriptionModalOpen(true)}}
                                        >
                                            <FaPills/>
                                            Fill Prescription
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* {opdData.map((opd) => (
                    <></>
                ))} */}
            </div>
            {fillPrescriptionModalOpen && (
                <FillPrescriptionModal record={selectedOpd} onClose={() => {
                    setSelectedOpd({});
                    setFillPrescriptionModalOpen(false);
                }}/>
            )}
        </div>
    );
}

export default Dispense;