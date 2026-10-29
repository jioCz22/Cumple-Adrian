/* =========================================================
   Felices 16, Jimena del Pilar — comportamiento
   Todo el movimiento usa transform/opacity y requestAnimationFrame;
   los canvas se pausan solos cuando no hay nada que animar.
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (_) {} };

  const surprise = $('#surprise');
  const startBtn = $('#startButton');
  const hint = $('#scrollHint');

  /* ---------------------------------------------------------
     1. GERBERAS EN SVG (se dibujan por código, sin imágenes)
     --------------------------------------------------------- */
  const heroHost = $('#heroFlower');
  const PALETTES = {
    hero:     { p1: '#eaf5ff', p2: '#5ea9f7', pd: '#1d5cbd', c1: '#1c3270', c2: '#081232', dot: '#ffe08a' },
    rosa:     { p1: '#ffd6ea', p2: '#f45ea5', pd: '#a81c62', c1: '#4a2a1a', c2: '#1d0e08', dot: '#ffd86b' },
    amarilla: { p1: '#fff3a8', p2: '#ffbf1f', pd: '#d17f00', c1: '#4b2c12', c2: '#1e1006', dot: '#fff0a0' },
    naranja:  { p1: '#ffc79b', p2: '#ff6b2c', pd: '#bd3508', c1: '#40201a', c2: '#190b08', dot: '#ffd38a' },
    blanca:   { p1: '#ffffff', p2: '#e3efff', pd: '#8fb3e6', c1: '#3b4a1a', c2: '#1a2208', dot: '#ffe58a' }
  };
  let gid = 0;

  // Generador de números pseudoaleatorios con semilla: cada flor es única pero siempre igual
  function rng(seed) {
    return () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // Pétalo (lígula) apuntando hacia arriba, base en (0,0)
  function petal(L, w) {
    return `M0 0 C${-w * .5} ${-L * .2} ${-w * .64} ${-L * .6} ${-w * .36} ${-L * .9} Q0 ${-L * 1.06} ${w * .36} ${-L * .9} C${w * .64} ${-L * .6} ${w * .5} ${-L * .2} 0 0Z`;
  }

  // Cabeza de la gerbera: 3 capas de pétalos con degradado, sombras y un centro con estambres
  function head(c, id, { anim = true, seed = 1 } = {}) {
    const r = rng(seed * 977 + 13);
    const layers = [
      { n: 21, L: 90, w: 13.5, g: 'a', off: 0 },
      { n: 21, L: 78, w: 13, g: 'b', off: .5 },
      { n: 18, L: 58, w: 11.5, g: 'c', off: .25 }
    ];
    let petals = '', k = 0;
    for (const ly of layers) {
      for (let i = 0; i < ly.n; i++) {
        const a = (360 / ly.n * (i + ly.off) + (r() - .5) * 5).toFixed(2);
        const L = ly.L * (1 + (r() - .5) * .1), w = ly.w * (1 + (r() - .5) * .12);
        const attrs = anim ? ` class="pt" style="--i:${k++}"` : '';
        petals += `<g transform="rotate(${a} 100 100)"><g${attrs}><g transform="translate(100 100)">` +
          `<path d="${petal(L, w)}" fill="url(#${id}${ly.g})"/>` +
          `<path d="M0 ${-L * .14} L0 ${-L * .8}" stroke="#fff" stroke-opacity=".3" stroke-width="1.1" stroke-linecap="round" fill="none"/>` +
          `</g></g></g>`;
      }
    }
    let dots = '';
    [[26, 19, 2], [16, 13, 1.8], [8, 7, 1.5]].forEach(([n, rad, size], ring) => {
      for (let i = 0; i < n; i++) {
        const ang = i * Math.PI * 2 / n + ring * .3;
        dots += `<circle cx="${(100 + Math.cos(ang) * rad).toFixed(1)}" cy="${(100 + Math.sin(ang) * rad).toFixed(1)}" r="${size}" fill="${c.dot}" opacity="${.95 - ring * .15}"/>`;
      }
    });
    return `<defs>
      <linearGradient id="${id}a" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c.pd}"/><stop offset=".7" stop-color="${c.p2}"/><stop offset="1" stop-color="${c.p2}"/></linearGradient>
      <linearGradient id="${id}b" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c.p2}"/><stop offset=".5" stop-color="${c.p2}"/><stop offset="1" stop-color="${c.p1}"/></linearGradient>
      <linearGradient id="${id}c" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c.p2}"/><stop offset=".75" stop-color="${c.p1}"/><stop offset="1" stop-color="${c.p1}"/></linearGradient>
      <radialGradient id="${id}d" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="${c.c2}"/><stop offset=".65" stop-color="${c.c1}"/><stop offset="1" stop-color="${c.c1}"/></radialGradient>
    </defs>${petals}
    <g${anim ? ' class="core"' : ''}>
      <circle cx="100" cy="100" r="28" fill="${c.pd}" opacity=".55"/>
      <circle cx="100" cy="100" r="25.5" fill="url(#${id}d)"/>
      <circle cx="100" cy="100" r="25.5" fill="none" stroke="${c.dot}" stroke-opacity=".5" stroke-width="1.4"/>
      ${dots}
      <ellipse cx="92" cy="90" rx="10" ry="5.5" transform="rotate(-35 92 90)" fill="#fff" opacity=".13"/>
    </g>`;
  }

  // Hoja lobulada: mitad en sombra y mitad iluminada, con nervadura central y nervaduras laterales
  const LEAF_L = 'M0 0 C-4 -8 -14 -10 -20 -8 C-14 -16 -18 -22 -26 -24 C-16 -30 -18 -40 -24 -46 C-14 -48 -12 -58 -14 -66 C-8 -64 -4 -74 0 -92Z';
  const LEAF_R = 'M0 0 C4 -8 14 -10 21 -9 C15 -17 19 -23 27 -26 C17 -31 19 -41 25 -48 C15 -49 13 -59 15 -67 C9 -65 4 -75 0 -92Z';
  function leaf(id, x, y, rot, s, i, flip) {
    const [A, B] = flip ? ['l2', 'l1'] : ['l1', 'l2'];
    return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><g class="leaf" style="--i:${i}">` +
      `<path d="${LEAF_L}" fill="url(#${id}${A})"/><path d="${LEAF_R}" fill="url(#${id}${B})"/>` +
      `<path d="M0 -2 L0 -88" stroke="#c9f5c4" stroke-opacity=".55" stroke-width="1.5" stroke-linecap="round" fill="none"/>` +
      `<path d="M0 -22 L-13 -29 M0 -38 L-15 -47 M0 -54 L-11 -63 M0 -24 L13 -31 M0 -40 L15 -49 M0 -56 L11 -65" stroke="#c9f5c4" stroke-opacity=".32" stroke-width=".9" fill="none" stroke-linecap="round"/>` +
      `</g></g>`;
  }

  // Solo la flor (para la portada)
  function gerberaHead(c, seed) {
    const id = 'gh' + gid++;
    return `<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">${head(c, id, { seed })}</svg>`;
  }

  // Planta completa: tallo que nace en el centro de la flor + hojas en distintos verdes
  function gerberaFull(c, seed) {
    const id = 'gf' + gid++;
    const defs = `<defs>
      <linearGradient id="${id}l1" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0f4a35"/><stop offset=".6" stop-color="#1f7a50"/><stop offset="1" stop-color="#2f9a62"/></linearGradient>
      <linearGradient id="${id}l2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#23704a"/><stop offset=".55" stop-color="#4cb673"/><stop offset="1" stop-color="#97e08f"/></linearGradient>
      <linearGradient id="${id}st" gradientUnits="userSpaceOnUse" x1="93" y1="0" x2="109" y2="0"><stop offset="0" stop-color="#14573e"/><stop offset=".5" stop-color="#3a9a62"/><stop offset="1" stop-color="#1c6a49"/></linearGradient>
    </defs>`;
    const back = leaf(id, 100, 352, -62, 1.1, 0, false) + leaf(id, 100, 352, 58, 1.02, 1, true) +
                 leaf(id, 100, 352, -26, .86, 2, true) + leaf(id, 100, 352, 30, .9, 3, false);
    const stem = `<path class="stem-path" pathLength="1" d="M100 352 C106 250 96 170 100 100" fill="none" stroke="url(#${id}st)" stroke-width="7" stroke-linecap="round"/>` +
                 `<path class="stem-path" pathLength="1" d="M101.5 346 C107 250 98 172 101 108" fill="none" stroke="#b6f0bd" stroke-opacity=".45" stroke-width="1.6" stroke-linecap="round"/>`;
    const mid = leaf(id, 103, 266, -52, .62, 4, false) + leaf(id, 99, 232, 48, .52, 5, true);
    return `<svg viewBox="0 0 200 360" aria-hidden="true" focusable="false">${defs}${back}${stem}${mid}${head(c, id + 'h', { seed })}</svg>`;
  }

  heroHost.innerHTML = gerberaHead(PALETTES.hero, 3);

  /* ---------------------------------------------------------
     2. TÍTULO LETRA POR LETRA
     --------------------------------------------------------- */
  let charIndex = 0;
  function splitNode(node) {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w';
          [...part].forEach(ch => {
            const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch;
            s.style.setProperty('--c', charIndex++); w.appendChild(s);
          });
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('heart')) splitNode(n);
    });
  }
  $$('[data-split]').forEach(splitNode);
  setTimeout(() => heroHost.classList.add('on'), 350);

  /* ---------------------------------------------------------
     3. FONDO: estrellas que titilan + burbujas que suben
     --------------------------------------------------------- */
  const bg = $('#bg'), bx = bg.getContext('2d');
  let bw = 0, bh = 0, stars = [], bubbles = [], bgRunning = false;

  function sizeBg(force) {
    if (!force && Math.abs(innerWidth - bw) < 2 && Math.abs(innerHeight - bh) < 140) return; // ignora la barra del navegador
    const dpr = Math.min(devicePixelRatio || 1, 2);
    bw = innerWidth; bh = innerHeight;
    bg.width = bw * dpr; bg.height = bh * dpr;
    bx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const area = bw * bh;
    stars = Array.from({ length: Math.min(90, Math.round(area / 9000)) }, () => ({
      x: rand(0, bw), y: rand(0, bh), r: rand(.5, 1.6), t: rand(0, 6.28), s: rand(.6, 1.8)
    }));
    bubbles = Array.from({ length: Math.min(18, Math.round(area / 30000) + 6) }, () => ({
      x: rand(0, bw), y: rand(0, bh), r: rand(4, 16), v: rand(.12, .4), sway: rand(0, 6.28), a: rand(.1, .28)
    }));
  }

  function drawBg(t) {
    bx.clearRect(0, 0, bw, bh);
    for (const s of stars) {
      const a = .35 + .65 * Math.abs(Math.sin(t / 1000 * s.s + s.t));
      bx.globalAlpha = a * .9; bx.fillStyle = '#d9efff';
      bx.beginPath(); bx.arc(s.x, s.y, s.r, 0, 6.283); bx.fill();
    }
    for (const b of bubbles) {
      b.y -= b.v; b.sway += .012;
      if (b.y < -30) { b.y = bh + 30; b.x = rand(0, bw); }
      const x = b.x + Math.sin(b.sway) * 14;
      bx.globalAlpha = b.a; bx.strokeStyle = '#bfe0ff'; bx.lineWidth = 1.2;
      bx.beginPath(); bx.arc(x, b.y, b.r, 0, 6.283); bx.stroke();
      bx.globalAlpha = b.a * 1.4; bx.fillStyle = '#fff';
      bx.beginPath(); bx.arc(x - b.r * .35, b.y - b.r * .35, b.r * .16, 0, 6.283); bx.fill();
    }
    bx.globalAlpha = 1;
  }
  function bgLoop(t) { if (!bgRunning) return; drawBg(t); requestAnimationFrame(bgLoop); }
  function bgStart() { if (bgRunning || reduce) return; bgRunning = true; requestAnimationFrame(bgLoop); }
  sizeBg(true);
  if (reduce) drawBg(0); else bgStart();
  document.addEventListener('visibilitychange', () => { bgRunning = false; if (!document.hidden) bgStart(); });

  /* ---------------------------------------------------------
     4. FUEGOS ARTIFICIALES + CONFETI (un solo canvas)
     --------------------------------------------------------- */
  const fx = $('#fx'), fc = fx.getContext('2d');
  let fw = 0, fh = 0, parts = [], fxRaf = 0;
  const COLORS = ['#7cc0ff', '#ffffff', '#4aa3ff', '#ffb8dc', '#ffe08a', '#bfe0ff'];

  function sizeFx() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    fw = innerWidth; fh = innerHeight;
    fx.width = fw * dpr; fx.height = fh * dpr;
    fc.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeFx();
  let lastW = innerWidth;
  addEventListener('resize', () => {
    if (innerWidth !== lastW) { lastW = innerWidth; sizeFx(); sizeBg(true); } else sizeBg(false);
  });

  function burst(x, y, { n = 64, colors = COLORS, power = 1, gravity = .05 } = {}) {
    if (reduce) return;
    const hue = pick(colors);
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + rand(-.1, .1), s = rand(1.4, 4.6) * power;
      parts.push({ k: 'spark', x, y, px: x, py: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: gravity,
        life: 1, decay: rand(.009, .021), c: Math.random() < .6 ? hue : pick(colors), r: rand(1.2, 2.6) });
    }
    capParts(); fxStart();
  }

  function confetti(n = 80, x0 = 0, x1 = fw) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      parts.push({ k: 'conf', x: rand(x0, x1), y: rand(-60, -10), vx: rand(-.8, .8), vy: rand(1.4, 3.4),
        rot: rand(0, 6.28), vr: rand(-.14, .14), w: rand(6, 11), h: rand(10, 17), life: 1, decay: rand(.0035, .006),
        c: pick(COLORS), sw: rand(0, 6.28) });
    }
    capParts(); fxStart();
  }

  function capParts() { if (parts.length > 1100) parts.splice(0, parts.length - 1100); }

  function fxStep() {
    fc.clearRect(0, 0, fw, fh);
    fc.globalCompositeOperation = 'lighter';
    fc.lineCap = 'round';
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= p.decay;
      if (p.life <= 0 || p.y > fh + 40) { parts.splice(i, 1); continue; }
      if (p.k === 'spark') {
        p.px = p.x; p.py = p.y;
        p.vx *= .985; p.vy = p.vy * .985 + p.g; p.x += p.vx; p.y += p.vy;
        fc.globalAlpha = Math.max(p.life, 0);
        fc.strokeStyle = p.c; fc.lineWidth = p.r;
        fc.beginPath(); fc.moveTo(p.px, p.py); fc.lineTo(p.x, p.y); fc.stroke();
      }
    }
    fc.globalCompositeOperation = 'source-over';
    for (const p of parts) {
      if (p.k !== 'conf') continue;
      p.sw += .05; p.x += p.vx + Math.sin(p.sw) * .7; p.y += p.vy; p.rot += p.vr;
      fc.save(); fc.globalAlpha = Math.min(1, p.life * 2.4);
      fc.translate(p.x, p.y); fc.rotate(p.rot); fc.scale(1, Math.cos(p.sw));
      fc.fillStyle = p.c; fc.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); fc.restore();
    }
    fc.globalAlpha = 1;
    fxRaf = parts.length ? requestAnimationFrame(fxStep) : 0;
    if (!parts.length) fc.clearRect(0, 0, fw, fh);
  }
  function fxStart() { if (!fxRaf) fxRaf = requestAnimationFrame(fxStep); }

  async function fireworks(count = 6, gap = 380) {
    for (let i = 0; i < count; i++) {
      burst(rand(fw * .15, fw * .85), rand(fh * .12, fh * .5), { n: Math.round(rand(54, 90)), power: rand(.9, 1.25) });
      await wait(gap * rand(.6, 1.3));
    }
  }
  function celebrate(level = 1) {
    if (level === 1) { confetti(60); fireworks(3, 320); }
    if (level === 2) { confetti(160); fireworks(9, 300); }
  }

  /* ---------------------------------------------------------
     6. ABRIR LA SORPRESA + REVELADO AL HACER SCROLL
     --------------------------------------------------------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in', 'on');
      io.unobserve(e.target);
    });
  }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });

  let mounted = false;
  startBtn.addEventListener('click', () => {
    if (mounted) { $('#intro').scrollIntoView({ behavior: 'smooth' }); return; }
    mounted = true;
    mountSurprise();
    document.body.classList.remove('locked');
    surprise.hidden = false;
    $$('.reveal', surprise).forEach(el => io.observe(el));
    startBtn.querySelector('span').textContent = 'Tu sorpresa está aquí abajo';
    startBtn.querySelector('i').textContent = '💙';
    hint.classList.add('show');
    buzz(30); celebrate(1);
    setTimeout(() => $('#intro').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }), 700);
  });

  // barra de progreso
  const bar = $('#bar'); let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
      if (scrollY > 80) hint.classList.remove('show');
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });

  /* Todo lo interactivo de la sorpresa se activa SOLO cuando el contenido ya fue creado. */
  function mountSurprise() {
  $$('.flower').forEach((f, i) => { $('.gerbera-host', f).innerHTML = gerberaFull(PALETTES[f.dataset.color] || PALETTES.rosa, i + 5); });

  /* ---------------------------------------------------------
     7. JARDÍN
     --------------------------------------------------------- */
  const flowerMsg = $('#flowerMessage');
  const dots = $$('#flowerDots i');
  const seen = new Set();
  const PETAL_COLORS = {
    rosa: ['#ffe1f0', '#ff7fb8'], amarilla: ['#fff4b0', '#ffbd2e'], naranja: ['#ffd0b0', '#ff6a3d'], blanca: ['#ffffff', '#b9dcff']
  };

  $$('.flower').forEach((f, i) => {
    f.addEventListener('click', () => {
      flowerMsg.textContent = f.dataset.message;
      flowerMsg.classList.remove('swap'); void flowerMsg.offsetWidth; flowerMsg.classList.add('swap');
      f.classList.remove('pop'); void f.offsetWidth; f.classList.add('pop', 'seen');
      buzz(15);
      const r = $('.gerbera-host', f).getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.width / 2, { n: 26, colors: PETAL_COLORS[f.dataset.color], power: .7, gravity: .03 });
      seen.add(i); dots.forEach((d, k) => d.classList.toggle('on', seen.has(k)));
      if (seen.size === 4 && !flowerMsg.dataset.done) {
        flowerMsg.dataset.done = '1';
        setTimeout(() => { flowerMsg.textContent = 'Jardín completo 🌼💙 Cada flor era un deseo para ti.'; flowerMsg.classList.remove('swap'); void flowerMsg.offsetWidth; flowerMsg.classList.add('swap'); confetti(50); fireworks(2, 300); buzz([20, 30, 20]); }, 2600);
      }
    });
  });

  /* ---------------------------------------------------------
     8. TARJETAS QUE SE VOLTEAN
     --------------------------------------------------------- */
  $$('.fcard').forEach(c => c.addEventListener('click', () => {
    c.style.setProperty('--d', '0s'); // el giro no debe heredar el retraso escalonado de la aparición
    const on = c.classList.toggle('flipped');
    c.setAttribute('aria-pressed', String(on)); buzz(10);
  }));

  /* ---------------------------------------------------------
     9. TOCHO: patada y touchdown
     --------------------------------------------------------- */
  const ball = $('#football'), field = $('#field'), fbMsg = $('#footballMessage');
  ball.addEventListener('click', async () => {
    field.style.setProperty('--dx', Math.max(field.clientWidth * .88 - 92, 120) + 'px');
    ball.classList.remove('back-in'); ball.classList.add('kick'); buzz(20);
    await wait(reduce ? 50 : 1400);
    const g = $('.goal', field).getBoundingClientRect();
    burst(g.left + g.width / 2, g.top + g.height * .3, { n: 80, power: 1.2 });
    confetti(40); buzz([30, 40, 30]);
    if (fbMsg.classList.contains('hidden')) { fbMsg.classList.remove('hidden'); fbMsg.classList.add('swap'); }
    await wait(1400);
    ball.classList.remove('kick'); ball.classList.add('back-in');
  });

  /* ---------------------------------------------------------
     10. PASTEL REALISTA (SVG) + VELAS EN FORMA DE 1 Y 6
     --------------------------------------------------------- */
  function buildCake() {
    const CX = 180;
    const edge = (x, rx, ry, cy) => cy + ry * Math.sqrt(Math.max(0, 1 - ((x - CX) / rx) ** 2));

    // merengue con arándano
    const dollop = (x, y, berry) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      <ellipse cx="0" cy="4" rx="12" ry="5" fill="#0a2a66" opacity=".25"/>
      <path d="M-11.5 3 C-12 -5 -6 -8 0 -14 C6 -8 12 -5 11.5 3 C11 8 -11 8 -11.5 3Z" fill="url(#cream)"/>
      <path d="M-8 1 C-3 -2 3 -2 8 1 M-6 -4 C-2 -6 2 -6 6 -4" stroke="#b5d2f0" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      ${berry ? `<circle cx="0" cy="-15" r="6.2" fill="url(#berry)"/><circle cx="-2" cy="-17.5" r="1.7" fill="#fff" opacity=".5"/><path d="M-2.2 -20.5 L0 -17.8 L2.2 -20.5" stroke="#0a1450" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
    </g>`;

    // dollops alrededor del borde del piso de abajo
    const dl = [];
    const N = 15;
    for (let i = 0; i < N; i++) {
      const th = Math.PI * 2 * i / N + .2;
      dl.push({ y: 205 + 22 * Math.sin(th), svg: dollop(CX + 147 * Math.cos(th), 205 + 22 * Math.sin(th), i % 2 === 0) });
    }
    dl.sort((a, b) => a.y - b.y);
    const backD = dl.filter(d => d.y < 205).map(d => d.svg).join('');
    const frontD = dl.filter(d => d.y >= 205).map(d => d.svg).join('');

    // perlas sobre las cintas
    const pearls = (cy, rx, ry, x0, x1, step) => {
      let o = '';
      for (let x = x0; x <= x1; x += step) o += `<circle cx="${x}" cy="${edge(x, rx, ry, cy).toFixed(1)}" r="3" fill="url(#pearl)"/>`;
      return o;
    };

    // goteo de glaseado en el piso de arriba
    let drips = '';
    const lens = [16, 26, 12, 22, 30, 14, 24, 18, 28, 13, 23, 17, 27, 15];
    lens.forEach((len, i) => {
      const x = 84 + i * (192 / (lens.length - 1));
      const y = edge(x, 105, 16, 135) - 2;
      drips += `<rect x="${(x - 5.5).toFixed(1)}" y="${y.toFixed(1)}" width="11" height="${len + 8}" rx="5.5" fill="url(#drip)"/>`;
    });

    // piping (conchitas) sobre el borde de arriba
    let shells = '';
    for (let i = 0; i <= 22; i++) {
      const th = Math.PI * (.06 + .88 * i / 22);
      shells += `<circle cx="${(CX + 98 * Math.cos(th)).toFixed(1)}" cy="${(135 + 14.5 * Math.sin(th)).toFixed(1)}" r="4.6" fill="url(#cream)" stroke="#b9d5f1" stroke-width=".6"/>`;
    }

    // velas con forma de número
    const N1 = 'M-8 -44 L4 -56 L4 -3 M-11 -3 L19 -3';
    const N6 = 'M12 -54 C-2 -50 -10 -38 -10 -24 C-10 -8 -2 -1 7 -1 C16 -1 21 -8 21 -17 C21 -26 15 -32 7 -32 C-1 -32 -8 -27 -10 -20';
    const candle = (x, y, d, tipX, tipY, label) => `
      <g class="candle" transform="translate(${x} ${y})" role="button" tabindex="0" aria-pressed="false" aria-label="${label}">
        <rect class="hit" x="-26" y="-104" width="62" height="112" rx="10"/>
        <ellipse cx="${tipX - 1}" cy="2" rx="22" ry="5" fill="#06204f" opacity=".28"/>
        <path d="${d}" fill="none" stroke="#2c5fae" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" transform="translate(2.5 3)"/>
        <path d="${d}" fill="none" stroke="url(#stripes)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${d}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" transform="translate(-2 -2)"/>
        <path d="M${tipX} ${tipY - 3} v-7" stroke="#2a2433" stroke-width="1.9" stroke-linecap="round"/>
        <g transform="translate(${tipX} ${tipY - 10})">
          <g class="flame-wrap">
            <circle class="glow-pulse" cx="0" cy="-12" r="30" fill="url(#flameGlow)"/>
            <g class="flame-g">
              <path d="M0 0 C-7.5 -6 -6.5 -17 0 -29 C6.5 -17 7.5 -6 0 0Z" fill="url(#flameG)"/>
              <path d="M0 -1 C-3.2 -5 -3 -11 0 -16 C3 -11 3.2 -5 0 -1Z" fill="#e8f3ff" opacity=".95"/>
            </g>
          </g>
          <path class="smoke" d="M0 -6 C-7 -18 7 -28 0 -44 C-5 -54 4 -60 0 -70" stroke="#dbe9ff" stroke-opacity=".8" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="90" stroke-dashoffset="90"/>
        </g>
      </g>`;

    const flowerTop = (x, y, seed) => `<g transform="translate(${x - 14} ${y - 14}) scale(.14)">${head(PALETTES.blanca, 'cg' + seed, { anim: false, seed })}</g>`;

    return `<svg viewBox="0 0 360 345" aria-hidden="false" focusable="false">
      <defs>
        <linearGradient id="plateG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6fbff"/><stop offset="1" stop-color="#9ec3e4"/></linearGradient>
        <linearGradient id="side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3d7fd2"/><stop offset=".16" stop-color="#7fb9f7"/><stop offset=".48" stop-color="#bfe0ff"/><stop offset=".82" stop-color="#76b0ef"/><stop offset="1" stop-color="#386fc0"/></linearGradient>
        <linearGradient id="face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d4e8fb"/></linearGradient>
        <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a4596"/><stop offset=".35" stop-color="#3a7fe0"/><stop offset=".65" stop-color="#2c68c4"/><stop offset="1" stop-color="#173f8c"/></linearGradient>
        <linearGradient id="drip" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e3f0fe"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe3f8"/></linearGradient>
        <radialGradient id="cream" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe2f6"/></radialGradient>
        <radialGradient id="berry" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#6f86e6"/><stop offset=".55" stop-color="#2c3f9e"/><stop offset="1" stop-color="#0c1450"/></radialGradient>
        <radialGradient id="pearl" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#bcd6f0"/></radialGradient>
        <radialGradient id="shadowG" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#001235" stop-opacity=".55"/><stop offset="1" stop-color="#001235" stop-opacity="0"/></radialGradient>
        <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffc35a" stop-opacity=".6"/><stop offset="1" stop-color="#ffc35a" stop-opacity="0"/></radialGradient>
        <radialGradient id="topGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd488" stop-opacity=".75"/><stop offset="1" stop-color="#ffd488" stop-opacity="0"/></radialGradient>
        <linearGradient id="flameG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff8a24"/><stop offset=".55" stop-color="#ffc247"/><stop offset="1" stop-color="#fff0a8"/></linearGradient>
        <pattern id="stripes" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="12" height="12" fill="#f4faff"/><rect width="6" height="12" fill="#68afff"/></pattern>
      </defs>

      <!-- plato y sombra -->
      <ellipse cx="180" cy="300" rx="172" ry="30" fill="url(#plateG)"/>
      <ellipse cx="180" cy="302" rx="150" ry="24" fill="none" stroke="#7fa9cf" stroke-opacity=".45" stroke-width="1.2"/>
      <ellipse cx="180" cy="306" rx="165" ry="26" fill="url(#shadowG)"/>

      <!-- piso de abajo -->
      <path d="M25 205 L25 290 A155 24 0 0 0 335 290 L335 205 Z" fill="url(#side)"/>
      <path d="M25 252 A155 24 0 0 0 335 252 L335 266 A155 24 0 0 1 25 266 Z" fill="url(#ribbon)"/>
      ${pearls(258, 155, 24, 40, 320, 14)}
      <ellipse cx="180" cy="205" rx="155" ry="24" fill="url(#face)"/>
      <ellipse cx="180" cy="205" rx="155" ry="24" fill="none" stroke="#a9cdf0" stroke-width="1"/>
      ${backD}

      <!-- piso de arriba -->
      <path d="M75 135 L75 205 A105 16 0 0 0 285 205 L285 135 Z" fill="url(#side)"/>
      <path d="M75 176 A105 16 0 0 0 285 176 L285 188 A105 16 0 0 1 75 188 Z" fill="url(#ribbon)"/>
      ${pearls(182, 105, 16, 88, 272, 12)}
      <ellipse cx="180" cy="135" rx="105" ry="16" fill="url(#face)"/>
      <path d="M75 135 A105 16 0 0 0 285 135 L285 146 A105 16 0 0 1 75 146 Z" fill="url(#drip)"/>
      ${drips}
      ${shells}
      ${flowerTop(112, 136, 11)}${flowerTop(248, 136, 12)}

      <!-- luz cálida de las velas sobre el pastel -->
      <g class="glow" id="cakeGlow">
        <ellipse cx="180" cy="136" rx="95" ry="20" fill="url(#topGlow)"/>
      </g>

      ${candle(148, 140, N1, 4, -56, 'Vela con forma de 1')}
      ${candle(204, 140, N6, 12, -54, 'Vela con forma de 6')}

      ${frontD}
    </svg>`;
  }

  const cakeHost = $('#cake'), counter = $('#candleCounter'), wish = $('#birthdayMessage');
  const blowAll = $('#blowAll');
  cakeHost.innerHTML = buildCake();
  const candles = $$('.candle', cakeHost);
  const glow = $('#cakeGlow', cakeHost);
  let remaining = candles.length, finished = false;

  function snuff(c) {
    if (c.classList.contains('out')) return;
    c.classList.add('out'); c.setAttribute('aria-pressed', 'true'); remaining--; buzz(12);
    glow.style.opacity = String(remaining / candles.length);
    counter.textContent = remaining === 0 ? '¡Velas apagadas! ✨' : remaining === 1 ? '1 vela encendida' : `${remaining} velas encendidas`;
    if (remaining === 0 && !finished) finale();
  }
  candles.forEach(c => {
    c.addEventListener('click', () => snuff(c));
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); snuff(c); } });
  });

  function finale() {
    finished = true; blowAll.hidden = true;
    wish.classList.remove('hidden'); buzz([40, 50, 40, 50, 80]);
    setTimeout(() => celebrate(2), 300);
    setTimeout(() => wish.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }), 600);
  }

  blowAll.addEventListener('click', async () => {
    blowAll.disabled = true;
    for (const c of candles.filter(x => !x.classList.contains('out'))) { snuff(c); await wait(reduce ? 0 : 280); }
  });

  /* ---------------------------------------------------------
     11. CARTA con efecto de máquina de escribir
     --------------------------------------------------------- */
  const env = $('#envelope'), wrap = $('#letterWrap'), paper = $('#paper');
  const lines = $$('[data-tw]', paper).map(el => ({ el, html: el.innerHTML }));
  let typed = false, typing = false, skip = false;

  async function typeLetter() {
    typing = true;
    lines.forEach(l => { l.el.innerHTML = ''; });
    for (const l of lines) {
      l.el.classList.add('caret');
      const tmp = document.createElement('div'); tmp.innerHTML = l.html;
      const text = tmp.textContent;
      // se escribe el texto plano y al final se restaura el HTML original (negritas, saltos de línea)
      let shown = '';
      for (const ch of text) {
        if (skip) break;
        shown += ch; l.el.textContent = shown;
        await wait(/[.,!?]/.test(ch) ? 160 : rand(18, 38));
      }
      l.el.innerHTML = l.html; l.el.classList.remove('caret');
      if (skip) { lines.forEach(x => { x.el.innerHTML = x.html; x.el.classList.remove('caret'); }); break; }
      await wait(220);
    }
    typed = true; typing = false;
  }

  env.addEventListener('click', () => {
    const opening = env.getAttribute('aria-expanded') !== 'true';
    env.setAttribute('aria-expanded', String(opening));
    wrap.classList.toggle('open', opening);
    buzz(15);
    if (opening) {
      setTimeout(() => paper.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }), 1150);
      if (!typed && !typing) {
        if (reduce) { typed = true; } else setTimeout(typeLetter, 900);
        confetti(30);
      }
    }
  });
  paper.addEventListener('click', () => { if (typing) skip = true; });

  /* ---------------------------------------------------------
     12. PIE DE PÁGINA
     --------------------------------------------------------- */
  $('#moreFireworks').addEventListener('click', () => { celebrate(2); buzz(30); });
  $('#toTop').addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  } // fin mountSurprise

  onScroll();
})();
