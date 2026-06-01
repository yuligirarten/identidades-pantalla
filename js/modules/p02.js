(function () {
  'use strict';

  function escape(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }

  function formatEje(v) {
    if (v == null) return '';
    return v > 0 ? '+' + v.toFixed(1) : v.toFixed(1);
  }

  function renderCard(t) {
    const isEspejo = t.eje_vitrina_espejo < 0;
    const label = isEspejo ? 'Espejo' : 'Vitrina';
    const cls = isEspejo ? 'is-espejo' : 'is-vitrina';
    return (
      '<article class="destacado-card">' +
        '<p class="eje-label ' + cls + '">' +
          label +
          '<span class="eje-value">eje ' + formatEje(t.eje_vitrina_espejo) + '</span>' +
        '</p>' +
        '<blockquote class="quote">' + escape(t.cita_corta) + '</blockquote>' +
        '<p class="full-quote">' + escape(t.cita) + '</p>' +
        '<p class="attribution">' +
          '<span class="id">' + escape(t.id) + '</span> · ' + escape(t.tema) +
          '<span class="perfil-text">' + escape(t.perfil) + '</span>' +
        '</p>' +
      '</article>'
    );
  }

  function init() {
    const wrap = document.getElementById('p02-destacados');
    if (!wrap || wrap.dataset.rendered) return;

    const items = window.IEP.data.getDestacados('P02');
    if (!items.length) return;

    items.sort((a, b) => (a.eje_vitrina_espejo || 0) - (b.eje_vitrina_espejo || 0));

    wrap.innerHTML = items.map(renderCard).join('');
    wrap.dataset.rendered = '1';
  }

  window.IEP.router.registerInit('p02', init);
})();
