import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

async function captureServices(w, h, outName) {
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    '--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_serv_' + w,
    '--remote-debugging-port=9246',
    `--window-size=${w},${h}`,
    'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/services.html'
  ]);
  await new Promise(r => setTimeout(r, 1200));
  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9246/json', r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(resolve => {
    ws.addEventListener('open', async () => {
      let id = 1;
      const send = (m, params={}) => new Promise(r2 => {
        const curId = id++;
        const handler = ev => {
          const res = JSON.parse(ev.data);
          if (res.id === curId) { ws.removeEventListener('message', handler); r2(res.result); }
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

      // Scroll to #services
      await send('Runtime.evaluate', {
        expression: `
          document.querySelectorAll('.reveal').forEach(el => el.classList.add('show'));
          const el = document.querySelector('#services');
          if (el) el.scrollIntoView();
        `
      });
      await new Promise(r => setTimeout(r, 500));

      const box = await send('Runtime.evaluate', {
        expression: `
          const card = document.querySelector('.service-row');
          const r = card.getBoundingClientRect();
          JSON.stringify({ x: r.x, y: r.y, w: r.width, h: r.height, top: window.scrollY + r.y });
        `,
        returnByValue: true
      });
      console.log('card dimensions:', box.value);

      const shot = await send('Page.captureScreenshot', {});
      fs.writeFileSync(outName, Buffer.from(shot.data, 'base64'));
      console.log(`Saved ${outName}`);
      proc.kill();
      resolve();
    });
  });
}

(async () => {
  await captureServices(1200, 900, 'scratch/services_1200.png');
  await captureServices(768, 1024, 'scratch/services_768.png');
  await captureServices(360, 800, 'scratch/services_360.png');
})();
