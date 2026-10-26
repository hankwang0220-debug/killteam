// Team-specific details for the 3D miniatures (see models3d.js): the parts that make each team look like itself
// (chest plates, purity seals, smokestacks, Kroot harnesses, Death Korps rebreathers...), and weapon
// add-ons (markerlights, bayonets, Kroot rifle blades). `body` runs after a humanoid figure is built; `weapon`
// runs on each ranged weapon model (grip at the origin, barrel along +Z).
//
// Figure frame: the model faces +Z, its right side is -X. `upper` is the torso group (offset forward by `hunch`),
// `head` is centred on the head, `front`/`back` are the chest's Z faces, `shY` the shoulder height.

export function teamDetails(h) {
  const { THREE, V, mat, glow, box, cyl, sph, cone, limb, add, aimY, tz, METAL, DARK, BRASS } = h;
  const GOLD = () => mat('#d8b04a', { metal: 0.85, rough: 0.3 });
  const BONE = () => mat('#e8dcc0', { rough: 0.7 });
  const LEATHER = () => mat('#5a3e28', { rough: 0.9 });
  const RED = () => mat('#a82a24', { rough: 0.6 });

  // Generic ornaments only: no faction logos or emblems (they are Games Workshop IP). These are plain plates,
  // bosses, rings and gems that add detail without copying any symbol.
  /** A raised chest plate with two rivets, facing +Z, centred on (x, y, z). */
  const chestPlate = (p, x, y, z, s, m = GOLD()) => {
    add(p, box(s * 0.7, s * 0.28, s * 0.06, m, x, y, z));
    for (const side of [-1, 1]) add(p, sph(s * 0.05, m, x + side * s * 0.28, y, z + s * 0.035, 8, 6));
  };
  /** A purity seal: a red wax disc with a parchment strip. */
  const puritySeal = (p, x, y, z) => add(p, cyl(0.035, 0.035, 0.015, RED(), x, y, z, 10).rotateX(Math.PI / 2), box(0.03, 0.09, 0.006, mat('#e8dcb0'), x, y - 0.06, z + 0.004));
  /** A belt across the hips with pouches and a buckle. */
  const belt = (c, m = DARK(), buckle = GOLD(), pouches = 3) => {
    const { upper, B, hipY } = c;
    add(upper, box(B.tw * 0.92, 0.045 * c.k, B.td * 0.98, m, 0, hipY + 0.05 * c.k, 0), box(0.06 * c.k, 0.05 * c.k, 0.02, buckle, 0, hipY + 0.05 * c.k, B.td * 0.49 + 0.01));
    for (let i = 0; i < pouches; i++) {
      const a = (i + 1) / (pouches + 1) * Math.PI - Math.PI / 2; // around the back and sides
      add(upper, box(0.06 * c.k, 0.06 * c.k, 0.04 * c.k, m, Math.sin(a) * B.tw * 0.48, hipY + 0.035 * c.k, -Math.cos(a) * B.td * 0.5));
    }
  };
  /** A disc badge on the outside of a shoulder pad (side -1 right, 1 left). */
  const padBadge = (c, side, m, r = 0.045) => {
    const x = side * (c.B.sx + 0.02 + c.B.armR * 2.25);
    return add(c.upper, cyl(r * c.k, r * c.k, 0.012, m, x, c.shY + c.B.armR * 0.55, 0, 12).rotateZ(Math.PI / 2));
  };
  /** A diagonal strap across the chest (bandolier, harness, webbing). */
  const strap = (c, m, side = 1, width = 0.04) => {
    const { upper, B, torsoY } = c;
    for (const z of [B.td / 2 + 0.008, -B.td / 2 - 0.008]) {
      const s = box(width * c.k, B.th * 1.15, 0.012, m, 0, torsoY + 0.01, z);
      s.rotation.z = side * 0.62;
      add(upper, s);
    }
  };

  /** A round boss with a rim, facing +Z. */
  const boss = (p, x, y, z, s, m) => {
    add(p, cyl(s * 0.4, s * 0.45, 0.02, m, x, y, z, 14).rotateX(Math.PI / 2), sph(s * 0.18, m, x, y, z + 0.012, 10, 8));
  };
  /** A small round badge for the front of a cap of head radius r. */
  const capBadge = (r) => { const g = new THREE.Group(); boss(g, 0, r * 0.75, r * 1.03, r * 0.35, BRASS()); return g; };
  /** Two short glowing bars (energy vents), facing +Z, as meshes. */
  const glowBars = (x, y, z, s, m) => [-1, 1].map((side) => box(s * 0.1, s * 0.6, 0.012, m, x + side * s * 0.12, y, z));
  /** A plain ring boss, facing +Z. */
  const ringBoss = (p, x, y, z, s, m) => add(p, mesh(new THREE.TorusGeometry(s * 0.6, s * 0.16, 6, 18), m, x, y, z), sph(s * 0.22, m, x, y, z, 10, 8));
  /** A small vertical tag plate, facing +Z. */
  const tag = (p, x, y, z, s, m) => add(p, box(s * 0.35, s * 0.7, 0.014, m, x, y, z), sph(s * 0.07, m, x, y + s * 0.25, z + 0.01, 6, 5));
  /** A plain rectangular metal plate, facing +Z. */
  const plate = (p, x, y, z, s, m) => add(p, box(s * 0.7, s * 0.5, 0.015, m, x, y, z));
  const plateMesh = (x, y, z, s) => { const g = new THREE.Group(); plate(g, x, y, z, s, BRASS()); return g; };

  const D = {
    angels(c) {
      const { upper, head, B, k, torsoY, front, L } = c;
      chestPlate(upper, 0, torsoY + B.th * 0.24, front + 0.035, 0.24 * k);
      padBadge(c, 1, mat('#e8e0d0', { rough: 0.5 })); // plain pad disc (left)
      padBadge(c, -1, mat(L.trim, { metal: 0.6 }), 0.035); // plain pad disc (right)
      puritySeal(upper, -B.tw * 0.28, torsoY - B.th * 0.05, front + 0.012);
      belt(c, mat('#2a2c30', { metal: 0.5 }), GOLD());
      for (const s of [-1, 1]) add(upper, sph(0.03 * k, DARK(), s * B.tw * 0.36, c.hipY + 0.05 * k, front * 0.6, 6, 5)); // grenades
      add(upper, cyl(B.head * 0.62, B.head * 0.7, B.head * 0.22, c.M.main, 0, c.shY + B.head * 0.12, 0.01, 16), cyl(B.head * 0.71, B.head * 0.71, 0.012 * k, mat(L.trim, { metal: 0.7, rough: 0.35 }), 0, c.shY + B.head * 0.02, 0.01, 16)); // gorget with a trimmed rim
      if (!/eliminator/i.test(L.name)) add(upper, ...[0, 1, 2].map((i) => box(B.tw * 0.5, 0.012 * k, 0.012, DARK(), 0, torsoY + B.th * (0.32 - i * 0.07), c.back - 0.1 * k - 0.004))); // vent slats on the backpack
      if (/captain/i.test(L.name)) { // iron halo
        const halo = new THREE.Mesh(new THREE.TorusGeometry(B.head * 1.9, B.head * 0.18, 6, 20), GOLD());
        halo.position.set(0, c.headY + B.head * 0.4, c.back - 0.12 * k); halo.castShadow = true;
        add(c.fig, halo, ...Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return box(B.head * 0.18, B.head * 0.6, B.head * 0.1, GOLD(), Math.cos(a) * B.head * 2.1, c.headY + B.head * 0.4 + Math.sin(a) * B.head * 2.1, c.back - 0.12 * k).rotateZ(a + Math.PI / 2); }));
      }
      if (/eliminator/i.test(L.name)) add(head, hood(B.head, mat(L.cloth, { rough: 1, side: 'double' }))); // camo hood
      if (/heavy intercessor/i.test(L.name)) add(upper, box(B.tw * 0.95, B.th * 0.9, 0.14 * k, c.M.main, 0, torsoY + 0.08, c.back - 0.1 * k), box(B.tw * 0.6, 0.06, B.td * 0.9, mat(L.trim, { metal: 0.6 }), 0, torsoY - B.th * 0.3, 0)); // gravis pack and abdominal plate
    },

    kommandos(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      strap(c, mat('#3a2e22'), 1, 0.05);
      for (let i = 0; i < 4; i++) { const t = i / 3 - 0.5; add(upper, box(0.02 * k, 0.04 * k, 0.02 * k, BRASS(), t * B.tw * 0.55, torsoY + t * B.th * 0.62 * 0.72, front + 0.02)); } // bandolier shells
      belt(c, mat('#3a2e22'), METAL(), 4);
      if (!L.grot && !L.armoured) add(head, ...[-1, 1].map((s) => tz(cyl(B.head * 0.22, B.head * 0.22, B.head * 0.25, mat('#2a2a2a', { metal: 0.4 }), s * B.head * 0.38, B.head * 0.55, B.head * 0.75)))); // goggles up on the forehead
      if (!L.grot) { const ch = B.th + c.hipY * 0.6, cl = mesh(new THREE.CylinderGeometry(B.tw * 0.55, B.tw * 0.75, ch, 10, 1, true, Math.PI * 0.62, Math.PI * 0.76), mat('#5f6a42', { rough: 1, side: 'double' }), 0, c.hipY * 0.4 + ch / 2, back * 0.3); cl.scale.z = 0.7; add(upper, cl); } // camo cloak
      if (/burna/i.test(L.name)) add(upper, ...[-1, 1].map((s) => cyl(0.06 * k, 0.06 * k, B.th * 0.8, mat('#a8302a', { metal: 0.4 }), s * 0.07 * k, torsoY, back - 0.07 * k, 10)));
      if (/rokkit/i.test(L.name)) for (let i = 0; i < 3; i++) add(upper, cyl(0.025 * k, 0.025 * k, B.th * 0.9, mat('#5a5a3a'), (i - 1) * 0.06 * k, torsoY + 0.05, back - 0.06 * k, 8), cone(0.025 * k, 0.06 * k, RED(), (i - 1) * 0.06 * k, torsoY + B.th * 0.5 + 0.08, back - 0.06 * k, 6));
      if (/slasha/i.test(L.name)) for (let i = 0; i < 5; i++) add(upper, box(0.012, 0.08 * k, 0.03 * k, METAL(), (i - 2) * 0.04 * k, c.hipY + 0.11 * k, front + 0.02));
      if (!L.grot) { const px = B.sx * 1.05, py = c.shY + B.armR * 0.9, iron = mat('#6a6e72', { metal: 0.6, rough: 0.55 });
        add(upper, box(B.armR * 2.6, B.armR * 0.5, B.armR * 2.6, iron, px, py, 0).rotateZ(0.35), ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => sph(0.009 * k, BRASS(), px + a * B.armR * 0.95, py + B.armR * 0.25 + a * 0.012, b * B.armR * 1.05, 6, 4))); } // riveted shoulder plate
      if (/nob/i.test(L.name)) add(upper, cyl(0.008, 0.008, 0.9 * k, LEATHER(), B.tw * 0.35, torsoY + 0.3 * k, back - 0.08), ...[0, 1].map((i) => sph(0.045 * k, BONE(), B.tw * 0.35, torsoY + (0.62 + i * 0.12) * k, back - 0.08, 6, 5))); // trophy pole with skulls
    },

    tauPathfinders(c) {
      const { upper, head, B, k, torsoY, front, L } = c;
      add(upper, cyl(0.05 * k, 0.05 * k, 0.01, mat(L.trim), 0, torsoY + B.th * 0.18, front + 0.03, 14).rotateX(Math.PI / 2)); // plain red chest marking
      belt(c, mat('#3a3a36'), mat(L.main), 3);
      add(upper, box(B.tw * 0.4, c.hipY * 0.45, 0.012, mat('#3a3a36', { rough: 1 }), 0, c.hipY * 0.75, front + 0.01), box(B.tw * 0.5, c.hipY * 0.45, 0.012, mat('#3a3a36', { rough: 1 }), 0, c.hipY * 0.75, c.back - 0.01)); // loincloth
      if (L.leader) add(head, cyl(0.004, 0.004, B.head * 2.5, METAL(), -B.head * 0.8, B.head * 1.3, -B.head * 0.3, 4)); // Shas'ui aerial
      const tseam = mat('#6e6a62', { rough: 0.6 });
      add(upper, box(0.008 * k, B.th * 0.48, 0.01, tseam, 0, torsoY + B.th * 0.3, B.td * 0.56), box(B.tw * 1.06, 0.008 * k, 0.01, tseam, 0, torsoY + B.th * 0.42, B.td * 0.555)); // panel lines on the chest plate
      add(head, box(B.head * 0.35, B.head * 0.3, B.head * 0.5, mat('#3a3a36'), B.head * 0.95, B.head * 0.15, 0), sph(B.head * 0.1, glow('#3ae0ff'), B.head * 0.95, B.head * 0.15, B.head * 0.27, 6, 4)); // recon sensor on the helmet
      if (/drone controller/i.test(L.name)) add(upper, box(0.08 * k, 0.05 * k, 0.06 * k, DARK(), B.sx * 1.1, c.shY + 0.06 * k, 0), sph(0.018 * k, glow('#3ae0ff'), B.sx * 1.1, c.shY + 0.1 * k, 0));
      if (/blooded/i.test(L.name)) add(head, ...[0, 1, 2].map((i) => limb(V(0, B.head * 0.6, -B.head * 0.4), V((i - 1) * B.head * 0.5, B.head * 0.8, -B.head * 1.6), 0.006, mat('#b9772f')))); // Kroot quills as trophies
    },

    plagueMarines(c) {
      const { upper, head, fig, B, k, torsoY, front, back, L } = c;
      // Smokestacks on the backpack, with breathing tubes to the helmet.
      add(upper, ...[-1, 1].map((s) => cyl(0.035 * k, 0.03 * k, 0.28 * k, mat('#5a4a2e', { metal: 0.5 }), s * 0.08 * k, torsoY + B.th * 0.6, back - 0.12 * k, 8)),
        ...[-1, 1].map((s) => cyl(0.04 * k, 0.04 * k, 0.03 * k, mat('#2a2a20'), s * 0.08 * k, torsoY + B.th * 0.6 + 0.15 * k, back - 0.12 * k, 8)));
      for (const s of [-1, 1]) add(fig, limb(V(s * 0.1 * k, torsoY + B.th * 0.35, c.hunch + back - 0.05), V(s * B.head * 0.8, c.headY - B.head * 0.4, B.head * 0.3), 0.012 * k, mat('#3a3a2a', { rough: 0.6 })));
      // Exposed gut with tentacles and ooze.
      add(upper, sph(B.tw * 0.18, mat('#6a8a3a', { rough: 0.5 }), 0, torsoY - B.th * 0.2, front + B.td * 0.25, 8, 6));
      for (let i = 0; i < 3; i++) add(upper, limb(V((i - 1) * 0.04 * k, torsoY - B.th * 0.25, front + B.td * 0.3), V((i - 1) * 0.08 * k, torsoY - B.th * 0.55, front + B.td * 0.45), 0.01 * k, mat('#b86a7a')));
      // Rust patches and bells.
      for (let i = 0; i < 4; i++) add(upper, box(0.06 * k, 0.04 * k, 0.01, mat('#7a4a2e', { rough: 1 }), ((i * 37) % 7 / 7 - 0.5) * B.tw * 0.8, torsoY + ((i * 53) % 5 / 5 - 0.3) * B.th, front + 0.012));
      belt(c, mat('#4a3a24'), BRASS(), 2);
      for (let i = 0; i < 5; i++) add(upper, sph(0.01 * k, BRASS(), (i / 4 - 0.5) * B.tw * 0.8, torsoY + B.th * 0.46, front + 0.004, 6, 4)); // rivets along the top of the chest plate
      for (const s of [-1, 1]) add(upper, cone(0.03 * k, 0.05 * k, BRASS(), s * B.tw * 0.3, c.hipY - 0.01, front * 0.7, 8));
      // A few flies.
      for (let i = 0; i < 6; i++) { const a = i * 1.7; add(fig, sph(0.008, mat('#111'), Math.cos(a) * 0.25 * k, c.headY + 0.1 + (i % 3) * 0.06, Math.sin(a) * 0.25 * k, 4, 3)); }
      if (L.icon) add(upper, sph(0.045 * k, BRASS(), B.tw * 0.3 + 0.11 * k, torsoY + 0.55 * k, back - 0.105, 10, 8)); // a plain brass boss on the banner
    },

    farstalkers(c) {
      const { upper, head, B, k, torsoY, front, L } = c;
      strap(c, LEATHER(), 1, 0.035); strap(c, LEATHER(), -1, 0.035);
      belt(c, LEATHER(), BONE(), 4);
      add(upper, aimY(box(0.03 * k, 0.16 * k, 0.012 * k, LEATHER(), B.tw * 0.4, c.hipY - 0.05 * k, front * 0.5), V(0.3, -1, 0)), aimY(cyl(0.008 * k, 0.008 * k, 0.05 * k, BONE(), B.tw * 0.36, c.hipY + 0.05 * k, front * 0.5), V(0.3, -1, 0)), // knife sheath with a bone hilt
        box(0.05 * k, 0.05 * k, 0.03 * k, LEATHER(), -B.tw * 0.38, c.hipY + 0.01, front * 0.6)); // pouch
      // Necklace of bones and feathers.
      for (let i = 0; i < 7; i++) { const a = (i / 6 - 0.5) * 1.6; add(upper, box(0.012, 0.04 * k, 0.012, i % 2 ? BONE() : mat('#b9772f'), Math.sin(a) * B.tw * 0.32, torsoY + B.th * 0.42 - Math.cos(a) * 0.04, front + 0.01 + Math.cos(a) * 0.01)); }
      if (/kill-broker/i.test(L.name)) add(head, ...[0, 1, 2, 3, 4].map((i) => limb(V(0, B.head * 0.8, -B.head * 0.2), V((i - 2) * B.head * 0.45, B.head * 2.4, -B.head * 0.6), 0.008, mat(i % 2 ? '#a82a24' : '#e8c040'), 0.003)));
    },

    deathKorps(c) {
      const { upper, fig, head, B, k, torsoY, front, back, L } = c;
      // Rebreather pack on the back, hose to the mask.
      add(upper, box(B.tw * 0.5, B.th * 0.45, 0.07 * k, mat('#3a3f36'), 0, torsoY + 0.02, back - 0.04 * k), cyl(0.03 * k, 0.03 * k, B.tw * 0.45, METAL(), 0, torsoY + B.th * 0.22, back - 0.08 * k, 8).rotateZ(Math.PI / 2));
      if (!L.peakedCap || L.gasmask) add(fig, limb(V(0, c.headY - B.head * 0.75, B.head * 1.0), V(B.tw * 0.32, torsoY - B.th * 0.1, c.hunch + front + 0.03), 0.014 * k, mat('#2a2a26', { rough: 0.6 })));
      add(upper, box(0.07 * k, 0.09 * k, 0.05 * k, mat('#4a4f44'), B.tw * 0.34, torsoY - B.th * 0.15, front + 0.03)); // filter canister
      // Webbing: a strap over each shoulder and a belt with pouches.
      for (const s of [-1, 1]) add(upper, box(0.03 * k, B.th * 0.9, 0.01, mat('#4a4636'), s * B.tw * 0.24, torsoY + 0.02, front + 0.01), box(0.03 * k, B.th * 0.9, 0.01, mat('#4a4636'), s * B.tw * 0.24, torsoY + 0.02, back - 0.01));
      belt(c, mat('#4a4636'), METAL(), 4);
      for (const s of [-1, 1]) add(upper, box(B.armR * 1.6, 0.014 * k, B.armR * 1.3, mat('#2f353a', { rough: 0.8 }), s * B.sx * 0.95, c.shY + B.armR * 0.95, 0), sph(0.008 * k, BRASS(), s * B.sx * 0.75, c.shY + B.armR * 1.0, 0, 6, 4)); // epaulettes with a button
      add(upper, cyl(B.head * 0.75, B.head * 0.85, B.head * 0.35, mat(L.main, { rough: 0.9 }), 0, c.shY + B.head * 0.1, 0.0, 16)); // high greatcoat collar
      add(upper, box(0.05 * k, 0.08 * k, 0.03 * k, mat('#4a4636'), -B.tw * 0.4, c.hipY - 0.02, front * 0.4), box(0.05 * k, 0.05 * k, 0.03, METAL(), -B.tw * 0.4, c.hipY - 0.1, front * 0.4)); // entrenching tool
    },

    gellerpox(c) {
      const { upper, fig, head, B, k, torsoY, front, back, L } = c;
      const flesh = mat(L.skin, { rough: 0.6 }), boil = mat('#d88a7a', { rough: 0.4 }), tent = mat('#b86a8a', { rough: 0.5 });
      // Boils and pustules over the body.
      for (let i = 0; i < 9; i++) { const a = i * 2.4, y = torsoY + ((i * 37) % 9 / 9 - 0.5) * B.th; add(upper, sph((0.025 + (i % 3) * 0.01) * k, i % 2 ? boil : mat('#c8d070', { rough: 0.3 }), Math.sin(a) * B.tw * 0.5, y, Math.cos(a) * B.td * 0.52, 6, 5)); }
      // Tentacles from the back and an extra mouth on the belly.
      for (let i = 0; i < (L.bloated ? 4 : 2); i++) {
        const s = i % 2 ? 1 : -1, y0 = torsoY + B.th * (0.3 - i * 0.12);
        const p0 = V(s * B.tw * 0.3, y0, back), p1 = V(s * B.tw * 0.7, y0 + 0.15 * k, back - 0.25 * k), p2 = V(s * B.tw * 0.9, y0 + 0.05 * k, back - 0.45 * k);
        add(upper, limb(p0, p1, 0.03 * k, tent), limb(p1, p2, 0.02 * k, tent), sph(0.02 * k, tent, p2.x, p2.y, p2.z, 5, 4));
      }
      if (L.bloated) add(upper, box(B.tw * 0.3, 0.04 * k, 0.02, mat('#3a0a0a'), 0, torsoY - B.th * 0.15, front + B.td * 0.55), ...[-1, 0, 1].map((i) => cone(0.012 * k, 0.04 * k, BONE(), i * 0.04 * k, torsoY - B.th * 0.12, front + B.td * 0.56).rotateX(Math.PI)));
      add(upper, box(B.tw * 0.95, B.th * 0.12, B.td * 1.02, mat('#4a3a30', { rough: 1 }), 0, torsoY + B.th * 0.05, 0)); // tattered strip of void-crew uniform
      const rust = mat('#6a4a34', { metal: 0.5, rough: 0.7 });
      add(upper, box(B.tw * 0.4, B.th * 0.22, 0.02, rust, -B.tw * 0.2, torsoY + B.th * 0.32, front + 0.01), ...[-1, 1].map((s) => sph(0.01 * k, METAL(), -B.tw * 0.2 + s * B.tw * 0.16, torsoY + B.th * 0.32, front + 0.022, 6, 4)), // rusted plate bolted into the flesh
        limb(V(B.tw * 0.3, torsoY + B.th * 0.4, back), V(B.tw * 0.1, torsoY - B.th * 0.2, back - 0.06 * k), 0.012 * k, mat('#2a2a2a', { rough: 0.6 }))); // a loose cable
      if (/glitchling/i.test(L.name)) add(head, sph(B.head * 0.45, glow('#ff3af0'), 0, B.head * 0.1, B.head * 0.75, 8, 6), ...[-1, 1].map((s) => cone(B.head * 0.2, B.head * 1.2, mat('#5a2a5a'), s * B.head * 0.7, B.head * 0.8, 0, 5)));
      if (/fleshscreamer/i.test(L.name)) add(head, sph(B.head * 0.55, mat('#3a0a0a'), 0, -B.head * 0.25, B.head * 0.7, 8, 6), ...[0, 1, 2].map((i) => limb(V((i - 1) * B.head * 0.4, -B.head * 0.5, B.head * 0.9), V((i - 1) * B.head * 0.8, -B.head * 1.6, B.head * 1.6), 0.012 * k, tent)));
      if (/vulgrar/i.test(L.name)) add(head, ...[-1, 1].map((s) => aimY(cone(B.head * 0.25, B.head * 1.6, BONE(), s * B.head * 0.8, B.head * 0.6, 0, 6), V(s * 0.8, 1, 0.2))));
      if (/lumberghast/i.test(L.name)) add(fig, sph(0.12 * k, flesh, B.sx * 1.3, c.shY + 0.05, 0, 8, 6)); // swollen shoulder growth
    },

    hearthkyn(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      const plate = mat(L.main, { metal: 0.4, rough: 0.5 }), dark = mat('#3a3a3e', { metal: 0.6, rough: 0.4 });
      add(upper, cyl(0.045 * k, 0.045 * k, 0.02, dark, 0, torsoY + B.th * 0.12, front + 0.065, 6).rotateX(Math.PI / 2), cyl(0.026 * k, 0.026 * k, 0.012, glow('#4af0ff'), 0, torsoY + B.th * 0.12, front + 0.078, 6).rotateX(Math.PI / 2)); // power core in a hexagonal frame
      add(upper, box(B.tw * 1.045, 0.01 * k, B.td * 1.105, dark, 0, torsoY + B.th * 0.42, 0), box(B.tw * 1.045, 0.01 * k, B.td * 1.105, dark, 0, torsoY - B.th * 0.06, 0)); // dark edges on the chest armour
      add(upper, box(B.tw * 0.75, B.th * 0.55, 0.12 * k, dark, 0, torsoY + 0.04, back - 0.06 * k), ...[-1, 1].map((s) => cyl(0.03 * k, 0.03 * k, B.th * 0.5, glow('#4af0ff'), s * B.tw * 0.25, torsoY + 0.04, back - 0.13 * k, 8))); // power-cell pack
      belt(c, dark, plate, 4);
      for (const s of [-1, 1]) add(c.fig, box(B.legR * 2.4, c.hipY * 0.3, B.legR * 2.2, plate, s * B.tw * 0.3, c.hipY * 0.62, 0.03 * k)); // thigh plates
      if (L.leader) add(head, box(B.head * 0.25, B.head * 0.7, B.head * 1.8, mat('#e8e0d0'), 0, B.head * 1.2, -B.head * 0.1)); // Theyn's crest
      if (/dôzr|dozr/i.test(L.name)) add(upper, ...[-1, 1].map((s) => box(B.armR * 3.4, B.armR * 1.5, B.armR * 3.6, plate, s * (B.sx + 0.03), c.shY + 0.05 * k, 0)));
      if (/lokâtr|lokatr/i.test(L.name)) add(head, tz(cyl(B.head * 0.25, B.head * 0.3, B.head * 0.7, dark, -B.head * 0.75, B.head * 0.25, B.head * 0.6)), sph(B.head * 0.2, glow('#ff3a2a'), -B.head * 0.75, B.head * 0.25, B.head * 0.98, 6, 4));
      if (/lugger/i.test(L.name)) add(upper, box(B.tw * 0.9, B.th * 0.9, 0.22 * k, mat('#5a5a3a'), 0, torsoY + 0.1 * k, back - 0.18 * k), box(B.tw * 0.95, 0.03, 0.23 * k, mat(L.main), 0, torsoY + 0.25 * k, back - 0.18 * k));
      if (/kognit/i.test(L.name)) add(head, ...[-1, 1].map((s) => sph(B.head * 0.18, glow('#4af0ff'), s * B.head * 0.9, B.head * 0.3, B.head * 0.3, 6, 4)), cyl(0.004, 0.004, B.head * 2, METAL(), 0, B.head * 1.6, -B.head * 0.4, 4));
      if (L.jump) add(upper, ...[-1, 1].map((s) => cyl(0.05 * k, 0.04 * k, 0.26 * k, dark, s * 0.09 * k, torsoY + 0.05, back - 0.16 * k, 10)), ...[-1, 1].map((s) => cone(0.04 * k, 0.12 * k, glow('#4af0ff'), s * 0.09 * k, torsoY - 0.14 * k, back - 0.16 * k, 8).rotateX(Math.PI)));
    },

    navyBreachers(c) {
      const { upper, B, k, torsoY, front, back, L } = c;
      const plate = mat(L.main, { metal: 0.4, rough: 0.5 });
      add(upper, ...[-1, 1].map((s) => cyl(0.04 * k, 0.04 * k, B.th * 0.75, mat('#c9c9c0', { metal: 0.6 }), s * 0.06 * k, torsoY + 0.02, back - 0.05 * k, 10))); // air tanks
      chestPlate(upper, 0, torsoY + B.th * 0.25, front + 0.06, 0.16 * k, GOLD());
      add(upper, ...[-1, 1].map((s) => tz(cyl(0.022 * k, 0.025 * k, 0.04 * k, glow('#fff6c0'), s * B.sx * 1.05, c.shY + 0.03 * k, 0.05 * k)))); // shoulder lamps
      belt(c, mat('#2c3a46'), GOLD(), 4);
      for (const s of [-1, 1]) add(c.fig, box(B.legR * 2.2, B.legR * 2, B.legR * 1.2, plate, s * B.tw * 0.32, c.hipY * 0.5, 0.06 * k)); // knee guards
      if (/endurant/i.test(L.name)) add(upper, box(B.tw * 1.15, B.th * 0.6, B.td * 1.2, plate, 0, torsoY + B.th * 0.15, 0), ...[-1, 1].map((s) => box(B.armR * 3.6, B.armR * 1.8, B.armR * 3.6, plate, s * (B.sx + 0.02), c.shY + 0.04, 0)));
      if (/surveyor/i.test(L.name)) add(upper, box(0.1 * k, 0.07 * k, 0.03, DARK(), -B.tw * 0.45, torsoY - B.th * 0.1, front + 0.03), box(0.08 * k, 0.05 * k, 0.005, glow('#3aff8a'), -B.tw * 0.45, torsoY - B.th * 0.1, front + 0.047)); // auspex
      if (/grenadier/i.test(L.name)) for (let i = 0; i < 4; i++) add(upper, sph(0.025 * k, DARK(), (i - 1.5) * 0.05 * k, torsoY - B.th * 0.05 + (i - 1.5) * 0.035 * k, front + 0.03, 6, 5));
      if (L.leader) add(upper, box(0.06 * k, 0.1 * k, 0.012, RED(), B.tw * 0.25, torsoY + B.th * 0.05, front + 0.03)); // rank tabard
      add(c.fig, limb(V(-0.06 * k, torsoY + B.th * 0.4, c.hunch + back - 0.05 * k), V(-B.head * 0.7, c.headY - B.head * 0.5, B.head * 0.2), 0.012 * k, mat('#2a2a26', { rough: 0.6 }))); // air hose to the helmet
      add(upper, box(B.tw * 1.155, 0.01 * k, B.td * 1.205, mat('#1e2a34', { rough: 0.6 }), 0, torsoY + B.th * 0.44, 0)); // edge of the void armour
    },

    phobos(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      chestPlate(upper, 0, torsoY + B.th * 0.24, front + 0.035, 0.2 * k, mat('#c9c9c0', { metal: 0.6 }));
      belt(c, mat('#2a2c30', { metal: 0.5 }), mat('#c9c9c0', { metal: 0.6 }), 4);
      padBadge(c, 1, mat('#e8e0d0'));
      for (const s of [-1, 1]) add(upper, sph(0.028 * k, DARK(), s * B.tw * 0.38, c.hipY + 0.04 * k, front * 0.6, 6, 5)); // grenades
      add(upper, aimY(box(0.025 * k, 0.12 * k, 0.012 * k, DARK(), -B.tw * 0.46, c.hipY - 0.03 * k, 0), V(-0.2, -1, 0.2))); // combat knife sheath
      if (/reiver/i.test(L.name)) { // skull-faced helmet and grapnel
        add(head, sph(B.head * 0.75, BONE(), 0, -B.head * 0.1, B.head * 0.55, 8, 6), ...[-1, 1].map((s) => sph(B.head * 0.2, mat('#111'), s * B.head * 0.3, 0, B.head * 1.15, 6, 4)), box(B.head * 0.6, B.head * 0.12, B.head * 0.1, mat('#111'), 0, -B.head * 0.45, B.head * 1.1));
        add(upper, tz(cyl(0.035 * k, 0.035 * k, 0.12 * k, DARK(), B.tw * 0.35, torsoY + B.th * 0.3, back - 0.08 * k)));
      }
      if (/incursor/i.test(L.name)) add(head, box(B.head * 1.3, B.head * 0.35, B.head * 0.3, DARK(), 0, B.head * 0.1, B.head * 0.9), ...[-1, 0, 1].map((i) => sph(B.head * 0.13, glow('#3aff8a'), i * B.head * 0.35, B.head * 0.1, B.head * 1.06, 6, 4))); // multi-spectrum array
      if (/infiltrator/i.test(L.name)) add(head, tz(cyl(B.head * 0.12, B.head * 0.12, B.head * 0.9, DARK(), B.head * 0.75, -B.head * 0.2, B.head * 0.4))); // comm tube
    },

    warpcoven(c) {
      const { upper, head, fig, B, k, torsoY, front, L } = c;
      const gold = GOLD();
      if (L.body === 'marine') {
        // Ornate gold: a gem on the chest with gilded plates, a glowing gem on the left pad, gilded belt.
        add(upper, sph(0.05 * k, glow('#4af0ff'), 0, torsoY + B.th * 0.2, front + 0.04, 10, 8), ...[-1, 1].map((s) => box(0.1 * k, 0.03 * k, 0.015, gold, s * 0.08 * k, torsoY + B.th * 0.2, front + 0.035)));
        padBadge(c, 1, mat('#e8e0d0'), 0.05); padBadge(c, 1, glow('#4af0ff'), 0.02);
        belt(c, gold, mat('#2763a8'), 3);
        if (!/sorcerer/i.test(L.name)) add(head, box(B.head * 0.22, B.head * 0.9, B.head * 1.6, gold, 0, B.head * 1.05, -B.head * 0.15), sph(B.head * 0.16, glow('#4af0ff'), 0, B.head * 0.55, B.head * 0.85, 6, 4)); // tall gilded crest and a brow gem
        add(upper, box(B.tw * 0.66, 0.016 * k, 0.012, gold, 0, torsoY + B.th * 0.36, front + 0.03), box(B.tw * 0.66, 0.016 * k, 0.012, gold, 0, torsoY + B.th * 0.02, front + 0.03)); // gilded edges on the chest plate
        if (/sorcerer/i.test(L.name)) add(head, ...[-1, 1].map((s) => aimY(cone(B.head * 0.22, B.head * 1.8, gold, s * B.head * 0.75, B.head * 1.0, -B.head * 0.1, 6), V(s * 0.5, 1, -0.2))), cone(B.head * 0.3, B.head * 1.4, gold, 0, B.head * 1.4, -B.head * 0.2, 6), sph(B.head * 0.18, glow('#4af0ff'), 0, B.head * 0.5, B.head * 0.95, 6, 4));
      } else {
        // Tzaangors: gilded torc, armbands and a loincloth.
        add(upper, mesh(new THREE.TorusGeometry(B.tw * 0.3, 0.015 * k, 5, 14), gold, 0, torsoY + B.th * 0.45, 0).rotateX(Math.PI / 2));
        add(upper, box(B.tw * 0.45, c.hipY * 0.45, 0.012, mat('#2763a8', { rough: 0.9 }), 0, c.hipY * 0.75, front + 0.01));
        for (const s of [-1, 1]) add(fig, cyl(B.armR * 1.3, B.armR * 1.3, 0.04 * k, gold, s * B.sx * 1.05, c.shY - 0.15 * k, 0.05 * k, 10));
      }
    },

    wyrmblade(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      add(head, tz(cyl(B.head * 0.25, B.head * 0.3, B.head * 0.3, mat('#5a4a3a', { metal: 0.5 }), 0, B.head * 0.75, B.head * 0.9)), sph(B.head * 0.2, glow('#fff6c0'), 0, B.head * 0.75, B.head * 1.08, 6, 4)); // mining headlamp
      add(upper, box(B.tw * 0.55, B.th * 0.5, 0.08 * k, mat('#5a4a3a'), 0, torsoY + 0.02, back - 0.04 * k), cyl(0.035 * k, 0.035 * k, B.th * 0.4, mat('#a8a050', { metal: 0.5 }), B.tw * 0.15, torsoY + 0.02, back - 0.09 * k, 8)); // mining rig
      belt(c, mat('#3a2e22'), METAL(), 4);
      add(upper, box(B.tw * 0.3, B.th * 0.3, 0.01, mat('#7a5aa6'), 0, torsoY + B.th * 0.1, front + 0.012), box(B.tw * 0.32, 0.01 * k, 0.012, mat('#c9a227', { metal: 0.6 }), 0, torsoY + B.th * 0.25, front + 0.014)); // cult tabard with a gilt edge
      for (const s of [-1, 1]) add(upper, box(0.028 * k, B.th * 0.85, 0.01, mat('#3a2e22'), s * B.tw * 0.26, torsoY + 0.02, front + 0.008), box(0.028 * k, B.th * 0.85, 0.01, mat('#3a2e22'), s * B.tw * 0.26, torsoY + 0.02, back - 0.008)); // rig straps
      if (!/kelermorph|locus/i.test(L.name)) add(head, ...[-1, 1].map((s) => tz(cyl(B.head * 0.2, B.head * 0.2, B.head * 0.2, mat('#2a2a2a', { metal: 0.4 }), s * B.head * 0.36, B.head * 0.5, B.head * 0.8)))); // goggles pushed up
      if (L.icon) add(upper, mesh(new THREE.TorusGeometry(0.06 * k, 0.012, 5, 12), GOLD(), B.tw * 0.3 + 0.11 * k, torsoY + 0.58 * k, back - 0.11)); // plain banner ring
      if (/kelermorph/i.test(L.name)) add(head, cyl(B.head * 1.0, B.head * 1.05, B.head * 0.6, mat('#2a2030'), 0, B.head * 0.9, 0, 10), cyl(B.head * 1.8, B.head * 1.8, B.head * 0.08, mat('#2a2030'), 0, B.head * 0.62, 0, 14)); // wide-brimmed hat
      if (/locus/i.test(L.name)) add(head, ...[0, 1, 2, 3].map((i) => box(B.head * 0.2, B.head * 0.2, B.head * 1.6, mat('#5a3a6a'), 0, B.head * (0.9 - i * 0.3), -B.head * (0.4 + i * 0.12))));
    },

    blooded(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      boss(upper, 0, torsoY + B.th * 0.2, front + 0.02, 0.09 * k, BRASS());
      for (const s of [-1, 1]) for (let i = 0; i < 2; i++) add(upper, aimY(cone(0.015 * k, 0.07 * k, METAL(), s * (B.sx + 0.01), c.shY + 0.04 * k, (i - 0.5) * 0.05 * k, 5), V(s * 0.5, 1, 0))); // shoulder spikes
      for (let i = 0; i < 4; i++) add(upper, box(0.04 * k, c.hipY * (0.3 + (i % 2) * 0.15), 0.01, mat(i % 2 ? '#a33a2f' : '#5a2a24', { rough: 1 }), (i - 1.5) * B.tw * 0.22, c.hipY * 0.8, front + 0.01)); // rag strips
      belt(c, mat('#3c2a24'), BRASS(), 3);
      const flak = mat('#4a3a32', { metal: 0.3, rough: 0.8 });
      for (const s of [-1, 1]) add(upper, box(B.tw * 0.32, B.th * 0.3, 0.02, flak, s * B.tw * 0.27, torsoY - B.th * 0.12, front + 0.012), ...[-1, 1].map((t) => sph(0.008 * k, METAL(), s * B.tw * 0.27 + t * B.tw * 0.11, torsoY - B.th * 0.01, front + 0.024, 6, 4))); // riveted flak plates
      add(upper, ...[0, 1, 2, 3, 4, 5].map((i) => mesh(new THREE.TorusGeometry(0.012 * k, 0.003, 4, 8), METAL(), (i / 5 - 0.5) * B.tw * 0.75, torsoY + B.th * (0.35 - Math.abs(i / 5 - 0.5) * 0.25), front + 0.03).rotateY((i % 2) * Math.PI / 2))); // a chain slung across the chest
      for (const s of [-1, 1]) add(upper, sph(0.035 * k, BONE(), s * B.tw * 0.45, c.hipY - 0.04 * k, front * 0.3, 6, 5)); // skull trophies
      add(upper, mesh(new THREE.TorusGeometry(B.tw * 0.4, 0.006, 4, 16), METAL(), 0, torsoY - B.th * 0.3, 0).rotateX(Math.PI / 2)); // barbed wire wrap
      if (L.leader) add(head, ...[-1, 1].map((s) => aimY(cone(B.head * 0.2, B.head * 1.4, BONE(), s * B.head * 0.85, B.head * 0.7, 0, 6), V(s * 0.9, 1, 0.1))));
      if (/enforcer/i.test(L.name)) add(head, cyl(B.head * 1.05, B.head * 1.0, B.head * 0.45, mat('#2a2a2a'), 0, B.head * 0.75, 0, 12), box(B.head * 1.2, B.head * 0.06, B.head * 0.6, mat('#2a2a2a'), 0, B.head * 0.55, B.head * 0.8), capBadge(B.head));
      if (/flenser|butcher/i.test(L.name)) add(upper, box(B.tw * 0.7, B.th * 0.8, 0.012, mat('#7a5a4a', { rough: 1 }), 0, torsoY - 0.02, front + 0.015)); // leather apron
    },

    fellgor(c) {
      const { upper, head, fig, B, k, torsoY, front, back, L } = c;
      const fur = mat('#4a3424', { rough: 1 });
      add(upper, box(B.tw * 1.2, 0.09 * k, B.td * 1.3, fur, 0, c.shY + 0.02, -0.01), box(B.tw * 0.8, B.th * 0.5, 0.05 * k, fur, 0, torsoY + B.th * 0.15, back - 0.02)); // fur mantle
      boss(upper, 0, torsoY + B.th * 0.05, front + 0.015, 0.07 * k, mat('#a82a24'));
      belt(c, LEATHER(), BONE(), 3);
      for (let i = 0; i < 4; i++) { const x = (i / 3 - 0.5) * B.tw * 0.8; add(upper, limb(V(x, c.hipY + 0.03 * k, front + 0.01), V(x * 1.05, c.hipY - 0.07 * k, front + 0.02), 0.004, LEATHER()), i % 2 ? sph(0.016 * k, BONE(), x * 1.05, c.hipY - 0.08 * k, front + 0.02, 6, 4) : cone(0.012 * k, 0.04 * k, BONE(), x * 1.05, c.hipY - 0.09 * k, front + 0.02, 5).rotateX(Math.PI)); } // bone fetishes
      add(upper, ...[0, 1, 2].map((i) => sph(0.012 * k, mat('#a82a24'), (i - 1) * 0.04 * k, c.shY - 0.01, front + 0.02, 6, 4))); // red beads on the mantle cord
      for (const s of [-1, 1]) add(fig, cyl(B.armR * 1.25, B.armR * 1.25, 0.06 * k, METAL(), s * B.sx * 1.15, c.shY - 0.2 * k, 0.08 * k, 8)); // bracers
      if (L.leader) add(head, sph(B.head * 1.05, METAL(), 0, B.head * 0.3, -B.head * 0.05, 8, 6)); // Ironhorn's iron helm
      if (/toxhorn/i.test(L.name)) add(head, ...[-1, 1].map((s) => aimY(cone(B.head * 0.27, B.head * 1.9, glow('#9aff3a'), s * B.head * 0.9, B.head * 0.85, -B.head * 0.2, 6), V(s * 0.9, 1, -0.6))));
      if (/gorehorn/i.test(L.name)) add(head, ...[-1, 1].map((s) => aimY(cone(B.head * 0.35, B.head * 2.6, BONE(), s * B.head * 1.0, B.head * 1.0, -B.head * 0.3, 6), V(s * 1, 0.8, -0.4))));
      if (/deathknell/i.test(L.name)) add(upper, cyl(0.006, 0.006, 0.7 * k, LEATHER(), B.tw * 0.35, torsoY + 0.25 * k, back - 0.08), cone(0.07 * k, 0.12 * k, BRASS(), B.tw * 0.35, torsoY + 0.6 * k, back - 0.08, 8)); // the knell bell
      if (/shaman/i.test(L.name)) add(head, sph(B.head * 0.4, BONE(), 0, B.head * 0.5, B.head * 0.75, 6, 5)); // skull mask
    },

    exaction(c) {
      const { upper, head, fig, B, k, torsoY, front, L } = c;
      chestPlate(upper, 0, torsoY + B.th * 0.24, front + 0.06, 0.18 * k, GOLD());
      padBadge(c, 1, GOLD(), 0.035);
      add(head, box(B.head * 0.5, B.head * 0.3, B.head * 0.05, GOLD(), 0, B.head * 0.55, B.head * 1.0)); // plain gold plate on the helmet
      belt(c, mat('#1e232c'), GOLD(), 4);
      add(upper, box(B.tw * 1.06, 0.012 * k, B.td * 1.14, GOLD(), 0, torsoY + B.th * 0.43, 0)); // gilt edge along the top of the carapace
      add(head, box(B.head * 1.1, B.head * 0.12, B.head * 0.06, glow('#ff3a2a'), 0, B.head * 0.15, B.head * 0.98)); // red visor slit
      add(upper, tz(cyl(0.02 * k, 0.024 * k, 0.035 * k, glow('#fff6c0'), -B.sx * 1.05, c.shY + 0.04 * k, 0.04 * k))); // shoulder lamp
      add(upper, mesh(new THREE.TorusGeometry(0.03 * k, 0.008, 4, 10), METAL(), B.tw * 0.42, c.hipY - 0.02, front * 0.5)); // manacles
      if (L.leader) add(head, box(B.head * 0.25, B.head * 0.6, B.head * 1.8, mat('#e8e8e8'), 0, B.head * 1.15, -B.head * 0.1)); // Proctor's crest
      const hands = fig.userData.hands;
      if (/leashmaster/i.test(L.name) && hands?.L) add(fig, limb(hands.L, V(hands.L.x + 0.4 * k, 0.35, hands.L.z + 0.6 * k), 0.007, METAL())); // leash
      if (/revelatum/i.test(L.name)) add(fig, sph(0.08 * k, BONE(), B.sx * 1.4, c.headY + 0.25, -0.1, 8, 6), sph(0.025 * k, glow('#ff3a2a'), B.sx * 1.4, c.headY + 0.25, -0.02, 6, 4)); // servo-skull
    },

    hierotek(c) {
      const { upper, head, fig, B, k, torsoY, front, back, L } = c;
      add(upper, ...glowBars(0, torsoY + B.th * 0.05, front + 0.02, 0.1 * k, glow('#3aff6a')));
      const gilt = mat(L.trim, { metal: 0.85, rough: 0.3 });
      add(upper, mesh(new THREE.TorusGeometry(B.head * 0.75, 0.012 * k, 5, 16), gilt, 0, c.shY + 0.02 * k, 0).rotateX(Math.PI / 2), // gilded collar
        ...[-1, 1].map((s) => box(B.armR * 3.3, 0.012 * k, B.armR * 3.3, gilt, s * (B.sx + 0.01), c.shY + B.armR * 0.62, 0))); // gilded rims on the shoulder plates
      if (L.float || /apprentek/i.test(L.name)) { // crypteks: tall headdress, collar and a back halo
        add(head, box(B.head * 1.0, B.head * 1.6, B.head * 1.0, mat(L.trim, { metal: 0.8, rough: 0.3 }), 0, B.head * 1.4, -B.head * 0.1), box(B.head * 0.3, B.head * 0.3, B.head * 0.05, glow('#3aff6a'), 0, B.head * 1.4, B.head * 0.42));
        add(upper, mesh(new THREE.TorusGeometry(B.tw * 0.7, 0.02 * k, 5, 18), mat(L.trim, { metal: 0.8, rough: 0.3 }), 0, c.shY + 0.15 * k, back - 0.08 * k));
      }
      if (/immortal/i.test(L.name)) add(upper, box(B.tw * 1.05, B.th * 0.5, B.td * 1.15, mat(L.main, { metal: 0.8, rough: 0.3 }), 0, torsoY + B.th * 0.2, 0), ...[-1, 1].map((s) => box(B.armR * 4, B.armR * 1.6, B.armR * 4, mat(L.main, { metal: 0.8, rough: 0.3 }), s * (B.sx + 0.02), c.shY + 0.03, 0)));
      if (/despotek/i.test(L.name)) add(head, ...[-1, 1].map((s) => box(B.head * 0.3, B.head * 1.6, B.head * 0.9, GOLD(), s * B.head * 0.85, -B.head * 0.2, -B.head * 0.2)));
      if (/deathmark/i.test(L.name)) add(head, box(B.head * 0.15, B.head * 1.1, B.head * 1.3, mat(L.main, { metal: 0.8 }), 0, B.head * 0.9, -B.head * 0.2), sph(B.head * 0.25, glow('#3aff6a'), 0, 0, B.head * 0.7, 6, 4)); // crest and targeting eye
    },

    hunterClade(c) {
      const { upper, head, fig, B, k, torsoY, front, back, L } = c;
      ringBoss(upper, 0, torsoY + B.th * 0.15, front + 0.015, 0.06 * k, mat('#e8e0d0', { metal: 0.5 }));
      ringBoss(upper, 0, torsoY + B.th * 0.2, back - 0.05 * k, 0.08 * k, BRASS());
      add(upper, mesh(new THREE.TorusGeometry(B.head * 0.7, 0.013 * k, 5, 16), BRASS(), 0, c.shY + 0.01, 0).rotateX(Math.PI / 2), // brass collar
        ...[-1, 0, 1].map((i) => limb(V(i * 0.02 * k, torsoY - B.th * 0.1, back - 0.02), V(B.tw * 0.35 + i * 0.015 * k, c.hipY - 0.02, back * 0.5), 0.006 * k, mat(i ? '#2a2a2a' : '#8a6a2a', { rough: 0.5 })))); // cable bundle
      add(upper, limb(V(B.tw * 0.3, torsoY + B.th * 0.4, back - 0.03), V(B.tw * 0.5, torsoY + B.th * 1.3, back - 0.15 * k), 0.008 * k, METAL()), sph(0.015 * k, glow('#3aff6a'), B.tw * 0.5, torsoY + B.th * 1.3, back - 0.15 * k, 6, 4)); // mechadendrite
      if (/vanguard/i.test(L.name)) add(upper, ...[-1, 1].map((s) => limb(V(s * B.tw * 0.2, torsoY + B.th * 0.3, back - 0.04), V(s * B.tw * 0.35, c.headY - c.hipY - B.th * 0.5 + c.hipY, 0), 0.01 * k, glow('#9aff3a')))); // rad tubes
      if (L.sicarian) add(head, box(B.head * 0.2, B.head * 1.5, B.head * 2.2, mat(L.main), 0, B.head * 1.0, -B.head * 0.3)); // Sicarian crest
      if (L.leader) add(upper, mesh(new THREE.CylinderGeometry(B.tw * 0.5, B.tw * 0.8, B.th + c.hipY * 0.6, 10, 1, true, Math.PI * 0.62, Math.PI * 0.76), mat('#6a1e18', { rough: 1, side: 'double' }), 0, c.hipY * 0.4 + (B.th + c.hipY * 0.6) / 2, back * 0.3));
      if (/surveyor/i.test(L.name)) add(head, tz(cyl(B.head * 0.2, B.head * 0.2, B.head * 0.6, DARK(), -B.head * 0.8, B.head * 0.3, B.head * 0.5)));
    },

    kasrkin(c) {
      const { upper, head, fig, B, k, torsoY, front, back, L } = c;
      add(upper, box(B.tw * 0.65, B.th * 0.6, 0.1 * k, mat('#2d3a26'), 0, torsoY + 0.02, back - 0.06 * k), box(B.tw * 0.5, 0.04 * k, 0.11 * k, glow('#e8a02a'), 0, torsoY - B.th * 0.15, back - 0.06 * k)); // hellgun power pack
      const hands = fig.userData.hands;
      if (hands?.R && c.picks.ranged && /hot-shot|hellgun|las/i.test(c.picks.ranged.n)) add(fig, limb(V(-B.tw * 0.25, torsoY - B.th * 0.2, c.hunch + back - 0.08 * k), hands.R, 0.01 * k, mat('#1e1e1e', { rough: 0.5 }))); // power cable to the gun
      chestPlate(upper, 0, torsoY + B.th * 0.25, front + 0.06, 0.15 * k, mat('#c9c9c0', { metal: 0.6 }));
      belt(c, mat('#2d3a26'), METAL(), 4);
      add(head, box(B.head * 0.5, B.head * 0.35, B.head * 0.3, mat('#2d3a26'), 0, -B.head * 0.55, B.head * 0.85), ...[-1, 1].map((s) => tz(cyl(B.head * 0.13, B.head * 0.13, B.head * 0.15, DARK(), s * B.head * 0.3, -B.head * 0.6, B.head * 0.95)))); // rebreather with twin filters
      for (let i = 0; i < 3; i++) add(upper, sph(0.022 * k, mat('#3a4430'), (i - 1) * 0.05 * k, torsoY - B.th * 0.2, front + 0.035, 6, 5)); // frag grenades
      for (const s of [-1, 1]) add(fig, box(B.legR * 2.2, B.legR * 2, B.legR * 1.2, mat(L.main), s * B.tw * 0.32, c.hipY * 0.5, 0.06 * k)); // knee pads
      if (L.leader) add(upper, box(0.07 * k, 0.04 * k, 0.012, GOLD(), B.tw * 0.25, torsoY + B.th * 0.32, front + 0.06)); // rank pin
      if (/demo/i.test(L.name)) add(upper, box(0.14 * k, 0.1 * k, 0.07 * k, mat('#5a5a3a'), 0, torsoY + B.th * 0.45, back - 0.14 * k), sph(0.015 * k, glow('#ff3a2a'), 0, torsoY + B.th * 0.52, back - 0.18 * k, 6, 4)); // melta charge
      if (/recon/i.test(L.name)) add(upper, box(0.1 * k, 0.07 * k, 0.03, DARK(), -B.tw * 0.45, torsoY - B.th * 0.1, front + 0.03), box(0.08 * k, 0.05 * k, 0.005, glow('#3aff8a'), -B.tw * 0.45, torsoY - B.th * 0.1, front + 0.047));
    },

    legionaries(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      boss(upper, 0, torsoY + B.th * 0.22, front + 0.03, 0.11 * k, BRASS());
      padBadge(c, 1, mat('#2a2a2a'), 0.05);
      // Trophy rack: two spikes on the backpack, with skulls.
      for (const s of [-1, 1]) add(upper, cyl(0.008 * k, 0.012 * k, 0.4 * k, METAL(), s * 0.1 * k, torsoY + B.th * 0.7 + 0.1 * k, back - 0.14 * k, 6), sph(0.035 * k, BONE(), s * 0.1 * k, torsoY + B.th * 0.7 + 0.24 * k, back - 0.14 * k, 6, 5));
      add(upper, mesh(new THREE.TorusGeometry(B.tw * 0.45, 0.01 * k, 4, 18, Math.PI), METAL(), 0, torsoY - B.th * 0.3, front * 0.2).rotateX(-Math.PI / 2.4)); // hanging chain
      belt(c, mat('#2a2a2a'), BRASS(), 3);
      const gilt = mat(L.trim, { metal: 0.8, rough: 0.3 });
      add(upper, box(B.tw * 0.72, 0.014 * k, 0.012, gilt, 0, torsoY + B.th * 0.36, front + 0.035), ...[-1, 1].map((s) => box(0.014 * k, B.th * 0.3, 0.012, gilt, s * B.tw * 0.36, torsoY + B.th * 0.22, front + 0.03)), // gilded chest plate edges
        ...[-1, 1].map((s) => cone(0.012 * k, 0.04 * k, gilt, s * B.tw * 0.3, torsoY + B.th * 0.4, front + 0.03))); // small spikes on the collar
      if (/balefire/i.test(L.name)) add(head, sph(B.head * 0.5, glow('#ff6a1a'), 0, B.head * 1.4, 0, 8, 6)); // balefire crown
      if (/anointed/i.test(L.name)) add(upper, ...[0, 1, 2].map((i) => limb(V((i - 1) * 0.06 * k, torsoY - B.th * 0.1, front), V((i - 1) * 0.12 * k, torsoY - B.th * 0.45, front + 0.12 * k), 0.012 * k, mat('#7a2a4a')))); // daemonic tendrils
    },

    novitiates(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      tag(upper, 0, torsoY + B.th * 0.2, front + 0.02, 0.1 * k, GOLD());
      puritySeal(upper, -B.tw * 0.3, torsoY + B.th * 0.05, front + 0.012); puritySeal(upper, B.tw * 0.32, torsoY - B.th * 0.1, front + 0.012);
      for (let i = 0; i < 9; i++) { const a = (i / 8) * Math.PI; add(upper, sph(0.012 * k, mat('#3a2a20'), Math.cos(a) * B.tw * 0.28, torsoY + B.th * 0.35 - Math.sin(a) * 0.12 * k, front + 0.015, 4, 3)); } // rosary
      add(upper, box(0.07 * k, 0.09 * k, 0.03 * k, mat('#6a1e1e'), B.tw * 0.42, c.hipY - 0.02, front * 0.4)); // book of scripture
      if (L.robe) add(upper, cyl(B.tw * 0.73, B.tw * 0.745, 0.03 * k, GOLD(), 0, c.hipY * 0.16, 0, 16), cyl(B.tw * 0.69, B.tw * 0.7, 0.012 * k, GOLD(), 0, c.hipY * 0.24, 0, 16)); // gilded hem bands
      add(upper, box(B.tw * 0.74, 0.012 * k, 0.012, GOLD(), 0, torsoY + B.th * 0.36, front + 0.02)); // gilt edge on the breastplate
      add(upper, mesh(new THREE.TorusGeometry(B.tw * 0.36, 0.03 * k, 5, 16), mat('#e8e0d0', { rough: 1 }), 0, c.shY + 0.01, 0).rotateX(Math.PI / 2)); // cowl
      if (/dialogus/i.test(L.name)) add(upper, cyl(0.008, 0.008, 0.8 * k, BRASS(), B.tw * 0.32, torsoY + 0.3 * k, back - 0.08), cone(0.06 * k, 0.12 * k, BRASS(), B.tw * 0.32, torsoY + 0.68 * k, back - 0.02, 10).rotateX(Math.PI / 2)); // loudhailer
      if (/penitent/i.test(L.name)) add(upper, box(B.tw * 0.5, B.th * 0.4, 0.012, mat('#e8dcb0'), 0, torsoY - B.th * 0.05, front + 0.03)); // penitent's placard
    },

    battleclade(c) {
      const { upper, head, fig, B, k, torsoY, front, back, L } = c;
      if (L.servitor) {
        // Servitors: tubes into the skull, a chest grille, a spine of cables.
        add(fig, ...[-1, 1].map((s) => limb(V(s * 0.05 * k, torsoY + B.th * 0.45, c.hunch + back - 0.02), V(s * B.head * 0.5, c.headY + B.head * 0.3, c.hunch * 2.2 - B.head * 0.5), 0.012 * k, mat('#3a3a2a', { rough: 0.5 }))));
        for (let i = 0; i < 4; i++) add(upper, box(B.tw * 0.5, 0.012, 0.012, METAL(), 0, torsoY + B.th * (0.2 - i * 0.08), front + 0.01));
        add(upper, cyl(0.02 * k, 0.02 * k, B.th * 1.1, DARK(), 0, torsoY, back - 0.02, 6), sph(0.02 * k, glow('#3aff6a'), B.tw * 0.25, torsoY + B.th * 0.3, front + 0.012, 6, 4));
      } else {
        ringBoss(upper, 0, torsoY + B.th * 0.15, front + 0.015, 0.06 * k, mat('#e8e0d0', { metal: 0.5 }));
        if (L.robe || L.body === 'skitarii') add(upper, cyl(B.tw * 0.735, B.tw * 0.75, 0.03 * k, BRASS(), 0, c.hipY * 0.14, 0, 16), box(0.012 * k, c.hipY * 0.85, 0.01, mat('#5a1410'), 0, c.hipY * 0.55, B.tw * 0.62)); // brass hem band and the robe's front seam
        for (const s of [-1, 1]) add(upper, limb(V(s * B.tw * 0.25, torsoY + B.th * 0.3, back - 0.05), V(s * B.tw * 0.9, torsoY + B.th * 0.9, back - 0.25 * k), 0.012 * k, METAL()), limb(V(s * B.tw * 0.9, torsoY + B.th * 0.9, back - 0.25 * k), V(s * B.tw * 1.1, torsoY + B.th * 0.5, back * 0 + 0.1 * k), 0.01 * k, METAL()), cone(0.02 * k, 0.06 * k, BRASS(), s * B.tw * 1.1, torsoY + B.th * 0.45, 0.12 * k)); // mechadendrites
      }
    },

    exoditeDragonMasters(c) {
      const { upper, head, B, k, torsoY, front, L } = c;
      add(upper, sph(0.035 * k, glow('#4af0ff'), 0, torsoY + B.th * 0.25, front + 0.02, 8, 6)); // waystone
      for (let i = 0; i < 3; i++) add(upper, box(B.tw * 0.9, 0.012, 0.01, mat('#d8b04a'), 0, torsoY - B.th * (0.1 + i * 0.1), front + 0.008)); // war paint bands
      add(head, ...[0, 1, 2].map((i) => limb(V(0, B.head * 0.8, -B.head * 0.3), V((i - 1) * B.head * 0.6, B.head * 2.0, -B.head * 1.4), 0.01 * k, mat(i === 1 ? '#e8c040' : '#a8603a'), 0.004))); // feathered plume
      add(head, mesh(new THREE.TorusGeometry(B.head * 1.0, B.head * 0.08, 5, 18), GOLD(), 0, B.head * 0.35, 0).rotateX(Math.PI / 2), sph(B.head * 0.14, glow('#4af0ff'), 0, B.head * 0.35, B.head * 1.04, 6, 4)); // jewelled headband
      if (/leystalker/i.test(L.name)) add(upper, box(0.03 * k, B.th * 0.7, 0.01, glow('#4af0ff'), -B.tw * 0.3, torsoY, front + 0.01));
    },

    goremongers(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      plate(upper, 0, torsoY + B.th * 0.2, front + 0.02, 0.1 * k, BRASS());
      add(upper, mesh(new THREE.TorusGeometry(B.tw * 0.32, 0.03 * k, 5, 14), BRASS(), 0, c.shY + 0.02, 0).rotateX(Math.PI / 2)); // brass collar
      belt(c, mat('#3a2a24'), BRASS(), 2);
      for (let i = 0; i < 3; i++) { const sc = box(0.008 * k, B.th * 0.28, 0.006, mat('#8a1e1a', { rough: 0.6 }), -B.tw * 0.3 + i * 0.03 * k, torsoY - B.th * 0.18, front + 0.006); sc.rotation.z = 0.5; add(upper, sc); } // ritual scars
      const skulls = /skullclaimer/i.test(L.name) ? 6 : 2;
      for (let i = 0; i < skulls; i++) { const a = (i / Math.max(1, skulls - 1) - 0.5) * 2.4; add(upper, sph(0.03 * k, BONE(), Math.sin(a) * B.tw * 0.5, c.hipY - 0.05 * k, Math.cos(a) * B.td * 0.55, 6, 5)); }
      add(upper, mesh(new THREE.TorusGeometry(0.05 * k, 0.008, 4, 10), METAL(), -B.tw * 0.45, c.hipY - 0.12 * k, front * 0.5).rotateY(Math.PI / 2)); // chains
      if (/herald|inciter/i.test(L.name)) add(upper, cyl(0.008, 0.008, 1.0 * k, BRASS(), B.tw * 0.3, torsoY + 0.25 * k, back - 0.1), box(0.22 * k, 0.28 * k, 0.01, mat('#8a1e1a'), B.tw * 0.3 + 0.11 * k, torsoY + 0.55 * k, back - 0.1), plateMesh(B.tw * 0.3 + 0.11 * k, torsoY + 0.55 * k, back - 0.09, 0.12 * k));
    },

    hernkynYaegirs(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      add(upper, mesh(new THREE.CylinderGeometry(B.tw * 0.55, B.tw * 0.8, B.th + c.hipY * 0.5, 10, 1, true, Math.PI * 0.6, Math.PI * 0.8), mat('#6a4a2a', { rough: 1, side: 'double' }), 0, c.hipY * 0.5 + (B.th + c.hipY * 0.5) / 2, back * 0.3), box(B.tw * 1.25, 0.08 * k, B.td * 1.3, mat('#c8b890', { rough: 1 }), 0, c.shY + 0.02, -0.01)); // fur-lined cloak
      add(head, ...[-1, 1].map((s) => tz(cyl(B.head * 0.24, B.head * 0.24, B.head * 0.25, mat('#2a2a2a', { metal: 0.4 }), s * B.head * 0.38, B.head * 0.62, B.head * 0.75)))); // goggles up
      add(upper, cyl(0.04 * k, 0.04 * k, 0.02, mat('#3a3a3e', { metal: 0.6, rough: 0.4 }), 0, torsoY + B.th * 0.12, front + 0.04, 6).rotateX(Math.PI / 2), cyl(0.022 * k, 0.022 * k, 0.012, glow('#4af0ff'), 0, torsoY + B.th * 0.12, front + 0.052, 6).rotateX(Math.PI / 2)); // power core in a hexagonal frame
      strap(c, LEATHER(), 1, 0.035);
      belt(c, LEATHER(), BRASS(), 4);
      if (/ironbraek/i.test(L.name)) add(upper, box(B.tw * 1.1, B.th * 0.6, B.td * 1.2, mat('#4a4a4e', { metal: 0.6 }), 0, torsoY + B.th * 0.15, 0));
      if (/tracker/i.test(L.name)) add(head, tz(cyl(B.head * 0.25, B.head * 0.3, B.head * 0.7, DARK(), -B.head * 0.75, B.head * 0.25, B.head * 0.6)), sph(B.head * 0.2, glow('#ff3a2a'), -B.head * 0.75, B.head * 0.25, B.head * 0.98, 6, 4));
      if (L.leader && !L.refined) add(head, sph(B.head * 1.12, mat('#8a6a3a', { metal: 0.6 }), 0, B.head * 0.3, -B.head * 0.05, 8, 6));
    },

    elucidianStarstriders(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      for (const s of [-1, 1]) add(upper, box(B.armR * 2.6, 0.03 * k, B.armR * 2.6, GOLD(), s * B.sx, c.shY + 0.04 * k, 0), ...[0, 1, 2].map((i) => box(0.008, 0.05 * k, 0.008, GOLD(), s * B.sx + (i - 1) * 0.02 * k, c.shY + 0.01, B.armR * 1.2))); // epaulettes
      const sash = box(0.05 * k, B.th * 1.1, 0.012, mat('#a82a24'), 0, torsoY, front + 0.012); sash.rotation.z = -0.6; add(upper, sash);
      belt(c, mat('#2a2a2a'), GOLD(), 3);
      if (!/executioner|voidsman/i.test(L.name)) add(upper, ...[0, 1, 2, 3].map((i) => box(B.tw * 0.42, 0.01 * k, 0.01, GOLD(), 0, torsoY + B.th * (0.32 - i * 0.12), B.td * 0.55)), ...[0, 1, 2, 3].flatMap((i) => [-1, 1].map((s2) => sph(0.009 * k, GOLD(), s2 * B.tw * 0.21, torsoY + B.th * (0.32 - i * 0.12), B.td * 0.555, 6, 4)))); // gold braid frogging
      if (/vhane/i.test(L.name)) add(head, cyl(B.head * 1.6, B.head * 1.6, B.head * 0.1, mat('#1e2a44'), 0, B.head * 0.75, 0, 3), cyl(B.head * 0.9, B.head * 1.0, B.head * 0.5, mat('#1e2a44'), 0, B.head * 1.0, 0, 10), limb(V(B.head * 0.5, B.head * 1.1, 0), V(B.head * 1.4, B.head * 2.2, -B.head * 0.8), 0.012 * k, mat('#f0f0f0'), 0.004)); // tricorne with a plume
      if (/voidmaster/i.test(L.name)) add(head, cyl(B.head * 1.05, B.head * 1.0, B.head * 0.45, mat('#1e2a44'), 0, B.head * 0.75, 0, 12), box(B.head * 1.2, B.head * 0.06, B.head * 0.6, DARK(), 0, B.head * 0.55, B.head * 0.8), box(B.head * 0.5, B.head * 0.15, B.head * 0.05, GOLD(), 0, B.head * 0.82, B.head * 1.05));
      if (/voidsman/i.test(L.name)) add(head, sph(B.head * 1.3, mat('#a8d8f0', { opacity: 0.45, rough: 0.1 }), 0, 0, B.head * 0.1, 10, 8)), add(upper, ...[-1, 1].map((s) => cyl(0.035 * k, 0.035 * k, B.th * 0.7, mat('#c9c9c0', { metal: 0.6 }), s * 0.06 * k, torsoY, back - 0.05 * k, 8)));
      if (/lectro/i.test(L.name)) add(upper, box(B.tw * 0.6, B.th * 0.6, 0.1 * k, DARK(), 0, torsoY + 0.02, back - 0.06 * k), ...[-1, 1].map((s) => cyl(0.02 * k, 0.02 * k, 0.3 * k, glow('#7ab8ff'), s * 0.07 * k, torsoY + B.th * 0.6, back - 0.08 * k, 6)), mesh(new THREE.TorusGeometry(0.06 * k, 0.008, 4, 10), glow('#7ab8ff'), 0, torsoY + B.th * 0.75, back - 0.08 * k)); // tesla coils
      if (/executioner/i.test(L.name)) add(upper, box(B.tw * 0.5, B.th * 0.9, 0.01, mat('#1a1a1e'), 0, torsoY - 0.05, front + 0.015));
    },

    chaosCult(c) {
      const { upper, head, fig, B, k, torsoY, front, back, L } = c;
      boss(upper, 0, torsoY + B.th * 0.3, front + 0.02, 0.06 * k, BRASS());
      add(upper, mesh(new THREE.TorusGeometry(B.head * 0.7, 0.012 * k, 4, 14), LEATHER(), 0, c.shY + 0.01, 0).rotateX(Math.PI / 2), ...[0, 1, 2, 3, 4].map((i) => { const a = (i / 4 - 0.5) * 2.2; return aimY(cone(0.008 * k, 0.03 * k, METAL(), Math.sin(a) * B.head * 0.72, c.shY + 0.01, Math.cos(a) * B.head * 0.72, 4), V(Math.sin(a), 0.3, Math.cos(a))); })); // spiked leather collar
      for (let i = 0; i < 5; i++) add(upper, box(0.02 * k, 0.004, 0.006, mat('#1e1e1e'), B.tw * 0.28, torsoY - B.th * (0.32 - i * 0.05), front + 0.008)); // crude stitching
      add(upper, limb(V(-B.tw * 0.15, torsoY + B.th * 0.48, front + 0.01), V(0, torsoY + B.th * 0.32, front + 0.015), 0.004, LEATHER()), limb(V(B.tw * 0.15, torsoY + B.th * 0.48, front + 0.01), V(0, torsoY + B.th * 0.32, front + 0.015), 0.004, LEATHER())); // pendant cord
      for (let i = 0; i < 3; i++) add(upper, box(B.tw * 1.02, 0.025 * k, B.td * 1.04, mat('#c8b890', { rough: 1 }), 0, torsoY - B.th * (0.2 - i * 0.15), 0).rotateZ((i - 1) * 0.15)); // crude wrappings
      if (/mutant|torment|blade/i.test(L.name)) {
        const tent = mat('#9a6a7a', { rough: 0.5 });
        const p0 = V(B.sx * 0.9, c.shY - 0.08 * k, c.hunch + back * 0.5), p1 = V(B.sx * 1.8, c.shY - 0.2 * k, 0.15 * k), p2 = V(B.sx * 1.6, c.shY - 0.45 * k, 0.4 * k);
        add(fig, limb(p0, p1, 0.035 * k, tent), limb(p1, p2, 0.025 * k, tent), cone(0.025 * k, 0.1 * k, BONE(), p2.x, p2.y - 0.04, p2.z, 5).rotateX(Math.PI)); // mutated extra limb
        add(head, ...[0, 1, 2].map((i) => cone(B.head * 0.12, B.head * 0.5, BONE(), (i - 1) * B.head * 0.5, B.head * 0.9, 0, 5)));
      }
      if (/mindwitch/i.test(L.name)) add(head, ...[-1, 1].map((s) => sph(B.head * 0.18, glow('#d04aff'), s * B.head * 0.35, B.head * 0.05, B.head * 0.95, 6, 4)));
      if (/demagogue/i.test(L.name)) add(upper, mesh(new THREE.CylinderGeometry(B.tw * 0.55, B.tw * 0.8, B.th + c.hipY * 0.85, 10, 1, true, Math.PI * 0.6, Math.PI * 0.8), mat('#5a1a1a', { rough: 1, side: 'double' }), 0, c.hipY * 0.15 + (B.th + c.hipY * 0.85) / 2, back * 0.3));
      if (L.icon) { const g = new THREE.Group(); boss(g, B.tw * 0.3 + 0.11 * k, torsoY + 0.55 * k, back - 0.09, 0.1 * k, BRASS()); add(upper, g); }
    },

    celestianInsidiants(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      tag(upper, 0, torsoY + B.th * 0.2, front + 0.02, 0.12 * k, GOLD());
      add(upper, box(B.tw * 0.75, B.th * 0.6, 0.1 * k, mat(L.main, { metal: 0.4 }), 0, torsoY + 0.05, back - 0.06 * k), ...[-1, 1].map((s) => cyl(0.025 * k, 0.03 * k, 0.16 * k, DARK(), s * 0.07 * k, torsoY + B.th * 0.55, back - 0.08 * k, 8))); // sororitas pack with exhausts
      tag(upper, 0, torsoY + 0.05, back - 0.115 * k, 0.1 * k, GOLD());
      for (const s of [-1, 1]) { const x = s * (B.sx + 0.03 + B.armR * 1.3); const g = new THREE.Group(); tag(g, 0, 0, 0, 0.06 * k, GOLD()); g.position.set(x, c.shY + 0.02, 0); g.rotation.y = s * Math.PI / 2; add(upper, g); }
      puritySeal(upper, B.tw * 0.3, torsoY - B.th * 0.05, front + 0.012);
      add(upper, box(B.tw * 0.74, 0.012 * k, 0.012, GOLD(), 0, torsoY + B.th * 0.36, front + 0.02), box(B.tw * 0.77, 0.012 * k, 0.12 * k, GOLD(), 0, torsoY + B.th * 0.35 + 0.05, back - 0.06 * k)); // gilt edges on the breastplate and pack
      if (/cremator/i.test(L.name)) add(upper, ...[-1, 1].map((s) => cyl(0.04 * k, 0.04 * k, B.th * 0.6, mat('#a8302a', { metal: 0.4 }), s * 0.12 * k, torsoY - 0.02, back - 0.14 * k, 8)));
      if (L.leader) add(head, mesh(new THREE.TorusGeometry(B.head * 1.1, B.head * 0.08, 5, 14), GOLD(), 0, B.head * 0.5, 0).rotateX(Math.PI / 2)); // circlet
    },

    canoptekCircle(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      add(upper, ...glowBars(0, torsoY + B.th * 0.05, front + 0.02, 0.1 * k, glow('#3affc0')));
      add(head, box(B.head * 1.0, B.head * 1.4, B.head * 1.0, mat('#2fb59a', { metal: 0.6, rough: 0.3 }), 0, B.head * 1.3, -B.head * 0.1), box(B.head * 1.04, B.head * 0.08, B.head * 1.04, GOLD(), 0, B.head * 0.62, -B.head * 0.1)); // headdress with a gilded band
      add(upper, mesh(new THREE.TorusGeometry(B.head * 0.75, 0.012 * k, 5, 16), GOLD(), 0, c.shY + 0.02 * k, 0).rotateX(Math.PI / 2)); // gilded collar
      for (let i = 0; i < 3; i++) add(upper, sph(0.03 * k, glow('#3affc0'), (i - 1) * 0.12 * k, c.shY + 0.2 * k + (i % 2) * 0.06, back - 0.1 * k, 6, 4)); // floating glyph orbs
    },

    broodBrothers(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      add(upper, mesh(new THREE.TorusGeometry(0.035 * k, 0.01, 4, 12), GOLD(), 0, torsoY + B.th * 0.25, front + 0.06), box(0.012, 0.06 * k, 0.01, GOLD(), 0, torsoY + B.th * 0.15, front + 0.06)); // wyrm-cult badge
      belt(c, mat('#3e3550'), METAL(), 4);
      for (const s of [-1, 1]) add(upper, box(0.03 * k, B.th * 0.9, 0.01, mat('#3e3550'), s * B.tw * 0.24, torsoY + 0.02, front + 0.03));
      add(upper, box(B.tw * 0.62, B.th * 0.32, 0.02, mat(L.trim, { metal: 0.2, rough: 0.7 }), 0, torsoY + B.th * 0.18, front + 0.02), box(B.tw * 0.62, 0.008 * k, 0.022, mat('#2a1418'), 0, torsoY + B.th * 0.18, front + 0.022)); // maroon flak plate with a seam
      for (let i = 0; i < 3; i++) add(upper, box(0.045 * k, 0.05 * k, 0.03 * k, mat('#3e3550'), (i - 1) * 0.055 * k, torsoY - B.th * 0.22, front + 0.025)); // ammo pouches
      if (/magus/i.test(L.name)) add(head, sph(B.head * 1.25, mat('#c7a9c0'), 0, B.head * 0.45, -B.head * 0.2, 10, 8), ...[0, 1, 2].map((i) => box(B.head * 0.15, B.head * 0.15, B.head * 1.6, mat('#9a7ab0'), 0, B.head * (1.3 - i * 0.3), -B.head * 0.4))); // swollen psychic cranium
      if (/primus/i.test(L.name)) add(upper, mesh(new THREE.CylinderGeometry(B.tw * 0.55, B.tw * 0.85, B.th + c.hipY * 0.8, 10, 1, true, Math.PI * 0.6, Math.PI * 0.8), mat('#3a2a4a', { rough: 1, side: 'double' }), 0, c.hipY * 0.2 + (B.th + c.hipY * 0.8) / 2, back * 0.3));
      if (L.icon) add(upper, mesh(new THREE.TorusGeometry(0.06 * k, 0.012, 5, 12), GOLD(), B.tw * 0.3 + 0.11 * k, torsoY + 0.58 * k, back - 0.11));
    },

    bladesOfKhaine(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      const gem = glow(L.aspectKind === 'banshee' ? '#ff4a4a' : L.aspectKind === 'scorpion' ? '#ffd040' : '#4af0ff');
      add(upper, sph(0.035 * k, gem, 0, torsoY + B.th * 0.25, front + 0.025, 8, 6)); // spirit stone
      add(upper, box(B.tw * 0.7, B.th * 0.5, 0.09 * k, mat(L.main, { metal: 0.3 }), 0, torsoY + 0.05, back - 0.05 * k)); // aspect armour backplate
      const edge = mat(L.trim, { metal: 0.5, rough: 0.35 });
      add(upper, box(B.tw * 0.8, 0.012 * k, 0.012, edge, 0, torsoY + B.th * 0.36, front + 0.02), ...[-1, 1].map((s) => box(0.012 * k, B.th * 0.4, 0.012, edge, s * B.tw * 0.4, torsoY + B.th * 0.17, front + 0.015))); // trim-coloured edges on the chest plate
      if (L.aspectKind === 'scorpion') add(upper, ...[-1, 1].map((s) => cyl(0.03 * k, 0.025 * k, 0.18 * k, mat(L.trim, { metal: 0.5 }), s * 0.07 * k, torsoY + B.th * 0.6, back - 0.08 * k, 8))); // sumpack exhausts
      if (L.aspectKind === 'avenger') add(upper, box(B.tw * 0.9, 0.04 * k, B.td * 1.02, mat('#e8e0d0'), 0, torsoY - B.th * 0.3, 0));
      if (L.leader) { // Exarchs: a second gem, a cloak and a taller crest
        add(upper, sph(0.025 * k, gem, B.tw * 0.25, c.hipY + 0.05 * k, front * 0.8, 6, 5));
        add(head, box(B.head * 0.2, B.head * 1.0, B.head * 2.6, mat('#e8c040'), 0, B.head * 1.4, -B.head * 0.4));
      }
    },

    handOfArchon(c) {
      const { upper, head, fig, B, k, torsoY, front, back, L } = c;
      add(head, cyl(B.head * 0.12, B.head * 0.25, B.head * 0.4, mat('#1a1a1e'), 0, B.head * 1.2, -B.head * 0.3, 6), limb(V(0, B.head * 1.3, -B.head * 0.35), V(0, -B.head * 1.2, -B.head * 1.6), B.head * 0.12, mat('#1a1a1e'), B.head * 0.05)); // topknot
      for (const s of [-1, 1]) add(fig, aimY(box(0.01, 0.16 * k, 0.04 * k, METAL(), s * B.sx * 1.3, c.shY - 0.18 * k, -0.02), V(s * 0.3, 1, -0.6))); // forearm blade fins
      for (let i = 0; i < 3; i++) add(upper, aimY(cone(0.015 * k, 0.12 * k, METAL(), (i - 1) * 0.07 * k, torsoY + B.th * 0.4, back - 0.03, 4), V((i - 1) * 0.3, 0.6, -1))); // back spines
      add(upper, box(0.05 * k, 0.08 * k, 0.012, mat('#a8a8b0', { metal: 0.7 }), 0, torsoY + B.th * 0.22, front + 0.015).rotateZ(Math.PI / 4)); // plain silver plate
      const honed = mat('#dfe3e8', { metal: 0.7, rough: 0.2 });
      for (const s of [-1, 1]) add(fig, aimY(box(0.012, 0.15 * k, 0.006, honed, s * B.sx * 1.3, c.shY - 0.18 * k, -0.02 + 0.022 * k), V(s * 0.3, 1, -0.6))); // honed fin edges
      for (let i = 0; i < 3; i++) add(upper, box(B.tw * 0.8, 0.01 * k, B.td * 0.95, mat('#0e1a16'), 0, torsoY - B.th * (0.05 + i * 0.1), 0.004)); // segmented abdominal armour
      belt(c, mat('#1e1e24'), METAL(), 3);
      if (/elixicant/i.test(L.name)) for (let i = 0; i < 4; i++) add(upper, cyl(0.012 * k, 0.012 * k, 0.05 * k, glow('#7fe03a'), (i - 1.5) * 0.04 * k, c.hipY + 0.02, front + 0.02, 6));
      if (/crimson/i.test(L.name)) add(upper, mesh(new THREE.CylinderGeometry(B.tw * 0.5, B.tw * 0.8, B.th + c.hipY * 0.8, 10, 1, true, Math.PI * 0.6, Math.PI * 0.8), mat('#8a1e2a', { rough: 1, side: 'double' }), 0, c.hipY * 0.2 + (B.th + c.hipY * 0.8) / 2, back * 0.3));
      if (/flayer/i.test(L.name)) for (let i = 0; i < 3; i++) add(upper, mesh(new THREE.TorusGeometry(0.025 * k, 0.005, 4, 8, Math.PI * 1.4), METAL(), (i - 1) * 0.06 * k, c.hipY - 0.03, front + 0.02)); // flaying hooks
      if (L.leader) add(head, box(B.head * 1.3, B.head * 0.5, B.head * 0.1, mat('#c9ccd1', { metal: 0.8, rough: 0.2 }), 0, -B.head * 0.1, B.head * 0.98)); // mirrored face mask
    },

    corsairVoidscarred(c) {
      const { upper, head, fig, B, k, torsoY, front, back, L } = c;
      const scarf = box(B.tw * 0.9, 0.05 * k, B.td * 1.1, mat('#a82a4a', { rough: 1 }), 0, c.shY + 0.01, 0);
      add(upper, scarf, box(0.06 * k, B.th * 0.5, 0.01, mat('#a82a4a', { rough: 1 }), B.tw * 0.2, torsoY + B.th * 0.1, front + 0.01)); // scarf and its tail
      const sash = box(0.05 * k, B.th * 1.0, 0.012, mat('#c9a227'), 0, torsoY - 0.02, front + 0.012); sash.rotation.z = 0.6; add(upper, sash);
      add(upper, box(B.armR * 3.4, B.armR * 1.4, B.armR * 3.4, mat('#5a5a6a', { metal: 0.5 }), -(B.sx + 0.02), c.shY + 0.03, 0)); // one mismatched pauldron
      add(upper, sph(0.025 * k, glow('#4af0ff'), 0, torsoY + B.th * 0.25, front + 0.02, 6, 5), mesh(new THREE.TorusGeometry(0.03 * k, 0.006, 5, 14), mat('#c9a227', { metal: 0.8 }), 0, torsoY + B.th * 0.25, front + 0.02)); // spirit stone in a gilt setting
      add(upper, box(B.tw * 0.78, 0.01 * k, 0.012, mat('#c9a227', { metal: 0.8 }), 0, torsoY + B.th * 0.38, front + 0.012)); // gilt edge on the breastplate
      add(head, limb(V(0, B.head * 0.9, -B.head * 0.2), V(0, B.head * 0.6, -B.head * 1.8), B.head * 0.2, mat('#e8e0d0'), B.head * 0.06)); // plume
      if (/shade runner/i.test(L.name)) add(upper, box(B.tw * 0.5, B.th * 0.4, 0.08 * k, DARK(), 0, torsoY + 0.05, back - 0.05 * k), sph(0.04 * k, glow('#b06aff'), 0, torsoY + 0.05, back - 0.1 * k, 8, 6)); // blink pack
      if (/fate dealer/i.test(L.name)) add(upper, ...[0, 1].map((i) => box(0.03 * k, 0.03 * k, 0.03 * k, glow('#ffd040'), B.tw * 0.4 + i * 0.04 * k, c.hipY, front * 0.5)));
      if (L.leader) add(head, limb(V(0, B.head * 0.9, -B.head * 0.2), V(B.head * 0.4, B.head * 2.0, -B.head * 1.0), B.head * 0.2, mat('#e8c040'), B.head * 0.05));
    },

    deathwatch(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      chestPlate(upper, 0, torsoY + B.th * 0.24, front + 0.035, 0.24 * k, mat('#c9ccd1', { metal: 0.8, rough: 0.3 }));
      // A plain silver band on the right pauldron.
      const x = -(B.sx + 0.02 + B.armR * 2.25);
      add(upper, box(0.012, 0.02 * k, 0.09 * k, mat('#c9ccd1', { metal: 0.8 }), x, c.shY + B.armR * 0.3, 0));
      puritySeal(upper, B.tw * 0.28, torsoY - B.th * 0.05, front + 0.012);
      belt(c, mat('#1a1a1e', { metal: 0.5 }), mat('#c9ccd1', { metal: 0.8 }), 3);
      add(upper, cyl(B.head * 0.62, B.head * 0.7, B.head * 0.22, c.M.main, 0, c.shY + B.head * 0.12, 0.01, 16), cyl(B.head * 0.71, B.head * 0.71, 0.012 * k, mat('#c9ccd1', { metal: 0.8, rough: 0.3 }), 0, c.shY + B.head * 0.02, 0.01, 16)); // gorget with a silver rim
      add(upper, sph(0.04 * k, BONE(), -B.tw * 0.45, c.hipY - 0.05 * k, front * 0.4, 6, 5), cone(0.01 * k, 0.06 * k, BONE(), -B.tw * 0.45, c.hipY - 0.01, front * 0.4 + 0.03, 4)); // xenos skull trophy
      if (L.leader) add(upper, mesh(new THREE.CylinderGeometry(B.tw * 0.5, B.tw * 0.8, B.th + c.hipY * 0.8, 10, 1, true, Math.PI * 0.6, Math.PI * 0.8), mat('#1a1a1e', { rough: 1, side: 'double' }), 0, c.hipY * 0.2 + (B.th + c.hipY * 0.8) / 2, back * 0.3));
    },

    mandrakes(c) {
      const { upper, head, fig, B, k, torsoY, front, back, L } = c;
      const rune = glow('#8aff3a');
      for (let i = 0; i < 5; i++) add(upper, box(0.012, 0.06 * k, 0.006, rune, ((i * 37) % 7 / 7 - 0.5) * B.tw * 0.8, torsoY + ((i * 53) % 5 / 5 - 0.4) * B.th, front + 0.006).rotateZ(i * 0.7)); // glowing runes
      for (let i = 0; i < 4; i++) add(upper, box(0.04 * k, c.hipY * (0.4 + (i % 2) * 0.2), 0.008, mat('#14181e', { rough: 1 }), (i - 1.5) * B.tw * 0.22, c.hipY * 0.75, (i % 2 ? front : back))); // tattered rags
      add(upper, mesh(new THREE.TorusGeometry(B.tw * 0.45, 0.01 * k, 4, 16), METAL(), 0, torsoY - B.th * 0.1, 0).rotateX(Math.PI / 2 - 0.3)); // chain
      for (const s of [-1, 1]) for (let i = 0; i < 2; i++) add(upper, aimY(cone(0.012 * k, 0.07 * k, BONE(), s * (B.sx + 0.005), c.shY + 0.02 * k, (i - 0.5) * 0.05 * k, 5), V(s * 0.7, 1, -0.2))); // bone spurs
      for (let i = 0; i < 4; i++) add(fig, sph(0.12 * k, mat('#0a0e14', { opacity: 0.35 }), Math.cos(i * 1.6) * 0.15 * k, 0.12 + i * 0.12, Math.sin(i * 1.6) * 0.15 * k, 6, 5)); // shadow wisps
      if (L.leader) add(head, ...[-1, 1].map((s) => aimY(cone(B.head * 0.15, B.head * 1.2, mat('#3a4a5a'), s * B.head * 0.7, B.head * 0.8, 0, 5), V(s * 0.6, 1, -0.3))));
    },

    murderwing(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      add(head, cone(B.head * 0.35, B.head * 1.0, mat(L.main, { metal: 0.4 }), 0, -B.head * 0.25, B.head * 1.05, 6).rotateX(Math.PI / 2)); // shrieking beaked faceplate
      boss(upper, 0, torsoY + B.th * 0.22, front + 0.03, 0.1 * k, BRASS());
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) add(upper, aimY(box(0.012, (0.35 - i * 0.07) * k, 0.06 * k, mat('#2a1a1e'), s * (0.18 + i * 0.07) * k, torsoY + 0.3 * k - i * 0.06, back - 0.14 * k), V(s * (0.6 + i * 0.25), 1 - i * 0.2, -0.3))); // wing vanes
      for (const s of [-1, 1]) add(upper, sph(0.03 * k, BONE(), s * B.tw * 0.4, c.hipY - 0.04, front * 0.4, 6, 5));
      belt(c, mat('#2a1a1e'), BRASS(), 2);
      const gilt = mat(L.trim, { metal: 0.8, rough: 0.3 });
      add(upper, box(B.tw * 0.72, 0.014 * k, 0.012, gilt, 0, torsoY + B.th * 0.36, front + 0.035));
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) add(upper, aimY(box(0.014, (0.33 - i * 0.07) * k, 0.008, gilt, s * (0.18 + i * 0.07) * k, torsoY + 0.3 * k - i * 0.06, back - 0.14 * k + 0.03 * k), V(s * (0.6 + i * 0.25), 1 - i * 0.2, -0.3))); // gilt leading edges on the wing vanes
    },

    wreckaKrew(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      const plate = mat(L.main, { metal: 0.5, rough: 0.5 });
      for (let i = 0; i < 6; i++) add(upper, sph(0.01 * k, METAL(), (i % 3 - 1) * B.tw * 0.35, torsoY + (i < 3 ? 0.08 : -0.08) * k, front + 0.03, 4, 3)); // rivets
      add(upper, box(B.tw * 0.5, 0.04 * k, 0.012, mat('#1a1a1a'), 0, torsoY - B.th * 0.25, front + 0.03), box(B.tw * 0.5, 0.04 * k, 0.012, mat('#e8c040'), 0, torsoY - B.th * 0.32, front + 0.03)); // hazard stripes
      add(upper, box(0.08 * k, 0.07 * k, 0.012, mat('#e8e0d0'), 0, torsoY + B.th * 0.05, front + 0.035), ...[-1, 1].map((s) => box(0.02 * k, 0.02 * k, 0.012, mat('#1a1a1a'), s * 0.02 * k, torsoY + B.th * 0.07, front + 0.042))); // painted glyph skull
      add(upper, ...[-1, 1].map((s) => box(B.armR * 3.6, B.armR * 1.8, B.armR * 3.6, plate, s * (B.sx + 0.03), c.shY + 0.05 * k, 0)));
      for (const s of [-1, 1]) add(upper, box(B.armR * 3.65, 0.02 * k, B.armR * 3.65, mat('#e8c040'), s * (B.sx + 0.03), c.shY + 0.05 * k - B.armR * 0.75, 0), ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => sph(0.01 * k, METAL(), s * (B.sx + 0.03) + a * B.armR * 1.4, c.shY + 0.05 * k + B.armR * 0.9, b * B.armR * 1.4, 6, 4))); // hazard edge and rivets on each shoulder plate
      if (/rokkiteer|tankbusta|gunner/i.test(L.name)) for (let i = 0; i < 4; i++) add(upper, cyl(0.025 * k, 0.025 * k, B.th * 0.9, mat('#5a5a3a'), (i - 1.5) * 0.055 * k, torsoY + 0.05, back - 0.07 * k, 8), cone(0.025 * k, 0.06 * k, RED(), (i - 1.5) * 0.055 * k, torsoY + B.th * 0.5 + 0.08, back - 0.07 * k, 6));
      if (/demolisha/i.test(L.name)) for (let i = 0; i < 5; i++) add(upper, cyl(0.02 * k, 0.02 * k, 0.16 * k, RED(), (i - 2) * 0.045 * k, torsoY + 0.05, back - 0.06 * k, 6), cyl(0.004, 0.004, 0.05 * k, mat('#e8e0d0'), (i - 2) * 0.045 * k, torsoY + 0.16 * k, back - 0.06 * k, 4)); // stikkbomb bundle
      if (L.leader) add(head, ...[-1, 1].map((s) => aimY(cone(B.head * 0.22, B.head * 1.3, METAL(), s * B.head * 0.85, B.head * 0.7, 0, 6), V(s * 0.8, 1, 0.1))));
    },

    nemesisClaw(c) {
      const { upper, head, fig, B, k, torsoY, front, back, L } = c;
      const bolt = mat('#c8202a', { rough: 0.5 });
      // Lightning bolts on the pauldrons and greaves.
      for (const s of [-1, 1]) { const x = s * (B.sx + 0.02 + B.armR * 2.2); for (let i = 0; i < 3; i++) add(upper, box(0.012, 0.045 * k, 0.012, bolt, x, c.shY + B.armR * (1.1 - i * 0.5), (i % 2 ? 1 : -1) * 0.015 * k).rotateX((i % 2 ? 1 : -1) * 0.7)); }
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) add(fig, box(0.012, 0.05 * k, 0.01, bolt, s * B.tw * 0.3, c.hipY * (0.4 - i * 0.12), 0.1 * k).rotateZ((i % 2 ? 1 : -1) * 0.6));
      // A skull ornament on the chest.
      add(upper, sph(0.04 * k, BONE(), 0, torsoY + B.th * 0.22, front + 0.04, 8, 6), ...[-1, 1].map((s) => sph(0.01 * k, mat('#111'), s * 0.014 * k, torsoY + B.th * 0.23, front + 0.077, 6, 4)));
      // Flayed skins draped from the belt, a skull on a chain.
      for (let i = 0; i < 3; i++) add(upper, box(0.07 * k, c.hipY * 0.45, 0.008, mat('#d8b898', { rough: 1 }), (i - 1) * B.tw * 0.32, c.hipY * 0.72, back + (i === 1 ? 0 : 0.02) - 0.01));
      belt(c, mat('#1a1a2e'), BRASS(), 2);
      add(upper, box(B.tw * 0.72, 0.014 * k, 0.012, mat(L.trim, { metal: 0.8, rough: 0.3 }), 0, torsoY + B.th * 0.36, front + 0.035)); // gilt edge on the chest plate
      add(upper, limb(V(B.tw * 0.4, c.hipY + 0.03, front * 0.5), V(B.tw * 0.45, c.hipY - 0.12 * k, front * 0.6), 0.005, METAL()), sph(0.03 * k, BONE(), B.tw * 0.45, c.hipY - 0.15 * k, front * 0.6, 6, 5));
      if (/visionary/i.test(L.name)) add(head, sph(B.head * 0.25, glow('#e8e0ff'), 0, B.head * 0.6, B.head * 0.85, 6, 4)); // seer's eye
      if (/fearmonger/i.test(L.name)) add(upper, ...[0, 1].map((i) => cyl(0.03 * k, 0.03 * k, 0.12 * k, glow('#9aff3a'), (i - 0.5) * 0.08 * k, c.hipY + 0.02, front + 0.03, 8))); // terrorchem vials
      if (/skinthief/i.test(L.name)) add(upper, mesh(new THREE.CylinderGeometry(B.tw * 0.55, B.tw * 0.85, B.th + c.hipY * 0.7, 10, 1, true, Math.PI * 0.6, Math.PI * 0.8), mat('#d8b898', { rough: 1, side: 'double' }), 0, c.hipY * 0.3 + (B.th + c.hipY * 0.7) / 2, back * 0.3)); // flayed-skin cloak
    },

    scoutSquad(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      padBadge(c, 1, mat('#e8e0d0'), 0.035);
      strap(c, LEATHER(), -1, 0.035);
      add(upper, box(0.02 * k, 0.11 * k, 0.03 * k, DARK(), -B.tw * 0.15, torsoY + B.th * 0.1, front + 0.02).rotateZ(0.6), box(0.012, 0.08 * k, 0.025 * k, METAL(), -B.tw * 0.2, torsoY + B.th * 0.18, front + 0.025).rotateZ(0.6)); // combat knife on the strap
      belt(c, LEATHER(), METAL(), 5);
      for (const s of [-1, 1]) add(upper, sph(0.028 * k, DARK(), s * B.tw * 0.36, c.hipY + 0.05 * k, front * 0.6, 6, 5));
      add(upper, cyl(0.03 * k, 0.03 * k, 0.07 * k, mat('#4a4f40'), B.tw * 0.5, c.hipY - 0.02, -0.02, 10), cyl(0.012 * k, 0.012 * k, 0.015 * k, METAL(), B.tw * 0.5, c.hipY + 0.025 * k, -0.02, 8)); // canteen
      if (L.leader) add(head, sph(B.head * 0.16, glow('#ff3a2a'), -B.head * 0.35, B.head * 0.05, B.head * 0.95, 6, 4)); // bionic eye
      if (/hunter/i.test(L.name)) add(upper, tz(cyl(0.035 * k, 0.04 * k, 0.2 * k, DARK(), B.tw * 0.3, torsoY + B.th * 0.35, back - 0.06 * k)), cone(0.03 * k, 0.06 * k, METAL(), B.tw * 0.3, torsoY + B.th * 0.35, back + 0.06 * k).rotateX(Math.PI / 2)); // grapnel launcher
      if (/tracker/i.test(L.name)) add(head, tz(cyl(B.head * 0.22, B.head * 0.28, B.head * 0.6, DARK(), -B.head * 0.75, B.head * 0.25, B.head * 0.6)), sph(B.head * 0.18, glow('#3aff8a'), -B.head * 0.75, B.head * 0.25, B.head * 0.94, 6, 4));
    },

    ratlings(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      if (L.body === 'ogryn') { // Ogryns and Bullgryns: riveted plates, a big ammo drum
        for (let i = 0; i < 6; i++) add(upper, sph(0.018 * k, METAL(), (i % 3 - 1) * B.tw * 0.3, torsoY + (i < 3 ? 0.12 : -0.05) * k, front + 0.02, 4, 3));
        add(upper, cyl(0.12 * k, 0.12 * k, 0.15 * k, mat('#4a4a3a', { metal: 0.5 }), 0, torsoY, back - 0.1 * k, 12).rotateX(Math.PI / 2));
        belt(c, LEATHER(), METAL(), 3);
        return;
      }
      strap(c, LEATHER(), 1, 0.03);
      for (let i = 0; i < 4; i++) { const t = i / 3 - 0.5; add(upper, box(0.015 * k, 0.03 * k, 0.015 * k, BRASS(), t * B.tw * 0.55, torsoY + t * B.th * 0.45, front + 0.02)); }
      add(upper, box(B.tw * 0.8, B.th * 0.9, 0.12 * k, mat('#6a5a3a'), 0, torsoY + 0.02, back - 0.07 * k), cyl(0.04 * k, 0.04 * k, B.tw * 0.9, mat('#7a6a4a'), 0, torsoY + B.th * 0.55, back - 0.08 * k, 8).rotateZ(Math.PI / 2)); // rucksack and bedroll
      add(head, ...[-1, 1].map((s) => tz(cyl(B.head * 0.22, B.head * 0.22, B.head * 0.2, mat('#2a2a2a', { metal: 0.4 }), s * B.head * 0.38, B.head * 0.55, B.head * 0.78))));
      belt(c, LEATHER(), BRASS(), 3);
      add(upper, cyl(0.028 * k, 0.028 * k, 0.07 * k, mat('#4a5a3a'), -B.tw * 0.5, c.hipY - 0.02, -0.02, 10)); // canteen
      add(head, cyl(B.head * 1.12, B.head * 1.12, B.head * 0.06, mat('#3a4430', { rough: 0.7 }), 0, B.head * 0.42, 0, 16), limb(V(-B.head * 0.85, B.head * 0.35, 0), V(0, -B.head * 0.9, B.head * 0.5), 0.004, LEATHER()), limb(V(B.head * 0.85, B.head * 0.35, 0), V(0, -B.head * 0.9, B.head * 0.5), 0.004, LEATHER())); // helmet rim and chin strap
      if (/stashmaster/i.test(L.name)) add(upper, box(B.tw * 1.1, B.th * 1.3, 0.2 * k, mat('#5a4a2a'), 0, torsoY + 0.12 * k, back - 0.2 * k), sph(0.05 * k, mat('#a82a24'), 0.06 * k, torsoY + B.th * 1.0, back - 0.2 * k, 6, 5), cyl(0.03 * k, 0.03 * k, 0.1 * k, glow('#e8c040'), -0.05 * k, torsoY + B.th * 0.9, back - 0.25 * k, 8)); // overloaded with loot
      if (/bomber/i.test(L.name)) for (let i = 0; i < 3; i++) add(upper, sph(0.03 * k, DARK(), (i - 1) * 0.05 * k, c.hipY + 0.02, front + 0.03, 6, 5));
      if (/spotter/i.test(L.name)) add(head, tz(cyl(B.head * 0.18, B.head * 0.25, B.head * 1.2, BRASS(), B.head * 0.7, B.head * 0.3, B.head * 0.6)));
      if (/sneak/i.test(L.name)) add(upper, mesh(new THREE.CylinderGeometry(B.tw * 0.6, B.tw * 0.9, B.th + c.hipY * 0.7, 10, 1, true, Math.PI * 0.55, Math.PI * 0.9), mat('#5a6446', { rough: 1, side: 'double' }), 0, c.hipY * 0.3 + (B.th + c.hipY * 0.7) / 2, back * 0.3));
      if (L.leader) add(head, cyl(B.head * 0.06, B.head * 0.06, B.head * 0.6, mat('#8a5a3a'), B.head * 0.3, -B.head * 0.35, B.head * 1.1, 6).rotateX(Math.PI / 2), sph(B.head * 0.07, glow('#ff6a1a'), B.head * 0.3, -B.head * 0.35, B.head * 1.4, 4, 3)); // the Fixer's cigar
    },

    sanctifiers(c) {
      const { upper, head, fig, B, k, torsoY, front, back, L } = c;
      add(upper, mesh(new THREE.TorusGeometry(B.tw * 0.48, 0.015 * k, 4, 16), mat('#c8b890', { rough: 1 }), 0, c.hipY + 0.04, 0).rotateX(Math.PI / 2)); // rope belt
      chestPlate(upper, 0, torsoY + B.th * 0.25, front + 0.02, 0.12 * k, GOLD());
      add(upper, box(0.07 * k, 0.09 * k, 0.03 * k, mat('#6a1e1e'), -B.tw * 0.4, c.hipY - 0.02, front * 0.5)); // book
      puritySeal(upper, B.tw * 0.25, torsoY - B.th * 0.05, front + 0.012);
      if (L.robe) add(upper, cyl(B.tw * 0.73, B.tw * 0.745, 0.035 * k, mat('#8a1e1e', { rough: 0.8 }), 0, c.hipY * 0.15, 0, 16), cyl(B.tw * 0.7, B.tw * 0.71, 0.01 * k, GOLD(), 0, c.hipY * 0.22, 0, 16)); // red hem band with a gold line
      add(upper, limb(V(B.tw * 0.2, c.hipY + 0.03, front * 0.9), V(B.tw * 0.24, c.hipY - 0.2 * k, front * 1.0), 0.006, mat('#c8b890', { rough: 1 })), sph(0.012 * k, mat('#c8b890'), B.tw * 0.24, c.hipY - 0.21 * k, front * 1.0, 6, 4)); // knotted rope end
      if (/confessor/i.test(L.name)) add(head, cyl(B.head * 0.6, B.head * 1.05, B.head * 1.4, mat('#e8e0d0'), 0, B.head * 1.3, 0, 8), box(B.head * 0.12, B.head * 0.8, B.head * 0.05, GOLD(), 0, B.head * 1.3, B.head * 0.85)); // tall hat
      if (/drill abbot/i.test(L.name)) add(head, cyl(B.head * 1.05, B.head * 1.0, B.head * 0.45, mat('#3a2a2a'), 0, B.head * 0.75, 0, 12), box(B.head * 1.2, B.head * 0.06, B.head * 0.6, DARK(), 0, B.head * 0.55, B.head * 0.8));
      const hands = fig.userData.hands;
      if (/miraculist/i.test(L.name) && hands) for (const h of [hands.R, hands.L]) if (h) add(fig, ...[0, 1, 2].map((i) => cone(0.03 * k, 0.12 * k, glow(i ? '#ffd040' : '#ff6a1a'), h.x + (i - 1) * 0.02, h.y + 0.08, h.z, 5))); // burning hands
      if (/conflagrator|persecutor/i.test(L.name)) add(upper, ...[-1, 1].map((s) => cyl(0.04 * k, 0.04 * k, B.th * 0.65, mat('#a8302a', { metal: 0.4 }), s * 0.07 * k, torsoY, back - 0.06 * k, 8)));
      for (const s of [-1, 1]) if (/preacher|missionary/i.test(L.name)) add(upper, cyl(0.012 * k, 0.012 * k, 0.06 * k, mat('#f0ecd0'), s * B.sx * 0.9, c.shY + 0.06 * k, -0.02, 6), sph(0.01 * k, glow('#ffb040'), s * B.sx * 0.9, c.shY + 0.1 * k, -0.02, 4, 3)); // candles
    },

    spectres(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      // Ghillie strips over the cloak and shoulders.
      for (let i = 0; i < 10; i++) { const a = (i / 9 - 0.5) * 2.6; add(upper, box(0.03 * k, (0.12 + (i % 3) * 0.05) * k, 0.008, mat(i % 2 ? '#56634a' : '#3f4a34', { rough: 1 }), Math.sin(a) * B.tw * 0.55, c.shY - 0.04 * k - (i % 3) * 0.02, -Math.cos(a) * B.td * 0.6)); }
      for (const s of [-1, 1]) add(upper, box(0.03 * k, B.th * 0.9, 0.01, mat('#2f362a'), s * B.tw * 0.24, torsoY + 0.02, front + 0.03));
      belt(c, mat('#2f362a'), METAL(), 5);
      for (let i = 0; i < 3; i++) add(upper, box(0.04 * k, 0.05 * k, 0.025 * k, mat('#2f362a'), (i - 1) * 0.05 * k, torsoY - B.th * 0.2, front + 0.035)); // chest pouches
      add(upper, box(0.08 * k, 0.12 * k, 0.05 * k, DARK(), B.tw * 0.25, torsoY + B.th * 0.15, back - 0.04 * k), cyl(0.003, 0.003, 0.4 * k, METAL(), B.tw * 0.3, torsoY + B.th * 0.55, back - 0.05 * k, 4)); // vox pack and its whip aerial
      if (!L.refined) add(head, hood(B.head * 1.08, mat('#3f4a34', { rough: 1, side: 'double' }))); // camo hood over the helmet
      if (L.leader) add(head, cyl(0.004, 0.004, B.head * 2.4, METAL(), B.head * 0.8, B.head * 1.2, -B.head * 0.3, 4));
    },

    aquilons(c) {
      const { upper, head, fig, B, k, torsoY, front, back, L } = c;
      // Grav-chute: a slim pack with two fins and glowing vents.
      add(upper, box(B.tw * 0.6, B.th * 0.75, 0.1 * k, mat('#2e3242', { metal: 0.5 }), 0, torsoY + 0.04, back - 0.06 * k), ...[-1, 1].map((s) => aimY(box(0.015, 0.22 * k, 0.1 * k, mat(L.main, { metal: 0.4 }), s * 0.11 * k, torsoY + B.th * 0.45, back - 0.09 * k), V(s * 0.35, 1, -0.2))), box(B.tw * 0.4, 0.03 * k, 0.11 * k, glow('#7ab8ff'), 0, torsoY - B.th * 0.3, back - 0.06 * k));
      const hands = fig.userData.hands;
      if (hands?.R && c.picks.ranged && /hot-shot|las/i.test(c.picks.ranged.n)) add(fig, limb(V(-B.tw * 0.25, torsoY - B.th * 0.2, c.hunch + back - 0.08 * k), hands.R, 0.01 * k, mat('#1e1e1e', { rough: 0.5 })));
      chestPlate(upper, 0, torsoY + B.th * 0.25, front + 0.06, 0.15 * k, mat('#c9c9c0', { metal: 0.6 }));
      belt(c, mat('#2e3242'), METAL(), 4);
      for (const s of [-1, 1]) add(fig, box(B.legR * 2.2, B.legR * 2, B.legR * 1.2, mat(L.main), s * B.tw * 0.32, c.hipY * 0.5, 0.06 * k));
      add(upper, box(B.tw * 0.62, 0.012 * k, 0.11 * k, mat('#9aa0aa', { metal: 0.6 }), 0, torsoY + 0.04 + B.th * 0.375, back - 0.06 * k), // bright edge on the grav-chute
        ...[0, 1].map((i) => sph(0.022 * k, mat('#3a3e46'), -B.tw * 0.3 + i * 0.05 * k, torsoY - B.th * 0.22, front + 0.03, 6, 5))); // grenades
      if (L.leader) add(head, box(B.head * 0.2, B.head * 0.5, B.head * 1.4, mat('#a82a24'), 0, B.head * 1.1, -B.head * 0.1)); // Tempestor's crest
    },

    voidDancers(c) {
      const { upper, head, fig, B, k, torsoY, front, back, L } = c;
      for (const s of [-1, 1]) { const tail = box(0.07 * k, c.hipY * 0.85, 0.01, mat(s < 0 ? L.trim : '#2a2a2a', { rough: 0.6 }), s * B.tw * 0.18, c.hipY * 0.55, back - 0.02); tail.rotation.x = 0.25; add(upper, tail); } // coat tails
      add(upper, mesh(new THREE.TorusGeometry(B.tw * 0.32, 0.035 * k, 5, 16), mat('#f0f0f0', { rough: 0.8 }), 0, c.shY + 0.03, 0).rotateX(Math.PI / 2)); // ruff collar
      add(upper, ...[-1, 1].map((s) => box(0.01 * k, B.th * 0.9, 0.01, mat('#e8c040', { metal: 0.7 }), s * B.tw * 0.38, torsoY, front + 0.006)), ...[0, 1, 2].map((i) => sph(0.012 * k, glow(['#3af0ff', '#ff4a8a', '#e8c040'][i]), 0, torsoY + B.th * (0.3 - i * 0.2), front + 0.012, 6, 4))); // gilt edges and gem buttons
      for (let i = 0; i < 3; i++) add(upper, limb(V(B.tw * 0.4, c.hipY + 0.02, 0), V(B.tw * (0.6 + i * 0.1), c.hipY * (0.5 - i * 0.1), (i - 1) * 0.08 * k), 0.006, mat(['#e8c040', '#3af0ff', '#ff4a8a'][i]))); // ribbons
      if (/death jester/i.test(L.name)) {
        if (!L.refined) add(head, sph(B.head * 0.85, BONE(), 0, 0, B.head * 0.35, 8, 6), ...[-1, 1].map((s) => sph(B.head * 0.2, mat('#111'), s * B.head * 0.3, B.head * 0.05, B.head * 1.08, 6, 4)));
        for (let i = 0; i < 6; i++) add(upper, box(0.015 * k, 0.07 * k, 0.015 * k, BONE(), (i - 2.5) * B.tw * 0.16, c.hipY - 0.02, back - 0.02)); // bone trophies
      }
      if (/shadowseer/i.test(L.name) && !L.refined) add(head, hood(B.head * 1.1, mat('#2a2a3a', { rough: 1, side: 'double' })), box(B.head * 1.1, B.head * 0.9, B.head * 0.06, mat('#d8e8f0', { metal: 0.9, rough: 0.05 }), 0, -B.head * 0.05, B.head * 1.02)); // hood and mirror mask
      if (L.leader) add(head, limb(V(0, B.head * 1.0, -B.head * 0.2), V(B.head * 0.3, B.head * 2.4, -B.head * 1.2), B.head * 0.2, mat(L.trim), B.head * 0.05));
    },

    vespids(c) {
      const { upper, fig, head, B, k, torsoY, front, back, L } = c;
      const shell = mat(L.main, { rough: 0.45 }), ridge = mat('#b84e10', { rough: 0.5 }), white = mat('#e8e2d4', { rough: 0.5 });
      // Domed chitin shoulder plates and ridged plates down the thorax, as on the official miniatures.
      for (const s of [-1, 1]) {
        const dome = mesh(new THREE.SphereGeometry(B.armR * 2.6, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), shell, s * (B.sx + 0.01), c.shY - 0.01, 0);
        dome.scale.set(1, 0.85, 1.1); dome.rotation.z = -s * 0.35;
        add(upper, dome, mesh(new THREE.TorusGeometry(B.armR * 2.2, 0.008 * k, 4, 12), ridge, s * (B.sx + 0.01), c.shY - 0.01, 0).rotateX(Math.PI / 2));
      }
      for (let i = 0; i < 3; i++) add(upper, box(B.tw * (0.85 - i * 0.15), 0.025 * k, 0.02, ridge, 0, torsoY + B.th * (0.25 - i * 0.22), front + 0.012));
      for (let i = 0; i < 3; i++) add(upper, aimY(cone(0.012 * k, 0.06 * k, ridge, 0, torsoY + B.th * (0.35 - i * 0.25), back - 0.01, 5), V(0, 0.4, -1)));
      for (let i = 0; i < 2; i++) add(upper, box(B.tw * (0.84 - i * 0.06), 0.014 * k, B.td * (0.92 - i * 0.04), mat('#7a3008', { rough: 0.5 }), 0, torsoY - B.th * (0.05 + i * 0.16), 0.004)); // dark joins between the thorax segments
      // T'au kit: a white armour plate on the left shoulder with a plain disc, and the communion helm at the back of the head.
      const plate = box(B.armR * 3, B.armR * 0.8, B.armR * 3.2, white, B.sx + 0.03, c.shY + B.armR * 1.5, 0); plate.rotation.z = -0.4;
      add(upper, plate, cyl(0.025 * k, 0.025 * k, 0.01, mat(L.main), B.sx + 0.05 + B.armR * 0.9, c.shY + B.armR * 1.3, 0, 10).rotateZ(Math.PI / 2));
      add(head, box(B.head * 0.45, B.head * 0.3, B.head * 0.4, white, 0, B.head * 0.4, -B.head * 0.85), sph(B.head * 0.1, glow('#3aff8a'), 0, B.head * 0.6, -B.head * 0.85, 6, 4));
      if (L.leader) add(upper, box(B.tw * 0.85, B.th * 0.4, 0.04 * k, white, 0, torsoY + B.th * 0.18, front + 0.03), mesh(new THREE.TorusGeometry(0.035 * k, 0.006, 4, 12, Math.PI), mat(L.main), 0, torsoY + B.th * 0.2, front + 0.06)); // Strain Leader's chest plate
      if (/shadestrain/i.test(L.name)) for (let i = 0; i < 3; i++) add(upper, box(B.tw * 0.9, 0.02 * k, B.td * 1.05, mat('#6a2a8a', { rough: 0.5 }), 0, torsoY - B.th * (0.1 + i * 0.12), 0)); // darker shadestrain banding
    },

    stealthSuits(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      for (const s of [-1, 1]) add(upper, box(0.07 * k, 0.07 * k, 0.1 * k, mat(L.trim), s * (B.sx + 0.06 * k), c.shY + 0.12 * k, -0.02), sph(0.02 * k, glow('#3af0ff'), s * (B.sx + 0.06 * k), c.shY + 0.12 * k, 0.04 * k, 6, 4)); // shoulder sensor pods
      add(upper, cyl(0.05 * k, 0.05 * k, 0.01, mat('#e8e0d0'), B.sx + 0.08 * k, c.shY - 0.02, 0, 12).rotateZ(Math.PI / 2)); // plain shoulder disc
      const tseam = mat('#4a4c52', { rough: 0.6 });
      add(upper, box(B.tw * 0.72, 0.008 * k, 0.01, tseam, 0, torsoY + B.th * 0.38, front + 0.036), box(0.008 * k, B.th * 0.5, 0.01, tseam, -B.tw * 0.36, torsoY + B.th * 0.12, front + 0.036), box(0.008 * k, B.th * 0.5, 0.01, tseam, B.tw * 0.36, torsoY + B.th * 0.12, front + 0.036)); // panel lines framing the chest plate
      add(upper, cyl(0.004, 0.004, 0.45 * k, METAL(), -B.tw * 0.3, torsoY + 0.35 * k, back - 0.08 * k, 4), sph(0.012, glow('#ff3a2a'), -B.tw * 0.3, torsoY + 0.58 * k, back - 0.08 * k, 4, 3)); // homing beacon aerial
      { const sh = mesh(new THREE.SphereGeometry(B.tw * 0.95, 12, 8), mat('#9adfff', { opacity: 0.12, rough: 0.1 }), 0, torsoY, 0); sh.castShadow = false; add(upper, sh); } // stealth field shimmer
      if (L.leader) add(head, box(B.head * 0.2, B.head * 0.8, B.head * 1.6, GOLD(), 0, B.head * 0.9, -B.head * 0.3));
      if (/designator/i.test(L.name)) add(upper, box(0.06 * k, 0.06 * k, 0.12 * k, DARK(), B.sx + 0.06 * k, c.shY + 0.22 * k, 0), sph(0.015 * k, glow('#ff3a2a'), B.sx + 0.06 * k, c.shY + 0.22 * k, 0.07 * k, 6, 4)); // markerlight
    },

    wolfScouts(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      for (let i = 0; i < 7; i++) { const a = (i / 6 - 0.5) * 1.6; add(upper, cone(0.008 * k, 0.04 * k, BONE(), Math.sin(a) * B.tw * 0.3, torsoY + B.th * 0.4 - Math.cos(a) * 0.04 * k, front + 0.012, 4).rotateX(Math.PI)); } // wolf-teeth necklace
      add(upper, cyl(0.035 * k, 0.035 * k, 0.012, glow('#6ac8ff'), B.tw * 0.3, torsoY + B.th * 0.05, front + 0.02, 8).rotateX(Math.PI / 2)); // runic charm
      add(upper, limb(V(-B.tw * 0.45, c.hipY + 0.03, 0), V(-B.tw * 0.55, c.hipY * 0.45, -0.05 * k), 0.03 * k, mat('#8a8c88', { rough: 1 }), 0.01 * k)); // wolf tail talisman
      belt(c, LEATHER(), BRASS(), 4);
      for (let i = 0; i < 9; i++) { const a = (i / 8 - 0.5) * 2.8; add(upper, cone(0.02 * k, 0.06 * k, mat(i % 2 ? '#8a8c88' : '#6e706c', { rough: 1 }), Math.sin(a) * B.tw * 0.62, c.shY - 0.04 * k, Math.cos(a) * B.td * 0.62, 4).rotateX(Math.PI)); } // fur fringe on the pelt mantle
      for (let i = 0; i < 3; i++) add(upper, limb(V(B.tw * (0.1 + i * 0.08), c.hipY + 0.03, front * 0.95), V(B.tw * (0.1 + i * 0.08), c.hipY - 0.05 * k, front), 0.003, LEATHER()), cone(0.008 * k, 0.03 * k, BONE(), B.tw * (0.1 + i * 0.08), c.hipY - 0.07 * k, front, 4).rotateX(Math.PI)); // fang charms on the belt
      if (L.leader && !L.refined) add(head, sph(B.head * 1.2, mat('#8a8c88', { rough: 1 }), 0, B.head * 0.4, -B.head * 0.2, 8, 6), box(B.head * 0.7, B.head * 0.5, B.head * 0.9, mat('#8a8c88', { rough: 1 }), 0, B.head * 0.6, B.head * 0.55), ...[-1, 1].map((s) => cone(B.head * 0.2, B.head * 0.5, mat('#8a8c88', { rough: 1 }), s * B.head * 0.55, B.head * 1.3, 0, 4))); // wolf-head pelt
      if (/skjald/i.test(L.name) && !L.refined) add(head, hood(B.head * 1.05, mat('#6d8aa3', { rough: 0.6, side: 'double' })), sph(B.head * 0.15, glow('#6ac8ff'), 0, B.head * 0.6, B.head * 1.0, 6, 4));
      if (/trapmaster/i.test(L.name)) for (let i = 0; i < 2; i++) add(upper, cyl(0.05 * k, 0.05 * k, 0.025 * k, mat('#3a3c30', { metal: 0.5 }), (i - 0.5) * 0.12 * k, torsoY - 0.05, back - 0.04 * k, 10).rotateX(Math.PI / 2)); // mines
    },

    inquisitorialAgents(c) {
      const { upper, head, B, k, torsoY, front, back, L } = c;
      // A plain gold seal on the chest.
      add(upper, cyl(0.045 * k, 0.045 * k, 0.012, GOLD(), -B.tw * 0.22, torsoY + B.th * 0.25, front + 0.02, 12).rotateX(Math.PI / 2), sph(0.015 * k, RED(), -B.tw * 0.22, torsoY + B.th * 0.25, front + 0.028, 8, 6));
      belt(c, mat('#2a2a2a'), GOLD(), 3);
      if (L.coat) { for (const s of [-1, 1]) add(upper, box(B.armR * 1.6, 0.014 * k, B.armR * 1.3, GOLD(), s * B.sx * 0.95, c.shY + B.armR * 0.95, 0), ...[0, 1, 2].map((i) => box(0.006, 0.03 * k, 0.006, GOLD(), s * B.sx * 0.95 + (i - 1) * 0.012 * k, c.shY + B.armR * 0.8, B.armR * 0.6))); // gilt epaulettes with fringes
        add(upper, cyl(B.head * 0.75, B.head * 0.85, B.head * 0.35, mat(L.main, { rough: 0.9 }), 0, c.shY + B.head * 0.1, 0.0, 16), cyl(B.head * 0.86, B.head * 0.86, 0.01 * k, GOLD(), 0, c.shY - B.head * 0.06, 0.0, 16)); } // high collar with a gilt edge
      if (/sister of silence/i.test(L.name) && !L.refined) add(head, sph(B.head * 1.15, GOLD(), 0, B.head * 0.15, 0, 10, 8), box(B.head * 0.9, B.head * 0.25, B.head * 0.1, mat('#111'), 0, 0, B.head * 1.1), limb(V(0, B.head * 1.2, 0), V(0, -B.head * 1.0, -B.head * 1.8), B.head * 0.25, mat('#a82a24'), B.head * 0.08)); // gold helm with a red plume
      if (/interrogator/i.test(L.name)) add(upper, mesh(new THREE.CylinderGeometry(B.tw * 0.55, B.tw * 0.85, B.th + c.hipY * 0.85, 10, 1, true, Math.PI * 0.6, Math.PI * 0.8), mat('#2a1a1a', { rough: 1, side: 'double' }), 0, c.hipY * 0.15 + (B.th + c.hipY * 0.85) / 2, back * 0.3));
      if (/mystic|hexorcist|enlightener/i.test(L.name)) add(head, sph(B.head * 0.15, glow(/mystic/i.test(L.name) ? '#d04aff' : '#ffd040'), 0, B.head * 0.45, B.head * 0.95, 6, 4));
      if (/penal/i.test(L.name)) add(head, mesh(new THREE.TorusGeometry(B.head * 1.0, B.head * 0.12, 4, 12), METAL(), 0, -B.head * 0.9, 0).rotateX(Math.PI / 2), sph(B.head * 0.12, glow('#ff3a2a'), B.head * 0.5, -B.head * 0.9, B.head * 0.8, 4, 3)); // explosive collar
      if (/questkeeper/i.test(L.name)) add(upper, box(0.12 * k, 0.15 * k, 0.05 * k, mat('#6a1e1e'), 0, torsoY, back - 0.05 * k));
    },
  };

  const mesh = (geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; return o; };
  /** A hood over a head of radius r. */
  function hood(r, m) {
    const o = mesh(new THREE.SphereGeometry(r * 1.16, 10, 8, Math.PI * 0.2, Math.PI * 1.6, 0, Math.PI * 0.6), m, 0, r * 0.12, -r * 0.08);
    o.rotation.y = Math.PI;
    return o;
  }

  // Weapon add-ons, per team.
  const W = {
    warpcoven(g, r, L) { if (L.body === 'marine' && (r.form === 'rifle' || r.form === 'heavy' || r.form === 'pistol')) for (let i = 0; i < 3; i++) add(g, cone(0.025 - i * 0.005, 0.1, glow(i ? '#4af0ff' : '#4ab8ff'), (i - 1) * 0.015, 0.03 + (i % 2) * 0.02, (r.form === 'pistol' ? 0.17 : r.form === 'heavy' ? 0.42 : 0.31) + i * 0.02, 5).rotateX(Math.PI / 2)); }, // warpflame at the muzzle
    vespids(g, r) { if (r.form !== 'pistol' && r.form !== 'bow') add(g, tz(cyl(0.04, 0.04, 0.14, mat('#e8e2d4', { rough: 0.5 }), 0, 0.03, 0.3, 12)), tz(cyl(0.032, 0.032, 0.02, mat('#2a2c30'), 0, 0.03, 0.38, 12)), tz(cyl(0.022, 0.022, 0.16, glow('#3aff8a'), 0, -0.035, 0.14, 8))); }, // neutron blaster: wide muzzle and a glowing green crystal chamber
    tauPathfinders(g, r) { if (r.form === 'rifle') add(g, box(0.035, 0.035, 0.08, DARK(), 0, 0.075, 0.12), sph(0.012, glow('#ff3a2a'), 0, 0.075, 0.165, 6, 4)); }, // markerlight
    deathKorps(g, r) { if ((r.form === 'rifle' || r.form === 'sniper') && /\blas|lascarbine|hot-shot/i.test(r.n)) { const z = r.form === 'sniper' ? 0.47 : 0.33; add(g, box(0.008, 0.018, 0.13, METAL(), 0, 0.012, z + 0.065), cone(0.009, 0.03, METAL(), 0, 0.012, z + 0.145, 4).rotateX(Math.PI / 2), box(0.02, 0.03, 0.02, DARK(), 0, 0.022, z)); } }, // bayonet under the muzzle
    farstalkers(g, r) {
      if (r.form !== 'rifle' && r.form !== 'sniper') return;
      const z = r.form === 'sniper' ? 0.56 : 0.42;
      // Kroot rifle blades: a long curved blade under the muzzle and a short one behind the stock.
      add(g, box(0.006, 0.03, 0.14, METAL(), 0, 0.0, z), cone(0.012, 0.05, METAL(), 0, 0.0, z + 0.09, 4).rotateX(Math.PI / 2), box(0.006, 0.025, 0.08, METAL(), 0, -0.03, -0.25), cone(0.01, 0.04, METAL(), 0, -0.03, -0.31, 4).rotateX(-Math.PI / 2));
    },
  };

  return { body: (c) => D[c.L.team]?.(c), weapon: (g, r, L) => W[L.team]?.(g, r, L) };
}
