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

async function captureAllCards() {
  const port = 9290;
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    '--window-size=768,1024',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_all_cards_${port}`,
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
        width: 768,
        height: 1024,
        deviceScaleFactor: 1,
        mobile: true
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

      // Let images render
      await new Promise(r => setTimeout(r, 600));

      const info = await send('Runtime.evaluate', {
        expression: `
          JSON.stringify(Array.from(document.querySelectorAll('.service-row')).map((c, i) => {
            const r = c.getBoundingClientRect();
            const h3 = c.querySelector('h3');
            return {
              i,
              title: h3 ? h3.innerText : '',
              top: r.top,
              height: r.height,
              imgW: c.querySelector('img').offsetWidth,
              imgH: c.querySelector('img').offsetHeight
            };
          }), null, 2)
        `,
        returnByValue: true
      });
      const raw = info.result.result ? info.result.result.value : info.result.value;
      console.log('All cards info:', raw);
      const cards = JSON.parse(raw);

      // Screenshot Card 0
      const shot0 = await send('Page.captureScreenshot', {
        captureBeyondViewport: true,
        clip: {
          x: 0,
          y: Math.max(0, cards[0].top - 20),
          width: 768,
          height: cards[0].height + 40,
          scale: 1
        }
      });
      fs.writeFileSync('scratch/service_01_hand_pen_verified.png', Buffer.from(shot0.result.data, 'base64'));

      proc.kill();
      resolve();
    });
  });
}

captureAllCards();
