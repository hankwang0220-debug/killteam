// Void-dancer Troupe (虛空舞者劇團) rules engine: Saedath (allegory, Pivotal Role, accolades), Harlequin's Panoply, Luck of the Laughing God,
// the Death Jester's Humbling Cruelty, the Shadowseer's psychic actions, the ploys and the faction equipment.
// game.js calls these hooks; the team data is in data/voiddancers.js.
// (Careful: game.js and this module import each other, so nothing here may use a top-level const while the modules load —
// everything is a function declaration, and register functions only use hoisted functions.)
import { ACTIONS, TARGET_ACTIONS, applyDamage, autoFF, d3, d6, edgeDist, foes, getOp, hasPloy, living, log, opName, radius, tpl, visibility, weaponsFor, avgDmg } from './game.js';
import { bestStep, stepTo } from './sanctifiers.js';
import { VOIDDANCERS_TEAM, voidDancersRosterError } from './data/voiddancers.js';

export function isVD(o) { return o?.team === 'voidDancers'; }
function equip(g, side, id) { return !!g.equip?.[side]?.includes(id); }
function note(g, side, zh, en) { log(g, { zh, en }, `side${side}`); }
const ALLEGORY = { epic: { zh: '史詩', en: 'Epic' }, melodrama: { zh: '通俗劇', en: 'Melodrama' } };

// ---------- setup ----------
export function vdSetup(g, roster) {
  g.vd = { allegory: [null, null], pivotal: [null, null], acc: [[], []], used: [{}, {}], luck: [[], []], tragedy: [0, 0] };
  for (const side of [0, 1]) if (g.teams[side] === 'voidDancers') {
    const error = voidDancersRosterError(VOIDDANCERS_TEAM, roster[side]);
    if (error) throw new Error(error.en);
    ((g.ffOff ||= [[], []])[side] ||= []).push('vdCurtain'); // The Curtain Falls ends the fight early: off unless the player switches it on
  }
}

// ---------- Saedath ----------
export const vdAllegory = (g, side) => g.vd?.allegory?.[side] || null;
export const vdHasAccolade = (g, op) => isVD(op) && !!g.vd && (g.vd.pivotal[op.side] === op.uid || g.vd.acc[op.side].includes(op.uid));
/** First turning point: the allegory and the operative with the Pivotal Role. */
export function vdChooseOk(g, side) { return g.teams[side] === 'voidDancers' && !!g.vd && g.phase === 'strategy' && !g.vd.allegory[side]; }
export function vdChoose(g, side, allegory, uid) {
  const op = getOp(g, uid);
  if (!vdChooseOk(g, side) || !ALLEGORY[allegory] || !op || op.dead || op.side !== side || !isVD(op)) return false;
  g.vd.allegory[side] = allegory; g.vd.pivotal[side] = op.uid; g.vd.used[side].grant = g.tp;
  note(g, side, `劇目：寓言「${ALLEGORY[allegory].zh}」，主角 ${opName(op, 'zh')}`, `Saedath: the ${ALLEGORY[allegory].en} allegory, ${opName(op, 'en')} has the Pivotal Role`);
  return true;
}
/** Later turning points (strategic gambit): one more friendly gains the Accolade. */
export function vdGrantOk(g, side) { return g.teams[side] === 'voidDancers' && !!g.vd && g.phase === 'strategy' && !!g.vd.allegory[side] && g.vd.used[side].grant !== g.tp && vdCandidates(g, side).length > 0; }
export const vdCandidates = (g, side) => living(g, side).filter((o) => isVD(o) && !vdHasAccolade(g, o));
export function vdGrant(g, side, uid, why = null) {
  const op = getOp(g, uid);
  if (!op || op.dead || op.side !== side || !isVD(op) || vdHasAccolade(g, op)) return false;
  g.vd.acc[side].push(op.uid);
  note(g, side, `${why?.zh || '劇目'}：${opName(op, 'zh')} 獲得讚譽`, `${why?.en || 'Saedath'}: ${opName(op, 'en')} gains the Accolade`);
  return true;
}
export function vdGrantGambit(g, side, uid) {
  if (!vdGrantOk(g, side)) return false;
  if (!vdGrant(g, side, uid)) return false;
  g.vd.used[side].grant = g.tp;
  return true;
}
/** The best friendly to gain the Accolade next: the strongest weapons for the allegory. */
function bestCandidate(g, side) {
  const type = vdAllegory(g, side) === 'melodrama' ? 'ranged' : 'melee';
  return vdCandidates(g, side).sort((a, b) => Math.max(0, ...weaponsFor(g, b).filter((w) => w.type === type).map((w) => avgDmg(w))) - Math.max(0, ...weaponsFor(g, a).filter((w) => w.type === type).map((w) => avgDmg(w))))[0] || null;
}
/** Lead the Performance (Lead Player, once per battle strategic gambit): change the allegory. */
export function vdLeadOk(g, side) { return g.teams[side] === 'voidDancers' && !!g.vd && g.phase === 'strategy' && !!g.vd.allegory[side] && !g.vd.used[side].lead && living(g, side).some((o) => tpl(o).vdLead && o.x > -50); }
export function vdLead(g, side) {
  if (!vdLeadOk(g, side)) return false;
  g.vd.used[side].lead = true;
  g.vd.allegory[side] = g.vd.allegory[side] === 'epic' ? 'melodrama' : 'epic';
  note(g, side, `領銜演出：寓言改為「${ALLEGORY[g.vd.allegory[side]].zh}」`, `Lead the Performance: the allegory is now ${ALLEGORY[g.vd.allegory[side]].en}`);
  return true;
}
/** Nobody chose in the first Strategy phase (the computer, or a player who skipped it): Epic with the Lead Player (or the best fighter). */
export function vdFill(g) {
  for (const side of [0, 1]) if (g.teams[side] === 'voidDancers' && g.vd && !g.vd.allegory[side]) {
    const lead = living(g, side).find((o) => tpl(o).vdLead) || living(g, side)[0];
    if (lead) vdChoose(g, side, 'epic', lead.uid);
  }
}
export function vdAiStrategy(g, side) {
  if (g.teams[side] !== 'voidDancers' || !g.vd) return;
  if (vdChooseOk(g, side)) { const lead = living(g, side).find((o) => tpl(o).vdLead) || living(g, side)[0]; if (lead) vdChoose(g, side, 'epic', lead.uid); }
  else if (vdGrantOk(g, side)) { const c = bestCandidate(g, side); if (c) vdGrantGambit(g, side, c.uid); }
}

// ---------- activation ----------
export function vdActivate(g, op) {
  if (op.side > 1) return;
  op.vdHumbleActive = op.vdHumbled != null; // (Humbling Cruelty: removed at the end of its next activation)
  if (!isVD(op) || g.counter) return;
  op.vdElusive = false; // Elusive Target lasts until the start of its next activation
  // Understudy's Mask: the Pivotal operative is gone — this one takes the role.
  const piv = g.vd.pivotal[op.side] && getOp(g, g.vd.pivotal[op.side]);
  if (piv && piv.dead && equip(g, op.side, 'vdUnderstudy') && !g.vd.used[op.side].understudy) {
    g.vd.used[op.side].understudy = true; g.vd.pivotal[op.side] = op.uid;
    note(g, op.side, `替身面具：${opName(op, 'zh')} 接下主角`, `Understudy's Mask: ${opName(op, 'en')} takes the Pivotal Role`);
  }
}
export function vdEnd(op) { if (op && op.vdHumbleActive) { op.vdHumbled = null; op.vdHumbleActive = false; } }

// ---------- weapons and rules ----------
export function vdRules(g, op, weapon, target, r) {
  if (!isVD(op) || op.side > 1) return;
  const al = vdAllegory(g, op.side);
  if (vdHasAccolade(g, op) && ((al === 'epic' && weapon.type === 'melee' && g.fight?.A?.uid === op.uid) || (al === 'melodrama' && weapon.type === 'ranged'))) r.balanced = true; // Accolade
  if (op.vdToxin === weapon.id) r.devastating = Math.max(r.devastating || 0, 1); // Shrieker Toxin Rounds
}
/** The Shoot begins: Shrieker Toxin Rounds (once per TP) for a shuriken pistol or the focused shrieker cannon. */
export function vdShootStart(g, op, weapon) {
  op.vdToxin = null;
  if (!isVD(op) || op.side > 1 || !equip(g, op.side, 'vdToxin') || g.vd.used[op.side].toxin === g.tp) return;
  if (weapon.id !== 'vdShuriken' && weapon.id !== 'vdShriekF') return;
  g.vd.used[op.side].toxin = g.tp; op.vdToxin = weapon.id;
  note(g, op.side, `尖嘯毒彈：${opName(op, 'zh')} 的武器「毀滅 1」`, `Shrieker Toxin Rounds: ${opName(op, 'en')}'s weapon has Devastating 1`);
}
/** After the shot: Humbling Cruelty (a damaged survivor gains the token). */
export function vdShootEnd(g, op, weapon, target, damaged) {
  if (op) op.vdToxin = null;
  if (!isVD(op) || !weapon?.rules?.vdHumbling || !target || target.dead || target.side > 1 || !damaged || target.vdHumbled != null) return;
  target.vdHumbled = op.side;
  note(g, op.side, `殘酷羞辱：${opName(target, 'zh')} Move -2"、命中變差 1，到它下次啟動結束`, `Humbling Cruelty: ${opName(target, 'en')} has -2" Move and its Hit worsened by 1 until the end of its next activation`);
}
/** Harlequin's Panoply: shot with no critical attack dice retained — Piercing is worsened by 1. */
export const vdPanoply = (target, crits) => isVD(target) && target.side < 2 && crits === 0;
/** Prismatic Blur: shot after moving this turning point — re-roll one defence die. */
export function vdDefence(g, target, defRules) { if (isVD(target) && target.side < 2 && hasPloy(g, target.side, 'vdBlur') && target.vdMovedTP === g.tp) defRules.balanced = true; }
/** Elusive Target: Concealed and in cover, it can't be selected beyond 2". */
export function vdElusiveHidden(g, from, to) { return isVD(to) && to.vdElusive && to.order === 'conceal' && visibility(g, from, to).cover && edgeDist(from, to) > 2; }
/** Wraithbone Talisman (once per TP): two or more fails — one is retained as a normal success. */
export function vdRoll(g, op, pool, retally) {
  if (!isVD(op) || op.side > 1 || !pool || !equip(g, op.side, 'vdTalisman') || g.vd.used[op.side].talisman === g.tp) return;
  if (pool.dice.filter((d) => !d.auto && d.res === 'miss').length < 2) return;
  g.vd.used[op.side].talisman = g.tp;
  const fix = (p) => { const m = p.dice.filter((d) => !d.auto && d.res === 'miss'); if (m.length >= 2) { m[0].res = 'norm'; m[0].indo = true; p.norms++; } };
  const prev = pool.post;
  pool.post = prev ? (p) => { prev(p); fix(p); } : fix;
  retally(pool);
  note(g, op.side, `靈骨護符：${opName(op, 'zh')} 一個失敗保留為普通成功`, `Wraithbone Talisman: ${opName(op, 'en')} retains a fail as a normal success`);
}
/** Domino Field (ploy, automatic): one successful defence die blocks every attack die with the same result — returns the adjusted counts. */
export function vdDomino(g, target, a, d, dn, dc) {
  const none = { ac: a.crits, an: a.norms, dcr: d.crits, dno: d.norms };
  if (!isVD(target) || target.side > 1) return none;
  const succ = d.dice.filter((x) => x.res === 'crit' || x.res === 'norm');
  let best = null;
  for (const s of succ) {
    const hit = a.dice.filter((x) => (x.res === 'crit' || x.res === 'norm') && x.v === s.v);
    const saved = hit.reduce((t, x) => t + (x.res === 'crit' ? dc : dn), 0);
    if (hit.length >= 2 && (!best || saved > best.saved)) best = { s, hit, saved };
  }
  if (!best || !autoFF(g, target.side, 'vdDomino')) return none;
  const hc = best.hit.filter((x) => x.res === 'crit').length, hn = best.hit.length - hc;
  note(g, target.side, `骨牌力場：一顆 ${best.s.v} 擋掉 ${best.hit.length} 顆同點數的攻擊骰`, `Domino Field: one ${best.s.v} blocks ${best.hit.length} attack dice with the same result`);
  return { ac: a.crits - hc, an: a.norms - hn, dcr: d.crits - (best.s.res === 'crit' ? 1 : 0), dno: d.norms - (best.s.res === 'norm' ? 1 : 0) };
}
/** Cegorach's Jest (ploy): the opponent's normal strike may block one of the Harlequin's dice instead (once per sequence). */
export function vdJest(g, foeOp, foeSide, weapon) {
  if (!isVD(foeOp) || foeOp.side > 1 || !hasPloy(g, foeOp.side, 'vdJest') || foeSide.jestUsed || foeSide.c + foeSide.n === 0) return false;
  const r = d6();
  if (r >= weapon.hit) return false;
  foeSide.jestUsed = true;
  if (foeSide.n) foeSide.n--; else foeSide.c--;
  note(g, foeOp.side, `笑神的玩笑：擲 ${r}，對手的攻擊改為擋掉一顆骰子`, `Cegorach's Jest: rolled ${r}, the strike blocks one of your dice instead`);
  return true;
}
/** The Curtain Falls (ploy, off by default): after a critical strike that doesn't finish the enemy, end the fight and fall back 3". */
export function vdCurtain(g, meOp, foeOp, f) {
  if (!isVD(meOp) || meOp.side > 1 || meOp.dead || foeOp.dead || !autoFF(g, meOp.side, 'vdCurtain')) return false;
  f.A.c = f.A.n = f.D.c = f.D.n = 0;
  const near = (p) => Math.min(...foes(g, meOp).filter((e) => e.x > -50).map((e) => edgeDist({ ...meOp, x: p.x, y: p.y }, e)), 99);
  const q = bestStep(g, meOp, 3, 'fallBack', (p) => near(p));
  if (q) stepTo(g, meOp, q);
  note(g, meOp.side, `落幕：${opName(meOp, 'zh')} 結束近戰並撤離`, `The Curtain Falls: ${opName(meOp, 'en')} ends the fight and slips away`);
  return true;
}

// ---------- the performance and Death Mask ----------
export function vdDeath(g, src, target) {
  // Death Mask: an operative with an Accolade falls.
  if (isVD(target) && target.side < 2 && vdHasAccolade(g, target) && equip(g, target.side, 'vdMask') && g.vd.tragedy[target.side] < 3) {
    g.vd.tragedy[target.side]++;
    if (g.vd.tragedy[target.side] === 3) { g.cp[target.side]++; note(g, target.side, '死亡面具：悲劇數達到 3，+1CP', 'Death Mask: the Tragedy tally reaches 3, +1CP'); }
  }
  // The Pivotal operative completes the performance: incapacitating an enemy while fighting (Epic) or shooting (Melodrama).
  if (!src || !isVD(src) || src.side > 1 || target.side === src.side || g.vd.pivotal[src.side] !== src.uid || g.vd.used[src.side].perf === g.tp) return;
  const al = vdAllegory(g, src.side), fighting = !!g.fight;
  if ((al === 'epic' && !fighting) || (al === 'melodrama' && fighting)) return;
  g.vd.used[src.side].perf = g.tp;
  const c = bestCandidate(g, src.side);
  if (c) vdGrant(g, src.side, c.uid, { zh: '演出完成', en: 'Performance complete' });
}

// ---------- Luck of the Laughing God (Players) ----------
/** Once per turning point (team-wide): a firefight ploy for 0CP when a Player is the specified operative; each ploy once per battle this way. */
export function vdLuckFree(g, side, id) {
  if (g.teams[side] !== 'voidDancers' || !g.vd || g.vd.used[side].luck === g.tp || g.vd.luck[side].includes(id)) return false;
  const a = g.active != null ? getOp(g, g.active) : null;
  return !!a && a.side === side && !!tpl(a).vdPlayer;
}
export function vdLuckUsed(g, side, id) { if (g.vd) { g.vd.used[side].luck = g.tp; g.vd.luck[side].push(id); } }
/** Luck also covers the Command Re-roll for dice rolled for a Player. */
export function vdLuckReroll(g, side, holder) {
  if (side > 1 || g.teams[side] !== 'voidDancers' || !g.vd || g.vd.used[side].luck === g.tp || g.vd.luck[side].includes('commandReroll')) return false;
  const o = getOp(g, holder.uid);
  return !!o && o.side === side && !!tpl(o).vdPlayer;
}

// ---------- Shadowseer: Mirror of Minds, Fog of Dreams ----------
export function vdActions(g, op, add) {
  if (!isVD(op) || op.side > 1 || !tpl(op).vdSeer) return;
  for (const id of ['vdMirror', 'vdFog']) {
    if (op.acted[id]) continue;
    add(id, TARGET_ACTIONS[id].targets(g, op).length > 0 && !foes(g, op).some((e) => e.x > -50 && edgeDist(e, op) <= 1.01), { zh: '沒有可選的目標，或在敵人控制範圍內', en: 'No valid target, or within enemy control range' });
  }
}
/** Fog of Dreams: the enemy can't activate until it's the last, or until its side has activated that many operatives since. */
export function vdFogged(g, o, ready) {
  const f = g.vdFog;
  if (!f || f.uid !== o.uid || f.tp !== g.tp || ready.length <= 1) return false;
  return ((g.actCount?.[o.side] || 0) - f.base) < f.n;
}
export function registerVoidDancerActions() {
  ACTIONS.vdMirror = { ap: 1, name: { zh: '心靈之鏡', en: 'Mirror of Minds' } };
  ACTIONS.vdFog = { ap: 1, name: { zh: '夢境迷霧', en: 'Fog of Dreams' } };
  TARGET_ACTIONS.vdMirror = {
    targets: (g, o) => foes(g, o).filter((e) => e.side < 2 && e.x > -50 && edgeDist(o, e) <= 8 && visibility(g, o, e).visible && !(e.order === 'conceal' && visibility(g, o, e).cover)),
    apply(g, o, t) {
      o.acted.vdMirror = 1;
      const mine = Array.from({ length: 5 }, d6), theirs = Array.from({ length: 5 }, d6);
      const left = [...theirs];
      let pairs = 0;
      for (const v of mine) { const i = left.indexOf(v); if (i >= 0) { left.splice(i, 1); pairs++; } }
      let dmg = 0; for (let k = 0; k < pairs; k++) dmg += d3();
      dmg = Math.min(8, dmg);
      if (dmg) applyDamage(g, o, t, dmg);
      return { zh: `心靈之鏡：${mine.join(' ')} 對 ${theirs.join(' ')}，${pairs} 對相同，${opName(t, 'zh')} 受到 ${dmg} 傷害`, en: `Mirror of Minds: ${mine.join(' ')} vs ${theirs.join(' ')}, ${pairs} pair(s), ${opName(t, 'en')} takes ${dmg} damage` };
    },
  };
  TARGET_ACTIONS.vdFog = {
    targets: (g, o) => foes(g, o).filter((e) => e.side < 2 && e.x > -50 && e.ready && visibility(g, o, e).visible),
    apply(g, o, t) {
      o.acted.vdFog = 1;
      const n = d6();
      g.vdFog = { uid: t.uid, n, tp: g.tp, base: g.actCount?.[t.side] || 0 };
      return { zh: `夢境迷霧：${opName(t, 'zh')} 要等對手再啟動 ${n} 名特工（或它是最後一名）才能行動`, en: `Fog of Dreams: ${opName(t, 'en')} can't act until ${n} more enemy operatives have activated (or it is the last)` };
    },
  };
}
