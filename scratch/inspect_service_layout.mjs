import { spawn } from 'child_process';
import http from 'http';

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

async function inspect(w) {
  const port = 9252;
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_dbg_${port}_${w}`,
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
        height: 900,
        deviceScaleFactor: 1,
        mobile: w <= 768
      });

      const res = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const card = document.querySelector('.service-row');
            const layout = document.querySelector('.service-layout');
            const media = document.querySelector('.service-media');
            const img = document.querySelector('.service-media img');
            const rCard = card.getBoundingClientRect();
            const rLayout = layout.getBoundingClientRect();
            const rMedia = media.getBoundingClientRect();
            const rImg = img.getBoundingClientRect();
            return JSON.stringify({
              card: { w: rCard.width, h: rCard.height },
              layout: { w: rLayout.width, h: rLayout.height },
              media: { w: rMedia.width, h: rMedia.height },
              img: { w: rImg.width, h: rImg.height }
            }, null, 2);
          })()
        `,
        returnByValue: true
      });
      console.log('Result for width', w, ':\n', res.result.result.value);
      proc.kill();
      resolve();
    });
  });
}

(async () => {
  await inspect(1200);
  await inspect(360);
})();
