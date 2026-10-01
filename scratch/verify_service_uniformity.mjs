import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

function getJson(port) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const poll = () => {
      attempts++;
      http.get(`http://127.0.0.1:${port}/json`, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', err => {
        if (attempts > 30) return reject(err);
        setTimeout(poll, 250);
      });
    };
    poll();
  });
}

async function verifyUniformity(url, selector, width, port, screenshotName) {
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    `--window-size=${width},900`,
    `--remote-debugging-port=${port}`,
    `--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_uni_check_${port}`,
    url
  ]);

  const list = await getJson(port);
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  return new Promise(resolve => {
    ws.addEventListener('open', async () => {
      let id = 1;
      const send = (m, params={}) => new Promise(r2 => {
        const curId = id++;
        const handler = ev => {
          const res = JSON.parse(ev.data);
          if (res.id === curId) { ws.removeEventListener('message', handler); r2(res); }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method: m, params }));
      });

      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: width <= 768
      });

      await send('Runtime.evaluate', {
        expression: `
          document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('show');
            el.style.opacity = '1';
            el.style.transform = 'none';
          });
        `
      });

      await new Promise(r => setTimeout(r, 600));

      const res = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const cards = Array.from(document.querySelectorAll('${selector}')).map((c, i) => {
              const r = c.getBoundingClientRect();
              const h = c.querySelector('h3, h4');
              const media = c.querySelector('.service-media, .home-service-img-wrap');
              const img = c.querySelector('img');
              const body = c.querySelector('.service-copy, .home-service-body');
              return {
                i,
                title: h ? h.innerText.replace(/\\n/g, ' ').trim() : '',
                cardHeight: Math.round(r.height * 10) / 10,
                mediaHeight: media ? Math.round(media.getBoundingClientRect().height * 10) / 10 : null,
                imgHeight: img ? Math.round(img.getBoundingClientRect().height * 10) / 10 : null,
                bodyHeight: body ? Math.round(body.getBoundingClientRect().height * 10) / 10 : null
              };
            });
            return JSON.stringify(cards, null, 2);
          })()
        `,
        returnByValue: true
      });

      const parsed = JSON.parse(res.result.result.value);
      console.log(`Results for ${url} @ ${width}px:`, parsed);

      if (screenshotName) {
        const card0Pos = await send('Runtime.evaluate', {
          expression: `
            (() => {
              const first = document.querySelector('${selector}');
              const r = first.getBoundingClientRect();
              return JSON.stringify({ top: r.top + window.scrollY, height: r.height });
            })()
          `,
          returnByValue: true
        });
        const p = JSON.parse(card0Pos.result.result.value);
        const shot = await send('Page.captureScreenshot', {
          captureBeyondViewport: true,
          clip: {
            x: 0,
            y: Math.max(0, p.top - 30),
            width,
            height: Math.min(1000, p.height + 60),
            scale: 1
          }
        });
        fs.writeFileSync(screenshotName, Buffer.from(shot.result.data, 'base64'));
        console.log(`Saved screenshot ${screenshotName}`);
      }

      proc.kill();
      resolve(parsed);
    });
  });
}

(async () => {
  await verifyUniformity(
    'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/services.html',
    '.service-row',
    1200,
    9340,
    'scratch/services_uniform_desktop.png'
  );

  await verifyUniformity(
    'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/services.html',
    '.service-row',
    768,
    9341,
    'scratch/services_uniform_tablet.png'
  );

  await verifyUniformity(
    'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html',
    '.home-service-card',
    1200,
    9342,
    'scratch/home1_uniform_desktop.png'
  );
})();
