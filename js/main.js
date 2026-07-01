


// =========================
// Service section — multi-layer parallax
// dots-bg: 0.35（最も遅い・奥）/ flower-bg: 0.6（中間）/ content: 1.0（通常）
// =========================
(() => {
  const section = document.querySelector('.svc-section');
  if (!section) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const layers = [
    { el: section.querySelector('.gradient-dots-bg'), factor: 0.35 },
    { el: section.querySelector('.svc-flower-bg'),    factor: 0.60 },
  ].filter(l => l.el);

  let ticking = false;

  const update = () => {
    const top = section.getBoundingClientRect().top;
    layers.forEach(({ el, factor }) => {
      el.style.transform = `translateY(${-top * (1 - factor)}px)`;
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  window.addEventListener('resize', update);
  update();
})();

// =========================
// Service card grid — scroll reveal
// =========================
(function () {
  var grid = document.querySelector(".svc-grid");
  if (!grid) return;

  var obs = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      entries[0].target.classList.add("is-visible");
      obs.disconnect();
    }
  }, { threshold: 0.1 });

  obs.observe(grid);
})();

// =========================
// Scroll progress bar
// =========================
(() => {
  const bar = document.createElement("div");
  bar.style.cssText = [
    "position:fixed", "top:0", "left:0", "height:2px", "z-index:200",
    "pointer-events:none", "transform-origin:left center",
    "transform:scaleX(0)", "will-change:transform",
    "background:linear-gradient(to right,#008cff,#33a3ff)",
    "width:100%",
  ].join(";");
  document.body.appendChild(bar);

  window.addEventListener("scroll", () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${Math.min(window.scrollY / total, 1)})`;
  }, { passive: true });
})();

// =========================
// Magnetic CTA buttons (hero)
// =========================
(() => {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  document.querySelectorAll(".hero-actions .btn").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.22;
      const y = (e.clientY - r.top  - r.height / 2) * 0.32;
      btn.style.transition = "transform 0.12s ease";
      btn.style.transform  = `translate(${x}px, ${y - 2}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transition = "transform 0.5s cubic-bezier(0.22,1,0.36,1)";
      btn.style.transform  = "";
    });
  });
})();

// =========================
// Header scroll
// =========================
const siteHeader = document.getElementById("siteHeader");

function handleHeaderScroll() {
  if (!siteHeader) return;

  if (window.scrollY > 20) {
    siteHeader.classList.add("is-scrolled");
  } else {
    siteHeader.classList.remove("is-scrolled");
  }
}

window.addEventListener("scroll", handleHeaderScroll);
window.addEventListener("load", handleHeaderScroll);

// =========================
// Mobile menu
// =========================
const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");
const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
const mobileMenuClose = document.getElementById("mobileMenuClose");
const mobileMenuLinks = document.querySelectorAll(".mobile-menu a");

function openMenu() {
  mobileMenu.classList.add("is-open");
  mobileMenuOverlay && mobileMenuOverlay.classList.add("is-open");
  menuButton.classList.add("is-active");
  menuButton.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
}

function closeMenu() {
  mobileMenu.classList.remove("is-open");
  mobileMenuOverlay && mobileMenuOverlay.classList.remove("is-open");
  menuButton.classList.remove("is-active");
  menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    mobileMenu.classList.contains("is-open") ? closeMenu() : openMenu();
  });

  mobileMenuClose && mobileMenuClose.addEventListener("click", closeMenu);
  mobileMenuOverlay && mobileMenuOverlay.addEventListener("click", closeMenu);

  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) closeMenu();
  });
}

// =========================
// Scroll Top Button
// =========================
const scrollTopBtn = document.getElementById('scrollTopBtn');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// =========================
// Reveal animation
// =========================
const specificRevealItems = new Set(
  document.querySelectorAll("#works .js-reveal, #company .js-reveal"),
);
const revealItems = [...document.querySelectorAll(".js-reveal")].filter(
  (el) => !specificRevealItems.has(el),
);

if (revealItems.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
    },
  );

  revealItems.forEach((item) => {
    revealObserver.observe(item);
  });
}

// =========================
// Count up
// =========================
const countItems = document.querySelectorAll(".js-count");

function animateCount(el) {
  const target = Number(el.dataset.count || 0);
  const decimals = (el.dataset.count || "0").includes(".") ? 1 : 0;
  const step = decimals ? 0.1 : 1;
  const duration = 1400;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const raw = target * eased;
    const current = decimals
      ? Math.floor(raw / step) * step
      : Math.floor(raw);

    el.textContent = decimals
      ? current.toFixed(1)
      : current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = decimals ? target.toFixed(1) : target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}

if (countItems.length > 0) {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.6,
    },
  );

  countItems.forEach((item) => {
    countObserver.observe(item);
  });
}

// =========================
// Smooth offset for anchor links
// =========================
const anchorLinks = document.querySelectorAll('a[href^="#"]');

anchorLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const headerHeight = siteHeader ? siteHeader.offsetHeight : 0;
    const targetY =
      target.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  });
});


window.addEventListener("load", () => {
  const body = document.body;
  const loader = document.getElementById("siteLoader");

  if (!loader) {
    body.classList.remove("is-loading");
    body.classList.add("is-loaded");
    return;
  }

  // loader-vaporize.js がライフサイクルを管理する。
  // 万が一 6 秒以内に完了しない場合のフォールバック。
  setTimeout(() => {
    if (!body.classList.contains("is-loaded")) body.classList.add("is-loaded");
    if (!loader.classList.contains("is-hidden")) loader.classList.add("is-hidden");
    setTimeout(() => body.classList.remove("is-loading"), 650);
  }, 6000);
});


document.addEventListener("DOMContentLoaded", () => {
  const revealItems = document.querySelectorAll(
    "#works .js-reveal, #company .js-reveal",
  );

  if (!revealItems.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealItems.forEach((item) => observer.observe(item));
});

// =========================
// Highlight marker — about section
// =========================
const markerSentinel = document.querySelector(".js-about-marker-sentinel");
if (markerSentinel) {
  const markerObserver = new IntersectionObserver(
    (entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      document.querySelectorAll(".highlight-marker").forEach((el) => {
        el.classList.add("is-active");
      });
    },
    { threshold: 0 },
  );
  markerObserver.observe(markerSentinel);
}

