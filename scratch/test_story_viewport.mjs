import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, ['--headless=new', '--remote-debugging-port=9360', 'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html']);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9360/json', (r) => {
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
        params: { width: 1200, height: 750, deviceScaleFactor: 2, mobile: false }
      }));
    };

    ws.onmessage = async (msg) => {
      const resp = JSON.parse(msg.data);

      if (resp.id === 1) {
        const script = `
          (() => {
            document.documentElement.style.scrollBehavior = 'auto';
            const el = document.querySelector('.story-panel');
            el.scrollIntoView({ block: 'center' });
          })()
        `;
        ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: script } }));
      } else if (resp.id === 2) {
        setTimeout(() => {
          ws.send(JSON.stringify({ id: 3, method: 'Page.captureScreenshot', params: { format: 'png' } }));
        }, 500);
      } else if (resp.id === 3) {
        fs.writeFileSync('scratch/exact_story_panel_verified.png', Buffer.from(resp.result.data, 'base64'));
        console.log('Saved exact_story_panel_verified.png');
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
