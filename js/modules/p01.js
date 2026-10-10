(function () {
  'use strict';

  function escape(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }

  /* ------------------------------------------------------------------
     P01 — ¿Quién eres en Instagram?
     Introducción narrativa del recorrido.

     Este módulo inyecta DOS bloques dimensionados:
       1) El placeholder del GUION editorial (texto en 2ª persona que la
          autora redactará después). Reutiliza las clases globales
          .placeholder / .placeholder-tag / .placeholder-note (base.css).
       2) Dos posts de Instagram en CONTRASTE estético, dibujados con CSS
          como placeholders dimensionados (clases nuevas en css/p01.css).

     Todo contenido de copy es PROVISIONAL → marcado con TODO.
  ------------------------------------------------------------------ */

  /* BORRADOR editorial (autora a revisar): guion en 2ª persona, tono
     ensayístico, alineado al wireframe y al marco del protocolo.
     Listo para publicar como borrador; la autora puede pulir el texto. */
  const GUION_PLACEHOLDER = [
    'Abres la aplicación casi sin pensarlo. Antes de decidir nada, ya estás eligiendo: qué foto, qué luz, qué versión de ti aparece en la pantalla esta vez.',
    'Entre la imagen que cuidas y la que se te escapa hay una distancia. En ese intervalo se juega algo más serio de lo que parece: quién dices ser y quién terminas mostrando.',
    'Acabas de egresar. El perfil que construiste para tus amigos empieza a ser leído por reclutadores, profesores, desconocidos. La misma cuadrícula tiene ahora varios públicos a la vez.',
    'Cada publicación es una pequeña decisión sobre tu identidad: lo que subes, lo que borras, lo que dejas en borrador para siempre. Editas tu vida igual que editas una foto.',
    'Este recorrido parte de esa tensión cotidiana. Antes de mirar las voces del campo, mírate a ti: ¿quién eres cuando eres tú en Instagram?'
  ];

  /* Posts de referencia: fotografías reales de Instagram usadas con
     autorización de sus autoras. Por decisión de anonimato NO se muestran
     usuario, nombre ni caption original: solo la imagen. */
  const POSTS = [
    {
      modo: 'curado',
      tag: 'Post curado / aspiracional',
      ratioClass: 'is-square',
      img: 'img/p01-curado.jpg',
      alt: 'Joven con vestido rojo posando de pie entre vegetación en un bosque con neblina.',
      nota: 'Imagen producida: locación elegida, vestuario y luz pensados, pose frente a la cámara. El yo que se quiere proyectar.'
    },
    {
      modo: 'cotidiano',
      tag: 'Post cotidiano / espontáneo',
      ratioClass: 'is-portrait',
      img: 'img/p01-cotidiano.jpg',
      alt: 'Selfie con el brazo extendido junto a un perro que saca la lengua, bajo un cielo azul.',
      nota: 'Imagen captada al paso: brazo extendido, encuadre torcido, sin producción. El yo que se filtra cuando baja la guardia.'
    }
  ];

  function renderGuion() {
    var parrafos = GUION_PLACEHOLDER
      .map(function (p) { return '<p>' + escape(p) + '</p>'; })
      .join('');

    return (
      '<div class="p01-guion module-prose">' +
        '<div class="p01-guion-text">' + parrafos + '</div>' +
      '</div>'
    );
  }

  function renderPost(p) {
    return (
      '<figure class="ig-post ' + p.ratioClass + '">' +
        '<p class="ig-post-tag">' + escape(p.tag) + '</p>' +
        '<div class="ig-card">' +
          /* chrome superior: avatar + líneas de usuario */
          '<header class="ig-head">' +
            '<span class="ig-avatar" aria-hidden="true"></span>' +
            '<span class="ig-user-lines" aria-hidden="true">' +
              '<span class="ig-line ig-line-user"></span>' +
              '<span class="ig-line ig-line-meta"></span>' +
            '</span>' +
            '<span class="ig-dots" aria-hidden="true">···</span>' +
          '</header>' +
          /* imagen real con su proporción (1:1 o 4:5) */
          '<div class="ig-media">' +
            '<img src="' + escape(p.img) + '" alt="' + escape(p.alt) + '" loading="lazy" decoding="async">' +
          '</div>' +
          /* chrome inferior: línea de caption */
          '<footer class="ig-foot" aria-hidden="true">' +
            '<span class="ig-line ig-line-caption"></span>' +
            '<span class="ig-line ig-line-caption short"></span>' +
          '</footer>' +
        '</div>' +
        '<figcaption class="ig-post-note">' + escape(p.nota) +
          '<span class="img-credit">Fotografía de Instagram usada con autorización de su autora.</span>' +
        '</figcaption>' +
      '</figure>'
    );
  }

  function renderPosts() {
    var cards = POSTS.map(renderPost).join('');
    return (
      '<div class="ig-contrast">' +
        '<p class="ig-contrast-tag">Dos publicaciones, dos versiones del yo</p>' +
        '<div class="ig-grid">' + cards + '</div>' +
        '<p class="ig-consent">' +
          'Nota de consentimiento: ambas imágenes provienen de cuentas reales y se ' +
          'publican con autorización expresa de sus autoras. Para proteger su ' +
          'identidad se omiten usuario, nombre y texto original de la publicación. ' +
          'Las autoras de estas imágenes no forman parte del corpus de testimonios.' +
        '</p>' +
      '</div>'
    );
  }

  function init() {
    var el = document.getElementById('p01-body');
    if (!el || el.dataset.rendered) return;

    el.innerHTML = renderGuion() + renderPosts();
    el.dataset.rendered = '1';
  }

  window.IEP.router.registerInit('p01', init);
})();
