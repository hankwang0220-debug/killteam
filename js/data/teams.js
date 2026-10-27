import { ELDAR_TEAMS } from './eldar.js';
import { DEATHWATCH_TEAM } from './deathwatch.js';
import { MANDRAKES_TEAM } from './mandrakes.js';
import { MURDERWING_TEAM } from './murderwing.js';
import { WRECKA_TEAM } from './wrecka.js';
import { NIGHTLORDS_TEAM } from './nightlords.js';
import { SCOUTS_TEAM } from './scouts.js';
import { RATLINGS_TEAM } from './ratlings.js';
import { SANCTIFIERS_TEAM } from './sanctifiers.js';
import { RAVENERS_TEAM } from './raveners.js';
import { SPECTRES_TEAM } from './spectres.js';
import { AQUILONS_TEAM } from './aquilons.js';
import { VOIDDANCERS_TEAM } from './voiddancers.js';
import { VESPIDS_TEAM } from './vespids.js';
import { STEALTH_TEAM } from './stealthsuits.js';
import { WOLF_TEAM } from './wolfscouts.js';

// Team data. Stats follow Kill Team conventions (APL / Move / Save / Wounds,
// weapons ATK / HIT / DMG normal/crit). Every team uses the official online datacards (stats only, ability
// text paraphrased).
//
// Operative stats: apl, move, save, wounds, base (mm).
//
// Weapon rules keys:
//   range: n        max range in inches (edge to edge)
//   piercing: n     defender rolls n fewer defence dice
//   piercingCrits:n as above, only if the attack scored a critical hit
//   lethal: n       critical hit on n+ instead of 6+
//   balanced        re-roll one attack die
//   relentless      re-roll all failed attack dice
//   ceaseless       re-roll any attack dice showing one chosen result
//   rending         if any crit, upgrade one normal hit to a crit
//   brutal          (melee) opponent can only block with critical successes
//   heavy           cannot shoot after moving in the same activation, nor move after shooting it
//                   ('dash': Heavy (Dash only) — Dash is the one move still allowed)
//   ignoreCover     target gets no cover save
//   saturate        the defender cannot retain cover saves
//   seekLight       a Concealed target can't use Light terrain for cover when picking targets
//   silent          can shoot while the operative has a Conceal order
//   devastating: n  each retained critical success also inflicts n damage
//   accurate: n     retain up to n attack dice as normal successes without rolling them
//   severe          if no critical success is retained, change one normal success to a critical
//   torrent: n      also shoot every other valid target within n" of the first (not near friendlies)
//   blast: n        also shoot every other operative visible to and within n" of the first
//   limited: n      the operative can use this weapon n times per battle
//   hot             after use roll a D6: below the Hit stat, the shooter takes double the result
//   seek            a Concealed target can't use any terrain for cover when picking targets
//   fixedHit        changes to the Hit stat are ignored (Inertial Dampener)
//   noMarkerlight   Markerlight tokens give no benefit (fusion grenade)
//   psychic         PSYCHIC weapon (Plague Marines' Astartes rule)
//   poison          damaging an enemy gives it a Poison token (1 damage whenever it's activated)
//   toxic           +1 to both Dmg against an enemy poisoned at the start of the action
//   shock           (melee) the first crit strike also discards an unresolved enemy success
//   stun            if any crit is retained, the target gets -1 APL until the end of its next activation
//   punishing       if any crit is retained, one fail becomes a normal success
//   firstShotOnly   usable only the first time the operative performs the Shoot action in the battle
//   salvo           also shoot a second valid target (not within control range of friendlies)
//   heavy: 'reposition'  Heavy (Reposition only)
//
// Operative flags (Farstalker Kinband): callTheKill (Kill-broker), energise, coldBlooded, hardyCrit,
// viciousDuellist, savageAssault, badTempered, longSight, concealCharge, stealthAttack, support: 'eyeAbove', pechra.
//
// Operative flags (Kommandos): krumpin (two Fight actions), support: 'getItDun' | 'listenIn' (+1 APL),
// dakkaDash, datAllYouGot (D3 damage after fighting), wotNotz (Boy: Stun Grenade once per TP).
//
// Operative flags (Plague Marines): blessing (Grandfather's Blessing), flail (Flail action),
// iconBearer (+1 APL for control, Contagion free in enemy territory), miasma / vitality (Plaguecaster actions).
//
// Operative flags (Pathfinders): markerlight: n tokens per Markerlight action, drone: true, actionsOnly: [allowed actions],
// signal / systemJam / medikit (unique actions), medic (Medic!), multiVision (enemies can't be obscured),
// droneController (+2" Move for drones), veteran (Blooded: Mont'ka and Kauyon both apply).
//
// Operative flags (Death Korps): watchmaster (issues Guardsman Orders, Bring it Down!), confidant (Second in
// Command, Directive), bruiser, groupAct: 'trooper' (Group Activation with the same groupAct), relay (Vox: relays orders), support: 'spot',
// emperorProtects (re-roll defence dice), uplifting (friendlies within 3": Severe). Weapon rule noOrders: Take Aim! ignores it.
//
// Operative flags (Gellerpox Infected): hulk (Nightmare Hulk), vulgrar, resilient (Revoltingly Resilient, per operative),
// tentacledGrasp, shrieking (Horrifying Shrieking), spikedCharger, glitchling, small, daemonic (ignores Piercing),
// groupAct: 'glitchling' | 'mutant'. Weapon rule swipe (Bloatspawn).
//
// Weapon `group` marks profiles of the same physical weapon (e.g. the sniper rifle's rounds).

const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) =>
  ({ id, name: { zh, en }, type, atk, hit, dmg: [dn, dc], rules, group });

// ---- Angels of Death ----
const boltRifle = W('boltRifle', '爆彈步槍', 'Bolt rifle', 'ranged', 4, 3, 3, 4, { piercingCrits: 1 });
const heavyBoltPistol = W('heavyBoltPistol', '重型爆彈手槍', 'Heavy bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8, piercingCrits: 1 });
const boltPistol = W('boltPistol', '爆彈手槍', 'Bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8 });
const auxFrag = W('auxFrag', '輔助榴彈發射器（破片）', 'Auxiliary grenade launcher (frag)', 'ranged', 4, 3, 2, 4, { blast: 2 }, 'auxGL');
const auxKrak = W('auxKrak', '輔助榴彈發射器（穿甲）', 'Auxiliary grenade launcher (krak)', 'ranged', 4, 3, 4, 5, { piercing: 1 }, 'auxGL');
const hbFocused = W('hbFocused', '重型爆彈槍（集中）', 'Heavy bolter (focused)', 'ranged', 5, 3, 4, 5, { piercingCrits: 1 }, 'heavyBolter');
const hbSweeping = W('hbSweeping', '重型爆彈槍（掃射）', 'Heavy bolter (sweeping)', 'ranged', 4, 3, 4, 5, { piercingCrits: 1, torrent: 1 }, 'heavyBolter');
const sniperExec = W('sniperExec', '爆彈狙擊步槍（處決者）', 'Bolt sniper rifle (executioner)', 'ranged', 4, 2, 3, 4, { heavy: 'dash', saturate: true, seekLight: true, silent: true }, 'sniper');
const sniperHyper = W('sniperHyper', '爆彈狙擊步槍（超破片）', 'Bolt sniper rifle (hyperfrag)', 'ranged', 4, 2, 2, 4, { blast: 1, heavy: 'dash', silent: true }, 'sniper');
const sniperMortis = W('sniperMortis', '爆彈狙擊步槍（死神）', 'Bolt sniper rifle (mortis)', 'ranged', 4, 2, 3, 3, { devastating: 3, heavy: 'dash', piercing: 1, silent: true }, 'sniper');
// Grenadier: universal frag/krak grenades with Hit improved by 1 (3+), not limited for this operative.
const fragGrenade = W('fragGrenade', '破片手雷', 'Frag grenade', 'ranged', 4, 3, 2, 4, { range: 6, blast: 2, saturate: true });
const krakGrenade = W('krakGrenade', '穿甲手雷', 'Krak grenade', 'ranged', 4, 3, 4, 5, { range: 6, piercing: 1, saturate: true });
const chainswordA = W('chainswordA', '鏈鋸劍', 'Chainsword', 'melee', 5, 3, 4, 5);
const chainswordSgt = W('chainswordSgt', '鏈鋸劍', 'Chainsword', 'melee', 4, 3, 4, 5);
const fistsA = W('fistsA', '徒手格鬥', 'Fists', 'melee', 4, 3, 3, 4);
// Angels of Death: the Sergeants' and the Captain's weapon options, and the rifle choices.
const autoBolt = W('autoBolt', '自動爆彈步槍', 'Auto bolt rifle', 'ranged', 4, 3, 3, 4, { torrent: 1 });
const stalkerHeavy = W('stalkerHeavy', '潛獵爆彈步槍（重型）', 'Stalker bolt rifle (heavy)', 'ranged', 4, 3, 3, 5, { heavy: 'dash', lethal: 5, piercingCrits: 1 }, 'stalkerRifle');
const stalkerMobile = W('stalkerMobile', '潛獵爆彈步槍（機動）', 'Stalker bolt rifle (mobile)', 'ranged', 4, 3, 3, 4, {}, 'stalkerRifle');
const handFlamerA = W('handFlamerA', '手持火焰噴射器', 'Hand flamer', 'ranged', 4, 2, 3, 3, { range: 6, saturate: true, torrent: 1 });
const plasmaPistolAD = W('plasmaPistolAD', '等離子手槍（標準）', 'Plasma pistol (standard)', 'ranged', 4, 3, 3, 5, { range: 8, piercing: 1 }, 'plasmaPistolAD');
const plasmaPistolADs = W('plasmaPistolADs', '等離子手槍（超載）', 'Plasma pistol (supercharge)', 'ranged', 4, 3, 4, 5, { range: 8, hot: true, lethal: 5, piercing: 1 }, 'plasmaPistolAD');
const powerFistAS = W('powerFistAS', '動力拳', 'Power fist', 'melee', 5, 4, 5, 7, { brutal: true });
const powerWeaponAS = W('powerWeaponAS', '動力武器', 'Power weapon', 'melee', 5, 3, 4, 6, { lethal: 5 });
const thunderHammerAS = W('thunderHammerAS', '雷霆錘', 'Thunder hammer', 'melee', 5, 4, 5, 6, { shock: true, stun: true });
const powerFistIS = W('powerFistIS', '動力拳', 'Power fist', 'melee', 4, 4, 5, 7, { brutal: true });
const powerWeaponIS = W('powerWeaponIS', '動力武器', 'Power weapon', 'melee', 4, 3, 4, 6, { lethal: 5 });
const thunderHammerIS = W('thunderHammerIS', '雷霆錘', 'Thunder hammer', 'melee', 4, 4, 5, 6, { shock: true, stun: true });
const powerFistCap = W('powerFistCap', '動力拳', 'Power fist', 'melee', 5, 3, 5, 7, { brutal: true });
const rifleSets = { bolt: [boltRifle], auto: [autoBolt], stalker: [stalkerHeavy, stalkerMobile] };
const mk = (o) => Object.fromEntries(Object.entries(o));
// Assault Intercessor Sergeant: (hand flamer | heavy bolt pistol) × (chainsword | power fist | power weapon | thunder hammer), or plasma pistol + chainsword.
const asgtLoadouts = {
  ...Object.fromEntries([['pistol', heavyBoltPistol], ['flamer', handFlamerA]].flatMap(([rk, rw]) => [['chain', chainswordA], ['fist', powerFistAS], ['power', powerWeaponAS], ['hammer', thunderHammerAS]].map(([mkk, mw]) => [`${rk}-${mkk}`, [rw, mw]]))),
  plasma: [plasmaPistolAD, plasmaPistolADs, chainswordA],
};
// Intercessor Sergeant: (auto bolt rifle | bolt rifle | stalker bolt rifle) × (chainsword | fists | power fist | power weapon | thunder hammer).
const isgtLoadouts = Object.fromEntries(Object.entries(rifleSets).flatMap(([rk, rw]) => [['chain', chainswordSgt], ['fists', fistsA], ['fist', powerFistIS], ['power', powerWeaponIS], ['hammer', thunderHammerIS]].map(([mkk, mw]) => [`${rk}-${mkk}`, [...rw, mw]])));
const gunnerLoadouts = Object.fromEntries(Object.entries(rifleSets).map(([rk, rw]) => [rk, [...rw, auxFrag, auxKrak, fistsA]]));
const warriorLoadouts = Object.fromEntries(Object.entries(rifleSets).map(([rk, rw]) => [rk, [...rw, fistsA]]));
void mk;

// ---- Kommandos ----
const slugga = W('slugga', '粗製手槍', 'Slugga', 'ranged', 4, 4, 3, 4, { range: 8 });
const choppa = W('choppa', '劈砍刀', 'Choppa', 'melee', 4, 3, 4, 5);
const powerKlaw = W('powerKlaw', '動力爪', 'Power klaw', 'melee', 4, 3, 5, 7, { brutal: true, shock: true });
const burnaStd = W('burnaStd', '噴火器（標準）', 'Burna (standard)', 'ranged', 4, 2, 3, 3, { range: 8, saturate: true, torrent: 2 }, 'burna');
// Torrent 0": no secondary targets.
const burnaDeluge = W('burnaDeluge', '噴火器（洪流）', 'Burna (deluge)', 'ranged', 4, 2, 3, 3, { range: 4, saturate: true, seek: true }, 'burna');
const dakkaShort = W('dakkaShort', '達卡槍（近距離）', 'Dakka shoota (short range)', 'ranged', 5, 4, 3, 4, { range: 9, ceaseless: true }, 'dakka');
const dakkaLong = W('dakkaLong', '達卡槍（遠距離）', 'Dakka shoota (long range)', 'ranged', 5, 4, 3, 4, {}, 'dakka');
const breachaRam = W('breachaRam', '破門錘', 'Breacha ram', 'melee', 4, 4, 5, 5, { brutal: true, severe: true, shock: true });
const shokkaPistol = W('shokkaPistol', '震擊手槍', 'Shokka pistol', 'ranged', 6, 4, 1, 0, { range: 8, devastating: 2, severe: true, stun: true });
const rokkitAimed = W('rokkitAimed', '火箭發射器（瞄準）', 'Rokkit launcha (aimed)', 'ranged', 6, 4, 4, 5, { blast: 1, ceaseless: true, heavy: 'dash' }, 'rokkit');
const rokkitMobile = W('rokkitMobile', '火箭發射器（機動）', 'Rokkit launcha (mobile)', 'ranged', 6, 4, 4, 5, { blast: 1 }, 'rokkit');
// Concealed Position: only the first time the operative performs the Shoot action in the battle.
const snipaConcealed = W('snipaConcealed', '瞄準大口徑槍（隱蔽）', 'Scoped big shoota (concealed)', 'ranged', 5, 3, 3, 3, { devastating: 2, heavy: true, silent: true, firstShotOnly: true }, 'snipa');
const snipaStationary = W('snipaStationary', '瞄準大口徑槍（定點）', 'Scoped big shoota (stationary)', 'ranged', 5, 3, 3, 3, { devastating: 2, heavy: true }, 'snipa');
const snipaSweeping = W('snipaSweeping', '瞄準大口徑槍（掃射）', 'Scoped big shoota (sweeping)', 'ranged', 5, 3, 3, 4, { heavy: 'dash', torrent: 1 }, 'snipa');
const throwingKnives = W('throwingKnives', '飛刀', 'Throwing knives', 'ranged', 4, 3, 2, 5, { range: 6, silent: true });
const twinChoppas = W('twinChoppas', '雙劈砍刀', 'Twin choppas', 'melee', 4, 3, 4, 5, { ceaseless: true, lethal: 5 });
const fistsO = W('fistsO', '拳頭', 'Fists', 'melee', 3, 3, 3, 4);
// Kommandos: the Boss Nob's big choppa, the Grot and the Bomb Squig.
const bigChoppa = W('bigChoppa', '大劈砍刀', 'Big choppa', 'melee', 5, 3, 5, 6);
const grotChoppa = W('grotChoppa', '格洛特砍刀', 'Grot choppa', 'melee', 3, 5, 1, 4);
const kmExplosives = W('kmExplosives', '炸藥', 'Explosives', 'ranged', 6, 4, 4, 5, { blast: 1, limited: 1, wkExplosive: true });
const kmBite = W('kmBite', '啃咬', 'Bite', 'melee', 3, 4, 4, 5);
const nobLoadoutsKM = { klaw: [slugga, powerKlaw], choppa: [slugga, bigChoppa] };
const KM_PICKS = ['boy', 'breacha', 'burna', 'comms', 'dakka', 'grot', 'rokkit', 'slasha', 'snipa', 'squig'];

// ---- Pathfinders ----
const pulseCarbine = W('pulseCarbine', '脈衝卡賓槍', 'Pulse carbine', 'ranged', 4, 4, 4, 5);
const pulseCarbineSgt = W('pulseCarbineSgt', '脈衝卡賓槍', 'Pulse carbine', 'ranged', 4, 3, 4, 5);
const suppressedCarbine = W('suppressedCarbine', '消音脈衝卡賓槍', 'Suppressed pulse carbine', 'ranged', 4, 3, 4, 5, { silent: true });
const twinPulseCarbine = W('twinPulseCarbine', '雙聯脈衝卡賓槍', 'Twin pulse carbine', 'ranged', 4, 4, 4, 5, { ceaseless: true });
// Fusion grenade: Markerlights don't apply to it.
const fusionGrenade = W('fusionGrenade', '融合手雷', 'Fusion grenade', 'ranged', 4, 3, 4, 3, { range: 6, devastating: 2, limited: 1, piercing: 2, saturate: true, noMarkerlight: true });
// Grenadier Specialist: universal frag/krak grenades with Hit improved by 1 (3+), not limited for this operative.
// They're equipment, not datacard weapons, so Markerlights don't apply.
const fragGrenadeT = W('fragGrenadeT', '破片手雷', 'Frag grenade', 'ranged', 4, 3, 2, 4, { range: 6, blast: 2, saturate: true, noMarkerlight: true });
const krakGrenadeT = W('krakGrenadeT', '穿甲手雷', 'Krak grenade', 'ranged', 4, 3, 4, 5, { range: 6, piercing: 1, saturate: true, noMarkerlight: true });
// Inertial Dampener: changes to the marksman rail rifle's Hit stat are ignored.
const marksmanRail = W('marksmanRail', '神射手軌道步槍（標準）', 'Marksman rail rifle (standard)', 'ranged', 4, 3, 4, 4, { devastating: 2, lethal: 5, piercing: 1, fixedHit: true }, 'marksmanRail');
const marksmanDart = W('marksmanDart', '神射手軌道步槍（飛鏢彈）', 'Marksman rail rifle (dart round)', 'ranged', 4, 3, 3, 4, { piercing: 1, silent: true, fixedHit: true }, 'marksmanRail');
const ionStandard = W('ionStandard', '離子步槍（標準）', 'Ion rifle (standard)', 'ranged', 5, 4, 4, 5, { piercingCrits: 1 }, 'ionRifle');
const ionOvercharge = W('ionOvercharge', '離子步槍（超載）', 'Ion rifle (overcharge)', 'ranged', 5, 4, 4, 5, { hot: true, lethal: 5, piercing: 1 }, 'ionRifle');
const railRifle = W('railRifle', '軌道步槍', 'Rail rifle', 'ranged', 4, 4, 4, 4, { devastating: 2, lethal: 5, piercing: 1 });
const fistsT = W('fistsT', '槍托', 'Gun butt', 'melee', 3, 5, 2, 3);
const gunButtSgt = W('gunButtSgt', '槍托', 'Gun butt', 'melee', 3, 4, 2, 3);
const bionicArm = W('bionicArm', '仿生手臂', 'Bionic arm', 'melee', 3, 4, 3, 4);
const ram = W('ram', '撞擊', 'Ram', 'melee', 3, 5, 2, 3);
const burstFocused = W('burstFocused', '爆發砲（集中）', 'Burst cannon (focused)', 'ranged', 5, 4, 3, 4, { ceaseless: true, heavy: 'reposition', punishing: true }, 'burstCannon');
const burstSweeping = W('burstSweeping', '爆發砲（掃射）', 'Burst cannon (sweeping)', 'ranged', 4, 4, 3, 4, { ceaseless: true, heavy: 'reposition', punishing: true, torrent: 1 }, 'burstCannon');
const fistsC = W('fistsC', '徒手格鬥', 'Fists', 'melee', 3, 5, 2, 3);

// ---- Plague Marines ----
const boltgunPM = W('boltgunPM', '爆彈槍', 'Boltgun', 'ranged', 4, 3, 3, 4);
const boltPistolPM = W('boltPistolPM', '爆彈手槍', 'Bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8 });
const plasmaPistolStd = W('plasmaPistolStd', '等離子手槍（標準）', 'Plasma pistol (standard)', 'ranged', 4, 3, 3, 5, { range: 8, piercing: 1 }, 'plasmaPistol');
const plasmaPistolSup = W('plasmaPistolSup', '等離子手槍（超載）', 'Plasma pistol (supercharge)', 'ranged', 4, 3, 4, 5, { range: 8, hot: true, lethal: 5, piercing: 1 }, 'plasmaPistol');
const plagueSpewer = W('plagueSpewer', '瘟疫噴吐器', 'Plague spewer', 'ranged', 5, 2, 3, 3, { range: 7, saturate: true, severe: true, torrent: 2, poison: true });
// Bombardier (Grenadier): blight and krak grenades with Hit improved by 1; blight grenades also have Toxic.
const blightGrenade = W('blightGrenade', '枯萎手雷', 'Blight grenade', 'ranged', 4, 3, 2, 4, { range: 6, blast: 2, saturate: true, severe: true, poison: true, toxic: true });
const krakGrenadePM = W('krakGrenadePM', '穿甲手雷', 'Krak grenade', 'ranged', 4, 3, 4, 5, { range: 6, piercing: 1, saturate: true });
const entropy = W('entropy', '熵', 'Entropy', 'ranged', 4, 3, 3, 7, { psychic: true, range: 7, saturate: true, severe: true, poison: true });
const plagueWind = W('plagueWind', '瘟疫之風', 'Plague wind', 'ranged', 6, 3, 2, 3, { psychic: true, saturate: true, severe: true, torrent: 1, poison: true });
const plagueSword = W('plagueSword', '瘟疫之劍', 'Plague sword', 'melee', 5, 3, 4, 5, { severe: true, poison: true, toxic: true });
const flail = W('flail', '腐化連枷', 'Flail of Corruption', 'melee', 5, 3, 4, 5, { brutal: true, severe: true, shock: true, poison: true });
const corruptedStaff = W('corruptedStaff', '腐化法杖', 'Corrupted staff', 'melee', 4, 3, 3, 4, { psychic: true, severe: true, shock: true, stun: true, poison: true });
const plagueKnife5 = W('plagueKnife5', '瘟疫匕首', 'Plague knife', 'melee', 5, 3, 3, 4, { severe: true, poison: true });
const fistsPM = W('fistsPM', '徒手格鬥', 'Fists', 'melee', 4, 3, 3, 4);
const boltgunW = W('boltgunW', '爆彈槍', 'Boltgun', 'ranged', 4, 3, 3, 4, { toxic: true });
const plagueKnife4 = W('plagueKnife4', '瘟疫匕首', 'Plague knife', 'melee', 4, 3, 3, 4, { severe: true, poison: true });

// ---- Farstalker Kinband ----
const krootRifle = W('krootRifle', '克魯特步槍', 'Kroot rifle', 'ranged', 4, 4, 3, 4);
const krootRifleKB = W('krootRifleKB', '克魯特步槍', 'Kroot rifle', 'ranged', 4, 3, 3, 4);
const ritualBlade = W('ritualBlade', '儀式之刃', 'Ritual blade', 'melee', 4, 3, 4, 5);
const krootBlade = W('krootBlade', '刀刃', 'Blade', 'melee', 3, 3, 3, 5);
const bowFused = W('bowFused', '加速弓（融合箭）', 'Accelerator bow (fused arrow)', 'ranged', 4, 3, 4, 5, { piercing: 1 }, 'bow');
const bowGlide = W('bowGlide', '加速弓（滑翔箭）', 'Accelerator bow (glide arrow)', 'ranged', 4, 3, 3, 4, { silent: true }, 'bow');
const bowVoltaic = W('bowVoltaic', '加速弓（電壓箭）', 'Accelerator bow (voltaic arrow)', 'ranged', 4, 3, 3, 5, { blast: 1 }, 'bow');
const cutSkinBlades = W('cutSkinBlades', '割膚者之刃', "Cut-skin's blades", 'melee', 4, 3, 3, 5, { ceaseless: true, lethal: 5 });
const krootRifleCB = W('krootRifleCB', '克魯特步槍', 'Kroot rifle', 'ranged', 4, 3, 3, 4);
const rippingFangs = W('rippingFangs', '撕裂獠牙', 'Ripping fangs', 'melee', 4, 3, 3, 4, { rending: true });
const londaxi = W('londaxi', '隆達西部族弩', 'Londaxi tribalest', 'ranged', 5, 4, 4, 5, { heavy: 'reposition', piercing: 1, rending: true });
const huntingConcealed = W('huntingConcealed', '克魯特獵槍（隱蔽）', 'Kroot hunting rifle (concealed)', 'ranged', 4, 2, 3, 3, { heavy: true, devastating: 3, silent: true, firstShotOnly: true }, 'huntingRifle');
const huntingMobile = W('huntingMobile', '克魯特獵槍（機動）', 'Kroot hunting rifle (mobile)', 'ranged', 4, 3, 3, 4, {}, 'huntingRifle');
const huntingStationary = W('huntingStationary', '克魯特獵槍（定點）', 'Kroot hunting rifle (stationary)', 'ranged', 4, 2, 3, 3, { heavy: true, devastating: 3 }, 'huntingRifle');
const pistolsFocused = W('pistolsFocused', '雙持克魯特手槍（集中）', 'Dual Kroot pistols (focused)', 'ranged', 4, 3, 3, 5, { range: 8, ceaseless: true, lethal: 5 }, 'krootPistols');
// Salvo: also shoot a second valid target (not within control range of friendlies).
const pistolsSalvo = W('pistolsSalvo', '雙持克魯特手槍（齊射）', 'Dual Kroot pistols (salvo)', 'ranged', 4, 3, 3, 5, { range: 8, salvo: true }, 'krootPistols');
const scattergun = W('scattergun', '克魯特散彈槍', 'Kroot scattergun', 'ranged', 4, 3, 3, 3, { range: 6 });
const dvorgite = W('dvorgite', '德沃吉特剝皮器', 'Dvorgite skinner', 'ranged', 5, 2, 3, 3, { range: 6, heavy: 'reposition', piercing: 2, torrent: 2 });
const pulseWeaponKB = W('pulseWeaponKB', '脈衝武器', 'Pulse weapon', 'ranged', 4, 4, 4, 5);
const kbLoadouts = { rifle: [krootRifleKB, ritualBlade], pulse: [pulseWeaponKB, ritualBlade] };
const hgLoadouts = { tribalest: [londaxi, krootBlade], skinner: [dvorgite, krootBlade] };
const warriorLoadoutsKB = { rifle: [krootRifle, krootBlade], scattergun: [scattergun, krootBlade] };
const KF_SLOTS = ['bowHunter', 'coldBlood', 'cutSkin', 'hound', 'heavyGunner', 'longSight', 'pistolier', 'stalker', 'tracker', 'warrior'];
const stalkerBlade = W('stalkerBlade', '潛獵者之刃', "Stalker's blade", 'melee', 4, 3, 3, 5, { balanced: true, rending: true });

// ---- Death Korps ----
const lasgunDK = W('lasgunDK', '雷射槍', 'Lasgun', 'ranged', 4, 4, 2, 3);
const bayonetDK = W('bayonetDK', '刺刀', 'Bayonet', 'melee', 3, 4, 2, 3);
const plasmaPistolWM = W('plasmaPistolWM', '等離子手槍（標準）', 'Plasma pistol (standard)', 'ranged', 4, 4, 3, 5, { range: 8, piercing: 1 }, 'plasmaPistolWM');
const plasmaPistolWMs = W('plasmaPistolWMs', '等離子手槍（超載）', 'Plasma pistol (supercharge)', 'ranged', 4, 4, 4, 5, { range: 8, hot: true, lethal: 5, piercing: 1 }, 'plasmaPistolWM');
const powerWeaponWM = W('powerWeaponWM', '動力武器', 'Power weapon', 'melee', 4, 3, 4, 6, { lethal: 5 });
const boltPistolCF = W('boltPistolCF', '爆彈手槍', 'Bolt pistol', 'ranged', 4, 4, 3, 4, { range: 8 });
const chainswordCF = W('chainswordCF', '鏈鋸劍', 'Chainsword', 'melee', 4, 4, 4, 5);
const trenchClub = W('trenchClub', '戰壕棍', 'Trench club', 'melee', 4, 3, 3, 3, { shock: true });
const plasmaGunDK = W('plasmaGunDK', '等離子槍（標準）', 'Plasma gun (standard)', 'ranged', 4, 4, 4, 6, { piercing: 1 }, 'plasmaGunDK');
const plasmaGunDKs = W('plasmaGunDKs', '等離子槍（超載）', 'Plasma gun (supercharge)', 'ranged', 4, 4, 5, 6, { hot: true, lethal: 5, piercing: 1 }, 'plasmaGunDK');
const meltagunDK = W('meltagunDK', '熱熔槍', 'Meltagun', 'ranged', 4, 4, 6, 3, { range: 6, devastating: 4, piercing: 2 });
const longLasConcealed = W('longLasConcealed', '長管雷射槍（隱蔽）', 'Long-las (concealed)', 'ranged', 4, 2, 3, 3, { devastating: 3, heavy: true, silent: true, firstShotOnly: true }, 'longLas');
const longLasMobile = W('longLasMobile', '長管雷射槍（機動）', 'Long-las (mobile)', 'ranged', 4, 3, 3, 4, {}, 'longLas');
const longLasStationary = W('longLasStationary', '長管雷射槍（定點）', 'Long-las (stationary)', 'ranged', 4, 2, 3, 3, { devastating: 3, heavy: true }, 'longLas');
// noOrders: the Take Aim! order doesn't apply to it.
const mortarBarrage = W('mortarBarrage', '迫擊砲彈幕', 'Mortar barrage', 'ranged', 4, 4, 3, 5, { blast: 2, heavy: 'dash', silent: true, noOrders: true });
// Death Korps: the Watchmaster's and Confidant's weapon options, the Gunners, the Veteran and the Sapper.
const boltPistolWM = W('boltPistolWM', '爆彈手槍', 'Bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8 });
const boltgunWM = W('boltgunWM', '爆彈槍', 'Boltgun', 'ranged', 4, 3, 3, 4);
const relicWM = W('relicWM', '傳家雷射手槍', 'Relic laspistol', 'ranged', 4, 3, 2, 4, { range: 8, lethal: 5 });
const bayonetWM = W('bayonetWM', '刺刀', 'Bayonet', 'melee', 4, 3, 2, 3);
const chainswordWM = W('chainswordWM', '鏈鋸劍', 'Chainsword', 'melee', 4, 3, 4, 5);
const boltgunCF = W('boltgunCF', '爆彈槍', 'Boltgun', 'ranged', 4, 4, 3, 4);
const relicCF = W('relicCF', '傳家雷射手槍', 'Relic laspistol', 'ranged', 4, 4, 2, 4, { range: 8, lethal: 5 });
const flamerDK = W('flamerDK', '火焰噴射器', 'Flamer', 'ranged', 4, 2, 3, 3, { range: 8, saturate: true, torrent: 2 });
const glFragDK = W('glFragDK', '榴彈發射器（破片）', 'Grenade launcher (frag)', 'ranged', 4, 4, 2, 4, { blast: 2 }, 'glDK');
const glKrakDK = W('glKrakDK', '榴彈發射器（穿甲）', 'Grenade launcher (krak)', 'ranged', 4, 4, 4, 5, { piercing: 1 }, 'glDK');
const bionicArmDK = W('bionicArmDK', '仿生手臂', 'Bionic arm', 'melee', 3, 4, 4, 5);
const remoteDetonator = W('remoteDetonator', '遙控引爆器', 'Remote detonator', 'ranged', 4, 2, 5, 6, { heavy: 'dash', limited: 1, piercing: 1, silent: true, dkDetonate: true, noOrders: true });
const wmLoadouts = {
  bolt: [boltgunWM, bayonetWM],
  ...Object.fromEntries([['bolt', [boltPistolWM]], ['plasma', [plasmaPistolWM, plasmaPistolWMs]], ['relic', [relicWM]]].flatMap(([pk, pw]) => [['chain', chainswordWM], ['power', powerWeaponWM]].map(([mk2, mw]) => [`${pk}-${mk2}`, [...pw, mw]]))),
};
const cfLoadouts = { bolt: [boltgunCF, bayonetDK], las: [lasgunDK, bayonetDK], pistol: [boltPistolCF, chainswordCF], relic: [relicCF, chainswordCF] };
const DK_PICKS = ['bruiser', 'confidant', 'gunnerFlamer', 'gunnerGL', 'gunnerMelta', 'gunnerPlasma', 'medic', 'sapper', 'sniper', 'spotter', 'trooper', 'veteran', 'vox', 'zealot'];

// ---- Gellerpox Infected ----
const pyregutStd = W('pyregutStd', '焚腸（標準）', 'Pyregut (standard)', 'ranged', 5, 2, 3, 3, { range: 6, saturate: true, torrent: 2 }, 'pyregut');
const pyregutDeluge = W('pyregutDeluge', '焚腸（洪流）', 'Pyregut (deluge)', 'ranged', 5, 2, 3, 3, { range: 4, saturate: true, seekLight: true }, 'pyregut');
// Engineered: two improvements picked for the battle — here Normal Dmg +1 and Critical Dmg +1 (4/5 → 5/6).
const fleshmelded = W('fleshmelded', '血肉融合武器（改造）', 'Fleshmelded weapons (engineered)', 'melee', 5, 3, 5, 6);
const mutantTentacles = W('mutantTentacles', '變異觸手', 'Mutant tentacles', 'ranged', 5, 4, 3, 4, { range: 3, torrent: 1 });
const clawSlashing = W('clawSlashing', '變異爪與觸手（劈砍）', 'Mutant claw & tentacles (slashing)', 'melee', 6, 4, 3, 4, {}, 'bloatClaw');
// Swipe: after fighting with it, a free Fight with it against each other enemy in control range (once each).
const clawSwiping = W('clawSwiping', '變異爪與觸手（橫掃）', 'Mutant claw & tentacles (swiping)', 'melee', 4, 4, 3, 4, { swipe: true }, 'bloatClaw');
const mutantClaw = W('mutantClaw', '變異巨爪', 'Mutant claw', 'melee', 4, 4, 6, 7, { brutal: true });
const effluence = W('effluence', '病態排泄', 'Diseased effluence', 'ranged', 4, 4, 2, 2, { range: 6 });
const nippers = W('nippers', '病態鉗咬', 'Diseased nippers', 'melee', 3, 4, 1, 2);
const cleaverLop = W('cleaverLop', '變異拳與砍刀（斷首）', 'Mutant fist and cleaver (lopping blow)', 'melee', 1, 3, 8, 9, { lethal: 5 }, 'cleaver');
const cleaverSlash = W('cleaverSlash', '變異拳與砍刀（劈砍）', 'Mutant fist and cleaver (slashing)', 'melee', 5, 4, 5, 6, {}, 'cleaver');
const fragGP = W('fragGP', '破片手雷', 'Frag grenade', 'ranged', 4, 4, 2, 4, { range: 6, blast: 2, limited: 1, saturate: true });
const heavyAxe = W('heavyAxe', '重斧', 'Heavy axe', 'melee', 3, 4, 4, 5, { brutal: true });
const improvised = W('improvised', '簡易武器', 'Improvised weapon', 'melee', 4, 4, 3, 4, { ceaseless: true });
// Mutoid Vermin (faction equipment). Feast: +1 Atk and Lethal 5+ against a wounded operative.
const verminSwarm = W('verminSwarm', '蜂群', 'Swarm', 'ranged', 5, 6, 0, 0, { range: 6, stun: true });
const verminSting = W('verminSting', '螫刺', 'Sting', 'melee', 5, 5, 1, 2, { shock: true });
const proboscis = W('proboscis', '吸血口器', 'Bloodsucking proboscis', 'melee', 2, 4, 2, 3, { rending: true, feast: true });
const acidSpit = W('acidSpit', '酸液噴吐', 'Acid spit', 'ranged', 4, 4, 2, 2, { range: 6, devastating: 1, devSplash: 1, piercing: 1 });
const fangedMaw = W('fangedMaw', '利牙巨口', 'Fanged maw', 'melee', 2, 4, 1, 3);

// ---- Hearthkyn Salvagers ----
const autochPistol = W('autochPistol', '奧托赫式爆彈手槍', 'Autoch-pattern bolt pistol', 'ranged', 4, 4, 3, 4, { range: 8, accurate: 1 });
const autochBolter = W('autochBolter', '奧托赫式爆彈槍', 'Autoch-pattern bolter', 'ranged', 4, 4, 3, 4, { accurate: 1 });
const ionBlaster = W('ionBlaster', '離子爆能槍', 'Ion blaster', 'ranged', 4, 4, 3, 4, { piercingCrits: 1 });
const etacarnPistol = W('etacarnPistol', '伊塔卡恩等離子手槍', 'EtaCarn plasma pistol', 'ranged', 4, 4, 3, 5, { range: 8, piercing: 1 });
const plasmaWeaponTh = W('plasmaWeaponTh', '等離子武器', 'Plasma weapon', 'melee', 4, 3, 4, 6, { lethal: 5 });
const boltRevolver = W('boltRevolver', '爆彈左輪', 'Bolt revolver', 'ranged', 4, 3, 3, 5, { range: 8 });
const plasmaKnifeMed = W('plasmaKnifeMed', '等離子小刀', 'Plasma knife', 'melee', 4, 4, 3, 5, { lethal: 5 });
const knux = W('knux', '震盪指虎', 'Concussion knux', 'melee', 4, 3, 4, 4, { ceaseless: true, lethal: 5, shock: true });
const c8Charge = W('c8Charge', 'C8 HX 炸藥', 'C8 HX charge', 'ranged', 4, 3, 4, 6, { range: 4, blast: 1, heavy: 'reposition', limited: 1, piercing: 1, saturate: true });
// Grenadier: universal frag/krak grenades with Hit improved by 1 (3+), not limited for this operative.
const fragHK = W('fragHK', '破片手雷', 'Frag grenade', 'ranged', 4, 3, 2, 4, { range: 6, blast: 2, saturate: true });
const krakHK = W('krakHK', '穿甲手雷', 'Krak grenade', 'ranged', 4, 3, 4, 5, { range: 6, piercing: 1, saturate: true });
const fistsHK = W('fistsHK', '拳頭', 'Fists', 'melee', 3, 4, 2, 3);
const rotaryFocused = W('rotaryFocused', 'HYLas 轉管砲（集中）', 'HYLas rotary cannon (focused)', 'ranged', 5, 4, 4, 5, { ceaseless: true, heavy: 'reposition', saturate: true }, 'rotary');
const rotarySweeping = W('rotarySweeping', 'HYLas 轉管砲（掃射）', 'HYLas rotary cannon (sweeping)', 'ranged', 4, 4, 4, 5, { ceaseless: true, heavy: 'reposition', saturate: true, torrent: 1 }, 'rotary');
// Force Impact: Brutal when fighting in an activation in which it Charged.
const plasmaWeaponJP = W('plasmaWeaponJP', '等離子武器', 'Plasma weapon', 'melee', 4, 3, 4, 6, { lethal: 5, forceImpact: true });
// Theyn options (its bolt pistol and ion pistol hit on 3+).
const autochPistolTh = W('autochPistolTh', '奧托赫式爆彈手槍', 'Autoch-pattern bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8, accurate: 1 });
const ionPistolTh = W('ionPistolTh', '離子手槍', 'Ion pistol', 'ranged', 4, 3, 3, 4, { range: 8, piercingCrits: 1 });
const concussionGauntlet = W('concussionGauntlet', '震盪拳套', 'Concussion gauntlet', 'melee', 4, 4, 5, 7, { brutal: true, shock: true });
// Gunner options. Beam: each retained crit inflicts D3 on each other operative along the beam line (not the target).
const plasmaBeamer = W('plasmaBeamer', '伊塔卡恩等離子光束槍', 'EtaCarn plasma beamer', 'ranged', 4, 4, 5, 6, { piercing: 1, beam: true });
const hylasRifle = W('hylasRifle', 'HYLas 自動步槍', 'HYLas auto rifle', 'ranged', 4, 4, 4, 5, { ceaseless: true, rending: true });
const l7Blast = W('l7Blast', 'L7 飛彈發射器（爆炸）', 'L7 missile launcher (blast)', 'ranged', 4, 4, 3, 5, { blast: 2 }, 'l7');
const l7Focused = W('l7Focused', 'L7 飛彈發射器（集中）', 'L7 missile launcher (focused)', 'ranged', 4, 4, 5, 6, { piercing: 1 }, 'l7');
const magnaRail = W('magnaRail', '磁軌步槍', 'Magna rail rifle', 'ranged', 4, 4, 4, 2, { devastating: 3, heavy: 'dash', piercing: 2 });
const HK_THEYN_RANGED = { pistol: autochPistolTh, bolter: autochBolter, revolver: boltRevolver, etacarn: etacarnPistol, ionBlaster, ionPistol: ionPistolTh };
const HK_THEYN_MELEE = { gauntlet: concussionGauntlet, plasma: plasmaWeaponTh };
const HK_THEYN_LOADOUTS = Object.fromEntries(Object.entries(HK_THEYN_RANGED).flatMap(([r, rw]) => Object.entries(HK_THEYN_MELEE).map(([m, mw]) => [`${r}+${m}`, [rw, mw]])));
const HK_BOLTER_OR_ION = { bolter: [autochBolter, fistsHK], ion: [ionBlaster, fistsHK] };
const HK_PICKS = ['dozr', 'medic', 'grenadier', 'gunner', 'hkGunnerBeamer', 'hkGunnerRifle', 'hkGunnerL7', 'hkGunnerMagna', 'jumpPack', 'kinlynk', 'kognitaar', 'lokatr', 'lugger', 'hkWarrior'];

// ---- Imperial Navy Breachers ----
const shotgunClose = W('shotgunClose', '海軍霰彈槍（近距離）', 'Navis shotgun (close range)', 'ranged', 4, 3, 3, 3, { range: 6, shotgun: true }, 'navisShotgun');
const shotgunLong = W('shotgunLong', '海軍霰彈槍（遠距離）', 'Navis shotgun (long range)', 'ranged', 4, 5, 1, 2, { shotgun: true }, 'navisShotgun');
const hatchet = W('hatchet', '海軍手斧', 'Navis hatchet', 'melee', 3, 4, 3, 4);
const heirloomPistol = W('heirloomPistol', '傳家自動手槍', 'Heirloom autopistol', 'ranged', 4, 3, 2, 4, { range: 8, lethal: 5 });
const powerWeaponNB = W('powerWeaponNB', '動力武器', 'Power weapon', 'melee', 4, 3, 4, 6, { lethal: 5 });
const autopistolNB = W('autopistolNB', '自動手槍', 'Autopistol', 'ranged', 4, 4, 2, 3, { range: 8 });
const heavyShotgunClose = W('heavyShotgunClose', '海軍重型霰彈槍（近距離）', 'Navis heavy shotgun (close range)', 'ranged', 4, 3, 3, 3, { range: 6, relentless: true, shotgun: true }, 'heavyShotgun');
const heavyShotgunLong = W('heavyShotgunLong', '海軍重型霰彈槍（遠距離）', 'Navis heavy shotgun (long range)', 'ranged', 4, 5, 1, 2, { relentless: true, shotgun: true }, 'heavyShotgun');
// Shield: each parry blocks two unresolved successes.
const shieldBash = W('shieldBash', '盾擊', 'Shield bash', 'melee', 3, 4, 1, 2, { brutal: true, shield: true });
const lasVolleyFocused = W('lasVolleyFocused', '海軍雷射齊射槍（集中）', 'Navis las-volley (focused)', 'ranged', 5, 4, 4, 5, { heavy: 'dash', rending: true }, 'lasVolley');
const lasVolleySweeping = W('lasVolleySweeping', '海軍雷射齊射槍（掃射）', 'Navis las-volley (sweeping)', 'ranged', 4, 4, 4, 5, { heavy: 'dash', rending: true, torrent: 1 }, 'lasVolley');
const meltagunNB = W('meltagunNB', '熱熔槍', 'Meltagun', 'ranged', 4, 4, 6, 3, { range: 6, devastating: 4, piercing: 2 });
const gunButtNB = W('gunButtNB', '槍托', 'Gun butt', 'melee', 3, 4, 2, 3);
const chainfist = W('chainfist', '鏈鋸拳', 'Chainfist', 'melee', 4, 4, 5, 6, { brutal: true, rending: true });
const demoCharge = W('demoCharge', '爆破炸藥', 'Demolition charge', 'ranged', 4, 3, 4, 6, { range: 3, blast: 2, heavy: 'reposition', limited: 1, piercing: 1, saturate: true });
const fragNB = W('fragNB', '破片手雷', 'Frag grenade', 'ranged', 4, 3, 2, 4, { range: 6, blast: 2, saturate: true });
const krakNB = W('krakNB', '穿甲手雷', 'Krak grenade', 'ranged', 4, 3, 4, 5, { range: 6, piercing: 1, saturate: true });
// Detonate: the friendly Gheistskull is always the primary target (no cover, not obscured).
const detonator = W('detonator', '鬼骷髏引爆器', 'Gheistskull detonator', 'ranged', 4, 3, 3, 4, { blast: 1, lethal: 4, limited: 1, silent: true, stun: true, detonate: true });
// Sergeant-at-Arms and Gunner options.
const boltPistolNB = W('boltPistolNB', '爆彈手槍', 'Bolt pistol', 'ranged', 4, 4, 3, 4, { range: 8 });
const chainswordNB = W('chainswordNB', '鏈鋸劍', 'Chainsword', 'melee', 4, 3, 4, 5);
const plasmaStdNB = W('plasmaStdNB', '電漿槍（標準）', 'Plasma gun (standard)', 'ranged', 4, 4, 4, 6, { piercing: 1 }, 'plasmaNB');
const plasmaSuperNB = W('plasmaSuperNB', '電漿槍（超載）', 'Plasma gun (supercharge)', 'ranged', 4, 4, 5, 6, { hot: true, lethal: 5, piercing: 1 }, 'plasmaNB');
const NB_PICKS = ['armsman', 'axejack', 'endurant', 'grenadier', 'gunnerVolley', 'gunnerMelta', 'gunnerPlasma', 'hatchcutter', 'surveyor', 'voidJammer'];
// Machines carry no weapons; this stands in so they can be fought (they never retaliate).
const noWeapon = W('noWeapon', '（無武器）', '(no weapon)', 'melee', 0, 6, 0, 0);

// ---- Phobos Strike Team ----
const marksmanCarbine = W('marksmanCarbine', '神射手爆彈卡賓槍', 'Marksman bolt carbine', 'ranged', 4, 3, 3, 4, { lethal: 5 });
const fistsPh = W('fistsPh', '徒手格鬥', 'Fists', 'melee', 4, 3, 3, 4);
const stalkerCarbine = W('stalkerCarbine', '潛獵神射手爆彈卡賓槍', 'Stalker marksman bolt carbine', 'ranged', 4, 2, 3, 4, { lethal: 5, piercing: 1 });
const siBoltPistol = W('siBoltPistol', '特製爆彈手槍', 'Special issue bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8, piercing: 1 });
const combatKnife = W('combatKnife', '戰鬥匕首', 'Combat knife', 'melee', 5, 3, 4, 5);
const occulusCarbine = W('occulusCarbine', '眼目爆彈卡賓槍', 'Occulus bolt carbine', 'ranged', 4, 3, 3, 4, { saturate: true });
const boltCarbinePh = W('boltCarbinePh', '爆彈卡賓槍', 'Bolt carbine', 'ranged', 4, 3, 3, 4, { accurate: 1 });
// Custom (Infiltrator Veteran): two weapon rules picked at set-up — each pair is a loadout.
const PH_CUSTOM_RULES = { balanced: [{ balanced: true }, '平衡', 'Balanced'], lethal: [{ lethal: 5 }, '致命 5+', 'Lethal 5+'], pcrits: [{ piercingCrits: 1 }, '暴擊穿甲 1', 'Piercing Crits 1'], rending: [{ rending: true }, '撕裂', 'Rending'], saturate: [{ saturate: true }, '飽和', 'Saturate'] };
const PH_CUSTOM_LOADOUTS = Object.fromEntries(Object.keys(PH_CUSTOM_RULES).flatMap((a, i, all) => all.slice(i + 1).map((b) => [`${a}+${b}`, [
  W('customCarbine', `自訂爆彈卡賓槍（${PH_CUSTOM_RULES[a][1]}、${PH_CUSTOM_RULES[b][1]}）`, `Custom bolt carbine (${PH_CUSTOM_RULES[a][2]}, ${PH_CUSTOM_RULES[b][2]})`, 'ranged', 4, 3, 3, 4, { ...PH_CUSTOM_RULES[a][0], ...PH_CUSTOM_RULES[b][0] }), fistsPh]])));
const PH_REIVER_LOADOUTS = { pistol: [siBoltPistol, combatKnife], carbine: [boltCarbinePh, fistsPh] };
const PH_PICKS = ['commsman', 'helix', 'phSaboteur', 'phVeteran', 'voxbreaker', 'phInfWarrior', 'marksman', 'phMinelayer', 'phIncWarrior', 'reiver'];

// ---- Warpcoven ----
// (Boons of Tzeentch — Twist of Fate, Incorporeal Sight, Astral Bombardment and the rest — are picked per Sorcerer: js/data/warpcoven.js.)
const doombolt = W('doombolt', '末日彈', 'Doombolt', 'ranged', 4, 3, 4, 2, { psychic: true, devastating: 2, lethal: 5 });
const fluxblast = W('fluxblast', '通量爆破', 'Fluxblast', 'ranged', 4, 3, 3, 4, { psychic: true, blast: 2, rending: true });
const infernoPistol = W('infernoPistol', '煉獄爆彈手槍', 'Inferno bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8, piercing: 1 });
const warpflamePistol = W('warpflamePistol', '亞空間火焰手槍', 'Warpflame pistol', 'ranged', 4, 2, 3, 3, { range: 6, piercing: 1, torrent: 1 });
const forceStave = W('forceStave', '力場法杖', 'Force stave', 'melee', 4, 3, 4, 6, { psychic: true, shock: true });
const firestorm = W('firestorm', '火焰風暴', 'Firestorm', 'ranged', 5, 4, 2, 3, { psychic: true, saturate: true, seekLight: true, torrent: 2 });
const mindburn = W('mindburn', '心靈灼燒', 'Mindburn', 'ranged', 5, 4, 1, 1, { psychic: true, lethal: 5, saturate: true, seekLight: true, mindburn: true });
const khopesh = W('khopesh', '普羅斯佩羅鐮劍', 'Prosperine khopesh', 'melee', 5, 3, 4, 6, { lethal: 5 });
const soulreaperFocused = W('soulreaperFocused', '奪魂砲（集中）', 'Soulreaper cannon (focused)', 'ranged', 5, 3, 4, 5, { piercing: 1 }, 'soulreaper');
const soulreaperSweeping = W('soulreaperSweeping', '奪魂砲（掃射）', 'Soulreaper cannon (sweeping)', 'ranged', 4, 3, 4, 5, { piercing: 1, torrent: 1 }, 'soulreaper');
const warpflamer = W('warpflamer', '亞空間火焰噴射器', 'Warpflamer', 'ranged', 4, 2, 4, 4, { range: 8, saturate: true, piercing: 1, torrent: 2 });
const infernoBoltgun = W('infernoBoltgun', '煉獄爆彈槍', 'Inferno boltgun', 'ranged', 4, 3, 3, 4, { piercing: 1 });
const fistsWC = W('fistsWC', '徒手格鬥', 'Fists', 'melee', 3, 3, 3, 4);
const greatblade = W('greatblade', '巨刃', 'Greatblade', 'melee', 4, 3, 4, 5, { lethal: 5, rending: true });
const greataxe = W('greataxe', '巨斧', 'Greataxe', 'melee', 4, 3, 4, 5, { brutal: true, lethal: 5 });
const tzaangorBlades = W('tzaangorBlades', '奸奇獸人雙刃', 'Tzaangor blades', 'melee', 4, 4, 4, 5, { balanced: true });
// Shield: a 4+ Save (on the operative), and each block can block two unresolved successes when fighting or retaliating with it.
const tzBladeShield = W('tzBladeShield', '奸奇獸人刃與盾', 'Tzaangor blade & shield', 'melee', 4, 4, 3, 4, { shield: true });
const tzAutopistol = W('tzAutopistol', '自動手槍', 'Autopistol', 'ranged', 4, 4, 2, 3, { range: 8 });
const tzChainsword = W('tzChainsword', '鏈鋸劍', 'Chainsword', 'melee', 4, 4, 4, 5);
const tzDagger = W('tzDagger', '匕首', 'Dagger', 'melee', 4, 4, 3, 5);
// Sorcerers: their PSYCHIC weapons, a force stave and an inferno bolt pistol, Prosperine khopesh or warpflame pistol.
const WC_SORC = (psy) => ({ pistol: [...psy, infernoPistol, forceStave], khopesh: [...psy, forceStave, khopesh], warpflame: [...psy, warpflamePistol, forceStave] });

// ---- Wyrmblade ----
const mcAutopistol = W('mcAutopistol', '大師級自動手槍', 'Master-crafted autopistol', 'ranged', 4, 3, 2, 4, { range: 8, lethal: 5 });
const powerMaul = W('powerMaul', '動力錘', 'Power maul', 'melee', 4, 3, 4, 6, { shock: true });
const barbedTail = W('barbedTail', '倒刺尾', 'Barbed tail', 'ranged', 4, 3, 3, 4, { range: 3, silent: true });
const locusBlades = W('locusBlades', '基因劍', 'Locus blades', 'melee', 5, 3, 4, 6, { lethal: 5 });
const stubsHyper = W('stubsHyper', '解放者自動手槍（超感）', 'Liberator autostubs (hypersense)', 'ranged', 5, 3, 3, 4, { range: 6, saturate: true, seekLight: true, hypersense: true }, 'autostubs');
const stubsLong = W('stubsLong', '解放者自動手槍（遠距離）', 'Liberator autostubs (long range)', 'ranged', 4, 4, 3, 4, { piercingCrits: 1, rending: true }, 'autostubs');
const stubsShort = W('stubsShort', '解放者自動手槍（近距離）', 'Liberator autostubs (short range)', 'ranged', 5, 3, 3, 4, { range: 8, piercing: 1, rending: true }, 'autostubs');
const kelKnife = W('kelKnife', '克勒莫夫匕首', 'Kelermorph knife', 'melee', 3, 4, 3, 4, { rending: true });
const flamerGSC = W('flamerGSC', '火焰噴射器', 'Flamer', 'ranged', 4, 2, 3, 3, { range: 8, saturate: true, torrent: 2 });
const glFragGSC = W('glFragGSC', '榴彈發射器（破片）', 'Grenade launcher (frag)', 'ranged', 4, 4, 2, 4, { blast: 2 }, 'glGSC');
const glKrakGSC = W('glKrakGSC', '榴彈發射器（穿甲）', 'Grenade launcher (krak)', 'ranged', 4, 4, 4, 5, { piercing: 1 }, 'glGSC');
const gunButtGSC = W('gunButtGSC', '槍托', 'Gun butt', 'melee', 3, 4, 2, 3);
const miningLaser = W('miningLaser', '採礦雷射', 'Mining laser', 'ranged', 5, 4, 5, 6, { heavy: 'dash', piercing: 1 });
const seismicLong = W('seismicLong', '地震砲（長波）', 'Seismic cannon (long-wave)', 'ranged', 6, 4, 2, 2, { blast: 1, heavy: 'dash', stun: true }, 'seismic');
const seismicShort = W('seismicShort', '地震砲（短波）', 'Seismic cannon (short-wave)', 'ranged', 4, 3, 4, 4, { range: 6, heavy: 'dash', piercingCrits: 1, stun: true }, 'seismic');
const autogunGSC = W('autogunGSC', '自動步槍', 'Autogun', 'ranged', 4, 4, 2, 3);
const shotgunGSC = W('shotgunGSC', '霰彈槍', 'Shotgun', 'ranged', 4, 3, 3, 3, { range: 6 });
// Neophyte Leader options: autogun or shotgun (its own, better profiles), or a pistol and a melee weapon.
const wbLeaderAutogun = W('wbLeaderAutogun', '自動步槍', 'Autogun', 'ranged', 4, 3, 2, 3);
const wbLeaderShotgun = W('wbLeaderShotgun', '霰彈槍', 'Shotgun', 'ranged', 4, 2, 3, 3, { range: 6 });
const wbBoltPistol = W('wbBoltPistol', '爆彈手槍', 'Bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8 });
const webPistol = W('webPistol', '蛛網手槍', 'Web pistol', 'ranged', 4, 3, 3, 4, { range: 6, severe: true, stun: true });
const wbChainsword = W('wbChainsword', '鏈鋸劍', 'Chainsword', 'melee', 4, 3, 4, 5);
const powerPick = W('powerPick', '動力鎬', 'Power pick', 'melee', 4, 3, 4, 5, { rending: true });
const WB_LEADER_LOADOUTS = Object.fromEntries([
  ['autopistol+maul', [mcAutopistol, powerMaul]], ['autogun', [wbLeaderAutogun, gunButtGSC]], ['shotgun', [wbLeaderShotgun, gunButtGSC]],
  ...[['autopistol', mcAutopistol], ['boltPistol', wbBoltPistol], ['web', webPistol]].flatMap(([p, pw]) => [['maul', powerMaul], ['chainsword', wbChainsword], ['pick', powerPick]]
    .map(([m, mw]) => [`${p}+${m}`, [pw, mw]])).filter(([k]) => k !== 'autopistol+maul'),
]);
const webber = W('webber', '蛛網槍', 'Webber', 'ranged', 4, 3, 3, 4, { range: 12, severe: true, stun: true });
const heavyStubberF = W('heavyStubberF', '重型機槍（集中）', 'Heavy stubber (focused)', 'ranged', 5, 4, 4, 5, { heavy: 'dash' }, 'heavyStubberWB');
const heavyStubberS = W('heavyStubberS', '重型機槍（掃射）', 'Heavy stubber (sweeping)', 'ranged', 4, 4, 4, 5, { heavy: 'dash', torrent: 1 }, 'heavyStubberWB');
// Sanctus: the stationary profile (Heavy, Dash only) gains Lethal 5+ from Target Vulnerability.
const sanctusMobile = W('sanctusMobile', '聖者狙擊槍（機動）', 'Sanctus sniper rifle (mobile)', 'ranged', 4, 3, 3, 4, {}, 'sanctusRifle');
const sanctusStationary = W('sanctusStationary', '聖者狙擊槍（定點）', 'Sanctus sniper rifle (stationary)', 'ranged', 4, 2, 3, 3, { devastating: 3, heavy: 'dash', silent: true }, 'sanctusRifle');
const sanctusFists = W('sanctusFists', '徒手格鬥', 'Fists', 'melee', 4, 3, 2, 4);
const bioDagger = W('bioDagger', '聖者生物匕首', 'Sanctus bio-dagger', 'melee', 4, 3, 3, 6, { lethal: 4, shock: true });
const WB_PICKS = ['gunnerFlamer', 'gunnerGL', 'gunnerWebber', 'heavyStubber', 'heavyLaser', 'heavySeismic', 'icon', 'warrior', 'warriorShotgun'];

// ---- Blooded ----
const laspistolBL = W('laspistolBL', '雷射手槍', 'Laspistol', 'ranged', 4, 3, 2, 3, { range: 8 });
const chainswordBL = W('chainswordBL', '鏈鋸劍', 'Chainsword', 'melee', 4, 3, 4, 5);
const lasgunBL = W('lasgunBL', '雷射槍', 'Lasgun', 'ranged', 4, 4, 2, 3);
const bayonetBL = W('bayonetBL', '刺刀', 'Bayonet', 'melee', 3, 4, 2, 3);
const diabolykBomb = W('diabolykBomb', '魔鬼炸彈', 'Diabolyk bomb', 'ranged', 4, 3, 4, 3, { range: 6, blast: 2, devastating: 2, limited: 1, heavy: 'reposition', piercing: 1, saturate: true });
// Grenadier: universal frag/krak grenades with Hit improved by 1 (3+), not limited for this operative.
const fragBL = W('fragBL', '破片手雷', 'Frag grenade', 'ranged', 4, 3, 2, 4, { range: 6, blast: 2, saturate: true });
const krakBL = W('krakBL', '穿甲手雷', 'Krak grenade', 'ranged', 4, 3, 4, 5, { range: 6, piercing: 1, saturate: true });
// Blood Offering: the first critical strike in a fight gains a Blooded token.
const cleaver = W('cleaver', '動力武器與切肉刀', 'Power weapon & cleaver', 'melee', 4, 3, 4, 6, { ceaseless: true, lethal: 5, bloodOffering: true });
const stimmNeedle = W('stimmNeedle', '興奮劑針', 'Stimm needle', 'melee', 3, 5, 1, 4, { lethal: 5 });
const boltPistolBL = W('boltPistolBL', '爆彈手槍', 'Bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8 });
const powerFistBL = W('powerFistBL', '動力拳', 'Power fist', 'melee', 4, 4, 5, 7, { brutal: true });
// Stalk: Lethal 5+ with Light or Heavy terrain within its control range.
const skinningBlades = W('skinningBlades', '剝皮刀', 'Skinning blades', 'melee', 4, 3, 3, 4, { ceaseless: true, stalk: true });
const flamerBL = W('flamerBL', '火焰噴射器', 'Flamer', 'ranged', 4, 2, 3, 3, { range: 8, saturate: true, torrent: 2 });
const maulClaw = W('maulClaw', '動力錘與變異爪', 'Power maul & mutant claw', 'melee', 4, 3, 5, 6, { rending: true, shock: true });
const longLasMobileBL = W('longLasMobileBL', '長管雷射槍（機動）', 'Long-las (mobile)', 'ranged', 4, 3, 3, 4, {}, 'longLasBL');
const longLasStatBL = W('longLasStatBL', '長管雷射槍（定點）', 'Long-las (stationary)', 'ranged', 4, 2, 3, 3, { devastating: 1, heavy: 'dash', silent: true }, 'longLasBL');
const heavyClub = W('heavyClub', '重棍', 'Heavy club', 'melee', 4, 3, 4, 4, { brutal: true });
const shotgunBL = W('shotgunBL', '霰彈槍', 'Shotgun', 'ranged', 4, 3, 3, 3, { range: 6 });
// Chieftain options (its own 3+ profiles) and the other Gunners.
const autopistolBL = W('autopistolBL', '自動手槍', 'Autopistol', 'ranged', 4, 3, 2, 3, { range: 8 });
const boltgunBL = W('boltgunBL', '爆彈槍', 'Boltgun', 'ranged', 4, 3, 3, 4);
const plasmaPistolBLs = W('plasmaPistolBLs', '電漿手槍（標準）', 'Plasma pistol (standard)', 'ranged', 4, 3, 3, 5, { range: 8, piercing: 1 }, 'plasmaPistolBL');
const plasmaPistolBLx = W('plasmaPistolBLx', '電漿手槍（超載）', 'Plasma pistol (supercharge)', 'ranged', 4, 3, 4, 5, { range: 8, hot: true, lethal: 5, piercing: 1 }, 'plasmaPistolBL');
const powerWeaponBL = W('powerWeaponBL', '動力武器', 'Power weapon', 'melee', 4, 3, 4, 6, { lethal: 5 });
const improvisedBL = W('improvisedBL', '簡易刀刃', 'Improvised blade', 'melee', 4, 3, 2, 3);
const bayonetChief = W('bayonetChief', '刺刀', 'Bayonet', 'melee', 3, 3, 2, 3);
const BL_CHIEF_LOADOUTS = {
  'laspistol+chainsword': [laspistolBL, chainswordBL], 'laspistol+power': [laspistolBL, powerWeaponBL],
  'autopistol+chainsword': [autopistolBL, chainswordBL], 'autopistol+power': [autopistolBL, powerWeaponBL],
  'boltPistol+chainsword': [boltPistolBL, chainswordBL], 'boltgun+bayonet': [boltgunBL, bayonetChief], 'plasma+improvised': [plasmaPistolBLs, plasmaPistolBLx, improvisedBL],
};
const glFragBL = W('glFragBL', '榴彈發射器（破片）', 'Grenade launcher (frag)', 'ranged', 4, 4, 2, 4, { blast: 2 }, 'glBL');
const glKrakBL = W('glKrakBL', '榴彈發射器（穿甲）', 'Grenade launcher (krak)', 'ranged', 4, 4, 4, 5, { piercing: 1 }, 'glBL');
const meltagunBL = W('meltagunBL', '熱熔槍', 'Meltagun', 'ranged', 4, 4, 6, 3, { range: 6, devastating: 4, piercing: 2 });
const plasmaGunBLs = W('plasmaGunBLs', '電漿槍（標準）', 'Plasma gun (standard)', 'ranged', 4, 4, 4, 6, { piercing: 1 }, 'plasmaGunBL');
const plasmaGunBLx = W('plasmaGunBLx', '電漿槍（超載）', 'Plasma gun (supercharge)', 'ranged', 4, 4, 5, 6, { hot: true, lethal: 5, piercing: 1 }, 'plasmaGunBL');
const BL_PICKS = ['brimstone', 'butcher', 'commsman', 'corpseman', 'flenser', 'gunner', 'gunnerGL', 'gunnerMelta', 'gunnerPlasma', 'sharpshooter', 'thug', 'sweeper', 'trooper'];
const bayonetShield = W('bayonetShield', '刺刀與盾牌', 'Bayonet & shield', 'melee', 3, 3, 2, 3, { shield: true });

// ---- Fellgor Ravagers ----
const corruptedPistol = W('corruptedPistol', '腐化手槍', 'Corrupted pistol', 'ranged', 4, 4, 3, 5, { range: 8, rending: true });
const corruptedChainsword = W('corruptedChainsword', '腐化鏈鋸劍', 'Corrupted chainsword', 'melee', 4, 3, 4, 5, { rending: true });
const autopistolFG = W('autopistolFG', '自動手槍', 'Autopistol', 'ranged', 4, 4, 2, 3, { range: 8 });
const bludgeon = W('bludgeon', '重錘', 'Bludgeon', 'melee', 4, 3, 4, 4, { brutal: true });
const bionicFist = W('bionicFist', '仿生拳', 'Bionic fist', 'melee', 4, 3, 4, 5, { brutal: true });
const tripleCleavers = W('tripleCleavers', '三把劈刀', 'Triple cleavers', 'melee', 4, 3, 4, 5, { ceaseless: true });
const whipRanged = W('whipRanged', '裂刺鞭（遠程）', 'Crackthorn whip (ranged)', 'ranged', 4, 2, 2, 3, { range: 3, lethal: 4, stun: true }, 'whip');
const whipMelee = W('whipMelee', '裂刺鞭（近戰）', 'Crackthorn whip (melee)', 'melee', 4, 3, 2, 3, { lethal: 4, shock: true }, 'whipM');
const techCurse = W('techCurse', '科技詛咒', 'Tech-curse', 'ranged', 4, 3, 1, 3, { psychic: true, rending: true, saturate: true, seekLight: true });
const braystave = W('braystave', '獸人法杖', 'Braystave', 'melee', 4, 3, 3, 5, { shock: true });
// Headtaker: incapacitating with it heals D3 (no Frenzy token) and adds D3 to its Critical Dmg (max 8).
const skullcleaver = W('skullcleaver', '碎顱斧', 'Skullcleaver', 'melee', 4, 3, 4, 5, { lethal: 5, headtaker: true });
// Tactual Hunter: against an expended enemy, the first critical strike is followed by another strike.
const viciousClaws = W('viciousClaws', '兇殘爪', 'Vicious claws', 'melee', 4, 4, 4, 6, { ceaseless: true, tactualHunter: true });
const cleaverFG = W('cleaverFG', '劈刀', 'Cleaver', 'melee', 4, 3, 4, 5);
// Ironhorn options; Fellgor Warriors (autopistol with bludgeon or cleaver).
const plasmaPistolFGs = W('plasmaPistolFGs', '電漿手槍（標準）', 'Plasma pistol (standard)', 'ranged', 4, 4, 3, 5, { range: 8, piercing: 1 }, 'plasmaPistolFG');
const plasmaPistolFGx = W('plasmaPistolFGx', '電漿手槍（超載）', 'Plasma pistol (supercharge)', 'ranged', 4, 4, 4, 5, { range: 8, hot: true, lethal: 5, piercing: 1 }, 'plasmaPistolFG');
const FG_PICKS = ['deathknell', 'fluxbray', 'gnarlscar', 'gorehorn', 'herdgoad', 'mangler', 'shaman', 'toxhorn', 'vandal', 'fgWarriorB', 'fgWarriorC'];
const KS_PICKS = ['ksMedic', 'ksDemo', 'ksFlamer', 'ksGL', 'ksVolley', 'ksMelta', 'ksPlasma', 'ksRecon', 'ksSharpshooter', 'ksVox', 'ksTrooper'];
const LG_PICKS = ['lgAnointed', 'lgBalefire', 'lgButcher', 'lgGunner', 'lgHeavy', 'lgIcon', 'lgShrivetalon', 'lgWarrior', 'lgWarrior2'];
const NV_PICKS = ['nvCondemnor', 'nvDialogus', 'nvDuellist', 'nvExactor', 'nvHospitaller', 'nvPenitent', 'nvPreceptor', 'nvPronatus', 'nvPurgatus', 'nvReliquarius', 'nvMilitantB', 'nvMilitantG'];
const BC_PICKS = ['bcProxy', 'bcBreacher', 'bcMedic', 'bcGunBolter', 'bcGunArc', 'bcMelta', 'bcIgniter', 'bcPhosphor'];
// Vicious Blows: Ceaseless when fighting (not when retaliating).
const mancrusher = W('mancrusher', '碎人錘', 'Mancrusher', 'melee', 4, 4, 5, 5, { brutal: true, viciousBlows: true });

// ---- Exaction Squad ----
// Repress: each block cancels two unresolved successes; when retaliating it resolves the first die.
const shotpistolPE = W('shotpistolPE', '霰彈手槍', 'Shotpistol', 'ranged', 4, 3, 3, 3, { range: 8 });
const dominatorMaul = W('dominatorMaul', '統治者錘與突擊盾', 'Dominator maul & assault shield', 'melee', 4, 3, 4, 4, { lethal: 5, shock: true, shield: true, repress: true });
const combatShotgunClose = W('combatShotgunClose', '戰鬥霰彈槍（近距離）', 'Combat shotgun (close range)', 'ranged', 4, 3, 4, 4, { range: 6 }, 'combatShotgun');
const combatShotgunLong = W('combatShotgunLong', '戰鬥霰彈槍（遠距離）', 'Combat shotgun (long range)', 'ranged', 4, 5, 2, 2, {}, 'combatShotgun');
const baton = W('baton', '鎮壓警棍', 'Repression baton', 'melee', 3, 4, 2, 3);
// Proctor-exactant's combat shotgun option (its own better profiles) and the Gunners.
const pcShotgunClose = W('pcShotgunClose', '戰鬥霰彈槍（近距離）', 'Combat shotgun (close range)', 'ranged', 4, 2, 4, 4, { range: 6 }, 'pcShotgun');
const pcShotgunLong = W('pcShotgunLong', '戰鬥霰彈槍（遠距離）', 'Combat shotgun (long range)', 'ranged', 4, 4, 2, 2, {}, 'pcShotgun');
const pcBaton = W('pcBaton', '鎮壓警棍', 'Repression baton', 'melee', 3, 3, 2, 3);
const exGL = W('exGL', '榴彈發射器', 'Grenade launcher', 'ranged', 5, 4, 4, 5, { piercing: 1 });
const exStubberF = W('exStubberF', '重型機槍（集中）', 'Heavy stubber (focused)', 'ranged', 5, 4, 4, 5, { heavy: 'dash' }, 'exStubber');
const exStubberS = W('exStubberS', '重型機槍（掃射）', 'Heavy stubber (sweeping)', 'ranged', 4, 4, 4, 5, { heavy: 'dash', torrent: 1 }, 'exStubber');
const exWebber = W('exWebber', '蛛網槍', 'Webber', 'ranged', 4, 3, 4, 5, { range: 12, severe: true, stun: true });
const EX_PICKS = ['castigator', 'chirurgant', 'leashmaster', 'mastiff', 'malocator', 'marksman', 'revelatum', 'subductor', 'vigilant', 'vox', 'exGunnerGL', 'exGunnerStubber', 'exGunnerWebber'];
const excruciatorMaul = W('excruciatorMaul', '刑罰錘', 'Excruciator maul', 'melee', 4, 3, 5, 5, { rending: true, shock: true });
const shotpistolAB = W('shotpistolAB', '霰彈手槍', 'Shotpistol', 'ranged', 4, 4, 3, 3, { range: 8 });
const mechBite = W('mechBite', '機械咬擊', 'Mechanical bite', 'melee', 4, 4, 3, 5, { lethal: 5 });
const scopedShort = W('scopedShort', '瞄準霰彈手槍（近距離）', 'Scoped shotpistol (short range)', 'ranged', 4, 3, 3, 3, { range: 8, lethal: 5 }, 'scopedShotpistol');
const scopedLong = W('scopedLong', '瞄準霰彈手槍（遠距離）', 'Scoped shotpistol (long range)', 'ranged', 4, 3, 3, 3, {}, 'scopedShotpistol');
const execConcealed = W('execConcealed', '處決霰彈槍（隱蔽）', 'Executioner shotgun (concealed)', 'ranged', 4, 2, 4, 0, { devastating: 4, heavy: true, silent: true, firstShotOnly: true }, 'executioner');
const execMobile = W('execMobile', '處決霰彈槍（機動）', 'Executioner shotgun (mobile)', 'ranged', 4, 3, 4, 4, {}, 'executioner');
const execStationary = W('execStationary', '處決霰彈槍（定點）', 'Executioner shotgun (stationary)', 'ranged', 4, 2, 4, 0, { devastating: 4, heavy: true }, 'executioner');
// ---- Hierotek Circle ----
const staffLight = W('staffLight', '光之杖（遠程）', 'Staff of light (ranged)', 'ranged', 6, 3, 3, 4, { rending: true, magnify: true }, 'staffLight');
const staffLightM = W('staffLightM', '光之杖（近戰）', 'Staff of light (melee)', 'melee', 4, 4, 3, 5, { rending: true }, 'staffLight');
const arcaneConduit = W('arcaneConduit', '奧術導管（遠程）', 'Arcane conduit (ranged)', 'ranged', 4, 3, 4, 5, { piercing: 1, magnify: true }, 'arcaneConduit');
const arcaneConduitM = W('arcaneConduitM', '奧術導管（近戰）', 'Arcane conduit (melee)', 'melee', 3, 4, 3, 5, {}, 'arcaneConduit');
const synapticDis = W('synapticDis', '突觸瓦解槍', 'Synaptic disintegrator', 'ranged', 4, 2, 4, 3, { devastating: 2, heavy: 'dash', piercing: 1, severe: true });
const fistsN = W('fistsN', '拳頭', 'Fists', 'melee', 3, 3, 3, 4);
const gaussBlaster = W('gaussBlaster', '高斯爆能槍', 'Gauss blaster', 'ranged', 4, 3, 4, 5, { piercing: 1 });
const teslaCarbine = W('teslaCarbine', '特斯拉卡賓槍', 'Tesla carbine', 'ranged', 5, 3, 3, 3, { devastating: 1, devSplash: 2 });
const bayonetN = W('bayonetN', '刺刀', 'Bayonet', 'melee', 4, 3, 3, 4);
// Chronomancer (aeonstave or entropic lance) and Psychomancer (abyssal lance).
const aeonstave = W('aeonstave', '永世之杖（遠程）', 'Aeonstave (ranged)', 'ranged', 5, 3, 3, 3, { blast: 2, lethal: 5, stun: true, magnify: true }, 'aeonstave');
const aeonstaveM = W('aeonstaveM', '永世之杖（近戰）', 'Aeonstave (melee)', 'melee', 4, 4, 3, 4, { lethal: 5, shock: true }, 'aeonstave');
const entropicLance = W('entropicLance', '熵能長矛（遠程）', 'Entropic lance (ranged)', 'ranged', 4, 3, 5, 3, { devastating: 3, piercing: 1, magnify: true }, 'entropicLance');
const entropicLanceM = W('entropicLanceM', '熵能長矛（近戰）', 'Entropic lance (melee)', 'melee', 4, 4, 3, 6, {}, 'entropicLance');
const abyssalLance = W('abyssalLance', '深淵長矛（遠程）', 'Abyssal lance (ranged)', 'ranged', 5, 3, 2, 2, { blast: 2, devastating: 1, devSplash: 2, piercing: 2, magnify: true }, 'abyssalLance');
const abyssalLanceM = W('abyssalLanceM', '深淵長矛（近戰）', 'Abyssal lance (melee)', 'melee', 4, 4, 4, 4, { devastating: 1 }, 'abyssalLance');
const HC_IMMORTAL = { gauss: [gaussBlaster, bayonetN], tesla: [teslaCarbine, bayonetN] };
const HC_PICKS = ['apprentek', 'deathmark', 'despotek', 'guardian'];
const spark = W('spark', '火花', 'Spark', 'ranged', 4, 4, 2, 3, { range: 4, piercing: 1 });
const atomiser = W('atomiser', '原子化光束', 'Atomiser beam', 'ranged', 4, 4, 3, 4, { range: 6, lethal: 5 });
const clawsP = W('clawsP', '爪', 'Claws', 'melee', 3, 5, 1, 2);

// ---- Hunter Clade ----
const chordclawBlades = W('chordclawBlades', '和弦爪與音波刃', 'Chordclaw & transonic blades', 'melee', 5, 3, 4, 6, { balanced: true, rending: true });
const chordclawRazor = W('chordclawRazor', '和弦爪與音波剃刀', 'Chordclaw & transonic razor', 'melee', 5, 3, 4, 5, { balanced: true });
const transonicBlades = W('transonicBlades', '音波刃', 'Transonic blades', 'melee', 5, 3, 4, 6, { rending: true });
const flechette = W('flechette', '鋼針爆能槍', 'Flechette blaster', 'ranged', 5, 3, 2, 2, { range: 8, saturate: true, silent: true });
const taserGoadS = W('taserGoadS', '電擊刺棒', 'Taser goad', 'melee', 4, 3, 3, 4, { lethal: 5, shock: true });
const galvanic = W('galvanic', '電流步槍', 'Galvanic rifle', 'ranged', 4, 3, 3, 4, { heavy: 'reposition', piercingCrits: 1 });
const radiumCarbine = W('radiumCarbine', '鐳卡賓槍', 'Radium carbine', 'ranged', 4, 3, 2, 4, { rending: true });
const gunButt = W('gunButt', '槍托', 'Gun butt', 'melee', 3, 4, 2, 3);
const arquebusMobile = W('arquebusMobile', '超鈾火繩槍（機動）', 'Transuranic arquebus (mobile)', 'ranged', 4, 3, 4, 3, { devastating: 2, heavy: 'dash', piercing: 1 }, 'arquebus');
const arquebusStationary = W('arquebusStationary', '超鈾火繩槍（定點）', 'Transuranic arquebus (stationary)', 'ranged', 4, 2, 4, 3, { devastating: 3, heavy: true, piercing: 1, severe: true }, 'arquebus');
const caliverStd = W('caliverStd', '電漿短銃（標準）', 'Plasma caliver (standard)', 'ranged', 4, 3, 4, 6, { piercing: 1 }, 'caliver');
const caliverSuper = W('caliverSuper', '電漿短銃（超載）', 'Plasma caliver (supercharge)', 'ranged', 4, 3, 5, 6, { hot: true, lethal: 5, piercing: 1 }, 'caliver');
// Hunter Clade: Infiltrator options, Alpha options, the arc rifle.
const stubcarbine = W('stubcarbine', '自動短卡賓槍', 'Stubcarbine', 'ranged', 4, 3, 3, 4, { ceaseless: true });
const powerWeaponSic = W('powerWeaponSic', '動力武器', 'Power weapon', 'melee', 4, 3, 4, 6, { lethal: 5 });
const HU_INF_LOADOUTS = { 'flechette+taser': [flechette, taserGoadS], 'flechette+power': [flechette, powerWeaponSic], 'stub+taser': [stubcarbine, taserGoadS], 'stub+power': [stubcarbine, powerWeaponSic] };
const arcPistolHC = W('arcPistolHC', '電弧手槍', 'Arc pistol', 'ranged', 4, 3, 4, 5, { range: 8, piercing: 1, stun: true });
const mcRadiumPistol = W('mcRadiumPistol', '大師級鐳手槍', 'Master-crafted radium pistol', 'ranged', 4, 3, 2, 4, { range: 8, balanced: true, rending: true });
const phosphorPistol = W('phosphorPistol', '磷光爆能手槍', 'Phosphor blast pistol', 'ranged', 4, 3, 3, 4, { range: 8, blast: 1, severe: true });
const arcMaul = W('arcMaul', '電弧錘', 'Arc maul', 'melee', 4, 4, 4, 5, { shock: true });
const powerWeaponSk = W('powerWeaponSk', '動力武器', 'Power weapon', 'melee', 4, 4, 4, 6, { lethal: 5 });
const taserGoadSk = W('taserGoadSk', '電擊刺棒', 'Taser goad', 'melee', 4, 4, 3, 4, { lethal: 5, shock: true });
const HU_ALPHA = (gun) => ({ rifle: [gun, gunButt], 'radium+power': [mcRadiumPistol, powerWeaponSk], 'arc+maul': [arcPistolHC, arcMaul], 'arc+taser': [arcPistolHC, taserGoadSk], 'phosphor+maul': [phosphorPistol, arcMaul], 'phosphor+taser': [phosphorPistol, taserGoadSk] });
const arcRifle = W('arcRifle', '電弧步槍', 'Arc rifle', 'ranged', 4, 3, 4, 5, { piercing: 1, stun: true });
const HU_PICKS = ['infWarrior', 'rsWarrior', 'rsWarriorC', 'rgDiktat', 'rgGunner', 'rgGunnerArc', 'rgGunnerPlasma', 'rgSurveyor', 'rgWarrior', 'vgDiktat', 'vgGunner', 'vgGunnerArc', 'vgGunnerArq', 'vgSurveyor', 'vgWarrior'];

// ---- Kasrkin ----
const hsLasgun = W('hsLasgun', '熱射雷射槍', 'Hot-shot lasgun', 'ranged', 4, 3, 3, 4, { rapid: true });
const hsLaspistol = W('hsLaspistol', '熱射雷射手槍', 'Hot-shot laspistol', 'ranged', 4, 3, 3, 4, { range: 8, rapid: true });
const powerWeaponK = W('powerWeaponK', '動力武器', 'Power weapon', 'melee', 4, 3, 4, 6, { lethal: 5 });
const flamerK = W('flamerK', '噴火器', 'Flamer', 'ranged', 4, 2, 3, 3, { range: 8, saturate: true, torrent: 2 });
const meltaK = W('meltaK', '熱熔槍', 'Meltagun', 'ranged', 4, 3, 6, 3, { range: 6, devastating: 4, piercing: 2 });
const plasmaGunK = W('plasmaGunK', '電漿槍（標準）', 'Plasma gun (standard)', 'ranged', 4, 3, 4, 6, { piercing: 1 }, 'plasmaGunK');
const plasmaGunKS = W('plasmaGunKS', '電漿槍（超載）', 'Plasma gun (supercharge)', 'ranged', 4, 3, 5, 6, { hot: true, lethal: 5, piercing: 1 }, 'plasmaGunK');
const hsMarksmanC = W('hsMarksmanC', '熱射神射步槍（隱蔽）', 'Hot-shot marksman rifle (concealed)', 'ranged', 4, 2, 3, 3, { devastating: 3, heavy: true, silent: true, firstShotOnly: true }, 'hsMarksman');
const hsMarksmanM = W('hsMarksmanM', '熱射神射步槍（機動）', 'Hot-shot marksman rifle (mobile)', 'ranged', 4, 3, 3, 4, {}, 'hsMarksman');
const hsMarksmanS = W('hsMarksmanS', '熱射神射步槍（定點）', 'Hot-shot marksman rifle (stationary)', 'ranged', 4, 2, 3, 3, { devastating: 3, heavy: true }, 'hsMarksman');
const ksGunButtSgt = W('ksGunButtSgt', '槍托', 'Gun butt', 'melee', 3, 3, 2, 3);
const ksGLFrag = W('ksGLFrag', '榴彈發射器（破片）', 'Grenade launcher (frag)', 'ranged', 4, 3, 2, 4, { blast: 2 }, 'ksGL');
const ksGLKrak = W('ksGLKrak', '榴彈發射器（穿甲）', 'Grenade launcher (krak)', 'ranged', 4, 3, 4, 5, { piercing: 1 }, 'ksGL');
const ksVolleyF = W('ksVolleyF', '熱射齊射槍（集中）', 'Hot-shot volley gun (focused)', 'ranged', 5, 3, 3, 4, { piercingCrits: 1 }, 'ksVolley');
const ksVolleyS = W('ksVolleyS', '熱射齊射槍（掃射）', 'Hot-shot volley gun (sweeping)', 'ranged', 4, 3, 3, 4, { piercingCrits: 1, torrent: 1 }, 'ksVolley');
const ksSgtLoadouts = { 'hsPistol+power': [hsLaspistol, powerWeaponK], 'bolt+power': [boltPistol, powerWeaponK], 'hsLasgun+butt': [hsLasgun, ksGunButtSgt], 'plasma+chain': [plasmaPistolStd, plasmaPistolSup, chainswordSgt] };

// ---- Legionaries ----
const plasmaPistolL = W('plasmaPistolL', '電漿手槍（標準）', 'Plasma pistol (standard)', 'ranged', 4, 3, 3, 5, { range: 8, piercing: 1 }, 'plasmaPistolL');
const plasmaPistolLS = W('plasmaPistolLS', '電漿手槍（超載）', 'Plasma pistol (supercharge)', 'ranged', 4, 3, 4, 5, { range: 8, hot: true, lethal: 5, piercing: 1 }, 'plasmaPistolL');
const daemonBlade = W('daemonBlade', '惡魔之刃', 'Daemon blade', 'melee', 5, 3, 4, 7, { lethal: 5 });
const boltPistolL = W('boltPistolL', '爆彈手槍', 'Bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8 });
const fireblast = W('fireblast', '炎爆', 'Fireblast', 'ranged', 4, 3, 3, 4, { psychic: true, blast: 2, devastating: 1, devSplash: 1, saturate: true });
const lifeSiphon = W('lifeSiphon', '生命虹吸', 'Life siphon', 'ranged', 5, 3, 3, 3, { psychic: true, saturate: true, siphon: true });
const fellDagger = W('fellDagger', '邪惡匕首', 'Fell dagger', 'melee', 5, 3, 3, 4, { psychic: true, rending: true, siphon: true });
const chainaxe = W('chainaxe', '雙手鏈鋸斧', 'Double-handed chainaxe', 'melee', 5, 4, 5, 7, { brutal: true });
const fistsL = W('fistsL', '拳頭', 'Fists', 'melee', 4, 3, 3, 4);
const reaperFocused = W('reaperFocused', '收割者鏈砲（集中）', 'Reaper chaincannon (focused)', 'ranged', 5, 3, 3, 4, { ceaseless: true, heavy: 'reposition', punishing: true }, 'reaper');
const reaperSweeping = W('reaperSweeping', '收割者鏈砲（掃射）', 'Reaper chaincannon (sweeping)', 'ranged', 4, 3, 3, 4, { ceaseless: true, heavy: 'reposition', punishing: true, torrent: 2 }, 'reaper');
const taintedBoltPistol = W('taintedBoltPistol', '污染爆彈手槍', 'Tainted bolt pistol', 'ranged', 4, 3, 3, 5, { range: 8, rending: true });
const powerFistL = W('powerFistL', '動力拳', 'Power fist', 'melee', 5, 4, 5, 7, { brutal: true });
const powerMaulL = W('powerMaulL', '動力錘', 'Power maul', 'melee', 5, 3, 4, 6, { shock: true });
const powerWeaponL = W('powerWeaponL', '動力武器', 'Power weapon', 'melee', 5, 3, 4, 6, { lethal: 5 });
const taintedChainsword = W('taintedChainsword', '污染鏈鋸劍', 'Tainted chainsword', 'melee', 5, 3, 4, 5, { rending: true });
const boltgunL = W('boltgunL', '爆彈槍', 'Boltgun', 'ranged', 4, 3, 3, 4);
const chainswordL = W('chainswordL', '鏈鋸劍', 'Chainsword', 'melee', 5, 3, 4, 5);
const flamerL = W('flamerL', '噴火器', 'Flamer', 'ranged', 4, 2, 3, 3, { range: 8, saturate: true, torrent: 2 });
const meltaL = W('meltaL', '熱熔槍', 'Meltagun', 'ranged', 4, 3, 6, 3, { range: 6, devastating: 4, piercing: 2 });
const plasmaGunL = W('plasmaGunL', '電漿槍（標準）', 'Plasma gun (standard)', 'ranged', 4, 3, 4, 6, { piercing: 1 }, 'plasmaGunL');
const plasmaGunLS = W('plasmaGunLS', '電漿槍（超載）', 'Plasma gun (supercharge)', 'ranged', 4, 3, 5, 6, { hot: true, lethal: 5, piercing: 1 }, 'plasmaGunL');
const heavyBolterLF = W('heavyBolterLF', '重型爆彈槍（集中）', 'Heavy bolter (focused)', 'ranged', 5, 3, 4, 5, { heavy: 'reposition', piercingCrits: 1 }, 'heavyBolterL');
const heavyBolterLS = W('heavyBolterLS', '重型爆彈槍（掃射）', 'Heavy bolter (sweeping)', 'ranged', 4, 3, 4, 5, { heavy: 'reposition', piercingCrits: 1, torrent: 1 }, 'heavyBolterL');
const missileLF = W('missileLF', '飛彈發射器（破片）', 'Missile launcher (frag)', 'ranged', 4, 3, 3, 5, { blast: 2, heavy: 'reposition' }, 'missileL');
const missileLK = W('missileLK', '飛彈發射器（穿甲）', 'Missile launcher (krak)', 'ranged', 4, 3, 5, 7, { heavy: 'reposition', piercing: 1 }, 'missileL');
const lgChampLoadouts = Object.fromEntries([['plasma', [plasmaPistolL, plasmaPistolLS]], ['tainted', [taintedBoltPistol]]].flatMap(([pk, pw]) => [['fist', powerFistL], ['maul', powerMaulL], ['power', powerWeaponL], ['chain', taintedChainsword]].map(([mk, mw]) => [`${pk}+${mk}`, [...pw, mw]])));
const lgChosenLoadouts = { plasma: [plasmaPistolL, plasmaPistolLS, daemonBlade], tainted: [taintedBoltPistol, daemonBlade] };
const lgGunnerLoadouts = { flamer: [boltPistolL, flamerL, fistsL], melta: [boltPistolL, meltaL, fistsL], plasma: [boltPistolL, plasmaGunL, plasmaGunLS, fistsL] };
const lgHeavyLoadouts = { reaper: [boltPistolL, reaperFocused, reaperSweeping, fistsL], bolter: [boltPistolL, heavyBolterLF, heavyBolterLS, fistsL], missile: [boltPistolL, missileLF, missileLK, fistsL] };
const lgWarriorLoadouts = { boltgun: [boltgunL, fistsL], chain: [boltPistolL, chainswordL] };
const flensingBlades = W('flensingBlades', '剝皮刃', 'Flensing blades', 'melee', 5, 3, 3, 5, { lethal: 5 });
const daemonicClaw = W('daemonicClaw', '惡魔爪', 'Daemonic claw', 'melee', 5, 3, 4, 5, { rending: true });

// ---- Novitiates ----
const plasmaPistolN = W('plasmaPistolN', '電漿手槍（標準）', 'Plasma pistol (standard)', 'ranged', 4, 3, 3, 5, { range: 8, piercing: 1 }, 'plasmaPistolN');
const plasmaPistolNS = W('plasmaPistolNS', '電漿手槍（超載）', 'Plasma pistol (supercharge)', 'ranged', 4, 3, 4, 5, { range: 8, hot: true, lethal: 5, piercing: 1 }, 'plasmaPistolN');
const powerWeaponN = W('powerWeaponN', '動力武器', 'Power weapon', 'melee', 4, 3, 4, 6, { lethal: 5 });
const autopistol = W('autopistol', '自動手槍', 'Autopistol', 'ranged', 4, 4, 2, 3, { range: 8 });
const stakethrower = W('stakethrower', '譴責者樁槍', 'Condemnor stakethrower', 'ranged', 4, 3, 3, 3, { antiPsyker: true, devastating: 2, piercingCrits: 1, silent: true });
const nullRod = W('nullRod', '虛無權杖', 'Null rod', 'melee', 4, 4, 3, 3, { antiPsyker: true, shock: true });
const dialogusStave = W('dialogusStave', '宣講者法杖', 'Dialogus stave', 'melee', 4, 4, 3, 3, { shock: true });
const duellingBlades = W('duellingBlades', '決鬥雙刃', 'Duelling blades', 'melee', 4, 3, 4, 5, { ceaseless: true, riposte: true });
const neuralWhipsR = W('neuralWhipsR', '神經鞭（遠程）', 'Neural whips (ranged)', 'ranged', 5, 3, 2, 3, { range: 3, lethal: 5, stun: true }, 'neuralWhips');
const neuralWhipsM = W('neuralWhipsM', '神經鞭（近戰）', 'Neural whips (melee)', 'melee', 5, 3, 2, 3, { lethal: 5, shock: true }, 'neuralWhips');
const surgicalSaw = W('surgicalSaw', '手術鋸', 'Surgical saw', 'melee', 4, 4, 2, 3, { lethal: 5, rending: true });
const eviscerator = W('eviscerator', '懺悔者開膛鋸', 'Penitent eviscerator', 'melee', 4, 4, 5, 6, { brutal: true, zealousRage: true });
const maceRighteous = W('maceRighteous', '正義之錘', 'Mace of the Righteous', 'melee', 4, 4, 5, 5, { brutal: true, severe: true });
const ministorumFlamer = W('ministorumFlamer', '國教噴火器', 'Ministorum flamer', 'ranged', 4, 2, 4, 4, { range: 8, saturate: true, torrent: 2 });
const relicBoltPistolN = W('relicBoltPistolN', '聖物爆彈手槍', 'Relic bolt pistol', 'ranged', 4, 3, 3, 5, { range: 8, lethal: 5 });
const relicBoltgunN = W('relicBoltgunN', '聖物爆彈槍', 'Relic boltgun', 'ranged', 4, 3, 3, 5, { lethal: 5 });
const gunButtNS = W('gunButtNS', '槍托', 'Gun butt', 'melee', 3, 3, 2, 3);
const autogunN = W('autogunN', '自動步槍', 'Autogun', 'ranged', 4, 4, 2, 3);
const novitiateBlade = W('novitiateBlade', '見習修女之刃', 'Novitiate blade', 'melee', 4, 4, 4, 5);
const nvSupLoadouts = { plasma: [plasmaPistolN, plasmaPistolNS, powerWeaponN], boltgun: [relicBoltgunN, gunButtNS], boltPistol: [relicBoltPistolN, powerWeaponN] };

// ---- Battleclade ----
const taserGoadBC = W('taserGoadBC', '電擊刺棒', 'Taser goad', 'melee', 4, 4, 3, 4, { lethal: 5, shock: true });
const igniter = W('igniter', '焚燒器', 'Incendine igniter', 'ranged', 4, 2, 4, 4, { range: 6, saturate: true, torrent: 1 });
const meltaBC = W('meltaBC', '熱熔槍', 'Meltagun', 'ranged', 4, 4, 6, 3, { range: 6, devastating: 4, piercing: 2 });
const phosphorBlaster = W('phosphorBlaster', '磷光爆能槍', 'Phosphor blaster', 'ranged', 4, 4, 3, 4, { blast: 1, severe: true });
const servoClaw = W('servoClaw', '伺服爪', 'Servo-claw', 'melee', 3, 4, 3, 4);
const eradPistol = W('eradPistol', '根除手槍', 'Eradication pistol', 'ranged', 4, 3, 4, 2, { range: 8, devastating: 3, devSplash: 1, lethal: 5 });
const servoArcClaw = W('servoArcClaw', '伺服電弧爪', 'Servo-arc claw', 'melee', 4, 3, 3, 4, { severe: true, shock: true });
const lascutterClose = W('lascutterClose', '雷射切割器（近距）', 'Lascutter (close range)', 'ranged', 4, 3, 4, 5, { range: 2, lethal: 5, piercing: 2 }, 'lascutter');
const lascutterShort = W('lascutterShort', '雷射切割器（短距）', 'Lascutter (short range)', 'ranged', 4, 3, 4, 5, { range: 6, lethal: 5 }, 'lascutter');
const pincer = W('pincer', '液壓鉗與雷射切割器', 'Hydraulic pincer & lascutter', 'melee', 4, 4, 4, 6, { lethal: 5 });
const radiumPistolMC = W('radiumPistolMC', '大師級鐳手槍', 'Master-crafted radium pistol', 'ranged', 4, 3, 2, 4, { range: 8, balanced: true, rending: true });
const dataspikes = W('dataspikes', '資料尖刺', 'Dataspikes', 'melee', 3, 5, 2, 3);
const chirurgicClaw = W('chirurgicClaw', '伺服手術爪', 'Servo-chirurgic claw', 'melee', 4, 4, 3, 4, { rending: true });
const heavyArcRifle = W('heavyArcRifle', '重型電弧步槍', 'Heavy arc rifle', 'ranged', 5, 4, 4, 6, { heavy: 'dash', piercing: 1, stun: true });
const hbFocusedBC = W('hbFocusedBC', '重爆彈槍（集中）', 'Heavy bolter (focused)', 'ranged', 5, 4, 4, 5, { heavy: 'dash', piercingCrits: 1 }, 'heavyBolterBC');
const hbSweepingBC = W('hbSweepingBC', '重爆彈槍（掃射）', 'Heavy bolter (sweeping)', 'ranged', 4, 4, 4, 5, { heavy: 'dash', piercingCrits: 1, torrent: 1 }, 'heavyBolterBC');
const augmeticClaw = W('augmeticClaw', '機械爪', 'Augmetic claw', 'melee', 3, 4, 4, 5, { brutal: true });

// ---- Exodite Dragon Masters ----
const edRifleMob = W('edRifleMob', '長步槍（機動）', 'Long rifle (mobile)', 'ranged', 4, 3, 3, 3, { devastating: 1 }, 'edRifle');
const edRifleStat = W('edRifleStat', '長步槍（定點）', 'Long rifle (stationary)', 'ranged', 4, 2, 3, 3, { devastating: 3, aimed: true }, 'edRifle');
const edFangs = W('edFangs', '龍駒尖牙利爪', 'Drakesteed fangs & talons', 'melee', 6, 3, 3, 5, { brutal: true });
const edHuntBlade = W('edHuntBlade', '狩獵刀', 'Hunting blade', 'melee', 3, 3, 3, 5, { lethal: 5 });
const edCarbine = W('edCarbine', '太陽卡賓槍', 'Solar carbine', 'ranged', 4, 3, 3, 3, { devastating: 1 });
const edMoonblades = W('edMoonblades', '月刃', 'Moonblades', 'melee', 5, 3, 4, 6, { lethal: 5 });
const edVenom = W('edVenom', '毒冠噴吐', 'Venomcrest spit', 'ranged', 4, 3, 3, 4, { range: 8, severe: true, torrent: 2 });
const edStave = W('edStave', '石之杖', 'Stone stave', 'melee', 4, 3, 3, 5, { psychic: true, lethal: 5, shock: true, stun: true });
const edEarthen = W('edEarthen', '大地之怒', 'Earthen Wrath', 'ranged', 4, 3, 4, 3, { devastating: 2, saturate: true, earthenWrath: true });
const edDrakeFangs = W('edDrakeFangs', '尖牙利爪', 'Fangs & talons', 'melee', 4, 3, 3, 4, { rending: true });
/** Upgrades: each mounted Dragon Master picks two of its five, as a "loadout" whose id lists both. */
export const ED_UPGRADES = {
  clanblade: { speartip: { zh: '氏族槍尖', en: 'Speartip of the Clan' }, nimbus: { zh: '幽光環', en: 'Spectral Nimbus' }, bladed: { zh: '刃之架勢', en: 'Bladed Stance' }, reflection: { zh: '聚焦反射', en: 'Focused Reflection' }, moonsong: { zh: '月歌剔除', en: 'Moonsong Cull' } },
  leystalker: { fated: { zh: '命定一擊', en: 'Fated Shot' }, gloaming: { zh: '暮光斗篷', en: 'Gloaming Mantle' }, nexus: { zh: '節點哨兵', en: 'Nexus Sentinel' }, nomad: { zh: '游牧處刑者', en: 'Nomad Executioner' }, phantasm: { zh: '難以捉摸的幻影', en: 'Elusive Phantasm' } },
  stonesinger: { winds: { zh: '風之恩典', en: 'Wind\'s Grace' }, earthen: { zh: '大地之怒', en: 'Earthen Wrath' }, wails: { zh: '世界哀嚎', en: 'Wails of the World' }, cleansing: { zh: '淡月淨化', en: 'Cleansing of the Pale Moon' }, sow: { zh: '播種', en: 'Sow the Seeds' } },
};
const edPairs = (kind, weapons, extra = {}) => {
  const ids = Object.keys(ED_UPGRADES[kind]), out = {}, labels = {};
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const id = `${ids[i]}+${ids[j]}`;
    out[id] = [...weapons, ...(extra[ids[i]] || []), ...(extra[ids[j]] || [])];
    labels[id] = { zh: `強化：${ED_UPGRADES[kind][ids[i]].zh}＋${ED_UPGRADES[kind][ids[j]].zh}`, en: `Upgrades: ${ED_UPGRADES[kind][ids[i]].en} + ${ED_UPGRADES[kind][ids[j]].en}` };
  }
  return { loadouts: out, loadoutExtra: labels };
};

// ---- Goremongers ----
// (drag: Impaler's fleshskewer pulls the target in; ritual: the Bloodtaker's blade fills its Gore Tank; bleed: Inciter's pistols.)
const gmAutopistol = W('gmAutopistol', '自動手槍', 'Autopistol', 'ranged', 4, 4, 2, 3, { range: 8 });
const gmChainglaive = W('gmChainglaive', '鏈鋸長刃', 'Chainglaive', 'melee', 4, 3, 4, 5, { rending: true });
const gmSkewerR = W('gmSkewerR', '穿肉鉤（射擊）', 'Fleshskewer (ranged)', 'ranged', 4, 3, 4, 5, { range: 8, piercingCrits: 1, stun: true, drag: true }, 'gmSkewer');
const gmSkewerS = W('gmSkewerS', '穿肉鉤（刺擊）', 'Fleshskewer (stab)', 'melee', 4, 3, 3, 4, {}, 'gmSkewer');
const gmIcon = W('gmIcon', '恐虐聖像', 'Icon of Khorne', 'ranged', 4, 2, 4, 4, { range: 8, saturate: true });
const gmChainblade = W('gmChainblade', '鏈鋸刃', 'Chainblade', 'melee', 4, 3, 4, 5, { rending: true });
const gmRitual = W('gmRitual', '儀式之刃', 'Ritual blade', 'melee', 4, 3, 3, 5, { ritual: true });
const gmDualF = W('gmDualF', '雙自動手槍（集中）', 'Dual autopistols (focused)', 'ranged', 4, 3, 2, 2, { range: 8, ceaseless: true, devastating: 1, rending: true, bleed: true }, 'gmDualF');
const gmDualP = W('gmDualP', '雙自動手槍（近距）', 'Dual autopistols (point-blank)', 'melee', 4, 3, 3, 4, { ceaseless: true, rending: true, bleed: true });
const gmChainaxe = W('gmChainaxe', '巨型鏈鋸斧', 'Great chainaxe', 'melee', 4, 3, 5, 6, { brutal: true });
const gmPickrippers = W('gmPickrippers', '撕裂鎬', 'Pickrippers', 'melee', 4, 3, 4, 5, { rending: true });

// ---- Hernkyn Yaegirs ----
const hyThrowKnife = W('hyThrowKnife', '投擲電漿刀', 'Throwing plasma knife', 'ranged', 4, 3, 3, 5, { range: 6, lethal: 5, limited: 1, silent: true });
const hyDualKnives = W('hyDualKnives', '雙電漿刀', 'Dual plasma knives', 'melee', 4, 3, 3, 5, { ceaseless: true, lethal: 5 });
const hyApmAP = W('hyApmAP', 'APM 發射器（穿甲）', 'APM launcher (armour piercing)', 'ranged', 5, 4, 4, 5, { heavy: 'reposition', piercing: 1 }, 'hyApm');
const hyApmBreach = W('hyApmBreach', 'APM 發射器（破障）', 'APM launcher (breaching)', 'ranged', 5, 4, 3, 5, { blast: 2, heavy: 'reposition' }, 'hyApm');
const hyApmHE = W('hyApmHE', 'APM 發射器（高爆）', 'APM launcher (high explosive)', 'ranged', 5, 4, 2, 4, { blast: 3, heavy: 'reposition' }, 'hyApm');
const hyFists = W('hyFists', '拳頭', 'Fists', 'melee', 3, 4, 2, 3);
const hyRevolverT = W('hyRevolverT', '爆彈左輪', 'Bolt revolver', 'ranged', 4, 3, 3, 5, { range: 8 });
const hyShotgunST = W('hyShotgunST', '爆彈霰彈槍（近距）', 'Bolt shotgun (short range)', 'ranged', 4, 3, 4, 4, { range: 6 }, 'hyShotgun');
const hyShotgunLT = W('hyShotgunLT', '爆彈霰彈槍（遠距）', 'Bolt shotgun (long range)', 'ranged', 4, 5, 2, 3, {}, 'hyShotgun');
const hyKnifeT = W('hyKnifeT', '電漿刀', 'Plasma knife', 'melee', 4, 3, 3, 5, { lethal: 5 });
const hyWroughtlock = W('hyWroughtlock', '鍛鎖左輪', 'Wroughtlock revolvers', 'ranged', 4, 3, 3, 5, { range: 9, ceaseless: true, lethal: 5 });
const hyCoilConc = W('hyCoilConc', '磁線圈步槍（隱蔽）', 'Magna-coil rifle (concealed)', 'ranged', 4, 2, 3, 3, { devastating: 3, heavy: true, piercing: 1, silent: true, firstShotOnly: true }, 'hyCoil');
const hyCoilMob = W('hyCoilMob', '磁線圈步槍（機動）', 'Magna-coil rifle (mobile)', 'ranged', 4, 3, 3, 4, { heavy: 'reposition', piercing: 1 }, 'hyCoil');
const hyCoilStat = W('hyCoilStat', '磁線圈步槍（定點）', 'Magna-coil rifle (stationary)', 'ranged', 4, 2, 3, 3, { devastating: 3, heavy: true, piercing: 1 }, 'hyCoil');
const hyRevolver = W('hyRevolver', '爆彈左輪', 'Bolt revolver', 'ranged', 4, 4, 3, 5, { range: 8 });
const hyKnife = W('hyKnife', '電漿刀', 'Plasma knife', 'melee', 4, 4, 3, 5, { lethal: 5 });
const hyEntrencher = W('hyEntrencher', '工兵鏟', 'Entrencher', 'melee', 3, 4, 3, 4);
const hyHandbow = W('hyHandbow', 'SiNR 手弩', 'SiNR handbow', 'ranged', 4, 4, 3, 5, { silent: true });
const hyThrowHatchet = W('hyThrowHatchet', '投擲手斧', 'Throwing hatchet', 'ranged', 4, 3, 3, 5, { range: 6, limited: 1, rending: true, silent: true });
const hyHatchet = W('hyHatchet', '手斧', 'Hatchet', 'melee', 4, 3, 4, 5);

// ---- Elucidian Starstriders ----
const esRelicPistol = W('esRelicPistol', '傳家聖遺物手槍', 'Heirloom relic pistol', 'ranged', 4, 3, 4, 5, { range: 8, piercingCrits: 1, seekLight: true });
const esRapier = W('esRapier', '單分子杖劍', 'Monomolecular cane-rapier', 'melee', 4, 3, 3, 6, { lethal: 5 });
const esBite = W('esBite', '兇猛撕咬', 'Vicious bite', 'melee', 4, 3, 3, 4, { rending: true });
const esDartmask = W('esDartmask', '吹箭面罩', 'Dartmask', 'ranged', 4, 3, 1, 1, { range: 6, lethal: 5, silent: true, stun: true });
const esPowerW = W('esPowerW', '動力武器', 'Power weapon', 'melee', 5, 3, 4, 6, { lethal: 5 });
const esVoltaic = W('esVoltaic', '電弧手槍', 'Voltaic pistol', 'ranged', 4, 3, 4, 4, { range: 8, devastating: 1, devSplash: 1, rending: true });
const esGunButt = W('esGunButt', '槍托', 'Gun butt', 'melee', 3, 4, 2, 3);
const esLaspistol = W('esLaspistol', '雷射手槍', 'Laspistol', 'ranged', 4, 4, 2, 3, { range: 8 });
const esScalpel = W('esScalpel', '手術刀爪', 'Scalpel claw', 'melee', 3, 4, 3, 4, { rending: true });
const esShotgunClose = W('esShotgunClose', '工匠霰彈槍（近距）', 'Artificer shotgun (close range)', 'ranged', 4, 3, 4, 4, { range: 6 }, 'esShotgun');
const esShotgunLong = W('esShotgunLong', '工匠霰彈槍（遠距）', 'Artificer shotgun (long range)', 'ranged', 4, 5, 2, 2, {}, 'esShotgun');
const esRelicLas = W('esRelicLas', '聖遺物雷射手槍', 'Relic laspistol', 'ranged', 4, 3, 2, 4, { range: 8, lethal: 5 });
const esLasgun = W('esLasgun', '雷射槍', 'Lasgun', 'ranged', 4, 4, 2, 3);
const esRotorFocus = W('esRotorFocus', '旋轉加農砲（集中）', 'Rotor cannon (focused)', 'ranged', 5, 4, 4, 5, { heavy: 'dash', rending: true }, 'esRotor');
const esRotorSweep = W('esRotorSweep', '旋轉加農砲（掃射）', 'Rotor cannon (sweeping)', 'ranged', 4, 4, 4, 5, { heavy: 'dash', rending: true, torrent: 1 }, 'esRotor');
/** Privateer Support Assets: the New Dawn's batteries (each once per battle). */
export const ES_ASSETS = [
  W('esArcheotech', '古代科技光束', 'Archeotech beam', 'ranged', 4, 3, 6, 7, { heavy: 'reposition', piercing: 2, silent: true }),
  W('esPlasmaBattery', '電漿砲台', 'Plasma battery', 'ranged', 5, 4, 5, 6, { heavy: 'reposition', lethal: 5, piercing: 1, silent: true }),
  W('esMacrocannon', '巨砲', 'Macrocannon', 'ranged', 5, 4, 4, 5, { heavy: 'reposition', piercingCrits: 1, saturate: true, silent: true, torrent: 2 }),
  W('esGuidedShell', '導引砲彈', 'Guided shell', 'ranged', 5, 4, 3, 4, { blast: 2, heavy: 'reposition', silent: true }),
  W('esClusterBomb', '集束炸彈', 'Cluster bomb', 'ranged', 5, 4, 2, 3, { blast: 3, heavy: 'reposition', silent: true }),
].map((w) => ({ ...w, rules: { ...w.rules, ignoreCover: true, supportAsset: true } })); // (cover only under Vantage terrain — none in 2D)

// ---- Chaos Cult ----
const ctStaveR = W('ctStaveR', '邪惡法杖（遠程）', 'Diabolical stave (ranged)', 'ranged', 4, 4, 3, 6, { range: 2, stun: true });
const ctPistol = W('ctPistol', '手槍', 'Pistol', 'ranged', 4, 4, 2, 3, { range: 8 });
const ctStaveM = W('ctStaveM', '邪惡法杖（近戰）', 'Diabolical stave (melee)', 'melee', 4, 4, 3, 6, { shock: true, stun: true });
const ctCommuneBlade = W('ctCommuneBlade', '聖會之刃', 'Commune blade', 'melee', 4, 4, 4, 6, { lethal: 5 });
const ctCenser = W('ctCenser', '燃燒香爐', 'Burning censer', 'ranged', 4, 2, 4, 4, { range: 5, saturate: true, torrent: 2 });
const ctCrude3 = W('ctCrude3', '粗製近戰武器', 'Crude melee weapon', 'melee', 3, 4, 2, 3);
const ctCrude4 = W('ctCrude4', '粗製近戰武器', 'Crude melee weapon', 'melee', 4, 4, 2, 3);
const ctMutations = W('ctMutations', '可怖突變', 'Hideous mutations', 'melee', 5, 4, 4, 5, { ceaseless: true, rending: true });
const ctGaze = W('ctGaze', '地獄凝視', 'Infernal gaze', 'ranged', 5, 3, 0, 0, { psychic: true, range: 6, devastating: 2, lethal: 3 });
const ctFists = W('ctFists', '拳頭', 'Fists', 'melee', 3, 5, 1, 2);
const ctAppendages = W('ctAppendages', '褻瀆附肢', 'Blasphemous appendages', 'melee', 4, 4, 3, 4, { ceaseless: true, rending: true });

// ---- Celestian Insidiants ----
const ciInferno = W('ciInferno', '地獄火手槍', 'Inferno pistol', 'ranged', 4, 3, 4, 2, { range: 3, devastating: 3, piercing: 2 });
const ciRelicBolt = W('ciRelicBolt', '聖遺物爆彈手槍', 'Relic bolt pistol', 'ranged', 4, 3, 3, 5, { range: 8, lethal: 5 });
const ciRelicStake = W('ciRelicStake', '聖遺物譴責樁射器', 'Relic condemnor stakethrower', 'ranged', 4, 3, 2, 2, { devastating: 2, lethal: 5, piercingCrits: 1, silent: true, antiPsykerL: true });
const ciNullMace = W('ciNullMace', '虛無錘', 'Null mace', 'melee', 4, 3, 4, 4, { shock: true, antiPsykerL: true });
const ciSwordDef = W('ciSwordDef', '祝聖之劍與守護盾（防禦）', 'Blessed sword & praesidium protectiva (defensive)', 'melee', 4, 3, 4, 6, { shield: true }, 'ciSword');
const ciSwordOff = W('ciSwordOff', '祝聖之劍與守護盾（進攻）', 'Blessed sword & praesidium protectiva (offensive)', 'melee', 4, 3, 4, 6, { lethal: 5 }, 'ciSword');
const ciHandFlamer = W('ciHandFlamer', '手持火焰噴射器（標準）', 'Hand flamer (standard)', 'ranged', 4, 2, 3, 3, { range: 6, saturate: true, torrent: 1 }, 'ciFlamer');
const ciDeluge = W('ciDeluge', '手持火焰噴射器（洪流）', 'Hand flamer (deluge)', 'ranged', 4, 2, 3, 3, { range: 4, saturate: true, seekLight: true, torrent: 0 }, 'ciFlamer');
const ciVirge = W('ciVirge', '告誡權杖', 'Virge of admonition', 'melee', 4, 4, 5, 5, { brutal: true, shock: true, antiPsykerL: true });
const ciVoice = W('ciVoice', '譴責之聲', 'Voice of condemnation', 'ranged', 5, 3, 1, 1, { range: 6, seek: true, stun: true });
const ciStaff = W('ciStaff', '宣告之杖', 'Staff of declamation', 'melee', 4, 3, 3, 3, { shock: true });
const ciBroadsword = W('ciBroadsword', '祝聖闊劍', 'Blessed broadsword', 'melee', 4, 3, 4, 6, { lethal: 5, brutal: true });
const ciBoltPistol = W('ciBoltPistol', '爆彈手槍', 'Bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8 });
const ciStake = W('ciStake', '譴責樁射器', 'Condemnor stakethrower', 'ranged', 4, 3, 2, 2, { devastating: 1, piercingCrits: 1, silent: true, antiPsykerL: true });
const ciGunButt = W('ciGunButt', '槍托', 'Gun butt', 'melee', 3, 3, 2, 3);

// ---- Canoptek Circle ----
const ccPartMatter = W('ccPartMatter', '震波戟（分離物質）', 'Tremorglaive (part matter)', 'ranged', 4, 3, 4, 5, { piercing: 1, piercingCrits: 2 }, 'ccGlaive');
const ccQuake = W('ccQuake', '震波戟（地震）', 'Tremorglaive (quake)', 'ranged', 5, 3, 1, 2, { blast: 2, seekLight: true, stun: true }, 'ccGlaive');
const ccSweep = W('ccSweep', '震波戟（橫掃）', 'Tremorglaive (sweep)', 'melee', 4, 4, 4, 5, { severe: true, shock: true, stun: true });
const ccIsolator = W('ccIsolator', '跨維度隔離器', 'Transdimensional isolator', 'ranged', 5, 4, 5, 6, { banish: true });
const ccReaperFocus = W('ccReaperFocus', '雙聯高斯收割者（集中）', 'Twin gauss reapers (focused)', 'ranged', 5, 4, 4, 5, { piercing: 1, severe: true }, 'ccReaper');
const ccReaperSweep = W('ccReaperSweep', '雙聯高斯收割者（掃射）', 'Twin gauss reapers (sweeping)', 'ranged', 4, 4, 4, 5, { piercing: 1, severe: true, torrent: 1 }, 'ccReaper');
const ccCrawlerClaws = W('ccCrawlerClaws', '利爪', 'Claws', 'melee', 4, 4, 4, 4);
const ccSpark = W('ccSpark', '電火花', 'Spark', 'ranged', 4, 4, 2, 3, { range: 4, piercing: 1 });
const ccClawsSpark = W('ccClawsSpark', '利爪與電火花', 'Claws & spark', 'melee', 3, 4, 3, 4, { lethal: 5, stun: true });
const ccAtomiser = W('ccAtomiser', '原子化光束', 'Atomiser beam', 'ranged', 4, 4, 3, 4, { range: 6, lethal: 5 });
const ccClawsTailR = W('ccClawsTailR', '利爪與尾刺', 'Claws & tail', 'melee', 4, 4, 3, 4);
const ccScalpel = W('ccScalpel', '高斯手術刀', 'Gauss scalpel', 'ranged', 4, 4, 2, 3, { piercing: 1 });
const ccTeslaFocus = W('ccTeslaFocus', '特斯拉施放器（集中）', 'Tesla caster (focused)', 'ranged', 4, 4, 2, 3, {}, 'ccTesla');
const ccTeslaLightning = W('ccTeslaLightning', '特斯拉施放器（活體閃電）', 'Tesla caster (living lightning)', 'ranged', 4, 4, 2, 3, { blast: 2 }, 'ccTesla');
const ccClawsTail = W('ccClawsTail', '利爪與尾刺', 'Claws & tail', 'melee', 3, 4, 3, 4);

// ---- Brood Brothers ----
const bbBoltPistol = W('bbBoltPistol', '爆彈手槍', 'Bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8 });
const bbDrumAutogun = W('bbDrumAutogun', '彈鼓自動槍', 'Drum-fed autogun', 'ranged', 4, 3, 2, 3, { ceaseless: true });
const bbLaspistolC = W('bbLaspistolC', '雷射手槍', 'Laspistol', 'ranged', 4, 3, 2, 3, { range: 8 });
const bbBayonetC = W('bbBayonetC', '刺刀', 'Bayonet', 'melee', 3, 3, 2, 3);
const bbChainClaw = W('bbChainClaw', '鏈鋸劍與爪', 'Chainsword & claw', 'melee', 4, 3, 4, 5, { balanced: true, rending: true });
const bbPowerClaw = W('bbPowerClaw', '動力武器與爪', 'Power weapon & claw', 'melee', 4, 3, 4, 6, { balanced: true, lethal: 5 });
const bbLasgun = W('bbLasgun', '雷射槍', 'Lasgun', 'ranged', 4, 4, 2, 3);
const bbBayonet = W('bbBayonet', '刺刀', 'Bayonet', 'melee', 3, 4, 2, 3);
const bbShockMaul = W('bbShockMaul', '電擊錘', 'Shock maul', 'melee', 4, 4, 4, 4, { shock: true });
const bbLargeKnife = W('bbLargeKnife', '大刀', 'Large knife', 'melee', 4, 4, 3, 5);
const bbFlamer = W('bbFlamer', '火焰噴射器', 'Flamer', 'ranged', 4, 2, 3, 3, { range: 8, saturate: true, torrent: 2 });
const bbGLFrag = W('bbGLFrag', '榴彈發射器（破片）', 'Grenade launcher (frag)', 'ranged', 4, 4, 2, 4, { blast: 2 }, 'bbGL');
const bbGLKrak = W('bbGLKrak', '榴彈發射器（穿甲）', 'Grenade launcher (krak)', 'ranged', 4, 4, 4, 5, { piercing: 1 }, 'bbGL');
const bbMelta = W('bbMelta', '熱熔槍', 'Meltagun', 'ranged', 4, 4, 6, 3, { range: 6, devastating: 4, piercing: 2 });
const bbPlasmaStd = W('bbPlasmaStd', '電漿槍（標準）', 'Plasma gun (standard)', 'ranged', 4, 4, 4, 6, { piercing: 1 }, 'bbPlasma');
const bbPlasmaSuper = W('bbPlasmaSuper', '電漿槍（超載）', 'Plasma gun (supercharge)', 'ranged', 4, 4, 5, 6, { hot: true, lethal: 5, piercing: 1 }, 'bbPlasma');
const bbGeneNeedler = W('bbGeneNeedler', '基因針', 'Gene-needler', 'melee', 1, 4, 5, 7, { lethal: 5, limited: 1 });
const bbDemoCharge = W('bbDemoCharge', '爆破炸藥', 'Demolition charge', 'ranged', 4, 3, 4, 6, { range: 3, blast: 2, heavy: 'reposition', limited: 1, piercing: 1, saturate: true });
const bbPoisonKnives = W('bbPoisonKnives', '淬毒戰鬥刀', 'Poisoned fighting knives', 'melee', 4, 3, 3, 4, { ceaseless: true, lethal: 5 });
const bbSniperConc = W('bbSniperConc', '狙擊步槍（隱蔽）', 'Sniper rifle (concealed)', 'ranged', 4, 2, 3, 3, { devastating: 3, heavy: true, silent: true, firstShotOnly: true }, 'bbSniper');
const bbSniperMobile = W('bbSniperMobile', '狙擊步槍（機動）', 'Sniper rifle (mobile)', 'ranged', 4, 3, 3, 4, {}, 'bbSniper');
const bbSniperStat = W('bbSniperStat', '狙擊步槍（定點）', 'Sniper rifle (stationary)', 'ranged', 4, 2, 3, 3, { devastating: 3, heavy: true }, 'bbSniper');
const bbFists = W('bbFists', '拳頭', 'Fists', 'melee', 3, 4, 2, 3);
const bbShotgunClose = W('bbShotgunClose', '戰鬥霰彈槍（近距）', 'Combat shotgun (close range)', 'ranged', 4, 3, 4, 4, { range: 6 }, 'bbShotgun');
const bbShotgunLong = W('bbShotgunLong', '戰鬥霰彈槍（遠距）', 'Combat shotgun (long range)', 'ranged', 4, 5, 2, 2, {}, 'bbShotgun');
const bbBayonetClaw = W('bbBayonetClaw', '刺刀與爪', 'Bayonet & claw', 'melee', 3, 4, 2, 3, { balanced: true });
const bbAutopistol = W('bbAutopistol', '自動手槍', 'Autopistol', 'ranged', 4, 4, 2, 3, { range: 8 });
const bbBioDagger = W('bbBioDagger', '生物匕首', 'Bio dagger', 'melee', 2, 4, 3, 6, { lethal: 4 });
const bbForceStave = W('bbForceStave', '力場法杖', 'Force stave', 'melee', 4, 4, 4, 6, { psychic: true, shock: true });
const bbNeedleShort = W('bbNeedleShort', '瞄準針槍（近距）', 'Scoped needle pistol (short range)', 'ranged', 4, 3, 2, 4, { range: 8, lethal: 5, silent: true }, 'bbNeedle');
const bbNeedleLong = W('bbNeedleLong', '瞄準針槍（遠距）', 'Scoped needle pistol (long range)', 'ranged', 4, 3, 2, 4, { silent: true }, 'bbNeedle');
const bbBonesword = W('bbBonesword', '骨劍與毒爪', 'Bonesword & toxin injector claw', 'melee', 5, 3, 4, 5, { lethal: 5, rending: true });
const bbPatriarchClaws = W('bbPatriarchClaws', '利爪', 'Claws', 'melee', 5, 3, 5, 6, { relentless: true, rending: true });
const bbFamiliarClaws = W('bbFamiliarClaws', '利爪', 'Claws', 'melee', 3, 4, 2, 3, { rending: true });

// ---- Blades of Khaine ----
const bkCatapult = W('bkCatapult', '手裡劍彈射器', 'Shuriken catapult', 'ranged', 4, 3, 3, 4, { rending: true });
const bkTwinCatapult = W('bkTwinCatapult', '雙聯手裡劍彈射器', 'Twin shuriken catapult', 'ranged', 4, 3, 3, 4, { ceaseless: true, rending: true });
const bkPistol = W('bkPistol', '手裡劍手槍', 'Shuriken pistol', 'ranged', 4, 3, 3, 4, { range: 8, rending: true });
const bkTwinPistols = W('bkTwinPistols', '雙手裡劍手槍', 'Twin shuriken pistols', 'ranged', 4, 4, 3, 4, { range: 8, ceaseless: true, rending: true });
const bkTriskThrow = W('bkTriskThrow', '三刃飛輪（投擲）', 'Triskele (throw)', 'ranged', 4, 3, 2, 3, { range: 8, rending: true, torrent: 2 });
const bkTriskSlice = W('bkTriskSlice', '三刃飛輪（劈砍）', 'Triskele (slice)', 'melee', 5, 3, 4, 5, { rending: true });
const bkDiresword = W('bkDiresword', '恐懼之劍', 'Diresword', 'melee', 5, 3, 4, 5, { lethal: 5, rending: true });
const bkFists = W('bkFists', '拳頭', 'Fists', 'melee', 4, 3, 2, 4);
const bkGunButts = W('bkGunButts', '槍托', 'Gun butts', 'melee', 3, 4, 2, 3);
const bkPowerEx = W('bkPowerEx', '動力武器', 'Power weapon', 'melee', 5, 3, 4, 6, { lethal: 5 });
const bkPowerW = W('bkPowerW', '動力武器', 'Power weapon', 'melee', 4, 3, 4, 6, { lethal: 5 });
const bkExecutioner = W('bkExecutioner', '處決者', 'Executioner', 'melee', 5, 3, 3, 7, { lethal: 5 });
const bkMirrorswords = W('bkMirrorswords', '鏡劍', 'Mirrorswords', 'melee', 5, 3, 4, 6, { ceaseless: true, lethal: 5 });
const bkBitingBlade = W('bkBitingBlade', '噬咬之刃', 'Biting blade', 'melee', 5, 3, 5, 6, { rending: true });
const bkScorpClaw = W('bkScorpClaw', '天蠍之爪與鏈鋸劍', 'Scorpion\'s claw & chainsword', 'melee', 5, 3, 4, 6, { brutal: true, lethal: 5 });
const bkTwinChain = W('bkTwinChain', '雙鏈鋸劍', 'Twin chainswords', 'melee', 5, 3, 4, 5, { ceaseless: true, rending: true });
const bkChainsword = W('bkChainsword', '鏈鋸劍', 'Chainsword', 'melee', 4, 3, 4, 5, { rending: true });
/** Shriek-that-Kills (Howling Banshee Aspect Technique): a ranged weapon for one Shoot action. */
export const BK_SHRIEK = { ...W('bkShriek', '殺戮尖嘯', 'Shriek-that-kills', 'ranged', 5, 3, 1, 2, { range: 6, saturate: true, seekLight: true, stun: true, torrent: 1 }), technique: 'hbShriek' };

const shockMaulShield = W('shockMaulShield', '電擊錘與突擊盾', 'Shock maul & assault shield', 'melee', 4, 4, 4, 4, { shock: true, shield: true, repress: true });

const op = (id, zh, en, stats, weapons, count = 1) => ({ id, name: { zh, en }, ...stats, weapons, count });
// Mutoid Vermin (Gellerpox) may only perform these actions.
const VERMIN_ACTIONS = ['reposition', 'dash', 'charge', 'fallBack', 'fight', 'shoot'];

export const TEAMS = [
  {
    id: 'angels',
    name: { zh: '死亡天使', en: 'Angels of Death' },
    color: '#3a78d8',
    style: { zh: '混合隊・精英・全能', en: 'Mixed · Elite · Versatile' },
    blurb: {
      zh: '6 名星際戰士精英。高 APL、高豁免、高傷害，可連開兩槍或連打兩次近戰，並以戰團戰術與戰鬥教條調整打法。',
      en: '6 elite Space Marines. High APL, saves and damage; they can shoot or fight twice and adapt through Chapter Tactics and Combat Doctrines.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '安全保護', en: 'Security' }, { zh: '搜索與摧毀', en: 'Seek & Destroy' }],
      kind: { zh: '混合隊', en: 'Mixed' },
      oneBox: { zh: '勉強：需要起始包，另外還要仲裁者（Intercessors）與突襲仲裁者（Assault Intercessors）兩盒', en: 'Barely: needs the starter set plus the Intercessors and Assault Intercessors boxes' },
      buyable: { zh: '能', en: 'Yes' },
    },
    rule: {
      name: { zh: '阿斯塔特', en: 'Astartes' },
      desc: {
        zh: '每次啟動可執行兩次「射擊」或兩次「近戰」。兩次射擊中至少一次要用爆彈武器；若兩次都用狙擊步槍或重型爆彈槍，第二次多花 1AP。不論指令為何都能反應。開戰前選擇主要與次要戰團戰術。',
        en: 'Each activation may perform two Shoot or two Fight actions. With two Shoots, at least one must use a bolt weapon, and the second costs +1AP if both use the bolt sniper rifle or heavy bolter. Can counteract regardless of order. Choose a primary and secondary Chapter Tactic before the battle.',
      },
    },
    astartes: true, // engine flag for the Astartes faction rule
    tactics: [
      { id: 'aggressive', name: { zh: '侵略', en: 'Aggressive' }, desc: { zh: '近戰武器獲得「撕裂」。', en: 'Melee weapons have Rending.' } },
      { id: 'dueller', name: { zh: '決鬥者', en: 'Dueller' }, desc: { zh: '近戰時，普通成功可格擋對方的暴擊（對方武器有殘暴時除外）。', en: 'When fighting or retaliating, a normal success can block a critical success (not against Brutal).' } },
      { id: 'resolute', name: { zh: '堅毅', en: 'Resolute' }, desc: { zh: '無視 APL 變化，且不受敵方「震撼」影響。', en: 'Ignores changes to its APL and enemy Shock.' } },
      { id: 'stealthy', name: { zh: '隱匿', en: 'Stealthy' }, desc: { zh: '被射擊時若能保留掩護豁免，可多保留 1 顆，或把其中 1 顆當成暴擊豁免。', en: 'When shot, if it can retain cover saves: retain one more, or retain one as a critical success.' } },
      { id: 'mobile', name: { zh: '機動', en: 'Mobile' }, desc: { zh: '「撤退」少 1AP；在敵人控制範圍內也能「衝鋒」。', en: 'Fall Back costs 1 less AP; can Charge while within control range of an enemy.' } },
      { id: 'hardy', name: { zh: '頑強', en: 'Hardy' }, desc: { zh: '被射擊時，防禦骰 5+ 為暴擊成功。', en: 'When shot, defence dice results of 5+ are critical successes.' } },
      { id: 'sharpshooter', name: { zh: '神射手', en: 'Sharpshooter' }, desc: { zh: '本次啟動未轉移、衝鋒或撤退時，爆彈武器獲得「精準 1」與「嚴厲」。', en: 'If it hasn\'t Repositioned, Charged or Fallen Back this activation, its bolt weapons have Accurate 1 and Severe.' } },
      { id: 'siege', name: { zh: '攻城專家', en: 'Siege Specialist' }, desc: { zh: '遠程武器獲得「飽和」。', en: 'Ranged weapons have Saturate.' } },
    ],
    defaultTactics: ['sharpshooter', 'hardy'],
    ploys: [
      // The three Combat Doctrines are one ploy: only one can be chosen per turning point.
      { id: 'docDevastator', group: 'doctrine', cp: 1, name: { zh: '戰鬥教條：毀滅', en: 'Combat Doctrine: Devastator' },
        desc: { zh: '本回合射擊 6" 外的敵人時，武器獲得「平衡」。', en: 'This TP, weapons have Balanced when shooting an enemy more than 6" away.' } },
      { id: 'docTactical', group: 'doctrine', cp: 1, name: { zh: '戰鬥教條：戰術', en: 'Combat Doctrine: Tactical' },
        desc: { zh: '本回合射擊 6" 內的敵人時，武器獲得「平衡」。', en: 'This TP, weapons have Balanced when shooting an enemy within 6".' } },
      { id: 'docAssault', group: 'doctrine', cp: 1, name: { zh: '戰鬥教條：突擊', en: 'Combat Doctrine: Assault' },
        desc: { zh: '本回合近戰或反擊時，武器獲得「平衡」。', en: 'This TP, weapons have Balanced when fighting or retaliating.' } },
      { id: 'indomitus', cp: 1, name: { zh: '帝國征程', en: 'Indomitus' },
        desc: { zh: '本回合友方被射擊時，若防禦骰失敗 2 顆以上，可把其中 1 顆改為普通成功。', en: 'This TP, when a friendly operative is shot and rolls two or more failed defence dice, one becomes a normal success.' } },
      { id: 'noFear', cp: 1, name: { zh: '無所畏懼', en: 'And They Shall Know No Fear' },
        desc: { zh: '本回合友方無視重傷造成的數值變化。', en: 'This TP, friendly operatives ignore stat changes from being injured.' } },
      { id: 'adaptiveTactics', cp: 1, name: { zh: '適應戰術', en: 'Adaptive Tactics' },
        desc: { zh: '本回合把次要戰團戰術換成另一個（回合結束後換回來）。（選一個）', en: 'This TP, change your secondary Chapter Tactic (it returns at the end of the turning point).' } },
    ],
    // The leader (Intercessor Sergeant, Assault Sergeant or Captain) + 5 picks, each once except Warriors.
    replacements: {
      sgt: ['sgt', 'asgt', 'captain'],
      ...Object.fromEntries(['assault', 'grenadier', 'gunner', 'heavy', 'sniper'].map((id) => [id, ['assault', 'warrior', 'grenadier', 'gunner', 'heavy', 'sniper']])),
    },
    ops: [
      op('sgt', '仲裁者士官', 'Intercessor Sergeant', { apl: 3, move: 6, save: 3, wounds: 15, base: 32, doctrineWarfare: ['docDevastator', 'docTactical'], chapterVeteran: true, loadouts: isgtLoadouts }, isgtLoadouts['bolt-chain']),
      op('asgt', '突襲仲裁者士官', 'Assault Intercessor Sergeant', { apl: 3, move: 6, save: 3, wounds: 15, base: 32, doctrineWarfare: ['docAssault', 'docTactical'], chapterVeteran: true, loadouts: asgtLoadouts }, asgtLoadouts['pistol-chain'], 0),
      op('captain', '星際戰士連長', 'Space Marine Captain', { apl: 3, move: 6, save: 3, wounds: 15, base: 40, heroicLeader: true, ironHalo: true }, [plasmaPistolAD, plasmaPistolADs, powerFistCap], 0),
      op('assault', '突襲仲裁者戰士', 'Assault Intercessor Warrior', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, adWarrior: true }, [heavyBoltPistol, chainswordA]),
      op('warrior', '仲裁者戰士', 'Intercessor Warrior', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, adWarrior: true, loadouts: warriorLoadouts }, warriorLoadouts.bolt, 0),
      op('grenadier', '突襲仲裁者擲彈兵', 'Assault Intercessor Grenadier', { apl: 3, move: 6, save: 3, wounds: 14, base: 32 }, [heavyBoltPistol, fragGrenade, krakGrenade, chainswordA]),
      op('gunner', '仲裁者槍手', 'Intercessor Gunner', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, loadouts: gunnerLoadouts }, gunnerLoadouts.bolt),
      op('heavy', '重裝仲裁者槍手', 'Heavy Intercessor Gunner', { apl: 3, move: 5, save: 3, wounds: 18, base: 40 }, [boltPistol, hbFocused, hbSweeping, fistsA]),
      op('sniper', '清除者狙擊手', 'Eliminator Sniper', { apl: 3, move: 7, save: 3, wounds: 12, base: 40, camoCloak: true, optics: true }, [boltPistol, sniperExec, sniperHyper, sniperMortis, fistsA]),
    ],
  },
  {
    id: 'kommandos',
    name: { zh: '歐克蠻人', en: 'Kommandos' },
    color: '#4f9a2b',
    style: { zh: '射擊隊・潛行・突襲', en: 'Shooting · Stealth · Ambush' },
    blurb: {
      zh: '10 名狡猾的歐克突擊隊。隱蔽指令下也能衝鋒，配上各種專家武器，擅長潛入後突然發難。',
      en: '10 cunning Ork Kommandos. They can Charge while Concealed and bring a specialist for every job — sneak in, then strike.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '搜索與摧毀', en: 'Seek & Destroy' }, { zh: '滲透', en: 'Infiltration' }],
      kind: { zh: '射擊隊', en: 'Shooting' },
      oneBox: { zh: '能', en: 'Yes' },
      buyable: { zh: '能，這些模型都已成為大桌單位', en: 'Yes, the models are now Warhammer 40,000 units' },
      note: { zh: '2025 年已退出賽季：官方比賽不能使用，一般對戰或非官方比賽可以使用。', en: 'Rotated out of the season in 2025: not allowed in official events, fine for casual and unofficial games.' },
    },
    rule: {
      name: { zh: '割喉者', en: 'Throat Slittas' },
      desc: {
        zh: '每名友方歐克蠻人（炸彈史奎格除外）在隱蔽指令下也能執行「衝鋒」。',
        en: 'Each friendly KOMMANDO operative (not a Bomb Squig) can perform the Charge action while it has a Conceal order.',
      },
    },
    concealCharge: true, // engine flag for Throat Slittas
    ploys: [
      { id: 'dakkaDakka', cp: 1, name: { zh: '達卡！達卡！達卡！', en: 'Dakka! Dakka! Dakka!' },
        desc: { zh: '本回合友方遠程武器獲得「懲罰」。', en: 'This TP, friendly ranged weapons have Punishing.' } },
      { id: 'waaagh', cp: 1, name: { zh: '哇啊啊！', en: 'Waaagh!' },
        desc: { zh: '本回合友方近戰武器獲得「平衡」。', en: 'This TP, friendly melee weapons have Balanced.' } },
      { id: 'skulkAbout', cp: 1, name: { zh: '鬼祟潛行', en: 'Skulk About' },
        desc: { zh: '本回合隱蔽指令的友方被射擊時，可多保留 1 顆防禦骰作為普通成功（可與掩護豁免疊加）。', en: 'This TP, a friendly operative with a Conceal order being shot retains one extra defence die as a normal success (on top of any cover save).' } },
      { id: 'sssshhhh', cp: 1, name: { zh: '噓——！', en: 'Sssshhhh!' },
        desc: { zh: '不是敵人有效目標、或是隱蔽指令且離敵人超過 6" 的友方特工，立刻各免費衝刺一次。第 1 回合不能用。', en: 'Each friendly operative that isn\'t a valid target for enemy operatives, or has a Conceal order and is more than 6" from enemy operatives, makes a free Dash. Not in the first turning point.' } },
    ],
    // The Boss Nob and nine selections: each once except Boys; the Grot and the Bomb Squig count as half a selection each, so the
    // extra slot (empty, Grot or Bomb Squig) holds the second of the pair.
    perCopyRoster: true,
    replacements: {
      ...Object.fromEntries(['breacha', 'burna', 'comms', 'dakka', 'rokkit', 'slasha', 'snipa', 'boy'].map((id) => [id, KM_PICKS])),
      kmNone: ['kmNone', 'grot', 'squig'],
    },
    ops: [
      op('nob', '頭目', 'Boss Nob', { apl: 3, move: 6, save: 5, wounds: 14, base: 32, krumpin: true, support: 'getItDun', loadouts: nobLoadoutsKM }, nobLoadoutsKM.klaw),
      op('breacha', '破門小子', 'Breacha Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, kmBreacha: true }, [slugga, breachaRam]),
      op('burna', '噴火小子', 'Burna Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 32 }, [burnaStd, burnaDeluge, fistsO]),
      op('comms', '通訊小子', 'Comms Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, support: 'listenIn', gotAPlan: true }, [shokkaPistol, fistsO]),
      op('dakka', '達卡小子', 'Dakka Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, dakkaDash: true }, [dakkaShort, dakkaLong, fistsO]),
      op('rokkit', '火箭小子', 'Rokkit Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 32 }, [rokkitAimed, rokkitMobile, fistsO]),
      op('slasha', '劈砍小子', 'Slasha Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, datAllYouGot: true }, [throwingKnives, twinChoppas]),
      op('snipa', '狙擊小子', 'Snipa Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 32 }, [snipaConcealed, snipaStationary, snipaSweeping, fistsO]),
      op('boy', '小子', 'Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, wotNotz: true }, [slugga, choppa], 2),
      op('grot', '格洛特', 'Grot', { apl: 2, move: 6, save: 5, wounds: 5, base: 25, kmSmall: true, sneaky: true, noEngage: true, kmGrapple: true }, [grotChoppa], 0),
      op('squig', '炸彈史奎格', 'Bomb Squig', { apl: 2, move: 6, save: 5, wounds: 5, base: 25, kmSmall: true, expendable: true, stoopid: true, boom: true, actionsOnly: ['charge', 'dash', 'fight', 'reposition', 'shoot'] }, [kmExplosives, kmBite], 0),
      op('kmNone', '（空：額外名額）', '(empty: the extra half selection)', { apl: 0, move: 0, save: 6, wounds: 1, base: 25, none: true }, [kmBite]),
    ],
  },
  {
    id: 'tauPathfinders',
    name: { zh: '探路者', en: 'Pathfinders' },
    color: '#d0922f',
    style: { zh: '射擊隊・標記光・脆弱', en: 'Shooting · Markerlights · Fragile' },
    blurb: {
      zh: '12 名鈦族偵察兵與無人機。先用標記光疊加標記，再集中火力；單兵脆弱，要善用掩體與距離。',
      en: '12 T\'au scouts and drones. Stack Markerlight tokens, then focus fire; fragile alone, so use cover and range.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '滲透', en: 'Infiltration' }, { zh: '偵察', en: 'Recon' }],
      kind: { zh: '射擊隊', en: 'Shooting' },
      oneBox: { zh: '能，但可能要多一盒來做無人機和普通單位', en: 'Yes, but you may want a second box for drones and rank-and-file' },
      buyable: { zh: 'KT 盒與大桌盒都已停售；板件目前在鈦族戰鬥巡邏包（Combat Patrol）裡，只能從那邊購買', en: 'The KT box and the big-table box are discontinued; the sprues are in the current T\'au Combat Patrol, the only way to buy them' },
    },
    markerlights: true, // engine flag for the Markerlights faction rule
    rule: {
      name: { zh: '標記光', en: 'Markerlights' },
      desc: {
        zh: '獨特動作「標記光」(1AP)：可見的敵人獲得 1 個標記光標記（最多 4 個，跨回合保留）。友方探路者射擊有標記的敵人時依數量累加：1 飽和＋平衡；2 命中改善 1（最佳 3+）；3 目標不能被遮蔽；4 搜尋（輕型）；5 搜尋。同一次啟動中射擊與標記光必須是同一目標。有標記的敵人每次啟動中第一次移動會移除 1 個。',
        en: 'Unique action Markerlight (1AP): a visible enemy gains a Markerlight token (max 4, kept between TPs). Friendly Pathfinders shooting it gain, cumulatively: 1 Saturate + Balanced; 2 Hit improved by 1 (to 3+); 3 target cannot be obscured; 4 Seek Light; 5 Seek. Shoot and Markerlight in the same activation must pick the same target. A marked enemy loses one token the first time it moves in each activation.',
      },
    },
    ploys: [
      { id: 'suppressingFire', cp: 1, name: { zh: '壓制射擊', en: 'Suppressing Fire' },
        desc: { zh: '本回合敵人射擊時，若目標不是最近的有效目標，不能重擲攻擊骰。', en: 'This TP, when an enemy shoots a target that isn\'t the closest valid target, it can\'t re-roll attack dice.' } },
      { id: 'bonded', cp: 1, name: { zh: '血盟', en: 'Bonded' },
        desc: { zh: '本回合友方（無人機除外）射擊時，若 3" 內有另一名友方（無人機除外），遠程武器獲得「精準 1」。', en: 'This TP, a friendly non-drone shooting within 3" of another friendly non-drone has Accurate 1.' } },
      { id: 'takeCover', cp: 1, name: { zh: '尋找掩護', en: 'Take Cover' },
        desc: { zh: '本回合友方被射擊時，若能保留掩護豁免，豁免值改善 1。', en: 'This TP, when a friendly operative is shot and can retain cover saves, its Save improves by 1.' } },
      { id: 'reconSweep', cp: 1, name: { zh: '偵察掃蕩', en: 'Recon Sweep' },
        desc: { zh: '選一條不是己方的戰場邊緣：完全在它 6" 內的每名友方探路者可免費衝刺一次，結束時必須完全在某條非己方邊緣 6" 內。第 1 回合不能用。', en: 'Pick a killzone edge that isn\'t yours: each friendly Pathfinder wholly within 6" of it makes a free Dash, ending wholly within 6" of a killzone edge that isn\'t yours. Not in the first turning point.' } },
      // Shas'ui Art of War: once per battle each, one per turning point, while the Shas'ui is in the killzone.
      { id: 'montka', group: 'artOfWar', oncePerBattle: true, needs: 'shasui', cp: 0, name: { zh: '兵法：蒙卡', en: "Art of War: Mont'ka" },
        desc: { zh: '本回合友方 Move +1"。（整場一次，需要小隊長在場）', en: 'This TP, friendly operatives get +1" Move. (Once per battle; needs the Shas\'ui)' } },
      { id: 'kauyon', group: 'artOfWar', oncePerBattle: true, needs: 'shasui', cp: 0, name: { zh: '兵法：考陽', en: 'Art of War: Kauyon' },
        desc: { zh: '本回合隱蔽指令的友方啟動時可免費執行標記光。（整場一次，需要小隊長在場）', en: 'This TP, friendly operatives with a Conceal order can Markerlight for free. (Once per battle; needs the Shas\'ui)' } },
    ],
    // Shas'ui + 11 selections: each once, except Shas'la and Weapons Experts (two at most); the MB3 Recon Drone counts as two
    // selections, so its extra selection is a slot set to "none".
    replacements: Object.fromEntries(['grenadier', 'blooded', 'comms', 'controller', 'marksman', 'medic', 'transpectral', 'ionExpert', 'railExpert', 'gunDrone', 'markerDrone']
      .map((id) => [id, ['grenadier', 'blooded', 'comms', 'controller', 'marksman', 'medic', 'shasla', 'transpectral', 'ionExpert', 'railExpert', 'mb3', 'mv31', 'mv33', 'gunDrone', 'mv4', 'markerDrone', 'pfNone']])),
    ops: [
      op('shasui', '鈦衛小隊長', "Shas'ui", { apl: 2, move: 6, save: 5, wounds: 8, base: 25, markerlight: 1 }, [pulseCarbineSgt, gunButtSgt]),
      op('grenadier', '突擊擲彈兵', 'Assault Grenadier', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, markerlight: 1 }, [fusionGrenade, fragGrenadeT, krakGrenadeT, pulseCarbine, fistsT]),
      op('blooded', '老兵', 'Blooded', { apl: 2, move: 6, save: 5, wounds: 8, base: 25, markerlight: 1, veteran: true }, [suppressedCarbine, bionicArm]),
      op('comms', '通訊專家', 'Comms Specialist', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, markerlight: 1, signal: true }, [pulseCarbine, fistsC]),
      op('controller', '無人機操控員', 'Drone Controller', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, markerlight: 1, droneController: true }, [pulseCarbine, fistsT]),
      op('marksman', '神射手', 'Marksman', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [marksmanRail, marksmanDart, fistsT]),
      op('medic', '醫療技師', 'Medical Technician', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, markerlight: 1, medic: true, medikit: true }, [pulseCarbine, fistsT]),
      op('transpectral', '跨光譜干擾兵', 'Transpectral Interference', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, markerlight: 1, systemJam: true, multiVision: true }, [pulseCarbine, fistsT]),
      op('ionExpert', '武器專家（離子）', 'Weapons Expert (ion)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, pfExpert: true }, [ionStandard, ionOvercharge, fistsT]),
      op('railExpert', '武器專家（軌道）', 'Weapons Expert (rail)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, pfExpert: true }, [railRifle, fistsT]),
      op('gunDrone', 'MV1 槍械無人機', 'MV1 Gun Drone', { apl: 2, move: 6, save: 4, wounds: 7, base: 32, drone: true, actionsOnly: ['charge', 'dash', 'fallBack', 'fight', 'reposition', 'shoot'] }, [twinPulseCarbine, ram]),
      op('markerDrone', 'MV7 標記無人機', 'MV7 Marker Drone', { apl: 2, move: 6, save: 4, wounds: 7, base: 32, markerlight: 2, drone: true, actionsOnly: ['charge', 'dash', 'fallBack', 'fight', 'markerlight', 'reposition'] }, [ram]),
      // Not in the default team (picked in setup).
      op('shasla', '鈦衛戰士', "Shas'la", { apl: 2, move: 6, save: 5, wounds: 7, base: 25, markerlight: 1, groupAct: 'pfShasla', fearless: true }, [pulseCarbine, fistsT], 0),
      op('mb3', 'MB3 偵察無人機', 'MB3 Recon Drone', { apl: 3, move: 6, save: 4, wounds: 12, base: 32, markerlight: 1, analyse: true, drone: true, actionsOnly: ['charge', 'dash', 'fallBack', 'fight', 'markerlight', 'reposition', 'shoot'] }, [burstFocused, burstSweeping, ram], 0),
      op('mv31', 'MV31 脈衝加速無人機', 'MV31 Pulse Accelerator Drone', { apl: 2, move: 6, save: 4, wounds: 7, base: 32, drone: true, pfAccelerator: true, actionsOnly: ['charge', 'dash', 'fallBack', 'fight', 'pfAccel', 'reposition'] }, [ram], 0),
      op('mv33', 'MV33 重力抑制無人機', 'MV33 Grav-inhibitor Drone', { apl: 2, move: 6, save: 4, wounds: 7, base: 32, drone: true, pfGrav: true, actionsOnly: ['charge', 'dash', 'fallBack', 'fight', 'reposition'] }, [ram], 0),
      op('mv4', 'MV4 護盾無人機', 'MV4 Shield Drone', { apl: 2, move: 6, save: 4, wounds: 7, base: 32, drone: true, pfShield: true, ignorePiercing: true, actionsOnly: ['charge', 'dash', 'fallBack', 'fight', 'reposition'] }, [ram], 0),
      op('pfNone', '（空：MB3 佔兩個名額）', '(empty: the MB3 takes two selections)', { apl: 0, move: 0, save: 6, wounds: 1, base: 25, none: true }, [fistsT], 0),
    ],
  },
  {
    id: 'plagueMarines',
    name: { zh: '瘟疫戰士', en: 'Plague Marines' },
    color: '#8a9a3a',
    style: { zh: '混合隊・耐打・中毒', en: 'Mixed · Resilient · Poison' },
    blurb: {
      zh: '6 名納垢的混沌星際戰士。移動慢但極為耐打，用中毒標記削弱敵人，再以劇毒武器收割。',
      en: '6 Chaos Space Marines of Nurgle. Slow but extremely tough; poison the enemy, then finish them with Toxic weapons.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '搜索與摧毀', en: 'Seek & Destroy' }, { zh: '安全保護', en: 'Security' }],
      kind: { zh: '混合隊', en: 'Mixed' },
      oneBox: { zh: '能', en: 'Yes' },
      buyable: { zh: '能，在 KT 初始包', en: 'Yes, in the Kill Team starter set' },
    },
    astartes: true, // engine flag for the Astartes faction rule
    resilient: true, // Disgustingly Resilient
    rule: {
      name: { zh: '中毒・令人作嘔的韌性・阿斯塔特', en: 'Poison · Disgustingly Resilient · Astartes' },
      desc: {
        zh: '中毒：用有「中毒」的武器造成傷害時，敵人獲得中毒標記；有中毒標記的特工每次啟動時受到 1 傷害。劇毒：對行動開始時已中毒的敵人，武器兩個傷害值都 +1。令人作嘔的韌性：每顆攻擊骰造成 3 以上傷害時擲 D6，4+ 傷害 -1。阿斯塔特：每次啟動可兩次射擊（至少一次用爆彈手槍、爆彈槍或靈能武器，同一把靈能遠程武器不能用兩次）或兩次近戰；不論指令都能反應。',
        en: 'Poison: damaging an enemy with a Poison weapon gives it a Poison token; an operative with one takes 1 damage whenever it is activated. Toxic: +1 to both Dmg against an enemy poisoned at the start of the action. Disgustingly Resilient: whenever an attack die inflicts 3+ damage, roll a D6: on a 4+ it deals 1 less. Astartes: two Shoots (one with a bolt pistol, boltgun or Psychic weapon; not the same Psychic ranged weapon twice) or two Fights per activation; can counteract regardless of order.',
      },
    },
    ploys: [
      { id: 'contagion', cp: 1, name: { zh: '傳染', en: 'Contagion' },
        desc: { zh: '本回合敵人若中毒且在友方 3" 內可見，或在掌旗手 3" 內可見：Move -2"、武器命中變差 1（不與重傷累加）。掌旗手在敵方領域時 0CP。', en: 'This TP, an enemy that is poisoned and visible within 3" of a friendly operative, or visible within 3" of the Icon Bearer, gets -2" Move and worsens its weapons\' Hit by 1 (not cumulative with injured). 0CP while the Icon Bearer is in enemy territory.' } },
      { id: 'lumbering', cp: 1, name: { zh: '笨重死神', en: 'Lumbering Death' },
        desc: { zh: '本回合友方在本次啟動移動不超過 3" 時射擊或近戰，以及反擊時，武器獲得「無休」。', en: 'This TP, friendly weapons have Ceaseless when shooting or fighting in an activation in which the operative moved no more than 3", and when retaliating.' } },
      { id: 'cloudFlies', cp: 1, name: { zh: '蒼蠅雲', en: 'Cloud of Flies' },
        desc: { zh: '在戰場放一個蒼蠅雲標記（放在你選的一名友方身上）：敵人射擊離標記超過 3"、且完全在標記 1" 內的友方瘟疫戰士時，該友方被遮蔽。下個策略階段的準備步驟移除。', en: 'Place a Cloud of Flies marker (on a friendly you pick): when an operative shoots a friendly PLAGUE MARINE more than 3" from the marker and wholly within 1" of it, that friendly is obscured. Removed in the Ready step of the next Strategy phase.' } },
      { id: 'nurglings', cp: 1, name: { zh: '寧古蘭', en: 'Nurglings' },
        desc: { zh: '選友方瘟疫戰士 3" 內的一名敵人（或 7" 內且有你的中毒標記的敵人）：到它下次啟動結束 APL -1。', en: 'Pick an enemy within 3" of a friendly PLAGUE MARINE (or within 7" with one of your Poison tokens): -1 APL until the end of its next activation.' } },
    ],
    // The Champion plus five of the six others (each once).
    replacements: Object.fromEntries(['bombardier', 'fighter', 'heavyGunner', 'icon', 'caster'].map((id) => [id, ['bombardier', 'fighter', 'heavyGunner', 'icon', 'caster', 'warrior']])),
    ops: [
      op('champion', '瘟疫戰士冠軍', 'Plague Marine Champion', { apl: 3, move: 5, save: 3, wounds: 15, base: 32, blessing: true }, [plasmaPistolStd, plasmaPistolSup, plagueSword]),
      op('bombardier', '瘟疫戰士轟炸兵', 'Plague Marine Bombardier', { apl: 3, move: 5, save: 3, wounds: 14, base: 32 }, [boltgunPM, blightGrenade, krakGrenadePM, fistsPM]),
      op('fighter', '瘟疫戰士鬥士', 'Plague Marine Fighter', { apl: 3, move: 5, save: 3, wounds: 14, base: 32, flail: true }, [boltPistolPM, flail]),
      op('heavyGunner', '瘟疫戰士重火力手', 'Plague Marine Heavy Gunner', { apl: 3, move: 5, save: 3, wounds: 14, base: 32 }, [boltPistolPM, plagueSpewer, fistsPM]),
      op('icon', '瘟疫戰士掌旗手', 'Plague Marine Icon Bearer', { apl: 3, move: 5, save: 3, wounds: 14, base: 32, iconBearer: true }, [boltPistolPM, plagueKnife5]),
      op('caster', '惡毒瘟疫術士', 'Malignant Plaguecaster', { apl: 3, move: 5, save: 3, wounds: 14, base: 32, miasma: true, vitality: true }, [entropy, plagueWind, corruptedStaff]),
      op('warrior', '瘟疫戰士', 'Plague Marine Warrior', { apl: 3, move: 5, save: 3, wounds: 14, base: 32, repulsive: true }, [boltgunW, plagueKnife4], 0),
    ],
  },
  {
    id: 'farstalkers',
    name: { zh: '遠獵者', en: 'Farstalker Kinband' },
    color: '#b9772f',
    style: { zh: '射擊隊・狩獵・靈活', en: 'Shooting · Hunters · Agile' },
    blurb: {
      zh: '12 名克魯特獵人與獵犬。可在策略階段與反應時調整指令，用「呼喚獵殺」鎖定獵物，再以各式專家武器圍獵。',
      en: '12 Kroot hunters and hounds. They switch orders in the Strategy phase and when counteracting, Call the Kill on their prey, then run it down with specialists.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '滲透', en: 'Infiltration' }, { zh: '偵察', en: 'Recon' }],
      kind: { zh: '射擊隊', en: 'Shooting' },
      oneBox: { zh: '能', en: 'Yes' },
      buyable: { zh: '能，KT 盒與大桌盒內容一樣', en: 'Yes — the KT box and the Warhammer 40,000 box are the same' },
      note: { zh: '將於 2026 年退出賽季：屆時官方比賽不能使用，一般對戰或非官方比賽仍可使用。', en: 'Rotating out of the season in 2026: then not allowed in official events, still fine for casual and unofficial games.' },
    },
    farstalker: true, // engine flag for the Farstalker faction rule (order changes)
    rule: {
      name: { zh: '遠獵者', en: 'Farstalker' },
      desc: {
        zh: '策略階段輪到你選計謀時，可改變最多 3 名不在敵人控制範圍內的友方指令。輪到你反應時，也可以改成變更 1 名友方的指令（仍算你的反應，但不算該特工的反應）。',
        en: 'When you choose ploys in the Strategy phase, change the order of up to three friendly operatives not within enemy control range. When it\'s your turn to counteract, you can instead change one friendly operative\'s order (it counts as your counteract, not that operative\'s).',
      },
    },
    ploys: [
      { id: 'prey', cp: 1, name: { zh: '獵物', en: 'Prey' },
        desc: { zh: '本回合友方在本次啟動未轉移、衝鋒或撤退時射擊，遠程武器獲得「平衡」與「嚴厲」（已有平衡則改為「無休」與「嚴厲」）。', en: 'This TP, a friendly operative shooting in an activation without Reposition, Charge or Fall Back has Balanced and Severe (Ceaseless and Severe if already Balanced).' } },
      { id: 'cutThroats', cp: 1, name: { zh: '割喉', en: 'Cut-throats' },
        desc: { zh: '本回合友方近戰武器 ATK +1（最多 5）。', en: 'This TP, friendly melee weapons get +1 Atk (max 5).' } },
      { id: 'bound', cp: 1, name: { zh: '飛躍', en: 'Bound' },
        desc: { zh: '每名友方特工每次啟動中，向上攀爬時可無視第一個 2" 的垂直距離（一次攀爬）。', en: 'During each friendly operative\'s activation, ignore the first 2" of vertical distance of one climb up.' } },
      { id: 'rogue', cp: 1, name: { zh: '遊俠', en: 'Rogue' },
        desc: { zh: '本回合友方被射擊時無視「飽和」；若能保留掩護豁免，可多保留 1 顆，或把 1 顆當成暴擊豁免。', en: 'This TP, friendly operatives being shot ignore Saturate; if they can retain cover saves, retain one more, or one as a critical success.' } },
    ],
    // The Kill-broker and eleven selections: each once, except Hounds (two at most) and Warriors.
    perCopyRoster: true,
    replacements: Object.fromEntries([...KF_SLOTS].map((id) => [id, KF_SLOTS])),
    ops: [
      op('killBroker', '獵殺掮客', 'Kroot Kill-broker', { apl: 2, move: 6, save: 5, wounds: 9, base: 32, callTheKill: true, loadouts: kbLoadouts }, kbLoadouts.rifle),
      op('bowHunter', '弓獵者', 'Kroot Bow-hunter', { apl: 2, move: 6, save: 5, wounds: 8, base: 28, energise: true }, [bowFused, bowGlide, bowVoltaic, krootBlade]),
      op('coldBlood', '冷血者', 'Kroot Cold-blood', { apl: 2, move: 6, save: 5, wounds: 9, base: 28, coldBlooded: true, hardyCrit: true }, [krootRifleCB, krootBlade]),
      op('cutSkin', '割膚者', 'Kroot Cut-skin', { apl: 2, move: 6, save: 5, wounds: 8, base: 28, viciousDuellist: true, savageAssault: true }, [cutSkinBlades]),
      op('hound', '克魯特獵犬', 'Kroot Hound', { apl: 2, move: 8, save: 5, wounds: 7, base: 28, badTempered: true, kfHound: true, actionsOnly: ['charge', 'dash', 'fallBack', 'fight', 'reposition', 'kfGather', 'pickUp'] }, [rippingFangs], 2),
      op('heavyGunner', '重火力手', 'Kroot Heavy Gunner', { apl: 2, move: 6, save: 5, wounds: 8, base: 28, loadouts: hgLoadouts }, hgLoadouts.tribalest),
      op('longSight', '遠視者', 'Kroot Long-sight', { apl: 2, move: 6, save: 5, wounds: 8, base: 28, longSight: true }, [huntingConcealed, huntingMobile, huntingStationary, krootBlade]),
      op('pistolier', '雙槍手', 'Kroot Pistolier', { apl: 2, move: 6, save: 5, wounds: 8, base: 28, quickDraw: true }, [pistolsFocused, pistolsSalvo, krootBlade]),
      op('stalker', '潛獵者', 'Kroot Stalker', { apl: 2, move: 6, save: 5, wounds: 8, base: 28, concealCharge: true, stealthAttack: true }, [scattergun, stalkerBlade]),
      op('tracker', '追蹤者', 'Kroot Tracker', { apl: 2, move: 6, save: 5, wounds: 8, base: 28, support: 'eyeAbove', pechra: true }, [krootRifle, krootBlade]),
      op('warrior', '克魯特戰士', 'Kroot Warrior', { apl: 2, move: 6, save: 5, wounds: 8, base: 28, kfWarrior: true, loadouts: warriorLoadoutsKB }, warriorLoadoutsKB.rifle),
    ],
  },
  {
    id: 'deathKorps',
    name: { zh: '克里格死亡兵團', en: 'Death Korps' },
    color: '#7d8a8f',
    style: { zh: '射擊隊・人海・命令', en: 'Shooting · Numbers · Orders' },
    blurb: {
      zh: '14 名克里格老兵。單兵脆弱，但人數最多；看守長下達衛兵命令，步兵兩兩連續行動，配上專家與特種武器打消耗戰。',
      en: '14 Krieg veterans. Fragile alone but the most numerous; the Watchmaster issues Guardsman Orders, Troopers activate in pairs, and specialists grind the enemy down.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '搜索與摧毀', en: 'Seek & Destroy' }, { zh: '安全保護', en: 'Security' }],
      kind: { zh: '射擊隊', en: 'Shooting' },
      oneBox: { zh: '否：需要多買一盒克里格普通兵', en: 'No: you need an extra box of Krieg rank-and-file' },
      buyable: { zh: '否：已絕版，也不會有大桌盒', en: 'No: out of production, and no Warhammer 40,000 box' },
      note: { zh: '2025 年已退出賽季：官方比賽不能使用，一般對戰或非官方比賽可以使用。', en: 'Rotated out of the season in 2025: not allowed in official events, fine for casual and unofficial games.' },
    },
    bringItDown: true, // the marked enemy (Bring it Down!) gives Punishing instead of Call the Kill's Balanced
    rule: {
      name: { zh: '衛兵命令・群體啟動', en: 'Guardsmen Orders · Group Activation' },
      desc: {
        zh: '策略階段，看守長可下達一道衛兵命令給 6" 內的友方（看守長殘廢後由心腹代替），效果到本回合結束：瞄準！（遠程武器「無休」，迫擊砲除外）、上刺刀！（近戰武器「無休」）、固守！（被射擊且能保留掩護豁免時，可重擲某一點數的所有防禦骰）、快快快！（轉移 Move +1"）。通訊兵可轉達命令給全隊（之後自己 APL -1）。步兵行動完後，必須接著啟動另一名步兵，再換對手。',
        en: 'In the Strategy phase the Watchmaster can issue a Guardsman Order to friendlies within 6" (the Confidant takes over once it falls), lasting the turning point: Take Aim! (ranged Ceaseless, not the mortar), Fix Bayonets! (melee Ceaseless), Dig In! (when shot and cover saves can be retained, re-roll all defence dice of one result), Move! Move! Move! (+1" Move for Reposition). The Vox-operator can relay the order to the whole team (then -1 APL). After a Trooper is expended, another ready Trooper must activate before the opponent.',
      },
    },
    ploys: [
      { id: 'siegeWarfare', cp: 1, name: { zh: '攻城戰', en: 'Siege Warfare' },
        desc: { zh: '本回合友方遠程武器獲得「飽和」與「精準 1」。', en: 'This TP, friendly ranged weapons have Saturate and Accurate 1.' } },
      { id: 'takeCover', cp: 1, name: { zh: '尋找掩護', en: 'Take Cover' },
        desc: { zh: '本回合友方被射擊時，若能保留掩護豁免，豁免值改善 1。', en: 'This TP, when a friendly operative is shot and can retain cover saves, its Save improves by 1.' } },
      { id: 'clearTheLine', cp: 1, name: { zh: '清理戰線', en: 'Clear the Line' },
        desc: { zh: '本回合友方近戰武器獲得「精準 1」；完全在我方領域內近戰，或反擊時，再獲得「嚴厲」。', en: 'This TP, friendly melee weapons have Accurate 1; also Severe when fighting wholly within your territory or when retaliating.' } },
      { id: 'regroup', cp: 1, name: { zh: '重整', en: 'Regroup' },
        desc: { zh: '支援：選一名離敵人超過 3" 的友方；它 5" 內不在敵人控制範圍內的其他友方各免費衝刺一次，必須結束得更靠近它。（不能和懷錶同回合使用）', en: 'Support: pick a friendly more than 3" from enemies; each other friendly within 5" and not engaged makes a free Dash, ending closer to it. (Not in the same turning point as the Chronometer.)' } },
    ],
    // The Watchmaster, four Troopers (each can instead be a ploy that costs 0CP for the battle) and nine selections: each once, except Troopers.
    perCopyRoster: true,
    replacements: {
      ...Object.fromEntries(['confidant', 'bruiser', 'gunnerPlasma', 'gunnerMelta', 'medic', 'sniper', 'spotter', 'vox', 'zealot'].map((id) => [id, DK_PICKS])),
      trooper: ['trooper', 'dkFree'],
    },
    ops: [
      op('watchmaster', '看守長', 'Watchmaster', { apl: 2, move: 6, save: 5, wounds: 8, base: 25, watchmaster: true, adaptiveOrders: true, loadouts: wmLoadouts }, [plasmaPistolWM, plasmaPistolWMs, powerWeaponWM]),
      op('confidant', '心腹', 'Confidant', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, confidant: true, loadouts: cfLoadouts }, [boltPistolCF, chainswordCF]),
      op('bruiser', '打手', 'Bruiser', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, bruiser: true }, [lasgunDK, trenchClub]),
      op('gunnerPlasma', '槍手（等離子）', 'Gunner (plasma)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [plasmaGunDK, plasmaGunDKs, bayonetDK]),
      op('gunnerMelta', '槍手（熱熔）', 'Gunner (melta)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [meltagunDK, bayonetDK]),
      op('gunnerFlamer', '槍手（火焰噴射器）', 'Gunner (flamer)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [flamerDK, bayonetDK], 0),
      op('gunnerGL', '槍手（榴彈發射器）', 'Gunner (grenade launcher)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [glFragDK, glKrakDK, bayonetDK], 0),
      op('medic', '醫療兵', 'Medic', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, medic: true, medikit: true }, [lasgunDK, bayonetDK]),
      op('sapper', '工兵', 'Sapper', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, dkSapper: true }, [lasgunDK, remoteDetonator, bayonetDK], 0),
      op('sniper', '狙擊手', 'Sniper', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [longLasConcealed, longLasMobile, longLasStationary, bayonetDK]),
      op('spotter', '觀測手', 'Spotter', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, support: 'spot' }, [lasgunDK, mortarBarrage, bayonetDK]),
      op('veteran', '老兵', 'Veteran', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, dkVeteran: true, tough: true }, [lasgunDK, bionicArmDK], 0),
      op('vox', '通訊兵', 'Vox-operator', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, signal: true, relay: true }, [lasgunDK, bayonetDK]),
      op('zealot', '狂信者', 'Zealot', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, emperorProtects: true, uplifting: true }, [lasgunDK, bayonetDK]),
      op('trooper', '步兵', 'Trooper', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, groupAct: 'trooper' }, [lasgunDK, bayonetDK], 4),
      op('dkFree', '（改選：免費計謀）', '(instead: a ploy that costs 0CP)', { apl: 0, move: 0, save: 6, wounds: 1, base: 25, none: true }, [bayonetDK], 0),
    ],
  },
  {
    id: 'gellerpox',
    name: { zh: '蓋勒痘魔', en: 'Gellerpox Infected' },
    color: '#a0607a',
    style: { zh: '近戰隊・巨怪・詛咒', en: 'Melee · Hulks · Curses' },
    blurb: {
      zh: '11 名被納垢瘟疫扭曲的怪物：四隻耐打的夢魘巨怪打頭陣，變種人與小惡魔成群跟上；技術詛咒削弱附近的敵人。',
      en: '11 monsters twisted by Nurgle\'s plague: four tough Nightmare Hulks lead, Mutants and Glitchlings swarm behind, and a Techno-curse cripples nearby enemies.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '搜索與摧毀', en: 'Seek & Destroy' }, { zh: '安全保護', en: 'Security' }],
      kind: { zh: '近戰隊', en: 'Melee' },
      oneBox: { zh: '能', en: 'Yes' },
      buyable: { zh: '否：已完全絕版', en: 'No: completely out of production' },
      note: { zh: '2025 年已退出賽季：官方比賽不能使用，一般對戰或非官方比賽可以使用。', en: 'Rotated out of the season in 2025: not allowed in official events, fine for casual and unofficial games.' },
    },
    rule: {
      name: { zh: '技術詛咒・夢魘巨怪・令人作嘔的韌性', en: 'Techno-curse · Nightmare Hulks · Revoltingly Resilient' },
      desc: {
        zh: '開戰前選一種技術詛咒，影響範圍內的敵人（見選隊）。夢魘巨怪：敵人選目標時，巨怪不能用輕型地形擋（仍保留掩護豁免）；撿標記與任務動作多花 1AP（伏爾格拉除外）。巨怪與變種人每顆攻擊骰造成 3 以上傷害時擲 D6，4+ 傷害 -1。變種人、小惡魔各自群體啟動。',
        en: 'Pick a Techno-curse before the battle; it affects enemies in range (see setup). Nightmare Hulks: enemies can\'t treat Light terrain as cover for them when picking targets (they keep the cover save); +1AP for Pick Up and mission actions (not Vulgrar). Whenever an attack die inflicts 3+ damage on a Hulk or Mutant, roll a D6: on a 4+ it deals 1 less. Mutants and Glitchlings each use Group Activation.',
      },
    },
    // Techno-curse: one, picked in setup (stored like Chapter Tactics); it affects enemy operatives.
    tacticSlots: 1,
    tacticsLabel: { zh: '技術詛咒', en: 'Techno-curse' },
    tactics: [
      { id: 'barrelwarp', name: { zh: '槍管扭曲', en: 'Barrelwarp' }, desc: { zh: '友方（害蟲除外）2" 內、或小惡魔 3" 內的敵人，遠程武器 Atk -1。', en: 'Enemies within 2" of a friendly operative (or 3" of a Glitchling): -1 Atk on ranged weapons.' } },
      { id: 'rustspikes', name: { zh: '尖嘯鏽刺', en: 'Screaming Rustspikes' }, desc: { zh: '友方控制範圍內的敵人跟友方近戰或反擊時，只要有攻擊骰失敗，就受到 1 傷害。', en: 'An enemy within control range of a friendly operative that fights or retaliates against one takes 1 damage if any of its attack dice fail.' } },
      { id: 'voxStatic', name: { zh: '病毒雜訊', en: 'Viral Vox-static' }, desc: { zh: '友方 3" 內、或小惡魔 4" 內的敵人，APL 不能增加（移除所有正面 APL 變化）。', en: 'Enemies within 3" of a friendly operative (or 4" of a Glitchling) can\'t have their APL increased.' } },
    ],
    defaultTactics: ['barrelwarp'],
    ploys: [
      { id: 'drawnHum', cp: 1, name: { zh: '受嗡鳴吸引', en: 'Drawn to the Hum' },
        desc: { zh: '選一個目標點。本回合友方在自己的啟動中重新部署或衝鋒時，Move +1"，但這次移動要停在那個目標點 2" 內（沒停在那裡就只能走原本的距離）。', en: 'Select one objective marker. This TP, when a friendly operative Repositions or Charges during its activation, +1" Move, but that move must end within 2" of that marker (otherwise only the normal distance).' } },
      { id: 'rustEmanations', cp: 1, name: { zh: '鏽蝕散發', en: 'Rust Emanations' },
        desc: { zh: '本回合友方夢魘巨怪近戰時，對手擲出 3 的骰不能算成功。', en: 'This TP, when a friendly Nightmare Hulk is fighting, your opponent can\'t retain results of 3 as successes.' } },
      { id: 'plagueridden', cp: 1, name: { zh: '瘟疫附身的決心', en: 'Plagueridden Determination' },
        desc: { zh: '本回合交戰指令的友方被射擊時，可重擲一顆防禦骰。', en: 'This TP, when a friendly operative with an Engage order is shot, you can re-roll one defence die.' } },
      { id: 'blessingsInfection', cp: 1, name: { zh: '感染的祝福', en: 'Blessings of Infection' },
        desc: { zh: '本回合友方近戰或反擊時：擲出 3 顆以上失敗，可把其中一顆改為普通成功；或擲出 3 顆以上成功，可捨棄一顆失敗把一顆普通成功升為暴擊。', en: 'This TP, when a friendly operative fights or retaliates: with three or more fails, one becomes a normal success; or with three or more successes, discard a fail to make a normal success critical.' } },
    ],
    ops: [
      op('vulgrar', '三重詛咒者伏爾格拉', 'Vulgrar Thrice-Cursed', { apl: 2, move: 5, save: 5, wounds: 21, base: 40, hulk: true, vulgrar: true, resilient: true }, [pyregutStd, pyregutDeluge, fleshmelded]),
      op('bloatspawn', '膨脹孽生', 'Bloatspawn', { apl: 2, move: 5, save: 5, wounds: 20, base: 40, hulk: true, resilient: true, tentacledGrasp: true }, [mutantTentacles, clawSlashing, clawSwiping]),
      op('fleshscreamer', '血肉尖嘯者', 'Fleshscreamer', { apl: 2, move: 5, save: 5, wounds: 20, base: 40, hulk: true, resilient: true, shrieking: true }, [cleaverLop, cleaverSlash]),
      op('lumberghast', '笨重惡鬼', 'Lumberghast', { apl: 2, move: 5, save: 5, wounds: 20, base: 40, hulk: true, resilient: true, spikedCharger: true }, [mutantClaw]),
      op('glitchling', '小惡魔', 'Glitchling', { apl: 2, move: 6, save: 6, wounds: 3, base: 25, glitchling: true, small: true, daemonic: true, groupAct: 'glitchling' }, [effluence, nippers], 4),
      op('mutantAxe', '變種人（重斧）', 'Mutant (heavy axe)', { apl: 2, move: 5, save: 5, wounds: 7, base: 25, resilient: true, hardyCrit: true, groupAct: 'mutant' }, [fragGP, heavyAxe]),
      op('mutant', '變種人', 'Mutant', { apl: 2, move: 5, save: 5, wounds: 7, base: 25, resilient: true, hardyCrit: true, groupAct: 'mutant' }, [fragGP, improvised], 2),
      // Mutoid Vermin: only with the Mutoid Vermin equipment (added by newGame). Limited actions, no marker control, ignored for kill ops.
      op('gpCursemite', '寄生蟎', 'Cursemite', { apl: 2, move: 6, save: 6, wounds: 2, base: 25, vermin: true, expendable: true, groupAct: 'vermin', actionsOnly: VERMIN_ACTIONS }, [proboscis], 0),
      op('gpEyestinger', '眼刺蜂群', 'Eyestinger Swarm', { apl: 2, move: 6, save: 6, wounds: 2, base: 25, vermin: true, expendable: true, groupAct: 'vermin', actionsOnly: VERMIN_ACTIONS }, [verminSwarm, verminSting], 0),
      op('gpSludgegrub', '汙泥蛆', 'Sludge-grub', { apl: 2, move: 4, save: 6, wounds: 2, base: 25, vermin: true, expendable: true, causticDemise: true, groupAct: 'vermin', actionsOnly: VERMIN_ACTIONS }, [acidSpit, fangedMaw], 0),
    ],
  },
  {
    id: 'hearthkyn',
    name: { zh: '爐心打撈者', en: 'Hearthkyn Salvagers' },
    color: '#d07a2a',
    style: { zh: '射擊隊・耐打・宿怨', en: 'Shooting · Tough · Grudges' },
    blurb: {
      zh: '10 名矮人打撈隊員。3+ 豁免、精準的爆彈火力；殺了我們的人會記上宿怨，之後打他時更容易打出暴擊。',
      en: '10 Kin salvagers. 3+ saves and accurate bolt fire; whoever kills one of them earns a Grudge, and gets hit with more criticals afterwards.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '安全保護', en: 'Security' }, { zh: '偵察', en: 'Recon' }],
      kind: { zh: '射擊隊', en: 'Shooting' },
      oneBox: { zh: '否：除非把武器磁化', en: 'No — unless you magnetise the weapons' },
      buyable: { zh: 'KT 盒目前還有，但不會有大桌盒', en: 'The KT box is still available, but there won\'t be a Warhammer 40,000 box' },
      note: { zh: '將於 2026 年退出賽季：屆時官方比賽不能使用，一般對戰或非官方比賽仍可使用。', en: 'Rotating out of the season in 2026: then not allowed in official events, still fine for casual and unofficial games.' },
    },
    grudges: true, // engine flag for the Grudge faction rule
    rule: {
      name: { zh: '宿怨', en: 'Grudge' },
      desc: {
        zh: '敵人使友方殘廢時，獲得一個宿怨標記（整場保留）。友方射擊、近戰或反擊有宿怨標記的敵人時，每個標記可把一顆普通成功當成暴擊保留（包括精準保留的成功）。',
        en: 'An enemy that incapacitates a friendly operative gains a Grudge token for the battle. Whenever a friendly operative shoots, fights or retaliates against an enemy with Grudge tokens, for each token one normal success can be retained as a critical success (including ones retained through Accurate).',
      },
    },
    ploys: [
      { id: 'wroughtDefence', cp: 1, name: { zh: '精工防禦', en: 'Wrought Defence' },
        desc: { zh: '本回合友方被射擊時，若防禦骰只有 1 顆以下成功，可把一顆失敗當成普通成功。', en: 'This TP, when a friendly operative is shot and rolls one or fewer successes, one fail is retained as a normal success.' } },
      { id: 'proximateFire', cp: 1, name: { zh: '近距火力', en: 'Proximate Firepower' },
        desc: { zh: '本回合友方射擊 6" 內的敵人時，遠程武器命中改善 1（最佳 3+）。', en: 'This TP, friendly ranged weapons improve their Hit by 1 (to 3+) when shooting an enemy within 6".' } },
      { id: 'needKeeps', cp: 1, name: { zh: '需求所迫', en: 'Need Keeps' },
        desc: { zh: '選一個目標點。本回合友方爭奪它時 APL 總和 +1；友方在它 3" 內時近戰武器 Atk +1（最多 4），原本就是 4 的改為獲得「平衡」。', en: 'Select one objective marker. This TP, the total APL of friendlies contesting it counts 1 higher; friendlies within 3" of it add 1 to their melee Atk (to a maximum of 4), and a weapon already at Atk 4 has Balanced.' } },
      { id: 'toilEarns', cp: 1, name: { zh: '辛勞所得', en: 'Toil Earns' },
        desc: { zh: '選一個目標點。本回合敵人在它 3" 內時，視為多一個宿怨標記。', en: 'Select one objective marker. This TP, an enemy within 3" of it is treated as having one additional Grudge token.' } },
    ],
    // The Theyn plus nine picks: each once, except Warriors; up to three Gunners (each a different weapon = its own template).
    perCopyRoster: true,
    replacements: Object.fromEntries(['dozr', 'medic', 'grenadier', 'gunner', 'jumpPack', 'kinlynk', 'kognitaar', 'lokatr', 'lugger'].map((id) => [id, HK_PICKS])),
    ops: [
      op('theyn', '領主', 'Theyn', { apl: 2, move: 5, save: 3, wounds: 9, base: 28, eyeOfAncestors: true, weavefield: true, loadouts: { 'etacarn+plasma': [etacarnPistol, plasmaWeaponTh], ...HK_THEYN_LOADOUTS } }, [etacarnPistol, plasmaWeaponTh]),
      op('dozr', '破拳手', 'Dôzr', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, brawler: true, knux: true }, [autochPistol, knux]),
      op('medic', '戰地醫療兵', 'Field Medic', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, medic: true, medikit: true }, [boltRevolver, plasmaKnifeMed]),
      op('grenadier', '擲彈兵', 'Grenadier', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, utilityGrenade: true }, [autochPistol, c8Charge, fragHK, krakHK, fistsHK]),
      op('gunner', '槍手（轉管砲）', 'Gunner (rotary cannon)', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, hkGunner: true }, [rotaryFocused, rotarySweeping, fistsHK]),
      op('hkGunnerBeamer', '槍手（等離子光束槍）', 'Gunner (plasma beamer)', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, hkGunner: true }, [plasmaBeamer, fistsHK], 0),
      op('hkGunnerRifle', '槍手（自動步槍）', 'Gunner (auto rifle)', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, hkGunner: true }, [hylasRifle, fistsHK], 0),
      op('hkGunnerL7', '槍手（L7 飛彈）', 'Gunner (L7 missile launcher)', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, hkGunner: true }, [l7Blast, l7Focused, fistsHK], 0),
      op('hkGunnerMagna', '槍手（磁軌步槍）', 'Gunner (magna rail rifle)', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, hkGunner: true }, [magnaRail, fistsHK], 0),
      op('jumpPack', '噴射背包戰士', 'Jump Pack Warrior', { apl: 2, move: 8, save: 3, wounds: 8, base: 28, jumpPack: true }, [autochPistol, plasmaWeaponJP]),
      op('kinlynk', '通聯兵', 'Kinlynk', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, signalAny: true, jamToken: true, loadouts: HK_BOLTER_OR_ION }, [autochBolter, fistsHK]),
      op('kognitaar', '智械參謀', 'Kognitâar', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, tactician: true, loadouts: HK_BOLTER_OR_ION }, [autochBolter, fistsHK]),
      op('lokatr', '探測兵', 'Lokâtr', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, support: 'spot', panScan: true, loadouts: { ion: HK_BOLTER_OR_ION.ion, bolter: HK_BOLTER_OR_ION.bolter } }, [ionBlaster, fistsHK]),
      op('lugger', '搬運工', 'Lugger', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, wellSupplied: true, gotIt: true, loadouts: HK_BOLTER_OR_ION }, [autochBolter, fistsHK]),
      // Secure Salvage: contesting a marker, one success in each attack against it deals 1 less damage.
      op('hkWarrior', '戰士', 'Warrior', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, secureSalvage: true, loadouts: HK_BOLTER_OR_ION }, [autochBolter, fistsHK], 0),
    ],
  },
  {
    id: 'navyBreachers',
    name: { zh: '帝國海軍跳幫者', en: 'Imperial Navy Breachers' },
    color: '#4f7f9f',
    style: { zh: '近戰隊・霰彈槍・破門', en: 'Melee · Shotguns · Boarding' },
    blurb: {
      zh: '11 名帝國海軍登艦隊（另有兩台機械單位）。霰彈槍與近戰武器擅長貼身作戰；突破清場讓兩人連續行動，攻擊／防禦命令標記穩住戰線。',
      en: '11 Imperial Navy boarding troops (plus two machines). Shotguns and melee weapons excel up close; Breach and Clear lets two act in a row, and Attack / Defence Orders hold the line.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '搜索與摧毀', en: 'Seek & Destroy' }, { zh: '安全保護', en: 'Security' }],
      kind: { zh: '近戰隊', en: 'Melee' },
      oneBox: { zh: '否：還需要一名 28mm 底座的槍手，原盒只夠做一名槍手', en: 'No: you need a second Gunner on a 28mm base, and the box only builds one' },
      size: { zh: '11 個名額：偵察車與鬼骷髏合算一個且不計入擊殺任務', en: '11 selections: the C.A.T. unit and Gheistskull count as one and are ignored for the kill op' },
      buyable: { zh: 'KT 盒目前還有；大桌盒不會附 KT 專用板件，購買時要注意', en: 'The KT box is still available; the Warhammer 40,000 box won\'t include the KT sprues, so check before buying' },
      note: { zh: '將於 2026 年退出賽季：屆時官方比賽不能使用，一般對戰或非官方比賽仍可使用。', en: 'Rotating out of the season in 2026: then not allowed in official events, still fine for casual and unofficial games.' },
    },
    breachAndClear: true, // engine flag for the Breach and Clear faction rule
    voidArmour: true, // engine flag for the Void Armour faction rule
    rule: {
      name: { zh: '虛空裝甲・突破清場', en: 'Void Armour · Breach and Clear' },
      desc: {
        zh: '虛空裝甲：被有「爆炸」或「洪流」的武器（掃射模式除外）射擊時，可重擲一顆防禦骰（擲彈兵兩顆）。突破清場：每回合一次，啟動時若 3" 內有可見的準備中友方，這名行動完後可以接著啟動那名友方。',
        en: 'Void Armour: when shot by a Blast or Torrent weapon (not a sweeping profile), re-roll one defence die (two for the Grenadier). Breach and Clear: once per turning point, a ready friendly visible within 3" of the activating operative may activate right after it.',
      },
    },
    ploys: [
      { id: 'attackOrder', group: 'navyOrder', marker: 'attack', cp: 1, name: { zh: '攻擊命令', en: 'Attack Order' },
        desc: { zh: '放置攻擊命令標記：本回合標記 3" 內的友方射擊、近戰或反擊時武器「無休」。（與防禦命令擇一；士官在場 0CP）', en: 'Place the Attack Order marker: this TP, friendlies within 3" of it have Ceaseless when shooting, fighting or retaliating. (Not with Defence Order; 0CP with the Sergeant-at-Arms)' } },
      { id: 'defenceOrder', group: 'navyOrder', marker: 'defence', cp: 1, name: { zh: '防禦命令', en: 'Defence Order' },
        desc: { zh: '放置防禦命令標記：本回合標記 3" 內的友方被射擊時，可重擲某一點數的所有防禦骰。（與攻擊命令擇一；士官在場 0CP）', en: 'Place the Defence Order marker: this TP, friendlies within 3" of it being shot re-roll all defence dice of one result. (Not with Attack Order; 0CP with the Sergeant-at-Arms)' } },
      { id: 'closeAssault', cp: 1, name: { zh: '近距突擊', en: 'Close Assault' },
        desc: { zh: '本回合友方近戰或射擊 3" 內的敵人時：霰彈槍兩個傷害值 +1；擲出 2 顆以上失敗時，可把一顆改為普通成功。', en: 'This TP, a friendly fighting or shooting an enemy within 3": +1 to both Dmg of Navis shotguns; with two or more fails, one becomes a normal success.' } },
      { id: 'braceCounter', cp: 1, name: { zh: '準備反擊', en: 'Brace for Counterattack' },
        desc: { zh: '本回合友方在我方領域內、或本回合沒有衝鋒／撤退／轉移時，受到 3 以上的傷害 -1。', en: 'This TP, a friendly in your territory, or that hasn\'t Charged, Fallen Back or Repositioned this TP, takes 1 less from Dmg of 3 or more.' } },
    ],
    // The Sergeant plus ten selections: each once except Armsmen, up to two Gunners. The C.A.T. Unit (needs the Surveyor) and the
    // Gheistskull (needs the Void-jammer) are half a selection each — together one selection, the machines package below.
    replacements: Object.fromEntries(['axejack', 'endurant', 'grenadier', 'gunnerVolley', 'gunnerMelta', 'hatchcutter', 'surveyor', 'voidJammer', 'armsman'].map((id) => [id, NB_PICKS])),
    packages: {
      machines: {
        name: { zh: '機械名額（C.A.T. 與鬼骷髏各算半個名額）', en: 'Machines (the C.A.T. Unit and Gheistskull are half a selection each)' },
        options: {
          both: { name: { zh: 'C.A.T. 偵察車＋鬼骷髏', en: 'C.A.T. Unit + Gheistskull' }, ops: ['cat', 'gheistskull'] },
          cat: { name: { zh: '只帶 C.A.T. 偵察車', en: 'C.A.T. Unit only' }, ops: ['cat'] },
          gheist: { name: { zh: '只帶鬼骷髏', en: 'Gheistskull only' }, ops: ['gheistskull'] },
          armsman: { name: { zh: '改帶一名水兵', en: 'An Armsman instead' }, ops: ['armsman'] },
        },
      },
    },
    ops: [
      op('sgt', '士官長', 'Sergeant-at-Arms', { apl: 2, move: 6, save: 4, wounds: 9, base: 25, commandBreach: true,
        loadouts: { 'heirloom+power': [heirloomPistol, powerWeaponNB], 'heirloom+chain': [heirloomPistol, chainswordNB], 'pistol+power': [boltPistolNB, powerWeaponNB], 'pistol+chain': [boltPistolNB, chainswordNB], shotgun: [shotgunClose, shotgunLong, hatchet] } }, [heirloomPistol, powerWeaponNB]),
      op('axejack', '斧手', 'Axejack', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, emboldened: true }, [autopistolNB, powerWeaponNB]),
      op('endurant', '重盾兵', 'Endurant', { apl: 2, move: 4, save: 2, wounds: 11, base: 28, disengage: true, breachwall: true }, [heavyShotgunClose, heavyShotgunLong, shieldBash]),
      op('grenadier', '擲彈兵', 'Grenadier', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, voidGrenadier: true }, [demoCharge, fragNB, krakNB, shotgunClose, shotgunLong, hatchet]),
      op('gunnerVolley', '槍手（雷射齊射）', 'Gunner (las-volley)', { apl: 2, move: 6, save: 4, wounds: 9, base: 28 }, [lasVolleyFocused, lasVolleySweeping, gunButtNB]),
      op('gunnerMelta', '槍手（熱熔）', 'Gunner (meltagun)', { apl: 2, move: 6, save: 4, wounds: 9, base: 28 }, [meltagunNB, gunButtNB]),
      op('gunnerPlasma', '槍手（電漿）', 'Gunner (plasma gun)', { apl: 2, move: 6, save: 4, wounds: 9, base: 28 }, [plasmaStdNB, plasmaSuperNB, gunButtNB], 0),
      op('hatchcutter', '切割手', 'Hatchcutter', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, breachPoint: true, weldShut: true }, [autopistolNB, chainfist]),
      op('surveyor', '勘測員', 'Surveyor', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, surveyor: true, remoteControl: true, support: 'wayfind' }, [shotgunClose, shotgunLong, hatchet]),
      op('cat', 'C.A.T. 偵察車', 'C.A.T. Unit', { apl: 2, move: 8, save: 5, wounds: 5, base: 25, catUnit: true, machine: true, expendable: true, small: true, noRetaliate: true, support: 'spot', actionsOnly: ['charge', 'dash', 'fallBack', 'reposition', 'spot'] }, [noWeapon], 0), // (with the Gheistskull: the machines package)
      op('voidJammer', '虛空干擾員', 'Void-jammer', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, pulse: true }, [detonator, shotgunClose, shotgunLong, hatchet]),
      op('gheistskull', '鬼骷髏', 'Gheistskull', { apl: 2, move: 8, save: 5, wounds: 5, base: 25, gheistskull: true, machine: true, expendable: true, small: true, noRetaliate: true, boost: true, actionsOnly: ['boost', 'charge', 'dash', 'fallBack', 'reposition'] }, [noWeapon], 0),
      op('armsman', '水兵', 'Armsman', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, groupAct: 'armsman' }, [shotgunClose, shotgunLong, hatchet]),
    ],
  },
  {
    id: 'phobos',
    name: { zh: '恐懼突襲小隊', en: 'Phobos Strike Team' },
    color: '#3f6f4f',
    style: { zh: '混合隊・精英・滲透', en: 'Mixed · Elite · Infiltration' },
    blurb: {
      zh: '6 名幽影型星際戰士：滲透者干擾敵方通訊、突襲者看穿掩蔽、掠奪者以恐懼壓制敵人。高 APL、3+ 豁免，可連開兩槍或連打兩次近戰。',
      en: '6 Phobos Space Marines: Infiltrators jam enemy comms, Incursors see through cover and Reivers terrify the foe. APL 3, 3+ saves, two Shoots or two Fights per activation.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '偵察', en: 'Recon' }, { zh: '滲透', en: 'Infiltration' }],
      kind: { zh: '混合隊', en: 'Mixed' },
      oneBox: { zh: '否：需要多買一盒掠奪者（Reivers）', en: 'No: you need an extra box of Reivers' },
      buyable: { zh: '否：已絕版，也不會有大桌盒', en: 'No: out of production, and no Warhammer 40,000 box' },
      note: { zh: '2025 年已退出賽季：官方比賽不能使用，一般對戰或非官方比賽可以使用。', en: 'Rotated out of the season in 2025: not allowed in official events, fine for casual and unofficial games.' },
    },
    astartes: true, // engine flag for the Astartes faction rule
    omniScrambler: true, // engine flag for the Omni-scrambler strategic gambit
    rule: {
      name: { zh: '阿斯塔特・全頻擾亂器・恐懼・多光譜陣列', en: 'Astartes · Omni-scrambler · Terror · Multi-spectrum Array' },
      desc: {
        zh: '阿斯塔特：每次啟動可兩次射擊（至少一次用爆彈武器）或兩次近戰；不論指令都能反應。全頻擾亂器（策略階段）：選一名被友方滲透者看到、或在干擾兵 6" 內的敵人，對手要先啟動等同場上滲透者數量的特工，它才能啟動（或它是最後一名）。恐懼：掠奪者 3" 內的敵人撿標記與任務動作多花 1AP，爭奪標記時 APL -1。多光譜陣列：突襲者射擊時敵人不會被遮擋。',
        en: 'Astartes: two Shoots (one with a bolt weapon) or two Fights per activation; can counteract regardless of order. Omni-scrambler (Strategy phase): an enemy visible to a friendly Infiltrator or within 6" of the Voxbreaker can\'t activate until your opponent has activated as many operatives as you have Infiltrators (or it\'s the last). Terror: enemies within 3" of a Reiver pay +1AP for Pick Up and mission actions and count 1 lower when contesting markers. Multi-spectrum Array: enemies can\'t be obscured when an Incursor shoots.',
      },
    },
    ploys: [
      { id: 'guerrilla', cp: 1, name: { zh: '游擊戰', en: 'Guerrilla Warfare' },
        desc: { zh: '本回合友方可執行獨特動作「游擊戰」(1AP，不在敵人控制範圍內)：改變自己的指令。', en: 'This TP, friendly operatives can perform the unique action Guerrilla Warfare (1AP, not within enemy control range): change its order.' } },
      { id: 'lethalAssaults', cp: 1, name: { zh: '致命突擊', en: 'Lethal Assaults' },
        desc: { zh: '本回合友方近戰時，近戰武器「平衡」；若本次啟動衝鋒過，再加「致命 5+」。', en: 'This TP, friendly melee weapons have Balanced when fighting; also Lethal 5+ in an activation in which it Charged.' } },
      { id: 'noFear', cp: 1, name: { zh: '無所畏懼', en: 'And They Shall Know No Fear' },
        desc: { zh: '本回合友方無視重傷造成的數值變化。', en: 'This TP, friendly operatives ignore stat changes from being injured.' } },
      { id: 'deadlyShots', cp: 1, name: { zh: '致命射擊', en: 'Deadly Shots' },
        desc: { zh: '本回合友方射擊時，若本次啟動沒有衝鋒／撤退／轉移，或目標不在掩體中且在 6" 外，遠程武器「平衡」。', en: 'This TP, friendly ranged weapons have Balanced when the shooter hasn\'t Charged, Fallen Back or Repositioned this activation, or the target isn\'t in cover and is more than 6" away.' } },
    ],
    // A Sergeant (Infiltrator, Incursor or Reiver) plus five picks: each once, except Warriors.
    replacements: { sgt: ['sgt', 'phIncSgt', 'phReiverSgt'], ...Object.fromEntries(['commsman', 'helix', 'voxbreaker', 'marksman', 'reiver'].map((id) => [id, PH_PICKS])) },
    ops: [
      op('sgt', '滲透者士官', 'Infiltrator Sergeant', { apl: 3, move: 7, save: 3, wounds: 13, base: 32, infiltrator: true, tacticalAdv: true }, [marksmanCarbine, fistsPh]),
      op('phIncSgt', '突襲者士官', 'Incursor Sergeant', { apl: 3, move: 7, save: 3, wounds: 13, base: 32, incursor: true, tacticalAdv: true }, [occulusCarbine, fistsPh], 0),
      op('phReiverSgt', '掠奪者士官', 'Reiver Sergeant', { apl: 3, move: 7, save: 3, wounds: 13, base: 32, grapple: true, tacticalAdv: true, loadouts: PH_REIVER_LOADOUTS }, [siBoltPistol, combatKnife], 0),
      op('commsman', '滲透者通訊兵', 'Infiltrator Commsman', { apl: 3, move: 7, save: 3, wounds: 12, base: 32, infiltrator: true, oversight: true, commsArray: true }, [marksmanCarbine, fistsPh]),
      op('phSaboteur', '滲透者破壞兵', 'Infiltrator Saboteur', { apl: 3, move: 7, save: 3, wounds: 12, base: 32, infiltrator: true, dkSapper: true }, [marksmanCarbine, remoteDetonator, fistsPh], 0),
      op('phVeteran', '滲透者老兵', 'Infiltrator Veteran', { apl: 3, move: 7, save: 3, wounds: 12, base: 32, infiltrator: true, loadouts: PH_CUSTOM_LOADOUTS }, PH_CUSTOM_LOADOUTS['balanced+lethal'], 0),
      op('phInfWarrior', '滲透者戰士', 'Infiltrator Warrior', { apl: 3, move: 7, save: 3, wounds: 12, base: 32, infiltrator: true, vanguard: true, phWarrior: true }, [marksmanCarbine, fistsPh], 0),
      op('phMinelayer', '突襲者佈雷兵', 'Incursor Minelayer', { apl: 3, move: 7, save: 3, wounds: 12, base: 32, incursor: true, wsTrap: true }, [occulusCarbine, fistsPh], 0),
      op('phIncWarrior', '突襲者戰士', 'Incursor Warrior', { apl: 3, move: 7, save: 3, wounds: 12, base: 32, incursor: true, vanguard: true, phWarrior: true }, [occulusCarbine, fistsPh], 0),
      op('helix', '滲透者螺旋修士', 'Infiltrator Helix Adept', { apl: 3, move: 7, save: 3, wounds: 12, base: 32, infiltrator: true, medic: true, medicD3: true, helix: true }, [marksmanCarbine, fistsPh]),
      op('voxbreaker', '滲透者干擾兵', 'Infiltrator Voxbreaker', { apl: 3, move: 7, save: 3, wounds: 12, base: 32, infiltrator: true, voxbreak: true, auspex: true }, [marksmanCarbine, fistsPh]),
      op('marksman', '突襲者神射手', 'Incursor Marksman', { apl: 3, move: 7, save: 3, wounds: 12, base: 32, incursor: true, phTrack: true }, [stalkerCarbine, fistsPh]),
      op('reiver', '掠奪者戰士', 'Reiver Warrior', { apl: 3, move: 7, save: 3, wounds: 12, base: 32, terror: true, vanguard: true, grapple: true, phWarrior: true, loadouts: PH_REIVER_LOADOUTS }, [siBoltPistol, combatKnife]),
    ],
  },
  {
    id: 'warpcoven',
    name: { zh: '千子次元秘教', en: 'Warpcoven' },
    color: '#2f8fa0',
    style: { zh: '混合隊・靈能・2+ 豁免', en: 'Mixed · Psychic · 2+ saves' },
    blurb: {
      zh: '奸奇的千子巫師帶著符文戰士與奸奇獸人：巫師施放靈能法術，符文戰士 2+ 豁免穩步推進，獸人衝上前近戰。',
      en: 'Thousand Sons Sorcerers of Tzeentch with Rubric Marines and Tzaangor: the Sorcerers cast psychic powers, the Rubricae advance on 2+ saves, and the Tzaangor charge in.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '偵察', en: 'Recon' }, { zh: '安全保護', en: 'Security' }],
      kind: { zh: '混合隊', en: 'Mixed' },
      oneBox: { zh: '否：至少需要三盒', en: 'No: you need at least three boxes' },
      size: { zh: '5 個名額：兩名奸奇獸人合算一個', en: '5 selections: the two Tzaangor count as one' },
      buyable: { zh: '能，這些都是大桌單位', en: 'Yes, these are all Warhammer 40,000 units' },
      note: { zh: '2025 年已退出賽季：官方比賽不能使用，一般對戰或非官方比賽可以使用。奸奇獸人（煎餃獸）的 40k 武器是限定品。', en: 'Rotated out of the season in 2025: not allowed in official events, fine for casual and unofficial games. The Tzaangor\'s Warhammer 40,000 weapons are a limited release.' },
    },
    astartes: true, // Astartes faction rule (Heretic Astartes only — not the Tzaangor)
    anyAstartesShot: true, // no bolt-weapon requirement for two Shoots
    rule: {
      name: { zh: '阿斯塔特・奸奇的恩賜', en: 'Astartes · Boons of Tzeentch' },
      desc: {
        zh: '阿斯塔特（巫師與符文戰士）：每次啟動可兩次射擊或兩次近戰（兩次都用奪魂砲或亞空間火焰噴射器時第二次多 1AP；同一把靈能遠程武器不能用兩次）；不論指令都能反應。奸奇的恩賜：每名巫師選一個恩賜（每個恩賜只能選一次），在選隊時挑。符文戰士：附近 9" 沒有巫師時，啟動時 APL -1。',
        en: 'Astartes (Sorcerers and Rubric Marines): two Shoots (+1AP for the second if both use the soulreaper cannon or warpflamer; not the same Psychic ranged weapon twice) or two Fights per activation; can counteract regardless of order. Boons of Tzeentch: each Sorcerer has one (each boon once), picked in team selection. Rubric Marines: -1 APL when activated unless a Sorcerer is within 9".',
      },
    },
    // Fate Itself Is My Weapon: the reserved dice are used automatically (switchable in the Strategy phase).
    autoAbilities: [{ id: 'wcFate', ploy: true, name: { zh: '命運即我之刃（自動使用保留骰）', en: 'Fate Itself Is My Weapon (reserved dice used automatically)' }, desc: { zh: '自己攻擊時把保留的成功骰換掉一顆失敗骰；對手攻擊時把保留的失敗骰換掉對手一顆暴擊（或成功）。', en: 'When attacking, a reserved success replaces a failed die; when the opponent attacks, a reserved fail replaces one of their crits (or successes).' } }],
    ploys: [
      { id: 'aetherialWarding', cp: 1, name: { zh: '以太守護', en: 'Aetherial Warding' },
        desc: { zh: '本回合友方被射擊時，有「穿甲 1」的武器改為「暴擊穿甲 1」。', en: 'This TP, when a friendly operative is shot, weapons with Piercing 1 have Piercing Crits 1 instead.' } },
      { id: 'savageHerd', cp: 1, name: { zh: '野蠻獸群', en: 'Savage Herd' },
        desc: { zh: '本回合友方奸奇獸人近戰武器「精準 1」；有友軍協助、或在巫師 6" 內可見時再加「嚴厲」。', en: 'This TP, friendly Tzaangor melee weapons have Accurate 1; also Severe when assisted, or when fighting visible within 6" of a Sorcerer.' } },
      { id: 'brotherhood', cp: 1, name: { zh: '巫師兄弟會', en: 'Brotherhood of Sorcerers' },
        desc: { zh: '本回合友方巫師的靈能武器「平衡」；9" 內還有另一名巫師時改為「無休」。', en: 'This TP, friendly Sorcerers\' Psychic weapons have Balanced, or Ceaseless instead if another Sorcerer is within 9".' } },
      { id: 'fateWeapon', cp: 1, name: { zh: '命運即我之刃', en: 'Fate Itself Is My Weapon' },
        desc: { zh: '擲兩顆 D6 保留。本回合交戰階段任何人射擊、近戰或反擊擲出攻擊骰後（重擲之前），可用一顆保留骰換掉其中一顆（自己或對手的；換上的骰不能重擲）；兩顆合計小於 9 時，用了一顆另一顆就丟掉。每次序列最多一顆。', en: 'Roll two D6 and reserve them. This TP, after anyone rolls attack dice to shoot, fight or retaliate (before re-rolls), you can replace one of those D6 (yours or your opponent\'s) with a reserved dice (it can\'t be re-rolled); if the two reserved dice totalled less than 9, using one discards the other. One per sequence.' } },
    ],
    // Five selections (packages below): every operative starts at 0 and comes from a selection.
    ops: [
      op('destiny', '命運巫師', 'Sorcerer of Destiny', { apl: 3, move: 6, save: 3, wounds: 15, base: 32, sorcerer: true, destiny: true, loadouts: WC_SORC([doombolt]) }, [doombolt, infernoPistol, forceStave], 0),
      op('warpfire', '戰火巫師', 'Sorcerer of Warpfire', { apl: 3, move: 6, save: 3, wounds: 15, base: 32, sorcerer: true, alight: true, loadouts: (({ pistol, khopesh: k, warpflame }) => ({ khopesh: k, pistol, warpflame }))(WC_SORC([firestorm, mindburn])) }, [firestorm, mindburn, forceStave, khopesh], 0),
      op('tempyrion', '時間巫師', 'Sorcerer of Tempyrion', { apl: 3, move: 6, save: 3, wounds: 15, base: 32, sorcerer: true, tempyrion: true, loadouts: WC_SORC([fluxblast]) }, [fluxblast, infernoPistol, forceStave], 0),
      op('rubricGunner', '符文戰士槍手', 'Rubric Marine Gunner', { apl: 3, move: 5, save: 2, wounds: 14, base: 32, automata: true, loadouts: { soulreaper: [soulreaperFocused, soulreaperSweeping, fistsWC], warpflamer: [warpflamer, fistsWC] } }, [soulreaperFocused, soulreaperSweeping, fistsWC], 0),
      op('rubricIcon', '符文戰士旗手', 'Rubric Marine Icon Bearer', { apl: 3, move: 5, save: 2, wounds: 14, base: 32, automata: true, iconBearer: true }, [infernoBoltgun, fistsWC], 0),
      op('rubric', '符文戰士', 'Rubric Marine Warrior', { apl: 3, move: 5, save: 2, wounds: 14, base: 32, automata: true, slowPurposeful: true, wcWarrior: true }, [infernoBoltgun, fistsWC], 0),
      op('champion', '奸奇獸人冠軍', 'Tzaangor Champion', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, notAstartes: true, tzaangor: true, savageBrutality: true, loadouts: { greatblade: [greatblade], greataxe: [greataxe] } }, [greatblade], 0),
      op('tzHorn', '奸奇獸人號手', 'Tzaangor Horn Bearer', { apl: 2, move: 6, save: 5, wounds: 9, base: 32, notAstartes: true, tzaangor: true, brayhorn: true }, [tzDagger], 0),
      op('tzIcon', '奸奇獸人旗手', 'Tzaangor Icon Bearer', { apl: 2, move: 6, save: 5, wounds: 9, base: 32, notAstartes: true, tzaangor: true, iconBearer: true, herdBanner: true }, [tzDagger], 0),
      op('tzaangor', '奸奇獸人戰士（雙刃）', 'Tzaangor Warrior (blades)', { apl: 2, move: 6, save: 5, wounds: 9, base: 32, notAstartes: true, tzaangor: true, relicHunters: true, wcWarrior: true }, [tzaangorBlades], 0),
      op('tzShield', '奸奇獸人戰士（刃與盾）', 'Tzaangor Warrior (blade & shield)', { apl: 2, move: 6, save: 4, wounds: 9, base: 32, notAstartes: true, tzaangor: true, relicHunters: true, wcWarrior: true }, [tzBladeShield], 0),
      op('tzPistol', '奸奇獸人戰士（手槍與鏈鋸劍）', 'Tzaangor Warrior (autopistol & chainsword)', { apl: 2, move: 6, save: 5, wounds: 9, base: 32, notAstartes: true, tzaangor: true, relicHunters: true, wcWarrior: true }, [tzAutopistol, tzChainsword], 0),
    ],
  },
  {
    id: 'wyrmblade',
    name: { zh: '蟲刃', en: 'Wyrmblade' },
    color: '#8a5fb0',
    style: { zh: '射擊隊・伏擊・人數', en: 'Shooting · Ambush · Numbers' },
    blurb: {
      zh: '基因竊取者教派的伏擊小隊：一群混血新信徒帶著礦工器材與重武器，加上教派特工，從隱蔽中突然轉為交戰發動伏擊。',
      en: 'A Genestealer Cult ambush team: hybrid Neophytes with mining gear and heavy weapons plus Cult Agents, springing from hiding into sudden attacks.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '滲透', en: 'Infiltration' }, { zh: '搜索與摧毀', en: 'Seek & Destroy' }],
      kind: { zh: '射擊隊', en: 'Shooting' },
      oneBox: { zh: '否：至少需要一盒，外加一些 HQ 單位', en: 'No: at least one box plus some HQ units' },
      buyable: { zh: '能，這些都是大桌單位', en: 'Yes, these are all Warhammer 40,000 units' },
      size: { zh: '1 名領袖＋13 個名額；教派特工各佔 2 個名額', en: 'Leader + 13 selections; Cult Agents take two each' },
      note: { zh: '2025 年已退出賽季：官方比賽不能使用，一般對戰或非官方比賽可以使用。', en: 'Rotated out of the season in 2025: not allowed in official events, fine for casual and unofficial games.' },
    },
    cultAmbush: true, // engine flag for the Cult Ambush faction rule
    rule: {
      name: { zh: '教派伏擊・教派特工・熟悉的地盤', en: 'Cult Ambush · Cult Agent · Familiar Territory' },
      desc: {
        zh: '教派伏擊：啟動時從隱蔽改為交戰、或啟動開始時沒有被敵人看見，本次啟動射擊與近戰時武器「無休」。教派特工（克勒莫夫、基因護衛、聖者）：被射擊時無視「穿甲」與「飽和」，能保留掩護豁免時多保留 1 顆或把 1 顆當暴擊。新信徒戰士群體啟動。熟悉的地盤：部署時最多三分之一的隊伍（不含教派特工）可以躲藏；啟動時可以結束啟動，或在己方降落區 6" 內、離敵人超過 6" 的地方現身（視為轉移）；第二回合結束還在躲藏的特工殘廢。',
        en: 'Cult Ambush: if its order changed from Conceal to Engage at the start of the activation, or no enemy could see it then, its weapons have Ceaseless that activation. Cult Agents (Kelermorph, Locus, Sanctus): when shot, ignore Piercing and Saturate; with cover saves, retain one more or one as a critical. Neophyte Warriors use Group Activation. Familiar Territory: up to a third of the team (not Cult Agents) can be set up in hiding; when activated, it is expended or emerges wholly within 6" of your drop zone and more than 6" from enemies (a Reposition); any still hiding at the end of TP2 are incapacitated.',
      },
    },
    ploys: [
      { id: 'dayAtHand', cp: 1, name: { zh: '時機已至', en: 'The Day Is at Hand' },
        desc: { zh: '本回合友方啟動時從隱蔽改為交戰：遠程武器「撕裂」，近戰武器 Atk +1（最多 5）。', en: 'This TP, a friendly whose order changes from Conceal to Engage when activated: ranged weapons Rending, melee weapons +1 Atk (max 5).' } },
      { id: 'crossfire', cp: 1, name: { zh: '交叉火網', en: 'Crossfire' },
        desc: { zh: '本回合友方射擊本回合已被其他友方射擊過的目標時，遠程武器「精準 1」。', en: 'This TP, a friendly shooting an operative another friendly has already shot this TP has Accurate 1.' } },
      { id: 'oneWithShadows', cp: 1, name: { zh: '與暗影同在', en: 'One with the Shadows' },
        desc: { zh: '本回合隱蔽指令的友方被射擊時，若中間有輕型地形（且不在任一方 1" 內），視為被遮擋。', en: 'This TP, a Concealed friendly being shot is obscured by intervening Light terrain (unless it\'s within 1" of either operative).' } },
      { id: 'divertDisappear', cp: 1, name: { zh: '轉移與消失', en: 'Divert and Disappear' },
        desc: { zh: '最多三名友方立刻免費衝刺（這裡只做衝刺；教派特工算兩名）。', en: 'Up to three friendlies immediately make a free Dash (here Dash only; a Cult Agent counts as two).' } },
    ],
    // A Leader, two Cult Agent selections (packages below: each Cult Agent counts as two selections, or two Warriors instead)
    // and nine Neophyte selections, each copy picked on its own.
    perCopyRoster: true,
    replacements: { gunnerFlamer: WB_PICKS, gunnerGL: WB_PICKS, heavyLaser: WB_PICKS, heavySeismic: WB_PICKS, icon: WB_PICKS, warrior: WB_PICKS, warriorShotgun: WB_PICKS },
    ops: [
      op('leader', '新信徒領袖', 'Neophyte Leader', { apl: 2, move: 6, save: 5, wounds: 8, base: 25, neophyte: true, wbLeader: true, loadouts: WB_LEADER_LOADOUTS }, [mcAutopistol, powerMaul]),
      op('kelermorph', '克勒莫夫', 'Kelermorph', { apl: 3, move: 6, save: 4, wounds: 9, base: 32, cultAgent: true, twoShoots: true, heroic: true }, [stubsHyper, stubsLong, stubsShort, kelKnife], 0),
      op('locus', '基因護衛', 'Locus', { apl: 3, move: 6, save: 4, wounds: 9, base: 32, cultAgent: true, twoFights: true, expertSwordsman: true }, [barbedTail, locusBlades], 0),
      op('wbSniper', '聖者狙擊手', 'Sanctus Sniper', { apl: 3, move: 6, save: 4, wounds: 9, base: 32, cultAgent: true, sanctus: 'sniper' }, [sanctusMobile, sanctusStationary, sanctusFists], 0),
      op('wbTalon', '聖者利爪', 'Sanctus Talon', { apl: 3, move: 6, save: 4, wounds: 9, base: 32, cultAgent: true, sanctus: 'talon', creepingShadow: true }, [bioDagger], 0),
      op('gunnerFlamer', '槍手（火焰）', 'Neophyte Gunner (flamer)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, neophyte: true, wbGunner: true }, [flamerGSC, gunButtGSC]),
      op('gunnerGL', '槍手（榴彈）', 'Neophyte Gunner (grenade launcher)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, neophyte: true, wbGunner: true }, [glFragGSC, glKrakGSC, gunButtGSC]),
      op('gunnerWebber', '槍手（蛛網槍）', 'Neophyte Gunner (webber)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, neophyte: true, wbGunner: true }, [webber, gunButtGSC], 0),
      op('heavyStubber', '重武器手（重型機槍）', 'Neophyte Heavy Gunner (heavy stubber)', { apl: 2, move: 6, save: 5, wounds: 7, base: 32, neophyte: true, bipod: true, wbHeavy: true }, [heavyStubberF, heavyStubberS, gunButtGSC], 0),
      op('heavyLaser', '重武器手（採礦雷射）', 'Neophyte Heavy Gunner (mining laser)', { apl: 2, move: 6, save: 5, wounds: 7, base: 32, neophyte: true, bipod: true, wbHeavy: true }, [miningLaser, gunButtGSC]),
      op('heavySeismic', '重武器手（地震砲）', 'Neophyte Heavy Gunner (seismic cannon)', { apl: 2, move: 6, save: 5, wounds: 7, base: 32, neophyte: true, bipod: true, wbHeavy: true }, [seismicLong, seismicShort, gunButtGSC]),
      op('icon', '新信徒掌旗手', 'Neophyte Icon Bearer', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, neophyte: true, iconBearer: true, overthrow: true, loadouts: { autogun: [autogunGSC, gunButtGSC], shotgun: [shotgunGSC, gunButtGSC] } }, [autogunGSC, gunButtGSC]),
      op('warrior', '新信徒戰士', 'Neophyte Warrior', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, neophyte: true, groupAct: 'gscWarrior', wbWarrior: true }, [autogunGSC, gunButtGSC], 2),
      op('warriorShotgun', '新信徒戰士（霰彈槍）', 'Neophyte Warrior (shotgun)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, neophyte: true, groupAct: 'gscWarrior', wbWarrior: true }, [shotgunGSC, gunButtGSC], 2),
    ],
  },
  {
    id: 'blooded',
    name: { zh: '混沌叛軍', en: 'Blooded' },
    color: '#a33a2f',
    style: { zh: '射擊隊・血祭・人數', en: 'Shooting · Blood tokens · Numbers' },
    blurb: {
      zh: '投靠混沌的叛變帝國衛兵：殺敵或犧牲都能累積血祭標記，持有標記的特工武器「精準 1」，受到諸神注視時更能打出暴擊。',
      en: 'Traitor Guardsmen sworn to Chaos: kills and sacrifices earn Blooded tokens, holders get Accurate 1, and the one under the Gaze of the Gods turns it into criticals.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '滲透', en: 'Infiltration' }, { zh: '搜索與摧毀', en: 'Seek & Destroy' }],
      kind: { zh: '射擊隊', en: 'Shooting' },
      oneBox: { zh: '否：至少需要兩盒', en: 'No: at least two boxes' },
      buyable: { zh: '否：大桌的盒子缺少 KT 板件', en: 'No: the Warhammer 40,000 box lacks the KT sprues' },
      size: { zh: '首領＋9＋4 個名額；執法官與歐格林各佔 2 個名額', en: 'Chieftain + 9 + 4 selections; the Enforcer and Ogryn take two each' },
      note: { zh: '2025 年已退出賽季：官方比賽不能使用，一般對戰或非官方比賽可以使用。', en: 'Rotated out of the season in 2025: not allowed in official events, fine for casual and unofficial games.' },
    },
    bloodedTokens: true, // engine flag for the Blooded faction rule
    rule: {
      name: { zh: '血祭', en: 'Blooded' },
      desc: {
        zh: '獲得血祭標記：每回合策略階段開始時；每回合第一次使敵人殘廢時；每回合第一次友方在敵人 6" 內殘廢時。策略階段可把標記分給友方（每名最多 1 個）；有 4 名以上持有標記時，可選一名受到「諸神注視」。持有標記的友方武器「精準 1」；受注視時，精準保留的成功可當暴擊。',
        en: 'Gain a Blooded token: in each Strategy phase; the first time an enemy is incapacitated each TP; the first time a friendly is incapacitated within 6" of an enemy each TP. In the Strategy phase, assign tokens to friendlies (one each); with four or more holders, one can be under the Gaze of the Gods. Holders\' weapons have Accurate 1; under the Gaze, the success retained through Accurate can be a critical.',
      },
    },
    ploys: [
      { id: 'recklessAspirant', cp: 1, name: { zh: '魯莽的追求者', en: 'Reckless Aspirant' },
        desc: { zh: '本回合完全在敵方領域內的友方：沒有標記時射擊或近戰武器「精準 1」；持有標記時武器「懲罰」。', en: 'This TP, a friendly wholly within your opponent\'s territory: Accurate 1 when shooting or fighting without a token; Punishing with a token.' } },
      { id: 'malevolentGrit', cp: 1, name: { zh: '惡毒的韌性', en: 'Malevolent Grit' },
        desc: { zh: '本回合持有標記、或完全在敵方領域內的友方被射擊時，可重擲一顆防禦骰。', en: 'This TP, a friendly with a token, or wholly within your opponent\'s territory, re-rolls one defence die when shot.' } },
      { id: 'gloryKill', cp: 1, name: { zh: '榮耀擊殺', en: 'Glory Kill' },
        desc: { zh: '選一名友方看得到的敵人：本回合攻擊它時武器「無休」，持有標記時改為「毫不留情」。', en: 'Pick an enemy a friendly can see: this TP, weapons have Ceaseless against it, or Relentless with a token.' } },
      { id: 'bitterDemise', cp: 1, name: { zh: '苦澀的死亡', en: 'Bitter Demise' },
        desc: { zh: '本回合友方殘廢時擲 D3：擲出 3（持有標記時 2+）就對 2" 內一名可見敵人造成等量傷害。', en: 'This TP, when a friendly is incapacitated roll a D3: on a 3 (2+ with a token), that much damage to a visible enemy within 2".' } },
    ],
    // The Chieftain, nine picks (one per copy) and two selections from the second list (packages below).
    perCopyRoster: true,
    replacements: Object.fromEntries(['brimstone', 'butcher', 'commsman', 'corpseman', 'flenser', 'gunner', 'sharpshooter', 'thug', 'sweeper'].map((s) => [s, BL_PICKS])),
    ops: [
      op('chieftain', '叛軍首領', 'Traitor Chieftain', { apl: 2, move: 6, save: 5, wounds: 8, base: 25, leadWithStrength: true, bloodedIcon: true, loadouts: BL_CHIEF_LOADOUTS }, [laspistolBL, chainswordBL]),
      op('brimstone', '硫磺擲彈兵', 'Brimstone Grenadier', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, explosiveDemise: true }, [diabolykBomb, fragBL, krakBL, lasgunBL, bayonetBL]),
      op('butcher', '屠夫', 'Traitor Butcher', { apl: 2, move: 6, save: 5, wounds: 8, base: 25, unholySustenance: true }, [cleaver]),
      op('commsman', '叛軍通訊兵', 'Traitor Commsman', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, signal: true, actuation: true }, [lasgunBL, bayonetBL]),
      op('corpseman', '屍醫', 'Traitor Corpseman', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, stimms: true }, [lasgunBL, bayonetBL, stimmNeedle]),
      op('flenser', '剝皮者', 'Traitor Flenser', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, wretched: true, concealCharge: true }, [skinningBlades]),
      op('gunner', '叛軍槍手（火焰）', 'Traitor Gunner (flamer)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, blSpecial: true }, [flamerBL, bayonetBL]),
      op('gunnerGL', '叛軍槍手（榴彈）', 'Traitor Gunner (grenade launcher)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, blSpecial: true }, [glFragBL, glKrakBL, bayonetBL], 0),
      op('gunnerMelta', '叛軍槍手（熱熔）', 'Traitor Gunner (meltagun)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, blSpecial: true }, [meltagunBL, bayonetBL], 0),
      op('gunnerPlasma', '叛軍槍手（電漿）', 'Traitor Gunner (plasma gun)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, blSpecial: true, blPlasma: true }, [plasmaGunBLs, plasmaGunBLx, bayonetBL], 0),
      op('sharpshooter', '叛軍神射手', 'Traitor Sharpshooter', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, camo1: true, blSpecial: true, nameWhispered: true }, [longLasMobileBL, longLasStatBL, bayonetBL]),
      op('thug', '暴徒', 'Traitor Thug', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, tough: true }, [heavyClub]),
      op('sweeper', '戰壕掃蕩兵', 'Traitor Trench Sweeper', { apl: 2, move: 6, save: 4, wounds: 9, base: 25, shielding: true }, [shotgunBL, bayonetShield]),
      op('enforcer', '執法官', 'Traitor Enforcer', { apl: 2, move: 6, save: 4, wounds: 9, base: 32, disciplinarian: true, enforce: true }, [boltPistolBL, powerFistBL], 0),
      op('ogryn', '叛軍歐格林', 'Traitor Ogryn', { apl: 2, move: 6, save: 5, wounds: 16, base: 40, chemEnhanced: true, brute: true, slowWitted: true, avalanche: true }, [maulClaw], 0),
      op('trooper', '叛軍步兵', 'Traitor Trooper', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, groupAct: 'blTrooper', blTrooper: true }, [lasgunBL, bayonetBL], 0),
    ],
  },
  {
    id: 'fellgor',
    name: { zh: '惡角獸掠奪者', en: 'Fellgor Ravagers' },
    color: '#7a5a2a',
    style: { zh: '近戰隊・狂暴・野獸', en: 'Melee · Frenzy · Beasts' },
    blurb: {
      zh: '10 名混沌獸人：生命歸零時不會立刻殘廢，而是陷入狂暴繼續戰鬥，直到被暴擊或連續命中才真正倒地。',
      en: '10 Chaos Beastmen: dropping to 0 wounds sends them into a Frenzy instead of down — they keep fighting until a critical or repeated hit finally fells them.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '搜索與摧毀', en: 'Seek & Destroy' }, { zh: '偵察', en: 'Recon' }],
      kind: { zh: '近戰隊', en: 'Melee' },
      oneBox: { zh: '能', en: 'Yes' },
      buyable: { zh: '能：KT 盒與大桌盒內容一樣', en: 'Yes — the KT box and the Warhammer 40,000 box are the same' },
      note: { zh: '將於 2026 年退出賽季：屆時官方比賽不能使用，一般對戰或非官方比賽仍可使用。', en: 'Rotating out of the season in 2026: then not allowed in official events, still fine for casual and unofficial games.' },
    },
    frenzy: true, // engine flag for the Frenzy faction rule
    rule: {
      name: { zh: '狂暴', en: 'Frenzy' },
      desc: {
        zh: '沒有狂暴標記的友方將殘廢時，改為不殘廢並獲得狂暴標記（剩下的攻擊骰全部作廢；隱蔽改為交戰），對手此時就算它被擊殺。有狂暴標記時：視為重傷、不能隱蔽、不能撿標記與做獨特或任務動作、控制目標時 APL 視為 1。它在以下情況才真正殘廢：自己的啟動或反應結束；近戰中被暴擊打中；近戰中第二次被普通成功打中；被射擊時受到暴擊傷害；被射擊時有 2 顆以上攻擊骰造成普通傷害；戰鬥結束。',
        en: 'A friendly without a Frenzy token that would be incapacitated isn\'t: it gains a Frenzy token (remaining attack dice are discarded; Conceal becomes Engage), and it counts as incapacitated for your opponent from then on. With the token it\'s injured, can\'t Conceal, can\'t Pick Up or perform unique or mission actions, and has APL 1 for control. It\'s incapacitated when its activation or counteraction ends; when struck by a critical success, or a second time by a normal success, in a fight; when Critical Dmg, or Normal Dmg from two or more dice, is inflicted on it by shooting; or when the battle ends.',
      },
    },
    ploys: [
      { id: 'peltingFire', cp: 1, name: { zh: '亂槍齊射', en: 'Pelting Firepower' },
        desc: { zh: '本回合友方射擊已被另一名友方射擊過的敵人時，遠程武器「無休」；被兩名以上射擊過時改為「毫不留情」。', en: 'This TP, a friendly shooting an enemy another friendly has shot has Ceaseless; Relentless if two or more have.' } },
      { id: 'recklessDetermination', cp: 1, name: { zh: '魯莽的決心', en: 'Reckless Determination' },
        desc: { zh: '本回合已行動的友方被射擊、又沒有掩護豁免時，可直接保留一顆防禦骰為普通成功。', en: 'This TP, an expended friendly being shot without cover saves retains one defence die as a normal success without rolling.' } },
      { id: 'violentTemperament', cp: 1, name: { zh: '暴烈脾性', en: 'Violent Temperament' },
        desc: { zh: '本回合友方近戰或反擊時，擲骰後可重擲全部攻擊骰（成功少於 2 顆時自動使用）。', en: 'This TP, a friendly fighting or retaliating can re-roll all its attack dice after rolling (used automatically with fewer than two successes).' } },
      { id: 'ambushFG', cp: 1, name: { zh: '伏擊', en: 'Ambush' },
        desc: { zh: '本回合友方啟動時從隱蔽改為交戰，本次啟動近戰時可把一顆普通成功當暴擊（沒有時把一顆失敗當普通成功）。有狂暴標記不能伏擊。', en: 'This TP, a friendly whose order changes from Conceal to Engage when activated can, when fighting that activation, retain a normal success as a critical (or a fail as a normal success). Not with a Frenzy token.' } },
    ],
    // The Ironhorn and nine picks, one per copy (each once except Warriors).
    perCopyRoster: true,
    replacements: Object.fromEntries(FG_PICKS.slice(0, 9).map((s) => [s, FG_PICKS])),
    ops: [
      op('ironhorn', '鐵角首領', 'Fellgor Ironhorn', { apl: 2, move: 6, save: 5, wounds: 11, base: 32, ironhorn: true, callAttack: true, loadouts: { corrupted: [corruptedPistol, corruptedChainsword], plasma: [plasmaPistolFGs, plasmaPistolFGx, bludgeon] } }, [corruptedPistol, corruptedChainsword]),
      op('deathknell', '喪鐘手', 'Fellgor Deathknell', { apl: 2, move: 6, save: 4, wounds: 10, base: 32, iconBearer: true, warGong: true, gongKnell: true }, [autopistolFG, bludgeon]),
      op('fluxbray', '變異獸人', 'Fellgor Fluxbray', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, cleaverFlurry: true }, [tripleCleavers]),
      op('gnarlscar', '疤面獸人', 'Fellgor Gnarlscar', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, sagacious: true, uncompromising: true }, [autopistolFG, bionicFist]),
      op('gorehorn', '血角獸人', 'Fellgor Gorehorn', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, twoFights: true }, [autopistolFG, skullcleaver]),
      op('herdgoad', '驅群者', 'Fellgor Herd-goad', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, whipControl: true, inciteFury: true }, [autopistolFG, whipRanged, whipMelee]),
      op('mangler', '撕裂者', 'Fellgor Mangler', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, savageBrutality: true, slowWitted: true }, [viciousClaws]),
      op('shaman', '獸人薩滿', 'Fellgor Shaman', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, fgShaman: true }, [autopistolFG, techCurse, braystave]),
      op('toxhorn', '毒角獸人', 'Fellgor Toxhorn', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, toxicBlessings: true, poxBomb: true }, [autopistolFG, cleaverFG]),
      op('vandal', '破壞者', 'Fellgor Vandal', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, sweepingBlow: true }, [mancrusher]),
      op('fgWarriorB', '惡角戰士（重錘）', 'Fellgor Warrior (bludgeon)', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, warriorFrenzy: true, fgWarrior: true }, [autopistolFG, bludgeon], 0),
      op('fgWarriorC', '惡角戰士（劈刀）', 'Fellgor Warrior (cleaver)', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, warriorFrenzy: true, fgWarrior: true }, [autopistolFG, cleaverFG], 0),
    ],
  },
  {
    id: 'exaction',
    name: { zh: '強徵小隊', en: 'Exaction Squad' },
    color: '#3d4f6b',
    style: { zh: '近戰隊・霰彈槍・執法', en: 'Melee · Shotguns · Law' },
    blurb: {
      zh: '帝國法務部的執法小隊：霰彈槍與鎮壓盾近距離壓制，標記一名罪犯集中制裁，還能對友軍交戰中的敵人直接開火。',
      en: 'Adeptus Arbites enforcers: shotguns and suppression shields up close, a marked criminal punished first, and they can shoot into melee their comrades are in.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '搜索與摧毀', en: 'Seek & Destroy' }, { zh: '安全保護', en: 'Security' }],
      kind: { zh: '近戰隊', en: 'Melee' },
      oneBox: { zh: '否：需要多買一盒，強烈建議買目前的審判庭戰鬥巡邏包', en: 'No: you need another box — the current Inquisition Combat Patrol is strongly recommended' },
      buyable: { zh: '能：KT 盒與大桌盒內容一樣', en: 'Yes — the KT box and the Warhammer 40,000 box are the same' },
      note: { zh: '將於 2026 年退出賽季：屆時官方比賽不能使用，一般對戰或非官方比賽仍可使用。', en: 'Rotating out of the season in 2026: then not allowed in official events, still fine for casual and unofficial games.' },
    },
    bringItDown: true, // the mark gives Punishing (Marked for Justice)
    justiceMark: true, // a new mark is picked when the old one falls
    ruthless: true, // Ruthless Efficiency: can shoot enemies in friendly control range
    rule: {
      name: { zh: '冷酷效率・正義標記・鎮壓', en: 'Ruthless Efficiency · Marked for Justice · Repress' },
      desc: {
        zh: '冷酷效率：射擊時，友方在敵人控制範圍內也不妨礙選它為目標。正義標記（策略階段）：選一名敵人，攻擊它時武器「懲罰」；它殘廢時自動改標記另一名。鎮壓（盾牌武器）：每次格擋可擋兩顆成功；反擊時由自己先結算。',
        en: 'Ruthless Efficiency: friendlies in an enemy\'s control range don\'t stop you targeting it. Marked for Justice (Strategy phase): pick an enemy — Punishing against it; a new mark is picked when it falls. Repress (shield weapons): each block cancels two successes; when retaliating, it resolves first.',
      },
    },
    ploys: [
      { id: 'guiltReveals', cp: 1, name: { zh: '罪行自現', en: 'Guilt Reveals Itself' },
        desc: { zh: '本回合友方選目標時，4" 內的敵人不能用掩體擋（仍保留掩護豁免，2" 內照常沒有）。', en: 'This TP, enemies within 4" of a friendly can\'t use cover when it picks targets (they keep the cover save, except within 2" as normal).' } },
      { id: 'inviolate', cp: 1, name: { zh: '不可侵犯的轄區', en: 'Inviolate Jurisdiction' },
        desc: { zh: '本回合在目標點或敵人 2" 內的友方被射擊時，可重擲一顆防禦骰。', en: 'This TP, a friendly within 2" of an objective marker or an enemy re-rolls one defence die when shot.' } },
      { id: 'dispenseJustice', cp: 1, name: { zh: '執行正義', en: 'Dispense Justice' },
        desc: { zh: '本回合友方近戰或反擊時，若本次啟動移動沒超過 Move（或反應時），近戰武器「無休」。', en: 'This TP, a friendly fighting or retaliating that hasn\'t moved more than its Move this activation (or is counteracting) has Ceaseless.' } },
      { id: 'terminalDecree', cp: 1, name: { zh: '終結令', en: 'Terminal Decree' },
        desc: { zh: '本回合友方射擊 6" 內的敵人時，遠程武器「平衡」。', en: 'This TP, a friendly shooting an enemy within 6" has Balanced.' } },
    ],
    // The Proctor-exactant (shotpistol and maul, or combat shotgun) and ten picks, one per copy.
    perCopyRoster: true,
    replacements: { proctor: ['proctor', 'proctorShotgun'], ...Object.fromEntries(EX_PICKS.slice(0, 10).map((s) => [s, EX_PICKS])) },
    ops: [
      op('proctor', '執法隊長', 'Proctor-exactant', { apl: 2, move: 6, save: 3, wounds: 9, base: 28, nuncio: true }, [shotpistolPE, dominatorMaul]),
      op('castigator', '懲戒者', 'Castigator', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, engenderedFocus: true, zealous: true, arrest: true }, [combatShotgunClose, combatShotgunLong, excruciatorMaul]),
      op('chirurgant', '執法醫官', 'Chirurgant', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, medic: true, medikit: true }, [combatShotgunClose, combatShotgunLong, baton]),
      op('leashmaster', '馴犬師', 'Leashmaster', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, handler: true, rvrCommand: true }, [combatShotgunClose, combatShotgunLong, shotpistolAB, baton]),
      // Attack Pattern (Leashmaster): Aggressive (melee Relentless) and Swift (+2" Move) picked for the battle.
      op('mastiff', 'R-VR 機械獒犬', 'R-VR Cyber-mastiff', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, apprehend: true, attackPatterns: true, actionsOnly: ['apprehend', 'charge', 'dash', 'fallBack', 'fight', 'reposition', 'pickUp'] }, [mechBite]),
      op('malocator', '鑑識官', 'Malocator', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, veriscant: true, acuteFocus: true }, [combatShotgunClose, combatShotgunLong, baton]),
      op('marksman', '神射手', 'Marksman', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, optics: true }, [execConcealed, execMobile, execStationary, baton]),
      op('revelatum', '偵察官', 'Revelatum', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, support: 'spot', spotRange: 8 }, [scopedShort, scopedLong, baton]),
      op('subductor', '鎮壓兵', 'Subductor', { apl: 2, move: 6, save: 3, wounds: 8, base: 28, stubbornSubjugator: true, exRepeat: true }, [shotpistolAB, shockMaulShield]),
      op('vigilant', '警戒兵', 'Vigilant', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, vigilance: true, exRepeat: true }, [combatShotgunClose, combatShotgunLong, baton]),
      op('vox', '通訊官', 'Vox-signifier', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, signalAny: true }, [combatShotgunClose, combatShotgunLong, baton]),
      op('proctorShotgun', '執法隊長（霰彈槍）', 'Proctor-exactant (combat shotgun)', { apl: 2, move: 6, save: 4, wounds: 9, base: 28, nuncio: true }, [pcShotgunClose, pcShotgunLong, pcBaton], 0),
      op('exGunnerGL', '槍手（榴彈）', 'Arbites Gunner (grenade launcher)', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, exGunner: true }, [exGL, baton], 0),
      op('exGunnerStubber', '槍手（重型機槍）', 'Arbites Gunner (heavy stubber)', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, exGunner: true }, [exStubberF, exStubberS, baton], 0),
      op('exGunnerWebber', '槍手（蛛網槍）', 'Arbites Gunner (webber)', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, exGunner: true }, [exWebber, baton], 0),
    ],
  },
  {
    id: 'hierotek',
    name: { zh: '技師環', en: 'Hierotek Circle' },
    color: '#3aa35a',
    style: { zh: '射擊隊・死靈・復甦', en: 'Shooting · Necrons · Reanimation' },
    blurb: {
      zh: '死靈技師帶著不朽者、死亡標記狙擊手與聖甲蟲構裝體：身軀會自我修復、殘廢還能復甦，技師能借部下的眼睛開火。',
      en: 'A Necron Cryptek with Immortals, Deathmark snipers and Canoptek constructs: living metal heals, the fallen reanimate, and the Cryptek fires through its thralls\' eyes.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '偵察', en: 'Recon' }, { zh: '安全保護', en: 'Security' }],
      kind: { zh: '射擊隊', en: 'Shooting' },
      oneBox: { zh: '否：至少要另外買兩個 HQ 單位，或一些死靈單位', en: 'No: you need at least two more HQ units, or some other Necron units' },
      buyable: { zh: '能：KT 盒目前還買得到，但不會有大桌盒', en: 'Yes — the KT box is still available, but there is no Warhammer 40,000 box' },
      size: { zh: '8 名特工', en: '8 operatives' },
      note: { zh: '將於 2026 年退出賽季：屆時官方比賽不能使用，一般對戰或非官方比賽仍可使用。', en: 'Rotating out of the season in 2026: then not allowed in official events, still fine for casual and unofficial games.' },
    },
    reanimation: true, // Reanimation Protocols
    livingMetal: true, // Living Metal
    rule: {
      name: { zh: '復甦協議・活體金屬・放大', en: 'Reanimation Protocols · Living Metal · Magnify' },
      desc: {
        zh: '復甦協議：每名特工第一次殘廢時留下復甦標記；每回合準備步驟擲 D6，3+ 讓一名殘廢的特工在標記 3" 內以 1 生命、準備好的狀態回到場上（對手的擊殺數會減少）。活體金屬：每回合準備步驟，每名友方回復 D3+1 生命。放大（技師／學徒的武器）：可借另一名交戰指令、未被敵人纏住且看得到的技師或學徒的位置判斷目標、掩護與遮蔽，並獲得「無休」。',
        en: 'Reanimation Protocols: the first time each operative falls it leaves a Reanimation marker; in each Ready step roll a D6 — on a 3+ a fallen operative returns within 3" of its marker with 1 wound, ready (the opponent\'s kill count goes down). Living Metal: in each Ready step every friendly regains D3+1 wounds. Magnify (Cryptek / Apprentek weapons): pick targets, cover and obscured from another visible Engage-order Cryptek or Apprentek that isn\'t in an enemy\'s control range, and gain Ceaseless.',
      },
    },
    ploys: [
      { id: 'relentlessOnslaught', cp: 1, name: { zh: '無情猛攻', en: 'Relentless Onslaught' },
        desc: { zh: '本回合友方射擊 8" 內的特工時，遠程武器「平衡」。', en: 'This TP, a friendly shooting an operative within 8" has Balanced.' } },
      { id: 'undyingAndroids', cp: 1, name: { zh: '不死機械體', en: 'Undying Androids' },
        desc: { zh: '本回合友方被射擊時，若不能保留掩護豁免，可直接保留 1 顆防禦骰作為普通成功。', en: 'This TP, a friendly being shot that can\'t retain cover saves retains one defence die as a normal success without rolling it.' } },
      { id: 'methodicalElim', cp: 1, name: { zh: '有條不紊的殲滅', en: 'Methodical Elimination' },
        desc: { zh: '本回合友方近戰武器「精準 1」；本次啟動移動沒超過 Move 時近戰、或反擊時改為「精準 2」。', en: 'This TP, friendly melee weapons have Accurate 1; fighting without having moved more than its Move this activation, or retaliating: Accurate 2.' } },
      { id: 'commandUnderlings', cp: 1, name: { zh: '指揮下屬', en: 'Command Underlings' },
        desc: { zh: '支援。選一項：技師 6" 內看得到的其他友方各免費衝刺；或學徒 3" 內看得到的其他友方（技師除外）各免費衝刺。', en: 'SUPPORT. Either each other friendly visible within 6" of the Cryptek, or each other friendly (not the Cryptek) visible within 3" of the Apprentek, makes a free Dash.' } },
    ],
    // The Cryptek (Technomancer, Chronomancer or Psychomancer), the two Plasmacytes and five picks, one per copy.
    perCopyRoster: true,
    replacements: { technomancer: ['technomancer', 'chronomancer', 'psychomancer'], ...Object.fromEntries(HC_PICKS.map((s) => [s, HC_PICKS])) },
    ops: [
      op('technomancer', '技術術士', 'Technomancer', { apl: 3, move: 6, save: 3, wounds: 14, base: 50, cryptek: true, magnifyRelay: true, interstitial: true, canoptekRepair: true, augment: true, reinforce: true }, [staffLight, staffLightM]),
      op('apprentek', '學徒', 'Apprentek', { apl: 3, move: 6, save: 3, wounds: 11, base: 32, apprentek: true, magnifyRelay: true, interstitial: true }, [arcaneConduit, arcaneConduitM]),
      op('deathmark', '死亡標記', 'Deathmark', { apl: 2, move: 5, save: 3, wounds: 10, base: 32, deathmark: true, mdVision: true }, [synapticDis, fistsN], 2),
      op('despotek', '不朽者指揮官', 'Immortal Despotek', { apl: 2, move: 5, save: 3, wounds: 11, base: 32, control: 3, steadfast: true, despotek: true, interstitial: true, loadouts: { tesla: HC_IMMORTAL.tesla, gauss: HC_IMMORTAL.gauss } }, [teslaCarbine, bayonetN]),
      op('guardian', '不朽者衛士', 'Immortal Guardian', { apl: 2, move: 5, save: 3, wounds: 10, base: 32, control: 3, steadfast: true, loadouts: HC_IMMORTAL }, [gaussBlaster, bayonetN]),
      op('accelerator', '加速漿體', 'Plasmacyte Accelerator', { apl: 2, move: 7, save: 5, wounds: 5, base: 25, small: true, disengage: true, accelerate: true }, [spark, clawsP]),
      op('reanimator', '復甦漿體', 'Plasmacyte Reanimator', { apl: 2, move: 7, save: 5, wounds: 5, base: 25, small: true, disengage: true, reanimate: true }, [atomiser, clawsP]),
      op('chronomancer', '時間術士', 'Chronomancer', { apl: 3, move: 6, save: 3, wounds: 14, base: 40, cryptek: true, chronomancer: true, magnifyRelay: true, interstitial: true, loadouts: { aeonstave: [aeonstave, aeonstaveM], entropic: [entropicLance, entropicLanceM] } }, [aeonstave, aeonstaveM], 0),
      op('psychomancer', '心靈術士', 'Psychomancer', { apl: 3, move: 6, save: 3, wounds: 14, base: 40, cryptek: true, psychomancer: true, magnifyRelay: true, interstitial: true }, [abyssalLance, abyssalLanceM], 0),
    ],
  },
  {
    id: 'hunterClade',
    name: { zh: '獵手之爪', en: 'Hunter Clade' },
    color: '#b8432f',
    style: { zh: '混合隊・機械教・教條指令', en: 'Mixed · Adeptus Mechanicus · Doctrina' },
    blurb: {
      zh: '機械教的獵殺小隊：遊騎兵與先鋒軍遠距離狙擊、輻射壓制，西卡里安潛行者近身撕碎目標；每回合切換一種教條指令來強化（也削弱）全隊。',
      en: 'An Adeptus Mechanicus hunting party: Skitarii Rangers and Vanguard shoot and irradiate, Sicarian Ruststalkers shred up close, and each turning point a Doctrina Imperative boosts (and hampers) the whole team.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '偵察', en: 'Recon' }, { zh: '搜索與摧毀', en: 'Seek & Destroy' }],
      kind: { zh: '混合隊', en: 'Mixed' },
      oneBox: { zh: '否：至少需要兩盒', en: 'No: you need at least two boxes' },
      buyable: { zh: '能：這些都是大桌單位', en: 'Yes — these are all Warhammer 40,000 units' },
      size: { zh: '10 名特工', en: '10 operatives' },
      note: { zh: '2025 年已退出賽季：官方比賽不能使用，一般對戰或非官方比賽仍可使用。', en: 'Rotated out of the season in 2025: not allowed in official events, still fine for casual and unofficial games.' },
    },
    doctrina: true, // Doctrina Imperatives
    // The Primary Mode is picked at setup (its Deprecation can be ignored once when it's selected).
    tacticSlots: 1,
    tacticsLabel: { zh: '主要模式（教條指令）', en: 'Primary Mode (Doctrina Imperative)' },
    tactics: [
      { id: 'protector', name: { zh: '守護者指令', en: 'Protector Imperative' }, desc: { zh: '優化：遠程武器「無休」。劣化：近戰武器命中變差 1。', en: 'Optimisation: ranged weapons have Ceaseless. Deprecation: melee weapons\' Hit worsened by 1.' } },
      { id: 'conqueror', name: { zh: '征服者指令', en: 'Conqueror Imperative' }, desc: { zh: '優化：近戰武器「無休」。劣化：遠程武器命中變差 1。', en: 'Optimisation: melee weapons have Ceaseless. Deprecation: ranged weapons\' Hit worsened by 1.' } },
      { id: 'bulwark', name: { zh: '壁壘指令', en: 'Bulwark Imperative' }, desc: { zh: '優化：受到 3 以上的普通傷害時 -1。劣化：Move -1"。', en: 'Optimisation: Normal Dmg of 3+ inflicts 1 less. Deprecation: -1" Move.' } },
      { id: 'aggressor', name: { zh: '侵攻者指令', en: 'Aggressor Imperative' }, desc: { zh: '優化：Move +1"。劣化：豁免變差 1。', en: 'Optimisation: +1" Move. Deprecation: Save worsened by 1.' } },
      { id: 'neutral', name: { zh: '中立指令', en: 'Neutral Imperative' }, desc: { zh: '沒有優化也沒有劣化。', en: 'No Optimisation and no Deprecation.' } },
    ],
    defaultTactics: ['protector'],
    rule: {
      name: { zh: '教條指令', en: 'Doctrina Imperatives' },
      desc: {
        zh: '開戰前選一種指令作為「主要模式」。每回合策略階段（策略計謀）選一種指令給全隊，直到下回合準備步驟：同時有它的優化與劣化效果。整場一次，選到主要模式時可以無視它的劣化。',
        en: 'Before the battle, pick one Imperative as the Primary Mode. Each Strategy phase (strategic gambit) pick an Imperative for the team until the next Ready step: both its Optimisation and Deprecation apply. Once per battle, when you pick the Primary Mode, you can ignore its Deprecation.',
      },
    },
    ploys: [
      { id: 'debilitating', cp: 1, name: { zh: '衰弱輻射', en: 'Debilitating Irradiation' },
        desc: { zh: '本回合受「輻射飽和」影響的敵人攻擊友方先鋒軍時，武器普通傷害 -1（最低 3）。', en: 'This TP, an enemy under Rad-Saturation attacking a friendly Vanguard has -1 Normal Dmg (to a minimum of 3).' } },
      { id: 'neurostatic', cp: 1, name: { zh: '神經靜電干擾', en: 'Neurostatic Interference' },
        desc: { zh: '本回合友方滲透者 6" 內的敵人射擊、近戰或反擊時，不能重擲攻擊骰（包括指揮重擲）。', en: 'This TP, enemies within 6" of a friendly Infiltrator can\'t re-roll attack dice when shooting, fighting or retaliating (Command Re-roll included).' } },
      { id: 'accelerant', cp: 1, name: { zh: '加速劑', en: 'Accelerant Agents' },
        desc: { zh: '本回合友方潛行者每次啟動可以近戰兩次，其中一次免費。', en: 'This TP, each friendly Ruststalker can Fight twice per activation, and one of them is free.' } },
      { id: 'scoutingProtocol', cp: 1, name: { zh: '偵察協定', en: 'Scouting Protocol' },
        desc: { zh: '每名隱蔽指令、離敵人超過 6" 的友方遊騎兵立刻免費衝刺。第 1 回合不能用。', en: 'Each friendly Ranger with a Conceal order more than 6" from enemy operatives makes a free Dash. Not in the first turning point.' } },
    ],
    // The leader (four options) and nine picks, one per copy.
    perCopyRoster: true,
    replacements: { rsPrinceps: ['rsPrinceps', 'infPrinceps', 'rgAlpha', 'vgAlpha'], ...Object.fromEntries(['rsWarrior', 'rsWarriorC', 'infWarrior', 'rgGunner', 'rgDiktat', 'rgSurveyor', 'rgWarrior', 'vgGunner', 'vgWarrior'].map((s) => [s, HU_PICKS])) },
    ops: [
      op('rsPrinceps', '潛行者首領', 'Sicarian Ruststalker Princeps', { apl: 2, move: 6, save: 4, wounds: 11, base: 40, ruststalker: true, sicarian: true, wastelandStalker: true, canticleDestruction: true, controlProtocol: true }, [chordclawBlades]),
      op('rsWarrior', '潛行者戰士', 'Sicarian Ruststalker Warrior', { apl: 2, move: 6, save: 4, wounds: 10, base: 40, ruststalker: true, sicarian: true, wastelandStalker: true, huRepeat: true }, [transonicBlades]),
      op('rsWarriorC', '潛行者戰士（和弦爪）', 'Sicarian Ruststalker Warrior (chordclaw)', { apl: 2, move: 6, save: 4, wounds: 10, base: 40, ruststalker: true, sicarian: true, wastelandStalker: true, huRepeat: true }, [chordclawRazor]),
      op('infWarrior', '滲透者戰士', 'Sicarian Infiltrator Warrior', { apl: 2, move: 6, save: 4, wounds: 10, base: 40, infiltrator: true, sicarian: true, huRepeat: true, loadouts: HU_INF_LOADOUTS }, [flechette, taserGoadS]),
      op('rgGunner', '遊騎兵槍手（火繩槍）', 'Skitarii Ranger Gunner (arquebus)', { apl: 2, move: 6, save: 4, wounds: 7, base: 35, ranger: true, targetingProtocol: true, huSpecial: 'arq' }, [arquebusMobile, arquebusStationary, gunButt]),
      op('rgDiktat', '遊騎兵傳令官', 'Skitarii Ranger Diktat', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, ranger: true, targetingProtocol: true, signal: true, huDiktat: true }, [galvanic, gunButt]),
      op('rgSurveyor', '遊騎兵勘測員', 'Skitarii Ranger Surveyor', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, ranger: true, targetingProtocol: true, support: 'spot', huSurveyor: true }, [galvanic, gunButt]),
      op('rgWarrior', '遊騎兵戰士', 'Skitarii Ranger Warrior', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, ranger: true, targetingProtocol: true, huRepeat: true }, [galvanic, gunButt]),
      op('vgGunner', '先鋒軍槍手（電漿）', 'Skitarii Vanguard Gunner (plasma caliver)', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, vanguard: true, radSat: true, huSpecial: 'plasma' }, [caliverStd, caliverSuper, gunButt]),
      op('vgWarrior', '先鋒軍戰士', 'Skitarii Vanguard Warrior', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, vanguard: true, radSat: true, huRepeat: true }, [radiumCarbine, gunButt]),
      op('infPrinceps', '滲透者首領', 'Sicarian Infiltrator Princeps', { apl: 2, move: 6, save: 4, wounds: 11, base: 40, infiltrator: true, sicarian: true, shroudpsalm: true, controlProtocol: true, loadouts: HU_INF_LOADOUTS }, [flechette, taserGoadS], 0),
      op('rgAlpha', '遊騎兵首領', 'Skitarii Ranger Alpha', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, ranger: true, targetingProtocol: true, canticleElim: true, controlProtocol: true, loadouts: HU_ALPHA(galvanic) }, [galvanic, gunButt], 0),
      op('vgAlpha', '先鋒軍首領', 'Skitarii Vanguard Alpha', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, vanguard: true, radSat: true, canticleGlow: true, controlProtocol: true, loadouts: HU_ALPHA(radiumCarbine) }, [radiumCarbine, gunButt], 0),
      op('rgGunnerArc', '遊騎兵槍手（電弧）', 'Skitarii Ranger Gunner (arc rifle)', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, ranger: true, targetingProtocol: true, huSpecial: 'arc' }, [arcRifle, gunButt], 0),
      op('rgGunnerPlasma', '遊騎兵槍手（電漿）', 'Skitarii Ranger Gunner (plasma caliver)', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, ranger: true, targetingProtocol: true, huSpecial: 'plasma' }, [caliverStd, caliverSuper, gunButt], 0),
      op('vgGunnerArc', '先鋒軍槍手（電弧）', 'Skitarii Vanguard Gunner (arc rifle)', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, vanguard: true, radSat: true, huSpecial: 'arc' }, [arcRifle, gunButt], 0),
      op('vgGunnerArq', '先鋒軍槍手（火繩槍）', 'Skitarii Vanguard Gunner (arquebus)', { apl: 2, move: 6, save: 4, wounds: 7, base: 35, vanguard: true, radSat: true, huSpecial: 'arq' }, [arquebusMobile, arquebusStationary, gunButt], 0),
      op('vgDiktat', '先鋒軍傳令官', 'Skitarii Vanguard Diktat', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, vanguard: true, radSat: true, signal: true, huDiktat: true }, [radiumCarbine, gunButt], 0),
      op('vgSurveyor', '先鋒軍勘測員', 'Skitarii Vanguard Surveyor', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, vanguard: true, radSat: true, support: 'spot', huSurveyor: true }, [radiumCarbine, gunButt], 0),
    ],
  },
  {
    id: 'kasrkin',
    name: { zh: '卡舍津', en: 'Kasrkin' },
    color: '#5c7a3a',
    style: { zh: '射擊隊・精銳步兵・戰技', en: 'Shooting · Elite infantry · Skill at Arms' },
    blurb: {
      zh: '卡迪安的特種部隊：熱射雷射槍原地連射、專精槍手與狙擊手壓制，每回合選一種戰技（重創射擊、近戰、快速移動或硬撐）。',
      en: 'Cadia\'s special forces: hot-shot lasguns firing twice when they hold still, specialist gunners and a sniper, and each turning point a Skill at Arms (Severe shooting, melee, speed or toughness).',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '安全保護', en: 'Security' }, { zh: '搜索與摧毀', en: 'Seek & Destroy' }],
      kind: { zh: '射擊隊', en: 'Shooting' },
      oneBox: { zh: '勉強：除非放棄噴火兵和狙擊手', en: 'Barely: unless you give up the flamer and the sharpshooter' },
      buyable: { zh: '能：KT 盒與大桌盒內容一樣', en: 'Yes — the KT box and the Warhammer 40,000 box are the same' },
      size: { zh: '10 名特工', en: '10 operatives' },
      note: { zh: '將於 2026 年退出賽季：屆時官方比賽不能使用，一般對戰或非官方比賽仍可使用。', en: 'Rotating out of the season in 2026: then not allowed in official events, still fine for casual and unofficial games.' },
    },
    skillAtArms: true,
    rapidFire: true,
    rule: {
      name: { zh: '戰技・快速射擊', en: 'Skill at Arms · Rapid Fire' },
      desc: {
        zh: '戰技（策略階段）：選一種給全隊直到下回合——點燃他們（遠程「重創」）、為了卡迪亞！（近戰 Atk +1 最多 4，近戰第一擊 +1 傷害）、快速打擊（移動 +1"）、冷血（被攻擊時第一顆 3 以上普通傷害 -1）。士官在場時可選兩種。快速射擊：本次啟動沒有移動的特工可以射擊兩次，但都要用爆彈手槍、熱射雷射槍或熱射雷射手槍（之後就不能移動）。',
        en: 'Skill at Arms (Strategy phase): one for the team until next TP — Light \'Em Up (ranged Severe), For Cadia! (melee Atk +1 to max 4, +1 damage on the first strike when fighting), Strike Fast (+1" when repositioning), Ice in Your Veins (the first 3+ Normal Dmg die against it each sequence deals 1 less). Two while the Sergeant is in the killzone. Rapid Fire: an operative that doesn\'t move this activation can Shoot twice, both with a bolt pistol, hot-shot lasgun or hot-shot laspistol (and can\'t move afterwards).',
      },
    },
    ploys: [
      { id: 'engageFromCover', cp: 1, name: { zh: '依託掩體交戰', en: 'Engage From Cover' },
        desc: { zh: '本回合在掩護中的友方被射擊時，可重擲一顆防禦骰。', en: 'This TP, a friendly in cover being shot re-rolls one defence die.' } },
      { id: 'clearanceSweep', cp: 1, name: { zh: '清掃區域', en: 'Clearance Sweep' },
        desc: { zh: '在最前線的敵人處放清掃標記：本回合標記 5" 內的友方射擊同樣在 5" 內的特工時，武器「無休」。', en: 'A Clearance Sweep marker by the frontmost enemy: this TP, friendlies within 5" of it shooting operatives within 5" of it have Ceaseless.' } },
      { id: 'eliminationPattern', cp: 1, name: { zh: '殲滅模式', en: 'Elimination Pattern' },
        desc: { zh: '本回合用熱射武器射擊沒有掩護豁免、或被偵察兵掃描中的敵人：「暴擊穿甲 1」。', en: 'This TP, hot-shot weapons shooting an enemy that can\'t retain cover saves, or is being scanned, have Piercing Crits 1.' } },
      { id: 'ksRelocate', cp: 1, notTP1: true, name: { zh: '轉移陣地', en: 'Relocate' },
        desc: { zh: '選一名離敵人超過 3" 的友方：它和它 3" 內、同樣離敵人超過 3" 的友方各免費衝刺一次（順序自選）。第一回合不能用。', en: 'Pick a friendly more than 3" from enemies: it and each friendly within 3" of it that is also more than 3" from enemies make a free Dash, in any order. Not in the first turning point.' } },
    ],
    // The Sergeant and nine picks, one per copy (each once except Troopers, at most four Gunners).
    perCopyRoster: true,
    replacements: Object.fromEntries(['ksMedic', 'ksDemo', 'ksRecon', 'ksFlamer', 'ksMelta', 'ksPlasma', 'ksSharpshooter', 'ksVox', 'ksTrooper'].map((s) => [s, KS_PICKS])),
    ops: [
      op('ksSergeant', '士官', 'Kasrkin Sergeant', { apl: 3, move: 6, save: 4, wounds: 9, base: 28, veteranLeadership: true, tacticalCommand: true, loadouts: ksSgtLoadouts }, ksSgtLoadouts['hsPistol+power']),
      op('ksMedic', '戰地醫護兵', 'Kasrkin Combat Medic', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, medic: true, medikit: true, medikit0: true }, [hsLasgun, gunButt]),
      op('ksDemo', '爆破兵', 'Kasrkin Demo-trooper', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, blastPadding: true, meltaMine: true }, [hsLaspistol, gunButt]),
      op('ksRecon', '偵察兵', 'Kasrkin Recon-trooper', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, auspex: true }, [hsLasgun, gunButt]),
      op('ksFlamer', '槍手（噴火器）', 'Kasrkin Gunner (flamer)', { apl: 2, move: 6, save: 4, wounds: 8, base: 28 }, [flamerK, gunButt]),
      op('ksMelta', '槍手（熱熔槍）', 'Kasrkin Gunner (meltagun)', { apl: 2, move: 6, save: 4, wounds: 8, base: 28 }, [meltaK, gunButt]),
      op('ksPlasma', '槍手（電漿槍）', 'Kasrkin Gunner (plasma gun)', { apl: 2, move: 6, save: 4, wounds: 8, base: 28 }, [plasmaGunK, plasmaGunKS, gunButt]),
      op('ksGL', '槍手（榴彈發射器）', 'Kasrkin Gunner (grenade launcher)', { apl: 2, move: 6, save: 4, wounds: 8, base: 28 }, [ksGLFrag, ksGLKrak, gunButt], 0),
      op('ksVolley', '槍手（熱射齊射槍）', 'Kasrkin Gunner (hot-shot volley gun)', { apl: 2, move: 6, save: 4, wounds: 8, base: 28 }, [ksVolleyF, ksVolleyS, gunButt], 0),
      op('ksSharpshooter', '神射手', 'Kasrkin Sharpshooter', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, camoCloak: true }, [hsMarksmanC, hsMarksmanM, hsMarksmanS, gunButt]),
      op('ksVox', '通訊兵', 'Kasrkin Vox-trooper', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, battleComms: true }, [hsLasgun, gunButt]),
      op('ksTrooper', '士兵', 'Kasrkin Trooper', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, adaptive: true }, [hsLasgun, gunButt]),
    ],
  },
  {
    id: 'legionaries',
    name: { zh: '軍團', en: 'Legionaries' },
    color: '#7a2230',
    style: { zh: '混合隊・混沌星際戰士・混沌印記', en: 'Mixed · Heretic Astartes · Marks of Chaos' },
    blurb: {
      zh: '背叛帝皇的混沌星際戰士：人少但每個都很硬，每名隊員帶著不同混沌之神的印記，近戰與重火力都很兇。',
      en: 'Heretic Astartes who turned on the Emperor: few but very tough, each bearing the mark of a different Chaos god, savage in melee and with heavy firepower.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '搜索與摧毀', en: 'Seek & Destroy' }, { zh: '安全保護', en: 'Security' }],
      kind: { zh: '混合隊', en: 'Mixed' },
      oneBox: { zh: '能', en: 'Yes' },
      buyable: { zh: '能：這些都已成為大桌單位', en: 'Yes — these are now Warhammer 40,000 units' },
      size: { zh: '6 名特工', en: '6 operatives' },
      note: { zh: '2025 年已退出賽季：官方比賽不能使用，一般對戰或非官方比賽仍可使用。', en: 'Rotated out of the season in 2025: not allowed in official events, still fine for casual and unofficial games.' },
    },
    astartes: true,
    marksOfChaos: true,
    rule: {
      name: { zh: '星際戰士・混沌印記', en: 'Astartes · Marks of Chaos' },
      desc: {
        zh: '星際戰士：每次啟動可射擊兩次（其中一次要用爆彈武器）或近戰兩次；任何指令都能反應。混沌印記（每名隊員固定一種）：恐虐（近戰「重創」）、奸奇（遠程「重創」）、納垢（受到 3 以上普通傷害時 5+ -1）、色孽（Move +1"）、混沌不分（攻擊 6" 內的敵人時「無休」）。',
        en: 'Astartes: two Shoots (one with a bolt weapon) or two Fights per activation; can counteract on any order. Marks of Chaos (fixed per operative): Khorne (melee Severe), Tzeentch (ranged Severe), Nurgle (3+ Normal Dmg: 5+ = 1 less), Slaanesh (+1" Move), Undivided (Ceaseless against enemies within 6").',
      },
    },
    ploys: [
      { id: 'bloodGod', cp: 1, name: { zh: '血祭血神', en: 'Blood for the Blood God' },
        desc: { zh: '本回合友方近戰時第一次打擊 +1 傷害（最多 7）；恐虐印記的友方近戰武器兩個傷害都 +1（最多 7）。', en: 'This TP, a friendly\'s first strike when fighting deals 1 more (max 7); Khorne operatives\' melee weapons have +1 to both Dmg (max 7) instead.' } },
      { id: 'implacable', cp: 1, name: { zh: '無可阻擋', en: 'Implacable' },
        desc: { zh: '本回合射擊友方的「穿甲 1」改為「暴擊穿甲 1」；納垢印記的友方無視重傷減益。', en: 'This TP, Piercing 1 against friendlies becomes Piercing Crits 1; Nurgle operatives ignore injured penalties.' } },
      { id: 'quicksilver', cp: 1, name: { zh: '水銀之速', en: 'Quicksilver Speed' },
        desc: { zh: '本回合移動過的友方近戰或反擊時，敵人近戰命中變差 1；移動過的色孽友方被 6" 外射擊時，敵人命中變差 1。', en: 'This TP, a friendly that moved this TP fighting or retaliating worsens the enemy\'s melee Hit by 1; a Slaanesh one that moved, shot from more than 6", worsens the shooter\'s Hit by 1.' } },
      { id: 'fickleFates', cp: 1, name: { zh: '無常命運', en: 'Fickle Fates' },
        desc: { zh: '本回合射擊尚未行動的敵人時遠程「平衡」（已有則「毫不留情」）；尚未行動的奸奇友方被射擊時，保留暴擊豁免的話可把一顆失敗算成普通豁免。', en: 'This TP, shooting a ready enemy: Balanced (Relentless if it already has it); a ready Tzeentch friendly being shot that retains a critical save retains one fail as a normal save.' } },
    ],
    // A leader (Chosen or Aspiring Champion) and five picks, each once except Warriors; each picks a Mark of Chaos (roster key mark_<slot>).
    perCopyRoster: true,
    replacements: { lgChosen: ['lgChosen', 'lgChampion'], ...Object.fromEntries(['lgBalefire', 'lgButcher', 'lgShrivetalon', 'lgHeavy', 'lgAnointed'].map((s) => [s, LG_PICKS])) },
    ops: [
      op('lgChosen', '被選者', 'Legionary Chosen', { apl: 3, move: 6, save: 3, wounds: 15, base: 32, mark: 'khorne', daemonicAura: true, soulGorge: true, loadouts: lgChosenLoadouts }, lgChosenLoadouts.plasma),
      op('lgBalefire', '狂焰侍僧', 'Legionary Balefire Acolyte', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, mark: 'tzeentch' }, [boltPistolL, fireblast, lifeSiphon, fellDagger]),
      op('lgButcher', '屠夫', 'Legionary Butcher', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, mark: 'undivided', noAssistVs: true }, [boltPistolL, chainaxe]),
      op('lgShrivetalon', '剝皮者', 'Legionary Shrivetalon', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, mark: 'slaanesh', viciousReflexes: true, dismember: true, grisly: true }, [boltPistolL, flensingBlades]),
      op('lgHeavy', '重火力兵', 'Legionary Heavy Gunner', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, mark: 'nurgle', loadouts: lgHeavyLoadouts }, lgHeavyLoadouts.reaper),
      op('lgAnointed', '受膏者', 'Legionary Anointed', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, mark: 'khorne', unleashDaemon: true }, [boltPistolL, daemonicClaw]),
      op('lgChampion', '有志冠軍', 'Legionary Aspiring Champion', { apl: 3, move: 6, save: 3, wounds: 15, base: 32, mark: 'undivided', eyesOfGods: true, loadouts: lgChampLoadouts }, lgChampLoadouts['plasma+power'], 0),
      op('lgGunner', '槍手', 'Legionary Gunner', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, mark: 'tzeentch', loadouts: lgGunnerLoadouts }, lgGunnerLoadouts.plasma, 0),
      op('lgIcon', '聖像旗手', 'Legionary Icon Bearer', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, mark: 'undivided', iconBearer: true, favouredGods: true, loadouts: lgWarriorLoadouts }, lgWarriorLoadouts.boltgun, 0),
      op('lgWarrior', '戰士', 'Legionary Warrior', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, mark: 'undivided', infernalPact: true, loadouts: lgWarriorLoadouts }, lgWarriorLoadouts.boltgun, 0),
      op('lgWarrior2', '戰士（另一套武器）', 'Legionary Warrior (second loadout)', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, mark: 'undivided', infernalPact: true, loadouts: lgWarriorLoadouts }, lgWarriorLoadouts.chain, 0), // (so two Warriors can carry different weapons)
    ],
  },
  {
    id: 'novitiates',
    name: { zh: '見習修女', en: 'Novitiates' },
    color: '#b23a48',
    style: { zh: '近戰隊・修女會・信仰行為', en: 'Melee · Adepta Sororitas · Acts of Faith' },
    blurb: {
      zh: '修女會的見習生：熱忱的近戰小隊，靠信仰點數在關鍵擲骰時扭轉結果，擊殺敵人還能再獲得信仰。',
      en: 'Trainee Battle Sisters: a zealous melee squad that spends Faith points to turn key dice rolls, and gains more Faith from its kills.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '安全保護', en: 'Security' }, { zh: '偵察', en: 'Recon' }],
      kind: { zh: '近戰隊', en: 'Melee' },
      oneBox: { zh: '能', en: 'Yes' },
      buyable: { zh: '能：可以買大桌盒', en: 'Yes — as the Warhammer 40,000 box' },
      size: { zh: '10 名特工', en: '10 operatives' },
      note: { zh: '2025 年已退出賽季：官方比賽不能使用，一般對戰或非官方比賽仍可使用。', en: 'Rotated out of the season in 2025: not allowed in official events, still fine for casual and unofficial games.' },
    },
    actsOfFaith: true,
    rule: {
      name: { zh: '信仰行為', en: 'Acts of Faith' },
      desc: {
        zh: '每回合準備步驟獲得信仰點數（存活隊員一半，無條件進位）。友方射擊、近戰、反擊或被射擊的擲骰後，可花信仰點用一次信仰行為：引導（1 點，重擲一顆骰）、祝福（2 點，一顆普通成功當暴擊）、干預（3 點，一顆失敗當普通成功）。每次擲骰最多一次。',
        en: 'In each Ready step, gain Faith points equal to half your living operatives (rounding up). After rolling dice when a friendly shoots, fights, retaliates or is shot, spend Faith on one Act of Faith: Guidance (1: re-roll one die), Blessing (2: a normal success becomes critical), Intervention (3: a fail becomes a normal success). One per roll.',
      },
    },
    ploys: [
      { id: 'blessedRejuv', cp: 1, name: { zh: '神聖回春', en: 'Blessed Rejuvenation' },
        desc: { zh: '本回合每次為友方花信仰點，行動結束時它回復 D3 生命。', en: 'This TP, whenever you spend Faith on a friendly, it regains D3 wounds at the end of that action.' } },
      { id: 'ardentVengeance', cp: 1, name: { zh: '熱忱復仇', en: 'Ardent Vengeance' },
        desc: { zh: '本回合攻擊已行動過的敵人時，武器「懲罰」。', en: 'This TP, weapons have Punishing against an expended enemy.' } },
      { id: 'defendersFaith', cp: 1, name: { zh: '信仰守護者', en: 'Defenders of the Faith' },
        desc: { zh: '本回合在爭奪目標點的友方被攻擊時，一顆普通成功的傷害減半（無條件進位，最少 2）。', en: 'This TP, a friendly contesting an objective halves the damage of one normal success against it (rounding up, min 2).' } },
      { id: 'righteousAdvance', cp: 1, notTP1: true, name: { zh: '正義推進', en: 'Righteous Advance' },
        desc: { zh: '最多三分之一的友方（無條件捨去，至少 1 名）各免費衝刺一次，結束時要更接近最近的敵人、最近的目標點或對手的部署區。第一回合不能用。', en: 'Up to a third of your operatives (rounding down, at least 1) make a free Dash each, ending closer to their closest enemy, closest objective marker or the opponent\'s drop zone. Not in the first turning point.' } },
    ],
    // The Superior and nine picks, one per copy (each once except Militants, up to two Purgatus).
    perCopyRoster: true,
    replacements: Object.fromEntries(['nvCondemnor', 'nvDialogus', 'nvDuellist', 'nvExactor', 'nvHospitaller', 'nvPenitent', 'nvPreceptor', 'nvPurgatus', 'nvReliquarius'].map((s) => [s, NV_PICKS])),
    ops: [
      op('nvSuperior', '修女長', 'Novitiate Superior', { apl: 3, move: 6, save: 3, wounds: 9, base: 32, inspirational: true, loadouts: nvSupLoadouts }, nvSupLoadouts.plasma),
      op('nvCondemnor', '譴責者', 'Novitiate Condemnor', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, nullRodAura: true }, [stakethrower, nullRod]),
      op('nvDialogus', '宣講者', 'Novitiate Dialogus', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, broadcaster: true, rhetoric: true }, [autopistol, dialogusStave]),
      op('nvDuellist', '決鬥者', 'Novitiate Duellist', { apl: 2, move: 6, save: 4, wounds: 7, base: 28 }, [autopistol, duellingBlades]),
      op('nvExactor', '鞭策者', 'Novitiate Exactor', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, whipFrenzy: true }, [neuralWhipsR, neuralWhipsM]),
      op('nvHospitaller', '醫護修女', 'Novitiate Hospitaller', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, medic: true, medikit: true }, [autopistol, surgicalSaw]),
      op('nvPenitent', '懺悔者', 'Novitiate Penitent', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, absolution: true }, [autopistol, eviscerator]),
      op('nvPreceptor', '訓誡者', 'Novitiate Preceptor', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, hymnal: true, unflinching: true }, [maceRighteous]),
      op('nvPurgatus', '淨化者', 'Novitiate Purgatus', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, purgeFlame: true }, [ministorumFlamer, gunButt]),
      op('nvReliquarius', '聖物守護者', 'Novitiate Reliquarius', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, iconBearer: true, raiseIcon: true }, [autopistol, gunButt]),
      op('nvPronatus', '尋聖者', 'Novitiate Pronatus', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, relicSeeker: true, divineAcq: true }, [autopistol, gunButt], 0),
      op('nvMilitantB', '武裝修女（刃）', 'Novitiate Militant (blade)', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, militantFaith: true, nvMilitant: true }, [autopistol, novitiateBlade], 0),
      op('nvMilitantG', '武裝修女（自動步槍）', 'Novitiate Militant (autogun)', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, militantFaith: true, nvMilitant: true }, [autogunN, gunButt], 0),
    ],
  },
  {
    id: 'battleclade',
    name: { zh: '戰鬥支隊', en: 'Battleclade' },
    color: '#8f3b2a',
    style: { zh: '射擊隊・機械教僕從・聖靈網路', en: 'Shooting · Mechanicus servitors · Noospheric Network' },
    blurb: {
      zh: '兩名技術神甫帶著一群僕從機：槍砲與戰鬥僕從負責火力，聖靈網路讓僕從在別人的回合之間插入行動，靈活調度。',
      en: 'Two Tech-Priests leading a pack of servitors: gun and combat servitors bring the firepower, and the Noospheric Network lets servitors act between activations.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '滲透', en: 'Infiltration' }, { zh: '偵察', en: 'Recon' }],
      kind: { zh: '射擊隊', en: 'Shooting' },
      oneBox: { zh: '能', en: 'Yes' },
      buyable: { zh: '能', en: 'Yes' },
      size: { zh: '10 名特工', en: '10 operatives' },
    },
    noosphericNetwork: true,
    rule: {
      name: { zh: '聖靈網路', en: 'Noospheric Network' },
      desc: {
        zh: '僕從機每次啟動可花 1AP「轉移能量」：這次啟動結束後，可讓另一個僕從機「網路反應」——先選指令，再免費做一個 1AP 動作（最多移動 2"），然後才輪到對手。網路反應不需要已行動或交戰指令；還沒行動的僕從之後照樣能正常啟動。每個僕從每回合只能網路反應一次，APL 低於 2 的不能轉移或反擊。',
        en: 'Once per servitor activation, spend 1AP to TRANSFER POWER: after that activation, another servitor can NETWORK COUNTERACT — choose its order, then a free 1AP action (moving no more than 2") — before your opponent activates. It doesn\'t need to be expended or on Engage, and if it was ready it can still activate later. Once per TP per servitor; not with APL below 2.',
      },
    },
    ploys: [
      { id: 'dutyReclamation', cp: 1, name: { zh: '回收使命', en: 'Duty of Reclamation' },
        desc: { zh: '本回合為爭奪目標點的友方擲骰時，每次行動可 0CP 使用一次指揮重擲。', en: 'This TP, once per action you can Command Re-roll for 0CP a die rolled for a friendly contesting an objective marker.' } },
      { id: 'ironSoul', cp: 1, name: { zh: '鋼鐵之魂頌唱', en: 'Incantation of the Iron Soul' },
        desc: { zh: '本回合友方受到 3 以上的傷害時擲 D6：4+ 傷害 -1。', en: 'This TP, whenever an attack die inflicts 3+ damage on a friendly, roll a D6: on a 4+, 1 less.' } },
      { id: 'noosphericPossession', cp: 1, name: { zh: '聖靈附身', en: 'Noospheric Possession' },
        desc: { zh: '本回合在自動代理或僕從監督者 6" 內的僕從機，武器「精準 1」。', en: 'This TP, servitors within 6" of an Auto-proxy or the Servitor Underseer have Accurate 1.' } },
      { id: 'prioritisedAcq', cp: 1, name: { zh: '優先取得', en: 'Prioritised Acquisition' },
        desc: { zh: '本回合選一個目標點：爭奪它時我方 APL 總和 +1；它 3" 內的友方近戰 Atk +1（最多 4）。', en: 'This TP, pick an objective marker: +1 to your total APL contesting it, and friendlies within 3" of it have +1 melee Atk (max 4).' } },
    ],
    // The two Tech-Priests and eight picks, one per copy (each once except Combat Servitors: one meltagun, up to three incendine igniters).
    perCopyRoster: true,
    replacements: Object.fromEntries(BC_PICKS.map((s) => [s, BC_PICKS])),
    ops: [
      op('bcArcheo', '技術考古學家', 'Technoarcheologist', { apl: 3, move: 6, save: 3, wounds: 9, base: 32, techPriest: true, omniscanner: true }, [eradPistol, servoArcClaw]),
      op('bcUnderseer', '僕從監督者', 'Servitor Underseer', { apl: 3, move: 6, save: 3, wounds: 9, base: 32, techPriest: true, underseer: true, datacoronal: true, networkOverride: true }, [radiumPistolMC, dataspikes]),
      op('bcProxy', '自動代理僕從', 'Auto-proxy Servitor', { apl: 2, move: 5, save: 4, wounds: 8, base: 25, servitor: true, autoProxy: true, achillanEye: true, support: 'spot', spotAll: true }, [taserGoadBC]),
      op('bcBreacher', '破障僕從', 'Breacher Servitor', { apl: 2, move: 5, save: 4, wounds: 8, base: 25, servitor: true }, [lascutterClose, lascutterShort, pincer]),
      op('bcMedic', '技術醫療僕從', 'Technomedic Servitor', { apl: 2, move: 5, save: 4, wounds: 8, base: 25, servitor: true, medic: true, medicNoApl: true, medikit: true, medikitBig: true }, [chirurgicClaw]),
      op('bcGunBolter', '槍砲僕從（重爆彈槍）', 'Gun Servitor (heavy bolter)', { apl: 2, move: 5, save: 4, wounds: 11, base: 32, servitor: true }, [hbFocusedBC, hbSweepingBC, augmeticClaw]),
      op('bcGunArc', '槍砲僕從（重電弧步槍）', 'Gun Servitor (heavy arc rifle)', { apl: 2, move: 5, save: 4, wounds: 11, base: 32, servitor: true }, [heavyArcRifle, augmeticClaw]),
      op('bcMelta', '戰鬥僕從（熱熔槍）', 'Combat Servitor (meltagun)', { apl: 2, move: 5, save: 4, wounds: 8, base: 25, servitor: true }, [meltaBC, servoClaw]),
      op('bcIgniter', '戰鬥僕從（焚燒器）', 'Combat Servitor (incendine igniter)', { apl: 2, move: 5, save: 4, wounds: 8, base: 25, servitor: true }, [igniter, servoClaw]),
      op('bcPhosphor', '戰鬥僕從（磷光爆能槍）', 'Combat Servitor (phosphor blaster)', { apl: 2, move: 5, save: 4, wounds: 8, base: 25, servitor: true }, [phosphorBlaster, servoClaw]),
    ],
  },
  {
    id: 'exoditeDragonMasters',
    name: { zh: '流亡馭龍師', en: 'Exodite Dragon Masters' },
    color: '#4f9a3c',
    style: { zh: '混合隊・騎乘・速度', en: 'Mixed · Mounted · Speed' },
    blurb: {
      zh: '三名騎著龍駒的流亡靈族（氏族之刃、地脈潛行者、詠石者）帶著兩隻小龍。騎乘者有朝向，只能直線衝刺、轉向；每回合啟動兩次，跑越快越難被打中。',
      en: 'Three Exodites riding drakesteeds (Clanblade, Leystalker, Stonesinger) with two Drakolithes. Riders have a facing and move only by Sprinting straight or Turning; they activate twice a turning point, and the faster they go the harder they are to hit.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '搜索與摧毀', en: 'Seek & Destroy' }, { zh: '偵察', en: 'Recon' }],
      kind: { zh: '混合隊', en: 'Mixed' },
      oneBox: { zh: '能', en: 'Yes' },
      buyable: { zh: '能', en: 'Yes' },
      size: { zh: '5 名特工', en: '5 operatives' },
    },
    dragonMasters: true,
    rule: {
      name: { zh: '騎龍戰術與水銀般的速度', en: 'Draconic Cavalry & Mercurial Speed' },
      desc: {
        zh: '只有小龍先部署，騎乘者在第 1 回合啟動時從己方場邊進場（算一次轉向）。騎乘者不能轉移、衝刺、衝鋒、撤退，改用「疾馳」（0AP：直線向前最多 9"、向後最多 3"，可在起點轉 45°，每回合最多 12"，以整吋計；可穿過特工與矮地形，經過的裝備掩體會被移除）與「轉向」（1AP：轉 45°）。每回合啟動兩次（每次最多 3AP，合計不超過 APL）；不能從輕型地形得到掩護。速度：疾馳向前 4" 以上為 4+、7" 以上為 7+，否則 3-；被射擊時 4+ 自動保留一顆普通豁免，7+ 則保留一顆暴擊豁免。',
        en: 'Only the Drakolithes deploy; the riders enter from your killzone edge when activated in TP1 (as a Turn). Riders can\'t Reposition, Dash, Charge or Fall Back; they Sprint (0AP: straight forwards up to 9" or backwards up to 3", pivoting up to 45° at the start; 12" per TP; whole inches; through operatives and low terrain, removing equipment terrain it crosses) and Turn (1AP: pivot 45°). They activate twice a TP (3AP each, the APL in total) and get no cover from Light terrain. SPEED: a Sprint forwards of 4"+ gives SPEED 4+, 7"+ SPEED 7+, else 3-; when shot, 4+ retains one defence die as a normal save, 7+ as a critical.',
      },
    },
    ploys: [
      { id: 'draconicFury', cp: 1, name: { zh: '龍之怒', en: 'Draconic Fury' },
        desc: { zh: '本回合友方近戰：速度 4+ 時近戰武器「平衡」，7+ 時「無休」。', en: 'This TP, a friendly fighting has Balanced melee weapons with SPEED 4+, Ceaseless with SPEED 7+.' } },
      { id: 'sinuousFlux', cp: 1, name: { zh: '蜿蜒流動', en: 'Sinuous Flux' },
        desc: { zh: '本回合敵人在 6" 外射擊速度 4+ 以上的友方時，不能重擲攻擊骰。', en: 'This TP, an enemy shooting a friendly with SPEED 4+ from more than 6" away can\'t re-roll its attack dice.' } },
      { id: 'windSwift', cp: 1, name: { zh: '風馳精準', en: 'Wind-Swift Precision' },
        desc: { zh: '本回合速度 4+ 以上的友方射擊時，遠程武器「平衡」。', en: 'This TP, a friendly with SPEED 4+ has Balanced ranged weapons.' } },
      { id: 'rideThemDown', cp: 1, name: { zh: '輾壓他們', en: 'Ride Them Down' },
        desc: { zh: '本回合騎乘者每次啟動一次，疾馳結束時：移動 4" 以上可對控制範圍內一名敵人造成 1 傷害；7" 以上或氏族之刃改為 D3。', en: 'This TP, once per rider activation, ending a Sprint: 4"+ moved — 1 damage to an enemy in its control range; 7"+ or a Clanblade — D3.' } },
    ],
    ops: [
      op('edClanblade', '氏族之刃', 'Dragon Master Clanblade', { apl: 4, move: 12, save: 3, wounds: 24, base: 58, oval: [75, 42], mounted: true, upgrades: 'clanblade', scaleshield: true, edLeader: true,
        ...edPairs('clanblade', [edCarbine, edFangs, edMoonblades]) }, [edCarbine, edFangs, edMoonblades]),
      op('edLeystalker', '地脈潛行者', 'Dragon Master Leystalker', { apl: 4, move: 12, save: 3, wounds: 24, base: 58, oval: [75, 42], mounted: true, upgrades: 'leystalker', implacable: true,
        ...edPairs('leystalker', [edRifleMob, edRifleStat, edFangs, edHuntBlade]) }, [edRifleMob, edRifleStat, edFangs, edHuntBlade]),
      op('edStonesinger', '詠石者', 'Dragon Master Stonesinger', { apl: 4, move: 12, save: 3, wounds: 24, base: 58, oval: [75, 42], mounted: true, upgrades: 'stonesinger', psyker: true, songRenewal: true,
        ...edPairs('stonesinger', [edCarbine, edVenom, edFangs, edStave], { earthen: [edEarthen] }) }, [edCarbine, edVenom, edFangs, edStave]),
      op('edDrakolithe', '小龍', 'Drakolithe', { apl: 2, move: 8, save: 5, wounds: 7, base: 32, drakolithe: true,
        actionsOnly: ['reposition', 'dash', 'charge', 'fallBack', 'fight', 'pickUp'] }, [edDrakeFangs], 2),
    ],
  },
  {
    id: 'goremongers',
    name: { zh: '灑血狂', en: 'Goremongers' },
    color: '#a3201b',
    style: { zh: '近戰隊・精英・血槽', en: 'Melee · Elite · Gore Tanks' },
    blurb: {
      zh: '崇拜恐虐的人類狂信徒：一名血之先驅帶領七名專家。背上的血槽靠殺戮補充，消耗血槽就能發動「血之精華」——多一個行動、連續近戰、回血、衝鋒輾傷敵人。',
      en: 'Human devotees of Khorne: a Blood Herald leading seven specialists. The gore tanks on their backs are refilled by killing, and spent to use SANGUAVITAE — an extra action, a second Fight, healing, or raking an enemy on the Charge.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '搜索與摧毀', en: 'Seek & Destroy' }, { zh: '偵察', en: 'Recon' }],
      kind: { zh: '近戰隊', en: 'Melee' },
      oneBox: { zh: '能', en: 'Yes' },
      buyable: { zh: '能', en: 'Yes' },
      size: { zh: '8 名特工', en: '8 operatives' },
    },
    goreTanks: true,
    perCopyRoster: true,
    rule: {
      name: { zh: '血槽、血之精華與恐虐符文', en: 'Gore Tanks, Sanguavitae & Runes of Khorne' },
      desc: {
        zh: '每名友方都有血槽，分為空、半、滿三格，開場是半。使控制範圍內、或 2" 內看得到的敵人殘廢時血槽 +1。消耗一格血槽可以發動一種「血之精華」（同一種每次啟動一次、每次啟動最多兩種，狂躁與狂怒不能同時用）：狂躁（APL +1 到下次啟動）、狂怒（本次可以近戰兩次，第二次免費）、再生（回復 D3+1）、狂暴（下一次近戰的近戰武器 Atk +1）、撕扯（下一次衝鋒移動完後對控制範圍內一名敵人造成 D3）、湧動（下一次衝鋒或移動 Move +1"）。恐虐符文：每次射擊動作，友方最多失去 8 生命。',
        en: 'Each friendly has a GORE TANK — empty, half or full; it starts at half. Incapacitating an enemy within its control range, or visible within 2", increases it. Decrease it to use a SANGUAVITAE (each once per activation, two at most per activation, not Mania and Fury together): Mania (+1 APL until its next activation), Fury (two Fights this activation, the second free), Rejuvenate (regain D3+1), Rage (its next Fight: +1 Atk on melee weapons), Rake (its next Charge: D3 to an enemy in control range when it finishes moving), Surge (its next Charge or Reposition: +1" Move). Runes of Khorne: a friendly can\'t lose more than 8 wounds per Shoot action.',
      },
    },
    ploys: [
      { id: 'goryTenacity', cp: 1, name: { zh: '血腥韌性', en: 'Gory Tenacity' },
        desc: { zh: '本回合友方近戰或反擊時，對手第一次打擊它的傷害減半（無條件進位，最低 2）。', en: 'This TP, a friendly fighting or retaliating halves the damage of the opponent\'s first strike on it (rounding up, minimum 2).' } },
      { id: 'huntForBlood', cp: 1, name: { zh: '血之狩獵', en: 'Hunt for Blood' },
        desc: { zh: '選一名友方（自動：能衝到敵人身邊、離敵人最近的一名）：隱蔽改成交戰，立刻免費衝鋒最多 3"。', en: 'Pick a friendly: if Concealed it becomes Engaged, then it immediately makes a free Charge of up to 3".' } },
      { id: 'enhancedViolence', cp: 1, name: { zh: '強化暴力', en: 'Enhanced Violence' },
        desc: { zh: '本回合友方血槽半格時近戰武器「平衡」，滿格時「毫不留情」。', en: 'This TP, a friendly\'s melee weapons have Balanced with a half GORE TANK, Relentless with a full one.' } },
      { id: 'augmentedEndurance', cp: 1, name: { zh: '強化耐力', en: 'Augmented Endurance' },
        desc: { zh: '本回合友方被射擊時，血槽半格可重擲一顆防禦骰，滿格可重擲任意防禦骰。', en: 'This TP, a friendly being shot re-rolls one defence die with a half GORE TANK, any with a full one.' } },
    ],
    // Seven from the list: each once, except Aspirants.
    replacements: Object.fromEntries(['gmAspirant', 'gmBloodtaker', 'gmImpaler', 'gmInciter', 'gmSkullclaimer', 'gmStalker']
      .map((id, _, all) => [id, [id, ...all.filter((x) => x !== id)]])),
    ops: [
      op('gmHerald', '血之先驅', 'Goremonger Blood Herald', { apl: 2, move: 7, save: 5, wounds: 11, base: 32, gmLeader: true, khornesFavour: true, apotheosis: true }, [gmIcon, gmChainblade]),
      op('gmAspirant', '血之求道者', 'Goremonger Aspirant', { apl: 2, move: 7, save: 5, wounds: 10, base: 32, obsessiveBloodlust: true }, [gmAutopistol, gmChainglaive], 2),
      op('gmBloodtaker', '取血者', 'Goremonger Bloodtaker', { apl: 2, move: 7, save: 5, wounds: 10, base: 32, transfusion: true }, [gmAutopistol, gmRitual]),
      op('gmImpaler', '穿刺者', 'Goremonger Impaler', { apl: 2, move: 7, save: 5, wounds: 10, base: 32, goreFuel: true }, [gmAutopistol, gmSkewerR, gmSkewerS]),
      op('gmInciter', '煽動者', 'Goremonger Inciter', { apl: 2, move: 7, save: 5, wounds: 10, base: 32, inciteHunt: true, dashSpray: true }, [gmDualF, gmDualP]),
      op('gmSkullclaimer', '奪顱者', 'Goremonger Skullclaimer', { apl: 2, move: 7, save: 5, wounds: 10, base: 32, brutish: true, claimSkull: true }, [gmAutopistol, gmChainaxe]),
      op('gmStalker', '潛獵者', 'Goremonger Stalker', { apl: 2, move: 7, save: 5, wounds: 10, base: 32, rooftopStalker: true }, [gmAutopistol, gmPickrippers]),
    ],
  },
  {
    id: 'hernkynYaegirs',
    name: { zh: '遠行者獵手', en: 'Hernkyn Yaegirs' },
    color: '#b8742a',
    style: { zh: '混合隊・資源點・地雷區', en: 'Mixed · Resourceful · Minefield' },
    blurb: {
      zh: '沃坦聯盟的拓荒偵察兵：一名領主帶領九名獵手。每回合依還沒被纏住的人數獲得資源點，可以拿來多一個行動或回血；工兵事先在戰場埋下真假混雜的地雷。',
      en: 'Frontier scouts of the Leagues of Votann: a Theyn leading nine Yaegirs. Each turning point they gain Resourceful points by how many are free of the enemy, spent for an extra action or to heal; their Ironbraek sows a minefield of live and dummy mines.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '搜索與摧毀', en: 'Seek & Destroy' }, { zh: '滲透', en: 'Infiltration' }],
      kind: { zh: '混合隊', en: 'Mixed' },
      oneBox: { zh: '能，但建議磁化', en: 'Yes, but magnetising is recommended' },
      buyable: { zh: '能', en: 'Yes' },
      size: { zh: '10 名特工', en: '10 operatives' },
    },
    yaegirs: true,
    perCopyRoster: true,
    rule: {
      name: { zh: '資源點與無畏探險者', en: 'Resourceful & Dauntless Explorers' },
      desc: {
        zh: '第 2 回合起的準備步驟，依沒在敵人控制範圍內的友方人數獲得資源點：5 名以上 2 點、3–4 名 1 點（回合結束時清空）。每名友方每次啟動可以用 1 點：不在交戰中時本次啟動 APL +1，或在啟動時（不在交戰中）回復 D3+1。無畏探險者：第 1 回合策略階段，完全在部署區內的友方各自免費移動一次（自動朝最近的目標點），結束時要完全在部署區 4" 內。',
        en: 'In the Ready step of each Strategy phase after the first, gain Resourceful points by friendlies not within enemy control range: 5+ = 2, 3–4 = 1 (discarded at the end of the TP). Each friendly can spend 1 per activation: +1 APL for the activation (not engaged), or regain D3+1 when activated (not engaged). Dauntless Explorers: in the first Strategy phase each friendly wholly within your drop zone makes a free Reposition (automatically towards the nearest objective), ending wholly within 4" of the drop zone.',
      },
    },
    ploys: [
      { id: 'masterfulBladework', cp: 1, name: { zh: '精湛刀術', en: 'Masterful Bladework' },
        desc: { zh: '本回合友方近戰（或隱蔽指令時反擊）：近戰武器 Atk +1（最多 4）並「平衡」；已有平衡改為「無休」。', en: 'This TP, a friendly fighting (or retaliating with a Conceal order): +1 Atk on melee weapons (max 4) and Balanced; Ceaseless instead if it already has Balanced.' } },
      { id: 'toughSurvivalists', cp: 1, name: { zh: '堅韌的求生者', en: 'Tough Survivalists' },
        desc: { zh: '本回合每名友方第一次被攻擊骰造成傷害時，傷害減半（無條件進位，最低 2）。', en: 'This TP, the first time an attack die inflicts damage on each friendly, halve it (rounding up, minimum 2).' } },
      { id: 'hiddenEngagement', cp: 1, name: { zh: '暗中交戰', en: 'Hidden Engagement' },
        desc: { zh: '本回合友方射擊時，若從目標的角度它在掩體中，武器「平衡」。', en: 'This TP, a friendly shooting from cover (from the target\'s point of view) has Balanced.' } },
      { id: 'inPosition', cp: 1, name: { zh: '就定位', en: 'In Position' },
        desc: { zh: '本回合隱蔽指令且在掩體中的友方不能被選為目標，搜尋等規則也無效（2" 內除外）。', en: 'This TP, a Concealed friendly in cover can\'t be selected as a valid target, whatever else applies (Seek etc.), except within 2".' } },
    ],
    // Nine from the list: each once, except Warriors.
    replacements: Object.fromEntries(['hyBladekyn', 'hyBombast', 'hyGunner', 'hyIronbraek', 'hyRiflekyn', 'hyTracker', 'hyWarrior']
      .map((id, _, all) => [id, [id, ...all.filter((x) => x !== id)]])),
    ops: [
      op('hyTheyn', '獵手領主', 'Yaegir Theyn', { apl: 2, move: 5, save: 4, wounds: 9, base: 28, hyLeader: true, veteranAdventurer: true, outrightConviction: true,
        loadouts: { revolver: [hyRevolverT, hyKnifeT], shotgun: [hyShotgunST, hyShotgunLT, hyKnifeT] } }, [hyRevolverT, hyKnifeT]),
      op('hyBladekyn', '刃族', 'Yaegir Bladekyn', { apl: 2, move: 5, save: 4, wounds: 8, base: 28, concealCharge: true, irrepressible: true }, [hyThrowKnife, hyDualKnives]),
      op('hyBombast', '轟炸手', 'Yaegir Bombast', { apl: 2, move: 5, save: 4, wounds: 8, base: 28, negotiation: true, brazenKiller: true }, [hyWroughtlock, hyFists]),
      op('hyGunner', '槍手', 'Yaegir Gunner', { apl: 2, move: 5, save: 4, wounds: 8, base: 28, bipod: true }, [hyApmAP, hyApmBreach, hyApmHE, hyFists]),
      op('hyIronbraek', '鐵壁工兵', 'Yaegir Ironbraek', { apl: 2, move: 5, save: 4, wounds: 8, base: 28, minefield: true }, [hyRevolver, hyEntrencher]),
      op('hyRiflekyn', '步槍族', 'Yaegir Riflekyn', { apl: 2, move: 5, save: 4, wounds: 8, base: 28, weavewerke: true }, [hyCoilConc, hyCoilMob, hyCoilStat, hyFists]),
      op('hyTracker', '追蹤者', 'Yaegir Tracker', { apl: 2, move: 5, save: 4, wounds: 8, base: 28, panVisor: true, hyTracker: true }, [hyHandbow, hyThrowHatchet, hyHatchet]),
      op('hyWarrior', '獵手戰士', 'Yaegir Warrior', { apl: 2, move: 5, save: 4, wounds: 8, base: 28, intrepid: true,
        loadouts: { revolver: [hyRevolver, hyKnife], shotgun: [hyShotgunST, hyShotgunLT, hyFists] } }, [hyRevolver, hyKnife], 3),
    ],
  },
  {
    id: 'elucidianStarstriders',
    name: { zh: '行商浪人', en: 'Elucidian Starstriders' },
    color: '#3f7fbf',
    style: { zh: '射擊隊・固定名單・艦砲支援', en: 'Shooting · Fixed roster · Orbital support' },
    blurb: {
      zh: '行商浪人艾露西亞・范恩與她的船員：獵犬、死亡教派刺客、電能大師、回春醫師、艦隊長與四名水手。頭頂上的「新曙光號」能提供艦砲火力支援。',
      en: 'Rogue Trader Elucia Vhane and her crew: a Canid, a Death Cult Executioner, a Lectro-Maester, a Rejuvenat Adept, a Voidmaster and four Voidsmen. Her ship, the New Dawn, rains fire from orbit.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '偵察', en: 'Recon' }, { zh: '安全保護', en: 'Security' }],
      kind: { zh: '射擊隊', en: 'Shooting' },
      oneBox: { zh: '能', en: 'Yes' },
      buyable: { zh: '能，但是官方限定品', en: 'Yes, but it\'s a limited release' },
      size: { zh: '10 名特工', en: '10 operatives' },
    },
    starstriders: true,
    rule: {
      name: { zh: '貿易許可證與私掠支援', en: 'Warrant of Trade & Privateer Support' },
      desc: {
        zh: '貿易許可證（整場最多 4 次，每種一次）：協調（開局 +1CP，自動）、賄賂（輪到你啟動時可以跳過）。私掠支援：每個交戰階段一次，艦隊員或范恩射擊時可改用一種艦砲武器（每種整場一次）；2D 版沒有制高點，所以艦砲的目標沒有掩護豁免。（其他許可證效果未實作）',
        en: 'Warrant of Trade (up to 4 per battle, each once): Coordinate (+1CP at the start, automatic) and Bribe (skip one of your activations). Privateer Support: once per Firefight phase, a Navis operative or Vhane can shoot with one of the New Dawn\'s batteries (each once per battle); there is no Vantage terrain in 2D, so their targets get no cover saves. (The other Warrants aren\'t modelled.)',
      },
    },
    ploys: [
      { id: 'lethalProximity', cp: 1, name: { zh: '致命近距', en: 'Lethal Proximity' },
        desc: { zh: '本回合友方射擊 6" 內的目標時，遠程武器「平衡」（艦砲除外）。', en: 'This TP, friendlies shooting a target within 6" have Balanced (not support assets).' } },
      { id: 'stakeClaimES', cp: 1, name: { zh: '宣示所有權', en: 'Stake Claim' },
        desc: { zh: '本回合在離我方最近的敵人處放所有權標記（自動）：友方攻擊它 3" 內的敵人時，一顆失敗當普通成功，或一顆普通成功當暴擊。', en: 'This TP, the Claim marker goes by the enemy nearest your team (automatic): attacking an enemy within 3" of it, retain one fail as a normal success, or a normal as a critical.' } },
      { id: 'undauntedExplorers', cp: 1, name: { zh: '無畏探險家', en: 'Undaunted Explorers' },
        desc: { zh: '本回合每名友方第一次被攻擊骰造成傷害時，傷害減半（進位，最少 2）。', en: 'This TP, the first time an attack die inflicts damage on each friendly, halve it (rounding up, minimum 2).' } },
      { id: 'quickMarch', cp: 1, name: { zh: '急行軍', en: 'Quick March' },
        desc: { zh: '本回合友方轉移時 Move +1"。（必須更接近敵方降落區的限制未實作）', en: 'This TP, friendlies Reposition with +1" Move. (The "must end closer to the enemy drop zone" limit isn\'t modelled.)' } },
    ],
    ops: [
      op('esVhane', '艾露西亞・范恩', 'Elucia Vhane', { apl: 3, move: 6, save: 4, wounds: 8, base: 25, esLeader: true, digitalLasers: true, merciless: true, ignorePiercing: true, reputation: true }, [esRelicPistol, esRapier]),
      op('esCanid', '獵犬', 'Canid', { apl: 2, move: 8, save: 5, wounds: 7, base: 25, badTempered: true, actionsOnly: ['reposition', 'dash', 'charge', 'fallBack', 'fight', 'pickUp'] }, [esBite]),
      op('esExecutioner', '死亡教派處刑者', 'Death Cult Executioner', { apl: 3, move: 6, save: 5, wounds: 8, base: 25, ignorePiercing: true, bladedStance: true, wretched: true, intoShadow: true }, [esDartmask, esPowerW]),
      op('esLectro', '電能大師', 'Lectro-Maester', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, acuteFocus: true, voltagheistArray: true, calibrate: true }, [esVoltaic, esGunButt]),
      op('esAdept', '回春醫師', 'Rejuvenat Adept', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, medic: true, medicWounds: 3, medicNoApl: true, disciplinarian: true, medikit: true, medikitBig: true }, [esLaspistol, esScalpel]),
      op('esVoidmaster', '艦隊長', 'Voidmaster', { apl: 2, move: 6, save: 5, wounds: 8, base: 25, navis: true, esDisciplinarian: true, weavefield: true }, [esShotgunClose, esShotgunLong, esRelicLas, esGunButt]),
      op('esVoidsman', '水手', 'Voidsman', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, navis: true }, [esLasgun, esGunButt], 3),
      op('esRotor', '水手（旋轉加農砲）', 'Voidsman (rotor cannon)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, navis: true }, [esRotorFocus, esRotorSweep, esGunButt]),
    ],
  },
  {
    id: 'chaosCult',
    name: { zh: '混沌邪教', en: 'Chaos Cult' },
    color: '#9b2c2c',
    style: { zh: '混合隊・人海・變異', en: 'Mixed · Horde · Mutation' },
    blurb: {
      zh: '黑暗聖會帶領一群信徒：煽動者、兩名聖刃、聖像持者、心靈巫婆與九名信徒。信徒會在戰鬥中變異成突變者，再變成被惡魔附身的折磨者。',
      en: 'A Dark Commune leading a throng of devotees: a Demagogue, two Blessed Blades, an Iconarch, a Mindwitch and nine Devotees. Devotees mutate into Mutants during the battle, and Mutants into daemon-bound Torments.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '搜索與摧毀', en: 'Seek & Destroy' }, { zh: '滲透', en: 'Infiltration' }],
      kind: { zh: '混合隊', en: 'Mixed' },
      oneBox: { zh: '否，需要三盒才能湊齊', en: 'No — you need three boxes' },
      buyable: { zh: '能，均屬大桌單位，另需購入 Accursed Cultists', en: 'Yes — all are main-game kits, plus a box of Accursed Cultists' },
      size: { zh: '14 名特工', en: '14 operatives' },
    },
    chaosCult: true,
    rule: {
      name: { zh: '變異與受詛恩賜', en: 'Mutation & Accursed Gifts' },
      desc: {
        zh: '策略階段可變異友方（第 1、2 回合各 2 名，第 3 回合 3 名，之後 4 名；自動挑選）；信徒在控制範圍內使敵人殘廢時也能變異。變異：信徒→突變者（最多 5 名）、突變者→折磨者（最多 3 名，每回合 2 次），或回復 D3+1。換型態時保留已失去的生命。第一次出現突變者時選主要恩賜，第一次出現折磨者時選次要恩賜（自動）：突變者有主要恩賜，折磨者兩個都有。',
        en: 'In the Strategy phase friendlies MUTATE (2 in TP1-2, 3 in TP3, 4 after; picked automatically); a Devotee that incapacitates an enemy in its control range can mutate too. Mutate: Devotee → Mutant (max 5), Mutant → Torment (max 3, twice per TP), or regain D3+1. Lost wounds carry over. The first Mutant picks the primary Accursed Gift, the first Torment the secondary (automatic): Mutants have the primary, Torments both.',
      },
    },
    ploys: [
      { id: 'exaltationPain', cp: 1, name: { zh: '狂喜於痛苦', en: 'Exaltation in Pain' },
        desc: { zh: '本回合友方武器的命中值不受重傷影響；受過傷的友方被射擊時可重擲一顆防禦骰。', en: 'This TP, friendlies ignore injured changes to their weapons\' Hit, and a wounded friendly that\'s shot re-rolls one defence die.' } },
      { id: 'ferventOnslaught', cp: 1, name: { zh: '狂熱猛攻', en: 'Fervent Onslaught' },
        desc: { zh: '本回合友方近戰武器「精準 1」，突變者與折磨者「精準 2」。', en: 'This TP, friendly melee weapons have Accurate 1 (Accurate 2 for Mutants and Torments).' } },
      { id: 'creaturesNightmare', cp: 1, name: { zh: '夢魘造物', en: 'Creatures of Nightmare' },
        desc: { zh: '本回合爭奪標記的敵人中有人在突變者或折磨者 2" 內時，敵方 APL 總和 -1。', en: 'This TP, enemies contesting a marker count 1 lower total APL if one is within 2" of a Mutant or Torment.' } },
      { id: 'sickeningAura', cp: 1, name: { zh: '令人作嘔的氣場', en: 'Sickening Aura' },
        desc: { zh: '本回合在突變者或折磨者 2" 內的敵人命中值變差 1（不與重傷疊加）。', en: 'This TP, enemies within 2" of a Mutant or Torment have worse Hit (not on top of injured).' } },
    ],
    ops: [
      op('ctDemagogue', '邪教煽動者', 'Cult Demagogue', { apl: 2, move: 6, save: 5, wounds: 8, base: 32, darkCommune: true, inciteSlaughter: true, inciteUrgency: true }, [ctStaveR, ctPistol, ctStaveM]),
      op('ctBlade', '聖刃', 'Blessed Blade', { apl: 2, move: 6, save: 5, wounds: 8, base: 28, darkCommune: true, cutThemDown: true, attuned: true }, [ctCommuneBlade], 2),
      op('ctIconarch', '聖像持者', 'Iconarch', { apl: 2, move: 6, save: 5, wounds: 8, base: 32, darkCommune: true, psyker: true, controlPlus: true, ruinousIcon: true }, [ctCenser, ctPistol, ctCrude3]),
      op('ctMindwitch', '心靈巫婆', 'Mindwitch', { apl: 2, move: 6, save: 5, wounds: 8, base: 32, darkCommune: true, psyker: true, heinousDeluge: true, maleficVortex: true }, [ctGaze, ctFists]),
      op('ctDevotee', '混沌信徒', 'Chaos Devotee', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, devotee: true, groupAct: 'ctDevotee' }, [ctPistol, ctCrude4], 9),
      op('ctMutant', '混沌突變者', 'Chaos Mutant', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, mutant: true, slowWitted: true, unnaturalRegen: true }, [ctAppendages], 0),
      op('ctTorment', '混沌折磨者', 'Chaos Torment', { apl: 2, move: 6, save: 5, wounds: 13, base: 40, torment: true, brute: true, unnaturalRegen: true,
        actionsOnly: ['reposition', 'dash', 'charge', 'fallBack', 'fight'] }, [ctMutations], 0),
    ],
  },
  {
    id: 'celestianInsidiants',
    name: { zh: '潔天使隱伏者', en: 'Celestian Insidiants' },
    color: '#c9a227',
    style: { zh: '近戰隊・精英・反靈能', en: 'Melee · Elite · Anti-psyker' },
    blurb: {
      zh: '修女會的獵巫老兵：一名隊長帶領八名專家。衝鋒或擊殺強敵後變得「激勵」（武器嚴厲）；激勵中的姊妹殘廢時，身邊的姊妹會獲得祝福。',
      en: 'Veteran witch hunters of the Adepta Sororitas: a Superior with eight specialists. Charging or felling a strong foe makes them INSPIRING (Severe weapons); when an inspiring sister is incapacitated, a nearby sister gains a Benediction.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '搜索與摧毀', en: 'Seek & Destroy' }, { zh: '安全保護', en: 'Security' }],
      kind: { zh: '近戰隊', en: 'Melee' },
      oneBox: { zh: '能，但建議買兩盒（普通特工很好用）', en: 'Yes, but two boxes are recommended (the Warriors are useful)' },
      buyable: { zh: '能', en: 'Yes' },
      size: { zh: '9 名特工', en: '9 operatives' },
    },
    insidiants: true,
    perCopyRoster: true,
    rule: {
      name: { zh: '激勵與殉道', en: 'Inspiration & Martyrdom' },
      desc: {
        zh: '友方衝鋒（移動前）或使生命 6 以上的敵人殘廢時變為「激勵」：資料卡上的武器「嚴厲」。激勵中的友方殘廢時，它看得到或 6" 內的另一名友方獲得一個祝福（自動挑選）：熱忱（整場 APL +1，隊長不行）、憤怒（整場武器「無休」）、復原（回復 D3+2）。（「緊急」祝福未實作）獵巫武器：3" 內的敵人不能做靈能動作或用靈能遠程武器，靈能遠程武器傷不了友方。',
        en: 'A friendly becomes INSPIRING when it Charges (before moving) or incapacitates an enemy with a Wounds stat of 6+: its datacard weapons have Severe. When an inspiring friendly is incapacitated, another friendly it\'s visible to or within 6" of gains a Benediction (picked automatically): Ardour (+1 APL for the battle, not the Superior), Wrath (Ceaseless for the battle) or Restoration (regain D3+2). (Exigence isn\'t modelled.) Weapons of the Witch Hunters: enemies within 3" can\'t perform Psychic actions or use Psychic ranged weapons, and Psychic ranged weapons can\'t damage friendlies.',
      },
    },
    ploys: [
      { id: 'sufferingSacrifice', cp: 1, name: { zh: '苦難與犧牲', en: 'Suffering & Sacrifice' },
        desc: { zh: '本回合受過傷的友方攻擊敵人時，武器「平衡」。', en: 'This TP, a wounded friendly attacking an enemy has Balanced.' } },
      { id: 'holyResilience', cp: 1, name: { zh: '神聖韌性', en: 'Holy Resilience' },
        desc: { zh: '本回合激勵中的友方近戰或反擊時，4 以上的普通與暴擊傷害 -1。', en: 'This TP, an inspiring friendly fighting or retaliating takes 1 less from Normal and Critical Dmg of 4+.' } },
      { id: 'suspectEliminate', cp: 1, name: { zh: '懷疑與剷除', en: 'Suspect & Eliminate' },
        desc: { zh: '本回合選一名敵人：它和 2" 內看得到的敵人得到懷疑標記，友方射擊或近戰它們時武器「懲罰」。', en: 'This TP, pick an enemy: it and enemies visible within 2" of it gain Suspicion tokens — friendlies shooting or fighting them have Punishing.' } },
      { id: 'wrathfulDetermination', cp: 1, name: { zh: '憤怒的決心', en: 'Wrathful Determination' },
        desc: { zh: '本回合交戰指令的友方被射擊時，可重擲一顆防禦骰。', en: 'This TP, an Engage-order friendly that\'s shot re-rolls one defence die.' } },
    ],
    // Eight from the list: each once, except Warriors and up to two Cremators.
    replacements: Object.fromEntries(['ciAbjuror', 'ciCensor', 'ciCremator', 'ciCremator2', 'ciDenuncia', 'ciMortis', 'ciReliq', 'ciWarrior']
      .map((id) => [id, [id, ...['ciAbjuror', 'ciCensor', 'ciCremator', 'ciDenuncia', 'ciMortis', 'ciReliq', 'ciWarrior'].filter((x) => x !== id)]])),
    ops: [
      op('ciSuperior', '隊長', 'Insidiant Superior', { apl: 3, move: 6, save: 3, wounds: 10, base: 32, ciLeader: true, spiritualMentor: true,
        loadouts: { relics: [ciRelicStake, ciRelicBolt, ciNullMace], inferno: [ciInferno, ciNullMace] } }, [ciRelicStake, ciRelicBolt, ciNullMace]),
      op('ciAbjuror', '護衛修女', 'Insidiant Abjuror', { apl: 2, move: 6, save: 2, wounds: 11, base: 32, holyDefender: true }, [ciSwordDef, ciSwordOff]),
      op('ciCensor', '審查修女', 'Insidiant Censor', { apl: 2, move: 6, save: 3, wounds: 9, base: 32, controlPlus: true, nullField: true }, [ciVirge]),
      op('ciCremator', '焚化修女', 'Insidiant Cremator', { apl: 2, move: 6, save: 3, wounds: 9, base: 32, pyre: true }, [ciHandFlamer, ciDeluge, ciNullMace]),
      op('ciCremator2', '焚化修女', 'Insidiant Cremator', { apl: 2, move: 6, save: 3, wounds: 9, base: 32, pyre: true }, [ciHandFlamer, ciDeluge, ciNullMace]),
      op('ciDenuncia', '譴責修女', 'Insidiant Denuncia', { apl: 2, move: 6, save: 3, wounds: 9, base: 32, speakDeeds: true, accusingExorcist: true }, [ciVoice, ciStaff]),
      op('ciMortis', '死亡聖者', 'Insidiant Mortisanctus', { apl: 2, move: 6, save: 3, wounds: 9, base: 32, bladedStance: true, ultimatum: true }, [ciBroadsword]),
      op('ciReliq', '聖物修女', 'Insidiant Reliquarius', { apl: 2, move: 6, save: 3, wounds: 9, base: 32, simulacrum: true, devotion: true }, [ciBoltPistol, ciStake, ciGunButt]),
      op('ciWarrior', '修女戰士', 'Insidiant Warrior', { apl: 2, move: 6, save: 3, wounds: 9, base: 32, inspiredStrikes: true }, [ciBoltPistol, ciStake, ciNullMace]),
    ],
  },
  {
    id: 'canoptekCircle',
    name: { zh: '冥工之環', en: 'Canoptek Circle' },
    color: '#2fb59a',
    style: { zh: '射擊隊・機械・節點矩陣', en: 'Shooting · Constructs · Node Matrix' },
    blurb: {
      zh: '一名地占術士帶領一群冥工機械：兩台墓穴爬行者、加速者、復甦者與三隻巨細胞戰士。三個方尖碑節點連成矩陣，矩陣內的友方武器精準、行動更多。',
      en: 'A Geomancer Cryptek with its Canoptek constructs: two Tomb Crawlers, an Accelerator, a Reanimator and three Macrocyte Warriors. Three obelisk nodes link into a matrix that sharpens and speeds up friendlies inside it.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '偵察', en: 'Recon' }, { zh: '安全保護', en: 'Security' }],
      kind: { zh: '射擊隊', en: 'Shooting' },
      oneBox: { zh: '能', en: 'Yes' },
      buyable: { zh: '能', en: 'Yes' },
      size: { zh: '5 名特工＋3 隻機械蟲', en: '5 operatives + 3 constructs' },
    },
    obeliskNodes: true,
    rule: {
      name: { zh: '方尖碑節點矩陣', en: 'Obelisk Node Matrix' },
      desc: {
        zh: '第 1 回合策略階段在己方領土放置 3 個方尖碑節點（自動），之後每回合可各移動最多 3"（自動朝目標點移動）。相距 6" 內的兩個節點之間連成 20mm 寬的矩陣。矩陣內的友方：資料卡上的武器「精準 1」、APL +1（最多 3）。節點會控制 1" 內沒有敵人爭奪的標記。',
        en: 'In the first Strategy phase three obelisk nodes are set up in your territory (automatic); later each can move up to 3" (automatically towards an objective). Nodes within 6" of each other link into a 20mm-wide matrix. Friendlies within it: datacard weapons have Accurate 1 and +1 APL (max 3). Nodes control markers within 1" that no enemy contests.',
      },
    },
    ploys: [
      { id: 'cryptogravitic', cp: 1, name: { zh: '低溫重力排斥', en: 'Cryptogravitic Repulsion' },
        desc: { zh: '本回合敵人每次移動第一次進入我方矩陣時，距離多算 1"。', en: 'This TP, the first time an enemy moves into your matrix in an action, that distance counts 1" more.' } },
      { id: 'souldrain', cp: 1, name: { zh: '靈魂汲取', en: 'Souldrain' },
        desc: { zh: '本回合在我方矩陣內的敵人、或近戰矩陣內友方的敵人，近戰武器兩項傷害 -1（最低 2）。', en: 'This TP, an enemy within your matrix, or fighting a friendly within it, has -1 to both melee Dmg (min 2).' } },
      { id: 'hypershielding', cp: 1, name: { zh: '超維護盾', en: 'Hypershielding' },
        desc: { zh: '本回合友方被射擊時，若矩陣擋在中間或友方在矩陣內，可重擲同一種點數的防禦骰。', en: 'This TP, a friendly shot with your matrix in the way or while within it re-rolls any defence dice of one result.' } },
      { id: 'transdynamic', cp: 1, name: { zh: '跨動態增幅', en: 'Transdynamic Amplification' },
        desc: { zh: '本回合友方射擊時，若矩陣擋在中間或目標在矩陣內，武器「無休」。', en: 'This TP, a friendly shooting with your matrix in the way, or at a target within it, has Ceaseless.' } },
    ],
    // Tomb Crawlers and Warriors pick weapons separately (one transdimensional isolator at most).
    replacements: { ccCrawler: ['ccCrawler', 'ccCrawlerIso'], ccWarrior: ['ccWarrior', 'ccWarriorTesla'] },
    perCopyRoster: true,
    ops: [
      op('ccGeomancer', '地占術士', 'Geomancer', { apl: 3, move: 6, save: 3, wounds: 14, base: 50, ccLeader: true, geomantic: true, canoptekControl: true, molecularBreach: true }, [ccPartMatter, ccQuake, ccSweep]),
      op('ccCrawler', '墓穴爬行者（高斯收割者）', 'Tomb Crawler (gauss reapers)', { apl: 2, move: 5, save: 3, wounds: 18, base: 50, canoptek: true, brute: true, control: 3, steadfast: true }, [ccReaperFocus, ccReaperSweep, ccCrawlerClaws], 2),
      op('ccAccel', '巨細胞加速者', 'Macrocyte Accelerator', { apl: 2, move: 7, save: 4, wounds: 7, base: 28, canoptek: true, overcharge: true, cranialOverload: true }, [ccSpark, ccClawsSpark]),
      op('ccReanim', '巨細胞復甦者', 'Macrocyte Reanimator', { apl: 2, move: 7, save: 4, wounds: 7, base: 28, canoptek: true, medic: true, medicRange: 6, matrixMedic: true, nanoscarab: true }, [ccAtomiser, ccClawsTailR]),
      op('ccWarrior', '巨細胞戰士（高斯手術刀）', 'Macrocyte Warrior (gauss scalpel)', { apl: 2, move: 7, save: 4, wounds: 7, base: 28, canoptek: true, expendable: true, aggressiveDefence: true, ccWarrior: true }, [ccScalpel, ccClawsTail], 3),
      op('ccCrawlerIso', '墓穴爬行者（隔離器）', 'Tomb Crawler (isolator)', { apl: 2, move: 5, save: 3, wounds: 18, base: 50, canoptek: true, brute: true, control: 3, steadfast: true }, [ccIsolator, ccCrawlerClaws], 0),
      op('ccWarriorTesla', '巨細胞戰士（特斯拉）', 'Macrocyte Warrior (tesla caster)', { apl: 2, move: 7, save: 4, wounds: 7, base: 28, canoptek: true, expendable: true, aggressiveDefence: true, ccWarrior: true }, [ccTeslaFocus, ccTeslaLightning, ccClawsTail], 0),
    ],
  },
  {
    id: 'broodBrothers',
    name: { zh: '族群裔兵', en: 'Brood Brothers' },
    color: '#7a5aa6',
    style: { zh: '射擊隊・人數多・交叉火力', en: 'Shooting · Horde · Crossfire' },
    blurb: {
      zh: '被基因竊取者教派感染的帝國士兵：一名指揮官帶領九名專家，還能找來族長、首領或巫師。被攻擊後活下來的敵人會得到交叉火力標記，之後攻擊它時可以拿來重擲。',
      en: 'Imperial soldiers infected by a Genestealer Cult: a Commander leading nine specialists, with a Patriarch, Primus or Magus on call. Enemies that survive an attack gain Crossfire tokens, spent later to re-roll attack dice against them.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '滲透', en: 'Infiltration' }, { zh: '安全保護', en: 'Security' }],
      kind: { zh: '射擊隊', en: 'Shooting' },
      oneBox: { zh: '否，需要多買一盒族群聖會（Broodcoven）', en: 'No — you also need a Broodcoven box' },
      buyable: { zh: '能', en: 'Yes' },
      size: { zh: '10 名特工（另有 3 個族群聖會名額）', en: '10 operatives (plus 3 Broodcoven selections)' },
    },
    broodBrothers: true,
    perCopyRoster: true,
    rule: {
      name: { zh: '交叉火力', en: 'Crossfire' },
      desc: {
        zh: '友方射擊或近戰敵人後，若敵人沒殘廢就得到一個交叉火力標記。之後友方射擊、近戰或反擊有標記的敵人時，每移除一個標記就能重擲一顆攻擊骰（自動用在失敗的骰子上）。',
        en: 'After a friendly shoots or fights an enemy, if it isn\'t incapacitated it gains a Crossfire token. Friendlies shooting, fighting or retaliating against it can remove its tokens to re-roll one attack die each (used on fails automatically).',
      },
    },
    ploys: [
      { id: 'embedded', cp: 1, name: { zh: '嵌入陣地', en: 'Embedded' },
        desc: { zh: '本回合敵人射擊友方時，若因重型地形能保留掩護豁免，可多保留一顆。', en: 'This TP, when an enemy shoots a friendly that can retain cover saves from Heavy terrain, it retains one more.' } },
      { id: 'cultDevotion', cp: 1, name: { zh: '教派奉獻', en: 'Cult Devotion' },
        desc: { zh: '本回合友方（族長除外）在近戰中殘廢時，若還有未結算的成功，擲 D6：達到命中值可再用一顆普通成功打擊（擲出暴擊時任一顆成功）。', en: 'This TP, when a friendly (not the Patriarch) is incapacitated in a fight with unresolved successes, roll a D6: if it would hit, strike with an unresolved normal success (any success on a crit).' } },
      { id: 'pervasive', cp: 1, name: { zh: '無所不在', en: 'Pervasive' },
        desc: { zh: '本回合友方攀爬時可忽略第一段 2" 垂直距離。（2D 版沒有攀爬，沒有效果）', en: 'This TP, friendlies ignore the first 2" of one climb. (No climbing in this 2D version: no effect.)' } },
      { id: 'uprising', cp: 1, name: { zh: '起義', en: 'Uprising' },
        desc: { zh: '本回合友方從隱蔽改為交戰後的第一次射擊或近戰：選定目標時目標就先得到一個交叉火力標記（啟動時在敵人控制範圍內則無效）。', en: 'This TP, a friendly\'s first Shoot or Fight after switching from Conceal to Engage gives the target a Crossfire token as soon as it\'s selected (not if it activated within an enemy\'s control range).' } },
    ],
    // Nine specialists (each picked on its own; each option once except Troopers, at most three Gunners/Sniper),
    // then three Broodcoven selections (packages).
    replacements: Object.fromEntries(['bbAgitator', 'bbGunFlamer', 'bbGunGL', 'bbGunPlasma', 'bbIconward', 'bbKnife', 'bbMedic', 'bbSapper', 'bbVox']
      .map((id) => [id, [id, ...['bbAgitator', 'bbGunFlamer', 'bbGunGL', 'bbGunMelta', 'bbGunPlasma', 'bbIconward', 'bbKnife', 'bbMedic', 'bbSapper', 'bbSniper', 'bbTrooper', 'bbVeteran', 'bbVox'].filter((x) => x !== id)]])),
    packages: {
      coven: {
        name: { zh: '族群聖會名額（3 個）', en: 'Broodcoven selections (3)' },
        options: {
          troopers: { name: { zh: '3 名兵員', en: '3 Troopers' }, ops: ['bbTrooper', 'bbTrooper', 'bbTrooper'] },
          magus: { name: { zh: '巫師＋1 名兵員', en: 'Magus + 1 Trooper' }, ops: ['bbMagus', 'bbTrooper'] },
          primus: { name: { zh: '首領＋1 名兵員', en: 'Primus + 1 Trooper' }, ops: ['bbPrimus', 'bbTrooper'] },
          patriarch: { name: { zh: '族長', en: 'Patriarch' }, ops: ['bbPatriarch'] },
          familiars: { name: { zh: '2 隻靈能使魔＋2 名兵員', en: '2 Psychic Familiars + 2 Troopers' }, ops: ['bbFamiliar', 'bbFamiliar', 'bbTrooper', 'bbTrooper'] },
          magusFam: { name: { zh: '巫師＋2 隻靈能使魔', en: 'Magus + 2 Psychic Familiars' }, ops: ['bbMagus', 'bbFamiliar', 'bbFamiliar'] },
          primusFam: { name: { zh: '首領＋2 隻靈能使魔', en: 'Primus + 2 Psychic Familiars' }, ops: ['bbPrimus', 'bbFamiliar', 'bbFamiliar'] },
          ploys: { name: { zh: '不帶特工：3 張族群裔兵計謀整場 0CP', en: 'No operatives: three Brood Brother ploys cost 0CP for the battle' }, ops: [], freePloys: 3 },
        },
      },
    },
    ops: [
      op('bbCommander', '指揮官', 'Commander', { apl: 2, move: 6, save: 5, wounds: 8, base: 25, bbLeader: true, coordinate: true,
        loadouts: { chain: [bbBoltPistol, bbChainClaw], autogun: [bbDrumAutogun, bbBayonetC], power: [bbLaspistolC, bbPowerClaw] } }, [bbBoltPistol, bbChainClaw]),
      op('bbAgitator', '煽動者', 'Agitator', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, devoted: true, psiren: true }, [bbShockMaul]),
      op('bbGunFlamer', '槍手（火焰噴射器）', 'Gunner (flamer)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [bbFlamer, bbBayonet]),
      op('bbGunGL', '槍手（榴彈發射器）', 'Gunner (grenade launcher)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [bbGLFrag, bbGLKrak, bbBayonet]),
      op('bbGunPlasma', '槍手（電漿槍）', 'Gunner (plasma gun)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [bbPlasmaStd, bbPlasmaSuper, bbBayonet]),
      op('bbIconward', '聖像守衛', 'Iconward', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, cultIcon: true }, [bbLargeKnife]),
      op('bbKnife', '刀鬥士', 'Knife Fighter', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, assassin: true, counterattack: true }, [bbPoisonKnives]),
      op('bbMedic', '醫護兵', 'Medic', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, medic: true, medikit: true }, [bbLasgun, bbBayonet, bbGeneNeedler]),
      op('bbSapper', '工兵', 'Sapper', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, grenadier: true, explosives: true, finalDefiance: true }, [bbDemoCharge, bbBayonet]),
      op('bbVox', '通訊兵', 'Vox-operator', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, signal: true, jam: true }, [bbLasgun, bbBayonet]),
      op('bbGunMelta', '槍手（熱熔槍）', 'Gunner (meltagun)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [bbMelta, bbBayonet], 0),
      op('bbSniper', '狙擊手', 'Sniper', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [bbSniperConc, bbSniperMobile, bbSniperStat, bbFists], 0),
      op('bbVeteran', '老兵', 'Veteran', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, tough: true, bodyguard: true }, [bbShotgunClose, bbShotgunLong, bbBayonetClaw], 0),
      op('bbTrooper', '兵員', 'Trooper', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, groupAct: 'bbTrooper' }, [bbLasgun, bbBayonet], 0),
      op('bbMagus', '巫師', 'Magus', { apl: 3, move: 6, save: 4, wounds: 9, base: 32, psyker: true, broodcoven: true, bbLeader: true, spiritualLeader: true, telepathicOverload: true, mentalOnslaught: true }, [bbAutopistol, bbBioDagger, bbForceStave], 0),
      op('bbPrimus', '首領', 'Primus', { apl: 3, move: 6, save: 4, wounds: 9, base: 32, broodcoven: true, bbLeader: true, fistPatriarch: true, conspire: true }, [bbNeedleShort, bbNeedleLong, bbBonesword], 0),
      op('bbPatriarch', '族長', 'Patriarch', { apl: 4, move: 6, save: 4, wounds: 21, base: 50, psyker: true, broodcoven: true, bbLeader: true, alphaPredator: true, brute: true, intoShadow: true }, [bbPatriarchClaws], 0),
      op('bbFamiliar', '靈能使魔', 'Psychic Familiar', { apl: 2, move: 6, save: 5, wounds: 3, base: 25, small: true, disengage: true, groupAct: 'bbFamiliar' }, [bbFamiliarClaws], 0),
    ],
  },
  {
    id: 'bladesOfKhaine',
    name: { zh: '凱恩之刃', en: 'Blades of Khaine' },
    color: '#2f8f5b',
    style: { zh: '近戰隊・精英・技法', en: 'Melee · Elite · Techniques' },
    blurb: {
      zh: '八名靈族方陣戰士：一名督軍帶領狂怒復仇者、嚎叫女妖與突擊天蠍。每個方陣都有專屬「技法」，每回合各能用一次。',
      en: 'Eight Aeldari Aspect Warriors: an Exarch leading Dire Avengers, Howling Banshees and Striking Scorpions. Each Aspect has its own Techniques, each usable once per turning point.',
    },
    // Collector notes supplied by the player.
    info: {
      archetypes: [{ zh: '搜索與摧毀', en: 'Seek & Destroy' }, { zh: '安全保護', en: 'Security' }, { zh: '偵察', en: 'Recon' }, { zh: '滲透', en: 'Infiltration' }],
      kind: { zh: '近戰隊', en: 'Melee' },
      oneBox: { zh: '否，需要另外兩盒才能湊齊', en: 'No — you need two more boxes' },
      buyable: { zh: '（未提供）', en: '(not given)' },
      size: { zh: '8 名特工', en: '8 operatives' },
    },
    bladesOfKhaine: true,
    perCopyRoster: true,
    rule: {
      name: { zh: '方陣技法', en: 'Aspect Techniques' },
      desc: {
        zh: '每種技法只能給同方陣（狂怒復仇者／嚎叫女妖／突擊天蠍）的友方使用，不花 CP；每次啟動或反應最多一種技法，每種技法每回合一次（全隊同一方陣時每回合兩次）。技法在交戰計謀的同一處選用。',
        en: 'Each Technique can only be used with a friendly of the matching Aspect (Dire Avenger / Howling Banshee / Striking Scorpion), for no CP; at most one per activation or counteraction, and each once per turning point (twice if the whole team shares one Aspect). They\'re picked where firefight ploys are.',
      },
    },
    ploys: [
      { id: 'forewarned', cp: 1, name: { zh: '預知', en: 'Forewarned' },
        desc: { zh: '本回合敵人射擊準備中的友方時，可重擲同一種點數的防禦骰（自動挑失敗最多的點數）。', en: 'This TP, when a ready friendly is shot, re-roll any defence dice showing one result (the most common failing result is picked).' } },
      { id: 'danceOfDeath', cp: 1, name: { zh: '死亡之舞', en: 'Dance of Death' },
        desc: { zh: '選兩名彼此可見且 6" 內的友方交換位置（自動：把近戰較強、離敵人較遠的那名換到前面）。', en: 'Swap two friendlies visible to and within 6" of each other (automatic: the better fighter that is further from the enemy moves forward).' } },
      { id: 'ruthlessPoise', cp: 1, name: { zh: '無情泰然', en: 'Ruthless Poise' },
        desc: { zh: '本回合友方近戰準備中的敵人時，近戰武器「無休」。', en: 'This TP, friendlies fighting a ready enemy have Ceaseless melee weapons.' } },
      { id: 'khainesVengeance', cp: 1, name: { zh: '凱恩之復仇', en: 'Khaine\'s Vengeance' },
        desc: { zh: '本回合友方射擊已行動的敵人時，遠程武器「無休」。', en: 'This TP, friendlies shooting an expended enemy have Ceaseless ranged weapons.' } },
    ],
    // One Exarch, then seven Aspect Warriors in any mix (each slot picked separately).
    replacements: {
      bkScEx: ['bkScEx', 'bkHbEx', 'bkAvEx'],
      bkScW: ['bkScW', 'bkHbW', 'bkAvW'], bkHbW: ['bkHbW', 'bkScW', 'bkAvW'], bkAvW: ['bkAvW', 'bkScW', 'bkHbW'],
    },
    ops: [
      op('bkScEx', '突擊天蠍督軍', 'Striking Scorpion Exarch', { apl: 3, move: 7, save: 3, wounds: 9, base: 28, aspect: 'ss', exarch: true, mandiblasters: true,
        loadouts: { biting: [bkPistol, bkBitingBlade], claw: [bkPistol, bkScorpClaw], twin: [bkTwinPistols, bkTwinChain] } }, [bkPistol, bkBitingBlade]),
      op('bkHbEx', '嚎叫女妖督軍', 'Howling Banshee Exarch', { apl: 3, move: 7, save: 3, wounds: 9, base: 28, aspect: 'hb', exarch: true, bansheeMask: true,
        loadouts: { mirror: [bkMirrorswords], executioner: [bkPistol, bkExecutioner], power: [bkPistol, bkPowerEx], triskele: [bkPistol, bkTriskThrow, bkTriskSlice], triskPower: [bkTriskThrow, bkTriskSlice, bkPowerEx] } }, [bkMirrorswords], 0),
      op('bkAvEx', '狂怒復仇者督軍', 'Dire Avenger Exarch', { apl: 3, move: 7, save: 3, wounds: 9, base: 28, aspect: 'da', exarch: true, defenceTactics: true, shimmershield: true,
        loadouts: { catapult: [bkCatapult, bkFists], twin: [bkTwinCatapult, bkGunButts], direPistol: [bkPistol, bkDiresword], direShield: [bkDiresword], powerPistol: [bkPistol, bkPowerEx], powerShield: [bkPowerEx] },
        loadoutExtra: { direShield: { zh: '微光盾', en: 'Shimmershield' }, powerShield: { zh: '微光盾', en: 'Shimmershield' } } }, [bkCatapult, bkFists], 0),
      op('bkScW', '突擊天蠍戰士', 'Striking Scorpion Warrior', { apl: 3, move: 7, save: 3, wounds: 8, base: 28, aspect: 'ss', mandiblasters: true }, [bkPistol, bkChainsword], 3),
      op('bkHbW', '嚎叫女妖戰士', 'Howling Banshee Warrior', { apl: 3, move: 7, save: 4, wounds: 8, base: 28, aspect: 'hb', bansheeMask: true }, [bkPistol, bkPowerW], 2),
      op('bkAvW', '狂怒復仇者戰士', 'Dire Avenger Warrior', { apl: 3, move: 7, save: 4, wounds: 8, base: 28, aspect: 'da', defenceTactics: true }, [bkCatapult, bkFists], 2),
    ],
  },
];

TEAMS.push(...ELDAR_TEAMS);
TEAMS.push(DEATHWATCH_TEAM);
TEAMS.push(MANDRAKES_TEAM);
TEAMS.push(MURDERWING_TEAM);
TEAMS.push(WRECKA_TEAM);
TEAMS.push(NIGHTLORDS_TEAM);
TEAMS.push(SCOUTS_TEAM);
TEAMS.push(RATLINGS_TEAM);
TEAMS.push(SANCTIFIERS_TEAM);
TEAMS.push(RAVENERS_TEAM);
TEAMS.push(SPECTRES_TEAM);
TEAMS.push(AQUILONS_TEAM);
TEAMS.push(VOIDDANCERS_TEAM);
TEAMS.push(VESPIDS_TEAM);
TEAMS.push(STEALTH_TEAM);
TEAMS.push(WOLF_TEAM);

// ---- Inquisitorial Agents ----
// (Requisitioned operatives from other kill teams are copies of their datacards: prefixed ids, the
// INQUISITORIAL AGENT faction, and only the faction rules the requisition card allows.)
const iaRelicPistol = W('iaRelicPistol', '加長槍托聖遺物自動手槍', 'Extended stock relic autopistol', 'ranged', 4, 3, 2, 4, { range: 12, lethal: 5 });
const iaFists = W('iaFists', '拳頭', 'Fists', 'melee', 3, 4, 2, 3);
const iaAppendages = W('iaAppendages', '機械附肢', 'Mechanical appendages', 'melee', 3, 5, 1, 2);
const iaAutopistol = W('iaAutopistol', '自動手槍', 'Autopistol', 'ranged', 4, 4, 2, 3, { range: 8 });
const iaEviscerator = W('iaEviscerator', '開膛鋸', 'Eviscerator', 'melee', 4, 4, 5, 6, { brutal: true });
const iaKnife = W('iaKnife', '刀', 'Knife', 'melee', 1, 2, 5, 7, { lethal: 5 });
const iaPolearm = W('iaPolearm', '長柄武器', 'Polearm', 'melee', 4, 3, 4, 5);
const iaPairedBlades = W('iaPairedBlades', '雙刃', 'Paired blades', 'melee', 4, 3, 3, 5, { balanced: true, rending: true });
const iaShotgun = W('iaShotgun', '霰彈槍', 'Shotgun', 'ranged', 4, 3, 3, 3, { range: 6 });
const iaSeekPistol = W('iaSeekPistol', '自動手槍', 'Autopistol', 'ranged', 4, 2, 2, 3, { range: 8, seek: true });
const iaMysticFists = W('iaMysticFists', '拳頭', 'Fists', 'melee', 3, 5, 2, 3);
const iaHandFlamer = W('iaHandFlamer', '手持噴火器', 'Hand flamer', 'ranged', 4, 2, 3, 3, { range: 6, saturate: true, torrent: 1 });
const iaChainsword = W('iaChainsword', '鏈鋸劍', 'Chainsword', 'melee', 4, 4, 4, 5);
const iaPlasmaStd = W('iaPlasmaStd', '瞄準鏡電漿手槍（標準）', 'Scoped plasma pistol (standard)', 'ranged', 4, 3, 3, 5, { range: 12, piercing: 1, fixedHit: true }, 'iaPlasma');
const iaPlasmaSup = W('iaPlasmaSup', '瞄準鏡電漿手槍（超載）', 'Scoped plasma pistol (supercharge)', 'ranged', 4, 3, 4, 5, { range: 12, hot: true, lethal: 5, piercing: 1, fixedHit: true }, 'iaPlasma');
const iaSuppressed = W('iaSuppressed', '消音自動手槍', 'Suppressed autopistol', 'ranged', 4, 3, 2, 3, { range: 8, silent: true, fixedHit: true }, 'iaSuppressed');
const iaHBFocus = W('iaHBFocus', '重型爆彈槍（集中）', 'Heavy bolter (focused)', 'ranged', 5, 4, 4, 5, { heavy: 'dash', piercingCrits: 1 }, 'iaHB');
const iaHBSweep = W('iaHBSweep', '重型爆彈槍（掃射）', 'Heavy bolter (sweeping)', 'ranged', 4, 4, 4, 5, { heavy: 'dash', piercingCrits: 1, torrent: 1 }, 'iaHB');
const iaMultiMelta = W('iaMultiMelta', '多管熱熔', 'Multi-melta', 'ranged', 4, 4, 6, 3, { devastating: 4, heavy: 'dash', piercing: 2 });
const iaPCStd = W('iaPCStd', '電漿砲（標準）', 'Plasma cannon (standard)', 'ranged', 4, 4, 4, 6, { blast: 2, heavy: 'dash', piercing: 1 }, 'iaPC');
const iaPCSup = W('iaPCSup', '電漿砲（超載）', 'Plasma cannon (supercharge)', 'ranged', 4, 4, 5, 6, { blast: 2, heavy: 'dash', hot: true, lethal: 5, piercing: 1 }, 'iaPC');
const iaServoClaw = W('iaServoClaw', '伺服爪', 'Servo claw', 'melee', 3, 4, 4, 5);
// Sisters of Silence and Tempestus Scions (requisitioned only).
const ssBoltgun = W('ssBoltgun', '爆彈槍', 'Boltgun', 'ranged', 4, 3, 3, 4);
const ssGunButt = W('ssGunButt', '槍托', 'Gun butt', 'melee', 4, 4, 2, 3);
const ssFlamer = W('ssFlamer', '噴火器', 'Flamer', 'ranged', 4, 2, 3, 3, { range: 8, saturate: true, torrent: 2 });
const ssGreatblade = W('ssGreatblade', '處刑巨刃', 'Executioner greatblade', 'melee', 4, 3, 4, 6, { lethal: 5 });
const tsHotshot = W('tsHotshot', '熱射雷射槍', 'Hot-shot lasgun', 'ranged', 4, 3, 3, 4);
const tsGunButt = W('tsGunButt', '槍托', 'Gun butt', 'melee', 3, 4, 2, 3);
const tsFlamer = W('tsFlamer', '噴火器', 'Flamer', 'ranged', 4, 2, 3, 3, { range: 8, saturate: true, torrent: 2 });
const tsGLFrag = W('tsGLFrag', '榴彈發射器（破片）', 'Grenade launcher (frag)', 'ranged', 4, 3, 2, 4, { blast: 2 }, 'tsGL');
const tsGLKrak = W('tsGLKrak', '榴彈發射器（穿甲）', 'Grenade launcher (krak)', 'ranged', 4, 3, 4, 5, { piercing: 1 }, 'tsGL');
const tsVolleyF = W('tsVolleyF', '熱射齊射槍（集中）', 'Hot-shot volley gun (focused)', 'ranged', 5, 3, 3, 4, { piercingCrits: 1 }, 'tsVolley');
const tsVolleyS = W('tsVolleyS', '熱射齊射槍（掃射）', 'Hot-shot volley gun (sweeping)', 'ranged', 4, 3, 3, 4, { piercingCrits: 1, torrent: 1 }, 'tsVolley');
const tsMelta = W('tsMelta', '熱熔槍', 'Meltagun', 'ranged', 4, 3, 6, 3, { range: 6, devastating: 4, piercing: 2 });
const tsPlasmaStd = W('tsPlasmaStd', '電漿槍（標準）', 'Plasma gun (standard)', 'ranged', 4, 3, 4, 6, { piercing: 1 }, 'tsPlasma');
const tsPlasmaSup = W('tsPlasmaSup', '電漿槍（超載）', 'Plasma gun (supercharge)', 'ranged', 4, 3, 5, 6, { hot: true, lethal: 5, piercing: 1 }, 'tsPlasma');

/** Requisition groups: which kill team (or new datacards) they come from and how many can be taken. */
export const IA_GROUPS = {
  deathKorps: { name: { zh: '死亡軍團（克里格）', en: 'Death Korps' }, from: 'deathKorps', ids: ['bruiser', 'confidant', 'gunnerMelta', 'gunnerPlasma', 'medic', 'sniper', 'trooper', 'vox', 'zealot'], max: 3, repeat: ['trooper'] },
  exaction: { name: { zh: '強徵小隊（警察）', en: 'Exaction Squad' }, from: 'exaction', ids: ['castigator', 'chirurgant', 'leashmaster', 'malocator', 'marksman', 'revelatum', 'mastiff', 'subductor', 'vigilant', 'vox'], max: 5, repeat: ['subductor', 'vigilant'], twice: ['subductor'], extra: { rqRuthless: true } },
  kasrkin: { name: { zh: '卡舍津', en: 'Kasrkin' }, from: 'kasrkin', ids: ['ksMedic', 'ksDemo', 'ksFlamer', 'ksMelta', 'ksPlasma', 'ksRecon', 'ksSharpshooter', 'ksTrooper', 'ksVox'], max: 2, repeat: ['ksTrooper'] },
  navy: { name: { zh: '帝國海軍破襲隊', en: 'Imperial Navy Breachers' }, from: 'navyBreachers', ids: ['armsman', 'axejack', 'cat', 'endurant', 'gheistskull', 'grenadier', 'hatchcutter', 'surveyor', 'voidJammer', 'gunnerVolley', 'gunnerMelta'], max: 5, repeat: ['armsman'], extra: { rqVoidArmour: true } },
  sisters: { name: { zh: '寂靜修女', en: 'Sisters of Silence' }, ids: ['ssProsecutor', 'ssWitchseeker', 'ssVigilator'], max: 5, repeat: ['ssProsecutor', 'ssWitchseeker', 'ssVigilator'] },
  scions: { name: { zh: '風暴兵', en: 'Tempestus Scions' }, ids: ['tsMedic', 'tsTrooper', 'tsVox', 'tsGunFlamer', 'tsGunGL', 'tsGunVolley', 'tsGunMelta', 'tsGunPlasma'], max: 5, repeat: ['tsTrooper'], gunners: 2 },
};
const iaFF = (id, zh, en, dzh, den) => ({ id, cp: 1, name: { zh, en }, desc: { zh: dzh, en: den } }); // (ff() isn't defined yet here)
const ssNull = { psychicNull: true, nullRodAura: true };
const IA_NEW = [
  op('ssProsecutor', '寂靜修女：檢察官', 'Sister of Silence Prosecutor', { apl: 2, move: 6, save: 3, wounds: 8, base: 32, ...ssNull, rqGroup: 'sisters' }, [ssBoltgun, ssGunButt], 0),
  op('ssWitchseeker', '寂靜修女：獵巫者', 'Sister of Silence Witchseeker', { apl: 2, move: 6, save: 3, wounds: 8, base: 32, ...ssNull, rqGroup: 'sisters' }, [ssFlamer, ssGunButt], 0),
  op('ssVigilator', '寂靜修女：守夜者', 'Sister of Silence Vigilator', { apl: 2, move: 6, save: 3, wounds: 8, base: 32, ...ssNull, rqGroup: 'sisters' }, [ssGreatblade], 0),
  op('tsMedic', '風暴兵：醫護兵', 'Tempestus Scion Medic', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, medic: true, medikit: true, rqGroup: 'scions' }, [tsHotshot, tsGunButt]),
  op('tsTrooper', '風暴兵：士兵', 'Tempestus Scion Trooper', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, adaptive: true, rqGroup: 'scions' }, [tsHotshot, tsGunButt]),
  op('tsVox', '風暴兵：通訊兵', 'Tempestus Scion Vox-operator', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, signalAny: true, rqGroup: 'scions' }, [tsHotshot, tsGunButt]),
  op('tsGunPlasma', '風暴兵：槍手（電漿槍）', 'Tempestus Scion Gunner (plasma gun)', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, rqGroup: 'scions', tsGunner: true }, [tsPlasmaStd, tsPlasmaSup, tsGunButt]),
  op('tsGunMelta', '風暴兵：槍手（熱熔槍）', 'Tempestus Scion Gunner (meltagun)', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, rqGroup: 'scions', tsGunner: true }, [tsMelta, tsGunButt]),
  op('tsGunFlamer', '風暴兵：槍手（噴火器）', 'Tempestus Scion Gunner (flamer)', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, rqGroup: 'scions', tsGunner: true }, [tsFlamer, tsGunButt], 0),
  op('tsGunGL', '風暴兵：槍手（榴彈發射器）', 'Tempestus Scion Gunner (grenade launcher)', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, rqGroup: 'scions', tsGunner: true }, [tsGLFrag, tsGLKrak, tsGunButt], 0),
  op('tsGunVolley', '風暴兵：槍手（熱射齊射槍）', 'Tempestus Scion Gunner (hot-shot volley gun)', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, rqGroup: 'scions', tsGunner: true }, [tsVolleyF, tsVolleyS, tsGunButt], 0),
];
const iaCopies = Object.entries(IA_GROUPS).filter(([, gr]) => gr.from).flatMap(([gid, gr]) => {
  const src = TEAMS.find((t) => t.id === gr.from);
  return gr.ids.map((id) => {
    const t = src.ops.find((o) => o.id === id);
    const zh = `${gr.name.zh.replace(/（.*）/, '')}：${t.name.zh}`;
    return { ...t, id: `rq_${gid}_${id}`, name: { zh, en: `${gr.name.en} ${t.name.en}` }, count: 0, rqGroup: gid, rqFrom: id, ...(gr.extra || {}) };
  });
});
export const IA_AGENT_IDS = ['iaAutosavant', 'iaQuestkeeper', 'iaDWVeteran', 'iaEnlightener', 'iaHexorcist', 'iaMystic', 'iaPenal', 'iaPistolier', 'iaServitorHB', 'iaServitorMM', 'iaServitorPC'];
const IA_FLEX = [...IA_AGENT_IDS, ...IA_NEW.map((o) => o.id), ...iaCopies.map((o) => o.id)];
const servitor = (id, zh, en, ws) => op(id, `徵用槍械僕從（${zh}）`, `Requisitioned Gun Servitor (${en})`, { apl: 1, move: 5, save: 4, wounds: 11, base: 32, lobotomised: true, gunServitor: true }, [...ws, iaServoClaw], 0);
TEAMS.push({
  id: 'inquisitorialAgents',
  name: { zh: '異端審判庭特務', en: 'Inquisitorial Agents' },
  color: '#8c1c2c',
  style: { zh: '混合隊・徵用・審判', en: 'Mixed · Requisition · Inquisition' },
  blurb: {
    zh: '審判官的爪牙：審問官、典籍骷髏與五名特務，再從帝國的一支部隊徵用最多五名人手（克里格、警察、卡舍津、寂靜修女、風暴兵或海軍破襲隊）。',
    en: 'An Inquisitor\'s agents: an Interrogator, a Tome-skull and five agents, with up to five more requisitioned from one Imperial force (Death Korps, Exaction Squad, Kasrkin, Sisters of Silence, Tempestus Scions or Navy Breachers).',
  },
  // Collector notes supplied by the player.
  info: {
    archetypes: [{ zh: '四種皆可', en: 'Any' }],
    kind: { zh: '混合隊', en: 'Mixed' },
    oneBox: { zh: '不能，需要多買一盒，或和其他單位（卡舍津、警察）一起成軍', en: 'No — buy another box, or field them with other units (Kasrkin, Exaction Squad)' },
    buyable: { zh: '能', en: 'Yes' },
    size: { zh: '7 名特工＋最多 5 名徵用人員', en: '7 operatives + up to 5 requisitioned' },
  },
  inquisition: true,
  perCopyRoster: true,
  rule: {
    name: { zh: '審判庭徵用與審判典籍', en: 'Inquisitorial Requisition & Tomes' },
    desc: {
      zh: '後五個名額可以改從一支部隊徵用（死亡軍團最多 3 名、卡舍津最多 2 名、其他最多 5 名；不能混用不同部隊）。徵用人員保留資料卡能力，但失去原本的陣營規則（警察保留冷酷效率、海軍保留虛空護甲）。審判典籍（自動）：審問官有「譴責」——友方攻擊在它 2" 內的敵人時 Atk +1；典籍骷髏有「聖化」——敵人攻擊在它 2" 內的友方時 Atk -1。',
      en: 'The last five slots can instead be requisitioned from one force (Death Korps at most 3, Kasrkin at most 2, others 5; never mixing forces). Requisitioned operatives keep their datacard abilities but lose their own faction rules (Exaction Squad keeps Ruthless Efficiency, Navy Breachers Void Armour). Inquisitorial Tomes (automatic): the Interrogator has Denunciation — friendlies attacking an enemy within 2" of it get +1 Atk; the Tome-skull has Sanctification — enemies attacking a friendly within 2" of it get -1 Atk.',
    },
  },
  ploys: [
    { id: 'denounce', cp: 1, name: { zh: '揭發', en: 'Denounce' },
      desc: { zh: '選一名敵人並擲 D3：本回合它要等到最後才能啟動，或對手已啟動 D3 名特工後。每多用一次多花 1CP。', en: 'Pick an enemy and roll a D3: this TP it can\'t activate until it\'s the last one, or until your opponent has activated that many operatives. Costs 1CP more each time it was used before.' } },
    { id: 'intenseScrutiny', cp: 1, name: { zh: '嚴密審查', en: 'Intense Scrutiny' },
      desc: { zh: '本回合友方選目標時，4" 內（而非 2"）的敵人不能算在掩體中（掩體豁免照常）。', en: 'This TP, when a friendly selects a valid target, enemies within 4" (instead of 2") can\'t be in cover (cover saves still apply).' } },
    { id: 'quarry', cp: 1, name: { zh: '獵物', en: 'Quarry' },
      desc: { zh: '選一名敵人當獵物：友方攻擊它時武器「無休」；它殘廢時換一名新的獵物。', en: 'Pick an enemy as your quarry: friendlies attacking it have Ceaseless; when it\'s incapacitated, pick a new one.' } },
    { id: 'irrefutableJurisdiction', cp: 1, name: { zh: '不容置疑的管轄', en: 'Irrefutable Jurisdiction' },
      desc: { zh: '本回合 3" 內有目標點的友方被射擊時可重擲一顆防禦骰；爭奪該目標點時改為重擲同一種點數的骰子。', en: 'This TP, a friendly within 3" of an objective being shot re-rolls one defence die; contesting it, any defence dice of one result instead.' } },
  ],
  // Five agents, then five agents or requisitioned operatives from one group.
  replacements: Object.fromEntries([
    ...['iaQuestkeeper', 'iaDWVeteran', 'iaEnlightener', 'iaHexorcist', 'iaMystic'].map((id) => [id, [id, ...IA_AGENT_IDS.filter((x) => x !== id)]]),
    ...['tsMedic', 'tsTrooper', 'tsVox', 'tsGunPlasma', 'tsGunMelta'].map((id) => [id, [id, ...IA_FLEX.filter((x) => x !== id)]]),
  ]),
  ops: [
    op('iaInterrogator', '審問官', 'Interrogator Agent', { apl: 2, move: 6, save: 5, wounds: 8, base: 25, iaLeader: true, tome: 'denunciation', groupAct: 'iaTome' }, [iaRelicPistol, iaFists]),
    op('iaTomeSkull', '典籍骷髏', 'Tome-skull', { apl: 2, move: 6, save: 5, wounds: 5, base: 25, tome: 'sanctification', machine: true, expendable: true, small: true, noRetaliate: true, groupAct: 'iaTome', actionsOnly: ['charge', 'dash', 'fallBack', 'reposition'] }, [noWeapon]),
    op('iaAutosavant', '自動學者', 'Autosavant Agent', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, scrivener: true, irrefutable: true }, [iaAppendages], 0),
    op('iaQuestkeeper', '尋道騎士', 'Questkeeper Agent', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, irrepressible: true, iaZealot: true }, [iaAutopistol, iaEviscerator]),
    op('iaDWVeteran', '死亡世界老兵', 'Death World Veteran Agent', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, concealCharge: true, weathered: true }, [iaAutopistol, iaKnife, iaPolearm]),
    op('iaEnlightener', '啟蒙者', 'Enlightener Agent', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, noEscape: true, extractInfo: true }, [iaAutopistol, iaPairedBlades]),
    op('iaHexorcist', '驅魔者', 'Hexorcist Agent', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, hexorcise: true }, [iaShotgun, iaFists]),
    op('iaMystic', '神秘者', 'Mystic Agent', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, psyker: true, controlPlus: true, scry: true }, [iaSeekPistol, iaMysticFists]),
    op('iaPenal', '罪罰軍團兵', 'Penal Legionnaire Agent', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, chemEnhanced: true, cruel: true }, [iaHandFlamer, iaChainsword], 0),
    op('iaPistolier', '神槍手', 'Pistolier Agent', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, iaBarrage: true }, [iaPlasmaStd, iaPlasmaSup, iaSuppressed, iaFists], 0),
    servitor('iaServitorHB', '重型爆彈槍', 'heavy bolter', [iaHBFocus, iaHBSweep]),
    servitor('iaServitorMM', '多管熱熔', 'multi-melta', [iaMultiMelta]),
    servitor('iaServitorPC', '電漿砲', 'plasma cannon', [iaPCStd, iaPCSup]),
    ...IA_NEW,
    ...iaCopies,
  ],
  firefight: [
    iaFF('absoluteAuthority', '絕對權威', 'Absolute Authority', '自動：對手使用策略計謀（花 CP 的）時，取消它並退回 CP，對手本回合不能再用；同一個計謀整場只能擋一次。（交戰計謀不攔截）', 'Auto: when your opponent uses a strategy ploy that costs CP, it isn\'t used, the CP is refunded and they can\'t use it again this TP; the same ploy can only be stopped once per battle. (Firefight ploys aren\'t intercepted.)'),
    iaFF('relentlessPursuit', '窮追不捨', 'Relentless in Pursuit', '自動：準備中友方 2" 內的敵人移動後，那名友方免費衝鋒到它控制範圍內，衝不到就免費移動到它 2" 內。', 'Auto: when an enemy within 2" of a ready friendly moves, that friendly makes a free Charge into its control range, or failing that a free Reposition to within 2" of it.'),
    iaFF('emperorsWill', '帝皇的意志', 'The Emperor\'s Will', '友方啟動時：本次啟動無視它的屬性變化（APL 與命中）。', 'When a friendly is activated: ignore changes to its stats (APL and Hit) this activation.'),
    iaFF('intimidatingPresence', '威嚇', 'Intimidating Presence', '自動：友方 3" 內（神秘者 6" 內）看得到的敵人撿標記或做任務動作時，要多花 1AP。', 'Auto: an enemy visible within 3" of a friendly (6" of the Mystic) picking up a marker or performing a mission action spends 1 more AP.'),
  ],
});

// ---- NPOs (non-player operatives) used by mission packs; not selectable as a kill team ----
const enormousClaws = W('enormousClaws', '巨爪', 'Enormous claws', 'melee', 5, 3, 4, 5, { brutal: true, ceaseless: true, rending: true });
const viciousJaws = W('viciousJaws', '兇猛顎', 'Vicious jaws', 'melee', 3, 4, 3, 4, { rending: true });
const atomicDisassembler = W('atomicDisassembler', '原子分解器', 'Atomic disassembler', 'ranged', 5, 4, 4, 2, { range: 8, devastating: 3, piercing: 2 });
const eradicatorGlove = W('eradicatorGlove', '根除手套', 'Eradicator glove', 'melee', 4, 4, 5, 7, { brutal: true, shock: true, stun: true });

/**
 * NPO flags: nemesis (Extra Defence + Bulky: one more defence die unless injured, ignores APL changes),
 * behaviour: 'brawler' | 'archivist', small (Borewyrm), symbiosis (Ambull: regains APL+1 wounds on
 * activation), xenotech (Archivist: ignores Piercing, Dmg 4+ deals 1 less, Extra Defence even injured).
 */
export const NPO_TEAM = {
  id: 'npo',
  name: { zh: '非玩家特工（NPO）', en: 'Non-player operatives' },
  color: '#a855c7',
  ploys: [],
  rule: { name: { zh: 'NPO', en: 'NPO' }, desc: { zh: '依行為卡行動，敵對雙方玩家。', en: 'Acts by its behaviour; hostile to both players.' } },
  ops: [
    op('ambull', '安布爾', 'Ambull', { apl: 2, control: 4, move: 6, save: 4, wounds: 35, base: 50, nemesis: true, symbiosis: true, behaviour: 'brawler' }, [enormousClaws]),
    op('borewyrm', '鑽地蟲群', 'Borewyrm Infestation', { apl: 1, move: 4, save: 5, wounds: 5, base: 25, small: true, behaviour: 'brawler' }, [viciousJaws]),
    op('archivist', '檔案管理員', 'The Archivist', { apl: 2, control: 4, move: 6, save: 4, wounds: 35, base: 50, nemesis: true, xenotech: true, behaviour: 'archivist' }, [atomicDisassembler, eradicatorGlove]),
  ].map((o) => ({ ...o, count: o.id === 'borewyrm' ? 2 : 1 })), // count only affects naming (#1, #2); missions spawn NPOs
};

// ---- Firefight ploys (交戰計謀), 1CP each, once per turning point; the rules are in game.js (FF) ----
// kind: 'button' (during the operative's activation), 'aim'/'attack' (chosen with a Shoot or Fight),
// 'auto' (reactions, used automatically while switched on).
const ff = (id, zh, en, dzh, den) => ({ id, cp: 1, name: { zh, en }, desc: { zh: dzh, en: den } });
const FIREFIGHT = {
  angels: [
    ff('adjustDoctrine', '調整教條', 'Adjust Doctrine', '啟動中：把本回合的戰鬥教條換成下一種（突擊→毀滅→戰術）。', 'During an activation: switch this TP\'s Combat Doctrine to the next one (Assault → Devastator → Tactical).'),
    ff('wrathVengeance', '復仇之怒', 'Wrath of Vengeance', '反應時：多一個免費的 1AP 動作。', 'While counteracting: one more 1AP action for free.'),
    ff('transhuman', '超人生理', 'Transhuman Physiology', '自動：被射擊時，一顆普通豁免當成暴擊豁免（能多擋暴擊時才用）。', 'Auto: when shot, one normal save is retained as a critical one (used when it blocks a crit).'),
    ff('shockAssault', '震撼突擊', 'Shock Assault', '本次啟動衝鋒過的近戰：武器「震撼」，第一次打擊 +1 傷害（最多 7）。', 'Fighting after a Charge this activation: Shock, and the first strike deals 1 more (max 7).'),
  ],
  blooded: [
    ff('momentRepute', '榮耀時刻', 'Moment of Repute', '受諸神注視的友方啟動中：本次 APL +1。', 'During the activation of the operative under the Gaze of the Gods: +1 APL.'),
    ff('rewardEarned', '應得的獎賞', 'Reward Earned', '自動：持有血祭標記的友方在 2" 內使敵人殘廢時，獲得 1 個血祭標記。', 'Auto: when a friendly with a Blooded token incapacitates an enemy within 2", gain a Blooded token.'),
    ff('callousDisregard', '冷酷漠視', 'Callous Disregard', '自動：友方射擊時，即使有其他友方在敵人控制範圍內也能選它為目標；這次射擊每丟掉一顆失敗的攻擊骰，就對目標控制範圍內的一名友方造成等同骰值的傷害。', 'Auto: a friendly can shoot an enemy that other friendlies are within control range of; each attack dice discarded as a fail inflicts damage equal to its result on a friendly within the target\'s control range.'),
    ff('darkFavour', '黑暗恩寵', 'Dark Favour', '自動：持有血祭標記的友方被選為射擊或近戰目標時，3" 內看得到的另一名友方代替它（爆炸、洪流除外）。', 'Auto: when a friendly with a Blooded token is picked as a target to shoot or fight, another friendly visible within 3" takes its place (not against Blast or Torrent).'),
  ],
  deathKorps: [
    ff('inspirationalLeadership', '鼓舞領導', 'Inspirational Leadership', '支援。看守長或心腹啟動中、行動前後：下達一道衛兵命令（自動選擇命令）。看守長這次啟動沒有以策略謀略下令時 0CP（適應性命令）。', 'Support. During a Watchmaster\'s or Confidant\'s activation, before or after an action: it issues a Guardsman Order (chosen automatically). Free for a Watchmaster that didn\'t issue one as a strategic gambit (Adaptive Orders).'),
    ff('lifeShame', '生之恥辱', 'In Life, Shame', '自動：友方啟動並選交戰指令時，它收到所有衛兵命令（不受一次只能一道的限制）。', 'Auto: when a friendly is activated and given an Engage order, it receives every Guardsman Order (overriding the one-at-a-time rule).'),
    ff('deathAtonement', '死之救贖', 'In Death, Atonement', '自動：準備中、不在敵人控制範圍內的友方殘廢時，被移除前可免費做一個動作（近戰除外），並可改指令；這個動作中它視為重傷。（自動：免費射擊）', 'Auto: when a ready friendly not in enemy control range is incapacitated, before it\'s removed it performs one free action (not Fight) and may change its order; it counts as injured for it. (Automatically a free Shoot.)'),
    ff('combinedArms', '聯合火力', 'Combined Arms', '射擊本回合已被其他友方射擊過的敵人：可重擲任意攻擊骰（毫不留情）。', 'Shooting an enemy another friendly shot this TP: re-roll any attack dice (Relentless).'),
  ],
  exaction: [
    ff('longArm', '帝皇律法之臂', 'Long Arm of the Emperor\'s Law', '射擊選武器時：有射程限制的武器射程 +3"。', 'When shooting with a Range x weapon: +3" to x.'),
    ff('exactPunishment', '精確懲處', 'Exact Punishment', '自動：敵人射擊 6" 內的友方而它沒有殘廢時，那名友方立刻免費射擊那名敵人（只能射牠；免費近戰的選項沒有實作）。', 'Auto: after an enemy shoots a friendly within 6" of it and that friendly is not incapacitated, the friendly immediately makes a free Shoot against that enemy only (the free Fight option is not modelled).'),
    ff('brutalBackup', '殘暴支援', 'Brutal Backup', '友方啟動中：另一名同樣在那名敵人控制範圍內的友方立刻免費近戰一次（只能打牠）。', 'During the activation of a friendly: another friendly within control range of that enemy makes a free Fight at once (against it only).'),
  ],
  fellgor: [
    ff('animalisticFury', '獸性狂怒', 'Animalistic Fury', '近戰時第一次暴擊打擊 +1 傷害（反擊時自動使用）。', 'Fighting: the first critical strike deals 1 more (used automatically when retaliating).'),
    ff('wildRage', '狂野暴怒', 'Wild Rage', '啟動時：本次啟動 Move +1"。', 'When activated: +1" Move for this activation.'),
    ff('ruthlessRampage', '無情暴走', 'Ruthless Rampage', '近戰後若已不在敵人控制範圍內：免費衝鋒一次（最多 3"）。', 'After a Fight, if out of enemy control range: a free Charge of up to 3".'),
    ff('bloodsense', '嗜血感知', 'Bloodsense', '自動：友方惡角獸人在啟動中使控制範圍內的敵人殘廢時，那名敵人 3" 內看得到、準備好的另一名友方接著啟動。', 'Auto: when a friendly Fellgor incapacitates an enemy within its control range during its activation, another ready friendly visible within 3" of that enemy activates straight after.'),
  ],
  farstalkers: [
    ff('slipAway', '溜走', 'Slip Away', '啟動中：本次撤退少花 1AP。', 'During an activation: Fall Back costs 1 less AP.'),
    ff('poach', '盜獵', 'Poach', '啟動中：直到啟動結束，這名特工做「撿起標記」或需要控制標記的任務動作時，只要爭奪標記就行。', 'During an activation: until its end, the operative only needs to contest a marker to perform Pick Up Marker or mission actions that usually need it controlled.'),
    ff('vengeanceKinband', '為戰團復仇', 'Vengeance for the Kinband', '自動：友方被敵人打成殘廢時，之後友方攻擊那個敵人都「毫不留情」（它殘廢前不能再用）。', 'Auto: when a friendly is incapacitated by an enemy, friendlies attacking that enemy have Relentless (not again until it falls).'),
    ff('savageAmbush', '野蠻伏擊', 'Savage Ambush', '自動：控制範圍內有地形、尚未行動的友方被近戰時，由它先出手。', 'Auto: a ready friendly with terrain in its control range that\'s fought against resolves the first die.'),
  ],
  gellerpox: [
    ff('putrescentDemise', '腐爛之死', 'Putrescent Demise', '自動：友方殘廢時，2" 內看得到的每名敵人受 1 傷害（噩夢巨獸 D3）。', 'Auto: when a friendly falls, each enemy visible within 2" takes 1 damage (D3 for a Nightmare Hulk).'),
    ff('frighteningOnslaught', '駭人猛攻', 'Frightening Onslaught', '噩夢巨獸近戰後：再免費近戰一次。', 'After a Nightmare Hulk fights: a free Fight.'),
    ff('revoltingTech', '腐壞科技', 'Revolting Technology', '自動：敵人射擊友方時，它的武器獲得「過熱」。', 'Auto: an enemy shooting a friendly has Hot on its weapon.'),
    ff('barge', '衝撞', 'Barge', '夢魘巨怪啟動或反應中：直到結束，它可以穿過敵人、進入敵人控制範圍移動，也可以在敵人控制範圍內重新部署或衝鋒。', 'During a Nightmare Hulk\'s activation or counteraction: until it ends, it can move through enemies and within their control range, and can Reposition or Charge while within an enemy\'s control range.'),
  ],
  hunterClade: [
    ff('commandOverride', '指令覆寫', 'Command Override', '啟動時：這名特工改用最適合它的指令（近戰型→征服者，射擊型→守護者）。', 'When activated: this operative switches to the Imperative that suits it (melee → Conqueror, shooting → Protector).'),
    ff('omnissiah', '萬機神指令', 'Omnissiah\'s Imperative', '啟動中：直到下回合，守護者→遠程「重創」；征服者→近戰時第一次打擊後可再打擊一次。', 'During an activation: until next TP, Protector → ranged Severe; Conqueror → after its first strike when fighting, another.'),
    ff('scrapcode', '廢碼過載', 'Scrapcode Overload', '滲透者啟動時：直到它下次啟動，它 3" 內的敵人爭奪目標時 APL 總和 -1。', 'When an Infiltrator is activated: until its next activation, enemies within 3" of it count 1 less total APL for marker control.'),
    ff('controlEdict', '控制敕令', 'Control Edict', '輪到己方啟動時：領袖與它 3" 內看得到、準備好的另一名友方接連啟動（最多一名西卡里安）；這裡在其中一名啟動時使用，另一名接著啟動。', 'When it is your turn to activate: the Leader and another ready friendly visible within 3" of it activate one after the other (no more than one Sicarian); here used as one of them is activated, the other activates straight after.'),
  ],
  hearthkyn: [
    ff('sturdy', '結實', 'Sturdy', '自動：被射擊時，攻擊方保留的暴擊全部變成普通成功。', 'Auto: when shot, the attacker\'s retained crits become normal successes.'),
    ff('engageToAcquire', '以戰奪寶', 'Engage to Acquire', '攻擊控制目標點的敵人：可重擲任意攻擊骰（毫不留情）。', 'Attacking an enemy that controls an objective: re-roll any attack dice (Relentless).'),
    ff('ancestorsWatching', '先祖注視', 'The Ancestors Are Watching', '啟動中：可免費射擊或近戰一次，且武器無視重傷減益。', 'During an activation: a free Shoot or Fight, ignoring injured weapon penalties.'),
    ff('worthIt', '值得', 'Worth It', '自動：友方殘廢時，在移除前可以免費執行一個任務動作（有能做的才會用）。', 'Auto: when a friendly is incapacitated, it performs a free mission action before it\'s removed (if one is available).'),
  ],
  hierotek: [
    ff('livingLightning', '活體閃電', 'Living Lightning', '用特斯拉卡賓槍射擊時：改為「爆炸 2\"」（不再有 2" 毀滅）。', 'Shooting a tesla carbine: Blast 2" instead of its 2" Devastating.'),
    ff('corticalControl', '皮質控制', 'Cortical Control', '技師或學徒啟動中：這次啟動的支援動作選友方時不限距離（只要看得到）。', 'During a Cryptek\'s or Apprentek\'s activation: its SUPPORT actions this activation ignore the distance requirement for picking a friendly (visibility only).'),
    ff('dimensionalAmbush', '次元伏擊', 'Dimensional Ambush', '隱蔽指令的死亡標記啟動中：本次啟動可以在任何地圖、隱蔽指令下執行警戒（攻擊時改為交戰）。', 'During a Concealed Deathmark\'s activation: it can Guard in any killzone while Concealed (going Engage when it attacks).'),
    ff('reanimatedFunction', '復甦機能', 'Reanimated Function', '選一個復甦標記：到下個回合開始前，控制目標時它算一名 APL 1 的友方（這裡選最靠近目標點的）。', 'Pick a Reanimation marker: until the next turning point it counts as a friendly with APL 1 for control (here the one nearest an objective).'),
  ],
  navyBreachers: [
    ff('blitz', '閃擊', 'Blitz', '全隊本回合第一次攻擊、目標在 6" 內：「精準 1」；若也是第一個啟動的再加「重創」。', 'The team\'s first attack this TP, target within 6": Accurate 1; also Severe if it\'s the first operative activated.'),
    ff('overwhelmTarget', '壓制目標', 'Overwhelm Target', '以突破清場啟動時：本次 APL +1。', 'When activated with Breach and Clear: +1 APL.'),
    ff('lockItDown', '鎖定陣地', 'Lock It Down', '友方啟動時：選一個目標點，直到戰鬥結束（或再用這張），這名特工爭奪它時 APL 算多 1。', 'When a friendly is activated: pick an objective marker; until the end of the battle (or the next use) it counts 1 higher APL for that marker\'s control.'),
    ff('deckHand', '甲板老手', 'Deck Hand', '啟動中：這次啟動穿過一個可通行地形不另加 1"，並可免費「操作艙門」一次（衝鋒、撤退時也可以）。', 'During an activation: one Accessible terrain crossing doesn\'t add 1", and one free Operate Hatch (also during Charge or Fall Back).'),
  ],
  kommandos: [
    ff('justScratch', '只是擦傷', 'Just a Scratch', '自動：一顆攻擊骰對友方（炸彈史奎格與格洛特除外）造成普通傷害時，忽略那次傷害。', 'Auto: when an attack die inflicts Normal Dmg on a friendly (not a Bomb Squig or Grot), ignore that damage.'),
    ff('shakeItOff', '甩掉它', 'Shake It Off', '啟動時：本回合無視 APL 的變化（被減的 AP 補回）。', 'When activated: ignore APL changes this TP (a lost AP is restored).'),
    ff('krumpEm', '開扁！', 'Krump \'Em!', '自動：火力戰鬥階段結束時，一名友方立刻免費近戰一次（需要有敵人在控制範圍內；自動選擇）。', 'Auto: at the end of the Firefight phase, one friendly operative makes a free Fight (needs an enemy in control range; chosen automatically).'),
    ff('kunnin', '狡猾但殘暴', 'Kunnin\' But Brutal', '自動：隱蔽指令的友方在有衝鋒的啟動中近戰，結算第一顆攻擊骰時若是普通成功的打擊，改當暴擊成功。', 'Auto: a friendly with a Conceal order fighting in an activation in which it charged: when resolving the first attack die as a strike with a normal success, treat it as a critical success.'),
  ],
  tauPathfinders: [
    ff('supportingFire', '支援火力', 'Supporting Fire', '射擊選目標時：6" 內被友方纏住的敵人也能選。', 'Picking a target: enemies within 6" in friendly control range can be selected.'),
    ff('worthyCause', '正義之舉', 'A Worthy Cause', '自動：火力戰鬥階段一開始，一名友方探路者（無人機除外）免費做一個任務動作。', 'Auto: at the start of the Firefight phase, one friendly Pathfinder (not a drone) performs a free mission action.'),
    ff('saviourProtocols', '救主協議', 'Saviour Protocols', '自動：友方探路者（無人機除外）被選為射擊的有效目標時，3" 內看得到的一架友方無人機代替成為目標（對爆裂／洪流武器無效；掩護與遮蔽依原目標）。無人機操控員在場或選到護盾無人機時 0CP。', 'Auto: when a friendly non-drone Pathfinder is selected as the valid target of a Shoot, a friendly drone visible within 3" becomes the target instead (no effect vs Blast/Torrent; cover and obscuring as the original target). 0CP while a Drone Controller is in the killzone or when it is the Shield Drone.'),
    ff('pointBlank', '近距離齊射', 'Point-Blank Fusillade', '自動：友方探路者（無人機除外）反擊時，若本次啟動／反應開始時不在敵人控制範圍內，可把一把遠程武器（非手雷）當近戰武器用（那次不能格擋，毀滅／穿甲／洪流無效）；準備中、交戰指令、用脈衝武器反擊時，先結算防守方的骰。', 'Auto: when a friendly non-drone Pathfinder retaliates and wasn\'t engaged at the start of that activation, it uses a ranged weapon (not a grenade) as a melee weapon (no blocking; Devastating, Piercing and Torrent have no effect); a ready Engage-order one with a pulse weapon resolves first.'),
  ],
  phobos: [
    ff('criticalShot', '致命一擊', 'Critical Shot', '用爆彈武器射擊：有暴擊命中時，多造成 D3 傷害（每次行動一次）。', 'Shooting a bolt weapon: a critical hit inflicts D3 more damage (once per action).'),
    ff('transhuman', '超人生理', 'Transhuman Physiology', '自動：被射擊時，一顆普通豁免當成暴擊豁免（能多擋暴擊時才用）。', 'Auto: when shot, one normal save is retained as a critical one (used when it blocks a crit).'),
    ff('patientAmbush', '耐心伏擊', 'Patient Ambush', '輪到己方啟動特工時：跳過這次啟動機會（啟動選單上的按鈕）。', 'When it\'s your turn to activate an operative: skip that activation (a button when you pick an operative).'),
    ff('stealthAssault', '潛行突擊', 'Stealth Assault', '自動：啟動時是隱蔽指令、改成交戰後先衝鋒再近戰，結算這次啟動的第一顆攻擊骰後，可以立刻再結算一顆（對手之前）；這之前不能做其他動作。', 'Auto: activated with a Conceal order, given an Engage order, it Charges and then Fights — after resolving its first attack dice this activation, it immediately resolves another (before the opponent); no other actions before that.'),
  ],
  plagueMarines: [
    ff('sickeningResilience', '令人作嘔的堅韌', 'Sickening Resilience', '自動：受到重傷時，本次行動中「令人作嘔的韌性」不用擲骰，3 以上的傷害一律 -1（最低 2）。', 'Auto: when badly hit, for the rest of the activation Disgustingly Resilient takes 1 off every 3+ damage (min 2) without rolling.'),
    ff('virulentPoison', '劇毒瘟疫', 'Virulent Poison', '啟動中：3" 內或 7" 內看得到的一名敵人中毒。', 'During an activation: an enemy within 3", or visible within 7", is poisoned.'),
    ff('poisonousDemise', '劇毒之死', 'Poisonous Demise', '自動：友方殘廢時，3" 內看得到的敵人中毒（已中毒的受 1 傷害）。', 'Auto: when a friendly falls, enemies visible within 3" are poisoned (1 damage if they already were).'),
    ff('curseOfRot', '腐朽詛咒', 'Curse of Rot', '自動：友方瘟疫戰士射擊或近戰 3" 內（有中毒標記則 7" 內）的敵人，對手擲完攻擊或防禦骰後：對手每擲出一個 3，那名敵人受 1 傷害，這個 3 不能保留為成功也不能重擲。', 'Auto: when a friendly PLAGUE MARINE shoots or fights an enemy within 3" (7" if it has a Poison token), after the opponent rolls their dice: for each 3 they roll, that enemy takes 1 damage; the 3 can\'t be retained and can\'t be re-rolled.'),
  ],
  wyrmblade: [
    ff('slink', '遁入黑暗', 'Slink into Darkness', '啟動中：啟動結束時從交戰改回隱蔽（每名整場一次）。', 'During an activation: switch from Engage back to Conceal when it ends (once per operative per battle).'),
    ff('coiledSerpent', '盤蛇', 'Coiled Serpent', '從隱蔽轉交戰後的第一次攻擊：一顆普通成功當成暴擊。', 'First attack after switching from Conceal to Engage: one normal success becomes a critical success.'),
    ff('unquestioningLoyalty', '無條件忠誠', 'Unquestioning Loyalty', '自動：教派特工或領袖被選為射擊或近戰目標時，3" 內看得到的一名新信徒（不含領袖）代替它（爆炸、洪流除外）。', 'Auto: when a Cult Agent or the Leader is picked as a target to shoot or fight, a Neophyte (not the Leader) visible within 3" takes its place (not against Blast or Torrent).'),
    ff('planGenerations', '世代籌劃之計', 'A Plan Generations in the Making', '自動：友方新信徒殘廢時，倒下前免費做一個任務動作。', 'Auto: when a friendly Neophyte is incapacitated, it performs a free mission action before it is removed.'),
  ],
  kasrkin: [
    ff('neutraliseTarget', '消滅目標', 'Neutralise Target', '射擊沒有掩護豁免、或被偵察兵掃描中的敵人：可重擲任意攻擊骰（毫不留情）。', 'Shooting an enemy that can\'t retain cover saves, or is being scanned: re-roll any attack dice (Relentless).'),
    ff('coverRetreat', '掩護撤退', 'Cover Retreat', '友方撤退後：6" 內看得到它、不在敵人控制範圍內的另一名友方立刻免費射擊一次（可改為交戰指令），之後撤退的特工繼續啟動。', 'After a friendly Falls Back: another friendly that is visible to it within 6" and not in enemy control range makes a free Shoot at once (it can change to Engage), then the first carries on.'),
    ff('seizeInitiative', '奪取先機', 'Seize the Initiative', '交戰階段開始時（沒有先攻的一方）：一名友方免費執行一個 1AP 動作，但不能移動。開始時會詢問，可略過。', 'At the start of the Firefight phase (the player without initiative): a friendly performs a free 1AP action, without moving. You are asked then, and can pass.'),
    ff('giveNoGround', '寸土不讓', 'Give No Ground', '友方啟動中選一個目標：本次啟動（或交戰階段結束時用：直到下回合開始），爭奪它的友方 APL 總和至少 2 且與敵人相同時，由卡舍津控制。', 'During a friendly activation, pick a marker: this activation (or, used at the end of the Firefight phase, until the next turning point) a tie with friendly contesting APL of 2+ goes to the Kasrkin.'),
  ],
  legionaries: [
    ff('mutability', '變化無常', 'Mutability and Change', '奸奇印記的友方啟動時：本次 APL +1。', 'When a Tzeentch operative is activated: +1 APL this activation.'),
    ff('malignantAura', '惡毒光環', 'Malignant Aura', '納垢印記的友方射擊 3" 內的敵人：遠程「穿甲 1」。', 'A Nurgle operative shooting an enemy within 3": Piercing 1.'),
    ff('sickeningCaptivation', '令人作嘔的魅惑', 'Sickening Captivation', '色孽印記的友方啟動中：4" 內看得到的一名敵人下次 APL -1。', 'During a Slaanesh operative\'s activation: a visible enemy within 4" gets -1 APL next activation.'),
  ],
  novitiates: [
    ff('blindingAura', '炫目光環', 'Blinding Aura', '自動：敵人射擊時選了一名友方為目標：本次啟動中，它離那名敵人超過 2" 時不能被選為目標（沒有其他目標的話，那次射擊直接結束）。', 'Auto: when an enemy selects a friendly as the target to shoot, for the rest of that activation it can\'t be selected while more than 2" from that enemy (if there\'s no other target, that Shoot action ends).'),
    ff('guidedFaith', '信仰引導', 'Guided by Faith', '友方射擊選武器時：射擊 6" 內的特工時，武器「追光」。', 'When a friendly shoots and selects a ranged weapon: against operatives within 6", it has Seek Light.'),
    ff('gloriousMartyrdom', '光榮殉道', 'Glorious Martyrdom', '自動：友方殘廢時，2" 內看得到它的每名敵人：獲得 1 信仰點並對它造成 D3 傷害。', 'Auto: when a friendly is incapacitated, for each enemy visible to and within 2" of it, gain 1 Faith and inflict D3 damage on that enemy.'),
    ff('blazingInferno', '熊熊烈焰', 'Blazing Inferno', '自動：國教噴火器的暴擊造成傷害時，目標獲得燃燒標記：它啟動時受到 D3 傷害，並可以 APL -1 撲滅。', 'Auto: when a Ministorum flamer inflicts damage with critical successes, the target gains a Blaze token: when it activates it takes D3 damage, and can take -1 APL to remove it.'),
  ],
  exoditeDragonMasters: [
    ff('leap', '躍起', 'Leap', '騎乘者疾馳時改為直接放到 1" 內的位置（算移動 3"，速度變 3-）。', 'A rider Sprinting is set up within 1" instead (counts as 3" moved; SPEED 3-).'),
    ff('feralHunger', '野性飢渴', 'Feral Hunger', '用（龍駒）尖牙利爪近戰已受傷的敵人：可重擲任意攻擊骰。', 'Fighting a wounded enemy with (drakesteed) fangs & talons: re-roll any attack dice.'),
    ff('ridingMastery', '騎術精湛', 'Riding Mastery', '騎乘者剛疾馳後：可以先撿起／放下標記或做一個任務動作，再用剩下的距離繼續疾馳。', 'Straight after a rider Sprints: it can Pick Up / Place a marker or do a mission action, then Sprint on with the distance left.'),
    ff('survivalistSpirit','生存者之魂', 'Survivalist Spirit', '騎乘者啟動或反應中：直到它下次啟動，武器不受重傷影響。', 'During a rider\'s activation or counteraction: until its next activation, its weapons ignore being injured.'),
  ],
  goremongers: [
    ff('destructiveDemise', '毀滅性死亡', 'Destructive Demise', '自動：友方殘廢時，對它控制範圍內一名敵人造成傷害：血槽空 D3、半 D3+1、滿 D3+2。', 'Auto: when a friendly is incapacitated, damage to an enemy in its control range: D3 with an empty GORE TANK, D3+1 half, D3+2 full.'),
    ff('lacerateFlesh', '割裂血肉', 'Lacerate Flesh', '血槽空的友方啟動或反應時：血槽 +1；這次結束時再 -1（不能拿來發動血之精華），扣不了就受到 D3 傷害。', 'When a friendly with an empty GORE TANK activates or counteracts: increase it; at the end, decrease it (not to use a SANGUAVITAE) — if you can\'t, it takes D3 damage.'),
    ff('unbridledAggression', '無拘侵略', 'Unbridled Aggression', '本次啟動衝鋒過的友方近戰：這次序列近戰武器「嚴厲」。', 'A friendly fighting in an activation it Charged: Severe on its melee weapons this sequence.'),
    ff('gorethirst', '血渴', 'Gorethirst', '反應時可以選一名隱蔽指令的友方：先改成交戰，這次反應只能衝鋒、射擊或近戰。（選它反應時自動使用）', 'When you counteract, you can pick a Concealed friendly: it changes to Engage first and can only Charge, Shoot or Fight during that counteraction. (Used automatically when you pick it.)'),
  ],
  hernkynYaegirs: [
    ff('bondsThatBind', '同袍之誼', 'Bonds That Bind', '友方啟動時：它 3" 內看得到的另一名準備中友方，可以在它結束後接著啟動。', 'When a friendly is activated: another ready friendly visible within 3" of it can activate right after it.'),
    ff('noKinLeft', '不留下任何同族', 'No Kin Left Behind', '自動：友方殘廢時在它的位置放下陣亡同族標記（只保留最新一個）。標記 3" 內的友方射擊、近戰或反擊時，一顆失敗骰改為普通成功（沒有失敗時一顆普通改為暴擊）。', 'Auto: when a friendly is incapacitated, the Fallen Kin marker is placed where it was (only the latest). Friendlies within 3" of it shooting, fighting or retaliating retain one fail as a normal success (or, with no fails, one normal as a critical).'),
    ff('sturdy', '結實', 'Sturdy', '自動：友方被射擊時，攻擊方保留的暴擊改為普通成功。', 'Auto: when a friendly is shot, the attacker\'s retained crits become normal successes.'),
    ff('stalwartDefence', '堅毅防守', 'Stalwart Defence', '自動：敵人衝鋒結束在友方控制範圍內時，那名友方 6" 內看得到、沒被纏住的另一名友方可以免費射擊那名敵人（不能用爆炸或範圍毀滅武器）。', 'Auto: when an enemy ends a Charge within a friendly\'s control range, another friendly visible within 6" of it and not engaged makes a free Shoot at that enemy (no Blast or x" Devastating weapons).'),
  ],
  elucidianStarstriders: [
    ff('combinedArms', '聯合火力', 'Combined Arms', '射擊本回合已被其他友方射擊過的敵人：可重擲任意攻擊骰（艦砲除外）。', 'Shooting an enemy another friendly shot this TP: re-roll any attack dice (not support assets).'),
    ff('survivalist', '生存專家', 'Survivalist', '友方啟動時（不在交戰中，每名整場一次）：回復 D3+2，本次啟動 APL 不受影響。', 'When a friendly is activated (not engaged, once per operative per battle): it regains D3+2 and ignores APL changes this activation.'),
    ff('greatEndurance', '強大耐力', 'Great Endurance', '艦隊員啟動中：本次啟動 APL +1。', 'During a Navis operative\'s activation: +1 APL this activation.'),
    ff('wellDrilled', '訓練有素', 'Well-Drilled', '艦隊員啟動時：3" 內看得到的另一名準備中艦隊員可以接著啟動。', 'When a Navis operative is activated: another ready Navis operative visible within 3" may activate right after it.'),
  ],
  chaosCult: [
    ff('abhorrentMutation', '可憎突變', 'Abhorrent Mutation', '黑暗聖會以外的友方啟動時：它額外獲得一個受詛咒的恩賜（每名整場一次，突變後仍保留）。', 'When a friendly cultist (not Dark Commune) activates: it gains an extra Accursed Gift (once per operative per battle; kept when it mutates).'),
    ff('faithfulFollower', '忠實追隨者', 'Faithful Follower', '自動：黑暗聖會成員被選為射擊或近戰目標時，改由它 3" 內看得到的另一名友方（非聖會）承受（爆炸、洪流無效）。', 'Auto: when a Dark Commune operative is picked as a Shoot or Fight target, another friendly (not Dark Commune) visible within 3" becomes the target instead (not vs Blast/Torrent).'),
    ff('frenziedDemise', '狂亂之死', 'Frenzied Demise', '自動：突變者或折磨者殘廢時，對 2" 內看得到的一名敵人造成 D3 傷害（折磨者 D6）。', 'Auto: when a Mutant or Torment is incapacitated, D3 damage (D6 for a Torment) to an enemy visible within 2".'),
    ff('unleashDaemonCC', '釋放惡魔', 'Unleash the Daemon', '突變者或折磨者啟動中：本次可以近戰兩次，其中一次免費。', 'During a Mutant\'s or Torment\'s activation: it can perform two Fight actions, one of them free.'),
  ],
  celestianInsidiants: [
    ff('unshakeablePursuit', '不屈追擊', 'Unshakeable Pursuit', '友方啟動中：本次啟動無視 Move 的變化；激勵中再 +1"。', 'During a friendly\'s activation: ignore changes to its Move this activation; +1" if it\'s inspiring.'),
    ff('ferventHate', '狂熱仇恨', 'Fervent Hate', '攻擊非帝國的敵人：這次序列武器「無休」；敵人是混沌或靈能者時改為「毫不留情」。', 'Attacking a non-Imperium enemy: Ceaseless this sequence; Relentless instead against Chaos or a psyker.'),
    ff('gloryMartyrs', '榮耀歸於殉道者', 'Glory to the Martyrs', '自動：友方在近戰中殘廢時，先用一顆未結算的成功打擊對手；若因此使對手殘廢，它變為激勵並觸發殉道。', 'Auto: when a friendly is incapacitated in a fight, it strikes with an unresolved success first; if that incapacitates the enemy it becomes inspiring and Martyrdom applies.'),
    ff('faithFury', '信仰與怒火', 'Faith & Fury', '近戰時以暴擊打擊對手後，對它 2" 內看得到的其他敵人各造成 D3 傷害。', 'Fighting: after a critical strike, D3 damage to each other enemy visible within 2" of it.'),
  ],
  canoptekCircle: [
    ff('sacrificialThrall', '犧牲奴僕', 'Sacrificial Thrall', '自動：地占術士被選為射擊或近戰目標時，改由它 3" 內看得到的另一名冥工機械承受（爆炸、洪流無效）。', 'Auto: when the Geomancer is picked as a Shoot or Fight target, another Canoptek visible within 3" of it becomes the target instead (not vs Blast/Torrent).'),
    ff('shieldFlare', '護盾閃焰', 'Shield Flare', '自動：攻擊骰對友方造成普通傷害時，若矩陣擋在中間或友方在矩陣內，無視這次傷害。', 'Auto: when an attack die inflicts Normal Dmg on a friendly with your matrix in the way or while it\'s within it, ignore that damage.'),
    ff('nodalResponse', '節點回應', 'Nodal Response', '友方冥工之環特工啟動中、行動前或後使用：改變本回合已用的一個策略計謀（只補差額 CP），或現在使用一個策略計謀（照常付 CP）。', 'During a friendly Canoptek Circle activation, before or after an action: change one strategy ploy used this turning point (pay only extra CP), or use a strategy ploy now (pay its CP).'),
    ff('animateNodes', '驅動方尖碑節點', 'Animate Obelisk Nodes', '輪到你啟動或反應時，改為移動任意數量方尖碑節點，合計最多 6"（每段距離進位到整吋）。之後對手照常行動。', 'When it is your turn to activate or counteract: move any number of obelisk nodes up to 6" combined instead (each distance rounded up), then your opponent activates as normal.'),
  ],
  broodBrothers: [
    ff('ruthlessCoord', '無情協調', 'Ruthless Coordination', '友方射擊選目標時：若另一名看得到目標、不在敵人控制範圍內的友方看目標時沒有掩護，目標不能保留掩護豁免。', 'When a friendly selects a target to shoot: if another friendly (not in enemy control range) sees the target with no cover, the target cannot retain cover saves.'),
    ff('insidious', '陰險', 'Insidious', '自動（第一回合以外）：一次啟動結束後，一名敵人無法瞄準的友方免費衝刺，結束時敵人也無法瞄準它（電腦會往目標點移動）。', 'Auto (not in TP1): after an activation, a friendly no enemy can target makes a free Dash, ending where no enemy can target it (towards an objective).'),
    ff('unquestioningLoyalty', '無條件忠誠', 'Unquestioning Loyalty', '自動：友方領袖被選為射擊或近戰目標時，改由它 3" 內看得到的另一名友方兵員（非領袖）承受（爆炸、洪流無效；老兵時 0CP）。', 'Auto: when a friendly Leader is picked as a Shoot or Fight target, another friendly Broodguard (not a Leader) visible within 3" of it becomes the target instead (not vs Blast/Torrent; 0CP for the Veteran).'),
    ff('idolisation', '偶像崇拜', 'Idolisation', '友方（非領袖）在領袖或聖像守衛 6" 內攻擊時：一顆失敗當成普通成功，或一顆普通成功當成暴擊。', 'A friendly (not a Leader) within 6" of a Leader or the Iconward attacking: retain one fail as a normal success, or one normal as a critical.'),
  ],
  bladesOfKhaine: [
    ff('bladewind', '刃之風', 'Bladewind', '友方啟動中：本次啟動可以近戰兩次。', 'During a friendly\'s activation: it can perform two Fight actions.'),
    ff('starfall', '星落', 'Starfall', '友方啟動中：本次啟動可以射擊兩次。', 'During a friendly\'s activation: it can perform two Shoot actions.'),
    ff('fadingLight', '消逝之光', 'Fading Light', '友方啟動中：本次啟動撤退少 1AP。', 'During a friendly\'s activation: Fall Back costs 1 less AP.'),
    ff('contempt', '輕蔑', 'Contempt', '自動：敵人射擊友方時（已擲攻擊骰、重擲之前），這次攻擊不能重擲攻擊骰。', 'Auto: when an enemy shoots a friendly (after rolling, before re-rolls), it can\'t re-roll its attack dice that sequence.'),
  ],
  battleclade: [
    ff('remoteAccess', '遠端存取', 'Remote Access', '技術神甫啟動中（每次一次）：下一個任務動作可以用 4" 內、沒有敵人爭奪的標記（其他友方控制範圍內的敵人不算）；或開關 4" 內的門。', 'During a Tech-Priest\'s activation (once): its next mission action can use a marker within 4" that no enemy contests (ignoring enemies in control range of other friendlies), or Operate Hatch on an access point within 4".'),
    ff('systemExorcism', '系統驅魔', 'System Exorcism', '友方啟動時：移除一個對手施加在它身上的效果（APL 減少、中毒、燃燒標記或標記光），不能回復生命。', 'When a friendly activates: remove one effect your opponent applied to it (an APL loss, Poison, a Blaze token or Markerlights); no lost wounds come back.'),
    ff('servileSurrogacy', '奴僕代受', 'Servile Surrogacy', '自動：友方技術神甫被選為射擊或近戰目標時，3" 內看得到的一名僕從代替它（爆炸、洪流除外）。', 'Auto: when a friendly Tech-Priest is picked as the target to shoot or fight, a servitor visible within 3" of it takes its place (not against Blast or Torrent).'),
    ff('autoFerric', '自動鐵之祈求', 'Auto-Ferric Supplication', '自動：敵人射擊友方技術神甫時，這次攻擊忽略「穿甲」。', 'Auto: when an enemy shoots a friendly Tech-Priest, ignore Piercing for that attack.'),
  ],
  warpcoven: [
    ff('allIsDust', '萬物皆塵', 'All Is Dust', '自動：一顆對紅字星際戰士造成普通傷害的攻擊骰只造成 1 傷害。', 'Auto: one attack die inflicting Normal Dmg on a Rubric Marine inflicts 1 instead.'),
    ff('capricious', '多變的計畫', 'Capricious Plan', '巫師啟動中：免費衝刺一次（之前做過什麼都可以）。', 'During a Sorcerer\'s activation: a free Dash, whatever it did before.'),
    ff('mutantHerd', '變種獸群', 'Mutant Herd', '奸奇獸人啟動時：另選一名 2" 內看得到、準備好的友方奸奇獸人一起啟動（這裡在它之後馬上啟動）。', 'When a friendly Tzaangor is activated: another ready friendly Tzaangor visible within 2" activates with it (here, straight after it).'),
    ff('psychicCabal', '靈能秘會', 'Psychic Cabal', '巫師啟動時：從 9" 內看得到的另一名巫師借一個靈能專屬動作或靈能遠程武器到啟動結束（借走的武器對方本回合不能用；對方本回合已用過的武器不能借）。', 'When a friendly Sorcerer is activated: borrow a PSYCHIC unique action or PSYCHIC ranged weapon from another Sorcerer visible within 9" until the end of its activation (that one can\'t use a borrowed weapon this TP; you can\'t borrow one it used this TP).'),
  ],
};
for (const t of TEAMS) t.firefight = FIREFIGHT[t.id] || t.firefight || [];

// Blooded: the second list — four selections: an Enforcer or an Ogryn (two selections each), or two Troopers.
{
  const bl = TEAMS.find((t) => t.id === 'blooded'), T = (id) => bl.ops.find((o) => o.id === id);
  const entry = (ids) => [ids.join('+'), { name: { zh: ids.map((id) => T(id).name.zh).join(' + '), en: ids.map((id) => T(id).name.en).join(' + ') }, ops: ids }];
  const opts = [['enforcer'], ['ogryn'], ['trooper', 'trooper']];
  bl.packages = Object.fromEntries([['enforcer'], ['ogryn']].map((d, i) => [`blSel${i + 1}`, {
    name: { zh: `第二名單名額 ${i + 1}（兩個選擇）`, en: `Second list selection ${i + 1} (two selections)` },
    options: Object.fromEntries([entry(d), ...opts.filter((o) => o.join('+') !== d.join('+')).map(entry)]),
  }]));
}

// Wyrmblade: two Cult Agent selections (each counts as two), or two Neophyte Warriors in their place.
{
  const wb = TEAMS.find((t) => t.id === 'wyrmblade'), T = (id) => wb.ops.find((o) => o.id === id);
  const opts = [['kelermorph'], ['locus'], ['wbSniper'], ['wbTalon'], ['warrior', 'warrior'], ['warrior', 'warriorShotgun'], ['warriorShotgun', 'warriorShotgun']];
  const entry = (ids) => [ids.join('+'), { name: { zh: ids.map((id) => T(id).name.zh).join(' + '), en: ids.map((id) => T(id).name.en).join(' + ') }, ops: ids }];
  wb.packages = Object.fromEntries([['kelermorph'], ['locus']].map((d, i) => [`wbAgent${i + 1}`, {
    name: { zh: `教派特工名額 ${i + 1}`, en: `Cult Agent selection ${i + 1}` },
    options: Object.fromEntries([entry(d), ...opts.filter((o) => o.join('+') !== d.join('+')).map(entry)]),
  }]));
}

// Warpcoven: five selections, each a full operative or two Tzaangor (who count as half a selection each).
{
  const wc = TEAMS.find((t) => t.id === 'warpcoven'), T = (id) => wc.ops.find((o) => o.id === id);
  const full = ['destiny', 'warpfire', 'tempyrion', 'rubricGunner', 'rubricIcon', 'rubric'];
  const tz = ['champion', 'tzHorn', 'tzIcon', 'tzaangor', 'tzShield', 'tzPistol'];
  const opts = [...full.map((id) => [id]), ...tz.flatMap((a, i) => tz.slice(i).filter((b) => b !== a || T(a).wcWarrior).map((b) => [a, b]))];
  const entry = (ids) => [ids.join('+'), { name: { zh: ids.map((id) => T(id).name.zh).join(' + '), en: ids.map((id) => T(id).name.en).join(' + ') }, ops: ids }];
  const defaults = [['destiny'], ['warpfire'], ['rubricGunner'], ['rubric'], ['champion', 'tzaangor']];
  wc.packages = Object.fromEntries(defaults.map((d, i) => [`wcSel${i + 1}`, {
    name: { zh: `第 ${i + 1} 個名額`, en: `Selection ${i + 1}` },
    options: Object.fromEntries([entry(d), ...opts.filter((o) => o.join('+') !== d.join('+')).map(entry)]),
  }]));
}

// Blades of Khaine Aspect Techniques: 0CP, used like firefight ploys but only by an operative of the matching Aspect.
const tech = (aspect, id, zh, en, dzh, den) => ({ ...ff(id, zh, en, dzh, den), cp: 0, aspect, technique: true });
TEAMS.find((t) => t.id === 'bladesOfKhaine').techniques = [
  tech('da', 'avVigilance', '復仇者的警覺', 'Vigilance of the Avenger', '射擊時選手裡劍彈射器（或雙聯）：這次動作武器「致命 5+」。', 'Shooting with a shuriken catapult (or twin): Lethal 5+ until the end of the action.'),
  tech('da', 'avThousand', '千刃之死', 'Death of a Thousand Blades', '射擊時選手裡劍彈射器（或雙聯）：這次動作武器「洪流 2\"」（最多一個次要目標）。', 'Shooting with a shuriken catapult (or twin): Torrent 2" (no more than one secondary target).'),
  tech('da', 'avUnstinting', '堅定不移', 'Unstinting, Immovable', '自動：被射擊且擲出兩顆以上失敗的防禦骰時，丟掉一顆，把另一顆當成普通成功。', 'Auto: when shot and two or more defence dice fail, discard one to retain another as a normal success.'),
  tech('da', 'avRagingHeat', '垂死之焰的熾熱', 'Raging Heat of the Dying Flame', '啟動中：直到下次啟動，不受重傷造成的數值變化影響（武器也是）。', 'During its activation: until its next activation, ignore stat changes from being injured (weapons too).'),
  tech('hb', 'hbShriek', '殺戮尖嘯', 'Shriek-that-Kills', '射擊時可改用「殺戮尖嘯」：5 攻擊 3+ 1/2，射程 6"、飽和、搜尋（輕型）、昏迷、洪流 1"。', 'When shooting, it can use Shriek-that-kills: 5 Atk 3+ 1/2, Range 6", Saturate, Seek Light, Stun, Torrent 1".'),
  tech('hb', 'hbWoe', '悲嘆', 'The Woe', '自動：衝鋒後近戰使敵人殘廢、且已離開敵人控制範圍時，用剩下的衝鋒距離免費再衝鋒一次（這次啟動之前只能做過衝鋒與近戰）。', 'Auto: after a Charge, when it incapacitates the enemy in the Fight and is no longer in an enemy\'s control range, a free Charge with its remaining move (it did nothing but Charge and Fight before).'),
  tech('ss', 'ssEye', '天蠍之眼', 'Scorpion\'s Eye', '射擊時選手裡劍手槍：這次動作武器「搜尋（輕型）」。', 'Shooting with a shuriken pistol: Seek Light until the end of the action.'),
  tech('ss', 'ssMerciless', '無情打擊', 'Merciless Strikes', '近戰時：第一次以暴擊打擊後，這次序列近戰武器「震擊」。', 'Fighting: after its first critical strike, its melee weapon has Shock for the rest of the sequence.'),
  tech('ss', 'ssGloom', '與幽暗合一', 'One with the Gloom', '啟動中：直到下次啟動，隱蔽指令且在掩體中時不能被選為目標（2" 內除外）。', 'During its activation: until its next activation, while Concealed and in cover it can\'t be selected as a valid target (except within 2").'),
  tech('ss', 'ssFade', '打擊後隱沒', 'Strike and Fade', '自動：啟動中近戰使敵人殘廢、且 3" 內沒有敵人時，改為隱蔽指令並免費衝刺一次。', 'Auto: when it incapacitates an enemy while fighting during its activation and no enemy is within 3", it switches to Conceal and can Dash for free.'),
];
for (const t of TEAMS) t.techniques ||= [];

export const TEAM_MAP = Object.fromEntries([...TEAMS, NPO_TEAM].map((t) => [t.id, t]));

export const RULE_LABELS = {
  soulstrike: { zh: '靈魂打擊（防禦骰 ≤ APL；1 暴擊）', en: 'Soulstrike (defence ≤ APL; 1 critical)' },
  range: { zh: '射程', en: 'Range' },
  piercing: { zh: '穿甲', en: 'Piercing' },
  piercingCrits: { zh: '暴擊穿甲', en: 'Piercing Crits' },
  lethal: { zh: '致命', en: 'Lethal' },
  balanced: { zh: '平衡', en: 'Balanced' },
  ceaseless: { zh: '無休', en: 'Ceaseless' },
  rending: { zh: '撕裂', en: 'Rending' },
  brutal: { zh: '殘暴', en: 'Brutal' },
  heavy: { zh: '重型', en: 'Heavy' },
  ignoreCover: { zh: '無視掩護', en: 'Ignores cover' },
  saturate: { zh: '飽和', en: 'Saturate' },
  seekLight: { zh: '搜尋（輕型）', en: 'Seek Light' },
  silent: { zh: '無聲', en: 'Silent' },
  devastating: { zh: '毀滅', en: 'Devastating' },
  accurate: { zh: '精準', en: 'Accurate' },
  severe: { zh: '嚴厲', en: 'Severe' },
  torrent: { zh: '洪流', en: 'Torrent' },
  blast: { zh: '爆炸', en: 'Blast' },
  limited: { zh: '限用', en: 'Limited' },
  hot: { zh: '過熱', en: 'Hot' },
  seek: { zh: '搜尋', en: 'Seek' },
  fixedHit: { zh: '慣性阻尼（命中不受修正）', en: 'Inertial Dampener (Hit unchanged)' },
  noMarkerlight: { zh: '不受標記光影響', en: 'No Markerlight bonus' },
  psychic: { zh: '靈能', en: 'Psychic' },
  poison: { zh: '中毒', en: 'Poison' },
  toxic: { zh: '劇毒', en: 'Toxic' },
  shock: { zh: '震撼', en: 'Shock' },
  stun: { zh: '昏迷', en: 'Stun' },
  relentless: { zh: '毫不留情', en: 'Relentless' },
  punishing: { zh: '懲罰', en: 'Punishing' },
  firstShotOnly: { zh: '隱蔽陣地（只限第一次射擊）', en: 'Concealed Position (first Shoot only)' },
  salvo: { zh: '齊射', en: 'Salvo' },
  swipe: { zh: '橫掃', en: 'Swipe' },
  shield: { zh: '盾牌（一次格擋擋兩顆）', en: 'Shield (each block cancels two)' },
  hypersense: { zh: '超感（目標不會被遮擋）', en: 'Hypersense (no obscuring)' },
  bloodOffering: { zh: '血之獻祭（第一次暴擊打擊得血祭標記）', en: 'Blood Offering (first critical strike gains a Blooded token)' },
  repress: { zh: '鎮壓（反擊時先結算）', en: 'Repress (resolves first when retaliating)' },
  devSplash: { zh: '毀滅也波及目標周圍', en: 'Devastating also hits operatives within' },
  blaze: { zh: '烈焰（暴擊傷害後目標獲得烈焰標記）', en: 'Blaze (critical damage gives the target a Blaze token)' },
  rvPoison: { zh: '毒素（暴擊傷害後目標獲得你的毒素標記，啟動時受 D3 傷害）', en: 'Poison (critical damage gives the target your Poison token: D3 damage when it activates)' },
  crush: { zh: '碾壓（每次攻擊擲骰比大小，贏的差距加傷害，最多 3）', en: 'Crush (roll-off on each strike: the difference adds damage, max 3)' },
  rvVenom: { zh: '毒液彈', en: 'Venom bolt' },
  spMissile: { zh: '飛彈發射器', en: 'Missile launcher' },
  vsClaws: { zh: '爪', en: 'Claws' },
  xvSweep: { zh: '掃射', en: 'Sweeping' },
  vsNeutron: { zh: '中子武器（移動或飛行後本回合「穿甲 1」）', en: 'Neutron (Piercing 1 for the TP after moving or flying)' },
  vsFragment: { zh: '中子碎片（沒殺死但有攻擊骰結算時，目標獲得標記：啟動時每個標記受 D3 傷害）', en: 'Neutron Fragment (a surviving target gains a token: D3 damage per token when it activates)' },
  vsFallout: { zh: '中子轟炸（射擊後在主要目標控制範圍內放中子落塵標記）', en: 'Neutron Bombardment (a Neutron Fallout marker by the primary target after shooting)' },
  vsSkytorch: { zh: '天焰（只能在天焰突擊中使用）', en: 'Skytorch (only during Skytorch Assault)' },
  vdHumbling: { zh: '殘酷羞辱（命中後目標 Move -2"、命中變差 1）', en: 'Humbling Cruelty (a damaged target gets -2" Move and worse Hit)' },
  spSuppressive: { zh: '壓制射擊（敵人在 3" 內時 Atk -1）', en: 'Suppressive (enemies within 3" get -1 Atk)' },
  wreathed: { zh: '烈焰纏身（交戰中也能射擊自己周圍）', en: 'Wreathed (shoots around itself, even engaged)' },
  twinTorrent: { zh: '雙重洪流（兩個不同目標）', en: 'Twin Torrent (two different targets)' },
  rapid: { zh: '快速射擊', en: 'Rapid Fire' },
  siphon: { zh: '吸取生命', en: 'Siphon Life' },
  magnify: { zh: '放大（借技師／學徒的視角）', en: 'Magnify (through a Cryptek / Apprentek)' },
  headtaker: { zh: '獵頭（擊殺後回血並提升暴擊傷害）', en: 'Headtaker (kills heal and raise Critical Dmg)' },
  tactualHunter: { zh: '觸覺獵手（對已行動敵人第一次暴擊後追加打擊）', en: 'Tactual Hunter (extra strike after the first crit vs an expended enemy)' },
  viciousBlows: { zh: '兇殘重擊（主動近戰時無休）', en: 'Vicious Blows (Ceaseless when fighting)' },
  stalk: { zh: '潛行（控制範圍內有地形時致命 5+）', en: 'Stalk (Lethal 5+ with terrain in control range)' },
  mindburn: { zh: '心靈灼燒（暴擊傷害後目標命中變差 1）', en: 'Mindburn (a crit worsens the target\'s Hit by 1)' },
  detonate: { zh: '引爆（目標固定為鬼骷髏）', en: 'Detonate (the Gheistskull is the target)' },
  forceImpact: { zh: '衝擊力（衝鋒後殘暴）', en: 'Force Impact (Brutal after a Charge)' },
  wkExplosive: { zh: '爆炸物（交戰中也能用；目標固定是自己，沒有掩護、不會被遮擋）', en: 'Explosive (usable while engaged; it is always its own primary target, no cover, not obscured)' },
  wkDetonate: { zh: '引爆（第一次造成傷害時，對目標與它 1" 內所有特工各造成 D6+6，暴擊 2D6+6，然後動作結束；不能減免）', en: 'Detonate (the first time it would inflict damage: D6+6 to the target and every operative within 1" of it, 2D6+6 on a crit, then the action ends; cannot be reduced)' },
  wkPulsa: { zh: '脈衝（不選目標：在目標位置放脈衝標記，1 點＋每顆成功 1 點（最多 +3）；完全在範圍內的特工各受 D3）', en: 'Pulsa (no target: the Pulsa marker goes where the target is with 1 point + 1 per success (max +3); D3 to each operative wholly within)' },
  terrorchem: { zh: '恐懼毒（暴擊傷害後目標得毒標記，每次啟動受 D3）', en: 'Terrorchem (critical damage gives the target a token; D3 each time it activates)' },
  wkSmash: { zh: '粉碎（每次打擊可把敵人撞退 1"，自己跟上 1"）', en: 'Smash (each strike can knock the enemy back 1" and follow 1")' },
};

/** A ranged weapon with "bolt" in its name (Angels of Death rules). */
export const isBoltWeapon = (w) => w.type === 'ranged' && /bolt/i.test(w.name.en);
