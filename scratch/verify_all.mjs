import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless=new',
  '--remote-debugging-port=9254',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9254/json', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    let step = 0;

    ws.onopen = () => {
      // 1. Mobile viewport 375x812
      ws.send(JSON.stringify({
        id: 1,
        method: 'Emulation.setDeviceMetricsOverride',
        params: { width: 375, height: 812, deviceScaleFactor: 2, mobile: true }
      }));
    };

    ws.onmessage = async (msg) => {
      const resp = JSON.parse(msg.data);

      if (resp.id === 1) {
        // Viewport set. Capture closed mobile header
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 2,
            method: 'Page.captureScreenshot',
            params: { format: 'png', clip: { x: 0, y: 0, width: 375, height: 180, scale: 2 } }
          }));
        }, 300);
      } else if (resp.id === 2) {
        fs.writeFileSync('scratch/final_mobile_header_closed.png', Buffer.from(resp.result.data, 'base64'));
        console.log('Saved final_mobile_header_closed.png');

        // Now open hamburger menu and open dropdown
        const openScript = `
          (() => {
            const toggler = document.querySelector('.navbar-toggler');
            toggler.click();
            const dd = document.querySelector('#homeDropdown');
            dd.click();
            return {
              menuOpen: document.querySelector('#mainMenu').classList.contains('show'),
              ddOpen: dd.nextElementSibling.classList.contains('show')
            };
          })()
        `;
        ws.send(JSON.stringify({ id: 3, method: 'Runtime.evaluate', params: { expression: openScript, returnByValue: true } }));
      } else if (resp.id === 3) {
        console.log('Menu & Dropdown Open state:', resp.result.result.value);
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 4,
            method: 'Page.captureScreenshot',
            params: { format: 'png', clip: { x: 0, y: 0, width: 375, height: 500, scale: 2 } }
          }));
        }, 300);
      } else if (resp.id === 4) {
        fs.writeFileSync('scratch/final_mobile_menu_dropdown_open.png', Buffer.from(resp.result.data, 'base64'));
        console.log('Saved final_mobile_menu_dropdown_open.png');

        // Now toggle dark mode
        const darkScript = `
          (() => {
            const themeBtn = document.querySelector('#themeToggle');
            themeBtn.click();
            return {
              isDark: document.body.classList.contains('dark')
            };
          })()
        `;
        ws.send(JSON.stringify({ id: 5, method: 'Runtime.evaluate', params: { expression: darkScript, returnByValue: true } }));
      } else if (resp.id === 5) {
        console.log('Dark mode state:', resp.result.result.value);
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 6,
            method: 'Page.captureScreenshot',
            params: { format: 'png', clip: { x: 0, y: 0, width: 375, height: 500, scale: 2 } }
          }));
        }, 300);
      } else if (resp.id === 6) {
        fs.writeFileSync('scratch/final_mobile_dark_dropdown.png', Buffer.from(resp.result.data, 'base64'));
        console.log('Saved final_mobile_dark_dropdown.png');

        // Test desktop layout
        ws.send(JSON.stringify({
          id: 7,
          method: 'Emulation.setDeviceMetricsOverride',
          params: { width: 1200, height: 800, deviceScaleFactor: 1, mobile: false }
        }));
      } else if (resp.id === 7) {
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 8,
            method: 'Page.captureScreenshot',
            params: { format: 'png', clip: { x: 0, y: 0, width: 1200, height: 220, scale: 1 } }
          }));
        }, 300);
      } else if (resp.id === 8) {
        fs.writeFileSync('scratch/final_desktop_nav.png', Buffer.from(resp.result.data, 'base64'));
        console.log('Saved final_desktop_nav.png');

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
