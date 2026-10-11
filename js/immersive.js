(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CAPA INMERSIVA (dirección visual v2)
     No toca datos ni rutas: escucha el aviso 'iep:chapter' del router.
       · body[data-chapter] → color de fondo del capítulo
       · número gigante de fondo + contador [ 02 / 06 ]
       · aparición suave al hacer scroll (.rv)
       · portada con pocas tarjetas flotantes que siguen al cursor
  ------------------------------------------------------------------ */

  const MODULES = ['p00', 'p01', 'p02', 'p03', 'p04', 'p05', 'p06'];
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const THEME_COLOR = { p00: '#0e0d0c', p01: '#f3f2e9', p02: '#f3f2e9', p03: '#0f8a5f', p04: '#0e0d0c', p05: '#e8d2f5', p06: '#0e0d0c' };

  if (!REDUCED) document.documentElement.classList.add('imm');

  const pad = n => String(n).padStart(2, '0');

  /* ---------- elementos fijos: progreso y contador ---------- */
  const progress = document.createElement('div');
  progress.className = 'journey-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  const counter = document.createElement('span');
  counter.className = 'chapter-counter';
  counter.setAttribute('aria-hidden', 'true');
  const header = document.querySelector('.site-header');
  if (header) header.appendChild(counter);

  let current = 'p00';

  function onChapter(ev) {
    current = ev.detail;
    const idx = MODULES.indexOf(current);
    document.body.setAttribute('data-chapter', current);
    counter.textContent = '[ ' + pad(idx) + ' / 06 ]';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLOR[current]);
    enhance(current);
  }

  /* ---------- realce de un capítulo ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 }) : null;

  const REVEAL = [
    '.destacado-card', '.gallery-card', '.stat-card', '.ig-post', '.p02-foto',
    '.flow-node', '.closing-item', '.p03-hero-card', '.viz-flow', '.p02-viz'
  ].join(',');

  function enhance(id) {
    const sec = document.getElementById(id);
    if (!sec) return;

    if (id !== 'p00' && !sec.querySelector('.chapter-num')) {
      const n = document.createElement('span');
      n.className = 'chapter-num';
      n.setAttribute('aria-hidden', 'true');
      n.textContent = pad(MODULES.indexOf(id));
      sec.insertBefore(n, sec.firstChild);
    }

    if (id === 'p00') { buildCover(sec); return; }
    if (REDUCED) return;

    // Aparición suave solo en bloques de contenido (no en texto corrido)
    sec.querySelectorAll(REVEAL).forEach(el => {
      if (el.classList.contains('rv')) return;
      el.classList.add('rv');
      const sibs = Array.from(el.parentElement.children).filter(c => c.classList.contains('rv'));
      el.style.setProperty('--rv-d', Math.min(sibs.indexOf(el), 4) * 80 + 'ms');
      if (io) io.observe(el); else el.classList.add('in');
    });
    onScroll();
  }

  /* ---------- scroll: barra de progreso y parallax del número ---------- */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const idx = MODULES.indexOf(current);
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const within = Math.min(1, scrollY / max);
      progress.style.transform = 'scaleX(' + ((idx + within) / MODULES.length).toFixed(4) + ')';
      if (REDUCED) return;
      const num = document.querySelector('#' + current + ' .chapter-num');
      if (num) num.style.transform = 'translateY(' + (scrollY * 0.2).toFixed(1) + 'px)';
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- portada: pocas tarjetas, en los márgenes ---------- */
  // Microcopia de la interfaz: alude a la actuación del yo sin atribuir
  // nada a participantes reales.
  const CARDS = [
    { t: 'photo', src: 'img/p01-curado.jpg', x: 5, y: 22, w: 170, rz: -7, ry: 14, d: 0.15 },
    { t: 'note', k: 'Borrador', txt: 'Guardado hace 3 semanas. Sin publicar.', x: 80, y: 20, w: 190, rz: 5, ry: -14, d: 0.3, c: 'is-lilac' },
    { t: 'note', k: 'Editar perfil', txt: '¿Quitar esta foto?', x: 6, y: 64, w: 170, rz: 4, ry: 12, d: 0.45, c: 'is-emerald', sec: true },
    { t: 'photo', src: 'img/p01-cotidiano.jpg', x: 82, y: 58, w: 150, rz: 6, ry: -16, d: 0.6, sec: true }
  ];

  let coverBuilt = false;
  function buildCover(sec) {
    if (coverBuilt) return;
    coverBuilt = true;

    const q = sec.querySelector('.display-question');
    if (q && !q.querySelector('em')) q.innerHTML = q.innerHTML.replace('publicas?', '<em>publicas?</em>');

    const cloud = document.createElement('div');
    cloud.className = 'cover-cloud';
    cloud.setAttribute('aria-hidden', 'true');
    CARDS.forEach(c => {
      const card = document.createElement('div');
      card.className = 'cover-card' + (c.sec ? ' is-secondary' : '');
      card.style.cssText =
        'left:' + c.x + '%;top:' + c.y + '%;--w:' + c.w + 'px;--rz:' + c.rz + 'deg;--ry:' + c.ry +
        'deg;--d:' + c.d + 's;--f:' + (6 + c.d * 3).toFixed(1) + 's';
      card.dataset.depth = (0.4 + Math.abs(c.ry) / 30).toFixed(2);
      card.innerHTML = c.t === 'photo'
        ? '<div class="cover-card-inner cc-photo"><div class="cc-bar"><span class="cc-dot"></span><span class="cc-line"></span></div>' +
          '<img src="' + c.src + '" alt=""></div>'
        : '<div class="cover-card-inner cc-note ' + (c.c || '') + '"><p class="cc-kicker">' + c.k + '</p><p class="cc-text">' + c.txt + '</p></div>';
      cloud.appendChild(card);
    });
    sec.insertBefore(cloud, sec.firstChild);

    if (REDUCED) return;
    let mx = 0, my = 0, raf = 0;
    sec.addEventListener('pointermove', e => {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        cloud.querySelectorAll('.cover-card').forEach(card => {
          const k = parseFloat(card.dataset.depth) * 22;
          card.style.transform = 'translate3d(' + (mx * -k).toFixed(1) + 'px,' + (my * -k).toFixed(1) + 'px,0)';
        });
      });
    });
  }

  // El router avisa cuando el capítulo ya tiene su contenido inyectado.
  document.addEventListener('iep:chapter', onChapter);
})();
