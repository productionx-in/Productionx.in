"use client";

import { useEffect, useRef } from "react";
import { initGsap, gsap, prefersReducedMotion } from "../lib/motion";

type Item = {
  code: string;
  name: string;
  kind: string;
  note: string;
  roster: string;
  src: string;
  shape?: "tall" | "wide";
};

/**
 * The verticals the studio actually works in, named as the studio names them,
 * with the client roster it has published for each. No invented project titles
 * and no photograph tied to a client it may not belong to.
 */
const ITEMS: Item[] = [
  { code: "01", name: "Automotive", kind: "Launch & showroom", note: "Delivery reels, showroom content and launch films. We led content for India’s first Mercedes-Maybach showroom in Hyderabad.", roster: "Mercedes-Benz · Silver Star Hyderabad", src: "/thumb-mercedes.jpg", shape: "wide" },
  { code: "02", name: "Automotive", kind: "Drive & performance", note: "Tracking-vehicle and gimbal work for premium auto retail, cut for launch and for the feed.", roster: "BMW · Krishna Motors · Premium auto", src: "/thumb-bmw.jpg" },
  { code: "03", name: "Fashion & lifestyle", kind: "Campaign & editorial", note: "Editorial content for premium fashion and lifestyle. As Head of Creative at Ujwala Group we built the visual language for 1UJ.", roster: "1UJ Fashion · 1UJ Lifestyle · Premium retail", src: "/thumb-fashion.jpg", shape: "tall" },
  { code: "04", name: "Hospitality", kind: "Property films", note: "Cinematic content for hotels and resorts — rooms, ambience, service, and the quiet hours nobody photographs.", roster: "Hotels · Resorts · Bars", src: "/thumb-hotel.jpg", shape: "wide" },
  { code: "05", name: "Food & beverage", kind: "Always-on social", note: "A month of café and restaurant content from one morning of coverage — food styling, ambience, staff, stills.", roster: "Hole in the Wall · Cafés · Restaurants", src: "/thumb-cafe.jpg", shape: "tall" },
  { code: "06", name: "Corporate & events", kind: "Launches & coverage", note: "Brand launches, corporate films, product reveals and multi-camera event coverage, delivered on schedule.", roster: "IRDAI · Everest Abercorn · Pit Stop Group", src: "/thumb-event.jpg", shape: "wide" },
];

export default function Work() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;

      const mm = gsap.matchMedia();

      // Desktop: pin the section and convert vertical distance into sideways
      // travel. The pin length equals the overflow, so the gallery finishes
      // exactly as the section releases — no dead scroll at either end.
      mm.add("(min-width: 861px)", () => {
        const track = root.current!.querySelector<HTMLElement>(".work__track")!;
        const rail = root.current!.querySelector<HTMLElement>(".work__rail i")!;
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 48);

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => gsap.set(rail, { scaleX: self.progress }),
          },
        });

        // Cards drift on a second, slower axis so the row has parallax depth
        // instead of sliding as one rigid plane.
        const cards = gsap.utils.toArray<HTMLElement>(".wcard__media img");
        cards.forEach((img, i) => {
          gsap.fromTo(
            img,
            { xPercent: -3 },
            {
              xPercent: 3,
              ease: "none",
              scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, scrub: 1 + (i % 3) * 0.2 },
            }
          );
        });

        return () => tween.kill();
      });

      // Below that the row is a normal swipeable strip; only the rail updates.
      mm.add("(max-width: 860px)", () => {
        const vp = root.current!.querySelector<HTMLElement>(".work__viewport")!;
        const rail = root.current!.querySelector<HTMLElement>(".work__rail i")!;
        const onScroll = () => {
          const max = vp.scrollWidth - vp.clientWidth;
          gsap.set(rail, { scaleX: max > 0 ? vp.scrollLeft / max : 0 });
        };
        vp.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => vp.removeEventListener("scroll", onScroll);
      });

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="band work" id="work" ref={root}>
      <div className="shell wrap">
        <header className="sec-head" data-reveal>
          <span className="label idx">02 — Selected work</span>
          <h2>Premium brands. Every vertical.</h2>
        </header>
      </div>

      <div className="work__viewport">
        <div className="work__track">
          {ITEMS.map((it) => (
            <article className={`wcard${it.shape ? ` wcard--${it.shape}` : ""}`} key={it.code}>
              <div className="wcard__media">
                <span className="wcard__badge">{it.kind}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.src} alt={`${it.name} — ${it.kind.toLowerCase()} still`} loading="lazy" />
              </div>
              <div className="wcard__row">
                <h3>{it.name}</h3>
                <span className="label">{it.code}</span>
              </div>
              <p>{it.note}</p>
              <span className="wcard__roster label">{it.roster}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="work__rail" aria-hidden="true"><i /></div>
    </section>
  );
}
