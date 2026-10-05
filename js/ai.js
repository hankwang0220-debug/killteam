import {
  activate, activeOp, actionCost, availableActions, missionActionsFor, deployZones, weaponsFor, endProxy, setDoctrina, ffButtons, useFFButton, ffAttackOptions, ffToggle, ffClearPending, setSkills, counterCandidates, passCounter, avgDmg, bestMelee, buyPloy, controller, doMove, edgeDist, endActivation,
  engagedEnemies, statPenalty, isInjured, doFlail, flailTargets, doDakkaDash, setMark, fightTargets, living, moveAllowance, TARGET_ACTIONS, doTargetAction, mlLevel, radius, resolveShoot, shootCheck, startFight, team, tpl,
  foes, NPO, npoBegin, mission, doMissionAction, doPickUp, placeBid,
  readyOps, orderIssuer, chooseGuardOrder, eyeLeft, eyeOfAncestors, placeTactician, doSelfAction, scrambleTargets, omniScramble, assignBlood, setGaze, visibility,
} from './game.js';
import { isArchon, painOptions, usePain } from './archon.js';
import { npoTargetFor } from './missions.js';
import { dist } from './geometry.js';
import { clampPath, findPath, moveCtx } from './path.js';

export function aiStrategy(g, side) {
  for (const p of team(g, side).ploys) {
    if (g.cp[side] >= p.cp + 1 && Math.random() < 0.6) buyPloy(g, side, p);
  }
  // Call the Kill / Bring it Down!: mark the enemy with the most wounds.
  if ((team(g, side).justiceMark || living(g, side).some((o) => tpl(o).callTheKill || tpl(o).watchmaster)) && !g.mark?.[side]) {
    setMark(g, side, living(g, 1 - side).sort((a, b) => b.wounds - a.wounds)[0]);
  }
  // Skill at Arms (Kasrkin).
  if (team(g, side).skillAtArms && g.skills?.[side]?.tp !== g.tp) setSkills(g, side, ['lightEmUp', 'iceInVeins']);
  // Doctrina Imperatives (Hunter Clade): Conqueror when Sicarians are close to the enemy, otherwise Protector;
  // the Primary Mode's Deprecation is ignored the first time it's picked.
  if (team(g, side).doctrina && g.doctrina?.[side]?.tp !== g.tp) {
    const close = living(g, side).some((o) => tpl(o).ruststalker && foes(g, o).some((e) => edgeDist(o, e) <= 8));
    const mode = close ? 'conqueror' : 'protector';
    setDoctrina(g, side, mode, mode === g.tactics?.[side]?.[0]);
  }
  // Eye of the Ancestors: Grudge tokens on the toughest enemies. Tactician: the Attack marker on the toughest enemy.
  for (let n = eyeLeft(g, side); n > 0; n--) {
    const t = living(g, 1 - side).sort((a, b) => (a.grudge?.[side] || 0) - (b.grudge?.[side] || 0) || b.wounds - a.wounds)[0];
    if (t) eyeOfAncestors(g, side, t);
  }
  if (living(g, side).some((o) => tpl(o).tactician) && g.tactician?.[side]?.tp !== g.tp) {
    const t = living(g, 1 - side).sort((a, b) => b.wounds - a.wounds)[0];
    if (t) placeTactician(g, side, 'attack', t);
  }
  // Blooded: tokens to the hardest hitters first, then the Gaze on the best of them.
  if (team(g, side).bloodedTokens) {
    const value = (o) => Math.max(...tpl(o).weapons.map((w) => avgDmg(w))) + (tpl(o).leadWithStrength ? 2 : 0);
    for (const o of living(g, side).filter((x) => !x.bloodToken).sort((a, b) => value(b) - value(a))) if (!assignBlood(g, side, o)) break;
    const holders = living(g, side).filter((o) => o.bloodToken).sort((a, b) => value(b) - value(a));
    if (holders.length >= 4) setGaze(g, side, holders[0]);
  }
  // Omni-scrambler: hold back the toughest enemy it can.
  const sc = scrambleTargets(g, side).sort((a, b) => b.wounds - a.wounds)[0];
  if (sc) omniScramble(g, side, sc);
  // Guardsman Order: Take Aim!, or Fix Bayonets! when much of the team is in melee; relayed if possible.
  if (orderIssuer(g, side)) {
    const engaged = living(g, side).filter((o) => engagedEnemies(g, o).length).length;
    chooseGuardOrder(g, side, engaged * 3 > living(g, side).length ? 'fixBayonets' : 'takeAim', true);
  }
}

function shootOptions(g, op) {
  const opts = [];
  const hitMod = statPenalty(g, op) ? 1 : 0;
  for (const w of weaponsFor(g, op).filter((x) => x.type === 'ranged')) {
    for (const t of foes(g, op)) {
      const c = shootCheck(g, op, t, w);
      if (!c.ok) continue;
      // Don't Blast a target next to friendly operatives.
      if (w.rules.blast && living(g, op.side).some((f) => f !== op && edgeDist(t, f) <= w.rules.blast)) continue;
      const ml = mlLevel(g, op, w, t);
      let score = avgDmg(w, hitMod - (ml >= 2 ? 1 : 0)) * (1 - (7 - tpl(t).save) / 6 * 0.5) * (c.cover && !ml ? 0.75 : 1) * (c.obscured ? 0.6 : 1);
      if (score >= t.wounds) score += 10; // likely kill
      score += (1 - t.wounds / t.maxW) * 2;
      opts.push({ w, t, score });
    }
  }
  return opts.sort((a, b) => b.score - a.score);
}

const bestRanged = (op, hitMod) => Math.max(0, ...tpl(op).weapons.filter((w) => w.type === 'ranged').map((w) => avgDmg(w, hitMod)));
const prefersMelee = (op) => avgDmg(bestMelee(op)) > bestRanged(op, 0) * 1.1;

function pickGoal(g, op) {
  // Envoy (Tac Op): head deep into enemy territory.
  const tac = g.tacOps?.[op.side];
  if (tac?.envoy?.tp === g.tp && tac.envoy.uid === op.uid) { const z = deployZones(g)[1 - op.side]; return { x: (z.x0 + z.x1) / 2, y: g.axis === 'y' ? (z.y0 + z.y1) / 2 : op.y }; }
  const enemies = foes(g, op);
  const nearestEnemy = enemies.sort((a, b) => dist(op, a) - dist(op, b))[0];
  if ((prefersMelee(op) || tpl(op).gheistskull) && nearestEnemy) return nearestEnemy; // the Gheistskull closes in to be detonated
  // Objective markers, and mission markers the operative could pick up.
  const pickable = (g.markers || []).filter((m) => !m.carriedBy && mission(g).canPickUp?.(g, op, m));
  const carrying = (g.markers || []).some((m) => m.carriedBy === op.uid);
  const objs = [...g.objectives, ...(carrying ? [] : pickable)]
    .map((o) => ({ o, c: controller(g, o), d: dist(op, o) }))
    .sort((a, b) => (a.c === op.side) - (b.c === op.side) || a.d - b.d);
  const holding = objs.find((x) => x.d - radius(op) - 0.4 <= 1 && (x.c == null || x.c === op.side));
  if (holding) return null; // stay on the objective
  return objs[0] ? objs[0].o : nearestEnemy;
}

function pathToward(g, op, kind, goal) {
  const ctx = moveCtx(g, op);
  const max = moveAllowance(g, op, kind);
  // Try the goal itself, then points around it.
  const tries = [goal];
  for (let ring = 1.4; ring <= 4; ring += 1.3)
    for (let a = 0; a < 12; a++) tries.push({ x: goal.x + Math.cos(a * Math.PI / 6) * ring, y: goal.y + Math.sin(a * Math.PI / 6) * ring });
  const endOk = (q) => !ctx.inEnemyER(q);
  for (const p of tries) {
    const path = findPath(ctx, p);
    if (!path) continue;
    const res = clampPath(ctx, path, max, endOk);
    return res && res.len >= 0.3 ? res : null;
  }
  return null;
}

/**
 * How exposed the operative would be at p: each enemy that could shoot it there counts by its best ranged
 * damage (less if it would only be in cover or obscured). A Concealed operative in cover can't be targeted.
 */
function exposure(g, op, p, order) {
  const me = { ...op, x: p.x, y: p.y, order };
  let sum = 0;
  for (const e of foes(g, op)) {
    if (e.side === NPO || isEngagedNear(g, e)) continue;
    if (!bestRanged(e, 0)) continue;
    const v = visibility(g, e, me);
    if (!v.visible) continue;
    if (order === 'conceal' && v.cover) continue;
    sum += (v.cover ? 0.5 : 1) * (v.obscured ? 0.6 : 1);
  }
  return sum;
}
const isEngagedNear = (g, e) => engagedEnemies(g, e).length > 0;

/**
 * Cover-aware advance (melee operatives): among reachable end points, pick the one that best trades getting
 * closer to the goal against how much enemy fire it would draw, with a bonus for ending within charge reach.
 */
function safeMove(g, op, kind, goal, order) {
  const ctx = moveCtx(g, op);
  const max = moveAllowance(g, op, kind);
  const endOk = (q) => !ctx.inEnemyER(q);
  const reach = moveAllowance(g, op, 'charge') + 0.5; // next activation's Charge
  // Keep advancing, but give up to ~4" of progress to end where fewer enemies can shoot it.
  const score = (p, len) => {
    const progress = dist(op, goal) - dist(p, goal);
    const near = foes(g, op).some((e) => e.side !== NPO && edgeDist({ ...op, x: p.x, y: p.y }, e) <= reach);
    return progress - Math.min(4, exposure(g, op, p, order) * 1.5) + (near ? 1.5 : 0) - len * 0.02;
  };
  let best = { p: null, path: null, s: score(op, 0) - 1 }; // standing still must be clearly better
  const cands = [];
  const direct = pathToward(g, op, kind, goal);
  if (direct) cands.push(direct);
  for (const f of [1, 0.66, 0.33]) {
    for (let a = 0; a < 16; a++) {
      const q = { x: op.x + Math.cos(a * Math.PI / 8) * max * f, y: op.y + Math.sin(a * Math.PI / 8) * max * f };
      if (!ctx.free(q) || !endOk(q)) continue;
      if (ctx.segFree(op, q)) { const pts = [{ x: op.x, y: op.y }, q], len = dist(op, q) + ctx.extra(pts); if (len <= max + 0.01) cands.push({ pts, len }); continue; }
      const path = findPath(ctx, q);
      if (path && path.len <= max + 0.01) cands.push(path);
    }
  }
  for (const path of cands) {
    const p = path.pts[path.pts.length - 1];
    const s = score(p, path.len);
    if (s > best.s) best = { p, path, s };
  }
  return best.path && best.path.len >= 0.3 ? best.path : null;
}

function chargePath(g, op, among = foes(g, op)) {
  const ctx = moveCtx(g, op);
  const max = moveAllowance(g, op, 'charge');
  const r = radius(op);
  let best = null;
  const targets = among.filter((e) => edgeDist(op, e) <= max + 1.5).sort((a, b) => a.wounds - b.wounds);
  for (const t of targets) {
    const d = radius(t) + r + 0.5;
    for (let a = 0; a < 16; a++) {
      const p = { x: t.x + Math.cos(a * Math.PI / 8) * d, y: t.y + Math.sin(a * Math.PI / 8) * d };
      if (!ctx.free(p)) continue;
      const path = findPath(ctx, p);
      if (path && path.len <= max && (!best || path.len < best.len)) best = path;
    }
    if (best) return best;
  }
  return null;
}

/** The computer's secret bid of Negotiation points to control an NPO (about half its points, at least 1). */
export function aiBid(g, side) {
  const pts = g.negotiation?.[side] || 0;
  placeBid(g, side, pts ? Math.max(1, Math.ceil(pts / 2)) : 0);
}

/**
 * One step of the NPOs' slot: draw the activation card, then follow the NPO's behaviour.
 * Brawler: Fight, Charge the target, move towards it (or the mission's goal), Dash.
 * Archivist: Fight, Shoot the target, Charge an operative with fewer than 10 wounds, move, Dash.
 */
function npoStep(g) {
  if (g.bidding) return null; // waiting for the players' bids
  const op = activeOp(g);
  if (!op) { npoBegin(g); return null; }
  if (op.dead) { endActivation(g); return null; }
  const can = Object.fromEntries(availableActions(g, op).map((a) => [a.id, a.ok]));
  const target = npoTargetFor(g, op);
  const beh = tpl(op).behaviour;
  if (can.fight) {
    const t = fightTargets(g, op).sort((a, b) => a.wounds - b.wounds)[0];
    op.order = 'engage';
    return { kind: 'fight', weapon: bestMelee(op), target: t };
  }
  if (beh === 'archivist' && can.shoot && target) {
    const w = tpl(op).weapons.find((x) => x.type === 'ranged');
    if (shootCheck(g, op, target, w).ok) { op.order = 'engage'; return { kind: 'shoot', weapon: w, target }; }
  }
  if (can.charge) {
    const among = beh === 'archivist' ? foes(g, op).filter((o) => o.wounds < 10) : target ? [target] : foes(g, op).filter((o) => o.side !== NPO);
    const p = chargePath(g, op, among);
    if (p) { op.order = 'engage'; doMove(g, op, 'charge', p); return null; }
  }
  // Brawlers that won't fight this activation move in cover with a Conceal order (NEMESIS stay Engaged).
  if (!tpl(op).nemesis) op.order = 'conceal';
  const goal = mission(g).npoGoal?.(g, op) || target;
  if (goal && can.reposition) {
    const p = pathToward(g, op, 'reposition', goal);
    if (p) { doMove(g, op, 'reposition', p); return null; }
  }
  if (goal && can.dash) {
    const p = pathToward(g, op, 'dash', goal);
    if (p) { doMove(g, op, 'dash', p); return null; }
  }
  endActivation(g);
  return null;
}

/**
 * Resolve an attack the AI declared with aiStep: a shooting result (for the dice dialog), or null for a
 * fight (resolved die by die in g.fight).
 */
export function aiAttack(g, decl) {
  const op = activeOp(g);
  if (decl.kind === 'shoot') return resolveShoot(g, op, decl.weapon, decl.target);
  startFight(g, op, decl.weapon, decl.target);
  return null;
}

// ---------- firefight ploys (交戰計謀) ----------
/** Use a button ploy now? Spends CP only when the computer has some to spare (keeps 1 for Command Re-roll). */
function aiButtonPloys(g, op) {
  const spare = g.cp[op.side] >= 2;
  const ok = Object.fromEntries(ffButtons(g, op).map((b) => [b.id, b.ok]));
  const use = (id) => ok[id] && useFFButton(g, op, id);
  const fresh = !Object.keys(op.acted).some((k) => !['unseen', 'accelerant', 'free'].includes(k));
  if (ok.shakeItOff && (op.aplNext || 0) < 0) return use('shakeItOff');
  if (!spare) return false;
  if (fresh) {
    if (use('momentRepute') || use('overwhelmTarget')) return true;
    if (ok.wildRage && prefersMelee(op) && !engagedEnemies(g, op).length && foes(g, op).some((e) => edgeDist(op, e) <= moveAllowance(g, op, 'charge') + 1.5)) return use('wildRage');
    if (ok.scrapcode && g.objectives.some((o) => dist(op, o) <= 6)) return use('scrapcode');
    if (ok.commandOverride) {
      const want = prefersMelee(op) ? 'conqueror' : 'protector';
      if (g.doctrina?.[op.side]?.tp === g.tp && g.doctrina[op.side].mode !== want) return use('commandOverride');
    }
    if (ok.capricious && !shootOptions(g, op).length) return use('capricious');
    if (ok.wrathVengeance && (engagedEnemies(g, op).length || shootOptions(g, op).length)) return use('wrathVengeance');
  }
  if (ok.virulentPoison) return use('virulentPoison');
  if (ok.frighteningOnslaught) return use('frighteningOnslaught');
  if (ok.ruthlessRampage && foes(g, op).some((e) => edgeDist(op, e) <= 3.5)) return use('ruthlessRampage');
  if (ok.slipAway && engagedEnemies(g, op).length && isInjured(op) && !prefersMelee(op)) return use('slipAway');
  if (ok.omnissiah && (engagedEnemies(g, op).length || shootOptions(g, op).length)) return use('omnissiah');
  if (ok.ancestorsWatching && (count1(op, 'shoot') || count1(op, 'fight')) && (shootOptions(g, op).length || engagedEnemies(g, op).length)) return use('ancestorsWatching');
  if (ok.slink && op.order === 'engage' && (count1(op, 'shoot') || count1(op, 'fight')) && op.ap <= 1) return use('slink');
  return false;
}
const count1 = (op, k) => op.acted?.[k] || 0;
/** Tick the attack ploys that apply to this Shoot / Fight (they're paid when it's resolved). */
function aiPloysFor(g, op, decl) {
  if (g.cp[op.side] >= 2) {
    for (const o of ffAttackOptions(g, op, decl.kind, decl.weapon, decl.target)) if (o.ok && !o.on && g.cp[op.side] - (g.ffPending?.ids.length || 0) >= 2) ffToggle(g, op, o.id);
  }
  return decl;
}

/**
 * Perform one AI step. Moves and other actions happen at once; an attack is only declared —
 * {kind: 'shoot' | 'fight', weapon, target} — so the UI can show it before rolling (see aiAttack).
 */
export function aiStep(g) {
  if (g.turn === NPO) return npoStep(g);
  const side = g.turn;
  let op = activeOp(g);
  if (!op && g.counter) {
    // Counteract only when it buys an attack: shoot (not in control range) or fight (in control range).
    const pick = counterCandidates(g, side)
      .map((o) => ({ o, s: engagedEnemies(g, o).length ? 10 : (shootOptions(g, o)[0]?.score || 0) }))
      .filter((x) => x.s > 0).sort((a, b) => b.s - a.s)[0];
    if (!pick) { passCounter(g); return null; }
    activate(g, pick.o);
    return null;
  }
  if (!op) {
    const ready = readyOps(g, side);
    if (!ready.length) { endActivation(g); return null; }
    // Melee operatives standing exposed get to move into cover first.
    const urgent = (o) => (prefersMelee(o) && !o.frenzy ? Math.min(4, exposure(g, o, o, o.order) * 1.5) : 0);
    const score = (o) => (engagedEnemies(g, o).length ? 10 : 0) + (shootOptions(g, o)[0]?.score || 0) + urgent(o) + Math.random();
    op = ready.sort((a, b) => score(b) - score(a))[0];
    activate(g, op);
    // Melee operatives stay Concealed while closing in, and only go Engage when they can Charge or fight now.
    const melee = prefersMelee(op) && !op.frenzy;
    op.order = melee && !engagedEnemies(g, op).length && !chargePath(g, op) && g.tp < 4 ? 'conceal' : 'engage';
    return null;
  }
  if (op.dead) { endActivation(g); return null; }
  if (isArchon(op)) { const opts = painOptions(g, op); const id = opts.includes('painHeal') && op.maxW - op.wounds >= 3 ? 'painHeal' : opts.includes('darkAnimus') ? 'darkAnimus' : null; if (id) { usePain(g, op, id); return null; } }
  if (aiButtonPloys(g, op)) return null;
  const can = Object.fromEntries(availableActions(g, op).map((a) => [a.id, a.ok]));

  if (can.pistolBarrage && shootOptions(g, op).length) { doSelfAction(g, op, 'pistolBarrage'); return null; }
  for (const id of ['soulHeal', 'soulChannel', 'wardingShield', 'tormentGrenade', 'drugHeal']) if (can[id]) { const t = TARGET_ACTIONS[id].targets(g, op)[0]; if (t) { doTargetAction(g, op, id, t); return null; } }
  // Mission actions and markers first: they score.
  for (const id of missionActionsFor(g, op.side)) if (can[id]) { doMissionAction(g, op, id); return null; }
  if (can.pickUp) { doPickUp(g, op); return null; }
  if (can.dakkaDash && shootOptions(g, op).length) { doDakkaDash(g, op); return null; }
  if (can.spot) {
    // Spot the enemy that friendlies within 3" of the Spotter could shoot best.
    const near = living(g, op.side).filter((o) => edgeDist(o, op) <= 3 && o.ready);
    const t = TARGET_ACTIONS.spot.targets(g, op).sort((a, b) => b.wounds - a.wounds)[0];
    if (t && near.length) { doTargetAction(g, op, 'spot', t); return null; }
  }
  // Kasrkin / Legionaries.
  if (can.unleashDaemon && foes(g, op).some((e) => edgeDist(op, e) <= 9)) { doSelfAction(g, op, 'unleashDaemon'); return null; }
  if (can.tacticalCommand) {
    const t = TARGET_ACTIONS.tacticalCommand.targets(g, op).filter((o) => o.ready || o === op).sort((a, b) => (shootOptions(g, b)[0]?.score || 0) - (shootOptions(g, a)[0]?.score || 0))[0];
    if (t) { doTargetAction(g, op, 'tacticalCommand', t); return null; }
  }
  if (can.battleComms && op.ap >= 2) {
    const t = TARGET_ACTIONS.battleComms.targets(g, op).filter((o) => o.ready).sort((a, b) => (shootOptions(g, b)[0]?.score || 0) - (shootOptions(g, a)[0]?.score || 0))[0];
    if (t) { doTargetAction(g, op, 'battleComms', t); return null; }
  }
  if (can.meltaMine && foes(g, op).some((e) => edgeDist(op, e) <= 6)) { doSelfAction(g, op, 'meltaMine'); return null; }
  if (can.grislyMark && op.ap >= 2 && g.objectives.some((o) => dist(op, o) <= 2.5) && foes(g, op).some((e) => edgeDist(op, e) <= 8)) { doSelfAction(g, op, 'grislyMark'); return null; }
  // Universal equipment: resupply at the Ammo Cache, stun a cluster (or a 3+ APL enemy).
  if (can.ammoResupply && shootOptions(g, op).length) { doSelfAction(g, op, 'ammoResupply'); return null; }
  if (can.eqStun && op.ap >= 2) {
    const ts = TARGET_ACTIONS.eqStun.targets(g, op);
    const near = (t) => foes(g, op).filter((o) => edgeDist(o, t) <= 1).length - living(g, op.side).filter((o) => edgeDist(o, t) <= 1).length;
    const t = ts.sort((a, b) => near(b) - near(a) || tpl(b).apl - tpl(a).apl)[0];
    if (t && (near(t) >= 2 || tpl(t).apl >= 3)) { doTargetAction(g, op, 'eqStun', t); return null; }
  }
  if (can.stunGrenade) {
    // Throw it at the enemy with the most other enemies within 1".
    const ts = TARGET_ACTIONS.stunGrenade.targets(g, op);
    const near = (t) => foes(g, op).filter((o) => edgeDist(o, t) <= 1).length - living(g, op.side).filter((o) => edgeDist(o, t) <= 1).length;
    const t = ts.sort((a, b) => near(b) - near(a))[0];
    if (t && near(t) >= 2 && op.ap >= 2) { doTargetAction(g, op, 'stunGrenade', t); return null; }
  }
  // Flail when it hits enemies but no friendlies.
  if (can.flail && !flailTargets(g, op).some((t) => t.side === op.side)) { doFlail(g, op); return null; }
  if (can.vitality) {
    const t = TARGET_ACTIONS.vitality.targets(g, op).filter((o) => o.maxW - o.wounds >= 4).sort((a, b) => a.wounds - b.wounds)[0];
    if (t) { doTargetAction(g, op, 'vitality', t); return null; }
  }
  if (can.miasma) {
    // Poisoned enemies take 3 damage; otherwise poison the toughest.
    const ts = TARGET_ACTIONS.miasma.targets(g, op);
    const t = ts.filter((e) => e.poison).sort((a, b) => a.wounds - b.wounds)[0] || ts.sort((a, b) => b.wounds - a.wounds)[0];
    if (t) { doTargetAction(g, op, 'miasma', t); return null; }
  }
  // Fellgor: Sweeping Blow into enemies (not friends), Gong Knell when it can be shot, healing and Incite Fury.
  if (can.sweepingBlow) {
    const near = g.ops.filter((o) => !o.dead && o !== op && edgeDist(o, op) <= 2 && visibility(g, op, o).visible);
    if (near.some((o) => o.side !== op.side) && !near.some((o) => o.side === op.side)) { doSelfAction(g, op, 'sweepingBlow'); return null; }
  }
  if (can.gongKnell && op.ap >= 2 && foes(g, op).some((e) => visibility(g, e, op).visible)) { doSelfAction(g, op, 'gongKnell'); return null; }
  if (can.rejuvenation) {
    const t = TARGET_ACTIONS.rejuvenation.targets(g, op).filter((o) => o.maxW - o.wounds >= 4).sort((a, b) => a.wounds - b.wounds)[0];
    if (t) { doTargetAction(g, op, 'rejuvenation', t); return null; }
  }
  if (can.inciteFury && op.ap >= 2) {
    const t = TARGET_ACTIONS.inciteFury.targets(g, op).find((o) => o.ready);
    if (t) { doTargetAction(g, op, 'inciteFury', t); return null; }
  }
  // Blooded: Shielding when enemies can see it, Sacrilegious Actuation, Stimms on a hurt friend.
  if (can.shieldingUp && foes(g, op).some((e) => visibility(g, e, op).visible)) { doSelfAction(g, op, 'shieldingUp'); return null; }
  if (can.actuation) { doSelfAction(g, op, 'actuation'); return null; }
  if (can.stimm) {
    const t = TARGET_ACTIONS.stimm.targets(g, op).sort((a, b) => a.wounds / a.maxW - b.wounds / b.maxW)[0];
    if (t) { doTargetAction(g, op, 'stimm', t); return null; }
  }
  // Warpcoven: Alight the enemy it's about to shoot, Ravage Destiny the toughest enemy in reach.
  if (can.alight && op.ap >= 2 && shootOptions(g, op).length) {
    const t = shootOptions(g, op)[0].t;
    if (TARGET_ACTIONS.alight.targets(g, op).includes(t)) { doTargetAction(g, op, 'alight', t); return null; }
  }
  if (can.ravage && op.ap >= 2) {
    const t = TARGET_ACTIONS.ravage.targets(g, op).sort((a, b) => b.wounds - a.wounds)[0];
    if (t) { doTargetAction(g, op, 'ravage', t); return null; }
  }
  // Phobos: Helix Gauntlet on a badly hurt friend; Auspex Scan before shooting.
  if (can.helix) {
    const t = TARGET_ACTIONS.helix.targets(g, op).filter((o) => o.maxW - o.wounds >= 4).sort((a, b) => a.wounds - b.wounds)[0];
    if (t) { doTargetAction(g, op, 'helix', t); return null; }
  }
  if (can.auspexScan && op.ap >= 2 && foes(g, op).some((e) => edgeDist(op, e) <= 8)) { doSelfAction(g, op, 'auspexScan'); return null; }
  // Navy Breachers: Interference Pulse on the toughest enemy; detonate the Gheistskull when it's next to enemies only.
  if (can.pulse && op.ap >= 2) {
    const t = TARGET_ACTIONS.pulse.targets(g, op).sort((a, b) => b.wounds - a.wounds)[0];
    if (t) { doTargetAction(g, op, 'pulse', t); return null; }
  }
  const det = can.shoot && tpl(op).weapons.find((w) => w.rules.detonate);
  if (det) {
    const skull = living(g, op.side).find((o) => tpl(o).gheistskull);
    const near = (side) => living(g, side).filter((o) => o !== skull && edgeDist(o, skull) <= 1).length;
    if (skull && shootCheck(g, op, skull, det).ok && near(1 - op.side) >= 1 && near(op.side) === 0) return { kind: 'shoot', weapon: det, target: skull };
  }
  if (can.boost && can.charge && !chargePath(g, op)) {
    const reach = moveAllowance(g, op, 'charge') + 2 + 1;
    if (foes(g, op).some((e) => edgeDist(op, e) <= reach)) { doSelfAction(g, op, 'boost'); return null; }
  }
  // Hierotek Circle: Reanimate, repairs and buffs, Interstitial Command for the friendly with the best shot.
  if (can.reanimateSure && op.ap >= 2) { doSelfAction(g, op, 'reanimateSure'); return null; }
  if (can.reanimate) { doSelfAction(g, op, 'reanimate'); return null; }
  if (can.canoptekRepair) {
    const t = TARGET_ACTIONS.canoptekRepair.targets(g, op).filter((o) => o.maxW - o.wounds >= 3).sort((a, b) => a.wounds / a.maxW - b.wounds / b.maxW)[0];
    if (t) { doTargetAction(g, op, 'canoptekRepair', t); return null; }
  }
  if (can.interstitial) {
    const proxyScore = (t) => { const keep = { ap: t.ap, acted: t.acted }; t.ap = 1; t.acted = {}; const s = shootOptions(g, t)[0]?.score || 0; t.ap = keep.ap; t.acted = keep.acted; return s; };
    const t = TARGET_ACTIONS.interstitial.targets(g, op).map((o) => [o, proxyScore(o)]).sort((a, b) => b[1] - a[1])[0];
    if (t && t[1] > 1.5) {
      doTargetAction(g, op, 'interstitial', t[0]);
      const best = shootOptions(g, t[0])[0];
      if (best) resolveShoot(g, t[0], best.w, best.t);
      if (g.proxy) endProxy(g);
      return null;
    }
  }
  if (can.augment && op.ap >= 2) {
    const t = TARGET_ACTIONS.augment.targets(g, op).filter((o) => o.ready || o === op).sort((a, b) => bestRanged(b, 0) - bestRanged(a, 0))[0];
    if (t && g.augment?.[op.side]?.t !== t.uid) { doTargetAction(g, op, 'augment', t); return null; }
  }
  if (can.reinforce && op.ap >= 2 && !g.reinforce?.[op.side]) {
    const seen = (o) => foes(g, o).filter((e) => visibility(g, e, o).visible).length;
    const t = TARGET_ACTIONS.reinforce.targets(g, op).sort((a, b) => seen(b) - seen(a))[0];
    if (t && seen(t)) { doTargetAction(g, op, 'reinforce', t); return null; }
  }
  if (can.accelerate) {
    const t = TARGET_ACTIONS.accelerate.targets(g, op).find((o) => o.ready);
    if (t) { doTargetAction(g, op, 'accelerate', t); return null; }
  }
  if (can.mdVision && op.ap >= 2 && can.shoot) {
    const w = tpl(op).weapons.find((x) => x.type === 'ranged');
    if (w && foes(g, op).some((t) => shootCheck(g, op, t, w).obscured)) { doSelfAction(g, op, 'mdVision'); return null; }
  }
  // Exaction Squad: Apprehend (free) the toughest enemy in reach; Veriscant the toughest visible enemy.
  if (can.apprehend) {
    const t = TARGET_ACTIONS.apprehend.targets(g, op).sort((a, b) => b.wounds - a.wounds)[0];
    if (t && op.apprehend !== t.uid) { doTargetAction(g, op, 'apprehend', t); return null; }
  }
  if (can.veriscant && (op.ap >= 2 || actionCost(g, op, 'veriscant') === 0)) {
    const t = TARGET_ACTIONS.veriscant.targets(g, op).sort((a, b) => b.wounds - a.wounds)[0];
    if (t) { doTargetAction(g, op, 'veriscant', t); return null; }
  }
  if (can.medikit) {
    const t = TARGET_ACTIONS.medikit.targets(g, op).filter((o) => o.maxW - o.wounds >= 3).sort((a, b) => a.wounds - b.wounds)[0];
    if (t) { doTargetAction(g, op, 'medikit', t); return null; }
  }
  if (can.knuxSmash) {
    const t = TARGET_ACTIONS.knuxSmash.targets(g, op).sort((a, b) => a.wounds - b.wounds)[0];
    if (t) { doTargetAction(g, op, 'knuxSmash', t); return null; }
  }
  // Pan Spectral Scan by the enemy it's about to shoot; System Jam on the most dangerous valid target.
  if (can.panScan && op.ap >= 2 && shootOptions(g, op).length) {
    const t = shootOptions(g, op)[0].t;
    if (TARGET_ACTIONS.panScan.targets(g, op).includes(t)) { doTargetAction(g, op, 'panScan', t); return null; }
  }
  if (can.jamToken && op.ap >= 2) {
    const t = TARGET_ACTIONS.jamToken.targets(g, op).sort((a, b) => b.wounds - a.wounds)[0];
    if (t) { doTargetAction(g, op, 'jamToken', t); return null; }
  }
  if (can.fight) {
    // The fight is resolved die by die (g.fight); the UI lets a human defender choose.
    const ts = fightTargets(g, op).sort((a, b) => a.wounds - b.wounds);
    // Swipe (Bloatspawn): with two or more enemies in reach, sweep through them all.
    const swipe = tpl(op).weapons.find((w) => w.rules.swipe);
    const weapon = swipe && (ts.length >= 2 || op.acted.free?.fight === 'swipe') ? swipe : bestMelee(op);
    return aiPloysFor(g, op, { kind: 'fight', weapon, target: ts[0] });
  }
  if (can.fallBack && isInjured(op) && !prefersMelee(op)) {
    const away = { x: op.side === 0 ? 2 : 28, y: op.y };
    const p = pathToward(g, op, 'fallBack', away);
    if (p) { doMove(g, op, 'fallBack', p); return null; }
  }
  if (can.markerlight) {
    // Mark the target it's about to shoot (Shoot and Markerlight must share a target); marker drones mark the toughest enemy.
    const targets = TARGET_ACTIONS.markerlight.targets(g, op).filter((e) => (e.ml || 0) < 4);
    const best = can.shoot ? shootOptions(g, op)[0]?.t : null;
    const t = best && targets.includes(best) ? best : !can.shoot ? targets.sort((a, b) => b.wounds - a.wounds)[0] : null;
    if (t && (op.ap >= 2 || !can.shoot)) { doTargetAction(g, op, 'markerlight', t); return null; }
  }
  // Aim ploys (Long Arm, Supporting Fire) when nothing can be shot otherwise.
  if (can.shoot && g.cp[op.side] >= 2 && !shootOptions(g, op).length) {
    const aims = ffAttackOptions(g, op, 'shoot', null, null, true);
    for (const o of aims) ffToggle(g, op, o.id);
    if (aims.length && !shootOptions(g, op).length) ffClearPending(g);
  }
  if (can.shoot && !prefersMelee(op)) {
    const best = shootOptions(g, op)[0];
    if (best) return aiPloysFor(g, op, { kind: 'shoot', weapon: best.w, target: best.t });
  }
  if (can.charge && (prefersMelee(op) || !shootOptions(g, op).length)) {
    const p = chargePath(g, op);
    if (p) { doMove(g, op, 'charge', p); return null; }
  }
  if (can.shoot) {
    const best = shootOptions(g, op)[0];
    if (best) return aiPloysFor(g, op, { kind: 'shoot', weapon: best.w, target: best.t });
  }
  const goal = pickGoal(g, op);
  // Melee operatives advance from cover to cover instead of walking straight at the enemy.
  const careful = prefersMelee(op) && !op.frenzy;
  const move = (kind) => (careful ? safeMove(g, op, kind, goal, op.order) : pathToward(g, op, kind, goal));
  if (goal && can.reposition) {
    const p = move('reposition');
    if (p) { doMove(g, op, 'reposition', p); return null; }
  }
  if (goal && can.dash && !(can.shoot && shootOptions(g, op).length)) {
    const p = move('dash');
    if (p) { doMove(g, op, 'dash', p); return null; }
  }
  endActivation(g);
  return null;
}
