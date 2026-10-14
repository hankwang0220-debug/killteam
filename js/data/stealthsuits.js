// XV26 Stealth Battlesuits (XV26 隱形戰鬥服): T'au infiltrating battlesuits.
// Source: https://assets.warhammer-community.com/eng_xv26_stealth_battlesuits_online_rules-ghynf2pcnr-7rcqocpns8.pdf (errata August '26)
// Every weapon choice (burst cannon or fusion blaster) is its own template. The Shas'vre and both drones are always in the kill team;
// four more come from the list (each once, except Infiltrators); two fusion blasters at most.
const B = (zh, en) => ({ zh, en });
const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) => ({ id, name: B(zh, en), type, atk, hit, dmg: [dn, dc], rules, group });
const P = (id, zh, en, z, e) => ({ id, cp: 1, name: B(zh, en), desc: B(z, e) });

const burstF = W('xvBurstF', '爆裂炮（集中）', 'Burst cannon (focused)', 'ranged', 5, 4, 3, 4, { ceaseless: true }, 'xvBurst');
const burstS = W('xvBurstS', '爆裂炮（掃射）', 'Burst cannon (sweeping)', 'ranged', 4, 4, 3, 4, { ceaseless: true, torrent: 1, xvSweep: true }, 'xvBurst');
const fusionS = W('xvFusionS', '熔融爆破槍（近距離）', 'Fusion blaster (short range)', 'ranged', 4, 4, 6, 3, { range: 6, devastating: 4, piercing: 2 }, 'xvFusion');
const fusionL = W('xvFusionL', '熔融爆破槍（遠距離）', 'Fusion blaster (long range)', 'ranged', 4, 4, 4, 5, { range: 12, piercing: 1 }, 'xvFusion');
const pistol = W('xvPistol', '脈衝手槍', 'Pulse pistol (ranged)', 'ranged', 4, 4, 4, 5, { range: 8 }, 'xvPistol');
const pistolPB = W('xvPistolPB', '脈衝手槍（近距離）', 'Pulse pistol (point-blank)', 'ranged', 3, 4, 4, 5, { accurate: 1 }, 'xvPistol');
const fists = W('xvFists', '拳頭', 'Fists', 'melee', 3, 4, 3, 4);
const emp = W('xvEmp', 'EMP 炸彈', 'EMP bomb', 'ranged', 5, 3, 2, 2, { range: 4, blast: 2, devastating: 1, heavy: 'reposition', lethal: 4, limited: 1, saturate: true });
const carbine = W('xvCarbine', '雙聯脈衝卡賓槍', 'Twin pulse carbine', 'ranged', 4, 4, 4, 5, { ceaseless: true });
const ram = W('xvRam', '衝撞', 'Ram', 'melee', 3, 5, 2, 3);
const GUN = { B: [burstF, burstS], F: [fusionS, fusionL] };
const GZH = { B: '爆裂炮', F: '熔融爆破槍' };

const O = (id, zh, en, weapons, extra = {}) => ({ id, name: B(zh, en), count: 0, apl: 3, move: 6, save: 3, wounds: 12, base: 32, weapons, xvSuit: true, ...extra });
const ops = [];
for (const k of ['B', 'F']) ops.push(O(`xvShasvre${k}`, `XV26 隊長（${GZH[k]}）`, `XV26 Shas'vre (${k === 'B' ? 'burst cannon' : 'fusion blaster'})`, [...GUN[k], pistol, pistolPB, fists], { wounds: 13, leader: true, xvShasvre: true, xvGun: k }));
ops.push(O('xvMarkerDrone', 'MV75 標記無人機', 'MV75 Marker Drone', [ram], { apl: 2, save: 4, wounds: 7, base: 28, drone: true, expendable: true, xvDrone: true, xvMarker: true, actionsOnly: ['charge', 'dash', 'fallBack', 'fight', 'reposition', 'shoot'] }));
ops.push(O('xvGunDrone', 'MV15 砲無人機', 'MV15 Gun Drone', [carbine, ram], { apl: 2, save: 4, wounds: 7, base: 28, drone: true, expendable: true, xvDrone: true, actionsOnly: ['charge', 'dash', 'fallBack', 'fight', 'xvPhoton', 'reposition', 'shoot'] }));
const ROLES = {
  Designator: ['標定者', 'Designator', { xvDesignator: true, xvMarker: true }],
  Infiltrator: ['滲透者', 'Infiltrator', { xvInfiltrator: true }],
  Liberator: ['解放者', 'Liberator', { xvLiberator: true, grenadier: true, spGrenadier: true, xvGrenadier: true }],
  Lodestar: ['磁石', 'Lodestar', { xvLodestar: true }],
  Neutraliser: ['中和者', 'Neutraliser', { xvNeutraliser: true }],
};
for (const [role, [zh, en, extra]] of Object.entries(ROLES)) for (const k of ['B', 'F']) {
  ops.push(O(`xv${role}${k}`, `XV26 ${zh}（${GZH[k]}）`, `XV26 ${en} (${k === 'B' ? 'burst cannon' : 'fusion blaster'})`, [...GUN[k], ...(role === 'Liberator' ? [emp] : []), fists], { ...extra, xvGun: k, xvRole: role }));
}
for (const o of ops) if (['xvShasvreB', 'xvMarkerDrone', 'xvGunDrone', 'xvDesignatorB', 'xvInfiltratorF', 'xvLiberatorB', 'xvNeutraliserB'].includes(o.id)) o.count = 1;
const PICKS = ops.filter((o) => o.xvRole).map((o) => o.id);

export const STEALTH_TEAM = {
  id: 'stealthSuits', name: B('XV26 隱形戰鬥服', 'XV26 Stealth Battlesuits'), color: '#5b7f8f', keywords: ["T'AU EMPIRE", 'XV26 STEALTH BATTLESUIT'],
  rulesUrl: 'https://assets.warhammer-community.com/eng_xv26_stealth_battlesuits_online_rules-ghynf2pcnr-7rcqocpns8.pdf',
  style: B('射擊隊・隱形・伏擊', 'Shooting · Stealth · Ambush'),
  blurb: B('鈦帝國的隱形戰鬥服老兵：隱蔽指令時 3" 外的敵人根本看不見他們；敵人越深入你的領地，射擊就越準（耐心獵人 Kauyon）。', 'T\'au veterans in stealth battlesuits: with a Conceal order no enemy more than 3" away can even see them, and the deeper the enemy comes into your territory the more accurate they shoot (Kauyon).'),
  info: {
    archetypes: [B('滲透', 'Infiltration'), B('偵察', 'Recon')],
    kind: B('射擊隊', 'Shooting'),
    oneBox: B('能，但是他們的熱熔炮可以給不同特工，對戰局有影響，想清楚後再裝', 'Yes, but the fusion blasters can go to different operatives and that matters — think it through before you build them'),
    buyable: B('能', 'Yes'),
    size: B('5 名特工＋2 架無人機', '5 operatives + 2 drones'),
    note: B('隊長＋標記無人機＋砲無人機＋4 名：標定者、解放者、磁石、中和者各只能選一次，滲透者可重複；整隊最多兩把熔融爆破槍。', 'Shas\'vre + Marker Drone + Gun Drone + 4: Designator, Liberator, Lodestar and Neutraliser once each, Infiltrators repeat; at most two fusion blasters.'),
  },
  rule: {
    name: B('隱形力場・耐心獵人', 'Stealth Fields · Kauyon'),
    desc: B('隱蔽指令時，3" 外的敵人看不到它；隱蔽指令撤退少 1AP。射擊敵人時依敵人位置獲得「精準 X」：在你領地 3" 內 1、在你領地內 2、在你降落區 3" 內 3。',
      'With a Conceal order it can\'t be visible to enemies more than 3" away, and it Falls Back for 1 less AP. Shooting an enemy its ranged weapons have Accurate X by where that enemy is: within 3" of your territory 1, in your territory 2, within 3" of your drop zone 3.'),
  },
  // Automatic rules the player can switch on (players start with them off).
  autoAbilities: [
    { id: 'xvChaff', name: B('電子箔片發射器', 'Electrochaff Launcher'), desc: B('磁石，每回合一次：敵人射擊它 3" 內的友方時，無視穿甲且被遮蔽。', 'Lodestar, once per TP: an enemy shooting a friendly within 3" of it ignores Piercing and the friendly is obscured.') },
    { id: 'xvSensor', name: B('多光譜感測組件', 'Multispectrum Sensor Package'), desc: B('中和者，每回合一次：敵人在 8" 內啟動時，3" 內的友方改為隱蔽。', 'Neutraliser, once per TP: an enemy activating within 8" — friendlies within 3" of it switch to Conceal.') },
    { id: 'xvMulti', equip: 'xvMulti', name: B('XV26 多重追蹤器', 'XV26 Multitrackers'), desc: B('每回合一次：爆裂炮（掃射）洪流 2"。', 'Once per TP: burst cannon (sweeping) Torrent 2".') },
    { id: 'xvBonds', ploy: 'xvBonds', name: B('團結紐帶', 'Bonds of Unity'), desc: B('買了計謀後：6" 內看得到友方時，無視 APL 改變與重傷的命中變差。', 'With the ploy: visible within 6" of another suit, ignore APL changes and the injured Hit penalty.') },
  ],
  replacements: {
    xvShasvreB: ['xvShasvreB', 'xvShasvreF'],
    xvDesignatorB: PICKS, xvInfiltratorF: PICKS, xvLiberatorB: PICKS, xvNeutraliserB: PICKS,
  },
  perCopyRoster: true,
  ops,
  ploys: [
    P('xvAmbush', '準備伏擊', 'Prepare Ambush', '在你領地內、離敵人 2" 以上放伏擊標記（點棋盤）：友方射擊標記 2" 內的敵人時武器「搜尋」（用一次就移除，或下回合準備步驟移除）；標記附近看得到的敵人也算被標記。', 'An Ambush marker wholly in your territory more than 2" from enemies (tap the board): a friendly shooting an enemy within 2" of it has Seek (removed after that action or in the next Ready step); visible enemies near it count as marked.'),
    P('xvHolowave', '全像波干擾', 'Holowave Countermeasures', '敵人在 6" 外射擊友方時，擲完攻擊骰要捨棄一個普通成功（沒有就捨棄暴擊）。不與遮蔽疊加。', 'An enemy shooting a friendly from more than 6" away discards one normal success (or a critical if none). Not cumulative with being obscured.'),
    P('xvPatient', '耐心獵手', 'Patient Hunters', '友方射擊或近戰已行動的敵人時，武器「平衡」，遠程武器「飽和」。', 'A friendly shooting or fighting an expended enemy has Balanced, and its ranged weapons Saturate.'),
    P('xvBonds', '團結紐帶', 'Bonds of Unity', '友方（無人機除外）啟動時，若在另一名友方 6" 內且看得到它：無視 APL 改變，並在本次啟動無視重傷造成的命中變差（自動選）。', 'A friendly (not a drone) activated visible within 6" of another: it ignores APL changes, and injured Hit penalties this activation (picked automatically).'),
  ],
  firefight: [
    P('xvJet', '噴射背包', 'Engage Jet Pack', '友方（無人機除外）啟動或反應時使用：本次無視攀爬與下落的垂直距離。', 'When a friendly (not a drone) activates or counteracts: it ignores the vertical distance of climbs and drops this time.'),
    P('xvSaviour', '救主協議', 'Saviour Protocols', '友方（無人機除外）被選為射擊目標時（勾選後自動）：改由它 3" 內看得到的友方無人機承受（爆裂、洪流武器無效）。', 'When a friendly (not a drone) is picked as the target of a Shoot (automatic once ticked): a friendly drone visible within 3" of it becomes the target instead (not against Blast or Torrent).'),
    P('xvRetro', '向量反推', 'Vectored Retro-Thrusters', '敵人衝鋒結束在友方（無人機除外）控制範圍內時（勾選後自動）：友方免費撤退最多 3"，不能被阻止。', 'When an enemy ends a Charge in a friendly\'s control range (not a drone; automatic): that friendly makes a free Fall Back of up to 3", which can\'t be prevented.'),
    P('xvGhost', '幽靈罩', 'Ghostshroud', '友方啟動結束時：Engage 改為隱蔽。每名友方整場一次。', 'At the end of a friendly\'s activation: Engage becomes Conceal. Once per friendly per battle.'),
  ],
};

/** Four picks (each once, except Infiltrators); two fusion blasters at most in the kill team. */
export function stealthRosterError(t, roster = {}) {
  const pick = (slot) => { const v = roster[slot]; return (Array.isArray(v) ? v[0] : v) || slot; };
  const ids = ['xvShasvreB', 'xvDesignatorB', 'xvInfiltratorF', 'xvLiberatorB', 'xvNeutraliserB'].map(pick);
  const ts = ids.map((id) => t.ops.find((o) => o.id === id));
  const bad = [];
  const roles = ts.filter((o) => o.xvRole).map((o) => o.xvRole);
  const dup = [...new Set(roles.filter((r, i) => r !== 'Infiltrator' && roles.indexOf(r) !== i))];
  if (dup.length) bad.push(B(`重複選了：${dup.map((r) => ROLES[r][0]).join('、')}（除了滲透者，每種只能選一次）`, `Picked more than once: ${dup.map((r) => ROLES[r][1]).join(', ')} (each only once, except Infiltrators)`));
  if (ts.filter((o) => o.xvGun === 'F').length > 2) bad.push(B('整隊最多兩把熔融爆破槍', 'At most two fusion blasters'));
  return bad.length ? B(bad.map((b) => b.zh).join('；'), bad.map((b) => b.en).join('; ')) : null;
}

export const STEALTH_EQUIPMENT = {
  xvBlacksun: { name: B('進階黑日濾鏡', 'Advanced Blacksun Filters'), desc: B('友方射擊被遮蔽的目標時，不用因遮蔽捨棄一個成功（其他遮蔽效果照常）。', 'A friendly shooting an obscured target doesn\'t discard a success for it (the other effects of obscured still apply).') },
  xvLocks: { name: B('硬接線目標鎖定', 'Hardwired Target Locks'), desc: B('反應時可以用一名隱蔽指令、離敵人 3" 以上的友方：先改為 Engage，這次反應只能射擊。', 'You can counteract with a friendly that has a Conceal order and is more than 3" from enemies: it changes to Engage first and can only Shoot in that counteraction.') },
  xvMulti: { name: B('XV26 多重追蹤器', 'XV26 Multitrackers'), desc: B('每回合一次（勾選後自動），用爆裂炮（掃射）射擊時，這次武器「洪流 2\"」。', 'Once per TP (automatic once ticked), shooting with a burst cannon (sweeping): Torrent 2" for that action.') },
  xvJammers: { name: B('反網路干擾器', 'Counter-Network Jammers'), desc: B('策略謀略（選一個目標點）：本回合爭奪那個標記時，若有敵人在友方 3" 內，敵方 APL 總和視為少 1。', 'Strategic gambit (pick an objective marker): this TP, enemies contesting it count 1 lower in APL total if one of them is within 3" of a friendly.') },
};
