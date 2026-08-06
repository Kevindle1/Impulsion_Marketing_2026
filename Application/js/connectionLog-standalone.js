/**
 * Journal des connexions — Impulsion Marketing
 * Historise qui s'est connecté, avec quel profil, dans Données/connexions.json
 * (dossier « Données de production », même sous-dossier que incidents.json).
 * Écriture best-effort : un échec n'empêche jamais la connexion de l'utilisateur.
 */
window.ImpulsionMarketing = window.ImpulsionMarketing || {};

window.ImpulsionMarketing.connectionLog = (function () {
  'use strict';
  var IM = window.ImpulsionMarketing;
  var LOG_FILE = 'connexions.json';

  function withLogFile(fn) {
    var ds = IM.directoryStorage;
    if (!ds) return Promise.reject(new Error('directoryStorage indisponible'));
    return ds.getRootHandleWithCheck()
      .then(function (res) {
        if (res.status !== 'success') throw new Error('Dossier de travail non chargé.');
        return res.handle.getDirectoryHandle('Données', { create: true });
      })
      .then(function (docsDir) { return docsDir.getFileHandle(LOG_FILE, { create: true }); })
      .then(function (fh) {
        return fh.getFile().then(function (f) { return f.text(); }).then(function (txt) {
          var arr = [];
          try { arr = JSON.parse(txt) || []; } catch (e) { arr = []; }
          if (!Array.isArray(arr)) arr = [];
          return fn(arr, fh);
        });
      });
  }

  // Ajoute une entrée pour l'utilisateur qui vient de se connecter (nom, service,
  // date ISO). Volontairement best-effort : appelée juste avant la redirection
  // post-connexion, elle ne doit jamais bloquer ni faire échouer la connexion —
  // tout appelant doit ignorer une éventuelle erreur (voir login.html).
  function record(user) {
    if (!user || !user.name) return Promise.resolve();
    return withLogFile(function (arr, fh) {
      arr.push({
        date: new Date().toISOString(),
        name: user.name,
        role: user.role || '',
        roleLabel: user.roleLabel || ''
      });
      return fh.createWritable().then(function (w) {
        return w.write(JSON.stringify(arr, null, 2)).then(function () { return w.close(); });
      });
    });
  }

  // Lit le journal tel quel (utilisé par une future page de consultation en
  // Administration, ou simplement pour l'inspecter en JS). Trié du plus récent
  // au plus ancien.
  function getAll() {
    return withLogFile(function (arr) {
      return arr.slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    });
  }

  return {
    record: record,
    getAll: getAll
  };
})();
