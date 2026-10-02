import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

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
    const [centralStock, setCentralStock] = useState([]);
    const [showConsumeForm, setShowConsumeForm] = useState(false);
    const [consumptionMedicine, setConsumptionMedicine] = useState(null);
    const [consumptionQuantity, setConsumptionQuantity] = useState("");
    const [consumptionReason, setConsumptionReason] = useState("");
    const [physicalQuantities, setPhysicalQuantities] = useState({});
    const [medicines, setMedicines] = useState([]);
    const [templateMedicineSearch, setTemplateMedicineSearch] = useState("");
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [templateMedicine, setTemplateMedicine] = useState("");
    const [templateQuantity, setTemplateQuantity] = useState("");
    const [templateOpeningQuantity, setTemplateOpeningQuantity] = useState("");
    const [templateOpeningBrand, setTemplateOpeningBrand] = useState("");
    const [templateOpeningExpiry, setTemplateOpeningExpiry] = useState("");
    const [templateOpeningCost, setTemplateOpeningCost] = useState("");

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

    const handlePhysicalQuantityChange = (medicineId, value) => {
        setPhysicalQuantities((previous) => ({
            ...previous,
            [medicineId]: value
        }));
    };

    const saveStockCount = async () => {
        if (!selectedZone || !openVisit) {
            alert("Please open a FAB visit first.");
            return;
        }

        const counts = inventory.map((item) => ({
            medicine_id: item.medicine_id,
            counted_quantity: Number(
                physicalQuantities[item.medicine_id] ?? ""
            )
        }));

        for (const item of counts) {
            if (!Number.isInteger(item.counted_quantity) || item.counted_quantity < 0) {
                alert("Please enter a valid physical quantity for every medicine.");
                return;
            }
        }

        setFabLoading(true);

        try {
            await api.post("/api/fab/stock-count", {
                zone_id: selectedZone.id,
                counts,
                reason: "Physical stock count",
                counted_by: user?.name || user?.username || "Unknown"
            });

            alert("FAB stock count saved successfully.");

            setPhysicalQuantities({});

            const inventoryResponse = await api.get(
                `/api/fab/inventory/${selectedZone.id}`
            );

            setInventory(inventoryResponse.data.inventory || []);
        } catch (error) {
            console.error("Failed to save FAB stock count:", error);

            alert(
                error.response?.data?.message ||
                "Failed to save FAB stock count"
            );
        } finally {
            setFabLoading(false);
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

            <div className="mt-6">
                <h2 className="text-lg font-semibold">Zones</h2>
                <button
                    type="button"
                    onClick={() => setShowAddZoneForm(true)}
                    className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Add New Zone
                </button>

                {showAddZoneForm && (
                    <div className="mt-4 rounded-lg border p-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium">
                                    Zone Name
                                </label>

                                <input
                                    type="text"
                                    value={newZoneName}
                                    onChange={(e) => setNewZoneName(e.target.value)}
                                    className="mt-1 w-full rounded-md border bg-gray-800 px-3 py-2 text-sm"
                                    placeholder="Enter zone name"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">
                                    Location
                                </label>

                                <input
                                    type="text"
                                    value={newZoneLocation}
                                    onChange={(e) =>
                                        setNewZoneLocation(e.target.value)
                                    }
                                    className="mt-1 w-full rounded-md border bg-gray-800 px-3 py-2 text-sm"
                                    placeholder="Enter location"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button
                                type="button"
                                onClick={createZone}
                                disabled={fabLoading}
                                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                Save Zone
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddZoneForm(false);
                                    setNewZoneName("");
                                    setNewZoneLocation("");
                                }}
                                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {zones.map((zone) => (
                        <button
                            key={zone.id}
                            type="button"
                            onClick={() => setSelectedZone(zone)}
                            className={`rounded-lg border p-4 text-left transition ${selectedZone?.id === zone.id
                                ? "border-blue-500 bg-gray-800 text-white"
                                : "border-gray-200 hover:border-blue-300 hover:bg-gray-700"
                                }`}
                        >
                            <div className="font-semibold">
                                {zone.zone_name}
                            </div>

                            {zone.location && (
                                <div className="mt-1 text-sm text-gray-500">
                                    {zone.location}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
            {selectedZone && (
                <div className="mt-6 rounded-lg border p-4">
                    <div className="text-sm text-gray-500">
                        Selected FAB
                    </div>

                    <div className="mt-1 text-xl font-semibold">
                        {selectedZone.zone_name}
                    </div>

                    <div className="mt-1 text-sm text-gray-500">
                        Zone ID: {selectedZone.id}
                    </div>
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={() => setShowTemplateForm(!showTemplateForm)}
                            className="rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
                        >
                            {showTemplateForm ? "Cancel Template" : "Manage Template"}
                        </button>
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
                    {openVisit && (
                        <button
                            type="button"
                            onClick={() => setShowAllocateForm(!showAllocateForm)}
                            className="mt-4 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            {showAllocateForm ? "Cancel Allocation" : "Allocate Medicine"}
                        </button>
                    )}
                    {openVisit && (
                        <button
                            type="button"
                            onClick={() => setShowConsumeForm(!showConsumeForm)}
                            className="mt-4 ml-2 rounded-md bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700"
                        >
                            {showConsumeForm ? "Cancel Consumption" : "Consume Medicine"}
                        </button>
                    )}
                    <div className="mt-4 flex items-center gap-3">
                        <span className="text-sm font-medium">
                            Visit Status:
                        </span>

                        <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${openVisit
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                                }`}
                        >
                            {openVisit ? "OPEN" : "NO OPEN VISIT"}
                        </span>

                        {/* {!openVisit && (
        <button
            type="button"
            onClick={openFABVisit}
            disabled={fabLoading}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {fabLoading ? "Opening..." : "Open Visit"}
        </button>
    )} */}
                        {openVisit ? (
                            <button
                                type="button"
                                onClick={closeFABVisit}
                                disabled={fabLoading}
                                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {fabLoading ? "Closing..." : "Close Visit"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={openFABVisit}
                                disabled={fabLoading}
                                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {fabLoading ? "Opening..." : "Open Visit"}
                            </button>
                        )}
                    </div>
                    {showAllocateForm && (
                        <div className="mt-4 rounded-lg border p-4">
                            <h3 className="text-md font-semibold">
                                Allocate Medicine to FAB
                            </h3>

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium">
                                        Medicine
                                    </label>

                                    <select
                                        value={selectedMedicine?.medicine_id || ""}
                                        onChange={(e) => {
                                            const medicine = inventory.find(
                                                (item) =>
                                                    item.medicine_id === Number(e.target.value)
                                            );

                                            setSelectedMedicine(medicine || null);
                                            setSelectedStock(null);
                                        }}
                                        className="mt-1 w-full rounded-md border bg-gray-800 px-3 py-2 text-sm"
                                    >
                                        <option value="">
                                            Select medicine
                                        </option>

                                        {inventory.map((item) => (
                                            <option
                                                key={item.medicine_id}
                                                value={item.medicine_id}
                                            >
                                                {item.medicine_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">
                                        Central Stock Batch
                                    </label>

                                    <select
                                        value={selectedStock?.stock_id || ""}
                                        onChange={(e) => {
                                            const stock = centralStock.find(
                                                (item) =>
                                                    item.stock_id === Number(e.target.value)
                                            );

                                            setSelectedStock(stock || null);
                                        }}
                                        disabled={!selectedMedicine}
                                        className="mt-1 w-full rounded-md border bg-gray-800 px-3 py-2 text-sm"
                                    >
                                        <option value="">
                                            {selectedMedicine
                                                ? "Select stock batch"
                                                : "Select medicine first"}
                                        </option>

                                        {centralStock
                                            .filter(
                                                (stock) =>
                                                    stock.medicine_id === selectedMedicine?.medicine_id
                                            )
                                            .map((stock) => (
                                                <option
                                                    key={stock.stock_id}
                                                    value={stock.stock_id}
                                                >
                                                    {stock.brand || "No brand"} — {stock.units} units
                                                    {stock.expiry_date
                                                        ? ` — Exp: ${new Date(
                                                            stock.expiry_date
                                                        ).toLocaleDateString()}`
                                                        : ""}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={allocationQuantity}
                                        onChange={(e) =>
                                            setAllocationQuantity(e.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border bg-gray-800 px-3 py-2 text-sm"
                                        placeholder="Enter quantity"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={allocateMedicine}
                                    disabled={
                                        fabLoading ||
                                        !selectedMedicine ||
                                        !selectedStock ||
                                        !allocationQuantity
                                    }
                                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {fabLoading ? "Allocating..." : "Allocate"}
                                </button>
                            </div>
                        </div>
                    )}
                    {showConsumeForm && (
                        <div className="mt-4 rounded-lg border p-4">
                            <h3 className="text-md font-semibold">
                                Consume Medicine from FAB
                            </h3>

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium">
                                        Medicine
                                    </label>

                                    <select
                                        value={consumptionMedicine?.medicine_id || ""}
                                        onChange={(e) => {
                                            const medicine = inventory.find(
                                                (item) =>
                                                    item.medicine_id === Number(e.target.value)
                                            );

                                            setConsumptionMedicine(medicine || null);
                                        }}
                                        className="mt-1 w-full rounded-md border bg-gray-800 px-3 py-2 text-sm"
                                    >
                                        <option value="">
                                            Select medicine
                                        </option>

                                        {inventory
                                            .filter((item) => item.current_quantity > 0)
                                            .map((item) => (
                                                <option
                                                    key={item.medicine_id}
                                                    value={item.medicine_id}
                                                >
                                                    {item.medicine_name} — {item.current_quantity} available
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        max={consumptionMedicine?.current_quantity || undefined}
                                        value={consumptionQuantity}
                                        onChange={(e) =>
                                            setConsumptionQuantity(e.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border bg-gray-800 px-3 py-2 text-sm"
                                        placeholder="Enter quantity"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium">
                                        Reason
                                    </label>

                                    <input
                                        type="text"
                                        value={consumptionReason}
                                        onChange={(e) =>
                                            setConsumptionReason(e.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border bg-gray-800 px-3 py-2 text-sm"
                                        placeholder="e.g. Used for first aid"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={consumeMedicine}
                                    disabled={
                                        fabLoading ||
                                        !consumptionMedicine ||
                                        !consumptionQuantity
                                    }
                                    className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {fabLoading ? "Consuming..." : "Consume"}
                                </button>
                            </div>
                        </div>
                    )}
                    {fabLoading ? (
                        <div className="mt-4 text-sm text-gray-500">
                            Loading FAB data...
                        </div>
                    ) : (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold">
                                FAB Inventory
                            </h3>

                            {inventory.length === 0 ? (
                                <div className="mt-3 rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
                                    No medicines are configured for this FAB.
                                </div>
                            ) : (
                                <div className="mt-3 overflow-hidden rounded-lg border">
                                    <div className="grid grid-cols-6 border-b bg-gray-800 px-4 py-3 text-sm font-semibold">
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
                                            Physically Count
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
                                                className="grid grid-cols-6 cursor-pointer items-center px-4 py-3 hover:bg-gray-700"
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
                                                <div className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={physicalQuantities[item.medicine_id] ?? ""}
                                                        onChange={(e) =>
                                                            handlePhysicalQuantityChange(
                                                                item.medicine_id,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-24 rounded-md border bg-gray-800 px-2 py-1 text-sm"
                                                        placeholder="0"
                                                    />
                                                </div>

                                                <div>
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${item.status === "FULL"
                                                            ? "bg-green-100 text-green-700"
                                                            : item.status === "SHORT"
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : item.status === "EMPTY"
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-blue-100 text-blue-700"
                                                            }`}
                                                    >
                                                        {item.status}
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
                                                                    <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
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
                                        onClick={saveStockCount}
                                        disabled={fabLoading || !openVisit}
                                        className="mt-4 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Save Stock Count
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default FAB;