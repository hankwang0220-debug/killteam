// gellerpox: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { CONTROL, EQUIPMENT, OBJ_R, d6, edgeDist, foes, hasPloy, living, log, needChoice, radius, tpl } from '../game.js';
import { TEAM_MAP } from '../data/teams.js';
import { dist } from '../geometry.js';


// ---------- Gellerpox Infected ----------
/**
 * Is this operative within the infection range of an enemy Gellerpox Techno-curse? Barrelwarp: 2" (3" of a
 * Glitchling); Viral Vox-static: 3" (4" of a Glitchling); Screaming Rustspikes: control range.
 */
export function cursed(g, op, curse) {
  const [r, rg] = { barrelwarp: [2, 3], voxStatic: [3, 4], rustspikes: [CONTROL, CONTROL] }[curse];
  // (Mutated Symptoms: one operative also has a second Techno-curse this turning point. Mutoid Vermin don't spread curses.)
  const has = (s, o) => g.tactics?.[s]?.[0] === curse || (g.gpSymptoms?.[s]?.tp === g.tp && g.gpSymptoms[s].uid === o.uid && g.gpSymptoms[s].curse === curse);
  return [0, 1].some((s) => s !== op.side && g.teams[s] === 'gellerpox' && TEAM_MAP[g.teams[s]].tacticSlots === 1
    && living(g, s).some((o) => !tpl(o).vermin && has(s, o) && edgeDist(o, op) <= (tpl(o).glitchling ? rg : r) + 0.01));
}

/** Drawn to the Hum: a friendly Gellerpox operative's own Reposition or Charge this turning point (not a counteraction). */
export function gpHumOn(g, op) {
  return op.team === 'gellerpox' && op.side < 2 && !op.counter && !op.acted?.gpHumOff && g.gpHum?.[op.side]?.tp === g.tp && hasPloy(g, op.side, 'drawnHum');
}
/** ...and the move has to end within 2" of the chosen objective marker to use the extra inch. */
export function gpHumNear(g, op, p) {
  const obj = (g.objectives || []).find((o) => o.id === g.gpHum[op.side].id);
  return !!obj && !!p && dist(p, obj) - radius(op) - OBJ_R <= 2 + 0.01;
}
export const gpEquip = (g, side, id) => side < 2 && g.teams[side] === 'gellerpox' && !!g.equip?.[side]?.includes(id);
/** Mutated Symptoms (equipment, once per battle): offered when a friendly is activated with enemies close enough for a curse to matter. */
export function gpActivate(g, op) {
  if (!gpEquip(g, op.side, 'gpSymptoms') || g.gpSymptomsUsed?.[op.side] || tpl(op).vermin) return;
  if (!foes(g, op).some((e) => edgeDist(op, e) <= 6)) return;
  needChoice(g, op.side, 'gpSymptoms', { uid: op.uid });
}
/** Plague Bellows: shot from more than 6", a Nightmare Hulk retains one defence result of 3 as a normal save. */
export function gpBellows(g, shooter, target) {
  if (!gpEquip(g, target.side, 'gpBellows') || !tpl(target).hulk || edgeDist(shooter, target) <= 6) return null;
  return (pool) => { const x = pool.dice.find((d) => d.res === 'miss' && d.v === 3); if (x) { x.res = 'norm'; x.indo = true; pool.norms++; } };
}
/**
 * Polluted Stockpile (revealed at the end of team selection): 2D6 — on a 7+ one of the opponent's equipment options is removed;
 * otherwise the opponent removes one of their own (automatic: the last one listed).
 */
export function gpStockpile(g, lists) {
  for (const s of [0, 1]) {
    if (g.teams[s] !== 'gellerpox' || !lists[s].includes('gpStockpile') || !lists[1 - s].length) continue;
    const r = [d6(), d6()], gone = lists[1 - s].pop();
    const nm = EQUIPMENT[gone]?.name || { zh: gone, en: gone };
    log(g, { zh: `汙染的庫存：擲 ${r[0]}+${r[1]}=${r[0] + r[1]} → 對手失去「${nm.zh}」（${r[0] + r[1] >= 7 ? '由你選' : '由對手自己選'}，這裡自動選最後一項）`, en: `Polluted Stockpile: rolled ${r[0]}+${r[1]}=${r[0] + r[1]} → the opponent loses ${nm.en} (${r[0] + r[1] >= 7 ? 'your pick' : 'their own pick'}; the last one listed is taken automatically)` }, `side${s}`);
  }
}
/** Mutoid Vermin (equipment): four more operatives, picked from Cursemites, Eyestinger Swarms and Sludge-grubs. */
export const GP_VERMIN_DEFAULT = ['gpCursemite', 'gpCursemite', 'gpEyestinger', 'gpSludgegrub'];
export function gpVerminSetup(g, equip, roster) {
  for (const side of [0, 1]) {
    if (g.teams[side] !== 'gellerpox' || !(equip[side] || []).includes('gpVermin')) continue;
    const picks = Array.isArray(roster[side]?.vermin) && roster[side].vermin.length === 4 ? roster[side].vermin : GP_VERMIN_DEFAULT;
    let n = g.ops.filter((o) => o.side === side).length;
    for (const id of picks) {
      const t = TEAM_MAP.gellerpox.ops.find((o) => o.id === id && o.vermin) || TEAM_MAP.gellerpox.ops.find((o) => o.id === GP_VERMIN_DEFAULT[0]);
      n++;
      g.ops.push({ uid: `${side}-${n}`, side, team: 'gellerpox', tplId: t.id, num: n, x: 0, y: 0, wounds: t.wounds, maxW: t.wounds, order: 'conceal', ready: true, ap: 0, acted: {},
        ml: 0, aplNext: 0, used: {}, poison: false, damagedTP: false, dead: false, counteracted: false });
    }
  }
}
