import { FaMagnifyingGlass } from "react-icons/fa6";

function WorkerSection({ search, results, onSearch, onSelect }) {
  function formatISTDate(date) {
    return new Date(date).toLocaleDateString("en-GB", {
      timeZone: "Asia/Kolkata"
    });
  }

  return (
    <div className="w-4/5 relative">
      <div className="flex items-center gap-2">
        <FaMagnifyingGlass className="text-[16px]" />
        <input
          placeholder="Name, EmpID, Father, Aadhaar, Phone"
          className="w-full px-2 py-1 rounded bg-gray-700 text-sm"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {search.length >= 2 && (
        <div className="absolute w-full z-20 max-h-60 border border-gray-700 overflow-auto mt-2 bg-gray-900 rounded">
          {results.length === 0 && (
            <p className="p-2 text-sm text-gray-400">No results</p>
          )}

          {results.map((w, idx) => (
            <div
              key={w.id}
              className="p-2 hover:bg-gray-700 cursor-pointer flex justify-between"
              onClick={() => {
                onSelect(w);
              }}
            >
              <p className="font-bold">
                {w.name}
                <br />
                <span className="font-light text-sm">
                  {w.fathers_name} | Emp ID: {w.employee_id} | 📞 {w.phone_no}
                  <br />
                  DOJ: {w.date_of_joining
                    ? formatISTDate(w.date_of_joining)
                    : "—"} | {w.designation}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                {idx + 1} / {results.length}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkerSection;
