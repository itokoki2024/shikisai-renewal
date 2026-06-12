/**
 * dotted-surface.js
 * Vanilla JS port of the DottedSurface React component.
 * Three.js r89 via CDN (same CDN used by shader-lines.js).
 * Creates a particle wave where dots undulate with sine waves.
 */

const THREE_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js";

export function initDottedSurface(container) {
  if (!container) return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  let cleanupFn = null;

  const start = () => {
    cleanupFn = _boot(container, window.THREE);
  };

  if (window.THREE) {
    start();
  } else {
    const script = document.createElement("script");
    script.src = THREE_CDN;
    script.onload = start;
    script.onerror = () =>
      console.warn("[dotted-surface] Failed to load Three.js from CDN");
    document.head.appendChild(script);
  }

  return {
    destroy() {
      if (cleanupFn) {
        cleanupFn();
        cleanupFn = null;
      }
    },
  };
}

function _boot(container, THREE) {
  if (!THREE) return null;

  container.innerHTML = "";

  const SEPARATION = 150;
  const AMOUNTX = 40;
  const AMOUNTY = 60;

  /* ── Scene / Camera ───────────────────────────────── */
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    1,
    10000
  );
  camera.position.set(0, 355, 1220);

  /* ── Renderer ──────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x000000, 0); // transparent background
  container.appendChild(renderer.domElement);

  /* ── Particle geometry ────────────────────────────── */
  const count = AMOUNTX * AMOUNTY;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  let idx = 0;
  for (let ix = 0; ix < AMOUNTX; ix++) {
    for (let iy = 0; iy < AMOUNTY; iy++) {
      positions[idx * 3]     = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
      positions[idx * 3 + 1] = 0;
      positions[idx * 3 + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
      // Light gray on dark hero background
      colors[idx * 3]     = 0.78;
      colors[idx * 3 + 1] = 0.78;
      colors[idx * 3 + 2] = 0.78;
      idx++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  // r89 API: addAttribute (not setAttribute)
  geometry.addAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.addAttribute("color",    new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 8,
    vertexColors: THREE.VertexColors, // r89 enum
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  /* ── Animation loop ───────────────────────────────── */
  let frame = 0;
  let animId;

  const animate = () => {
    animId = requestAnimationFrame(animate);

    const posAttr = geometry.attributes.position;
    const arr = posAttr.array;

    let j = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        arr[j * 3 + 1] =
          Math.sin((ix + frame) * 0.3) * 50 +
          Math.sin((iy + frame) * 0.5) * 50;
        j++;
      }
    }

    posAttr.needsUpdate = true;
    renderer.render(scene, camera);
    frame += 0.1;
  };

  /* ── Resize handler ───────────────────────────────── */
  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };

  window.addEventListener("resize", onResize, { passive: true });
  animate();

  /* ── Cleanup ──────────────────────────────────────── */
  return () => {
    window.removeEventListener("resize", onResize);
    cancelAnimationFrame(animId);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  };
}
