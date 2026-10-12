export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function distPointRect(p, r) {
  const dx = Math.max(r.x - p.x, 0, p.x - (r.x + r.w));
  const dy = Math.max(r.y - p.y, 0, p.y - (r.y + r.h));
  return Math.hypot(dx, dy);
}

/** Minimum distance from a point to a movement segment. */
export function distPointSegment(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, length2 = dx * dx + dy * dy;
  const t = length2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / length2)) : 0;
  return dist(p, { x: a.x + t * dx, y: a.y + t * dy });
}

/** Minimum distance between a movement segment and a rectangular cover footprint. */
export function distSegmentRect(a, b, r) {
  if (segRect(a, b, r)) return 0;
  return Math.min(distPointRect(a, r), distPointRect(b, r),
    ...[{ x: r.x, y: r.y }, { x: r.x + r.w, y: r.y },
      { x: r.x, y: r.y + r.h }, { x: r.x + r.w, y: r.y + r.h }].map((p) => distPointSegment(p, a, b)));
}

/** Liang–Barsky: does segment a→b touch rect r? */
export function segRect(a, b, r) {
  let t0 = 0, t1 = 1;
  const dx = b.x - a.x, dy = b.y - a.y;
  const p = [-dx, dx, -dy, dy];
  const q = [a.x - r.x, r.x + r.w - a.x, a.y - r.y, r.y + r.h - a.y];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
  }
  return true;
}

export function pathLength(pts) {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += dist(pts[i - 1], pts[i]);
  return s;
}

/** Cut a polyline to at most maxLen. */
export function truncatePath(pts, maxLen) {
  const out = [pts[0]];
  let left = maxLen;
  for (let i = 1; i < pts.length; i++) {
    const d = dist(pts[i - 1], pts[i]);
    if (d <= left) { out.push(pts[i]); left -= d; continue; }
    const f = left / d;
    out.push({ x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f });
    break;
  }
  return out;
}
