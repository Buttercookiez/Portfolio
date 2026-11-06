/* Light comic-panel motion on top of an ordinary, fully readable document. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const desktop = matchMedia('(min-width: 1024px)');
  const mobile = matchMedia('(max-width: 760px)');
  const menuToggle = $('.menu-toggle');
  const navigation = $('#site-nav');
  const navLinks = $$('.site-nav a[href^="#"]');
  const chapters = ['work', 'about', 'contact'].map(id => document.getElementById(id)).filter(Boolean);
  const readingTrack = $('.reading-progress > span');
  const dialog = $('#project-dialog');
  const toastElement = $('.toast');
  let lenis = null;
  let lenisTick = null;
  let frame = 0;
  let activeChapter = '';
  let lastProgress = '';
  let toastTimer = 0;
  let projectOpener = null;

  if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  function synchronizeScrollLock() {
    const blocked = document.body.classList.contains('menu-open') || Boolean(dialog?.open);
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
    if (restoreFocus && menuToggle && mobile.matches) menuToggle.focus();
  }

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
    if (open) $('a', navigation)?.focus();
  });
  navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
  $('.brand')?.addEventListener('click', () => setMenu(false));
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

  function updateChapter() {
    let next = '';
    const headerHeight = $('.site-header')?.offsetHeight || 80;
    const threshold = Math.max(headerHeight + 24, innerHeight * 0.3);
    chapters.forEach(section => {
      if (section.getBoundingClientRect().top <= threshold) next = section.id;
    });
    if (next === activeChapter) return;
    activeChapter = next;
    navLinks.forEach(link => {
      if (link.hash === '#' + next) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function updateReading() {
    frame = 0;
    const range = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.max(0, Math.min(1, scrollY / range)).toFixed(4);
    if (readingTrack && progress !== lastProgress) {
      readingTrack.style.transform = `scaleX(${progress})`;
      lastProgress = progress;
    }
    document.body.classList.toggle('has-scrolled', scrollY > 24);
    updateChapter();
  }
  function queueReading() {
    if (!frame) frame = requestAnimationFrame(updateReading);
  }
  addEventListener('scroll', queueReading, { passive: true });
  addEventListener('resize', queueReading, { passive: true });
  addEventListener('hashchange', queueReading);
  addEventListener('pageshow', queueReading);
  if ('IntersectionObserver' in window) {
    const chapterObserver = new IntersectionObserver(updateChapter, { rootMargin: '-20% 0px -65% 0px' });
    chapters.forEach(section => chapterObserver.observe(section));
  }
  updateReading();

  function configureSmoothScroll() {
    if (lenisTick && gsap) gsap.ticker.remove(lenisTick);
    lenisTick = null;
    lenis?.destroy();
    lenis = null;
    if (reduced.matches || !fine.matches || !desktop.matches || !window.Lenis || !gsap) return;
    try {
      lenis = new window.Lenis({
        autoRaf: false,
        smoothWheel: true,
        syncTouch: false,
        lerp: 0.12,
        anchors: false,
        prevent: node => Boolean(node.closest('dialog, [data-lenis-prevent]'))
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
  [reduced, fine, desktop].forEach(query => query.addEventListener('change', configureSmoothScroll));
  configureSmoothScroll();

  // Elements remain visible until they enter the viewport. Missing libraries,
  // reduced motion, and disabled JavaScript all leave the document intact.
  if (gsap && ScrollTrigger) {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 96%',
        once: true,
        onEnter: batch => gsap.fromTo(batch, { y: 20, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.07,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
          overwrite: 'auto'
        })
      });
    });
    reduced.addEventListener('change', () => {
      if (reduced.matches) {
        gsap.killTweensOf('[data-reveal]');
        gsap.set('[data-reveal]', { clearProps: 'transform,opacity' });
      }
    });
    document.addEventListener('focusin', event => {
      const panel = event.target.closest('[data-reveal]');
      if (panel) {
        gsap.killTweensOf(panel);
        gsap.set(panel, { clearProps: 'transform,opacity' });
      }
    });
    const refresh = () => { lenis?.resize(); ScrollTrigger.refresh(); queueReading(); };
    addEventListener('load', refresh, { once: true });
    document.fonts?.ready.then(refresh);
  }

  const projects = {
    herbal: {
      number: '01 / MOBILE · PLANT RECOGNITION',
      title: 'Hanap Medisina',
      summary: 'What if plant information could be closer to hand?',
      details: 'An offline application for exploring Philippine medicinal plants, with plant identification and accessible medicinal plant information.',
      live: 'https://hanap-medsesinav2.vercel.app/',
      source: 'https://github.com/Buttercookiez/HanapMedsesinav2'
    },
    koki: {
      number: '02 / EMULATOR · GAME LIBRARY',
      title: 'Koki Emulator',
      summary: 'A simpler way into a game library.',
      details: 'A multi-platform emulator application project with a straightforward interface for organizing, browsing, and accessing games.',
      live: 'https://koki-emulator09.vercel.app/',
      source: 'https://github.com/Buttercookiez/KokiEmulator'
    },
    monovault: {
      number: '03 / MOBILE · PRIVACY',
      title: 'Monovault',
      summary: 'A private place for the things you need to keep.',
      details: 'An offline password manager for passwords, recovery phrases, and sensitive information. It uses AES-256-GCM encryption and keeps the experience focused on local storage.',
      live: 'https://monovault.vercel.app/',
      source: 'https://github.com/Buttercookiez/Monovault'
    }
  };

  function openProject(button) {
    const project = projects[button.dataset.project];
    if (!project || !dialog || typeof dialog.showModal !== 'function') return;
    projectOpener = button;
    const fields = {
      '.dialog-kicker': project.number,
      '#dialog-title': project.title,
      '.dialog-summary': project.summary,
      '.dialog-details': project.details
    };
    Object.entries(fields).forEach(([selector, text]) => {
      const element = $(selector, dialog);
      if (element) element.textContent = text;
    });
    const container = $('.dialog-links', dialog);
    if (container) {
      container.replaceChildren();
      [['Visit site', project.live], ['View source', project.source]].forEach(([label, url]) => {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', `${label} for ${project.title} (opens in a new tab)`);
        link.append(document.createTextNode(label + ' '));
        const arrow = document.createElement('span');
        arrow.textContent = '↗';
        arrow.setAttribute('aria-hidden', 'true');
        link.append(arrow);
        container.append(link);
      });
      container.hidden = false;
    }
    setMenu(false);
    dialog.showModal();
    dialog.scrollTop = 0;
    synchronizeScrollLock();
  }
  $$('.project-details[data-project]').forEach(button => button.addEventListener('click', () => openProject(button)));
  $$('.dialog-close, .dialog-done').forEach(button => button.addEventListener('click', () => dialog?.close()));
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
    toastTimer = setTimeout(() => toastElement.classList.remove('visible'), 3200);
  }
  $$('.copy-email').forEach(button => button.addEventListener('click', async () => {
    const email = button.dataset.email || 'johnfrancismarabe040905@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      notify('Email copied. Let’s start a conversation.');
    } catch {
      const range = document.createRange();
      range.selectNodeContents(button);
      const selection = getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      notify('Email selected. Use your device’s copy command.');
    }
  }));
})();
