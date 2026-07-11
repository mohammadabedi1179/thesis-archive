/* ══════════════════════════════════════════════════════════════
   نقشه‌راه — shared rendering logic (home page + chapter pages)
   ══════════════════════════════════════════════════════════════ */

const VIRTUAL_W = 1280, VIRTUAL_H = 800;

function toFa(n){
  const map = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(n).replace(/\d/g, d => map[d]);
}

function countFor(chapterId){
  return ITEMS.filter(i => i.chapter === chapterId).length;
}

/* ── Home page: chapter cards ───────────────────────────────── */
function renderHome(){
  const grid = document.getElementById('chapter-grid');
  if (!grid) return;

  grid.innerHTML = CHAPTERS.map(ch => {
    const n = countFor(ch.id);
    const countLabel = n === 0 ? 'به‌زودی تکمیل می‌شود' : `${toFa(n)} سند تعاملی`;
    return `
      <a class="chapter-card${n === 0 ? ' is-empty' : ''}" href="chapters/${ch.id}/">
        <span class="chapter-tab">${ch.num}</span>
        <span class="chapter-card-title">${ch.title}</span>
        <span class="chapter-card-blurb">${ch.blurb}</span>
        <span class="chapter-card-count">${countLabel}</span>
      </a>`;
  }).join('');

  document.getElementById('totalCount').textContent =
    `${toFa(ITEMS.length)} سند تعاملی در ${toFa(CHAPTERS.length)} بخش`;
}

/* ── Chapter page: 3D document shelf ────────────────────────── */
function renderChapter(chapterId){
  const mount = document.getElementById('tile-grid');
  if (!mount) return;

  const chapter = CHAPTERS.find(c => c.id === chapterId);
  const items = ITEMS.filter(i => i.chapter === chapterId);

  document.getElementById('chapter-heading').textContent = chapter.title;
  document.getElementById('chapter-blurb').textContent = chapter.blurb;
  document.getElementById('chapter-count').textContent =
    items.length ? `${toFa(items.length)} سند` : '';

  const emptyEl = document.getElementById('empty-chapter');

  if (!items.length) {
    mount.style.display = 'none';
    emptyEl.style.display = 'flex';
    return;
  }

  emptyEl.style.display = 'none';
  mount.style.display = 'block';

  mount.innerHTML = `
    <div class="stage3d-wrap" id="stageWrap">
      <div class="stage3d">
        <div class="shelf" id="shelf">
          ${items.map((it, i) => `
            <a class="tile3d" data-index="${i}" data-id="${it.id}"
               href="../../view/${it.id}/" tabindex="0">
              <div class="tile3d-front">
                <div class="tile3d-preview">
                  <iframe class="tile3d-frame" src="../../diagrams/${it.file}" tabindex="-1" aria-hidden="true"></iframe>
                </div>
                <div class="tile3d-info">
                  <span class="tile3d-title">${it.title}</span>
                  <span class="tile3d-sub">${it.subtitle}</span>
                  <span class="tile3d-tag">${it.lang === 'fa' ? 'فارسی' : 'EN'}</span>
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </div>`;

  wireShelf(items);
}

function scalePreviews(){
  document.querySelectorAll('.tile3d-preview').forEach(face => {
    const frame = face.querySelector('.tile3d-frame');
    const apply = () => {
      const fw = face.clientWidth, fh = face.clientHeight;
      if (!fw || !fh) return;
      const scale = Math.max(fw / VIRTUAL_W, fh / VIRTUAL_H);
      const sw = VIRTUAL_W * scale, sh = VIRTUAL_H * scale;
      frame.style.width = VIRTUAL_W + 'px';
      frame.style.height = VIRTUAL_H + 'px';
      frame.style.transform = `translate(${(fw - sw) / 2}px, ${(fh - sh) / 2}px) scale(${scale})`;
    };
    apply();
    if ('ResizeObserver' in window) new ResizeObserver(apply).observe(face);
    else window.addEventListener('resize', apply);
  });
}

function wireShelf(items){
  scalePreviews();

  const shelf = document.getElementById('shelf');
  const tiles = Array.from(shelf.querySelectorAll('.tile3d'));

  tiles.forEach((tile, i) => {
    const onEnter = () => {
      shelf.classList.add('has-hover');
      tiles.forEach((t, j) => {
        t.classList.remove('nudge-l', 'nudge-r');
        if (j === i - 1) t.classList.add('nudge-l');
        if (j === i + 1) t.classList.add('nudge-r');
      });
    };
    const onLeave = () => {
      shelf.classList.remove('has-hover');
      tiles.forEach(t => t.classList.remove('nudge-l', 'nudge-r'));
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

/* Animate the clicked tile growing to fill the screen, then hand off
   to the document's real URL (its own page, back-pill included). */
function expandTile(tileEl, item, href){
  const front = tileEl.querySelector('.tile3d-front');
  const rect = front.getBoundingClientRect();

  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed; top:${rect.top}px; left:${rect.left}px; width:${rect.width}px; height:${rect.height}px; border-radius:14px; overflow:hidden; z-index:999; background:var(--paper); box-shadow:0 30px 70px rgba(70,63,58,.35); transition:top .5s cubic-bezier(.22,.9,.3,1), left .5s cubic-bezier(.22,.9,.3,1), width .5s cubic-bezier(.22,.9,.3,1), height .5s cubic-bezier(.22,.9,.3,1), border-radius .5s ease;`;

  const iframe = document.createElement('iframe');
  iframe.src = '../../diagrams/' + item.file;
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

  setTimeout(() => { window.location.href = href; }, 520);
}

/* ── Boot ────────────────────────────────────────────────────── */
(function init(){
  const page = document.body.dataset.page;
  if (page === 'home') renderHome();
  if (page === 'chapter') renderChapter(document.body.dataset.chapter);
})();
