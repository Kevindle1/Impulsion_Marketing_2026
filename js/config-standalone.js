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
