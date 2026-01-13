import { useEffect, useState } from "react";
import api from "../api/axios";

function Stock() {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="w-full">
            <div className="bg-gray-800 my-3 rounded-lg p-4 w-full">
                <p className="font-semibold mb-4 text-xs">BALANCE STOCK</p>

                {loading ? (
                    <p className="text-sm">Loading stock...</p>
                ) : (
                    <div className="overflow-x-auto">
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
                                {stocks.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-4 text-center">
                                            No stock available
                                        </td>
                                    </tr>
                                ) : (
                                    stocks.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-700">
    <td className="border p-2 text-center">{index + 1}</td>
    <td className="border p-2">{item.item_name}</td>
    <td className="border p-2">{item.brand || "-"}</td>
    <td className="border p-2 text-center">{item.units}</td>
    <td className="border p-2 text-right">
        ₹{item.per_unit_cost.toFixed(2)}
    </td>
    <td className="border p-2 text-center">
        {item.expiry_date
            ? new Date(item.expiry_date).toLocaleDateString()
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
