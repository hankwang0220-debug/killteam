// Pathfinders (探路者): faction equipment and the roster limits (the team itself is in teams.js).
// Source: https://assets.warhammer-community.com/eng_pathfinders_online_rules-dj9snutji1-zk16jiuxxe.pdf (errata August '26)
const B = (zh, en) => ({ zh, en });

export const PATHFINDERS_EQUIPMENT = {
  pfTao: { name: B('目標分析光學', 'Target Analysis Optic'), desc: B('每回合一次（自動）：友方探路者（無人機除外）射擊、選有效目標時，若目標至少有一個標記光標記，這次動作視為多一個（爆裂／洪流只影響主目標）。', 'Once per TP (automatic): when a friendly non-drone Pathfinder shoots a target that has at least one Markerlight token, it counts as having one more until the end of that action (only the primary target for Blast / Torrent).') },
  pfHiml: { name: B('高強度標記光', 'High-intensity Markerlight'), desc: B('每回合最多兩次（自動）：友方探路者（MV7 標記無人機除外）做標記光時，目標獲得兩個標記（而不是一個）。', 'Up to twice per TP (automatic): when a friendly Pathfinder (not the MV7 Marker Drone) performs Markerlight, the target gains two tokens instead of one.') },
  pfPhoton: { name: B('光子手雷', 'Photon Grenade'), desc: B('每回合一次，有標記光動作的友方探路者（無人機除外）可做 1AP 動作「光子手雷」：選看得到的一名敵人擲 D6，3+ 時到它下次啟動結束 Move -2" 且不能衝刺。不能在敵人控制範圍內做。', 'Once per TP a friendly Pathfinder with the Markerlight action (not a drone) can perform the 1AP Photon Grenade action: pick a visible enemy and roll a D6 — on 3+ it has -2" Move and can\'t Dash until the end of its next activation. Not within enemy control range.') },
  pfUplink: { name: B('軌道偵測連結', 'Orbital Survey Uplink'), desc: B('每回合一次：友方探路者做標記光時，可改選戰場上任何一名敵人（不必看得到）獲得一個標記。不與高強度標記光或分析疊加。', 'Once per TP: when a friendly Pathfinder performs Markerlight, it can pick any enemy in the killzone (visible or not) to gain one token instead. Not cumulative with High-intensity Markerlight or Analyse.') },
};

/**
 * Shas'ui + 11 selections: each once, except Shas'la and Weapons Experts (two at most). The MB3 Recon Drone counts as two
 * selections, so a roster with one has exactly one slot set to "none" (and no more than that).
 */
export function pathfindersRosterError(t, roster = {}) {
  const slots = Object.keys(t.replacements);
  const ids = slots.map((slot) => roster[slot] || slot);
  const bad = [];
  const dup = [...new Set(ids.filter((id, i) => id !== 'pfNone' && id !== 'shasla' && !t.ops.find((o) => o.id === id).pfExpert && ids.indexOf(id) !== i))];
  if (dup.length) bad.push(B(`重複選了：${dup.map((id) => t.ops.find((o) => o.id === id).name.zh).join('、')}（除了鈦衛戰士和武器專家，每種只能選一次）`, `Picked more than once: ${dup.map((id) => t.ops.find((o) => o.id === id).name.en).join(', ')} (each only once, except Shas'la and Weapons Experts)`));
  if (ids.filter((id) => t.ops.find((o) => o.id === id).pfExpert).length > 2) bad.push(B('武器專家最多 2 名', 'At most two Weapons Experts'));
  const none = ids.filter((id) => id === 'pfNone').length, mb3 = ids.filter((id) => id === 'mb3').length;
  if (none !== mb3) bad.push(B(mb3 ? 'MB3 偵察無人機算兩個名額：要把另一個名額設成「空」' : '「空」只能搭配 MB3 偵察無人機使用', mb3 ? 'The MB3 Recon Drone counts as two selections: set one other slot to "empty"' : '"Empty" is only for the MB3 Recon Drone\'s second selection'));
  return bad.length ? B(bad.map((b) => b.zh).join('；'), bad.map((b) => b.en).join('; ')) : null;
}
