const B = (zh, en) => ({ zh, en });
const W = (id, zh, en, type, atk, hit, dn, dc, rules = {}, group = id) => ({ id, name: B(zh, en), type, atk, hit, dmg: [dn, dc], rules, group });
const P = (id, zh, en, z, e) => ({ id, cp: 1, name: B(zh, en), desc: B(z, e) });
const blast = W('mdBaleblast', '冥焰衝擊', 'Baleblast', 'ranged', 4, 3, 3, 4, { soulstrike: true });
const blade = W('mdGlimmersteel', '幽光鋼刃', 'Glimmersteel blade', 'melee', 4, 3, 4, 5, { lethal: 5 });
const O = (id, zh, en, weapons, extra = {}) => ({ id, name: B(zh, en), count: 1, apl: 2, move: 7, save: 5, wounds: 8, base: 28, weapons, ...extra });

export const MANDRAKES_TEAM = {
  id: 'mandrakes', name: B('曼德拉', 'Mandrakes'), color: '#368e9b', keywords: ['AELDARI', 'DRUKHARI', 'MANDRAKE'],
  style: B('混合隊・暗影通道・靈魂打擊', 'Mixed · Shadow Passage · Soulstrike'),
  blurb: B('九名暗影獵手藉地形隱匿、穿梭戰場，以冥焰與利刃收割靈魂。', 'Nine shadow hunters traverse darkness and harvest souls with balefire and blades.'),
  rulesUrl: 'https://assets.warhammer-community.com/eng_28-01_kill_team_team_rules_mandrakes-w2j9qwhaxz-oveknnlmoe.pdf',
  info: { oneBox: B('能', 'Yes'), buyable: B('能', 'Yes'), size: B('9 名特工', '9 operatives'), kind: B('混合隊', 'Mixed'), archetypes: [B('偵察', 'Recon'), B('滲透', 'Infiltration')], note: B('夜魔 1 名＋8 名特工；除戰士外，每種最多 1 名。購買資訊依使用者提供。暗影以平面重型地形與傳送門判定。', 'One Nightfiend and eight operatives; specialists are unique, Warriors may repeat. Purchase notes supplied by the user. Shadow uses flat Heavy terrain and portals.') },
  rule: { name: B('暗影實體・暗影通道・靈魂打擊', 'Umbral Entities · Shadow Passage · Soulstrike'), desc: B('被射擊時忽略穿甲（暴擊穿甲仍生效）；位於暗影時防護改善 1。距重型地形 1 吋內或傳送門控制範圍內視為暗影。每回合一名可用重新定位傳送到暗影：落點不得交戰或成為敵人有效射擊目標，且本回合不能射擊／近戰。靈魂打擊以防禦骰 ≤ 目標當下 APL 成功、1 暴擊、6 失敗。', 'Ignore incoming Piercing (not Piercing Crits); improve Save by 1 in shadow, within 1 inch of Heavy terrain or control range of a portal. Once per TP one Reposition may teleport to shadow, outside enemy control and valid targeting; no Shoot/Fight until next TP. Soulstrike defence succeeds on results at most current APL, with 1 critical and 6 always failing.') },
  ploys: [
    P('mdCreeping', '潛行恐懼', 'Creeping Horror', '第 2 回合起，敵人啟動結束後，一名隱蔽友方可免費衝刺，起終點皆須在暗影；每名每回合一次（自動選擇落點）。', 'From TP2, after enemy activations one Concealed friendly Dashes between shadow locations, once per operative per TP (automatic destination).'),
    P('mdShroud', '幽暗帷幕', 'Gloaming Shroud', '暗影中的友方被射擊時，額外保留一顆防禦骰為普通成功。', 'In shadow when shot: retain one defence die as a normal save in addition to cover.'),
    P('mdBladeDark', '暗夜之刃', 'Blade in the Dark', '隱蔽命令也能衝鋒，但起點或終點必須在暗影。', 'Charge while Concealed if starting or ending in shadow.'),
    P('mdNightmare', '無法逃離的夢魘', 'Inescapable Nightmare', '暗影中的友方攻擊可重擲一顆攻擊骰。', 'Re-roll one attack die while in shadow.'),
  ],
  firefight: [
    P('mdSlither', '滑入視線之外', 'Slither Out of Sight', '任一特工啟動結束時，自動將一名暗影中的交戰友方改為隱蔽。', 'At an activation end, automatically change one Engage friendly in shadow to Conceal.'),
    P('mdFeast', '靈魂盛宴', 'Soul Feast', '攻擊 6 吋內敵人後，回復目標 APL × 造成傷害的攻擊骰數；自動於可療傷時使用。', 'After attacking within 6 inches, heal target APL times damaging attack dice; automatically used when healing is possible.'),
    P('mdNowhere', '無處可藏', 'Nowhere to Hide', '本次啟動移動可穿越地形；衝鋒距離不能超過 Move，落點仍需合法。', 'Move through terrain this activation; Charge is capped at Move, with legal endpoints.'),
    P('mdBite', '暗影之噬', "Shadow’s Bite", '敵人本次啟動衝鋒後近戰暗影中的友方時，友方先解一顆攻擊骰（自動）。', 'Automatically resolve first when an enemy that Charged this activation fights a friendly in shadow.'),
  ],
  replacements: Object.fromEntries(['mdAbyssal', 'mdChooser', 'mdDirgemaw', 'mdShadeweaver'].map((id) => [id, [id, 'mdWarrior']])),
  ops: [
    O('mdNightfiend', '夜魔', 'Nightfiend', [blast, W('mdHuskblade', '枯魂刃', 'Huskblade', 'melee', 5, 3, 4, 6, { lethal: 5, shock: true })], { wounds: 9, mdOubliex: true, ability: B('恐懼低語：6 吋內敵人啟動前擲骰，大於其 APL 則延後（有其他可啟動敵人時，每目標每回合一次）。遺魂護符：準備時或枯魂刃擊殺後充能；每顆傷害骰擲 5+ 無視並消耗充能。', 'Harrowing Whispers: delay activation within 6 inches on a roll above APL if another enemy can activate; once per target per TP. Oubliex: readied or huskblade kill recharges; a 5+ ignores one damaging die and consumes it.') }),
    O('mdAbyssal', '深淵者', 'Abyssal', [W('mdBalesurgeBlast', '冥焰湧流（爆炸）', 'Balesurge (blast)', 'ranged', 5, 3, 3, 4, { blast: 2, soulstrike: true }, 'mdBalesurge'), W('mdBalesurgeBurn', '冥焰湧流（燃燒）', 'Balesurge (burn)', 'ranged', 5, 3, 3, 4, { lethal: 5, soulstrike: true }, 'mdBalesurge'), blade], { mdBalefire: true, ability: B('冥焰纏身（1AP）：標記一名可見特工直到自己下次啟動、死亡或再次使用。友方射擊被標記敵人傷害 +1 且飽和；被標記友方承受遠程傷害 -1（最低 1）。', 'Wreathe in Balefire (1AP): mark one visible operative until next activation, death or reuse. Friendly shooting marked enemies gains +1 damage and Saturate; marked friendlies take -1 ranged damage (minimum 1).') }),
    O('mdChooser', '血肉選取者', 'Chooser of the Flesh', [blast, W('mdBaleblade', '冥焰刃', 'Baleblade', 'melee', 4, 3, 5, 6, { brutal: true, lethal: 5 })], { mdHarvest: true, ability: B('部位收集者：敵人撤退前造成 2D3 傷害。以此或冥焰刃擊殺得 1 靈魂點（敵人 APL ≥3 得 2）。友方啟動時可花 1 點永久 APL +1 或回復 2D3；選取者死亡後仍可使用。', 'Part Collector deals 2D3 before enemies Fall Back. Kills with it or baleblade earn 1 Soul Harvest point (2 for APL 3+). At activation spend one on permanent +1 APL or 2D3 healing, even after the Chooser dies.') }),
    O('mdDirgemaw', '哀嚎者', 'Dirgemaw', [blast, W('mdScream', '恐怖尖嘯', 'Horrifying scream', 'ranged', 5, 2, 2, 2, { range: 6, devastating: 2, seekLight: true, stun: true, soulstrike: true }), blade], { mdProjection: true, ability: B('幻象投射（1AP）：有效目標或暗影中的敵人，命中變差 1、Move -2，不與重傷疊加；直到自己下次啟動、死亡或再次使用。纏繞凝視：策略階段自動標記最近敵人；若可立即攻擊它，搶先啟動並限定首次攻擊目標。', 'Pareidolic Projection (1AP): valid target or enemy in shadow gets -1 Hit and -2 Move, not cumulative with injury, until next activation, death or reuse. Haunting Focus automatically marks the nearest enemy in Strategy and interrupts when it can immediately attack, restricting its first attack.') }),
    O('mdShadeweaver', '織影者', 'Shadeweaver', [blast, blade], { mdPortal: true, ability: B('暗影傳送門：暗影通道前後各留下傳送門；友方每回合各一次可在門間穿梭，不佔普通通道額度。編織黑暗（1AP）：在可見特工處放置持續煙霧；可重新放置，織影者死亡則移除。', 'Shadow Portal: passage leaves a portal at each end; each friendly can traverse them once per TP without spending the normal passage use. Weave Darkness (1AP): persistent smoke at a visible operative, repositionable; removed on the Shadeweaver’s death.') }),
    O('mdWarrior', '暗影戰士', 'Warrior', [blast, blade], { count: 4, mdWarrior: true, ability: B('暗影戰士：位於暗影時幽光鋼刃暴擊傷害 +1。', 'Shadow Warrior: +1 glimmersteel blade Critical damage while in shadow.') }),
  ],
};
export const MANDRAKES_EQUIPMENT = {
  mdSnare: { name: B('鏈索陷阱', 'Chain Snare'), desc: B('敵人從僅與它交戰的友方撤退：擲兩顆 D6（敵人生命上限較高則一顆），任一 4+ 阻止且不花 AP；成功後本回合不能再用。', 'Enemy falling back from a friendly engaging no other enemy: two D6 (one if enemy has higher Wounds); any 4+ prevents without spending AP. Unavailable again this TP after success.') },
  mdGlyph: { name: B('暗影符文', 'Shadow Glyph'), desc: B('每回合一次，友方在暗影中啟動時自動獲得：直到下次啟動，隱蔽且有掩體時，2 吋外不能被選為射擊目標（即使搜尋）。', 'Automatically once per TP at activation in shadow: until next activation, Concealed and in cover cannot be targeted beyond 2 inches, even with Seek.') },
  mdGem: { name: B('靈魂寶石', 'Soul Gem'), desc: B('每回合一次，使用冥焰衝擊時可加入爆炸 1 吋（選擇專用武器版本）。', 'Once per TP select the Soul Gem baleblast profile to gain Blast 1 inch for that Shoot.') },
  mdDarts: { name: B('骨鏢', 'Bone Darts'), desc: B('全隊每回合一次：4 攻擊、3+、2/4，射程 6 吋、撕裂、無聲。', 'Once per team per TP: 4 attacks, 3+, 2/4, Range 6 inches, Rending, Silent.') },
};
export const MD_DART = W('mdDart', '骨鏢', 'Bone dart', 'ranged', 4, 3, 2, 4, { range: 6, rending: true, silent: true });
export const MD_GEM = { ...blast, id: 'mdGemBlast', name: B('冥焰衝擊（靈魂寶石）', 'Baleblast (Soul Gem)'), rules: { ...blast.rules, blast: 1 } };
