"use client";

import { useEffect, useRef, useState } from "react";
import { Tick, ArtTopo } from "./graphics";
import { initGsap, gsap, ScrollTrigger, prefersReducedMotion } from "../lib/motion";

const POINTS = [
  "Hero frames and walkthroughs from drawings, before a slab is poured.",
  "Interior options — finishes, light, time of day — changed in hours, not site visits.",
  "Sales collateral that matches the built result, so buyers are not surprised at handover.",
];

function timecode(seconds: number) {
  const s = Math.max(0, seconds);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(Math.floor(s % 60)).padStart(2, "0");
  const ff = String(Math.floor((s % 1) * 24)).padStart(2, "0");
  return `${mm}:${ss}:${ff}`;
}

/**
 * The previsualisation section, shown by letting the visitor drive the shot.
 *
 * Scroll position maps onto the clip's playhead, so moving down the page walks
 * the camera through the space; the timeline underneath can also be dragged.
 * It demonstrates the service rather than describing it, and it degrades to a
 * plain looping clip when the browser cannot seek smoothly or motion is off.
 */
export default function Previz() {
  const root = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tc, setTc] = useState("00:00:00");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initGsap();
    const video = videoRef.current;
    if (!video) return;

    if (prefersReducedMotion()) {
      video.loop = true;
      video.play().catch(() => {});
      return;
    }

    let duration = 0;
    let target = 0;
    let current = 0;
    let raf = 0;

    // Easing the playhead toward the scroll target keeps seeking smooth even
    // when the decoder lags a frame or two behind.
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!duration) return;
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.002) return;
      try {
        video.currentTime = current;
      } catch {
        /* seek not ready yet */
      }
      setTc(timecode(current));
    };

    const onMeta = () => {
      duration = video.duration || 0;
      if (!duration || !isFinite(duration)) return;
      setReady(true);
      raf = requestAnimationFrame(loop);
    };
    video.addEventListener("loadedmetadata", onMeta);
    video.load();

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 75%",
        end: "bottom 25%",
        scrub: true,
        onUpdate: (self) => {
          if (!duration) return;
          target = gsap.utils.clamp(0, duration - 0.05, self.progress * duration);
          gsap.set(".scrub__head", { left: `${self.progress * 100}%` });
        },
      });
    }, root);

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("loadedmetadata", onMeta);
      ctx.revert();
    };
  }, []);

  return (
    <section className="band previz" id="previz" ref={root}>
      <div className="shell wrap">
        <header className="sec-head" data-reveal>
          <span className="label idx">03 — Previsualisation</span>
          <h2>
            Sell the building <span className="mint">before</span> it exists.
          </h2>
        </header>

        <div className="previz__layout">
          <div data-reveal>
            <p className="lead">
              Developers lose months waiting for a show flat. We build the space in
              a render pipeline instead, and hand sales a walkthrough while the site
              is still soil.
            </p>

            <ul className="previz__points">
              {POINTS.map((p) => (
                <li key={p}>
                  <Tick />
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <ArtTopo className="previz__art" />
          </div>

          <figure className="scrub" data-reveal>
            <video
              ref={videoRef}
              poster="/builds/ai-03.jpg"
              muted
              playsInline
              preload="auto"
              aria-label="Previsualisation walkthrough of an unbuilt residential tower at dusk"
            >
              <source src="/builds/ai-03.webm" type="video/webm" />
              <source src="/builds/ai-03.mp4" type="video/mp4" />
            </video>

            {/* Top corners only — the lower pair would sit under the HUD. */}
            <span className="bracket tl" aria-hidden="true" />
            <span className="bracket tr" aria-hidden="true" />

            <figcaption className="scrub__hud">
              <span className="label label--mint">{ready ? "Scroll to walk through" : "Loading"}</span>
              <span className="label">{tc}</span>
            </figcaption>

            <span className="scrub__rail" aria-hidden="true">
              <i className="scrub__head" />
            </span>
          </figure>
        </div>
      </div>
    </section>
  );
}
