/**
 * topbar-standalone.js — Barre du haut commune à toutes les pages.
 *
 * Expose window.ImpulsionMarketing.topbar.mount({ title, subtitle }).
 * Rend un en-tête identique partout (recherche globale, Rafraîchir, Quoi de neuf,
 * Notifications, avatar, déconnexion) ; seul le titre à gauche change.
 *
 * Dépend des modules : users, directoryStorage, workflow, security, errors.
 * Aucune dépendance externe.
 */
(function () {
  'use strict';
  var IM = window.ImpulsionMarketing = window.ImpulsionMarketing || {};

  var WHATSNEW_FILE = '_whatsnew.json';
  var NOTIF_FILE = '_notifications.json';
  var _whatsNewCache = [];

  // ── Chemins relatifs (les pages secondaires sont dans /pages/) ──
  function inPages() { return /\/pages\//.test(location.pathname); }
  function vizHref() { return inPages() ? 'visualization.html' : 'pages/visualization.html'; }
  function loginHref() { return inPages() ? '../login.html' : 'login.html'; }
  function detailsHref() { return inPages() ? 'details.html' : 'pages/details.html'; }
  function comiteHref() { return inPages() ? 'comite-editorial.html' : 'pages/comite-editorial.html'; }

  // ── Petits utilitaires ──
  function esc(s) { var sec = IM.security; return (sec && sec.escapeHtml) ? sec.escapeHtml(s) : String(s == null ? '' : s); }
  function notify(msg, type) { var e = IM.errors; if (e && e.showNotification) e.showNotification(msg, type || 'success', 2500); }
  function currentUser() { var u = IM.users; return u ? u.getCurrentUser() : null; }
  function currentUserName() { var u = currentUser(); return u ? u.name : ''; }
  function $(id) { return document.getElementById(id); }

  // ── Icônes (SVG inline) ──
  var SVG = {
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    refresh: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
    gift: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12v9H4v-9"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>',
    bell: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    logout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
  };

  // ── Markup de l'en-tête ──
  function headerHtml(opts) {
    var dotStyle = 'display:none;position:absolute;top:-2px;right:-2px;width:10px;height:10px;background:var(--primary,#00875A);border-radius:50%;border:2px solid #fff;';
    var badgeStyle = 'display:none;position:absolute;top:-4px;right:-4px;background:var(--red,#E2001A);color:#fff;border-radius:50%;min-width:18px;height:18px;font-size:11px;font-weight:700;line-height:18px;text-align:center;padding:0 3px;border:2px solid #fff;';
    var panelStyle = 'display:none;position:absolute;top:48px;right:0;width:340px;background:#fff;border:1px solid var(--line,#eaefec);border-radius:14px;box-shadow:var(--shadow-md);z-index:500;max-height:420px;overflow-y:auto;';
    return ''
      + '<div class="header-left">'
      + '<div class="crumb">Accueil&nbsp;·&nbsp;<b>' + esc(opts.title || '') + '</b></div>'
      + '</div>'
      + '<div class="header-right">'
      + '<div class="header-search">' + SVG.search
      + '<input type="text" id="topbar-search" placeholder="Rechercher : nom, PO, code projet/action, réf com/paracom…"></div>'
      + '<button id="topbar-whatsnew" class="icon-btn" title="Quoi de neuf ?" aria-label="Quoi de neuf ?" style="position:relative;">'
      + SVG.gift + '<span id="topbar-whatsnew-dot" style="' + dotStyle + '"></span></button>'
      + '<div style="position:relative;">'
      + '<button id="topbar-notif-bell" class="icon-btn" title="Notifications" aria-label="Notifications">'
      + SVG.bell + '<span id="topbar-notif-badge" style="' + badgeStyle + '">0</span></button>'
      + '<div id="topbar-notif-panel" style="' + panelStyle + '">'
      + '<div style="padding:12px 16px;border-bottom:1px solid var(--line,#eaefec);display:flex;justify-content:space-between;align-items:center;gap:10px;">'
      + '<span style="font-weight:700;font-size:14px;color:var(--ink,#0c1a14);">🔔 Notifications</span>'
      + '<button id="topbar-notif-mark-all" style="display:none;background:none;border:none;color:var(--primary,#00875A);font-size:12px;font-weight:700;cursor:pointer;padding:0;white-space:nowrap;">Tout marquer comme lu</button>'
      + '</div><div id="topbar-notif-list" style="padding:8px 0;"></div></div>'
      + '</div>'
      + '<button id="topbar-refresh" class="icon-btn icon-btn--text" title="Rafraîchir : reconstruire l’index des campagnes">'
      + SVG.refresh + '<span class="icon-btn-label">Rafraîchir</span></button>'
      + '</div>';
  }

  // ── Bloc utilisateur en bas de la barre de navigation (avatar + nom + équipe + déconnexion) ──
  // Couleurs de rôle : source unique = _config.json (config.ROLE_COLORS).
  var ROLE_COLORS = (IM.config && IM.config.ROLE_COLORS) || {};
  function logout() {
    try { localStorage.removeItem('im_current_user'); } catch (e) {}
    window.location.href = loginHref();
  }
  function mountSidebarUser() {
    var side = document.querySelector('.sidebar');
    if (!side || side.querySelector('.sidebar-user')) return;
    var u = currentUser();
    var name = u ? u.name : 'Utilisateur';
    var parts = name.trim().split(/\s+/);
    var initials = parts.map(function (p) { return p[0]; }).join('').toUpperCase().slice(0, 2);
    var team = u ? (u.roleLabel || u.role || '') : '';
    var block = document.createElement('div');
    block.className = 'sidebar-user';
    block.innerHTML =
      '<div class="sidebar-user-av" style="background:' + (ROLE_COLORS[u && u.role] || '#64748b') + ';">' + esc(initials) + '</div>'
      + '<div class="sidebar-user-info"><div class="sidebar-user-name">' + esc(name) + '</div>'
      + '<div class="sidebar-user-team">' + esc(team) + '</div></div>'
      + '<button class="sidebar-user-logout" title="Se déconnecter" aria-label="Se déconnecter">' + SVG.logout + '</button>';
    side.appendChild(block);
    var lo = block.querySelector('.sidebar-user-logout');
    if (lo) lo.addEventListener('click', logout);
  }

  // ── Recherche globale → page Campagnes filtrée (?q=) ──
  function wireSearch() {
    var input = $('topbar-search');
    if (!input) return;
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var q = (input.value || '').trim();
        window.location.href = vizHref() + (q ? ('?q=' + encodeURIComponent(q)) : '');
      }
    });
  }

  // ── Rafraîchir : reconstruit l'index puis recharge la page ──
  function wireRefresh() {
    var btn = $('topbar-refresh');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var ds = IM.directoryStorage, wf = IM.workflow;
      if (!ds || !wf) return;
      var lbl = btn.querySelector('.icon-btn-label');
      btn.disabled = true; if (lbl) lbl.textContent = 'Rafraîchissement…';
      ds.getRootHandleWithCheck().then(function (res) {
        if (res.status !== 'success') throw new Error('Dossier non chargé.');
        return wf.buildFullIndex(res.handle);
      }).then(function (index) {
        var count = Object.keys((index && index.campaigns) || {}).length;
        notify('Index reconstruit — ' + count + ' campagnes indexées', 'success');
        setTimeout(function () { window.location.reload(); }, 450);
      }).catch(function (e) {
        btn.disabled = false; if (lbl) lbl.textContent = 'Rafraîchir';
        notify('Échec : ' + (e && e.message), 'error');
      });
    });
  }

  // ── Quoi de neuf (annonces) ──
  function isSeenBy(entry, name) { return Array.isArray(entry.seenBy) && entry.seenBy.indexOf(name) !== -1; }
  function inAudience(entry, name) { return !Array.isArray(entry.audience) || entry.audience.length === 0 || entry.audience.indexOf(name) !== -1; }
  function byNewest(a, b) { return (b.id || 0) - (a.id || 0); }

  function readWhatsNew() {
    var ds = IM.directoryStorage;
    return ds.getRootHandleWithCheck().then(function (res) {
      if (res.status !== 'success') return [];
      return res.handle.getFileHandle(WHATSNEW_FILE).then(function (fh) { return fh.getFile(); })
        .then(function (f) { return f.text(); })
        .then(function (t) { try { var a = JSON.parse(t); return Array.isArray(a) ? a : []; } catch (e) { return []; } })
        .catch(function () { return []; });
    }).catch(function () { return []; });
  }
  function writeWhatsNew(list) {
    var ds = IM.directoryStorage;
    return ds.getRootHandleWithCheck().then(function (res) {
      if (res.status !== 'success') throw new Error('Dossier non chargé.');
      return res.handle.getFileHandle(WHATSNEW_FILE, { create: true });
    }).then(function (fh) { return fh.createWritable(); })
      .then(function (w) { return w.write(JSON.stringify(list, null, 2)).then(function () { return w.close(); }); });
  }
  function updateWhatsNewDot() {
    var dot = $('topbar-whatsnew-dot');
    if (!dot) return;
    var name = currentUserName();
    dot.style.display = _whatsNewCache.some(function (e) { return inAudience(e, name) && !isSeenBy(e, name); }) ? 'block' : 'none';
  }
  function markWhatsNewSeen(ids) {
    var name = currentUserName();
    if (!name || !ids || !ids.length) { updateWhatsNewDot(); return Promise.resolve(); }
    return readWhatsNew().then(function (list) {
      var changed = false;
      list.forEach(function (e) {
        if (ids.indexOf(e.id) !== -1) {
          if (!Array.isArray(e.seenBy)) e.seenBy = [];
          if (e.seenBy.indexOf(name) === -1) { e.seenBy.push(name); changed = true; }
        }
      });
      _whatsNewCache = list;
      updateWhatsNewDot();
      return changed ? writeWhatsNew(list) : null;
    }).catch(function () {});
  }
  function renderWhatsNewModal(entries, markIds) {
    if (!entries || !entries.length) return;
    var badge = (IM.config && IM.config.WHATSNEW_BADGES) || {};
    var body = '';
    entries.forEach(function (e) {
      var b = badge[e.type] || badge.improve;
      body += '<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--line,#eaefec);">';
      body += '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:6px;">'
        + '<span style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;"><span style="font-size:11px;font-weight:700;color:#fff;background:' + b.color + ';border-radius:4px;padding:2px 6px;">' + b.icon + ' ' + b.label + '</span>'
        + '<strong style="font-size:14px;color:var(--ink,#0c1a14);">' + esc(e.title) + '</strong></span>'
        + '<span style="font-size:12px;color:var(--muted-2,#8b988f);white-space:nowrap;">' + esc(e.dateLabel || '') + '</span></div>';
      if (e.text) body += '<div style="font-size:13px;line-height:1.5;color:var(--ink,#0c1a14);white-space:pre-wrap;">' + esc(e.text) + '</div>';
      body += '</div>';
    });
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:10001;display:flex;align-items:center;justify-content:center;';
    var box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:14px;padding:24px;width:min(520px,92vw);max-height:80vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,.25);';
    box.innerHTML = '<h2 style="margin:0 0 4px;font-size:18px;color:var(--ink,#0c1a14);">🎉 Quoi de neuf</h2>'
      + '<p style="margin:0 0 16px;font-size:13px;color:var(--muted-2,#8b988f);">Les dernières nouveautés et corrections.</p>'
      + body
      + '<div style="display:flex;justify-content:flex-end;margin-top:8px;"><button data-act="ok" style="background:var(--primary,#00875A);color:#fff;border:none;border-radius:8px;padding:9px 18px;cursor:pointer;font-size:13px;font-weight:600;">Compris</button></div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    function close() { overlay.remove(); markWhatsNewSeen(markIds); }
    box.querySelector('[data-act="ok"]').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function onEsc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); } });
  }
  function openWhatsNewManually() {
    readWhatsNew().then(function (list) {
      _whatsNewCache = list;
      var name = currentUserName();
      var visible = list.filter(function (e) { return inAudience(e, name); }).sort(byNewest);
      if (!visible.length) { renderWhatsNewModal([{ type: 'improve', title: 'Aucune annonce pour le moment', text: '', dateLabel: '' }], []); return; }
      renderWhatsNewModal(visible, visible.map(function (e) { return e.id; }));
    });
  }
  function wireWhatsNew() {
    var btn = $('topbar-whatsnew');
    if (btn) btn.addEventListener('click', openWhatsNewManually);
    // Met à jour la pastille uniquement (pas d'ouverture auto de la modale à chaque page).
    readWhatsNew().then(function (list) { _whatsNewCache = list; updateWhatsNewDot(); });
  }

  // ── Notifications ──
  function writeNotifications(updated, rootHandle) {
    if (!rootHandle) return Promise.resolve();
    return rootHandle.getFileHandle(NOTIF_FILE, { create: true })
      .then(function (fh) { return fh.createWritable(); })
      .then(function (w) { return w.write(JSON.stringify(updated, null, 2)).then(function () { return w.close(); }); });
  }
  function openSignalementModal(n) {
    var panel = $('topbar-notif-panel');
    if (panel) panel.style.display = 'none';
    var m = $('topbar-signalement-modal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'topbar-signalement-modal';
      m.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(12,30,22,0.5);z-index:10001;align-items:center;justify-content:center;padding:20px;';
      document.body.appendChild(m);
      m.addEventListener('click', function (e) { if (e.target === m) m.style.display = 'none'; });
    }
    var header = (n.signalementType || '🔔 Signalement') + (n.signalementPage ? ' · ' + esc(n.signalementPage) : '');
    var sigDate = n.signalementDate ? esc(n.signalementDate.slice(0, 10)) : '';
    var repDate = n.dateCreation ? esc(n.dateCreation.slice(0, 10)) : '';
    m.innerHTML =
      '<div style="background:#fff;border-radius:18px;max-width:520px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.28);overflow:hidden;">' +
        '<div style="background:var(--gradient,linear-gradient(135deg,#12C386,#00734C));color:#fff;padding:16px 20px;font-weight:750;font-size:15px;display:flex;justify-content:space-between;align-items:center;">' +
          '<span>🔔 Réponse à votre signalement</span>' +
          '<span id="topbar-sig-modal-close" style="cursor:pointer;font-size:22px;line-height:1;opacity:.9;">&times;</span>' +
        '</div>' +
        '<div style="padding:20px;display:flex;flex-direction:column;gap:14px;">' +
          '<div style="font-size:13px;font-weight:700;color:#374151;">' + header + (sigDate ? ' <span style="font-weight:400;color:#94a3b8;">· ' + sigDate + '</span>' : '') + '</div>' +
          '<div><div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Votre signalement</div>' +
            '<div style="font-size:13.5px;color:#374151;white-space:pre-wrap;background:#f8fafc;border:1px solid #eef2f7;border-radius:8px;padding:10px 12px;">' + esc(n.signalementDescription || '—') + '</div></div>' +
          '<div><div style="font-size:11px;font-weight:700;color:#0f766e;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Réponse</div>' +
            (n.statutReponse ? '<div style="font-size:13px;font-weight:700;color:#0f766e;margin-bottom:6px;">' + esc(n.statutReponse) + '</div>' : '') +
            '<div style="font-size:13.5px;color:#374151;white-space:pre-wrap;background:var(--green-50,#e8f6ef);border:1px solid var(--green-100,#cdeede);border-radius:8px;padding:10px 12px;">' + esc(n.message || '—') + '</div>' +
            '<div style="font-size:11px;color:#94a3b8;margin-top:6px;">par ' + esc(n.auteur || '?') + (repDate ? ' · ' + repDate : '') + '</div></div>' +
        '</div>' +
      '</div>';
    $('topbar-sig-modal-close').addEventListener('click', function () { m.style.display = 'none'; });
    m.style.display = 'flex';
  }
  function renderNotifications(mine, allNotifs, rootHandle) {
    var badge = $('topbar-notif-badge');
    var list = $('topbar-notif-list');
    var markAll = $('topbar-notif-mark-all');
    if (!badge || !list) return;

    if (mine.length > 0) { badge.textContent = mine.length; badge.style.display = 'block'; }
    else { badge.style.display = 'none'; }
    if (markAll) markAll.style.display = mine.length > 0 ? 'inline' : 'none';

    if (markAll && !markAll._bound) {
      markAll._bound = true;
      markAll.addEventListener('click', function (e) {
        e.stopPropagation();
        var me = currentUserName();
        var current = renderNotifications._all || allNotifs;
        var updated = current.map(function (n) { if (n.destinataire === me && !n.lu) n.lu = true; return n; });
        writeNotifications(updated, renderNotifications._root || rootHandle)
          .then(function () { renderNotifications([], updated, renderNotifications._root || rootHandle); })
          .catch(function (err) { notify('Échec : ' + err.message, 'error'); });
      });
    }
    renderNotifications._all = allNotifs;
    renderNotifications._root = rootHandle;

    if (mine.length === 0) {
      list.innerHTML = '<div style="padding:16px;text-align:center;color:#94a3b8;font-size:13px;">Aucune notification</div>';
      return;
    }
    var typeLabels = (IM.config && IM.config.NOTIFICATION_LABELS) || {};
    var html = '';
    mine.forEach(function (n) {
      var label = typeLabels[n.type] || '🔔 Notification';
      var date = n.dateCreation ? n.dateCreation.slice(0, 10) : '';
      html += '<div class="notif-item" data-id="' + n.id + '" style="padding:12px 16px;border-bottom:1px solid #f1f5f9;cursor:pointer;" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'\'">';
      html += '<div style="font-size:12px;font-weight:700;color:#374151;">' + label + '</div>';
      html += '<div style="font-size:13px;color:#374151;margin:4px 0;">' + esc(n.campagneTitre || '') + '</div>';
      if (n.statutReponse) html += '<div style="font-size:12px;font-weight:700;color:#0f766e;margin:2px 0;">' + esc(n.statutReponse) + '</div>';
      if (n.message) html += '<div style="font-size:12.5px;color:#374151;margin:3px 0;white-space:pre-wrap;background:#f1f5f9;border-radius:6px;padding:6px 8px;">' + esc(n.message) + '</div>';
      if (n.auteur) html += '<div style="font-size:11px;color:#64748b;">par ' + esc(n.auteur) + '</div>';
      if (n.zone) html += '<div style="font-size:11px;color:#64748b;">Zone : ' + esc(n.zone) + (n.marche ? ' — ' + esc(n.marche) : '') + (n.dateFin ? ' — Fin : ' + esc(n.dateFin) : '') + '</div>';
      html += '<div style="font-size:11px;color:#94a3b8;margin-top:4px;">' + date + '</div>';
      html += '</div>';
    });
    list.innerHTML = html;

    list.querySelectorAll('.notif-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var id = el.getAttribute('data-id');
        var notif = allNotifs.filter(function (n) { return n.id === id; })[0];
        var updated = allNotifs.map(function (n) { if (n.id === id) n.lu = true; return n; });
        function go() {
          if (notif && notif.campagneId) {
            window.location.href = detailsHref() + '?name=' + encodeURIComponent(notif.campagneId);
          } else if (notif && notif.type === 'zone_conflit_attente') {
            window.location.href = comiteHref();
          } else {
            var me = currentUserName();
            var mineNow = updated.filter(function (n) { return n.destinataire === me && !n.lu; });
            renderNotifications(mineNow, updated, rootHandle);
            if (notif && notif.type === 'signalement_reponse') openSignalementModal(notif);
          }
        }
        if (rootHandle) {
          writeNotifications(updated, rootHandle).then(go).catch(function (err) { notify('La notification n\'a pas pu être marquée comme lue : ' + err.message, 'error'); go(); });
        } else { go(); }
      });
    });
  }
  function wireNotifications() {
    var bell = $('topbar-notif-bell');
    if (bell) {
      bell.addEventListener('click', function (e) {
        e.stopPropagation();
        var p = $('topbar-notif-panel'); if (p) p.style.display = p.style.display === 'none' ? 'block' : 'none';
        // Un clic est un vrai geste utilisateur : c'est le meilleur moment pour
        // demander l'autorisation d'afficher des notifications système si ce
        // n'est pas déjà fait (Chrome bloque parfois la demande hors interaction).
        _ensureNotifPermission();
      });
      document.addEventListener('click', function () { var p = $('topbar-notif-panel'); if (p) p.style.display = 'none'; });
    }
    _ensureNotifPermission();
    pollNotifications();
    // Interrogation périodique : détecte l'arrivée de nouvelles notifications
    // (pour le son / pop-up), sans recharger la page. Une seule fois.
    if (!wireNotifications._timer) {
      wireNotifications._timer = setInterval(pollNotifications, 60000);
    }
  }
  function pollNotifications() {
    var ds = IM.directoryStorage, u = currentUser();
    if (!ds || !u) { renderNotifications([], [], null); return; }
    ds.getRootHandleWithCheck().then(function (res) {
      if (res.status !== 'success') { renderNotifications([], [], null); return; }
      var root = res.handle;
      root.getFileHandle(NOTIF_FILE, { create: false }).then(function (fh) { return fh.getFile(); }).then(function (f) { return f.text(); })
        .then(function (txt) {
          var all = JSON.parse(txt);
          var mine = all.filter(function (n) { return n.destinataire === u.name && !n.lu; });
          _alertOnNewNotifications(mine);
          renderNotifications(mine, all, root);
        })
        .catch(function () { renderNotifications([], [], null); });
    }).catch(function () { renderNotifications([], [], null); });
  }

  // ── Alerte (son + pop-up) à l'arrivée de nouvelles notifications ──────────
  // Suivi PERSISTANT (localStorage, par utilisateur) des notifications déjà
  // signalées : contrairement à un simple compteur en mémoire, il survit à la
  // navigation entre pages (chaque page recharge entièrement ce script) et ne
  // se laisse pas tromper par un compteur qui redescend (marquage lu ailleurs).
  function _seenNotifKey() { return 'im_notif_seen_' + (currentUserName() || 'anon'); }
  function _loadSeenIds() {
    try { return new Set(JSON.parse(localStorage.getItem(_seenNotifKey()) || '[]')); }
    catch (e) { return new Set(); }
  }
  function _saveSeenIds(set) {
    try {
      var arr = Array.from(set);
      if (arr.length > 300) arr = arr.slice(arr.length - 300); // borne la taille
      localStorage.setItem(_seenNotifKey(), JSON.stringify(arr));
    } catch (e) {}
  }
  // Détecte les notifications réellement NOUVELLES depuis le dernier contrôle
  // et déclenche son/pop-up (réglables en Administration). Le tout premier
  // contrôle d'un chargement de page « amorce » juste le suivi, sans alerter
  // (évite une salve d'alertes pour des notifications déjà en attente).
  function _alertOnNewNotifications(mine) {
    var seen = _loadSeenIds();
    var isFirstCheck = !_alertOnNewNotifications._done;
    _alertOnNewNotifications._done = true;
    var fresh = mine.filter(function (n) { return n.id && !seen.has(n.id); });
    mine.forEach(function (n) { if (n.id) seen.add(n.id); });
    _saveSeenIds(seen);
    if (isFirstCheck || !fresh.length) return;

    var _st = (IM.config && IM.config.APP_SETTINGS) || {};
    if (_st.notifSound !== false) _notifBeep();
    if (_st.notifPopup !== false) {
      var typeLabels = (IM.config && IM.config.NOTIFICATION_LABELS) || {};
      fresh.forEach(function (n) {
        var title = typeLabels[n.type] || '🔔 Nouvelle notification';
        var body = (n.campagneTitre ? n.campagneTitre + ' — ' : '') + (n.message || '');
        if (!_showNativeNotification(title, body)) notify(title + (body ? ' : ' + body : ''), 'info', 4000);
      });
    }
  }
  // Demande l'autorisation d'afficher des notifications système (une fois).
  function _ensureNotifPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      try { Notification.requestPermission(); } catch (e) {}
    }
  }
  // Notification système : rendue par l'OS (bas-droite sous Windows, coin
  // d'écran sous macOS), visible même fenêtre réduite/en arrière-plan — tant
  // que le navigateur reste ouvert. Renvoie false si indisponible/refusée
  // (repli sur le toast in-page dans ce cas).
  function _showNativeNotification(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return false;
    try {
      var n = new Notification(title, { body: body, tag: 'impulsion-' + Date.now(), silent: false });
      n.onclick = function () { try { window.focus(); } catch (e) {} n.close(); };
      setTimeout(function () { try { n.close(); } catch (e) {} }, 12000);
      return true;
    } catch (e) { return false; }
  }
  // Carillon deux notes, nettement audible (aucun fichier externe — compatible file://).
  function _notifBeep() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
      function tone(freq, startAt, dur, peak) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
        g.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + startAt + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(ctx.currentTime + startAt);
        o.stop(ctx.currentTime + startAt + dur + 0.02);
      }
      tone(880, 0, 0.16, 0.28);
      tone(1175, 0.15, 0.22, 0.28);
      setTimeout(function () { try { ctx.close(); } catch (e) {} }, 900);
    } catch (e) {}
  }

  // ── Montage ──
  function mount(opts) {
    opts = opts || {};
    var host = (opts.mount && $(opts.mount)) || document.querySelector('header.top-header');
    if (!host) return;
    if (!host.classList.contains('top-header')) host.classList.add('top-header');
    host.innerHTML = headerHtml(opts);
    wireSearch();
    wireRefresh();
    wireWhatsNew();
    wireNotifications();
    mountSidebarUser();
  }

  IM.topbar = { mount: mount, mountSidebarUser: mountSidebarUser };
})();
