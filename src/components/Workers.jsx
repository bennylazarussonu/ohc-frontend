import { useState } from "react";
import * as XLSX from "xlsx";
import api from "../api/axios";
import SingleWorkerForm from "./SingleWorkerForm";
import { formatDateDMY } from "../utils/date";
import { useEffect } from "react";
import { FaMagnifyingGlass, FaTrash, FaRegPenToSquare, FaRegFloppyDisk, FaUserPlus } from "react-icons/fa6";

function BulkUpload() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState("single");
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingWorker, setEditingWorker] = useState(null);
  const [editForm, setEditForm] = useState({});


  const ITEMS_PER_PAGE = 10;


  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await api.get("/api/workers");
        setWorkers(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchWorkers();
  }, []);

  let filteredWorkers = [];

  if (search.trim() === "") {
    filteredWorkers = workers;
  } else {
    const parts = search
      .split(",")
      .map(p => p.trim())
      .map(p => p === "" ? null : p.toLowerCase());

    if (parts.length == 1) {
      const nameMatches = [];
      const empIdMatches = [];
      const fatherMatches = [];
      const aadharMatches = [];
      const phoneMatches = [];

      workers.forEach(w => {
        if (w.name?.toLowerCase().includes(parts[0])) {
          nameMatches.push(w);
        }
        else if (w.employee_id?.toLowerCase().includes(parts[0])) {
          empIdMatches.push(w);
        }
        else if (w.fathers_name?.toLowerCase().includes(parts[0])) {
          fatherMatches.push(w);
        }
        else if (w.aadhar_no?.includes(parts[0])) {
          aadharMatches.push(w);
        }
        else if (w.phone_no?.includes(parts[0])) {
          phoneMatches.push(w);
        }
      });

      filteredWorkers = [
        ...nameMatches,
        ...empIdMatches,
        ...fatherMatches,
        ...aadharMatches,
        ...phoneMatches
      ];
    } else if (parts.length > 1) {
      const [
        nameQ,
        empIdQ,
        fatherQ,
        aadharQ,
        phoneQ
      ] = parts;

      filteredWorkers = workers.filter(w => {
        if (nameQ && !w.name?.toLowerCase().includes(nameQ)) return false;
        if (empIdQ && !w.employee_id?.toLowerCase().includes(empIdQ)) return false;
        if (fatherQ && !w.fathers_name?.toLowerCase().includes(fatherQ)) return false;
        if (aadharQ && !w.aadhar_no?.includes(aadharQ)) return false;
        if (phoneQ && !w.phone_no?.includes(phoneQ)) return false;

        return true; // ✅ all provided conditions matched
      });
    }
  }

  const totalPages = Math.ceil(filteredWorkers.length / ITEMS_PER_PAGE);

  const paginatedWorkers = filteredWorkers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openEdit = (worker) => {
    setEditingWorker(worker);
    setEditForm({
      name: worker.name || "",
      employee_id: worker.employee_id || "",
      fathers_name: worker.fathers_name || "",
      aadhar_no: worker.aadhar_no || "",
      phone_no: worker.phone_no || "",
      designation: worker.designation || "",
      gender: worker.gender || "Male",
      dob: worker.dob ? worker.dob.split("T")[0] : "",
      weight: worker.weight || "",
      contractor_name: worker.contractor_name || "",
      date_of_joining: worker.date_of_joining ? worker.date_of_joining.split("T")[0] : ""
    });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/api/workers/${editingWorker._id}`, editForm);

      // Update UI without refetching everything
      setWorkers(prev =>
        prev.map(w =>
          w._id === editingWorker._id
            ? { ...w, ...editForm }
            : w
        )
      );

      setEditingWorker(null);
      alert("Worker updated successfully");
    } catch (err) {
      alert("Update failed");
    }
  };

  const confirmDelete = async (worker) => {
    if (!window.confirm(`Delete ${worker.name}? This cannot be undone.`)) return;

    try {
      await api.delete(`/api/workers/${worker._id}`);

      setWorkers(prev =>
        prev.filter(w => w._id !== worker._id)
      );

      alert("Worker deleted");
    } catch {
      alert("Delete failed");
    }
  };





  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setRows(jsonData);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/api/workers/bulk", formData);
      alert("Bulk upload successful");
      setRows([]);
      setFile(null);
    } catch {
      alert("Upload failed");
    }
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      {/* <div className="flex bg-gray-800 rounded mb-4 overflow-hidden p-2 gap-2">
        <button
          onClick={() => setTab("bulk")}
          className={`w-1/2 py-1 text-sm font-semibold transition rounded 
            ${tab === "bulk"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"}
          `}
        >
          Bulk Upload
        </button>

        <button
          onClick={() => setTab("single")}
          className={`w-1/2 py-1 text-sm font-semibold transition rounded
            ${tab === "single"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"}
          `}
        >
          <span className="flex justify-center items-center gap-1 text-sm">
            <FaUserPlus className="text-[15.5px]"/> 
            <p>Add New</p>
          </span>
        </button>

        <button
          onClick={() => setTab("list")}
          className={`w-1/2 py-1 text-sm font-semibold transition rounded
            ${tab === "list"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"}
          `}>All Workers</button>
      </div> */}

      {/* BULK UPLOAD */}
      {/* {tab === "bulk" && (
        <>
          <div className="p-6 bg-gray-800 text-white rounded-xl mb-3">
            <p className="text-lg font-bold mb-2">Bulk Upload Worker Data</p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
          </div>

          {rows.length > 0 && (
            <div className="p-6 bg-gray-800 text-white rounded-xl">
              <p className="text-lg font-bold mb-2">Preview</p>

              <div className="max-h-64 overflow-auto border border-gray-700 no-scrollbar">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-900 sticky top-0">
                    <tr>
                      {Object.keys(rows[0]).map((key) => (
                        <th key={key} className="p-2 border">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className="odd:bg-gray-600 even:bg-gray-700">
                        {Object.entries(row).map(([key, value], j) => (
                          <td key={j} className="p-2 border">
                            {key === "dob" || key === "date_of_joining"
                              ? formatExcelDate(value)
                              : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleUpload}
                className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
              >
                Upload Excel
              </button>
            </div>
          )}
        </>
      )} */}

      {/* SINGLE ENTRY (placeholder) */}
      {/* {tab === "single" && (
        <SingleWorkerForm />
      )} */}
          <div className="p-6 bg-gray-800 text-white w-full overflow-scroll no-scrollbar rounded-xl">
            <p className="text-lg font-bold mb-2">ALL WORKERS</p>
            {workers.length === 0
              ? "No workers found."
              : (
                <div className="w-full">

                  <div className="flex items-center gap-2">
                    <FaMagnifyingGlass className="text-[16px]" />
                    <input
                      className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
                      placeholder="Example: John, EMP123, ... (comma separated)"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1); // reset page on search
                      }}

                    />

                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-6 mb-4">Search in this order: Name, Emp. ID, Father's Name, Aadhar No., Phone No.</p>

                    <p className="text-right text-sm font-bold text-gray-400">10 records / page</p>
                  <div className="w-full flex items-center gap-2">
                    
                    <table className="w-full text-center border">
                      <thead className="bg-gray-900 sticky top-0">
                        <tr>
                          <th className="p-2 border">ID</th>
                          <th className="p-2 border">Name</th>
                          <th className="p-2 border">Emp. ID</th>
                          <th className="p-2 border">Fathers Name</th>
                          <th className="p-2 border">Aadhar</th>
                          <th className="p-2 border">Gender</th>
                          <th className="p-2 border">DoB</th>
                          <th className="p-2 border">Weight</th>
                          <th className="p-2 border">Phn. No.</th>
                          <th className="p-2 border">Action</th>
                          {/* <th>Designation</th>
                        <th>Contractor</th>
                        <th>DoJ</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedWorkers.map((worker) => (
                          <tr key={worker.id} className="">
                            <td className="p-1 border">{worker.id}</td>
                            <td className="p-1 border">{worker.name}</td>
                            <td className="p-1 border">{(worker.employee_id && worker.employee_id != 'undefined') ? worker.employee_id : ""}</td>
                            <td className="p-1 border">{worker.fathers_name ? worker.fathers_name : ""}</td>
                            <td className="p-1 border">{(worker.aadhar_no && worker.aadhar_no != "undefined") ? worker.aadhar_no : ""}</td>
                            <td className="p-1 border">{worker.gender ? worker.gender : ""}</td>
                            <td className="p-1 border">{worker.dob ? formatDateDMY(worker.dob) : ""}</td>
                            <td className="p-1 border">{worker.weight ? worker.weight : ""}</td>
                            <td className="p-1 border">{(worker.phone_no && worker.phone_no != "undefined") ? worker.phone_no : ""}</td>
                            <td className="p-2 border flex justify-center gap-3">
                              <button
                                onClick={() => openEdit(worker)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <FaRegPenToSquare />
                              </button>


                              <button
                                onClick={() => confirmDelete(worker)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 text-sm">

                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-4 py-1 bg-gray-700 rounded disabled:opacity-40"
                      >
                        ⬅ Previous
                      </button>

                      <span className="text-gray-300">
                        Page <b>{currentPage}</b> of <b>{totalPages}</b>
                      </span>

                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-4 py-1 bg-gray-700 rounded disabled:opacity-40"
                      >
                        Next ➡
                      </button>

                    </div>
                  )}


                </div>
              )}
          </div>
      {editingWorker && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-5 rounded-xl w-[600px]">
            <h3 className="text-lg font-bold mb-4">Edit Worker</h3>

            <div className="grid grid-cols-2 gap-3 text-sm">
              ID: {editingWorker.id}
              {[
                ["name", "Name"],
                ["employee_id", "Employee ID"],
                ["fathers_name", "Father's Name"],
                ["aadhar_no", "Aadhar No"],
                ["phone_no", "Phone No"],
                ["weight", "Weight"],
                ["designation", "Designation"],
                ["contractor_name", "Contractor Name"],
              ].map(([key, label]) => (
                <input
                  key={key}
                  placeholder={label}
                  className="p-2 bg-gray-700 rounded"
                  value={editForm[key]}
                  onChange={(e) =>
                    setEditForm({ ...editForm, [key]: e.target.value })
                  }
                />
              ))}

              <select
                className="p-2 bg-gray-700 rounded"
                value={editForm.gender}
                onChange={(e) =>
                  setEditForm({ ...editForm, gender: e.target.value })
                }
              >
                <option>MALE</option>
                <option>FEMALE</option>
                <option>OTHER</option>
              </select>

              <input
                type="date"
                className="p-2 bg-gray-700 rounded"
                value={editForm.dob}
                onChange={(e) =>
                  setEditForm({ ...editForm, dob: e.target.value })
                }
              />
              <input
                type="date"
                className="p-2 bg-gray-700 rounded"
                value={editForm.date_of_joining}
                onChange={(e) =>
                  setEditForm({ ...editForm, date_of_joining: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingWorker(null)}
                className="px-4 py-1 bg-gray-600 rounded"
              >
                Cancel
              </button>


              <button
                onClick={saveEdit}
                className="px-4 py-1 bg-green-600 rounded"
              >
                <div className="flex items-center gap-2">
                  <FaRegFloppyDisk />
                  Save Details
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default BulkUpload;
