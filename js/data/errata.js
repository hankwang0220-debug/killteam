// Official updates to team data, as data. When Games Workshop changes an operative, a weapon, a ploy, an equipment option or a
// team's information, add an entry here instead of hunting through the team files: it is applied when the game loads, and
// tests/errata.mjs fails if an entry points at something that doesn't exist (a typo, or a renamed id).
//
// Each entry: { date: 'YYYY-MM', source: 'document and version', <target>, set: { …new values } }
// Targets (ids are the ones in js/data/teams.js and js/data/<team>.js):
//   team + op       an operative's stats or flags     { team: 'exaction', op: 'proctor', set: { save: 3, wounds: 10 } }
//   team + weapon   a weapon profile (every copy)     { team: 'exaction', weapon: 'shotpistolPE', set: { atk: 5, dmg: [3, 4], rules: { range: 6 } } }
//   team + ploy     a strategy / firefight ploy       { team: 'exaction', ploy: 'longArm', set: { cp: 0 } }
//   team + info     the team's information panel      { team: 'farstalkers', info: { note: { zh: '…', en: '…' } } }
//   team            the team itself (e.g. its name)   { team: 'kommandos', set: { style: { zh: '…', en: '…' } } }
//   equipment       an equipment option's text        { equipment: 'ladders', set: { desc: { zh: '…', en: '…' } } }
// In `rules`, a value of null removes that weapon rule. A rule that changes how something works (not just a number or a text)
// still needs code; note it here anyway with `code: true` so the change log stays in one place.
export const ERRATA = [
];

const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
/** Merge new values in; `rules` merges rule by rule (null removes one). */
function patch(obj, set) {
  for (const [k, v] of Object.entries(set || {})) {
    if (k === 'rules' && v && typeof v === 'object') {
      obj.rules ||= {};
      for (const [r, x] of Object.entries(v)) { if (x === null) delete obj.rules[r]; else obj.rules[r] = x; }
    } else obj[k] = v;
  }
}
/** Every weapon object of a team (on its operatives, their loadouts and extra weapon lists). */
function teamWeapons(t) {
  const out = new Set();
  const visit = (x, depth = 0) => {
    if (!x || typeof x !== 'object' || depth > 4) return;
    if (Array.isArray(x)) { for (const y of x) visit(y, depth + 1); return; }
    if (x.type && x.id && (x.type === 'ranged' || x.type === 'melee')) { out.add(x); return; }
    for (const v of Object.values(x)) if (v && typeof v === 'object') visit(v, depth + 1);
  };
  for (const o of t.ops || []) visit(o);
  return [...out];
}
const ployLists = (t) => [t.ploys, t.firefight, t.techniques].filter(Array.isArray);

/** Apply the entries to the team map (and the equipment table, when given). Returns the entries that found nothing to change. */
export function applyErrata(teamMap, equipment = null, list = ERRATA) {
  const problems = [];
  for (const e of list) {
    const t = e.team != null ? teamMap[e.team] : null;
    if (e.team != null && !t) { problems.push({ entry: e, why: `no team ${e.team}` }); continue; }
    if (has(e, 'equipment')) {
      if (!equipment) continue; // (applied again by game.js once the equipment table exists)
      const x = equipment[e.equipment];
      if (!x) problems.push({ entry: e, why: `no equipment ${e.equipment}` }); else patch(x, e.set);
    } else if (has(e, 'op')) {
      const ops = (t.ops || []).filter((o) => o.id === e.op);
      if (!ops.length) problems.push({ entry: e, why: `no operative ${e.op} in ${e.team}` }); else ops.forEach((o) => patch(o, e.set));
    } else if (has(e, 'weapon')) {
      const ws = teamWeapons(t).filter((w) => w.id === e.weapon);
      if (!ws.length) problems.push({ entry: e, why: `no weapon ${e.weapon} in ${e.team}` }); else ws.forEach((w) => patch(w, e.set));
    } else if (has(e, 'ploy')) {
      const ps = ployLists(t).flat().filter((p) => p.id === e.ploy);
      if (!ps.length) problems.push({ entry: e, why: `no ploy ${e.ploy} in ${e.team}` }); else ps.forEach((p) => patch(p, e.set));
    } else if (has(e, 'info')) {
      t.info ||= {}; patch(t.info, e.info);
    } else if (t) patch(t, e.set);
    else problems.push({ entry: e, why: 'no target' });
  }
  return problems;
}
