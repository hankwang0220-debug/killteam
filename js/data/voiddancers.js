// Void-dancer Troupe (虛空舞者劇團): Harlequin performers.
// Source: https://assets.warhammer-community.com/eng_17-06_kill_team_team_rules_void-dancer_troupe_online_rules-ee8qymqvq4-w24lgiuhhz.pdf (June '26)
// Every choice of weapons is its own operative template (e.g. vdPlayerShurikenKiss = Player with a shuriken pistol and a kiss), generated
// below. The Lead Player is always in the kill team; seven more come from the list (Death Jester and Shadowseer once each).
const B = (zh, en) => ({ zh, en });
const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) => ({ id, name: B(zh, en), type, atk, hit, dmg: [dn, dc], rules, group });
const P = (id, zh, en, z, e) => ({ id, cp: 1, name: B(zh, en), desc: B(z, e) });

const RANGED = {
  Fusion: W('vdFusion', '熔融手槍', 'Fusion pistol', 'ranged', 4, 3, 5, 3, { range: 3, devastating: 3, piercing: 2 }),
  Neuro: W('vdNeuro', '神經干擾器', 'Neuro disruptor', 'ranged', 4, 3, 4, 5, { range: 8, piercing: 1, stun: true }),
  Shuriken: W('vdShuriken', '手裏劍手槍', 'Shuriken pistol', 'ranged', 4, 3, 3, 4, { range: 8, rending: true }),
};
const MELEE = {
  Blade: W('vdBlade', '刀刃', 'Blade', 'melee', 5, 3, 4, 6),
  Caress: W('vdCaress', '愛撫', 'Caress', 'melee', 5, 3, 4, 5, { rending: true }),
  Embrace: W('vdEmbrace', '擁抱', 'Embrace', 'melee', 5, 3, 4, 5, { brutal: true }),
  Kiss: W('vdKiss', '親吻', 'Kiss', 'melee', 5, 3, 3, 7),
  Power: W('vdPower', '動力武器', 'Power weapon', 'melee', 5, 3, 4, 6, { lethal: 5 }),
};
const shriekF = W('vdShriekF', '尖嘯炮（集中）', 'Shrieker cannon (focused)', 'ranged', 5, 3, 4, 5, { rending: true, heavy: 'reposition', vdHumbling: true }, 'vdShriek');
const shriekS = W('vdShriekS', '尖嘯炮（掃射）', 'Shrieker cannon (sweeping)', 'ranged', 4, 3, 4, 5, { rending: true, heavy: 'dash', torrent: 2, vdHumbling: true }, 'vdShriek');
const shriekBlade = W('vdShriekBlade', '尖嘯刀刃', 'Shrieker blade', 'melee', 4, 3, 3, 4, { rending: true });
const hallucinogen = W('vdHallu', '幻覺手榴彈', 'Hallucinogen grenade', 'ranged', 4, 3, 1, 1, { range: 6, blast: 2, lethal: 5, seekLight: true, silent: true, stun: true });
const miststave = W('vdMiststave', '迷霧法杖', 'Miststave', 'melee', 4, 3, 4, 4, { shock: true });

const ZH = { Fusion: '熔融手槍', Neuro: '神經干擾器', Shuriken: '手裏劍手槍', Blade: '刀刃', Caress: '愛撫', Embrace: '擁抱', Kiss: '親吻', Power: '動力武器' };
const O = (id, zh, en, weapons, extra = {}) => ({ id, name: B(zh, en), count: 0, apl: 3, move: 7, save: 4, wounds: 8, base: 25, weapons, vdTroupe: true, ...extra });
const ops = [];
for (const r of Object.keys(RANGED)) for (const m of Object.keys(MELEE)) {
  ops.push(O(`vdLead${r}${m}`, `首席演員（${ZH[r]}、${ZH[m]}）`, `Lead Player (${RANGED[r].name.en.toLowerCase()}, ${MELEE[m].name.en.toLowerCase()})`, [RANGED[r], MELEE[m]], { wounds: 9, leader: true, vdLead: true, vdRanged: r, vdBase: 'lead' }));
}
for (const r of Object.keys(RANGED)) for (const m of ['Blade', 'Caress', 'Embrace', 'Kiss']) {
  ops.push(O(`vdPlayer${r}${m}`, `演員（${ZH[r]}、${ZH[m]}）`, `Player (${RANGED[r].name.en.toLowerCase()}, ${MELEE[m].name.en.toLowerCase()})`, [RANGED[r], MELEE[m]], { vdPlayer: true, vdRanged: r, vdBase: 'player' }));
}
ops.push(O('vdJester', '死亡小丑', 'Death Jester', [shriekF, shriekS, shriekBlade], { wounds: 9, vdJester: true, vdBase: 'jester' }));
ops.push(O('vdSeerN', '暗影先知（神經干擾器）', 'Shadowseer (neuro disruptor)', [hallucinogen, RANGED.Neuro, miststave], { wounds: 9, vdSeer: true, vdRanged: 'Neuro', vdBase: 'seer', psyker: true }));
ops.push(O('vdSeerS', '暗影先知（手裏劍手槍）', 'Shadowseer (shuriken pistol)', [hallucinogen, RANGED.Shuriken, miststave], { wounds: 9, vdSeer: true, vdRanged: 'Shuriken', vdBase: 'seer', psyker: true }));
// Default kill team: the Lead Player (shuriken pistol, blade), the Death Jester, a Shadowseer and five Players.
const LEAD_DEFAULT = 'vdLeadShurikenBlade';
const PLAYER_PICKS = ops.filter((o) => o.vdPlayer || o.vdJester || o.vdSeer).map((o) => o.id);
for (const o of ops) {
  if (o.id === LEAD_DEFAULT || o.id === 'vdJester' || o.id === 'vdSeerS') o.count = 1;
  if (o.id === 'vdPlayerShurikenCaress') o.count = 5;
}

export const VOIDDANCERS_TEAM = {
  id: 'voidDancers', name: B('虛空舞者劇團', 'Void-dancer Troupe'), color: '#c2398f', keywords: ['AELDARI', 'HARLEQUIN', 'VOID-DANCER TROUPE'],
  rulesUrl: 'https://assets.warhammer-community.com/eng_17-06_kill_team_team_rules_void-dancer_troupe_online_rules-ee8qymqvq4-w24lgiuhhz.pdf',
  style: B('混合隊・敏捷・表演', 'Mixed · Agile · Performance'),
  blurb: B('笑神的丑角劇團：每名演員都是 APL 3 的精英，一邊閃躲一邊演出致命的寓言，戲越演越熱，整團的武器就越精準。', 'A Harlequin troupe of the Laughing God: every player is an APL 3 elite, dodging and performing a deadly allegory, and the further the performance goes, the more of the troupe strikes true.'),
  info: {
    archetypes: [B('偵察', 'Recon'), B('滲透', 'Infiltration')],
    kind: B('混合隊', 'Mixed'),
    oneBox: B('否，需要另外購買 HQ 單位', 'No, you also need to buy the HQ units'),
    buyable: B('能，這些單位都是大桌盒', 'Yes, all of them are Warhammer 40,000 kits'),
    size: B('8 名特工', '8 operatives'),
    note: B('首席演員＋7 名：死亡小丑、暗影先知各只能選一次，演員可重複；整隊最多一把熔融手槍、一把神經干擾器。', 'Lead Player + 7: Death Jester and Shadowseer once each, Players repeat; at most one fusion pistol and one neuro disruptor in the kill team.'),
  },
  rule: {
    name: B('劇目・丑角裝備', 'Saedath · Harlequin\'s Panoply'),
    desc: B('第 1 回合策略謀略選一個寓言（史詩：近戰時近戰武器「平衡」；通俗劇：遠程武器「平衡」）和一名主角，主角擁有該寓言的讚譽；之後每回合可以再讓一名友方獲得讚譽，主角完成演出（史詩：近戰中使敵人殘廢；通俗劇：射擊使敵人殘廢）時每回合一次也可以。丑角裝備：被射擊時若沒有攻擊骰保留為暴擊，穿甲 X 減 1。',
      'In TP1 pick an allegory (Epic: melee weapons Balanced when fighting; Melodrama: ranged weapons Balanced) and an operative with the Pivotal Role, which has that Accolade; each later TP another friendly gains the Accolade, and once per TP so does one when the Pivotal operative completes the performance (Epic: incapacitates an enemy while fighting; Melodrama: while shooting). Harlequin\'s Panoply: when shot with no critical attack dice retained, Piercing is worsened by 1.'),
  },
  replacements: {
    [LEAD_DEFAULT]: ops.filter((o) => o.vdLead).map((o) => o.id),
    vdJester: PLAYER_PICKS, vdSeerS: PLAYER_PICKS, vdPlayerShurikenCaress: PLAYER_PICKS,
  },
  perCopyRoster: true,
  ops,
  ploys: [
    P('vdCrescendo', '高潮迭起', 'Rising Crescendo', '友方虛空舞者可以在衝鋒的同一次啟動中衝刺（但不能先衝刺再衝鋒）。', 'Friendly VOID-DANCER TROUPE operatives can Dash in the same activation in which they Charged (not Dash then Charge).'),
    P('vdBlur', '稜光殘影', 'Prismatic Blur', '敵人射擊本回合做過移動動作的友方虛空舞者時，可以重擲一顆防禦骰。', 'When an enemy shoots a friendly VOID-DANCER TROUPE operative that performed an action in which it moved this TP, re-roll one defence die.'),
    P('vdSalvo', '飛躍射擊', 'Darting Salvo', '友方虛空舞者重新定位後射擊時，可以接著用完那次重新定位剩下的移動距離（視為同一個動作）。', 'A friendly VOID-DANCER TROUPE operative that Repositions can shoot and then use the rest of that Reposition\'s move distance.'),
    P('vdJest', '笑神的玩笑', 'Cegorach\'s Jest', '友方虛空舞者近戰或反擊、對手以普通成功攻擊時，擲 D6：小於對手武器的命中值，那次攻擊改為擋掉你的一顆骰子（無視殘暴），每次近戰一次（自動）。', 'A friendly VOID-DANCER TROUPE operative fighting or retaliating: when your opponent strikes with a normal success, roll a D6; if it is less than the Hit stat of their weapon, that strike blocks one of your dice instead (ignore Brutal). Once per sequence (automatic).'),
  ],
  firefight: [
    P('vdCurtain', '落幕', 'The Curtain Falls', '友方虛空舞者近戰中以暴擊打擊後、敵人沒殘廢時（自動，預設關閉）：結束這次近戰，免費衝刺或撤退最多 3"。', 'After a friendly VOID-DANCER TROUPE operative strikes with a critical success and the enemy isn\'t incapacitated (automatic, off by default): end the sequence and make a free Dash or Fall Back of up to 3".'),
    P('vdElusive', '難以捉摸', 'Elusive Target', '友方虛空舞者啟動中使用：到它下次啟動前，隱蔽指令且在掩護中時，除了 2" 內不能被選為有效目標。', 'During a friendly VOID-DANCER TROUPE operative\'s activation: until its next activation, with a Conceal order and in cover it can\'t be a valid target except within 2".'),
    P('vdMurder', '殺戮登場', 'Murderous Entrance', '友方虛空舞者在有衝鋒的啟動中近戰：打擊後可以立刻再結算一個普通成功（沒有就用暴擊），先於對手。', 'A friendly VOID-DANCER TROUPE operative fighting in an activation in which it Charged: after you strike, resolve another normal success (or a critical one if none) straight away, before your opponent.'),
    P('vdDomino', '骨牌力場', 'Domino Field', '敵人射擊友方虛空舞者、結算防禦骰時（自動，最有利時）：用一顆成功的防禦骰擋掉所有點數相同的攻擊骰。', 'When an enemy shoots a friendly VOID-DANCER TROUPE operative, in the Resolve Defence Dice step (automatic, when it helps): one successful defence die blocks every attack die with the same result.'),
  ],
};

/** Seven picks: Death Jester and Shadowseer once each; at most one fusion pistol and one neuro disruptor in the kill team. */
export function voidDancersRosterError(t, roster = {}) {
  const tplOf = (id) => t.ops.find((o) => o.id === id);
  const pick = (slot, n) => { const v = roster[slot]; return Array.from({ length: n }, (_, i) => (Array.isArray(v) ? v[i] : v) || slot); };
  const ids = [...pick(LEAD_DEFAULT, 1), ...pick('vdJester', 1), ...pick('vdSeerS', 1), ...pick('vdPlayerShurikenCaress', 5)];
  const ts = ids.map(tplOf);
  const bad = [];
  if (ts.filter((o) => o.vdJester).length > 1) bad.push(B('死亡小丑只能選一次', 'Only one Death Jester'));
  if (ts.filter((o) => o.vdSeer).length > 1) bad.push(B('暗影先知只能選一次', 'Only one Shadowseer'));
  if (ts.filter((o) => o.vdRanged === 'Fusion').length > 1) bad.push(B('整隊最多一把熔融手槍', 'At most one fusion pistol'));
  if (ts.filter((o) => o.vdRanged === 'Neuro').length > 1) bad.push(B('整隊最多一把神經干擾器', 'At most one neuro disruptor'));
  return bad.length ? B(bad.map((b) => b.zh).join('；'), bad.map((b) => b.en).join('; ')) : null;
}

export const VOIDDANCERS_EQUIPMENT = {
  vdToxin: { name: B('尖嘯毒彈', 'Shrieker Toxin Rounds'), desc: B('每回合一次（自動），友方虛空舞者用手裏劍手槍或尖嘯炮（集中）射擊時：這次射擊武器獲得「毀滅 1」。', 'Once per TP (automatic), when a friendly VOID-DANCER TROUPE operative shoots with a shuriken pistol or shrieker cannon (focused): Devastating 1 for that action.') },
  vdMask: { name: B('死亡面具', 'Death Mask'), desc: B('記錄悲劇數：擁有讚譽的友方殘廢時 +1；達到 3 時獲得 1CP，之後不再計算。', 'Keep a Tragedy tally: +1 whenever a friendly operative with an ACCOLADE is incapacitated; at 3 you gain 1CP and stop the tally.') },
  vdTalisman: { name: B('靈骨護符', 'Wraithbone Talisman'), desc: B('每回合一次（自動），友方虛空舞者射擊、近戰或反擊時擲出兩個以上失敗：捨棄一個，另一個保留為普通成功。', 'Once per TP (automatic), when a friendly VOID-DANCER TROUPE operative shooting, fighting or retaliating rolls two or more fails: discard one and retain another as a normal success.') },
  vdUnderstudy: { name: B('替身面具', 'Understudy\'s Mask'), desc: B('整場一次（自動），擁有主角的友方殘廢後，啟動下一名友方虛空舞者時它成為主角。', 'Once per battle (automatic), if the friendly operative with the PIVOTAL ROLE has been incapacitated, the next friendly VOID-DANCER TROUPE operative you activate gets the PIVOTAL ROLE.') },
};
