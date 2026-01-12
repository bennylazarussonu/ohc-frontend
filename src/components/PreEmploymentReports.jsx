import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaArrowLeft, FaCircleArrowLeft, FaFilePdf } from "react-icons/fa6";
import PreEmploymentReportModal from "./PreEmploymentReportModal";

function PreEmploymentReports() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState({});
  const [reportModal, setReportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tab, setTab] = useState("on-going");

  const getLocalDateOnly = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const getTodayLocalDateString = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD (what <input type="date" /> expects)
};



  const fetchRecords = async (currentTab) => {
    setLoading(true);

    let url = "/api/pre-employment/completed";
    if (currentTab === "fit") url = "/api/pre-employment/fit";
    if (currentTab === "unfit") url = "/api/pre-employment/unfit";

    const res = await api.get(url);
    setRecords(res.data);

    setLoading(false);
  };

  const filteredRecords = records.filter(r => {
  const q = searchTerm.toLowerCase();

  // ---------- TEXT FILTER ----------
  const matchesText =
    !q ||
    String(r.name || "").toLowerCase().includes(q) ||
    String(r.aadhar_no || "").toLowerCase().includes(q) ||
    String(r.fathers_name || "").toLowerCase().includes(q) ||
    String(r.id || "").toLowerCase().includes(q);

  // ---------- DATE FILTER (LOCAL DAY SAFE) ----------
  const recordDate = getLocalDateOnly(new Date(r.date_of_examination));

  const fromOk = fromDate
  ? recordDate >= getLocalDateOnly(new Date(fromDate))
  : true;

const toOk = toDate
  ? recordDate <= getLocalDateOnly(new Date(toDate))
  : true;


  return matchesText && fromOk && toOk;
});




  useEffect(() => {
  fetchRecords(tab);

  // Apply default "today" filter ONLY for fit/unfit
  if ((tab === "fit" || tab === "unfit") && !fromDate && !toDate) {
    const today = getTodayLocalDateString();
    setFromDate(today);
    setToDate(today);
  }else if(tab === "on-going"){
    setFromDate("");
    setToDate("");
  }
}, [tab]);

  const handleReturn = async (record) => {
    record.preemployment_id = record.id;
    const res = await api.put("/api/pre-employment/send-back", record);
    alert("Record Returned back to Examination Parameters");
    fetchRecords(tab);
  }


  const generateReport = (record) => {
    // 🔜 placeholder: later we’ll generate PDF
    alert(`Generate report for ${record.name} (ID: ${record.id})`);
  };

  return (
    <>
    <div className="w-full bg-gray-800 p-6 rounded-xl text-white">
      <h2 className="text-lg font-bold mb-4">
        PRE-EMPLOYMENT EXAMINATION REPORTS
      </h2>

      <div className="w-full flex gap-2 justify-center items-center">
        <div>
          <input 
            type="date" 
            className="px-2 py-1 text-sm bg-gray-700 rounded"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
          />
        </div>
        <div>
          <input 
            type="date" 
            className="px-2 py-1 text-sm bg-gray-700 rounded"
            value={toDate}
  onChange={e => setToDate(e.target.value)}
          />
        </div>
        <div className="w-full">
          <input 
            type="text" 
            className="w-full bg-gray-700 rounded px-2 py-1 text-sm" 
            placeholder="Search By Name / Aadhar / Fathers Name" 
            value={searchTerm}
  onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
        {tab !== "on-going" ? (
          <div className="flex justify-between">
          <p className="text-xs text-gray-400">* Default date filter set to show only todays Pre-Employment Examinations</p>
          <button className="text-sm text-blue-500" onClick={() => {
            setFromDate("")
            setToDate("")
          }}>Clear Date Filter</button>
          </div>
        ): ("")}
      
      <br />

      <div className="bg-gray-800 flex gap-2 rounded mb-2">
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
        <p className="text-gray-400">No Records</p>
      ) : (
        <div className="overflow-auto rounded">
          <div className="w-full flex justify-between">
            <p className="font-bold text-sm text-gray-400">Showing {filteredRecords.length} Records</p>
            <p className="font-bold text-sm text-gray-400">Total Records: {records.length}</p>
          </div>
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-900 sticky top-0">
              <tr>
                <th className="p-2 border w-[5%]">ID</th>
                <th className="p-2 border w-[25%]">Name</th>
                <th className="p-2 border w-[15%]">Aadhar</th>
                <th className="p-2 border w-[15%]">Status</th>
                <th className="p-2 border w-[10%]">Exam Date</th>
                <th className="p-2 border w-[20%]">Generate Report</th>
                <th className="p-2 border w-[10%]">Return Back</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((r) => (
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
                      <div>
                        <button
                      onClick={() => {
                        setSelectedCandidate(r)
                        setReportModal(true)}}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs flex items-center gap-2 mx-auto"
                    >
                      <FaFilePdf />
                      Generate Report
                    </button>
                      </div>
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
                  <td className="p-2 border text-center">
                    {tab === "on-going" && (
                    <button className="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-xs flex items-center gap-2 mx-auto"
                    onClick={() => {
                      handleReturn(r)
                    }}
                    >
                      <FaCircleArrowLeft/>
                      Return Back</button>
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
        <PreEmploymentReportModal 
        data={selectedCandidate} 
        onClose={() => {
          setReportModal(false)
          setSelectedCandidate({})
        }}
        onSuccess={() => {
          fetchRecords(tab);
        }}
        />
      )}
    </>
  );
}

export default PreEmploymentReports;
