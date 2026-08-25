import type { PlatformAdapter } from "./types";
import { facebookAdapter } from "./adapters/facebook";
import { makeStubAdapter } from "./adapters/stub";

/**
 * Every platform the Social page knows about, in display order. Facebook is
 * the only real adapter today; the rest are honest stubs until each has its
 * own app credentials and an adapter implementing fetchPosts(). Adding a
 * platform later is: write an adapter module, add one line here.
 */
export const PLATFORM_REGISTRY: PlatformAdapter[] = [
  facebookAdapter,
  makeStubAdapter(
    "instagram",
    "Instagram",
    "Needs an Instagram Business account linked to the Meta app, plus the instagram_basic and instagram_content_publish permissions."
  ),
  makeStubAdapter(
    "youtube",
    "YouTube",
    "Needs a Google Cloud project with the YouTube Data API enabled and OAuth credentials for the channel."
  ),
  makeStubAdapter(
    "linkedin",
    "LinkedIn",
    "Needs a LinkedIn App with Share on LinkedIn (personal) or Marketing Developer Platform access (Company Page — requires LinkedIn's approval)."
  ),
  makeStubAdapter(
    "google_business",
    "Google Business Profile",
    "Needs a Google Cloud project and Google's manual Business Profile API access grant — a request form, not self-serve."
  ),
  makeStubAdapter("tiktok", "TikTok", "Needs a TikTok for Developers app with Content Posting API access."),
];

export function getPlatform(key: string): PlatformAdapter | undefined {
  return PLATFORM_REGISTRY.find((p) => p.key === key);
}
