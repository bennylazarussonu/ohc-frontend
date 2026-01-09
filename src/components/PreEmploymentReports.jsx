import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaFilePdf } from "react-icons/fa6";
import PreEmploymentReportModal from "./PreEmploymentReportModal";

function PreEmploymentReports() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState({});
  const [reportModal, setReportModal] = useState(false);
  const [tab, setTab] = useState("on-going");

  const fetchRecords = async (currentTab) => {
  setLoading(true);

  let url = "/api/pre-employment/completed";
  if (currentTab === "fit") url = "/api/pre-employment/fit";
  if (currentTab === "unfit") url = "/api/pre-employment/unfit";

  const res = await api.get(url);
  setRecords(res.data);

  setLoading(false);
};


  // const fetchCompleted = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await api.get("/api/pre-employment/completed");
  //     setRecords(res.data);
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to load completed examinations");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    fetchRecords(tab);
  }, [tab]);

  const generateReport = (record) => {
    // 🔜 placeholder: later we’ll generate PDF
    alert(`Generate report for ${record.name} (ID: ${record.id})`);
  };

  return (
    <>
    <div className="w-full bg-gray-800 p-6 rounded-xl text-white">
      <h2 className="text-lg font-bold mb-4">
        Pre-Employment Examination Reports
      </h2>

      <div className="bg-gray-800 flex gap-2 p-2 rounded">
        {[
          ["on-going", "bg-yellow-600", "text-yellow-500"], 
          ["fit", "bg-green-700", "text-green-300"], 
          ["unfit", "bg-red-700", "text-red-300"]
        ].map(([t, bgColor, textColor]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`w-1/2 rounded transition w-full text-sm py-1 font-semibold ${
              (tab === t) ? `${bgColor} text-white` : `bg-gray-700 ${textColor}`
            }`}
          >
            {t === "on-going" && "Pending"}
            {t === "fit" && "Declared Fit"}
            {t === "unfit" && "Declared Unfit"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">Loading reports...</p>
      ) : records.length === 0 ? (
        <p className="text-gray-400">No completed examinations yet.</p>
      ) : (
        <div className="overflow-auto border border-gray-700 rounded">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-900 sticky top-0">
              <tr>
                <th className="p-2 border w-[5%]">ID</th>
                <th className="p-2 border w-[25%]">Name</th>
                <th className="p-2 border w-[15%]">Aadhar</th>
                <th className="p-2 border w-[15%]">Status</th>
                <th className="p-2 border w-[20%]">Exam Date</th>
                <th className="p-2 border w-[20%]">Action</th>
              </tr>
            </thead>

            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="odd:bg-gray-700 even:bg-gray-800">
                  <td className="p-2 border">{r.id}</td>
                  <td className="p-2 border">{r.name}</td>
                  <td className="p-2 border">{r.aadhar_no || "-"}</td>
                  <td className="p-2 border">
                    <span className={`${(r.status === "On-Going") ? ("text-yellow-400"): (r.status === "Declared Fit" ? ("text-green-400"): ("text-red-400"))} font-semibold`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-2 border">
                    {new Date(r.date_of_examination).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-2 border text-center">
                    {tab === "on-going" && (
                      <button
                      onClick={() => {
                        setSelectedCandidate(r)
                        setReportModal(true)}}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs flex items-center gap-2 mx-auto"
                    >
                      <FaFilePdf />
                      Generate Report
                    </button>
                    )}
                    {(tab == "fit" || tab === "unfit") && (
                      <button
                      onClick={() => {
                        setSelectedCandidate(r)
                        setReportModal(true)}}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs flex items-center gap-2 mx-auto"
                    >
                      <FaFilePdf />
                      View Report
                    </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
    </div>
    {reportModal && (
        <PreEmploymentReportModal data={selectedCandidate} onClose={() => {
          setReportModal(false)
          setSelectedCandidate({})
          fetchCompleted()
        }}/>
      )}
    </>
  );
}

export default PreEmploymentReports;
