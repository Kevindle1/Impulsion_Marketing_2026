/**
 * Gestionnaire des Utilisateurs — Impulsion Marketing
 * Liste fixe des utilisateurs avec leurs rôles + persistance localStorage
 */

window.ImpulsionMarketing = window.ImpulsionMarketing || {};

window.ImpulsionMarketing.users = (function () {
  'use strict';

  var STORAGE_KEY = 'im_current_user';

  // La liste des personnes vit dans _config.json (source unique). Aucun utilisateur
  // n'est codé en dur : on hydrate depuis le cache local du dernier _config.json chargé
  // (rempli par adminConfig), puis applyUsers() la rafraîchit depuis le fichier V://.
  var USERS = (function () {
    try {
      var c = JSON.parse(localStorage.getItem('im_config_cache') || '{}') || {};
      return Array.isArray(c.users) ? c.users.map(function (u) { return Object.assign({}, u); }) : [];
    } catch (e) { return []; }
  })();

  var DEFAULT_USERS = USERS.map(function (u) { return Object.assign({}, u); });

  // Remplace la liste des utilisateurs EN PLACE (la référence USERS reste valable
  // pour tous les consommateurs). Utilisé pour surcharger depuis _config.json.
  function applyUsers(arr) {
    if (!Array.isArray(arr)) return;
    var clean = arr.filter(function (u) { return u && u.name && u.role; });
    if (!clean.length) return;
    USERS.splice.apply(USERS, [0, USERS.length].concat(clean));
  }

  // Droit d'accès à l'espace Administration : managers, super admin, ou Kévin Dolie.
  function canAccessAdmin() {
    var u = getCurrentUser();
    return !!(u && (u.isManager === true || u.isSuperAdmin === true || u.name === 'Kévin Dolie'));
  }

  /**
   * Retourne l'utilisateur courant depuis localStorage
   * @returns {{ name: string, role: string, roleLabel: string } | null}
   */
  function getCurrentUser() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        // Vérifier que l'utilisateur existe toujours dans la liste (nom + rôle pour éviter les homonymes)
        var found = USERS.find(function (u) { return u.name === parsed.name && u.role === parsed.role; });
        if (!found) found = USERS.find(function (u) { return u.name === parsed.name; });
        return found || null;
      }
    } catch (e) {}
    return null;
  }

  /**
   * Définit l'utilisateur courant
   * @param {string} name
   */
  function setCurrentUser(name) {
    var user = USERS.find(function (u) { return u.name === name; });
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }

  /**
   * Retourne les utilisateurs d'un rôle donné
   * @param {string} role
   * @returns {Array}
   */
  function getUsersByRole(role) {
    return USERS.filter(function (u) { return u.role === role; });
  }

  /**
   * Vérifie si l'utilisateur courant est le PO de la campagne
   * @param {Object} campaignData
   * @returns {boolean}
   */
  function isCurrentUserSuperAdmin() {
    var user = getCurrentUser();
    return !!(user && user.isSuperAdmin === true);
  }

  function isCurrentUserPO(campaignData) {
    var user = getCurrentUser();
    if (!user || !campaignData) return false;
    // Le super admin peut effectuer les actions PO sur n'importe quelle campagne
    if (user.isSuperAdmin) return true;
    return user.name === (campaignData.po || '');
  }

  /**
   * Vérifie si l'utilisateur courant est responsable de service (isManager: true)
   * @returns {boolean}
   */
  function isCurrentUserManager() {
    var user = getCurrentUser();
    return !!(user && user.isManager === true);
  }

  /**
   * Vérifie si l'utilisateur courant est manager d'un rôle précis (com/ebf/data)
   * @param {string} role
   * @returns {boolean}
   */
  function isCurrentUserTeamManager(role) {
    var user = getCurrentUser();
    // Super admin a les droits manager de toutes les équipes
    if (user && user.isSuperAdmin) return true;
    return !!(user && user.isManager === true && user.role === role);
  }

  return {
    USERS: USERS,
    DEFAULT_USERS: DEFAULT_USERS,
    applyUsers: applyUsers,
    canAccessAdmin: canAccessAdmin,
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    getUsersByRole: getUsersByRole,
    isCurrentUserPO: isCurrentUserPO,
    isCurrentUserManager: isCurrentUserManager,
    isCurrentUserTeamManager: isCurrentUserTeamManager,
    isCurrentUserSuperAdmin: isCurrentUserSuperAdmin,
  };
})();
