/* Six quiet frames. The scroll position is the animation clock. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const desktop = matchMedia('(min-width: 761px)');
  const tall = matchMedia('(min-height: 640px)');
  const mobile = matchMedia('(max-width: 760px)');
  const scenes = $$('[data-story]');
  const navigation = $('#site-nav');
  const menuToggle = $('.menu-toggle');
  const navLinks = $$('.site-nav a[href^="#"]');
  const readingTrack = $('.reading-progress > span');
  const positionLabel = $('.story-position');
  const chapterLabel = $('.story-label');
  const dialog = $('#project-dialog');
  const toastElement = $('.toast');
  const fullClip = 'inset(-16px -16px -16px -16px)';
  let lenis = null;
  let lenisTick = null;
  let readerContext = null;
  let records = [];
  let bounds = [];
  let enhanced = false;
  let readingFrame = 0;
  let resizeTimer = 0;
  let currentScene = -1;
  let lastProgress = '';
  let projectOpener = null;
  let toastTimer = 0;
  let routing = false;
  let initialRoutePending = true;

  const clamp = value => Math.max(0, Math.min(1, value));
  const headerHeight = () => $('.site-header')?.offsetHeight || 72;

  if (gsap) gsap.ticker.lagSmoothing(0);
  if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  function synchronizeScrollLock() {
    const blocked = document.hidden || document.documentElement.classList.contains('ink-booting') ||
      document.body.classList.contains('menu-open') || Boolean(dialog?.open);
    document.body.classList.toggle('dialog-open', Boolean(dialog?.open));
    if (blocked) lenis?.stop();
    else lenis?.start();
  }

  function setMenu(open, restoreFocus = false) {
    const expanded = Boolean(open && mobile.matches);
    document.body.classList.toggle('menu-open', expanded);
    menuToggle?.setAttribute('aria-expanded', String(expanded));
    menuToggle?.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
    if (navigation) navigation.inert = mobile.matches && !expanded;
    synchronizeScrollLock();
    if (restoreFocus && mobile.matches) menuToggle?.focus();
  }
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
    if (open) $('a', navigation)?.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false, true);
  });
  document.addEventListener('click', event => {
    if (document.body.classList.contains('menu-open') && !event.target.closest('.site-header')) setMenu(false);
  });
  document.addEventListener('focusin', event => {
    if (document.body.classList.contains('menu-open') && !event.target.closest('.site-header')) setMenu(false);
  });
  mobile.addEventListener('change', () => setMenu(false));
  setMenu(false);

  function measureScenes() {
    bounds = scenes.map(scene => ({
      top: scene.getBoundingClientRect().top + scrollY,
      bottom: scene.getBoundingClientRect().bottom + scrollY
    }));
  }

  function updateReading() {
    readingFrame = 0;
    const range = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = clamp(scrollY / range).toFixed(4);
    if (readingTrack && progress !== lastProgress) {
      readingTrack.style.transform = 'scaleX(' + progress + ')';
      lastProgress = progress;
    }
    const threshold = scrollY + Math.max(headerHeight() + 18, innerHeight * .32);
    let next = 0;
    bounds.forEach((bound, index) => { if (bound.top <= threshold) next = index; });
    if (next !== currentScene && scenes[next]) {
      currentScene = next;
      const scene = scenes[next];
      scenes.forEach((element, index) => element.classList.toggle('scene-current', index === next));
      if (positionLabel) positionLabel.textContent = String(next + 1).padStart(2, '0') + ' / ' + String(scenes.length).padStart(2, '0');
      if (chapterLabel) chapterLabel.textContent = scene.dataset.label || '';
      navLinks.forEach(link => {
        if (link.hash === '#' + scene.dataset.nav) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }
  function queueReading() {
    if (!readingFrame) readingFrame = requestAnimationFrame(updateReading);
  }
  addEventListener('scroll', queueReading, { passive: true });

  function scrollToPosition(y, immediate = true) {
    const target = Math.max(0, y);
    if (lenis) lenis.scrollTo(target, { immediate, force: true, duration: immediate ? 0 : .95 });
    else window.scrollTo({ top: target, behavior: immediate || reduced.matches ? 'auto' : 'smooth' });
    if (immediate) ScrollTrigger?.update();
    queueReading();
  }

  function jumpScene(scene, progress = .66, immediate = true) {
    if (!scene) return;
    const record = records.find(item => item.scene === scene);
    const y = enhanced && record
      ? record.trigger.start + (record.trigger.end - record.trigger.start) * clamp(progress)
      : scene.getBoundingClientRect().top + scrollY - headerHeight() - 18;
    routing = true;
    scrollToPosition(y, immediate);
    if (immediate && record) {
      record.timeline.progress(clamp(progress));
      record.trigger.getTween?.()?.progress(1);
    }
    requestAnimationFrame(() => { routing = false; queueReading(); });
  }

  function routeHash(hash = location.hash, immediate = true) {
    if (!hash || hash === '#top' || hash === '#intro') {
      scrollToPosition(0, immediate);
      if (immediate && records[0]) {
        records[0].timeline.progress(0);
        records[0].trigger.getTween?.()?.progress(1);
      }
      return;
    }
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    if (id === 'main') {
      scrollToPosition(0, true);
      $('#main')?.focus({ preventScroll: true });
      return;
    }
    const scene = scenes.find(element => element.id === id);
    if (scene) jumpScene(scene, .66, immediate);
  }

  function revealInk(timeline, element, at, duration = .15) {
    if (!element) return;
    timeline.fromTo(element,
      { opacity: 0, y: 15, clipPath: () => 'inset(-16px ' + (element.offsetWidth + 16) + 'px -16px -16px)' },
      { opacity: 1, y: 0, clipPath: fullClip, duration, ease: 'power2.out' }, at);
  }

  function createSceneTimeline(scene, index) {
    const intro = index === 0;
    const finalScene = index === scenes.length - 1;
    const art = $('.scene-art', scene);
    const image = $('.scene-art img', scene);
    const title = $('.scene-title', scene);
    const kicker = $('.scene-kicker', scene);
    const description = $('.scene-description', scene);
    const actions = $('.scene-actions', scene);
    const note = $('.project-note,.education-note,.resume-link', scene);
    const surname = $('.hero-surname', scene);
    const line = $('.scene-line', scene);
    const wipe = $('.scene-wipe', scene);
    const mark = $('.about-mark', scene);
    const cue = $('.scene-scroll-cue', scene);
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene,
        start: intro ? () => 'top top+=' + headerHeight() : 'top 75%',
        end: 'bottom bottom',
        scrub: .32,
        invalidateOnRefresh: true,
        onRefresh: queueReading
      }
    });
    // A tiny end marker keeps every scene on a consistent 0..1 clock.
    timeline.to({}, { duration: .001 }, .999);
    if (kicker) revealInk(timeline, kicker, intro ? .02 : .04, .12);
    if (surname) revealInk(timeline, surname, .05, .12);
    if (intro && title) timeline.to(title, { y: -9, duration: .58, ease: 'power1.inOut' }, .08);
    else revealInk(timeline, title, .16, .16);
    revealInk(timeline, description, intro ? .23 : .33, .14);
    revealInk(timeline, actions, .47, .12);
    revealInk(timeline, note, .56, .1);
    if (art) {
      timeline.fromTo(art,
        { clipPath: intro ? 'polygon(44% 0%,50% 0%,56% 100%,50% 100%)' : 'polygon(0% 0%,0% 0%,-26% 100%,0% 100%)', opacity: 0 },
        { clipPath: 'polygon(0% 0%,100% 0%,100% 100%,0% 100%)', opacity: 1, duration: intro ? .32 : .25, ease: 'power2.inOut' }, intro ? .1 : .02);
    }
    if (image) {
      timeline.fromTo(image, { scale: 1.12, xPercent: 4 }, { scale: 1.01, xPercent: 0, duration: .42, ease: 'power1.out' }, .02);
      if (!finalScene) timeline.to(image, { scale: 1.045, yPercent: -3, duration: .14, ease: 'power1.inOut' }, .86);
    }
    if (mark) timeline.fromTo(mark, { opacity: 0, x: 35 }, { opacity: .13, x: 0, duration: .35 }, .08);
    if (line) timeline.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: .74 }, .02);
    if (cue) timeline.to(cue, { opacity: 0, y: -6, duration: .12 }, .03);
    if (wipe) {
      gsap.set(wipe, { xPercent: 130 });
      if (!finalScene) timeline.to(wipe, { xPercent: -300, duration: .14, ease: 'power2.inOut' }, .86);
    }
    records.push({ scene, timeline, trigger: timeline.scrollTrigger });
  }

  function snapshotReadingPosition() {
    let index = 0;
    const threshold = scrollY + Math.max(headerHeight() + 18, innerHeight * .32);
    bounds.forEach((bound, candidate) => { if (bound.top <= threshold) index = candidate; });
    const scene = scenes[index];
    const record = records.find(item => item.scene === scene);
    return { scene, progress: record ? record.trigger.progress : .66 };
  }

  function configureReader(preserve = false) {
    const saved = preserve ? snapshotReadingPosition() : null;
    readerContext?.revert();
    readerContext = null;
    records = [];
    document.body.classList.remove('story-enhanced');
    enhanced = Boolean(gsap && ScrollTrigger && !reduced.matches && tall.matches && scenes.length);
    if (enhanced) {
      try {
        document.body.classList.add('story-enhanced');
        readerContext = gsap.context(() => scenes.forEach(createSceneTimeline));
      } catch {
        readerContext?.revert();
        readerContext = null;
        records.forEach(record => { record.trigger?.kill(); record.timeline?.kill(); });
        records = [];
        enhanced = false;
        document.body.classList.remove('story-enhanced');
        gsap.set($$('.scene-art,.scene-art img,[data-ink],.scene-title,.scene-line,.scene-wipe,.scene-scroll-cue,.about-mark'), { clearProps: 'transform,opacity,clipPath' });
      }
    }
    ScrollTrigger?.refresh();
    measureScenes();
    if (saved?.scene) jumpScene(saved.scene, saved.progress, true);
    queueReading();
  }

  function configureSmoothScroll() {
    if (lenisTick && gsap) gsap.ticker.remove(lenisTick);
    lenisTick = null;
    lenis?.destroy();
    lenis = null;
    if (reduced.matches || !fine.matches || !desktop.matches || !window.Lenis || !gsap) return;
    try {
      lenis = new window.Lenis({
        autoRaf: false, smoothWheel: true, syncTouch: false, lerp: .11, anchors: false,
        prevent: node => Boolean(node.closest('dialog,[data-lenis-prevent]'))
      });
      lenis.on('scroll', () => { ScrollTrigger?.update(); queueReading(); });
      lenisTick = time => lenis?.raf(time * 1000);
      gsap.ticker.add(lenisTick);
      synchronizeScrollLock();
    } catch {
      lenis?.destroy();
      lenis = null;
      lenisTick = null;
    }
  }

  function refreshReader() {
    lenis?.resize();
    ScrollTrigger?.refresh();
    measureScenes();
    queueReading();
  }

  // Keyboard users can enter any scene directly. A focused action is never
  // left behind an unrevealed mask or the outgoing page's ink shutter.
  document.addEventListener('focusin', event => {
    if (routing || !enhanced || dialog?.open) return;
    const scene = event.target.closest('[data-story]');
    if (!scene || !event.target.closest('a,button,input,select,textarea')) return;
    const record = records.find(item => item.scene === scene);
    if (record && (record.trigger.progress < .61 || record.trigger.progress > .84)) jumpScene(scene, .66, true);
  });

  $$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const hash = link.hash;
    if (!hash || !(hash === '#top' || hash === '#main' || scenes.some(scene => '#' + scene.id === hash))) return;
    event.preventDefault();
    setMenu(false);
    if (location.hash !== hash) history.pushState(null, '', hash);
    routeHash(hash, true);
    const targetScene = hash === '#top' || hash === '#intro'
      ? scenes[0]
      : scenes.find(scene => '#' + scene.id === hash);
    const heading = targetScene && $('h1,h2', targetScene);
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }));
  addEventListener('popstate', () => routeHash(location.hash, true));
  addEventListener('hashchange', () => routeHash(location.hash, true));
  addEventListener('scroll', () => { if (!bounds.length) measureScenes(); }, { passive: true });
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(refreshReader, 160);
    queueReading();
  }, { passive: true });
  addEventListener('pageshow', () => { synchronizeScrollLock(); refreshReader(); });
  document.addEventListener('visibilitychange', synchronizeScrollLock);
  [reduced, tall].forEach(query => query.addEventListener('change', () => {
    configureReader(true);
    configureSmoothScroll();
  }));
  [fine, desktop].forEach(query => query.addEventListener('change', configureSmoothScroll));
  addEventListener('ink:opening-start', synchronizeScrollLock);
  addEventListener('ink:opening-complete', () => {
    synchronizeScrollLock();
    refreshReader();
    if (initialRoutePending) {
      routeHash(location.hash, true);
      initialRoutePending = false;
    }
  });

  const projects = {
    herbal: {
      number: 'PLANT IDENTIFICATION',
      title: 'Hanap Medisina',
      summary: 'Medicinal plant information. Even offline.',
      details: 'An offline application for exploring Philippine medicinal plants, with plant identification and accessible medicinal plant information.',
      live: 'https://hanap-medsesinav2.vercel.app/',
      source: 'https://github.com/Buttercookiez/HanapMedsesinav2'
    },
    koki: {
      number: 'GAME LIBRARY',
      title: 'Koki Emulator',
      summary: 'A simple home for your game library.',
      details: 'A multi-platform emulator application project with a straightforward interface for organizing, browsing, and accessing games.',
      live: 'https://koki-emulator09.vercel.app/',
      source: 'https://github.com/Buttercookiez/KokiEmulator'
    },
    monovault: {
      number: 'PERSONAL SECURITY',
      title: 'Monovault',
      summary: 'Your private information. Encrypted, offline.',
      details: 'An offline password manager for passwords, recovery phrases, and sensitive information. It uses AES-256-GCM encryption and focuses on local storage.',
      live: 'https://monovault.vercel.app/',
      source: 'https://github.com/Buttercookiez/Monovault'
    }
  };
  function openProject(button) {
    const project = projects[button.dataset.project];
    if (!project || !dialog || typeof dialog.showModal !== 'function') return;
    projectOpener = button;
    [['.dialog-kicker', project.number], ['#dialog-title', project.title], ['.dialog-summary', project.summary], ['.dialog-details', project.details]]
      .forEach(([selector, text]) => { const element = $(selector, dialog); if (element) element.textContent = text; });
    const links = $('.dialog-links', dialog);
    if (links) {
      links.replaceChildren();
      [['Visit site', project.live], ['View source', project.source]].forEach(([label, url]) => {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.setAttribute('aria-label', label + ' for ' + project.title + ' (opens in a new tab)');
        anchor.append(document.createTextNode(label + ' '));
        const arrow = document.createElement('span');
        arrow.textContent = '↗';
        arrow.setAttribute('aria-hidden', 'true');
        anchor.append(arrow);
        links.append(anchor);
      });
    }
    setMenu(false);
    dialog.showModal();
    dialog.scrollTop = 0;
    synchronizeScrollLock();
  }
  $$('.project-details[data-project]').forEach(button => button.addEventListener('click', () => openProject(button)));
  $$('.dialog-close,.dialog-done').forEach(button => button.addEventListener('click', () => dialog?.close()));
  dialog?.addEventListener('close', () => {
    synchronizeScrollLock();
    projectOpener?.focus({ preventScroll: true });
  });
  dialog?.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });

  function notify(message) {
    if (!toastElement) return;
    clearTimeout(toastTimer);
    toastElement.textContent = message;
    toastElement.classList.add('visible');
    toastTimer = setTimeout(() => toastElement.classList.remove('visible'), 2800);
  }
  $$('.copy-email').forEach(button => button.addEventListener('click', async () => {
    const email = button.dataset.email || 'johnfrancismarabe040905@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      notify('Email copied.');
    } catch {
      const range = document.createRange();
      range.selectNodeContents(button);
      const selection = getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      notify('Email selected. Use your device’s copy command.');
    }
  }));

  configureReader();
  configureSmoothScroll();
  requestAnimationFrame(() => {
    refreshReader();
    routeHash(location.hash, true);
    if (!document.documentElement.classList.contains('ink-booting')) initialRoutePending = false;
  });
  addEventListener('load', () => {
    refreshReader();
    if (initialRoutePending) routeHash(location.hash, true);
  }, { once: true });
  document.fonts?.ready.then(() => {
    refreshReader();
    if (initialRoutePending) routeHash(location.hash, true);
  });
})();
