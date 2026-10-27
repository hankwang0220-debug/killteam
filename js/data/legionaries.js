// Legionaries (軍團): the roster check (the team is in teams.js, its equipment in faction-equipment.js, the engine in js/rules/legionaries.js).
// Source: .monitor/kill-team/files/legionaries.pdf
const B = (zh, en) => ({ zh, en });

/** The slots a roster fills: the template picked for each (one copy per slot). */
export const legionarySlots = (t, roster = {}) => t.ops.filter((o) => o.count).map((o) => ({ slot: o.id, id: (Array.isArray(roster[o.id]) ? roster[o.id][0] : roster[o.id]) || o.id }));

/** A leader and five picks: each once except Warriors; a Balefire Acolyte can't bear the Mark of Khorne. */
export function legionariesRosterError(t, roster = {}) {
  const picks = legionarySlots(t, roster), T = (id) => t.ops.find((o) => o.id === id);
  const ids = picks.filter((p) => p.slot !== 'lgChosen').map((p) => p.id);
  const dup = [...new Set(ids.filter((id, i) => id !== 'lgWarrior' && id !== 'lgWarrior2' && ids.indexOf(id) !== i))];
  if (dup.length) return B(`重複選了：${dup.map((id) => T(id).name.zh).join('、')}（除了戰士，每種特工只能選一次）`, `Picked more than once: ${dup.map((id) => T(id).name.en).join(', ')} (each only once, except Warriors)`);
  if (picks.some((p) => p.id === 'lgBalefire' && roster[`mark_${p.slot}`] === 'khorne')) return B('狂焰侍僧不能選恐虐印記', 'A Balefire Acolyte cannot bear the Mark of Khorne');
  return null;
}
