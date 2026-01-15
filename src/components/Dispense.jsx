import { useState, useEffect } from "react";
import api from "../api/axios";
import { formatDateDMY } from "../utils/date";

function Dispense(){
    const [opdData, setOpdData] = useState([]);
    console.log(opdData);
    
    const fetchOPDs = async () => {
        const res = await api.get("/api/dispense/opds");
        setOpdData(res.data.data);
    }

    useEffect( () => {
        fetchOPDs();
    }, []);
    return (
        <div className="w-full">
            <div className="bg-gray-800 my-3 rounded-lg p-4 w-full">
                <p className="font-semibold mb-2 text-xs">SELECT AN OPD TO FILL PRESCRIPTION</p>
                <div className="w-full">
                    <table className="border w-full text-sm">
                        <thead className="border bg-gray-900">
                            <tr className="border">
                                <th className="border">OPD ID</th>
                                <th className="border">Worker Name</th>
                                <th className="border">Employee ID</th>
                                <th className="border">Designation</th>
                                <th className="border">Contractor Name</th>
                                <th className="border">Presenting Complaint</th>
                                <th className="border">OPD Date</th>
                                <th className="border">Fill Prescription</th>
                            </tr>
                        </thead>
                        <tbody className="border">
                            {opdData.map(opd => (
                                <tr className="border">
                                    <td className="border">{opd.id}</td>
                                    <td className="border">{opd.worker.name}</td>
                                    <td className="border">{opd.worker.employee_id}</td>
                                    <td className="border">{opd.worker.designation}</td>
                                    <td className="border">{opd.worker.contractor_name}</td>
                                    <td className="border">{opd.presenting_complaint}</td>
                                    <td className="border">{formatDateDMY(opd.created_at)}</td>
                                    <td className="border">

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
        </div>
    );
}

export default Dispense;