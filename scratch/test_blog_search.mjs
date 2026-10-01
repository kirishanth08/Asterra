import { spawn } from 'child_process';
import http from 'http';

const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new',
  '--user-data-dir=C:\\Users\\kiris\\AppData\\Local\\Temp\\edge_blog_test_9247',
  '--remote-debugging-port=9247',
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/blog.html'
]);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9247/json', r => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });
    const page = list.find(t => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
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

      const res = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => {
          const input = document.getElementById('blogSearch');
          input.value = 'apostille';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          const visibleItems = Array.from(document.querySelectorAll('#blogGrid .blog-item')).filter(el => el.style.display !== 'none');
          return {
            searchInputFound: !!input,
            visibleCount: visibleItems.length,
            firstTitle: visibleItems[0]?.querySelector('h3')?.textContent
          };
        })()`
      });
      console.log('SEARCH TEST RESULT:', res.result.value);
      proc.kill();
      process.exit(0);
    });
  } catch (err) {
    console.error(err);
    proc.kill();
    process.exit(1);
  }
}, 1500);
