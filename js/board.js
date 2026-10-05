import { BOARD, DEPLOY, OBJ_R, CONTROL, controller, isInjured, opName, radius, team, tpl } from './game.js';
import { getLang, tx } from './i18n.js';

const f = (n) => +n.toFixed(3);

/**
 * ui.highlight: Map uid -> 'target' | 'cover' (valid targets)
 * ui.path: {pts, ok}
 * ui.canDrag: own operatives can be dragged (deployment)
 * ui.recent: [{uid, trails: [[{x,y}]]}] latest activation of each side, with its moves
 * ui.los: {a, b} line from attacker to target (declared attack)
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
  (g.deploy || DEPLOY).forEach((z, side) => {
    const y0 = z.y0 ?? 0, y1 = z.y1 ?? BOARD.h;
    s.push(`<rect x="${z.x0}" y="${y0}" width="${z.x1 - z.x0}" height="${y1 - y0}" fill="${team(g, side).color}" opacity="${g.phase === 'deploy' ? 0.16 : 0.07}" pointer-events="none"/>`);
  });

  for (const t of g.terrain) {
    if (t.kind === 'heavy') s.push(`<rect class="heavy" x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="0.08"/>`);
    else if (t.kind === 'wire') s.push(`<rect class="wire" x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}"/>`); // razor wire
    else s.push(`<rect class="light" x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" fill="url(#hatch)" rx="0.05"/>`);
  }

  for (const o of g.objectives) {
    const c = controller(g, o);
    const col = c == null ? 'var(--obj)' : team(g, c).color;
    s.push(`<circle cx="${o.x}" cy="${o.y}" r="${OBJ_R + CONTROL}" fill="none" stroke="${col}" stroke-width="0.04" stroke-dasharray="0.2 0.15" opacity="0.6" pointer-events="none"/>`);
    s.push(`<circle cx="${o.x}" cy="${o.y}" r="${OBJ_R}" fill="${col}" stroke="var(--obj-s)" stroke-width="0.06" pointer-events="none"/>`);
    s.push(`<text x="${o.x}" y="${o.y + 0.16}" class="objtxt" pointer-events="none">${o.id + 1}</text>`);
  }

  // Mission markers on the ground (carried ones are drawn on their carrier).
  for (const m of g.markers || []) {
    if (m.carriedBy) continue;
    const c = controller(g, m);
    const col = c == null ? 'var(--obj)' : team(g, c).color;
    s.push(`<rect x="${f(m.x - 0.35)}" y="${f(m.y - 0.35)}" width="0.7" height="0.7" rx="0.12" class="mmarker ${m.kind}" stroke="${col}" pointer-events="none"/>`);
    const sym = { infocore: '◆', retrieval: 'R', mine: '✸', ammo: '▣', comms: '⌁', meltaMine: '☢', grisly: '☠' }[m.kind] || '✦';
    s.push(`<text x="${f(m.x)}" y="${f(m.y + 0.17)}" class="mmarktxt" pointer-events="none">${sym}</text>`);
    // Equipment markers belong to a side: its colour as an outer ring.
    if (m.owner != null) s.push(`<circle cx="${f(m.x)}" cy="${f(m.y)}" r="0.55" fill="none" stroke="${team(g, m.owner).color}" stroke-width="0.06" stroke-dasharray="0.12 0.08" pointer-events="none"/>`);
  }
  // Clearance Sweep (Kasrkin ploy): its 5" area this turning point.
  (g.sweep || []).forEach((m, side) => { if (m && m.tp === g.tp) s.push(`<circle cx="${f(m.x)}" cy="${f(m.y)}" r="5" class="pechra" stroke="${team(g, side).color}" pointer-events="none"/>`); });
  // Smoke grenades: an area of smoke 1" around the marker.
  for (const sm of g.smoke || []) s.push(`<circle cx="${f(sm.x)}" cy="${f(sm.y)}" r="1" class="smoke" pointer-events="none"/>`);

  // Selected operative movement allowance ring.
  if (ui.ring) s.push(`<circle cx="${f(ui.ring.x)}" cy="${f(ui.ring.y)}" r="${f(ui.ring.r)}" class="ring" pointer-events="none"/>`);

  if (ui.path) {
    const d = ui.path.pts.map((p, i) => `${i ? 'L' : 'M'}${f(p.x)} ${f(p.y)}`).join('');
    const end = ui.path.pts[ui.path.pts.length - 1];
    s.push(`<path d="${d}" class="path ${ui.path.ok ? 'ok' : 'bad'}" pointer-events="none"/>`);
    s.push(`<circle cx="${f(end.x)}" cy="${f(end.y)}" r="${f(ui.path.r)}" class="ghost ${ui.path.ok ? 'ok' : 'bad'}" pointer-events="none"/>`);
    s.push(`<text x="${f(end.x)}" y="${f(end.y - ui.path.r - 0.25)}" class="pathlen" pointer-events="none">${ui.path.len.toFixed(1)}"</text>`);
  }

  // Hearthkyn markers: Pan Spectral Scan and the Tactician's Attack / Defence marker (3" areas).
  (g.pan || []).forEach((m, side) => {
    if (m) s.push(`<circle cx="${f(m.x)}" cy="${f(m.y)}" r="3" class="pechra" stroke="${team(g, side).color}" pointer-events="none"/><text x="${f(m.x)}" y="${f(m.y - 3.2)}" class="pechratxt" pointer-events="none">📡</text>`);
  });
  [...(g.navyOrder || [])].forEach((m, side) => { // Navy Breachers' Attack / Defence Order marker
    if (m && m.tp === g.tp) s.push(`<circle cx="${f(m.x)}" cy="${f(m.y)}" r="3" class="pechra" stroke="${team(g, side).color}" pointer-events="none"/><text x="${f(m.x)}" y="${f(m.y - 3.2)}" class="pechratxt" pointer-events="none">${m.kind === 'attack' ? '⚔' : '🛡'}</text>`);
  });
  // Reanimation markers (Hierotek Circle) whose operative can still come back.
  for (const m of g.reanim || []) {
    if (!g.ops.find((o) => o.uid === m.uid)?.dead) continue;
    s.push(`<circle cx="${f(m.x)}" cy="${f(m.y)}" r="0.7" class="reanim" stroke="${team(g, m.side).color}" pointer-events="none"/><text x="${f(m.x)}" y="${f(m.y + 0.35)}" class="reanimtxt" pointer-events="none">☥</text>`);
  }
  (g.tactician || []).forEach((m, side) => {
    if (m && m.tp === g.tp) s.push(`<circle cx="${f(m.x)}" cy="${f(m.y)}" r="3" class="pechra" stroke="${team(g, side).color}" pointer-events="none"/><text x="${f(m.x)}" y="${f(m.y - 3.2)}" class="pechratxt" pointer-events="none">${m.kind === 'attack' ? '⚔' : '🛡'}</text>`);
  });
  // Pech'ra marker (Farstalker Tracker): its 1" area.
  (g.pechra || []).forEach((m, side) => {
    if (!m) return;
    s.push(`<circle cx="${f(m.x)}" cy="${f(m.y)}" r="1" class="pechra" stroke="${team(g, side).color}" pointer-events="none"/>`);
    s.push(`<text x="${f(m.x)}" y="${f(m.y - 1.6)}" class="pechratxt" pointer-events="none">🦅</text>`);
  });

  // Every move this turning point (older ones faded, each side's latest activation bold), with an arrow
  // and the distance, plus a ghost of where the latest mover started.
  const log_ = ui.trailLog || [];
  const latestUid = new Set((ui.recent || []).map((r) => r.uid));
  log_.forEach((e, i) => {
    const col = team(g, e.side).color, latest = latestUid.has(e.uid);
    const pts = e.pts, a = pts[pts.length - 2] || pts[0], b = pts[pts.length - 1];
    const ang = Math.atan2(b.y - a.y, b.x - a.x), ah = 0.5;
    const tip = (da) => `${f(b.x - Math.cos(ang + da) * ah)},${f(b.y - Math.sin(ang + da) * ah)}`;
    s.push(`<g class="trailg ${latest ? 'latest' : 'old'}" pointer-events="none">
      <polyline points="${pts.map((p) => `${f(p.x)},${f(p.y)}`).join(' ')}" class="trail" stroke="${col}" fill="none"/>
      <polygon points="${f(b.x)},${f(b.y)} ${tip(0.45)} ${tip(-0.45)}" fill="${col}"/>
      ${latest ? `<text x="${f((pts[0].x + b.x) / 2)}" y="${f((pts[0].y + b.y) / 2 - 0.3)}" class="trailtxt">${e.len}"</text>` : ''}
    </g>`);
  });
  for (const rec of ui.recent || []) {
    const op = g.ops.find((o) => o.uid === rec.uid);
    if (!op || !rec.trails.length) continue;
    const col = team(g, op.side).color, start = rec.trails[0][0];
    s.push(`<circle cx="${f(start.x)}" cy="${f(start.y)}" r="${f(radius(op))}" class="trailghost" stroke="${col}" pointer-events="none"/>`);
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
    if (o.dead || o.x < -50) continue; // not set up yet
    const r = radius(o);
    const col = team(g, o.side).color;
    const cls = ['op'];
    if (g.phase === 'firefight' && !o.ready && g.active !== o.uid) cls.push('spent');
    if (ui.canDrag && o.side !== g.ai && (!g.dep || g.dep.batch?.includes(o.uid))) cls.push('mine');
    if (ui.sel === o.uid) cls.push('sel');
    if (g.active === o.uid) cls.push('active');
    // After the battle: the winning side glows, the losing side is greyed out.
    if (g.phase === 'gameover' && g.winner != null) cls.push(o.side === g.winner ? 'victor' : 'vanquished');
    s.push(`<g class="${cls.join(' ')}" data-uid="${o.uid}" transform="translate(${f(o.x)} ${f(o.y)})">`);
    s.push(`<title>${opName(o, getLang())} — ${tx(team(g, o.side).name)} · W ${o.wounds}/${o.maxW}</title>`);
    const hl = ui.highlight?.get(o.uid);
    if (hl) s.push(`<circle r="${f(r + 0.32)}" class="tgt ${hl}"/>`);
    if (ui.attack && ui.attack.t === o.uid) s.push(`<circle r="${f(r + 0.3)}" class="tgtRing"/>`);
    if (ui.attack && ui.attack.a === o.uid) s.push(`<circle r="${f(r + 0.3)}" class="atkRing"/>`);
    if (g.active === o.uid && g.phase === 'firefight') s.push(`<circle r="${f(r + 0.22)}" class="activeRing pulse"/>`);
    else if (g.active === o.uid) s.push(`<circle r="${f(r + 0.22)}" class="activeRing"/>`);
    else if (ui.sel === o.uid) s.push(`<circle r="${f(r + 0.2)}" class="selRing"/>`);
    // The other side's latest activated operative this turning point.
    if (g.active !== o.uid && (ui.recent || []).some((rec) => rec.uid === o.uid)) {
      s.push(`<circle r="${f(r + 0.3)}" class="lastRing" stroke="${col}"/>`);
    }
    s.push(`<circle r="${f(r)}" fill="${col}" class="base ${o.order === 'conceal' ? 'conceal' : ''}"/>`);
    s.push(`<text y="0.17" class="optxt">${shortLabel(o)}</text>`);
    // wound bar
    const w = r * 1.8, pct = o.wounds / o.maxW;
    s.push(`<rect x="${f(-w / 2)}" y="${f(r + 0.08)}" width="${f(w)}" height="0.16" class="wbg"/>`);
    s.push(`<rect x="${f(-w / 2)}" y="${f(r + 0.08)}" width="${f(w * pct)}" height="0.16" class="wfg ${isInjured(o) ? 'inj' : ''}"/>`);
    if (o.order === 'conceal') s.push(`<text x="${f(r * 0.75)}" y="${f(-r * 0.55)}" class="badge">◐</text>`);
    if (g.mark?.[1 - o.side] === o.uid) s.push(`<g class="killmark"><circle r="${f(r + 0.45)}"/><line x1="${f(-r - 0.6)}" y1="0" x2="${f(-r - 0.25)}" y2="0"/><line x1="${f(r + 0.25)}" y1="0" x2="${f(r + 0.6)}" y2="0"/></g>`); // Call the Kill
    if (o.poison) s.push(`<circle cx="${f(-r * 0.75)}" cy="${f(r * 0.55)}" r="0.16" class="poisontok"/>`); // Poison token
    if (o.frenzy) s.push(`<text x="${f(-r * 0.8)}" y="${f(-r * 0.45)}" class="badge">🔥</text>`); // Frenzy token
    const carried = (g.markers || []).filter((m) => m.carriedBy === o.uid).length;
    if (carried) s.push(`<text x="${f(r * 0.7)}" y="${f(r * 0.85)}" class="carrytxt">${'◆'.repeat(carried)}</text>`); // carried markers
    if (o.ml) {
      // Markerlight tokens: red dot with the count.
      s.push(`<circle cx="${f(-r * 0.75)}" cy="${f(-r * 0.7)}" r="0.2" class="mark"/>`);
      s.push(`<text x="${f(-r * 0.75)}" y="${f(-r * 0.7 + 0.11)}" class="marktxt">${o.ml}</text>`);
    }
    if (hl?.includes('cover')) s.push(`<text x="${f(-r - 0.15)}" y="${f(-r)}" class="badge cov">🛡</text>`);
    if (hl?.includes('obscured')) s.push(`<text x="${f(r + 0.15)}" y="${f(-r)}" class="badge obs">◌</text>`);
    s.push('</g>');
  }
  // Name tags: who is activating, and in an attack who attacks and who is the target.
  const tags = [];
  const act = g.ops.find((o) => o.uid === g.active && !o.dead);
  if (ui.attack) {
    const A = g.ops.find((o) => o.uid === ui.attack.a), Tg = g.ops.find((o) => o.uid === ui.attack.t);
    if (A) tags.push([A, `${ui.attack.kind === 'fight' ? '⚔' : '⌖'} ${getLang() === 'zh' ? '攻擊者' : 'Attacker'}`, 'atk']);
    if (Tg) tags.push([Tg, `🎯 ${getLang() === 'zh' ? '目標' : 'Target'}`, 'tgtt']);
  } else if (act && g.phase === 'firefight') tags.push([act, `▶ ${getLang() === 'zh' ? '啟動中' : 'Activating'}`, 'actt']);
  for (const [o, label, cls] of tags) {
    const r = radius(o), text = `${label}：${shortName(o)}`;
    const w = [...text].reduce((n, c) => n + (c.charCodeAt(0) > 255 ? 0.5 : 0.27), 0.5);
    const below = o.y < 1.8, y = below ? o.y + r + 0.55 : o.y - r - 0.75;
    const x = Math.min(BOARD.w - w / 2, Math.max(w / 2, o.x));
    s.push(`<g class="optag ${cls}" pointer-events="none"><rect x="${f(x - w / 2)}" y="${f(y - 0.3)}" width="${f(w)}" height="0.62" rx="0.14"/>
      <text x="${f(x)}" y="${f(y + 0.14)}">${text}</text></g>`);
  }
  s.push('<g id="measure" pointer-events="none"></g>'); // filled by the measuring tool
  s.push('</svg>');
  return s.join('');
}

/** A short name for tags on the board (e.g. "仲裁者士官", "Boy #2"). */
function shortName(o) {
  const t = tpl(o), n = getLang() === 'zh' ? t.name.zh : t.name.en;
  return t.count > 1 ? `${n} #${o.num}` : n;
}

function shortLabel(o) {
  const t = tpl(o);
  const abbrev = { sgt: '★', boss: '★', shasui: '★', gunner: 'P', plasma: 'P', melta: 'M', assault: 'A', burna: 'B', rokkit: 'R', rail: 'R', ion: 'I' };
  return abbrev[t.id] || String(o.num);
}
