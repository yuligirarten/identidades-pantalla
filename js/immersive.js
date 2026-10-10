(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CAPA INMERSIVA (dirección visual v2)
     No toca datos ni rutas: escucha la navegación por hash del router
     y añade movimiento encima.
       · body[data-chapter] → color de fondo del capítulo
       · cortina entre capítulos con número y título
       · número gigante de fondo + contador [ 02 / 06 ]
       · aparición al hacer scroll (.rv) y lectura palabra por palabra (.wr)
       · portada con tarjetas flotantes que siguen al cursor
  ------------------------------------------------------------------ */

  const MODULES = ['p00', 'p01', 'p02', 'p03', 'p04', 'p05', 'p06'];
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const THEME_COLOR = { p00: '#0e0d0c', p01: '#f3f2e9', p02: '#f3f2e9', p03: '#0f8a5f', p04: '#0e0d0c', p05: '#e8d2f5', p06: '#0e0d0c' };

  if (!REDUCED) document.documentElement.classList.add('imm');

  function currentId() {
    const h = (location.hash || '').replace('#', '').toLowerCase();
    return MODULES.indexOf(h) !== -1 ? h : 'p00';
  }
  const pad = n => String(n).padStart(2, '0');

  /* ---------- elementos fijos: progreso, contador, cortina ---------- */
  const progress = document.createElement('div');
  progress.className = 'journey-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  const counter = document.createElement('span');
  counter.className = 'chapter-counter';
  counter.setAttribute('aria-hidden', 'true');
  const header = document.querySelector('.site-header');
  if (header) header.appendChild(counter);

  const curtain = document.createElement('div');
  curtain.className = 'chapter-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = '<p class="cc-num"></p><p class="cc-title"></p>';
  document.body.appendChild(curtain);

  function chapterTitle(id) {
    const h = document.querySelector('#' + id + ' h1');
    return h ? h.textContent.trim() : '';
  }

  /* ---------- cortina ---------- */
  let busy = false;
  function playCurtain(toId) {
    return new Promise(resolve => {
      const sec = document.getElementById(toId);
      const cls = Array.from(sec ? sec.classList : []).find(c => c.indexOf('module-p') === 0);
      curtain.className = 'chapter-curtain ' + (cls || '');
      curtain.querySelector('.cc-num').textContent = '[ ' + pad(MODULES.indexOf(toId)) + ' / 06 ]';
      curtain.querySelector('.cc-title').textContent = chapterTitle(toId);
      void curtain.offsetWidth;
      curtain.classList.add('is-in');
      setTimeout(resolve, 540);
    });
  }
  function releaseCurtain() {
    curtain.classList.remove('is-in');
    curtain.classList.add('is-out');
    setTimeout(() => { curtain.className = 'chapter-curtain'; busy = false; }, 660);
  }

  // Intercepta los enlaces internos para cubrir el cambio con la cortina.
  document.addEventListener('click', e => {
    if (REDUCED || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
    const a = e.target.closest('a[href^="#p0"]');
    if (!a) return;
    const to = a.getAttribute('href').slice(1);
    if (MODULES.indexOf(to) === -1 || to === currentId() || busy) return;
    e.preventDefault();
    busy = true;
    playCurtain(to).then(() => {
      location.hash = to;
      setTimeout(releaseCurtain, 120);
    });
  });

  /* ---------- al cambiar de capítulo ---------- */
  function onChapter() {
    const id = currentId();
    const idx = MODULES.indexOf(id);
    document.body.setAttribute('data-chapter', id);
    counter.textContent = '[ ' + pad(idx) + ' / 06 ]';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLOR[id]);

    enhance(id);
  }

  /* ---------- realce de un capítulo ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;

  const REVEAL = [
    '.module-inner > *:not(.module-title):not(.module-header):not(.chapter-num)',
    '.destacado-card', '.gallery-card', '.stat-card', '.ig-post', '.p02-foto',
    '.flow-node', '.q-card', '.info-block'
  ].join(',');
  const READ = [
    '.p01-guion-text p', '.p02-intro > p', '.p03-text p', '.destacado-card .quote', '.p03-hero-card .hero-quote'
  ].join(',');

  function enhance(id) {
    const sec = document.getElementById(id);
    if (!sec) return;

    // número de fondo
    const inner = sec.querySelector('.module-inner');
    if (inner && id !== 'p00' && !sec.querySelector('.chapter-num')) {
      const n = document.createElement('span');
      n.className = 'chapter-num';
      n.setAttribute('aria-hidden', 'true');
      n.textContent = pad(MODULES.indexOf(id));
      sec.insertBefore(n, sec.firstChild);
    }

    if (id === 'p00') { buildCover(sec); return; } // la portada tiene su propia entrada (CSS)
    if (REDUCED) return;

    // lectura palabra por palabra
    sec.querySelectorAll(READ).forEach(splitWords);

    // aparición al hacer scroll (escalonada entre hermanos)
    sec.querySelectorAll(REVEAL).forEach(el => {
      if (el.classList.contains('rv') || el.closest('.cover-cloud')) return;
      el.classList.add('rv');
      const sibs = Array.from(el.parentElement.children).filter(c => c.classList.contains('rv'));
      el.style.setProperty('--rv-d', Math.min(sibs.indexOf(el), 4) * 90 + 'ms');
      if (io) io.observe(el); else el.classList.add('in');
    });
    onScroll();
  }

  // Envuelve cada palabra en <span class="w"> sin romper el marcado interno.
  function splitWords(el) {
    if (el.classList.contains('wr')) return;
    el.classList.add('wr');
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const parts = node.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach(p => {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        const s = document.createElement('span');
        s.className = 'w';
        s.textContent = p;
        frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  /* ---------- scroll: progreso, palabras, parallax del número ---------- */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const id = currentId();
      const idx = MODULES.indexOf(id);
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const within = Math.min(1, scrollY / max);
      progress.style.transform = 'scaleX(' + ((idx + within) / MODULES.length).toFixed(4) + ')';

      const sec = document.getElementById(id);
      if (!sec || REDUCED) return;
      const vh = innerHeight;
      sec.querySelectorAll('.wr').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (vh * 0.88 - r.top) / (r.height + vh * 0.3);
        const words = el.querySelectorAll('.w');
        const lit = Math.round(Math.max(0, Math.min(1, p)) * words.length);
        words.forEach((w, i) => w.classList.toggle('on', i < lit));
      });
      const num = sec.querySelector('.chapter-num');
      if (num) num.style.transform = 'translateY(' + (scrollY * 0.25).toFixed(1) + 'px)';
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- portada: nube de tarjetas ---------- */
  // Microcopia de la interfaz: alude a la actuación del yo sin atribuir
  // nada a participantes reales.
  const CARDS = [
    { t: 'photo', src: 'img/p01-curado.jpg', x: 6, y: 16, w: 190, rz: -8, ry: 14, d: 0.1 },
    { t: 'note', k: 'Borrador', txt: 'Guardado hace 3 semanas. Sin publicar.', x: 74, y: 12, w: 210, rz: 6, ry: -16, d: 0.25, c: 'is-lilac' },
    { t: 'photo', src: 'img/p02-espejo.jpg', x: 80, y: 56, w: 170, rz: 9, ry: -20, d: 0.4 },
    { t: 'note', k: 'Editar', txt: '¿Quitar la foto del perfil?', x: 3, y: 64, w: 200, rz: -5, ry: 18, d: 0.55, c: 'is-emerald', sec: true },
    { t: 'photo', src: 'img/p01-cotidiano.jpg', x: 18, y: 72, w: 150, rz: 4, ry: 10, d: 0.7, o: 0.85, sec: true },
    { t: 'tile', x: 66, y: 78, w: 92, rz: -10, ry: -8, d: 0.8, t1: '#0f8a5f', t2: '#e8d2f5', sec: true },
    { t: 'note', k: 'Visto por', txt: '1 204 cuentas que no te siguen', x: 58, y: 4, w: 180, rz: -4, ry: -10, d: 0.9, o: 0.9, sec: true },
    { t: 'tile', x: 26, y: 6, w: 76, rz: 12, ry: 14, d: 1.0, t1: '#f3f2e9', t2: '#1c1b17', sec: true },
    { t: 'photo', src: 'img/p02-vitrina.jpg', x: 86, y: 30, w: 130, rz: -6, ry: -22, d: 1.1, o: 0.8, sec: true }
  ];

  let coverBuilt = false;
  function buildCover(sec) {
    if (coverBuilt) return;
    coverBuilt = true;

    // Énfasis tipográfico en la pregunta detonante
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
        'deg;--d:' + c.d + 's;--o:' + (c.o || 1) + ';--f:' + (6 + (c.d * 3)).toFixed(1) + 's';
      card.dataset.depth = (0.4 + Math.abs(c.ry) / 30).toFixed(2);
      let inner = '';
      if (c.t === 'photo') {
        inner = '<div class="cover-card-inner cc-photo"><div class="cc-bar"><span class="cc-dot"></span><span class="cc-line"></span></div>' +
          '<img src="' + c.src + '" alt="" loading="eager"></div>';
      } else if (c.t === 'note') {
        inner = '<div class="cover-card-inner cc-note ' + (c.c || '') + '"><p class="cc-kicker">' + c.k + '</p><p class="cc-text">' + c.txt + '</p></div>';
      } else {
        inner = '<div class="cover-card-inner cc-tile" style="--t1:' + c.t1 + ';--t2:' + c.t2 + '"></div>';
      }
      card.innerHTML = inner;
      cloud.appendChild(card);
    });
    sec.insertBefore(cloud, sec.firstChild);

    if (REDUCED) return;
    // Parallax suave con el cursor
    let mx = 0, my = 0, raf = 0;
    sec.addEventListener('pointermove', e => {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        cloud.querySelectorAll('.cover-card').forEach(card => {
          const k = parseFloat(card.dataset.depth) * 28;
          card.style.transform = 'translate3d(' + (mx * -k).toFixed(1) + 'px,' + (my * -k).toFixed(1) + 'px,0)';
        });
      });
    });
  }

  // El router avisa cuando el capítulo ya tiene su contenido inyectado.
  document.addEventListener('iep:chapter', onChapter);
})();
