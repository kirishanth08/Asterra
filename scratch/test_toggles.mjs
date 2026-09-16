import { spawn } from 'child_process';
import http from 'http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, ['--headless=new', '--remote-debugging-port=9380', 'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html']);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9380/json', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Log.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.method === 'Runtime.exceptionThrown') {
        console.error('EXCEPTION:', JSON.stringify(data.params.exceptionDetails, null, 2));
      }
      if (data.method === 'Log.entryAdded') {
        console.log('LOG:', data.params.entry);
      }
      if (data.id === 3) {
        console.log('EVAL RESULT:', data.result.result.value);
      }
    };

    setTimeout(() => {
      const testClick = `
        (() => {
          const t = document.getElementById('themeToggle');
          const r = document.getElementById('rtlToggle');
          const beforeTheme = document.body.className;
          const beforeDir = document.documentElement.dir;
          if (t) t.click();
          const afterTheme = document.body.className;
          if (r) r.click();
          const afterDir = document.documentElement.dir;
          return { beforeTheme, afterTheme, beforeDir, afterDir };
        })()
      `;
      ws.send(JSON.stringify({ id: 3, method: 'Runtime.evaluate', params: { expression: testClick, returnByValue: true } }));
    }, 1000);

    setTimeout(() => {
      proc.kill();
      process.exit(0);
    }, 2500);
  } catch(e) {
    console.error(e);
    proc.kill();
    process.exit(1);
  }
}, 1500);
