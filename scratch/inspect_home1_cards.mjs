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

async function inspectHome1Cards() {
  const port = 9295;
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    '--window-size=1200,900',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_insp_${port}`,
    'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
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

      const res = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const cards = Array.from(document.querySelectorAll('.home-service-card')).map((card, i) => {
              const imgWrap = card.querySelector('.home-service-img-wrap');
              const img = card.querySelector('img');
              const h4 = card.querySelector('h4');
              const p = card.querySelector('p');
              const a = card.querySelector('a');
              const body = card.querySelector('.home-service-body');
              return {
                i,
                cardRect: card.getBoundingClientRect(),
                cardPadding: window.getComputedStyle(card).padding,
                imgWrapRect: imgWrap ? imgWrap.getBoundingClientRect() : null,
                imgWrapMargin: imgWrap ? window.getComputedStyle(imgWrap).margin : null,
                h4Text: h4 ? h4.innerText : '',
                h4Height: h4 ? h4.offsetHeight : null,
                pHeight: p ? p.offsetHeight : null,
                bodyPadding: body ? window.getComputedStyle(body).padding : null,
                aTop: a ? a.getBoundingClientRect().top : null
              };
            });
            return JSON.stringify(cards, null, 2);
          })()
        `,
        returnByValue: true
      });
      const raw = res.result.result ? res.result.result.value : res.result.value;
      console.log('Cards analysis:\n', raw);
      proc.kill();
      resolve();
    });
  });
}

inspectHome1Cards();
