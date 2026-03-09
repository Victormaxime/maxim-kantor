// ── Image fade-in on load ─────────────────────────────────────────────────
function initImages() {
  document.querySelectorAll('img').forEach(img => {
    if (img.complete && img.naturalWidth) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
      img.addEventListener('error', () => img.classList.add('loaded')); // avoid stuck opacity
    }
  });
}

// ── Staggered gallery reveal via IntersectionObserver ─────────────────────
function initGalleryReveal() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const idx = parseInt(el.dataset.revealIdx || '0', 10);
        setTimeout(() => el.classList.add('visible'), idx * 60);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.05 });

  items.forEach((item, i) => {
    item.dataset.revealIdx = String(i);
    observer.observe(item);
  });
}

// ── Generic scroll-reveal for .reveal elements ────────────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => observer.observe(el));
}

// ── Mobile nav toggle ─────────────────────────────────────────────────────
function toggleNav() {
  document.getElementById('nav-links')?.classList.toggle('open');
}

// ── Gallery filters ───────────────────────────────────────────────────────
function initGalleryFilters() {
  const btns = document.querySelectorAll('.filter-btn[data-filter]');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const items = document.querySelectorAll('.gallery-item');

      items.forEach((item, i) => {
        const period = item.dataset.period;
        const show = filter === 'all' || period === filter;
        item.style.display = show ? '' : 'none';
        if (show) {
          item.style.opacity = '0';
          setTimeout(() => { item.style.opacity = '1'; }, i * 30);
        }
      });

      // Update lightbox indices after filter
      updateLightboxIndices();
    });
  });
}

function updateLightboxIndices() {
  const visible = Array.from(document.querySelectorAll('.gallery-item'))
    .filter(el => el.style.display !== 'none');
  visible.forEach((el, i) => {
    el.setAttribute('onclick', `openLightbox(${i})`);
  });
}

// ── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initImages();
  initGalleryReveal();
  initScrollReveal();
  initGalleryFilters();
});
