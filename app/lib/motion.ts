import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Shared motion vocabulary.
 *
 * Every animation on the site draws its easing and duration from here, so the
 * whole page moves with one rhythm instead of each section inventing its own.
 * The values mirror the `--ease` / `--dur` tokens in globals.css.
 */
export const EASE = "expo.out";
export const EASE_IO = "expo.inOut";
export const DUR = 0.85;
export const STAGGER = 0.045;

let registered = false;

/** Register plugins exactly once, on the client. */
export function initGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: EASE, duration: DUR });
  registered = true;
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * The one reveal used across the page: a short rise with a fade, fired when
 * the element is a little way into view. Elements opt in with `data-reveal`,
 * and `data-reveal-group` staggers direct children instead of the element.
 */
export function revealAll(scope: Element | Document = document) {
  if (prefersReducedMotion()) {
    scope.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  scope.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    const group = el.hasAttribute("data-reveal-group");
    const targets = group ? Array.from(el.children) : [el];

    if (group) gsap.set(el, { opacity: 1, y: 0 });

    gsap.fromTo(
      targets,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration: DUR,
        stagger: group ? STAGGER : 0,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });
}

export { gsap, ScrollTrigger };
