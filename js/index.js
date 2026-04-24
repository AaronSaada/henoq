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
      if (e.target.closest('.svc-arrow-link')) return;
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

  /* ── Ticker ── */
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

  /* ── Elevator ── */
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

  /* ── Compteurs ── */
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

  /* ── Formulaire de contact ── */
  const form = document.getElementById('cform');
  if (form) {
    const msgEl   = document.getElementById('cmsg');
    const sendBtn = form.querySelector('.csend');
    const RECAPTCHA_SITE_KEY = 'VOTRE_SITE_KEY';

    form.querySelectorAll('.fr').forEach(fr => {
      const span = document.createElement('span');
      span.className = 'fr-err-msg';
      span.setAttribute('role', 'alert');
      span.setAttribute('aria-live', 'polite');
      fr.appendChild(span);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const name    = document.getElementById('fn');
      const email   = document.getElementById('fe');
      const service = document.getElementById('fs');
      const msg     = document.getElementById('fm');
      let ok = true;

      if (!name.value.trim()) { markErr(name, 'Veuillez renseigner votre nom ou société.'); ok = false; }
      else if (name.value.trim().length > 100) { markErr(name, 'Le nom ne peut pas dépasser 100 caractères.'); ok = false; }

      if (!email.value.trim()) { markErr(email, 'Veuillez renseigner votre adresse email.'); ok = false; }
      else if (!validEmail(email.value)) { markErr(email, 'Adresse email invalide.'); ok = false; }

      if (!service.value) { markErr(service, 'Veuillez choisir un sujet.'); ok = false; }

      if (!msg.value.trim()) { markErr(msg, 'Veuillez saisir votre message.'); ok = false; }
      else if (msg.value.trim().length < 10) { markErr(msg, 'Message trop court (10 caractères minimum).'); ok = false; }
      else if (msg.value.trim().length > 5000) { markErr(msg, 'Message trop long (5000 caractères maximum).'); ok = false; }

      if (!ok) { const firstErr = form.querySelector('.err'); if (firstErr) firstErr.focus(); return; }

      sendBtn.classList.add('loading');
      sendBtn.disabled = true;

      try {
        const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'contact' });
        const res = await fetch('contact.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:            name.value.trim(),
            email:           email.value.trim(),
            service:         service ? service.value : '',
            message:         msg.value.trim(),
            website:         document.getElementById('fhp')?.value || '',
            recaptcha_token: token
          })
        });
        const data = await res.json();
        if (data.success) { form.reset(); showMsg('✓ ' + data.message, true); }
        else { showMsg('⚠ ' + data.message, false); }
      } catch {
        showMsg('Une erreur est survenue. Contactez-nous directement par email.', false);
      } finally {
        sendBtn.classList.remove('loading');
        sendBtn.disabled = false;
      }
    });

    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254; }
    function markErr(el, message) {
      el.classList.add('err');
      el.setAttribute('aria-invalid', 'true');
      const span = el.closest('.fr')?.querySelector('.fr-err-msg');
      if (span) { span.textContent = message; span.classList.add('visible'); }
    }
    function clearErrors() {
      form.querySelectorAll('.err').forEach(el => { el.classList.remove('err'); el.removeAttribute('aria-invalid'); });
      form.querySelectorAll('.fr-err-msg').forEach(span => { span.textContent = ''; span.classList.remove('visible'); });
      msgEl.textContent = ''; msgEl.className = 'cmsg';
    }
    function showMsg(txt, success) {
      msgEl.textContent = txt;
      msgEl.className = 'cmsg ' + (success ? 'cmsg-ok' : 'cmsg-err');
      setTimeout(() => { msgEl.textContent = ''; msgEl.className = 'cmsg'; }, 7000);
    }
  }

})();