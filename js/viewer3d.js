// 3D viewer: every team's operatives as procedural miniatures (models3d.js), every killzone with its terrain
// and the equipment pieces (terrain3d.js).
// three.js (js/vendor, MIT) is loaded the first time the viewer opens, so the rest of the app doesn't need it.
import { TEAMS } from './data/teams.js';
import { L, tx } from './i18n.js';
import { createModelKit } from './models3d.js';
import { createTerrainKit, HEIGHTS } from './terrain3d.js';
import { BOARD, DEPLOY, makeTerrain, OBJECTIVES } from './game.js';
import { MISSIONS } from './missions.js';
import { TOMB_WORLD_MAPS, tombWorldTerrain, tombWorldAccessPoints, initialHatches } from './tombworld-maps.js';

const THREE_URL = './vendor/three.module.min.js'; // three.js r160
let threeP = null;
const loadThree = () => (threeP ||= import(THREE_URL));

const st = { mode: 'ops', team: TEAMS[0].id, op: null, loadouts: {}, spin: true, map: 'default', hatchesOpen: false };
let live = null; // the mounted viewer (renderer, scene, loop)
let mountSeq = 0;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const teamOf = (id) => TEAMS.find((t) => t.id === id) || TEAMS[0];
const opsOf = (t) => (t.ops || []).filter((o) => o.name?.en && !o.name.en.startsWith('('));

/** Every killzone: the default map, the mission packs' maps and the six Tomb World layouts. */
const MAPS = [
  { id: 'default', name: { zh: '原有地圖', en: 'Default map' }, data: () => ({ board: BOARD, terrain: makeTerrain(), objectives: OBJECTIVES, deploy: DEPLOY }) },
  ...['generatorium', 'negotiation'].map((id) => {
    const m = MISSIONS[id];
    return { id, name: m.name, data: () => ({ board: BOARD, terrain: m.terrain, objectives: m.objectives || [], deploy: m.deploy || DEPLOY }) };
  }),
  ...TOMB_WORLD_MAPS.map((m) => ({
    id: m.id, name: m.name, tombWorld: true,
    data: (open) => {
      const access = tombWorldAccessPoints(m);
      const hatches = Object.fromEntries(Object.keys(initialHatches(m)).map((k) => [k, open ? 'open' : 'closed']));
      return { board: m.board, terrain: tombWorldTerrain(m, hatches), objectives: m.objectives, deploy: m.deploy, pads: m.pads, access, tombWorld: true };
    },
  })),
];
const mapOf = (id) => MAPS.find((m) => m.id === id) || MAPS[0];

export function modelsView() {
  const tab = (mode, zh, en) => `<button class="${st.mode === mode ? 'on' : ''}" data-m3mode="${mode}">${L(zh, en)}</button>`;
  return `<main class="m3d">
    <aside class="m3d-side">
      <div class="m3d-tabs">${tab('ops', '特工', 'Operatives')}${tab('maps', '地圖', 'Maps')}${tab('equip', '裝備', 'Equipment')}</div>
      <div class="m3d-controls"></div>
      <ul class="m3d-ops"></ul>
    </aside>
    <section class="m3d-stage">
      <canvas class="m3d-canvas"></canvas>
      <div class="m3d-msg">${L('載入 3D 引擎中…', 'Loading the 3D engine…')}</div>
      <div class="m3d-info"></div>
      <div class="m3d-hint">${L('拖曳旋轉・滾輪或雙指縮放・點模型查看', 'Drag to orbit · wheel or pinch to zoom · tap a model')}</div>
    </section>
  </main>`;
}

/** Starts (or restarts) the viewer inside the element modelsView() rendered. */
export async function mountModels(root) {
  unmountModels();
  const seq = ++mountSeq;
  if (!root) return;
  const canvas = root.querySelector('.m3d-canvas'), msg = root.querySelector('.m3d-msg');
  let THREE;
  try { THREE = await loadThree(); } catch {
    msg.textContent = L('無法載入 3D 引擎。', 'Could not load the 3D engine.');
    return;
  }
  if (seq !== mountSeq || !canvas.isConnected) return;
  msg?.remove();
  const kit = createModelKit(THREE), tkit = createTerrainKit(THREE);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#15181d');
  scene.fog = new THREE.Fog('#15181d', 45, 90);
  scene.add(new THREE.HemisphereLight('#dfe8ff', '#3a3226', 1.1));
  const sun = new THREE.DirectionalLight('#fff4e0', 2.2);
  sun.position.set(8, 16, 10); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 60 });
  sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  const rim = new THREE.DirectionalLight('#8ab8ff', 0.8); rim.position.set(-6, 5, -8); scene.add(rim);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 48), new THREE.MeshStandardMaterial({ color: '#23262b', roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.201; ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(40, 40, '#2e333a', '#2a2e34'); grid.position.y = -0.119; scene.add(grid);
  const camera = new THREE.PerspectiveCamera(35, canvas.clientWidth / Math.max(1, canvas.clientHeight), 0.05, 200);

  const cam = { target: new THREE.Vector3(), goal: new THREE.Vector3(), r: 10, rGoal: 10, theta: 0.5, phi: 1.1 };
  const models = new Map(); // id → model root (operatives or equipment pieces)
  let content = new THREE.Group();
  scene.add(content);

  const labelTex = (text) => {
    const c = document.createElement('canvas'), ctx = c.getContext('2d');
    ctx.font = '600 44px system-ui, sans-serif';
    const w = Math.ceil(ctx.measureText(text).width) + 36;
    c.width = w; c.height = 64;
    ctx.font = '600 44px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(12,14,17,.78)'; ctx.beginPath(); ctx.roundRect(0, 0, w, 64, 14); ctx.fill();
    ctx.fillStyle = '#e8ecf2'; ctx.textBaseline = 'middle'; ctx.fillText(text, 18, 34);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return { t, aspect: w / 64 };
  };
  const addLabel = (m, text, k = 0.26) => {
    const { t: tex, aspect } = labelTex(text);
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    const box = new THREE.Box3().setFromObject(m);
    label.scale.set(k * aspect, k, 1);
    label.position.set(0, box.max.y - m.position.y + 0.22, 0);
    label.renderOrder = 10;
    label.userData.label = true;
    m.add(label);
  };
  /** Lays the items out in a grid, each with a label, as models that can be focused. */
  const lineup = (items, gap, labelSize) => {
    const cols = Math.max(1, Math.ceil(Math.sqrt(items.length * 1.8))), rowsN = Math.ceil(items.length / cols);
    items.forEach(({ id, model, label }, i) => {
      const row = Math.floor(i / cols), col = i % cols;
      model.position.set((col - (cols - 1) / 2) * gap, 0, (row - (rowsN - 1) / 2) * gap * 1.1);
      model.userData.opId = id;
      addLabel(model, label, labelSize);
      content.add(model); models.set(id, model);
    });
  };

  function buildScene() {
    scene.remove(content);
    content.traverse((o) => { o.geometry?.dispose(); if (o.material?.map) o.material.map.dispose(); });
    content = new THREE.Group(); models.clear();
    grid.visible = st.mode !== 'maps';
    if (st.mode === 'ops') {
      const t = teamOf(st.team), ops = opsOf(t);
      const gap = Math.max(2.1, ...ops.map((o) => (o.oval ? Math.max(...o.oval) : o.base) / 25.4 + 0.7));
      lineup(ops.flatMap((op) => {
        try { return [{ id: op.id, model: kit.buildOperative(t, op, st.loadouts[op.id]), label: tx(op.name) }]; } catch (e) { console.error('model', op.id, e); return []; }
      }), gap);
    } else if (st.mode === 'equip') {
      lineup(tkit.EQUIPMENT_PIECES.map((p) => ({ id: p.id, model: p.build(), label: tx(p.name) })), 4.4, 0.45);
    } else {
      const m = mapOf(st.map);
      content.add(tkit.buildBoard(m.data(st.hatchesOpen)));
    }
    scene.add(content);
    const bb = new THREE.Box3().setFromObject(content), size = bb.getSize(new THREE.Vector3());
    st.overview = { center: bb.getCenter(new THREE.Vector3()).setY(st.mode === 'maps' ? 0 : 0.5), r: Math.max(5, Math.max(size.x, size.z) * (st.mode === 'maps' ? 1.45 : 1.6)) };
    if (st.mode === 'maps') { cam.phi = 0.85; }
    fillSide();
    focus(st.op && models.has(st.op) ? st.op : null, true);
  }

  function focus(id, snap = false) {
    st.op = id;
    if (id && models.has(id)) {
      const m = models.get(id), bb = new THREE.Box3().setFromObject(m), h = bb.max.y, w = Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z);
      cam.goal.set(m.position.x, Math.max(0.5, h * 0.45), m.position.z);
      cam.rGoal = Math.max(2.6, h * 3.2, w * 2.2);
    } else {
      cam.goal.copy(st.overview.center); cam.rGoal = st.overview.r / Math.min(1, camera.aspect || 1) ** 0.7;
    }
    if (snap) { cam.target.copy(cam.goal); cam.r = cam.rGoal; }
    for (const m of models.values()) m.children.forEach((c) => { if (c.userData.label) c.visible = !id; });
    root.querySelectorAll('.m3d-ops li').forEach((li) => li.classList.toggle('on', li.dataset.op === (st.mode === 'maps' ? st.map : id)));
    showInfo();
  }

  function fillSide() {
    root.querySelectorAll('.m3d-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.m3mode === st.mode));
    const controls = root.querySelector('.m3d-controls'), list = root.querySelector('.m3d-ops');
    if (st.mode === 'ops') {
      const t = teamOf(st.team);
      controls.innerHTML = `<label class="m3d-team">${L('隊伍', 'Team')}
        <select data-m3="team">${TEAMS.map((x) => `<option value="${x.id}" ${x.id === st.team ? 'selected' : ''}>${esc(tx(x.name))}</option>`).join('')}</select></label>
        <button class="ghost wide" data-m3="all">${L('全隊一覽', 'Whole team')}</button>`;
      list.innerHTML = opsOf(t).map((o) => `<li data-op="${o.id}" style="--tc:${t.color}">${esc(tx(o.name))}</li>`).join('');
    } else if (st.mode === 'equip') {
      controls.innerHTML = `<button class="ghost wide" data-m3="all">${L('全部一覽', 'Show all')}</button>`;
      list.innerHTML = tkit.EQUIPMENT_PIECES.map((p) => `<li data-op="${p.id}" style="--tc:#c9a24a">${esc(tx(p.name))}</li>`).join('');
    } else {
      controls.innerHTML = mapOf(st.map).tombWorld ? `<button class="ghost wide" data-m3="hatches">${st.hatchesOpen ? L('關上所有艙門', 'Close all hatchways') : L('打開所有艙門', 'Open all hatchways')}</button>` : '';
      list.innerHTML = MAPS.map((m) => `<li data-map="${m.id}" data-op="${m.id}" style="--tc:${m.tombWorld ? '#3aff8a' : '#c9a24a'}">${esc(tx(m.name))}</li>`).join('');
    }
  }

  function showInfo() {
    const box = root.querySelector('.m3d-info');
    if (st.mode === 'maps') {
      const m = mapOf(st.map), d = m.data(st.hatchesOpen);
      box.innerHTML = `<b>${esc(tx(m.name))}</b><span>${d.board.w}″ × ${d.board.h}″ · ${L(`${d.objectives.length} 個目標點`, `${d.objectives.length} objectives`)}</span>
        <ul><li>${L(`重型地形 ${HEIGHTS.heavy}″ 高`, `Heavy terrain ${HEIGHTS.heavy}″ tall`)}</li><li>${L(`輕型地形 ${HEIGHTS.light}″ 高`, `Light terrain ${HEIGHTS.light}″ tall`)}</li>${m.tombWorld ? `<li>${L('艙門 2″、門楣到 2.6″；輕掩體依零件高度', 'Hatchways 2″ with a lintel to 2.6″; light cover at each part\'s height')}</li>` : ''}</ul>
        <small>${L('藍色＝A 方降落區，橘色＝B 方降落區', 'Blue = drop zone A, orange = drop zone B')}</small>`;
      return;
    }
    if (st.mode === 'equip') {
      const p = tkit.EQUIPMENT_PIECES.find((x) => x.id === st.op);
      box.innerHTML = p ? `<b>${esc(tx(p.name))}</b>` : `<b>${L('裝備與標記', 'Equipment & markers')}</b><span>${L(`${tkit.EQUIPMENT_PIECES.length} 種`, `${tkit.EQUIPMENT_PIECES.length} pieces`)}</span>`;
      return;
    }
    const t = teamOf(st.team), op = opsOf(t).find((o) => o.id === st.op);
    if (!op) { box.innerHTML = `<b>${esc(tx(t.name))}</b><span>${L(`${opsOf(t).length} 名特工`, `${opsOf(t).length} operatives`)}</span>`; return; }
    const ws = kit.weaponsOf(op, st.loadouts[op.id]);
    const { picks } = models.get(op.id)?.userData || {};
    const held = new Set([picks?.ranged?.w.group, picks?.melee?.w.group].filter(Boolean));
    const seen = new Set();
    const list = ws.filter((w) => !seen.has(w.group || w.id) && seen.add(w.group || w.id))
      .map((w) => `<li class="${held.has(w.group || w.id) ? 'held' : ''}">${w.type === 'melee' ? '⚔' : '⌖'} ${esc(tx(w.name).replace(/（.*）|\s*\(.*\)/, ''))}</li>`).join('');
    const lo = op.loadouts ? `<select data-m3="loadout">${Object.entries(op.loadouts).map(([id, w]) => `<option value="${id}" ${(st.loadouts[op.id] || Object.keys(op.loadouts)[0]) === id ? 'selected' : ''}>${esc(w.map((x) => tx(x.name)).join(' + '))}</option>`).join('')}</select>` : '';
    box.innerHTML = `<b>${esc(tx(op.name))}</b>${lo}<ul>${list}</ul><small>${L('亮色＝模型手持的武器', 'Highlighted = held by the model')}</small>`;
  }

  // ----- input -----
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  const pointers = new Map();
  let drag = null, pinch = null;
  const onDown = (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), r: cam.rGoal }; drag = null; }
    else drag = { x: e.clientX, y: e.clientY, moved: 0 };
  };
  const onMove = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size === 2) { const [a, b] = [...pointers.values()]; cam.rGoal = cam.r = clampR(pinch.r * pinch.d / Math.max(10, Math.hypot(a.x - b.x, a.y - b.y))); return; }
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY;
    cam.theta -= dx * 0.008; cam.phi = Math.min(1.5, Math.max(0.15, cam.phi - dy * 0.006));
    st.spin = false;
  };
  const onUp = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (drag && drag.moved < 6) pick(e);
    drag = null;
  };
  const clampR = (r) => Math.min(80, Math.max(1.2, r));
  const onWheel = (e) => { e.preventDefault(); cam.rGoal = clampR(cam.rGoal * Math.exp(e.deltaY * 0.0012)); };
  function pick(e) {
    if (st.mode === 'maps') return;
    const r = canvas.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects([...models.values()], true).find((h) => !h.object.isSprite || h.object.visible);
    if (!hit) return;
    let o = hit.object; while (o && !o.userData.opId) o = o.parent;
    if (o) focus(o.userData.opId === st.op ? null : o.userData.opId);
  }
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  const onClick = (e) => {
    const tab = e.target.closest('[data-m3mode]');
    if (tab) { if (tab.dataset.m3mode !== st.mode) { st.mode = tab.dataset.m3mode; st.op = null; buildScene(); } return; }
    const li = e.target.closest('.m3d-ops li');
    if (li?.dataset.map) { if (li.dataset.map !== st.map) { st.map = li.dataset.map; buildScene(); } return; }
    if (li) return focus(li.dataset.op === st.op ? null : li.dataset.op);
    if (e.target.closest('[data-m3="all"]')) focus(null);
    if (e.target.closest('[data-m3="hatches"]')) { st.hatchesOpen = !st.hatchesOpen; const keep = { theta: cam.theta, phi: cam.phi, r: cam.r }; buildScene(); Object.assign(cam, keep, { rGoal: keep.r }); }
  };
  const onChange = (e) => {
    const k = e.target.dataset.m3;
    if (k === 'team') { st.team = e.target.value; st.op = null; buildScene(); }
    if (k === 'loadout') { st.loadouts[st.op] = e.target.value; buildScene(); }
  };
  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);

  // ----- loop -----
  let raf = 0, last = performance.now();
  const frame = (now) => {
    if (!canvas.isConnected) return unmountModels();
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix();
    }
    if (st.spin) cam.theta += dt * 0.25;
    cam.target.lerp(cam.goal, 1 - Math.pow(0.001, dt));
    cam.r += (cam.rGoal - cam.r) * (1 - Math.pow(0.001, dt));
    camera.position.set(cam.target.x + cam.r * Math.sin(cam.phi) * Math.sin(cam.theta), cam.target.y + cam.r * Math.cos(cam.phi), cam.target.z + cam.r * Math.sin(cam.phi) * Math.cos(cam.theta));
    camera.lookAt(cam.target);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };
  live = {
    stop() {
      cancelAnimationFrame(raf);
      root.removeEventListener('click', onClick); root.removeEventListener('change', onChange);
      scene.traverse((o) => { o.geometry?.dispose(); if (o.material?.map) o.material.map.dispose(); });
      renderer.dispose();
    },
    kit, tkit, THREE, cam, focus, st, rebuild: buildScene,
  };
  buildScene();
  raf = requestAnimationFrame(frame);
}

export function unmountModels() {
  if (live) { live.stop(); live = null; }
}
/** The mounted viewer, for tests and debugging. */
export const viewerState = () => live;
