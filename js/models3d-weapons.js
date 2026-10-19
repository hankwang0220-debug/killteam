// Weapon models for the 3D miniatures, shaped after the official weapon designs of each faction: Primaris bolt
// rifles with curved magazines, classic boltguns with sickle magazines, lasguns with heat-sink rings, plasma coils,
// twin-barrelled meltaguns, crude Ork shootas, smooth T'au pulse weapons, Aeldari disc-fed shuriken catapults,
// bladed Drukhari splinter rifles, Necron gauss rods, toothed chainswords, segmented power fists... No logos or
// emblems are modelled on any weapon.
//
// Ranged weapons: the grip is at the origin and the barrel points along +Z; `fore` is where a supporting hand goes.
// Melee weapons: the grip is at the origin and the blade points along +Y. Sizes are for a human (weapon scale 1).

export function createWeapons(h) {
  const { THREE, V, mat, glow, box, cyl, sph, cone, limb, add, tz, aimY, METAL, DARK, BRASS } = h;
  const Z = (o) => tz(o); // a cylinder laid along Z
  const tilt = (o, x = 0, y = 0, zr = 0) => { o.rotation.set(x, y, zr); return o; };
  const WOOD = () => mat('#6a4428', { rough: 0.8 });
  const GUN = () => mat('#363940', { metal: 0.6, rough: 0.4 });
  const STEEL = () => mat('#a8adb4', { metal: 0.85, rough: 0.3 });
  const RUST = () => mat('#7a4a2e', { metal: 0.4, rough: 0.7 });
  const EDGE = () => mat("#8d939c", { metal: 0.5, rough: 0.3 });
  // A box with thin bright piping where its top face meets the sides and front, so the outline of each casing reads (as on the power fist).
  function rim(w, h, d, m, x, y, z, e = EDGE()) {
    const r = Math.min(w, h, d) * 0.28, yt = y + h / 2 - 0.0005;
    return [box(w, h, d, m, x, y, z), ...[-1, 1].map((s) => box(0.004, 0.004, Math.max(0.01, d - 2 * r), e, x + s * (w / 2 - r * 0.7), yt, z)), box(Math.max(0.01, w - 2 * r), 0.004, 0.004, e, x, yt, z + d / 2 - r * 0.7)];
  }

  /** Which family of weapon this is, from its name and the wielder's faction. */
  function family(r, L) {
    const n = r.n.toLowerCase(), team = L.team, body = L.body;
    if (body === 'ork') return 'ork';
    if (body === 'necron' || /gauss|tesla|synaptic|staff of light|transdimensional/.test(n)) return 'necron';
    if (['tauPathfinders', 'stealthSuits', 'vespids'].includes(team) || /pulse|rail rifle|ion rifle|burst cannon|fusion blaster|neutron/.test(n) && team !== 'hearthkyn' && team !== 'hernkynYaegirs') return 'tau';
    if (team === 'farstalkers' || /kroot|londaxi|pulse pistol/.test(n) && team === 'farstalkers') return 'kroot';
    if (team === 'handOfArchon' || /splinter|shardcarbine|blaster|dark lance|shredder|stinger|razorwing/.test(n) && body === 'eldar' && team !== 'corsairVoidscarred') return 'drukhari';
    if (body === 'eldar' || /shuriken|fusion pistol|neuro disruptor|death spinner/.test(n)) return 'aeldari';
    if (team === 'hearthkyn' || team === 'hernkynYaegirs' || /autoch|ion blaster|etacarn|magna-coil|hylas|bolt revolver/.test(n)) return 'votann';
    return 'imperial';
  }

  // ---------- ranged ----------
  function grip(g, m = GUN(), z = -0.005) { add(g, tilt(box(0.028, 0.075, 0.038, m, 0, -0.04, z), 0.28)); }
  function trigger(g) { add(g, box(0.006, 0.02, 0.025, DARK(), 0, -0.012, 0.025)); }

  function bolter(g, L, kind) {
    const casing = mat(L.weaponColor || '#3e424a', { metal: 0.55, rough: 0.42 });
    if (kind === 'pistol') {
      add(g, ...rim(0.038, 0.05, 0.15, casing, 0, 0.02, 0.05), box(0.032, 0.03, 0.06, DARK(), 0, -0.012, 0.02), Z(cyl(0.012, 0.012, 0.03, DARK(), 0, 0.022, 0.135)),
        box(0.04, 0.04, 0.03, casing, 0, 0.022, 0.13), box(0.008, 0.012, 0.02, DARK(), 0, 0.05, 0.1));
      add(g, ...[0, 1, 2, 3].map((i) => box(0.04, 0.03, 0.004, EDGE(), 0, 0.02, -0.016 + i * 0.01)), Z(cyl(0.014, 0.014, 0.004, EDGE(), 0, 0.022, 0.15))); // slide grips, muzzle rim
      grip(g, casing); trigger(g);
      return null;
    }
    if (kind === 'heavy') {
      add(g, ...rim(0.09, 0.1, 0.26, casing, 0, 0.03, 0.08), Z(cyl(0.028, 0.03, 0.16, DARK(), 0, 0.04, 0.28)), box(0.06, 0.06, 0.05, casing, 0, 0.04, 0.37),
        ...[-1, 1].map((s) => Z(cyl(0.006, 0.006, 0.05, DARK(), s * 0.018, 0.04, 0.4))), ...rim(0.07, 0.1, 0.09, mat('#4a4636'), 0.08, -0.02, 0.06),
        limb(V(0.05, 0.02, 0.06), V(0.03, 0.06, 0.12), 0.012, BRASS()), box(0.012, 0.012, 0.16, DARK(), 0, 0.1, 0.07), limb(V(0, 0.1, -0.01), V(0, 0.085, -0.02), 0.008, DARK()),
        ...[-1, 1].map((s) => tilt(box(0.02, 0.07, 0.03, DARK(), s * 0.035, -0.04, -0.05), 0.3)));
      return V(0, -0.04, 0.18);
    }
    // Primaris bolt rifle (long receiver, curved magazine ahead of the trigger, shrouded barrel, top rail) or a
    // classic boltgun (shorter, with a sickle magazine and a flared muzzle).
    const primaris = L.body === 'marine' && !L.chaos && !L.scout || /bolt rifle|bolt carbine|stalker/.test(kind);
    if (primaris) {
      add(g, ...rim(0.05, 0.075, 0.27, casing, 0, 0.02, 0.05), box(0.02, 0.016, 0.2, DARK(), 0, 0.064, 0.05), ...rim(0.042, 0.048, 0.12, casing, 0, 0.015, 0.24),
        Z(cyl(0.014, 0.014, 0.08, DARK(), 0, 0.02, 0.33)), Z(cyl(0.02, 0.02, 0.03, DARK(), 0, 0.02, 0.37)), tilt(box(0.034, 0.1, 0.05, DARK(), 0, -0.07, 0.1), -0.3),
        ...rim(0.034, 0.06, 0.12, casing, 0, -0.005, -0.15), box(0.04, 0.085, 0.022, DARK(), 0, -0.01, -0.215));
      add(g, box(0.004, 0.022, 0.06, DARK(), -0.026, 0.03, 0.07), // ejection port on the right side
        ...[0, 1, 2, 3, 4, 5].map((i) => box(0.024, 0.005, 0.012, EDGE(), 0, 0.074, -0.03 + i * 0.032)), // teeth along the top rail
        ...[0, 1].map((i) => Z(cyl(0.021, 0.021, 0.005, EDGE(), 0, 0.02, 0.357 + i * 0.026))), tilt(box(0.038, 0.008, 0.054, EDGE(), 0, -0.118, 0.115), -0.3)); // muzzle rims, magazine base plate
    } else {
      add(g, ...rim(0.052, 0.07, 0.2, casing, 0, 0.02, 0.04), ...rim(0.04, 0.04, 0.1, casing, 0, 0.02, 0.19), box(0.05, 0.05, 0.04, DARK(), 0, 0.02, 0.26),
        ...[-1, 1].map((s) => Z(cyl(0.005, 0.005, 0.045, DARK(), s * 0.014, 0.02, 0.285))), tilt(box(0.032, 0.08, 0.04, DARK(), 0, -0.06, 0.09), -0.5), tilt(box(0.032, 0.05, 0.035, DARK(), 0, -0.11, 0.115), -0.9),
        box(0.008, 0.02, 0.015, DARK(), 0, 0.06, 0.2), ...rim(0.032, 0.055, 0.12, casing, 0, -0.005, -0.12));
      add(g, box(0.004, 0.022, 0.05, DARK(), -0.027, 0.03, 0.06), tilt(box(0.036, 0.008, 0.04, EDGE(), 0, -0.126, 0.135), -0.9), // ejection port, magazine base plate
        ...[-1, 1].map((s) => box(0.004, 0.044, 0.044, EDGE(), s * 0.026, 0.02, 0.26))); // bright edges on the muzzle brake
      if (L.chaos) add(g, ...[0, 1].map((i) => cone(0.008, 0.03, BRASS(), 0, 0.06, 0.02 + i * 0.06, 5))); // spiked
    }
    grip(g, casing); trigger(g);
    return V(0, -0.025, 0.2);
  }

  function lasgun(g, L, kind) {
    const wood = /krieg|deathKorps/.test(L.team) || L.team === 'blooded' || L.team === 'broodBrothers' ? WOOD() : GUN();
    const hot = /hot-shot|hellgun|volley/.test(kind);
    if (/pistol/.test(kind)) {
      add(g, ...rim(0.03, 0.04, 0.12, GUN(), 0, 0.018, 0.04), Z(cyl(0.008, 0.008, 0.08, DARK(), 0, 0.022, 0.13)), ...[0, 1].map((i) => Z(cyl(0.012, 0.012, 0.008, METAL(), 0, 0.022, 0.12 + i * 0.03))));
      grip(g); trigger(g);
      return null;
    }
    const long = /long|sniper|marksman/.test(kind);
    add(g, ...rim(0.034, 0.06, 0.2, GUN(), 0, 0.02, 0.05), box(0.03, 0.05, 0.06, hot ? mat('#3a3f36') : GUN(), 0, -0.035, 0.1), // receiver and power pack
      Z(cyl(0.009, 0.009, long ? 0.36 : 0.22, DARK(), 0, 0.03, long ? 0.33 : 0.26)), ...[0, 1, 2, 3].map((i) => Z(cyl(0.015, 0.015, 0.01, METAL(), 0, 0.03, 0.17 + i * 0.03))), // barrel with heat-sink rings
      box(0.006, 0.018, 0.01, DARK(), 0, 0.045, long ? 0.48 : 0.34), ...rim(0.03, 0.05, 0.12, wood, 0, -0.005, -0.12), box(0.026, 0.035, 0.08, wood, 0, -0.01, 0.17));
    if (long) add(g, Z(cyl(0.016, 0.016, 0.13, DARK(), 0, 0.075, 0.05)), Z(cyl(0.018, 0.018, 0.008, glow('#3ae0ff'), 0, 0.075, 0.12)));
    if (hot) add(g, Z(cyl(0.008, 0.008, 0.06, mat('#1e1e1e'), 0, -0.06, 0.06)));
    add(g, Z(cyl(0.012, 0.011, 0.02, EDGE(), 0, 0.03, long ? 0.505 : 0.365)), box(0.034, 0.006, 0.064, EDGE(), 0, -0.063, 0.1)); // flash suppressor, power pack edge
    if (/volley/.test(kind)) add(g, ...[-1, 1].map((s) => Z(cyl(0.008, 0.008, 0.2, DARK(), s * 0.018, 0.03, 0.26))));
    grip(g); trigger(g);
    return V(0, -0.025, 0.18);
  }

  function autogun(g, L, kind) {
    if (/pistol|revolver/.test(kind)) {
      add(g, ...rim(0.03, 0.045, 0.11, GUN(), 0, 0.018, 0.04), Z(cyl(0.01, 0.01, 0.05, DARK(), 0, 0.022, 0.11)));
      if (/revolver/.test(kind)) add(g, Z(cyl(0.022, 0.022, 0.03, METAL(), 0, 0.01, 0.03)));
      grip(g, WOOD()); trigger(g);
      return null;
    }
    if (/shotgun|scattergun/.test(kind)) {
      add(g, ...rim(0.04, 0.055, 0.17, GUN(), 0, 0.02, 0.03), ...[-1, 1].map((s) => Z(cyl(0.012, 0.012, 0.2, DARK(), s * 0.013, 0.03, 0.2))), Z(cyl(0.02, 0.02, 0.08, WOOD(), 0, -0.01, 0.17)),
        box(0.032, 0.05, 0.13, WOOD(), 0, -0.01, -0.12));
      grip(g, WOOD()); trigger(g);
      return V(0, -0.015, 0.17);
    }
    add(g, ...rim(0.035, 0.06, 0.18, GUN(), 0, 0.02, 0.04), Z(cyl(0.01, 0.01, 0.16, DARK(), 0, 0.03, 0.22)), tilt(box(0.028, 0.09, 0.035, DARK(), 0, -0.06, 0.08), -0.35),
      box(0.03, 0.05, 0.12, WOOD(), 0, -0.005, -0.12), box(0.03, 0.035, 0.08, WOOD(), 0, -0.005, 0.15));
    add(g, Z(cyl(0.013, 0.013, 0.012, EDGE(), 0, 0.03, 0.3)), tilt(box(0.032, 0.007, 0.04, EDGE(), 0, -0.102, 0.095), -0.35), box(0.004, 0.02, 0.05, DARK(), -0.019, 0.03, 0.06)); // muzzle, magazine base plate, ejection port
    grip(g, WOOD()); trigger(g);
    return V(0, -0.02, 0.16);
  }

  function plasma(g, L, kind, faction) {
    const casing = faction === 'votann' ? mat('#4a4a4e', { metal: 0.6 }) : mat(L.weaponColor || '#3e424a', { metal: 0.55, rough: 0.42 });
    const coil = glow('#4ab8ff');
    if (/pistol/.test(kind)) {
      add(g, ...rim(0.036, 0.05, 0.1, casing, 0, 0.02, 0.02), Z(cyl(0.026, 0.026, 0.07, casing, 0, 0.025, 0.1)), ...[0, 1, 2].map((i) => Z(cyl(0.028, 0.028, 0.006, coil, 0, 0.025, 0.075 + i * 0.022))),
        Z(cyl(0.014, 0.018, 0.04, DARK(), 0, 0.025, 0.15)), sph(0.008, coil, 0, 0.025, 0.172, 8, 6));
      grip(g, casing); trigger(g);
      return null;
    }
    const heavy = /cannon|incinerator|caliver/.test(kind);
    const s = heavy ? 1.3 : 1;
    add(g, ...rim(0.045 * s, 0.065 * s, 0.16, casing, 0, 0.02, -0.02), Z(cyl(0.036 * s, 0.036 * s, 0.14, casing, 0, 0.025, 0.13)), ...[0, 1, 2, 3].map((i) => Z(cyl(0.038 * s, 0.038 * s, 0.008, coil, 0, 0.025, 0.08 + i * 0.03))),
      ...[0, 1, 2, 3, 4, 5].map((i) => { const a = i * Math.PI / 3; return box(0.006, 0.02 * s, 0.07, casing, Math.cos(a) * 0.03 * s, 0.025 + Math.sin(a) * 0.03 * s, 0.25); }), // cooling fins
      Z(cyl(0.022 * s, 0.026 * s, 0.06, DARK(), 0, 0.025, 0.28)), sph(0.012 * s, coil, 0, 0.025, 0.31, 8, 6), ...rim(0.032, 0.05, 0.11, casing, 0, -0.005, -0.15), tilt(box(0.03, 0.06, 0.03, casing, 0, -0.04, 0.12), 0.2));
    grip(g, casing); trigger(g);
    return V(0, -0.02, 0.13);
  }

  function melta(g, L, kind, faction) {
    const casing = faction === 'tau' ? mat('#d8d0c0', { rough: 0.5 }) : faction === 'aeldari' ? mat(L.trim, { metal: 0.3, rough: 0.4 }) : mat(L.weaponColor || '#3e424a', { metal: 0.55, rough: 0.42 });
    const heat = glow('#ff7a1a');
    if (/pistol/.test(kind)) {
      add(g, ...rim(0.036, 0.05, 0.1, casing, 0, 0.02, 0.02), Z(cyl(0.024, 0.02, 0.09, casing, 0, 0.028, 0.11)), Z(cyl(0.016, 0.016, 0.006, heat, 0, 0.028, 0.158)));
      grip(g, casing); trigger(g);
      return null;
    }
    const multi = /multi|heavy/.test(kind);
    const s = multi ? 1.35 : 1;
    add(g, ...rim(0.05 * s, 0.06 * s, 0.14, casing, 0, 0.02, 0.0), Z(cyl(0.03 * s, 0.03 * s, 0.1, mat('#5a4a3a', { metal: 0.4 }), 0, -0.03, 0.08)), // fuel canister
      ...[-1, 1].map((x) => Z(cyl(0.022 * s, 0.024 * s, 0.24, casing, x * 0.022 * s, 0.035, 0.2))), ...[-1, 1].map((x) => Z(cyl(0.016 * s, 0.016 * s, 0.006, heat, x * 0.022 * s, 0.035, 0.322))),
      ...[0, 1, 2].map((i) => Z(cyl(0.05 * s, 0.05 * s, 0.006, DARK(), 0, 0.035, 0.24 + i * 0.025))), box(0.03, 0.05, 0.1, casing, 0, -0.005, -0.12));
    grip(g, casing); trigger(g);
    return V(0, -0.04, 0.12);
  }

  function flamer(g, L, kind) {
    const casing = mat(L.weaponColor || '#3e424a', { metal: 0.55, rough: 0.42 }), tank = mat('#9a2a20', { metal: 0.4, rough: 0.5 }), pilot = glow('#ff8a1a');
    if (/hand|pistol/.test(kind)) {
      add(g, ...rim(0.034, 0.045, 0.1, casing, 0, 0.02, 0.02), Z(cyl(0.02, 0.02, 0.06, tank, 0, -0.012, 0.06)), Z(cyl(0.01, 0.018, 0.06, DARK(), 0, 0.03, 0.12)), sph(0.008, pilot, 0, 0.012, 0.15, 6, 4));
      grip(g, casing); trigger(g);
      return null;
    }
    const heavy = /heavy|burna|spewer|incinerat/.test(kind);
    const s = heavy ? 1.25 : 1;
    add(g, ...rim(0.042 * s, 0.055 * s, 0.22, casing, 0, 0.025, 0.05), Z(cyl(0.032 * s, 0.032 * s, 0.13, tank, 0, -0.04, 0.07)), Z(cyl(0.034 * s, 0.034 * s, 0.01, BRASS(), 0, -0.04, 0.0)),
      Z(cyl(0.012 * s, 0.014 * s, 0.1, DARK(), 0, 0.035, 0.2)), tilt(cone(0.026 * s, 0.05, DARK(), 0, 0.035, 0.27), -Math.PI / 2), limb(V(0, -0.04, 0.13), V(0, 0.02, 0.17), 0.008, DARK()),
      sph(0.01 * s, pilot, 0, 0.012, 0.28, 8, 6), box(0.028, 0.045, 0.09, casing, 0, -0.005, -0.1));
    grip(g, casing); trigger(g);
    return V(0, -0.02, 0.15);
  }

  function launcher(g, L, kind) {
    const casing = mat(L.weaponColor || '#3a3c34', { metal: 0.45, rough: 0.5 });
    if (/grenade launcher|apm|frag cannon|mortar/.test(kind)) {
      add(g, ...rim(0.04, 0.06, 0.16, casing, 0, 0.02, 0.0), Z(cyl(0.05, 0.05, 0.06, casing, 0, -0.01, 0.06)), ...[0, 1, 2, 3, 4, 5].map((i) => { const a = i * Math.PI / 3; return Z(cyl(0.012, 0.012, 0.062, DARK(), Math.cos(a) * 0.03, -0.01 + Math.sin(a) * 0.03, 0.06)); }),
        Z(cyl(0.026, 0.026, 0.16, DARK(), 0, 0.03, 0.18)), box(0.03, 0.05, 0.1, casing, 0, -0.005, -0.12));
      grip(g, casing); trigger(g);
      return V(0, -0.02, 0.16);
    }
    // Shoulder-fired tube above the grip: a missile launcher, or an Ork rokkit with its warhead showing.
    add(g, Z(cyl(0.045, 0.045, 0.55, casing, 0, 0.07, 0.05, 16)), Z(cyl(0.05, 0.05, 0.04, DARK(), 0, 0.07, 0.33)), Z(cyl(0.05, 0.05, 0.04, DARK(), 0, 0.07, -0.22)),
      box(0.03, 0.08, 0.04, DARK(), 0, 0, 0), box(0.025, 0.05, 0.07, DARK(), -0.055, 0.1, 0.05), Z(cyl(0.012, 0.012, 0.01, glow('#3ae0ff'), -0.055, 0.1, 0.09)),
      Z(cone(0.035, 0.09, mat('#a8302a'), 0, 0.07, 0.38)));
    return V(0, 0.0, 0.18);
  }

  function sniper(g, L, kind) {
    const casing = mat(L.weaponColor || '#3e424a', { metal: 0.55, rough: 0.42 });
    add(g, ...rim(0.04, 0.065, 0.32, casing, 0, 0.02, 0.08), Z(cyl(0.011, 0.011, 0.34, DARK(), 0, 0.03, 0.42)), Z(cyl(0.018, 0.018, 0.04, DARK(), 0, 0.03, 0.6)),
      Z(cyl(0.02, 0.022, 0.16, DARK(), 0, 0.085, 0.07)), Z(cyl(0.022, 0.022, 0.008, glow('#3ae0ff'), 0, 0.085, 0.15)), box(0.01, 0.03, 0.02, DARK(), 0, 0.06, 0.03), box(0.01, 0.03, 0.02, DARK(), 0, 0.06, 0.11),
      ...rim(0.03, 0.07, 0.16, casing, 0, -0.012, -0.17), box(0.032, 0.02, 0.08, casing, 0, 0.035, -0.12), tilt(box(0.03, 0.07, 0.035, DARK(), 0, -0.05, 0.12), -0.25),
      limb(V(0, 0, 0.3), V(0.04, -0.09, 0.34), 0.005, DARK()), limb(V(0, 0, 0.3), V(-0.04, -0.09, 0.34), 0.005, DARK()));
    grip(g, casing); trigger(g);
    return V(0, -0.02, 0.24);
  }

  function tau(g, L, r) {
    const n = r.n.toLowerCase(), shell = mat('#d8d0c0', { rough: 0.45 }), dark = mat('#2e3038', { metal: 0.4, rough: 0.4 }), emit = glow('#3ae0ff');
    if (/pistol|neutron sting/.test(n) || r.form === 'pistol') {
      add(g, box(0.032, 0.045, 0.12, shell, 0, 0.02, 0.04), box(0.02, 0.02, 0.1, dark, 0, 0.02, 0.05), sph(0.008, emit, 0, 0.02, 0.105, 6, 4));
      grip(g, dark); trigger(g);
      return null;
    }
    if (/burst cannon/.test(n)) {
      add(g, box(0.08, 0.08, 0.2, shell, 0, 0.03, 0.06), ...[0, 1, 2, 3, 4, 5].map((i) => { const a = i * Math.PI / 3; return Z(cyl(0.008, 0.008, 0.18, dark, Math.cos(a) * 0.022, 0.03 + Math.sin(a) * 0.022, 0.22)); }),
        Z(cyl(0.035, 0.035, 0.02, shell, 0, 0.03, 0.26)), Z(cyl(0.035, 0.035, 0.02, shell, 0, 0.03, 0.18)));
      return V(0, -0.03, 0.12);
    }
    if (/rail/.test(n)) { // two long rails with a glowing gap
      add(g, box(0.04, 0.06, 0.2, shell, 0, 0.02, 0.02), ...[-1, 1].map((s) => box(0.01, 0.03, 0.42, dark, s * 0.012, 0.03, 0.33)), box(0.012, 0.01, 0.4, emit, 0, 0.03, 0.33),
        Z(cyl(0.018, 0.018, 0.12, dark, 0, 0.085, 0.05)), box(0.03, 0.06, 0.14, shell, 0, -0.005, -0.14));
      grip(g, dark); trigger(g);
      return V(0, -0.02, 0.22);
    }
    if (/ion/.test(n)) {
      add(g, box(0.05, 0.07, 0.24, shell, 0, 0.025, 0.06), ...[0, 1, 2].map((i) => box(0.052, 0.012, 0.03, emit, 0, 0.045, 0.02 + i * 0.05)), Z(cyl(0.02, 0.024, 0.12, dark, 0, 0.03, 0.24)), box(0.03, 0.06, 0.12, shell, 0, -0.005, -0.13));
      grip(g, dark); trigger(g);
      return V(0, -0.02, 0.17);
    }
    if (/fusion/.test(n)) return melta(g, L, n, 'tau');
    // Pulse carbine / rifle / neutron blaster: a smooth casing tapering forward, a dark barrel slot and a blue emitter.
    const carbine = /carbine/.test(n);
    const len = carbine ? 0.28 : 0.36;
    add(g, tilt(box(0.045, 0.07, len, shell, 0, 0.025, 0.02 + len / 2 - 0.08), 0.03), box(0.026, 0.03, len * 0.9, dark, 0, 0.03, len / 2 - 0.02), Z(cyl(0.012, 0.012, 0.03, dark, 0, 0.03, len - 0.04)),
      sph(0.01, emit, 0, 0.03, len - 0.02, 8, 6), box(0.034, 0.055, 0.12, shell, 0, -0.005, -0.115));
    if (carbine) add(g, Z(cyl(0.016, 0.016, 0.1, dark, 0, -0.03, 0.12))); // underslung grenade launcher
    grip(g, dark); trigger(g);
    return V(0, -0.025, len * 0.6);
  }

  function aeldari(g, L, r) {
    const n = r.n.toLowerCase(), shell = mat(L.trim, { metal: 0.3, rough: 0.35 }), body = mat(L.main, { metal: 0.25, rough: 0.4 }), gem = glow('#4af0ff');
    if (/fusion/.test(n)) return melta(g, L, n, 'aeldari');
    if (r.form === 'pistol' || /pistol|disruptor/.test(n)) {
      const s1 = sph(0.04, body, 0, 0.022, 0.04, 14, 10); s1.scale.set(0.7, 0.8, 1.6);
      add(g, s1, box(0.012, 0.012, 0.08, DARK(), 0, 0.028, 0.1), Z(cyl(0.022, 0.022, 0.008, shell, 0, 0.055, 0.03)));
      grip(g, body); trigger(g);
      return null;
    }
    // Shuriken catapult: a sleek curved body, a disc magazine on top, a slot muzzle and a spirit-gem.
    const heavy = r.form === 'heavy';
    const s = heavy ? 1.4 : 1;
    const hull = sph(0.06 * s, body, 0, 0.025, 0.1, 18, 12); hull.scale.set(0.55, 0.65, 2.6);
    add(g, hull, Z(cyl(0.045 * s, 0.045 * s, 0.012, shell, 0, 0.075 * s, 0.06)), box(0.012, 0.012, 0.06, DARK(), 0, 0.03, 0.27 * s), box(0.008, 0.06, 0.03, shell, 0, -0.01, 0.2),
      sph(0.01, gem, 0, 0.05, 0.16, 8, 6), tilt(box(0.026, 0.05, 0.11, body, 0, -0.005, -0.1), -0.08));
    grip(g, body); trigger(g);
    return V(0, -0.02, 0.17);
  }

  function drukhari(g, L, r) {
    const n = r.n.toLowerCase(), hull = mat('#22262c', { metal: 0.45, rough: 0.35 }), vial = glow('#7fe03a'), blade = STEEL();
    if (r.form === 'pistol' || /pistol/.test(n)) {
      add(g, box(0.028, 0.04, 0.13, hull, 0, 0.02, 0.05), Z(cyl(0.012, 0.012, 0.04, vial, 0, 0.045, 0.03)), cone(0.01, 0.06, blade, 0, 0.0, 0.14, 4).rotateX(Math.PI / 2));
      grip(g, hull); trigger(g);
      return null;
    }
    const lance = /lance|blaster/.test(n);
    // Splinter rifle: a long thin hull, a crystal vial, blades along the barrel and a blade bayonet.
    add(g, box(0.03, 0.05, 0.36, hull, 0, 0.02, 0.1), Z(cyl(0.007, 0.007, 0.2, DARK(), 0, 0.03, 0.37)), Z(cyl(0.014, 0.014, 0.05, lance ? glow('#b06aff') : vial, 0, 0.06, 0.04)),
      ...[0, 1, 2].map((i) => aimY(box(0.006, 0.05, 0.02, blade, 0, -0.025, 0.12 + i * 0.07), V(0, -1, -0.6))), cone(0.012, 0.1, blade, 0, 0.0, 0.5, 4).rotateX(Math.PI / 2),
      tilt(box(0.024, 0.06, 0.15, hull, 0, -0.01, -0.13), -0.15));
    grip(g, hull); trigger(g);
    return V(0, -0.02, 0.2);
  }

  function necron(g, L, r) {
    const n = r.n.toLowerCase(), frame = mat('#8f979f', { metal: 0.85, rough: 0.3 }), core = glow(L.eye || '#3aff6a');
    if (/staff/.test(n)) return null; // staffs of light are drawn as the melee staff
    const long = /synaptic|disintegrator/.test(n), tesla = /tesla/.test(n);
    const len = long ? 0.5 : 0.36;
    // Gauss / tesla weapon: an open skeletal frame of rods around a glowing core, with a sling-like stock bar.
    add(g, ...[-1, 1].map((s) => box(0.01, 0.014, len, frame, s * 0.02, 0.04, len / 2 - 0.04)), box(0.034, 0.012, len * 0.9, frame, 0, 0.0, len / 2 - 0.05),
      Z(cyl(0.008, 0.008, len * 0.8, core, 0, 0.025, len / 2 - 0.02)), box(0.03, 0.05, 0.06, frame, 0, 0.02, len - 0.04), limb(V(0, 0.0, -0.02), V(0, -0.02, -0.17), 0.008, frame), box(0.02, 0.05, 0.02, frame, 0, -0.03, -0.17));
    if (tesla) add(g, sph(0.03, glow('#7ad8ff'), 0, 0.03, len - 0.02, 12, 8));
    if (long) add(g, Z(cyl(0.016, 0.016, 0.1, frame, 0, 0.075, 0.08)));
    grip(g, frame); trigger(g);
    return V(0, -0.02, len * 0.55);
  }

  function ork(g, L, r) {
    const n = r.n.toLowerCase(), plate = RUST(), iron = GUN(), boom = glow('#ff8a1a');
    const rivets = (z0, y, k) => [...Array(k)].map((_, i) => sph(0.006, BRASS(), 0.03, y, z0 + i * 0.04, 6, 4));
    if (/rokkit launcha|rokkit rack|pulsa/.test(n)) return launcher(g, L, n);
    if (/burna/.test(n)) return flamer(g, L, 'burna');
    if (r.form === 'pistol' || /slugga|pistol/.test(n)) {
      add(g, box(0.042, 0.055, 0.12, plate, 0, 0.02, 0.04), Z(cyl(0.017, 0.017, 0.07, iron, 0, 0.025, 0.12)), box(0.03, 0.04, 0.05, iron, 0, -0.015, 0.03), ...rivets(0.0, 0.035, 3));
      grip(g, WOOD()); trigger(g);
      return null;
    }
    const big = r.form === 'heavy' || /big shoota|dakka|snipa|kannon/.test(n);
    const s = big ? 1.25 : 1;
    // Shoota: a crude riveted box with mismatched plates, twin or rotary barrels and a drum or box magazine.
    add(g, box(0.06 * s, 0.075 * s, 0.22, plate, 0, 0.025, 0.04), box(0.065 * s, 0.03, 0.08, iron, 0.005, 0.05, -0.01), ...rivets(-0.04, 0.055 * s, 4),
      ...(big ? [0, 1, 2, 3].map((i) => { const a = i * Math.PI / 2; return Z(cyl(0.012, 0.012, 0.2, iron, Math.cos(a) * 0.022, 0.03 + Math.sin(a) * 0.022, 0.24)); }) : [-1, 1].map((x) => Z(cyl(0.014, 0.014, 0.16, iron, x * 0.017, 0.03, 0.22)))),
      big ? Z(cyl(0.05, 0.05, 0.05, iron, 0.06, -0.03, 0.05)) : box(0.034, 0.1, 0.05, iron, 0, -0.07, 0.08), box(0.03, 0.05, 0.1, WOOD(), 0, -0.01, -0.12), box(0.008, 0.02, 0.01, BRASS(), 0, 0.075 * s, 0.13));
    if (/snipa|scoped/.test(n)) add(g, Z(cyl(0.02, 0.02, 0.14, iron, 0, 0.1, 0.04)), Z(cyl(0.02, 0.02, 0.006, boom, 0, 0.1, 0.11)));
    grip(g, WOOD()); trigger(g);
    return V(0, -0.03, 0.17);
  }

  function votann(g, L, r) {
    const n = r.n.toLowerCase(), shell = mat('#5a5e64', { metal: 0.6, rough: 0.35 }), accent = mat(L.main, { metal: 0.4, rough: 0.45 }), ion = glow('#4af0ff');
    if (/etacarn|plasma/.test(n)) return plasma(g, L, n, 'votann');
    if (r.form === 'pistol' || /pistol|revolver/.test(n)) {
      add(g, box(0.042, 0.055, 0.12, shell, 0, 0.022, 0.04), Z(cyl(0.02, 0.02, 0.05, shell, 0, 0.025, 0.12)), box(0.044, 0.02, 0.06, accent, 0, 0.05, 0.03));
      grip(g, shell); trigger(g);
      return null;
    }
    // Autoch-pattern weapons: chunky rounded receivers, short shrouded barrels, coloured panels, ion cells glowing blue.
    const heavy = r.form === 'heavy';
    const s = heavy ? 1.3 : 1;
    add(g, box(0.06 * s, 0.08 * s, 0.24, shell, 0, 0.025, 0.05), box(0.062 * s, 0.03, 0.14, accent, 0, 0.055 * s, 0.05), Z(cyl(0.026 * s, 0.026 * s, 0.1, shell, 0, 0.025, 0.22)),
      Z(cyl(0.016 * s, 0.016 * s, 0.04, DARK(), 0, 0.025, 0.29)), box(0.04, 0.09, 0.05, DARK(), 0, -0.06, 0.08), box(0.034, 0.06, 0.1, shell, 0, -0.005, -0.12));
    if (/ion|magna|hylas/.test(n)) add(g, ...[0, 1].map((i) => box(0.064 * s, 0.014, 0.025, ion, 0, 0.03, 0.03 + i * 0.05)));
    if (/magna/.test(n)) add(g, Z(cyl(0.012, 0.012, 0.2, ion, 0, 0.03, 0.36)));
    grip(g, shell); trigger(g);
    return V(0, -0.03, 0.18);
  }

  function kroot(g, L, r) {
    const n = r.n.toLowerCase(), wood = WOOD(), iron = GUN();
    if (r.form === 'pistol') {
      add(g, box(0.03, 0.045, 0.11, wood, 0, 0.018, 0.03), Z(cyl(0.012, 0.012, 0.09, iron, 0, 0.025, 0.11)));
      grip(g, wood); trigger(g);
      return null;
    }
    if (/bow|tribalest/.test(n)) return null;
    const long = r.form === 'sniper';
    add(g, box(0.035, 0.055, 0.24, wood, 0, 0.015, 0.03), Z(cyl(0.012, 0.012, long ? 0.42 : 0.3, iron, 0, 0.03, long ? 0.38 : 0.3)), box(0.03, 0.06, 0.14, wood, 0, -0.01, -0.14),
      ...[0, 1].map((i) => limb(V(-0.022, 0.03, 0.05 + i * 0.12), V(0.022, 0.03, 0.05 + i * 0.12), 0.006, mat('#c8b890'))));
    grip(g, wood); trigger(g);
    return V(0, -0.02, 0.18);
  }

  function bow(g) {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.012, 8, 20, Math.PI * 0.9), mat('#6a4a2a', { rough: 0.7 }));
    arc.rotation.z = Math.PI / 2 + Math.PI * 0.05; arc.rotation.y = Math.PI / 2; arc.castShadow = true;
    add(g, arc, limb(V(0, 0.21, 0.04), V(0, -0.21, 0.04), 0.003, mat('#e8e0d0')));
    return null;
  }

  /** A ranged weapon model: { g, fore }. */
  function ranged(r, L) {
    const g = new THREE.Group(), n = r.n.toLowerCase(), fam = family(r, L);
    let fore = null;
    if (r.form === 'bow' && !/stakethrower|crossbow|accelerator/.test(n)) fore = bow(g);
    else if (fam === 'ork') fore = ork(g, L, r);
    else if (fam === 'necron') fore = necron(g, L, r) ?? null;
    else if (fam === 'tau') fore = tau(g, L, r);
    else if (fam === 'aeldari') fore = aeldari(g, L, r);
    else if (fam === 'drukhari') fore = drukhari(g, L, r);
    else if (fam === 'votann') fore = votann(g, L, r);
    else if (fam === 'kroot') fore = kroot(g, L, r);
    else if (r.form === 'flamer' || r.flav === 'flame') fore = flamer(g, L, n);
    else if (r.flav === 'melta') fore = melta(g, L, n, fam);
    else if (r.flav === 'plasma') fore = plasma(g, L, n, fam);
    else if (r.form === 'launcher') fore = launcher(g, L, n);
    else if (r.form === 'sniper' && !/las/.test(n)) fore = sniper(g, L, n);
    else if (/\blas|hot-shot|hellgun/.test(n)) fore = lasgun(g, L, n); // (\b so "plasma" isn't taken for a lasgun)
    else if (/bolt|bolter/.test(n)) fore = bolter(g, L, r.form === 'pistol' ? 'pistol' : r.form === 'heavy' ? 'heavy' : n);
    else if (r.form === 'heavy') fore = bolter(g, L, 'heavy');
    else if (r.form === 'sniper') fore = sniper(g, L, n);
    else fore = autogun(g, L, r.form === 'pistol' ? 'pistol ' + n : n);
    return { g, fore };
  }

  // ---------- melee ----------
  function melee(m, L) {
    const g = new THREE.Group(), n = m.n.toLowerCase(), hilt = mat('#3a2a20', { rough: 0.7 }), steel = STEEL();
    const field = m.power ? mat(L.powerColor || '#7ad0ff', { glow: L.powerColor || '#7ad0ff', opacity: 0.45, rough: 0.2 }) : null;
    const orky = L.body === 'ork';
    switch (m.form) {
      case 'sword': {
        const long = /great|executioner|broadsword|diresword|greatblade/.test(n) ? 1.5 : /rapier|kiss|caress|mirror/.test(n) ? 1.0 : 1.1;
        const L1 = 0.34 * long;
        add(g, cyl(0.013, 0.015, 0.1, hilt, 0, 0, 0), sph(0.02, BRASS(), 0, -0.055, 0, 10, 8), box(0.11, 0.022, 0.035, BRASS(), 0, 0.055, 0),
          box(0.014, L1, 0.045, steel, 0, 0.065 + L1 / 2, 0), box(0.016, L1 * 0.85, 0.006, mat('#6a7078', { metal: 0.8 }), 0, 0.065 + L1 / 2, 0), // fuller
          cone(0.024, 0.07, steel, 0, 0.065 + L1 + 0.035, 0, 4));
        if (field) add(g, box(0.03, L1 + 0.05, 0.065, field, 0, 0.065 + L1 / 2 + 0.02, 0), limb(V(0, 0.03, -0.02), V(0, -0.04, -0.03), 0.005, DARK())); // power field and cable
        break;
      }
      case 'chainsword': {
        const long = /eviscerator|chainglaive|great|double/.test(n) ? 1.6 : 1;
        const L1 = 0.3 * long;
        add(g, cyl(0.015, 0.017, 0.1, hilt, 0, 0, 0), box(0.05, 0.1, 0.075, mat(orky ? '#7a4a2e' : L.trim, { metal: 0.6, rough: 0.4 }), 0, 0.09, 0), // motor housing
          box(0.05, 0.02, 0.09, DARK(), 0, 0.04, 0.0), box(0.022, L1, 0.065, DARK(), 0, 0.14 + L1 / 2, 0));
        const teeth = Math.round(10 * long);
        for (let i = 0; i < teeth; i++) add(g, cone(0.008, 0.02, steel, 0, 0.15 + (i + 0.5) * L1 / teeth, 0.04, 4).rotateX(Math.PI / 2)); // teeth along the edge
        add(g, cone(0.03, 0.04, DARK(), 0, 0.14 + L1 + 0.02, 0, 4));
        break;
      }
      case 'axe': {
        const big = /great|double|heavy|chainaxe|skull/.test(n) ? 1.4 : 1;
        const head = orky ? mat('#8a8e94', { metal: 0.7, rough: 0.55 }) : steel;
        add(g, cyl(0.014, 0.016, 0.4 * big, hilt, 0, 0.13 * big, 0));
        if (orky) add(g, box(0.02, 0.16 * big, 0.15 * big, head, 0, 0.27 * big, 0.06 * big), box(0.022, 0.02, 0.05, DARK(), 0, 0.33 * big, 0.11 * big), ...[0, 1].map((i) => sph(0.007, BRASS(), 0.012, 0.23 * big + i * 0.06, 0.03, 6, 4))); // crude cleaver with a notch
        else {
          const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * big, 0.11 * big, 0.016, 18, 1, false, 0, Math.PI), head);
          blade.rotation.z = Math.PI / 2; blade.position.set(0, 0.28 * big, 0.02); blade.castShadow = true;
          add(g, blade, box(0.03, 0.08 * big, 0.04, head, 0, 0.28 * big, -0.01));
        }
        if (field) add(g, box(0.035, 0.18 * big, 0.17 * big, field, 0, 0.28 * big, 0.06 * big));
        break;
      }
      case 'hammer': {
        const thunder = /thunder|hammer|tankhammer/.test(n), big = /thunder|great|heavy|tankhammer|dominator/.test(n) ? 1.3 : 0.9;
        add(g, cyl(0.016, 0.018, 0.44 * big, hilt, 0, 0.15 * big, 0), cyl(0.022, 0.022, 0.03, BRASS(), 0, 0.33 * big, 0));
        if (thunder) {
          // A thick block head with a brass centre band and dark striking faces; the power field shows only as thin
          // glowing insets on the faces and edges, not as a solid glowing disc.
          const y = 0.38 * big, b = big, metalHead = mat(L.trim, { metal: 0.7, rough: 0.35 }), face = mat('#3a3c42', { metal: 0.75, rough: 0.3 });
          const spark = glow(L.powerColor || '#7ad0ff');
          add(g, box(0.18 * b, 0.085 * b, 0.085 * b, metalHead, 0, y, 0), box(0.04 * b, 0.096 * b, 0.096 * b, BRASS(), 0, y, 0),
            ...[-1, 1].map((s) => box(0.03 * b, 0.1 * b, 0.1 * b, face, s * 0.1 * b, y, 0)));
          if (m.power) add(g, ...[-1, 1].map((s) => box(0.004, 0.05 * b, 0.05 * b, spark, s * 0.117 * b, y, 0)), ...[-1, 1].map((s) => box(0.15 * b, 0.006, 0.006, spark, 0, y + 0.043 * b, s * 0.043 * b)));
        } else add(g, cyl(0.04 * big, 0.034 * big, 0.12 * big, m.power ? glow(L.powerColor || '#7ad0ff') : steel, 0, 0.4 * big, 0, 12), ...[0, 1, 2, 3, 4, 5].map((i) => { const a = i * Math.PI / 3; return box(0.01, 0.1 * big, 0.03, steel, Math.cos(a) * 0.04 * big, 0.4 * big, Math.sin(a) * 0.04 * big).rotateY(-a); })); // flanged mace
        break;
      }
      case 'staff': {
        add(g, cyl(0.012, 0.014, 1.0, mat('#4a3a2a', { rough: 0.7 }), 0, 0.12, 0), cyl(0.018, 0.018, 0.03, BRASS(), 0, 0.3, 0), cyl(0.018, 0.018, 0.03, BRASS(), 0, -0.1, 0));
        if (/glaive|polearm|spear|tremor|virge|executioner/.test(n)) add(g, box(0.014, 0.22, 0.055, steel, 0, 0.72, 0), cone(0.028, 0.06, steel, 0, 0.86, 0, 4), field ? box(0.03, 0.25, 0.075, field, 0, 0.73, 0) : null);
        else add(g, new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 6, 16), BRASS()).translateY(0.66), sph(0.035, m.power || L.psyker ? glow(L.eye || '#7ad0ff') : BRASS(), 0, 0.66, 0, 12, 10), cone(0.02, 0.06, BRASS(), 0, 0.73, 0, 6));
        break;
      }
      case 'flail': {
        add(g, cyl(0.014, 0.016, 0.16, hilt, 0, 0.04, 0));
        let p = V(0, 0.12, 0);
        for (let i = 1; i <= 4; i++) { const q = V(0.012 * i, 0.12 + i * 0.04, 0.016 * i); add(g, limb(p, q, 0.005, steel)); p = q; }
        add(g, sph(0.045, m.power ? glow(L.powerColor || '#7ad0ff') : DARK(), p.x, p.y + 0.03, p.z, 12, 10), ...[0, 1, 2, 3, 4, 5].map((i) => { const a = i * Math.PI / 3; return cone(0.01, 0.035, steel, p.x + Math.cos(a) * 0.045, p.y + 0.03, p.z + Math.sin(a) * 0.045, 4); }));
        break;
      }
      case 'knife': {
        add(g, cyl(0.011, 0.012, 0.07, hilt, 0, 0, 0), box(0.05, 0.014, 0.024, steel, 0, 0.04, 0), box(0.01, 0.12, 0.028, field ? glow(L.powerColor || '#7ad0ff') : steel, 0, 0.105, 0), cone(0.014, 0.03, steel, 0, 0.18, 0, 4),
          ...[0, 1, 2].map((i) => box(0.011, 0.008, 0.008, steel, 0, 0.07 + i * 0.025, -0.016))); // serrated back
        break;
      }
      case 'fist': {
        // Worn over the hand. Modelled after a great armoured gauntlet such as Marneus Calgar's: a heavy cuff with a gilded
        // rim, a broad back plate, raised knuckle plates, thick curled segmented fingers and thumb, a power generator on
        // the back, gold edge trim — in gloss black (Ork klaws keep their rusty metal). Leaders get a twin bolter built
        // into the back of the gauntlet. No emblems.
        // Gloss black catches highlights on its edges; gold piping and gunmetal joint rings outline every plate.
        const black = orky ? mat('#7a4a2e', { metal: 0.5, rough: 0.55 }) : mat('#26282e', { metal: 0.35, rough: 0.26 });
        const gold = orky ? BRASS() : mat('#c9a227', { metal: 0.9, rough: 0.28 });
        const edge = orky ? steel : mat('#8d939c', { metal: 0.5, rough: 0.3 });
        const joint = orky ? steel : mat('#555a63', { metal: 0.45, rough: 0.35 });
        const ring = (r, t, m2, z, y = 0.005) => new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 24), m2).translateZ(z).translateY(y);
        add(g, Z(cyl(0.068, 0.076, 0.07, black, 0, 0.005, -0.1)), ring(0.07, 0.007, gold, -0.065), ring(0.077, 0.006, gold, -0.135), // cuff with gilded rims at both ends
          ring(0.074, 0.004, edge, -0.088), ring(0.075, 0.004, edge, -0.112), // raised ridges around the cuff
          box(0.13, 0.075, 0.12, black, 0, 0.03, 0.0), box(0.12, 0.06, 0.11, black, 0, -0.025, 0.0), // back plate and palm
          ...[-1, 1].map((s) => box(0.136, 0.007, 0.009, gold, 0, 0.065, s * 0.057)), ...[-1, 1].map((s) => box(0.008, 0.007, 0.12, gold, s * 0.064, 0.065, 0.0)), // gilded piping round the back plate
          ...[-1, 1].map((s) => box(0.008, 0.006, 0.112, edge, s * 0.06, -0.053, 0.0)), box(0.134, 0.005, 0.008, edge, 0, -0.005, 0.058)); // gunmetal edges on the palm and the wrist seam
        for (let i = 0; i < 4; i++) {
          const x = -0.045 + i * 0.03, k = [V(x, 0.03, 0.066), V(x, 0.02, 0.1), V(x, -0.016, 0.112), V(x, -0.046, 0.094)];
          add(g, sph(0.018, black, x, 0.042, 0.06, 12, 8), ring(0.016, 0.0022, gold, 0, 0).translateX(x).translateY(0.046).translateZ(0.062).rotateX(-0.9), sph(0.006, gold, x, 0.058, 0.064, 8, 6), // knuckle plate with a gilded rim and stud
            ...[0, 1, 2].map((j) => limb(k[j], k[j + 1], 0.0128 - j * 0.001, black)), // finger, three rounded segments curled into the palm with dark gaps between fingers
            ...[1, 2].map((j) => sph(0.0141 - j * 0.0008, joint, k[j].x, k[j].y, k[j].z, 10, 8))); // gunmetal joint rings mark each segment
        }
        const t0 = V(0.06, -0.01, 0.0), t1 = V(0.075, -0.012, 0.055), t2 = V(0.05, -0.03, 0.09);
        add(g, limb(t0, t1, 0.016, black), limb(t1, t2, 0.014, black), sph(0.0165, joint, t1.x, t1.y, t1.z, 10, 8), // thumb with a joint ring
          box(0.08, 0.04, 0.07, black, 0, 0.083, -0.03), box(0.084, 0.006, 0.074, gold, 0, 0.104, -0.03), // generator with a gilded lid
          ...[-1, 1].map((s) => box(0.084, 0.005, 0.006, gold, 0, 0.064, -0.03 + s * 0.035)), // gilded base frame
          ...[0, 1, 2].map((i) => box(0.004, 0.024, 0.006, edge, -0.042, 0.083, -0.05 + i * 0.02)), ...[0, 1, 2].map((i) => box(0.004, 0.024, 0.006, edge, 0.042, 0.083, -0.05 + i * 0.02))); // vent ribs
        if (L.leader && !orky) add(g, box(0.05, 0.034, 0.1, black, 0, 0.122, 0.02), ...[-1, 1].map((s) => Z(cyl(0.009, 0.009, 0.08, mat('#2a2c30', { metal: 0.6 }), s * 0.012, 0.122, 0.1))), ...[-1, 1].map((s) => Z(cyl(0.012, 0.012, 0.01, gold, s * 0.012, 0.122, 0.14)))); // twin bolter
        if (/klaw|pincer|hydraulic|crusher/.test(n)) add(g, ...[1, -1].map((s) => tilt(box(0.03, 0.035, 0.16, steel, s * 0.04, 0.02 * s, 0.13), 0, -s * 0.25, 0)));
        else if (/chainfist/.test(n)) add(g, box(0.025, 0.06, 0.2, DARK(), 0, 0.0, 0.17), ...[...Array(7)].map((_, i) => cone(0.007, 0.02, steel, 0, 0.035, 0.09 + i * 0.026, 4)));
        // Power field: crackling arcs over the knuckles and glowing vents on the generator — no glowing shell.
        if (m.power) {
          const spark = glow(L.powerColor || '#7ad0ff');
          add(g, ...[0, 1, 2].map((i) => box(0.05, 0.006, 0.008, spark, 0, 0.074 + i * 0.0, -0.068 + i * 0.019)),
            ...[0, 1, 2].map((i) => limb(V(-0.04 + i * 0.03, 0.06, 0.07), V(-0.025 + i * 0.03, 0.035, 0.115), 0.0025, spark)),
            ...[0, 1].map((i) => limb(V(-0.05 + i * 0.1, 0.0, 0.11), V(-0.03 + i * 0.06, -0.035, 0.12), 0.0025, spark)));
        }
        break;
      }
      case 'claws': {
        add(g, box(0.085, 0.06, 0.085, mat(L.main, { metal: 0.4 }), 0, -0.01, 0));
        for (let i = -1.5; i <= 1.5; i++) add(g, aimY(box(0.007, 0.22, 0.02, m.power ? glow(L.powerColor || '#7ad0ff') : steel, i * 0.022, 0.11, 0), V(i * 0.06, 1, 0.1)));
        break;
      }
    }
    return g;
  }

  return { ranged, melee, family };
}
