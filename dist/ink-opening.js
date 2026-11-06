/* One short ink impression, then two comic shutters open onto the document. */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new AbortController();
  const timers = new Set();
  let overlay = null;
  let finished = false;
  let revealing = false;
  let previousFocus = null;
  let preserved = [];

  function later(callback, duration) {
    const id = setTimeout(() => { timers.delete(id); callback(); }, duration);
    timers.add(id);
    return id;
  }

  function complete() {
    if (finished) return;
    finished = true;
    listeners.abort();
    timers.forEach(clearTimeout);
    timers.clear();
    root.classList.remove('ink-booting', 'ink-revealing');
    overlay?.remove();
    preserved.forEach(({element, inert}) => { if (element.isConnected) element.inert = inert; });
    preserved = [];
    root.dataset.inkOpening = 'done';
    if (previousFocus && previousFocus !== document.body && previousFocus.isConnected) {
      previousFocus.focus({preventScroll: true});
    }
    window.dispatchEvent(new CustomEvent('ink:opening-complete'));
  }

  // A failed stylesheet, slow connection, hidden tab, or interrupted animation
  // must never keep the actual portfolio locked behind the opening.
  if (reduced.matches || document.hidden) {
    complete();
    return;
  }
  root.classList.add('ink-booting');
  root.dataset.inkOpening = 'loading';
  later(complete, 4500);
  const {signal} = listeners;
  addEventListener('keydown', event => {
    if (event.key === 'Escape' || event.key === 'Tab') complete();
  }, {capture: true, signal});
  addEventListener('resize', complete, {signal});
  addEventListener('pagehide', complete, {once: true, signal});
  document.addEventListener('visibilitychange', () => { if (document.hidden) complete(); }, {signal});
  reduced.addEventListener('change', () => { if (reduced.matches) complete(); }, {signal});

  function reveal() {
    if (finished || revealing) return;
    revealing = true;
    root.dataset.inkOpening = 'revealing';
    root.classList.add('ink-revealing');
    overlay.dataset.phase = 'revealing';
    // The curtains use CSS transforms, so no permanent animation ticker is needed.
    later(complete, 880);
  }

  function heroReady() {
    const hero = document.querySelector('.hero-art img');
    if (!hero) return Promise.resolve();
    if (typeof hero.decode === 'function') return hero.decode().catch(() => {});
    if (hero.complete) return Promise.resolve();
    return new Promise(resolve => {
      hero.addEventListener('load', resolve, {once: true, signal});
      hero.addEventListener('error', resolve, {once: true, signal});
    });
  }

  function begin() {
    if (finished) return;
    try {
      previousFocus = document.activeElement;
      preserved = [...document.querySelectorAll('body > header, body > main, body > footer, body > .skip-link')]
        .map(element => ({element, inert: element.inert}));
      preserved.forEach(({element}) => { element.inert = true; });
      overlay = document.createElement('div');
      overlay.className = 'ink-opening';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('role', 'presentation');
      overlay.dataset.phase = 'inking';
      overlay.innerHTML = `
        <div class="ink-opening-curtain ink-opening-curtain--left"></div>
        <div class="ink-opening-curtain ink-opening-curtain--right"></div>
        <div class="ink-opening-content">
          <p class="ink-opening-eyebrow">THE ORIGIN ISSUE</p>
          <div class="ink-opening-emblem">
            <svg class="ink-opening-frame" viewBox="0 0 224 174" fill="none">
              <path d="M4 44 7 5 68 3 M158 5 218 2 221 51 M220 122 217 169 158 171 M65 170 3 172 5 124"/>
              <path class="ink-opening-frame-scar" d="m199 15 12-3-1 27 M14 136l-2 23 21-1"/>
            </svg>
            <svg class="ink-opening-mark" viewBox="0 0 160 120" fill="none">
              <path class="ink-opening-j" pathLength="1" d="M35 27H67V72C67 91 34 94 32 74"/>
              <path class="ink-opening-f" pathLength="1" d="M89 91V27H126M89 56H119"/>
              <path class="ink-opening-period" pathLength="1" d="M128 87h1"/>
            </svg>
            <span class="ink-opening-seal">ISSUE 01</span>
          </div>
          <div class="ink-opening-rule"><span></span></div>
          <p class="ink-opening-note">A STORY, STILL IN THE MAKING.</p>
        </div>`;
      document.body.append(overlay);
      const started = performance.now();
      window.dispatchEvent(new CustomEvent('ink:opening-start'));
      const assets = Promise.all([heroReady(), document.fonts?.ready || Promise.resolve()]);
      const boundedAssets = Promise.race([assets, new Promise(resolve => later(resolve, 1800))]);
      boundedAssets.then(() => {
        if (finished) return;
        overlay.dataset.ready = 'true';
        later(reveal, Math.max(0, 1000 - (performance.now() - started)));
      }).catch(complete);
    } catch {
      complete();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', begin, {once: true, signal});
  else begin();
})();
