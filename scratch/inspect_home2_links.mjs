import fs from 'fs';

const html = fs.readFileSync('home-2.html', 'utf8');
const regex = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
let match;
const links = [];
while ((match = regex.exec(html)) !== null) {
  links.push({
    href: match[1],
    text: match[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ')
  });
}
console.log('Links count:', links.length);
console.log(JSON.stringify(links, null, 2));
