// Plague Marines (瘟疫戰士): faction equipment and the roster limits (the team itself is in teams.js).
// Source: https://assets.warhammer-community.com/eng_plague_marines_online_rules-wqjvit50wj-jvekzllwdl.pdf (errata August '26)
const B = (zh, en) => ({ zh, en });

export const PLAGUE_EQUIPMENT = {
  pmRounds: { name: B('瘟疫彈藥', 'Plague Rounds'), desc: B('友方瘟疫戰士的爆彈槍與爆彈手槍獲得「中毒」與「嚴厲」。', 'Friendly PLAGUE MARINE boltguns and bolt pistols have the Poison and Severe weapon rules.') },
  pmVents: { name: B('毒氣噴口', 'Poison Vents'), desc: B('敵人在友方瘟疫戰士 3" 內啟動時：沒有你的中毒標記就擲 D3，3 時獲得一個；已有標記則受 D3 傷害（取代 1）。', 'When an enemy is activated within 3" of a friendly PLAGUE MARINE: without one of your Poison tokens, roll a D3 — on a 3 it gains one; with one, it takes D3 damage instead of 1.') },
  pmBells: { name: B('瘟疫鐘', 'Plague Bells'), desc: B('友方瘟疫戰士無視重傷造成的數值變化（含武器）。', 'Friendly PLAGUE MARINE operatives ignore stat changes from being injured (including their weapons\' stats).') },
  pmBlight: { name: B('枯萎手雷', 'Blight Grenades'), desc: B('友方瘟疫戰士多一把遠程武器「枯萎手雷」（4/4+/2/4，射程 6"、爆裂 2"、飽和、嚴厲、中毒；整場最多用 2 次）。', 'Friendly PLAGUE MARINE operatives have a Blight grenade ranged weapon (4 / 4+ / 2/4; Range 6", Blast 2", Saturate, Severe, Poison; at most twice in the battle).') },
};

/** The Champion plus five of the six others, each once. */
export function plagueRosterError(t, roster = {}) {
  const ids = Object.keys(t.replacements).map((slot) => roster[slot] || slot);
  const dup = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (!dup.length) return null;
  const nm = (lang) => dup.map((id) => t.ops.find((o) => o.id === id).name[lang]).join(lang === 'zh' ? '、' : ', ');
  return B(`重複選了：${nm('zh')}（每種特工只能選一次）`, `Picked more than once: ${nm('en')} (each operative only once)`);
}
