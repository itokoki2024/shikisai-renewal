/**
 * loader-vaporize.js
 * SHiKiSAi サイトローダー — Vaporize Text Effect (vanilla JS)
 *
 * 21st.dev / vapour-text-effect を React なしで移植。
 * "SHiKiSAi" のテキストを Canvas 上でパーティクル化し、
 * 左から右へヴェポライズ（霧散）させる。
 *
 * アニメーション完了後:
 *   1. body に is-loaded を付与（page-shell フェードイン）
 *   2. window に "shikisai:loader-end" を dispatch
 *   3. 少し待ってから loader に is-hidden を付与
 */
(function () {
  "use strict";

  /* ══════════════════════════════════════════════
     設定
  ══════════════════════════════════════════════ */
  var CFG = {
    text:             "SHiKiSAi",
    fontFamily:       '"Zen Kaku Gothic New", Inter, sans-serif',
    fontWeight:       700,
    color:            "rgb(255, 255, 255)",
    spread:           5,        // 霧散の広がり係数
    density:          5,        // パーティクル密度 (0–10)
    direction:        "left-to-right",
    fadeInMs:         400,      // テキストフェードイン時間
    waitMs:           150,      // フェードイン完了後の待機時間
    vaporizeMs:       1000,     // ヴェポライズ時間
    exitFadeMs:       350,      // ローダーフェードアウト時間
  };

  /* ══════════════════════════════════════════════
     DOM
  ══════════════════════════════════════════════ */
  var canvas = document.getElementById("loader-canvas");
  var loader = document.getElementById("siteLoader");
  if (!canvas || !loader) return;

  var ctx = canvas.getContext("2d");
  var dpr = Math.min((window.devicePixelRatio || 1) * 1.5, 3);

  /* ══════════════════════════════════════════════
     状態
  ══════════════════════════════════════════════ */
  var particles      = [];
  var textBounds     = null;   // { left, right, width }
  var state          = "fadingIn"; // fadingIn | waiting | vaporizing | done
  var vaporizeProgress = 0;   // 0–100
  var fadeOpacity    = 0;     // 0–1
  var lastTs         = null;
  var rafId          = null;
  var finished       = false;
  var vaporizeSpread = 0;     // 初期化後に設定
  var densityMapped  = 0;     // 〃

  /* ══════════════════════════════════════════════
     フォントサイズ（レスポンシブ）
  ══════════════════════════════════════════════ */
  function getFontSize() {
    var w = window.innerWidth;
    if (w <= 380) return 34;
    if (w <= 560) return 42;
    if (w <= 960) return 52;
    return 64;
  }

  /* ══════════════════════════════════════════════
     スプレッド計算
     (元コンポーネント calculateVaporizeSpread を移植)
  ══════════════════════════════════════════════ */
  function calcSpread(fontSize) {
    var pts = [
      { s: 20, v: 0.2 },
      { s: 50, v: 0.5 },
      { s: 100, v: 1.5 },
    ];
    if (fontSize <= pts[0].s) return pts[0].v;
    if (fontSize >= pts[pts.length - 1].s) return pts[pts.length - 1].v;
    var i = 0;
    while (i < pts.length - 1 && pts[i + 1].s < fontSize) i++;
    var a = pts[i], b = pts[i + 1];
    return a.v + (fontSize - a.s) * (b.v - a.v) / (b.s - a.s);
  }

  /* ══════════════════════════════════════════════
     値変換ユーティリティ (transformValue 移植)
  ══════════════════════════════════════════════ */
  function mapValue(input, inMin, inMax, outMin, outMax, clamp) {
    var t = (input - inMin) / (inMax - inMin);
    var result = outMin + t * (outMax - outMin);
    if (clamp) {
      var lo = Math.min(outMin, outMax);
      var hi = Math.max(outMin, outMax);
      result = Math.min(Math.max(result, lo), hi);
    }
    return result;
  }

  /* ══════════════════════════════════════════════
     キャンバス初期化・リサイズ
  ══════════════════════════════════════════════ */
  function setupCanvas() {
    var w = loader.clientWidth  || window.innerWidth;
    var h = loader.clientHeight || window.innerHeight;
    canvas.style.width  = w + "px";
    canvas.style.height = h + "px";
    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
  }

  /* ══════════════════════════════════════════════
     パーティクル生成 (createParticles 移植)
  ══════════════════════════════════════════════ */
  function createParticles() {
    var w  = canvas.width;
    var h  = canvas.height;
    var fs = getFontSize();
    var font = CFG.fontWeight + " " + (fs * dpr) + "px " + CFG.fontFamily;

    ctx.clearRect(0, 0, w, h);
    ctx.font         = font;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle    = CFG.color;
    if ("fontKerning"    in ctx) ctx.fontKerning    = "normal";
    if ("textRendering"  in ctx) ctx.textRendering  = "geometricPrecision";
    if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";

    var textX = w / 2;
    var textY = h / 2;

    var metrics   = ctx.measureText(CFG.text);
    var textWidth = metrics.width;
    var textLeft  = textX - textWidth / 2;
    textBounds = { left: textLeft, right: textLeft + textWidth, width: textWidth };

    ctx.fillText(CFG.text, textX, textY);

    var imgData    = ctx.getImageData(0, 0, w, h);
    var data       = imgData.data;
    var currentDPR = canvas.width / parseFloat(canvas.style.width || "1");
    var sampleRate = Math.max(1, Math.round(currentDPR / 3));

    var newParticles = [];
    for (var y = 0; y < h; y += sampleRate) {
      for (var x = 0; x < w; x += sampleRate) {
        var idx = (y * w + x) * 4;
        if (data[idx + 3] > 0) {
          var origAlpha = (data[idx + 3] / 255) * (sampleRate / currentDPR);
          newParticles.push({
            x:             x,
            y:             y,
            originalX:     x,
            originalY:     y,
            color:         "rgba(" + data[idx] + "," + data[idx+1] + "," + data[idx+2] + "," + origAlpha + ")",
            opacity:       origAlpha,
            originalAlpha: origAlpha,
            velocityX:     0,
            velocityY:     0,
            angle:         0,
            speed:         0,
            fadeQuickly:   false,
          });
        }
      }
    }
    ctx.clearRect(0, 0, w, h);
    particles = newParticles;

    /* スプレッド / 密度を更新 */
    vaporizeSpread = calcSpread(fs) * CFG.spread;
    densityMapped  = mapValue(CFG.density, 0, 10, 0.3, 1, true);
  }

  /* ══════════════════════════════════════════════
     パーティクル更新 (updateParticles 移植)
  ══════════════════════════════════════════════ */
  function updateParticles(vaporizeX, dt) {
    var allDone = true;
    var SPREAD  = vaporizeSpread;

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      var shouldVaporize = (CFG.direction === "left-to-right")
        ? p.originalX <= vaporizeX
        : p.originalX >= vaporizeX;

      if (shouldVaporize) {
        if (p.speed === 0) {
          p.angle       = Math.random() * Math.PI * 2;
          p.speed       = (Math.random() * 1 + 0.5) * SPREAD;
          p.velocityX   = Math.cos(p.angle) * p.speed;
          p.velocityY   = Math.sin(p.angle) * p.speed;
          p.fadeQuickly = Math.random() > densityMapped;
        }

        if (p.fadeQuickly) {
          p.opacity = Math.max(0, p.opacity - dt);
        } else {
          var dx    = p.originalX - p.x;
          var dy    = p.originalY - p.y;
          var dist  = Math.sqrt(dx * dx + dy * dy);
          var damp  = Math.max(0.95, 1 - dist / (100 * SPREAD));
          var rs    = SPREAD * 3;

          p.velocityX = (p.velocityX + (Math.random() - 0.5) * rs + dx * 0.002) * damp;
          p.velocityY = (p.velocityY + (Math.random() - 0.5) * rs + dy * 0.002) * damp;

          var maxV = SPREAD * 2;
          var curV = Math.sqrt(p.velocityX * p.velocityX + p.velocityY * p.velocityY);
          if (curV > maxV) {
            p.velocityX *= maxV / curV;
            p.velocityY *= maxV / curV;
          }

          p.x += p.velocityX * dt * 20;
          p.y += p.velocityY * dt * 10;

          var fadeRate = 0.25 * (2000 / CFG.vaporizeMs);
          p.opacity = Math.max(0, p.opacity - dt * fadeRate);
        }

        if (p.opacity > 0.01) allDone = false;
      } else {
        allDone = false;
      }
    }
    return allDone;
  }

  /* ══════════════════════════════════════════════
     パーティクル描画 (renderParticles 移植)
  ══════════════════════════════════════════════ */
  function renderParticles() {
    ctx.save();
    ctx.scale(dpr, dpr);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (p.opacity > 0) {
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, p.opacity + ")");
        ctx.fillRect(p.x / dpr, p.y / dpr, 1, 1);
      }
    }
    ctx.restore();
  }

  /* ══════════════════════════════════════════════
     パーティクルリセット
  ══════════════════════════════════════════════ */
  function resetParticles() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x = p.originalX; p.y = p.originalY;
      p.opacity   = p.originalAlpha;
      p.speed     = 0;
      p.velocityX = 0;
      p.velocityY = 0;
    }
  }

  /* ══════════════════════════════════════════════
     ローダー終了シーケンス
  ══════════════════════════════════════════════ */
  function endLoader() {
    if (finished) return;
    finished = true;

    var body = document.body;

    /* ① page-shell を表示開始 */
    body.classList.add("is-loaded");

    /* ② loader-end イベントを dispatch (animations.js がヒーロー入場を開始) */
    window.__shikisaiLoaderEnded = true;
    window.dispatchEvent(new CustomEvent("shikisai:loader-end"));

    /* ③ ローダーをフェードアウト */
    setTimeout(function () {
      loader.classList.add("is-hidden");
      /* ④ overflow: hidden 解除 + ヒーロー表示完了イベント */
      setTimeout(function () {
        body.classList.remove("is-loading");
        if (rafId) cancelAnimationFrame(rafId);
        /* ローダーが完全に消えた = ヒーローが画面に映った瞬間 */
        window.__shikisaiScreenVisible = true;
        window.dispatchEvent(new CustomEvent("shikisai:screen-visible"));
      }, CFG.exitFadeMs + 50);
    }, CFG.exitFadeMs);
  }

  /* ══════════════════════════════════════════════
     メインアニメーションループ
  ══════════════════════════════════════════════ */
  function animate(ts) {
    if (finished && state === "done") return;

    if (!lastTs) lastTs = ts;
    var dt = Math.min((ts - lastTs) / 1000, 0.05); // 最大 50ms ステップ
    lastTs = ts;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (state) {

      /* ── フェードイン ── */
      case "fadingIn":
        fadeOpacity += dt * 1000 / CFG.fadeInMs;

        ctx.save();
        ctx.scale(dpr, dpr);
        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          var op = Math.min(fadeOpacity, 1) * p.originalAlpha;
          if (op > 0) {
            ctx.fillStyle = p.color.replace(/[\d.]+\)$/, op + ")");
            ctx.fillRect(p.x / dpr, p.y / dpr, 1, 1);
          }
        }
        ctx.restore();

        if (fadeOpacity >= 1) {
          state = "waiting";
          setTimeout(function () {
            state = "vaporizing";
            vaporizeProgress = 0;
          }, CFG.waitMs);
        }
        break;

      /* ── ウェイト ── */
      case "waiting":
        renderParticles();
        break;

      /* ── ヴェポライズ ── */
      case "vaporizing":
        vaporizeProgress += dt * 100 / (CFG.vaporizeMs / 1000);
        var progress = Math.min(100, vaporizeProgress);

        if (textBounds) {
          var vx = (CFG.direction === "left-to-right")
            ? textBounds.left  + textBounds.width * progress / 100
            : textBounds.right - textBounds.width * progress / 100;

          var allDone = updateParticles(vx, dt);
          renderParticles();

          if (vaporizeProgress >= 100 && allDone) {
            state = "done";
            endLoader();
          }
        }
        break;

      /* ── 完了 ── */
      case "done":
        /* 描画なし — ローダーはフェードアウト中 */
        break;
    }

    rafId = requestAnimationFrame(animate);
  }

  /* ══════════════════════════════════════════════
     初期化
  ══════════════════════════════════════════════ */
  function init() {
    setupCanvas();
    createParticles();
    rafId = requestAnimationFrame(animate);
  }

  /* フォントロード待ち */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    setTimeout(init, 500);
  }

  /* リサイズ対応 */
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      setupCanvas();
      createParticles();
      resetParticles();
    }, 150);
  });

})();
