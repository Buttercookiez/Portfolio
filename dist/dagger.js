/* A small original steel illustration, choreographed by the page's GSAP clock. */
(() => {
  'use strict';
  const stage = document.querySelector('.dagger-stage');
  if (stage && !stage.classList.contains('has-dagger')) {
    stage.insertAdjacentHTML('beforeend', `
      <div class="dagger-fall"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 760" fill="none" class="dagger-svg" aria-hidden="true" focusable="false"><defs>
  <linearGradient id="pd-steel-left" x1="0" x2="1"><stop stop-color="#26363e"/><stop offset=".42" stop-color="#778c91"/><stop offset=".68" stop-color="#bdc8c7"/><stop offset="1" stop-color="#526970"/></linearGradient>
  <linearGradient id="pd-steel-right" x1="0" x2="1"><stop stop-color="#d5dfdb"/><stop offset=".2" stop-color="#8eaaae"/><stop offset=".65" stop-color="#d8dfd7"/><stop offset="1" stop-color="#617b84"/></linearGradient>
  <linearGradient id="pd-edge" x1="0" x2="1"><stop stop-color="#e1e5d7"/><stop offset=".45" stop-color="#8faaa9"/><stop offset="1" stop-color="#dce4d9"/></linearGradient>
  <linearGradient id="pd-bronze" x1="0" x2="1"><stop stop-color="#293432"/><stop offset=".23" stop-color="#998969"/><stop offset=".49" stop-color="#c1b18b"/><stop offset=".7" stop-color="#716c56"/><stop offset="1" stop-color="#303d3c"/></linearGradient>
  <linearGradient id="pd-leather" x1="0" x2="1"><stop stop-color="#101b20"/><stop offset=".28" stop-color="#3b3d32"/><stop offset=".57" stop-color="#575244"/><stop offset=".85" stop-color="#263036"/><stop offset="1" stop-color="#111f25"/></linearGradient>
  <linearGradient id="pd-sheen" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e8ece1" stop-opacity="0"/><stop offset=".48" stop-color="#f5f4e6" stop-opacity=".15"/><stop offset=".55" stop-color="#f5f4e6" stop-opacity=".6"/><stop offset=".62" stop-color="#f5f4e6" stop-opacity="0"/></linearGradient>
  <clipPath id="pd-blade-clip"><path d="M83 229H157L150 573 120 721 90 573Z"/></clipPath>
  <clipPath id="pd-memory-clip"><path d="M92 251H148L143 567 120 687 97 567Z"/></clipPath>
</defs><g class="dagger-blade">
  <path d="M79 218H161L154 583 120 739 86 583Z" fill="#192c33" stroke="#718c8e" stroke-width="1.6"/>
  <path d="M83 224H120V728L91 580Z" fill="url(#pd-steel-left)"/>
  <path d="M120 224H157L149 580 120 728Z" fill="url(#pd-steel-right)"/>
  <path d="M83 225 91 580 120 729 86 582 79 220Z" fill="url(#pd-edge)" opacity=".85"/>
  <path d="M157 225 149 580 120 729 154 582 161 220Z" fill="#dbe4dc" opacity=".72"/>
  <path d="M120 228V720" stroke="#e3e8db" stroke-width="1" opacity=".42"/>
  <path d="m99 337 4 47m-1 30 3 15m32-109-2 54m-2 44 2 19m-29 65 4 42m25-29-2 29m-15 35 1 48" fill="none" stroke="#e5e8db" stroke-width=".55" opacity=".25"/>
</g><g clip-path="url(#pd-memory-clip)">
  <image class="blade-memory memory-herbal" href="assets/project-herbal.jpg" x="90" y="250" width="60" height="440" preserveAspectRatio="xMidYMid slice"/>
  <image class="blade-memory memory-koki" href="assets/project-koki.jpg" x="90" y="250" width="60" height="440" preserveAspectRatio="xMidYMid slice"/>
  <image class="blade-memory memory-monovault" href="assets/project-monovault.jpg" x="90" y="250" width="60" height="440" preserveAspectRatio="xMidYMid slice"/>
</g><g class="blade-engraving" fill="none" stroke="#33494c" opacity=".8">
  <path d="M104 275h12v20c0 9-11 10-12 2m22 7v-29h13m-13 13h10" stroke-width="2.2"/>
  <path d="M105 316h30m-26 5h22" stroke-width=".7"/>
</g><g class="dagger-hilt">
  <path d="M104 27 100 48 102 172 98 197H142L138 172 140 48 136 27Z" fill="url(#pd-leather)" stroke="#17262b" stroke-width="2"/>
  <g fill="none" stroke="#a49979" stroke-width="1.2" opacity=".45">
    <path d="m101 49 37 14m-37 5 37 14m-36 5 36 14m-36 5 36 14m-36 5 36 14m-36 5 36 14m-36 5 36 14m-37 5 38 14"/>
  </g>
  <path d="M106 39 108 183M135 41l-3 141" fill="none" stroke="#d2c4a4" stroke-width=".8" opacity=".28"/>
  <path d="M98 177H142L146 197H94Z" fill="url(#pd-bronze)" stroke="#243332" stroke-width="1.5"/>
  <path d="M96 184H144M95 192h50" stroke="#e0d4ae" stroke-width=".7" opacity=".45"/>
  <path d="M42 194 58 198 91 203H149L182 198 198 194 194 210 180 216 149 215 145 225H95L91 215 60 216 46 210Z" fill="url(#pd-bronze)" stroke="#24373a" stroke-width="2"/>
  <path d="m46 198 17 5 31 5h52l31-5 17-5" fill="none" stroke="#e3d6b4" stroke-width="1.2" opacity=".63"/>
  <path d="M103 207h34v20h-34Z" fill="#566b6e" stroke="#c0c7af" stroke-width=".6"/>
  <path d="m109 211 11 6 11-6m-22 10 11-6 11 6" fill="none" stroke="#aeb7a1" stroke-width=".7" opacity=".6"/>
  <path d="M101 9 113 3H127L139 9 145 28 137 42H103L95 28Z" fill="url(#pd-bronze)" stroke="#233738" stroke-width="2"/>
  <path d="m103 12 13-5h8l13 5 4 15-7 10h-28l-7-10Z" fill="none" stroke="#d8ccaa" stroke-width=".9" opacity=".58"/>
  <circle cx="120" cy="23" r="5" fill="#354b4f" stroke="#b7b496" stroke-width="1"/>
  <path d="m117 23 3-3 3 3-3 3Z" fill="#b3aa88"/>
</g><g clip-path="url(#pd-blade-clip)"><path d="M67 220H176V738H67Z" fill="url(#pd-sheen)" opacity=".38"/><path class="blade-glint" d="m53 242 132-73v24L53 267Z" fill="#f2f2df" opacity=".72"/></g></svg></div>
      <svg class="release-hand" viewBox="0 0 240 260" fill="none" aria-hidden="true" focusable="false">
  <path class="hand-palm" d="M88-12H160l9 63c3 18-1 34-8 52l-7 43c-3 23-15 44-31 43l-23-17-15-27-12-28c-9-21-7-40 2-59Z" fill="#0c181e" stroke="#63756e" stroke-opacity=".45" stroke-width="1.3"/>
  <path d="m91 20 64 5m-66 5 67 6M81 72l16 14m61-36-12 25M99 93l7 31" stroke="#829087" stroke-opacity=".3" stroke-width="1.2"/>
  <path class="hand-thumb" d="M93 108c-16-10-25-7-26 3-1 7 9 14 16 20l18 28c5 7 15 8 20 1 3-6-1-13-7-20l-10-19Z" fill="#112027" stroke="#63756e" stroke-opacity=".6" stroke-width="1.2"/>
  <g class="hand-fingers" fill="#14242b" stroke="#728078" stroke-opacity=".6" stroke-width="1.2">
    <path class="hand-finger" d="M145 91c13-6 30-2 34 8 3 9-4 17-15 20l-31 5c-12 1-17-6-13-13 3-6 13-7 25-9Z"/>
    <path class="hand-finger" d="M146 119c15-2 30 3 31 13 1 9-8 15-21 15l-30-3c-10-1-15-8-11-14 4-6 17-5 31-3Z"/>
    <path class="hand-finger" d="M140 146c13 1 25 7 24 16-2 9-12 13-25 9l-24-8c-9-3-12-10-7-15 5-4 18 0 32 5Z"/>
    <path class="hand-finger" d="M131 170c11 3 17 10 13 17-4 8-14 9-24 3l-17-12c-7-5-7-12-2-15 6-3 17 4 30 13Z"/>
  </g>
  <path d="m79-2 13 53 66 5 10-58" fill="#0b151a" stroke="#708177" stroke-opacity=".35" stroke-width="1.4"/>
  <path d="m89 40 70 6m-68-3 66 6" stroke="#b6b095" stroke-opacity=".25"/>
</svg>
      <div class="dagger-ground"></div>
      <svg class="landing-rings" viewBox="0 0 420 80" aria-hidden="true"><ellipse cx="210" cy="40" rx="100" ry="11"/><ellipse cx="210" cy="40" rx="155" ry="21"/></svg>`);
    stage.classList.add('has-dagger');
  }

  function animate(timeline, scene) {
    const gsap = window.gsap;
    const mount = scene?.querySelector('.dagger-stage');
    const fall = mount?.querySelector('.dagger-fall');
    if (!timeline || !gsap || !mount || !fall) return;
    const hand = mount.querySelector('.release-hand');
    const fingers = [...mount.querySelectorAll('.hand-finger')];
    const thumb = mount.querySelector('.hand-thumb');
    const ground = mount.querySelector('.dagger-ground');
    const rings = mount.querySelector('.landing-rings');
    const glint = mount.querySelector('.blade-glint');
    const landscape = scene.querySelector('.hero-landscape');
    const horizon = scene.querySelector('.hero-horizon');
    const frame = scene.querySelector('.scene-frame') || scene;
    const objectHeight = () => Math.min(mount.clientHeight * .66, 530);
    const landingY = () => mount.clientHeight * .83 - objectHeight() * (738 / 760);
    const startY = () => -Math.min(26, mount.clientHeight * .035);
    const drift = () => Math.min(18, mount.clientWidth * .045);
    const horizonY = () => mount.getBoundingClientRect().top - frame.getBoundingClientRect().top + mount.clientHeight * .85;

    timeline.set(fall, {
      width: () => objectHeight() * (240 / 760), height: objectHeight,
      xPercent: -50, x: drift, y: startY, rotation: -18, rotationY: -14,
      transformOrigin: '50% 46%', opacity: 1, scale: 1, force3D: true, immediateRender: true
    }, 0);
    if (hand) {
      timeline.set(hand, {xPercent:-50, x:()=>-Math.min(100,mount.clientHeight*.16), y:()=>mount.clientHeight*.047, rotation:-12, opacity:.95, transformOrigin:'50% 15%',immediateRender:true}, 0);
      fingers.forEach((finger,index) => timeline.to(finger, {
        x: 13 + index * 2, y: -5 - index * 2, rotation: -12 - index * 4,
        transformOrigin:'20% 15%', duration:.13, ease:'power2.inOut'
      }, .115 + index * .012));
      if (thumb) timeline.to(thumb, {x:-12,y:-3,rotation:15,transformOrigin:'80% 0%',duration:.14,ease:'power2.inOut'}, .12);
      timeline.to(hand, {y:()=>-mount.clientHeight*.18,opacity:0,rotation:-20,duration:.17,ease:'power2.in'}, .19);
    }
    timeline.to(fall, {
      rotation: 34, rotationY: 11, x:()=>drift()*.4,
      y:()=>mount.clientHeight*.025, duration:.18, ease:'power1.in'
    }, .18);
    timeline.to(fall, {
      rotation: 222, rotationY: -11, x:()=>-drift(),
      y:()=>mount.clientHeight*.10, duration:.24, ease:'none'
    }, .36);
    timeline.to(fall, {
      rotation: 360, rotationY: 0, x:0,
      y:landingY, duration:.16, ease:'power1.in'
    }, .60);
    timeline.to(fall, {scale:()=>innerWidth<=760?1.24:1.58,duration:.11,ease:'power1.inOut'}, .26);
    timeline.to(fall, {scale:1,duration:.13,ease:'power1.inOut'}, .57);
    timeline.to(fall, {y:()=>landingY()+2,rotation:358,duration:.025,ease:'power1.out'}, .76);
    timeline.to(fall, {y:landingY,rotation:360,duration:.035,ease:'power1.inOut'}, .785);
    timeline.to(fall, {opacity:0,duration:.10,ease:'power1.in'}, .83);

    ['herbal','koki','monovault'].forEach((key,index) => {
      const memory=mount.querySelector('.memory-'+key);
      if (!memory) return;
      const at=.285+index*.13;
      timeline.fromTo(memory,{opacity:0},{opacity:.62,duration:.035,ease:'power1.out'},at);
      timeline.to(memory,{opacity:0,duration:.055,ease:'power1.in'},at+.055);
    });
    if (glint) timeline.fromTo(glint,{y:-80,opacity:.1},{y:460,opacity:.7,duration:.55,ease:'none'},.19);
    if (ground) {
      timeline.set(ground,{scaleX:.025,opacity:.26,transformOrigin:'50% 50%',immediateRender:true},0);
      timeline.to(ground,{scaleX:1,opacity:.78,duration:.19,ease:'power2.out'},.75);
    }
    if (rings) {
      timeline.fromTo(rings,{xPercent:-50,yPercent:-50,scale:.2,opacity:0},{scale:1.2,opacity:.3,duration:.045,ease:'power1.out'},.755);
      timeline.to(rings,{scale:2.8,opacity:0,duration:.11,ease:'power2.out'},.8);
    }
    if (landscape) timeline.fromTo(landscape,{opacity:.18},{opacity:.65,duration:.19,ease:'power1.inOut'},.75);
    if (horizon) {
      timeline.set(horizon,{top:horizonY,immediateRender:true},0);
      timeline.fromTo(horizon,{scaleX:.02,opacity:0,transformOrigin:'50% 50%'},{scaleX:1,opacity:.65,duration:.19,ease:'power2.out'},.75);
    }
  }
  window.PrologueDagger = Object.freeze({animate, ready:Boolean(stage)});
})();
