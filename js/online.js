import { OnlinePeer } from './online-peer.js';
import { openRoom, guestSignal, roomPeerId, cleanRoomNumber } from './online-signal.js';

const blocked = new Set(['home','models','modelsBack','tombworld','twplay','resume','replay','replayhist','delhist','rexit','boardview','3dreset','3dtop','3dcover','online']);
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/** A shared tabletop: the host owns the engine, random rolls and suspended generators.
 * One player at a time controls the table. Guests send revision-checked UI commands,
 * never replacement game states. The sandbox renders only the host's visible UI.
 */
export function createOnline({app, modal, onHost, onGuest, onLeave}) {
  let peer = null, role = null, connected = false, controller = 'host', applying = false;
  let revision = 0, nodes = [], lastSnapshot = null, frame = null, frameReady = false;
  let timer = null, heartbeat = null, lastSeen = 0, busy = false;
  let signal = null, room = null, pairing = false, answerTimer = null; // room-number matchmaking (only until the two players are connected)
  const bar = document.createElement('aside'); bar.className = 'online-bar'; bar.hidden = true;
  const dialog = document.createElement('dialog'); dialog.className = 'online-dialog';
  document.body.append(bar, dialog);
  const status = text => { const el = dialog.querySelector('[data-status]'); if (el) el.textContent = text; };
  function drawBar(message = '') {
    bar.hidden = !role;
    bar.innerHTML = `<b>連線對戰 · ${role === 'host' ? '房主' : '訪客'}</b><span>${escape(message || (!connected ? '連線中斷／等待連線' : controller === role ? '由你操作' : '等待對方操作'))}</span>
      ${connected ? `<button data-net="control">${role === 'host' ? (controller === 'host' ? '交給對方操作' : '收回操作') : (controller === 'guest' ? '交還房主' : '請求操作')}</button>` : ''}
      <button data-net="panel">連線資訊</button><button data-net="leave">結束連線</button>`;
    if (frame) frame.inert = !connected || controller !== 'guest';
  }
  function send(message) {
    try { return peer?.send(message); } catch (e) { status(e.message); connected = false; drawBar(e.message); return false; }
  }
  function snapshot() {
    clearTimeout(timer);
    if (role !== 'host' || !connected) return;
    nodes = [app, modal].map(root => [...root.querySelectorAll('*')]);
    const html = [app, modal].map((root, r) => {
      const copy = root.cloneNode(true);
      [...copy.querySelectorAll('*')].forEach((el, i) => {
        el.dataset.netNode = i;
        const source = nodes[r][i];
        if (source instanceof HTMLInputElement) { el.setAttribute('value', source.value); el.toggleAttribute('checked', source.checked); }
        if (source instanceof HTMLOptionElement) el.toggleAttribute('selected', source.selected);
        if (source instanceof HTMLTextAreaElement) el.textContent = source.value;
        if (blocked.has(source.dataset.act)) { el.setAttribute('disabled', ''); el.setAttribute('aria-disabled', 'true'); }
      });
      return copy.innerHTML;
    });
    send({type:'snapshot', revision:++revision, app:html[0], modal:html[1], control:controller === 'guest'});
  }
  function publish() { clearTimeout(timer); if (role === 'host' && connected) timer = setTimeout(snapshot, 35); }
  function setControl(who) {
    controller = who; drawBar();
    send({type:'control', control:who === 'guest'}); snapshot();
  }
  function apply(message) {
    if (role !== 'host' || !connected || controller !== 'guest') return;
    if (message.revision !== revision || ![0,1].includes(message.root) || !Number.isSafeInteger(message.node)) { snapshot(); return; }
    const target = nodes[message.root]?.[message.node];
    if (!target?.isConnected || target.closest('[disabled],[aria-disabled="true"]') || blocked.has(target.closest('[data-act]')?.dataset.act)) { snapshot(); return; }
    if (!['click','input','change'].includes(message.event)) return;
    const board = target.closest('#board');
    if (!board && !target.closest('[data-act],summary') && !target.matches('input,select,textarea')) { snapshot(); return; }
    if (message.event !== 'click') {
      if (!target.matches('input,select,textarea') || typeof message.value !== 'string' || message.value.length > 1000) { snapshot(); return; }
      if (target.matches('select') && ![...target.options].some(o => o.value === message.value)) { snapshot(); return; }
      target.value = message.value;
      if (target.matches('input[type=checkbox]')) target.checked = !!message.checked;
    }
    let event;
    if (message.event === 'click') {
      event = new MouseEvent('click', {bubbles:true, cancelable:true, button:0});
      if (board) {
        const p = message.point, box = board.viewBox.baseVal;
        if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < box.x || p.y < box.y || p.x > box.x + box.width || p.y > box.y + box.height) { snapshot(); return; }
        Object.defineProperty(event, 'boardPoint', {value:p});
      }
    } else event = new Event(message.event, {bubbles:true});
    applying = true;
    try { target.dispatchEvent(event); } finally { applying = false; snapshot(); }
  }
  function receive(message) {
    lastSeen = Date.now();
    if (!message || typeof message !== 'object') return;
    if (message.type === 'ping') { send({type:'pong'}); return; }
    if (message.type === 'snapshot' && role === 'guest') {
      if (!Number.isSafeInteger(message.revision) || message.revision < (lastSnapshot?.revision || 0) || typeof message.app !== 'string' || typeof message.modal !== 'string') return;
      lastSnapshot = message; controller = message.control ? 'guest' : 'host';
      if (frameReady) frame.contentWindow.postMessage({killteam:true, ...message}, '*');
      drawBar();
    }
    if (message.type === 'action') apply(message);
    if (message.type === 'control' && role === 'guest') {
      controller = message.control ? 'guest' : 'host'; drawBar();
      frame?.contentWindow.postMessage({killteam:true, ...message}, '*');
    }
    if (message.type === 'request' && role === 'host') drawBar('對方請求操作，請按「交給對方操作」。');
    if (message.type === 'release' && role === 'host') setControl('host');
    if (message.type === 'leave') { connected = false; drawBar('對方已結束連線。房主可結束連線後繼續本機對戰。'); }
  }
  function connection(state) {
    if (state === 'open') {
      connected = true; lastSeen = Date.now(); status('已連線！關閉此視窗即可對戰。房主可交接操作權。');
      endSignal(); room = null; drawPin(); // the room number is free again once the players are connected
      if (role === 'host') { onHost(); snapshot(); }
      else {
        onGuest?.();
        app.hidden = true; modal.hidden = true;
        frame = document.createElement('iframe'); frame.className = 'online-board'; frame.title = '連線對戰棋盤';
        frame.setAttribute('sandbox', 'allow-scripts'); frame.src = new URL('../online-board.html', import.meta.url).href;
        document.body.append(frame);
      }
      clearInterval(heartbeat);
      heartbeat = setInterval(() => {
        if (Date.now() - lastSeen > 20000) { connected = false; drawBar('對方暫時沒有回應，請結束連線後由房主重新建立房間。'); }
        send({type:'ping'});
      }, 5000);
      drawBar();
    } else if (['failed','closed','disconnected'].includes(state)) {
      if (role === 'host' && signal && !heartbeat) { dropPeer(); status(`朋友連線失敗，房號 ${room} 仍可再次加入。不同網路可能需要 TURN 中繼（進階設定）。`); return; }
      connected = false; drawBar('連線中斷。請結束連線後由房主重新建立房間；房主保留對戰。');
      status('無法連線或連線中斷。不同網路可能需要 TURN 中繼；可在進階設定填入。');
    } else if (state === 'connected' && peer?.channel?.readyState === 'open') {
      connected = true; lastSeen = Date.now(); drawBar(); if (role === 'host') snapshot();
    }
  }
  function endSignal() { clearTimeout(answerTimer); signal?.close(); signal = null; }
  function dropPeer() { const old = peer; peer = null; if (old) { old.onStatus = () => {}; old.close(); } }
  /** Give up a connection that never opened: back to the start, nothing to keep. */
  function reset(message) {
    endSignal(); dropPeer(); role = null; room = null; drawPin(); drawBar();
    if (message) status(message);
  }
  function leave() {
    endSignal(); room = null; drawPin();
    send({type:'leave'}); clearInterval(heartbeat); heartbeat = null; clearTimeout(timer);
    const oldPeer = peer; peer = null; role = null; connected = false; controller = 'host';
    if (oldPeer) { oldPeer.onStatus = () => {}; oldPeer.close(); }
    frame?.remove(); frame = null; frameReady = false; lastSnapshot = null; nodes = [];
    app.hidden = false; modal.hidden = false; dialog.close(); drawBar(); onLeave();
  }
  function iceServers() {
    const url = dialog.querySelector('[name=turn]').value.trim();
    const servers = [{urls:'stun:stun.l.google.com:19302'}];
    if (url) {
      if (!/^turns?:[^\s]+$/i.test(url)) throw new Error('TURN 位址必須以 turn: 或 turns: 開頭。');
      servers.push({urls:url, username:dialog.querySelector('[name=user]').value, credential:dialog.querySelector('[name=password]').value});
    }
    return servers;
  }
  function drawPin() {
    const box = dialog.querySelector('[data-pin]');
    if (!box) return;
    box.hidden = !room;
    box.querySelector('b').textContent = room ? room.replace(/^(\d{3})/, '$1 ') : '';
  }
  const joinLink = () => `${location.origin}${location.pathname}?join=${room}`;
  /** Host: a guest sent its connection code to our room number; answer the first one. */
  async function hostOffer(m) {
    if (m.type !== 'OFFER' || role !== 'host' || !signal || typeof m.src !== 'string') return;
    if (peer || pairing) { signal.send(m.src, 'ANSWER', {full:true}); return; }
    pairing = true;
    try {
      peer = new OnlinePeer({onMessage:receive, onStatus:connection, iceServers:iceServers()});
      status('朋友加入中，正在連線…');
      const code = await peer.answer(m.payload?.code);
      signal?.send(m.src, 'ANSWER', {code});
    } catch (error) {
      dropPeer(); status(`${error.message || '連線失敗。'}房號 ${room} 仍可再次加入。`);
    } finally { pairing = false; }
  }
  async function createRoom() {
    if (role) throw new Error('請先結束目前連線，再建立新房間。');
    iceServers(); // (checks the TURN address before taking a room number)
    role = 'host'; controller = 'host'; drawBar('建立房間中…');
    status('正在建立房間…');
    try {
      ({room, signal} = await openRoom({onMessage:hostOffer, onClose:() => { if (role === 'host' && !connected && signal) reset('與配對服務的連線中斷，請重新建立房間。'); }}));
    } catch (error) { reset(); throw error; }
    drawPin(); drawBar('等待朋友輸入房號');
    status('請朋友在「連線對戰」輸入這個房號（或傳邀請連結給他）。連上前請保持此視窗開啟。');
  }
  async function joinRoom(text) {
    const number = cleanRoomNumber(text);
    if (!number) throw new Error('請輸入 6 位數房號。');
    if (role) throw new Error('請先結束目前連線，再加入新房間。');
    const servers = iceServers();
    role = 'guest'; controller = 'host'; onGuest?.(); drawBar('加入房間中…');
    status(`正在加入房間 ${number}…`);
    try {
      signal = await guestSignal({
        onMessage: async m => {
          if (role !== 'guest' || !peer || m.src !== roomPeerId(number)) return;
          if (m.type === 'EXPIRE') return reset(`找不到房號 ${number}，請確認號碼，以及房主的視窗仍開著。`);
          if (m.type !== 'ANSWER') return;
          clearTimeout(answerTimer);
          if (m.payload?.full) return reset('這個房間已經有人加入了，請房主重新建立房間。');
          try { await peer.accept(m.payload?.code); status('已找到房間，正在連線…'); } catch (error) { reset(error.message); }
        },
        onClose: () => { if (role === 'guest' && !connected && signal) reset('與配對服務的連線中斷，請再試一次。'); },
      });
      peer = new OnlinePeer({onMessage:receive, onStatus:connection, iceServers:servers});
      const code = await peer.offer();
      signal.send(roomPeerId(number), 'OFFER', {code});
      answerTimer = setTimeout(() => { if (role === 'guest' && !connected) reset(`房號 ${number} 沒有回應，請確認號碼後再試。`); }, 20000);
    } catch (error) { reset(); throw error; }
  }
  function open() {
    if (!dialog.innerHTML) dialog.innerHTML = `<h2>連線對戰</h2>
      <p>兩人開啟同一版本網站：一人建立房間，另一人輸入房號即可。</p>
      <div class="online-rooms">
        <section><h3>開房（房主）</h3><button class="big" data-net="room">建立房間</button>
          <div class="online-pin" data-pin hidden><span>房號</span><b></b><button data-net="copylink">複製邀請連結</button></div></section>
        <section><h3>加入</h3><label>房號<input name="pin" inputmode="numeric" autocomplete="off" maxlength="7" placeholder="6 位數"></label><button class="big" data-net="enter">加入</button></section>
      </div>
      <p data-status role="status">房號只告訴一起遊玩的朋友；連上之後房號就失效。</p>
      <p>共用一張 2D 棋盤，由房主交接操作權。房主負責擲骰和存檔，請保持分頁開啟；部署使用點選特工後再點落點。</p>
      <details><summary>進階：TURN 中繼（不同網路連不上時）</summary><label>TURN 位址<input name="turn" placeholder="turn:your-server:3478"></label><label>帳號<input name="user" autocomplete="off"></label><label>密碼<input name="password" type="password" autocomplete="off"></label><p>這是你自己的 TURN 伺服器的帳號密碼，網站沒有預設帳號。未填時使用 Google STUN 嘗試直接連線；防火牆可能需要自備 TURN。設定僅保留於本次頁面。</p></details>
      <details><summary>進階：手動交換連線碼（配對服務連不上時）</summary>
      <p>房主建立邀請碼 → 訪客貼上並產生回覆碼 → 房主貼上回覆碼完成連線。</p>
      <label>收到的邀請碼或回覆碼<textarea name="received" rows="3" spellcheck="false"></textarea></label>
      <div class="online-actions"><button data-net="host">建立邀請碼</button><button data-net="join">加入並產生回覆碼</button><button data-net="accept">房主套用回覆碼</button></div>
      <label>傳給對方的碼<textarea name="outgoing" rows="3" readonly spellcheck="false"></textarea></label>
      <button data-net="copy">複製給對方</button></details>
      <button data-net="close">關閉視窗</button>`;
    drawPin();
    dialog.showModal();
  }
  async function action(e) {
    const act = e.target.closest('[data-net]')?.dataset.net;
    if (!act) return;
    if (act === 'leave') return leave();
    if (act === 'panel') return open();
    if (act === 'close') return dialog.close();
    if (act === 'control') { if (role === 'host') setControl(controller === 'host' ? 'guest' : 'host'); else send({type:controller === 'guest' ? 'release' : 'request'}); return; }
    if (busy) return;
    busy = true;
    try {
      if (act === 'copy') { await navigator.clipboard.writeText(dialog.querySelector('[name=outgoing]').value); status('已複製。'); return; }
      if (act === 'copylink') { await navigator.clipboard.writeText(joinLink()); status('邀請連結已複製，朋友打開連結就會自動加入。'); return; }
      if (act === 'room') return await createRoom();
      if (act === 'enter') return await joinRoom(dialog.querySelector('[name=pin]').value);
      const code = dialog.querySelector('[name=received]').value;
      if (act === 'accept') {
        if (role !== 'host' || !peer) throw new Error('請先建立邀請碼。');
        await peer.accept(code); status('回覆碼已套用，正在連線…'); return;
      }
      if (!['host','join'].includes(act)) return;
      if (role) throw new Error('請先結束目前連線，再建立新的邀請。');
      if (!globalThis.RTCPeerConnection) throw new Error('此瀏覽器不支援 WebRTC，請改用新版 Chrome、Edge、Firefox 或 Safari。');
      const servers = iceServers();
      role = act === 'host' ? 'host' : 'guest'; controller = 'host';
      if (role === 'guest') onGuest?.();
      peer = new OnlinePeer({onMessage:receive, onStatus:connection, iceServers:servers});
      status('正在產生連線碼…'); drawBar();
      dialog.querySelector('[name=outgoing]').value = act === 'host' ? await peer.offer() : await peer.answer(code);
      status(act === 'host' ? '請將邀請碼傳給朋友，再把朋友的回覆碼貼到上方並套用。' : '請將回覆碼傳給房主套用，保留此分頁。');
    } catch (error) {
      status(error.message || '連線失敗，請重試。');
      if (!connected && ['host','join'].includes(act)) {
        const old = peer; peer = null; role = null; if (old) { old.onStatus = () => {}; old.close(); } drawBar();
      }
    } finally { busy = false; }
  }
  bar.addEventListener('click', action); dialog.addEventListener('click', action);
  window.addEventListener('message', e => {
    if (e.source !== frame?.contentWindow || !e.data?.killteam) return;
    if (e.data.type === 'ready') { frameReady = true; if (lastSnapshot) frame.contentWindow.postMessage({killteam:true, ...lastSnapshot}, '*'); }
    if (e.data.type === 'action' && connected && controller === 'guest') send(e.data);
  });
  for (const type of ['click','input','change','pointerdown','pointerup','keydown','contextmenu']) {
    window.addEventListener(type, e => {
      if (!role || applying || bar.contains(e.target) || dialog.contains(e.target)) return;
      if (type !== 'keydown' && !app.contains(e.target) && !modal.contains(e.target)) return;
      const act = e.target.closest?.('[data-act]')?.dataset.act;
      if (!connected || role === 'guest' || controller !== 'host' || blocked.has(act)) { e.preventDefault(); e.stopImmediatePropagation(); return; }
      if (['click','change','input','keydown'].includes(type)) publish();
    }, true);
  }
  window.addEventListener('beforeunload', e => { if (connected || room) { e.preventDefault(); e.returnValue = ''; } });
  dialog.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.name === 'pin') { e.preventDefault(); dialog.querySelector('[data-net=enter]').click(); } });
  // An invitation link (?join=123456) opens the dialog and joins straight away.
  const invited = cleanRoomNumber(new URLSearchParams(location.search).get('join'));
  if (invited) {
    history.replaceState(null, '', location.pathname + location.hash);
    setTimeout(() => { open(); dialog.querySelector('[name=pin]').value = invited; dialog.querySelector('[data-net=enter]').click(); });
  }
  return {open, publish, get active() { return !!role; }, get guest() { return role === 'guest'; }, get paused() { return !!role && !connected; }};
}
