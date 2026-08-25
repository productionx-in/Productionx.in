import type { PlatformAdapter, PlatformKey } from "../types";

/**
 * A platform with no credentials and no implementation yet. isConfigured()
 * is always false, so the Social page never calls fetchPosts() on it — it
 * just shows "Not connected" with the real reason why, never invented data.
 * Swapping this out for a real adapter later is a one-line change in the
 * registry, not a page restructure.
 */
export function makeStubAdapter(key: PlatformKey, label: string, reason: string): PlatformAdapter {
  return {
    key,
    label,
    isConfigured: () => false,
    notConnectedReason: () => reason,
    fetchPosts: async () => {
      throw new Error(`${label} is not connected yet.`);
    },
  };
}
