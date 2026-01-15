import { useState, useEffect } from "react";
import api from "../api/axios";

function OpeningStock() {
  const [stocks, setStocks] = useState([]);
  const [entries, setEntries] = useState({});

  // 🔥 DATE STATE (THIS WAS MISSING)
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  useEffect(() => {
    api.get("/api/stock/raw").then(res => setStocks(res.data));
  }, []);

  const submitReconciliation = async () => {
    const items = Object.entries(entries)
      .filter(([_, units]) => units !== undefined)
      .map(([stock_id, remaining_units]) => ({
        stock_id: Number(stock_id),
        remaining_units
      }));

    if (!items.length) {
      alert("Please enter remaining units for at least one item");
      return;
    }

    await api.post("/api/adjustment/reconcile-opening", {
      from_date: fromDate,
      to_date: toDate,
      items
    });

    alert("Opening stock reconciled successfully");
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">

      <h2 className="text-sm font-semibold mb-3">
        OPENING STOCK RECONCILIATION
      </h2>

      {/* 🔹 DATE RANGE */}
      <div className="flex gap-3 mb-4">
        <div>
          <label className="text-xs block mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="bg-gray-700 text-xs p-1 rounded"
          />
        </div>

        <div>
          <label className="text-xs block mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="bg-gray-700 text-xs p-1 rounded"
          />
        </div>
      </div>

      {/* 🔹 STOCK TABLE */}
      <table className="w-full text-sm border">
        <thead className="bg-gray-900">
          <tr>
            <th className="border">Item</th>
            <th className="border">Brand</th>
            <th className="border">Current Units</th>
            <th className="border">Remaining Units</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map(s => (
            <tr key={s.id}>
              <td className="border px-2">{s.item_name}</td>
              <td className="border px-2">{s.brand}</td>
              <td className="border text-center">{s.units}</td>
              <td className="border text-center">
                <input
                  type="number"
                  min={0}
                  max={s.units}
                  className="bg-gray-700 p-1 w-20 text-center text-xs"
                  onChange={(e) =>
                    setEntries(prev => ({
                      ...prev,
                      [s.id]: Number(e.target.value)
                    }))
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-right">
        <button
          onClick={submitReconciliation}
          className="bg-green-600 px-4 py-1 rounded text-xs"
        >
          Save Reconciliation
        </button>
      </div>
    </div>
  );
}

export default OpeningStock;
