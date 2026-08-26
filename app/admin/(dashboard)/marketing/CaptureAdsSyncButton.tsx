"use client";

import { useState, useTransition } from "react";
import { triggerMetaAdsSync } from "../../marketing-actions";

export function CaptureAdsSyncButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        className="btn btn--ghost"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setMsg(null);
            try {
              const r = await triggerMetaAdsSync();
              setMsg(r.ok ? `Synced ${r.campaignCount} campaign(s).` : r.error || "Sync failed.");
            } catch (err) {
              setMsg(err instanceof Error ? err.message : "Sync failed.");
            }
          })
        }
      >
        {pending ? "Syncing…" : "Sync Meta Ads now"}
      </button>
      {msg && <span className="note">{msg}</span>}
    </div>
  );
}
