import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import * as XLSX from "xlsx";
import { FaLock, FaLockOpen, FaMedkit, FaPlus } from "react-icons/fa";
import { FaFloppyDisk, FaTableList, FaFileExcel } from "react-icons/fa6";

function FAB() {
    const { user, loading } = useAuth();

    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState(null);
    const [showAddZoneForm, setShowAddZoneForm] = useState(false);
    const [newZoneName, setNewZoneName] = useState("");
    const [newZoneLocation, setNewZoneLocation] = useState("");
    const [inventory, setInventory] = useState([]);
    const [fabLoading, setFabLoading] = useState(false);
    const [expandedMedicine, setExpandedMedicine] = useState(null);
    const [openVisit, setOpenVisit] = useState(null);
    const [showAllocateForm, setShowAllocateForm] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [selectedStock, setSelectedStock] = useState(null);
    const [allocationQuantity, setAllocationQuantity] = useState("");
    const [showReconcileModal, setShowReconcileModal] = useState(false);
    const [reconciliationQuantities, setReconciliationQuantities] = useState({});
    const [centralStock, setCentralStock] = useState([]);
    const [showConsumeForm, setShowConsumeForm] = useState(false);
    const [consumptionMedicine, setConsumptionMedicine] = useState(null);
    const [consumptionQuantity, setConsumptionQuantity] = useState("");
    const [consumptionReason, setConsumptionReason] = useState("");
    const [consumedQuantities, setConsumedQuantities] = useState({});
    const [allocationQuantities, setAllocationQuantities] = useState({});
    const [medicines, setMedicines] = useState([]);
    const [templateMedicineSearch, setTemplateMedicineSearch] = useState("");
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [templateMedicine, setTemplateMedicine] = useState("");
    const [templateQuantity, setTemplateQuantity] = useState("");
    const [templateOpeningQuantity, setTemplateOpeningQuantity] = useState("");
    const [templateOpeningBrand, setTemplateOpeningBrand] = useState("");
    const [templateOpeningExpiry, setTemplateOpeningExpiry] = useState("");
    const [templateOpeningCost, setTemplateOpeningCost] = useState("");
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [visitHistory, setVisitHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");

    useEffect(() => {
        const loadZones = async () => {
            try {
                const response = await api.get("/api/fab/zones");

                setZones(response.data);
            } catch (error) {
                console.error("Failed to load zones:", error);
            }
        };

        loadZones();
    }, []);

    useEffect(() => {
        const loadMedicines = async () => {
            try {
                const response = await api.get("/api/medicines");
                console.log(response.data);

                setMedicines(response.data || []);
            } catch (error) {
                console.error("Failed to load medicines:", error);
            }
        };

        loadMedicines();
    }, []);

    useEffect(() => {
        if (!selectedZone) return;

        const loadFABData = async () => {
            try {
                setFabLoading(true);

                const inventoryResponse = await api.get(
                    `/api/fab/inventory/${selectedZone.id}`
                );

                setInventory(inventoryResponse.data.inventory || []);

                const visitResponse = await api.get(`/api/fab/visit/open/${selectedZone.id}`);

                setOpenVisit(visitResponse.data.visit || null);

                const stockResponse = await api.get("/api/stock");
                setCentralStock(stockResponse.data);
                console.log("Central Stock:", stockResponse.data);
            } catch (error) {
                console.error("Failed to load FAB data:", error);

                setInventory([]);
                setOpenVisit(null);
            } finally {
                setFabLoading(false);
            }
        };

        loadFABData();
    }, [selectedZone]);



    const openFABVisit = async () => {
        if (!selectedZone) return;

        try {
            setFabLoading(true);

            const response = await api.post("/api/fab/visit/open", {
                zone_id: selectedZone.id,
                started_by: user?.name || user?.username || "Unknown",
            });

            setOpenVisit(response.data.visit);

        } catch (error) {
            console.error("Failed to open FAB visit:", error);

            alert(
                error.response?.data?.message ||
                "Failed to open FAB visit"
            );
        } finally {
            setFabLoading(false);
        }
    };

    const closeFABVisit = async () => {
        if (!selectedZone || !openVisit) return;

        try {
            setFabLoading(true);

            await api.post("/api/fab/visit/close", {
                zone_id: selectedZone.id,
                closed_by: user?.name || user?.username || "Unknown",
            });

            setOpenVisit(null);

        } catch (error) {
            console.error("Failed to close FAB visit:", error);

            alert(
                error.response?.data?.message ||
                "Failed to close FAB visit"
            );
        } finally {
            setFabLoading(false);
        }
    };

    const allocateMedicine = async () => {
        if (!selectedZone || !openVisit || !selectedMedicine || !selectedStock) {
            alert("Please select a medicine and stock batch.");
            return;
        }

        const quantity = Number(allocationQuantity);

        if (!Number.isInteger(quantity) || quantity < 1) {
            alert("Please enter a valid quantity.");
            return;
        }

        if (quantity > selectedStock.units) {
            alert(`Only ${selectedStock.units} units are available in this stock batch.`);
            return;
        }

        try {
            setFabLoading(true);

            await api.post("/api/fab/allocate", {
                visit_id: openVisit._id,
                zone_id: selectedZone.id,
                medicine_id: selectedMedicine.medicine_id,
                stock_id: selectedStock.stock_id,
                quantity,
                allocated_by: user?.name || user?.username || "Unknown",
            });

            alert("Medicine allocated successfully.");

            setSelectedMedicine(null);
            setSelectedStock(null);
            setAllocationQuantity("");
            setShowAllocateForm(false);

            const inventoryResponse = await api.get(
                `/api/fab/inventory/${selectedZone.id}`
            );

            setInventory(inventoryResponse.data.inventory || []);

            const stockResponse = await api.get("/api/stock");
            setCentralStock(stockResponse.data);
        } catch (error) {
            console.error("Failed to allocate medicine:", error);

            alert(
                error.response?.data?.message ||
                "Failed to allocate medicine"
            );
        } finally {
            setFabLoading(false);
        }
    };

    const createZone = async () => {
        if (!newZoneName.trim()) {
            alert("Please enter a zone name.");
            return;
        }

        try {
            setFabLoading(true);

            await api.post("/api/fab/zones", {
                zone_name: newZoneName.trim(),
                location: newZoneLocation.trim()
            });

            alert("Zone created successfully.");

            setNewZoneName("");
            setNewZoneLocation("");
            setShowAddZoneForm(false);

            const response = await api.get("/api/fab/zones");
            setZones(response.data || []);
        } catch (error) {
            console.error("Failed to create zone:", error);

            alert(
                error.response?.data?.message ||
                "Failed to create zone"
            );
        } finally {
            setFabLoading(false);
        }
    };

    const deleteZone = async (zone) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${zone.zone_name}"?`
        );

        if (!confirmed) {
            return;
        }

        const returnToStock = window.confirm(
            "Add this Zones items back to stock?"
        );

        try {
            setFabLoading(true);

            await api.delete(`/api/fab/zones/${zone.id}`, {
                data: {
                    return_to_stock: returnToStock
                }
            });

            alert(
                returnToStock
                    ? "Zone deleted and remaining stock returned successfully."
                    : "Zone deleted successfully."
            );

            if (selectedZone?.id === zone.id) {
                setSelectedZone(null);
                setInventory([]);
                setOpenVisit(null);
            }

            const response = await api.get("/api/fab/zones");
            setZones(response.data || []);
        } catch (error) {
            console.error("Failed to delete zone:", error);

            alert(
                error.response?.data?.message ||
                "Failed to delete zone"
            );
        } finally {
            setFabLoading(false);
        }
    };

    const createTemplate = async () => {
        if (!selectedZone) {
            alert("Please select a FAB.");
            return;
        }

        if (!templateMedicine) {
            alert("Please select a medicine.");
            return;
        }

        const quantity = Number(templateQuantity);
        const openingQuantity = Number(templateOpeningQuantity || 0);
        const openingCost = Number(templateOpeningCost || 0);

        if (!Number.isInteger(quantity) || quantity < 1) {
            alert("Please enter a valid required quantity.");
            return;
        }

        if (!Number.isInteger(openingQuantity) || openingQuantity < 0) {
            alert("Please enter a valid opening quantity.");
            return;
        }

        if (openingCost < 0) {
            alert("Please enter a valid opening cost.");
            return;
        }

        try {
            setFabLoading(true);

            await api.post("/api/fab/template", {
                zone_id: selectedZone.id,
                medicine_id: Number(templateMedicine),
                required_quantity: quantity,

                opening_quantity: openingQuantity,
                opening_brand: templateOpeningBrand,
                opening_expiry_date: templateOpeningExpiry || null,
                opening_per_unit_cost: openingCost
            });

            alert("FAB template item created successfully.");

            setTemplateMedicine("");
            setTemplateMedicineSearch("");
            setTemplateQuantity("");
            setTemplateOpeningQuantity("");
            setTemplateOpeningBrand("");
            setTemplateOpeningExpiry("");
            setTemplateOpeningCost("");
            setShowTemplateForm(false);

            const inventoryResponse = await api.get(
                `/api/fab/inventory/${selectedZone.id}`
            );

            setInventory(inventoryResponse.data.inventory || []);
        } catch (error) {
            console.error("Failed to create FAB template:", error);

            alert(
                error.response?.data?.message ||
                "Failed to create FAB template"
            );
        } finally {
            setFabLoading(false);
        }
    };

    const consumeMedicine = async () => {
        if (!selectedZone || !openVisit || !consumptionMedicine) {
            alert("Please select a medicine.");
            return;
        }

        const quantity = Number(consumptionQuantity);

        if (!Number.isInteger(quantity) || quantity < 1) {
            alert("Please enter a valid quantity.");
            return;
        }

        if (quantity > consumptionMedicine.current_quantity) {
            alert(
                `Only ${consumptionMedicine.current_quantity} units are currently available in this FAB.`
            );
            return;
        }

        try {
            setFabLoading(true);

            await api.post("/api/fab/consume", {
                zone_id: selectedZone.id,
                medicine_id: consumptionMedicine.medicine_id,
                quantity,
                reason: consumptionReason.trim(),
                consumed_by: user?.name || user?.username || "Unknown",
            });

            alert("Medicine consumed successfully.");

            setConsumptionMedicine(null);
            setConsumptionQuantity("");
            setConsumptionReason("");
            setShowConsumeForm(false);

            const inventoryResponse = await api.get(
                `/api/fab/inventory/${selectedZone.id}`
            );

            setInventory(inventoryResponse.data.inventory || []);
        } catch (error) {
            console.error("Failed to consume medicine:", error);

            alert(
                error.response?.data?.message ||
                "Failed to consume medicine"
            );
        } finally {
            setFabLoading(false);
        }
    };

    const handleConsumedQuantityChange = (medicineId, value) => {
        setConsumedQuantities((previous) => ({
            ...previous,
            [medicineId]: value
        }));
    };

    const handleReconciliationQuantityChange = (medicineId, value) => {
        setReconciliationQuantities((previous) => ({
            ...previous,
            [medicineId]: value
        }));
    };

    const saveStockCount = async () => {
        if (!selectedZone || !openVisit) {
            alert("Please open a FAB visit first.");
            return;
        }

        // Validate physical quantities
        const invalidPhysicalEntries = inventory.filter((item) => {
            const rawValue = reconciliationQuantities[item.medicine_id];

            return (
                rawValue === undefined ||
                rawValue === "" ||
                !Number.isInteger(Number(rawValue)) ||
                Number(rawValue) < 0
            );
        });

        if (invalidPhysicalEntries.length > 0) {
            alert("Please enter a valid physical quantity for every medicine.");
            return;
        }



        // Prepare both physical count and allocation quantities
        const counts = inventory.map((item) => ({
            medicine_id: item.medicine_id,
            counted_quantity: Number(
                reconciliationQuantities[item.medicine_id]
            )
        }));

        setFabLoading(true);

        try {
            const response = await api.post("/api/fab/reconcile", {
                zone_id: selectedZone.id,
                counts,
                reason: "Physical stock count",
                counted_by: user?.name || user?.username || "Unknown",
                allocated_by: user?.name || user?.username || "Unknown"
            });

            const skippedCount = response.data.skipped_medicines || 0;

            alert(
                skippedCount > 0
                    ? `Reconciliation saved. ${skippedCount} medicine(s) were skipped because physical quantity exceeded current stock.`
                    : "FAB reconciliation saved successfully."
            );

            setReconciliationQuantities({});
            // setAllocationQuantities({});

            // Refresh FAB inventory
            const inventoryResponse = await api.get(
                `/api/fab/inventory/${selectedZone.id}`
            );

            setInventory(inventoryResponse.data.inventory || []);

            // Refresh central stock
            const stockResponse = await api.get("/api/stock");
            setCentralStock(stockResponse.data || []);

        } catch (error) {
            console.error("Failed to reconcile FAB inventory:", error);

            alert(
                error.response?.data?.message ||
                "Failed to save FAB reconciliation."
            );
        } finally {
            setFabLoading(false);
        }
    };

    const downloadFABExcel = () => {
        if (!inventory.length) {
            alert("No FAB inventory available to export.");
            return;
        }

        const excelData = inventory.map((item) => ({
            "Medicine ID": item.medicine_id,
            "Medicine": item.medicine_name,
            "Required Quantity": item.required_quantity,
            "Current Quantity": item.current_quantity,
            "Last Replaced": item.last_replacement_date
                ? new Date(item.last_replacement_date).toLocaleDateString("en-IN")
                : "—",
            "Status": item.status === "FULLY_RESTOCKED"
                ? "Fully Restocked"
                : item.status === "PARTIALLY_RESTOCKED"
                    ? "Partially Restocked"
                    : "Not Restocked"
        }));

        const worksheet = XLSX.utils.aoa_to_sheet([
            ["FIRST AID BOX (FAB) INVENTORY REPORT"],
            [`Zone: ${selectedZone.zone_name}`],
            [`Zone ID: ${selectedZone.id}`],
            [`Generated On: ${new Date().toLocaleDateString("en-IN")}`],
            []
        ]);

        // Add column headings in row 6 and inventory data below them
        XLSX.utils.sheet_add_json(worksheet, excelData, {
            origin: "A6"
        });

        // Set column widths
        worksheet["!cols"] = [
            { wch: 15 },
            { wch: 35 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 22 }
        ];

        // Merge heading across all six columns
        worksheet["!merges"] = [
            {
                s: { r: 0, c: 0 },
                e: { r: 0, c: 5 }
            }
        ];

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "FAB Inventory"
        );

        const fileName = `${selectedZone.zone_name
            .replace(/[^a-z0-9]/gi, "_")}_FAB_Inventory.xlsx`;

        XLSX.writeFile(workbook, fileName);
    };

    const saveInventoryChanges = async () => {
        if (!selectedZone || !openVisit) {
            alert("Please open a FAB visit first.");
            return;
        }

        // Validate physical stock inputs
        // Validate consumed quantities
        for (const item of inventory) {
            const quantity = Number(
                consumedQuantities[item.medicine_id] || 0
            );

            if (!Number.isInteger(quantity) || quantity < 0) {
                alert(`Enter a valid consumed quantity for ${item.medicine_name}.`);
                return;
            }

            if (quantity > Number(item.current_quantity)) {
                alert(
                    `Consumed quantity cannot exceed available FAB stock for ${item.medicine_name}.`
                );
                return;
            }
        }

        // Validate allocation inputs and central stock availability
        for (const item of inventory) {
            const quantity = Number(allocationQuantities[item.medicine_id] || 0);

            if (!Number.isInteger(quantity) || quantity < 0) {
                alert(`Enter a valid allocation quantity for ${item.medicine_name}.`);
                return;
            }

            const available = centralStock
                .filter(
                    (stock) =>
                        Number(stock.medicine_id) === Number(item.medicine_id) &&
                        Number(stock.units) > 0 &&
                        !stock.is_expired
                )
                .reduce((total, stock) => total + Number(stock.units), 0);

            if (quantity > available) {
                alert(
                    `Insufficient central stock for ${item.medicine_name}. Available: ${available}, requested: ${quantity}.`
                );
                return;
            }
        }

        setFabLoading(true);

        try {
            const changes = inventory.map((item) => {
                const consumedQuantity = Number(
                    consumedQuantities[item.medicine_id] || 0
                );

                const allocationQuantity = Number(
                    allocationQuantities[item.medicine_id] || 0
                );

                return {
                    medicine_id: item.medicine_id,
                    consumed_quantity: consumedQuantity,
                    allocation_quantity: allocationQuantity
                };
            }).filter(
                (item) =>
                    item.consumed_quantity > 0 ||
                    item.allocation_quantity > 0
            );

            if (changes.length === 0) {
                alert("No inventory changes to save.");
                return;
            }

            await api.post("/api/fab/save-inventory", {
                zone_id: selectedZone.id,
                changes,
                reason: "Inventory consumption",
                consumed_by: user?.name || user?.username || "Unknown",
                allocated_by: user?.name || user?.username || "Unknown"
            });

            alert("FAB inventory changes saved successfully.");

            setConsumedQuantities({});
            setAllocationQuantities({});

            const inventoryResponse = await api.get(
                `/api/fab/inventory/${selectedZone.id}`
            );
            setInventory(inventoryResponse.data.inventory || []);

            const stockResponse = await api.get("/api/stock");
            setCentralStock(stockResponse.data || []);

        } catch (error) {
            console.error("Failed to save FAB inventory changes:", error);

            alert(
                error.response?.data?.message ||
                "Failed to save FAB inventory changes."
            );
        } finally {
            setFabLoading(false);
        }
    };

    const openVisitHistory = async () => {
        if (!selectedZone) return;

        setShowHistoryModal(true);
        setHistoryLoading(true);
        setHistoryError("");
        setVisitHistory([]);

        try {
            const response = await api.get(
                `/api/fab/visit/history/${selectedZone.id}`
            );

            setVisitHistory(response.data.visits || []);

        } catch (error) {
            console.error("Failed to fetch FAB visit history:", error);

            setHistoryError(
                error.response?.data?.message ||
                "Failed to load visit history."
            );
        } finally {
            setHistoryLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                Loading...
            </div>
        );
    }

    return (
        <div className="w-full p-6">
            <h1 className="text-2xl font-bold">
                FIRST AID BOX
            </h1>

            <p className="text-sm text-gray-400 mt-1">
                FAB Inventory Management
            </p>

            <div className="mt-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Zones</h2>
                    <button
                        type="button"
                        onClick={() => setShowAddZoneForm(true)}
                        className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                    >
                        <FaPlus /> Add New Zone
                    </button>


                </div>
                {showAddZoneForm && (
                    <div className="mt-4 rounded bg-gray-800 p-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2"><FaPlus /> Add New Zone</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-2">

                            <div>
                                <label className="text-xs font-medium">
                                    Zone Name
                                </label>

                                <input
                                    type="text"
                                    value={newZoneName}
                                    onChange={(e) => setNewZoneName(e.target.value)}
                                    className="mt-1 w-full rounded-md bg-gray-900 px-2 py-2 text-xs"
                                    placeholder="Enter zone name"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium">
                                    Location
                                </label>

                                <input
                                    type="text"
                                    value={newZoneLocation}
                                    onChange={(e) =>
                                        setNewZoneLocation(e.target.value)
                                    }
                                    className="mt-1 w-full rounded-md bg-gray-900 px-2 py-2 text-xs"
                                    placeholder="Enter location"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button
                                type="button"
                                onClick={createZone}
                                disabled={fabLoading}
                                className="flex items-center gap-2 rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:border hover:border-green-500 disabled:opacity-50"
                            >
                                <FaFloppyDisk /> Save Zone
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddZoneForm(false);
                                    setNewZoneName("");
                                    setNewZoneLocation("");
                                }}
                                className="rounded-md px-2 py-1 text-xs font-medium bg-gray-700 hover:border hover:border-green-500 "
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}



                <div className="mt-3 flex flex-wrap items-start gap-2 text-sm">
                    {zones.map((zone) => (
                        <div
                            key={zone.id}
                            type="button"
                            onClick={() => setSelectedZone(zone)}
                            className={`w-fit rounded-lg px-3 py-1 text-left transition cursor-pointer ${selectedZone?.id === zone.id
                                ? "border-blue-500 bg-blue-700 text-white"
                                : "bg-gray-800 hover:border hover:border-blue-600"
                                }`}
                        >
                            <div className={`flex items-center gap-2 ${selectedZone?.id === zone.id ? "font-bold" : ""}`}>
                                <FaMedkit /> {zone.zone_name}
                            </div>

                            {/* {zone.location && (
                                <div className="mt-1 text-sm text-gray-500">
                                    {zone.location}
                                </div>
                            )} */}
                            {/* <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    deleteZone(zone);
                                }}
                                className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Delete Zone
                            </button> */}
                        </div>
                    ))}
                </div>

            </div>

            {selectedZone && (
                <div className="mt-6 rounded-lg bg-gray-800 rounded shadow-sm p-4">
                    {/* <div className="text-sm text-gray-500">
                        Selected FAB
                    </div> */}
                    <div className="flex items-center justify-between">
                        <div className="">
                            <div className="mt-1 text-sm font-semibold flex gap-2 items-center">
                                {selectedZone.zone_name}
                                <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${openVisit
                                        ? "bg-green-100 text-green-700"
                                        : "border border-red-400 text-red-400"
                                        }`}
                                >
                                    {openVisit ? "OPEN" : "NO OPEN VISIT"}
                                </span>
                            </div>

                            <div className="mt-1 text-xs text-gray-500">
                                Zone ID: {selectedZone.id}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {openVisit ? (
                                <button
                                    type="button"
                                    onClick={closeFABVisit}
                                    disabled={fabLoading}
                                    className="rounded-md flex items-center gap-1 bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <FaLockOpen />{fabLoading ? "Closing..." : "Close Visit"}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={openFABVisit}
                                    disabled={fabLoading}
                                    className="rounded-md flex items-center gap-1 bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <FaLock /> {fabLoading ? "Opening..." : "Open Visit"}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={openVisitHistory}
                                disabled={fabLoading}
                                className="rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                History
                            </button>
                        </div>

                    </div>




                    {/* <div className="mt-4 flex items-center gap-3">
                        <span className="text-sm font-medium">
                            Visit Status:
                        </span>

                        
                    </div> */}

                    {fabLoading ? (
                        <div className="mt-4 text-sm text-gray-500">
                            Loading FAB data...
                        </div>
                    ) : (
                        <div className="mt-3">
                            <div className="flex justify-between">
                                <h3 className="text-lg font-semibold">
                                    FAB Inventory
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={downloadFABExcel}
                                        disabled={fabLoading || inventory.length === 0}
                                        className="flex items-center gap-2 rounded-md bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <FaFileExcel />
                                        Download Excel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowReconcileModal(true)}
                                        disabled={!openVisit || fabLoading}
                                        className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Reconcile Stock
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowTemplateForm(!showTemplateForm)}
                                        className="rounded-md flex items-center gap-1 bg-purple-600 text-xs px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
                                    >
                                        <FaTableList /> {showTemplateForm ? "Cancel" : "Add to List"}
                                    </button>
                                </div>
                            </div>

                            {showTemplateForm && (
                                <div className="mt-4 rounded-lg border p-4">
                                    <h3 className="text-md font-semibold">
                                        Configure FAB Template
                                    </h3>

                                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

                                        <div>
                                            <label className="text-sm font-medium">
                                                Medicine
                                            </label>

                                            <input
                                                type="text"
                                                value={templateMedicineSearch}
                                                onChange={(e) => {
                                                    setTemplateMedicineSearch(e.target.value);
                                                    setTemplateMedicine("");
                                                }}
                                                className="mt-1 w-full rounded-md border bg-gray-800 px-3 py-2 text-sm"
                                                placeholder="Search medicine..."
                                            />

                                            {templateMedicineSearch.trim() && (
                                                <div className="mt-2 max-h-48 overflow-y-auto rounded-md border bg-gray-800">
                                                    {medicines
                                                        .filter((medicine) =>
                                                            medicine.drug_name_and_dose
                                                                ?.toLowerCase()
                                                                .includes(templateMedicineSearch.toLowerCase())
                                                        )
                                                        .map((medicine) => (
                                                            <button
                                                                key={medicine.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setTemplateMedicine(String(medicine.id));
                                                                    setTemplateMedicineSearch(
                                                                        medicine.drug_name_and_dose
                                                                    );
                                                                }}
                                                                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-700"
                                                            >
                                                                {medicine.drug_name_and_dose}
                                                            </button>
                                                        ))}

                                                    {medicines.filter((medicine) =>
                                                        medicine.drug_name_and_dose
                                                            ?.toLowerCase()
                                                            .includes(templateMedicineSearch.toLowerCase())
                                                    ).length === 0 && (
                                                            <div className="px-3 py-2 text-sm text-gray-500">
                                                                No medicines found.
                                                            </div>
                                                        )}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">
                                                Required Quantity
                                            </label>

                                            <input
                                                type="number"
                                                min="1"
                                                value={templateQuantity}
                                                onChange={(e) =>
                                                    setTemplateQuantity(e.target.value)
                                                }
                                                className="mt-1 w-full rounded-md border bg-gray-800 px-3 py-2 text-sm"
                                                placeholder="Enter required quantity"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">
                                                Opening Quantity
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={templateOpeningQuantity}
                                                onChange={(e) =>
                                                    setTemplateOpeningQuantity(e.target.value)
                                                }
                                                className="mt-1 w-full rounded-md border bg-gray-800 px-3 py-2 text-sm"
                                                placeholder="Enter opening quantity"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">
                                                Opening Brand
                                            </label>

                                            <input
                                                type="text"
                                                value={templateOpeningBrand}
                                                onChange={(e) =>
                                                    setTemplateOpeningBrand(e.target.value)
                                                }
                                                className="mt-1 w-full rounded-md border bg-gray-800 px-3 py-2 text-sm"
                                                placeholder="Enter brand"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">
                                                Opening Expiry Date
                                            </label>

                                            <input
                                                type="date"
                                                value={templateOpeningExpiry}
                                                onChange={(e) =>
                                                    setTemplateOpeningExpiry(e.target.value)
                                                }
                                                className="mt-1 w-full rounded-md border bg-gray-800 px-3 py-2 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">
                                                Opening Unit Cost
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={templateOpeningCost}
                                                onChange={(e) =>
                                                    setTemplateOpeningCost(e.target.value)
                                                }
                                                className="mt-1 w-full rounded-md border bg-gray-800 px-3 py-2 text-sm"
                                                placeholder="Enter unit cost"
                                            />
                                        </div>

                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={createTemplate}
                                            disabled={
                                                fabLoading ||
                                                !templateMedicine ||
                                                !templateQuantity
                                            }
                                            className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {fabLoading ? "Saving..." : "Save Template"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {inventory.length === 0 ? (
                                <div className="mt-3 rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
                                    No medicines are configured for this FAB.
                                </div>
                            ) : (
                                <div className="mt-3 overflow-x-auto rounded-lg border">
                                    <div className="grid grid-cols-8 min-w-[1200px] border-b bg-gray-800 px-4 py-3 text-sm font-semibold">
                                        <div className="col-span-2">
                                            Medicine
                                        </div>

                                        <div>
                                            Required
                                        </div>

                                        <div>
                                            Current
                                        </div>

                                        <div>
                                            Consumed
                                        </div>

                                        <div>
                                            Replace
                                        </div>

                                        <div>
                                            Last Replaced
                                        </div>

                                        <div>
                                            Status
                                        </div>
                                    </div>

                                    {inventory.map((item) => (
                                        <div
                                            key={item.medicine_id}
                                            className="border-b last:border-b-0"
                                        >
                                            <div
                                                className="grid grid-cols-8 min-w-[1200px] cursor-pointer items-center px-4 py-3 hover:bg-gray-700"
                                                onClick={() =>
                                                    setExpandedMedicine(
                                                        expandedMedicine === item.medicine_id
                                                            ? null
                                                            : item.medicine_id
                                                    )
                                                }
                                            >
                                                <div className="col-span-2">
                                                    <div className="font-medium">
                                                        {item.medicine_name}
                                                    </div>

                                                    <div className="mt-1 text-xs text-gray-500">
                                                        Medicine ID: {item.medicine_id}
                                                    </div>
                                                </div>

                                                <div className="text-sm">
                                                    {item.required_quantity}
                                                </div>

                                                <div className="text-sm font-medium">
                                                    {item.current_quantity}
                                                </div>
                                                <div className="px-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={item.current_quantity}
                                                        step="1"
                                                        value={consumedQuantities[item.medicine_id] ?? ""}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) =>
                                                            handleConsumedQuantityChange(
                                                                item.medicine_id,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-20 rounded-md border bg-gray-800 px-2 py-1 text-sm"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className="px-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={allocationQuantities[item.medicine_id] ?? ""}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) =>
                                                            setAllocationQuantities((previous) => ({
                                                                ...previous,
                                                                [item.medicine_id]: e.target.value
                                                            }))
                                                        }
                                                        className="w-20 rounded-md border bg-gray-800 px-2 py-1 text-sm"
                                                        placeholder="0"
                                                    />
                                                </div>

                                                <div className="text-xs text-gray-300 whitespace-nowrap">
                                                    {item.last_replacement_date
                                                        ? new Date(item.last_replacement_date).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric"
                                                            }
                                                        )
                                                        : "—"}
                                                </div>

                                                <div>
                                                    <span
                                                        className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${item.status === "FULLY_RESTOCKED"
                                                                ? "bg-green-100 text-green-700"
                                                                : item.status === "PARTIALLY_RESTOCKED"
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {item.status === "FULLY_RESTOCKED"
                                                            ? "Fully Restocked"
                                                            : item.status === "PARTIALLY_RESTOCKED"
                                                                ? "Partially Restocked"
                                                                : "Not Restocked"}
                                                    </span>
                                                </div>
                                            </div>

                                            {expandedMedicine === item.medicine_id && (
                                                <div className="border-t bg-gray-800 px-4 py-4">
                                                    <div className="mb-3 text-sm font-semibold">
                                                        Inventory Batches
                                                    </div>

                                                    {item.batches?.length ? (
                                                        <div className="space-y-2">
                                                            {item.batches.map((batch) => (
                                                                <div
                                                                    key={batch._id}
                                                                    className="rounded-md border bg-gray-800 p-3"
                                                                >
                                                                    <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-6">
                                                                        <div>
                                                                            <div className="text-xs text-gray-500">
                                                                                Brand
                                                                            </div>
                                                                            <div className="font-medium">
                                                                                {batch.brand || "—"}
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <div className="text-xs text-gray-500">
                                                                                Quantity
                                                                            </div>
                                                                            <div className="font-medium">
                                                                                {batch.quantity}
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <div className="text-xs text-gray-500">
                                                                                Expiry
                                                                            </div>
                                                                            <div>
                                                                                {batch.expiry_date
                                                                                    ? new Date(
                                                                                        batch.expiry_date
                                                                                    ).toLocaleDateString()
                                                                                    : "—"}
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <div className="text-xs text-gray-500">
                                                                                Source
                                                                            </div>
                                                                            <div>
                                                                                {batch.source_type}
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <div className="text-xs text-gray-500">
                                                                                Unit Cost
                                                                            </div>
                                                                            <div>
                                                                                ₹{batch.per_unit_cost ?? 0}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500">
                                                            No inventory batches.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={saveInventoryChanges}
                                        disabled={fabLoading || !openVisit}
                                        className="mt-4 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {fabLoading ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {showReconcileModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                            <div className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
                                <div className="flex items-center justify-between border-b border-gray-700 px-5 py-4">
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Reconcile FAB Stock
                                        </h2>
                                        <p className="mt-1 text-xs text-gray-400">
                                            Enter the physically counted quantity for each medicine.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowReconcileModal(false);
                                            setReconciliationQuantities({});
                                        }}
                                        className="rounded-md px-3 py-1 text-sm text-gray-300 hover:bg-gray-700"
                                    >
                                        Close
                                    </button>
                                </div>

                                <div className="max-h-[60vh] overflow-auto">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 bg-gray-800">
                                            <tr className="text-left">
                                                <th className="px-4 py-3">Medicine</th>
                                                <th className="px-4 py-3">System Quantity</th>
                                                <th className="px-4 py-3">Physical Count</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {inventory.map((item) => (
                                                <tr
                                                    key={item.medicine_id}
                                                    className="border-t border-gray-700"
                                                >
                                                    <td className="px-4 py-3">
                                                        {item.medicine_name}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {item.current_quantity}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="1"
                                                            value={
                                                                reconciliationQuantities[item.medicine_id] ?? ""
                                                            }
                                                            onChange={(e) =>
                                                                handleReconciliationQuantityChange(
                                                                    item.medicine_id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-28 rounded-md border border-gray-600 bg-gray-800 px-2 py-1.5"
                                                            placeholder="Enter count"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end gap-2 border-t border-gray-700 px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowReconcileModal(false);
                                            setReconciliationQuantities({});
                                        }}
                                        disabled={fabLoading}
                                        className="rounded-md bg-gray-700 px-4 py-2 text-sm hover:bg-gray-600 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={saveStockCount}
                                        disabled={fabLoading || !openVisit}
                                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {fabLoading ? "Saving..." : "Save Stock Count"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {showHistoryModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

                            <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-xl">

                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-gray-700 px-5 py-4">
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            FAB Visit History
                                        </h2>

                                        <p className="mt-1 text-xs text-gray-400">
                                            {selectedZone?.zone_name}
                                            {" "} | Zone ID: {selectedZone?.id}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowHistoryModal(false)}
                                        className="rounded-md bg-gray-700 px-3 py-1.5 text-sm hover:bg-gray-600"
                                    >
                                        Close
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="max-h-[75vh] overflow-y-auto p-5">

                                    {historyLoading ? (
                                        <div className="py-10 text-center text-sm text-gray-400">
                                            Loading visit history...
                                        </div>
                                    ) : historyError ? (
                                        <div className="py-10 text-center text-sm text-red-400">
                                            {historyError}
                                        </div>
                                    ) : visitHistory.length === 0 ? (
                                        <div className="py-10 text-center text-sm text-gray-400">
                                            No previous visits found for this FAB.
                                        </div>
                                    ) : (
                                        <div className="space-y-5">

                                            {visitHistory.map((visit, index) => (
                                                <div
                                                    key={visit._id}
                                                    className="overflow-hidden rounded-lg border border-gray-700"
                                                >

                                                    {/* Visit Header */}
                                                    <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-800 p-4">

                                                        <div>
                                                            <h3 className="font-semibold">
                                                                Visit #{visitHistory.length - index}
                                                            </h3>

                                                            <p className="mt-1 text-xs text-gray-400">
                                                                Started:{" "}
                                                                {visit.started_at
                                                                    ? new Date(visit.started_at).toLocaleString("en-IN")
                                                                    : "—"}
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-400">
                                                                Started By: {visit.started_by || "—"}
                                                            </p>
                                                        </div>

                                                        <div className="text-right">
                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${visit.status === "OPEN"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : "bg-gray-700 text-gray-200"
                                                                    }`}
                                                            >
                                                                {visit.status}
                                                            </span>

                                                            <p className="mt-2 text-xs text-gray-400">
                                                                Closed:{" "}
                                                                {visit.closed_at
                                                                    ? new Date(visit.closed_at).toLocaleString("en-IN")
                                                                    : "—"}
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-400">
                                                                Closed By: {visit.closed_by || "—"}
                                                            </p>
                                                        </div>

                                                    </div>

                                                    {/* Operations */}
                                                    <div className="p-4">

                                                        <div className="mb-3 flex items-center justify-between">
                                                            <h4 className="text-sm font-semibold">
                                                                Operations Performed
                                                            </h4>

                                                            <span className="text-xs text-gray-400">
                                                                {visit.operations?.length || 0} operations
                                                            </span>
                                                        </div>

                                                        {!visit.operations?.length ? (
                                                            <div className="rounded-md border border-dashed border-gray-700 p-5 text-center text-sm text-gray-500">
                                                                No operations recorded during this visit.
                                                            </div>
                                                        ) : (
                                                            <div className="overflow-x-auto rounded-md border border-gray-700">
                                                                <table className="w-full min-w-[850px] text-sm">

                                                                    <thead className="bg-gray-800 text-left">
                                                                        <tr>
                                                                            <th className="px-3 py-3">Date & Time</th>
                                                                            <th className="px-3 py-3">Operation</th>
                                                                            <th className="px-3 py-3">Medicine</th>
                                                                            <th className="px-3 py-3">Brand</th>
                                                                            <th className="px-3 py-3">Quantity</th>
                                                                            <th className="px-3 py-3">Performed By</th>
                                                                            <th className="px-3 py-3">Reason</th>
                                                                        </tr>
                                                                    </thead>

                                                                    <tbody>
                                                                        {visit.operations.map((operation) => (
                                                                            <tr
                                                                                key={operation._id}
                                                                                className="border-t border-gray-700"
                                                                            >
                                                                                <td className="whitespace-nowrap px-3 py-3 text-xs">
                                                                                    {operation.performed_at
                                                                                        ? new Date(operation.performed_at).toLocaleString("en-IN")
                                                                                        : "—"}
                                                                                </td>

                                                                                <td className="px-3 py-3">
                                                                                    <span
                                                                                        className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${operation.operation_type === "ALLOCATION"
                                                                                                ? "bg-green-100 text-green-700"
                                                                                                : "bg-orange-100 text-orange-700"
                                                                                            }`}
                                                                                    >
                                                                                        {operation.operation}
                                                                                    </span>
                                                                                </td>

                                                                                <td className="px-3 py-3">
                                                                                    {operation.item_name || "—"}
                                                                                    <div className="mt-1 text-xs text-gray-500">
                                                                                        ID: {operation.medicine_id}
                                                                                    </div>
                                                                                </td>

                                                                                <td className="px-3 py-3">
                                                                                    {operation.brand || "—"}
                                                                                </td>

                                                                                <td className="px-3 py-3 font-semibold">
                                                                                    {operation.quantity}
                                                                                </td>

                                                                                <td className="px-3 py-3">
                                                                                    {operation.performed_by || "—"}
                                                                                </td>

                                                                                <td className="px-3 py-3 text-xs text-gray-400">
                                                                                    {operation.reason || "—"}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>

                                                                </table>
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            ))}

                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default FAB;