import { TOMB_WORLD_MAPS, tombWorldAccessPoints, hatchLeaf } from './tombworld-maps.js';
import { distPointRect, segRect } from './geometry.js';

const EPS = 1e-6;
const ACCESS = new Map(TOMB_WORLD_MAPS.map(m => [m.id,tombWorldAccessPoints(m)]));
// Games/replays predating hatch state retain their previous open doors.
export const accessPointsOf = (g) => (ACCESS.get(g.map) || []).map(d=>({...d,state:d.kind === 'hatchway' ? g.hatches?.[d.id] || 'open':'open'}));
export const hatchActionId = (d) => `${d.state === 'open' ? 'twClose_':'twOpen_'}${d.id}`;
export const accessRect = (d) => hatchLeaf(d);
export function nearHatch(g, op, d, r, range = 1) {
  const p={x:d.x,y:d.y,[d.axis]:d[d.axis]+Math.sign(op[d.axis]-d[d.axis])*.126};
  return distPointRect(op,accessRect(d))-r <= range+.001 && wallAllowsControl(g,op,p);
}
export function setHatchState(g, id, state) {
  const d=accessPointsOf(g).find(d=>d.id === id && d.kind === 'hatchway');
  if(!d || !['open','closed'].includes(state)) return false;
  g.hatches ||= Object.fromEntries(accessPointsOf(g).filter(d=>d.kind === 'hatchway').map(d=>[d.id,d.state]));
  g.hatches[id]=state;
  g.terrain=g.terrain.filter(t=>t.hatchId !== id);
  if(state === 'closed') g.terrain.push(hatchLeaf(d));
  return true;
}

/** Count each traversal of the access plane, including waypoint-split traversals.
 * A waypoint on the plane belongs to its low side, so adjacent legs never double-charge.
 */
export function accessEdgeCost(points, access) {
  let cost = 0;
  for (const d of access) for (let i = 1; i < points.length; i++) {
    const a = points[i-1], b = points[i], axis = d.axis;
    const sa = a[axis]-d[axis], sb = b[axis]-d[axis];
    if ((sa > EPS) === (sb > EPS) || Math.abs(sb-sa) < EPS) continue;
    const t = -sa/(sb-sa), across = axis === 'x' ? 'y' : 'x';
    const at = a[across] + (b[across]-a[across])*t;
    if (at >= d[across]-d.width/2-EPS && at <= d[across]+d.width/2+EPS) cost += d.moveCost;
  }
  return cost;
}

export function accessCrossingCost(points, access) {
  let cost = 0;
  for (const d of access) {
    let side = 0;
    for (let i = 0; i < points.length; i++) {
      const b=points[i], sb=b[d.axis]-d[d.axis], next=Math.abs(sb)<EPS ? 0:Math.sign(sb);
      if (!next) continue;
      if (side && next !== side && i>0) {
        const a=points[i-1], sa=a[d.axis]-d[d.axis], across=d.axis === 'x' ? 'y':'x';
        const t=Math.abs(sb-sa)<EPS ? 0:-sa/(sb-sa), at=a[across]+(b[across]-a[across])*t;
        if (Math.abs(at-d[across])<=d.width/2+EPS) cost+=d.moveCost;
      }
      side=next;
    }
  }
  return cost;
}

/** Tomb World walls interrupt control range; other maps retain their existing model. */
export function wallAllowsControl(g, a, b) {
  return !g.terrain.some(t => t.twWall && segRect(a,b,t));
}

export function hatchwayFightAccess(g, a, b, ra, rb) {
  for (const d of accessPointsOf(g)) {
    if(d.state !== 'open') continue;
    const rect = d.axis === 'x' ? {x:d.x-.125,y:d.y-d.width/2,w:.25,h:d.width}
      : {x:d.x-d.width/2,y:d.y-.125,w:d.width,h:.25};
    if (distPointRect(a,rect) > ra+.01 || distPointRect(b,rect)-rb > 2+.01) continue;
    if ((a[d.axis]-d[d.axis])*(b[d.axis]-d[d.axis]) >= -EPS) continue;
    // Measure a route through the aperture, rather than through an adjacent wall.
    const across = d.axis === 'x' ? 'y' : 'x';
    const p = {...d,[across]:Math.max(d[across]-d.width/2,Math.min(d[across]+d.width/2,a[across]))};
    // Stop just before the plane on each side so wall endpoints don't block the aperture.
    const near = (o) => ({x:p.x,y:p.y,[d.axis]:p[d.axis]+Math.sign(o[d.axis]-d[d.axis])*.13});
    if (wallAllowsControl(g,a,near(a)) && wallAllowsControl(g,b,near(b))) return d;
  }
  return null;
}
