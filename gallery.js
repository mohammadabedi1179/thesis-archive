/* ══════════════════════════════════════════════════════════════
   نقشه‌راه — auto-discovery + rendering
   Every chapters/<id>/*.html file (except index.html) is picked up
   automatically via the GitHub Contents API — no manual registry.
   ══════════════════════════════════════════════════════════════ */

const VIRTUAL_W = 1280, VIRTUAL_H = 800;

function toFa(n){
  const map = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(n).replace(/\d/g, d => map[d]);
}

/* ── Repo detection ──────────────────────────────────────────── */
function detectRepo(){
  if (REPO_OWNER && REPO_NAME) return { owner: REPO_OWNER, repo: REPO_NAME, branch: REPO_BRANCH };

  const host = location.hostname;
  if (host.endsWith('.github.io')) {
    const owner = host.split('.')[0];
    const parts = location.pathname.split('/').filter(Boolean);
    const repo = parts.length ? parts[0] : `${owner}.github.io`;
    return { owner, repo, branch: REPO_BRANCH || 'main' };
  }
  return null; // not resolvable (local testing, custom domain without config, etc.)
}

/* ── GitHub API ──────────────────────────────────────────────── */
async function listChapterFiles(chapterId){
  const repo = detectRepo();
  if (!repo) throw new Error('NO_REPO');

  const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/chapters/${chapterId}?ref=${repo.branch}`;
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });

  if (!res.ok) {
    if (res.status === 403) throw new Error('RATE_LIMIT');
    if (res.status === 404) return []; // folder not found yet — treat as empty
    throw new Error('FETCH_FAILED');
  }

  const entries = await res.json();
  return entries
    .filter(e => e.type === 'file' && /\.html?$/i.test(e.name) && e.name.toLowerCase() !== 'index.html')
    .map(e => ({ name: e.name, downloadUrl: e.download_url }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchFileMeta(fileEntry){
  let title = fileEntry.name.replace(/\.html?$/i, '');
  let subtitle = '';
  let lang = 'en';

  try {
    const res = await fetch(fileEntry.downloadUrl);
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');

    const titleEl = doc.querySelector('title');
    if (titleEl && titleEl.textContent.trim()) title = titleEl.textContent.trim();

    const subMeta = doc.querySelector('meta[name="tile-subtitle"]');
    if (subMeta) subtitle = subMeta.getAttribute('content') || '';

    const htmlLang = doc.documentElement.getAttribute('lang') || '';
    const dir = doc.documentElement.getAttribute('dir') || '';
    lang = (htmlLang.startsWith('fa') || dir === 'rtl') ? 'fa' : 'en';
  } catch (e) {
    /* keep the filename-derived fallback title if the file can't be read */
  }

  return {
    id: fileEntry.name.replace(/\.html?$/i, ''),
    file: fileEntry.name,
    title, subtitle, lang
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

  grid.innerHTML = CHAPTERS.map(ch => `
    <a class="chapter-card is-loading" href="chapters/${ch.id}/" data-chapter="${ch.id}">
      <span class="chapter-tab">${ch.num}</span>
      <span class="chapter-card-title">${ch.title}</span>
      <span class="chapter-card-blurb">${ch.blurb}</span>
      <span class="chapter-card-count">در حال شمارش…</span>
    </a>`
  ).join('');

  const results = await Promise.allSettled(CHAPTERS.map(ch => listChapterFiles(ch.id)));

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

  document.getElementById('totalCount').textContent =
    `${toFa(total)} سند تعاملی در ${toFa(CHAPTERS.length)} بخش`;
}

/* ── Chapter page: 3D document shelf ────────────────────────── */
async function renderChapter(chapterId){
  const mount = document.getElementById('tile-grid');
  if (!mount) return;

  const chapter = CHAPTERS.find(c => c.id === chapterId);
  document.getElementById('chapter-heading').textContent = chapter.title;
  document.getElementById('chapter-blurb').textContent = chapter.blurb;

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
    errorEl.querySelector('p').textContent =
      err.message === 'RATE_LIMIT'
        ? 'محدودیت تعداد درخواست به GitHub فعال شده — چند دقیقهٔ دیگر دوباره امتحان کنید.'
        : 'این صفحه هنوز روی GitHub Pages منتشر نشده یا اتصال اینترنت برقرار نیست.';
    return;
  }

  loadingEl.style.display = 'none';
  document.getElementById('chapter-count').textContent =
    items.length ? `${toFa(items.length)} سند` : '';

  if (!items.length) {
    emptyEl.style.display = 'flex';
    return;
  }

  mount.style.display = 'block';
  mount.innerHTML = `
    <div class="stage3d-wrap" id="stageWrap">
      <div class="stage3d">
        <div class="shelf" id="shelf">
          ${items.map((it, i) => `
            <a class="tile3d" data-index="${i}" data-id="${it.id}"
               href="${it.file}" tabindex="0">
              <div class="tile3d-front">
                <div class="tile3d-preview">
                  <iframe class="tile3d-frame" src="${it.file}" tabindex="-1" aria-hidden="true"></iframe>
                </div>
                <div class="tile3d-info">
                  <span class="tile3d-title">${it.title}</span>
                  ${it.subtitle ? `<span class="tile3d-sub">${it.subtitle}</span>` : ''}
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
   to the document's real URL. */
function expandTile(tileEl, item, href){
  const front = tileEl.querySelector('.tile3d-front');
  const rect = front.getBoundingClientRect();

  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed; top:${rect.top}px; left:${rect.left}px; width:${rect.width}px; height:${rect.height}px; border-radius:14px; overflow:hidden; z-index:999; background:var(--paper); box-shadow:0 30px 70px rgba(70,63,58,.35); transition:top .5s cubic-bezier(.22,.9,.3,1), left .5s cubic-bezier(.22,.9,.3,1), width .5s cubic-bezier(.22,.9,.3,1), height .5s cubic-bezier(.22,.9,.3,1), border-radius .5s ease;`;

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

  setTimeout(() => { window.location.href = href; }, 520);
}

/* ── Boot ────────────────────────────────────────────────────── */
(function init(){
  const page = document.body.dataset.page;
  if (page === 'home') renderHome();
  if (page === 'chapter') renderChapter(document.body.dataset.chapter);
})();
