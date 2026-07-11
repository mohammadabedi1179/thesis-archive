# نقشه‌راه — Thesis Interactive Archive

A tiny static "launcher" site: a menu on the side, and whichever interactive
HTML file you pick loads in the main pane. No build step, no framework —
just `index.html` + `style.css` + `app.js` + a `diagrams/` folder of your
standalone HTML deliverables.

## Deploy it (GitHub Pages, ~2 minutes)

**Option A — brand new repo (recommended, simplest)**

1. Create a new repo on GitHub, e.g. `thesis-archive`.
2. Push everything in this folder to it:
   ```bash
   cd thesis-gallery
   git init
   git add .
   git commit -m "Initial interactive archive"
   git branch -M main
   git remote add origin https://github.com/<your-username>/thesis-archive.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy
   from a branch → Branch: `main` / `(root)` → Save**.
4. After a minute your link is live at:
   `https://<your-username>.github.io/thesis-archive/`

**Option B — add it inside your existing thesis presentation repo**

Copy this whole folder in as a subdirectory, e.g. `your-repo/archive/`, push,
and (if Pages is already enabled on that repo) it will be live at
`https://<your-username>.github.io/<repo>/archive/` automatically — no
extra Pages configuration needed for a subfolder.

## Add a new document later

You said more files are coming — adding one takes two steps, no other file changes:

1. Drop the exported `.html` file into `diagrams/`.
2. Open `app.js` and add one object to the `ITEMS` array at the top, e.g.:
   ```js
   {
     id: 'yuv-pipeline',
     title: 'خط لولهٔ رمزگشایی YUV',
     subtitle: 'یک جملهٔ کوتاه دربارهٔ محتوای این سند',
     file: 'diagrams/yuv-pipeline.html',
     category: 'بینایی سه‌بعدی و حسگرها',   // reuse a category to group with existing items,
                                             // or give it a new category name to start a new group
     lang: 'fa'   // 'fa' or 'en' — just controls the small language tag shown in the list
   }
   ```
3. Commit and push. That's it.

Each diagram file is loaded in an `<iframe>`, so it keeps its own layout,
fonts, and scripts exactly as you built it — Persian/RTL files and
English/LTR files (like the Plotly depth-accuracy tool) work side by side
without conflicts.

## What's included right now

| File | Category |
|---|---|
| مکعب برچسب‌های AprilTag (`apriltag-goal-cube.html`) | بینایی سه‌بعدی و حسگرها |
| خط لوله دریافت تصویر استریو (`acquisition-pipeline-diagram.html`) | بینایی سه‌بعدی و حسگرها |
| دقت نقشهٔ عمق (`depth-accuracy-interactive.html`) | بینایی سه‌بعدی و حسگرها |

## Notes

- Works with zero dependencies — any static host works (GitHub Pages,
  Netlify, Vercel), not just GitHub.
- On narrow screens the sidebar becomes a slide-in drawer, opened with the
  menu button in the top-right.
- The "برگهٔ جدید" button opens the currently viewed file directly, useful
  if you want to share a link to one specific diagram instead of the whole
  archive.
