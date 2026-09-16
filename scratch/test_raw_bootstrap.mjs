import { spawn } from 'child_process';
import http from 'http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9252',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9252/json', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({
        id: 2,
        method: 'Emulation.setDeviceMetricsOverride',
        params: { width: 375, height: 812, deviceScaleFactor: 2, mobile: true }
      }));
    };

    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      if (resp.method === 'Runtime.consoleAPICalled') {
        console.log('BROWSER CONSOLE:', resp.params.args.map(a => a.value));
      }
      if (resp.id === 2) {
        setTimeout(() => {
          const script = `
            (() => {
              const dd = document.querySelector('#homeDropdown');
              const m = dd.closest('.dropdown').querySelector('.dropdown-menu');
              
              console.log('Bootstrap available:', typeof bootstrap);
              if (typeof bootstrap !== 'undefined') {
                const bsDd = bootstrap.Dropdown.getOrCreateInstance(dd);
                console.log('bsDd created:', !!bsDd);
                bsDd.show();
                console.log('after bsDd.show(), m classes:', m.className);
                console.log('m display style:', window.getComputedStyle(m).display);
                console.log('m offsetParent:', !!m.offsetParent);
              }
            })()
          `;
          ws.send(JSON.stringify({
            id: 3,
            method: 'Runtime.evaluate',
            params: { expression: script }
          }));
        }, 300);
      } else if (resp.id === 3) {
        setTimeout(() => {
          proc.kill();
          process.exit(0);
        }, 500);
      }
    };
  } catch(e) {
    console.error(e);
    proc.kill();
    process.exit(1);
  }
}, 1000);
