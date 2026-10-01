import { spawn } from 'child_process';
import http from 'http';

const pages = ['home-2.html', 'services.html', 'about.html', 'contact.html'];
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

for (let i = 0; i < pages.length; i++) {
  const pageName = pages[i];
  const port = 9270 + i;
  const args = [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/${pageName}`
  ];

  const proc = spawn(edgePath, args);
  await new Promise(r => setTimeout(r, 1500));

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

    await new Promise((resolve) => { ws.onopen = resolve; });
    await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });

    const evalScript = async (expr) => {
      const res = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      return res.result ? res.result.value : null;
    };

    // 1. Initial
    const s0 = await evalScript(`(() => {
      const m = document.querySelector('#mainMenu');
      return { display: getComputedStyle(m).display, height: m.offsetHeight };
    })()`);

    // 2. Open
    await evalScript(`document.querySelector('.navbar-toggler').click()`);
    await new Promise(r => setTimeout(r, 450));
    const s1 = await evalScript(`(() => {
      const m = document.querySelector('#mainMenu');
      return { display: getComputedStyle(m).display, height: m.offsetHeight };
    })()`);

    // 3. Go back (Close)
    await evalScript(`document.querySelector('.navbar-toggler').click()`);
    await new Promise(r => setTimeout(r, 450));
    const s2 = await evalScript(`(() => {
      const m = document.querySelector('#mainMenu');
      return { display: getComputedStyle(m).display, height: m.offsetHeight };
    })()`);

    console.log(`Page: ${pageName} -> Closed: ${s0.display} (${s0.height}px) | Opened: ${s1.display} (${s1.height}px) | Went back: ${s2.display} (${s2.height}px)`);

    proc.kill();
  } catch (err) {
    console.error(`Error on ${pageName}:`, err);
    proc.kill();
  }
}
