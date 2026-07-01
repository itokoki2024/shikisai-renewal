/**
 * animations.js
 * SHiKiSAi コーポレートサイト — Motion ベースの入場・スクロールアニメーション
 *
 * ライブラリ: motion v11 (framer-motion の vanilla JS 版) を CDN で使用
 * バンドラーなしで動作します。
 */
import { animate, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@11/+esm";

/* ═══════════════════════════════════════════
   共通設定
═══════════════════════════════════════════ */

/** easeOutQuint — 素早く動いてゆっくり止まる自然なカーブ */
const EASE = [0.22, 1, 0.36, 1];

/** prefers-reduced-motion が有効なら全アニメーションをスキップ */
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ═══════════════════════════════════════════
   ユーティリティ
═══════════════════════════════════════════ */

/**
 * inView を「1回だけ」発火させるヘルパー。
 * Motion の inView は stop 関数を返すので、
 * コールバック内で即座に stop() する。
 */
function inViewOnce(target, cb, options) {
  let stop = inView(
    target,
    (info) => {
      stop?.();
      cb(info);
    },
    options,
  );
  return stop;
}

/* ═══════════════════════════════════════════
   1. ヒーロー セクション — ローダー後スローフェードイン
   ─ hero-inner コンテナ全体をゆっくり浮かび上がらせる
═══════════════════════════════════════════ */
function initHeroEntrance() {
  if (REDUCED) return;

  const heroInner = document.querySelector(".hero-inner");
  if (!heroInner) return;

  heroInner.style.opacity = "0";
  heroInner.style.transform = "translateY(24px)";

  const indicator = document.querySelector(".scroll-indicator");
  if (indicator) {
    indicator.style.opacity = "0";
  }

  function runHeroEntrance() {
    // ローダーフェードと重ねて黒い空白をなくす (delay=exitFadeMs=0.35s)
    animate(heroInner, { opacity: [0, 1], y: [24, 0] }, {
      duration: 1.0,
      delay: 0.35,
      easing: EASE,
    });

    if (indicator) {
      animate(indicator, { opacity: [0, 1] }, {
        duration: 1.0,
        delay: 1.1,
        easing: EASE,
      });
    }
  }

  // loader-end（ヴェポライズ完了）でヒーロー入場を開始し、ローダーフェードと重ねる
  if (window.__shikisaiLoaderEnded) {
    runHeroEntrance();
  } else {
    window.addEventListener("shikisai:loader-end", runHeroEntrance, { once: true });
  }
}

/* ═══════════════════════════════════════════
   3. サービスカード スタガー
   ─ スクロールカーテン後にカードが順番に浮き上がる
═══════════════════════════════════════════ */
function initServiceCards() {
  if (REDUCED) return;

  const cards = document.querySelectorAll(".service-card");
  if (!cards.length) return;

  // サービスカードは js-reveal なし → インラインで初期状態を設定
  cards.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(36px)";
    el.style.willChange = "opacity, transform";
  });

  inViewOnce(".service-grid", () => {
    const anim = animate(".service-card", { opacity: [0, 1], y: [36, 0] }, {
      duration: 0.65,
      delay: stagger(0.09, { startDelay: 0.12 }),
      easing: EASE,
    });
    // アニメーション完了後インラインスタイルをクリア → CSS hover が効く
    if (anim && anim.finished) {
      anim.finished.then(() => {
        cards.forEach(el => {
          el.style.transform = "";
          el.style.opacity = "";
          el.style.willChange = "";
        });
      });
    }
  }, { amount: 0.05 });
}

/* ═══════════════════════════════════════════
   4. Works — スタット カード スタガー
   ─ 数字カードが横に並んで順番に登場
═══════════════════════════════════════════ */
function initStatCards() {
  if (REDUCED) return;

  const cards = document.querySelectorAll(".stat-card");
  if (!cards.length) return;

  // js-reveal の CSS 遷移を WAAPI で上書き（スタガー効果を追加するため）
  cards.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(32px)";
    el.style.willChange = "opacity, transform";
  });

  inViewOnce(".stats-grid", () => {
    animate(".stat-card", { opacity: [0, 1], y: [32, 0] }, {
      duration: 0.6,
      delay: stagger(0.08, { startDelay: 0.15 }),
      easing: EASE,
    });
  }, { amount: 0.05 });
}

/* ═══════════════════════════════════════════
   5. Company — バリューカード スタガー
   ─ 5 つの価値が少しずつ遅れて出現
═══════════════════════════════════════════ */
function initCompanyValues() {
  if (REDUCED) return;

  const items = document.querySelectorAll(".company-value-item");
  if (!items.length) return;

  // js-reveal の CSS 遷移を上書き + わずかなスケールを加える
  items.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(24px) scale(0.97)";
    el.style.willChange = "opacity, transform";
  });

  inViewOnce(".company-value-grid", () => {
    animate(".company-value-item", {
      opacity: [0, 1],
      y: [24, 0],
      scale: [0.97, 1],
    }, {
      duration: 0.55,
      delay: stagger(0.07, { startDelay: 0.1 }),
      easing: EASE,
    });
  }, { amount: 0.05 });
}

/* ═══════════════════════════════════════════
   5b. Company タイトル — TextEffect blur per char
   ─ スクロールで文字ごとにblur→クリアのスタガー入場
═══════════════════════════════════════════ */
function initCompanyTitleEffect() {
  if (REDUCED) return;

  const titles = document.querySelectorAll(".company-block-title");
  if (!titles.length) return;

  titles.forEach((el) => {
    const clone = el.cloneNode(true);
    el.innerHTML = "";
    const charSpans = [];

    Array.from(clone.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!node.textContent.trim()) return;

        [...node.textContent].forEach((char) => {
          const span = document.createElement("span");
          span.textContent = char;

          if (char.trim()) {
            span.className = "te-char";
            span.style.opacity = "0";
            span.style.filter = "blur(10px)";
            charSpans.push(span);
          } else {
            span.style.display = "inline";
          }

          el.appendChild(span);
        });
      } else if (node.nodeName === "BR") {
        el.appendChild(document.createElement("br"));
      } else {
        el.appendChild(node.cloneNode(true));
      }
    });

    inViewOnce(el, () => {
      animate(
        charSpans,
        { opacity: [0, 1], filter: ["blur(10px)", "blur(0px)"] },
        {
          duration: 0.45,
          delay: stagger(0.025, { startDelay: 0.05 }),
          easing: EASE,
        },
      );
    }, { amount: 0.3 });
  });
}

/* ═══════════════════════════════════════════
   6. News — カード スタガー
   ─ ニュース一覧が上から順番に登場
═══════════════════════════════════════════ */
function initNewsCards() {
  if (REDUCED) return;

  const cards = document.querySelectorAll(".news-card");
  if (!cards.length) return;

  cards.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.willChange = "opacity, transform";
  });

  inViewOnce(".news-list", () => {
    animate(".news-card", { opacity: [0, 1], y: [24, 0] }, {
      duration: 0.55,
      delay: stagger(0.1, { startDelay: 0.1 }),
      easing: EASE,
    });
  }, { amount: 0.05 });
}

/* ═══════════════════════════════════════════
   7. CTA — スプリット スライドイン
   ─ 左右のパネルが外側から中央へスライド
═══════════════════════════════════════════ */
function initCTASlide() {
  if (REDUCED) return;

  const left = document.querySelector(".split-cta-item-green");
  const right = document.querySelector(".split-cta-item-dark");
  if (!left || !right) return;

  left.style.opacity = "0";
  left.style.transform = "translateX(-48px)";
  right.style.opacity = "0";
  right.style.transform = "translateX(48px)";

  inViewOnce(".split-cta", () => {
    animate(left, { opacity: [0, 1], x: [-48, 0] }, {
      duration: 0.78,
      delay: 0.05,
      easing: EASE,
    });
    animate(right, { opacity: [0, 1], x: [48, 0] }, {
      duration: 0.78,
      delay: 0.22,
      easing: EASE,
    });
  }, { amount: 0.15 });
}

/* ═══════════════════════════════════════════
   8. セクション見出し フェードアップ
   ─ SERVICE・NEWS の見出しブロックが浮き上がる
═══════════════════════════════════════════ */
function initSectionHeadings() {
  if (REDUCED) return;

  // js-reveal のない見出しを対象に（js-reveal 付きは CSS が担当）
  const headings = document.querySelectorAll(
    "#service .section-heading, .news-section .section-heading",
  );
  if (!headings.length) return;

  headings.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(32px)";
    el.style.willChange = "opacity, transform";

    inViewOnce(el, () => {
      animate(el, { opacity: [0, 1], y: [32, 0] }, {
        duration: 0.75,
        easing: EASE,
      });
    }, { amount: 0.15 });
  });
}

/* ═══════════════════════════════════════════
   9. Works スライダー フェードイン
   ─ 画像スライダーエリアをふんわり表示
═══════════════════════════════════════════ */
function initWorksSlider() {
  if (REDUCED) return;

  const slider = document.querySelector(".works-slider");
  if (!slider) return;

  slider.style.opacity = "0";
  slider.style.willChange = "opacity";

  inViewOnce(slider, () => {
    animate(slider, { opacity: [0, 1] }, {
      duration: 1.1,
      easing: "ease-out",
    });
  }, { amount: 0.05 });
}

/* ═══════════════════════════════════════════
   10. Sparkles フェードイン
   ─ tsParticles コンテナの登場アニメーション
   ─ sparkles.js がパーティクルを初期化済みの前提
═══════════════════════════════════════════ */
function initSparklesAnimation() {
  if (REDUCED) return;

  /* ── CTA スパークル — スクロールで inView フェードイン ── */
  const ctaSparkles = document.getElementById("sparkles-cta");
  const ctaLines = document.querySelector(".sparkles-cta-lines");

  if (ctaSparkles || ctaLines) {
    inViewOnce(".split-cta-item-green", () => {
      // パーティクルレイヤー: ゆっくり浮かび上がる
      if (ctaSparkles) {
        animate(ctaSparkles, { opacity: [0, 1] }, {
          duration: 1.8,
          delay: 0.25,
          easing: "ease-out",
        });
      }
      // グラデーションライン: 少し遅れて輝く
      if (ctaLines) {
        animate(ctaLines, { opacity: [0, 1] }, {
          duration: 1.0,
          delay: 0.6,
          easing: EASE,
        });
      }
    }, { amount: 0.18 });
  }
}

/* ═══════════════════════════════════════════
   初期化
   modules は defer 相当のため、DOMContentLoaded
   済みの場合も考慮してフォールバック
═══════════════════════════════════════════ */
function boot() {
  initSparklesAnimation(); // Sparkles フェードイン (CTA)
  initServiceCards();
  initStatCards();
  initCompanyTitleEffect();
  initCompanyValues();
  initNewsCards();
  initCTASlide();
  initSectionHeadings();
  initWorksSlider();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

// DOMContentLoaded 後 — ヒーロー入場（loader-end イベント連動）
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeroEntrance);
} else {
  initHeroEntrance();
}

// Hero スパークル: shikisai:loader-end の 200ms 後にフェードイン
if (!REDUCED) {
  function startHeroSparkles() {
    setTimeout(() => {
      const heroSparkles = document.getElementById("sparkles-hero");
      if (heroSparkles) {
        animate(heroSparkles, { opacity: [0, 0.88] }, {
          duration: 2.8,
          easing: "ease-out",
        });
      }
    }, 200);
  }

  if (window.__shikisaiScreenVisible) {
    startHeroSparkles();
  } else {
    window.addEventListener("shikisai:screen-visible", startHeroSparkles, { once: true });
  }
}
