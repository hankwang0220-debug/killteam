// Procedural 3D miniatures for every operative, built from simple shapes with three.js.
// Each team has a body style (power armour, guardsman, eldar, ork, necron, ...); operatives are told apart
// mainly by the weapons they hold, picked from their datacard weapons, plus a few role props
// (leader cape, vox antenna, medic pack, icon banner).
// Units are inches, like the board: a model faces +Z and stands on its base at y = 0.

import { teamDetails } from './models3d-teams.js';
import { createWeapons } from './models3d-weapons.js';
import { createRefinements } from './models3d-refinements.js';

const MM = 1 / 25.4;

// ---------- weapon recognition (by English weapon name) ----------
const PISTOL = /pistol|revolver|slugga|handbow|wroughtlock|autostubs|stinger|needler/;
const FLAMER = /flamer|burna|spewer|igniter|pyregut|brazier|censer|effluence|firestorm|fireblast|ripper gun/;
const LAUNCHER = /missile|rokkit launcha|rokkit rack|pulsa|grenade launcher|apm launcher|mortar|frag cannon/;
const HEAVY = /heavy bolter|cannon|chaincannon|rotary|multi-melta|seismic|mining laser|dark lance|heavy arc|volley|dakka|big shoota|heavy plasma|autostubber|transuranic/;
const SHOTGUN = /shotgun|scattergun/;
const SNIPER = /sniper|long-las|long rifle|marksman|hunting rifle|tankstopper|galvanic|rail rifle|magna-coil|stalker bolt|stalker marksman|executioner$/;
const BOW = /bow|tribalest|stakethrower/;
const RIFLE = /rifle|gun|carbine|bolter|boltgun|catapult|blaster|shardcarbine|shredder|lascutter|caliver|arquebus|kroot|splinter|shuriken|disintegrator|neutron sting/;
const NOT_HELD = /grenade|bomb|charge|explosive|detonator|vial|throwing|spit|gaze|scream|glands|isolator|tech-curse|holy light|voice|wreathe|barrage|thunderclap|lightning strike|doombolt|mindburn|baleblast|balesurge|entropy|plague wind|earthen|freezing|infernal|horrifying|siphon|dartmask|arcane|venom bolt|burning hands|stimm|stim-needler|diabolyk|melta bomb|emp/;

/** Shape of a ranged weapon: pistol, rifle, sniper, shotgun, heavy, launcher, flamer, bow — or null (not held). */
export function rangedForm(name) {
  const n = name.toLowerCase().replace(/\s*\(.*\)/, '');
  if (NOT_HELD.test(n) && !LAUNCHER.test(n)) return null;
  if (PISTOL.test(n)) return 'pistol';
  if (FLAMER.test(n)) return 'flamer';
  if (LAUNCHER.test(n)) return 'launcher';
  if (HEAVY.test(n)) return 'heavy';
  if (SHOTGUN.test(n)) return 'shotgun';
  if (SNIPER.test(n)) return 'sniper';
  if (BOW.test(n)) return 'bow';
  if (RIFLE.test(n)) return 'rifle';
  return null;
}
/** What a ranged weapon looks like it fires, for its colour accents. */
function rangedFlavour(n) {
  n = n.toLowerCase();
  if (/plasma|ion |caliver|etacarn|radium|incinerat/.test(n)) return 'plasma';
  if (/melta|fusion|inferno|atomiser|incendine/.test(n)) return 'melta';
  if (FLAMER.test(n) || /fire|flame|burn/.test(n)) return 'flame';
  if (/gauss|tesla|synaptic|staff of light|transdimensional|gauss|particle/.test(n)) return 'gauss';
  if (/pulse|rail|neutron|ion|burst/.test(n)) return 'pulse';
  if (/las|hot-shot|long-las/.test(n)) return 'las';
  if (/shuriken|splinter|shard|shredder|blaster|dark lance|fusion/.test(n)) return 'xenos';
  if (/bolt|bolter|boltgun/.test(n)) return 'bolt';
  return 'solid';
}

const MELEE_FORMS = [
  [/power fist|klaw|chainfist|gauntlet|knux|knucklebustas|bionic fist|mancrusher|pincer|hydraulic|servo|breacha ram|tankhammer|smash hammer/, 'fist'],
  [/lightning claw|claws|talons|scalpel claw|claw|scythes|pickrippers/, 'claws'],
  [/hammer|maul|mace|club|bludgeon|baton|null rod|goad|crusher|censure|incentiviser/, 'hammer'],
  [/axe|hatchet|choppa|cleaver|skullcleaver|chopper|entrencher/, 'axe'],
  [/chainsword|chainblade|eviscerator|chainglaive|chain/, 'chainsword'],
  [/stave|staff|conduit|polearm|glaive|spear|tremorglaive|virge|braystave|soulstave|miststave/, 'staff'],
  [/flail|whip|razorflail|crackthorn/, 'flail'],
  [/knife|knives|dagger|bayonet|scalpel|saw|sculptors|needle|spark|huskblade|dataspikes/, 'knife'],
  [/sword|blade|weapon|rapier|mirrorswords|diresword|moonblades|kiss|caress|embrace|khopesh|executioner|razorwing|triskele|faolch|agoniser|fleshskewer|impaler/, 'sword'],
];
const NATURAL = /^(fists|bite|fangs|gun butts?|ram|vicious|ripping|tail|barbed|pincer tail|mechanical|blasphemous|hideous|mutant tentacles|mutated|diseased|daemonic claw|toxic|drakesteed|jaws|claws & tail|claws & spark|claws$|vicious claws|fleshmelded|array of blades|improvised|crude|bionic arm|augmetic|shield bash)/;

/** Shape of a melee weapon: fist, claws, hammer, axe, chainsword, staff, flail, knife, sword — or null (bare hands, teeth...). */
export function meleeForm(name) {
  const n = name.toLowerCase().replace(/\s*\(.*\)/, '');
  if (NATURAL.test(n)) return null;
  // "X & Y" / "X and Y": the first part that is a weapon.
  for (const part of n.split(/ & | and /)) for (const [re, f] of MELEE_FORMS) if (re.test(part)) return f;
  return null;
}
const isShield = (n) => /shield|praesidium|slabshield/.test(n.toLowerCase());
const isDual = (n) => /twin|dual|paired|two |^ritual blades|duelling blades|transonic blades|locus blades|hekatarii|tzaangor blades|flensing|skinning|combat knives|mirrorswords|moonblades|lightning claws|claws/.test(n.toLowerCase());
const isPowered = (n) => /power|lightning|thunder|force|shock|null|daemon|soul|witch|psychic|tesla|arc|xenophase|glimmersteel|voltaic|commune|hammer of|warp|blessed|executioner|plasma knife|phase|mirror|kiss|caress|embrace|agoniser|diresword/.test(n.toLowerCase());
const isTwoHanded = (n, f) => /great|double-handed|eviscerator|heavy (axe|thunder|club)|polearm|glaive|executioner|trench club|tremorglaive|skullcleaver|mancrusher|dominator/.test(n.toLowerCase()) || f === 'staff';

const RANGED_RANK = { heavy: 8, launcher: 7, sniper: 6, flamer: 5, rifle: 4, shotgun: 4, bow: 3, pistol: 1 };
const MELEE_RANK = { fist: 9, hammer: 8, axe: 7, chainsword: 6, sword: 6, claws: 5, staff: 5, flail: 4, knife: 2 };

/** The weapons a model holds: its main ranged and melee weapon, chosen from its datacard weapons. */
export function pickWeapons(weapons) {
  const seen = new Set(), ranged = [], melee = [];
  let shield = false, psychic = false;
  for (const w of weapons || []) {
    const key = `${w.type}:${w.group || w.id}`; // a staff of light's ranged and melee profiles share a group
    if (seen.has(key)) continue;
    seen.add(key);
    const n = w.name.en;
    if (w.rules?.psychic) psychic = true;
    if (isShield(n)) shield = true;
    if (w.type === 'ranged') { const f = rangedForm(n); if (f) ranged.push({ w, n, form: f, flav: rangedFlavour(n), dual: isDual(n) }); }
    else { const f = meleeForm(n); if (f) melee.push({ w, n, form: f, power: isPowered(n), dual: isDual(n), twoHand: isTwoHanded(n, f) }); }
  }
  ranged.sort((a, b) => RANGED_RANK[b.form] - RANGED_RANK[a.form]);
  melee.sort((a, b) => MELEE_RANK[b.form] - MELEE_RANK[a.form] || (b.w.atk * b.w.dmg[0]) - (a.w.atk * a.w.dmg[0]));
  return { ranged: ranged[0] || null, ranged2: ranged[1] || null, melee: melee[0] || null, shield, psychic };
}

// ---------- team looks ----------
// body: the figure builder; the colours are the main armour/cloth, trim, cloth, skin, eye/lens glow.
const LOOKS = {
  angels: { body: 'marine', main: '#2f5fb8', trim: '#d8b04a', cloth: '#d9cfb0', eye: '#e03a2a' },
  deathwatch: { body: 'marine', main: '#24262b', trim: '#c9ccd1', cloth: '#5a2a24', eye: '#e03a2a', silverArm: true },
  nemesisClaw: { body: 'marine', chaos: true, main: '#1f3a6e', trim: '#b88a3a', cloth: '#5b1e1e', eye: '#e8e0ff', batWings: true },
  legionaries: { body: 'marine', chaos: true, main: '#1e1e22', trim: '#c9a227', cloth: '#5a1a1a', eye: '#ff3a2a' }, // official: Black Legion black and gold
  murderwing: { body: 'marine', chaos: true, main: '#2a3a5e', trim: '#c49a4a', cloth: '#5a1a1a', eye: '#ff4a3a', jump: true }, // official: midnight-blue armour with brass
  plagueMarines: { body: 'marine', chaos: true, plague: true, main: '#7d8a46', trim: '#9c7a3e', cloth: '#d0c9a8', eye: '#c8ff3a' },
  warpcoven: { body: 'marine', chaos: true, rubric: true, main: '#2a7a9a', trim: '#d8b04a', cloth: '#d4c9a0', eye: '#4af0ff' }, // official: teal-blue armour heavy with gold
  phobos: { body: 'marine', phobos: true, main: '#2c55a8', trim: '#c9c9c0', cloth: '#3a4a3a', eye: '#e03a2a' }, // official: Ultramarine blue Phobos armour
  scoutSquad: { body: 'marine', scout: true, main: '#2e3238', trim: '#8a8f94', cloth: '#4a4f40', skin: '#d6a785' }, // official: dark grey scout armour
  wolfScouts: { body: 'marine', scout: true, wolf: true, main: '#6d8aa3', trim: '#c8b07a', cloth: '#8a8c88', skin: '#e0b494' },
  deathKorps: { body: 'guard', coat: true, gasmask: true, main: '#4c5862', trim: '#2f353a', cloth: '#7a6e58', eye: '#cf3a2a' }, // official: slate greatcoats, khaki webbing
  kasrkin: { body: 'guard', carapace: true, visor: true, main: '#7a8f5a', trim: '#2d3a26', cloth: '#6a6450', eye: '#e8a02a' }, // official: pale olive carapace
  aquilons: { body: 'guard', carapace: true, visor: true, main: '#5a5e60', trim: '#9aa0aa', cloth: '#7a6448', eye: '#e03a2a' }, // official: gunmetal carapace, tan fatigues
  spectres: { body: 'guard', carapace: true, cloak: true, visor: true, main: '#6a3a2a', trim: '#2f2f2a', cloth: '#4a4a3a', eye: '#7fe03a' }, // official: rust-brown jackets, dark kit
  blooded: { body: 'guard', gasmask: true, rags: true, main: '#6e3a30', trim: '#3c2a24', cloth: '#a33a2f', eye: '#ff3a2a' },
  broodBrothers: { body: 'guard', helmet: true, main: '#4a4a52', trim: '#7a2a30', cloth: '#3a3a40', skin: '#c7a9c0' }, // official: dark grey fatigues, maroon armour
  navyBreachers: { body: 'guard', carapace: true, visor: true, void: true, main: '#3f6a8a', trim: '#c9a227', cloth: '#2c3a46', eye: '#4ad0ff' },
  exaction: { body: 'guard', carapace: true, visor: true, main: '#2d3442', trim: '#b8bcc4', cloth: '#1e232c', eye: '#e03a2a' },
  elucidianStarstriders: { body: 'guard', coat: true, bare: true, main: '#2f5f9a', trim: '#d8b04a', cloth: '#d8d0b8', skin: '#d8a888' },
  inquisitorialAgents: { body: 'guard', coat: true, bare: true, main: '#6e1824', trim: '#b8a070', cloth: '#2a2a2a', skin: '#d8a888' },
  novitiates: { body: 'sister', robe: true, main: '#a8303e', trim: '#2a2a2a', cloth: '#e8e0d0', skin: '#e0b494', hair: '#e8e8e8' },
  celestianInsidiants: { body: 'sister', main: '#24242a', trim: '#b8bcc4', cloth: '#8a1e24', skin: '#e0b494', hair: '#f0f0f0' }, // official: black armour, silver trim, red robes
  sanctifiers: { body: 'guard', robe: true, hood: true, main: '#7a6f52', trim: '#c9a227', cloth: '#d8d0b8', skin: '#d8a888' },
  chaosCult: { body: 'guard', rags: true, hood: true, main: '#6a3a3a', trim: '#8a6a3a', cloth: '#9b2c2c', skin: '#c9a08a' },
  goremongers: { body: 'guard', rags: true, mask: true, main: '#7a1e1a', trim: '#c9a227', cloth: '#b88878', skin: '#c9a08a' }, // official: bare pale flesh, red cloth, brass
  wyrmblade: { body: 'guard', helmet: true, goggles: true, main: '#c9a227', trim: '#5a4a3a', cloth: '#6a5a40', skin: '#b8a0c8' },
  gellerpox: { body: 'guard', bloated: true, rags: true, main: '#8a5a6a', trim: '#5a4a3a', cloth: '#a0607a', skin: '#c8b090' },
  bladesOfKhaine: { body: 'eldar', aspect: true, main: '#244c32', trim: '#e8d8a0', cloth: '#d8d0b0', eye: '#e03a2a' },
  corsairVoidscarred: { body: 'eldar', cloak: true, main: '#24525e', trim: '#c9a227', cloth: '#6a1e24', eye: '#4af0ff' }, // official: deep teal armour, maroon cloaks, gold
  voidDancers: { body: 'eldar', harlequin: true, main: '#c2398f', trim: '#e8c040', cloth: '#2a2a2a', eye: '#ffffff' },
  handOfArchon: { body: 'eldar', drukhari: true, main: '#1e3a38', trim: '#b0b0b8', cloth: '#3a1e3a', eye: '#7fe03a' }, // official: dark teal-black Kabalite armour, silver blades
  mandrakes: { body: 'eldar', mandrake: true, main: '#2e3034', trim: '#4a4c50', cloth: '#1a1c20', skin: '#c8ccc6', eye: '#8aff3a' }, // official: pale grey-white skin, dark rags, green glow
  exoditeDragonMasters: { body: 'eldar', cloak: true, main: '#4f8a3c', trim: '#d8b04a', cloth: '#a8603a', eye: '#4af0ff' },
  tauPathfinders: { body: 'tau', main: '#dcd8cc', trim: '#8a2a24', cloth: '#3a3a40', skin: '#5a6a8a', eye: '#3af0ff' }, // official: white armour, dark fatigues, red markings
  stealthSuits: { body: 'battlesuit', main: '#dcd8cc', trim: '#a8302a', cloth: '#2a3236', eye: '#3af0ff' }, // official: white armour with red
  vespids: { body: 'vespid', main: '#e2691a', trim: '#e8e2d4', cloth: '#5a4a3a', skin: '#d65f16', eye: '#ff3a1a' }, // as the official miniatures: orange chitin, white T'au kit
  farstalkers: { body: 'kroot', main: '#b8a582', trim: '#5a4a3a', cloth: '#a8342a', skin: '#a89878', eye: '#e8c040' }, // official: pale tan skin, brick-red quills
  kommandos: { body: 'ork', main: '#3a3a36', trim: '#5a4a3a', cloth: '#45483c', skin: '#5f9a2b', eye: '#ff3a2a' }, // official: bright green skin, dark fatigues, red bandanas
  wreckaKrew: { body: 'ork', armoured: true, main: '#4a4a4c', trim: '#a8302a', cloth: '#3a3a3a', skin: '#5f9a2b', eye: '#ff3a2a' }, // official: gunmetal armour with red
  hearthkyn: { body: 'votann', main: '#d07a2a', trim: '#4a4a4e', cloth: '#5a5a5e', skin: '#d8a888', eye: '#4af0ff' },
  hernkynYaegirs: { body: 'votann', bare: true, main: '#5a5e62', trim: '#c87a2a', cloth: '#b8742a', skin: '#d8a888', hair: '#c8642a' }, // official: grey armour, orange accents
  ratlings: { body: 'ratling', main: '#7a7a4a', trim: '#5a4a3a', cloth: '#a58b3c', skin: '#d8a888' },
  hierotek: { body: 'necron', main: '#8f979f', trim: '#b07a4a', cloth: '#2a2a2a', eye: '#3aff6a' }, // official: dark silver with bronze, green glow
  canoptekCircle: { body: 'necron', main: '#9aa4ac', trim: '#2fb59a', cloth: '#2a2a2a', eye: '#3affc0' },
  hunterClade: { body: 'skitarii', main: '#a8382a', trim: '#c9b9a0', cloth: '#8a2a20', skin: '#c9b9a0', eye: '#3aff6a' },
  battleclade: { body: 'skitarii', servitor: true, main: '#5a5e64', trim: '#a8302a', cloth: '#8a2a20', skin: '#c8b0a0', eye: '#3aff6a' }, // official: gunmetal servitors, red-robed tech-priest
  fellgor: { body: 'gor', main: '#4a3a30', trim: '#8a8a8a', cloth: '#6a2a24', skin: '#6a5a4a', eye: '#ffa03a' }, // official: grey-brown hide, dark red cloth, iron
  raveners: { body: 'ravener', main: '#3e4272', trim: '#dcd8cc', cloth: '#5a2a7a', skin: '#c8c4d8', eye: '#ff3a3a' }, // official: dark blue-violet carapace, pale bone flesh
};
const DEFAULT_LOOK = { body: 'guard', helmet: true, main: '#6a6a6a', trim: '#3a3a3a', cloth: '#5a5a5a', skin: '#d8a888' };

/** The look of one operative: its team's look with operative-specific changes, from its name and abilities. */
export function operativeLook(team, op) {
  // Inquisitorial Agents: requisitioned operatives, Tempestus Scions and gun servitors look like their own forces.
  if (team.id === 'inquisitorialAgents') {
    const rq = /^rq_([a-zA-Z]+)_/.exec(op.id)?.[1];
    const from = rq ? (rq === 'navy' ? 'navyBreachers' : rq) : /^ts/.test(op.id) ? 'aquilons' : /^iaServitor/.test(op.id) ? 'battleclade' : null;
    if (from && LOOKS[from]) team = { ...team, id: from, ops: [] };
  }
  const base ={ ...DEFAULT_LOOK, ...(LOOKS[team.id] || {}), main: (LOOKS[team.id] || {}).main || team.color, team: team.id };
  const n = op.name.en;
  const L = { ...base, name: n };
  L.leader = op === team.ops?.[0] || !!op.leader || /sergeant|leader|boss|nob\b|captain|commander|exarch|archsybarite|felarch|shas'ui|chieftain|watchmaster|champion|despotek|technomancer|geomancer|theyn|superior|primus|magus|proctor|kill-broker|technoarcheologist|chaos lord|visionary|demagogue|herald|tempestor|fixer|confessor|vhane|princeps|strain leader|shas'vre|lead player|nightfiend|chosen|prime/i.test(n);
  L.medic = !!(op.medic || op.medikit) || /medic|medicae|corpseman|hospitaller|chirurgant|rejuvenat|medical|technomedic|elixicant/i.test(n);
  L.vox = /vox|comms|signifier|commsman|void-jammer|voxbreaker|ventrilokar|kinlynk/i.test(n);
  L.icon = /icon|reliquarius|reliquant|iconward|iconarch/i.test(n);
  L.psyker = !!(op.psyker || op.destiny) || /sorcerer|psyker|mindwitch|shaman|caster|stonesinger|soul weaver|shadowseer|magus|rune priest|mystic|hexorcist|warpcoven/i.test(n) && !/rubric|tzaangor/i.test(n);
  L.big = 1;
  // Model kinds that don't follow the team's body.
  if (/hound|mastiff|canid|battlemutt|fenrisian wolf/i.test(n)) L.body = 'beast';
  else if (/drone(?! controller)/i.test(n)) L.body = 'drone';
  else if (/squig/i.test(n)) L.body = 'squig';
  else if (/^grot$/i.test(n)) { L.body = 'ork'; L.grot = true; }
  else if (/gheistskull|tome-skull|servo-skull|skull$/i.test(n) && !/skullclaimer/i.test(n)) L.body = 'skull';
  else if (/cherub|familiar/i.test(n)) L.body = 'cherub';
  else if (/ogryn|bullgryn/i.test(n)) L.body = 'ogryn';
  else if (/beacon|servo-sentry|c\.a\.t\./i.test(n)) L.body = 'gadget';
  else if (/plasmacyte|macrocyte/i.test(n)) L.body = 'macrocyte';
  else if (/tomb crawler/i.test(n)) L.body = 'crawler';
  else if (/drakolithe/i.test(n)) L.body = 'beast';
  else if (/dragon master/i.test(n)) L.body = 'rider';
  else if (/tzaangor/i.test(n)) { L.body = 'gor'; L.bird = true; L.main = '#2763a8'; L.skin = '#3a8ab0'; }
  else if (/patriarch|kelermorph|locus|primus|magus/i.test(n) && team.id !== 'warpcoven') { L.hybrid = true; }
  else if (/sicarian/i.test(n)) L.sicarian = true;
  else if (/servitor|underseer|servitor/i.test(n) && team.id === 'battleclade') L.servitor = /underseer/i.test(n) ? false : true;
  if (team.id === 'battleclade' && /technoarcheologist|underseer/i.test(n)) L.servitor = false;
  if (/glitchling/i.test(n)) { L.big = 0.6; L.daemon = true; }
  if (/vulgrar|bloatspawn|fleshscreamer|lumberghast|chaos torment|patriarch/i.test(n)) { L.big = 1.35; L.bloated = true; }
  if (team.id === 'gellerpox' && /mutant/i.test(n)) L.bloated = false;
  if (/heavy intercessor|captain|chaos lord|bombard|breacher veteran|horde-slayer/i.test(n)) L.big = 1.12;
  if (/boss nob|wrecka boss/i.test(n)) L.big = 1.22; // ScaleMini: Kommando Boss Nob 51mm vs Boyz ~40mm
  if (/immortal|deathmark/i.test(n)) L.big = 1.08;
  if (/technomancer|geomancer/i.test(n)) L.float = true;
  if (/raptor|warp talon|chaos lord|champion|curseclaw|depredator|huntmaster|shrieker|skysear/i.test(n) && team.id === 'murderwing') L.jump = true;
  if (/jump pack/i.test(n)) L.jump = true;
  if (/sorcerer/i.test(n)) { L.rubric = false; L.cape = true; }
  if (/eliminator|sniper|sharpshooter|marksman|long-sight|longsting|incursor/i.test(n) && !['stealthSuits', 'vespids', 'tauPathfinders'].includes(team.id)) L.cloak = true;
  if (L.cloak && L.body === 'marine') L.cloth = '#5a6446'; // camo cloak
  if (team.id === 'bladesOfKhaine') L.aspectKind = /scorpion/i.test(n) ? 'scorpion' : /banshee/i.test(n) ? 'banshee' : 'avenger';
  if (team.id === 'deathKorps' && /watchmaster|confidant/i.test(n)) L.peakedCap = true;
  if (team.id === 'broodBrothers' && /magus|primus/i.test(n)) L.helmet = false; // bare, ridged hybrid heads
  if (L.aspectKind === 'scorpion') { L.main = '#244d2b'; L.trim = '#e8c040'; }
  if (L.aspectKind === 'banshee') { L.main = '#2b5140'; L.trim = '#a82a2a'; L.cloth = '#a82a2a'; }
  if (L.aspectKind === 'avenger') { L.main = '#1f4636'; L.trim = '#e8e0d0'; }
  if (/death cult|assassin|executioner/i.test(n) && /sanctifiers|elucidian/.test(team.id)) { L.hood = true; L.main = '#2a2a2e'; }
  return L;
}

// ---------- the model kit ----------
/** Builds models with the given three.js namespace. */
export function createModelKit(THREE) {
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const UP = V(0, 1, 0);
  const mats = new Map();
  const mat = (color, o = {}) => {
    const key = `${color}|${o.metal ?? 0}|${o.rough ?? 0.7}|${o.glow ?? ''}|${o.opacity ?? 1}|${o.side ?? ''}`;
    if (!mats.has(key)) {
      mats.set(key, new THREE.MeshStandardMaterial({
        side: o.side === 'double' ? THREE.DoubleSide : THREE.FrontSide,
        color, metalness: o.metal ?? 0.1, roughness: o.rough ?? 0.7,
        emissive: o.glow ? new THREE.Color(o.glow) : new THREE.Color(0), emissiveIntensity: o.glow ? 1.4 : 0,
        transparent: (o.opacity ?? 1) < 1, opacity: o.opacity ?? 1, envMapIntensity: 2, // the studio reflection (studioEnv) is kept dim; this lifts metal edges
      }));
    }
    return mats.get(key);
  };
  const glow = (c) => mat(c, { glow: c, rough: 0.4 });
  const METAL = () => mat('#8c9096', { metal: 0.8, rough: 0.35 });
  const DARK = () => mat('#2a2c30', { metal: 0.5, rough: 0.5 });
  const BRASS = () => mat('#b8913f', { metal: 0.85, rough: 0.35 });

  const mesh = (geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o; };
  // Geometry is shared between parts of the same shape and size (cached), and every part is rounded and smooth-shaded
  // so models read as sculpted miniatures rather than blocks.
  const geos = new Map();
  const cached = (key, make) => { if (!geos.has(key)) geos.set(key, make()); return geos.get(key); };
  const q = (n) => Math.round(n * 2000) / 2000;
  /** A box with rounded edges (radius r) and a taper: the bottom is `taper` times as wide as the top. */
  function roundedBoxGeo(w, h, d, r, taper = 1) {
    return cached(`rb${q(w)},${q(h)},${q(d)},${q(r)},${q(taper)}`, () => {
      const g = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4), p = g.attributes.position, n = g.attributes.normal;
      const half = [w / 2, h / 2, d / 2], inner = half.map((s) => Math.max(0, s - r));
      const v = V(), c = V();
      for (let i = 0; i < p.count; i++) {
        // Grid steps of the unit box: ±0.5 → the surface, ±0.25 → where the rounding starts, 0 → the middle.
        const map = (u, k) => Math.sign(u) * (Math.abs(u) > 0.375 ? half[k] : Math.abs(u) > 0.125 ? inner[k] : 0);
        v.set(map(p.getX(i), 0), map(p.getY(i), 1), map(p.getZ(i), 2));
        c.set(Math.max(-inner[0], Math.min(inner[0], v.x)), Math.max(-inner[1], Math.min(inner[1], v.y)), Math.max(-inner[2], Math.min(inner[2], v.z)));
        const dir = V().subVectors(v, c);
        if (dir.lengthSq() > 1e-12) { dir.normalize(); v.copy(c).addScaledVector(dir, r); n.setXYZ(i, dir.x, dir.y, dir.z); }
        const t = taper + (1 - taper) * (v.y / h + 0.5); // narrower towards the bottom
        p.setXYZ(i, v.x * t, v.y, v.z * (1 - (1 - t) * 0.5));
      }
      p.needsUpdate = true; n.needsUpdate = true;
      return g;
    });
  }
  const box = (w, h, d, m, x, y, z) => mesh(roundedBoxGeo(w, h, d, Math.min(w, h, d) * 0.28), m, x, y, z);
  /** A darker shade of a colour, for the seams between armour plates. */
  const seamMat = (c) => { const col = new THREE.Color(c), dark = col.r * 0.3 + col.g * 0.59 + col.b * 0.11 < 0.06; return mat('#' + (dark ? col.lerp(new THREE.Color('#6a6e76'), 0.55) : col.multiplyScalar(0.5)).getHexString(), { metal: 0.3, rough: 0.6 }); }; // very dark armour gets lighter seams so they still show
  /** A thin ring around the limb from a to b, at fraction t along it. */
  const band = (a, b, t, r, m, k = 1) => { const p = V().lerpVectors(a, b, t); return aimY(cyl(r, r, 0.02 * k, m, p.x, p.y, p.z, 14), V().subVectors(b, a)); };
  /** A rounded box narrower at the bottom (chests, waists). */
  const tbox = (w, h, d, m, x, y, z, taper = 0.78) => mesh(roundedBoxGeo(w, h, d, Math.min(w, h, d) * 0.35, taper), m, x, y, z);
  const cyl = (rt, rb, h, m, x, y, z, seg = 10) => mesh(cached(`cy${q(rt)},${q(rb)},${q(h)},${Math.max(16, seg)}`, () => new THREE.CylinderGeometry(rt, rb, h, Math.max(16, seg))), m, x, y, z);
  const sph = (r, m, x, y, z, ws = 10, hs = 8) => mesh(cached(`sp${q(r)},${Math.max(18, ws)},${Math.max(12, hs)}`, () => new THREE.SphereGeometry(r, Math.max(18, ws), Math.max(12, hs))), m, x, y, z);
  const cone = (r, h, m, x, y, z, seg = 8) => mesh(cached(`co${q(r)},${q(h)},${seg <= 4 ? seg : Math.max(14, seg)}`, () => new THREE.ConeGeometry(r, h, seg <= 4 ? seg : Math.max(14, seg))), m, x, y, z);
  const tz = (o) => { o.rotation.x = Math.PI / 2; return o; }; // cylinder along Z
  const add = (p, ...cs) => { cs.forEach((c) => c && p.add(c)); return p; };
  const group = (...cs) => add(new THREE.Group(), ...cs);
  /** A smooth tapered limb from point a (radius r) to point b (radius r2), with rounded ends so joints blend. */
  const limb = (a, b, r, m, r2 = r) => {
    const d = V().subVectors(b, a), len = d.length() || 1e-4;
    const o = mesh(cached(`li${q(r)},${q(r2)},${q(len)}`, () => new THREE.CylinderGeometry(r2, r, len, 14, 1, true)), m);
    o.position.copy(a).addScaledVector(d, 0.5);
    o.quaternion.setFromUnitVectors(UP, d.normalize());
    if (r >= 0.008) o.add(sph(r, m, 0, -len / 2, 0, 14, 10));
    if (r2 >= 0.008) o.add(sph(r2, m, 0, len / 2, 0, 14, 10));
    return o;
  };
  /** Turns o so its local +Z points along z, with local +Y as close to up as possible. */
  const aimZ = (o, z, up = UP) => {
    const Z = z.clone().normalize(), X = V().crossVectors(up, Z).normalize(), Y = V().crossVectors(Z, X);
    o.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
    return o;
  };
  /** Turns o so its local +Y points along y, with local +Z towards zHint. */
  const aimY = (o, y, zHint = V(0, 0, 1)) => {
    const Y = y.clone().normalize(), X = V().crossVectors(Y, zHint).normalize(), Z = V().crossVectors(X, Y);
    o.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
    return o;
  };
  /** A point given in o's local space, in its parent's space. */
  const toParent = (o, p) => { o.updateMatrix(); return p.clone().applyMatrix4(o.matrix); };
  const details = teamDetails({ THREE, V, mat, glow, box, cyl, sph, cone, limb, add, aimY, aimZ, tz, METAL, DARK, BRASS });
  const refinements = createRefinements({ THREE,V,mat,box,tbox,cyl,sph,cone,limb,add,tz,aimY,DARK,METAL });

  // ----- weapons (shaped after each faction's official designs: js/models3d-weapons.js); team add-ons run on ranged ones -----
  const weapons = createWeapons({ THREE, V, mat, glow, box, cyl, sph, cone, limb, add, tz, aimY, METAL, DARK, BRASS });
  function rangedModel(r, L) { const res = weapons.ranged(r, L); details.weapon(res.g, r, L); refinements.weapon(res.g,r,L);return res; }
  const meleeModel = (m, L) => weapons.melee(m, L);

  // ----- bases -----
  function baseFor(op, L, teamColor) {
    const [w, d] = op.oval ? [op.oval[0] * MM, op.oval[1] * MM] : [op.base * MM, op.base * MM];
    const g = new THREE.Group();
    const top = cyl(0.5, 0.52, 0.12, mat('#2b2d31', { rough: 0.9 }), 0, -0.06, 0, 24);
    const rim = cyl(0.522, 0.522, 0.03, mat(teamColor, { rough: 0.5 }), 0, -0.105, 0, 24);
    const grass = cyl(0.47, 0.47, 0.012, mat('#4a4636', { rough: 1 }), 0, 0.001, 0, 24);
    add(g, top, rim, grass);
    g.scale.set(d, 1, w); // an oval base's long axis runs front to back
    return g;
  }

  // ----- humanoid figures -----
  // Proportions per body style (inches): leg length, leg radius, torso width/height/depth, head radius,
  // shoulder half-width, arm radius, arm length, weapon scale.
  const BUILD = {
    marine: { leg: 0.5, legR: 0.07, tw: 0.34, th: 0.34, td: 0.21, head: 0.075, sx: 0.2, armR: 0.05, arm: 0.36, wk: 1.25 },
    guard: { leg: 0.46, legR: 0.05, tw: 0.24, th: 0.3, td: 0.14, head: 0.07, sx: 0.14, armR: 0.034, arm: 0.33, wk: 1 },
    sister: { leg: 0.47, legR: 0.055, tw: 0.26, th: 0.3, td: 0.16, head: 0.068, sx: 0.16, armR: 0.04, arm: 0.33, wk: 1.05 },
    eldar: { leg: 0.56, legR: 0.042, tw: 0.22, th: 0.32, td: 0.13, head: 0.065, sx: 0.13, armR: 0.03, arm: 0.37, wk: 1.05 },
    tau: { leg: 0.5, legR: 0.05, tw: 0.25, th: 0.3, td: 0.15, head: 0.08, sx: 0.16, armR: 0.036, arm: 0.34, wk: 1.1 },
    battlesuit: { leg: 0.58, legR: 0.08, tw: 0.36, th: 0.36, td: 0.24, head: 0.06, sx: 0.23, armR: 0.06, arm: 0.36, wk: 1.35 },
    kroot: { leg: 0.56, legR: 0.04, tw: 0.2, th: 0.3, td: 0.13, head: 0.07, sx: 0.13, armR: 0.03, arm: 0.4, wk: 1.1 },
    ork: { leg: 0.42, legR: 0.07, tw: 0.36, th: 0.34, td: 0.22, head: 0.09, sx: 0.22, armR: 0.055, arm: 0.42, wk: 1.3 },
    votann: { leg: 0.32, legR: 0.07, tw: 0.32, th: 0.3, td: 0.2, head: 0.08, sx: 0.18, armR: 0.048, arm: 0.3, wk: 1.05 },
    ratling: { leg: 0.3, legR: 0.04, tw: 0.2, th: 0.22, td: 0.12, head: 0.075, sx: 0.11, armR: 0.03, arm: 0.24, wk: 0.85 },
    ogryn: { leg: 0.7, legR: 0.11, tw: 0.6, th: 0.5, td: 0.36, head: 0.09, sx: 0.36, armR: 0.1, arm: 0.6, wk: 1.8 },
    necron: { leg: 0.56, legR: 0.035, tw: 0.24, th: 0.32, td: 0.13, head: 0.07, sx: 0.16, armR: 0.028, arm: 0.38, wk: 1.15 },
    skitarii: { leg: 0.48, legR: 0.04, tw: 0.24, th: 0.3, td: 0.14, head: 0.068, sx: 0.14, armR: 0.032, arm: 0.33, wk: 1 },
    gor: { leg: 0.56, legR: 0.07, tw: 0.32, th: 0.34, td: 0.2, head: 0.08, sx: 0.2, armR: 0.05, arm: 0.4, wk: 1.25 },
    vespid: { leg: 0.58, legR: 0.03, tw: 0.2, th: 0.26, td: 0.14, head: 0.075, sx: 0.13, armR: 0.028, arm: 0.36, wk: 1.15 },
  };

  function humanoid(op, L, picks) {
    const B = { ...(BUILD[L.body] || BUILD.guard) };
    refinements.proportions(B,L);
    const k = L.big * (L.grot ? 0.55 : 1) * (L.scout ? 0.92 : 1) * (L.sicarian ? 1.12 : 1);
    for (const key of Object.keys(B)) if (key !== 'wk') B[key] *= k;
    B.wk *= k;
    if (L.bloated) { B.tw *= 1.3; B.td *= 1.5; }
    if (L.scout) { B.tw *= 0.85; B.td *= 0.8; B.armR *= 0.75; B.legR *= 0.8; }
    if (L.sicarian) { B.leg *= 1.25; }
    const fig = new THREE.Group();
    const refinedMetal=L.body==='necron' ? .65 : ['marine','battlesuit','sister'].includes(L.body) ? .16 : .05;
    const refinedRough=L.body==='necron' ? .42 : ['marine','battlesuit','sister','tau','votann'].includes(L.body) ? .62 : .83;
    const main = mat(L.main, { metal: L.refined ? refinedMetal : ['marine', 'battlesuit', 'sister', 'necron'].includes(L.body) ? 0.35 : 0.05, rough: L.refined ? refinedRough : ['marine', 'battlesuit', 'necron'].includes(L.body) ? 0.45 : 0.8 });
    const trim = mat(L.trim, { metal: L.refined ? .55 : .7, rough: L.refined ? .48 : .35 });
    const cloth = mat(L.cloth, { rough: 0.95 });
    const skin = mat(L.skin || '#d8a888', { rough: 0.8 });
    const eye = glow(L.eye || '#e03a2a');
    const necron = L.body === 'necron';
    const limbMat = necron ? METAL() : ['ork', 'gor', 'kroot', 'vespid'].includes(L.body) || L.mandrake ? skin : L.body === 'guard' && !L.carapace && !L.coat ? cloth : main;
    const hunch = ['ork', 'gor', 'ogryn'].includes(L.body) ? 0.06 * k : L.body === 'vespid' ? 0.07 * k : L.servitor ? 0.05 : 0;
    // Plate seams: armoured figures get thin darker rings where plates meet (thigh, knee, ankle), so the outline of
    // each piece of armour reads at a distance, as on the power fist.
    const plated = ['marine', 'sister', 'battlesuit', 'votann', 'tau'].includes(L.body) || L.carapace || L.armoured;
    const seam = seamMat(L.main);

    // Legs.
    const hipY = L.float ? B.leg + 0.15 : B.leg, hx = B.tw * 0.26;
    const legs = [];
    for (const s of [-1, 1]) {
      const fwd = s === -1 ? 0.06 * k : -0.05 * k;
      const hip = V(s * hx, hipY, 0), foot = V(s * hx * 1.3, 0.04, fwd);
      if (L.float || L.seated) continue;
      if (L.body === 'gor' || L.sicarian || L.body === 'vespid' || L.body === 'kroot') {
        // Digitigrade legs: thigh forward, shin back, foot forward.
        const knee = V(s * hx * 1.15, hipY * 0.6, fwd + 0.1 * k), hock = V(s * hx * 1.25, hipY * 0.25, fwd - 0.08 * k);
        legs.push(limb(hip, knee, B.legR, limbMat), limb(knee, hock, B.legR * 0.75, limbMat), limb(hock, foot, B.legR * 0.6, limbMat));
        legs.push(L.body === 'gor' ? cyl(B.legR * 0.8, B.legR, 0.05, DARK(), foot.x, 0.025, foot.z) : box(B.legR * 1.6, 0.03, B.legR * 3, limbMat, foot.x, 0.015, foot.z + 0.03));
        if (L.sicarian) legs.push(limb(knee, hock, B.legR * 0.4, METAL()));
      } else {
        const knee = V(s * hx * 1.2, hipY * 0.5, fwd + 0.04 * k);
        const legM = necron ? METAL() : L.carapace || ['marine', 'sister', 'battlesuit', 'votann', 'tau', 'eldar'].includes(L.body) || L.armoured ? main : cloth;
        legs.push(limb(hip, knee, B.legR * 1.1, legM, B.legR * 0.92), limb(knee, foot, B.legR * 0.95, legM, B.legR * 0.7));
        if (plated && legM === main) legs.push(band(hip, knee, 0.8, B.legR * 1.03, seam, k), band(hip, knee, 0.22, B.legR * 1.15, seam, k), band(knee, foot, 0.8, B.legR * 0.84, seam, k)); // thigh plate, hip joint and greave seams
        { const bootM = L.body === 'marine' || L.body === 'battlesuit' ? main : DARK(); legs.push(box(B.legR * 2, B.legR * 1.3, B.legR * 2.6, bootM, foot.x, B.legR * 0.65, foot.z + B.legR * 0.4), sph(B.legR * 0.95, bootM, foot.x, B.legR * 0.55, foot.z + B.legR * 1.5, 12, 8)); } // boot with a rounded toe
        if (['marine', 'battlesuit', 'votann', 'sister'].includes(L.body) || L.carapace) legs.push(sph(B.legR * 1.15, main, knee.x, knee.y, knee.z + B.legR * 0.4, 8, 6));
        if (necron) legs.push(sph(B.legR * 1.3, METAL(), knee.x, knee.y, knee.z));
      }
    }
    add(fig, ...legs);

    // Pelvis, torso, robes and coats.
    const torsoY = hipY + B.th / 2 + 0.02;
    const upper = new THREE.Group();
    upper.position.set(0, 0, hunch);
    add(upper, box(B.tw * 0.85, 0.1 * k, B.td * 0.9, necron ? METAL() : L.body === 'marine' || L.body === 'vespid' ? main : DARK(), 0, hipY + 0.02, 0));
    if (necron) {
      add(upper, box(B.tw * 0.9, B.th * 0.45, B.td, main, 0, torsoY + B.th * 0.2, 0), cyl(0.025, 0.025, B.th * 0.6, METAL(), 0, torsoY - 0.05, -0.02));
      for (let i = 0; i < 3; i++) add(upper, box(B.tw * 0.7, 0.012, B.td * 0.9, METAL(), 0, torsoY - 0.05 - i * 0.04, 0.005));
      add(upper, sph(0.025, eye, 0, torsoY + B.th * 0.18, B.td * 0.52));
    } else {
      // A sculpted torso: a broad chest over a narrower abdomen, so the waist reads.
      const torsoM = L.body === 'guard' && !L.carapace && !L.coat ? cloth : main;
      add(upper, tbox(B.tw, B.th * 0.62, B.td, torsoM, 0, torsoY + B.th * 0.19, 0, 0.82),
        tbox(B.tw * 0.8, B.th * 0.46, B.td * 0.88, torsoM, 0, torsoY - B.th * 0.24, 0.005, 0.9));
      if (L.body === 'marine' && !L.scout) for (let i = 0; i < 3; i++) add(upper, box(B.tw * 0.62, B.th * 0.1, B.td * 0.92, torsoM, 0, torsoY - B.th * (0.1 + i * 0.12), 0.01)); // ribbed abdominal plates
      if (plated && torsoM === main) add(upper, tbox(B.tw * 0.86, 0.012 * k, B.td * 0.94, seam, 0, torsoY - B.th * 0.12, 0.004, 0.86)); // seam under the chest plate
      if (L.coat) add(upper, box(0.018 * k, B.th * 0.62, 0.01, seam, 0, torsoY + B.th * 0.06, B.td * 0.54), ...[0, 1, 2, 3].map((i) => sph(0.009 * k, BRASS(), 0.03 * k, torsoY + B.th * (0.3 - i * 0.14), B.td * 0.555, 6, 4)),
        ...[0, 1, 2, 3].map((i) => sph(0.009 * k, BRASS(), -0.03 * k, torsoY + B.th * (0.3 - i * 0.14), B.td * 0.555, 6, 4))); // coat closure with two rows of buttons
      // Neck.
      add(upper, cyl(B.head * 0.42, B.head * 0.5, B.head * 0.6, L.body === 'marine' || L.body === 'battlesuit' ? DARK() : skin, 0, hipY + B.th + B.head * 0.15, 0));
      if ((L.body === 'marine' || L.body === 'sister') && !(L.refined && L.body==='marine' && !L.chaos)) add(upper, box(B.tw * 0.7, B.th * 0.35, 0.03, trim, 0, torsoY + B.th * 0.18, B.td / 2 + 0.01));
      if (L.body === 'marine' && !L.scout) add(upper, ...[-1, 1].map((s) => box(B.tw * 0.28, 0.025, 0.02, trim, s * B.tw * 0.18, torsoY + B.th * 0.28, B.td / 2 + 0.03)));
      if (L.carapace || L.body === 'tau' || L.body === 'votann') add(upper, box(B.tw * 1.04, B.th * 0.5, B.td * 1.1, main, 0, torsoY + B.th * 0.18, 0));
      if (L.body === 'guard' && !L.carapace) add(upper, box(B.tw * 1.02, B.th * 0.45, B.td * 1.08, mat(L.main, { rough: 0.7 }), 0, torsoY + B.th * 0.15, 0));
      if (L.bloated) add(upper, sph(B.tw * 0.55, skin, 0, torsoY - B.th * 0.12, B.td * 0.3, 10, 8));
      if (L.plague) add(upper, sph(B.tw * 0.42, mat('#c8b890', { rough: 0.9 }), 0, torsoY - B.th * 0.15, B.td * 0.35, 10, 8), ...[0, 1, 2].map((i) => cone(0.02, 0.07, BRASS(), (i - 1) * 0.07, torsoY + B.th * 0.4, -B.td * 0.4)));
      if (L.harlequin) for (let i = 0; i < 4; i++) add(upper, aimY(box(0.05, 0.05, 0.01, mat(i % 2 ? L.trim : '#2a2a2a'), (i % 2 ? 1 : -1) * 0.04, torsoY - 0.06 + Math.floor(i / 2) * 0.1, B.td / 2 + 0.006), V(0, 1, 0)).rotateZ(Math.PI / 4));
      if (L.body === 'ork') add(upper, box(B.tw * 0.9, B.th * 0.35, 0.04, L.armoured ? mat(L.main, { metal: 0.5 }) : cloth, 0, torsoY + B.th * 0.12, B.td / 2 + 0.01));
      if (L.body === 'battlesuit') add(upper, box(B.tw * 0.7, B.th * 0.5, 0.05, mat(L.trim), 0, torsoY + B.th * 0.12, B.td / 2 + 0.01), sph(0.025, eye, 0, torsoY + B.th * 0.12, B.td / 2 + 0.045));
      if (L.body === 'vespid') {
        // As on the official miniatures: a slender segmented tail curling down and forward under the body,
        // between the legs, ending in a small stinger.
        const ridge = mat('#b84e10', { rough: 0.5 }), n = 9;
        const P = [V(0, hipY + 0.02, -B.td * 0.45), V(0, hipY - 0.2 * k, -B.td * 1.1), V(0, hipY - 0.45 * k, -B.td * 0.3), V(0, hipY - 0.38 * k, 0.12 * k)];
        const bez = (t) => { const u = 1 - t; return V().addScaledVector(P[0], u * u * u).addScaledVector(P[1], 3 * u * u * t).addScaledVector(P[2], 3 * u * t * t).addScaledVector(P[3], t * t * t); };
        let prev = bez(0);
        for (let i = 1; i <= n; i++) {
          const p = bez(i / n), r = B.tw * (0.3 - (i / n) * 0.22);
          add(upper, limb(prev, p, r * 0.9, i % 2 ? main : ridge, r), sph(r * 1.05, i % 2 ? ridge : main, p.x, p.y, p.z, 8, 6));
          prev = p;
        }
        const dir = V().subVectors(bez(1), bez(0.9)).normalize();
        add(upper, aimY(cone(0.018 * k, 0.1 * k, mat('#2a1408', { rough: 0.4 }), prev.x + dir.x * 0.05 * k, prev.y + dir.y * 0.05 * k, prev.z + dir.z * 0.05 * k, 6), dir));
      }
    }
    // Skirts: robes reach the ground, coats reach the knees, marines and sisters have tassets.
    const robe = L.robe || L.body === 'skitarii' && !L.sicarian && !L.servitor || (L.body === 'sister' && L.robe) || L.hood && L.body === 'guard' && L.robe;
    if (robe) add(upper, cyl(B.tw * 0.5, B.tw * 0.75, hipY * 0.9, cloth, 0, hipY * 0.55, 0, 10));
    else if (L.coat || L.cloak && L.body === 'guard') add(upper, cyl(B.tw * 0.52, B.tw * 0.68, hipY * 0.55, L.coat ? mat(L.main, { rough: 0.9 }) : cloth, 0, hipY * 0.72, -0.01, 10),
      ...(L.coat ? [cyl(B.tw * 0.685, B.tw * 0.685, 0.02 * k, seam, 0, hipY * 0.46, -0.01, 10), box(0.014 * k, hipY * 0.5, 0.01, seam, 0, hipY * 0.72, B.tw * 0.6)] : [])); // hem band and the front opening of the coat
    else if (L.rags || L.body === 'gor' || L.body === 'kroot') add(upper, box(B.tw * 0.5, hipY * 0.4, 0.02, cloth, 0, hipY * 0.8, B.td * 0.42));
    else if (L.body === 'marine' || L.body === 'sister' || L.body === 'eldar') add(upper, ...[-1, 1].map((s) => box(B.tw * 0.36, hipY * 0.28, B.td * 0.9, main, s * B.tw * 0.25, hipY * 0.86, 0)));
    if (L.body === 'sister' && !L.robe) add(upper, box(B.tw * 0.45, hipY * 0.6, 0.02, cloth, 0, hipY * 0.68, B.td * 0.48));
    if (L.float) add(upper, cone(B.tw * 0.7, hipY, mat(L.cloth, { rough: 0.9 }), 0, hipY / 2, 0, 8));
    add(fig, upper);

    // Head.
    const shY = hipY + B.th * 0.92, headY = hipY + B.th + B.head * 0.85 + 0.015 - hunch * 0.6;
    const head = new THREE.Group();
    head.position.set(0, headY, hunch * 2.2 + (L.body === 'marine' ? 0.01 : 0));
    buildHead(head, L, B, { main, trim, cloth, skin, eye, k });
    add(fig, head);

    // Shoulders and back.
    const shoulders = [-1, 1].map((s) => V(s * B.sx, shY, hunch));
    addShoulders(upper, L, B, shoulders, { main, trim, cloth, k });
    addBack(upper, L, B, { main, trim, cloth, torsoY, k, op });

    // Arms and weapons.
    poseArms(fig, L, B, shoulders, picks, { limbMat, main, trim, skin, k });
    if (L.body === 'vespid') addWings(fig, L, B, torsoY, k);
    if (L.hybrid && /patriarch/i.test(L.name)) {
      for (const s of [-1, 1]) {
        const sh = V(s * B.sx * 0.9, shY - 0.12, hunch + 0.02), hand = V(s * B.sx * 1.6, shY - 0.2, 0.3);
        add(fig, limb(sh, hand, B.armR * 0.9, skin), ...[-1, 0, 1].map((i) => aimY(box(0.01, 0.12, 0.02, mat('#e8dcc0'), hand.x + i * 0.02, hand.y + 0.04, hand.z + 0.04), V(0, 0.6, 1))));
      }
    }
    if (L.body === 'gor' && !L.bird) add(fig, limb(V(0, hipY, -B.td * 0.4), V(0, hipY * 0.6, -B.td * 1.2), 0.012, skin));
    details.body({ fig, upper, head, L, B, k, hipY, torsoY, shY, headY, hunch, front: B.td / 2, back: -B.td / 2, M: { main, trim, cloth, skin, eye }, op, picks });
    refinements.body({fig,upper,head,L,B,k,hipY,torsoY,shY,M:{main,trim,cloth,skin,eye}});
    fig.userData.humanoid = true;
    fig.userData.headTop = (headY + B.head) / k; // stature (top of head) at size 1, for scaling to the miniatures' heights
    return fig;
  }

  function buildHead(h, L, B, c) {
    if(refinements.head(h,L,B,c))return;
    const r = B.head;
    const lens = (x, y, z, rr = r * 0.18) => {const eye=sph(rr,c.eye,x,y,z,6,4);if(L.refined)eye.scale.set(1,.60,.65);return eye;};
    const body = L.body;
    if (L.refined && body==='marine' && !L.scout && !L.chaos) {
      // A brow and recessed lenses give the helmet a face rather than two round eyes on a ball.
      add(h, tbox(r*1.9,r*1.8,r*1.65,c.main,0,0,-r*.08,.87),
        tbox(r*1.5,r*.7,r*.55,DARK(),0,-r*.05,r*.72,.9),
        box(r*1.75,r*.22,r*.35,c.main,0,r*.27,r*.76),
        tbox(r*.9,r*.75,r*.65,c.main,0,-r*.55,r*.65,.68));
      for(const s of [-1,1]) {
        const eye=box(r*.48,r*.14,r*.10,c.eye,s*r*.43,r*.02,r*1.01);eye.rotation.z=-s*.14;add(h,eye);
        add(h,tbox(r*.35,r*.7,r*.65,c.main,s*r*.76,-r*.35,r*.42,.8));
      }
      for(const x of [-.22,0,.22])add(h,box(r*.09,r*.33,r*.07,DARK(),r*x,-r*.55,r*1.0));
      if(L.leader)add(h,box(r*.28,r*.10,r*1.4,c.trim,0,r*.93,-r*.1));
      return;
    }
    if (body === 'marine' && !L.scout && !L.wolf) {
      if (L.rubric || L.batWings || L.chaos) {
        add(h, sph(r, c.main, 0, 0, 0, 10, 8), box(r * 1.2, r * 0.5, r * 0.8, c.main, 0, -r * 0.45, r * 0.35), lens(r * 0.4, r * 0.05, r * 0.85), lens(-r * 0.4, r * 0.05, r * 0.85));
        if (L.rubric) add(h, cone(r * 0.35, r * 2.2, c.trim, 0, r * 1.5, -r * 0.1, 6), box(r * 2.4, r * 0.25, r * 0.15, c.trim, 0, r * 0.4, 0));
        else if (L.batWings) add(h, ...[-1, 1].map((s) => aimY(cone(r * 0.3, r * 1.6, c.main, s * r * 1.0, r * 0.7, -r * 0.1, 4), V(s * 0.6, 1, -0.2))));
        else if (L.plague) add(h, cone(r * 0.2, r * 1.0, c.trim, 0, r * 1.0, r * 0.4, 5));
        else add(h, ...[-1, 1].map((s) => aimY(cone(r * 0.18, r * 1.4, mat('#d8d0b8'), s * r * 0.9, r * 0.6, 0, 6), V(s * 0.8, 1, 0.3))));
        if (L.leader && !L.rubric) add(h, ...[-1, 1].map((s) => aimY(cone(r * 0.2, r * 1.1, c.trim, s * r * 0.6, r * 0.9, -r * 0.2, 6), V(s * 0.3, 1, -0.3))));
      } else {
        // Mk X helmet: dome, face plate, grille and red lenses.
        add(h, sph(r, c.main, 0, 0, 0, 10, 8), box(r * 1.2, r * 0.9, r * 0.6, c.main, 0, -r * 0.25, r * 0.6), box(r * 0.5, r * 0.35, r * 0.2, DARK(), 0, -r * 0.5, r * 0.95),
          lens(r * 0.38, r * 0.05, r * 0.92), lens(-r * 0.38, r * 0.05, r * 0.92));
        if (L.phobos) add(h, box(r * 0.9, r * 0.3, r * 0.3, DARK(), 0, -r * 0.4, r * 0.95));
        if (L.leader) add(h, box(r * 0.25, r * 0.5, r * 1.8, c.trim, 0, r * 0.95, -r * 0.1));
      }
      if (L.team === 'deathwatch') add(h, box(r * 0.25, r * 0.15, r * 0.8, c.trim, 0, r * 0.95, 0));
      return;
    }
    switch (body) {
      case 'guard': case 'sister': case 'skitarii': case 'ratling': case 'ogryn': case 'marine': {
        const skull = L.refined ? tbox(r*1.78,r*1.95,r*1.65,c.skin,0,0,0,.84) : sph(r, c.skin, 0, 0, 0, 10, 8); if(!L.refined)skull.scale.set(0.92, 1.05, 1);
        add(h, skull, sph(r * 0.32, c.skin, 0, -r * 0.62, r * 0.55, 10, 8), box(r * 0.22, r * 0.34, r * 0.3, c.skin, 0, -r * 0.08, r * 0.92)); // skull, jaw, nose
        if (!L.gasmask && !L.visor && !L.mask && !L.hood && !L.servitor && body !== 'skitarii') add(h, ...[-1, 1].map((s) => sph(r * 0.11, mat('#1e1612', { rough: 0.3 }), s * r * 0.36, r * 0.1, r * 0.86, 8, 6)), ...[-1, 1].map((s) => box(r * 0.34, r * 0.08, r * 0.1, mat('#3a2a20'), s * r * 0.36, r * 0.3, r * 0.88)), ...[-1, 1].map((s) => sph(r * 0.18, c.skin, s * r * 0.92, 0, 0, 8, 6))); // eyes, brows, ears
        if (L.servitor) { add(h, sph(r * 1.02, METAL(), 0, r * 0.15, -r * 0.1, 8, 6), lens(r * 0.4, 0, r * 0.85, r * 0.25), cyl(r * 0.15, r * 0.15, r * 0.8, DARK(), 0, -r * 0.9, -r * 0.4)); return; }
        if (body === 'skitarii') { add(h, sph(r * 1.25, c.cloth, 0, r * 0.15, -r * 0.2, 10, 8), box(r * 1.3, r * 1.2, r * 0.3, DARK(), 0, -r * 0.05, r * 0.85), lens(r * 0.35, r * 0.1, r * 1.0), lens(-r * 0.35, r * 0.1, r * 1.0)); return; }
        if (L.wolf) add(h, sph(r * 1.05, mat('#c8642a'), 0, r * 0.2, -r * 0.15, 8, 6), cone(r * 0.7, r * 1.0, mat('#c8642a'), 0, -r * 0.75, r * 0.5, 6));
        if (L.gasmask) add(h, box(r * 1.15, r * 0.9, r * 0.6, DARK(), 0, -r * 0.2, r * 0.6), cyl(r * 0.3, r * 0.3, r * 0.4, DARK(), 0, -r * 0.6, r * 1.0), lens(r * 0.4, r * 0.05, r * 0.95), lens(-r * 0.4, r * 0.05, r * 0.95));
        if (L.visor) add(h, box(r * 1.3, r * 0.4, r * 0.8, DARK(), 0, -r * 0.1, r * 0.55), box(r * 1.1, r * 0.18, r * 0.1, c.eye, 0, 0, r * 0.98), box(r * 1.2, r * 0.5, r * 0.6, c.main, 0, -r * 0.65, r * 0.55));
        if (L.goggles) add(h, lens(r * 0.4, r * 0.1, r * 0.9, r * 0.25), lens(-r * 0.4, r * 0.1, r * 0.9, r * 0.25));
        if (L.mask) add(h, box(r * 1.2, r * 1.2, r * 0.5, mat('#c9a227', { metal: 0.8 }), 0, -r * 0.1, r * 0.7), ...[-1, 1].map((s) => aimY(cone(r * 0.15, r * 1.0, BRASS(), s * r * 0.8, r * 0.6, 0, 6), V(s, 1, 0))));
        if (L.hybrid) add(h, sph(r * 1.15, c.skin, 0, r * 0.35, -r * 0.3, 8, 6), ...[0, 1, 2].map((i) => box(r * 0.2, r * 0.15, r * 1.4, mat('#5a3a6a'), 0, r * 0.9 - i * r * 0.3, -r * 0.3 - i * 0.02)));
        if (L.hood) add(h, sph(r * 1.3, c.cloth, 0, r * 0.2, -r * 0.25, 10, 8), box(r * 1.1, r * 1.0, r * 0.3, DARK(), 0, -r * 0.05, r * 0.75), lens(r * 0.35, r * 0.05, r * 0.9, r * 0.12), lens(-r * 0.35, r * 0.05, r * 0.9, r * 0.12));
        else if (L.void) add(h, sph(r * 1.3, mat('#a8d8f0', { opacity: 0.45, rough: 0.1 }), 0, 0, r * 0.1, 10, 8));
        else if (body === 'sister') add(h, sph(r * 1.08, mat(L.hair || '#e8e8e8'), 0, r * 0.1, -r * 0.15, 10, 8), box(r * 2, r * 0.5, r * 1.2, mat(L.hair || '#e8e8e8'), 0, -r * 0.55, -r * 0.4));
        else if (L.peakedCap) add(h, cyl(r * 1.05, r * 1.0, r * 0.45, c.main, 0, r * 0.75, 0, 12), cyl(r * 1.3, r * 1.3, r * 0.12, c.main, 0, r * 0.98, 0, 12), box(r * 1.2, r * 0.06, r * 0.6, DARK(), 0, r * 0.55, r * 0.8), box(r * 0.5, r * 0.15, r * 0.05, mat('#c9ccd1', { metal: 0.8 }), 0, r * 0.82, r * 1.05));
        else if (L.coat && L.gasmask) add(h, sph(r * 1.15, c.main, 0, r * 0.25, 0, 10, 6), cone(r * 0.12, r * 0.6, METAL(), 0, r * 1.45, 0, 6), cyl(r * (L.refined?1.22:1.6), r * (L.refined?1.22:1.6), r * 0.08, c.main, 0, r * 0.1, 0, 12));
        else if (L.carapace || L.helmet || body === 'ogryn' && !L.bare) add(h, sph(r * 1.12, c.main, 0, r * 0.25, -r * 0.05, 10, 6), cyl(r * (L.refined?1.1:1.25), r * (L.refined?1.1:1.25), r * 0.08, c.main, 0, r * 0.05, 0, 12));
        else if (body === 'ratling') add(h, cyl(r * 0.9, r * 1.1, r * 0.5, c.cloth, 0, r * 0.8, 0, 10), cyl(r * 1.5, r * 1.5, r * 0.05, c.cloth, 0, r * 0.55, 0, 12));
        else if (L.rags) add(h, sph(r * 1.08, mat('#3a2a24'), 0, r * 0.25, -r * 0.1, 8, 6));
        else if (L.scout) add(h, sph(r * 1.03, mat('#3a2a20'), 0, r * 0.3, -r * 0.15, 8, 6));
        if (L.leader && (L.coat || L.bare) && !L.gasmask) add(h, cyl(r * 1.0, r * 1.15, r * 0.5, c.main, 0, r * 0.9, 0, 10), cyl(r * 1.4, r * 1.4, r * 0.05, c.main, 0, r * 0.7, 0, 12));
        break;
      }
      case 'eldar': {
        if (L.mandrake) {
          add(h, sph(r, c.skin, 0, 0, 0, 10, 8), lens(r * 0.4, 0, r * 0.85), lens(-r * 0.4, 0, r * 0.85), ...[0, 1, 2].map((i) => limb(V(0, r * 0.5, -r * 0.5), V((i - 1) * r * 1.2, -r * 2.5, -r * 2), r * 0.15, mat('#e8e8f0'))));
          break;
        }
        add(h, sph(r, c.main, 0, 0, r * 0.1, 10, 8), cone(r * 0.6, r * 1.0, c.main, 0, -r * 0.3, r * 0.75, 6).rotateX(Math.PI / 2), lens(r * 0.4, r * 0.1, r * 0.85, r * 0.22), lens(-r * 0.4, r * 0.1, r * 0.85, r * 0.22));
        if (L.harlequin) add(h, box(r * 1.4, r * 1.4, r * 0.1, mat('#e8e8e8', { metal: 0.6, rough: 0.2 }), 0, 0, r * 0.95), cone(r * 0.4, r * 1.2, c.trim, 0, r * 1.2, -r * 0.2, 6));
        else if (L.drukhari) add(h, ...[-1, 0, 1].map((s) => aimY(cone(r * 0.15, r * 1.4, c.trim, s * r * 0.6, r * 0.8, -r * 0.3, 4), V(s * 0.4, 1, -0.6))));
        else if (L.aspectKind === 'banshee') add(h, limb(V(0, r * 0.8, -r * 0.2), V(0, -r * 2.5, -r * 2.2), r * 0.35, mat('#e8e0d0'), r * 0.15));
        else if (L.aspectKind === 'scorpion') add(h, ...[-1, 1].map((s) => cyl(r * 0.2, r * 0.2, r * 0.8, c.trim, s * r * 0.6, -r * 0.6, r * 0.7)), cone(r * 0.25, r * 1.2, c.trim, 0, r * 1.1, 0, 6));
        else add(h, box(r * 0.25, r * 0.6, r * 2.2, L.leader ? mat('#e8c040') : c.trim, 0, r * 1.05, -r * 0.2));
        break;
      }
      case 'tau': {
        if(L.refined){
          add(h,tbox(r*1.95,r*1.65,r*1.8,c.main,0,0,-r*.08,.85),
            tbox(r*1.55,r*.42,r*.3,DARK(),0,-r*.13,r*.88,.85),
            lens(r*.28,-r*.1,r*1.08,r*.22),
            box(r*.12,r*.8,r*.18,c.trim,-r*.90,r*.5,-r*.15));
          break;
        }
        add(h, sph(r, c.main, 0, 0, 0, 10, 8), box(r * 2.0, r * 0.35, r * 1.4, c.main, 0, -r * 0.2, -r * 0.1), box(r * 1.1, r * 0.4, r * 0.4, DARK(), 0, 0, r * 0.85),
          lens(r * 0.3, 0.0, r * 1.05), lens(-r * 0.3, 0.0, r * 1.05), cyl(r * 0.25, r * 0.25, r * 0.4, DARK(), r * 1.0, 0, r * 0.3));
        break;
      }
      case 'battlesuit': add(h, box(r * 1.8, r * 1.0, r * 1.6, c.main, 0, 0, 0), lens(0, 0, r * 0.85, r * 0.35), box(r * 0.2, r * 0.9, r * 0.2, DARK(), r * 0.9, r * 0.9, -r * 0.4)); break;
      case 'kroot': {
        add(h, sph(r * 0.9, c.skin, 0, 0, 0, 8, 6), aimZ(cone(r * 0.4, r * 1.8, mat('#c8b890'), 0, -r * 0.2, r * 1.2, 6), V(0, -0.3, 1).normalize(), UP).rotateX(Math.PI / 2), lens(r * 0.4, r * 0.2, r * 0.6), lens(-r * 0.4, r * 0.2, r * 0.6));
        for (let i = 0; i < 5; i++) add(h, limb(V(0, r * 0.5, -r * 0.3), V((i - 2) * r * 0.5, r * (1.2 + (i % 2) * 0.4), -r * 1.8), r * 0.12, mat(L.cloth), r * 0.04));
        break;
      }
      case 'ork': {
        const sk = c.skin;
        add(h, sph(r, sk, 0, 0, 0, 10, 8), box(r * 1.5, r * 0.7, r * 1.0, sk, 0, -r * 0.55, r * 0.55), lens(r * 0.4, r * 0.15, r * 0.85), lens(-r * 0.4, r * 0.15, r * 0.85),
          ...[-1, 1].map((s) => cone(r * 0.1, r * 0.3, mat('#e8e0c0'), s * r * 0.5, -r * 0.2, r * 1.05, 4)));
        if (L.grot) add(h, ...[-1, 1].map((s) => aimY(cone(r * 0.35, r * 1.4, sk, s * r * 1.2, r * 0.3, 0, 4), V(s, 0.4, 0))), cone(r * 0.25, r * 0.8, sk, 0, 0, r * 1.2, 5).rotateX(Math.PI / 2));
        else if (L.armoured || L.leader) add(h, sph(r * 1.05, mat(L.trim, { metal: 0.6 }), 0, r * 0.35, -r * 0.1, 8, 6), cone(r * 0.12, r * 0.6, METAL(), 0, r * 1.3, 0, 5));
        else add(h, mesh(new THREE.TorusGeometry(r * 0.95, r * 0.14, 5, 14), mat(L.team === 'kommandos' ? '#a82a24' : '#2a2a2a', { rough: 0.9 }), 0, r * 0.35, 0).rotateX(Math.PI / 2 - 0.15), L.team === 'kommandos' ? box(r * 0.25, r * 0.6, r * 0.08, mat('#a82a24', { rough: 0.9 }), r * 0.3, r * 0.05, -r * 0.95) : null); // bandana (red for Kommandos, with a knot tail)
        break;
      }
      case 'votann': {
        add(h, sph(r, c.skin, 0, 0, 0, 10, 8), cone(r * 0.85, r * 1.6, mat(L.hair || '#e8e8e8'), 0, -r * 1.0, r * 0.55, 8).rotateX(Math.PI));
        if (!L.bare) add(h, sph(r * 1.15, c.main, 0, r * 0.25, -r * 0.05, 10, 6), box(r * 1.6, r * 0.25, r * 0.3, c.trim, 0, r * 0.15, r * 0.95), lens(r * 0.35, r * 0.1, r * 1.0), lens(-r * 0.35, r * 0.1, r * 1.0));
        else add(h, sph(r * 1.03, mat(L.hair || '#c8642a'), 0, r * 0.3, -r * 0.15, 8, 6));
        break;
      }
      case 'necron': {
        add(h, box(r * 1.3, r * 1.5, r * 1.3, c.main, 0, 0, 0), box(r * 1.4, r * 0.25, r * 0.2, c.trim, 0, r * 0.6, r * 0.6), lens(r * 0.35, r * 0.15, r * 0.66, r * 0.22), lens(-r * 0.35, r * 0.15, r * 0.66, r * 0.22));
        if (L.leader || L.float) add(h, ...[-1, 1].map((s) => box(r * 0.4, r * 1.8, r * 1.0, c.trim, s * r * 0.85, -r * 0.3, -r * 0.2)));
        break;
      }
      case 'gor': {
        if (L.bird) {
          add(h, sph(r, c.skin, 0, 0, 0, 8, 6), cone(r * 0.4, r * 1.6, mat('#e8c040'), 0, -r * 0.2, r * 1.1, 4).rotateX(Math.PI / 2), lens(r * 0.5, r * 0.2, r * 0.6), lens(-r * 0.5, r * 0.2, r * 0.6),
            cone(r * 0.3, r * 1.5, mat('#e8c040'), 0, r * 1.1, -r * 0.3, 4));
        } else {
          add(h, sph(r, c.skin, 0, 0, 0, 8, 6), box(r * 0.8, r * 0.7, r * 1.2, c.skin, 0, -r * 0.35, r * 0.75), lens(r * 0.45, r * 0.2, r * 0.75), lens(-r * 0.45, r * 0.2, r * 0.75),
            ...[-1, 1].map((s) => aimY(cone(r * 0.25, r * 1.8, mat('#d8ccb0'), s * r * 0.9, r * 0.8, -r * 0.2, 6), V(s * 0.9, 1, -0.6))));
        }
        break;
      }
      case 'vespid': {
        // As on the official miniatures: a long, narrow insect skull leaning forward, slanted dark eyes,
        // small mandibles, and a pair of curved, branching antler-like antennae sweeping up and back.
        const shell = mat(L.main, { rough: 0.45 }), ridge = mat('#b84e10', { rough: 0.5 }), dark = mat('#1e0a04', { metal: 0.4, rough: 0.2 });
        const skull = sph(r * 0.8, shell, 0, r * 0.1, 0, 12, 10); skull.scale.set(0.85, 1.55, 1.05); skull.rotation.x = 0.35;
        const snout = sph(r * 0.45, shell, 0, -r * 0.75, r * 0.45, 10, 8); snout.scale.set(0.8, 1.2, 0.9);
        add(h, skull, snout, box(r * 0.12, r * 1.4, r * 0.12, ridge, 0, r * 0.35, r * 0.62).rotateX(0.35)); // crest ridge down the face
        for (const s of [-1, 1]) {
          const e = sph(r * 0.24, dark, s * r * 0.38, -r * 0.15, r * 0.68, 8, 6); e.scale.set(0.7, 1.4, 0.6); e.rotation.z = s * 0.5;
          add(h, e, sph(r * 0.06, c.eye, s * r * 0.36, -r * 0.1, r * 0.83, 4, 3));
          add(h, aimY(cone(r * 0.08, r * 0.4, dark, s * r * 0.18, -r * 1.2, r * 0.6, 5), V(-s * 0.6, -1, 0.3))); // mandible
          // Antler: a main curved horn with one branch.
          const a0 = V(s * r * 0.3, r * 1.0, r * 0.1), a1 = V(s * r * 0.6, r * 1.9, -r * 0.4), a2 = V(s * r * 0.55, r * 2.6, -r * 1.2), b1 = V(s * r * 1.0, r * 2.2, -r * 0.1);
          add(h, limb(a0, a1, r * 0.09, shell, r * 0.07), limb(a1, a2, r * 0.07, shell, r * 0.03), limb(a1, b1, r * 0.05, shell, r * 0.02));
        }
        break;
      }
      default: add(h, sph(r, c.skin, 0, 0, 0));
    }
  }

  function addShoulders(p, L, B, sh, c) {
    const sx = B.sx, y = sh[0].y;
    if (L.refined && L.body==='marine' && !L.scout) {
      sh.forEach((s,i)=>{
        const side=i?1:-1,x=s.x+side*.018*c.k,r=B.armR;
        const armour=L.silverArm&&side===1?mat('#c9ccd1',{metal:.75,rough:.4}):c.main;
        // Overlapping shells create a curved armour edge instead of a flat mushroom brim.
        add(p,tbox(r*4.25,r*3.25,r*4.35,c.trim,x,y-r*.12,s.z,.92),
          tbox(r*4.05,r*3.05,r*4.55,armour,x,y+r*.12,s.z,.91));
        const edge=mat(L.trim,{metal:.25,rough:.65});
        add(p,box(r*2.7,r*.12,r*.14,edge,x,y+r*1.6,s.z+r*1.55));
        if(L.chaos&&!L.plague)for(const j of [-1,1])add(p,cone(.018*c.k,.09*c.k,c.trim,x,y+r*2,s.z+j*.03*c.k,5));
      });
    } else if (L.body === 'marine' && !L.scout) {
      sh.forEach((s, i) => {
        const side = i ? 1 : -1, pm = L.silverArm && side === 1 ? mat('#c9ccd1', { metal: 0.8, rough: 0.3 }) : c.main;
        const pad = mesh(new THREE.SphereGeometry(B.armR * 2.3, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), pm, s.x + side * 0.02, y - 0.01, s.z);
        pad.scale.set(1, 0.9, 1.05);
        add(p, pad, cyl(B.armR * 2.32, B.armR * 2.32, 0.025, c.trim, s.x + side * 0.02, y - 0.015, s.z, 12));
        if (L.chaos && !L.plague) add(p, ...[0, 1].map((j) => cone(0.018, 0.09, c.trim, s.x + side * 0.04, y + B.armR * 1.6, s.z + (j - 0.5) * 0.06, 5)));
      });
    } else if (L.body === 'tau' || L.body === 'battlesuit' || L.carapace || L.body === 'sister' || L.body === 'votann' || L.armoured || L.drukhari || L.aspect || L.body === 'ogryn') {
      const r = L.body === 'battlesuit' ? B.armR * 2 : B.armR * 1.6;
      sh.forEach((s, i) => {
        const side = i ? 1 : -1;
        const pad = box(r * 1.6, r * 0.5, r * 1.8, c.main, s.x + side * r * 0.25, y + r * 0.1, s.z);
        pad.rotation.z = side * 0.35;
        add(p, pad);
        if (L.drukhari) add(p, cone(0.012, 0.09, c.trim, s.x + side * r * 0.5, y + r * 0.5, s.z));
      });
    } else if (L.wolf) {
      add(p, box(sx * 2.4, 0.07, B.td * 1.4, mat('#8a8c88', { rough: 1 }), 0, y + 0.01, -0.01));
    } else if (L.scout) {
      sh.forEach((s, i) => add(p, box(B.armR * 2.6, B.armR * 0.8, B.armR * 2.8, c.main, s.x + (i ? 1 : -1) * 0.01, y + 0.01, s.z)));
    } else if (L.body !== 'necron' && L.body !== 'kroot' && L.body !== 'gor' && L.body !== 'vespid') {
      sh.forEach((s) => add(p, sph(B.armR * 1.25, L.body === 'ork' && L.armoured ? mat(L.main, { metal: 0.5 }) : c.main, s.x, y, s.z, 8, 6)));
    }
    if (L.body === 'necron') sh.forEach((s, i) => add(p, box(B.armR * 3.2, B.armR * 1.2, B.armR * 3.2, c.main, s.x + (i ? 1 : -1) * 0.01, y + 0.02, s.z)));
    if (L.body === 'gor' || L.body === 'kroot') add(p, box(sx * 2.2, 0.06, B.td * 1.1, mat('#8a8a8a', { metal: 0.6 }), 0, y + 0.01, 0));
  }

  function addBack(p, L, B, c) {
    const y = c.torsoY, back = -B.td / 2;
    const k = c.k;
    if (L.body === 'marine' && !L.scout && !L.phobos || L.body === 'marine' && L.phobos && !L.cloak) {
      add(p, box(B.tw * 0.85, B.th * 0.75, 0.1 * k, c.main, 0, y + 0.06, back - 0.05 * k));
      if (L.jump) add(p, ...[-1, 1].map((s) => tz(cyl(0.05 * k, 0.04 * k, 0.24 * k, DARK(), s * 0.08 * k, y + 0.1, back - 0.15 * k)).rotateX(-Math.PI / 2)),
        ...[-1, 1].map((s) => cone(0.04 * k, 0.12 * k, glow('#ff8a1a'), s * 0.08 * k, y - 0.08, back - 0.15 * k).rotateX(Math.PI)),
        ...[-1, 1].map((s) => aimY(box(0.02, 0.32 * k, 0.12 * k, c.main, s * 0.17 * k, y + 0.25, back - 0.12 * k), V(s * 0.5, 1, -0.3))));
      else add(p, ...[-1, 1].map((s) => cyl(0.03 * k, 0.03 * k, 0.1 * k, DARK(), s * 0.07 * k, y + B.th * 0.5, back - 0.06 * k)));
    }
    if (L.batWings) add(p, ...[-1, 1].map((s) => aimY(box(0.015, 0.36, 0.14, mat('#1a1a2e'), s * 0.14, y + 0.2, back - 0.12), V(s * 0.8, 1, -0.5))));
    if (L.body === 'battlesuit') add(p, box(B.tw * 0.8, B.th * 0.7, 0.12, c.main, 0, y + 0.04, back - 0.06), ...[-1, 1].map((s) => cone(0.04, 0.1, glow('#3ae0ff'), s * 0.09, y - 0.2, back - 0.08).rotateX(Math.PI)));
    if (L.body === 'tau' || L.body === 'votann') add(p, box(B.tw * 0.7, B.th * 0.55, 0.08, DARK(), 0, y + 0.03, back - 0.04));
    if (L.body === 'skitarii' && !L.servitor) add(p, cyl(0.035, 0.035, B.th * 0.8, BRASS(), 0, y + 0.05, back - 0.04), sph(0.03, glow('#3aff6a'), 0, y + B.th * 0.48, back - 0.04));
    if (L.vox) add(p, box(B.tw * 0.6, B.th * 0.55, 0.09 * k, DARK(), 0, y + 0.02, back - 0.05 * k - (L.body === 'marine' ? 0.1 * k : 0)), cyl(0.005, 0.005, 0.6 * k, METAL(), B.tw * 0.25, y + 0.35 * k, back - 0.08 * k), sph(0.012, glow('#ff3a2a'), B.tw * 0.25, y + 0.65 * k, back - 0.08 * k));
    if (L.medic) add(p, box(B.tw * 0.55, B.th * 0.45, 0.08 * k, mat('#e8e8e8'), 0, y + 0.02, back - 0.05 * k - (L.body === 'marine' ? 0.1 * k : 0)), box(0.1 * k, 0.025 * k, 0.01, mat('#c02020'), 0, y + 0.02, back - 0.095 * k - (L.body === 'marine' ? 0.1 * k : 0)), box(0.025 * k, 0.1 * k, 0.01, mat('#c02020'), 0, y + 0.02, back - 0.095 * k - (L.body === 'marine' ? 0.1 * k : 0)));
    if (L.icon) {
      add(p, cyl(0.008, 0.008, 1.0 * k, BRASS(), B.tw * 0.3, y + 0.25 * k, back - 0.1), box(0.22 * k, 0.28 * k, 0.01, mat(L.cloth), B.tw * 0.3 + 0.11 * k, y + 0.55 * k, back - 0.1), sph(0.03 * k, BRASS(), B.tw * 0.3, y + 0.77 * k, back - 0.1));
    }
    if (L.cloak || L.cape || (L.leader && ['marine', 'sister', 'eldar', 'necron'].includes(L.body) && !L.jump)) {
      const ch = B.th + B.leg * 0.8;
      const cl = mesh(new THREE.CylinderGeometry(B.tw * 0.55, B.tw * 0.8, ch, 10, 1, true, Math.PI * 0.65, Math.PI * 0.7),
        mat(L.cloak && !L.leader ? L.cloth : L.leader ? '#8a1e1e' : L.cloth, { rough: 1, side: 'double' }), 0, B.leg * 0.2 + ch / 2, back * 0.2);
      cl.scale.z = 0.7;
      add(p, cl);
    }
    if (L.body === 'ork' && /comms|rokkit|snipa/i.test(L.name) && !L.vox) add(p, box(B.tw * 0.5, B.th * 0.4, 0.08, mat('#5a4a3a'), 0, y, back - 0.04));
  }

  function addWings(fig, L, B, y, k) {
    // As on the official miniatures: two pairs of long, narrow, pale membranes with red veins and teal tips,
    // raised up and back.
    const wm = mat('#efe4c4', { opacity: 0.6, rough: 0.2, side: 'double' }), vein = mat('#c0401a', { rough: 0.5 }), tipM = mat('#3ab8a0', { opacity: 0.7, rough: 0.2, side: 'double' });
    for (const s of [-1, 1]) for (const lo of [0, 1]) {
      const len = (lo ? 0.42 : 0.62) * k, wide = (lo ? 0.09 : 0.12) * k, dir = (lo ? V(s * 0.95, 0.4, -0.7) : V(s * 0.65, 0.9, -0.75)).normalize();
      const root = V(s * 0.05 * k, y + B.th * 0.38 - lo * 0.06 * k, 0.07 * k - B.td * 0.45); // (the torso leans forward by 0.07k)
      const tip = sph(0.5, tipM, root.x + dir.x * len * 0.88, root.y + dir.y * len * 0.88, root.z + dir.z * len * 0.88, 10, 5);
      tip.scale.set(0.014, len * 0.25, wide * 0.7); tip.castShadow = false; aimY(tip, dir, V(s, 0, 0));
      add(fig, tip, ...[0.25, 0.55].map((f) => limb(root.clone().addScaledVector(dir, len * 0.1), root.clone().addScaledVector(dir, len * 0.9).add(V(0, -wide * f * 0.5, 0)), 0.003 * k, vein)));
      const w = sph(0.5, wm, root.x + dir.x * len / 2, root.y + dir.y * len / 2, root.z + dir.z * len / 2, 12, 6); // a leaf-shaped membrane
      w.scale.set(0.012, len, wide);
      w.castShadow = false;
      aimY(w, dir, V(s, 0, 0)); // membrane lies flat (thin side up)
      const edge = root.clone().addScaledVector(dir, len * 0.95);
      add(fig, w, limb(root, edge, 0.005 * k, vein));
    }
  }

  // Arms: two-bone limbs from the shoulders to where the hands hold the weapons.
  function poseArms(fig, L, B, sh, picks, c) {
    const A = B.arm, wk = B.wk, sx = B.sx;
    const [Rs, Ls] = sh; // right shoulder at -x, left at +x
    const sy = Rs.y;
    const handR = { at: null }, handL = { at: null };
    const P = (x, y, z) => V(x * sx, sy + y * A, Rs.z + z * A);
    const { ranged: r, melee: m, shield } = picks;
    const twoHandGun = r && ['rifle', 'sniper', 'heavy', 'launcher', 'flamer', 'shotgun'].includes(r.form);
    const holster = [];
    const place = (obj) => { obj.scale.setScalar(wk); add(fig, obj); return obj; };

    const holdGun = (rr, hand, aim, support) => {
      const { g, fore } = rangedModel(rr, L);
      g.position.copy(hand); aimZ(g, aim); place(g);
      if (support && fore) { const f = toParent(g, fore.clone()); return f; }
      return null;
    };
    const holdMelee = (mm, hand, dir) => { const g = meleeModel(mm, L); g.position.copy(hand); aimY(g, dir, V(dir.x < 0 ? -1 : 1, 0, 1)); place(g); return g; };
    const wearFist = (mm, hand, dir) => { const g = meleeModel(mm, L); g.position.copy(hand); aimZ(g, dir); place(g); return g; };

    if (L.body === 'battlesuit' && r) {
      // Battlesuit guns sit on the forearm; the off-hand is free.
      handR.at = P(-0.9, -0.55, 0.55); holdGun(r, handR.at, V(0.05, 0, 1));
      handL.at = P(1.0, -0.65, 0.4);
    } else if (twoHandGun) {
      if (r.form === 'launcher') { handR.at = P(-0.75, -0.08, 0.15); }
      else if (r.form === 'heavy') { handR.at = P(-0.7, -0.62, 0.38); }
      else handR.at = P(-0.55, -0.48, 0.45);
      const aim = r.form === 'heavy' ? V(0.12, 0, 1) : r.form === 'launcher' ? V(0, 0.04, 1) : V(0.22, 0.1, 1);
      const fore = holdGun(r, handR.at, aim, true);
      if (m && (m.form === 'fist' || m.form === 'claws')) { handL.at = fore || P(0.8, -0.5, 0.6); wearFist(m, handL.at, V(0.1, -0.2, 1)); }
      else { handL.at = fore || P(0.8, -0.6, 0.5); if (m) holster.push(m); }
      if (picks.ranged2?.form === 'pistol' && !m) holster.push(picks.ranged2);
    } else if (r && r.form === 'bow') {
      handL.at = P(0.3, 0.02, 0.95);
      const { g } = rangedModel(r, L); g.position.copy(handL.at); aimZ(g, V(0, 0, 1)); place(g);
      handR.at = P(-0.25, 0.05, 0.12);
      if (m) holster.push(m);
    } else if (r && r.form === 'pistol') {
      if (m && m.twoHand) {
        twoHanded(m);
        holster.push(r);
      } else {
        handR.at = P(-1.0, -0.12, 0.85); holdGun(r, handR.at, V(0, 0, 1));
        if (m) {
          if (m.form === 'fist' || m.form === 'claws') { handL.at = P(0.95, -0.45, 0.55); wearFist(m, handL.at, V(0.15, -0.1, 1)); }
          else { handL.at = P(1.2, -0.42, 0.45); holdMelee(m, handL.at, V(0.25, 0.85, 0.45)); }
        } else if (r.dual) { handL.at = P(1.0, -0.12, 0.85); holdGun(r, handL.at, V(0, 0, 1)); }
        else if (shield) { handL.at = P(0.9, -0.45, 0.55); addShield(handL.at); }
        else handL.at = P(1.1, -0.85, 0.15);
      }
    } else if (m) {
      if (m.twoHand) twoHanded(m);
      else if (m.form === 'fist' || m.form === 'claws') {
        handR.at = P(-0.9, -0.38, 0.75); wearFist(m, handR.at, V(-0.05, -0.15, 1));
        handL.at = P(0.95, -0.5, 0.55);
        if (m.dual || m.form === 'claws') wearFist(m, handL.at, V(0.1, -0.2, 1));
      } else {
        handR.at = P(-1.3, 0.18, 0.28); holdMelee(m, handR.at, V(-0.2, 0.9, 0.3));
        if (shield) { handL.at = P(0.9, -0.45, 0.55); addShield(handL.at); }
        else if (m.dual) { handL.at = P(1.25, -0.5, 0.45); holdMelee(m, handL.at, V(0.3, 0.6, 0.7)); }
        else handL.at = P(1.1, -0.85, 0.15);
      }
    } else {
      handR.at = P(-1.0, -0.85, 0.2); handL.at = P(1.0, -0.85, 0.2);
    }
    if (L.psyker && !twoHandGun && handL.at && !m?.dual && !shield && !(r?.form === 'pistol' && m) && !(m?.twoHand)) add(fig, sph(0.045 * wk, glow(L.eye || '#6ac8ff'), handL.at.x, handL.at.y + 0.06, handL.at.z + 0.03));

    function twoHanded(mm) {
      const o = P(-0.2, -0.8, 0.5), dir = V(-0.45, 0.85, 0.25).normalize();
      if (mm.form === 'staff') { handL.at = P(1.25, -0.45, 0.4); holdMelee(mm, handL.at, V(0.05, 1, 0.08)); handR.at = P(-1.0, -0.6, 0.35); return; }
      holdMelee(mm, o, dir);
      handL.at = o.clone().addScaledVector(dir, 0.04 * wk);
      handR.at = o.clone().addScaledVector(dir, 0.13 * wk);
    }
    function addShield(at) {
      const sh2 = box(0.03, 0.34, 0.24, mat(L.trim, { metal: 0.6, rough: 0.4 }), 0, 0, 0);
      const g = group(sh2, box(0.035, 0.1, 0.1, mat(L.main, { metal: 0.4 }), 0, 0.03, 0));
      g.position.copy(at).add(V(0.02 * wk, 0, 0.05 * wk)); g.rotation.y = Math.PI / 2 - 0.25; place(g);
    }

    // Holstered weapons hang at the hips.
    holster.slice(0, 2).forEach((h, i) => {
      const side = i === 0 ? 1 : -1, at = V(side * B.tw * 0.55, B.leg + 0.02, 0.03);
      if (h.form && MELEE_RANK[h.form] != null && h.w.type === 'melee') {
        if (h.form === 'fist' || h.form === 'claws') return;
        const g = meleeModel(h, L); g.position.copy(at); aimY(g, V(side * 0.15, -1, 0.3)); g.scale.setScalar(wk * 0.85); add(fig, g);
      } else {
        const { g } = rangedModel(h, L); g.position.copy(at); aimZ(g, V(0, -1, 0.15), V(0, 0, 1)); g.scale.setScalar(wk * 0.85); add(fig, g);
      }
    });

    fig.userData.hands = { R: handR.at, L: handL.at }; // for team details (cables, leashes)
    for (const [s, h] of [[Rs, handR.at], [Ls, handL.at]]) {
      if (!h) continue;
      const side = s.x < 0 ? -1 : 1;
      const d = s.distanceTo(h), half = A / 2;
      const mid = V().addVectors(s, h).multiplyScalar(0.5);
      const bend = Math.sqrt(Math.max(0, half * half - (d / 2) ** 2));
      const dir = V().subVectors(h, s).normalize();
      const pole = V(side * 0.7, -1, -0.5).normalize();
      const perp = pole.sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
      const elbow = mid.addScaledVector(perp, bend);
      add(fig, limb(s, elbow, B.armR * 1.08, c.limbMat, B.armR * 0.88), limb(elbow, h, B.armR * 0.9, c.limbMat, B.armR * 0.7), sph(B.armR * 1.05, c.limbMat, elbow.x, elbow.y, elbow.z, 6, 5));
      if (L.body === 'marine' || L.body === 'battlesuit' || L.body === 'sister' || L.carapace) add(fig, limb(elbow.clone().lerp(h, 0.25), h, B.armR * 1.2, c.main));
      if (c.limbMat === c.main && (['marine', 'sister', 'battlesuit', 'votann', 'tau'].includes(L.body) || L.carapace || L.armoured)) {
        const sm = seamMat(L.main);
        add(fig, band(s, elbow, 0.3, B.armR * 1.1, sm, c.k), band(elbow, h, 0.27, B.armR * 1.29, sm, c.k), band(elbow, h, 0.9, B.armR * 1.27, sm, c.k)); // upper-arm, vambrace and cuff seams
      }
      if(!refinements.hand(fig,L,B,h,side))add(fig, sph(B.armR * 0.95, L.body === 'marine' || L.body === 'necron' ? c.limbMat : L.body === 'battlesuit' ? c.main : mat(L.body === 'guard' || L.body === 'sister' ? '#2a2a2a' : L.skin || '#d8a888'), h.x, h.y, h.z, 6, 5));
    }
  }

  // ----- non-humanoid models -----
  function beast(op, L) {
    const n = L.name.toLowerCase(), g = new THREE.Group();
    const wolf = /wolf/.test(n), cyber = /mastiff|battlemutt|cyber/.test(n), kroot = /kroot hound/.test(n), lizard = /drakolithe/.test(n);
    const k = wolf ? 1.6 : lizard ? 1.3 : 1;
    const fur = mat(wolf ? '#a88a5a' : kroot ? '#a89878' : lizard ? '#4f8a3c' : cyber ? '#3a3c40' : '#7a5a3a', { metal: cyber ? 0.6 : 0, rough: cyber ? 0.4 : 0.9 });
    const legY = 0.32 * k, bodyL = 0.55 * k;
    const torso = sph(0.17 * k, fur, 0, legY + 0.06 * k, 0, 10, 8); torso.scale.set(0.8, 0.75, bodyL / 0.34 / k);
    add(g, torso);
    for (const [x, z] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
      const top = V(x * 0.08 * k, legY, z * 0.2 * k), knee = V(x * 0.09 * k, legY * 0.45, z * 0.2 * k + (z > 0 ? 0.03 : -0.05) * k), foot = V(x * 0.09 * k, 0.02, z * 0.22 * k + 0.02);
      add(g, limb(top, knee, 0.04 * k, fur), limb(knee, foot, 0.03 * k, fur), box(0.05 * k, 0.03, 0.07 * k, fur, foot.x, 0.015, foot.z + 0.02));
    }
    const neck = V(0, legY + 0.14 * k, 0.28 * k), headP = V(0, legY + 0.22 * k, 0.38 * k);
    add(g, limb(V(0, legY + 0.08 * k, 0.2 * k), neck, 0.07 * k, fur), sph(0.09 * k, fur, headP.x, headP.y, headP.z, 8, 6));
    add(g, tz(cyl(0.04 * k, 0.06 * k, 0.16 * k, kroot ? mat('#c8b890') : fur, 0, headP.y - 0.03 * k, headP.z + 0.1 * k, 8)));
    add(g, ...[-1, 1].map((s) => sph(0.016 * k, glow(cyber ? '#ff3a2a' : kroot ? '#e8c040' : '#ffd040'), s * 0.045 * k, headP.y + 0.03 * k, headP.z + 0.07 * k, 6, 4)));
    if (!kroot && !lizard) add(g, ...[-1, 1].map((s) => cone(0.03 * k, 0.08 * k, fur, s * 0.05 * k, headP.y + 0.09 * k, headP.z - 0.02 * k, 4)));
    if (kroot) for (let i = 0; i < 5; i++) add(g, limb(V(0, headP.y + 0.05, headP.z - 0.03), V((i - 2) * 0.05, headP.y + 0.12, headP.z - 0.22), 0.01, mat('#b9772f'), 0.003));
    add(g, limb(V(0, legY + 0.06 * k, -0.25 * k), V(0, legY + (lizard ? -0.15 : 0.08) * k, -(lizard ? 0.6 : 0.45) * k), 0.035 * k, fur, 0.01));
    if (cyber) add(g, box(0.18, 0.06, 0.3, mat(L.trim, { metal: 0.7 }), 0, legY + 0.18, 0), box(0.03, 0.1, 0.03, glow('#ff3a2a'), 0, legY + 0.24, -0.08));
    if (lizard) add(g, ...[0, 1, 2, 3].map((i) => cone(0.025, 0.08, mat('#d8b04a'), 0, legY + 0.18, 0.15 - i * 0.12)));
    return g;
  }

  function drone(op, L) {
    const n = L.name.toLowerCase(), g = new THREE.Group(), y = 0.75;
    const shell = mat(L.team === 'vespids' ? '#d8d0c0' : '#d8d0c0', { rough: 0.5 }), tc = mat(L.main);
    add(g, cyl(0.008, 0.008, y, mat('#a8d8f0', { opacity: 0.5 }), 0, y / 2, 0));
    const disc = cyl(0.28, 0.3, 0.07, shell, 0, y, 0, 16), dome = mesh(new THREE.SphereGeometry(0.16, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), tc, 0, y + 0.03, 0);
    add(g, disc, dome, cyl(0.31, 0.31, 0.02, tc, 0, y - 0.01, 0, 16), sph(0.03, glow('#3ae0ff'), 0, y + 0.17, 0, 6, 4));
    if (/gun|pulse accelerator|oversight/.test(n)) for (const s of [-1, 1]) { const { g: gun } = rangedModel({ form: 'rifle', flav: 'pulse', n: 'pulse carbine' }, L); gun.position.set(s * 0.12, y - 0.07, 0.05); gun.scale.setScalar(0.9); add(g, gun); }
    else if (/marker|recon|designator/.test(n)) add(g, tz(cyl(0.05, 0.06, 0.12, DARK(), 0, y - 0.04, 0.27)), sph(0.04, glow('#ff3a2a'), 0, y - 0.04, 0.34, 8, 6));
    else if (/shield/.test(n)) add(g, box(0.4, 0.3, 0.02, mat('#6ac8ff', { opacity: 0.45, glow: '#3a8aff' }), 0, y - 0.05, 0.32));
    else if (/grav/.test(n)) add(g, mesh(new THREE.TorusGeometry(0.2, 0.02, 6, 16), glow('#b06aff'), 0, y - 0.07, 0).rotateX(Math.PI / 2));
    if (/recon/.test(n)) add(g, tz(cyl(0.03, 0.03, 0.3, DARK(), 0.15, y + 0.02, 0.1)));
    return g;
  }

  function squig(op, L) {
    const g = new THREE.Group(), red = mat('#d8401a'), y = 0.22;
    add(g, sph(0.24, red, 0, y + 0.1, 0, 12, 10));
    const mouth = mesh(new THREE.SphereGeometry(0.245, 12, 6, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.25), mat('#3a0a0a'), 0, y + 0.1, 0.01);
    add(g, mouth, ...[-1, 1].map((s) => sph(0.04, mat('#f0e040'), s * 0.1, y + 0.25, 0.18, 6, 4)));
    for (let i = 0; i < 6; i++) add(g, cone(0.018, 0.05, mat('#f0ecd0'), (i - 2.5) * 0.05, y + 0.07, 0.22).rotateX(Math.PI));
    for (const s of [-1, 1]) add(g, limb(V(s * 0.1, y, -0.02), V(s * 0.14, 0.02, 0.05), 0.04, red), box(0.08, 0.03, 0.1, red, s * 0.14, 0.015, 0.07));
    if (/bomb/i.test(L.name)) add(g, tz(cyl(0.07, 0.07, 0.22, mat('#3a3a3a', { metal: 0.5 }), 0, y + 0.38, -0.05)), sph(0.02, glow('#ff8a1a'), 0, y + 0.38, 0.08));
    return g;
  }

  function skullDrone(op, L) {
    const g = new THREE.Group(), y = 0.8, bone = mat('#e8dcc0', { rough: 0.8 });
    add(g, cyl(0.008, 0.008, y, mat('#a8d8f0', { opacity: 0.5 }), 0, y / 2, 0), sph(0.14, bone, 0, y, 0, 10, 8), box(0.14, 0.08, 0.1, bone, 0, y - 0.1, 0.06),
      sph(0.035, glow('#ff3a2a'), 0.05, y, 0.12, 6, 4), sph(0.035, DARK(), -0.05, y, 0.12, 6, 4), cyl(0.04, 0.04, 0.08, METAL(), 0, y + 0.14, -0.03),
      limb(V(0.06, y + 0.1, -0.05), V(0.12, y + 0.3, -0.12), 0.006, METAL()));
    if (/tome/i.test(L.name)) add(g, box(0.22, 0.05, 0.16, mat('#6a1e1e'), 0, y - 0.2, 0.02), box(0.2, 0.04, 0.15, mat('#e8e0c8'), 0, y - 0.17, 0.02));
    if (/gheist/i.test(L.name)) add(g, tz(cyl(0.05, 0.05, 0.12, DARK(), 0, y - 0.2, 0)), sph(0.02, glow('#ff8a1a'), 0, y - 0.2, 0.07));
    return g;
  }

  function cherub(op, L) {
    const g = new THREE.Group(), y = 0.7, s = mat(/familiar/i.test(L.name) ? '#b8a0c8' : '#e8c0a0');
    add(g, cyl(0.008, 0.008, y, mat('#a8d8f0', { opacity: 0.5 }), 0, y / 2, 0), sph(0.12, s, 0, y, 0, 10, 8), sph(0.09, s, 0, y + 0.18, 0.02, 10, 8));
    for (const sd of [-1, 1]) add(g, limb(V(sd * 0.08, y + 0.04, 0), V(sd * 0.14, y - 0.06, 0.1), 0.03, s), limb(V(sd * 0.05, y - 0.08, 0), V(sd * 0.07, y - 0.2, 0.05), 0.035, s),
      aimY(box(0.01, 0.26, 0.12, mat('#f0f0f0'), sd * 0.16, y + 0.16, -0.1), V(sd * 0.8, 1, -0.3)));
    if (/familiar/i.test(L.name)) add(g, ...[-1, 1].map((sd) => sph(0.02, glow('#ff3a2a'), sd * 0.035, y + 0.2, 0.09, 6, 4)), limb(V(0, y - 0.05, -0.1), V(0, y - 0.3, -0.3), 0.02, s, 0.005));
    else add(g, cone(0.06, 0.14, BRASS(), 0.14, y - 0.12, 0.12).rotateX(-1.2), sph(0.06, mat('#c8a050'), 0, y + 0.25, 0.0, 8, 4));
    return g;
  }

  function gadget(op, L) {
    const n = L.name.toLowerCase(), g = new THREE.Group(), m = mat(L.main, { metal: 0.5 });
    if (/beacon/.test(n)) add(g, box(0.25, 0.22, 0.18, DARK(), 0, 0.11, 0), cyl(0.006, 0.006, 0.7, METAL(), 0.08, 0.55, 0), sph(0.02, glow('#3aff6a'), 0.08, 0.9, 0), box(0.15, 0.05, 0.02, glow('#3aff6a'), 0, 0.15, 0.1));
    else if (/servo-sentry/.test(n)) {
      for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; add(g, limb(V(0, 0.35, 0), V(Math.cos(a) * 0.3, 0.02, Math.sin(a) * 0.3), 0.02, METAL())); }
      add(g, box(0.2, 0.16, 0.22, m, 0, 0.42, 0), sph(0.04, glow('#ff3a2a'), 0, 0.45, 0.12));
      const { g: gun } = rangedModel({ form: 'heavy', flav: /volley|las/.test(n) ? 'las' : 'bolt', n: 'heavy bolter' }, L); gun.position.set(0, 0.5, 0.05); gun.scale.setScalar(1.1); add(g, gun);
    } else {
      add(g, box(0.3, 0.12, 0.36, m, 0, 0.12, 0), ...[-1, 1].map((s) => box(0.06, 0.1, 0.4, DARK(), s * 0.18, 0.06, 0)), cyl(0.03, 0.03, 0.15, METAL(), 0, 0.25, 0.1), sph(0.04, glow('#3ae0ff'), 0, 0.33, 0.1),
        cyl(0.004, 0.004, 0.35, METAL(), -0.1, 0.35, -0.12));
    }
    return g;
  }

  function macrocyte(op, L) {
    const g = new THREE.Group(), y = 0.55, m = mat(L.main, { metal: 0.8, rough: 0.3 }), gl = glow(L.eye || '#3aff6a');
    const plasmacyte = /plasmacyte/i.test(L.name);
    add(g, cyl(0.008, 0.008, y, mat('#a8d8f0', { opacity: 0.5 }), 0, y / 2, 0));
    if (plasmacyte) {
      add(g, sph(0.1, gl, 0, y, 0, 8, 6), ...[0, 1, 2, 3].map((i) => limb(V(0, y, 0), V(Math.cos(i * 1.57) * 0.22, y - 0.12, Math.sin(i * 1.57) * 0.22), 0.012, m)));
      return g;
    }
    add(g, sph(0.13, m, 0, y + 0.1, 0, 10, 8), box(0.14, 0.12, 0.12, m, 0, y + 0.25, 0.08), sph(0.03, gl, 0, y + 0.26, 0.15),
      ...[-1, 1].map((s) => limb(V(s * 0.1, y + 0.12, 0), V(s * 0.24, y + 0.0, 0.2), 0.02, m)), limb(V(0, y, -0.05), V(0, y - 0.25, -0.25), 0.03, m, 0.01));
    if (/warrior|accelerator|reanimator/i.test(L.name)) add(g, tz(cyl(0.025, 0.025, 0.25, gl, 0, y + 0.05, 0.22)));
    return g;
  }

  function crawler(op, L) {
    const g = new THREE.Group(), m = mat(L.main, { metal: 0.8, rough: 0.3 }), gl = glow(L.trim || '#3affc0');
    const body = sph(0.32, m, 0, 0.55, 0, 12, 8); body.scale.set(1, 0.6, 1.4);
    add(g, body, sph(0.12, gl, 0, 0.62, 0.3, 8, 6), box(0.3, 0.2, 0.25, m, 0, 0.7, 0.45));
    for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
      const z = 0.3 - i * 0.3, hip = V(s * 0.25, 0.55, z), knee = V(s * 0.55, 0.75, z + 0.05), foot = V(s * 0.7, 0.02, z + 0.1);
      add(g, limb(hip, knee, 0.04, m), limb(knee, foot, 0.03, m, 0.012));
    }
    add(g, ...[-1, 1].map((s) => limb(V(s * 0.15, 0.65, 0.55), V(s * 0.25, 0.9, 0.95), 0.03, m)));
    return g;
  }

  function ravener(op, L) {
    const g = new THREE.Group(), carapace = mat(L.main, { rough: 0.5 }), flesh = mat(L.skin, { rough: 0.8 }), bone = mat(L.trim, { rough: 0.6 });
    const ws = weaponsOf(op).map((w) => w.name.en.toLowerCase()).join('|');
    const toxic = /toxic/.test(ws), venom = /venom bolt/.test(ws), crush = /crushing/.test(ws), rend = /rending/.test(ws), mace = /bone mace/.test(ws);
    const tremor = /tremorscythe/i.test(L.name), prime = /prime/i.test(L.name);
    const blade = toxic ? glow('#9aff3a') : bone;
    // Serpent body curling over the base, rising into the upper torso.
    const pts = [V(0.25, 0.06, -0.6), V(-0.25, 0.08, -0.38), V(-0.15, 0.12, 0.05), V(0.05, 0.35, 0.1), V(0, 0.65, 0.12)];
    for (let i = 0; i < pts.length - 1; i++) add(g, limb(pts[i], pts[i + 1], 0.06 + i * 0.03, i % 2 ? flesh : carapace, 0.05 + i * 0.03), sph(0.065 + i * 0.03, carapace, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z, 8, 6));
    // The tail ends in a pincer or a blade.
    const tail = pts[0], tip = V(tail.x + 0.15, tail.y + 0.18, tail.z - 0.15);
    add(g, limb(tail, tip, 0.04, carapace, 0.02));
    if (/tail blade/.test(ws)) add(g, aimY(box(0.015, 0.22, 0.06, bone, tip.x, tip.y + 0.1, tip.z), V(0.3, 1, -0.4)));
    else if (/pincer tail/.test(ws)) add(g, ...[-1, 1].map((s) => aimY(cone(0.025, 0.14, bone, tip.x + s * 0.03, tip.y + 0.06, tip.z), V(s * 0.5, 1, -0.3))));
    const top = pts[pts.length - 1];
    add(g, box(0.3, 0.3, 0.22, carapace, top.x, top.y + 0.1, top.z), sph(0.1, carapace, top.x, top.y + 0.32, top.z + 0.12, 8, 6), box(0.12, 0.08, 0.14, flesh, top.x, top.y + 0.26, top.z + 0.2),
      ...[-1, 1].map((s) => sph(0.02, glow(L.eye), top.x + s * 0.05, top.y + 0.34, top.z + 0.2, 6, 4)));
    for (let i = 0; i < 4; i++) add(g, cone(0.04, 0.12, bone, top.x, top.y + 0.2 - i * 0.1, top.z - 0.14).rotateX(-0.8));
    // Chitin detail: dark seams between the carapace plates, a plated crest on the head, and teeth in the jaw.
    const seam = seamMat(L.main);
    for (let i = 0; i < pts.length - 1; i++) add(g, band(pts[i], pts[i + 1], 0.5, 0.068 + i * 0.03, seam));
    add(g, ...[0, 1, 2].map((i) => box(0.31, 0.012, 0.23, seam, top.x, top.y + 0.17 - i * 0.09, top.z)), // plate seams on the torso
      ...[0, 1, 2].map((i) => box(0.03, 0.03, 0.08, carapace, top.x, top.y + 0.42 - i * 0.02, top.z + 0.1 - i * 0.07)), // plated crest
      ...[-1, 0, 1].map((i) => cone(0.008, 0.03, bone, top.x + i * 0.03, top.y + 0.21, top.z + 0.27).rotateX(Math.PI))); // teeth
    if (prime || tremor) add(g, cone(0.05, 0.22, bone, top.x, top.y + 0.48, top.z + 0.05).rotateX(-0.5));
    // Upper pair: scything talons (bigger on a Tremorscythe); lower pair: talons, rending claws or crushing claws.
    const big = tremor ? 1.5 : /felltalon/i.test(L.name) ? 1.25 : 1;
    for (const s of [-1, 1]) {
      const sh = V(top.x + s * 0.15, top.y + 0.18, top.z), el = V(top.x + s * 0.32, top.y + 0.35, top.z + 0.12), end = V(top.x + s * 0.28, top.y + 0.35 + 0.25 * big, top.z + 0.12 + 0.3 * big);
      add(g, limb(sh, el, 0.035, flesh), limb(el, end, 0.03, blade, 0.005));
      const sh2 = V(top.x + s * 0.15, top.y + 0.04, top.z), el2 = V(top.x + s * 0.3, top.y + 0.1, top.z + 0.12), hand = V(top.x + s * 0.24, top.y + 0.02, top.z + 0.32);
      add(g, limb(sh2, el2, 0.03, flesh));
      if (crush) add(g, limb(el2, hand, 0.04, carapace), ...[-1, 1].map((j) => aimY(cone(0.03, 0.14, bone, hand.x, hand.y + j * 0.03, hand.z + 0.05), V(0, j * 0.4, 1))));
      else if (rend) add(g, limb(el2, hand, 0.025, flesh), ...[-1, 0, 1].map((j) => aimY(cone(0.01, 0.1, bone, hand.x + j * 0.02, hand.y, hand.z + 0.04, 4), V(j * 0.2, -0.2, 1))));
      else add(g, limb(el2, hand.clone().add(V(0, 0.15, 0.1)), 0.025, blade, 0.004));
    }
    if (venom) add(g, tz(cyl(0.05, 0.035, 0.22, carapace, top.x, top.y + 0.08, top.z + 0.2)), sph(0.04, glow('#9aff3a'), top.x, top.y + 0.08, top.z + 0.32, 8, 6));
    if (mace) add(g, limb(V(top.x - 0.1, top.y - 0.1, top.z - 0.05), V(top.x - 0.35, top.y + 0.1, top.z - 0.2), 0.02, bone), sph(0.07, bone, top.x - 0.37, top.y + 0.12, top.z - 0.21, 6, 5));
    g.scale.setScalar(1.3);
    return g;
  }

  function rider(op, L, picks) {
    // Exodite Dragon Master on a drakesteed: a two-legged raptor with the rider on top.
    const g = new THREE.Group(), scale = mat('#5a8a3a', { rough: 0.7 }), belly = mat('#d8c890');
    const body = sph(0.25, scale, 0, 0.7, 0, 10, 8); body.scale.set(0.8, 0.8, 1.6);
    add(g, body, sph(0.2, belly, 0, 0.62, 0.08, 8, 6));
    for (const s of [-1, 1]) {
      const hip = V(s * 0.15, 0.65, -0.05), knee = V(s * 0.2, 0.4, 0.15), ankle = V(s * 0.2, 0.15, -0.1), foot = V(s * 0.2, 0.02, 0.05);
      add(g, limb(hip, knee, 0.08, scale), limb(knee, ankle, 0.05, scale), limb(ankle, foot, 0.035, scale), box(0.1, 0.03, 0.18, scale, foot.x, 0.015, foot.z + 0.05));
    }
    add(g, limb(V(0, 0.75, 0.3), V(0, 1.0, 0.6), 0.09, scale), sph(0.1, scale, 0, 1.05, 0.68, 8, 6), tz(cyl(0.05, 0.08, 0.22, scale, 0, 1.02, 0.82)),
      ...[-1, 1].map((s) => sph(0.02, glow('#ffd040'), s * 0.07, 1.08, 0.72, 6, 4)), limb(V(0, 0.7, -0.35), V(0, 0.45, -1.0), 0.07, scale, 0.015));
    for (let i = 0; i < 5; i++) add(g, cone(0.03, 0.1, mat('#d8b04a'), 0, 0.92 - (i > 2 ? 0.1 : 0), 0.15 - i * 0.12));
    // The rider sits in the saddle, legs astride.
    const fig = humanoid(op, { ...L, body: 'eldar', float: false, seated: true, cloak: true }, picks);
    fig.position.set(0, 0.5, -0.1); fig.scale.setScalar(0.85);
    add(g, fig, box(0.3, 0.06, 0.35, mat(L.cloth), 0, 0.9, -0.1), ...[-1, 1].map((s) => limb(V(s * 0.08, 0.95, -0.1), V(s * 0.28, 0.72, 0.05), 0.04, mat(L.main))));
    const gold = mat('#d8b04a', { metal: 0.8, rough: 0.3 }), stripe = mat('#3a5a26', { rough: 0.7 }), claw = mat('#e8dcc0', { rough: 0.5 });
    add(g, ...[-1, 1].map((s) => box(0.012, 0.012, 0.36, gold, s * 0.15, 0.925, -0.1)), box(0.31, 0.012, 0.012, gold, 0, 0.925, 0.075), // gilded saddle rim
      ...[-1, 1].map((s) => limb(V(s * 0.05, 1.0, 0.78), V(s * 0.1, 1.05, 0.15), 0.006, mat('#5a3a22', { rough: 0.8 }))), // reins from the muzzle
      ...[0, 1, 2, 3].map((i) => { const st = box(0.42 - i * 0.04, 0.02, 0.05, stripe, 0, 0.88 - i * 0.02, -0.25 - i * 0.12); st.rotation.x = -0.25; return st; }), // dark stripes down the back
      ...[-1, 1].flatMap((s) => [-1, 0, 1].map((j) => cone(0.012, 0.05, claw, s * 0.2 + j * 0.03, 0.02, 0.15, 4).rotateX(Math.PI / 2)))); // claws
    return g;
  }

  /** The weapons a model of this operative holds with this loadout (default: its first loadout). */
  function weaponsOf(op, loadout) {
    if (op.loadouts) return op.loadouts[loadout] || Object.values(op.loadouts)[0] || [];
    return op.weapons || [];
  }

  // Sizes follow the physical miniatures, not the background lore. Top-of-head heights (mm) of a standard
  // operative of each kind; leaders and big variants scale up from these. Sources: the danireon.com scale guide
  // (human infantry 30–32mm to the top of the head, Firstborn Marines and Sisters of Battle 32–35mm, Primaris
  // 38–43mm to the helmet) and ScaleMini's measurements (Assault Intercessor 39mm, Eliminator 42mm, Ork Boyz about
  // 32–47mm, Kommando Boss Nob 51mm). Kinds with no measured source keep their proportions to the human baseline.
  const STATURE = { human: 31, sister: 33, primaris: 40, firstborn: 36, scout: 36, ork: 37 };
  const humanRef = BUILD.guard.leg + BUILD.guard.th + BUILD.guard.head * 1.85 + 0.015; // a guardsman's head top at size 1
  const HUMAN_GAIN = STATURE.human / 25.4 / humanRef;
  function statureScale(L, headTop) {
    const kind = L.body === 'marine' ? (L.scout ? 'scout' : L.chaos ? 'firstborn' : 'primaris')
      : L.body === 'guard' || L.body === 'tau' ? 'human' : L.body === 'sister' ? 'sister' : L.body === 'ork' ? 'ork' : null;
    return kind && headTop ? STATURE[kind] / 25.4 / headTop : HUMAN_GAIN;
  }


  // Bakes every part of a finished miniature into one mesh per material, so the GPU draws each model in a dozen
  // or so calls instead of one per part (the look is unchanged; the materials are already shared per colour).
  const _m = new THREE.Matrix4(), _n = new THREE.Matrix3(), _v = new THREE.Vector3();
  function mergeByMaterial(root) {
    root.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), groups = new Map(), parts = [];
    root.traverse((o) => { if (o.isMesh && !Array.isArray(o.material)) { parts.push(o); if (!groups.has(o.material)) groups.set(o.material, []); groups.get(o.material).push(o); } });
    for (const [material, meshes] of groups) {
      let count = 0;
      for (const o of meshes) { const g = o.geometry; count += g.index ? g.index.count : g.attributes.position.count; }
      const pos = new Float32Array(count * 3), nor = new Float32Array(count * 3);
      let k = 0;
      for (const o of meshes) {
        const g = o.geometry, P = g.attributes.position, N = g.attributes.normal, I = g.index;
        _m.multiplyMatrices(inv, o.matrixWorld); _n.getNormalMatrix(_m);
        const flip = _m.determinant() < 0, n = I ? I.count : P.count;
        for (let t = 0; t < n; t += 3) for (let c = 0; c < 3; c++) {
          const s = t + (flip ? 2 - c : c), idx = I ? I.getX(s) : s;
          _v.fromBufferAttribute(P, idx).applyMatrix4(_m); pos.set([_v.x, _v.y, _v.z], k * 3);
          if (N) { _v.fromBufferAttribute(N, idx).applyMatrix3(_n).normalize(); nor.set([_v.x, _v.y, _v.z], k * 3); }
          k++;
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      geo.computeBoundingSphere();
      const mesh = new THREE.Mesh(geo, material);
      mesh.castShadow = meshes.some((o) => o.castShadow); mesh.receiveShadow = meshes.some((o) => o.receiveShadow);
      root.add(mesh);
    }
    for (const o of parts) o.parent.remove(o);
    // drop the now-empty groups
    const empty = (o) => { for (const c of [...o.children]) empty(c); if (o !== root && !o.isMesh && !o.children.length) o.parent.remove(o); };
    empty(root);
    return root;
  }

  // A soft studio for metal to reflect: a dim room with a few light panels. Without it metal parts render almost
  // black and their edges vanish; with it every plate, rim and barrel picks up a highlight.
  function studioEnv(renderer) {
    const room = new THREE.Scene(), panel = (c, w, h, x, y, z, ry = 0, rx = 0) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.rotation.set(rx, ry, 0); room.add(m);
    };
    room.add(new THREE.Mesh(new THREE.BoxGeometry(20, 12, 20), new THREE.MeshBasicMaterial({ color: '#3a3e46', side: THREE.BackSide })));
    panel('#ffffff', 8, 2, 0, 5.9, 0, 0, Math.PI / 2); // overhead strip
    panel('#c0c8d4', 4, 6, 9.9, 1, 2, -Math.PI / 2); // side panels
    panel('#a0a8b8', 4, 6, -9.9, 1, -3, Math.PI / 2);
    panel('#d0d6e0', 6, 3, 2, 2, 9.9, Math.PI);
    const pm = new THREE.PMREMGenerator(renderer), env = pm.fromScene(room, 0.04).texture;
    pm.dispose(); room.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
    return env;
  }
  /** A complete miniature (model + base) for an operative of a team. */
  function buildOperative(team, op, loadout, options = {}) {
    const L = operativeLook(team, op);
    if(options.style==='refined'){
      L.refined=true;
      const revision=refinements.revision(L);if(revision)L.refinementRevision=revision;
      if(team.id==='angels')Object.assign(L,{main:'#28589b',trim:'#ba9953'});
    }
    const picks = pickWeapons(weaponsOf(op, loadout));
    let fig=refinements.figure(op,L,picks);
    if(!fig)switch (L.body) {
      case 'beast': fig = beast(op, L); break;
      case 'drone': fig = drone(op, L); break;
      case 'squig': fig = squig(op, L); break;
      case 'skull': fig = skullDrone(op, L); break;
      case 'cherub': fig = cherub(op, L); break;
      case 'gadget': fig = gadget(op, L); break;
      case 'macrocyte': fig = macrocyte(op, L); break;
      case 'crawler': fig = crawler(op, L); break;
      case 'ravener': fig = ravener(op, L); break;
      case 'rider': fig = rider(op, L, picks); break;
      case 'ogryn': fig = humanoid(op, { ...L, skin: '#c89878', main: L.team === 'blooded' ? '#6e3a30' : '#6a6a4a', carapace: true }, picks); break;
      default: fig = humanoid(op, L, picks);
    }
    refinements.finish(fig,L);
    const root = new THREE.Group();
    root.add(baseFor(op, L, team.color));
    fig.position.y += 0.0;
    if (fig.userData.humanoid) fig.scale.multiplyScalar(statureScale(L, fig.userData.headTop));
    if (L.body === 'vespid') { // Vespids hover above the base on a ruined strut, as the official miniatures do
      fig.position.y = 0.35;
      const strut = mat('#4a4c50', { metal: 0.5, rough: 0.6 });
      const v0 = V(0.12, 0, 0.05), v1 = V(0.02, 0.62, -0.06);
      root.add(limb(v0, v1, 0.05, strut, 0.035), box(0.28, 0.08, 0.2, mat('#3a3c40', { rough: 0.9 }), 0.12, 0.04, 0.05), box(0.12, 0.06, 0.1, mat('#5a5448', { rough: 1 }), -0.12, 0.03, -0.1));
    }
    root.add(fig);
    root.userData = { opId: op.id, look: L, picks, sculptKind:fig.userData.sculptKind };
    return mergeByMaterial(root);
  }

  /** An operative's main ranged and melee weapons on their own (for close-up previews). */
  function previewWeapons(team, op, loadout) {
    const L = operativeLook(team, op), p = pickWeapons(weaponsOf(op, loadout));
    return { ranged: p.ranged && rangedModel(p.ranged, L).g, melee: p.melee && meleeModel(p.melee, L), names: [p.ranged?.n, p.melee?.n] };
  }

  return { buildOperative, pickWeapons, operativeLook, weaponsOf, studioEnv, previewWeapons };
}
