# نقشه‌راه — Thesis Interactive Archive

A static, zero-build site for browsing your thesis's interactive documents
by chapter. Everything below reflects the site as it currently stands —
auto-discovery, dark mode, subsystem color-coding, cross-chapter
navigation, and a mouse-driven "drive there" interaction on the home page.

## Adding a document takes one step

Drop the exported `.html` file into the right `chapters/<id>/` folder and
push. No file to edit, nothing else to touch.

```
chapters/ch5/your-new-file.html
```

**For the tile preview image**, add an image with the exact same filename
(different extension) right next to it:

```
chapters/ch5/your-new-file.html
chapters/ch5/your-new-file.png     ← same name, this is the tile thumbnail
```

`.png`, `.jpg`/`.jpeg`, `.webp`, `.svg`, and `.gif` are all recognized. No
image yet? The tile still shows up, just with a plain "بدون تصویر
پیش‌نمایش" placeholder instead of a broken image.

The site reads the actual contents of each `chapters/<id>/` folder at
runtime (via the GitHub API) and builds the tile automatically:

- **Title** — taken from the file's own `<title>` tag.
- **Language badge (فارسی/EN)** — detected from `<html lang="...">`.
- **Preview image** — the same-name image sitting beside it.
- **Subtitle** *(optional)* — add this line in the file's `<head>`, or
  skip it and the tile just omits the subtitle line:
  ```html
  <meta name="tile-subtitle" content="یک جملهٔ کوتاه دربارهٔ این سند">
  ```
- **Subsystem color** *(optional)* — see the dedicated section below.

Delete a file from the folder and it disappears from the site on next
load — nothing to clean up elsewhere.

## Subsystem color-coding

Any document can get a thin colored stripe on its tile, independent of
which chapter it's filed under — useful for spotting "all the vision
stuff" at a glance even when it's spread across چهار/پنج/شش. Add one line
to the file's `<head>`:

```html
<meta name="tile-category" content="vision">
```

Current categories (defined in `data.js`, under `CATEGORIES`):

| `content` value | Label | Color |
|---|---|---|
| `vision` | ادراک و حسگرها | teal |
| `hardware` | سخت‌افزار و توان | amber |
| `control` | مدل ربات و کنترل | terracotta |
| `evaluation` | ارزیابی | blue |
| `training-teacher` | آموزش — معلم | purple |
| `training-student` | آموزش — دانش‌آموز | green |

No tag → no stripe, nothing breaks. A small legend automatically appears
above a chapter's shelf, but only lists the categories actually present
among that chapter's documents.

To add, rename, or recolor a category, edit the `CATEGORIES` object in
`data.js` — every file already tagged with a given key picks up the
change automatically, nothing else to touch.

## Photo albums (like calibration photos)

For a set of plain photos rather than one interactive document, there's a
reusable album template at `chapters/appendix/calibration-photos.html`:

```
chapters/appendix/calibration-photos.html      ← the album page
chapters/appendix/calibration-photos/          ← put photos in here
  img1.jpg
  img2.jpg
```

Drop photos into that folder and push — the page lists them automatically,
shown as a grid that opens into a full-screen viewer with next/previous.
The album is a normal tile in its chapter's shelf; give it a same-name
cover image in the parent folder (e.g. `calibration-photos.jpg`) for a
real thumbnail instead of the placeholder.

**Want another photo album** (different chapter, different topic)? Copy
`calibration-photos.html` to a new filename in the target chapter folder,
change its `<title>` and `<meta name="tile-subtitle">` — nothing else. It
reads its own chapter and image-subfolder name from its own URL.

## The 3D model viewer tile

The home page has one extra tile that isn't a chapter — a live, orbit-able
3D viewer for the scooter's GLB model, configured in `data.js` under
`EXTRA_TILES` and served from `viewer/scooter-3d-model.html`. To point it
at a different model or add another one, copy that file, edit its
`MODEL_URL` line (clearly marked in the file), and add/edit the matching
`EXTRA_TILES` entry.

## How auto-discovery works (worth understanding before you deploy)

Plain static hosting can't list "what's in this folder" on its own — so
the site asks **GitHub's API** directly, from the visitor's browser, the
moment a chapter page loads. This means:

- **Only works once actually live on GitHub Pages** (or any URL where the
  repo owner/name can be determined — see Repo detection below). Opening
  `index.html` locally by double-clicking shows layout but no documents.
- **Repo must be public** — the API endpoint used here only works
  unauthenticated for public repos.
- **60 requests/hour per visitor IP.** Home page uses ~6 (one per
  chapter, for counts) + 1 more for the "last updated" timestamp; each
  chapter page uses 1. Very unlikely to matter for a defense audience —
  if it ever does, visitors see a friendly "try again shortly" message
  instead of a broken page.

## Repo detection

Figured out automatically from the page URL — nothing to configure for a
normal `https://<user>.github.io/<repo>/` setup. Only touch this for a
**custom domain**, in `data.js`:
```js
const REPO_OWNER = 'your-github-username';
const REPO_NAME  = 'your-repo-name';
```

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

**Settings → Pages → Source: Deploy from a branch → `main` / `(root)` →
Save.** Confirm **Settings → General → repo is Public**. Live in a minute
or two at `https://<your-username>.github.io/<repo-name>/`.

## How it's organized

```
index.html        home page — cover block, chapter cards, route line, mouse-follower
style.css           shared styles for every page (includes the dark theme palette)
data.js              chapters + categories + extra tiles + repo settings
discover.js           shared GitHub API helper (folder listing, last-updated, error messages)
gallery.js           rendering + interaction logic — home page, chapter shelves, theme toggle
generate.py           optional — regenerates chapter pages; only needed for a new chapter/section

viewer/
  scooter-3d-model.html   3D GLB model viewer (linked from the home page, not a chapter)

chapters/
  ch4/index.html
  ch4/*.html                        ← your files, straight in the folder
  ch5/index.html
  ch5/*.html
  ch6/index.html
  ch6/*.html
  appendix/index.html
  appendix/calibration-photos.html  ← photo album template
  appendix/calibration-photos/      ← calibration photos go here
  appendix/*.html
  extra/index.html
```

There is no `chapters/ch3/` — it was removed; the home page shows five
chapter cards plus the 3D model tile.

Adding a whole **new chapter/section** (not just a new document in an
existing one) needs one edit: add it to the `CHAPTERS` array in both
`data.js` and `generate.py`, then run `python3 generate.py` once to stamp
out that chapter's `index.html`.

## One thing to fill in yourself: the cover block

`index.html` has a title-page section above the chapter cards with three
placeholders that need your actual details — I can't guess your name,
advisor, or defense date:
```
نگارش: [نام دانشجو]
استاد راهنما: [نام استاد راهنما]
تاریخ دفاع: [تاریخ دفاع]
```
There's also a placeholder thesis title above them — replace it if it
doesn't match your official title.

## UI details

**3D perspective shelf** — document tiles stand at an angle like books on
a shelf, all at the same fixed tilt regardless of position in the row.
Hovering turns a tile to face you and lifts it forward while its two
neighbors slide apart; the rest of the row dims. Chapters with more
documents than fit on screen scroll horizontally.

**Tile previews are static images** (the same-name file next to each
`.html`) — fast and consistent, nothing renders live to produce a
thumbnail.

**Cross-chapter navigation** — "نقشه‌راه" in the breadcrumb is a real link
home from anywhere. A row of small circular pills under the topbar on
every chapter/document page lets you jump directly to any other chapter
(or the 3D model) without detouring through home.

**Dark mode** — a sun/moon toggle in the topbar on every page. Colors are
lightened, not just swapped, so contrast holds up; the choice persists via
`localStorage`, and a tiny inline script in `<head>` sets the theme before
first paint so switching pages never flashes the wrong theme.

**Home page route line** — a soft dashed path connects the chapter cards
in reading order, drawn behind them so it only shows through the gaps.
Recomputes on resize since the grid is responsive; hidden on narrow mobile
widths and for reduced-motion preferences.

**Home page status strip** — shows live document/chapter counts plus how
recently the repo was last updated (e.g. "آخرین بروزرسانی ۲ روز پیش"),
pulled from GitHub's commits API. Silently omits the timestamp if that
call fails, rather than showing broken text.

**Mouse-drawn path + follower (home page)** — moving the mouse leaves a
short trail that fades after about a second, with a small follower that
continuously eases toward it. Clicking a chapter card sets that card's
position as a goal: navigation is held while the follower visibly travels
there, then the real page loads once it arrives (with a timeout safety
net so it can never get stuck). Falls back to instant, ordinary link
clicks for keyboard use, touch devices, and reduced-motion preferences —
never blocks or delays navigation for anyone who can't use a mouse trail.

**No back button on document pages** — documents are your original files,
opened at their own URL with nothing injected into them. The browser's
back button returns to the chapter shelf.

**File order** within a chapter follows alphabetical filename order (how
GitHub's API returns them). Prefix filenames with numbers (`01-`, `02-`…)
to control ordering.

## A note on chapter assignment

The original 12 documents were placed by matching their content against
your `chapter3–6.tex` headings — see prior conversation history for the
specific reasoning if you need to revisit any of them. Everything added
since then (فصل ۶ evaluation diagrams, appendix content, teacher/student
variants, etc.) was organized outside this particular conversation, so
this README doesn't attempt to re-document those placement decisions —
moving any file between chapters is just moving the file to a different
folder, no data to edit anywhere.
