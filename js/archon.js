import { ARCHON_EQUIPMENT } from './data/eldar.js';
export { ARCHON_EQUIPMENT };
// Hand of the Archon, January 2026 official datacards. Reactions use the
// simulator's existing automatic-reaction convention; active choices stay manual.
import { tpl, living, foes, edgeDist, visibility, isEngaged, isInjured, getOp, activeOp, aplNow, d6, applyDamage, log, opName, hasPloy } from './game.js';

export const isArchon = (o) => o?.team === 'handOfArchon';
const D3 = () => Math.ceil(d6() / 2);
const say = (g, o, zh, en) => log(g, { zh: `${opName(o, 'zh')}：${zh}`, en: `${opName(o, 'en')}: ${en}` }, `side${o.side}`);

export const archonEquip = (g, o, id) => isArchon(o) && g.equip?.[o.side]?.includes(id);
export function gainPain(g, o, n = 1) {
  if (!isArchon(o) || o.dead) return;
  o.pain = (o.pain || 0) + n;
  say(g, o, `獲得 ${n} 痛苦代幣（共 ${o.pain}）`, `gains ${n} Pain token(s), ${o.pain} total`);
  if (g.sadisticTP?.[o.side] !== g.tp) {
    const a = living(g, o.side).find((x) => tpl(x).sadisticCompetition && !x.pain);
    if (a) { (g.sadisticTP ||= [0, 0])[o.side] = g.tp; a.pain = 1; say(g, a, '虐待競賽：獲得 1 痛苦代幣', 'Sadistic Competition: gains 1 Pain token'); }
  }
}
export function setupArchon(g, loadouts = []) {
  for (const s of [0, 1]) {
    const os = living(g, s).filter(isArchon);
    if (!os.length) continue;
    const tm = tpl(os[0]);
    const selected = loadouts[s] || {};
    const choices = { haLeader: selected.haLeader || 'splinterAgoniser', haGunner: selected.haGunner || 'blaster', haHeavy: selected.haHeavy || 'darkLance' };
    const dark = (choices.haLeader === 'blastVenom' ? 1 : 0) + (choices.haGunner === 'blaster' ? 1 : 0) + (choices.haHeavy === 'darkLance' ? 1 : 0);
    if (dark > 2) throw new Error('Hand of the Archon can carry at most two darklight weapons');
    for (const o of os) {
      if (tpl(o).loadouts) {
        if (!tpl(o).loadouts[choices[o.tplId]]) throw new Error('Invalid Hand of the Archon loadout');
        o.loadout = choices[o.tplId];
      }
      o.drug = g.tactics[s]?.[0] || 'adrenalight'; o.pain = 0;
    }
    // Omen can be changed during deployment; defaults to the heavy gunner.
    (g.omen ||= [null, null])[s] = os.find((o) => o.tplId === 'haHeavy').uid;
  }
}
export function archonWeapons(o) { return tpl(o).loadouts?.[o.loadout] || tpl(o).weapons; }
export function setOmen(g, s, uid) {
  const t = getOp(g, uid);
  if (g.phase !== 'deploy' || !living(g, s).some((o) => tpl(o).omen) || !t || t.dead || (t.side === s && tpl(t).omen)) return false;
  g.omen[s] = uid; return true;
}
export function archonReady(g) {
  for (const s of [0, 1]) {
    const os = living(g, s).filter(isArchon);
    const t = os.filter((o) => o.drug === 'adrenalight').sort((a, b) => (a.pain || 0) - (b.pain || 0) || (b.tplId === 'haHeavy') - (a.tplId === 'haHeavy'))[0];
    if (t) gainPain(g, t);
  }
}
export function archonActivate(g, o) {
  if (!o.counter) o.darkAnimus = false;
  if (isArchon(o) && hasPloy(g, o.side, 'fromDarknessDeath') && !o.counter) {
    o.darknessTargets = foes(g, o).filter((e) => !visibility(g, e, o).visible || (o.order === 'conceal' && visibility(g, e, o).cover)).map((e) => e.uid);
    o.acted.darknessTarget = o.darknessTargets[0] || null;
  }
  if (!o.counter && o.archonPoison && !o.dead) {
    const dmg = D3(); say(g, o, `折磨毒素：受到 ${dmg} 傷害`, `Torment poison: ${dmg} damage`); applyDamage(g, getOp(g, o.archonPoison), o, dmg);
    o.acted.poisonTick = true;
  }
}
export function archonRules(g, o, w, target, r) {
  for (const s of [0, 1]) if (g.omen?.[s] === o.uid && living(g, s).some((x) => tpl(x).omen)) {
    if (o.side === s) r.ceaseless = true; else r.reroll6 = true;
  }
  if (!isArchon(o)) return;
  if (w.id === 'haSplinterRifle' && !['charge', 'fallBack', 'reposition'].some((k) => o.acted?.[k])) r.accurate = Math.max(1, r.accurate || 0);
  if (w.type === 'melee' && hasPloy(g, o.side, 'bladeArtists')) r.rending = true;
  if (target && target.wounds < target.maxW && hasPloy(g, o.side, 'mercilessSadists')) r.balanced = true;
  if (target && o.acted?.darknessTarget === target.uid && !o.acted.darknessUsed) r.promote = Math.max(1, r.promote || 0);
  if (target && o.archonMark?.tp === g.tp && o.archonMark.uid === target.uid && w.type === 'ranged') r.seekLight = true;
  if (archonEquip(g, o, 'wickedBlades') && w.id === 'haBlades') { r.atkPlus = (r.atkPlus || 0) + 1; r.atkMax = 99; }
  if (o.acted?.toxinSequence && w.type === 'melee') r.lethal = Math.min(5, r.lethal || 6);
}
export function archonDefence(g, o, from, r) {
  archonRules(g, o, { id: '', type: 'defence' }, null, r);
  if (isArchon(o) && hasPloy(g, o.side, 'denizensNight') && !foes(g, o).some((e) => edgeDist(o, e) <= 2) && visibility(g, from, o).cover) r.balanced = true;
}
export function archonBeforeAttack(g, o, kind) {
  if (!isArchon(o)) return;
  if (g.active === o.uid && !o.counter && tpl(o).torturousVision && !o.pain && !o.acted.torturousVision) { o.acted.torturousVision = true; gainPain(g, o); }
  const key = kind === 'fight' ? 'toxinCoating' : 'refinedPoison';
  if (archonEquip(g, o, key)) {
    if (g.archonEq?.[o.side]?.tp !== g.tp) (g.archonEq ||= [{}, {}])[o.side] = { tp: g.tp };
    if ((g.archonEq[o.side][key] || 0) < 2) { g.archonEq[o.side][key] = (g.archonEq[o.side][key] || 0) + 1; o.acted[kind === 'fight' ? 'toxinSequence' : 'refinedSequence'] = true; }
  }
}
export const painSnapshot = (g) => g.ops.map((o) => ({ uid: o.uid, injured: isInjured(o), dead: o.dead }));
export function archonAfterAction(g, o, before) {
  if (!isArchon(o) || o.dead) return;
  const victims = before.map((v) => ({ v, t: getOp(g, v.uid) })).filter(({ v, t }) => !v.dead && t.side !== o.side);
  const kills = victims.filter(({ t }) => t.dead);
  const injured = victims.some(({ v, t }) => !t.dead && !v.injured && isInjured(t));
  const n = (injured ? 1 : 0) + (kills.length ? kills.some(({ t }) => t.maxW >= 12) ? 2 : 1 : 0);
  if (n) gainPain(g, o, n);
  if (kills.length) o.acted.painSurge = true;
  o.acted.toxinSequence = false; o.acted.refinedSequence = false;
}
export function archonDeath(g, src, target) {
  if (src && tpl(src).brutalDisplay && src.brutalDisplayTP !== g.tp && edgeDist(src, target) <= 1) {
    const t = foes(g, src).filter((e) => (edgeDist(src, e) <= 6 && visibility(g, src, e).visible) || (edgeDist(target, e) <= 6 && visibility(g, target, e).visible)).sort((a, b) => tpl(b).apl - tpl(a).apl)[0];
    if (t) { src.brutalDisplayTP = g.tp; t.brutalDisplayTP = g.tp; say(g, t, '殘酷展示：本回合不能控制標記或執行任務動作', 'Brutal Display: cannot control markers or perform mission actions this TP'); }
  }
}
export function stingerBurst(g, src, target) {
  const queue = [target], seen = new Set();
  while (queue.length) {
    const t = queue.shift(); if (seen.has(t.uid)) continue; seen.add(t.uid);
    const near = living(g).filter((o) => o !== t && edgeDist(o, t) <= 2 && visibility(g, t, o).visible);
    for (const o of near) { const dmg = D3(); say(g, o, `毒刺爆裂：${dmg} 傷害`, `Stinger burst: ${dmg} damage`); if (applyDamage(g, src, o, dmg)) queue.push(o); }
  }
}
export function chainSnare(g, o) {
  for (const e of foes(g, o).filter((x) => archonEquip(g, x, 'chainSnare') && edgeDist(x, o) <= 1 && g.snareTP?.[x.side] !== g.tp)) {
    if (foes(g, e).filter((x) => edgeDist(e, x) <= 1).length !== 1) continue;
    const rs = Array.from({ length: o.maxW > e.maxW ? 1 : 2 }, d6);
    say(g, e, `鏈索陷阱：${rs.join(', ')}`, `Chain Snare: ${rs.join(', ')}`);
    if (rs.some((r) => r >= 4)) { (g.snareTP ||= [0, 0])[e.side] = g.tp; o.acted.fallBackDenied = true; return true; }
  }
  return false;
}
export const PAIN_NAMES = {
  darkAnimus: { zh: '黑暗靈力：APL +1', en: 'Dark Animus: +1 APL' },
  painHeal: { zh: '加速復甦：回復 D3+1', en: 'Accelerated Rejuvenation: heal D3+1' },
  painSurge: { zh: '活力湧動：免費衝刺', en: 'Vitalised Surge: free Dash' },
};
export function painOptions(g, o) {
  if (!isArchon(o) || !o.pain || o.dead || activeOp(g) !== o || g.fight && !g.fight.done || o.acted.painInvigoration) return [];
  return Object.keys(PAIN_NAMES).filter((id) => id === 'darkAnimus' ? !o.counter && aplNow(g, o) < tpl(o).apl + 1 : id === 'painHeal' ? o.wounds < o.maxW : !!o.acted.painSurge && !isEngaged(g, o));
}
export function usePain(g, o, id) {
  if (!painOptions(g, o).includes(id)) return false;
  o.pain--; o.acted.painInvigoration = true; o.orderSet = true;
  if (id === 'darkAnimus') { const prev = aplNow(g, o); o.aplNext = (o.aplNext || 0) + 1; o.ap += aplNow(g, o) - prev; o.darkAnimus = true; o.aplKeep = true; }
  if (id === 'painHeal') o.wounds = Math.min(o.maxW, o.wounds + D3() + 1);
  if (id === 'painSurge') o.acted.free = { ...o.acted.free, dash: 'capricious' };
  say(g, o, PAIN_NAMES[id].zh, PAIN_NAMES[id].en); return true;
}
export function painRerollValues(g, o, holder, which) {
  const key = `${g.tp}:${g.active}:${(g.actCount || []).join(',')}:${!!g.counter}`;
  if (!isArchon(o) || o.dead || !o.pain || o.painSensesKey === key || holder.noReroll?.[which]) return [];
  return [...new Set((holder[which]?.dice || []).filter((d) => !d.auto && !d.rr).map((d) => d.v))];
}
export function painReroll(g, o, holder, which, value, tally) {
  if (!painRerollValues(g, o, holder, which).includes(value)) return false;
  o.pain--; o.painSensesKey = `${g.tp}:${g.active}:${(g.actCount || []).join(',')}:${!!g.counter}`;
  for (const d of holder[which].dice) if (!d.auto && !d.rr && d.v === value) { d.v = d6(); d.rr = true; }
  tally(holder[which]); return true;
}
export function aiPain(g, o, holder, which, tally) {
  const vals = painRerollValues(g, o, holder, which);
  const v = vals.sort((a, b) => holder[which].dice.filter((d) => d.v === b && d.res === 'miss').length - holder[which].dice.filter((d) => d.v === a && d.res === 'miss').length)[0];
  if (v && holder[which].dice.some((d) => d.v === v && d.res === 'miss')) painReroll(g, o, holder, which, v, tally);
}
