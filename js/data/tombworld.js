// Tomb World measurements supplied by the user on 2026-10-13. All distances are inches.
// Non-T wall/cover geometry is implemented by js/tombworld.js. Only T's pattern
// awaits the user's image; schematic map layouts are in js/tombworld-maps.js.
// `height` is vertical height; it must not be confused with the renderer's footprint `h`.
// For the rules a Tomb World wall (with its pillars and closed hatchways) counts as rising infinitely upwards:
// nothing climbs, flies or sees over it. `height` is only the model's physical height (3D view, lintels).
// `squareThickness` is the size of each square end pillar. Both pillars are included
// in overall length and overlap with the adjoining component's pillar at a join.
export const TOMB_WORLD_BOARD = {
  name: { zh: '墓穴世界', en: 'Tomb World' },
  units: 'inches',
  length: 28,
  width: 24,
  gridSpacing: 4,
  layoutStatus: 'six-schematic-layouts',
};

const wall = (id, length, extra = {}) => ({
  id, type: 'wall', length, height: 2.6, thickness: 0.25, ...extra,
});
const door = (location) => ({ type: 'door', width: 1.25, height: 2, location });
const lightCover = (id, length, width, height = 1) => ({
  id, type: 'cover', kind: 'light', length, width, height,
});

export const TOMB_WORLD_COMPONENTS = {
  A2: wall('A2', 8, { squareThickness: 1.25 }),
  A4: wall('A4', 8, {
    squareThickness: 1.25,
    opening: door('between-two-squares'),
  }),
  B4: wall('B4', 4.75, { squareThickness: 1.25 }),
  B2: wall('B2', 5, {
    opening: { type: 'hole', width: 1.25, height: 2, location: 'centre' },
  }),
  B1: wall('B1', 5), // Same dimensions as B2, but no opening.
  B3: wall('B3', 4.75, {
    squareThickness: 1.25,
    opening: door('centre'),
  }),
  A3: wall('A3', 8.75, {
    squareThickness: 1.25,
    opening: door('between-two-squares'),
  }),
  A1: wall('A1', 8.75, {
    squareThickness: 1.25,
    breach: {
      action: 'breach-wall',
      location: 'between-two-squares',
      initialState: 'intact',
      openingAfterBreach: { type: 'hole', width: 1.5, height: 2, location: 'between-two-squares' },
      // The user has not specified this action's AP cost yet.
      ap: null,
    },
  }),
  C1: lightCover('C1', 3.25, 2.5),
  C3: lightCover('C3', 1.5, 1.5),
  C5: lightCover('C5', 1.5, 1.5),
  C2: lightCover('C2', 2.25, 1.75),
  C4: lightCover('C4', 1.75, 1, 0.75),
  T: {
    id: 'T', type: 'teleport-pad', shape: 'circle', diameter: 2.25, height: 0.25,
    patternStatus: 'awaiting-user-pattern',
    teleport: { action: 'teleport', ap: 1, destination: 'another-teleport-pad' },
  },
};
