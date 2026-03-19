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
        p.classList.remove('active');
        p.style.display = 'none';
      });
      // Show matching panel
      const panel = document.getElementById(`tab-${filter}`);
      if (panel) {
        panel.classList.add('active');
        panel.style.display = 'block';
        // Re-trigger reveals in panel
        panel.querySelectorAll('.gallery-item').forEach((item, i) => {
          item.classList.remove('visible');
          setTimeout(() => item.classList.add('visible'), i * 50);
        });
        panel.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      }
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

        });
  });
}

// ── Lightbox ──────────────────────────────────────────────────────────────
let lbItems = [];
let lbCurrent = 0;

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
  const month = item.dataset.month || '';
  const medium = item.dataset.medium || '';
  const dimensions = item.dataset.dimensions || '';
  const series = item.dataset.series || '';
  const edition = item.dataset.edition || '';
  const dateDisplay = month ? `${month} ${year}` : year;

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
    if (dateDisplay) rows.push(`<li>${dateDisplay}</li>`);
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
      var panel = item.querySelector('.detail-panel');
      if (!panel) return;
      var wrap = item.querySelector('.gallery-img-wrap');
      if (!wrap || wrap._detailBound) return;
      wrap._detailBound = true;
      // Add badge
      var badge = document.createElement('span');
      badge.className = 'detail-badge';
      badge.textContent = 'Details ↓';
      badge.style.cssText = 'position:absolute;bottom:8px;right:10px;font-family:var(--sans);font-size:0.58rem;letter-spacing:0.1em;text-transform:uppercase;color:rgba(245,244,240,0.7);background:rgba(0,0,0,0.6);padding:3px 7px;border-radius:2px;pointer-events:none;';
      wrap.style.position = 'relative';
      wrap.style.cursor = 'pointer';
      wrap.appendChild(badge);
      wrap.addEventListener('click', function(e) {
        e.stopPropagation();
        var isOpen = panel.style.display === 'block';
        // Close all
        document.querySelectorAll('.gallery-item[data-details] .detail-panel').forEach(function(p) {
          p.style.display = 'none';
        });
        document.querySelectorAll('.detail-badge').forEach(function(b) {
          b.textContent = 'Details ↓';
        });
        if (!isOpen) {
          panel.style.display = 'block';
          badge.textContent = 'Details ↑';
          setTimeout(function() { item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 50);
        }
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetailPanels);
  } else {
    initDetailPanels();
  }
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('filter-btn')) { setTimeout(initDetailPanels, 200); }
  });
})();

/* ─── DROPDOWN NAVIGATION ─────────────────────────────────── */
(function() {
  function initDropdowns() {
    var items = document.querySelectorAll('.nav-item-has-dropdown');
    items.forEach(function(item) {
      // Toggle on click (works on both mobile & desktop)
      var trigger = item.querySelector('.nav-link-dropdown');
      if (trigger) {
        trigger.addEventListener('click', function(e) {
          e.preventDefault();
          var isOpen = item.classList.contains('open');
          // Close all
          items.forEach(function(i) { i.classList.remove('open'); });
          if (!isOpen) item.classList.add('open');
        });
      }
    });
    // Close when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.nav-item-has-dropdown')) {
        items.forEach(function(i) { i.classList.remove('open'); });
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdowns);
  } else {
    initDropdowns();
  }
})();

/* ─── LIGHTBOX ───────────────────────────────────────────── */
(function() {
  var overlay, imgEl, titleEl, metaEl, currentItems, currentIdx;

  function buildLightbox() {
    if (document.getElementById('lightbox-overlay')) return;
    overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML =
      '<button class="lightbox-close" aria-label="Fermer">&times;</button>' +
      '<button class="lightbox-prev" aria-label="Précédent">&#8592;</button>' +
      '<div class="lightbox-inner">' +
        '<img class="lightbox-img" src="" alt="">' +
        '<div class="lightbox-caption">' +
          '<div class="lb-title"></div>' +
          '<div class="lb-meta"></div>' +
        '</div>' +
      '</div>' +
      '<button class="lightbox-next" aria-label="Suivant">&#8594;</button>';
    document.body.appendChild(overlay);
    imgEl = overlay.querySelector('.lightbox-img');
    titleEl = overlay.querySelector('.lb-title');
    metaEl = overlay.querySelector('.lb-meta');
    overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    overlay.querySelector('.lightbox-prev').addEventListener('click', function() { navigate(-1); });
    overlay.querySelector('.lightbox-next').addEventListener('click', function() { navigate(1); });
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeLightbox(); });
    document.addEventListener('keydown', function(e) {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  }

  function openLightbox(items, idx) {
    buildLightbox();
    currentItems = items;
    currentIdx = idx;
    showItem();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    currentIdx = (currentIdx + dir + currentItems.length) % currentItems.length;
    showItem();
  }

  function showItem() {
    var item = currentItems[currentIdx];
    var imgWrap = item.querySelector('.gallery-img-wrap img') || item.querySelector('img');
    if (imgWrap) {
      imgEl.src = imgWrap.src;
      imgEl.alt = imgWrap.alt || '';
    }
    var title = item.getAttribute('data-title') || item.querySelector('.gallery-caption-title, .gallery-caption')?.textContent?.trim() || '';
    var year = item.getAttribute('data-year') || item.querySelector('.gallery-caption-year')?.textContent?.trim() || '';
    var month = item.getAttribute('data-month') || '';
    var technique = item.getAttribute('data-technique') || '';
    var dimensions = item.getAttribute('data-dimensions') || '';
    titleEl.textContent = title;
    var dateDisplay = month ? (month + ' ' + year) : year;
    var metaParts = [dateDisplay, technique, dimensions].filter(Boolean);
    metaEl.textContent = metaParts.join(' · ');
  }

  function initLightbox() {
    var grids = document.querySelectorAll('.paintings-grid');
    grids.forEach(function(grid) {
      var items = Array.from(grid.querySelectorAll('.gallery-item:not(.detail-panel-row)'));
      items.forEach(function(item, idx) {
        var wrap = item.querySelector('.gallery-img-wrap');
        if (!wrap) return;
        wrap.style.cursor = 'zoom-in';
        wrap.addEventListener('click', function(e) {
          // Don't trigger if detail badge was clicked
          if (e.target.closest('.detail-badge')) return;
          // Get currently visible items (filtered)
          var visibleItems = items.filter(function(i) { return i.style.display !== 'none'; });
          var visibleIdx = visibleItems.indexOf(item);
          openLightbox(visibleItems, visibleIdx >= 0 ? visibleIdx : 0);
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
  } else {
    initLightbox();
  }
  // Re-init after filter changes
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('filter-btn')) { setTimeout(initLightbox, 300); }
  });
})();

/* ─── GALLERY CAPTION DIMENSIONS ─────────────────────────── */
(function() {
  function injectDims() {
    document.querySelectorAll('.gallery-item').forEach(function(item) {
      var dims = item.getAttribute('data-dimensions') || item.getAttribute('data-dims') || '';
      if (!dims) return;
      var caption = item.querySelector('.gallery-caption');
      if (!caption) return;
      // Remove existing dims span if re-rendering
      var existing = caption.querySelector('.gallery-caption-dims');
      if (existing) existing.remove();
      var span = document.createElement('span');
      span.className = 'gallery-caption-dims';
      span.textContent = dims;
      caption.appendChild(span);
    });
  }
  document.addEventListener('DOMContentLoaded', injectDims);
  // Re-run after tab switches (DOMContentLoaded fires once; tabs may hide/show items)
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.tab-btn, .filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { setTimeout(injectDims, 50); });
    });
  });
})();
