// brood: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { TEAM_MAP } from '../data/teams.js';
import { applyDamage, autoFF, broadcastNear, d6, edgeDist, engagedEnemies, ffDef, ffOn, foes, hasPloy, living, log, noRerollHere, opName, radius, sameTeam, sprungNow, tally, team, teamZh, tpl, validTarget, visibility } from '../game.js';
import { voxbroken } from './phobos.js';
import { neurostatic } from './hunterclade.js';
import { isCult } from './chaoscult.js';
import { isBloodedTeam } from './blooded.js';
import { isWB } from './wyrmblade.js';
import { bestStep, stepTo } from '../sanctifiers.js';
import { dist, segRect } from '../geometry.js';


// ---------- Brood Brothers ----------
export const isBrood = (op) => !!TEAM_MAP[op.team]?.broodBrothers;
/** Leaders: the Broodcoven operative if one was selected, otherwise the Commander. */
export const broodLeader = (g, op) => isBrood(op) && !!tpl(op).bbLeader && (!!tpl(op).broodcoven || !g.ops.some((o) => o.side === op.side && tpl(o).broodcoven));
/** Broodguard: everyone but the Broodcoven and the Psychic Familiars. */
export const broodguard = (op) => isBrood(op) && !tpl(op).broodcoven && op.tplId !== 'bbFamiliar';
/** Spiritual Leader (Magus, strategic gambit): this side's chosen benefit, while the Magus lives. */
export const spiritual = (g, op, mode) => isBrood(op) && g.spiritual?.[op.side]?.tp === g.tp && g.spiritual[op.side].mode === mode
  && living(g, op.side).some((o) => tpl(o).spiritualLeader);
export const crossfire = (t, side) => t?.crossfire?.[side] || 0;
/** "A valid target for this operative" for actions (visible, and not Concealed in cover). */
export const PROBE = { id: 'bbProbe', name: { zh: '', en: '' }, type: 'ranged', atk: 0, hit: 6, dmg: [0, 0], rules: {}, group: 'bbProbe' };
export const broodValid = (g, op, t) => !!validTarget(g, op, t, PROBE);
export function gainCrossfire(g, side, t) {
  if (!t || t.dead || t.side === side || t.side > 1) return;
  (t.crossfire ||= [0, 0])[side]++;
  log(g, { zh: `${opName(t, 'zh')} 得到交叉火力標記（${t.crossfire[side]}）`, en: `${opName(t, 'en')} gains a Crossfire token (${t.crossfire[side]})` }, `side${side}`);
}
/** After a Brood Brother's attack dice are resolved: the enemy, if still standing, gains a Crossfire token. */
export function broodMark(g, op, target) { if (isBrood(op) && op.side < 2 && target && !target.dead) gainCrossfire(g, op.side, target); }
/** Uprising (ploy): the first Shoot / Fight after springing from Conceal marks the target as soon as it's selected. */
export function uprising(g, op, target) {
  if (!isBrood(op) || !hasPloy(g, op.side, 'uprising') || op.counter || g.active !== op.uid || op.acted.uprisingUsed) return;
  if (!sprungNow(op) || op.bbStartEngaged) return;
  op.acted.uprisingUsed = true;
  gainCrossfire(g, op.side, target);
}
/** Psiren Caster, Crossfire tokens (one re-roll each) and Idolisation, after a Brood Brother rolls its attack dice. */
export function broodRerolls(g, op, target, pool, noReroll = false) {
  if (!isBrood(op) || !target || op.side > 1) return;
  const fail = () => pool.dice.find((d) => d.res === 'miss' && !d.rr && !d.auto && !(pool.noReroll1 && d.v===1));
  const blocked = noReroll || noRerollHere(g, op) || voxbroken(g, op) || neurostatic(g, op) || broadcastNear(g, op);
  if (!blocked) {
    const reroll = (d) => { d.v = d6(); d.rr = true; tally(pool); };
    if (fail() && living(g, op.side).some((a) => tpl(a).psiren && edgeDist(a, target) <= 6)) {
      reroll(fail());
      log(g, { zh: '心靈警報器：重擲一顆攻擊骰', en: 'Psiren Caster: one attack die re-rolled' }, `side${op.side}`);
    }
    let used = 0;
    while (crossfire(target, op.side) > 0 && fail()) { target.crossfire[op.side]--; used++; reroll(fail()); }
    if (used) log(g, { zh: `交叉火力：移除 ${used} 個標記，重擲 ${used} 顆攻擊骰`, en: `Crossfire: ${used} token(s) removed to re-roll ${used} attack dice` }, `side${op.side}`);
  }
  // Idolisation (firefight ploy): one fail is retained as a normal success, else a normal as a critical.
  if (ffOn(g, op, 'idolisation')) {
    const m = pool.dice.find((d) => d.res === 'miss' && !d.auto), n = pool.dice.find((d) => d.res === 'norm' && !d.auto);
    if (m) m.faith = 'norm'; else if (n) n.faith = 'crit';
    tally(pool);
  }
}
/** Unquestioning Loyalty (firefight ploy, automatic): a friendly Broodguard within 3" takes the Leader's place. */
// (Sacrificial Thrall, Canoptek Circle: the same for the Geomancer, with a Canoptek construct.)
export function loyalSwap(g, attacker, target, weapon) {
  if (!target || target.side > 1 || weapon?.rules.blast || weapon?.rules.torrent) return target;
  // (Faithful Follower, Chaos Cult: a Dark Commune operative, swapped with a friendly that isn't Dark Commune.)
  const thrall = !!tpl(target).ccLeader, commune = isCult(target) && !!tpl(target).darkCommune;
  const favour = isBloodedTeam(g, target.side) && !!target.bloodToken; // (Dark Favour, Blooded: any other friendly for one with a Blooded token)
  const id = thrall ? 'sacrificialThrall' : commune ? 'faithfulFollower' : favour ? 'darkFavour' : 'unquestioningLoyalty';
  const wb = isWB(target) && (!!tpl(target).cultAgent || !!tpl(target).wbLeader); // (Wyrmblade: a Neophyte, not the Leader, for a Cult Agent or the Leader)
  if ((!thrall && !commune && !broodLeader(g, target) && !wb && !favour) || !ffDef(g, target.side, id)) return target;
  const fits = (o) => (thrall ? tpl(o).canoptek : commune ? isCult(o) && !tpl(o).darkCommune : favour ? sameTeam(o, target) && o.x > -50 : wb ? isWB(o) && !!tpl(o).neophyte && !tpl(o).wbLeader && o.x > -50 : broodguard(o) && !broodLeader(g, o));
  const guard = living(g, target.side).filter((o) => o !== target && fits(o) && edgeDist(o, target) <= 3 && visibility(g, target, o).visible)
    .sort((a, b) => (tpl(b).bodyguard ? 1 : 0) - (tpl(a).bodyguard ? 1 : 0) || b.wounds - a.wounds)[0];
  if (!guard || (favour && guard.wounds <= target.wounds)) return target; // (Dark Favour: only when the stand-in is sturdier)
  g.loyalFree = !!tpl(guard).bodyguard; // Bodyguard (Veteran): 0CP
  const used = autoFF(g, target.side, id);
  g.loyalFree = false;
  if (!used) return target;
  const nm = ffDef(g, target.side, id).name;
  log(g, { zh: `${nm.zh}：${opName(guard, 'zh')} 替 ${opName(target, 'zh')} 擋下攻擊`, en: `${nm.en}: ${opName(guard, 'en')} takes the attack for ${opName(target, 'en')}` }, `side${target.side}`);
  return guard;
}
/** Explosives (Sapper): the first use places the marker, the second deals 2D6 to everyone within 2" of it. */
export function detonateExplosives(g, op) {
  const m = (g.markers || []).find((x) => x.kind === 'explosives' && x.owner === op.side && x.by === op.uid);
  if (!m) return;
  g.markers.splice(g.markers.indexOf(m), 1);
  for (const o of g.ops.filter((x) => !x.dead && x.x > -50 && dist(x, m) - radius(x) <= 2)) {
    // (Heavy terrain wholly in the way protects: the line from the marker to the operative's centre crosses Heavy terrain.)
    if (g.terrain.some((t) => t.kind === 'heavy' && segRect(m, o, t))) continue;
    const dmg = d6() + d6();
    log(g, { zh: `爆破：${opName(o, 'zh')} 受到 ${dmg} 傷害`, en: `Explosives: ${opName(o, 'en')} takes ${dmg} damage` }, `side${op.side}`);
    applyDamage(g, op, o, dmg);
  }
}
/** Strategy phase gambits: Coordinate (Commander) marks an enemy; Spiritual Leader (Magus) picks ignore-Piercing. */
export function broodStrategyEnd(g, side) {
  if (!TEAM_MAP[g.teams[side]].broodBrothers || g.broodTP?.[side] === g.tp) return;
  (g.broodTP ||= [0, 0])[side] = g.tp;
  const mine = living(g, side);
  if (mine.some((o) => tpl(o).coordinate)) {
    const near = (e) => Math.min(...mine.map((m) => dist(m, e)));
    const t = living(g, 1 - side).filter((e) => e.side < 2).sort((a, b) => near(a) - near(b))[0];
    if (t) { log(g, { zh: `${teamZh(g, side)} 協調：`, en: `${team(g, side).name.en} Coordinate:` }, `side${side}`); gainCrossfire(g, side, t); }
  }
  if (mine.some((o) => tpl(o).spiritualLeader)) {
    (g.spiritual ||= [null, null])[side] = { tp: g.tp, mode: 'piercing' };
    log(g, { zh: `${teamZh(g, side)} 精神領袖：本回合友方被射擊時忽略穿甲`, en: `${team(g, side).name.en} Spiritual Leader: this TP, friendlies ignore Piercing when shot` }, `side${side}`);
  }
}

/** Ruthless Coordination (firefight ploy): cover can be judged from another friendly that sees the target (not in enemy control range) — a friend from which the target has no cover. */
export function bbCoordFriend(g, op, target) {
  if (!isBrood(op) || !target) return null;
  return living(g, op.side).find((f) => f !== op && isBrood(f) && f.x > -50 && !engagedEnemies(g, f).length
    && visibility(g, op, f).visible && visibility(g, f, target).visible && !visibility(g, f, target).cover) || null;
}
/** Insidious (firefight ploy, not in TP1, automatic): after an activation, a Brood Brother no enemy can target makes a free Dash towards an objective, ending out of their sight too. */
export function bbInsidious(g) {
  if (g.tp < 2 || g.phase !== 'firefight') return;
  for (const side of [0, 1]) {
    if (g.teams[side] !== 'broodBrothers' || !ffDef(g, side, 'insidious')) continue;
    const hidden = (o, p) => !foes(g, o).some((e) => e.x > -50 && validTarget(g, e, { ...o, x: p.x, y: p.y }));
    const objD = (p) => Math.min(99, ...(g.objectives || []).map((m) => dist(m, p)));
    let best = null;
    for (const o of living(g, side).filter((x) => isBrood(x) && x.x > -50 && !engagedEnemies(g, x).length && hidden(x, x))) {
      const q = bestStep(g, o, 3, 'dash', (p) => (hidden(o, p) && objD(p) < objD(o) - 1 ? -objD(p) : null));
      if (q && (!best || objD(q) < objD(best.q))) best = { o, q };
    }
    if (!best || !autoFF(g, side, 'insidious')) continue;
    stepTo(g, best.o, best.q);
    log(g, { zh: `陰險：${opName(best.o, 'zh')} 免費衝刺`, en: `Insidious: ${opName(best.o, 'en')} makes a free Dash` }, `side${side}`);
  }
}
