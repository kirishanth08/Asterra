import { spawn } from 'child_process';
import http from 'http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9250',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9250/json', (r) => {
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

    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      if (resp.id === 1) {
        setTimeout(() => {
          const script = `
            (() => {
              const dd = document.querySelector('#homeDropdown');
              const ddMenu = dd.nextElementSibling;
              
              const logs = [];
              const testFn = function(e) {
                logs.push({
                  w: window.innerWidth,
                  bs: typeof bootstrap,
                  menuExists: !!ddMenu,
                  classesBefore: ddMenu.className
                });
              };
              dd.addEventListener('click', testFn);

              dd.click();

              return {
                logs: logs,
                ddClasses: dd.className,
                ddMenuClasses: ddMenu.className
              };
            })()
          `;
          ws.send(JSON.stringify({
            id: 2,
            method: 'Runtime.evaluate',
            params: { expression: script, returnByValue: true }
          }));
        }, 300);
      } else if (resp.id === 2) {
        console.log('Trace Result:', JSON.stringify(resp.result.result.value, null, 2));
        proc.kill();
        process.exit(0);
      }
    };
  } catch(e) {
    console.error(e);
    proc.kill();
    process.exit(1);
  }
}, 1000);
