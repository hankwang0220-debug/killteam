// Sanctifiers (淨化者): Adeptus Ministorum zealots.
// Source: https://assets.warhammer-community.com/eng_25-02_kt_teamrules_sanctifiers-3vpsecfbfe-vclbyfaed7.pdf (errata February '26)
// Every choice of weapons is its own operative template (e.g. sfMissC = Missionary with a meltagun), so one dropdown per slot
// picks the operative AND its weapons. The Confessor and the Cherub are always in the kill team.
const B = (zh, en) => ({ zh, en });
const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) => ({ id, name: B(zh, en), type, atk, hit, dmg: [dn, dc], rules, group });
const P = (id, zh, en, z, e) => ({ id, cp: 1, name: B(zh, en), desc: B(z, e) });

const mace = W('sfMace', '譴責戰錘', 'Mace of Censure', 'melee', 4, 3, 5, 5, { brutal: true, shock: true });
const incentiviser = W('sfIncentiviser', '激勵器', 'Incentiviser', 'melee', 3, 5, 1, 3, { shock: true });
const knives = W('sfKnives', '飛刀', 'Throwing knives', 'ranged', 4, 3, 2, 5, { range: 6, silent: true });
const ritualBlades = W('sfRitual', '儀式刀', 'Ritual blades', 'melee', 4, 2, 4, 6);
const handFlamerP = W('sfHandFlamerP', '手持火焰噴射器', 'Hand flamer', 'ranged', 4, 3, 3, 3, { range: 6, saturate: true, torrent: 1, blaze: true });
const handFlamer = W('sfHandFlamer', '手持火焰噴射器', 'Hand flamer', 'ranged', 4, 2, 3, 3, { range: 6, saturate: true, torrent: 1, blaze: true });
const eviscerator = W('sfEviscerator', '開膛劍', 'Eviscerator', 'melee', 4, 4, 5, 6, { brutal: true });
const twinFocused = W('sfTwinFocused', '雙手持火焰噴射器（集中）', 'Twin hand flamers (focused)', 'ranged', 4, 2, 3, 3, { range: 6, saturate: true, torrent: 2, blaze: true }, 'sfTwin');
const twinTorrent = W('sfTwinTorrent', '雙手持火焰噴射器（雙重洪流）', 'Twin hand flamers (twin torrent)', 'ranged', 4, 2, 3, 3, { range: 6, saturate: true, salvo: true, twinTorrent: true, blaze: true }, 'sfTwin');
const gunButts = W('sfGunButts', '槍托', 'Gun butts', 'melee', 4, 4, 2, 3);
const gunButt = W('sfGunButt', '槍托', 'Gun butt', 'melee', 3, 4, 2, 3);
const greatHammer = W('sfGreatHammer', '巨錘', 'Great hammer', 'melee', 4, 4, 4, 4, { brutal: true, shock: true });
const holyLight = W('sfHolyLight', '聖光', 'Holy light', 'ranged', 4, 2, 4, 3, { range: 8, devastating: 3, limited: 1, piercing: 1, saturate: true, blaze: true });
const wreathe = W('sfWreathe', '烈焰纏身', 'Wreathe in fire', 'ranged', 4, 2, 4, 4, { blast: 1, limited: 1, wreathed: true, blaze: true });
const burningHands = W('sfBurningHands', '燃燒之手', 'Burning hands', 'melee', 1, 2, 7, 8, { brutal: true, limited: 1, blaze: true });
const fists = W('sfFists', '拳頭', 'Fists', 'melee', 2, 5, 1, 2);
const brazierR = W('sfBrazierR', '聖火火盆', 'Brazier of holy fire', 'ranged', 4, 2, 4, 4, { range: 4, saturate: true, torrent: 1, blaze: true }, 'sfBrazierR');
const brazierM = W('sfBrazierM', '聖火火盆', 'Brazier of holy fire', 'melee', 4, 4, 4, 4, { shock: true, blaze: true }, 'sfBrazierM');
const meltagun = W('sfMeltagun', '熔融槍', 'Meltagun', 'ranged', 4, 4, 6, 3, { range: 6, devastating: 4, piercing: 2 });
const flamer = W('sfFlamer', '教會火焰噴射器', 'Ministorum flamer', 'ranged', 4, 2, 4, 4, { range: 8, saturate: true, torrent: 2, blaze: true });
const plasmaStd = W('sfPlasmaStd', '電漿槍（標準）', 'Plasma gun (standard)', 'ranged', 4, 4, 4, 6, { piercing: 1 }, 'sfPlasma');
const plasmaSuper = W('sfPlasmaSuper', '電漿槍（超載）', 'Plasma gun (supercharge)', 'ranged', 4, 4, 5, 6, { hot: true, lethal: 5, piercing: 1 }, 'sfPlasma');
const chainsword = W('sfChainsword', '鏈鋸劍', 'Chainsword', 'melee', 4, 4, 4, 5);
const soulstave = W('sfSoulstave', '靈魂杖', 'Soulstave', 'melee', 3, 5, 2, 3);

const O = (id, zh, en, weapons, extra = {}) => ({ id, name: B(zh, en), count: 0, apl: 2, move: 6, save: 5, wounds: 7, base: 25, weapons, sfSanct: true, ...extra });
const ops = [
  O('sfConfessor', '淨化者懺悔師', 'Sanctifier Confessor', [mace], { count: 1, wounds: 10, base: 32, sfConfessor: true, leader: true }),
  O('sfCherub', '淨化者小天使', 'Sanctifier Cherub', [incentiviser], { count: 1, move: 7, wounds: 5, sfCherub: true, jumpPack: true, support: 'sfIncentivise', actionsOnly: ['charge', 'dash', 'fallBack', 'fight', 'reposition', 'pickUp', 'sfIncentivise'] }),
  O('sfConflagrator', '淨化者縱火者', 'Sanctifier Conflagrator', [twinFocused, twinTorrent, gunButts], { count: 1, sfConflagrator: true }),
  O('sfAssassin', '淨化者死亡教派刺客', 'Sanctifier Death Cult Assassin', [knives, ritualBlades], { count: 1, apl: 3, wounds: 8, sfAssassin: true, bladedStance: true }),
  O('sfDrill', '淨化者訓練導師', 'Sanctifier Drill Abbot', [greatHammer], { count: 1, sfDrill: true, disciplinarian: true }),
  O('sfMiraculist', '淨化者奇蹟使', 'Sanctifier Miraculist', [holyLight, wreathe, burningHands, fists], { count: 1, save: 4, sfMiraculist: true, outrightConviction: true, sfMiracle: true }),
  O('sfMissA', '淨化者傳教士（教會火焰噴射器、聖火火盆）', 'Sanctifier Missionary (Ministorum flamer, brazier of holy fire)', [flamer, brazierM], { count: 1, wounds: 8, sfMissionary: true, sfBrazier: true, sfSpread: true }),
  O('sfMissB', '淨化者傳教士（教會火焰噴射器、槍托、聖物）', 'Sanctifier Missionary (Ministorum flamer, gun butt, holy relic)', [flamer, gunButt], { wounds: 8, sfMissionary: true, holyRelic: true, sfSpread: true }),
  O('sfMissC', '淨化者傳教士（熔融槍、鏈鋸劍、聖物）', 'Sanctifier Missionary (meltagun, chainsword, holy relic)', [meltagun, chainsword], { count: 1, wounds: 8, sfMissionary: true, holyRelic: true, sfSpread: true }),
  O('sfMissD', '淨化者傳教士（電漿槍、鏈鋸劍、聖火火盆）', 'Sanctifier Missionary (plasma gun, chainsword, brazier of holy fire)', [plasmaStd, plasmaSuper, brazierR, chainsword], { wounds: 8, sfMissionary: true, sfBrazier: true, sfSpread: true }),
  O('sfPersecutor', '淨化者迫害者', 'Sanctifier Persecutor', [handFlamerP, eviscerator], { count: 1, sfPersecutor: true, castigation: true, fanatical: true }),
  O('sfPreacher', '淨化者布道者', 'Sanctifier Preacher', [handFlamer, chainsword], { sfPreacher: true, defendFaith: true }),
  O('sfReliquant', '淨化者聖物官', 'Sanctifier Reliquant', [handFlamer, gunButt], { count: 1, sfReliquant: true, cultIcon: true }),
  O('sfSalvationist', '淨化者救贖者', 'Sanctifier Salvationist', [soulstave], { count: 1, sfSalvationist: true, medic: true, medikit: true }),
];
// Nine picks: each once, except Preachers (up to four); the two Missionary entries are one option each (A or B, C or D), and the
// two options with a brazier of holy fire can't both be taken.
const SLOTS = ['sfConflagrator', 'sfAssassin', 'sfDrill', 'sfMiraculist', 'sfMissA', 'sfMissC', 'sfPersecutor', 'sfReliquant', 'sfSalvationist'];
const PICKS = ['sfConflagrator', 'sfAssassin', 'sfDrill', 'sfMiraculist', 'sfMissA', 'sfMissB', 'sfMissC', 'sfMissD', 'sfPersecutor', 'sfPreacher', 'sfReliquant', 'sfSalvationist'];

export const SANCTIFIERS_TEAM = {
  id: 'sanctifiers', name: B('淨化者', 'Sanctifiers'), color: '#c9a227', keywords: ['IMPERIUM', 'ADEPTUS MINISTORUM', 'SANCTIFIER'],
  rulesUrl: 'https://assets.warhammer-community.com/eng_25-02_kt_teamrules_sanctifiers-3vpsecfbfe-vclbyfaed7.pdf',
  style: B('近戰隊・佈道・烈焰', 'Melee · Sermon · Holy Fire'),
  blurb: B('一名懺悔師帶著小天使與九名狂信者。只要待在佈道者身邊，他們就能無視重擊、硬扛傷害；敵人則被烈焰灼燒，行動一次比一次吃力。', 'A Confessor with a Cherub and nine zealots. Beside their orator they shrug off heavy blows; the enemy is set alight and wilts.'),
  info: {
    archetypes: [B('安全保護', 'Security'), B('搜索與摧毀', 'Seek and Destroy')],
    kind: B('近戰隊', 'Melee'),
    oneBox: B('能（建議買兩盒，普通特工很有用）', 'Yes (two boxes recommended — the ordinary operatives are useful)'),
    buyable: B('能', 'Yes'),
    size: B('11 名特工（規則 PDF：懺悔師＋小天使＋9 名）', '11 operatives (rules PDF: Confessor + Cherub + 9)'),
    note: B('懺悔師＋小天使＋9 名：除了布道者（最多 4 名）外每種只能選一次；兩個傳教士名額各只能選一個選項（火焰噴射器兩款、熔融槍／電漿槍兩款），且兩款有聖火火盆的選項整場只能選一款。佈道（Sermon）自動選懺悔師為佈道者；懺悔師死後才需要在策略階段選。烈焰的 D3 傷害與移除方式由系統自動選擇（生命很少時扣 APL 移除，否則擲骰）。奇蹟使的「烈焰纏身」用單獨的動作施放。', 'Confessor + Cherub + nine picks: each once, except Preachers (up to four); each Missionary entry is one option, and the two braziers can\'t both be taken. The Confessor is always the Sermon orator (a replacement is only chosen in the Strategy phase after he falls). The Blaze D3 damage and its removal are chosen automatically (APL -1 when nearly dead, otherwise the D6 roll). The Miraculist\'s Wreathe in Fire is its own action.'),
  },
  rule: {
    name: B('烈焰與佈道', 'Blaze and Ministorum Sermon'),
    desc: B('烈焰：烈焰武器的暴擊造成傷害時，目標獲得你的烈焰標記（每名一個）；帶標記的特工啟動時受 D3 傷害，然後其玩家二選一：擲 D6 3+ 移除標記，或本次啟動 APL -1 移除標記。佈道：策略謀略，選一名友方成為佈道者（懺悔師還在就必須選他）；友方在佈道者 3"（懺悔師 6"）內時受到佈道加成：普通傷害或暴擊傷害 4 以上時少受 1 點傷害；友方在佈道者範圍內啟動時整個啟動都受加成。',
      'Blaze: when a Blaze weapon inflicts damage with a critical success, the target gains a Blaze token (one per side). When a token bearer is activated it takes D3 damage, then its player picks: roll a D6 (3+ removes it) or take -1 APL for the activation to remove it. Sermon: strategic gambit — pick a friendly orator (the Confessor if he lives). A friendly within 3" of the orator (6" for the Confessor) benefits from the Sermon: Normal and Critical Dmg of 4 or more inflicts 1 less; one activated in range benefits for the whole activation.'),
  },
  replacements: Object.fromEntries(SLOTS.map((id) => [id, PICKS])),
  ops,
  ploys: [
    P('sfProtects', '皇帝庇佑', 'The Emperor Protects', '敵人射擊享有佈道加成的友方淨化者時，可以重擲同一種結果的所有防禦骰（自動選最有利的結果）。', 'When an enemy shoots a friendly SANCTIFIER benefitting from the Sermon, re-roll any defence dice of one result (the best one is chosen automatically).'),
    P('sfBrawl', '狂熱混戰', 'Fervent Brawl', '享有佈道加成的友方淨化者近戰或反擊時，近戰武器獲得「無休」。', 'A friendly SANCTIFIER benefitting from the Sermon that is fighting or retaliating has Ceaseless on its melee weapons.'),
    P('sfZealous', '狂熱迫害', 'Zealous Persecution', '友方淨化者在有衝鋒的啟動中近戰時，近戰武器獲得「致命 5+」。', 'A friendly SANCTIFIER fighting in an activation in which it charged has Lethal 5+ on its melee weapons.'),
    P('sfRally', '聚攏信眾', 'Rally the Flock', '每名享有佈道加成的友方淨化者（佈道者除外）立刻免費衝刺或撤退（撤退最多 3"），結束時要比開始更靠近、且看得到（或看得到它的）佈道者。第 1 回合不能用。（自動選擇）', 'Each friendly SANCTIFIER (not the orator) benefitting from the Sermon makes a free Dash or Fall Back (3" at most), ending closer to and visible to the orator. Not in the first turning point. (Chosen automatically.)'),
  ],
  firefight: [
    P('sfRosarius', '護身聖章', 'Rosarius', '一顆攻擊骰對友方淨化者造成普通傷害時使用：無視那次傷害。', 'When an attack die inflicts Normal Dmg on a friendly SANCTIFIER, ignore that damage.'),
    P('sfArdent', '熱誠肅清', 'Ardent Eradication', '友方淨化者射擊或近戰、擲完攻擊骰後，若目標在佈道者 3"（懺悔師 6"）內：重擲任意攻擊骰。', 'After rolling attack dice for a friendly SANCTIFIER shooting or fighting an enemy within 3" of the orator (6" for the Confessor): re-roll any attack dice.'),
    P('sfRedeemed', '烈火救贖', 'Redeemed Through Fire', '有烈焰武器的友方淨化者殘廢、被移除前：看得到它、2" 內的每個敵人獲得你的烈焰標記。', 'When a friendly SANCTIFIER with a Blaze weapon is incapacitated, before it is removed: each enemy visible to and within 2" of it gains a Blaze token.'),
    P('sfUnwavering', '堅定奉獻', 'Unwavering Devotion', '友方佈道者或奇蹟使被選為射擊目標或近戰對象時：另一名在它 3" 內、看得到它的友方淨化者（懺悔師、奇蹟使、佈道者除外）改成目標。對爆裂或洪流武器無效。（自動：只在能少受傷時使用）', 'When a friendly orator or Miraculist is the valid target of a Shoot or fought against: another friendly SANCTIFIER (not Confessor, Miraculist or orator) visible within 3" becomes the target instead. No effect against Blast or Torrent weapons. (Used automatically when it helps.)'),
  ],
};

/** The picks: each once except Preachers (up to four); a Missionary of each group at most; the two braziers not together. */
export function sanctifiersRosterError(t, roster = {}) {
  const ids = SLOTS.map((slot) => roster[slot] || slot);
  const bad = [];
  const name = (id, lang) => t.ops.find((o) => o.id === id).name[lang];
  const dup = [...new Set(ids.filter((id, i) => id !== 'sfPreacher' && !['sfMissA', 'sfMissB', 'sfMissC', 'sfMissD'].includes(id) && ids.indexOf(id) !== i))];
  if (dup.length) bad.push(B(`重複選了：${dup.map((id) => name(id, 'zh')).join('、')}（除了布道者，每種只能選一次）`, `Picked more than once: ${dup.map((id) => name(id, 'en')).join(', ')} (each only once, except Preachers)`));
  if (ids.filter((id) => id === 'sfPreacher').length > 4) bad.push(B('布道者最多 4 名', 'At most four Preachers'));
  if (ids.filter((id) => id === 'sfMissA' || id === 'sfMissB').length > 1) bad.push(B('火焰噴射器傳教士只能選一款', 'Only one of the Ministorum flamer Missionaries'));
  if (ids.filter((id) => id === 'sfMissC' || id === 'sfMissD').length > 1) bad.push(B('熔融槍／電漿槍傳教士只能選一款', 'Only one of the meltagun / plasma gun Missionaries'));
  if (ids.includes('sfMissA') && ids.includes('sfMissD')) bad.push(B('兩款有聖火火盆的傳教士不能同時選', 'The two Missionaries with a brazier of holy fire can\'t both be taken'));
  return bad.length ? B(bad.map((b) => b.zh).join('；'), bad.map((b) => b.en).join('; ')) : null;
}

export const SANCTIFIERS_EQUIPMENT = {
  sfOrbs: { name: B('淨化聖球', 'Sanctification Orbs'), desc: B('每回合一次，一名友方淨化者（小天使、死亡教派刺客、奇蹟使除外）可以做 1AP 動作「淨化聖球」：選 6" 內看得到的一名敵人，它和它 1" 內的每名敵人各擲 D6，3+ 獲得你的濕透標記。友方用烈焰武器射擊有濕透標記的敵人時獲得「搜尋」，用完烈焰武器後移除標記。', 'Once per TP one friendly SANCTIFIER (not Cherub, Death Cult Assassin or Miraculist) can perform the 1AP Sanctification Orb action: pick an enemy visible within 6"; it and each enemy within 1" of it rolls a D6 — on 3+ it gains a Doused token. Blaze weapons shooting a Doused enemy have Seek; the token goes after a Blaze weapon is used on it.') },
  sfSymbols: { name: B('帝國教派聖徽', 'Imperial Cult Symbols'), desc: B('每回合一次（自動）：敵人射擊享有佈道加成的友方淨化者、收集防禦骰時，把攻擊者一個保留的暴擊改為普通成功。', 'Once per TP (automatic): when an enemy shoots a friendly SANCTIFIER benefitting from the Sermon, as defence dice are collected, change one of the attacker\'s retained critical successes to a normal success.') },
  sfSeals: { name: B('純潔封印', 'Purity Seals'), desc: B('每回合一次（自動）：友方淨化者射擊或近戰時，若擲出兩個以上失敗，可以捨棄一個失敗、把另一個失敗保留為普通成功。', 'Once per TP (automatic): when a friendly SANCTIFIER is shooting or fighting and rolls two or more fails, discard one to retain another as a normal success.') },
  sfTexts: { name: B('教會典籍', 'Ecclesiarchy Texts'), desc: B('每個策略階段的準備步驟（謀略步驟前），擲 3D6：若小於友方佈道者剩餘的生命，獲得 1CP。', 'In the Ready step of each Strategy phase (before the Gambit step), roll 3D6: if the result is less than the remaining wounds of a friendly orator, you gain 1CP.') },
};
