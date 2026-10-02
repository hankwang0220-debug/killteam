// Team data. Stats follow Kill Team conventions (APL / Move / Save / Wounds,
// weapons ATK / HIT / DMG normal/crit). Names and ability wording are original
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
//   heavy           cannot shoot after moving in the same activation
//   ignoreCover     target gets no cover save

const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}) =>
  ({ id, name: { zh, en }, type, atk, hit, dmg: [dn, dc], rules });

// ---- Astartes ----
const boltRifle = W('boltRifle', '爆彈步槍', 'Bolt rifle', 'ranged', 4, 3, 3, 4, { piercingCrits: 1 });
const boltPistol = W('boltPistol', '重型爆彈手槍', 'Heavy bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8, piercingCrits: 1 });
const plasmaInc = W('plasmaInc', '等離子焚化槍', 'Plasma incinerator', 'ranged', 4, 3, 5, 6, { piercing: 1 });
const powerSword = W('powerSword', '動力劍', 'Power weapon', 'melee', 5, 3, 4, 6, { lethal: 5 });
const chainswordA = W('chainswordA', '鏈鋸劍', 'Chainsword', 'melee', 5, 3, 4, 5);
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
    id: 'astartes',
    name: { zh: '星際戰士突擊隊', en: 'Astartes Strike Team' },
    color: '#3a78d8',
    style: { zh: '精英・少數・全能', en: 'Elite · Few · Versatile' },
    blurb: {
      zh: '6 名重甲超人戰士。高 APL、高豁免、高傷害，每個損失都很痛。適合新手熟悉規則。',
      en: '6 armoured super-soldiers. High APL, saves and damage — every loss hurts. Great for learning the rules.',
    },
    rule: {
      name: { zh: '阿斯塔特', en: 'Astartes' },
      desc: {
        zh: '每次啟動可執行「近戰」動作兩次。',
        en: 'May perform the Fight action twice per activation.',
      },
    },
    ploys: [
      { id: 'assaultDoctrine', cp: 1, name: { zh: '突擊教條', en: 'Assault Doctrine' },
        desc: { zh: '本回合友方近戰武器獲得「平衡」。', en: 'This TP, friendly melee weapons gain Balanced.' } },
      { id: 'devastatorDoctrine', cp: 1, name: { zh: '毀滅教條', en: 'Devastator Doctrine' },
        desc: { zh: '本回合友方遠程武器獲得「平衡」。', en: 'This TP, friendly ranged weapons gain Balanced.' } },
    ],
    ops: [
      op('sgt', '小隊長', 'Sergeant', { apl: 3, move: 6, save: 3, wounds: 14, base: 32 }, [boltRifle, powerSword]),
      op('gunner', '等離子槍手', 'Plasma Gunner', { apl: 3, move: 6, save: 3, wounds: 13, base: 32 }, [plasmaInc, fistsA]),
      op('assault', '突擊兵', 'Assault Warrior', { apl: 3, move: 6, save: 3, wounds: 13, base: 32 }, [boltPistol, chainswordA]),
      op('warrior', '戰士', 'Warrior', { apl: 3, move: 6, save: 3, wounds: 13, base: 32 }, [boltRifle, fistsA], 3),
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
};
