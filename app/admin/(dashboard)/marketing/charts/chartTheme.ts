// Mirrors app/admin/admin.css's palette. SVG chart fills need real hex
// values (CSS custom properties aren't reliably resolved inside Recharts'
// server-rendered SVG attributes), so this is the one place those values
// are duplicated — change admin.css's palette, update this file to match.
export const CHART_COLORS = {
  ink: "#0b0a0c",
  surface: "#141216",
  surface2: "#1b1820",
  bone: "#f4f1ec",
  ember: "#ff5c29",
  mint: "#7fe0cf",
  ash: "#a9a39b",
  slate: "#8b8592",
  line: "#2a2730",
};

export const PLATFORM_COLOR: Record<string, string> = {
  facebook: CHART_COLORS.mint,
  instagram: CHART_COLORS.ember,
  youtube: "#d6c37a",
};

export const tooltipStyle = {
  background: CHART_COLORS.surface2,
  border: `1px solid ${CHART_COLORS.line}`,
  borderRadius: 8,
  fontSize: 12.5,
  color: CHART_COLORS.bone,
};

export const axisTickStyle = { fill: CHART_COLORS.slate, fontSize: 11 };
