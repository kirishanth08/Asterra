/* =====================================================================
   Asterra Global Utilities: Filters & Search
   ===================================================================== */
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // 1. Filter buttons (Services, Blog, Documents, etc.)
    document.querySelectorAll('[data-filter]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const root = btn.closest('.filter-bar') || document;
        root.querySelectorAll('[data-filter]').forEach(x => x.classList.remove('active'));
        this.classList.add('active');
        const filterVal = this.dataset.filter;
        document.querySelectorAll('[data-category]').forEach(function(el) {
          el.style.display = (filterVal === 'all' || el.dataset.category === filterVal) ? '' : 'none';
        });
      });
    });

    // 2. Search box (Blog search)
    const blogSearch = document.getElementById('blogSearch');
    if (blogSearch) {
      blogSearch.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        let matched = 0;
        document.querySelectorAll('#blogGrid .blog-item').forEach(function(item) {
          const title = (item.dataset.title || '').toLowerCase();
          const text = item.textContent.toLowerCase();
          const matches = !query || title.includes(query) || text.includes(query);
          item.style.display = matches ? '' : 'none';
          if (matches) matched++;
        });
        const noResults = document.getElementById('noResults');
        if (noResults) {
          noResults.style.display = matched === 0 ? 'block' : 'none';
        }
      });
    }
  });
})();(function(){
document.addEventListener("DOMContentLoaded",function(){const form=document.getElementById("commentForm"),success=document.getElementById("commentSuccess");if(!form)return;form.addEventListener("submit",function(e){e.preventDefault();if(!form.checkValidity()){form.classList.add("was-validated");return;}form.classList.add("was-validated");success.classList.remove("d-none");form.reset();form.classList.remove("was-validated");success.scrollIntoView({behavior:"smooth",block:"center"});});});
})();

/* ===== blog.html :: inline script 1 ===== */
(function(){
// [cleaned legacy toggle]: document.addEventListener('DOMContentLoaded',function(){const b=document.body,r=document.documentElement,t=document.getElementById('themeToggle'),x=document.getElementById('rtlToggle');b.classList.toggle('dark',(localStorage.getItem('asterra-theme')||'light')==='dark');r.setAttribute('dir',localStorage.getItem('asterra-dir')||'ltr');function icon(){if(!t)return;const d=b.classList.contains('dark'),i=t.querySelector('.theme-icon'),l=t.querySelector('.theme-label');if(i)i.className='bi '+(d?'bi-sun-fill':'bi-moon-stars-fill')+' theme-icon';if(l)l.textContent=d?'Dark':'Light';}icon();t&&t.addEventListener('click',function(){b.classList.toggle('dark');localStorage.setItem('asterra-theme',b.classList.contains('dark')?'dark':'light');icon()});x&&x.addEventListener('click',function(){const d=r.getAttribute('dir')==='rtl'?'ltr':'rtl';r.setAttribute('dir',d);localStorage.setItem('asterra-dir',d)});const cur=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('nav a[href]').forEach(a=>{if(a.getAttribute('href')===cur){a.classList.add('active');a.setAttribute('aria-current','page');a.closest('.dropdown')?.querySelector('.dropdown-toggle')?.classList.add('active')}});document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());});
})();


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

/* ===== Unified Asterra Form Success System ===== */
(function() {
  function handleFormSuccess(form) {
    if (!form || form.dataset.asterraHandled) return;
    form.dataset.asterraHandled = 'true';

    // 1. Contact / Appointment form
    if (form.id === 'contactForm') {
      const success = document.getElementById('successMessage');
      const date = document.getElementById('date');
      if (date) date.min = new Date().toISOString().split('T')[0];
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.classList.add('was-validated');
          if (success) {
            success.classList.add('d-none');
            success.classList.remove('d-flex');
          }
          return;
        }
        form.classList.add('was-validated');
        if (success) {
          success.classList.remove('d-none');
          success.classList.add('d-flex');
        }
        form.reset();
        form.classList.remove('was-validated');
        if (success) {
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      return;
    }

    // 2. Admin login form
    if (form.id === 'adminLogin') {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const success = document.getElementById('adminLoginSuccess');
        const btn = document.getElementById('adminLoginBtn') || form.querySelector('button');
        if (success) {
          success.classList.remove('d-none');
          success.classList.add('d-flex');
        }
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Signing in...';
        }
        setTimeout(function() {
          location.href = 'admin-dashboard.html';
        }, 1000);
      });
      return;
    }

    // 3. Blog comment form
    if (form.id === 'commentForm') {
      const success = document.getElementById('commentSuccess');
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.classList.add('was-validated');
          return;
        }
        form.classList.add('was-validated');
        if (success) {
          success.classList.remove('d-none');
          success.classList.add('d-flex');
        }
        form.reset();
        form.classList.remove('was-validated');
        if (success) {
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      return;
    }

    // 4. All other forms (Client login, register, newsletter / coming-soon, demo forms)
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (form.checkValidity && !form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      form.classList.remove('was-validated');

      let alertBox = form.querySelector('.form-alert');
      if (!alertBox) {
        alertBox = document.createElement('div');
        alertBox.className = 'form-alert mt-3';
        form.appendChild(alertBox);
      }

      const path = location.pathname.split('/').pop().toLowerCase();
      if (path === 'login.html') {
        alertBox.className = 'alert alert-success form-alert mt-3 d-flex align-items-center gap-2 p-3 rounded-3 shadow-sm';
        alertBox.innerHTML = '<i class="bi bi-check-circle-fill text-success fs-5 flex-shrink-0"></i><div><strong>Sign in successful!</strong> Welcome back to your Asterra client account.</div>';
      } else if (path === 'register.html') {
        alertBox.className = 'alert alert-success form-alert mt-3 d-flex align-items-center gap-2 p-3 rounded-3 shadow-sm';
        alertBox.innerHTML = '<i class="bi bi-check-circle-fill text-success fs-5 flex-shrink-0"></i><div><strong>Account created successfully!</strong> Welcome to Asterra. You can now <a href="login.html" class="alert-link text-decoration-underline fw-bold">Sign In</a> to access your portal.</div>';
      } else if (path === 'coming-soon.html') {
        alertBox.className = 'alert alert-success form-alert mt-3 d-flex align-items-center justify-content-center gap-2 p-3 rounded-3 shadow-sm text-start';
        alertBox.innerHTML = '<i class="bi bi-check-circle-fill text-success fs-5 flex-shrink-0"></i><div><strong>Subscription Confirmed!</strong> Thank you for your interest. We will notify you as soon as this service is live.</div>';
      } else {
        alertBox.className = 'alert alert-success form-alert mt-3 d-flex align-items-center gap-2 p-3 rounded-3 shadow-sm';
        alertBox.innerHTML = '<i class="bi bi-check-circle-fill text-success fs-5 flex-shrink-0"></i><div><strong>Request submitted successfully!</strong> Thank you, your information has been recorded.</div>';
      }

      form.reset();
      alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  function initForms() {
    document.querySelectorAll('form').forEach(handleFormSuccess);

    // Also handle internal note save button in admin dashboard
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    if (saveNoteBtn && !saveNoteBtn.dataset.handled) {
      saveNoteBtn.dataset.handled = 'true';
      const noteText = document.getElementById('internalNoteText');
      const noteAlert = document.getElementById('noteSavedAlert');
      saveNoteBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (noteAlert) {
          noteAlert.classList.remove('d-none');
          noteAlert.classList.add('d-flex');
          setTimeout(function() {
            if (noteText) noteText.value = '';
            setTimeout(function() {
              noteAlert.classList.add('d-none');
              noteAlert.classList.remove('d-flex');
            }, 3500);
          }, 600);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForms);
  } else {
    initForms();
  }
})();

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
    // If Bootstrap 5 is active, Bootstrap's data-api handles [data-bs-toggle="collapse"] smoothly.
    // If Bootstrap is not loaded (offline/CDN blocked), provide full vanilla fallback.
    if (typeof bootstrap === 'undefined') {
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
    }

    // 5. Responsive / Fallback Dropdown Controller (for offline / CDN blocked environments)
    if (typeof bootstrap === 'undefined') {
      const dropdownToggles = document.querySelectorAll('.site-nav .dropdown-toggle, .navbar .dropdown-toggle');
      dropdownToggles.forEach(function(ddToggle) {
        if (ddToggle.dataset.asterraBound) return;
        ddToggle.dataset.asterraBound = 'true';

        ddToggle.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();

          const parent = ddToggle.closest('.dropdown');
          const menu = parent ? parent.querySelector('.dropdown-menu') : null;
          if (!menu) return;

          const isExpanded = menu.classList.contains('show');

          // Close sibling dropdowns
          const navRoot = ddToggle.closest('.navbar') || document;
          navRoot.querySelectorAll('.dropdown-menu.show').forEach(function(m) {
            if (m !== menu) m.classList.remove('show');
          });
          navRoot.querySelectorAll('.dropdown-toggle.show').forEach(function(t) {
            if (t !== ddToggle) {
              t.classList.remove('show');
              t.setAttribute('aria-expanded', 'false');
            }
          });

          if (isExpanded) {
            menu.classList.remove('show');
            ddToggle.classList.remove('show');
            ddToggle.setAttribute('aria-expanded', 'false');
          } else {
            menu.classList.add('show');
            ddToggle.classList.add('show');
            ddToggle.setAttribute('aria-expanded', 'true');
          }
        });
      });

      // Close open dropdowns when clicking outside
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
          document.querySelectorAll('.navbar .dropdown-menu.show').forEach(function(m) {
            m.classList.remove('show');
          });
          document.querySelectorAll('.navbar .dropdown-toggle.show').forEach(function(t) {
            t.classList.remove('show');
            t.setAttribute('aria-expanded', 'false');
          });
        }
      });
    }

    // 6. Close mobile menu when regular navigation link is clicked or when tapping outside
    function closeMobileMenu() {
      const openMenu = document.querySelector('.navbar-collapse.show');
      if (!openMenu) return;
      if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
        const bsCollapse = bootstrap.Collapse.getInstance(openMenu) || new bootstrap.Collapse(openMenu, { toggle: false });
        bsCollapse.hide();
      } else {
        openMenu.classList.remove('show');
        const toggler = document.querySelector('.navbar-toggler');
        if (toggler) {
          toggler.setAttribute('aria-expanded', 'false');
          toggler.classList.add('collapsed');
        }
      }
    }

    document.querySelectorAll('.navbar-collapse a:not(.dropdown-toggle)').forEach(function(link) {
      link.addEventListener('click', function() {
        if (window.innerWidth < 992) {
          closeMobileMenu();
        }
      });
    });

    document.addEventListener('click', function(e) {
      if (window.innerWidth < 992) {
        const openMenu = document.querySelector('.navbar-collapse.show');
        if (openMenu && !openMenu.contains(e.target) && !e.target.closest('.navbar-toggler')) {
          closeMobileMenu();
        }
      }
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

    // 9. Immediate reveal for above-the-fold elements and fallback
    function triggerReveals() {
      document.querySelectorAll('.reveal:not(.show)').forEach(function(el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100) {
          el.classList.add('show');
        }
      });
    }
    triggerReveals();
    window.addEventListener('scroll', triggerReveals, { passive: true });
    window.addEventListener('resize', triggerReveals, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAsterraNav);
  } else {
    initAsterraNav();
  }
})();
