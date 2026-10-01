import { spawn } from 'child_process';
import http from 'http';

const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new',
  '--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_test_user',
  '--remote-debugging-port=9241',
  '--window-size=1280,800',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
]);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9241/json', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });
    const page = list.find(t => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.addEventListener('open', async () => {
      let id = 1;
      const send = (m, p={}) => new Promise((resolve) => {
        const curId = id++;
        const h = (event) => {
          const res = JSON.parse(event.data);
          if (res.id === curId) { ws.removeEventListener('message', h); resolve(res.result); }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: curId, method: m, params: p }));
      });
      const res = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `JSON.stringify({
          theme: {
            rect: document.getElementById('themeToggle').getBoundingClientRect(),
            height: window.getComputedStyle(document.getElementById('themeToggle')).height
          },
          rtl: {
            rect: document.getElementById('rtlToggle').getBoundingClientRect(),
            height: window.getComputedStyle(document.getElementById('rtlToggle')).height
          },
          cta: {
            rect: document.querySelector('.nav-cta').getBoundingClientRect(),
            height: window.getComputedStyle(document.querySelector('.nav-cta')).height
          }
        }, null, 2)`
      });
      console.log('RESULTS:\n', res.result.value);
      proc.kill();
      process.exit(0);
    });
  } catch (err) {
    console.error(err);
    proc.kill();
    process.exit(1);
  }
}, 1500);
