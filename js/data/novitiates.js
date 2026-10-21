// Novitiates (見習修女): the roster check (the team is in teams.js, its equipment in faction-equipment.js, the engine in game.js and js/rules/novitiates.js).
// Source: .monitor/kill-team/files/novitiates.pdf
const B = (zh, en) => ({ zh, en });

/** The Superior and nine picks (one per copy): each once except Militants, and at most two Purgatus. */
export function novitiatesRosterError(t, roster = {}) {
  const ids = t.ops.filter((o) => o.count && o.id !== 'nvSuperior').flatMap((o) => Array.from({ length: o.count }, (_, k) => (Array.isArray(roster[o.id]) ? roster[o.id][k] : roster[o.id]) || o.id));
  const T = (id) => t.ops.find((o) => o.id === id);
  const dup = [...new Set(ids.filter((id, i) => !T(id).nvMilitant && id !== 'nvPurgatus' && ids.indexOf(id) !== i))];
  if (dup.length) return B(`重複選了：${dup.map((id) => T(id).name.zh).join('、')}（除了武裝修女與淨化者，每種特工只能選一次）`, `Picked more than once: ${dup.map((id) => T(id).name.en).join(', ')} (each only once, except Militants and Purgatus)`);
  if (ids.filter((id) => id === 'nvPurgatus').length > 2) return B('淨化者最多 2 名', 'At most two Purgatus');
  return null;
}
