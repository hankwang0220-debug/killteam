import { TOMB_WORLD_BOARD, TOMB_WORLD_COMPONENTS } from './data/tombworld.js';
import { L } from './i18n.js';

// Local 3D boxes in inches. x/y form the footprint; z/height are vertical.
// End pillars are included in overall length and occupy shared footprints at joins.
export function buildTombWorldComponent(id, state = 'closed') {
  const c = TOMB_WORLD_COMPONENTS[id];
  if (!c) throw new Error(`Unknown Tomb World component: ${id}`);
  if (id === 'T') throw new Error('Teleport pad pattern awaits the user');
  if (!['closed', 'open', 'intact', 'breached'].includes(state)) throw new Error('Invalid terrain preview state');
  const box = (x, y, z, length, width, height, role = 'body') => ({ x, y, z, length, width, height, role });
  if (c.type === 'cover') return { ...c, state, solids: [box(0, 0, 0, c.length, c.width, c.height)] };
  const opening = c.opening || (c.breach && state === 'breached' ? c.breach.openingAfterBreach : null);
  const width = c.thickness;
  const pillar = c.squareThickness || 0;
  const start = pillar, end = c.length - pillar;
  const solids = [];
  if (!opening) solids.push(box(start, 0, 0, end - start, width, c.height));
  else {
    const left = (c.length - opening.width) / 2;
    solids.push(box(start, 0, 0, left - start, width, c.height));
    solids.push(box(left + opening.width, 0, 0, end - left - opening.width, width, c.height));
    solids.push(box(left, 0, opening.height, opening.width, width, c.height - opening.height, 'lintel'));
    if (opening.type === 'door' && state !== 'open') solids.push(box(left, 0, 0, opening.width, width, opening.height, 'door'));
  }
  if (pillar) {
    const y = (width - pillar) / 2;
    solids.push(box(0, y, 0, pillar, pillar, c.height, 'pillar'));
    solids.push(box(c.length - pillar, y, 0, pillar, pillar, c.height, 'pillar'));
  }
  return { ...c, width, state, opening, solids,
    footprintWidth: pillar || width, footprintY: pillar ? (width - pillar) / 2 : 0,
    squarePositionsPending: false };
}

/** Place component boxes and merge coincident shared pillars (including rotated joins). */
export function assembleTombWorldComponents(placements) {
  const solids = [], pillars = new Map();
  const components = placements.map((p, index) => {
    const c = buildTombWorldComponent(p.id, p.state || (p.id === 'A1' ? 'intact' : 'closed'));
    const x = p.x ?? 0, y = p.y ?? 0, rotation = p.rotation ?? 0;
    if (![x, y, rotation].every(Number.isFinite) || rotation % 90 !== 0) throw new Error('Placement requires finite coordinates and right-angle rotation');
    const angle = rotation * Math.PI / 180, cos = Math.cos(angle), sin = Math.sin(angle);
    const snap = (n) => Math.round(n * 1e6) / 1e6;
    for (const s of c.solids) {
      const points = [[s.x, s.y], [s.x + s.length, s.y], [s.x, s.y + s.width], [s.x + s.length, s.y + s.width]]
        .map(([sx, sy]) => ({ x: snap(x + sx * cos - sy * sin), y: snap(y + sx * sin + sy * cos) }));
      const minX = Math.min(...points.map((v) => v.x)), minY = Math.min(...points.map((v) => v.y));
      const placed = { ...s, x: minX, y: minY, length: snap(Math.max(...points.map((v) => v.x)) - minX), width: snap(Math.max(...points.map((v) => v.y)) - minY), owners: [index] };
      const key = [placed.x, placed.y, placed.z, placed.length, placed.width, placed.height].map(snap).join(',');
      if (s.role === 'pillar' && pillars.has(key)) pillars.get(key).owners.push(index);
      else { solids.push(placed); if (s.role === 'pillar') pillars.set(key, placed); }
    }
    return { id: p.id, x, y, rotation, state: c.state };
  });
  const bounds = solids.length ? {
    x: Math.min(...solids.map((s) => s.x)), y: Math.min(...solids.map((s) => s.y)),
    x1: Math.max(...solids.map((s) => s.x + s.length)), y1: Math.max(...solids.map((s) => s.y + s.width)),
  } : null;
  return { components, solids, bounds };
}

const round = (n) => +n.toFixed(3);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function tombWorldComponentSvg(id, state, view = 'front') {
  if (!['front', 'top'].includes(view)) throw new Error('Invalid terrain preview view');
  const c = buildTombWorldComponent(id, state), front = view === 'front';
  const depth = front ? c.height : c.footprintWidth || c.width;
  const offsetY = front ? 0 : -(c.footprintY || 0);
  const shapes = c.solids.map((s) => {
    const y = front ? c.height - s.z - s.height : s.y + offsetY;
    const height = front ? s.height : s.width;
    return `<rect class="tw-solid tw-${s.role}${c.kind === 'light' ? ' tw-light' : ''}" x="${round(s.x)}" y="${round(y)}" width="${round(s.length)}" height="${round(height)}"/>`;
  }).join('');
  const title = `${id} · ${front ? L('正面', 'Front') : L('俯視', 'Top')} · ${c.length}″ × ${depth}″`;
  // Hole guides show the ground-level passage separately from the overhead lintel.
  const openingGuide = c.opening && (c.opening.type === 'hole' || state === 'open')
    ? `<rect class="tw-opening" x="${round((c.length - c.opening.width) / 2)}" y="${front ? round(c.height - c.opening.height) : offsetY}" width="${c.opening.width}" height="${front ? c.opening.height : c.width}"/>` : '';
  const breachGuide = c.breach && state !== 'breached'
    ? `<rect class="tw-breach-guide" x="${round((c.length - c.breach.openingAfterBreach.width) / 2)}" y="${front ? round(c.height - c.breach.openingAfterBreach.height) : offsetY}" width="${c.breach.openingAfterBreach.width}" height="${front ? c.breach.openingAfterBreach.height : c.width}"/>` : '';
  return `<svg class="tw-preview ${front ? 'tw-front' : 'tw-top'}" viewBox="-.15 -.15 ${round(c.length + .3)} ${round(depth + .3)}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${shapes}${openingGuide}${breachGuide}</svg>`;
}

export function tombWorldView(states = {}) {
  const card = (c) => {
    const state = states[c.id] || (c.breach ? 'intact' : 'closed');
    const depth = c.width || c.thickness;
    const opening = c.opening || c.breach?.openingAfterBreach;
    const toggle = c.opening?.type === 'door' ? `<button data-act="twstate" data-id="${c.id}">${state === 'open' ? L('關閉門', 'Close door') : L('打開門', 'Open door')}</button>`
      : c.breach ? `<button data-act="twstate" data-id="${c.id}">${state === 'breached' ? L('恢復完整牆', 'Restore wall') : L('預覽破牆', 'Preview breach')}</button>` : '';
    return `<article class="card tw-component"><h3>${c.id} <small>${c.type === 'cover' ? L('輕掩體', 'Light cover') : L('牆體', 'Wall')}</small></h3>
      <p class="tw-dimensions">${L('長', 'Length')} ${c.length}″ · ${c.type === 'cover' ? L('寬', 'Width') : L('厚', 'Thickness')} ${depth}″ · <b>${L('高', 'Height')} ${c.height}″</b></p>
      <div class="tw-views"><figure><figcaption>${L('俯視', 'Top')}</figcaption>${tombWorldComponentSvg(c.id, state, 'top')}</figure><figure><figcaption>${L('正面高度', 'Front elevation')}</figcaption>${tombWorldComponentSvg(c.id, state, 'front')}</figure></div>
      ${opening ? `<p>${c.breach ? L('破牆後洞口', 'Opening after breach') : c.opening.type === 'door' ? L('中央門', 'Central door') : L('中央洞口', 'Central opening')}：${L('寬', 'Width')} ${opening.width}″ × ${L('高', 'Height')} ${opening.height}″</p>` : ''}
      ${c.squareThickness ? `<p class="hint small">${L('兩端柱子為 1.25″ 正方形，已包含在總長內；組件相接時共用重疊柱位。', 'The 1.25″ square end pillars are included in overall length; joined components share the overlapping pillar.')}</p>` : ''}
      ${toggle ? `<div class="tw-state">${toggle}<span>${c.breach ? state === 'breached' ? L('已破牆', 'Breached') : L('完整牆', 'Intact') : state === 'open' ? L('門已開', 'Door open') : L('門已關', 'Door closed')}</span></div>` : ''}
    </article>`;
  };
  return `<main class="tw-catalogue"><div class="tw-heading"><div><h1>${L('墓穴世界地形', 'Tomb World Terrain')}</h1><p>${TOMB_WORLD_BOARD.length}″ × ${TOMB_WORLD_BOARD.width}″ · ${L('網格間隔', 'Grid spacing')} ${TOMB_WORLD_BOARD.gridSpacing}″</p></div><button data-act="home">${L('返回', 'Back')}</button></div>
    <p>${L('13 種非 T 組件的尺寸示意；俯視與正面均按比例繪製。門洞上方仍有 0.6″ 牆體，虛線標示通道或破牆位置。', 'Dimension previews for the 13 non-T components, drawn to scale in top and front views. Openings retain a 0.6″ lintel; dashed guides mark passages or breach points.')}</p>
    <p class="hint">${L('兩端正方形柱已包含在組件長度內；拼接時柱位重疊，不再另加長度。T 僅保留直徑、高度與 1AP 傳送資料，圖樣待提供。這裡的門與破牆按鈕是組件預覽。', 'Square end pillars are included in component length and overlap at joins. T retains its diameter, height and 1AP teleport data pending its pattern. Door and breach buttons here control the component preview.')}</p>
    <div class="tw-components">${Object.values(TOMB_WORLD_COMPONENTS).filter((c) => c.id !== 'T').map(card).join('')}</div></main>`;
}
