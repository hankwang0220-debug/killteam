// Ratlings (萊特林): Astra Militarum Ratlings, with Ogryns and Bullgryns.
// Source: https://assets.warhammer-community.com/eng_29-04_kt_teamrules_ratlings-ulbqsnxhjb-jmv6tjlrsi.pdf (errata April '26)
// Every choice of weapons is its own operative template (e.g. rtBullMS = Bullgryn with a power maul and a slabshield), so one
// dropdown per slot picks the operative AND its weapons; the Fixer's two weapon options are loadouts.
const B = (zh, en) => ({ zh, en });
const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) => ({ id, name: B(zh, en), type, atk, hit, dmg: [dn, dc], rules, group });
const P = (id, zh, en, z, e) => ({ id, cp: 1, name: B(zh, en), desc: B(z, e) });

const fists = W('rtFists', '拳頭', 'Fists', 'melee', 3, 5, 1, 2);
const bionicArm = W('rtBionic', '義肢手臂', 'Bionic arm', 'melee', 3, 5, 3, 4);
const dagger = W('rtDagger', '匕首', 'Dagger', 'melee', 3, 4, 2, 3);
const knife = W('rtKnife', '戰鬥刀', 'Combat knife', 'melee', 3, 3, 3, 5, { balanced: true });
const bite = W('rtBite', '啃咬', 'Bite', 'melee', 4, 3, 2, 4);
// Rifles: the weapon name has to include "rifle" (the faction rules look for that).
const battleRifle2 = W('rtBattleRifleF', '戰鬥步槍', 'Battle rifle', 'ranged', 4, 2, 3, 4);
const battleRifle = W('rtBattleRifle', '戰鬥步槍', 'Battle rifle', 'ranged', 4, 3, 3, 4);
const sniper = (id, hit) => [
  W(`${id}M`, '狙擊步槍（機動）', 'Sniper rifle (mobile)', 'ranged', 4, 3, 3, 4, {}, `${id}R`),
  W(`${id}S`, '狙擊步槍（定點）', 'Sniper rifle (stationary)', 'ranged', 4, hit, 3, 3, { devastating: 3, heavy: true, rtStationary: true }, `${id}R`),
];
const suppressed = (id) => [
  W(`${id}M`, '消音狙擊步槍（機動）', 'Suppressed sniper rifle (mobile)', 'ranged', 4, 3, 3, 4, { silent: true }, `${id}R`),
  W(`${id}S`, '消音狙擊步槍（定點）', 'Suppressed sniper rifle (stationary)', 'ranged', 4, 3, 3, 3, { devastating: 2, heavy: true, silent: true, rtStationary: true, opticsLethal: true }, `${id}R`),
];
const tankstopper = [
  W('rtTankM', '反坦克步槍（機動）', 'Tankstopper rifle (mobile)', 'ranged', 4, 3, 4, 4, { devastating: 1, heavy: 'dash', piercing: 1 }, 'rtTankR'),
  W('rtTankS', '反坦克步槍（定點）', 'Tankstopper rifle (stationary)', 'ranged', 4, 2, 4, 2, { devastating: 4, heavy: true, piercing: 1, severe: true, rtStationary: true }, 'rtTankR'),
];
const arsenal = W('rtArsenal', '爆破軍火庫', 'Explosive arsenal', 'ranged', 5, 3, 4, 5, { range: 3, blast: 1, heavy: 'reposition', limited: 1, piercing: 1, saturate: true });
const ripper = W('rtRipper', '撕裂槍', 'Ripper gun', 'ranged', 4, 3, 4, 5, { range: 8, punishing: true });
const bayonet = W('rtBayonet', '刺刀', 'Bayonet', 'melee', 4, 3, 4, 5);
const gauntlet = W('rtGauntlet', '擲彈手套', 'Grenadier gauntlet', 'ranged', 4, 4, 3, 5, { blast: 2 });
const maul = W('rtMaul', '動力錘', 'Power maul', 'melee', 4, 3, 4, 6, { shock: true });
const bruteShield = W('rtBruteShield', '蠻力盾', 'Brute shield', 'melee', 4, 3, 3, 4);
const slabShield = W('rtSlabShield', '石板盾', 'Slabshield', 'melee', 4, 4, 3, 4);

const fixerLoadouts = { battle: [battleRifle2, fists], sniper: [...sniper('rtFixerSn', 2), fists] };

const O = (id, zh, en, weapons, extra = {}) => ({ id, name: B(zh, en), count: 0, apl: 2, move: 5, save: 5, wounds: 6, base: 25, rtRat: true, weapons, ...extra });
const BIG = { move: 6, wounds: 16, base: 40, rtBig: true, brute: true, slowWitted: true };
const bull = (id, zh, en, weapons, save) => O(id, zh, en, weapons, { ...BIG, save, rtBullgryn: true, rtBruteShield: weapons.includes(bruteShield) });
const ops = [
  O('rtFixer', '萊特林包打聽', 'Ratling Fixer', fixerLoadouts.battle, { count: 1, wounds: 7, loadouts: fixerLoadouts, rtFixer: true, munitorum: true }),
  O('rtBattlemutt', '萊特林戰犬', 'Ratling Battlemutt', [bite], { count: 1, move: 6, wounds: 4, rtMutt: true, actionsOnly: ['charge', 'dash', 'fallBack', 'fight', 'reposition'] }),
  O('rtBigShot', '萊特林大炮手', 'Ratling Big Shot', [...tankstopper, fists], { count: 1, base: 28 }),
  O('rtBomber', '萊特林爆破手', 'Ratling Bomber', [arsenal, ...sniper('rtBomber', 3), bionicArm], { count: 1, save: 4, rtBomber: true }),
  O('rtHardbit', '萊特林老兵', 'Ratling Hardbit', [battleRifle, knife], { count: 1, rtHunter: true }),
  O('rtRaider', '萊特林突襲兵', 'Ratling Raider', [...suppressed('rtRaider'), dagger], { count: 1, rtRaider: true, grapple: true }),
  O('rtSneak', '萊特林潛行者', 'Ratling Sneak', [...suppressed('rtSneak'), fists], { count: 1, optics: true, rtSneak: true }),
  O('rtSniper', '萊特林狙擊手', 'Ratling Sniper', [...sniper('rtSniper', 2), fists], { count: 1 }),
  O('rtSpotter', '萊特林觀測手', 'Ratling Spotter', [...sniper('rtSpotter', 3), fists], { count: 1, rtSpotter: true, support: 'spot' }),
  O('rtStashmaster', '萊特林補給官', 'Ratling Stashmaster', [...sniper('rtStash', 3), fists], { count: 1, lightFingered: true, wellStocked: true }),
  O('rtVoxThief', '萊特林偷聽手', 'Ratling Vox-thief', [...sniper('rtVox', 3), fists], { count: 1, rtVox: true, support: 'rtIntercept' }),
  O('rtOgryn', '歐格林', 'Ogryn', [ripper, bayonet], { ...BIG, bayonetCharge: true }),
  bull('rtBullGB', '重盾歐格林（擲彈手套＋蠻力盾）', 'Bullgryn (grenadier gauntlet, brute shield)', [gauntlet, bruteShield], 4),
  bull('rtBullGS', '重盾歐格林（擲彈手套＋石板盾）', 'Bullgryn (grenadier gauntlet, slabshield)', [gauntlet, slabShield], 3),
  bull('rtBullMB', '重盾歐格林（動力錘＋蠻力盾）', 'Bullgryn (power maul, brute shield)', [maul, bruteShield], 4),
  bull('rtBullMS', '重盾歐格林（動力錘＋石板盾）', 'Bullgryn (power maul, slabshield)', [maul, slabShield], 3),
];
const SLOTS = ['rtBattlemutt', 'rtBigShot', 'rtBomber', 'rtHardbit', 'rtRaider', 'rtSneak', 'rtSniper', 'rtSpotter', 'rtStashmaster', 'rtVoxThief'];
const PICKS = [...SLOTS, 'rtOgryn', 'rtBullGB', 'rtBullGS', 'rtBullMB', 'rtBullMS'];
const isBigId = (id) => ['rtOgryn', 'rtBullGB', 'rtBullGS', 'rtBullMB', 'rtBullMS'].includes(id);

export const RATLING_PLOYS = ['rtShifty', 'rtFrontline', 'rtSniperPos', 'rtCrack', 'rtLarcenous', 'rtShootHide', 'rtSurvival', 'rtSharpshot'];

export const RATLINGS_TEAM = {
  id: 'ratlings', name: B('萊特林', 'Ratlings'), color: '#a58b3c', keywords: ['IMPERIUM', 'ASTRA MILITARUM', 'RATLING'],
  rulesUrl: 'https://assets.warhammer-community.com/eng_29-04_kt_teamrules_ratlings-ulbqsnxhjb-jmv6tjlrsi.pdf',
  style: B('射擊隊・狙擊・逃跑', 'Shooting · Snipers · Scarper'),
  blurb: B('一名包打聽帶著十名矮小的狙擊手、戰犬與歐格林。他們打不贏正面對決，所以靠隱蔽、陷阱、偷東西和每次敵人行動後的逃跑活下去。', 'A Fixer with ten small snipers, a Battlemutt and Ogryns. They can\'t win a straight fight, so they hide, trap, thieve and scarper after every enemy activation.'),
  info: {
    archetypes: [B('滲透', 'Infiltration'), B('安全保護', 'Security')],
    kind: B('射擊隊', 'Shooting'),
    oneBox: B('否，需要另外購買歐格林', 'No; the Ogryns must be bought separately'),
    buyable: B('能', 'Yes'),
    size: B('11 名特工', '11 operatives'),
    note: B('包打聽＋10 名：除了狙擊手、歐格林、重盾歐格林外每種只能選一次；歐格林與重盾歐格林合計最多 3 名，每少選一名就能選一個萊特林計謀整場 0CP（下方勾選）。逃跑、預警、閃避由系統自動選特工與位置（每次敵人行動後，只在對你有利時使用）；狙擊手的「彈弓」可在棋盤上點落點。2D 簡化：沒有高低差與「可通行地形」。', 'The Fixer plus 10: each only once except Snipers, Ogryns and Bullgryns; Ogryns and Bullgryns together at most 3, and for each fewer than three you pick a Ratling ploy that costs 0CP for the battle (tick them below). Scarper, Early Warning and Evade pick the operative and destination automatically, and only when it helps (after each enemy action); the Raider\'s Slingshot destination is tapped on the board. 2D simplifications: no heights and no Accessible terrain.'),
  },
  rule: {
    name: B('逃跑', 'Scarper'),
    desc: B('每個敵方特工啟動結束後、下一個特工啟動前，一名友方萊特林（歐格林、重盾歐格林、潛行者除外）可以免費衝刺一次，但結束位置不能離敵人 3" 內，除非沒有任何敵人看得到它。每名特工每回合一次，整個回合最後一次啟動之後不能用。',
      'After each enemy operative\'s activation, before the next operative is activated, one friendly RATLING operative (not an Ogryn, Bullgryn or Sneak) can make a free Dash, but it cannot end that move within 3" of an enemy operative unless it isn\'t visible to any enemy operative. Each friendly operative once per turning point, and never after the final activation of the turning point.'),
  },
  // Ten picks: each once, except Snipers, Ogryns and Bullgryns (at most three of those two kinds together).
  replacements: Object.fromEntries(SLOTS.map((id) => [id, PICKS])),
  ops,
  ploys: [
    P('rtShifty', '鬼祟', 'Shifty', '友方萊特林（歐格林、重盾歐格林除外）是隱蔽指令且在掩護中時，不能被選為有效目標（優先於其他規則，除非在 2" 內）。', 'A friendly RATLING (not an Ogryn or Bullgryn) with a Conceal order and in cover can\'t be selected as a valid target (taking precedence over other rules, unless within 2").'),
    P('rtFrontline', '前線突擊', 'Frontline Assault', '友方歐格林或重盾歐格林在對手領土內、或在目標點 3" 內，射擊、近戰或反擊時武器「平衡」。', 'A friendly Ogryn or Bullgryn within your opponent\'s territory or within 3" of an objective marker has Balanced weapons when shooting, fighting or retaliating.'),
    P('rtSniperPos', '狙擊位置', 'Sniper Positions', '友方萊特林離敵人超過 6" 且在重型地形 1" 內時，它步槍的定點版本獲得「靜音」。', 'A friendly RATLING more than 6" from enemy operatives and within 1" of Heavy terrain: the stationary profile of its rifle has Silent.'),
    P('rtCrack', '神射手', 'Crack Shots', '友方萊特林射擊超過 6" 外的敵人時，若這次啟動沒有衝鋒、撤退或重新定位（或是反擊），它的步槍「平衡」。射擊後仍可以做那些動作。', 'A friendly RATLING shooting an enemy more than 6" away, if it hasn\'t made a Charge, Fall Back or Reposition this activation (or it\'s a counteraction): its rifle has Balanced. It isn\'t restricted from those actions after shooting.'),
  ],
  firefight: [
    P('rtLarcenous', '手腳不乾淨', 'Larcenous', '友方萊特林（歐格林、重盾歐格林除外）啟動中：到這次啟動結束，撿標記和任務動作只要爭奪標記即可（不用控制），敵人在控制範圍內也不阻止。', 'During a friendly RATLING\'s activation (not an Ogryn or Bullgryn): until it ends, Pick Up Marker and mission actions only need it to contest the marker (not control it), and an enemy in its control range doesn\'t prevent them.'),
    P('rtShootHide', '射了就躲', 'Shoot and Hide', '交戰指令的友方萊特林用步槍射擊後：若離敵人超過 3"、或沒有敵人看得到它，可以改為隱蔽指令。', 'After a friendly RATLING with an Engage order Shoots with a rifle: if it\'s more than 3" from enemies, or no enemy can see it, change its order to Conceal.'),
    P('rtSurvival', '求生本能', 'Survival Instincts', '自動：敵人射擊或近戰友方萊特林（歐格林、重盾歐格林除外）、分配格擋骰時，普通成功可以格擋一個暴擊；暴擊成功可以格擋兩個成功（普通或暴擊）。', 'Auto: when an enemy shoots or fights a friendly RATLING (not an Ogryn or Bullgryn) and blocks are allocated, a normal success can block one critical success; a critical success can block two successes (normal or critical).'),
    P('rtSharpshot', '精準一擊', 'Sharpshot', '友方萊特林用步槍射擊、選有效目標時：友方萊特林在敵人控制範圍內，不阻止選它。', 'A friendly RATLING shooting with a rifle, selecting a valid target: other friendly RATLING operatives in an enemy\'s control range don\'t prevent selecting it.'),
  ],
};

/** How many Ratling ploys cost 0CP for the battle: three minus the Ogryns and Bullgryns taken. */
export function ratFreeCount(t, roster = {}) {
  const gryns = SLOTS.filter((slot) => isBigId(roster[slot] || slot)).length;
  return Math.max(0, 3 - gryns);
}
/** A legal list of free ploys: known ids, each once, no more than the allowance. */
export const cleanRatFree = (list = [], n = 0) => [...new Set(list.filter((id) => RATLING_PLOYS.includes(id)))].slice(0, n);
/** The computer's default: Crack Shots, Sniper Positions, Shifty. */
export const DEFAULT_RAT_FREE = ['rtCrack', 'rtSniperPos', 'rtShifty'];

/** Roster limits: each once, except Snipers, Ogryns and Bullgryns; at most three Ogryns and Bullgryns together. */
export function ratlingsRosterError(t, roster = {}) {
  const ids = SLOTS.map((slot) => roster[slot] || slot);
  const bad = [];
  const dup = [...new Set(ids.filter((id, i) => id !== 'rtSniper' && !isBigId(id) && ids.indexOf(id) !== i))];
  if (dup.length) bad.push(B(`重複選了：${dup.map((id) => t.ops.find((o) => o.id === id).name.zh).join('、')}（只有狙擊手、歐格林、重盾歐格林能重複）`, `Picked more than once: ${dup.map((id) => t.ops.find((o) => o.id === id).name.en).join(', ')} (only Snipers, Ogryns and Bullgryns can repeat)`));
  if (ids.filter(isBigId).length > 3) bad.push(B('歐格林與重盾歐格林合計最多 3 名', 'At most three Ogryns and Bullgryns together'));
  return bad.length ? B(bad.map((b) => b.zh).join('；'), bad.map((b) => b.en).join('; ')) : null;
}

export const RATLINGS_EQUIPMENT = {
  rtStolen: { name: B('贓物', 'Stolen Goods'), desc: B('選擇特工步驟結束時擲一顆 D3：1 你失去 1CP；2 你獲得 1CP；3 對手失去 1CP。', 'At the end of the Select Operatives step roll a D3: 1 you lose 1CP; 2 you gain 1CP; 3 your opponent loses 1CP.') },
  rtArmour: { name: B('即興護甲', 'Improvised Armour'), desc: B('敵人射擊友方歐格林或重盾歐格林時，防禦骰 5+ 視為暴擊成功。', 'When an operative shoots a friendly Ogryn or Bullgryn, defence dice of 5+ are critical successes.') },
  rtRations: { name: B('偷來的口糧', 'Purloined Rations'), desc: B('每回合一次（自動，有幫助時）：友方萊特林用步槍射擊、擲完攻擊骰後，這次步槍命中值改善 1。', 'Once per TP (automatic, when it helps): a friendly RATLING shooting with a rifle, after rolling attack dice, improves the rifle\'s Hit by 1 for that sequence.') },
  rtLucky: { name: B('幸運子彈', 'Lucky Round'), desc: B('每回合一次（自動，有幫助時）：友方萊特林用步槍射擊、擲完攻擊骰後，這次步槍獲得「嚴重」。', 'Once per TP (automatic, when it helps): a friendly RATLING shooting with a rifle, after rolling attack dice, has Severe for that sequence.') },
};
