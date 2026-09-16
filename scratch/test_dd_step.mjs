import { spawn } from 'child_process';
import http from 'http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9250',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9250/json', (r) => {
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
          const dd = document.querySelector('#homeDropdown');
          const parent = dd.closest('.dropdown');
          const menu = parent.querySelector('.dropdown-menu');
          
          const stateBefore = {
            width: window.innerWidth,
            expanded: dd.getAttribute('aria-expanded'),
            menuClasses: menu.className
          };

          // Trigger click
          dd.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

          const stateAfter = {
            width: window.innerWidth,
            expanded: dd.getAttribute('aria-expanded'),
            menuClasses: menu.className
          };

          return { stateBefore, stateAfter };
        })()
      `;
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: script, returnByValue: true } }));
    };

    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      if (resp.id === 1) {
        console.log(JSON.stringify(resp.result.result.value, null, 2));
        proc.kill();
        process.exit(0);
      }
    };
  } catch(e) {
    console.error(e);
    proc.kill();
    process.exit(1);
  }
}, 1000);
