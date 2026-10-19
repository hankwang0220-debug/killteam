// Imperial Navy Breachers (帝國海軍跳幫者): faction equipment and the roster check (the team itself is in teams.js; the engine is in game.js).
// Source: https://assets.warhammer-community.com/eng_imperial_navy_breachers_online_rules-n7skbopw8m-0bb7tzt799.pdf (errata August '26)
const B = (zh, en) => ({ zh, en });

export const NAVY_EQUIPMENT = {
  nbSlugs: { name: B('獨頭彈', 'Slugs'), desc: B('每回合最多三次：友方用海軍霰彈槍（遠距離）射擊時，命中改善 1、兩個傷害值 +1，並獲得「精準 1」（可在策略階段的自動能力開關關閉）。', 'Up to three times per turning point: when a friendly shoots with a Navis shotgun (long range), improve its Hit by 1, +1 to both Dmg and Accurate 1 (switchable in the Strategy phase).') },
  nbStimms: { name: B('戰鬥興奮劑', 'Combat Stimms'), desc: B('友方海軍跳幫者重傷時 Move 不會減少。', 'Friendly IMPERIAL NAVY BREACHER operatives ignore Move changes from being injured.') },
  nbRebreathers: { name: B('呼吸器', 'Rebreathers'), desc: B('友方海軍跳幫者不受 APL 變化影響，也不受敵人的「震撼」影響。', 'Friendly IMPERIAL NAVY BREACHER operatives ignore APL changes and aren\'t affected by enemy Shock.') },
  nbOverride: { name: B('系統覆寫裝置', 'System Override Device'), desc: B('每回合一次：一名友方海軍跳幫者「操作艙門」少花 1AP（墓穴世界地圖）。', 'Once per turning point, one friendly IMPERIAL NAVY BREACHER performs Operate Hatch for 1 less AP (Tomb World maps).') },
};

/** The Sergeant plus ten selections: each once except Armsmen; up to two Gunners; the C.A.T. Unit needs the Surveyor, the Gheistskull the Void-jammer. */
export function navyRosterError(t, roster = {}) {
  const ids = Object.keys(t.replacements).map((slot) => roster[slot] || slot);
  const pkg = t.packages.machines.options[roster.machines] || t.packages.machines.options.both;
  const all = [...ids, ...pkg.ops];
  const dup = [...new Set(all.filter((id, i) => id !== 'armsman' && all.indexOf(id) !== i))];
  const nm = (lang, list) => list.map((id) => t.ops.find((o) => o.id === id).name[lang]).join(lang === 'zh' ? '、' : ', ');
  if (dup.length) return B(`重複選了：${nm('zh', dup)}（除了水兵，每種特工只能選一次）`, `Picked more than once: ${nm('en', dup)} (each only once, except Armsmen)`);
  const gunners = all.filter((id) => /^gunner/.test(id)).length;
  if (gunners > 2) return B(`槍手最多兩名（目前 ${gunners} 名）`, `At most two Gunners (${gunners} picked)`);
  if (all.includes('cat') && !all.includes('surveyor')) return B('C.A.T. 偵察車需要勘測員', 'The C.A.T. Unit needs the Surveyor');
  if (all.includes('gheistskull') && !all.includes('voidJammer')) return B('鬼骷髏需要虛空干擾員', 'The Gheistskull needs the Void-jammer');
  return null;
}
