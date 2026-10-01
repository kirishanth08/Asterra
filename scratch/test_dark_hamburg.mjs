import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9285;
const proc = spawn(edgePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
]);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get(`http://127.0.0.1:${port}/json`, (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    let msgId = 0;
    const send = (method, params = {}) => new Promise((resolve) => {
      const id = ++msgId;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

    await new Promise(r => ws.onopen = r);
    await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });

    const evalScript = async (expr) => {
      const res = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      return res.result ? res.result.value : null;
    };

    const capture = async (name) => {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(`scratch/${name}.png`, Buffer.from(res.data, 'base64'));
    };

    // Switch to dark mode
    await evalScript(`document.querySelector('#themeToggle').click()`);
    await new Promise(r => setTimeout(r, 200));

    // Open hamburger
    await evalScript(`document.querySelector('.navbar-toggler').click()`);
    await new Promise(r => setTimeout(r, 500));
    await capture('responsive_dark_hamburg_opened');

    // Close hamburger (go back)
    await evalScript(`document.querySelector('.navbar-toggler').click()`);
    await new Promise(r => setTimeout(r, 500));
    await capture('responsive_dark_hamburg_closed');

    const s = await evalScript(`(() => {
      const m = document.querySelector('#mainMenu');
      return { display: getComputedStyle(m).display, height: m.offsetHeight };
    })()`);
    console.log('Dark mode went back result:', s);

    proc.kill();
    process.exit(0);
  } catch (e) {
    console.error(e);
    proc.kill();
    process.exit(1);
  }
}, 2000);
