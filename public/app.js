(() => {
  'use strict';

  const nav = document.querySelector('.header nav');
  if (nav) {
    nav.id = 'main-navigation';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.innerHTML = '<span></span><span></span><span></span>'; 
    toggle.className = 'menu-toggle';
    toggle.setAttribute('aria-controls', nav.id);
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      nav.classList.toggle('is-open', open);
    };
    setOpen(false);
    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.before(toggle);
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a[href^="#"]')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    const desktop = window.matchMedia('(min-width: 601px)');
    desktop.addEventListener('change', () => setOpen(false));
    nav.classList.add('enhanced-navigation');
  }

  document.querySelectorAll('a[href="#contact"]').forEach((link) => {
    link.addEventListener('click', () => {
      const direction = document.querySelector('#direction');
      if (link.dataset.direction && direction) {
        direction.value = link.dataset.direction;
        direction.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const field = document.querySelector('#contact-input');
      if (field) field.focus({ preventScroll: true });
    });
  });

  const demo = document.querySelector('#agent-demo details');
  if (demo) {
    const summary = demo.querySelector('summary');
    const result = demo.querySelector('p');
    if (!summary || !result) return;
    const container = document.createElement('div');
    const run = document.createElement('button');
    const reset = document.createElement('button');
    const status = document.createElement('div');
    run.type = reset.type = 'button';
    run.className = reset.className = 'text-link demo-control';
    run.textContent = 'Разобрать пример ↗';
    reset.textContent = 'Сбросить';
    reset.disabled = true;
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    const preparedResult = result.cloneNode(true);
    run.addEventListener('click', () => {
      status.replaceChildren(preparedResult.cloneNode(true));
      reset.disabled = false;
      run.disabled = true;
    });
    reset.addEventListener('click', () => {
      status.textContent = 'Пример сброшен. Можно разобрать его снова.';
      run.disabled = false;
      reset.disabled = true;
      run.focus();
    });
    container.append(run, reset, status);
    demo.replaceWith(container);
  }
})();

// Reveal once, with immediate visibility for keyboard and reduced-motion users.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 901px) and (pointer: fine)');
  const targets = document.querySelectorAll('main section, .project, .services article, .steps article, .demo, .contact-panel');
  let revealObserver;
  const reveal = (element) => {
    element.classList.remove('reveal-pending');
    if (revealObserver) revealObserver.unobserve(element);
  };
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) reveal(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    targets.forEach((element) => {
      // Above-the-fold content paints immediately, including deep-linked sections.
      const rect = element.getBoundingClientRect();
      element.classList.add('reveal-ready');
      if (rect.top >= window.innerHeight && !element.contains(document.activeElement)) {
        element.classList.add('reveal-pending');
        revealObserver.observe(element);
      }
    });
  }
  document.addEventListener('focusin', (event) => {
    targets.forEach((element) => {
      if (element.contains(event.target)) reveal(element);
    });
  });
  const hero = document.querySelector('.hero');
  let heroVisible = false;
  let frame = 0;
  let listening = false;
  const paint = () => {
    frame = 0;
    if (!hero) return;
    const drift = Math.max(-30, Math.min(30, -hero.getBoundingClientRect().top * 0.055));
    hero.style.setProperty('--hero-drift', `${drift.toFixed(2)}px`);
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(paint);
  };
  const sync = () => {
    if (reducedMotion.matches) targets.forEach(reveal);
    const active = heroVisible && desktop.matches && !reducedMotion.matches;
    if (active && !listening) {
      window.addEventListener('scroll', schedule, { passive: true });
      listening = true;
      schedule();
    } else if (!active) {
      window.removeEventListener('scroll', schedule);
      listening = false;
      cancelAnimationFrame(frame);
      frame = 0;
      if (hero) hero.style.removeProperty('--hero-drift');
    }
  };
  if (hero && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      sync();
    });
    heroObserver.observe(hero);
  }
  reducedMotion.addEventListener('change', sync);
  desktop.addEventListener('change', sync);
})();

(() => {
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 const top = document.querySelector('#back-top');
 const sync = () => { top.hidden = window.scrollY < 500; };
 window.addEventListener('scroll', sync, {passive:true}); sync();
 top.addEventListener('click', () => { window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'}); document.querySelector('.brand').focus({preventScroll:true}); });
 const form = document.querySelector('#demo-form');
 form.addEventListener('submit', event => {
  event.preventDefault();
  for (const field of form.querySelectorAll('input,textarea')) field.value = field.value.trim();
  if (!form.reportValidity()) return;
  const status = document.querySelector('#demo-status');
  status.textContent = 'Демонстрация завершена. Сообщение не отправлено';
  status.classList.remove('demo-success'); void status.offsetWidth; status.classList.add('demo-success');
 });
 form.querySelector('fieldset').disabled = false;
 const counters = document.querySelectorAll('[data-count]');
 if (!('IntersectionObserver' in window) || reduced.matches) return;
 const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  observer.unobserve(entry.target);
  const end = Number(entry.target.dataset.count), start = performance.now();
  const tick = now => { const progress = reduced.matches ? 1 : Math.min(1,(now-start)/850); entry.target.textContent = String(Math.round(end*progress)); if(progress<1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
 })); counters.forEach(counter => observer.observe(counter));
})();
