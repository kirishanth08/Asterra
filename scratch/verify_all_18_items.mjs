import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const basePath = 'file:///c:/Users/kiris/Desktop/September - Projects/asterra-notary-document-attestation';
const port = 9256;

const proc = spawn(edgePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `${basePath}/index.html`
]);

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  ready() {
    return new Promise((resolve) => {
      if (this.ws.readyState === WebSocket.OPEN) resolve();
      else this.ws.onopen = () => resolve();
    });
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result ? res.result.value : res;
  }

  async setViewport(width, height, mobile = false) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile
    });
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await wait(800);
  }

  async screenshot(filePath, clip) {
    const params = { format: 'png' };
    if (clip) params.clip = { ...clip, scale: 2 };
    const res = await this.send('Page.captureScreenshot', params);
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
  }

  close() {
    this.ws.close();
  }
}

async function runAudit() {
  await wait(1200);
  const targets = await getJson(`http://127.0.0.1:${port}/json`);
  const pageTarget = targets.find(t => t.type === 'page');
  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.ready();
  await client.send('DOM.enable');
  await client.send('Page.enable');

  const report = {};

  console.log('--- TESTING 18 CHECKLIST ITEMS ---');

  // Test 1: Navigation & Home 1
  await client.navigate(`${basePath}/index.html`);
  await client.setViewport(1280, 900, false);
  await wait(500);

  // Clear storage for clean initial test
  await client.eval(`
    localStorage.clear();
  `);
  await client.navigate(`${basePath}/index.html`);
  await client.setViewport(1280, 900, false);
  await wait(600);

  // Test 2: Dark Mode button functioning
  const darkBefore = await client.eval(`document.body.classList.contains('dark')`);
  await client.eval(`document.querySelector('#themeToggle').click()`);
  await wait(300);
  const darkAfter1 = await client.eval(`document.body.classList.contains('dark')`);
  await client.eval(`document.querySelector('#themeToggle').click()`);
  await wait(300);
  const darkAfter2 = await client.eval(`document.body.classList.contains('dark')`);
  report['Item 2: Dark Mode Toggle Works'] = (!darkBefore && darkAfter1 && !darkAfter2);

  // Test 3: RTL button functioning
  const rtlBefore = await client.eval(`document.documentElement.getAttribute('dir') || 'ltr'`);
  await client.eval(`document.querySelector('#rtlToggle').click()`);
  await wait(300);
  const rtlAfter1 = await client.eval(`document.documentElement.getAttribute('dir')`);
  await client.eval(`document.querySelector('#rtlToggle').click()`);
  await wait(300);
  const rtlAfter2 = await client.eval(`document.documentElement.getAttribute('dir') || 'ltr'`);
  report['Item 3: RTL Button Works'] = (rtlBefore === 'ltr' && rtlAfter1 === 'rtl' && rtlAfter2 === 'ltr');

  // Test 4: Home 1 "Learn More" links equal heights
  const learnMoreHeights = await client.eval(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.home-service-card'));
      const links = Array.from(document.querySelectorAll('.home-service-body a'));
      const cardHeights = cards.map(c => Math.round(c.getBoundingClientRect().height));
      const linkOffsets = links.map(l => Math.round(l.getBoundingClientRect().bottom));
      return { cardHeights, linkOffsets, allSameBottom: linkOffsets.every(y => Math.abs(y - linkOffsets[0]) <= 2) };
    })()
  `);
  report['Item 4: Home 1 Learn More aligned'] = learnMoreHeights;
  await client.screenshot('scratch/audit_item4_home1_cards.png', { x: 0, y: 350, width: 1280, height: 450 });

  // Test 5: The Asterra Approach spacing
  const storySpacing = await client.eval(`
    (() => {
      const h2 = document.querySelector('.story-panel .story-copy h2');
      const p = document.querySelector('.story-panel .story-copy p');
      const h2Rect = h2.getBoundingClientRect();
      const pRect = p.getBoundingClientRect();
      const gap = Math.round(pRect.top - h2Rect.bottom);
      return { gap, h2Text: h2.textContent.trim(), ok: gap >= 4 && gap <= 24 };
    })()
  `);
  report['Item 5: The Asterra Approach Spacing'] = storySpacing;
  await client.screenshot('scratch/audit_item5_story_panel.png', { x: 0, y: 700, width: 1280, height: 450 });

  // Test 7, 8, 6: Service Details 02 (Apostille)
  await client.navigate(`${basePath}/service-details.html?s=apostille`);
  await wait(500);

  // Test 7: Apostille Image clear and not broken
  const apostilleImg = await client.eval(`
    (() => {
      const img = document.querySelector('.sd-hero-image');
      return {
        src: img.getAttribute('src'),
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      };
    })()
  `);
  report['Item 7: Apostille Hero Image Valid'] = (apostilleImg.naturalWidth > 500 && apostilleImg.complete);

  // Test 8: What's included numerics 01, 02, 03, 04 size
  const includedNumerics = await client.eval(`
    (() => {
      const spans = Array.from(document.querySelectorAll('.sd-feature span'));
      const sizes = spans.map(s => window.getComputedStyle(s).fontSize);
      const text = spans.map(s => s.textContent.trim());
      return { sizes, text, isProminent: parseFloat(sizes[0]) >= 28 };
    })()
  `);
  report['Item 8: What Included 01-04 Large Numerics'] = includedNumerics;

  // Test 6: Info cards equal size
  const apostilleInfoCards = await client.eval(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.sd-mini'));
      const heights = cards.map(c => Math.round(c.getBoundingClientRect().height));
      const texts = cards.map(c => c.querySelector('strong').textContent.trim());
      return { heights, texts, allEqual: heights.every(h => Math.abs(h - heights[0]) <= 2) };
    })()
  `);
  report['Item 6: Apostille Info Cards Equal'] = apostilleInfoCards;
  await client.screenshot('scratch/audit_item7_8_apostille.png', { x: 0, y: 0, width: 1280, height: 800 });

  // Test 12, 13: Service Details 03 (Embassy)
  await client.navigate(`${basePath}/service-details.html?s=embassy`);
  await wait(500);

  const embassyImg = await client.eval(`
    (() => {
      const img = document.querySelector('.sd-hero-image');
      return {
        src: img.getAttribute('src'),
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      };
    })()
  `);
  report['Item 12: Embassy Hero Image Valid'] = (embassyImg.naturalWidth > 500 && embassyImg.complete);

  const embassyInfoCards = await client.eval(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.sd-mini'));
      const heights = cards.map(c => Math.round(c.getBoundingClientRect().height));
      const texts = cards.map(c => c.querySelector('strong').textContent.trim());
      return { heights, texts, allEqual: heights.every(h => Math.abs(h - heights[0]) <= 2) };
    })()
  `);
  report['Item 13: Embassy Info Cards Equal'] = embassyInfoCards;
  await client.screenshot('scratch/audit_item12_13_embassy.png', { x: 0, y: 0, width: 1280, height: 800 });

  // Test 9: Documents page 4 Categories, Checklist, Service Wise
  await client.navigate(`${basePath}/documents.html`);
  await wait(500);
  const docCards = await client.eval(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.sd-mini'));
      const heights = cards.map(c => Math.round(c.getBoundingClientRect().height));
      const texts = cards.map(c => c.querySelector('strong').textContent.trim());
      return { heights, texts, allEqual: heights.every(h => Math.abs(h - heights[0]) <= 2) };
    })()
  `);
  report['Item 9: Document Guide Cards Equal'] = docCards;

  // Test 10, 11: Fees & Turnaround
  await client.navigate(`${basePath}/fees.html`);
  await wait(500);
  const feesAlignment = await client.eval(`
    (() => {
      const feeCards = Array.from(document.querySelectorAll('.fee-card'));
      const feeBtns = Array.from(document.querySelectorAll('.fee-card .btn'));
      const feeCardHeights = feeCards.map(c => Math.round(c.getBoundingClientRect().height));
      const feeBtnBottoms = feeBtns.map(b => Math.round(b.getBoundingClientRect().bottom));

      const turnCards = Array.from(document.querySelectorAll('.turn-card'));
      const turnCardHeights = turnCards.map(c => Math.round(c.getBoundingClientRect().height));

      return {
        feeCardHeights,
        feeBtnBottoms,
        allFeeBtnsAligned: feeBtnBottoms.every(b => Math.abs(b - feeBtnBottoms[0]) <= 2),
        turnCardHeights,
        allTurnCardsEqual: turnCardHeights.every(h => Math.abs(h - turnCardHeights[0]) <= 2)
      };
    })()
  `);
  report['Item 10 & 11: Fees & Turnaround Grid Alignment'] = feesAlignment;
  await client.screenshot('scratch/audit_item10_11_fees.png', { x: 0, y: 400, width: 1280, height: 700 });

  // Test 14: Blog alignment
  await client.navigate(`${basePath}/blog.html`);
  await wait(500);
  const blogAlignment = await client.eval(`
    (() => {
      const metas = Array.from(document.querySelectorAll('#blogGrid .blog-meta'));
      const btns = Array.from(document.querySelectorAll('#blogGrid .blog-card-footer a, #blogGrid .blog-card-body a'));
      const cards = Array.from(document.querySelectorAll('#blogGrid .blog-card'));
      const metaBottoms = metas.slice(0, 3).map(m => Math.round(m.getBoundingClientRect().bottom));
      const btnBottoms = btns.slice(0, 3).map(b => Math.round(b.getBoundingClientRect().bottom));
      const cardHeights = cards.slice(0, 3).map(c => Math.round(c.getBoundingClientRect().height));
      return {
        cardHeights,
        metaBottoms,
        btnBottoms,
        allCardsEqual: cardHeights.every(h => Math.abs(h - cardHeights[0]) <= 2),
        metaAligned: metaBottoms.every(b => Math.abs(b - metaBottoms[0]) <= 2),
        btnAligned: btnBottoms.every(b => Math.abs(b - btnBottoms[0]) <= 2)
      };
    })()
  `);
  report['Item 14: Blog Card Meta & Read Article Aligned'] = blogAlignment;
  await client.screenshot('scratch/audit_item14_blog.png', { x: 0, y: 700, width: 1280, height: 650 });

  // Test 15 & 18: Logo icon visibility
  const logoProps = await client.eval(`
    (() => {
      const mark = document.querySelector('.navbar-brand .brand-mark');
      const icon = document.querySelector('.navbar-brand .brand-mark i');
      const markStyle = window.getComputedStyle(mark);
      const iconStyle = window.getComputedStyle(icon);
      return {
        markBg: markStyle.backgroundImage || markStyle.backgroundColor,
        markBorder: markStyle.border,
        iconColor: iconStyle.color,
        iconSize: iconStyle.fontSize,
        iconFontWeight: iconStyle.fontWeight
      };
    })()
  `);
  report['Item 15 & 18: Logo Icon Visibility'] = logoProps;

  // Test 16: Home 2 content differentiation & View Details routing
  await client.navigate(`${basePath}/home-2.html`);
  await wait(500);
  const home2Check = await client.eval(`
    (() => {
      const kicker = document.querySelector('.home2-kicker').textContent.trim();
      const title = document.querySelector('.home2-title').textContent.trim();
      const links = Array.from(document.querySelectorAll('.service-grid a')).map(a => a.getAttribute('href'));
      return { kicker, title, links };
    })()
  `);
  // Click first View Details link to test destination
  await client.eval(`document.querySelector('.service-grid a').click()`);
  await wait(600);
  const navigatedUrl = await client.eval(`window.location.href`);
  report['Item 16: Home 2 Differentiation & No Redirect'] = {
    home2Content: home2Check,
    navigatedUrl,
    staysOnServiceDetails: navigatedUrl.includes('service-details.html?s=notarization')
  };

  // Test 17 & 18: 360px Mobile Viewport Layout
  await client.navigate(`${basePath}/index.html`);
  await client.setViewport(360, 640, true);
  await wait(600);
  const mobile360Layout = await client.eval(`
    (() => {
      const brand = document.querySelector('.navbar-brand');
      const actions = document.querySelector('.nav-header-actions');
      const container = document.querySelector('.site-nav .container');
      const brandRect = brand.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Check if brand and actions are on the exact same line (y centers within 4px)
      const brandCenterY = brandRect.top + brandRect.height / 2;
      const actionsCenterY = actionsRect.top + actionsRect.height / 2;
      const onSameLine = Math.abs(brandCenterY - actionsCenterY) <= 6;

      const mark = document.querySelector('.navbar-brand .brand-mark');
      const markRect = mark.getBoundingClientRect();

      return {
        onSameLine,
        containerWidth: containerRect.width,
        brandWidth: Math.round(brandRect.width),
        actionsWidth: Math.round(actionsRect.width),
        totalUsedWidth: Math.round(brandRect.width + actionsRect.width),
        brandCenterY,
        actionsCenterY,
        markVisible: markRect.width >= 30 && markRect.height >= 30
      };
    })()
  `);
  report['Item 17 & 18: 360px Mobile Layout Single Line & Icon Visible'] = mobile360Layout;
  await client.screenshot('scratch/audit_item17_18_mobile360.png', { x: 0, y: 0, width: 360, height: 400 });

  console.log('\n=== COMPREHENSIVE 18-POINT AUDIT RESULT ===');
  console.log(JSON.stringify(report, null, 2));

  client.close();
  proc.kill();
  process.exit(0);
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  proc.kill();
  process.exit(1);
});
