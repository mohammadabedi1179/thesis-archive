#!/usr/bin/env python3
"""
نقشه‌راه — page generator
Regenerates chapters/*/index.html from the list below. This should be
kept in sync with data.js (it's a plain Python copy of the chapter list,
used only to stamp out the boilerplate shell — gallery.js is what
actually renders the tiles at runtime by reading data.js).

Usage:
    python3 generate.py

You will not normally need this: adding a new document is just "drop the
file in the right chapters/<id>/ folder + add one entry to data.js" (see
README.md). Only re-run this if you're adding a brand-new chapter/section
(not just a new document inside an existing one).
"""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

# (chapter_id, <title> tag text)
CHAPTERS = [
    ('ch4',      'فصل ۴ — طراحی و شبیه‌سازی'),
    ('ch5',      'فصل ۵ — پیاده‌سازی عملی، ساخت نمونه و آزمون‌های واقعی'),
    ('ch6',      'فصل ۶ — ارزیابی و تحلیل نتایج'),
    ('appendix', 'پیوست‌ها'),
    ('extra',    'موارد اضافی'),
]

CHAPTER_PAGE = """<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<script>(function(){{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}})();</script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — نقشه‌راه</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../style.css">
</head>
<body data-page="chapter" data-chapter="{chapter_id}" class="has-texture">

  <header id="topbar">
    <a class="icon-btn" href="../../" aria-label="بازگشت به صفحه اصلی">
      <svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </a>
    <div class="crumb">
      <a class="crumb-root" href="../../">نقشه‌راه</a>
      <span class="crumb-sep">/</span>
      <span id="chapter-heading" class="crumb-current"></span>
    </div>
    <span id="chapter-count" class="topbar-count"></span>
    <button class="icon-btn theme-toggle" id="themeToggle" type="button" aria-label="تغییر پوستهٔ روشن/تاریک">
      <svg class="icon-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      <svg class="icon-moon" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
    </button>
  </header>

  <nav id="chapter-pills" class="chapter-pills" aria-label="پیمایش سریع بین فصل‌ها"></nav>

  <main id="chapter-main">
    <p id="chapter-blurb"></p>
    <div id="category-legend" class="category-legend"></div>

    <div id="loading-chapter" class="loading-chapter">
      <span class="spinner"></span>
      <span>در حال بارگذاری اسناد…</span>
    </div>

    <div id="tile-grid" class="tile-grid"></div>

    <div id="empty-chapter" class="empty-chapter">
      <svg viewBox="0 0 120 80" class="empty-route" aria-hidden="true">
        <path d="M8 62 C 28 62, 28 34, 48 34 S 68 8, 88 8 S 108 8, 112 8" stroke-dasharray="4 6"/>
        <circle cx="8" cy="62" r="4"/><circle cx="48" cy="34" r="3.2"/><circle cx="88" cy="8" r="3.2"/>
      </svg>
      <h2>هنوز سندی اضافه نشده</h2>
      <p>مستندات تعاملی این فصل به‌زودی اضافه می‌شوند.</p>
    </div>

    <div id="error-chapter" class="empty-chapter error-chapter">
      <svg viewBox="0 0 120 80" class="empty-route" aria-hidden="true">
        <path d="M8 62 C 28 62, 28 34, 48 34 S 68 8, 88 8 S 108 8, 112 8" stroke-dasharray="4 6"/>
        <circle cx="8" cy="62" r="4"/><circle cx="48" cy="34" r="3.2"/><circle cx="88" cy="8" r="3.2"/>
      </svg>
      <h2>فهرست اسناد بارگذاری نشد</h2>
      <p></p>
    </div>
  </main>

<script src="../../data.js"></script>
<script src="../../discover.js"></script>
<script src="../../gallery.js"></script>
</body>
</html>
"""

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('wrote', os.path.relpath(path, ROOT))

def main():
    for chapter_id, title in CHAPTERS:
        write(
            os.path.join(ROOT, 'chapters', chapter_id, 'index.html'),
            CHAPTER_PAGE.format(title=title, chapter_id=chapter_id)
        )

if __name__ == '__main__':
    main()
