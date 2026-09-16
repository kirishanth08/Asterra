import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const pages = [
  'index.html', 'home-2.html', 'about.html', 'services.html', 'service-details.html',
  'fees.html', 'documents.html', 'blog.html', 'blog-details.html', 'contact.html',
  'pricing.html', 'login.html', 'register.html', 'coming-soon.html',
  'admin-login.html', 'admin-dashboard.html', '404.html'
];

async function inspectDarkContainers(pageName, port) {
  const url = `file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/${pageName}`;
  const proc = spawn(edgePath, ['--headless=new', `--remote-debugging-port=${port}`, url]);

  await new Promise(r => setTimeout(r, 1000));

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

    return await new Promise((resolve) => {
      ws.onopen = () => {
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (() => {
                document.body.classList.remove('dark');
                document.documentElement.classList.remove('dark');

                const darkSelectors = [
                  '.story-panel', '.story-copy', '.welcome-cta', '.cta-panel',
                  '.cta-strip', '.cta', '.cta-home2', '.sd-dark-panel',
                  '.sd-hero-card', '.mission-panel', '.notice', '.fee-note',
                  '.fees-cta', '.doc-band', '.footer', '.dark-panel',
                  '.home2-hero', '.hero-photo-card', '.admin-sidebar'
                ];

                const results = [];

                darkSelectors.forEach(sel => {
                  document.querySelectorAll(sel).forEach(container => {
                    const textNodes = container.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, a, .eyebrow, strong, em');
                    textNodes.forEach(node => {
                      const text = (node.innerText || '').trim();
                      if (!text || text.length < 2) return;
                      // Exclude if element contains other text nodes that were already scanned
                      if (node.querySelector('h1, h2, h3, h4, h5, h6, p, li')) return;

                      const cs = window.getComputedStyle(node);
                      const color = cs.color;

                      // Parse color to detect dark ink / dark navy (e.g. rgb(20, 40, 61) or rgb(30, 43, 54) or dark grey)
                      const m = color.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
                      if (m) {
                        const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3]);
                        // If color is dark (brightness < 120) inside a dark container
                        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                        if (brightness < 130 && !node.closest('.btn-light') && !node.closest('.btn-gold') && !node.closest('.white-card') && !node.closest('.card-light')) {
                          results.push({
                            container: sel,
                            tag: node.tagName.toLowerCase(),
                            classes: node.className,
                            text: text.slice(0, 60),
                            color: color,
                            brightness: brightness
                          });
                        }
                      }
                    });
                  });
                });

                return results;
              })()
            `,
            returnByValue: true
          }
        }));
      };

      ws.onmessage = (msg) => {
        const resp = JSON.parse(msg.data);
        if (resp.id === 1) {
          const items = resp.result.result.value || [];
          proc.kill();
          resolve(items);
        }
      };
    });
  } catch(e) {
    proc.kill();
    return [];
  }
}

async function run() {
  console.log('Inspecting dark containers across all pages in light mode...');
  let port = 9320;
  const report = {};

  for (const page of pages) {
    const issues = await inspectDarkContainers(page, port++);
    if (issues.length > 0) {
      report[page] = issues;
      console.log(`\n=== ${page}: FOUND ${issues.length} DARK-ON-DARK INVISIBLE TEXT ELEMENTS ===`);
      issues.forEach(iss => {
        console.log(`  [${iss.container} -> ${iss.tag}.${iss.classes}] "${iss.text}" | Color: ${iss.color} (brightness: ${iss.brightness.toFixed(0)})`);
      });
    }
  }

  fs.writeFileSync('scratch/dark_container_issues.json', JSON.stringify(report, null, 2));
}

run();
