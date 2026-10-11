(function () {
  'use strict';

  /* ------------------------------------------------------------------
     P06 — Detrás de la pantalla
     Abre y cierra el <dialog> de referencias (APA 7). El marcado vive
     en index.html; aquí solo se enlazan los eventos, una sola vez.
  ------------------------------------------------------------------ */

  function init() {
    var btn = document.getElementById('p06-refs-open');
    var dialog = document.getElementById('p06-refs');
    if (!btn || !dialog || dialog.dataset.bound) return;
    dialog.dataset.bound = '1';

    btn.addEventListener('click', function () {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    });

    dialog.addEventListener('click', function (e) {
      /* Clic fuera de la caja (sobre el backdrop) o en el botón de cerrar */
      if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
    });

    dialog.addEventListener('close', function () { btn.focus(); });
  }

  window.IEP.router.registerInit('p06', init);
})();
