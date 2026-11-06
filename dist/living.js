/* Scroll-linked ink gutters and small, deliberately activated living panels. */
(() => {
  'use strict';
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const cards = [...document.querySelectorAll('.project-card[data-scene]')];
  const states = new Map();

  function updateCard(card) {
    const state = states.get(card);
    if (!state) return;
    const active = !document.hidden && state.visible && !reduced.matches && (state.pinned || state.hovered);
    card.classList.toggle('is-awake', active);
    card.classList.toggle('is-in-view', state.visible);
    const button = card.querySelector('.art-interact');
    button?.setAttribute('aria-pressed', String(state.pinned));
    if (button) button.disabled = reduced.matches;
    const label = button?.querySelector(':scope > span:last-of-type');
    if (label) label.textContent = reduced.matches || state.pinned ? 'STILL PANEL' : 'AWAKEN PANEL';
  }
  cards.forEach(card => {
    const state = { pinned: false, hovered: false, visible: true };
    states.set(card, state);
    card.querySelector('.art-interact')?.addEventListener('click', () => {
      state.pinned = !state.pinned;
      updateCard(card);
    });
    card.addEventListener('pointerenter', event => {
      if (!fine.matches || event.pointerType === 'touch') return;
      state.hovered = true;
      updateCard(card);
    });
    card.addEventListener('pointerleave', () => { state.hovered = false; updateCard(card); });
    updateCard(card);
  });
  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const state = states.get(entry.target);
        if (!state) return;
        state.visible = entry.isIntersecting;
        updateCard(entry.target);
      });
    }, { threshold: 0 });
    cards.forEach(card => visibility.observe(card));
  }
  document.addEventListener('visibilitychange', () => cards.forEach(updateCard));
  fine.addEventListener('change', () => {
    if (!fine.matches) states.forEach(state => { state.hovered = false; });
    cards.forEach(updateCard);
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) states.forEach(state => { state.hovered = false; state.pinned = false; });
    cards.forEach(updateCard);
  });

  const bookmark = document.querySelector('.chapter-bookmark');
  const chapters = [...document.querySelectorAll('.hero, #work, #about, #contact')];
  const chapterNames = { work: ['01', 'THE WORK'], about: ['02', 'THE PERSON'], contact: ['03', 'WHAT COMES NEXT'] };
  function updateBookmark() {
    if (!bookmark) return;
    const threshold = Math.max(110, innerHeight * .3);
    let chapter = ['00', 'THE COVER'];
    chapters.forEach(section => {
      if (section.getBoundingClientRect().top <= threshold && chapterNames[section.id]) chapter = chapterNames[section.id];
    });
    const index = bookmark.querySelector('.bookmark-index');
    const name = bookmark.querySelector('.bookmark-name');
    if (index && index.textContent !== chapter[0]) index.textContent = chapter[0];
    if (name && name.textContent !== chapter[1]) name.textContent = chapter[1];
  }
  let bookmarkFrame = 0;
  function queueBookmark() {
    if (bookmarkFrame) return;
    bookmarkFrame = requestAnimationFrame(() => {
      bookmarkFrame = 0;
      updateBookmark();
    });
  }
  if (bookmark) addEventListener('scroll', queueBookmark, { passive: true });
  if (bookmark && 'IntersectionObserver' in window) {
    const chapterObserver = new IntersectionObserver(updateBookmark, { rootMargin: '-10% 0px -65% 0px' });
    chapters.forEach(chapter => chapterObserver.observe(chapter));
    addEventListener('hashchange', queueBookmark);
    addEventListener('resize', updateBookmark, { passive: true });
    addEventListener('pageshow', updateBookmark);
  }
  updateBookmark();

  let started = false;
  function startMotion() {
    if (started) return;
    started = true;
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      document.querySelectorAll('[data-chapter-cut]').forEach(cut => {
        const left = cut.querySelector('.cut-shutter-left');
        const right = cut.querySelector('.cut-shutter-right');
        const caption = cut.querySelector('.cut-caption');
        const stroke = cut.querySelector('.cut-stroke');
        const timeline = gsap.timeline({ scrollTrigger: {
          trigger: cut,
          start: 'top 94%',
          end: 'bottom 25%',
          scrub: .45,
          invalidateOnRefresh: true
        } });
        if (stroke) timeline.fromTo(stroke, { scaleX: .01 }, { scaleX: 1, duration: .45, ease: 'power2.inOut' }, 0);
        if (caption) timeline.fromTo(caption, { opacity: .55, y: 15 }, { opacity: 1, y: 0, duration: .28, ease: 'power2.out' }, 0);
        if (left) timeline.to(left, { xPercent: -105, duration: .68, ease: 'power2.inOut' }, .16);
        if (right) timeline.to(right, { xPercent: 105, duration: .68, ease: 'power2.inOut' }, .16);
        if (caption) timeline.to(caption, { opacity: 0, y: -12, duration: .24, ease: 'power1.in' }, .7);
      });

      document.querySelectorAll('.project-art > img').forEach(image => {
        gsap.fromTo(image,
          { clipPath: 'polygon(0% 0%, 0% 0%, -28% 100%, 0% 100%)' },
          { clipPath: 'polygon(0% 0%, 128% 0%, 100% 100%, 0% 100%)', duration: .95, ease: 'power3.inOut',
            clearProps: 'clipPath', scrollTrigger: { trigger: image.parentElement, start: 'top 94%', once: true } });
      });

      const hero = document.querySelector('.hero');
      const heroImage = document.querySelector('.hero-art > img');
      if (hero && heroImage) {
        gsap.fromTo(heroImage,
          { y: () => innerWidth > 760 ? 18 : 6, scale: () => innerWidth > 760 ? 1.08 : 1.055 },
          { y: () => innerWidth > 760 ? -18 : -6, scale: () => innerWidth > 760 ? 1.08 : 1.055, ease: 'none',
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .7, invalidateOnRefresh: true } });
      }
    });
    ScrollTrigger.refresh();
  }
  if (document.documentElement.classList.contains('ink-booting')) {
    addEventListener('ink:opening-complete', startMotion, { once: true });
    setTimeout(startMotion, 4700);
  } else startMotion();
  addEventListener('ink:opening-complete', updateBookmark);
})();
