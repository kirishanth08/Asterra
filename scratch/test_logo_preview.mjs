import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9237',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9237/json', (r) => {
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
        // Inject preview style for brand logo
        const script = `
          const style = document.createElement('style');
          style.innerHTML = \`
            .navbar-brand {
              background: transparent !important;
              border: none !important;
              box-shadow: none !important;
              padding: 4px 0 !important;
            }
            .navbar-brand .brand-mark {
              background: transparent !important;
              border: 1.5px solid #c7a25b !important;
              color: #0b706d !important;
              width: 44px !important;
              height: 44px !important;
              display: grid !important;
              place-items: center !important;
              border-radius: 50% !important;
            }
            .navbar-brand .brand-mark i {
              color: #0b706d !important;
              font-size: 1.25rem !important;
            }
            .navbar-brand .brand-name-wrap {
              color: #14283d !important;
              font-family: Georgia, serif !important;
              font-weight: 700 !important;
              font-size: 1.25rem !important;
              line-height: 1.05 !important;
            }
            .navbar-brand .brand-name-wrap small {
              color: #5f6d76 !important;
              display: block !important;
              font-size: 0.52rem !important;
              letter-spacing: 0.16em !important;
              text-transform: uppercase !important;
              margin-top: 3px !important;
            }
          \`;
          document.head.appendChild(style);
        `;
        ws.send(JSON.stringify({
          id: 2,
          method: 'Runtime.evaluate',
          params: { expression: script }
        }));
      } else if (resp.id === 2) {
        ws.send(JSON.stringify({
          id: 3,
          method: 'Page.captureScreenshot',
          params: { clip: { x: 0, y: 0, width: 375, height: 180, scale: 1 } }
        }));
      } else if (resp.id === 3) {
        fs.writeFileSync(path.join(__dirname, 'brand_light_preview.png'), Buffer.from(resp.result.data, 'base64'));
        console.log('Saved brand_light_preview.png');
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
