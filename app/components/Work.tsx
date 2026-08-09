"use client";

import { useEffect, useRef } from "react";
import { initGsap, gsap, prefersReducedMotion } from "../lib/motion";

type Item = {
  code: string;
  name: string;
  kind: string;
  note: string;
  src: string;
  video?: string;
  shape?: "tall" | "wide";
};

/**
 * Two naming rules, applied consistently.
 *
 * Commissioned production work carries a prototype name — those films belong
 * to the brands that paid for them and are not ours to credit. Websites we
 * built are already published under the client's own name, so they are shown
 * and credited as they appear in public.
 */
const ITEMS: Item[] = [
  { code: "PX·01", name: "Marque", kind: "Automotive", note: "Launch film for a luxury sedan — night unit, four locations, single day.", src: "/thumb-mercedes.jpg", shape: "wide" },
  { code: "PX·02", name: "Atelier", kind: "Fashion", note: "Lookbook campaign cut to a hero film plus twenty verticals.", src: "/thumb-fashion.jpg", shape: "tall" },
  { code: "PX·03", name: "Sonder", kind: "Hospitality", note: "Property film for a boutique hotel — rooms, kitchen, and the quiet hours.", src: "/thumb-hotel.jpg" },
  { code: "PX·04", name: "Roast", kind: "Food & beverage", note: "A month of café social from one morning of coverage.", src: "/thumb-cafe.jpg", shape: "tall" },
  { code: "PX·05", name: "Apex", kind: "Automotive", note: "Performance drive edit — tracking vehicle, gimbal, and a closed road.", src: "/thumb-bmw.jpg", shape: "wide" },
  { code: "PX·06", name: "Assembly", kind: "Live", note: "Multi-camera event coverage with same-night social delivery.", src: "/thumb-event.jpg" },

  { code: "WB·01", name: "Mahati Bhikshu", kind: "Website", note: "Portfolio site for a Kuchipudi artist and screen actor — film, gallery, press.", src: "/builds/mahati.jpg", video: "/builds/mahati", shape: "wide" },
  { code: "WB·02", name: "Aruna Bhikshu", kind: "Website", note: "Practitioner site built around teaching, repertoire and enquiry.", src: "/builds/aruna.jpg", video: "/builds/aruna", shape: "wide" },
  { code: "WB·03", name: "Sattva Amora", kind: "Website", note: "Launch microsite for a residential project — narrative scroll, enquiry capture.", src: "/builds/sattva-amora.jpg", video: "/builds/sattva-amora", shape: "wide" },
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
        const cards = gsap.utils.toArray<HTMLElement>(".wcard__media img, .wcard__media video");
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

    // Touch has no hover, so the website walkthroughs play when they are on
    // screen and stop as soon as they leave it.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      },
      { threshold: 0.55 }
    );
    if (window.matchMedia("(hover: none)").matches) {
      root.current?.querySelectorAll("video").forEach((v) => io.observe(v));
    }

    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section className="band work" id="work" ref={root}>
      <div className="shell wrap">
        <header className="sec-head" data-reveal>
          <span className="label idx">02 — Selected work</span>
          <h2>Nine jobs, nine problems, one crew.</h2>
        </header>
      </div>

      <div className="work__viewport">
        <div className="work__track">
          {ITEMS.map((it) => (
            <article className={`wcard${it.shape ? ` wcard--${it.shape}` : ""}`} key={it.code}>
              <div className="wcard__media">
                <span className="wcard__badge">{it.kind}</span>
                {it.video ? (
                  <video
                    poster={it.src}
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-label={`${it.name} — website walkthrough`}
                    onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                    onMouseLeave={(e) => e.currentTarget.pause()}
                  >
                    <source src={`${it.video}.webm`} type="video/webm" />
                    <source src={`${it.video}.mp4`} type="video/mp4" />
                  </video>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.src} alt={`${it.name} — ${it.kind.toLowerCase()} project still`} loading="lazy" />
                )}
              </div>
              <div className="wcard__row">
                <h3>{it.name}</h3>
                <span className="label">{it.code}</span>
              </div>
              <p>{it.note}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="work__rail" aria-hidden="true"><i /></div>
    </section>
  );
}
