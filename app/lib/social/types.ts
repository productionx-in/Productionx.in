export type PlatformKey = "facebook" | "instagram" | "youtube" | "linkedin" | "google_business" | "tiktok";

export type SocialPost = {
  id: string;
  message?: string;
  createdAt: string;
  permalinkUrl?: string;
};

/**
 * Thrown by a connected adapter's fetchPosts() when the live call fails —
 * distinct from "not connected," which never reaches the network at all.
 */
export class PlatformApiError extends Error {
  status: number;
  tokenExpired: boolean;

  constructor(message: string, status: number, tokenExpired = false) {
    super(message);
    this.status = status;
    this.tokenExpired = tokenExpired;
  }
}

/**
 * One shape every platform implements, whether it's fully wired (Facebook
 * today) or a stub waiting on its own app setup and credentials (everything
 * else). The Social page and its overview panel only ever talk to this
 * interface — adding a platform later means writing one adapter and adding
 * it to the registry, not touching the page.
 */
export interface PlatformAdapter {
  key: PlatformKey;
  label: string;
  /** Cheap, synchronous, no network — true once real credentials exist. */
  isConfigured(): boolean;
  /** What the connections panel shows when isConfigured() is false. */
  notConnectedReason(): string;
  /** Only called when isConfigured() is true. Throws PlatformApiError on failure. */
  fetchPosts(): Promise<SocialPost[]>;
}
