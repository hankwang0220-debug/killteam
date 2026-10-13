// Kommandos (歐克蠻人): faction equipment and the roster limits (the team itself is in teams.js).
// Source: https://assets.warhammer-community.com/eng_17-06_kill_team_team_rules_kommandos_online_rules-ova8v1kjds-ds3ouz4k04.pdf (June '26)
const B = (zh, en) => ({ zh, en });

export const KOMMANDOS_EQUIPMENT = {
  kmChoppas: { name: B('劈砍刀', 'Choppas'), desc: B('友方歐克蠻人（炸彈史奎格與格洛特除外）多一把近戰武器「劈砍刀」（3/3+/4/5）；已經有更好版本的用更好的。', 'Friendly KOMMANDO operatives (not Bomb Squigs or Grots) have a Choppa (3 / 3+ / 4/5); where they already have a better one, use that.') },
  kmStocks: { name: B('折疊槍托', 'Collapsible Stocks'), desc: B('友方歐克蠻人的震擊手槍與粗製手槍失去「射程」武器規則。', 'Friendly KOMMANDO operatives\' shokka pistols and sluggas lose the Range weapon rule.') },
  kmDynamite: { name: B('炸藥捆', 'Dynamite'), desc: B('整場一次，一名友方歐克蠻人（炸彈史奎格與格洛特除外）可以用遠程武器「炸藥捆」：5/4+/4/5，射程 4"、爆裂 1"、重型（只能重新定位）、飽和。', 'Once per battle a friendly KOMMANDO operative (not a Bomb Squig or Grot) can use the Dynamite ranged weapon: 5 / 4+ / 4/5; Range 4", Blast 1", Heavy (Reposition only), Saturate.') },
  kmHarpoon: { name: B('魚叉', 'Harpoon'), desc: B('每回合一次，一名友方歐克蠻人（炸彈史奎格與格洛特除外）可以用遠程武器「魚叉」：4/4+/4/5，射程 8"、致命 5+、震懾。', 'Once per TP a friendly KOMMANDO operative (not a Bomb Squig or Grot) can use the Harpoon ranged weapon: 4 / 4+ / 4/5; Range 8", Lethal 5+, Stun.') },
};

/**
 * The Boss Nob plus nine selections: each once, except Boys. The Grot and the Bomb Squig count as half a selection each, so the pair is
 * one selection: when taken together the second sits in the extra slot (kmNone).
 */
export function kommandosRosterError(t, roster = {}) {
  const slots = Object.keys(t.replacements);
  const pick = (slot, k) => { const v = roster[slot]; return (Array.isArray(v) ? v[k] : v) || slot; };
  const main = [], extra = pick('kmNone', 0);
  for (const slot of slots.filter((s) => s !== 'kmNone')) {
    const n = t.ops.find((o) => o.id === slot).count || 1;
    for (let k = 0; k < n; k++) main.push(pick(slot, k));
  }
  const bad = [];
  const name = (id, lang) => t.ops.find((o) => o.id === id).name[lang];
  const dup = [...new Set(main.filter((id, i) => id !== 'boy' && main.indexOf(id) !== i))];
  if (dup.length) bad.push(B(`重複選了：${dup.map((id) => name(id, 'zh')).join('、')}（除了小子，每種只能選一次）`, `Picked more than once: ${dup.map((id) => name(id, 'en')).join(', ')} (each only once, except Boys)`));
  if (main.includes('grot') && main.includes('squig')) bad.push(B('格洛特與炸彈史奎格同時帶，第二個要放在「額外名額」', 'The Grot and the Bomb Squig together: put the second one in the extra slot'));
  if (extra !== 'kmNone') {
    const other = extra === 'grot' ? 'squig' : 'grot';
    if (main.includes(extra)) bad.push(B('額外名額的特工不能和主要名額重複', 'The extra slot can\'t repeat a main pick'));
    else if (!main.includes(other)) bad.push(B(`額外名額的${name(extra, 'zh')}要搭配${name(other, 'zh')}（兩個合算一個名額）`, `The extra slot's ${name(extra, 'en')} needs the ${name(other, 'en')} in a main slot (the pair is one selection)`));
  }
  return bad.length ? B(bad.map((b) => b.zh).join('；'), bad.map((b) => b.en).join('; ')) : null;
}
