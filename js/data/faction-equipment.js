// Remaining faction equipment. Sources: official PDFs in .monitor/kill-team/files/,
// verified against the 2026-10-19 baseline.json. Current cards take precedence over historical errata.
const B = (zh, en) => ({ zh, en });
const E = (zh, en, z, e) => ({ name:B(zh,en), desc:B(z,e) });
export const ADDITIONAL_EQUIPMENT = {
  blooded: {
    feBloodSigil:E('混沌印記','Chaos Sigil','「應得獎賞」交戰計謀 0CP。','Reward Earned costs 0CP.'),
    feTrophies:E('陰森戰利品','Sinister Trophies','敵人攻擊 2 吋內、持有嗜血標記的友方時，不能重擲攻擊骰的 1。','Attacks against a Blooded-token bearer within 2 inches cannot re-roll results of 1.'),
    feWorship:E('血祭符號','Symbols of Bloody Worship','友方完成造成敵人傷害的行動後，若存活則回復 1 傷。','After an action that damages an enemy, the surviving attacker heals 1 wound.'),
    feWicked:E('邪惡刀刃','Wicked Blades','刺刀、刺刀與盾及簡易刀刃的普通與暴擊傷害各 +1。','Bayonet, bayonet & shield and improvised blade: +1 Normal and Critical Dmg.'),
  },
  fellgor: {
    feBrass:E('黃銅飾物','Brass Adornments','「獸性狂怒」與「野性怒火」各有整場一次 0CP。','Animalistic Fury and Wild Rage each cost 0CP once per battle.'),
    feFellSigil:E('混沌印記','Chaos Sigil','每回合一次，被射擊時使穿透值降低 1。','Once per TP, reduce incoming Piercing by 1.'),
    feGoreMarks:E('血腥印記','Gore Marks','每回合一次，近戰或反擊自傷 1 並重擲一顆攻擊骰；重擲失敗再自傷 1（自動能力可關閉）。','Once per TP, take 1 damage to re-roll a melee attack die; a failed re-roll deals 1 more damage. Automatic use can be disabled.'),
    fePaint:E('戰紋','War Paint','受傷不降低移動數值。','Ignore injury penalties to Move.'),
  },
  exaction: {
    feVisor:E('強化鏡面護目鏡','Reinforced Mirror-visor','忽略 APL 變化與敵人的震擊武器規則。','Ignore changes to APL and enemy Shock.'),
    feManacles:E('手銬','Manacles','敵人撤退時，若友方僅牽制它，擲兩顆 D6（敵人生命上限較高則一顆）；任一 4+ 阻止本次啟動撤退、不花 AP，成功後本回合不能再用。','Against a sole engaged enemy falling back, roll 2D6 (1D6 if it has more Wounds). Any 4+ blocks Fall Back this activation at no AP cost; a success exhausts it for the TP.'),
    feLumen:E('頻閃磷光燈','Strobing Phosphor-lumen','敵人攻擊 2 吋內友方時，不能重擲攻擊骰的 1。','Enemies attacking a friendly within 2 inches cannot re-roll attack results of 1.'),
    feShells:E('特製彈藥','Special Issue Shells','每回合兩次，霰彈槍／霰彈手槍可選飽和、對防禦 3+ 或更好的目標穿透 1，或洪流 1 吋（最多一個次要目標）。','Twice per TP, shotguns/shotpistols select Saturate, Piercing 1 against Save 3+ or better, or Torrent 1 inch with at most one secondary target.'),
  },
  hierotek: {
    feConduits:E('放大導管','Magnification Conduits','每回合一次，學徒或墓穴技師射擊時，可改用另一名可見、交戰指令、未被牽制的非電漿蟲友方作為放大中繼。','Once per TP, an Apprentek/Cryptek may use a visible, unengaged, Engage non-Plasmacyte as its Magnify relay.'),
    feCube:E('超立方體','Tesseract Cube','策略階段若墓穴技師存活、未被牽制且本回合未重生，擲 D6：4+ 得 1CP；擲 1 或累計得到 2CP 後停止使用。','At Ready, an unengaged Cryptek not reanimated this TP rolls D6: 4+ gains 1CP; a 1 or two gained CP ends this equipment.'),
    fePhase:E('相位轉移器','Phase Shifter','每回合一次，墓穴技師被射擊時使穿透值降低 1。','Once per TP, reduce Piercing against a Cryptek by 1.'),
    feTesla:E('特斯拉織網','Tesla Weave','每回合一次，敵人衝鋒結束且牽制友方技師環時，造成 D3+1 傷害。','Once per TP, an enemy ending a Charge engaged with your Hierotek takes D3+1 damage.'),
  },
  hunterClade: {
    feRad:E('輻射轟炸','Rad Bombardment','整場一次、第二回合起策略行動：選目標點或敵部署區。範圍內敵人各擲 D6：4+ 下次啟動結束前 APL -1；6 再受 D3 傷。','Once per battle, TP2+ gambit: select an objective or enemy drop zone. Each enemy there rolls D6: 4+ gives -1 APL through its next activation; 6 also deals D3 damage.'),
    feField:E('折射力場','Refractor Field','每回合一次，被射擊時使穿透值降低 1。','Once per TP, reduce incoming Piercing by 1.'),
    feRedundancy:E('備援系統','Redundancy Systems','每回合一次，未被牽制的友方啟動時回復 D3+2 傷。','Once per TP, an unengaged friendly heals D3+2 on activation.'),
    feMindLink:E('極限心靈連結','Extremis Mind-link','整場一次，「控制敕令」0CP，兩名特工可交錯執行行動。','Once per battle, Control Edict costs 0CP and its two operatives may interleave actions.'),
  },
  kasrkin: {
    feGrip:E('前握把','Foregrip','射擊 3 吋內目標時，資料卡上非手槍遠程武器獲得精準 1。','Datacard ranged weapons excluding pistols gain Accurate 1 against targets within 3 inches.'),
    feScope:E('遠距瞄準鏡','Long-range Scope','熱射武器射擊 6 吋外目標獲得飽和。','Hot-shot weapons gain Saturate beyond 6 inches.'),
    feCadia:E('卡迪亞聖物','Relics of Cadia','每回合一次，射擊、近戰或反擊擲出至少兩個失敗時，捨棄一個，另一個改普通成功。','Once per TP, discard one of two attack failures to retain the other as a normal success.'),
    feKasDagger:E('戰鬥匕首','Combat Daggers','全隊新增近戰武器：3 攻、4+、傷害 3/4。','Adds a melee weapon: 3 Atk, Hit 4+, Dmg 3/4.'),
  },
  legionaries: {
    feWarded:E('護符裝甲','Warded Armour','策略行動：選一名友方，本回合防禦數值改為 2+。','Gambit: one friendly has Save 2+ this TP.'),
    feMalefic:E('惡毒刀刃','Malefic Blades','全隊新增近戰武器：5 攻、3+、傷害 3/4。','Adds a melee weapon: 5 Atk, Hit 3+, Dmg 3/4.'),
    feTainted:E('污穢彈藥','Tainted Rounds','每回合一次，爆彈槍或爆彈手槍射擊可選擇撕裂彈藥版本。','Once per TP, a boltgun or bolt pistol Shoot gains Rending.'),
    feTalismans:E('混沌護符','Chaos Talismans','策略行動選混沌印記；該印記友方每次啟動一次，兩個攻擊失敗可自傷 D3，捨棄一個、另一個改普通成功（自動能力可關閉）。','Gambit: choose a Mark. Once per activation, its bearers can take D3 damage to convert two attack fails to one normal success. Automatic use can be disabled.'),
  },
  novitiates: {
    feFaithIcon:E('信仰聖像','Icon of Faith','每回合一次，同一骰序列可使用兩個不同信仰行為。','Once per TP, use two different Acts of Faith in the same sequence.'),
    feChastisers:E('自動苦修器','Auto-chastisers','每回合一次，攻擊骰序列可用自傷 1–3（不得致死）支付等額信仰點的信仰行為。','Once per TP, pay 1–3 non-lethal wounds instead of the Faith cost of an attack Act of Faith.'),
    feSanctified:E('祝聖彈藥','Sanctified Rounds','自動槍、自動手槍、聖物爆彈槍／手槍射擊若花費信仰點，該序列獲得暴擊穿透 1。','Spending Faith when shooting autoguns, autopistols or relic bolt weapons grants Piercing Crits 1 for that sequence.'),
    feOils:E('聖油','Holy Embrocations','受傷不降低移動數值。','Ignore injury penalties to Move.'),
  },
  battleclade: {
    feCapacitors:E('電術電容器','Electromantic Capacitors','全隊近戰武器獲得震擊；反擊時再獲得嚴厲。','Melee weapons gain Shock, and Severe when retaliating.'),
    feApparatus:E('隱藏武裝','Concealed Apparatus','整場一次，戰鬥僕從或槍械僕從可使用資料卡上未選的另一武器選項。','Once per battle, a Combat/Gun Servitor may use an unselected datacard weapon option.'),
    feBattleGuises:E('秘密偽裝','Covert Guises','部署後擲 D3；第一回合策略行動，至多該數量友方可免費重新定位，終點完整位於己部署區 3 吋內。科技考古學家不能因此在策略階段移動兩次。','Roll D3 at setup. TP1 gambit: up to that many friendlies Reposition free, ending wholly within 3 inches of your drop zone. The Technoarcheologist cannot Reposition twice in that Strategy phase.'),
    feCells:E('神經循環備用電池','Neurocyclic Reserve Cells','每回合一次，轉移能量改為 0AP。','Once per TP, Transfer Power costs 0AP.'),
  },
  exoditeDragonMasters: {
    feMesh:E('龍鱗網甲','Dragonscale Mesh','每回合一次，騎乘特工被射擊時把一個普通防禦成功改暴擊。','Once per TP, promote one mounted operative’s normal save to a critical.'),
    feClan:E('氏族護符','Clan Talismans','每回合一次，騎乘特工兩個攻擊失敗可捨棄一個、另一個改普通成功。','Once per TP, a mounted operative converts two attack failures into one normal success.'),
    feCrystals:E('莉莉絲水晶矩陣','Lileathan Crystal Matrices','每回合一次，太陽卡賓槍或長步槍的一個模式獲得穿透 1，直到該次啟動結束。','Once per TP, one solar carbine/long rifle profile gains Piercing 1 through that activation.'),
    feStones:E('靈魂石','Spirit Stones','每當友方騎乘特工陣亡，獲得 1CP。','Gain 1CP when a mounted friendly is incapacitated.'),
  },
  goremongers: {
    feTotem:E('血腥圖騰','Gory Totem','己領土內部署圖騰，距其他標記超過 2 吋（血屍除外）；3 吋內敵人不能重擲攻擊骰。','Deploy a totem in your territory, over 2 inches from other markers except your Cadaver. Enemies within 3 inches cannot re-roll attacks.'),
    feCadaver:E('血屍','Bloody Cadaver','己領土內部署血屍，距其他標記超過 2 吋（圖騰除外）；可拾取。每個準備步驟由一名控制它且未被牽制的友方增加血槽。','Deploy a carryable cadaver over 2 inches from other markers except your Totem. At Ready, one unengaged friendly controlling it increases its Gore Tank.'),
    feGoreSigil:E('混沌印記','Chaos Sigil','每回合一次，被射擊時使穿透值降低 1。','Once per TP, reduce incoming Piercing by 1.'),
    feChains:E('腕鏈','Wrist Chains','每回合一次，鏈刃、鏈戟、大鏈斧或撕裂鎬可當作射程 2 吋遠程武器；忽略殘暴，保留強化暴力的重擲效果。','Once per TP, throw a chainblade, chainglaive, great chainaxe or pickrippers at Range 2. Ignore Brutal; keep Enhanced Violence re-rolls.'),
  },
  hernkynYaegirs: {
    fePlasma:E('電漿刀','Plasma Knives','新增近戰武器：3 攻、4+、3/5、致命 5+；已有較佳電漿刀者改獲平衡。','Adds 3 Atk, Hit 4+, Dmg 3/5, Lethal 5+ plasma knives. Better existing knives instead gain Balanced.'),
    feStabilised:E('穩定爆彈','Stabilised Bolt Shells','每回合兩次，長距爆彈霰彈槍命中改善 1、雙傷害 +1，並獲精準 1。','Twice per TP, long-range bolt shotgun gains +1 Hit, +1 both Dmg and Accurate 1.'),
    feFirestorm:E('火風暴爆彈','Firestorm Bolt Shells','每回合一次，短距爆彈霰彈槍可使用爆破 1 吋版本。','Once per TP, short-range bolt shotgun gains Blast 1 inch.'),
    feUndersuit:E('KV 陶瓷內襯','KV-Ceramide Undersuit','被爆破或洪流武器射擊可重擲一顆防禦骰；不是目標時免疫範圍毀滅波及。','Re-roll one defence die against Blast/Torrent; ignore distance Devastating splash when not the target.'),
  },
  elucidianStarstriders: {
    feArmour:E('裝甲內襯','Armoured Undersuit','防禦數值 5+ 的非犬類友方被射擊時，可把一顆防禦骰的 4 保留為普通成功。','Non-Canids with Save 5+ retain one rolled defence 4 as a normal success.'),
    fePacks:E('熱射電容包','Hot Shot Capacitor Packs','每回合兩次，雷射槍／手槍（含聖物手槍）可改用強化版本直到回合結束：雙傷害 +1、過熱、暴擊穿透 1。','Twice per TP, lasguns/laspistols including relic laspistols gain +1 both Dmg, Hot and Piercing Crits 1 until the TP ends.'),
    feUplink:E('改良座標上行鏈路','Improved Coordinates Uplink','私掠支援資產攻擊友方海軍 6 吋內目標時，忽略遮蔽並獲得飽和。','Privateer assets ignore obscuring and gain Saturate against enemies within 6 inches of a friendly Navis.'),
    feGunnery:E('快速砲術','Rapid Gunnery','整場一次，可再次使用已用過的私掠支援資產。','Once per battle, reuse a spent Privateer Support Asset.'),
  },
  chaosCult: {
    feScript:E('惡毒經文','Baleful Script','整場一次策略行動：替換一個已選詛咒恩賜。','Once per battle gambit: replace one selected Accursed Gift.'),
    feCultTalisman:E('不潔護符','Unholy Talisman','每回合一次，被射擊時把一個普通防禦成功改暴擊。','Once per TP, promote a normal save to a critical.'),
    feCultGuises:E('秘密偽裝','Covert Guises','擲 D3；第一回合策略行動，至多該數量部署區內信徒可免費重新定位，終點完整位於己部署區 3 吋內。','Roll D3. TP1 gambit: up to that many Devotees Reposition free, ending wholly within 3 inches of your drop zone.'),
    feBlessing:E('卑劣祝福','Vile Blessing','整場一次，非信徒友方忽略一顆普通傷害攻擊骰；先於異常再生決定。','Once per battle, a non-Devotee ignores one Normal Dmg die, before attempting Unnatural Regeneration.'),
  },
  celestianInsidiants: {
    fePsyk:E('反靈能手榴彈','Psyk-out Grenades','獲得兩顆震撼彈，另選通用戰術手榴彈則補兩顆煙霧彈。震撼測試 3+ 另受骰值一半（進位）傷害，靈能者改受完整骰值傷害。','Adds two stun grenades; selecting Utility also adds two smoke grenades. A 3+ stun test also deals half its result (round up), or the full result to Psykers.'),
    feMortis:E('死亡頌音','Vocifera Mortis','整場一次，鼓舞者陣亡的殉道傳承可選不在視線或 6 吋內的友方。','Once per battle, an inspiring casualty passes Martyrdom beyond visibility/range.'),
    feRelics:E('聖徒遺物','Saintly Relics','每顆造成傷害的攻擊骰擲 D6（鼓舞者兩顆），任一 6 忽略傷害；每行動最多忽略一顆、整場最多兩顆。','For each damaging attack die roll D6 (two if inspiring); any 6 ignores it. Maximum one ignored die per action and two per battle.'),
    feFlagellator:E('自動鞭笞器','Auto-flagellator','啟動時可擲 D6，自傷骰值一半（進位）；4+ 成為鼓舞者，每回合最多成功一次（自動能力可關閉）。','On activation roll D6 and suffer half (round up); 4+ becomes inspiring, at most one success per TP. Automatic use can be disabled.'),
  },
  broodBrothers: {
    feBroodTalisman:E('教派護符','Cult Talisman','每回合一次，非族長友方被射擊時把一個普通防禦成功改暴擊。','Once per TP, promote a non-Patriarch’s normal save to a critical.'),
    feCultKnives:E('教派匕首','Cult Knives','族群衛士新增近戰武器：3 攻、4+、傷害 3/4。','Broodguard gain a 3 Atk, Hit 4+, Dmg 3/4 melee weapon.'),
    feBroodGuises:E('秘密偽裝','Covert Guises','擲 D3；第一回合策略行動，至多該數量部署區內族群衛士可免費重新定位，終點完整位於己部署區 3 吋內。','Roll D3. TP1 gambit: up to that many Broodguard Reposition free, ending wholly within 3 inches of your drop zone.'),
    feLookout:E('瞭望哨','Lookout','策略行動：一名對友方可見的敵人獲得一個交叉火力標記。','Gambit: give a Crossfire token to one enemy visible to a friendly.'),
  },
  bladesOfKhaine: {
    feProphecy:E('預言符文','Rune of Prophecy','整場一次，先攻擲骰後，可使自己的結果增加或減少 D3。','Once per battle, adjust your initiative roll by ±D3.'),
    feForesight:E('先見符文','Rune of Foresight','部署時擲 D3，在該回合的策略階段獲得額外 1CP。','Roll D3 at setup; gain 1CP in that turning point’s Strategy phase.'),
    feShielding:E('護盾符文','Rune of Shielding','整場一次，忽略一顆造成普通傷害的攻擊骰。','Once per battle, ignore one Normal Dmg attack die.'),
    feWraithbone:E('靈骨護符','Wraithbone Talisman','每回合一次，兩個攻擊失敗可捨棄一個、另一個改普通成功。','Once per TP, convert two attack failures into one normal success.'),
  },
  inquisitorialAgents: {
    feRosette:E('審判庭徽記','Inquisitorial Rosette','整場一次，已使用「獵物」的回合，友方啟動時可重新選一名敵人作為獵物。','Once per battle, on activation during a Quarry TP, select a replacement quarry.'),
    feAgentDaggers:E('戰鬥匕首','Combat Daggers','全隊新增近戰武器：3 攻、4+、3/4；寂靜修女使用時攻擊 +1。','Adds 3 Atk, Hit 4+, Dmg 3/4 combat daggers; Sisters of Silence gain +1 Atk.'),
    feBodysuits:E('裝甲緊身衣','Armoured Bodysuits','防禦數值 5+ 的非卷宗顱骨友方被射擊時，可把一顆防禦骰的 4 保留為普通成功。','Non-Tome-skulls with Save 5+ retain one rolled defence 4 as a normal success.'),
    feSkull:E('伺服顱骨','Servo-skull','整場一次，一名友方任務行動消耗減少 1AP。','Once per battle, one friendly mission action costs 1 less AP.'),
  },
};
export const ADDITIONAL_EQUIPMENT_ITEMS = Object.assign({}, ...Object.values(ADDITIONAL_EQUIPMENT));
