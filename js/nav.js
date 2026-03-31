'use strict';

(function () {

  /* ── Dropdown ── */
  const dropdowns = document.querySelectorAll('.nav-item--dropdown');
  dropdowns.forEach(item => {
    const trigger = item.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;

    let closeTimer = null;

    const open = () => {
      clearTimeout(closeTimer);
      item.classList.add('open');
    };

    const close = () => {
      closeTimer = setTimeout(() => {
        item.classList.remove('open');
      }, 150);
    };

    // Desktop : hover sur l'item entier
    item.addEventListener('mouseenter', () => {
      if (window.innerWidth >= 1100) open();
    });
    item.addEventListener('mouseleave', () => {
      if (window.innerWidth >= 1100) close();
    });

    // Annuler la fermeture si on revient sur le dropdown
    const dropdown = item.querySelector('.nav-dropdown');
    if (dropdown) {
      dropdown.addEventListener('mouseenter', () => {
        if (window.innerWidth >= 1100) clearTimeout(closeTimer);
      });
      dropdown.addEventListener('mouseleave', () => {
        if (window.innerWidth >= 1100) close();
      });
    }

    // Mobile : click toggle
    trigger.addEventListener('click', () => {
      if (window.innerWidth < 1100) {
        const isOpen = item.classList.toggle('open');
        trigger.setAttribute('aria-expanded', String(isOpen));
      }
    });
  });

  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('solid', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const burger = document.getElementById('burger');
  if (nav && burger) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    document.querySelectorAll('#nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#nav-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === currentPage) link.classList.add('active');
  });

  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => observer.observe(el));
  }

  const btt = document.getElementById('btt');
  if (btt) {
    window.addEventListener('scroll', () => {
      btt.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

})();