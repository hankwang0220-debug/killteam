// Team data. Stats follow Kill Team conventions (APL / Move / Save / Wounds,
// weapons ATK / HIT / DMG normal/crit). Angels of Death use the official online
// datacards (stats only, ability text paraphrased); the other teams are original
// archetypes so you can tune or replace them with your own datacards.
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

// ---- Greenskins ----
const slugga = W('slugga', '粗製手槍', 'Slugga', 'ranged', 4, 4, 3, 4, { range: 8 });
const burna = W('burna', '噴火器', 'Burna', 'ranged', 4, 2, 3, 3, { range: 6, ignoreCover: true });
const rokkit = W('rokkit', '火箭發射器', 'Rokkit launcha', 'ranged', 4, 4, 5, 6, { piercing: 1, heavy: true });
const choppa = W('choppa', '劈砍刀', 'Choppa', 'melee', 4, 3, 4, 5);
const bigChoppa = W('bigChoppa', '大劈刀', 'Big choppa', 'melee', 5, 3, 5, 6, { brutal: true });
const fistsO = W('fistsO', '拳頭', 'Fists', 'melee', 3, 4, 2, 3);

// ---- Pathfinders ----
const pulseCarbine = W('pulseCarbine', '脈衝卡賓槍', 'Pulse carbine', 'ranged', 4, 4, 4, 5);
const railRifle = W('railRifle', '軌道步槍', 'Rail rifle', 'ranged', 4, 4, 4, 4, { lethal: 5, piercing: 1, heavy: true });
const ionRifle = W('ionRifle', '離子步槍', 'Ion rifle', 'ranged', 5, 4, 4, 5, { piercingCrits: 1 });
const fistsT = W('fistsT', '槍托', 'Gun butt', 'melee', 3, 5, 1, 2);

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
    id: 'greenskin',
    name: { zh: '綠皮突擊隊', en: 'Greenskin Raiders' },
    color: '#4f9a2b',
    style: { zh: '近戰・衝鋒・蠻力', en: 'Melee · Charge · Brute force' },
    blurb: {
      zh: '10 名粗暴的綠皮。射擊不準，但衝進近戰就是屠殺。學習衝鋒與近戰格擋的好選擇。',
      en: '10 brutal greenskins. Poor shots, but devastating once they get stuck in. Learn charging and melee.',
    },
    rule: {
      name: { zh: '衝啊！', en: "'Ere We Go!" },
      desc: {
        zh: '衝鋒距離額外 +1"；本次啟動中執行過衝鋒的操作員，其近戰武器獲得「無休」。粗皮厚肉：受到 4 點以上的普通傷害時 -1。',
        en: '+1" to Charge distance. Operatives that Charged this activation gain Ceaseless on melee weapons. Thick hide: normal damage of 4+ is reduced by 1.',
      },
    },
    ploys: [
      { id: 'waaagh', cp: 1, name: { zh: '哇！！！', en: 'Waaagh!' },
        desc: { zh: '本回合友方近戰武器 ATK +1。', en: 'This TP, friendly melee weapons get +1 ATK.' } },
      { id: 'sneakyGits', cp: 1, name: { zh: '鬼祟傢伙', en: 'Sneaky Gits' },
        desc: { zh: '本回合友方處於掩護時，可保留 2 顆掩護豁免（而非 1 顆）。', en: 'This TP, friendly operatives in cover retain 2 cover saves instead of 1.' } },
    ],
    ops: [
      op('boss', '頭目', 'Boss', { apl: 2, move: 6, save: 4, wounds: 14, base: 32 }, [slugga, bigChoppa]),
      op('burna', '噴火小子', 'Burna Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 28 }, [burna, choppa]),
      op('rokkit', '火箭小子', 'Rokkit Boy', { apl: 2, move: 6, save: 5, wounds: 10, base: 28 }, [rokkit, fistsO]),
      op('boy', '小子', 'Boy', { apl: 2, move: 6, save: 5, wounds: 11, base: 28 }, [slugga, choppa], 7),
    ],
  },
  {
    id: 'pathfinders',
    name: { zh: '光矛探路者', en: 'Pulse Pathfinders' },
    color: '#d0922f',
    style: { zh: '遠程・標記・脆弱', en: 'Ranged · Markers · Fragile' },
    blurb: {
      zh: '10 名射手。用標記光鎖定目標再集火，但被近身就很危險。學習視線與掩護的好選擇。',
      en: '10 marksmen. Mark a target, then focus fire — but fragile up close. Learn line of sight and cover.',
    },
    rule: {
      name: { zh: '標記光', en: 'Markerlight' },
      desc: {
        zh: '獨特動作「標記」(1AP)：選擇一個可見敵人。本回合友方對其射擊時命中 +1（改善），且目標無法獲得掩護。',
        en: 'Unique action Mark (1AP): pick a visible enemy. This TP, friendly shooting against it improves HIT by 1 and ignores cover.',
      },
    },
    ploys: [
      { id: 'fireDiscipline', cp: 1, name: { zh: '射擊紀律', en: 'Fire Discipline' },
        desc: { zh: '本回合友方遠程武器獲得「無休」。', en: 'This TP, friendly ranged weapons gain Ceaseless.' } },
      { id: 'strikeFade', cp: 1, name: { zh: '打帶跑', en: 'Strike and Fade' },
        desc: { zh: '本回合友方「撤退」動作只需 1AP。', en: 'This TP, Fall Back costs 1AP for friendly operatives.' } },
    ],
    ops: [
      op('shasui', '小隊長', 'Team Leader', { apl: 2, move: 6, save: 5, wounds: 8, base: 25 }, [pulseCarbine, fistsT]),
      op('rail', '軌道槍手', 'Rail Gunner', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [railRifle, fistsT]),
      op('ion', '離子槍手', 'Ion Gunner', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [ionRifle, fistsT]),
      op('pf', '探路者', 'Pathfinder', { apl: 2, move: 6, save: 5, wounds: 7, base: 25 }, [pulseCarbine, fistsT], 7),
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
};

/** A ranged weapon with "bolt" in its name (Angels of Death rules). */
export const isBoltWeapon = (w) => w.type === 'ranged' && /bolt/i.test(w.name.en);
