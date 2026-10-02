import { BOARD, DEPLOY, OBJ_R, CONTROL, controller, isInjured, opName, radius, team, tpl } from './game.js';
import { getLang, tx } from './i18n.js';

const f = (n) => +n.toFixed(3);

/**
 * ui.highlight: Map uid -> 'target' | 'cover' (valid targets)
 * ui.path: {pts, ok}
 * ui.canDrag: own operatives can be dragged (deployment)
 */
export function renderBoard(g, ui) {
  const s = [];
  s.push(`<svg id="board" class="${ui.canDrag ? 'deploy' : ''}" viewBox="-0.6 -0.6 ${BOARD.w + 1.2} ${BOARD.h + 1.2}" xmlns="http://www.w3.org/2000/svg">`);
  s.push(`<defs>
    <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M1 0H0V1" fill="none" stroke="var(--grid)" stroke-width="0.03"/></pattern>
    <pattern id="hatch" width="0.4" height="0.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="0.4" height="0.4" fill="var(--light-t)"/><line x1="0" y1="0" x2="0" y2="0.4" stroke="var(--light-s)" stroke-width="0.15"/></pattern>
  </defs>`);
  s.push(`<rect class="mat" x="0" y="0" width="${BOARD.w}" height="${BOARD.h}"/>`);
  s.push(`<rect x="0" y="0" width="${BOARD.w}" height="${BOARD.h}" fill="url(#grid)" pointer-events="none"/>`);
  DEPLOY.forEach((z, side) => {
    s.push(`<rect x="${z.x0}" y="0" width="${z.x1 - z.x0}" height="${BOARD.h}" fill="${team(g, side).color}" opacity="${g.phase === 'deploy' ? 0.16 : 0.07}" pointer-events="none"/>`);
  });

  for (const t of g.terrain) {
    if (t.kind === 'heavy') s.push(`<rect class="heavy" x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="0.08"/>`);
    else s.push(`<rect class="light" x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" fill="url(#hatch)" rx="0.05"/>`);
  }

  for (const o of g.objectives) {
    const c = controller(g, o);
    const col = c == null ? 'var(--obj)' : team(g, c).color;
    s.push(`<circle cx="${o.x}" cy="${o.y}" r="${OBJ_R + CONTROL}" fill="none" stroke="${col}" stroke-width="0.04" stroke-dasharray="0.2 0.15" opacity="0.6" pointer-events="none"/>`);
    s.push(`<circle cx="${o.x}" cy="${o.y}" r="${OBJ_R}" fill="${col}" stroke="var(--obj-s)" stroke-width="0.06" pointer-events="none"/>`);
    s.push(`<text x="${o.x}" y="${o.y + 0.16}" class="objtxt" pointer-events="none">${o.id + 1}</text>`);
  }

  // Selected operative movement allowance ring.
  if (ui.ring) s.push(`<circle cx="${f(ui.ring.x)}" cy="${f(ui.ring.y)}" r="${f(ui.ring.r)}" class="ring" pointer-events="none"/>`);

  if (ui.path) {
    const d = ui.path.pts.map((p, i) => `${i ? 'L' : 'M'}${f(p.x)} ${f(p.y)}`).join('');
    const end = ui.path.pts[ui.path.pts.length - 1];
    s.push(`<path d="${d}" class="path ${ui.path.ok ? 'ok' : 'bad'}" pointer-events="none"/>`);
    s.push(`<circle cx="${f(end.x)}" cy="${f(end.y)}" r="${f(ui.path.r)}" class="ghost ${ui.path.ok ? 'ok' : 'bad'}" pointer-events="none"/>`);
    s.push(`<text x="${f(end.x)}" y="${f(end.y - ui.path.r - 0.25)}" class="pathlen" pointer-events="none">${ui.path.len.toFixed(1)}"</text>`);
  }

  // Replay: where operatives moved from in this step.
  for (const t of ui.trails || []) {
    const op = g.ops.find((o) => o.uid === t.uid);
    s.push(`<circle cx="${f(t.from.x)}" cy="${f(t.from.y)}" r="${f(radius(op))}" class="trailghost" stroke="${team(g, op.side).color}" pointer-events="none"/>`);
    s.push(`<line x1="${f(t.from.x)}" y1="${f(t.from.y)}" x2="${f(t.to.x)}" y2="${f(t.to.y)}" class="trail" stroke="${team(g, op.side).color}" pointer-events="none"/>`);
  }

  if (ui.los) {
    s.push(`<line x1="${f(ui.los.a.x)}" y1="${f(ui.los.a.y)}" x2="${f(ui.los.b.x)}" y2="${f(ui.los.b.y)}" class="los" pointer-events="none"/>`);
  }

  s.push('<g id="dragghost" pointer-events="none"></g>'); // filled while dragging during deployment

  for (const o of g.ops) {
    if (o.dead) continue;
    const r = radius(o);
    const col = team(g, o.side).color;
    const cls = ['op'];
    if (g.phase === 'firefight' && !o.ready && g.active !== o.uid) cls.push('spent');
    if (ui.canDrag && o.side !== g.ai) cls.push('mine');
    if (ui.sel === o.uid) cls.push('sel');
    if (g.active === o.uid) cls.push('active');
    s.push(`<g class="${cls.join(' ')}" data-uid="${o.uid}" transform="translate(${f(o.x)} ${f(o.y)})">`);
    s.push(`<title>${opName(o, getLang())} — ${tx(team(g, o.side).name)} · W ${o.wounds}/${o.maxW}</title>`);
    const hl = ui.highlight?.get(o.uid);
    if (hl) s.push(`<circle r="${f(r + 0.32)}" class="tgt ${hl}"/>`);
    if (g.active === o.uid) s.push(`<circle r="${f(r + 0.22)}" class="activeRing"/>`);
    else if (ui.sel === o.uid) s.push(`<circle r="${f(r + 0.2)}" class="selRing"/>`);
    s.push(`<circle r="${f(r)}" fill="${col}" class="base ${o.order === 'conceal' ? 'conceal' : ''}"/>`);
    s.push(`<text y="0.17" class="optxt">${shortLabel(o)}</text>`);
    // wound bar
    const w = r * 1.8, pct = o.wounds / o.maxW;
    s.push(`<rect x="${f(-w / 2)}" y="${f(r + 0.08)}" width="${f(w)}" height="0.16" class="wbg"/>`);
    s.push(`<rect x="${f(-w / 2)}" y="${f(r + 0.08)}" width="${f(w * pct)}" height="0.16" class="wfg ${isInjured(o) ? 'inj' : ''}"/>`);
    if (o.order === 'conceal') s.push(`<text x="${f(r * 0.75)}" y="${f(-r * 0.55)}" class="badge">◐</text>`);
    if (o.marked) s.push(`<circle cx="${f(-r * 0.75)}" cy="${f(-r * 0.7)}" r="0.16" class="mark"/>`);
    if (hl === 'cover') s.push(`<text x="${f(-r - 0.15)}" y="${f(-r)}" class="badge cov">🛡</text>`);
    s.push('</g>');
  }
  s.push('<g id="measure" pointer-events="none"></g>'); // filled by the measuring tool
  s.push('</svg>');
  return s.join('');
}

function shortLabel(o) {
  const t = tpl(o);
  const abbrev = { sgt: '★', boss: '★', shasui: '★', gunner: 'P', plasma: 'P', melta: 'M', assault: 'A', burna: 'B', rokkit: 'R', rail: 'R', ion: 'I' };
  return abbrev[t.id] || String(o.num);
}
