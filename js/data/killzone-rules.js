// Killzone and core rule numbers that the official documents set and later updates may change.
// Change a number here (and note the source) — the engine reads them from this file; nothing else needs editing.
// Team data (operatives, weapons, ploys, equipment) is changed through js/data/errata.js instead.

export const KILLZONE_RULES = {
  core: {
    turningPoints: 4,        // Core Rules: the battle lasts four turning points
    equipmentOptions: 4,     // Core Rules: up to four equipment options (some teams get one more, see equipmentLimitFor)
  },
  tombWorld: {
    hatchAP: 1,              // Killzone: Tomb World — Operate Hatch
    hatchReach: 1,           // the access point within this many inches of the base
    breachAP: 2,             // Breach mission action
    breacherBreachAP: 1,     // Breach for operatives with a breaching rule (then no Shoot or Charge that activation)
    breachRoll: 4,           // each operative across the breach point rolls a D6: on this or more…
    breachAplLoss: 1,        // …-1 APL until the end of its next activation, and damage equal to half the roll (rounding up)
  },
};

/** Where each number comes from (shown nowhere; for whoever updates this file). */
export const KILLZONE_SOURCES = {
  core: 'Kill Team Core Book (2024) and Core Rules update log',
  tombWorld: 'Killzone: Tomb World and its update log (.monitor/kill-team/files/killzone-tomb-world*.pdf)',
};
