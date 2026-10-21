// warpcoven: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { ACTIONS, CHOICES, abilityArmed, canActivateOp, contagion, d6, edgeDist, getOp, injuredPenalty, living, log, needChoice, nullRodded, opName, radius, rolls, spend, statPenalty, tally, territoryOf, tpl, visibility, weaponsFor } from '../game.js';
import { WC_BOONS, WC_BOON_DEFAULT } from '../data/warpcoven.js';
import { MISSION_ACTIONS } from '../missions.js';
import { dist } from '../geometry.js';
import { moveCtx } from '../path.js';
import { cultIgnoresInjury, nightmareNear } from './chaoscult.js';
import { apprehended } from './exaction.js';
import { doctrinaHit, radSaturated } from './hunterclade.js';
import { nullFielded } from './insidiants.js';

/** Breach Point (a Breach marker on terrain in control range: parts no more than 1" thick within 1" of it are Accessible), Weld Shut, Command Breach swap. */
/** Warpcoven self actions: Brayhorn, Immaterial Flight, Echoes from the Warp, Sorcerous Scrolls. */
export function wcSelf(g, op, id) {
  if (id === 'wcBrayhorn') {
    spend(g, op, id); (g.wcHorn ||= [false, false])[op.side] = true;
    log(g, { zh: `${opName(op, 'zh')} 吹響號角：友方奸奇獸人移動 +1"，直到下個策略階段的準備步驟`, en: `${opName(op, 'en')} Brayhorn: friendly Tzaangor have +1" Move until the next Strategy phase's Ready step` }, `side${op.side}`);
    return true;
  }
  if (id === 'wcFlight') {
    spend(g, op, id); op.acted.wcFly = true; (g.wcFlyTP ||= {})[op.uid] = g.tp;
    log(g, { zh: `${opName(op, 'zh')} 非物質飛行：這次啟動下一個轉移或衝鋒用飛行`, en: `${opName(op, 'en')} Immaterial Flight: its next Reposition or Charge this activation is a FLY move` }, `side${op.side}`);
    return true;
  }
  if (id === 'wcEchoes') {
    spend(g, op, id); op.acted.wcEchoes = true; (g.wcEchoUsed ||= [false, false])[op.side] = true;
    op.ap += 1; op.orderSet = false;
    log(g, { zh: `${opName(op, 'zh')} 亞空間回聲：可改變指令，並多做一個免費的 1AP 動作`, en: `${opName(op, 'en')} Echoes from the Warp: it can change its order and perform an additional free 1AP action` }, `side${op.side}`);
    return true;
  }
  if (id === 'wcScrolls') { needChoice(g, op.side, 'wcScrolls', { uid: op.uid }); return true; }
  return false;
}
// ---------- Warpcoven ----------
/** A psychic effect (Protected by Fate, Ravage Destiny, Alight) one side has on an operative: {by, uid}. */
export const psy = (g, key, side) => g[key]?.[side] || null;
export const psyOn = (g, key, side, op) => { const p = psy(g, key, side); return !!(p && op && p.uid === op.uid && !getOp(g, p.by)?.dead); };
/** Boons of Tzeentch: each Sorcerer's boon for the battle (Sorcerous Scrolls can change it later). */
export function wcSetup(g, roster) {
  for (const o of g.ops) if (o.team === 'warpcoven' && tpl(o).sorcerer) o.boon = roster[o.side]?.[`boon_${o.tplId}`] || WC_BOON_DEFAULT[o.tplId];
}
export const wcBoon = (op, id) => !!op && op.team === 'warpcoven' && op.boon === id;
export const wcEquip = (g, op, id) => !!op && op.side < 2 && op.team === 'warpcoven' && !!g.equip?.[op.side]?.includes(id);
/** Master of the Immaterium: +3" to the distances of its PSYCHIC actions. */
export const wcReach = (op, d) => d + (wcBoon(op, 'master') ? 3 : 0);
/** Nothing done yet this activation (for ploys used "when activated"). */
export const wcFresh = (op) => !op.counter && !Object.keys(op.acted || {}).some((k) => !['unseen', 'accelerant', 'free'].includes(k));
/** Herd Banner (Tzaangor Icon Bearer): Normal Dmg of 3+ on a friendly Tzaangor visible within 3" of it deals 1 less. */
export const wcBanner = (g, op, amount) => (amount >= 3 && op.side < 2 && tpl(op).tzaangor && op.team === 'warpcoven'
  && living(g, op.side).some((b) => tpl(b).herdBanner && edgeDist(b, op) <= 3 && (b === op || visibility(g, b, op).visible)) ? amount - 1 : amount);
/** Arcane Robes: once per turning point for each Sorcerer, one attack dice's Critical Dmg becomes Normal Dmg. */
export function wcRobes(g, op) {
  if (!tpl(op).sorcerer || !wcEquip(g, op, 'wcRobes') || !abilityArmed(g, op.side, 'wcRobes') || (g.wcRobes ||= {})[op.uid] === g.tp) return false;
  g.wcRobes[op.uid] = g.tp;
  log(g, { zh: `秘法長袍：${opName(op, 'zh')} 一個暴擊傷害改為普通傷害`, en: `Arcane Robes: one Critical Dmg on ${opName(op, 'en')} becomes Normal Dmg` }, `side${op.side}`);
  return true;
}
// Pick Up Marker, Place Marker and mission actions for 1 less AP: Mutant Appendage (once per activation), Relic Hunters
// (Tzaangor Warriors, once per battle, in the opponent's territory).
export const wcMarkerAct = (id) => id === 'pickUp' || id === 'placeMarker' || !!MISSION_ACTIONS[id];
export const wcAppendage = (op, id) => wcMarkerAct(id) && wcBoon(op, 'appendage') && !op.acted?.wcAppendUsed;
export const wcRelic = (g, op, id) => wcMarkerAct(id) && !!tpl(op).relicHunters && op.side < 2 && !g.wcRelic?.[op.side] && territoryOf(g, op) !== op.side;
export const wcMarkerDiscount = (g, op, id) => (wcAppendage(op, id) ? 1 : 0) + (wcRelic(g, op, id) ? 1 : 0);
export function wcMarkerSpent(g, op, id) {
  if (wcAppendage(op, id)) op.acted.wcAppendUsed = true;
  if (wcRelic(g, op, id)) { (g.wcRelic ||= [false, false])[op.side] = true; log(g, { zh: `遺物獵人：${opName(op, 'zh')} 少花 1AP（整場一次）`, en: `Relic Hunters: ${opName(op, 'en')} pays 1 less AP (once per battle)` }, `side${op.side}`); }
}
/** Brayhorn (Tzaangor Horn Bearer): +1" Move for friendly Tzaangor until the next Ready step. */
export const wcHorn = (g, op) => (tpl(op).tzaangor && op.team === 'warpcoven' && g.wcHorn?.[op.side] ? 1 : 0);
/** Immaterial Flight: this activation's next Reposition or Charge is a FLY move (Move only for a Charge). */
export const wcFlying = (op, kind) => !!op.acted?.wcFly && (kind === 'reposition' || kind === 'charge');
/** Temporal Flux: {x, y, uid, live} — armed when its operative's next activation begins. */
export const wcFluxOf = (g, side) => g.wcFlux?.[side] || null;
export function wcFluxActivate(g, op) { const f = wcFluxOf(g, op.side); if (f && f.uid === op.uid && !g.counter) f.live = true; }
export function wcFluxEnd(g, op) {
  const f = wcFluxOf(g, op.side);
  if (!f || f.uid !== op.uid || !f.live) return;
  g.wcFlux[op.side] = null;
  if (op.dead || dist(op, f) + radius(op) > 6 + 0.01 || nullRodded(g, op)) { log(g, { zh: '時間通量：不在標記 6" 內，標記移除', en: 'Temporal Flux: not wholly within 6" of the marker — the marker is removed' }, `side${op.side}`); return; }
  const ctx = moveCtx(g, op, 'reposition');
  for (let ring = 0; ring <= 4; ring += 0.25) {
    for (let a = 0; a < (ring ? 24 : 1); a++) {
      const p = { x: f.x + Math.cos(a * Math.PI / 12) * ring, y: f.y + Math.sin(a * Math.PI / 12) * ring };
      if (!ctx.placement(p).ok || ctx.inEnemyER(p)) continue;
      op.x = p.x; op.y = p.y;
      log(g, { zh: `時間通量：${opName(op, 'zh')} 回到標記的位置`, en: `Temporal Flux: ${opName(op, 'en')} is set back up at the marker` }, `side${op.side}`);
      return;
    }
  }
}
/** Fate Itself Is My Weapon: two reserved D6 (both usable when they totalled 9 or more). */
export function wcFateBuy(g, side) {
  const dice = [d6(), d6()], pair = dice[0] + dice[1] >= 9;
  (g.wcFate ||= [null, null])[side] = { tp: g.tp, dice, pair };
  log(g, { zh: `命運即我之刃：保留 ${dice.join('、')}${pair ? '（兩顆都能用）' : '（只能用一顆）'}`, en: `Fate Itself Is My Weapon: reserved ${dice.join(', ')}${pair ? ' (both usable)' : ' (only one usable)'}` }, `side${side}`);
}
/** After attack dice are rolled: a reserved dice replaces one of them where that helps its owner most (one per sequence). */
export function wcFateRoll(g, rolls) {
  for (const s of [0, 1]) {
    const f = g.wcFate?.[s];
    if (!f || f.tp !== g.tp || !f.dice.length || !abilityArmed(g, s, 'wcFate')) continue;
    let best = null;
    for (const [o, pool] of rolls) {
      if (!o || !pool || pool.rules?.soulstrikeDef) continue;
      const res = (v) => (v >= pool.success ? (v >= pool.critOn ? 2 : 1) : 0);
      for (let i = 0; i < f.dice.length; i++) for (const d of pool.dice) {
        if (d.auto || d.locked) continue;
        const cur = d.res === 'crit' ? 2 : d.res === 'norm' ? 1 : 0, gain = o.side === s ? res(f.dice[i]) - cur : cur - res(f.dice[i]);
        if (gain > 0 && (!best || gain > best.gain)) best = { gain, d, i, pool, o };
      }
    }
    if (!best) continue;
    const old = best.d.v, v = f.dice[best.i];
    best.d.v = v; best.d.rr = true; best.d.locked = true;
    f.dice.splice(best.i, 1);
    if (!f.pair) f.dice = [];
    tally(best.pool);
    log(g, { zh: `命運即我之刃：${opName(best.o, 'zh')} 的一顆 ${old} 換成保留的 ${v}`, en: `Fate Itself Is My Weapon: one of ${opName(best.o, 'en')}'s ${old}s becomes the reserved ${v}` }, `side${s}`);
  }
}
/** Psychic Cabal: what another friendly Sorcerer visible within 9" can lend (PSYCHIC unique actions; PSYCHIC ranged weapons it hasn't used this TP). */
export const WC_PSY_ACTIONS = { destiny: ['fate', 'ravage'], warpfire: ['alight'], tempyrion: ['wcRecon', 'wcFlux'] };
export function wcCabalOptions(g, op) {
  const out = [], mine = weaponsFor(g, op).map((w) => w.id);
  for (const s of living(g, op.side)) {
    if (s === op || !tpl(s).sorcerer || s.team !== 'warpcoven' || edgeDist(s, op) > 9 || !visibility(g, op, s).visible) continue;
    for (const id of WC_PSY_ACTIONS[s.tplId] || []) if (!(WC_PSY_ACTIONS[op.tplId] || []).includes(id)) out.push({ value: `${s.uid}|a|${id}`, label: { zh: `${opName(s, 'zh')}：${ACTIONS[id].name.zh}`, en: `${opName(s, 'en')}: ${ACTIONS[id].name.en}` } });
    for (const w of weaponsFor(g, s)) if (w.type === 'ranged' && w.rules.psychic && s.wcPsyUsed?.[w.id] !== g.tp && !mine.includes(w.id)) out.push({ value: `${s.uid}|w|${w.id}`, label: { zh: `${opName(s, 'zh')}：${w.name.zh}`, en: `${opName(s, 'en')}: ${w.name.en}` } });
  }
  return out;
}
export function wcCabalApply(g, op, value) {
  const [from, kind, id] = value.split('|'), s = getOp(g, from);
  let nm = ACTIONS[id]?.name;
  if (kind === 'w') {
    const w = weaponsFor(g, s).find((x) => x.id === id);
    if (!w) return;
    nm = w.name;
    op.acted.cabal = { from, kind, id, weapon: w };
    (g.wcCabalBan ||= {})[from] = { tp: g.tp, id };
  } else op.acted.cabal = { from, kind, id };
  log(g, { zh: `靈能秘會：${opName(op, 'zh')} 借用 ${opName(s, 'zh')} 的「${nm.zh}」`, en: `Psychic Cabal: ${opName(op, 'en')} borrows ${opName(s, 'en')}'s ${nm.en}` }, `side${op.side}`);
}
/** Warpcoven weapons: Warp Swell (+1 melee Normal Dmg), a weapon borrowed through Psychic Cabal, or one lent out this TP. */
export function wcWeapons(g, op, ws) {
  if (op.team !== 'warpcoven') return ws;
  const ban = g.wcCabalBan?.[op.uid];
  if (ban && ban.tp === g.tp) ws = ws.filter((w) => w.id !== ban.id);
  if (op.acted?.cabal?.kind === 'w' && !ws.some((w) => w.id === op.acted.cabal.id)) ws = [...ws, op.acted.cabal.weapon];
  if (wcBoon(op, 'warpSwell')) ws = ws.map((w) => (w.type === 'melee' ? { ...w, dmg: [w.dmg[0] + 1, w.dmg[1]] } : w));
  return ws;
}
/** Mutant Herd: other ready friendly Tzaangor visible within 2". */
export const wcHerdMates = (g, op) => living(g, op.side).filter((o) => o !== op && tpl(o).tzaangor && o.team === 'warpcoven' && canActivateOp(g, o) && edgeDist(o, op) <= 2 && visibility(g, op, o).visible);
/** Sorcerous Scrolls: the boons a Sorcerer could change to (not its own, not another friendly's). */
export const wcScrollBoons = (g, op) => Object.keys(WC_BOONS).filter((b) => b !== op.boon && !living(g, op.side).some((o) => o !== op && o.boon === b));
export function registerWarpcovenChoices() {
  const B = (zh, en) => ({ zh, en });
  CHOICES.wcHerd = {
    kind: 'op', title: B('變種獸群：選一名一起啟動的奸奇獸人', 'Mutant Herd: pick the Tzaangor that activates with it'),
    options: (g, side, ctx) => wcHerdMates(g, getOp(g, ctx.uid)).map((o) => ({ value: o.uid })),
    auto: (g, side, ctx) => { const o = getOp(g, ctx.uid); return wcHerdMates(g, o).sort((a, b) => edgeDist(a, o) - edgeDist(b, o))[0]?.uid ?? null; },
    apply(g, side, uid, ctx) { getOp(g, ctx.uid).wcHerd = uid; log(g, { zh: `變種獸群：${opName(getOp(g, uid), 'zh')} 接著啟動`, en: `Mutant Herd: ${opName(getOp(g, uid), 'en')} activates next` }, `side${side}`); },
  };
  CHOICES.wcCabal = {
    kind: 'option', title: B('靈能秘會：借用哪個靈能動作或武器？', 'Psychic Cabal: borrow which PSYCHIC action or weapon?'),
    options: (g, side, ctx) => wcCabalOptions(g, getOp(g, ctx.uid)),
    auto: (g, side, ctx) => { const o = wcCabalOptions(g, getOp(g, ctx.uid)); return (o.find((x) => x.value.includes('|w|')) || o[0])?.value ?? null; },
    apply: (g, side, v, ctx) => wcCabalApply(g, getOp(g, ctx.uid), v),
  };
  CHOICES.wcScrolls = {
    kind: 'option', title: B('巫術卷軸：換成哪個奸奇恩賜（整場一次）？', 'Sorcerous Scrolls: change to which Boon of Tzeentch (once per battle)?'),
    options: (g, side, ctx) => wcScrollBoons(g, getOp(g, ctx.uid)).map((b) => ({ value: b, label: WC_BOONS[b].name })),
    auto: () => null, none: () => {}, skippable: true,
    apply(g, side, b, ctx) {
      const o = getOp(g, ctx.uid);
      o.boon = b; (g.wcScrolls ||= [false, false])[side] = true;
      log(g, { zh: `巫術卷軸：${opName(o, 'zh')} 的恩賜改為「${WC_BOONS[b].name.zh}」`, en: `Sorcerous Scrolls: ${opName(o, 'en')}'s boon is now ${WC_BOONS[b].name.en}` }, `side${side}`);
    },
  };
}
/** Mindburn: the target's weapons' Hit is worsened by 1 (not cumulative with injured). */
export const mindburned = (g, op) => [0, 1].some((s) => s !== op.side && g.mindburn?.[s] === op.uid);
// Apprehend (Cyber-mastiff) worsens it the same way. Engendered Focus (Castigator) ignores it all;
// Stubborn Subjugator (Subductor) ignores it for melee weapons.
export const hitWorse = (g, op, w = null) => !op.acted?.emperorsWill && !w?.rules.fixedHit && !tpl(op).engenderedFocus && !(w?.type === 'melee' && tpl(op).stubbornSubjugator)
  && ((statPenalty(g, op) && !(op.acted?.ancestors && injuredPenalty(g, op) && !contagion(g, op)) && !cultIgnoresInjury(g, op, w) && !op.xvBondHit) || mindburned(g, op) || apprehended(g, op) || radSaturated(g, op) || doctrinaHit(g, op, w)
    || nullFielded(g, op) || nightmareNear(g, op, 'sickeningAura')); // Null Field (Censor), Sickening Aura (Chaos Cult)
