// Wyrmblade (蟲刃): faction equipment and the roster check (the team itself is in teams.js; the engine is in game.js).
// Source: https://assets.warhammer-community.com/eng_17-12_killteam_wyrmblade_online_rules-nzx8yswdj0-9lcmzodiqo.pdf (errata November '25)
const B = (zh, en) => ({ zh, en });

export const WYRMBLADE_EQUIPMENT = {
  wbCharges: { name: B('爆破炸藥', 'Blasting Charges'), desc: B('每回合一次：一名友方新信徒可以用爆破炸藥射擊（4 / 4+ / 3/5，射程 4"、爆炸 1"、飽和）。', 'Once per turning point, a friendly Neophyte can shoot a blasting charge (4 / 4+ / 3/5, Range 4", Blast 1", Saturate).') },
  wbKnives: { name: B('教派短刀', 'Cult Knives'), desc: B('每名友方新信徒都有教派短刀（近戰 3 / 4+ / 3/4）。', 'Every friendly Neophyte has a cult knife (melee 3 / 4+ / 3/4).') },
  wbTraps: { name: B('爆炸陷阱', 'Explosive Traps'), desc: B('兩個地雷（不能再另外選通用的地雷）；友方蟲刃不會觸發你的地雷。', 'Two mines (you can\'t also take the universal mines); friendly Wyrmblade operatives don\'t set off your mines.') },
  wbSpotlights: { name: B('探照燈', 'Spotlights'), desc: B('友方射擊時，若目標在一名沒交戰的友方新信徒 6" 內且被它看得到，目標不會被遮擋。', 'When a friendly shoots, the target can\'t be obscured if it\'s visible to and within 6" of a friendly Neophyte that isn\'t within enemy control range.') },
};

/** All the operatives a roster picks: the Neophyte slots (one pick per copy) and the two Cult Agent selections. */
export function wyrmbladeIds(t, roster = {}) {
  const slots = t.ops.filter((o) => o.count).flatMap((o) => Array.from({ length: o.count }, (_, k) => (Array.isArray(roster[o.id]) ? roster[o.id][k] : roster[o.id]) || o.id));
  return [...slots, ...Object.entries(t.packages).flatMap(([pid, pk]) => (pk.options[roster[pid]] || Object.values(pk.options)[0]).ops)];
}

/** Each operative once except Warriors; up to two Gunners and two Heavy Gunners (two Cult Agents at most by construction). */
export function wyrmbladeRosterError(t, roster = {}) {
  const ids = wyrmbladeIds(t, roster), T = (id) => t.ops.find((o) => o.id === id), bad = [];
  const dup = [...new Set(ids.filter((id, i) => !T(id).wbWarrior && ids.indexOf(id) !== i))];
  if (dup.length) bad.push(B(`重複選了：${dup.map((id) => T(id).name.zh).join('、')}（除了戰士，每種特工只能選一次）`, `Picked more than once: ${dup.map((id) => T(id).name.en).join(', ')} (each only once, except Warriors)`));
  const gun = ids.filter((id) => T(id).wbGunner).length, heavy = ids.filter((id) => T(id).wbHeavy).length;
  if (gun > 2) bad.push(B(`槍手 ${gun} 名，最多 2 名`, `${gun} Gunners — two at most`));
  if (heavy > 2) bad.push(B(`重武器手 ${heavy} 名，最多 2 名`, `${heavy} Heavy Gunners — two at most`));
  return bad.length ? B(bad.map((b) => b.zh).join('；'), bad.map((b) => b.en).join('; ')) : null;
}
