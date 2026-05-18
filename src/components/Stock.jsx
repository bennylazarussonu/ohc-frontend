import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { formatDateDMY } from "../utils/date.js";
import { FaMagnifyingGlass } from "react-icons/fa6";

function Stock() {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔍 Search State
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchStock = async () => {
            try {
                const res = await api.get("/api/stock/");
                setStocks(res.data);
            } catch (err) {
                console.error(err);
                alert("Failed to load stock");
            } finally {
                setLoading(false);
            }
        };

        fetchStock();
    }, []);

    // 🔍 Filtered Stock
    const filteredStocks = useMemo(() => {
        return stocks.filter((item) => {
            const query = search.toLowerCase();

            return (
                item.item_name?.toLowerCase().includes(query) ||
                item.brand?.toLowerCase().includes(query) ||
                item.vendors?.some((v) =>
                    v.toLowerCase().includes(query)
                )
            );
        });
    }, [stocks, search]);

    return (
        <div className="w-full">
            <div className="bg-gray-800 my-3 rounded-lg p-4 w-full">

                {/* 🔍 Search Box */}
                <div className="mb-4 flex items-center gap-3">
                    <FaMagnifyingGlass/>
                    <input
                        type="text"
                        placeholder="Search item, brand, vendor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-96 px-4 py-2 rounded bg-gray-900 border text-sm border-gray-600 text-white outline-none focus:border-blue-500"
                    />
                </div>

                {loading ? (
                    <p className="text-sm">Loading stock...</p>
                ) : (
                    <div className="overflow-x-auto h-[450px] no-scrollbar">
                        <table className="w-full border text-sm">
                            <thead className="bg-gray-900">
                                <tr>
                                    <th className="border p-2">S.No</th>
                                    <th className="border p-2">Item</th>
                                    <th className="border p-2">Brand</th>
                                    <th className="border p-2">Units</th>
                                    <th className="border p-2">Per Unit (₹)</th>
                                    <th className="border p-2">Expiry</th>
                                    <th className="border p-2">Vendors</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStocks.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="p-4 text-center"
                                        >
                                            No matching stock found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStocks.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-700"
                                        >
                                            <td className="border p-2 text-center">
                                                {index + 1}
                                            </td>

                                            <td className="border p-2">
                                                {item.item_name}
                                            </td>

                                            <td className="border p-2">
                                                {item.brand || "-"}
                                            </td>

                                            <td className="border p-2 text-center">
                                                {item.units}
                                            </td>

                                            <td className="border p-2 text-right">
                                                ₹
                                                {item.per_unit_cost.toFixed(2)}
                                            </td>

                                            <td className="border p-2 text-center">
                                                {item.expiry_date
                                                    ? formatDateDMY(
                                                        new Date(
                                                            item.expiry_date
                                                        )
                                                    )
                                                    : "-"}
                                            </td>

                                            <td className="border p-2">
                                                {item.vendors?.join(", ") || "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Stock;