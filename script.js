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

// A small code editor projected onto the illustration's four LCD corners.
function createCodeScreen() {
  const canvas = document.getElementById('code-screen');
  const stage = document.querySelector('.night-stage');
  const ctx = canvas?.getContext('2d');
  if (!ctx || !stage) return { fit() {}, draw() {} };
  const width = 480, height = 640, rowHeight = 26;
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  const lines = [
    '// Biosignals to shared autonomy',
    '#include "signal_pipeline.h"',
    '#include "intent_decoder.h"',
    '',
    'constexpr int channels = 32;',
    'constexpr int sample_hz = 2000;',
    '',
    'SignalPipeline filter(sample_hz);',
    'IntentDecoder decoder;',
    'SharedController controller;',
    '',
    'void update() {',
    '  const auto raw = sensors.read();',
    '  const auto emg = filter.update(raw);',
    '  const auto features = extract(emg);',
    '  auto intent = decoder.predict(features);',
    '',
    '  if (controller.is_ready()) {',
    '    controller.set_intent(intent);',
    '    const auto goal = planner.next();',
    '    robot.track(goal);',
    '  }',
    '',
    '  telemetry.publish(emg, intent);',
    '  watchdog.feed();',
    '}',
    '',
    'void setup() {',
    '  sensors.begin(channels, sample_hz);',
    '  filter.calibrate();',
    '  decoder.load_model();',
    '  controller.reset();',
    '}',
    '',
    'int main() {',
    '  setup();',
    '  while (system.is_running()) {',
    '    update();',
    '    scheduler.wait_next_tick();',
    '  }',
    '  return 0;',
    '}',
    ''
  ];
  const durations = lines.map(line => Math.max(0.4, line.length / 10) + 0.7);
  const period = durations.reduce((sum, value) => sum + value, 0);
  const opening = durations.slice(0, 19).reduce((sum, value) => sum + value, 0) + 1;
  const keywords = new Set(['const', 'constexpr', 'int', 'void', 'auto', 'if', 'while', 'return', '#include']);
  const tokenPattern = /\/\/.*$|"[^"\n]*"|#[a-z]+|[A-Za-z_]\w*|\d+|\s+|./g;
  let scroll = 0;

  const fit = () => {
    const bounds = stage.getBoundingClientRect();
    // Inset inside the existing bezel; coordinates refer to the 1672 × 941 artwork.
    const points = [[908, 570], [1036, 579], [1083, 729], [968, 759]]
      .map(([x, y]) => [x * bounds.width / 1672, y * bounds.height / 941]);
    const [p0, p1, p2, p3] = points;
    const dx1 = p1[0] - p2[0], dx2 = p3[0] - p2[0];
    const dy1 = p1[1] - p2[1], dy2 = p3[1] - p2[1];
    const dx3 = p0[0] - p1[0] + p2[0] - p3[0];
    const dy3 = p0[1] - p1[1] + p2[1] - p3[1];
    const denominator = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(denominator) < 0.001) return;
    const g = (dx3 * dy2 - dx2 * dy3) / denominator;
    const h = (dx1 * dy3 - dx3 * dy1) / denominator;
    const a = p1[0] - p0[0] + g * p1[0];
    const b = p3[0] - p0[0] + h * p3[0];
    const d = p1[1] - p0[1] + g * p1[1];
    const e = p3[1] - p0[1] + h * p3[1];
    canvas.style.transform = `matrix3d(${[
      a / width, d / width, 0, g / width,
      b / height, e / height, 0, h / height,
      0, 0, 1, 0, p0[0], p0[1], 0, 1
    ].join(',')})`;
    canvas.classList.add('is-ready');
  };

  const drawLine = (text, x, y) => {
    const tokens = text.match(tokenPattern) || [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const next = tokens.slice(i + 1).find(value => value.trim());
      ctx.fillStyle = token.startsWith('//') ? '#698d9e'
        : token.startsWith('"') ? '#91bba5'
        : keywords.has(token) ? '#d79bcf'
        : /^\d/.test(token) ? '#d0b68b'
        : next === '(' && /^[A-Za-z_]/.test(token) ? '#77ccd9' : '#a3bccc';
      ctx.fillText(token, x, y);
      x += ctx.measureText(token).width;
    }
  };

  const draw = (clock, delta = 0) => {
    const elapsed = clock + opening;
    const cycle = Math.floor(elapsed / period);
    let position = elapsed % period, row = 0;
    while (row < lines.length - 1 && position >= durations[row]) {
      position -= durations[row++];
    }
    const current = cycle * lines.length + row;
    const count = Math.min(lines[row].length, Math.floor(position * 10));
    const target = Math.max(0, (current - 17) * rowHeight);
    scroll += (target - scroll) * (1 - Math.exp(-delta * 0.75));
    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, '#10263e');
    background.addColorStop(1, '#12324a');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 43, width, height - 65);
    ctx.clip();
    ctx.font = '18px ui-monospace, "Courier New", monospace';
    ctx.textBaseline = 'alphabetic';
    const first = Math.max(0, Math.floor(scroll / rowHeight) - 1);
    for (let index = first; index <= current; index++) {
      const y = 67 + index * rowHeight - scroll;
      if (y > height - 21) break;
      if (y < 28) continue;
      ctx.fillStyle = '#507187';
      ctx.fillText(String(index % lines.length + 1).padStart(2), 10, y);
      const text = lines[index % lines.length];
      const shown = index === current ? text.slice(0, count) : text;
      drawLine(shown, 49, y);
      if (index === current && Math.floor(clock * 1.7) % 2 === 0) {
        ctx.fillStyle = '#d3edf1';
        ctx.shadowColor = '#8edee8';
        ctx.shadowBlur = 6;
        ctx.fillRect(51 + ctx.measureText(shown).width, y - 16, 3, 20);
        ctx.shadowBlur = 0;
      }
    }
    ctx.restore();
    ctx.fillStyle = '#18364e';
    ctx.fillRect(0, 0, width, 39);
    ctx.fillStyle = '#8faabb';
    ctx.font = '14px ui-monospace, "Courier New", monospace';
    ctx.fillText('intent_controller.cpp', 19, 26);
    ctx.fillStyle = '#1a3b52';
    ctx.fillRect(0, height - 22, width, 22);
    ctx.fillStyle = '#7296ab';
    ctx.font = '12px ui-monospace, "Courier New", monospace';
    ctx.fillText('UTF-8   C++', 18, height - 7);
  };
  return { fit, draw };
}

// Window-only ambient motion. The artwork stays visible without JavaScript.
(() => {
  const canvas = document.getElementById('night-sky');
  if (!canvas || !document.body.classList.contains('home-page')) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const codeScreen = createCodeScreen();
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

  const render = (delta = 0) => {
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
    codeScreen.draw(clock, delta);
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
    codeScreen.fit();
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
      render(delta);
    }
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    document.body.classList.toggle('ambient-paused', paused || !visible || document.hidden);
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
  };
  reducedMotion.addEventListener('change', event => { paused = event.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('resize', resize, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(document.querySelector('.night-stage'));
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
