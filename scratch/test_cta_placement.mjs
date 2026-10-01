import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9290;
const proc = spawn(edgePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
]);

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

    await new Promise(r => ws.onopen = r);

    const evalScript = async (expr) => {
      const res = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      return res.result ? res.result.value : null;
    };

    const capture = async (name) => {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(`scratch/${name}.png`, Buffer.from(res.data, 'base64'));
    };

    // 1. Mobile 375px: Closed
    await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
    await new Promise(r => setTimeout(r, 400));

    const check375 = await evalScript(`(() => {
      const topCta = document.querySelector('.nav-header-actions .nav-cta');
      const mobileCta = document.querySelector('.mobile-nav-cta');
      const mobileCtaBtn = document.querySelector('.mobile-nav-cta a');
      const toggler = document.querySelector('.navbar-toggler');
      return {
        topCtaDisplay: topCta ? getComputedStyle(topCta).display : null,
        mobileCtaDisplay: mobileCta ? getComputedStyle(mobileCta).display : null,
        mobileCtaText: mobileCtaBtn ? mobileCtaBtn.textContent.trim() : null,
        togglerDisplay: toggler ? getComputedStyle(toggler).display : null
      };
    })()`);
    console.log('Mobile 375px (closed):', check375);
    await capture('nav_responsive_375_closed');

    // 2. Mobile 375px: Open hamburger
    await evalScript(`document.querySelector('.navbar-toggler').click()`);
    await new Promise(r => setTimeout(r, 500));
    await capture('nav_responsive_375_opened');

    const check375Open = await evalScript(`(() => {
      const menu = document.querySelector('#mainMenu');
      const mobileCtaBtn = document.querySelector('.mobile-nav-cta a');
      return {
        menuDisplay: getComputedStyle(menu).display,
        menuHeight: menu.offsetHeight,
        mobileCtaBtnVisible: mobileCtaBtn.offsetHeight > 0,
        mobileCtaBtnHeight: mobileCtaBtn.offsetHeight
      };
    })()`);
    console.log('Mobile 375px (opened):', check375Open);

    // 3. Tablet 768px: Closed & Opened
    await send('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 2, mobile: true });
    await new Promise(r => setTimeout(r, 400));
    await capture('nav_responsive_768_opened');

    // Close on 768
    await evalScript(`document.querySelector('.navbar-toggler').click()`);
    await new Promise(r => setTimeout(r, 500));
    await capture('nav_responsive_768_closed');

    const check768 = await evalScript(`(() => {
      const topCta = document.querySelector('.nav-header-actions .nav-cta');
      const menu = document.querySelector('#mainMenu');
      return {
        topCtaDisplay: topCta ? getComputedStyle(topCta).display : null,
        menuDisplay: getComputedStyle(menu).display,
        menuHeight: menu.offsetHeight
      };
    })()`);
    console.log('Tablet 768px (closed):', check768);

    // 4. Desktop 1200px: Top CTA visible, mobile CTA hidden
    await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 400));
    await capture('nav_desktop_1200');

    const check1200 = await evalScript(`(() => {
      const topCta = document.querySelector('.nav-header-actions .nav-cta');
      const mobileCta = document.querySelector('.mobile-nav-cta');
      const toggler = document.querySelector('.navbar-toggler');
      return {
        topCtaDisplay: topCta ? getComputedStyle(topCta).display : null,
        topCtaHeight: topCta ? topCta.offsetHeight : null,
        mobileCtaDisplay: mobileCta ? getComputedStyle(mobileCta).display : null,
        togglerDisplay: toggler ? getComputedStyle(toggler).display : null
      };
    })()`);
    console.log('Desktop 1200px:', check1200);

    proc.kill();
    process.exit(0);
  } catch (e) {
    console.error(e);
    proc.kill();
    process.exit(1);
  }
}, 2000);
