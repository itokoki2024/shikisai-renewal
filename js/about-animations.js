import { animate, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@11/+esm";

const EASE = [0.22, 1, 0.36, 1];
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function inViewOnce(target, cb, options) {
  let stop = inView(target, (info) => { stop?.(); cb(info); }, options);
  return stop;
}

/* ヒーローの入場アニメーション */
function initHero() {
  if (REDUCED) return;

  const items = document.querySelectorAll(".about-hero .js-reveal");
  items.forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    animate(el,
      { opacity: [0, 1], y: [20, 0] },
      { duration: 0.9, delay: 0.3 + i * 0.12, easing: EASE }
    );
  });
}

/* WHO WE ARE — オービット + コンテンツ */
function initIdentity() {
  if (REDUCED) return;

  const visual = document.querySelector(".about-identity__visual");
  if (visual) {
    inViewOnce(visual, () => {
      animate(visual, { opacity: [0, 1], scale: [0.94, 1] }, {
        duration: 1.0, easing: EASE,
      });
    }, { amount: 0.2 });
  }

  const contentItems = document.querySelectorAll(
    ".about-identity__content .js-reveal"
  );
  contentItems.forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
  });

  inViewOnce(".about-identity__content", () => {
    animate(
      [...contentItems],
      { opacity: [0, 1], y: [24, 0] },
      { duration: 0.7, delay: stagger(0.1, { startDelay: 0.1 }), easing: EASE }
    );
  }, { amount: 0.1 });
}

/* Mission / Vision カード */
function initMV() {
  if (REDUCED) return;

  const cards = document.querySelectorAll(".mv-card");
  cards.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
  });

  inViewOnce(".mv-grid", () => {
    animate(
      [...cards],
      { opacity: [0, 1], y: [28, 0] },
      { duration: 0.88, delay: stagger(0.18, { startDelay: 0.1 }), easing: EASE }
    );
  }, { amount: 0.1 });
}

/* Values リスト */
function initValues() {
  if (REDUCED) return;

  const items = document.querySelectorAll(".value-item");
  items.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateX(-16px)";
  });

  inViewOnce(".value-list", () => {
    animate(
      [...items],
      { opacity: [0, 1], x: [-16, 0] },
      { duration: 0.68, delay: stagger(0.1, { startDelay: 0.1 }), easing: EASE }
    );
  }, { amount: 0.05 });
}

/* Member カード */
function initMembers() {
  if (REDUCED) return;

  const cards = document.querySelectorAll(".member-card");
  cards.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(32px)";
  });

  inViewOnce(".member-grid", () => {
    animate(
      [...cards],
      { opacity: [0, 1], y: [32, 0] },
      { duration: 0.65, delay: stagger(0.12, { startDelay: 0.1 }), easing: EASE }
    );
  }, { amount: 0.05 });
}

/* Split CTA スライドイン */
function initSplitCTA() {
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

/* Sparkles フェードイン — トップページと同じ分離タイミングで実行 */
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

/* ────────────────────────────────────────────
   Member Showcase — 写真 ↔ 名前行のホバー連動
   ReactコンポーネントのhoverState管理をvanilla JSで再現
─────────────────────────────────────────────── */
function initMemberShowcase() {
  const cards = document.querySelectorAll('.msc-card');
  const rows  = document.querySelectorAll('.msc-row');
  if (!cards.length || !rows.length) return;

  function activate(id) {
    cards.forEach(c => {
      c.classList.toggle('is-active', c.dataset.id === id);
      c.classList.toggle('is-dimmed', c.dataset.id !== id);
    });
    rows.forEach(r => {
      r.classList.toggle('is-active', r.dataset.id === id);
      r.classList.toggle('is-dimmed', r.dataset.id !== id);
    });
  }

  function deactivate() {
    cards.forEach(c => { c.classList.remove('is-active', 'is-dimmed'); });
    rows.forEach(r  => { r.classList.remove('is-active', 'is-dimmed'); });
  }

  [...cards, ...rows].forEach(el => {
    el.addEventListener('mouseenter', () => activate(el.dataset.id));
    el.addEventListener('mouseleave', deactivate);
    el.addEventListener('focus',      () => activate(el.dataset.id));
    el.addEventListener('blur',       deactivate);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') activate(el.dataset.id);
    });
  });
}

/* WHO WE ARE — For-cards 個別スタガー（about-for-grid の js-reveal を外して個別管理） */
function initForCards() {
  if (REDUCED) return;

  const grid = document.querySelector('.about-for-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.about-for-card'));
  cards.forEach(c => {
    c.style.opacity = '0';
    c.style.transform = 'translateY(20px)';
  });

  inViewOnce(grid, () => {
    animate(cards,
      { opacity: [0, 1], y: [20, 0] },
      { duration: 0.72, delay: stagger(0.15, { startDelay: 0.15 }), easing: EASE }
    );
  }, { amount: 0.15 });
}

/* MEMBER グリッド — スタガーフェードイン（修正版）
   モバイル: Motion で軽量フェード
   デスクトップ: CSS keyframes + is-visible クラスで stagger */
function initMgnGrid() {
  if (REDUCED) return;

  const grid = document.querySelector('.mgn-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.mgn-card'));
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  cards.forEach(c => {
    c.style.opacity = '0';
    c.style.willChange = 'transform, opacity';
    if (!isMobile) c.style.transform = 'translateY(22px) scale(0.97)';
  });

  inViewOnce(grid, () => {
    if (isMobile) {
      animate(cards,
        { opacity: [0, 1] },
        { duration: 0.45, delay: stagger(0.055, { startDelay: 0.05 }), easing: EASE }
      );
    } else {
      grid.classList.add('is-visible');
      setTimeout(() => {
        cards.forEach(c => { c.style.willChange = 'auto'; });
      }, 1000);
    }
  }, { amount: 0.05 });
}

/* Member heading — 文字を .mgn-letter 要素に分割しスライドアニメーションを有効化 */
function initMemberLetters() {
  document.querySelectorAll('.js-member-heading').forEach(el => {
    const text = el.textContent.trim();
    el.textContent = '';

    text.split('').forEach((char, i) => {
      const letter = document.createElement('div');
      letter.className = 'mgn-letter';
      letter.style.setProperty('--i', i);

      const inner = document.createElement('div');
      inner.className = 'mgn-letter__inner';

      [char, char].forEach(c => {
        const span = document.createElement('span');
        span.className = 'mgn-letter__char';
        span.textContent = c === ' ' ? ' ' : c;
        inner.appendChild(span);
      });

      letter.appendChild(inner);
      el.appendChild(letter);
    });
  });
}

/* Section headings */
function initSectionHeadings() {
  if (REDUCED) return;

  document.querySelectorAll(".section-heading-hero.js-reveal").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
    inViewOnce(el, () => {
      animate(el, { opacity: [0, 1], y: [28, 0] }, {
        duration: 0.88, easing: EASE,
      });
    }, { amount: 0.15 });
  });
}

function boot() {
  initMemberLetters();
  initIdentity();
  initForCards();
  initMV();
  initValues();
  initMgnGrid();
  initMemberShowcase();
  initSplitCTA();
  initSparklesAnimation();
  initSectionHeadings();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { initHero(); boot(); });
} else {
  initHero();
  boot();
}
