import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaPlus, FaX } from "react-icons/fa6";

function Procurement(){
    const [procured_from, set_procured_from] = useState("");
    const [procured_date, set_procured_date] = useState(new Date().toISOString().split("T")[0]);
    const [procured_items, set_procured_items] = useState([]);
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
                            onChange={e => {set_procured_from(e.target.value)}}
                        />
                    </div>
                    <div className="w-1/6">
                        <p className="text-xs mb-1">Procurement Date</p>
                        <input
                            type="date"
                            className="bg-gray-700 p-2 w-full rounded text-xs"
                            value={procured_date}
                            onChange={e => {set_procured_date(e.target.value)}}
                        />
                    </div>
                </div>
            </div>
            <div className="bg-gray-800 my-3 rounded-lg p-4 w-full">
                <p className="font-semibold mb-2 text-xs">PROCURED ITEMS</p>
                <div className="w-full">
                    <table className="border w-full text-sm">
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
                                <th className="border">Action</th>
                            </tr>
                        </thead>
                        <tbody className="border">
                            <tr className="border">
                                <td className="border text-center p-1">1</td>
                                <td className="border text-center p-1">
                                    <input 
                                        type="text" 
                                        className="bg-gray-700 rounded text-xs px-2 py-1 w-full focus:outline-none focus:border focus:border-blue-400"
                                        placeholder="Item Name"
                                    />
                                </td>
                                <td className="border text-center p-1">
                                    <select className="bg-gray-700 rounded text-xs px-2 py-1 w-full focus:outline-none focus:border focus:border-blue-400">
                                        <option value="">Brand</option>
                                        <option value="Brand 1">Brand 1</option>
                                        <option value="Brand 2">Brand 2</option>
                                    </select>
                                </td>
                                <td className="border text-center p-1">
                                    <input 
                                        type="number" 
                                        className="bg-gray-700 rounded text-xs px-2 py-1 w-full focus:outline-none focus:border focus:border-blue-400"
                                        placeholder="Units"
                                    />
                                </td>
                                <td className="border text-center p-1">
                                    <input 
                                        type="number" 
                                        className="bg-gray-700 rounded text-xs px-2 py-1 w-full focus:outline-none focus:border focus:border-blue-400"
                                        placeholder="Rate Excluding GST"
                                    />
                                </td>
                                <td className="border text-center p-1">
                                    <input 
                                        type="number" 
                                        className="bg-gray-700 rounded text-xs px-2 py-1 w-full focus:outline-none focus:border focus:border-blue-400"
                                        placeholder="GST Rate"
                                    />
                                </td>
                                <td className="border text-center p-1">
                                    <input 
                                        type="number" 
                                        className="bg-gray-700 rounded text-xs px-2 py-1 w-full focus:outline-none focus:border focus:border-blue-400"
                                        placeholder="Rate Including GST"
                                    />
                                </td>
                                <td className="border text-center p-1">
                                    <input 
                                        readOnly
                                        type="number" 
                                        className="bg-gray-700 rounded text-xs px-2 py-1 w-full focus:outline-none focus:border focus:border-blue-400"
                                        placeholder="Cost per Unit"
                                    />
                                </td>
                                <td className="border text-center p-1">
                                    <input 
                                        type="number" 
                                        className="bg-gray-700 rounded text-xs px-2 py-1 w-full focus:outline-none focus:border focus:border-blue-400"
                                        placeholder="Amount"
                                    />
                                </td>
                                <td className="border text-center p-1">
                                    <button className="bg-red-600 p-1 rounded">
                                        ❌
                                    </button>
                                </td>
                            </tr>
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
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="text-right text-sm">Total: ₹</p>
                    <button className="flex items-center gap-1 text-xs bg-blue-600 p-2 rounded font-semibold my-2">
                        <FaPlus/>
                        Add Item
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Procurement;