/* ══════════════════════════════════════════════════════════════
   نقشه‌راه — site config
   Documents are auto-discovered from each chapters/<id>/ folder at
   runtime (via the GitHub API) — you don't list them here anymore.
   This file only holds the fixed section list and repo settings.
   ══════════════════════════════════════════════════════════════ */

const CHAPTERS = [
  { id: 'ch4',      num: '۴', title: 'طراحی و شبیه‌سازی',
    blurb: 'معماری سامانه، مدل ربات، فضای حالت و عمل، و طراحی عامل یادگیری تقویتی' },
  { id: 'ch5',      num: '۵', title: 'پیاده‌سازی عملی، ساخت نمونه و آزمون‌های واقعی',
    blurb: 'سخت‌افزار، لایه ادراک واقعی، کالیبراسیون و آزمون‌های میدانی' },
  { id: 'ch6',      num: '۶', title: 'ارزیابی و تحلیل نتایج',
    blurb: 'نتایج شبیه‌سازی، معیارهای آموزش و عملکرد در سناریوهای آزمون' },
  { id: 'appendix', num: 'پ', title: 'پیوست‌ها',
    blurb: 'مستندات تکمیلی و مواد پشتیبان' },
  { id: 'extra',    num: '+', title: 'موارد اضافی',
    blurb: 'ابزارها و تحلیل‌های جانبی خارج از ساختار اصلی متن' }
];

/* ── Subsystem categories ────────────────────────────────────
   Tag any document with <meta name="tile-category" content="..."> in
   its <head> (same convention as tile-subtitle) to color-code its tile
   by subsystem, regardless of which chapter it's filed under. Untagged
   files just render without a color stripe — nothing breaks. */
const CATEGORIES = {
  vision:             { label: 'ادراک و حسگرها',      color: 'var(--primary)' },
  hardware:           { label: 'سخت‌افزار و توان',     color: 'var(--secondary)' },
  control:            { label: 'مدل ربات و کنترل',     color: 'var(--active)' },
  evaluation:         { label: 'ارزیابی',              color: '#5B7FA6' },
  'training-teacher': { label: 'آموزش — معلم',         color: '#8171A8' },
  'training-student': { label: 'آموزش — دانش‌آموز',    color: '#6E8F5D' }
};

/* ── Extra home-page tiles ──────────────────────────────────
   These render next to the chapter cards but link straight to a
   single page instead of a chapters/<id>/ folder — no auto-discovery,
   no document count, just a direct link. Add one object per tile. */
const EXTRA_TILES = [
  { num: '⛶', title: 'مدل سه‌بعدی تعاملی',
    blurb: 'مشاهدهٔ مستقیم مدل — چرخش و بزرگ‌نمایی آزاد',
    href: 'viewer/scooter-3d-model.html' }
];

/* ── Repo settings ───────────────────────────────────────────
   Leave both blank to auto-detect from the page URL (works out of
   the box on a normal GitHub Pages URL: https://OWNER.github.io/REPO/).
   Only fill these in if you're using a custom domain, where the
   OWNER/REPO can't be read from the URL. */
const REPO_OWNER = 'mohammadabedi1179';
const REPO_NAME  = 'thesis-archive';
const REPO_BRANCH = 'main';
