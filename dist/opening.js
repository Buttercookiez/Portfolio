/* Bounce the unchanged period of the real navigation logo, then dock the whole mark. */
(() => {
  'use strict';

  function play({ enabled = true, onStart = () => {}, onComplete = () => {} } = {}) {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const gsap = window.gsap;
    const source = document.querySelector('.wordmark');
    const previousFocus = document.activeElement;
    let completed = false;

    function completeCallback() {
      if (completed) return;
      completed = true;
      document.documentElement.dataset.opening = 'done';
      document.documentElement.dataset.openingPhase = 'done';
      try { onComplete(); } finally { resolve(); }
    }

    if (!enabled || reduced.matches || !gsap || !source) {
      completeCallback();
      return { skip() {}, destroy() {}, promise };
    }

    const blocked = [...document.querySelectorAll('header, main, .skip-link')]
      .map(element => ({ element, inert: element.inert }));
    const overlay = document.createElement('div');
    overlay.className = 'opening-screen';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('role', 'presentation');
    const shade = document.createElement('div');
    shade.className = 'opening-shade';
    overlay.append(shade);
    document.body.append(overlay);
    document.body.classList.add('intro-active');
    document.documentElement.dataset.opening = 'playing';
    blocked.forEach(({ element }) => { element.inert = true; });

    let finished = false;
    let started = false;
    let fontsReady = false;
    let timeline = null;
    let restoreFocus = true;
    let requiredFont = '';
    const safety = { remaining: 5500, stamp: null, timer: null };
    const fontDeadline = { remaining: 1200, stamp: null, timer: null };

    function phase(value) {
      overlay.dataset.phase = value;
      document.documentElement.dataset.openingPhase = value;
    }
    function pauseBudget(budget) {
      clearTimeout(budget.timer);
      budget.timer = null;
      if (budget.stamp !== null) {
        budget.remaining = Math.max(0, budget.remaining - (performance.now() - budget.stamp));
        budget.stamp = null;
      }
    }
    function startBudget(budget, callback) {
      if (finished || document.hidden || budget.timer !== null) return;
      budget.stamp = performance.now();
      budget.timer = setTimeout(() => {
        pauseBudget(budget);
        if (!finished) callback();
      }, Math.max(0, budget.remaining));
    }
    function fontTimeout() {
      if (fontsReady) return;
      // A resolved font is still safe to use if its promise callback was delayed.
      if (document.fonts?.check(requiredFont)) {
        fontsReady = true;
        run();
      } else finish();
    }

    function finish() {
      if (finished) return;
      finished = true;
      pauseBudget(safety);
      pauseBudget(fontDeadline);
      timeline?.kill();
      document.removeEventListener('keydown', key, true);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('resize', finish);
      reduced.removeEventListener('change', preference);
      overlay.remove();
      blocked.forEach(({ element, inert }) => { if (element.isConnected) element.inert = inert; });
      document.body.classList.remove('intro-active');
      try {
        completeCallback();
      } finally {
        if (restoreFocus && previousFocus && previousFocus !== document.body && previousFocus.isConnected) {
          previousFocus.focus({ preventScroll: true });
        }
      }
    }

    function key(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        finish();
      } else if (event.key === 'Tab') {
        // Restore the document synchronously, then allow normal Tab navigation.
        restoreFocus = false;
        finish();
      }
    }
    function preference() { if (reduced.matches) finish(); }
    function visibility() {
      if (document.hidden) {
        timeline?.pause();
        pauseBudget(safety);
        pauseBudget(fontDeadline);
      } else {
        startBudget(safety, finish);
        if (!fontsReady) startBudget(fontDeadline, fontTimeout);
        if (started) timeline?.resume();
        else run();
      }
    }

    document.addEventListener('keydown', key, true);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('resize', finish, { passive: true });
    reduced.addEventListener('change', preference);
    phase('fonts');
    // Both deadlines count visible time; background tabs retain their opening.
    startBudget(safety, finish);

    function run() {
      if (finished || started || !fontsReady || document.hidden) return;
      started = true;
      pauseBudget(fontDeadline);
      try {
        const rect = source.getBoundingClientRect();
        const computed = getComputedStyle(source);
        const mark = document.createElement('span');
        mark.className = 'opening-mark';
        const base = document.createElement('span');
        base.className = 'opening-base';
        base.innerHTML = source.innerHTML;
        base.querySelector('.wordmark-label')?.remove();
        mark.append(base);
        mark.setAttribute('aria-hidden', 'true');
        ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight',
          'fontFeatureSettings', 'fontVariationSettings'].forEach(property => {
          mark.style[property] = computed[property];
        });
        mark.style.left = `${rect.left}px`;
        mark.style.top = `${rect.top}px`;
        overlay.append(mark);
        const native = mark.getBoundingClientRect();
        // Animate the real inline period. The logo's letters and spacing never
        // change, and there is no second glyph or handoff during the bounce.
        const dot = base.querySelector('.wordmark-dot');
        if (!dot) throw new Error('The opening needs the navigation period.');
        const spacing = parseFloat(computed.letterSpacing) || 0;
        const center = bounds => bounds.left - native.left + (bounds.width - spacing) / 2;
        const letterCenters = [];
        const walker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (dot.contains(node)) continue;
          for (let index = 0; index < node.textContent.length; index++) {
            if (!node.textContent[index].trim()) continue;
            const range = document.createRange();
            range.setStart(node, index);
            range.setEnd(node, index + 1);
            letterCenters.push(center(range.getBoundingClientRect()));
          }
        }
        if (letterCenters.length !== 2) throw new Error('The opening needs the navigation letters.');
        const dotRange = document.createRange();
        dotRange.selectNodeContents(dot);
        const dotCenter = center(dotRange.getBoundingClientRect());
        const scale = Math.min(innerWidth < 600 ? 3.8 : 5,
          Math.max(2.8, (innerWidth - 100) / Math.max(1, native.width)));
        const x = innerWidth / 2 - native.width * scale / 2 - rect.left;
        const y = innerHeight / 2 - native.height * scale / 2 - rect.top;
        const aboveJ = letterCenters[0] - dotCenter;
        const aboveF = letterCenters[1] - dotCenter;
        // Contact the upper ink edges rather than merging two dots or the f bar.
        const contactJ = -native.height * .74;
        const contactF = -native.height * .80;
        dot.classList.add('opening-dot');
        dot.dataset.bounce = 'waiting';
        dot.style.opacity = '0';
        const flight = { t: 0 };
        const pointOnArc = (t, fromX, toX, fromY, toY, lift) => ({
          x: fromX + (toX - fromX) * t,
          y: fromY + (toY - fromY) * t - 4 * lift * t * (1 - t)
        });
        function drawDot(time) {
          let point = { x: aboveJ, y: -native.height * 1.10 };
          let state = 'above-j';
          if (time >= 1.52) {
            point = { x: 0, y: 0 }; state = 'settled';
          } else if (time >= .97) {
            point = pointOnArc((time - .97) / .55, aboveF, 0, contactF, 0, native.height * .40);
            state = 'rebound';
          } else if (time >= .93) {
            point = { x: aboveF, y: contactF }; state = 'impact-f';
          } else if (time >= .44) {
            point = pointOnArc((time - .44) / .49, aboveJ, aboveF, contactJ, contactF, native.height * .32);
            state = 'rebound';
          } else if (time >= .40) {
            point = { x: aboveJ, y: contactJ }; state = 'impact-j';
          } else if (time >= .14) {
            const t = (time - .14) / .26;
            point.y += (contactJ + native.height * 1.10) * t * t;
            state = 'drop';
          }
          // One owner writes translation only; no squash, rotation, or glyph swap.
          dot.style.transform = `translate3d(${point.x.toFixed(3)}px,${point.y.toFixed(3)}px,0)`;
          if (dot.dataset.bounce !== state) dot.dataset.bounce = state;
        }
        drawDot(0);
        dot.dataset.bounce = 'waiting';
        gsap.set(base, { opacity: 0 });
        gsap.set(mark, { x, y, scale, opacity: 1, transformOrigin: '0 0' });
        phase('reveal');
        timeline = gsap.timeline({ onComplete: finish });
        timeline
          .to(base, { opacity: 1, duration: .25, ease: 'power1.out' }, .05)
          .call(() => { dot.style.opacity = '1'; drawDot(0); phase('bounce'); }, [], .34)
          .to(flight, { t: 1.52, duration: 1.52, ease: 'none', onUpdate: () => drawDot(flight.t) }, .34)
          .call(() => { drawDot(1.52); phase('hold'); }, [], 1.86)
          .call(() => { phase('dock'); }, [], 2.30)
          .to(mark, { x: 0, y: 0, scale: 1, duration: .90, ease: 'power3.inOut' }, 2.30)
          .to(shade, { opacity: 0, duration: .80, ease: 'power2.inOut' }, 2.40);
      } catch (error) {
        finish();
        console.info('Introduction skipped; the portfolio is ready.', error);
      }
    }

    try {
      onStart();
      // Measure only after the actual header font is ready, so docking is exact.
      const computed = getComputedStyle(source);
      requiredFont = `${computed.fontStyle} ${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
      if (document.fonts) {
        startBudget(fontDeadline, fontTimeout);
        document.fonts.load(requiredFont).then(() => {
          fontsReady = true;
          pauseBudget(fontDeadline);
          run();
        }, finish);
      } else { fontsReady = true; run(); }
    } catch (error) { finish(); }

    return { skip: finish, destroy: finish, promise };
  }

  window.PortfolioOpening = { play };
})();
