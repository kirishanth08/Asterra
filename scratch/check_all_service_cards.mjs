import { spawn } from 'child_process';
import http from 'http';

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
        if (attempts > 20) return reject(err);
        setTimeout(poll, 300);
      });
    };
    poll();
  });
}

async function inspectPage(url, cardSelector, port, w=1200) {
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    `--window-size=${w},900`,
    `--remote-debugging-port=${port}`,
    `--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_uni_${port}`,
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
        width: w,
        height: 900,
        deviceScaleFactor: 1,
        mobile: w <= 768
      });

      await new Promise(r => setTimeout(r, 800));

      const res = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const cards = Array.from(document.querySelectorAll('${cardSelector}')).map((c, i) => {
              const r = c.getBoundingClientRect();
              const h = c.querySelector('h3, h4');
              const img = c.querySelector('img');
              const media = c.querySelector('.service-media');
              const copy = c.querySelector('.service-copy');
              return {
                i,
                title: h ? h.innerText.replace(/\\n/g, ' ') : '',
                cardHeight: r.height,
                cardWidth: r.width,
                mediaHeight: media ? media.getBoundingClientRect().height : null,
                copyHeight: copy ? copy.getBoundingClientRect().height : null,
                imgHeight: img ? img.getBoundingClientRect().height : null
              };
            });
            return JSON.stringify(cards, null, 2);
          })()
        `,
        returnByValue: true
      });
      const raw = res.result.result ? res.result.result.value : res.result.value;
      proc.kill();
      resolve(JSON.parse(raw));
    });
  });
}

(async () => {
  console.log('=== SERVICES.HTML (.service-row) at 1200px ===');
  console.log(await inspectPage('file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/services.html', '.service-row', 9310, 1200));

  console.log('=== SERVICES.HTML (.service-row) at 768px ===');
  console.log(await inspectPage('file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/services.html', '.service-row', 9311, 768));

  console.log('=== INDEX.HTML (.home-service-card) at 1200px ===');
  console.log(await inspectPage('file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html', '.home-service-card', 9312, 1200));

  console.log('=== INDEX.HTML (.home-service-card) at 768px ===');
  console.log(await inspectPage('file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html', '.home-service-card', 9313, 768));
})();
