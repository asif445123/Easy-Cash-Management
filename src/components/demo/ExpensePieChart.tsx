"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface ExpenseSlice {
  code: string;
  description: string;
  amount: number;
  percent: number;
}

interface ExpensePieChartProps {
  data: ExpenseSlice[];
}

// A distinct color per slice, cycling if there are more categories than colors.
const COLORS = [
  "#2563EB",
  "#B3452C",
  "#5B8C5A",
  "#7C3AED",
  "#0891B2",
  "#D97706",
  "#059669",
  "#DB2777",
  "#4B5563",
  "#9333EA",
];

// The PIE's own diameter is fixed at 4 inches (96 CSS px/inch = 384px);
// the surrounding chart area is larger so the leader-line labels have
// room to breathe outside the circle instead of being clipped.
const PIE_DIAMETER = 4 * 96;
const CHART_WIDTH = PIE_DIAMETER + 260;
const CHART_HEIGHT = PIE_DIAMETER + 60;
const OUTER_RADIUS = PIE_DIAMETER / 2 - 4;
const RADIAN = Math.PI / 180;

export default function ExpensePieChart({ data }: ExpensePieChartProps) {
  // NOTE: this data array intentionally does NOT include a "percent" field.
  // Recharts' label callback receives the raw data entry merged with its
  // own computed props (cx, cy, percent, value, ...) — if the entry itself
  // also had a field named "percent", that raw value (already 0-100 from
  // our API) would silently override recharts' own computed fraction
  // (0-1), causing a double multiply-by-100 bug ("5286%" instead of
  // "52.86%"). Percentages are calculated fresh from amount / total below
  // instead, so there's no ambiguity.
  const total = data.reduce((s, d) => s + d.amount, 0);
  const chartData = data.map((d) => ({ name: d.description, value: d.amount }));

  // Classic "leader line" label: a short line from the slice's edge out to
  // an elbow, then a horizontal stub, with "Name XX.XX%" as one line of
  // text at the end — the same style as Excel/PowerPoint pie charts.
  function renderLabel(props: any) {
    const { cx, cy, midAngle, outerRadius, index } = props;
    const entry = chartData[index];
    const pct = total > 0 ? (entry.value / total) * 100 : 0;
    if (pct < 1) return null; // skip slivers too small to label legibly

    const sin = Math.sin(-midAngle * RADIAN);
    const cos = Math.cos(-midAngle * RADIAN);
    const sx = cx + outerRadius * cos;
    const sy = cy + outerRadius * sin;
    const mx = cx + (outerRadius + 22) * cos;
    const my = cy + (outerRadius + 22) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 20;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";
    const color = COLORS[index % COLORS.length];

    return (
      <g>
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={color} fill="none" strokeWidth={1.5} />
        <circle cx={sx} cy={sy} r={2.5} fill={color} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 6}
          y={ey}
          textAnchor={textAnchor}
          dominantBaseline="central"
          fontSize={12.5}
          fontWeight={600}
          fill="#3d3730"
        >
          {`${entry.name}  ${pct.toFixed(2)}%`}
        </text>
      </g>
    );
  }

  return (
    <div style={{ width: "100%", height: CHART_HEIGHT, maxWidth: CHART_WIDTH, margin: "0 auto" }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={OUTER_RADIUS}
            label={renderLabel}
            labelLine={false}
            isAnimationActive={false}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`Rs ${value.toLocaleString()}`, "Amount"]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
