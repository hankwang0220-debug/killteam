import { boardOf, ER, radius, tpl, hasPloy, inMatrix } from './game.js';
import { dist, distPointRect, distPointSegment, distSegmentRect, pathLength, segRect, truncatePath } from './geometry.js';
import { accessPointsOf, accessCrossingCost, accessEdgeCost, wallAllowsControl } from './tombworld-access.js';

const RES = 0.25;
const EPS = 1e-6;

/** Keep the chosen endpoint; round up the total movement cost, including penalties. */
export function wholeInchPath(ctx, path, maxLen = Infinity, endOk = () => true) {
  if (!path?.pts || path.pts.length < 2) return null;
  const distance = pathLength(path.pts), max = Math.floor(maxLen + EPS);
  if (distance <= EPS || max < 1) return null;
  const validate = (pts) => {
    const exactLen = pathLength(pts) + (ctx.extra?.(pts) || 0), len = Math.ceil(exactLen - EPS);
    if (len > max || !ctx.free(pts.at(-1)) || !endOk(pts.at(-1))) return null;
    if (!pts.slice(1).every((p, i) => ctx.segFree(pts[i], p))) return null;
    return { pts, len, exactLen };
  };
  const cost = Math.ceil(distance + (ctx.extra?.(path.pts) || 0) - EPS);
  if (cost <= max) return validate(path.pts);
  // Only an over-budget route is shortened. Legal fractional destinations stay exactly where clicked.
  const reach = Math.min(distance, max);
  for (let step = 0; reach - step * 0.1 > EPS; step++) {
    const travel = reach - step * 0.1;
    const result = validate(truncatePath(path.pts, travel));
    if (result) return result;
  }
  return null;
}

/** A terrain piece's height for climbing (user's 2D defaults unless the map gives a height): Light 2", Heavy Barricade 3", other Heavy 2.6". */
export const climbHeight = (t) => t.height ?? (t.kind === 'light' ? 2 : t.equip != null ? 3 : 2.6);

/**
 * Movement context for an operative. Paths avoid terrain and other bases; where the move may
 * END relative to enemies (outside engagement range, or inside it for a Charge) is checked by
 * the caller with inEnemyER.
 */
export function moveCtx(g, op, kind = 'reposition') {
  const r = radius(op);
  const others = g.ops.filter((o) => !o.dead && o.uid !== op.uid).map((o) => ({ uid: o.uid, x: o.x, y: o.y, r: radius(o), enemy: o.side !== op.side }));
  // A base can't end on Heavy or Light terrain, but a move can climb over it (see climbWalk).
  const cover = g.terrain.filter((t) => t.kind === 'heavy' || t.kind === 'light');
  const hardWalls = cover.filter(t => t.twWall);
  const access = accessPointsOf(g).filter(d=>d.state === 'open');
  const crossingCost = (pts) => accessCrossingCost(pts, access);
  const crossingEdgeCost = (a,b) => accessEdgeCost([a,b], access);
  // Accessible openings allow the base's centre to pass; a wider base may clip
  // adjacent wall wings in transit, but must still finish clear of all terrain.
  const accessOverlap = (t,p) => t.twWall && t.role !== 'pillar' && access.some(d =>
    t.component === d.component && distPointRect(d,t) <= d.width/2+EPS &&
    Math.abs(p[d.axis]-d[d.axis]) <= r+.125+EPS &&
    Math.abs(p[d.axis === 'x' ? 'y':'x']-d[d.axis === 'x' ? 'y':'x']) <= d.width/2+EPS);
  function free(p, blocks = cover) {
    if (p.x < r || p.y < r || p.x > boardOf(g).w - r || p.y > boardOf(g).h - r) return false;
    for (const t of blocks) if (distPointRect(p, t) < r - 1e-6) return false;
    for (const o of others) {
      const d = dist(p, o);
      if (d < r + o.r - 1e-6) return false;
    }
    return true;
  }
  function inEnemyER(p) {
    return others.some((o) => o.enemy && dist(p, o) - r - o.r <= ER + 0.01 && wallAllowsControl(g,p,o));
  }
  // Explain endpoint clearance separately from whether a route can reach it.
  function placement(p) {
    const outside = p.x < r || p.y < r || p.x > boardOf(g).w - r || p.y > boardOf(g).h - r;
    const terrain = cover.filter((t) => distPointRect(p, t) < r - 1e-6);
    const operatives = others.filter((o) => dist(p, o) < r + o.r - 1e-6);
    return { ok: !outside && !terrain.length && !operatives.length, outside, terrain, operatives };
  }
  // Jump Pack (FLY): the operative is set up again within its move distance, so only where it lands matters.
  const fly = (!!tpl(op).jumpPack && !(tpl(op).sfCherub && kind === 'dash') && (op.team !== 'murderwing' || (g.active === op.uid && !op.counter && kind !== 'dash'))) || !!(tpl(op).blinkPack && op.blinkOn);
  // Climbing (house rules, 2D): crossing a piece of Heavy or Light terrain is a climb. It costs at least 2" (which covers a
  // 2" climb), plus the climb above 2" and the drop beyond 2". The spot where the base lands after a climb must be clear
  // and not within an enemy's control range. Flying and terrain-ignoring moves don't climb.
  const noClimb = fly || !!op.acted?.mdNowhere;
  // Break Stuff (Wrecka Krew): within 1" of a Breach marker, parts of its terrain no more than 1" thick are Accessible (no climb).
  const breaches = (g.markers || []).filter((m) => m.kind === 'breach');
  const breached = cover.map((t) => (Math.min(t.w, t.h) <= 1 + EPS ? breaches.filter((m) => m.rect && m.rect.x === t.x && m.rect.y === t.y && m.rect.w === t.w && m.rect.h === t.h) : []));
  const accessible = (i, p) => breached[i].some((m) => dist(p, m) - r <= 1 + EPS);
  const coverAt = (p) => { const s = []; for (let i = 0; i < cover.length; i++) if (distPointRect(p, cover[i]) < r - EPS && !accessible(i, p) && !accessOverlap(cover[i],p)) s.push(i); return s; };
  // (Grapnel Launcher, Scout Hunter: climbing up counts as 2", whatever the height.)
  const climbCost = (i) => { const h = climbHeight(cover[i]); return Math.round(((tpl(op).scGrapnel || tpl(op).grapple ? 2 : Math.max(2, h)) + Math.max(0, h - 2)) * 10) / 10; };
  /** Follow a polyline: the climbing cost of the terrain it gets onto, and whether every landing after a climb is legal. */
  function climbWalk(pts) {
    let cost = 0, ok = true, prev = coverAt(pts[0]);
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      // Only the pieces this segment's base sweeps over matter (plus any it starts on).
      const near = [];
      for (let t = 0; t < cover.length; t++) if (prev.includes(t) || distSegmentRect(a, b, cover[t]) < r - EPS) near.push(t);
      if (!near.length) { prev = []; continue; }
      const n = Math.max(1, Math.ceil(dist(a, b) / 0.05));
      for (let k = 1; k <= n; k++) {
        const p = { x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n };
        const cur = near.filter((t) => distPointRect(p, cover[t]) < r - EPS && !accessible(t, p) && !accessOverlap(cover[t],p));
        for (const t of cur) if (!prev.includes(t)) cost += climbCost(t);
        if (prev.length && !cur.length && inEnemyER(p)) ok = false;
        prev = cur;
      }
    }
    return { cost: Math.round(cost * 10) / 10, ok };
  }
  function segFree(a, b) {
    const walls = hardWalls.filter(t => distSegmentRect(a,b,t) < r-EPS);
    if (walls.length) {
      if (walls.some(t => t.role === 'pillar' || !access.some(d => t.component === d.component &&
        distPointRect(d,t)<=d.width/2+EPS && (accessOverlap(t,a) || accessOverlap(t,b) || accessEdgeCost([a,b],[d])>0)))) return false;
      const n=Math.max(1,Math.ceil(dist(a,b)/.05));
      for(let i=0;i<=n;i++) {
        const p={x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n};
        if(walls.some(t => distPointRect(p,t)<r-EPS && !accessOverlap(t,p))) return false;
      }
    }
    if (fly) return true;
    if ([a, b].some((p) => p.x < r || p.y < r || p.x > boardOf(g).w - r || p.y > boardOf(g).h - r)) return false;
    // (A move can pass through friendly operatives — never enemy ones — but can't end on any base: see free.)
    if (others.some((o) => o.enemy && distPointSegment(o, a, b) < r + o.r - EPS)) return false;
    if (!noClimb && cover.some((t) => distSegmentRect(a, b, t) < r - EPS) && !climbWalk([a, b]).ok) return false;
    return true;
  }
  /** The climbing cost of a polyline (0 for flying and terrain-ignoring moves). */
  const climbs = (pts) => (noClimb ? 0 : climbWalk(pts).cost);
  // Razor wire (鐵絲網, Obstructing): crossing over it counts as 1" more.
  const wires = g.terrain.filter((t) => t.kind === 'wire');
  // Cryptogravitic Repulsion (Canoptek Circle ploy): an enemy moving into that team's matrix counts 1" more (once).
  const foeSide = 1 - op.side;
  const repulse = op.side < 2 && !!g.teams && g.teams[foeSide] && hasPloy(g, foeSide, 'cryptogravitic') && !!g.markers?.some((m) => m.kind === 'obeliskNode' && m.owner === foeSide);
  const inside = (p) => inMatrix(g, foeSide, { ...op, x: p.x, y: p.y });
  function entersMatrix(pts) {
    if (!repulse || inside(pts[0])) return false;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], n = Math.max(1, Math.ceil(dist(a, b) / 0.25));
      for (let k = 1; k <= n; k++) if (inside({ x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n })) return true;
    }
    return false;
  }
  function extra(pts) {
    const wire = !wires.length || fly || op.acted?.mdNowhere ? 0 : wires.filter((w) => pts.some((p, i) => i > 0 && segRect(pts[i - 1], p, w))).length;
    return wire + (entersMatrix(pts) ? 1 : 0) + climbs(pts) + crossingCost(pts);
  }
  // pass: a spot a moving base can go through (over terrain by climbing, through friendly operatives), as opposed to free (where it can stop).
  const pass = (p) => !(p.x < r || p.y < r || p.x > boardOf(g).w - r || p.y > boardOf(g).h - r) && !hardWalls.some(t => distPointRect(p,t) < r-EPS && !accessOverlap(t,p)) && !others.some((o) => o.enemy && dist(p, o) < r + o.r - EPS);
  return { board: boardOf(g), op, r, free, pass, placement, segFree, inEnemyER, extra, crossingCost, crossingEdgeCost, climbs, coverAt, climbCost, noClimb };
}

/** Shorten a path to maxLen, backing off until the end point is a legal place to stand. */
export function clampPath(ctx, path, maxLen, endOk = () => true) {
  return wholeInchPath(ctx, path, maxLen, endOk);
}

class Heap {
  constructor() { this.a = []; }
  push(n) {
    const a = this.a; a.push(n);
    let i = a.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (a[p].f <= a[i].f) break; [a[p], a[i]] = [a[i], a[p]]; i = p; }
  }
  pop() {
    const a = this.a; const top = a[0]; const last = a.pop();
    if (a.length) {
      a[0] = last; let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < a.length && a[l].f < a[m].f) m = l;
        if (r < a.length && a[r].f < a[m].f) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]]; i = m;
      }
    }
    return top;
  }
  get size() { return this.a.length; }
}

/** Shortest path from the operative's position to goal. Returns {pts, len} or null. */
export function findPath(ctx, goal) {
  const start = { x: ctx.op.x, y: ctx.op.y };
  if (!ctx.free(goal)) return null;
  // Straight there, unless that climbs: then a way around may be cheaper.
  const straight = ctx.segFree(start, goal) ? { pts: [start, goal], len: dist(start, goal) + (ctx.extra?.([start, goal]) || 0) } : null;
  if (straight && !ctx.climbs?.(straight.pts) && !ctx.crossingCost?.(straight.pts)) return straight;
  const around = gridPath(ctx, start, goal);
  return !around || (straight && straight.len <= around.len) ? straight : around;
}

/** A* over a 0.25" grid; climbing onto terrain adds its climbing cost, and the landing after a climb must be legal. */
function gridPath(ctx, start, goal) {
  const cols = Math.round(ctx.board.w / RES) + 1, rows = Math.round(ctx.board.h / RES) + 1;
  const state = new Int8Array(cols * rows); // 0 unknown, 1 free, 2 blocked
  const cfree = (c, r) => {
    if (c < 0 || r < 0 || c >= cols || r >= rows) return false;
    const i = r * cols + c;
    if (!state[i]) state[i] = (ctx.pass || ctx.free)({ x: c * RES, y: r * RES }) ? 1 : 2; // (the goal itself was checked with ctx.free)
    return state[i] === 1;
  };
  const sc = Math.round(start.x / RES), sr = Math.round(start.y / RES);
  const gc = Math.round(goal.x / RES), gr = Math.round(goal.y / RES);
  state[sr * cols + sc] = 1;
  if (!cfree(gc, gr)) return null;

  const gScore = new Float32Array(cols * rows).fill(Infinity);
  const came = new Int32Array(cols * rows).fill(-1);
  const h = (c, r) => { const dx = Math.abs(c - gc), dy = Math.abs(r - gr); return (Math.max(dx, dy) + 0.4142 * Math.min(dx, dy)) * RES; };
  const heap = new Heap();
  const si = sr * cols + sc;
  gScore[si] = 0;
  heap.push({ i: si, c: sc, r: sr, f: h(sc, sr) });
  // Terrain each cell's base overlaps (climbing): getting onto a piece costs its climb; a landing must be outside enemy control range.
  const climbing = !ctx.noClimb && !!ctx.coverAt;
  const covers = new Map();
  const coverOf = (i, c, r) => { let s = covers.get(i); if (!s) { s = ctx.coverAt({ x: c * RES, y: r * RES }); covers.set(i, s); } return s; };
  const dirs = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]];
  let found = false;
  while (heap.size) {
    const cur = heap.pop();
    if (cur.c === gc && cur.r === gr) { found = true; break; }
    if (cur.f - h(cur.c, cur.r) > gScore[cur.i] + 1e-6) continue;
    for (const [dc, dr, cost] of dirs) {
      const nc = cur.c + dc, nr = cur.r + dr;
      if (!cfree(nc, nr)) continue;
      if (dc && dr && (!cfree(cur.c + dc, cur.r) || !cfree(cur.c, cur.r + dr))) continue;
      const ni = nr * cols + nc;
      let climb = 0;
      if (climbing) {
        const from = coverOf(cur.i, cur.c, cur.r), to = coverOf(ni, nc, nr);
        if (from.length && !to.length && ctx.inEnemyER({ x: nc * RES, y: nr * RES })) continue;
        for (const t of to) if (!from.includes(t)) climb += ctx.climbCost(t);
      }
      const ng = gScore[cur.i] + cost * RES + climb + (ctx.crossingEdgeCost?.({x:cur.c*RES,y:cur.r*RES},{x:nc*RES,y:nr*RES}) || 0);
      if (ng < gScore[ni]) {
        gScore[ni] = ng; came[ni] = cur.i;
        heap.push({ i: ni, c: nc, r: nr, f: ng + h(nc, nr) });
      }
    }
  }
  if (!found) return null;

  // Rebuild, keep only turning points, then string-pull.
  const cells = [];
  for (let i = gr * cols + gc; i !== -1; i = came[i]) cells.push(i);
  cells.reverse();
  const raw = [start];
  for (let k = 1; k < cells.length - 1; k++) {
    const a = cells[k - 1], b = cells[k], c = cells[k + 1];
    if (b - a !== c - b) raw.push({ x: (b % cols) * RES, y: Math.floor(b / cols) * RES });
  }
  raw.push(goal);
  const pts = [raw[0]];
  let i = 0;
  while (i < raw.length - 1) {
    let j = raw.length - 1;
    // (a shortcut may not climb more than the route it replaces)
    const ok = (j) => ctx.segFree(raw[i], raw[j]) && (ctx.extra?.([raw[i], raw[j]]) || 0) <= (ctx.extra?.(raw.slice(i, j + 1)) || 0);
    while (j > i + 1 && !ok(j)) j--;
    pts.push(raw[j]);
    i = j;
  }
  return { pts, len: pathLength(pts) + (ctx.extra?.(pts) || 0) };
}
