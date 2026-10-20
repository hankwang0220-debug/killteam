// Fellgor Ravagers (惡角獸掠奪者): the roster check (the team is in teams.js, its equipment in faction-equipment.js, the engine in game.js).
// Source: .monitor/kill-team/files/fellgor-ravagers.pdf (errata August '26)
const B = (zh, en) => ({ zh, en });

/** The Ironhorn and nine picks (one per copy): each once, except Warriors. */
export function fellgorRosterError(t, roster = {}) {
  const ids = t.ops.filter((o) => o.count && o.id !== 'ironhorn').flatMap((o) => Array.from({ length: o.count }, (_, k) => (Array.isArray(roster[o.id]) ? roster[o.id][k] : roster[o.id]) || o.id));
  const T = (id) => t.ops.find((o) => o.id === id);
  const dup = [...new Set(ids.filter((id, i) => !T(id).fgWarrior && ids.indexOf(id) !== i))];
  return dup.length ? B(`重複選了：${dup.map((id) => T(id).name.zh).join('、')}（除了戰士，每種特工只能選一次）`, `Picked more than once: ${dup.map((id) => T(id).name.en).join(', ')} (each only once, except Warriors)`) : null;
}
