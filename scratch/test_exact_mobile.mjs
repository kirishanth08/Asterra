import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9233',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9233/json', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    ws.onopen = () => {
      // Set device emulation to exact 375x812
      ws.send(JSON.stringify({
        id: 1,
        method: 'Emulation.setDeviceMetricsOverride',
        params: {
          width: 375,
          height: 812,
          deviceScaleFactor: 2,
          mobile: true
        }
      }));
    };

    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      if (resp.id === 1) {
        // Evaluate positions and test toggler and dropdown
        const script = `
          (() => {
            const container = document.querySelector('.site-nav .container');
            const brand = document.querySelector('.navbar-brand');
            const toggler = document.querySelector('.navbar-toggler');
            const getRect = el => el ? { x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height } : null;
            return {
              windowWidth: window.innerWidth,
              container: getRect(container),
              brand: getRect(brand),
              toggler: getRect(toggler)
            };
          })()
        `;
        ws.send(JSON.stringify({
          id: 2,
          method: 'Runtime.evaluate',
          params: { expression: script, returnByValue: true }
        }));
      } else if (resp.id === 2) {
        console.log('Metrics at 375px:', JSON.stringify(resp.result.result.value, null, 2));
        // Take screenshot of mobile nav closed
        ws.send(JSON.stringify({
          id: 3,
          method: 'Page.captureScreenshot',
          params: { clip: { x: 0, y: 0, width: 375, height: 200, scale: 1 } }
        }));
      } else if (resp.id === 3) {
        fs.writeFileSync(path.join(__dirname, 'exact_mobile_375.png'), Buffer.from(resp.result.data, 'base64'));
        proc.kill();
        process.exit(0);
      }
    };
  } catch(e) {
    console.error(e);
    proc.kill();
    process.exit(1);
  }
}, 1200);
