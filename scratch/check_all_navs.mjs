import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const pages = [
  'index.html', 'home-2.html', 'about.html', 'services.html', 'service-details.html',
  'fees.html', 'documents.html', 'blog.html', 'blog-details.html', 'contact.html',
  'pricing.html', 'login.html', 'register.html', '404.html', 'admin-login.html', 'admin-dashboard.html'
];

async function checkPage(pageFile) {
  const args = [
    '--headless=new',
    '--remote-debugging-port=9235',
    '--window-size=375,812',
    `file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/${pageFile}`
  ];
  const proc = spawn(edgePath, args);
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const list = await new Promise((res, rej) => {
          http.get('http://127.0.0.1:9235/json', (r) => {
            let d = '';
            r.on('data', c => d += c);
            r.on('end', () => res(JSON.parse(d)));
          }).on('error', rej);
        });
        const page = list.find(x => x.type === 'page');
        const ws = new WebSocket(page.webSocketDebuggerUrl);
        const errors = [];
        ws.onopen = () => {
          ws.send(JSON.stringify({ id: 1, method: 'Log.enable' }));
          ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
          ws.send(JSON.stringify({
            id: 3,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                (() => {
                  const toggler = document.querySelector('.navbar-toggler');
                  if (!toggler) return { foundToggler: false };
                  const targetSel = toggler.getAttribute('data-bs-target');
                  const targetEl = document.querySelector(targetSel);
                  const homeDd = document.querySelector('#homeDropdown');
                  
                  toggler.click();
                  return {
                    foundToggler: true,
                    targetSel,
                    targetFound: !!targetEl,
                    hasHomeDropdown: !!homeDd,
                    initialShow: targetEl?.classList.contains('show')
                  };
                })()
              `,
              returnByValue: true
            }
          }));
        };
        ws.onmessage = (msg) => {
          const resp = JSON.parse(msg.data);
          if (resp.method === 'Runtime.exceptionThrown') {
            errors.push(resp.params.exceptionDetails.text + ' ' + (resp.params.exceptionDetails.exception?.description || ''));
          }
          if (resp.id === 3) {
            proc.kill();
            resolve({ page: pageFile, result: resp.result?.result?.value, errors });
          }
        };
      } catch (e) {
        proc.kill();
        resolve({ page: pageFile, error: e.message });
      }
    }, 1000);
  });
}

async function run() {
  for (const p of pages) {
    const res = await checkPage(p);
    console.log(p.padEnd(22), JSON.stringify(res.result || res.error), res.errors?.length ? res.errors : '');
  }
}
run();
