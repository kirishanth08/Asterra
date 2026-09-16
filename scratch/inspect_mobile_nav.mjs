import { spawn } from 'child_process';
import http from 'http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9232',
  '--window-size=375,812',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9232/json', (r) => {
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
          const container = document.querySelector('.site-nav .container');
          const brand = document.querySelector('.navbar-brand');
          const toggler = document.querySelector('.navbar-toggler');
          const getRect = el => el ? { x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height } : null;
          return {
            windowWidth: window.innerWidth,
            bodyScrollWidth: document.body.scrollWidth,
            container: getRect(container),
            brand: getRect(brand),
            toggler: getRect(toggler),
            togglerStyles: toggler ? {
              display: window.getComputedStyle(toggler).display,
              visibility: window.getComputedStyle(toggler).visibility,
              right: window.getComputedStyle(toggler).right,
              color: window.getComputedStyle(toggler).color,
              borderColor: window.getComputedStyle(toggler).borderColor
            } : null
          };
        })()
      `;
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: script, returnByValue: true }
      }));
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
}, 1200);
