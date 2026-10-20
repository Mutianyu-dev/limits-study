'use strict';

/**
 * 移动端布局测量：打印视口、页面滚动宽度、关键容器宽度。
 * 用法：node scripts/measure.js /main 390 844
 */

const { spawn } = require('node:child_process');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

const EDGE = process.env.EDGE || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9555;
const BASE = process.env.BASE || 'http://127.0.0.1:8787';
const ROUTE = process.argv[2] || '/main';
const W = Number(process.argv[3] || 390);
const H = Number(process.argv[4] || 844);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 0;
    this.pending = new Map();
  }
  open() {
    return new Promise((resolve, reject) => {
      this.ws.addEventListener('open', () => resolve());
      this.ws.addEventListener('error', reject);
      this.ws.addEventListener('message', (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.id && this.pending.has(msg.id)) {
          const p = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) p.reject(new Error(msg.error.message));
          else p.resolve(msg.result);
        }
      });
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }
}

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'limits-measure-'));
  const child = spawn(EDGE, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ]);

  try {
    let version;
    for (let i = 0; i < 60; i += 1) {
      try {
        version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
        break;
      } catch {
        await sleep(250);
      }
    }
    const cdp = new CDP(version.webSocketDebuggerUrl);
    await cdp.open();
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: W,
      height: H,
      deviceScaleFactor: 1,
      mobile: true,
    }, sessionId);
    await cdp.send('Page.navigate', { url: BASE + ROUTE }, sessionId);
    await sleep(1500);

    const expr = `(() => {
      const r = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { left: Math.round(b.left), right: Math.round(b.right), width: Math.round(b.width) };
      };
      return JSON.stringify({
        innerWidth: window.innerWidth,
        dpr: window.devicePixelRatio,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScroll: document.body.scrollWidth,
        shell: r('.shell'),
        card: r('.card'),
        topbar: r('.topbar'),
        actions: r('.topbar-actions'),
        modules: r('.modules'),
        qcard: r('.qcard'),
        filters: r('.filters')
      }, null, 2);
    })()`;
    const out = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true }, sessionId);
    console.log(out.result.value);

    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
    const file = path.join(__dirname, '..', 'shots', 'measure.png');
    fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
    console.log('screenshot:', file);
  } finally {
    child.kill();
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
