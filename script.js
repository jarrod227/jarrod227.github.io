(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const closeNav = () => {
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Open navigation');
    nav?.classList.remove('open');
  };
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav?.classList.toggle('open', open);
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
      closeNav();
      toggle.focus();
    }
  });
  document.addEventListener('click', e => {
    if (!nav?.contains(e.target) && !toggle?.contains(e.target)) closeNav();
  });
  let toastTimer;
  const notify = message => {
    const toast = document.querySelector('.toast');
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
  };
  document.querySelectorAll('[data-copy-email]').forEach(button => {
    button.addEventListener('click', async () => {
      const address = button.dataset.copyEmail;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(address);
        notify('Email address copied');
      } catch {
        const temporaryInput = document.createElement('textarea');
        temporaryInput.value = address;
        temporaryInput.setAttribute('readonly', '');
        temporaryInput.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.appendChild(temporaryInput);
        temporaryInput.select();
        let copied = false;
        try { copied = document.execCommand('copy'); } catch {}
        temporaryInput.remove();
        if (copied) {
          notify('Email address copied');
          return;
        }
        const emailLink = document.querySelector('.email-address');
        if (emailLink) {
          const range = document.createRange();
          range.selectNodeContents(emailLink);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
        notify('Select and copy the email address above');
      }
    });
  });
  const sections = document.querySelectorAll('main section[id]');
  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('nav a').forEach(link => {
          const active = link.getAttribute('href') === '/#' + entry.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, {rootMargin: '-15% 0px -65% 0px', threshold: 0});
    sections.forEach(section => observer.observe(section));
  }
})();

// Window-only ambient motion. The artwork stays visible without JavaScript.
(() => {
  const canvas = document.getElementById('night-sky');
  const toggle = document.getElementById('motion-toggle');
  if (!canvas || !document.body.classList.contains('home-page')) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let visible = true;
  let frame = 0;
  let lastFrame = 0;
  let width = 1;
  let height = 1;
  let clock = 0;
  let lastTime = 0;
  let stars = [];
  let seed = 227;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const render = () => {
    context.clearRect(0, 0, width, height);
    for (const star of stars) {
      // Scale drift with the window, so it remains visible on phones as well.
      const x = ((star.x - clock * star.speed) % 1 + 1) % 1 * width;
      const y = star.y * height + Math.sin(clock * 0.18 + star.phase) * height * 0.004;
      const pulse = 0.15 + 0.85 * (0.5 + 0.5 * Math.sin(clock * star.frequency + star.phase));
      const edge = Math.min(1, x / 16, (width - x) / 16);
      context.globalAlpha = star.opacity * pulse * Math.max(0, edge);
      context.fillStyle = star.blue ? '#b4d9ff' : '#f1f7ff';
      context.beginPath();
      context.arc(x, y, star.radius, 0, Math.PI * 2);
      context.fill();
      if (star.radius > 1.1) {
        context.globalAlpha *= 0.2;
        context.beginPath();
        context.arc(x, y, star.radius * 3, 0, Math.PI * 2);
        context.fill();
      }
    }
    // The first shooting star appears shortly after arrival, then occasionally.
    // Both paths fit inside this canvas, above the laptop and between the frames.
    for (const meteor of [
      { period: 10, delay: 1.5, x: 0.87, y: 0.1, dx: 0.43, dy: 0.4 },
      { period: 17, delay: 6.5, x: 0.62, y: 0.22, dx: 0.35, dy: 0.32 }
    ]) {
      const elapsed = clock - meteor.delay;
      if (elapsed < 0) continue;
      const cycle = elapsed % meteor.period;
      const duration = 1.45;
      if (cycle >= duration) continue;
      const progress = cycle / duration;
      const x = width * (meteor.x - progress * meteor.dx);
      const y = height * (meteor.y + progress * meteor.dy);
      const tailX = x + width * 0.11;
      const tailY = y - height * 0.1;
      const gradient = context.createLinearGradient(x, y, tailX, tailY);
      gradient.addColorStop(0, '#f0f8ff');
      gradient.addColorStop(0.25, '#b5dcffb3');
      gradient.addColorStop(1, '#b5dcff00');
      context.globalAlpha = Math.sin(progress * Math.PI) * 0.9;
      context.strokeStyle = gradient;
      context.lineWidth = Math.max(1, Math.min(1.7, width / 430));
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(tailX, tailY);
      context.stroke();
      context.fillStyle = '#e5f4ff';
      context.beginPath();
      context.arc(x, y, Math.max(1, width / 470), 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  };

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    seed = 227;
    const count = Math.min(160, Math.max(45, Math.floor(width / 4.5)));
    const sizeScale = Math.max(0.55, Math.min(1, width / 600));
    stars = Array.from({ length: count }, () => ({
      x: random(), y: random(), radius: (0.55 + random() * 1.15) * sizeScale,
      phase: random() * Math.PI * 2, frequency: 1.1 + random() * 1.9,
      speed: 0.008 + random() * 0.016, opacity: 0.55 + random() * 0.45,
      blue: random() > 0.6
    }));
    render();
  };

  const tick = now => {
    frame = 0;
    if (paused || !visible || document.hidden) return;
    if (now - lastFrame >= 33) {
      const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0;
      clock += delta;
      lastTime = now;
      lastFrame = now;
      render();
    }
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    document.body.classList.toggle('sky-paused', paused || !visible || document.hidden);
    if (toggle) {
      toggle.textContent = paused ? 'Play sky' : 'Pause sky';
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', paused ? 'Play animated stars' : 'Pause animated stars');
    }
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
  };
  toggle?.addEventListener('click', () => { paused = !paused; sync(); });
  reducedMotion.addEventListener('change', event => { paused = event.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('resize', resize, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  if ('IntersectionObserver' in window) {
    const hero = document.querySelector('.hero');
    if (hero) new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: 0 }).observe(hero);
  }
  resize();
  sync();
})();
