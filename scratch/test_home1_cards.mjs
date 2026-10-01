import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

function getJson(port) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const poll = () => {
      attempts++;
      http.get(`http://127.0.0.1:${port}/json`, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', err => {
        if (attempts > 20) return reject(err);
        setTimeout(poll, 300);
      });
    };
    poll();
  });
}

async function testHome1() {
  const port = 9275;
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_test_h1_${port}`,
    'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
  ]);
  
  const list = await getJson(port);
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  
  await new Promise(resolve => {
    ws.addEventListener('open', async () => {
      let id = 1;
      const send = (m, params={}) => new Promise(r2 => {
        const curId = id++;
        const handler = ev => {
          const res = JSON.parse(ev.data);
          if (res.id === curId) { ws.removeEventListener('message', handler); r2(res); }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method: m, params }));
      });

      await send('Emulation.setDeviceMetricsOverride', {
        width: 1200,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false
      });

      await send('Runtime.evaluate', {
        expression: `
          document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('show');
            el.style.opacity = '1';
            el.style.transform = 'none';
          });
        `
      });

      const pos = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const card = document.querySelector('.home-service-card');
            const r = card.getBoundingClientRect();
            return JSON.stringify({ top: r.top, left: r.left, width: r.width, height: r.height });
          })()
        `,
        returnByValue: true
      });
      const parsed = JSON.parse(pos.result.result.value);

      const shot = await send('Page.captureScreenshot', {
        captureBeyondViewport: true,
        clip: {
          x: 0,
          y: parsed.top - 80,
          width: 1200,
          height: 650,
          scale: 1
        }
      });
      fs.writeFileSync('scratch/home1_services_section_clipped.png', Buffer.from(shot.result.data, 'base64'));
      proc.kill();
      resolve();
    });
  });
}

testHome1();
