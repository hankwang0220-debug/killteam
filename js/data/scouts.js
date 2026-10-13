// Scout Squad (偵察小隊): Space Marine Scouts.
// Source: https://assets.warhammer-community.com/eng_29-04_kt_teamrules_scout_squad-gsh9kmjzgi-cx2xtxmp8b.pdf (errata April '26)
// Every choice of weapons is its own operative template (e.g. scWarriorShotgun), so one dropdown per slot picks the
// operative AND its weapons; the Sergeant's three weapon options are loadouts.
const B = (zh, en) => ({ zh, en });
const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) => ({ id, name: B(zh, en), type, atk, hit, dmg: [dn, dc], rules, group });
const P = (id, zh, en, z, e) => ({ id, cp: 1, name: B(zh, en), desc: B(z, e) });

const boltPistol = W('scBoltPistol', '爆彈手槍', 'Bolt pistol', 'ranged', 4, 3, 3, 4, { range: 8 });
const shotgun = W('scShotgun', '阿斯塔特霰彈槍', 'Astartes shotgun', 'ranged', 4, 2, 4, 4, { range: 6, astartesOk: true });
const boltgun = W('scBoltgun', '爆彈槍', 'Boltgun', 'ranged', 4, 3, 3, 4);
const chainsword = W('scChainsword', '鏈鋸劍', 'Chainsword', 'melee', 5, 3, 4, 5);
const fistsS = W('scFistsS', '徒手', 'Fists', 'melee', 4, 3, 3, 4);
const fists = W('scFists', '徒手', 'Fists', 'melee', 3, 3, 3, 4);
const blade = W('scBlade', '戰鬥刀', 'Combat blade', 'melee', 4, 3, 4, 5, {}, 'scBlade');
const hbFocused = W('scHbFocused', '重型爆彈槍（集中）', 'Heavy bolter (focused)', 'ranged', 5, 3, 4, 5, { heavy: 'dash', piercingCrits: 1, notBolt: true }, 'scHeavyBolter');
const hbSweeping = W('scHbSweeping', '重型爆彈槍（掃射）', 'Heavy bolter (sweeping)', 'ranged', 4, 3, 4, 5, { heavy: 'dash', piercingCrits: 1, torrent: 1, notBolt: true }, 'scHeavyBolter');
const mlFrag = W('scMlFrag', '飛彈發射器（破片）', 'Missile launcher (frag)', 'ranged', 4, 3, 3, 5, { blast: 2, heavy: 'dash' }, 'scMissile');
const mlKrak = W('scMlKrak', '飛彈發射器（穿甲）', 'Missile launcher (krak)', 'ranged', 4, 3, 5, 7, { heavy: 'dash', piercing: 1 }, 'scMissile');
const sniperMobile = W('scSniperMobile', '狙擊步槍（機動）', 'Sniper rifle (mobile)', 'ranged', 4, 3, 3, 4, {}, 'scSniperRifle');
const sniperStationary = W('scSniperStationary', '狙擊步槍（定點）', 'Sniper rifle (stationary)', 'ranged', 4, 2, 3, 3, { devastating: 3, heavy: 'dash', silent: true }, 'scSniperRifle');

const sergeantLoadouts = { shotgun: [shotgun, fistsS], bolt: [boltgun, fistsS], chain: [boltPistol, chainsword] };

// Only the Sergeant has Astartes (the other operatives are marked notAstartes although the team is ADEPTUS ASTARTES).
const O = (id, zh, en, weapons, extra = {}) => ({ id, name: B(zh, en), count: 0, apl: 2, move: 6, save: 4, wounds: 10, base: 28, weapons, notAstartes: true, ...extra });
const ops = [
  O('scSergeant', '偵察小隊士官', 'Scout Sergeant', sergeantLoadouts.shotgun, { count: 1, apl: 3, wounds: 11, notAstartes: false, loadouts: sergeantLoadouts, scSergeant: true }),
  O('scHGHB', '偵察小隊重武器手（重型爆彈槍）', 'Scout Heavy Gunner (heavy bolter)', [boltPistol, hbFocused, hbSweeping, fists], { count: 1, bipod: true, bipodFree: true }),
  O('scHGML', '偵察小隊重武器手（飛彈發射器）', 'Scout Heavy Gunner (missile launcher)', [boltPistol, mlFrag, mlKrak, fists], { count: 1, bipod: true, bipodFree: true }),
  O('scHunter', '偵察小隊獵手', 'Scout Hunter', [boltPistol, blade], { count: 1, scGrapnel: true }),
  O('scSniper', '偵察小隊狙擊手', 'Scout Sniper', [boltPistol, sniperMobile, sniperStationary, fists], { count: 1, camoCloak: true, optics: true, scSniper: true }),
  O('scTracker', '偵察小隊追蹤者', 'Scout Tracker', [boltgun, fists], { count: 1, auspex: true, scTracker: true }),
  O('scWarriorShotgun', '偵察小隊戰士（霰彈槍）', 'Scout Warrior (Astartes shotgun, fists)', [shotgun, fists], { count: 1, adaptive: true, scWarrior: true }),
  O('scWarriorBolt', '偵察小隊戰士（爆彈槍）', 'Scout Warrior (boltgun, fists)', [boltgun, fists], { count: 1, adaptive: true, scWarrior: true }),
  O('scWarriorBlade', '偵察小隊戰士（手槍、戰鬥刀）', 'Scout Warrior (bolt pistol, combat blade)', [boltPistol, blade], { count: 1, adaptive: true, scWarrior: true }),
];
const SLOTS = ['scHGHB', 'scHGML', 'scHunter', 'scSniper', 'scTracker', 'scWarriorShotgun', 'scWarriorBolt', 'scWarriorBlade'];

export const SCOUTS_TEAM = {
  id: 'scoutSquad', name: B('偵察小隊', 'Scout Squad'), color: '#9db0c6', astartes: true, scoutAmbush: true, keywords: ['IMPERIUM', 'ADEPTUS ASTARTES', 'SCOUT SQUAD'],
  rulesUrl: 'https://assets.warhammer-community.com/eng_29-04_kt_teamrules_scout_squad-gsh9kmjzgi-cx2xtxmp8b.pdf',
  style: B('混合隊・前進偵察・陷阱', 'Mixed · Forward Scouting · Traps'),
  blurb: B('一名士官帶著八名見習戰士。開戰前先佈署陷阱、警報和誘餌，再用伏擊、追蹤與狙擊打亂敵人。', 'A Sergeant and eight Neophytes. Before the battle they lay traps, alarms and diversions, then ambush, track and snipe the enemy.'),
  info: {
    archetypes: [B('偵察', 'Recon'), B('滲透', 'Infiltration')],
    kind: B('混合隊', 'Mixed'),
    oneBox: B('能', 'Yes'),
    buyable: B('能', 'Yes'),
    size: B('9 名特工', '9 operatives'),
    note: B('士官＋從清單選 8 名（除了戰士，每種只能選一次）。每個名額的下拉選單同時選特工與武器；士官的武器另外選。前進偵察選項在開局另外選（最多六個），佈署完成後自動執行；陷阱與警報的位置、重新佈署和重新定位的特工由系統挑選。2D 簡化：沒有高低差與「可通行地形」。', 'The Sergeant plus eight from the list (each once, except Warriors). Each slot\'s dropdown picks the operative and its weapons together; the Sergeant\'s weapons are picked separately. Forward Scouting options (up to six) are chosen in setup and resolved automatically once deployment ends: the game picks where markers go and which operatives are redeployed or repositioned. 2D simplifications: no heights and no Accessible terrain.', ),
  },
  rule: {
    name: B('前進偵察', 'Forward Scouting'),
    desc: B('佈署完成後，從下列選項選最多六個並執行（括號是整場最多選幾次）：重新佈署（1）、重新定位（2）、警報（2）、陷阱（1）、戰術機動（1）、誘餌（1）、擬定計畫（1）、指定目標（1）、刺探（1，僅 Approved Ops）。士官的「引導與經驗」每次啟動可讓另一名友方偵察小隊特工下次啟動 APL +1。',
      'At the end of the Set Up Operatives step, select and resolve up to six options (the number is how many times each can be taken in the battle): Redeploy (1), Reposition (2), Trip Alarm (2), Booby Trap (1), Tactical Manoeuvre (1), Diversion (1), Devise Plan (1), Designate Target (1), Spy (1, Approved Ops only). The Sergeant\'s Guidance and Experience adds 1 APL to another friendly Scout Squad operative for its next activation, once per activation.'),
  },
  replacements: Object.fromEntries(SLOTS.map((id) => [id, SLOTS])),
  ops,
  ploys: [
    P('scGuerrilla', '游擊交戰', 'Guerrilla Engagement', '敵人射擊友方偵察小隊特工時，若它在掩護中、且離看得到它的敵人都超過 6"：可以重擲一顆防禦骰。', 'When an enemy shoots a friendly Scout Squad operative in cover that is more than 6" from the enemy operatives it\'s visible to: re-roll one defence die.'),
    P('scAmbush', '伏擊', 'Ambush', '友方偵察小隊特工啟動中射擊或近戰時，若它的指令在啟動開始時從隱蔽改成交戰、或啟動開始時沒被敵人看見：武器「平衡」；目標已行動則改為「無休」。', 'A friendly Scout Squad operative shooting or fighting in its activation, if its order changed from Conceal to Engage at the start or it wasn\'t visible to enemies at the start: Balanced; Ceaseless instead if the target is expended.'),
    P('scAdaptable', '適應訓練', 'Adaptable Training', '立刻：最多 D3 名離敵人超過 4" 的友方偵察小隊特工改變指令。（自動選擇）', 'At once: change the order of up to D3 friendly Scout Squad operatives more than 4" from enemies. (Chosen automatically.)'),
    P('scStealth', '隱蔽轉移', 'Stealth Relocation', '立刻：最多 D3 名隱蔽指令、離敵人超過 4" 的友方偵察小隊特工免費衝刺一次。第 1 回合不能用。（自動選擇）', 'At once: up to D3 friendly Scout Squad operatives with a Conceal order more than 4" from enemies make a free Dash. Not in the first turning point. (Chosen automatically.)'),
  ],
  firefight: [
    P('scTraining', '阿斯塔特訓練', 'Astartes Training', '友方偵察小隊特工啟動中，直到啟動結束，擇一：近戰兩次；射擊兩次（至少一次用霰彈槍、爆彈手槍或爆彈槍）；用重型爆彈槍、飛彈發射器或狙擊步槍射擊兩次（第二次多花 1AP）。', 'During a friendly Scout Squad operative\'s activation, for the rest of it, one of: Fight twice; Shoot twice (an Astartes shotgun, bolt pistol or boltgun for at least one); Shoot twice with a heavy bolter, missile launcher or sniper rifle (1 more AP for the second).'),
    P('scRaw', '原生體魄', 'Raw Physiology', '友方偵察小隊特工啟動中（行動前後都可以）：直到下次啟動，Move +1"，並且不受重傷造成的數值變化影響（含武器）。', 'During a friendly Scout Squad operative\'s activation, before or after an action: until its next activation, +1" Move and ignore stat changes from being injured (weapons too).'),
    P('scEmboldened', '激勵的見習戰士', 'Emboldened Aspirant', '友方偵察小隊特工射擊或近戰時，重擲之後：若它是本回合第一個射擊或近戰的友方、或敵人的 Wounds 比它高，一個普通成功改為暴擊。', 'A friendly Scout Squad operative shooting or fighting, after re-rolls: if it is the first friendly operative to do either this TP, or the enemy has a higher Wounds stat, retain one normal success as a critical success.'),
    P('scCovert', '隱蔽陣地', 'Covert Position', '友方偵察小隊特工啟動中：直到下次啟動，隱蔽指令且在掩護中時，2" 外不能被選為有效目標（優先於其他規則）。', 'During a friendly Scout Squad operative\'s activation: until its next activation, with a Conceal order and in cover it can\'t be a valid target from more than 2" away (taking precedence over other rules).'),
  ],
};

/** Roster limits: the Sergeant plus eight others — each once, except Warriors (all three weapon options are Warriors). */
export function scoutsRosterError(t, roster = {}) {
  const ids = SLOTS.map((slot) => roster[slot] || slot);
  const dup = [...new Set(ids.filter((id, i) => !t.ops.find((o) => o.id === id).scWarrior && ids.indexOf(id) !== i))];
  if (!dup.length) return null;
  const nm = (lang) => dup.map((id) => t.ops.find((o) => o.id === id).name[lang]).join(lang === 'zh' ? '、' : ', ');
  return B(`重複選了：${nm('zh')}（除了戰士，每種特工只能選一次）`, `Picked more than once: ${nm('en')} (each operative only once, except Warriors)`);
}

/** Forward Scouting: up to six selections; the number is how often each option can be taken in a battle. */
export const FORWARD_SCOUTING = [
  { id: 'redeploy', max: 1, name: B('重新佈署', 'Redeploy'), desc: B('重新佈署三分之一（無條件進位）的特工。（系統自動重排）', 'Change the set up of one third of your operatives (rounded up). (Placed again automatically.)') },
  { id: 'reposition', max: 2, name: B('重新定位', 'Reposition'), desc: B('一名完全在降落區內的友方免費重新定位，必須結束在降落區 3" 內。（系統選擇）', 'A friendly wholly in your drop zone makes a free Reposition ending wholly within 3" of it. (Chosen automatically.)') },
  { id: 'tripAlarm', max: 2, name: B('警報', 'Trip Alarm'), desc: B('放一個警報標記（離對手降落區 6" 外）：第 1、2 回合友方射擊標記 2" 內的敵人時，遠程武器「搜尋」。第 3 回合準備步驟移除。', 'Place a Trip Alarm marker more than 6" from your opponent\'s drop zone: in TP1 and TP2 friendlies shooting an enemy within 2" of it have Seek. Removed in the Ready step of TP3.') },
  { id: 'boobyTrap', max: 1, name: B('陷阱', 'Booby Trap'), desc: B('放一個陷阱標記（離對手降落區 6" 外、離其他標記 2" 外）：第一次進入敵人控制範圍時移除，該敵人受 2D3 傷害，沒殘廢就結束它的動作。', 'Place a Booby Trap marker more than 6" from the opponent\'s drop zone and 2" from other markers: the first time it is within an enemy\'s control range it is removed and inflicts 2D3 damage; if the enemy isn\'t incapacitated its action ends.') },
  { id: 'tacticalManoeuvre', max: 1, name: B('戰術機動', 'Tactical Manoeuvre'), desc: B('整場兩次策略謀略：一名友方到它下次啟動結束 APL +1。', 'Twice per battle strategic gambit: a friendly gets +1 APL until the end of its next activation.') },
  { id: 'diversion', max: 1, name: B('誘餌', 'Diversion'), desc: B('整場一次策略謀略：戰場邊緣 6" 內一名敵人到它下次啟動結束 APL -1。', 'Once per battle strategic gambit: an enemy within 6" of a killzone edge gets -1 APL until the end of its next activation.') },
  { id: 'devisePlan', max: 1, name: B('擬定計畫', 'Devise Plan'), desc: B('獲得 1CP。', 'You gain 1CP.') },
  { id: 'designateTarget', max: 1, name: B('指定目標', 'Designate Target'), desc: B('一名敵人獲得你的目標標記：友方偵察小隊特工射擊、近戰或反擊它時，可重擲一顆攻擊骰。（系統選生命最多的）', 'An enemy gains your Target token: friendly Scout Squad operatives shooting, fighting or retaliating against it can re-roll one attack die. (Picks the one with the most Wounds.)') },
  { id: 'spy', max: 1, name: B('刺探', 'Spy'), desc: B('僅限 Approved Ops：對手必須公開戰術行動。', 'Approved Ops only: your opponent must reveal their Tac Op.') },
];
/** The computer's usual six. */
export const DEFAULT_SCOUTING = ['reposition', 'tripAlarm', 'boobyTrap', 'tacticalManoeuvre', 'devisePlan', 'designateTarget'];
/** A legal list: only known options, no more than each one's maximum, and at most six. */
export function cleanScouting(list = []) {
  const out = [];
  for (const id of list) {
    const o = FORWARD_SCOUTING.find((x) => x.id === id);
    if (o && out.filter((x) => x === id).length < o.max && out.length < 6) out.push(id);
  }
  return out;
}

export const SCOUTS_EQUIPMENT = {
  scCamo: { name: B('迷彩斗篷', 'Camo Cloak'), desc: B('敵人射擊友方偵察小隊特工（狙擊手除外）時，若能保留掩護豁免，可以多保留一個。', 'When an enemy shoots a friendly Scout Squad operative (not a Sniper) that can retain cover saves, it retains one more.') },
  scOculars: { name: B('瞄準目鏡', 'Targeting Oculars'), desc: B('每回合最多兩次（自動，每回合最先的兩次射擊）：友方偵察小隊特工射擊時，這次動作遠程武器獲得「致命 5+」與「飽和」。', 'Up to twice per TP (automatic, on the first two Shoots): a friendly Scout Squad operative\'s ranged weapons have Lethal 5+ and Saturate for that action.') },
  scBlades: { name: B('戰鬥刀', 'Combat Blades'), desc: B('友方偵察小隊特工多一把近戰武器「戰鬥刀」（Atk 3、3+、4/5）；已經有更好版本的用更好的。', 'Friendly Scout Squad operatives gain a Combat blade (Atk 3, 3+, 4/5); those that already have a better one use that.') },
  scVox: { name: B('戰術通訊連結', 'Tactical Vox-link'), desc: B('每回合一次：有友方士官在場時，「阿斯塔特訓練」或「激勵的見習戰士」費用 0CP。', 'Once per TP: with a friendly Sergeant in the killzone, Astartes Training or Emboldened Aspirant costs 0CP.') },
};
