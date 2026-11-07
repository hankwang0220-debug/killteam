// Room-number matchmaking (Kahoot-style): the host takes a short room number, the guest types it.
// The signalling service only passes the two WebRTC connection codes between the players; the game
// itself still travels peer to peer. Any PeerJS-compatible server works (the protocol is a small
// WebSocket relay), so a busier site can move to its own server by changing SIGNAL_SERVER.
export const SIGNAL_SERVER = {url: 'wss://0.peerjs.com/peerjs', key: 'peerjs'};
export const ROOM_DIGITS = 6;
const PREFIX = 'killteam-kt1-room-';

/** A random room number, e.g. "482913" (no leading zero, so it reads well aloud). */
export function newRoomNumber() {
  const n = new Uint32Array(1); crypto.getRandomValues(n);
  return String(10 ** (ROOM_DIGITS - 1) + n[0] % (9 * 10 ** (ROOM_DIGITS - 1)));
}
/** Digits only, exactly ROOM_DIGITS of them; null when the text isn't a room number. */
export function cleanRoomNumber(text) {
  const digits = String(text ?? '').replace(/[\s-]/g, '');
  return new RegExp(`^[1-9]\\d{${ROOM_DIGITS - 1}}$`).test(digits) ? digits : null;
}
export const roomPeerId = room => PREFIX + room;
const randomToken = () => [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(16).padStart(2, '0')).join('');

/** One WebSocket session on the signalling server under a chosen id. */
export class Signal {
  constructor({id, server = globalThis.KT_SIGNAL_SERVER || SIGNAL_SERVER, onMessage, onClose}) {
    this.id = id; this.onMessage = onMessage; this.onClose = onClose; this.closed = false;
    const url = `${server.url}?key=${encodeURIComponent(server.key)}&id=${encodeURIComponent(id)}&token=${randomToken()}`;
    this.ready = new Promise((resolve, reject) => {
      const timer = setTimeout(() => { reject(new Error('連不上配對服務，請稍後再試，或改用進階的手動連線碼。')); this.close(); }, 10000);
      try { this.ws = new WebSocket(url); } catch { clearTimeout(timer); reject(new Error('連不上配對服務。')); return; }
      this.ws.onmessage = e => {
        let m; try { m = JSON.parse(e.data); } catch { return; }
        if (m.type === 'OPEN') { clearTimeout(timer); resolve(); return; }
        if (m.type === 'ID-TAKEN') { clearTimeout(timer); reject(Object.assign(new Error('房號已被使用。'), {taken:true})); this.close(); return; }
        if (m.type === 'ERROR') { clearTimeout(timer); reject(new Error('配對服務拒絕連線，請稍後再試。')); this.close(); return; }
        this.onMessage?.(m);
      };
      this.ws.onerror = () => { clearTimeout(timer); reject(new Error('連不上配對服務，請稍後再試，或改用進階的手動連線碼。')); };
      this.ws.onclose = () => { clearTimeout(timer); clearInterval(this.beat); if (!this.closed) { this.closed = true; this.onClose?.(); } };
    });
    this.beat = setInterval(() => this.raw({type:'HEARTBEAT'}), 5000);
  }
  raw(message) { if (this.ws?.readyState === 1) this.ws.send(JSON.stringify(message)); }
  send(dst, type, payload) { this.raw({type, dst, payload}); }
  close() {
    this.closed = true; clearInterval(this.beat);
    try { this.ws?.close(); } catch { /* already closed */ }
  }
}

/** Host: claim a free room number (a new one if it is taken). */
export async function openRoom(options, tries = 5) {
  for (let i = 0; i < tries; i++) {
    const room = newRoomNumber();
    const signal = new Signal({...options, id:roomPeerId(room)});
    try { await signal.ready; return {room, signal}; } catch (e) { if (!e.taken) throw e; }
  }
  throw new Error('暫時找不到空房號，請再試一次。');
}
/** Guest: a throwaway id for the time it takes to exchange the connection codes. */
export async function guestSignal(options) {
  const signal = new Signal({...options, id:`killteam-kt1-guest-${randomToken()}`});
  await signal.ready; return signal;
}
