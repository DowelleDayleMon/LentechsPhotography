'use strict';
const $ = (s,c=document) => c.querySelector(s);
const $$ = (s,c=document) => [...c.querySelectorAll(s)];

/* ── NAV ── */
(function(){
  const ham  = $('#hamburger');
  const menu = $('#mobileMenu');
  if (!ham) return;
  ham.addEventListener('click', () => {
    const open = ham.classList.toggle('open');
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', !open);
    ham.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.mobile-link, .mobile-menu__cta').forEach(a => a.addEventListener('click', () => {
    ham.classList.remove('open');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }));
})();

/* ── SMOOTH SCROLL ── */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const t = document.querySelector(a.getAttribute('href'));
  if (!t) return;
  e.preventDefault();
  window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
});

/* ── STICKY TABS — scroll to section + highlight ── */
(function(){
  const tabs     = $$('.ptab');
  const sections = ['self','grad','event','other'].map(id => document.getElementById('tab-'+id));

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const sec = document.getElementById('tab-' + tab.dataset.tab);
      if (!sec) return;
      const top = sec.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Highlight active tab on scroll
  const highlight = () => {
    let current = '';
    sections.forEach(sec => {
      if (sec && window.scrollY >= sec.offsetTop - 160) current = sec.id.replace('tab-','');
    });
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === current));
  };
  window.addEventListener('scroll', highlight, { passive: true });
  highlight();
})();

/* ── SCROLL REVEAL ── */
(function(){
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('on');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  $$('.js-reveal').forEach(el => obs.observe(el));
})();

/* ── CURSOR (desktop) ── */
(function(){
  const cur  = document.createElement('div');
  cur.className = 'cursor';
  cur.innerHTML = '<div class="cursor__dot"></div><div class="cursor__ring"></div>';
  document.body.appendChild(cur);
  const ring = cur.querySelector('.cursor__ring');
  if (!window.matchMedia('(hover:hover)').matches) { cur.style.display='none'; return; }
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
  const lerp = (a,b,t) => a+(b-a)*t;
  (function loop(){ rx=lerp(rx,mx,.11); ry=lerp(ry,my,.11);
    cur.style.transform=`translate(${mx}px,${my}px)`;
    ring.style.transform=`translate(${rx-mx}px,${ry-my}px)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mousedown', () => cur.classList.add('click'));
  document.addEventListener('mouseup',   () => cur.classList.remove('click'));
  $$('a,button').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('on'));
    el.addEventListener('mouseleave', () => cur.classList.remove('on'));
  });
})();