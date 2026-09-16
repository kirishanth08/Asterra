import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9257',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9257/json', (r) => {
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
        params: { width: 1200, height: 900, deviceScaleFactor: 2, mobile: false }
      }));
    };

    ws.onmessage = async (msg) => {
      const resp = JSON.parse(msg.data);

      if (resp.id === 1) {
        // Scroll right to footer
        const script = `
          (() => {
            document.documentElement.style.scrollBehavior = 'auto';
            const fb = document.querySelector('.footer .footer-brand');
            const r = fb.getBoundingClientRect();
            const pageX = window.scrollX + r.left;
            const pageY = window.scrollY + r.top;
            return { x: pageX, y: pageY, w: r.width, h: r.height };
          })()
        `;
        setTimeout(() => {
          ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: script, returnByValue: true } }));
        }, 300);
      } else if (resp.id === 2) {
        const rect = resp.result.result.value;
        console.log('Footer brand rect after scroll:', rect);
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 3,
            method: 'Page.captureScreenshot',
            params: {
              format: 'png',
              clip: {
                x: Math.max(0, rect.x - 30),
                y: Math.max(0, rect.y - 30),
                width: rect.w + 60,
                height: rect.h + 60,
                scale: 2
              }
            }
          }));
        }, 300);
      } else if (resp.id === 3) {
        fs.writeFileSync('scratch/unified_footer_brand.png', Buffer.from(resp.result.data, 'base64'));
        console.log('Saved scratch/unified_footer_brand.png successfully');
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
