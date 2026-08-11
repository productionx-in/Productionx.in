"use client";

import { useEffect, useRef } from "react";
import { ArtSlate, ArtLens, ArtNodes, ArtWave, ArtDeliver, Icon } from "./graphics";
import { initGsap, gsap, prefersReducedMotion } from "../lib/motion";

/** The studio's own five steps, as it has always described them. */
const STEPS = [
  { k: "01", t: "Brief & discovery", d: "A 30-minute call to understand your brand, your market and what the next twelve months have to deliver. No templates. A real conversation.", Art: ArtSlate },
  { k: "02", t: "Strategy & planning", d: "We study your competitors and build the plan: positioning, monthly content calendar, shoot dates, formats and the social management approach.", Art: ArtLens },
  { k: "03", t: "Production", d: "Our team handles the full shoot — or the render pipeline, when that is the faster route. You show up. We take care of everything else.", Art: ArtNodes },
  { k: "04", t: "Edit & review", d: "Content edited to your brand, with one round of feedback through our review platform. You see cuts, not a black box.", Art: ArtWave },
  { k: "05", t: "Delivery", d: "Files delivered, or posted straight to your channels — on schedule, every time, with a monthly analytics report behind it.", Art: ArtDeliver },
];

/**
 * The process, drawn as a line that completes itself as the reader descends.
 * The stroke length is tied to scroll progress, so the diagram is the progress
 * bar rather than sitting next to one.
 */
export default function Process() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const path = root.current!.querySelector<SVGPathElement>(".proc__line path");
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: ".proc__steps", start: "top 70%", end: "bottom 80%", scrub: 0.5 },
        });
      }

      gsap.utils.toArray<HTMLElement>(".step").forEach((step) => {
        gsap.from(step.querySelectorAll(".step__k, h3, p, .step__art"), {
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.06,
          scrollTrigger: { trigger: step, start: "top 82%", once: true },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="band proc" id="process" ref={root}>
      <div className="shell wrap">
        <header className="sec-head" data-reveal>
          <span className="label idx"><Icon name="analytics" size={15} />05 — How we work</span>
          <h2>Simple. Transparent. Always delivered.</h2>
        </header>

        <div className="proc__body">
          <svg className="proc__line" viewBox="0 0 4 1000" preserveAspectRatio="none" aria-hidden="true">
            <path d="M2 0 V1000" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>

          <div className="proc__steps">
            {STEPS.map(({ k, t, d, Art }) => (
              <article className="step" key={k}>
                <span className="step__k">{k}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
                <div className="step__art" aria-hidden="true">
                  <Art />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
