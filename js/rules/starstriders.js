// starstriders: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { ES_ASSETS, TEAM_MAP } from '../data/teams.js';
import { applyDamage, d6, edgeDist, feAvailable, getOp, handOff, hasPloy, hasReady, living, log, opName, radius, tally, team, teamZh, tpl, visibility } from '../game.js';
import { dist } from '../geometry.js';


// ---------- Elucidian Starstriders ----------
export const isES = (op) => !!TEAM_MAP[op?.team]?.starstriders;
/** Privateer Support Assets still available to this operative now (Navis or Vhane, once per Firefight phase, each once per battle). */
export const assetsFor = (g, op) => (isES(op) && op.side < 2 && (tpl(op).navis || tpl(op).esLeader) && g.phase === 'firefight' && g.assetTP?.[op.side] !== g.tp
  ? ES_ASSETS.filter((w) => !g.assetsUsed?.[op.side]?.includes(w.id) || feAvailable(g,op.side,'feGunnery',1,true)) : []);
/** Warrant of Trade: uses left this battle (4, or 5 after Reputation to Maintain). */
export const warrantsLeft = (g, side) => (g.warrantMax?.[side] || 4) - (g.warrants?.[side]?.length || 0);
export const useWarrant = (g, side, id) => ((g.warrants ||= [[], []])[side]).push(id);
/** Bribe (Warrant of Trade): skip this activation. */
export function bribeSkip(g, side) {
  if (!TEAM_MAP[g.teams[side]]?.starstriders || g.phase !== 'firefight' || g.turn !== side || g.active || g.counter || g.chain) return false;
  if (warrantsLeft(g, side) <= 0 || g.warrants?.[side]?.includes('bribe') || !hasReady(g, 1 - side)) return false;
  useWarrant(g, side, 'bribe');
  log(g, { zh: `${teamZh(g, side)} 貿易許可證「賄賂」：跳過這次啟動`, en: `${team(g, side).name.en} Warrant of Trade — Bribe: skips this activation` }, `side${side}`);
  handOff(g, side);
  return true;
}
export const canBribe = (g, side) => !!TEAM_MAP[g.teams[side]]?.starstriders && g.phase === 'firefight' && g.turn === side && !g.active && !g.counter && !g.chain
  && warrantsLeft(g, side) > 0 && !g.warrants?.[side]?.includes('bribe') && hasReady(g, 1 - side);
/** Stake Claim (ploy): the Claim marker goes by the enemy nearest the team. */
export function starstridersStrategyEnd(g, side) {
  if (!TEAM_MAP[g.teams[side]].starstriders || g.esTP?.[side] === g.tp) return;
  (g.esTP ||= [0, 0])[side] = g.tp;
  g.markers = (g.markers || []).filter((m) => !(m.kind === 'claim' && m.owner === side)); // (removed at the end of the previous TP)
  if (!hasPloy(g, side, 'stakeClaimES')) return;
  const mine = living(g, side), near = (e) => Math.min(...mine.map((m) => dist(m, e)));
  const t = living(g, 1 - side).filter((e) => e.side < 2).sort((a, b) => near(a) - near(b))[0];
  if (!t) return;
  g.markers.push({ id: g.markers.length, kind: 'claim', owner: side, x: t.x, y: t.y, carriedBy: null });
  log(g, { zh: `${teamZh(g, side)} 宣示所有權：標記放在 ${opName(t, 'zh')} 處`, en: `${team(g, side).name.en} Stake Claim: the marker goes by ${opName(t, 'en')}` }, `side${side}`);
}
/** Stake Claim: attacking an enemy within 3" of the Claim marker — one fail becomes a normal success, else a normal a crit. */
export function claimBoost(g, op, target, pool) {
  if (!isES(op) || !target || !(g.markers || []).some((m) => m.kind === 'claim' && m.owner === op.side && dist(m, target) - radius(target) <= 3)) return;
  const m = pool.dice.find((d) => d.res === 'miss' && !d.auto), n = pool.dice.find((d) => d.res === 'norm' && !d.auto);
  if (m) m.faith = 'norm'; else if (n) n.faith = 'crit';
  tally(pool);
}
/** Calibrate Voltagheist — Field (Lectro-Maester): an enemy ending a move visible within 4" of it takes D6. */
export function voltagheistField(g, op) {
  for (const s of [0, 1]) {
    const c = g.calib?.[s], lm = c && getOp(g, c.by);
    if (!lm || lm.dead || c.mode !== 'field' || op.side !== 1 - s || op.dead || edgeDist(lm, op) > 4 || !visibility(g, lm, op).visible) continue;
    const d = d6();
    log(g, { zh: `電能幽靈力場：${opName(op, 'zh')} 受到 ${d} 傷害`, en: `Voltagheist Field: ${opName(op, 'en')} takes ${d} damage` }, `side${s}`);
    applyDamage(g, lm, op, d);
  }
}
