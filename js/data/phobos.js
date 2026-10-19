// Phobos Strike Team (恐懼突襲小隊): faction equipment and the roster check (the team itself is in teams.js; the engine is in game.js).
// Source: https://assets.warhammer-community.com/eng_17-12_kt_phobos_strike_team_online_rules-6mf867flcl-2xdbnfouex.pdf (errata November '25)
const B = (zh, en) => ({ zh, en });

export const PHOBOS_EQUIPMENT = {
  phSeals: { name: B('純潔印記', 'Purity Seals'), desc: B('每回合一次：友方射擊、近戰或反擊時擲出兩顆以上失敗，可捨棄一顆、把另一顆保留為普通成功（可在策略階段的自動能力開關關閉）。', 'Once per turning point: when a friendly shoots, fights or retaliates and rolls two or more fails, discard one to retain another as a normal success (switchable in the Strategy phase).') },
  phAmmo: { name: B('特製彈藥', 'Special Issue Ammunition'), desc: B('每回合一次：友方用爆彈卡賓槍、神射手或眼目爆彈卡賓槍射擊時，那把武器直到回合結束獲得「穿甲 1」（可在策略階段關閉）。', 'Once per turning point: when a friendly shoots with a bolt carbine, marksman or occulus bolt carbine, that weapon has Piercing 1 until the end of the turning point (switchable in the Strategy phase).') },
  phGrenades: { name: B('額外多功能手雷', 'Additional Utility Grenades'), desc: B('四顆多功能手雷（這裡為震撼與煙霧各兩顆），不能再另外選通用的多功能手雷。', 'Four utility grenades (two stun and two smoke here); you can\'t also take the universal utility grenades.') },
  phBlades: { name: B('戰鬥刀刃', 'Combat Blades'), desc: B('每名友方都有戰鬥刀刃（近戰 5 / 3+ / 3/4）。', 'Every friendly operative has a combat blade (melee 5 / 3+ / 3/4).') },
};

/** A Sergeant plus five picks: each once, except Warriors. */
export function phobosRosterError(t, roster = {}) {
  const ids = Object.keys(t.replacements).filter((s) => s !== 'sgt').map((slot) => roster[slot] || slot);
  const dup = [...new Set(ids.filter((id, i) => !t.ops.find((o) => o.id === id)?.phWarrior && ids.indexOf(id) !== i))];
  if (!dup.length) return null;
  const nm = (lang) => dup.map((id) => t.ops.find((o) => o.id === id).name[lang]).join(lang === 'zh' ? '、' : ', ');
  return B(`重複選了：${nm('zh')}（除了戰士，每種特工只能選一次）`, `Picked more than once: ${nm('en')} (each only once, except Warriors)`);
}
