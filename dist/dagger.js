/* One scroll-driven descent, from the name reveal to the final shore. */
(() => {
  'use strict';
  const stage = document.querySelector('.dagger-stage');
  const illustration = stage?.querySelector('.dagger-fallback');
  if (!illustration) return;

  const tipRatio = 739 / 760;
  const createDagger = () => {
    const image = illustration.cloneNode();
    image.className = 'dagger-art';
    return image;
  };

  const fall = document.createElement('div');
  fall.className = 'dagger-fall';
  fall.append(createDagger());

  const ground = document.createElement('div');
  ground.className = 'dagger-ground';
  ground.innerHTML = '<div class="dagger-shadow"></div>' +
    '<div class="dagger-reflection"></div>' +
    '<svg class="dagger-impact" viewBox="0 0 180 52" fill="none" focusable="false" aria-hidden="true">' +
      '<g class="dagger-impact-ink" stroke="currentColor" stroke-linecap="round">' +
        '<path d="M65 26l-28-3m27 7-16 4m64-9 35-4m-36 10 25 3M81 21l-9-7m26 6 9-7" stroke-width="1.3"/>' +
        '<path d="M22 29l10-.2m2 8 18-2m94 2 17-2m-7-12 9-1M66 39l13-2m22 0 17 3" stroke-width=".65"/>' +
        '<path d="M74 27c9-4 22-4 31 0m-29 5c7 3 20 3 26 0" stroke-width=".7"/>' +
      '</g>' +
    '</svg>';
  const reflection = ground.querySelector('.dagger-reflection');
  const shadow = ground.querySelector('.dagger-shadow');
  const impact = ground.querySelector('.dagger-impact');
  const ink = ground.querySelector('.dagger-impact-ink');
  reflection.append(createDagger());
  stage.append(ground, fall);
  stage.classList.add('has-dagger');

  function connect(gsap, identity, contact, revealAt) {
    const at = (trigger, progress) => trigger.start + (trigger.end - trigger.start) * progress;
    const touchDown = () => at(contact, .81);
    const startY = () => stage.clientHeight * .045;
    const groundY = () => ground.offsetTop - fall.offsetTop - fall.offsetHeight * tipRatio;
    const sway = () => Math.min(16, stage.clientWidth * .022);
    const outwardTilt = () => stage.clientWidth <= 760 ? 8 : 15;
    const descent = gsap.timeline({ paused: true });
    descent.fromTo(fall, { autoAlpha: 0 }, { autoAlpha: 1, duration: .07, ease: 'power1.out' }, 0);
    descent.fromTo(fall,
      { xPercent: -50, y: startY, transformOrigin: '50% 97.237%' },
      { xPercent: -50, y: groundY, duration: 1, ease: progress => progress * (.55 + .45 * progress) }, 0);
    descent.fromTo(fall, { rotation: -19, x: 0 },
      { rotation: outwardTilt, x: () => -sway(), duration: .43, ease: 'sine.inOut' }, 0);
    descent.to(fall, { rotation: -11, x: sway, duration: .34, ease: 'sine.inOut' }, .43);
    descent.to(fall, { rotation: 0, x: 0, duration: .23, ease: 'power1.out' }, .77);

    // The shadow and mirror share the exact anchor used for the blade's tip.
    const landing = gsap.timeline({ paused: true });
    landing.fromTo(shadow, { opacity: 0 }, { opacity: .8, duration: .28, ease: 'power2.out' }, 0);
    landing.fromTo(reflection, { opacity: 0 }, { opacity: .34, duration: .56, ease: 'power2.out' }, 0);
    landing.fromTo(impact, { opacity: 0 }, { opacity: .7, duration: .19, ease: 'power1.out' }, 0);
    landing.fromTo(ink, { scale: .28, svgOrigin: '90 26' }, { scale: 1, duration: .7, ease: 'power2.out' }, 0);
    landing.to(impact, { opacity: 0, duration: .65, ease: 'power1.out' }, .3);

    // Both phases share one scrub clock so even a fast scroll keeps the impact attached to the tip.
    const clock = { progress: 0 };
    let landingPoint = .96;
    function render() {
      descent.progress(Math.min(1, clock.progress / landingPoint));
      landing.progress(Math.max(0, (clock.progress - landingPoint) / (1 - landingPoint)));
    }
    gsap.to(clock, {
      progress: 1,
      ease: 'none',
      onUpdate: render,
      scrollTrigger: {
        trigger: identity.trigger,
        start: () => at(identity, revealAt),
        end: () => at(contact, .99),
        scrub: .38,
        onRefresh(trigger) {
          landingPoint = gsap.utils.clamp(.01, .99, (touchDown() - trigger.start) / (trigger.end - trigger.start));
          descent.invalidate();
          render();
        }
      }
    });
  }

  window.PrologueDagger = { connect };
})();
