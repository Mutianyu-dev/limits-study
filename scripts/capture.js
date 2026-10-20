'use strict';

/**
 * 交互截图：用 Edge 的 DevTools 协议驱动无头浏览器，
 * 验证「答题 → 判分 → 错题落库 → 奖励层 → 深色模式」整条链路。
 *
 * 运行：node scripts/capture.js
 * 输出：shots/ 目录下的 PNG
 */

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const EDGE =
  process.env.EDGE || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DEBUG_PORT = 9333;
const BASE = process.env.BASE || 'http://127.0.0.1:8787';
const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(ROOT, 'shots');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.sessionId = null;
    this.events = [];
  }

  open() {
    return new Promise((resolve, reject) => {
      this.ws.addEventListener('open', () => resolve());
      this.ws.addEventListener('error', (e) => reject(e));
      this.ws.addEventListener('message', (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        } else {
          this.events.push(msg);
        }
      });
    });
  }

  send(method, params = {}, sessionId = this.sessionId) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 20000);
    });
  }
}

async function getJson(url) {
  const res = await fetch(url);
  return res.json();
}

async function waitForDebugger() {
  for (let i = 0; i < 60; i += 1) {
    try {
      return await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
    } catch {
      await sleep(250);
    }
  }
  throw new Error('无法连接 Edge 调试端口');
}

async function evaluate(cdp, expression) {
  const res = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    throw new Error('JS 异常: ' + (res.exceptionDetails.text || ''));
  }
  return res.result.value;
}

async function goto(cdp, url) {
  await cdp.send('Page.navigate', { url });
  for (let i = 0; i < 80; i += 1) {
    await sleep(120);
    const state = await evaluate(cdp, 'document.readyState');
    if (state === 'complete') break;
  }
  await sleep(700);
}

async function shot(cdp, name) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const file = path.join(SHOTS, name);
  fs.writeFileSync(file, Buffer.from(data, 'base64'));
  console.log('saved', name);
}

async function setSettings(cdp, value) {
  await evaluate(
    cdp,
    `localStorage.setItem('limits.settings.v1', ${JSON.stringify(JSON.stringify(value))}); true`
  );
}

async function main() {
  fs.mkdirSync(SHOTS, { recursive: true });
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'limits-cdp-'));
  const child = spawn(
    EDGE,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  try {
    const version = await waitForDebugger();
    const cdp = new CDP(version.webSocketDebuggerUrl);
    await cdp.open();

    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    cdp.sessionId = sessionId;
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    // 统一视口
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // 暖场：建立同源上下文，写入设置
    await goto(cdp, BASE + '/main');
    await setSettings(cdp, { theme: 'light', rewardFrequency: 3, rewardTier: 'companion' });

    // 1) 答对一题：反馈 + 判分
    await goto(cdp, BASE + '/practice?q=q-form00-08');
    await evaluate(cdp, `document.querySelector('.opt[data-key="D"]').click(); true`);
    await sleep(200);
    await evaluate(cdp, `document.querySelector('.qfoot .btn--primary').click(); true`);
    await sleep(900);
    await shot(cdp, '20-answer-correct.png');

    // 2) 答错一题：错题落库
    await goto(cdp, BASE + '/practice?q=q-concept-01');
    await evaluate(cdp, `document.querySelector('.opt[data-key="A"]').click(); true`);
    await sleep(200);
    await evaluate(cdp, `document.querySelector('.qfoot .btn--primary').click(); true`);
    await sleep(900);
    await shot(cdp, '21-answer-wrong.png');

    // 3) 错题本
    await goto(cdp, BASE + '/wrongbook');
    await shot(cdp, '22-wrongbook-filled.png');

    // 4) 奖励层（每题奖励 + 教员口吻）
    await setSettings(cdp, { theme: 'light', rewardFrequency: 1, rewardTier: 'companion' });
    await goto(cdp, BASE + '/practice?q=q-forminf-01');
    await evaluate(cdp, `document.querySelector('.opt[data-key="D"]').click(); true`);
    await sleep(200);
    await evaluate(cdp, `document.querySelector('.qfoot .btn--primary').click(); true`);
    await sleep(700);
    const rewardShown = await evaluate(
      cdp,
      "document.querySelector('.reward-layer') && document.querySelector('.reward-layer').classList.contains('show')"
    );
    console.log('reward overlay shown:', rewardShown);
    await shot(cdp, '23-reward.png');

    // 4b) 连对三题：前两题不应触发，第三题触发
    await setSettings(cdp, { theme: 'light', rewardFrequency: 3, rewardTier: 'companion' });
    await evaluate(cdp, "localStorage.setItem('limits.streak','0'); true");
    const seq = [
      ['q-form0inf-01', 'A'],
      ['q-form0inf-02', 'D'],
      ['q-form0inf-03', 'B'],
    ];
    for (let i = 0; i < seq.length; i += 1) {
      await goto(cdp, BASE + '/practice?q=' + seq[i][0]);
      await evaluate(
        cdp,
        'document.querySelector(\'.opt[data-key="' + seq[i][1] + '"]\').click(); true'
      );
      await sleep(150);
      await evaluate(cdp, "document.querySelector('.qfoot .btn--primary').click(); true");
      await sleep(500);
      const shown = await evaluate(
        cdp,
        "document.querySelector('.reward-layer') && document.querySelector('.reward-layer').classList.contains('show')"
      );
      console.log('streak step ' + (i + 1) + ': reward shown = ' + shown);
    }
    await shot(cdp, '23b-streak3.png');

    // 5) 深色主页与深色题库
    await setSettings(cdp, { theme: 'dark', rewardFrequency: 1, rewardTier: 'companion' });
    await goto(cdp, BASE + '/main');
    await shot(cdp, '24-dark-main.png');

    await goto(cdp, BASE + '/practice?q=q005');
    await shot(cdp, '25-dark-practice.png');

    await goto(cdp, BASE + '/method/flow');
    await shot(cdp, '26-dark-flow.png');

    // 6) 深色方法页与启动页
    await goto(cdp, BASE + '/?theme=dark');
    await shot(cdp, '27-dark-splash.png');

    // 7) 试听奖励：真实鼠标点击任意处应关闭
    await goto(cdp, BASE + '/main');
    await evaluate(cdp, "document.getElementById('tryReward').click(); true");
    await sleep(600);
    const previewShown = await evaluate(cdp, "!!document.querySelector('.reward-layer.show')");
    const hit = await evaluate(cdp, "document.elementFromPoint(200,200).className + '|' + getComputedStyle(document.querySelector('.reward-layer')).pointerEvents");
    await shot(cdp, '28-preview.png');
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 200, y: 200, button: 'left', clickCount: 1 }, sessionId);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 200, y: 200, button: 'left', clickCount: 1 }, sessionId);
    await sleep(120);
    // 快速再点一次：不应该穿透到「试听」把弹层重新打开
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 200, y: 200, button: 'left', clickCount: 1 }, sessionId);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 200, y: 200, button: 'left', clickCount: 1 }, sessionId);
    await sleep(900);
    const previewHidden = await evaluate(cdp, "!!document.querySelector('.reward-layer.show')");
    console.log('preview shown =', previewShown, ', hit test =', hit, ', still shown after two clicks =', previewHidden);

    await cdp.send('Target.closeTarget', { targetId });
  } finally {
    child.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
