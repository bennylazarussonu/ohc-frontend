import { FaCalendarCheck, FaEye, FaFileExcel, FaHandHoldingMedical, FaList, FaMagnifyingGlass, FaPenToSquare, FaPlus } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function FAB() {
    const { user, loading } = useAuth();
    const [viewModal, setViewModal] = useState(false);
    const [zones, setZones] = useState([]);
    const [templateItems, setTemplateItems]
        = useState([]);
    const [templateModal, setTemplateModal]
        = useState(false);
    const [editTemplateModal,
        setEditTemplateModal]
        = useState(false);

    const [editingTemplateItem,
        setEditingTemplateItem]
        = useState(null);

    const [editRequiredQty,
        setEditRequiredQty]
        = useState(1);

    const [medicineSearch, setMedicineSearch]
        = useState("");

    const [medicineResults, setMedicineResults]
        = useState([]);

    const [selectedTemplateMedicine,
        setSelectedTemplateMedicine]
        = useState(null);

    const [requiredQty, setRequiredQty]
        = useState(1);

    const [inventoryBatches, setInventoryBatches]
        = useState([]);

    const [allocateModal, setAllocateModal]
        = useState(false);

    const [selectedMedicine, setSelectedMedicine]
        = useState(null);

    const [availableBatches, setAvailableBatches]
        = useState([]);

    const [selectedBatch, setSelectedBatch]
        = useState(null);

    const [allocateQty, setAllocateQty]
        = useState(1);
    const [consumeInputs,
        setConsumeInputs]
        = useState({});
    const [selectedZone, setSelectedZone] = useState(null);
    const [activeVisit,
        setActiveVisit]
        = useState(null);
    const [lastVisit,
        setLastVisit]
        = useState(null);
    const [visitConfirmModal,
        setVisitConfirmModal]
        = useState(false);
    const [visitZone,
        setVisitZone]
        = useState(null);
    const [inspectionModal,
        setInspectionModal]
        = useState(false);

    const [inspectionTab,
        setInspectionTab]
        = useState("consumption");
    const [addZoneModal, setAddZoneModal] = useState(false);
    const [zoneName, setZoneName] = useState("");
    const [zoneLocation, setZoneLocation] = useState("");
    const [consumptionModal, setConsumptionModal] = useState(false);
    const [consumptionLogs, setConsumptionLogs] = useState([]);

    console.log(consumptionLogs);

    useEffect(() => {
        const fetchZones = async () => {
            const res = await api.get("/api/fab/zones");
            const data = res.data;
            setZones(data);
        }
        fetchZones();
    }, []);

    const searchMedicines = async (
        text
    ) => {

        setMedicineSearch(text);

        if (text.length < 2) {

            setMedicineResults([]);

            return;
        }

        try {

            const res =
                await api.get(

                    `/api/medicines/fab-search?q=${text}`
                );

            setMedicineResults(
                res.data
            );

        } catch (err) {

            console.error(err);
        }
    };

    const addTemplateItem = async () => {

        try {

            if (!selectedTemplateMedicine) {

                alert("Select medicine");

                return;
            }

            await api.post(

                `/api/fab/templates/${selectedZone.id}/template-items`,

                {
                    medicine_id:
                        selectedTemplateMedicine.id,

                    default_quantity:
                        requiredQty
                }
            );

            const res =
                await api.get(

                    `/api/fab/templates/${selectedZone.id}/template-items`
                );

            setTemplateItems(
                res.data
            );

            setTemplateModal(false);
            setMedicineSearch("");

            setMedicineResults([]);

            setSelectedTemplateMedicine(null);

            setRequiredQty(1);

        } catch (err) {

            console.error(err);

            alert(
                err?.response?.data?.message
                || "Failed to add template item"
            );
        }
    };

    const editTemplateItem = (
        item
    ) => {

        setEditingTemplateItem(item);

        setEditRequiredQty(
            item.default_quantity
        );

        setEditTemplateModal(true);
    };

    const updateTemplateQty = async () => {

        try {

            await api.put(

                `/api/fab/templates/${selectedZone.id}/template-items/${editingTemplateItem.medicine_id}`,

                {
                    default_quantity:
                        editRequiredQty
                }
            );

            const res =
                await api.get(

                    `/api/fab/templates/${selectedZone.id}/template-items`
                );

            setTemplateItems(
                res.data
            );

            setEditTemplateModal(false);

        } catch (err) {

            console.error(err);

            alert(
                "Failed to update template"
            );
        }
    };

    const openAllocateModal = async (
        medicine
    ) => {

        try {

            const res =
                await api.get(

                    `/api/fab/inventory/available/${medicine.medicine_id}`
                );

            setAvailableBatches(
                res.data
            );

            setSelectedMedicine(
                medicine
            );

            setSelectedBatch(null);

            setAllocateQty(1);

            setAllocateModal(true);

        } catch (err) {

            console.error(err);

            alert(
                "Failed to fetch batches"
            );
        }
    };

    const allocateStock = async () => {

        try {

            if (!selectedBatch) {

                alert("Select batch");

                return;
            }

            if (allocateQty < 1) {

                alert("Invalid quantity");

                return;
            }

            if (allocateQty > selectedBatch.units) {

                alert("Insufficient stock");

                return;
            }

            await api.post(

                `/api/fab/inventory/${selectedZone.id}/allocate`,

                {
                    stock_id:
                        selectedBatch.id,

                    visit_id:
                        activeVisit?.id,

                    quantity:
                        allocateQty
                }
            );

            const inventoryRes =
                await api.get(

                    `/api/fab/inventory/${selectedZone.id}/inventory`
                );

            setInventoryBatches(
                inventoryRes.data
            );

            const updatedAllocated =
                inventoryRes.data
                    .filter(
                        batch =>
                            batch.medicine_id
                            === selectedMedicine.medicine_id
                    )
                    .reduce(
                        (sum, batch) =>
                            sum + batch.quantity,
                        0
                    );

            const remaining =
                selectedMedicine.default_quantity
                - updatedAllocated;

            if (remaining <= 0) {

                setAllocateModal(false);
            }

            const batchRes =
                await api.get(

                    `/api/fab/inventory/available/${selectedMedicine.medicine_id}`
                );

            setAvailableBatches(
                batchRes.data
            );
            setSelectedBatch(null);

        } catch (err) {

            console.error(err);

            alert(
                err?.response?.data?.message
                || "Allocation failed"
            );
        }
    };

    const startVisit = async (zone) => {

        try {

            const res =
                await api.post(

                    `/api/fab/inventory/${zone.id}/start-visit`,

                    {

                        visited_by:
                            user.userId
                            || "Unknown",

                        remarks:
                            "Routine inspection"
                    }
                );

            setActiveVisit(
                res.data
            );
            setSelectedZone(zone);
            await loadZoneData(zone);
            setInspectionTab(
                "consumption"
            );

            setInspectionModal(true);
            setVisitConfirmModal(false);

            setVisitZone(null);

            alert(
                "Visit started"
            );

        } catch (err) {

            if (
                err?.response?.data?.visit
            ) {

                setActiveVisit(

                    err.response.data.visit
                );
                setSelectedZone(zone);
                await loadZoneData(zone);
                setInspectionTab(
                    "consumption"
                );

                setInspectionModal(true);

                alert(
                    "Continuing existing visit"
                );

                return;
            }
        }
    };
    const closeVisit = async () => {

        try {

            if (!activeVisit) {

                alert(
                    "No active visit"
                );

                return;
            }

            await api.post(

                `/api/fab/inventory/visits/${activeVisit.id}/close`
            );

            alert(
                "Visit closed"
            );

            setActiveVisit(null);
            setInspectionModal(false);

        } catch (err) {

            console.error(err);

            alert(
                err?.response?.data?.message
                || "Failed to close visit"
            );
        }
    };

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

    const openZone = async (
        zone
    ) => {

        try {

            await loadZoneData(zone);

        } catch (err) {

            console.error(err);

            alert(
                "Failed to open zone"
            );
        }
    };

    const loadZoneData = async (
        zone
    ) => {

        const templateRes =
            await api.get(

                `/api/fab/templates/${zone.id}/template-items`
            );

        const inventoryRes =
            await api.get(

                `/api/fab/inventory/${zone.id}/inventory`
            );

        const visitRes =
            await api.get(

                `/api/fab/inventory/${zone.id}/last-visit`
            );

        const activeVisitRes =
            await api.get(

                `/api/fab/inventory/${zone.id}/active-visit`
            );

        setActiveVisit(
            activeVisitRes.data
        );

        setTemplateItems(
            templateRes.data
        );

        setInventoryBatches(
            inventoryRes.data
        );

        setLastVisit(
            visitRes.data
        );

        setSelectedZone(zone);
    };

    const openConsumption = async (zone) => {
        const res = await api.get(`/api/fab/zones/${zone.id}/consumption`);

        setConsumptionLogs(res.data);
        setSelectedZone(zone);
        setConsumptionModal(true);
    };

    const downloadExcel = () => {

        const generatedDate = new Date()
            .toLocaleString();

        // table rows
        const data =
            inventoryBatches.map(

                (item, index) => ({

                    "S. No.":
                        index + 1,

                    "Medicine":
                        item.item_name,

                    "Brand":
                        item.brand,

                    "Expiry":
                        item.expiry_date
                            ?.slice(0, 10),

                    "Quantity":
                        item.quantity,

                    "Cost":
                        item.per_unit_cost
                })
            );

        // create worksheet
        const worksheet = XLSX.utils.json_to_sheet([]);

        // TOP INFO
        XLSX.utils.sheet_add_aoa(
            worksheet,
            [
                [`Zone Name: ${selectedZone?.zone_name}`],
                [`Location: ${selectedZone?.location}`],
                [`Generated On: ${generatedDate}`],
                [], // empty row
            ],
            { origin: "A1" }
        );

        // TABLE
        XLSX.utils.sheet_add_json(
            worksheet,
            data,
            {
                origin: "A5"
            }
        );

        // optional column widths
        worksheet["!cols"] = [
            { wch: 8 },
            { wch: 40 },
            { wch: 25 },
            { wch: 15 },
            { wch: 12 },
            { wch: 18 }
        ];

        // workbook
        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Zone Contents"
        );

        const excelBuffer =
            XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array"
            });

        const fileData = new Blob(
            [excelBuffer],
            {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        );

        const safeDate = new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/:/g, "-");

        saveAs(
            fileData,
            `${selectedZone?.zone_name}_${safeDate}.xlsx`
        );

    };

    const saveConsumption = async () => {

        try {

            const entries =
                Object.entries(
                    consumeInputs
                );

            if (
                entries.length === 0
            ) {

                alert(
                    "No consumption entered"
                );

                return;
            }

            for (const [
                batchId,
                qty
            ] of entries) {

                const quantity =
                    Number(qty);

                if (
                    quantity < 1
                ) {
                    continue;
                }

                await api.post(

                    `/api/fab/inventory/${selectedZone.id}/consume`,

                    {
                        visit_id: activeVisit?.id,
                        inventory_batch_id:
                            batchId,

                        quantity,

                        reason:
                            "USED"
                    }
                );
            }

            const inventoryRes =
                await api.get(

                    `/api/fab/inventory/${selectedZone.id}/inventory`
                );

            setInventoryBatches(
                inventoryRes.data
            );

            setConsumeInputs({});

            alert(
                "Consumption saved"
            );

        } catch (err) {

            console.error(err);

            alert(
                err?.response?.data?.message
                || "Consumption failed"
            );
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
                                <th className="p-2 border">Inspection</th>
                                <th className="p-2 border">View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {zones.map((zone) => (
                                <tr key={zone.id}>
                                    <td className="p-2 border">{zone.id}</td>
                                    <td className="p-2 border">{zone.zone_name}</td>
                                    <td className="p-2 border">{zone.location}</td>

                                    <td className="p-2 border">

                                        <div className="flex gap-2">

                                            <button

                                                onClick={() => {

                                                    setVisitZone(zone);

                                                    setVisitConfirmModal(true);
                                                }}

                                                disabled={
                                                    activeVisit?.zone_id === zone.id
                                                }

                                                className={`
                p-1 flex text-xs items-center gap-2 text-white rounded

                ${activeVisit?.zone_id === zone.id
                                                        ? "bg-gray-600 opacity-50 cursor-not-allowed"
                                                        : "bg-blue-600"
                                                    }
            `}
                                            >
                                                <FaCalendarCheck />

                                                Start Inspection
                                            </button>



                                        </div>

                                    </td>
                                    {/* <td className="p-2 border">
                                        <button

                                            onClick={() => {

                                                setVisitZone(zone);

                                                setVisitConfirmModal(true);
                                            }}

                                            className="p-1 bg-blue-600 flex text-xs items-center gap-2 text-white rounded"
                                        >
                                            <FaCalendarCheck />

                                            Start Inspection
                                        </button>

                                        <button
                                            onClick={() => openZone(zone)}
                                            className="p-2 text-sm bg-blue-600 flex items-center gap-2 font-semibold text-white rounded"
                                        >
                                            <FaEye />
                                            Manage Consumption
                                        </button>
                                        <button
                                            onClick={async () => {

                                                try {

                                                    const templateRes =
                                                        await api.get(
                                                            `/api/fab/templates/${zone.id}/template-items`
                                                        );

                                                    const inventoryRes =
                                                        await api.get(
                                                            `/api/fab/inventory/${zone.id}/inventory`
                                                        );

                                                    setTemplateItems(
                                                        templateRes.data
                                                    );

                                                    setInventoryBatches(
                                                        inventoryRes.data
                                                    );

                                                    setSelectedZone(zone);

                                                    setTemplateViewModal(true);

                                                } catch (err) {

                                                    console.error(err);

                                                    alert("Failed to open template");

                                                }

                                            }}
                                            className="text-sm bg-purple-600 flex items-center gap-2 p-2 font-semibold text-white rounded">
                                            <FaList />
                                            Template & Allocation
                                        </button>
                                    </td> */}

                                    <td className="p-2 border">
                                        <button className="p-1 bg-green-600 flex text-xs items-center gap-2 text-white rounded">
                                            <FaEye />
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {visitConfirmModal && (

                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

                    <div className="bg-gray-900 p-6 rounded-lg w-[420px]">

                        <h2 className="text-lg font-bold mb-3">

                            Start Inspection

                        </h2>

                        <p className="text-sm text-gray-300">

                            Are you sure you want to start an inspection visit for:

                        </p>

                        <div className="mt-3 bg-gray-800 p-3 rounded">

                            <p className="font-semibold">

                                {visitZone?.zone_name}

                            </p>

                            <p className="text-sm text-gray-400">

                                {visitZone?.location}

                            </p>

                        </div>

                        <p className="text-xs text-yellow-400 mt-3">

                            Only one active visit is allowed per zone.

                        </p>

                        <div className="flex justify-end gap-2 mt-5">

                            <button

                                onClick={() => {

                                    setVisitConfirmModal(false);

                                    setVisitZone(null);
                                }}

                                className="bg-gray-600 px-4 py-2 rounded text-sm"
                            >
                                Cancel
                            </button>

                            <button

                                onClick={() =>
                                    startVisit(visitZone)
                                }

                                className="bg-green-600 px-4 py-2 rounded text-sm font-semibold"
                            >
                                Start Inspection
                            </button>

                        </div>

                    </div>

                </div>
            )}
            {templateModal && (

                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[70]">

                    <div className="bg-gray-900 p-6 rounded w-[700px]">

                        <div className="flex justify-between items-center mb-4">

                            <h2 className="text-lg font-bold">
                                Add Template Medicine
                            </h2>

                            <button
                                onClick={() =>
                                    setTemplateModal(false)
                                }
                            >
                                x
                            </button>

                        </div>

                        <input
                            type="text"
                            placeholder="Search medicine..."
                            value={medicineSearch}
                            onChange={(e) =>
                                searchMedicines(
                                    e.target.value
                                )
                            }
                            className="w-full bg-gray-800 p-2 rounded"
                        />

                        <div className="mt-4 max-h-[250px] overflow-y-auto border">

                            <table className="w-full text-sm">

                                <thead className="bg-gray-800">

                                    <tr>

                                        <th className="border p-2">
                                            Medicine
                                        </th>

                                        <th className="border p-2">
                                            Category
                                        </th>

                                        <th className="border p-2">
                                            Select
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {medicineResults.map((medicine) => (

                                        <tr key={medicine.id}>

                                            <td className="border p-2">
                                                {medicine.drug_name_and_dose}
                                            </td>

                                            <td className="border p-2">
                                                {medicine.category}
                                            </td>

                                            <td className="border p-2 text-center">

                                                <input
                                                    type="radio"

                                                    checked={
                                                        selectedTemplateMedicine?.id
                                                        === medicine.id
                                                    }

                                                    onChange={() =>
                                                        setSelectedTemplateMedicine(
                                                            medicine
                                                        )
                                                    }
                                                />

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                        <div className="mt-4">

                            <label className="text-sm">
                                Required Quantity
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={requiredQty}
                                onChange={(e) =>
                                    setRequiredQty(
                                        Number(e.target.value)
                                    )
                                }
                                className="w-full bg-gray-800 p-2 rounded mt-1"
                            />

                        </div>

                        <button
                            onClick={addTemplateItem}
                            className="mt-4 bg-green-600 px-4 py-2 rounded"
                        >
                            Add To Template
                        </button>

                    </div>

                </div>

            )}
            {allocateModal && (

                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[80]">

                    <div className="bg-gray-900 p-6 rounded w-[700px]">

                        <div className="flex justify-between items-center mb-4">

                            <h2 className="font-bold text-lg">
                                Allocate Stock
                            </h2>

                            <button
                                onClick={() =>
                                    setAllocateModal(false)
                                }
                            >
                                x
                            </button>

                        </div>

                        <table className="w-full border text-sm">

                            <thead className="bg-gray-800">

                                <tr>

                                    <th className="border p-2">
                                        Brand
                                    </th>

                                    <th className="border p-2">
                                        Expiry
                                    </th>

                                    <th className="border p-2">
                                        Available
                                    </th>

                                    <th className="border p-2">
                                        Cost
                                    </th>

                                    <th className="border p-2">
                                        Select
                                    </th>

                                </tr>

                            </thead>

                            <tbody>
                                {availableBatches.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan={5}
                                            className="border p-4 text-center text-gray-400"
                                        >
                                            No stock batches available
                                        </td>

                                    </tr>

                                )}

                                {availableBatches.map((batch) => (

                                    <tr key={batch.id} className={batch.id}>

                                        <td className="border p-2">
                                            {batch.brand}
                                        </td>

                                        <td className="border p-2">

                                            {batch.expiry_date
                                                ?.slice(0, 10)}

                                        </td>

                                        <td className="border p-2">
                                            {batch.units}
                                        </td>

                                        <td className="border p-2">
                                            {batch.per_unit_cost}
                                        </td>

                                        <td className="border p-2 text-center">

                                            <input
                                                type="radio"
                                                checked={
                                                    selectedBatch?.id
                                                    === batch.id
                                                }
                                                onChange={() =>
                                                    setSelectedBatch(batch)
                                                }
                                            />

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                        <p className="text-sm mb-3">

                            Remaining Required:
                            {" "}

                            {
                                selectedMedicine?.default_quantity
                                -
                                inventoryBatches
                                    .filter(
                                        batch =>
                                            batch.medicine_id
                                            === selectedMedicine?.medicine_id
                                    )
                                    .reduce(
                                        (sum, batch) =>
                                            sum + batch.quantity,
                                        0
                                    )
                            }

                        </p>

                        <div className="mt-4">

                            <input
                                type="number"
                                min="1"
                                value={allocateQty}
                                onChange={(e) =>
                                    setAllocateQty(
                                        Number(e.target.value)
                                    )
                                }
                                className="bg-gray-800 p-2 rounded w-full"
                            />

                        </div>

                        <button
                            disabled={!selectedBatch}
                            onClick={allocateStock}
                            className={`${!selectedBatch
                                ? "opacity-50 cursor-not-allowed"
                                : ""}mt-4 bg-green-600 px-4 py-2 rounded`}
                        >
                            Allocate
                        </button>

                    </div>

                </div>

            )}
            {inspectionModal && (

                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

                    <div className="w-4/5 h-[90vh] bg-gray-900 rounded-xl p-6 overflow-hidden">

                        <div className="flex justify-between items-center mb-4">

                            <div>

                                <h2 className="text-xl font-bold">

                                    Inspection Visit

                                </h2>

                                <p className="text-sm text-gray-400">

                                    {selectedZone?.zone_name}
                                </p>

                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={downloadExcel}
                                    className="flex items-center gap-1 bg-green-700 px-3 py-2 rounded text-sm font-semibold"
                                >
                                    <FaFileExcel />
                                    Download Excel
                                </button>
                                <button

                                    onClick={closeVisit}
                                    disabled={
                                        activeVisit?.zone_id !== selectedZone?.id
                                    }

                                    className={`
                p-1 flex text-xs items-center gap-2 text-white rounded

                ${activeVisit?.zone_id !== selectedZone?.id
                                            ? "bg-gray-600 opacity-50 cursor-not-allowed"
                                            : "bg-red-600"
                                        }
            `}
                                >
                                    <FaCalendarCheck />

                                    Close Inspection
                                </button>
                            </div>

                        </div>

                        {/* TABS */}

                        <div className="flex gap-2 border-b border-gray-700 pb-2 mb-4">

                            <button

                                onClick={() =>
                                    setInspectionTab(
                                        "consumption"
                                    )
                                }

                                className={`
                        px-4 py-2 rounded text-sm font-semibold

                        ${inspectionTab === "consumption"
                                        ? "bg-blue-600"
                                        : "bg-gray-700"
                                    }
                    `}
                            >
                                Consumption
                            </button>

                            <button

                                onClick={() =>
                                    setInspectionTab(
                                        "allocation"
                                    )
                                }

                                className={`
                        px-4 py-2 rounded text-sm font-semibold

                        ${inspectionTab === "allocation"
                                        ? "bg-green-600"
                                        : "bg-gray-700"
                                    }
                    `}
                            >
                                Replacement
                            </button>

                        </div>

                        {/* TAB CONTENT */}

                        <div className="h-[calc(100%-120px)] overflow-auto">

                            {inspectionTab === "consumption" && (

                                <div className=" rounded h-[350px] overflow-scroll no-scrollbar">

                                    {/* MOVE CONSUMPTION TABLE HERE */}
                                    <div className="h-[350px]">

                                        <h3 className="font-bold text-lg">

                                            Contents of First Aid Box
                                            {" "}
                                            as per the Last Date of Visit
                                            {" - "}

                                            {
                                                lastVisit?.visit_date
                                                    ?.slice(0, 10)

                                                ||

                                                "No Visit Yet"
                                            }

                                        </h3>
                                        <p className="text-sm text-gray-400 mb-2">

                                            Total Batches:
                                            {" "}
                                            {inventoryBatches.length}

                                        </p>
                                        <div className="h-[300px] overflow-scroll no-scrollbar">

                                        
                                        <table className="w-full border text-sm ">

                                            <thead className="bg-gray-800">

                                                <tr>
                                                    <th className="border p-1">
                                                        Medicine
                                                    </th>

                                                    <th className="border p-1">
                                                        Brand
                                                    </th>

                                                    <th className="border p-1">
                                                        Expiry
                                                    </th>

                                                    <th className="border p-1">
                                                        Quantity
                                                    </th>

                                                    <th className="border p-1">
                                                        Cost
                                                    </th>

                                                    <th className="border p-1">
                                                        Quantity Consumed
                                                    </th>
                                                </tr>

                                            </thead>

                                            <tbody>

                                                {inventoryBatches.map((batch, index) => (

                                                    <tr key={index}>
                                                        <td className="border p-1">
                                                            {batch.item_name}
                                                        </td>

                                                        <td className="border p-1">
                                                            {batch.brand}
                                                        </td>

                                                        <td className="border p-1">

                                                            {batch.expiry_date
                                                                ?.slice(0, 10)}

                                                        </td>

                                                        <td className="border p-1">
                                                            {batch.quantity}
                                                        </td>

                                                        <td className="border p-1">
                                                            {batch.per_unit_cost}
                                                        </td>

                                                        <td className="border p-1 text-center">

                                                            <input
                                                                type="number"

                                                                min="0"

                                                                max={batch.quantity}

                                                                value={
                                                                    consumeInputs[batch._id]
                                                                    || ""
                                                                }

                                                                onChange={(e) => {

                                                                    const value =
                                                                        e.target.value;

                                                                    setConsumeInputs({

                                                                        ...consumeInputs,

                                                                        [batch._id]:
                                                                            value
                                                                    });

                                                                }}

                                                                className="w-[80px] bg-gray-800 p-1 rounded text-center"
                                                            />

                                                        </td>

                                                    </tr>

                                                ))}


                                            </tbody>

                                        </table>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-4">

                                        <button

                                            onClick={saveConsumption}

                                            disabled={!activeVisit}

                                            className={`
        px-4 py-2 rounded text-sm font-semibold

        ${!activeVisit
                                                    ? "bg-gray-600 opacity-50 cursor-not-allowed"
                                                    : "bg-red-600"
                                                }
    `}
                                        >
                                            Mark as Consumed
                                        </button>

                                    </div>
                                </div>
                            )}

                            {inspectionTab === "allocation" && (

                                <div>

                                    <div className="w-full h-[300px] overflow-y-auto no-scrollbar">
                                        <table className="border w-full">
                                            <thead className="bg-gray-800">
                                                <tr>
                                                    <th className="border p-1">
                                                        S.No
                                                    </th>

                                                    <th className="border p-1">
                                                        Medicine
                                                    </th>

                                                    <th className="border p-1">
                                                        Category
                                                    </th>

                                                    <th className="border p-1">
                                                        Required Qty
                                                    </th>

                                                    <th className="border p-1">
                                                        Current Quantity
                                                    </th>

                                                    <th className="border p-1">
                                                        Consumed
                                                    </th>

                                                    <th className="border p-1">
                                                        Allocate
                                                    </th>
                                                    <th className="border p-1">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>

                                                {templateItems.map((item, index) => {
                                                    const allocatedQty =
                                                        inventoryBatches
                                                            .filter(
                                                                batch =>
                                                                    batch.medicine_id
                                                                    === item.medicine_id
                                                            )
                                                            .reduce(
                                                                (sum, batch) =>
                                                                    sum + batch.quantity,
                                                                0
                                                            );

                                                    const remainingQty =
                                                        item.default_quantity
                                                        - allocatedQty;

                                                    return (
                                                        <tr key={index}>

                                                            <td className="border p-1">
                                                                {index + 1}
                                                            </td>

                                                            <td className="border p-1">
                                                                {item.item_name}
                                                            </td>

                                                            <td className="border p-1">
                                                                {item.category}
                                                            </td>

                                                            <td className="border p-1">
                                                                {item.default_quantity}
                                                            </td>

                                                            <td className="border p-1 text-center">
                                                                {allocatedQty}
                                                            </td>

                                                            <td
                                                                className={`border p-1 text-center font-semibold ${remainingQty > 0
                                                                    ? "text-red-400"
                                                                    : "text-green-400"
                                                                    }`}
                                                            >
                                                                {remainingQty}
                                                            </td>

                                                            <td className="border p-1">

                                                                <button
                                                                    onClick={() =>
                                                                        openAllocateModal(item)
                                                                    }

                                                                    disabled={
                                                                        remainingQty <= 0
                                                                        || !activeVisit
                                                                    }

                                                                    className={`
                px-2 py-1 rounded text-xs

                ${remainingQty <= 0 || !activeVisit
                                                                            ? "bg-gray-600 opacity-50 cursor-not-allowed"
                                                                            : "bg-blue-600"
                                                                        }
            `}
                                                                >
                                                                    Allocate
                                                                </button>

                                                            </td>
                                                            <td className="border p-1">

                                                                <div className="flex gap-2">

                                                                    <button
                                                                        onClick={() =>
                                                                            editTemplateItem(item)
                                                                        }
                                                                        className="bg-yellow-600 px-2 py-1 rounded text-xs"
                                                                    >
                                                                        Edit
                                                                    </button>

                                                                    <button
                                                                        onClick={() =>
                                                                            deleteTemplateItem(item)
                                                                        }
                                                                        className="bg-red-600 px-2 py-1 rounded text-xs"
                                                                    >
                                                                        Delete
                                                                    </button>

                                                                </div>

                                                            </td>

                                                        </tr>

                                                    )
                                                })}

                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex justify-between mt-3">
                                        <div className="flex justify-end mb-2">

                                            <button
                                                onClick={() =>
                                                    setTemplateModal(true)
                                                }
                                                className="bg-blue-600 px-3 py-2 rounded text-sm font-semibold flex items-center gap-2"
                                            >
                                                <FaPlus />
                                                Add Template Medicine
                                            </button>

                                        </div>
                                    </div>

                                </div>
                            )}

                        </div>

                    </div>

                </div>
            )}
            {editTemplateModal && (

                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[90]">

                    <div className="bg-gray-900 p-6 rounded w-[400px]">

                        <div className="flex justify-between items-center mb-4">

                            <h2 className="font-bold text-lg">
                                Edit Required Quantity
                            </h2>

                            <button
                                onClick={() =>
                                    setEditTemplateModal(false)
                                }
                            >
                                x
                            </button>

                        </div>

                        <p className="mb-3 text-sm">

                            {editingTemplateItem?.item_name}

                        </p>

                        <input
                            type="number"
                            min="1"
                            value={editRequiredQty}
                            onChange={(e) =>
                                setEditRequiredQty(
                                    Number(e.target.value)
                                )
                            }
                            className="w-full bg-gray-800 p-2 rounded"
                        />

                        <button
                            onClick={updateTemplateQty}
                            className="mt-4 bg-green-600 px-4 py-2 rounded"
                        >
                            Save
                        </button>

                    </div>

                </div>

            )}
        </div>
    );
}

export default FAB;