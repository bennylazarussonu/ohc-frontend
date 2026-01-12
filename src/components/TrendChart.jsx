import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function formatLabel(item) {
  if (item.day)
    return `${item.day}/${item.month}/${item.year}`;
  if (item.month)
    return `${item.month}/${item.year}`;
  return `${item.year}`;
}

export default function TrendChart({ title, data, onPointClick }) {
  const formatted = data.map(d => ({
    label: formatLabel(d._id),
    count: d.count,
    raw: d._id
  }));

  return (
    <div className="border p-4 rounded">
      <h3 className="font-semibold mb-2">{title}</h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={formatted}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            strokeWidth={2}
            onClick={(e) => onPointClick(e.payload.raw)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
