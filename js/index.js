'use strict';

(function () {

  /* ── Services — inject CSS vars + toggle mobile + carrousel ── */
  document.querySelectorAll('.svc-item').forEach(item => {
    const bg     = item.dataset.bg;
    const accent = item.dataset.accent;
    if (bg)     item.style.setProperty('--svc-bg', bg);
    if (accent) item.style.setProperty('--svc-accent', accent);
    const wrap = item.querySelector('.svc-carousel-wrap');
    if (wrap && bg) wrap.style.setProperty('--svc-bg', bg);
  });

  function isMobile() { return window.matchMedia('(max-width: 1099px)').matches; }

  document.querySelectorAll('.svc-item').forEach(item => {
    const link = item.querySelector('.svc-link');

    item.addEventListener('click', (e) => {
      if (!isMobile()) return;

      // Si le clic vient de la flèche ou du lien arrow, laisser naviguer
      if (e.target.closest('.svc-arrow-link')) return;

      // Sinon bloquer la navigation et toggler la carte
      e.preventDefault();
      const wasActive = item.dataset.open === 'true';
      document.querySelectorAll('.svc-item').forEach(el => {
        el.classList.remove('active');
        el.dataset.open = 'false';
      });
      if (!wasActive) {
        item.classList.add('active');
        item.dataset.open = 'true';
      }
    });
  });

  document.querySelectorAll('.svc-carousel').forEach(carousel => {
    const track = carousel.querySelector('.svc-carousel-track');
    if (!track) return;
    const originalItems = Array.from(track.children);
    originalItems.forEach(el => track.appendChild(el.cloneNode(true)));
    const imgs = Array.from(track.querySelectorAll('img'));
    Promise.all(imgs.map(img => new Promise(res => {
      if (img.complete) res(); else { img.onload = res; img.onerror = res; }
    }))).then(() => {
      const loopWidth = track.scrollWidth / 2;
      let pos = 0, running = false;
      function tick() {
        pos += 0.9;
        if (pos >= loopWidth) pos -= loopWidth;
        track.style.transform = `translateX(-${pos}px)`;
        if (running) requestAnimationFrame(tick);
      }
      const item = carousel.closest('.svc-item');
      item.addEventListener('mouseenter', () => { if (!running) { running = true; requestAnimationFrame(tick); } });
      item.addEventListener('mouseleave', () => { running = false; });
    });
  });

  function initTicker() {
    const tickerTrack = document.getElementById('ticker-track');
    if (tickerTrack) {
      const originalWidth = tickerTrack.scrollWidth;
      tickerTrack.innerHTML += tickerTrack.innerHTML;
      const DURATION = 35000;
      const anim = tickerTrack.animate(
        [
          { transform: 'translateX(0)' },
          { transform: `translateX(-${originalWidth}px)` }
        ],
        { duration: DURATION, iterations: Infinity, easing: 'linear' }
      );
      const ticker = tickerTrack.closest('.hero-ticker');
      if (ticker) {
        ticker.addEventListener('mouseenter', () => anim.updatePlaybackRate(0.25));
        ticker.addEventListener('mouseleave', () => anim.updatePlaybackRate(1));
      }
    }
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(initTicker);
  } else {
    window.addEventListener('load', initTicker);
  }

  const elevator = document.getElementById('hero-elevator');
  if (elevator) {
    const items   = [...elevator.querySelectorAll('.hero-elevator-item')];
    const total   = items.length;
    let   current = 0;
    elevator.appendChild(items[0].cloneNode(true));
    const INTERVAL = 2400;
    setInterval(() => {
      current++;
      const itemH = items[0].getBoundingClientRect().height;
      elevator.style.transition = 'transform 0.6s cubic-bezier(.76,0,.24,1)';
      elevator.style.transform  = `translateY(-${current * itemH}px)`;
      if (current === total) {
        setTimeout(() => {
          elevator.style.transition = 'none';
          elevator.style.transform  = 'translateY(0)';
          current = 0;
        }, 650);
      }
    }, INTERVAL);
  }

  const counters = document.querySelectorAll('.cnt[data-to]');
  if (counters.length) {
    const animate = (el) => {
      const target   = parseInt(el.dataset.to, 10);
      const duration = 1800;
      const start    = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => observer.observe(el));
  }

})();