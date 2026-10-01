import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9266;
const args = [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get(`http://127.0.0.1:${port}/json`, (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    let msgId = 0;
    const send = (method, params = {}) => new Promise((resolve) => {
      const id = ++msgId;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

    ws.onopen = async () => {
      // 1. Mobile viewport
      await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });

      // Scenario 1: Toggle Open -> Screenshot 1
      const evalScript = async (expr) => {
        const res = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
        return res.result ? res.result.value : null;
      };

      const capture = async (name) => {
        const res = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(`scratch/${name}.png`, Buffer.from(res.data, 'base64'));
      };

      console.log('--- Step 1: Initial closed state ---');
      const s0 = await evalScript(`(() => {
        const m = document.querySelector('#mainMenu');
        const t = document.querySelector('.navbar-toggler');
        return { display: getComputedStyle(m).display, height: m.offsetHeight, expanded: t.getAttribute('aria-expanded') };
      })()`);
      console.log('Initial:', s0);
      await capture('responsive_hamburg_1_initial_closed');

      console.log('--- Step 2: Click toggler to OPEN ---');
      await evalScript(`document.querySelector('.navbar-toggler').click()`);
      await new Promise(r => setTimeout(r, 500));
      const s1 = await evalScript(`(() => {
        const m = document.querySelector('#mainMenu');
        const t = document.querySelector('.navbar-toggler');
        return { display: getComputedStyle(m).display, height: m.offsetHeight, expanded: t.getAttribute('aria-expanded') };
      })()`);
      console.log('Opened:', s1);
      await capture('responsive_hamburg_2_opened');

      console.log('--- Step 3: Click toggler to GO BACK (CLOSE) ---');
      await evalScript(`document.querySelector('.navbar-toggler').click()`);
      await new Promise(r => setTimeout(r, 500));
      const s2 = await evalScript(`(() => {
        const m = document.querySelector('#mainMenu');
        const t = document.querySelector('.navbar-toggler');
        return { display: getComputedStyle(m).display, height: m.offsetHeight, expanded: t.getAttribute('aria-expanded') };
      })()`);
      console.log('Closed (went back):', s2);
      await capture('responsive_hamburg_3_closed_went_back');

      console.log('--- Step 4: Re-open and open Dropdown ---');
      await evalScript(`document.querySelector('.navbar-toggler').click()`);
      await new Promise(r => setTimeout(r, 500));
      await evalScript(`document.querySelector('#homeDropdown').click()`);
      await new Promise(r => setTimeout(r, 300));
      const s3 = await evalScript(`(() => {
        const dd = document.querySelector('#homeDropdown');
        const ddm = dd.nextElementSibling;
        return { ddExpanded: dd.getAttribute('aria-expanded'), ddmDisplay: getComputedStyle(ddm).display, ddmHeight: ddm.offsetHeight };
      })()`);
      console.log('Dropdown opened:', s3);
      await capture('responsive_hamburg_4_dropdown_opened');

      console.log('--- Step 5: Click toggler with Dropdown open to GO BACK ---');
      await evalScript(`document.querySelector('.navbar-toggler').click()`);
      await new Promise(r => setTimeout(r, 500));
      const s4 = await evalScript(`(() => {
        const m = document.querySelector('#mainMenu');
        const t = document.querySelector('.navbar-toggler');
        return { display: getComputedStyle(m).display, height: m.offsetHeight, expanded: t.getAttribute('aria-expanded') };
      })()`);
      console.log('Closed from dropdown state:', s4);
      await capture('responsive_hamburg_5_closed_from_dropdown');

      console.log('--- Step 6: Test outside click closes menu ---');
      await evalScript(`document.querySelector('.navbar-toggler').click()`);
      await new Promise(r => setTimeout(r, 500));
      // Click on hero
      await evalScript(`document.querySelector('.welcome-title').click()`);
      await new Promise(r => setTimeout(r, 500));
      const s5 = await evalScript(`(() => {
        const m = document.querySelector('#mainMenu');
        const t = document.querySelector('.navbar-toggler');
        return { display: getComputedStyle(m).display, height: m.offsetHeight, expanded: t.getAttribute('aria-expanded') };
      })()`);
      console.log('Closed via outside click:', s5);
      await capture('responsive_hamburg_6_closed_via_outside_click');

      proc.kill();
      process.exit(0);
    };
  } catch (e) {
    console.error(e);
    proc.kill();
    process.exit(1);
  }
}, 2000);
