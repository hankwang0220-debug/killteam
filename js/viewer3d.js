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

const st = { mode: 'ops', team: TEAMS[0].id, op: null, loadouts: {}, spin: true, map: 'default', hatchesOpen: false, style:'compare' };
const SCULPT_NOTES={
  stealthSuits:['XV26 官方圖參考精修：一體式蛋形頭胸甲、紅框單眼、斜肩甲、黑色機械四肢、分趾腳掌與前臂掛載武器。','XV26 official-photo sculpt: integrated egg-shaped head/chest shell, single optic, sloping shoulders, exposed dark limbs, split feet and forearm-mounted weapons.'],
  wolfScouts:['狼偵查小隊精修：鬍鬚與辮髮、毛皮、符文裝具及芬里斯狼面容。','Wolf Scouts: beards and braids, pelts, runic equipment and Fenrisian Wolf faces.'],
  inquisitorialAgents:['異端審判庭精修：分型特務面容、技術目鏡、寂靜修女頭盔與書卷骷髏；徵召盟軍沿用所屬陣營造型。','Inquisition: distinct agent faces, augmetic optics, Silence helmets and Tome-skulls; requisitioned allies retain their own faction sculpts.'],
  spectres:['魅影小隊精修：兜帽護目鏡、偽裝條、胸甲、專家裝具與通訊信標。','Spectres: hooded goggles, camouflage strips, breastplates, specialist gear and relay beacons.'],
  aquilons:['風暴天鷹精修：密閉頭盔、分層胸甲、空降背包散熱器與哨戒機具。','Aquilons: sealed helmets, layered breastplates, grav-chute vents and servo-sentries.'],
  voidDancers:['虛空舞者精修：分型劇場面具、鏡面罩、菱格服飾與專家裝具。','Void-dancers: distinct theatrical masks, mirror faceplates, diamond suits and specialist gear.'],
  vespids:['胡蜂尖翼精修：複眼、口器、觸角、分節甲殼、翅脈與監督無人機細節。','Vespids: compound eyes, mandibles, antennae, segmented chitin, wing veins and Oversight Drone details.'],
  angels:['死亡天使精修：分型動力甲頭盔、呼吸格柵、分層胸甲、護脛與專家裝具。','Angels of Death: distinct power-armour helmets, respirators, layered chest plates, greaves and specialist gear.'],
  ratlings:['萊特林精修：矮小偵察兵與高大歐格林、分型頭部、背包、彈袋及戰犬裝具。','Ratlings: small scouts and towering Ogryns, distinct heads, packs, pouches and Battlemutt harnesses.'],
  sanctifiers:['淨化者精修：兜帽面容、長袍層次、念珠、聖物與專家裝具。','Sanctifiers: hooded faces, layered robes, prayer beads, relics and specialist equipment.'],
  raveners:['蛇蟲精修：分節甲殼、長顱口器、細齒、六肢輪廓與各專家武裝。','Raveners: segmented carapaces, elongated skulls and jaws, teeth, six-limbed anatomy and specialist weapons.'],
  handOfArchon:['執政官之手精修：尖盔、銀色面甲、分節護甲、藥劑瓶與專家裝具。','Hand of the Archon: pointed helmets, silver masks, segmented armour, vials and specialist gear.'],
  corsairVoidscarred:['虛空之痕海盜精修：分型頭部、尖耳、骨色面甲、護甲與靈能裝具。','Corsairs: distinct bare and helmeted heads, pointed ears, bone masks, armour and psychic equipment.'],
  deathwatch:['死亡守望精修：銀色呼吸格柵、分層黑甲、銀肩甲與老兵裝具。','Deathwatch: silver respirators, layered black armour, silver pauldrons and veteran equipment.'],
  mandrakes:['曼德拉精修：凹陷眼窩、後掠髮束、蒼白肋骨輪廓與陰影布條。','Mandrakes: inset eyes, swept hair, pale rib planes and shadow rags.'],
  murderwing:['屠戮之翼精修：喙形面甲、彎角、翼狀甲片、跳躍背包散熱器與專家裝具。','Murderwing: beaked masks, horns, wing plates, jump-pack vents and specialist gear.'],
  wreckaKrew:['破壞專隊精修：歐克寬顎、金屬護顎、厚重鉚釘甲、手掌與炸彈史奎格裝具。','Wreckas: broad Ork jaws, metal jaw plates, riveted armour, hands and Bomb Squig equipment.'],
  nemesisClaw:['復仇之爪精修：蝠翼頭盔、骨色顎罩、閃電甲紋與專家裝具。','Nemesis Claw: bat-wing helmets, bone jaw masks, lightning armour details and specialist gear.'],
  scoutSquad:['偵察小隊精修：裸頭面容、耳機、輕型胸甲、胸前彈袋與偵察儀器。','Scouts: bare faces, headsets, light breastplates, chest pouches and reconnaissance instruments.'],
  celestianInsidiants:['潔天使隱伏者精修：全覆頭盔、呼吸面罩、銀邊重甲與專家裝具。','Insidiants: enclosed helmets, respirators, silver-edged armour and specialist equipment.'],
  canoptekCircle:['冥工之環精修：金屬顱骨、分節肋甲、爬行機械護殼、活塞與感測器。','Canoptek Circle: metal skulls, segmented ribs, crawler shells, pistons and sensors.'],
  broodBrothers:['族群裔兵精修：分層軍盔與護甲、混種額骨、族長顎骨與專家裝具。','Brood Brothers: layered helmets and armour, hybrid cranial ridges, Patriarch jaws and specialist gear.'],
  bladesOfKhaine:['凱恩之刃精修：保留深綠甲色，區分蠍武士的下顎砲、女妖面罩與復仇者冠盔。','Blades of Khaine: dark green armour, Scorpion mandiblasters, Banshee masks and Avenger crests.'],
  goremongers:['灑血狂精修：黃銅面罩、彎角、交叉束帶、護脛與專家配件。','Goremongers: brass masks, horns, crossed harnesses, greaves and specialist gear.'],
  hernkynYaegirs:['遠行者獵手精修：明顯矮於人類的短腿寬肩體型，搭配鬍鬚、厚外套與野外裝具。','Yaegirs: short legs, broad shoulders and a lower stature than humans, with beards, coats and expedition gear.'],
  elucidianStarstriders:['行商浪人精修：軍帽與面容、金邊翻領、肩章、專家儀器及獵犬裝具。','Starstriders: caps and faces, gilt lapels, epaulettes, specialist instruments and Canid harnesses.'],
  chaosCult:['混沌邪教精修：兜帽面容、變異體顎骨、彎角、皮革束帶與不對稱變異肢體。','Chaos Cult: hooded faces, mutant jaws, horns, leather harnesses and asymmetric mutations.'],
  legionaries:['軍團精修：彎角頭盔、金邊分層重甲、呼吸格柵與各專家裝具。','Legionary sculpt: curved horns, layered gilt armour, respirator grilles and specialist equipment.'],
  novitiates:['見習修女精修：頭巾、面容、分層胸甲、長袍縫邊與修會裝具。','Novitiate sculpt: veils, faces, layered breastplates, robe seams and devotional equipment.'],
  battleclade:['戰鬥支隊精修：不對稱機械面罩、呼吸器、義肢連桿與能源背包。','Battleclade sculpt: asymmetric augmetic faces, respirators, bionic struts and power packs.'],
  exoditeDragonMasters:['流亡馭龍師精修：骨色面甲、細長龍獸、分離上下顎、凹陷眼窩、細齒、鱗片與三趾足爪。','Exodite sculpt: bone faceplates, lean drakes, separate jaws, inset eyes, teeth, scales and three-toed feet.'],
  exaction:['強徵小隊精修：稜角執法頭盔、狹縫面罩、分層防暴護甲與機械獵犬裝甲。','Exaction: angular helmets, slit visors, layered riot armour and Cyber-mastiff plates.'],
  hierotek:['技師環精修：金屬顱骨、凹陷眼窩、分節肋甲、術士冠飾與電漿胞機械細節。','Hierotek: metal skulls, inset optics, segmented ribs, Cryptek crowns and Plasmacyte details.'],
  hunterClade:['獵手之爪精修：遊騎兵兜帽、機械呼吸器、滲透者感測頭盔與外露義肢。','Hunter Clade: Ranger hoods, mechanical respirators, Infiltrator sensors and exposed bionics.'],
  kasrkin:['卡舍津精修：橄欖綠、深綠、土褐與沙色迷彩，搭配重甲、護目鏡與專家裝具。','Kasrkin: olive, dark green, brown and sand camouflage with carapace armour, goggles and specialist gear.'],
  warpcoven:['千子次元秘教精修：條紋冠盔、分層金邊甲片、符飾垂布與奸角獸鳥喙彎角。','Warpcoven: banded crests, layered gilt armour, tabards and beaked Tzaangors.'],
  wyrmblade:['蟲刃精修：隆起額骨、礦工頭盔與頭燈、工作護具及專家攜行裝備。','Wyrmblade: ridged brows, mining helmets and lamps, work armour and specialist equipment.'],
  blooded:['混沌叛軍精修：破舊鋼盔、呼吸面罩、拼接鐵甲與各專家裝具。','Blooded: battered helmets, respirator masks, salvaged plates and specialist gear.'],
  fellgor:['惡角獸精修：長吻、彎角、山羊鬍、皮革束帶與護脛，並加入專家配件。','Fellgor: muzzles, curved horns, beards, leather harnesses, greaves and specialist accessories.'],
  gellerpox:['蓋勒痘魔精修：變異體面容、拼接裝甲與三種獨立害蟲造型。','Gellerpox: mutant faces, salvaged armour and three distinct nuisance creatures.'],
  hearthkyn:['爐心打撈者精修：矮壯重甲、鬍鬚頭盔與專家工具。','Hearthkyn: stocky armour, bearded helmets and specialist tools.'],
  navyBreachers:['海軍跳幫者精修：密閉頭盔、分層艙戰護甲與支援機具。','Navy: sealed helmets, layered void armour and support machines.'],
  phobos:['恐懼突襲小隊精修：輕型動力甲、感測頭盔、骷髏面罩與專家裝具。','Phobos: light power armour, sensor helmets, skull masks and specialist gear.'],
  kommandos:['歐克專屬精修：寬下顎、深眼窩、肩背肌肉與粗製武器；格洛特與史奎格另有專屬配件。','Kommando sculpt: broad jaws, inset eyes, muscular shoulders and salvaged weapons; separate Grot and Squig details.'],
  tauPathfinders:['探路者專屬精修：單眼感測頭盔、分層肩甲、專家儀器與無人機感測器。','Pathfinder sculpt: single-optic helmets, layered shoulder plates, specialist instruments and drone sensors.'],
  plagueMarines:['瘟疫戰士專屬精修：重型鏽蝕甲片、呼吸面罩、護脛與專家攜行配件。','Plague Marine sculpt: heavy corroded plates, respirator helmets, greaves and specialist equipment.'],
  farstalkers:['遠獵者專屬精修：分層鳥喙、後掠羽刺、皮革護具、獵手裝備與克魯特獵犬。','Farstalker sculpt: layered beaks, swept quills, leather armour, hunting equipment and Kroot Hounds.'],
  deathKorps:['克里格專屬精修：防毒面罩、護頸鋼盔、分層大衣、胸前裝具與專家配件。','Death Korps sculpt: respirator masks, neck-guard helmets, layered coats, chest webbing and specialist gear.'],
};
let live = null; // the mounted viewer (renderer, scene, loop)
let mountSeq = 0;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const teamOf = (id) => TEAMS.find((t) => t.id === id) || TEAMS[0];
const opsOf = (t) => (t.ops || []).filter((o) => o.name?.en && !o.name.en.startsWith('('));

/** Raycaster also hits invisible objects; reject hits hidden by any ancestor. */
export function visibleModelHit(object) {
  for (let node = object; node; node = node.parent) if (!node.visible) return false;
  return true;
}

/** Fit the whole bounding sphere in both screen dimensions, including deep bodies and oval bases. */
export function modelViewFrame(bounds,aspect,fov=35){
  const {min,max}=bounds;
  const target={x:(min.x+max.x)/2,y:(min.y+max.y)/2,z:(min.z+max.z)/2};
  const radius=Math.hypot(max.x-min.x,max.y-min.y,max.z-min.z)/2;
  const vertical=fov*Math.PI/360,horizontal=Math.atan(Math.tan(vertical)*(aspect>0?aspect:1));
  return {target,distance:Math.max(2,radius/Math.sin(Math.min(vertical,horizontal))*1.12)};
}

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
      <button class="ghost wide" data-act="modelsBack">← ${L('返回', 'Back')}</button>
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
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // softer, more natural light on the smooth-shaded models
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#15181d');
  scene.fog = new THREE.Fog('#15181d', 45, 90);
  scene.environment = kit.studioEnv(renderer); // soft reflections so metal edges and trim read
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
      const compare=st.style==='compare';
      if(compare){st.spin=false;cam.theta=0;cam.phi=1.15;}
      const gap = Math.max(compare?4.8:2.1, ...ops.map((o) => (o.oval ? Math.max(...o.oval) : o.base) / 25.4 + 0.7));
      const items=ops.flatMap((op) => {
        try {
          let model;
          if(compare){
            model=new THREE.Group();
            const original=kit.buildOperative(t,op,st.loadouts[op.id],{style:'original'});
            const refined=kit.buildOperative(t,op,st.loadouts[op.id],{style:'refined'});
            const left=new THREE.Box3().setFromObject(original),right=new THREE.Box3().setFromObject(refined);
            const half=Math.max(2.2,left.max.x-right.min.x+.55)/2;
            for(const [m,x,label]of [[original,-half,L('原版','Original')],[refined,half,L('改良試作','Refined prototype')]]){
              addLabel(m,label,.23);m.position.x=x;model.add(m);
            }
            model.userData.picks=original.userData.picks;
          }else model=kit.buildOperative(t,op,st.loadouts[op.id],{style:st.style});
          return [{id:op.id,model,label:tx(op.name)}];
        } catch (e) { console.error('model', op.id, e); return []; }
      });
      const spacing=compare?Math.max(gap,...items.map(({model})=>{const b=new THREE.Box3().setFromObject(model);return Math.max(b.max.x-b.min.x,b.max.z-b.min.z)+.7;})):gap;
      lineup(items,spacing);
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
      const m=models.get(id),bb=new THREE.Box3().setFromObject(m);
      const fit=modelViewFrame(bb,canvas.clientWidth/Math.max(1,canvas.clientHeight),camera.fov);
      cam.goal.set(fit.target.x,fit.target.y,fit.target.z);cam.rGoal=fit.distance;
    } else {
      cam.goal.copy(st.overview.center); cam.rGoal = st.overview.r / Math.min(1, camera.aspect || 1) ** 0.7;
    }
    if (snap) { cam.target.copy(cam.goal); cam.r = cam.rGoal; }
    for (const m of models.values()) {
      m.visible=st.mode!=='ops'||!id||m.userData.opId===id;
      m.children.forEach((c) => { if (c.userData.label) c.visible = !id; });
    }
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
        <label class="m3d-team">${L('模型版本','Model version')}<select data-m3="style"><option value="compare" ${st.style==='compare'?'selected':''}>${L('並排對照（左原版／右改良）','Compare (original left / refined right)')}</option><option value="original" ${st.style==='original'?'selected':''}>${L('原版','Original')}</option><option value="refined" ${st.style==='refined'?'selected':''}>${L('改良試作','Refined prototype')}</option></select></label><p class="hint">${L('僅供模型預覽；對戰仍使用原版。點選特工可近看對照。','Preview only; battles keep the original. Select an operative for a closer comparison.')}</p>
        ${SCULPT_NOTES[t.id]&&st.style!=='original'?`<p class="hint">${L(...SCULPT_NOTES[t.id])}</p>`:''}
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
        <ul><li>${L(`重型地形 ${HEIGHTS.heavy}″ 高`, `Heavy terrain ${HEIGHTS.heavy}″ tall`)}</li><li>${L(`輕型地形 ${HEIGHTS.light}″ 高`, `Light terrain ${HEIGHTS.light}″ tall`)}</li>${m.tombWorld ? `<li>${L('牆、柱與艙門視為無限高（模型 2.6″）', 'Walls, pillars and hatchways count as infinitely tall (model 2.6″)')}</li><li>${L('艙門 2″、門楣到 2.6″；輕掩體依零件高度', 'Hatchways 2″ with a lintel to 2.6″; light cover at each part\'s height')}</li>` : ''}</ul>
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
    const hit = ray.intersectObjects([...models.values()].filter((m) => m.visible), true)
      .find((h) => visibleModelHit(h.object));
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
    if (k === 'style') { st.style=e.target.value;buildScene(); }
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
      scene.environment?.dispose();
      renderer.dispose();
    },
    kit, tkit, THREE, cam, focus, st, rebuild: buildScene, renderer, scene,
  };
  buildScene();
  raf = requestAnimationFrame(frame);
}

export function unmountModels() {
  if (live) { live.stop(); live = null; }
}
/** The mounted viewer, for tests and debugging. */
export const viewerState = () => live;
