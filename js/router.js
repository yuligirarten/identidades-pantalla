(function () {
  'use strict';

  const MODULES = ['p00', 'p01', 'p02', 'p03', 'p04', 'p05', 'p06'];
  const initFns = Object.create(null);

  function registerInit(id, fn) {
    if (MODULES.indexOf(id) === -1) return;
    initFns[id] = fn;
  }

  function resolveActiveId() {
    const hash = (location.hash || '').replace('#', '').toLowerCase();
    return MODULES.indexOf(hash) !== -1 ? hash : 'p00';
  }

  function setActive(id) {
    MODULES.forEach(m => {
      const el = document.getElementById(m);
      if (!el) return;
      el.classList.toggle('is-active', m === id);
    });

    document.querySelectorAll('.nav-steps a').forEach(a => {
      const step = a.getAttribute('data-step');
      if (step === id) a.setAttribute('aria-current', 'step');
      else a.removeAttribute('aria-current');
    });

    const active = document.getElementById(id);
    if (active) {
      const heading = active.querySelector('h1');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        try { heading.focus({ preventScroll: true }); } catch (e) { heading.focus(); }
      }
    }

    window.scrollTo({ top: 0, behavior: 'auto' });

    const fn = initFns[id];
    if (typeof fn === 'function') {
      try { fn(); } catch (e) { console.error('[router] init error for ' + id, e); }
    }
  }

  function showBootError(err) {
    const main = document.getElementById('main');
    if (!main) return;
    main.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'boot-error';
    const msg = err && err.message ? err.message : String(err);
    box.innerHTML =
      '<h2>No se pudieron cargar los datos</h2>' +
      '<p>El navegador bloqueó la lectura de <code>data/data.json</code>.</p>' +
      '<p>Esto suele ocurrir cuando abres <code>index.html</code> haciendo doble-click (protocolo <code>file://</code>). Necesitas servir el proyecto desde un servidor local.</p>' +
      '<p>Desde la carpeta del proyecto, ejecuta:</p>' +
      '<p><code>python3 -m http.server 8000</code></p>' +
      '<p>Y abre <code>http://localhost:8000</code> en el navegador.</p>' +
      '<p class="detail">Detalle técnico: ' + msg + '</p>';
    main.appendChild(box);
  }

  function onHashChange() {
    setActive(resolveActiveId());
  }

  async function boot() {
    try {
      await window.IEP.data.load();
    } catch (err) {
      showBootError(err);
      return;
    }
    window.addEventListener('hashchange', onHashChange);
    if (!location.hash) {
      history.replaceState(null, '', '#p00');
    }
    onHashChange();
  }

  window.IEP = window.IEP || {};
  window.IEP.router = { registerInit, MODULES: MODULES.slice() };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
