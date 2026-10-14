// Raveners (蛇蟲): Tyranid burrowing assassins.
// Source: https://assets.warhammer-community.com/eng_raveners_online_rules-8vfeyxgbks-nf6lxfcbfw.pdf (errata August '26)
// Every weapon choice is its own operative template, so each slot's dropdown picks the operative. The Prime is always in the kill team;
// four more come from the list (each once, except Warriors).
const B = (zh, en) => ({ zh, en });
const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) => ({ id, name: B(zh, en), type, atk, hit, dmg: [dn, dc], rules, group });
const P = (id, zh, en, z, e) => ({ id, cp: 1, name: B(zh, en), desc: B(z, e) });

const pincer = W('rvPincer', '鉗尾', 'Pincer tail', 'ranged', 4, 3, 3, 4, { range: 3, silent: true });
const glands = W('rvGlands', '毒腺', 'Toxic glands', 'ranged', 4, 3, 3, 4, { range: 6, silent: true, rvPoison: true });
const scythes = W('rvScythes', '毒鐮', 'Toxic scythes', 'melee', 5, 3, 4, 5, { lethal: 5, shock: true, rvPoison: true });
const talonsRend = W('rvTalonsRend', '鐮爪與撕裂利爪', 'Scything talons & rending claws', 'melee', 5, 3, 4, 5, { rending: true });
const tailBlade = W('rvTailBlade', '尾刃', 'Tail blade', 'ranged', 4, 3, 3, 4, { range: 3, rending: true, silent: true });
const talons = W('rvTalons', '鐮爪', 'Scything talons', 'melee', 5, 3, 4, 5);
const venomBlast = W('rvVenomBlast', '毒液彈（爆裂）', 'Venom bolt (blast)', 'ranged', 4, 3, 3, 5, { range: 8, blast: 2, rvPoison: true, rvVenom: true }, 'rvVenom');
const venomFocus = W('rvVenomFocus', '毒液彈（集中）', 'Venom bolt (focused)', 'ranged', 4, 3, 4, 5, { range: 8, piercing: 1, rvPoison: true, rvVenom: true }, 'rvVenom');
const boneMace = W('rvBoneMace', '骨錘', 'Bone mace', 'ranged', 4, 3, 3, 4, { range: 3, piercing: 1, silent: true });
const crushing = W('rvCrushing', '鐮爪與碾壓利爪', 'Scything talons & crushing claws', 'melee', 5, 3, 4, 5, { crush: true });

const O = (id, zh, en, weapons, extra = {}) => ({ id, name: B(zh, en), count: 0, apl: 3, move: 7, save: 5, wounds: 18, base: 40, weapons, rvRavener: true, twoFights: true, rvAnyCounter: true, ...extra });
const ops = [
  O('rvPrime', '蛇蟲首領', 'Ravener Prime', [pincer, tailBlade, talonsRend], { count: 1, wounds: 19, leader: true, rvPrime: true }),
  O('rvFelltalon', '蛇蟲毒爪', 'Ravener Felltalon', [pincer, glands, scythes], { count: 1, rvFelltalon: true }),
  O('rvTremor', '蛇蟲震鐮', 'Ravener Tremorscythe', [pincer, talonsRend], { count: 1, rvTremor: true }),
  O('rvVenom', '蛇蟲毒噴手', 'Ravener Venomspitter', [pincer, venomBlast, venomFocus, talons], { count: 1, rvVenomspitter: true }),
  O('rvWarrior', '蛇蟲戰士', 'Ravener Warrior', [pincer, talons], { rvWarrior: true }),
  O('rvWrecker', '蛇蟲破壞者', 'Ravener Wrecker', [boneMace, crushing], { count: 1, save: 4, rvWrecker: true, rvCarapace: true }),
];
// Four picks from the list: each once, except Warriors.
const SLOTS = ['rvFelltalon', 'rvTremor', 'rvVenom', 'rvWrecker'];
const PICKS = ['rvFelltalon', 'rvTremor', 'rvVenom', 'rvWarrior', 'rvWrecker'];

export const RAVENERS_TEAM = {
  id: 'raveners', name: B('蛇蟲', 'Raveners'), color: '#9b4dca', keywords: ['TYRANID', 'RAVENER', 'GREAT DEVOURER'],
  rulesUrl: 'https://assets.warhammer-community.com/eng_raveners_online_rules-8vfeyxgbks-nf6lxfcbfw.pdf',
  style: B('近戰隊・挖地道・伏擊', 'Melee · Burrowing · Ambush'),
  blurb: B('一名首領帶著四隻蛇蟲：從地底的隧道網冒出、猛撲、再鑽回去。每名蛇蟲啟動時可以連打兩次近戰，但護甲只有 5+，不能被圍毆。', 'A Prime with four Raveners that burst from their tunnel network, strike and vanish underground again. Each fights twice per activation, but with a 5+ Save they cannot stand a focused attack.'),
  info: {
    archetypes: [B('滲透', 'Infiltration'), B('搜索與摧毀', 'Seek and Destroy')],
    kind: B('近戰隊', 'Melee'),
    oneBox: B('能', 'Yes'),
    buyable: B('能', 'Yes'),
    size: B('5 名特工', '5 operatives'),
    note: B('首領＋4 名：毒爪、震鐮、毒噴手、破壞者各只能選一次，戰士可重複。', 'Prime + 4: Felltalon, Tremorscythe, Venomspitter and Wrecker once each; Warriors repeat.'),
  },
  rule: {
    name: B('隧道與鑽地', 'Tunnel and Burrow'),
    desc: B('戰鬥開始時在降落區放隧道標記 0；第 1～4 回合以策略謀略各放下一個編號標記（距上一個 5" 內），標記與相鄰編號之間的區域就是你的「隧道」。友方蛇蟲可以執行「鑽地」（1AP）：在隧道上就移出戰場（地下），在地下就放回隧道（Move -2"）。部署時前兩名要正常部署，其餘可以放在地下。每名蛇蟲啟動時可以近戰兩次，且可以在任何指令下反應。',
      'At the start of the battle you place Tunnel marker 0 in your drop zone; as a strategic gambit in turning points 1-4 you place the next numbered marker within 5" of the last one. The markers and the strips between consecutive numbers are your TUNNEL. Friendly Raveners can Burrow (1AP): on the tunnel they go underground, underground they emerge on the tunnel (Move -2"). The first two are set up normally, the rest can start underground. Each fights twice per activation and can counteract with any order.'),
  },
  replacements: Object.fromEntries(SLOTS.map((id) => [id, PICKS])),
  ops,
  ploys: [
    P('rvDeath', '來自地底的死亡', 'Death From Below', '友方蛇蟲近戰時：本次啟動做過「鑽地」，近戰武器獲得「平衡」；在你的隧道上，近戰武器獲得「無休」。', 'A friendly RAVENER fighting: if it performed Burrow this activation its melee weapons have Balanced; if it is on your TUNNEL they have Ceaseless.'),
    P('rvLurkers', '隧道潛伏者', 'Tunnel Lurkers', '在你隧道上的友方蛇蟲視為在輕型地形的掩護中（除非在行動特工 2" 內）。', 'A friendly RAVENER on your TUNNEL is in cover (as from Light terrain) unless it is within 2" of the active operative.'),
    P('rvWhip', '破土而出', 'Whipcord Emergence', '敵人射擊友方蛇蟲時：該蛇蟲本回合做過鑽地，可以重擲一顆防禦骰；在你的隧道上，可以重擲同一種結果的所有防禦骰（自動選最有利的結果）。', 'When an enemy shoots a friendly RAVENER: if it Burrowed this turning point, re-roll one defence die; if it is on your TUNNEL, re-roll all defence dice of one result (the best is picked automatically).'),
    P('rvWrithe', '滑入暗處', 'Writhe Out of Sight', '選一名戰場上的友方蛇蟲：免費「鑽地」；它在隧道 2" 內時，先免費撤退或重新定位。', 'Pick a friendly RAVENER in the killzone: it makes a free Burrow, after a free Fall Back or Reposition if it is within 2" of your TUNNEL.'),
  ],
  firefight: [
    P('rvSlither', '滑溜閃避', 'Slithering Evasion', '友方蛇蟲啟動或反應中、行動前後使用：本次啟動撤退少 1AP；且可以在敵人控制範圍內衝鋒，並離開那名敵人的控制範圍。', 'During a friendly RAVENER activation or counteraction, before or after an action: Fall Back for 1 less AP, and Charge while within an enemy\'s control range (leaving it).'),
    P('rvFrenzy', '死亡狂亂', 'Death Frenzy', '友方蛇蟲殘廢、被移除前（自動）：它控制範圍內每名敵人受 D3 傷害；若是正受「脹大背囊」影響的毒噴手則改為 2D3。', 'When a friendly RAVENER is incapacitated, before it is removed (automatic): D3 damage to each enemy in its control range (2D3 for a Venomspitter with Distend Dorsal Sac).'),
    P('rvHorror', '地底驚懼', 'Subterranean Horror', '敵人近戰、選了在你隧道上的友方蛇蟲為對手時（自動）：由防禦方先結算第一顆攻擊骰。', 'When an enemy fights a friendly RAVENER on your TUNNEL (automatic): the defender resolves the first attack die.'),
    P('rvStrike', '鑽地突襲', 'Burrowing Strike', '友方蛇蟲「鑽地」時（自動）：在它被移出前、或放回隧道後，它控制範圍內每名敵人受 D3+1 傷害。同一次啟動不能和毒爪的「毒猛撲」並用。', 'When a friendly RAVENER Burrows (automatic): before it is removed, or after it is set up, D3+1 damage to each enemy in its control range. Not with the Felltalon\'s Toxic Lunge in the same activation.'),
  ],
};

/** Four picks: each once, except Warriors. */
export function ravenersRosterError(t, roster = {}) {
  const ids = SLOTS.map((slot) => roster[slot] || slot);
  const dup = [...new Set(ids.filter((id, i) => id !== 'rvWarrior' && ids.indexOf(id) !== i))];
  if (!dup.length) return null;
  const nm = (lang) => dup.map((id) => t.ops.find((o) => o.id === id).name[lang]).join(lang === 'zh' ? '、' : ', ');
  return B(`重複選了：${nm('zh')}（除了戰士，每種只能選一次）`, `Picked more than once: ${nm('en')} (each only once, except Warriors)`);
}

export const RAVENERS_EQUIPMENT = {
  rvChroma: { name: B('色素孢子偽裝', 'Chromatospore Camouflage'), desc: B('敵人射擊友方蛇蟲時，若你能保留任何掩護豁免，可以多保留一個（不與高處地形的改良掩護疊加）。', 'When an enemy shoots a friendly RAVENER and you can retain any cover saves, you can retain one more (not cumulative with improved cover from Vantage terrain).') },
  rvSenses: { name: B('敏銳感官', 'Heightened Senses'), desc: B('整場一次，先攻擲骰後：若有友方蛇蟲在地下、且有敵人在你的隧道 5" 內，可以重擲你的骰子（先攻階段的卡片區使用）。', 'Once per battle, after the initiative roll-off: if a friendly RAVENER is underground and an enemy is within 5" of your TUNNEL, re-roll your die (used from the initiative cards).') },
  rvAcid: { name: B('酸血', 'Acid Blood'), desc: B('友方蛇蟲近戰或反擊時，每有一顆攻擊骰對它造成傷害，擲 D6：5+ 對該敵人造成 1 傷害（自動）。', 'When a friendly RAVENER fighting or retaliating takes damage from an attack die, roll a D6: on a 5+ the enemy takes 1 damage (automatic).') },
  rvFlesh: { name: B('變形血肉', 'Metamorphic Flesh'), desc: B('友方蛇蟲啟動時（自動）回復最多 D3 生命。', 'Whenever a friendly RAVENER is activated it regains up to D3 lost wounds (automatic).') },
};
