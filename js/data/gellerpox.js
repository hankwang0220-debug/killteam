// Gellerpox Infected (蓋勒痘魔): faction equipment (the team itself is in teams.js; the rules engine is in game.js).
// Source: https://assets.warhammer-community.com/eng_gellerpox_infected_online_rules-cchcqkm6eu-fsvtx5g2ca.pdf (errata August '26)
const B = (zh, en) => ({ zh, en });

export const GELLERPOX_EQUIPMENT = {
  gpSymptoms: { name: B('突變症狀', 'Mutated Symptoms'), desc: B('整場一次：啟動一名友方蓋勒痘魔時，它本回合多獲得一個不同的技術詛咒（有敵人在 6" 內時會問你）。', 'Once per battle: when you activate a friendly GELLERPOX INFECTED operative, it gains one additional, different Techno-curse until the end of the turning point (you\'re asked when an enemy is within 6").') },
  gpBellows: { name: B('瘟疫風箱', 'Plague Bellows'), desc: B('友方夢魘巨怪被 6" 以外的特工射擊時，可把一顆擲出 3 的防禦骰保留為普通成功。', 'Whenever an operative is shooting a friendly NIGHTMARE HULK that\'s more than 6" from it, you can retain one defence dice result of 3 as a normal success.') },
  gpVermin: { name: B('突變害蟲', 'Mutoid Vermin'), desc: B('加入四名突變害蟲（預設：寄生蟎 ×2、眼刺蜂群、汙泥蛆）。害蟲只能轉移、撤退（少 1AP）、射擊與近戰，不能爭奪標記，不算擊殺任務；任何人都能穿過它們，它們的控制範圍也不擋敵人的重新部署、衝刺和衝鋒。', 'Add four MUTOID VERMIN (default: 2 Cursemites, an Eyestinger Swarm, a Sludge-grub). They can only move, Fall Back (1 less AP), Shoot and Fight, can\'t contest markers and don\'t count for kill ops; anyone can move through them, and their control range doesn\'t stop enemies Repositioning, Dashing or Charging.') },
  gpStockpile: { name: B('汙染的庫存', 'Polluted Stockpile'), desc: B('公布時擲 2D6：7+ 你移除對手的一項裝備，否則對手自己移除一項（這裡自動移除最後一項）。', 'When revealed, roll 2D6: on a 7+ you remove one of your opponent\'s equipment options, otherwise they remove one of their own (here the last one listed is removed automatically).') },
};
