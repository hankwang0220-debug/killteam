// Team data. Stats follow Kill Team conventions (APL / Move / Save / Wounds,
// weapons ATK / HIT / DMG normal/crit). Angels of Death, Pathfinders, Plague Marines and Kommandos use
// the official online datacards (stats only, ability text paraphrased); Imperial Troopers is an original
// archetype you can tune or replace with your own datacards.
//
// Operative stats: apl, move, save, wounds, base (mm).
//
// Weapon rules keys:
//   range: n        max range in inches (edge to edge)
//   piercing: n     defender rolls n fewer defence dice
//   piercingCrits:n as above, only if the attack scored a critical hit
//   lethal: n       critical hit on n+ instead of 6+
//   balanced        re-roll one attack die
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
//
// Operative flags (Kommandos): krumpin (two Fight actions), support: 'getItDun' | 'listenIn' (+1 APL),
// dakkaDash, datAllYouGot (D3 damage after fighting), wotNotz (Boy: Stun Grenade once per TP).
//
// Operative flags (Plague Marines): blessing (Grandfather's Blessing), flail (Flail action),
// iconBearer (+1 APL for control, Contagion free in enemy territory), miasma / vitality (Plaguecaster actions).
//
// Operative flags (Pathfinders): markerlight: n tokens per Markerlight action, drone: [allowed actions],
// signal / systemJam / medikit (unique actions), medic (Medic!), multiVision (enemies can't be obscured),
// droneController (+2" Move for drones), veteran (Blooded: Mont'ka and Kauyon both apply).
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

// ---- Troopers ----
const lasgun = W('lasgun', '雷射槍', 'Lasgun', 'ranged', 4, 4, 2, 3);
const laspistol = W('laspistol', '雷射手槍', 'Laspistol', 'ranged', 4, 4, 2, 3, { range: 8 });
const plasmaGun = W('plasmaGun', '等離子槍', 'Plasma gun', 'ranged', 4, 4, 5, 6, { piercing: 1 });
const melta = W('melta', '熱熔槍', 'Meltagun', 'ranged', 4, 4, 6, 3, { range: 6, piercing: 2 });
const chainswordG = W('chainswordG', '鏈鋸劍', 'Chainsword', 'melee', 4, 4, 4, 5);
const bayonet = W('bayonet', '刺刀', 'Bayonet', 'melee', 3, 4, 2, 3);

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
        zh: '友方在隱蔽指令下也能執行「衝鋒」。',
        en: 'Friendly operatives can perform the Charge action while they have a Conceal order.',
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
      op('gunDrone', 'MV1 槍械無人機', 'MV1 Gun Drone', { apl: 2, move: 6, save: 4, wounds: 7, base: 32, drone: ['charge', 'dash', 'fallBack', 'fight', 'reposition', 'shoot'] }, [twinPulseCarbine, ram]),
      op('markerDrone', 'MV7 標記無人機', 'MV7 Marker Drone', { apl: 2, move: 6, save: 4, wounds: 7, base: 32, markerlight: 2, drone: ['charge', 'dash', 'fallBack', 'fight', 'markerlight', 'reposition'] }, [ram]),
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
    id: 'troopers',
    name: { zh: '帝國衛兵小隊', en: 'Imperial Troopers' },
    color: '#b8433f',
    style: { zh: '人數・火力・指揮', en: 'Numbers · Firepower · Orders' },
    blurb: {
      zh: '12 名普通士兵配特種武器。單兵弱小，但集火受傷目標時火力驚人。',
      en: '12 rank-and-file soldiers with special weapons. Weak alone, deadly when focusing wounded targets.',
    },
    rule: {
      name: { zh: '集火', en: 'Bring It Down' },
      desc: {
        zh: '射擊本回合已受過傷害的敵人時，遠程武器獲得「無休」。',
        en: 'Ranged weapons gain Ceaseless against an enemy that has already lost wounds this TP.',
      },
    },
    ploys: [
      { id: 'takeAim', cp: 1, name: { zh: '瞄準！', en: 'Take Aim!' },
        desc: { zh: '本回合友方遠程武器獲得「平衡」。', en: 'This TP, friendly ranged weapons gain Balanced.' } },
      { id: 'moveMove', cp: 1, name: { zh: '快！快！快！', en: 'Move! Move! Move!' },
        desc: { zh: '本回合友方 Move +1"。', en: 'This TP, friendly operatives get +1" Move.' } },
    ],
    ops: [
      op('sgt', '士官', 'Sergeant', { apl: 2, move: 6, save: 5, wounds: 8, base: 25 }, [laspistol, chainswordG]),
      op('plasma', '等離子槍手', 'Plasma Gunner', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [plasmaGun, bayonet]),
      op('melta', '熱熔槍手', 'Melta Gunner', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [melta, bayonet]),
      op('trooper', '步兵', 'Trooper', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [lasgun, bayonet], 9),
    ],
  },
];

export const TEAM_MAP = Object.fromEntries(TEAMS.map((t) => [t.id, t]));

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
  punishing: { zh: '懲罰', en: 'Punishing' },
  firstShotOnly: { zh: '隱蔽陣地（只限第一次射擊）', en: 'Concealed Position (first Shoot only)' },
};

/** A ranged weapon with "bolt" in its name (Angels of Death rules). */
export const isBoltWeapon = (w) => w.type === 'ranged' && /bolt/i.test(w.name.en);
