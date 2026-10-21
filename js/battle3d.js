// Live tabletop view. Picking is translated into the existing board's inch coordinates;
// all actions and legality checks remain in the game engine and main.js.
import { boardOf, deployZones, team, tpl, radius, opName, deployOk, canPlace, equipmentPlacement } from './game.js';
import { accessPointsOf } from './tombworld-access.js';
import { createModelKit } from './models3d.js';
import { createTerrainKit } from './terrain3d.js';
import { handleRotation, rectCorners } from './geometry.js';
import { L, getLang } from './i18n.js';
import { TEAM_MAP } from './data/teams.js';

let live=null, load=null, generation=0;
let remembered=null;
export function worldToBoard(g,p) {
  const b=boardOf(g),q={x:p.x+b.w/2,y:p.z+b.h/2};
  return Number.isFinite(q.x)&&Number.isFinite(q.y)&&q.x>=0&&q.y>=0&&q.x<=b.w&&q.y<=b.h?q:null;
}
export function battleModelSpec(g,o) {
  if(o.dead || o.reserve || o.placed===false || !Number.isFinite(o.x) || !Number.isFinite(o.y) || o.x<0 || o.y<0)return null;
  const b=boardOf(g);
  return {uid:o.uid,key:`${o.team}|${o.tplId}|${o.loadout||''}`,team:TEAM_MAP[o.team] || team(g,o.side),template:tpl(o),loadout:o.loadout,
    x:o.x-b.w/2,z:o.y-b.h/2,rotation:-(o.facing ?? (o.side===0?0:Math.PI))-Math.PI/2};
}
export function battleBoardData(g) {
  return {board:boardOf(g),terrain:g.terrain,objectives:g.objectives,deploy:deployZones(g),pads:g.pads||[],access:accessPointsOf(g),
    markers:(g.markers||[]).filter(m=>!m.carriedBy && ['ammo','mine','comms'].includes(m.kind)),tombWorld:!!g.map?.startsWith('tombworld-')};
}
export function battle3dMarkup(svg) {
  return `<div class="battle3d-stage"><div class="battle3d-source" aria-hidden="true">${svg}</div>
    <div class="battle3d-host"></div><p class="battle3d-status" role="status">${L('載入 3D 對戰…','Loading the 3D battlefield…')}</p>
    <div class="battle3d-tools"><button data-act="3dreset">${L('重設視角','Reset view')}</button><button data-act="3dtop">${L('俯視','Top view')}</button><button data-act="3dcover">${L('淡化地形','Fade terrain')}</button></div>
    <p class="battle3d-hint">${L('點模型選取／點地面操作 · WASD／方向鍵平移 · 拖空白或右鍵旋轉 · 中鍵平移 · 滾輪縮放 · 雙指縮放／平移','Click models / ground to play · WASD / arrow keys to pan · drag empty space or right-drag to orbit · middle-drag to pan · wheel to zoom · two fingers to zoom/pan')}</p></div>`;
}
export async function mountBattle3d(root,g,ui,callbacks) {
  if(!root)return;
  const seq=++generation;
  let THREE;
  try {THREE=await (load ||= import('./vendor/three.module.min.js'));}
  catch {root.querySelector('.battle3d-status').textContent=L('3D 引擎載入失敗，可切回 2D 繼續。','3D could not load. Switch to 2D to continue.');return;}
  if(seq!==generation || !root.isConnected)return;
  try {
    if(!live)live=createView(THREE,g);
    live.attach(root,g,ui,callbacks);
  }catch(e){console.error('3D battlefield',e);unmountBattle3d();root.querySelector('.battle3d-status').textContent=L('無法啟用 3D，請切回 2D 繼續。','3D is unavailable. Switch to 2D to continue.');}
}
export function unmountBattle3d() {generation++;if(live){remembered={...live.pose,target:live.pose.target.clone()};live.stop();live=null;}}
export function battle3dControl(action) {live?.control(action);}

function createView(T,initial) {
  const canvas=document.createElement('canvas');canvas.className='battle3d-canvas';
  canvas.setAttribute('aria-label',L('可操作的 3D 對戰棋盤','Interactive 3D battlefield'));canvas.tabIndex=0;
  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(1.75,window.devicePixelRatio||1));renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  const scene=new T.Scene();scene.background=new T.Color('#10151d');
  scene.add(new T.HemisphereLight('#dce8ff','#55503c',2));
  const sun=new T.DirectionalLight('#fff1d7',3);sun.position.set(-8,24,16);scene.add(sun);
  const rim=new T.DirectionalLight('#86acff',1.3);rim.position.set(12,9,-12);scene.add(rim);
  const camera=new T.PerspectiveCamera(42,1,.1,250),ray=new T.Raycaster(),floor=new T.Plane(new T.Vector3(0,1,0),0);
  const kit=createModelKit(T),tkit=createTerrainKit(T),templates=new Map(),models=new Map(),materials=new Set();
  const units=new T.Group();scene.add(units);
  const rings=new T.Group();scene.add(rings);
  const preview=new T.Group();scene.add(preview);
  const overlay=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));
  overlay.rotation.x=-Math.PI/2;overlay.position.y=.025;overlay.renderOrder=1;scene.add(overlay);
  let terrain=null,terrainKey='',root=null,g=initial,ui={},callbacks={},raf=0,stopped=false,textureSeq=0,refreshTimer=null;
  const pose=remembered?{...remembered,target:remembered.target.clone()}:{theta:0,phi:.7,distance:45,target:new T.Vector3()};
  let faded=false,drag=null;
  const pointers=new Map();
  const keys=new Set(),keyDirections={KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1],KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0]};
  const keyAliases={w:'KeyW',a:'KeyA',s:'KeyS',d:'KeyD',arrowup:'ArrowUp',arrowdown:'ArrowDown',arrowleft:'ArrowLeft',arrowright:'ArrowRight'};
  const cameraKey=e=>keyDirections[e.code]?e.code:keyAliases[e.key?.toLowerCase()];
  const clearKeys=()=>keys.clear();
  function editing(target){return !!target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])');}
  function keyDown(e){
    const code=cameraKey(e);if(!code)return;
    if(!root?.isConnected || e.defaultPrevented || e.isComposing || e.ctrlKey || e.altKey || e.metaKey || editing(e.target) || document.querySelector('#modal-root .modal, [role="dialog"], dialog[open]')){clearKeys();return;}
    e.preventDefault();const first=!keys.has(code);keys.add(code);if(first)keyboardPan(1/60);
  }
  function keyUp(e){keys.delete(cameraKey(e));}
  function focusChanged(e){if(editing(e.target))clearKeys();}
  document.addEventListener('keydown',keyDown);
  document.addEventListener('keyup',keyUp);
  document.addEventListener('focusin',focusChanged);
  document.addEventListener('visibilitychange',clearKeys);
  window.addEventListener('blur',clearKeys);
  let previousFrame=0;
  function keyboardPan(dt){
    if(!keys.size || !root?.isConnected)return;
    if(editing(document.activeElement) || document.querySelector('#modal-root .modal, [role="dialog"], dialog[open]')){clearKeys();return;}
    // Follow the camera's horizontal orientation; diagonal movement keeps the same speed.
    const x=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
    const z=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
    const length=Math.hypot(x,z);if(!length)return;
    const step=pose.distance*.35*dt/length;
    pose.target.x+=(x*Math.cos(pose.theta)+z*Math.sin(pose.theta))*step;
    pose.target.z+=(-x*Math.sin(pose.theta)+z*Math.cos(pose.theta))*step;
  }
  const collect=o=>o.traverse(n=>{for(const m of (Array.isArray(n.material)?n.material:[n.material]))if(m)materials.add(m);});
  function disposeGeometry(o){o?.traverse(n=>n.geometry?.dispose());}
  function disposeLabel(o){for(const n of [...o.children])if(n.userData.battleLabel){n.material.map?.dispose();n.material.dispose();o.remove(n);}}
  function label(o,text) {
    if(o.userData.labelText===text)return;disposeLabel(o);o.userData.labelText=text;
    const c=document.createElement('canvas'),ctx=c.getContext('2d');ctx.font='600 25px system-ui';
    c.width=Math.ceil(ctx.measureText(text).width)+24;c.height=44;ctx.font='600 25px system-ui';
    ctx.fillStyle='rgba(10,14,20,.9)';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#f0f5ff';ctx.textBaseline='middle';ctx.fillText(text,12,22);
    const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
    const s=new T.Sprite(new T.SpriteMaterial({map:tex,depthTest:false,transparent:true}));
    const box=new T.Box3().setFromObject(o);s.position.y=Math.max(1.8,box.max.y-o.position.y+.35);
    s.scale.set(c.width/c.height*.55,.55,1);s.renderOrder=20;s.userData.battleLabel=true;o.add(s);
  }
  function ring(x,y,r,color,opacity=.9){
    const m=new T.Mesh(new T.RingGeometry(r,r+.10,40),new T.MeshBasicMaterial({color,transparent:true,opacity,side:T.DoubleSide,depthTest:false}));
    m.rotation.x=-Math.PI/2;m.position.set(x-boardOf(g).w/2,.07,y-boardOf(g).h/2);m.renderOrder=5;rings.add(m);
  }
  function clearDynamic(group){group.traverse(o=>{o.geometry?.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});group.clear();}
  function syncModels() {
    const keep=new Set();
    for(const op of g.ops){const spec=battleModelSpec(g,op);if(!spec)continue;keep.add(op.uid);
      let o=models.get(op.uid);
      if(!o || o.userData.modelKey!==spec.key){
        if(o){disposeLabel(o);units.remove(o);}
        if(!templates.has(spec.key)) {const model=kit.buildOperative(spec.team,spec.template,spec.loadout);templates.set(spec.key,model);collect(model);}
        o=templates.get(spec.key).clone(true);o.userData={uid:op.uid,modelKey:spec.key};units.add(o);models.set(op.uid,o);
      }
      o.position.set(spec.x,0,spec.z);o.rotation.y=spec.rotation;
      label(o,`${opName(op,getLang())}  ${op.wounds}/${op.maxW}  ${op.order==='conceal'?'◈':'◆'}${op.ready?' ●':' ○'}`);
    }
    for(const [uid,o]of models)if(!keep.has(uid)){disposeLabel(o);units.remove(o);models.delete(uid);}
    clearDynamic(rings);
    for(const op of g.ops){if(!keep.has(op.uid))continue;const selected=ui.sel===op.uid,highlight=ui.highlight?.get(op.uid);
      if(selected||highlight)ring(op.x,op.y,radius(op)+.10,selected?'#ffe08a':highlight.includes('target')?'#ff6c6c':'#f0ad55');
    }
  }
  function syncTerrain() {
    const key=JSON.stringify(battleBoardData(g));if(key===terrainKey)return;terrainKey=key;
    if(terrain){scene.remove(terrain);disposeGeometry(terrain);}
    terrain=tkit.buildBoard(battleBoardData(g));collect(terrain);scene.add(terrain);fadeTerrain();
    const b=boardOf(g);overlay.scale.set(b.w,b.h,1);
  }
  function fadeTerrain(){terrain?.traverse(o=>{if(o.isMesh && o.position.y>.12){for(const m of (Array.isArray(o.material)?o.material:[o.material])){m.transparent=faded;m.opacity=faded?.28:1;m.depthWrite=!faded;}}});}
  // Rasterise the existing SVG overlays so ranges, paths, objectives and markers stay identical in both views.
  function refreshOverlay() {
    if(stopped||!root?.isConnected)return;
    const source=root.querySelector('#board');if(!source)return;const seq=++textureSeq;
    const clone=source.cloneNode(true),src=[source,...source.querySelectorAll('*')],dst=[clone,...clone.querySelectorAll('*')];
    const props=['fill','fill-opacity','stroke','stroke-width','stroke-opacity','stroke-dasharray','opacity','font-family','font-size','font-weight','text-anchor','paint-order','stroke-linecap','stroke-linejoin'];
    src.forEach((node,i)=>{const style=getComputedStyle(node);for(const k of props){const v=style.getPropertyValue(k);if(v)dst[i].style.setProperty(k,v);}});
    clone.querySelectorAll('.op,.equipment-preview,.equipment-rotation-handles').forEach(n=>n.remove());
    const b=boardOf(g);clone.setAttribute('viewBox',`0 0 ${b.w} ${b.h}`);clone.setAttribute('width',String(b.w*48));clone.setAttribute('height',String(b.h*48));
    clone.removeAttribute('id');clone.style.width=`${b.w*48}px`;clone.style.height=`${b.h*48}px`;clone.style.maxHeight='none';clone.style.display='block';
    const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'})),img=new Image();
    img.onload=()=>{URL.revokeObjectURL(url);if(stopped||seq!==textureSeq)return;const tex=new T.Texture(img);tex.needsUpdate=true;tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());overlay.material.map?.dispose();overlay.material.map=tex;overlay.material.needsUpdate=true;};
    img.onerror=()=>URL.revokeObjectURL(url);img.src=url;
  }
  function scheduleOverlay(){if(refreshTimer==null)refreshTimer=setTimeout(()=>{refreshTimer=null;refreshOverlay();},80);}
  // Measurements can change without a full application render (touch taps and Esc included).
  const measureObserver=new MutationObserver(scheduleOverlay);
  function syncPreview(angleOverride=null) {
    clearDynamic(preview);const e=ui.equipmentPreview;if(!e)return;
    const angle=angleOverride ?? e.angle,b=boardOf(g),entry=equipmentPlacement(g,e.p,angle),color=entry?'#37d995':'#ff6262';
    if(e.source.type==='terrain'){
      const t=entry?.item || {...e.source.item,x:e.p.x-e.source.item.w/2,y:e.p.y-e.source.item.h/2,angle};
      const piece=tkit.buildPiece(t);
      // Clone materials: preview transparency must not alter the actual terrain's shared materials.
      piece.traverse(n=>{if(n.material){n.material=n.material.clone();n.material.color.set(color);n.material.transparent=true;n.material.opacity=.55;}});
      piece.position.x-=b.w/2;piece.position.z-=b.h/2;preview.add(piece);
      rectCorners(t).forEach((p,i)=>{const h=new T.Mesh(new T.SphereGeometry(.22,12,8),new T.MeshBasicMaterial({color,depthTest:false}));h.position.set(p.x-b.w/2,.65,p.y-b.h/2);h.renderOrder=30;h.userData.handle=i;preview.add(h);});
    }else{
      const m=new T.Mesh(new T.CylinderGeometry(.4,.4,.15,24),new T.MeshBasicMaterial({color,transparent:true,opacity:.7}));m.position.set(e.p.x-b.w/2,.2,e.p.y-b.h/2);preview.add(m);
    }
    if(angleOverride!=null)status(`${L('裝備角度','Equipment angle')} ${angle}° · ${entry?L('位置合法，放開滑鼠後按右側確認','Legal; release, then confirm on the right'):L('位置不合法','Illegal position')}`);
  }
  function status(text=''){const el=root?.querySelector('.battle3d-status');if(el){el.textContent=text;el.hidden=!text;}}
  function updateCamera(){camera.position.set(pose.target.x+pose.distance*Math.sin(pose.phi)*Math.sin(pose.theta),pose.distance*Math.cos(pose.phi),pose.target.z+pose.distance*Math.sin(pose.phi)*Math.cos(pose.theta));camera.lookAt(pose.target);camera.updateMatrixWorld();}
  function cast(e) {const r=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);}
  function point(e){cast(e);const p=ray.ray.intersectPlane(floor,new T.Vector3());return p?worldToBoard(g,p):null;}
  function pick(e){cast(e);scene.updateMatrixWorld(true);
    for(const hit of ray.intersectObjects([...preview.children,...models.values()],true)){let n=hit.object;while(n){if(n.userData.handle!=null)return {handle:n.userData.handle};if(n.userData.uid)return {uid:n.userData.uid};n=n.parent;}}
    return {};
  }
  function pan(dx,dy){const k=pose.distance/Math.max(canvas.clientHeight,1)*.7;pose.target.x+=(-dx*Math.cos(pose.theta)+dy*Math.sin(pose.theta))*k;pose.target.z+=(dx*Math.sin(pose.theta)+dy*Math.cos(pose.theta))*k;}
  function down(e){if(e.button>2)return;e.preventDefault();canvas.focus({preventScroll:true});pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);
    if(pointers.size===2){drag={mode:'gesture',moved:true,span:gesture().span,mid:gesture().mid};return;}
    const hit=pick(e),p=point(e),op=hit.uid&&g.ops.find(o=>o.uid===hit.uid);
    const canDrag=e.button===0 && !callbacks.measuring() && op && g.phase==='deploy' && (!g.eqDeploy || g.eqDeploy.done) && canPlace(g,op) && op.placed!==false && op.side!==g.ai;
    drag={id:e.pointerId,start:{x:e.clientX,y:e.clientY},last:{x:e.clientX,y:e.clientY},hit,p,mode:e.button===0&&!callbacks.measuring()&&hit.handle!=null?'rotate':canDrag?'unit':e.button===1||e.shiftKey?'pan':'orbit',reverseOrbit:e.button===0&&e.pointerType!=='touch',moved:false,angle:ui.equipmentPreview?.angle||0};
  }
  function gesture(){const ps=[...pointers.values()];return {span:Math.hypot(ps[1].x-ps[0].x,ps[1].y-ps[0].y),mid:{x:(ps[0].x+ps[1].x)/2,y:(ps[0].y+ps[1].y)/2}};}
  function move(e){if(!pointers.has(e.pointerId)){const p=point(e);if(p){callbacks.hover?.(p,pick(e).uid,e);if(callbacks.measuring())scheduleOverlay();}return;}
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(!drag)return;e.preventDefault();
    if(pointers.size===2){const v=gesture();if(drag.span)pose.distance=Math.max(8,Math.min(95,pose.distance*drag.span/Math.max(5,v.span)));if(drag.mid)pan(v.mid.x-drag.mid.x,v.mid.y-drag.mid.y);drag={mode:'gesture',moved:true,span:v.span,mid:v.mid};updateCamera();return;}
    if(drag.id!==e.pointerId)return;
    if(!drag.moved && Math.hypot(e.clientX-drag.start.x,e.clientY-drag.start.y)<4)return;drag.moved=true;
    const dx=e.clientX-drag.last.x,dy=e.clientY-drag.last.y;drag.last={x:e.clientX,y:e.clientY};
    if(drag.mode==='rotate'){const p=point(e);if(p&&drag.p){drag.angleNow=handleRotation(ui.equipmentPreview.p,drag.p,p,drag.angle,e.shiftKey);syncPreview(drag.angleNow);}}
    else if(drag.mode==='unit'){const p=point(e),o=g.ops.find(o=>o.uid===drag.hit.uid);if(p&&o){drag.dest=p;models.get(o.uid)?.position.set(p.x-boardOf(g).w/2,0,p.y-boardOf(g).h/2);clearDynamic(rings);ring(p.x,p.y,radius(o)+.1,deployOk(g,o,p)?'#37d995':'#ff6262');}}
    else if(drag.mode==='pan')pan(dx,dy);
    else {const direction=drag.reverseOrbit?-1:1;pose.theta-=dx*.008*direction;pose.phi=Math.max(.06,Math.min(1.35,pose.phi+dy*.006*direction));}
    updateCamera();
  }
  function up(e,cancel=false){const d=drag;pointers.delete(e.pointerId);drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    if(pointers.size){const [id,p]=[...pointers][0];drag={id,mode:'orbit',moved:true,start:p,last:p};return;}
    if(!d)return;
    if(cancel){syncModels();syncPreview();status();return;}
    if(d.mode==='rotate'){if(d.moved&&d.angleNow!=null)callbacks.angle(d.angleNow);status();return;}
    if(d.mode==='unit'&&d.moved){if(d.dest)callbacks.deploy(d.hit.uid,d.dest);syncModels();return;}
    if(!d.moved && e.button===0){const p=point(e);if(p)callbacks.click(p,d.hit.uid,e);}
  }
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',e=>up(e));canvas.addEventListener('pointercancel',e=>up(e,true));
  canvas.addEventListener('lostpointercapture',e=>{if(drag?.id===e.pointerId)up(e,true);});
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('wheel',e=>{e.preventDefault();pose.distance=Math.max(8,Math.min(95,pose.distance*Math.exp(e.deltaY*.001)));updateCamera();},{passive:false});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();status(L('3D 顯示暫停，請切回 2D 繼續。','3D display paused; switch to 2D to continue.'));});
  function frame(now){if(stopped)return;const dt=previousFrame?Math.min(.05,(now-previousFrame)/1000):0;previousFrame=now;const w=canvas.clientWidth,h=canvas.clientHeight;if(w&&h){keyboardPan(dt);const ratio=renderer.getPixelRatio();if(canvas.width!==Math.floor(w*ratio)||canvas.height!==Math.floor(h*ratio)){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}updateCamera();renderer.render(scene,camera);}raf=requestAnimationFrame(frame);}
  raf=requestAnimationFrame(frame);
  return {pose,
    attach(el,state,bui,cb){measureObserver.disconnect();root=el;g=state;ui=bui;callbacks=cb;root.querySelector('.battle3d-host').append(canvas);const measurement=root.querySelector('#measure');if(measurement)measureObserver.observe(measurement,{childList:true,subtree:true});status();syncTerrain();syncModels();syncPreview();refreshOverlay();updateCamera();},
    control(action){if(action==='3dcover'){faded=!faded;fadeTerrain();root?.querySelector('[data-act="3dcover"]')?.classList.toggle('on',faded);return;}pose.target.set(0,0,0);pose.theta=0;pose.phi=action==='3dtop'?.06:.7;pose.distance=Math.max(boardOf(g).w,boardOf(g).h)*1.5;updateCamera();},
    stop(){stopped=true;textureSeq++;clearKeys();document.removeEventListener('keydown',keyDown);document.removeEventListener('keyup',keyUp);document.removeEventListener('focusin',focusChanged);document.removeEventListener('visibilitychange',clearKeys);window.removeEventListener('blur',clearKeys);measureObserver.disconnect();clearTimeout(refreshTimer);cancelAnimationFrame(raf);for(const o of models.values())disposeLabel(o);for(const o of templates.values())disposeGeometry(o);disposeGeometry(terrain);clearDynamic(rings);clearDynamic(preview);overlay.material.map?.dispose();overlay.geometry.dispose();overlay.material.dispose();materials.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();canvas.remove();},
  };
}
