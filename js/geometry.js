export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** Rotate a handle around a fixed centre, preserving its original angular offset. */
export function handleRotation(center, start, current, angle, snap = false) {
  if (dist(center, current) < .1) return angle;
  const delta = Math.atan2(current.y-center.y, current.x-center.x) - Math.atan2(start.y-center.y, start.x-center.x);
  const degrees = angle + delta * 180 / Math.PI;
  return ((Math.round(degrees / (snap ? 15 : 1)) * (snap ? 15 : 1)) % 360 + 360) % 360;
}

const localPoint = (p, r) => {
  const a = -(r.angle || 0) * Math.PI / 180, x = p.x - r.x - r.w / 2, y = p.y - r.y - r.h / 2;
  return { x: r.x + r.w / 2 + x * Math.cos(a) - y * Math.sin(a), y: r.y + r.h / 2 + x * Math.sin(a) + y * Math.cos(a) };
};
export function rectCorners(r) {
  const a = (r.angle || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y]) => ({ x: r.x + r.w / 2 + x*r.w/2*c - y*r.h/2*s, y: r.y + r.h / 2 + x*r.w/2*s + y*r.h/2*c }));
}
export function rectGap(a, b) {
  const ac = rectCorners(a), bc = rectCorners(b);
  return Math.min(...ac.map((p,i) => distSegmentRect(p, ac[(i+1)%4], b)), ...bc.map((p,i) => distSegmentRect(p, bc[(i+1)%4], a)));
}

export function distPointRect(p, r) {
  if (r.angle) p = localPoint(p, r);
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
    ...rectCorners(r).map((p) => distPointSegment(p, a, b)));
}

/** Liang–Barsky: does segment a→b touch rect r? */
export function segRect(a, b, r) {
  if (r.angle) { a = localPoint(a, r); b = localPoint(b, r); }
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
