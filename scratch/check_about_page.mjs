import { spawn } from 'child_process';
import http from 'http';

const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new',
  '--remote-debugging-port=9280',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/about.html'
]);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9280/json', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });
    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Emulation.setDeviceMetricsOverride', params: { width: 375, height: 812, deviceScaleFactor: 2, mobile: true } }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      if (resp.id === 1) {
        const script = `(() => {
          const m = document.querySelector('#mainMenu');
          return {
            windowWidth: window.innerWidth,
            menuClass: m.className,
            menuDisplay: window.getComputedStyle(m).display,
            menuHeight: m.offsetHeight
          };
        })()`;
        ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: script, returnByValue: true } }));
      } else if (resp.id === 2) {
        console.log('ABOUT.HTML 375px:', resp.result.result.value);
        proc.kill();
        process.exit(0);
      }
    };
  } catch (e) {
    console.error(e);
    proc.kill();
  }
}, 2000);
