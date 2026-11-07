/* A brief prelude; the actual story remains the loading fallback. */
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
    preserved.forEach(({ element, inert }) => { if (element.isConnected) element.inert = inert; });
    preserved = [];
    root.dataset.inkOpening = 'done';
    if (previousFocus && previousFocus !== document.body && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    window.dispatchEvent(new CustomEvent('ink:opening-complete'));
  }
  if (reduced.matches || document.hidden) { complete(); return; }
  root.classList.add('ink-booting');
  root.dataset.inkOpening = 'loading';
  later(complete, 4500);
  const { signal } = listeners;
  addEventListener('keydown', event => { if (event.key === 'Escape' || event.key === 'Tab') complete(); }, { capture: true, signal });
  addEventListener('resize', complete, { signal });
  addEventListener('pagehide', complete, { once: true, signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) complete(); }, { signal });
  reduced.addEventListener('change', () => { if (reduced.matches) complete(); }, { signal });

  function reveal() {
    if (finished || revealing) return;
    revealing = true;
    root.dataset.inkOpening = 'revealing';
    root.classList.add('ink-revealing');
    overlay.dataset.phase = 'revealing';
    later(complete, 370);
  }
  function heroReady() {
    const hero = document.querySelector('.hero-landscape img, .hero-art img');
    if (!hero) return Promise.resolve();
    if (typeof hero.decode === 'function') return hero.decode().catch(() => {});
    if (hero.complete) return Promise.resolve();
    return new Promise(resolve => {
      hero.addEventListener('load', resolve, { once: true, signal });
      hero.addEventListener('error', resolve, { once: true, signal });
    });
  }
  function begin() {
    if (finished) return;
    try {
      previousFocus = document.activeElement;
      preserved = [...document.querySelectorAll('body > header, body > main, body > footer, body > .skip-link')]
        .map(element => ({ element, inert: element.inert }));
      preserved.forEach(({ element }) => { element.inert = true; });
      overlay = document.createElement('div');
      overlay.className = 'ink-opening';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('role', 'presentation');
      overlay.dataset.phase = 'prelude';
      overlay.innerHTML = `
        <p class="opening-prelude">PRELUDE</p>
        <div class="opening-mist-line"><span></span></div>`;
      document.body.append(overlay);
      const started = performance.now();
      window.dispatchEvent(new CustomEvent('ink:opening-start'));
      const assets = Promise.all([heroReady(), document.fonts?.ready || Promise.resolve()]);
      const bounded = Promise.race([assets, new Promise(resolve => later(resolve, 1600))]);
      bounded.then(() => {
        if (finished) return;
        overlay.dataset.ready = 'true';
        later(reveal, Math.max(0, 450 - (performance.now() - started)));
      }).catch(complete);
    } catch { complete(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', begin, { once: true, signal });
  else begin();
})();
