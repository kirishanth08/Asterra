import { spawn } from 'child_process';
import http from 'http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, ['--headless=new', '--remote-debugging-port=9365', 'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html']);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9365/json', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    ws.onopen = () => {
      const script = `
        (() => {
          const sp = document.querySelector('.story-panel');
          const wc = document.querySelector('.welcome-cta');
          const spH2 = sp ? sp.querySelector('h2') : null;
          const wcH2 = wc ? wc.querySelector('h2') : null;
          const spRect = sp ? sp.getBoundingClientRect() : null;
          const wcRect = wc ? wc.getBoundingClientRect() : null;
          return {
            spBg: sp ? getComputedStyle(sp).backgroundColor : null,
            spColor: sp ? getComputedStyle(sp).color : null,
            spH2Color: spH2 ? getComputedStyle(spH2).color : null,
            spRect: spRect ? { top: spRect.top + window.scrollY, left: spRect.left, width: spRect.width, height: spRect.height } : null,
            wcBg: wc ? getComputedStyle(wc).backgroundColor : null,
            wcBgImg: wc ? getComputedStyle(wc).backgroundImage : null,
            wcH2Color: wcH2 ? getComputedStyle(wcH2).color : null,
            wcRect: wcRect ? { top: wcRect.top + window.scrollY, left: wcRect.left, width: wcRect.width, height: wcRect.height } : null
          };
        })()
      `;
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: script, returnByValue: true } }));
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id === 1) {
        console.log('Results:', JSON.stringify(data.result.result.value, null, 2));
        proc.kill();
        process.exit(0);
      }
    };
  } catch(e) {
    console.error(e);
    proc.kill();
    process.exit(1);
  }
}, 1500);
