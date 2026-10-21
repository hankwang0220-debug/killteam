import { readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = (await readdir(new URL('../tests/', import.meta.url))).filter((f) => f.endsWith('.mjs')).sort();
let cursor = 0, passed = 0;
const failed = [];
async function worker() {
  while (cursor < files.length) {
    const file = files[cursor++];
    const result = await new Promise((resolve) => {
      const child = spawn(process.execPath, [`tests/${file}`], { cwd: root, windowsHide: true });
      let output = '', timedOut = false;
      child.stdout.on('data', (s) => { output += s; });
      child.stderr.on('data', (s) => { output += s; });
      const timer = setTimeout(() => { timedOut = true; child.kill(); }, 300_000);
      child.on('error', (error) => { clearTimeout(timer); resolve({ ok: false, output: String(error) }); });
      child.on('close', (code) => { clearTimeout(timer); resolve({ ok: code === 0 && !timedOut, output: timedOut ? `Timed out after 300s\n${output}` : output }); });
    });
    if (result.ok) { passed++; console.log(`PASS ${file}`); }
    else { failed.push(file); console.error(`FAIL ${file}\n${result.output}`); }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
console.log(`${passed}/${files.length} passed${failed.length ? `; failed: ${failed.join(', ')}` : ''}`);
process.exitCode = failed.length ? 1 : 0;
