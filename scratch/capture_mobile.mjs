import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9230',
  '--window-size=375,812',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9230/json', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    ws.onopen = () => {
      // 1. Take initial screenshot (closed hamburger)
      ws.send(JSON.stringify({
        id: 1,
        method: 'Page.captureScreenshot',
        params: { clip: { x: 0, y: 0, width: 375, height: 350, scale: 1 } }
      }));
    };

    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      if (resp.id === 1) {
        fs.writeFileSync(path.join(__dirname, 'mobile_closed.png'), Buffer.from(resp.result.data, 'base64'));
        console.log('Saved mobile_closed.png');

        // Click hamburger button to open
        ws.send(JSON.stringify({
          id: 2,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              document.querySelector('.navbar-toggler').click();
            `
          }
        }));
      } else if (resp.id === 2) {
        // Wait 500ms for transition, then capture open menu
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 3,
            method: 'Page.captureScreenshot',
            params: { clip: { x: 0, y: 0, width: 375, height: 750, scale: 1 } }
          }));
        }, 500);
      } else if (resp.id === 3) {
        fs.writeFileSync(path.join(__dirname, 'mobile_opened.png'), Buffer.from(resp.result.data, 'base64'));
        console.log('Saved mobile_opened.png');
        proc.kill();
        process.exit(0);
      }
    };
  } catch(e) {
    console.error(e);
    proc.kill();
    process.exit(1);
  }
}, 1500);
