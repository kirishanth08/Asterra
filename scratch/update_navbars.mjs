import fs from 'fs';

const pages = [
  'index.html', 'home-2.html', 'about.html', 'services.html', 'service-details.html',
  'fees.html', 'documents.html', 'blog.html', 'blog-details.html', 'contact.html',
  'pricing.html', 'login.html', 'register.html', 'coming-soon.html', 'admin-login.html',
  'admin-dashboard.html', '404.html'
];

function generateNav(filename) {
  // Determine active states based on filename
  const isHome1 = filename === 'index.html';
  const isHome2 = filename === 'home-2.html';
  const isHome = isHome1 || isHome2;
  const isAbout = filename === 'about.html';
  const isServices = filename === 'services.html' || filename === 'service-details.html';
  const isFees = filename === 'fees.html' || filename === 'pricing.html';
  const isDocuments = filename === 'documents.html';
  const isBlog = filename === 'blog.html' || filename === 'blog-details.html';
  const isContact = filename === 'contact.html';

  return `<nav class="navbar navbar-expand-lg fixed-top site-nav" id="mainNav">
<div class="container">
<a class="navbar-brand d-flex align-items-center gap-2" href="index.html">
<span class="brand-mark"><i class="bi bi-shield-check"></i></span>
<span class="brand-name-wrap">Asterra <small>Notary &amp; Attestation</small></span>
</a>
<div class="nav-header-actions d-flex align-items-center gap-2 ms-auto ms-lg-0 order-lg-last">
<button aria-label="Switch to dark mode" class="nav-control" id="themeToggle" title="Toggle theme" type="button">
<i aria-hidden="true" class="bi bi-sun-fill theme-icon"></i>
<span class="theme-label d-none d-sm-inline">Light</span>
</button>
<button aria-label="Switch to RTL layout" class="nav-control" id="rtlToggle" title="Toggle RTL layout" type="button">
<span>RTL</span>
</button>
<a class="btn btn-gold nav-cta d-none d-lg-inline-flex" href="contact.html#appointment">Book Appointment</a>
<button aria-controls="mainMenu" aria-expanded="false" aria-label="Toggle navigation" class="navbar-toggler ms-1 ms-sm-2" data-bs-target="#mainMenu" data-bs-toggle="collapse" type="button">
<span class="navbar-toggler-icon"></span>
</button>
</div>
<div class="collapse navbar-collapse" id="mainMenu">
<ul class="navbar-nav mx-lg-auto align-items-lg-center">
<li class="nav-item dropdown">
<a aria-expanded="false" class="nav-link ${isHome ? 'active ' : ''}dropdown-toggle nav-animated" data-bs-toggle="dropdown" href="#" id="homeDropdown" role="button">Home</a>
<ul class="dropdown-menu">
<li><a class="dropdown-item ${isHome1 ? 'active' : ''}" href="index.html">Home 1 — General</a></li>
<li><a class="dropdown-item ${isHome2 ? 'active' : ''}" href="home-2.html">Home 2 — Niche</a></li>
</ul>
</li>
<li class="nav-item"><a class="nav-link ${isAbout ? 'active ' : ''}nav-animated" href="about.html">About</a></li>
<li class="nav-item"><a class="nav-link ${isServices ? 'active ' : ''}nav-animated" href="services.html">Services</a></li>
<li class="nav-item"><a class="nav-link ${isFees ? 'active ' : ''}nav-animated" href="fees.html">Fees</a></li>
<li class="nav-item"><a class="nav-link ${isDocuments ? 'active ' : ''}nav-animated" href="documents.html">Documents</a></li>
<li class="nav-item"><a class="nav-link ${isBlog ? 'active ' : ''}nav-animated" href="blog.html">Blog</a></li>
<li class="nav-item"><a class="nav-link ${isContact ? 'active ' : ''}nav-animated" href="contact.html">Contact</a></li>
</ul>
<div class="mobile-nav-cta d-lg-none text-center pt-3 pb-2 border-top">
<a class="btn btn-gold w-100 py-2" href="contact.html#appointment">Book Appointment</a>
</div>
</div>
</div>
</nav>`;
}

for (const file of pages) {
  let content = fs.readFileSync(file, 'utf8');
  const navRegex = /<nav[\s\S]*?<\/nav>/i;
  if (navRegex.test(content)) {
    const newNav = generateNav(file);
    content = content.replace(navRegex, newNav);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated navbar in ${file}`);
  } else {
    console.warn(`No <nav> found in ${file}`);
  }
}
