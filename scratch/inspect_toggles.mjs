import { spawn } from 'child_process';
import http from 'http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const basePath = 'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation';
const port = 9258;

const proc = spawn(edgePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `${basePath}/index.html`
]);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get(`http://127.0.0.1:${port}/json`, r => {
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
          expression: `
            (() => {
              const tt = document.querySelector('#themeToggle');
              const rt = document.querySelector('#rtlToggle');
              return {
                ttExists: !!tt,
                ttDataset: JSON.stringify(tt ? tt.dataset : {}),
                rtExists: !!rt,
                rtDataset: JSON.stringify(rt ? rt.dataset : {}),
                scripts: Array.from(document.querySelectorAll('script')).map(s => s.src)
              };
            })()
          `,
          returnByValue: true
        }
      }));
    };

    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      if (resp.id === 1) {
        console.log('Inspect Result:', JSON.stringify(resp.result.result.value, null, 2));
        ws.close();
        proc.kill();
        process.exit(0);
      }
    };
  } catch (e) {
    console.error(e);
    proc.kill();
  }
}, 1200);
