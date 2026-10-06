// Quick-reference summary of the rules as implemented in this app (Kill Team 2024 core rules).
export const HELP = {
  zh: `<h2>規則速查</h2>
  <h3>遊戲流程</h3>
  <ol>
    <li><b>部署</b>：擲骰決定誰先部署，雙方<b>輪流</b>每次在部署區放置隊伍人數的 <b>1/3</b>（無條件進位）。所有特工以<b>隱蔽</b>指令開始。每名玩家起始 <b>2 CP</b>。</li>
    <li>共 <b>4 個回合 (Turning Point)</b>。</li>
    <li><b>先攻階段</b>：擲 D6，擲贏的一方<b>決定誰先攻</b>（平手時由上回合沒有先攻的一方決定；第 1 回合平手重擲）。雙方各得 1 CP；第 2 回合起，沒有先攻的一方改得 <b>2 CP</b>，所有特工回到準備狀態。</li><li><b>策略階段</b>：由先攻方先選擇策略計謀（花費 CP），完成後換另一方選擇。</li>
    <li><b>交火階段</b>：從先攻方開始，雙方<b>輪流啟動</b>一名特工，直到所有特工都行動完畢。</li>
  </ol>
  <h3>啟動與指令</h3>
  <p>啟動時給予指令：<b>⚔ 交戰</b>（可正常行動、可反擊）或 <b>◐ 隱蔽</b>（只能用無聲武器射擊、不能衝鋒，反擊依特工能力；處於掩體時不是合法目標）。之後依 <b>APL</b> 執行動作，同一動作每次啟動只能做一次。</p>
  <table>
    <tr><td>移動 1AP</td><td>移動至多 Move。在敵人控制範圍內不能執行；同次啟動不能再撤退或衝鋒。移動結束時不能在敵人 1" 內。</td></tr>
    <tr><td>衝刺 1AP</td><td>移動至多 3"。在敵人控制範圍內不能執行；同次啟動不能再衝鋒。</td></tr>
    <tr><td>衝鋒 1AP</td><td>移動至多 Move+2"，結束時必須在敵人控制範圍內。隱蔽指令或已在控制範圍內不能執行；同次啟動不能再移動、衝刺或撤退。</td></tr>
    <tr><td>撤退 2AP</td><td>敵人在控制範圍內時才能使用，移動至多 Move 並離開控制範圍；同次啟動不能再移動或衝鋒。</td></tr>
    <tr><td>射擊 1AP</td><td>隱蔽指令下只能使用「無聲（Silent）」武器；敵人在控制範圍內時通常不能執行。</td></tr>
    <tr><td>近戰 1AP</td><td>攻擊控制範圍內的敵人。</td></tr>
  </table>
  <p><b>控制範圍</b>：1" 以內。<b>受傷</b>：生命低於起始一半時，Move -2"（但不會低於 4"），武器命中值變差 1。</p>
  <h3>反擊 (Counteract)</h3>
  <p>當你已沒有準備中的特工、對手還有時，在對手每次啟動之間，你可以選一名<b>已行動、交戰指令（死亡天使與瘟疫戰士不限指令）、本回合未反擊過</b>的特工，免費執行一個 1AP 動作，移動不超過 2"。</p>
  <h3>射擊結算</h3>
  <ol>
    <li>攻擊方擲 ATK 顆骰：≥ HIT 為命中，6 為<b>暴擊</b>，1 必定失敗。</li>
    <li>防禦方依特工的<b>防禦值</b>擲防禦骰（目前所有特工為 3 顆）：≥ SAVE 為成功，6 為暴擊。目標在<b>掩體</b>中時，可不擲骰直接保留 1 個普通成功（掩體豁免）。</li>
    <li>普通成功擋普通命中；兩個普通成功擋一個暴擊；暴擊成功擋任意命中。</li>
    <li>未被擋下的命中造成武器的普通/暴擊傷害。</li>
  </ol>
  <h3>近戰結算</h3>
  <p>雙方同時擲骰，由啟動中的一方先結算，之後輪流<b>自己選擇</b>處理一顆成功骰：<b>打擊</b>（造成傷害）或<b>格擋</b>（抵消對方一顆尚未結算的成功骰；普通只能擋普通，暴擊可擋任意）。成功骰也可以選擇<b>放棄</b>不用。<b>友軍協助</b>：敵方的控制範圍內有你的其他友軍時，你的命中值改善 1（防守方也適用）。</p>
  <h3>視線、掩體與遮蔽</h3>
  <p><b>可見</b>與<b>介於其間</b>分開判定：先確認能看到模型，再由射手底座的一點向目標底座朝向射手的部分畫出射線區域；任一射線碰到的地形部分都算介於其間。</p>
  <p><b>掩護</b>：介於其間的地形部分在目標底座 1" 內；射手與目標底座距離 2" 內時不算掩護。交戰目標仍可射擊，隱蔽＋掩護通常不能選為目標。「搜尋」可忽略選目標時的掩護，「飽和」只移除掩護豁免。</p>
  <p><b>遮擋</b>：介於其間的重型地形部分距離雙方底座都超過 1"，攻擊暴擊改為普通成功並扣除 1 顆成功。只靠近同一地形的另一端不一定能避免遮擋。</p>
  <p>同一地形同時提供掩護與遮擋時擇一（程式自動選防守方較有利的）；不同地形提供時可同時生效。煙霧依自己的規則另外判定。</p>
  <p><b>平面模擬限制</b>：以棋子中心與輪廓近似模型視線，實心重型牆會擋視線；底座射線用取樣計算。尚未模擬模型頭部高度、高台、樓層與 3D 地形。參考：<a href="https://canishoot.it/rules/shooting/shoot" target="_blank" rel="noopener">Can I Shoot It?</a>。</p>
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
  <h3>任務</h3>
  <p>開新遊戲時可選任務。「標準對戰」用擊殺任務計分；其他任務有自己的地圖、部署區、標記、任務動作與計分，取代擊殺任務。</p>
  <p><b>Approved Ops（核心任務 5、6）</b>：三個目標點（雙方領土各一、中央一個）。計分＝核心任務（Crit Op）＋戰術行動（Tac Op）＋擊殺任務。開局每位玩家依隊伍原型暗中選一張戰術行動（支配、掃蕩清除、側翼、回收、殉道者、使節），達成揭露條件時才公開；電腦的戰術行動在揭露前看不到。宣示主權與使節在第 2 回合起的策略階段選擇，沒選會自動幫你選。</p>
  <p><b>NPO（非玩家特工）</b>：任務中的第三方，對雙方玩家都有敵意，由電腦依行為卡行動。雙方各啟動一次後（輪回先手方之前），NPO 會抽一張啟動牌行動。NPO 擊倒的特工不算擊殺。</p>
  <p><b>撿起標記</b>（1AP）：拿起你控制的任務標記並帶著走；帶著標記的特工控制它，倒下時標記留在原地。</p>
  <h3>指揮重擲（Command Re-roll）</h3>
  <p>擲出攻擊骰或防禦骰後，可花 <b>1CP</b> 重擲其中<b>一顆</b>（點該骰子）。射擊時，攻方先看攻擊骰決定是否重擲，防方再看防禦骰；近戰時雙方在開始結算前各可重擲一顆。每次擲骰每方限一次；「壓制射擊」或在目標點附近（噁心排放）時不能重擲。電腦會自己判斷要不要用。</p>
  <h3>通用裝備</h3>
  <p>開新遊戲時每方最多選 4 項，開戰前自動擺在己方領土（電腦固定帶爆裂手榴彈、地雷、彈藥箱、重掩體）：通訊裝置（控制它的友方支援距離 +3"）、地雷（第一次有特工進入控制範圍就爆炸，D3+3 傷害，敵我不分）、彈藥箱（控制它可「補充彈藥」，直到下回合射擊重擲一顆攻擊骰）、戰術手榴彈（震撼＋煙霧各 1 次）、爆裂手榴彈（破片＋穿甲各 1 次，任何特工都能丟）、輕掩體 ×2（放在自己半區內）、重掩體（只能放在距離降落區 4" 內）、鐵絲網（不提供掩護，越過時移動距離多算 1"，放在自己半區內）。掩體與鐵絲網都要離其他裝備地形與訪問點 2" 以外。可移動路障、梯子與破門炸藥尚未收錄。</p>
  <h3>交戰計謀（Firefight ploys）</h3>
  <p>每隊有自己的交戰計謀，每張 <b>1CP</b>，每回合每張限用一次。使用方式依時機分三種：</p>
  <ul>
    <li><b>啟動中</b>：特工啟動時，動作按鈕下方的「交戰計謀」按鈕（有些只能在第一個動作前用）。</li>
    <li><b>攻擊時</b>：選射擊目標或宣告攻擊時勾選，按「擲骰」才扣 CP。</li>
    <li><b>自動</b>：被射擊、受傷、倒下時觸發的計謀，在策略階段的「自動使用的交戰計謀」勾選開關；開著且 CP 夠就會自動使用。</li>
  </ul>
  <p>需要中途打斷對手行動的少數計謀（例如替身擋子彈、打斷啟動）尚未收錄。</p>
  <h3>宣告攻擊與回復動作</h3>
  <p>射擊或近戰選好目標後，棋盤會先畫出攻擊線並顯示「宣告攻擊」，按「🎲 擲骰」才擲骰；擲骰前可「收回」。電腦的攻擊也一樣，要按「擲骰」才會結算。</p>
  <p>交戰階段中，你的動作只要沒有擲骰（移動、選擇特工、指令、標記光等），都可以按「↶ 回復上一動作」退回，方便像實體遊戲一樣先移動看看能做什麼。擲過骰的動作與結束啟動後就不能回復。</p>
  <p>上方會顯示雙方本回合正在（或剛剛）啟動的特工，棋盤上以名牌「▶ 啟動中」標出；本回合所有移動都留在棋盤上（箭頭加距離，舊的會變淡）。攻擊時，攻擊者與目標各有名牌與圈圈，並畫出攻擊線。擲骰結果會依序揭曉：攻擊骰、防禦骰、最後才是結果與傷害，電腦選好特工後也會停一下再行動。</p>
  <h3>複盤</h3>
  <p>遊戲中按上方「📜 複盤」可檢視目前為止的每一步；結束的對戰會保存在首頁「對戰紀錄」（最近 10 場）。可逐步前後切換、拖動進度條或自動播放，並查看每一步的紀錄、擲骰與移動軌跡。</p>
  <h3>武器規則</h3>
  <table>
    <tr><td>穿甲 X</td><td>防禦方少擲 X 顆骰。暴擊穿甲：有暴擊時才生效。</td></tr>
    <tr><td>致命 X+</td><td>擲出 X 以上即為暴擊。</td></tr>
    <tr><td>平衡</td><td>可重擲 1 顆攻擊骰。</td></tr>
    <tr><td>無情</td><td>可重擲所有失敗的攻擊骰。</td></tr>
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
    <tr><td>搜尋</td><td>選擇目標時，隱蔽的敵人不能用任何地形當掩護。</td></tr>
    <tr><td>無聲（Silent）</td><td>可以在隱蔽指令下使用這把武器執行射擊；重型等其他限制仍然適用。</td></tr>
    <tr><td>限用 X</td><td>每名特工整場只能使用 X 次。</td></tr>
    <tr><td>過熱</td><td>使用後擲 1 顆 D6，若小於武器命中值，射手受到點數 ×2 的傷害。</td></tr>
    <tr><td>中毒</td><td>用這把武器造成傷害時，敵人獲得中毒標記；有中毒標記的特工每次啟動時受到 1 傷害。</td></tr>
    <tr><td>劇毒</td><td>對行動開始時已中毒的敵人，兩個傷害值都 +1。</td></tr>
    <tr><td>震撼</td><td>近戰時第一次用暴擊打擊，同時移除對方一個未結算的普通成功（沒有則移除暴擊）。</td></tr>
    <tr><td>昏迷</td><td>有暴擊成功時，目標下次啟動 APL -1。</td></tr>
    <tr><td>靈能</td><td>靈能武器（瘟疫戰士的阿斯塔特規則會用到）。</td></tr>
    <tr><td>懲罰</td><td>有暴擊成功時，可把 1 顆失敗骰改為普通成功。</td></tr>
    <tr><td>重型（僅限移動）</td><td>使用前後都只能執行「移動」這一種移動動作。</td></tr>
    <tr><td>齊射</td><td>射擊主要目標後，也射擊另一個有效目標（不能在己方控制範圍內），各自擲骰。</td></tr>
    <tr><td>洪流 X</td><td>射擊主要目標後，也射擊其 X" 內其他有效目標（不能在己方控制範圍內），各自擲骰。</td></tr>
    <tr><td>爆炸 X</td><td>射擊主要目標後，也射擊其 X" 內可見的所有特工（包括己方、無視隱蔽），掩護與遮蔽沿用主要目標。</td></tr>
  </table>
  <p class="hint small">本 App 為非官方粉絲作品。所有隊伍都使用官方線上資料卡的數值（能力文字為改寫），可在 js/data/teams.js 修改。</p>`,

  en: `<h2>Quick Rules</h2>
  <h3>Game sequence</h3>
  <ol>
    <li><b>Deploy</b>: a roll-off decides who sets up first; players <b>alternate</b> setting up <b>a third</b> of their team (rounded up) in their drop zone. All start with a <b>Conceal</b> order. Each player starts with <b>2CP</b>.</li>
    <li>The battle lasts <b>4 Turning Points</b>.</li>
    <li><b>Initiative phase</b>: roll off; the winner <b>decides who has initiative</b> (on a tie, the player without initiative last turning point decides; re-roll ties in the first turning point). Each player gains 1CP; after the first TP, the player without initiative gains <b>2CP</b> instead, and all operatives are readied.</li><li><b>Strategy phase</b>: the initiative player chooses strategic ploys (spending CP), followed by the other player.</li>
    <li><b>Firefight phase</b>: starting with the initiative player, players <b>alternate activating</b> one operative until all are expended.</li>
  </ol>
  <h3>Activations & orders</h3>
  <p>Give an order: <b>⚔ Engage</b> (act normally, can counteract) or <b>◐ Conceal</b> (can Shoot with Silent weapons only, cannot Charge, and counteracts only with an applicable ability; protected while in cover). Then spend <b>APL</b> on actions, each at most once per activation.</p>
  <table>
    <tr><td>Reposition 1AP</td><td>Move up to Move. Not within enemy control range; not with Fall Back or Charge. Cannot end within 1" of an enemy.</td></tr>
    <tr><td>Dash 1AP</td><td>Move up to 3". Not within enemy control range; not with Charge.</td></tr>
    <tr><td>Charge 1AP</td><td>Move up to Move+2", must end within an enemy's control range. Not on Conceal or while in control range; not with Reposition, Dash or Fall Back.</td></tr>
    <tr><td>Fall Back 2AP</td><td>Only while an enemy is in control range; move up to Move and leave it. Not with Reposition or Charge.</td></tr>
    <tr><td>Shoot 1AP</td><td>On Conceal, only with a Silent weapon. Normally unavailable while an enemy is in control range.</td></tr>
    <tr><td>Fight 1AP</td><td>Attack an enemy within control range.</td></tr>
  </table>
  <p><b>Control range</b>: within 1". <b>Injured</b>: below half starting wounds, -2" Move (but not below 4") and Hit worsens by 1.</p>
  <h3>Counteract</h3>
  <p>When you have no ready operatives but your opponent does, between their activations you may pick an <b>expended, Engage-order</b> (Angels of Death and Plague Marines: any order) operative that hasn't counteracted this TP to perform one free 1AP action, moving no more than 2".</p>
  <h3>Shooting</h3>
  <ol>
    <li>Attacker rolls ATK dice: ≥ HIT is a hit, 6 is a <b>critical</b>, 1 always fails.</li>
    <li>Defender rolls defence dice equal to the operative's <b>Defence</b> stat (3 for every operative at the moment): ≥ SAVE succeeds, 6 is critical. In <b>cover</b>, retain one normal success without rolling (cover save).</li>
    <li>A normal success blocks a normal hit; two normals block a critical; a critical blocks either.</li>
    <li>Unblocked hits deal the weapon's normal/critical damage.</li>
  </ol>
  <h3>Fighting</h3>
  <p>Both roll. The active player resolves first, then players alternate, <b>choosing</b> per die: <b>strike</b> (deal damage) or <b>block</b> (cancel an unresolved enemy success; normal blocks normal, critical blocks either). A success may also be <b>held back</b> (discarded unused). <b>Assist</b>: if another friendly operative is within the enemy's control range, your Hit improves by 1 (for the defender too).</p>
  <h3>Cover & obscured</h3>
  <p>Model visibility and intervening base lines are separate checks. Choose one point on the shooter's base, then check the fan to the target's facing base. Any crossing terrain part intervenes.</p>
  <p><b>Cover</b>: an intervening part within 1" of the target's base; not when the bases are within 2". Engage targets remain valid; Conceal plus cover prevents targeting. Seek affects target selection; Saturate only removes cover saves.</p>
  <p><b>Obscured</b>: an intervening Heavy part more than 1" from BOTH bases. Critical successes become normal and one success is discarded. Measure the intervening parts, not the closest unrelated corner of a feature.</p>
  <p>The same feature forces a cover/obscuring choice (automatically optimised for the defender); separate features can give both. Smoke is checked separately.</p>
  <p><b>Flat-board limits</b>: model visibility is approximated with the centre and silhouette; solid heavy walls block it. Base origins are sampled. Model head heights, vantage and 3D floors are not simulated. Reference: <a href="https://canishoot.it/rules/shooting/shoot" target="_blank" rel="noopener">Can I Shoot It?</a>.</p>
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
  <h3>Missions</h3>
  <p>Pick a mission when starting a game. "Standard" scores the Kill Op; other missions bring their own map, drop zones, markers, mission actions and scoring instead of the Kill Op.</p>
  <p><b>Approved Ops (Crit Ops 5 and 6)</b>: three objective markers (one in each territory, one in the centre). Score = Crit Op + Tac Op + Kill Op. At setup each player secretly picks a Tac Op from its team's archetypes (Dominate, Sweep & Clear, Flank, Retrieval, Martyrs, Envoy); it's revealed when its condition is met, and the computer's stays hidden until then. Stake Claim and Envoy picks are made in the Strategy phase from TP2 (one is made for you if you don't).</p>
  <p><b>NPOs (non-player operatives)</b>: third-party operatives hostile to both players, played by the computer from their behaviour. After both players have activated (before the initiative player goes again), the NPOs draw an activation card. Operatives incapacitated by NPOs don't count as kills.</p>
  <p><b>Pick Up Marker</b> (1AP): take a mission marker you control and carry it; a carrier controls its marker and drops it where it falls.</p>
  <h3>Command Re-roll</h3>
  <p>After rolling attack or defence dice, spend <b>1CP</b> to re-roll <b>one</b> of them (tap the die). When shooting, the attacker sees the attack dice first and decides, then the defender sees the defence dice; in a fight each side may re-roll one die before any dice are resolved. Once per side per roll; not allowed under Suppressing Fire or near an objective (Sickening Emissions). The computer decides for itself.</p>
  <h3>Universal equipment</h3>
  <p>When starting a game each player picks up to 4 options, set up automatically in their territory before the battle (the computer always takes explosive grenades, mines, an ammo cache and a heavy barricade): Comms Device (+3" to Support distances for the friendly controlling it), Mines (the first operative to come within its control range takes D3+3, friend or foe), Ammo Cache (Ammo Resupply while controlling it: re-roll one attack die until next TP), Utility Grenades (1 stun + 1 smoke), Explosive Grenades (1 frag + 1 krak, any operative can throw them), Light Barricades ×2 (wholly within your half), Heavy Barricade (wholly within 4" of your drop zone), Razor Wire (no cover; crossing it counts as 1" more; within your half). Barricades and wire must be more than 2" from other equipment terrain and access points. The portable barricade, ladders and the breaching charge aren't included yet.</p>
  <h3>Firefight ploys</h3>
  <p>Each team has its own firefight ploys, <b>1CP</b> each, each once per turning point. By timing:</p>
  <ul>
    <li><b>During an activation</b>: the "Firefight ploys" buttons under the actions (some only before the first action).</li>
    <li><b>With an attack</b>: tick them while picking a Shoot target or on the declared attack; the CP is paid when you roll.</li>
    <li><b>Automatic</b>: reactions (shot, damaged, incapacitated) — switch them on or off in the Strategy phase under "Firefight ploys used automatically"; while on and affordable they're used by themselves.</li>
  </ul>
  <p>A few ploys that interrupt the opponent mid-action (redirecting an attack, interrupting an activation) aren't included yet.</p>
  <h3>Declaring attacks & undo</h3>
  <p>After picking a Shoot or Fight target, the board shows the attack line and an "Attack declared" card; the dice are only rolled when you press "🎲 Roll", and you can take it back before that. The computer's attacks also wait for "Roll".</p>
  <p>In the Firefight phase, any of your actions that rolled no dice (moving, picking an operative, orders, Markerlight…) can be taken back with "↶ Undo last action" — move a model to see what it could do, just like on the tabletop. Actions that rolled dice, and ending an activation, can't be undone.</p>
  <p>The panel shows which operative each side is activating (or activated last) this turning point, with a "▶ Activating" tag on the board. Every move this turning point stays on the board (an arrow with its distance; older ones fade). In an attack the attacker and the target each get a tag and a ring, with an attack line. Dice results are revealed in order — attack dice, defence dice, then the outcome and damage — and the computer pauses after choosing an operative before it acts.</p>
  <h3>Replay</h3>
  <p>During a game, tap "📜 Replay" at the top to review every step so far. Finished games are kept under "Past Games" on the home screen (last 10). Step back and forth, drag the slider or auto-play, and see each step's log, dice and movement trails.</p>
  <h3>Weapon rules</h3>
  <table>
    <tr><td>Piercing X</td><td>Defender rolls X fewer dice. Piercing Crits: only if a crit was scored.</td></tr>
    <tr><td>Lethal X+</td><td>Crit on X+.</td></tr>
    <tr><td>Balanced</td><td>Re-roll one attack die.</td></tr>
    <tr><td>Relentless</td><td>Re-roll all failed attack dice.</td></tr>
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
    <tr><td>Seek</td><td>When picking targets, Concealed enemies can't use any terrain for cover.</td></tr>
    <tr><td>Silent</td><td>Can Shoot with this weapon while Concealed. Other restrictions, such as Heavy, still apply.</td></tr>
    <tr><td>Limited X</td><td>Each operative can use it X times per battle.</td></tr>
    <tr><td>Hot</td><td>After use, roll a D6: if it's below the weapon's Hit, the shooter takes twice the result in damage.</td></tr>
    <tr><td>Poison</td><td>Damaging an enemy with it gives a Poison token; a poisoned operative takes 1 damage whenever it's activated.</td></tr>
    <tr><td>Toxic</td><td>+1 to both Dmg against an enemy poisoned at the start of the action.</td></tr>
    <tr><td>Shock</td><td>In a fight, the first crit strike also discards an unresolved enemy normal success (or a crit if none).</td></tr>
    <tr><td>Stun</td><td>With any crit retained, the target gets -1 APL until the end of its next activation.</td></tr>
    <tr><td>Psychic</td><td>A Psychic weapon (used by the Plague Marines' Astartes rule).</td></tr>
    <tr><td>Punishing</td><td>With any crit retained, one fail becomes a normal success.</td></tr>
    <tr><td>Heavy (Reposition only)</td><td>Reposition is the only move allowed before or after using it.</td></tr>
    <tr><td>Salvo</td><td>After the first target, also shoot one other valid target (not within friendly control range), rolling separately.</td></tr>
    <tr><td>Torrent X</td><td>After the first target, also shoot other valid targets within X" of it (not within friendly control range), rolling separately.</td></tr>
    <tr><td>Blast X</td><td>After the first target, also shoot every operative visible within X" of it — friends included, Conceal ignored; cover and obscured follow the first target.</td></tr>
  </table>
  <p class="hint small">Unofficial fan project. Every team uses the stats from the official online datacards (ability text paraphrased); edit js/data/teams.js.</p>`,
};
