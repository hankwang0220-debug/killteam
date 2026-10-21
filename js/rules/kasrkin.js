// kasrkin: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { TEAM_MAP } from '../data/teams.js';
import { hasPloy, living, log, moved, opName, radius, team, teamZh, tpl } from '../game.js';
import { dist } from '../geometry.js';

// ---------- Kasrkin ----------
export const SKILLS = {
  lightEmUp: { name: { zh: '點燃他們', en: 'Light \'Em Up' }, desc: { zh: '遠程武器「重創」。', en: 'Ranged weapons have Severe.' } },
  forCadia: { name: { zh: '為了卡迪亞！', en: 'For Cadia!' }, desc: { zh: '近戰武器 Atk +1（最多 4）；近戰時第一次打擊 +1 傷害。', en: 'Melee weapons +1 Atk (max 4); the first strike when fighting deals 1 more.' } },
  strikeFast: { name: { zh: '快速打擊', en: 'Strike Fast' }, desc: { zh: '移動（Reposition）時 Move +1"。', en: '+1" Move when repositioning.' } },
  iceInVeins: { name: { zh: '冷血', en: 'Ice In Your Veins' }, desc: { zh: '近戰、反擊或被射擊時，每次第一顆 3 以上的普通傷害 -1。', en: 'Fighting, retaliating or being shot: the first attack die inflicting 3+ Normal Dmg each sequence deals 1 less.' } },
};
/** Skill at Arms in effect for this operative (the team's, plus one from Tactical Command). */
export const skillOn = (g, op, id) => op.side < 2 && TEAM_MAP[op.team].skillAtArms && (((g.skills?.[op.side]?.tp === g.tp) && g.skills[op.side].ids.includes(id)) || (op.skillExtra?.tp === g.tp && op.skillExtra.id === id));
/** How many Skills at Arms the side picks this turning point (two while its Sergeant is in the killzone). */
export const skillSlots = (g, side) => (living(g, side).some((o) => tpl(o).veteranLeadership) ? 2 : 1);
/** Strategic gambit: the Skills at Arms for this turning point. */
export function setSkills(g, side, ids) {
  const pick = [...new Set(ids.filter((id) => SKILLS[id]))].slice(0, skillSlots(g, side));
  (g.skills ||= [null, null])[side] = { tp: g.tp, ids: pick };
  log(g, { zh: `${teamZh(g, side)} 戰技：${pick.map((id) => SKILLS[id].name.zh).join('、') || '無'}`, en: `${team(g, side).name.en} Skill at Arms: ${pick.map((id) => SKILLS[id].name.en).join(', ') || 'none'}` }, `side${side}`);
}
/** End of a side's Strategy phase: pick Skills at Arms if the player didn't; place the Clearance Sweep marker by the frontmost enemy. */
export function skillsStrategyEnd(g, side) {
  if (!TEAM_MAP[g.teams[side]].skillAtArms) return;
  if (g.skills?.[side]?.tp !== g.tp) setSkills(g, side, ['lightEmUp', 'iceInVeins']);
  if (hasPloy(g, side, 'clearanceSweep') && g.sweep?.[side]?.tp !== g.tp) {
    const mine = living(g, side), cx = mine.reduce((s, o) => s + o.x, 0) / (mine.length || 1), cy = mine.reduce((s, o) => s + o.y, 0) / (mine.length || 1);
    const e = living(g, 1 - side).sort((a, b) => dist(a, { x: cx, y: cy }) - dist(b, { x: cx, y: cy }))[0];
    if (e) { (g.sweep ||= [null, null])[side] = { tp: g.tp, x: e.x, y: e.y }; log(g, { zh: `清掃標記放在 ${opName(e, 'zh')} 處（5" 範圍）`, en: `Clearance Sweep marker placed by ${opName(e, 'en')} (5" area)` }, `side${side}`); }
  }
}
/** Rapid Fire weapons: bolt pistol, hot-shot lasgun, hot-shot laspistol. */
export const rapidWeapon = (w) => !!w && (!!w.rules.rapid || /^bolt pistol$/i.test(w.name.en));
export const rapidOK = (op) => TEAM_MAP[op.team].rapidFire && !moved(op);
/** Clearance Sweep (ploy): the marker's 5" area. */
export const sweepOn = (g, op, target) => { const m = g.sweep?.[op.side]; return !!(m && m.tp === g.tp && target && dist(op, m) - radius(op) <= 5 && dist(target, m) - radius(target) <= 5); };
export const adaptiveOk = (g, op, k) => !!tpl(op).adaptive && g.adaptive?.[op.side]?.[k] !== g.tp;
