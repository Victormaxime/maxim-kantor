// ── Image fade-in on load ─────────────────────────────────────────────────
function initImages() {
  document.querySelectorAll('img').forEach(img => {
    if (img.complete && img.naturalWidth) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
      img.addEventListener('error', () => img.classList.add('loaded'));
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

// ── Tab system (paintings.html, graphic-works.html) ───────────────────────
function initTabs() {
  const btns = document.querySelectorAll('.filter-btn[data-filter]');
  if (!btns.length) return;

  // Check if we're on a tabs page (has tab-panel divs)
  const hasTabs = document.querySelector('.tab-panel') !== null;
  if (!hasTabs) {
    initGalleryFilters();
    return;
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Skip empty tabs
      if (btn.classList.contains('empty')) return;

      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      // Hide all panels
      document.querySelectorAll('.tab-panel').forEach(p => {
        p.style.display = 'none';
      });
      // Show matching panel
      const panel = document.getElementById(`tab-${filter}`);
      if (panel) {
        panel.style.display = '';
        // Re-trigger reveals in panel
        panel.querySelectorAll('.gallery-item').forEach((item, i) => {
          item.classList.remove('visible');
          setTimeout(() => item.classList.add('visible'), i * 50);
        });
        panel.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      }
      // Re-init lightbox for visible items
      initLightboxItems();
    });
  });

  // Handle URL hash for direct linking (e.g. #artist-books)
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const btn = document.querySelector(`.filter-btn[data-filter="${hash}"]`);
    if (btn && !btn.classList.contains('empty')) { btn.click(); return; }
  }

  // Auto-show the active tab (or first non-empty tab) on page load
  const activeBtn = document.querySelector('.filter-btn.active:not(.empty)') ||
                    document.querySelector('.filter-btn:not(.empty)');
  if (activeBtn) activeBtn.click();
}

// ── Gallery filters (works.html legacy) ───────────────────────────────────
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

      document.querySelectorAll('[data-books-divider]').forEach(div => {
        div.style.display = (filter === 'books') ? '' : 'none';
      });

      initLightboxItems();
    });
  });
}

// ── Lightbox ──────────────────────────────────────────────────────────────
let lbItems = [];
let lbCurrent = 0;

function initLightboxItems() {
  // Collect gallery items from currently visible tab panel (or all)
  const activePanel = document.querySelector('.tab-panel:not([style*="display: none"])') ||
                      document.querySelector('.tab-panel') ||
                      document;
  lbItems = Array.from((activePanel || document).querySelectorAll('.gallery-item'))
    .filter(el => el.style.display !== 'none');

  lbItems.forEach((item, i) => {
    item.style.cursor = 'pointer';
    item.onclick = () => openLightbox(i);
  });
}

function openLightbox(idx) {
  lbCurrent = idx;
  const overlay = document.getElementById('lightbox');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderLightbox();
}

function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('open');
  document.body.style.overflow = '';
}

function lbNav(dir) {
  lbCurrent = (lbCurrent + dir + lbItems.length) % lbItems.length;
  renderLightbox();
}

function renderLightbox() {
  const item = lbItems[lbCurrent];
  if (!item) return;

  const img = item.querySelector('img');
  const title = item.dataset.title || '';
  const year = item.dataset.year || '';
  const medium = item.dataset.medium || '';
  const dimensions = item.dataset.dimensions || '';
  const series = item.dataset.series || '';
  const edition = item.dataset.edition || '';

  // Image
  const lbImg = document.getElementById('lb-img');
  if (lbImg && img) {
    lbImg.classList.remove('loaded');
    lbImg.src = img.src;
    lbImg.alt = title;
    lbImg.onload = () => lbImg.classList.add('loaded');
  }

  // Title
  const lbTitle = document.getElementById('lb-title');
  if (lbTitle) lbTitle.textContent = title;

  // Meta
  const lbMeta = document.getElementById('lb-meta');
  if (lbMeta) {
    const rows = [];
    if (year) rows.push(`<li>${year}</li>`);
    if (medium) rows.push(`<li>${medium}</li>`);
    if (dimensions) rows.push(`<li>${dimensions}</li>`);
    if (series) rows.push(`<li>${series}</li>`);
    if (edition) rows.push(`<li>${edition}</li>`);
    lbMeta.innerHTML = rows.join('');
  }

  // Counter
  const lbCounter = document.getElementById('lb-counter');
  if (lbCounter) lbCounter.textContent = `${lbCurrent + 1} / ${lbItems.length}`;
}

// Keyboard nav
document.addEventListener('keydown', e => {
  const overlay = document.getElementById('lightbox');
  if (!overlay?.classList.contains('open')) return;
  if (e.key === 'ArrowLeft') lbNav(-1);
  if (e.key === 'ArrowRight') lbNav(1);
  if (e.key === 'Escape') closeLightbox();
});

// ── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initImages();
  initGalleryReveal();
  initScrollReveal();
  initTabs();
  initLightboxItems();
});

// ── Magi Details Lightbox ─────────────────────────────────────────────────
function initMagiDetails() {
  const thumbs = document.querySelectorAll('.magi-detail-thumb');
  if (!thumbs.length) return;

  const items = Array.from(thumbs);
  items.forEach((thumb, i) => {
    thumb.onclick = () => {
      const src = thumb.dataset.src;
      const title = thumb.dataset.title || '';
      openSimpleLightbox(src, title);
    };
  });
}

function openSimpleLightbox(src, title) {
  const overlay = document.getElementById('lightbox');
  if (!overlay) return;
  // Temporarily override lightbox to show single image
  const lbImg = document.getElementById('lb-img');
  const lbMeta = document.getElementById('lb-meta');
  const lbCounter = document.getElementById('lb-counter');
  if (lbImg) lbImg.src = src;
  if (lbMeta) lbMeta.innerHTML = `<li>${title}</li>`;
  if (lbCounter) lbCounter.textContent = '';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Hide nav arrows for single image
  const prevBtn = overlay.querySelector('[onclick*="lbNav(-1)"], .lb-prev');
  const nextBtn = overlay.querySelector('[onclick*="lbNav(1)"], .lb-next');
  if (prevBtn) prevBtn.style.visibility = 'hidden';
  if (nextBtn) nextBtn.style.visibility = 'hidden';
  overlay.addEventListener('click', function restoreNav(e) {
    if (e.target === overlay) {
      if (prevBtn) prevBtn.style.visibility = '';
      if (nextBtn) nextBtn.style.visibility = '';
      overlay.removeEventListener('click', restoreNav);
    }
  }, { once: true });
}

// ── Atelier Lightbox ──────────────────────────────────────────────────────
function initAtelierItems() {
  const items = document.querySelectorAll('.atelier-item');
  items.forEach(item => {
    item.onclick = () => {
      const img = item.querySelector('img');
      if (img) openSimpleLightbox(img.src, item.dataset.title || '');
    };
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMagiDetails();
  initAtelierItems();
});

// ─── PAINTING DETAIL PANEL ──────────────────────────────────
(function() {
  function initDetailPanels() {
    document.querySelectorAll('.gallery-item[data-details]').forEach(function(item) {
      item.classList.add('gallery-item--has-details');
      // Insert detail panel after the item if not already present
      if (!item.querySelector('.detail-panel')) {
        const detailsAttr = item.getAttribute('data-details');
        const images = detailsAttr.split(',').filter(Boolean);
        const panel = document.createElement('div');
        panel.className = 'detail-panel';
        const grid = document.createElement('div');
        grid.className = 'detail-panel-grid';
        images.forEach(function(img) {
          const imgEl = document.createElement('img');
          imgEl.src = 'images/' + img.trim();
          imgEl.alt = item.getAttribute('data-title') + ' — detail';
          imgEl.loading = 'eager';
          imgEl.style.width = '100%';
          imgEl.style.display = 'block';
          grid.appendChild(imgEl);
        });
        panel.appendChild(grid);
        item.appendChild(panel);
      }
      // Click handler on image wrap
      const wrap = item.querySelector('.gallery-img-wrap');
      if (wrap && !wrap._detailBound) {
        wrap._detailBound = true;
        wrap.addEventListener('click', function(e) {
          e.stopPropagation();
          const isOpen = item.classList.contains('open');
          // Close all others
          document.querySelectorAll('.gallery-item--has-details.open').forEach(function(el) {
            if (el !== item) el.classList.remove('open');
          });
          item.classList.toggle('open', !isOpen);
          if (!isOpen) {
            setTimeout(function() {
              item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 50);
          }
        });
      }
    });
  }
  // Run on DOM ready and after tab switches
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetailPanels);
  } else {
    initDetailPanels();
  }
  // Re-init when tab changes (filter buttons)
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('filter-btn')) {
      setTimeout(initDetailPanels, 100);
    }
  });
})();
