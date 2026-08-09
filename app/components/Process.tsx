"use client";

import { useEffect, useRef } from "react";
import { ArtSlate, ArtLens, ArtNodes, ArtWave, ArtDeliver } from "./graphics";
import { initGsap, gsap, prefersReducedMotion } from "../lib/motion";

const STEPS = [
  { k: "01", t: "Brief", d: "One call. What the work has to achieve, who it is for, and the date it has to land by.", Art: ArtSlate },
  { k: "02", t: "Direction", d: "Treatment, references, shot list or prompt board. You approve the look before anything is booked.", Art: ArtLens },
  { k: "03", t: "Make", d: "Crew and camera, a render pipeline, or both — chosen on what the job needs, not what we prefer.", Art: ArtNodes },
  { k: "04", t: "Post", d: "Edit, sound, grade, versions. You see cuts, not a black box, and notes are welcome mid-flight.", Art: ArtWave },
  { k: "05", t: "Deliver", d: "Masters, platform crops, stills and captions — packaged so your team can publish without asking us.", Art: ArtDeliver },
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
          <span className="label idx">04 — How it runs</span>
          <h2>No mystery, no drift, no surprise invoice.</h2>
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
