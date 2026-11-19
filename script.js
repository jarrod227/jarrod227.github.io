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
function fitArtworkScreen(canvas, stage, width, height, corners) {
    const bounds = stage.getBoundingClientRect();
    const points = corners
      .map(([x, y]) => [x * bounds.width / 1671, y * bounds.height / 941]);
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
}

function createCodeScreen() {
  const canvas = document.getElementById('code-screen');
  const stage = document.querySelector('.night-stage');
  const ctx = canvas?.getContext('2d');
  if (!ctx || !stage) return { fit() {}, draw() {} };
  const width = 640, height = 440, rowHeight = 26;
  const openingRow = 19, caretRow = 11;
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
  const opening = durations.slice(0, openingRow).reduce((sum, value) => sum + value, 0) + 1;
  const keywords = new Set(['const', 'constexpr', 'int', 'void', 'auto', 'if', 'while', 'return', '#include']);
  const tokenPattern = /\/\/.*$|"[^"\n]*"|#[a-z]+|[A-Za-z_]\w*|\d+|\s+|./g;
  let scroll = (openingRow - caretRow) * rowHeight;

  const fit = () => fitArtworkScreen(canvas, stage, width, height,
    [[1091, 487], [1249, 484], [1280, 591], [1126, 610]]);

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
    const target = Math.max(0, (current - caretRow) * rowHeight);
    scroll += (target - scroll) * (1 - Math.exp(-delta * 0.75));
    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, '#0d1a2e');
    background.addColorStop(1, '#102339');
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
    ctx.fillStyle = '#16263c';
    ctx.fillRect(0, 0, width, 39);
    ctx.fillStyle = '#8faabb';
    ctx.font = '14px ui-monospace, "Courier New", monospace';
    ctx.fillText('intent_controller.cpp', 19, 26);
    ctx.fillStyle = '#142a3f';
    ctx.fillRect(0, height - 22, width, 22);
    ctx.fillStyle = '#7296ab';
    ctx.font = '12px ui-monospace, "Courier New", monospace';
    ctx.fillText('UTF-8   C++', 18, height - 7);
  };
  return { fit, draw };
}

// The desk companion shows the visitor's local time between occasional expressions.
function createDeskPet() {
  const canvas = document.getElementById('desk-pet-screen');
  const stage = document.querySelector('.night-stage');
  const ctx = canvas?.getContext('2d');
  if (!ctx || !stage) return { fit() {}, draw() {}, setActive() {} };
  const head = stage.querySelector('.desk-pet-head');
  const width = 300, height = 200;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  let active = false;
  let mode = 'clock', previousFace = '';
  let startsAt = 0, endsAt = 0, nextAt = 0, lastPaint = '';
  const faces = ['smile', 'blush', 'cat', 'wink', 'sleepy', 'surprised', 'hearts', 'happy'];
  let gesture = '';
  const fit = () => {
    fitArtworkScreen(canvas, stage, width, height,
      [[943, 574], [989, 570], [997, 601], [952, 606]]);
    stage.classList.add('pet-ready');
    lastPaint = '';
    draw();
  };
  const eye = (x, y, radius = 7) => {
    ctx.beginPath();ctx.arc(x, y, radius, 0, Math.PI * 2);ctx.fill();
  };
  const smile = (x, y, radius) => {
    ctx.beginPath();ctx.arc(x, y, radius, Math.PI * 0.12, Math.PI * 0.88);ctx.stroke();
  };
  const heart = (x, y) => {
    ctx.beginPath();ctx.moveTo(x, y + 23);
    ctx.bezierCurveTo(x - 48, y - 6, x - 24, y - 38, x, y - 15);
    ctx.bezierCurveTo(x + 24, y - 38, x + 48, y - 6, x, y + 23);ctx.fill();
  };
  const cat = age => {
    // A brief pop-in on the OLED, with a hand-drawn cat face rather than a font dependency.
    const t = Math.min(1, age / 0.42);
    const pop = 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
    ctx.translate(150, 105 + (1 - t) * 25);
    ctx.scale(0.9 * pop, 0.9 * pop);
    ctx.translate(-150, -105);
    ctx.fillStyle = '#f3d597';
    ctx.beginPath();
    ctx.moveTo(80, 83);ctx.lineTo(84, 31);ctx.lineTo(119, 56);
    ctx.quadraticCurveTo(150, 44, 181, 56);
    ctx.lineTo(216, 31);ctx.lineTo(220, 83);
    ctx.quadraticCurveTo(247, 130, 203, 159);
    ctx.quadraticCurveTo(150, 182, 97, 159);
    ctx.quadraticCurveTo(53, 130, 80, 83);ctx.fill();
    ctx.fillStyle = '#dc9a9e';
    for (const [x, direction] of [[90, 1], [210, -1]]) {
      ctx.beginPath();ctx.moveTo(x, 48);ctx.lineTo(x + direction * 20, 63);
      ctx.lineTo(x, 77);ctx.closePath();ctx.fill();
    }
    ctx.fillStyle = '#3b3033';eye(112, 104, 7);eye(188, 104, 7);
    ctx.fillStyle = '#c7828b';ctx.beginPath();
    ctx.moveTo(141, 119);ctx.lineTo(159, 119);ctx.lineTo(150, 128);ctx.closePath();ctx.fill();
    ctx.strokeStyle = '#72544a';ctx.lineWidth = 4;
    ctx.beginPath();ctx.moveTo(150, 128);ctx.quadraticCurveTo(144, 141, 135, 132);
    ctx.moveTo(150, 128);ctx.quadraticCurveTo(156, 141, 165, 132);ctx.stroke();
    for (const side of [-1, 1]) {
      for (let row = 0; row < 3; row++) {
        ctx.beginPath();ctx.moveTo(150 + side * 47, 118 + row * 10);
        ctx.lineTo(150 + side * 79, 111 + row * 17);ctx.stroke();
      }
    }
  };
  const draw = () => {
    if (!active || document.hidden) return;
    const now = performance.now();
    if (reducedMotion.matches) mode = 'clock';
    else if (mode !== 'clock' && now >= endsAt) {
      mode = 'clock';
      nextAt = now + 6000 + Math.random() * 5000;
    } else if (mode === 'clock' && now >= nextAt) {
      const choices = faces.filter(face => face !== previousFace);
      mode = choices[Math.floor(Math.random() * choices.length)];
      previousFace = mode;startsAt = now;
      endsAt = now + 3200 + Math.random() * 1300;
      gesture = Math.random() < 0.55 ? (Math.random() < 0.5 ? 'sway' : 'nod') : '';
    }
    // Move the illustrated head and its OLED together; the pedestal stays still.
    const age = (now - startsAt) / 1000;
    if (head) {
      const moving = mode !== 'clock' && !reducedMotion.matches && gesture;
      const envelope = moving ? Math.max(0, Math.min(1, age / 0.35, (endsAt - now) / 450)) : 0;
      const wave = Math.sin(age * (gesture === 'nod' ? 6 : 4.5)) * envelope;
      head.style.transform = gesture === 'nod'
        ? `translateY(${wave * 1.5}px) scaleY(${1 - Math.abs(wave) * 0.035})`
        : `rotate(${wave * 4}deg)`;
    }
    const date = new Date();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const time = `${hour}:${minute}`;
    const colonVisible = reducedMotion.matches || date.getSeconds() % 2 === 0;
    const key = mode === 'clock' ? `${time}:${colonVisible}` : `${mode}:${Math.floor(now / 33)}`;
    if (canvas.dataset.time !== time) canvas.dataset.time = time;
    if (canvas.dataset.mode !== mode) canvas.dataset.mode = mode;
    if (key === lastPaint) return;
    lastPaint = key;
    ctx.fillStyle = '#090f15';ctx.fillRect(0, 0, width, height);
    ctx.save();ctx.lineCap = 'round';
    if (mode === 'clock') {
      ctx.textAlign = 'center';ctx.textBaseline = 'middle';
      ctx.font = '600 64px ui-monospace, "Courier New", monospace';
      ctx.fillStyle = '#d5f7ee';ctx.shadowColor = '#7edcc9';ctx.shadowBlur = 8;
      ctx.fillText(`${hour}${colonVisible ? ':' : ' '}${minute}`, 150, 102);
    } else {
      ctx.globalAlpha = Math.min(1, age / 0.15, (endsAt - now) / 300);
      ctx.translate(0, Math.sin(age * 2.4) * 2);
      ctx.fillStyle = '#f5f2df';ctx.strokeStyle = '#f5f2df';ctx.lineWidth = 10;
      if (mode === 'smile') {
        for (const x of [91, 209]) {
          ctx.beginPath();ctx.arc(x, 86, 17, Math.PI, Math.PI * 2);ctx.stroke();
        }
        smile(150, 96, 34);
      } else if (mode === 'blush') {
        eye(96, 79);eye(204, 79);smile(150, 102, 21);
        ctx.fillStyle = '#ed8ca6';ctx.globalAlpha *= 0.7;
        for (const x of [57, 243]) {
          ctx.beginPath();ctx.ellipse(x, 106, 24, 12, -0.15, 0, Math.PI * 2);ctx.fill();
        }
      } else if (mode === 'cat') cat(age);
      else if (mode === 'wink') {
        eye(94, 81, 10);
        ctx.beginPath();ctx.moveTo(190, 73);ctx.lineTo(211, 84);ctx.lineTo(190, 95);ctx.stroke();
        smile(150, 102, 27);
      } else if (mode === 'sleepy') {
        for (const x of [94, 206]) {
          ctx.beginPath();ctx.moveTo(x - 20, 90);ctx.quadraticCurveTo(x, 103, x + 20, 90);ctx.stroke();
        }
        ctx.lineWidth = 6;ctx.beginPath();ctx.ellipse(150, 131, 9, 5, 0, 0, Math.PI * 2);ctx.stroke();
        ctx.font = '600 32px ui-monospace, monospace';ctx.fillStyle = '#9edcfa';
        ctx.fillText('z', 244, 50 + Math.sin(age * 2) * 5);
      } else if (mode === 'surprised') {
        for (const x of [94, 206]) {
          ctx.beginPath();ctx.ellipse(x, 78, 13, 22, 0, 0, Math.PI * 2);ctx.fill();
        }
        ctx.lineWidth = 7;ctx.beginPath();ctx.ellipse(150, 133, 17, 23, 0, 0, Math.PI * 2);ctx.stroke();
      } else if (mode === 'hearts') {
        ctx.fillStyle = '#f29bb6';heart(91, 78);heart(209, 78);
        smile(150, 112, 23);
      } else if (mode === 'happy') {
        for (const x of [92, 208]) {
          ctx.beginPath();ctx.moveTo(x - 20, 92);ctx.lineTo(x, 72);ctx.lineTo(x + 20, 92);ctx.stroke();
        }
        ctx.beginPath();ctx.moveTo(120, 120);ctx.lineTo(180, 120);
        ctx.quadraticCurveTo(150, 175, 120, 120);ctx.fill();
      }
    }
    ctx.restore();
  };
  const setActive = value => {
    if (active === value) return;
    active = value;mode = 'clock';lastPaint = '';
    if (head) head.style.transform = '';
    nextAt = performance.now() + 3000 + Math.random() * 3000;
    if (active) draw();
  };
  // Continue updating the clock with reduced motion, even while ambient RAF is stopped.
  setInterval(draw, 1000);
  reducedMotion.addEventListener('change', () => {
    mode = 'clock';lastPaint = '';
    nextAt = performance.now() + 3000 + Math.random() * 3000;
    draw();
  });
  return { fit, draw, setActive };
}

// Window-only ambient motion. The artwork stays visible without JavaScript.
(() => {
  const canvas = document.getElementById('night-sky');
  if (!canvas || !document.body.classList.contains('home-page')) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const codeScreen = createCodeScreen();
  const deskPet = createDeskPet();
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
    // Both paths fit inside this canvas, above the equipment and between the window frames.
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
    deskPet.draw();
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
    deskPet.fit();
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
    deskPet.setActive(visible && !document.hidden);
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
