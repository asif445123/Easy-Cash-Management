"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";

interface ExpenseSlice {
  code: string;
  description: string;
  amount: number;
  percent: number;
}

interface ExpensePieChartProps {
  data: ExpenseSlice[];
}

// A distinct color per slice, for the first 10 categories. Kept as the flat
// base color — the Dashboard's breakdown boxes still key off this exact
// array/order for their accent colors, so don't reorder it.
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

// Lightens a hex color by `amount` (0-255) per channel, for the highlight
// stop of each slice's gradient (gives the glossy/beveled "3D" sheen).
function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

// Returns a slice's color by index. The first 10 use the fixed, hand-picked
// COLORS palette. Beyond that, instead of wrapping back around and repeating
// a color already used elsewhere in the chart (which made slice #11 visually
// merge into slice #1 once there were more than 10 categories), new hues are
// generated using the golden-angle — this spaces them out evenly around the
// color wheel so no two slices ever collide, no matter how many there are.
function getColor(index: number): string {
  if (index < COLORS.length) return COLORS[index];
  const hue = (index * 137.508) % 360;
  return hslToHex(hue, 65, 45);
}

// The PIE's own diameter is fixed at 4 inches (96 CSS px/inch = 384px);
// the surrounding chart area is larger so the leader-line labels have
// room to breathe outside the circle instead of being clipped.
const PIE_DIAMETER = 4 * 96;
const CHART_WIDTH = PIE_DIAMETER + 260;
const CHART_HEIGHT = PIE_DIAMETER + 60;
const OUTER_RADIUS = PIE_DIAMETER / 2 - 4;
const RADIAN = Math.PI / 180;

// Renders the hovered slice larger, with a brighter white outline and its
// own drop shadow, so it visibly "pops" toward the viewer even when sitting
// right next to another slice — the interactive stand-in for literal 3D
// tilt, without distorting any slice's actual proportions.
function renderActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 14}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      stroke="#fff"
      strokeWidth={3}
      filter="url(#pieHoverShadow)"
    />
  );
}

export default function ExpensePieChart({ data }: ExpensePieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

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
  // an elbow, then a horizontal stub, with "01. Name XX.XX%" as one line of
  // text at the end — the same style as Excel/PowerPoint pie charts, but
  // with a serial number prefix (same index-based numbering as the
  // Dashboard's Expense breakdown boxes) so a slice is easy to cross-reference.
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
    const color = getColor(index);
    const serial = String(index + 1).padStart(2, "0");

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
          {`${serial}. ${entry.name}  ${pct.toFixed(2)}%`}
        </text>
      </g>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: CHART_HEIGHT,
        maxWidth: CHART_WIDTH,
        margin: "0 auto",
        // Soft ambient shadow under the whole pie for a lifted, "3D-styled"
        // feel — CSS filter works reliably on SVG content, unlike the SVG
        // <feDropShadow> approach which Recharts fights with internally.
        filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.14))",
      }}
    >
      <ResponsiveContainer>
        <PieChart style={{ overflow: "visible" }}>
          <defs>
            {chartData.map((_, i) => {
              const color = getColor(i);
              return (
                <radialGradient key={i} id={`pieGrad-${i}`} cx="35%" cy="30%" r="75%">
                  <stop offset="0%" stopColor={lighten(color, 70)} />
                  <stop offset="100%" stopColor={color} />
                </radialGradient>
              );
            })}
            <filter id="pieHoverShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.35" />
            </filter>
          </defs>
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
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, i) => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(undefined)}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={`url(#pieGrad-${i})`} stroke="#fff" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`Rs ${value.toLocaleString()}`, "Amount"]} />
        </PieChart>
      </ResponsiveContainer>

      {/* Recharts hardcodes `overflow: hidden` on its own inner .recharts-surface
          <svg>, so the `style` prop above alone doesn't reach it — it lands on
          a wrapping element instead. This forcibly overrides that inline style
          so leader-line labels near the edge (e.g. the longest left-side
          label) don't get clipped. */}
      <style jsx global>{`
        .recharts-wrapper,
        .recharts-surface {
          overflow: visible !important;
        }
      `}</style>
    </div>
  );
}
