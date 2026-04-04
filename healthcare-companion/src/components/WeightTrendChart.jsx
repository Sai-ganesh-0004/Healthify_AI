import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function WeightTrendChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="chart-shell">
      <div className="chart-title">Weight Projection</div>
      <div className="chart-subtitle">
        Following the plan vs current trajectory
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(143,163,200,0.15)"
          />
          <XAxis dataKey="week" stroke="#8fa3c8" fontSize={11} />
          <YAxis
            stroke="#8fa3c8"
            fontSize={11}
            domain={["dataMin - 2", "dataMax + 2"]}
          />
          <Tooltip
            contentStyle={{
              background: "#131d35",
              border: "1px solid #1e2d4a",
              borderRadius: "12px",
              color: "#e8f0fe",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
          <Line
            type="monotone"
            dataKey="withPlan"
            name="With Plan"
            stroke="#00d4aa"
            strokeWidth={2.5}
            dot={{ fill: "#00d4aa", r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="withoutPlan"
            name="Without Plan"
            stroke="#fbbf24"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ fill: "#fbbf24", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
