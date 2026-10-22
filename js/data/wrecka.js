// Wrecka Krew (破壞專隊): Ork Breaka Boyz, Tankbustas and Bomb Squigs.
// Source: https://assets.warhammer-community.com/eng_17-06_kill_team_team_rules_wrecka_krew_online_rules-1o31d0dshf-1p2z1ugswl.pdf (June '26)
const B = (zh, en) => ({ zh, en });
const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) => ({ id, name: B(zh, en), type, atk, hit, dmg: [dn, dc], rules, group });
const P = (id, zh, en, z, e) => ({ id, cp: 1, name: B(zh, en), desc: B(z, e) });

const rokkitPistol = W('wkRokkitPistol', '火箭手槍', 'Rokkit pistol', 'ranged', 6, 5, 4, 5, { range: 8, blast: 1 });
const twinFocused = W('wkTwinFocused', '雙火箭手槍（集中）', 'Two rokkit pistols (focused)', 'ranged', 6, 4, 4, 5, { range: 8, blast: 1, ceaseless: true }, 'wkTwin');
const twinSalvo = W('wkTwinSalvo', '雙火箭手槍（齊射）', 'Two rokkit pistols (salvo)', 'ranged', 6, 5, 4, 5, { range: 8, blast: 1, salvo: true }, 'wkTwin');
const choppa = W('wkChoppa', '砍刀', 'Choppa', 'melee', 4, 3, 4, 5);
const smashHammer = W('wkSmashHammer', '粉碎錘', 'Smash hammer', 'melee', 4, 3, 5, 6, { brutal: true });
const explosives = W('wkExplosives', '炸藥', 'Explosives', 'ranged', 6, 4, 4, 5, { blast: 1, limited: 1, wkExplosive: true });
const bite = W('wkBite', '啃咬', 'Bite', 'melee', 3, 4, 4, 5);
const tankBash = W('wkTankBash', '坦克錘（重擊）', 'Tankhammer (bash)', 'melee', 4, 3, 4, 5, {}, 'wkTank');
// (Detonate: D6+6 / 2D6+6 — the 9/13 shown are the averages, used to rank weapons.)
const tankDetonate = W('wkTankDetonate', '坦克錘（引爆）', 'Tankhammer (detonate)', 'melee', 4, 3, 9, 13, { lethal: 5, limited: 1, wkDetonate: true }, 'wkTank');
const knucklebustas = W('wkKnuckle', '碎指拳套', 'Knucklebustas', 'melee', 4, 3, 5, 6, { brutal: true, shock: true, wkSmash: true });
const eavyRokkit = W('wkEavyRokkit', '重型火箭發射器', '’Eavy rokkit launcha', 'ranged', 6, 4, 4, 5, { blast: 1, heavy: 'dash' }, 'wkRokkit');
const rokkitLauncha = W('wkRokkitLauncha', '火箭發射器', 'Rokkit launcha', 'ranged', 6, 5, 4, 5, { blast: 1 }, 'wkRokkit');
const fists = W('wkFists', '徒手', 'Fists', 'melee', 3, 3, 3, 4);
const pulsa = W('wkPulsa', '脈衝火箭', 'Pulsa rokkit', 'ranged', 6, 5, 0, 0, { heavy: 'reposition', limited: 1, wkPulsa: true });
const rokkitRack = W('wkRokkitRack', '火箭架', 'Rokkit rack', 'ranged', 6, 5, 4, 5, { blast: 2, heavy: 'reposition', limited: 1, relentless: true });

const nobLoadouts = { hammer: [rokkitPistol, smashHammer], twin: [twinFocused, twinSalvo, choppa] };
const gunnerLoadouts = { eavy: [eavyRokkit, fists], rokkit: [rokkitLauncha, fists] };
const rokkiteerLoadouts = { pulsa: [rokkitLauncha, pulsa, fists], rack: [rokkitLauncha, rokkitRack, fists] };

const O = (id, zh, en, weapons, extra = {}) => ({ id, name: B(zh, en), count: 1, apl: 2, move: 6, save: 4, wounds: 12, base: 32, weapons, ...extra });
const PICKS = ['wkDemolisha', 'wkFighter', 'wkKrusha', 'wkGunner', 'wkRokkiteer'];
const ops = [
  O('wkNob', '破壞頭目', 'Wrecka Boss Nob', nobLoadouts.hammer, { wounds: 14, base: 40, loadouts: nobLoadouts, wreckaBoss: true }),
  O('wkSquig', '炸彈史奎格', 'Wrecka Bomb Squig', [explosives, bite], {
    count: 2, save: 5, wounds: 5, base: 25, expendable: true, stoopid: true, boom: true, wkSquig: true,
    actionsOnly: ['charge', 'dash', 'fight', 'reposition', 'shoot'],
  }),
  O('wkDemolisha', '破壞小子・爆破手', 'Breaka Boy Demolisha', [tankBash, tankDetonate], { wkReckless: true }),
  O('wkFighter', '破壞小子・戰士', 'Breaka Boy Fighter', [smashHammer], { wkBreakStuff: true }),
  O('wkKrusha', '破壞小子・粉碎者', 'Breaka Boy Krusha', [knucklebustas], { wkArmouredUp: true }),
  O('wkGunner', '坦克殺手・槍手', 'Tankbusta Gunner', gunnerLoadouts.eavy, { loadouts: gunnerLoadouts, wkKompetitive: true }),
  O('wkRokkiteer', '坦克殺手・火箭手', 'Tankbusta Rokkiteer', rokkiteerLoadouts.pulsa, { loadouts: rokkiteerLoadouts }),
];

export const WRECKA_TEAM = {
  id: 'wreckaKrew', name: B('破壞專隊', 'Wrecka Krew'), color: '#d9661f', keywords: ['ORK', 'WRECKA KREW'],
  rulesUrl: 'https://assets.warhammer-community.com/eng_17-06_kill_team_team_rules_wrecka_krew_online_rules-1o31d0dshf-1p2z1ugswl.pdf',
  style: B('混合隊・爆炸・破壞點數', 'Mixed · Explosions · Wrecka points'),
  blurb: B('一名破壞頭目帶著破壞小子、坦克殺手和兩隻炸彈史奎格。擲出 6 就累積破壞點數，再把失敗骰變成功；交戰指令下第一次衝鋒、射擊或近戰 APL +1。', 'A Boss Nob with Breaka Boyz, Tankbustas and two Bomb Squigs. Rolling 6s builds Wrecka points that turn fails into hits; the first Charge, Shoot or Fight on an Engage order adds 1 APL.'),
  info: {
    archetypes: [B('安全保護', 'Security'), B('搜索與摧毀', 'Seek & Destroy')],
    kind: B('混合隊', 'Mixed'),
    oneBox: B('能', 'Yes'),
    buyable: B('能', 'Yes'),
    size: B('6 名特工＋2 隻寵物', '6 operatives + 2 pets'),
    note: B('頭目＋2 隻炸彈史奎格＋5 名特工（除了戰士、槍手外不能重複）。破壞點數由系統自動使用：每次擲攻擊骰時有失敗就花（最多 2 點）。2D 簡化：脈衝火箭的標記直接放在目標敵人身上；搗毀的破口讓 1" 以內厚度不超過 1" 的地形部分可直接穿過（不扣攀爬）。', 'Boss Nob + 2 Bomb Squigs + 5 operatives (only Fighters and Gunners can repeat). Wrecka points are spent automatically: whenever attack dice fail (up to 2). 2D simplifications: the Pulsa marker is placed on the target enemy; a Breach marker lets operatives within 1" move through parts of that terrain no more than 1" thick (no climbing).'),
  },
  rule: {
    name: B('破壞狂暴・猛灌加油', 'Wrecka Rampage · Tanked Up'),
    desc: B('破壞狂暴：友方射擊、近戰或反擊時，每保留一顆 6 得 1 破壞點數（最多 6 點；行動開始時已有 6 點則只能花）；每次可花最多 2 點，各把一顆失敗改成普通成功（炸彈史奎格不能花）。猛灌加油：交戰指令的友方（炸彈史奎格除外）每次啟動／反應第一次衝鋒、射擊或近戰時，APL +1 直到它下次啟動。',
      'Wrecka Rampage: shooting, fighting or retaliating, each retained 6 gains a Wrecka point (max 6; starting the action at 6 you can only spend); spend up to 2 to retain fails as normal successes (not Bomb Squigs). Tanked Up: the first Charge, Shoot or Fight of an Engage-order friendly (not Bomb Squigs) in each activation/counteraction adds 1 to its APL until its next activation.'),
  },
  // Five from the list: each once, except Fighters and Gunners.
  replacements: Object.fromEntries(PICKS.map((id) => [id, [id, ...PICKS.filter((x) => x !== id)]])),
  ops,
  ploys: [
    P('waaagh', '哇啊啊！', 'Waaagh!', '本回合友方近戰武器獲得「平衡」。', 'This TP, friendly melee weapons have Balanced.'),
    P('wkTuffGitz', '硬漢', 'Tuff Gitz', '本回合交戰指令的友方被射擊時，可重擲一顆防禦骰。', 'This TP, a friendly with an Engage order being shot re-rolls one defence die.'),
    P('wkDestruction', '大破壞', 'Destruction', '本回合友方遠程武器獲得「飽和」。', 'This TP, friendly ranged weapons have Saturate.'),
    P('wkAmpedUp', '亢奮', 'Amped Up', '立刻：每名交戰指令的友方各回復 D3+1 生命。', 'At once: each friendly with an Engage order regains D3+1 lost wounds.'),
  ],
  firefight: [
    P('wkProppaScrap', '像樣的幹架', 'Proppa Scrap', '破壞小子或頭目啟動中：這次啟動可以近戰兩次。', 'During a Breaka Boy or the Boss Nob\'s activation: it can Fight twice this activation.'),
    P('wkKaboom', '轟隆！', 'Kaboom!', '射擊選擇有「爆破」的武器時：這次動作爆破範圍 +1"，射擊主要目標時有「嚴重」（嚴重產生的暴擊不算 6，不給破壞點數）。不能和鑽地火箭同時用。', 'Shooting with a Blast weapon: Blast +1" for the action and Severe against the primary target (that crit isn\'t a 6, so no Wrecka point). Not with Drill Rokkits.'),
    P('wkJustScratch', '只是擦傷', 'Just a Scratch', '自動：一顆攻擊骰對友方（炸彈史奎格除外）造成普通傷害時，忽略那次傷害。', 'Auto: when an attack die inflicts Normal Dmg on a friendly (not a Bomb Squig), ignore it.'),
    P('wkDemolition', '拆除工作', 'Demolition Job', '自動：友方射擊或近戰後，在目標身上放拆除標記；之後友方（炸彈史奎格除外）攻擊或反擊標記 3" 內的敵人時，可以免費花 1 破壞點數（沒有點數也行）。下個準備步驟移除。', 'Auto: after a friendly Shoots or Fights, place a Demolition marker on the target; friendlies (not Bomb Squigs) attacking or retaliating against an operative within 3" of it can spend a Wrecka point for free (even with none). Removed in the next Ready step.'),
  ],
};

/** Roster limits: the Boss Nob, two Bomb Squigs and five others — each once, except Fighters and Gunners. */
export function wreckaRosterError(t, roster = {}) {
  const ids = PICKS.map((slot) => roster[slot] || slot);
  const dup = [...new Set(ids.filter((id, i) => !['wkFighter', 'wkGunner'].includes(id) && ids.indexOf(id) !== i))];
  if (!dup.length) return null;
  const nm = (lang) => dup.map((id) => t.ops.find((o) => o.id === id).name[lang]).join(lang === 'zh' ? '、' : ', ');
  return B(`重複選了：${nm('zh')}（只有破壞小子・戰士、坦克殺手・槍手能重複）`, `Picked more than once: ${nm('en')} (only Fighters and Gunners can repeat)`);
}

export const WRECKA_EQUIPMENT = {
  wkDrill: { name: B('鑽地火箭', 'Drill Rokkits'), desc: B('每回合一次（自動）：用火箭發射器或重型火箭發射器射擊、而目標旁沒有其他特工會被波及時，這次失去「爆破」改得「穿甲 1」。', 'Once per TP (automatic): shooting a rokkit launcha or ’eavy rokkit launcha when no other operative would be caught in the blast, it loses Blast and gains Piercing 1 for that action.') },
  wkArmour: { name: B('加厚裝甲', 'Extra Armour'), desc: B('友方（炸彈史奎格除外）Move -1"、豁免值改善 1。', 'Friendlies (not Bomb Squigs): -1" Move, Save improved by 1.') },
  wkOil: { name: B('機油', 'Engine Oil'), desc: B('每回合一次（自動）：重傷的友方（炸彈史奎格除外）啟動時，這次啟動不受重傷造成的數值變化影響（武器也是）。', 'Once per TP (automatic): when an injured friendly (not a Bomb Squig) activates, it ignores stat changes from being injured (weapons too) for that activation.') },
  wkGlyphsW: { name: B('圖騰（哇啊啊！）', 'Glyphs (Waaagh!)'), desc: B('「哇啊啊！」第一次使用 0CP；之後只要有破壞點數也是 0CP。（和另一個圖騰只能選一個）', 'Waaagh! costs 0CP the first time; after that, 0CP while you have any Wrecka points. (Pick only one Glyphs.)') },
  wkGlyphsD: { name: B('圖騰（大破壞）', 'Glyphs (Destruction)'), desc: B('「大破壞」第一次使用 0CP；之後只要有破壞點數也是 0CP。（和另一個圖騰只能選一個）', 'Destruction costs 0CP the first time; after that, 0CP while you have any Wrecka points. (Pick only one Glyphs.)') },
};
