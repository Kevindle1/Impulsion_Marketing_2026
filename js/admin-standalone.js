/**
 * Administration — Impulsion Marketing
 * - Charge _config.json (sur le dossier racine V://) et surcharge les données
 *   « fixes » éditables (liste des personnes, types de livrables). N'intervient
 *   pas sur l'écran de connexion (pas de menu latéral).
 * - Injecte le lien « Administration » dans le menu, visible uniquement pour les
 *   managers, le super admin et Kévin Dolie.
 */
window.ImpulsionMarketing = window.ImpulsionMarketing || {};

window.ImpulsionMarketing.adminConfig = (function () {
  'use strict';
  var IM = window.ImpulsionMarketing;
  var CONFIG_FILE = '_config.json';

  function rootHandle() {
    return IM.directoryStorage.getRootHandleWithCheck().then(function (res) {
      if (res.status !== 'success') throw new Error('Dossier de travail non chargé.');
      return res.handle;
    });
  }

  function load() {
    return rootHandle().then(function (root) {
      return root.getFileHandle(CONFIG_FILE, { create: false })
        .then(function (fh) { return fh.getFile(); })
        .then(function (f) { return f.text(); })
        .then(function (txt) { var c = {}; try { c = JSON.parse(txt) || {}; } catch (e) { c = {}; } return c; })
        .catch(function () { return {}; });
    });
  }

  function save(cfg) {
    return rootHandle().then(function (root) {
      return root.getFileHandle(CONFIG_FILE, { create: true }).then(function (fh) {
        return fh.createWritable().then(function (w) {
          return w.write(JSON.stringify(cfg, null, 2)).then(function () { return w.close(); });
        });
      });
    });
  }

  // Applique la config aux listes en mémoire (en place, pour ne pas casser les références).
  function applyConfig(cfg) {
    if (!cfg) return;
    if (Array.isArray(cfg.users) && cfg.users.length && IM.users && IM.users.applyUsers) {
      IM.users.applyUsers(cfg.users);
    }
    if (Array.isArray(cfg.canaux) && cfg.canaux.length && IM.config && Array.isArray(IM.config.CANAUX)) {
      IM.config.CANAUX.splice.apply(IM.config.CANAUX, [0, IM.config.CANAUX.length].concat(cfg.canaux));
    }
  }

  function injectAdminLink() {
    var nav = document.querySelector('.sidebar-nav');
    if (!nav || document.getElementById('im-admin-link')) return;
    if (!(IM.users && IM.users.canAccessAdmin && IM.users.canAccessAdmin())) return;
    var href = location.pathname.indexOf('/pages/') !== -1 ? 'admin.html' : 'pages/admin.html';
    var section = nav.querySelector('.nav-section') || nav;
    var a = document.createElement('a');
    a.className = 'nav-link';
    a.id = 'im-admin-link';
    a.href = href;
    a.innerHTML =
      '<svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' +
      '<span>Administration</span>';
    section.appendChild(a);
  }

  function init() {
    // Pas de menu (écran de connexion) → ne rien faire.
    if (!document.querySelector('.sidebar-nav')) return;
    load()
      .then(function (cfg) { applyConfig(cfg); })
      .catch(function () {})
      .then(function () { injectAdminLink(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { load: load, save: save, applyConfig: applyConfig };
})();
