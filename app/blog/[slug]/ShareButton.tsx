"use client";

import { useState } from "react";

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [label, setLabel] = useState("Share");

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled — no-op
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setLabel("Link copied");
    setTimeout(() => setLabel("Share"), 2000);
  }

  return (
    <button type="button" onClick={share} className="blog-share">
      {label} ↗
    </button>
  );
}
