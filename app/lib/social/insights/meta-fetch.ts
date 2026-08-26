/**
 * Shared low-level fetch helper for the new Insights modules only —
 * app/lib/social/facebook.ts and instagram.ts (the existing, working
 * content adapters) each keep their own self-contained copy of this same
 * pattern and are not touched or made to depend on this file.
 */

export class MetaInsightsError extends Error {
  status: number;
  code?: number;

  constructor(message: string, status: number, code?: number) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function metaGet(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!token) throw new MetaInsightsError("META_PAGE_ACCESS_TOKEN is missing from the environment.", 503);

  const url = new URL(`https://graph.facebook.com/v21.0/${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("access_token", token);

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    throw new MetaInsightsError("Could not reach the Meta Graph API.", 502);
  }

  const body = (await res.json().catch(() => null)) as
    | { error?: { message?: string; code?: number; error_user_msg?: string } }
    | Record<string, unknown>
    | null;

  if (!res.ok || (body as { error?: unknown })?.error) {
    const err = (body as { error?: { message?: string; code?: number } })?.error;
    throw new MetaInsightsError(err?.message || "The Meta Graph API returned an error.", res.status >= 400 ? res.status : 502, err?.code);
  }

  return (body ?? {}) as Record<string, unknown>;
}

/**
 * Insights metric names get deprecated/renamed by Meta more often than the
 * rest of the Graph API. Rather than hard-fail a whole snapshot because one
 * metric in the batch is no longer valid, this requests the full candidate
 * list, and on a "must be one of the following values" style error, drops
 * whatever it can identify as invalid and retries once. Anything still
 * rejected after that is simply omitted — the caller gets back a metrics
 * object with only the keys Meta actually returned, never a guess.
 */
export async function fetchMetricsWithFallback(
  path: string,
  candidateMetrics: string[],
  extraParams: Record<string, string> = {}
): Promise<{ data: { name: string; values?: { value: unknown }[] }[] }> {
  let metrics = [...candidateMetrics];

  for (let attempt = 0; attempt < 2 && metrics.length > 0; attempt++) {
    try {
      const body = await metaGet(path, { metric: metrics.join(","), ...extraParams });
      return body as { data: { name: string; values?: { value: unknown }[] }[] };
    } catch (err) {
      if (!(err instanceof MetaInsightsError) || attempt === 1) throw err;
      // Meta's error message names the field, e.g. "metric[2] must be one of
      // the following values: [reach, impressions, ...]" — anything named
      // in our candidate list but absent from that allowed-values list gets
      // dropped before the retry.
      const allowed = err.message.match(/\[([a-z0-9_,\s]+)\]/i)?.[1]?.split(",").map((s) => s.trim());
      if (!allowed) throw err;
      metrics = metrics.filter((m) => allowed.includes(m));
      if (metrics.length === 0) return { data: [] };
    }
  }
  return { data: [] };
}
