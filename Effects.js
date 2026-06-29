/* ══════════════════════════════════════════
   EFFECTS.JS — F.R.I.D.A.Y OS
   BG Engine · Ripple · Parallax · Page Transitions
   Interactive Canvas · Scroll Reveal
══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   0. BG ENGINE — جایگزین نسخه داخل HTML
   هر تم انیمیشن کاملاً متمایز، 30fps، fade transition
══════════════════════════════════════════ */
window.THEME_MORPH_TRIGGER = null; // دایره کلیک تم حذف شد

window.BG = (() => {
  let canvas, ctx, W, H, raf;
  let lastT = 0;
  let style = 'particles';
  let colors = ['rgba(176,125,58,.35)', 'rgba(74,140,106,.28)', 'rgba(192,82,42,.22)'];
  let gAlpha = 1, transitioning = false;
  let state = {};

  /* ── init ── */
  function init(cvs) {
    canvas = cvs;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', () => { resize(); buildState(); });
    buildState();
    loop();
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* ── state builders ── */
  function buildState() {
    const n = Math.min(Math.floor(W * H / 13000), 58);
    state = {
      particles: Array.from({ length: n }, () => mkParticle(true)),
      stars:     Array.from({ length: 95 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.7 + Math.random() * 1.9,
        ph: Math.random() * Math.PI * 2,
        spd: 0.003 + Math.random() * 0.008,
      })),
      petals: Array.from({ length: 18 }, () => mkPetal(true)),
      neonLines: [
        { y: H * 0.22, ph: 0,   spd: 0.0009 },
        { y: H * 0.51, ph: 2.1, spd: 0.0007 },
        { y: H * 0.77, ph: 4.2, spd: 0.0011 },
      ],
    };
  }

  function mkParticle(rand = false) {
    return {
      x: rand ? Math.random() * W : (Math.random() < .5 ? -8 : W + 8),
      y: rand ? Math.random() * H : Math.random() * H,
      r: 1.8 + Math.random() * 3.2,
      vx: (Math.random() - .5) * .48,
      vy: (Math.random() - .5) * .48,
      ph: Math.random() * Math.PI * 2,
      spd: 0.005 + Math.random() * 0.009,
      ci: Math.floor(Math.random() * 3),
    };
  }

  function mkPetal(rand = false) {
    return {
      x: rand ? Math.random() * W : Math.random() * W,
      y: rand ? Math.random() * H : -25,
      vy: 0.38 + Math.random() * 0.7,
      vx: (Math.random() - .5) * 0.55,
      rot: Math.random() * Math.PI * 2,
      rotV: (.012 + Math.random() * .026) * (Math.random() < .5 ? 1 : -1),
      sz: 6 + Math.random() * 11,
      op: 0.28 + Math.random() * 0.38,
      wb: Math.random() * Math.PI * 2,
      wbSpd: .013 + Math.random() * .022,
      ci: Math.floor(Math.random() * 3),
    };
  }

  /* ── color helper ── */
  function ca(c, a) {
    return c.replace(/[\d.]+\)$/, a.toFixed(3) + ')');
  }

  /* ══════════════════════════════════════
     DRAW: PARTICLES
  ══════════════════════════════════════ */
  function drawParticles(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = gAlpha;

    const ps = state.particles;
    ps.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; p.ph += p.spd;
      if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) {
        ps[i] = mkParticle(false); return;
      }
      const op = 0.3 + 0.38 * Math.abs(Math.sin(p.ph));
      const col = colors[p.ci];
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5.5);
      g.addColorStop(0, ca(col, op * 0.75));
      g.addColorStop(1, ca(col, 0));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5.5, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = ca(col, Math.min(op * 2.2, 0.8)); ctx.fill();
    });

    // connections (d² check — نه sqrt هر بار)
    for (let i = 0; i < ps.length; i++) {
      for (let j = i + 1; j < ps.length; j++) {
        const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 8100) {
          ctx.beginPath();
          ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y);
          ctx.strokeStyle = ca(colors[0], 0.15 * (1 - Math.sqrt(d2) / 90));
          ctx.lineWidth = 0.6; ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ══════════════════════════════════════
     DRAW: GRID
  ══════════════════════════════════════ */
  function drawGrid(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = gAlpha;

    const gs = 34, pulse = 0.5 + 0.5 * Math.sin(t * 0.0005);
    ctx.strokeStyle = ca(colors[0], 0.16 * pulse);
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= W; x += gs) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += gs) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // موج روی نقاط تقاطع
    const tm = t * 0.001;
    for (let x = 0; x <= W; x += gs) {
      for (let y = 0; y <= H; y += gs) {
        const w = Math.sin(x * 0.028 + tm) * Math.cos(y * 0.028 + tm * 0.72);
        const op = 0.07 + 0.22 * Math.max(0, w);
        if (op > 0.08) {
          const r = Math.max(0.4, 1 + 2.2 * Math.max(0, w));
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = ca(colors[1], op); ctx.fill();
        }
      }
    }

    // scan line
    const sl = ((t * 0.038) % (H + 60)) - 30;
    const sg = ctx.createLinearGradient(0, sl - 30, 0, sl + 30);
    sg.addColorStop(0, 'transparent');
    sg.addColorStop(.5, ca(colors[2], 0.11));
    sg.addColorStop(1, 'transparent');
    ctx.fillStyle = sg; ctx.fillRect(0, sl - 30, W, 60);
    ctx.globalAlpha = 1;
  }

  /* ══════════════════════════════════════
     DRAW: STARS
  ══════════════════════════════════════ */
  function drawStars(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = gAlpha;

    // nebula blobs
    [[0.18, 0.28, 0], [0.72, 0.62, 1], [0.88, 0.18, 2]].forEach(([xp, yp, ci]) => {
      const x = W * xp, y = H * yp;
      const r = 110 + 30 * Math.sin(t * 0.0004 + ci * 1.6);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, ca(colors[ci], 0.14)); g.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
    });

    state.stars.forEach(s => {
      s.ph += s.spd;
      const op = 0.18 + 0.6 * Math.abs(Math.sin(s.ph));
      const r  = s.r * (0.72 + 0.28 * Math.abs(Math.sin(s.ph)));
      ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fillStyle = ca(colors[0], op); ctx.fill();
    });

    // shooting star (نادر)
    if (Math.random() < 0.0025) {
      const sx = Math.random() * W, sy = Math.random() * H * 0.45;
      const sg = ctx.createLinearGradient(sx, sy, sx + 95, sy + 48);
      sg.addColorStop(0, ca(colors[1], 0.75)); sg.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 95, sy + 48);
      ctx.strokeStyle = sg; ctx.lineWidth = 1.3; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /* ══════════════════════════════════════
     DRAW: PETALS
  ══════════════════════════════════════ */
  function drawPetals(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = gAlpha;

    state.petals.forEach(p => {
      p.y += p.vy; p.wb += p.wbSpd;
      p.x += p.vx + Math.sin(p.wb) * 0.5;
      p.rot += p.rotV;
      if (p.y > H + 28) Object.assign(p, mkPetal(false));
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.sz * 0.36, p.sz, Math.PI / 5, 0, Math.PI * 2);
      ctx.fillStyle = ca(colors[p.ci], p.op);
      ctx.fill(); ctx.restore();
    });

    // subtle background particles
    ctx.globalAlpha = gAlpha * 0.45;
    state.particles.forEach((p, i) => {
      p.x += p.vx * 0.38; p.y += p.vy * 0.38; p.ph += p.spd;
      if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) {
        state.particles[i] = mkParticle(false); return;
      }
      const op = 0.1 + 0.18 * Math.abs(Math.sin(p.ph));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = ca(colors[p.ci], op); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  /* ══════════════════════════════════════
     DRAW: WAVES
  ══════════════════════════════════════ */
  function drawWaves(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = gAlpha;

    for (let layer = 0; layer < 4; layer++) {
      const amp   = 20 + layer * 10;
      const freq  = 0.007 - layer * 0.001;
      const spd   = t * 0.00028 * (1 + layer * 0.38);
      const yBase = H * (0.28 + layer * 0.17);
      const col   = colors[layer % 3];

      ctx.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const y = yBase + amp * Math.sin(x * freq + spd) + amp * 0.48 * Math.sin(x * freq * 1.85 + spd * 1.35);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fillStyle = ca(col, 0.1 + layer * 0.018); ctx.fill();

      // crest highlight
      ctx.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const y = yBase + amp * Math.sin(x * freq + spd) + amp * 0.48 * Math.sin(x * freq * 1.85 + spd * 1.35);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = ca(col, 0.28); ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /* ══════════════════════════════════════
     DRAW: AURORA
  ══════════════════════════════════════ */
  function drawAurora(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = gAlpha;

    for (let band = 0; band < 3; band++) {
      const ph = t * 0.00028 + band * 1.38;
      const yC = H * (0.16 + band * 0.27) + H * 0.1 * Math.sin(ph);
      const bH = H * 0.22 + H * 0.08 * Math.cos(ph * 0.75);
      const col = colors[band % 3];

      const g = ctx.createLinearGradient(0, yC - bH, 0, yC + bH);
      g.addColorStop(0, 'transparent');
      g.addColorStop(0.25, ca(col, 0.28));
      g.addColorStop(0.5,  ca(col, 0.42));
      g.addColorStop(0.75, ca(col, 0.28));
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(0, yC - bH, W, bH * 2);

      // vertical streaks
      for (let x = 0; x < W; x += 52) {
        const rx = x + 20 * Math.sin(t * 0.0007 + x * 0.012 + band);
        const rg = ctx.createLinearGradient(rx, yC - bH * 0.88, rx + 26, yC + bH * 0.88);
        rg.addColorStop(0, 'transparent');
        rg.addColorStop(.5, ca(col, 0.12));
        rg.addColorStop(1, 'transparent');
        ctx.fillStyle = rg; ctx.fillRect(rx, yC - bH * 0.88, 26, bH * 1.76);
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ══════════════════════════════════════
     DRAW: NEON
  ══════════════════════════════════════ */
  function drawNeon(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = gAlpha;

    // background glow orbs
    colors.forEach((col, i) => {
      const x = W * [0.14, 0.86, 0.5][i];
      const y = H * [0.24, 0.66, 0.88][i];
      const r = 115 + 38 * Math.sin(t * 0.001 + i * 2.2);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, ca(col, 0.22)); g.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
    });

    // neon bezier lines
    state.neonLines.forEach((ln, i) => {
      ln.ph += ln.spd * 16;
      const pulse = 0.52 + 0.48 * Math.sin(ln.ph);
      const col = colors[i % 3];
      ctx.save();
      ctx.shadowBlur = 20; ctx.shadowColor = ca(col, 0.6);
      ctx.beginPath();
      ctx.moveTo(0, ln.y + 24 * Math.sin(ln.ph));
      ctx.bezierCurveTo(
        W * 0.28, ln.y - 48 + 34 * Math.sin(ln.ph * 1.32),
        W * 0.72, ln.y + 48 + 24 * Math.cos(ln.ph * 1.12),
        W,        ln.y + 20 * Math.cos(ln.ph * 0.9)
      );
      ctx.strokeStyle = ca(col, 0.38 * pulse);
      ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    });

    // fast particles
    state.particles.forEach((p, i) => {
      p.x += p.vx * 1.65; p.y += p.vy * 1.65; p.ph += p.spd;
      if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) {
        state.particles[i] = mkParticle(false); return;
      }
      const op = 0.32 + 0.48 * Math.abs(Math.sin(p.ph));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = ca(colors[p.ci], op); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  /* ══════════════════════════════════════
     FADE TRANSITION — قاطی نمیشن
  ══════════════════════════════════════ */
  const DRAW = { particles: drawParticles, grid: drawGrid, stars: drawStars, petals: drawPetals, waves: drawWaves, aurora: drawAurora, neon: drawNeon };

  function fadeSwitch(newStyle, newColors) {
    // اگه وسط transition بودیم مقدار جدید رو فقط ست می‌کنیم
    if (transitioning) {
      style = newStyle;
      if (newColors) colors = newColors;
      return;
    }
    transitioning = true;
    const STEPS = 7;
    let step = 0;

    const fadeOut = () => {
      step++;
      gAlpha = 1 - step / STEPS;
      if (step < STEPS) { requestAnimationFrame(fadeOut); return; }
      gAlpha = 0;
      style = newStyle;
      if (newColors) colors = newColors;
      buildState();
      step = 0;
      requestAnimationFrame(fadeIn);
    };
    const fadeIn = () => {
      step++;
      gAlpha = step / STEPS;
      if (step < STEPS) { requestAnimationFrame(fadeIn); return; }
      gAlpha = 1;
      transitioning = false;
    };
    requestAnimationFrame(fadeOut);
  }

  /* ══════════════════════════════════════
     LOOP — throttle 30fps
  ══════════════════════════════════════ */
  function loop(t = 0) {
    requestAnimationFrame(loop);
    if (t - lastT < 33) return; // ~30fps — فریم ریت پایین نمیاد
    lastT = t;
    (DRAW[style] || drawParticles)(t);
  }

  return { init, setStyle: fadeSwitch };
})();


/* ══════════════════════════════════════════
   1. RIPPLE — روی دکمه‌ها و کارت‌ها
══════════════════════════════════════════ */
(function initRipple() {
  const style = document.createElement('style');
  style.textContent = `
    .ripple-host { position: relative; overflow: hidden; }
    .ripple-wave {
      position: absolute; border-radius: 50%;
      transform: scale(0); pointer-events: none;
      animation: rippleAnim .55s cubic-bezier(.22,1,.36,1) forwards;
      background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
      opacity: 0;
    }
    @keyframes rippleAnim {
      0%   { transform: scale(0); opacity: .4; }
      100% { transform: scale(4); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  function spawnRipple(el, e) {
    const rect = el.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    const size = Math.max(rect.width, rect.height) * 1.6;
    const wave = document.createElement('div');
    wave.className = 'ripple-wave';
    wave.style.cssText = `width:${size}px;height:${size}px;left:${x - size/2}px;top:${y - size/2}px`;
    el.appendChild(wave);
    wave.addEventListener('animationend', () => wave.remove());
  }

  const SELECTORS = '.hbtn,.ni,.dl-add,.dl-save-btn,.lk-btn,.rfbtn,.back-btn,.cat-pill,.dl-out-btn,.dl-delete-btn,.act-btn,.si,.hstat,.bf-capsule,.pulse-item,.dl-card,.arch-mini,.arch-card,.rec-item,.lk-card,.link-mini,.movie-mini,.mc';

  function attachRipples() {
    document.querySelectorAll(SELECTORS).forEach(el => {
      if (el.dataset.ripple) return;
      el.dataset.ripple = '1';
      if (!el.classList.contains('ripple-host')) el.classList.add('ripple-host');
      el.addEventListener('pointerdown', e => spawnRipple(el, e), { passive: true });
    });
  }

  attachRipples();
  new MutationObserver(attachRipples).observe(document.body, { childList: true, subtree: true });
})();


/* ══════════════════════════════════════════
   2. PARALLAX DEPTH
══════════════════════════════════════════ */
(function initParallax() {
  const style = document.createElement('style');
  style.textContent = `.parallax-card { transition: transform .12s ease, box-shadow .12s ease; will-change: transform; transform-style: preserve-3d; }`;
  document.head.appendChild(style);

  let tiltX = 0, tiltY = 0, targetX = 0, targetY = 0;
  const MAX = 6;

  if (window.DeviceMotionEvent) {
    window.addEventListener('deviceorientation', e => {
      targetX = Math.max(-MAX, Math.min(MAX, (e.gamma || 0) * 0.15));
      targetY = Math.max(-MAX, Math.min(MAX, (e.beta  || 0) * 0.08 - 2));
    }, { passive: true });
  }
  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    targetX = ((e.clientX - cx) / cx) * MAX * 0.5;
    targetY = -((e.clientY - cy) / cy) * MAX * 0.4;
  }, { passive: true });
  document.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; });

  function applyParallax() {
    tiltX += (targetX - tiltX) * 0.08;
    tiltY += (targetY - tiltY) * 0.08;
    document.querySelectorAll('.bf-capsule,.pulse-item,.dl-card,.hstat,.scard,.arch-card,.rec-item,.clock-card,.pass-card').forEach((card, i) => {
      const d = 0.3 + (i % 3) * 0.15;
      card.classList.add('parallax-card');
      card.style.transform = `perspective(900px) rotateY(${tiltX * d}deg) rotateX(${tiltY * d}deg) translateZ(${d * 4}px)`;
      const sh = Math.abs(tiltX) + Math.abs(tiltY);
      card.style.boxShadow = `${tiltX * 0.8}px ${tiltY * 0.8}px ${12 + sh * 2}px rgba(0,0,0,${0.06 + sh * 0.012})`;
    });
    requestAnimationFrame(applyParallax);
  }
  applyParallax();
})();


/* ══════════════════════════════════════════
   3. PAGE TRANSITIONS
══════════════════════════════════════════ */
(function initPageTransitions() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pgFilms  { 0%{clip-path:inset(0 100% 0 0);opacity:0} 60%{clip-path:inset(0 0% 0 0);opacity:1} 100%{clip-path:inset(0 0 0 0);opacity:1} }
    @keyframes pgBank   { 0%{transform:perspective(600px) rotateY(-25deg) scale(.92);opacity:0} 100%{transform:perspective(600px) rotateY(0) scale(1);opacity:1} }
    @keyframes pgLinks  { 0%{transform:translateY(28px) scale(.97);opacity:0;filter:blur(4px)} 100%{transform:translateY(0) scale(1);opacity:1;filter:blur(0)} }
    @keyframes pgHome   { 0%{transform:scale(.94);opacity:0} 100%{transform:scale(1);opacity:1} }
    @keyframes pgStats  { 0%{transform:translateX(-24px);opacity:0} 100%{transform:translateX(0);opacity:1} }
    @keyframes pgClock  { 0%{transform:rotate(-8deg) scale(.9);opacity:0} 60%{transform:rotate(2deg) scale(1.01);opacity:1} 100%{transform:rotate(0) scale(1);opacity:1} }
    @keyframes pgMore   { 0%{transform:scale(.88);opacity:0;filter:blur(6px)} 100%{transform:scale(1);opacity:1;filter:blur(0)} }
    @keyframes pgSub    { 0%{transform:translateX(18px);opacity:0} 100%{transform:translateX(0);opacity:1} }

    .pa-films  { animation: pgFilms  .42s cubic-bezier(.22,1,.36,1) both; }
    .pa-bank   { animation: pgBank   .4s  cubic-bezier(.34,1.4,.64,1) both; }
    .pa-links  { animation: pgLinks  .38s cubic-bezier(.22,1,.36,1) both; }
    .pa-home   { animation: pgHome   .35s cubic-bezier(.22,1,.36,1) both; }
    .pa-stats  { animation: pgStats  .38s cubic-bezier(.22,1,.36,1) both; }
    .pa-clock  { animation: pgClock  .5s  cubic-bezier(.34,1.3,.64,1) both; }
    .pa-more   { animation: pgMore   .4s  cubic-bezier(.22,1,.36,1) both; }
    .pa-sub    { animation: pgSub    .36s cubic-bezier(.22,1,.36,1) both; }
  `;
  document.head.appendChild(style);

  const MAP = { movies:'pa-films', bank:'pa-bank', links:'pa-links', home:'pa-home', stats:'pa-stats', clock:'pa-clock', more:'pa-more', archive:'pa-sub', pass:'pa-sub' };
  const ALL = Object.values(MAP);

  function animPage(p) {
    const page = document.getElementById('page-' + p);
    if (!page) return;
    const cls = MAP[p] || 'pa-home';
    page.classList.remove(...ALL);
    void page.offsetWidth;
    page.classList.add(cls);
  }

  const _navTo = window.navTo;
  window.navTo = function(btn) {
    _navTo && _navTo(btn);
    animPage(btn?.dataset?.page);
  };

  const _sub = window.openMoreSub;
  window.openMoreSub = function(which) {
    _sub && _sub(which);
    animPage(which);
  };
})();


/* ══════════════════════════════════════════
   4. INTERACTIVE CANVAS — pointer repel
══════════════════════════════════════════ */
(function initInteractiveCanvas() {
  let _pX = -9999, _pY = -9999, _pActive = false;

  function setup() {
    const pages = document.getElementById('pages') || document.body;
    pages.addEventListener('pointermove', e => { _pX = e.clientX; _pY = e.clientY; _pActive = true; }, { passive: true });
    pages.addEventListener('pointerleave', () => { _pActive = false; });
    pages.addEventListener('pointerup',    () => setTimeout(() => _pActive = false, 400));
    window._BG_POINTER = () => ({ x: _pX, y: _pY, active: _pActive });

    const overlay = document.createElement('canvas');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
    document.body.insertBefore(overlay, document.body.firstChild);

    const ctx = overlay.getContext('2d');
    let W = overlay.width = window.innerWidth;
    let H = overlay.height = window.innerHeight;
    window.addEventListener('resize', () => { W = overlay.width = window.innerWidth; H = overlay.height = window.innerHeight; });

    const N = 26;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
      r: 1.5 + Math.random() * 2.5,
      ph: Math.random() * Math.PI * 2,
      alpha: 0,
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const ptr = window._BG_POINTER ? window._BG_POINTER() : { x: -9999, y: -9999, active: false };

      pts.forEach(p => {
        p.ph += .012;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        if (ptr.active) {
          const dx = p.x - ptr.x, dy = p.y - ptr.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 115 && d > 1) {
            const f = (115 - d) / 115 * 0.9;
            p.vx += (dx / d) * f * 0.18; p.vy += (dy / d) * f * 0.18;
            p.alpha = Math.min(p.alpha + .04, .48);
          } else p.alpha = Math.max(p.alpha - .008, 0);
        } else p.alpha = Math.max(p.alpha - .005, 0);

        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 2.2) { p.vx = p.vx / spd * 2.2; p.vy = p.vy / spd * 2.2; }

        if (p.alpha > 0.01) {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(128,128,220,${p.alpha * (.7 + .3 * Math.sin(p.ph))})`;
          ctx.fill();
        }
      });

      if (ptr.active) {
        const g = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 58);
        g.addColorStop(0, 'rgba(180,160,255,.07)'); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ptr.x, ptr.y, 58, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  const cvs = document.getElementById('bgCanvas');
  cvs ? setup() : setTimeout(setup, 300);
})();


/* ══════════════════════════════════════════
   5. SCROLL REVEAL
══════════════════════════════════════════ */
(function initScrollReveal() {
  const style = document.createElement('style');
  style.textContent = `
    .sr-hidden  { opacity:0; transform:translateY(16px); transition:opacity .4s cubic-bezier(.22,1,.36,1),transform .4s cubic-bezier(.22,1,.36,1); }
    .sr-visible { opacity:1!important; transform:translateY(0)!important; }
  `;
  document.head.appendChild(style);

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('sr-visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });

  function observe() {
    const sel = '.bf-capsule,.pulse-item,.dl-card,.hstat,.arch-mini,.arch-card,.rec-item,.lk-card,.link-mini,.movie-mini,.mc,.pass-card,.scard,.si,.clock-card';
    document.querySelectorAll(sel).forEach(el => {
      if (el.dataset.srO) return;
      el.dataset.srO = '1'; el.classList.add('sr-hidden'); io.observe(el);
    });
  }

  observe();
  new MutationObserver(observe).observe(document.body, { childList: true, subtree: true });
})();
