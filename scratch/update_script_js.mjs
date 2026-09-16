import fs from 'fs';

const jsPath = 'assets/js/script.js';
let code = fs.readFileSync(jsPath, 'utf8');

// Safe blog script
const safeBlogScript = `
/* ===== blog.html :: inline script 2 ===== */
(function(){
document.addEventListener("DOMContentLoaded", function() {
  const items = [...document.querySelectorAll(".blog-item")];
  const buttons = [...document.querySelectorAll(".filter-btn")];
  const search = document.getElementById("blogSearch");
  const empty = document.getElementById("noResults");
  if (!items.length && !buttons.length && !search) return;
  let filter = "all";
  function render() {
    const q = ((search && search.value) || "").toLowerCase().trim();
    let shown = 0;
    items.forEach(i => {
      const okCat = filter === "all" || i.dataset.category === filter;
      const okText = !q || (i.dataset.title && i.dataset.title.toLowerCase().includes(q));
      const show = okCat && okText;
      i.style.display = show ? "" : "none";
      if (show) shown++;
    });
    if (empty) empty.style.display = shown ? "none" : "block";
  }
  buttons.forEach(b => b.addEventListener("click", () => {
    buttons.forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    filter = b.dataset.filter;
    render();
  }));
  if (search) search.addEventListener("input", render);
});
})();
`;

// Unified Navbar & Controls script
const unifiedNavbarScript = `
/* =====================================================================
   Asterra Unified Navigation, Theming, RTL & Mobile Dropdown Controller
   ===================================================================== */
(function() {
  function initAsterraNav() {
    // 1. Theme Manager
    function applyTheme(isDark) {
      document.body.classList.toggle('dark', isDark);
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
      
      // Update all theme toggle buttons across the page
      document.querySelectorAll('#themeToggle, [data-theme-toggle]').forEach(function(btn) {
        const icon = btn.querySelector('.theme-icon, i');
        const label = btn.querySelector('.theme-label');
        if (icon) {
          icon.className = 'bi ' + (isDark ? 'bi-sun-fill' : 'bi-moon-stars-fill') + ' theme-icon';
        }
        if (label) {
          label.textContent = isDark ? 'Dark' : 'Light';
        }
        btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
      });

      localStorage.setItem('asterra-theme', isDark ? 'dark' : 'light');
    }

    // Initialize theme from storage
    const savedTheme = localStorage.getItem('asterra-theme');
    applyTheme(savedTheme === 'dark');

    // Bind theme toggles
    document.querySelectorAll('#themeToggle, [data-theme-toggle]').forEach(function(btn) {
      if (btn.dataset.asterraBound) return;
      btn.dataset.asterraBound = 'true';
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        applyTheme(!document.body.classList.contains('dark'));
      });
    });

    // 2. RTL Manager
    function applyRTL(isRTL) {
      document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
      document.body.classList.toggle('rtl', isRTL);
      
      document.querySelectorAll('#rtlToggle, [data-rtl-toggle]').forEach(function(btn) {
        const span = btn.querySelector('span') || btn;
        span.textContent = isRTL ? 'LTR' : 'RTL';
        btn.setAttribute('aria-label', isRTL ? 'Switch to LTR layout' : 'Switch to RTL layout');
        btn.title = isRTL ? 'Switch to LTR layout' : 'Switch to RTL layout';
      });

      localStorage.setItem('asterra-rtl', isRTL ? 'rtl' : 'ltr');
      localStorage.setItem('asterra-dir', isRTL ? 'rtl' : 'ltr');
    }

    const savedRTL = localStorage.getItem('asterra-rtl') || localStorage.getItem('asterra-dir');
    applyRTL(savedRTL === 'rtl');

    document.querySelectorAll('#rtlToggle, [data-rtl-toggle]').forEach(function(btn) {
      if (btn.dataset.asterraBound) return;
      btn.dataset.asterraBound = 'true';
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const currentRTL = document.documentElement.getAttribute('dir') === 'rtl';
        applyRTL(!currentRTL);
      });
    });

    // 3. Navbar scroll effect
    const nav = document.getElementById('mainNav') || document.querySelector('.site-nav');
    function onScroll() {
      if (nav) {
        nav.classList.toggle('scrolled', window.scrollY > 15);
      }
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // 4. Robust Hamburger & Mobile Collapse Controller
    const togglers = document.querySelectorAll('.navbar-toggler');
    togglers.forEach(function(toggler) {
      if (toggler.dataset.asterraBound) return;
      toggler.dataset.asterraBound = 'true';

      toggler.addEventListener('click', function(e) {
        e.preventDefault();
        const targetSel = toggler.getAttribute('data-bs-target') || '#mainMenu';
        const menu = document.querySelector(targetSel);
        if (!menu) return;

        // Toggle show class
        const isOpen = menu.classList.contains('show');
        if (isOpen) {
          menu.classList.remove('show');
          toggler.setAttribute('aria-expanded', 'false');
          toggler.classList.add('collapsed');
        } else {
          menu.classList.add('show');
          toggler.setAttribute('aria-expanded', 'true');
          toggler.classList.remove('collapsed');
        }
      });
    });

    // 5. Responsive Dropdown Controller (for dropdowns inside mobile hamburger menu)
    const dropdownToggles = document.querySelectorAll('.site-nav .dropdown-toggle, .navbar .dropdown-toggle');
    dropdownToggles.forEach(function(ddToggle) {
      if (ddToggle.dataset.asterraBound) return;
      ddToggle.dataset.asterraBound = 'true';

      ddToggle.addEventListener('click', function(e) {
        // In responsive mode (<992px)
        if (window.innerWidth < 992) {
          e.preventDefault();
          e.stopPropagation();

          const parent = ddToggle.closest('.dropdown');
          const menu = parent ? parent.querySelector('.dropdown-menu') : null;
          if (!menu) return;

          const isExpanded = ddToggle.getAttribute('aria-expanded') === 'true' || menu.classList.contains('show');
          if (isExpanded) {
            menu.classList.remove('show');
            ddToggle.classList.remove('show');
            ddToggle.setAttribute('aria-expanded', 'false');
          } else {
            // Close other dropdowns in this navbar
            const navRoot = ddToggle.closest('.navbar');
            if (navRoot) {
              navRoot.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
              navRoot.querySelectorAll('.dropdown-toggle.show').forEach(t => {
                t.classList.remove('show');
                t.setAttribute('aria-expanded', 'false');
              });
            }
            menu.classList.add('show');
            ddToggle.classList.add('show');
            ddToggle.setAttribute('aria-expanded', 'true');
          }
        }
      });
    });

    // 6. Close mobile menu when regular navigation link is clicked
    document.querySelectorAll('.navbar-collapse a:not(.dropdown-toggle)').forEach(function(link) {
      link.addEventListener('click', function() {
        if (window.innerWidth < 992) {
          const menu = link.closest('.navbar-collapse');
          const toggler = document.querySelector('.navbar-toggler');
          if (menu && menu.classList.contains('show')) {
            menu.classList.remove('show');
            if (toggler) {
              toggler.setAttribute('aria-expanded', 'false');
              toggler.classList.add('collapsed');
            }
          }
        }
      });
    });

    // 7. Highlight active nav link based on current URL
    const curPath = location.pathname.split('/').pop().toLowerCase() || 'index.html';
    document.querySelectorAll('.navbar a[href]').forEach(function(link) {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http')) return;
      const target = href.split('/').pop().split('#')[0].toLowerCase();
      if (target === curPath) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
        const d = link.closest('.dropdown');
        if (d) {
          const t = d.querySelector('.dropdown-toggle');
          if (t) {
            t.classList.add('active');
            t.setAttribute('aria-current', 'page');
          }
        }
      }
    });

    // 8. Dynamic copyright year
    document.querySelectorAll('[data-year]').forEach(function(el) {
      el.textContent = new Date().getFullYear();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAsterraNav);
  } else {
    initAsterraNav();
  }
})();
`;

// Insert safeBlogScript if blog.html section is there
if (code.includes('/* ===== blog.html :: inline script 2 ===== */')) {
  const parts = code.split('/* ===== blog.html :: inline script 2 ===== */');
  const rest = parts[1].split('/* ===== coming-soon.html :: inline script 1 ===== */');
  code = parts[0] + safeBlogScript + '\n/* ===== coming-soon.html :: inline script 1 ===== */' + rest[1];
}

// Append unified navbar script at end
code = code.trimEnd() + '\n\n' + unifiedNavbarScript.trim() + '\n';

fs.writeFileSync(jsPath, code);
console.log('Successfully updated assets/js/script.js with safe blog handler and unified navbar controller.');
