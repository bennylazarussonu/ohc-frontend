import api from "../api/axios";
import { useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";

function WorkerSection({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  function formatISTDate(date) {
    return new Date(date).toLocaleDateString("en-GB", {
      timeZone: "Asia/Kolkata"
    });
  }

  // 🔥 Debounced backend search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/workers/search?q=${query}`);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-4/5 relative">
      <div className="flex items-center gap-2">
        <FaMagnifyingGlass className="text-[16px]" />
        <input
          placeholder="Search by name / ID / Aadhaar / phone"
          className="w-full px-2 py-1 rounded bg-gray-700 text-sm"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {query && (
        <div className="absolute w-full z-20 max-h-60 border border-gray-700 overflow-auto mt-2 bg-gray-900 rounded">
          {loading && (
            <p className="p-2 text-sm text-gray-400">Searching...</p>
          )}

          {results.map((w, idx) => (
            <div
              key={w.id}
              className="p-2 hover:bg-gray-700 cursor-pointer flex justify-between"
              onClick={() => {
                onSelect(w);
                setQuery("");
                setResults([]);
              }}
            >
              <p className="font-bold">
                {w.name}
                <br />
                <span className="font-light text-sm">
                  {w.fathers_name} | Emp ID: {w.employee_id} | 📞 {w.phone_no}
                  <br />
                  DOJ: {formatISTDate(w.date_of_joining)} | {w.designation}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                {idx + 1} / {results.length}
              </p>
            </div>
          ))}

          {!loading && results.length === 0 && (
            <p className="p-2 text-sm text-gray-400">No results</p>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkerSection;
