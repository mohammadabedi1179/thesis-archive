#!/usr/bin/env python3
"""
نقشه‌راه — page generator
Regenerates chapters/*/index.html and view/*/index.html from the lists
below. These lists should be kept in sync with data.js (they're plain
Python copies of the same registry, used only to stamp out boilerplate
HTML — gallery.js is what actually renders content at runtime).

Usage:
    python3 generate.py

You do NOT need to run this for every new document — see README.md for
the two-line manual alternative. Use this only if you'd rather
regenerate everything in one go after editing the lists below.
"""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

CHAPTERS = ['ch3', 'ch4', 'ch5', 'ch6', 'appendix', 'extra']

ITEMS = [
    ('apriltag-goal-cube',        'مکعب برچسب‌های AprilTag',       'ch5'),
    ('acquisition-pipeline',      'خط لوله دریافت تصویر استریو',   'ch5'),
    ('depth-accuracy',            'دقت نقشهٔ عمق',                  'ch5'),
    ('desk-quat-yaw',             'مقایسهٔ Yaw واحد اینرسی',        'ch5'),
    ('power-system',              'معماری سیستم توان و الکترونیک', 'ch5'),
    ('sensor-control-system',     'معماری حسگری و کنترلی',         'ch5'),
    ('yuv-pipeline',              'استخراج صفحهٔ Y',                'ch5'),
    ('point-cloud-pipeline',      'از تصویر استریو تا ابرنقاط',    'ch4'),
    ('state-representation',      'حلقهٔ تعامل کنشگر و محیط',       'ch4'),
    ('stereo-vision-pipeline',    'خط لولهٔ پردازش تصویر استریو',   'ch4'),
    ('skid-steering-comparison',  'مقایسهٔ چرخش Skid-Steering',     'ch4'),
    ('tf-tree-3d-view',           'نمای سه‌بعدی درخت TF',           'ch4'),
]

FILE_FOR = {
    'apriltag-goal-cube': 'apriltag-goal-cube.html',
    'acquisition-pipeline': 'acquisition-pipeline-diagram.html',
    'depth-accuracy': 'depth-accuracy-interactive.html',
    'desk-quat-yaw': 'desk-quat-yaw-comparison.html',
    'power-system': 'power-system-diagram.html',
    'sensor-control-system': 'sensor-control-system-diagram.html',
    'yuv-pipeline': 'yuv-pipeline-diagram.html',
    'point-cloud-pipeline': 'point-cloud-pipeline-diagram.html',
    'state-representation': 'state-representation-diagram.html',
    'stereo-vision-pipeline': 'stereo-vision-pipeline-diagram.html',
    'skid-steering-comparison': 'skid-steering-comparison.html',
    'tf-tree-3d-view': 'tf-tree-3d-view.html',
}

CHAPTER_PAGE = """<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
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
      <span class="crumb-root">نقشه‌راه</span>
      <span class="crumb-sep">/</span>
      <span id="chapter-heading" class="crumb-current"></span>
    </div>
    <span id="chapter-count" class="topbar-count"></span>
  </header>

  <main id="chapter-main">
    <p id="chapter-blurb"></p>

    <div id="tile-grid" class="tile-grid"></div>

    <div id="empty-chapter" class="empty-chapter">
      <svg viewBox="0 0 120 80" class="empty-route" aria-hidden="true">
        <path d="M8 62 C 28 62, 28 34, 48 34 S 68 8, 88 8 S 108 8, 112 8" stroke-dasharray="4 6"/>
        <circle cx="8" cy="62" r="4"/><circle cx="48" cy="34" r="3.2"/><circle cx="88" cy="8" r="3.2"/>
      </svg>
      <h2>هنوز سندی اضافه نشده</h2>
      <p>مستندات تعاملی این فصل به‌زودی اضافه می‌شوند.</p>
    </div>
  </main>

<script src="../../data.js"></script>
<script src="../../gallery.js"></script>
</body>
</html>
"""

VIEW_PAGE = """<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — نقشه‌راه</title>
<link rel="stylesheet" href="../../style.css">
</head>
<body class="view-body">
  <a class="back-pill" href="../../chapters/{chapter_id}/">
    <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>
    <span>بازگشت به فهرست</span>
  </a>
  <iframe class="view-frame" src="../../diagrams/{file}" title="{title}"></iframe>
</body>
</html>
"""

# Chapter titles, kept here only for <title> tags (gallery.js supplies
# the on-page heading/blurb from data.js at runtime).
CHAPTER_TITLES = {
    'ch3': 'فصل ۳ — روش پژوهش و چهارچوب پیشنهادی',
    'ch4': 'فصل ۴ — طراحی و شبیه‌سازی',
    'ch5': 'فصل ۵ — پیاده‌سازی عملی، ساخت نمونه و آزمون‌های واقعی',
    'ch6': 'فصل ۶ — ارزیابی و تحلیل نتایج',
    'appendix': 'پیوست‌ها',
    'extra': 'موارد اضافی',
}

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('wrote', os.path.relpath(path, ROOT))

def main():
    for ch in CHAPTERS:
        write(
            os.path.join(ROOT, 'chapters', ch, 'index.html'),
            CHAPTER_PAGE.format(title=CHAPTER_TITLES[ch], chapter_id=ch)
        )

    for item_id, title, chapter_id in ITEMS:
        write(
            os.path.join(ROOT, 'view', item_id, 'index.html'),
            VIEW_PAGE.format(title=title, chapter_id=chapter_id, file=FILE_FOR[item_id])
        )

if __name__ == '__main__':
    main()
