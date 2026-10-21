// Kasrkin (卡舍津): the roster check (the team is in teams.js, its equipment in faction-equipment.js, the engine in js/rules/kasrkin.js).
// Source: .monitor/kill-team/files/kasrkin.pdf
const B = (zh, en) => ({ zh, en });
const GUNNERS = ['ksFlamer', 'ksGL', 'ksVolley', 'ksMelta', 'ksPlasma'];

/** The Sergeant and nine picks (one per copy): each once except Troopers, and at most four Gunners. */
export function kasrkinRosterError(t, roster = {}) {
  const ids = t.ops.filter((o) => o.count && o.id !== 'ksSergeant').flatMap((o) => Array.from({ length: o.count }, (_, k) => (Array.isArray(roster[o.id]) ? roster[o.id][k] : roster[o.id]) || o.id));
  const T = (id) => t.ops.find((o) => o.id === id);
  const dup = [...new Set(ids.filter((id, i) => id !== 'ksTrooper' && ids.indexOf(id) !== i))];
  if (dup.length) return B(`重複選了：${dup.map((id) => T(id).name.zh).join('、')}（除了士兵，每種特工只能選一次）`, `Picked more than once: ${dup.map((id) => T(id).name.en).join(', ')} (each only once, except Troopers)`);
  if (ids.filter((id) => GUNNERS.includes(id)).length > 4) return B('槍手最多選 4 名', 'At most four Gunners');
  return null;
}
