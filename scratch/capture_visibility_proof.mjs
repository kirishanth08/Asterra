import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function captureElement(pageName, selector, outputPath, port) {
  const url = `file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/${pageName}`;
  const proc = spawn(edgePath, ['--headless=new', `--remote-debugging-port=${port}`, url]);

  await new Promise(r => setTimeout(r, 1200));

  try {
    const list = await new Promise((res, rej) => {
      http.get(`http://127.0.0.1:${port}/json`, (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    await new Promise((resolve) => {
      ws.onopen = () => {
        ws.send(JSON.stringify({
          id: 1,
          method: 'Emulation.setDeviceMetricsOverride',
          params: { width: 1200, height: 900, deviceScaleFactor: 2, mobile: false }
        }));
      };

      ws.onmessage = (msg) => {
        const resp = JSON.parse(msg.data);
        if (resp.id === 1) {
          const scrollScript = `
            (() => {
              document.documentElement.style.scrollBehavior = 'auto';
              const el = document.querySelector('${selector}');
              el.scrollIntoView({ block: 'center' });
              const r = el.getBoundingClientRect();
              const pageX = window.scrollX + r.left;
              const pageY = window.scrollY + r.top;
              return { x: Math.max(0, pageX - 10), y: Math.max(0, pageY - 10), w: r.width + 20, h: r.height + 20 };
            })()
          `;
          ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: scrollScript, returnByValue: true } }));
        } else if (resp.id === 2) {
          const rect = resp.result.result.value;
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 3,
              method: 'Page.captureScreenshot',
              params: {
                format: 'png',
                clip: {
                  x: rect.x,
                  y: rect.y,
                  width: rect.w,
                  height: rect.h,
                  scale: 1
                }
              }
            }));
          }, 300);
        } else if (resp.id === 3) {
          fs.writeFileSync(outputPath, Buffer.from(resp.result.data, 'base64'));
          console.log(`Saved ${outputPath}`);
          proc.kill();
          resolve();
        }
      };
    });
  } catch(e) {
    console.error(e);
    proc.kill();
  }
}

async function run() {
  // 1. Index story panel (the exact image from user request)
  await captureElement('index.html', '.story-panel', 'scratch/verified_story_panel_light.png', 9350);

  // 2. Index welcome CTA
  await captureElement('index.html', '.welcome-cta', 'scratch/verified_welcome_cta_light.png', 9351);

  // 3. Home-2 doc band
  await captureElement('home-2.html', '.doc-band', 'scratch/verified_doc_band_light.png', 9352);

  // 4. Documents dark panel
  await captureElement('documents.html', '.sd-dark-panel', 'scratch/verified_sd_dark_panel_light.png', 9353);

  console.log('All verification screenshots captured!');
}

run();
