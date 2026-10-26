// kasrkin: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { TEAM_MAP } from '../data/teams.js';
import { CHOICES, CONTROL, OBJ_R, autoFF, edgeDist, ffReady, foes, getOp, hasPloy, isEngaged, living, log, moved, needChoice, opName, radius, team, teamZh, tpl, visibility } from '../game.js';
import { bestStep, stepTo } from '../sanctifiers.js';
import { dist } from '../geometry.js';

// ---------- Kasrkin ----------
export const SKILLS = {
  lightEmUp: { name: { zh: '點燃他們', en: 'Light \'Em Up' }, desc: { zh: '遠程武器「重創」。', en: 'Ranged weapons have Severe.' } },
  forCadia: { name: { zh: '為了卡迪亞！', en: 'For Cadia!' }, desc: { zh: '近戰武器 Atk +1（最多 4）；近戰時第一次打擊 +1 傷害。', en: 'Melee weapons +1 Atk (max 4); the first strike when fighting deals 1 more.' } },
  strikeFast: { name: { zh: '快速打擊', en: 'Strike Fast' }, desc: { zh: '轉移（Reposition）時 Move +1"。', en: '+1" Move when repositioning.' } },
  iceInVeins: { name: { zh: '冷血', en: 'Ice In Your Veins' }, desc: { zh: '近戰、反擊或被射擊時，每次第一顆 3 以上的普通傷害 -1。', en: 'Fighting, retaliating or being shot: the first attack die inflicting 3+ Normal Dmg each sequence deals 1 less.' } },
};
/** Skill at Arms in effect for this operative (the team's, plus one from Tactical Command). */
export const skillOn = (g, op, id) => op.side < 2 && TEAM_MAP[op.team].skillAtArms && (((g.skills?.[op.side]?.tp === g.tp) && g.skills[op.side].ids.includes(id)) || (op.skillExtra?.tp === g.tp && op.skillExtra.id === id));
/** How many Skills at Arms the side picks this turning point (two while its Sergeant is in the killzone). */
export const skillSlots = (g, side) => (living(g, side).some((o) => tpl(o).veteranLeadership) ? 2 : 1);
/** Strategic gambit: the Skills at Arms for this turning point. */
export function setSkills(g, side, ids) {
  const pick = [...new Set(ids.filter((id) => SKILLS[id]))].slice(0, skillSlots(g, side));
  (g.skills ||= [null, null])[side] = { tp: g.tp, ids: pick };
  log(g, { zh: `${teamZh(g, side)} 戰技：${pick.map((id) => SKILLS[id].name.zh).join('、') || '無'}`, en: `${team(g, side).name.en} Skill at Arms: ${pick.map((id) => SKILLS[id].name.en).join(', ') || 'none'}` }, `side${side}`);
}
/** End of a side's Strategy phase: pick Skills at Arms if the player didn't; place the Clearance Sweep marker by the frontmost enemy. */
export function skillsStrategyEnd(g, side) {
  if (!TEAM_MAP[g.teams[side]].skillAtArms) return;
  if (g.skills?.[side]?.tp !== g.tp) setSkills(g, side, ['lightEmUp', 'iceInVeins']);
  if (hasPloy(g, side, 'clearanceSweep') && g.sweep?.[side]?.tp !== g.tp) {
    const mine = living(g, side), cx = mine.reduce((s, o) => s + o.x, 0) / (mine.length || 1), cy = mine.reduce((s, o) => s + o.y, 0) / (mine.length || 1);
    const e = living(g, 1 - side).sort((a, b) => dist(a, { x: cx, y: cy }) - dist(b, { x: cx, y: cy }))[0];
    if (e) { (g.sweep ||= [null, null])[side] = { tp: g.tp, x: e.x, y: e.y }; log(g, { zh: `清掃標記放在 ${opName(e, 'zh')} 處（5" 範圍）`, en: `Clearance Sweep marker placed by ${opName(e, 'en')} (5" area)` }, `side${side}`); }
  }
}
/** Rapid Fire weapons: bolt pistol, hot-shot lasgun, hot-shot laspistol. */
export const rapidWeapon = (w) => !!w && (!!w.rules.rapid || /^bolt pistol$/i.test(w.name.en));
export const rapidOK = (op) => TEAM_MAP[op.team].rapidFire && !moved(op);
/** Clearance Sweep (ploy): the marker's 5" area. */
export const sweepOn = (g, op, target) => { const m = g.sweep?.[op.side]; return !!(m && m.tp === g.tp && target && dist(op, m) - radius(op) <= 5 && dist(target, m) - radius(target) <= 5); };
export const adaptiveOk = (g, op, k) => !!tpl(op).adaptive && g.adaptive?.[op.side]?.[k] !== g.tp;

/** Relocate (strategy ploy, not in TP1): a Kasrkin more than 3" from enemies, and each friend within 3" of it also more than 3" from enemies, make free Dashes. */
const farFromFoes = (g, o) => o.x > -50 && foes(g, o).every((e) => e.x < -50 || edgeDist(o, e) > 3);
export function ksRelocateMovers(g, side, ctx) {
  ctx.uids ||= (() => { const a = getOp(g, ctx.anchor); return a ? living(g, side).filter((o) => o === a || (farFromFoes(g, o) && edgeDist(o, a) <= 3)).map((o) => o.uid) : []; })();
  return ctx.uids.map((u) => getOp(g, u)).filter((o) => o && !o.dead);
}
export function registerKasrkinChoices() {
  CHOICES.ksRelocate = {
    kind: 'op', title: { zh: '轉移陣地：選一名離敵人超過 3" 的友方（它和它 3" 內、同樣離敵人超過 3" 的友方免費衝刺）', en: 'Relocate: pick a friendly more than 3" from enemies (it and friendlies within 3" of it, also more than 3" from enemies, make free Dashes)' },
    skippable: true, none: () => {},
    options: (g, side) => living(g, side).filter((o) => farFromFoes(g, o)).map((o) => ({ value: o.uid })),
    auto: (g, side) => living(g, side).filter((o) => farFromFoes(g, o)).sort((a, b) => ksRelocateMovers(g, side, { anchor: b.uid }).length - ksRelocateMovers(g, side, { anchor: a.uid }).length)[0]?.uid ?? null,
    apply: (g, side, uid) => needChoice(g, side, 'ksRelocateMoves', { anchor: uid }),
  };
  CHOICES.ksRelocateMoves = {
    kind: 'move', title: { zh: '轉移陣地：免費衝刺', en: 'Relocate: free Dashes' },
    movers: ksRelocateMovers, moveKind: () => 'dash', max: () => 3,
    autoAll(g, side, ctx) {
      for (const o of ksRelocateMovers(g, side, ctx)) {
        const es = foes(g, o).filter((e) => e.x > -50), near = (p) => Math.min(...es.map((e) => dist(e, p)));
        if (!es.length) return;
        // (towards the enemy, but staying out of their control range to shoot next)
        const q = bestStep(g, o, 3, 'dash', (p) => (near(p) < near(o) && near(p) > 6 ? -near(p) : null));
        if (q) { stepTo(g, o, q); log(g, { zh: `轉移陣地：${opName(o, 'zh')} 免費衝刺`, en: `Relocate: ${opName(o, 'en')} makes a free Dash` }, `side${side}`); }
      }
    },
  };
}

/** Seize the Initiative (firefight ploy): at the start of the Firefight phase, the player without initiative may have one Kasrkin perform a free 1AP action that doesn't move. */
export function ksSeizeStart(g) {
  const side = 1 - g.initiative;
  if (side > 1 || g.teams[side] !== 'kasrkin' || !ffReady(g, side, 'seizeInitiative')) return;
  const cands = living(g, side).filter((o) => o.x > -50);
  if (!cands.length) return;
  g.netcounter = { side, only: cands.map((o) => o.uid), resume: null, kind: 'control', noMove: true, ksSeize: true,
    label: { title: { zh: '奪取先機（1CP）', en: 'Seize the Initiative (1CP)' }, hint: { zh: '交戰階段開始：選一名友方免費執行一個 1AP 動作（不能移動），花 1CP；也可以略過。', en: 'Start of the Firefight phase: a friendly performs a free 1AP action (no moving) for 1CP; or pass.' } } };
  g.turn = side; g.counter = true;
}

/** Cover Retreat (firefight ploy): friendlies that can give a free Shoot after this one Falls Back (visible, within 6", not in enemy control range). */
export const ksCoverers = (g, op) => (op.team === 'kasrkin' && op.acted.ksFellBack ? living(g, op.side).filter((o) => o !== op && o.team === 'kasrkin' && o.x > -50 && !isEngaged(g, o) && edgeDist(o, op) <= 6 && visibility(g, op, o).visible) : []);

/** Give No Ground (firefight ploy): the marker it applies to, and whether it holds now (this activation, or until the next turning point). */
const gngOn = (g, side, obj) => { const m = g.ksGNG?.[side]; return !!m && m.id === (obj.id ?? obj.name) && (m.uid ? g.active === m.uid : m.tp === g.tp); };
/** Tied at a total APL of at least 2: the Kasrkin side controls the marker. */
export function ksGNGControl(g, obj, sum) {
  for (const s of [0, 1]) if (gngOn(g, s, obj) && sum[s] >= 2 && sum[1 - s] === sum[s]) return s;
  return null;
}
/** The marker a Kasrkin side would hold with it: a tie it would win, else the nearest marker it contests. */
export function ksGNGPick(g, side, near) {
  const objs = g.objectives || [];
  const tie = objs.find((m) => { const t = ctlSums(g, m); return t[side] >= 2 && t[1 - side] === t[side]; });
  return tie || objs.filter((m) => living(g, side).some((o) => dist(o, m) - radius(o) - OBJ_R <= CONTROL)).sort((a, b) => dist(a, near) - dist(b, near))[0] || null;
}
const ctlSums = (g, m) => [0, 1].map((s) => living(g, s).filter((o) => dist(o, m) - radius(o) - OBJ_R <= CONTROL).reduce((t, o) => t + tpl(o).apl, 0));
export function ksGNGSet(g, side, obj, uid) {
  (g.ksGNG ||= [null, null])[side] = { id: obj.id ?? obj.name, tp: g.tp, uid: uid || null };
  log(g, { zh: `寸土不讓：${uid ? '本次啟動' : '直到下回合開始'}，APL 總和至少 2 且與敵人相同時由卡舍津控制這個目標`, en: `Give No Ground: ${uid ? 'this activation' : 'until the next turning point'}, a tie at a total APL of 2+ on this marker goes to the Kasrkin` }, `side${side}`);
}
/** End of the Firefight phase: the computer (or a player who switched it to automatic) holds a tied marker. */
export function ksGNGEnd(g) {
  for (const s of [0, 1]) {
    if (g.teams[s] !== 'kasrkin') continue;
    const m = (g.objectives || []).find((o) => { const t = ctlSums(g, o); return t[s] >= 2 && t[1 - s] === t[s]; });
    if (m && autoFF(g, s, 'giveNoGround')) ksGNGSet(g, s, m, null);
  }
}
