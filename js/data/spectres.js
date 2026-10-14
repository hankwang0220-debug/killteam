// Spectre Squad (魅影小隊): Astra Militarum veteran scouts and ambushers.
// Source: https://assets.warhammer-community.com/eng_spectre_squad_online_rules-bmoqs5lbyu-7d9zjtfxni.pdf (rules commentary August '26)
// Every choice of weapons is its own operative template (e.g. spMedicR = Field Medicae with a lasrifle), so one dropdown per slot picks
// the operative AND its weapons. The Veteran Sergeant and the Vox-relay Beacon are always in the kill team.
const B = (zh, en) => ({ zh, en });
const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) => ({ id, name: B(zh, en), type, atk, hit, dmg: [dn, dc], rules, group });
const P = (id, zh, en, z, e) => ({ id, cp: 1, name: B(zh, en), desc: B(z, e) });

const lascarbine = W('spLascarbine', '雷射卡賓槍', 'Lascarbine', 'ranged', 4, 3, 2, 3, { rending: true }, 'spLas');
const lasrifle = W('spLasrifle', '雷射步槍', 'Lasrifle', 'ranged', 4, 3, 2, 3, { heavy: 'reposition', lethal: 5 }, 'spLas');
const gunButt = W('spGunButt', '槍托', 'Gun butt', 'melee', 3, 4, 2, 3);
const scoped = W('spScoped', '瞄準雷射卡賓槍', 'Scoped lascarbine', 'ranged', 4, 3, 2, 3, { lethal: 5, rending: true });
const bionic = W('spBionic', '仿生手臂', 'Bionic arm', 'melee', 3, 3, 3, 4);
const laspistol = W('spLaspistol', '雷射手槍', 'Laspistol', 'ranged', 4, 3, 2, 3, { range: 8 });
const nothing = W('spNothing', '（沒有武器）', '(no weapon)', 'melee', 1, 6, 0, 0);
const fists = W('spFists', '拳頭', 'Fists', 'melee', 3, 4, 2, 3);
const missileFrag = W('spMissileFrag', '飛彈發射器（破片）', 'Missile launcher (frag)', 'ranged', 4, 3, 3, 5, { blast: 2, heavy: true, spMissile: true }, 'spMissile');
const missileKrak = W('spMissileKrak', '飛彈發射器（穿甲）', 'Missile launcher (krak)', 'ranged', 4, 3, 5, 7, { heavy: true, piercing: 1, spMissile: true }, 'spMissile');
const meltagun = W('spMeltagun', '熔融槍', 'Meltagun', 'ranged', 4, 3, 6, 3, { range: 6, devastating: 4, piercing: 2 });
const plasmaStd = W('spPlasmaStd', '電漿槍（標準）', 'Plasma gun (standard)', 'ranged', 4, 3, 4, 6, { piercing: 1 }, 'spPlasma');
const plasmaSuper = W('spPlasmaSuper', '電漿槍（超載）', 'Plasma gun (supercharge)', 'ranged', 4, 3, 5, 6, { hot: true, lethal: 5, piercing: 1 }, 'spPlasma');
const llC = W('spLongC', '長程雷射槍（隱蔽）', 'Long-las (concealed)', 'ranged', 4, 2, 3, 3, { devastating: 3, heavy: true, silent: true, firstShotOnly: true }, 'spLong');
const llM = W('spLongM', '長程雷射槍（移動）', 'Long-las (mobile)', 'ranged', 4, 3, 3, 4, {}, 'spLong');
const llS = W('spLongS', '長程雷射槍（固定）', 'Long-las (stationary)', 'ranged', 4, 2, 3, 3, { devastating: 3, heavy: true }, 'spLong');
const stubF = W('spStubF', '自動機槍（集中）', 'Autostubber (focused)', 'ranged', 5, 3, 3, 4, { heavy: 'dash' }, 'spStub');
const stubS = W('spStubS', '自動機槍（壓制）', 'Autostubber (suppressive)', 'ranged', 5, 5, 0, 0, { heavy: true, lethal: 5, seekLight: true, stun: true, torrent: 1, spSuppressive: true }, 'spStub');
const stubW = W('spStubW', '自動機槍（掃射）', 'Autostubber (sweeping)', 'ranged', 4, 3, 3, 4, { heavy: 'dash', torrent: 1 }, 'spStub');
export const SP_OVERWATCH = W('spOverwatch', '狙擊警戒', 'Sniper overwatch', 'ranged', 4, 3, 3, 3, { devastating: 2, heavy: 'dash', saturate: true, silent: true });

const O = (id, zh, en, weapons, extra = {}) => ({ id, name: B(zh, en), count: 0, apl: 2, move: 6, save: 5, wounds: 8, base: 28, weapons, spSpectre: true, spCloak: true, ...extra });
const ops = [
  O('spSergeant', '魅影老兵士官', 'Spectre Veteran Sergeant', [scoped, bionic], { count: 1, wounds: 9, leader: true, spSergeant: true, spBase: 'sergeant' }),
  O('spBeacon', '魅影通訊中繼信標', 'Spectre Vox-relay Beacon', [nothing], { count: 1, apl: 1, move: 0, wounds: 3, base: 25, spBeacon: true, spBase: 'beacon', expendable: true, spCloak: false, actionsOnly: ['spBeaconSignal'] }),
  O('spMedicC', '魅影戰地醫護兵（卡賓槍）', 'Spectre Field Medicae (lascarbine)', [lascarbine, gunButt], { spBase: 'medic', medic: true, medikit: true, medikit0: true }),
  O('spMedicR', '魅影戰地醫護兵（步槍）', 'Spectre Field Medicae (lasrifle)', [lasrifle, gunButt], { spBase: 'medic', medic: true, medikit: true, medikit0: true }),
  O('spGrenC', '魅影擲彈兵（卡賓槍）', 'Spectre Grenadier (lascarbine)', [lascarbine, gunButt], { spBase: 'grenadier', spGrenadier: true, grenadier: true, meltaMine: true }),
  O('spGrenR', '魅影擲彈兵（步槍）', 'Spectre Grenadier (lasrifle)', [lasrifle, gunButt], { spBase: 'grenadier', spGrenadier: true, grenadier: true, meltaMine: true }),
  O('spGuideC', '魅影嚮導（卡賓槍）', 'Spectre Guide (lascarbine)', [lascarbine, gunButt], { spBase: 'guide', spGuide: true }),
  O('spGuideR', '魅影嚮導（步槍）', 'Spectre Guide (lasrifle)', [lasrifle, gunButt], { spBase: 'guide', spGuide: true }),
  O('spGunnerM', '魅影槍手（熔融槍）', 'Spectre Gunner (meltagun)', [meltagun, fists], { spBase: 'gunner' }),
  O('spGunnerP', '魅影槍手（電漿槍）', 'Spectre Gunner (plasma gun)', [plasmaStd, plasmaSuper, fists], { spBase: 'gunner' }),
  O('spHeavy', '魅影重武器手', 'Spectre Heavy Gunner', [laspistol, missileFrag, missileKrak, fists], { spBase: 'heavy', spHeavy: true }),
  O('spLoader', '魅影裝填手', 'Spectre Loader', [laspistol, fists], { spBase: 'loader', spLoader: true }),
  O('spSharp', '魅影神射手', 'Spectre Sharpshooter', [llC, llM, llS, gunButt], { spBase: 'sharp' }),
  O('spStub', '魅影機槍手', 'Spectre Stub-gunner', [stubF, stubS, stubW, fists], { spBase: 'stub', spStubGunner: true }),
  O('spTrooperC', '魅影士兵（卡賓槍）', 'Spectre Trooper (lascarbine)', [lascarbine, gunButt], { spBase: 'trooper', spTrooper: true }),
  O('spTrooperR', '魅影士兵（步槍）', 'Spectre Trooper (lasrifle)', [lasrifle, gunButt], { spBase: 'trooper', spTrooper: true }),
  O('spVoxC', '魅影通訊兵（卡賓槍）', 'Spectre Vox-operator (lascarbine)', [lascarbine, gunButt], { spBase: 'vox', spVox: true, support: 'spSignal' }),
  O('spVoxR', '魅影通訊兵（步槍）', 'Spectre Vox-operator (lasrifle)', [lasrifle, gunButt], { spBase: 'vox', spVox: true, support: 'spSignal' }),
];
// Nine picks: each kind once, except Troopers. Defaults: one of everything but the Vox-operator.
const SLOTS = ['spMedicC', 'spGrenC', 'spGuideC', 'spGunnerP', 'spHeavy', 'spLoader', 'spSharp', 'spStub', 'spTrooperC'];
for (const o of ops) if (SLOTS.includes(o.id)) o.count = 1;
const PICKS = ops.filter((o) => !['spSergeant', 'spBeacon'].includes(o.id)).map((o) => o.id);

export const SPECTRES_TEAM = {
  id: 'spectres', name: B('魅影小隊', 'Spectre Squad'), color: '#6b7d5a', keywords: ['IMPERIUM', 'ASTRA MILITARUM', 'SPECTRE SQUAD'],
  rulesUrl: 'https://assets.warhammer-community.com/eng_spectre_squad_online_rules-bmoqs5lbyu-7d9zjtfxni.pdf',
  style: B('射擊隊・伏擊・反應', 'Shooting · Ambush · Reactive'),
  blurb: B('老練的偵察兵與伏擊手：藏在偽裝斗篷下，敵人每做一個動作，就有機會被你的魅影搶先開火。', 'Veteran scouts and ambushers in camo cloaks: every time the enemy acts, a Spectre may get the first shot in.'),
  info: {
    archetypes: [B('偵察', 'Recon'), B('滲透', 'Infiltration')],
    kind: B('射擊隊', 'Shooting'),
    oneBox: B('能', 'Yes'),
    buyable: B('能', 'Yes'),
    size: B('11 名特工', '11 operatives'),
    note: B('士官＋通訊信標＋9 名：除了士兵外每種只能選一次（每種的兩個武器版本算同一種）。', 'Sergeant + Beacon + 9: each kind once except Troopers (a kind\'s two weapon versions count as the same one).'),
  },
  rule: {
    name: B('菁英野戰技巧・偽裝斗篷', 'Elite Fieldcraft · Camo Cloaks'),
    desc: B('策略階段準備步驟獲得 1 點野戰點（通訊兵在場上且沒交戰則 2 點），回合結束全部作廢。敵人（Engage 指令）每完成一個動作，你可以花 1 點打斷：一名準備中、沒被其他敵人交戰的魅影免費射擊（只能打那個敵人，可改 Engage）、衝刺或重新定位（不能更靠近那個敵人或敵方降落區）。同一次啟動只能打斷一次，每名特工每回合最多一個免費動作。偽裝斗篷：被射擊時，掩護豁免多保留一個，或把一個掩護豁免當成暴擊。',
      'In the Ready step you gain 1 Fieldcraft point (2 with a Vox-operator in the killzone and not engaged); they are discarded at the end of the turning point. After an enemy with an Engage order performs an action you can spend 1 to interrupt: a ready Spectre not engaged with any other enemy makes a free Shoot (only at that enemy, can change to Engage), Dash or Reposition (not closer to it or the enemy drop zone). Once per enemy activation, one free action per operative per turning point. Camo Cloaks: when shot, retain one more cover save, or one cover save as a critical.'),
  },
  replacements: Object.fromEntries(SLOTS.map((id) => [id, PICKS])),
  ops,
  ploys: [
    P('spAmbush', '伏擊齊射', 'Ambushing Volley', '友方魅影啟動時，若離敵人超過 3" 且（決定指令前）不是敵人的有效目標：本次啟動遠程武器（壓制機槍除外）獲得「毀滅 1」（已有則 +1）。', 'When a friendly SPECTRE SQUAD operative activates more than 3" from enemies and isn\'t a valid target before choosing its order: its ranged weapons (not the suppressive autostubber) have Devastating 1 (+1 if they already have it).'),
    P('spPatience', '耐心', 'Patience', '本回合二選一：你的回合輪到友方啟動時可以跳過一次（對手第一次啟動後才能用）；或最後一名啟動的友方魅影射擊／近戰時武器獲得「毫不留情」。', 'This TP, one of: once, skip a friendly activation (after your opponent\'s first activation); or the last friendly SPECTRE SQUAD operative to activate has Relentless when it shoots or fights.'),
    P('spDisappear', '消失', 'Disappear', '一名友方魅影免費重新定位：不能更靠近敵人或敵方降落區（除非完全落在己方降落區），本回合不能再重新定位。', 'One friendly SPECTRE SQUAD operative makes a free Reposition: not closer to enemies or their drop zone (unless wholly in your drop zone), and no second Reposition this TP.'),
    P('spHidden', '隱蔽交戰', 'Hidden Engagement', '友方魅影射擊時，若從目標的角度看它在掩護中：武器獲得「平衡」。', 'A friendly SPECTRE SQUAD operative shooting while in cover from the target\'s perspective has Balanced.'),
  ],
  firefight: [
    { id: 'spFieldcraft', cp: 0, name: B('菁英野戰技巧（自動打斷）', 'Elite Fieldcraft (automatic interrupt)'), desc: B('開啟時，敵人行動後自動用野戰點打斷（免費射擊）。關掉就不會自動使用。', 'When on, Elite Fieldcraft interrupts automatically (a free shot). Switch it off to stop it.') },
    P('spReact', '敏銳反應', 'Sharp Reactions', '擁有隱蔽指令的敵人在 8" 內的友方魅影旁完成動作後（自動）：可以用野戰技巧打斷，不論它的指令。', 'After an enemy with a Conceal order acts within 8" of a friendly SPECTRE SQUAD operative (automatic): Elite Fieldcraft can interrupt it whatever its order.'),
    P('spPrepared', '預備防禦', 'Prepared Defence', '準備中或隱蔽指令的友方魅影反擊時（自動）：格擋一次可以擋兩個成功，且你可以先結算一個成功去格擋。打斷中的啟動不能用。', 'A ready or Concealed friendly SPECTRE SQUAD operative retaliating (automatic): its block can stop two successes. Not during an activation you interrupted with.'),
    P('spDodge', '閃躲', 'Dodge', '友方魅影啟動中、行動前後使用：本次啟動撤退少 1AP。', 'During a friendly SPECTRE SQUAD operative\'s activation: Fall Back for 1 less AP.'),
    P('spSilent', '無聲殺手', 'Silent Killers', '友方魅影啟動中、行動前後，若它有隱蔽指令且不是有效目標：本次啟動隱蔽指令下也能衝鋒，第一次擊打額外 +3 傷害，但那次近戰不能結算其他成功。', 'A Concealed friendly SPECTRE SQUAD operative that isn\'t a valid target: it can Charge with the Conceal order this activation and its first strike deals 3 more damage, but it can\'t resolve any other success that sequence.'),
  ],
};

/** Nine picks: each kind once, except Troopers. */
export function spectresRosterError(t, roster = {}) {
  const ids = SLOTS.map((slot) => roster[slot] || slot);
  const base = (id) => t.ops.find((o) => o.id === id).spBase;
  const bases = ids.map(base);
  const dup = [...new Set(bases.filter((b, i) => b !== 'trooper' && bases.indexOf(b) !== i))];
  if (!dup.length) return null;
  const nm = { medic: ['戰地醫護兵', 'Field Medicae'], grenadier: ['擲彈兵', 'Grenadier'], guide: ['嚮導', 'Guide'], gunner: ['槍手', 'Gunner'], heavy: ['重武器手', 'Heavy Gunner'], loader: ['裝填手', 'Loader'], sharp: ['神射手', 'Sharpshooter'], stub: ['機槍手', 'Stub-gunner'], vox: ['通訊兵', 'Vox-operator'] };
  return B(`重複選了：${dup.map((b) => nm[b][0]).join('、')}（除了士兵，每種只能選一次）`, `Picked more than once: ${dup.map((b) => nm[b][1]).join(', ')} (each only once, except Troopers)`);
}

export const SPECTRES_EQUIPMENT = {
  spStarshell: { name: B('照明彈', 'Starshell Flare'), desc: B('策略謀略：一名友方魅影免費做一次「震撼手雷」動作（不計入裝備次數）。若這次改變了敵人的 APL，整場不能再用。（策略階段按鈕）', 'Strategic gambit: one friendly SPECTRE SQUAD operative makes a free Stun Grenade action. If an enemy\'s APL changed because of it, it can\'t be used for the rest of the battle. (a Strategy phase button)') },
  spCamo: { name: B('先進偽裝', 'Advanced Camouflage'), desc: B('友方魅影可以執行「先進偽裝」（1AP）：到它下次啟動前，若有隱蔽指令且在掩護中，除了 2" 內不能被選為有效目標。在 3" 內可見的敵人旁不能用。', 'Friendly SPECTRE SQUAD operatives can perform Advanced Camouflage (1AP): until the start of its next activation, with a Conceal order and in cover it can\'t be a valid target except within 2". Not while visible to and within 3" of an enemy.') },
  spSniper: { name: B('狙擊警戒', 'Sniper Overwatch'), desc: B('每回合一次，一名友方魅影可以使用遠程武器「狙擊警戒」（4/3+/3-3，毀滅 2、重型（僅衝刺）、飽和、無聲）。', 'Once per TP a friendly SPECTRE SQUAD operative can use the ranged weapon Sniper overwatch (4 / 3+ / 3/3, Devastating 2, Heavy (Dash only), Saturate, Silent).') },
  spTvid: { name: B('視訊三角定位', 'Tvid-feed Triangulation'), desc: B('每回合一次（自動），友方魅影射擊選目標時：若目標也是另一名友方魅影的有效目標、或在友方信標 6" 內，目標不能被遮蔽。', 'Once per TP (automatic), when a friendly SPECTRE SQUAD operative shoots: the target can\'t be obscured if it is also a valid target for another friendly SPECTRE SQUAD operative or within 6" of a friendly Vox-relay Beacon.') },
};
/** Equipment that Prepared Killzone (the Guide) can add as an extra option: an Ammo Cache or equipment terrain. */
export const SP_EXTRA_EQUIPMENT = ['ammo', 'lightBarricades', 'heavyBarricade', 'razorWire', 'portableBarricade'];
