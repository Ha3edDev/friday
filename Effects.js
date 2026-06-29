/* ══════════════════════════════════════════
   EFFECTS.JS — F.R.I.D.A.Y OS
   Ripple · Parallax · Page Transitions · Interactive Canvas
══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   1. RIPPLE EFFECT
══════════════════════════════════════════ */
function initRipple() {
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
      0%   { transform: scale(0); opacity: .45; }
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

  const SELECTORS = '.hbtn,.ni,.tbtn,.dl-add,.dl-save-btn,.lk-btn,.rfbtn,.back-btn,.cat-pill,.dl-out-btn,.dl-delete-btn,.act-btn,.si,.hstat,.bf-capsule,.pulse-item,.dl-card,.arch-mini,.arch-card,.rec-item,.lk-card,.link-mini,.movie-mini,.mc';

  function attachRipples() {
    document.querySelectorAll(SELECTORS).forEach(el => {
      if (el.dataset.ripple) return;
      el.dataset.ripple = '1';
      if (!el.classList.contains('ripple-host')) el.classList.add('ripple-host');
      el.addEventListener('pointerdown', e => spawnRipple(el, e), { passive: true });
    });
  }

  // Run now + observe DOM changes
  attachRipples();
  new MutationObserver(attachRipples).observe(document.body, { childList: true, subtree: true });
})();


/* ══════════════════════════════════════════
   2. PARALLAX DEPTH (DeviceMotion + scroll)
══════════════════════════════════════════ */
function initParallax() {
  const style = document.createElement('style');
  style.textContent = `
    .parallax-card {
      transition: transform .12s ease, box-shadow .12s ease;
      will-change: transform;
      transform-style: preserve-3d;
    }
  `;
  document.head.appendChild(style);

  let tiltX = 0, tiltY = 0, targetX = 0, targetY = 0;
  const MAX_TILT = 6;

  if (window.DeviceMotionEvent) {
    window.addEventListener('deviceorientation', e => {
      targetX = Math.max(-MAX_TILT, Math.min(MAX_TILT, (e.gamma || 0) * 0.15));
      targetY = Math.max(-MAX_TILT, Math.min(MAX_TILT, (e.beta  || 0) * 0.08 - 2));
    }, { passive: true });
  }

  // Mouse fallback for desktop
  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    targetX = ((e.clientX - cx) / cx) * MAX_TILT * 0.5;
    targetY = -((e.clientY - cy) / cy) * MAX_TILT * 0.4;
  }, { passive: true });

  function PARALLAX_SELECTORS() {
    return document.querySelectorAll('.bf-capsule,.pulse-item,.dl-card,.hstat,.scard,.arch-card,.rec-item,.clock-card,.pass-card');
  }

  function applyParallax() {
    const cards = PARALLAX_SELECTORS();
    tiltX += (targetX - tiltX) * 0.08;
    tiltY += (targetY - tiltY) * 0.08;
    cards.forEach((card, i) => {
      const depth = 0.3 + (i % 3) * 0.15;
      const tx = tiltX * depth, ty = tiltY * depth;
      card.classList.add('parallax-card');
      card.style.transform = `perspective(900px) rotateY(${tx}deg) rotateX(${ty}deg) translateZ(${depth * 4}px)`;
      const sh = Math.abs(tx) + Math.abs(ty);
      card.style.boxShadow = `${tx * 0.8}px ${ty * 0.8}px ${12 + sh * 2}px rgba(0,0,0,${0.06 + sh * 0.012})`;
    });
    requestAnimationFrame(applyParallax);
  }
  applyParallax();

  // Reset on leave
  document.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; });
})();


/* ══════════════════════════════════════════
   3. PAGE TRANSITIONS — شخصیت‌دار
══════════════════════════════════════════ */
(function initPageTransitions() {
  const style = document.createElement('style');
  style.textContent = `
    /* FILMS — پرده سینما */
    @keyframes pgFilms {
      0%   { clip-path: inset(0 100% 0 0); opacity: 0; }
      60%  { clip-path: inset(0 0% 0 0);   opacity: 1; }
      100% { clip-path: inset(0 0 0 0);    opacity: 1; }
    }
    /* BANK — کارت می‌چرخه */
    @keyframes pgBank {
      0%   { transform: perspective(600px) rotateY(-25deg) scale(.92); opacity: 0; }
      100% { transform: perspective(600px) rotateY(0deg)   scale(1);   opacity: 1; }
    }
    /* LINKS — slide از پایین */
    @keyframes pgLinks {
      0%   { transform: translateY(28px) scale(.97); opacity: 0; filter: blur(4px); }
      100% { transform: translateY(0)    scale(1);   opacity: 1; filter: blur(0); }
    }
    /* HOME — fade + scale */
    @keyframes pgHome {
      0%   { transform: scale(.94); opacity: 0; }
      100% { transform: scale(1);   opacity: 1; }
    }
    /* STATS — از چپ */
    @keyframes pgStats {
      0%   { transform: translateX(-24px); opacity: 0; }
      100% { transform: translateX(0);     opacity: 1; }
    }
    /* CLOCK — rotate globe */
    @keyframes pgClock {
      0%   { transform: rotate(-8deg) scale(.9); opacity: 0; }
      60%  { transform: rotate(2deg)  scale(1.01); opacity: 1; }
      100% { transform: rotate(0deg)  scale(1);   opacity: 1; }
    }
    /* MORE — reveal از مرکز */
    @keyframes pgMore {
      0%   { transform: scale(.88); opacity: 0; filter: blur(6px); }
      100% { transform: scale(1);   opacity: 1; filter: blur(0); }
    }
    /* ARCHIVE / PASS */
    @keyframes pgSub {
      0%   { transform: translateX(18px); opacity: 0; }
      100% { transform: translateX(0);    opacity: 1; }
    }

    .page-anim-films  { animation: pgFilms .42s cubic-bezier(.22,1,.36,1) both; }
    .page-anim-bank   { animation: pgBank  .4s  cubic-bezier(.34,1.4,.64,1) both; }
    .page-anim-links  { animation: pgLinks .38s cubic-bezier(.22,1,.36,1) both; }
    .page-anim-home   { animation: pgHome  .35s cubic-bezier(.22,1,.36,1) both; }
    .page-anim-stats  { animation: pgStats .38s cubic-bezier(.22,1,.36,1) both; }
    .page-anim-clock  { animation: pgClock .5s  cubic-bezier(.34,1.3,.64,1) both; }
    .page-anim-more   { animation: pgMore  .4s  cubic-bezier(.22,1,.36,1) both; }
    .page-anim-sub    { animation: pgSub   .36s cubic-bezier(.22,1,.36,1) both; }
  `;
  document.head.appendChild(style);

  const PAGE_ANIM = {
    movies:  'page-anim-films',
    bank:    'page-anim-bank',
    links:   'page-anim-links',
    home:    'page-anim-home',
    stats:   'page-anim-stats',
    clock:   'page-anim-clock',
    more:    'page-anim-more',
    archive: 'page-anim-sub',
    pass:    'page-anim-sub',
  };

  // Override the existing navTo behaviour to inject animation class
  const _origNavTo = window.navTo;
  window.navTo = function(btn) {
    const p = btn?.dataset?.page;
    _origNavTo && _origNavTo(btn);
    if (!p) return;
    const page = document.getElementById('page-' + p);
    if (!page) return;
    const cls = PAGE_ANIM[p] || 'page-anim-home';
    page.classList.remove(...Object.values(PAGE_ANIM));
    void page.offsetWidth; // reflow
    page.classList.add(cls);
  };

  // Also hook openMoreSub
  const _origSub = window.openMoreSub;
  window.openMoreSub = function(which) {
    _origSub && _origSub(which);
    const page = document.getElementById('page-' + which);
    if (!page) return;
    const cls = PAGE_ANIM[which] || 'page-anim-sub';
    page.classList.remove(...Object.values(PAGE_ANIM));
    void page.offsetWidth;
    page.classList.add(cls);
  };
})();


/* ══════════════════════════════════════════
   4. INTERACTIVE CANVAS — واکنش به لمس
══════════════════════════════════════════ */
(function initInteractiveCanvas() {
  // We'll extend the BG engine after it's initialised
  // Hook into BG init and inject pointer tracking
  let _pointerX = -9999, _pointerY = -9999, _pointerActive = false;

  function trackPointer() {
    const cvs = document.getElementById('bgCanvas');
    if (!cvs) { setTimeout(trackPointer, 300); return; }

    cvs.style.pointerEvents = 'none'; // keep pass-through

    // Track on the pages container instead
    const pages = document.getElementById('pages') || document.body;

    pages.addEventListener('pointermove', e => {
      _pointerX = e.clientX; _pointerY = e.clientY; _pointerActive = true;
    }, { passive: true });
    pages.addEventListener('pointerleave', () => { _pointerActive = false; });
    pages.addEventListener('pointerup',    () => { setTimeout(() => _pointerActive = false, 400); });

    // Expose so BG engine can read
    window._BG_POINTER = () => ({ x: _pointerX, y: _pointerY, active: _pointerActive });
  }

  // Inject pointer influence into BG particle draw
  // We do this by patching the BG object once it exists
  function patchBG() {
    if (!window.BG) { setTimeout(patchBG, 200); return; }
    trackPointer();

    // Store original setStyle reference
    const _origSetStyle = window.BG.setStyle.bind(window.BG);

    // Monkey-patch: we inject a "pointer repel" layer on top of any bg style
    // by overriding requestAnimationFrame at canvas level — but that's too invasive.
    // Instead, we draw a lightweight overlay canvas on top.
    injectInteractionOverlay();
  }

  function injectInteractionOverlay() {
    const overlay = document.createElement('canvas');
    overlay.id = 'bgInteractOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
    document.body.insertBefore(overlay, document.body.firstChild);

    const ctx = overlay.getContext('2d');
    let W = overlay.width  = window.innerWidth;
    let H = overlay.height = window.innerHeight;
    window.addEventListener('resize', () => {
      W = overlay.width  = window.innerWidth;
      H = overlay.height = window.innerHeight;
    });

    // Interaction particles — attracted/repelled by pointer
    const N = 28;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
      r: 1.5 + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
      alpha: 0,
    }));

    // Ripple bursts from tap
    const bursts = [];
    document.addEventListener('pointerdown', e => {
      bursts.push({ x: e.clientX, y: e.clientY, r: 0, maxR: 80, alpha: .3 });
    }, { passive: true });

    function draw() {
      ctx.clearRect(0, 0, W, H);

      const ptr = window._BG_POINTER ? window._BG_POINTER() : { x: -9999, y: -9999, active: false };
      const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#888';

      // Draw bursts
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.r += 3.5; b.alpha -= 0.012;
        if (b.alpha <= 0) { bursts.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = accent.replace(')', `,${b.alpha})`).replace('rgb(', 'rgba(') || `rgba(128,128,200,${b.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Draw interaction particles
      pts.forEach(p => {
        p.phase += .012;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        if (ptr.active) {
          const dx = p.x - ptr.x, dy = p.y - ptr.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120 && d > 1) {
            const force = (120 - d) / 120 * 0.9;
            p.vx += (dx / d) * force * 0.18;
            p.vy += (dy / d) * force * 0.18;
            p.alpha = Math.min(p.alpha + .04, .5);
          } else {
            p.alpha = Math.max(p.alpha - .008, 0);
          }
        } else {
          p.alpha = Math.max(p.alpha - .005, 0);
        }

        // Speed limit
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 2.2) { p.vx = (p.vx / spd) * 2.2; p.vy = (p.vy / spd) * 2.2; }

        if (p.alpha > 0.01) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(128,128,220,${p.alpha * (.7 + .3 * Math.sin(p.phase))})`;
          ctx.fill();
        }
      });

      // Pointer glow
      if (ptr.active) {
        const g = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 60);
        g.addColorStop(0, 'rgba(180,160,255,.07)');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ptr.x, ptr.y, 60, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  patchBG();
})();


/* ══════════════════════════════════════════
   5. THEME MORPH — ripple از نقطه کلیک
══════════════════════════════════════════ */
(function initThemeMorph() {
  const style = document.createElement('style');
  style.textContent = `
    #themeMorphCanvas {
      position: fixed; inset: 0; z-index: 9990;
      pointer-events: none; opacity: 0;
    }
  `;
  document.head.appendChild(style);

  const cvs = document.createElement('canvas');
  cvs.id = 'themeMorphCanvas';
  document.body.appendChild(cvs);

  const ctx = cvs.getContext('2d');
  let W = cvs.width  = window.innerWidth;
  let H = cvs.height = window.innerHeight;
  window.addEventListener('resize', () => {
    W = cvs.width  = window.innerWidth;
    H = cvs.height = window.innerHeight;
  });

  window.THEME_MORPH_TRIGGER = function(x, y, color) {
    cvs.style.opacity = '1';
    const maxR = Math.sqrt(Math.pow(Math.max(x, W - x), 2) + Math.pow(Math.max(y, H - y), 2)) + 20;
    let r = 0, done = false;

    function draw() {
      if (done) return;
      r += maxR / 22;
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color || 'rgba(128,128,200,.18)';
      ctx.fill();
      if (r >= maxR) {
        done = true;
        cvs.style.transition = 'opacity .3s';
        cvs.style.opacity = '0';
        setTimeout(() => { cvs.style.transition = ''; ctx.clearRect(0, 0, W, H); }, 350);
        return;
      }
      requestAnimationFrame(draw);
    }
    draw();
  };

  // Hook into setTheme
  const _origSetTheme = window.setTheme;
  window.setTheme = function(t, el) {
    const rect = el ? el.getBoundingClientRect() : null;
    const x = rect ? rect.left + rect.width / 2  : W / 2;
    const y = rect ? rect.top  + rect.height / 2 : H / 2;
    const col = getComputedStyle(document.body).getPropertyValue('--accent').trim();
    window.THEME_MORPH_TRIGGER(x, y, col + '22');
    setTimeout(() => _origSetTheme && _origSetTheme(t, el), 80);
  };
})();


/* ══════════════════════════════════════════
   6. SCROLL REVEAL — ورود کارت‌ها با اسکرول
══════════════════════════════════════════ */
(function initScrollReveal() {
  const style = document.createElement('style');
  style.textContent = `
    .sr-hidden { opacity: 0; transform: translateY(16px); transition: opacity .4s cubic-bezier(.22,1,.36,1), transform .4s cubic-bezier(.22,1,.36,1); }
    .sr-visible { opacity: 1 !important; transform: translateY(0) !important; }
  `;
  document.head.appendChild(style);

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('sr-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  function observeNew() {
    const sel = '.bf-capsule,.pulse-item,.dl-card,.hstat,.arch-mini,.arch-card,.rec-item,.lk-card,.link-mini,.movie-mini,.mc,.pass-card,.scard,.si,.clock-card';
    document.querySelectorAll(sel).forEach(el => {
      if (el.dataset.srObserved) return;
      el.dataset.srObserved = '1';
      el.classList.add('sr-hidden');
      io.observe(el);
    });
  }

  observeNew();
  new MutationObserver(observeNew).observe(document.body, { childList: true, subtree: true });
})();
