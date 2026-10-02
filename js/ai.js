import {
  activate, activeOp, availableActions, counterCandidates, passCounter, avgDmg, bestMelee, buyPloy, controller, doMark, doMove, edgeDist, endActivation,
  engagedEnemies, injuredPenalty, isInjured, living, markCheck, moveAllowance, radius, resolveShoot, shootCheck, startFight, team, tpl,
} from './game.js';
import { dist } from './geometry.js';
import { clampPath, findPath, moveCtx } from './path.js';

export function aiStrategy(g, side) {
  for (const p of team(g, side).ploys) {
    if (g.cp[side] >= p.cp + 1 && Math.random() < 0.6) buyPloy(g, side, p);
  }
}

function shootOptions(g, op) {
  const opts = [];
  const hitMod = injuredPenalty(g, op) ? 1 : 0;
  for (const w of tpl(op).weapons.filter((x) => x.type === 'ranged')) {
    for (const t of living(g, 1 - op.side)) {
      const c = shootCheck(g, op, t, w);
      if (!c.ok) continue;
      // Don't Blast a target next to friendly operatives.
      if (w.rules.blast && living(g, op.side).some((f) => f !== op && edgeDist(t, f) <= w.rules.blast)) continue;
      let score = avgDmg(w, hitMod - (t.marked ? 1 : 0)) * (1 - (7 - tpl(t).save) / 6 * 0.5) * (c.cover ? 0.75 : 1);
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
  const enemies = living(g, 1 - op.side);
  const nearestEnemy = enemies.sort((a, b) => dist(op, a) - dist(op, b))[0];
  if (prefersMelee(op) && nearestEnemy) return nearestEnemy;
  const objs = g.objectives
    .map((o) => ({ o, c: controller(g, o), d: dist(op, o) }))
    .sort((a, b) => (a.c === op.side) - (b.c === op.side) || a.d - b.d);
  const holding = objs.find((x) => x.d - radius(op) - 0.4 <= 1 && x.c !== 1 - op.side);
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

function chargePath(g, op) {
  const ctx = moveCtx(g, op);
  const max = moveAllowance(g, op, 'charge');
  const r = radius(op);
  let best = null;
  const targets = living(g, 1 - op.side).filter((e) => edgeDist(op, e) <= max + 1.5).sort((a, b) => a.wounds - b.wounds);
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

/** Perform one AI step. Returns an attack result (for the dice dialog) or null. */
export function aiStep(g) {
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
    const ready = living(g, side).filter((o) => o.ready);
    if (!ready.length) { endActivation(g); return null; }
    const score = (o) => (engagedEnemies(g, o).length ? 10 : 0) + (shootOptions(g, o)[0]?.score || 0) + Math.random();
    op = ready.sort((a, b) => score(b) - score(a))[0];
    activate(g, op);
    op.order = 'engage';
    return null;
  }
  if (op.dead) { endActivation(g); return null; }
  const can = Object.fromEntries(availableActions(g, op).map((a) => [a.id, a.ok]));

  if (can.fight) {
    // The fight is resolved die by die (g.fight); the UI lets a human defender choose.
    const t = engagedEnemies(g, op).sort((a, b) => a.wounds - b.wounds)[0];
    startFight(g, op, bestMelee(op), t);
    return null;
  }
  if (can.fallBack && isInjured(op) && !prefersMelee(op)) {
    const away = { x: op.side === 0 ? 2 : 28, y: op.y };
    const p = pathToward(g, op, 'fallBack', away);
    if (p) { doMove(g, op, 'fallBack', p); return null; }
  }
  if (can.mark) {
    const t = living(g, 1 - op.side).filter((e) => !e.marked && markCheck(g, op, e)).sort((a, b) => b.maxW - a.maxW)[0];
    if (t && op.ap >= 2) { doMark(g, op, t); return null; }
  }
  if (can.shoot && !prefersMelee(op)) {
    const best = shootOptions(g, op)[0];
    if (best) return resolveShoot(g, op, best.w, best.t);
  }
  if (can.charge && (prefersMelee(op) || !shootOptions(g, op).length)) {
    const p = chargePath(g, op);
    if (p) { doMove(g, op, 'charge', p); return null; }
  }
  if (can.shoot) {
    const best = shootOptions(g, op)[0];
    if (best) return resolveShoot(g, op, best.w, best.t);
  }
  const goal = pickGoal(g, op);
  if (goal && can.reposition) {
    const p = pathToward(g, op, 'reposition', goal);
    if (p) { doMove(g, op, 'reposition', p); return null; }
  }
  if (goal && can.dash && !(can.shoot && shootOptions(g, op).length)) {
    const p = pathToward(g, op, 'dash', goal);
    if (p) { doMove(g, op, 'dash', p); return null; }
  }
  endActivation(g);
  return null;
}
