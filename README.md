# نقشه‌راه — Thesis Interactive Archive

A small static site with three levels of navigation, each with its own
real URL:

```
Home (/)                         → 6 chapter cards
  → Chapter page (/chapters/ch5/) → tile grid, live thumbnail per document
    → Document page (/view/apriltag-goal-cube/) → the file, full-screen
```

No build step, no framework. Every page is a plain `.html` file, so it
works on any static host and every level is directly linkable/shareable.

## Deploy it (GitHub Pages)

```bash
cd thesis-gallery
git init
git add .
git commit -m "Interactive thesis archive"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Source: Deploy
from a branch → Branch: `main` / `(root)` → Save**. Live in a minute or two at
`https://<your-username>.github.io/<repo-name>/`.

(Already have a repo for the thesis presentation? You can drop this whole
folder in as a subdirectory instead — see the previous README version, same
idea, no extra Pages config needed for a subfolder.)

## How it's organized

```
index.html            home page (chapter cards)
style.css              shared styles for every page
data.js                 ← the registry: edit this to add/move/rename documents
gallery.js              rendering logic (reads data.js, builds cards/tiles)
generate.py              optional helper — regenerates chapters/*/view/* in bulk

diagrams/                your exported .html files, untouched
chapters/ch3/index.html  ↴
chapters/ch4/index.html   } one small page per chapter, all driven by data.js
chapters/ch5/index.html  ↳
chapters/ch6/index.html
chapters/appendix/index.html
chapters/extra/index.html

view/<id>/index.html     one tiny wrapper page per document — full-screen
                          iframe of the real file + a "back to list" pill
```

## Add a new document

Two steps, no other files to touch:

**1. Drop the exported `.html` into `diagrams/`.**

**2. Add one entry to the `ITEMS` array in `data.js`:**
```js
{ id: 'reward-curve', title: 'روند پاداش در آموزش',
  subtitle: 'یک جملهٔ کوتاه دربارهٔ محتوای این سند',
  file: 'reward-curve.html', chapter: 'ch6', lang: 'fa' }
```
`chapter` must be one of: `ch3`, `ch4`, `ch5`, `ch6`, `appendix`, `extra`.

**3. Create its view page** — copy any existing `view/<id>/index.html`,
paste it into a new `view/reward-curve/index.html`, and change the three
things in it: the `<title>`, the `href="../../chapters/XX/"` (must match
the `chapter` you set above), and the iframe `src="../../diagrams/XX.html"`.

That's it — the chapter page picks it up automatically (no edits needed
there), because it renders its tiles live from `data.js`.

*(If you're adding several documents at once, it's faster to add all their
entries to `ITEMS` in `data.js`, update the matching lists at the top of
`generate.py`, and run `python3 generate.py` once — it regenerates every
chapter and view page for you.)*

## How chapters were assigned

Based on matching each diagram's content against your actual `chapter3–6.tex`
headings:

| Chapter | Documents |
|---|---|
| فصل ۳ | *(none yet — theoretical RL/MDP framework, room for e.g. an algorithm-comparison diagram)* |
| فصل ۴ — طراحی و شبیه‌سازی | ابرنقاط، حلقهٔ تعامل کنشگر و محیط، خط لولهٔ پردازش استریو، مقایسهٔ Skid-Steering، درخت TF |
| فصل ۵ — پیاده‌سازی عملی | AprilTag، دریافت تصویر استریو، دقت عمق، مقایسهٔ Yaw، توان و الکترونیک، معماری حسگری-کنترلی، استخراج Y |
| فصل ۶ | *(none yet — training/evaluation results)* |
| پیوست‌ها / موارد اضافی | *(empty for now)* |

Worth double-checking, especially **desk-quat-yaw** (IMU bench test — I put
it under فصل ۵ as hardware validation, but it could arguably sit in فصل ۶ or
موارد اضافی depending on how you frame it) and **stereo-vision-pipeline**
vs **acquisition-pipeline** (both فصل ۵-adjacent; I split them as
design/algorithm → فصل ۴ vs real hardware transfer → فصل ۵). Moving any item
is a one-line edit to its `chapter` field in `data.js`.

## UI details

- **Document tiles are a 3D perspective shelf**, not a flat grid: tiles stand
  at an angle like books on a shelf. Hovering one turns it to face you and
  lifts it forward while its two neighbors slide apart to make room; the
  rest of the row dims. Clicking animates the tile growing to fill the
  screen, then hands off to its real URL (`/view/<id>/`) — so the "coming
  out of the shelf" effect leads straight into a normal, linkable page.
- **Tile previews are live**, not static screenshots: each one embeds the
  real file at a fixed virtual size and crops/scales it to fit (`object-fit:
  cover` behavior), so what you see is an accurate, always-up-to-date first
  frame of the actual document.
- Chapters with more documents than fit on screen scroll horizontally —
  the shelf, not the whole page.
- **Empty chapters** (فصل ۳، فصل ۶، پیوست‌ها، موارد اضافی right now) still
  show up on the home page and have their own page with a friendly
  "nothing here yet" state — nothing 404s.
- All navigation is real page-to-page navigation (plain links under the
  hood), so the browser back button, refresh, and sharing a link to any
  single chapter or document all just work — the shelf animation is a
  transition layered on top, not a replacement for it.
