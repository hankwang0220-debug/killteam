// insidiants: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { TEAM_MAP } from '../data/teams.js';
import { avgDmg, bestMelee, d3, d6, edgeDist, feAuto, feUse, hasPloy, living, log, opName, tpl, visibility } from '../game.js';
import { dist } from '../geometry.js';


// ---------- Celestian Insidiants ----------
export const isCI = (op) => !!TEAM_MAP[op?.team]?.insidiants;
// Keywords the team's rules look at (Fervent Hate).
export const IMPERIUM_TEAMS = new Set(['angels', 'kasrkin', 'deathKorps', 'exaction', 'novitiates', 'battleclade', 'hunterClade', 'navyBreachers', 'phobos', 'celestianInsidiants']);
export const CHAOS_TEAMS = new Set(['legionaries', 'warpcoven', 'gellerpox', 'blooded', 'plagueMarines', 'fellgor', 'chaosCult', 'goremongers']);
/** Inspiration: the operative becomes INSPIRING (its datacard weapons have Severe). */
export function inspire(g, op, why) {
  if (!op || op.dead || !isCI(op) || op.inspiring) return;
  op.inspiring = true;
  log(g, { zh: `${opName(op, 'zh')} 變為激勵（${why.zh}）`, en: `${opName(op, 'en')} becomes INSPIRING (${why.en})` }, `side${op.side}`);
}
/** A friendly to inspire from `from` (visible within range, not inspiring yet): the strongest fighter. */
export const pickInspire = (g, from, range = 6, not = null) => living(g, from.side).filter((o) => o !== not && o !== from && isCI(o) && !o.inspiring
  && edgeDist(o, from) <= range && visibility(g, from, o).visible).sort((a, b) => avgDmg(bestMelee(b)) - avgDmg(bestMelee(a)))[0] || null;
/** Null Field (Censor): an enemy within its null range (1" to 5"). */
export const nullFielded = (g, op) => op.side < 2 && living(g, 1 - op.side).some((c) => tpl(c).nullField && edgeDist(c, op) <= (c.nullRange || 1));
/** Weapons of the Witch Hunters: within 3" of an enemy Insidiant — no Psychic actions or Psychic ranged weapons. */
export const witchHunted = (g, op) => op.side < 2 && living(g, 1 - op.side).some((c) => isCI(c) && edgeDist(c, op) <= 3);
/** A Benediction (Martyrdom / Speak of Her Deeds), picked automatically: heal if hurt, else Ardour, else Wrath. */
export function benediction(g, op) {
  let kind = op.maxW - op.wounds >= 4 ? 'restoration' : !op.ardour && !tpl(op).ciLeader ? 'ardour' : !op.wrath ? 'wrath' : 'restoration';
  if (kind === 'restoration' && op.wounds >= op.maxW) kind = !op.wrath ? 'wrath' : !op.ardour && !tpl(op).ciLeader ? 'ardour' : 'restoration';
  const name = { ardour: { zh: '熱忱：整場 APL +1', en: 'Ardour: +1 APL for the battle' }, wrath: { zh: '憤怒：整場武器「無休」', en: 'Wrath: Ceaseless for the battle' }, restoration: { zh: '復原', en: 'Restoration' } }[kind];
  if (kind === 'ardour') op.ardour = true;
  if (kind === 'wrath') op.wrath = true;
  let healed = 0;
  if (kind === 'restoration') { const b = op.wounds; op.wounds = Math.min(op.maxW, op.wounds + d3() + 2); healed = op.wounds - b; }
  log(g, { zh: `${opName(op, 'zh')} 獲得祝福「${name.zh}」${healed ? `，回復 ${healed} 生命` : ''}`, en: `${opName(op, 'en')} gains a Benediction — ${name.en}${healed ? `, regains ${healed}` : ''}` }, `side${op.side}`);
}
/** Martyrdom: an inspiring friendly is incapacitated — a friendly it's visible to or within 6" of gains a Benediction. */
export function martyrdom(g, dead) {
  if (!isCI(dead) || !dead.inspiring || dead.side > 1) return;
  const remote=feAuto(g,dead.side,'feMortis',1,true);
  const t = living(g, dead.side).filter((o) => o !== dead && isCI(o) && (remote || edgeDist(o, dead) <= 6 || visibility(g, dead, o).visible))
    .sort((a, b) => edgeDist(a, dead) - edgeDist(b, dead))[0];
  if (!t) return;
  if(remote && edgeDist(t,dead)>6 && !visibility(g,dead,t).visible) feUse(g,dead.side,'feMortis');
  log(g, { zh: `殉道：${opName(dead, 'zh')} 的犧牲激勵了 ${opName(t, 'zh')}`, en: `Martyrdom: ${opName(dead, 'en')}'s sacrifice blesses ${opName(t, 'en')}` }, `side${dead.side}`);
  benediction(g, t);
}
/** Speak of Her Deeds needs an inspiring friendly within 6" of the Denuncia. */
export const deedsSource = (g, op) => living(g, op.side).some((s) => s.inspiring && (s === op || (edgeDist(op, s) <= 6 && visibility(g, op, s).visible)));
/** Simulacrum Nullificatus (Reliquarius): an enemy contesting a marker within 3" of it. */
export const simulacrumNear = (g, o) => o.side < 2 && living(g, 1 - o.side).some((r) => tpl(r).simulacrum && edgeDist(r, o) <= 3);
/** Inspired Strikes (Insidiant Warrior): +1 Critical Dmg while inspiring. */
export const inspCrit = (op) => (tpl(op).inspiredStrikes && op.inspiring ? 1 : 0);
/** Zealous Ultimatum declined: that enemy fighting or retaliating against an Insidiant has -1 Atk. */
export const declinedVs = (g, o, foe) => !!foe && isCI(foe) && g.ultimatum?.[foe.side]?.uid === o.uid && g.ultimatum[foe.side].accepted === false;
/** Holy Defender (Abjuror, once per TP): it takes the attack meant for a friendly within 2" of it. */
export function holySwap(g, target, weapon) {
  if (!target || target.side > 1 || !isCI(target) || tpl(target).holyDefender || weapon?.rules.blast || weapon?.rules.torrent) return target;
  const ab = living(g, target.side).find((o) => tpl(o).holyDefender && o.holyTP !== g.tp && edgeDist(o, target) <= 2 && visibility(g, o, target).visible);
  if (!ab) return target;
  ab.holyTP = g.tp;
  log(g, { zh: `聖衛：${opName(ab, 'zh')} 替 ${opName(target, 'zh')} 擋下攻擊`, en: `Holy Defender: ${opName(ab, 'en')} takes the attack for ${opName(target, 'en')}` }, `side${target.side}`);
  return ab;
}
/** Strategy phase: Zealous Ultimatum (Mortisanctus, once per battle) and Suspect & Eliminate (ploy). */
export function insidiantsStrategyEnd(g, side) {
  if (!TEAM_MAP[g.teams[side]].insidiants || g.ciTP?.[side] === g.tp) return;
  (g.ciTP ||= [0, 0])[side] = g.tp;
  const mort = living(g, side).find((o) => tpl(o).ultimatum);
  if (mort && !g.ultimatum?.[side]) {
    const t = living(g, 1 - side).filter((e) => e.side < 2 && edgeDist(e, mort) <= 8).sort((a, b) => b.maxW - a.maxW)[0];
    if (t) {
      // (Whether the opponent accepts is rolled here, as for an NPO: 4+ accepts.)
      const r = d6(), accepted = r >= 4;
      (g.ultimatum ||= [null, null])[side] = { by: mort.uid, uid: t.uid, accepted };
      log(g, { zh: `${opName(mort, 'zh')} 熱誠的最後通牒：${opName(t, 'zh')}${accepted ? '接受（雙方近戰時闊劍 Atk +1）' : '拒絕（它對修女近戰時 Atk -1）'}（擲 ${r}）`, en: `${opName(mort, 'en')} Zealous Ultimatum: ${opName(t, 'en')} ${accepted ? 'accepts (+1 Atk for the broadsword between them)' : 'declines (-1 Atk fighting the Insidiants)'} (rolled ${r})` }, `side${side}`);
    }
  }
  if (hasPloy(g, side, 'suspectEliminate') && g.suspectTP?.[side] !== g.tp) {
    const mine = living(g, side), near = (e) => Math.min(...mine.map((m) => dist(m, e)));
    const crowd = (e) => living(g, 1 - side).filter((o) => o !== e && edgeDist(o, e) <= 2 && visibility(g, e, o).visible);
    const t = living(g, 1 - side).filter((e) => e.side < 2).sort((a, b) => crowd(b).length - crowd(a).length || near(a) - near(b))[0];
    if (t) for (const e of [t, ...crowd(t)]) (e.suspect ||= [0, 0])[side] = g.tp;
    if (t) log(g, { zh: `懷疑與剷除：${opName(t, 'zh')} 和身邊 ${crowd(t).length} 名敵人得到懷疑標記`, en: `Suspect & Eliminate: ${opName(t, 'en')} and ${crowd(t).length} enemies by it gain Suspicion tokens` }, `side${side}`);
  }
}
