// Nemesis Claw (復仇之爪): Night Lords kill team.
// Source: https://assets.warhammer-community.com/eng_17-06_kill_team_team_rules_nemesis_claw_online_rules-oyryxud2oc-jylng5bujl.pdf (errata June '26)
// Every choice of weapons is its own operative template (e.g. ncGunnerMelta), so one dropdown per slot picks the
// operative AND its weapons; the Visionary's four weapon options are loadouts.
const B = (zh, en) => ({ zh, en });
const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) => ({ id, name: B(zh, en), type, atk, hit, dmg: [dn, dc], rules, group });
const P = (id, zh, en, z, e) => ({ id, cp: 1, name: B(zh, en), desc: B(z, e) });

const bolt = W('ncBolt', '爆彈手槍', 'Bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8 });
const plasmaPistol = [
  W('ncPlasmaPistol', '電漿手槍（標準）', 'Plasma pistol (standard)', 'ranged', 4, 3, 3, 5, { range: 8, piercing: 1 }, 'ncPlasmaPistol'),
  W('ncPlasmaPistolHot', '電漿手槍（超充）', 'Plasma pistol (supercharge)', 'ranged', 4, 3, 4, 5, { range: 8, hot: true, lethal: 5, piercing: 1 }, 'ncPlasmaPistol'),
];
const chainblade = W('ncChainblade', '諾斯特拉莫鏈鋸刃', 'Nostraman chainblade', 'melee', 5, 3, 4, 5, { rending: true });
const powerFist = W('ncPowerFist', '動力拳', 'Power fist', 'melee', 5, 4, 5, 7, { brutal: true });
const powerMaul = W('ncPowerMaul', '動力錘', 'Power maul', 'melee', 5, 3, 4, 6, { shock: true });
const powerWeapon = W('ncPowerWeapon', '動力武器', 'Power weapon', 'melee', 5, 3, 4, 6, { lethal: 5 });
const scopedShort = W('ncScopedShort', '瞄準爆彈手槍（近距）', 'Scoped bolt pistol (short range)', 'ranged', 4, 3, 3, 4, { range: 8, lethal: 5 }, 'ncScoped');
const scopedLong = W('ncScopedLong', '瞄準爆彈手槍（遠距）', 'Scoped bolt pistol (long range)', 'ranged', 4, 3, 3, 4, {}, 'ncScoped');
const vial = W('ncVial', '恐懼毒瓶', 'Terrorchem vial', 'ranged', 5, 3, 2, 0, { range: 6, blast: 2, devastating: 3, limited: 1, saturate: true, terrorchem: true });
const tainted = W('ncTainted', '污染刀', 'Tainted blade', 'melee', 5, 3, 3, 5, { terrorchem: true });
const fists = W('ncFists', '徒手', 'Fists', 'melee', 4, 3, 3, 4);
const flamer = W('ncFlamer', '火焰噴射器', 'Flamer', 'ranged', 4, 2, 3, 3, { range: 8, saturate: true, torrent: 2 });
const melta = W('ncMelta', '熔融槍', 'Meltagun', 'ranged', 4, 3, 6, 3, { range: 6, devastating: 4, piercing: 2 });
const plasmaGun = [
  W('ncPlasmaGun', '電漿槍（標準）', 'Plasma gun (standard)', 'ranged', 4, 3, 4, 6, { piercing: 1 }, 'ncPlasmaGun'),
  W('ncPlasmaGunHot', '電漿槍（超充）', 'Plasma gun (supercharge)', 'ranged', 4, 3, 5, 6, { hot: true, lethal: 5, piercing: 1 }, 'ncPlasmaGun'),
];
// (The heavy bolter isn't a bolt pistol / boltgun, so it doesn't satisfy the Astartes rule: notBolt.)
const hbFocused = W('ncHbFocused', '重型爆彈槍（集中）', 'Heavy bolter (focused)', 'ranged', 5, 3, 4, 5, { heavy: 'reposition', piercingCrits: 1, notBolt: true }, 'ncHeavyBolter');
const hbSweeping = W('ncHbSweeping', '重型爆彈槍（掃射）', 'Heavy bolter (sweeping)', 'ranged', 4, 3, 4, 5, { heavy: 'reposition', piercingCrits: 1, torrent: 1, notBolt: true }, 'ncHeavyBolter');
const missileFrag = W('ncMissileFrag', '飛彈發射器（破片）', 'Missile launcher (frag)', 'ranged', 4, 3, 3, 5, { blast: 2, heavy: 'reposition' }, 'ncMissile');
const missileKrak = W('ncMissileKrak', '飛彈發射器（穿甲）', 'Missile launcher (krak)', 'ranged', 4, 3, 5, 7, { heavy: 'reposition', piercing: 1 }, 'ncMissile');
const chainglaive = W('ncChainglaive', '諾斯特拉莫鏈鋸戟', 'Nostraman chainglaive', 'melee', 5, 3, 4, 6, { rending: true });
const claws = W('ncClaws', '閃電爪', 'Lightning claws', 'melee', 5, 3, 4, 5, { ceaseless: true, lethal: 5 });
const boltgun = W('ncBoltgun', '爆彈槍', 'Boltgun', 'ranged', 4, 3, 3, 4, {});
const chainsword = W('ncChainsword', '鏈鋸劍', 'Chainsword', 'melee', 5, 3, 4, 5);

const visionaryLoadouts = {
  fist: [bolt, powerFist], maul: [bolt, powerMaul], power: [bolt, powerWeapon], plasma: [...plasmaPistol, chainblade],
};
// g: operatives of the same kind (Gunners, Heavy Gunners, Warriors) — a kill team may have each kind once, except Warriors.
const O = (id, zh, en, weapons, extra = {}) => ({ id, name: B(zh, en), count: 0, apl: 3, move: 6, save: 3, wounds: 14, base: 32, weapons, ...extra });
const ops = [
  O('ncVisionary', '夜之領主預見者', 'Night Lord Visionary', [bolt, powerFist], { count: 1, wounds: 15, loadouts: visionaryLoadouts, ncVisionary: true, ncGroup: 'visionary' }),
  // The five default slots (and what each can be swapped for):
  O('ncFearmonger', '夜之領主恐懼販子', 'Night Lord Fearmonger', [scopedShort, scopedLong, vial, tainted], { count: 1, ncFearmonger: true, ncGroup: 'fearmonger' }),
  O('ncGunnerPlasma', '夜之領主槍手（電漿槍）', 'Night Lord Gunner (plasma gun)', [bolt, ...plasmaGun, fists], { count: 1, ncGroup: 'gunner' }),
  O('ncHeavyBolter', '夜之領主重武器手（重型爆彈槍）', 'Night Lord Heavy Gunner (heavy bolter)', [bolt, hbFocused, hbSweeping, fists], { count: 1, ncGroup: 'heavy' }),
  O('ncScreecher', '夜之領主尖嚎者', 'Night Lord Screecher', [claws], { count: 1, ncScreecher: true, ncAppetite: true, ncGroup: 'screecher' }),
  O('ncWarriorChain', '夜之領主戰士（鏈鋸劍）', 'Night Lord Warrior (bolt pistol, chainsword)', [bolt, chainsword], { count: 1, ncCruel: true, ncGroup: 'warrior' }),
  // The other choices:
  O('ncGunnerFlamer', '夜之領主槍手（火焰噴射器）', 'Night Lord Gunner (flamer)', [bolt, flamer, fists], { ncGroup: 'gunner' }),
  O('ncGunnerMelta', '夜之領主槍手（熔融槍）', 'Night Lord Gunner (meltagun)', [bolt, melta, fists], { ncGroup: 'gunner' }),
  O('ncHeavyMissile', '夜之領主重武器手（飛彈發射器）', 'Night Lord Heavy Gunner (missile launcher)', [bolt, missileFrag, missileKrak, fists], { ncGroup: 'heavy' }),
  O('ncSkinthief', '夜之領主剝皮者', 'Night Lord Skinthief', [bolt, chainglaive], { ncFlay: true, ncTyrant: true, ncGroup: 'skinthief' }),
  O('ncVentrilokar', '夜之領主腹語者', 'Night Lord Ventrilokar', [bolt, chainsword], { ncMimicry: true, ncIconBearer: true, ncGroup: 'ventrilokar' }),
  O('ncWarriorBolt', '夜之領主戰士（爆彈槍）', 'Night Lord Warrior (boltgun, fists)', [boltgun, fists], { ncCruel: true, ncGroup: 'warrior' }),
];
const SLOTS = ['ncFearmonger', 'ncGunnerPlasma', 'ncHeavyBolter', 'ncScreecher', 'ncWarriorChain'];
const PICKS = ['ncFearmonger', 'ncGunnerFlamer', 'ncGunnerMelta', 'ncGunnerPlasma', 'ncHeavyBolter', 'ncHeavyMissile', 'ncScreecher', 'ncSkinthief', 'ncVentrilokar', 'ncWarriorChain', 'ncWarriorBolt'];

export const NIGHTLORDS_TEAM = {
  id: 'nemesisClaw', name: B('復仇之爪', 'Nemesis Claw'), color: '#2e5d9e', astartes: true, keywords: ['CHAOS', 'HERETIC ASTARTES', 'NEMESIS CLAW'],
  rulesUrl: 'https://assets.warhammer-community.com/eng_17-06_kill_team_team_rules_nemesis_claw_online_rules-oyryxud2oc-jylng5bujl.pdf',
  style: B('混合隊・恐懼・午夜', 'Mixed · Terror · Midnight'),
  blurb: B('夜之領主的復仇之爪：一名預見者帶著五名殘忍的夜之領主。毒藥、恐懼和黑暗是他們的武器，被打傷的獵物逃不掉。', 'The Night Lords\' Nemesis Claw: a Visionary and five cruel Night Lords. Poison, fear and darkness are their weapons, and wounded prey does not get away.'),
  info: {
    archetypes: [B('滲透', 'Infiltration'), B('搜索與摧毀', 'Seek & Destroy')],
    kind: B('混合隊', 'Mixed'),
    oneBox: B('能', 'Yes'),
    buyable: B('能', 'Yes'),
    size: B('6 名特工', '6 operatives'),
    note: B('預見者＋從清單選 5 名（除了戰士，每種只能選一次）。每個名額的下拉選單同時選特工與武器；預見者的武器另外選。2D 簡化：沒有高低差，「午夜裝束」只看重型地形；「變聲模仿」的免費衝刺位置由系統挑選（把敵人拉離目標點）。', 'The Visionary plus five from the list (each once, except Warriors). Each slot\'s dropdown picks the operative and its weapons together; the Visionary\'s weapons are picked separately. 2D simplifications: no heights, In Midnight Clad only looks at Heavy terrain; Return to Darkness automatically picks a friendly and a destination by Heavy terrain; Disconcerting Mimicry\'s free Dash destination is chosen by the game (it pulls the enemy off objectives).'),
  },
  rule: {
    name: B('阿斯塔特・午夜裝束', 'Astartes · In Midnight Clad'),
    desc: B('阿斯塔特：每次啟動可射擊兩次或近戰兩次；射擊兩次時至少一次要用爆彈手槍、爆彈槍或瞄準爆彈手槍。任何指令都能反應。午夜裝束：敵人射擊友方特工時，若它距離看得到它的敵人都超過 8"、且在不低於它的重型地形 1" 內，它視為被遮蔽。',
      'Astartes: two Shoots or two Fights per activation; with two Shoots one must be a bolt pistol, boltgun or scoped bolt pistol. Counteract under either order. In Midnight Clad: when an enemy shoots a friendly operative that is more than 8" from the enemy operatives it\'s visible to and within 1" of Heavy terrain, it is obscured.'),
  },
  replacements: Object.fromEntries(SLOTS.map((id) => [id, PICKS])),
  ops,
  ploys: [
    P('ncBlackHunt', '黑暗狩獵', 'The Black Hunt', '本回合友方射擊、近戰或反擊受傷的敵人時，可以重擲一顆攻擊骰。', 'This TP, a friendly shooting, fighting or retaliating against a wounded enemy can re-roll one attack die.'),
    P('ncPreysight', '獵物視線', 'Preysight', '本回合每把遠程武器多一個「射程 6"、搜尋（輕型）」的版本可選（限用武器除外）。', 'This TP, each ranged weapon gets an extra version with Range 6" and Seek Light to pick (Limited weapons excepted).'),
    P('ncWeCome', '我們為你而來', 'We Have Come For You', '本回合友方啟動後第一個動作是衝鋒時：衝鋒結束對控制範圍內一名敵人造成 D3 傷害。', 'This TP, when a friendly\'s first action of an activation is a Charge, it inflicts D3 damage on an enemy in its control range at the end of the move.'),
    P('ncReturn', '回歸黑暗', 'Return to Darkness', '立刻：一名友方免費重新定位或撤退（最多 4"），要結束在重型地形旁，且不比之前更靠近敵人。', 'At once: a friendly makes a free Reposition or Fall Back (up to 4") that ends beside Heavy terrain and not closer to enemies.'),
  ],
  firefight: [
    P('ncDeathFalse', '誅殺偽帝', 'Death to the False Emperor', '自動：友方攻擊或被攻擊者是帝國單位時，擲骰後用「無休」；對方是阿斯塔特軍團則用「毫不留情」。', 'Auto: after rolling attack dice against an IMPERIUM operative, Ceaseless; Relentless if it is ADEPTUS ASTARTES.'),
    P('ncMurder', '嗜殺成性', 'Proclivity for Murder', '自動：友方在控制範圍內使敵人殘廢後，免費衝鋒（最多 3"）或衝刺一次，無視之前做過的動作。', 'Auto: after a friendly incapacitates an enemy within its control range, a free Charge (up to 3") or Dash, whatever it did before.'),
    P('ncVox', '尖嚎', 'Vox Scream', '自動：對手要啟動一名被友方看得到的特工時，擲 D6：高過它的 APL 就不能啟動它（改選別人）；否則 CP 退還、本回合不能再用。', 'Auto: when the opponent would activate an operative a friendly can see: D6 above its APL and it can\'t activate (they pick another); otherwise the CP is refunded and it can\'t be used again this TP.'),
    P('ncDirty', '卑鄙打法', 'Dirty Fighter', '自動：友方反擊時，先結算一個成功，之後這次戰鬥不能再結算其他成功。', 'Auto: a friendly retaliating resolves one success first, then no other successes in that sequence.'),
  ],
};

const GROUP_NAMES = { gunner: B('槍手', 'Gunner'), heavy: B('重武器手', 'Heavy Gunner') };
/** Roster limits: the Visionary plus five different operatives (Warriors can repeat; one Gunner and one Heavy Gunner at most). */
export function nightlordsRosterError(t, roster = {}) {
  const groups = SLOTS.map((slot) => t.ops.find((o) => o.id === (roster[slot] || slot)).ncGroup);
  const dup = [...new Set(groups.filter((x, i) => x !== 'warrior' && groups.indexOf(x) !== i))];
  if (!dup.length) return null;
  const name = (lang) => dup.map((x) => (GROUP_NAMES[x] || t.ops.find((o) => o.ncGroup === x).name)[lang]).join(lang === 'zh' ? '、' : ', ');
  return B(`重複選了：${name('zh')}（除了戰士，每種特工只能選一次）`, `Picked more than once: ${name('en')} (each operative only once, except Warriors)`);
}

export const NIGHTLORDS_EQUIPMENT = {
  ncSnare: { name: B('鎖鏈陷阱', 'Chain Snare'), desc: B('敵人在友方控制範圍內要撤退、且友方控制範圍內只有它一個敵人時（每回合一次）：擲兩顆 D6（它的生命較高則一顆），任一 4+ 就不能撤退（不花 AP）。', 'An enemy about to Fall Back within a friendly\'s control range, with no other enemy there (once per TP): two D6 (one if it has more Wounds), any 4+ and it can\'t (no AP spent).') },
  ncTrophy: { name: B('血腥戰利品', 'Grisly Trophy'), desc: B('整場一次：友方在 2" 內使敵人殘廢時，它獲得戰利品標記；有標記的友方看得到且 2" 內的敵人，武器 Atk -1。', 'Once per battle: a friendly incapacitating an enemy within 2" gains a Grisly Trophy token; enemies visible to and within 2" of it have -1 Atk on their weapons.') },
  ncSkin: { name: B('剝下的人皮', 'Flayed Skin'), desc: B('敵人射擊、近戰或反擊 2" 內的友方時，不能重擲攻擊骰結果 1。', 'An enemy shooting, fighting or retaliating against a friendly within 2" can\'t re-roll attack dice results of 1.') },
  ncJammers: { name: B('通訊干擾器', 'Comms Jammers'), desc: B('友方 3" 內的敵人 APL 不能被增加（已經改變的不受影響）。', 'An enemy within 3" of a friendly can\'t have its APL added to (changes already made are unaffected).') },
};
