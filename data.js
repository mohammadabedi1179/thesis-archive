/* ══════════════════════════════════════════════════════════════
   نقشه‌راه — site config
   Documents are auto-discovered from each chapters/<id>/ folder at
   runtime (via the GitHub API) — you don't list them here anymore.
   This file only holds the fixed section list and repo settings.
   ══════════════════════════════════════════════════════════════ */

const CHAPTERS = [
  { id: 'ch3',      num: '۳', title: 'روش پژوهش و چهارچوب پیشنهادی',
    blurb: 'یادگیری تقویتی، فرمول‌بندی فرآیند تصمیم مارکوف و مقایسه الگوریتم‌ها' },
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
const REPO_OWNER = '';
const REPO_NAME  = '';
const REPO_BRANCH = 'main';
