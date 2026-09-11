/**
 * bundle.js — FICHIER GÉNÉRÉ. NE PAS ÉDITER À LA MAIN.
 * Régénérer avec : npm run build (concatène les js/*-standalone.js).
 */
/**
 * Configuration Globale et Constantes (Version Standalone - Sans Modules ES6)
 * Interface Impulsion Marketing
 *
 * Ce fichier centralise toutes les constantes, listes de choix et configuration
 * Version sans modules ES6 pour fonctionner avec file://
 */

// Créer le namespace global si nécessaire
window.ImpulsionMarketing = window.ImpulsionMarketing || {};

// Configuration globale
window.ImpulsionMarketing.config = (function() {
  'use strict';

  // ========================================
  // Données pilotées par _config.json (SOURCE UNIQUE)
  // ========================================
  // Aucune donnée métier n'est codée en dur ici. Les listes ci-dessous sont
  // hydratées depuis le cache local du dernier _config.json chargé (rempli par
  // adminConfig), puis rafraîchies depuis le fichier V:// via adminConfig.reload().
  var _cfgCache = {};
  try { _cfgCache = JSON.parse(localStorage.getItem('im_config_cache') || '{}') || {}; } catch (e) { _cfgCache = {}; }
  function _arr(k) { return Array.isArray(_cfgCache[k]) ? _cfgCache[k].slice() : []; }
  function _flattenSeg(groups) {
    var out = [];
    (groups || []).forEach(function (g) { (g && g.items || []).forEach(function (it) { if (it && it.value) out.push(it.value); }); });
    return out;
  }

  // ========================================
  // Configuration Générale
  // ========================================

  const APP_NAME = 'Interface Impulsion Marketing';
  const APP_VERSION = '2.0.0';
  const DEFAULT_ROOT_PATH = (_cfgCache.settings && _cfgCache.settings.defaultRootPath) || '';
  const GABARIT_MODEL_PATH = 'Gabarit Model';

  // ========================================
  // Limites et Contraintes
  // ========================================

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
  const MAX_FILENAME_LENGTH = 255;
  const MAX_DESCRIPTION_LENGTH = 10000;
  const SCAN_TIMEOUT = 30000; // 30 secondes

  // ========================================
  // Types de Fichiers Autorisés
  // ========================================

  const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const ALLOWED_DOCUMENT_TYPES = ['pdf', 'html', 'htm'];
  const ALLOWED_ASSET_TYPES = ['css', 'js', 'json', 'svg', 'woff', 'woff2', 'ttf', 'eot'];

  // ========================================
  // Segments
  // ========================================

  // Liste à plat (dérivée des groupes) — utilisée par les filtres.
  const SEGMENTS = _flattenSeg(_cfgCache.segmentsGroups);

  // Segments organisés par groupe (Particuliers / Pro / Agri) avec libellé d'affichage.
  // Source : _config.json (clé segmentsGroups), éditable via l'espace Administration.
  const SEGMENTS_GROUPS = Array.isArray(_cfgCache.segmentsGroups) ? JSON.parse(JSON.stringify(_cfgCache.segmentsGroups)) : [];

  // ========================================
  // Univers de Besoins (UBs)
  // ========================================

  const UNIVERS_BESOINS = _arr('universBesoins');

  // ========================================
  // Canaux de Communication
  // ========================================

  const CANAUX = _arr('canaux');

  // ========================================
  // Types de Communication
  // ========================================

  // Nature de la communication. Le périmètre Caisse/Natio est porté séparément
  // par le champ « Typologie de communication » (Création Caisse / Reprise Natio).
  const TYPES_COM = _arr('typesCom');

  // ========================================
  // Typologies de Campagne
  // ========================================

  const TYPOLOGIES = _arr('typologies');

  // ========================================
  // Produits (liste de référence, configurable en Administration)
  // ========================================

  const PRODUITS = _arr('produits');

  // ========================================
  // Marchés
  // ========================================

  const MARCHES = _arr('marches');

  // ========================================
  // Marchés « site web » (matrice du Comité éditorial)
  // ========================================

  // Liste {value,label} — pilote les onglets marché et les cases à cocher
  // « Marché(s) » du planning site web (pages/comite-editorial.html, pages/campaign.html).
  // Source : _config.json (clé marchesSiteWeb), éditable via l'espace Administration.
  const MARCHES_SITE_WEB = Array.isArray(_cfgCache.marchesSiteWeb) ? JSON.parse(JSON.stringify(_cfgCache.marchesSiteWeb)) : [];

  // ========================================
  // Récurrences
  // ========================================

  const RECURRENCES = _arr('recurrences');

  // ========================================
  // Numéros de Lot
  // ========================================

  const LOTS = _arr('lots');

  // ========================================
  // Workflow (Administration ▸ Workflow)
  // ========================================

  // Étapes du workflow canal (libellé/acteur/ordre) — surcharge de la base
  // codée dans js/workflow-standalone.js. Source : _config.json workflow.steps.
  const WORKFLOW_STEPS = (_cfgCache.workflow && Array.isArray(_cfgCache.workflow.steps)) ? JSON.parse(JSON.stringify(_cfgCache.workflow.steps)) : [];
  // Applicabilité des étapes par canal : { "<canal>": ["stepId", ...] }. Un
  // canal absent de cet objet applique toutes les étapes (repli sûr par défaut).
  // Source : _config.json workflow.canalSteps.
  const CANAL_STEPS = (_cfgCache.workflow && _cfgCache.workflow.canalSteps && typeof _cfgCache.workflow.canalSteps === 'object') ? JSON.parse(JSON.stringify(_cfgCache.workflow.canalSteps)) : {};
  // Acteur exceptionnel par canal : { "<canal>": { "<stepId>": "<acteur>" } }.
  // N'affecte que QUI peut agir sur l'étape pour ce canal (pas le déblocage).
  // Source : _config.json workflow.canalActorOverrides.
  const CANAL_ACTOR_OVERRIDES = (_cfgCache.workflow && _cfgCache.workflow.canalActorOverrides && typeof _cfgCache.workflow.canalActorOverrides === 'object') ? JSON.parse(JSON.stringify(_cfgCache.workflow.canalActorOverrides)) : {};

  // ========================================
  // Champs personnalisés (Administration ▸ Champs personnalisés)
  // ========================================

  // { "<point d'attache>": [ { id, label, type, ... }, ... ] } — points d'attache :
  // les 12 étapes du workflow (mêmes id que WORKFLOW_STEPS) + 'creation.step1' /
  // 'creation.step2' / 'creation.step3' / 'creation.step3.canal' (formulaire de
  // création). Absent/vide = aucun champ personnalisé (repli sûr par défaut).
  // Source : _config.json customFields.
  const CUSTOM_FIELDS = (_cfgCache.customFields && typeof _cfgCache.customFields === 'object') ? JSON.parse(JSON.stringify(_cfgCache.customFields)) : {};

  // ========================================
  // Autres données pilotées par _config.json (objets/listes mutés en place par adminConfig)
  // ========================================
  const APP_SETTINGS     = (_cfgCache.settings && typeof _cfgCache.settings === 'object') ? _cfgCache.settings : {};
  const ROLE_COLORS      = (_cfgCache.roleColors && typeof _cfgCache.roleColors === 'object') ? _cfgCache.roleColors : {};
  // Libellés affichés des rôles (marketing/com/ebf/data/superadmin) — les CLÉS de rôle
  // restent fixes (structurelles au moteur de workflow), seuls les libellés sont
  // éditables via Administration ▸ Paramètres généraux ▸ Rôles.
  const ROLE_LABELS      = (_cfgCache.roleLabels && typeof _cfgCache.roleLabels === 'object') ? _cfgCache.roleLabels : {};
  const WEB_ZONES        = (_cfgCache.webZones && typeof _cfgCache.webZones === 'object') ? _cfgCache.webZones : { zones: [], bpOnlyZones: [], zonesMulti: {} };
  const REPONSE_STATUTS  = Array.isArray(_cfgCache.reponseStatuts) ? _cfgCache.reponseStatuts.slice() : [];
  const WHATSNEW_BADGES  = (_cfgCache.whatsnewBadges && typeof _cfgCache.whatsnewBadges === 'object') ? _cfgCache.whatsnewBadges : {};
  const BILAN            = (_cfgCache.bilan && typeof _cfgCache.bilan === 'object') ? _cfgCache.bilan : {};
  const COM_TYPOLOGIES   = _arr('comTypologies');
  const NOTIFICATION_LABELS = (_cfgCache.notificationLabels && typeof _cfgCache.notificationLabels === 'object') ? _cfgCache.notificationLabels : {};
  const AUTO_ASSIGN_RULES = Array.isArray(_cfgCache.autoAssignRules) ? _cfgCache.autoAssignRules.slice() : [];

  // ========================================
  // Valeurs Oui/Non
  // ========================================

  const OUI_NON = [
    "Oui",
    "Non"
  ];

  // ========================================
  // Ranges pour Sélections Multiples
  // ========================================

  const NUM_SEGMENTS_RANGE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const NUM_UBS_RANGE = [1, 2, 3, 4, 5, 6, 7, 8];
  const NUM_CHANNELS_RANGE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // ========================================
  // Messages d'Erreur Standards
  // ========================================

  const ERROR_MESSAGES = {
    BROWSER_NOT_SUPPORTED: "Navigateur incompatible. Veuillez utiliser Chrome ou Edge.",
    NO_ROOT_SELECTED: "Aucun dossier racine sélectionné.",
    PERMISSION_DENIED: "Permission refusée. Veuillez autoriser l'accès au dossier.",
    FILE_TOO_LARGE: `Fichier trop volumineux. Taille maximale : ${MAX_FILE_SIZE / 1024 / 1024} MB`,
    INVALID_FILENAME: "Nom de fichier invalide.",
    CAMPAIGN_EXISTS: "Une campagne avec ce nom existe déjà.",
    REQUIRED_FIELDS: "Veuillez remplir tous les champs obligatoires.",
    INVALID_DATE_RANGE: "La date d'instantiation doit être antérieure à la date de lancement.",
    INVALID_URL: "URL invalide. Format attendu : https://...",
    NETWORK_ERROR: "Erreur réseau. Vérifiez votre connexion.",
    FILE_NOT_FOUND: "Fichier introuvable.",
    DIRECTORY_NOT_FOUND: "Dossier introuvable.",
    JSON_PARSE_ERROR: "Erreur lors de la lecture du fichier JSON.",
    UNEXPECTED_ERROR: "Une erreur inattendue s'est produite."
  };

  // ========================================
  // Messages de Succès Standards
  // ========================================

  const SUCCESS_MESSAGES = {
    CAMPAIGN_CREATED: "Campagne créée avec succès !",
    CAMPAIGN_UPDATED: "Campagne mise à jour avec succès !",
    DELIVERABLE_CREATED: "Livrable créé avec succès !",
    DELIVERABLE_UPDATED: "Livrable mis à jour avec succès !",
    FILES_UPLOADED: "Fichiers uploadés avec succès !",
    COPIED_TO_CLIPBOARD: "Copié dans le presse-papiers !"
  };

  // ========================================
  // Paramètres UI
  // ========================================

  const UI_CONFIG = {
    LOADER_DEFAULT_TEXT: "Traitement en cours...",
    NOTIFICATION_DURATION: 5000, // ms
    THEME_TRANSITION_DURATION: 300, // ms
    DEBOUNCE_SEARCH_DELAY: 300, // ms
    MODAL_ANIMATION_DURATION: 300 // ms
  };

  // ========================================
  // Helpers pour génération de sélecteurs HTML
  // ========================================

  /**
   * Génère les options HTML pour un sélecteur
   * @param {string[]} items - Liste d'items
   * @param {string} placeholder - Texte placeholder optionnel
   * @returns {string} HTML des options
   */
  function generateOptions(items, placeholder) {
    placeholder = placeholder || 'Choisir...';
    let html = '<option value="">' + placeholder + '</option>';
    items.forEach(function(item) {
      html += '<option value="' + item + '">' + item + '</option>';
    });
    return html;
  }

  /**
   * Génère les options HTML pour un range numérique
   * @param {number[]} range - Array de nombres
   * @returns {string} HTML des options
   */
  function generateRangeOptions(range) {
    let html = '';
    range.forEach(function(num) {
      html += '<option value="' + num + '">' + num + '</option>';
    });
    return html;
  }

  /**
   * Génère les radio buttons HTML
   * @param {string} name - Nom du groupe radio
   * @param {Array} values - Valeurs
   * @returns {string} HTML des radios
   */
  function generateRadios(name, values) {
    let html = '';
    values.forEach(function(value) {
      html += '<label><input type="radio" name="' + name + '" value="' + value + '">' + value + '</label>';
    });
    return html;
  }

  // ========================================
  // Validation Helpers
  // ========================================

  /**
   * Vérifie si une valeur fait partie d'une liste autorisée
   * @param {string} value - Valeur à vérifier
   * @param {string[]} allowedValues - Valeurs autorisées
   * @returns {boolean}
   */
  function isValidChoice(value, allowedValues) {
    return allowedValues.indexOf(value) !== -1;
  }

  /**
   * Vérifie si un type de fichier est autorisé
   * @param {string} filename - Nom du fichier
   * @param {string} category - 'image', 'document', ou 'asset'
   * @returns {boolean}
   */
  function isAllowedFileType(filename, category) {
    category = category || 'image';
    const ext = filename.split('.').pop().toLowerCase();

    switch (category) {
      case 'image':
        return ALLOWED_IMAGE_TYPES.indexOf(ext) !== -1;
      case 'document':
        return ALLOWED_DOCUMENT_TYPES.indexOf(ext) !== -1;
      case 'asset':
        return ALLOWED_ASSET_TYPES.indexOf(ext) !== -1;
      default:
        return false;
    }
  }

  // ========================================
  // API Publique
  // ========================================

  return {
    // Constantes
    APP_NAME: APP_NAME,
    APP_VERSION: APP_VERSION,
    DEFAULT_ROOT_PATH: DEFAULT_ROOT_PATH,
    GABARIT_MODEL_PATH: GABARIT_MODEL_PATH,
    MAX_FILE_SIZE: MAX_FILE_SIZE,
    MAX_FILENAME_LENGTH: MAX_FILENAME_LENGTH,
    MAX_DESCRIPTION_LENGTH: MAX_DESCRIPTION_LENGTH,
    SCAN_TIMEOUT: SCAN_TIMEOUT,

    // Listes
    ALLOWED_IMAGE_TYPES: ALLOWED_IMAGE_TYPES,
    ALLOWED_DOCUMENT_TYPES: ALLOWED_DOCUMENT_TYPES,
    ALLOWED_ASSET_TYPES: ALLOWED_ASSET_TYPES,
    SEGMENTS: SEGMENTS,
    SEGMENTS_GROUPS: SEGMENTS_GROUPS,
    UNIVERS_BESOINS: UNIVERS_BESOINS,
    CANAUX: CANAUX,
    TYPES_COM: TYPES_COM,
    TYPOLOGIES: TYPOLOGIES,
    PRODUITS: PRODUITS,
    MARCHES: MARCHES,
    MARCHES_SITE_WEB: MARCHES_SITE_WEB,
    RECURRENCES: RECURRENCES,
    LOTS: LOTS,
    // Données pilotées par _config.json
    APP_SETTINGS: APP_SETTINGS,
    ROLE_COLORS: ROLE_COLORS,
    ROLE_LABELS: ROLE_LABELS,
    WORKFLOW_STEPS: WORKFLOW_STEPS,
    CANAL_STEPS: CANAL_STEPS,
    CANAL_ACTOR_OVERRIDES: CANAL_ACTOR_OVERRIDES,
    CUSTOM_FIELDS: CUSTOM_FIELDS,
    WEB_ZONES: WEB_ZONES,
    REPONSE_STATUTS: REPONSE_STATUTS,
    WHATSNEW_BADGES: WHATSNEW_BADGES,
    BILAN: BILAN,
    COM_TYPOLOGIES: COM_TYPOLOGIES,
    NOTIFICATION_LABELS: NOTIFICATION_LABELS,
    AUTO_ASSIGN_RULES: AUTO_ASSIGN_RULES,
    OUI_NON: OUI_NON,
    NUM_SEGMENTS_RANGE: NUM_SEGMENTS_RANGE,
    NUM_UBS_RANGE: NUM_UBS_RANGE,
    NUM_CHANNELS_RANGE: NUM_CHANNELS_RANGE,

    // Messages
    ERROR_MESSAGES: ERROR_MESSAGES,
    SUCCESS_MESSAGES: SUCCESS_MESSAGES,
    UI_CONFIG: UI_CONFIG,

    // Fonctions
    generateOptions: generateOptions,
    generateRangeOptions: generateRangeOptions,
    generateRadios: generateRadios,
    isValidChoice: isValidChoice,
    isAllowedFileType: isAllowedFileType
  };
})();
/**
 * Module de Sécurité (Version Standalone - Sans Modules ES6)
 * Interface Impulsion Marketing
 *
 * Ce module fournit des fonctions de sécurité pour prévenir les attaques XSS,
 * valider les URLs et sanitizer les données utilisateur.
 */

// Créer le namespace global si nécessaire
window.ImpulsionMarketing = window.ImpulsionMarketing || {};

// Module de sécurité
window.ImpulsionMarketing.security = (function() {
  'use strict';

  /**
   * Échappe les caractères HTML pour prévenir les attaques XSS
   * @param {string} text - Texte à échapper
   * @returns {string} Texte échappé
   */
  function escapeHtml(text) {
    if (text === null || text === undefined) {
      return '';
    }

    var div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  /**
   * Valide une URL pour s'assurer qu'elle est sûre
   * @param {string} urlString - URL à valider
   * @param {Object} options - Options de validation
   * @returns {boolean} true si l'URL est valide
   */
  function isValidUrl(urlString, options) {
    options = options || {};
    var allowHttp = options.allowHttp || false;

    if (!urlString || typeof urlString !== 'string') {
      return false;
    }

    try {
      var url = new URL(urlString);

      // Vérifier le protocole
      if (url.protocol === 'https:') {
        return true;
      }

      if (url.protocol === 'http:' && allowHttp) {
        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Sanitize un nom de fichier pour le rendre sûr
   * @param {string} filename - Nom de fichier à sanitizer
   * @param {number} maxLength - Longueur maximale (défaut: 255)
   * @returns {string} Nom de fichier sécurisé
   */
  function sanitizeFilename(filename, maxLength) {
    maxLength = maxLength || 255;

    if (!filename || typeof filename !== 'string') {
      return 'unnamed';
    }

    // Supprimer les caractères invalides pour les systèmes de fichiers
    var sanitized = filename.replace(/[<>:"|?*\\\/()\[\]{}]/g, '_');

    // Supprimer les caractères de contrôle
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

    // Limiter la longueur
    sanitized = sanitized.substring(0, maxLength);

    // Supprimer les espaces au début/fin
    sanitized = sanitized.trim();

    // Remplacer espaces multiples par un seul
    sanitized = sanitized.replace(/\s+/g, ' ');

    // S'assurer qu'il n'est pas vide
    return sanitized || 'unnamed';
  }

  /**
   * Crée un élément DOM de manière sécurisée avec du texte
   * @param {string} tagName - Nom de la balise
   * @param {string} text - Contenu texte
   * @param {string} className - Classes CSS optionnelles
   * @returns {HTMLElement} Élément créé
   */
  function createSafeElement(tagName, text, className) {
    var element = document.createElement(tagName);

    if (text !== null && text !== undefined) {
      element.textContent = text;
    }

    if (className) {
      element.className = className;
    }

    return element;
  }

  /**
   * Crée un fragment de document pour des insertions DOM optimisées et sécurisées
   * @param {Array} items - Tableau d'items à transformer en éléments
   * @param {Function} createElementFn - Fonction qui crée un élément pour chaque item
   * @returns {DocumentFragment} Fragment prêt à être inséré
   */
  function createSafeFragment(items, createElementFn) {
    var fragment = document.createDocumentFragment();

    items.forEach(function(item, index) {
      var element = createElementFn(item, index);
      if (element) {
        fragment.appendChild(element);
      }
    });

    return fragment;
  }

  /**
   * Valide et échappe une URL pour l'utiliser dans un attribut href
   * @param {string} urlString - URL à valider et échapper
   * @param {Object} options - Options de validation
   * @returns {string|null} URL échappée ou null si invalide
   */
  function getSafeUrl(urlString, options) {
    if (!isValidUrl(urlString, options)) {
      return null;
    }

    return escapeHtml(urlString);
  }

  /**
   * Valide un tableau d'URLs
   * @param {Array} urls - Tableau d'URLs à valider
   * @param {Object} options - Options de validation
   * @returns {Object} Résultat avec urls valides et invalides
   */
  function validateUrls(urls, options) {
    var result = {
      valid: [],
      invalid: [],
      allValid: true
    };

    if (!Array.isArray(urls)) {
      result.allValid = false;
      return result;
    }

    urls.forEach(function(url) {
      if (isValidUrl(url, options)) {
        result.valid.push(url);
      } else {
        result.invalid.push(url);
        result.allValid = false;
      }
    });

    return result;
  }

  /**
   * Crée un lien sécurisé (élément <a>)
   * @param {string} href - URL de destination
   * @param {string} text - Texte du lien
   * @param {Object} options - Options (target, rel, className)
   * @returns {HTMLElement|null} Élément <a> ou null si URL invalide
   */
  function createSafeLink(href, text, options) {
    options = options || {};

    if (!isValidUrl(href, options)) {
      return null;
    }

    var link = document.createElement('a');
    link.href = href;
    link.textContent = text || href;

    if (options.className) {
      link.className = options.className;
    }

    if (options.target) {
      link.target = options.target;
      // Toujours ajouter rel="noopener" pour les liens externes
      if (options.target === '_blank') {
        link.rel = options.rel || 'noopener noreferrer';
      }
    }

    return link;
  }

  /**
   * Nettoie les Blob URLs pour éviter les fuites mémoire
   */
  var BlobUrlManager = (function() {
    var urls = [];

    return {
      /**
       * Crée un Blob URL et l'enregistre pour nettoyage
       * @param {Blob} blob - Blob à convertir en URL
       * @returns {string} Blob URL
       */
      create: function(blob) {
        var url = URL.createObjectURL(blob);
        urls.push(url);
        return url;
      },

      /**
       * Révoque un Blob URL spécifique
       * @param {string} url - Blob URL à révoquer
       */
      revoke: function(url) {
        var index = urls.indexOf(url);
        if (index > -1) {
          URL.revokeObjectURL(url);
          urls.splice(index, 1);
        }
      },

      /**
       * Révoque tous les Blob URLs enregistrés
       */
      revokeAll: function() {
        urls.forEach(function(url) {
          URL.revokeObjectURL(url);
        });
        urls = [];
      },

      /**
       * Obtient le nombre de Blob URLs actifs
       * @returns {number}
       */
      getCount: function() {
        return urls.length;
      }
    };
  })();

  // Nettoyer automatiquement les Blob URLs avant déchargement de la page
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', function() {
      BlobUrlManager.revokeAll();
    });
  }

  // API Publique
  return {
    escapeHtml: escapeHtml,
    isValidUrl: isValidUrl,
    getSafeUrl: getSafeUrl,
    validateUrls: validateUrls,
    sanitizeFilename: sanitizeFilename,
    createSafeElement: createSafeElement,
    createSafeFragment: createSafeFragment,
    createSafeLink: createSafeLink,
    BlobUrlManager: BlobUrlManager
  };
})();
/**
 * Module de Gestion d'Erreurs (Version Standalone - Sans Modules ES6)
 * Interface Impulsion Marketing
 *
 * Ce module centralise la gestion des erreurs et les notifications utilisateur
 */

// Créer le namespace global si nécessaire
window.ImpulsionMarketing = window.ImpulsionMarketing || {};

// Module de gestion d'erreurs
window.ImpulsionMarketing.errors = (function() {
  'use strict';

  /**
   * Types d'erreurs communes
   */
  var ErrorTypes = {
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    FILE_NOT_FOUND: 'FILE_NOT_FOUND',
    DIRECTORY_NOT_FOUND: 'DIRECTORY_NOT_FOUND',
    ABORTED: 'ABORTED',
    QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
    NOT_READABLE: 'NOT_READABLE',
    SECURITY: 'SECURITY',
    CORRUPTED_FILE: 'CORRUPTED_FILE',
    INVALID_DATA: 'INVALID_DATA',
    NETWORK_ERROR: 'NETWORK_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNKNOWN: 'UNKNOWN'
  };

  /**
   * Messages d'erreur localisés — toujours en français, explicites, JAMAIS le
   * message brut d'une exception navigateur (souvent en anglais, ex.
   * DOMException). Tout le contenu utilisateur (toasts, bannières) doit
   * passer par getErrorMessage() plutôt que par error.message directement.
   */
  var ErrorMessages = {
    PERMISSION_DENIED: 'Accès refusé — autorisez l\'accès au dossier partagé pour continuer.',
    FILE_NOT_FOUND: 'Fichier introuvable — il a peut-être été déplacé, renommé ou supprimé.',
    DIRECTORY_NOT_FOUND: 'Dossier introuvable — il a peut-être été déplacé, renommé ou supprimé.',
    ABORTED: 'Opération annulée.',
    QUOTA_EXCEEDED: 'Espace disque insuffisant sur le dossier partagé.',
    NOT_READABLE: 'Le fichier n\'a pas pu être lu — il est peut-être ouvert dans un autre programme.',
    SECURITY: 'Accès bloqué par le navigateur pour des raisons de sécurité.',
    CORRUPTED_FILE: 'Le fichier est illisible ou corrompu.',
    INVALID_DATA: 'Données invalides.',
    NETWORK_ERROR: 'Erreur réseau — vérifiez votre connexion.',
    VALIDATION_ERROR: 'Erreur de validation.',
    UNKNOWN: 'Une erreur inattendue est survenue. Réessayez ; si le problème persiste, contactez le support.'
  };

  /**
   * Détermine le type d'erreur à partir d'une exception — d'abord par son
   * .name (fiable : c'est ainsi que le navigateur/File System Access API
   * distingue ses erreurs, quelle que soit la langue du message), en repli
   * sur des indices dans le .message pour les erreurs génériques.
   * @param {Error} error - Erreur à classifier
   * @returns {string} Type d'erreur
   */
  function classifyError(error) {
    if (!error) {
      return ErrorTypes.UNKNOWN;
    }

    var message = (error.message || '').toLowerCase();
    var name = error.name || '';

    // Erreurs File System Access API (identifiées par leur .name — stable,
    // indépendant de la langue du navigateur)
    if (name === 'NotFoundError') return ErrorTypes.FILE_NOT_FOUND;
    if (name === 'NotAllowedError') return ErrorTypes.PERMISSION_DENIED;
    if (name === 'AbortError') return ErrorTypes.ABORTED;
    if (name === 'QuotaExceededError') return ErrorTypes.QUOTA_EXCEEDED;
    if (name === 'NotReadableError' || name === 'NoModificationAllowedError') return ErrorTypes.NOT_READABLE;
    if (name === 'SecurityError') return ErrorTypes.SECURITY;
    if (name === 'SyntaxError') return ErrorTypes.CORRUPTED_FILE;

    if (message.indexOf('permission') !== -1) return ErrorTypes.PERMISSION_DENIED;
    if (message.indexOf('unexpected token') !== -1 || message.indexOf('json') !== -1) return ErrorTypes.CORRUPTED_FILE;

    // Erreurs réseau
    if (name === 'NetworkError' || message.indexOf('network') !== -1 || message.indexOf('fetch') !== -1) {
      return ErrorTypes.NETWORK_ERROR;
    }

    // Erreurs de validation
    if (message.indexOf('invalid') !== -1 || message.indexOf('validation') !== -1) {
      return ErrorTypes.VALIDATION_ERROR;
    }

    return ErrorTypes.UNKNOWN;
  }

  /**
   * Obtient un message d'erreur user-friendly
   * @param {Error} error - Erreur
   * @param {string} context - Contexte de l'erreur
   * @returns {string} Message formaté
   */
  function getErrorMessage(error, context) {
    var errorType = classifyError(error);
    var baseMessage = ErrorMessages[errorType] || ErrorMessages.UNKNOWN;

    if (context) {
      return context + ': ' + baseMessage;
    }

    return baseMessage;
  }

  /**
   * Logue une erreur dans la console avec contexte
   * @param {Error} error - Erreur à loguer
   * @param {string} context - Contexte de l'erreur
   * @param {Object} additionalInfo - Informations supplémentaires
   */
  function logError(error, context, additionalInfo) {
    var errorType = classifyError(error);
    var timestamp = new Date().toISOString();

    console.error(
      '[' + timestamp + '] [' + errorType + '] ' + (context || 'Error'),
      {
        error: error,
        message: error.message,
        stack: error.stack,
        context: context,
        additionalInfo: additionalInfo
      }
    );
  }

  /**
   * Gère une erreur (log + notification optionnelle)
   * @param {Error} error - Erreur à gérer
   * @param {string} context - Contexte de l'erreur
   * @param {Object} options - Options (showToUser, silent)
   */
  function handleError(error, context, options) {
    options = options || {};

    // Toujours loguer l'erreur
    logError(error, context, options.additionalInfo);

    // Afficher à l'utilisateur si demandé
    if (options.showToUser) {
      var message = getErrorMessage(error, context);
      showNotification(message, 'error');
    }

    // Callback personnalisé
    if (options.onError && typeof options.onError === 'function') {
      options.onError(error);
    }
  }

  /**
   * Affiche une notification à l'utilisateur
   * @param {string} message - Message à afficher
   * @param {string} type - Type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Durée en ms (défaut: 4000)
   */
  function showNotification(message, type, duration) {
    type = type || 'info';
    duration = duration || 4000;

    // Supprimer les notifications existantes du même type
    var existing = document.querySelectorAll('.app-notification.' + type);
    existing.forEach(function(el) {
      el.remove();
    });

    var colors = {
      success: '#4caf50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3'
    };

    var icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    var notification = document.createElement('div');
    notification.className = 'app-notification ' + type;
    notification.textContent = (icons[type] || '') + ' ' + message;

    notification.style.cssText =
      'position: fixed; ' +
      'top: 80px; ' +
      'right: 24px; ' +
      'padding: 16px 24px; ' +
      'background: ' + (colors[type] || colors.info) + '; ' +
      'color: white; ' +
      'border-radius: 8px; ' +
      'box-shadow: 0 4px 12px rgba(0,0,0,0.2); ' +
      'z-index: 10000; ' +
      'animation: slideIn 0.3s ease; ' +
      'font-weight: 500; ' +
      'max-width: 400px; ' +
      'word-wrap: break-word;';

    document.body.appendChild(notification);

    setTimeout(function() {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(function() {
        notification.remove();
      }, 300);
    }, duration);
  }

  /**
   * Affiche un message d'erreur dans un conteneur spécifique
   * @param {HTMLElement} container - Conteneur pour l'erreur
   * @param {string} message - Message d'erreur
   * @param {Object} options - Options (showHomeButton, homeUrl)
   */
  function showErrorInContainer(container, message, options) {
    options = options || {};

    var errorHtml = '<div style="background: #fee; border: 2px solid #fcc; color: #c00; padding: 20px; border-radius: 12px; text-align: center;">';
    errorHtml += '<h3>Erreur</h3>';
    errorHtml += '<p>' + (window.ImpulsionMarketing.security.escapeHtml(message) || message) + '</p>';

    if (options.showHomeButton) {
      var homeUrl = options.homeUrl || '../Impulsion-Marketing.html';
      errorHtml += '<a href="' + homeUrl + '" class="btn primary" style="margin-top: 16px; display: inline-block;">Retour à l\'accueil</a>';
    }

    errorHtml += '</div>';

    container.innerHTML = errorHtml;
    container.style.display = 'block';
  }

  /**
   * Enveloppe une Promise pour gérer automatiquement les erreurs
   * @param {Promise} promise - Promise à envelopper
   * @param {string} context - Contexte
   * @param {Object} options - Options de gestion d'erreur
   * @returns {Promise} Promise enveloppée
   */
  function wrapPromise(promise, context, options) {
    return promise.catch(function(error) {
      handleError(error, context, options);
      throw error; // Re-throw pour permettre la gestion en aval
    });
  }

  /**
   * Crée un gestionnaire d'erreur pour un formulaire
   * @param {HTMLFormElement} form - Formulaire
   * @param {Object} validationRules - Règles de validation
   * @returns {Object} Objet avec méthodes validate et showErrors
   */
  function createFormErrorHandler(form, validationRules) {
    return {
      /**
       * Valide le formulaire selon les règles
       * @returns {Object} Résultat de validation
       */
      validate: function() {
        var errors = [];
        var formData = new FormData(form);

        Object.keys(validationRules).forEach(function(fieldName) {
          var value = formData.get(fieldName);
          var rules = validationRules[fieldName];

          if (rules.required && (!value || value.trim() === '')) {
            errors.push({
              field: fieldName,
              message: rules.requiredMessage || 'Ce champ est requis'
            });
          }

          if (rules.validator && typeof rules.validator === 'function') {
            var valid = rules.validator(value);
            if (!valid) {
              errors.push({
                field: fieldName,
                message: rules.validatorMessage || 'Valeur invalide'
              });
            }
          }
        });

        return {
          isValid: errors.length === 0,
          errors: errors
        };
      },

      /**
       * Affiche les erreurs dans le formulaire
       * @param {Array} errors - Tableau d'erreurs
       */
      showErrors: function(errors) {
        // Supprimer les erreurs existantes
        form.querySelectorAll('.field-error').forEach(function(el) {
          el.remove();
        });

        // Afficher les nouvelles erreurs
        errors.forEach(function(error) {
          var field = form.querySelector('[name="' + error.field + '"]');
          if (field) {
            var errorEl = document.createElement('div');
            errorEl.className = 'field-error';
            errorEl.textContent = error.message;
            errorEl.style.cssText = 'color: #c62828; font-size: 13px; margin-top: 4px;';

            field.parentNode.appendChild(errorEl);
            field.style.borderColor = '#c62828';
          }
        });
      },

      /**
       * Nettoie toutes les erreurs
       */
      clearErrors: function() {
        form.querySelectorAll('.field-error').forEach(function(el) {
          el.remove();
        });

        form.querySelectorAll('input, select, textarea').forEach(function(el) {
          el.style.borderColor = '';
        });
      }
    };
  }

  // Ajouter les animations CSS si elles n'existent pas déjà
  if (!document.getElementById('error-animations')) {
    var style = document.createElement('style');
    style.id = 'error-animations';
    style.textContent =
      '@keyframes slideIn {' +
      '  from { transform: translateX(400px); opacity: 0; }' +
      '  to { transform: translateX(0); opacity: 1; }' +
      '}' +
      '@keyframes slideOut {' +
      '  from { transform: translateX(0); opacity: 1; }' +
      '  to { transform: translateX(400px); opacity: 0; }' +
      '}';
    document.head.appendChild(style);
  }

  // API Publique
  return {
    ErrorTypes: ErrorTypes,
    ErrorMessages: ErrorMessages,
    classifyError: classifyError,
    getErrorMessage: getErrorMessage,
    logError: logError,
    handleError: handleError,
    showNotification: showNotification,
    showErrorInContainer: showErrorInContainer,
    wrapPromise: wrapPromise,
    createFormErrorHandler: createFormErrorHandler
  };
})();
/**
 * Module de Performance (Version Standalone - Sans Modules ES6)
 * Interface Impulsion Marketing
 *
 * Ce module fournit des utilitaires pour optimiser les performances:
 * - Debouncing et throttling
 * - Cache de données
 * - Optimisations DOM
 */

// Créer le namespace global si nécessaire
window.ImpulsionMarketing = window.ImpulsionMarketing || {};

// Module de performance
window.ImpulsionMarketing.performance = (function() {
  'use strict';

  /**
   * Crée une fonction debounced (retardée)
   * Utile pour les événements qui se déclenchent fréquemment (input, scroll, resize)
   * @param {Function} func - Fonction à debouncer
   * @param {number} wait - Délai en millisecondes
   * @returns {Function} Fonction debouncée
   */
  function debounce(func, wait) {
    var timeout;

    return function debounced() {
      var context = this;
      var args = arguments;

      clearTimeout(timeout);

      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  /**
   * Crée une fonction throttled (limitée)
   * Garantit qu'une fonction ne s'exécute pas plus d'une fois par intervalle
   * @param {Function} func - Fonction à throttler
   * @param {number} limit - Intervalle minimal en millisecondes
   * @returns {Function} Fonction throttlée
   */
  function throttle(func, limit) {
    var inThrottle;

    return function throttled() {
      var context = this;
      var args = arguments;

      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;

        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  /**
   * Cache simple avec expiration
   */
  var Cache = (function() {
    var cache = {};

    return {
      /**
       * Récupère une valeur du cache
       * @param {string} key - Clé de cache
       * @returns {*|null} Valeur cachée ou null si expirée/inexistante
       */
      get: function(key) {
        var entry = cache[key];

        if (!entry) {
          return null;
        }

        // Vérifier l'expiration (5 minutes par défaut)
        if (Date.now() - entry.timestamp > (entry.ttl || 300000)) {
          delete cache[key];
          return null;
        }

        return entry.data;
      },

      /**
       * Stocke une valeur dans le cache
       * @param {string} key - Clé de cache
       * @param {*} data - Données à cacher
       * @param {number} ttl - Durée de vie en millisecondes (optionnel)
       */
      set: function(key, data, ttl) {
        cache[key] = {
          data: data,
          timestamp: Date.now(),
          ttl: ttl
        };
      },

      /**
       * Supprime une entrée du cache
       * @param {string} key - Clé à supprimer
       */
      remove: function(key) {
        delete cache[key];
      },

      /**
       * Vide tout le cache
       */
      clear: function() {
        cache = {};
      },

      /**
       * Vérifie si une clé existe dans le cache
       * @param {string} key - Clé à vérifier
       * @returns {boolean}
       */
      has: function(key) {
        return this.get(key) !== null;
      },

      /**
       * Obtient le nombre d'entrées en cache
       * @returns {number}
       */
      size: function() {
        return Object.keys(cache).length;
      }
    };
  })();

  /**
   * Optimise l'insertion de multiples éléments dans le DOM
   * @param {HTMLElement} container - Conteneur cible
   * @param {Array} items - Tableau d'éléments à insérer
   * @param {Function} createElementFn - Fonction qui crée un élément pour chaque item
   * @param {boolean} clearFirst - Si true, vide le conteneur avant insertion
   */
  function batchInsert(container, items, createElementFn, clearFirst) {
    if (clearFirst) {
      container.innerHTML = '';
    }

    var fragment = document.createDocumentFragment();

    items.forEach(function(item, index) {
      var element = createElementFn(item, index);
      if (element) {
        fragment.appendChild(element);
      }
    });

    container.appendChild(fragment);
  }

  /**
   * Construit du HTML de manière optimisée avec un tableau
   * Plus performant que la concaténation de chaînes
   * @param {Array} items - Tableau d'éléments
   * @param {Function} templateFn - Fonction qui génère le HTML pour chaque item
   * @returns {string} HTML complet
   */
  function buildHtml(items, templateFn) {
    var parts = [];

    items.forEach(function(item, index) {
      var html = templateFn(item, index);
      if (html) {
        parts.push(html);
      }
    });

    return parts.join('');
  }

  /**
   * Charge des données avec mise en cache automatique
   * @param {string} cacheKey - Clé de cache
   * @param {Function} loaderFn - Fonction qui charge les données (retourne une Promise)
   * @param {number} ttl - Durée de vie du cache en ms (optionnel)
   * @returns {Promise} Promise résolue avec les données
   */
  function loadWithCache(cacheKey, loaderFn, ttl) {
    // Vérifier le cache
    var cached = Cache.get(cacheKey);
    if (cached !== null) {
      return Promise.resolve(cached);
    }

    // Charger et mettre en cache
    return loaderFn().then(function(data) {
      Cache.set(cacheKey, data, ttl);
      return data;
    });
  }

  /**
   * Exécute plusieurs Promises en parallèle avec limite de concurrence
   * Utile pour éviter de surcharger le système avec trop de requêtes simultanées
   * @param {Array} items - Tableau d'items à traiter
   * @param {Function} taskFn - Fonction qui retourne une Promise pour chaque item
   * @param {number} concurrency - Nombre max de tâches simultanées
   * @returns {Promise<Array>} Promise résolue avec tous les résultats
   */
  function parallelLimit(items, taskFn, concurrency) {
    concurrency = concurrency || 5;
    var results = [];
    var index = 0;

    function runNext() {
      if (index >= items.length) {
        return Promise.resolve();
      }

      var currentIndex = index++;
      var item = items[currentIndex];

      return taskFn(item, currentIndex)
        .then(function(result) {
          results[currentIndex] = result;
          return runNext();
        })
        .catch(function(error) {
          results[currentIndex] = { error: error };
          return runNext();
        });
    }

    // Démarrer le nombre initial de workers
    var workers = [];
    for (var i = 0; i < Math.min(concurrency, items.length); i++) {
      workers.push(runNext());
    }

    return Promise.all(workers).then(function() {
      return results;
    });
  }

  /**
   * Amélioration de l'itération asynchrone du File System Access API
   * Collecte toutes les entrées puis traite en parallèle
   * @param {FileSystemDirectoryHandle} dirHandle - Handle du répertoire
   * @param {Function} processFn - Fonction de traitement pour chaque entrée
   * @param {number} concurrency - Nombre de traitements parallèles
   * @returns {Promise<Array>} Résultats du traitement
   */
  function iterateDirectoryParallel(dirHandle, processFn, concurrency) {
    concurrency = concurrency || 5;

    // D'abord, collecter toutes les entrées
    function collectEntries() {
      var entries = [];

      function iterate(iterator) {
        return iterator.next().then(function(result) {
          if (result.done) {
            return entries;
          }

          entries.push(result.value);
          return iterate(iterator);
        });
      }

      return iterate(dirHandle.entries());
    }

    // Puis traiter en parallèle
    return collectEntries().then(function(entries) {
      return parallelLimit(
        entries,
        function(entry) {
          return processFn(entry[0], entry[1]);
        },
        concurrency
      );
    });
  }

  /**
   * Précharge une image de manière asynchrone
   * @param {string} src - URL de l'image
   * @returns {Promise<HTMLImageElement>} Promise résolue avec l'image chargée
   */
  function preloadImage(src) {
    return new Promise(function(resolve, reject) {
      var img = new Image();
      img.onload = function() {
        resolve(img);
      };
      img.onerror = function() {
        reject(new Error('Failed to load image: ' + src));
      };
      img.src = src;
    });
  }

  /**
   * Précharge plusieurs images en parallèle
   * @param {Array<string>} srcs - Tableau d'URLs d'images
   * @param {number} concurrency - Nombre max de chargements simultanés
   * @returns {Promise<Array>} Promise résolue avec les résultats
   */
  function preloadImages(srcs, concurrency) {
    return parallelLimit(srcs, preloadImage, concurrency || 3);
  }

  /**
   * Mesure le temps d'exécution d'une fonction
   * @param {string} label - Label pour identifier la mesure
   * @param {Function} fn - Fonction à mesurer
   * @returns {*} Résultat de la fonction
   */
  function measure(label, fn) {
    var start = performance.now();
    var result = fn();
    var duration = performance.now() - start;

    if (window.IM_DEBUG) console.log('[Performance] ' + label + ': ' + duration.toFixed(2) + 'ms');

    return result;
  }

  /**
   * Mesure le temps d'exécution d'une Promise
   * @param {string} label - Label pour identifier la mesure
   * @param {Promise} promise - Promise à mesurer
   * @returns {Promise} Promise originale
   */
  function measureAsync(label, promise) {
    var start = performance.now();

    return promise.then(function(result) {
      var duration = performance.now() - start;
      if (window.IM_DEBUG) console.log('[Performance] ' + label + ': ' + duration.toFixed(2) + 'ms');
      return result;
    }).catch(function(error) {
      var duration = performance.now() - start;
      if (window.IM_DEBUG) console.log('[Performance] ' + label + ' (error): ' + duration.toFixed(2) + 'ms');
      throw error;
    });
  }

  // ─────────────────────────────────────────────────────────
  // INDEXCACHE — Cache IndexedDB pour _index.json
  // Rend le chargement du tableau de bord quasi-instantané (<5ms)
  // après la première visite, même sur lecteur réseau (V://)
  // ─────────────────────────────────────────────────────────
  var IndexCache = (function () {
    var DB = 'ImpulsionIndexCache', STORE = 'idx', TTL = 60000; // 60 secondes
    var _db = null;

    function open() {
      if (_db) return Promise.resolve(_db);
      return new Promise(function (resolve) {
        try {
          var req = indexedDB.open(DB, 1);
          req.onupgradeneeded = function (e) {
            e.target.result.createObjectStore(STORE, { keyPath: 'k' });
          };
          req.onsuccess = function (e) { _db = e.target.result; resolve(_db); };
          req.onerror   = function ()  { resolve(null); };
        } catch (e) { resolve(null); }
      });
    }

    function get(key) {
      return open().then(function (db) {
        if (!db) return null;
        return new Promise(function (resolve) {
          try {
            var req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
            req.onsuccess = function (e) {
              var r = e.target.result;
              resolve((!r || Date.now() - r.ts > TTL) ? null : r.d);
            };
            req.onerror = function () { resolve(null); };
          } catch (e) { resolve(null); }
        });
      }).catch(function () { return null; });
    }

    function set(key, data) {
      open().then(function (db) {
        if (!db) return;
        try {
          db.transaction(STORE, 'readwrite')
            .objectStore(STORE)
            .put({ k: key, d: data, ts: Date.now() });
        } catch (e) { /* silencieux */ }
      });
    }

    function invalidate(key) {
      open().then(function (db) {
        if (!db) return;
        try {
          db.transaction(STORE, 'readwrite').objectStore(STORE).delete(key);
        } catch (e) { /* silencieux */ }
      });
    }

    return { get: get, set: set, invalidate: invalidate };
  })();

  // API Publique
  return {
    debounce: debounce,
    throttle: throttle,
    Cache: Cache,
    batchInsert: batchInsert,
    buildHtml: buildHtml,
    loadWithCache: loadWithCache,
    parallelLimit: parallelLimit,
    iterateDirectoryParallel: iterateDirectoryParallel,
    preloadImage: preloadImage,
    preloadImages: preloadImages,
    measure: measure,
    measureAsync: measureAsync,
    IndexCache: IndexCache
  };
})();
/**
 * Gestionnaire de Stockage Persistant du Dossier Racine (Version Standalone - Sans Modules ES6)
 * Interface Impulsion Marketing
 *
 * Utilise IndexedDB pour stocker le FileSystemDirectoryHandle
 * entre les sessions et les pages
 * Version sans modules ES6 pour fonctionner avec file://
 */

// Créer le namespace global si nécessaire
window.ImpulsionMarketing = window.ImpulsionMarketing || {};

// Gestionnaire de stockage du dossier
window.ImpulsionMarketing.directoryStorage = (function() {
  'use strict';

  const DB_NAME = 'ImpulsionMarketingDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'settings';
  const HANDLE_KEY = 'rootDirectoryHandle';

  // Variables privées
  let db = null;
  let cachedHandle = null;

  /**
   * Initialise la connexion IndexedDB
   * @returns {Promise<IDBDatabase>}
   */
  function initDB() {
    if (db) {
      return Promise.resolve(db);
    }

    return new Promise(function(resolve, reject) {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = function() {
        reject(request.error);
      };

      request.onsuccess = function() {
        db = request.result;
        resolve(db);
      };

      request.onupgradeneeded = function(event) {
        const database = event.target.result;

        // Créer le store s'il n'existe pas
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  /**
   * Sauvegarde le handle du dossier racine dans IndexedDB
   * @param {FileSystemDirectoryHandle} handle - Handle à sauvegarder
   * @returns {Promise<void>}
   */
  function saveRootHandle(handle) {
    if (!handle) {
      return Promise.reject(new Error('Le handle du dossier ne peut pas être null'));
    }

    return initDB().then(function() {
      return new Promise(function(resolve, reject) {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        // Sauvegarder le handle et des métadonnées
        const data = {
          handle: handle,
          name: handle.name,
          savedAt: new Date().toISOString()
        };

        const request = store.put(data, HANDLE_KEY);

        request.onerror = function() {
          reject(request.error);
        };

        request.onsuccess = function() {
          cachedHandle = handle;
          resolve();
        };
      });
    });
  }

  /**
   * Récupère le handle du dossier racine depuis IndexedDB
   * @returns {Promise<FileSystemDirectoryHandle|null>}
   */
  function loadRootHandle() {
    // Retourner le cache si disponible
    if (cachedHandle) {
      return Promise.resolve(cachedHandle);
    }

    return initDB().then(function() {
      return new Promise(function(resolve, reject) {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(HANDLE_KEY);

        request.onerror = function() {
          reject(request.error);
        };

        request.onsuccess = function() {
          const data = request.result;

          if (data && data.handle) {
            cachedHandle = data.handle;
            resolve(data.handle);
          } else {
            resolve(null);
          }
        };
      });
    });
  }

  /**
   * Vérifie les permissions du handle et les redemande si nécessaire
   * @param {FileSystemDirectoryHandle} handle - Handle à vérifier
   * @param {string} mode - 'read' ou 'readwrite'
   * @returns {Promise<boolean>} true si permission accordée
   */
  function checkPermission(handle, mode) {
    mode = mode || 'readwrite';

    if (!handle) {
      return Promise.resolve(false);
    }

    return handle.queryPermission({ mode: mode })
      .then(function(permission) {
        // Si déjà accordée
        if (permission === 'granted') {
          return true;
        }

        // Sinon, demander la permission
        return handle.requestPermission({ mode: mode })
          .then(function(newPermission) {
            return newPermission === 'granted';
          });
      })
      .catch(function(error) {
        console.error('Erreur lors de la vérification des permissions:', error);
        return false;
      });
  }

  /**
   * Vérifie si le handle est toujours valide
   * @param {FileSystemDirectoryHandle} handle - Handle à vérifier
   * @returns {Promise<boolean>}
   */
  function isHandleValid(handle) {
    if (!handle) {
      return Promise.resolve(false);
    }

    return handle.queryPermission({ mode: 'read' })
      .then(function() {
        return true;
      })
      .catch(function(error) {
        console.warn('Le handle n\'est plus valide:', error);
        return false;
      });
  }

  /**
   * Récupère le handle avec vérification (NON destructive, sans demande de permission).
   *
   * IMPORTANT : on n'appelle JAMAIS requestPermission ici, car cette fonction est
   * surtout invoquée au chargement des pages (sans clic) — or requestPermission exige
   * un "user activation". On se contente d'interroger l'état (queryPermission) :
   *  - 'granted'  → succès, handle utilisable directement
   *  - 'prompt'/'denied' → le dossier est mémorisé, il faut juste redemander la
   *    permission via un clic (statut 'needs_permission') — PAS de re-sélection.
   *  - queryPermission qui échoue → dossier réellement inaccessible ('invalid_handle').
   * On ne supprime PLUS le handle mémorisé sur un simple souci de permission.
   * @param {string} mode - 'read' ou 'readwrite'
   * @returns {Promise<Object>}
   */
  function getRootHandleWithCheck(mode) {
    mode = mode || 'readwrite';

    return loadRootHandle()
      .then(function(handle) {
        if (!handle) {
          return {
            handle: null,
            status: 'no_handle',
            message: 'Aucun dossier n\'a été sélectionné. Veuillez retourner à l\'accueil pour charger le dossier.'
          };
        }

        return handle.queryPermission({ mode: mode })
          .then(function(perm) {
            if (perm === 'granted') {
              cachedHandle = handle;
              return {
                handle: handle,
                status: 'success',
                message: 'Dossier "' + handle.name + '" prêt à être utilisé'
              };
            }
            // Permission à redemander (nouveau démarrage de session) — handle conservé.
            return {
              handle: null,
              status: 'needs_permission',
              message: 'Cliquez sur « Se connecter » pour réautoriser l\'accès au dossier "' + handle.name + '".'
            };
          })
          .catch(function() {
            // queryPermission échoue : le dossier n'existe plus / a été déplacé.
            return {
              handle: null,
              status: 'invalid_handle',
              message: 'Le dossier précédemment sélectionné n\'est plus accessible. Veuillez le recharger depuis l\'accueil.'
            };
          });
      })
      .catch(function(error) {
        console.error('Erreur lors de la récupération du handle:', error);
        var IM = window.ImpulsionMarketing;
        var friendly = (IM && IM.errors && IM.errors.getErrorMessage) ? IM.errors.getErrorMessage(error) : 'Une erreur inattendue est survenue.';
        return {
          handle: null,
          status: 'error',
          message: 'Erreur : ' + friendly
        };
      });
  }

  /**
   * Reconnexion rapide au dossier mémorisé : redemande la permission (un clic suffit),
   * SANS rouvrir le sélecteur de dossier. À appeler depuis un gestionnaire de clic.
   *
   * La chaîne est volontairement très courte (handle préchargé en cache) pour préserver
   * le "user activation" du clic — sinon requestPermission échouerait et forcerait une
   * re-sélection complète.
   * @param {string} mode - 'read' ou 'readwrite'
   * @returns {Promise<Object>} { handle, status: 'success'|'no_handle'|'no_permission' }
   */
  function reconnect(mode) {
    mode = mode || 'readwrite';
    return loadRootHandle().then(function(handle) {
      if (!handle) {
        return { handle: null, status: 'no_handle' };
      }
      return handle.requestPermission({ mode: mode })
        .then(function(perm) {
          if (perm === 'granted') {
            cachedHandle = handle;
            return { handle: handle, status: 'success' };
          }
          return { handle: null, status: 'no_permission' };
        })
        .catch(function(err) {
          var IM = window.ImpulsionMarketing;
          var friendly = (IM && IM.errors && IM.errors.getErrorMessage) ? IM.errors.getErrorMessage(err) : 'Une erreur inattendue est survenue.';
          return { handle: null, status: 'no_permission', message: friendly };
        });
    });
  }

  /**
   * Supprime le handle sauvegardé
   * @returns {Promise<void>}
   */
  function clearRootHandle() {
    return initDB().then(function() {
      return new Promise(function(resolve, reject) {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(HANDLE_KEY);

        request.onerror = function() {
          reject(request.error);
        };

        request.onsuccess = function() {
          cachedHandle = null;
          resolve();
        };
      });
    });
  }

  /**
   * Obtient les métadonnées du dossier sauvegardé
   * @returns {Promise<Object|null>}
   */
  function getRootInfo() {
    return initDB().then(function() {
      return new Promise(function(resolve, reject) {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(HANDLE_KEY);

        request.onerror = function() {
          reject(request.error);
        };

        request.onsuccess = function() {
          const data = request.result;
          if (data) {
            resolve({
              name: data.name,
              savedAt: data.savedAt
            });
          } else {
            resolve(null);
          }
        };
      });
    });
  }

  /**
   * Demande à l'utilisateur de sélectionner un dossier et le sauvegarde
   * @returns {Promise<FileSystemDirectoryHandle>}
   */
  function promptAndSaveDirectory() {
    if (!window.showDirectoryPicker) {
      return Promise.reject(new Error('Votre navigateur ne supporte pas l\'API File System Access. Utilisez Chrome ou Edge.'));
    }

    return window.showDirectoryPicker({
      id: 'impulsion-marketing-root',
      mode: 'readwrite',
      startIn: 'desktop'
    })
    .then(function(handle) {
      // Sauvegarder automatiquement
      return saveRootHandle(handle).then(function() {
        return handle;
      });
    })
    .catch(function(error) {
      if (error.name === 'AbortError') {
        throw new Error('Sélection du dossier annulée');
      }
      throw error;
    });
  }

  // Préchauffage : on charge le handle mémorisé en cache dès le démarrage du module,
  // pour qu'une reconnexion (clic) puisse appeler requestPermission sans attente
  // (préserve le "user activation"). Échec silencieux (cas normal : aucun dossier).
  loadRootHandle().catch(function() {});

  // API Publique
  return {
    initDB: initDB,
    saveRootHandle: saveRootHandle,
    loadRootHandle: loadRootHandle,
    checkPermission: checkPermission,
    isHandleValid: isHandleValid,
    getRootHandleWithCheck: getRootHandleWithCheck,
    reconnect: reconnect,
    clearRootHandle: clearRootHandle,
    getRootInfo: getRootInfo,
    promptAndSaveDirectory: promptAndSaveDirectory
  };
})();
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

  // Droit d'accès à l'espace Administration : managers ou super admin (config _config.json,
  // aucun nom codé en dur — l'accès admin se donne exclusivement via le flag isManager/isSuperAdmin).
  function canAccessAdmin() {
    var u = getCurrentUser();
    return !!(u && (u.isManager === true || u.isSuperAdmin === true));
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
        // Une personne rendue inactive (Administration ▸ Équipes & personnes) perd
        // immédiatement l'accès — y compris si elle était déjà connectée (session
        // encore présente en localStorage) : traité comme non connecté.
        if (found && found.inactive) return null;
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
   * Retourne les utilisateurs ACTIFS d'un rôle donné — utilisé pour peupler les
   * listes de sélection (connexion, affectation…). Une personne inactive
   * (Administration ▸ Équipes & personnes) n'y apparaît plus.
   * @param {string} role
   * @returns {Array}
   */
  function getUsersByRole(role) {
    return USERS.filter(function (u) { return u.role === role && !u.inactive; });
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
    if (user.name === (campaignData.po || '')) return true;
    // Co-PO (suppléance congés) : mêmes droits que le PO sur cette campagne
    var co = campaignData.coPo;
    return Array.isArray(co) ? co.indexOf(user.name) !== -1 : co === user.name;
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
/**
 * Gestionnaire de Workflow Campagnes — Impulsion Marketing
 * Gère les étapes, statuts et transitions du workflow de production
 *
 * v2 — Étapes par canal indépendantes (channelSteps)
 * Chaque canal de communication progresse indépendamment.
 * Les étapes globales (po_saisie, manager_affectation, po_kickoff) restent communes.
 */

window.ImpulsionMarketing = window.ImpulsionMarketing || {};

window.ImpulsionMarketing.workflow = (function () {
  'use strict';

  // Définition complète des étapes (pour affichage / STEPS.forEach)
  var STEPS = [
    { id: 'po_saisie',              label: 'Saisie projet',       actor: 'po',      icon: '📝', description: 'Le PO a créé la campagne' },
    { id: 'manager_affectation',    label: 'Affectation',         actor: 'manager', icon: '👥', description: 'Le manager affecte les équipes' },
    { id: 'po_kickoff',             label: 'Kick-off',            actor: 'po',      icon: '🚀', description: 'Le PO organise le kick-off avec les équipes affectées' },
    { id: 'com_maquette',           label: 'Maquette Com',        actor: 'com',     icon: '🎨', description: 'La Com réalise la maquette' },
    { id: 'po_validation_maquette', label: 'Validation maquette', actor: 'po',      icon: '✅', description: 'Le PO valide la maquette' },
    { id: 'com_juridique',          label: 'Validation juridique', actor: 'com',     icon: '⚖️', description: 'La Com valide juridiquement la maquette (si requis)' },
    { id: 'ebf_bat',                label: 'Réalisation BAT',     actor: 'ebf',     icon: '🖨️', description: "L'EBF réalise le BAT" },
    { id: 'po_validation_bat',      label: 'Validation BAT',      actor: 'po',      icon: '✅', description: 'Le PO valide le BAT' },
    { id: 'data_ciblage',           label: 'Ciblage Data',        actor: 'data',    icon: '🎯', description: 'La Data réalise le ciblage (parallèle possible)' },
    { id: 'po_validation_ciblage',  label: 'Validation ciblage',  actor: 'po',      icon: '✅', description: 'Le PO valide le ciblage' },
    { id: 'data_lancement_test',    label: 'Lancement test',      actor: 'data',    icon: '🧪', description: 'La Data lance le test en production' },
    { id: 'ebf_test_prod',          label: 'Test en prod',        actor: 'ebf',     icon: '🔬', description: "L'EBF dépose le test en production" },
    { id: 'po_validation_test_prod',label: 'Validation test',     actor: 'po',      icon: '✅', description: 'Le PO valide les tests en production' },
    { id: 'data_mise_en_prod',      label: 'Mise en prod',        actor: 'data',    icon: '🚀', description: 'La Data met en production' },
    { id: 'ebf_mise_en_prod',       label: 'Mise en prod LP',     actor: 'ebf',     icon: '🚀', description: "L'EBF met la landing page en production" }
  ];

  // IDs des étapes globales (partagées par tous les canaux)
  var GLOBAL_STEP_IDS = ['po_saisie', 'manager_affectation', 'po_kickoff'];

  // IDs des étapes par canal (chaque canal a sa propre progression)
  var CHANNEL_STEP_IDS = [
    'com_maquette', 'po_validation_maquette', 'com_juridique',
    'ebf_bat', 'po_validation_bat',
    'data_ciblage', 'po_validation_ciblage',
    'data_lancement_test',
    'ebf_test_prod', 'po_validation_test_prod',
    'data_mise_en_prod',
    'ebf_mise_en_prod'
  ];

  // Valeurs par défaut pour les étapes globales
  var DEFAULT_GLOBAL_STEPS = {
    po_saisie:           'validated',
    manager_affectation: 'pending',
    po_kickoff:          'locked'
  };

  // Valeurs par défaut pour les étapes par canal
  var DEFAULT_CHANNEL_STEPS = {
    com_maquette:           'locked',
    po_validation_maquette: 'locked',
    com_juridique:          'locked',
    ebf_bat:                'locked',
    po_validation_bat:      'locked',
    data_ciblage:           'locked',
    po_validation_ciblage:  'locked',
    data_lancement_test:    'locked',
    ebf_test_prod:          'locked',
    po_validation_test_prod:'locked',
    data_mise_en_prod:      'locked',
    ebf_mise_en_prod:       'locked'
  };

  var DEFAULT_ASSIGNMENTS = { manager: '', com: '', ebf: '', data: '' };

  // ─────────────────────────────────────────────────────────
  // CONFIGURATION DU WORKFLOW (Administration ▸ Workflow)
  // ─────────────────────────────────────────────────────────
  // Le libellé/acteur/ordre de chaque étape et l'applicabilité de chaque étape
  // par canal sont pilotés par _config.json (clé "workflow"), éditables depuis
  // l'Administration — avec repli complet sur STEPS/CHANNEL_STEP_IDS ci-dessus
  // si la config est absente. C'est notamment le cas en environnement de test
  // (test/workflow.test.mjs charge ce module isolément, sans IM.config).
  function _cfg() {
    return (window.ImpulsionMarketing && window.ImpulsionMarketing.config) || null;
  }
  // Étape « effective » (fusion base + surcharge admin) pour un id donné.
  // L'id, l'icône et la description restent fixes (structurels) ; le libellé,
  // l'acteur et l'ordre d'affichage sont surchargeables.
  function _stepDef(id) {
    var base = null, baseIdx = -1;
    for (var i = 0; i < STEPS.length; i++) { if (STEPS[i].id === id) { base = STEPS[i]; baseIdx = i; break; } }
    var c = _cfg();
    var overrides = (c && Array.isArray(c.WORKFLOW_STEPS)) ? c.WORKFLOW_STEPS : null;
    var o = null;
    if (overrides) {
      for (var j = 0; j < overrides.length; j++) { if (overrides[j] && overrides[j].id === id) { o = overrides[j]; break; } }
    }
    return {
      id: id,
      label: (o && o.label) || (base && base.label) || id,
      actor: (o && o.actor) || (base && base.actor),
      icon: base && base.icon,
      description: base && base.description,
      order: (o && typeof o.order === 'number') ? o.order : baseIdx
    };
  }
  function stepLabel(id) { return _stepDef(id).label; }
  // Acteur d'une étape — éventuellement surchargé pour un canal donné (ex. la
  // Com peut déposer le test en prod pour le canal Courrier, en plus de l'EBF).
  // Piloté par _config.json workflow.canalActorOverrides : { canal: { stepId: actor } }.
  // N'affecte QUE qui peut agir — aucun impact sur le déblocage des étapes.
  function stepActor(id, channelContent) {
    if (channelContent) {
      var c = _cfg();
      var overrides = c && c.CANAL_ACTOR_OVERRIDES;
      if (overrides && overrides[channelContent] && overrides[channelContent][id]) {
        return overrides[channelContent][id];
      }
    }
    return _stepDef(id).actor;
  }

  // Applicabilité d'une étape pour un CANAL donné (channel.content, ex. « MAIL »,
  // « ZAC », « LP »…) — pilotée par _config.json workflow.canalSteps. Un canal
  // absent de la config (ou config elle-même absente) applique TOUTES les
  // étapes : réglage par défaut le plus sûr, un nouveau canal (ou une nouvelle
  // caisse régionale qui n'a pas encore paramétré ses canaux) garde le flux complet.
  function isStepApplicable(channelContent, stepId) {
    var c = _cfg();
    var cs = c && c.CANAL_STEPS;
    if (!cs || !channelContent || !Object.prototype.hasOwnProperty.call(cs, channelContent)) return true;
    var list = cs[channelContent];
    return Array.isArray(list) ? (list.indexOf(stepId) !== -1) : true;
  }

  // ─────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────

  /**
   * Vérifie si une équipe est requise pour cette campagne
   * Si requiredTeams absent → toutes équipes requises (rétrocompat)
   */
  function isTeamRequired(requiredTeams, team) {
    if (!requiredTeams || !Array.isArray(requiredTeams)) return true;
    return requiredTeams.indexOf(team) !== -1;
  }

  /**
   * La campagne nécessite-t-elle une validation juridique et conformité ?
   * (flag posé à la création — étape com_juridique insérée dans le workflow)
   */
  function juridiqueRequired(campaignData) {
    return !!(campaignData && campaignData.juridique && campaignData.juridique.required);
  }

  // ─────────────────────────────────────────────────────────
  // MIGRATION ancien format → channelSteps
  // ─────────────────────────────────────────────────────────

  /**
   * Convertit l'ancien format (steps plats) vers channelSteps.
   * Les étapes canal sont copiées dans tous les canaux existants.
   * Idempotent : ne fait rien si channelSteps déjà présent.
   */
  function migrateToChannelSteps(campaignData) {
    var wf = campaignData.workflow;
    if (!wf || !wf.steps) return;
    if (wf.channelSteps) return; // déjà migré

    var numChannels = Math.max((campaignData.channels || []).length, 1);
    wf.channelSteps = {};

    for (var i = 0; i < numChannels; i++) {
      wf.channelSteps[i] = {};
      CHANNEL_STEP_IDS.forEach(function (id) {
        wf.channelSteps[i][id] = (wf.steps[id] !== undefined) ? wf.steps[id] : DEFAULT_CHANNEL_STEPS[id];
      });
    }

    // Supprimer les étapes canal du steps global
    CHANNEL_STEP_IDS.forEach(function (id) {
      delete wf.steps[id];
    });
  }

  // ─────────────────────────────────────────────────────────
  // INITIALISATION
  // ─────────────────────────────────────────────────────────

  /**
   * Initialise les champs workflow dans une campagne (rétrocompatibilité)
   * Si workflow absent, l'ajoute avec valeurs par défaut
   */
  function initWorkflow(campaignData) {
    if (!campaignData.workflow) {
      campaignData.workflow = {
        assignments:              Object.assign({}, DEFAULT_ASSIGNMENTS),
        steps:                    Object.assign({}, DEFAULT_GLOBAL_STEPS),
        channelSteps:             {},
        revisionComments:         {},
        channelRevisionComments:  {},
        channelStepDates:         {}
      };
    } else {
      if (!campaignData.workflow.assignments) {
        campaignData.workflow.assignments = Object.assign({}, DEFAULT_ASSIGNMENTS);
      }
      if (!campaignData.workflow.steps) {
        campaignData.workflow.steps = Object.assign({}, DEFAULT_GLOBAL_STEPS);
      }
      if (!campaignData.workflow.revisionComments) {
        campaignData.workflow.revisionComments = {};
      }
      if (!campaignData.workflow.channelRevisionComments) {
        campaignData.workflow.channelRevisionComments = {};
      }
      if (!campaignData.workflow.channelStepDates) {
        campaignData.workflow.channelStepDates = {};
      }
    }

    // Migration ancien format → channelSteps
    migrateToChannelSteps(campaignData);

    // Compléter les étapes globales manquantes
    GLOBAL_STEP_IDS.forEach(function (key) {
      if (campaignData.workflow.steps[key] === undefined) {
        campaignData.workflow.steps[key] = DEFAULT_GLOBAL_STEPS[key];
      }
    });

    // Rétrocompat kick-off : détecter si les équipes ont déjà commencé (via channelSteps)
    var s = campaignData.workflow.steps;
    var anyChannelStarted = false;
    var cs = campaignData.workflow.channelSteps || {};
    Object.keys(cs).forEach(function (i) {
      if (cs[i] && (cs[i].com_maquette !== 'locked' || cs[i].data_ciblage !== 'locked' || cs[i].ebf_bat !== 'locked')) {
        anyChannelStarted = true;
      }
    });

    // Kick-off conditionné (M7) : si la campagne n'a pas de kick-off
    // (kickoffNeeded === 'Non'), l'étape est validée automatiquement (on ne
    // demande rien au PO). Rétro-compat : un champ absent garde l'ancien
    // comportement (kick-off requis).
    var kickoffSkipped = campaignData.kickoffNeeded === 'Non';
    if (s.po_kickoff === 'locked' && s.manager_affectation === 'validated' && !anyChannelStarted) {
      s.po_kickoff = kickoffSkipped ? 'validated' : 'pending';
    }
    if (kickoffSkipped && s.po_kickoff === 'pending') {
      s.po_kickoff = 'validated';
    }
    if ((s.po_kickoff === 'locked' || s.po_kickoff === 'pending') && anyChannelStarted) {
      s.po_kickoff = 'validated';
    }

    // Init channelSteps pour chaque canal (y compris nouveaux canaux ajoutés)
    if (!campaignData.workflow.channelSteps) {
      campaignData.workflow.channelSteps = {};
    }
    cs = campaignData.workflow.channelSteps;
    var numChannels = Math.max((campaignData.channels || []).length, 1);

    for (var i = 0; i < numChannels; i++) {
      if (!cs[i]) {
        cs[i] = Object.assign({}, DEFAULT_CHANNEL_STEPS);
      } else {
        // Compléter les étapes canal manquantes
        CHANNEL_STEP_IDS.forEach(function (id) {
          if (cs[i][id] === undefined) cs[i][id] = DEFAULT_CHANNEL_STEPS[id];
        });
      }

      // Rétrocompat Sprint 5 — data_lancement_test
      var csi = cs[i];
      if (csi.data_lancement_test === 'locked' && csi.ebf_test_prod !== 'locked') {
        csi.data_lancement_test = 'validated';
      }

      // Recalculer les déblocages pour ce canal
      var chContent = campaignData.channels && campaignData.channels[i] && campaignData.channels[i].content;
      cs[i] = recalcChannelUnlocks(cs[i], campaignData.workflow.steps, campaignData.requiredTeams, chContent, juridiqueRequired(campaignData));
    }

    if (!campaignData.kickoffDate) campaignData.kickoffDate = '';
    if (!campaignData.kickoffPersonNotes) campaignData.kickoffPersonNotes = {};

    return campaignData;
  }

  // ─────────────────────────────────────────────────────────
  // RECALCUL DES DÉBLOCAGES
  // ─────────────────────────────────────────────────────────

  /**
   * Recalcule les déverrouillages globaux
   * (po_saisie → manager_affectation → po_kickoff)
   */
  function recalcGlobalUnlocks(steps) {
    var s = steps;
    if (s.po_saisie === 'validated' && s.manager_affectation === 'locked') {
      s.manager_affectation = 'pending';
    }
    if (s.manager_affectation === 'validated' && s.po_kickoff === 'locked') {
      s.po_kickoff = 'pending';
    }
    return s;
  }

  /**
   * Recalcule les déverrouillages pour UN canal selon les requiredTeams.
   *
   * Matrice des flux selon les équipes requises :
   *
   * Com+EBF+Data : kickoff → maquette → val.maquette → BAT → val.BAT
   *                        → ciblage → val.ciblage (parallèle)
   *                        → lancement test → test prod → val.test → MEP
   *
   * Com+EBF (sans Data) : kickoff → maquette → val.maquette → BAT → val.BAT → fin
   *
   * Com+Data (sans EBF) : kickoff → maquette → val.maquette
   *                              → ciblage → val.ciblage → MEP (parallèle)
   *
   * EBF+Data (sans Com) : kickoff → BAT → val.BAT
   *                              → ciblage → val.ciblage
   *                              → lancement test → test prod → val.test → MEP
   *
   * Com seul           : kickoff → maquette → val.maquette → fin
   * EBF seul (sans Data): kickoff → BAT → val.BAT → fin
   * Data seul          : kickoff → ciblage → val.ciblage → MEP
   */
  function recalcChannelUnlocks(cs, globalSteps, requiredTeams, channelContent, juridiqueRequired) {
    var reqCom  = isTeamRequired(requiredTeams, 'Com');
    var reqEbf  = isTeamRequired(requiredTeams, 'EBF');
    var reqData = isTeamRequired(requiredTeams, 'Data');
    function ok(id) { return isStepApplicable(channelContent, id); }

    var kickoffDone = globalSteps && (globalSteps.po_kickoff === 'validated');

    // ── Après kickoff : débloquer les premières étapes ──
    if (kickoffDone) {
      if (reqCom  && ok('com_maquette') && cs.com_maquette === 'locked') cs.com_maquette = 'pending';
      if (reqData && ok('data_ciblage') && cs.data_ciblage === 'locked') cs.data_ciblage = 'pending';
      // EBF sans Com (ou Com non applicable à ce canal) → BAT se débloque directement après kickoff
      if (reqEbf && (!reqCom || !ok('com_maquette')) && ok('ebf_bat') && cs.ebf_bat === 'locked') cs.ebf_bat = 'pending';
    }

    // ── Chaîne Com ──
    if (reqCom && ok('po_validation_maquette') && cs.com_maquette === 'submitted' && cs.po_validation_maquette === 'locked') {
      cs.po_validation_maquette = 'pending';
    }
    // Validation juridique (Com) : débloquée après validation PO de la maquette,
    // uniquement si la campagne requiert une validation juridique et conformité
    // ET si cette étape s'applique à ce canal.
    if (reqCom && juridiqueRequired && ok('com_juridique')) {
      var maquetteValForJur = cs.po_validation_maquette === 'validated' || cs.po_validation_maquette === 'completed';
      if (maquetteValForJur && cs.com_juridique === 'locked') cs.com_juridique = 'pending';
    }

    // ── Chaîne EBF ──
    // ebf_bat se débloque quand :
    // - Com requise (et applicable) sans juridique : après po_validation_maquette validée
    // - Com requise (et applicable) avec juridique (et applicable) : après com_juridique validée
    // - Com non requise ou non applicable à ce canal : déjà géré ci-dessus (après kickoff)
    if (reqEbf && reqCom && ok('com_maquette') && ok('ebf_bat')) {
      var comValidated = cs.po_validation_maquette === 'validated' || cs.po_validation_maquette === 'completed';
      var needsJuridiqueGate = juridiqueRequired && ok('com_juridique');
      var canStartBat = needsJuridiqueGate
        ? (cs.com_juridique === 'validated' || cs.com_juridique === 'completed')
        : comValidated;
      if (canStartBat && cs.ebf_bat === 'locked') cs.ebf_bat = 'pending';
      // Gate juridique : tant que la validation juridique requise n'est pas faite,
      // le BAT ne doit pas être ouvert. On re-verrouille un ebf_bat resté/passé
      // à 'pending' (état hérité d'avant l'ajout du juridique, ou recalcul) —
      // sans toucher un BAT déjà commencé (submitted/validated/completed).
      if (needsJuridiqueGate && !canStartBat && cs.ebf_bat === 'pending') {
        cs.ebf_bat = 'locked';
      }
    }
    if (reqEbf && ok('po_validation_bat') && cs.ebf_bat === 'submitted' && cs.po_validation_bat === 'locked') {
      cs.po_validation_bat = 'pending';
    }

    // ── Chaîne Data (ciblage) ──
    if (reqData && ok('po_validation_ciblage') && cs.data_ciblage === 'submitted' && cs.po_validation_ciblage === 'locked') {
      cs.po_validation_ciblage = 'pending';
    }

    // ── Test en prod : le BAT et/ou le ciblage alimentent le test en prod selon
    // ce qui s'applique à ce canal (un volet non applicable est considéré acquis
    // d'office — il ne bloque pas les autres). Flux standard (lancement test
    // applicable) : lancement test → test en prod, une fois le(s) volet(s) amont
    // validé(s). Flux réduit (lancement test non applicable à ce canal, ex. LP ou
    // canal sans étape de ciblage) : test en prod débloqué directement dès que
    // le(s) volet(s) amont applicable(s) (BAT et/ou ciblage) sont validés.
    var batApplicable = reqEbf && ok('po_validation_bat');
    var batDone = !batApplicable || cs.po_validation_bat === 'validated' || cs.po_validation_bat === 'completed';
    var ciblageApplicable = reqData && ok('data_ciblage');
    var ciblageDone = !ciblageApplicable || cs.po_validation_ciblage === 'validated' || cs.po_validation_ciblage === 'completed';
    // Si ni le BAT ni le ciblage ne s'appliquent à ce canal, le seul verrou
    // restant est le kick-off (sinon le test en prod se débloquerait sans
    // aucune condition, dès l'initialisation du canal).
    var upstreamDone = (batApplicable || ciblageApplicable) ? (batDone && ciblageDone) : kickoffDone;

    if (ok('data_lancement_test')) {
      if (reqEbf && reqData && upstreamDone && cs.data_lancement_test === 'locked') {
        cs.data_lancement_test = 'pending';
      }
      var ltDone = cs.data_lancement_test === 'submitted' || cs.data_lancement_test === 'validated' || cs.data_lancement_test === 'completed';
      if (reqEbf && ok('ebf_test_prod') && ltDone && cs.ebf_test_prod === 'locked') {
        cs.ebf_test_prod = 'pending';
      }
    } else if (reqEbf && ok('ebf_test_prod') && upstreamDone && cs.ebf_test_prod === 'locked') {
      cs.ebf_test_prod = 'pending';
    }

    if (reqEbf && ok('po_validation_test_prod') && cs.ebf_test_prod === 'submitted' && cs.po_validation_test_prod === 'locked') {
      cs.po_validation_test_prod = 'pending';
    }
    var testProdValidated = cs.po_validation_test_prod === 'validated' || cs.po_validation_test_prod === 'completed';

    // ── Mise en production : Data et/ou EBF, selon les étapes applicables à ce canal ──
    if (reqData && ok('data_mise_en_prod') && testProdValidated && cs.data_mise_en_prod === 'locked') {
      cs.data_mise_en_prod = 'pending';
    }
    if (reqEbf && ok('ebf_mise_en_prod') && testProdValidated && cs.ebf_mise_en_prod === 'locked') {
      cs.ebf_mise_en_prod = 'pending';
    }

    // ── MEP : flux réduit Data (EBF non requis, OU le test en prod EBF ne
    // s'applique pas à ce canal — ex. canal sans étape de fabrication/test) →
    // mise en prod directement après le(s) volet(s) amont applicable(s), sans
    // attendre un test en prod qui ne surviendra jamais pour ce canal.
    if (reqData && ok('data_mise_en_prod') && (!reqEbf || !ok('ebf_test_prod')) && !testProdValidated) {
      if (upstreamDone && cs.data_mise_en_prod === 'locked') {
        cs.data_mise_en_prod = 'pending';
      }
    }

    return cs;
  }

  /**
   * Alias pour rétrocompatiblité (appelé depuis advanceStep global)
   */
  function recalcUnlocks(steps) {
    return recalcGlobalUnlocks(steps);
  }

  // ─────────────────────────────────────────────────────────
  // AVANCEMENT DES ÉTAPES
  // ─────────────────────────────────────────────────────────

  /**
   * Avance une étape GLOBALE (po_kickoff, manager_affectation, po_saisie)
   * puis recalcule les déblocages canal (ex : kickoff validé → unlock canaux)
   */
  function advanceStep(campaignData, stepId, newStatus) {
    initWorkflow(campaignData);
    campaignData.workflow.steps[stepId] = newStatus;
    campaignData.workflow.steps = recalcGlobalUnlocks(campaignData.workflow.steps);

    // Recalculer les déblocages canal après changement global
    var cs = campaignData.workflow.channelSteps;
    var numChannels = Math.max((campaignData.channels || []).length, 1);
    for (var i = 0; i < numChannels; i++) {
      if (cs[i]) {
        var chContentG = campaignData.channels && campaignData.channels[i] && campaignData.channels[i].content;
        cs[i] = recalcChannelUnlocks(cs[i], campaignData.workflow.steps, campaignData.requiredTeams, chContentG, juridiqueRequired(campaignData));
      }
    }
    return campaignData;
  }

  /**
   * Avance une étape d'UN CANAL spécifique
   * puis recalcule les déblocages de ce canal
   */
  function advanceChannelStep(campaignData, channelIdx, stepId, newStatus) {
    initWorkflow(campaignData);
    var cs = campaignData.workflow.channelSteps;
    if (!cs[channelIdx]) cs[channelIdx] = Object.assign({}, DEFAULT_CHANNEL_STEPS);
    cs[channelIdx][stepId] = newStatus;
    var chContentC = campaignData.channels && campaignData.channels[channelIdx] && campaignData.channels[channelIdx].content;
    cs[channelIdx] = recalcChannelUnlocks(cs[channelIdx], campaignData.workflow.steps, campaignData.requiredTeams, chContentC, juridiqueRequired(campaignData));
    return campaignData;
  }

  // Historique des demandes de modification par canal (M16) — append-only :
  // un événement par demande (étape concernée, demandeur, date/heure,
  // description), pour affichage dans la card « Historique des modifications »
  // + compteur d'allers-retours. Alimenté par requestChannelRevision,
  // reopenChannelStep et refuseChannelJuridique. author/when sont fournis par
  // l'appelant (page) : le moteur reste une fonction pure, sans horloge/identité.
  function _pushRevisionLog(campaignData, channelIdx, stepId, comment, author, when) {
    if (!campaignData.workflow.channelRevisionLog) campaignData.workflow.channelRevisionLog = {};
    if (!campaignData.workflow.channelRevisionLog[channelIdx]) campaignData.workflow.channelRevisionLog[channelIdx] = [];
    campaignData.workflow.channelRevisionLog[channelIdx].push({
      stepId: stepId, author: author || '', date: when || '', comment: comment || ''
    });
  }
  function getChannelRevisionLog(campaignData, channelIdx) {
    var log = campaignData.workflow && campaignData.workflow.channelRevisionLog;
    return (log && log[channelIdx]) ? log[channelIdx] : [];
  }

  // Date à laquelle l'étape stepId du canal channelIdx est passée à son statut
  // ACTUEL (cf. _stampChannelStepDates, alimenté à chaque sauvegarde). Absente
  // pour un statut déjà en place avant l'introduction de ce suivi — auquel cas
  // l'appelant doit prévoir un repli (ex. « — »).
  function getChannelStepDate(campaignData, channelIdx, stepId) {
    var dates = campaignData.workflow && campaignData.workflow.channelStepDates;
    var forChannel = dates && dates[channelIdx];
    return (forChannel && forChannel[stepId]) || null;
  }

  // Horodate, à la sauvegarde, chaque étape canal dont le statut vient de
  // changer par rapport à la baseline (état du disque au chargement) — permet
  // d'afficher « depuis combien de temps » une étape est dans son statut
  // courant (Pilotage ▸ Suivi de campagne). Le moteur reste sans horloge
  // propre ailleurs (author/when fournis par l'appelant) ; ici l'horodatage
  // est un simple sous-produit de la sauvegarde, pas une action métier propre,
  // donc Date.now() y est utilisé directement.
  function _stampChannelStepDates(campaignData, baseline) {
    var wf = campaignData.workflow;
    if (!wf || !wf.channelSteps) return;
    if (!wf.channelStepDates) wf.channelStepDates = {};
    var baseCs = (baseline && baseline.workflow && baseline.workflow.channelSteps) || {};
    var now = new Date().toISOString();
    Object.keys(wf.channelSteps).forEach(function (idx) {
      var cur = wf.channelSteps[idx] || {};
      var base = baseCs[idx] || {};
      Object.keys(cur).forEach(function (stepId) {
        if (cur[stepId] !== base[stepId]) {
          if (!wf.channelStepDates[idx]) wf.channelStepDates[idx] = {};
          wf.channelStepDates[idx][stepId] = now;
        }
      });
    });
  }

  /**
   * Demande une modification sur une étape canal (PO → acteur)
   * Met à jour channelSteps[channelIdx] et stocke le commentaire
   */
  function requestChannelRevision(campaignData, poStepId, sourceStepId, channelIdx, comment, author, when) {
    initWorkflow(campaignData);
    var cs = campaignData.workflow.channelSteps;
    if (!cs || !cs[channelIdx]) return campaignData;
    cs[channelIdx][sourceStepId] = 'revision_requested';
    cs[channelIdx][poStepId]     = 'locked';
    if (!campaignData.workflow.channelRevisionComments) {
      campaignData.workflow.channelRevisionComments = {};
    }
    if (!campaignData.workflow.channelRevisionComments[channelIdx]) {
      campaignData.workflow.channelRevisionComments[channelIdx] = {};
    }
    campaignData.workflow.channelRevisionComments[channelIdx][sourceStepId] = comment || '';
    _pushRevisionLog(campaignData, channelIdx, sourceStepId, comment, author, when);
    return campaignData;
  }

  // Carte des dépendances : pour chaque étape, les étapes qui EN DÉPENDENT
  // (descendantes, transitivement). Sert au retour à une étape antérieure :
  // seules les descendantes sont à refaire ; les branches indépendantes sont
  // conservées. Les deux chaînes Com→BAT et Data→ciblage sont indépendantes
  // jusqu'à leur jonction au lancement test. C'est un sur-ensemble statique :
  // recalcChannelUnlocks ne ré-ouvre que les étapes réellement requises.
  var STEP_DESCENDANTS = {
    com_maquette:            ['po_validation_maquette', 'com_juridique', 'ebf_bat', 'po_validation_bat', 'data_lancement_test', 'ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    po_validation_maquette:  ['com_juridique', 'ebf_bat', 'po_validation_bat', 'data_lancement_test', 'ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    com_juridique:           ['ebf_bat', 'po_validation_bat', 'data_lancement_test', 'ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    ebf_bat:                 ['po_validation_bat', 'data_lancement_test', 'ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    po_validation_bat:       ['data_lancement_test', 'ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    data_ciblage:            ['po_validation_ciblage', 'data_lancement_test', 'ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    po_validation_ciblage:   ['data_lancement_test', 'ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    data_lancement_test:     ['ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    ebf_test_prod:           ['po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    po_validation_test_prod: ['data_mise_en_prod', 'ebf_mise_en_prod'],
    data_mise_en_prod:       [],
    ebf_mise_en_prod:        []
  };

  /**
   * Renvoie un canal à une étape antérieure (L2 : « revenir en arrière »).
   * - L'étape cible redevient éditable (revision_requested) → l'acteur la refait.
   * - Sa validation PO associée et toutes ses étapes DESCENDANTES repassent à
   *   'locked' : elles seront à refaire dans l'ordre. Les branches indépendantes
   *   (ex. le ciblage Data quand on revient au BAT) sont conservées.
   * - Le motif est obligatoire (stocké + affiché en « Modification demandée »).
   * Utilisable par l'acteur sur sa propre étape, ou par le PO sur toute étape.
   */
  function reopenChannelStep(campaignData, channelIdx, targetStepId, reason, author, when) {
    initWorkflow(campaignData);
    var cs = campaignData.workflow.channelSteps;
    if (!cs || !cs[channelIdx] || CHANNEL_STEP_IDS.indexOf(targetStepId) === -1) return campaignData;
    var ch = cs[channelIdx];
    ch[targetStepId] = 'revision_requested';
    var v = _DEPOT_VALIDATION[targetStepId];
    if (v && ch[v] !== undefined) ch[v] = 'locked';
    (STEP_DESCENDANTS[targetStepId] || []).forEach(function (sid) {
      if (ch[sid] !== undefined) ch[sid] = 'locked';
    });
    if (!campaignData.workflow.channelRevisionComments) campaignData.workflow.channelRevisionComments = {};
    if (!campaignData.workflow.channelRevisionComments[channelIdx]) campaignData.workflow.channelRevisionComments[channelIdx] = {};
    campaignData.workflow.channelRevisionComments[channelIdx][targetStepId] = reason || '';
    _pushRevisionLog(campaignData, channelIdx, targetStepId, reason, author, when);
    var chContentR = campaignData.channels && campaignData.channels[channelIdx] && campaignData.channels[channelIdx].content;
    cs[channelIdx] = recalcChannelUnlocks(ch, campaignData.workflow.steps, campaignData.requiredTeams, chContentR, juridiqueRequired(campaignData));
    return campaignData;
  }

  /**
   * Alias rétrocompat — demande de révision globale (utilisé par requestRevision)
   */
  function requestRevision(campaignData, validationStepId, sourceStepId, comment) {
    initWorkflow(campaignData);
    campaignData.workflow.revisionComments[sourceStepId] = comment || '';
    return campaignData;
  }

  // ─────────────────────────────────────────────────────────
  // VALIDATION PAR CANAL (PO)
  // ─────────────────────────────────────────────────────────

  /**
   * Valide un step PO pour un canal spécifique → avance channelSteps[channelIdx]
   */
  function validateChannelStep(campaignData, poStepId, channelIdx) {
    return advanceChannelStep(campaignData, channelIdx, poStepId, 'validated');
  }

  /**
   * Refus de la validation juridique (par la Com) pour un canal.
   * On rejoue la séquence : retour à la maquette Com (révision demandée),
   * la validation PO et la validation juridique sont reverrouillées, le motif
   * est conservé. Quand la Com redépose, la séquence repart automatiquement.
   */
  function refuseChannelJuridique(campaignData, channelIdx, reason, author, when) {
    initWorkflow(campaignData);
    var cs = campaignData.workflow.channelSteps;
    if (!cs || !cs[channelIdx]) return campaignData;
    cs[channelIdx].com_juridique          = 'locked';
    cs[channelIdx].po_validation_maquette = 'locked';
    cs[channelIdx].com_maquette           = 'revision_requested';
    var fullReason = '⚖️ Refus juridique : ' + (reason || '');
    if (!campaignData.workflow.channelRevisionComments) campaignData.workflow.channelRevisionComments = {};
    if (!campaignData.workflow.channelRevisionComments[channelIdx]) campaignData.workflow.channelRevisionComments[channelIdx] = {};
    campaignData.workflow.channelRevisionComments[channelIdx].com_maquette = fullReason;
    _pushRevisionLog(campaignData, channelIdx, 'com_maquette', fullReason, author, when);
    return campaignData;
  }

  /**
   * Initialise channelValidations (conservé pour rétrocompat, non utilisé en v2)
   */
  function initChannelValidations(campaignData, numChannels) {
    initWorkflow(campaignData);
    if (!campaignData.workflow.channelValidations) {
      campaignData.workflow.channelValidations = {};
    }
  }

  // ─────────────────────────────────────────────────────────
  // ÉTAT DE LA CAMPAGNE
  // ─────────────────────────────────────────────────────────

  /**
   * Vérifie si UN canal est terminé selon les requiredTeams
   */
  function isChannelCompleted(channelSteps, requiredTeams, channelContent, juridiqueRequired) {
    var reqCom  = isTeamRequired(requiredTeams, 'Com');
    var reqEbf  = isTeamRequired(requiredTeams, 'EBF');
    var reqData = isTeamRequired(requiredTeams, 'Data');
    function ok(id) { return isStepApplicable(channelContent, id); }

    // Flux type LP : la mise en production est portée par l'EBF (pas par la
    // Data) — canal dont l'étape « Mise en prod LP » s'applique mais pas
    // « Mise en prod » (Data). Généralise l'ancien cas spécial isLP.
    if (reqEbf && ok('ebf_mise_en_prod') && !ok('data_mise_en_prod')) {
      return channelSteps.ebf_mise_en_prod === 'completed';
    }
    if (reqData && ok('data_mise_en_prod')) {
      return channelSteps.data_mise_en_prod === 'completed';
    }
    if (reqEbf && ok('po_validation_bat')) {
      return channelSteps.po_validation_bat === 'validated' || channelSteps.po_validation_bat === 'completed';
    }
    if (reqCom && ok('po_validation_maquette')) {
      // Canal Com seul (sans EBF ni Data applicables) : terminé après
      // validation de la maquette par le PO — et, si requis, après la
      // validation juridique Com.
      var maquetteOk = channelSteps.po_validation_maquette === 'validated' || channelSteps.po_validation_maquette === 'completed';
      if (juridiqueRequired && ok('com_juridique')) {
        return maquetteOk && (channelSteps.com_juridique === 'validated' || channelSteps.com_juridique === 'completed');
      }
      return maquetteOk;
    }
    return true;
  }

  /**
   * Vérifie si la campagne est terminée (tous les canaux terminés)
   */
  function isCompleted(campaignData) {
    if (!campaignData.workflow) return false;
    var cs = campaignData.workflow.channelSteps;
    if (!cs) return false;
    var numChannels = Math.max((campaignData.channels || []).length, 1);
    for (var i = 0; i < numChannels; i++) {
      var chContentI = campaignData.channels && campaignData.channels[i] && campaignData.channels[i].content;
      if (!cs[i] || !isChannelCompleted(cs[i], campaignData.requiredTeams, chContentI, juridiqueRequired(campaignData))) return false;
    }
    return true;
  }

  /**
   * Retourne le libellé de l'étape courante (pour badges dashboard)
   * Retourne l'étape la moins avancée parmi tous les canaux
   */
  function getCurrentStepLabel(campaignData) {
    if (!campaignData.workflow) return 'En attente d\'affectation';
    if (isCompleted(campaignData)) return 'Terminée';

    var globalSteps = campaignData.workflow.steps;
    if (!globalSteps) return 'En attente d\'affectation';

    // Étapes globales en priorité
    if (globalSteps.manager_affectation === 'pending') return 'Affectation';
    if (globalSteps.po_kickoff === 'pending')          return 'Kick-off';
    if (globalSteps.po_kickoff !== 'validated')        return 'En attente d\'affectation';

    // Chercher la première étape active parmi tous les canaux (la moins avancée)
    var cs = campaignData.workflow.channelSteps || {};
    var numChannels = Math.max((campaignData.channels || []).length, 1);

    for (var si = 3; si < STEPS.length; si++) { // index 0,1,2 = étapes globales
      var stepId = STEPS[si].id;
      var vId = _DEPOT_VALIDATION[stepId];
      for (var ci = 0; ci < numChannels; ci++) {
        if (!cs[ci]) continue;
        var status = cs[ci][stepId];
        // Fusion dépôt→validation : une étape de dépôt reste 'submitted' après
        // que le PO a validé l'étape de validation associée. On la considère
        // alors terminée (sinon on affiche « En validation : … » à tort).
        if (status === 'submitted' && vId && (cs[ci][vId] === 'validated' || cs[ci][vId] === 'completed')) continue;
        if (status === 'pending' || status === 'submitted' || status === 'revision_requested') {
          if (status === 'submitted')          return 'En validation : ' + stepLabel(stepId);
          if (status === 'revision_requested') return 'Révision : ' + stepLabel(stepId);
          return stepLabel(stepId);
        }
      }
    }
    return 'En cours';
  }

  // ─────────────────────────────────────────────────────────
  // PROGRESSION PAR CANAL (cartes du tableau de bord — option multi-canal)
  // ─────────────────────────────────────────────────────────
  var _STEP_LABEL = {};
  STEPS.forEach(function (s) { _STEP_LABEL[s.id] = s.label; });

  // Étapes pertinentes pour un canal selon les équipes requises, le juridique,
  // et l'applicabilité de l'étape à ce canal (Administration ▸ Workflow).
  // Source UNIQUE de « quelles étapes s'appliquent » — utilisée par le moteur
  // (recalcChannelUnlocks/isChannelCompleted en découlent) ET par l'interface
  // (pages/details.html), pour éviter toute divergence entre les deux.
  function _channelStepIds(requiredTeams, channelContent, juridiqueReq) {
    var reqCom  = isTeamRequired(requiredTeams, 'Com');
    var reqEbf  = isTeamRequired(requiredTeams, 'EBF');
    var reqData = isTeamRequired(requiredTeams, 'Data');
    function ok(id) { return isStepApplicable(channelContent, id); }
    var ids = CHANNEL_STEP_IDS.filter(function (id) {
      if (!ok(id)) return false;
      switch (id) {
        case 'com_maquette': case 'po_validation_maquette': return reqCom;
        case 'com_juridique': return reqCom && !!juridiqueReq;
        case 'ebf_bat': case 'po_validation_bat': return reqEbf;
        case 'data_ciblage': case 'po_validation_ciblage': return reqData;
        case 'data_lancement_test': return reqEbf && reqData;
        // Le test en prod (et sa validation/MEP LP) n'est atteignable que par le
        // flux standard (lancement test applicable à ce canal ET Data requise)
        // ou le flux réduit (lancement test non applicable à ce canal, ex. LP) —
        // sinon (EBF seul, sans Data, canal à flux standard) il n'y a pas de
        // test en prod du tout (le flux s'arrête au BAT).
        case 'ebf_test_prod': case 'po_validation_test_prod': case 'ebf_mise_en_prod':
          return reqEbf && (!ok('data_lancement_test') || reqData);
        case 'data_mise_en_prod': return reqData;
        default: return true;
      }
    });
    return ids.sort(function (a, b) { return _stepDef(a).order - _stepDef(b).order; });
  }

  // Une étape de dépôt est "faite" dès que sa validation PO associée est acquise.
  var _DEPOT_VALIDATION = {
    com_maquette: 'po_validation_maquette', ebf_bat: 'po_validation_bat',
    data_ciblage: 'po_validation_ciblage', data_lancement_test: 'po_validation_test_prod',
    ebf_test_prod: 'po_validation_test_prod'
  };
  function _stepColorKey(id) {
    if (/validation/.test(id)) return 'valid';
    if (/maquette|juridique/.test(id)) return 'maq';
    return 'prod'; // bat, ciblage, lancement, test, mise_en_prod
  }

  /**
   * Progression par canal : pour chaque canal, où en est-il.
   * Retourne [{ name, content, label, key, pct, done }]. Stocké dans l'index pour
   * que le tableau de bord affiche le détail par canal sans relire les campagne.json.
   */
  function getChannelProgress(campaignData) {
    initWorkflow(campaignData);
    var cs = campaignData.workflow.channelSteps || {};
    var jur = juridiqueRequired(campaignData);
    var channels = campaignData.channels || [];
    return channels.map(function (ch, i) {
      var steps = cs[i] || {};
      var content = ch && ch.content;
      var done  = isChannelCompleted(steps, campaignData.requiredTeams, content, jur);
      var ids   = _channelStepIds(campaignData.requiredTeams, content, jur);
      function eff(id) {
        var raw = steps[id] || 'locked';
        var v = _DEPOT_VALIDATION[id];
        if (raw === 'submitted' && v && (steps[v] === 'validated' || steps[v] === 'completed')) return 'completed';
        return raw;
      }
      var doneCount = 0, total = ids.length, label = '', key = 'maq';
      for (var k = 0; k < ids.length; k++) {
        var stt = eff(ids[k]);
        if (stt === 'validated' || stt === 'completed') { doneCount++; continue; }
        if (!label) {
          var lbl = stepLabel(ids[k]);
          if (stt === 'submitted')               { label = 'En validation : ' + lbl; key = 'valid'; }
          else if (stt === 'revision_requested') { label = 'Révision : ' + lbl;       key = 'urgent'; }
          else                                   { label = lbl;                        key = _stepColorKey(ids[k]); }
        }
      }
      var pct = done ? 100 : (total ? Math.round(doneCount / total * 100) : 0);
      if (done) { label = 'Terminé'; key = 'done'; }
      else if (!label) { label = 'En cours'; }
      return {
        name:    (ch && (ch.deliverableName || ch.content)) || ('Canal ' + (i + 1)),
        content: (ch && ch.content) || '',
        label: label, key: key, pct: pct, done: done
      };
    });
  }

  /**
   * Retourne la liste des étapes disponibles pour un utilisateur sur une campagne
   * Agrège toutes les étapes actives de tous les canaux
   */
  // Manager général : seul un super-admin a la main sur toute l'étape
  // d'affectation (les 3 équipes) jusqu'à sa validation. Le manager marketing
  // n'a pas de statut particulier ici : comme les managers de service, il
  // n'affecte que son équipe — mais l'équipe « Marketing » n'a pas de
  // dropdown dans cette étape (le PO en tient lieu), donc il n'a simplement
  // rien à y faire (cf. teamLabel null ci-dessous).
  function isGeneralManager(currentUser) {
    return !!currentUser && currentUser.isSuperAdmin === true;
  }

  // #14 — Un manager de SERVICE (com/ebf/data) a terminé sa part d'affectation
  // dès qu'au moins une personne de son équipe est affectée — ou si son équipe
  // n'est pas requise par la campagne. On cesse alors de lui proposer l'action
  // d'affectation : la carte disparaît du tableau de bord « à produire » et le
  // bloc d'affectation n'est plus présenté. Le manager général (super-admin)
  // garde la main jusqu'à la validation de l'étape globale.
  function managerAffectationDone(currentUser, campaignData) {
    if (!currentUser || currentUser.isManager !== true || !campaignData) return false;
    if (isGeneralManager(currentUser)) return false;
    var role = currentUser.role;
    var teamLabel = role === 'com' ? 'Com' : (role === 'ebf' ? 'EBF' : (role === 'data' ? 'Data' : null));
    if (!teamLabel) return true; // rôle non concerné par l'affectation d'équipe (rien à faire pour lui)
    var requiredTeams = campaignData.requiredTeams || [];
    if (!isTeamRequired(requiredTeams, teamLabel)) return true; // rien à affecter pour ce service
    var assignments = (campaignData.workflow && campaignData.workflow.assignments) || {};
    var assigned = assignments[role];
    var arr = Array.isArray(assigned) ? assigned : (assigned ? [assigned] : []);
    return arr.length > 0;
  }

  // Assignés EFFECTIFS d'un rôle sur un canal donné = équipe de base (campagne)
  // + renforts propres à ce canal (channelAssignments). Additif : un renfort
  // ajouté sur un canal n'affecte pas les autres canaux (L2 #15).
  function _asArr(v) { return Array.isArray(v) ? v : (v ? [v] : []); }
  // PO effectif : le PO principal OU un co-PO (suppléance congés).
  function isPoName(campaignData, name) {
    if (!name || !campaignData) return false;
    if (name === (campaignData.po || '')) return true;
    return _asArr(campaignData.coPo).indexOf(name) !== -1;
  }
  function channelAssignees(campaignData, channelIdx, role) {
    var wf = campaignData.workflow || {};
    var base = _asArr((wf.assignments || {})[role]);
    var extra = [];
    if (wf.channelAssignments && wf.channelAssignments[channelIdx]) {
      extra = _asArr(wf.channelAssignments[channelIdx][role]);
    }
    var seen = {}, out = [];
    base.concat(extra).forEach(function (n) { if (n && !seen[n]) { seen[n] = 1; out.push(n); } });
    return out;
  }

  // ─────────────────────────────────────────────────────────
  // AFFECTATION AUTOMATIQUE (règles paramétrables — L2 #21)
  // ─────────────────────────────────────────────────────────
  // Valeur d'un champ de condition pour une campagne / un canal donné.
  function _autoFieldValue(campaignData, ch, field) {
    switch (field) {
      case 'comType':      return ch && ch.comType;
      case 'volumeCible':  return ch && ch.volumeCible;
      case 'content':      return ch && ch.content;
      case 'comTypology':  return ch && ch.comTypology;
      case 'market':       return campaignData.market;
      case 'typology':     return campaignData.typology;
      case 'recurrence':   return campaignData.recurrence;
      case 'ubs':          return campaignData.ubs; // tableau
      default:             return undefined;
    }
  }
  function _autoCondMatch(actual, op, value) {
    var arr = Array.isArray(actual) ? actual.map(function (x) { return String(x).toLowerCase(); }) : null;
    var a = (actual == null) ? '' : String(actual);
    var v = (value == null) ? '' : String(value);
    switch (op) {
      case 'equals':    return arr ? arr.indexOf(v.toLowerCase()) !== -1 : a === v;
      case 'notEquals': return arr ? arr.indexOf(v.toLowerCase()) === -1 : a !== v;
      case 'contains':  return arr ? arr.indexOf(v.toLowerCase()) !== -1 : a.toLowerCase().indexOf(v.toLowerCase()) !== -1;
      case 'gt':        return parseFloat(a) >  parseFloat(v);
      case 'gte':       return parseFloat(a) >= parseFloat(v);
      case 'lt':        return parseFloat(a) <  parseFloat(v);
      case 'lte':       return parseFloat(a) <= parseFloat(v);
      case 'in':        return v.split(',').map(function (s) { return s.trim().toLowerCase(); }).indexOf(a.toLowerCase()) !== -1;
      default:          return false;
    }
  }
  function _addPeople(target, role, people) {
    var cur = _asArr(target[role]);
    var seen = {}; cur.forEach(function (n) { seen[n] = 1; });
    people.forEach(function (n) { if (n && !seen[n]) { seen[n] = 1; cur.push(n); } });
    target[role] = cur;
  }
  /**
   * Applique les règles d'affectation automatique à une campagne.
   * Une règle = { name, conditions:[{field,op,value}] (toutes vraies), role,
   * people:[], replaceManagerAffectation:bool }.
   *  - replaceManagerAffectation = true  → affecte l'équipe de la CAMPAGNE
   *    (le manager du service est ainsi dispensé de l'étape d'affectation) ;
   *  - false → ajoute un renfort sur le(s) canal(aux) concerné(s).
   * Toujours ADDITIF (n'écrase jamais une affectation existante).
   */
  function applyAutoAssignments(campaignData, rules) {
    if (!rules || !rules.length) return campaignData;
    initWorkflow(campaignData);
    var wf = campaignData.workflow;
    var channels = campaignData.channels || [];
    rules.forEach(function (rule) {
      if (!rule || !rule.role || !(rule.people && rule.people.length)) return;
      var conds = rule.conditions || [];
      var matched = [];
      channels.forEach(function (ch, idx) {
        var ok = conds.every(function (c) { return _autoCondMatch(_autoFieldValue(campaignData, ch, c.field), c.op, c.value); });
        if (ok) matched.push(idx);
      });
      if (!matched.length) return;
      if (rule.replaceManagerAffectation) {
        _addPeople(wf.assignments, rule.role, rule.people);
      } else {
        if (!wf.channelAssignments) wf.channelAssignments = {};
        matched.forEach(function (idx) {
          if (!wf.channelAssignments[idx]) wf.channelAssignments[idx] = {};
          _addPeople(wf.channelAssignments[idx], rule.role, rule.people);
        });
      }
    });
    return campaignData;
  }

  function getAvailableActions(currentUser, campaignData) {
    if (!currentUser || !campaignData) return [];
    initWorkflow(campaignData);

    var actions = [];
    var globalSteps = campaignData.workflow.steps;

    // Étapes globales
    STEPS.slice(0, 3).forEach(function (step) {
      var status = globalSteps[step.id] || 'locked';
      if (status !== 'pending' && status !== 'revision_requested') return;
      var actorMatch = false;
      if (step.actor === 'po') {
        actorMatch = isPoName(campaignData, currentUser.name);
      } else if (step.actor === 'manager') {
        actorMatch = currentUser.isManager === true;
        // #14 : un manager de service ayant déjà affecté son équipe n'a plus
        // l'action d'affectation (la carte quitte le tableau de bord « à produire »).
        if (actorMatch && step.id === 'manager_affectation' && managerAffectationDone(currentUser, campaignData)) {
          actorMatch = false;
        }
      }
      if (actorMatch) actions.push({ step: step, status: status });
    });

    // Étapes canal — agrégées (une seule occurrence par stepId)
    var cs = campaignData.workflow.channelSteps || {};
    var numChannels = Math.max((campaignData.channels || []).length, 1);
    var seenSteps = {};

    STEPS.slice(3).forEach(function (step) {
      if (seenSteps[step.id]) return;
      for (var ci = 0; ci < numChannels; ci++) {
        if (!cs[ci]) continue;
        var status = cs[ci][step.id] || 'locked';
        if (status !== 'pending' && status !== 'revision_requested') continue;
        // Acteur résolu PAR CANAL (surcharge admin éventuelle — Administration ▸
        // Workflow) : deux canaux du même step.id peuvent avoir un acteur différent.
        var chContentAA = campaignData.channels && campaignData.channels[ci] && campaignData.channels[ci].content;
        var actor = stepActor(step.id, chContentAA);
        var actorMatch = false;
        if (actor === 'po') {
          actorMatch = isPoName(campaignData, currentUser.name);
        } else {
          // Assignés effectifs de CE canal (base campagne + renfort du canal).
          actorMatch = channelAssignees(campaignData, ci, actor).indexOf(currentUser.name) !== -1;
        }
        if (actorMatch) {
          seenSteps[step.id] = true;
          actions.push({ step: step, status: status });
          break;
        }
      }
    });

    return actions;
  }

  // ─────────────────────────────────────────────────────────
  // SAUVEGARDE
  // ─────────────────────────────────────────────────────────

  // Le dossier Campagnes/ est partagé (OneDrive/SharePoint) : plusieurs
  // utilisateurs peuvent éditer la même campagne en parallèle. Comme chaque
  // sauvegarde réécrit tout campagne.json, un « dernier qui écrit gagne »
  // écrasait les modifications des autres (notes kick-off, validations, canaux…).
  //
  // On corrige par une fusion 3-way : à l'ouverture on mémorise l'état lu sur
  // disque (baseline) ; à la sauvegarde on relit le disque et on n'applique que
  // les champs que CET utilisateur a réellement modifiés, par-dessus la version
  // disque (qui peut contenir les modifs concurrentes des autres).
  var _baselines = (typeof WeakMap !== 'undefined') ? new WeakMap() : null;

  function _isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
  }
  function _deepClone(v) {
    return (v === undefined || v === null) ? v : JSON.parse(JSON.stringify(v));
  }
  function _deepEqual(a, b) {
    return JSON.stringify(a === undefined ? null : a) === JSON.stringify(b === undefined ? null : b);
  }

  /**
   * Fusion 3-way : repart de `theirs` (version disque la plus récente) et
   * applique uniquement les changements de `mine` par rapport à `base`.
   * - objets : fusion récursive clé par clé
   * - tableaux / scalaires : si je l'ai modifié vs base → ma valeur gagne,
   *   sinon on garde la valeur disque (celle des autres)
   */
  function threeWayMerge(base, mine, theirs) {
    if (!_isPlainObject(mine)) {
      // Valeur non-objet : ma valeur si je l'ai changée, sinon celle du disque
      return _deepEqual(mine, base) ? _deepClone(theirs) : _deepClone(mine);
    }
    base = _isPlainObject(base) ? base : {};
    var result = _isPlainObject(theirs) ? _deepClone(theirs) : {};

    Object.keys(mine).forEach(function (k) {
      var mv = mine[k], bv = base[k], tv = result[k];
      if (_isPlainObject(mv) && (_isPlainObject(tv) || tv === undefined)) {
        result[k] = threeWayMerge(bv, mv, tv);
      } else if (!_deepEqual(mv, bv)) {
        result[k] = _deepClone(mv);            // je l'ai modifié → ma valeur gagne
      } else if (tv === undefined) {
        result[k] = _deepClone(mv);            // inchangé mais absent du disque
      }
      // sinon : inchangé par moi → on garde la valeur disque déjà présente
    });

    // Clés que j'ai supprimées (présentes dans base, absentes de mine) :
    // on ne les retire que si le disque ne les a pas modifiées entre-temps.
    Object.keys(base).forEach(function (k) {
      if (!(k in mine) && (k in result) && _deepEqual(base[k], result[k])) {
        delete result[k];
      }
    });
    return result;
  }

  /**
   * Mémorise l'état de référence d'une campagne (à appeler juste après le
   * chargement depuis le disque). Permet la fusion 3-way à la sauvegarde.
   */
  function captureBaseline(campaignData) {
    if (_baselines && _isPlainObject(campaignData)) {
      _baselines.set(campaignData, _deepClone(campaignData));
    }
  }

  // Remplace en place le contenu de `target` par celui de `source`
  // (conserve la référence objet utilisée ailleurs dans la page).
  function _replaceInPlace(target, source) {
    Object.keys(target).forEach(function (k) { if (!(k in source)) delete target[k]; });
    Object.keys(source).forEach(function (k) { target[k] = _deepClone(source[k]); });
  }

  /**
   * Sauvegarde campagne.json avec le workflow mis à jour.
   * Relit le disque et fusionne (3-way) pour ne pas écraser les modifications
   * concurrentes d'autres utilisateurs. En cas d'échec de relecture/fusion,
   * on retombe sur l'écriture directe (comportement historique) pour ne jamais
   * bloquer une sauvegarde.
   */
  function saveCampaignWorkflow(rootHandle, campaignName, campaignData) {
    var campaignDirRef;
    return rootHandle.getDirectoryHandle('Campagnes')
      .then(function (campagnesDir) {
        return campagnesDir.getDirectoryHandle(campaignName);
      })
      .then(function (campaignDir) {
        campaignDirRef = campaignDir;
        // Relecture de la version disque pour fusion (non bloquante)
        return campaignDir.getFileHandle('campagne.json', { create: false })
          .then(function (fh) { return fh.getFile(); })
          .then(function (f) { return f.text(); })
          .then(function (txt) { try { return JSON.parse(txt); } catch (e) { return null; } })
          .catch(function () { return null; });
      })
      .then(function (diskData) {
        var baseline = _baselines ? _baselines.get(campaignData) : null;
        _stampChannelStepDates(campaignData, baseline);
        if (diskData && baseline) {
          var merged = threeWayMerge(baseline, campaignData, diskData);
          _replaceInPlace(campaignData, merged); // l'objet en mémoire reflète la fusion
        }
        // Nouvelle référence = ce qu'on vient d'écrire
        if (_baselines) _baselines.set(campaignData, _deepClone(campaignData));
        return campaignDirRef.getFileHandle('campagne.json', { create: false });
      })
      .then(function (fileHandle) {
        return fileHandle.createWritable();
      })
      .then(function (writable) {
        var json = JSON.stringify(campaignData, null, 2);
        return writable.write(json).then(function () {
          return writable.close();
        });
      })
      .then(function () {
        invalidateMetadataCache(campaignName);
        // L'index est un fichier dérivé (reconstructible) : un échec ici n'est pas bloquant
        // car campagne.json a déjà été écrit. On le signale sans interrompre.
        return updateCampaignIndex(rootHandle, campaignName, campaignData).catch(function (err) {
          console.warn('Mise à jour de _index.json échouée (non bloquant) :', err);
        });
      });
  }

  /**
   * Invalide l'entrée d'une campagne dans l'IndexedDB 'ImpulsionMetaCache'
   */
  function invalidateMetadataCache(campaignName) {
    try {
      var req = indexedDB.open('ImpulsionMetaCache', 1);
      req.onsuccess = function (e) {
        try {
          var tx = e.target.result.transaction('meta', 'readwrite');
          tx.objectStore('meta').delete(campaignName);
        } catch (err) { /* silencieux */ }
      };
    } catch (e) { /* silencieux */ }
  }

  // ─────────────────────────────────────────────────────────
  // INDEX DE CAMPAGNES (_index.json dans Campagnes/)
  // ─────────────────────────────────────────────────────────

  // Seuil d'alerte volume : piloté par _config.json (settings.volumeAlertThreshold).
  function volumeAlertSeuil() {
    var s = window.ImpulsionMarketing && window.ImpulsionMarketing.config && window.ImpulsionMarketing.config.APP_SETTINGS;
    return (s && typeof s.volumeAlertThreshold === 'number') ? s.volumeAlertThreshold : 100000;
  }

  /**
   * Construit un objet steps synthétique pour la rétrocompatibilité de l'index
   * (global steps + premier canal pour le dashboard)
   */
  function getEffectiveStepsForIndex(campaignData) {
    var globalSteps = campaignData.workflow.steps || {};
    var cs = campaignData.workflow.channelSteps || {};
    var firstCs = cs[0] || DEFAULT_CHANNEL_STEPS;
    return Object.assign({}, DEFAULT_CHANNEL_STEPS, firstCs, globalSteps);
  }

  // #27 — Agrège tous les champs cherchables (références canaux + champs
  // campagne) en une chaîne minuscule, pour la recherche du tableau de bord
  // et de la page Campagnes.
  //
  // Générique plutôt qu'une liste figée : TOUT champ à plat sur l'objet
  // campagne ou sur un canal (y compris un champ personnalisé ajouté depuis
  // Administration ▸ Champs personnalisés sur un point d'attache saisi à la
  // création/l'édition — po_saisie / cible / produit / canal) est
  // automatiquement couvert, sans maintenance à chaque nouveau champ.
  // Hors périmètre : les champs saisis plus tard dans le workflow (dépôts
  // Com/EBF/Data étape par étape) vivent dans des fichiers séparés par canal
  // (depotcom.json…), jamais chargés sur les pages de liste — les inclure
  // demanderait de lire un fichier de plus par canal et par campagne.
  function buildSearchBlob(campaignData) {
    var parts = [];
    function add(v) {
      if (v == null || v === '' || v === false) return;
      if (Array.isArray(v)) { v.forEach(add); return; }
      if (typeof v === 'object') return; // structures dédiées (workflow, siteWeb…), traitées à part
      parts.push(String(v));
    }
    Object.keys(campaignData).forEach(function (k) {
      if (k === 'workflow' || k === 'channels') return; // structures dédiées
      add(campaignData[k]);
    });
    // Personnes affectées (manager + Com/EBF/Data) : permet de rechercher par le
    // nom d'une personne et de retrouver TOUTES ses campagnes (pas que le PO).
    var _asn = (campaignData.workflow && campaignData.workflow.assignments) || {};
    add(_asn.manager); add(_asn.com); add(_asn.ebf); add(_asn.data);
    (campaignData.channels || []).forEach(function (c) {
      Object.keys(c).forEach(function (k) {
        if (k === 'siteWeb') return; // structure dédiée
        add(c[k]);
      });
      if (c.siteWeb) Object.keys(c.siteWeb).forEach(function (k) { add(c.siteWeb[k]); });
    });
    return parts.join(' ').toLowerCase();
  }

  function extractIndexEntry(campaignData) {
    initWorkflow(campaignData);
    var volumeAlert = false;
    if (campaignData.channels && campaignData.channels.length > 0) {
      for (var i = 0; i < campaignData.channels.length; i++) {
        if ((campaignData.channels[i].volumeCible || 0) > volumeAlertSeuil()) {
          volumeAlert = true;
          break;
        }
      }
    }
    var chs = (campaignData.channels || []).map(function (c) {
      return {
        deliverableName: c.deliverableName,
        content: c.content,
        comType: c.comType || '',
        siteWebDateFin: (c.siteWeb && c.siteWeb.dateFin) ? c.siteWeb.dateFin : null,
        ebfWebmaster: (c.siteWeb && c.siteWeb.webmaster) ? c.siteWeb.webmaster : null
      };
    });
    return {
      id:          campaignData.id || '',
      po:          campaignData.po || '',
      copo:        campaignData.coPo || null,
      desc:        campaignData.description || '',
      launch:      campaignData.launchDate || '',
      mkt:         campaignData.market || '',
      typ:         campaignData.typology || '',
      chs:         chs,
      mod:         Date.now(),
      asn:         Object.assign({}, campaignData.workflow.assignments),
      casn:        campaignData.workflow.channelAssignments || null,
      steps:       getEffectiveStepsForIndex(campaignData),
      // Étapes réelles par canal : indispensables pour que le tableau de bord
      // sache, canal par canal, ce qu'il reste à produire (« à produire ») —
      // `steps` ci-dessus ne résume que le canal 0.
      csteps:      campaignData.workflow.channelSteps || null,
      done:        isCompleted(campaignData),
      actif:       campaignData.actif !== false,
      volumeAlert: volumeAlert,
      requiredTeams: campaignData.requiredTeams || null,
      chprog:      getChannelProgress(campaignData),
      srch:        buildSearchBlob(campaignData)
    };
  }

  function readIndexFromDir(campaignsDir) {
    return campaignsDir.getFileHandle('_index.json', { create: false })
      .then(function (fh) { return fh.getFile(); })
      .then(function (f)  { return f.text(); })
      .then(function (text) {
        var idx = JSON.parse(text);
        if (!idx.campaigns) idx.campaigns = {};
        return idx;
      })
      .catch(function () { return { v: 1, campaigns: {} }; });
  }

  function writeIndexToDir(campaignsDir, index) {
    return campaignsDir.getFileHandle('_index.json', { create: true })
      .then(function (fh) { return fh.createWritable(); })
      .then(function (writable) {
        return writable.write(JSON.stringify(index)).then(function () {
          return writable.close();
        });
      });
  }

  function updateCampaignIndex(rootHandle, campaignName, campaignData) {
    var entry = extractIndexEntry(campaignData);
    return rootHandle.getDirectoryHandle('Campagnes')
      .then(function (dir) {
        return readIndexFromDir(dir).then(function (index) {
          index.campaigns[campaignName] = entry;
          return writeIndexToDir(dir, index).then(function () {
            var ic = window.ImpulsionMarketing &&
                     window.ImpulsionMarketing.performance &&
                     window.ImpulsionMarketing.performance.IndexCache;
            if (ic) ic.set(rootHandle.name, index);
          });
        });
      });
  }

  function updateCampaignIndexFromDir(campaignsDir, campaignName, campaignData) {
    var entry = extractIndexEntry(campaignData);
    return readIndexFromDir(campaignsDir).then(function (index) {
      index.campaigns[campaignName] = entry;
      return writeIndexToDir(campaignsDir, index);
    });
  }

  function buildFullIndex(rootHandle) {
    return rootHandle.getDirectoryHandle('Campagnes')
      .then(function (campaignsDir) {
        function collectDirs(iterator, dirs) {
          return iterator.next().then(function (res) {
            if (res.done) return dirs;
            var name   = res.value[0];
            var handle = res.value[1];
            if (handle.kind === 'directory') dirs.push({ name: name, handle: handle });
            return collectDirs(iterator, dirs);
          });
        }
        return collectDirs(campaignsDir.entries(), [])
          .then(function (dirs) {
            return Promise.all(dirs.map(function (d) {
              return d.handle.getFileHandle('campagne.json')
                .then(function (fh) { return fh.getFile(); })
                .then(function (f) {
                  return f.text().then(function (text) {
                    try { return { name: d.name, data: JSON.parse(text) }; }
                    catch (e) { return null; }
                  });
                })
                .catch(function () { return null; });
            }));
          })
          .then(function (results) {
            var index = { v: 1, campaigns: {} };
            results.filter(Boolean).forEach(function (c) {
              initWorkflow(c.data);
              index.campaigns[c.name] = extractIndexEntry(c.data);
            });
            return writeIndexToDir(campaignsDir, index).then(function () { return index; });
          });
      });
  }

  // ─────────────────────────────────────────────────────────
  // EXPORTS
  // ─────────────────────────────────────────────────────────

  return {
    STEPS:                    STEPS,
    CHANNEL_STEP_IDS:         CHANNEL_STEP_IDS,
    GLOBAL_STEP_IDS:          GLOBAL_STEP_IDS,
    isStepApplicable:         isStepApplicable,
    stepLabel:                stepLabel,
    stepActor:                stepActor,
    channelStepIds:           _channelStepIds,
    depotValidationMap:       _DEPOT_VALIDATION,
    isTeamRequired:           isTeamRequired,
    isChannelCompleted:       isChannelCompleted,
    buildSearchBlob:          buildSearchBlob,
    initWorkflow:             initWorkflow,
    advanceStep:              advanceStep,
    advanceChannelStep:       advanceChannelStep,
    requestRevision:          requestRevision,
    requestChannelRevision:   requestChannelRevision,
    reopenChannelStep:        reopenChannelStep,
    getChannelRevisionLog:    getChannelRevisionLog,
    getChannelStepDate:       getChannelStepDate,
    channelAssignees:         channelAssignees,
    applyAutoAssignments:     applyAutoAssignments,
    initChannelValidations:   initChannelValidations,
    validateChannelStep:      validateChannelStep,
    refuseChannelJuridique:   refuseChannelJuridique,
    juridiqueRequired:        juridiqueRequired,
    recalcUnlocks:            recalcUnlocks,
    recalcChannelUnlocks:     recalcChannelUnlocks,
    isCompleted:              isCompleted,
    getCurrentStepLabel:      getCurrentStepLabel,
    getChannelProgress:       getChannelProgress,
    saveCampaignWorkflow:     saveCampaignWorkflow,
    captureBaseline:          captureBaseline,
    threeWayMerge:            threeWayMerge,
    getAvailableActions:      getAvailableActions,
    managerAffectationDone:   managerAffectationDone,
    updateCampaignIndex:      updateCampaignIndex,
    updateCampaignIndexFromDir: updateCampaignIndexFromDir,
    buildFullIndex:           buildFullIndex
  };
})();
/**
 * Champs personnalisés — Impulsion Marketing
 * Moteur générique : définitions de champ par « point d'attache », rendu HTML,
 * câblage (conditionnalité, listes répétables), collecte des valeurs, validation.
 *
 * Un point d'attache identifie où un champ s'affiche : les id d'étape du workflow
 * (mêmes id que js/workflow-standalone.js, ex. 'ebf_bat'), ou l'un des emplacements
 * du formulaire de création : 'creation.step1' (Informations générales),
 * 'creation.step2' (Segmentation), 'creation.step3' (Détails produit),
 * 'creation.step3.canal.base' (socle de chaque canal, jamais filtré par type de
 * livrable), 'creation.step3.canal' (champs additionnels par canal, filtrables
 * par type de livrable via canalTypes).
 *
 * Ce module ne connaît PAS le stockage sur disque (dépôts, fichiers) : il lit/écrit
 * uniquement dans l'objet `values` qu'on lui passe. C'est à l'appelant (details.html,
 * campaign.html) de faire le lien avec les bonnes clés de campagne.json.
 */

window.ImpulsionMarketing = window.ImpulsionMarketing || {};

window.ImpulsionMarketing.customFields = (function () {
  'use strict';

  var IM = window.ImpulsionMarketing;

  function esc(s) { var sec = IM.security; return (sec && sec.escapeHtml) ? sec.escapeHtml(s) : String(s == null ? '' : s); }
  // IM.security.escapeHtml échappe pour un contexte TEXTE (<, >, &) mais pas les
  // guillemets doubles — insuffisant pour une valeur placée dans un attribut
  // HTML="...", où un " dans la valeur (ex. JSON.stringify, texte saisi par
  // l'utilisateur) romprait l'attribut. escAttr() complète l'échappement pour ce cas.
  function escAttr(s) { return esc(s).replace(/"/g, '&quot;'); }
  function isValidUrl(u) { var sec = IM.security; return (sec && sec.isValidUrl) ? sec.isValidUrl(u) : /^https?:\/\/.+/i.test(u || ''); }

  var TYPE_LABELS = {
    text: 'Texte court',
    textarea: 'Texte long',
    url: 'URL',
    number: 'Nombre',
    date: 'Date',
    select: 'Liste déroulante',
    radio: 'Choix unique (radio)',
    checkbox: 'Case à cocher',
    'checkbox-group': 'Cases à cocher multiples',
    list: 'Liste répétable (URLs ou textes)',
    richtext: 'Texte enrichi',
    file: 'Fichier'
  };

  // Champs déjà en place avant l'admin « Champs personnalisés », migrés vers le
  // moteur générique — repli utilisé UNIQUEMENT pour un point d'attache que
  // l'admin n'a PAS ENCORE configuré (même principe que workflow.steps : la
  // config stockée sur V:// prévaut dès qu'elle existe, point d'attache par
  // point d'attache). Indispensable pour ne jamais perdre un champ existant
  // après une mise à jour de code SANS mise à jour synchrone de _config.json —
  // "Données de production" ne se redéploie jamais avec le code.
  var DEFAULT_FIELDS = {
    'creation.step1': [
      { id: 'taskName', label: 'Nom de la tache planner (ID)', type: 'text', order: 1, required: true },
      { id: 'description', label: 'DESCRIPTION', type: 'textarea', order: 2, required: true },
      { id: 'launchDate', label: 'Date Envoi client', type: 'date', order: 3, required: true },
      { id: 'kickoffNeeded', label: 'Kick-off', type: 'radio', order: 4, options: ['Oui', 'Non'] },
      { id: 'kickoffDate', label: 'Date de kick-off', type: 'date', order: 5, showIf: { field: 'kickoffNeeded', op: 'eq', value: 'Oui' } },
      { id: 'typology', label: 'Typologie', type: 'select', order: 6, required: true, configRef: 'TYPOLOGIES' },
      { id: 'market', label: 'Marché', type: 'select', order: 7, required: true, configRef: 'MARCHES' },
      { id: 'recurrence', label: 'Récurrence', type: 'select', order: 8, required: true, configRef: 'RECURRENCES' },
      { id: 'juridiqueRequired', label: 'Validation juridique et conformité', checkboxLabel: 'Cette campagne nécessite une validation juridique et conformité', type: 'checkbox', order: 9 },
      { id: 'juridiqueComment', label: 'Commentaire juridique', type: 'textarea', order: 10, showIf: { field: 'juridiqueRequired', op: 'checked' }, help: 'Instructions, contraintes, points de vigilance...' }
    ],
    'creation.step2': [
      { id: 'cibleProspect', label: 'Cible aussi des prospects', checkboxLabel: 'Cible aussi des prospects', type: 'checkbox', order: 1 },
      { id: 'prospectSource', label: 'Source / précision', type: 'text', order: 2, showIf: { field: 'cibleProspect', op: 'checked' }, help: 'Ex : courriers refus EER, listes entreprises…' },
      { id: 'persona', label: 'Persona', type: 'text', order: 3 }
    ],
    'creation.step3': [
      { id: 'productUrl', label: 'URL fiche produit', type: 'url', order: 1 },
      { id: 'offrePromo', label: 'Offre promotionnelle', type: 'radio', order: 2, options: ['Oui', 'Non'] },
      { id: 'offerValidityDate', label: 'Date de mise en vigueur de l\'offre', type: 'date', order: 3, showIf: { field: 'offrePromo', op: 'eq', value: 'Oui' } },
      { id: 'offerEndDate', label: 'Date de fin de validité', type: 'date', order: 4, showIf: { field: 'offrePromo', op: 'eq', value: 'Oui' } },
      { id: 'parcoursSelfcare', label: 'Parcours selfcare', type: 'radio', order: 5, options: ['Oui', 'Non'] },
      { id: 'parcoursSimulateur', label: 'Parcours simulateur', type: 'radio', order: 6, options: ['Oui', 'Non'] },
      { id: 'transfo', label: 'Transfo', type: 'radio', order: 7, options: ['Oui', 'Non'], required: true },
      { id: 'lotNumber', label: 'Numéro de Lot', type: 'select', order: 8, configRef: 'LOTS', showIf: { field: 'transfo', op: 'eq', value: 'Oui' } }
    ],
    // Champs « socle » de chaque canal — présents une seule fois par canal,
    // JAMAIS filtrés par canalTypes (contrairement à 'creation.step3.canal' qui
    // reste réservé aux champs additionnels propres à certains types de livrable).
    'creation.step3.canal.base': [
      { id: 'channelContent', label: 'Type de livrable', type: 'select', order: 1, required: true, configRef: 'CANAUX' },
      { id: 'deliverableLabel', label: 'Nom du livrable', type: 'text', order: 2, required: true, help: 'Le nom final est standardisé : Type de livrable - votre saisie. Il doit rester unique pour chaque canal.' },
      { id: 'comType', label: 'Type de Com', type: 'select', order: 3, required: true, configRef: 'TYPES_COM' },
      { id: 'targetingCriteria', label: 'Critère ciblage', type: 'text', order: 4, required: true },
      { id: 'comTypology', label: 'Typologie de communication', type: 'radio', order: 5, required: true, configRef: 'COM_TYPOLOGIES' },
      { id: 'urlLccx', label: 'Lien LCCX (optionnel)', type: 'url', order: 6 }
    ],
    // Étapes de production (details.html) : mêmes id que le Workflow. Les id de
    // champ se terminent par un tiret car ces étapes utilisent idSuffix (pas
    // idPrefix) — un seul canal est affiché à la fois dans le DOM, mais le code
    // de collecte du dépôt (hors moteur générique, ex. collectDataMepDepot)
    // référence encore l'id complet 'data-mepdate-' + idx directement.
    'ebf_bat': [
      { id: 'ebf-emailobject-', label: 'Objet de l\'email', type: 'text', order: 1, canalTypes: ['MAIL', 'MAIL + E-MESSAGE'], help: 'Ex : Découvrez notre offre exclusive...' },
      { id: 'ebf-codecom-', label: 'Code Com', type: 'text', order: 2 }
    ],
    // Volume cible reste en dur (libellé avec seuil d'alerte configurable par
    // caisse, non exprimable dans une définition de champ statique).
    'data_ciblage': [
      { id: 'data-codeproj-', label: 'Code Projet', type: 'text', order: 1 },
      { id: 'data-codeaction-', label: 'Code Action', type: 'text', order: 2 },
      { id: 'data-codemk-', label: 'Code MK', type: 'text', order: 3 },
      { id: 'data-chemin-', label: 'Chemin de la Requête', type: 'text', order: 4 },
      { id: 'data-urlechantillon-', label: 'URL de l\'échantillon à valider', type: 'url', order: 5, help: 'Lien vers l\'échantillon' }
    ],
    'com_maquette': [
      { id: 'com-depot-date-', label: 'Date de dépôt maquette', type: 'date', order: 1 },
      { id: 'com-figma-', label: 'URL Figma', type: 'url', order: 2 },
      { id: 'com-numimages-', label: 'Nombre d\'images', type: 'number', order: 3 }
    ],
    'data_lancement_test': [
      { id: 'data-cibletest-', label: 'Cible du test', type: 'text', order: 1, help: 'Ex : 50 clients segment X' }
    ],
    'data_mise_en_prod': [
      { id: 'data-mepdate-', label: 'Date de mise en production effective', type: 'date', order: 1 },
      { id: 'data-mepfirstsend-', label: 'Date du premier envoi', type: 'date', order: 2 },
      { id: 'data-mepcomment-', label: 'Commentaire (optionnel)', type: 'text', order: 3 }
    ],
    'ebf_mise_en_prod': [
      { id: 'ebf-mepdate-', label: 'Date de mise en production effective', type: 'date', order: 1 },
      { id: 'ebf-mepcomment-', label: 'Commentaire (optionnel)', type: 'text', order: 2 }
    ]
  };

  // ── Lecture de la config ──
  // Fusionne les définitions par défaut (DEFAULT_FIELDS) et celles stockées dans
  // _config.json — la config l'emporte ENTIÈREMENT, point d'attache par point
  // d'attache, dès qu'elle existe (un admin qui édite « Informations générales »
  // sauvegarde sa version complète, qui remplace alors le repli par défaut).
  function allDefs() {
    var cfg = (IM.config && IM.config.CUSTOM_FIELDS && typeof IM.config.CUSTOM_FIELDS === 'object') ? IM.config.CUSTOM_FIELDS : {};
    var out = {};
    Object.keys(DEFAULT_FIELDS).forEach(function (k) { out[k] = DEFAULT_FIELDS[k]; });
    Object.keys(cfg).forEach(function (k) { out[k] = cfg[k]; });
    return out;
  }

  function attachPoints() {
    return Object.keys(allDefs());
  }

  // Champs définis pour un point d'attache, filtrés par type de canal (si le champ
  // restreint canalTypes) et triés par ordre d'affichage.
  //
  // `canalType` OMIS (undefined) = contexte sans canal précis (ex. listing admin) →
  // repli permissif, tous les champs sont renvoyés (cohérent avec CANAL_STEPS :
  // absent = flux complet). `canalType` fourni mais vide ('') = contexte utilisateur
  // réel où aucun type n'est encore choisi → un champ restreint doit rester masqué
  // (sinon il apparaîtrait puis disparaîtrait au premier choix, effet de bord gênant
  // dans le formulaire de création).
  function getFields(attachPoint, canalType) {
    var list = allDefs()[attachPoint];
    if (!Array.isArray(list)) return [];
    return list
      .filter(function (f) { return f && f.id && f.type; })
      .filter(function (f) {
        if (!Array.isArray(f.canalTypes) || !f.canalTypes.length) return true;
        if (canalType === undefined) return true;
        return f.canalTypes.indexOf(canalType) !== -1;
      })
      .slice()
      .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  }

  // Options d'un champ select/radio/checkbox-group : soit une liste en dur
  // (field.options), soit une liste déjà pilotée par l'admin (field.configRef,
  // ex. 'CANAUX', 'MARCHES' → réutilise IM.config.<REF>).
  function fieldOptions(field) {
    if (Array.isArray(field.options)) return field.options;
    if (field.configRef && IM.config && Array.isArray(IM.config[field.configRef])) return IM.config[field.configRef];
    return [];
  }

  function isSimpleRequired(f) { return f.required === true; }
  function requiredGroup(f) { return (f.required && typeof f.required === 'object' && f.required.group) ? f.required.group : null; }

  // Condition d'affichage : { field: <id du champ déclencheur>, op: 'eq'|'neq'|'in'|'checked'|'unchecked', value }
  function evalShowIf(field, values) {
    if (!field || !field.showIf || !field.showIf.field) return true;
    var cond = field.showIf;
    var v = values ? values[cond.field] : undefined;
    switch (cond.op) {
      case 'neq': return v !== cond.value;
      case 'in': return Array.isArray(cond.value) && cond.value.indexOf(v) !== -1;
      case 'checked': return v === true || v === 'true';
      case 'unchecked': return !(v === true || v === 'true');
      case 'eq':
      default: return v === cond.value;
    }
  }

  // ── Rendu HTML ──

  function inputHtml(field, value, domId) {
    value = value == null ? '' : value;
    switch (field.type) {
      case 'textarea':
        return '<textarea class="admin-input cf-input" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '">' + esc(value) + '</textarea>';
      case 'richtext':
        return '<div class="cf-richtext" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '" contenteditable="true">' + (value || '') + '</div>';
      case 'url':
        return '<input type="url" class="admin-input cf-input" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '" value="' + escAttr(value) + '" placeholder="https://...">';
      case 'number':
        return '<input type="number" class="admin-input cf-input" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '" value="' + escAttr(value) + '" min="0">';
      case 'date':
        return '<input type="date" class="admin-input cf-input" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '" value="' + escAttr(value) + '">';
      case 'select': {
        var opts = fieldOptions(field);
        var html = '<select class="admin-select cf-input" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '"><option value="">Choisir…</option>';
        opts.forEach(function (o) { html += '<option value="' + escAttr(o) + '"' + (value === o ? ' selected' : '') + '>' + esc(o) + '</option>'; });
        return html + '</select>';
      }
      case 'radio': {
        var ropts = fieldOptions(field);
        // Enveloppées dans .cf-options-row : un .cf-field est en flex-column
        // (un enfant direct par ligne), donc sans ce conteneur chaque option
        // radio se retrouverait seule sur sa propre ligne au lieu de s'aligner
        // horizontalement avec les autres.
        return '<div class="cf-options-row">' + ropts.map(function (o) {
          return '<label class="cf-radio-opt"><input type="radio" name="' + domId + '" data-cf-field="' + escAttr(field.id) + '" value="' + escAttr(o) + '"' + (value === o ? ' checked' : '') + '> ' + esc(o) + '</label>';
        }).join('') + '</div>';
      }
      case 'checkbox':
        return '<label class="cf-checkbox-opt"><input type="checkbox" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '"' + (value === true || value === 'true' ? ' checked' : '') + '> ' + esc(field.checkboxLabel || 'Oui') + '</label>';
      case 'checkbox-group': {
        var gopts = fieldOptions(field);
        var vals = Array.isArray(value) ? value : [];
        return '<div class="cf-options-row">' + gopts.map(function (o) {
          return '<label class="cf-checkbox-opt"><input type="checkbox" data-cf-field="' + escAttr(field.id) + '" data-cf-group-value="' + escAttr(o) + '"' + (vals.indexOf(o) !== -1 ? ' checked' : '') + '> ' + esc(o) + '</label>';
        }).join('') + '</div>';
      }
      case 'list': {
        var itemType = field.itemType === 'text' ? 'text' : 'url';
        var items = Array.isArray(value) && value.length ? value : [''];
        var rows = items.map(function (v) {
          return '<div class="cf-list-row"><input type="' + itemType + '" class="admin-input cf-input cf-list-item" data-cf-field="' + escAttr(field.id) + '" value="' + escAttr(v) + '" placeholder="' + (itemType === 'url' ? 'https://...' : '') + '">'
            + '<button type="button" class="icon-del cf-list-remove" data-cf-field="' + escAttr(field.id) + '" title="Retirer">✕</button></div>';
        }).join('');
        return '<div class="cf-list" data-cf-list="' + escAttr(field.id) + '" data-cf-item-type="' + itemType + '">' + rows
          + '<button type="button" class="btn btn-secondary cf-list-add" data-cf-field="' + escAttr(field.id) + '">+ Ajouter</button></div>';
      }
      case 'file':
        return '<input type="file" class="cf-input" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '">'
          + (typeof value === 'string' && value ? '<div class="cf-file-current">Fichier actuel : ' + esc(value) + '</div>' : '');
      case 'text':
      default:
        return '<input type="text" class="admin-input cf-input" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '" value="' + escAttr(value) + '">';
    }
  }

  function renderFields(attachPoint, values, opts) {
    opts = opts || {};
    values = values || {};
    var fields = getFields(attachPoint, opts.canalType);
    if (!fields.length) return '';
    // idPrefix OMIS (undefined) → préfixe auto-généré (cas normal, nouveaux champs
    // perso). idPrefix explicitement '' → PAS de préfixe, l'id DOM est field.id tel
    // quel — utilisé pour migrer un champ déjà existant sans changer son id (du
    // code externe au module peut le référencer directement, ex. document.getElementById('launchDate')).
    // idSuffix : variante SUFFIXE (field.id + suffixe, sans séparateur) — utilisée
    // pour migrer un champ déjà existant répété par canal (ex. 'channelContent' + i
    // → 'channelContent1'), convention déjà en place dans tout le formulaire de
    // création pour les champs par canal (jamais préfixée).
    var idPrefix = (opts.idPrefix !== undefined) ? opts.idPrefix : ('cf-' + attachPoint.replace(/[^a-zA-Z0-9]/g, '-'));
    var html = '';
    // Types qui profitent d'être sur toute la largeur plutôt que dans une
    // grille à 2 colonnes (texte long, contenu élargi par nature) — seule une
    // page qui place .cf-fields-block en grille (campaign.html, étapes 1/3)
    // s'en sert réellement ; sans grille parente la classe est sans effet.
    var WIDE_TYPES = { textarea: true, richtext: true, list: true, 'checkbox-group': true };
    fields.forEach(function (f) {
      var visible = evalShowIf(f, values);
      var marked = isSimpleRequired(f) || !!requiredGroup(f);
      var domId = (opts.idSuffix !== undefined) ? (f.id + opts.idSuffix) : (idPrefix ? (idPrefix + '-' + f.id) : f.id);
      html += '<div class="cf-field' + (WIDE_TYPES[f.type] ? ' cf-field--wide' : '') + '" data-cf-row="' + escAttr(f.id) + '"'
        + (f.showIf ? ' data-cf-showif="' + escAttr(JSON.stringify(f.showIf)) + '"' : '')
        + (visible ? '' : ' style="display:none;"') + '>';
      if (f.type !== 'checkbox') {
        html += '<label class="cf-label" for="' + escAttr(domId) + '">' + esc(f.label) + (marked ? ' <span class="cf-required">*</span>' : '') + '</label>';
      }
      html += inputHtml(f, values[f.id], domId);
      if (f.help) html += '<div class="cf-help">' + esc(f.help) + '</div>';
      html += '</div>';
    });
    return '<div class="cf-fields-block" data-cf-attach="' + escAttr(attachPoint) + '">' + html + '</div>';
  }

  // ── Câblage DOM ──

  function findBlock(cont, attachPoint) {
    if (!cont) return null;
    if (cont.classList && cont.classList.contains('cf-fields-block')) return cont;
    return cont.querySelector('.cf-fields-block[data-cf-attach="' + attachPoint + '"]');
  }

  function collectValues(cont, attachPoint, canalType) {
    var block = findBlock(cont, attachPoint);
    var values = {};
    if (!block) return values;
    getFields(attachPoint, canalType).forEach(function (f) {
      switch (f.type) {
        case 'checkbox': {
          var cb = block.querySelector('input[type="checkbox"][data-cf-field="' + f.id + '"]:not([data-cf-group-value])');
          values[f.id] = !!(cb && cb.checked);
          break;
        }
        case 'checkbox-group': {
          var vals = [];
          block.querySelectorAll('input[data-cf-field="' + f.id + '"][data-cf-group-value]').forEach(function (cb) {
            if (cb.checked) vals.push(cb.getAttribute('data-cf-group-value'));
          });
          values[f.id] = vals;
          break;
        }
        case 'radio': {
          var checked = block.querySelector('input[data-cf-field="' + f.id + '"]:checked');
          values[f.id] = checked ? checked.value : '';
          break;
        }
        case 'list': {
          var items = [];
          block.querySelectorAll('.cf-list-item[data-cf-field="' + f.id + '"]').forEach(function (inp) {
            if (inp.value.trim()) items.push(inp.value.trim());
          });
          values[f.id] = items;
          break;
        }
        case 'richtext': {
          var rt = block.querySelector('[data-cf-field="' + f.id + '"]');
          values[f.id] = rt ? rt.innerHTML : '';
          break;
        }
        case 'file': {
          var fi = block.querySelector('input[type="file"][data-cf-field="' + f.id + '"]');
          values[f.id] = (fi && fi.files && fi.files[0]) ? fi.files[0] : (values[f.id] || null);
          break;
        }
        default: {
          var el = block.querySelector('[data-cf-field="' + f.id + '"]');
          values[f.id] = el ? el.value : '';
        }
      }
    });
    return values;
  }

  // Câble la conditionnalité (showIf) et les listes répétables sur un bloc déjà
  // inséré dans le DOM. `onChange(values)` est appelé (optionnel) à chaque saisie.
  function wireFields(cont, attachPoint, opts) {
    opts = opts || {};
    var block = findBlock(cont, attachPoint);
    if (!block) return;

    function refreshVisibility() {
      var values = collectValues(block, attachPoint, opts.canalType);
      block.querySelectorAll('.cf-field[data-cf-showif]').forEach(function (row) {
        var cond = null;
        try { cond = JSON.parse(row.getAttribute('data-cf-showif')); } catch (e) { cond = null; }
        row.style.display = evalShowIf({ showIf: cond }, values) ? '' : 'none';
      });
      if (typeof opts.onChange === 'function') opts.onChange(values);
    }

    // Écoute en phase de CAPTURE (3e argument true), pas de bulle (par défaut) :
    // le reste de l'appli redéclenche parfois la conditionnalité d'un champ migré
    // via new Event('change') SANS l'option bubbles (convention déjà en place
    // partout ailleurs dans ces pages, ex. restauration d'un brouillon ou
    // pré-remplissage en édition) — un tel événement ne remonte jamais jusqu'à ce
    // conteneur délégué, mais la phase de capture, elle, traverse toujours les
    // ancêtres jusqu'à la cible, événement bouillonnant ou non.
    block.addEventListener('input', refreshVisibility, true);
    block.addEventListener('change', refreshVisibility, true);

    block.addEventListener('click', function (e) {
      var addBtn = e.target.closest && e.target.closest('.cf-list-add');
      if (addBtn) {
        var fieldId = addBtn.getAttribute('data-cf-field');
        var listEl = block.querySelector('.cf-list[data-cf-list="' + fieldId + '"]');
        if (!listEl) return;
        var itemType = listEl.getAttribute('data-cf-item-type') || 'url';
        var row = document.createElement('div');
        row.className = 'cf-list-row';
        row.innerHTML = '<input type="' + itemType + '" class="admin-input cf-input cf-list-item" data-cf-field="' + escAttr(fieldId) + '" value="" placeholder="' + (itemType === 'url' ? 'https://...' : '') + '">'
          + '<button type="button" class="icon-del cf-list-remove" data-cf-field="' + escAttr(fieldId) + '" title="Retirer">✕</button>';
        listEl.insertBefore(row, addBtn);
        return;
      }
      var rmBtn = e.target.closest && e.target.closest('.cf-list-remove');
      if (rmBtn) {
        var r = rmBtn.closest('.cf-list-row');
        var lst = rmBtn.closest('.cf-list');
        if (r && lst) {
          if (lst.querySelectorAll('.cf-list-row').length > 1) r.remove();
          else { var inp = r.querySelector('input'); if (inp) inp.value = ''; }
        }
        refreshVisibility();
      }
    });
  }

  // ── Validation ──

  function validateValues(attachPoint, values, canalType) {
    values = values || {};
    var errors = [];
    var fields = getFields(attachPoint, canalType).filter(function (f) { return evalShowIf(f, values); });

    function hasValue(f) {
      var v = values[f.id];
      if (f.type === 'checkbox-group' || f.type === 'list') return Array.isArray(v) && v.length > 0;
      if (f.type === 'checkbox') return v === true || v === 'true';
      return v !== undefined && v !== null && String(v).trim() !== '';
    }

    fields.forEach(function (f) {
      if (isSimpleRequired(f) && !hasValue(f)) {
        errors.push({ fieldId: f.id, message: '« ' + f.label + ' » est obligatoire.' });
      }
    });

    var groups = {};
    fields.forEach(function (f) {
      var g = requiredGroup(f);
      if (!g) return;
      groups[g] = groups[g] || { fields: [], satisfied: false };
      groups[g].fields.push(f);
      if (hasValue(f)) groups[g].satisfied = true;
    });
    Object.keys(groups).forEach(function (g) {
      if (!groups[g].satisfied && groups[g].fields.length) {
        var labels = groups[g].fields.map(function (f) { return f.label; }).join(', ');
        errors.push({ fieldId: groups[g].fields[0].id, message: 'Au moins un de ces champs doit être renseigné : ' + labels });
      }
    });

    fields.forEach(function (f) {
      if (f.type === 'url' && hasValue(f) && !isValidUrl(values[f.id])) {
        errors.push({ fieldId: f.id, message: '« ' + f.label + ' » doit être une URL valide (http:// ou https://).' });
      }
      if (f.type === 'list' && f.itemType !== 'text' && Array.isArray(values[f.id])) {
        values[f.id].forEach(function (u) {
          if (u && !isValidUrl(u)) errors.push({ fieldId: f.id, message: '« ' + f.label + ' » contient une URL invalide : ' + u });
        });
      }
    });

    return errors;
  }

  // ── API Publique ──
  return {
    TYPE_LABELS: TYPE_LABELS,
    attachPoints: attachPoints,
    getFields: getFields,
    fieldOptions: fieldOptions,
    isSimpleRequired: isSimpleRequired,
    requiredGroup: requiredGroup,
    evalShowIf: evalShowIf,
    renderFields: renderFields,
    wireFields: wireFields,
    collectValues: collectValues,
    validateValues: validateValues
  };
})();
/**
 * Module d'Aide Contextuel - Interface Impulsion Marketing
 *
 * Gère l'affichage des modals d'instructions pour chaque page de l'application.
 *
 * @namespace window.ImpulsionMarketing.help
 */

(function() {
    'use strict';

    // Initialiser le namespace
    if (typeof window.ImpulsionMarketing === 'undefined') {
        window.ImpulsionMarketing = {};
    }

    /**
     * Instructions pour chaque page de l'application
     */
    var pageInstructions = {
        'index': {
            title: 'Bienvenue',
            icon: '🏠',
            content: [
                {
                    subtitle: 'Connexion',
                    text: 'À l\'ouverture, choisissez votre service et votre nom, puis cliquez sur "Se connecter" : le dossier de travail est chargé automatiquement (sélection du dossier demandée uniquement à la toute première utilisation).'
                },
                {
                    subtitle: 'Navigation',
                    text: 'Utilisez le menu latéral pour accéder aux différentes fonctionnalités : créer une campagne, visualiser les campagnes, le pilotage ou le comité éditorial.'
                },
                {
                    subtitle: 'Changer d\'utilisateur',
                    text: 'Pour changer d\'identité, utilisez le bouton "Se déconnecter" dans l\'en-tête : vous reviendrez à l\'écran de connexion.'
                }
            ]
        },
        'saisie-campagne': {
            title: 'Créer une Campagne',
            icon: '✍️',
            content: [
                {
                    subtitle: 'Informations générales',
                    text: 'Remplissez tous les champs obligatoires : nom de la campagne, dates, segment, UB, type de communication, etc.'
                },
                {
                    subtitle: 'Canaux',
                    text: 'Sélectionnez un ou plusieurs canaux de communication. Chaque canal créera un dossier de livrable associé.'
                },
                {
                    subtitle: 'Sauvegarde',
                    text: 'Cliquez sur "Créer la Campagne" pour sauvegarder. Un dossier sera créé avec la structure complète (campagne.json + dossiers livrables).'
                }
            ]
        },
        'visualization': {
            title: 'Visualiser les Campagnes',
            icon: '📊',
            content: [
                {
                    subtitle: 'Recherche',
                    text: 'Utilisez la barre de recherche pour trouver une campagne par son nom ou ses mots-clés.'
                },
                {
                    subtitle: 'Filtres',
                    text: 'Filtrez les campagnes par UB, Canal ou Type de communication. Combinez plusieurs filtres pour affiner votre recherche.'
                },
                {
                    subtitle: 'Tri',
                    text: 'Triez les résultats par date (plus récent/ancien) ou par nom (A-Z/Z-A).'
                },
                {
                    subtitle: 'Accès aux détails',
                    text: 'Cliquez sur une carte de campagne pour voir tous ses détails et ses livrables.'
                }
            ]
        },
        'details': {
            title: 'Détails de la Campagne',
            icon: '📋',
            content: [
                {
                    subtitle: 'Onglets',
                    text: 'L\'onglet « Infos campagne » regroupe les informations générales, segments, univers de besoin, produit, documents et la discussion. Un onglet par canal donne accès au travail des équipes (COM, EBF, Data).'
                },
                {
                    subtitle: 'Suivi du workflow',
                    text: 'Le stepper en haut montre l\'avancement : étapes de préparation (saisie, affectation, kick-off) puis, pour chaque canal, les étapes par équipe. Couleurs : vert = fait, ambre = en cours, bleu = en validation, rouge = révision demandée, gris = à venir.'
                },
                {
                    subtitle: 'Dépôts et validations',
                    text: 'Dans l\'onglet d\'un canal, l\'acteur concerné dépose son livrable (maquette, BAT, ciblage, test, mise en prod) puis le soumet. Le PO valide chaque étape ou demande une révision.'
                },
                {
                    subtitle: 'Documents & discussion',
                    text: 'Ajoutez des fichiers dans l\'espace Documents et échangez avec l\'équipe via la Discussion en bas de l\'onglet Infos.'
                }
            ]
        },
        'pilotage': {
            title: 'Pilotage des Campagnes',
            icon: '🎯',
            content: [
                {
                    subtitle: 'Vue d\'ensemble',
                    text: 'Consultez les statistiques globales : nombre total de campagnes, campagnes actives, terminées et le taux de complétion moyen.'
                },
                {
                    subtitle: 'Répartitions',
                    text: 'Analysez la distribution de vos campagnes par marché (Particuliers/Spécialisés), par typologie (PR/Campagne) et par canal de communication.'
                },
                {
                    subtitle: 'Campagnes récentes',
                    text: 'Visualisez les 10 dernières campagnes créées avec leur progression et leurs informations clés.'
                },
                {
                    subtitle: 'Indicateurs',
                    text: 'Le taux de complétion indique le pourcentage moyen des livrables déposés (Com, EBF, Data) pour l\'ensemble des campagnes.'
                }
            ]
        }
    };

    /**
     * Initialise le système d'aide pour la page courante
     * @param {string} pageKey - Clé de la page (ex: 'index', 'saisie-campagne', etc.)
     */
    function initHelp(pageKey) {
        var instructions = pageInstructions[pageKey];
        if (!instructions) {
            console.warn('[ImpulsionMarketing.help] Aucune instruction trouvée pour la page:', pageKey);
            return;
        }

        // Créer la modal d'aide si elle n'existe pas
        createHelpModal(instructions);

        // Créer le bouton d'aide
        createHelpButton();
    }

    /**
     * Crée la modal d'aide
     * @param {object} instructions - Instructions de la page
     */
    function createHelpModal(instructions) {
        // Vérifier si la modal existe déjà
        if (document.getElementById('help-modal')) {
            return;
        }

        var modal = document.createElement('div');
        modal.id = 'help-modal';
        modal.className = 'help-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'help-modal-title');
        modal.setAttribute('aria-hidden', 'true');

        var security = window.ImpulsionMarketing.security;
        var html = '';

        html += '<div class="help-modal-overlay"></div>';
        html += '<div class="help-modal-content">';
        html += '  <div class="help-modal-header">';
        html += '    <h2 id="help-modal-title">' + instructions.icon + ' ' + security.escapeHtml(instructions.title) + '</h2>';
        html += '    <button class="help-modal-close" aria-label="Fermer">&times;</button>';
        html += '  </div>';
        html += '  <div class="help-modal-body">';

        instructions.content.forEach(function(section) {
            html += '    <div class="help-section">';
            html += '      <h3>' + security.escapeHtml(section.subtitle) + '</h3>';
            html += '      <p>' + security.escapeHtml(section.text) + '</p>';
            html += '    </div>';
        });

        html += '  </div>';
        html += '</div>';

        modal.innerHTML = html;
        document.body.appendChild(modal);

        // Event listeners
        var closeBtn = modal.querySelector('.help-modal-close');
        var overlay = modal.querySelector('.help-modal-overlay');

        closeBtn.addEventListener('click', closeHelpModal);
        overlay.addEventListener('click', closeHelpModal);

        // ESC pour fermer
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeHelpModal();
            }
        });
    }

    /**
     * Crée le bouton d'aide
     */
    function createHelpButton() {
        // Vérifier si le bouton existe déjà
        if (document.getElementById('help-button')) {
            return;
        }

        var button = document.createElement('button');
        button.id = 'help-button';
        button.className = 'help-button';
        button.setAttribute('aria-label', 'Ouvrir l\'aide');
        button.setAttribute('title', 'Instructions de la page');
        button.innerHTML = '?';

        button.addEventListener('click', openHelpModal);

        document.body.appendChild(button);
    }

    /**
     * Ouvre la modal d'aide
     */
    function openHelpModal() {
        var modal = document.getElementById('help-modal');
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            // Focus sur le bouton de fermeture
            var closeBtn = modal.querySelector('.help-modal-close');
            if (closeBtn) {
                closeBtn.focus();
            }
        }
    }

    /**
     * Ferme la modal d'aide
     */
    function closeHelpModal() {
        var modal = document.getElementById('help-modal');
        if (modal) {
            modal.classList.add('closing');
            modal.setAttribute('aria-hidden', 'true');

            setTimeout(function() {
                modal.classList.remove('active');
                modal.classList.remove('closing');
            }, 300);

            // Redonner le focus au bouton d'aide
            var helpBtn = document.getElementById('help-button');
            if (helpBtn) {
                helpBtn.focus();
            }
        }
    }

    // Exposer l'API publique
    window.ImpulsionMarketing.help = {
        initHelp: initHelp,
        openHelpModal: openHelpModal,
        closeHelpModal: closeHelpModal
    };

})();
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
    // Workflow (étapes + applicabilité par canal — Administration ▸ Workflow)
    if (cfg.workflow && typeof cfg.workflow === 'object') {
      if (Array.isArray(cfg.workflow.steps) && cfg.workflow.steps.length && Array.isArray(IM.config.WORKFLOW_STEPS)) {
        spliceInPlace(IM.config.WORKFLOW_STEPS, cfg.workflow.steps);
      }
      if (cfg.workflow.canalSteps && typeof cfg.workflow.canalSteps === 'object') {
        assignInPlace(IM.config.CANAL_STEPS, cfg.workflow.canalSteps);
      }
      if (cfg.workflow.canalActorOverrides && typeof cfg.workflow.canalActorOverrides === 'object') {
        assignInPlace(IM.config.CANAL_ACTOR_OVERRIDES, cfg.workflow.canalActorOverrides);
      }
    }
    // Champs personnalisés par point d'attache (Administration ▸ Champs personnalisés)
    if (cfg.customFields && typeof cfg.customFields === 'object') {
      assignInPlace(IM.config.CUSTOM_FIELDS, cfg.customFields);
    }
    // Objets pilotés par _config.json (mutés en place pour préserver les références partagées)
    assignInPlace(IM.config.APP_SETTINGS, cfg.settings);
    assignInPlace(IM.config.ROLE_COLORS, cfg.roleColors);
    assignInPlace(IM.config.ROLE_LABELS, cfg.roleLabels);
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
/**
 * topbar-standalone.js — Barre du haut commune à toutes les pages.
 *
 * Expose window.ImpulsionMarketing.topbar.mount().
 * Injecte les contrôles communs (recherche globale, Rafraîchir, Quoi de neuf,
 * Notifications, avatar, déconnexion) dans la sidebar — identiques partout,
 * pas de barre du haut séparée.
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

  // ── Notifications : couleurs par type, découpage icône/texte, date FR ──
  var NOTIF_COLORS = {
    workflow_a_valider: { bg: '#fef3c7', fg: '#b45309' },
    workflow_a_faire: { bg: '#dbeafe', fg: '#1d4ed8' },
    workflow_info: { bg: '#dbeafe', fg: '#1d4ed8' },
    workflow: { bg: '#dbeafe', fg: '#1d4ed8' },
    workflow_revision: { bg: '#fee2e2', fg: '#b91c1c' },
    zone_conflit_attente: { bg: '#fee2e2', fg: '#b91c1c' },
    mention: { bg: '#ede9fe', fg: '#6d28d9' },
    signalement_reponse: { bg: '#dcfce7', fg: '#15803d' },
    publication_fin: { bg: '#f1f5f9', fg: '#475569' },
    campagne_inactive: { bg: '#f1f5f9', fg: '#64748b' }
  };
  var DEFAULT_NOTIF_COLOR = { bg: '#f1f5f9', fg: '#475569' };
  function notifColor(type) { return NOTIF_COLORS[type] || DEFAULT_NOTIF_COLOR; }
  // Les libellés suivent la convention « emoji + espace + texte » (cf. NOTIFICATION_LABELS) —
  // on sépare sur le premier espace plutôt que par une regex Unicode, plus robuste.
  function splitLabel(label) {
    var s = (label || '🔔 Notification');
    var i = s.indexOf(' ');
    if (i === -1) return { icon: '🔔', text: s };
    return { icon: s.slice(0, i), text: s.slice(i + 1) };
  }
  function frNotifDate(iso) {
    if (!iso) return '';
    var d = iso.slice(0, 10).split('-');
    return d.length === 3 ? (d[2] + '/' + d[1] + '/' + d[0]) : iso.slice(0, 10);
  }

  // ── Icônes (SVG inline) ──
  var SVG = {
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    refresh: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
    gift: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12v9H4v-9"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>',
    bell: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    logout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
  };

  // ── Markup — recherche (sous le logo) et actions (au-dessus du bloc
  // utilisateur), intégrées à la barre de navigation latérale plutôt que dans
  // une barre du haut séparée (une seule barre par page, pas deux). ──
  function searchHtml() {
    return '<div class="sidebar-search">' + SVG.search
      + '<input type="text" id="topbar-search" placeholder="Rechercher : nom, PO, code projet/action, réf com/paracom…"></div>';
  }
  function actionsHtml() {
    var dotStyle = 'display:none;position:absolute;top:-2px;right:-2px;width:10px;height:10px;background:var(--primary,#00875A);border-radius:50%;border:2px solid #fff;';
    var badgeStyle = 'display:none;position:absolute;top:-4px;right:-4px;background:var(--red,#E2001A);color:#fff;border-radius:50%;min-width:18px;height:18px;font-size:11px;font-weight:700;line-height:18px;text-align:center;padding:0 3px;border:2px solid #fff;';
    // position:fixed (coordonnées calculées à l'ouverture, cf. wireNotifications) —
    // pas position:absolute : la sidebar a overflow-x:hidden, qui rognait le
    // panneau au lieu de le laisser déborder à droite de la barre de nav.
    var panelStyle = 'display:none;position:fixed;width:368px;background:#fff;border:1px solid var(--line,#eaefec);border-radius:14px;box-shadow:var(--shadow-md);z-index:500;max-height:420px;overflow-y:auto;';
    return '<div class="sidebar-actions">'
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
        notify('Échec : ' + (IM.errors ? IM.errors.getErrorMessage(e) : ''), 'error');
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
          .catch(function (err) { notify('Échec : ' + (IM.errors ? IM.errors.getErrorMessage(err) : ''), 'error'); });
      });
    }
    renderNotifications._all = allNotifs;
    renderNotifications._root = rootHandle;

    if (mine.length === 0) {
      list.innerHTML = '<div style="padding:32px 16px;text-align:center;color:#94a3b8;">'
        + '<div style="font-size:28px;margin-bottom:6px;">🔕</div>'
        + '<div style="font-size:13px;">Aucune notification</div></div>';
      return;
    }
    var typeLabels = (IM.config && IM.config.NOTIFICATION_LABELS) || {};
    var html = '';
    mine.forEach(function (n) {
      var parts = splitLabel(typeLabels[n.type]);
      var col = notifColor(n.type);
      var date = frNotifDate(n.dateCreation);
      var unread = !n.lu;
      var primary = n.message || n.campagneTitre || '';
      var secondary = (n.message && n.campagneTitre) ? n.campagneTitre : '';
      html += '<div class="notif-item" data-id="' + n.id + '" style="position:relative;display:flex;gap:10px;padding:12px 16px 12px 14px;border-bottom:1px solid #f1f5f9;cursor:pointer;background:' + (unread ? '#f7fbf9' : '#fff') + ';" onmouseover="this.style.background=\'#f1f5f9\'" onmouseout="this.style.background=\'' + (unread ? '#f7fbf9' : '#fff') + '\'">';
      if (unread) html += '<span style="position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--primary,#00875A);"></span>';
      html += '<div style="flex:none;width:32px;height:32px;border-radius:50%;background:' + col.bg + ';color:' + col.fg + ';display:flex;align-items:center;justify-content:center;font-size:15px;">' + esc(parts.icon) + '</div>';
      html += '<div style="flex:1;min-width:0;">';
      html += '<span style="display:inline-block;font-size:11px;font-weight:700;color:' + col.fg + ';background:' + col.bg + ';border-radius:5px;padding:2px 7px;margin-bottom:4px;">' + esc(parts.text) + '</span>';
      html += '<div style="font-size:13.5px;font-weight:' + (unread ? '700' : '500') + ';color:#1f2937;line-height:1.4;white-space:pre-wrap;">' + esc(primary) + '</div>';
      if (secondary) html += '<div style="font-size:12px;color:#64748b;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(secondary) + '</div>';
      if (n.statutReponse) html += '<div style="font-size:12px;font-weight:700;color:#0f766e;margin-top:4px;">' + esc(n.statutReponse) + '</div>';
      if (n.zone) html += '<div style="font-size:11.5px;color:#64748b;margin-top:3px;">Zone : ' + esc(n.zone) + (n.marche ? ' — ' + esc(n.marche) : '') + (n.dateFin ? ' — Fin : ' + esc(n.dateFin) : '') + '</div>';
      html += '<div style="font-size:11px;color:#94a3b8;margin-top:5px;">' + (n.auteur ? 'par ' + esc(n.auteur) + ' · ' : '') + date + '</div>';
      html += '</div></div>';
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
          writeNotifications(updated, rootHandle).then(go).catch(function (err) { notify('La notification n\'a pas pu être marquée comme lue : ' + (IM.errors ? IM.errors.getErrorMessage(err) : ''), 'error'); go(); });
        } else { go(); }
      });
    });
  }
  // Repositionne le panneau (position:fixed) juste avant de l'afficher, à partir
  // de la position réelle de la cloche à l'écran — indépendant de tout ancêtre
  // à overflow réduit (la sidebar en particulier).
  function _positionNotifPanel(bell, panel) {
    var r = bell.getBoundingClientRect();
    panel.style.left = (r.right + 10) + 'px';
    panel.style.bottom = Math.max(8, window.innerHeight - r.bottom) + 'px';
  }
  function wireNotifications() {
    var bell = $('topbar-notif-bell');
    if (bell) {
      bell.addEventListener('click', function (e) {
        e.stopPropagation();
        var p = $('topbar-notif-panel');
        if (p) {
          var opening = p.style.display === 'none';
          if (opening) _positionNotifPanel(bell, p);
          p.style.display = opening ? 'block' : 'none';
        }
        // Un clic est un vrai geste utilisateur : c'est le meilleur moment pour
        // demander l'autorisation d'afficher des notifications système si ce
        // n'est pas déjà fait (Chrome bloque parfois la demande hors interaction).
        _ensureNotifPermission();
      });
      document.addEventListener('click', function () { var p = $('topbar-notif-panel'); if (p) p.style.display = 'none'; });
      window.addEventListener('resize', function () {
        var p = $('topbar-notif-panel');
        if (p && p.style.display !== 'none') _positionNotifPanel(bell, p);
      });
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
  // Pas de barre du haut séparée : la recherche et les actions (Quoi de neuf,
  // notifications, rafraîchir) rejoignent la barre de navigation latérale,
  // qui reste la SEULE barre de chrome de l'application sur chaque page.
  // Le lien actif de la sidebar suffit à indiquer la page courante.
  function mount() {
    var side = document.querySelector('.sidebar');
    if (!side) return;
    var sideHeader = side.querySelector('.sidebar-header');
    var sideNav = side.querySelector('.sidebar-nav');
    if (!side.querySelector('.sidebar-search')) {
      var searchEl = document.createElement('div');
      searchEl.innerHTML = searchHtml();
      var searchNode = searchEl.firstChild;
      if (sideHeader && sideHeader.nextSibling) side.insertBefore(searchNode, sideHeader.nextSibling);
      else if (sideNav) side.insertBefore(searchNode, sideNav);
      else side.appendChild(searchNode);
    }
    if (!side.querySelector('.sidebar-actions')) {
      var actionsEl = document.createElement('div');
      actionsEl.innerHTML = actionsHtml();
      // Juste avant le bloc utilisateur (mountSidebarUser l'ajoute toujours en
      // dernier) — en l'appelant après, .sidebar-actions se retrouve bien
      // au-dessus de .sidebar-user dans l'ordre du DOM.
      side.appendChild(actionsEl.firstChild);
    }
    wireSearch();
    wireRefresh();
    wireWhatsNew();
    wireNotifications();
    mountSidebarUser();
  }

  IM.topbar = { mount: mount, mountSidebarUser: mountSidebarUser };
})();
