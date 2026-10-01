import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new',
  '--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_full_home2',
  '--remote-debugging-port=9292',
  '--window-size=1280,1000',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/home-2.html'
]);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9292/json', r => {
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

      await new Promise(r => setTimeout(r, 600));

      const rect = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => {
          const el = document.querySelector('.split-panel');
          const box = el.getBoundingClientRect();
          return {
            x: Math.round(box.x),
            y: Math.round(box.y),
            w: Math.round(box.width),
            h: Math.round(box.height),
            scrollY: window.scrollY
          };
        })()`
      });
      console.log('SPLIT PANEL RECT:', rect.result.value);

      // Scroll so .split-panel is in viewport
      await send('Runtime.evaluate', {
        expression: `document.querySelector('.split-panel').scrollIntoView(true);`
      });
      await new Promise(r => setTimeout(r, 400));

      // Capture current viewport
      const shot = await send('Page.captureScreenshot', {});
      fs.writeFileSync('scratch/home2_viewport_split.png', Buffer.from(shot.data, 'base64'));
      console.log('Saved scratch/home2_viewport_split.png');

      // Now scroll to .doc-band
      await send('Runtime.evaluate', {
        expression: `document.querySelector('.doc-band').scrollIntoView(true);`
      });
      await new Promise(r => setTimeout(r, 400));
      const shotDoc = await send('Page.captureScreenshot', {});
      fs.writeFileSync('scratch/home2_viewport_doc.png', Buffer.from(shotDoc.data, 'base64'));
      console.log('Saved scratch/home2_viewport_doc.png');

      // Now scroll to .workflow-card section centered
      await send('Runtime.evaluate', {
        expression: `document.querySelector('.workflow-card').scrollIntoView({ block: 'center' });`
      });
      await new Promise(r => setTimeout(r, 400));
      const shotWf = await send('Page.captureScreenshot', {});
      fs.writeFileSync('scratch/home2_viewport_wf.png', Buffer.from(shotWf.data, 'base64'));
      console.log('Saved scratch/home2_viewport_wf.png');

      proc.kill();
      process.exit(0);
    });
  } catch (err) {
    console.error(err);
    proc.kill();
    process.exit(1);
  }
}, 1500);
