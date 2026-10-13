// Angels of Death (死亡天使): faction equipment and the roster limits (the team itself is in teams.js).
// Source: https://assets.warhammer-community.com/eng_26-08_killteam_angels_of_death_online_rules-1rwlnicmkz-qjtykwlybg.pdf (errata August '26)
const B = (zh, en) => ({ zh, en });

export const ANGELS_EQUIPMENT = {
  adSeals: { name: B('純潔印記', 'Purity Seals'), desc: B('每回合一次（自動）：友方死亡天使射擊、近戰或反擊時，若擲出兩個以上失敗，可捨棄一個失敗、把另一個失敗保留為普通成功。', 'Once per TP (automatic): when a friendly ANGEL OF DEATH shoots, fights or retaliates and rolls two or more fails, discard one to retain another as a normal success.') },
  adAuspex: { name: B('偵測儀', 'Auspex'), desc: B('每回合一次（自動，有幫助時）：友方死亡天使射擊並選有效目標時，直到這次啟動／反擊結束，它 8" 內的敵人不能被遮蔽。', 'Once per TP (automatic, when it helps): when a friendly ANGEL OF DEATH shoots and selects a valid target, enemies within 8" of it cannot be obscured until the end of the activation/counteraction.') },
  adReliquaries: { name: B('戰團聖物箱', 'Chapter Reliquaries'), desc: B('指定的友方特工是交戰指令時，「復仇之怒」交戰計謀 0CP。', 'The Wrath of Vengeance firefight ploy costs 0CP if the specified friendly operative has an Engage order.') },
  adTilting: { name: B('傾斜盾', 'Tilting Shields'), desc: B('每回合一次（自動）：友方死亡天使近戰或反擊時，對手擲攻擊骰後（重擲前）：這次對手不能把低於 6 的結果保留為暴擊（致命、撕裂、嚴厲等）。', 'Once per TP (automatic): when a friendly ANGEL OF DEATH fights or retaliates, the opponent cannot retain results below 6 as critical successes during that sequence (Lethal, Rending, Severe...).') },
};

/** The leader plus five picks: each once, except Warriors (Assault Intercessor Warriors and Intercessor Warriors). */
export function angelsRosterError(t, roster = {}) {
  const slots = Object.keys(t.replacements).filter((s) => s !== 'sgt');
  const ids = slots.map((slot) => roster[slot] || slot);
  const dup = [...new Set(ids.filter((id, i) => !t.ops.find((o) => o.id === id).adWarrior && ids.indexOf(id) !== i))];
  if (!dup.length) return null;
  const nm = (lang) => dup.map((id) => t.ops.find((o) => o.id === id).name[lang]).join(lang === 'zh' ? '、' : ', ');
  return B(`重複選了：${nm('zh')}（除了戰士，每種特工只能選一次）`, `Picked more than once: ${nm('en')} (each only once, except Warriors)`);
}

/** The Adaptive Tactics ploy: the secondary tactic swapped in (the first one the team doesn't already have). */
export const ADAPTIVE_ORDER = ['hardy', 'stealthy', 'sharpshooter', 'siege', 'aggressive', 'dueller', 'mobile', 'resolute'];
