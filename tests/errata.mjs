import assert from 'node:assert/strict';
import * as G from '../js/game.js';
import { TEAM_MAP, ERRATA_PROBLEMS } from '../js/data/teams.js';
import { applyErrata } from '../js/data/errata.js';
import { KILLZONE_RULES } from '../js/data/killzone-rules.js';

// Every official update in js/data/errata.js found what it changes (a typo or a renamed id fails here).
assert.deepEqual(ERRATA_PROBLEMS.map((p) => p.why), [], 'team errata');
assert.deepEqual(G.EQUIPMENT_ERRATA_PROBLEMS.map((p) => p.why), [], 'equipment errata');

// How entries apply (on a copy, so the real data isn't touched).
{
  const map = { exaction: structuredClone(TEAM_MAP.exaction) }, eq = { ladders: structuredClone(G.EQUIPMENT.ladders) };
  const problems = applyErrata(map, eq, [
    { date: '2099-01', source: 'test', team: 'exaction', op: 'proctor', set: { save: 2, wounds: 12 } },
    { date: '2099-01', source: 'test', team: 'exaction', weapon: 'shotpistolPE', set: { atk: 5, rules: { range: 6, piercing: 1 } } },
    { date: '2099-01', source: 'test', team: 'exaction', weapon: 'shotpistolPE', set: { rules: { piercing: null } } },
    { date: '2099-01', source: 'test', team: 'exaction', ploy: 'longArm', set: { cp: 0 } },
    { date: '2099-01', source: 'test', team: 'exaction', info: { note: { zh: '測試', en: 'test' } } },
    { date: '2099-01', source: 'test', equipment: 'ladders', set: { desc: { zh: '新', en: 'new' } } },
    { date: '2099-01', source: 'test', team: 'exaction', op: 'noSuchOperative', set: { save: 2 } },
    { date: '2099-01', source: 'test', team: 'noSuchTeam', set: {} },
  ]);
  const p = map.exaction.ops.find((o) => o.id === 'proctor');
  assert.equal(p.save, 2); assert.equal(p.wounds, 12);
  const w = p.weapons.find((x) => x.id === 'shotpistolPE');
  assert.equal(w.atk, 5); assert.equal(w.rules.range, 6); assert(!('piercing' in w.rules), 'null removes a rule');
  assert.equal(map.exaction.firefight.find((x) => x.id === 'longArm').cp, 0);
  assert.equal(map.exaction.info.note.en, 'test');
  assert.equal(eq.ladders.desc.en, 'new');
  assert.deepEqual(problems.map((x) => x.why), ['no operative noSuchOperative in exaction', 'no team noSuchTeam'], 'bad entries are reported');
  assert.notEqual(TEAM_MAP.exaction.ops.find((o) => o.id === 'proctor').save, 2, 'the real data is untouched');
}

// The killzone numbers come from js/data/killzone-rules.js.
assert.equal(G.MAX_TP, KILLZONE_RULES.core.turningPoints);
assert.equal(G.EQUIPMENT_LIMIT, KILLZONE_RULES.core.equipmentOptions);
assert.equal(G.ACTIONS[Object.keys(G.ACTIONS).find((id) => id.startsWith('twOpen_'))].ap, KILLZONE_RULES.tombWorld.hatchAP);
assert.equal(G.ACTIONS[Object.keys(G.ACTIONS).find((id) => id.startsWith('twBreach_'))].ap, KILLZONE_RULES.tombWorld.breachAP);
console.log('errata ok');
