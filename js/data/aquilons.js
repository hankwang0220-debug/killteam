// Tempestus Aquilons (風暴天鷹): Militarum Tempestus grav-chute shock troops.
// Source: https://assets.warhammer-community.com/eng_tempestus_aquilons_online_rules-ulwuv6xiox-urjoo7nn95.pdf (errata August '26)
// Every choice of weapons is its own operative template (e.g. aqGunnerM = Gunner with a melta carbine). The Tempestor, the Servo-sentry and
// nine more operatives make up the kill team.
const B = (zh, en) => ({ zh, en });
const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) => ({ id, name: B(zh, en), type, atk, hit, dmg: [dn, dc], rules, group });
const P = (id, zh, en, z, e) => ({ id, cp: 1, name: B(zh, en), desc: B(z, e) });

const laspistol = W('aqLaspistol', '熱射雷射手槍', 'Hot-shot laspistol', 'ranged', 4, 3, 3, 4, { range: 8 });
const lascarbine = W('aqLascarbine', '熱射雷射卡賓槍', 'Hot-shot lascarbine', 'ranged', 4, 3, 3, 4);
const relicBolt = W('aqRelicBolt', '聖物爆彈手槍', 'Relic bolt pistol', 'ranged', 4, 3, 3, 5, { range: 8, lethal: 5 });
const chainsword = W('aqChainsword', '鏈鋸劍', 'Chainsword', 'melee', 4, 3, 4, 5);
const power = W('aqPower', '動力武器', 'Power weapon', 'melee', 4, 3, 4, 6, { lethal: 5 });
const fistsT = W('aqFistsT', '拳頭', 'Fists', 'melee', 3, 3, 2, 3);
const fists = W('aqFists', '拳頭', 'Fists', 'melee', 3, 4, 2, 3);
const nothing = W('aqNothing', '（沒有近戰武器）', '(no melee weapon)', 'melee', 1, 6, 0, 0);
const gfFocused = W('aqGfFocused', '熱射雷射雙槍（集中）', 'Hot-shot laspistols (focused)', 'ranged', 4, 3, 3, 4, { range: 8, ceaseless: true, rending: true }, 'aqGf');
const gfSalvo = W('aqGfSalvo', '熱射雷射雙槍（連射）', 'Hot-shot laspistols (salvo)', 'ranged', 4, 4, 3, 4, { range: 8, salvo: true }, 'aqGf');
const gfPoint = W('aqGfPoint', '熱射雷射雙槍（近距離）', 'Hot-shot laspistols (point-blank)', 'ranged', 4, 3, 3, 4, { ceaseless: true }, 'aqGf');
const meltaBomb = W('aqMeltaBomb', '熔融炸彈', 'Melta bomb', 'ranged', 4, 3, 5, 3, { range: 3, devastating: 3, heavy: 'reposition', limited: 1, piercing: 2 });
const llC = W('aqLongC', '熱射長程雷射槍（隱蔽）', 'Hot-shot long-las (concealed)', 'ranged', 4, 2, 3, 3, { devastating: 3, heavy: true, silent: true, firstShotOnly: true }, 'aqLong');
const llM = W('aqLongM', '熱射長程雷射槍（移動）', 'Hot-shot long-las (mobile)', 'ranged', 4, 3, 3, 4, {}, 'aqLong');
const llS = W('aqLongS', '熱射長程雷射槍（固定）', 'Hot-shot long-las (stationary)', 'ranged', 4, 2, 3, 3, { devastating: 3, heavy: true }, 'aqLong');
const flamer = W('aqFlamer', '噴火器', 'Flamer', 'ranged', 4, 2, 3, 3, { range: 8, saturate: true, torrent: 2 });
const glFrag = W('aqGlFrag', '榴彈發射器（破片）', 'Grenade launcher (frag)', 'ranged', 4, 4, 2, 4, { blast: 2 }, 'aqGl');
const glKrak = W('aqGlKrak', '榴彈發射器（穿甲）', 'Grenade launcher (krak)', 'ranged', 4, 4, 4, 5, { piercing: 1 }, 'aqGl');
const vgFocused = W('aqVgFocused', '熱射連發炮（集中）', 'Hot-shot volley gun (focused)', 'ranged', 5, 4, 3, 4, { piercingCrits: 1 }, 'aqVg');
const vgSweeping = W('aqVgSweeping', '熱射連發炮（掃射）', 'Hot-shot volley gun (sweeping)', 'ranged', 4, 4, 3, 4, { piercingCrits: 1, torrent: 1 }, 'aqVg');
const meltaCarbine = W('aqMeltaCarbine', '熔融卡賓槍', 'Melta carbine', 'ranged', 4, 3, 6, 3, { range: 6, devastating: 4, piercing: 2 });
const plasmaStd = W('aqPlasmaStd', '電漿卡賓槍（標準）', 'Plasma carbine (standard)', 'ranged', 4, 3, 4, 6, { piercing: 1 }, 'aqPlasma');
const plasmaSuper = W('aqPlasmaSuper', '電漿卡賓槍（超載）', 'Plasma carbine (supercharge)', 'ranged', 4, 3, 5, 6, { hot: true, lethal: 5, piercing: 1 }, 'aqPlasma');
const dagger = W('aqDaggerP', '風暴匕首', 'Tempestus dagger', 'melee', 4, 3, 3, 4, { ceaseless: true, lethal: 5 });
export const AQ_DAGGER = W('aqDagger', '風暴匕首', 'Tempestus dagger', 'melee', 3, 4, 3, 4);

const O = (id, zh, en, weapons, extra = {}) => ({ id, name: B(zh, en), count: 0, apl: 2, move: 6, save: 4, wounds: 8, base: 28, weapons, aqAquilon: true, ...extra });
const ops = [
  O('aqTempestorL', '風暴指揮官（熱射手槍、動力武器）', 'Aquilon Tempestor (hot-shot laspistol, power weapon)', [laspistol, power], { count: 1, apl: 3, wounds: 9, leader: true, aqTempestor: true, aqBase: 'tempestor', support: 'aqCommand' }),
  O('aqTempestorB', '風暴指揮官（聖物爆彈手槍、鏈鋸劍）', 'Aquilon Tempestor (relic bolt pistol, chainsword)', [relicBolt, chainsword], { apl: 3, wounds: 9, leader: true, aqTempestor: true, aqBase: 'tempestor', support: 'aqCommand' }),
  O('aqTempestorC', '風暴指揮官（熱射卡賓槍、拳頭）', 'Aquilon Tempestor (hot-shot lascarbine, fists)', [lascarbine, fistsT], { apl: 3, wounds: 9, leader: true, aqTempestor: true, aqBase: 'tempestor', support: 'aqCommand' }),
  O('aqSentryF', '伺服哨兵（噴火器）', 'Aquilon Servo-sentry (flamer)', [flamer, nothing], { count: 1, move: 4, save: 3, wounds: 10, base: 40, aqSentry: true, aqBase: 'sentry', twoShoots: true, actionsOnly: ['dash', 'fallBack', 'reposition', 'shoot'] }),
  O('aqSentryG', '伺服哨兵（榴彈發射器）', 'Aquilon Servo-sentry (grenade launcher)', [glFrag, glKrak, nothing], { move: 4, save: 3, wounds: 10, base: 40, aqSentry: true, aqBase: 'sentry', twoShoots: true, actionsOnly: ['dash', 'fallBack', 'reposition', 'shoot'] }),
  O('aqSentryV', '伺服哨兵（熱射連發炮）', 'Aquilon Servo-sentry (hot-shot volley gun)', [vgFocused, vgSweeping, nothing], { move: 4, save: 3, wounds: 10, base: 40, aqSentry: true, aqBase: 'sentry', twoShoots: true, actionsOnly: ['dash', 'fallBack', 'reposition', 'shoot'] }),
  O('aqGrenadier', '風暴天鷹擲彈兵', 'Aquilon Grenadier', [laspistol, meltaBomb, fists], { count: 1, grenadier: true, aqGrenadier: true, aqBase: 'grenadier' }),
  O('aqGunfighter', '風暴天鷹槍戰手', 'Aquilon Gunfighter', [gfFocused, gfSalvo, gfPoint, nothing], { count: 1, aqGunfighter: true, aqBase: 'gunfighter' }),
  O('aqGunnerM', '風暴天鷹槍手（熔融卡賓槍）', 'Aquilon Gunner (melta carbine)', [meltaCarbine, fists], { count: 1, aqBase: 'gunnerM' }),
  O('aqGunnerP', '風暴天鷹槍手（電漿卡賓槍）', 'Aquilon Gunner (plasma carbine)', [plasmaStd, plasmaSuper, fists], { count: 1, aqBase: 'gunnerP' }),
  O('aqMarksman', '風暴天鷹神射手', 'Aquilon Marksman', [llC, llM, llS, fists], { count: 1, aqMarksman: true, aqBase: 'marksman' }),
  O('aqPrecursor', '風暴天鷹先驅', 'Aquilon Precursor', [laspistol, dagger], { count: 1, aqPrecursor: true, aqBase: 'precursor' }),
  O('aqTrooper', '風暴天鷹士兵', 'Aquilon Trooper', [lascarbine, fists], { count: 3, aqTrooper: true, aqBase: 'trooper' }),
];
const OPT = (...ids) => ids;
const PICKS = ['aqGrenadier', 'aqGunfighter', 'aqGunnerM', 'aqGunnerP', 'aqMarksman', 'aqPrecursor', 'aqTrooper'];

export const AQUILONS_TEAM = {
  id: 'aquilons', name: B('風暴天鷹', 'Tempestus Aquilons'), color: '#4a5d8a', keywords: ['IMPERIUM', 'ASTRA MILITARUM', 'MILITARUM TEMPESTUS', 'TEMPESTUS AQUILON'],
  rulesUrl: 'https://assets.warhammer-community.com/eng_tempestus_aquilons_online_rules-ulwuv6xiox-urjoo7nn95.pdf',
  style: B('射擊隊・空降・快攻', 'Shooting · Drop troops · Assault'),
  blurb: B('駕著反重力降落傘從天而降的精銳：三分之二的隊伍先在天上待命，等時機成熟再落在敵人面前，近距離用熱射武器先發制人。', 'Grav-chute elites that wait above the battlefield and land among the enemy when the moment is right, shooting first with hot-shot weapons at close range.'),
  info: {
    archetypes: [B('偵察', 'Recon'), B('搜索與摧毀', 'Seek and Destroy')],
    kind: B('射擊隊', 'Shooting'),
    oneBox: B('能，但是其中一位的普通特工要裝上炮手武器，需要修改', 'Yes, but one of the ordinary operatives has to be fitted with a Gunner weapon (a conversion)'),
    buyable: B('能', 'Yes'),
    size: B('11 名特工', '11 operatives'),
    note: B('指揮官（3 種武器）＋伺服哨兵（3 種武器）＋9 名：除了士兵外每種只能選一次（兩種槍手各算一種）。', 'Tempestor (3 weapon options) + Servo-sentry (3 options) + 9: each once except Troopers (the two Gunners count separately).'),
  },
  rule: {
    name: B('空降部署・反重力降落傘', 'Drop Insertion · Grav-chute'),
    desc: B('部署時第一批（約三分之一）正常放置；之後每一批可以整批「放在天上」（放在一旁），每一批要在降落區內放一個空降標記。第 1、2 回合以策略謀略可以把空降標記水平移動最多 4"。天上的特工照常啟動，啟動時可以選擇「消耗」或「降落」：降落在空降標記 3" 內、或完全在己方降落區內（不能在敵人控制範圍內，先驅除外），任意指令，視為重新定位（花 AP），之後繼續啟動；降落後到下一次啟動結束前處於遮蔽狀態。第 1 回合結束時必須超過一半在戰場上；第 2、3 回合準備時各移除一個空降標記，第 2 回合結束時仍在天上的特工殘廢。',
      'The first third is set up normally; each later third can be set up above (aside), with a Drop marker placed in your drop zone for each such third. As a strategic gambit in TP1 and TP2 you can move the Drop markers up to 4". Operatives above activate as normal and can then expend or land: within 3" of a Drop marker or wholly within your drop zone, not in enemy control range (Precursors can be), any order; it counts as a Reposition (spend the AP) and the activation continues; it is obscured until the end of the next activation. By the end of TP1 more than half must be in the killzone; a Drop marker is removed when readying in TP2 and TP3, and operatives still above are incapacitated at the end of TP2.'),
  },
  replacements: {
    aqTempestorL: ['aqTempestorL', 'aqTempestorB', 'aqTempestorC'],
    aqSentryF: ['aqSentryF', 'aqSentryG', 'aqSentryV'],
    aqGrenadier: PICKS, aqGunfighter: PICKS, aqGunnerM: PICKS, aqGunnerP: PICKS, aqMarksman: PICKS, aqPrecursor: PICKS,
    aqTrooper: PICKS,
  },
  perCopyRoster: true,
  ops,
  ploys: [
    P('aqSudden', '突然攻勢', 'Sudden Offensive', '算出沒殘廢的友方風暴天鷹數量的一半（無條件進位）為 x：本回合最先啟動的 x 名友方，到它們啟動結束前武器獲得「平衡」。', 'Count your non-incapacitated friendly TEMPESTUS AQUILON operatives and halve it (rounding up) to get x: the first x friendly operatives activated this TP have Balanced until the end of their activation.'),
    P('aqMomentum', '保持氣勢', 'Maintain Momentum', '友方風暴天鷹射擊或近戰一名準備中的敵人時，武器獲得「嚴重」。', 'A friendly TEMPESTUS AQUILON operative shooting or fighting a ready enemy has Severe.'),
    P('aqEye', '天眼', 'Eye Above', '選一名敵人：它和 3" 內的每名敵人本回合獲得你的偵測標記。有偵測標記的敵人射擊友方風暴天鷹時你可重擲一顆防禦骰；近戰或反擊時你的一次格擋可以擋兩個成功。', 'Pick an enemy: it and each enemy within 3" gain your Detected token this TP. A Detected enemy shooting a friendly TEMPESTUS AQUILON: re-roll one defence die; fighting or retaliating against one: one block stops two successes.'),
    P('aqSecure', '空降並確保', 'Drop and Secure', '選一個標記：到下回合準備前，爭奪它時友方風暴天鷹（至少一名在爭奪）的 APL 總和視為高 1；友方風暴天鷹在它 3" 內時近戰武器 Atk +1（最多 4）。', 'Pick a marker: until the next Ready step, friendly TEMPESTUS AQUILON operatives contesting it count 1 higher in APL total, and those within 3" of it have +1 melee Atk (max 4).'),
  ],
  firefight: [
    P('aqHotDrop', '熱降', 'Hot Drop', '友方風暴天鷹在敵方領地內、或本次啟動降落／從高處降落，擲完攻擊骰後（自動）：目標在 6" 內時可以重擲任意攻擊骰。', 'After rolling attack dice for a friendly TEMPESTUS AQUILON operative wholly in the enemy territory, or that landed this activation (automatic): if the target is within 6", re-roll any attack dice.'),
    P('aqAdjust', '調整座標', 'Adjust Coordinates', '友方風暴天鷹降落時（自動）：可以降落在空降標記 5" 內（取代一般距離）；本回合它不能衝刺、射擊或近戰。', 'When a friendly TEMPESTUS AQUILON operative lands (automatic): it can land within 5" of a Drop marker; it can\'t Dash, Shoot or Fight this TP.'),
    P('aqExemplar', '風暴楷模', 'Tempestus Exemplars', '友方風暴天鷹啟動中（APL 2 以下、伺服哨兵除外）：本次啟動撿標記、放標記或任務行動少 1AP。', 'During a friendly TEMPESTUS AQUILON operative\'s activation (APL 2 or less, not the Servo-sentry): Pick Up Marker, Place Marker or a mission action costs 1 less AP.'),
    P('aqProgena', '孤兒學院', 'Progena', '友方風暴天鷹啟動時（伺服哨兵除外）使用：回復最多 2D3 生命，本次啟動無視 APL 的改變。', 'When a friendly TEMPESTUS AQUILON operative (not the Servo-sentry) is activated: it regains up to 2D3 wounds and ignores APL changes this activation.'),
  ],
};

const SLOTS_UNIQUE = ['aqGrenadier', 'aqGunfighter', 'aqGunnerM', 'aqGunnerP', 'aqMarksman', 'aqPrecursor'];
/** Nine picks: each once, except Troopers (the two Gunners count separately). */
export function aquilonsRosterError(t, roster = {}) {
  const pick = (slot, i = 0) => { const v = roster[slot]; return Array.isArray(v) ? v[i] || slot : v || slot; };
  const ids = [...SLOTS_UNIQUE.map((s) => pick(s)), pick('aqTrooper', 0), pick('aqTrooper', 1), pick('aqTrooper', 2)];
  const dup = [...new Set(ids.filter((id, i) => id !== 'aqTrooper' && ids.indexOf(id) !== i))];
  if (!dup.length) return null;
  const nm = (lang) => dup.map((id) => t.ops.find((o) => o.id === id).name[lang]).join(lang === 'zh' ? '、' : ', ');
  return B(`重複選了：${nm('zh')}（除了士兵，每種只能選一次）`, `Picked more than once: ${nm('en')} (each only once, except Troopers)`);
}
void OPT;

export const AQUILONS_EQUIPMENT = {
  aqDaggers: { name: B('風暴匕首', 'Tempestus Daggers'), desc: B('友方風暴天鷹（伺服哨兵除外）多一把近戰武器「風暴匕首」（3/4+/3/4）。', 'Friendly TEMPESTUS AQUILON operatives (not the Servo-sentry) have a Tempestus dagger melee weapon (3 / 4+ / 3/4).') },
  aqStimms: { name: B('戰鬥興奮劑', 'Combat Stimms'), desc: B('友方風暴天鷹忽略因重傷造成的 Move 屬性改變。', 'Ignore any change to the Move stat of friendly TEMPESTUS AQUILON operatives from being injured.') },
  aqAugury: { name: B('空降占卜', 'Drop Augury'), desc: B('整場一次，啟動一名在天上的友方風暴天鷹時、消耗或降落前（自動）：可以再移動一個空降標記，但不能更靠近敵方降落區。', 'Once per battle, when a friendly operative set up above is activated, before it expends or lands (automatic): move one Drop marker again, but not closer to your opponent\'s drop zone.') },
  aqOverseer: { name: B('遠程監督', 'Remote Overseer'), desc: B('整場一次，先攻擲骰後可以重擲你的骰子（先攻階段的卡片區使用）。', 'Once per battle, after the initiative roll-off, re-roll your die (used from the initiative cards).') },
};
