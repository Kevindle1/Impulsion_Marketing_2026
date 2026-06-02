/**
 * Sélecteur d'utilisateur flottant — Impulsion Marketing
 * Injecte automatiquement un sélecteur dans chaque page
 * Dépend de users-standalone.js
 */

(function () {
  'use strict';

  function init() {
    var users = window.ImpulsionMarketing && window.ImpulsionMarketing.users;
    if (!users) {
      console.warn('user-selector: users-standalone.js non chargé');
      return;
    }

    injectStyles();
    injectWidget(users);
  }

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '#im-user-selector {',
      '  position: fixed;',
      '  bottom: 20px;',
      '  left: 16px;',
      '  z-index: 9999;',
      '  font-family: inherit;',
      '}',
      '#im-user-pill {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  background: #308276;',
      '  color: #fff;',
      '  border: none;',
      '  border-radius: 24px;',
      '  padding: 8px 16px;',
      '  font-size: 13px;',
      '  font-weight: 600;',
      '  cursor: pointer;',
      '  box-shadow: 0 2px 8px rgba(0,0,0,0.25);',
      '  transition: background 0.2s;',
      '  white-space: nowrap;',
      '}',
      '#im-user-pill:hover { background: #245f56; }',
      '#im-user-pill .im-chevron {',
      '  font-size: 10px;',
      '  transition: transform 0.2s;',
      '}',
      '#im-user-pill.open .im-chevron { transform: rotate(180deg); }',
      '#im-user-dropdown {',
      '  position: absolute;',
      '  bottom: calc(100% + 8px);',
      '  left: 0;',
      '  background: #fff;',
      '  border: 1px solid #e0e0e0;',
      '  border-radius: 12px;',
      '  box-shadow: 0 4px 20px rgba(0,0,0,0.15);',
      '  min-width: 220px;',
      '  max-height: 360px;',
      '  overflow-y: auto;',
      '  display: none;',
      '  padding: 8px 0;',
      '}',
      '#im-user-dropdown.open { display: block; }',
      '.im-role-group-label {',
      '  padding: 8px 16px 4px;',
      '  font-size: 11px;',
      '  font-weight: 700;',
      '  color: #888;',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.5px;',
      '}',
      '.im-user-option {',
      '  padding: 8px 16px;',
      '  cursor: pointer;',
      '  font-size: 13px;',
      '  color: #333;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  transition: background 0.1s;',
      '}',
      '.im-user-option:hover { background: #f0faf8; }',
      '.im-user-option.selected {',
      '  background: #e8f5f2;',
      '  color: #308276;',
      '  font-weight: 600;',
      '}',
      '.im-no-user-warning {',
      '  animation: im-pulse 2s infinite;',
      '  background: #e67e22 !important;',
      '}',
      '@keyframes im-pulse {',
      '  0%,100% { opacity: 1; }',
      '  50% { opacity: 0.7; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function getRoleIcon(role) {
    var icons = { superadmin: '⭐', manager: '👔', com: '🎨', ebf: '🖨️', data: '📊', marketing: '📋' };
    return icons[role] || '👤';
  }

  function getRoleOrder() {
    return ['superadmin', 'manager', 'marketing', 'com', 'ebf', 'data'];
  }

  function injectWidget(users) {
    var currentUser = users.getCurrentUser();

    var container = document.createElement('div');
    container.id = 'im-user-selector';

    // Pill button
    var pill = document.createElement('button');
    pill.id = 'im-user-pill';
    if (!currentUser) pill.classList.add('im-no-user-warning');

    var pillText = currentUser
      ? getRoleIcon(currentUser.role) + ' ' + currentUser.name + ' (' + currentUser.roleLabel + ')'
      : '👤 Choisir un utilisateur';

    pill.innerHTML = '<span>' + pillText + '</span><span class="im-chevron">▲</span>';

    // Dropdown
    var dropdown = document.createElement('div');
    dropdown.id = 'im-user-dropdown';

    // Grouper par rôle
    var roleOrder = getRoleOrder();
    var grouped = {};
    users.USERS.forEach(function (u) {
      if (!grouped[u.role]) grouped[u.role] = [];
      grouped[u.role].push(u);
    });

    var roleLabels = {
      superadmin: 'Super Admin',
      manager: 'Managers',
      marketing: 'Marketing / PO',
      com: 'Communication',
      ebf: 'EBF',
      data: 'Data'
    };

    roleOrder.forEach(function (role) {
      if (!grouped[role] || grouped[role].length === 0) return;

      var label = document.createElement('div');
      label.className = 'im-role-group-label';
      label.textContent = roleLabels[role] || role;
      dropdown.appendChild(label);

      grouped[role].forEach(function (u) {
        var opt = document.createElement('div');
        opt.className = 'im-user-option';
        if (currentUser && currentUser.name === u.name) opt.classList.add('selected');
        opt.innerHTML = getRoleIcon(u.role) + ' ' + u.name;
        opt.addEventListener('click', function () {
          users.setCurrentUser(u.name);
          location.reload();
        });
        dropdown.appendChild(opt);
      });
    });

    container.appendChild(dropdown);
    container.appendChild(pill);

    pill.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.toggle('open');
      pill.classList.toggle('open', isOpen);
    });

    document.addEventListener('click', function () {
      dropdown.classList.remove('open');
      pill.classList.remove('open');
    });

    document.body.appendChild(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
