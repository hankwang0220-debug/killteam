import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import * as V from '../js/voiddancers.js';
import { TEAM_MAP } from '../js/data/teams.js';
import { voidDancersRosterError } from '../js/data/voiddancers.js';
import { aiStep, aiStrategy } from '../js/ai.js';
let seed = 13579;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function dice(values, fn) { const old = Math.random; let n = 0; Math.random = () => ((values[n++] ?? 4) - 0.5) / 6; try { return fn(); } finally { Math.random = old; } }

function arena(opts = {}) {
  const g = G.newGame({ teams: ['voidDancers', opts.foe || 'angels'], ai: null, equip: [opts.equip || [], []], roster: [opts.roster || {}] });
  Object.assign(g, { tp: opts.tp || 1, phase: 'firefight', turn: 0, terrain: opts.terrain || [], cp: [3, 3, 0] });
  g.ops.forEach((o, i) => { o.placed = true; o.order = 'engage'; o.ready = true; o.x = o.side === 0 ? 3 + (i % 4) * 2 : 27; o.y = o.side === 0 ? 4 + Math.floor(i / 4) * 2 : 2 + i * 1.8; });
  return g;
}
const mine = (g) => g.ops.filter((o) => o.side === 0);
const byId = (g, f) => g.ops.find((o) => o.side === 0 && f(G.tpl ? o : o));
const tplOf = (o) => TEAM_MAP.voidDancers.ops.find((t) => t.id === o.tplId);
const lead = (g) => mine(g).find((o) => tplOf(o).vdLead);
const player = (g, n = 0) => mine(g).filter((o) => tplOf(o).vdPlayer)[n];
const jester = (g) => mine(g).find((o) => tplOf(o).vdJester);
const seer = (g) => mine(g).find((o) => tplOf(o).vdSeer);
const foe = (g, n = 0) => g.ops.filter((o) => o.side === 1)[n];
const place = (o, x, y) => { o.x = x; o.y = y; return o; };
const hide = (g, keep) => g.ops.filter((o) => o.side === 1 && o !== keep).forEach((o) => place(o, -99, -99));
const can = (g, o, id) => G.availableActions(g, o).find((a) => a.id === id)?.ok;

// Roster: the Lead Player and seven picks; Death Jester and Shadowseer once each; one fusion pistol and one neuro disruptor at most.
{
  const g = arena(), t = TEAM_MAP.voidDancers;
  assert.equal(mine(g).length, 8);
  assert(lead(g) && jester(g) && seer(g) && player(g));
  assert.equal(voidDancersRosterError(t, {}), null);
  assert(voidDancersRosterError(t, { vdSeerS: ['vdJester'] }), 'two Death Jesters');
  assert(voidDancersRosterError(t, { vdLeadShurikenBlade: ['vdLeadFusionBlade'], vdPlayerShurikenCaress: ['vdPlayerFusionKiss'] }), 'two fusion pistols');
  assert(voidDancersRosterError(t, { vdSeerS: ['vdSeerN'], vdPlayerShurikenCaress: ['vdPlayerNeuroKiss'] }), 'two neuro disruptors');
  assert.equal(voidDancersRosterError(t, { vdPlayerShurikenCaress: ['vdPlayerFusionKiss', 'vdPlayerNeuroBlade'] }), null);
  assert.throws(() => G.newGame({ teams: ['voidDancers', 'angels'], ai: null, roster: [{ vdSeerS: ['vdJester'] }] }));
  assert.equal(t.ops.find((o) => o.id === 'vdJester').wounds, 9);
}

// Saedath: allegory, Pivotal Role and accolades; the performance; Lead the Performance.
{
  const g = arena(); g.phase = 'strategy';
  const l = lead(g), p = player(g);
  assert(V.vdChooseOk(g, 0));
  assert(V.vdChoose(g, 0, 'epic', l.uid));
  assert(V.vdHasAccolade(g, l) && !V.vdHasAccolade(g, p));
  g.tp = 2; assert(V.vdGrantOk(g, 0)); assert(V.vdGrantGambit(g, 0, p.uid)); assert(V.vdHasAccolade(g, p)); assert(!V.vdGrantOk(g, 0), 'once per TP');
  assert(V.vdLeadOk(g, 0)); V.vdLead(g, 0); assert.equal(V.vdAllegory(g, 0), 'melodrama'); assert(!V.vdLeadOk(g, 0), 'once per battle');
  // Melodrama: ranged weapons Balanced for operatives with the Accolade
  g.phase = 'firefight'; const e = foe(g); hide(g, e); place(l, 10, 10); place(e, 15, 10); G.activate(g, l);
  const rw = G.weaponsFor(g, l).find((w) => w.type === 'ranged');
  assert(G.effectiveRules(g, l, rw, e).balanced, 'Melodrama Accolade');
  // the performance: the Pivotal operative incapacitates an enemy by shooting (Melodrama) — another friendly gains the Accolade
  const before = g.vd.acc[0].length; e.wounds = 1;
  dice([6, 6, 6, 6, 1, 1, 1], () => G.resolveShoot(g, l, rw, e));
  assert(e.dead); assert.equal(g.vd.acc[0].length, before + 1, 'performance complete: one more Accolade');
}

// Harlequin's Panoply, Humbling Cruelty, Mirror of Minds, Fog of Dreams.
{
  const g = arena(), l = lead(g), e = foe(g); hide(g, e); place(l, 10, 10); place(e, 15, 10); g.turn = 1; G.activate(g, e);
  assert(V.vdPanoply(l, 0) && !V.vdPanoply(l, 1));
  const g2 = arena(), j = jester(g2), e2 = foe(g2); hide(g2, e2); place(j, 10, 10); place(e2, 15, 10); G.activate(g2, j); e2.wounds = e2.maxW = 30;
  const w = G.weaponsFor(g2, j).find((x) => x.id === 'vdShriekF');
  dice([6, 6, 6, 6, 6, 1, 1, 1], () => G.resolveShoot(g2, j, w, e2));
  assert.equal(e2.vdHumbled, 0, 'Humbling Cruelty token');
  assert(G.moveStat(g2, e2) < TEAM_MAP[e2.team].ops.find((o) => o.id === e2.tplId).move, '-2" Move');
  G.endActivation(g2); g2.turn = 1; G.activate(g2, e2); G.endActivation(g2);
  assert.equal(e2.vdHumbled, null, 'gone after its next activation');
  const g3 = arena(), s = seer(g3), e3 = foe(g3); hide(g3, e3); place(s, 10, 10); place(e3, 15, 10); G.activate(g3, s);
  assert(can(g3, s, 'vdMirror') && can(g3, s, 'vdFog'));
  const hp = e3.wounds; dice([6, 5, 5, 2, 1, 6, 5, 4, 3, 1, 3, 3, 3], () => G.doTargetAction(g3, s, 'vdMirror', e3));
  assert.equal(e3.wounds, hp - 6, 'three pairs, 3 x D3');
  const g4 = arena(), s4 = seer(g4); place(s4, 10, 10); g4.ops.filter((o) => o.side === 1).forEach((o, i) => place(o, 16, 3 + i * 1.6)); G.activate(g4, s4);
  const t4 = foe(g4); dice([4], () => G.doTargetAction(g4, s4, 'vdFog', t4));
  assert(!G.readyOps(g4, 1).includes(t4), 'Fog of Dreams: it can\'t activate yet');
}

// Ploys: Rising Crescendo, Prismatic Blur, Cegorach's Jest, Murderous Entrance, The Curtain Falls (off by default), Elusive Target, Domino Field.
{
  const g = arena(), p = player(g), e = foe(g); hide(g, e); place(p, 10, 10); place(e, 14, 10); G.activate(g, p); g.ploys[0].push('vdCrescendo');
  p.acted.charge = 1; assert(G.availableActions(g, p).some((a) => a.id === 'dash'), 'Dash after a Charge');
  assert(g.ffOff[0].includes('vdCurtain'), 'The Curtain Falls is off until switched on');
  const g2 = arena(); g2.ploys[0].push('vdBlur'); const p2 = player(g2); p2.vdMovedTP = 1; const dr = {}; V.vdDefence(g2, p2, dr); assert(dr.balanced, 'Prismatic Blur');
  const g3 = arena(); g3.ploys[0].push('vdJest'); const p3 = player(g3), side = { c: 1, n: 2 };
  assert(dice([1], () => V.vdJest(g3, p3, side, { hit: 3 })), 'the strike blocks one of your dice'); assert.equal(side.n, 1); assert(!V.vdJest(g3, p3, side, { hit: 6 }), 'once per sequence');
  const g4 = arena(), p4 = player(g4); G.activate(g4, p4); assert(G.useFFButton(g4, p4, 'vdElusive')); assert(p4.vdElusive);
  const g5 = arena(), p5 = player(g5);
  const a = { crits: 0, norms: 3, dice: [{ v: 5, res: 'norm' }, { v: 5, res: 'norm' }, { v: 5, res: 'norm' }] }, d = { crits: 0, norms: 1, dice: [{ v: 5, res: 'norm' }, { v: 1, res: 'miss' }] };
  const dom = V.vdDomino(g5, p5, a, d, 3, 4); assert.equal(dom.an, 0, 'Domino Field blocks every 5'); assert.equal(dom.dno, 0);
  // Luck of the Laughing God: a Player's firefight ploy is free once per TP
  const g6 = arena(), p6 = player(g6); G.activate(g6, p6);
  assert(G.useFFButton(g6, p6, 'vdElusive')); assert.equal(g6.cp[0], 3, 'Luck of the Laughing God: 0CP');
  assert.deepEqual(g6.vd.luck[0], ['vdElusive']);
}

// Equipment: Shrieker Toxin Rounds, Death Mask, Wraithbone Talisman, Understudy's Mask.
{
  const g = arena({ equip: ['vdToxin', 'vdMask', 'vdTalisman', 'vdUnderstudy'] }), p = player(g), e = foe(g); hide(g, e); place(p, 10, 10); place(e, 15, 10); G.activate(g, p);
  const sh = G.weaponsFor(g, p).find((w) => w.id === 'vdShuriken');
  V.vdShootStart(g, p, sh); assert.equal(G.effectiveRules(g, p, sh, e).devastating, 1, 'Toxin Rounds: Devastating 1'); assert.equal(g.vd.used[0].toxin, 1);
  g.vd.allegory[0] = 'epic'; g.vd.pivotal[0] = lead(g).uid; g.vd.acc[0] = mine(g).filter((o) => o !== lead(g)).slice(0, 3).map((o) => o.uid);
  const cp = g.cp[0];
  for (const o of mine(g).filter((x) => g.vd.acc[0].includes(x.uid))) { o.wounds = 1; G.applyDamage(g, e, o, 5); }
  assert.equal(g.cp[0], cp + 1, 'Death Mask: +1CP at a Tragedy tally of 3');
  const pool = { dice: [{ v: 1, res: 'miss' }, { v: 2, res: 'miss' }, { v: 6, res: 'crit' }], crits: 1, norms: 0 };
  const g2 = arena({ equip: ['vdTalisman'] }); V.vdRoll(g2, player(g2), pool, (pl) => { pl.post?.(pl); }); assert.equal(pool.norms, 1, 'Talisman: a fail kept as a normal success');
  const g3 = arena({ equip: ['vdUnderstudy'] }); g3.vd.allegory[0] = 'epic'; g3.vd.pivotal[0] = lead(g3).uid; lead(g3).dead = true;
  const nx = player(g3); G.activate(g3, nx); assert.equal(g3.vd.pivotal[0], nx.uid, 'Understudy\'s Mask');
}

// AI vs AI full battles.
for (const [a, b] of [['voidDancers', 'angels'], ['kommandos', 'voidDancers'], ['voidDancers', 'spectres']]) {
  const g = G.newGame({ teams: [a, b], ai: null, equip: [a === 'voidDancers' ? ['vdToxin', 'vdMask', 'vdTalisman', 'vdUnderstudy'] : [], b === 'voidDancers' ? ['vdTalisman', 'vdToxin'] : []] });
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
console.log('voiddancers ok');
