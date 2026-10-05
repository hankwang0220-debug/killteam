import { BOARD, ER, radius, tpl } from './game.js';
import { dist, distPointRect, pathLength, segRect, truncatePath } from './geometry.js';

const RES = 0.25;

/**
 * Movement context for an operative. Paths avoid terrain and other bases; where the move may
 * END relative to enemies (outside engagement range, or inside it for a Charge) is checked by
 * the caller with inEnemyER.
 */
export function moveCtx(g, op) {
  const r = radius(op);
  const others = g.ops.filter((o) => !o.dead && o.uid !== op.uid).map((o) => ({ x: o.x, y: o.y, r: radius(o), enemy: o.side !== op.side }));
  const heavy = g.terrain.filter((t) => t.kind === 'heavy');
  function free(p) {
    if (p.x < r || p.y < r || p.x > BOARD.w - r || p.y > BOARD.h - r) return false;
    for (const t of heavy) if (distPointRect(p, t) < r - 1e-6) return false;
    for (const o of others) {
      const d = dist(p, o);
      if (d < r + o.r - 1e-6) return false;
    }
    return true;
  }
  function inEnemyER(p) {
    return others.some((o) => o.enemy && dist(p, o) - r - o.r <= ER + 0.01);
  }
  // Jump Pack (FLY): the operative is set up again within its move distance, so only where it lands matters.
  const fly = !!tpl(op).jumpPack || !!(tpl(op).blinkPack && op.blinkOn);
  function segFree(a, b) {
    if (fly) return true;
    const n = Math.max(1, Math.ceil(dist(a, b) / 0.1));
    for (let k = 1; k <= n; k++) {
      const f = k / n;
      if (!free({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f })) return false;
    }
    return true;
  }
  // Razor wire (鐵絲網, Obstructing): crossing over it counts as 1" more.
  const wires = g.terrain.filter((t) => t.kind === 'wire');
  function extra(pts) {
    if (!wires.length || fly) return 0;
    return wires.filter((w) => pts.some((p, i) => i > 0 && segRect(pts[i - 1], p, w))).length;
  }
  return { op, r, free, segFree, inEnemyER, extra };
}

/** Shorten a path to maxLen, backing off until the end point is a legal place to stand. */
export function clampPath(ctx, path, maxLen, endOk = () => true) {
  let l = Math.min(path.len, maxLen);
  for (let k = 0; k < 60 && l > 0.05; k++, l -= 0.2) {
    const pts = truncatePath(path.pts, l);
    const end = pts[pts.length - 1];
    const len = pathLength(pts) + (ctx.extra?.(pts) || 0);
    if (ctx.free(end) && endOk(end) && len <= maxLen + 0.01) return { pts, len };
  }
  return null;
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
  if (ctx.segFree(start, goal)) return { pts: [start, goal], len: dist(start, goal) + (ctx.extra?.([start, goal]) || 0) };

  const cols = Math.round(BOARD.w / RES) + 1, rows = Math.round(BOARD.h / RES) + 1;
  const state = new Int8Array(cols * rows); // 0 unknown, 1 free, 2 blocked
  const cfree = (c, r) => {
    if (c < 0 || r < 0 || c >= cols || r >= rows) return false;
    const i = r * cols + c;
    if (!state[i]) state[i] = ctx.free({ x: c * RES, y: r * RES }) ? 1 : 2;
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
      const ng = gScore[cur.i] + cost * RES;
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
    while (j > i + 1 && !ctx.segFree(raw[i], raw[j])) j--;
    pts.push(raw[j]);
    i = j;
  }
  return { pts, len: pathLength(pts) + (ctx.extra?.(pts) || 0) };
}
