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

async function testDesktop() {
  const port = 9265;
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_test_desk_${port}`,
    'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/services.html'
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
          document.querySelectorAll('.reveal').forEach(el => el.classList.add('show'));
          const el = document.querySelector('#services');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        `
      });
      await new Promise(r => setTimeout(r, 600));

      const metrics = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const card = document.querySelector('.service-row');
            const media = document.querySelector('.service-media');
            const img = document.querySelector('.service-media img');
            return JSON.stringify({
              card: card.getBoundingClientRect(),
              media: media.getBoundingClientRect(),
              img: img.getBoundingClientRect()
            });
          })()
        `,
        returnByValue: true
      });
      console.log('Metrics:', metrics.result.result.value);

      const shot = await send('Page.captureScreenshot', {});
      fs.writeFileSync('scratch/test_desktop_services.png', Buffer.from(shot.result.data, 'base64'));
      proc.kill();
      resolve();
    });
  });
}

testDesktop();
