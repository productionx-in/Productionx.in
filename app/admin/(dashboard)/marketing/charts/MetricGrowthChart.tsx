"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CHART_COLORS, PLATFORM_COLOR, tooltipStyle, axisTickStyle } from "./chartTheme";

export type GrowthPoint = { date: string; facebook: number; instagram: number };

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatDateLabel(d: React.ReactNode) {
  return typeof d === "string" ? formatDate(d) : "";
}

export function MetricGrowthChart({ data, title }: { data: GrowthPoint[]; title: string }) {
  if (data.length < 2) {
    return <div className="empty-state">Not enough historical data yet for {title.toLowerCase()} over time — check back after a few daily snapshots.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="fillFacebook" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={PLATFORM_COLOR.facebook} stopOpacity={0.35} />
            <stop offset="95%" stopColor={PLATFORM_COLOR.facebook} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fillInstagram" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={PLATFORM_COLOR.instagram} stopOpacity={0.35} />
            <stop offset="95%" stopColor={PLATFORM_COLOR.instagram} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART_COLORS.line} vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatDate} tick={axisTickStyle} axisLine={{ stroke: CHART_COLORS.line }} tickLine={false} />
        <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={tooltipStyle} labelFormatter={formatDateLabel} />
        <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.ash }} />
        <Area type="monotone" dataKey="facebook" name="Facebook" stroke={PLATFORM_COLOR.facebook} fill="url(#fillFacebook)" strokeWidth={2} />
        <Area type="monotone" dataKey="instagram" name="Instagram" stroke={PLATFORM_COLOR.instagram} fill="url(#fillInstagram)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
