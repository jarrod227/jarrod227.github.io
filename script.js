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
