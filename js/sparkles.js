/**
 * sparkles.js
 * SHiKiSAi コーポレートサイト — tsParticles Sparkles 初期化
 *
 * @tsparticles/slim v3 の UMD バンドルで公開されたグローバルを使用:
 *   window.tsParticles  — パーティクルエンジン
 *   window.loadSlim     — slim プラグインのロード関数
 *
 * ビジュアルの fade-in は animations.js (Motion) が担当。
 * このファイルはパーティクルエンジンの初期化のみを行う。
 */
(async () => {
  /* ─── 安全チェック ─── */
  if (typeof tsParticles === "undefined" || typeof loadSlim === "undefined") {
    console.warn("[sparkles.js] tsParticles が読み込まれていません。CDN を確認してください。");
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* performance-mobile §3.A: タッチデバイスは密度・fps を半減 */
  const IS_MOBILE = window.matchMedia("(pointer: coarse)").matches;

  /* ─── エンジン初期化（一度だけ） ─── */
  await loadSlim(tsParticles);

  /* ════════════════════════════════════════
     Hero Sparkles
  ════════════════════════════════════════ */
  const heroEl = document.getElementById("sparkles-hero");
  if (heroEl) {
    await tsParticles.load({
      id: "sparkles-hero",
      options: {
        background: { color: { value: "transparent" } },
        fullScreen: { enable: false, zIndex: 0 },
        fpsLimit: IS_MOBILE ? 45 : 60,
        interactivity: { events: { onClick: { enable: false }, onHover: { enable: false } } },
        particles: {
          color: { value: "#ffffff" },
          number: { density: { enable: true, width: 1400, height: 900 }, value: IS_MOBILE ? 20 : 58 },
          opacity: {
            value: { min: 0.05, max: 0.55 },
            animation: { enable: true, speed: IS_MOBILE ? 0.5 : 0.9, sync: false, startValue: "random", destroy: "none", mode: "auto" },
          },
          size: { value: { min: 0.4, max: 1.8 } },
          move: { enable: true, speed: { min: 0.05, max: IS_MOBILE ? 0.15 : 0.3 }, direction: "none", random: true, straight: false, outModes: { default: "out" } },
        },
        detectRetina: true,
      },
    });
  }

  /* ════════════════════════════════════════
     CTA Contact Sparkles
  ════════════════════════════════════════ */
  const ctaEl = document.getElementById("sparkles-cta");
  if (ctaEl) {
    await tsParticles.load({
      id: "sparkles-cta",
      options: {
        background: { color: { value: "transparent" } },
        fullScreen: { enable: false, zIndex: 0 },
        fpsLimit: IS_MOBILE ? 45 : 60,
        interactivity: { events: { onClick: { enable: false }, onHover: { enable: false } } },
        particles: {
          color: { value: "#ffffff" },
          number: { density: { enable: true, width: 500, height: 400 }, value: IS_MOBILE ? 25 : 110 },
          opacity: {
            value: { min: 0.08, max: 1 },
            animation: { enable: true, speed: IS_MOBILE ? 1.5 : 3.5, sync: false, startValue: "random", destroy: "none", mode: "auto" },
          },
          size: { value: { min: 0.3, max: 1.6 } },
          move: { enable: true, speed: { min: 0.08, max: IS_MOBILE ? 0.2 : 0.45 }, direction: "none", random: true, straight: false, outModes: { default: "out" } },
        },
        detectRetina: true,
      },
    });
  }
})();
