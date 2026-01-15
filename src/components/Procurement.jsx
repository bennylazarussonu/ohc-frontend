import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaMagnifyingGlass, FaPlus, FaX } from "react-icons/fa6";

function Procurement() {
    const [procured_from, set_procured_from] = useState("");
    const [procured_date, set_procured_date] = useState(new Date().toISOString().split("T")[0]);
    const [procured_items, set_procured_items] = useState([]);

    const [buList, setBuList] = useState([]);
    const [procurementRows, setProcurementRows] = useState([]);
    const [saving, setSaving] = useState(false);
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


    useEffect(() => {
        const fetchBUList = async () => {
            const res = await api.get("/api/bulist");
            setBuList(res.data);

            // build procurement rows from BUList
            const rows = res.data.map(item => ({
                bulist_id: item.id,
                item_name: item.item_name,
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

        fetchBUList();
    }, []);

    const filteredRows = procurementRows
        .map((row, originalIndex) => ({ ...row, originalIndex }))
        .filter(r =>
            r.item_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const handleSubmit = async () => {
        if(procured_from === "" || procured_from === null){
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
        } finally{
            setSaving(false);
        }
    };

    const grandTotal = procurementRows.reduce((sum, row) => {
    const amt = Number(row.amount);
    return sum + (isNaN(amt) ? 0 : amt);
}, 0);


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
                    <div className="h-[200px] overflow-scroll no-scrollbar">
                    <table className="border w-full text-sm ">
                        <thead className="border bg-gray-900">
                            <tr className="border">
                                <th className="border">S.No.</th>
                                <th className="border w-[25%]">Item</th>
                                <th className="border w-[20%]">Brand</th>
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
        </div>
    );
}

export default Procurement;