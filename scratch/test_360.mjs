import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, ['--headless=new', '--remote-debugging-port=9395', '--window-size=360,800', 'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html']);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9395/json', (r) => {
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
        params: { width: 360, height: 800, deviceScaleFactor: 2, mobile: true }
      }));
    };

    ws.onmessage = async (msg) => {
      const resp = JSON.parse(msg.data);

      if (resp.id === 1) {
        const inspectScript = `
          (() => {
            const brand = document.querySelector('.navbar-brand');
            const mark = document.querySelector('.navbar-brand .brand-mark');
            const icon = document.querySelector('.navbar-brand .brand-mark i');
            const actions = document.querySelector('.nav-header-actions');
            const nav = document.querySelector('#mainNav');
            return {
              navWidth: nav.offsetWidth,
              brandRect: brand ? brand.getBoundingClientRect() : null,
              markRect: mark ? mark.getBoundingClientRect() : null,
              markComputed: mark ? {
                display: getComputedStyle(mark).display,
                visibility: getComputedStyle(mark).visibility,
                opacity: getComputedStyle(mark).opacity,
                bg: getComputedStyle(mark).backgroundColor,
                color: getComputedStyle(mark).color
              } : null,
              iconComputed: icon ? {
                display: getComputedStyle(icon).display,
                color: getComputedStyle(icon).color,
                fontSize: getComputedStyle(icon).fontSize,
                visibility: getComputedStyle(icon).visibility
              } : null,
              actionsRect: actions ? actions.getBoundingClientRect() : null
            };
          })()
        `;
        ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: inspectScript, returnByValue: true } }));
      } else if (resp.id === 2) {
        console.log('360px Inspection:', JSON.stringify(resp.result.result.value, null, 2));
        ws.send(JSON.stringify({ id: 3, method: 'Page.captureScreenshot', params: { format: 'png' } }));
      } else if (resp.id === 3) {
        fs.writeFileSync('scratch/mobile_360_preview.png', Buffer.from(resp.result.data, 'base64'));
        console.log('Saved scratch/mobile_360_preview.png');
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
