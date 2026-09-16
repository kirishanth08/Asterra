import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9256',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9256/json', (r) => {
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
        params: { width: 1200, height: 1000, deviceScaleFactor: 2, mobile: false }
      }));
    };

    ws.onmessage = async (msg) => {
      const resp = JSON.parse(msg.data);

      if (resp.id === 1) {
        // Query computed styles of navbar-brand vs footer-brand
        const styleScript = `
          (() => {
            const nb = document.querySelector('.navbar-brand');
            const fb = document.querySelector('.footer-brand');
            const nbMark = nb.querySelector('.brand-mark i');
            const fbMark = fb.querySelector('.brand-mark i');
            const nbText = nb.querySelector('.brand-name-wrap');
            const fbText = fb.querySelector('.brand-name-wrap');
            const nbSub = nb.querySelector('.brand-name-wrap small');
            const fbSub = fb.querySelector('.brand-name-wrap small');

            const cs = (el) => window.getComputedStyle(el);

            return {
              navbar: {
                bg: cs(nb).backgroundColor,
                border: cs(nb).borderColor,
                iconColor: cs(nbMark).color,
                nameColor: cs(nbText).color,
                subColor: cs(nbSub).color,
                fontFamily: cs(nbText).fontFamily,
                fontSize: cs(nbText).fontSize
              },
              footer: {
                bg: cs(fb).backgroundColor,
                border: cs(fb).borderColor,
                iconColor: cs(fbMark).color,
                nameColor: cs(fbText).color,
                subColor: cs(fbSub).color,
                fontFamily: cs(fbText).fontFamily,
                fontSize: cs(fbText).fontSize
              }
            };
          })()
        `;
        ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: styleScript, returnByValue: true } }));
      } else if (resp.id === 2) {
        console.log('COMPUTED STYLES COMPARISON:');
        console.log(JSON.stringify(resp.result.result.value, null, 2));

        // Capture navbar screenshot
        ws.send(JSON.stringify({
          id: 3,
          method: 'Page.captureScreenshot',
          params: { format: 'png', clip: { x: 0, y: 0, width: 350, height: 120, scale: 2 } }
        }));
      } else if (resp.id === 3) {
        fs.writeFileSync('scratch/unified_navbar_brand.png', Buffer.from(resp.result.data, 'base64'));
        console.log('Saved unified_navbar_brand.png');

        // Scroll to footer and capture footer brand screenshot
        const scrollScript = `
          (() => {
            const fb = document.querySelector('.footer-brand');
            fb.scrollIntoView({ block: 'center' });
            const rect = fb.getBoundingClientRect();
            return { x: Math.max(0, rect.x - 20), y: Math.max(0, rect.y - 20), width: rect.width + 40, height: rect.height + 40 };
          })()
        `;
        ws.send(JSON.stringify({ id: 4, method: 'Runtime.evaluate', params: { expression: scrollScript, returnByValue: true } }));
      } else if (resp.id === 4) {
        const rect = resp.result.result.value;
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 5,
            method: 'Page.captureScreenshot',
            params: { format: 'png', clip: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, scale: 2 } }
          }));
        }, 200);
      } else if (resp.id === 5) {
        fs.writeFileSync('scratch/unified_footer_brand.png', Buffer.from(resp.result.data, 'base64'));
        console.log('Saved unified_footer_brand.png');

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
