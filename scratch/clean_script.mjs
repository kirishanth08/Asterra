import fs from 'fs';

let code = fs.readFileSync('assets/js/script.js', 'utf8');

// Find where the unified controller starts
const marker = '/* =====================================================================\n   Asterra Unified Navigation, Theming, RTL & Mobile Dropdown Controller';
const idx = code.indexOf('Asterra Unified Navigation, Theming, RTL & Mobile Dropdown Controller');

if (idx === -1) {
  console.error('Marker not found!');
  process.exit(1);
}

// In the pre-unified section, comment out or remove all references to themeToggle, rtlToggle, data-theme-toggle, and data-rtl-toggle
const prePart = code.substring(0, idx);
const postPart = code.substring(idx);

// Replace lines in prePart that bind theme/rtl
const cleanedPre = prePart.split('\n').map(line => {
  if (line.includes('themeToggle') || line.includes('rtlToggle') || 
      line.includes('data-theme-toggle') || line.includes('data-rtl-toggle') ||
      line.includes('localStorage.getItem("asterra-theme")') ||
      line.includes("localStorage.getItem('asterra-theme')") ||
      line.includes('localStorage.getItem("asterra-dir")') ||
      line.includes("localStorage.getItem('asterra-dir')") ||
      line.includes('localStorage.getItem("asterra-rtl")') ||
      line.includes("localStorage.getItem('asterra-rtl')")) {
    return '// [cleaned legacy toggle]: ' + line;
  }
  return line;
}).join('\n');

fs.writeFileSync('assets/js/script.js', cleanedPre + postPart, 'utf8');
console.log('Successfully neutralized legacy listeners in prePart.');
