// Flat-board approximation of head visibility, kept separate from base targeting lines.
import { dist, segRect } from './geometry.js';
const EPS = 1e-7;
const point = (c, r, a) => ({ x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) });

function clipRect(poly, r) {
  for (const [axis, limit, sign] of [['x', r.x, 1], ['x', r.x + r.w, -1], ['y', r.y, 1], ['y', r.y + r.h, -1]]) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const ia = sign * (a[axis] - limit) >= -EPS, ib = sign * (b[axis] - limit) >= -EPS;
      if (ia) out.push(a);
      if (ia !== ib) {
        const t = (limit - a[axis]) / (b[axis] - a[axis]);
        out.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
      }
    }
    poly = out;
    if (!poly.length) break;
  }
  return poly;
}

function facingCone(origin, target, r) {
  const d = dist(origin, target);
  if (d <= r) return [];
  const angle = Math.atan2(origin.y - target.y, origin.x - target.x);
  const arc = Math.acos(r / d);
  const poly = [origin];
  for (let i = 0; i <= 12; i++) poly.push(point(target, r, angle - arc + 2 * arc * i / 12));
  return poly;
}

function edgeDistance(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}

function near(poly, p, r) {
  return poly.some((a, i) => edgeDistance(p, a, poly[(i + 1) % poly.length]) <= r + EPS);
}

// Split polygon edges at the two 1-inch control circles. The middle of each
// resulting interval tells whether an intervening part is outside BOTH circles.
function farFromBoth(poly, a, ra, b, rb) {
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    const dx = q.x - p.x, dy = q.y - p.y, aa = dx * dx + dy * dy;
    const cuts = [0, 1];
    if (aa > EPS) for (const [c, r] of [[a, ra], [b, rb]]) {
      const x = p.x - c.x, y = p.y - c.y, bb = 2 * (x * dx + y * dy), cc = x * x + y * y - r * r;
      const det = bb * bb - 4 * aa * cc;
      if (det >= 0) for (const t of [(-bb - Math.sqrt(det)) / (2 * aa), (-bb + Math.sqrt(det)) / (2 * aa)]) if (t > 0 && t < 1) cuts.push(t);
    }
    cuts.sort((x, y) => x - y);
    for (let k = 0; k < cuts.length; k++) {
      const t = k ? (cuts[k - 1] + cuts[k]) / 2 : 0;
      const v = { x: p.x + t * dx, y: p.y + t * dy };
      if (dist(v, a) > ra + EPS && dist(v, b) > rb + EPS) return true;
    }
  }
  return false;
}

export function flatSight(terrain, from, to, rf, rt, opts = {}) {
  // Solid heavy walls occlude models. Heavy features with openings may set
  // blocksSight:false: they still provide cover/obscuring, but not opaque walls.
  const opaque = terrain.filter(t => t.kind === 'heavy' && t.blocksSight !== false);
  const visible = Array.from({ length: 25 }, (_, i) => i ? point(to, rt * .95, (i - 1) * Math.PI / 12) : to)
    .some(p => !opaque.some(t => segRect(from, p, t)));
  if (!visible) return { visible: false, cover: false, obscured: false, defenceOptions: [] };
  const close = dist(from, to) - rf - rt <= 2 + EPS;
  let best;
  const origins = [from];
  for (let i = 0; i < 32; i++) origins.push(point(from, rf, i * Math.PI / 16));
  for (const origin of origins) {
    const cone = facingCone(origin, to, rt);
    let options = [{ cover: false, obscured: false }];
    for (const t of terrain) {
      if (t.kind === 'wire') continue;
      const parts = clipRect(cone, t);
      if (!parts.length) continue;
      const cover = !close && !opts.ignoreAll && !(opts.ignoreLight && t.kind === 'light') && near(parts, to, rt + 1);
      const obscured = !opts.noObscure && (t.kind === 'heavy' || (t.kind === 'light' && opts.lightObscures))
        && farFromBoth(parts, from, rf + 1, to, rt + 1);
      // The SAME feature offers a choice; separate features can stack.
      const choices = cover && obscured ? [{ cover: true, obscured: false }, { cover: false, obscured: true }] : [{ cover, obscured }];
      options = options.flatMap(o => choices.map(c => ({ cover: o.cover || c.cover, obscured: o.obscured || c.obscured })));
      options = [...new Map(options.map(o => [`${o.cover}:${o.obscured}`, o])).values()];
    }
    // Remove outcomes strictly worse for the defender; defence selection only
    // needs incomparable choices (cover versus obscuring from one feature).
    options = options.filter(o => !options.some(p => p !== o && (!o.cover || p.cover) && (!o.obscured || p.obscured)));
    const cover = options.some(o => o.cover), obscured = options.some(o => o.obscured);
    const rank = (cover ? 1 : 0) + (obscured ? 2 : 0);
    if (!best || rank < best.rank) best = { visible: true, cover, obscured, defenceOptions: options, origin, rank };
    if (rank === 0) break;
  }
  const { rank, ...result } = best;
  return result;
}
