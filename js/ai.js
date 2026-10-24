import { accessPointsOf } from './tombworld-access.js';
import {
  activate, activeOp, actionCost, availableActions, missionActionsFor, deployZones, weaponsFor, endProxy, setDoctrina, ffButtons, useFFButton, ffAttackOptions, ffToggle, ffClearPending, setSkills, counterCandidates, passCounter, avgDmg, bestMelee, buyPloy, controller, doMove, edgeDist, endActivation,
  netCands, engagedEnemies, statPenalty, isInjured, doFlail, flailTargets, doDakkaDash, setMark, fightTargets, living, moveAllowance, TARGET_ACTIONS, doTargetAction, mlLevel, radius, resolveShoot, shootCheck, startFight, team, tpl,
  foes, NPO, npoBegin, mission, doMissionAction, doPickUp, placeBid, canPickUpMarker, pickUpTargets, doOptics,
  readyOps, orderIssuer, chooseGuardOrder, eyeLeft, eyeOfAncestors, placeTactician, doSelfAction, scrambleTargets, omniScramble, assignBlood, setGaze, visibility,
  isMounted, sprintCheck, doSprint, doTurn, enterFromReserve, wbAiEmerge, moveStat,
  goreOf, sangOptions, useSang, bleedTargets, useBleed, canFavour, useFavour,
  resourceOptions, useResource,
} from './game.js';
import { isMandrake, doShadowPassage, shadowPassageCheck } from './mandrakes.js';
import { isArchon, painOptions, usePain } from './archon.js';
import { isDeathwatch, dwAmmoAvailable, dwAmmoWeapon } from './deathwatch.js';
import { breakTarget } from './wrecka.js';
import { scAiStrategy } from './scouts.js';
import { rtAiStrategy, rtSlingshotAI, doSlingshot } from './ratlings.js';
import { sfAiStrategy } from './sanctifiers.js';
import { kmGrappleAI, kmDoGrapple } from './kommandos.js';
import { dkAiStrategy, dkMine } from './deathkorps.js';
import { rvAiStrategy, rvAiUnderground, rvAiBurrow } from './raveners.js';
import { spAiStrategy } from './spectres.js';
import { aqAiStrategy, aqAiAbove } from './aquilons.js';
import { vdAiStrategy } from './voiddancers.js';
import { vsChargeAmong } from './vespids.js';
import { xvAiStrategy } from './stealthsuits.js';
import { wsAiStrategy, wsAiAction, wsChargeEndOk } from './wolfscouts.js';
import { npoTargetFor } from './missions.js';
import { dist } from './geometry.js';
import { clampPath, findPath, moveCtx, wholeInchPath } from './path.js';

export function aiStrategy(g, side) {
  scAiStrategy(g, side); // Scout Squad: Tactical Manoeuvre and Diversion gambits
  rtAiStrategy(g, side); // Ratlings: Target Designation
  sfAiStrategy(g, side); // Sanctifiers: a new orator after the Confessor falls
  dkAiStrategy(g, side); // Death Korps: Chronometer, Gas Bombardment
  rvAiStrategy(g, side); // Raveners: the next Tunnel marker, Synaptic Link
  spAiStrategy(g, side); // Spectre Squad: Starshell Flare
  aqAiStrategy(g, side); // Tempestus Aquilons: Rapid Insertion, Drop markers
  vdAiStrategy(g, side); // Void-dancer Troupe: Saedath
  xvAiStrategy(g, side); // XV26 Stealth Battlesuits: Drone Controller, Counter-Network Jammers
  wsAiStrategy(g, side, chargePath); // Wolf Scouts: the Storm marker, Pounce
  for (const p of team(g, side).ploys) {
    if (g.cp[side] >= p.cp + 1 && Math.random() < 0.6 && buyPloy(g, side, p)) break;
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
  for (const w of weaponsFor(g, op).filter((x) => x.type === 'ranged' && !x.rules.wkPulsa)) { // (the Pulsa rokkit is picked separately)
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
const prefersMelee = (op) => !!tpl(op).wkSquig || avgDmg(bestMelee(op)) > bestRanged(op, 0) * 1.1; // (a Bomb Squig runs at the enemy)

function pickGoal(g, op) {
  // Envoy (Tac Op): head deep into enemy territory.
  const tac = g.tacOps?.[op.side];
  if (tac?.envoy?.tp === g.tp && tac.envoy.uid === op.uid) { const z = deployZones(g)[1 - op.side]; return { x: (z.x0 + z.x1) / 2, y: g.axis === 'y' ? (z.y0 + z.y1) / 2 : op.y }; }
  const enemies = foes(g, op);
  const nearestEnemy = enemies.sort((a, b) => dist(op, a) - dist(op, b))[0];
  if ((prefersMelee(op) || tpl(op).gheistskull) && nearestEnemy) return nearestEnemy; // the Gheistskull closes in to be detonated
  // Objective markers, and mission markers the operative could pick up.
  // (Tac Op markers: its own Retrieval / Intelligence markers, and the enemy's Banner to take it off the floor.)
  const tacMarker = (m) => (m.kind === 'banner' ? m.owner !== op.side : ['retrieval', 'intel'].includes(m.kind)) && canPickUpMarker(g, op, m);
  const pickable = (g.markers || []).filter((m) => !m.carriedBy && (m.owner == null ? mission(g).canPickUp?.(g, op, m) : tacMarker(m)));
  const carrying = (g.markers || []).some((m) => m.carriedBy === op.uid);
  const objs = [...g.objectives, ...(carrying ? [] : pickable)]
    .map((o) => ({ o, c: controller(g, o), d: dist(op, o) }))
    .sort((a, b) => (a.c === op.side) - (b.c === op.side) || a.d - b.d);
  const holding = objs.find((x) => x.d - radius(op) - 0.4 <= 1 && (x.c == null || x.c === op.side));
  if (holding) return null; // stay on the objective
  return objs[0] ? objs[0].o : nearestEnemy;
}

function pathToward(g, op, kind, goal) {
  const ctx = moveCtx(g, op, kind);
  const max = moveAllowance(g, op, kind);
  // Try the goal itself, then points around it.
  const tries = [goal];
  const closed=accessPointsOf(g).filter(d=>d.kind === 'hatchway' && d.state === 'closed').sort((a,b)=>dist(op,a)+dist(a,goal)-dist(op,b)-dist(b,goal));
  const doorSpots=closed.flatMap(d=>[-1,1].map(sign=>({x:d.x,y:d.y,[d.axis]:d[d.axis]+sign*(radius(op)+.2)})));
  if(closed.length && !findPath(ctx,goal)) tries.unshift(...doorSpots);
  for (let ring = 1.4; ring <= 4; ring += 1.3)
    for (let a = 0; a < 12; a++) tries.push({ x: goal.x + Math.cos(a * Math.PI / 6) * ring, y: goal.y + Math.sin(a * Math.PI / 6) * ring });
  tries.push(...doorSpots);
  const endOk = (q) => !ctx.inEnemyER(q);
  for (const p of tries) {
    const path = findPath(ctx, p);
    if (!path) continue;
    const res = clampPath(ctx, path, max, endOk);
    if (res) return res;
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
  const ctx = moveCtx(g, op, kind);
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
      if (ctx.segFree(op, q) && !ctx.climbs([op, q])) { const pts = [{ x: op.x, y: op.y }, q], len = dist(op, q) + ctx.extra(pts); if (len <= max + 0.01) cands.push({ pts, len }); continue; }
      const path = findPath(ctx, q);
      if (path && path.len <= max + 0.01) cands.push(path);
    }
  }
  for (const raw of cands) {
    const path = wholeInchPath(ctx, raw, max, endOk);
    if (!path) continue;
    const p = path.pts[path.pts.length - 1];
    const s = score(p, path.len);
    if (s > best.s) best = { p, path, s };
  }
  return best.path && best.path.len >= 0.3 ? best.path : null;
}

/**
 * Exodite riders: where to Sprint (straight forwards up to 9" or back up to 3", after pivoting 45° at most).
 * Each candidate is scored by progress towards the goal, the best shot or fight it would have there, the SPEED
 * it would end with and the fire it would draw; staying put must be clearly worse.
 */
function sprintSpot(g, op) {
  const goal = pickGoal(g, op);
  const melee = prefersMelee(op);
  const at = (p, fn) => { const k = { x: op.x, y: op.y }; op.x = p.x; op.y = p.y; try { return fn(); } finally { op.x = k.x; op.y = k.y; } };
  const score = (p, inches, back) => at(p, () => {
    const prog = goal ? dist(op, goal) - dist(p, goal) : 0;
    const eng = engagedEnemies(g, op).length;
    const shot = op.ap >= 1 ? shootOptions(g, op)[0]?.score || 0 : 0;
    const speed = back ? 0 : inches >= 7 ? 2 : inches >= 4 ? 1 : 0;
    return prog * 0.3 + (melee && eng ? 6 : 0) + (melee ? 0 : shot) + speed - Math.min(4, exposure(g, op, p, op.order) * (melee && eng ? 0.3 : 1));
  });
  const fa = op.facing || 0;
  let best = { p: null, s: score(op, 0, false) + 0.5 };
  for (const back of [false, true]) {
    for (let k = -3; k <= 3; k++) {
      const a = fa + (back ? Math.PI : 0) + k * Math.PI / 12;
      for (let d = 1; d <= (back ? 3 : 9); d++) {
        const p = { x: op.x + Math.cos(a) * d, y: op.y + Math.sin(a) * d };
        const c = sprintCheck(g, op, p);
        if (!c.ok) continue;
        const s = score(p, c.inches, back);
        if (s > best.s) best = { p, s };
      }
    }
  }
  return best.p;
}

function chargePath(g, op, among = foes(g, op)) {
  among = vsChargeAmong(g, op, among); // Vespid Stingwings without a Communion point: only the closest enemy
  const ctx = moveCtx(g, op, 'charge');
  const max = moveAllowance(g, op, 'charge');
  const r = radius(op);
  let best = null;
  const targets = among.filter((e) => edgeDist(op, e) <= max + 1.5).sort((a, b) => a.wounds - b.wounds);
  for (const t of targets) {
    const d = radius(t) + r + 0.5;
    for (let a = 0; a < 16; a++) {
      const p = { x: t.x + Math.cos(a * Math.PI / 8) * d, y: t.y + Math.sin(a * Math.PI / 8) * d };
      if (!ctx.free(p)) continue;
      const raw = findPath(ctx, p);
      const path = raw && wholeInchPath(ctx, raw, max, ctx.inEnemyER);
      if (path && path.len <= max && wsChargeEndOk(g, op, path.pts.at(-1)) && (!best || path.len < best.len)) best = path; // (Wolf Scouts: a Concealed Charge ends in the storm)
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
  // Blades of Khaine Aspect Techniques (free): Raging Heat when injured, One with the Gloom before its last action.
  if (ok.avRagingHeat && isInjured(op)) return use('avRagingHeat');
  if (ok.ssGloom && op.order === 'conceal' && op.ap <= 1 && !engagedEnemies(g, op).length) return use('ssGloom');
  if (ok.rtShootHide && op.acted?.rtRifleShot) return use('rtShootHide');
  if (!spare) return false;
  if (ok.bladewind && engagedEnemies(g, op).length && !tpl(op).exarch && prefersMelee(op)) return use('bladewind');
  if (ok.starfall && !tpl(op).exarch && op.ap >= 2 && shootOptions(g, op).length && !prefersMelee(op)) return use('starfall');
  if (fresh) {
    if (use('momentRepute') || use('overwhelmTarget')) return true;
    if (ok.wildRage && prefersMelee(op) && !engagedEnemies(g, op).length && foes(g, op).some((e) => edgeDist(op, e) <= moveAllowance(g, op, 'charge') + 1.5)) return use('wildRage');
    if (ok.scrapcode && g.objectives.some((o) => dist(op, o) <= 6)) return use('scrapcode');
    if (ok.commandOverride) {
      const want = prefersMelee(op) ? 'conqueror' : 'protector';
      if (g.doctrina?.[op.side]?.tp === g.tp && g.doctrina[op.side].mode !== want) return use('commandOverride');
    }
    if (ok.capricious && !shootOptions(g, op).length) return use('capricious');
    if (ok.mutantHerd && foes(g, op).some((e) => edgeDist(op, e) <= 10)) return use('mutantHerd'); // (Warpcoven: the Tzaangor go in together)
    if (ok.psychicCabal && shootOptions(g, op).length) return use('psychicCabal');
    if (ok.wrathVengeance && (engagedEnemies(g, op).length || shootOptions(g, op).length)) return use('wrathVengeance');
    if (ok.bondsThatBind) return use('bondsThatBind'); // (Hernkyn Yaegirs)
    if (ok.controlEdict && g.cp[op.side] >= 2) return use('controlEdict'); // (Hunter Clade: the partner activates next)
  }
  if (ok.wkProppaScrap && engagedEnemies(g, op).length && op.ap >= 2) return use('wkProppaScrap'); // (Wrecka Krew: two Fights)
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
  if (isDeathwatch(op) && decl.kind === 'shoot' && dwAmmoWeapon(decl.weapon) && !op.acted.dwAmmoPick) {
    const id = ['piercingCrits', 'devastating', 'severe', 'lethal', 'saturate'].find((id) => dwAmmoAvailable(g, op, id) && !decl.weapon.rules[id]);
    if (id) doSelfAction(g, op, `dwAmmo_${id}`);
  }
  // Free ones first (Blades of Khaine Aspect Techniques): one per activation, so take the first that fits.
  const free = ffAttackOptions(g, op, decl.kind, decl.weapon, decl.target).find((o) => o.ok && o.cp === 0);
  if (free && !free.on && !g.ffPending?.ids.some((id) => ffAttackOptions(g, op, decl.kind, decl.weapon, decl.target).find((x) => x.id === id && x.cp === 0))) ffToggle(g, op, free.id, decl.target);
  if (g.cp[op.side] >= 2) {
    for (const o of ffAttackOptions(g, op, decl.kind, decl.weapon, decl.target)) if (o.ok && !o.on && g.cp[op.side] - (g.ffPending?.ids.length || 0) >= 2) ffToggle(g, op, o.id, decl.target);
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
    if (pick.o.netCounter) pick.o.order = 'engage'; // Network Counteract: it selects its order first
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
    if (g.active !== op.uid) return null; // Mandrake activation interruption
    // Melee operatives stay Concealed while closing in, and only go Engage when they can Charge or fight now.
    const melee = prefersMelee(op) && !op.frenzy;
    op.order = !tpl(op).stoopid && melee && !engagedEnemies(g, op).length && !chargePath(g, op) && g.tp < 4 ? 'conceal' : 'engage'; // (Stoopid: always Engage)
    return null;
  }
  if (op.dead) { endActivation(g); return null; }
  if (isArchon(op)) { const opts = painOptions(g, op); const id = opts.includes('painHeal') && op.maxW - op.wounds >= 3 ? 'painHeal' : opts.includes('darkAnimus') ? 'darkAnimus' : null; if (id) { usePain(g, op, id); return null; } }
  if (aiButtonPloys(g, op)) return null;
  if (op.above) { if (op.ap <= 0) endActivation(g); else aqAiAbove(g, op); return null; } // Tempestus Aquilons set up above: land, or wait
  if (op.underground) { rvAiUnderground(g, op); return null; } // Raveners underground: emerge on the tunnel, or wait
  if (rvAiBurrow(g, op)) return null; // a hurt Ravener on the tunnel burrows away
  // Exodite riders in reserve come in along the killzone edge nearest to where they want to go.
  if (op.wbHidden) { if (!(op.ap > 0 && wbAiEmerge(g, op))) endActivation(g); return null; } // Familiar Territory (Wyrmblade): emerge, else stay hidden
  if (op.reserve) {
    const goal = pickGoal(g, op) || foes(g, op)[0] || { x: 15, y: 11 };
    const along = g.axis === 'y' ? 'x' : 'y';
    const tries = [0, 2, -2, 4, -4, 6, -6, 9, -9].map((d) => ({ x: goal.x, y: goal.y, [along]: goal[along] + d }));
    if (!(op.ap > 0 && tries.some((p) => enterFromReserve(g, op, p)))) endActivation(g);
    return null;
  }
  const can = Object.fromEntries(availableActions(g, op).map((a) => [a.id, a.ok]));
  if (op.team === 'murderwing') {
    if (can.mwCarving && foes(g, op).filter((t) => edgeDist(op, t) <= 2 && visibility(g, op, t).visible).length >= 2 && !living(g, op.side).some((t) => t !== op && edgeDist(op, t) <= 2)) { doSelfAction(g, op, 'mwCarving'); return null; }
    if (can.mwShriek && op.ap >= 2) { const t = TARGET_ACTIONS.mwShriek.targets(g, op).sort((a,b) => a.wounds-b.wounds)[0]; if(t) { doTargetAction(g, op, 'mwShriek', t); return null; } }
    if (can.mwVox && foes(g, op).filter((t) => edgeDist(op, t) <= 2).length >= 2) { doSelfAction(g, op, 'mwVox'); return null; }
  }
  if (op.team === 'wreckaKrew') {
    // Bomb Squig: set off its explosives once more enemies than friendlies are caught within the blast.
    const boom = weaponsFor(g, op).find((w) => w.rules.wkExplosive);
    if (boom && can.shoot && shootCheck(g, op, op, boom).ok) {
      const near = g.ops.filter((t) => !t.dead && t !== op && t.x > -50 && edgeDist(op, t) <= boom.rules.blast && visibility(g, op, t).visible);
      const enemies = near.filter((t) => t.side !== op.side).length, friends = near.filter((t) => t.side === op.side && !tpl(t).wkSquig).length;
      if (enemies > friends) return aiPloysFor(g, op, { kind: 'shoot', weapon: boom, target: op });
    }
    // Pulsa rokkit: on a visible enemy with another enemy close by and no friendly near.
    const pulsa = weaponsFor(g, op).find((w) => w.rules.wkPulsa);
    if (pulsa && can.shoot && op.ap >= 1) {
      const t = foes(g, op).filter((e) => e.side < 2 && shootCheck(g, op, e, pulsa).ok
        && foes(g, op).filter((x) => edgeDist(x, e) <= 1.5).length >= 1 && !living(g, op.side).some((f) => edgeDist(f, e) <= 3))
        .sort((a, b) => foes(g, op).filter((x) => edgeDist(x, b) <= 2).length - foes(g, op).filter((x) => edgeDist(x, a) <= 2).length)[0];
      if (t) return { kind: 'shoot', weapon: pulsa, target: t };
    }
    // Break Stuff: tear down the enemy's equipment terrain.
    if (can.wkBreak && breakTarget(g, op)?.equip === 1 - op.side) { doSelfAction(g, op, 'wkBreak'); return null; }
  }
  if (op.team === 'scoutSquad') {
    // Tracker: Track Enemy on the toughest enemy not tracked yet this TP; Sniper: Optics before a shot.
    if (can.scTrack && op.ap >= 2) {
      const t = TARGET_ACTIONS.scTrack.targets(g, op).filter((e) => e.scTracked?.tp !== g.tp).sort((a, b) => b.wounds - a.wounds)[0];
      if (t) { doTargetAction(g, op, 'scTrack', t); return null; }
    }
    if (can.optics && op.ap >= 2 && shootOptions(g, op).length) { doOptics(g, op); return null; }
  }
  if (op.team === 'nemesisClaw') {
    // Premonition: a Prescience point for 1CP; Poison Objective on a held objective marker.
    if (can.ncPremonition) { doSelfAction(g, op, 'ncPremonition'); return null; }
    if (can.ncPoison) { doSelfAction(g, op, 'ncPoison'); return null; }
    // Disconcerting Mimicry while it still has AP for something else: -1 APL on a strong ready enemy, a Dash that pulls an enemy off an
    // objective marker, or an order change on an expended Engage-order enemy (it can't counteract any more).
    if (op.ap >= 2) {
      const pick = (id, filter, sort) => (can[id] ? TARGET_ACTIONS[id].targets(g, op).filter(filter).sort(sort)[0] : null);
      const onObj = (t) => (g.objectives || []).some((m) => dist(t, m) <= 2);
      const choice = [['ncMimicDash', pick('ncMimicDash', onObj, (a, b) => b.wounds - a.wounds)],
        ['ncMimicApl', pick('ncMimicApl', (t) => t.ready && tpl(t).apl >= 3, (a, b) => tpl(b).apl - tpl(a).apl)],
        ['ncMimicOrder', pick('ncMimicOrder', (t) => !t.ready && t.order === 'engage', (a, b) => b.wounds - a.wounds)]].find(([, t]) => t);
      if (choice) { doTargetAction(g, op, choice[0], choice[1]); return null; }
    }
  }
  if (isMandrake(op)) {
    const soul = can.mdSoulHeal && op.maxW - op.wounds >= 4 ? 'mdSoulHeal' : can.mdSoulApl ? 'mdSoulApl' : null;
    if (soul) { doSelfAction(g, op, soul); return null; }
    if (can.mdWreathe && op.ap >= 2) {
      const t = TARGET_ACTIONS.mdWreathe.targets(g, op).filter((x) => x.side !== op.side).sort((a, b) => edgeDist(op, a) - edgeDist(op, b))[0];
      if (t) { doTargetAction(g, op, 'mdWreathe', t); return null; }
    }
    if (can.mdProject && op.ap >= 2) {
      const t = TARGET_ACTIONS.mdProject.targets(g, op).sort((a, b) => edgeDist(op, a) - edgeDist(op, b))[0];
      if (t) { doTargetAction(g, op, 'mdProject', t); return null; }
    }
    if (can.rtSlingshot && !shootOptions(g, op).length && !engagedEnemies(g, op).length) { const p = rtSlingshotAI(g, op); if (p && doSlingshot(g, op, p)) return null; }
    if (can.rtIntercept && op.ap >= 1) {
      const t = TARGET_ACTIONS.rtIntercept.targets(g, op).sort((a, b) => b.wounds - a.wounds)[0];
      if (t) { doTargetAction(g, op, 'rtIntercept', t); return null; }
    }
    if (can.mdPass && !shootOptions(g, op).length && !engagedEnemies(g, op).length) {
      const goal = pickGoal(g, op);
      if (goal) {
        const choices = [];
        for (const m of g.terrain.filter((t) => t.kind === 'heavy')) for (const p of [{ x: m.x - 1, y: m.y + m.h / 2 }, { x: m.x + m.w + 1, y: m.y + m.h / 2 }, { x: m.x + m.w / 2, y: m.y - 1 }, { x: m.x + m.w / 2, y: m.y + m.h + 1 }]) {
          if (dist(p, goal) + 3 < dist(op, goal) && shadowPassageCheck(g, op, p).ok) choices.push(p);
        }
        choices.sort((a, b) => dist(a, goal) - dist(b, goal));
        if (choices.length && doShadowPassage(g, op, choices[0])) return null;
      }
    }
  }

  if (can.songOne) {
    const t = TARGET_ACTIONS.songOne.targets(g, op).filter((o) => o.maxW - o.wounds >= 5).sort((a, b) => (b.maxW - b.wounds) - (a.maxW - a.wounds))[0];
    const hurt = living(g, op.side).filter((o) => !o.reserve && o.maxW - o.wounds >= 2).length;
    if (can.songAll && hurt >= 3 && !(t && t.maxW - t.wounds >= 8)) { doSelfAction(g, op, 'songAll'); return null; }
    if (t) { doTargetAction(g, op, 'songOne', t); return null; }
  }
  if (can.cleansing) { const t = TARGET_ACTIONS.cleansing.targets(g, op)[0]; if (t) { doTargetAction(g, op, 'cleansing', t); return null; } }
  if (can.wails && op.ap >= 2) {
    const crowd = (t) => foes(g, op).filter((e) => !tpl(e).mounted && edgeDist(e, t) <= 2).length;
    const t = TARGET_ACTIONS.wails.targets(g, op).filter((e) => !tpl(e).mounted).sort((a, b) => crowd(b) - crowd(a))[0];
    if (t) { doTargetAction(g, op, 'wails', t); return null; }
  }
  if (can.windsGrace && op.ap >= 2) {
    const t = TARGET_ACTIONS.windsGrace.targets(g, op).filter((o) => isMounted(o) && (o === op || o.ready)).sort((a, b) => (a === op) - (b === op))[0];
    if (t) { doTargetAction(g, op, 'windsGrace', t); return null; }
  }
  // Goremongers: Bleeding tokens and Khorne's Favour fill the tank; Sanguavitae before fighting / charging;
  // Transfusion to an empty melee friendly; Gore-fuel and Dash and Spray before shooting.
  if (goreOf(op) != null) {
    const sang = Object.fromEntries(sangOptions(g, op).map((o) => [o.id, o.ok]));
    const bl = bleedTargets(g, op);
    if (bl.length) { useBleed(g, op, bl[0]); return null; }
    if (canFavour(g, op)) { useFavour(g, op); return null; }
    if (sang.rejuvenate && op.wounds <= op.maxW / 2 && op.maxW - op.wounds >= 4) { useSang(g, op, 'rejuvenate'); return null; }
    const engagedNow = engagedEnemies(g, op).length > 0;
    if (engagedNow && can.fight && !count1(op, 'fight')) {
      if (sang.fury && op.ap >= 1) { useSang(g, op, 'fury'); return null; }
      if (sang.rage) { useSang(g, op, 'rage'); return null; }
    }
    if (!engagedNow && can.charge && prefersMelee(op) && sang.rake && goreOf(op) === 2 && chargePath(g, op)) { useSang(g, op, 'rake'); return null; }
    if (sang.mania && goreOf(op) === 2 && !prefersMelee(op) && !(op.acted.sang || []).length) { useSang(g, op, 'mania'); return null; }
    if (can.transfusion) {
      const t = TARGET_ACTIONS.transfusion.targets(g, op).filter((o) => goreOf(o) === 0 && prefersMelee(o)).sort((a, b) => dist(op, a) - dist(op, b))[0];
      if (t) { doTargetAction(g, op, 'transfusion', t); return null; }
    }
    if (can.goreFuel && goreOf(op) === 2 && op.ap >= 2 && shootOptions(g, op).some((s) => s.w.group === 'gmSkewer')) { doSelfAction(g, op, 'goreFuel'); return null; }
    if (can.dashSpray && shootOptions(g, op).some((s) => s.w.id === 'gmDualF')) { doSelfAction(g, op, 'dashSpray'); return null; }
  }
  // Hernkyn Yaegirs: Resourceful points — heal a hurt operative when it activates, else +1 APL when it has something to do.
  {
    const ro = resourceOptions(g, op).map((o) => o.id);
    if (ro.includes('heal') && op.maxW - op.wounds >= 3) { useResource(g, op, 'heal'); return null; }
    if (ro.includes('apl') && op.ap >= 1 && (shootOptions(g, op).length || pickGoal(g, op))) { useResource(g, op, 'apl'); return null; }
  }
  // Sprint (free) to a better spot first: towards the goal, into a fight or a shot, as fast as it can.
  if (can.edSprint) {
    const p = sprintSpot(g, op);
    if (p && doSprint(g, op, p)) return null;
  }
  // Turn (1AP) when the goal lies outside its forward 45° and there's nothing to attack.
  if (can.edTurn && isMounted(op) && op.ap >= 2 && !engagedEnemies(g, op).length && !shootOptions(g, op).length) {
    const goal = pickGoal(g, op);
    if (goal) {
      let rel = Math.atan2(goal.y - op.y, goal.x - op.x) - (op.facing || 0);
      while (rel > Math.PI) rel -= 2 * Math.PI; while (rel < -Math.PI) rel += 2 * Math.PI;
      if (Math.abs(rel) > Math.PI / 4 + 0.05) { doTurn(g, op, goal); return null; }
    }
  }

  if (can.pistolBarrage && shootOptions(g, op).length) { doSelfAction(g, op, 'pistolBarrage'); return null; }
  if (can.dwCuffsHeal && op.maxW - op.wounds >= 2) { doSelfAction(g, op, 'dwCuffsHeal'); return null; }
  if (can.dwThrallUse && engagedEnemies(g, op).length && missionActionsFor(g, op.side).some((id) => !can[id])) { doSelfAction(g, op, 'dwThrallUse'); return null; }
  for (const id of ['soulHeal', 'soulChannel', 'wardingShield', 'tormentGrenade', 'drugHeal']) if (can[id]) { const t = TARGET_ACTIONS[id].targets(g, op)[0]; if (t) { doTargetAction(g, op, id, t); return null; } }
  // Mission actions and markers first: they score.
  // (a Breach hurts whoever is just beyond it: not with a friend near the access point)
  const breachSafe = (id) => { const d = id.startsWith('twBreach_') && accessPointsOf(g).find((x) => `twBreach_${x.id}` === id); return !d || !living(g, op.side).some((o) => o !== op && dist(o, d) <= 2.5); };
  for (const id of missionActionsFor(g, op.side)) if (can[id] && !id.startsWith('twClose_') && breachSafe(id)) { doMissionAction(g, op, id); return null; }
  if (can.pickUp && pickUpTargets(g, op).some((m) => !(m.kind === 'banner' && m.owner === op.side))) { doPickUp(g, op); return null; } // (never its own planted Banner)
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
  // Wyrmblade Sanctus: Soulsight the toughest visible enemy (once), Target Vulnerability before a stationary shot.
  if (can.wbSoulsight && op.ap >= 2 && !foes(g, op).some((e) => g.wbSoul?.[op.side] === e.uid)) {
    const t = TARGET_ACTIONS.wbSoulsight.targets(g, op).sort((a, b) => b.wounds - a.wounds)[0];
    if (t) { doTargetAction(g, op, 'wbSoulsight', t); return null; }
  }
  // Hierotek Crypteks: Nightmare Shroud with enemies close, Vision of Madness and Nanomine on the nearest threats.
  if (can.hcShroud && foes(g, op).some((e) => e.x > -50 && edgeDist(op, e) <= 4)) { doSelfAction(g, op, 'hcShroud'); return null; }
  for (const id of ['hcVision', 'hcNanomine']) if (can[id] && op.ap >= 2) {
    const t = TARGET_ACTIONS[id].targets(g, op).sort((a, b) => edgeDist(op, a) - edgeDist(op, b))[0];
    if (t && edgeDist(op, t) <= 10) { doTargetAction(g, op, id, t); return null; }
  }
  // Stealth Attack (Kroot Stalker) / Assassinate (Sanctus Talon): a free Charge and Fight from Conceal when an enemy is in reach.
  for (const id of ['stealthAttack', 'wbAssassinate']) if (can[id] && foes(g, op).some((e) => e.x > -50 && edgeDist(op, e) <= moveStat(g, op) + 0.5)) { doSelfAction(g, op, id); return null; }
  if (can.wbVuln && op.ap >= 2 && !op.acted?.movedDist && shootOptions(g, op).length) { doSelfAction(g, op, 'wbVuln'); return null; }
  if (can.wcEchoes) { doSelfAction(g, op, 'wcEchoes'); return null; } // Echoes from the Warp: one more action in this counteraction
  if (can.wcBrayhorn && !g.wcHorn?.[op.side]) { doSelfAction(g, op, 'wcBrayhorn'); return null; }
  if (can.wcRecon) {
    const t = TARGET_ACTIONS.wcRecon.targets(g, op).filter((o) => o.maxW - o.wounds >= 3).sort((a, b) => a.wounds / a.maxW - b.wounds / b.maxW)[0];
    if (t) { doTargetAction(g, op, 'wcRecon', t); return null; }
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
  // Sanctifiers: Incentivise a ready friendly, Sanctification Orb when a flamer is about, Wreathe in Fire when surrounded, Trained Assassin.
  if (can.sfIncentivise && op.ap >= 1) {
    const t = TARGET_ACTIONS.sfIncentivise.targets(g, op).filter((o) => o.ready && (o.aplNext || 0) < 1).sort((a, b) => b.wounds - a.wounds)[0];
    if (t) { doTargetAction(g, op, 'sfIncentivise', t); return null; }
  }
  if (can.sfOrb && op.ap >= 1 && living(g, op.side).some((o) => o !== op && o.ready && tpl(o).weapons.some((w) => w.rules.blaze))) {
    const t = TARGET_ACTIONS.sfOrb.targets(g, op).sort((a, b) => b.wounds - a.wounds)[0];
    if (t) { doTargetAction(g, op, 'sfOrb', t); return null; }
  }
  if (can.sfWreathe) { doSelfAction(g, op, 'sfWreathe'); return null; }
  if (can.pfAccel && living(g, op.side).some((o) => o !== op && o.ready && !tpl(o).drone && edgeDist(o, op) <= 6)) { doSelfAction(g, op, 'pfAccel'); return null; } // Pathfinder MV31 Pulse Accelerator
  if (can.kmGrapple && !shootOptions(g, op).length && !engagedEnemies(g, op).length) { const p = kmGrappleAI(g, op); if (p && kmDoGrapple(g, op, p)) return null; } // Kommando Grot
  if (can.dkDetonate) { // Death Korps Sapper: blow the mine when it hurts the enemy more than us
    const m = dkMine(g, op.side);
    const near = m ? g.ops.filter((o) => !o.dead && o.side < 2 && dist(o, m) - radius(o) <= 2.01) : [];
    if (near.filter((o) => o.side !== op.side).length >= 1 && near.filter((o) => o.side === op.side).length === 0) { doSelfAction(g, op, 'dkDetonate'); return null; }
  }
  if (can.dkPlaceMine && foes(g, op).some((e) => edgeDist(op, e) <= 14)) { doSelfAction(g, op, 'dkPlaceMine'); return null; }
  if (wsAiAction(g, op, can, doSelfAction, doTargetAction)) return null; // Wolf Scouts: Healing Balms, Hunter's Senses, the Haywire Mine
  if (can.sfTrained && op.order === 'conceal' && foes(g, op).some((e) => edgeDist(op, e) <= 12)) { doSelfAction(g, op, 'sfTrained'); return null; }
  if (can.medikit) {
    const t = TARGET_ACTIONS.medikit.targets(g, op).filter((o) => o.maxW - o.wounds >= 3).sort((a, b) => a.wounds - b.wounds)[0];
    if (t) { doTargetAction(g, op, 'medikit', t); return null; }
  }
  // Battleclade: Network Override a servitor that can attack; Transfer Power when another servitor can attack
  // and this one can't; Omniscanner the toughest enemy; Datacoronal Accumulator while contesting objectives.
  const atkScore = (o) => (engagedEnemies(g, o).length ? 10 : shootOptions(g, o)[0]?.score || 0);
  if (can.networkOverride) {
    const t = TARGET_ACTIONS.networkOverride.targets(g, op).filter((o) => atkScore(o) > 0).sort((a, b) => atkScore(b) - atkScore(a))[0];
    if (t) { doTargetAction(g, op, 'networkOverride', t); return null; }
  }
  // Network Override (Dash): a servitor with nothing to shoot runs 3" closer to its goal.
  if (can.overrideDash && op.ap >= 2) {
    const t = TARGET_ACTIONS.overrideDash.targets(g, op).find((o) => !atkScore(o) && pickGoal(g, o) && dist(o, pickGoal(g, o)) > 3);
    if (t) { doTargetAction(g, op, 'overrideDash', t); return null; }
  }
  if (can.transferPower && !atkScore(op) && netCands(g, op.side).some((o) => o !== op && atkScore(o) > 0)) { doSelfAction(g, op, 'transferPower'); return null; }
  if (can.omniscanner && op.ap >= 2) {
    const t = TARGET_ACTIONS.omniscanner.targets(g, op).sort((a, b) => b.wounds - a.wounds)[0];
    if (t) { doTargetAction(g, op, 'omniscanner', t); return null; }
  }
  if (can.datacoronal && (op.ap >= 2 || !shootOptions(g, op).length) && g.objectives.filter((m) => living(g, op.side).some((o) => dist(o, m) <= 2)).length >= 2) { doSelfAction(g, op, 'datacoronal'); return null; }
  // Elucidian Starstriders: Calibrate Voltagheist — Charge when about to shoot, Field when enemies are close.
  // Inquisitorial Agents: Pistol Barrage when there's a shot; Scry — Guidance on the friendly with the best attack.
  if (can.iaBarrage && shootOptions(g, op).length) { doSelfAction(g, op, 'iaBarrage'); return null; }
  if (can.scryGuide && op.ap >= 2) {
    const t = TARGET_ACTIONS.scryGuide.targets(g, op).filter((o) => o === op || o.ready).sort((a, b) => atkScore(b) - atkScore(a))[0];
    if (t && atkScore(t) > 0) { doTargetAction(g, op, 'scryGuide', t); return null; }
  }
  if (can.calibCharge && shootOptions(g, op).some((s) => s.w.id === 'esVoltaic')) { doSelfAction(g, op, 'calibCharge'); return null; }
  if (can.calibField && foes(g, op).some((e) => edgeDist(op, e) <= 8)) { doSelfAction(g, op, 'calibField'); return null; }
  // Chaos Cult: Incite Slaughter an engaged cultist, Ruinous Icon (Deterioration near enemies, else Invigoration),
  // Heinous Deluge the strongest ready enemy, Malefic Vortex where the most enemies stand together.
  if (can.inciteSlaughter) {
    const t = TARGET_ACTIONS.inciteSlaughter.targets(g, op).sort((a, b) => avgDmg(bestMelee(b)) - avgDmg(bestMelee(a)))[0];
    if (t) { doTargetAction(g, op, 'inciteSlaughter', t); return null; }
  }
  if ((can.ruinousDeter || can.ruinousInvig) && op.ap >= 1) {
    const enemiesNear = foes(g, op).filter((e) => edgeDist(op, e) <= 4).length, friendsNear = living(g, op.side).filter((f) => f !== op && edgeDist(op, f) <= 4 && foes(g, f).some((e) => edgeDist(f, e) <= 8)).length;
    if (enemiesNear && can.ruinousDeter) { doSelfAction(g, op, 'ruinousDeter'); return null; }
    if (friendsNear >= 2 && can.ruinousInvig) { doSelfAction(g, op, 'ruinousInvig'); return null; }
  }
  if (can.heinousDeluge && (op.ap >= 2 || !shootOptions(g, op).length)) {
    const t = TARGET_ACTIONS.heinousDeluge.targets(g, op).filter((e) => e.ready).sort((a, b) => tpl(b).apl - tpl(a).apl || b.wounds - a.wounds)[0];
    if (t) { doTargetAction(g, op, 'heinousDeluge', t); return null; }
  }
  if (can.maleficVortex) {
    const crowd = (t) => foes(g, op).filter((e) => dist(e, t) - radius(e) <= 2).length;
    const t = TARGET_ACTIONS.maleficVortex.targets(g, op).sort((a, b) => crowd(b) - crowd(a))[0];
    if (t && (crowd(t) >= 2 || !shootOptions(g, op).length)) { doTargetAction(g, op, 'maleficVortex', t); return null; }
  }
  // Celestian Insidiants: Spiritual Mentor the best fighter near the enemy, Nullifying Ritual when enemies are close,
  // Speak of Her Deeds onto a hurt sister.
  if (can.spiritualMentor) {
    const t = TARGET_ACTIONS.spiritualMentor.targets(g, op).filter((o) => foes(g, o).some((e) => edgeDist(o, e) <= 8)).sort((a, b) => avgDmg(bestMelee(b)) - avgDmg(bestMelee(a)))[0];
    if (t) { doTargetAction(g, op, 'spiritualMentor', t); return null; }
  }
  if (can.nullifyingRitual && op.ap >= 2 && foes(g, op).some((e) => edgeDist(op, e) <= 6)) { doSelfAction(g, op, 'nullifyingRitual'); return null; }
  if (can.speakDeeds) {
    const t = TARGET_ACTIONS.speakDeeds.targets(g, op).filter((o) => o.maxW - o.wounds >= 4 || (!o.wrath && foes(g, o).some((e) => edgeDist(o, e) <= 6))).sort((a, b) => a.wounds - b.wounds)[0];
    if (t) { doTargetAction(g, op, 'speakDeeds', t); return null; }
  }
  // Canoptek Circle: Canoptek Control a construct that can attack, Overcharge one that's still to act,
  // Cranial Overload the strongest ready enemy, Nanoscarab Beam the most hurt friendly, Geomantic Disturbance a weakened enemy.
  if (can.canoptekControl) {
    const t = TARGET_ACTIONS.canoptekControl.targets(g, op).filter((o) => atkScore(o) > 0).sort((a, b) => atkScore(b) - atkScore(a))[0];
    if (t) { doTargetAction(g, op, 'canoptekControl', t); return null; }
  }
  if (can.remotePilot) { // Pathfinder Drone Controller: a drone that can attack (or has markers to place) takes a free action
    const t = TARGET_ACTIONS.remotePilot.targets(g, op).filter((o) => !(op.acted.pilotDone?.[o.uid]?.length) && atkScore(o) > 0).sort((a, b) => atkScore(b) - atkScore(a))[0];
    if (t) { doTargetAction(g, op, 'remotePilot', t); return null; }
  }
  if (can.nanoscarab) {
    const t = TARGET_ACTIONS.nanoscarab.targets(g, op).filter((o) => o.maxW - o.wounds >= 4).sort((a, b) => (b.maxW - b.wounds) - (a.maxW - a.wounds))[0];
    if (t) { doTargetAction(g, op, 'nanoscarab', t); return null; }
  }
  if (can.overcharge && (op.ap >= 2 || !shootOptions(g, op).length)) {
    const t = TARGET_ACTIONS.overcharge.targets(g, op).filter((o) => o.ready).sort((a, b) => b.maxW - a.maxW)[0];
    if (t) { doTargetAction(g, op, 'overcharge', t); return null; }
  }
  if (can.cranialOverload && (op.ap >= 2 || !shootOptions(g, op).length)) {
    const t = TARGET_ACTIONS.cranialOverload.targets(g, op).filter((e) => e.ready).sort((a, b) => tpl(b).apl - tpl(a).apl || b.wounds - a.wounds)[0];
    if (t) { doTargetAction(g, op, 'cranialOverload', t); return null; }
  }
  if (can.geomantic && (op.ap >= 2 || !shootOptions(g, op).length)) {
    const t = TARGET_ACTIONS.geomantic.targets(g, op).filter((e) => e.wounds <= 7 && !living(g, op.side).some((f) => edgeDist(f, e) <= 2.5)).sort((a, b) => a.wounds - b.wounds)[0];
    if (t) { doTargetAction(g, op, 'geomantic', t); return null; }
  }
  // Brood Brothers: Conspire for CP, Mental Onslaught up close, Telepathic Overload / Jam on the most dangerous enemy,
  // Explosives: place it near enemies, detonate when enemies (and no friendlies) are within 2" of it.
  if (can.conspire && (op.ap >= 2 || !shootOptions(g, op).length)) { doSelfAction(g, op, 'conspire'); return null; }
  if (can.mentalOnslaught) {
    const t = TARGET_ACTIONS.mentalOnslaught.targets(g, op).filter((e) => edgeDist(op, e) <= 6).sort((a, b) => a.wounds - b.wounds)[0];
    if (t) { doTargetAction(g, op, 'mentalOnslaught', t); return null; }
  }
  if (can.telepathicOverload && op.ap >= 2) {
    const t = TARGET_ACTIONS.telepathicOverload.targets(g, op).filter((e) => e.ready).sort((a, b) => tpl(b).apl - tpl(a).apl || b.wounds - a.wounds)[0];
    if (t) { doTargetAction(g, op, 'telepathicOverload', t); return null; }
  }
  if (can.bbJam && (op.ap >= 2 || !shootOptions(g, op).length)) {
    const t = TARGET_ACTIONS.bbJam.targets(g, op).sort((a, b) => tpl(b).apl * b.wounds - tpl(a).apl * a.wounds)[0];
    if (t) { doTargetAction(g, op, 'bbJam', t); return null; }
  }
  if (can.explosives) {
    const m = (g.markers || []).find((x) => x.kind === 'explosives' && x.by === op.uid);
    const within = (side) => living(g, side).some((o) => dist(o, m) - radius(o) <= 2);
    if (m ? within(1 - op.side) && !within(op.side) : foes(g, op).some((e) => edgeDist(op, e) <= 5) && op.ap >= 2) { doSelfAction(g, op, 'explosives'); return null; }
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
  // Heavy (Dash only) weapons: Dash first — it still covers the same ground with a Reposition after,
  // but leaves the weapon usable if a target comes into view.
  if (goal && can.dash && !careful && weaponsFor(g, op).some((w) => w.type === 'ranged' && w.rules.heavy === 'dash')) {
    const p = move('dash');
    if (p) { doMove(g, op, 'dash', p); return null; }
  }
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
