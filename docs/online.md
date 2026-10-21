# 連線對戰

這個版本可放在既有靜態網站（包括子目錄）上，不需新增 Node.js 或資料庫。首頁按「連線對戰」；也可在進行中的對戰，從設定選單開啟連線。

1. 雙方開啟相同版本網站。房主按「建立邀請碼」，把完整碼傳給朋友。
2. 訪客把邀請碼貼到「收到的邀請碼或回覆碼」，按「加入並產生回覆碼」。
3. 訪客把回覆碼傳回房主；房主貼上後按「房主套用回覆碼」。雙方看到「已連線」即可關閉視窗。
4. 房主設定兩隊與任務。按頂端「交給對方操作」可交接選隊、部署、移動、攻擊及擲骰選擇；訪客完成後按「交還房主」。等待時可按「請求操作」。

這是兩人共用一張棋盤的模式，雙方依桌遊流程手動交接操作權，未按 A／B 陣營自動限制可操作項目。連線時採用 2D 棋盤；部署請點選特工再點落點，裝備角度使用數值欄位。3D 模型頁與回放需結束連線後使用。原本的離線與單人模式保留。

## 網站更新

將更新後的 `index.html`、`online-board.html`、`sw.js`、`css/`、`js/` 上傳到現有 `killteam-main/` 目錄，保留原本的 `icons/`、`manifest.webmanifest`。雙方重新整理；若已安裝 PWA，也請關閉後重開。不可只上傳新的連線 JS，舊的 `main.js` 沒有連線入口。

網站需允許載入同目錄的 iframe 及 JavaScript；若伺服器另設 Content-Security-Policy，需允許同源 frame。`online-board.html` 自帶限制外部網路、表單與內嵌腳本的 CSP，訪客棋盤使用不具同源權限的 sandbox iframe。

## 斷線與網路環境

- 房主是唯一的規則、擲骰及存檔來源，請保持分頁開啟。訪客不另跑遊戲引擎，不保存另一份對戰。訪客畫面使用房主的語言。
- 斷線時暫停遠端操作。房主可按「結束連線」繼續本機對戰，再從設定重新邀請。房主保持原分頁時，尚在處理的擲骰／選擇也保留；重新整理只可恢復一般自動存檔，不保證恢復尚未完成的對話框。
- 使用 WebRTC DataChannel 傳輸。預設向 Google STUN 查詢連線位址；某些公司、防火牆或行動網路無法直接連線，需要雙方在進階設定填入自己的 TURN 位址、帳號與密碼。未提供公共 TURN 服務，不能保證所有跨網路組合皆可直連。
- 邀請碼包含 WebRTC 連線資訊，只分享給一起遊玩的朋友。TURN 憑證不寫入存檔，也不放進邀請碼。
- 配對採邀請碼／回覆碼交換，沒有短房號、公開大廳或永久房間；這些功能需要另外部署配對服務。

參考：[WebRTC 連線與 offer/answer 交換](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity)。

## 驗證

`node tests/online.mjs` 測試邀請碼種類／版本、訊息分段、Unicode、錯誤封包與傳送背壓。`node scripts/test.mjs` 包含這個測試。

有安裝 Playwright 與 Chromium 時可執行 `node scripts/test-online-browser.mjs`。也可設定 `PLAYWRIGHT_PATH` 指向 Playwright 的 `index.mjs`，以及 `CHROME_PATH` 指向 Chrome 或 Edge。測試會啟動暫時的 localhost 伺服器及兩個隔離瀏覽器環境，以真正的 WebRTC 連線驗證設定、部署、擲骰、操作交接、過期指令與斷線；測試不依賴公共 STUN，不能代替外網與 TURN 的實機驗收。
