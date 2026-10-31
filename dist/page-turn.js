/* A single corner-peel surface, driven only by the story's scroll progress. */
(() => {
  'use strict';
  const clamp=value=>Math.max(0,Math.min(1,value));
  const smooth=value=>{const t=clamp(value);return t*t*(3-2*t);};
  const style=(element,properties)=>Object.assign(element.style,properties);
  const fixed=value=>Number(value.toFixed(3));
  const coefficient=value=>Number(value.toFixed(6));

  // Clip a rectangle against one side of the moving fold, in paper coordinates.
  function halfPlane(points,nx,ny,c,front) {
    const result=[];
    for(let i=0;i<points.length;i++) {
      const a=points[i],b=points[(i+1)%points.length];
      const da=a.x*nx+a.y*ny-c,db=b.x*nx+b.y*ny-c;
      const insideA=front?da<=0:da>=0,insideB=front?db<=0:db>=0;
      if(insideA) result.push(a);
      if(insideA!==insideB) {
        const ratio=da/(da-db);
        result.push({x:a.x+(b.x-a.x)*ratio,y:a.y+(b.y-a.y)*ratio});
      }
    }
    return result;
  }

  function create({leaf,next}={}) {
    if(!leaf||!next)throw new TypeError('PaperTurn needs outgoing and incoming leaves.');
    const sheet=leaf.querySelector('.paper-sheet');
    if(!sheet)throw new TypeError('The outgoing leaf needs a .paper-sheet.');
    const original={clip:sheet.style.clipPath,webkitClip:sheet.style.webkitClipPath,
      opacity:sheet.style.opacity,pointer:sheet.style.pointerEvents,willChange:sheet.style.willChange};
    const stage=document.createElement('div');
    stage.className='paper-peel';stage.inert=true;stage.setAttribute('aria-hidden','true');
    style(stage,{position:'absolute',inset:'0',display:'none',zIndex:'4',pointerEvents:'none',overflow:'visible'});
    const back=document.createElement('div');back.className='paper-peel-back';
    style(back,{position:'absolute',left:'0',top:'0',transformOrigin:'0 0',pointerEvents:'none',willChange:'transform,clip-path',overflow:'hidden'});
    const wash=document.createElement('div');
    style(wash,{position:'absolute',inset:'0',pointerEvents:'none',background:'radial-gradient(ellipse at 82% 20%,rgba(255,253,245,.17),transparent 62%),linear-gradient(112deg,rgba(255,253,243,.12),transparent 38%,rgba(69,53,32,.10) 83%,rgba(255,253,243,.14))'});
    back.append(wash);stage.append(back);leaf.append(stage);

    const shadow=document.createElement('div');shadow.className='paper-peel-shadow';
    shadow.inert=true;shadow.setAttribute('aria-hidden','true');
    style(shadow,{position:'absolute',left:'0',top:'0',zIndex:'5',display:'none',pointerEvents:'none',transformOrigin:'0 0',background:'linear-gradient(180deg,transparent,rgba(44,31,15,.035) 20%,rgba(44,31,15,.13) 46%,rgba(44,31,15,.11) 52%,rgba(44,31,15,.025) 78%,transparent)',willChange:'transform,opacity'});
    next.append(shadow);

    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    style(svg,{position:'absolute',inset:'0',width:'100%',height:'100%',overflow:'visible',pointerEvents:'none'});
    const rim=document.createElementNS('http://www.w3.org/2000/svg','path');
    rim.setAttribute('fill','none');rim.setAttribute('stroke','#eee6d8');rim.setAttribute('stroke-width','.7');
    rim.setAttribute('stroke-linecap','round');
    svg.append(rim);stage.append(svg);
    let width=0,height=0,diagonal=0,shadowBand=0,progress=0,dead=false,turning=false;

    // Both sides share the same curved fold edge. The reflected side receives
    // the opposite bend so its boundary meets the original sheet exactly.
    function outline(points,nx,ny,c,bend,softness=0) {
      if(points.length<3)return {clip:'polygon(0 0,0 0,0 0)',fold:''};
      let path=`M ${fixed(points[0].x)} ${fixed(points[0].y)}`,fold='';
      for(let i=0;i<points.length;i++) {
        const a=points[i],b=points[(i+1)%points.length];
        const onFold=Math.abs(a.x*nx+a.y*ny-c)<.08&&Math.abs(b.x*nx+b.y*ny-c)<.08;
        const end=`${fixed(b.x)} ${fixed(b.y)}`;
        if(onFold&&Math.hypot(b.x-a.x,b.y-a.y)>1) {
          const control=`${fixed((a.x+b.x)/2+nx*bend)} ${fixed((a.y+b.y)/2+ny*bend)}`;
          path+=` Q ${control} ${end}`;
          fold=`M ${fixed(a.x)} ${fixed(a.y)} Q ${control} ${end}`;
        }else if(softness>0) {
          const length=Math.hypot(b.x-a.x,b.y-a.y);
          if(length>1) {
            const flex=Math.min(softness,length*.015);
            path+=` Q ${fixed((a.x+b.x)/2-(b.y-a.y)/length*flex)} ${fixed((a.y+b.y)/2+(b.x-a.x)/length*flex)} ${end}`;
          }else path+=` L ${end}`;
        }else path+=` L ${end}`;
      }
      return {clip:`path('${path} Z')`,fold};
    }

    function restore() {
      sheet.style.clipPath=original.clip;sheet.style.webkitClipPath=original.webkitClip;
      sheet.style.opacity=original.opacity;sheet.style.pointerEvents=original.pointer;
      sheet.style.willChange=original.willChange;
    }

    function draw(value) {
      if(dead||!width||!height)return;
      if(value<=0||value>=1) {
        turning=false;stage.style.display='none';shadow.style.display='none';restore();
        if(value>=1){sheet.style.opacity='0';sheet.style.pointerEvents='none';}
        return;
      }
      const envelope=Math.sin(Math.PI*value);
      const angle=.325+.024*envelope*Math.sin(value*5.2);
      const nx=Math.cos(angle),ny=Math.sin(angle);
      const c=(width*nx+height*ny)*(1-smooth(value));
      const bend=Math.min(width,height)*.024*envelope*(.8+.2*Math.sin(value*7.2));
      const rectangle=[{x:0,y:0},{x:width,y:0},{x:width,y:height},{x:0,y:height}];
      const front=outline(halfPlane(rectangle,nx,ny,c,true),nx,ny,c,bend);
      const folded=outline(halfPlane(rectangle,nx,ny,c,false),nx,ny,c,-bend,Math.min(width,height)*.004*envelope);
      sheet.style.clipPath=front.clip;sheet.style.webkitClipPath=front.clip;
      if(!turning) {
        turning=true;sheet.style.opacity=original.opacity;
        sheet.style.pointerEvents='none';sheet.style.willChange='clip-path';
        stage.style.display='block';shadow.style.display='block';
      }
      back.style.clipPath=folded.clip;back.style.webkitClipPath=folded.clip;
      // Reflection across the travelling fold exposes only the paper reverse,
      // while the real, selectable content remains on the unpeeled front.
      back.style.transform=`matrix(${coefficient(1-2*nx*nx)},${coefficient(-2*nx*ny)},${coefficient(-2*nx*ny)},${coefficient(1-2*ny*ny)},${fixed(2*c*nx)},${fixed(2*c*ny)})`;
      wash.style.opacity=String(.45+envelope*.3);
      rim.setAttribute('d',front.fold);rim.style.opacity=String(envelope*.36);

      const spread=.65+envelope*.35,band=shadowBand*spread;
      const length=diagonal*2,tx=-ny,ty=nx;
      shadow.style.transform=`matrix(${coefficient(tx)},${coefficient(ty)},${coefficient(nx*spread)},${coefficient(ny*spread)},${fixed(c*nx-tx*length/2-nx*band)},${fixed(c*ny-ty*length/2-ny*band)})`;
      shadow.style.opacity=String(envelope*.8);
    }

    function setProgress(value) {
      if(dead)return;
      const numeric=Number(value);if(!Number.isFinite(numeric))return;
      const nextValue=clamp(numeric);if(nextValue===progress)return;
      progress=nextValue;draw(progress);
    }
    function resize() {
      if(dead)return;
      width=leaf.offsetWidth;height=leaf.offsetHeight;diagonal=Math.hypot(width,height);
      shadowBand=Math.min(74,Math.max(35,width*.055));
      shadow.style.width=`${diagonal*2}px`;shadow.style.height=`${shadowBand*2}px`;
      const computed=getComputedStyle(sheet);
      style(back,{width:`${width}px`,height:`${height}px`,backgroundColor:computed.backgroundColor,
        backgroundImage:computed.backgroundImage,backgroundSize:computed.backgroundSize,
        backgroundPosition:computed.backgroundPosition,backgroundBlendMode:computed.backgroundBlendMode,
        boxShadow:'inset 0 0 75px rgba(61,46,26,.05)'});
      svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
      draw(progress);
    }
    function destroy() {
      if(dead)return;dead=true;stage.remove();shadow.remove();restore();
    }
    resize();
    return {setProgress,resize,destroy};
  }
  window.PaperTurn={create};
})();
