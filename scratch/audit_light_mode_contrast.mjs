import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const pages = [
  'index.html', 'home-2.html', 'about.html', 'services.html', 'service-details.html',
  'fees.html', 'documents.html', 'blog.html', 'blog-details.html', 'contact.html',
  'pricing.html', 'login.html', 'register.html', 'coming-soon.html',
  'admin-login.html', 'admin-dashboard.html', '404.html'
];

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrast(rgb1, rgb2) {
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function parseRgb(str) {
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return { r: 255, g: 255, b: 255, a: 1 };
  return { r: parseInt(m[1]), g: parseInt(m[2]), b: parseInt(m[3]), a: m[4] !== undefined ? parseFloat(m[4]) : 1 };
}

async function auditPage(pageName, port) {
  const url = `file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation/${pageName}`;
  const proc = spawn(edgePath, ['--headless=new', `--remote-debugging-port=${port}`, url]);

  await new Promise(r => setTimeout(r, 1200));

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
                // Ensure light mode is active
                document.body.classList.remove('dark');
                document.documentElement.classList.remove('dark');

                function getEffectiveBg(el) {
                  let cur = el;
                  while (cur && cur !== document.documentElement) {
                    const bg = window.getComputedStyle(cur).backgroundColor;
                    const m = bg.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
                    if (m && (m[4] === undefined || parseFloat(m[4]) > 0.1)) {
                      return { bg, el: cur.tagName.toLowerCase() + (cur.className ? '.' + cur.className.split(' ').join('.') : '') };
                    }
                    cur = cur.parentElement;
                  }
                  return { bg: 'rgb(255, 255, 255)', el: 'body' };
                }

                const candidates = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, li, button, .eyebrow, strong, em');
                const issues = [];

                candidates.forEach(el => {
                  const text = (el.innerText || '').trim();
                  if (!text || text.length < 2) return;
                  // Only leaf or near-leaf elements
                  if (el.children.length > 2) return;

                  const rect = el.getBoundingClientRect();
                  if (rect.width === 0 || rect.height === 0) return;

                  const cs = window.getComputedStyle(el);
                  if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.1) return;

                  const color = cs.color;
                  const bgInfo = getEffectiveBg(el);

                  issues.push({
                    tag: el.tagName.toLowerCase(),
                    text: text.slice(0, 50),
                    color: color,
                    bg: bgInfo.bg,
                    bgEl: bgInfo.el,
                    classes: el.className,
                    fontSize: cs.fontSize,
                    fontWeight: cs.fontWeight
                  });
                });

                return issues;
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
  console.log('Starting full site light-mode contrast audit...');
  let port = 9300;
  const allIssues = {};

  for (const p of pages) {
    const items = await auditPage(p, port++);
    const pageIssues = [];

    items.forEach(item => {
      const fg = parseRgb(item.color);
      const bg = parseRgb(item.bg);
      const contrast = getContrast(fg, bg);

      const isLarge = parseFloat(item.fontSize) >= 24 || (parseFloat(item.fontSize) >= 18 && parseInt(item.fontWeight) >= 700);
      const threshold = isLarge ? 3.0 : 4.5;

      // Also flag near-invisible cases:
      const dist = Math.abs(fg.r - bg.r) + Math.abs(fg.g - bg.g) + Math.abs(fg.b - bg.b);

      if (contrast < threshold || dist < 60) {
        pageIssues.push({
          element: `<${item.tag} class="${item.classes}">`,
          text: item.text,
          fgColor: item.color,
          bgColor: item.bg,
          bgContainer: item.bgEl,
          contrast: contrast.toFixed(2),
          dist: dist
        });
      }
    });

    if (pageIssues.length > 0) {
      allIssues[p] = pageIssues;
    }
  }

  console.log('AUDIT COMPLETE. Summary of findings:');
  for (const [page, issues] of Object.entries(allIssues)) {
    console.log(`\n=== ${page} (${issues.length} low contrast items) ===`);
    issues.slice(0, 10).forEach(iss => {
      console.log(`  - [${iss.element}] "${iss.text}" | FG: ${iss.fgColor} vs BG: ${iss.bgColor} (container: ${iss.bgContainer}) | Contrast: ${iss.contrast}:1`);
    });
    if (issues.length > 10) console.log(`  ... and ${issues.length - 10} more`);
  }

  fs.writeFileSync('scratch/audit_contrast_report.json', JSON.stringify(allIssues, null, 2));
}

run();
