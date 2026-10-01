import { spawn } from 'child_process';
import http from 'http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9258;
const args = [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
];

const proc = spawn(edgePath, args);

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

    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Emulation.setDeviceMetricsOverride',
        params: { width: 375, height: 812, deviceScaleFactor: 2, mobile: true }
      }));
    };

    ws.onmessage = async (msg) => {
      const resp = JSON.parse(msg.data);
      if (resp.id === 1) {
        // Test with bootstrap Collapse instance or clean toggle
        const script = `
          (async () => {
            const toggler = document.querySelector('.navbar-toggler');
            const menu = document.querySelector('#mainMenu');
            
            // Let's clone toggler to remove all custom listeners and see what pure Bootstrap does
            const clone = toggler.cloneNode(true);
            toggler.parentNode.replaceChild(clone, toggler);

            const s0 = {
              hasShow: menu.classList.contains('show'),
              display: window.getComputedStyle(menu).display,
              height: menu.offsetHeight,
              className: menu.className
            };

            // Click clone
            clone.click();
            // Wait 400ms for BS transition
            await new Promise(r => setTimeout(r, 450));

            const s1 = {
              hasShow: menu.classList.contains('show'),
              display: window.getComputedStyle(menu).display,
              height: menu.offsetHeight,
              className: menu.className
            };

            // Click clone again to close
            clone.click();
            await new Promise(r => setTimeout(r, 450));

            const s2 = {
              hasShow: menu.classList.contains('show'),
              display: window.getComputedStyle(menu).display,
              height: menu.offsetHeight,
              className: menu.className
            };

            return { s0, s1, s2 };
          })()
        `;
        ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: script, awaitPromise: true, returnByValue: true } }));
      } else if (resp.id === 2) {
        console.log('BOOTSTRAP RESULT:', JSON.stringify(resp.result.result.value, null, 2));
        proc.kill();
        process.exit(0);
      }
    };
  } catch (e) {
    console.error(e);
    proc.kill();
    process.exit(1);
  }
}, 2000);
