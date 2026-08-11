"use client";

import { useEffect, useRef } from "react";
import { initGsap, gsap, prefersReducedMotion } from "../lib/motion";

/**
 * Three figures from the studio's published record, plus the response promise.
 *
 * "3+ years of experience" was the fourth published figure; it is dropped here
 * because the founder block below states the same thing with far more weight,
 * and because a small number of years argues against you with the kind of buyer
 * this page is written for. The reply promise earns the slot instead.
 */
const STATS = [
  { n: 50, suffix: "+", l: "Brand films produced" },
  { n: 8, suffix: "+", l: "Premium brands" },
  { n: 24, suffix: "h", l: "Reply to every brief" },
];

const CREDENTIALS = [
  { role: "Content Producer", org: "Mercedes-Benz · AP & Telangana" },
  { role: "Head of Creative & Marketing", org: "Ujwala Group · 1UJ Fashion & Lifestyle" },
  { role: "International production partner", org: "Media agencies in the UK" },
];

/**
 * Numbers alone do not close a marketing brief — the buyer wants to know who
 * is behind them. This band pairs the record with the founder's brand-side
 * experience, which is the studio's strongest and least replicable argument.
 */
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
    <section className="band proof" id="about" ref={root}>
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

        <div className="founder">
          <div data-reveal>
            <span className="label idx">06 — Why us</span>
            <h2 style={{ margin: "var(--s3) 0" }}>
              We were on your <span className="em">side</span> of the table.
            </h2>
            <p className="lead">
              Kiran Basa spent three years brand-side before starting ProductionX.
              As Content Producer at Mercedes-Benz across AP &amp; Telangana, and Head
              of Creative &amp; Marketing at Ujwala Group, he knows what a brand
              manager actually needs, what frustrates them about agencies, and what
              makes marketing perform rather than merely look good.
            </p>
            <p className="muted" style={{ marginTop: "var(--s3)" }}>
              That perspective is what the studio is built on. We do not just shoot
              and deliver — we think like the brand, plan like the strategist, and
              execute like the studio.
            </p>
          </div>

          <ul className="creds" data-reveal data-reveal-group>
            {CREDENTIALS.map((c) => (
              <li key={c.role}>
                <span className="creds__role">{c.role}</span>
                <span className="label">{c.org}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
