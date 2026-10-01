import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const outDir = 'scratch/verification_proofs';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function captureElement(url, width, height, selector, fileName) {
  const port = 9260 + Math.floor(Math.random() * 100);
  const userDir = `C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_elem_${port}`;
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    `--user-data-dir=${userDir}`,
    `--remote-debugging-port=${port}`,
    `--window-size=${width},${height}`,
    url
  ]);

  let list = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      list = await new Promise((res, rej) => {
        const req = http.get(`http://127.0.0.1:${port}/json`, r => {
          let d = '';
          r.on('data', c => d += c);
          r.on('end', () => res(JSON.parse(d)));
        });
        req.on('error', rej);
      });
      if (list && list.length > 0) break;
    } catch (_) {}
  }
  try {
    const page = list.find(t => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
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

        await send('Emulation.setDeviceMetricsOverride', {
          width,
          height,
          deviceScaleFactor: 1,
          mobile: width <= 768
        });

        // Show all reveals instantly without transition delay
        await send('Runtime.evaluate', {
          expression: `
            const s = document.createElement('style');
            s.textContent = '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }';
            document.head.appendChild(s);
            document.querySelectorAll('.reveal').forEach(e => e.classList.add('show'));
          `
        });

        await new Promise(r => setTimeout(r, 500));

        // Get absolute document bounding rect of selector
        const rectRes = await send('Runtime.evaluate', {
          returnByValue: true,
          expression: `(() => {
            const el = document.querySelector('${selector}');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return {
              x: Math.max(0, Math.floor(window.scrollX + r.x)),
              y: Math.max(0, Math.floor(window.scrollY + r.y)),
              width: Math.min(width, Math.ceil(r.width)),
              height: Math.ceil(r.height)
            };
          })()`
        });

        const r = rectRes.value;
        let clipParams;
        if (r && r.width > 0 && r.height > 0) {
          clipParams = { x: r.x, y: r.y, width: r.width, height: r.height, scale: 1 };
        } else {
          clipParams = { x: 0, y: 0, width, height, scale: 1 };
        }

        const shot = await send('Page.captureScreenshot', {
          clip: clipParams,
          captureBeyondViewport: true
        });
        const filePath = path.join(outDir, fileName);
        fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
        console.log(`Captured: ${fileName}`);
        proc.kill();
        resolve();
      });
      ws.addEventListener('error', err => {
        proc.kill();
        reject(err);
      });
    });
  } catch (err) {
    proc.kill();
    throw err;
  }
}

async function run() {
  const base = 'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation';

  // 1. Header Buttons Desktop (Item 1)
  await captureElement(`${base}/index.html`, 1280, 800, '.nav-header-actions', '1_header_buttons_desktop.png');

  // 2. Homepage 2 Why Professional in Light Mode (Item 2)
  await captureElement(`${base}/home-2.html`, 1280, 900, '.split-panel', '2_home2_why_professional_light.png');

  // 3. Homepage 2 Before Your Appointment in Light Mode (Item 3)
  await captureElement(`${base}/home-2.html`, 1280, 900, '.doc-band', '3_home2_before_appointment_light.png');

  // 4. Home 1 Section 2 Cards with Images (Item 4)
  await captureElement(`${base}/index.html`, 1280, 900, 'section.section-pad:nth-of-type(2)', '4a_home1_section2_cards.png');

  // 4. Home 1 Section 3 Services Cards with Images (Item 4)
  await captureElement(`${base}/index.html`, 1280, 900, 'section.section-pad.bg-light:nth-of-type(3)', '4b_home1_section3_services.png');

  // 4. Home 1 Who We Serve with Images (Item 4)
  await captureElement(`${base}/index.html`, 1280, 900, 'section.section-pad.bg-light:nth-of-type(5)', '4c_home1_who_we_serve.png');

  // 5. Home 2 How It Works Illustrations (Item 5)
  await captureElement(`${base}/home-2.html`, 1280, 900, 'section:has(.workflow-card)', '5_home2_how_it_works_illustrations.png');

  // 7. About page By The Numbers at 360px (Item 7)
  await captureElement(`${base}/about.html`, 360, 900, 'section.stats', '7_about_360_by_the_numbers.png');

  // 8. Blog page search box on top below hero at 360 and 768 (Item 8)
  await captureElement(`${base}/blog.html`, 360, 800, '.blog-search-strip', '8a_blog_360_search_box_top.png');
  await captureElement(`${base}/blog.html`, 768, 800, '.blog-search-strip', '8b_blog_768_search_box_top.png');

  console.log('ALL TARGETED SCREENSHOTS CAPTURED!');
}

run().catch(console.error);
