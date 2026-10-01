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

async function inspectCard1() {
  const port = 9315;
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    '--window-size=1200,900',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_c1_${port}`,
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

      const res = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const rows = Array.from(document.querySelectorAll('.service-row'));
            return JSON.stringify(rows.map((row, i) => {
              const copy = row.querySelector('.service-copy');
              const media = row.querySelector('.service-media');
              const img = row.querySelector('.service-media img');
              return {
                i,
                title: row.querySelector('h3').innerText,
                rowHeight: row.offsetHeight,
                copyHeight: copy.offsetHeight,
                mediaHeight: media.offsetHeight,
                imgNaturalWidth: img.naturalWidth,
                imgNaturalHeight: img.naturalHeight,
                imgOffsetHeight: img.offsetHeight,
                imgOffsetWidth: img.offsetWidth,
                copyChildren: Array.from(copy.children).map(c => ({
                  tag: c.tagName,
                  class: c.className,
                  height: c.offsetHeight
                }))
              };
            }), null, 2);
          })()
        `,
        returnByValue: true
      });
      const raw = res.result.result ? res.result.result.value : res.result.value;
      console.log(raw);
      proc.kill();
      resolve();
    });
  });
}

inspectCard1();
