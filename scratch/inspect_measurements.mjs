import { spawn } from 'child_process';
import http from 'http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, ['--headless=new', '--remote-debugging-port=9385', 'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html']);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9385/json', (r) => {
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
          const sc = document.querySelector('.story-copy');
          const eye = sc ? sc.querySelector('.eyebrow') : null;
          const h2 = sc ? sc.querySelector('h2') : null;
          const p = sc ? sc.querySelector('p') : null;
          const ul = sc ? sc.querySelector('ul') : null;
          const btn = sc ? sc.querySelector('.btn') : null;
          return {
            scPad: sc ? getComputedStyle(sc).padding : null,
            eyeMargin: eye ? getComputedStyle(eye).margin : null,
            eyeDisplay: eye ? getComputedStyle(eye).display : null,
            h2Margin: h2 ? getComputedStyle(h2).margin : null,
            h2LineHeight: h2 ? getComputedStyle(h2).lineHeight : null,
            pMargin: p ? getComputedStyle(p).margin : null,
            ulMargin: ul ? getComputedStyle(ul).margin : null,
            btnMargin: btn ? getComputedStyle(btn).margin : null
          };
        })()
      `;
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: script, returnByValue: true } }));
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id === 1) {
        console.log('Story Copy Measurements:', JSON.stringify(data.result.result.value, null, 2));
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
