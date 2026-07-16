/* ══════════════════════════════════════════════════════════════
   نقشه‌راه — auto-discovery + rendering
   Every chapters/<id>/*.html file (except index.html) is picked up
   automatically via the GitHub Contents API — no manual registry.
   ══════════════════════════════════════════════════════════════ */

function toFa(n){
  const map = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(n).replace(/\d/g, d => map[d]);
}

function relativeTimeFa(date){
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 2) return 'همین الان';
  if (mins < 60) return `${toFa(mins)} دقیقه پیش`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${toFa(hours)} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${toFa(days)} روز پیش`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${toFa(months)} ماه پیش`;
  return `${toFa(Math.floor(months / 12))} سال پیش`;
}

/* ── GitHub-backed chapter listing (built on discover.js) ──────── */
async function listChapterFiles(chapterId){
  const entries = await listFolder(`chapters/${chapterId}`);

  const imageByBase = {};
  entries.forEach(e => {
    if (e.type !== 'file' || !isImageName(e.name)) return;
    const base = e.name.replace(/\.[a-zA-Z0-9]+$/, '');
    imageByBase[base] = e.name;
  });

  return entries
    .filter(e => e.type === 'file' && /\.html?$/i.test(e.name) && e.name.toLowerCase() !== 'index.html')
    .map(e => {
      const base = e.name.replace(/\.html?$/i, '');
      return { name: e.name, downloadUrl: e.download_url, image: imageByBase[base] || null };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchFileMeta(fileEntry){
  let title = fileEntry.name.replace(/\.html?$/i, '');
  let subtitle = '';
  let lang = 'en';
  let category = null;

  try {
    const res = await fetch(fileEntry.downloadUrl);
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');

    const titleEl = doc.querySelector('title');
    if (titleEl && titleEl.textContent.trim()) title = titleEl.textContent.trim();

    const subMeta = doc.querySelector('meta[name="tile-subtitle"]');
    if (subMeta) subtitle = subMeta.getAttribute('content') || '';

    const catMeta = doc.querySelector('meta[name="tile-category"]');
    if (catMeta) {
      const val = (catMeta.getAttribute('content') || '').trim();
      if (typeof CATEGORIES !== 'undefined' && CATEGORIES[val]) category = val;
    }

    const htmlLang = doc.documentElement.getAttribute('lang') || '';
    const dir = doc.documentElement.getAttribute('dir') || '';
    lang = (htmlLang.startsWith('fa') || dir === 'rtl') ? 'fa' : 'en';
  } catch (e) {
    /* keep the filename-derived fallback title if the file can't be read */
  }

  return {
    id: fileEntry.name.replace(/\.html?$/i, ''),
    file: fileEntry.name,
    image: fileEntry.image,
    title, subtitle, lang, category
  };
}

async function loadChapterItems(chapterId){
  const files = await listChapterFiles(chapterId);
  return Promise.all(files.map(fetchFileMeta));
}

/* ── Home page: chapter cards ───────────────────────────────── */
async function renderHome(){
  const grid = document.getElementById('chapter-grid');
  if (!grid) return;

  const chapterTiles = CHAPTERS.map(ch => `
    <a class="chapter-card is-loading" href="chapters/${ch.id}/" data-chapter="${ch.id}">
      <span class="chapter-tab">${ch.num}</span>
      <span class="chapter-card-title">${ch.title}</span>
      <span class="chapter-card-blurb">${ch.blurb}</span>
      <span class="chapter-card-count">در حال شمارش…</span>
    </a>`
  ).join('');

  const extraTiles = (typeof EXTRA_TILES !== 'undefined' ? EXTRA_TILES : []).map(tile => `
    <a class="chapter-card is-extra" href="${tile.href}">
      <span class="chapter-tab">${tile.num}</span>
      <span class="chapter-card-title">${tile.title}</span>
      <span class="chapter-card-blurb">${tile.blurb}</span>
      <span class="chapter-card-count">مشاهدهٔ مستقیم</span>
    </a>`
  ).join('');

  grid.innerHTML = chapterTiles + extraTiles;
  renderHomeRoute();

  const [results, lastUpdated] = await Promise.all([
    Promise.allSettled(CHAPTERS.map(ch => listChapterFiles(ch.id))),
    fetchLastUpdated()
  ]);

  let total = 0;
  results.forEach((r, i) => {
    const card = grid.querySelector(`[data-chapter="${CHAPTERS[i].id}"]`);
    const countEl = card.querySelector('.chapter-card-count');
    card.classList.remove('is-loading');

    if (r.status === 'fulfilled') {
      const n = r.value.length;
      total += n;
      countEl.textContent = n === 0 ? 'به‌زودی تکمیل می‌شود' : `${toFa(n)} سند تعاملی`;
      card.classList.toggle('is-empty', n === 0);
    } else {
      countEl.textContent = 'خطا در بارگذاری تعداد';
      card.classList.add('is-empty');
    }
  });

  const countText = `${toFa(total)} سند تعاملی در ${toFa(CHAPTERS.length)} بخش`;
  const updatedText = lastUpdated ? ` — آخرین بروزرسانی ${relativeTimeFa(lastUpdated)}` : '';
  document.getElementById('totalCount').textContent = countText + updatedText;

  renderHomeRoute();
  if (!renderHomeRoute.resizeWired) {
    let t;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(renderHomeRoute, 150);
    });
    renderHomeRoute.resizeWired = true;
  }
}

/* Draws a soft dashed route connecting the chapter/extra cards in
   reading order — behind the cards, so it only shows through the gaps
   between them. Recomputed on load and on resize since the grid
   reflows responsively. */
function renderHomeRoute(){
  const grid = document.getElementById('chapter-grid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.chapter-card'));
  if (cards.length < 2) return;

  let svg = grid.querySelector('#home-route-svg');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'home-route-svg');
    svg.setAttribute('class', 'home-route-svg');
    grid.insertBefore(svg, grid.firstChild);
  }

  const gridRect = grid.getBoundingClientRect();
  svg.setAttribute('width', gridRect.width);
  svg.setAttribute('height', gridRect.height);
  svg.setAttribute('viewBox', `0 0 ${gridRect.width} ${gridRect.height}`);

  const points = cards.map(card => {
    const r = card.getBoundingClientRect();
    return { x: r.left - gridRect.left + r.width / 2, y: r.top - gridRect.top + r.height / 2 };
  });

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1], p1 = points[i];
    const midY = (p0.y + p1.y) / 2;
    d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
  }

  const dots = points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4.5"></circle>`).join('');
  svg.innerHTML = `<path d="${d}"></path>${dots}`;
}

/* ── Cross-chapter quick nav (compact pills in the sub-bar) ────── */
function renderChapterPills(activeId){
  const nav = document.getElementById('chapter-pills');
  if (!nav) return;

  const chapterPills = CHAPTERS.map(ch => {
    const active = ch.id === activeId;
    return active
      ? `<span class="pill is-active" title="${ch.title}">${ch.num}</span>`
      : `<a class="pill" href="../${ch.id}/" title="${ch.title}">${ch.num}</a>`;
  }).join('');

  const extraPills = (typeof EXTRA_TILES !== 'undefined' ? EXTRA_TILES : []).map(tile =>
    `<a class="pill is-extra" href="../../${tile.href}" title="${tile.title}">${tile.num}</a>`
  ).join('');

  nav.innerHTML = chapterPills + extraPills;
}

/* ── Subsystem-color legend (only shows categories present in this chapter) ── */
function renderCategoryLegend(items){
  const el = document.getElementById('category-legend');
  if (!el) return;

  const present = [...new Set(items.map(it => it.category).filter(Boolean))];
  if (!present.length) { el.style.display = 'none'; return; }

  el.style.display = 'flex';
  el.innerHTML = present.map(key => {
    const cat = CATEGORIES[key];
    return `<span class="legend-chip"><span class="legend-dot" style="background:${cat.color}"></span>${cat.label}</span>`;
  }).join('');
}

/* ── Chapter page: 3D document shelf ────────────────────────── */
async function renderChapter(chapterId){
  const mount = document.getElementById('tile-grid');
  if (!mount) return;

  const chapter = CHAPTERS.find(c => c.id === chapterId);
  document.getElementById('chapter-heading').textContent = chapter.title;
  document.getElementById('chapter-blurb').textContent = chapter.blurb;
  renderChapterPills(chapterId);

  const loadingEl = document.getElementById('loading-chapter');
  const emptyEl = document.getElementById('empty-chapter');
  const errorEl = document.getElementById('error-chapter');

  mount.style.display = 'none';
  emptyEl.style.display = 'none';
  errorEl.style.display = 'none';
  loadingEl.style.display = 'flex';

  let items;
  try {
    items = await loadChapterItems(chapterId);
  } catch (err) {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'flex';
    errorEl.querySelector('p').textContent = discoveryErrorMessage(err);
    return;
  }

  loadingEl.style.display = 'none';
  document.getElementById('chapter-count').textContent =
    items.length ? `${toFa(items.length)} سند` : '';

  if (!items.length) {
    emptyEl.style.display = 'flex';
    return;
  }

  renderCategoryLegend(items);

  mount.style.display = 'block';
  mount.innerHTML = `
    <div class="stage3d-wrap" id="stageWrap">
      <div class="shelf" id="shelf">
        ${items.map((it, i) => {
          const cat = it.category && CATEGORIES[it.category] ? CATEGORIES[it.category] : null;
          return `
          <div class="tile3d-persp">
            <a class="tile3d" data-index="${i}" data-id="${it.id}"
               href="${it.file}" tabindex="0">
              <div class="tile3d-front${cat ? ' has-category' : ''}"${cat ? ` style="--cat-color:${cat.color}"` : ''}>
                <div class="tile3d-preview">
                  ${it.image
                    ? `<img class="tile3d-img" src="${it.image}" alt="" loading="lazy">`
                    : `<div class="tile3d-placeholder">
                         <svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z M4 15l4.5-4.5 3 3L17 8l3 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                         <span>بدون تصویر پیش‌نمایش</span>
                       </div>`}
                </div>
                <div class="tile3d-info">
                  <span class="tile3d-title">${it.title}</span>
                  ${it.subtitle ? `<span class="tile3d-sub">${it.subtitle}</span>` : ''}
                  <span class="tile3d-tag">${it.lang === 'fa' ? 'فارسی' : 'EN'}</span>
                </div>
              </div>
            </a>
          </div>
        `;
        }).join('')}
      </div>
    </div>`;

  wireShelf(items);
}

function wireShelf(items){
  const shelf = document.getElementById('shelf');
  const tiles = Array.from(shelf.querySelectorAll('.tile3d'));

  tiles.forEach((tile, i) => {
    const onEnter = () => {
      shelf.classList.add('has-hover');
      tiles.forEach((t, j) => {
        const w = t.closest('.tile3d-persp');
        w.classList.remove('nudge-l', 'nudge-r');
        if (j === i - 1) w.classList.add('nudge-l');
        if (j === i + 1) w.classList.add('nudge-r');
      });
    };
    const onLeave = () => {
      shelf.classList.remove('has-hover');
      tiles.forEach(t => t.closest('.tile3d-persp').classList.remove('nudge-l', 'nudge-r'));
    };
    tile.addEventListener('mouseenter', onEnter);
    tile.addEventListener('mouseleave', onLeave);
    tile.addEventListener('focus', onEnter);
    tile.addEventListener('blur', onLeave);

    tile.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      expandTile(tile, items[i], tile.getAttribute('href'));
    });
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        expandTile(tile, items[i], tile.getAttribute('href'));
      }
    });
  });
}

/* A short dashed line "launches" from the clicked tile toward the top
   of the screen while the tile itself expands — reinforcing that
   you're travelling to the document, not just watching a box resize. */
function drawExpandRoute(startX, startY){
  const endX = window.innerWidth / 2;
  const endY = window.innerHeight * 0.12;
  const midY = (startY + endY) / 2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'expand-route-svg');
  svg.style.cssText = 'position:fixed; inset:0; width:100vw; height:100vh; z-index:1000; pointer-events:none;';
  svg.innerHTML = `
    <path class="expand-route-path" d="M ${startX} ${startY} Q ${startX} ${midY}, ${endX} ${endY}"></path>
    <circle class="expand-route-dot" cx="${startX}" cy="${startY}" r="4"></circle>
  `;
  document.body.appendChild(svg);

  const path = svg.querySelector('.expand-route-path');
  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;

  requestAnimationFrame(() => {
    path.style.transition = 'stroke-dashoffset .5s cubic-bezier(.16,1,.3,1)';
    path.style.strokeDashoffset = '0';
  });

  setTimeout(() => {
    svg.style.transition = 'opacity .25s ease';
    svg.style.opacity = '0';
  }, 480);
  setTimeout(() => svg.remove(), 750);
}

/* Animate the clicked tile growing to fill the screen, then hand off
   to the document's real URL. */
function expandTile(tileEl, item, href){
  const front = tileEl.querySelector('.tile3d-front');
  const rect = front.getBoundingClientRect();

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    drawExpandRoute(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed; top:${rect.top}px; left:${rect.left}px; width:${rect.width}px; height:${rect.height}px; border-radius:14px; overflow:hidden; z-index:999; background:var(--paper); box-shadow:0 30px 70px rgba(70,63,58,.35); transition:top .6s cubic-bezier(.16,1,.3,1), left .6s cubic-bezier(.16,1,.3,1), width .6s cubic-bezier(.16,1,.3,1), height .6s cubic-bezier(.16,1,.3,1), border-radius .6s ease;`;

  const iframe = document.createElement('iframe');
  iframe.src = item.file;
  iframe.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; border:0;';
  overlay.appendChild(iframe);
  document.body.appendChild(overlay);

  const stageWrap = document.getElementById('stageWrap');
  if (stageWrap) {
    stageWrap.style.transition = 'opacity .45s ease';
    stageWrap.style.opacity = '.12';
  }

  requestAnimationFrame(() => {
    overlay.style.top = '0'; overlay.style.left = '0';
    overlay.style.width = '100vw'; overlay.style.height = '100vh';
    overlay.style.borderRadius = '0';
  });

  setTimeout(() => { window.location.href = href; }, 600);
}

/* ── Boot ────────────────────────────────────────────────────── */
/* ── Theme toggle (light / "night drive" dark) ──────────────────
   The initial theme is set by a tiny inline script in <head>, before
   first paint, to avoid a flash of the wrong theme. This just wires
   up the click handler for switching it afterward. */
function initThemeToggle(){
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* private-browsing storage block, ignore */ }
  });
}

/* ── Mouse-drawn path + follower (home page) ────────────────────
   Moving the mouse leaves a trail that fades after ~1s. A small
   follower continuously eases toward the most recent point of that
   trail. Clicking a chapter card sets that card's position as a goal;
   the trail stops growing, the follower drives to the goal, and once
   it arrives the real navigation happens — the click isn't ignored,
   it's just delayed by a short, satisfying "drive there" animation.
   Skipped entirely on touch devices and for reduced-motion users;
   those get instant, ordinary link clicks instead. */
function initPathFollower(){
  const canvas = document.getElementById('pathCanvas');
  const grid = document.getElementById('chapter-grid');
  if (!canvas || !grid) return;
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const TRAIL_MS = 1000;
  const GOAL_RADIUS = 6;
  const GOAL_TIMEOUT_MS = 1400;

  let trail = [];
  let follower = null;
  let goal = null;
  let goalStartedAt = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function activeColor(){
    return getComputedStyle(document.documentElement).getPropertyValue('--active').trim() || '#C2703D';
  }
  let strokeColor = activeColor();
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    setTimeout(() => { strokeColor = activeColor(); }, 260);
  });

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    if (goal) return;
    trail.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (!follower) follower = { x: e.clientX, y: e.clientY };
  });

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.chapter-card');
    if (!card || !follower) return; // no prior mouse movement (touch/keyboard) — let it navigate normally
    e.preventDefault();
    const rect = card.getBoundingClientRect();
    goal = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, href: card.getAttribute('href') };
    goalStartedAt = performance.now();
  });

  function hexToRgb(hex){
    const m = hex.replace('#', '').match(/.{1,2}/g);
    if (!m) return { r: 194, g: 112, b: 61 };
    const [r, g, b] = m.map(h => parseInt(h, 16));
    return { r, g, b };
  }

  function drawFollower(x, y, angle){
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = strokeColor;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(-7, -4, 14, 8, 3);
      ctx.fill();
    } else {
      ctx.fillRect(-7, -4, 14, 8);
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(9, 0);
    ctx.stroke();
    ctx.restore();
  }

  function frame(){
    const now = performance.now();
    if (!goal) trail = trail.filter(p => now - p.t < TRAIL_MS);

    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    const rgb = hexToRgb(strokeColor.startsWith('#') ? strokeColor : '#C2703D');
    if (trail.length > 1) {
      for (let i = 1; i < trail.length; i++) {
        const p0 = trail[i - 1], p1 = trail[i];
        const age = now - p1.t;
        const alpha = Math.max(0, 1 - age / TRAIL_MS) * 0.55;
        ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }

    const target = goal || trail[trail.length - 1];
    if (target && follower) {
      const dx = target.x - follower.x, dy = target.y - follower.y;
      const dist = Math.hypot(dx, dy);
      const ease = goal ? 0.1 : 0.16;
      if (dist > 0.5) {
        follower.x += dx * ease;
        follower.y += dy * ease;
        drawFollower(follower.x, follower.y, Math.atan2(dy, dx));
      } else {
        drawFollower(follower.x, follower.y, 0);
      }

      if (goal) {
        const reached = dist < GOAL_RADIUS;
        const timedOut = now - goalStartedAt > GOAL_TIMEOUT_MS;
        if (reached || timedOut) {
          window.location.href = goal.href;
          return;
        }
      }
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

(function init(){
  initThemeToggle();
  const page = document.body.dataset.page;
  if (page === 'home') { renderHome(); initPathFollower(); }
  if (page === 'chapter') renderChapter(document.body.dataset.chapter);
})();
