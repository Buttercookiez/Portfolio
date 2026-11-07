# John Francis — Beyond the Prologue

A Nordic-inspired portfolio for John Francis Marabe. The prologue uses “Go even beyond,” an excerpt from Askeladd’s line in [the official Vinland Saga episode 24 scene guide](https://vinlandsaga.jp/special/best-scene/en/). The portfolio presents three projects, education, and contact in six scenes.

The oversized GO, EVEN, and BEYOND title cards lead into the name reveal. The same type style carries through the project and contact scenes. There is no navigation bar. A single illustrated dagger begins to fall beside the name, stays in frame across the projects, and touches down on the final shore. Its steel carries an engraved coast, and its tip meets an ink shadow and a reflection. The interface uses local Barlow Condensed, Instrument Serif, and Inter fonts, original landscapes, and real previews of the project websites.

## Preview

Serve the `dist` directory with Python 3:

```sh
git clone https://github.com/Buttercookiez/Portfolio.git
cd Portfolio
python -m http.server 4174 --directory dist
```

Open [localhost:4174](http://localhost:4174). This is a static HTML, CSS, and JavaScript site. No dependency installation, build step, or environment variables are required.

## Motion and accessibility

GSAP ScrollTrigger ties the dagger release, rotation, reflections, landing, horizon, and project reveals to scroll position. Lenis smooths wheel scrolling on desktop; touch scrolling stays native. Identity and résumé follow the cinematic prologue; a keyboard skip link can go directly to selected work. Project navigation lands at a fully readable point in each scene.

The brief PRELUDE opening waits for the landscape and fonts, with a readiness deadline and a 4.5-second safety exit. Escape, Tab, resize, hidden tabs, and reduced motion release it immediately. Reduced motion, short screens, and missing animation libraries use a complete ordinary document layout. Keyboard focus reveals hidden actions before they are used.

## Deploy on Vercel

Import [Buttercookiez/Portfolio](https://github.com/Buttercookiez/Portfolio), with the repository root as Root Directory. The included `vercel.json` sets Framework Preset to Other, Output Directory to `dist`, and empty build/install commands. Vercel serves `dist` directly.

## Featured work

- [Hanap Medisina](https://hanap-medsesinav2.vercel.app/)
- [Koki Emulator](https://koki-emulator09.vercel.app/)
- [Monovault](https://monovault.vercel.app/)

Each Visit project link opens the live website. Project notes provide both live and GitHub links. The supplied résumé is downloadable from the name scene.

## Source and artwork

- `dist/index.html` and `styles.css`: the six scenes and responsive visual system.
- `dist/app.js`: the GSAP typography and story clock, Lenis, fragment routing, project dialogs, and email copying.
- `dist/cinema.css`: the full-viewport kinetic typography and navigation-free opening.
- `dist/dagger.js` and `dagger.css`: the continuous descent, responsive composition, and tip-aligned landing effects.
- `dist/assets/prologue-dagger.svg`: the original editable dagger artwork.
- `dist/ink-opening.js` and `ink-opening.css`: the bounded PRELUDE introduction.
- `dist/assets/nordic-horizon.webp` and `nordic-shore.webp`: original AI-generated Nordic background illustrations, optimized for the web.
- `dist/assets/project-herbal.jpg`, `project-koki.jpg`, and `project-monovault.jpg`: previews captured from the featured public project sites on November 7, 2026.
- `dist/vendor`: local fonts, animation libraries, and their licenses.

No personal data is collected. Contact opens the visitor's email client. External links use `noopener noreferrer`.
