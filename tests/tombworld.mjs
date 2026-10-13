import assert from 'node:assert/strict';
import { buildTombWorldComponent as build, assembleTombWorldComponents as assemble, tombWorldView, tombWorldComponentSvg } from '../js/tombworld.js';

const contains = (c, x, y, z) => c.solids.some((s) => x >= s.x && x <= s.x + s.length && y >= s.y && y <= s.y + s.width && z >= s.z && z <= s.z + s.height);
for (const id of ['A4', 'A3', 'B3']) {
  const closed = build(id, 'closed'), open = build(id, 'open');
  const x = open.length / 2, y = open.width / 2;
  assert(contains(closed, x, y, 1), `${id}: closed door blocks the passage`);
  assert(!contains(open, x, y, 1), `${id}: open door clears the passage`);
  assert(contains(open, x, y, 2.3), `${id}: lintel remains above the opening`);
  assert.equal(open.height, 2.6);
  assert.equal(open.width, .25, 'vertical height must not become footprint width');
}
const intact = build('A1', 'intact'), breached = build('A1', 'breached');
assert(contains(intact, intact.length / 2, .125, 1));
assert(!contains(breached, breached.length / 2, .125, 1));
assert(contains(breached, breached.length / 2, .125, 2.3));
assert.equal(breached.opening.width, 1.5);
assert(!contains(build('B2'), 2.5, .125, 1), 'B2 has an existing opening');
assert(contains(build('B1'), 2.5, .125, 1), 'B1 is solid');
const cover = build('C4'); assert.equal(cover.solids[0].width, 1); assert.equal(cover.solids[0].height, .75);
for (const id of ['A1', 'A2', 'A3', 'A4', 'B3', 'B4']) {
  const c = build(id), pillars = c.solids.filter((s) => s.role === 'pillar');
  assert.equal(pillars.length, 2);
  assert.equal(pillars[0].x, 0);
  assert.equal(pillars[1].x + pillars[1].length, c.length, 'pillars stay inside measured overall length');
  assert(pillars.every((p) => p.length === 1.25 && p.width === 1.25));
  assert.equal(c.footprintWidth, 1.25);
  assert.equal(c.squarePositionsPending, false);
}
const straight = assemble([{ id: 'A2', x: 0, y: 0 }, { id: 'A2', x: 6.75, y: 0 }]);
assert.equal(straight.solids.filter((s) => s.role === 'pillar').length, 3, 'one shared pillar at the join');
assert.equal(straight.bounds.x1 - straight.bounds.x, 14.75, '8 + 8 minus the 1.25 shared pillar');
assert.equal(straight.solids.find((s) => s.role === 'pillar' && s.x === 6.75).owners.length, 2);
const corner = assemble([{ id: 'A2', x: 0, y: 0 }, { id: 'A2', x: 7.5, y: -.5, rotation: 90 }]);
assert.equal(corner.solids.filter((s) => s.role === 'pillar').length, 3, 'rotated junction also shares one pillar');
assert.throws(() => assemble([{ id: 'A2', rotation: 45 }]), /right-angle/);
assert.throws(() => build('T'), /awaits the user/);
assert.throws(() => build('A3', 'unexpected'), /Invalid/);
assert(tombWorldComponentSvg('A4', 'open', 'front').includes('tw-opening'));
assert.equal((tombWorldView().match(/class="card tw-component"/g) || []).length, 13);
console.log('Tomb World geometry passed: end pillars, shared straight/corner joins, measured lengths, openings, lintels, heights and previews.');
