// chaoscult: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { TEAM_MAP } from '../data/teams.js';
import { CHOICES, contagion, d3, edgeDist, getOp, hasPloy, injuredPenalty, living, log, opName, tpl } from '../game.js';
import { moveCtx } from '../path.js';
import { witchHunted } from './insidiants.js';
import { isEDM } from './exodite.js';


// ---------- Chaos Cult ----------
export const isCult = (op) => !!TEAM_MAP[op?.team]?.chaosCult;
/** Mutant or Torment (Chaos Cult). */
export const isWarped = (op) => isCult(op) && !!(tpl(op).mutant || tpl(op).torment);
export const CULT_GIFTS = {
  wings: { zh: '畸形之翼', en: 'Deformed Wings' }, fleet: { zh: '迅捷', en: 'Fleet' }, chitinous: { zh: '幾丁甲殼', en: 'Chitinous' },
  horned: { zh: '角', en: 'Horned' }, sinewed: { zh: '筋腱', en: 'Sinewed' }, barbed: { zh: '倒刺', en: 'Barbed' },
};
/** Accursed Gifts: Mutants have the primary one, Torments the primary and the secondary. */
export const hasGift = (g, op, id) => { if (isCult(op) && op.ctExtraGift === id) return true; const gs = isCult(op) && g.cultGifts?.[op.side]; return !!gs && ((tpl(op).mutant && gs.primary === id) || (tpl(op).torment && (gs.primary === id || gs.secondary === id))); }; // (ctExtraGift: Abhorrent Mutation)
/** The Accursed Gifts this operative has (for its datacard). */
export const giftsOf = (g, op) => Object.keys(CULT_GIFTS).filter((k) => hasGift(g, op, k));
/** MUTATE: Devotee → Mutant (max 5), Mutant → Torment (max 3, twice per TP), otherwise regain D3+1. Once per TP each. */
export function mutate(g, op, why) {
  if (!isCult(op) || op.dead || op.mutateTP === g.tp) return false;
  const side = op.side, mine = living(g, side);
  const tormentsTP = g.tormentTP?.[side]?.tp === g.tp ? g.tormentTP[side].n : 0;
  const into = tpl(op).devotee && mine.filter((o) => tpl(o).mutant).length < 5 ? 'ctMutant'
    : tpl(op).mutant && mine.filter((o) => tpl(o).torment).length < 3 && tormentsTP < 2 ? 'ctTorment' : null;
  if (!into && op.wounds >= op.maxW) return false;
  if (into && !moveCtx(g, { ...op, tplId: into }).free(op)) return false;
  op.mutateTP = g.tp;
  if (!into) {
    const b = op.wounds; op.wounds = Math.min(op.maxW, op.wounds + d3() + 1);
    log(g, { zh: `${opName(op, 'zh')} 變異（${why.zh}）：回復 ${op.wounds - b} 生命`, en: `${opName(op, 'en')} mutates (${why.en}): regains ${op.wounds - b} wounds` }, `side${side}`);
    return true;
  }
  const before = opName(op, 'zh'), beforeEn = opName(op, 'en');
  const lost = op.maxW - op.wounds, t = TEAM_MAP[op.team].ops.find((o) => o.id === into);
  op.tplId = into; op.maxW = t.wounds; op.wounds = Math.max(1, t.wounds - lost);
  const gs = ((g.cultGifts ||= [null, null])[side] ||= {});
  // (The gifts are picked automatically: Chitinous first, then Sinewed.)
  let gift = null;
  if (into === 'ctMutant' && !gs.primary) gift = gs.primary = 'chitinous';
  if (into === 'ctTorment') { if (!gs.secondary) gift = gs.secondary = gs.primary === 'sinewed' ? 'barbed' : 'sinewed'; (g.tormentTP ||= [null, null])[side] = { tp: g.tp, n: tormentsTP + 1 }; }
  log(g, { zh: `${before} 變異成 ${t.name.zh}（${why.zh}）${gift ? `，獲得受詛恩賜「${CULT_GIFTS[gift].zh}」` : ''}`, en: `${beforeEn} mutates into a ${t.name.en} (${why.en})${gift ? `, gaining the Accursed Gift ${CULT_GIFTS[gift].en}` : ''}` }, `side${side}`);
  return true;
}
/** Mutation (strategic gambit): 2 / 2 / 3 / 4 operatives by turning point — those nearest the enemy first. */
export function cultStrategyEnd(g, side) {
  if (!TEAM_MAP[g.teams[side]].chaosCult || g.cultTP?.[side] === g.tp) return;
  (g.cultTP ||= [0, 0])[side] = g.tp;
  let n = [2, 2, 3, 4][Math.min(g.tp, 4) - 1] || 4;
  const enemies = living(g, 1 - side), near = (o) => Math.min(99, ...enemies.map((e) => edgeDist(o, e)));
  const cands = living(g, side).filter((o) => tpl(o).devotee || tpl(o).mutant).sort((a, b) => (tpl(b).mutant ? 1 : 0) - (tpl(a).mutant ? 1 : 0) || near(a) - near(b));
  for (const o of cands) if (n > 0 && mutate(g, o, { zh: '策略階段', en: 'Strategy phase' })) n--;
  for (const o of living(g, side).filter((x) => isCult(x) && x.wounds < x.maxW)) if (n > 0 && mutate(g, o, { zh: '策略階段', en: 'Strategy phase' })) n--;
}
/** Ruinous Icon (Iconarch, PSYCHIC): Invigoration (friendlies within 4": Dmg 4+ deals 1 less) or Deterioration (enemies within 4": +1). */
export function ruinousIconDmg(g, target, d) {
  for (const s of [0, 1]) {
    const ic = g.ruinous?.[s], by = ic && getOp(g, ic.by);
    if (!by || by.dead || edgeDist(by, target) > 4 || witchHunted(g, by)) continue;
    if (ic.mode === 'invigoration' && target.side === s && d >= 4) d -= 1;
    if (ic.mode === 'deterioration' && target.side === 1 - s && d > 0) d += 1;
  }
  return d;
}
/** Exaltation in Pain (ploy) / Sinewed (gift, melee): the Hit stat isn't worsened by being injured. */
// (Exodite Dragon Masters too: Survivalist Spirit, and Implacable Darkscale for the Leystalker's drakesteed fangs.)
export const cultIgnoresInjury = (g, op, w) => injuredPenalty(g, op) && !contagion(g, op)
  && ((isCult(op) && (hasPloy(g, op.side, 'exaltationPain') || (w?.type === 'melee' && hasGift(g, op, 'sinewed'))))
    || (isEDM(op) && (op.survSpirit || (tpl(op).implacable && w?.id === 'edFangs'))));
/** Creatures of Nightmare / Sickening Aura (ploys): an enemy within 2" of a friendly Mutant or Torment. */
export const nightmareNear = (g, o, ploy) => o.side < 2 && TEAM_MAP[g.teams[1 - o.side]]?.chaosCult && hasPloy(g, 1 - o.side, ploy) && living(g, 1 - o.side).some((m) => isWarped(m) && edgeDist(m, o) <= 2);

/** Abhorrent Mutation (firefight ploy): as a non-Dark-Commune cultist activates, it gains an Accursed Gift (once per operative per battle; kept when it mutates). */
export const ctAbhorrentOk = (g, op) => isCult(op) && !tpl(op).darkCommune && !op.ctExtraGift && Object.keys(CULT_GIFTS).some((k) => !hasGift(g, op, k));
export function registerChaosCultChoices() {
  CHOICES.ctAbhorrent = {
    kind: 'option', title: { zh: '可憎突變：獲得哪一個受詛咒的恩賜？', en: 'Abhorrent Mutation: which Accursed Gift does it gain?' },
    options: (g, side, ctx) => { const o = getOp(g, ctx.uid); return Object.entries(CULT_GIFTS).filter(([k]) => !hasGift(g, o, k)).map(([k, v]) => ({ value: k, label: v })); },
    auto: (g, side, ctx) => { const o = getOp(g, ctx.uid); return ['chitinous', 'sinewed', 'fleet', 'barbed', 'horned', 'wings'].find((k) => !hasGift(g, o, k)); },
    apply(g, side, gift, ctx) { const o = getOp(g, ctx.uid); o.ctExtraGift = gift; log(g, { zh: `可憎突變：${opName(o, 'zh')} 獲得「${CULT_GIFTS[gift].zh}」`, en: `Abhorrent Mutation: ${opName(o, 'en')} gains ${CULT_GIFTS[gift].en}` }, `side${side}`); },
  };
}
