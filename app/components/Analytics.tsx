"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * First-party pageview + "live now" tracking. No cookies, no third-party
 * script — a random id kept in sessionStorage groups events from one visit
 * without identifying anyone across sessions or devices. Skips /admin so the
 * studio's own dashboard use never counts as a "visitor."
 */
export function Analytics() {
  const pathname = usePathname();
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    try {
      let id = sessionStorage.getItem("px_sid");
      if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem("px_sid", id);
      }
      sessionId.current = id;
    } catch {
      sessionId.current = crypto.randomUUID();
    }

    const send = () => {
      const body = JSON.stringify({
        sessionId: sessionId.current,
        path: pathname,
        referrer: document.referrer || null,
      });
      const blob = new Blob([body], { type: "application/json" });
      if (!navigator.sendBeacon || !navigator.sendBeacon("/api/track", blob)) {
        fetch("/api/track", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true });
      }
    };

    send();
    const heartbeat = setInterval(send, 25000);
    return () => clearInterval(heartbeat);
  }, [pathname]);

  return null;
}
