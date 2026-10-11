const B = (zh, en) => ({ zh, en });
const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) => ({ id, name: B(zh, en), type, atk, hit, dmg: [dn, dc], rules, group });
const P = (id, zh, en, z, e) => ({ id, cp: 1, name: B(zh, en), desc: B(z, e) });
const bolt = W('mwBolt', '爆彈手槍', 'Bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8 });
const plasma = [W('mwPlasma', '電漿手槍（標準）', 'Plasma pistol (standard)', 'ranged', 4, 3, 3, 5, { range: 8, piercing: 1 }, 'mwPlasma'), W('mwPlasmaHot', '電漿手槍（超充）', 'Plasma pistol (supercharge)', 'ranged', 4, 3, 4, 5, { range: 8, piercing: 1, lethal: 5, hot: true }, 'mwPlasma')];
const power = W('mwPower', '動力武器', 'Power weapon', 'melee', 5, 3, 4, 6, { lethal: 5 });
const fist = W('mwFist', '動力拳', 'Power fist', 'melee', 4, 3, 5, 7, { brutal: true, shock: true });
const claw = W('mwClaw', '閃電爪', 'Lightning claw', 'melee', 5, 3, 4, 5, { lethal: 5, rending: true });
const chain = W('mwChain', '鏈鋸劍', 'Chainsword', 'melee', 5, 3, 4, 5);
const fists = W('mwFists', '徒手', 'Fists', 'melee', 4, 3, 3, 4);
const loadouts = (melees) => Object.fromEntries(melees.flatMap((m) => [['bolt' + m.id, [bolt, m]], ['plasma' + m.id, [...plasma, m]]]));
const lordLoadouts = { ...loadouts([power, fist, claw]), relic: [W('mwRelic', '遺物閃電雙爪', 'Relic lightning claws', 'melee', 5, 3, 4, 6, { ceaseless: true, lethal: 5, rending: true })] };
const champLoadouts = loadouts([power, fist]);
const raptorLoadouts = { bolt: [bolt, chain], plasma: [...plasma, chain] };
const skyLoadouts = {
  flamer: [W('mwFlamer', '火焰噴射器', 'Flamer', 'ranged', 4, 2, 3, 3, { range: 8, saturate: true, torrent: 2 }), bolt, fists],
  melta: [W('mwMelta', '熔融槍', 'Meltagun', 'ranged', 4, 3, 6, 3, { range: 6, devastating: 4, piercing: 2 }), bolt, fists],
  plasma: [W('mwPlasmaGun', '電漿槍（標準）', 'Plasma gun (standard)', 'ranged', 4, 3, 4, 6, { piercing: 1 }, 'mwPlasmaGun'), W('mwPlasmaGunHot', '電漿槍（超充）', 'Plasma gun (supercharge)', 'ranged', 4, 3, 5, 6, { piercing: 1, hot: true, lethal: 5 }, 'mwPlasmaGun'), bolt, fists],
};
const O = (id, zh, en, weapons, extra = {}) => ({ id, name: B(zh, en), count: 1, apl: 3, move: 6, save: 3, wounds: 14, base: 32, jumpPack: true, weapons, ...extra });
const ops = [
  O('mwLord', '混沌領主', 'Chaos Lord', lordLoadouts.boltmwPower, { wounds: 15, base: 40, loadouts: lordLoadouts, mwLord: true, ability: B('詛咒之路：起始 1 點。每動作一次可嘗試防護（承受 3+ 傷害骰時減去點數）或近戰打擊加點數；D6 高於點數成功並 +1 點，等於無效，低於自身受等同點數傷害。6 點自動成功。模擬器自動嘗試首次符合的恩賜。', 'Path to Damnation: start at 1 point. Once per action attempt to reduce a damaging die of 3+ or add strike damage by current points. D6 above points succeeds and gains 1 point, equal fails, below deals points of self-damage. At 6 automatically succeeds. The first eligible boon is attempted automatically.') }),
  O('mwChampion', '冠軍', 'Champion', champLoadouts.boltmwPower, { loadouts: champLoadouts, mwChampion: true, ability: B('混沌冠軍：策略階段挑戰最近敵人；對它近戰獲得嚴重（可在正式規則選平衡、蠻橫、懲罰、嚴重或震撼）。領主擊殺挑戰目標獲得 1CP。', 'Chaos Champion: automatically challenge the nearest enemy in Strategy; melee against it gains Severe (tabletop also permits Balanced, Brutal, Punishing or Shock). Lord killing the challenged enemy gains 1CP.') }),
  O('mwCurseclaw', '詛咒爪', 'Curseclaw', [bolt, W('mwMutated', '變異利爪', 'Mutated claws', 'melee', 5, 3, 4, 5, { rending: true })], { mwSnatch: true, mwFrenzied: true, ability: B('狂暴攻擊：近戰殘廢前以一顆未解成功打擊。掠取（1AP）：噴射移動後對通道敵人以 D6＋生命上限對抗，勝出自動拉到落點旁合法位置。', 'Frenzied Attack: strike with an unresolved success before falling in a Fight. Snatch (1AP): after a boost roll D6 + Wounds against an enemy in its zone; on a win automatically pull it to a legal location beside the landing point.') }),
  O('mwDepredator', '掠殺者', 'Depredator', [bolt, W('mwAxe', '大型鏈鋸斧', 'Great chainaxe', 'melee', 5, 4, 5, 7, { brutal: true })], { mwCarving: true, dismember: true, ability: B('恐怖肢解：近戰擊殺後，另一名可見且距自己或死者 3 吋內敵人 APL -1。雕斬（1AP）：2 吋內每名其他可見特工各受 2D3；不能隱蔽，不能同啟動使用切割、爪甲衝鋒或兩次近戰。', 'Horrifying Dismemberment: a melee kill reduces another visible enemy within 3 inches of self or victim by 1 APL. Carving Blow (1AP): 2D3 to every other visible operative within 2 inches; no Conceal, Slice from Above, Clawed Charge or two Fights in the same activation.') }),
  O('mwHuntmaster', '獵殺大師', 'Huntmaster', [bolt, power], { mwHunt: true, ability: B('釘住獵物：只有一名交戰敵人時，撤退前擲兩顆 D6（敵人生命上限較高則一顆），任一 4+ 阻止且不花 AP。空降打擊（1AP）：噴射通道內一名敵人受 2D3+1。', 'Pinned Prey: while engaging only one enemy, two D6 (one against higher Wounds); any 4+ prevents Fall Back without AP cost. Strike From Above (1AP): 2D3+1 to one enemy in the boost zone.') }),
  O('mwShrieker', '尖嘯者', 'Shrieker', [bolt, chain], { shrieking: true, mwShriek: true, ability: B('改裝擴音器：3 吋內敵人任務／拾取多付 1AP；控制標記的敵方總 APL -1。尖嘯（1AP）：可見 6 吋內或噴射通道敵人受 D3、APL -1；不能隱蔽，交戰時只能選交戰敵人。', 'Modified Vox-casters: enemies within 3 inches pay +1 AP for missions/Pick Up, and their side loses 1 total APL for marker control. Shriek (1AP): visible enemy within 6 inches or boost zone takes D3 and -1 APL; no Conceal, and only engaged enemies when engaged.') }),
  O('mwRaptor', '猛禽', 'Raptor', raptorLoadouts.bolt, { count: 0, loadouts: raptorLoadouts, mwRaptor: true, ability: B('飛行快感：啟動中噴射後移除 APL 變動，且本啟動無視重傷屬性變化。', 'Thrill of Flight: boosting during activation clears APL changes and ignores injury for the activation.') }),
  O('mwSkysear', '天空灼燒者', 'Skysear', skyLoadouts.flamer, { count: 0, loadouts: skyLoadouts }),
  O('mwWarpTalon', '次元利爪', 'Warp Talon', [W('mwClaws', '閃電雙爪', 'Lightning claws', 'melee', 5, 3, 4, 5, { ceaseless: true, lethal: 5, rending: true })], { count: 0, ability: B('撕裂帷幕：正式規則可選擇次元預備部署，第 1 回合放標記、第 2 回合入場。此模擬器採一般部署。', 'Slice the Veil: tabletop permits optional warp reserve, a TP1 marker and TP2 arrival. This simulator uses normal deployment.') }),
];
export const MURDERWING_TEAM = {
  id: 'murderwing', name: B('屠戮之翼', 'Murderwing'), color: '#9c3547', astartes: true, keywords: ['CHAOS', 'HERETIC ASTARTES', 'MURDERWING'],
  rulesUrl: 'https://assets.warhammer-community.com/eng_murderwing_online_rules-ie4p7d3ji0-puunmglkc2.pdf',
  style: B('近戰隊・噴射突擊・恐懼壓制', 'Melee · Jump Packs · Fear'), blurb: B('六名混沌空降獵手以噴射突襲和恐懼擾亂獵物。', 'Six Chaos aerial hunters disrupt prey with boosted ambushes and terror.'),
  info: { oneBox: B('否，需要兩盒；建議 KT 版＋大桌版', 'No; two boxes recommended: Kill Team + Warhammer 40,000'), buyable: B('能；新大桌版本沒有隊長', 'Yes; the new Warhammer 40,000 box lacks the leader'), size: B('6 名特工', '6 operatives'), kind: B('近戰隊', 'Melee'), archetypes: [B('偵察', 'Recon'), B('搜索與摧毀', 'Seek & Destroy')], note: B('購買資訊依使用者提供。領主＋五名特工；除猛禽外不得重複，電漿手槍、熔融槍、電漿槍合計最多兩名。平面戰場以整段移動視為噴射，通道動作自動選目標；高度伏擊與次元預備部署尚未模擬。', 'Purchase notes supplied by the user. Lord + five; only Raptors repeat; at most two plasma-pistol/meltagun/plasma-gun operatives combined. Flat-board movement treats the entire move as a boost; boost actions automatically select targets. Height ambushes and optional warp reserves are not simulated.') },
  rule: { name: B('噴射背包・噴射動作・阿斯塔特', 'Jump Pack · Boost Actions · Astartes'), desc: B('啟動中重新定位、撤退、衝鋒可越過地形與特工，噴射衝鋒最多 6 吋。每啟動一次噴射動作，在噴射通道對敵人生效。可射擊兩次或近戰兩次；兩次射擊至少一次使用爆彈手槍。任何命令均可反應。', 'During activation Reposition, Fall Back and Charge can boost over terrain and operatives; boosted Charge is capped at 6 inches. One boost action per activation affects enemies along the boost zone. Two Shoots or two Fights; at least one of two Shoots must use a bolt pistol. Counteract under either order.') },
  replacements: Object.fromEntries(ops.filter((o) => o.count && o.id !== 'mwLord').map((o) => [o.id, ops.filter((x) => x.id !== 'mwLord').map((x) => x.id)])), ops,
  ploys: [
    P('mwCull', '淘汰弱者', 'Cull the Weak', '攻擊 APL 降低或在啟動／反應開始時已受傷的敵人，獲得懲罰；高度條件在平面戰場不適用。', 'Punishing against reduced-APL enemies or enemies wounded at activation/counteraction start. Height condition inapplicable on flat maps.'),
    P('mwNightmare', '高空夢魘', 'Nightmare on High', '本回合噴射後可重擲一顆防禦骰。', 'After boosting this TP, re-roll one defence die.'),
    P('mwPredators', '空中掠食者', 'Predators Above', '噴射後直到本啟動結束武器獲得平衡。', 'After boosting, weapons gain Balanced for this activation.'),
    P('mwFear', '散播恐懼', 'Instil Fear', '主動近戰時承受 3+ 普通傷害減 1；反擊不適用。', 'When fighting, incoming Normal damage of 3+ is reduced by 1; not when retaliating.'),
  ],
  firefight: [
    P('mwDescent', '殺戮降臨', 'Murderous Descent', '敵人移動後，高於敵人 2 吋以上且水平 3 吋內的友方可免費衝鋒。此平面戰場無高度條件，未啟用。', 'Free interrupting Charge after an enemy moves within 3 inches horizontally and more than 2 inches below. Inactive on this flat battlefield.'),
    P('mwHonour', '早已遺忘的榮耀', 'Long Forgotten Honour', '近戰解暴擊時可結束戰鬥並免費撤退 3 吋；模擬器於生命危險且有合法落點時自動使用。', 'On resolving a critical in melee, end combat and Fall Back 3 inches free; automatically used when threatened and a legal destination exists.'),
    P('mwNarcissism', '惡意自戀', 'Malicious Narcissism', '僅餘一名可啟動友方時，自動延後到敵方僅餘一名可啟動特工。', 'With only one ready friendly, automatically delay until only one ready enemy remains.'),
    P('mwWings', '黑暗之翼', 'Wings of Darkness', '第 2 回合起，本啟動噴射重新定位／撤退距離 +3，但本回合不能射擊、近戰或雕斬。', 'From TP2, boosted Reposition/Fall Back +3 this activation, but no Shoot, Fight or Carving Blow for the rest of the TP.'),
  ],
};
export function murderwingRosterError(t, roster = {}, choices = {}) {
  const ids = t.ops.filter((o) => o.count).flatMap((o) => Array(o.count).fill(roster[o.id] || o.id));
  if (ids.length !== 6 || ids.filter((id) => id === 'mwLord').length !== 1 || ids.some((id) => id !== 'mwRaptor' && ids.filter((x) => x === id).length > 1)) return B('屠戮之翼須有領主及五名特工，只有猛禽可重複。', 'Murderwing require a Lord and five operatives; only Raptors can repeat.');
  const special = ids.filter((id) => { const o = t.ops.find((x) => x.id === id); if (!o) return false; const ws = o.loadouts?.[choices[id]] || (o.loadouts ? Object.values(o.loadouts)[0] : o.weapons); return ws.some((w) => ['mwPlasma', 'mwMelta', 'mwPlasmaGun'].includes(w.id)); });
  return special.length > 2 ? B('電漿手槍／熔融槍／電漿槍合計最多兩名。', 'At most two plasma pistol, meltagun or plasma gun operatives combined.') : null;
}
export const MURDERWING_EQUIPMENT = {
  mwArmour: { name: B('利爪裝甲', 'Clawed Armour'), desc: B('噴射衝鋒落點交戰敵人受 1 傷害（0AP）；每啟動只能一次噴射動作。', 'Boosted Charge: 1 damage to an engaged enemy (0AP); one boost action per activation.') },
  mwFuel: { name: B('次元燃料', 'Warp Fuel'), desc: B('每回合一次，交戰敵人在自身啟動撤退後，自動免費追擊最多 3 吋，落點合法才使用。', 'Once per TP after an engaged enemy Falls Back in its own activation, automatically pursue up to 3 inches free if a legal destination exists.') },
  mwBladefins: { name: B('刀刃翼片', 'Bladefins'), desc: B('噴射重新定位／撤退後，若有多餘 1AP，自動對通道一名敵人造成 D3+1；專家噴射動作優先。', 'After boosted Reposition/Fall Back, spare 1AP automatically deals D3+1 to one enemy in its zone; specialist boost actions take priority.') },
  mwVox: { name: B('擴音器', 'Vox-casters'), desc: B('全隊每回合一次擴音吼叫（1AP）：2 吋內每名敵人擲 D6，3+ 下次啟動 APL -1。不能隱蔽。', 'Once per team per TP Vox-cry (1AP): enemies within 2 inches roll D6; 3+ gives -1 APL until next activation ends. No Conceal.') },
};
