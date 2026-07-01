/**
 * loader-ring.js
 * SHiKiSAi サイトローダー — 円形プログレスリング + パーセント + 3パネル退場
 *
 * タイミング:
 *   0 → 90%  : PHASE1_MS (速め)
 *   90 → 100%: PHASE2_MS (ゆっくり)
 */
(function () {
  "use strict";

  var PHASE1_MS    = 1400;  // 0→90% にかける時間
  var PHASE2_MS    = 900;   // 90→100% にかける時間（ゆっくり）
  var TOTAL_MS     = PHASE1_MS + PHASE2_MS;
  var EXIT_TOTAL_MS = 820;  // パネル退場にかかる最大時間

  var loader  = document.getElementById("siteLoader");
  var ring    = loader && loader.querySelector(".site-loader__ring-progress");
  var counter = document.getElementById("loaderPercent");
  if (!loader || !ring) return;

  // サイト内遷移時はローダーをスキップ
  if (sessionStorage.getItem("shikisai-visited")) {
    loader.style.display = "none";
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-loaded");
    window.__shikisaiLoaderEnded = true;
    window.__shikisaiScreenVisible = true;
    window.dispatchEvent(new CustomEvent("shikisai:loader-end"));
    window.dispatchEvent(new CustomEvent("shikisai:screen-visible"));
    return;
  }
  sessionStorage.setItem("shikisai-visited", "1");

  var CIRCUMFERENCE = 2 * Math.PI * 88; // ≈ 552.92
  var startTs  = null;
  var finished = false;
  var lastPct  = -1;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /* 経過時間 → 表示進捗(0〜1) */
  function getProgress(elapsed) {
    if (elapsed <= PHASE1_MS) {
      // 0 → 0.9
      return easeOut(elapsed / PHASE1_MS) * 0.9;
    } else {
      // 0.9 → 1.0（ゆっくり）
      var t = Math.min((elapsed - PHASE1_MS) / PHASE2_MS, 1);
      return 0.9 + easeInOut(t) * 0.1;
    }
  }

  function update(ratio) {
    ring.style.strokeDashoffset = CIRCUMFERENCE * (1 - ratio);

    if (counter) {
      var pct = Math.round(ratio * 100);
      if (pct !== lastPct) {
        lastPct = pct;
        counter.textContent = pct + "%";
      }
    }
  }

  function endLoader() {
    if (finished) return;
    finished = true;

    var body = document.body;
    body.classList.add("is-loaded");
    window.__shikisaiLoaderEnded = true;
    window.dispatchEvent(new CustomEvent("shikisai:loader-end"));

    setTimeout(function () {
      loader.classList.add("is-hidden");
      setTimeout(function () {
        body.classList.remove("is-loading");
        window.__shikisaiScreenVisible = true;
        window.dispatchEvent(new CustomEvent("shikisai:screen-visible"));
      }, EXIT_TOTAL_MS);
    }, 80);
  }

  function animate(ts) {
    if (finished) return;
    if (!startTs) startTs = ts;

    var elapsed  = ts - startTs;
    var progress = getProgress(elapsed);

    update(progress);

    if (elapsed < TOTAL_MS) {
      requestAnimationFrame(animate);
    } else {
      update(1);
      endLoader();
    }
  }

  requestAnimationFrame(animate);

})();
