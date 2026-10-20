// Exaction Squad (強徵小隊): the roster check and the Attack Patterns (the team is in teams.js, its equipment in
// faction-equipment.js, the engine in game.js). Source: .monitor/kill-team/files/exaction-squad.pdf (June '26)
const B = (zh, en) => ({ zh, en });

/** R-VR Cyber-mastiff Attack Patterns: two are picked in the first turning point (R-VR Command changes one). */
export const EX_PATTERNS = {
  aggressive: { name: B('凶猛', 'Aggressive'), desc: B('近戰武器「毫不留情」。', 'Its melee weapons have Relentless.') },
  swift: { name: B('迅捷', 'Swift'), desc: B('移動 +2"。', '+2" Move.') },
  defensive: { name: B('防禦', 'Defensive'), desc: B('豁免改善 1。', 'Improve its Save stat by 1.') },
};

/** Ten picks: each once except Gunners (two at most, different options), Subductors (four at most) and Vigilants. */
export function exactionRosterError(t, roster = {}) {
  const ids = t.ops.filter((o) => o.count && o.id !== 'proctor').flatMap((o) => Array.from({ length: o.count }, (_, k) => (Array.isArray(roster[o.id]) ? roster[o.id][k] : roster[o.id]) || o.id));
  const T = (id) => t.ops.find((o) => o.id === id), bad = [];
  const dup = [...new Set(ids.filter((id, i) => !T(id).exRepeat && ids.indexOf(id) !== i))];
  if (dup.length) bad.push(B(`重複選了：${dup.map((id) => T(id).name.zh).join('、')}（只有鎮壓兵、警戒兵能重複；槍手每種武器一名）`, `Picked more than once: ${dup.map((id) => T(id).name.en).join(', ')} (only Subductors and Vigilants repeat; Gunners need different options)`));
  const gun = ids.filter((id) => T(id).exGunner).length, sub = ids.filter((id) => id === 'subductor').length;
  if (gun > 2) bad.push(B(`槍手 ${gun} 名，最多 2 名`, `${gun} Gunners — two at most`));
  if (sub > 4) bad.push(B(`鎮壓兵 ${sub} 名，最多 4 名`, `${sub} Subductors — four at most`));
  return bad.length ? B(bad.map((b) => b.zh).join('；'), bad.map((b) => b.en).join('; ')) : null;
}
