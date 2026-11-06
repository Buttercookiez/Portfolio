# John Francis — One Panel at a Time

A minimalist developer portfolio that unfolds in six scenes: introduction, Hanap Medisina, Koki Emulator, Monovault, about, and contact. Dark ink, quiet space, and original manga illustrations carry the story. Information appears one piece at a time as the reader scrolls.

GSAP ScrollTrigger controls the illustrated panel transitions and staged text. Lenis smooths desktop wheel scrolling, while touch scrolling stays native. A small scene counter tracks the reading position. Reduced motion, short screens, or unavailable animation libraries use a readable document layout. The JF ink-and-stamp opening remains bounded and can release immediately on keyboard interruption or resize.

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

Each project has its own scene. The Visit project link opens its website; Details opens project notes with both the website and GitHub source. The résumé is available from the header.

## Active source

- `dist/index.html`: six semantic scenes, concise content, navigation, project links, and the project dialog.
- `dist/styles.css`: minimalist scene layout, responsive typography, mobile navigation, and focus states.
- `dist/app.js`: GSAP scene timelines, Lenis integration, navigation, project dialogs, and email copying.
- `dist/ink-opening.js` and `ink-opening.css`: the JF ink-and-stamp opening and diagonal shutters.
- `dist/assets/ink-workshop.webp`: introductory artwork.
- `dist/assets/ink-herbal.webp`, `ink-koki.webp`, and `ink-monovault.webp`: individual project illustrations.
- `dist/assets/favicon.svg` and `dist/favicon.ico`: the JF browser-tab monogram.
- `dist/assets/JohnFrancisMarabeResume.docx`: the original supplied résumé.
- `dist/vendor`: local fonts, animation libraries, and license files.

No personal data is collected. Email links open the visitor’s mail client. External project and source links open in a new tab with `noopener noreferrer`.
