import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9259',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9259/json', (r) => {
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
        // Capture mobile top header
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 2,
            method: 'Page.captureScreenshot',
            params: { format: 'png', clip: { x: 0, y: 0, width: 375, height: 120, scale: 2 } }
          }));
        }, 300);
      } else if (resp.id === 2) {
        fs.writeFileSync('scratch/mobile_unified_navbar.png', Buffer.from(resp.result.data, 'base64'));
        console.log('Saved mobile_unified_navbar.png');

        // Scroll to footer in mobile
        const scrollScript = `
          (() => {
            document.documentElement.style.scrollBehavior = 'auto';
            const fb = document.querySelector('.footer .footer-brand');
            fb.scrollIntoView({ block: 'center' });
          })()
        `;
        ws.send(JSON.stringify({ id: 3, method: 'Runtime.evaluate', params: { expression: scrollScript } }));
      } else if (resp.id === 3) {
        setTimeout(() => {
          ws.send(JSON.stringify({ id: 4, method: 'Page.captureScreenshot', params: { format: 'png' } }));
        }, 300);
      } else if (resp.id === 4) {
        fs.writeFileSync('scratch/mobile_unified_footer.png', Buffer.from(resp.result.data, 'base64'));
        console.log('Saved mobile_unified_footer.png');
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
