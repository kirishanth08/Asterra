import fs from 'fs';

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const toggler = content.match(/<button[^>]*navbar-toggler[^>]*>/i);
  const collapse = content.match(/<div[^>]*navbar-collapse[^>]*>/i);
  const nav = content.match(/<nav[^>]*>/i);
  const hasDropdown = content.includes('dropdown');
  const target = toggler ? toggler[0].match(/data-bs-target=["']([^"']+)["']/)?.[1] : null;
  const colId = collapse ? collapse[0].match(/id=["']([^"']+)["']/)?.[1] : null;
  const navId = nav ? nav[0].match(/id=["']([^"']+)["']/)?.[1] : null;
  console.log(
    f.padEnd(22),
    'navId:', navId || 'none',
    '| target:', target || 'none',
    '| colId:', colId || 'none',
    '| match:', (target && ('#' + colId === target)) ? 'MATCH' : 'MISMATCH',
    '| hasDropdown:', hasDropdown
  );
}
