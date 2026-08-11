"use client";

import { useEffect, useRef, useState } from "react";
import { Tick, ArtTopo, Icon } from "./graphics";
import { initGsap, gsap, ScrollTrigger, prefersReducedMotion } from "../lib/motion";

const POINTS = [
  "Walkthroughs and hero frames straight from drawings, before a slab is poured.",
  "Finishes, light and time of day changed in hours, not in site visits.",
  "Generated footage for brands with no budget for a full unit — product scenes, concept frames, campaign cutaways.",
  "Collateral that matches the built result, so buyers are not surprised at handover.",
];

function timecode(seconds: number) {
  const s = Math.max(0, seconds);
  const ss = String(Math.floor(s)).padStart(2, "0");
  const ff = String(Math.floor((s % 1) * 24)).padStart(2, "0");
  return `${ss}:${ff}`;
}

/**
 * The previsualisation section, shown by letting the visitor drive the shot.
 *
 * Scroll position maps onto the clip's playhead, so moving down the page walks
 * the camera through the space. It demonstrates the service rather than
 * describing it, and it degrades to a plain looping clip whenever the browser
 * cannot seek smoothly or the visitor has asked for reduced motion.
 */
export default function Previz() {
  const root = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<"loading" | "scrub" | "play">("loading");

  useEffect(() => {
    initGsap();
    const video = videoRef.current;
    if (!video) return;

    if (prefersReducedMotion()) {
      video.loop = true;
      video.play().catch(() => {});
      setMode("play");
      return;
    }

    let duration = 0;
    let target = 0;
    let seeking = false;
    let landed = false;
    let alive = true;
    let fallbackTimer = 0;

    const paint = () => {
      if (tcRef.current) tcRef.current.textContent = timecode(video.currentTime);
    };

    /**
     * Assigning `currentTime` while a seek is already in flight cancels that
     * seek. Driving it straight from a scroll handler therefore throws away
     * almost every request and the picture crawls. Issue one seek at a time
     * and let the `seeked` event release the next — the playhead then tracks
     * the scroll instead of fighting it.
     */
    const pump = () => {
      if (!alive || seeking || !duration) return;
      if (Math.abs(video.currentTime - target) < 0.04) return;
      seeking = true;
      try {
        video.currentTime = target;
      } catch {
        seeking = false;
      }
    };

    const onSeeked = () => {
      seeking = false;
      landed = true;
      paint();
      pump();
    };
    video.addEventListener("seeked", onSeeked);

    const start = () => {
      duration = video.duration || 0;
      if (!duration || !isFinite(duration)) return;
      video.pause();
      setMode("scrub");
      paint();
      ScrollTrigger.refresh();

      // If no seek has completed shortly after load, this browser cannot scrub
      // this encode. Rather than leave a dead frame under a "scroll to walk
      // through" label, let the clip simply play.
      fallbackTimer = window.setTimeout(() => {
        if (alive && !landed) {
          video.loop = true;
          video.play().catch(() => {});
          setMode("play");
        }
      }, 3500);
    };

    video.addEventListener("loadedmetadata", start);
    if (video.readyState >= 1) start();
    else video.load();

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 80%",
        end: "bottom 20%",
        onUpdate: (self) => {
          if (headRef.current) headRef.current.style.left = `${self.progress * 100}%`;
          if (!duration || video.loop) return;
          target = gsap.utils.clamp(0, duration - 0.05, self.progress * duration);
          pump();
        },
      });
    }, root);

    return () => {
      alive = false;
      clearTimeout(fallbackTimer);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadedmetadata", start);
      ctx.revert();
    };
  }, []);

  return (
    <section className="band previz" id="previz" ref={root}>
      <div className="shell wrap">
        <header className="sec-head" data-reveal>
          <span className="label idx idx--digital">
            <Icon name="ai" size={15} />
            04 — Digital · AI &amp; previsualisation
          </span>
          <h2>
            Sell the building <span className="mint">before</span> it exists.
          </h2>
        </header>

        <div className="previz__layout">
          <div data-reveal>
            <p className="lead">
              A show flat takes months and costs a fortune. We build the space in a
              render pipeline instead and hand your sales team a walkthrough while
              the site is still soil — then feed the same frames into the brochure,
              the ads and the launch campaign.
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
              <span className="label label--mint">
                {mode === "loading"
                  ? "Loading"
                  : mode === "scrub"
                  ? "Scroll to walk through"
                  : "Previsualisation"}
              </span>
              <span className="label" ref={tcRef}>00:00</span>
            </figcaption>

            <span className="scrub__rail" aria-hidden="true">
              <i className="scrub__head" ref={headRef} />
            </span>
          </figure>
        </div>
      </div>
    </section>
  );
}
