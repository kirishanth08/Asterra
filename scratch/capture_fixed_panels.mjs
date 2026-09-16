import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, ['--headless=new', '--remote-debugging-port=9370', '--window-size=1440,900', 'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html']);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9370/json', (r) => {
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
        // Scroll directly to story panel
        const script = `
          (() => {
            const el = document.querySelector('.story-panel');
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
        fs.writeFileSync('scratch/story_panel_fixed.png', Buffer.from(resp.result.data, 'base64'));
        console.log('Saved scratch/story_panel_fixed.png');

        // Now scroll to welcome-cta
        const script2 = `
          (() => {
            const el = document.querySelector('.welcome-cta');
            if (el) {
              const rect = el.getBoundingClientRect();
              window.scrollTo(0, window.scrollY + rect.top - 120);
            }
          })()
        `;
        ws.send(JSON.stringify({ id: 4, method: 'Runtime.evaluate', params: { expression: script2 } }));
      } else if (resp.id === 4) {
        setTimeout(() => {
          ws.send(JSON.stringify({ id: 5, method: 'Page.captureScreenshot', params: { format: 'png' } }));
        }, 800);
      } else if (resp.id === 5) {
        fs.writeFileSync('scratch/welcome_cta_fixed.png', Buffer.from(resp.result.data, 'base64'));
        console.log('Saved scratch/welcome_cta_fixed.png');
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
