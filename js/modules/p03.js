(function () {
  'use strict';

  function escape(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }

  /* ------------------------------------------------------------------
     DATOS AGREGADOS (anclaje estadístico de P03)

     Los tres campos booleanos describen el USO PERSONAL de Instagram.
     T02 y T04 los traen como null (perfiles profesionales), así que al
     contar solo los valores no-null quedan excluidos automáticamente
     —sin hardcodear ids—. abstencion y se_autocensura se codifican de
     forma independiente (ver nota_codificacion en data.json).

     denominador = testimonios donde el campo aplica (valor true/false)
     numerador   = testimonios con el campo en true
  ------------------------------------------------------------------ */
  const STATS = [
    {
      campo: 'reconoce_algoritmo',
      titulo: 'reconoce el algoritmo',
      nota: 'Nombran o describen el algoritmo de forma explícita en su uso personal.'
    },
    {
      campo: 'se_autocensura',
      titulo: 'se autocensura',
      nota: 'Modifican o retienen contenido específico por presión externa o interna.'
    },
    {
      campo: 'abstencion',
      titulo: 'se abstiene de publicar',
      nota: 'Retienen por completo lo que publican como forma deliberada de control sobre su imagen.'
    }
  ];

  function computeStat(items, campo) {
    let aplican = 0;
    let positivos = 0;
    items.forEach(t => {
      const v = t[campo];
      if (v === null || typeof v === 'undefined') return; // no aplica → excluido
      aplican++;
      if (v === true) positivos++;
    });
    const pct = aplican ? Math.round((positivos / aplican) * 100) : 0;
    return { aplican, positivos, pct };
  }

  function renderStats(root, items) {
    const wrap = root.querySelector('#p03-stats');
    if (!wrap) return;

    wrap.innerHTML = STATS.map(s => {
      const r = computeStat(items, s.campo);
      return (
        '<div class="stat-card">' +
          '<p class="stat-pct">' + r.pct + '<span class="stat-unit">%</span></p>' +
          '<p class="stat-frac">' + r.positivos + ' de ' + r.aplican + ' voces</p>' +
          '<p class="stat-title">' + escape(s.titulo) + '</p>' +
          '<p class="stat-note">' + escape(s.nota) + '</p>' +
        '</div>'
      );
    }).join('') +
      '<p class="stat-base">La base cambia entre tarjetas porque cada porcentaje se calcula solo sobre las voces en las que esa categoría aplica.</p>';
  }

  /* ------------------------------------------------------------------
     TESTIMONIO HERO (anclaje cita) — humaniza los datos.
     T08 nombra el algoritmo como filtro que invisibiliza lo distinto.
  ------------------------------------------------------------------ */
  function renderHero(root, items) {
    const wrap = root.querySelector('#p03-hero');
    if (!wrap) return;

    const t = items.find(x => x.id === 'T08') || items.find(x => x.reconoce_algoritmo === true);
    if (!t) return;

    wrap.innerHTML =
      '<figure class="p03-hero-card">' +
        '<blockquote class="hero-quote">' + escape(t.cita_corta) + '</blockquote>' +
        '<p class="hero-full">' + escape(t.cita) + '</p>' +
        '<figcaption class="hero-attribution">' +
          '<span class="id">' + escape(t.id) + '</span> · ' + escape(t.tema) +
          '<span class="perfil-text">' + escape(t.perfil) + '</span>' +
        '</figcaption>' +
      '</figure>';
  }

  function init() {
    const root = document.getElementById('p03');
    if (!root || root.dataset.rendered) return;

    const items = window.IEP.data.getTestimonios();
    if (!items.length) return;

    // Población base de los stats: voces de uso personal. Los perfiles
    // profesionales (T02, T04) traen reconoce_algoritmo en null, así que
    // este filtro los excluye sin hardcodear ids y deja un denominador
    // común para las tres tarjetas.
    const usoPersonal = items.filter(t =>
      t.reconoce_algoritmo !== null && typeof t.reconoce_algoritmo !== 'undefined'
    );

    renderStats(root, usoPersonal);
    renderHero(root, items);
    root.dataset.rendered = '1';
  }

  window.IEP.router.registerInit('p03', init);
})();
