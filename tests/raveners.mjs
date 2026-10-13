import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import * as R from '../js/raveners.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 97531;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }

function arena(opts = {}) {
  const g = G.newGame({ teams: ['raveners', opts.foe || 'angels'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain || [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.underground = false; o.reserve = false; o.placed = true; o.order = 'engage'; o.ready = true; o.x = o.side === 0 ? 3 + (i % 4) * 2 : 27; o.y = o.side === 0 ? 14 + Math.floor(i / 4) * 2 : 2 + i * 1.8; });
  g.rv.tunnel[0] = [{ x: 2, y: 4 }, { x: 6, y: 4 }, { x: 10, y: 4 }];
  return g;
}
const get = (g, id) => g.ops.find((o) => o.tplId === id);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const can = (g, o, id) => G.availableActions(g, o).find((a) => a.id === id)?.ok;
const place = (o, x, y) => { o.x = x; o.y = y; return o; };

// Roster: the Prime and four picks (each once, except Warriors).
{
  const g = arena();
  assert.equal(g.ops.filter((o) => o.side === 0).length, 5);
  const t = TEAM_MAP.raveners;
  assert.equal(t.ops.find((o) => o.id === 'rvPrime').wounds, 19);
  assert.equal(t.ops.find((o) => o.id === 'rvWrecker').save, 4);
  assert.equal(t.ops.find((o) => o.id === 'rvFelltalon').wounds, 18);
  const w = arena({ roster: { rvFelltalon: 'rvWarrior', rvTremor: 'rvWarrior' } });
  assert.equal(w.ops.filter((o) => o.tplId === 'rvWarrior').length, 2, 'Warriors repeat');
  assert.throws(() => G.newGame({ teams: ['raveners', 'angels'], ai: null, roster: [{ rvFelltalon: 'rvTremor' }] }), 'two Tremorscythes');
}

// Set-up: the first two are set up normally, the rest underground; Tunnel marker 0 at the start of the battle.
{
  const g = G.newGame({ teams: ['raveners', 'angels'], ai: null, equip: [[], []] });
  while (!g.eqDeploy.done && G.autoPlaceEquipment(g));
  G.autoDeploy(g, 0); G.autoDeploy(g, 1);
  const mine = g.ops.filter((o) => o.side === 0);
  assert.equal(mine.filter((o) => !o.underground).length, 2, 'two on the board');
  assert.equal(mine.filter((o) => o.underground).length, 3, 'three underground');
  assert(mine.filter((o) => o.underground).every((o) => o.x < -50 && o.reserve));
  G.startBattle(g);
  assert.equal(R.rvTunnel(g, 0).length, 1, 'Tunnel marker 0');
  const z = G.deployZones(g)[0], m0 = R.rvTunnel(g, 0)[0];
  assert(m0.x >= z.x0 && m0.x <= z.x1 && (m0.x < 2 || m0.x > 28), 'in the drop zone, touching the edge');
}

// Tunnel markers: the next one within 5" of the last, once per turning point, up to 0-4.
{
  const g = arena({ tp: 1 }); g.phase = 'strategy'; g.rv.tunnel[0] = [{ x: 1, y: 5 }]; g.rv.markerTP = [0, 0];
  assert(!R.rvPlaceMarker(g, 0, { x: 9, y: 5 }), 'more than 5"');
  assert(R.rvPlaceMarker(g, 0, { x: 5, y: 5 }));
  assert(!R.rvPlaceMarker(g, 0, { x: 8, y: 5 }), 'one per turning point');
  g.tp = 2; assert(R.rvPlaceMarker(g, 0, { x: 9, y: 5 }));
  g.tp = 3; assert(R.rvAutoMarker(g, 0)); assert.equal(R.rvTunnel(g, 0).length, 4);
  g.tp = 4; assert(R.rvAutoMarker(g, 0)); assert.equal(R.rvTunnel(g, 0).length, 5);
  g.tp = 4; g.rv.markerTP = [0, 0]; assert(!R.rvAutoMarker(g, 0), 'five at most');
}

// On the TUNNEL: touching a marker or the strip between consecutive markers.
{
  const g = arena(), w = get(g, 'rvFelltalon');
  place(w, 4, 4); assert(R.rvOnTunnel(g, w), 'between markers 0 and 1');
  place(w, 4, 7.5); assert(!R.rvOnTunnel(g, w), 'too far from the strip');
  g.rv.tunnel[0] = [{ x: 2, y: 4 }, { x: 6, y: 4 }, { x: 10, y: 4 }, { x: 14, y: 8 }];
  place(w, 10, 5.5); assert(R.rvOnTunnel(g, w), 'touching a marker');
}

// Burrow: on the tunnel it goes underground; underground it comes back on the tunnel (Move -2"); a free Burrow when counteracting.
{
  const g = arena(), w = get(g, 'rvFelltalon');
  place(w, 4, 4); G.activate(g, w);
  assert(can(g, w, 'rvBurrow'));
  G.doSelfAction(g, w, 'rvBurrow');
  assert(w.underground && w.reserve && w.x < -50, 'underground');
  assert.equal(w.ap, 2, 'costs 1AP');
  assert.deepEqual(G.availableActions(g, w).map((a) => a.id).sort(), ['rvBurrow', 'rvLunge'], 'underground: Burrow and Toxic Lunge only');
  assert(!R.rvEmergeCheck(g, w, { x: 4, y: 12 }).ok, 'must be on the tunnel');
  assert(R.rvDoEmerge(g, w, { x: 6, y: 4 }));
  assert(!w.underground && w.rvSlow && w.x === 6);
  assert.equal(G.moveStat(g, w), 5, 'Move -2"');
  assert.equal(w.ap, 1);
  G.endActivation(g);
  assert(!w.rvSlow, 'Move is back to normal');
  // carrying a marker, or off the tunnel: no Burrow
  const t = get(g, 'rvTremor'); place(t, 4, 9); g.turn = 0; G.activate(g, t);
  assert(!can(g, t, 'rvBurrow'), 'not on the tunnel');
}
{
  const g = arena(), p = get(g, 'rvPrime');
  place(p, 4, 4); p.ready = false; p.counteracted = false; p.order = 'engage'; p.counter = true; p.ap = 1; p.acted = {};
  g.active = p.uid; g.counter = true;
  assert.equal(G.actionCost(g, p, 'rvBurrow'), 0, 'a counteracting RAVENER can Burrow for free');
}

// Predatory Instincts: two Fights per activation, and any order can counteract.
{
  const g = arena(), w = get(g, 'rvWrecker'), e = foe(g);
  place(w, 20, 10); place(e, 21.5, 10); G.activate(g, w);
  assert(can(g, w, 'fight'));
  const wp = G.bestMelee(w);
  dice([6, 6, 6, 6, 6, 1, 1, 1, 1, 1], () => G.resolveFight(g, w, wp, e));
  assert(can(g, w, 'fight') || e.dead, 'a second Fight');
  const g2 = arena(); const t = get(g2, 'rvTremor'); t.ready = false; t.order = 'conceal'; t.counteracted = false;
  assert(G.counterCandidates(g2, 0).includes(t), 'counteracts with a Conceal order');
}

// Poison: a critical hit with a Poison weapon gives the token; D3 damage on each activation; Toxic Lunge.
{
  const g = arena(), f = get(g, 'rvFelltalon'), e = foe(g);
  place(f, 20, 10); place(e, 21.4, 10); G.activate(g, f);
  const sc = G.weaponsFor(g, f).find((w) => w.id === 'rvScythes');
  assert(sc.rules.rvPoison && sc.rules.shock && sc.rules.lethal === 5);
  R.rvPoisonHit(g, f, sc, e, true);
  assert(e.rvPoison[0], 'Poison token');
  const before = e.wounds; e.ready = true; g.turn = 1; g.active = null; G.endActivation(g);
  G.activate(g, e);
  assert(e.wounds < before, 'D3 when it activates');
  // Toxic Lunge
  const g2 = arena(), f2 = get(g2, 'rvFelltalon'), e2 = foe(g2);
  place(f2, 20, 10); place(e2, 21.8, 10); G.activate(g2, f2);
  assert(can(g2, f2, 'rvLunge'));
  const w0 = e2.wounds;
  dice([3], () => G.doTargetAction(g2, f2, 'rvLunge', e2));
  assert.equal(e2.wounds, w0 - 4, 'D3+2 damage');
  assert(e2.rvPoison[0]);
  // Underground: only an enemy on the tunnel
  f2.underground = true; f2.reserve = true; f2.x = -99; f2.y = -99;
  assert.equal(G.TARGET_ACTIONS.rvLunge.targets(g2, f2).length, 0);
  place(e2, 4, 4.5);
  assert.deepEqual(G.TARGET_ACTIONS.rvLunge.targets(g2, f2), [e2], 'an enemy on the tunnel');
}

// Distend Dorsal Sac and Instinctive Behaviour.
{
  const g = arena(), v = get(g, 'rvVenom'), e = foe(g);
  place(v, 10, 12); place(e, 24, 12); G.activate(g, v);
  const vb = G.weaponsFor(g, v).find((w) => w.id === 'rvVenomFocus');
  assert(!G.shootCheck(g, v, e, vb).ok, 'out of range (8")');
  G.doSelfAction(g, v, 'rvDistend');
  const r = G.effectiveRules(g, v, vb, e);
  assert.equal(r.lethal, 5); assert.equal(r.atkPlus, 1); assert(r.range == null, 'no range limit');
  const g2 = arena({}), w = get(g2, 'rvTremor'), e2 = foe(g2);
  G.activate(g2, w);
  const tal = G.weaponsFor(g2, w).find((x) => x.type === 'melee');
  assert(!G.effectiveRules(g2, w, tal, e2).lethal, 'not against an unhurt enemy');
  e2.wounds--; assert(!G.effectiveRules(g2, w, tal, e2).lethal, 'only Warriors');
  const g3 = arena({ roster: { rvFelltalon: 'rvWarrior' } }), wr = get(g3, 'rvWarrior'), e3 = foe(g3);
  G.activate(g3, wr);
  const tw = G.weaponsFor(g3, wr).find((x) => x.type === 'melee');
  assert(!G.effectiveRules(g3, wr, tw, e3).lethal);
  e3.wounds--; assert.equal(G.effectiveRules(g3, wr, tw, e3).lethal, 5, 'Lethal 5+ against a wounded enemy');
}

// Wrecker: Reinforced Carapace and Crush.
{
  const g = arena(), w = get(g, 'rvWrecker');
  assert.equal(R.rvCarapace(w, 5), 4); assert.equal(R.rvCarapace(w, 3), 3); assert.equal(R.rvCarapace(get(g, 'rvPrime'), 5), 5);
  const e = foe(g), crush = G.weaponsFor(g, w).find((x) => x.rules.crush);
  e.wounds = 5; // Wounds stat is what counts
  const big = dice([6, 1], () => R.rvCrush(crush, { ...e, tplId: e.tplId, team: e.team }));
  assert(big >= 0 && big <= 3);
  assert.equal(dice([6, 6], () => R.rvCrush(crush, e)), 0, 'a tie adds nothing');
}

// Neuropredatory Crest: no re-rolls and +1AP near the Prime; control counts 1 lower.
{
  const g = arena(), p = get(g, 'rvPrime'), e = foe(g);
  place(p, 20, 10); place(e, 22, 10);
  assert(R.rvNoReroll(g, e), 'no re-rolls within 3"');
  place(e, 26, 10); assert(!R.rvNoReroll(g, e));
  place(e, 22, 10);
  assert.equal(G.actionCost(g, e, 'pickUp'), G.ACTIONS.pickUp.ap + 1, '+1AP to Pick Up');
}

// Synaptic Link.
{
  const g = arena({ tp: 1 }); g.phase = 'strategy';
  assert(R.rvLinkOk(g, 0));
  dice([4], () => R.rvLink(g, 0));
  assert.equal(g.cp[0], 4, 'a 4 on turning point 1 is twice as high or more');
  assert(!R.rvLinkOk(g, 0), 'once per turning point');
  const g2 = arena({ tp: 3 }); g2.phase = 'strategy'; const pr = get(g2, 'rvPrime'), w = pr.wounds;
  dice([2], () => R.rvLink(g2, 0)); assert.equal(pr.wounds, w - 2, 'less than the turning point: damage');
  const g3 = arena({ tp: 3 }); g3.phase = 'strategy'; dice([3], () => R.rvLink(g3, 0)); assert.equal(g3.cp[0], 3, 'equal: nothing');
}

// Ploys: Death From Below, Tunnel Lurkers, Whipcord Emergence, Writhe Out of Sight.
{
  const g = arena(), f = get(g, 'rvFelltalon'), e = foe(g);
  g.ploys[0].push('rvDeath');
  place(f, 4, 4); G.activate(g, f);
  const sc = G.weaponsFor(g, f).find((w) => w.id === 'rvScythes');
  assert(G.effectiveRules(g, f, sc, e).ceaseless, 'Ceaseless on the tunnel');
  assert(!G.effectiveRules(g, f, sc, e).balanced);
  f.acted.rvBurrow = 1; assert(G.effectiveRules(g, f, sc, e).balanced, 'Balanced after Burrow');
  // Tunnel Lurkers: in cover on the tunnel unless within 2" of the active operative
  const g2 = arena(); g2.ploys[0].push('rvLurkers');
  const t = get(g2, 'rvTremor'), sh = foe(g2); place(t, 6, 4); place(sh, 20, 4);
  assert(G.visibility(g2, sh, t).cover, 'in cover on the tunnel');
  g2.active = sh.uid; place(sh, 7.5, 4); assert(!G.visibility(g2, sh, t).cover, 'not within 2" of the active operative');
  const g3 = arena(); const t3 = get(g3, 'rvTremor'), sh3 = foe(g3); place(t3, 6, 9); place(sh3, 20, 9);
  g3.ploys[0].push('rvLurkers'); assert(!G.visibility(g3, sh3, t3).cover, 'off the tunnel: no cover');
  // Writhe Out of Sight: a free Burrow for a Ravener on / near the tunnel
  const g4 = arena(); g4.phase = 'strategy'; g4.cp = [3, 3, 0];
  const wk = get(g4, 'rvFelltalon'); place(wk, 4, 4.5);
  const ploy = TEAM_MAP.raveners.ploys.find((p) => p.id === 'rvWrithe');
  G.ployChooser(g4); g4.stratTurn = 0; g4.initiative = 0;
  assert(G.buyPloy(g4, 0, ploy));
  assert(wk.underground, 'burrowed away');
}

// Firefight ploys: Slithering Evasion, Death Frenzy, Subterranean Horror, Burrowing Strike.
{
  const g = arena(), f = get(g, 'rvFelltalon'), e = foe(g);
  place(f, 20, 10); place(e, 21.4, 10); G.activate(g, f);
  assert(!can(g, f, 'charge'), 'engaged: no Charge');
  assert(G.useFFButton(g, f, 'rvSlither'));
  assert(can(g, f, 'charge'), 'Charge while engaged');
  assert.equal(G.actionCost(g, f, 'fallBack'), 1, 'Fall Back for 1 less');
  // Death Frenzy
  const g2 = arena(), r = get(g2, 'rvPrime'), e2 = foe(g2); place(r, 20, 10); place(e2, 21.4, 10);
  const w0 = e2.wounds;
  dice([3], () => { r.wounds = 1; G.applyDamage(g2, e2, r, 5); });
  assert(r.dead); assert.equal(e2.wounds, w0 - 2, 'D3 to each enemy in control range');
  // Burrowing Strike: the Burrow action hurts enemies in control range
  const g3 = arena(), t = get(g3, 'rvTremor'), e3 = foe(g3); place(t, 4, 4); place(e3, 5.5, 4); G.activate(g3, t);
  const w3 = e3.wounds;
  dice([1], () => G.doSelfAction(g3, t, 'rvBurrow'));
  assert.equal(e3.wounds, w3 - 2, 'D3+1');
  assert(t.underground);
}

// Subterranean Ambush: an enemy ending a move within 2" of the tunnel is attacked by an underground Tremorscythe.
{
  const g = arena(), t = get(g, 'rvTremor'), e = foe(g);
  t.underground = true; t.reserve = true; t.x = -99; t.y = -99; t.ready = true;
  place(e, 9, 9); e.ready = true; g.turn = 1; G.activate(g, e);
  const from = { x: e.x, y: e.y };
  place(e, 9, 6); // ended within 2" of the tunnel after moving more than 2"
  const w0 = e.wounds;
  dice([6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6], () => R.rvAmbush(g, e, from));
  assert(!t.underground, 'it came out');
  assert(e.wounds < w0 || e.dead, 'and fought');
  assert.equal(g.rv.used[0].ambush, 1, 'once per turning point');
  assert(!t.ready, 'its activation is used');
  assert.equal(g.rvSkip, 0, 'the opponent goes again');
}

// Equipment: Metamorphic Flesh, Acid Blood, Chromatospore Camouflage; underground operatives are incapacitated at the end.
{
  const g = arena({ equip: ['rvFlesh', 'rvAcid', 'rvChroma'] }), w = get(g, 'rvWarrior') || get(g, 'rvFelltalon');
  w.wounds = 5; G.activate(g, w);
  assert(w.wounds > 5, 'Metamorphic Flesh');
  const e = foe(g), hp = e.wounds;
  dice([6], () => R.rvAcidBlood(g, w, e, 2));
  assert.equal(e.wounds, hp - 1, 'Acid Blood');
  assert(R.rvChroma(g, w));
  const g2 = arena(), u = get(g2, 'rvTremor'); u.underground = true; u.reserve = true; u.x = -99;
  R.rvEndBattle(g2); assert(u.dead);
}

// AI vs AI full battles.
for (const [a, b] of [['raveners', 'angels'], ['kommandos', 'raveners']]) {
  const g = G.newGame({ teams: [a, b], ai: null, equip: [a === 'raveners' ? ['rvFlesh', 'rvAcid', 'rvChroma', 'rvSenses'] : [], b === 'raveners' ? ['rvFlesh', 'rvChroma'] : []] });
  while (!g.eqDeploy.done && G.autoPlaceEquipment(g));
  G.autoDeploy(g, 0); G.autoDeploy(g, 1); G.startBattle(g);
  let steps = 0;
  while (g.phase !== 'gameover' && steps++ < 4000) {
    if (g.phase === 'initiative') G.startStrategy(g);
    else if (g.phase === 'strategy') { const s = G.ployChooser(g); aiStrategy(g, s); G.finishPloys(g); }
    else if (g.phase === 'firefight') {
      if (g.fight) { if (g.fight.rrOpen) G.fightRerollDone(g); if (!g.fight.done) G.fightApply(g, G.fightAutoChoice(g)); else G.endFight(g); }
      else { const d = aiStep(g); if (d?.kind === 'shoot') G.resolveShoot(g, G.activeOp(g), d.weapon, d.target); else if (d?.kind === 'fight') G.resolveFight(g, G.activeOp(g), d.weapon, d.target); }
    } else throw new Error(`Unexpected phase ${g.phase}`);
  }
  assert(steps < 4000, `${a} vs ${b}: simulation stalled`);
  console.log(`${a} vs ${b}: ${G.totalVP(g, 0)} : ${G.totalVP(g, 1)} (TP ${g.tp})`);
}
console.log('raveners ok');
