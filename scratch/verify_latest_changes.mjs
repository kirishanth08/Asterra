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

async function capture(url, w, h, selector, outName) {
  const port = 9260;
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_verify_${port}_${w}`,
    url
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
        width: w,
        height: h,
        deviceScaleFactor: 1,
        mobile: w <= 768
      });

      await send('Runtime.evaluate', {
        expression: `
          document.querySelectorAll('.reveal').forEach(el => el.classList.add('show'));
          const el = document.querySelector('${selector}');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        `
      });
      await new Promise(r => setTimeout(r, 600));

      const metrics = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const card = document.querySelector('${selector}');
            if (!card) return null;
            const r = card.getBoundingClientRect();
            const img = card.querySelector('img');
            const imgR = img ? img.getBoundingClientRect() : null;
            const art = card.querySelector('.home-service-art');
            return JSON.stringify({
              card: { w: r.width, h: r.height },
              img: imgR ? { w: imgR.width, h: imgR.height, x: imgR.x, y: imgR.y } : null,
              hasArt: !!art && window.getComputedStyle(art).display !== 'none'
            });
          })()
        `,
        returnByValue: true
      });
      console.log(`[${outName}] Metrics:`, metrics.result.result.value);

      const shot = await send('Page.captureScreenshot', {});
      fs.writeFileSync(outName, Buffer.from(shot.result.data, 'base64'));
      console.log(`Saved screenshot ${outName}`);
      proc.kill();
      resolve();
    });
  });
}

(async () => {
  // 1. Home 1 Service Cards: Check icon removal and image headers
  await capture('file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html', 1200, 900, '.home-service-card', 'scratch/home1_service_cards_desktop.png');

  // 2. Services Page: Check image fitting inside container at 768px, 360px, 1200px
  await capture('file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/services.html', 768, 900, '.service-row', 'scratch/services_row_768_fixed.png');
  await capture('file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/services.html', 360, 800, '.service-row', 'scratch/services_row_360_fixed.png');
  await capture('file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/services.html', 1200, 900, '.service-row', 'scratch/services_row_1200_fixed.png');
})();
