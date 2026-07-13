# نقشه‌راه — Thesis Interactive Archive

## Adding a document now takes one step

Drop the exported `.html` file into the right `chapters/<id>/` folder and
push. That's it — no file to edit, nothing else to touch.

```
chapters/ch5/your-new-file.html
```

**For the tile preview image**, add an image with the exact same filename
(just a different extension) right next to it:

```
chapters/ch5/your-new-file.html
chapters/ch5/your-new-file.png     ← same name, this is the tile thumbnail
```

`.png`, `.jpg`/`.jpeg`, `.webp`, `.svg`, and `.gif` are all recognized — use
whichever you already have. No image yet? The tile still shows up, just
with a plain placeholder ("بدون تصویر پیش‌نمایش") instead of a broken image,
so nothing looks broken while you're getting the screenshot ready.

The site reads the actual contents of each `chapters/<id>/` folder at
runtime (via the GitHub API) and builds the tile automatically:

- **Title** — taken from the file's own `<title>` tag.
- **Language badge (فارسی/EN)** — detected from `<html lang="...">`.
- **Preview image** — the same-name image sitting beside it, as above.
- **Subtitle (optional)** — if you want one, add this one line inside
  your file's `<head>`, otherwise the tile just omits it:
  ```html
  <meta name="tile-subtitle" content="یک جملهٔ کوتاه دربارهٔ این سند">
  ```

Delete a file from the folder and it disappears from the site on next
load — nothing to clean up elsewhere either.

## Photo albums (like calibration photos)

For a set of plain photos rather than one interactive document, there's a
reusable album template already set up at
`chapters/appendix/calibration-photos.html`. It works the same
auto-discovery way as everything else:

```
chapters/appendix/calibration-photos.html      ← the album page (already built)
chapters/appendix/calibration-photos/          ← put your photos in here
  img1.jpg
  img2.jpg
  ...
```

Drop your calibration photos into that `calibration-photos/` folder and
push — the page lists whatever's inside it automatically (same image
formats as everywhere else: png/jpg/jpeg/webp/svg/gif), shown as a grid
that opens into a full-screen viewer with next/previous on click. The
album shows up as a normal tile in the Appendix shelf, same as any other
document — it just needs a same-name cover image in `chapters/appendix/`
(e.g. `calibration-photos.jpg`, copy one of the photos) if you want a real
thumbnail instead of the placeholder.

**Want another photo album later** (a different chapter, a different
topic)? Copy `calibration-photos.html` to a new filename in the target
chapter folder, change its `<title>` and `<meta name="tile-subtitle">` —
nothing else. It auto-detects which chapter it's in and which subfolder to
read from its own URL, so no other edit is needed.

## How this works (worth understanding before you deploy)

Plain static hosting (GitHub Pages included) can't list "what files are in
this folder" on its own — there's no server-side code running. So the site
asks **GitHub's API** directly, from the visitor's browser, the moment a
chapter page loads: *"what's inside chapters/ch5/ right now?"* GitHub
answers with the live file list, and the page builds itself from that.

This means:
- **It only works once the site is actually live on GitHub Pages** (or any
  URL where the repo owner/name can be determined — see below). Opening
  `index.html` locally by double-clicking it won't show any documents,
  since there's no GitHub URL to ask.
- **It needs the repo to be public.** The GitHub API contents endpoint
  used here only works unauthenticated for public repos.
- **GitHub's API allows 60 requests/hour per visitor IP** (unauthenticated).
  Loading the home page uses 6 of those (one per chapter, just to get
  counts); opening a chapter page uses 1 more. For a thesis defense
  audience this is very unlikely to be an issue — it would take heavy,
  repeated navigating within the same hour from the same network to hit
  it. If it ever does happen, visitors just see a friendly "try again in a
  few minutes" message instead of a broken page.

## Repo detection

The site figures out your GitHub username/repo automatically from the page
URL — nothing to configure for a normal GitHub Pages setup
(`https://<user>.github.io/<repo>/`). The only time you'd need to touch
anything is a **custom domain**, where that can't be inferred from the
URL. In that case, open `data.js` and fill in:
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

Then on GitHub: **Settings → Pages → Build and deployment → Source: Deploy
from a branch → Branch: `main` / `(root)` → Save**. Also double check
**Settings → General → the repo is Public** (required for the API calls
above to work without authentication). Live in a minute or two at
`https://<your-username>.github.io/<repo-name>/`.

## How it's organized

```
index.html        home page (chapter cards, counts fetched live)
style.css           shared styles for every page
data.js              the 6 fixed chapter sections + repo settings (rarely touched)
discover.js           shared GitHub folder-listing helper (used by gallery.js and photo albums)
gallery.js           discovery + rendering logic for chapter shelves
generate.py           optional — only needed if you add a whole new chapter/section

chapters/
  ch3/index.html                    (فصل ۳ — currently empty)
  ch4/index.html
  ch4/*.html                        ← your files, straight in the folder
  ch5/index.html
  ch5/*.html
  ch6/index.html                    (currently empty)
  appendix/index.html
  appendix/calibration-photos.html  ← photo album template (see above)
  appendix/calibration-photos/      ← put calibration photos here
  extra/index.html                  (currently empty)
```

Adding a whole **new chapter/section** (not just a new document in an
existing one) needs one edit: add it to the `CHAPTERS` array in `data.js`
(for the home page card) and in `generate.py`, then run
`python3 generate.py` once to stamp out that chapter's `index.html`.

## How chapters were assigned

Based on matching each diagram's content against your actual `chapter3–6.tex`
headings:

| Chapter | Documents |
|---|---|
| فصل ۳ | *(none yet — theoretical RL/MDP framework)* |
| فصل ۴ — طراحی و شبیه‌سازی | ابرنقاط، حلقهٔ تعامل کنشگر و محیط، خط لولهٔ پردازش استریو، مقایسهٔ Skid-Steering، درخت TF |
| فصل ۵ — پیاده‌سازی عملی | AprilTag، دریافت تصویر استریو، دقت عمق، مقایسهٔ Yaw، توان و الکترونیک، معماری حسگری-کنترلی، استخراج Y |
| فصل ۶ / پیوست‌ها / موارد اضافی | *(empty for now)* |

**desk-quat-yaw** and the **stereo-vision-pipeline** vs
**acquisition-pipeline** split were judgment calls — worth double-checking.
Moving a file between chapters now is just moving the file to a different
folder — no data to edit anywhere.

## UI details

- **Document tiles are a 3D perspective shelf**: tiles stand at an angle
  like books on a shelf. Hovering one turns it to face you and lifts it
  forward while its two neighbors slide apart to make room; the rest of
  the row dims. Clicking animates the tile growing to fill the screen,
  then navigates to that file's own URL.
- **Tile previews are static images** (the same-name file next to each
  `.html`) — fast to load and consistent, since nothing needs to render
  live to produce a thumbnail.
- Chapters with more documents than fit on screen scroll horizontally.
- **No back button on the document pages** — since documents are your
  original files opened at their own URL, nothing is injected into them.
  The browser's back button returns to the chapter shelf. Say the word if
  you'd like an on-page "back to shelf" link added later.
- File order within a chapter follows alphabetical filename order (that's
  what GitHub's API returns them in). Prefix filenames with numbers
  (`01-`, `02-`...) if you want to control the order later.
