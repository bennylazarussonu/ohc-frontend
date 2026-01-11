import { useState } from "react";
import api from "../api/axios";

const FREQUENCIES = ["OD", "BID", "TID", "stat", "As directed"];

const FREQUENCY_DESC = [
    "1 time/day",
    "1 time/day (at bedtime)",
    "1 time/day (before breakfast)",
    "1 time/day (evening)",
    "1 time/day (morning)",
    "1 time/day (same time daily)",
    "1 time/day (single dose or as directed)",
    "1 time/day (with food)",
    "2 times/day",
    "2 times/day (apply to affected area)",
    "2 times/day (with meals)",
    "3 times/day",
    "3 times/day (with first bite of meal)",
    "as directed",
    "As per physician"
];

function SingleMedicineForm({ onSuccess }) {
    const [form, setForm] = useState({
        drug_name_and_dose: "",
        category: "",
        sub_category: "",
        brands: [""],
        route_of_administration: "",
        frequency: "",
        frequency_description: ""
    });

    const [loading, setLoading] = useState(false);

    const update = (k, v) =>
        setForm(prev => ({ ...prev, [k]: v }));

    const updateBrand = (i, v) => {
        const b = [...form.brands];
        b[i] = v;
        update("brands", b);
    };

    const addBrand = () =>
        update("brands", [...form.brands, ""]);

    const removeBrand = (i) =>
        update("brands", form.brands.filter((_, idx) => idx !== i));

    const handleSubmit = async () => {
        if (!form.drug_name_and_dose.trim()) {
            alert("Drug name & dose is required");
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/medicines/add", {
                ...form,
                brands: form.brands.filter(b => b.trim()),
                frequency: form.frequency || undefined,
                frequency_description: form.frequency_description || undefined
            });


            alert("Medicine added successfully");

            setForm({
                drug_name_and_dose: "",
                category: "",
                sub_category: "",
                brands: [""],
                route_of_administration: "",
                frequency: "",
                frequency_description: ""
            });

            onSuccess && onSuccess();
        } catch (err) {
            console.error(err);
            alert("Failed to add medicine");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-xl text-white">
            <h2 className="text-lg font-bold mb-4">MEDICINE ENTRY</h2>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <input
                    placeholder="Drug Name & Dose *"
                    className="p-2 bg-gray-700 rounded col-span-2"
                    value={form.drug_name_and_dose}
                    onChange={e => update("drug_name_and_dose", e.target.value)}
                />

                <input
                    placeholder="Category"
                    className="p-2 bg-gray-700 rounded"
                    value={form.category}
                    onChange={e => update("category", e.target.value)}
                />

                <input
                    placeholder="Sub Category"
                    className="p-2 bg-gray-700 rounded"
                    value={form.sub_category}
                    onChange={e => update("sub_category", e.target.value)}
                />

                <input
                    placeholder="Route of Administration"
                    className="p-2 bg-gray-700 rounded"
                    value={form.route_of_administration}
                    onChange={e => update("route_of_administration", e.target.value)}
                />

                <select
                    className="p-2 bg-gray-700 rounded"
                    value={form.frequency}
                    onChange={e => update("frequency", e.target.value)}
                >
                    <option value="">Frequency</option>
                    {FREQUENCIES.map(f => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </select>

                <select
                    className="p-2 bg-gray-700 rounded col-span-2"
                    value={form.frequency_description}
                    onChange={e => update("frequency_description", e.target.value)}
                >
                    <option value="">Frequency Description</option>
                    {FREQUENCY_DESC.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            {/* Brands */}
            <div className="mt-4">
                <p className="text-sm font-semibold mb-1">Brands</p>
                {form.brands.map((b, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                        <input
                            className="flex-1 p-2 bg-gray-700 rounded"
                            placeholder={`Brand ${i + 1}`}
                            value={b}
                            onChange={e => updateBrand(i, e.target.value)}
                        />
                        {form.brands.length > 1 && (
                            <button
                                onClick={() => removeBrand(i)}
                                className="bg-red-600 px-2 rounded"
                            >
                                ❌
                            </button>
                        )}
                    </div>
                ))}
                <button
                    onClick={addBrand}
                    className="text-blue-400 text-sm"
                >
                    + Add another brand
                </button>
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm disabled:opacity-50"
            >
                {loading ? "Saving..." : "Save Medicine"}
            </button>
        </div>
    );
}

export default SingleMedicineForm;
