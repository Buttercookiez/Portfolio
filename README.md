# John Francis — An Unfinished Story

A minimalist portfolio told in four aged-paper pages: introduction, about, selected projects, and the next chapter. The black header uses the standalone lowercase jf. logo. The complete logo appears, then its dot bounces from above the j toward the f and into place before moving into the navigation. Scrolling peels each sheet from its lower-right corner, with a curved fold and soft shadow. Text stays fully readable beneath the turning paper.

## Preview

Clone the repository and serve the `dist` directory with Python 3:

```sh
git clone https://github.com/Buttercookiez/Portfolio.git
cd Portfolio
python -m http.server 4174 --directory dist
```

Open [localhost:4174](http://localhost:4174). The site is plain HTML, CSS, and JavaScript with local fonts and libraries. No Node.js installation, package installation, or build step is required.

## Deploy on Vercel

Import [Buttercookiez/Portfolio](https://github.com/Buttercookiez/Portfolio) into Vercel and keep the Root Directory at the repository root. The included `vercel.json` supplies these settings:

| Setting | Value |
| --- | --- |
| Framework Preset | Other (`framework: null`) |
| Output Directory | `dist` |
| Build Command | Empty; skipped |
| Install Command | Empty; skipped |

No environment variables are required. Vercel serves the existing `dist` files directly. These settings follow Vercel's [static project build guidance](https://vercel.com/docs/builds/configure-a-build#skip-build-step) and [configuration reference](https://vercel.com/docs/project-configuration/vercel-json).

## Featured projects

- [Hanap Medisina](https://hanap-medsesinav2.vercel.app/): medicinal plant information and identification.
- [Koki Emulator](https://koki-emulator09.vercel.app/): a simple game library interface.
- [Monovault](https://monovault.vercel.app/): an offline encrypted password manager.

The portfolio's Details buttons also provide each project's GitHub source.

## Source

- `dist/index.html`: four sheets, concise content, contact and resume links. All three main project rows open their live websites directly; separate Details buttons open project notes. The order is the herbal plant app, Koki Emulator, then Monovault.
- `dist/styles.css`: paper texture, layout, original header, responsive and short-screen styles, readable mobile details, restrained project-row feedback, and clear keyboard focus rings.
- `dist/app.js`: GSAP ScrollTrigger and Lenis integration, cached page-turn progress, active chapter navigation, magnetic controls, and project dialogs. There is no word-by-word hiding. Instant navigation exposes the destination before keyboard focus moves, and resizing preserves the current page position. Lenis follows the GSAP ticker with `lagSmoothing(0)` so both use the same wall clock. Each project's Details dialog offers its live website and GitHub source; external links open in a new tab with `noopener noreferrer`.
- `dist/page-turn.js`: the lightweight lower-right corner peel, using the original content and one reflected paper surface with a shared curved fold edge. It has no content clones, canvas, heavy filters, or independent animation loop.
- `dist/opening.js` and `dist/opening.css`: the exact lowercase jf. logo and original period are used throughout. Only the dot's position changes during its bounce, with no stretching or glyph swaps. A short hold precedes the move into the header. Hidden tabs pause the sequence. Escape, Tab, resize, and reduced motion release scroll and focus locks. Click the header logo from any page to return to the beginning and replay.
- `dist/assets/aged-paper.webp`: the paper texture is rasterized once, avoiding live SVG filter rendering. The editable SVG source is retained alongside it.
- `dist/assets/JohnFrancisMarabeResume.docx`: original supplied resume.
- `dist/vendor`: pinned local libraries, fonts, and license information.

There is no visible animation on/off control. The operating system's reduced-motion preference uses ordinary stacked sheets with all text visible and skips decorative motion and the opening. The same document-flow fallback remains available if animation libraries fail to load. Touch scrolling remains native. Viewport changes preserve the reading position. No personal data is collected; email opens the visitor's mail client.
