const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) => ({ id, name: { zh, en }, type, atk, hit, dmg: [dn, dc], rules, group });
const O = (id, zh, en, weapons, extra = {}, base = 25) => ({ id, name: { zh, en }, count: 1, apl: 2, move: 7, save: 4, wounds: 8, base, weapons, ...extra });
const B = (zh, en) => ({ zh, en });
const P = (id, zh, en, zdesc, edesc) => ({ id, cp: 1, name: B(zh, en), desc: B(zdesc, edesc) });
const rifle = W('haSplinterRifle', '破片步槍', 'Splinter rifle', 'ranged', 4, 3, 2, 4, { lethal: 5 });
const pistol = W('haSplinterPistol', '破片手槍', 'Splinter pistol', 'ranged', 4, 3, 2, 4, { range: 8, lethal: 5 });
const blades = W('haBlades', '刀刃組合', 'Array of blades', 'melee', 3, 3, 3, 4);
const blast = W('haBlastPistol', '爆裂手槍', 'Blast pistol', 'ranged', 4, 3, 3, 4, { range: 8, piercing: 2 });
const venom = W('haVenomBlade', '毒刃', 'Venom blade', 'melee', 4, 3, 4, 5, { lethal: 4 });
const agoniser = W('haAgoniser', '痛苦鞭', 'Agoniser', 'melee', 4, 3, 3, 5, { brutal: true, lethal: 5, shock: true });
const power = W('haPower', '動力武器', 'Power weapon', 'melee', 4, 3, 4, 6, { lethal: 5 });
const blaster = W('haBlaster', '爆裂槍', 'Blaster', 'ranged', 4, 3, 4, 5, { piercing: 2 });
const shredder = W('haShredder', '撕裂槍', 'Shredder', 'ranged', 4, 3, 4, 5, { rending: true, torrent: 2 });
const lance = W('haDarkLance', '暗矛', 'Dark lance', 'ranged', 4, 3, 6, 7, { heavy: 'dash', piercing: 2 });
const cannonF = W('haCannonF', '破片砲（集中）', 'Splinter cannon (focused)', 'ranged', 5, 3, 3, 5, { heavy: 'dash', lethal: 5 }, 'haCannon');
const cannonS = W('haCannonS', '破片砲（掃射）', 'Splinter cannon (sweeping)', 'ranged', 4, 3, 3, 5, { heavy: 'dash', lethal: 5, torrent: 1 }, 'haCannon');
export const ELDAR_TEAMS = [{
  id: 'handOfArchon', name: B('執政官之手', 'Hand of the Archon'), color: '#653286',
  style: B('射擊隊・黑暗靈族・痛苦代幣', 'Ranged · Drukhari · Power from Pain'),
  blurb: B('以破片武器與殘酷近戰折磨敵人，累積痛苦代幣來強化行動、療傷與重擲。', 'Drukhari raiders turn their victims’ pain into extra actions, healing and re-rolls.'),
  rulesUrl: 'https://assets.warhammer-community.com/eng_28-01_kill_team_team_rules_hand_of_the_archon-ijq4ui6dxc-qnz6k5jaxl.pdf',
  info: {
    archetypes: [B('搜索與摧毀', 'Seek & Destroy'), B('偵察', 'Recon')], kind: B('射擊隊', 'Ranged'),
    oneBox: B('勉強；磁化武器可保留配置選擇', 'Barely; magnetise weapons to retain loadout choices'),
    buyable: B('KT 盒目前仍可購買，不會有大桌盒', 'Kill Team box available; no Warhammer 40,000 box'), size: B('9 名特工', '9 operatives'),
    note: B('2026 年退出賽季後，官方比賽不能使用；一般對戰或非官方比賽仍可使用。', 'Rotates out in 2026; afterwards unavailable in official events, but usable in casual and unofficial games.'),
  },
  tacticsLabel: B('戰鬥藥劑', 'Combat Drugs'), tacticSlots: 1, defaultTactics: ['adrenalight'],
  tactics: [
    { id: 'adrenalight', name: B('腎上腺之光', 'Adrenalight'), desc: B('每回合準備步驟自動給一名使用此藥劑的友方 1 痛苦代幣，優先選代幣最少者。', 'Each Ready step automatically gives one eligible friendly a Pain token, prioritising the fewest tokens.') },
    { id: 'painbringer', name: B('痛苦使者', 'Painbringer'), desc: B('每顆造成至少 3 傷害的攻擊骰：D6 擲 6，傷害 -1。', 'Each attack die dealing 3+ damage: on a D6 of 6, reduce damage by 1.') },
    { id: 'hypex', name: B('亢奮劑', 'Hypex'), desc: B('無視受傷造成的移動減值。', 'Ignore injured Move penalties.') },
  ],
  rule: { name: B('源於痛苦的力量・步槍', 'Power from Pain · Rifles'), desc: B('動作造成敵人新受傷或倒下後獲得痛苦代幣；倒下敵人原生命達 12 時獲得 2。每次啟動／反擊可花 1 代幣使用一次強化：APL +1、回復 D3+1 或擊殺後免費衝刺；另可花 1 代幣重擲同一點數的骰子一次。破片步槍在本次尚未轉移、衝鋒或撤退時精準 1。', 'After an action injures or incapacitates an enemy, gain Pain (two for a kill with 12+ Wounds). Spend one token on +1 APL, D3+1 healing or a free post-kill Dash, once per activation/counteraction; additionally re-roll dice of one result once. Splinter rifles gain Accurate 1 before Reposition, Charge or Fall Back.') },
  ploys: [
    P('bladeArtists', '刀刃藝術家', 'Blade Artists', '近戰武器獲得撕裂。', 'Melee weapons gain Rending.'),
    P('mercilessSadists', '無情虐待者', 'Merciless Sadists', '射擊或近戰攻擊受過傷害的敵人時，武器獲得平衡。', 'Balanced when shooting or fighting a wounded enemy.'),
    P('fromDarknessDeath', '死亡來自黑暗', 'From Darkness, Death', '啟動時選一名不能以你為有效目標的敵人；首次攻擊它時一顆普通成功升為暴擊。', 'At activation, pick an enemy that cannot target you; first attack against it promotes one normal success.'),
    P('denizensNight', '黑夜居民', 'Denizens of Night', '距離所有敵人超過 2 吋且射線有地形阻隔時，重擲一顆防禦骰。', 'Re-roll one defence die when terrain intervenes and all enemies are more than 2 inches away.'),
  ],
  firefight: [
    P('cruelDeception', '殘酷欺詐', 'Cruel Deception', '本次啟動撤退少 1AP。', 'Fall Back costs 1 less AP this activation.'),
    P('deviousScheme', '陰險詭計', 'Devious Scheme', '敵人使用非免費交戰計謀後，自動令其下次使用該計謀多付 1CP。', 'After an enemy uses a non-free firefight ploy, automatically tax its next use by 1CP.'),
    P('heinousArrogance', '惡劣傲慢', 'Heinous Arrogance', '輪到己方啟動特工時，跳過這次啟動機會。', 'Skip your opportunity to activate an operative.'),
    P('preyWounded', '獵殺傷者', 'Prey on the Wounded', '攻擊受過傷害的敵人，擲骰後自動重擲失敗攻擊骰。', 'After rolling against a wounded enemy, automatically re-roll failed attack dice.'),
  ],
  ops: [
    O('haLeader', '陰謀團大首領', 'Kabalite Archsybarite', [pistol, agoniser], { wounds: 9, torturousVision: true, cunning: true,
      loadouts: { splinterAgoniser: [pistol, agoniser], splinterPower: [pistol, power], splinterVenom: [pistol, venom], blastVenom: [blast, venom], rifle: [rifle, blades] } }),
    O('haAgent', '陰謀團特工', 'Kabalite Agent', [rifle, blades], { sadisticCompetition: true }),
    O('haCrimson', '猩紅決鬥者', 'Kabalite Crimson Duellist', [pistol, W('haRazorflail', '剃刀連枷', 'Razorflail', 'melee', 4, 2, 4, 5, { brutal: true, shield: true })], { twoFights: true, brutalDisplay: true }),
    O('haDisciple', '耶琳德拉門徒', 'Kabalite Disciple of Yaelindra', [W('haStinger', '毒刺手槍', 'Stinger pistol', 'ranged', 4, 3, 3, 5, { range: 8, lethal: 5, stinger: true }), blades], { tormentGrenade: true }),
    O('haElixicant', '藥劑師', 'Kabalite Elixicant', [rifle, W('haNeedler', '興奮針槍', 'Stim-needler', 'ranged', 4, 3, 0, 0, { range: 3, lethal: 3, stun: true }), blades], { administerDrug: true }),
    O('haFlayer', '剝皮者', 'Kabalite Flayer', [W('haSculptors', '痛苦雕塑刀', 'Pain sculptors', 'melee', 4, 3, 4, 5, { ceaseless: true, flay: true })], { insensiblePain: true }),
    O('haGunner', '陰謀團槍手', 'Kabalite Gunner', [blaster, blades], { loadouts: { blaster: [blaster, blades], shredder: [shredder, blades] } }),
    O('haHeavy', '陰謀團重槍手', 'Kabalite Heavy Gunner', [lance, blades], { loadouts: { darkLance: [lance, blades], cannon: [cannonF, cannonS, blades] } }),
    O('haAssassin', '天空碎片刺客', 'Kabalite Skysplinter Assassin', [W('haRazorwing', '剃刀翼', 'Razorwing', 'ranged', 4, 4, 1, 2, { saturate: true, seek: true, silent: true }), W('haShardcarbine', '碎片卡賓槍', 'Shardcarbine', 'ranged', 4, 2, 2, 2, { devastating: 2, lethal: 5 }), blades], { mercilessHunter: true, archonMark: true, omen: true }),
  ],
}];

const cpistol = W('cvPistol', '星鏢手槍', 'Shuriken pistol', 'ranged', 4, 3, 3, 4, { range: 8, rending: true });
const crifle = W('cvRifle', '星鏢步槍', 'Shuriken rifle', 'ranged', 4, 3, 3, 4, { rending: true });
const cpower = W('cvPower', '動力武器', 'Power weapon', 'melee', 4, 3, 4, 6, { lethal: 5 });
const cfists = W('cvFists', '徒手', 'Fists', 'melee', 3, 3, 2, 3);
const C = (id, zh, en, ws, flags = {}) => O(id, zh, en, ws, flags, 28);
const cblaster = W('cvBlaster', '爆裂槍', 'Blaster', 'ranged', 4, 3, 4, 5, { piercing: 2 });
const cshredder = W('cvShredder', '撕裂槍', 'Shredder', 'ranged', 4, 3, 4, 5, { rending: true, torrent: 2 });
const cfocused = W('cvCannonF', '星鏢砲（集中）', 'Shuriken cannon (focused)', 'ranged', 5, 3, 4, 5, { heavy: 'dash', rending: true }, 'cvCannon');
const csweeping = W('cvCannonS', '星鏢砲（掃射）', 'Shuriken cannon (sweeping)', 'ranged', 4, 3, 4, 5, { heavy: 'dash', rending: true, torrent: 1 }, 'cvCannon');
const cwraith = W('cvWraith', '幽魂砲', 'Wraithcannon', 'ranged', 4, 3, 6, 3, { heavy: 'dash', piercing: 2, devastating: 4 });
ELDAR_TEAMS.push({
  id: 'corsairVoidscarred', name: B('虛空之痕海盜', 'Corsair Voidscarred'), color: '#287f84',
  style: B('混合隊・靈族・免費衝刺', 'Mixed · Aeldari · Free Dash'),
  blurb: B('迅捷的靈族海盜，結合星鏢火力、劍術與靈能支援，以免費衝刺搶佔戰場。', 'Swift Aeldari corsairs combine shuriken fire, swordplay and psychic support with free Dashes.'),
  rulesUrl: 'https://assets.warhammer-community.com/eng_28-01_kill_team_team_rules_corsair_voidscarred-3war9i1i61-vjohvdpcb9.pdf',
  info: { archetypes: [B('滲透', 'Infiltration'), B('偵察', 'Recon')], kind: B('混合隊', 'Mixed'), oneBox: B('能', 'Yes'), buyable: B('能，這些都已成為大桌單位', 'Yes, available as Warhammer 40,000 units'), size: B('9 名特工', '9 operatives'), note: B('2025 年已退出賽季：官方比賽不能使用，一般對戰或非官方比賽仍可使用。', 'Rotated out in 2025: unavailable in official events, usable in casual and unofficial games.') },
  rule: { name: B('靈族掠奪者・步槍', 'Aeldari Raiders · Rifles'), desc: B('每名特工啟動時可免費衝刺一次；領隊可改為任一 1AP 動作。星鏢步槍與遊俠長步槍在本次尚未轉移、衝鋒或撤退時獲得精準 1。', 'Each operative can Dash for free once per activation; the Felarch can instead make any 1AP action free. Shuriken/ranger rifles gain Accurate 1 before Reposition, Charge or Fall Back.') },
  ploys: [
    P('piraticalProfiteers', '海盜逐利者', 'Piratical Profiteers', '雙方任一特工爭奪目標標記時武器獲得平衡。', 'Balanced when either operative contests an objective marker.'),
    P('mobileEngagement', '機動交戰', 'Mobile Engagement', '本回合移動過的友方被射擊時重擲一顆防禦骰。', 'Re-roll one defence die if the defender moved this TP.'),
    P('plunderers', '掠奪者', 'Plunderers', '第 2 回合起，D3 名友方在策略階段免費衝刺；它們本回合啟動時不能再衝刺。', 'From TP2: D3 friendlies Dash in the Strategy phase; those operatives cannot Dash in their activations this TP.'),
    P('corsairOutcasts', '放逐者', 'Outcasts', '距離所有友方超過 5 吋時武器獲得懲罰。', 'Punishing when more than 5 inches from all other friendlies.'),
  ],
  firefight: [
    P('lightFingers', '妙手', 'Light Fingers', '本次啟動可在交戰時撿取標記與執行任務動作；戰士免費。', 'Pick up markers and perform mission actions while engaged; free for Warriors.'),
    P('capriciousFlight', '反覆無常的逃逸', 'Capricious Flight', '本次啟動撤退少 1AP；戰士免費。', 'Fall Back costs 1 less AP; free for Warriors.'),
    P('opportunisticFighters', '伺機戰士', 'Opportunistic Fighters', '敵人撤退前，每名交戰中的海盜令其受到 2D3 傷害（自動）。', 'Before an enemy Falls Back, each engaged Corsair causes 2D3 damage (automatic).'),
    P('contemptuousAdventurer', '傲慢冒險家', 'Contemptuous Adventurer', '本回合首名啟動且離所有友方超過 5 吋的特工，首次攻擊獲得無情。', 'First activated operative, isolated by more than 5 inches: Relentless on its first attack.'),
  ],
  // The default is a legal nine-specialist roster. Any non-leader slot can be
  // replaced by a Warrior; the Gunner slot can instead take the Heavy Gunner.
  replacements: { cvGunner: ['cvGunner', 'cvHeavy', 'cvWarrior'], cvFate: ['cvFate', 'cvWarrior'], cvKurnathi: ['cvKurnathi', 'cvWarrior'], cvHunter: ['cvHunter', 'cvWarrior'], cvShade: ['cvShade', 'cvWarrior'], cvSoul: ['cvSoul', 'cvWarrior'], cvStarstorm: ['cvStarstorm', 'cvWarrior'], cvWay: ['cvWay', 'cvWarrior'] },
  ops: [
    C('cvFelarch', '海盜領主', 'Voidscarred Felarch', [crifle, cpistol, cpower], { wounds: 9, veteranRaider: true, oneStepAhead: true, loadouts: { rifle: [crifle, cpistol, cpower], neuro: [W('cvNeuro', '神經干擾槍', 'Neuro disruptor', 'ranged', 4, 3, 4, 5, { range: 8, piercing: 1, stun: true }), cpower] } }),
    C('cvFate', '命運裁決者', 'Voidscarred Fate Dealer', [W('cvLongMobile', '遊俠長步槍（機動）', 'Ranger long rifle (mobile)', 'ranged', 4, 3, 3, 4, {}, 'cvLong'), W('cvLongStill', '遊俠長步槍（固定）', 'Ranger long rifle (stationary)', 'ranged', 4, 2, 3, 3, { devastating: 3, heavy: true, silent: true }, 'cvLong'), cpistol, cfists], { camoCloak: true }),
    C('cvGunner', '海盜槍手', 'Voidscarred Gunner', [cblaster, cpistol, cfists], { loadouts: { blaster: [cblaster, cpistol, cfists], shredder: [cshredder, cpistol, cfists] } }),
    C('cvKurnathi', '庫納提劍士', 'Voidscarred Kurnathi', [cpistol, W('cvDualPower', '雙動力武器', 'Dual power weapons', 'melee', 4, 3, 4, 6, { ceaseless: true, lethal: 5 })], { blademaster: true, bladedStance: true }),
    C('cvHunter', '庫諾斯獵人', 'Voidscarred Kurnite Hunter', [W('cvFaolchu', '法爾丘獵鷹', 'Faolchú', 'ranged', 4, 3, 1, 2, { rending: true, saturate: true, seekLight: true, silent: true }), cpistol, cpower], { faolchuBond: true, eruditeHunter: true }),
    C('cvShade', '暗影行者', 'Voidscarred Shade Runner', [cpistol, W('cvThrowing', '投擲刀刃', 'Throwing blades', 'ranged', 4, 3, 2, 4, { range: 6, silent: true }), W('cvHekatarii', '赫卡塔利刀刃', 'Hekatarii blades', 'melee', 4, 3, 3, 5, { ceaseless: true, lethal: 5 })], { blinkPack: true, slicingAttack: true }),
    C('cvSoul', '靈魂織者', 'Voidscarred Soul Weaver', [cpistol, cpower], { psyker: true, soulChannel: true, soulHeal: true }),
    C('cvStarstorm', '星暴決鬥者', 'Voidscarred Starstorm Duellist', [W('cvFusion', '熔融手槍', 'Fusion pistol', 'ranged', 4, 3, 5, 3, { range: 3, devastating: 3, piercing: 2 }), cpistol, cfists], { quickTrigger: true, pistolBarrage: true }),
    C('cvWay', '尋路者', 'Voidscarred Way Seeker', [W('cvFreezing', '冰凍之握', 'Freezing grasp', 'ranged', 4, 3, 1, 2, { psychic: true, severe: true, silent: true }), W('cvLightning', '閃電打擊', 'Lightning strike', 'ranged', 4, 3, 4, 3, { psychic: true, devastating: 2, devSplash: 2 }), cpistol, W('cvStaff', '巫術杖', 'Witch staff', 'melee', 4, 3, 3, 5, { psychic: true, shock: true })], { psyker: true, warpFold: true, wardingShield: true }),
    C('cvHeavy', '海盜重槍手', 'Voidscarred Heavy Gunner', [cfocused, csweeping, cpistol, cfists], { count: 0, loadouts: { cannon: [cfocused, csweeping, cpistol, cfists], wraith: [cwraith, cpistol, cfists] } }),
    C('cvWarrior', '海盜戰士', 'Voidscarred Warrior', [cpistol, cpower], { count: 0, prowlingRaiders: true, loadouts: { blade: [cpistol, cpower], rifle: [crifle, cfists] } }),
  ],
});

export const ARCHON_EQUIPMENT = {
  chainSnare: { name: { zh: '鏈索陷阱', en: 'Chain Snare' }, desc: { zh: '控制範圍內只有一名敵人時，阻止其撤退；每回合成功一次。', en: 'Stop a lone engaged enemy from falling back; once successfully per TP.' } },
  wickedBlades: { name: { zh: '邪惡刀刃', en: 'Wicked Blades' }, desc: { zh: '刀刃組合攻擊骰 +1。', en: 'Array of blades: +1 Atk.' } },
  toxinCoating: { name: { zh: '毒素塗層', en: 'Toxin Coating' }, desc: { zh: '每回合前兩次近戰序列獲得致命 5+（自動）。', en: 'Lethal 5+ for the first two melee sequences each TP (automatic).' } },
  refinedPoison: { name: { zh: '精煉毒液', en: 'Refined Poison' }, desc: { zh: '每回合前兩次破片／毒刺射擊普通傷害 +1（自動）。', en: 'First two splinter/shardcarbine/stinger Shoot actions each TP: +1 Normal Dmg (automatic).' } },
};

export const CORSAIR_EQUIPMENT = {
  mistfield: { name: { zh: '迷霧力場', en: 'Mistfield' }, desc: { zh: '每回合首次被 3 吋外有穿甲的武器射擊時，穿甲 -1（自動）。', en: 'Once per TP, reduce Piercing by 1 against a shot from beyond 3 inches (automatic).' } },
  runesGuidance: { name: { zh: '指引符文', en: 'Runes of Guidance' }, desc: { zh: '每回合首次需要延伸距離的靈能動作 +3 吋，折疊空間除外。', en: 'Once per TP, extend a psychic action by 3 inches when needed; excludes Warp Fold.' } },
  diuturnalMantles: { name: { zh: '恆久披風', en: 'Diuturnal Mantles' }, desc: { zh: '對爆炸／洪流重擲一顆防禦骰；免疫其他目標的毀滅波及。', en: 'Re-roll one defence die against Blast/Torrent; ignore secondary Devastating splash.' } },
  starCharts: { name: { zh: '星圖', en: 'Star Charts' }, desc: { zh: '策略階段自動擲 D3，高於回合數時獲得 1CP，成功後整場不能再使用。', en: 'Automatically roll D3 in Strategy; above TP gains 1CP, then unavailable for the battle.' } },
};
