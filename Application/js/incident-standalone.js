/**
 * Signalement d'incident / amélioration — Impulsion Marketing
 * Injecte un bouton en bas du menu latéral + une fenêtre de signalement.
 * Les signalements sont enregistrés dans Données/incidents.json sur le dossier racine.
 */
window.ImpulsionMarketing = window.ImpulsionMarketing || {};

window.ImpulsionMarketing.incident = (function () {
  'use strict';
  var IM = window.ImpulsionMarketing;

  function $(id) { return document.getElementById(id); }

  function currentPageLabel() {
    var t = (document.title || '').split('—')[0].trim();
    return t || (location.pathname.split('/').pop() || 'Page inconnue');
  }

  function open() {
    var m = $('im-incident-modal');
    if (!m) return;
    // Pré-remplissage
    var user = IM.users && IM.users.getCurrentUser ? IM.users.getCurrentUser() : null;
    if (user && !$('im-inc-name').value) $('im-inc-name').value = user.name;
    if (!$('im-inc-page').value) $('im-inc-page').value = currentPageLabel();
    $('im-incident-error').style.display = 'none';
    m.style.display = 'flex';
  }
  function close() { var m = $('im-incident-modal'); if (m) m.style.display = 'none'; }

  function showErr(msg) { var e = $('im-incident-error'); if (e) { e.textContent = msg; e.style.display = 'block'; } }

  function submit() {
    var type = $('im-inc-type').value;
    var name = $('im-inc-name').value.trim();
    var page = $('im-inc-page').value.trim();
    var desc = $('im-inc-desc').value.trim();
    if (!name || !desc) { showErr('Merci d\'indiquer au moins votre nom et une description.'); return; }

    var btn = $('im-inc-submit');
    btn.disabled = true; btn.textContent = 'Envoi…';

    var ds = IM.directoryStorage;
    ds.getRootHandleWithCheck()
      .then(function (res) {
        if (res.status !== 'success') throw new Error('Dossier de travail non chargé.');
        return res.handle.getDirectoryHandle('Données', { create: true });
      })
      .then(function (docsDir) {
        return docsDir.getFileHandle('incidents.json', { create: true }).then(function (fh) {
          return fh.getFile().then(function (f) { return f.text(); }).then(function (txt) {
            var arr = [];
            try { arr = JSON.parse(txt) || []; } catch (e) { arr = []; }
            if (!Array.isArray(arr)) arr = [];
            arr.push({
              id: 'inc-' + Date.now(),
              date: new Date().toISOString(),
              type: type,
              auteur: name,
              page: page,
              description: desc,
              statut: 'nouveau'
            });
            return fh.createWritable().then(function (w) {
              return w.write(JSON.stringify(arr, null, 2)).then(function () { return w.close(); });
            });
          });
        });
      })
      .then(function () {
        close();
        $('im-inc-desc').value = '';
        btn.disabled = false; btn.textContent = 'Envoyer';
        if (IM.errors && IM.errors.showNotification) {
          IM.errors.showNotification('Merci ! Votre signalement a bien été enregistré.', 'success', 3000);
        }
      })
      .catch(function (e) {
        btn.disabled = false; btn.textContent = 'Envoyer';
        showErr('Échec de l\'enregistrement : ' + (e && e.message ? e.message : 'erreur inconnue'));
      });
  }

  function buildModal() {
    if ($('im-incident-modal')) return;
    var lab = 'font-size:12px;font-weight:700;color:var(--muted,#56655e);display:block;';
    var fld = 'width:100%;padding:10px 12px;border:1px solid var(--line,#eaefec);border-radius:10px;font-size:14px;font-family:inherit;color:var(--ink,#0c1a14);margin-top:5px;box-sizing:border-box;';
    var m = document.createElement('div');
    m.id = 'im-incident-modal';
    m.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(12,30,22,0.5);z-index:10000;align-items:center;justify-content:center;padding:20px;';
    m.innerHTML =
      '<div style="background:#fff;border-radius:18px;max-width:480px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.28);overflow:hidden;">' +
        '<div style="background:var(--gradient,linear-gradient(135deg,#12C386,#00734C));color:#fff;padding:16px 20px;font-weight:750;font-size:15px;display:flex;justify-content:space-between;align-items:center;">' +
          '<span>🐞 Signaler un problème / une amélioration</span>' +
          '<span id="im-incident-close" style="cursor:pointer;font-size:22px;line-height:1;opacity:.9;">&times;</span>' +
        '</div>' +
        '<div style="padding:20px;display:flex;flex-direction:column;gap:14px;">' +
          '<div id="im-incident-error" style="display:none;background:var(--red-50,#fdeaec);color:#991b1b;border-radius:8px;padding:9px 12px;font-size:13px;"></div>' +
          '<label style="' + lab + '">Type<select id="im-inc-type" style="' + fld + 'cursor:pointer;"><option value="incident">🐞 Incident / bug</option><option value="amelioration">💡 Amélioration</option></select></label>' +
          '<label style="' + lab + '">Nom et prénom<input id="im-inc-name" type="text" style="' + fld + '" placeholder="Votre nom"></label>' +
          '<label style="' + lab + '">Page concernée<input id="im-inc-page" type="text" style="' + fld + '" placeholder="Ex : Détails, Pilotage…"></label>' +
          '<label style="' + lab + '">Description<textarea id="im-inc-desc" rows="4" style="' + fld + 'resize:vertical;" placeholder="Décrivez le problème ou l\'amélioration…"></textarea></label>' +
          '<button id="im-inc-submit" style="margin-top:4px;padding:12px;border:none;border-radius:12px;background:var(--primary,#00875A);color:#fff;font-weight:700;font-size:15px;cursor:pointer;">Envoyer</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(m);
    $('im-incident-close').addEventListener('click', close);
    m.addEventListener('click', function (e) { if (e.target === m) close(); });
    $('im-inc-submit').addEventListener('click', submit);
  }

  function init() {
    var nav = document.querySelector('.sidebar-nav');
    if (!nav) return; // pas de menu latéral (ex. écran de connexion)
    if (document.getElementById('im-incident-link')) return;

    var sec = document.createElement('div');
    sec.className = 'nav-section';
    sec.innerHTML =
      '<span class="nav-section-title">Support</span>' +
      '<a href="#" class="nav-link" id="im-incident-link">' +
        '<svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>' +
        '<span>Signaler un problème</span>' +
      '</a>';
    nav.appendChild(sec);
    document.getElementById('im-incident-link').addEventListener('click', function (e) { e.preventDefault(); open(); });
    buildModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { open: open };
})();
