import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, ['--headless=new', '--remote-debugging-port=9375', '--window-size=1440,900', 'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/documents.html']);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9375/json', (r) => {
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
        params: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }
      }));
    };

    ws.onmessage = async (msg) => {
      const resp = JSON.parse(msg.data);

      if (resp.id === 1) {
        // Scroll directly to doc-band
        const script = `
          (() => {
            const el = document.querySelector('.doc-band') || document.querySelector('.sd-dark-panel');
            if (el) {
              const rect = el.getBoundingClientRect();
              window.scrollTo(0, window.scrollY + rect.top - 80);
            }
          })()
        `;
        ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: script } }));
      } else if (resp.id === 2) {
        setTimeout(() => {
          ws.send(JSON.stringify({ id: 3, method: 'Page.captureScreenshot', params: { format: 'png' } }));
        }, 800);
      } else if (resp.id === 3) {
        fs.writeFileSync('scratch/documents_fixed.png', Buffer.from(resp.result.data, 'base64'));
        console.log('Saved scratch/documents_fixed.png');
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
