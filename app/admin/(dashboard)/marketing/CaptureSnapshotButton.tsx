"use client";

import { useState, useTransition } from "react";
import { triggerMarketingSnapshot } from "../../marketing-actions";

export function CaptureSnapshotButton() {
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
              const results = await triggerMarketingSnapshot();
              const summary = results.map((r) => `${r.platform}: ${r.ok ? `${r.contentCount} items` : r.error}`).join(" · ");
              setMsg(summary);
            } catch (err) {
              setMsg(err instanceof Error ? err.message : "Failed to capture snapshot.");
            }
          })
        }
      >
        {pending ? "Capturing…" : "Capture snapshot now"}
      </button>
      {msg && <span className="note">{msg}</span>}
    </div>
  );
}
