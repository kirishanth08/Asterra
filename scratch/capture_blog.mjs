import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

async function captureBlog(w, h, outName) {
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    '--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_blog_' + w,
    '--remote-debugging-port=9245',
    `--window-size=${w},${h}`,
    'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/blog.html'
  ]);
  await new Promise(r => setTimeout(r, 1200));
  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9245/json', r => {
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

      const shot = await send('Page.captureScreenshot', {
        clip: { x: 0, y: 0, width: w, height: 1200, scale: 1 }
      });
      fs.writeFileSync(outName, Buffer.from(shot.data, 'base64'));
      console.log(`Saved ${outName}`);
      proc.kill();
      resolve();
    });
  });
}

(async () => {
  await captureBlog(360, 800, 'scratch/blog_360.png');
  await captureBlog(768, 1024, 'scratch/blog_768.png');
})();
