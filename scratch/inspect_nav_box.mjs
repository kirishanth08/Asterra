import { spawn } from 'child_process';
import http from 'http';

const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new',
  '--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_nav_box',
  '--remote-debugging-port=9252',
  '--window-size=360,800',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
]);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9252/json', r => {
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

      const res = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => {
          const nav = document.querySelector('.site-nav');
          const collapse = document.querySelector('.navbar-collapse');
          const hero = document.querySelector('.welcome-hero');
          return JSON.stringify({
            navHeight: nav.getBoundingClientRect().height,
            collapseClasses: collapse.className,
            collapseDisplay: window.getComputedStyle(collapse).display,
            heroPaddingTop: hero ? window.getComputedStyle(hero).paddingTop : 'not found',
            kickerTop: hero?.querySelector('.welcome-kicker')?.getBoundingClientRect().top
          });
        })()`
      });
      console.log('RES IS:', res);
      proc.kill();
      process.exit(0);
    });
  } catch (err) {
    console.error(err);
    proc.kill();
    process.exit(1);
  }
}, 1500);
