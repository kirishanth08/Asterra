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

async function captureSection2() {
  const port = 9278;
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_list_${port}`,
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

      const metrics = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const sec = document.querySelectorAll('section')[2];
            const r = sec.getBoundingClientRect();
            return JSON.stringify({ top: r.top, height: r.height });
          })()
        `,
        returnByValue: true
      });
      const parsed = JSON.parse(metrics.result.result.value);
      console.log('Section 2 at 1200px:', parsed);

      const shot = await send('Page.captureScreenshot', {
        captureBeyondViewport: true,
        clip: {
          x: 0,
          y: parsed.top,
          width: 1200,
          height: parsed.height,
          scale: 1
        }
      });
      fs.writeFileSync('scratch/home1_section3_complete.png', Buffer.from(shot.result.data, 'base64'));
      proc.kill();
      resolve();
    });
  });
}

captureSection2();
