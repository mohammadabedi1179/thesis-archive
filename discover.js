/* ══════════════════════════════════════════════════════════════
   نقشه‌راه — shared GitHub folder-listing helper
   Used by gallery.js (chapter shelves) and by any photo-gallery
   page (like chapters/appendix/calibration-photos.html).
   ══════════════════════════════════════════════════════════════ */

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'];

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

/* Raw GitHub API listing for any repo-relative folder path.
   Throws 'NO_REPO' | 'RATE_LIMIT' | 'FETCH_FAILED', or resolves to
   [] for a folder that doesn't exist yet (treated as empty). */
async function listFolder(path){
  const repo = detectRepo();
  if (!repo) throw new Error('NO_REPO');

  const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${path}?ref=${repo.branch}`;
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });

  if (!res.ok) {
    if (res.status === 403) throw new Error('RATE_LIMIT');
    if (res.status === 404) return [];
    throw new Error('FETCH_FAILED');
  }
  return res.json();
}

function isImageName(name){
  const m = name.match(/^(.+)\.([a-zA-Z0-9]+)$/);
  return !!(m && IMAGE_EXTS.includes(m[2].toLowerCase()));
}

/* Most recent commit datetime on the configured branch, or null if it
   can't be determined (offline, rate-limited, not yet published). */
async function fetchLastUpdated(){
  const repo = detectRepo();
  if (!repo) return null;
  try {
    const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/commits?per_page=1&sha=${repo.branch}`;
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    return new Date(data[0].commit.committer.date);
  } catch (e) {
    return null;
  }
}

/* User-facing message for a caught discovery error. */
function discoveryErrorMessage(err){
  return err.message === 'RATE_LIMIT'
    ? 'محدودیت تعداد درخواست به GitHub فعال شده — چند دقیقهٔ دیگر دوباره امتحان کنید.'
    : 'این صفحه هنوز روی GitHub Pages منتشر نشده یا اتصال اینترنت برقرار نیست.';
}
