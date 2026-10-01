import { spawn } from 'child_process';
import http from 'http';

const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new',
  '--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_test_user2',
  '--remote-debugging-port=9242',
  '--window-size=1280,1000',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/home-2.html'
]);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9242/json', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });
    const page = list.find(t => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.addEventListener('open', async () => {
      let id = 1;
      const send = (m, p={}) => new Promise((resolve) => {
        const curId = id++;
        const h = (event) => {
          const res = JSON.parse(event.data);
          if (res.id === curId) { ws.removeEventListener('message', h); resolve(res.result); }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: curId, method: m, params: p }));
      });
      const res = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => {
          const panel = document.querySelector('.split-panel');
          const eyebrow = panel.querySelector('.eyebrow');
          const p = panel.querySelector('p');
          const lis = panel.querySelectorAll('li');
          const infoItems = panel.querySelectorAll('.info-item span');
          
          const docBand = document.querySelector('.doc-band');
          const docEyebrow = docBand.querySelector('.eyebrow');
          const docH2 = docBand.querySelector('h2');
          const docP = docBand.querySelector('p');
          const docStrong = docBand.querySelector('strong');
          const docMuted = docBand.querySelector('.text-muted');

          return {
            splitPanel: {
              panelBg: window.getComputedStyle(panel).backgroundColor,
              panelColor: window.getComputedStyle(panel).color,
              eyebrowColor: window.getComputedStyle(eyebrow).color,
              pColor: window.getComputedStyle(p).color,
              pOpacity: window.getComputedStyle(p).opacity,
              liColor: lis[0] ? window.getComputedStyle(lis[0]).color : null,
              infoColor: infoItems[0] ? window.getComputedStyle(infoItems[0]).color : null,
            },
            docBand: {
              bg: window.getComputedStyle(docBand).backgroundColor,
              color: window.getComputedStyle(docBand).color,
              eyebrow: window.getComputedStyle(docEyebrow).color,
              h2: window.getComputedStyle(docH2).color,
              p: window.getComputedStyle(docP).color,
              cardBg: window.getComputedStyle(docBand.querySelector('.bg-white')).backgroundColor,
              strong: window.getComputedStyle(docStrong).color,
              muted: window.getComputedStyle(docMuted).color,
            }
          };
        })()`
      });
      console.log('COMPUTED STYLES:\n', JSON.stringify(res.result.value, null, 2));
      proc.kill();
      process.exit(0);
    });
  } catch (err) {
    console.error(err);
    proc.kill();
    process.exit(1);
  }
}, 1500);
