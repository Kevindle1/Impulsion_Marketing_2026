/**
 * Configuration Globale et Constantes
 * Interface Impulsion Marketing
 *
 * Ce fichier centralise toutes les constantes, listes de choix et configuration
 * Modifier ici pour mettre à jour partout dans l'application
 */

// ========================================
// Configuration Générale
// ========================================

export const APP_NAME = 'Interface Impulsion Marketing';
export const APP_VERSION = '2.0.0';
export const DEFAULT_ROOT_PATH = 'V:/Impulsion Marketing/Historique des Campagnes';
export const GABARIT_MODEL_PATH = 'Gabarit Model';

// ========================================
// Limites et Contraintes
// ========================================

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
export const MAX_FILENAME_LENGTH = 255;
export const MAX_DESCRIPTION_LENGTH = 10000;
export const SCAN_TIMEOUT = 30000; // 30 secondes

// ========================================
// Types de Fichiers Autorisés
// ========================================

export const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
export const ALLOWED_DOCUMENT_TYPES = ['pdf', 'html', 'htm'];
export const ALLOWED_ASSET_TYPES = ['css', 'js', 'json', 'svg', 'woff', 'woff2', 'ttf', 'eot'];

// ========================================
// Segments
// ========================================

export const SEGMENTS = [
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

// ========================================
// Univers de Besoins (UBs)
// ========================================

export const UNIVERS_BESOINS = [
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

export const CANAUX = [
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

export const TYPES_COM = [
  "Commerciale Caisse",
  "Commerciale Natio",
  "Reglementaire Caisse",
  "Reglementaire Natio",
  "Gestion Caisse",
  "Gestion Natio"
];

// ========================================
// Typologies de Campagne
// ========================================

export const TYPOLOGIES = [
  "PR",
  "Campagne"
];

// ========================================
// Marchés
// ========================================

export const MARCHES = [
  "Particuliers",
  "Spécialisés",
  "Tous"
];

// ========================================
// Récurrences
// ========================================

export const RECURRENCES = [
  "One shot",
  "hebdomadaire",
  "Mensuel",
  "trimestriel",
  "Annuelle"
];

// ========================================
// Numéros de Lot
// ========================================

export const LOTS = [
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

export const OUI_NON = [
  "Oui",
  "Non"
];

// ========================================
// Ranges pour Sélections Multiples
// ========================================

export const NUM_SEGMENTS_RANGE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const NUM_UBS_RANGE = [1, 2, 3, 4, 5, 6, 7, 8];
export const NUM_CHANNELS_RANGE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// ========================================
// Messages d'Erreur Standards
// ========================================

export const ERROR_MESSAGES = {
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

export const SUCCESS_MESSAGES = {
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

export const UI_CONFIG = {
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
export function generateOptions(items, placeholder = 'Choisir...') {
  let html = `<option value="">${placeholder}</option>`;
  items.forEach(item => {
    html += `<option value="${item}">${item}</option>`;
  });
  return html;
}

/**
 * Génère les options HTML pour un range numérique
 * @param {number[]} range - Array de nombres
 * @returns {string} HTML des options
 */
export function generateRangeOptions(range) {
  let html = '';
  range.forEach(num => {
    html += `<option value="${num}">${num}</option>`;
  });
  return html;
}

/**
 * Génère les radio buttons HTML
 * @param {string} name - Nom du groupe radio
 * @param {string[]|number[]} values - Valeurs
 * @returns {string} HTML des radios
 */
export function generateRadios(name, values) {
  let html = '';
  values.forEach(value => {
    html += `
      <label>
        <input type="radio" name="${name}" value="${value}">
        ${value}
      </label>
    `;
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
export function isValidChoice(value, allowedValues) {
  return allowedValues.includes(value);
}

/**
 * Vérifie si un type de fichier est autorisé
 * @param {string} filename - Nom du fichier
 * @param {string} category - 'image', 'document', ou 'asset'
 * @returns {boolean}
 */
export function isAllowedFileType(filename, category = 'image') {
  const ext = filename.split('.').pop().toLowerCase();

  switch (category) {
    case 'image':
      return ALLOWED_IMAGE_TYPES.includes(ext);
    case 'document':
      return ALLOWED_DOCUMENT_TYPES.includes(ext);
    case 'asset':
      return ALLOWED_ASSET_TYPES.includes(ext);
    default:
      return false;
  }
}

// ========================================
// Export par défaut (optionnel)
// ========================================

export default {
  APP_NAME,
  APP_VERSION,
  DEFAULT_ROOT_PATH,
  GABARIT_MODEL_PATH,
  SEGMENTS,
  UNIVERS_BESOINS,
  CANAUX,
  TYPES_COM,
  TYPOLOGIES,
  MARCHES,
  RECURRENCES,
  LOTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UI_CONFIG
};
