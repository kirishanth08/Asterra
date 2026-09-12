import fs from 'fs';

const files = ['login.html', 'register.html', 'pricing.html', 'coming-soon.html', 'admin-login.html', 'admin-dashboard.html', '404.html'];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes('class="btn btn-brand" href="contact.html#booking"')) {
      content = content.replace('class="btn btn-brand" href="contact.html#booking"', 'class="btn btn-gold nav-cta" href="contact.html#appointment"');
      fs.writeFileSync(f, content, 'utf8');
      console.log('Updated:', f);
    }
  }
});
