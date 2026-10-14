/**
 * Thème clair / sombre — Impulsion Marketing
 * Pose l'attribut data-theme sur <html>, lu par Application/css/theme.css
 * (:root[data-theme="dark"]). Un script anti-flash inline, dupliqué en tête
 * de <head> sur chaque page (avant tout CSS), fait déjà ce travail avant le
 * premier paint ; ce module ne fait que le refaire (sans effet si déjà posé)
 * et expose l'API utilisée par la bascule (cf. topbar-standalone.js).
 */
window.ImpulsionMarketing = window.ImpulsionMarketing || {};

window.ImpulsionMarketing.theme = (function () {
  'use strict';
  var KEY = 'im_theme';

  function systemPrefersDark() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); }
    catch (e) { return false; }
  }

  function get() {
    try {
      var t = localStorage.getItem(KEY);
      if (t === 'light' || t === 'dark') return t;
    } catch (e) { /* localStorage indisponible (navigation privée, etc.) */ }
    return systemPrefersDark() ? 'dark' : 'light';
  }

  function apply(t) {
    document.documentElement.setAttribute('data-theme', t);
  }

  function set(t) {
    if (t !== 'light' && t !== 'dark') return;
    try { localStorage.setItem(KEY, t); } catch (e) {}
    apply(t);
  }

  function toggle() {
    var next = get() === 'dark' ? 'light' : 'dark';
    set(next);
    return next;
  }

  apply(get());

  return { get: get, set: set, toggle: toggle };
})();
