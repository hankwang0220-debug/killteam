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
];

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
  mindburn: { zh: '心靈灼燒（暴擊傷害後目標命中變差 1）', en: 'Mindburn (a crit worsens the target\'s Hit by 1)' },
  detonate: { zh: '引爆（目標固定為鬼骷髏）', en: 'Detonate (the Gheistskull is the target)' },
  forceImpact: { zh: '衝擊力（衝鋒後殘暴）', en: 'Force Impact (Brutal after a Charge)' },
};

/** A ranged weapon with "bolt" in its name (Angels of Death rules). */
export const isBoltWeapon = (w) => w.type === 'ranged' && /bolt/i.test(w.name.en);
