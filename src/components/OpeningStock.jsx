import { useState, useEffect } from "react";
import api from "../api/axios";
import { FaFloppyDisk } from "react-icons/fa6";

function OpeningStock() {
  const [stocks, setStocks] = useState([]);
  const [entries, setEntries] = useState({});
  const [saving, setSaving] = useState(false);

  // 🔥 DATE STATE (THIS WAS MISSING)
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const fetchStocks = async () => {
    const res = await api.get("/api/stock/raw");
    setStocks(res.data);
  };


  useEffect(() => {
    fetchStocks();
  }, []);




  const submitReconciliation = async () => {
    setSaving(true);
    try {
      const items = Object.entries(entries)
        .filter(([_, data]) =>
          data.remaining_units !== undefined &&
          data.remaining_units !== ""
        )
        .map(([stock_id, data]) => ({
          stock_id: Number(stock_id),
          remaining_units: data.remaining_units,
          remarks: data.remarks || "Consumed"
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

      alert("Stock Adjusted successfully");

      // 🔥 reload table
      await fetchStocks();

      // 🔥 optional: clear inputs
      setEntries({});
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error adjusting stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 mt-3 rounded-lg">

      {/* <h2 className="text-sm font-semibold mb-3">
        OPENING STOCK RECONCILIATION
      </h2> */}

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
            <th className="border">Remarks</th>
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
                  className="bg-gray-700 p-1 w-20 text-center text-xs rounded my-1"
                  onChange={(e) =>
                    setEntries(prev => ({
                      ...prev,
                      [s.id]: {
                        ...prev[s.id],
                        remaining_units:
                          e.target.value === ""
                            ? ""
                            : Number(e.target.value)
                      }
                    }))
                  }
                />
              </td>
              <td className="border text-center">
                <select
                  className="bg-gray-700 p-1 text-xs rounded"
                  onChange={(e) =>
                    setEntries(prev => ({
                      ...prev,
                      [s.id]: {
                        ...prev[s.id],
                        remarks: e.target.value
                      }
                    }))
                  }
                >
                  <option value="Consumed">Consumed</option>
                  <option value="Lost">Lost</option>
                </select>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-right">
        <button
          disabled={saving}
          onClick={submitReconciliation}
          className="bg-green-600 px-4 py-1 text-sm rounded flex items-center gap-2 font-semibold"
        >
          <FaFloppyDisk />
          Save
        </button>
      </div>
    </div>
  );
}

export default OpeningStock;
