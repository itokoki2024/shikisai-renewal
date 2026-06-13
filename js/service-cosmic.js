(function () {
  'use strict';

  function genShadows(count) {
    var parts = [];
    for (var i = 0; i < count; i++) {
      var x = Math.floor(Math.random() * 2000);
      var y = Math.floor(Math.random() * 2000);
      parts.push(x + 'px ' + y + 'px #FFF');
    }
    return parts.join(', ');
  }

  function init() {
    var starsEl   = document.querySelector('.svc-cosmic-bg .cosmic-stars');
    var starsMdEl = document.querySelector('.svc-cosmic-bg .cosmic-stars-medium');
    var starsLgEl = document.querySelector('.svc-cosmic-bg .cosmic-stars-large');
    if (!starsEl) return;

    var sm = genShadows(700);
    var md = genShadows(200);
    var lg = genShadows(100);

    // 要素自体の box-shadow（星の位置）
    starsEl.style.boxShadow   = sm;
    starsMdEl.style.boxShadow = md;
    starsLgEl.style.boxShadow = lg;

    // ::after 擬似要素用（シームレスループ）
    var root = document.documentElement;
    root.style.setProperty('--stars-sm', sm);
    root.style.setProperty('--stars-md', md);
    root.style.setProperty('--stars-lg', lg);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
