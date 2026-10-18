// Procedural 3D terrain: the default killzone's ruins and barricades, the mission maps, Tomb World walls,
// hatchways, sarcophagus cover and teleport pads, universal equipment terrain (barricades, razor wire, ladder)
// and markers. Units are inches; a board's (x, y) maps to 3D (x, z) with the board's top-left at the origin,
// so the 2D terrain rectangles can be used as they are. Heights follow the climbing rules: Light 2",
// Heavy 2.6", Heavy Barricade 3" unless a piece gives its own `height`.

export const HEIGHTS = { light: 2, heavy: 2.6, heavyBarricade: 3, wire: 0.6 };

export function createTerrainKit(THREE) {
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const UP = V(0, 1, 0);
  const mats = new Map();
  const mat = (color, o = {}) => {
    const key = `${color}|${o.metal ?? 0}|${o.rough ?? 0.8}|${o.glow ?? ''}|${o.opacity ?? 1}`;
    if (!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial({
      color, metalness: o.metal ?? 0.1, roughness: o.rough ?? 0.8, flatShading: true,
      emissive: o.glow ? new THREE.Color(o.glow) : new THREE.Color(0), emissiveIntensity: o.glow ? 1.3 : 0,
      transparent: (o.opacity ?? 1) < 1, opacity: o.opacity ?? 1,
    }));
    return mats.get(key);
  };
  const glow = (c) => mat(c, { glow: c, rough: 0.4 });
  const mesh = (geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o; };
  const box = (w, h, d, m, x, y, z) => mesh(new THREE.BoxGeometry(w, h, d), m, x, y, z);
  const cyl = (rt, rb, h, m, x, y, z, seg = 12) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z);
  const add = (p, ...cs) => { cs.forEach((c) => c && p.add(c)); return p; };
  const limb = (a, b, r, m) => {
    const d = V().subVectors(b, a), len = d.length() || 1e-4;
    const o = mesh(new THREE.CylinderGeometry(r, r, len, 6), m);
    o.position.copy(a).addScaledVector(d, 0.5);
    o.quaternion.setFromUnitVectors(UP, d.normalize());
    return o;
  };
  /** A repeatable pseudo-random number from a piece's position, so ruins look the same every time. */
  const rng = (seed) => { let s = Math.abs(Math.floor(seed * 9301 + 49297)) % 233280 || 1; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };

  // Palettes.
  const RUIN = () => mat('#7d776c', { rough: 0.95 }), RUIN_DARK = () => mat('#57534b', { rough: 0.95 }), RUST = () => mat('#7a4a2e', { metal: 0.4, rough: 0.7 });
  const STEEL = () => mat('#6a6e74', { metal: 0.7, rough: 0.45 }), HAZARD = () => mat('#c9a227', { rough: 0.6 });
  const NECRON = () => mat('#3c4a44', { metal: 0.6, rough: 0.4 }), NECRON_DARK = () => mat('#252e2b', { metal: 0.6, rough: 0.4 }), NGLOW = () => glow('#3aff8a');
  const SAND = () => mat('#9a8a64', { rough: 1 });

  /** Runs `fn(along, across, length, thickness)` in the piece's own frame: X along its long side. */
  const frame = (t, fn) => {
    const g = new THREE.Group(), long = t.w >= t.h;
    g.position.set(t.x + t.w / 2, 0, t.y + t.h / 2);
    if (!long) g.rotation.y = Math.PI / 2;
    fn(g, long ? t.w : t.h, long ? t.h : t.w);
    return g;
  };

  // ----- generic killzone terrain -----
  /** A ruined wall: panels with broken tops, pilasters and the odd window. */
  function ruinWall(t, height) {
    const r = rng(t.x * 31 + t.y * 17 + t.w * 7);
    return frame(t, (g, L, D) => {
      const n = Math.max(1, Math.round(L / 1.2)), seg = L / n;
      for (let i = 0; i < n; i++) {
        const x = -L / 2 + seg * (i + 0.5), h = height * (0.55 + r() * 0.45);
        add(g, box(seg * 0.98, h, D, i % 2 ? RUIN() : RUIN_DARK(), x, h / 2, 0));
        if (h > height * 0.75 && seg > 0.9 && r() < 0.6) add(g, box(seg * 0.4, h * 0.25, D * 1.05, mat('#1c1e22'), x, h * 0.55, 0)); // window
        if (r() < 0.5) add(g, box(seg * 0.3, h * (0.1 + r() * 0.2), D * 0.9, RUIN(), x + seg * (r() - 0.5) * 0.5, h + 0.06, 0)); // jagged top
      }
      for (let i = 0; i <= n; i++) add(g, box(Math.min(0.25, seg * 0.2), height * 0.95, D * 1.35, RUIN_DARK(), -L / 2 + seg * i, height * 0.475, 0));
      add(g, box(L, 0.08, D * 1.6, RUIN_DARK(), 0, 0.04, 0));
      for (let i = 0; i < Math.ceil(L); i++) add(g, box(0.15 + r() * 0.2, 0.1, 0.15 + r() * 0.2, RUIN(), (r() - 0.5) * L, 0.05, (r() < 0.5 ? -1 : 1) * (D / 2 + 0.15 + r() * 0.2))); // rubble
    });
  }
  /** Heavy machinery or a container: a big block with pipes, vents and hazard stripes. */
  function machinery(t, height) {
    const r = rng(t.x * 13 + t.y * 29);
    return frame(t, (g, L, D) => {
      const h = height * 0.85;
      add(g, box(L, h, D, r() < 0.5 ? STEEL() : RUST(), 0, h / 2, 0), box(L * 1.02, 0.12, D * 1.02, HAZARD(), 0, 0.3, 0));
      add(g, box(L * 0.6, height - h, D * 0.6, STEEL(), (r() - 0.5) * L * 0.3, h + (height - h) / 2, 0));
      for (let i = 0; i < Math.max(1, Math.floor(L / 1.5)); i++) {
        const x = -L / 2 + 0.6 + i * 1.5;
        if (x > L / 2 - 0.3) break;
        add(g, cyl(0.12, 0.12, D * 1.1, mat('#4a4e54', { metal: 0.6 }), x, h * 0.65, 0).rotateX(Math.PI / 2));
      }
      add(g, cyl(0.15, 0.15, height * 0.4, STEEL(), L / 2 - 0.25, h + height * 0.15, D / 2 - 0.25, 8), box(0.35, 0.25, 0.04, glow('#ff8a1a'), -L / 4, h * 0.5, D / 2 + 0.02));
    });
  }
  /** Light rubble or crates: a pile of boxes and broken slabs. */
  function rubblePile(t, height) {
    const r = rng(t.x * 7 + t.y * 3), g = new THREE.Group();
    const n = Math.max(3, Math.round(t.w * t.h * 1.2));
    add(g, box(t.w, 0.1, t.h, RUIN_DARK(), t.x + t.w / 2, 0.05, t.y + t.h / 2));
    for (let i = 0; i < n; i++) {
      const s = 0.35 + r() * 0.5, h = Math.min(height, s * (0.6 + r() * 1.2));
      const x = t.x + s / 2 + r() * Math.max(0, t.w - s), z = t.y + s / 2 + r() * Math.max(0, t.h - s);
      const c = box(Math.min(s, t.w), h, Math.min(s, t.h), r() < 0.4 ? RUST() : r() < 0.5 ? mat('#5a6a4a') : RUIN(), x, h / 2 + 0.05, z);
      c.rotation.y = (r() - 0.5) * 0.6;
      add(g, c);
    }
    return g;
  }
  /** A light barricade: armoured panels between posts (Imperial pattern), as tall as Light terrain. */
  function barricade(t, height, { portable = false, heavy = false } = {}) {
    return frame(t, (g, L, D) => {
      const n = Math.max(1, Math.round(L / 1)), seg = L / n, panel = heavy ? mat('#6c6a62', { rough: 0.9 }) : STEEL();
      for (let i = 0; i < n; i++) {
        const x = -L / 2 + seg * (i + 0.5), h = height * (heavy ? 1 : 0.9);
        add(g, box(seg * 0.94, h * 0.9, D * (heavy ? 0.9 : 0.35), panel, x, h * 0.45 + 0.05, 0));
        add(g, box(seg * 0.5, 0.14, D * (heavy ? 0.95 : 0.4), HAZARD(), x, h * 0.75, 0)); // stripe
        if (!heavy) add(g, cyl(0.12, 0.12, 0.04, mat('#c9a227', { metal: 0.8 }), x, h * 0.45, D * 0.18 + 0.02, 10).rotateX(Math.PI / 2)); // skull/aquila boss
        if (heavy) add(g, ...[-1, 1].map((s) => { const b = box(0.12, h * 0.8, 0.5, panel, x, h * 0.35, s * (D / 2 + 0.2)); b.rotation.x = s * 0.45; return b; }));
      }
      for (let i = 0; i <= n; i++) add(g, box(0.16, height, Math.max(0.2, D * 0.5), mat('#45484e', { metal: 0.6 }), -L / 2 + seg * i, height / 2, 0));
      if (portable) for (const x of [-L / 2 + 0.2, L / 2 - 0.2]) add(g, box(0.1, 0.06, D + 0.6, mat('#45484e', { metal: 0.6 }), x, 0.03, 0)); // feet
      if (!heavy && !portable) for (let i = 0; i < Math.ceil(L / 0.5); i++) add(g, box(0.45, 0.22, 0.3, SAND(), -L / 2 + 0.25 + i * 0.5, 0.11, -(D * 0.2 + 0.2))); // sandbags
    });
  }
  /** Razor wire: posts with coils of wire between them. */
  function razorWire(t, height) {
    return frame(t, (g, L) => {
      const wire = mat('#9aa0a6', { metal: 0.9, rough: 0.3 });
      const n = Math.max(1, Math.round(L / 1.3)), seg = L / n;
      for (let i = 0; i <= n; i++) {
        const x = -L / 2 + seg * i;
        add(g, limb(V(x, 0, -0.12), V(x, height, 0.12), 0.03, mat('#5a4a3a')), limb(V(x, 0, 0.12), V(x, height, -0.12), 0.03, mat('#5a4a3a')));
      }
      const coils = Math.round(L / 0.22);
      for (let i = 0; i < coils; i++) {
        const c = mesh(new THREE.TorusGeometry(height * 0.42, 0.012, 4, 12), wire, -L / 2 + (i + 0.5) * L / coils, height * 0.45, 0);
        c.rotation.y = Math.PI / 2 + 0.25;
        add(g, c);
      }
    });
  }

  // ----- Tomb World -----
  /** A Tomb World wall section: dark necron metal with ribbed panels and a glowing circuit line. */
  function tombWall(t, height) {
    return frame(t, (g, L, D) => {
      add(g, box(L, height, D, NECRON(), 0, height / 2, 0), box(L, 0.15, D * 1.4, NECRON_DARK(), 0, height - 0.075, 0), box(L, 0.12, D * 1.3, NECRON_DARK(), 0, 0.06, 0));
      const n = Math.max(1, Math.floor(L / 0.9));
      for (let i = 0; i < n; i++) {
        const x = -L / 2 + (i + 0.5) * (L / n);
        for (const s of [-1, 1]) add(g, box(L / n * 0.7, height * 0.6, 0.03, NECRON_DARK(), x, height * 0.48, s * (D / 2 + 0.015)));
      }
      for (const s of [-1, 1]) add(g, box(L * 0.98, 0.04, 0.02, NGLOW(), 0, height * 0.82, s * (D / 2 + 0.02)));
    });
  }
  /** A square end pillar, a little taller than the wall, with a glowing glyph. */
  function tombPillar(t, height) {
    const g = new THREE.Group(), cx = t.x + t.w / 2, cz = t.y + t.h / 2, s = Math.min(t.w, t.h);
    add(g, box(s, height + 0.2, s, NECRON_DARK(), cx, (height + 0.2) / 2, cz), box(s * 1.08, 0.2, s * 1.08, NECRON(), cx, height + 0.3, cz),
      mesh(new THREE.ConeGeometry(s * 0.45, 0.35, 4), NECRON(), cx, height + 0.57, cz).rotateY(Math.PI / 4));
    for (const [dx, dz, ry] of [[0, 1, 0], [0, -1, 0], [1, 0, Math.PI / 2], [-1, 0, Math.PI / 2]]) {
      const glyph = box(s * 0.18, height * 0.45, 0.02, NGLOW(), cx + dx * (s / 2 + 0.011), height * 0.5, cz + dz * (s / 2 + 0.011));
      glyph.rotation.y = ry;
      add(g, glyph);
    }
    return g;
  }
  /** A closed hatchway leaf: a slatted necron door filling the opening. */
  function tombHatch(t, height) {
    return frame(t, (g, L, D) => {
      add(g, box(L * 0.98, height, D * 0.7, mat('#2e3a36', { metal: 0.7, rough: 0.35 }), 0, height / 2, 0));
      for (let i = 1; i < 5; i++) add(g, box(0.03, height * 0.9, D * 0.8, NGLOW(), -L / 2 + i * L / 5, height / 2, 0));
    });
  }
  /** The lintel over a hatchway or hole: the wall above a 2"-high opening. */
  function lintel(d, wallHeight, openHeight) {
    const across = d.axis === 'y'; // the wall runs along X
    const t = across ? { x: d.x - d.width / 2, y: d.y - 0.125, w: d.width, h: 0.25 } : { x: d.x - 0.125, y: d.y - d.width / 2, w: 0.25, h: d.width };
    return frame(t, (g, L, D) => add(g, box(L, wallHeight - openHeight, D, NECRON(), 0, openHeight + (wallHeight - openHeight) / 2, 0), box(L * 0.8, 0.05, D * 1.2, NGLOW(), 0, openHeight + 0.05, 0)));
  }
  /** Tomb World light cover (C1–C5): a sarcophagus or console block with glowing glyphs. */
  function tombCover(t, height) {
    return frame(t, (g, L, D) => {
      add(g, box(L, height * 0.75, D, NECRON(), 0, height * 0.375, 0), box(L * 0.85, height * 0.25, D * 0.8, NECRON_DARK(), 0, height * 0.875, 0),
        box(L * 0.5, 0.03, D * 0.4, NGLOW(), 0, height + 0.015, 0));
      for (const s of [-1, 1]) add(g, box(L * 0.7, height * 0.12, 0.02, NGLOW(), 0, height * 0.45, s * (D / 2 + 0.011)));
      for (const s of [-1, 1]) add(g, mesh(new THREE.ConeGeometry(0.12, 0.3, 4), NECRON_DARK(), s * (L / 2 - 0.15), height + 0.15, 0));
    });
  }
  /** A teleport pad: a raised disc with glowing rings. */
  function teleportPad(p) {
    const g = new THREE.Group(), r = p.diameter / 2;
    add(g, cyl(r, r * 1.04, 0.25, NECRON_DARK(), p.x, 0.125, p.y, 32), cyl(r * 0.85, r * 0.85, 0.02, NECRON(), p.x, 0.26, p.y, 32));
    for (const k of [0.75, 0.45]) { const ring = mesh(new THREE.TorusGeometry(r * k, 0.03, 4, 32), NGLOW(), p.x, 0.27, p.y); ring.rotation.x = Math.PI / 2; add(g, ring); }
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; add(g, box(0.06, 0.03, r * 0.25, NGLOW(), p.x + Math.cos(a) * r * 0.6, 0.27, p.y + Math.sin(a) * r * 0.6).rotateY(-a + Math.PI / 2)); }
    add(g, mesh(new THREE.SphereGeometry(0.12, 10, 8), NGLOW(), p.x, 0.32, p.y));
    return g;
  }

  // ----- markers and equipment -----
  /** An objective marker (40mm): a disc with a raised ring and a numbered centre. */
  function objectiveMarker(o, i, color = '#d9d2bf') {
    const g = new THREE.Group(), r = 20 / 25.4;
    add(g, cyl(r, r, 0.08, mat('#2a2c30', { metal: 0.4 }), o.x, 0.04, o.y, 32));
    const ring = mesh(new THREE.TorusGeometry(r * 0.8, 0.05, 6, 32), mat(color, { metal: 0.5, rough: 0.4 }), o.x, 0.1, o.y); ring.rotation.x = Math.PI / 2;
    add(g, ring, cyl(r * 0.3, r * 0.3, 0.12, o.centre ? glow('#ffd040') : mat(color), o.x, 0.1, o.y, 16));
    add(g, cyl(0.02, 0.02, 1.6, mat(color, { opacity: 0.35 }), o.x, 0.9, o.y, 6));
    g.userData.objective = i;
    return g;
  }
  function ammoCache(x, y) {
    const g = new THREE.Group(), c = mat('#4a5a3a', { rough: 0.7 });
    add(g, box(0.9, 0.5, 0.55, c, x, 0.25, y), box(0.95, 0.06, 0.6, mat('#2a2c30'), x, 0.5, y), box(0.3, 0.12, 0.02, HAZARD(), x, 0.3, y + 0.28),
      box(0.4, 0.3, 0.35, c, x + 0.55, 0.15, y + 0.15));
    return g;
  }
  function mine(x, y) {
    const g = new THREE.Group();
    add(g, cyl(0.32, 0.38, 0.14, mat('#3a3c30', { metal: 0.5 }), x, 0.07, y, 16), cyl(0.06, 0.06, 0.08, glow('#ff3a2a'), x, 0.18, y, 8));
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; add(g, cyl(0.025, 0.025, 0.12, STEEL(), x + Math.cos(a) * 0.22, 0.2, y + Math.sin(a) * 0.22, 6)); }
    return g;
  }
  function commsDevice(x, y) {
    const g = new THREE.Group();
    add(g, box(0.6, 0.45, 0.4, mat('#3a3f46', { metal: 0.6 }), x, 0.225, y), box(0.35, 0.12, 0.02, glow('#3ae0ff'), x, 0.3, y + 0.21),
      cyl(0.015, 0.015, 1.4, STEEL(), x + 0.2, 1.1, y - 0.1, 6), cyl(0.04, 0.04, 0.04, glow('#ff3a2a'), x + 0.2, 1.82, y - 0.1, 8),
      mesh(new THREE.SphereGeometry(0.25, 12, 6, 0, Math.PI * 2, 0, Math.PI / 3), STEEL(), x - 0.15, 0.5, y));
    return g;
  }
  /** A ladder (universal equipment): two rails and rungs, leaning against whatever it's set against. */
  function ladder(x, y, height = 3, lean = 0.25, rotation = 0) {
    const g = new THREE.Group(), m = mat('#8a6a3a', { rough: 0.8 }), top = V(0, height, -height * lean);
    for (const s of [-1, 1]) add(g, limb(V(s * 0.3, 0, 0), V(s * 0.3, top.y, top.z), 0.04, m));
    const n = Math.round(height / 0.35);
    for (let i = 1; i < n; i++) { const f = i / n; add(g, limb(V(-0.3, top.y * f, top.z * f), V(0.3, top.y * f, top.z * f), 0.025, STEEL())); }
    for (const s of [-1, 1]) add(g, limb(V(s * 0.3, top.y, top.z), V(s * 0.3, top.y - 0.05, top.z - 0.25), 0.03, STEEL())); // hooks
    g.position.set(x, 0, y); g.rotation.y = rotation;
    return g;
  }

  /** One 2D terrain rectangle as a 3D piece. */
  function buildPiece(t) {
    const flat = Math.min(t.w, t.h);
    if (t.kind === 'wire') return razorWire(t, t.height ?? HEIGHTS.wire);
    if (t.twWall) {
      if (t.role === 'pillar') return tombPillar(t, t.height ?? HEIGHTS.heavy);
      if (t.role === 'hatch') return tombHatch(t, t.height ?? 2);
      return tombWall(t, t.height ?? HEIGHTS.heavy);
    }
    if (/^C\d/.test(t.component || '')) return tombCover(t, t.height ?? 1);
    if (t.kind === 'heavy') {
      if (t.equip != null) return barricade(t, t.height ?? HEIGHTS.heavyBarricade, { heavy: true });
      return flat <= 0.7 ? ruinWall(t, t.height ?? HEIGHTS.heavy) : machinery(t, t.height ?? HEIGHTS.heavy);
    }
    if (t.portable) return barricade(t, t.height ?? HEIGHTS.light, { portable: true });
    if (t.equip != null || flat <= 0.5) return barricade(t, t.height ?? HEIGHTS.light);
    return rubblePile(t, t.height ?? HEIGHTS.light);
  }

  /** A whole killzone: mat, grid, drop zones, terrain, objectives, teleport pads, Tomb World lintels. */
  function buildBoard({ board, terrain, objectives = [], deploy = [], pads = [], access = [], markers = [], tombWorld = false }) {
    const root = new THREE.Group();
    const matCol = tombWorld ? '#2b302e' : '#3a3f36';
    add(root, box(board.w, 0.2, board.h, mat(matCol, { rough: 1 }), board.w / 2, -0.1, board.h / 2));
    const grid = new THREE.Group(), gm = new THREE.LineBasicMaterial({ color: tombWorld ? '#3f5048' : '#4a5044', transparent: true, opacity: 0.8 });
    const step = board.grid || 1, pts = [];
    for (let x = step; x < board.w; x += step) pts.push(V(x, 0.005, 0), V(x, 0.005, board.h));
    for (let y = step; y < board.h; y += step) pts.push(V(0, 0.005, y), V(board.w, 0.005, y));
    grid.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), gm));
    add(root, grid);
    deploy.forEach((z, i) => add(root, box((z.x1 - z.x0), 0.01, ((z.y1 ?? board.h) - (z.y0 ?? 0)), mat(i ? '#e59b69' : '#75a8b7', { opacity: 0.22 }), (z.x0 + z.x1) / 2, 0.006, ((z.y0 ?? 0) + (z.y1 ?? board.h)) / 2)));
    for (const t of terrain) add(root, buildPiece(t));
    for (const d of access) add(root, lintel(d, HEIGHTS.heavy, 2));
    pads.forEach((p) => add(root, teleportPad(p)));
    objectives.forEach((o, i) => add(root, objectiveMarker(o, i)));
    for (const m of markers) add(root, m.kind === 'ammo' ? ammoCache(m.x, m.y) : m.kind === 'mine' ? mine(m.x, m.y) : commsDevice(m.x, m.y));
    root.position.set(-board.w / 2, 0, -board.h / 2);
    return root;
  }

  /** The universal equipment and marker pieces, each centred on the origin, for the gallery. */
  const EQUIPMENT_PIECES = [
    { id: 'lightBarricade', name: { zh: '輕掩體', en: 'Light Barricade' }, build: () => barricade({ x: -1.5, y: -0.25, w: 3, h: 0.5 }, HEIGHTS.light) },
    { id: 'heavyBarricade', name: { zh: '重掩體', en: 'Heavy Barricade' }, build: () => barricade({ x: -1.75, y: -0.25, w: 3.5, h: 0.5 }, HEIGHTS.heavyBarricade, { heavy: true }) },
    { id: 'portableBarricade', name: { zh: '可攜式路障', en: 'Portable Barricade' }, build: () => barricade({ x: -1, y: -0.25, w: 2, h: 0.5 }, HEIGHTS.light, { portable: true }) },
    { id: 'razorWire', name: { zh: '鐵絲網', en: 'Razor Wire' }, build: () => razorWire({ x: -2, y: -0.15, w: 4, h: 0.3 }, HEIGHTS.wire) },
    { id: 'ladder', name: { zh: '梯子', en: 'Ladder' }, build: () => ladder(0, 0.4, 3, 0.22) },
    { id: 'ammo', name: { zh: '彈藥箱', en: 'Ammo Cache' }, build: () => ammoCache(0, 0) },
    { id: 'mines', name: { zh: '地雷', en: 'Mines' }, build: () => mine(0, 0) },
    { id: 'comms', name: { zh: '通訊裝置', en: 'Comms Device' }, build: () => commsDevice(0, 0) },
    { id: 'objective', name: { zh: '目標點', en: 'Objective Marker' }, build: () => objectiveMarker({ x: 0, y: 0 }, 0) },
    { id: 'twWall', name: { zh: '墓穴世界牆（含柱）', en: 'Tomb World wall' }, build: () => add(new THREE.Group(), tombWall({ x: -2, y: -0.125, w: 4, h: 0.25 }, HEIGHTS.heavy), tombPillar({ x: -2.6, y: -0.625, w: 1.25, h: 1.25 }, HEIGHTS.heavy), tombPillar({ x: 1.35, y: -0.625, w: 1.25, h: 1.25 }, HEIGHTS.heavy)) },
    { id: 'twHatch', name: { zh: '墓穴世界艙門', en: 'Tomb World hatchway' }, build: () => add(new THREE.Group(), tombWall({ x: -2.1, y: -0.125, w: 1.475, h: 0.25 }, HEIGHTS.heavy), tombWall({ x: 0.625, y: -0.125, w: 1.475, h: 0.25 }, HEIGHTS.heavy), tombHatch({ x: -0.625, y: -0.125, w: 1.25, h: 0.25 }, 2), lintel({ x: 0, y: 0, axis: 'y', width: 1.25 }, HEIGHTS.heavy, 2)) },
    { id: 'twCover', name: { zh: '墓穴世界輕掩體', en: 'Tomb World light cover' }, build: () => tombCover({ x: -1.625, y: -1.25, w: 3.25, h: 2.5 }, 1) },
    { id: 'twPad', name: { zh: '傳送台', en: 'Teleport pad' }, build: () => teleportPad({ x: 0, y: 0, diameter: 2.25 }) },
  ];

  return { buildPiece, buildBoard, ladder, EQUIPMENT_PIECES };
}
