"use client";

import { useEffect, useRef } from "react";
import { initGsap, gsap, ScrollTrigger, prefersReducedMotion } from "../lib/motion";

const PHRASES = ["Brand films", "Ad campaigns", "AI previsualisation", "Social content", "Web builds"];

/**
 * A statement band that reads as one continuous line of film running past the
 * gate. Scroll velocity feeds its speed and skew, so the band is visibly
 * connected to the reader's own movement rather than looping on a fixed timer.
 */
export default function Kinetic() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initGsap();
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const row = root.current!.querySelector<HTMLElement>(".kinetic__row")!;
      const half = () => row.scrollWidth / 2;

      const drift = gsap.to(row, {
        x: () => -half(),
        duration: 30,
        ease: "none",
        repeat: -1,
        modifiers: { x: (v: string) => `${parseFloat(v) % half()}px` },
      });

      ScrollTrigger.create({
        trigger: root.current,
        onUpdate: (self) => {
          const v = self.getVelocity();
          drift.timeScale(gsap.utils.clamp(0.6, 6, 1 + Math.abs(v) / 700));
          gsap.to(row, {
            skewX: gsap.utils.clamp(-7, 7, -v / 320),
            duration: 0.55,
            overwrite: "auto",
          });
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const items = [...PHRASES, ...PHRASES];

  return (
    <div className="kinetic" ref={root} aria-hidden="true">
      <div className="kinetic__row">
        {items.map((p, i) => (
          <span key={`${p}-${i}`}>{p}</span>
        ))}
      </div>
    </div>
  );
}
