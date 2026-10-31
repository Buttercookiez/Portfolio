(() => {
  'use strict';
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  const $=(selector,scope=document)=>scope.querySelector(selector);
  const $$=(selector,scope=document)=>[...scope.querySelectorAll(selector)];
  const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
  const sequence=$('.paper-sequence'),stage=$('.paper-stage');
  const leaves=$$('.paper-leaf'),navigation=$$('header a[href^="#"]');
  const readingTrack=$('.reading-track>span'),readingLabel=$('.reading-label');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const email='johnfrancismarabe040905@gmail.com';
  const labels=['01 — BEGINNING','02 — ABOUT','03 — PROJECTS','04 — NEXT CHAPTER'];
  const hashes=['#top','#about','#work','#contact'];
  const hashToPage={'#top':0,'#begin':0,'#about':1,'#work':2,'#discover':2,'#protect':2,'#play':2,'#contact':3};
  const transitions=[[.15,.32],[.45,.62],[.77,.93]];
  const destinations=[0,.445,.755,1];
  const clamp=value=>Math.max(0,Math.min(1,value));
  let lenis=null,tick=null,tween=null,turns=[],chapterTriggers=[],current=0,progress=0,magneticController=null,resizeTimer;
  let motionEnabled=false,openingHandle=null,openingActive=false,openingStarted=false;
  let resizeProgress=null,viewportWidth=innerWidth,viewportHeight=innerHeight;
  if(gsap&&ScrollTrigger){gsap.registerPlugin(ScrollTrigger);gsap.ticker.lagSmoothing(0);}

  function setActive(index){
    current=index;
    navigation.forEach(link=>{
      if(link.hash===hashes[index])link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
    leaves.forEach((leaf,i)=>{
      const hidden=motionEnabled&&i!==index;
      leaf.inert=hidden;
      if(hidden)leaf.setAttribute('aria-hidden','true');else leaf.removeAttribute('aria-hidden');
    });
    if(readingLabel)readingLabel.textContent=labels[index];
    sequence.dataset.page=String(index+1);
  }
  function writeProgress(value){
    const rounded=value.toFixed(3);
    if(sequence.dataset.progress===rounded)return;
    sequence.dataset.progress=rounded;
    if(readingTrack)readingTrack.style.transform=`scaleX(${value})`;
  }
  function render(value){
    progress=clamp(value);
    transitions.forEach(([start,end],index)=>{
      const local=clamp((progress-start)/(end-start));
      turns[index]?.setProgress(local);
      leaves[index].style.visibility=local>=1?'hidden':'visible';
    });
    const index=progress<.25?0:progress<.55?1:progress<.86?2:3;
    if(index!==current)setActive(index);
    writeProgress(progress);
  }
  function syncNaturalChapter(){
    if(motionEnabled)return;
    let index=0;
    leaves.forEach((leaf,i)=>{if(leaf.getBoundingClientRect().top<=innerHeight*.5)index=i;});
    if(index!==current)setActive(index);
  }
  function updateNaturalProgress(){
    if(motionEnabled)return;
    writeProgress(clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));
  }
  function headerHeight(){return $('.site-header').offsetHeight;}
  function scrollRange(){return Math.max(1,sequence.offsetHeight-stage.offsetHeight);}
  function storyY(value){return Math.max(0,sequence.getBoundingClientRect().top+scrollY-headerHeight()+scrollRange()*value);}
  function jumpTo(index,instant=false){
    if(resizeProgress!==null)resizeProgress=destinations[index];
    const y=motionEnabled?storyY(destinations[index]):Math.max(0,leaves[index].getBoundingClientRect().top+scrollY-headerHeight()-20);
    if(!motionEnabled)setActive(index);
    if(lenis)lenis.scrollTo(y,{immediate:instant,force:instant,duration:instant?0:1});
    else window.scrollTo({top:y,behavior:'auto'});
    // An instant jump must expose the destination before keyboard focus moves.
    if(motionEnabled&&instant&&tween){ScrollTrigger.update();tween.progress(destinations[index]);}
  }
  function deferForResize(){
    if(!motionEnabled)return false;
    if(resizeProgress===null){
      if(innerWidth===viewportWidth&&innerHeight===viewportHeight)return false;
      // Refresh may run before resize dispatch. Keep the last rendered ratio.
      resizeProgress=progress;
    }
    tween?.pause();return true;
  }
  function stopScroll(){
    if(tick&&gsap)gsap.ticker.remove(tick);
    tick=null;lenis?.destroy();lenis=null;
  }
  function setupMagnets(enabled){
    magneticController?.abort();magneticController=null;
    if(gsap)$$('.magnetic').forEach(element=>{gsap.killTweensOf(element);gsap.set(element,{x:0,y:0});});
    if(!enabled||!fine.matches||!gsap)return;
    magneticController=new AbortController();const {signal}=magneticController;
    $$('.magnetic').forEach(element=>{
      let rect;
      element.addEventListener('pointerenter',()=>rect=element.getBoundingClientRect(),{signal});
      element.addEventListener('pointermove',event=>{
        if(!rect||event.pointerType==='touch')return;
        gsap.to(element,{x:Math.max(-6,Math.min(6,(event.clientX-rect.left-rect.width/2)*.1)),y:Math.max(-5,Math.min(5,(event.clientY-rect.top-rect.height/2)*.1)),duration:.35,ease:'power3.out',overwrite:'auto'});
      },{signal});
      element.addEventListener('pointerleave',()=>gsap.to(element,{x:0,y:0,duration:.6,ease:'elastic.out(1,.5)',overwrite:'auto'}),{signal});
      element.addEventListener('blur',()=>gsap.set(element,{x:0,y:0}),{signal});
    });
  }
  function teardown(){
    tween?.scrollTrigger?.kill();tween?.kill();tween=null;
    chapterTriggers.forEach(trigger=>trigger.kill());chapterTriggers=[];
    stopScroll();turns.forEach(turn=>turn.destroy());turns=[];
    leaves.forEach(leaf=>{leaf.inert=false;leaf.removeAttribute('aria-hidden');leaf.style.visibility='';});
    document.body.classList.remove('has-scroll-story','natural-story');
  }
  function configure(preserve=true){
    if(reduced.matches)openingHandle?.skip();
    if(preserve&&!motionEnabled)syncNaturalChapter();
    const page=current;
    teardown();
    motionEnabled=!reduced.matches&&!!(gsap&&ScrollTrigger&&window.PaperTurn);
    document.body.classList.toggle('has-scroll-story',motionEnabled);
    document.body.classList.toggle('natural-story',!motionEnabled);
    document.body.classList.toggle('static-story',!motionEnabled);
    document.body.classList.toggle('reduced-motion',reduced.matches);
    document.body.classList.toggle('motion-off',!motionEnabled);
    document.documentElement.dataset.motion=motionEnabled?'on':'off';
    if(motionEnabled){
      turns=leaves.slice(0,3).map((leaf,index)=>PaperTurn.create({leaf,next:leaves[index+1]}));
      setActive(0);render(0);
      if(window.Lenis){
        lenis=new Lenis({autoRaf:false,smoothWheel:true,syncTouch:false,lerp:.09,anchors:false,prevent:node=>Boolean(node.closest('[data-lenis-prevent],dialog'))});
        lenis.on('scroll',ScrollTrigger.update);
        tick=time=>lenis?.raf(time*1000);gsap.ticker.add(tick);
        if(openingActive||dialog.open)lenis.stop();
      }
      const state={p:0};
      const smoothTo=gsap.quickTo(state,'p',{duration:.22,ease:'power2.out',onUpdate:()=>{if(!deferForResize())render(state.p);}});
      const direct=value=>{const next=clamp(value);smoothTo(next,next);smoothTo.tween.progress(1).pause();state.p=next;render(next);};
      const scrollTrigger=ScrollTrigger.create({
        trigger:sequence,start:()=>`top top+=${headerHeight()}`,end:()=>`+=${scrollRange()}`,
        onUpdate:self=>{if(deferForResize()){smoothTo.tween.pause();return;}smoothTo(self.progress);},
        onRefresh:self=>{if(deferForResize()){smoothTo.tween.pause();return;}direct(self.progress);}
      });
      tween={scrollTrigger,progress:direct,pause:()=>smoothTo.tween.pause(),kill:()=>smoothTo.tween.kill()};
    }else{
      setActive(page);
      if(gsap&&ScrollTrigger)chapterTriggers=leaves.map((leaf,index)=>ScrollTrigger.create({
        trigger:leaf,start:'top center',end:'bottom center',
        onEnter:()=>setActive(index),onEnterBack:()=>setActive(index),
        onRefresh:self=>{if(self.isActive)setActive(index);}
      }));
    }
    setupMagnets(motionEnabled&&!openingActive);
    ScrollTrigger?.refresh();
    if(preserve)jumpTo(page,true);
    if(!motionEnabled){syncNaturalChapter();updateNaturalProgress();}
  }
  function startOpening(force=false){
    if(openingActive||(!force&&openingStarted)||!window.PortfolioOpening)return;
    openingStarted=true;
    openingHandle=PortfolioOpening.play({
      enabled:motionEnabled,
      onStart:()=>{openingActive=true;lenis?.stop();setupMagnets(false);},
      onComplete:()=>{
        openingActive=false;lenis?.start();setupMagnets(motionEnabled);
        ScrollTrigger?.refresh();jumpTo(hashToPage[location.hash]??0,true);
        updateNaturalProgress();
      }
    });
  }
  reduced.addEventListener('change',()=>configure());
  fine.addEventListener('change',()=>setupMagnets(motionEnabled&&!openingActive));
  window.addEventListener('scroll',()=>{if(!motionEnabled){updateNaturalProgress();if(!chapterTriggers.length)syncNaturalChapter();}},{passive:true});
  window.addEventListener('resize',()=>{
    if(motionEnabled){if(resizeProgress===null)resizeProgress=progress;tween?.pause();}
    clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{
      const saved=clamp(resizeProgress??progress);
      try{
        turns.forEach(turn=>turn.resize());lenis?.resize?.();ScrollTrigger?.refresh();
        if(motionEnabled&&tween){
          const y=storyY(saved);
          if(lenis)lenis.scrollTo(y,{immediate:true,force:true});else scrollTo({top:y,behavior:'auto'});
          ScrollTrigger.update();tween.progress(saved);
        }else{syncNaturalChapter();updateNaturalProgress();}
      }finally{
        viewportWidth=innerWidth;viewportHeight=innerHeight;resizeProgress=null;
      }
    },180);
  },{passive:true,capture:true});
  $$('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
    const index=hashToPage[link.hash];if(index===undefined)return;
    event.preventDefault();
    const replay=link.classList.contains('wordmark')&&index===0;
    const skip=link.classList.contains('skip-link');
    history.pushState(null,'',link.hash);jumpTo(index,replay||skip);
    if(skip){const heading=$('h1,h2',leaves[index]);if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
    if(replay)startOpening(true);
  }));
  window.addEventListener('popstate',()=>jumpTo(hashToPage[location.hash]??0,true));

  const dialog=$('#project-dialog');
  const projects={
    herbal:{
      title:'Hanap Medisina',
      summary:'An offline app for exploring Philippine medicinal plants.',
      detail:'A project focused on making medicinal plant information easier to access.',
      links:[
        {label:'Visit site',url:'https://hanap-medsesinav2.vercel.app/'},
        {label:'View source',url:'https://github.com/Buttercookiez/HanapMedsesinav2'}
      ]
    },
    koki:{
      title:'Koki Emulator',
      summary:'A multi-platform emulator application project with a simple interface for accessing games.',
      detail:'A project about organizing and browsing a varied game library through a user-friendly interface.',
      links:[
        {label:'Visit site',url:'https://koki-emulator09.vercel.app/'},
        {label:'View source',url:'https://github.com/Buttercookiez/KokiEmulator'}
      ]
    },
    monovault:{
      title:'Monovault',
      summary:'An offline password manager for passwords, recovery phrases, and sensitive information.',
      detail:'The application uses AES-256-GCM encryption. Its focus is a simple, local space for personal information.',
      links:[
        {label:'Visit site',url:'https://monovault.vercel.app/'},
        {label:'View source',url:'https://github.com/Buttercookiez/Monovault'}
      ]
    }
  };
  function renderProjectLinks(project){
    const container=$('.dialog-links',dialog);if(!container)return;
    container.replaceChildren();
    project.links.forEach(item=>{
      let url;try{url=new URL(item.url);}catch{return;}
      if(!['http:','https:'].includes(url.protocol))return;
      const anchor=document.createElement('a');anchor.href=url.href;
      anchor.target='_blank';anchor.rel='noopener noreferrer';
      anchor.setAttribute('aria-label',`${item.label} for ${project.title} (opens in a new tab)`);
      anchor.append(document.createTextNode(item.label));
      const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');anchor.append(arrow);
      container.append(anchor);
    });
    container.hidden=container.childElementCount===0;
  }
  let previousFocus;
  $$('[data-project]').forEach(button=>button.addEventListener('click',()=>{
    const project=projects[button.dataset.project];if(!project)return;
    previousFocus=button;
    $('#dialog-title').textContent=project.title;
    $('.dialog-summary').textContent=project.summary;
    $('.dialog-details').textContent=project.detail;
    renderProjectLinks(project);
    lenis?.stop();dialog.showModal();dialog.scrollTop=0;
  }));
  $$('.dialog-close,.dialog-done').forEach(button=>button.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('close',()=>{if(!openingActive)lenis?.start();previousFocus?.focus({preventScroll:true});});
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
  });
  let toastTimer;
  function toast(text){clearTimeout(toastTimer);$('.toast').textContent=text;$('.toast').classList.add('visible');toastTimer=setTimeout(()=>$('.toast').classList.remove('visible'),2500);}
  $('.copy-email').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(email);toast('Email copied.');}
    catch{const range=document.createRange();range.selectNodeContents($('.copy-email'));const selection=getSelection();selection.removeAllRanges();selection.addRange(range);toast('Email selected. Copy it with your device’s controls.');}
  });
  configure(false);startOpening();
  window.addEventListener('load',()=>{turns.forEach(turn=>turn.resize());lenis?.resize?.();ScrollTrigger?.refresh();jumpTo(hashToPage[location.hash]??0,true);updateNaturalProgress();},{once:true});
  document.fonts?.ready.then(()=>{turns.forEach(turn=>turn.resize());lenis?.resize?.();ScrollTrigger?.refresh();updateNaturalProgress();});
})();
