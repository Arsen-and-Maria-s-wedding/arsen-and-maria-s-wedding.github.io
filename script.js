// smooth scroll + progress + reveal + palette copy + mobile nav
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.getElementById('progress');
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');
  const nav = document.getElementById('nav');
  const toast = document.getElementById('toast');

  // mobile nav toggle
  burger?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded','false');
  }));

  // progress bar
  const onScroll = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    if(progress) progress.style.width = scrolled + '%';
    // subtle parallax for branch
    if(!prefersReduced){
      const branch = document.querySelector('.hero__branch');
      if(branch){
        const y = window.scrollY * 0.06;
        branch.style.transform = `translateY(${y}px)`;
      }
    }
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  if(prefersReduced){
    reveals.forEach(el => el.classList.add('is-visible'));
  } else if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, {threshold:0.14, rootMargin:'0px 0px -40px 0px'});
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  // active nav link highlight
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav__links a');
  const observerNav = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const id = entry.target.id;
        navLinks.forEach(a=>{
          a.style.opacity = a.getAttribute('href') === '#'+id ? '1' : '0.6';
          a.style.borderColor = a.getAttribute('href') === '#'+id ? 'var(--amber)' : 'transparent';
        });
      }
    });
  },{threshold:0.5});
  sections.forEach(s=>observerNav.observe(s));

  // palette copy
  function showToast(msg){
    if(!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(()=> toast.classList.remove('is-show'), 2200);
  }
  document.querySelectorAll('.palette__item').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const hex = btn.dataset.hex;
      try{
        await navigator.clipboard.writeText(hex);
        showToast(`Скопійовано ${hex}`);
      }catch{
        showToast(hex);
      }
      btn.animate([{transform:'scale(1)'},{transform:'scale(0.96)'},{transform:'scale(1)'}],{duration:220,easing:'ease-out'});
    });
  });

  // smooth anchor (native already, but ensure offset)
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href');
      if(id.length>1){
        const target = document.querySelector(id);
        if(target){
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - 58;
          window.scrollTo({top, behavior: prefersReduced ? 'auto' : 'smooth'});
          history.pushState(null,'',id);
        }
      }
    });
  });
})();
