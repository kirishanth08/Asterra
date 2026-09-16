import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9234',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9234/json', (r) => {
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
        // Open hamburger menu
        ws.send(JSON.stringify({
          id: 2,
          method: 'Runtime.evaluate',
          params: { expression: `document.querySelector('.navbar-toggler').click();` }
        }));
      } else if (resp.id === 2) {
        // Wait 400ms then click the Home dropdown toggle
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 3,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                const dd = document.querySelector('#homeDropdown');
                dd.click();
                JSON.stringify({
                  ariaExpanded: dd.getAttribute('aria-expanded'),
                  classes: dd.className,
                  menuClasses: dd.nextElementSibling ? dd.nextElementSibling.className : null,
                  menuDisplay: dd.nextElementSibling ? window.getComputedStyle(dd.nextElementSibling).display : null,
                  menuVisibility: dd.nextElementSibling ? window.getComputedStyle(dd.nextElementSibling).visibility : null,
                  menuHeight: dd.nextElementSibling ? window.getComputedStyle(dd.nextElementSibling).height : null
                });
              `,
              returnByValue: true
            }
          }));
        }, 400);
      } else if (resp.id === 3) {
        console.log('After clicking Home dropdown:', resp.result.result.value);
        // Take screenshot of mobile nav with dropdown open
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 4,
            method: 'Page.captureScreenshot',
            params: { clip: { x: 0, y: 0, width: 375, height: 600, scale: 1 } }
          }));
        }, 200);
      } else if (resp.id === 4) {
        fs.writeFileSync(path.join(__dirname, 'mobile_dropdown_clicked.png'), Buffer.from(resp.result.data, 'base64'));
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
