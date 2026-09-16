import { spawn } from 'child_process';
import http from 'http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, ['--headless=new', '--remote-debugging-port=9363', 'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html']);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9363/json', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `(() => {
            const sp = document.querySelector('.story-panel');
            const wc = document.querySelector('.welcome-cta');
            return {
              spTop: sp ? sp.offsetTop : -1,
              spParentTop: sp ? sp.parentElement.offsetTop : -1,
              wcTop: wc ? wc.offsetTop : -1,
              wcBg: window.getComputedStyle(wc).backgroundImage,
              wcColor: window.getComputedStyle(wc).color,
              wcH2Color: window.getComputedStyle(wc.querySelector('h2')).color,
              bodyHeight: document.body.scrollHeight
            };
          })()`,
          returnByValue: true
        }
      }));
    };

    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      if (resp.id === 1) {
        console.log('DOM diagnostics:', resp.result.result.value);
        proc.kill();
        process.exit(0);
      }
    };
  } catch(e) {
    console.error(e);
    proc.kill();
  }
}, 1000);
