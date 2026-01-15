import { useState, useEffect } from "react";
import api from "../api/axios";
import { FaXmark } from "react-icons/fa6";

function FillPrescriptionModal({ record, onClose }) {
    const [opd, setOpd] = useState(record);
    const [stock, setStock] = useState([]);
    const [selectedStockIndex, setSelectedStockIndex] = useState({});
    const [dispenseData, setDispenseData] = useState({});
    console.log(dispenseData);
    console.log(opd);
    console.log(stock);

    const fetchStock = async () => {
        try {
            const res = await api.get("/api/dispense/preview/" + opd.id);
            setStock(res.data.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        if (!stock.length) return;

        const initialSelection = {};
        const initialDispense = {};

        record.prescriptions.forEach(prescription => {
            const stockEntry = stock.find(
                s => s.prescription_id === prescription.id
            );

            if (!stockEntry || !stockEntry.stock_options.length) return;

            const opt = stockEntry.stock_options[0];

            initialSelection[prescription.id] = 0;

            let freq = 0;
            if (prescription.frequency === "OD") freq = 1;
            else if (prescription.frequency === "BID") freq = 2;
            else if (prescription.frequency === "TID") freq = 3;

            const units = freq * (prescription.days || 0);

            initialDispense[prescription.id] = {
                stock_ids: opt.stock_ids,
                units
            };
        });

        setSelectedStockIndex(initialSelection);
        setDispenseData(initialDispense);
    }, [stock, record.prescriptions]);




    useEffect(() => {
        fetchStock();
    }, []);
    const stockMap = stock.reduce((acc, item) => {
        acc[item.prescription_id] = item.stock_options;
        return acc;
    }, {});

    const handleDispense = async () => {
        try {
            const hasAnyStock = record.prescriptions.some(p => {
                const stockEntry = stock.find(s => s.prescription_id === p.id);
                return stockEntry && stockEntry.stock_options.length > 0;
            });

            if (!hasAnyStock) {
                alert("All prescribed medicines are out of stock");
                return;
            }

            const dispensed_items = Object.values(dispenseData)
                .filter(i => i.units > 0 && i.stock_ids?.length);

            if (!dispensed_items.length) {
                alert("No medicines selected for dispense");
                return;
            }

            await api.post("/api/dispense/fill-prescription", {
                opd_id: opd.id,
                dispensed_to_worker_id: opd.worker.id,
                dispensed_items
            });

            alert("Medicines dispensed successfully");
            onClose();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Dispense failed");
        }
    };



    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-gray-900 w-[1000px] max-h-[90vh] overflow-scroll no-scrollbar rounded-xl p-6 text-white">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">Fill Prescription - {opd.worker.name}</h2>
                    <button onClick={onClose}>
                        <FaXmark />
                    </button>
                </div>
                <div className="text-xs mb-4">
                    <p className="text-gray-600">Presenting Complaint: {opd.presenting_complaint}</p>
                </div>
                <div className="w-full">
                    <table className="w-full border text-sm">
                        <thead className="border">
                            <tr className="border">
                                <th className="border">S.No.</th>
                                <th className="border">Item Name</th>
                                <th className="border">Brand</th>
                                <th className="border">Available Units</th>
                                <th className="border">Cost per Unit</th>
                                <th className="border">Status</th>
                                <th className="border">Frequency</th>
                                <th className="border">Days</th>
                                <th className="border">Units to be Dispensed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {record.prescriptions.map((prescription, idx) => {
                                const options = stockMap[prescription.id] || [];
                                const inStock = options.length > 0;

                                const selectedIdx = selectedStockIndex[prescription.id] ?? 0;
                                const selectedOption = inStock ? options[selectedIdx] : null;

                                const costPerUnit = selectedOption?.per_unit_cost ?? "-";
                                const totalUnits = selectedOption?.total_units ?? 0;
                                const brand = selectedOption?.brand ?? prescription.brand ?? "-";

                                let freq = 0;
                                if (prescription.frequency === "OD") freq = 1;
                                else if (prescription.frequency === "BID") freq = 2;
                                else if (prescription.frequency === "TID") freq = 3;

                                const unitsToDispense = freq * (prescription.days || 0);

                                return (
                                    <tr key={prescription.id} className="border">
                                        <td className="border text-center">{idx + 1}</td>

                                        {/* ✅ ITEM NAME / DROPDOWN */}
                                        <td className="border px-2">
                                            {inStock && options.length > 1 ? (
                                                <select
                                                    className="bg-gray-700 rounded p-1 text-xs w-full"
                                                    value={selectedIdx}
                                                    onChange={(e) => {
                                                        const idx = Number(e.target.value);

                                                        setSelectedStockIndex(prev => ({
                                                            ...prev,
                                                            [prescription.id]: idx
                                                        }));

                                                        const opt = options[idx];

                                                        setDispenseData(prev => ({
                                                            ...prev,
                                                            [prescription.id]: {
                                                                stock_ids: opt.stock_ids,
                                                                units: prev[prescription.id]?.units ?? unitsToDispense
                                                            }
                                                        }));
                                                    }}

                                                >
                                                    {options.map((opt, i) => (
                                                        <option key={i} value={i}>
                                                            {opt.item_name} – {opt.brand} | ₹{opt.per_unit_cost} | Exp:{" "}
                                                            {new Date(opt.expiry_date).toLocaleDateString()}
                                                        </option>

                                                    ))}
                                                </select>
                                            ) : (
                                                prescription.drug_name_and_dose
                                            )}
                                        </td>

                                        {/* ✅ BRAND */}
                                        <td className="border text-center">{brand}</td>

                                        {/* ✅ AVAILABLE UNITS */}
                                        <td className="border text-center">{totalUnits}</td>

                                        {/* ✅ COST */}
                                        <td className="border text-center">
                                            {inStock ? `₹ ${costPerUnit}` : "-"}
                                        </td>

                                        {/* ✅ STATUS */}
                                        <td
                                            className={`border font-semibold text-center ${inStock ? "text-green-400" : "text-red-400"
                                                }`}
                                        >
                                            {inStock ? "In Stock" : "Out of Stock"}
                                        </td>

                                        <td className="border text-center">{prescription.frequency}</td>
                                        <td className="border text-center">{prescription.days}</td>

                                        {/* ✅ UNITS TO DISPENSE */}
                                        <td className="border text-center p-1">
                                            <input
                                                type="number"
                                                min={0}
                                                max={totalUnits}
                                                value={dispenseData[prescription.id]?.units ?? unitsToDispense}
                                                disabled={!inStock}
                                                onChange={(e) =>
                                                    setDispenseData(prev => ({
                                                        ...prev,
                                                        [prescription.id]: {
                                                            stock_ids: selectedOption?.stock_ids || [],
                                                            units: Number(e.target.value)
                                                        }
                                                    }))
                                                }
                                                className="bg-gray-700 rounded p-1 text-xs w-20 text-center"
                                            />

                                        </td>
                                    </tr>
                                );
                            })}

                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="bg-gray-600 px-4 py-1 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDispense}
                        className="bg-green-600 px-4 py-1 rounded"
                    >
                        Dispense
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FillPrescriptionModal;