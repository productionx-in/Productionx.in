"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec2 } from "ogl";

/**
 * Full-viewport WebGL field sitting behind the page content.
 *
 * Domain-warped fBm noise in the brand gold, driven by three inputs: time, a
 * smoothed pointer position, and scroll velocity. The result is a slow drifting
 * haze that brightens and stretches as the visitor scrolls or moves the cursor,
 * so the dark background reacts instead of sitting inert.
 *
 * Rendered on a single fullscreen triangle — cheaper than a quad, no vertex
 * overdraw along the diagonal. Skipped entirely for reduced-motion, and paused
 * when the tab is hidden.
 */
const FRAG = `#version 300 es
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uVel;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = uv;
  p.x *= uRes.x / uRes.y;

  float t = uTime * 0.045;

  // Domain warp: offset the sample point by another noise field so the haze
  // curls rather than sliding as a flat sheet.
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3 - t)));
  vec2 r = vec2(
    fbm(p + 3.0 * q + vec2(1.7, 9.2) + 0.15 * t),
    fbm(p + 3.0 * q + vec2(8.3, 2.8) - 0.12 * t)
  );
  float f = fbm(p + 2.4 * r);

  // Pointer proximity lifts the field locally.
  vec2 m = uMouse;
  m.x *= uRes.x / uRes.y;
  float d = distance(p, m);
  float glow = smoothstep(0.85, 0.0, d) * 0.55;

  // Scroll velocity stretches and brightens it.
  float vel = clamp(abs(uVel) * 0.0022, 0.0, 1.0);

  float intensity = pow(f, 2.4) * (0.30 + glow + vel * 0.65);

  vec3 gold = vec3(0.894, 0.725, 0.310);
  vec3 deep = vec3(0.043, 0.039, 0.055);
  vec3 col = mix(deep, gold, intensity * 0.85);

  // Vignette so the field never competes with the copy at the edges.
  float vig = smoothstep(1.25, 0.25, length(uv - 0.5));
  col *= vig;

  fragColor = vec4(col, intensity * 0.9 * vig);
}`;

const VERT = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

export default function Backdrop() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ alpha: true, antialias: false, dpr: Math.min(devicePixelRatio, 1.5) });
    } catch {
      // No WebGL: the CSS gradients underneath already carry the design.
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    host.appendChild(gl.canvas);
    gl.canvas.style.cssText = "width:100%;height:100%;display:block";

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uRes: { value: new Vec2(1, 1) },
        uTime: { value: 0 },
        uMouse: { value: new Vec2(0.5, 0.5) },
        uVel: { value: 0 },
      },
      transparent: true,
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      renderer.setSize(host.clientWidth, host.clientHeight);
      program.uniforms.uRes.value.set(gl.canvas.width, gl.canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // Pointer and velocity are eased toward their targets so the field never
    // snaps — it settles.
    const target = { x: 0.5, y: 0.5 };
    const current = { x: 0.5, y: 0.5 };
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX / window.innerWidth;
      target.y = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let lastY = window.scrollY;
    let vel = 0;
    const onScroll = () => {
      vel += Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    let running = true;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!running) return;
      current.x += (target.x - current.x) * 0.045;
      current.y += (target.y - current.y) * 0.045;
      vel *= 0.9;
      program.uniforms.uTime.value = t * 0.001;
      program.uniforms.uMouse.value.set(current.x, current.y);
      program.uniforms.uVel.value = vel;
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(loop);

    const onVis = () => { running = !document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      gl.canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="gl-backdrop" aria-hidden="true" />;
}
