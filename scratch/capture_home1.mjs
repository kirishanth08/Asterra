import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new',
  '--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_full_home1',
  '--remote-debugging-port=9298',
  '--window-size=1280,1000',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
]);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9298/json', r => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });
    const page = list.find(t => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.addEventListener('open', async () => {
      let id = 1;
      const send = (m, params={}) => new Promise(r2 => {
        const curId = id++;
        const h = (event) => {
          const res = JSON.parse(event.data);
          if (res.id === curId) { ws.removeEventListener('message', h); r2(res.result); }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: curId, method: m, params }));
      });

      await send('Runtime.evaluate', {
        expression: `
          const s = document.createElement('style');
          s.textContent = '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }';
          document.head.appendChild(s);
          document.querySelectorAll('.reveal').forEach(e => e.classList.add('show'));
        `
      });
      await new Promise(r => setTimeout(r, 400));

      // 1. Scroll to Section 2 (Understand, Prepare, Complete)
      await send('Runtime.evaluate', {
        expression: `document.querySelectorAll('section.section-pad')[0].scrollIntoView({ block: 'center' });`
      });
      await new Promise(r => setTimeout(r, 400));
      let shot = await send('Page.captureScreenshot', {});
      fs.writeFileSync('scratch/home1_section2.png', Buffer.from(shot.data, 'base64'));
      console.log('Saved scratch/home1_section2.png');

      // 2. Scroll to Section 3 (Visual Services)
      await send('Runtime.evaluate', {
        expression: `document.querySelectorAll('section.section-pad')[1].scrollIntoView({ block: 'center' });`
      });
      await new Promise(r => setTimeout(r, 400));
      shot = await send('Page.captureScreenshot', {});
      fs.writeFileSync('scratch/home1_section3.png', Buffer.from(shot.data, 'base64'));
      console.log('Saved scratch/home1_section3.png');

      // 3. Scroll to Section 5 (Who We Serve)
      await send('Runtime.evaluate', {
        expression: `document.querySelectorAll('section.section-pad')[3].scrollIntoView({ block: 'center' });`
      });
      await new Promise(r => setTimeout(r, 400));
      shot = await send('Page.captureScreenshot', {});
      fs.writeFileSync('scratch/home1_section5_who_we_serve.png', Buffer.from(shot.data, 'base64'));
      console.log('Saved scratch/home1_section5_who_we_serve.png');

      proc.kill();
      process.exit(0);
    });
  } catch (err) {
    console.error(err);
    proc.kill();
    process.exit(1);
  }
}, 1500);
