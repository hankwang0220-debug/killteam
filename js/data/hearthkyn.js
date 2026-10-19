// Hearthkyn Salvagers (爐心打撈者): faction equipment (the team itself is in teams.js; the rules engine is in game.js).
// Source: https://assets.warhammer-community.com/eng_29-04_kill_team_team_rules_hearthkyn_salvagers-7ih6r2u7u4-sof3ovjopi.pdf (errata April '26)
const B = (zh, en) => ({ zh, en });

export const HEARTHKYN_EQUIPMENT = {
  hkTools: { name: B('挖掘工具', 'Excavation Tools'), desc: B('友方爐心打撈者「撿起標記」少花 1AP，而且只要爭奪那個標記就能撿（不必控制）。', 'Friendly HEARTHKYN SALVAGER operatives perform Pick Up Marker for 1 less AP and only need to contest the marker (not control it).') },
  hkWrit: { name: B('主權令狀', 'Writ of Claim'), desc: B('整場一次：友方爐心打撈者爭奪兩個以上目標點時，擲完先攻骰後可重擲自己的骰子。', 'Once per battle: if friendly HEARTHKYN SALVAGER operatives contest two or more objective markers, after rolling off for initiative you can re-roll your die.') },
  hkKnives: { name: B('等離子小刀', 'Plasma Knives'), desc: B('每名友方爐心打撈者都有等離子小刀（近戰 3 / 4+ / 3/5，致命 5+）；戰地醫療兵用它自己較好的那把。', 'Every friendly HEARTHKYN SALVAGER has a plasma knife (melee 3 / 4+ / 3/5, Lethal 5+); the Field Medic keeps its better one.') },
  hkRigs: { name: B('攀爬裝備', 'Climbing Rigs'), desc: B('友方爐心打撈者攀爬時，往上的垂直距離算 2"，或忽略落下的距離（在這個 2D 版本裡等於攀爬至少算 2"、不另算落下）。', 'When a friendly HEARTHKYN SALVAGER climbs, the vertical distance up counts as 2", or a drop is ignored (in this 2D version: a climb costs at least 2" with no extra for dropping).') },
};

/** The Theyn plus nine picks: each once, except Warriors; at most three Gunners (each a different weapon — every option is its own template). */
export function hearthkynRosterError(t, roster = {}) {
  const ids = Object.keys(t.replacements).flatMap((slot) => { const p = roster[slot]; return Array.isArray(p) ? p : [p || slot]; });
  const dup = [...new Set(ids.filter((id, i) => id !== 'hkWarrior' && ids.indexOf(id) !== i))];
  const gunners = ids.filter((id) => t.ops.find((o) => o.id === id)?.hkGunner).length;
  const nm = (lang, list) => list.map((id) => t.ops.find((o) => o.id === id).name[lang]).join(lang === 'zh' ? '、' : ', ');
  if (dup.length) return B(`重複選了：${nm('zh', dup)}（除了戰士，每種特工只能選一次；槍手每種武器各一名）`, `Picked more than once: ${nm('en', dup)} (each only once except Warriors; Gunners each with a different weapon)`);
  if (gunners > 3) return B(`槍手最多三名（目前 ${gunners} 名）`, `At most three Gunners (${gunners} picked)`);
  return null;
}
