import { FaEye, FaFloppyDisk, FaHandHoldingMedical, FaMagnifyingGlass, FaPenToSquare, FaPlus } from "react-icons/fa6";
import { useEffect, useState } from "react";
import api from "../api/axios";

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

function FAB() {
    const [viewModal, setViewModal] = useState(false);
    const [zones, setZones] = useState([]);
    const [zoneItems, setZoneItems] = useState([]);
    const [selectedZone, setSelectedZone] = useState(null);
    const [replace, setReplace] = useState({});//(AddQty)
    const [addZoneModal, setAddZoneModal] = useState(false);
    const [zoneName, setZoneName] = useState("");
    const [zoneLocation, setZoneLocation] = useState("");
    const [newItems, setNewItems] = useState([]);
    const [medicineResults, setMedicineResults] = useState({});
    const [consumed, setConsumed] = useState({});
    const [searchText, setSearchText] = useState("");
    const [consumptionModal, setConsumptionModal] = useState(false);
    const [consumptionLogs, setConsumptionLogs] = useState([]);

    console.log(consumptionLogs);

    const debouncedSearch = useDebounce(searchText, 300);

    useEffect(() => {
        const fetchZones = async () => {
            const res = await api.get("/api/fab/zones");
            const data = res.data;
            setZones(data);
        }
        fetchZones();
    }, []);

    const createZone = async () => {

        if (!zoneName.trim()) {
            alert("Zone name required");
            return;
        }

        await api.post("/api/fab/zones/", {
            zone_name: zoneName.trim().toUpperCase(),
            location: zoneLocation
        });

        const res = await api.get("/api/fab/zones/");
        setZones(res.data);

        setZoneName("");
        setZoneLocation("");

        setAddZoneModal(false);
    };

    const handleReplace = (medicineId, qty) => {
        setReplace(prev => ({
            ...prev,
            [medicineId]: Number(qty)
        }));
    };

    const handleConsumed = (medicineId, qty) => {
        setConsumed(prev => ({
            ...prev,
            [medicineId]: Number(qty)
        }));
    };

    const openZone = async (zone) => {

        const res = await api.get(`/api/fab/zones/${zone.id}/items`);

        setZoneItems(res.data);
        setSelectedZone(zone);
        setReplace({});      // reset replacement values
        setViewModal(true);
        setNewItems([]);
        setMedicineResults({});
        setConsumed({});
    };

    const getColor = (replaceQty, availableStock) => {
        if (replaceQty === 0) return "bg-gray-700"

        if (replaceQty <= availableStock)
            return "bg-green-700"

        return "bg-red-700"
    }

    const isDirty =
        Object.keys(replace).length > 0 ||
        Object.keys(consumed).length > 0 ||
        newItems.length > 0;

    const addRow = () => {
        setNewItems([
            ...newItems,
            {
                medicine_id: null,
                item_name: "",
                category: "",
                quantity: 0
            }
        ]);
    };

    const searchMedicine = (index, text) => {

        const updated = [...newItems];
        updated[index].item_name = text;
        setNewItems(updated);

        setSearchText(text);
    };

    useEffect(() => {

        const fetch = async () => {

            if (debouncedSearch.length < 2) return;

            const res = await api.get(`/api/fab/zones/search-stock?query=${debouncedSearch}`);

            setMedicineResults(prev => ({
                ...prev,
                [newItems.length - 1]: res.data
            }));

        };

        fetch();

    }, [debouncedSearch]);

    const openConsumption = async (zone) => {
        const res = await api.get(`/api/fab/zones/${zone.id}/consumption`);

        setConsumptionLogs(res.data);
        setSelectedZone(zone);
        setConsumptionModal(true);
    };

    const selectMedicine = (index, medicine) => {

        if (newItems.some((i, iIndex) =>
            i.medicine_id === medicine.id && iIndex !== index
        )) {
            alert("Medicine already added");
            return;
        }
        const updated = [...newItems];

        updated[index].medicine_id = medicine.id;
        updated[index].item_name = medicine.drug_name_and_dose;
        updated[index].category = medicine.category;

        setNewItems(updated);

        setMedicineResults(prev => ({
            ...prev,
            [index]: []
        }));
    };

    const removeRow = (index) => {

        const updated = [...newItems];
        updated.splice(index, 1);

        setNewItems(updated);
    };

    const updateQuantity = (index, qty) => {

        const updated = [...newItems];

        updated[index].quantity = Number(qty);

        setNewItems(updated);
    };

    const saveChanges = async () => {

        try {

            const consumedUpdates = Object.entries(consumed).map(([medicine_id, qty]) => ({
                medicine_id: Number(medicine_id),
                consumed_qty: Number(qty)
            }));

            const addUpdates = Object.entries(replace).map(([medicine_id, qty]) => ({
                medicine_id: Number(medicine_id),
                add_qty: Number(qty)
            }));

            if (consumedUpdates.length > 0) {
                await api.post(`/api/fab/zones/${selectedZone.id}/consume`, {
                    updates: consumedUpdates
                });
            }

            if (addUpdates.length > 0) {
                await api.post(`/api/fab/zones/${selectedZone.id}/add`, {
                    updates: addUpdates
                });
            }

            // 🔹 THIS PART WAS MISSING
            const newItemRequests = newItems
                .filter(i => i.medicine_id && i.quantity > 0)
                .map(i =>
                    api.post(`/api/fab/zones/${selectedZone.id}/add-item`, {
                        medicine_id: i.medicine_id,
                        quantity: i.quantity
                    })
                );

            if (newItemRequests.length > 0) {
                await Promise.all(newItemRequests);
            }

            const res = await api.get(`/api/fab/zones/${selectedZone.id}/items`);
            setZoneItems(res.data);

            setReplace({});
            setConsumed({});
            setNewItems([]);

        } catch (err) {
            console.error(err);
            alert("Failed to save changes");
        }

    };
    return (
        <div className="w-full bg-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-bold">FIRST AID BOX - FAB</h3>

            <div className="mt-4">
                <p className="font-semibold mb-2">Zones</p>

                <div className="w-full flex items-center gap-2">
                    <div className="w-4/5 flex items-center gap-2">
                        <FaMagnifyingGlass />
                        <input type="text"
                            placeholder="Search Zones..."
                            className="p-2 text-sm w-full bg-gray-700 rounded"
                        />
                    </div>
                    <div className="w-1/5 flex items-center">
                        <button
                            onClick={() => setAddZoneModal(true)}
                            className="p-2 text-sm bg-blue-600 flex items-center gap-2 font-semibold text-white rounded w-full"
                        >
                            <FaPlus />
                            Add New Zone
                        </button>
                    </div>
                </div>

                {addZoneModal && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black/60">

                        <div className="bg-gray-900 p-6 rounded-lg w-[400px]">

                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold">Create New Zone</h2>

                                <button
                                    onClick={() => setAddZoneModal(false)}
                                    className="text-xl"
                                >
                                    x
                                </button>
                            </div>


                            <div className="flex flex-col gap-3">

                                <input
                                    type="text"
                                    placeholder="Zone Name"
                                    value={zoneName}
                                    onChange={(e) => setZoneName(e.target.value)}
                                    className="bg-gray-800 p-2 rounded text-sm"
                                />

                                <input
                                    type="text"
                                    placeholder="Location (Building / Floor etc)"
                                    value={zoneLocation}
                                    onChange={(e) => setZoneLocation(e.target.value)}
                                    className="bg-gray-800 p-2 rounded text-sm"
                                />

                            </div>


                            <div className="flex justify-end gap-2 mt-4">

                                <button
                                    onClick={() => setAddZoneModal(false)}
                                    className="bg-gray-600 px-3 py-1 rounded text-sm"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={createZone}
                                    className="bg-blue-600 px-3 py-1 rounded text-sm font-semibold"
                                >
                                    Create
                                </button>

                            </div>

                        </div>
                    </div>
                )}

                <div className="w-full mt-4">
                    <table className="w-full text-sm border">
                        <thead className="bg-gray-900">
                            <tr>
                                <th className="p-2 border">ID</th>
                                <th className="p-2 border">Zone Name</th>
                                <th className="p-2 border">Location</th>
                                <th className="p-2 border">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {zones.map((zone) => (
                                <tr key={zone.id}>
                                    <td className="p-2 border">{zone.id}</td>
                                    <td className="p-2 border">{zone.zone_name}</td>
                                    <td className="p-2 border">{zone.location}</td>

                                    <td className="p-2 border flex items-center gap-2">

                                        <button className="text-sm bg-green-600 flex items-center gap-2 p-2 font-semibold text-white rounded">
                                            <FaPenToSquare />
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => openZone(zone)}
                                            className="p-2 text-sm bg-blue-600 flex items-center gap-2 font-semibold text-white rounded"
                                        >
                                            <FaEye />
                                            View
                                        </button>

                                        <button
                                            onClick={() => openConsumption(zone)}
                                            className="p-2 text-sm bg-yellow-600 flex items-center gap-2 font-semibold text-white rounded"
                                        >
                                            <FaHandHoldingMedical />
                                            Consumption
                                        </button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {consumptionModal && (

                <div className="fixed inset-0 flex justify-center items-center bg-black/60">

                    <div className="bg-gray-900 p-6 rounded-lg w-[700px]">

                        <div className="flex justify-between items-center mb-4">

                            <div>
                                <h2 className="text-lg font-bold">
                                    Consumption History
                                </h2>

                                <p className="text-sm text-gray-400">
                                    Zone: {selectedZone?.zone_name}
                                </p>
                            </div>

                            <button
                                onClick={() => setConsumptionModal(false)}
                                className="text-xl"
                            >
                                x
                            </button>

                        </div>

                        <div className="max-h-[400px] overflow-y-auto">

                            <table className="w-full border text-sm">

                                <thead className="bg-gray-800">

                                    <tr>
                                        <th className="border p-2">Item</th>
                                        <th className="border p-2">Quantity</th>
                                        <th className="border p-2">Reason</th>
                                        <th className="border p-2">User</th>
                                        <th className="border p-2">Time</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {consumptionLogs.map((log, index) => (

                                        <tr key={index}>

                                            <td className="border p-2">
                                                {log.item_name}
                                            </td>

                                            <td className="border p-2 text-center">
                                                {log.quantity}
                                            </td>

                                            <td className="border p-2 text-center">
                                                {log.reason}
                                            </td>

                                            <td className="border p-2 text-center">
                                                {log.user}
                                            </td>

                                            <td className="border p-2 text-center">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            )}
            {viewModal && (
                <div className="fixed inset-0 flex justify-center w-full items-center bg-black/60">
                    <div className="w-4/5 bg-gray-900 p-6 rounded-lg">
                        <div className="flex w-full justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold">{selectedZone?.zone_name}</h2>
                                <p className="text-sm text-gray-400">
                                    Location: {selectedZone?.location}
                                </p>
                            </div>
                            <div onClick={() => {
                                setViewModal(false)
                                setZoneItems([])
                                setSelectedZone(null)
                            }} className=" cursor-pointer text-xl">
                                x
                            </div>
                        </div>
                        <p className="font-semibold mt-3 text-sm">Contents of First Aid Box in accordance with BOCW Rules</p>
                        <div className="w-full h-[300px] overflow-y-auto no-scrollbar">
                            <table className="border w-full">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th className="border p-1">S. No.</th>
                                        <th className="border p-1">Item</th>
                                        <th className="border p-1">Category</th>
                                        <th className="border p-1">Expiry Date</th>
                                        <th className="border p-1">Quantity</th>
                                        <th className="border p-1">Last Date of Replacement</th>
                                        <th className="border p-1">Stock</th>
                                        <th className="border p-1">Consumed</th>
                                        <th className="border p-1">Add</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {zoneItems.map((item, index) => {

                                        const replaceQty = replace[item.medicine_id] || 0;

                                        return (
                                            <tr key={item.medicine_id}>

                                                <td className="border p-1">{index + 1}</td>

                                                <td className="border p-1">{item.item_name}</td>

                                                <td className="border p-1">{item.category}</td>

                                                <td className="border p-1">
                                                    {item.expiry_date?.slice(0, 10)}
                                                </td>

                                                <td className="border p-1">{item.quantity}</td>

                                                <td className="border p-1">
                                                    {item.last_replaced?.slice(0, 10)}
                                                </td>

                                                <td className="border p-1 text-xs text-gray-400">
                                                    Stock: {item.available_stock}
                                                </td>

                                                <td className="border p-1 text-center">

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={consumed[item.medicine_id] || 0}
                                                        onChange={(e) => handleConsumed(item.medicine_id, e.target.value)}
                                                        className="p-1 text-sm rounded bg-yellow-700"
                                                    />

                                                </td>

                                                <td className="border p-1 text-center">

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={replace[item.medicine_id] || 0}
                                                        onChange={(e) => handleReplace(item.medicine_id, e.target.value)}
                                                        className={`p-1 text-sm rounded ${getColor(replace[item.medicine_id] || 0, item.available_stock)}`}
                                                    />

                                                </td>

                                            </tr>
                                        );

                                    })}
                                    {newItems.map((item, index) => (

                                        <tr key={`new-${index}`}>

                                            <td className="border p-1">*</td>

                                            <td className="border p-1 relative">

                                                <input
                                                    type="text"
                                                    value={item.item_name}
                                                    readOnly={item.medicine_id !== null}
                                                    onChange={(e) => searchMedicine(index, e.target.value)}
                                                    className="bg-gray-800 p-1 text-sm rounded w-full"
                                                />

                                                {medicineResults[index]?.length > 0 && (

                                                    <div className="absolute bg-gray-900 border w-full max-h-40 overflow-y-auto z-10">

                                                        {medicineResults[index].map((m) => (
                                                            <div
                                                                key={m.id}
                                                                onClick={() => selectMedicine(index, m)}
                                                                className="p-1 hover:bg-gray-700 cursor-pointer text-sm flex justify-between"
                                                            >
                                                                <span>{m.drug_name_and_dose}</span>
                                                                <span className="text-xs text-gray-400">Stock: {m.stock}</span>
                                                            </div>
                                                        ))}

                                                    </div>

                                                )}

                                            </td>

                                            <td className="border p-1">{item.category}</td>

                                            <td className="border p-1">-</td>

                                            <td className="border p-1">

                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(index, e.target.value)}
                                                    className="bg-gray-800 p-1 text-sm rounded w-full"
                                                />

                                            </td>

                                            <td className="border p-1">-</td>

                                            <td className="border p-1">-</td>

                                            <td className="border p-1 text-center">

                                                <button
                                                    onClick={() => removeRow(index)}
                                                    className="text-red-400 text-xs"
                                                >
                                                    Remove
                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>
                            </table>
                        </div>
                        <div className="flex w-full justify-between">
                            <button
                                onClick={addRow}
                                className="text-blue-600 flex items-center gap-1 font-semibold text-sm"
                            >
                                <FaPlus />
                                Add to List
                            </button>
                            <button
                                disabled={!isDirty}
                                onClick={saveChanges}
                                className={`flex items-center gap-2 rounded p-2 font-semibold text-sm
${isDirty ? "bg-green-600" : "bg-gray-600 cursor-not-allowed"}`}
                            >
                                <FaFloppyDisk />
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FAB;