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

  /* TODO (autora): definir el contenido real de cada post de referencia.
     Por ahora son placeholders DIMENSIONADOS que simulan forma y tamaño
     de un post de IG (chrome: avatar, usuario, imagen con proporción,
     caption). Sirven para contrastar lo curado vs. lo espontáneo. */
  const POSTS = [
    {
      modo: 'curado',
      tag: 'Post curado / aspiracional',
      ratioClass: 'is-square',
      ratioLabel: '1:1 · cuadrado',
      nota: 'Aquí irá un ejemplo de imagen muy producida: encuadre cuidado, luz editada, escena pensada para ser vista. El yo que se quiere proyectar.'
    },
    {
      modo: 'cotidiano',
      tag: 'Post cotidiano / espontáneo',
      ratioClass: 'is-portrait',
      ratioLabel: '4:5 · vertical',
      nota: 'Aquí irá un ejemplo de imagen casual: sin retoque, captada al paso, casi descartable. El yo que se filtra cuando baja la guardia.'
    }
  ];

  function renderGuion() {
    var parrafos = GUION_PLACEHOLDER
      .map(function (p) { return '<p>' + escape(p) + '</p>'; })
      .join('');

    return (
      '<div class="p01-guion module-prose">' +
        '<p class="draft-tag">Borrador editorial · sujeto a revisión</p>' +
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
          /* zona de imagen con su proporción real */
          '<div class="ig-media" aria-hidden="true">' +
            '<span class="ig-ratio">' + escape(p.ratioLabel) + '</span>' +
          '</div>' +
          /* chrome inferior: línea de caption */
          '<footer class="ig-foot" aria-hidden="true">' +
            '<span class="ig-line ig-line-caption"></span>' +
            '<span class="ig-line ig-line-caption short"></span>' +
          '</footer>' +
        '</div>' +
        '<figcaption class="ig-post-note">' + escape(p.nota) + '</figcaption>' +
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
          'Nota de consentimiento: los posts que provengan de participantes ' +
          'se publican solo con su autorización expresa y anonimizados ' +
          '(rostros, nombres de usuario y datos identificables difuminados o ' +
          'sustituidos). Mientras tanto, estas piezas son maquetas sin ' +
          'contenido real.' +
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
