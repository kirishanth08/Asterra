import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9228',
  '--window-size=1280,800',
  'file:///c:/Users/kiris/Desktop/Projects_opencode/asterra-notary-document-attestation/contact.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9228/json', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });
    
    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.onopen = () => {
      const script = `
        document.body.classList.add('dark');
        document.documentElement.classList.add('dark');
      `;
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: script } }));
    };
    
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      if (resp.id === 1) {
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 2,
            method: 'Page.captureScreenshot',
            params: {
              clip: { x: 0, y: 0, width: 1280, height: 110, scale: 1 }
            }
          }));
        }, 200);
      } else if (resp.id === 2) {
        const base64Data = resp.result.data;
        fs.writeFileSync('C:\\Users\\kiris\\Desktop\\Projects_opencode\\asterra-notary-document-attestation\\verified_dark_full.png', Buffer.from(base64Data, 'base64'));
        console.log('Saved to verified_dark_full.png');
        proc.kill();
        process.exit(0);
      }
    };
  } catch(e) {
    console.error(e);
    proc.kill();
  }
}, 1500);
