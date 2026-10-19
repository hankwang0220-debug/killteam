// Warpcoven (千子次元秘教): Boons of Tzeentch, faction equipment and the roster check (the team itself is in teams.js; the engine is in game.js).
// Source: https://assets.warhammer-community.com/eng_29-04_kt_teamrules_warpcoven-dlvflmyfdc-tqfq81iy7v.pdf (errata April '26)
const B = (zh, en) => ({ zh, en });

/** Boons of Tzeentch: each Sorcerer has one, each boon once per kill team. */
export const WC_BOONS = {
  sight: { name: B('虛體視覺', 'Incorporeal Sight'), desc: B('遠程武器「飽和」；它射擊時敵人不會被遮擋。', 'Its ranged weapons have Saturate; enemies can\'t be obscured when it shoots.') },
  timeWalk: { name: B('時間行者', 'Time-Walk'), desc: B('移動 +1"。', '+1" Move.') },
  echoes: { name: B('亞空間回聲', 'Echoes from the Warp'), desc: B('整場一次：反擊時可改變指令，並多做一個免費的 1AP 動作（兩個動作要不同）。', 'Once per battle, when it counteracts: change its order, and it can perform an additional free 1AP action (the two actions must be different).') },
  warpSwell: { name: B('亞空間湧動', 'Warp Swell'), desc: B('近戰武器普通傷害 +1。', '+1 to the Normal Dmg of its melee weapons.') },
  appendage: { name: B('突變肢體', 'Mutant Appendage'), desc: B('在敵人控制範圍內也能撿起標記或做任務動作；每次啟動一次，撿起標記、放下標記或任務動作少 1AP。', 'Enemies within its control range don\'t stop it picking up markers or performing mission actions; once per activation, Pick Up Marker, Place Marker or a mission action costs 1 less AP.') },
  flight: { name: B('非物質飛行', 'Immaterial Flight'), desc: B('每回合一次：啟動中轉移或衝鋒時可飛行（無視地形，從原位在移動距離內重新放下；衝鋒不額外 +2"；墓穴世界不能飛越牆壁或穿過艙門）。', 'Once per turning point, when it Repositions or Charges during its activation, it can FLY (ignoring terrain, set back up within its Move of where it was; no extra distance for the Charge; on Tomb World not over walls or through hatchways).') },
  twist: { name: B('命運扭轉', 'Twist of Fate'), desc: B('靈能遠程武器「暴擊穿甲 1」。', 'Its PSYCHIC ranged weapons have Piercing Crits 1.') },
  bombard: { name: B('星界轟炸', 'Astral Bombardment'), desc: B('一把靈能遠程武器「毀滅 1」：命運巫師的末日彈改為「2\" 毀滅 2」，時間巫師是通量爆破，戰火巫師是火焰風暴（每次射擊選「搜尋（輕型）」或「毀滅 1」，這裡目標有掩護時保留搜尋，否則用毀滅）。', 'One PSYCHIC ranged weapon has Devastating 1: the Sorcerer of Destiny\'s doombolt has 2" Devastating 2 instead; the Sorcerer of Tempyrion\'s fluxblast; the Sorcerer of Warpfire\'s firestorm (each Shoot: Seek Light or Devastating 1 — here Seek Light against a target in cover, otherwise Devastating 1).') },
  master: { name: B('非物質大師', 'Master of the Immaterium'), desc: B('有距離要求的靈能動作距離 +3"（時間通量只影響第一段）。', '+3" to the distance requirements of its PSYCHIC actions (for Temporal Flux, only the first part).') },
};
export const WC_BOON_DEFAULT = { destiny: 'twist', warpfire: 'sight', tempyrion: 'master' };
/** The psychic ranged weapon each Sorcerer's Astral Bombardment picks. */
export const WC_BOMBARD = { destiny: 'doombolt', tempyrion: 'fluxblast', warpfire: 'firestorm' };

export const WARPCOVEN_EQUIPMENT = {
  wcRounds: { name: B('咒術彈藥', 'Ensorcelled Rounds'), desc: B('友方的煉獄爆彈槍、煉獄爆彈手槍與自動手槍「毀滅 1」。', 'Friendly inferno boltguns, inferno bolt pistols and autopistols have Devastating 1.') },
  wcScrolls: { name: B('巫術卷軸', 'Sorcerous Scrolls'), desc: B('整場一次：友方巫師啟動或反擊時，換一個其他友方沒有的奸奇恩賜，直到戰鬥結束。', 'Once per battle, when a friendly Sorcerer is activated or counteracts, select a different Boon of Tzeentch (one no other friendly has) for it until the end of the battle.') },
  wcMaws: { name: B('惡魔之喙武器', 'Daemonmaw Weapons'), desc: B('友方符文戰士近戰武器攻擊 +1；反擊時近戰武器「精準 1」。', '+1 Atk to friendly Rubric Marines\' melee weapons; Accurate 1 when they retaliate.') },
  wcRobes: { name: B('秘法長袍', 'Arcane Robes'), desc: B('每名巫師每回合一次：一顆對它造成暴擊傷害的攻擊骰改為普通傷害（可在策略階段的自動能力開關關閉）。', 'Once per turning point per Sorcerer: an attack dice that would inflict Critical Dmg on it inflicts Normal Dmg instead (switchable in the Strategy phase).') },
};

/** All the operatives a roster picks (each package slot can hold one or two operatives). */
export const warpcovenIds = (t, roster = {}) => Object.entries(t.packages).flatMap(([pid, pk]) => (pk.options[roster[pid]] || Object.values(pk.options)[0]).ops);

/** Five selections (two Tzaangor make one); at least one Sorcerer; each once except Warriors; one warpflame pistol; boons once each. */
export function warpcovenRosterError(t, roster = {}, loadouts = {}) {
  const ids = warpcovenIds(t, roster), T = (id) => t.ops.find((o) => o.id === id);
  const bad = [];
  const dup = [...new Set(ids.filter((id, i) => !T(id).wcWarrior && ids.indexOf(id) !== i))];
  if (dup.length) bad.push(B(`重複選了：${dup.map((id) => T(id).name.zh).join('、')}（除了戰士，每種特工只能選一次）`, `Picked more than once: ${dup.map((id) => T(id).name.en).join(', ')} (each only once, except Warriors)`));
  const sorc = ids.filter((id) => T(id).sorcerer);
  if (!sorc.length) bad.push(B('至少要選一名巫師', 'At least one Sorcerer'));
  if (sorc.filter((id) => (loadouts[id] || Object.keys(T(id).loadouts)[0]) === 'warpflame').length > 1) bad.push(B('亞空間火焰手槍最多 1 把', 'One warpflame pistol at most'));
  const boons = [...new Set(sorc)].map((id) => roster[`boon_${id}`] || WC_BOON_DEFAULT[id]);
  if (new Set(boons).size < boons.length) bad.push(B('每個奸奇恩賜只能選一次', 'Each Boon of Tzeentch only once'));
  return bad.length ? B(bad.map((b) => b.zh).join('；'), bad.map((b) => b.en).join('; ')) : null;
}
