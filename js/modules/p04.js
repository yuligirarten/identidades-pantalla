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
    interseccionalidad: 'Interseccionalidad'
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

  function renderCard(t) {
    const tagsHtml = (t.etiquetas || [])
      .map(tag => '<span class="tag">' + escape(labelFor(tag)) + '</span>')
      .join('');
    const faseLabel = t.fase === 'PD_II_campo' ? 'Campo' : 'Exploratoria';
    return (
      '<article class="gallery-card" data-id="' + escape(t.id) + '">' +
        '<p class="id-tag">' + escape(t.id) + '<span class="fase">· ' + faseLabel + '</span></p>' +
        '<blockquote class="quote">' + escape(t.cita_corta) + '</blockquote>' +
        '<p class="perfil">' + escape(t.perfil) + '</p>' +
        '<p class="tema">' + escape(t.tema) + '</p>' +
        '<div class="tags">' + tagsHtml + '</div>' +
        '<button type="button" class="expand-btn" aria-expanded="false">Ver entrevista completa</button>' +
        '<div class="full-cita">' + escape(t.cita) + '</div>' +
      '</article>'
    );
  }

  function renderGallery(root, items, filter) {
    const gallery = root.querySelector('.gallery');
    const meta = root.querySelector('.gallery-meta');
    if (!gallery) return;

    const filtered = filter === 'all'
      ? items
      : items.filter(t => (t.etiquetas || []).indexOf(filter) !== -1);

    if (!filtered.length) {
      gallery.innerHTML = '<p class="gallery-empty">Ningún testimonio coincide con este filtro.</p>';
    } else {
      gallery.innerHTML = filtered.map(renderCard).join('');
    }

    if (meta) {
      const all = items.length;
      meta.textContent = filtered.length === all
        ? 'Mostrando ' + all + ' de ' + all + ' testimonios.'
        : 'Mostrando ' + filtered.length + ' de ' + all + ' testimonios.';
    }

    gallery.querySelectorAll('.expand-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.gallery-card');
        const expanded = card.classList.toggle('is-expanded');
        btn.setAttribute('aria-expanded', String(expanded));
        btn.firstChild.nodeValue = expanded ? 'Mostrar menos' : 'Ver entrevista completa';
      });
    });
  }

  function renderFilters(root, items) {
    const filterBar = root.querySelector('.filter-bar');
    if (!filterBar) return;

    const tagCounts = {};
    items.forEach(t => (t.etiquetas || []).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }));

    const tags = Object.keys(tagCounts).sort((a, b) =>
      tagCounts[b] - tagCounts[a] || a.localeCompare(b)
    );

    const html = [
      '<span class="filter-label">Filtrar</span>',
      '<button type="button" class="pill is-active" data-filter="all">Todos <span class="count">' + items.length + '</span></button>'
    ].concat(tags.map(tag =>
      '<button type="button" class="pill" data-filter="' + escape(tag) + '">' +
        escape(labelFor(tag)) +
        ' <span class="count">' + tagCounts[tag] + '</span>' +
      '</button>'
    )).join('');

    filterBar.innerHTML = html;

    filterBar.addEventListener('click', e => {
      const btn = e.target.closest('.pill');
      if (!btn) return;
      filterBar.querySelectorAll('.pill').forEach(p => p.classList.remove('is-active'));
      btn.classList.add('is-active');
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
    root.dataset.rendered = '1';
  }

  window.IEP.router.registerInit('p04', init);
})();
