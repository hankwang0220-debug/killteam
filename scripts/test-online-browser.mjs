// Optional real-browser integration: PLAYWRIGHT_PATH may point to playwright/index.mjs;
// CHROME_PATH may point to an installed Chrome/Edge binary. No server deployment needed.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const {chromium} = await import(process.env.PLAYWRIGHT_PATH ? pathToFileURL(process.env.PLAYWRIGHT_PATH).href : 'playwright');
const root = fileURLToPath(new URL('../', import.meta.url));
const server = createServer(async (req, res) => {
  const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname === '/' ? '/index.html' : new URL(req.url, 'http://local').pathname));
  if (!path.startsWith(root.endsWith(sep) ? root : root + sep) || !['.html','.js','.css','.svg','.webmanifest'].includes(extname(path))) { res.writeHead(404).end(); return; }
  try { const bytes = await readFile(path); res.setHeader('Content-Type', ({'.js':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'})[extname(path)]); res.end(bytes); } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
let browser;
try {
  browser = await chromium.launch({headless:true, executablePath:process.env.CHROME_PATH || undefined});
  const hostContext = await browser.newContext(), guestContext = await browser.newContext();
  // Local loopback test: exercise real ICE/DTLS/SCTP without relying on public STUN uptime.
  for (const context of [hostContext, guestContext]) await context.addInitScript(() => {
    const Native = window.RTCPeerConnection;
    window.RTCPeerConnection = class extends Native { constructor() { super({iceServers:[]}); } };
  });
  const host = await hostContext.newPage(), guest = await guestContext.newPage();
  host.setDefaultTimeout(15000); guest.setDefaultTimeout(15000);
  const errors = [];
  for (const page of [host, guest]) page.on('pageerror', e => errors.push(e.message));
  const url = `http://127.0.0.1:${server.address().port}/`;
  await Promise.all([host.goto(url), guest.goto(url)]);
  await host.locator('[data-act=online]').click(); await guest.locator('[data-act=online]').click();
  await host.locator('[data-net=host]').click();
  await host.waitForFunction(() => document.querySelector('[name=outgoing]').value.startsWith('KT1.'));
  await guest.locator('[name=received]').fill(await host.locator('[name=outgoing]').inputValue());
  await guest.locator('[data-net=join]').click();
  await guest.waitForFunction(() => document.querySelector('[name=outgoing]').value.startsWith('KT1.'));
  await host.locator('[name=received]').fill(await guest.locator('[name=outgoing]').inputValue());
  await host.locator('[data-net=accept]').click();
  await host.locator('[data-net=control]').waitFor(); await guest.locator('iframe.online-board').waitFor();
  await host.locator('[data-net=close]').click(); await guest.locator('[data-net=close]').click();
  const remote = guest.frameLocator('iframe.online-board');
  await remote.locator('[data-act=setupStep]').first().waitFor();
  console.log('PASS real WebRTC connection and sandbox snapshot');
  // Host starts the setup and the guest edits a checkbox on the equipment step.
  await host.locator('[data-act=setupStep][data-step=teams]').click();
  await host.locator('[data-act=setupStep][data-step=units]').click();
  await host.locator('[data-act=setupStep][data-step=kit]').click();
  await host.locator('[data-net=control]').click();
  await guest.getByText('由你操作', {exact:true}).waitFor();
  await remote.locator('input[data-act=autoff]').check();
  await host.waitForFunction(() => document.querySelector('input[data-act=autoff]').checked && localStorage.getItem('ktAutoFF') === '1');
  await guest.locator('[data-net=control]').click();
  await host.getByText('由你操作', {exact:true}).waitFor();
  console.log('PASS remote checkbox change updates game settings');
  // Host starts a battle; guest receives the same deploy board.
  await host.locator('[data-act=start]').click();
  await remote.locator('#board').waitFor();
  assert.equal(await remote.locator('#board').getAttribute('viewBox'), await host.locator('#board').getAttribute('viewBox'));
  await host.locator('[data-net=control]').click();
  await guest.getByText('由你操作', {exact:true}).waitFor();
  const remotePage = guest.frames().find(f => f.url().includes('online-board.html'));
  const remoteClick = async selector => {
    const before = Number(await remote.locator('#remote-app').getAttribute('data-revision'));
    await remote.locator(selector).first().click();
    await remotePage.waitForFunction(rev => Number(document.querySelector('#remote-app').dataset.revision) > rev, before);
  };
  const staleAction = await remote.locator('[data-act=zone]').first().evaluate(el => ({type:'action', revision:Number(document.querySelector('#remote-app').dataset.revision), root:0, node:Number(el.dataset.netNode), event:'click'}));
  await remoteClick('[data-act=zone]');
  await host.locator('[data-act=zone]').first().waitFor({state:'detached'});
  await remote.locator('[data-act=zone]').first().waitFor({state:'detached'});
  console.log('PASS guest command changed the host game state');
  const saved = await host.evaluate(() => localStorage.getItem('kt.save'));
  const beforeStale = Number(await remote.locator('#remote-app').getAttribute('data-revision'));
  await remotePage.evaluate(message => parent.postMessage({killteam:true, ...message}, '*'), staleAction);
  await remotePage.waitForFunction(rev => Number(document.querySelector('#remote-app').dataset.revision) > rev, beforeStale);
  assert.equal(await host.evaluate(() => localStorage.getItem('kt.save')), saved, 'stale duplicate commands cannot mutate the game');
  console.log('PASS stale command rejected and current snapshot resent');
  for (let i = 0; i < 8 && await remote.locator('[data-act=depauto]').count(); i++) {
    await remoteClick('[data-act=depauto]');
    await remoteClick('[data-act=depdone]');
  }
  await remoteClick('[data-act=begin]');
  assert.equal(await host.evaluate(() => JSON.parse(localStorage.getItem('kt.save')).phase), 'initiative');
  assert.equal(await remote.locator('.initiative').count(), await host.locator('.initiative').count());
  await remoteClick('[data-act=initlock]');
  console.log('PASS remote deployment and initiative dice');
  await guest.locator('[data-net=control]').click();
  await host.getByText('由你操作', {exact:true}).waitFor();
  await guest.locator('[data-net=leave]').click();
  await host.locator('.online-bar').getByText(/結束連線|連線中斷/).first().waitFor();
  await host.locator('.online-bar [data-net=control]').waitFor({state:'detached'});
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('PASS control handoff, guest release, disconnect and browser errors');
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise(r => server.close(r));
}
