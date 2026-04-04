import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const riskZone = (bmi) => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

export default function ObesityChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="chart-shell">
      <div className="chart-title">BMI Risk Projection</div>
      <div className="chart-subtitle">
        Projected BMI with and without the plan
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(143,163,200,0.15)"
          />
          <ReferenceArea y1={0} y2={18.5} fill="#0099ff" fillOpacity={0.08} />
          <ReferenceArea y1={18.5} y2={25} fill="#00d4aa" fillOpacity={0.08} />
          <ReferenceArea y1={25} y2={30} fill="#fbbf24" fillOpacity={0.08} />
          <ReferenceArea y1={30} y2={45} fill="#ff4d6d" fillOpacity={0.08} />
          <XAxis dataKey="week" stroke="#8fa3c8" fontSize={11} />
          <YAxis
            stroke="#8fa3c8"
            fontSize={12}
            domain={[10, 45]}
            ticks={[10, 18.5, 25, 30, 40]}
            width={132}
            tickFormatter={(value) => {
              if (value === 18.5) return "18.5 ← Under";
              if (value === 25) return "25 ← Normal up to";
              if (value === 30) return "30+ ← Over";
              return value;
            }}
          />
          <Tooltip
            contentStyle={{
              background: "#131d35",
              border: "1px solid #1e2d4a",
              borderRadius: "12px",
              color: "#e8f0fe",
            }}
            formatter={(value) => [`BMI: ${value} (${riskZone(value)})`, ""]}
          />
          <ReferenceLine y={18.5} stroke="#0099ff" strokeDasharray="4 4" />
          <ReferenceLine y={25} stroke="#00d4aa" strokeDasharray="4 4" />
          <ReferenceLine y={30} stroke="#fbbf24" strokeDasharray="4 4" />
          <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
          <Area
            type="monotone"
            dataKey="withPlan"
            name="With Plan"
            stroke="#00d4aa"
            fill="rgba(0,212,170,0.18)"
            strokeWidth={2.5}
          />
          <Area
            type="monotone"
            dataKey="withoutPlan"
            name="Without Plan"
            stroke="#ff4d6d"
            fill="rgba(255,77,109,0.12)"
            strokeWidth={2}
            strokeDasharray="6 3"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
