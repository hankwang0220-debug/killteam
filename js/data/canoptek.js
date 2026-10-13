// Canoptek Circle (冥工之環): faction equipment (the team itself is in teams.js).
// Source: Canoptek Circle team rules (Kill Team 2025).
const B = (zh, en) => ({ zh, en });

export const CANOPTEK_EQUIPMENT = {
  ccCaskets: { name: B('納米甲蟲匣', 'Nanoscarab Caskets'), desc: B('友方冥工之環特工每次啟動時（自動）回復最多 D3 生命。', 'Whenever a friendly Canoptek Circle operative is activated, it regains up to D3 lost wounds (automatic).') },
  ccPhase: { name: B('相位轉換器', 'Phase Shifter'), desc: B('每回合一次，有人射擊友方地占術士時（自動）：這次射擊的「穿甲 X」減 1（穿甲 1 因此無效）。', 'Once per turning point, when an operative shoots the friendly Geomancer (automatic): worsen the Piercing weapon rule by 1 (Piercing 1 is ignored).') },
  ccManip: { name: B('矩陣操縱器', 'Matrix Manipulator'), desc: B('整場一次，友方特工啟動時（自動，當它能讓該特工進入矩陣時）：直到這次啟動結束，地占術士視為你的第四個方尖碑節點。', 'Once per battle, during an activation (automatic, when it puts that operative into the matrix): until the end of it, the Geomancer counts as your fourth obelisk node.') },
  ccAwakened: { name: B('覺醒方尖碑節點', 'Awakened Obelisk Nodes'), desc: B('第一次使用「驅動方尖碑節點」時揭示：擲一顆 D3，本場戰鬥有那麼多次可以 0CP 使用它。', 'Revealed on the first use of Animate Obelisk Nodes: roll a D3; that many times this battle it costs 0CP.') },
};
