(function () {
  'use strict';

  function genShadows(count, maxX, maxY) {
    var parts = [];
    for (var i = 0; i < count; i++) {
      var x = Math.floor(Math.random() * maxX);
      var y = Math.floor(Math.random() * maxY);
      parts.push(x + 'px ' + y + 'px #FFF');
    }
    return parts.join(', ');
  }

  function init() {
    var starsEl   = document.querySelector('.svc-cosmic-bg .cosmic-stars');
    var starsMdEl = document.querySelector('.svc-cosmic-bg .cosmic-stars-medium');
    var starsLgEl = document.querySelector('.svc-cosmic-bg .cosmic-stars-large');
    if (!starsEl) return;

    // コンテナの実際の幅を使って星を均等に分布させる
    var bg = document.querySelector('.svc-cosmic-bg');
    var maxX = Math.max(bg ? bg.offsetWidth : 0, window.innerWidth || 1400, 2000);
    var maxY = 2000;

    var sm = genShadows(700, maxX, maxY);
    var md = genShadows(200, maxX, maxY);
    var lg = genShadows(100, maxX, maxY);

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
