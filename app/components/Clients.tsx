"use client";

import { useEffect, useRef } from "react";
import { initGsap, gsap, ScrollTrigger, prefersReducedMotion } from "../lib/motion";

/**
 * The brands the studio has actually worked with, as published on the previous
 * site. This band replaced an abstract statement marquee: for a visitor
 * deciding whether to trust a studio with their marketing budget, a real
 * client list does more work than a stylish phrase.
 */
const CLIENTS = [
  "Mercedes-Benz",
  "Tanishq",
  "1UJ Fashion",
  "Ujwala Group",
  "Silver Star Hyderabad",
  "1UJ Lifestyle",
  "Everest Abercorn",
  "Pit Stop Group",
  "Hole in the Wall",
  "Krishna Motors",
  "European Wellness",
  "Coastal Star",
  "IRDAI",
];

export default function Clients() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initGsap();
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const row = root.current!.querySelector<HTMLElement>(".marquee__row")!;
      const half = () => row.scrollWidth / 2;

      const drift = gsap.to(row, {
        x: () => -half(),
        duration: 46,
        ease: "none",
        repeat: -1,
        modifiers: { x: (v: string) => `${parseFloat(v) % half()}px` },
      });

      // Scroll velocity feeds the speed, so the band is visibly tied to the
      // reader's own movement rather than looping on an indifferent timer.
      ScrollTrigger.create({
        trigger: root.current,
        onUpdate: (self) => {
          const v = Math.abs(self.getVelocity());
          drift.timeScale(gsap.utils.clamp(0.7, 5, 1 + v / 800));
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const items = [...CLIENTS, ...CLIENTS];

  return (
    <section className="marquee" ref={root} aria-label="Clients">
      <div className="shell wrap">
        <span className="label marquee__cap">Trusted by</span>
      </div>
      <div className="marquee__row" aria-hidden="true">
        {items.map((c, i) => (
          <span key={`${c}-${i}`}>
            {c}
            <i className="marquee__dot" />
          </span>
        ))}
      </div>
      <p className="sr-only">
        Clients include {CLIENTS.slice(0, -1).join(", ")} and {CLIENTS.at(-1)}.
      </p>
    </section>
  );
}
