// legionaries: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { CHOICES, CONTROL, OBJ_R, applyDamage, autoFF, controller, d3, d6, edgeDist, engagedEnemies, getOp, hasPloy, living, log, needChoice, opName, playerPicks, radius, tpl, visibility } from '../game.js';
import { findPath, moveCtx } from '../path.js';
import { stepTo } from '../sanctifiers.js';
import { dist } from '../geometry.js';
import { TEAM_MAP } from '../data/teams.js';


// ---------- Legionaries ----------
export const LG_MARKS = { khorne: { zh: '恐虐', en: 'Khorne' }, nurgle: { zh: '納垢', en: 'Nurgle' }, slaanesh: { zh: '色孽', en: 'Slaanesh' }, tzeentch: { zh: '奸奇', en: 'Tzeentch' }, undivided: { zh: '混沌不分', en: 'Undivided' } };
/** Its Mark of Chaos: picked for the battle (roster key mark_<slot>), else the datacard default. */
export const markOf = (op) => (op.team === 'legionaries' && op.lgMark) || tpl(op).mark || null;
/** Siphon Life (Balefire Acolyte, once per turning point): the most hurt friendly visible within 6" regains 1 per damaging die (D3 per critical one). */
export function siphonLife(g, op, crits) {
  if (!crits.length || op.siphonTP === g.tp) return;
  const t = living(g, op.side).filter((o) => o.wounds < o.maxW && edgeDist(op, o) <= 6 && (o === op || visibility(g, op, o).visible)).sort((a, b) => (b.maxW - b.wounds) - (a.maxW - a.wounds))[0];
  if (!t) return;
  op.siphonTP = g.tp;
  const before = t.wounds;
  t.wounds = Math.min(t.maxW, t.wounds + crits.reduce((s, c) => s + (c ? d3() : 1), 0));
  log(g, { zh: `吸取生命：${opName(t, 'zh')} 回復 ${t.wounds - before} 生命`, en: `Siphon Life: ${opName(t, 'en')} regains ${t.wounds - before} wounds` }, `side${op.side}`);
}
/** Disgusting Vigour (Nurgle): Normal Dmg of 3+ — on a 5+ it deals 1 less. */
export function nurgleVigour(g, target, amount) {
  if (markOf(target) !== 'nurgle' || amount < 3) return amount;
  return d6() >= 5 ? amount - 1 : amount;
}
/** Unleash Daemon (Anointed): Normal and Critical Dmg of 4+ deal 1 less. */
export const daemonShell = (t, d) => (t.unleashed && d >= 4 ? d - 1 : d);
/** Grisly Mark (Shrivetalon): an enemy within 3" of the marker. */
export const grislyNear = (g, op) => op.side < 2 && (g.markers || []).some((m) => m.kind === 'grisly' && m.owner === 1 - op.side && dist(op, m) - radius(op) <= 3);
/** Quicksilver Speed (ploy): the Legionary moved this turning point. */
export const quick = (g, op) => op.side < 2 && TEAM_MAP[op.team].marksOfChaos && hasPloy(g, op.side, 'quicksilver') && (op.movedTP || 0) > 0;
/** Marks of Chaos for the battle: each operative's pick (a Balefire Acolyte can't be Khorne). */
export function lgSetup(g, roster) {
  for (const o of g.ops) if (o.team === 'legionaries') {
    const m = roster[o.side]?.[`mark_${o.slot}`];
    o.lgMark = LG_MARKS[m] && !(m === 'khorne' && o.tplId === 'lgBalefire') ? m : tpl(o).mark;
  }
}
/** Infernal Pact (Warrior, once per battle, when activated): change its Mark of Chaos. */
export function lgSelf(g, op, id) {
  if (id !== 'lgPact') return false;
  (g.lgPact ||= [false, false])[op.side] = true; op.acted.lgPact = 1;
  needChoice(g, op.side, 'lgPact', { uid: op.uid });
  return true;
}
/** In the Eyes of the Gods (Aspiring Champion): once per activation, an incapacitation adds 1 to its APL for that activation. */
export function lgEyes(g, src) {
  if (!src || !tpl(src).eyesOfGods || g.active !== src.uid || src.counter || src.dead || src.acted.lgEyes) return;
  src.acted.lgEyes = 1; src.ap++;
  log(g, { zh: `${opName(src, 'zh')} 眾神注目：本次啟動 APL +1`, en: `${opName(src, 'en')} In the Eyes of the Gods: +1 APL this activation` }, `side${src.side}`);
}
/** Favoured of the Dark Gods (Icon Bearer), Ready step: controlling an objective marker nobody has tainted taints it and gains 1CP. */
export function lgFavoured(g) {
  for (const o of living(g)) {
    if (!tpl(o).favouredGods || o.x < -50) continue;
    const m = (g.objectives || []).find((x) => !(g.tainted || []).includes(x.id) && dist(o, x) - radius(o) - OBJ_R <= CONTROL && controller(g, x) === o.side);
    if (!m) continue;
    (g.tainted ||= []).push(m.id); g.cp[o.side]++;
    log(g, { zh: `${opName(o, 'zh')} 黑暗諸神的寵兒：污染這個目標，+1CP`, en: `${opName(o, 'en')} Favoured of the Dark Gods: taints this objective, +1CP` }, `side${o.side}`);
  }
}
/** Unending Bloodshed (firefight ploy): a Khorne Legionary incapacitated while fighting strikes back with one unresolved success first. */
export function lgUnending(g, dying, me, killer, weapon) {
  if (dying.team !== 'legionaries' || markOf(dying) !== 'khorne' || killer.dead || !(me.c || me.n) || !autoFF(g, dying.side, 'unendingBloodshed')) return;
  const crit = me.c > 0; if (crit) me.c--; else me.n--;
  const dmg = weapon.dmg[crit ? 1 : 0];
  log(g, { zh: `無盡殺戮：${opName(dying, 'zh')} 倒下前再打一下（${dmg} 傷害）`, en: `Unending Bloodshed: ${opName(dying, 'en')} strikes once more before it falls (${dmg} damage)` }, `side${dying.side}`);
  applyDamage(g, dying, killer, dmg);
}
export function registerLegionaryChoices() {
  CHOICES.lgPact = {
    kind: 'option', title: { zh: '地獄契約：改成哪一個混沌印記？', en: 'Infernal Pact: change to which Mark of Chaos?' },
    options: (g, side, ctx) => Object.entries(LG_MARKS).filter(([k]) => k !== markOf(getOp(g, ctx.uid))).map(([k, v]) => ({ value: k, label: v })),
    auto: (g, side, ctx) => (markOf(getOp(g, ctx.uid)) === 'khorne' ? 'tzeentch' : 'khorne'),
    apply(g, side, mark, ctx) { const o = getOp(g, ctx.uid); o.lgMark = mark; log(g, { zh: `地獄契約：${opName(o, 'zh')} 改為${LG_MARKS[mark].zh}印記`, en: `Infernal Pact: ${opName(o, 'en')} now bears the Mark of ${LG_MARKS[mark].en}` }, `side${side}`); },
  };
}
/** Devastating Onslaught (Butcher): at the end of an enemy activation, an enemy within 2" of it — a free Charge of up to 2" ending in its control range
 * (it can change to Engage). A player is asked (they can pass); the computer charges when it can reach. True when the player's pick is pending. */
export function lgButcherEnd(g, ended) {
  if (!ended || ended.side > 1 || g.phase !== 'firefight') return false;
  const side = 1 - ended.side;
  for (const b of living(g, side).filter((o) => o.team === 'legionaries' && tpl(o).noAssistVs && o.x > -50 && !engagedEnemies(g, o).length)) {
    const near = living(g, ended.side).filter((e) => e.x > -50 && edgeDist(b, e) <= 2);
    if (!near.length) continue;
    if (playerPicks(g, side)) {
      g.netcounter = { side, only: [b.uid], resume: null, handFrom: ended.side, resumeCounter: false, kind: 'control', onlyActions: ['charge'], ctlMove: 2, butcher: true,
        label: { title: { zh: '毀滅猛攻（屠夫）', en: 'Devastating Onslaught (Butcher)' }, hint: { zh: '敵人啟動結束：屠夫可以免費衝鋒（最多 2"，改為交戰指令），結束在 2" 內一名敵人的控制範圍內；也可以略過。', en: 'An enemy activation ended: the Butcher can make a free Charge (2" at most, now on Engage) ending in control range of an enemy within 2"; or pass.' } } };
      g.turn = side; g.counter = true;
      return true;
    }
    const ctx = moveCtx(g, b, 'charge');
    for (const e of near) for (let a = 0; a < 16; a++) {
      const d = radius(b) + radius(e) + 0.4, p = { x: e.x + Math.cos(a * Math.PI / 8) * d, y: e.y + Math.sin(a * Math.PI / 8) * d };
      if (!ctx.free(p) || !ctx.inEnemyER(p)) continue;
      const path = findPath(ctx, p);
      if (!path || path.len > 2 + 1e-6) continue;
      stepTo(g, b, p); b.order = 'engage';
      log(g, { zh: `毀滅猛攻：${opName(b, 'zh')} 免費衝鋒到 ${opName(e, 'zh')} 身邊`, en: `Devastating Onslaught: ${opName(b, 'en')} charges ${opName(e, 'en')} for free` }, `side${side}`);
      return false;
    }
  }
  return false;
}
