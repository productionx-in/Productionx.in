"use client";

import { useEffect, useRef } from "react";
import { initGsap, gsap, prefersReducedMotion } from "../lib/motion";

/**
 * Deliberately not a track record.
 *
 * The studio has never published project or client counts, so inventing them
 * here would put a false claim on the homepage. Every figure below is either
 * structurally true of the site itself or a promise made elsewhere in the
 * copy. Swap in real totals once they are confirmed.
 */
const STATS = [
  { n: 5, suffix: "", l: "Services under one roof" },
  { n: 24, suffix: "h", l: "Reply to every brief" },
  { n: 2, suffix: "", l: "Ways to make it — crew or pipeline" },
  { n: 4, suffix: "K", l: "Delivery standard" },
];

export default function Proof() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(".stat").forEach((el) => {
        const to = Number(el.dataset.n || 0);
        const out = el.querySelector<HTMLElement>(".stat__v")!;
        const counter = { v: 0 };
        gsap.to(counter, {
          v: to,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => { out.textContent = String(Math.round(counter.v)); },
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="band proof" ref={root}>
      <div className="shell wrap">
        <div className="proof__grid" data-reveal data-reveal-group>
          {STATS.map((s) => (
            <div className="stat" key={s.l} data-n={s.n}>
              <div className="stat__n">
                <span className="stat__v">0</span>
                <span className="suffix">{s.suffix}</span>
              </div>
              <div className="label stat__l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
