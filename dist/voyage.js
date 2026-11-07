/* The camera follows one ship from the departure to the last cargo hold. */
(() => {
  'use strict';

  const stage = document.querySelector('.voyage-stage');
  if (!stage) return;
  const ship = stage.querySelector('.voyage-ship');
  const sky = stage.querySelector('.voyage-sky');
  const fleet = stage.querySelector('.voyage-fleet');
  const water = stage.querySelector('.voyage-water');

  function connect(gsap, identity, projects, contact) {
    if (projects.length !== 3) return;
    const at = (trigger, progress) => gsap.utils.interpolate(trigger.start, trigger.end, progress);
    const clamp = gsap.utils.clamp(0, 1);
    const ease = gsap.parseEase('sine.inOut');
    const clock = { progress: 0 };
    let course = [];
    let stageWidth = 0;
    let stageHeight = 0;
    let depart = 0;
    let arrive = 0;
    let fadeIn = 1;
    let fadeOut = 1;

    function paint() {
      if (course.length < 2) return;
      const scroll = gsap.utils.interpolate(depart, arrive, clock.progress);
      const nextIndex = course.findIndex((mark, index) => index > 0 && mark.scroll >= scroll);
      const stop = nextIndex === -1 ? course.length - 1 : nextIndex;
      const from = course[stop - 1];
      const to = course[stop];
      const blend = ease(clamp((scroll - from.scroll) / Math.max(1, to.scroll - from.scroll)));
      const drift = gsap.utils.interpolate(from.x, to.x, blend) * stageWidth;
      const lift = gsap.utils.interpolate(from.y, to.y, blend) * stageHeight;
      const zoom = gsap.utils.interpolate(from.zoom, to.zoom, blend);
      const swell = Math.sin(clock.progress * 24);
      const heel = gsap.utils.interpolate(from.heel, to.heel, blend) + swell * .85;
      ship.style.transform = `translate3d(${drift}px, ${lift + swell * 5}px, 0) rotate(${heel}deg) scale(${zoom})`;
      const skyLift = stageWidth <= 760 ? lift * .96 : -lift * .12;
      sky.style.transform = `translate3d(${-drift * .14}px, ${skyLift}px, 0)`;
      fleet.style.transform = `translate3d(${-drift * .32}px, ${swell * 2}px, 0)`;
      water.style.transform = `translate3d(${-clock.progress * stageWidth * .10}px, ${swell * 6}px, 0)`;
      stage.style.opacity = String(ease(clamp((scroll - depart) / fadeIn)) * ease(clamp((arrive - scroll) / fadeOut)));
    }

    gsap.to(clock, {
      progress: 1,
      ease: 'none',
      onUpdate: paint,
      scrollTrigger: {
        trigger: identity.trigger,
        start: () => at(identity, .01),
        end: () => at(contact, .78),
        scrub: .5,
        onRefresh(trigger) {
          stageWidth = stage.clientWidth;
          stageHeight = stage.clientHeight;
          depart = trigger.start;
          arrive = trigger.end;
          fadeIn = Math.max(1, at(identity, .25) - depart);
          fadeOut = Math.max(1, arrive - at(contact, .15));
          const compact = stageWidth <= 760;
          const dock = (project, zoom, mobileLift) => {
            if (compact) return mobileLift;
            const cargo = project.scene.querySelector('.project-layout');
            const cargoBottom = cargo.offsetTop + cargo.offsetHeight;
            const waterline = ship.offsetTop + ship.offsetHeight * (.76 + .11 * zoom);
            const target = Math.min(stageHeight * .9, cargoBottom + stageHeight * .033);
            return (target - waterline) / Math.max(1, stageHeight);
          };
          const firstZoom = compact ? 1.27 : 1.33;
          const middleZoom = compact ? 1.31 : 1.37;
          const lastZoom = compact ? 1.25 : 1.31;
          course = [
            { scroll: depart, x: -.14, y: .085, zoom: .86, heel: -3.5 },
            { scroll: at(identity, .62), x: compact ? -.018 : .052, y: 0, zoom: 1, heel: -1 },
            { scroll: at(projects[0].trigger, .51), x: -.022, y: dock(projects[0], firstZoom, -.29), zoom: firstZoom, heel: .6 },
            { scroll: at(projects[1].trigger, .54), x: .042, y: dock(projects[1], middleZoom, -.275), zoom: middleZoom, heel: -1.8 },
            { scroll: at(projects[2].trigger, .61), x: .084, y: dock(projects[2], lastZoom, -.258), zoom: lastZoom, heel: .7 },
            { scroll: arrive, x: .27, y: compact ? -.16 : .04, zoom: 1.16, heel: 2.3 }
          ];
          paint();
        }
      }
    });
  }

  window.PortfolioVoyage = { connect };
})();
