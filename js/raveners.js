// Raveners (蛇蟲) rules engine: the Tunnel, Burrow and going underground, Poison tokens, Toxic Lunge, Distend Dorsal Sac, Subterranean Ambush,
// Synaptic Link, the ploys and the faction equipment. game.js calls these hooks; the team data is in data/raveners.js.
// (Careful: game.js and this module import each other, so nothing here may use a top-level const while the modules load —
// everything is a function declaration, and register functions only use hoisted functions.)
import { ACTIONS, TARGET_ACTIONS, CONTROL, applyDamage, autoFF, d3, d6, edgeDist, engagedEnemies, foes, getOp, hasPloy, isEngaged, living, log, opName, radius, spend, team, tpl, boardOf, deployZones, resolveFight, bestMelee, endActivation } from './game.js';
import { dist, distPointSegment, distPointRect } from './geometry.js';
import { moveCtx } from './path.js';
import { RAVENERS_TEAM, ravenersRosterError } from './data/raveners.js';

const TUNNEL_R = 1; // a Tunnel marker is about 2" across (the strip between two markers is as wide)
export function isRV(o) { return o?.team === 'raveners'; }
function equip(g, side, id) { return !!g.equip?.[side]?.includes(id); }
function note(g, side, zh, en) { log(g, { zh, en }, `side${side}`); }
const hasPrime = (g, side) => living(g, side).some((o) => tpl(o).rvPrime);

// ---------- setup ----------
export function rvSetup(g, roster) {
  g.rv = { tunnel: [[], []], markerTP: [0, 0], used: [{}, {}] };
  for (const side of [0, 1]) if (g.teams[side] === 'raveners') {
    const error = ravenersRosterError(RAVENERS_TEAM, roster[side]);
    if (error) throw new Error(error.en);
  }
}

// ---------- the Tunnel ----------
export const rvTunnel = (g, side) => g.rv?.tunnel?.[side] || [];
/** Is a base at p (radius r) on this side's TUNNEL: touching a marker or the strip between two consecutive markers? */
export function rvOnTunnelAt(g, side, p, r = 0) {
  const t = rvTunnel(g, side);
  if (!t.length) return false;
  if (t.length === 1) return dist(p, t[0]) - r <= TUNNEL_R + 0.001;
  for (let i = 0; i < t.length - 1; i++) if (distPointSegment(p, t[i], t[i + 1]) - r <= TUNNEL_R + 0.001) return true;
  return false;
}
export const rvOnTunnel = (g, op) => isRV(op) && op.side < 2 && !op.underground && !op.dead && rvOnTunnelAt(g, op.side, op, radius(op));
const inTerrain = (g, p) => g.terrain.some((t) => p.x >= t.x && p.x <= t.x + t.w && p.y >= t.y && p.y <= t.y + t.h);

/** The end of the Set Up Operatives step: Tunnel marker 0 wholly in the drop zone, touching the player's killzone edge. */
export function rvStart(g) {
  for (const side of [0, 1]) {
    if (g.teams[side] !== 'raveners' || !g.rv || rvTunnel(g, side).length) continue;
    const z = deployZones(g)[side], b = boardOf(g), along = g.axis === 'y' ? 'y' : 'x', across = along === 'x' ? 'y' : 'x';
    const size = { x: b.w, y: b.h };
    const low = z[along + '0'] <= 0.01;
    const mine = living(g, side).filter((o) => o.x > -50);
    const avg = mine.length ? mine.reduce((s, o) => s + o[across], 0) / mine.length : size[across] / 2;
    const p = { [along]: low ? TUNNEL_R : size[along] - TUNNEL_R, [across]: Math.max(z[across + '0'] + TUNNEL_R, Math.min(z[across + '1'] - TUNNEL_R, avg)) };
    g.rv.tunnel[side].push(p);
    note(g, side, `隧道標記 0 放在 (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`, `Tunnel marker 0 placed at (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`);
  }
}
/** Can this side place its next Tunnel marker now (strategic gambit in turning points 1-4)? */
export function rvMarkerLeft(g, side) {
  return g.teams[side] === 'raveners' && !!g.rv && g.phase === 'strategy' && g.tp <= 4 && rvTunnel(g, side).length >= 1 && rvTunnel(g, side).length < 5 && g.rv.markerTP[side] !== g.tp;
}
export function rvPlaceMarker(g, side, p) {
  if (!rvMarkerLeft(g, side)) return false;
  const b = boardOf(g), last = rvTunnel(g, side).at(-1);
  if (p.x < TUNNEL_R - 0.5 || p.y < TUNNEL_R - 0.5 || p.x > b.w - TUNNEL_R + 0.5 || p.y > b.h - TUNNEL_R + 0.5) return false;
  if (dist(p, last) > 5 + 0.01 || inTerrain(g, p)) return false;
  g.rv.tunnel[side].push({ x: p.x, y: p.y });
  g.rv.markerTP[side] = g.tp;
  note(g, side, `隧道標記 ${g.rv.tunnel[side].length - 1} 放在 (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`, `Tunnel marker ${g.rv.tunnel[side].length - 1} placed at (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`);
  return true;
}
/** The computer (or the Auto button): the next marker as close to the enemy / the nearest objective we don't hold as it can get. */
export function rvAutoMarker(g, side) {
  if (!rvMarkerLeft(g, side)) return false;
  const last = rvTunnel(g, side).at(-1), en = foes(g, { side }).filter((e) => e.x > -50 && e.side < 2);
  const goal = (g.objectives || []).length ? g.objectives.slice().sort((a, b) => dist(a, last) - dist(b, last))[0] : (en[0] || { x: boardOf(g).w / 2, y: boardOf(g).h / 2 });
  let best = null;
  for (let a = 0; a < 360; a += 15) for (const d of [5, 4, 3]) {
    const p = { x: last.x + d * Math.cos(a * Math.PI / 180), y: last.y + d * Math.sin(a * Math.PI / 180) };
    const b = boardOf(g);
    if (p.x < 1 || p.y < 1 || p.x > b.w - 1 || p.y > b.h - 1 || inTerrain(g, p)) continue;
    const score = dist(p, goal) + (g.objectives || []).filter((o) => dist(o, p) < 1.5).length * -2;
    if (!best || score < best.score) best = { p, score };
  }
  return best ? rvPlaceMarker(g, side, best.p) : false;
}

// ---------- Synaptic Link (Prime strategic gambit) ----------
export function rvLinkOk(g, side) { return g.teams[side] === 'raveners' && !!g.rv && g.phase === 'strategy' && hasPrime(g, side) && g.rv.used[side].link !== g.tp; }
export function rvLink(g, side) {
  if (!rvLinkOk(g, side)) return false;
  g.rv.used[side].link = g.tp;
  const prime = living(g, side).find((o) => tpl(o).rvPrime), r = d6(), tp = g.tp;
  if (r >= 2 * tp) { g.cp[side]++; note(g, side, `突觸連結：擲 ${r}（回合 ${tp}）→ +1CP`, `Synaptic Link: rolled ${r} (turning point ${tp}) → +1CP`); }
  else if (r < tp) { note(g, side, `突觸連結：擲 ${r}（回合 ${tp}）→ ${opName(prime, 'zh')} 受到 ${r} 傷害`, `Synaptic Link: rolled ${r} (turning point ${tp}) → ${opName(prime, 'en')} takes ${r} damage`); applyDamage(g, null, prime, r); }
  else note(g, side, `突觸連結：擲 ${r}（回合 ${tp}）→ 沒有效果`, `Synaptic Link: rolled ${r} (turning point ${tp}) → nothing happens`);
  return true;
}
/** The computer's gambits in the Strategy phase: the next Tunnel marker, and the Synaptic Link while it's cheap. */
export function rvAiStrategy(g, side) {
  if (g.teams[side] !== 'raveners') return;
  rvAutoMarker(g, side);
  if (rvLinkOk(g, side) && g.tp <= 2) rvLink(g, side);
}

// ---------- setting up underground ----------
const normalCount = (g, side) => g.ops.filter((o) => o.side === side && !o.dead && o.placed !== false && !o.underground && o.x > -50).length;
/** The first two operatives are set up normally; any other one can be set up underground instead. */
export function rvCanUnderground(g, op) {
  const d = g.dep;
  return isRV(op) && op.side < 2 && op.placed === false && !!d && !d.done && g.phase === 'deploy' && d.turn === op.side && d.batch.length < d.need && normalCount(g, op.side) >= 2;
}
export function rvGoUnderground(g, op) {
  if (!rvCanUnderground(g, op)) return false;
  op.underground = true; op.reserve = true; op.placed = true; op.x = -99; op.y = -99;
  g.dep.batch.push(op.uid);
  note(g, op.side, `${opName(op, 'zh')} 在地下部署`, `${opName(op, 'en')} is set up underground`);
  return true;
}
/** Automatic set-up: the first two normally, the rest underground. `base` is the usual automatic placement. */
export function rvPlaceAuto(g, side, ops, base) {
  if (g.teams[side] !== 'raveners') return base(g, side, ops);
  let n = normalCount(g, side);
  const normal = [], under = [];
  for (const o of ops) { if (n < 2) { normal.push(o); n++; } else under.push(o); }
  const placed = normal.length ? base(g, side, normal) : [];
  for (const o of under) { o.underground = true; o.reserve = true; o.x = -99; o.y = -99; }
  return [...placed, ...under];
}
/** At the end of the battle every operative still underground is incapacitated (nobody is credited with it). */
export function rvEndBattle(g) {
  for (const o of g.ops) if (o.underground && !o.dead) { o.dead = true; o.wounds = 0; }
}

// ---------- activation ----------
export function rvActivate(g, op) {
  if (g.counter || op.side > 1) return;
  // Poison tokens: D3 damage whenever the bearer is activated.
  for (const s of [0, 1]) if (op.rvPoison?.[s] && !op.dead) {
    const d = d3();
    note(g, s, `毒素：${opName(op, 'zh')} 啟動，受到 ${d} 傷害`, `Poison: ${opName(op, 'en')} activates and takes ${d} damage`);
    applyDamage(g, null, op, d);
  }
  if (op.dead) return;
  if (isRV(op) && equip(g, op.side, 'rvFlesh') && op.wounds < op.maxW) { // Metamorphic Flesh
    const h = Math.min(op.maxW - op.wounds, d3());
    op.wounds += h;
    note(g, op.side, `變形血肉：${opName(op, 'zh')} 回復 ${h} 生命`, `Metamorphic Flesh: ${opName(op, 'en')} regains ${h} wounds`);
  }
}
export function rvEnd(op) { if (op) op.rvSlow = false; }

// ---------- actions: Burrow, Toxic Lunge, Distend Dorsal Sac ----------
const carrying = (g, op) => [...(g.markers || []), ...(g.objectives || [])].some((m) => m.carriedBy === op.uid);
/** A counteraction can include one free Burrow (if the operative doesn't perform a mission action). */
export const rvFreeBurrow = (g, op) => isRV(op) && !!op.counter && !op.acted?.rvFree;
export function rvActions(g, op, add) {
  if (!isRV(op) || op.side > 1) return;
  const eng = isEngaged(g, op), ENG = { zh: '處於交戰中', en: 'Engaged' };
  if (op.underground) add('rvBurrow', rvTunnel(g, op.side).length > 0, { zh: '沒有隧道標記', en: 'No Tunnel markers' });
  else add('rvBurrow', rvOnTunnel(g, op) && !carrying(g, op), carrying(g, op) ? { zh: '攜帶著標記', en: 'Carrying a marker' } : { zh: '不在你的隧道上', en: 'Not on your TUNNEL' });
  if (tpl(op).rvFelltalon) add('rvLunge', TARGET_ACTIONS.rvLunge.targets(g, op).length > 0 && !op.acted.rvStrikeUsed, op.acted.rvStrikeUsed ? { zh: '本次啟動用過鑽地突襲', en: 'Burrowing Strike already used' } : { zh: '沒有可選的目標', en: 'No valid target' });
  if (tpl(op).rvVenomspitter && !op.underground) add('rvDistend', true, ENG);
  void eng;
}
export function rvSelf(g, op, id) {
  if (id === 'rvDistend') {
    spend(g, op, id);
    op.rvDistend = true;
    note(g, op.side, `${opName(op, 'zh')} 脹大背囊：毒液彈「致命 5+」、攻擊 +1，不再有射程限制`, `${opName(op, 'en')} Distend Dorsal Sac: its venom bolt has Lethal 5+, +1 Atk and no range limit`);
    return true;
  }
  if (id !== 'rvBurrow' || op.underground) return false;
  // On the tunnel: go underground (Burrowing Strike first, before it is removed).
  const free = rvFreeBurrow(g, op);
  if (free) op.acted.rvFree = 1; else spend(g, op, id);
  op.acted.rvBurrow = 1; op.rvBurrowTP = op.side < 2 ? g.tp : 0; op.rvDistend = false;
  burrowStrike(g, op);
  op.underground = true; op.reserve = true; op.x = -99; op.y = -99;
  note(g, op.side, `${opName(op, 'zh')} 鑽入地下`, `${opName(op, 'en')} burrows underground`);
  return true;
}
/** Emerging: the base must be on the tunnel and fit where it is put (it may be within enemy control range). */
export function rvEmergeCheck(g, op, p) {
  if (!op.underground) return { ok: false, why: { zh: '不在地下', en: 'Not underground' } };
  if (!rvOnTunnelAt(g, op.side, p, radius(op))) return { ok: false, why: { zh: '要放在你的隧道上', en: 'Must be set up on your TUNNEL' } };
  if (!moveCtx(g, { ...op, x: p.x, y: p.y, underground: false, reserve: false }, 'reposition').placement(p).ok) return { ok: false, why: { zh: '底盤放不下', en: 'The base does not fit' } };
  return { ok: true };
}
export function rvDoEmerge(g, op, p) {
  if (!rvEmergeCheck(g, op, p).ok) return false;
  const free = rvFreeBurrow(g, op);
  if (free) op.acted.rvFree = 1; else spend(g, op, 'rvBurrow');
  op.x = p.x; op.y = p.y; op.underground = false; op.reserve = false; op.rvSlow = true; op.rvDistend = false;
  op.acted.rvBurrow = 1; op.rvBurrowTP = g.tp;
  note(g, op.side, `${opName(op, 'zh')} 從隧道鑽出（Move -2"）`, `${opName(op, 'en')} emerges from the tunnel (Move -2")`);
  burrowStrike(g, op);
  return true;
}
/** Burrowing Strike (firefight ploy, automatic): D3+1 to each enemy in its control range. */
function burrowStrike(g, op) {
  if (op.side > 1 || op.acted.rvLunged || !autoFF(g, op.side, 'rvStrike')) return;
  op.acted.rvStrikeUsed = 1;
  for (const e of foes(g, op).filter((x) => x.side < 2 && x.x > -50 && edgeDist(x, op) <= CONTROL + 0.01)) {
    const d = d3() + 1;
    note(g, op.side, `鑽地突襲：${opName(e, 'zh')} 受到 ${d} 傷害`, `Burrowing Strike: ${opName(e, 'en')} takes ${d} damage`);
    applyDamage(g, op, e, d);
  }
}
export function registerRavenerActions() {
  ACTIONS.rvBurrow = { ap: 1, name: { zh: '鑽地', en: 'Burrow' } };
  ACTIONS.rvDistend = { ap: 1, name: { zh: '脹大背囊', en: 'Distend Dorsal Sac' } };
  ACTIONS.rvLunge = { ap: 1, name: { zh: '毒猛撲', en: 'Toxic Lunge' } };
  TARGET_ACTIONS.rvLunge = {
    targets(g, o) {
      if (o.underground) return foes(g, o).filter((e) => e.side < 2 && e.x > -50 && rvOnTunnelAt(g, o.side, e, radius(e)));
      const near = foes(g, o).filter((e) => e.side < 2 && e.x > -50 && edgeDist(o, e) <= 2.01 && !e.reserve);
      const eng = engagedEnemies(g, o);
      return eng.length ? near.filter((e) => eng.includes(e)) : near;
    },
    apply(g, o, t) {
      o.acted.rvLunged = 1;
      const d = d3() + 2;
      applyDamage(g, o, t, d);
      if (!t.dead) (t.rvPoison ||= [false, false])[o.side] = true;
      return { zh: `毒猛撲 ${opName(t, 'zh')}：${d} 傷害，並獲得毒素標記`, en: `Toxic Lunge on ${opName(t, 'en')}: ${d} damage and a Poison token` };
    },
  };
}

// ---------- Poison tokens ----------
/** A Poison weapon that inflicts damage with a critical success gives the target one of your Poison tokens. */
export function rvPoisonHit(g, op, weapon, target, critDamage) {
  if (!isRV(op) || !weapon?.rules?.rvPoison || !target || target.dead || target.side > 1 || !critDamage) return;
  const t = (target.rvPoison ||= [false, false]);
  if (t[op.side]) return;
  t[op.side] = true;
  note(g, op.side, `${opName(target, 'zh')} 獲得毒素標記`, `${opName(target, 'en')} gains a Poison token`);
}

// ---------- weapon rules and defence ----------
export function rvRules(g, op, weapon, target, r) {
  if (!isRV(op) || op.side > 1) return;
  // Instinctive Behaviour (Warrior): Lethal 5+ against a wounded enemy or one that fell back this turning point.
  if (tpl(op).rvWarrior && target && (target.wounds < target.maxW || target.fellBackTP === g.tp)) r.lethal = Math.min(r.lethal || 6, 5);
  // Death From Below (ploy): Balanced after Burrow, Ceaseless on the tunnel.
  if (weapon.type === 'melee' && hasPloy(g, op.side, 'rvDeath')) {
    if (op.acted?.rvBurrow) r.balanced = true;
    if (rvOnTunnel(g, op)) r.ceaseless = true;
  }
  // Distend Dorsal Sac (Venomspitter).
  if (op.rvDistend && weapon.rules.rvVenom) { r.lethal = Math.min(r.lethal || 6, 5); r.atkPlus = (r.atkPlus || 0) + 1; delete r.range; }
}
/** The venom bolt was shot: the Distend Dorsal Sac effect is over. */
export function rvShot(op, weapon) { if (isRV(op) && weapon?.rules?.rvVenom) op.rvDistend = false; }
/** Whipcord Emergence (ploy): defence re-rolls for a friendly RAVENER that Burrowed this turning point / is on the tunnel. */
export function rvDefence(g, target, defRules) {
  if (!isRV(target) || target.side > 1 || !hasPloy(g, target.side, 'rvWhip')) return;
  if (target.rvBurrowTP === g.tp) defRules.balanced = true;
  if (rvOnTunnel(g, target)) defRules.digIn = true;
}
/** Neuropredatory Crest (Prime): an enemy within 3" of it can't re-roll its attack or defence dice. */
export function rvNoReroll(g, op) { return op.side < 2 && foes(g, op).some((e) => tpl(e).rvPrime && e.side < 2 && !e.underground && edgeDist(e, op) <= 3.01); }
/** Neuropredatory Crest: +1AP for an enemy within 3" of the Prime to Pick Up or perform a mission action. */
export function rvCrestExtra(g, op) { return rvNoReroll(g, op) ? 1 : 0; }
/** Neuropredatory Crest at a marker: a side whose contesting operatives include one within 3" of the Prime counts 1 lower. */
export function rvCrestControl(g, obj, sum) {
  for (const s of [0, 1]) {
    for (const p of living(g, 1 - s).filter((o) => tpl(o).rvPrime && !o.underground)) {
      const mine = living(g, s).filter((o) => o.x > -50 && dist(o, obj) - radius(o) - 0.4 <= CONTROL);
      if (mine.some((o) => edgeDist(o, p) <= 3.01)) sum[s] = Math.max(0, sum[s] - 1);
    }
  }
}
/** Tunnel Lurkers (ploy): a RAVENER on the tunnel is in cover, unless within 2" of the active operative. */
export function rvLurkCover(g, from, to, v, opts) {
  if (!isRV(to) || to.side > 1 || from.side === to.side || opts.ignoreAll || opts.ignoreLight || !hasPloy(g, to.side, 'rvLurkers') || !v.visible) return v;
  const act = g.active != null ? getOp(g, g.active) : from;
  if ((act && edgeDist(act, to) <= 2) || !rvOnTunnel(g, to)) return v;
  v.cover = true;
  v.defenceOptions = [...new Map(v.defenceOptions.map((o) => [`${o.cover}:${o.obscured}`, { ...o, cover: true }])).values()];
  return v;
}
/** Chromatospore Camouflage: one more cover save when it can retain any. */
export const rvChroma = (g, target) => isRV(target) && target.side < 2 && equip(g, target.side, 'rvChroma');
/** Reinforced Carapace (Wrecker): Normal and Critical Dmg of 4+ inflicts 1 less. */
export const rvCarapace = (target, amount) => (tpl(target).rvCarapace && amount >= 4 ? amount - 1 : amount);
/** Crush (weapon rule): on each strike roll off; a win adds damage equal to the difference (max 3). */
export function rvCrush(weapon, foeOp) {
  if (!weapon?.rules?.crush) return 0;
  const mine = d6() + (tpl(foeOp).wounds <= 9 ? 1 : 0), theirs = d6();
  return mine > theirs ? Math.min(3, mine - theirs) : 0;
}
/** Acid Blood: an attack die that damages a RAVENER in a fight sometimes hurts the enemy back. */
export function rvAcidBlood(g, foeOp, meOp, dmg) {
  if (!isRV(foeOp) || foeOp.side > 1 || dmg <= 0 || !equip(g, foeOp.side, 'rvAcid') || meOp.dead) return;
  const r = d6();
  if (r >= 5) { note(g, foeOp.side, `酸血：${opName(meOp, 'zh')} 受到 1 傷害`, `Acid Blood: ${opName(meOp, 'en')} takes 1 damage`); applyDamage(g, foeOp, meOp, 1); }
}
/** Subterranean Horror (ploy, automatic): an enemy fighting a RAVENER on the tunnel — the defender resolves the first die. */
export function rvHorror(g, target) {
  return isRV(target) && target.side < 2 && rvOnTunnel(g, target) && autoFF(g, target.side, 'rvHorror');
}
/** Death Frenzy (ploy, automatic): before it is removed, D3 to every enemy in its control range (2D3 with the sac). */
export function rvDeath(g, src, target) {
  if (!isRV(target) || target.side > 1 || !autoFF(g, target.side, 'rvFrenzy')) return;
  for (const e of foes(g, target).filter((x) => x.side < 2 && x.x > -50 && edgeDist(x, target) <= CONTROL + 0.01)) {
    const d = tpl(target).rvVenomspitter && target.rvDistend ? d3() + d3() : d3();
    note(g, target.side, `死亡狂亂：${opName(e, 'zh')} 受到 ${d} 傷害`, `Death Frenzy: ${opName(e, 'en')} takes ${d} damage`);
    applyDamage(g, target, e, d);
  }
}

// ---------- ploys ----------
/** Writhe Out of Sight: a free Burrow for the friendly RAVENER that needs it most (a free Fall Back or Reposition first near the tunnel). */
export function rvPloyBought(g, side, ploy) {
  if (ploy.id !== 'rvWrithe') return;
  const cands = living(g, side).filter((o) => isRV(o) && !o.underground && o.x > -50 && !carrying(g, o));
  if (!cands.length) { note(g, side, '滑入暗處：戰場上沒有蛇蟲', 'Writhe Out of Sight: no RAVENER in the killzone'); return; }
  const score = (o) => (rvOnTunnel(g, o) ? 3 : rvOnTunnelAt(g, side, o, radius(o) + 2) ? 1 : 0) + (isEngaged(g, o) ? 2 : 0) + (1 - o.wounds / o.maxW) * 2;
  const o = cands.filter((c) => rvOnTunnel(g, c) || rvOnTunnelAt(g, side, c, radius(c) + 2)).sort((a, b) => score(b) - score(a))[0];
  if (!o) { note(g, side, '滑入暗處：沒有蛇蟲在隧道上或它 2" 內', 'Writhe Out of Sight: no RAVENER on or within 2" of the tunnel'); return; }
  if (!rvOnTunnel(g, o)) {
    // The nearest tunnel point it can step onto (a free Fall Back or Reposition).
    const t = rvTunnel(g, side);
    let best = null;
    for (let i = 0; i < t.length; i++) for (const q of [t[i], ...(i < t.length - 1 ? [0.25, 0.5, 0.75].map((k) => ({ x: t[i].x + (t[i + 1].x - t[i].x) * k, y: t[i].y + (t[i + 1].y - t[i].y) * k })) : [])]) {
      if (dist(o, q) <= 2 + radius(o) && rvOnTunnelAt(g, side, q, radius(o)) && moveCtx(g, o, 'reposition').placement(q).ok && (!best || dist(o, q) < dist(o, best))) best = q;
    }
    if (best) { o.x = best.x; o.y = best.y; }
    if (!rvOnTunnel(g, o)) { note(g, side, `滑入暗處：${opName(o, 'zh')} 踏不上隧道`, `Writhe Out of Sight: ${opName(o, 'en')} can't reach the tunnel`); return; }
  }
  op_burrowFree(g, o);
}
function op_burrowFree(g, o) {
  o.acted ||= {};
  o.acted.rvBurrow = 1; o.rvBurrowTP = g.tp; o.rvDistend = false;
  burrowStrike(g, o);
  o.underground = true; o.reserve = true; o.x = -99; o.y = -99;
  note(g, o.side, `滑入暗處：${opName(o, 'zh')} 免費鑽入地下`, `Writhe Out of Sight: ${opName(o, 'en')} burrows underground for free`);
}

// ---------- Subterranean Ambush (Tremorscythe) ----------
/** After an enemy's action (a move of more than 2") that ends within 2" of the TUNNEL, an underground Tremorscythe that is ready (or hasn't
 *  counteracted) interrupts: it emerges beside the enemy and fights it. Automatic; cancelled if it can't reach. */
export function rvAmbush(g, mover, from) {
  if (!mover || mover.dead || mover.side > 1 || dist(from, mover) <= 2) return;
  const side = 1 - mover.side;
  if (g.teams[side] !== 'raveners' || !g.rv || g.rv.used[side].ambush === g.tp) return;
  if (!rvOnTunnelAt(g, side, mover, radius(mover) + 2)) return;
  const tr = living(g, side).find((o) => tpl(o).rvTremor && o.underground && (o.ready || !o.counteracted));
  if (!tr) return;
  // The tunnel point (or a spot touching the enemy beside it) where the Tremorscythe can be set up.
  const t = rvTunnel(g, side);
  const pts = [];
  for (let i = 0; i < t.length; i++) { pts.push(t[i]); if (i < t.length - 1) for (const k of [0.25, 0.5, 0.75]) pts.push({ x: t[i].x + (t[i + 1].x - t[i].x) * k, y: t[i].y + (t[i + 1].y - t[i].y) * k }); }
  const probe = { ...tr, underground: false, reserve: false };
  const spots = [];
  for (let a = 0; a < 360; a += 20) for (const gap of [0.1, 0.5]) {
    const d = radius(mover) + radius(tr) + gap;
    spots.push({ x: mover.x + d * Math.cos(a * Math.PI / 180), y: mover.y + d * Math.sin(a * Math.PI / 180) });
  }
  const spot = spots.filter((p) => rvOnTunnelAt(g, side, p, radius(tr)) && moveCtx(g, probe, 'reposition').placement(p).ok).sort((a, b) => dist(a, mover) - dist(b, mover))[0];
  void pts;
  if (!spot) return; // (can't be set up in reach: the interruption is cancelled)
  const w = bestMelee(tr);
  const was = { ready: tr.ready, counteracted: tr.counteracted };
  g.rv.used[side].ambush = g.tp;
  tr.x = spot.x; tr.y = spot.y; tr.underground = false; tr.reserve = false; tr.rvBurrowTP = g.tp; tr.acted ||= {}; tr.acted.rvBurrow = 1;
  note(g, side, `地底伏擊：${opName(tr, 'zh')} 從隧道撲向 ${opName(mover, 'zh')}`, `Subterranean Ambush: ${opName(tr, 'en')} lunges from the tunnel at ${opName(mover, 'en')}`);
  const keep = { ap: tr.ap, acted: tr.acted };
  for (let i = 0; i < (was.ready ? 2 : 1) && !mover.dead && !tr.dead; i++) {
    tr.ap = 1; tr.acted = { ...tr.acted, free: { fight: mover.uid } };
    g.seekerFree = tr.uid;
    try { resolveFight(g, tr, w, mover); } finally { g.seekerFree = null; }
  }
  tr.ap = keep.ap; tr.acted = keep.acted;
  if (was.ready) { tr.ready = false; g.rvSkip = side; } else tr.counteracted = true; // it used the Ravener player's activation
}

// ---------- registration (called once from game.js) ----------
export function registerRavenersLabels() { void team; }

// ---------- the computer ----------
/** The tunnel points an operative could be set up on: the markers and a few points along each strip. */
function tunnelPoints(g, side) {
  const t = rvTunnel(g, side), pts = [];
  for (let i = 0; i < t.length; i++) {
    pts.push(t[i]);
    if (i < t.length - 1) for (const k of [0.2, 0.4, 0.6, 0.8]) pts.push({ x: t[i].x + (t[i + 1].x - t[i].x) * k, y: t[i].y + (t[i + 1].y - t[i].y) * k });
  }
  return pts;
}
/** An underground operative's activation: emerge where it can strike (or later in the battle), otherwise stay put. */
export function rvAiUnderground(g, op) {
  const en = foes(g, op).filter((e) => e.side < 2 && e.x > -50 && !e.reserve);
  const cost = rvFreeBurrow(g, op) ? 0 : 1;
  if (op.ap < cost || !en.length || op.acted.rvBurrow) { endActivation(g); return; }
  let best = null;
  for (const p of tunnelPoints(g, op.side)) {
    if (!rvEmergeCheck(g, op, p).ok) continue;
    const near = Math.min(...en.map((e) => dist(p, e) - radius(e) - radius(op)));
    if (!best || near < best.near) best = { p, near };
  }
  if (!best || (best.near > 7 && g.tp < 3) || (best.near > 12 && g.tp < 4)) { endActivation(g); return; }
  if (!rvDoEmerge(g, op, best.p)) endActivation(g);
}
/** A hurt operative on the tunnel burrows away. */
export function rvAiBurrow(g, op) {
  if (!isRV(op) || op.underground || !rvOnTunnel(g, op) || carrying(g, op) || op.wounds > op.maxW * 0.4) return false;
  if (op.ap < (rvFreeBurrow(g, op) ? 0 : 1)) return false;
  return rvSelf(g, op, 'rvBurrow');
}

// ---------- Heightened Senses (equipment) ----------
/** Once per battle after the initiative roll-off: with an operative underground and an enemy within 5" of the tunnel, re-roll your die. */
export function rvSensesOk(g, side) {
  return g.teams[side] === 'raveners' && !!g.rv && equip(g, side, 'rvSenses') && !g.rv.used[side].senses && g.phase === 'initiative' && !g.initLocked
    && living(g, side).some((o) => o.underground) && foes(g, { side }).some((e) => e.side < 2 && e.x > -50 && rvOnTunnelAt(g, side, e, radius(e) + 5));
}
export function rvUseSenses(g, side) {
  if (!rvSensesOk(g, side)) return false;
  g.rv.used[side].senses = true;
  const before = g.initRoll[side];
  g.initRoll[side] = d6();
  note(g, side, `敏銳感官：重擲先攻骰 ${before} → ${g.initRoll[side]}（${g.initRoll[0]} : ${g.initRoll[1]}）`, `Heightened Senses: re-rolls the initiative die ${before} → ${g.initRoll[side]} (${g.initRoll[0]} : ${g.initRoll[1]})`);
  return true;
}
