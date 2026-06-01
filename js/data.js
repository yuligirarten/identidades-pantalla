(function () {
  'use strict';

  const state = {
    raw: null,
    error: null,
    loading: null
  };

  async function load() {
    if (state.raw) return state.raw;
    if (state.loading) return state.loading;
    state.loading = (async () => {
      const res = await fetch('data/data.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status + ' al cargar data/data.json');
      state.raw = await res.json();
      return state.raw;
    })().catch(err => {
      state.error = err;
      throw err;
    });
    return state.loading;
  }

  function getRaw() { return state.raw; }
  function getError() { return state.error; }

  function getTestimonios() {
    return state.raw ? state.raw.testimonios.slice() : [];
  }

  function getByModulo(modulo) {
    return getTestimonios().filter(t => Array.isArray(t.modulos) && t.modulos.indexOf(modulo) !== -1);
  }

  function getDestacados(modulo) {
    let list = getTestimonios().filter(t => t.destacado === true);
    if (modulo) list = list.filter(t => t.modulos.indexOf(modulo) !== -1);
    return list;
  }

  function getAllTags() {
    const set = new Set();
    getTestimonios().forEach(t => (t.etiquetas || []).forEach(tag => set.add(tag)));
    return Array.from(set).sort();
  }

  window.IEP = window.IEP || {};
  window.IEP.data = {
    load, getRaw, getError, getTestimonios, getByModulo, getDestacados, getAllTags
  };
})();
