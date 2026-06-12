---
name: performance-mobile
description: Mobile animation performance rules for smooth 60fps on smartphones. Covers GPU compositing, composite-only animation properties, shimmer/parallax implementation discipline, and mobile-aware particle/WebGL density. Apply this skill alongside design-taste-frontend on any project with animations, video backgrounds, or particle effects.
---

# Mobile Performance & Smooth Animation Rules

> Smooth animation on mobile is not about tuning numbers after the fact.
> It is about making the right architectural choices from the start.
> Every rule here prevents a class of jank, not just an individual instance.

---

## 1. COMPOSITE-ONLY ANIMATION PROPERTIES (The Non-Negotiable Rule)

The browser compositing pipeline has two lanes:
- **Compositor thread** (GPU) — handles `transform` and `opacity`. Never blocks the main thread. Always smooth.
- **Main thread / paint** — handles everything else. Can be interrupted by JavaScript, layout, or paint. Causes jank.

### 1.A The Only Two Properties You May Animate

| Allowed | Why |
|---------|-----|
| `transform` (translate, scale, rotate, translateZ) | Compositor thread only — no repaint, no reflow |
| `opacity` | Compositor thread only — no repaint, no reflow |

### 1.B The Banned List (Never Animate These)

| Banned Property | Why It Causes Jank | Replacement |
|---|---|---|
| `left`, `right`, `top`, `bottom` | Triggers layout reflow every frame | `transform: translateX/Y` |
| `width`, `height` | Triggers layout | `transform: scaleX/Y` |
| `margin`, `padding` | Triggers layout | `transform: translate` |
| `box-shadow` | Triggers repaint every frame | Opacity on a separate shadow layer |
| `background-position` | Triggers repaint | Pseudo-element with `transform: translateX` |
| `background-size` | Triggers repaint | `transform: scale` on a layer |
| `border-radius` (animating) | Triggers repaint | Static value or `transform: scale` |
| `color`, `background-color` (looping) | Triggers repaint | `opacity` on a tinted overlay |
| `filter` (looping, e.g. blur) | Very expensive repaint | Use `opacity` or static `filter` |

### 1.C Shimmer / Sweep Animations — Required Pattern

Shimmer sweeps (nav CTA shimmer, card highlight, skeleton loader) are the #1 place where `left` is incorrectly animated. The correct pattern:

**WRONG (causes repaint on every frame):**
```css
@keyframes shimmer-wrong {
  0%   { left: -70%; }
  100% { left: 130%; }
}
```

**CORRECT (compositor-only):**
```css
/* Fix `left` to a constant. Animate only `transform`. */
.shimmer-element {
  position: absolute;
  top: 0;
  left: 0;           /* never changes */
  width: 45%;
  transform: translateX(-160%);   /* start off-screen left */
}
@keyframes shimmer-correct {
  0%, 60%, 100% { transform: translateX(-160%); opacity: 0; }
  10%           { opacity: 1; }
  40%           { transform: translateX(310%); opacity: 1; }
  50%           { transform: translateX(310%); opacity: 0; }
}
```

**Translate offset calculation (width-relative):**
- Element width = W% of parent
- To mimic `left: P%` → use `translateX( P / W * 100 %)`
- Example: width 45%, want `left: -70%` → `translateX( -70/45 * 100 %) = translateX(-156%)`

### 1.D Box-Shadow Glow Animations — Required Pattern

Pulsing glows that animate `box-shadow` are the #2 cause of paint jank. Replace with an opacity-animated layer:

**WRONG:**
```css
@keyframes glow-wrong {
  0%, 100% { box-shadow: none; }
  50%      { box-shadow: 0 0 14px rgba(0,102,204,0.4); }
}
```

**CORRECT:**
```css
/* Apply the shadow statically. Animate the opacity of the element/layer. */
.glow-btn {
  box-shadow: 0 0 14px rgba(0, 102, 204, 0.4);
}
.glow-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  box-shadow: 0 0 14px rgba(0, 102, 204, 0.4);
  border-radius: inherit;
  opacity: 0;
  animation: glow-pulse 3.5s ease-in-out infinite;
}
@keyframes glow-pulse {
  0%, 100% { opacity: 0; }
  50%      { opacity: 1; }
}
```

**Mobile shortcut:** Disable looping glow animations entirely on touch devices — they add zero UX value and drain battery.

```css
@media (pointer: coarse) {
  .glow-element { animation: none !important; }
}
```

---

## 2. GPU COMPOSITING LAYER HINTS (`will-change` and `translateZ`)

### 2.A When to Use `will-change`

Add `will-change` ONLY to elements that WILL animate soon. Do not add it globally as a performance shortcut — it costs GPU memory.

**Correct targets:**
- Video backgrounds: `will-change: transform`
- Elements entering via scroll-reveal (before the animation triggers)
- Continuously animating elements (sliders, marquees, looping transforms)

```css
/* Video background — always on compositor layer */
.hero-video {
  transform: translateZ(0);
  will-change: transform;
}

/* CSS marquee / infinite scroll — promote before animation */
.slider-track {
  will-change: transform;
}

/* Scroll-reveal element — set before animation, clear after */
.reveal-block {
  will-change: transform, opacity;
}
.reveal-block.is-visible {
  will-change: auto; /* release GPU memory once animation completes */
}
```

### 2.B When NOT to Use `will-change`

- On every card, every section, every element "just in case"
- On elements that only animate on hover (use `:hover` trigger instead)
- On elements that animate once and stay static

### 2.C `translateZ(0)` as Compositor Promotion

Use `transform: translateZ(0)` (or `translate3d(0,0,0)`) to force an element onto its own compositor layer when `will-change` is not appropriate (e.g., legacy browsers or when the element does not animate but needs layer isolation):

```css
.hero-video,
.parallax-bg,
.sticky-header {
  transform: translateZ(0);
}
```

---

## 3. MOBILE PARTICLE & WEBGL DENSITY RULES

Heavy canvas animations are the #1 cause of battery drain and thermal throttling on smartphones.

### 3.A Detect Mobile (Touch-Primary) Devices

Use CSS media feature — NOT screen width alone:
```css
/* Touch-primary devices (phones, tablets) */
@media (pointer: coarse) { ... }
```

In JavaScript:
```js
const IS_MOBILE = window.matchMedia("(pointer: coarse)").matches;
```

Do NOT use `window.innerWidth < 768` alone — it misses landscape phones and some tablets.

### 3.B tsParticles Density Table

| Context | Desktop | Mobile |
|---------|---------|--------|
| Hero full-screen | ≤ 100 particles, fpsLimit 60 | ≤ 25 particles, fpsLimit 45 |
| Section background | ≤ 60 particles, fpsLimit 60 | ≤ 15 particles, fpsLimit 45 |
| Small widget | ≤ 30 particles | ≤ 10 particles |

Always apply:
```js
tsParticles.load("container-id", {
  fpsLimit: IS_MOBILE ? 45 : 60,
  particles: {
    number: { value: IS_MOBILE ? 20 : 80 },
    move: { speed: IS_MOBILE ? 0.2 : 0.4 },
    opacity: {
      animation: { speed: IS_MOBILE ? 0.4 : 1.0 },
    },
  },
});
```

### 3.C Three.js / WebGL Grid Reduction on Mobile

Reduce geometry point count proportionally on mobile:
```js
const GRID_X = IS_MOBILE ? 16 : 40;
const GRID_Y = IS_MOBILE ? 24 : 60;
// Desktop: 2400 points → Mobile: 384 points (6× reduction)
```

### 3.D IntersectionObserver — Pause Canvas When Off-Screen

Never keep a canvas animation loop running when the section is not visible:
```js
const observer = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    animId = requestAnimationFrame(tick);
  } else {
    cancelAnimationFrame(animId);
  }
}, { threshold: 0.05 });
observer.observe(container);
```

---

## 4. CSS `background-attachment: fixed` — ALWAYS DISABLE ON MOBILE

`background-attachment: fixed` forces every scroll event to repaint the element's background. On iOS Safari, it does not even work as intended (it reverts to `scroll` rendering but still triggers software compositing). It is the single largest source of scroll jank on mobile.

**Rule:** Always override `background-attachment: fixed` to `scroll` on `(pointer: coarse)` devices.

```css
/* Any element that uses background-attachment: fixed */
.glow-card,
.parallax-section {
  background-attachment: fixed;
}

/* Mobile override — mandatory */
@media (pointer: coarse) {
  .glow-card,
  .parallax-section,
  .glow-card::before,
  .glow-card::after {
    background-attachment: scroll;
  }
}
```

---

## 5. VIDEO BACKGROUNDS — LOADER SYNC

A video background that appears before the buffer is ready causes a visible one-frame freeze. Always synchronize the loader / reveal with the video's `canplay` event.

```js
const videoReady = new Promise(resolve => {
  if (!videoEl || videoEl.readyState >= 2) return resolve();
  const timeout = setTimeout(resolve, 3000);   // never hang forever
  videoEl.addEventListener("canplay", () => {
    clearTimeout(timeout);
    resolve();
  }, { once: true });
});

// Wait for both animation AND video before revealing
Promise.all([loaderAnimDone, videoReady]).then(revealPage);
```

`readyState >= 2` = `HAVE_CURRENT_DATA` (enough to display the first frame).
`canplay` fires when enough data is buffered to start playback.
The 3-second timeout is a mandatory safety valve for slow connections.

---

## 6. PERFORMANCE CHECKLIST — PRE-FLIGHT

Run before declaring any animation-heavy page done.

- [ ] Zero `left` / `top` / `right` / `bottom` keyframe animations — all use `transform: translateX/Y`
- [ ] Zero `box-shadow` in `@keyframes` loops — use `opacity` on a static-shadow layer, or disabled on mobile
- [ ] Zero `background-position` in looping `@keyframes` on large elements
- [ ] `background-attachment: fixed` overridden to `scroll` inside `@media (pointer: coarse)`
- [ ] `will-change: transform` on video backgrounds and continuously-animating tracks (slider, marquee)
- [ ] `will-change: transform, opacity` on scroll-reveal elements; cleared to `auto` after animation
- [ ] `transform: translateZ(0)` on `<video>` and sticky/pinned layers
- [ ] tsParticles / Three.js grid sizes halved or quartered on `IS_MOBILE`
- [ ] Canvas animation loops paused via IntersectionObserver when section is off-screen
- [ ] Video background synced with `canplay` + timeout before loader disappears
- [ ] `@media (prefers-reduced-motion: reduce)` disables all decorative animations
- [ ] No `window.addEventListener("scroll", ...)` for animation — use `IntersectionObserver`, `requestAnimationFrame`, or CSS scroll-driven animations

---

## 7. QUICK-REFERENCE: EXPENSIVE → CHEAP SUBSTITUTIONS

| What you want | Expensive (avoid) | Cheap (use) |
|---|---|---|
| Sweep / shimmer across button | Animate `left` | Animate `transform: translateX` |
| Pulsing glow border | Animate `box-shadow` | Animate `opacity` of a static-shadow pseudo-element, or disable on mobile |
| Moving gradient text | Animate `background-position` | Animate `transform: translateX` on gradient pseudo-element, or accept repaint on small text |
| Parallax scroll | `background-attachment: fixed` | `transform: translateY` driven by scroll position (JS) or CSS scroll-driven animations |
| Particle sparkles | 200+ particles, 120fps | ≤ 30 particles, 45fps on mobile |
| Video background appears | Fixed timer loader | `canplay` + timeout sync |
| Sticky section | `position: sticky` + repaint triggers | `position: sticky` + `will-change: transform` + composite-only children |
