"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Arrow } from "./graphics";
import { initGsap, gsap, ScrollTrigger, prefersReducedMotion, EASE } from "../lib/motion";

/**
 * Six distinct frames, brightest first so the strip reads immediately.
 * The list is repeated once to close the loop; the clone never shares the
 * viewport with its original at this frame height.
 */
const FRAMES = [
  { src: "/thumb-fashion.jpg", tag: "Campaign" },
  { src: "/thumb-hotel.jpg", tag: "Hospitality" },
  { src: "/thumb-bmw.jpg", tag: "Automotive" },
  { src: "/thumb-cafe.jpg", tag: "Food & bev" },
  { src: "/thumb-event.jpg", tag: "Live" },
  { src: "/thumb-mercedes.jpg", tag: "Night unit" },
];

/**
 * Split a headline into per-word masks so each word can ride up out of its
 * own clipping box. The inter-word space is emitted *outside* the mask —
 * inside it, `overflow: hidden` clips the space and the words run together.
 */
function Line({ text, accent }: { text: string; accent?: { word: string; tone: "em" | "mint" } }) {
  const words = text.split(" ");
  return (
    <>
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
    </>
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

  const loop = [...FRAMES, ...FRAMES];

  return (
    <section className="slate" id="top" ref={root}>
      <div className="shell wrap">
        <div className="slate__grid">
          <div className="slate__copy">
            <div className="slate__eyebrow">
              <span className="rule" aria-hidden="true" />
              <span className="label">Hyderabad · Vizag · Pan India</span>
            </div>

            {/* Two lines, each closing on an italic accent — the rhythm that
                carried the first version, now saying the wider thing. */}
            <h1>
              <Line text="We build the brand." accent={{ word: "brand", tone: "em" }} />
              <Line text="Then earn the audience." accent={{ word: "audience", tone: "mint" }} />
            </h1>

            <p className="lead slate__lead">
              ProductionX is a brand and marketing studio. Strategy, website, content,
              social and paid — with the crew and the AI pipeline that make them, under
              one roof and one monthly retainer.
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
              {loop.map((f, i) => (
                <figure className="frame" key={`${f.src}-${i}`}>
                  <Image
                    src={f.src}
                    alt=""
                    width={380}
                    height={475}
                    priority={i < 2}
                    sizes="(max-width: 1000px) 240px, 380px"
                  />
                  <figcaption className="frame__tag">{f.tag}</figcaption>
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
