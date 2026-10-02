// Quick-reference summary of the rules as implemented in this app.
export const HELP = {
  zh: `<h2>規則速查</h2>
  <h3>遊戲流程</h3>
  <ol>
    <li><b>部署</b>：雙方在戰場左右兩側 6" 的部署區放置操作員。</li>
    <li>共 <b>4 個回合 (Turning Point)</b>。每回合開始時擲 D6 決定<b>主動權</b>，雙方各得 1 CP（第 2 回合起，沒有主動權的一方多得 1 CP）。</li>
    <li><b>策略階段</b>：花 CP 使用計謀，效果持續整個回合。</li>
    <li><b>交戰階段</b>：從主動權方開始，雙方<b>輪流啟動</b>一名操作員，直到所有人都行動過。</li>
    <li>每回合結束時，每控制一個目標點得 <b>1 VP</b>。遊戲結束時另依擊殺比例獲得最多 5 VP。</li>
  </ol>
  <h3>啟動</h3>
  <p>啟動時先選擇指令：<b>⚔ 交戰</b>（可射擊、衝鋒）或 <b>◐ 隱蔽</b>（在掩護中時無法被選為射擊目標，但不能射擊或衝鋒）。之後依 <b>APL</b> 點數執行動作，每種動作每次啟動只能做一次。</p>
  <table>
    <tr><td>移動 1AP</td><td>移動至多 Move 距離，移動結束時不能在敵人 1" 交戰範圍內。</td></tr>
    <tr><td>衝刺 1AP</td><td>移動 3"。</td></tr>
    <tr><td>衝鋒 1AP</td><td>移動 Move+2"，必須結束於敵人 1" 內。</td></tr>
    <tr><td>撤退 2AP</td><td>交戰中時使用，移動 Move 並離開交戰範圍。</td></tr>
    <tr><td>射擊 1AP</td><td>對可見、非交戰中的敵人射擊。交戰中不能射擊。</td></tr>
    <tr><td>近戰 1AP</td><td>與 1" 內的敵人近戰。</td></tr>
  </table>
  <h3>射擊結算</h3>
  <ol>
    <li>攻擊方擲 ATK 顆骰：≥ HIT 為命中，6 為<b>暴擊</b>，1 必定失敗。</li>
    <li>防禦方擲 DEF（防禦值）顆骰：≥ SAVE 為豁免，6 為暴擊豁免。目標為交戰指令且在<b>掩體</b>中時，可不擲骰直接保留 1 個普通成功。</li>
    <li>1 個豁免擋 1 個普通命中；1 個暴擊豁免擋任意命中；2 個普通豁免擋 1 個暴擊。</li>
    <li>未被擋下的命中造成武器的普通/暴擊傷害 (DMG)。</li>
  </ol>
  <h3>近戰結算</h3>
  <p>雙方同時擲骰，由啟動中的一方先結算，之後輪流<b>自己選擇</b>處理一顆成功骰：<b>打擊</b>（造成傷害）或<b>格擋</b>（消耗自己一顆，抵消對方一顆；普通只能擋普通，暴擊可擋任意）。</p>
  <h3>視線與掩體</h3>
  <p><b>可見性</b>：從射手畫直線到目標的任何部位。<b>掩體</b>：視線穿過的地形距離目標 1" 內，目標受掩體保護。<b>遮蔽</b>：視線穿過<b>重型地形</b>（深色牆）且目標距離該地形超過 1"，該視線被遮蔽；所有視線都被遮蔽時無法成為目標。<b>斜紋</b>為輕型地形，可通過，只提供掩體。</p>
  <p>隱蔽指令＋掩體＝無法被射擊；交戰指令＋掩體＝可被射擊，但獲得 1 個自動防禦成功。</p>
  <h3>受傷</h3>
  <p>生命值低於一半時<b>受傷</b>：Move -2"，命中骰 -1（HIT 數值 +1）。</p>
  <h3>武器規則</h3>
  <table>
    <tr><td>穿甲 X</td><td>防禦方少擲 X 顆骰。暴擊穿甲：有暴擊時才生效。</td></tr>
    <tr><td>致命 X+</td><td>擲出 X 以上即為暴擊。</td></tr>
    <tr><td>平衡</td><td>可重擲 1 顆攻擊骰。</td></tr>
    <tr><td>無休</td><td>重擲所有擲出 1 的攻擊骰。</td></tr>
    <tr><td>殘暴</td><td>對手只能用暴擊格擋。</td></tr>
    <tr><td>重型</td><td>本次啟動移動過就不能射擊。</td></tr>
    <tr><td>射程 X</td><td>只能射擊 X" 內的目標。</td></tr>
  </table>
  <p class="hint small">本 App 為非官方粉絲作品，規則為簡化版，隊伍與數值為原創範例，可自行在 js/data/teams.js 修改。</p>`,

  en: `<h2>Quick Rules</h2>
  <h3>Game sequence</h3>
  <ol>
    <li><b>Deploy</b> operatives in your 6" zone on the left or right edge.</li>
    <li>The game lasts <b>4 Turning Points</b>. Each starts with a D6 roll-off for <b>initiative</b>; both players gain 1 CP (from TP2 the player without initiative gains 1 extra).</li>
    <li><b>Strategy phase</b>: spend CP on ploys that last the whole TP.</li>
    <li><b>Firefight phase</b>: starting with the initiative player, players <b>alternate activating</b> one operative until everyone has acted.</li>
    <li>At the end of each TP, score <b>1 VP</b> per objective you control. At game end, gain up to 5 VP based on the share of enemies killed.</li>
  </ol>
  <h3>Activations</h3>
  <p>Choose an order: <b>⚔ Engage</b> (can Shoot and Charge) or <b>◐ Conceal</b> (cannot be targeted while in cover, but cannot Shoot or Charge). Then spend <b>APL</b> on actions — each action at most once per activation.</p>
  <table>
    <tr><td>Reposition 1AP</td><td>Move up to Move. Cannot end within enemy engagement range (1").</td></tr>
    <tr><td>Dash 1AP</td><td>Move 3".</td></tr>
    <tr><td>Charge 1AP</td><td>Move up to Move+2", must end within 1" of an enemy.</td></tr>
    <tr><td>Fall Back 2AP</td><td>While engaged, move up to Move and leave engagement.</td></tr>
    <tr><td>Shoot 1AP</td><td>Shoot a visible enemy that is not engaged with your operatives. Not while engaged.</td></tr>
    <tr><td>Fight 1AP</td><td>Fight an enemy within 1".</td></tr>
  </table>
  <h3>Shooting</h3>
  <ol>
    <li>Attacker rolls ATK dice: ≥ HIT is a hit, 6 is a <b>critical</b>, 1 always fails.</li>
    <li>Defender rolls DEF dice: ≥ SAVE is a save, 6 is a critical save. An Engage-order target in <b>cover</b> retains one normal save without rolling.</li>
    <li>A save blocks a normal hit; a critical save blocks any hit; two normal saves block one critical.</li>
    <li>Unblocked hits deal the weapon's normal/critical damage.</li>
  </ol>
  <h3>Fighting</h3>
  <p>Both sides roll. The active player resolves first, then players alternate, each <b>choosing</b> per die: <b>strike</b> (deal damage) or <b>parry</b> (spend one of yours to cancel one of theirs; normal cancels normal, critical cancels either).</p>
  <h3>Line of sight & cover</h3>
  <p><b>Visibility</b>: a line from the shooter to any part of the target. <b>Cover</b>: intervening terrain within 1" of the target. <b>Obscured</b>: a line crossing <b>heavy terrain</b> (dark walls) more than 1" from the target is blocked; if every line is blocked the target can't be shot. <b>Hatched</b> barricades are light terrain: passable, cover only.</p>
  <p>Conceal + cover = cannot be shot. Engage + cover = can be shot, but gets one automatic save.</p>
  <h3>Injured</h3>
  <p>Below half wounds an operative is <b>injured</b>: -2" Move and its HIT gets 1 worse.</p>
  <h3>Weapon rules</h3>
  <table>
    <tr><td>Piercing X</td><td>Defender rolls X fewer dice. Piercing Crits: only if a crit was scored.</td></tr>
    <tr><td>Lethal X+</td><td>Crit on X+.</td></tr>
    <tr><td>Balanced</td><td>Re-roll one attack die.</td></tr>
    <tr><td>Ceaseless</td><td>Re-roll attack dice showing 1.</td></tr>
    <tr><td>Brutal</td><td>Opponent can only block with crits.</td></tr>
    <tr><td>Heavy</td><td>Cannot shoot after moving this activation.</td></tr>
    <tr><td>Range X</td><td>Only targets within X".</td></tr>
  </table>
  <p class="hint small">Unofficial fan project. Rules are simplified; teams and stats are original examples — edit js/data/teams.js to change them.</p>`,
};
