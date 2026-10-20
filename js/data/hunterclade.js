// Hunter Clade (獵手之爪): the roster check (the team is in teams.js, its equipment in faction-equipment.js, the engine in game.js).
// Source: .monitor/kill-team/files/hunter-clade.pdf (January '26)
const B = (zh, en) => ({ zh, en });
const SLOTS = ['rsWarrior', 'rsWarriorC', 'infWarrior', 'rgGunner', 'rgDiktat', 'rgSurveyor', 'rgWarrior', 'vgGunner', 'vgWarrior'];

/** Nine picks: each once except Gunners and Warriors; one Diktat, one Surveyor, five Sicarians; one arc rifle, plasma caliver and arquebus. */
export function hunterCladeRosterError(t, roster = {}) {
  const ids = SLOTS.map((s) => roster[s] || s), T = (id) => t.ops.find((o) => o.id === id), bad = [];
  const dup = [...new Set(ids.filter((id, i) => !T(id).huRepeat && ids.indexOf(id) !== i))];
  if (dup.length) bad.push(B(`重複選了：${dup.map((id) => T(id).name.zh).join('、')}`, `Picked more than once: ${dup.map((id) => T(id).name.en).join(', ')}`));
  const n = (f) => ids.filter((id) => f(T(id))).length;
  if (n((o) => o.huDiktat) > 1) bad.push(B('傳令官最多 1 名', 'One Diktat at most'));
  if (n((o) => o.huSurveyor) > 1) bad.push(B('勘測員最多 1 名', 'One Surveyor at most'));
  if (n((o) => o.sicarian) > 5) bad.push(B('西卡里安最多 5 名', 'Five Sicarians at most'));
  for (const [k, zh, en] of [['arc', '電弧步槍', 'arc rifle'], ['plasma', '電漿短銃', 'plasma caliver'], ['arq', '超鈾火繩槍', 'transuranic arquebus']]) if (n((o) => o.huSpecial === k) > 1) bad.push(B(`${zh}最多 1 把`, `One ${en} at most`));
  return bad.length ? B(bad.map((b) => b.zh).join('；'), bad.map((b) => b.en).join('; ')) : null;
}
