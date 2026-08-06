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
