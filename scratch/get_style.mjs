import { spawn } from 'child_process';
import http from 'http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9223',
  'file:///c:/Users/kiris/Desktop/Projects_opencode/asterra-notary-document-attestation/contact.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9223/json', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });
    
    const page = list.find(x => x.type === 'page');
    if (!page) {
      console.log('No page found');
      proc.kill();
      return;
    }
    
    console.log('WebSocket URL:', page.webSocketDebuggerUrl);
    
    // Connect via ws (we can use native WebSocket in Node 22+ if available or http endpoint)
    if (typeof WebSocket !== 'undefined') {
      const ws = new WebSocket(page.webSocketDebuggerUrl);
      ws.onopen = () => {
        // Toggle dark mode and get computed style
        const script = `
          document.body.classList.add('dark');
          const el = document.querySelector('.nav-cta');
          const cs = window.getComputedStyle(el);
          JSON.stringify({
            color: cs.color,
            backgroundColor: cs.backgroundColor,
            borderColor: cs.borderColor,
            borderWidth: cs.borderWidth,
            boxShadow: cs.boxShadow,
            className: el.className
          });
        `;
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: { expression: script }
        }));
      };
      ws.onmessage = (msg) => {
        const resp = JSON.parse(msg.data);
        if (resp.id === 1) {
          console.log('COMPUTED STYLE IN DARK MODE:');
          console.log(resp.result.result.value);
          proc.kill();
          process.exit(0);
        }
      };
    } else {
      console.log('No native WebSocket');
      proc.kill();
    }
  } catch(e) {
    console.error(e);
    proc.kill();
  }
}, 1500);
