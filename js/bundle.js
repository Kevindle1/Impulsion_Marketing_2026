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
  // Configuration Générale
  // ========================================

  const APP_NAME = 'Interface Impulsion Marketing';
  const APP_VERSION = '2.0.0';
  const DEFAULT_ROOT_PATH = 'V:/Impulsion Marketing/Historique des Campagnes';
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

  const SEGMENTS = [
    "Jeunes Actif 18-25ans",
    "Etudiant",
    "Actif",
    "GP",
    "Senior",
    "BP",
    "Sociétaire",
    "Intermédiaire Tradi",
    "Intermédiaire Dynamique",
    "Patri Dynamique",
    "Patri Tradi",
    "Jeunes 0-11 ans",
    "Jeunes 12-17 ans",
    "Pro - PLS",
    "Pro - Commerçants",
    "Pro - Artisans",
    "Pro - Micro entrepreneurs",
    "Associations",
    "Entreprises",
    "Agri - Managers",
    "Agris",
    "Agris - JA",
    "PP Majeur",
    "Jeunes 18-30ans",
    "Mineurs"
  ];

  // Segments organisés par groupe (Particuliers / Pro / Agri) avec libellé d'affichage.
  // Source de vérité pour le formulaire de création ; SEGMENTS (à plat) en est dérivé
  // et reste utilisé par les filtres. Éditable via l'espace Administration.
  const SEGMENTS_GROUPS = [
    { group: "Particuliers", items: [
      { value: "Actif", label: "Actif" },
      { value: "Etudiant", label: "Etudiant" },
      { value: "GP", label: "GP" },
      { value: "Senior", label: "Senior" },
      { value: "BP", label: "BP" },
      { value: "Sociétaire", label: "Sociétaire" },
      { value: "Patri Tradi", label: "Patri Tradi" },
      { value: "Patri Dynamique", label: "Patri Dynamique" },
      { value: "Intermédiaire Tradi", label: "Interméd. Tradi" },
      { value: "Intermédiaire Dynamique", label: "Interméd. Dynamique" },
      { value: "PP Majeur", label: "PP Majeur" },
      { value: "Jeunes Actif 18-25ans", label: "Jeunes 18-25 ans" },
      { value: "Jeunes 18-30ans", label: "Jeunes 18-30 ans" },
      { value: "Jeunes 12-17 ans", label: "Jeunes 12-17 ans" },
      { value: "Jeunes 0-11 ans", label: "Jeunes 0-11 ans" },
      { value: "Mineurs", label: "Mineurs" }
    ] },
    { group: "Pro", items: [
      { value: "Pro - PLS", label: "Pro - PLS" },
      { value: "Pro - Commerçants", label: "Pro - Commerçants" },
      { value: "Pro - Artisans", label: "Pro - Artisans" },
      { value: "Pro - Micro entrepreneurs", label: "Pro - Micro-entrepreneurs" },
      { value: "Associations", label: "Associations" },
      { value: "Entreprises", label: "Entreprises" }
    ] },
    { group: "Agri", items: [
      { value: "Agri - Managers", label: "Agri - Managers" },
      { value: "Agris", label: "Agris" },
      { value: "Agris - JA", label: "Agris - JA" }
    ] }
  ];

  // ========================================
  // Univers de Besoins (UBs)
  // ========================================

  const UNIVERS_BESOINS = [
    "Epargne / Collecte",
    "Crédits",
    "Assurances",
    "Conquête",
    "BAQ",
    "Immobilier",
    "Spécialisés",
    "Monétique"
  ];

  // ========================================
  // Canaux de Communication
  // ========================================

  const CANAUX = [
    "LP",
    "MAIL",
    "COURRIER",
    "SMS",
    "MDC",
    "PUSH / NOTIF MA BANQUE",
    "PERSO MA BANQUE",
    "Zone de Gauche ( synthese des comptes)",
    "Bandeau Hero",
    "ZAC HOME PAGE",
    "E-message",
    "Zone de droite ( synthese des comptes)",
    "Article",
    "Newsletter",
    "ZAC",
    "Menu Burger",
    "MAIL + E-MESSAGE"
  ];

  // ========================================
  // Types de Communication
  // ========================================

  // Nature de la communication. Le périmètre Caisse/Natio est porté séparément
  // par le champ « Typologie de communication » (Création Caisse / Reprise Natio).
  const TYPES_COM = [
    "Commerciales",
    "Gestion",
    "Réglementaire"
  ];

  // ========================================
  // Typologies de Campagne
  // ========================================

  const TYPOLOGIES = [
    "PR",
    "Campagne"
  ];

  // ========================================
  // Produits (liste de référence, configurable en Administration)
  // ========================================

  const PRODUITS = [];

  // ========================================
  // Marchés
  // ========================================

  const MARCHES = [
    "Particuliers",
    "Spécialisés",
    "Tous"
  ];

  // ========================================
  // Récurrences
  // ========================================

  const RECURRENCES = [
    "One shot",
    "hebdomadaire",
    "Mensuel",
    "trimestriel",
    "Annuelle"
  ];

  // ========================================
  // Numéros de Lot
  // ========================================

  const LOTS = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "Création"
  ];

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
    RECURRENCES: RECURRENCES,
    LOTS: LOTS,
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
    INVALID_DATA: 'INVALID_DATA',
    NETWORK_ERROR: 'NETWORK_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNKNOWN: 'UNKNOWN'
  };

  /**
   * Messages d'erreur localisés
   */
  var ErrorMessages = {
    PERMISSION_DENIED: 'Permission refusée. Veuillez autoriser l\'accès au dossier.',
    FILE_NOT_FOUND: 'Fichier introuvable.',
    DIRECTORY_NOT_FOUND: 'Dossier introuvable.',
    INVALID_DATA: 'Données invalides.',
    NETWORK_ERROR: 'Erreur réseau. Vérifiez votre connexion.',
    VALIDATION_ERROR: 'Erreur de validation.',
    UNKNOWN: 'Une erreur inattendue s\'est produite.'
  };

  /**
   * Détermine le type d'erreur à partir d'une exception
   * @param {Error} error - Erreur à classifier
   * @returns {string} Type d'erreur
   */
  function classifyError(error) {
    if (!error) {
      return ErrorTypes.UNKNOWN;
    }

    var message = error.message || '';
    var name = error.name || '';

    // Erreurs File System Access API
    if (name === 'NotFoundError') {
      return ErrorTypes.FILE_NOT_FOUND;
    }

    if (name === 'NotAllowedError' || message.includes('permission')) {
      return ErrorTypes.PERMISSION_DENIED;
    }

    // Erreurs réseau
    if (name === 'NetworkError' || message.includes('network')) {
      return ErrorTypes.NETWORK_ERROR;
    }

    // Erreurs de validation
    if (message.includes('invalid') || message.includes('validation')) {
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
        return {
          handle: null,
          status: 'error',
          message: 'Erreur: ' + error.message
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
          return { handle: null, status: 'no_permission', message: err && err.message };
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

  var USERS = [
    // Super Admin — accès total à toutes les fonctionnalités
    { name: 'Olivier', role: 'superadmin', roleLabel: 'Super Admin', isSuperAdmin: true, isManager: true },
    // Marketing — Sébastien L est responsable Marketing (manager de son service)
    { name: 'Sébastien Langlois', role: 'marketing', roleLabel: 'Resp. Marketing', isManager: true },
    { name: 'Agnès grapin',       role: 'marketing', roleLabel: 'Marketing' },
    { name: 'Caroline Legrand',   role: 'marketing', roleLabel: 'Marketing' },
    { name: 'Charlene Garrigues', role: 'marketing', roleLabel: 'Marketing' },
    { name: 'Georges Duchet',     role: 'marketing', roleLabel: 'Marketing' },
    { name: 'Julie Sarramiac',    role: 'marketing', roleLabel: 'Marketing' },
    { name: 'Nicolas Martel',     role: 'marketing', roleLabel: 'Marketing' },
    { name: 'Nicolas Palomba',    role: 'marketing', roleLabel: 'Marketing' },
    { name: 'Adrien Lechevalier', role: 'marketing', roleLabel: 'Marketing' },
    { name: 'Guillaume Jaillon',  role: 'marketing', roleLabel: 'Marketing' },
    { name: 'Cecile Devillard',   role: 'marketing', roleLabel: 'Marketing' },

    // Com — Marlène est aussi responsable Com (manager de son service)
    { name: 'Marlène Le Rue',     role: 'com', roleLabel: 'Resp. Com', isManager: true },
    { name: 'Camille Breteche',   role: 'com', roleLabel: 'Com' },
    { name: 'Celia Terzi',        role: 'com', roleLabel: 'Com' },
    { name: 'Clara Tigier',       role: 'com', roleLabel: 'Com' },
    { name: 'Clothilde Portal',   role: 'com', roleLabel: 'Com' },
    { name: 'Cyrielle Blanc',     role: 'com', roleLabel: 'Com' },
    { name: 'Dorian Fedrigo',     role: 'com', roleLabel: 'Com' },
    { name: 'Julie Riviere',      role: 'com', roleLabel: 'Com' },
    { name: 'Melissa Pontery',    role: 'com', roleLabel: 'Com' },
    // EBF — Laurent M est aussi responsable EBF (manager de son service)
    { name: 'Laurent Minier',     role: 'ebf', roleLabel: 'Resp. EBF', isManager: true },
    { name: 'Benjamin Aribaud',   role: 'ebf', roleLabel: 'EBF' },
    { name: 'Benjamin Le',        role: 'ebf', roleLabel: 'EBF' },
    { name: 'Kévin Dolie',        role: 'ebf', roleLabel: 'EBF' },
    { name: 'Marc Favre',         role: 'ebf', roleLabel: 'EBF' },
    { name: 'Sébastien Rouanet',  role: 'ebf', roleLabel: 'EBF' },
    { name: 'Sébastien Siguenza', role: 'ebf', roleLabel: 'EBF' },
    // Data — Dimitri est aussi responsable Data (manager de son service)
    { name: 'Dimitri Garcia',     role: 'data', roleLabel: 'Resp. Data', isManager: true },
    { name: 'Alain Marchois',     role: 'data', roleLabel: 'Data' },
    { name: 'Aurélien Dubroue',   role: 'data', roleLabel: 'Data' },
    { name: 'Ghaya Zarrouk',      role: 'data', roleLabel: 'Data' },
    { name: 'Marie-Jo Bonadei',   role: 'data', roleLabel: 'Data' },
    { name: 'Vincent Breque',     role: 'data', roleLabel: 'Data' },
  ];

  // Copie de la liste d'origine (sert de valeurs par défaut / d'amorçage du _config.json)
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
        channelRevisionComments:  {}
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

    if (s.po_kickoff === 'locked' && s.manager_affectation === 'validated' && !anyChannelStarted) {
      s.po_kickoff = 'pending';
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
      var chType = campaignData.channels && campaignData.channels[i] && campaignData.channels[i].type;
      cs[i] = recalcChannelUnlocks(cs[i], campaignData.workflow.steps, campaignData.requiredTeams, chType, juridiqueRequired(campaignData));
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
  function recalcChannelUnlocks(cs, globalSteps, requiredTeams, channelType, juridiqueRequired) {
    var reqCom  = isTeamRequired(requiredTeams, 'Com');
    var reqEbf  = isTeamRequired(requiredTeams, 'EBF');
    var reqData = isTeamRequired(requiredTeams, 'Data');
    var isLP    = channelType === 'LP';

    var kickoffDone = globalSteps && (globalSteps.po_kickoff === 'validated');

    // ── Après kickoff : débloquer les premières étapes ──
    if (kickoffDone) {
      if (reqCom  && cs.com_maquette === 'locked') cs.com_maquette = 'pending';
      if (reqData && cs.data_ciblage === 'locked') cs.data_ciblage = 'pending';
      // EBF sans Com → BAT se débloque directement après kickoff
      if (reqEbf && !reqCom && cs.ebf_bat === 'locked') cs.ebf_bat = 'pending';
    }

    // ── Chaîne Com ──
    if (reqCom && cs.com_maquette === 'submitted' && cs.po_validation_maquette === 'locked') {
      cs.po_validation_maquette = 'pending';
    }
    // Validation juridique (Com) : débloquée après validation PO de la maquette,
    // uniquement si la campagne requiert une validation juridique et conformité.
    if (reqCom && juridiqueRequired) {
      var maquetteValForJur = cs.po_validation_maquette === 'validated' || cs.po_validation_maquette === 'completed';
      if (maquetteValForJur && cs.com_juridique === 'locked') cs.com_juridique = 'pending';
    }

    // ── Chaîne EBF ──
    // ebf_bat se débloque quand :
    // - Com requise sans juridique : après po_validation_maquette validée
    // - Com requise avec juridique : après com_juridique validée (par la Com)
    // - Com non requise : déjà géré ci-dessus (après kickoff)
    if (reqEbf && reqCom) {
      var comValidated = cs.po_validation_maquette === 'validated' || cs.po_validation_maquette === 'completed';
      var canStartBat = juridiqueRequired
        ? (cs.com_juridique === 'validated' || cs.com_juridique === 'completed')
        : comValidated;
      if (canStartBat && cs.ebf_bat === 'locked') cs.ebf_bat = 'pending';
      // Gate juridique : tant que la validation juridique requise n'est pas faite,
      // le BAT ne doit pas être ouvert. On re-verrouille un ebf_bat resté/passé
      // à 'pending' (état hérité d'avant l'ajout du juridique, ou recalcul) —
      // sans toucher un BAT déjà commencé (submitted/validated/completed).
      if (juridiqueRequired && !canStartBat && cs.ebf_bat === 'pending') {
        cs.ebf_bat = 'locked';
      }
    }
    if (reqEbf && cs.ebf_bat === 'submitted' && cs.po_validation_bat === 'locked') {
      cs.po_validation_bat = 'pending';
    }

    // ── Chaîne Data ──
    if (reqData && cs.data_ciblage === 'submitted' && cs.po_validation_ciblage === 'locked') {
      cs.po_validation_ciblage = 'pending';
    }

    // ── Canal LP : Test en prod EBF déverrouillé directement après BAT, puis MEP EBF ──
    if (isLP && reqEbf) {
      var batDoneLP = cs.po_validation_bat === 'validated' || cs.po_validation_bat === 'completed';
      if (batDoneLP && cs.ebf_test_prod === 'locked') cs.ebf_test_prod = 'pending';
      if (cs.ebf_test_prod === 'submitted' && cs.po_validation_test_prod === 'locked') {
        cs.po_validation_test_prod = 'pending';
      }
      var testProdValidatedLP = cs.po_validation_test_prod === 'validated' || cs.po_validation_test_prod === 'completed';
      if (testProdValidatedLP && cs.ebf_mise_en_prod === 'locked') cs.ebf_mise_en_prod = 'pending';
    }

    // ── Étapes communes EBF+Data (hors LP) ──
    if (reqEbf && reqData && !isLP) {
      var batDone     = cs.po_validation_bat     === 'validated' || cs.po_validation_bat     === 'completed';
      var ciblageDone = cs.po_validation_ciblage === 'validated' || cs.po_validation_ciblage === 'completed';
      if (batDone && ciblageDone && cs.data_lancement_test === 'locked') {
        cs.data_lancement_test = 'pending';
      }
      var ltDone = cs.data_lancement_test === 'submitted' || cs.data_lancement_test === 'validated' || cs.data_lancement_test === 'completed';
      if (ltDone && cs.ebf_test_prod === 'locked') {
        cs.ebf_test_prod = 'pending';
      }
      if (cs.ebf_test_prod === 'submitted' && cs.po_validation_test_prod === 'locked') {
        cs.po_validation_test_prod = 'pending';
      }
      var testProdValidated = cs.po_validation_test_prod === 'validated' || cs.po_validation_test_prod === 'completed';
      if (testProdValidated && cs.data_mise_en_prod === 'locked') {
        cs.data_mise_en_prod = 'pending';
      }
    }

    // ── MEP : Data seul (sans EBF) → après po_validation_ciblage ──
    if (reqData && !reqEbf) {
      var ciblageDone2 = cs.po_validation_ciblage === 'validated' || cs.po_validation_ciblage === 'completed';
      if (ciblageDone2 && cs.data_mise_en_prod === 'locked') {
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
        var chTypeG = campaignData.channels && campaignData.channels[i] && campaignData.channels[i].type;
        cs[i] = recalcChannelUnlocks(cs[i], campaignData.workflow.steps, campaignData.requiredTeams, chTypeG, juridiqueRequired(campaignData));
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
    var chTypeC = campaignData.channels && campaignData.channels[channelIdx] && campaignData.channels[channelIdx].type;
    cs[channelIdx] = recalcChannelUnlocks(cs[channelIdx], campaignData.workflow.steps, campaignData.requiredTeams, chTypeC, juridiqueRequired(campaignData));
    return campaignData;
  }

  /**
   * Demande une modification sur une étape canal (PO → acteur)
   * Met à jour channelSteps[channelIdx] et stocke le commentaire
   */
  function requestChannelRevision(campaignData, poStepId, sourceStepId, channelIdx, comment) {
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
  function refuseChannelJuridique(campaignData, channelIdx, reason) {
    initWorkflow(campaignData);
    var cs = campaignData.workflow.channelSteps;
    if (!cs || !cs[channelIdx]) return campaignData;
    cs[channelIdx].com_juridique          = 'locked';
    cs[channelIdx].po_validation_maquette = 'locked';
    cs[channelIdx].com_maquette           = 'revision_requested';
    if (!campaignData.workflow.channelRevisionComments) campaignData.workflow.channelRevisionComments = {};
    if (!campaignData.workflow.channelRevisionComments[channelIdx]) campaignData.workflow.channelRevisionComments[channelIdx] = {};
    campaignData.workflow.channelRevisionComments[channelIdx].com_maquette = '⚖️ Refus juridique : ' + (reason || '');
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
  function isChannelCompleted(channelSteps, requiredTeams, channelType, juridiqueRequired) {
    var reqCom  = isTeamRequired(requiredTeams, 'Com');
    var reqEbf  = isTeamRequired(requiredTeams, 'EBF');
    var reqData = isTeamRequired(requiredTeams, 'Data');
    var isLP    = channelType === 'LP';

    if (isLP && reqEbf) {
      return channelSteps.ebf_mise_en_prod === 'completed';
    }
    if (reqData) {
      return channelSteps.data_mise_en_prod === 'completed';
    }
    if (reqEbf) {
      return channelSteps.po_validation_bat === 'validated' || channelSteps.po_validation_bat === 'completed';
    }
    if (reqCom) {
      // Canal Com seul (sans EBF ni Data) : terminé après validation de la
      // maquette par le PO — et, si requis, après la validation juridique Com.
      var maquetteOk = channelSteps.po_validation_maquette === 'validated' || channelSteps.po_validation_maquette === 'completed';
      if (juridiqueRequired) {
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
      var chTypeI = campaignData.channels && campaignData.channels[i] && campaignData.channels[i].type;
      if (!cs[i] || !isChannelCompleted(cs[i], campaignData.requiredTeams, chTypeI, juridiqueRequired(campaignData))) return false;
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
      for (var ci = 0; ci < numChannels; ci++) {
        if (!cs[ci]) continue;
        var status = cs[ci][stepId];
        if (status === 'pending' || status === 'submitted' || status === 'revision_requested') {
          if (status === 'submitted')          return 'En validation : ' + STEPS[si].label;
          if (status === 'revision_requested') return 'Révision : ' + STEPS[si].label;
          return STEPS[si].label;
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

  // Étapes pertinentes pour un canal selon les équipes requises et le type (LP).
  // Reproduit la visibilité des zones de la fiche canal.
  function _channelStepIds(requiredTeams, channelType, juridiqueReq) {
    var reqCom  = isTeamRequired(requiredTeams, 'Com');
    var reqEbf  = isTeamRequired(requiredTeams, 'EBF');
    var reqData = isTeamRequired(requiredTeams, 'Data');
    var isLP    = channelType === 'LP';
    var ids = [];
    if (reqCom) { ids.push('com_maquette', 'po_validation_maquette'); if (juridiqueReq) ids.push('com_juridique'); }
    if (reqEbf) { ids.push('ebf_bat', 'po_validation_bat'); }
    if (reqData && !isLP) { ids.push('data_ciblage', 'po_validation_ciblage'); }
    if (reqEbf && reqData && !isLP) { ids.push('data_lancement_test', 'ebf_test_prod', 'po_validation_test_prod'); }
    else if (reqEbf && isLP) { ids.push('ebf_test_prod', 'po_validation_test_prod'); }
    if (reqData && !isLP) ids.push('data_mise_en_prod');
    if (isLP && reqEbf) ids.push('ebf_mise_en_prod');
    return ids;
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
      var type  = ch && ch.type;
      var done  = isChannelCompleted(steps, campaignData.requiredTeams, type, jur);
      var ids   = _channelStepIds(campaignData.requiredTeams, type, jur);
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
          var lbl = _STEP_LABEL[ids[k]] || ids[k];
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
  // Manager général (marketing) ou super-admin : a la main sur toute l'étape
  // d'affectation jusqu'à sa validation.
  function isGeneralManager(currentUser) {
    return !!currentUser && (
      (currentUser.role === 'marketing' && currentUser.isManager === true) ||
      currentUser.isSuperAdmin === true
    );
  }

  // #14 — Un manager de SERVICE (com/ebf/data) a terminé sa part d'affectation
  // dès qu'au moins une personne de son équipe est affectée — ou si son équipe
  // n'est pas requise par la campagne. On cesse alors de lui proposer l'action
  // d'affectation : la carte disparaît du tableau de bord « à produire » et le
  // bloc d'affectation n'est plus présenté. Le manager général garde la main
  // jusqu'à la validation de l'étape globale.
  function managerAffectationDone(currentUser, campaignData) {
    if (!currentUser || currentUser.isManager !== true || !campaignData) return false;
    if (isGeneralManager(currentUser)) return false;
    var role = currentUser.role;
    var teamLabel = role === 'com' ? 'Com' : (role === 'ebf' ? 'EBF' : (role === 'data' ? 'Data' : null));
    if (!teamLabel) return false; // rôle non concerné par l'affectation d'équipe
    var requiredTeams = campaignData.requiredTeams || [];
    if (!isTeamRequired(requiredTeams, teamLabel)) return true; // rien à affecter pour ce service
    var assignments = (campaignData.workflow && campaignData.workflow.assignments) || {};
    var assigned = assignments[role];
    var arr = Array.isArray(assigned) ? assigned : (assigned ? [assigned] : []);
    return arr.length > 0;
  }

  function getAvailableActions(currentUser, campaignData) {
    if (!currentUser || !campaignData) return [];
    initWorkflow(campaignData);

    var actions = [];
    var globalSteps = campaignData.workflow.steps;
    var assignments = campaignData.workflow.assignments || {};

    // Étapes globales
    STEPS.slice(0, 3).forEach(function (step) {
      var status = globalSteps[step.id] || 'locked';
      if (status !== 'pending' && status !== 'revision_requested') return;
      var actorMatch = false;
      if (step.actor === 'po') {
        actorMatch = currentUser.name === campaignData.po;
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
        var actorMatch = false;
        if (step.actor === 'po') {
          actorMatch = currentUser.name === campaignData.po;
        } else {
          var assigned = assignments[step.actor];
          var assignedArr = Array.isArray(assigned) ? assigned : (assigned ? [assigned] : []);
          actorMatch = assignedArr.indexOf(currentUser.name) !== -1;
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

  var VOLUME_ALERT_SEUIL = 100000;

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
  // campagne) en une chaîne minuscule, pour la recherche du tableau de bord.
  function buildSearchBlob(campaignData) {
    var parts = [];
    function add(v) {
      if (!v) return;
      if (Array.isArray(v)) { v.forEach(add); return; }
      parts.push(String(v));
    }
    add(campaignData.id);
    add(campaignData.po);
    add(campaignData.description);
    add(campaignData.market);
    add(campaignData.typology);
    add(campaignData.recurrence);
    add(campaignData.segments);
    add(campaignData.ubs);
    add(campaignData.campagneLiee);
    add(campaignData.targetProducts);
    add(campaignData.targetProduct);
    add(campaignData.prospectSource);
    (campaignData.channels || []).forEach(function (c) {
      add(c.deliverableName); add(c.content); add(c.emailObject);
      add(c.comType); add(c.comTypology); add(c.targetingCriteria);
      add(c.codeCom); add(c.refParacom); add(c.codeProjet); add(c.codeAction); add(c.codeMK);
      add(c.urlTicTac); add(c.urlComStore); add(c.urlsComStore); add(c.urlLccx);
    });
    return parts.join(' ').toLowerCase();
  }

  function extractIndexEntry(campaignData) {
    initWorkflow(campaignData);
    var volumeAlert = false;
    if (campaignData.channels && campaignData.channels.length > 0) {
      for (var i = 0; i < campaignData.channels.length; i++) {
        if ((campaignData.channels[i].volumeCible || 0) > VOLUME_ALERT_SEUIL) {
          volumeAlert = true;
          break;
        }
      }
    }
    var chs = (campaignData.channels || []).map(function (c) {
      return {
        deliverableName: c.deliverableName,
        content: c.content,
        siteWebDateFin: (c.siteWeb && c.siteWeb.dateFin) ? c.siteWeb.dateFin : null,
        ebfWebmaster: (c.siteWeb && c.siteWeb.webmaster) ? c.siteWeb.webmaster : null
      };
    });
    return {
      id:          campaignData.id || '',
      po:          campaignData.po || '',
      desc:        campaignData.description || '',
      launch:      campaignData.launchDate || '',
      mkt:         campaignData.market || '',
      typ:         campaignData.typology || '',
      chs:         chs,
      mod:         Date.now(),
      asn:         Object.assign({}, campaignData.workflow.assignments),
      steps:       getEffectiveStepsForIndex(campaignData),
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
    isTeamRequired:           isTeamRequired,
    isChannelCompleted:       isChannelCompleted,
    buildSearchBlob:          buildSearchBlob,
    initWorkflow:             initWorkflow,
    advanceStep:              advanceStep,
    advanceChannelStep:       advanceChannelStep,
    requestRevision:          requestRevision,
    requestChannelRevision:   requestChannelRevision,
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

  // Correspondance clé _config.json → liste à plat dans IM.config (éditables via l'admin).
  var LIST_MAP = {
    canaux: 'CANAUX',
    universBesoins: 'UNIVERS_BESOINS',
    typesCom: 'TYPES_COM',
    typologies: 'TYPOLOGIES',
    marches: 'MARCHES',
    recurrences: 'RECURRENCES',
    lots: 'LOTS'
  };

  // Remplace le contenu d'un tableau EN PLACE (conserve la référence partagée).
  function spliceInPlace(target, source) {
    if (!Array.isArray(target) || !Array.isArray(source)) return;
    target.splice.apply(target, [0, target.length].concat(source));
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

  // Amorçage : crée _config.json avec les valeurs par défaut s'il n'existe pas encore,
  // afin que le fichier soit présent d'emblée sur le dossier racine V:// (point B).
  // N'écrase jamais un fichier existant. Renvoie la config (lue ou amorcée).
  function ensureSeed() {
    return rootHandle().then(function (root) {
      return root.getFileHandle(CONFIG_FILE, { create: false })
        .then(function (fh) { return fh.getFile(); })
        .then(function (f) { return f.text(); })
        .then(function (txt) { var c = {}; try { c = JSON.parse(txt) || {}; } catch (e) { c = {}; } return c; })
        .catch(function () {
          // Fichier absent → on l'amorce avec les valeurs par défaut.
          var seed = {};
          if (IM.users && Array.isArray(IM.users.DEFAULT_USERS)) seed.users = IM.users.DEFAULT_USERS;
          if (IM.config) {
            Object.keys(LIST_MAP).forEach(function (k) {
              var arr = IM.config[LIST_MAP[k]];
              if (Array.isArray(arr)) seed[k] = arr.slice();
            });
            if (Array.isArray(IM.config.SEGMENTS_GROUPS)) {
              seed.segmentsGroups = JSON.parse(JSON.stringify(IM.config.SEGMENTS_GROUPS));
            }
          }
          return save(seed).then(function () { return seed; }).catch(function () { return {}; });
        });
    }).catch(function () { return {}; });
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

  function init() {
    // On charge et applique la config sur TOUTES les pages (y compris l'écran de
    // connexion, qui n'a pas de menu latéral) afin que les listes/utilisateurs
    // configurés dans l'Administration soient répercutés partout.
    reload()
      .catch(function () {})
      .then(function () {
        // Le lien « Administration » n'est ajouté que s'il y a un menu latéral.
        if (document.querySelector('.sidebar-nav')) injectAdminLink();
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
  var ROLE_COLORS = { superadmin: '#0f766e', marketing: '#16a34a', com: '#0d6efd', ebf: '#fd7e14', data: '#6f42c1' };
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
    var badge = {
      'new': { icon: '🆕', label: 'Nouveau', color: '#16a34a' },
      'fix': { icon: '🛠️', label: 'Correction', color: '#0d6efd' },
      'improve': { icon: '✨', label: 'Amélioration', color: '#7c3aed' }
    };
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
  function loadAndShowWhatsNew() {
    readWhatsNew().then(function (list) {
      _whatsNewCache = list;
      updateWhatsNewDot();
      var name = currentUserName();
      var unseen = list.filter(function (e) { return inAudience(e, name) && !isSeenBy(e, name); }).sort(byNewest);
      if (unseen.length) renderWhatsNewModal(unseen, unseen.map(function (e) { return e.id; }));
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
    var typeLabels = {
      'zone_conflit_attente': '⚠️ Conflit zone site web',
      'zone_approuvee': '✅ Zone approuvée',
      'zone_refusee': '❌ Zone refusée',
      'campagne_inactive': '🔴 Campagne à débrancher',
      'publication_fin': '📅 Fin de publication site web',
      'mention': '💬 Mention dans une discussion',
      'signalement_reponse': '🔔 Réponse à votre signalement',
      'workflow_a_faire': '▶️ À toi de jouer',
      'workflow_a_valider': '🕓 À valider',
      'workflow_revision': '🔄 Révision demandée',
      'workflow_info': '📣 Campagne'
    };
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
      });
      document.addEventListener('click', function () { var p = $('topbar-notif-panel'); if (p) p.style.display = 'none'; });
    }
    var ds = IM.directoryStorage, u = currentUser();
    if (!ds || !u) { renderNotifications([], [], null); return; }
    ds.getRootHandleWithCheck().then(function (res) {
      if (res.status !== 'success') { renderNotifications([], [], null); return; }
      var root = res.handle;
      root.getFileHandle(NOTIF_FILE, { create: false }).then(function (fh) { return fh.getFile(); }).then(function (f) { return f.text(); })
        .then(function (txt) {
          var all = JSON.parse(txt);
          var mine = all.filter(function (n) { return n.destinataire === u.name && !n.lu; });
          renderNotifications(mine, all, root);
        })
        .catch(function () { renderNotifications([], [], null); });
    }).catch(function () { renderNotifications([], [], null); });
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
