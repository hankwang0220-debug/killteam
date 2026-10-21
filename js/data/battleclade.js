// Battleclade (戰鬥支隊): the roster check (the team is in teams.js, its equipment in faction-equipment.js, the engine in js/rules/battleclade.js).
// Source: .monitor/kill-team/files/battleclade.pdf
const B = (zh, en) => ({ zh, en });
const COMBAT = ['bcMelta', 'bcIgniter', 'bcPhosphor'];

/** The two Tech-Priests and eight picks (one per copy): each once except Combat Servitors — one meltagun, up to three incendine igniters. */
export function battlecladeRosterError(t, roster = {}) {
  const ids = t.ops.filter((o) => o.count && !o.techPriest).flatMap((o) => Array.from({ length: o.count }, (_, k) => (Array.isArray(roster[o.id]) ? roster[o.id][k] : roster[o.id]) || o.id));
  const T = (id) => t.ops.find((o) => o.id === id);
  const dup = [...new Set(ids.filter((id, i) => !COMBAT.includes(id) && ids.indexOf(id) !== i))];
  if (dup.length) return B(`重複選了：${dup.map((id) => T(id).name.zh).join('、')}（除了戰鬥僕從，每種特工只能選一次）`, `Picked more than once: ${dup.map((id) => T(id).name.en).join(', ')} (each only once, except Combat Servitors)`);
  if (ids.filter((id) => id === 'bcMelta').length > 1) return B('熱熔槍戰鬥僕從最多 1 名', 'At most one Combat Servitor with a meltagun');
  if (ids.filter((id) => id === 'bcIgniter').length > 3) return B('焚燒器戰鬥僕從最多 3 名', 'At most three Combat Servitors with an incendine igniter');
  return null;
}
