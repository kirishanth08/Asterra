import fs from 'fs';

const cssPath = 'assets/css/style.css';
let css = fs.readFileSync(cssPath, 'utf8');

const newStyles = `
body.dark .btn-gold:hover,
body.dark .btn-gold:focus,
body.dark .nav-cta:hover,
body.dark .nav-cta:focus,
body.dark .nav-actions .btn-gold:hover,
body.dark .nav-actions .nav-cta:hover,
body.dark a.btn-gold:hover,
body.dark a.btn-gold:focus,
body.dark a.nav-cta:hover,
body.dark a.nav-cta:focus {
  background-color: #ead08d !important;
  border-color: #ead08d !important;
  color: #050d14 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 28px rgba(234, 208, 141, 0.6) !important;
}

/* =====================================================================
   Company Brand Logo - Ultra High-Contrast & Visible in Light & Dark Mode
   ===================================================================== */
.navbar-brand,
body.dark .navbar-brand {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 4px 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 10px !important;
  text-decoration: none !important;
  white-space: nowrap !important;
}

.navbar-brand .brand-mark {
  background: transparent !important;
  border: 1.5px solid #c7a25b !important;
  color: #0b706d !important;
  width: 42px !important;
  height: 42px !important;
  display: grid !important;
  place-items: center !important;
  border-radius: 50% !important;
  box-shadow: none !important;
  flex-shrink: 0 !important;
  transition: transform 0.25s ease !important;
}

.navbar-brand:hover .brand-mark {
  transform: rotate(-8deg) scale(1.06) !important;
}

.navbar-brand .brand-mark i {
  color: #0b706d !important;
  font-size: 1.2rem !important;
  line-height: 1 !important;
  display: block !important;
}

.navbar-brand .brand-name-wrap {
  color: #14283d !important;
  font-family: Georgia, "Times New Roman", serif !important;
  font-weight: 700 !important;
  font-size: 1.25rem !important;
  line-height: 1.05 !important;
  letter-spacing: 0 !important;
}

.navbar-brand .brand-name-wrap small {
  color: #5f6d76 !important;
  display: block !important;
  font-family: Inter, system-ui, sans-serif !important;
  font-weight: 700 !important;
  font-size: 0.52rem !important;
  letter-spacing: 0.16em !important;
  text-transform: uppercase !important;
  margin-top: 3px !important;
  opacity: 1 !important;
}

/* Dark mode navbar brand */
body.dark .navbar-brand {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

body.dark .navbar-brand .brand-name-wrap {
  color: #ffffff !important;
}

body.dark .navbar-brand .brand-name-wrap small {
  color: #a7b5bd !important;
}

body.dark .navbar-brand .brand-mark {
  background: transparent !important;
  border-color: #c7a25b !important;
  color: #63c5c0 !important;
}

body.dark .navbar-brand .brand-mark i {
  color: #ead08d !important;
}

/* =====================================================================
   Navbar Header Controls (RTL & Dark Mode outside hamburger)
   ===================================================================== */
.nav-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.nav-control {
  min-height: 38px;
  border: 1px solid rgba(20,40,61,.14);
  background: #f6f8f7;
  color: #14283d;
  border-radius: 999px;
  padding: 0.42rem 0.72rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 800;
  transition: all 0.25s ease;
  cursor: pointer;
  text-decoration: none;
}

.nav-control:hover {
  background: #edf3f1;
  border-color: rgba(11,112,109,.35);
  color: #0b706d;
  transform: translateY(-2px);
}

body.dark .nav-control {
  background: #172a38;
  border-color: rgba(255,255,255,.14);
  color: #e9f0f2;
}

body.dark .nav-control:hover {
  background: #203b4b;
  color: #ead08d;
  border-color: rgba(199,162,91,.5);
}

.navbar-toggler {
  min-height: 38px;
  border: 1px solid rgba(20,40,61,.18);
  background: #f6f8f7;
  padding: 0.45rem 0.65rem;
  border-radius: 10px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.navbar-toggler:focus {
  box-shadow: 0 0 0 0.2rem rgba(199,162,91,.25);
}

body.dark .navbar-toggler {
  background: #172a38;
  border-color: rgba(255,255,255,.18);
}

body.dark .navbar-toggler-icon {
  filter: invert(1);
}

@media (max-width: 575.98px) {
  .navbar-brand .brand-mark { width: 36px !important; height: 36px !important; }
  .navbar-brand .brand-mark i { font-size: 1.05rem !important; }
  .navbar-brand .brand-name-wrap { font-size: 1.08rem !important; }
  .nav-control { min-height: 36px; padding: 0.32rem 0.55rem; font-size: 0.72rem; }
  .nav-control .theme-label { display: none; }
}

/* =====================================================================
   Responsive Mobile Navbar & Dropdown Fixes (<992px)
   ===================================================================== */
@media (max-width: 991.98px) {
  .site-nav .navbar-collapse {
    margin-top: 0.75rem;
    padding: 1.1rem;
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 18px 45px rgba(20,40,61,.15);
    border: 1px solid rgba(20,40,61,.08);
  }

  body.dark .site-nav .navbar-collapse {
    background: #14232f;
    border-color: rgba(255,255,255,.08);
    box-shadow: 0 18px 45px rgba(0,0,0,.45);
  }

  .site-nav .navbar-nav {
    width: 100%;
    text-align: center;
    gap: 2px;
  }

  .site-nav .nav-link {
    padding: 0.68rem 1rem !important;
    font-size: 1rem;
  }

  .site-nav .dropdown-menu {
    position: static !important;
    transform: none !important;
    border: 1px solid rgba(20,40,61,.08) !important;
    background: #f8faf9 !important;
    border-radius: 12px !important;
    margin: 0.35rem auto !important;
    padding: 0.4rem !important;
    box-shadow: none !important;
    width: 100% !important;
    max-width: 290px !important;
  }

  body.dark .site-nav .dropdown-menu {
    background: #182a37 !important;
    border-color: rgba(255,255,255,.08) !important;
  }

  .site-nav .dropdown-item {
    text-align: center !important;
    padding: 0.55rem 0.8rem !important;
    border-radius: 8px !important;
    font-size: 0.92rem !important;
    font-weight: 600;
  }

  .site-nav .dropdown-item:hover,
  .site-nav .dropdown-item.active {
    background: #edf3f1;
    color: #0b706d;
  }

  body.dark .site-nav .dropdown-item:hover,
  body.dark .site-nav .dropdown-item.active {
    background: #203b4b;
    color: #ead08d;
  }

  .mobile-nav-cta {
    margin-top: 0.65rem;
  }
}
`;

fs.writeFileSync(cssPath, css.trimEnd() + '\n' + newStyles.trim() + '\n');
console.log('Appended styles cleanly to style.css');
