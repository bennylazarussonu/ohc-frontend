import { useState } from "react";
import * as XLSX from "xlsx";
import api from "../api/axios";
import SingleMedicineForm from "./SingleMedicineForm";
import { useEffect } from "react";
import { FaTrash, FaRegPenToSquare, FaMagnifyingGlass } from "react-icons/fa6";

function BulkMedicineUpload() {
    const [file, setFile] = useState(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState("single");
    const [medicines, setMedicines] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [editForm, setEditForm] = useState({});

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                const response = await api.get("/api/medicines");
                setMedicines(response.data);
            } catch (error) {
                console.error("Failed to fetch medicines: ", error);
            }
        }
        fetchMedicines();
    }, [tab === "list"]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet);
            setRows(json);
        };

        reader.readAsArrayBuffer(selectedFile);
    };

    const query = search.trim().toLowerCase();

    const filteredMedicines = medicines.filter((medicine) => {
        return (
            medicine.drug_name_and_dose?.toLowerCase().includes(query) ||
            medicine.category?.toLowerCase().includes(query) ||
            medicine.sub_category?.toLowerCase().includes(query)
        );
    });


    const totalPages = Math.ceil(filteredMedicines.length / ITEMS_PER_PAGE);

    const paginatedMedicines = filteredMedicines.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const openEdit = (medicine) => {
        setEditingMedicine(medicine);
        setEditForm({
            drug_name_and_dose: medicine.drug_name_and_dose || "",
            category: medicine.category || "",
            sub_category: medicine.sub_category || "",
            brands: (medicine.brands || []).join(", ")
        });
    };

    const closeEdit = () => {
        setEditingMedicine(null);
        setEditForm({});
    };

    const saveEdit = async () => {
        try {
            await api.put(`/api/medicines/${editingMedicine._id}`, {
                ...editForm,
                brands: editForm.brands
                    .split(",")
                    .map(b => b.trim())
                    .filter(Boolean)
            });

            alert("Medicine updated successfully");
            closeEdit();

            // refresh list
            const res = await api.get("/api/medicines");
            setMedicines(res.data);

        } catch (err) {
            alert("Failed to update medicine");
        }
    };

    const confirmDelete = async (medicine) => {
        const ok = window.confirm(
            `Are you sure you want to delete "${medicine.drug_name_and_dose}"?`
        );

        if (!ok) return;

        try {
            await api.delete(`/api/medicines/${medicine._id}`);
            alert("Medicine deleted");

            setMedicines(prev =>
                prev.filter(m => m._id !== medicine._id)
            );
        } catch {
            alert("Delete failed");
        }
    };


    const handleUpload = async () => {
        if (!file) return alert("Select a file");

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            await api.post("/api/medicines/bulk", formData);
            alert("Medicines uploaded successfully");
            setRows([]);
            setFile(null);
        } catch {
            alert("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex bg-gray-800 rounded mb-4 overflow-hidden p-2 gap-2">
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
                    Single Entry
                </button>
                <button
                    onClick={() => setTab("list")}
                    className={`w-1/2 py-1 text-sm font-semibold transition rounded
            ${tab === "list"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"}
          `}>
                    All Medicines
                </button>
            </div>
            {tab === "bulk" && (
                <>
                    <div className="p-6 bg-gray-800 h-min text-white rounded-xl mb-2">
                        <p className="text-lg mb-2">Bulk Upload Medicines Data</p>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="p-6 bg-gray-800 h-min text-white rounded-xl mt-2">
                        <p className="text-lg mb-2">Preview of the Medicines Data: </p>
                        {rows.length > 0 && (
                            <>
                                <div className="mt-4 max-h-full overflow-auto border border-gray-700 no-scrollbar">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-900 sticky top-0">
                                            <tr>
                                                {Object.keys(rows[0]).map((key) => (
                                                    <th key={key} className="p-2 border">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, i) => (
                                                <tr key={i} className="odd:bg-gray-600 even: bg-gray-700">
                                                    {Object.values(row).map((val, j) => (
                                                        <td key={j} className="p-2 border">
                                                            {String(val)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <button
                                    onClick={handleUpload}
                                    disabled={loading}
                                    className="mt-4 bg-green-600 px-4 py-2 rounded disabled:opacity-50"
                                >
                                    {loading ? "Uploading..." : "Confirm & Upload"}
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}
            {tab === "single" && (
                <SingleMedicineForm />
            )}
            {tab === "list" && (
                <div className="p-6 bg-gray-800 rounded-xl w-full text-white overflow-scroll no-scrollbar">
                    <p className="text-lg font-bold mb-2">All Medicines Data</p>

                    {medicines.length === 0
                        ? "No medicines found."
                        : (
                            <div className="w-full">
                                <div className="flex items-center gap-2">
                                    <FaMagnifyingGlass className="text-[16px]" />
                                    <input
                                        className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
                                        placeholder="Example: TAB_PARACETAMOL_125MG"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setCurrentPage(1); // reset page on search
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1 ml-6 mb-4">Search by Drug Name and Dose, Category, Sub Category, Brands</p>
                                <p className="text-right text-sm font-bold text-gray-400">10 records / page</p>
                                <div className="w-full flex items-center gap-2">
                                    <table className="w-full text-center border table-fixed">
                                        <thead className="bg-gray-900 sticky top-0">
                                            <tr>
                                                <th className="p-2 border w-[5%]">ID</th>
                                                <th className="p-2 border w-[35%]">Drug Name and Dose</th>
                                                <th className="p-2 border w-[15%]">Category</th>
                                                <th className="p-2 border w-[15%]">Sub Category</th>
                                                <th className="p-2 border w-[20%]">Brands</th>
                                                <th className="p-2 border w-[10%]">Action</th>
                                                {/* <th className="p-2 border">Route of Administration</th>
                                            <th className="p-2 border">Frequency</th>
                                            <th className="p-2 border">Frequency Description</th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedMedicines.map((medicine) => (
                                                <tr key={medicine.id}>
                                                    <td className="p-1 border break-words whitespace-normal leading-tight">{medicine.id}</td>
                                                    <td className="p-1 border break-words whitespace-normal leading-tight">{medicine.drug_name_and_dose}</td>
                                                    <td className="p-1 border break-words whitespace-normal leading-tight">{medicine.category}</td>
                                                    <td className="p-1 border break-words whitespace-normal leading-tight">{medicine.sub_category}</td>
                                                    <td className="p-1 border break-words whitespace-normal leading-tight">
                                                        <select className="w-full rounded bg-gray-600">
                                                            {(medicine.brands || []).map((brand, idx) => (
                                                                <option key={idx}>{brand}</option>
                                                            ))}

                                                        </select>
                                                    </td>
                                                    <td className="p-2 border flex items-center gap-3">
                                                        <button
                                                            onClick={() => openEdit(medicine)}
                                                            className="text-blue-400 hover:text-blue-300"
                                                        >
                                                            <FaRegPenToSquare />
                                                        </button>

                                                        <button
                                                            onClick={() => confirmDelete(medicine)}
                                                            className="text-red-400 hover:text-red-300"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                    {/* <td className="p-1 border">{medicine.route_of_administration}</td>
                                                <td className="p-1 border">{medicine.frequency}</td>
                                                <td className="p-1 border">{medicine.frequency_description}</td> */}
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
            )}
            {editingMedicine && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-800 w-[500px] p-4 rounded-xl">
                        <h2 className="text-lg font-bold mb-3">Edit Medicine</h2>

                        <div className="space-y-2 text-sm">
                            <p className="text-sm text-gray-300">Drug Name and Dose:</p>
                            <input
                                className="w-full p-2 bg-gray-700 rounded"
                                placeholder="Drug Name and Dose"
                                value={editForm.drug_name_and_dose}
                                onChange={e =>
                                    setEditForm({ ...editForm, drug_name_and_dose: e.target.value })
                                }
                            />
                            <p className="text-sm text-gray-300">Category:</p>
                            <input
                                className="w-full p-2 bg-gray-700 rounded"
                                placeholder="Category"
                                value={editForm.category}
                                onChange={e =>
                                    setEditForm({ ...editForm, category: e.target.value })
                                }
                            />
                            <p className="text-sm text-gray-300">Sub Category:</p>
                            <input
                                className="w-full p-2 bg-gray-700 rounded"
                                placeholder="Sub Category"
                                value={editForm.sub_category}
                                onChange={e =>
                                    setEditForm({ ...editForm, sub_category: e.target.value })
                                }
                            />
                            <p className="text-sm text-gray-300">Brands (comma separated):</p>
                            <input
                                className="w-full p-2 bg-gray-700 rounded"
                                placeholder="Brands (comma separated)"
                                value={editForm.brands}
                                onChange={e =>
                                    setEditForm({ ...editForm, brands: e.target.value })
                                }
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={closeEdit}
                                className="px-4 py-1 bg-gray-600 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={saveEdit}
                                className="px-4 py-1 bg-blue-600 rounded"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>

    );
}

export default BulkMedicineUpload;
