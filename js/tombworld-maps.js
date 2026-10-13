import { TOMB_WORLD_COMPONENTS as PARTS } from './data/tombworld.js';

// Independently transcribed schematic layouts from Moya_information.pdf pp.48–53.
// Coordinates are inches on the user's 28 × 24 board, origin at top left.
// The printed cards are schematic: run endpoints are adapted to this board;
// component catalogue measurements remain the reference for physical assembly.
const run = (id, x, y, x1, y1) => ({ id, x, y, x1, y1 });
const cover = (id, x, y, rotation = 0) => ({ id, x, y, rotation });
const layouts = [
  {
    runs: [run('B4',12,0,12,4),run('A3',12,4,12,12),run('A1',16,0,16,8),run('B2',16,8,16,12),run('A3',24,4,24,12),run('A1',24,12,24,20),run('B3',24,20,24,24),run('B4',4,12,8,12),run('B3',8,12,12,12),run('A4',12,12,20,12),run('B1',20,12,24,12),run('B1',4,12,4,16),run('A4',4,16,4,24),run('A2',10,20,18,20)],
    covers: [cover('C1',5.1,6.5),cover('C5',8.8,4.7),cover('C3',19.8,.9),cover('C4',8,16),cover('C2',20,16)],
    pads: [[14,10],[14,22]], objectives: [[10,2.4],[18,6],[14,16]],
  },
  {
    runs: [run('B2',8,0,8,4),run('B3',16,0,16,4),run('B1',4,4,8,4),run('A1',8,4,16,4),run('A3',4,4,4,12),run('A4',4,12,12,12),run('B2',12,8,12,12),run('A1',16,4,16,12),run('B4',16,12,16,16),run('A2',16,12,24,12),run('B1',24,8,24,12),run('A4',24,12,24,20),run('A2',12,12,12,20),run('A3',12,20,20,20),run('B4',20,20,24,20),run('B3',12,20,12,24)],
    covers: [cover('C1',5.1,20),cover('C3',7.1,8),cover('C2',20,8),cover('C4',23.4,4),cover('C5',16,23)],
    pads: [[10,8],[18,14]], objectives: [[12,2.4],[14,12],[16,22]],
  },
  {
    runs: [run('A3',8,0,8,8),run('A3',24,0,24,8),run('B1',12,4,16,4),run('B1',4,8,8,8),run('B2',8,8,12,8),run('A2',12,8,20,8),run('B3',20,8,24,8),run('A4',4,8,4,16),run('A1',20,8,20,16),run('B3',4,16,8,16),run('A2',8,16,16,16),run('B2',16,16,20,16),run('A1',4,16,4,24),run('A4',20,16,20,24),run('B4',12,20,16,20)],
    covers: [cover('C3',4.9,3.1),cover('C1',20,4),cover('C2',8,12),cover('C5',8.3,20),cover('C4',24,20)],
    pads: [[10,4],[18,20]], objectives: [[17.2,4],[14,12],[10.8,20]],
  },
  {
    runs: [run('B3',0,4,4,4),run('B1',4,4,8,4),run('B4',8,4,12,4),run('A3',12,4,20,4),run('A4',8,4,8,12),run('A2',20,4,20,12),run('A1',0,12,8,12),run('B2',8,12,12,12),run('B2',16,12,20,12),run('A3',20,12,28,12),run('A2',8,12,8,20),run('A4',20,12,20,20),run('B3',0,20,4,20),run('B1',4,20,8,20),run('A1',8,20,16,20),run('B4',16,20,20,20)],
    covers: [cover('C1',25,6.5),cover('C3',16.8,8),cover('C4',4,8),cover('C5',11.3,16),cover('C2',24,16)],
    pads: [[6.1,14],[22,10]], objectives: [[5.5,8],[14,12],[22.2,16]],
  },
  {
    runs: [run('A1',4,4,12,4),run('B3',12,4,12,8),run('A3',12,8,20,8),run('A3',20,8,28,8),run('A4',0,12,8,12),run('A2',8,12,8,20),run('A2',12,8,12,16),run('B2',12,16,12,20),run('B1',20,8,20,12),run('B2',20,12,20,16),run('B1',20,16,20,20),run('B4',20,12,24,12),run('A4',0,20,8,20),run('B3',12,20,16,20),run('B4',16,20,20,20),run('A1',20,20,28,20)],
    covers: [cover('C1',8,8,90),cover('C3',20,4),cover('C4',4,16),cover('C2',16,16,90),cover('C5',16.8,12)],
    pads: [[2,14],[22,10]], objectives: [[5.8,8],[15.4,12],[24,16]],
  },
  {
    runs: [run('B3',0,4,4,4),run('A2',4,4,12,4),run('A1',12,4,20,4),run('A4',20,4,28,4),run('A1',12,4,12,12),run('B4',6,8,6,12),run('B2',12,12,16,12),run('B4',16,12,20,12),run('B1',20,12,24,12),run('A4',0,16,8,16),run('B1',8,16,12,16),run('B2',12,12,12,16),run('B3',12,16,12,20),run('A3',20,12,20,20),run('A2',12,20,20,20),run('A3',20,20,28,20)],
    covers: [cover('C1',26.3,16,90),cover('C3',24,8),cover('C4',16,8),cover('C2',1.2,11,90),cover('C5',17.6,16)],
    pads: [[8,10],[22,18]], objectives: [[2.7,12],[20,8],[16,16]],
  },
];

export const TOMB_WORLD_MAPS = layouts.map((m, i) => ({
  ...m, id: `tombworld-${i + 1}`, number: String(i + 1).padStart(2, '0'),
  name: { zh: `Tombworld（墓穴世界）${String(i + 1).padStart(2, '0')}`, en: `Tomb World ${String(i + 1).padStart(2, '0')}` },
  board: { w: 28, h: 24, grid: 4 }, axis: i < 3 ? 'x' : 'y',
  // Player A is right on 01–03 and top on 04–06.
  deploy: i < 3 ? [{x0:24,x1:28,y0:0,y1:24},{x0:0,x1:4,y0:0,y1:24}]
    : [{x0:0,x1:28,y0:0,y1:4},{x0:0,x1:28,y0:20,y1:24}],
  objectives: m.objectives.map(([x,y], j) => ({ x,y,centre:j === (i === 0 ? 2 : 1) })),
  pads: m.pads.map(([x,y]) => ({x,y,diameter:2.25})),
}));

/** Ground-level geometry: open hatchways and B2 holes leave actual gaps.
 * Lintels are omitted from this flat-board simulation, not treated as floor obstacles.
 */
export function tombWorldAccessPoints(map) {
  return map.runs.flatMap((r,i) => {
    const opening = PARTS[r.id].opening;
    return opening ? [{id:`access-${i}`,component:r.id,kind:opening.type === 'door' ? 'hatchway':'breach',
      x:(r.x+r.x1)/2,y:(r.y+r.y1)/2,axis:r.y === r.y1 ? 'y':'x',width:opening.width,moveCost:2}] : [];
  });
}

export function tombWorldAccessSvg(access, zh = true) {
  return access.map(d => {
    const horizontal = d.axis === 'y';
    const closed = d.kind === 'hatchway' && d.state !== 'open';
    const label = d.kind === 'hatchway' ? `${zh ? '門':'Door'}${Number(d.id.split('-')[1])+1} ${closed ? zh ? '關':'closed' : zh ? '開 +2″':'open +2″'}` : `${zh ? '洞':'Breach'} +2″`;
    return `<g class="tw-access ${closed ? 'tw-access-closed':'tw-access-open'}" pointer-events="none"><title>${d.component} · ${label}${d.kind === 'hatchway' ? ' · 1AP' : ''}</title><rect x="${d.x-(horizontal ? d.width/2:.16)}" y="${d.y-(horizontal ? .16:d.width/2)}" width="${horizontal ? d.width:.32}" height="${horizontal ? .32:d.width}"/><text x="${d.x+(horizontal ? 0:.45)}" y="${d.y+(horizontal ? -.4:.18)}" text-anchor="${horizontal ? 'middle':'start'}">${label}</text></g>`;
  }).join('');
}

export const initialHatches = (map) => Object.fromEntries(tombWorldAccessPoints(map).filter(d=>d.kind === 'hatchway').map(d=>[d.id,'closed']));
export const hatchLeaf = (d) => ({kind:'heavy',twWall:true,role:'hatch',hatchId:d.id,component:d.component,height:2,
  x:d.x-(d.axis === 'x' ? .125:d.width/2),y:d.y-(d.axis === 'x' ? d.width/2:.125),
  w:d.axis === 'x' ? .25:d.width,h:d.axis === 'x' ? d.width:.25});

export function tombWorldTerrain(map, hatches = initialHatches(map)) {
  const terrain = [], pillars = new Set();
  for (const r of map.runs) {
    const c = PARTS[r.id], horizontal = r.y === r.y1, length = Math.hypot(r.x1-r.x,r.y1-r.y);
    const a = horizontal ? r.x : r.y, cross = horizontal ? r.y : r.x;
    const rect = (start, span, depth = c.thickness) => {
      if (span <= 0) return;
      terrain.push({kind:'heavy',twWall:true,component:r.id,height:c.height,
        x:horizontal ? start : Math.max(0,Math.min(28-depth,cross-depth/2)),y:horizontal ? Math.max(0,Math.min(24-depth,cross-depth/2)) : start,
        w:horizontal ? span : depth,h:horizontal ? depth : span});
    };
    const opening = c.opening;
    if (opening) {
      const wing = (length-opening.width)/2;
      rect(a,wing); rect(a+wing+opening.width,wing);
    } else rect(a,length);
    if (c.squareThickness) for (const [x,y] of [[r.x,r.y],[r.x1,r.y1]]) {
      const size=c.squareThickness, px=Math.max(0,Math.min(28-size,x-size/2)),py=Math.max(0,Math.min(24-size,y-size/2));
      const key=`${px},${py}`;
      if (pillars.has(key)) continue;
      pillars.add(key);terrain.push({kind:'heavy',twWall:true,component:r.id,role:'pillar',height:c.height,x:px,y:py,w:size,h:size});
    }
  }
  for (const p of map.covers) {
    const c=PARTS[p.id], w=p.rotation ? c.width:c.length,h=p.rotation ? c.length:c.width;
    terrain.push({kind:'light',component:p.id,height:c.height,x:p.x-w/2,y:p.y-h/2,w,h});
  }
  for(const d of tombWorldAccessPoints(map)) if(d.kind === 'hatchway' && hatches[d.id] !== 'open') terrain.push(hatchLeaf(d));
  return terrain;
}

export function tombWorldMapSvg(map, zh = true) {
  const zones=map.deploy.map((z,i)=>`<rect x="${z.x0}" y="${z.y0}" width="${z.x1-z.x0}" height="${z.y1-z.y0}" fill="${i ? '#e59b69':'#75a8b7'}" opacity=".25"/><text x="${(z.x0+z.x1)/2}" y="${(z.y0+z.y1)/2}" class="tw-map-zone">${i ? 'B':'A'}</text>`).join('');
  const solids=tombWorldTerrain(map).map(t=>`<rect x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" class="${t.kind === 'light' ? 'tw-light':'tw-solid'}"/>`).join('');
  const labels=map.runs.map(r=>`<text x="${(r.x+r.x1)/2+.5}" y="${(r.y+r.y1)/2-.5}" class="tw-map-label">${r.id}</text>`).join('')+map.covers.map(c=>`<text x="${c.x}" y="${c.y+.2}" class="tw-map-label">${c.id}</text>`).join('');
  const pads=map.pads.map(p=>`<g class="tw-pad"><circle cx="${p.x}" cy="${p.y}" r="1.125"/><text x="${p.x}" y="${p.y+.22}">T</text></g>`).join('');
  const objectives=map.objectives.map((p,i)=>`<g class="tw-map-objective"><circle cx="${p.x}" cy="${p.y}" r="1.4"/><circle cx="${p.x}" cy="${p.y}" r=".4"/><text x="${p.x}" y="${p.y+.23}">${i+1}</text></g>`).join('');
  const grid=Array.from({length:6},(_,i)=>`<path d="M${(i+1)*4} 0V24"/>`).join('')+Array.from({length:5},(_,i)=>`<path d="M0 ${(i+1)*4}H28"/>`).join('');
  return `<svg class="tw-map" viewBox="-.7 -.7 29.4 25.4" role="img" aria-label="Tomb World ${map.number}, 28 × 24 inches"><rect width="28" height="24" class="tw-map-mat"/>${zones}<g class="tw-map-grid">${grid}</g>${solids}${labels}${pads}${objectives}${tombWorldAccessSvg(tombWorldAccessPoints(map).map(d=>({...d,state:d.kind === 'hatchway' ? 'closed':'open'})),zh)}</svg>`;
}
