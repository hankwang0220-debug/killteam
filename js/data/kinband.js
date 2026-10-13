// Farstalker Kinband (遠獵者): faction equipment and the roster limits (the team itself is in teams.js).
// Source: https://assets.warhammer-community.com/eng_22-07_kill_team_team_rules_farstalker_kinband-d5j2c72vs0-mulu2ghc6b.pdf (June '26)
const B = (zh, en) => ({ zh, en });

export const KINBAND_EQUIPMENT = {
  kfMeat: { name: B('生肉', 'Meat'), desc: B('每回合一次（自動，有受傷時）：友方遠獵者（獵犬除外）啟動時，若不在敵人控制範圍內，回復最多 D3+1 生命。', 'Once per TP (automatic, when wounded): when a friendly FARSTALKER KINBAND operative (not a Hound) is activated outside enemy control range, it regains up to D3+1 wounds.') },
  kfTrophy: { name: B('戰利品', 'Trophy'), desc: B('整場一次（自動）：友方遠獵者（獵犬除外）啟動中、不在敵人控制範圍內時，到啟動結束 APL +1。', 'Once per battle (automatic): during a friendly FARSTALKER KINBAND operative\'s activation (not a Hound), outside enemy control range, +1 APL until the end of the activation.') },
  kfPiercing: { name: B('穿甲彈', 'Piercing Shot'), desc: B('每回合一次（自動）：友方遠獵者射擊並選克魯特步槍、散彈槍或雙持手槍（集中）時，這次那把武器獲得「穿甲 1」。不能與毒彈同一次動作使用。', 'Once per TP (automatic): when a friendly FARSTALKER KINBAND operative shoots with a Kroot rifle, Kroot scattergun or dual Kroot pistols (focused), that weapon has Piercing 1 for the action. Not with Toxin Shot in the same action.') },
  kfToxin: { name: B('毒彈', 'Toxin Shot'), desc: B('每回合一次（自動）：友方遠獵者射擊並選克魯特步槍、散彈槍或雙持手槍（集中）時，這次那把武器獲得「致命 5+」與「震懾」。不能與穿甲彈同一次動作使用。', 'Once per TP (automatic): when a friendly FARSTALKER KINBAND operative shoots with a Kroot rifle, Kroot scattergun or dual Kroot pistols (focused), that weapon has Lethal 5+ and Stun for the action. Not with Piercing Shot in the same action.') },
};

/** The Kill-broker plus eleven selections: each once, except Hounds (two at most) and Warriors. */
export function kinbandRosterError(t, roster = {}) {
  const ids = [];
  for (const slot of Object.keys(t.replacements)) {
    const n = t.ops.find((o) => o.id === slot).count || 1, v = roster[slot];
    for (let k = 0; k < n; k++) ids.push((Array.isArray(v) ? v[k] : v) || slot);
  }
  const bad = [];
  const name = (id, lang) => t.ops.find((o) => o.id === id).name[lang];
  const dup = [...new Set(ids.filter((id, i) => id !== 'hound' && id !== 'warrior' && ids.indexOf(id) !== i))];
  if (dup.length) bad.push(B(`重複選了：${dup.map((id) => name(id, 'zh')).join('、')}（除了獵犬與戰士，每種只能選一次）`, `Picked more than once: ${dup.map((id) => name(id, 'en')).join(', ')} (each only once, except Hounds and Warriors)`));
  if (ids.filter((id) => id === 'hound').length > 2) bad.push(B('獵犬最多 2 隻', 'At most two Hounds'));
  return bad.length ? B(bad.map((b) => b.zh).join('；'), bad.map((b) => b.en).join('; ')) : null;
}
