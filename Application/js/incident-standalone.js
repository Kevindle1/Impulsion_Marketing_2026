/**
 * Signalement d'incident / amélioration — Impulsion Marketing
 * Injecte un bouton en bas du menu latéral + une fenêtre de signalement, à
 * deux onglets : création d'un nouveau signalement, et suivi de mes propres
 * signalements (En cours / Terminé) — sans passer par l'Administration
 * (réservée aux admins).
 * Les signalements sont enregistrés dans Données/incidents.json sur le
 * dossier racine ; « statut » sur un signalement vaut 'nouveau', 'en cours'
 * ou 'traité' (même vocabulaire que la page Administration ▸ Signalements,
 * seul 'traité' — posé lors d'une réponse — fait passer un ticket en
 * « Terminé » ici).
 */
window.ImpulsionMarketing = window.ImpulsionMarketing || {};

window.ImpulsionMarketing.incident = (function () {
  'use strict';
  var IM = window.ImpulsionMarketing;
  var myIncidents = null; // cache mémoire, rechargé à chaque ouverture de la modale

  function $(id) { return document.getElementById(id); }
  function esc(s) { return (IM.security && IM.security.escapeHtml) ? IM.security.escapeHtml(s) : String(s == null ? '' : s); }

  function currentPageLabel() {
    var t = (document.title || '').split('—')[0].trim();
    return t || (location.pathname.split('/').pop() || 'Page inconnue');
  }

  function frDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  }

  // ── Onglet « Nouveau signalement » (formulaire, inchangé fonctionnellement) ──
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
        myIncidents = null; // le nouveau signalement doit apparaître au prochain chargement de la liste
      })
      .catch(function (e) {
        btn.disabled = false; btn.textContent = 'Envoyer';
        showErr('Échec de l\'enregistrement : ' + ((IM.errors && IM.errors.getErrorMessage) ? IM.errors.getErrorMessage(e) : 'erreur inconnue'));
      });
  }

  // ── Onglet « Mes signalements » (suivi) ──
  // Lit Données/incidents.json (même fichier que l'Administration) et ne garde
  // que les signalements dont l'auteur est l'utilisateur courant.
  function loadMyIncidents() {
    var user = IM.users && IM.users.getCurrentUser ? IM.users.getCurrentUser() : null;
    var myName = user ? user.name : '';
    var ds = IM.directoryStorage;
    return ds.getRootHandleWithCheck()
      .then(function (res) {
        if (res.status !== 'success') throw new Error('Dossier de travail non chargé.');
        return res.handle.getDirectoryHandle('Données', { create: true });
      })
      .then(function (docsDir) { return docsDir.getFileHandle('incidents.json', { create: true }); })
      .then(function (fh) { return fh.getFile(); })
      .then(function (f) { return f.text(); })
      .then(function (txt) {
        var arr = [];
        try { arr = JSON.parse(txt) || []; } catch (e) { arr = []; }
        if (!Array.isArray(arr)) arr = [];
        var mine = arr.filter(function (it) { return myName && it.auteur === myName; });
        mine.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
        return mine;
      })
      .catch(function () { return []; });
  }

  function isTermine(it) { return it.statut === 'traité'; }

  // Libellé du statut de réponse (ex : Résolu, Refusé…) : configurable depuis
  // Administration ▸ Statuts de réponse — on retombe sur la valeur brute si
  // elle n'est plus dans la config (ex : liste modifiée depuis).
  function reponseStatutLabel(v) {
    var list = (IM.config && IM.config.REPONSE_STATUTS) || [];
    for (var i = 0; i < list.length; i++) if (list[i].value === v) return list[i].label;
    return v || '';
  }

  function ticketCardHtml(it) {
    var typeCls = it.type === 'amelioration' ? 'idea' : 'bug';
    var typeLabel = it.type === 'amelioration' ? '💡 Amélioration' : '🐞 Incident';
    var meta = (it.page ? esc(it.page) + ' · ' : '') + frDate(it.date);
    var html = '<div class="im-inc-card">'
      + '<div class="im-inc-card-top">'
      + '<span class="im-inc-type-badge ' + typeCls + '">' + typeLabel + '</span>'
      + '<span class="im-inc-meta">' + meta + '</span>'
      + '</div>'
      + '<div class="im-inc-desc">' + esc(it.description || '') + '</div>'
      + '<div class="im-inc-status-row">';

    if (isTermine(it)) {
      // « Modifications faites » n'a de sens qu'une fois le signalement traité —
      // tant que le statut n'est pas « traité », ce champ n'est jamais rempli
      // (il l'est en même temps que la réponse à l'auteur).
      if (it.noteDev) {
        html += '<div class="im-inc-note-box"><span class="im-inc-lbl">🛠 Modifications faites</span>' + esc(it.noteDev) + '</div>';
      }
      if (it.reponse && it.reponse.texte) {
        html += '<div class="im-inc-reply-box">'
          + '<strong>' + esc(reponseStatutLabel(it.reponse.statut) || '✅ Résolu') + '</strong> — ' + esc(it.reponse.texte)
          + '<span class="im-inc-who">Réponse de ' + esc(it.reponse.par || '?') + ' · ' + frDate(it.reponse.date) + '</span>'
          + '<span class="im-inc-notif">✉️ Notification envoyée à ' + esc(it.auteur || '') + '</span>'
          + '</div>';
      }
    } else {
      var statusHtml = it.livraison
        ? '<span class="im-inc-status-badge progress">🔧 En cours — 📦 ' + esc(it.livraison) + '</span>'
        : '<span class="im-inc-status-badge new">🕓 Nouveau, pas encore traité</span>';
      html += statusHtml;
    }

    html += '</div></div>';
    return html;
  }

  function renderTicketList() {
    if (!myIncidents) return;
    var scope = ($('im-inc-scope-cours') && $('im-inc-scope-cours').classList.contains('active')) ? 'cours' : 'termine';
    var cours = myIncidents.filter(function (it) { return !isTermine(it); });
    var termine = myIncidents.filter(isTermine);

    $('im-inc-scope-cours').innerHTML = '🔧 En cours <span class="im-inc-chip-cnt">' + cours.length + '</span>';
    $('im-inc-scope-termine').innerHTML = '✅ Terminé <span class="im-inc-chip-cnt">' + termine.length + '</span>';

    var list = scope === 'cours' ? cours : termine;
    var listEl = $('im-inc-list');
    if (!list.length) {
      listEl.innerHTML = '<div class="im-inc-empty">'
        + (scope === 'cours' ? '🎉 Aucun signalement en cours.' : 'Aucun signalement terminé pour l\'instant.')
        + '</div>';
      return;
    }
    listEl.innerHTML = list.map(ticketCardHtml).join('');
  }

  function refreshMyIncidents() {
    return loadMyIncidents().then(function (list) {
      myIncidents = list;
      var badge = $('im-inc-tab-count');
      if (badge) {
        badge.textContent = list.length;
        badge.style.display = list.length ? 'inline-flex' : 'none';
      }
      renderTicketList();
    });
  }

  function activateTab(tab) {
    $('im-inc-tab-new').classList.toggle('active', tab === 'new');
    $('im-inc-tab-list').classList.toggle('active', tab === 'list');
    $('im-inc-panel-new').classList.toggle('active', tab === 'new');
    $('im-inc-panel-list').classList.toggle('active', tab === 'list');
    if (tab === 'list') refreshMyIncidents();
  }

  function activateScope(scope) {
    $('im-inc-scope-cours').classList.toggle('active', scope === 'cours');
    $('im-inc-scope-termine').classList.toggle('active', scope === 'termine');
    renderTicketList();
  }

  function open() {
    var m = $('im-incident-modal');
    if (!m) return;
    // Pré-remplissage
    var user = IM.users && IM.users.getCurrentUser ? IM.users.getCurrentUser() : null;
    if (user && !$('im-inc-name').value) $('im-inc-name').value = user.name;
    if (!$('im-inc-page').value) $('im-inc-page').value = currentPageLabel();
    $('im-incident-error').style.display = 'none';
    activateTab('new');
    m.style.display = 'flex';
    // Chargée en tâche de fond dès l'ouverture pour que le badge et l'onglet
    // « Mes signalements » soient à jour sans attendre un clic.
    refreshMyIncidents();
  }
  function close() { var m = $('im-incident-modal'); if (m) m.style.display = 'none'; }

  function buildModal() {
    if ($('im-incident-modal')) return;
    var lab = 'font-size:12px;font-weight:700;color:var(--muted,#56655e);display:block;';
    var fld = 'width:100%;padding:10px 12px;border:1px solid var(--line,#eaefec);border-radius:10px;font-size:14px;font-family:inherit;color:var(--ink,#0c1a14);margin-top:5px;box-sizing:border-box;';
    var style = document.createElement('style');
    style.textContent =
      '.im-inc-tabs{display:flex;gap:4px;padding:12px 20px 0;background:#fff;}' +
      '.im-inc-tab{flex:1;text-align:center;padding:10px 8px;font-size:12.5px;font-weight:700;color:var(--muted,#56655e);background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-family:inherit;}' +
      '.im-inc-tab.active{color:var(--primary,#00875A);border-bottom-color:var(--primary,#00875A);}' +
      '.im-inc-tab-cnt{background:var(--red,#E2001A);color:#fff;font-size:10px;font-weight:800;border-radius:999px;min-width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;padding:0 4px;}' +
      '.im-inc-panel{display:none;}' +
      '.im-inc-panel.active{display:block;}' +
      '.im-inc-list-head{padding:14px 20px 0;display:flex;align-items:center;gap:8px;}' +
      '.im-inc-chip{padding:6px 12px;border:1px solid var(--line,#eaefec);border-radius:999px;background:#fff;font-size:12px;font-weight:650;color:var(--muted,#56655e);cursor:pointer;font-family:inherit;}' +
      '.im-inc-chip.active{background:var(--green-50,#e8f6ef);border-color:var(--primary,#00875A);color:var(--green-600,#00734C);}' +
      '.im-inc-chip-cnt{font-weight:800;}' +
      '.im-inc-list{padding:14px 20px 20px;display:flex;flex-direction:column;gap:10px;max-height:420px;overflow-y:auto;}' +
      '.im-inc-card{border:1px solid var(--line,#eaefec);border-radius:12px;padding:12px 14px;}' +
      '.im-inc-card-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}' +
      '.im-inc-type-badge{font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:999px;}' +
      '.im-inc-type-badge.bug{background:var(--red-50,#fdeaec);color:var(--red,#E2001A);}' +
      '.im-inc-type-badge.idea{background:var(--blue-50,#e8f0fe);color:var(--blue,#2563EB);}' +
      '.im-inc-meta{font-size:11px;color:var(--muted-2,#8b988f);margin-left:auto;}' +
      '.im-inc-desc{font-size:13px;color:var(--ink,#0c1a14);margin-top:8px;line-height:1.45;}' +
      '.im-inc-status-row{margin-top:10px;}' +
      '.im-inc-status-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;}' +
      '.im-inc-status-badge.new{background:var(--line-2,#f0f4f1);color:var(--muted,#56655e);}' +
      '.im-inc-status-badge.progress{background:var(--amber-50,#fff8e6);color:#9a6b00;}' +
      '.im-inc-note-box{margin-top:8px;background:var(--blue-50,#e8f0fe);border-radius:10px;padding:10px 12px;font-size:12.5px;color:var(--ink,#0c1a14);}' +
      '.im-inc-note-box .im-inc-lbl{display:block;font-size:10.5px;color:var(--blue,#2563EB);font-weight:700;margin-bottom:3px;text-transform:uppercase;letter-spacing:.4px;}' +
      '.im-inc-reply-box{margin-top:8px;background:var(--green-50,#e8f6ef);border-radius:10px;padding:10px 12px;font-size:12.5px;color:var(--ink,#0c1a14);}' +
      '.im-inc-reply-box .im-inc-who{display:block;font-size:10.5px;color:var(--muted,#56655e);font-weight:650;margin-top:5px;}' +
      '.im-inc-reply-box .im-inc-notif{display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--green-600,#00734C);font-weight:700;margin-top:7px;padding-top:7px;border-top:1px solid rgba(0,135,90,.14);}' +
      '.im-inc-empty{text-align:center;padding:40px 20px;color:var(--muted,#56655e);font-size:13px;}';
    document.head.appendChild(style);

    var m = document.createElement('div');
    m.id = 'im-incident-modal';
    m.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(12,30,22,0.5);z-index:10000;align-items:center;justify-content:center;padding:20px;';
    m.innerHTML =
      '<div style="background:#fff;border-radius:18px;max-width:520px;width:100%;max-height:88vh;box-shadow:0 24px 60px rgba(0,0,0,0.28);overflow:hidden;display:flex;flex-direction:column;">' +
        '<div style="background:var(--gradient,linear-gradient(135deg,#12C386,#00734C));color:#fff;padding:16px 20px;font-weight:750;font-size:15px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">' +
          '<span>🐞 Signaler un problème / une amélioration</span>' +
          '<span id="im-incident-close" style="cursor:pointer;font-size:22px;line-height:1;opacity:.9;">&times;</span>' +
        '</div>' +

        '<div class="im-inc-tabs">' +
          '<button type="button" class="im-inc-tab active" id="im-inc-tab-new">➕ Nouveau signalement</button>' +
          '<button type="button" class="im-inc-tab" id="im-inc-tab-list">📋 Mes signalements <span class="im-inc-tab-cnt" id="im-inc-tab-count" style="display:none;"></span></button>' +
        '</div>' +

        '<div class="im-inc-panel active" id="im-inc-panel-new" style="overflow-y:auto;">' +
          '<div style="padding:20px;display:flex;flex-direction:column;gap:14px;">' +
            '<div id="im-incident-error" style="display:none;background:var(--red-50,#fdeaec);color:#991b1b;border-radius:8px;padding:9px 12px;font-size:13px;"></div>' +
            '<label style="' + lab + '">Type<select id="im-inc-type" style="' + fld + 'cursor:pointer;"><option value="incident">🐞 Incident / bug</option><option value="amelioration">💡 Amélioration</option></select></label>' +
            '<label style="' + lab + '">Nom et prénom<input id="im-inc-name" type="text" style="' + fld + '" placeholder="Votre nom"></label>' +
            '<label style="' + lab + '">Page concernée<input id="im-inc-page" type="text" style="' + fld + '" placeholder="Ex : Détails, Pilotage…"></label>' +
            '<label style="' + lab + '">Description<textarea id="im-inc-desc" rows="4" style="' + fld + 'resize:vertical;" placeholder="Décrivez le problème ou l\'amélioration…"></textarea></label>' +
            '<button id="im-inc-submit" style="margin-top:4px;padding:12px;border:none;border-radius:12px;background:var(--primary,#00875A);color:#fff;font-weight:700;font-size:15px;cursor:pointer;">Envoyer</button>' +
          '</div>' +
        '</div>' +

        '<div class="im-inc-panel" id="im-inc-panel-list">' +
          '<div class="im-inc-list-head">' +
            '<button type="button" class="im-inc-chip active" id="im-inc-scope-cours">🔧 En cours <span class="im-inc-chip-cnt">0</span></button>' +
            '<button type="button" class="im-inc-chip" id="im-inc-scope-termine">✅ Terminé <span class="im-inc-chip-cnt">0</span></button>' +
          '</div>' +
          '<div class="im-inc-list" id="im-inc-list"><div class="im-inc-empty">Chargement…</div></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(m);
    $('im-incident-close').addEventListener('click', close);
    m.addEventListener('click', function (e) { if (e.target === m) close(); });
    $('im-inc-submit').addEventListener('click', submit);
    $('im-inc-tab-new').addEventListener('click', function () { activateTab('new'); });
    $('im-inc-tab-list').addEventListener('click', function () { activateTab('list'); });
    $('im-inc-scope-cours').addEventListener('click', function () { activateScope('cours'); });
    $('im-inc-scope-termine').addEventListener('click', function () { activateScope('termine'); });
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
