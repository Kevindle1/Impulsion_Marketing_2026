/**
 * Administration — Impulsion Marketing
 * - Charge _config.json (sur le dossier racine V://) et surcharge les données
 *   « fixes » éditables (liste des personnes, types de livrables). N'intervient
 *   pas sur l'écran de connexion (pas de menu latéral).
 * - Injecte le lien « Administration » dans le menu, visible uniquement pour les
 *   personnes marquées « manager » ou « super admin » dans _config.json.
 */
window.ImpulsionMarketing = window.ImpulsionMarketing || {};

window.ImpulsionMarketing.adminConfig = (function () {
  'use strict';
  var IM = window.ImpulsionMarketing;
  var CONFIG_FILE = '_config.json';

  // Correspondance clé _config.json → liste à plat dans IM.config (éditables via l'admin).
  var LIST_MAP = {
    canaux: 'CANAUX',
    universBesoins: 'UNIVERS_BESOINS',
    typesCom: 'TYPES_COM',
    typologies: 'TYPOLOGIES',
    marches: 'MARCHES',
    recurrences: 'RECURRENCES',
    lots: 'LOTS',
    produits: 'PRODUITS',
    comTypologies: 'COM_TYPOLOGIES'
  };

  // Remplace le contenu d'un tableau EN PLACE (conserve la référence partagée).
  function spliceInPlace(target, source) {
    if (!Array.isArray(target) || !Array.isArray(source)) return;
    target.splice.apply(target, [0, target.length].concat(source));
  }

  // Remplace le contenu d'un objet EN PLACE (conserve la référence partagée).
  function assignInPlace(target, source) {
    if (!target || typeof target !== 'object' || !source || typeof source !== 'object') return;
    Object.keys(target).forEach(function (k) { delete target[k]; });
    Object.keys(source).forEach(function (k) { target[k] = source[k]; });
  }

  // Reconstruit la liste à plat SEGMENTS depuis la structure groupée.
  function flattenSegments(groups) {
    var out = [];
    (groups || []).forEach(function (g) {
      (g && g.items || []).forEach(function (it) { if (it && it.value) out.push(it.value); });
    });
    return out;
  }

  // Promesse résolue lorsque la config a été chargée et appliquée (les pages
  // attendent ce signal avant de construire leurs menus depuis IM.config).
  var _readyResolve;
  var ready = new Promise(function (res) { _readyResolve = res; });

  function rootHandle() {
    return IM.directoryStorage.getRootHandleWithCheck().then(function (res) {
      if (res.status !== 'success') throw new Error('Dossier de travail non chargé.');
      return res.handle;
    });
  }

  // Cache local (localStorage) du dernier _config.json chargé. Sert à hydrater
  // instantanément les modules config/users sur toutes les pages (y compris l'écran
  // de connexion, avant même l'accès au dossier V://). Ce n'est PAS une donnée en dur :
  // c'est un miroir de _config.json.
  var CACHE_KEY = 'im_config_cache';
  function cacheConfig(cfg) {
    try { if (cfg && Object.keys(cfg).length) localStorage.setItem(CACHE_KEY, JSON.stringify(cfg)); } catch (e) {}
  }
  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {}; } catch (e) { return {}; }
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
          return w.write(JSON.stringify(cfg, null, 2)).then(function () { cacheConfig(cfg); return w.close(); });
        });
      });
    });
  }

  // Lecture de _config.json (SOURCE UNIQUE). On NE réamorce PLUS depuis le code
  // (il n'y a plus de données en dur) : le fichier _config.json est livré avec l'app.
  // S'il est momentanément inaccessible (dossier pas encore autorisé), on se rabat sur
  // le cache local du dernier _config.json connu — jamais sur des valeurs codées en dur.
  function ensureSeed() {
    return load().then(function (cfg) {
      if (cfg && Object.keys(cfg).length) { cacheConfig(cfg); return cfg; }
      return readCache();
    }).catch(function () { return readCache(); });
  }

  // Applique la config aux listes en mémoire (en place, pour ne pas casser les références).
  function applyConfig(cfg) {
    if (!cfg) return;
    if (Array.isArray(cfg.users) && cfg.users.length && IM.users && IM.users.applyUsers) {
      IM.users.applyUsers(cfg.users);
    }
    if (!IM.config) return;
    // Listes à plat
    Object.keys(LIST_MAP).forEach(function (k) {
      if (Array.isArray(cfg[k]) && cfg[k].length && Array.isArray(IM.config[LIST_MAP[k]])) {
        spliceInPlace(IM.config[LIST_MAP[k]], cfg[k]);
      }
    });
    // Segments groupés → met à jour la structure ET la liste à plat dérivée
    if (Array.isArray(cfg.segmentsGroups) && cfg.segmentsGroups.length && Array.isArray(IM.config.SEGMENTS_GROUPS)) {
      spliceInPlace(IM.config.SEGMENTS_GROUPS, cfg.segmentsGroups);
      if (Array.isArray(IM.config.SEGMENTS)) spliceInPlace(IM.config.SEGMENTS, flattenSegments(cfg.segmentsGroups));
    }
    // Marchés « site web » (liste {value,label} — matrice du Comité éditorial)
    if (Array.isArray(cfg.marchesSiteWeb) && cfg.marchesSiteWeb.length && Array.isArray(IM.config.MARCHES_SITE_WEB)) {
      spliceInPlace(IM.config.MARCHES_SITE_WEB, cfg.marchesSiteWeb);
    }
    // Objets pilotés par _config.json (mutés en place pour préserver les références partagées)
    assignInPlace(IM.config.APP_SETTINGS, cfg.settings);
    assignInPlace(IM.config.ROLE_COLORS, cfg.roleColors);
    assignInPlace(IM.config.WEB_ZONES, cfg.webZones);
    assignInPlace(IM.config.WHATSNEW_BADGES, cfg.whatsnewBadges);
    assignInPlace(IM.config.BILAN, cfg.bilan);
    assignInPlace(IM.config.NOTIFICATION_LABELS, cfg.notificationLabels);
    if (Array.isArray(cfg.reponseStatuts) && cfg.reponseStatuts.length && Array.isArray(IM.config.REPONSE_STATUTS)) {
      spliceInPlace(IM.config.REPONSE_STATUTS, cfg.reponseStatuts);
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

  // Recharge _config.json depuis le dossier et l'applique (utilisable par les pages
  // une fois le dossier de travail réellement disponible). Renvoie une promesse.
  function reload() {
    return ensureSeed().then(function (cfg) { applyConfig(cfg); return cfg; }).catch(function () { return {}; });
  }

  // Applique l'URL de la Galerie (settings.galleryUrl) aux liens du menu — évite de
  // coder l'URL en dur dans chaque page.
  function applyGalleryLink() {
    var url = IM.config && IM.config.APP_SETTINGS && IM.config.APP_SETTINGS.galleryUrl;
    var links = document.querySelectorAll('a.nav-link[data-gallery]');
    Array.prototype.forEach.call(links, function (a) {
      if (url) { a.href = url; a.style.display = ''; }
      else { a.href = '#'; a.style.display = 'none'; }
    });
  }

  function init() {
    // On charge et applique la config sur TOUTES les pages (y compris l'écran de
    // connexion, qui n'a pas de menu latéral) afin que les listes/utilisateurs
    // configurés dans l'Administration soient répercutés partout.
    reload()
      .catch(function () {})
      .then(function () {
        // Le lien « Administration » n'est ajouté que s'il y a un menu latéral.
        if (document.querySelector('.sidebar-nav')) injectAdminLink();
        applyGalleryLink();
        _readyResolve();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    load: load, save: save, applyConfig: applyConfig, ensureSeed: ensureSeed, reload: reload,
    ready: ready, LIST_MAP: LIST_MAP, flattenSegments: flattenSegments
  };
})();
