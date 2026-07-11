/* ══════════════════════════════════════════════════════════════
   نقشه‌راه — shared rendering logic (home page + chapter pages)
   ══════════════════════════════════════════════════════════════ */

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

/* ── Chapter page: document tiles ───────────────────────────── */
function renderChapter(chapterId){
  const grid = document.getElementById('tile-grid');
  if (!grid) return;

  const chapter = CHAPTERS.find(c => c.id === chapterId);
  const items = ITEMS.filter(i => i.chapter === chapterId);

  document.getElementById('chapter-heading').textContent = chapter.title;
  document.getElementById('chapter-blurb').textContent = chapter.blurb;
  document.getElementById('chapter-count').textContent =
    items.length ? `${toFa(items.length)} سند` : '';

  const emptyEl = document.getElementById('empty-chapter');

  if (!items.length) {
    grid.style.display = 'none';
    emptyEl.style.display = 'flex';
    return;
  }

  emptyEl.style.display = 'none';
  grid.style.display = 'grid';

  grid.innerHTML = items.map(it => `
    <a class="tile" href="../../view/${it.id}/" data-id="${it.id}">
      <span class="tile-preview">
        <iframe class="tile-frame" src="../../diagrams/${it.file}" tabindex="-1" aria-hidden="true" loading="lazy"></iframe>
      </span>
      <span class="tile-info">
        <span class="tile-title">${it.title}</span>
        <span class="tile-sub">${it.subtitle}</span>
        <span class="tile-tag">${it.lang === 'fa' ? 'فارسی' : 'EN'}</span>
      </span>
    </a>
  `).join('');

  scalePreviews();
}

/* Live-scale each iframe preview to fit its tile, regardless of
   grid column width, by rendering it at a fixed virtual size and
   shrinking it with a CSS transform. */
function scalePreviews(){
  const VIRTUAL_W = 1280, VIRTUAL_H = 800;

  document.querySelectorAll('.tile-preview').forEach(box => {
    const frame = box.querySelector('.tile-frame');
    frame.style.width  = VIRTUAL_W + 'px';
    frame.style.height = VIRTUAL_H + 'px';

    const apply = () => {
      const scale = box.clientWidth / VIRTUAL_W;
      frame.style.transform = `scale(${scale})`;
    };
    apply();

    if ('ResizeObserver' in window) {
      new ResizeObserver(apply).observe(box);
    } else {
      window.addEventListener('resize', apply);
    }
  });
}

/* ── Boot ────────────────────────────────────────────────────── */
(function init(){
  const page = document.body.dataset.page;
  if (page === 'home') renderHome();
  if (page === 'chapter') renderChapter(document.body.dataset.chapter);
})();
