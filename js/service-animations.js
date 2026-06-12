import { animate, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@11/+esm";

const EASE = [0.22, 1, 0.36, 1];
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function inViewOnce(target, cb, options) {
  let stop = inView(target, (info) => { stop?.(); cb(info); }, options);
  return stop;
}

/* ── ヒーロー入場 ── */
function initHero() {
  if (REDUCED) return;

  const items = document.querySelectorAll(".svc-hero .js-reveal");
  items.forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    animate(el,
      { opacity: [0, 1], y: [20, 0] },
      { duration: 0.9, delay: 0.3 + i * 0.12, easing: EASE }
    );
  });
}

/* ── サービスカード スタガー ── */
function initServiceCards() {
  if (REDUCED) return;

  const cards = document.querySelectorAll(".svc-card");
  if (!cards.length) return;

  cards.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(32px)";
  });

  inViewOnce(".svc-overview-grid", () => {
    const anim = animate([...cards], { opacity: [0, 1], y: [32, 0] }, {
      duration: 0.65,
      delay: stagger(0.1, { startDelay: 0.08 }),
      easing: EASE,
    });
    if (anim?.finished) {
      anim.finished.then(() => {
        cards.forEach(el => {
          el.style.opacity = "";
          el.style.transform = "";
        });
      });
    }
  }, { amount: 0.05 });
}

/* ── サービス詳細 ビジュアル + コンテンツ ── */
function initDetails() {
  if (REDUCED) return;

  document.querySelectorAll(".svc-detail").forEach((section) => {
    const visual = section.querySelector(".svc-detail__visual");
    const content = section.querySelectorAll(".svc-detail__content .js-reveal");

    if (visual) {
      inViewOnce(visual, () => {
        animate(visual, { opacity: [0, 1], scale: [0.95, 1] }, {
          duration: 0.9, easing: EASE,
        });
      }, { amount: 0.2 });
    }

    if (content.length) {
      content.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(22px)";
      });
      inViewOnce(section, () => {
        animate([...content], { opacity: [0, 1], y: [22, 0] }, {
          duration: 0.65,
          delay: stagger(0.1, { startDelay: 0.1 }),
          easing: EASE,
        });
      }, { amount: 0.1 });
    }
  });
}

/* ── 選ばれる理由カード スタガー ── */
function initWhyCards() {
  if (REDUCED) return;

  const cards = document.querySelectorAll(".svc-why-card");
  if (!cards.length) return;

  cards.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
  });

  inViewOnce(".svc-why-grid", () => {
    animate([...cards], { opacity: [0, 1], y: [28, 0] }, {
      duration: 0.6,
      delay: stagger(0.1, { startDelay: 0.1 }),
      easing: EASE,
    });
  }, { amount: 0.05 });
}

/* ── フロー ステップ ── */
function initFlowSteps() {
  if (REDUCED) return;

  const steps = document.querySelectorAll(".svc-step");
  if (!steps.length) return;

  steps.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
  });

  inViewOnce(".svc-flow-steps", () => {
    animate([...steps], { opacity: [0, 1], y: [20, 0] }, {
      duration: 0.55,
      delay: stagger(0.08, { startDelay: 0.1 }),
      easing: EASE,
    });
  }, { amount: 0.05 });
}

/* ── FAQ リスト ── */
function initFAQ() {
  if (REDUCED) return;

  const items = document.querySelectorAll(".svc-faq-item");
  if (!items.length) return;

  items.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
  });

  inViewOnce(".svc-faq-list", () => {
    animate([...items], { opacity: [0, 1], y: [16, 0] }, {
      duration: 0.5,
      delay: stagger(0.07, { startDelay: 0.1 }),
      easing: EASE,
    });
  }, { amount: 0.05 });
}

/* ── Section headings ── */
function initSectionHeadings() {
  if (REDUCED) return;

  document.querySelectorAll(".section-heading-hero.js-reveal").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
    inViewOnce(el, () => {
      animate(el, { opacity: [0, 1], y: [28, 0] }, {
        duration: 0.7, easing: EASE,
      });
    }, { amount: 0.15 });
  });
}

/* ────────────────────────────────────────────
   Split CTA スライドイン + Sparkles フェードイン
   トップページと同じ2段階タイミングで実行
─────────────────────────────────────────────── */
function initCTASlide() {
  if (REDUCED) return;

  const left  = document.querySelector(".split-cta-item-green");
  const right = document.querySelector(".split-cta-item-dark");
  if (!left || !right) return;

  left.style.opacity  = "0";
  left.style.transform  = "translateX(-48px)";
  right.style.opacity = "0";
  right.style.transform = "translateX(48px)";

  inViewOnce(".split-cta", () => {
    animate(left,  { opacity: [0, 1], x: [-48, 0] }, { duration: 0.78, delay: 0.05, easing: EASE });
    animate(right, { opacity: [0, 1], x: [48,  0] }, { duration: 0.78, delay: 0.22, easing: EASE });
  }, { amount: 0.15 });
}

function initSparklesAnimation() {
  if (REDUCED) return;

  const ctaSparkles = document.getElementById("sparkles-cta");
  const ctaLines    = document.querySelector(".sparkles-cta-lines");

  if (!ctaSparkles && !ctaLines) return;

  inViewOnce(".split-cta-item-green", () => {
    if (ctaSparkles) {
      animate(ctaSparkles, { opacity: [0, 1] }, {
        duration: 1.8,
        delay: 0.25,
        easing: "ease-out",
      });
    }
    if (ctaLines) {
      animate(ctaLines, { opacity: [0, 1] }, {
        duration: 1.0,
        delay: 0.6,
        easing: EASE,
      });
    }
  }, { amount: 0.18 });
}

/* ── 起動 ── */
function boot() {
  initServiceCards();
  initDetails();
  initWhyCards();
  initFlowSteps();
  initFAQ();
  initSectionHeadings();
  initCTASlide();
  initSparklesAnimation();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { initHero(); boot(); });
} else {
  initHero();
  boot();
}
