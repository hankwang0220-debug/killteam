// Static-host compatible WebRTC transport. Signalling is exchanged by the players.
export const ONLINE_VERSION = 'kt-table-v1';
const LIMIT = 4 * 1024 * 1024;
export function encodeSignal(description) {
  return 'KT1.' + btoa(JSON.stringify({version: ONLINE_VERSION, type: description.type, sdp: description.sdp}));
}
export function decodeSignal(code, type) {
  if (typeof code !== 'string' || code.length > 100000) throw new Error('邀請碼過長。');
  let signal;
  try { signal = JSON.parse(atob(code.trim().replace(/^KT1\./, ''))); } catch { throw new Error('邀請碼格式不正確，請完整複製。'); }
  if (signal.version !== ONLINE_VERSION) throw new Error('連線版本不同，請雙方重新整理網站。');
  if (signal.type !== type || typeof signal.sdp !== 'string' || !signal.sdp.startsWith('v=0')) throw new Error('邀請碼／回覆碼種類不正確。');
  return {type, sdp: signal.sdp};
}

export class OnlinePeer {
  constructor({onMessage, onStatus, iceServers = [{urls: 'stun:stun.l.google.com:19302'}]}) {
    this.onMessage = onMessage;
    this.onStatus = onStatus;
    this.pc = new RTCPeerConnection({iceServers});
    this.pc.ondatachannel = e => this.bind(e.channel);
    this.pc.onconnectionstatechange = () => this.onStatus(this.pc.connectionState);
    this.queue = []; this.parts = []; this.size = 0;
  }
  bind(channel) {
    if (this.channel) { channel.close(); return; }
    this.channel = channel;
    channel.bufferedAmountLowThreshold = 128 * 1024;
    channel.onbufferedamountlow = () => this.flush();
    channel.onopen = () => this.onStatus('open');
    channel.onclose = () => this.onStatus('closed');
    channel.onerror = () => this.onStatus('failed');
    channel.onmessage = e => {
      try {
        if (typeof e.data !== 'string' || e.data.length > 16000) throw new Error('packet');
        const packet = JSON.parse(e.data);
        if (typeof packet.part !== 'string') throw new Error('packet');
        this.size += packet.part.length;
        if (this.size > LIMIT || this.parts.length > 1000) throw new Error('size');
        this.parts.push(packet.part);
        if (packet.end) {
          const message = JSON.parse(this.parts.join(''));
          this.parts = []; this.size = 0;
          this.onMessage(message);
        }
      } catch { this.close(); this.onStatus('failed'); }
    };
  }
  send(message) {
    if (this.channel?.readyState !== 'open') return false;
    const data = JSON.stringify(message);
    if (data.length > LIMIT) throw new Error('對戰資料過大，請結束連線後繼續本機遊戲。');
    if (this.queue.length > 1500) { this.close(); return false; }
    for (let i = 0; i < data.length; i += 3000) this.queue.push(JSON.stringify({part:data.slice(i, i + 3000), end:i + 3000 >= data.length}));
    this.flush(); return true;
  }
  flush() {
    while (this.queue.length && this.channel?.readyState === 'open' && this.channel.bufferedAmount < 256 * 1024) this.channel.send(this.queue.shift());
  }
  async gathered() {
    if (this.pc.iceGatheringState === 'complete') return;
    await new Promise((resolve, reject) => {
      const finish = error => { clearTimeout(timer); this.pc.removeEventListener('icegatheringstatechange', change); error ? reject(error) : resolve(); };
      const change = () => { if (this.pc.iceGatheringState === 'complete') finish(); };
      const timer = setTimeout(() => finish(new Error('收集連線位址逾時，請重試或設定 TURN。')), 20000);
      this.pc.addEventListener('icegatheringstatechange', change);
      change();
    });
  }
  async offer() {
    this.bind(this.pc.createDataChannel('killteam', {ordered:true}));
    await this.pc.setLocalDescription(await this.pc.createOffer());
    await this.gathered(); return encodeSignal(this.pc.localDescription);
  }
  async answer(code) {
    await this.pc.setRemoteDescription(decodeSignal(code, 'offer'));
    await this.pc.setLocalDescription(await this.pc.createAnswer());
    await this.gathered(); return encodeSignal(this.pc.localDescription);
  }
  async accept(code) { await this.pc.setRemoteDescription(decodeSignal(code, 'answer')); }
  close() { this.queue = []; this.channel?.close(); this.pc.close(); }
}
