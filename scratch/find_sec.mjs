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

async function findSec() {
  const port = 9280;
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    '--window-size=1200,900',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_find_${port}`,
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

      const res = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const h2s = Array.from(document.querySelectorAll('h2')).map(h => ({
              text: h.innerText.substring(0, 30),
              top: h.getBoundingClientRect().top + window.scrollY
            }));
            const cards = Array.from(document.querySelectorAll('.home-service-card')).map(c => ({
              top: c.getBoundingClientRect().top + window.scrollY,
              left: c.getBoundingClientRect().left,
              width: c.getBoundingClientRect().width,
              height: c.getBoundingClientRect().height
            }));
            return JSON.stringify({ h2s, cards }, null, 2);
          })()
        `,
        returnByValue: true
      });
      console.log(res.result.result.value);

      const data = JSON.parse(res.result.result.value);
      const card0 = data.cards[0];

      const shot = await send('Page.captureScreenshot', {
        captureBeyondViewport: true,
        clip: {
          x: 0,
          y: card0.top - 120,
          width: 1200,
          height: 650,
          scale: 1
        }
      });
      fs.writeFileSync('scratch/home1_exact_service_cards.png', Buffer.from(shot.result.data, 'base64'));
      proc.kill();
      resolve();
    });
  });
}

findSec();
