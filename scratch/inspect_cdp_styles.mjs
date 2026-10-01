import { spawn } from 'child_process';
import http from 'http';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9259;
const args = [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/index.html'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      http.get(`http://127.0.0.1:${port}/json`, (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const page = list.find(x => x.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'DOM.enable'
      }));
      ws.send(JSON.stringify({
        id: 2,
        method: 'CSS.enable'
      }));
      ws.send(JSON.stringify({
        id: 3,
        method: 'Emulation.setDeviceMetricsOverride',
        params: { width: 375, height: 812, deviceScaleFactor: 2, mobile: true }
      }));
    };

    let docNodeId = null;
    ws.onmessage = async (msg) => {
      const resp = JSON.parse(msg.data);
      if (resp.id === 3) {
        ws.send(JSON.stringify({ id: 4, method: 'DOM.getDocument' }));
      } else if (resp.id === 4) {
        docNodeId = resp.result.root.nodeId;
        ws.send(JSON.stringify({
          id: 5,
          method: 'DOM.querySelector',
          params: { nodeId: docNodeId, selector: '#mainMenu' }
        }));
      } else if (resp.id === 5) {
        const menuNodeId = resp.result.nodeId;
        ws.send(JSON.stringify({
          id: 6,
          method: 'CSS.getMatchedStylesForNode',
          params: { nodeId: menuNodeId }
        }));
      } else if (resp.id === 6) {
        const matched = resp.result.matchedCSSRules || [];
        const matchingRules = matched.map(m => ({
          selector: m.rule.selectorList.text,
          origin: m.rule.origin,
          cssProperties: m.rule.style.cssProperties.filter(p => p.name === 'display' || p.name === 'height' || p.name === 'visibility').map(p => `${p.name}: ${p.value}`)
        })).filter(m => m.cssProperties.length > 0);
        console.log('MATCHED RULES FOR #mainMenu:');
        console.log(JSON.stringify(matchingRules, null, 2));
        proc.kill();
        process.exit(0);
      }
    };
  } catch (e) {
    console.error(e);
    proc.kill();
    process.exit(1);
  }
}, 2000);
