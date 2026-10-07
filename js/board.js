import { BOARD, DEPLOY, OBJ_R, CONTROL, controller, isInjured, opName, radius, team, tpl } from './game.js';
import { getLang, tx } from './i18n.js';

const f = (n) => +n.toFixed(3);

/** Two-sided tabletop-style order marker; counteraction gets a separate marker. */
function operativeTokens(o) {
  const conceal = o.order === 'conceal', ready = !!o.ready;
  const order = getLang() === 'zh' ? (conceal ? '隱蔽' : '交戰') : (conceal ? 'Conceal' : 'Engage');
  const state = getLang() === 'zh' ? (ready ? '待行動' : '已行動') : (ready ? 'Ready' : 'Expended');
  const icon = conceal
    ? '<path class="token-symbol" d="M-.23 .03Q0-.22 .23 .03Q0 .24-.23 .03Z"/><circle class="token-symbol" cy=".03" r=".07"/><path class="token-symbol" d="M-.24 .23 .24-.22"/>'
    : '<circle class="token-symbol" r=".16"/><path class="token-symbol" d="M-.27 0H-.08M.08 0H.27M0-.27V-.08M0 .08V.27"/>';
  return `<g class="order-token ${conceal ? 'conceal' : 'engage'} ${ready ? 'ready' : 'expended'}" role="img" aria-label="${order} · ${state}">
    <title>${order} · ${state}</title><path class="token-face" d="M-.43-.37H.43L0 .42Z"/>
    ${icon}${ready ? '' : '<path class="token-used" d="M.19 .27 .25 .33 .36 .19"/>'}
  </g>${o.counteracted ? counteractToken() : ''}${crossfireToken(o)}`;
}

/** Crossfire tokens (Brood Brothers) on an enemy: a small badge with how many. */
function crossfireToken(o) {
  const n = (o.crossfire || []).reduce((s, x) => s + (x || 0), 0);
  if (!n) return '';
  const zh = getLang() === 'zh';
  return `<g class="crossfire-token" transform="translate(0 ${o.counteracted ? 1.9 : .95})" role="img" aria-label="${zh ? `交叉火力 ${n}` : `Crossfire ${n}`}">
    <title>${zh ? `交叉火力標記 ×${n}` : `Crossfire tokens ×${n}`}</title>
    <circle class="token-face" r=".35"/><text class="token-num" y=".13" text-anchor="middle">${n}</text>
  </g>`;
}

function counteractToken() {
  return `<g class="counteract-token" transform="translate(0 .95)" role="img" aria-label="${getLang() === 'zh' ? '已反應' : 'Counteracted'}">
    <title>${getLang() === 'zh' ? '本回合已反應' : 'Counteracted this turning point'}</title>
    <circle class="token-face" r=".35"/><path class="token-symbol" d="M.2-.1A.22 .22 0 1 0 .19 .14M.2-.1V-.28M.2-.1H.02"/>
  </g>`;
}

export function tokenLegend() {
  const item = (order, ready, label, counteracted = false) => `<span class="token-key"><svg viewBox="-.5 -.45 1 ${counteracted ? 1.8 : 1}" aria-hidden="true">${operativeTokens({ order, ready, counteracted })}</svg>${label}</span>`;
  return `<div class="token-legend" aria-label="${getLang() === 'zh' ? 'Token 圖例' : 'Token legend'}">${[
    item('engage', true, getLang() === 'zh' ? '交戰' : 'Engage'),
    item('conceal', true, getLang() === 'zh' ? '隱蔽' : 'Conceal'),
    item('engage', false, getLang() === 'zh' ? '暗面＋勾：已行動' : 'Dark + tick: expended'),
    `<span class="token-key"><svg viewBox="-.5 .5 1 1" aria-hidden="true">${counteractToken()}</svg>${getLang() === 'zh' ? '已反應' : 'Counteracted'}</span>`,
  ].join('')}</div>
  <div class="token-legend terrain-legend" aria-label="${getLang() === 'zh' ? '掩體圖例' : 'Cover legend'}">${[
    ['heavy', getLang() === 'zh' ? '重' : 'H', getLang() === 'zh' ? '重掩體：可擋住視線，提供掩護與遮蔽' : 'Heavy cover: can block sight; gives cover and obscuring'],
    ['light', getLang() === 'zh' ? '輕' : 'L', getLang() === 'zh' ? '輕掩體：不擋視線，只提供掩護' : 'Light cover: doesn\'t block sight, gives cover only'],
    ['wire', getLang() === 'zh' ? '網' : 'W', getLang() === 'zh' ? '鐵絲網：穿越多算 1"' : 'Razor wire: crossing it costs 1" more'],
  ].map(([k, lab, txt]) => `<span class="token-key"><svg viewBox="-.5 -.5 1 1" aria-hidden="true" class="terrain-key"><rect class="${k}" x="-.46" y="-.3" width=".92" height=".6" ${k === 'light' ? 'fill="url(#hatchKey)"' : ''}/><g class="tlabel tl-${k}"><rect x="-.24" y="-.24" width=".48" height=".48" rx=".12"/><text y=".15">${lab}</text></g></svg>${txt}</span>`).join('')}
    <svg width="0" height="0" style="position:absolute"><defs><pattern id="hatchKey" width="0.2" height="0.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="0.2" height="0.2" fill="var(--light-t)"/><line x1="0" y1="0" x2="0" y2="0.2" stroke="var(--light-s)" stroke-width="0.08"/></pattern></defs></svg></div>
  <div class="token-legend role-legend" aria-label="${getLang() === 'zh' ? '特工圖示' : 'Operative icons'}">${Object.entries(ROLE_ICON).map(([k, icon]) => `<span class="token-key"><svg class="role-key" viewBox="-.5 -.5 1 1" aria-hidden="true"><circle r=".5" class="rk-bg"/>${roleGlyph(k, 0.3)}</svg>${{
    leader: ['領袖', 'Leader'], medic: ['醫療', 'Medic'], psyker: ['靈能', 'Psyker'], support: ['支援', 'Support'], heavy: ['重武器', 'Heavy weapon'], melee: ['近戰', 'Melee'], ranged: ['射手', 'Shooter'],
  }[k][getLang() === 'zh' ? 0 : 1]}</span>`).join('')}<span class="token-key">${getLang() === 'zh' ? '右下小字＝編號' : 'small number = operative #'}</span></div>`;
}

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
  // Each piece of cover is labelled: 重 (Heavy) / 輕 (Light) / 網 (razor wire), in its middle.
  const zh = getLang() === 'zh';
  for (const t of g.terrain) {
    const lab = { heavy: zh ? '重' : 'H', light: zh ? '輕' : 'L', wire: zh ? '網' : 'W' }[t.kind] || (zh ? '輕' : 'L');
    const kind = t.kind === 'heavy' ? 'heavy' : t.kind === 'wire' ? 'wire' : 'light';
    const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
    s.push(`<g class="tlabel tl-${kind}" transform="translate(${f(cx)} ${f(cy)})" pointer-events="none"><rect x="-.24" y="-.24" width=".48" height=".48" rx=".12"/><text y=".15">${lab}</text></g>`);
  }

  for (const o of g.objectives) {
    const c = controller(g, o);
    const col = c == null ? 'var(--obj)' : team(g, c).color;
    s.push(`<circle cx="${o.x}" cy="${o.y}" r="${OBJ_R + CONTROL}" fill="none" stroke="${col}" stroke-width="0.04" stroke-dasharray="0.2 0.15" opacity="0.6" pointer-events="none"/>`);
    s.push(`<circle cx="${o.x}" cy="${o.y}" r="${OBJ_R}" fill="${col}" stroke="var(--obj-s)" stroke-width="0.06" pointer-events="none"/>`);
    s.push(`<text x="${o.x}" y="${o.y + 0.16}" class="objtxt" pointer-events="none">${o.id + 1}</text>`);
  }

  // Obelisk Node Matrix (Canoptek Circle): 20mm-wide lines between a side's nodes within 6" of each other.
  for (const side of [0, 1]) {
    const nodes = (g.markers || []).filter((m) => m.kind === 'obeliskNode' && m.owner === side);
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) > 6) continue;
      s.push(`<line x1="${f(nodes[i].x)}" y1="${f(nodes[i].y)}" x2="${f(nodes[j].x)}" y2="${f(nodes[j].y)}" class="matrix" stroke="${team(g, side).color}" pointer-events="none"/>`);
    }
  }
  // Mission markers on the ground (carried ones are drawn on their carrier).
  for (const m of g.markers || []) {
    if (m.carriedBy) continue;
    const c = controller(g, m);
    const col = c == null ? 'var(--obj)' : team(g, c).color;
    s.push(`<rect x="${f(m.x - 0.35)}" y="${f(m.y - 0.35)}" width="0.7" height="0.7" rx="0.12" class="mmarker ${m.kind}" stroke="${col}" pointer-events="none"/>`);
    const sym = { infocore: '◆', retrieval: 'R', mine: '✸', ammo: '▣', comms: '⌁', meltaMine: '☢', grisly: '☠', explosives: '💣', obeliskNode: '◭' }[m.kind] || '✦';
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
    // Celestian Insidiants: a gold halo while inspiring; the Censor's null range.
    if (o.inspiring) s.push(`<circle r="${f(r + 0.12)}" class="inspireRing"/>`);
    if (tpl(o).nullField) s.push(`<circle r="${f(r + (o.nullRange || 1))}" class="nullRing"/>`);
    // Role icon in the middle, its number small in the lower right.
    s.push(roleGlyph(roleOf(g, o), Math.min(0.26, r * 0.5)));
    s.push(`<text x="${f(r * 0.55)}" y="${f(r * 0.78)}" class="opnum">${o.num}</text>`);
    // wound bar
    const w = r * 1.8, pct = o.wounds / o.maxW;
    s.push(`<rect x="${f(-w / 2)}" y="${f(r + 0.08)}" width="${f(w)}" height="0.16" class="wbg"/>`);
    s.push(`<rect x="${f(-w / 2)}" y="${f(r + 0.08)}" width="${f(w * pct)}" height="0.16" class="wfg ${isInjured(o) ? 'inj' : ''}"/>`);
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
  // Draw markers above all bases so neighbouring operatives cannot cover them.
  // Keep them within the killzone, and let clicks pass through to the board.
  for (const o of g.ops) {
    if (o.dead || o.x < -50) continue;
    const r = radius(o), right = o.x + r + .65;
    const x = right + .43 <= BOARD.w ? right : o.x - r - .65;
    const y = Math.max(.4, Math.min(BOARD.h - (o.counteracted ? 1.35 : .45), o.y));
    s.push(`<g class="operative-tokens" data-token-for="${o.uid}" transform="translate(${f(Math.max(.45, x))} ${f(y)})">${operativeTokens(o)}</g>`);
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

// ---------- operative role icons ----------
const LEADER_NAME = /sergeant|leader|boss|nob\b|captain|commander|exarch|archon|felarch|shas'ui|chieftain|watchmaster|champion|despotek|technomancer|geomancer|theyn|sorcerer|superior|patriarch|primus|magus|proctor|kill broker|technoarcheologist|alpha|kommando boss|veteran sergeant|brother-sergeant|cryptek|tyrant|keeper|kâhl|kahl|herald|lord/i;
const SUPPORT_KEYS = ['signal', 'signalAny', 'support', 'jam', 'jamToken', 'markerlight', 'panScan', 'systemJam', 'pulse', 'auspex', 'battleComms', 'tacticalCommand',
  'canoptekControl', 'networkOverride', 'overcharge', 'datacoronal', 'omniscanner', 'eyeAbove', 'pechra', 'veriscant', 'interstitial', 'confidant', 'tactician'];
export const ROLE_ICON = { leader: '★', medic: '✚', psyker: '✦', support: '◎', heavy: '◆', melee: '⚔', ranged: '⌖' };
/** The role icon as SVG shapes (drawn, not a font glyph, so it reads the same everywhere), centred on 0,0 with half-size s. */
export function roleGlyph(role, s = 0.22) {
  const k = (n) => f(n * s);
  const star = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 0.42 : 1; return `${k(Math.cos(a) * rr)},${k(Math.sin(a) * rr)}`; }).join(' ');
  const shapes = {
    leader: `<polygon points="${star}" class="rg-fill"/>`,
    medic: `<path d="M${k(-0.3)} ${k(-0.95)}h${k(0.6)}v${k(0.65)}h${k(0.65)}v${k(0.6)}h${k(-0.65)}v${k(0.65)}h${k(-0.6)}v${k(-0.65)}h${k(-0.65)}v${k(-0.6)}h${k(0.65)}z" class="rg-fill"/>`,
    psyker: `<path d="M${k(0.25)} ${k(-1)}L${k(-0.55)} ${k(0.15)}H${k(0)}L${k(-0.25)} ${k(1)}L${k(0.6)} ${k(-0.2)}H${k(0.05)}z" class="rg-fill"/>`,
    support: `<circle r="${k(0.28)}" class="rg-fill"/><path d="M${k(-0.55)} ${k(-0.55)}A${k(0.78)} ${k(0.78)} 0 0 0 ${k(-0.55)} ${k(0.55)}M${k(0.55)} ${k(-0.55)}A${k(0.78)} ${k(0.78)} 0 0 1 ${k(0.55)} ${k(0.55)}" class="rg-line"/>`,
    heavy: `<polygon points="0,${k(-1)} ${k(0.85)},0 0,${k(1)} ${k(-0.85)},0" class="rg-fill"/>`,
    melee: `<path d="M${k(-0.85)} ${k(-0.85)}L${k(0.85)} ${k(0.85)}M${k(0.85)} ${k(-0.85)}L${k(-0.85)} ${k(0.85)}M${k(-0.85)} ${k(0.35)}L${k(-0.35)} ${k(0.85)}M${k(0.85)} ${k(0.35)}L${k(0.35)} ${k(0.85)}" class="rg-line"/>`,
    ranged: `<circle r="${k(0.6)}" class="rg-line"/><path d="M0 ${k(-1)}V${k(-0.3)}M0 ${k(0.3)}V${k(1)}M${k(-1)} 0H${k(-0.3)}M${k(0.3)} 0H${k(1)}" class="rg-line"/>`,
  };
  return `<g class="role-glyph" style="--rgw:${k(0.28)}px">${shapes[role]}</g>`;
}
/** What an operative is for, at a glance: leader, medic, psyker, support, heavy weapon, fighter or shooter. */
export function roleOf(g, o) {
  const t = tpl(o), tm = team(g, o.side);
  if (o.side < 2 && (t === tm.ops[0] || t.bbLeader || t.ccLeader || t.exarch || LEADER_NAME.test(t.name.en))) return 'leader';
  if (t.medic || t.medikit || t.stimms) return 'medic';
  if (t.psyker || t.destiny) return 'psyker';
  if (SUPPORT_KEYS.some((k) => t[k])) return 'support';
  const ws = t.loadouts?.[o.loadout] || t.weapons || [];
  const r = ws.filter((w) => w.type === 'ranged'), m = ws.filter((w) => w.type === 'melee');
  if (r.some((w) => w.rules.heavy || w.rules.devastating || w.rules.blast || w.rules.torrent || w.rules.hot || (w.rules.piercing || 0) >= 2)) return 'heavy';
  const best = (list) => Math.max(0, ...list.map((w) => w.atk * w.dmg[0]));
  return best(m) > best(r) * 1.1 ? 'melee' : 'ranged';
}
