import { spawn } from 'child_process';
import http from 'http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9226',
  '--window-size=375,812',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9226/json', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.onopen = () => {
      const script = `
        new Promise(resolve => {
          const toggler = document.querySelector('.navbar-toggler');
          const menu = document.querySelector('#mainMenu');
          const homeDropdown = document.querySelector('#homeDropdown');
          const dropdownMenu = homeDropdown ? homeDropdown.nextElementSibling : null;

          toggler.click();
          
          setTimeout(() => {
            const menuStateOpen = {
              className: menu.className,
              height: window.getComputedStyle(menu).height,
              overflow: window.getComputedStyle(menu).overflow,
              rect: menu.getBoundingClientRect()
            };

            // click homeDropdown now
            homeDropdown.click();

            setTimeout(() => {
              const dropdownState = {
                expanded: homeDropdown.getAttribute('aria-expanded'),
                menuClass: dropdownMenu.className,
                display: window.getComputedStyle(dropdownMenu).display,
                position: window.getComputedStyle(dropdownMenu).position,
                rect: dropdownMenu.getBoundingClientRect(),
                items: Array.from(dropdownMenu.querySelectorAll('.dropdown-item')).map(it => ({
                  text: it.textContent,
                  rect: it.getBoundingClientRect(),
                  color: window.getComputedStyle(it).color
                }))
              };

              resolve({ menuStateOpen, dropdownState });
            }, 300);
          }, 500);
        })
      `;
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: script, awaitPromise: true, returnByValue: true } }));
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
}, 1500);
