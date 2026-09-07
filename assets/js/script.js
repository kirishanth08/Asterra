/* ===== 404.html :: inline script 1 ===== */
(function(){
document.addEventListener('DOMContentLoaded',function(){
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
 document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
 const theme=document.querySelector('[data-theme-toggle]');
 if(theme){theme.addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('asterra-theme',document.body.classList.contains('dark')?'dark':'light')});if(localStorage.getItem('asterra-theme')==='dark')document.body.classList.add('dark')}
 const rtl=document.querySelector('[data-rtl-toggle]');
 if(rtl){rtl.addEventListener('click',()=>{document.body.classList.toggle('rtl');document.documentElement.dir=document.body.classList.contains('rtl')?'rtl':'ltr';localStorage.setItem('asterra-rtl',document.body.classList.contains('rtl')?'rtl':'ltr')});if(localStorage.getItem('asterra-rtl')==='rtl'){document.body.classList.add('rtl');document.documentElement.dir='rtl'}}
 document.querySelectorAll('form[data-demo]').forEach(form=>form.addEventListener('submit',function(e){e.preventDefault();let a=form.querySelector('.form-alert');if(a){a.className='alert alert-success form-alert mt-3';a.textContent='Thanks — your request has been recorded in this demo. Connect this form to your backend/API for production use.'}}));
 document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',function(){document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));this.classList.add('active');let f=this.dataset.filter;document.querySelectorAll('[data-category]').forEach(x=>x.style.display=(f==='all'||x.dataset.category===f)?'':'none')}));
});
})();

/* ===== about.html :: inline script 1 ===== */
(function(){
document.addEventListener('DOMContentLoaded',function(){
 document.querySelectorAll('.reveal').forEach(function(el){new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('show');o.unobserve(e.target)}})},{threshold:.1}).observe(el)});
 document.querySelectorAll('[data-year]').forEach(function(e){e.textContent=new Date().getFullYear()});
 var path=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('#mainMenu .nav-link,#mainMenu .dropdown-item').forEach(function(a){a.classList.remove('active');if(a.getAttribute('href')===path){a.classList.add('active');var p=a.closest('.dropdown');if(p){var t=p.querySelector('.dropdown-toggle');if(t)t.classList.add('active')}}});
 var tt=document.getElementById('themeToggle'),ti=tt&&tt.querySelector('.theme-icon'),tl=tt&&tt.querySelector('.theme-label');function theme(d){document.body.classList.toggle('dark',d);if(ti)ti.className='bi theme-icon '+(d?'bi-moon-stars-fill':'bi-sun-fill');if(tl)tl.textContent=d?'Dark':'Light';if(tt)tt.setAttribute('aria-label',d?'Switch to light mode':'Switch to dark mode');localStorage.setItem('asterra-theme',d?'dark':'light')}theme(localStorage.getItem('asterra-theme')==='dark');if(tt)tt.onclick=function(){theme(!document.body.classList.contains('dark'))};
 var rt=document.getElementById('rtlToggle');function rtl(d){document.documentElement.dir=d?'rtl':'ltr';document.body.classList.toggle('rtl',d);if(rt){rt.innerHTML='<span>'+(d?'LTR':'RTL')+'</span>';rt.setAttribute('aria-label',d?'Switch to LTR layout':'Switch to RTL layout')}localStorage.setItem('asterra-rtl',d?'rtl':'ltr')}rtl(localStorage.getItem('asterra-rtl')==='rtl');if(rt)rt.onclick=function(){rtl(document.documentElement.dir!=='rtl')};
 var nav=document.getElementById('mainNav');function n(){if(nav)nav.classList.toggle('scrolled',scrollY>18)}n();addEventListener('scroll',n,{passive:true});
 document.querySelectorAll('#mainMenu a:not(.dropdown-toggle)').forEach(function(a){a.addEventListener('click',function(){if(innerWidth<992){var m=document.getElementById('mainMenu');if(m&&m.classList.contains('show'))bootstrap.Collapse.getOrCreateInstance(m).hide()}})});
});
})();

/* ===== admin-dashboard.html :: inline script 1 ===== */
(function(){
document.addEventListener('DOMContentLoaded',function(){
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
 document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
 const theme=document.querySelector('[data-theme-toggle]');
 if(theme){theme.addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('asterra-theme',document.body.classList.contains('dark')?'dark':'light')});if(localStorage.getItem('asterra-theme')==='dark')document.body.classList.add('dark')}
 const rtl=document.querySelector('[data-rtl-toggle]');
 if(rtl){rtl.addEventListener('click',()=>{document.body.classList.toggle('rtl');document.documentElement.dir=document.body.classList.contains('rtl')?'rtl':'ltr';localStorage.setItem('asterra-rtl',document.body.classList.contains('rtl')?'rtl':'ltr')});if(localStorage.getItem('asterra-rtl')==='rtl'){document.body.classList.add('rtl');document.documentElement.dir='rtl'}}
 document.querySelectorAll('form[data-demo]').forEach(form=>form.addEventListener('submit',function(e){e.preventDefault();let a=form.querySelector('.form-alert');if(a){a.className='alert alert-success form-alert mt-3';a.textContent='Thanks — your request has been recorded in this demo. Connect this form to your backend/API for production use.'}}));
 document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',function(){document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));this.classList.add('active');let f=this.dataset.filter;document.querySelectorAll('[data-category]').forEach(x=>x.style.display=(f==='all'||x.dataset.category===f)?'':'none')}));
});
})();

/* ===== admin-login.html :: inline script 1 ===== */
(function(){
document.addEventListener('DOMContentLoaded',function(){
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
 document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
 const theme=document.querySelector('[data-theme-toggle]');
 if(theme){theme.addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('asterra-theme',document.body.classList.contains('dark')?'dark':'light')});if(localStorage.getItem('asterra-theme')==='dark')document.body.classList.add('dark')}
 const rtl=document.querySelector('[data-rtl-toggle]');
 if(rtl){rtl.addEventListener('click',()=>{document.body.classList.toggle('rtl');document.documentElement.dir=document.body.classList.contains('rtl')?'rtl':'ltr';localStorage.setItem('asterra-rtl',document.body.classList.contains('rtl')?'rtl':'ltr')});if(localStorage.getItem('asterra-rtl')==='rtl'){document.body.classList.add('rtl');document.documentElement.dir='rtl'}}
 document.querySelectorAll('form[data-demo]').forEach(form=>form.addEventListener('submit',function(e){e.preventDefault();let a=form.querySelector('.form-alert');if(a){a.className='alert alert-success form-alert mt-3';a.textContent='Thanks — your request has been recorded in this demo. Connect this form to your backend/API for production use.'}}));
 document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',function(){document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));this.classList.add('active');let f=this.dataset.filter;document.querySelectorAll('[data-category]').forEach(x=>x.style.display=(f==='all'||x.dataset.category===f)?'':'none')}));
});
document.getElementById('adminLogin').addEventListener('submit',e=>{e.preventDefault();location.href='admin-dashboard.html'});
})();

/* ===== blog-details.html :: inline script 1 ===== */
(function(){
document.addEventListener("DOMContentLoaded",function(){const b=document.body,r=document.documentElement;b.classList.toggle("dark",(localStorage.getItem("asterra-theme")||"light")==="dark");r.setAttribute("dir",localStorage.getItem("asterra-dir")||"ltr");const t=document.getElementById("themeToggle"),x=document.getElementById("rtlToggle");function icon(){if(!t)return;const d=b.classList.contains("dark"),i=t.querySelector(".theme-icon"),l=t.querySelector(".theme-label");if(i)i.className="bi "+(d?"bi-sun-fill":"bi-moon-stars-fill")+" theme-icon";if(l)l.textContent=d?"Dark":"Light"}icon();t&&t.addEventListener("click",function(){b.classList.toggle("dark");localStorage.setItem("asterra-theme",b.classList.contains("dark")?"dark":"light");icon()});x&&x.addEventListener("click",function(){const d=r.getAttribute("dir")==="rtl"?"ltr":"rtl";r.setAttribute("dir",d);localStorage.setItem("asterra-dir",d)});const cur=location.pathname.split("/").pop()||"index.html";document.querySelectorAll("nav a[href]").forEach(a=>{if(a.getAttribute("href")===cur){a.classList.add("active");a.setAttribute("aria-current","page");a.closest(".dropdown")?.querySelector(".dropdown-toggle")?.classList.add("active")}});document.querySelectorAll("[data-year]").forEach(e=>e.textContent=new Date().getFullYear())});
})();

/* ===== blog-details.html :: inline script 2 ===== */
(function(){
document.addEventListener("DOMContentLoaded",function(){const form=document.getElementById("commentForm"),success=document.getElementById("commentSuccess");if(!form)return;form.addEventListener("submit",function(e){e.preventDefault();if(!form.checkValidity()){form.classList.add("was-validated");return;}form.classList.add("was-validated");success.classList.remove("d-none");form.reset();form.classList.remove("was-validated");success.scrollIntoView({behavior:"smooth",block:"center"});});});
})();

/* ===== blog.html :: inline script 1 ===== */
(function(){
document.addEventListener('DOMContentLoaded',function(){const b=document.body,r=document.documentElement,t=document.getElementById('themeToggle'),x=document.getElementById('rtlToggle');b.classList.toggle('dark',(localStorage.getItem('asterra-theme')||'light')==='dark');r.setAttribute('dir',localStorage.getItem('asterra-dir')||'ltr');function icon(){if(!t)return;const d=b.classList.contains('dark'),i=t.querySelector('.theme-icon'),l=t.querySelector('.theme-label');if(i)i.className='bi '+(d?'bi-sun-fill':'bi-moon-stars-fill')+' theme-icon';if(l)l.textContent=d?'Dark':'Light';}icon();t&&t.addEventListener('click',function(){b.classList.toggle('dark');localStorage.setItem('asterra-theme',b.classList.contains('dark')?'dark':'light');icon()});x&&x.addEventListener('click',function(){const d=r.getAttribute('dir')==='rtl'?'ltr':'rtl';r.setAttribute('dir',d);localStorage.setItem('asterra-dir',d)});const cur=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('nav a[href]').forEach(a=>{if(a.getAttribute('href')===cur){a.classList.add('active');a.setAttribute('aria-current','page');a.closest('.dropdown')?.querySelector('.dropdown-toggle')?.classList.add('active')}});document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());});
})();

/* ===== blog.html :: inline script 2 ===== */
(function(){
document.addEventListener("DOMContentLoaded",function(){const items=[...document.querySelectorAll(".blog-item")],buttons=[...document.querySelectorAll(".filter-btn")],search=document.getElementById("blogSearch"),empty=document.getElementById("noResults");let filter="all";function render(){const q=(search.value||"").toLowerCase().trim();let shown=0;items.forEach(i=>{const okCat=filter==="all"||i.dataset.category===filter;const okText=!q||i.dataset.title.includes(q);const show=okCat&&okText;i.style.display=show?"":"none";if(show)shown++});empty.style.display=shown?"none":"block"}buttons.forEach(b=>b.addEventListener("click",()=>{buttons.forEach(x=>x.classList.remove("active"));b.classList.add("active");filter=b.dataset.filter;render()}));search.addEventListener("input",render);});
})();

/* ===== coming-soon.html :: inline script 1 ===== */
(function(){
document.addEventListener('DOMContentLoaded',function(){
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
 document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
 const theme=document.querySelector('[data-theme-toggle]');
 if(theme){theme.addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('asterra-theme',document.body.classList.contains('dark')?'dark':'light')});if(localStorage.getItem('asterra-theme')==='dark')document.body.classList.add('dark')}
 const rtl=document.querySelector('[data-rtl-toggle]');
 if(rtl){rtl.addEventListener('click',()=>{document.body.classList.toggle('rtl');document.documentElement.dir=document.body.classList.contains('rtl')?'rtl':'ltr';localStorage.setItem('asterra-rtl',document.body.classList.contains('rtl')?'rtl':'ltr')});if(localStorage.getItem('asterra-rtl')==='rtl'){document.body.classList.add('rtl');document.documentElement.dir='rtl'}}
 document.querySelectorAll('form[data-demo]').forEach(form=>form.addEventListener('submit',function(e){e.preventDefault();let a=form.querySelector('.form-alert');if(a){a.className='alert alert-success form-alert mt-3';a.textContent='Thanks — your request has been recorded in this demo. Connect this form to your backend/API for production use.'}}));
 document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',function(){document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));this.classList.add('active');let f=this.dataset.filter;document.querySelectorAll('[data-category]').forEach(x=>x.style.display=(f==='all'||x.dataset.category===f)?'':'none')}));
});
})();

/* ===== contact.html :: inline script 1 ===== */
(function(){
document.addEventListener('DOMContentLoaded',function(){const b=document.body,r=document.documentElement;b.classList.toggle('dark',(localStorage.getItem('asterra-theme')||'light')==='dark');r.setAttribute('dir',localStorage.getItem('asterra-dir')||'ltr');const t=document.getElementById('themeToggle'),x=document.getElementById('rtlToggle');function icon(){if(!t)return;const d=b.classList.contains('dark'),i=t.querySelector('.theme-icon'),l=t.querySelector('.theme-label');if(i)i.className='bi '+(d?'bi-sun-fill':'bi-moon-stars-fill')+' theme-icon';if(l)l.textContent=d?'Dark':'Light';t.setAttribute('aria-label',d?'Switch to light mode':'Switch to dark mode')}icon();t&&t.addEventListener('click',function(){b.classList.toggle('dark');localStorage.setItem('asterra-theme',b.classList.contains('dark')?'dark':'light');icon()});x&&x.addEventListener('click',function(){const d=r.getAttribute('dir')==='rtl'?'ltr':'rtl';r.setAttribute('dir',d);localStorage.setItem('asterra-dir',d)});const cur=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('nav a[href]').forEach(a=>{if(a.getAttribute('href')===cur){a.classList.add('active');a.setAttribute('aria-current','page');a.closest('.dropdown')?.querySelector('.dropdown-toggle')?.classList.add('active')}});document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());
const form=document.getElementById('contactForm'),success=document.getElementById('successMessage'),date=document.getElementById('date');if(date)date.min=new Date().toISOString().split('T')[0];form.addEventListener('submit',function(e){e.preventDefault();if(!form.checkValidity()){form.classList.add('was-validated');success.style.display='none';return}form.classList.add('was-validated');success.style.display='block';form.reset();form.classList.remove('was-validated');success.scrollIntoView({behavior:'smooth',block:'center'});});});
})();

/* ===== documents.html :: inline script 1 ===== */
(function(){
document.addEventListener('DOMContentLoaded',function(){const b=document.body,r=document.documentElement,t=document.getElementById('themeToggle'),x=document.getElementById('rtlToggle');b.classList.toggle('dark',(localStorage.getItem('asterra-theme')||'light')==='dark');r.setAttribute('dir',localStorage.getItem('asterra-dir')||'ltr');function icon(){if(!t)return;const d=b.classList.contains('dark'),i=t.querySelector('.theme-icon'),l=t.querySelector('.theme-label');if(i)i.className='bi '+(d?'bi-sun-fill':'bi-moon-stars-fill')+' theme-icon';if(l)l.textContent=d?'Dark':'Light';}icon();t&&t.addEventListener('click',function(){b.classList.toggle('dark');localStorage.setItem('asterra-theme',b.classList.contains('dark')?'dark':'light');icon()});x&&x.addEventListener('click',function(){const d=r.getAttribute('dir')==='rtl'?'ltr':'rtl';r.setAttribute('dir',d);localStorage.setItem('asterra-dir',d)});const cur=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('nav a[href]').forEach(a=>{if(a.getAttribute('href')===cur){a.classList.add('active');a.setAttribute('aria-current','page');a.closest('.dropdown')?.querySelector('.dropdown-toggle')?.classList.add('active')}});document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());});
})();

/* ===== fees.html :: inline script 1 ===== */
(function(){
document.addEventListener("DOMContentLoaded",function(){
  const body=document.body,root=document.documentElement;
  const savedTheme=localStorage.getItem("asterra-theme")||"light";
  const savedDir=localStorage.getItem("asterra-dir")||"ltr";
  body.classList.toggle("dark",savedTheme==="dark");
  root.setAttribute("dir",savedDir);

  const themeBtn=document.getElementById("themeToggle");
  const rtlBtn=document.getElementById("rtlToggle");

  function updateThemeButton(){
    if(!themeBtn)return;
    const dark=body.classList.contains("dark");
    const icon=themeBtn.querySelector(".theme-icon");
    const label=themeBtn.querySelector(".theme-label");
    if(icon) icon.className="bi "+(dark?"bi-sun-fill":"bi-moon-stars-fill")+" theme-icon";
    if(label) label.textContent=dark?"Dark":"Light";
    themeBtn.setAttribute("aria-label",dark?"Switch to light mode":"Switch to dark mode");
  }
  updateThemeButton();

  themeBtn&&themeBtn.addEventListener("click",function(){
    body.classList.toggle("dark");
    localStorage.setItem("asterra-theme",body.classList.contains("dark")?"dark":"light");
    updateThemeButton();
  });

  rtlBtn&&rtlBtn.addEventListener("click",function(){
    const next=root.getAttribute("dir")==="rtl"?"ltr":"rtl";
    root.setAttribute("dir",next);
    localStorage.setItem("asterra-dir",next);
  });

  const current=location.pathname.split("/").pop()||"index.html";
  document.querySelectorAll("nav a[href]").forEach(function(a){
    if(a.getAttribute("href")===current){
      a.classList.add("active");
      a.setAttribute("aria-current","page");
      const dropdown=a.closest(".dropdown");
      if(dropdown){
        const toggle=dropdown.querySelector(".dropdown-toggle");
        if(toggle)toggle.classList.add("active");
      }
    }
  });

  document.querySelectorAll("[data-year]").forEach(function(el){el.textContent=new Date().getFullYear()});
});
})();

/* ===== home-2.html :: inline script 1 ===== */
(function(){
document.addEventListener('DOMContentLoaded', function () {
  /* Scroll reveal */
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) entry.target.classList.add('show');
    });
  }, { threshold: 0.10 });
  document.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });

  /* Dynamic year */
  document.querySelectorAll('[data-year]').forEach(function(el) {
    el.textContent = new Date().getFullYear();
  });

  /* Theme toggle */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;
  const themeLabel = themeToggle ? themeToggle.querySelector('.theme-label') : null;

  function applyTheme(mode) {
    const dark = mode === 'dark';
    document.body.classList.toggle('dark', dark);
    if (themeIcon) {
      themeIcon.className = 'bi theme-icon ' + (dark ? 'bi-moon-stars-fill' : 'bi-sun-fill');
    }
    if (themeLabel) themeLabel.textContent = dark ? 'Dark' : 'Light';
    if (themeToggle) themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    localStorage.setItem('asterra-theme', dark ? 'dark' : 'light');
  }

  applyTheme(localStorage.getItem('asterra-theme') === 'dark' ? 'dark' : 'light');

  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
    });
  }

  /* RTL toggle */
  const rtlToggle = document.getElementById('rtlToggle');

  function applyRTL(isRTL) {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', isRTL);
    if (rtlToggle) {
      rtlToggle.innerHTML = '<span>' + (isRTL ? 'LTR' : 'RTL') + '</span>';
      rtlToggle.setAttribute('aria-label', isRTL ? 'Switch to LTR layout' : 'Switch to RTL layout');
    }
    localStorage.setItem('asterra-rtl', isRTL ? 'rtl' : 'ltr');
  }

  applyRTL(localStorage.getItem('asterra-rtl') === 'rtl');

  if (rtlToggle) {
    rtlToggle.addEventListener('click', function() {
      applyRTL(document.documentElement.dir !== 'rtl');
    });
  }

  /* Navbar scroll state */
  const nav = document.getElementById('mainNav');
  function updateNav() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 18);
  }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  /* Mobile menu closes after navigation */
  document.querySelectorAll('#mainMenu a:not(.dropdown-toggle)').forEach(function(link) {
    link.addEventListener('click', function() {
      if (window.innerWidth < 992) {
        const menu = document.getElementById('mainMenu');
        if (menu && menu.classList.contains('show')) {
          bootstrap.Collapse.getOrCreateInstance(menu).hide();
        }
      }
    });
  });

  /* Demo forms */
  document.querySelectorAll('form[data-demo]').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const alertBox = form.querySelector('.form-alert');
      if (alertBox) {
        alertBox.className = 'alert alert-success form-alert mt-3';
        alertBox.textContent = 'Thanks — your request has been recorded in this demo. Connect this form to your backend/API for production use.';
      }
    });
  });

  /* Blog filters */
  document.querySelectorAll('[data-filter]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('[data-filter]').forEach(function(x) { x.classList.remove('active'); });
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('[data-category]').forEach(function(item) {
        item.style.display = (filter === 'all' || item.dataset.category === filter) ? '' : 'none';
      });
    });
  });
});
})();

/* ===== index.html :: inline script 1 ===== */
(function(){
document.addEventListener('DOMContentLoaded', function () {
  /* Scroll reveal */
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) entry.target.classList.add('show');
    });
  }, { threshold: 0.10 });
  document.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });

  /* Dynamic year */
  document.querySelectorAll('[data-year]').forEach(function(el) {
    el.textContent = new Date().getFullYear();
  });

  /* Theme toggle */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;
  const themeLabel = themeToggle ? themeToggle.querySelector('.theme-label') : null;

  function applyTheme(mode) {
    const dark = mode === 'dark';
    document.body.classList.toggle('dark', dark);
    if (themeIcon) {
      themeIcon.className = 'bi theme-icon ' + (dark ? 'bi-moon-stars-fill' : 'bi-sun-fill');
    }
    if (themeLabel) themeLabel.textContent = dark ? 'Dark' : 'Light';
    if (themeToggle) themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    localStorage.setItem('asterra-theme', dark ? 'dark' : 'light');
  }

  applyTheme(localStorage.getItem('asterra-theme') === 'dark' ? 'dark' : 'light');

  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
    });
  }

  /* RTL toggle */
  const rtlToggle = document.getElementById('rtlToggle');

  function applyRTL(isRTL) {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', isRTL);
    if (rtlToggle) {
      rtlToggle.innerHTML = '<span>' + (isRTL ? 'LTR' : 'RTL') + '</span>';
      rtlToggle.setAttribute('aria-label', isRTL ? 'Switch to LTR layout' : 'Switch to RTL layout');
    }
    localStorage.setItem('asterra-rtl', isRTL ? 'rtl' : 'ltr');
  }

  applyRTL(localStorage.getItem('asterra-rtl') === 'rtl');

  if (rtlToggle) {
    rtlToggle.addEventListener('click', function() {
      applyRTL(document.documentElement.dir !== 'rtl');
    });
  }

  /* Navbar scroll state */
  const nav = document.getElementById('mainNav');
  function updateNav() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 18);
  }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  /* Mobile menu closes after navigation */
  document.querySelectorAll('#mainMenu a:not(.dropdown-toggle)').forEach(function(link) {
    link.addEventListener('click', function() {
      if (window.innerWidth < 992) {
        const menu = document.getElementById('mainMenu');
        if (menu && menu.classList.contains('show')) {
          bootstrap.Collapse.getOrCreateInstance(menu).hide();
        }
      }
    });
  });

  /* Demo forms */
  document.querySelectorAll('form[data-demo]').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const alertBox = form.querySelector('.form-alert');
      if (alertBox) {
        alertBox.className = 'alert alert-success form-alert mt-3';
        alertBox.textContent = 'Thanks — your request has been recorded in this demo. Connect this form to your backend/API for production use.';
      }
    });
  });

  /* Blog filters */
  document.querySelectorAll('[data-filter]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('[data-filter]').forEach(function(x) { x.classList.remove('active'); });
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('[data-category]').forEach(function(item) {
        item.style.display = (filter === 'all' || item.dataset.category === filter) ? '' : 'none';
      });
    });
  });
});
})();

/* ===== login.html :: inline script 1 ===== */
(function(){
document.addEventListener('DOMContentLoaded',function(){
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
 document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
 const theme=document.querySelector('[data-theme-toggle]');
 if(theme){theme.addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('asterra-theme',document.body.classList.contains('dark')?'dark':'light')});if(localStorage.getItem('asterra-theme')==='dark')document.body.classList.add('dark')}
 const rtl=document.querySelector('[data-rtl-toggle]');
 if(rtl){rtl.addEventListener('click',()=>{document.body.classList.toggle('rtl');document.documentElement.dir=document.body.classList.contains('rtl')?'rtl':'ltr';localStorage.setItem('asterra-rtl',document.body.classList.contains('rtl')?'rtl':'ltr')});if(localStorage.getItem('asterra-rtl')==='rtl'){document.body.classList.add('rtl');document.documentElement.dir='rtl'}}
 document.querySelectorAll('form[data-demo]').forEach(form=>form.addEventListener('submit',function(e){e.preventDefault();let a=form.querySelector('.form-alert');if(a){a.className='alert alert-success form-alert mt-3';a.textContent='Thanks — your request has been recorded in this demo. Connect this form to your backend/API for production use.'}}));
 document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',function(){document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));this.classList.add('active');let f=this.dataset.filter;document.querySelectorAll('[data-category]').forEach(x=>x.style.display=(f==='all'||x.dataset.category===f)?'':'none')}));
});
})();

/* ===== pricing.html :: inline script 1 ===== */
(function(){
document.addEventListener('DOMContentLoaded',function(){
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
 document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
 const theme=document.querySelector('[data-theme-toggle]');
 if(theme){theme.addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('asterra-theme',document.body.classList.contains('dark')?'dark':'light')});if(localStorage.getItem('asterra-theme')==='dark')document.body.classList.add('dark')}
 const rtl=document.querySelector('[data-rtl-toggle]');
 if(rtl){rtl.addEventListener('click',()=>{document.body.classList.toggle('rtl');document.documentElement.dir=document.body.classList.contains('rtl')?'rtl':'ltr';localStorage.setItem('asterra-rtl',document.body.classList.contains('rtl')?'rtl':'ltr')});if(localStorage.getItem('asterra-rtl')==='rtl'){document.body.classList.add('rtl');document.documentElement.dir='rtl'}}
 document.querySelectorAll('form[data-demo]').forEach(form=>form.addEventListener('submit',function(e){e.preventDefault();let a=form.querySelector('.form-alert');if(a){a.className='alert alert-success form-alert mt-3';a.textContent='Thanks — your request has been recorded in this demo. Connect this form to your backend/API for production use.'}}));
 document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',function(){document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));this.classList.add('active');let f=this.dataset.filter;document.querySelectorAll('[data-category]').forEach(x=>x.style.display=(f==='all'||x.dataset.category===f)?'':'none')}));
});
})();

/* ===== register.html :: inline script 1 ===== */
(function(){
document.addEventListener('DOMContentLoaded',function(){
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
 document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
 const theme=document.querySelector('[data-theme-toggle]');
 if(theme){theme.addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('asterra-theme',document.body.classList.contains('dark')?'dark':'light')});if(localStorage.getItem('asterra-theme')==='dark')document.body.classList.add('dark')}
 const rtl=document.querySelector('[data-rtl-toggle]');
 if(rtl){rtl.addEventListener('click',()=>{document.body.classList.toggle('rtl');document.documentElement.dir=document.body.classList.contains('rtl')?'rtl':'ltr';localStorage.setItem('asterra-rtl',document.body.classList.contains('rtl')?'rtl':'ltr')});if(localStorage.getItem('asterra-rtl')==='rtl'){document.body.classList.add('rtl');document.documentElement.dir='rtl'}}
 document.querySelectorAll('form[data-demo]').forEach(form=>form.addEventListener('submit',function(e){e.preventDefault();let a=form.querySelector('.form-alert');if(a){a.className='alert alert-success form-alert mt-3';a.textContent='Thanks — your request has been recorded in this demo. Connect this form to your backend/API for production use.'}}));
 document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',function(){document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));this.classList.add('active');let f=this.dataset.filter;document.querySelectorAll('[data-category]').forEach(x=>x.style.display=(f==='all'||x.dataset.category===f)?'':'none')}));
});
})();

/* ===== service-details.html :: inline script 1 ===== */
(function(){
document.addEventListener('DOMContentLoaded',function(){const b=document.body,r=document.documentElement,t=document.getElementById('themeToggle'),x=document.getElementById('rtlToggle');b.classList.toggle('dark',(localStorage.getItem('asterra-theme')||'light')==='dark');r.setAttribute('dir',localStorage.getItem('asterra-dir')||'ltr');function icon(){if(!t)return;const d=b.classList.contains('dark'),i=t.querySelector('.theme-icon'),l=t.querySelector('.theme-label');if(i)i.className='bi '+(d?'bi-sun-fill':'bi-moon-stars-fill')+' theme-icon';if(l)l.textContent=d?'Dark':'Light';}icon();t&&t.addEventListener('click',function(){b.classList.toggle('dark');localStorage.setItem('asterra-theme',b.classList.contains('dark')?'dark':'light');icon()});x&&x.addEventListener('click',function(){const d=r.getAttribute('dir')==='rtl'?'ltr':'rtl';r.setAttribute('dir',d);localStorage.setItem('asterra-dir',d)});const cur=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('nav a[href]').forEach(a=>{if(a.getAttribute('href')===cur){a.classList.add('active');a.setAttribute('aria-current','page');a.closest('.dropdown')?.querySelector('.dropdown-toggle')?.classList.add('active')}});document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());});
})();

/* ===== services.html :: inline script 1 ===== */
(function(){
document.addEventListener('DOMContentLoaded',function(){
 const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
 document.querySelectorAll('.navbar a[href]').forEach(function(link){const href=link.getAttribute('href');if(!href||href.startsWith('#')||href.startsWith('http'))return;const target=href.split('/').pop().split('#')[0].toLowerCase();if(target===current){link.classList.add('active');link.setAttribute('aria-current','page');const d=link.closest('.dropdown');if(d){const t=d.querySelector('.dropdown-toggle');if(t){t.classList.add('active');t.setAttribute('aria-current','page')}}}});
 const darkBtn=document.querySelector('#themeToggle');const rtlBtn=document.querySelector('#rtlToggle');
 function theme(){const dark=localStorage.getItem('asterra-theme')==='dark';document.body.classList.toggle('dark',dark);document.documentElement.classList.toggle('dark',dark);if(darkBtn){darkBtn.innerHTML=dark?'<i class="bi bi-sun-fill"></i>':'<i class="bi bi-moon-stars-fill"></i>';darkBtn.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');darkBtn.title=dark?'Light mode':'Dark mode'}}
 function rtl(){const on=localStorage.getItem('asterra-dir')==='rtl';document.documentElement.dir=on?'rtl':'ltr';document.documentElement.lang=on?'ar':'en';if(rtlBtn){rtlBtn.textContent=on?'LTR':'RTL';rtlBtn.setAttribute('aria-label',on?'Switch to LTR':'Switch to RTL')}}
 if(darkBtn)darkBtn.addEventListener('click',()=>{localStorage.setItem('asterra-theme',document.body.classList.contains('dark')?'light':'dark');theme()});
 if(rtlBtn)rtlBtn.addEventListener('click',()=>{localStorage.setItem('asterra-dir',document.documentElement.dir==='rtl'?'ltr':'rtl');rtl()});theme();rtl();
 const nav=document.getElementById('mainNav');window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>20));
 document.querySelectorAll('[data-year]').forEach(x=>x.textContent=new Date().getFullYear());
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(x=>observer.observe(x));
});
})();
