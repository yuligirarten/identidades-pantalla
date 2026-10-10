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

  /* Ancla visual de la metáfora: dos fotografías reales de Instagram,
     usadas con autorización y sin datos identificables de sus autoras. */
  const PAR = [
    {
      cls: 'is-vitrina',
      label: 'Vitrina',
      img: 'img/p02-vitrina.jpg',
      alt: 'Joven posando de frente en la playa con luz dorada del atardecer.',
      nota: 'Lo que se elige mostrar: pose, luz y escenario pensados para ser mirados.'
    },
    {
      cls: 'is-espejo',
      label: 'Espejo',
      img: 'img/p02-espejo.jpg',
      alt: 'Cuarto en penumbra con una pequeña ventana iluminada por donde se asoma una montaña.',
      nota: 'Lo que se mira sin exhibirse: un instante íntimo, sin rostro ni pose.'
    }
  ];

  function renderPar() {
    return (
      '<div class="p02-par">' +
        PAR.map(function (f) {
          return (
            '<figure class="p02-foto ' + f.cls + '">' +
              '<p class="eje-label ' + f.cls + '">' + f.label + '</p>' +
              '<img src="' + f.img + '" alt="' + escape(f.alt) + '" loading="lazy" decoding="async">' +
              '<figcaption>' + escape(f.nota) +
                '<span class="img-credit">Fotografía de Instagram usada con autorización de su autora.</span>' +
              '</figcaption>' +
            '</figure>'
          );
        }).join('') +
      '</div>'
    );
  }

  /* Marco conceptual vitrina/espejo,
     ~3 párrafos, alineado al protocolo. Antecede a los testimonios y al eje. */
  function renderIntro(box) {
    if (box.dataset.rendered) return;
    box.className = 'p02-intro module-prose';
    box.innerHTML =
      '<p>Toda cuenta de Instagram funciona a la vez como una <strong>vitrina</strong> y como un <strong>espejo</strong>. ' +
        'Vitrina: lo que eliges mostrar, ordenado para que alguien lo mire —la mejor foto, el logro, la versión presentable ' +
        'de tu día—. Espejo: lo que miras sin enseñar, lo que guardas, los borradores que nunca llegan a publicarse. ' +
        'La mayoría de las cuentas viven entre esos dos polos, no en uno solo.</p>' +
      '<p>Para quien acaba de egresar, esa frontera se mueve. El perfil que antes era casi un diario empieza a leerse como ' +
        'carta de presentación: lo ven colegas, reclutadores, gente que apenas conoces. Lo que antes era espejo —espontáneo, ' +
        'sin cálculo— se vuelve vitrina, algo que se decide. Y a veces ocurre al revés: hay quien se repliega y deja de ' +
        'publicar para no exponerse.</p>' +
      '<p>Este módulo no te pide elegir un lado. Lo que muestran las voces del campo es que cada quien negocia esa tensión a ' +
        'su manera, y que el resultado puede ubicarse en algún punto del recorrido entre el espejo y la vitrina. Las citas y ' +
        'el eje que siguen son ese mapa.</p>' +
      renderPar();
    box.dataset.rendered = '1';
  }

  function renderViz(box) {
    if (box.dataset.rendered) return;

    const items = window.IEP.data.getTestimonios()
      .filter(t => t.eje_vitrina_espejo != null)
      .sort((a, b) => a.eje_vitrina_espejo - b.eje_vitrina_espejo);
    if (!items.length) return;

    const dots = items.map(t => {
      const eje = t.eje_vitrina_espejo;
      const left = ((eje + 1) / 2 * 100);
      const side = eje < 0 ? 'is-espejo' : (eje > 0 ? 'is-vitrina' : 'is-centro');
      const cita = escape(t.cita_corta);
      const id = escape(t.id);
      const ejeStr = formatEje(eje);
      const aria = id + ', ' + (eje < 0 ? 'espejo' : eje > 0 ? 'vitrina' : 'centro') +
        ' eje ' + ejeStr + '. ' + cita;
      return (
        '<span class="axis-point ' + side + '" style="left:' + left.toFixed(2) + '%" ' +
          'tabindex="0" role="listitem" aria-label="' + aria + '">' +
          '<span class="axis-dot"></span>' +
          '<span class="axis-tip" role="presentation">' +
            '<span class="axis-tip-quote">' + cita + '</span>' +
            '<span class="axis-tip-meta"><span class="axis-tip-id">' + id + '</span> · eje ' + ejeStr + '</span>' +
          '</span>' +
        '</span>'
      );
    }).join('');

    box.className = 'p02-viz';
    box.innerHTML =
      '<p class="viz-tag">V-02 · Eje vitrina / espejo</p>' +
      '<p class="viz-caption">Cada punto es un testimonio situado en el continuo entre lo íntimo retenido ' +
        '(espejo) y lo público performado (vitrina). Pasa el cursor o enfoca un punto para ver su cita.</p>' +
      '<div class="axis" role="list" aria-label="Testimonios en el eje vitrina-espejo">' +
        '<div class="axis-line"></div>' +
        '<div class="axis-zero" aria-hidden="true"><span class="axis-zero-tick"></span><span class="axis-zero-label">0</span></div>' +
        dots +
      '</div>' +
      '<div class="axis-poles" aria-hidden="true">' +
        '<span class="axis-pole pole-left">Espejo · −1</span>' +
        '<span class="axis-pole pole-right">+1 · Vitrina</span>' +
      '</div>';
    box.dataset.rendered = '1';
  }

  function init() {
    const intro = document.getElementById('p02-intro');
    if (intro) renderIntro(intro);

    const wrap = document.getElementById('p02-destacados');
    if (wrap && !wrap.dataset.rendered) {
      const items = window.IEP.data.getDestacados('P02');
      if (items.length) {
        items.sort((a, b) => (a.eje_vitrina_espejo || 0) - (b.eje_vitrina_espejo || 0));
        wrap.innerHTML = items.map(renderCard).join('');
        wrap.dataset.rendered = '1';
      }
    }

    const viz = document.getElementById('p02-viz');
    if (viz) renderViz(viz);
  }

  window.IEP.router.registerInit('p02', init);
})();
