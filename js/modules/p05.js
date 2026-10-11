(function () {
  'use strict';

  function escape(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }

  /* ==================================================================
     P05 · "¿Y tú cómo te presentas?" · AUTOCUESTIONARIO REFLEXIVO

     Versión INTERACTIVA. Las preguntas y los perfiles viven en
     data.json → autocuestionario.{preguntas, perfiles_resultado} y se
     leen con window.IEP.data.getRaw(). Este módulo no hardcodea
     contenido: solo la lógica de recorrido, scoring y render.

     ------------------------------------------------------------------
     FILOSOFÍA · preguntas reflexivas, no diagnósticas. No hay
     respuestas correctas ni juicio normativo. El resultado es una
     LECTURA INTERPRETATIVA sobre el eje VITRINA ↔ ESPEJO, matizada por
     un segundo eje transversal de CONCIENCIA ALGORÍTMICA (opaco↔lúcido).

     Convención de signos en los pesos de cada opción:
       presentacion:  negativo → ESPEJO   |   positivo → VITRINA
       conciencia:    negativo → OPACO    |   positivo → LÚCIDO

     SCORING · acumulación simple sobre dos ejes:
       scorePresentacion = Σ opcion.pesos.presentacion
       scoreConciencia   = Σ opcion.pesos.conciencia

     Se normaliza scorePresentacion a 0..100 (0 = ESPEJO, 100 = VITRINA)
     usando el mínimo y el máximo teóricos derivados de los propios pesos
     de las preguntas. La banda (espejo / centro / vitrina) sale de esa
     posición; el flag de conciencia (opaco / lúcido) sale de un umbral
     sobre scoreConciencia. Banda × conciencia → perfil_resultado.
     ================================================================== */

  const UMBRAL_CONCIENCIA = 2; // scoreConciencia >= UMBRAL → lúcido

  // Estado interno (se reconstruye limpio en cada init / reinicio).
  let preguntas = [];
  let perfiles = [];
  let respuestas = [];     // índice de opción elegida por pregunta (o null)
  let indice = 0;          // pregunta actual
  let mostrandoResultado = false;
  let bounds = { min: 0, max: 0 }; // límites teóricos del eje presentación

  /* ---- Límites teóricos del eje presentación (para normalizar) ---- */
  function computeBounds(qs) {
    let min = 0, max = 0;
    qs.forEach(q => {
      const vals = (q.opciones || []).map(o => (o.pesos && o.pesos.presentacion) || 0);
      if (!vals.length) return;
      min += Math.min.apply(null, vals);
      max += Math.max.apply(null, vals);
    });
    return { min, max };
  }

  /* ---- Cálculo del resultado a partir de las respuestas ---- */
  function calcular() {
    let pres = 0, con = 0;
    preguntas.forEach((q, i) => {
      const sel = respuestas[i];
      if (sel == null) return;
      const op = q.opciones[sel];
      if (!op || !op.pesos) return;
      pres += op.pesos.presentacion || 0;
      con += op.pesos.conciencia || 0;
    });

    const span = bounds.max - bounds.min;
    const posicion = span > 0
      ? Math.round(((pres - bounds.min) / span) * 100)
      : 50;
    const posClamp = Math.max(0, Math.min(100, posicion));

    const banda = posClamp <= 33 ? 'espejo' : (posClamp <= 66 ? 'centro' : 'vitrina');
    const conciencia = con >= UMBRAL_CONCIENCIA ? 'lucido' : 'opaco';

    let perfil = perfiles.find(p => p.banda === banda && p.conciencia === conciencia);
    if (!perfil) perfil = perfiles.find(p => p.banda === banda) || perfiles[0] || null;

    return { posicion: posClamp, banda, conciencia, perfil, scorePresentacion: pres, scoreConciencia: con };
  }

  /* ---- Etiqueta interpretativa del eje para la tarjeta ---- */
  function ejeLabel(res) {
    const bandaTxt = res.banda === 'espejo'
      ? 'Tiende a ESPEJO'
      : (res.banda === 'vitrina' ? 'Tiende a VITRINA' : 'Entre VITRINA y ESPEJO');
    const conTxt = res.conciencia === 'lucido'
      ? 'con conciencia algorítmica'
      : 'sin nombrar el algoritmo';
    return bandaTxt + ' · ' + conTxt;
  }

  /* ================= RENDER ================= */

  function renderProgreso() {
    const total = preguntas.length;
    const num = indice + 1;
    return (
      '<div class="q-progress">' +
        '<span class="q-progress-label">Pregunta ' + num + ' de ' + total + '</span>' +
        '<div class="q-progress-track" aria-hidden="true">' +
          '<span class="q-progress-fill" style="width:' +
            Math.round((num / total) * 100) + '%"></span>' +
        '</div>' +
      '</div>'
    );
  }

  function renderPregunta() {
    const q = preguntas[indice];
    const seleccion = respuestas[indice];

    const opts = q.opciones.map((o, i) => {
      const isSel = seleccion === i;
      return (
        '<button type="button" class="q-option' + (isSel ? ' is-selected' : '') + '"' +
          ' data-op="' + i + '" aria-pressed="' + (isSel ? 'true' : 'false') + '">' +
          '<span class="q-option-key" aria-hidden="true">' + String.fromCharCode(65 + i) + '</span>' +
          '<span class="q-option-text">' + escape(o.texto) + '</span>' +
        '</button>'
      );
    }).join('');

    const puedeAtras = indice > 0;
    const esUltima = indice === preguntas.length - 1;
    const tieneSel = seleccion != null;

    return (
      '<div class="q-card" data-screen="pregunta">' +
        renderProgreso() +
        '<p class="q-text" id="p05-pregunta" tabindex="-1">' + escape(q.texto) + '</p>' +
        '<div class="q-options" role="group" aria-labelledby="p05-pregunta">' + opts + '</div>' +
        '<div class="q-nav">' +
          (puedeAtras
            ? '<button type="button" class="q-btn q-btn-back" data-act="atras">← Atrás</button>'
            : '<span class="q-hint">Sin respuestas correctas</span>') +
          // El botón siempre existe (no cambia el alto); se habilita al elegir.
          '<button type="button" class="q-btn q-btn-next" data-act="' +
            (esUltima ? 'ver' : 'siguiente') + '"' + (tieneSel ? '' : ' disabled') + '>' +
            (esUltima ? 'Ver mi resultado →' : 'Siguiente →') + '</button>' +
        '</div>' +
      '</div>'
    );
  }

  function renderResultado() {
    const res = calcular();
    const p = res.perfil;
    if (!p) {
      return '<div class="q-card">No fue posible calcular un perfil.</div>';
    }
    return (
      '<figure class="q-result" data-screen="resultado">' +
        '<figcaption class="q-result-tag">Tu lectura</figcaption>' +
        '<div class="q-axis" aria-hidden="true">' +
          '<span class="q-axis-pole is-espejo">Espejo</span>' +
          '<div class="q-axis-track">' +
            '<span class="q-axis-marker" style="left:' + res.posicion + '%"></span>' +
          '</div>' +
          '<span class="q-axis-pole is-vitrina">Vitrina</span>' +
        '</div>' +
        '<p class="q-result-eje">' + escape(ejeLabel(res)) + '</p>' +
        '<h3 class="q-result-name">' + escape(p.nombre) + '</h3>' +
        '<p class="q-result-desc">' + escape(p.descripcion) + '</p>' +
        '<p class="q-result-open">' + escape(p.pregunta_abierta) + '</p>' +
        '<div class="q-nav q-nav-result">' +
          '<button type="button" class="q-btn q-btn-reset" data-act="reiniciar">↺ Empezar de nuevo</button>' +
        '</div>' +
      '</figure>'
    );
  }

  /* ---- Pinta la pantalla actual y gestiona el foco ---- */
  function render(el, moveFocus) {
    const intro =
      '<p class="p05-intro">Seis preguntas para mirar tu propio modo de ' +
        'presentarte. No hay respuestas correctas: al final te devolvemos ' +
        'una lectura sobre el mismo eje vitrina–espejo del recorrido.</p>';

    const cuerpo = mostrandoResultado ? renderResultado() : renderPregunta();

    el.innerHTML =
      intro +
      '<div class="q-stage" aria-live="polite">' + cuerpo + '</div>';

    // El botón "Continuar" de la página solo aparece al terminar (un solo CTA a la vez).
    const sec = document.getElementById('p05');
    if (sec) sec.classList.toggle('quiz-done', mostrandoResultado);

    // Gestión del foco al cambiar de pantalla, sin desplazar la página.
    if (!moveFocus) return;
    const target = mostrandoResultado
      ? el.querySelector('.q-result-tag')
      : el.querySelector('#p05-pregunta');
    if (target) {
      target.setAttribute('tabindex', '-1');
      try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
    }
  }

  /* ---- Marca la opción elegida sin volver a pintar (evita saltos) ---- */
  function seleccionar(el, op) {
    respuestas[indice] = op;
    el.querySelectorAll('.q-option').forEach(b => {
      const on = Number(b.dataset.op) === op;
      b.classList.toggle('is-selected', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    const next = el.querySelector('.q-btn-next');
    if (next) next.disabled = false;
  }

  /* ---- Un único listener delegado en el contenedor ---- */
  function onClick(el, ev) {
    const btn = ev.target.closest('button');
    if (!btn) return;

    // Selección de opción
    if (btn.dataset.op != null) {
      seleccionar(el, Number(btn.dataset.op));
      return;
    }

    const act = btn.dataset.act;
    if (act === 'siguiente') {
      if (respuestas[indice] != null && indice < preguntas.length - 1) {
        indice++;
        render(el, true);
      }
    } else if (act === 'atras') {
      if (indice > 0) { indice--; render(el, true); }
    } else if (act === 'ver') {
      if (respuestas[indice] != null) { mostrandoResultado = true; render(el, true); }
    } else if (act === 'reiniciar') {
      reset();
      render(el, true);
    }
  }

  function reset() {
    respuestas = preguntas.map(() => null);
    indice = 0;
    mostrandoResultado = false;
  }

  function init() {
    const el = document.getElementById('p05-body');
    if (!el) return;

    const raw = window.IEP.data.getRaw();
    const ac = raw && raw.autocuestionario;
    if (!ac || !Array.isArray(ac.preguntas) || !ac.preguntas.length) {
      el.innerHTML = '<p class="p05-intro">El autocuestionario no está disponible.</p>';
      return;
    }

    preguntas = ac.preguntas;
    perfiles = ac.perfiles_resultado || [];
    bounds = computeBounds(preguntas);
    reset();

    // Listener único: se registra una sola vez por elemento.
    if (!el.dataset.bound) {
      el.addEventListener('click', ev => onClick(el, ev));
      el.dataset.bound = '1';
    }

    render(el);
  }

  window.IEP.router.registerInit('p05', init);
})();
