// Death Korps (克里格死亡兵團): faction equipment and the roster limits (the team itself is in teams.js).
// Source: https://assets.warhammer-community.com/eng_29-04_kill_team_team_rules_death_korps-t7f9rdqq5a-uzoyjhayvf.pdf (errata April '26)
const B = (zh, en) => ({ zh, en });

export const DEATHKORPS_EQUIPMENT = {
  dkChrono: { name: B('懷錶', 'Chronometer'), desc: B('整場一次的策略謀略（第 1 或第 2 回合）：完全在己方領域內的每名友方免費衝刺一次，必須結束得更靠近對手的降落區或戰場邊緣。同一回合不能和「重整」策略計謀並用。', 'Once per battle strategic gambit in the first or second turning point: each friendly wholly within your territory makes a free Dash, ending closer to an opponent\'s drop zone or killzone edge. Not in the same turning point as the Regroup ploy.') },
  dkBeads: { name: B('通訊珠', 'Comm-beads'), desc: B('看守長或心腹下達衛兵命令時（自動）：改為只有一名友方收到命令（自動選最受益的），而不是 6" 內全部。', 'When a Watchmaster or Confidant issues a Guardsman Order (automatic): one friendly receives it (the one it helps most) instead of everyone within 6".') },
  dkAxes: { name: B('手斧', 'Hand Axes'), desc: B('友方克里格死亡兵團多一把近戰武器「手斧」（3/4+/3/4）。', 'Friendly DEATH KORPS operatives have a Hand axe melee weapon (3 / 4+ / 3/4).') },
  dkGas: { name: B('毒氣轟炸', 'Gas Bombardment'), desc: B('整場一次的策略謀略：在戰場放一個毒氣標記（點棋盤放置）；標記 3" 內的特工 APL -1。下個策略階段的準備步驟移除。', 'Once per battle strategic gambit: place your Gas marker in the killzone (tap the board); operatives within 3" of it have -1 APL. Removed in the Ready step of the next Strategy phase.') },
};

/** The ploys a Trooper selection can be traded for: the team's own strategy and firefight ploys. */
export const DK_FREE_PLOYS = ['siegeWarfare', 'takeCover', 'clearTheLine', 'regroup', 'inspirationalLeadership', 'combinedArms', 'lifeShame', 'deathAtonement'];
/** How many ploys cost 0CP for the battle: the Trooper slots traded for one. */
export function dkFreeCount(t, roster = {}) {
  const v = roster.trooper;
  const copies = t.ops.find((o) => o.id === 'trooper').count;
  let n = 0;
  for (let k = 0; k < copies; k++) if ((Array.isArray(v) ? v[k] : v) === 'dkFree') n++;
  return n;
}
export const cleanDkFree = (list = [], n = 0) => [...new Set(list.filter((id) => DK_FREE_PLOYS.includes(id)))].slice(0, n);
export const DEFAULT_DK_FREE = ['inspirationalLeadership', 'siegeWarfare', 'takeCover', 'combinedArms'];

/** Nine selections: each once, except Troopers; the four Trooper slots are Troopers or free ploys. */
export function deathKorpsRosterError(t, roster = {}) {
  const ids = Object.keys(t.replacements).filter((s) => s !== 'trooper').map((slot) => roster[slot] || slot);
  const dup = [...new Set(ids.filter((id, i) => id !== 'trooper' && ids.indexOf(id) !== i))];
  if (!dup.length) return null;
  const nm = (lang) => dup.map((id) => t.ops.find((o) => o.id === id).name[lang]).join(lang === 'zh' ? '、' : ', ');
  return B(`重複選了：${nm('zh')}（除了步兵，每種特工只能選一次）`, `Picked more than once: ${nm('en')} (each only once, except Troopers)`);
}
