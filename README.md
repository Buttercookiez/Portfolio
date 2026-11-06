# John Francis — The Origin Issue

A developer portfolio told as an ink-and-paper comic. Bold chapter headings, angular panels, original illustrations, and a restrained red accent frame the story: curiosity, selected work, the person, and the next chapter.

The Living Manga edition pairs a darker cover and ink chapters with light project pages. A drawn JF mark and red issue stamp open through diagonal shutters. Natural scrolling controls the split chapter gutters, angled artwork reveals, and gentle illustration depth. Project sigils respond to hover or the “Awaken panel” button; their animation stops outside the viewport and in hidden tabs.

The opening waits for the cover artwork and fonts, has a short readiness deadline and a 4.5-second safety exit, and releases immediately on keyboard interruption, resize, or reduced motion. The layout adapts to mobile with native touch scrolling. The operating system’s reduced-motion preference removes decorative movement. Project websites, source repositories, contact information, and the downloadable résumé remain easy to reach.

## Preview

Serve the `dist` directory with Python 3:

```sh
git clone https://github.com/Buttercookiez/Portfolio.git
cd Portfolio
python -m http.server 4174 --directory dist
```

Open [localhost:4174](http://localhost:4174). The site is plain HTML, CSS, and JavaScript. Fonts and animation libraries are local; no Node.js installation, dependency installation, environment variables, or build step is required.

## Deploy on Vercel

Import [Buttercookiez/Portfolio](https://github.com/Buttercookiez/Portfolio) into Vercel and keep the Root Directory at the repository root. The included `vercel.json` supplies:

| Setting | Value |
| --- | --- |
| Framework Preset | Other (`framework: null`) |
| Output Directory | `dist` |
| Build Command | Empty; skipped |
| Install Command | Empty; skipped |

Vercel serves the existing `dist` files directly.

## Featured projects

1. [Hanap Medisina](https://hanap-medsesinav2.vercel.app/): offline medicinal plant information and identification.
2. [Koki Emulator](https://koki-emulator09.vercel.app/): a simple interface for a game library.
3. [Monovault](https://monovault.vercel.app/): an offline, encrypted home for personal information.

Each project’s Details button opens field notes with its website and GitHub source links.

## Active source

- `dist/index.html`: semantic chapters, navigation, project links, contact actions, and project dialog.
- `dist/styles.css`: comic-panel layout, responsive typography, ink texture, mobile navigation, and accessible focus states.
- `dist/app.js`: scrolling, panel reveals, navigation, project dialogs, and email copying.
- `dist/ink-opening.js` and `ink-opening.css`: the bounded JF ink-and-stamp opening and diagonal shutters.
- `dist/living.js` and `living.css`: scroll-driven chapter cuts, artwork depth, and activated project sigils.
- `dist/assets/ink-workshop.webp`: cover artwork.
- `dist/assets/ink-herbal.webp`, `ink-koki.webp`, and `ink-monovault.webp`: illustrated project panels.
- `dist/assets/favicon.svg` and `dist/favicon.ico`: the JF browser-tab monogram.
- `dist/assets/JohnFrancisMarabeResume.docx`: the original supplied résumé.
- `dist/vendor`: local fonts, animation libraries, and license files.

No personal data is collected. Email links open the visitor’s mail client. External project and source links open in a new tab with `noopener noreferrer`.
