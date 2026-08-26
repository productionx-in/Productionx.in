export type RangeKey = "7d" | "30d" | "90d" | "this_month" | "last_month" | "custom";

export type ResolvedRange = {
  key: RangeKey;
  label: string;
  start: string; // YYYY-MM-DD, inclusive
  end: string; // YYYY-MM-DD, inclusive
  prevStart: string;
  prevEnd: string;
};

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/**
 * Turns the Overview page's ?range=/&from=/&to= query params into concrete
 * start/end dates plus an equal-length "previous period" immediately before
 * it, which is what every KPI's percentage-change comparison is computed
 * against. Falls back to the last 30 days if nothing valid is given.
 */
export function resolveRange(params: { range?: string; from?: string; to?: string }): ResolvedRange {
  const today = new Date();

  if (params.range === "custom" && params.from && params.to) {
    const start = new Date(params.from);
    const end = new Date(params.to);
    const spanMs = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 86_400_000);
    const prevStart = new Date(prevEnd.getTime() - spanMs);
    return {
      key: "custom",
      label: `${params.from} – ${params.to}`,
      start: params.from,
      end: params.to,
      prevStart: iso(prevStart),
      prevEnd: iso(prevEnd),
    };
  }

  if (params.range === "this_month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const prevMonthStart = new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), 1);
    return {
      key: "this_month",
      label: "This month",
      start: iso(start),
      end: iso(today),
      prevStart: iso(prevMonthStart),
      prevEnd: iso(prevMonthEnd),
    };
  }

  if (params.range === "last_month") {
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    const prevEnd = new Date(start.getTime() - 86_400_000);
    const prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1);
    return {
      key: "last_month",
      label: "Last month",
      start: iso(start),
      end: iso(end),
      prevStart: iso(prevStart),
      prevEnd: iso(prevEnd),
    };
  }

  const days = params.range === "7d" ? 7 : params.range === "90d" ? 90 : 30;
  const start = daysAgo(days - 1);
  const prevEnd = daysAgo(days);
  const prevStart = daysAgo(days * 2 - 1);
  return {
    key: (params.range as RangeKey) || "30d",
    label: days === 7 ? "Last 7 days" : days === 90 ? "Last 90 days" : "Last 30 days",
    start: iso(start),
    end: iso(today),
    prevStart: iso(prevStart),
    prevEnd: iso(prevEnd),
  };
}

export function percentChange(current: number | undefined, previous: number | undefined): number | undefined {
  if (current === undefined || previous === undefined || previous === 0) return undefined;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}
