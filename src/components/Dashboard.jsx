import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

/* ------------------ HELPERS ------------------ */

function formatLabel(d) {
  if (d.day) return `${d.day}/${d.month}/${d.year}`;
  if (d.month) return `${d.month}/${d.year}`;
  return `${d.year}`;
}

function buildRange({ year, month, day }) {
  if (day) {
    return {
      from: new Date(year, month - 1, day),
      to: new Date(year, month - 1, day, 23, 59, 59)
    };
  }
  if (month) {
    return {
      from: new Date(year, month - 1, 1),
      to: new Date(year, month, 0, 23, 59, 59)
    };
  }
  return {
    from: new Date(year, 0, 1),
    to: new Date(year, 11, 31, 23, 59, 59)
  };
}

/* ------------------ COMPONENT ------------------ */

export default function Dashboard() {
  const now = new Date();

  const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const [from, setFrom] = useState(
  daysAgo(30).toISOString().slice(0, 10)
);
const [to, setTo] = useState(
  new Date().toISOString().slice(0, 10)
);



  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);

  const [drill, setDrill] = useState({
    open: false,
    type: "",
    records: []
  });

  /* -------- FETCH SUMMARY -------- */
  useEffect(() => {
  api
    .get("/api/dashboard/summary", {
      params: {
        type: "date",
        from,
        to
      }
    })
    .then(res => setSummary(res.data));
}, [from, to]);



  /* -------- FETCH TRENDS -------- */
    useEffect(() => {
  api
    .get("/api/dashboard/trends", {
      params: {
        from,
        to
      }
    })
    .then(res => setTrends(res.data));
}, [from, to]);


  /* -------- DRILL DOWN -------- */
  async function handleDrill(type, rawDate) {
    const { from, to } = buildRange(rawDate);

    const res = await api.get(`/api/dashboard/list/${type}`, {
      params: { from: from.toISOString(), to: to.toISOString() }
    });

    setDrill({
      open: true,
      type,
      records: res.data
    });
  }

  if (!summary || !trends) return <p className="p-6">Loading dashboard…</p>;

  return (
    <div className="p-6 space-y-8 w-full bg-gray-900 min-h-screen text-gray-100">
      {/* FILTERS */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg shadow">
  <div className="flex flex-col">
    <label className="text-sm text-gray-400 mb-1">From</label>
    <input
      type="date"
      value={from}
      onChange={e => setFrom(e.target.value)}
      className="border border-gray-600 p-2 rounded bg-gray-700 text-white"
    />
  </div>

  <div className="flex flex-col">
    <label className="text-sm text-gray-400 mb-1">To</label>
    <input
      type="date"
      value={to}
      onChange={e => setTo(e.target.value)}
      className="border border-gray-600 p-2 rounded bg-gray-700 text-white"
    />
  </div>
</div>



      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Pre-Employment">
          <Stat label="On-Going" value={summary.preEmployment.ongoing} />
          <Stat label="Fit" value={summary.preEmployment.fit} />
          <Stat label="Unfit" value={summary.preEmployment.unfit} />
        </Card>

        <Card title="ID Renewals Done">
            <div className="w-full mt-8 flex justify-center items-center">
                <BigStat value={summary.idRenewalsDone} />
            </div>
        </Card>

        <Card title="OPDs Done">
            <div className="w-full mt-8 flex justify-center items">
                <BigStat value={summary.opdDone} />
            </div>
        </Card>

        <Card title="Workers">
          <Stat label="Active IDs" value={summary.workers.active} />
          <Stat label="Expired IDs" value={summary.workers.expired} />
        </Card>
      </div>

      {/* TREND CHARTS */}
      <div className="grid grid-cols-3 gap-6">
        <Trend
          title="Pre-Employment Trend"
          data={trends.preEmploymentTrend}
          onClick={d => handleDrill("preemployment", d)}
        />
        <Trend
          title="ID Renewal Trend"
          data={trends.idRenewalTrend}
          onClick={d => handleDrill("idrenewal", d)}
        />
        <Trend
          title="OPD Trend"
          data={trends.opdTrend}
          onClick={d => handleDrill("opd", d)}
        />
      </div>

      {/* DRILL-DOWN MODAL */}
      {drill.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-gray-900 text-gray-100 p-6 rounded-xl w-[85%] max-h-[80%] overflow-auto shadow-xl">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold">
                {drill.type.toUpperCase()} Records
              </h2>
              <button
                onClick={() => setDrill({ open: false })}
                className="text-red-500"
              >
                ✕
              </button>
            </div>

            <table className="border w-full">
              <thead>
  <tr className="border-b border-gray-700 text-gray-400 text-sm">
    <th className="text-left p-2">ID</th>
    <th className="text-left p-2">Worker</th>
    <th className="text-left p-2">Date</th>
  </tr>
</thead>

              <tbody>
  {drill.records.map(r => (
    <tr
      key={r._id}
      className="border-b border-gray-800 hover:bg-gray-800 transition"
    >
      <td className="p-2">{r.id}</td>
      <td className="p-2">{r.worker_id}</td>
      <td className="p-2">
        {new Date(
          r.date_of_examination ||
            r.date_of_renewal ||
            r.created_at
        ).toLocaleDateString()}
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------ UI ATOMS ------------------ */

function Card({ title, children }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow hover:shadow-lg transition">
      <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </div>
  );
}


function Stat({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-300">{label}</span>
      <span className="text-xl font-bold text-white">{value}</span>
    </div>
  );
}


function BigStat({ value }) {
  return (
    <p className="text-5xl font-extrabold text-center text-blue-400">
      {value}
    </p>
  );
}


function Trend({ title, data, onClick }) {
  const formatted = data.map(d => ({
    label: formatLabel(d._id),
    count: d.count,
    raw: d._id
  }));

  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow">
      <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={formatted}>
          <XAxis dataKey="label" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              color: "#fff"
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#60A5FA"
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
            onClick={e => {
              if (!e || !e.payload) return;
              onClick(e.payload.raw);
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

