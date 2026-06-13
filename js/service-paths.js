(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var PATH_COUNT = 36;
  var STROKE_COLOR = '#008cff';

  function buildSVG(position) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 696 316');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('fill', 'none');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';

    for (var i = 0; i < PATH_COUNT; i++) {
      var p = position;
      var d =
        'M' + (-380 - i * 5 * p) + ' ' + (-189 + i * 6) +
        'C' + (-380 - i * 5 * p) + ' ' + (-189 + i * 6) + ' ' +
              (-312 - i * 5 * p) + ' ' + (216 - i * 6) + ' ' +
              (152 - i * 5 * p)  + ' ' + (343 - i * 6) +
        'C' + (616 - i * 5 * p) + ' ' + (470 - i * 6) + ' ' +
              (684 - i * 5 * p) + ' ' + (875 - i * 6) + ' ' +
              (684 - i * 5 * p) + ' ' + (875 - i * 6);

      var el = document.createElementNS(NS, 'path');
      el.setAttribute('d', d);
      el.setAttribute('stroke', STROKE_COLOR);
      el.setAttribute('stroke-width', String(0.5 + i * 0.03));
      el.setAttribute('fill', 'none');
      el.dataset.idx = String(i);
      svg.appendChild(el);
    }
    return svg;
  }

  function startAnimations(wrap) {
    var paths = Array.from(wrap.querySelectorAll('path'));
    var hasWAAPI = typeof Element.prototype.animate === 'function';

    var animData = paths.map(function (path) {
      var i = parseInt(path.dataset.idx || '0', 10);
      var baseOp = Math.min(0.06 + i * 0.016, 0.52);
      var dur = 18000 + Math.random() * 12000;
      var del = -Math.random() * dur;
      var len = 800;
      try { len = path.getTotalLength(); } catch (_) {}

      path.setAttribute('stroke-dasharray', (len * 0.3) + ' ' + (len * 0.7));
      path.setAttribute('stroke-opacity', String(baseOp));

      return { path: path, baseOp: baseOp, dur: dur, del: del, len: len };
    });

    if (hasWAAPI) {
      animData.forEach(function (d) {
        // Path flow
        d.path.animate(
          [{ strokeDashoffset: d.len }, { strokeDashoffset: -d.len }],
          { duration: d.dur, delay: d.del, iterations: Infinity, easing: 'linear', fill: 'backwards' }
        );
        // Opacity pulse
        d.path.animate(
          [
            { opacity: d.baseOp * 0.5 },
            { opacity: d.baseOp },
            { opacity: d.baseOp * 0.5 }
          ],
          { duration: d.dur, delay: d.del, iterations: Infinity, easing: 'ease-in-out', fill: 'backwards' }
        );
      });
      return;
    }

    // rAF fallback
    var now = typeof performance !== 'undefined' ? performance.now() : Date.now;
    var starts = animData.map(function (d) { return now() + d.del; });

    function tick(t) {
      animData.forEach(function (d, k) {
        var elapsed = ((t - starts[k]) % d.dur + d.dur) % d.dur;
        var prog = elapsed / d.dur;
        d.path.style.strokeDashoffset = String(d.len * (1 - 2 * prog));
        d.path.style.opacity = String(d.baseOp * (0.5 + 0.5 * Math.abs(Math.sin(prog * Math.PI))));
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function init() {
    var container = document.querySelector('.svc-paths-bg');
    if (!container) return;

    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';
    wrap.appendChild(buildSVG(1));
    wrap.appendChild(buildSVG(-1));
    container.appendChild(wrap);

    // getTotalLength() needs element in DOM → defer one frame
    requestAnimationFrame(function () {
      startAnimations(wrap);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
