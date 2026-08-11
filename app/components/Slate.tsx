"use client";

import { useEffect, useRef } from "react";
import { Arrow, Icon } from "./graphics";
import { initGsap, gsap, ScrollTrigger, prefersReducedMotion, EASE } from "../lib/motion";

/**
 * What the studio makes, drawn rather than photographed.
 *
 * The strip used to run six stills. They were shot on different days for
 * different clients and, above the fold, read as a slideshow of stock rather
 * than a statement of capability. Six marks in the house icon family say what
 * is on offer immediately, cost nothing to load, and stay crisp at any size —
 * the real footage still carries the work gallery further down, where a
 * visitor has asked to see it.
 */
const MARKS = [
  { icon: "strategy", label: "Brand strategy", pillar: "Marketing", tone: "ember" },
  { icon: "film", label: "Brand & ad films", pillar: "Production", tone: "ink" },
  { icon: "social", label: "Social management", pillar: "Marketing", tone: "ember" },
  { icon: "reel", label: "Reels & shorts", pillar: "Production", tone: "ink" },
  { icon: "website", label: "Websites & search", pillar: "Digital", tone: "mint" },
  { icon: "previz", label: "AI & previz", pillar: "Digital", tone: "mint" },
];

/**
 * Split a headline into per-word masks so each word can ride up out of its
 * own clipping box. The inter-word space is emitted *outside* the mask —
 * inside it, `overflow: hidden` clips the space and the words run together.
 */
function Line({ text, accent }: { text: string; accent?: { word: string; tone: "em" | "mint" | "ink" } }) {
  const words = text.split(" ");
  return (
    // Block, not inline: three claims flowing into one paragraph is exactly
    // the blurring this headline exists to undo.
    <span className="hline">
      {words.map((w, i) => {
        const isAccent = accent && w.replace(/[^A-Za-z]/g, "") === accent.word;
        return (
          <span key={`${w}-${i}`}>
            <span className="wordmask">
              <span className={isAccent ? accent!.tone : undefined}>{w}</span>
            </span>
            {i < words.length - 1 ? " " : " "}
          </span>
        );
      })}
    </span>
  );
}

export default function Slate() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      if (!reduced) {
        // Opening: the headline assembles word by word, then the supporting
        // material fades up underneath it.
        const tl = gsap.timeline({ delay: 0.15 });
        tl.from(".wordmask > span", {
          yPercent: 110,
          duration: 1.05,
          ease: EASE,
          stagger: 0.035,
        })
          .from(".slate__eyebrow", { opacity: 0, duration: 0.7 }, 0.15)
          .from(".slate__lead", { opacity: 0, y: 16, duration: 0.8 }, "-=0.55")
          .from(".slate__foot > *", { opacity: 0, y: 16, duration: 0.7, stagger: 0.06 }, "-=0.6")
          .from(".strip", { opacity: 0, duration: 1.1 }, 0.1);
      }

      // The strip never stops moving; scrolling only changes how fast.
      const track = root.current?.querySelector<HTMLElement>(".strip__track");
      if (track && !reduced) {
        const vertical = window.matchMedia("(min-width: 1001px)").matches;
        const span = () => (vertical ? track.scrollHeight / 2 : track.scrollWidth / 2);
        const prop = vertical ? "y" : "x";

        const drift = gsap.to(track, {
          [prop]: () => -span(),
          duration: 34,
          ease: "none",
          repeat: -1,
          modifiers: {
            [prop]: (v: string) => `${parseFloat(v) % span()}px`,
          },
        });

        ScrollTrigger.create({
          onUpdate: (self) => {
            const v = Math.abs(self.getVelocity());
            drift.timeScale(gsap.utils.clamp(0.5, 5, 1 + v / 800));
          },
        });
      }

      // Headline recedes as the next section arrives — depth, not a jump cut.
      if (!reduced) {
        gsap.to(".slate__copy", {
          y: -70,
          opacity: 0.15,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 },
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  const loop = [...MARKS, ...MARKS];

  return (
    <section className="slate" id="top" ref={root}>
      <div className="shell wrap">
        <div className="slate__grid">
          <div className="slate__copy">
            {/*
              This line used to list cities. Where the studio works is already
              in the contact block, the footer and the structured data — above
              the headline it was spending the most valuable line on the page
              saying nothing a visitor could act on. It now carries the one
              fact no competitor can copy.
            */}
            <div className="slate__eyebrow">
              <span className="rule" aria-hidden="true" />
              <span className="label">
                Brand-side experience · Mercedes-Benz, Ujwala Group, 1UJ
              </span>
            </div>

            {/* One line per discipline, each closing on an italic accent in
                that discipline's colour — ember for marketing, ink for
                production, mint for digital. The colour code is set here and
                held for the rest of the page. */}
            <h1>
              <Line text="Marketing that thinks." accent={{ word: "thinks", tone: "em" }} />
              <Line text="Content that performs." accent={{ word: "performs", tone: "ink" }} />
              <Line text="Sites that convert." accent={{ word: "convert", tone: "mint" }} />
            </h1>

            <p className="lead slate__lead">
              Three disciplines under one roof: brand and marketing strategy,
              content production with our own crew, and websites, search and AI
              previsualisation. Take one of them, or all three on one retainer.
            </p>

            <div className="slate__foot">
              <a href="#contact" className="btn">
                Book a free call
                <Arrow className="arrow" />
              </a>
              <a href="#work" className="btn btn--ghost">
                See the work
                <Arrow className="arrow" />
              </a>
              <span className="label">Every frame earns its place</span>
            </div>
          </div>

          <div className="strip" aria-hidden="true">
            <div className="strip__track">
              {loop.map((m, i) => (
                <figure className={`mark mark--${m.tone}`} key={`${m.label}-${i}`}>
                  <span className="mark__pillar">{m.pillar}</span>
                  <Icon name={m.icon} size={62} className="mark__ico" />
                  <figcaption className="mark__label">{m.label}</figcaption>
                  <span className="bracket br" />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>

      <span className="bracket tl" style={{ margin: "var(--gutter)" }} aria-hidden="true" />
      <span className="bracket tr" style={{ margin: "var(--gutter)" }} aria-hidden="true" />
      <span className="bracket bl" style={{ margin: "var(--gutter)" }} aria-hidden="true" />
      <span className="bracket br" style={{ margin: "var(--gutter)" }} aria-hidden="true" />

      <div className="scrollcue">
        <span className="scrollcue__line" aria-hidden="true" />
        <span className="label">Scroll</span>
      </div>
    </section>
  );
}
