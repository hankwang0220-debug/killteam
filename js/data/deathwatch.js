const B = (zh, en) => ({ zh, en });
const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) => ({ id, name: B(zh, en), type, atk, hit, dmg: [dn, dc], rules, group });
const P = (id, zh, en, z, e, extra = {}) => ({ id, cp: 1, name: B(zh, en), desc: B(z, e), ...extra });
const pistol = W('dwBoltPistol', '爆彈手槍', 'Bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8 });
const specialPistol = W('dwSpecialPistol', '特製爆彈手槍', 'Special issue bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8, piercing: 1 });
const fists = W('dwFists', '徒手', 'Fists', 'melee', 4, 3, 3, 4);
const O = (id, zh, en, weapons, extra = {}) => ({ id, name: B(zh, en), count: 1, apl: 3, move: 6, save: 3, wounds: 15, base: 32, weapons, ...extra });
const ops = [
  O('dwSergeant', '守望士官', 'Watch Sergeant', [
    W('dwPlasma', '電漿手槍（標準）', 'Plasma pistol (standard)', 'ranged', 4, 3, 3, 5, { range: 8, piercing: 1 }, 'dwPlasma'),
    W('dwPlasmaHot', '電漿手槍（超充）', 'Plasma pistol (supercharge)', 'ranged', 4, 3, 4, 5, { range: 8, hot: true, lethal: 5, piercing: 1 }, 'dwPlasma'),
    W('dwPower', '動力武器', 'Power weapon', 'melee', 5, 3, 4, 6, { lethal: 5 }),
  ], { dwCommand: true, ability: B('適應性軍械庫：本模擬器設定陣營與通用裝備合計最多四項。戰略指揮：在場時整場各一次免費使用策略／交戰計謀（自動）。', 'Adaptable Armoury: this simulator caps faction and universal equipment at four total. Strategic Command: while in the killzone, one free strategy and one free firefight ploy per battle (automatic).') }),
  O('dwAegis', '神盾老兵', 'Aegis Veteran', [pistol, W('dwMaul', '動力鎚與風暴盾', 'Power maul and storm shield', 'melee', 5, 3, 4, 6, { shock: true, shield: true })], { save: 2, dwStormShield: true, ability: B('風暴盾：遭射擊時穿甲減 1；近戰每次格擋可抵消兩顆成功骰。', 'Storm Shield: reduce incoming Piercing by 1; each melee block cancels two successes.') }),
  O('dwBlademaster', '劍術大師老兵', 'Blademaster Veteran', [specialPistol,
    W('dwDuel', '異相刃（決鬥）', 'Xenophase blade (duel)', 'melee', 5, 3, 4, 6, { brutal: true, lethal: 5, fixedHit: true }, 'dwBlade'),
    W('dwSweep', '異相刃（相位橫掃）', 'Xenophase blade (phase sweep)', 'melee', 4, 3, 4, 6, { brutal: true, lethal: 5, fixedHit: true, swipe: true }, 'dwBlade'),
  ], { dwAdaptiveSword: true, ability: B('適應性劍術：無視命中值變動；輪流解骰前可先免費格擋一次。相位橫掃可對其他交戰敵人各免費近戰一次。', 'Adaptive Swordsmanship: ignore Hit changes; one free initial block. Phase Sweep permits a free Fight against each other engaged enemy once.') }),
  O('dwDemolisher', '爆破老兵', 'Demolisher Veteran', [pistol, W('dwHammer', '重型雷鎚', 'Heavy thunder hammer', 'melee', 5, 4, 6, 7, { shock: true, stun: true })], { dwAggressive: true, ability: B('猛烈突擊：主動近戰獲得蠻橫，衝鋒後獲得無休。侵略力量：近戰承受 3+ 普通／暴擊傷害減 1，不與殺戮之盾疊加。', 'Brutal Assault: Brutal when fighting, Ceaseless after Charging. Aggressive Force: reduce melee Normal/Critical damage of 3+ by 1, not cumulative with The Shield That Slays.') }),
  O('dwGunner', '槍手老兵', 'Gunner Veteran', [pistol,
    W('dwIncinerator', '重型電漿焚化槍（標準）', 'Heavy plasma incinerator (standard)', 'ranged', 5, 3, 4, 6, { piercing: 1 }, 'dwIncinerator'),
    W('dwIncineratorHot', '重型電漿焚化槍（超充）', 'Heavy plasma incinerator (supercharge)', 'ranged', 5, 3, 5, 6, { piercing: 1, hot: true, lethal: 5 }, 'dwIncinerator'), fists]),
  O('dwBombard', '轟擊老兵', 'Bombard Veteran', [pistol,
    W('dwShell', '破片砲（砲彈）', 'Frag cannon (shell)', 'ranged', 4, 3, 5, 7, { piercing: 1 }, 'dwCannon'),
    W('dwShrapnel', '破片砲（碎片）', 'Frag cannon (shrapnel)', 'ranged', 5, 3, 4, 5, { torrent: 2 }, 'dwCannon'), fists], { count: 0, gravis: true, move: 5, wounds: 18, base: 40 }),
  O('dwBreacher', '突破老兵', 'Breacher Veteran', [
    W('dwAuxFrag', '輔助榴彈發射器（破片）', 'Auxiliary grenade launcher (frag)', 'ranged', 4, 3, 2, 4, { blast: 2 }, 'dwAux'),
    W('dwAuxKrak', '輔助榴彈發射器（穿甲）', 'Auxiliary grenade launcher (krak)', 'ranged', 4, 3, 4, 5, { piercing: 1 }, 'dwAux'),
    W('dwHellstorm', '地獄風暴爆彈步槍', 'Hellstorm bolt rifle', 'ranged', 4, 3, 4, 5, { torrent: 1 }),
    W('dwMeltaBomb', '熔融炸彈', 'Melta bomb', 'ranged', 4, 3, 5, 3, { range: 3, devastating: 3, heavy: 'reposition', limited: 1, piercing: 2 }), fists,
  ], { count: 0, gravis: true, move: 5, wounds: 18, base: 40 }),
  O('dwDisruptor', '干擾老兵', 'Disruptor Veteran', [W('dwCarbine', '精準爆彈卡賓槍', 'Marksman bolt carbine', 'ranged', 4, 3, 3, 4, { lethal: 5 }), fists], { count: 0, move: 7, wounds: 13, dwDisruptor: true, ability: B('全頻擾亂器：策略階段選可見或 6 吋內敵人，延後 D6 次啟動（或最後一名）。鳥卜儀三角定位：未交戰且看見射擊目標時，友方進階掃描免費；後續射擊須重新符合條件。', 'Advanced Omni-scrambler: select a visible enemy or one within 6 inches in Strategy; delay D6 activations (or until last ready). Auspex Triangulation: free Advanced Auspex Scan while unengaged and able to see the target; recheck subsequent shots.') }),
  O('dwHeadtaker', '取首老兵', 'Headtaker Veteran', [specialPistol, W('dwKnives', '戰鬥刀', 'Combat knives', 'melee', 5, 3, 4, 5)], { count: 0, move: 7, wounds: 13, dwHeadtaker: true, ability: B('秘密取首者：可在隱蔽命令下衝鋒；若敵人在本次啟動／反應開始時看不見他，首次攻擊可連續打擊兩次。重力傘／鉤索的垂直移動規則在目前平面戰場不適用。', 'Clandestine Headtaker: may Charge while Concealed; strike twice initially against an enemy that could not see it at activation/counteraction start. Grav-chute and grapnel vertical rules are inapplicable on this flat battlefield.') }),
  O('dwHordeSlayer', '屠群老兵', 'Horde-Slayer Veteran', [pistol,
    W('dwFlame', '煉獄重型爆彈槍（火焰）', 'Infernus heavy bolter (flame)', 'ranged', 5, 2, 3, 3, { range: 8, saturate: true, torrent: 2 }, 'dwInfernus'),
    W('dwFocused', '煉獄重型爆彈槍（集中）', 'Infernus heavy bolter (focused bolt)', 'ranged', 5, 3, 4, 5, { piercingCrits: 1 }, 'dwInfernus'),
    W('dwSweeping', '煉獄重型爆彈槍（掃射）', 'Infernus heavy bolter (sweeping bolt)', 'ranged', 4, 3, 4, 5, { piercingCrits: 1, torrent: 1 }, 'dwInfernus'), fists], { count: 0, gravis: true, move: 5, wounds: 18, base: 40 }),
  O('dwMarksman', '神射手老兵', 'Marksman Veteran', [
    W('dwStalkerMobile', '潛獵爆彈步槍（機動）', 'Stalker bolt rifle (mobile)', 'ranged', 4, 3, 3, 4, {}, 'dwStalker'),
    W('dwStalkerHeavy', '潛獵爆彈步槍（重型）', 'Stalker bolt rifle (heavy)', 'ranged', 4, 2, 3, 5, { heavy: 'dash', lethal: 5, piercingCrits: 1 }, 'dwStalker'), fists], { count: 0, dwMarksman: true, ability: B('警戒神射手：可執行警戒，不限戰場；敵人行動後自動警戒攻擊。近距離戰場每回合一次可免費再警戒，與本回合反應互斥。', 'Vigilant Marksman: Guard on any killzone, automatically attacking after a legal enemy action. In Close Quarters, one free re-Guard per TP, mutually exclusive with counteracting.') }),
];
export const DEATHWATCH_TEAM = {
  id: 'deathwatch', name: B('死亡守望', 'Deathwatch'), color: '#424650', astartes: true, anyAstartesShot: true, keywords: ['IMPERIUM', 'ADEPTUS ASTARTES'],
  style: B('混合隊・星際戰士老兵・特殊彈藥', 'Mixed · Veteran Space Marines · Special Issue Ammunition'),
  blurb: B('五名精銳老兵以專門武器與反異形戰術完成任務，可自由搭配近戰與射擊專家。', 'Five elite veterans combine specialist weapons and anti-xenos tactics.'),
  rulesUrl: 'https://assets.warhammer-community.com/eng_deathwatch_online_rules-vn8chdq2c8-xfl54bekws.pdf',
  info: { oneBox: B('否，至少兩盒（或三盒）', 'No; at least two (or three) boxes'), buyable: B('能', 'Yes'), size: B('5 名特工', '5 operatives'), kind: B('混合隊', 'Mixed'), archetypes: [B('搜索與摧毀', 'Seek & Destroy'), B('安全保護', 'Security')] },
  rule: { name: B('老兵阿斯塔特・特殊彈藥', 'Veteran Astartes · Special Issue Ammunition'), desc: B('啟動可射擊兩次或近戰兩次；特定武器兩次射擊或任一次使用熔融炸彈，第二次多付 1AP。任何命令均可反應，免費執行兩個不同的 1AP 動作，但不能同時射擊與近戰。每回合一個射擊動作可選特殊彈藥：爆裂 1（非洪流）、毀滅 1、致命 5+、暴擊穿甲 1、飽和或嚴重；不含爆炸手雷與熔融炸彈。', 'Two Shoots or two Fights per activation; two listed specialist-weapon Shoots, or either Shoot with a melta bomb, costs +1 AP for the second. Counteract under either order with two different 1AP actions, never both Shoot and Fight. Once per TP one Shoot gains Blast 1 (not Torrent), Devastating 1, Lethal 5+, Piercing Crits 1, Saturate or Severe; excludes explosive grenades and melta bombs.') },
  ploys: [P('noFear', '無所畏懼', 'And They Shall Know No Fear', '無視重傷造成的屬性變動。', 'Ignore injured stat changes.'), P('dwShieldSlays', '殺戮之盾', 'The Shield That Slays', '完全位於敵方領土時，4+ 普通傷害減 1。', 'Wholly within enemy territory: Normal damage of 4+ reduced by 1.'), P('dwMissionEngage', '任務戰術：交戰', 'Mission Tactics: Engage', '攻擊交戰命令的敵人時獲得平衡。', 'Balanced against Engage enemies.', { group: 'dwMission' }), P('dwMissionConceal', '任務戰術：隱蔽', 'Mission Tactics: Conceal', '攻擊隱蔽命令的敵人時獲得平衡。', 'Balanced against Conceal enemies.', { group: 'dwMission' }), P('dwLongVigil', '漫長守望', 'The Long Vigil', '完全位於己方領土時，可重擲一顆防禦骰。', 'Wholly within your territory: re-roll one defence die.')],
  firefight: [P('dwAuspex', '進階鳥卜儀掃描', 'Advanced Auspex Scan', '本次啟動／反應射擊獲得飽和，敵人不能被遮蔽；三角定位免費使用時逐次檢查目標。', 'Until activation/counteraction ends: ranged Saturate, no obscuring; free Triangulation rechecks every target.'), P('transhuman', '超人類生理', 'Transhuman Physiology', '防禦擲骰後自動將一顆普通成功升為暴擊。', 'Automatically promote one normal defence success to critical.'), P('dwSufferAlien', '不容異形', 'Suffer Not the Alien', '對無混沌／帝國關鍵字的敵人，擲骰後自動重擲失敗攻擊骰。', 'Against enemies without CHAOS/IMPERIUM, automatically re-roll failed attack dice.'), P('dwTracking', '預知追蹤', 'Auspicator Tracking', '反應開始、動作前改變命令。', 'Change order at counteraction start, before any actions.')],
  replacements: Object.fromEntries(ops.filter((o) => o.count).map((o) => [o.id, ops.map((x) => x.id)])), ops,
};
export const DEATHWATCH_EQUIPMENT = {
  dwCuffs: { name: B('Sanctus-V 生體掃描護腕', 'Sanctus-V Bioscryer Cuffs'), desc: B('每名特工每次啟動且未交戰時一次：回復 D3、清除 APL 變動或一種指定標記；有毒素／負面 APL 時啟動前自動清除。', 'Once each activation while unengaged: heal D3, clear APL changes or one specified token. Poison/negative APL is automatically cleared before activation effects.') },
  dwAmmoReserve: { name: B('彈藥儲備', 'Ammunition Reserve'), desc: B('整場一次，一回合可使用兩次特殊彈藥，詞條必須不同。第二次使用彈藥時自動消耗儲備。', 'Once per battle, use Special Issue Ammunition twice in a TP with different rules. Automatically consumed on the second use.') },
  dwDigital: { name: B('數位武器', 'Digital Weapons'), desc: B('每回合第一次主動近戰在擲骰前自動造成 1 傷害。', 'Automatically inflict 1 damage before the first friendly Fight roll each TP.') },
  dwThrall: { name: B('噬訊伺服僕從', 'Scrutavore Servo-thrall'), desc: B('每回合一次，啟動中下一個任務動作少 1AP，可交戰執行；交戰使用後擲骰比大小，對方獲勝則永久失去此裝備。', 'Once per TP, next mission action this activation costs 1 less AP and may be performed while engaged; afterwards roll off, permanently losing the equipment if the opponent wins.') },
};
export function deathwatchRosterError(t, roster = {}) {
  const ids = Object.keys(t.replacements).map((id) => roster[id] || id);
  if (new Set(ids).size !== 5) return B('死亡守望每種特工最多一名。', 'Deathwatch may include each operative only once.');
  if (ids.filter((id) => t.ops.find((o) => o.id === id)?.gravis).length > 1) return B('死亡守望最多一名重力裝甲特工。', 'Deathwatch may include at most one GRAVIS operative.');
  return null;
}

export const DW_AMMO = {
  blast: { name: B('特殊彈藥：爆裂 1', 'Ammo: Blast 1'), rules: { blast: 1 } },
  devastating: { name: B('特殊彈藥：毀滅 1', 'Ammo: Devastating 1'), rules: { devastating: 1 } },
  lethal: { name: B('特殊彈藥：致命 5+', 'Ammo: Lethal 5+'), rules: { lethal: 5 } },
  piercingCrits: { name: B('特殊彈藥：暴擊穿甲 1', 'Ammo: Piercing Crits 1'), rules: { piercingCrits: 1 } },
  saturate: { name: B('特殊彈藥：飽和', 'Ammo: Saturate'), rules: { saturate: true } },
  severe: { name: B('特殊彈藥：嚴重', 'Ammo: Severe'), rules: { severe: true } },
};
