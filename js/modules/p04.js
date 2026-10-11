(function () {
  'use strict';

  const TAG_LABELS = {
    autenticidad: 'Autenticidad',
    identidad: 'Identidad',
    algoritmo: 'Algoritmo',
    genero: 'Género',
    metricas: 'Métricas',
    estetica: 'Estética',
    politica_local: 'Política local',
    alfabetizacion_digital: 'Alfabetización digital',
    abstencion: 'Abstención',
    fatiga_algoritmica: 'Fatiga algorítmica',
    transicion_laboral: 'Transición laboral',
    comunidad: 'Comunidad',
    interseccionalidad: 'Interseccionalidad',
    emprendimiento: 'Emprendimiento',
    empleabilidad: 'Empleabilidad',
    autocensura: 'Autocensura',
    politica: 'Política',
    doble_cuenta: 'Doble cuenta',
    close_friends: 'Close friends',
    primera_generacion: 'Primera generación',
    comunidad_local: 'Comunidad local',
    origen: 'Origen',
    portafolio: 'Portafolio',
    desconexion: 'Desconexión',
    comparacion_social: 'Comparación social'
  };

  function escape(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }

  function labelFor(tag) {
    return TAG_LABELS[tag] || tag.charAt(0).toUpperCase() + tag.slice(1).replace(/_/g, ' ');
  }

  // Carrera y tiempo desde el egreso a la fecha de la entrevista: "Derecho · 1 año de egreso".
  function egresoLine(t) {
    const pd = t.perfil_desglosado || {};
    if (!pd.carrera_corta) return '';
    let out = pd.carrera_corta;
    const m = /^(\d{4})-(\d{2})$/;
    const e = m.exec(pd.egreso || ''), f = m.exec(t.fecha_entrevista || '');
    if (e && f) {
      const meses = (f[1] - e[1]) * 12 + (f[2] - e[2]);
      if (meses >= 12) {
        const anios = Math.round(meses / 12);
        out += ' · ' + anios + (anios === 1 ? ' año' : ' años') + ' de egreso';
      } else if (meses > 0) {
        out += ' · ' + meses + (meses === 1 ? ' mes' : ' meses') + ' de egreso';
      }
    }
    return '<p class="egreso">' + escape(out) + '</p>';
  }

  function polo(t) {
    const e = t.eje_vitrina_espejo;
    return e == null ? null : (e < 0 ? 'espejo' : 'vitrina');
  }

  function renderCard(t) {
    const p = polo(t);
    return (
      '<article class="gallery-card" data-id="' + escape(t.id) + '">' +
        '<p class="id-tag">' + escape(t.id) +
          (p ? '<span class="polo is-' + p + '">' + (p === 'espejo' ? 'Espejo' : 'Vitrina') + '</span>' : '') +
        '</p>' +
        '<blockquote class="quote">' + escape(t.cita_corta) + '</blockquote>' +
        egresoLine(t) +
        '<p class="perfil">' + escape(t.perfil) + '</p>' +
        '<button type="button" class="expand-btn" data-open="' + escape(t.id) + '">Leer testimonio completo</button>' +
      '</article>'
    );
  }

  /* ---- Modal único con el testimonio completo ---- */
  let dialog = null;
  let opener = null; // botón que abrió el modal: recibe el foco al cerrar
  function getDialog() {
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.className = 'voz-modal';
    dialog.setAttribute('aria-labelledby', 'voz-modal-quote');
    dialog.addEventListener('click', e => {
      // clic fuera de la caja o en "Cerrar"
      if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
    });
    // Escape cierra de forma nativa; en ambos casos se devuelve el foco.
    dialog.addEventListener('close', () => {
      if (opener && document.contains(opener)) {
        try { opener.focus({ preventScroll: true }); } catch (e) { opener.focus(); }
      }
      opener = null;
    });
    document.body.appendChild(dialog);
    return dialog;
  }

  function openModal(t, trigger) {
    const d = getDialog();
    opener = trigger || document.activeElement;
    const p = polo(t);
    const tags = (t.etiquetas || []).map(tag => '<span class="tag">' + escape(labelFor(tag)) + '</span>').join('');
    d.innerHTML =
      '<div class="voz-modal-box">' +
        '<div class="voz-modal-head">' +
          '<p class="id-tag">' + escape(t.id) +
            (p ? '<span class="polo is-' + p + '">' + (p === 'espejo' ? 'Espejo' : 'Vitrina') + '</span>' : '') +
          '</p>' +
          '<button type="button" class="voz-modal-close" data-close aria-label="Cerrar testimonio">Cerrar <span aria-hidden="true">✕</span></button>' +
        '</div>' +
        '<blockquote class="quote" id="voz-modal-quote">' + escape(t.cita_corta) + '</blockquote>' +
        egresoLine(t) +
        '<p class="perfil">' + escape(t.perfil) + '</p>' +
        '<p class="full-cita">' + escape(t.cita) + '</p>' +
        '<p class="tema">' + escape(t.tema) + '</p>' +
        '<div class="tags">' + tags + '</div>' +
      '</div>';
    d.showModal();
  }

  function renderGallery(root, items, filter) {
    const gallery = root.querySelector('.gallery');
    const meta = root.querySelector('.gallery-meta');
    if (!gallery) return;

    const filtered = filter === 'all' ? items : items.filter(t => polo(t) === filter);
    gallery.innerHTML = filtered.length
      ? filtered.map(renderCard).join('')
      : '<p class="gallery-empty">Ningún testimonio coincide con este filtro.</p>';

    if (meta) meta.textContent = 'Mostrando ' + filtered.length + ' de ' + items.length + ' testimonios.';
  }

  /* Un solo eje de filtro: el mismo vitrina / espejo del recorrido */
  function renderFilters(root, items) {
    const filterBar = root.querySelector('.filter-bar');
    if (!filterBar) return;

    const n = k => items.filter(t => polo(t) === k).length;
    filterBar.innerHTML =
      '<button type="button" class="pill is-active" data-filter="all" aria-pressed="true">Todas <span class="count">' + items.length + '</span></button>' +
      '<button type="button" class="pill" data-filter="vitrina" aria-pressed="false">Vitrina <span class="count">' + n('vitrina') + '</span></button>' +
      '<button type="button" class="pill" data-filter="espejo" aria-pressed="false">Espejo <span class="count">' + n('espejo') + '</span></button>';

    filterBar.addEventListener('click', e => {
      const btn = e.target.closest('.pill');
      if (!btn) return;
      filterBar.querySelectorAll('.pill').forEach(p => {
        p.classList.remove('is-active');
        p.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      renderGallery(root, items, btn.dataset.filter);
    });
  }

  function init() {
    const root = document.getElementById('p04');
    if (!root || root.dataset.rendered) return;

    const items = window.IEP.data.getByModulo('P04');
    if (!items.length) return;

    items.sort((a, b) => (a.orden || 0) - (b.orden || 0));

    renderFilters(root, items);
    renderGallery(root, items, 'all');

    root.querySelector('.gallery').addEventListener('click', e => {
      const btn = e.target.closest('[data-open]');
      if (!btn) return;
      const t = items.find(x => x.id === btn.dataset.open);
      if (t) openModal(t, btn);
    });
    root.dataset.rendered = '1';
  }

  window.IEP.router.registerInit('p04', init);
})();
