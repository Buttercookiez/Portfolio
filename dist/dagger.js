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
  const spin = document.createElement('div');
  spin.className = 'dagger-spin';
  const face = document.createElement('div');
  face.className = 'dagger-face';
  const memories = document.createElement('div');
  memories.className = 'dagger-memories';
  const plate = document.createElement('div');
  plate.className = 'dagger-memory-plate';
  const video = document.createElement('video');
  video.className = 'dagger-memory-video';
  video.preload = 'metadata';
  video.defaultMuted = true;
  video.muted = true;
  video.playsInline = true;
  plate.append(video);
  memories.append(plate);
  face.append(createDagger(), memories);
  spin.append(face);
  const edge = createDagger();
  edge.className = 'dagger-edge';
  fall.append(spin, edge);

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

  let requestedFrame = null;
  let memoryLoading = false;
  function loadMemory() {
    if (memoryLoading) return;
    memoryLoading = true;
    video.poster = 'assets/blade-memory.webp';
    const source = 'assets/blade-memory.mp4';
    if (typeof fetch !== 'function' || typeof URL.createObjectURL !== 'function') {
      video.src = source;
      return;
    }
    // A small local blob makes frame seeking work on hosts without byte ranges.
    fetch(source).then(response => {
      if (!response.ok) throw new Error('Blade memory could not load');
      return response.blob();
    }).then(clip => {
      video.src = URL.createObjectURL(clip);
    }).catch(() => {
      video.src = source;
    });
  }

  function seekMemory() {
    if (requestedFrame === null || video.seeking || !Number.isFinite(video.duration)) return;
    const time = Math.floor(Math.min(requestedFrame * video.duration, video.duration - .05) * 18) / 18;
    if (Math.abs(video.currentTime - time) > .015) video.currentTime = time;
  }
  video.addEventListener('loadedmetadata', seekMemory);
  video.addEventListener('seeked', seekMemory);

  function connect(gsap, identity, contact, revealAt, projects) {
    loadMemory();
    const at = (trigger, progress) => trigger.start + (trigger.end - trigger.start) * progress;
    const touchDown = () => at(contact, .81);
    gsap.set(fall, { xPercent: -50, transformOrigin: '50% 50%', autoAlpha: 0 });
    gsap.set(spin, { transformPerspective: 650 });
    const shiftX = gsap.quickSetter(fall, 'x', 'px');
    const shiftY = gsap.quickSetter(fall, 'y', 'px');
    const rollBlade = gsap.quickSetter(fall, 'rotation', 'deg');
    const rotate = gsap.quickSetter(spin, 'rotationY', 'deg');
    const flip = gsap.quickSetter(face, 'scaleX');
    const lightEdge = gsap.quickSetter(edge, 'opacity');
    const showBlade = gsap.quickSetter(fall, 'opacity');
    const revealBlade = gsap.quickSetter(fall, 'visibility');
    const showMemory = gsap.quickSetter(plate, 'opacity');
    const unit = gsap.utils.clamp(0, 1);
    const ease = gsap.parseEase('sine.inOut');

    // The shadow and mirror share the exact anchor used for the blade's tip.
    const landing = gsap.timeline({ paused: true });
    landing.fromTo(shadow, { opacity: 0 }, { opacity: .8, duration: .28, ease: 'power2.out' }, 0);
    landing.fromTo(reflection, { opacity: 0 }, { opacity: .34, duration: .56, ease: 'power2.out' }, 0);
    landing.fromTo(impact, { opacity: 0 }, { opacity: .7, duration: .19, ease: 'power1.out' }, 0);
    landing.fromTo(ink, { scale: .28, svgOrigin: '90 26' }, { scale: 1, duration: .7, ease: 'power2.out' }, 0);
    landing.to(impact, { opacity: 0, duration: .65, ease: 'power1.out' }, .3);

    const pose = (time, yaw, roll, x) => ({ time, yaw, roll, x });
    const lastAngle = projects.length * 180;
    let turns = [pose(0, -58, -20, -.14), pose(1, lastAngle, 0, 0)];
    let windows = [];
    let stageWidth = 0;
    let stageHeight = 0;
    let anchor = 0;
    let bladeWidth = 0;
    let bladeHeight = 0;
    let groundY = 0;

    function renderFlight(progress, descent) {
      const nextIndex = turns.findIndex(({ time }, index) => index > 0 && time >= progress);
      const stop = nextIndex === -1 ? turns.length - 1 : nextIndex;
      const next = turns[stop];
      const previous = turns[stop - 1];
      const blend = ease(unit((progress - previous.time) / Math.max(.001, next.time - previous.time)));
      const yaw = gsap.utils.interpolate(previous.yaw, next.yaw, blend);
      const roll = gsap.utils.interpolate(previous.roll, next.roll, blend);
      const x = gsap.utils.interpolate(previous.x, next.x, blend) * stageWidth;
      const facing = Math.cos(yaw * Math.PI / 180);
      const tilt = roll * Math.PI / 180;
      const extent = (Math.abs(Math.sin(tilt)) * bladeHeight + Math.abs(Math.cos(tilt)) * bladeWidth * .88) / 2;
      const safeX = gsap.utils.clamp(extent + 6, stageWidth - extent - 6, anchor + x) - anchor;
      const flightHeight = descent * (.53 + .47 * descent);
      shiftX(gsap.utils.interpolate(safeX, x, unit((descent - .92) / .08)));
      shiftY(gsap.utils.interpolate(stageHeight * .045, groundY, flightHeight));
      rollBlade(roll);
      showBlade(unit(descent / .065));
      revealBlade(descent > 0 ? 'visible' : 'hidden');
      rotate(yaw);
      flip(facing < 0 ? -1 : 1);
      lightEdge(unit((.16 - Math.abs(facing)) / .16));
      const memoryIndex = windows.findIndex(({ start, end }) => progress >= start && progress < end);
      if (memoryIndex === -1) {
        requestedFrame = null;
        showMemory(0);
        return;
      }

      const { start, open, hold, end } = windows[memoryIndex];
      const inLight = ease(unit((progress - start) / Math.max(.001, open - start)));
      const outOfLight = 1 - ease(unit((progress - hold) / Math.max(.001, end - hold)));
      showMemory(inLight * outOfLight);
      requestedFrame = (memoryIndex + unit((progress - start) / Math.max(.001, end - start))) / windows.length;
      seekMemory();
    }

    // One scrub clock keeps the spin, chapter memories, and tip aligned on reverse scroll.
    const clock = { progress: 0 };
    let landingPoint = .96;
    function render() {
      renderFlight(clock.progress, unit(clock.progress / landingPoint));
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
          const scrollToTime = scroll => unit((scroll - trigger.start) / Math.max(1, trigger.end - trigger.start));
          landingPoint = gsap.utils.clamp(.01, .99, scrollToTime(touchDown()));
          const chapterTime = (chapter, progress) => scrollToTime(at(chapter.trigger, progress));
          stageWidth = stage.clientWidth;
          stageHeight = stage.clientHeight;
          anchor = fall.offsetLeft;
          bladeWidth = fall.offsetWidth;
          bladeHeight = fall.offsetHeight;
          groundY = ground.offsetTop - fall.offsetTop - bladeHeight * tipRatio;
          turns = [pose(0, -58, -20, -.14)];
          windows = projects.map((chapter, index) => {
            const broadside = index * 180;
            const roll = index === 1 ? 360 : 0;
            const arrival = chapterTime(chapter, .16);
            if (index > 0) {
              const departure = turns[turns.length - 1];
              const seam = (departure.time + arrival) / 2;
              const midRoll = (departure.roll + roll) / 2;
              turns.push(pose(seam, broadside - 84, midRoll, index === 1 ? -.22 : -.17));
            }
            turns.push(
              pose(arrival, broadside - 18, roll + (index === 1 ? -9 : 7), index === 1 ? -.052 : .004),
              pose(chapterTime(chapter, .49), broadside + 5, roll + (index === 1 ? 5 : -4), .018),
              pose(chapterTime(chapter, .72), broadside + 19, roll + (index === 1 ? 1 : 8), -.015)
            );
            return {
              start: chapterTime(chapter, .16),
              open: chapterTime(chapter, .26),
              hold: chapterTime(chapter, .58),
              end: chapterTime(chapter, .78)
            };
          });
          turns.push(pose(landingPoint, lastAngle, 0, 0));
          render();
        }
      }
    });
  }

  window.PrologueDagger = { connect };
})();
