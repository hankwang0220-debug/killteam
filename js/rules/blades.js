// blades: team rules moved out of game.js (the engine hooks that call these stay in game.js).
import { TEAM_MAP } from '../data/teams.js';
import { ACTIONS, autoFF, avgDmg, bestMelee, count, edgeDist, foes, hasPloy, isEngaged, living, log, opName, team, teamZh, tpl, visibility, weaponsFor } from '../game.js';
import { dist } from '../geometry.js';


// ---------- Blades of Khaine ----------
export const CATAPULTS = ['bkCatapult', 'bkTwinCatapult'];
export const isBlade = (op) => !!TEAM_MAP[op.team]?.bladesOfKhaine;
/** Shimmershield (Dire Avenger Exarch with that option): a friendly visible within 2" of it ignores Piercing when shot. */
export const shimmered = (g, target) => isBlade(target) && living(g, target.side).some((o) => tpl(o).shimmershield && ['direShield', 'powerShield'].includes(o.loadout)
  && (o === target || (edgeDist(o, target) <= 2 && visibility(g, o, target).visible)));
/** After a Fight in which a Blade incapacitated its enemy during its own activation: Strike and Fade, else The Woe. */
export function bladesAfterFight(g, a, d) {
  if (!isBlade(a) || a.dead || !d.dead || g.active !== a.uid) return;
  if (!foes(g, a).some((e) => edgeDist(e, a) <= 3) && autoFF(g, a.side, 'ssFade', a)) {
    a.order = 'conceal';
    a.acted.free = { ...(a.acted.free || {}), dash: 'fade' };
    log(g, { zh: `${opName(a, 'zh')} 打擊後隱沒：改為隱蔽指令，可以免費衝刺一次`, en: `${opName(a, 'en')} Strike and Fade: switches to Conceal and may Dash for free` }, `side${a.side}`);
    return;
  }
  // The Woe: it Charged, then Fought — nothing else — and isn't in an enemy's control range now.
  const others = Object.keys(a.acted).some((k) => ACTIONS[k] && a.acted[k] && k !== 'charge' && k !== 'fight');
  if (count(a, 'charge') === 1 && !others && (a.acted.woeLeft || 0) >= 0.5 && !isEngaged(g, a) && autoFF(g, a.side, 'hbWoe', a)) {
    a.acted.free = { ...(a.acted.free || {}), charge: 'woe' };
    log(g, { zh: `${opName(a, 'zh')} 悲嘆：用剩下的 ${a.acted.woeLeft.toFixed(1)}" 免費再衝鋒一次`, en: `${opName(a, 'en')} The Woe: a free Charge with the remaining ${a.acted.woeLeft.toFixed(1)}"` }, `side${a.side}`);
  }
}
/** Dance of Death (strategy ploy, automatic): the better fighter further from the enemy swaps with a friendly in front. */
export function danceOfDeath(g, side) {
  if (!TEAM_MAP[g.teams[side]].bladesOfKhaine || !hasPloy(g, side, 'danceOfDeath') || g.danceTP?.[side] === g.tp) return;
  (g.danceTP ||= [0, 0])[side] = g.tp;
  const mine = living(g, side), enemies = living(g, 1 - side);
  if (!enemies.length) return;
  const near = (o) => Math.min(...enemies.map((e) => dist(o, e)));
  const melee = (o) => avgDmg(bestMelee(o)) - Math.max(0, ...weaponsFor(g, o).filter((w) => w.type === 'ranged').map((w) => avgDmg(w)));
  let best = null;
  for (const a of mine) for (const b of mine) {
    if (a === b || edgeDist(a, b) > 6 || !visibility(g, a, b).visible) continue;
    const gain = (near(a) - near(b)) * (melee(a) - melee(b)); // a: the fighter at the back, b: the one in front
    if (gain > 1 && (!best || gain > best.gain)) best = { a, b, gain };
  }
  if (!best) return;
  const { a, b } = best;
  [a.x, a.y, b.x, b.y] = [b.x, b.y, a.x, a.y];
  log(g, { zh: `${teamZh(g, side)} 死亡之舞：${opName(a, 'zh')} 與 ${opName(b, 'zh')} 交換位置`, en: `${team(g, side).name.en} Dance of Death: ${opName(a, 'en')} and ${opName(b, 'en')} swap places` }, `side${side}`);
}
