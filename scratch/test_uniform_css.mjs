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

async function testCss(cssRule) {
  const port = 9320;
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    '--window-size=1200,900',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_test_uni_${port}`,
    'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/services.html'
  ]);
  
  const list = await getJson(port);
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  
  await new Promise(resolve => {
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
        width: 1200,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false
      });

      // Inject test CSS
      await send('Runtime.evaluate', {
        expression: `
          const style = document.createElement('style');
          style.innerHTML = \`${cssRule}\`;
          document.head.appendChild(style);
          document.querySelectorAll('.reveal').forEach(el => el.classList.add('show'));
        `
      });

      await new Promise(r => setTimeout(r, 600));

      const res = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const rows = Array.from(document.querySelectorAll('.service-row'));
            return JSON.stringify(rows.map((r, i) => {
              const rect = r.getBoundingClientRect();
              const media = r.querySelector('.service-media').getBoundingClientRect();
              const img = r.querySelector('.service-media img').getBoundingClientRect();
              const copy = r.querySelector('.service-copy').getBoundingClientRect();
              return {
                i,
                title: r.querySelector('h3').innerText,
                rowH: rect.height,
                mediaH: media.height,
                imgH: img.height,
                imgW: img.width,
                copyH: copy.height
              };
            }), null, 2);
          })()
        `,
        returnByValue: true
      });
      const raw = res.result.result ? res.result.result.value : res.result.value;
      console.log('Result:\n', raw);
      proc.kill();
      resolve();
    });
  });
}

const testRule = `
@media (min-width: 992px) {
  .service-layout {
    display: flex !important;
    flex-direction: row !important;
    align-items: stretch !important;
  }
  .service-row.flip .service-layout {
    flex-direction: row-reverse !important;
  }
  .service-media {
    position: relative !important;
    flex: 0 0 44% !important;
    width: 44% !important;
    align-self: stretch !important;
    overflow: hidden !important;
    min-height: 440px !important;
  }
  .service-media img {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    display: block !important;
  }
  .service-copy {
    flex: 0 0 56% !important;
    width: 56% !important;
    padding: 38px 44px !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    min-height: 440px !important;
  }
}
`;

testCss(testRule);
