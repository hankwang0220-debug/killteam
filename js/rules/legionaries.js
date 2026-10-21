// legionaries: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { d3, d6, edgeDist, hasPloy, living, log, opName, radius, tpl, visibility } from '../game.js';
import { dist } from '../geometry.js';
import { TEAM_MAP } from '../data/teams.js';


// ---------- Legionaries ----------
export const markOf = (op) => tpl(op).mark || null;
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
