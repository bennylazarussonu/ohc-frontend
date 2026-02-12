import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaDownload, FaMagnifyingGlass, FaPenToSquare, FaPlus, FaX } from "react-icons/fa6";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

function Procurement() {
    const [procured_from, set_procured_from] = useState("");
    const [procured_date, set_procured_date] = useState(new Date().toISOString().split("T")[0]);
    const [procured_items, set_procured_items] = useState([]);

    const [buList, setBuList] = useState([]);
    const [procurementRows, setProcurementRows] = useState([]);
    const [saving, setSaving] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);


    console.log(procurementRows);

    const [searchTerm, setSearchTerm] = useState("");

    const recalcRow = (row, source) => {
        const updated = { ...row };

        const units = row.units === "" ? null : Number(row.units);
        const gst = row.gst_rate === "" ? 5 : Number(row.gst_rate);

        // SOURCE: cost_per_unit or rate_incl_gst
        if (source === "cost_per_unit" || source === "rate_incl_gst") {
            if (row.cost_per_unit === "" && row.rate_incl_gst === "") return updated;

            const incl = Number(row.cost_per_unit || row.rate_incl_gst);

            updated.cost_per_unit = incl;
            updated.rate_incl_gst = incl;
            updated.rate_excl_gst = +(incl / (1 + gst / 100)).toFixed(2);

            if (units !== null) {
                updated.amount = +(units * incl).toFixed(2);
            }

            return updated;
        }

        // SOURCE: amount
        if (source === "amount") {
            if (row.amount === "" || units === null || units === 0) return updated;

            const incl = Number(row.amount) / units;

            updated.cost_per_unit = +incl.toFixed(2);
            updated.rate_incl_gst = +incl.toFixed(2);
            updated.rate_excl_gst = +(incl / (1 + gst / 100)).toFixed(2);

            return updated;
        }

        // SOURCE: units
        if (source === "units") {
            if (units === null || row.cost_per_unit === "") return updated;

            const incl = Number(row.cost_per_unit);

            updated.amount = +(units * incl).toFixed(2);
            updated.rate_incl_gst = incl;
            updated.rate_excl_gst = +(incl / (1 + gst / 100)).toFixed(2);

            return updated;
        }

        // SOURCE: gst_rate
        if (source === "gst_rate") {
            if (row.cost_per_unit === "") return updated;

            updated.rate_excl_gst = +(
                row.cost_per_unit / (1 + gst / 100)
            ).toFixed(2);

            return updated;
        }

        return updated;
    };

    const buildProcurementPayload = () => {
        const items = procurementRows
            .filter(row => Number(row.units) >= 1)
            .map(row => ({
                item_name: row.item_name,
                brand: row.selected_brand || "",
                units: Number(row.units),
                rate_excluding_gst: Number(row.rate_excl_gst),
                gst_rate: Number(row.gst_rate),
                rate_including_gst: Number(row.rate_incl_gst),
                per_unit_cost: Number(row.cost_per_unit),
                item_total_cost: Number(row.amount),
                medicine_id: row.medicine_id
            }));

        const total_cost = items.reduce(
            (sum, item) => sum + item.item_total_cost,
            0
        );

        return {
            procured_from,
            procurement_date: procured_date,
            total_cost,
            items
        };
    };


    const fetchBUList = async () => {
        const res = await api.get("/api/bulist");
        setBuList(res.data);

        // build procurement rows from BUList
        const rows = res.data.map(item => ({
            bulist_id: item.id,
            item_name: item.item_name,
            category: item.category ? item.category : "",
            sub_category: item.sub_category ? item.sub_category : "",
            brands: item.brands || [],
            selected_brand: item.brands?.length ? item.brands[0] : "",
            units: "",
            rate_excl_gst: "",
            gst_rate: 5,
            rate_incl_gst: "",
            amount: "",
            cost_per_unit: "",
            medicine_id: item.medicine_id
        }));

        setProcurementRows(rows);
    };
    useEffect(() => {

        fetchBUList();
    }, []);

    useEffect(() => {
        if (!editingItem || editingItem.medicine_id !== null) {
            setShowDropdown(false);
            return;
        }

        if (!editingItem.item_name || editingItem.item_name.length < 2) {
            setShowDropdown(false);
            return;
        }

        const controller = new AbortController();

        const delay = setTimeout(async () => {
            try {
                const res = await api.get(
                    `/api/medicines/search?query=${editingItem.item_name}`,
                    { signal: controller.signal }
                );

                setSearchResults(res.data);
                setShowDropdown(true);

            } catch (err) {
                if (err.name !== "CanceledError") {
                    console.error(err);
                }
            }
        }, 300);

        return () => {
            clearTimeout(delay);
            controller.abort();
        };

    }, [editingItem?.item_name, editingItem?.medicine_id]);

    const filteredRows = procurementRows
        .map((row, originalIndex) => ({ ...row, originalIndex }))
        .filter(r =>
            r.item_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const handleSubmit = async () => {
        if (procured_from === "" || procured_from === null) {
            alert("Vendor Name cannot be empty");
            return;
        }
        const payload = buildProcurementPayload();

        if (payload.items.length === 0) {
            alert("No items to procure");
            return;
        }

        if (saving) return;
        setSaving(true);

        try {
            await api.post("/api/procurement/add", payload);
            alert("Procurement saved successfully");

            // optional reset
            set_procured_from("");
            setProcurementRows(prev =>
                prev.map(row => ({
                    ...row,
                    units: "",
                    rate_excl_gst: "",
                    rate_incl_gst: "",
                    cost_per_unit: "",
                    amount: "",
                    gst_rate: 5
                }))
            );
        } catch (err) {
            console.error(err);
            alert("Failed to save procurement");
        } finally {
            setSaving(false);
        }
    };

    const grandTotal = procurementRows.reduce((sum, row) => {
        const amt = Number(row.amount);
        return sum + (isNaN(amt) ? 0 : amt);
    }, 0);

    const openEditModal = (row) => {
        if (!row.medicine_id) {
            alert("This item is not linked to a medicine record.");
            return;
        }

        setEditingItem(row);
        setEditModal(true);
    };

    const handleEditSave = async () => {
        try {
            if (!editingItem.item_name?.trim()) {
                alert("Item name required");
                return;
            }


            if (!editingItem.medicine_id) {
                // 🆕 ADD FLOW
                await api.post("/api/bulist/add-item", {
                    drug_name_and_dose: editingItem.item_name,
                    category: editingItem.category,
                    sub_category: editingItem.sub_category,
                    brands: editingItem.brands,
                    medicine_id: editingItem.selected_medicine_id
                });


            } else {
                // ✏️ EDIT FLOW
                await api.put(
                    `/api/medicines/edit-by-id/${editingItem.medicine_id}`,
                    {
                        drug_name_and_dose: editingItem.item_name,
                        category: editingItem.category,
                        sub_category: editingItem.sub_category,
                        brands: editingItem.brands
                    }
                );
            }
            console.log("medicine_id:", editingItem.medicine_id);


            alert("Saved successfully");
            setEditModal(false);
            setEditingItem(null);
            await fetchBUList();

        } catch (err) {
            console.error(err);
            alert("Operation failed");
        }
    };

    const downloadTemplate = () => {
        if (!buList.length) {
            alert("No BUList data available");
            return;
        }

        const headers = [
            "s_no",
            "item_name",
            "brand",
            "units",
            "rate_excluding_gst",
            "gst_rate",
            "rate_including_gst",
            "per_unit_cost",
            "amount"
        ];

        const rows = buList.map((item, index) => ([
            index + 1,
            item.item_name,
            "", "", "", "", "", "", ""
        ]));

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

        const range = XLSX.utils.decode_range(worksheet["!ref"]);

        // 🔥 Apply Borders + Wrap for item_name
        for (let row = range.s.r; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellAddress]) continue;

                worksheet[cellAddress].s = {
                    alignment: {
                        wrapText: col === 1 ? true : false,
                        vertical: "center"
                    },
                    border: {
                        top: { style: "thin" },
                        bottom: { style: "thin" },
                        left: { style: "thin" },
                        right: { style: "thin" }
                    }
                };
            }
        }

        // 🔥 Column width auto-adjust
        worksheet["!cols"] = headers.map((header, colIndex) => {
            let maxLength = header.length;

            rows.forEach(row => {
                const value = row[colIndex]
                    ? row[colIndex].toString()
                    : "";
                if (value.length > maxLength) {
                    maxLength = value.length;
                }
            });

            return { wch: maxLength + 3 };
        });

        // 🔥 ADD DROPDOWN FOR EACH ROW (Brand column = index 2)
        worksheet["!dataValidation"] = [];

        buList.forEach((item, index) => {
            if (!item.brands || !item.brands.length) return;

            worksheet["!dataValidation"].push({
                type: "list",
                allowBlank: true,
                sqref: `C${index + 2}`, // Column C, skip header
                formulas: [`"${item.brands.join(",")}"`]
            });
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "BUList_Template");

        XLSX.writeFile(workbook, "Procurement_Template.xlsx");
    };


    return (
        <div className="w-full">
            <div className="bg-gray-800 my-3 rounded-lg p-4 w-full">
                <p className="font-semibold mb-2 text-xs">PROCUREMENT DETAILS</p>
                <div className="flex w-full gap-4">
                    <div className="w-1/4">
                        <p className="text-xs mb-1">Vendor Name</p>
                        <input
                            value={procured_from}
                            type="text"
                            placeholder="Vendor Name"
                            className="bg-gray-700 p-2 w-full rounded text-xs"
                            onChange={e => { set_procured_from(e.target.value) }}
                        />
                    </div>
                    <div className="w-1/6">
                        <p className="text-xs mb-1">Procurement Date</p>
                        <input
                            type="date"
                            className="bg-gray-700 p-2 w-full rounded text-xs"
                            value={procured_date}
                            onChange={e => { set_procured_date(e.target.value) }}
                        />
                    </div>
                </div>
            </div>
            <div className="bg-gray-800 my-3 rounded-lg p-4 w-full">
                <p className="font-semibold mb-2 text-xs">PROCURED ITEMS</p>
                <div className="mb-2 flex items-center gap-2">
                    <FaMagnifyingGlass />
                    <input
                        type="text"
                        placeholder="Search item..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-gray-700 p-2 rounded text-xs w-64 focus:outline-none focus:border focus:border-blue-400"
                    />
                </div>
                <div className="w-full">
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={downloadTemplate}
                            className="bg-green-600 p-2 text-xs mb-2 rounded flex items-center gap-1 font-semibold"
                        >
                            <FaDownload className="text-xs" />
                            Download Excel Template
                        </button>

                        <button
                            className="bg-blue-600 p-2 text-xs rounded mb-2 flex items-center gap-1"
                            onClick={() => {
                                setEditingItem({
                                    item_name: "",
                                    category: "",
                                    sub_category: "",
                                    brands: [],
                                    medicine_id: null
                                });
                                setShowDropdown(false);   // 👈 add this
                                setEditModal(true);
                            }}

                        >
                            <FaPlus className="text-xs" />
                            <p className="font-semibold">Add Item</p>
                        </button>

                    </div>
                    <div className="h-[210px] overflow-scroll no-scrollbar">
                        <table className="border w-full text-sm ">
                            <thead className="border bg-gray-900">
                                <tr className="border">
                                    <th className="border">S.No.</th>
                                    <th className="border w-[25%]">Item</th>
                                    <th className="border w-[20%]">Brand</th>
                                    <th className="border">Edit</th>
                                    <th className="border">Units</th>
                                    <th className="border">Rate Excl. GST (₹)</th>
                                    <th className="border">GST Rate (%)</th>
                                    <th className="border">Rate Incl. GST (₹)</th>
                                    <th className="border">Cost per Unit (₹)</th>
                                    <th className="border">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="border">
                                {filteredRows.map((row, index) => (
                                    <tr key={row.bulist_id} className="border">
                                        <td className="border text-center p-1">
                                            {row.originalIndex + 1}
                                        </td>

                                        {/* ITEM NAME (read-only) */}
                                        <td className="border p-1 text-xs">
                                            {row.item_name}
                                        </td>

                                        {/* BRAND SELECT */}
                                        <td className="border p-1">
                                            <select
                                                value={row.selected_brand || row.brands[0] || ""}
                                                onChange={e => {
                                                    const updated = [...procurementRows];
                                                    updated[row.originalIndex].selected_brand = e.target.value;
                                                    setProcurementRows(updated);
                                                }}
                                                className="bg-gray-700 rounded text-xs px-2 py-1 w-full"
                                                disabled={!row.brands.length}
                                            >
                                                <option value="">Select Brand</option>
                                                {row.brands.map((b, i) => (
                                                    <option key={i} value={b}>{b}</option>
                                                ))}
                                            </select>
                                        </td>

                                        <td className="border text-center">
                                            <button
                                                className="text-blue-400 text-xs"
                                                onClick={() => openEditModal(row)}
                                            >
                                                <FaPenToSquare />
                                            </button>
                                        </td>

                                        {/* UNITS */}
                                        <td className="border p-1">
                                            <input
                                                type="number"
                                                value={row.units}
                                                onChange={e => {
                                                    const updated = [...procurementRows];
                                                    updated[row.originalIndex] = recalcRow(
                                                        { ...row, units: e.target.value },
                                                        "units"
                                                    );
                                                    setProcurementRows(updated);
                                                }}
                                                className="bg-gray-700 rounded text-xs px-2 py-1 w-full"
                                            />
                                        </td>

                                        {/* RATE EXCL GST */}
                                        <td className="border p-1">
                                            <input
                                                type="number"
                                                value={row.rate_excl_gst}
                                                onChange={e => {
                                                    const value = e.target.value;

                                                    const updated = [...procurementRows];

                                                    if (value === "") {
                                                        updated[row.originalIndex] = {
                                                            ...row,
                                                            rate_excl_gst: "",
                                                            cost_per_unit: "",
                                                            rate_incl_gst: "",
                                                            amount: ""
                                                        };
                                                    } else {
                                                        const gst = row.gst_rate || 5;
                                                        const incl = value * (1 + gst / 100);

                                                        updated[row.originalIndex] = recalcRow(
                                                            { ...row, cost_per_unit: incl },
                                                            "cost_per_unit"
                                                        );
                                                    }

                                                    setProcurementRows(updated);
                                                }}
                                                className="bg-gray-700 rounded text-xs px-2 py-1 w-full"
                                            />
                                        </td>

                                        {/* GST RATE */}
                                        <td className="border p-1">
                                            <input
                                                type="number"
                                                value={row.gst_rate}
                                                onChange={e => {
                                                    const updated = [...procurementRows];
                                                    updated[row.originalIndex] = recalcRow(
                                                        { ...row, gst_rate: e.target.value },
                                                        "gst_rate"
                                                    );
                                                    setProcurementRows(updated);
                                                }}
                                                className="bg-gray-700 rounded text-xs px-2 py-1 w-full"
                                            />
                                        </td>

                                        {/* RATE INCL GST (optional calc later) */}
                                        <td className="border p-1">
                                            <input
                                                type="number"
                                                value={row.rate_incl_gst}
                                                onChange={e => {
                                                    const updated = [...procurementRows];
                                                    updated[row.originalIndex] = recalcRow(
                                                        { ...row, rate_incl_gst: e.target.value },
                                                        "rate_incl_gst"
                                                    );
                                                    setProcurementRows(updated);
                                                }}
                                                className="bg-gray-700 rounded text-xs px-2 py-1 w-full"
                                            />
                                        </td>

                                        <td className="border text-center p-1">
                                            <input
                                                type="number"
                                                value={row.cost_per_unit}
                                                onChange={e => {
                                                    const updated = [...procurementRows];
                                                    updated[row.originalIndex] = recalcRow(
                                                        { ...row, cost_per_unit: e.target.value },
                                                        "cost_per_unit"
                                                    );
                                                    setProcurementRows(updated);
                                                }}
                                                className="bg-gray-700 rounded text-xs px-2 py-1 w-full"
                                            />
                                        </td>

                                        {/* AMOUNT */}
                                        <td className="border p-1">
                                            <input
                                                type="number"
                                                value={row.amount}
                                                onChange={e => {
                                                    const updated = [...procurementRows];
                                                    updated[row.originalIndex] = recalcRow(
                                                        { ...row, amount: e.target.value },
                                                        "amount"
                                                    );
                                                    setProcurementRows(updated);
                                                }}
                                                className="bg-gray-700 rounded text-xs px-2 py-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                ))}
                                <tr className="border">
                                    <td className="row-span-9"></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td className="border text-center p-1">
                                        <input
                                            readOnly
                                            type="number"
                                            className="bg-gray-700 rounded text-xs px-2 py-1 w-full focus:outline-none focus:border focus:border-blue-400"
                                            placeholder="Total"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-right text-sm">Total: ₹ {grandTotal.toFixed(2)}</p>
                    <button
                        disabled={saving}
                        onClick={handleSubmit}
                        className={`flex items-center gap-1 text-xs p-2 rounded font-semibold my-2
    ${saving ? "bg-gray-500" : "bg-green-600"}`}
                    >
                        <FaPlus />
                        Submit Procurement
                    </button>
                </div>
            </div>
            {editModal && editingItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-gray-800 p-4 rounded w-1/3">
                        <h2 className="text-sm font-semibold mb-3">Edit Medicine</h2>
                        {console.log(editingItem)}
                        <p className="text-sm">Item Name:</p>
                        {/* <input
                            type="text"
                            value={editingItem.item_name}
                            placeholder="Item Name"
                            onChange={e =>
                                setEditingItem({ ...editingItem, item_name: e.target.value })
                            }
                            className="bg-gray-700 p-2 w-full mb-2 text-xs rounded"
                        /> */}
                        <input
                            type="text"
                            value={editingItem.item_name}
                            placeholder="Item Name"
                            onChange={(e) =>
                                setEditingItem({ ...editingItem, item_name: e.target.value })
                            }
                            className="bg-gray-700 p-2 w-full mb-2 text-xs rounded"
                        />
                        {showDropdown &&
                            editingItem?.medicine_id === null &&
                            searchResults.length > 0 && (
                                <div className="bg-gray-900 border rounded max-h-40 overflow-y-auto text-xs">
                                    {searchResults.map(med => (
                                        <div
                                            key={med.id}
                                            className="p-2 hover:bg-gray-700 cursor-pointer"
                                            onClick={() => {
                                                setEditingItem({
                                                    item_name: med.drug_name_and_dose,
                                                    category: med.category || "",
                                                    sub_category: med.sub_category || "",
                                                    brands: med.brands || [],
                                                    selected_medicine_id: med.id,
                                                    medicine_id: null
                                                });

                                                setShowDropdown(false);
                                            }}
                                        >
                                            {med.drug_name_and_dose}
                                        </div>
                                    ))}
                                </div>
                            )}


                        <p className="text-sm">Category</p>
                        <input
                            type="text"
                            value={editingItem.category}
                            placeholder="Category"
                            onChange={e =>
                                setEditingItem({ ...editingItem, category: e.target.value })
                            }
                            className="bg-gray-700 p-2 w-full mb-2 text-xs rounded"
                        />

                        <p className="text-sm">Sub-Category</p>
                        <input
                            type="text"
                            value={editingItem.sub_category}
                            placeholder="Sub-Category"
                            onChange={e =>
                                setEditingItem({ ...editingItem, sub_category: e.target.value })
                            }
                            className="bg-gray-700 p-2 w-full mb-2 text-xs rounded"
                        />

                        <p className="text-sm">Brands (comma separated)</p>
                        <input
                            type="text"
                            value={editingItem.brands?.join(",")}
                            placeholder="Brands"
                            onChange={e =>
                                setEditingItem({
                                    ...editingItem,
                                    brands: e.target.value.split(",")
                                })
                            }
                            className="bg-gray-700 p-2 w-full mb-3 text-xs rounded"
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setEditModal(false);
                                    setEditingItem(null);
                                    setSearchResults([]);
                                    setShowDropdown(false);
                                }}

                                className="bg-gray-600 px-3 py-1 text-xs rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleEditSave}
                                className="bg-green-600 px-3 py-1 text-xs rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Procurement;