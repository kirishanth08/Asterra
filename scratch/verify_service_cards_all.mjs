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

async function captureServiceCard(w, h, outName) {
  const port = 9285;
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    `--window-size=${w},${h}`,
    `--remote-debugging-port=${port}`,
    `--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_srv_verify_${port}_${w}`,
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
        width: w,
        height: h,
        deviceScaleFactor: 1,
        mobile: w <= 768
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
            const card = document.querySelector('.service-row');
            const media = document.querySelector('.service-media');
            const img = document.querySelector('.service-media img');
            const r = card.getBoundingClientRect();
            const rM = media.getBoundingClientRect();
            const rI = img.getBoundingClientRect();
            return JSON.stringify({
              card: { top: r.top, left: r.left, width: r.width, height: r.height },
              media: { width: rM.width, height: rM.height },
              img: { width: rI.width, height: rI.height }
            });
          })()
        `,
        returnByValue: true
      });
      const data = JSON.parse(metrics.result.result.value);
      console.log(`[${w}px] Metrics:`, data);

      const shot = await send('Page.captureScreenshot', {
        captureBeyondViewport: true,
        clip: {
          x: 0,
          y: Math.max(0, data.card.top - 40),
          width: w,
          height: data.card.height + 80,
          scale: 1
        }
      });
      fs.writeFileSync(outName, Buffer.from(shot.result.data, 'base64'));
      proc.kill();
      resolve();
    });
  });
}

(async () => {
  await captureServiceCard(1200, 900, 'scratch/service_card_1200_final.png');
  await captureServiceCard(768, 1024, 'scratch/service_card_768_final.png');
  await captureServiceCard(360, 800, 'scratch/service_card_360_final.png');
})();
