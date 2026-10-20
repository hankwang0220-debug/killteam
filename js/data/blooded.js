// Blooded (混沌叛軍): the roster check (the team is in teams.js, its equipment in faction-equipment.js, the engine in game.js).
// Source: .monitor/kill-team/files/blooded.pdf (errata April '26)
const B = (zh, en) => ({ zh, en });

/** Everyone a roster picks: the Chieftain and nine picks (one per copy), then the second-list selections. */
export function bloodedIds(t, roster = {}) {
  const slots = t.ops.filter((o) => o.count).flatMap((o) => Array.from({ length: o.count }, (_, k) => (Array.isArray(roster[o.id]) ? roster[o.id][k] : roster[o.id]) || o.id));
  return [...slots, ...Object.entries(t.packages).flatMap(([pid, pk]) => (pk.options[roster[pid]] || Object.values(pk.options)[0]).ops)];
}

/** Each once except Troopers; Gunners and the Sharpshooter three at most combined; only one plasma weapon. */
export function bloodedRosterError(t, roster = {}, loadouts = {}) {
  const ids = bloodedIds(t, roster), T = (id) => t.ops.find((o) => o.id === id), bad = [];
  const dup = [...new Set(ids.filter((id, i) => !T(id).blTrooper && ids.indexOf(id) !== i))];
  if (dup.length) bad.push(B(`重複選了：${dup.map((id) => T(id).name.zh).join('、')}（除了步兵，每種特工只能選一次）`, `Picked more than once: ${dup.map((id) => T(id).name.en).join(', ')} (each only once, except Troopers)`));
  const special = ids.filter((id) => T(id).blSpecial).length;
  if (special > 3) bad.push(B(`槍手與神射手合計 ${special} 名，最多 3 名`, `${special} Gunners / Sharpshooter — three at most combined`));
  if (ids.some((id) => T(id).blPlasma) && loadouts.chieftain === 'plasma+improvised') bad.push(B('電漿武器只能有一把（首領的電漿手槍或電漿槍手）', 'Only one plasma weapon (the Chieftain\'s plasma pistol or the plasma Gunner)'));
  return bad.length ? B(bad.map((b) => b.zh).join('；'), bad.map((b) => b.en).join('; ')) : null;
}
