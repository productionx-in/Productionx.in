"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CHART_COLORS, tooltipStyle, axisTickStyle } from "./chartTheme";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function formatDateLabel(d: React.ReactNode) {
  return typeof d === "string" ? formatDate(d) : "";
}

export function PaidTrendChart({
  data,
  dataKey,
  label,
  color = CHART_COLORS.ember,
  valueFormatter,
}: {
  data: { date: string; [key: string]: number | string }[];
  dataKey: string;
  label: string;
  color?: string;
  valueFormatter?: (v: number) => string;
}) {
  if (data.length < 2) {
    return <div className="empty-state">Not enough history yet for {label.toLowerCase()} over time.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART_COLORS.line} vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatDate} tick={axisTickStyle} axisLine={{ stroke: CHART_COLORS.line }} tickLine={false} />
        <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={44} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={formatDateLabel}
          formatter={(v) => [valueFormatter ? valueFormatter(Number(v)) : Number(v), label]}
        />
        <Area type="monotone" dataKey={dataKey} name={label} stroke={color} fill={`url(#fill-${dataKey})`} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
