// Shot analyser (🎯 射擊判讀): the beginner walk-through must agree with the game's own shootCheck.
import assert from 'node:assert/strict';
import { newGame, activate, weaponsFor, shootCheck } from '../js/game.js';
import { explainShot, analyserWeapons, CIS } from '../js/sightcheck.js';

const g = newGame({ teams: ['angels', 'kommandos'], ai: null });
g.phase = 'firefight'; g.tp = 1; g.turn = 0;
g.ops.forEach((o) => { o.x = -100; o.y = -100; });
const op = g.ops.find((o) => o.side === 0 && o.tplId === 'sniper');
const [target, other] = g.ops.filter((o) => o.side === 1);
const friend = g.ops.find((o) => o.side === 0 && o !== op);
Object.assign(op, { x: 0.5, y: 5, order: 'engage' }); Object.assign(target, { x: 10.5, y: 5, order: 'engage' });
activate(g, op);
const w = weaponsFor(g, op).find((x) => x.id === 'sniperMortis');
assert.ok(analyserWeapons(g, op).some((x) => x.id === w.id));
const step = (r, id) => r.steps.find((s) => s.id === id);
const run = () => { const r = explainShot(g, op, target, w); assert.equal(r.verdict.ok, shootCheck(g, op, target, w).ok, 'verdict follows shootCheck'); return r; };

const cover = { kind: 'light', x: 9.2, y: 4.75, w: .2, h: .5 };
const middle = { kind: 'heavy', x: 5.5, y: 4.8, w: .4, h: .4 };
const wall = { kind: 'heavy', x: 5.5, y: 3, w: .4, h: 4 };

g.terrain = [];
let r = run();
assert.equal(r.verdict.ok, true); assert.equal(step(r, 'cover').state, 'ok'); assert.equal(step(r, 'obscured').state, 'ok');
assert.equal(step(r, 'intervening').state, 'ok', 'clear shot');

g.terrain = [cover];
r = run();
assert.equal(step(r, 'cover').state, 'warn', 'light terrain within 1" of the target: cover');
assert.equal(r.verdict.cover, true);
assert.equal(step(r, 'cover').link, CIS.cover);
assert.ok(r.geo.parts.some((p) => p.nearTarget), 'the covering part is drawn');
target.order = 'conceal';
r = run();
assert.equal(r.verdict.ok, false); assert.equal(step(r, 'valid').state, 'bad', 'Conceal + cover: not a valid target');
target.order = 'engage';

g.terrain = [middle];
r = run();
assert.equal(step(r, 'obscured').state, 'warn', 'heavy terrain far from both bases obscures');
assert.equal(r.verdict.obscured, true);
assert.ok(r.geo.rings);

g.terrain = [wall];
r = run();
assert.equal(r.verdict.ok, false); assert.equal(step(r, 'visible').state, 'bad', 'a solid wall hides the target');
assert.equal(r.geo.blockers.length, 1);

g.terrain = [{ kind: 'light', x: 2.3, y: 4.5, w: .1, h: 1 }];
Object.assign(target, { x: 3.2 });
r = run();
assert.match(r.steps.find((s) => s.id === 'cover').title.en, /2"/, 'within 2": cover cancelled');
Object.assign(target, { x: 10.5 });

g.terrain = [];
Object.assign(friend, { x: target.x, y: target.y + 1.2, order: 'engage' });
r = run();
assert.equal(r.verdict.ok, false); assert.equal(step(r, 'melee').state, 'bad', 'no shooting into melee');
friend.x = -100;

op.order = 'conceal'; op.orderSet = true; // (activated, order picked)
r = explainShot(g, op, target, { ...w, rules: { ...w.rules, silent: false } });
assert.equal(step(r, 'order').state, 'bad', 'Concealed shooter, non-Silent weapon');
assert.equal(r.verdict.ok, false);
r = explainShot(g, op, target, { ...w, rules: { ...w.rules, silent: true } });
assert.equal(step(r, 'order').state, 'ok', 'Silent weapons can shoot on Conceal');
op.order = 'engage';

// Not activated yet: its order isn't decided, so it is judged as if it picks Engage.
const ready = g.ops.find((o) => o.side === 0 && o !== op && o !== friend);
Object.assign(ready, { x: 0.5, y: 8, order: 'conceal', ready: true });
r = explainShot(g, ready, target, analyserWeapons(g, ready)[0]);
assert.equal(step(r, 'order').state, 'info');
assert.equal(ready.order, 'conceal', 'the hypothetical order is put back');
ready.order = 'engage'; ready.ap = 0; ready.x = 5;
r = explainShot(g, ready, target, analyserWeapons(g, ready)[0]);
assert.equal(r.verdict.ok, true, 'a waiting operative with no AP yet is judged as if activating');
assert.ok(!r.steps.some((x) => x.id === 'special'));
assert.equal(ready.ap, 0, 'AP put back');
ready.x = -100;

const own = explainShot(g, op, friend, w);
assert.equal(own.verdict.ok, false); assert.equal(own.steps[0].id, 'side');
assert.ok(other);
console.log('Shot analyser explains visibility, intervening, cover, the 2" exception, Conceal, melee, orders and obscuring, in step with shootCheck');
