import { spawn } from 'child_process';
import http from 'http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9224',
  'file:///c:/Users/kiris/Desktop/Projects_opencode/asterra-notary-document-attestation/contact.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9224/json', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });
    
    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.onopen = () => {
      // Evaluate in light mode first, then in dark mode
      const script = `
        function getInfo() {
          const el = document.querySelector('.nav-cta');
          const cs = window.getComputedStyle(el);
          return {
            color: cs.color,
            bg: cs.backgroundColor,
            bgImage: cs.backgroundImage,
            border: cs.border,
            opacity: cs.opacity,
            matchedRules: Array.from(document.styleSheets).flatMap(sheet => {
              try {
                return Array.from(sheet.cssRules).filter(r => r.selectorText && el.matches(r.selectorText)).map(r => ({ sel: r.selectorText, cssText: r.cssText }));
              } catch(e) { return []; }
            })
          };
        }
        const light = getInfo();
        document.body.classList.add('dark');
        const dark = getInfo();
        JSON.stringify({ light, dark }, null, 2);
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
