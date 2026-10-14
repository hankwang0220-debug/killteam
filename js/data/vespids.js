// Vespid Stingwings (胡蜂尖翼): T'au auxiliary flying insectoids.
// Source: https://assets.warhammer-community.com/eng_vespid_stingwings_online_rules-im3is77cs2-gtnx7xocbs.pdf (errata August '26)
// The Strain Leader and the Oversight Drone are always in the kill team; nine more come from the list (each once, except Warriors).
const B = (zh, en) => ({ zh, en });
const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) => ({ id, name: B(zh, en), type, atk, hit, dmg: [dn, dc], rules, group });
const P = (id, zh, en, z, e) => ({ id, cp: 1, name: B(zh, en), desc: B(z, e) });

const claws = W('vsClaws', '爪', 'Claws', 'melee', 3, 4, 3, 4, { vsClaws: true });
const blasterL = W('vsBlasterL', '中子爆能槍', 'Neutron blaster', 'ranged', 4, 3, 3, 3, { devastating: 2, vsNeutron: true });
const blaster = W('vsBlaster', '中子爆能槍', 'Neutron blaster', 'ranged', 4, 4, 3, 3, { devastating: 2, vsNeutron: true });
const ram = W('vsRam', '衝撞', 'Ram', 'melee', 3, 5, 1, 2);
const railS = W('vsRailS', '中子軌道步槍（標準）', 'Neutron rail rifle (standard)', 'ranged', 4, 4, 4, 4, { devastating: 2, vsNeutron: true, vsFragment: true }, 'vsRail');
const railA = W('vsRailA', '中子軌道步槍（瞄準）', 'Neutron rail rifle (aimed)', 'ranged', 4, 3, 4, 4, { devastating: 2, heavy: 'dash', lethal: 5, vsNeutron: true, vsFragment: true }, 'vsRail');
const launcher = W('vsLauncher', '中子榴彈發射器', 'Neutron grenade launcher', 'ranged', 4, 4, 3, 3, { blast: 2, devastating: 2, vsNeutron: true, vsFallout: true });
const sting = W('vsSting', '中子螫針', 'Neutron sting', 'ranged', 4, 4, 3, 3, { range: 8, devastating: 2, vsNeutron: true });
const grenade = W('vsGrenade', '中子手榴彈', 'Neutron grenade', 'ranged', 4, 4, 3, 3, { range: 6, blast: 2, devastating: 2, limited: 1, saturate: true, vsNeutron: true });
const flamer = W('vsFlamer', '噴火器（標準）', 'Flamer (standard)', 'ranged', 4, 2, 3, 3, { range: 8, saturate: true, torrent: 2 }, 'vsFlamer');
export const VS_SKYTORCH = W('vsSkytorch', '噴火器（天焰）', 'Flamer (skytorch)', 'ranged', 4, 2, 3, 3, { saturate: true, vsSkytorch: true }, 'vsFlamer');

const O = (id, zh, en, weapons, extra = {}) => ({ id, name: B(zh, en), count: 0, apl: 2, move: 6, save: 5, wounds: 9, base: 28, weapons, vsVespid: true, jumpPack: true, ...extra });
const ops = [
  O('vsLeader', '胡蜂族群首領', 'Vespid Strain Leader', [blasterL, claws], { count: 1, wounds: 10, leader: true, vsLeader: true }),
  O('vsDrone', '監視無人機', 'Oversight Drone', [ram], { count: 1, move: 8, save: 2, wounds: 5, base: 25, vsDrone: true, vsNoPierce: true, actionsOnly: ['vsGuidance', 'charge', 'dash', 'fallBack', 'fight', 'reposition'] }),
  O('vsLongsting', '胡蜂長刺', 'Vespid Longsting', [railS, railA, claws], { count: 1, vsLongsting: true }),
  O('vsShadestrain', '胡蜂暗影族', 'Vespid Shadestrain', [sting, grenade, claws], { count: 1, save: 3, vsShadestrain: true, vsNoPierce: true }),
  O('vsSkyblast', '胡蜂天爆者', 'Vespid Skyblast', [launcher, claws], { count: 1, vsSkyblast: true }),
  O('vsSwarmguard', '胡蜂群衛', 'Vespid Swarmguard', [flamer, claws], { count: 1, vsSwarmguard: true }),
  O('vsWarrior', '胡蜂戰士', 'Vespid Warrior', [blaster, claws], { count: 5, vsWarrior: true }),
];
const PICKS = ['vsLongsting', 'vsShadestrain', 'vsSkyblast', 'vsSwarmguard', 'vsWarrior'];

export const VESPIDS_TEAM = {
  id: 'vespids', name: B('胡蜂尖翼', 'Vespid Stingwings'), color: '#3fa7c9', keywords: ["T'AU EMPIRE", 'VESPID STINGWING'],
  rulesUrl: 'https://assets.warhammer-community.com/eng_vespid_stingwings_online_rules-im3is77cs2-gtnx7xocbs.pdf',
  style: B('射擊隊・飛行・中子武器', 'Shooting · Flying · Neutron weapons'),
  blurb: B('鈦帝國收編的昆蟲戰士：每次移動都能飛起來越過地形，移動過後中子武器「穿甲 1」；但牠們只會本能地攻擊最近的敵人，要花交融點數才能聽指揮。', 'Insectoid auxiliaries of the T\'au: they can fly over terrain whenever they move, and moving charges their neutron weapons with Piercing 1 — but they instinctively attack the closest enemy unless you spend Communion points.'),
  info: {
    archetypes: [B('偵察', 'Recon'), B('搜索與摧毀', 'Seek and Destroy')],
    kind: B('射擊隊', 'Shooting'),
    oneBox: B('能', 'Yes'),
    buyable: B('能', 'Yes'),
    size: B('11 名特工', '11 operatives'),
    note: B('族群首領＋監視無人機＋9 名：長刺、暗影族、天爆者、群衛各只能選一次，戰士可重複。', 'Strain Leader + Oversight Drone + 9: Longsting, Shadestrain, Skyblast and Swarmguard once each, Warriors repeat.'),
  },
  rule: {
    name: B('交融・飛行・中子充能', 'Communion · Fly · Neutron Charge'),
    desc: B('準備步驟獲得 D3 交融點數（監視無人機在場上 +1），上回合的作廢。射擊時只能打 8" 內最近的敵人（其他友方胡蜂控制範圍內的敵人不算），除非花 1 點；衝鋒必須結束在能衝到的最近敵人控制範圍內，除非花 1 點；撿標記和任務行動要花 1 點；射擊時可以花 1 點重擲一顆攻擊骰（無人機不受這些限制）。移動時可以飛行（直接重新放在移動距離內）。移動或飛行後本回合中子武器「穿甲 1」。',
      'In the Ready step you gain D3 Communion points (+1 with the Oversight Drone in the killzone); the old ones are lost. Shooting it can only target the closest enemy within 8" (not one in another friendly Vespid\'s control range) unless you spend 1; a Charge must end in control range of the closest enemy it can reach unless you spend 1; Pick Up and mission actions cost 1 point; shooting you can spend 1 to re-roll an attack die (the Drone ignores all this). It can FLY whenever it moves (set up again within its move). After moving or flying its neutron weapons have Piercing 1 for the turning point.'),
  },
  replacements: { vsLongsting: PICKS, vsShadestrain: PICKS, vsSkyblast: PICKS, vsSwarmguard: PICKS, vsWarrior: PICKS },
  perCopyRoster: true,
  ops,
  ploys: [
    P('vsExo', '硬化外骨骼', 'Hardened Exoskeleton', '友方胡蜂（監視無人機除外）近戰或反擊時，4 以上的普通傷害少 1。', 'A friendly VESPID STINGWING (not the Oversight Drone) fighting or retaliating takes 1 less from Normal Dmg of 4 or more.'),
    P('vsAgility', '空中靈巧', 'Aerial Agility', '敵人在反應或打斷中、或在本次啟動移動過或被放置後射擊友方胡蜂時：一顆攻擊骰造成普通傷害時擲 D6，5+ 無視（每次射擊一次）。', 'When an enemy shoots a friendly VESPID STINGWING while counteracting or interrupting, or in an activation in which it moved or was set up: roll a D6 when an attack die would inflict Normal Dmg, on a 5+ ignore it (once per Shoot).'),
    P('vsPredators', '空中掠食者', 'Airborne Predators', '友方胡蜂在啟動中移動或飛行後，到啟動結束武器獲得「平衡」。', 'A friendly VESPID STINGWING that moves or flies during its activation has Balanced weapons until the end of that activation.'),
    P('vsStingPloy', '螫刺', 'Sting', '友方胡蜂的爪命中 +1，並獲得「致命 5+」與「震懾」。', 'Friendly VESPID STINGWING claws improve their Hit by 1 and have Lethal 5+ and Shock.'),
  ],
  firefight: [
    P('vsOcelli', '單眼', 'Ocelli', '友方胡蜂在飛行過的啟動中射擊時，視為站在高處地形上高 3"。（2D 版本沒有高度，因此沒有效果）', 'A friendly VESPID STINGWING shooting in an activation in which it flew counts as 3" higher on Vantage terrain. (No effect in 2D: there are no heights.)'),
    P('vsDart', '疾飛', 'Darting Flight', '友方胡蜂重新定位前使用：本次多移動 D3"（飛行也多 D3"），但本回合不能射擊或近戰。', 'Before a friendly VESPID STINGWING Repositions: it moves (or flies) D3" further, but can\'t Shoot or Fight for the rest of the turning point.'),
    P('vsOverload', '中子超載', 'Neutron Overload', '友方胡蜂在移動或飛行過的啟動中用中子武器射擊、結算暴擊時，目標在 4" 內則額外 D3 傷害（射擊前選）。', 'A friendly VESPID STINGWING shooting a neutron weapon in an activation in which it moved or flew: when you resolve a critical success against a target within 4", D3 more damage (chosen before the Shoot).'),
    P('vsVenom', '惡毒毒液', 'Vicious Venom', '友方胡蜂（監視無人機除外）近戰中以暴擊打擊時，額外 D3 傷害（自動）。', 'When a friendly VESPID STINGWING (not the Oversight Drone) strikes with a critical success in a fight, D3 more damage (automatic).'),
  ],
};

/** Nine picks: each once, except Warriors. */
export function vespidsRosterError(t, roster = {}) {
  const pick = (slot, n) => { const v = roster[slot]; return Array.from({ length: n }, (_, i) => (Array.isArray(v) ? v[i] : v) || slot); };
  const ids = [...pick('vsLongsting', 1), ...pick('vsShadestrain', 1), ...pick('vsSkyblast', 1), ...pick('vsSwarmguard', 1), ...pick('vsWarrior', 5)];
  const dup = [...new Set(ids.filter((id, i) => id !== 'vsWarrior' && ids.indexOf(id) !== i))];
  if (!dup.length) return null;
  const nm = (lang) => dup.map((id) => t.ops.find((o) => o.id === id).name[lang]).join(lang === 'zh' ? '、' : ', ');
  return B(`重複選了：${nm('zh')}（除了戰士，每種只能選一次）`, `Picked more than once: ${nm('en')} (each only once, except Warriors)`);
}

export const VESPIDS_EQUIPMENT = {
  vsNeuro: { name: B('神經興奮劑', 'Neurostimulant'), desc: B('準備步驟決定交融點數時，擲兩顆 D3 取較高的。', 'In the Ready step, roll two D3 for Communion points and use the higher.') },
  vsConvergence: { name: B('聚合興奮劑', 'Convergence Stimulant'), desc: B('每回合一次，一名友方胡蜂撿標記或做任務行動時不用花交融點數（自動）。', 'Once per TP, a friendly VESPID STINGWING can Pick Up a marker or perform a mission action without spending a Communion point (automatic).') },
  vsAccelerant: { name: B('加速興奮劑', 'Accelerant Stimulant'), desc: B('友方胡蜂（監視無人機除外）衝鋒或衝刺時多移動 1"（飛行也多 1"）。', 'A friendly VESPID STINGWING (not the Oversight Drone) Charging or Dashing moves (or flies) 1" further.') },
  vsAggression: { name: B('侵略興奮劑', 'Aggression Stimulant'), desc: B('友方胡蜂（監視無人機除外）近戰時近戰武器獲得「無休」。', 'A friendly VESPID STINGWING (not the Oversight Drone) fighting has Ceaseless on its melee weapons.') },
};
/** The strategy ploys the Strain Leader's Commune can make free. */
export const VS_COMMUNE_PLOYS = ['vsExo', 'vsAgility', 'vsPredators', 'vsStingPloy'];
