/* =========================================
   LENTECH'S PHOTOGRAPHY STUDIO — v4
   script.js
   ========================================= */
'use strict';
const $ = (s,c=document) => c.querySelector(s);
const $$ = (s,c=document) => [...c.querySelectorAll(s)];

/* ─── SCROLL PROGRESS ─── */
const bar = document.createElement('div');
bar.id = 'scrollBar';
document.body.prepend(bar);
window.addEventListener('scroll', () => {
  bar.style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100) + '%';
}, { passive: true });

/* ─── SPLASH ─── */
(function() {
  const splash   = $('#splash');
  const fill     = $('#splashFill');
  const loadTxt  = $('#splashLoadText');
  const flash    = $('#splashFlash');
  const scramEl  = $('#splashScramble');
  if (!splash) return;

  document.body.style.overflow = 'hidden';

  // Scramble
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const orig  = "ENTECH'S";
  let f = 0;
  const scramble = () => {
    f++;
    scramEl.textContent = orig.split('').map((c, i) =>
      i < f / 1.6 ? orig[i] : alpha[Math.floor(Math.random() * alpha.length)]
    ).join('');
    if (f < orig.length * 1.6) requestAnimationFrame(scramble);
    else scramEl.textContent = orig;
  };

  // Progress
  const dots = ['.', '..', '...'];
  let d = 0, pct = 0;
  const dotInt = setInterval(() => { loadTxt.textContent = 'Loading' + dots[d++ % 3]; }, 400);
  const fillInt = setInterval(() => {
    pct += Math.random() * 12 + 4;
    if (pct >= 100) { pct = 100; clearInterval(fillInt); clearInterval(dotInt); loadTxt.textContent = 'Ready'; }
    fill.style.width = pct + '%';
  }, 80);

  // Sequence
  setTimeout(() => splash.classList.add('ready'), 80);
  setTimeout(scramble, 350);
  setTimeout(() => splash.classList.add('open'), 900);   // curtains open
  setTimeout(() => flash.classList.add('pop'), 1500);     // shutter
  setTimeout(() => {
    splash.classList.add('out');
    document.body.style.overflow = '';
    enterHero();
    countStats();
  }, 2000);
})();

/* ─── HERO ENTRANCE ─── */
function enterHero() {
  const hero = $('.hero');
  if (!hero) return;

  // Wrap each line's children in a .hero__line-inner for mask animation
  $$('.hero__line').forEach((line, li) => {
    const inner = document.createElement('div');
    inner.className = 'hero__line-inner';
    inner.style.transition = `transform .85s cubic-bezier(0.16,1,0.3,1) ${600 + li * 120}ms`;
    while (line.firstChild) inner.appendChild(line.firstChild);
    line.appendChild(inner);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      inner.style.transform = 'translateY(0)';
    }));
  });

  // Sub text transition handled by .hero.loaded in CSS
  setTimeout(() => hero.classList.add('loaded'), 100);
}

/* ─── COUNTER ─── */
function countStats() {
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    const dur = 1800, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
  });
}

/* ─── CURSOR ─── */
(function() {
  const cur   = $('#cursor');
  const ring  = $('.cursor__ring', cur);
  const label = $('#cursorLabel');
  if (!cur || !window.matchMedia('(hover:hover)').matches) return;

  let mx=0, my=0, rx=0, ry=0;
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });

  const lerp = (a, b, t) => a + (b - a) * t;
  (function loop() {
    rx = lerp(rx, mx, .11); ry = lerp(ry, my, .11);
    cur.style.transform = `translate(${mx}px,${my}px)`;
    ring.style.transform = `translate(${rx-mx}px,${ry-my}px)`;
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mousedown', () => cur.classList.add('click'));
  document.addEventListener('mouseup',   () => cur.classList.remove('click'));

  $$('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.classList.add('on'); label.textContent = el.dataset.cursor.toUpperCase(); });
    el.addEventListener('mouseleave', () => { cur.classList.remove('on'); label.textContent = ''; });
  });
})();

/* ─── NAV ─── */
(function() {
  const nav = $('#nav');
  const ham = $('#hamburger');
  const menu = $('#mobileMenu');

  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50), { passive: true });

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
    menu.setAttribute('aria-hidden', 'true');
    ham.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));

  // Active section highlight
  const sections = $$('section[id]');
  const links    = $$('.nav__link');
  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 110) cur = s.id; });
    links.forEach(a => a.classList.toggle('active', a.dataset.section === cur));
  }, { passive: true });
})();

/* ─── FLOAT CTA ─── */
(function() {
  const btn  = $('#floatCta');
  const hero = $('.hero');
  if (!btn || !hero) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('on', window.scrollY > hero.offsetHeight * 0.65);
  }, { passive: true });
})();

/* ─── SCROLL REVEAL ─── */
(function() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      // Stagger siblings
      const sibs = $$('.js-reveal', e.target.parentElement);
      const idx  = sibs.indexOf(e.target);
      e.target.style.transitionDelay = `${idx * 70}ms`;
      e.target.classList.add('on');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  $$('.js-reveal').forEach(el => obs.observe(el));
})();

/* ─── PARALLAX ─── */
(function() {
  const els = $$('.js-parallax');
  if (!els.length || window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  window.addEventListener('scroll', () => {
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      el.style.transform = `translateY(${(r.top + r.height/2 - window.innerHeight/2) * +el.dataset.speed}px)`;
    });
  }, { passive: true });
})();

/* ─── TILT (medallion) ─── */
$$('.js-tilt').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width/2)  / (r.width/2);
    const y = (e.clientY - r.top  - r.height/2) / (r.height/2);
    el.style.transform = `perspective(400px) rotateY(${x*16}deg) rotateX(${-y*16}deg) scale(1.08)`;
  });
  el.addEventListener('mouseleave', () => el.style.transform = '');
});

/* ─── MAGNETIC BUTTONS ─── */
(function() {
  if (!window.matchMedia('(hover:hover)').matches) return;
  $$('.btn--gold, .btn--light').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.2}px,${(e.clientY-r.top-r.height/2)*.2}px)`;
    });
    b.addEventListener('mouseleave', () => b.style.transform = '');
  });
})();

/* ─── RIPPLE on svc cards ─── */
(function() {
  const s = document.createElement('style');
  s.textContent = '@keyframes rOut{to{width:340px;height:340px;opacity:0}}';
  document.head.appendChild(s);
  $$('.svc').forEach(c => c.addEventListener('click', e => {
    const r = c.getBoundingClientRect();
    const rip = document.createElement('span');
    rip.style.cssText = `position:absolute;left:${e.clientX-r.left}px;top:${e.clientY-r.top}px;width:0;height:0;border-radius:50%;background:rgba(201,168,76,.18);transform:translate(-50%,-50%);pointer-events:none;z-index:10;animation:rOut .6s ease forwards;`;
    c.style.position = 'relative';
    c.appendChild(rip);
    setTimeout(() => rip.remove(), 700);
  }));
})();

/* ─── GALLERY FILTER ─── */
(function() {
  const btns  = $$('.gf');
  const items = $$('.gi');
  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    items.forEach((item, i) => {
      const match = cat === 'all' || item.dataset.cat === cat;
      item.style.transition = `opacity .38s ease ${i*20}ms, transform .38s ease ${i*20}ms`;
      if (match) {
        item.style.display = '';
        requestAnimationFrame(() => { item.style.opacity='1'; item.style.transform='scale(1)'; });
      } else {
        item.style.opacity = '0'; item.style.transform = 'scale(.96)';
        setTimeout(() => { if (item.style.opacity==='0') item.style.display='none'; }, 380+i*20);
      }
    });
  }));
  items.forEach(i => { i.style.opacity='1'; i.style.transform='scale(1)'; });
})();

/* ─── LIGHTBOX ─── */
(function() {
  const lb    = $('#lightbox');
  const img   = $('#lbImg');
  const cap   = $('#lbCap');
  const stage = $('.lb__stage', lb);
  let items=[], cur=0;

  const visible = () => $$('.gi').filter(i => i.style.display !== 'none');
  const fade = (fn) => {
    stage.style.cssText='opacity:0;transform:scale(.97);transition:opacity .28s,transform .28s';
    setTimeout(() => { fn(); stage.style.cssText='opacity:1;transform:scale(1);transition:opacity .28s,transform .28s'; }, 140);
  };
  const show = () => fade(() => { const s=$('img',items[cur]); if(!s) return; img.src=s.src; img.alt=s.alt; cap.textContent=s.alt; });
  const open = i => { items=visible(); cur=Math.min(i,items.length-1); show(); lb.classList.add('open'); document.body.style.overflow='hidden'; };
  const close = () => { lb.classList.remove('open'); document.body.style.overflow=''; };
  const prev  = () => { cur=(cur-1+items.length)%items.length; show(); };
  const next  = () => { cur=(cur+1)%items.length; show(); };

  $$('.gi').forEach((el,i) => el.addEventListener('click', () => open(i)));
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', prev);
  $('#lbNext').addEventListener('click', next);
  lb.addEventListener('click', e => { if(e.target===lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key==='Escape') close();
    if (e.key==='ArrowLeft') prev();
    if (e.key==='ArrowRight') next();
  });
})();

/* ─── PRICING TABS + CAROUSEL ─── */
(function() {
  const tabs    = $$('.ptab');
  const grid    = $('#priceGrid');
  const allCards= $$('.pc[data-tab]');
  const prevBtn = $('#priceNavPrev');
  const nextBtn = $('#priceNavNext');
  const dotsEl  = $('#priceDots');
  const countEl = $('#priceCount');
  if (!tabs.length || !grid) return;

  let activeTab = 'self';
  let visibleCards = [];

  // Strip js-reveal — observer must never touch pricing cards
  allCards.forEach(c => {
    c.classList.remove('js-reveal');
    c.style.opacity = '1';
    c.style.transform = 'none';
    c.style.transition = 'none';
    c.style.display = 'none';
  });

  /* ── Build dots for current visible set ── */
  function buildDots(cards) {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    cards.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'price-dot';
      d.addEventListener('click', () => scrollToCard(i));
      dotsEl.appendChild(d);
    });
    updateDots();
    if (countEl) countEl.textContent = `1 / ${cards.length}`;
  }

  function updateDots() {
    if (!dotsEl || !grid) return;
    const cardW = visibleCards[0] ? visibleCards[0].offsetWidth + 12 : 0;
    const idx   = cardW > 0 ? Math.round(grid.scrollLeft / cardW) : 0;
    $$('.price-dot', dotsEl).forEach((d, i) => d.classList.toggle('on', i === idx));
    if (countEl) countEl.textContent = `${idx + 1} / ${visibleCards.length}`;
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx >= visibleCards.length - 1;
  }

  function scrollToCard(idx) {
    if (!visibleCards[idx]) return;
    grid.scrollTo({ left: visibleCards[idx].offsetLeft - 16, behavior: 'smooth' });
  }

  /* ── Switch tab ── */
  function switchTab(tab) {
    activeTab = tab.dataset.tab;
    tabs.forEach(t => { t.classList.toggle('active', t === tab); t.setAttribute('aria-selected', t === tab); });

    // Hide all, show matching
    allCards.forEach(c => { c.style.display = 'none'; });
    visibleCards = allCards.filter(c => c.dataset.tab === activeTab);
    visibleCards.forEach(c => { c.style.display = ''; });

    // Reset scroll
    grid.scrollLeft = 0;
    buildDots(visibleCards);
  }

  /* ── Arrow buttons ── */
  if (prevBtn) prevBtn.addEventListener('click', () => {
    const cardW = visibleCards[0] ? visibleCards[0].offsetWidth + 12 : 320;
    grid.scrollBy({ left: -cardW, behavior: 'smooth' });
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    const cardW = visibleCards[0] ? visibleCards[0].offsetWidth + 12 : 320;
    grid.scrollBy({ left: cardW, behavior: 'smooth' });
  });

  /* ── Update dots on scroll ── */
  grid.addEventListener('scroll', updateDots, { passive: true });

  /* ── Touch swipe ── */
  let tx = 0;
  grid.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  grid.addEventListener('touchend', e => {
    const dx = tx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) {
      const cardW = visibleCards[0] ? visibleCards[0].offsetWidth + 12 : 320;
      grid.scrollBy({ left: dx > 0 ? cardW : -cardW, behavior: 'smooth' });
    }
  });

  /* ── Tab clicks ── */
  tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab)));

  /* ── Init ── */
  switchTab(tabs[0]);
})();

/* ─── TESTIMONIALS ─── */
(function() {
  const track = $('#testiTrack');
  const dotsW = $('#testiDots');
  const prev  = $('#testiPrev');
  const next  = $('#testiNext');
  const cards = $$('.tc', track);
  if (!cards.length) return;

  let cur=0, pv=getPV(), total, auto;
  function getPV() { return window.innerWidth<=640?1:window.innerWidth<=768?1:window.innerWidth<=1024?2:3; }
  function buildDots() {
    total = Math.ceil(cards.length/pv); dotsW.innerHTML='';
    for(let i=0;i<total;i++) {
      const d=document.createElement('div'); d.className='td'+(i===cur?' on':'');
      d.addEventListener('click',()=>goTo(i)); dotsW.appendChild(d);
    }
  }
  function goTo(i) {
    cur=((i%total)+total)%total;
    track.style.transform=`translateX(${-cur*pv*(cards[0].offsetWidth+24)}px)`;
    $$('.td',dotsW).forEach((d,j)=>d.classList.toggle('on',j===cur));
  }
  const start=()=>{ auto=setInterval(()=>goTo(cur+1),5200); };
  const stop =()=>clearInterval(auto);
  prev.addEventListener('click',()=>{goTo(cur-1);stop();start();});
  next.addEventListener('click',()=>{goTo(cur+1);stop();start();});
  track.addEventListener('touchstart',e=>{track._tx=e.touches[0].clientX;},{passive:true});
  track.addEventListener('touchend',e=>{
    const dx=track._tx-e.changedTouches[0].clientX;
    if(Math.abs(dx)>36){dx>0?goTo(cur+1):goTo(cur-1);stop();start();}
  });
  let rsz;
  window.addEventListener('resize',()=>{clearTimeout(rsz);rsz=setTimeout(()=>{const n=getPV();if(n!==pv){pv=n;cur=0;buildDots();goTo(0);}},200);});
  buildDots(); start();
})();

/* ─── CONTACT FORM ─── */
(function() {
  const form = $('#contactForm');
  if (!form) return;
  const sub = $('[type="submit"]', form);

  const ss = document.createElement('style');
  ss.textContent='@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}60%{transform:translateX(6px)}}@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(ss);

  form.addEventListener('submit', e => {
    e.preventDefault(); let ok=true;
    $$('[required]',form).forEach(f=>{
      f.closest('.cf').querySelector('.ferr')?.remove();
      if(!f.value.trim()){
        ok=false; f.style.animation='shake .4s ease'; setTimeout(()=>f.style.animation='',400);
        const er=document.createElement('span');
        er.className='ferr';er.style.cssText='font-size:.55rem;color:#c0392b;display:block;margin-top:3px;font-family:var(--ff-sans);letter-spacing:.15em;font-weight:500;';
        er.textContent='REQUIRED';f.closest('.cf').appendChild(er);
      }
    });
    if(!ok) return;
    const orig=sub.innerHTML;
    sub.innerHTML='<span class="bst">Sending...</span><span class="bsi" style="animation:spin 1s linear infinite;display:inline-block">⟳</span>';
    sub.disabled=true;
    setTimeout(()=>{
      sub.innerHTML='<span class="bst">Message Sent ✓</span>';
      sub.style.background='#1a6b3c';sub.style.borderColor='#1a6b3c';
      form.reset();
      setTimeout(()=>{sub.innerHTML=orig;sub.disabled=false;sub.style.background=sub.style.borderColor='';},3500);
    },1400);
  });
  $$('[required]',form).forEach(f=>f.addEventListener('input',()=>f.closest('.cf').querySelector('.ferr')?.remove()));
})();

/* ─── SMOOTH SCROLL ─── */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = document.querySelector(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
});

/* ─── IMAGE LOAD (stop shimmer) ─── */
$$('img').forEach(img => {
  const p = img.parentElement;
  const done = () => p?.classList.add('img-loaded');
  if (img.complete && img.naturalWidth > 0) { done(); return; }
  img.addEventListener('load', done);
  img.addEventListener('error', () => { if(p) p.style.opacity='.3'; });
});

/* ─── HERO SAFETY NET ─── */
setTimeout(() => {
  const hero = $('.hero');
  if (hero && !hero.classList.contains('loaded')) {
    // Force wrap all lines if enterHero didn't run
    $$('.hero__line').forEach(line => {
      if (!line.querySelector('.hero__line-inner')) {
        const inner = document.createElement('div');
        inner.className = 'hero__line-inner';
        inner.style.transform = 'translateY(0)';
        while (line.firstChild) inner.appendChild(line.firstChild);
        line.appendChild(inner);
      }
    });
    hero.classList.add('loaded');
    countStats();
  }
}, 4500);