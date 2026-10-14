// Wolf Scouts (狼偵查小隊): Space Wolves hunters who bring the storm with them.
// Source: https://assets.warhammer-community.com/eng_wolf_scouts_online_rules-hgzknhj5cl-c3yqxctedv.pdf (errata August '26)
// A Fenrisian Wolf and five from the list (each once, except Hunters).
const B = (zh, en) => ({ zh, en });
const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) => ({ id, name: B(zh, en), type, atk, hit, dmg: [dn, dc], rules, group });
const P = (id, zh, en, z, e) => ({ id, cp: 1, name: B(zh, en), desc: B(z, e) });

const ppStd = W('wsPPistolS', '電漿手槍（標準）', 'Plasma pistol (standard)', 'ranged', 4, 3, 3, 5, { range: 8, piercing: 1, wsPlasma: true }, 'wsPPistol');
const ppSup = W('wsPPistolC', '電漿手槍（超載）', 'Plasma pistol (supercharge)', 'ranged', 4, 3, 4, 5, { range: 8, hot: true, lethal: 5, piercing: 1, wsPlasma: true }, 'wsPPistol');
const blade = (atk) => W(atk === 5 ? 'wsBlade5' : 'wsBlade4', '戰鬥刀', 'Combat blade', 'melee', atk, 3, 4, 5, { wsBlade: true }, 'wsBlade');
const ops = [
  { id: 'wsLeader', name: B('狼群首領', 'Pack Leader'), leader: true, outrightConviction: true, wsLupine: true,
    weapons: [ppStd, ppSup, W('wsPower', '動力武器', 'Power weapon', 'melee', 5, 3, 4, 6, { lethal: 5 })] },
  { id: 'wsFang', name: B('持牙者', 'Fangbearer'), wsFang: true,
    weapons: [W('wsAbsolvor', '赦罪者爆彈手槍', 'Absolvor bolt pistol', 'ranged', 4, 3, 4, 5, { range: 8, piercingCrits: 1 }), blade(5)] },
  { id: 'wsFrost', name: B('霜眼', 'Frosteye'), wsFrost: true,
    weapons: [W('wsCarbine', '煽動者爆彈卡賓槍', 'Instigator bolt carbine', 'ranged', 4, 3, 3, 4, { piercingCrits: 1, silent: true, wsCarbine: true }), blade(4)] },
  { id: 'wsGunner', name: B('槍手', 'Gunner'), wsGunner: true,
    weapons: [W('wsPGunS', '電漿槍（標準）', 'Plasma gun (standard)', 'ranged', 4, 3, 4, 6, { piercing: 1, wsPlasma: true, wsPlasmaGun: true }, 'wsPGun'),
      W('wsPGunC', '電漿槍（超載）', 'Plasma gun (supercharge)', 'ranged', 4, 3, 5, 6, { hot: true, lethal: 5, piercing: 1, wsPlasma: true, wsPlasmaGun: true }, 'wsPGun'), blade(4)] },
  { id: 'wsTrap', name: B('地雷兵', 'Trapmaster'), wsTrap: true, weapons: [ppStd, ppSup, blade(5)] },
  { id: 'wsSkjald', name: B('符文祭司斯卡爾德', 'Rune Priest Skjald'), wsSkjald: true, psyker: true,
    weapons: [W('wsBoltPistol', '爆彈手槍', 'Bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8 }),
      W('wsJaws', '世界之狼的巨顎', 'Jaws of the World Wolf', 'ranged', 4, 3, 3, 5, { psychic: true, blast: 2, severe: true }),
      W('wsThunder', '雷鳴', 'Thunderclap', 'ranged', 5, 2, 2, 2, { psychic: true, range: 6, saturate: true, seekLight: true, stun: true, torrent: 2 }),
      W('wsStave', '符文法杖', 'Runic stave', 'melee', 5, 3, 4, 6, { psychic: true, shock: true })] },
  { id: 'wsHunter', name: B('獵手', 'Hunter'), wsHunter: true, weapons: [ppStd, ppSup, blade(5)] },
].map((o) => ({ count: 0, apl: 3, move: 7, save: 3, wounds: 13, base: 32, wsScout: true, ...o }));
ops.push({ id: 'wsWolf', name: B('芬里斯狼', 'Fenrisian Wolf'), count: 1, apl: 2, move: 8, save: 5, wounds: 9, base: 47, oval: [60, 35], wsWolf: true,
  actionsOnly: ['charge', 'dash', 'fallBack', 'fight', 'wsGuard', 'reposition'], weapons: [W('wsFangs', '獠牙', 'Fangs', 'melee', 4, 3, 4, 5, { rending: true })] });
for (const o of ops) if (['wsLeader', 'wsFang', 'wsFrost', 'wsGunner', 'wsSkjald'].includes(o.id)) o.count = 1;
const PICKS = ops.filter((o) => o.wsScout).map((o) => o.id);

export const WOLF_TEAM = {
  id: 'wolfScouts', name: B('狼偵查小隊', 'Wolf Scouts'), color: '#6b8fa8', keywords: ['IMPERIUM', 'ADEPTUS ASTARTES', 'SPACE WOLVES', 'WOLF SCOUT'],
  rulesUrl: 'https://assets.warhammer-community.com/eng_wolf_scouts_online_rules-hgzknhj5cl-c3yqxctedv.pdf',
  astartes: true, anyAstartesShot: true, // Hunting Astartes: two Shoots or two Fights, any order counteracts (the plasma / psychic limits are in wolfscouts.js)
  style: B('混合隊・風暴・精英', 'Mixed · Storm · Elite'),
  blurb: B('太空野狼的狼偵查兵：召來元素風暴，在風暴裡衝鋒、雙射電漿、讓敵人抓不到他們，還有一頭芬里斯狼。', 'Space Wolves hunters who call up an elemental storm: inside it they charge from Conceal, double-shoot plasma and are hard to pin down — with a Fenrisian Wolf at their side.'),
  info: {
    archetypes: [B('偵察', 'Recon'), B('搜索與摧毀', 'Seek and Destroy')],
    kind: B('混合隊', 'Mixed'),
    oneBox: B('否，需要多一盒來做一位特工，建議先別做地雷兵', 'No — one operative needs a second box; leave the Trapmaster for later'),
    buyable: B('能', 'Yes'),
    size: B('6 名特工', '6 operatives'),
    note: B('芬里斯狼＋5 名：狼群首領、持牙者、霜眼、槍手、地雷兵、符文祭司斯卡爾德各只能選一次，獵手可重複。', 'Fenrisian Wolf + 5: Pack Leader, Fangbearer, Frosteye, Gunner, Trapmaster and Rune Priest Skjald once each, Hunters repeat.'),
  },
  rule: {
    name: B('元素風暴・狩獵阿斯塔特', 'Elemental Storm · Hunting Astartes'),
    desc: B('策略謀略：放置風暴標記，完全在標記 6" 內就是「在你的風暴內」；在風暴內結束的衝鋒可以用隱蔽指令。每次啟動可以兩次射擊或兩次近戰（兩次都用電漿武器第二次 +1AP，不能兩次都用靈能武器）；任何指令都能反應，在風暴內反應時可以先改指令，或只改指令。',
      'Strategic gambit: place the Storm marker — wholly within 6" of it is "wholly within your STORM"; a Charge that ends wholly within it can be made with a Conceal order. Two Shoots or two Fights per activation (the second costs 1 more AP if both use plasma; never two PSYCHIC ranged weapons); it counteracts with any order, and within the storm can change order first, or instead of an action.'),
  },
  // Automatic rules the player can switch on (players start with them off): equip / ploy limits where they show.
  autoAbilities: [
    { id: 'wsCharms', equip: 'wsCharms', name: B('符文護符', 'Runic Charms'), desc: B('每回合一次：敵人射擊風暴內的友方時，穿甲 -1。', 'Once per TP: an enemy shooting a friendly in the storm has Piercing 1 worse.') },
    { id: 'wsTeeth', equip: 'wsTeeth', name: B('狼牙項鍊', 'Wolfteeth Necklaces'), desc: B('每回合一次：兩個以上失敗時，一個當成普通成功。', 'Once per TP: with two or more fails, one is retained as a normal success.') },
    { id: 'wsTrophies', equip: 'wsTrophies', name: B('護身戰利品', 'Talismanic Trophies'), desc: B('風暴內近戰時，對手一個普通成功傷害 -1。', 'In the storm, fighting: one normal success inflicts 1 less damage.') },
    { id: 'wsCloak', ploy: 'wsCloak', name: B('風暴掩護', 'Cloaked by the Storm'), desc: B('買了計謀後：風暴內被射擊時重擲一顆防禦骰。', 'With the ploy: re-roll one defence die when shot in the storm.') },
    { id: 'wsSavage', ploy: 'wsSavage', name: B('兇猛鬥士', 'Savage Fighters'), desc: B('買了計謀後：反擊結束時對敵人造成 D3+1。', 'With the ploy: D3+1 damage to the enemy after retaliating.') },
  ],
  replacements: { wsLeader: PICKS, wsFang: PICKS, wsFrost: PICKS, wsGunner: PICKS, wsSkjald: PICKS },
  perCopyRoster: true,
  ops,
  ploys: [
    P('wsCloak', '風暴掩護', 'Cloaked by the Storm', '敵人射擊在你風暴內的友方時，你可以重擲一顆防禦骰。', 'An enemy shooting a friendly wholly within your STORM: you can re-roll one defence die.'),
    P('wsWrath', '暴風之怒', 'Tempestuous Wrath', '友方近戰或反擊時，若在風暴內（或本次啟動開始時在風暴內），近戰武器「平衡」。', 'A friendly fighting or retaliating wholly within your STORM (or that was at the start of the activation): Balanced melee weapons.'),
    P('wsBite', '風暴之噬', 'Storm\'s Bite', '友方近戰攻擊在你風暴內的敵人時，敵人近戰武器攻擊數 -1（最少 3）。', 'A friendly fighting an enemy wholly within your STORM: that enemy\'s melee weapons have -1 Atk (minimum 3).'),
    P('wsSavage', '兇猛鬥士', 'Savage Fighters', '友方反擊結束時，若沒殘廢且還在那名敵人的控制範圍內，對它造成 D3+1 傷害（勾選後自動）。', 'When a friendly finishes retaliating, not incapacitated and still within the enemy\'s control range: D3+1 damage to that enemy (automatic once ticked).'),
  ],
  firefight: [
    P('wsAcute', '敏銳感官', 'Acute Senses', '友方射擊選目標時（目標要在 6" 內）：這次射擊武器獲得「尋找輕型」，敵人不能被遮蔽。', 'When a friendly picks a target to shoot (within 6"): its ranged weapons have Seek Light and enemies can\'t be obscured for that action.'),
    P('wsCounter', '反擊', 'Counterattack', '敵人啟動結束或近戰後（勾選後自動）：一名在它控制範圍內的友方免費近戰它。', 'At the end of an enemy\'s activation or after it fights (automatic once ticked): a friendly within its control range makes a free Fight against it.'),
    P('wsLokyar', '洛卡之觸', 'Touched by Lokyar', '友方（芬里斯狼除外）近戰時離其他友方 5" 以上（勾選後自動）：重擲失敗的攻擊骰。', 'A friendly (not the Fenrisian Wolf) fighting more than 5" from other friendlies (automatic once ticked): re-roll its failed attack dice.'),
    P('wsTranshuman', '超人生理', 'Transhuman Physiology', '友方（芬里斯狼除外）被射擊時（勾選後自動）：一顆普通豁免當成暴擊豁免（能多擋暴擊時才用）。', 'A friendly (not the Fenrisian Wolf) being shot (automatic once ticked): one normal save is retained as a critical one (when it blocks a crit).'),
  ],
};

/** Five picks: each once, except Hunters. */
export function wolfRosterError(t, roster = {}) {
  const pick = (slot) => { const v = roster[slot]; return (Array.isArray(v) ? v[0] : v) || slot; };
  const ids = ['wsLeader', 'wsFang', 'wsFrost', 'wsGunner', 'wsSkjald'].map(pick);
  const dup = [...new Set(ids.filter((id, i) => id !== 'wsHunter' && ids.indexOf(id) !== i))];
  if (!dup.length) return null;
  const names = dup.map((id) => t.ops.find((o) => o.id === id).name);
  return B(`重複選了：${names.map((n) => n.zh).join('、')}（除了獵手，每種只能選一次）`, `Picked more than once: ${names.map((n) => n.en).join(', ')} (each only once, except Hunters)`);
}

export const WOLF_EQUIPMENT = {
  wsFrostW: { name: B('寒霜武器', 'Frost Weapons'), desc: B('友方在你風暴內時，戰鬥刀獲得「致命 5+」。', 'A friendly wholly within your STORM: its combat blade has Lethal 5+.') },
  wsCharms: { name: B('符文護符', 'Runic Charms'), desc: B('每回合一次（勾選後自動）：敵人射擊在你風暴內的友方（芬里斯狼除外）時，穿甲 -1。', 'Once per TP (automatic once ticked): an enemy shooting a friendly (not the Fenrisian Wolf) wholly within your STORM has its Piercing worsened by 1.') },
  wsTeeth: { name: B('狼牙項鍊', 'Wolfteeth Necklaces'), desc: B('每回合一次（勾選後自動）：友方（芬里斯狼除外）射擊、近戰或反擊擲出兩個以上失敗時，一個失敗當成普通成功。', 'Once per TP (automatic once ticked): a friendly (not the Fenrisian Wolf) shooting, fighting or retaliating with two or more fails retains one as a normal success.') },
  wsTrophies: { name: B('護身戰利品', 'Talismanic Trophies'), desc: B('友方（芬里斯狼除外）在你風暴內近戰或反擊時，對手一個普通成功的傷害 -1。', 'A friendly (not the Fenrisian Wolf) wholly within your STORM fighting or retaliating: one normal success inflicts 1 less damage on it.') },
};
