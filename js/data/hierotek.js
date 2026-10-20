// Hierotek Circle (技師環): the roster check (the team is in teams.js, its equipment in faction-equipment.js, the engine in game.js).
// Source: .monitor/kill-team/files/hierotek-circle.pdf
const B = (zh, en) => ({ zh, en });

/** Five picks (one per copy): each once, except Deathmarks and Guardians. */
export function hierotekRosterError(t, roster = {}) {
  const ids = ['apprentek', 'deathmark', 'despotek', 'guardian'].flatMap((s) => { const o = t.ops.find((x) => x.id === s); return Array.from({ length: o.count }, (_, k) => (Array.isArray(roster[s]) ? roster[s][k] : roster[s]) || s); });
  const dup = [...new Set(ids.filter((id, i) => !['deathmark', 'guardian'].includes(id) && ids.indexOf(id) !== i))];
  const T = (id) => t.ops.find((o) => o.id === id);
  return dup.length ? B(`重複選了：${dup.map((id) => T(id).name.zh).join('、')}（只有死亡標記、不朽者衛士能重複）`, `Picked more than once: ${dup.map((id) => T(id).name.en).join(', ')} (only Deathmarks and Guardians repeat)`) : null;
}
