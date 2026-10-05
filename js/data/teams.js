import { ELDAR_TEAMS } from './eldar.js';

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
//   ceaseless       re-roll attack dice that rolled 1
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
// Machines carry no weapons; this stands in so they can be fought (they never retaliate).
const noWeapon = W('noWeapon', '（無武器）', '(no weapon)', 'melee', 0, 6, 0, 0);

// ---- Phobos Strike Team ----
const marksmanCarbine = W('marksmanCarbine', '神射手爆彈卡賓槍', 'Marksman bolt carbine', 'ranged', 4, 3, 3, 4, { lethal: 5 });
const fistsPh = W('fistsPh', '徒手格鬥', 'Fists', 'melee', 4, 3, 3, 4);
const stalkerCarbine = W('stalkerCarbine', '潛獵神射手爆彈卡賓槍', 'Stalker marksman bolt carbine', 'ranged', 4, 2, 3, 4, { lethal: 5, piercing: 1 });
const siBoltPistol = W('siBoltPistol', '特製爆彈手槍', 'Special issue bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8, piercing: 1 });
const combatKnife = W('combatKnife', '戰鬥匕首', 'Combat knife', 'melee', 5, 3, 4, 5);

// ---- Warpcoven ----
// Twist of Fate (Boon of Tzeentch, Sorcerer of Destiny): its PSYCHIC ranged weapons have Piercing Crits 1.
const doombolt = W('doombolt', '末日彈', 'Doombolt', 'ranged', 4, 3, 4, 2, { psychic: true, devastating: 2, lethal: 5, piercingCrits: 1 });
const infernoPistol = W('infernoPistol', '煉獄爆彈手槍', 'Inferno bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8, piercing: 1 });
const forceStave = W('forceStave', '力場法杖', 'Force stave', 'melee', 4, 3, 4, 6, { psychic: true, shock: true });
// Incorporeal Sight (Boon, Sorcerer of Warpfire): its ranged weapons have Saturate and enemies can't be obscured.
const firestorm = W('firestorm', '火焰風暴', 'Firestorm', 'ranged', 5, 4, 2, 3, { psychic: true, saturate: true, seekLight: true, torrent: 2 });
const mindburn = W('mindburn', '心靈灼燒', 'Mindburn', 'ranged', 5, 4, 1, 1, { psychic: true, lethal: 5, saturate: true, seekLight: true, mindburn: true });
const khopesh = W('khopesh', '普羅斯佩羅鐮劍', 'Prosperine khopesh', 'melee', 5, 3, 4, 6, { lethal: 5 });
const soulreaperFocused = W('soulreaperFocused', '奪魂砲（集中）', 'Soulreaper cannon (focused)', 'ranged', 5, 3, 4, 5, { piercing: 1 }, 'soulreaper');
const soulreaperSweeping = W('soulreaperSweeping', '奪魂砲（掃射）', 'Soulreaper cannon (sweeping)', 'ranged', 4, 3, 4, 5, { piercing: 1, torrent: 1 }, 'soulreaper');
const infernoBoltgun = W('infernoBoltgun', '煉獄爆彈槍', 'Inferno boltgun', 'ranged', 4, 3, 3, 4, { piercing: 1 });
const fistsWC = W('fistsWC', '徒手格鬥', 'Fists', 'melee', 3, 3, 3, 4);
const greatblade = W('greatblade', '巨刃', 'Greatblade', 'melee', 4, 3, 4, 5, { lethal: 5, rending: true });
const tzaangorBlades = W('tzaangorBlades', '奸奇獸人雙刃', 'Tzaangor blades', 'melee', 4, 4, 4, 5, { balanced: true });

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
// Vicious Blows: Ceaseless when fighting (not when retaliating).
const mancrusher = W('mancrusher', '碎人錘', 'Mancrusher', 'melee', 4, 4, 5, 5, { brutal: true, viciousBlows: true });

// ---- Exaction Squad ----
// Repress: each block cancels two unresolved successes; when retaliating it resolves the first die.
const shotpistolPE = W('shotpistolPE', '霰彈手槍', 'Shotpistol', 'ranged', 4, 3, 3, 3, { range: 8 });
const dominatorMaul = W('dominatorMaul', '統治者錘與突擊盾', 'Dominator maul & assault shield', 'melee', 4, 3, 4, 4, { lethal: 5, shock: true, shield: true, repress: true });
const combatShotgunClose = W('combatShotgunClose', '戰鬥霰彈槍（近距離）', 'Combat shotgun (close range)', 'ranged', 4, 3, 4, 4, { range: 6 }, 'combatShotgun');
const combatShotgunLong = W('combatShotgunLong', '戰鬥霰彈槍（遠距離）', 'Combat shotgun (long range)', 'ranged', 4, 5, 2, 2, {}, 'combatShotgun');
const baton = W('baton', '鎮壓警棍', 'Repression baton', 'melee', 3, 4, 2, 3);
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

const shockMaulShield = W('shockMaulShield', '電擊錘與突擊盾', 'Shock maul & assault shield', 'melee', 4, 4, 4, 4, { shock: true, shield: true, repress: true });

const op = (id, zh, en, stats, weapons, count = 1) => ({ id, name: { zh, en }, ...stats, weapons, count });

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
        zh: '每次啟動可執行兩次「射擊」或兩次「近戰」。兩次射擊中至少一次要用爆彈武器；若兩次都用狙擊步槍或重型爆彈槍，第二次多花 1AP。不論指令為何都能反擊。開戰前選擇主要與次要戰團戰術。',
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
      { id: 'sharpshooter', name: { zh: '神射手', en: 'Sharpshooter' }, desc: { zh: '本次啟動未移動、衝鋒或撤退時，爆彈武器獲得「精準 1」與「嚴厲」。', en: 'If it hasn\'t Repositioned, Charged or Fallen Back this activation, its bolt weapons have Accurate 1 and Severe.' } },
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
        desc: { zh: '本回合友方無視受傷造成的數值變化。', en: 'This TP, friendly operatives ignore stat changes from being injured.' } },
    ],
    ops: [
      op('sgt', '仲裁者士官', 'Intercessor Sergeant', { apl: 3, move: 6, save: 3, wounds: 15, base: 32, doctrineWarfare: ['docDevastator', 'docTactical'] }, [boltRifle, chainswordSgt]),
      op('assault', '突襲仲裁者戰士', 'Assault Intercessor Warrior', { apl: 3, move: 6, save: 3, wounds: 14, base: 32 }, [heavyBoltPistol, chainswordA]),
      op('grenadier', '突襲仲裁者擲彈兵', 'Assault Intercessor Grenadier', { apl: 3, move: 6, save: 3, wounds: 14, base: 32 }, [heavyBoltPistol, fragGrenade, krakGrenade, chainswordA]),
      op('gunner', '仲裁者槍手', 'Intercessor Gunner', { apl: 3, move: 6, save: 3, wounds: 14, base: 32 }, [boltRifle, auxFrag, auxKrak, fistsA]),
      op('heavy', '重裝仲裁者槍手', 'Heavy Intercessor Gunner', { apl: 3, move: 5, save: 3, wounds: 18, base: 40 }, [boltPistol, hbFocused, hbSweeping, fistsA]),
      op('sniper', '清除者狙擊手', 'Eliminator Sniper', { apl: 3, move: 7, save: 3, wounds: 12, base: 32, camoCloak: true, optics: true }, [boltPistol, sniperExec, sniperHyper, sniperMortis, fistsA]),
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
        zh: '（官方：友方在隱蔽指令下也能「衝鋒」。目前依基本規則停用：隱蔽一律不能衝鋒。）',
        en: '(Official: friendly operatives can Charge while Concealed. Currently disabled by the basic rules: Concealed operatives never Charge.)',
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
    ],
    ops: [
      op('nob', '頭目', 'Boss Nob', { apl: 3, move: 6, save: 5, wounds: 14, base: 32, krumpin: true, support: 'getItDun' }, [slugga, powerKlaw]),
      op('breacha', '破門小子', 'Breacha Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 32 }, [slugga, breachaRam]),
      op('burna', '噴火小子', 'Burna Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 32 }, [burnaStd, burnaDeluge, fistsO]),
      op('comms', '通訊小子', 'Comms Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, support: 'listenIn' }, [shokkaPistol, fistsO]),
      op('dakka', '達卡小子', 'Dakka Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, dakkaDash: true }, [dakkaShort, dakkaLong, fistsO]),
      op('rokkit', '火箭小子', 'Rokkit Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 32 }, [rokkitAimed, rokkitMobile, fistsO]),
      op('slasha', '劈砍小子', 'Slasha Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, datAllYouGot: true }, [throwingKnives, twinChoppas]),
      op('snipa', '狙擊小子', 'Snipa Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 32 }, [snipaConcealed, snipaStationary, snipaSweeping, fistsO]),
      op('boy', '小子', 'Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, wotNotz: true }, [slugga, choppa], 2),
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
      // Shas'ui Art of War: once per battle each, one per turning point, while the Shas'ui is in the killzone.
      { id: 'montka', group: 'artOfWar', oncePerBattle: true, needs: 'shasui', cp: 0, name: { zh: '兵法：蒙卡', en: "Art of War: Mont'ka" },
        desc: { zh: '本回合友方 Move +1"。（整場一次，需要小隊長在場）', en: 'This TP, friendly operatives get +1" Move. (Once per battle; needs the Shas\'ui)' } },
      { id: 'kauyon', group: 'artOfWar', oncePerBattle: true, needs: 'shasui', cp: 0, name: { zh: '兵法：考陽', en: 'Art of War: Kauyon' },
        desc: { zh: '本回合隱蔽指令的友方啟動時可免費執行標記光。（整場一次，需要小隊長在場）', en: 'This TP, friendly operatives with a Conceal order can Markerlight for free. (Once per battle; needs the Shas\'ui)' } },
    ],
    ops: [
      op('shasui', '鈦衛小隊長', "Shas'ui", { apl: 2, move: 6, save: 5, wounds: 8, base: 25, markerlight: 1 }, [pulseCarbineSgt, gunButtSgt]),
      op('grenadier', '突擊擲彈兵', 'Assault Grenadier', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, markerlight: 1 }, [fusionGrenade, fragGrenadeT, krakGrenadeT, pulseCarbine, fistsT]),
      op('blooded', '老兵', 'Blooded', { apl: 2, move: 6, save: 5, wounds: 8, base: 25, markerlight: 1, veteran: true }, [suppressedCarbine, bionicArm]),
      op('comms', '通訊專家', 'Comms Specialist', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, markerlight: 1, signal: true }, [pulseCarbine, fistsC]),
      op('controller', '無人機操控員', 'Drone Controller', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, markerlight: 1, droneController: true }, [pulseCarbine, fistsT]),
      op('marksman', '神射手', 'Marksman', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [marksmanRail, marksmanDart, fistsT]),
      op('medic', '醫療技師', 'Medical Technician', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, markerlight: 1, medic: true, medikit: true }, [pulseCarbine, fistsT]),
      op('transpectral', '跨光譜干擾兵', 'Transpectral Interference', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, markerlight: 1, systemJam: true, multiVision: true }, [pulseCarbine, fistsT]),
      op('ionExpert', '武器專家（離子）', 'Weapons Expert (ion)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [ionStandard, ionOvercharge, fistsT]),
      op('railExpert', '武器專家（軌道）', 'Weapons Expert (rail)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [railRifle, fistsT]),
      op('gunDrone', 'MV1 槍械無人機', 'MV1 Gun Drone', { apl: 2, move: 6, save: 4, wounds: 7, base: 32, drone: true, actionsOnly: ['charge', 'dash', 'fallBack', 'fight', 'reposition', 'shoot'] }, [twinPulseCarbine, ram]),
      op('markerDrone', 'MV7 標記無人機', 'MV7 Marker Drone', { apl: 2, move: 6, save: 4, wounds: 7, base: 32, markerlight: 2, drone: true, actionsOnly: ['charge', 'dash', 'fallBack', 'fight', 'markerlight', 'reposition'] }, [ram]),
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
        zh: '中毒：用有「中毒」的武器造成傷害時，敵人獲得中毒標記；有中毒標記的特工每次啟動時受到 1 傷害。劇毒：對行動開始時已中毒的敵人，武器兩個傷害值都 +1。令人作嘔的韌性：每顆攻擊骰造成 3 以上傷害時擲 D6，4+ 傷害 -1。阿斯塔特：每次啟動可兩次射擊（至少一次用爆彈手槍、爆彈槍或靈能武器，同一把靈能遠程武器不能用兩次）或兩次近戰；不論指令都能反擊。',
        en: 'Poison: damaging an enemy with a Poison weapon gives it a Poison token; an operative with one takes 1 damage whenever it is activated. Toxic: +1 to both Dmg against an enemy poisoned at the start of the action. Disgustingly Resilient: whenever an attack die inflicts 3+ damage, roll a D6: on a 4+ it deals 1 less. Astartes: two Shoots (one with a bolt pistol, boltgun or Psychic weapon; not the same Psychic ranged weapon twice) or two Fights per activation; can counteract regardless of order.',
      },
    },
    ploys: [
      { id: 'contagion', cp: 1, name: { zh: '傳染', en: 'Contagion' },
        desc: { zh: '本回合敵人若中毒且在友方 3" 內可見，或在掌旗手 3" 內可見：Move -2"、武器命中變差 1（不與受傷累加）。掌旗手在敵方領域時 0CP。', en: 'This TP, an enemy that is poisoned and visible within 3" of a friendly operative, or visible within 3" of the Icon Bearer, gets -2" Move and worsens its weapons\' Hit by 1 (not cumulative with injured). 0CP while the Icon Bearer is in enemy territory.' } },
      { id: 'lumbering', cp: 1, name: { zh: '笨重死神', en: 'Lumbering Death' },
        desc: { zh: '本回合友方在本次啟動移動不超過 3" 時射擊或近戰，以及反擊時，武器獲得「無休」。', en: 'This TP, friendly weapons have Ceaseless when shooting or fighting in an activation in which the operative moved no more than 3", and when retaliating.' } },
    ],
    ops: [
      op('champion', '瘟疫戰士冠軍', 'Plague Marine Champion', { apl: 3, move: 5, save: 3, wounds: 15, base: 32, blessing: true }, [plasmaPistolStd, plasmaPistolSup, plagueSword]),
      op('bombardier', '瘟疫戰士轟炸兵', 'Plague Marine Bombardier', { apl: 3, move: 5, save: 3, wounds: 14, base: 32 }, [boltgunPM, blightGrenade, krakGrenadePM, fistsPM]),
      op('fighter', '瘟疫戰士鬥士', 'Plague Marine Fighter', { apl: 3, move: 5, save: 3, wounds: 14, base: 32, flail: true }, [boltPistolPM, flail]),
      op('heavyGunner', '瘟疫戰士重火力手', 'Plague Marine Heavy Gunner', { apl: 3, move: 5, save: 3, wounds: 14, base: 32 }, [boltPistolPM, plagueSpewer, fistsPM]),
      op('icon', '瘟疫戰士掌旗手', 'Plague Marine Icon Bearer', { apl: 3, move: 5, save: 3, wounds: 14, base: 32, iconBearer: true }, [boltPistolPM, plagueKnife5]),
      op('caster', '惡毒瘟疫術士', 'Malignant Plaguecaster', { apl: 3, move: 5, save: 3, wounds: 14, base: 32, miasma: true, vitality: true }, [entropy, plagueWind, corruptedStaff]),
    ],
  },
  {
    id: 'farstalkers',
    name: { zh: '遠獵者', en: 'Farstalker Kinband' },
    color: '#b9772f',
    style: { zh: '射擊隊・狩獵・靈活', en: 'Shooting · Hunters · Agile' },
    blurb: {
      zh: '12 名克魯特獵人與獵犬。可在策略階段與反擊時調整指令，用「呼喚獵殺」鎖定獵物，再以各式專家武器圍獵。',
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
        zh: '策略階段輪到你選計謀時，可改變最多 3 名不在敵人控制範圍內的友方指令。輪到你反擊時，也可以改成變更 1 名友方的指令（仍算你的反擊，但不算該特工的反擊）。',
        en: 'When you choose ploys in the Strategy phase, change the order of up to three friendly operatives not within enemy control range. When it\'s your turn to counteract, you can instead change one friendly operative\'s order (it counts as your counteract, not that operative\'s).',
      },
    },
    ploys: [
      { id: 'prey', cp: 1, name: { zh: '獵物', en: 'Prey' },
        desc: { zh: '本回合友方在本次啟動未移動、衝鋒或撤退時射擊，遠程武器獲得「平衡」與「嚴厲」（已有平衡則改為「無休」與「嚴厲」）。', en: 'This TP, a friendly operative shooting in an activation without Reposition, Charge or Fall Back has Balanced and Severe (Ceaseless and Severe if already Balanced).' } },
      { id: 'cutThroats', cp: 1, name: { zh: '割喉', en: 'Cut-throats' },
        desc: { zh: '本回合友方近戰武器 ATK +1（最多 5）。', en: 'This TP, friendly melee weapons get +1 Atk (max 5).' } },
      { id: 'rogue', cp: 1, name: { zh: '遊俠', en: 'Rogue' },
        desc: { zh: '本回合友方被射擊時無視「飽和」；若能保留掩護豁免，可多保留 1 顆，或把 1 顆當成暴擊豁免。', en: 'This TP, friendly operatives being shot ignore Saturate; if they can retain cover saves, retain one more, or one as a critical success.' } },
    ],
    ops: [
      op('killBroker', '獵殺掮客', 'Kroot Kill-broker', { apl: 2, move: 6, save: 5, wounds: 9, base: 32, callTheKill: true }, [krootRifleKB, ritualBlade]),
      op('bowHunter', '弓獵者', 'Kroot Bow-hunter', { apl: 2, move: 6, save: 5, wounds: 8, base: 28, energise: true }, [bowFused, bowGlide, bowVoltaic, krootBlade]),
      op('coldBlood', '冷血者', 'Kroot Cold-blood', { apl: 2, move: 6, save: 5, wounds: 9, base: 28, coldBlooded: true, hardyCrit: true }, [krootRifleCB, krootBlade]),
      op('cutSkin', '割膚者', 'Kroot Cut-skin', { apl: 2, move: 6, save: 5, wounds: 8, base: 28, viciousDuellist: true, savageAssault: true }, [cutSkinBlades]),
      op('hound', '克魯特獵犬', 'Kroot Hound', { apl: 2, move: 8, save: 5, wounds: 7, base: 28, badTempered: true, actionsOnly: ['charge', 'dash', 'fallBack', 'fight', 'reposition'] }, [rippingFangs], 2),
      op('heavyGunner', '重火力手', 'Kroot Heavy Gunner', { apl: 2, move: 6, save: 5, wounds: 8, base: 28 }, [londaxi, krootBlade]),
      op('longSight', '遠視者', 'Kroot Long-sight', { apl: 2, move: 6, save: 5, wounds: 8, base: 28, longSight: true }, [huntingConcealed, huntingMobile, huntingStationary, krootBlade]),
      op('pistolier', '雙槍手', 'Kroot Pistolier', { apl: 2, move: 6, save: 5, wounds: 8, base: 28 }, [pistolsFocused, pistolsSalvo, krootBlade]),
      op('stalker', '潛獵者', 'Kroot Stalker', { apl: 2, move: 6, save: 5, wounds: 8, base: 28, concealCharge: true, stealthAttack: true }, [scattergun, stalkerBlade]),
      op('tracker', '追蹤者', 'Kroot Tracker', { apl: 2, move: 6, save: 5, wounds: 8, base: 28, support: 'eyeAbove', pechra: true }, [krootRifle, krootBlade]),
      op('warrior', '克魯特戰士', 'Kroot Warrior', { apl: 2, move: 6, save: 5, wounds: 8, base: 28 }, [krootRifle, krootBlade]),
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
        zh: '策略階段，看守長可下達一道衛兵命令給 6" 內的友方（看守長倒下後由心腹代替），效果到本回合結束：瞄準！（遠程武器「無休」，迫擊砲除外）、上刺刀！（近戰武器「無休」）、固守！（被射擊且能保留掩護豁免時，可重擲某一點數的所有防禦骰）、快快快！（轉移 Move +1"）。通訊兵可轉達命令給全隊（之後自己 APL -1）。步兵行動完後，必須接著啟動另一名步兵，再換對手。',
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
    ],
    ops: [
      op('watchmaster', '看守長', 'Watchmaster', { apl: 2, move: 6, save: 5, wounds: 8, base: 25, watchmaster: true }, [plasmaPistolWM, plasmaPistolWMs, powerWeaponWM]),
      op('confidant', '心腹', 'Confidant', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, confidant: true }, [boltPistolCF, chainswordCF]),
      op('bruiser', '打手', 'Bruiser', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, bruiser: true }, [lasgunDK, trenchClub]),
      op('gunnerPlasma', '槍手（等離子）', 'Gunner (plasma)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [plasmaGunDK, plasmaGunDKs, bayonetDK]),
      op('gunnerMelta', '槍手（熱熔）', 'Gunner (melta)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [meltagunDK, bayonetDK]),
      op('medic', '醫療兵', 'Medic', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, medic: true, medikit: true }, [lasgunDK, bayonetDK]),
      op('sniper', '狙擊手', 'Sniper', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [longLasConcealed, longLasMobile, longLasStationary, bayonetDK]),
      op('spotter', '觀測手', 'Spotter', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, support: 'spot' }, [lasgunDK, mortarBarrage, bayonetDK]),
      op('vox', '通訊兵', 'Vox-operator', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, signal: true, relay: true }, [lasgunDK, bayonetDK]),
      op('zealot', '狂信者', 'Zealot', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, emperorProtects: true, uplifting: true }, [lasgunDK, bayonetDK]),
      op('trooper', '步兵', 'Trooper', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, groupAct: 'trooper' }, [lasgunDK, bayonetDK], 4),
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
        zh: '敵人擊倒友方時，獲得一個宿怨標記（整場保留）。友方射擊、近戰或反擊有宿怨標記的敵人時，每個標記可把一顆普通成功當成暴擊保留（包括精準保留的成功）。',
        en: 'An enemy that incapacitates a friendly operative gains a Grudge token for the battle. Whenever a friendly operative shoots, fights or retaliates against an enemy with Grudge tokens, for each token one normal success can be retained as a critical success (including ones retained through Accurate).',
      },
    },
    ploys: [
      { id: 'wroughtDefence', cp: 1, name: { zh: '精工防禦', en: 'Wrought Defence' },
        desc: { zh: '本回合友方被射擊時，若防禦骰只有 1 顆以下成功，可把一顆失敗當成普通成功。', en: 'This TP, when a friendly operative is shot and rolls one or fewer successes, one fail is retained as a normal success.' } },
      { id: 'proximateFire', cp: 1, name: { zh: '近距火力', en: 'Proximate Firepower' },
        desc: { zh: '本回合友方射擊 6" 內的敵人時，遠程武器命中改善 1（最佳 3+）。', en: 'This TP, friendly ranged weapons improve their Hit by 1 (to 3+) when shooting an enemy within 6".' } },
    ],
    ops: [
      op('theyn', '領主', 'Theyn', { apl: 2, move: 5, save: 3, wounds: 9, base: 28, eyeOfAncestors: true, weavefield: true }, [etacarnPistol, plasmaWeaponTh]),
      op('dozr', '破拳手', 'Dôzr', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, brawler: true, knux: true }, [autochPistol, knux]),
      op('medic', '戰地醫療兵', 'Field Medic', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, medic: true, medikit: true }, [boltRevolver, plasmaKnifeMed]),
      op('grenadier', '擲彈兵', 'Grenadier', { apl: 2, move: 5, save: 3, wounds: 8, base: 28 }, [autochPistol, c8Charge, fragHK, krakHK, fistsHK]),
      op('gunner', '槍手（轉管砲）', 'Gunner (rotary cannon)', { apl: 2, move: 5, save: 3, wounds: 8, base: 28 }, [rotaryFocused, rotarySweeping, fistsHK]),
      op('jumpPack', '噴射背包戰士', 'Jump Pack Warrior', { apl: 2, move: 8, save: 3, wounds: 8, base: 28, jumpPack: true }, [autochPistol, plasmaWeaponJP]),
      op('kinlynk', '通聯兵', 'Kinlynk', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, signalAny: true, jamToken: true }, [autochBolter, fistsHK]),
      op('kognitaar', '智械參謀', 'Kognitâar', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, tactician: true }, [autochBolter, fistsHK]),
      op('lokatr', '探測兵', 'Lokâtr', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, support: 'spot', panScan: true }, [ionBlaster, fistsHK]),
      op('lugger', '搬運工', 'Lugger', { apl: 2, move: 5, save: 3, wounds: 8, base: 28, wellSupplied: true, gotIt: true }, [autochBolter, fistsHK]),
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
    ops: [
      op('sgt', '士官長', 'Sergeant-at-Arms', { apl: 2, move: 6, save: 4, wounds: 9, base: 25, commandBreach: true }, [heirloomPistol, powerWeaponNB]),
      op('axejack', '斧手', 'Axejack', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, emboldened: true }, [autopistolNB, powerWeaponNB]),
      op('endurant', '重盾兵', 'Endurant', { apl: 2, move: 4, save: 2, wounds: 11, base: 28, disengage: true }, [heavyShotgunClose, heavyShotgunLong, shieldBash]),
      op('grenadier', '擲彈兵', 'Grenadier', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, voidGrenadier: true }, [demoCharge, fragNB, krakNB, shotgunClose, shotgunLong, hatchet]),
      op('gunnerVolley', '槍手（雷射齊射）', 'Gunner (las-volley)', { apl: 2, move: 6, save: 4, wounds: 9, base: 28 }, [lasVolleyFocused, lasVolleySweeping, gunButtNB]),
      op('gunnerMelta', '槍手（熱熔）', 'Gunner (meltagun)', { apl: 2, move: 6, save: 4, wounds: 9, base: 28 }, [meltagunNB, gunButtNB]),
      op('hatchcutter', '切割手', 'Hatchcutter', { apl: 2, move: 6, save: 4, wounds: 8, base: 25 }, [autopistolNB, chainfist]),
      op('surveyor', '勘測員', 'Surveyor', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, surveyor: true, support: 'wayfind' }, [shotgunClose, shotgunLong, hatchet]),
      op('cat', 'C.A.T. 偵察車', 'C.A.T. Unit', { apl: 2, move: 8, save: 5, wounds: 5, base: 25, catUnit: true, machine: true, expendable: true, small: true, noRetaliate: true, support: 'spot', actionsOnly: ['charge', 'dash', 'fallBack', 'reposition', 'spot'] }, [noWeapon]),
      op('voidJammer', '虛空干擾員', 'Void-jammer', { apl: 2, move: 6, save: 4, wounds: 8, base: 25, pulse: true }, [detonator, shotgunClose, shotgunLong, hatchet]),
      op('gheistskull', '鬼骷髏', 'Gheistskull', { apl: 2, move: 8, save: 5, wounds: 5, base: 25, gheistskull: true, machine: true, expendable: true, small: true, noRetaliate: true, boost: true, actionsOnly: ['boost', 'charge', 'dash', 'fallBack', 'reposition'] }, [noWeapon]),
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
        zh: '阿斯塔特：每次啟動可兩次射擊（至少一次用爆彈武器）或兩次近戰；不論指令都能反擊。全頻擾亂器（策略階段）：選一名被友方滲透者看到、或在干擾兵 6" 內的敵人，對手要先啟動等同場上滲透者數量的特工，它才能啟動（或它是最後一名）。恐懼：掠奪者 3" 內的敵人撿標記與任務動作多花 1AP，爭奪標記時 APL -1。多光譜陣列：突襲者射擊時敵人不會被遮擋。',
        en: 'Astartes: two Shoots (one with a bolt weapon) or two Fights per activation; can counteract regardless of order. Omni-scrambler (Strategy phase): an enemy visible to a friendly Infiltrator or within 6" of the Voxbreaker can\'t activate until your opponent has activated as many operatives as you have Infiltrators (or it\'s the last). Terror: enemies within 3" of a Reiver pay +1AP for Pick Up and mission actions and count 1 lower when contesting markers. Multi-spectrum Array: enemies can\'t be obscured when an Incursor shoots.',
      },
    },
    ploys: [
      { id: 'guerrilla', cp: 1, name: { zh: '游擊戰', en: 'Guerrilla Warfare' },
        desc: { zh: '本回合友方可執行獨特動作「游擊戰」(1AP，不在敵人控制範圍內)：改變自己的指令。', en: 'This TP, friendly operatives can perform the unique action Guerrilla Warfare (1AP, not within enemy control range): change its order.' } },
      { id: 'lethalAssaults', cp: 1, name: { zh: '致命突擊', en: 'Lethal Assaults' },
        desc: { zh: '本回合友方近戰時，近戰武器「平衡」；若本次啟動衝鋒過，再加「致命 5+」。', en: 'This TP, friendly melee weapons have Balanced when fighting; also Lethal 5+ in an activation in which it Charged.' } },
      { id: 'noFear', cp: 1, name: { zh: '無所畏懼', en: 'And They Shall Know No Fear' },
        desc: { zh: '本回合友方無視受傷造成的數值變化。', en: 'This TP, friendly operatives ignore stat changes from being injured.' } },
      { id: 'deadlyShots', cp: 1, name: { zh: '致命射擊', en: 'Deadly Shots' },
        desc: { zh: '本回合友方射擊時，若本次啟動沒有衝鋒／撤退／轉移，或目標不在掩體中且在 6" 外，遠程武器「平衡」。', en: 'This TP, friendly ranged weapons have Balanced when the shooter hasn\'t Charged, Fallen Back or Repositioned this activation, or the target isn\'t in cover and is more than 6" away.' } },
    ],
    ops: [
      op('sgt', '滲透者士官', 'Infiltrator Sergeant', { apl: 3, move: 7, save: 3, wounds: 13, base: 32, infiltrator: true }, [marksmanCarbine, fistsPh]),
      op('commsman', '滲透者通訊兵', 'Infiltrator Commsman', { apl: 3, move: 7, save: 3, wounds: 12, base: 32, infiltrator: true, oversight: true }, [marksmanCarbine, fistsPh]),
      op('helix', '滲透者螺旋修士', 'Infiltrator Helix Adept', { apl: 3, move: 7, save: 3, wounds: 12, base: 32, infiltrator: true, medic: true, medicD3: true, helix: true }, [marksmanCarbine, fistsPh]),
      op('voxbreaker', '滲透者干擾兵', 'Infiltrator Voxbreaker', { apl: 3, move: 7, save: 3, wounds: 12, base: 32, infiltrator: true, voxbreak: true, auspex: true }, [marksmanCarbine, fistsPh]),
      op('marksman', '突襲者神射手', 'Incursor Marksman', { apl: 3, move: 7, save: 3, wounds: 12, base: 32, incursor: true }, [stalkerCarbine, fistsPh]),
      op('reiver', '掠奪者戰士', 'Reiver Warrior', { apl: 3, move: 7, save: 3, wounds: 12, base: 32, terror: true, vanguard: true }, [siBoltPistol, combatKnife]),
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
        zh: '阿斯塔特（巫師與符文戰士）：每次啟動可兩次射擊或兩次近戰（兩次都用奪魂砲時第二次多 1AP；同一把靈能遠程武器不能用兩次）；不論指令都能反擊。奸奇的恩賜：每名巫師一個恩賜——命運巫師「命運扭轉」（靈能遠程武器暴擊穿甲 1），戰火巫師「虛體視覺」（遠程武器飽和、目標不會被遮擋）。符文戰士：附近 9" 沒有巫師時，啟動時 APL -1。',
        en: 'Astartes (Sorcerers and Rubric Marines): two Shoots (+1AP for the second if both use the soulreaper cannon; not the same Psychic ranged weapon twice) or two Fights per activation; can counteract regardless of order. Boons of Tzeentch: each Sorcerer has one — Destiny: Twist of Fate (Psychic ranged weapons Piercing Crits 1); Warpfire: Incorporeal Sight (ranged Saturate, enemies can\'t be obscured). Rubric Marines: -1 APL when activated unless a Sorcerer is within 9".',
      },
    },
    ploys: [
      { id: 'aetherialWarding', cp: 1, name: { zh: '以太守護', en: 'Aetherial Warding' },
        desc: { zh: '本回合友方被射擊時，有「穿甲 1」的武器改為「暴擊穿甲 1」。', en: 'This TP, when a friendly operative is shot, weapons with Piercing 1 have Piercing Crits 1 instead.' } },
      { id: 'savageHerd', cp: 1, name: { zh: '野蠻獸群', en: 'Savage Herd' },
        desc: { zh: '本回合友方奸奇獸人近戰武器「精準 1」；有友軍協助、或在巫師 6" 內可見時再加「嚴厲」。', en: 'This TP, friendly Tzaangor melee weapons have Accurate 1; also Severe when assisted, or when fighting visible within 6" of a Sorcerer.' } },
      { id: 'brotherhood', cp: 1, name: { zh: '巫師兄弟會', en: 'Brotherhood of Sorcerers' },
        desc: { zh: '本回合友方巫師的靈能武器「平衡」；9" 內還有另一名巫師時改為「無休」。', en: 'This TP, friendly Sorcerers\' Psychic weapons have Balanced, or Ceaseless instead if another Sorcerer is within 9".' } },
    ],
    ops: [
      op('destiny', '命運巫師', 'Sorcerer of Destiny', { apl: 3, move: 6, save: 3, wounds: 15, base: 32, sorcerer: true, destiny: true }, [doombolt, infernoPistol, forceStave]),
      op('warpfire', '戰火巫師', 'Sorcerer of Warpfire', { apl: 3, move: 6, save: 3, wounds: 15, base: 32, sorcerer: true, alight: true, incorporealSight: true }, [firestorm, mindburn, forceStave, khopesh]),
      op('rubricGunner', '符文戰士槍手', 'Rubric Marine Gunner', { apl: 3, move: 5, save: 2, wounds: 14, base: 32, automata: true }, [soulreaperFocused, soulreaperSweeping, fistsWC]),
      op('rubric', '符文戰士', 'Rubric Marine Warrior', { apl: 3, move: 5, save: 2, wounds: 14, base: 32, automata: true, slowPurposeful: true }, [infernoBoltgun, fistsWC]),
      op('champion', '奸奇獸人冠軍', 'Tzaangor Champion', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, notAstartes: true, tzaangor: true, savageBrutality: true }, [greatblade]),
      op('tzaangor', '奸奇獸人戰士', 'Tzaangor Warrior', { apl: 2, move: 6, save: 5, wounds: 9, base: 32, notAstartes: true, tzaangor: true }, [tzaangorBlades]),
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
      name: { zh: '教派伏擊・教派特工', en: 'Cult Ambush · Cult Agent' },
      desc: {
        zh: '教派伏擊：啟動時從隱蔽改為交戰、或啟動開始時沒有被敵人看見，本次啟動射擊與近戰時武器「無休」。教派特工（克勒莫夫、基因護衛）：被射擊時無視「穿甲」與「飽和」，能保留掩護豁免時多保留 1 顆或把 1 顆當暴擊。新信徒戰士群體啟動。（隱藏部署未實作）',
        en: 'Cult Ambush: if its order changed from Conceal to Engage at the start of the activation, or no enemy could see it then, its weapons have Ceaseless that activation. Cult Agents (Kelermorph, Locus): when shot, ignore Piercing and Saturate; with cover saves, retain one more or one as a critical. Neophyte Warriors use Group Activation. (Hiding deployment isn\'t modelled.)',
      },
    },
    ploys: [
      { id: 'dayAtHand', cp: 1, name: { zh: '時機已至', en: 'The Day Is at Hand' },
        desc: { zh: '本回合友方啟動時從隱蔽改為交戰：遠程武器「撕裂」，近戰武器 Atk +1（最多 5）。', en: 'This TP, a friendly whose order changes from Conceal to Engage when activated: ranged weapons Rending, melee weapons +1 Atk (max 5).' } },
      { id: 'crossfire', cp: 1, name: { zh: '交叉火網', en: 'Crossfire' },
        desc: { zh: '本回合友方射擊本回合已被其他友方射擊過的目標時，遠程武器「精準 1」。', en: 'This TP, a friendly shooting an operative another friendly has already shot this TP has Accurate 1.' } },
      { id: 'oneWithShadows', cp: 1, name: { zh: '與暗影同在', en: 'One with the Shadows' },
        desc: { zh: '本回合隱蔽指令的友方被射擊時，若中間有輕型地形（且不在任一方 1" 內），視為被遮擋。', en: 'This TP, a Concealed friendly being shot is obscured by intervening Light terrain (unless it\'s within 1" of either operative).' } },
    ],
    ops: [
      op('leader', '新信徒領袖', 'Neophyte Leader', { apl: 2, move: 6, save: 5, wounds: 8, base: 25, neophyte: true }, [mcAutopistol, powerMaul]),
      op('kelermorph', '克勒莫夫', 'Kelermorph', { apl: 3, move: 6, save: 4, wounds: 9, base: 32, cultAgent: true, twoShoots: true, heroic: true }, [stubsHyper, stubsLong, stubsShort, kelKnife]),
      op('locus', '基因護衛', 'Locus', { apl: 3, move: 6, save: 4, wounds: 9, base: 32, cultAgent: true, twoFights: true }, [barbedTail, locusBlades]),
      op('gunnerFlamer', '槍手（火焰）', 'Neophyte Gunner (flamer)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, neophyte: true }, [flamerGSC, gunButtGSC]),
      op('gunnerGL', '槍手（榴彈）', 'Neophyte Gunner (grenade launcher)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, neophyte: true }, [glFragGSC, glKrakGSC, gunButtGSC]),
      op('heavyLaser', '重武器手（採礦雷射）', 'Neophyte Heavy Gunner (mining laser)', { apl: 2, move: 6, save: 5, wounds: 7, base: 32, neophyte: true, bipod: true }, [miningLaser, gunButtGSC]),
      op('heavySeismic', '重武器手（地震砲）', 'Neophyte Heavy Gunner (seismic cannon)', { apl: 2, move: 6, save: 5, wounds: 7, base: 32, neophyte: true, bipod: true }, [seismicLong, seismicShort, gunButtGSC]),
      op('icon', '新信徒掌旗手', 'Neophyte Icon Bearer', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, neophyte: true, iconBearer: true }, [autogunGSC, gunButtGSC]),
      op('warrior', '新信徒戰士', 'Neophyte Warrior', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, neophyte: true, groupAct: 'gscWarrior' }, [autogunGSC, gunButtGSC], 2),
      op('warriorShotgun', '新信徒戰士（霰彈槍）', 'Neophyte Warrior (shotgun)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, neophyte: true, groupAct: 'gscWarrior' }, [shotgunGSC, gunButtGSC], 2),
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
        zh: '獲得血祭標記：每回合策略階段開始時；每回合第一次擊倒敵人時；每回合第一次友方在敵人 6" 內倒下時。策略階段可把標記分給友方（每名最多 1 個）；有 4 名以上持有標記時，可選一名受到「諸神注視」。持有標記的友方武器「精準 1」；受注視時，精準保留的成功可當暴擊。',
        en: 'Gain a Blooded token: in each Strategy phase; the first time an enemy is incapacitated each TP; the first time a friendly is incapacitated within 6" of an enemy each TP. In the Strategy phase, assign tokens to friendlies (one each); with four or more holders, one can be under the Gaze of the Gods. Holders\' weapons have Accurate 1; under the Gaze, the success retained through Accurate can be a critical.',
      },
    },
    ploys: [
      { id: 'recklessAspirant', cp: 1, name: { zh: '魯莽的追求者', en: 'Reckless Aspirant' },
        desc: { zh: '本回合完全在敵方領域內的友方：沒有標記時射擊或近戰武器「精準 1」；持有標記時武器「懲罰」。', en: 'This TP, a friendly wholly within your opponent\'s territory: Accurate 1 when shooting or fighting without a token; Punishing with a token.' } },
      { id: 'malevolentGrit', cp: 1, name: { zh: '惡毒的韌性', en: 'Malevolent Grit' },
        desc: { zh: '本回合持有標記、或完全在敵方領域內的友方被射擊時，可重擲一顆防禦骰。', en: 'This TP, a friendly with a token, or wholly within your opponent\'s territory, re-rolls one defence die when shot.' } },
      { id: 'gloryKill', cp: 1, name: { zh: '榮耀擊殺', en: 'Glory Kill' },
        desc: { zh: '選一名友方看得到的敵人：本回合攻擊它時武器「無休」，持有標記時改為「無情」。（使用時自動選生命最高的敵人，可在策略面板更換）', en: 'Pick an enemy a friendly can see: this TP, weapons have Ceaseless against it, or Relentless with a token. (The toughest enemy is picked automatically; change it in the strategy panel.)' } },
      { id: 'bitterDemise', cp: 1, name: { zh: '苦澀的死亡', en: 'Bitter Demise' },
        desc: { zh: '本回合友方倒下時擲 D3：擲出 3（持有標記時 2+）就對 2" 內一名可見敵人造成等量傷害。', en: 'This TP, when a friendly is incapacitated roll a D3: on a 3 (2+ with a token), that much damage to a visible enemy within 2".' } },
    ],
    ops: [
      op('chieftain', '叛軍首領', 'Traitor Chieftain', { apl: 2, move: 6, save: 5, wounds: 8, base: 25, leadWithStrength: true }, [laspistolBL, chainswordBL]),
      op('brimstone', '硫磺擲彈兵', 'Brimstone Grenadier', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, explosiveDemise: true }, [diabolykBomb, fragBL, krakBL, lasgunBL, bayonetBL]),
      op('butcher', '屠夫', 'Traitor Butcher', { apl: 2, move: 6, save: 5, wounds: 8, base: 25, unholySustenance: true }, [cleaver]),
      op('commsman', '叛軍通訊兵', 'Traitor Commsman', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, signal: true, actuation: true }, [lasgunBL, bayonetBL]),
      op('corpseman', '屍醫', 'Traitor Corpseman', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, stimms: true }, [lasgunBL, bayonetBL, stimmNeedle]),
      op('flenser', '剝皮者', 'Traitor Flenser', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, wretched: true }, [skinningBlades]),
      op('gunner', '叛軍槍手（火焰）', 'Traitor Gunner (flamer)', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [flamerBL, bayonetBL]),
      op('sharpshooter', '叛軍神射手', 'Traitor Sharpshooter', { apl: 2, move: 6, save: 5, wounds: 7, base: 25, camo1: true }, [longLasMobileBL, longLasStatBL, bayonetBL]),
      op('thug', '暴徒', 'Traitor Thug', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, tough: true }, [heavyClub]),
      op('sweeper', '戰壕掃蕩兵', 'Traitor Trench Sweeper', { apl: 2, move: 6, save: 4, wounds: 9, base: 25, shielding: true }, [shotgunBL, bayonetShield]),
      op('enforcer', '執法官', 'Traitor Enforcer', { apl: 2, move: 6, save: 4, wounds: 9, base: 32, disciplinarian: true }, [boltPistolBL, powerFistBL]),
      op('ogryn', '叛軍歐格林', 'Traitor Ogryn', { apl: 2, move: 6, save: 5, wounds: 16, base: 40, chemEnhanced: true, brute: true, slowWitted: true, avalanche: true }, [maulClaw]),
    ],
  },
  {
    id: 'fellgor',
    name: { zh: '惡角獸掠奪者', en: 'Fellgor Ravagers' },
    color: '#7a5a2a',
    style: { zh: '近戰隊・狂暴・野獸', en: 'Melee · Frenzy · Beasts' },
    blurb: {
      zh: '10 名混沌獸人：生命歸零時不會立刻倒下，而是陷入狂暴繼續戰鬥，直到被暴擊或連續命中才真正倒地。',
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
        zh: '沒有狂暴標記的友方將失去戰鬥能力時，改為不倒下並獲得狂暴標記（剩下的攻擊骰全部作廢；隱蔽改為交戰），對手此時就算它被擊殺。有狂暴標記時：視為受傷、不能隱蔽、不能撿標記與做獨特或任務動作、控制目標時 APL 視為 1。它在以下情況才真正倒下：自己的啟動或反擊結束；近戰中被暴擊打中；近戰中第二次被普通成功打中；被射擊時受到暴擊傷害；被射擊時有 2 顆以上攻擊骰造成普通傷害；戰鬥結束。',
        en: 'A friendly without a Frenzy token that would be incapacitated isn\'t: it gains a Frenzy token (remaining attack dice are discarded; Conceal becomes Engage), and it counts as incapacitated for your opponent from then on. With the token it\'s injured, can\'t Conceal, can\'t Pick Up or perform unique or mission actions, and has APL 1 for control. It\'s incapacitated when its activation or counteraction ends; when struck by a critical success, or a second time by a normal success, in a fight; when Critical Dmg, or Normal Dmg from two or more dice, is inflicted on it by shooting; or when the battle ends.',
      },
    },
    ploys: [
      { id: 'peltingFire', cp: 1, name: { zh: '亂槍齊射', en: 'Pelting Firepower' },
        desc: { zh: '本回合友方射擊已被另一名友方射擊過的敵人時，遠程武器「無休」；被兩名以上射擊過時改為「無情」。', en: 'This TP, a friendly shooting an enemy another friendly has shot has Ceaseless; Relentless if two or more have.' } },
      { id: 'recklessDetermination', cp: 1, name: { zh: '魯莽的決心', en: 'Reckless Determination' },
        desc: { zh: '本回合已行動的友方被射擊、又沒有掩護豁免時，可直接保留一顆防禦骰為普通成功。', en: 'This TP, an expended friendly being shot without cover saves retains one defence die as a normal success without rolling.' } },
      { id: 'violentTemperament', cp: 1, name: { zh: '暴烈脾性', en: 'Violent Temperament' },
        desc: { zh: '本回合友方近戰或反擊時，擲骰後可重擲全部攻擊骰（成功少於 2 顆時自動使用）。', en: 'This TP, a friendly fighting or retaliating can re-roll all its attack dice after rolling (used automatically with fewer than two successes).' } },
      { id: 'ambushFG', cp: 1, name: { zh: '伏擊', en: 'Ambush' },
        desc: { zh: '本回合友方啟動時從隱蔽改為交戰，本次啟動近戰時可把一顆普通成功當暴擊（沒有時把一顆失敗當普通成功）。有狂暴標記不能伏擊。', en: 'This TP, a friendly whose order changes from Conceal to Engage when activated can, when fighting that activation, retain a normal success as a critical (or a fail as a normal success). Not with a Frenzy token.' } },
    ],
    ops: [
      op('ironhorn', '鐵角首領', 'Fellgor Ironhorn', { apl: 2, move: 6, save: 5, wounds: 11, base: 32, ironhorn: true }, [corruptedPistol, corruptedChainsword]),
      op('deathknell', '喪鐘手', 'Fellgor Deathknell', { apl: 2, move: 6, save: 4, wounds: 10, base: 32, iconBearer: true, warGong: true, gongKnell: true }, [autopistolFG, bludgeon]),
      op('fluxbray', '變異獸人', 'Fellgor Fluxbray', { apl: 2, move: 6, save: 5, wounds: 10, base: 32 }, [tripleCleavers]),
      op('gnarlscar', '疤面獸人', 'Fellgor Gnarlscar', { apl: 2, move: 6, save: 5, wounds: 10, base: 32 }, [autopistolFG, bionicFist]),
      op('gorehorn', '血角獸人', 'Fellgor Gorehorn', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, twoFights: true }, [autopistolFG, skullcleaver]),
      op('herdgoad', '驅群者', 'Fellgor Herd-goad', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, whipControl: true, inciteFury: true }, [autopistolFG, whipRanged, whipMelee]),
      op('mangler', '撕裂者', 'Fellgor Mangler', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, savageBrutality: true, slowWitted: true }, [viciousClaws]),
      op('shaman', '獸人薩滿', 'Fellgor Shaman', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, fgShaman: true }, [autopistolFG, techCurse, braystave]),
      op('toxhorn', '毒角獸人', 'Fellgor Toxhorn', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, toxicBlessings: true }, [autopistolFG, cleaverFG]),
      op('vandal', '破壞者', 'Fellgor Vandal', { apl: 2, move: 6, save: 5, wounds: 10, base: 32, sweepingBlow: true }, [mancrusher]),
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
        zh: '冷酷效率：射擊時，友方在敵人控制範圍內也不妨礙選它為目標。正義標記（策略階段）：選一名敵人，攻擊它時武器「懲罰」；它倒下時自動改標記另一名。鎮壓（盾牌武器）：每次格擋可擋兩顆成功；反擊時由自己先結算。',
        en: 'Ruthless Efficiency: friendlies in an enemy\'s control range don\'t stop you targeting it. Marked for Justice (Strategy phase): pick an enemy — Punishing against it; a new mark is picked when it falls. Repress (shield weapons): each block cancels two successes; when retaliating, it resolves first.',
      },
    },
    ploys: [
      { id: 'guiltReveals', cp: 1, name: { zh: '罪行自現', en: 'Guilt Reveals Itself' },
        desc: { zh: '本回合友方選目標時，4" 內的敵人不能用掩體擋（仍保留掩護豁免，2" 內照常沒有）。', en: 'This TP, enemies within 4" of a friendly can\'t use cover when it picks targets (they keep the cover save, except within 2" as normal).' } },
      { id: 'inviolate', cp: 1, name: { zh: '不可侵犯的轄區', en: 'Inviolate Jurisdiction' },
        desc: { zh: '本回合在目標點或敵人 2" 內的友方被射擊時，可重擲一顆防禦骰。', en: 'This TP, a friendly within 2" of an objective marker or an enemy re-rolls one defence die when shot.' } },
      { id: 'dispenseJustice', cp: 1, name: { zh: '執行正義', en: 'Dispense Justice' },
        desc: { zh: '本回合友方近戰或反擊時，若本次啟動移動沒超過 Move（或反擊時），近戰武器「無休」。', en: 'This TP, a friendly fighting or retaliating that hasn\'t moved more than its Move this activation (or is counteracting) has Ceaseless.' } },
      { id: 'terminalDecree', cp: 1, name: { zh: '終結令', en: 'Terminal Decree' },
        desc: { zh: '本回合友方射擊 6" 內的敵人時，遠程武器「平衡」。', en: 'This TP, a friendly shooting an enemy within 6" has Balanced.' } },
    ],
    ops: [
      op('proctor', '執法隊長', 'Proctor-exactant', { apl: 2, move: 6, save: 3, wounds: 9, base: 28, nuncio: true }, [shotpistolPE, dominatorMaul]),
      op('castigator', '懲戒者', 'Castigator', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, engenderedFocus: true, zealous: true, arrest: true }, [combatShotgunClose, combatShotgunLong, excruciatorMaul]),
      op('chirurgant', '執法醫官', 'Chirurgant', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, medic: true, medikit: true }, [combatShotgunClose, combatShotgunLong, baton]),
      op('leashmaster', '馴犬師', 'Leashmaster', { apl: 2, move: 6, save: 4, wounds: 8, base: 28 }, [combatShotgunClose, combatShotgunLong, shotpistolAB, baton]),
      // Attack Pattern (Leashmaster): Aggressive (melee Relentless) and Swift (+2" Move) picked for the battle.
      op('mastiff', 'R-VR 機械獒犬', 'R-VR Cyber-mastiff', { apl: 2, move: 8, save: 4, wounds: 8, base: 25, apprehend: true, aggressivePattern: true, actionsOnly: ['apprehend', 'charge', 'dash', 'fallBack', 'fight', 'reposition', 'pickUp'] }, [mechBite]),
      op('malocator', '鑑識官', 'Malocator', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, veriscant: true, acuteFocus: true }, [combatShotgunClose, combatShotgunLong, baton]),
      op('marksman', '神射手', 'Marksman', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, optics: true }, [execConcealed, execMobile, execStationary, baton]),
      op('revelatum', '偵察官', 'Revelatum', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, support: 'spot', spotRange: 8 }, [scopedShort, scopedLong, baton]),
      op('subductor', '鎮壓兵', 'Subductor', { apl: 2, move: 6, save: 3, wounds: 8, base: 28, stubbornSubjugator: true }, [shotpistolAB, shockMaulShield]),
      op('vigilant', '警戒兵', 'Vigilant', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, vigilance: true }, [combatShotgunClose, combatShotgunLong, baton]),
      op('vox', '通訊官', 'Vox-signifier', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, signalAny: true }, [combatShotgunClose, combatShotgunLong, baton]),
    ],
  },
  {
    id: 'hierotek',
    name: { zh: '技師環', en: 'Hierotek Circle' },
    color: '#3aa35a',
    style: { zh: '射擊隊・死靈・復甦', en: 'Shooting · Necrons · Reanimation' },
    blurb: {
      zh: '死靈技師帶著不朽者、死亡標記狙擊手與聖甲蟲構裝體：身軀會自我修復、倒下還能復甦，技師能借部下的眼睛開火。',
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
        zh: '復甦協議：每名特工第一次倒下時留下復甦標記；每回合準備步驟擲 D6，3+ 讓一名倒下的特工在標記 3" 內以 1 生命、準備好的狀態回到場上（對手的擊殺數會減少）。活體金屬：每回合準備步驟，每名友方回復 D3+1 生命。放大（技師／學徒的武器）：可借另一名交戰指令、未被敵人纏住且看得到的技師或學徒的位置判斷目標、掩護與遮蔽，並獲得「無休」。',
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
    ],
    ops: [
      op('technomancer', '技術術士', 'Technomancer', { apl: 3, move: 6, save: 3, wounds: 14, base: 50, cryptek: true, magnifyRelay: true, interstitial: true, canoptekRepair: true, augment: true, reinforce: true }, [staffLight, staffLightM]),
      op('apprentek', '學徒', 'Apprentek', { apl: 3, move: 6, save: 3, wounds: 11, base: 32, apprentek: true, magnifyRelay: true, interstitial: true, canoptekRepair: true, augment: true, reinforce: true }, [arcaneConduit, arcaneConduitM]),
      op('deathmark', '死亡標記', 'Deathmark', { apl: 2, move: 5, save: 3, wounds: 10, base: 32, deathmark: true, mdVision: true }, [synapticDis, fistsN], 2),
      op('despotek', '不朽者指揮官', 'Immortal Despotek', { apl: 2, move: 5, save: 3, wounds: 11, base: 32, control: 3, steadfast: true, despotek: true, interstitial: true }, [teslaCarbine, bayonetN]),
      op('guardian', '不朽者衛士', 'Immortal Guardian', { apl: 2, move: 5, save: 3, wounds: 10, base: 32, control: 3, steadfast: true }, [gaussBlaster, bayonetN]),
      op('accelerator', '加速漿體', 'Plasmacyte Accelerator', { apl: 2, move: 7, save: 5, wounds: 5, base: 25, small: true, disengage: true, accelerate: true }, [spark, clawsP]),
      op('reanimator', '復甦漿體', 'Plasmacyte Reanimator', { apl: 2, move: 7, save: 5, wounds: 5, base: 25, small: true, disengage: true, reanimate: true }, [atomiser, clawsP]),
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
    ],
    ops: [
      op('rsPrinceps', '潛行者首領', 'Sicarian Ruststalker Princeps', { apl: 2, move: 6, save: 4, wounds: 11, base: 40, ruststalker: true, sicarian: true, wastelandStalker: true, canticleDestruction: true }, [chordclawBlades]),
      op('rsWarrior', '潛行者戰士', 'Sicarian Ruststalker Warrior', { apl: 2, move: 6, save: 4, wounds: 10, base: 40, ruststalker: true, sicarian: true, wastelandStalker: true }, [transonicBlades]),
      op('rsWarriorC', '潛行者戰士（和弦爪）', 'Sicarian Ruststalker Warrior (chordclaw)', { apl: 2, move: 6, save: 4, wounds: 10, base: 40, ruststalker: true, sicarian: true, wastelandStalker: true }, [chordclawRazor]),
      op('infWarrior', '滲透者戰士', 'Sicarian Infiltrator Warrior', { apl: 2, move: 6, save: 4, wounds: 10, base: 40, infiltrator: true, sicarian: true }, [flechette, taserGoadS]),
      op('rgGunner', '遊騎兵槍手', 'Skitarii Ranger Gunner', { apl: 2, move: 6, save: 4, wounds: 7, base: 35, ranger: true, targetingProtocol: true }, [arquebusMobile, arquebusStationary, gunButt]),
      op('rgDiktat', '遊騎兵傳令官', 'Skitarii Ranger Diktat', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, ranger: true, targetingProtocol: true, signal: true }, [galvanic, gunButt]),
      op('rgSurveyor', '遊騎兵勘測員', 'Skitarii Ranger Surveyor', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, ranger: true, targetingProtocol: true, support: 'spot' }, [galvanic, gunButt]),
      op('rgWarrior', '遊騎兵戰士', 'Skitarii Ranger Warrior', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, ranger: true, targetingProtocol: true }, [galvanic, gunButt]),
      op('vgGunner', '先鋒軍槍手', 'Skitarii Vanguard Gunner', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, vanguard: true, radSat: true }, [caliverStd, caliverSuper, gunButt]),
      op('vgWarrior', '先鋒軍戰士', 'Skitarii Vanguard Warrior', { apl: 2, move: 6, save: 4, wounds: 7, base: 25, vanguard: true, radSat: true }, [radiumCarbine, gunButt]),
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
    ],
    ops: [
      op('ksSergeant', '士官', 'Kasrkin Sergeant', { apl: 3, move: 6, save: 4, wounds: 9, base: 28, veteranLeadership: true, tacticalCommand: true }, [hsLaspistol, powerWeaponK]),
      op('ksMedic', '戰地醫護兵', 'Kasrkin Combat Medic', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, medic: true, medikit: true, medikit0: true }, [hsLasgun, gunButt]),
      op('ksDemo', '爆破兵', 'Kasrkin Demo-trooper', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, blastPadding: true, meltaMine: true }, [hsLaspistol, gunButt]),
      op('ksRecon', '偵察兵', 'Kasrkin Recon-trooper', { apl: 2, move: 6, save: 4, wounds: 8, base: 28, auspex: true }, [hsLasgun, gunButt]),
      op('ksFlamer', '槍手（噴火器）', 'Kasrkin Gunner (flamer)', { apl: 2, move: 6, save: 4, wounds: 8, base: 28 }, [flamerK, gunButt]),
      op('ksMelta', '槍手（熱熔槍）', 'Kasrkin Gunner (meltagun)', { apl: 2, move: 6, save: 4, wounds: 8, base: 28 }, [meltaK, gunButt]),
      op('ksPlasma', '槍手（電漿槍）', 'Kasrkin Gunner (plasma gun)', { apl: 2, move: 6, save: 4, wounds: 8, base: 28 }, [plasmaGunK, plasmaGunKS, gunButt]),
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
        zh: '星際戰士：每次啟動可射擊兩次（其中一次要用爆彈武器）或近戰兩次；任何指令都能反擊。混沌印記（每名隊員固定一種）：恐虐（近戰「重創」）、奸奇（遠程「重創」）、納垢（受到 3 以上普通傷害時 5+ -1）、色孽（Move +1"）、混沌不分（攻擊 6" 內的敵人時「無休」）。',
        en: 'Astartes: two Shoots (one with a bolt weapon) or two Fights per activation; can counteract on any order. Marks of Chaos (fixed per operative): Khorne (melee Severe), Tzeentch (ranged Severe), Nurgle (3+ Normal Dmg: 5+ = 1 less), Slaanesh (+1" Move), Undivided (Ceaseless against enemies within 6").',
      },
    },
    ploys: [
      { id: 'bloodGod', cp: 1, name: { zh: '血祭血神', en: 'Blood for the Blood God' },
        desc: { zh: '本回合友方近戰時第一次打擊 +1 傷害（最多 7）；恐虐印記的友方近戰武器兩個傷害都 +1（最多 7）。', en: 'This TP, a friendly\'s first strike when fighting deals 1 more (max 7); Khorne operatives\' melee weapons have +1 to both Dmg (max 7) instead.' } },
      { id: 'implacable', cp: 1, name: { zh: '無可阻擋', en: 'Implacable' },
        desc: { zh: '本回合射擊友方的「穿甲 1」改為「暴擊穿甲 1」；納垢印記的友方無視受傷減益。', en: 'This TP, Piercing 1 against friendlies becomes Piercing Crits 1; Nurgle operatives ignore injured penalties.' } },
      { id: 'quicksilver', cp: 1, name: { zh: '水銀之速', en: 'Quicksilver Speed' },
        desc: { zh: '本回合移動過的友方近戰或反擊時，敵人近戰命中變差 1；移動過的色孽友方被 6" 外射擊時，敵人命中變差 1。', en: 'This TP, a friendly that moved this TP fighting or retaliating worsens the enemy\'s melee Hit by 1; a Slaanesh one that moved, shot from more than 6", worsens the shooter\'s Hit by 1.' } },
      { id: 'fickleFates', cp: 1, name: { zh: '無常命運', en: 'Fickle Fates' },
        desc: { zh: '本回合射擊尚未行動的敵人時遠程「平衡」（已有則「無情」）；尚未行動的奸奇友方被射擊時，保留暴擊豁免的話可把一顆失敗算成普通豁免。', en: 'This TP, shooting a ready enemy: Balanced (Relentless if it already has it); a ready Tzeentch friendly being shot that retains a critical save retains one fail as a normal save.' } },
    ],
    ops: [
      op('lgChosen', '被選者', 'Legionary Chosen', { apl: 3, move: 6, save: 3, wounds: 15, base: 32, mark: 'khorne', daemonicAura: true, soulGorge: true }, [plasmaPistolL, plasmaPistolLS, daemonBlade]),
      op('lgBalefire', '狂焰侍僧', 'Legionary Balefire Acolyte', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, mark: 'tzeentch' }, [boltPistolL, fireblast, lifeSiphon, fellDagger]),
      op('lgButcher', '屠夫', 'Legionary Butcher', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, mark: 'undivided', noAssistVs: true }, [boltPistolL, chainaxe]),
      op('lgShrivetalon', '剝皮者', 'Legionary Shrivetalon', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, mark: 'slaanesh', viciousReflexes: true, dismember: true, grisly: true }, [boltPistolL, flensingBlades]),
      op('lgHeavy', '重火力兵', 'Legionary Heavy Gunner', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, mark: 'nurgle' }, [boltPistolL, reaperFocused, reaperSweeping, fistsL]),
      op('lgAnointed', '受膏者', 'Legionary Anointed', { apl: 3, move: 6, save: 3, wounds: 14, base: 32, mark: 'khorne', unleashDaemon: true }, [boltPistolL, daemonicClaw]),
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
    ],
    ops: [
      op('nvSuperior', '修女長', 'Novitiate Superior', { apl: 3, move: 6, save: 3, wounds: 9, base: 32, inspirational: true }, [plasmaPistolN, plasmaPistolNS, powerWeaponN]),
      op('nvCondemnor', '譴責者', 'Novitiate Condemnor', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, nullRodAura: true }, [stakethrower, nullRod]),
      op('nvDialogus', '宣講者', 'Novitiate Dialogus', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, broadcaster: true, rhetoric: true }, [autopistol, dialogusStave]),
      op('nvDuellist', '決鬥者', 'Novitiate Duellist', { apl: 2, move: 6, save: 4, wounds: 7, base: 28 }, [autopistol, duellingBlades]),
      op('nvExactor', '鞭策者', 'Novitiate Exactor', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, whipFrenzy: true }, [neuralWhipsR, neuralWhipsM]),
      op('nvHospitaller', '醫護修女', 'Novitiate Hospitaller', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, medic: true, medikit: true }, [autopistol, surgicalSaw]),
      op('nvPenitent', '懺悔者', 'Novitiate Penitent', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, absolution: true }, [autopistol, eviscerator]),
      op('nvPreceptor', '訓誡者', 'Novitiate Preceptor', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, hymnal: true, unflinching: true }, [maceRighteous]),
      op('nvPurgatus', '淨化者', 'Novitiate Purgatus', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, purgeFlame: true }, [ministorumFlamer, gunButt]),
      op('nvReliquarius', '聖物守護者', 'Novitiate Reliquarius', { apl: 2, move: 6, save: 4, wounds: 7, base: 28, iconBearer: true, raiseIcon: true }, [autopistol, gunButt]),
    ],
  },
];

TEAMS.push(...ELDAR_TEAMS);

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
    ff('wrathVengeance', '復仇之怒', 'Wrath of Vengeance', '反擊時：多一個免費的 1AP 動作。', 'While counteracting: one more 1AP action for free.'),
    ff('transhuman', '超人生理', 'Transhuman Physiology', '自動：被射擊時，一顆普通豁免當成暴擊豁免（能多擋暴擊時才用）。', 'Auto: when shot, one normal save is retained as a critical one (used when it blocks a crit).'),
    ff('shockAssault', '震撼突擊', 'Shock Assault', '本次啟動衝鋒過的近戰：武器「震撼」，第一次打擊 +1 傷害（最多 7）。', 'Fighting after a Charge this activation: Shock, and the first strike deals 1 more (max 7).'),
  ],
  blooded: [
    ff('momentRepute', '榮耀時刻', 'Moment of Repute', '受諸神注視的友方啟動中：本次 APL +1。', 'During the activation of the operative under the Gaze of the Gods: +1 APL.'),
    ff('rewardEarned', '應得的獎賞', 'Reward Earned', '自動：持有血祭標記的友方在 2" 內擊倒敵人時，獲得 1 個血祭標記。', 'Auto: when a friendly with a Blooded token incapacitates an enemy within 2", gain a Blooded token.'),
  ],
  deathKorps: [
    ff('combinedArms', '聯合火力', 'Combined Arms', '射擊本回合已被其他友方射擊過的敵人：可重擲任意攻擊骰（無情）。', 'Shooting an enemy another friendly shot this TP: re-roll any attack dice (Relentless).'),
  ],
  exaction: [
    ff('longArm', '帝皇律法之臂', 'Long Arm of the Emperor\'s Law', '射擊選武器時：有射程限制的武器射程 +3"。', 'When shooting with a Range x weapon: +3" to x.'),
  ],
  fellgor: [
    ff('animalisticFury', '獸性狂怒', 'Animalistic Fury', '近戰時第一次暴擊打擊 +1 傷害（反擊時自動使用）。', 'Fighting: the first critical strike deals 1 more (used automatically when retaliating).'),
    ff('wildRage', '狂野暴怒', 'Wild Rage', '啟動時：本次啟動 Move +1"。', 'When activated: +1" Move for this activation.'),
    ff('ruthlessRampage', '無情暴走', 'Ruthless Rampage', '近戰後若已不在敵人控制範圍內：免費衝鋒一次（最多 3"）。', 'After a Fight, if out of enemy control range: a free Charge of up to 3".'),
  ],
  farstalkers: [
    ff('slipAway', '溜走', 'Slip Away', '啟動中：本次撤退少花 1AP。', 'During an activation: Fall Back costs 1 less AP.'),
    ff('vengeanceKinband', '為戰團復仇', 'Vengeance for the Kinband', '自動：友方被敵人擊倒時，之後友方攻擊那個敵人都「無情」（它倒下前不能再用）。', 'Auto: when a friendly is incapacitated by an enemy, friendlies attacking that enemy have Relentless (not again until it falls).'),
    ff('savageAmbush', '野蠻伏擊', 'Savage Ambush', '自動：控制範圍內有地形、尚未行動的友方被近戰時，由它先出手。', 'Auto: a ready friendly with terrain in its control range that\'s fought against resolves the first die.'),
  ],
  gellerpox: [
    ff('putrescentDemise', '腐爛之死', 'Putrescent Demise', '自動：友方倒下時，2" 內看得到的每名敵人受 1 傷害（噩夢巨獸 D3）。', 'Auto: when a friendly falls, each enemy visible within 2" takes 1 damage (D3 for a Nightmare Hulk).'),
    ff('frighteningOnslaught', '駭人猛攻', 'Frightening Onslaught', '噩夢巨獸近戰後：再免費近戰一次。', 'After a Nightmare Hulk fights: a free Fight.'),
    ff('revoltingTech', '腐壞科技', 'Revolting Technology', '自動：敵人射擊友方時，它的武器獲得「過熱」。', 'Auto: an enemy shooting a friendly has Hot on its weapon.'),
  ],
  hunterClade: [
    ff('commandOverride', '指令覆寫', 'Command Override', '啟動時：這名特工改用最適合它的指令（近戰型→征服者，射擊型→守護者）。', 'When activated: this operative switches to the Imperative that suits it (melee → Conqueror, shooting → Protector).'),
    ff('omnissiah', '萬機神指令', 'Omnissiah\'s Imperative', '啟動中：直到下回合，守護者→遠程「重創」；征服者→近戰時第一次打擊後可再打擊一次。', 'During an activation: until next TP, Protector → ranged Severe; Conqueror → after its first strike when fighting, another.'),
    ff('scrapcode', '廢碼過載', 'Scrapcode Overload', '滲透者啟動時：直到它下次啟動，它 3" 內的敵人爭奪目標時 APL 總和 -1。', 'When an Infiltrator is activated: until its next activation, enemies within 3" of it count 1 less total APL for marker control.'),
  ],
  hearthkyn: [
    ff('sturdy', '結實', 'Sturdy', '自動：被射擊時，攻擊方保留的暴擊全部變成普通成功。', 'Auto: when shot, the attacker\'s retained crits become normal successes.'),
    ff('engageToAcquire', '以戰奪寶', 'Engage to Acquire', '攻擊控制目標點的敵人：可重擲任意攻擊骰（無情）。', 'Attacking an enemy that controls an objective: re-roll any attack dice (Relentless).'),
    ff('ancestorsWatching', '先祖注視', 'The Ancestors Are Watching', '啟動中：可免費射擊或近戰一次，且武器無視受傷減益。', 'During an activation: a free Shoot or Fight, ignoring injured weapon penalties.'),
  ],
  hierotek: [
    ff('livingLightning', '活體閃電', 'Living Lightning', '用特斯拉卡賓槍射擊時：改為「爆炸 2\"」（不再有 2" 毀滅）。', 'Shooting a tesla carbine: Blast 2" instead of its 2" Devastating.'),
  ],
  navyBreachers: [
    ff('blitz', '閃擊', 'Blitz', '全隊本回合第一次攻擊、目標在 6" 內：「精準 1」；若也是第一個啟動的再加「重創」。', 'The team\'s first attack this TP, target within 6": Accurate 1; also Severe if it\'s the first operative activated.'),
    ff('overwhelmTarget', '壓制目標', 'Overwhelm Target', '以突破清場啟動時：本次 APL +1。', 'When activated with Breach and Clear: +1 APL.'),
  ],
  kommandos: [
    ff('justScratch', '只是擦傷', 'Just a Scratch', '自動：一顆 3 以上的普通傷害攻擊骰改為不造成傷害。', 'Auto: ignore the damage of one attack die inflicting 3+ Normal Dmg.'),
    ff('shakeItOff', '甩掉它', 'Shake It Off', '啟動時：本回合無視 APL 的變化（被減的 AP 補回）。', 'When activated: ignore APL changes this TP (a lost AP is restored).'),
  ],
  tauPathfinders: [
    ff('supportingFire', '支援火力', 'Supporting Fire', '射擊選目標時：6" 內被友方纏住的敵人也能選。', 'Picking a target: enemies within 6" in friendly control range can be selected.'),
  ],
  phobos: [
    ff('criticalShot', '致命一擊', 'Critical Shot', '用爆彈武器射擊：有暴擊命中時，多造成 D3 傷害（每次行動一次）。', 'Shooting a bolt weapon: a critical hit inflicts D3 more damage (once per action).'),
    ff('transhuman', '超人生理', 'Transhuman Physiology', '自動：被射擊時，一顆普通豁免當成暴擊豁免（能多擋暴擊時才用）。', 'Auto: when shot, one normal save is retained as a critical one (used when it blocks a crit).'),
  ],
  plagueMarines: [
    ff('sickeningResilience', '令人作嘔的堅韌', 'Sickening Resilience', '自動：受到重傷時，本次行動中「令人作嘔的韌性」不用擲骰，3 以上的傷害一律 -1（最低 2）。', 'Auto: when badly hit, for the rest of the activation Disgustingly Resilient takes 1 off every 3+ damage (min 2) without rolling.'),
    ff('virulentPoison', '劇毒瘟疫', 'Virulent Poison', '啟動中：3" 內或 7" 內看得到的一名敵人中毒。', 'During an activation: an enemy within 3", or visible within 7", is poisoned.'),
    ff('poisonousDemise', '劇毒之死', 'Poisonous Demise', '自動：友方倒下時，3" 內看得到的敵人中毒（已中毒的受 1 傷害）。', 'Auto: when a friendly falls, enemies visible within 3" are poisoned (1 damage if they already were).'),
  ],
  wyrmblade: [
    ff('slink', '遁入黑暗', 'Slink into Darkness', '啟動中：啟動結束時從交戰改回隱蔽（每名整場一次）。', 'During an activation: switch from Engage back to Conceal when it ends (once per operative per battle).'),
    ff('coiledSerpent', '盤蛇', 'Coiled Serpent', '從隱蔽轉交戰後的第一次攻擊：一顆普通成功當成暴擊。', 'First attack after switching from Conceal to Engage: one normal success becomes a critical success.'),
  ],
  kasrkin: [
    ff('neutraliseTarget', '消滅目標', 'Neutralise Target', '射擊沒有掩護豁免、或被偵察兵掃描中的敵人：可重擲任意攻擊骰（無情）。', 'Shooting an enemy that can\'t retain cover saves, or is being scanned: re-roll any attack dice (Relentless).'),
  ],
  legionaries: [
    ff('mutability', '變化無常', 'Mutability and Change', '奸奇印記的友方啟動時：本次 APL +1。', 'When a Tzeentch operative is activated: +1 APL this activation.'),
    ff('malignantAura', '惡毒光環', 'Malignant Aura', '納垢印記的友方射擊 3" 內的敵人：遠程「穿甲 1」。', 'A Nurgle operative shooting an enemy within 3": Piercing 1.'),
    ff('sickeningCaptivation', '令人作嘔的魅惑', 'Sickening Captivation', '色孽印記的友方啟動中：4" 內看得到的一名敵人下次 APL -1。', 'During a Slaanesh operative\'s activation: a visible enemy within 4" gets -1 APL next activation.'),
  ],
  warpcoven: [
    ff('allIsDust', '萬物皆塵', 'All Is Dust', '自動：一顆對紅字星際戰士造成普通傷害的攻擊骰只造成 1 傷害。', 'Auto: one attack die inflicting Normal Dmg on a Rubric Marine inflicts 1 instead.'),
    ff('capricious', '多變的計畫', 'Capricious Plan', '巫師啟動中：免費衝刺一次（之前做過什麼都可以）。', 'During a Sorcerer\'s activation: a free Dash, whatever it did before.'),
  ],
};
for (const t of TEAMS) t.firefight = FIREFIGHT[t.id] || [];

export const TEAM_MAP = Object.fromEntries([...TEAMS, NPO_TEAM].map((t) => [t.id, t]));

export const RULE_LABELS = {
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
  relentless: { zh: '無情', en: 'Relentless' },
  punishing: { zh: '懲罰', en: 'Punishing' },
  firstShotOnly: { zh: '隱蔽陣地（只限第一次射擊）', en: 'Concealed Position (first Shoot only)' },
  salvo: { zh: '齊射', en: 'Salvo' },
  swipe: { zh: '橫掃', en: 'Swipe' },
  shield: { zh: '盾牌（一次格擋擋兩顆）', en: 'Shield (each block cancels two)' },
  hypersense: { zh: '超感（目標不會被遮擋）', en: 'Hypersense (no obscuring)' },
  bloodOffering: { zh: '血之獻祭（第一次暴擊打擊得血祭標記）', en: 'Blood Offering (first critical strike gains a Blooded token)' },
  repress: { zh: '鎮壓（反擊時先結算）', en: 'Repress (resolves first when retaliating)' },
  devSplash: { zh: '毀滅也波及目標周圍', en: 'Devastating also hits operatives within' },
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
};

/** A ranged weapon with "bolt" in its name (Angels of Death rules). */
export const isBoltWeapon = (w) => w.type === 'ranged' && /bolt/i.test(w.name.en);
