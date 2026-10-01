import { spawn } from 'child_process';
import http from 'http';

const pages = [
  { name: 'Home 1', file: 'index.html', heroSel: '.welcome-hero' },
  { name: 'Home 2', file: 'home-2.html', heroSel: '.home2-hero' },
  { name: 'Fees', file: 'fees.html', heroSel: '.fees-hero' },
  { name: 'Blog', file: 'blog.html', heroSel: '.blog-hero' },
  { name: 'Contact', file: 'contact.html', heroSel: '.contact-hero, .hero' }
];

const viewports = [
  { w: 360, h: 800 },
  { w: 768, h: 1024 },
  { w: 1024, h: 768 }
];

async function run() {
  for (const vp of viewports) {
    console.log(`\n=== VIEWPORT ${vp.w}x${vp.h} ===`);
    for (const p of pages) {
      const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
        '--headless=new',
        '--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_test_hero_' + vp.w,
        '--remote-debugging-port=9243',
        `--window-size=${vp.w},${vp.h}`,
        `file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/${p.file}`
      ]);

      await new Promise(r => setTimeout(r, 1200));

      const list = await new Promise((res, rej) => {
        http.get('http://127.0.0.1:9243/json', (r) => {
          let d = '';
          r.on('data', c => d += c);
          r.on('end', () => res(JSON.parse(d)));
        }).on('error', rej);
      });
      const page = list.find(t => t.type === 'page');
      const ws = new WebSocket(page.webSocketDebuggerUrl);

      const data = await new Promise((resolve) => {
        ws.addEventListener('open', async () => {
          let id = 1;
          const send = (m, params={}) => new Promise(r2 => {
            const curId = id++;
            const h = (event) => {
              const res = JSON.parse(event.data);
              if (res.id === curId) { ws.removeEventListener('message', h); r2(res.result); }
            };
            ws.addEventListener('message', h);
            ws.send(JSON.stringify({ id: curId, method: m, params }));
          });

          // Set viewport exactly
          await send('Emulation.setDeviceMetricsOverride', {
            width: vp.w,
            height: vp.h,
            deviceScaleFactor: 1,
            mobile: vp.w <= 768
          });

          const evaluated = await send('Runtime.evaluate', {
            returnByValue: true,
            expression: `(() => {
              const nav = document.querySelector('.site-nav');
              const navRect = nav.getBoundingClientRect();
              const hero = document.querySelector('${p.heroSel}');
              if (!hero) return { error: 'Hero not found' };
              const heroRect = hero.getBoundingClientRect();
              const heroCs = window.getComputedStyle(hero);
              const kicker = hero.querySelector('.welcome-kicker, .eyebrow, h1, .display-title');
              const kickerRect = kicker ? kicker.getBoundingClientRect() : null;
              return {
                navHeight: navRect.height,
                heroPaddingTop: heroCs.paddingTop,
                heroTop: heroRect.top,
                gapBetweenNavAndKicker: kickerRect ? (kickerRect.top - navRect.bottom) : null
              };
            })()`
          });
          resolve(evaluated.result.value);
        });
      });

      console.log(`${p.name} (${p.file}):`, data);
      proc.kill();
      await new Promise(r => setTimeout(r, 400));
    }
  }
}

run().catch(console.error);
