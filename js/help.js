// Quick-reference summary of the rules as implemented in this app (Kill Team 2024 core rules).
export const HELP = {
  zh: `<h2>規則速查</h2>
  <h3>遊戲流程</h3>
  <ol>
    <li><b>部署</b>：雙方在各自部署區放置特工，所有特工以<b>隱蔽</b>指令開始。每名玩家起始 <b>2 CP</b>。</li>
    <li>共 <b>4 個回合 (Turning Point)</b>。</li>
    <li><b>策略階段</b>：擲 D6 決定<b>先攻</b>（平手重擲）。雙方各得 1 CP；第 2 回合起，沒有先攻的一方改得 <b>2 CP</b>。接著由先攻方先選擇策略計謀（花費 CP），完成後換另一方選擇。</li>
    <li><b>交火階段</b>：從先攻方開始，雙方<b>輪流啟動</b>一名特工，直到所有特工都行動完畢。</li>
  </ol>
  <h3>啟動與指令</h3>
  <p>啟動時給予指令：<b>⚔ 交戰</b>（可正常行動、可反擊）或 <b>◐ 隱蔽</b>（不能射擊、衝鋒、反擊，但處於掩體時不是合法目標）。之後依 <b>APL</b> 執行動作，同一動作每次啟動只能做一次。</p>
  <table>
    <tr><td>移動 1AP</td><td>移動至多 Move。在敵人控制範圍內不能執行；同次啟動不能再撤退或衝鋒。移動結束時不能在敵人 1" 內。</td></tr>
    <tr><td>衝刺 1AP</td><td>移動至多 3"。在敵人控制範圍內不能執行；同次啟動不能再衝鋒。</td></tr>
    <tr><td>衝鋒 1AP</td><td>移動至多 Move+2"，結束時必須在敵人控制範圍內。隱蔽指令或已在控制範圍內不能執行；同次啟動不能再移動、衝刺或撤退。</td></tr>
    <tr><td>撤退 2AP</td><td>敵人在控制範圍內時才能使用，移動至多 Move 並離開控制範圍；同次啟動不能再移動或衝鋒。</td></tr>
    <tr><td>射擊 1AP</td><td>隱蔽指令或敵人在控制範圍內時不能執行。</td></tr>
    <tr><td>近戰 1AP</td><td>攻擊控制範圍內的敵人。</td></tr>
  </table>
  <p><b>控制範圍</b>：1" 以內。<b>受傷</b>：生命低於起始一半時，Move -2"，武器命中值變差 1。</p>
  <h3>反擊 (Counteract)</h3>
  <p>當你已沒有準備中的特工、對手還有時，在對手每次啟動之間，你可以選一名<b>已行動、交戰指令（死亡天使不限指令）、本回合未反擊過</b>的特工，免費執行一個 1AP 動作，移動不超過 2"。</p>
  <h3>射擊結算</h3>
  <ol>
    <li>攻擊方擲 ATK 顆骰：≥ HIT 為命中，6 為<b>暴擊</b>，1 必定失敗。</li>
    <li>防禦方擲 <b>3 顆</b>防禦骰：≥ SAVE 為成功，6 為暴擊。目標在<b>掩體</b>中時，可不擲骰直接保留 1 個普通成功（掩體豁免）。</li>
    <li>普通成功擋普通命中；兩個普通成功擋一個暴擊；暴擊成功擋任意命中。</li>
    <li>未被擋下的命中造成武器的普通/暴擊傷害。</li>
  </ol>
  <h3>近戰結算</h3>
  <p>雙方同時擲骰，由啟動中的一方先結算，之後輪流<b>自己選擇</b>處理一顆成功骰：<b>打擊</b>（造成傷害）或<b>格擋</b>（抵消對方一顆尚未結算的成功骰；普通只能擋普通，暴擊可擋任意）。</p>
  <h3>視線、掩體與遮蔽</h3>
  <p><b>掩體</b>：射手與目標之間的地形位於目標的控制範圍（1"）內，目標即在掩體中；但目標距離射手 2" 以內時不算掩體。</p>
  <p><b>遮蔽</b>：之間有<b>重型地形</b>（深色牆）時，目標被遮蔽、無法被射擊；但若該重型地形距離射手或目標 1" 以內則不算遮蔽。<b>斜紋</b>為輕型地形，只提供掩體。</p>
  <p>隱蔽指令＋掩體＝無法被射擊；交戰指令＋掩體＝可被射擊，但獲得掩體豁免。</p>
  <h3>計分：擊殺任務 (Kill Op)</h3>
  <p>依敵方起始人數，擊殺達到下表數量即升一個<b>擊殺等級</b>，每升一級得 1 VP（最多 5）。遊戲結束時擊殺等級較高者再得 1 VP。</p>
  <table>
    <tr><td>敵方人數</td><td>等級 1 / 2 / 3 / 4 / 5 所需擊殺</td></tr>
    <tr><td>6</td><td>1 / 2 / 4 / 5 / 6</td></tr>
    <tr><td>10</td><td>2 / 4 / 6 / 8 / 10</td></tr>
    <tr><td>12</td><td>2 / 5 / 7 / 10 / 12</td></tr>
  </table>
  <p>目標點的控制：控制範圍內己方特工 APL 總和大於敵方即控制。關鍵任務 (Crit Op) 計分尚未加入。</p>
  <h3>測量距離</h3>
  <p>隨時可用：在棋盤上按<b>滑鼠右鍵</b>新增測量點，<b>Esc</b> 回到上一個測量點，<b>左鍵</b>取消測量。點在特工上會吸附到該特工，並以底座邊緣計算距離。</p>
  <p><b>手機／觸控</b>：按棋盤下方的「📏 測量距離」進入測量模式，點棋盤新增測量點（不會移動或選取特工），可用「上一點」「清除」，按「結束」離開。總長與各段距離會顯示在工具列。</p>
  <h3>複盤</h3>
  <p>遊戲中按上方「📜 複盤」可檢視目前為止的每一步；結束的對戰會保存在首頁「對戰紀錄」（最近 10 場）。可逐步前後切換、拖動進度條或自動播放，並查看每一步的紀錄、擲骰與移動軌跡。</p>
  <h3>武器規則</h3>
  <table>
    <tr><td>穿甲 X</td><td>防禦方少擲 X 顆骰。暴擊穿甲：有暴擊時才生效。</td></tr>
    <tr><td>致命 X+</td><td>擲出 X 以上即為暴擊。</td></tr>
    <tr><td>平衡</td><td>可重擲 1 顆攻擊骰。</td></tr>
    <tr><td>無休</td><td>重擲所有擲出 1 的攻擊骰。</td></tr>
    <tr><td>殘暴</td><td>對手只能用暴擊格擋。</td></tr>
    <tr><td>重型</td><td>本次啟動（或反擊）移動過就不能使用；使用後也不能再移動。</td></tr>
    <tr><td>重型（僅限衝刺）</td><td>同上，但「衝刺」仍可執行。</td></tr>
    <tr><td>射程 X</td><td>只能射擊 X" 內的目標。</td></tr>
    <tr><td>精準 X</td><td>最多 X 顆攻擊骰不擲，直接算普通成功。</td></tr>
    <tr><td>嚴厲</td><td>沒有暴擊時，可把 1 個普通成功改為暴擊。</td></tr>
    <tr><td>毀滅 X</td><td>每個暴擊成功額外造成 X 傷害（該骰之後仍照常結算）。</td></tr>
    <tr><td>飽和</td><td>防禦方不能保留掩護豁免。</td></tr>
    <tr><td>搜尋（輕型）</td><td>選擇目標時，隱蔽的敵人不能用輕型地形當掩護（仍保有掩護豁免）。</td></tr>
    <tr><td>無聲</td><td>隱蔽指令下也能用這把武器射擊。</td></tr>
    <tr><td>洪流 X</td><td>射擊主要目標後，也射擊其 X" 內其他有效目標（不能在己方控制範圍內），各自擲骰。</td></tr>
    <tr><td>爆炸 X</td><td>射擊主要目標後，也射擊其 X" 內可見的所有特工（包括己方、無視隱蔽），掩護與遮蔽沿用主要目標。</td></tr>
  </table>
  <p class="hint small">本 App 為非官方粉絲作品。死亡天使使用官方線上資料卡的數值（能力文字為改寫）；其他隊伍為暫定範例，可在 js/data/teams.js 修改。</p>`,

  en: `<h2>Quick Rules</h2>
  <h3>Game sequence</h3>
  <ol>
    <li><b>Deploy</b> operatives in your drop zone; all start with a <b>Conceal</b> order. Each player starts with <b>2CP</b>.</li>
    <li>The battle lasts <b>4 Turning Points</b>.</li>
    <li><b>Strategy phase</b>: roll off for <b>initiative</b> (re-roll ties). Each player gains 1CP; after the first TP, the player without initiative gains <b>2CP</b> instead. Then the initiative player chooses strategic ploys (spending CP), followed by the other player.</li>
    <li><b>Firefight phase</b>: starting with the initiative player, players <b>alternate activating</b> one operative until all are expended.</li>
  </ol>
  <h3>Activations & orders</h3>
  <p>Give an order: <b>⚔ Engage</b> (act normally, can counteract) or <b>◐ Conceal</b> (cannot Shoot, Charge or counteract, but is not a valid target while in cover). Then spend <b>APL</b> on actions, each at most once per activation.</p>
  <table>
    <tr><td>Reposition 1AP</td><td>Move up to Move. Not within enemy control range; not with Fall Back or Charge. Cannot end within 1" of an enemy.</td></tr>
    <tr><td>Dash 1AP</td><td>Move up to 3". Not within enemy control range; not with Charge.</td></tr>
    <tr><td>Charge 1AP</td><td>Move up to Move+2", must end within an enemy's control range. Not on Conceal or while in control range; not with Reposition, Dash or Fall Back.</td></tr>
    <tr><td>Fall Back 2AP</td><td>Only while an enemy is in control range; move up to Move and leave it. Not with Reposition or Charge.</td></tr>
    <tr><td>Shoot 1AP</td><td>Not on Conceal or while an enemy is in control range.</td></tr>
    <tr><td>Fight 1AP</td><td>Attack an enemy within control range.</td></tr>
  </table>
  <p><b>Control range</b>: within 1". <b>Injured</b>: below half starting wounds, -2" Move and Hit worsens by 1.</p>
  <h3>Counteract</h3>
  <p>When you have no ready operatives but your opponent does, between their activations you may pick an <b>expended, Engage-order</b> (Angels of Death: any order) operative that hasn't counteracted this TP to perform one free 1AP action, moving no more than 2".</p>
  <h3>Shooting</h3>
  <ol>
    <li>Attacker rolls ATK dice: ≥ HIT is a hit, 6 is a <b>critical</b>, 1 always fails.</li>
    <li>Defender rolls <b>3</b> defence dice: ≥ SAVE succeeds, 6 is critical. In <b>cover</b>, retain one normal success without rolling (cover save).</li>
    <li>A normal success blocks a normal hit; two normals block a critical; a critical blocks either.</li>
    <li>Unblocked hits deal the weapon's normal/critical damage.</li>
  </ol>
  <h3>Fighting</h3>
  <p>Both roll. The active player resolves first, then players alternate, <b>choosing</b> per die: <b>strike</b> (deal damage) or <b>block</b> (cancel an unresolved enemy success; normal blocks normal, critical blocks either).</p>
  <h3>Cover & obscured</h3>
  <p><b>Cover</b>: intervening terrain within the target's control range (1"); never while the target is within 2" of the shooter.</p>
  <p><b>Obscured</b>: intervening <b>Heavy terrain</b> (dark walls) — the target can't be shot — unless that terrain is within 1" of either operative. <b>Hatched</b> barricades are light terrain: cover only.</p>
  <p>Conceal + cover = cannot be shot. Engage + cover = can be shot, with a cover save.</p>
  <h3>Scoring: Kill Op</h3>
  <p>Based on the enemy's starting number of operatives, incapacitating enough enemies raises your <b>kill grade</b>; each new grade scores 1VP (max 5). At the end of the battle, the player with the higher kill grade scores 1VP.</p>
  <table>
    <tr><td>Enemy size</td><td>Kills for grade 1 / 2 / 3 / 4 / 5</td></tr>
    <tr><td>6</td><td>1 / 2 / 4 / 5 / 6</td></tr>
    <tr><td>10</td><td>2 / 4 / 6 / 8 / 10</td></tr>
    <tr><td>12</td><td>2 / 5 / 7 / 10 / 12</td></tr>
  </table>
  <p>Objective control: friendly operatives control a marker if the total APL of those contesting it is greater than the enemy's. Crit Op scoring is not added yet.</p>
  <h3>Measuring</h3>
  <p>Available at any time: <b>right-click</b> the board to add a measuring point, <b>Esc</b> to go back one point, <b>left-click</b> to clear. Points on an operative snap to it and measure from the base edge.</p>
  <p><b>Phone / touch</b>: tap "📏 Measure" below the board to enter measuring mode. Taps on the board add points (without moving or selecting operatives); use Undo and Clear, and Done to leave. The total and each segment are shown in the toolbar.</p>
  <h3>Replay</h3>
  <p>During a game, tap "📜 Replay" at the top to review every step so far. Finished games are kept under "Past Games" on the home screen (last 10). Step back and forth, drag the slider or auto-play, and see each step's log, dice and movement trails.</p>
  <h3>Weapon rules</h3>
  <table>
    <tr><td>Piercing X</td><td>Defender rolls X fewer dice. Piercing Crits: only if a crit was scored.</td></tr>
    <tr><td>Lethal X+</td><td>Crit on X+.</td></tr>
    <tr><td>Balanced</td><td>Re-roll one attack die.</td></tr>
    <tr><td>Ceaseless</td><td>Re-roll attack dice showing 1.</td></tr>
    <tr><td>Brutal</td><td>Opponent can only block with crits.</td></tr>
    <tr><td>Heavy</td><td>Cannot be used in an activation (or counteraction) in which the operative moved, and the operative cannot move after using it.</td></tr>
    <tr><td>Heavy (Dash only)</td><td>As above, but Dash is still allowed.</td></tr>
    <tr><td>Range X</td><td>Only targets within X".</td></tr>
    <tr><td>Accurate X</td><td>Retain up to X attack dice as normal successes without rolling them.</td></tr>
    <tr><td>Severe</td><td>If no crit is retained, change one normal success to a crit.</td></tr>
    <tr><td>Devastating X</td><td>Each retained crit also inflicts X damage (and still resolves as normal).</td></tr>
    <tr><td>Saturate</td><td>The defender cannot retain cover saves.</td></tr>
    <tr><td>Seek Light</td><td>When picking targets, Concealed enemies can't use Light terrain for cover (they keep the cover save).</td></tr>
    <tr><td>Silent</td><td>Can shoot with this weapon while on a Conceal order.</td></tr>
    <tr><td>Torrent X</td><td>After the first target, also shoot other valid targets within X" of it (not within friendly control range), rolling separately.</td></tr>
    <tr><td>Blast X</td><td>After the first target, also shoot every operative visible within X" of it — friends included, Conceal ignored; cover and obscured follow the first target.</td></tr>
  </table>
  <p class="hint small">Unofficial fan project. Angels of Death use the stats from the official online datacards (ability text paraphrased); the other teams are placeholders — edit js/data/teams.js.</p>`,
};
