import { spawn } from 'child_process';
import http from 'http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const basePath = 'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation';
const port = 9257;

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
              // 1. Clear storage
              localStorage.clear();
              location.reload();
            })()
          `,
          awaitPromise: true
        }
      }));
    };

    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      if (resp.id === 1) {
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 2,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                (() => {
                  const tt = document.querySelector('#themeToggle');
                  const rt = document.querySelector('#rtlToggle');
                  const beforeDark = document.body.classList.contains('dark');
                  tt.click();
                  const afterDark = document.body.classList.contains('dark');
                  tt.click();
                  const afterDark2 = document.body.classList.contains('dark');

                  const beforeRTL = document.documentElement.getAttribute('dir') || 'ltr';
                  rt.click();
                  const afterRTL = document.documentElement.getAttribute('dir');
                  rt.click();
                  const afterRTL2 = document.documentElement.getAttribute('dir') || 'ltr';

                  return {
                    beforeDark, afterDark, afterDark2,
                    beforeRTL, afterRTL, afterRTL2
                  };
                })()
              `,
              returnByValue: true
            }
          }));
        }, 1000);
      } else if (resp.id === 2) {
        console.log('Toggle test result:', JSON.stringify(resp, null, 2));
        ws.close();
        proc.kill();
        process.exit(0);
      }
    };
  } catch (err) {
    console.error(err);
    proc.kill();
    process.exit(1);
  }
}, 1200);
