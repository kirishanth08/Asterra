import { spawn } from 'child_process';
import http from 'http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9227',
  'file:///c:/Users/kiris/Desktop/Projects_opencode/asterra-notary-document-attestation/contact.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9227/json', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });
    
    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.onopen = () => {
      const script = `
        const tt = document.getElementById('themeToggle');
        tt.click();
        JSON.stringify({
          bodyClass: document.body.className,
          navBg: window.getComputedStyle(document.querySelector('.site-nav')).backgroundColor,
          navColor: window.getComputedStyle(document.querySelector('.site-nav')).color,
          btnBg: window.getComputedStyle(document.querySelector('.nav-cta')).backgroundColor,
          btnColor: window.getComputedStyle(document.querySelector('.nav-cta')).color,
          themeLabel: document.querySelector('.theme-label')?.textContent
        });
      `;
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: script } }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      if (resp.id === 1) {
        console.log(resp.result.result.value);
        proc.kill();
        process.exit(0);
      }
    };
  } catch(e) {
    console.error(e);
    proc.kill();
  }
}, 1500);
