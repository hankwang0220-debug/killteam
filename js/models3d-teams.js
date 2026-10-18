// Team-specific details for the 3D miniatures (see models3d.js): the parts that make each team look like itself
// (chest eagles, chapter badges, Nurgle smokestacks, Kroot harnesses, Death Korps rebreathers...), and weapon
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

  /** An eagle: two swept wings and a head, facing +Z, centred on (x, y, z). */
  const aquila = (p, x, y, z, s, m = GOLD()) => {
    for (const side of [-1, 1]) {
      const w = box(s * 0.55, s * 0.16, s * 0.05, m, x + side * s * 0.28, y + s * 0.04, z);
      w.rotation.z = side * 0.35;
      add(p, w, box(s * 0.35, s * 0.1, s * 0.05, m, x + side * s * 0.22, y - s * 0.1, z).rotateZ(side * 0.2));
    }
    add(p, sph(s * 0.09, m, x, y + s * 0.1, z + s * 0.02, 6, 4));
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

  const D = {
    angels(c) {
      const { upper, head, B, k, torsoY, front, L } = c;
      aquila(upper, 0, torsoY + B.th * 0.24, front + 0.035, 0.24 * k);
      padBadge(c, 1, mat('#e8e0d0', { rough: 0.5 })); // chapter badge (left)
      padBadge(c, -1, mat(L.trim, { metal: 0.6 }), 0.035); // squad marking (right)
      puritySeal(upper, -B.tw * 0.28, torsoY - B.th * 0.05, front + 0.012);
      belt(c, mat('#2a2c30', { metal: 0.5 }), GOLD());
      for (const s of [-1, 1]) add(upper, sph(0.03 * k, DARK(), s * B.tw * 0.36, c.hipY + 0.05 * k, front * 0.6, 6, 5)); // grenades
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
      if (/nob/i.test(L.name)) add(upper, cyl(0.008, 0.008, 0.9 * k, LEATHER(), B.tw * 0.35, torsoY + 0.3 * k, back - 0.08), ...[0, 1].map((i) => sph(0.045 * k, BONE(), B.tw * 0.35, torsoY + (0.62 + i * 0.12) * k, back - 0.08, 6, 5))); // trophy pole with skulls
    },

    tauPathfinders(c) {
      const { upper, head, B, k, torsoY, front, L } = c;
      add(upper, cyl(0.05 * k, 0.05 * k, 0.01, mat('#e8e0d0'), 0, torsoY + B.th * 0.18, front + 0.03, 14).rotateX(Math.PI / 2)); // sept symbol
      add(upper, mesh(new THREE.TorusGeometry(0.035 * k, 0.006, 4, 12, Math.PI), mat(L.main), 0, torsoY + B.th * 0.18, front + 0.04));
      belt(c, mat('#3a3a36'), mat(L.main), 3);
      add(upper, box(B.tw * 0.4, c.hipY * 0.45, 0.012, mat('#3a3a36', { rough: 1 }), 0, c.hipY * 0.75, front + 0.01), box(B.tw * 0.5, c.hipY * 0.45, 0.012, mat('#3a3a36', { rough: 1 }), 0, c.hipY * 0.75, c.back - 0.01)); // loincloth
      if (L.leader) add(head, cyl(0.004, 0.004, B.head * 2.5, METAL(), -B.head * 0.8, B.head * 1.3, -B.head * 0.3, 4)); // Shas'ui aerial
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
      // Nurgle's icon (three circles) on the left pad, rust patches, bells.
      const x = c.B.sx + 0.02 + c.B.armR * 2.3;
      for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + Math.PI / 2; add(upper, cyl(0.025 * k, 0.025 * k, 0.012, mat('#3a4a1e'), x, c.shY + c.B.armR * 0.55 + Math.sin(a) * 0.03 * k, Math.cos(a) * 0.03 * k, 10).rotateZ(Math.PI / 2)); }
      for (let i = 0; i < 4; i++) add(upper, box(0.06 * k, 0.04 * k, 0.01, mat('#7a4a2e', { rough: 1 }), ((i * 37) % 7 / 7 - 0.5) * B.tw * 0.8, torsoY + ((i * 53) % 5 / 5 - 0.3) * B.th, front + 0.012));
      belt(c, mat('#4a3a24'), BRASS(), 2);
      for (const s of [-1, 1]) add(upper, cone(0.03 * k, 0.05 * k, BRASS(), s * B.tw * 0.3, c.hipY - 0.01, front * 0.7, 8));
      // A few flies.
      for (let i = 0; i < 6; i++) { const a = i * 1.7; add(fig, sph(0.008, mat('#111'), Math.cos(a) * 0.25 * k, c.headY + 0.1 + (i % 3) * 0.06, Math.sin(a) * 0.25 * k, 4, 3)); }
      if (L.icon) add(upper, ...[0, 1, 2].map((i) => { const a = i * Math.PI * 2 / 3; return sph(0.04 * k, mat('#3a4a1e'), B.tw * 0.3 + 0.11 * k + Math.cos(a) * 0.05 * k, torsoY + 0.55 * k + Math.sin(a) * 0.05 * k, back - 0.105); }));
    },

    farstalkers(c) {
      const { upper, head, B, k, torsoY, front, L } = c;
      strap(c, LEATHER(), 1, 0.035); strap(c, LEATHER(), -1, 0.035);
      belt(c, LEATHER(), BONE(), 4);
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
      add(upper, box(0.05 * k, 0.08 * k, 0.03 * k, mat('#4a4636'), -B.tw * 0.4, c.hipY - 0.02, front * 0.4), box(0.05 * k, 0.05 * k, 0.03, METAL(), -B.tw * 0.4, c.hipY - 0.1, front * 0.4)); // entrenching tool
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
    tauPathfinders(g, r) { if (r.form === 'rifle') add(g, box(0.035, 0.035, 0.08, DARK(), 0, 0.075, 0.12), sph(0.012, glow('#ff3a2a'), 0, 0.075, 0.165, 6, 4)); }, // markerlight
    deathKorps(g, r) { if (r.form === 'rifle' || r.form === 'sniper') add(g, box(0.01, 0.02, 0.12, METAL(), 0, 0.0, r.form === 'sniper' ? 0.66 : 0.42), box(0.03, 0.03, 0.02, DARK(), 0, 0.01, r.form === 'sniper' ? 0.6 : 0.36)); }, // bayonet
    farstalkers(g, r) {
      if (r.form !== 'rifle' && r.form !== 'sniper') return;
      const z = r.form === 'sniper' ? 0.6 : 0.36;
      add(g, box(0.012, 0.07, 0.14, METAL(), 0, -0.02, z + 0.05), box(0.012, 0.06, 0.1, METAL(), 0, -0.04, -0.24), box(0.05, 0.02, 0.1, mat('#6a4a2a'), 0, -0.05, 0.1)); // Kroot rifle blades
    },
  };

  return { body: (c) => D[c.L.team]?.(c), weapon: (g, r, L) => W[L.team]?.(g, r, L) };
}
