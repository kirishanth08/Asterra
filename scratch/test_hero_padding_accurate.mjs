import { spawn } from 'child_process';
import http from 'http';

const pages = [
  { name: 'Home 1', file: 'index.html', heroSel: '.welcome-hero' },
  { name: 'Home 2', file: 'home-2.html', heroSel: '.home2-hero' },
  { name: 'Fees', file: 'fees.html', heroSel: '.fees-hero' },
  { name: 'Blog', file: 'blog.html', heroSel: '.blog-hero' },
  { name: 'Contact', file: 'contact.html', heroSel: '.contact-hero' }
];

const viewports = [
  { w: 360, h: 800 },
  { w: 768, h: 1024 },
  { w: 1024, h: 768 }
];

async function check() {
  for (const vp of viewports) {
    console.log(`\n=================== VIEWPORT ${vp.w}x${vp.h} ===================`);
    for (const p of pages) {
      const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
        '--headless=new',
        `--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_hero_${vp.w}_${p.name.replace(/\s+/g, '')}`,
        '--remote-debugging-port=9250',
        `--window-size=${vp.w},${vp.h}`,
        `file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/${p.file}`
      ]);

      await new Promise(r => setTimeout(r, 1200));

      const list = await new Promise((res, rej) => {
        http.get('http://127.0.0.1:9250/json', (r) => {
          let d = '';
          r.on('data', c => d += c);
          r.on('end', () => res(JSON.parse(d)));
        }).on('error', rej);
      });
      const page = list.find(t => t.type === 'page');
      const ws = new WebSocket(page.webSocketDebuggerUrl);

      const result = await new Promise((resolve) => {
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

          const evaluated = await send('Runtime.evaluate', {
            returnByValue: true,
            expression: `(() => {
              const nav = document.querySelector('.site-nav');
              const navRect = nav.getBoundingClientRect();
              const hero = document.querySelector('${p.heroSel}');
              const kicker = hero.querySelector('.welcome-kicker, .home2-kicker, .eyebrow, h1, .display-title, .home2-title');
              const kickerRect = kicker ? kicker.getBoundingClientRect() : null;
              const cs = window.getComputedStyle(hero);
              return {
                navHeight: Math.round(navRect.height),
                paddingTop: cs.paddingTop,
                kickerTop: kickerRect ? Math.round(kickerRect.top) : null,
                clearanceBelowNav: kickerRect ? Math.round(kickerRect.top - navRect.bottom) : null
              };
            })()`
          });
          resolve(evaluated.result.value);
        });
      });

      console.log(`${p.name.padEnd(8)}: Nav=${result.navHeight}px, PaddingTop=${result.paddingTop}, ClearanceBelowNav=${result.clearanceBelowNav}px`);
      proc.kill();
      await new Promise(r => setTimeout(r, 300));
    }
  }
}

check().catch(console.error);
