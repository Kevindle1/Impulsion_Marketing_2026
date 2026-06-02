/**
 * Validateurs d'Entrées Utilisateur
 * Interface Impulsion Marketing
 *
 * Ce module fournit toutes les fonctions de validation pour sécuriser l'application
 */

import {
  SEGMENTS,
  UNIVERS_BESOINS,
  CANAUX,
  TYPES_COM,
  TYPOLOGIES,
  MARCHES,
  RECURRENCES,
  MAX_FILE_SIZE,
  MAX_FILENAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  ERROR_MESSAGES
} from './config.js';

// ========================================
// Validation de Données de Campagne
// ========================================

/**
 * Valide toutes les données d'une campagne
 * @param {Object} data - Données de la campagne
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateCampaignData(data) {
  const errors = [];

  // Champs requis
  if (!data.id || !data.id.trim()) {
    errors.push("Le nom de la tâche est requis");
  }

  if (!data.description || !data.description.trim()) {
    errors.push("La description est requise");
  }

  if (!data.po || !data.po.trim()) {
    errors.push("Le PO est requis");
  }

  // Validation des dates
  if (!data.launchDate) {
    errors.push("La date de lancement est requise");
  }

  if (!data.instantiation) {
    errors.push("La date d'instantiation est requise");
  }

  if (data.launchDate && data.instantiation) {
    try {
      validateDateRange(data.instantiation, data.launchDate);
    } catch (error) {
      errors.push(error.message);
    }
  }

  // Validation des choix
  if (data.typology && !TYPOLOGIES.includes(data.typology)) {
    errors.push("Typologie invalide");
  }

  if (data.market && !MARCHES.includes(data.market)) {
    errors.push("Marché invalide");
  }

  if (data.recurrence && !RECURRENCES.includes(data.recurrence)) {
    errors.push("Récurrence invalide");
  }

  // Validation des segments
  if (data.segments && Array.isArray(data.segments)) {
    data.segments.forEach((segment, index) => {
      if (!SEGMENTS.includes(segment)) {
        errors.push(`Segment ${index + 1} invalide: ${segment}`);
      }
    });
  }

  // Validation des UBs
  if (data.ubs && Array.isArray(data.ubs)) {
    data.ubs.forEach((ub, index) => {
      if (!UNIVERS_BESOINS.includes(ub)) {
        errors.push(`Univers de besoin ${index + 1} invalide: ${ub}`);
      }
    });
  }

  // Validation de l'URL produit
  if (data.productUrl && data.productUrl.trim()) {
    try {
      validateURL(data.productUrl);
    } catch (error) {
      errors.push(error.message);
    }
  }

  // Validation de la longueur de description
  if (data.description && data.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description trop longue (max ${MAX_DESCRIPTION_LENGTH} caractères)`);
  }

  // Validation des canaux
  if (data.channels && Array.isArray(data.channels)) {
    data.channels.forEach((channel, index) => {
      const channelErrors = validateChannelData(channel, index + 1);
      errors.push(...channelErrors);
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valide les données d'un canal
 * @param {Object} channel - Données du canal
 * @param {number} index - Index du canal (pour messages d'erreur)
 * @returns {string[]} Liste des erreurs
 */
function validateChannelData(channel, index) {
  const errors = [];

  if (!channel.content || !CANAUX.includes(channel.content)) {
    errors.push(`Canal ${index}: Contenu invalide`);
  }

  if (!channel.sendDate) {
    errors.push(`Canal ${index}: Date d'envoi requise`);
  }

  if (channel.comType && !TYPES_COM.includes(channel.comType)) {
    errors.push(`Canal ${index}: Type de communication invalide`);
  }

  if (!channel.targetingCriteria || !channel.targetingCriteria.trim()) {
    errors.push(`Canal ${index}: Critères de ciblage requis`);
  }

  if (!channel.comTypology || !channel.comTypology.trim()) {
    errors.push(`Canal ${index}: Typologie de communication requise`);
  }

  return errors;
}

// ========================================
// Validation de Données de Livrable
// ========================================

/**
 * Valide les données d'un livrable
 * @param {Object} data - Données du livrable
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateDeliverableData(data) {
  const errors = [];

  if (!data.campaignName || !data.campaignName.trim()) {
    errors.push("Le nom de la campagne est requis");
  }

  if (!data.canalName || !data.canalName.trim()) {
    errors.push("Le nom du canal est requis");
  }

  if (!data.deliverableName || !data.deliverableName.trim()) {
    errors.push("Le nom du livrable est requis");
  }

  // Validation de la longueur de description
  if (data.description && data.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description trop longue (max ${MAX_DESCRIPTION_LENGTH} caractères)`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ========================================
// Validation de Dates
// ========================================

/**
 * Valide que start est avant end
 * @param {string|Date} start - Date de début
 * @param {string|Date} end - Date de fin
 * @throws {Error} Si les dates sont invalides
 */
export function validateDateRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime())) {
    throw new Error("Date de début invalide");
  }

  if (isNaN(endDate.getTime())) {
    throw new Error("Date de fin invalide");
  }

  if (startDate > endDate) {
    throw new Error(ERROR_MESSAGES.INVALID_DATE_RANGE);
  }

  return true;
}

/**
 * Valide qu'une date est valide
 * @param {string|Date} date - Date à valider
 * @returns {boolean}
 */
export function isValidDate(date) {
  const d = new Date(date);
  return !isNaN(d.getTime());
}

// ========================================
// Validation d'URL
// ========================================

/**
 * Valide une URL
 * @param {string} url - URL à valider
 * @throws {Error} Si l'URL est invalide
 */
export function validateURL(url) {
  if (!url || !url.trim()) {
    return true; // URL optionnelle
  }

  try {
    const parsed = new URL(url);

    // Autoriser uniquement HTTP et HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error("L'URL doit utiliser le protocole HTTP ou HTTPS");
    }

    return true;
  } catch (error) {
    throw new Error(ERROR_MESSAGES.INVALID_URL);
  }
}

/**
 * Vérifie si une URL est valide (version non-throwing)
 * @param {string} url - URL à vérifier
 * @returns {boolean}
 */
export function isValidURL(url) {
  try {
    validateURL(url);
    return true;
  } catch {
    return false;
  }
}

// ========================================
// Validation de Noms
// ========================================

/**
 * Valide un nom (campagne, livrable, etc.)
 * @param {string} name - Nom à valider
 * @param {number} maxLength - Longueur maximale
 * @throws {Error} Si le nom est invalide
 */
export function validateName(name, maxLength = MAX_FILENAME_LENGTH) {
  if (!name || name.trim() === '') {
    throw new Error("Le nom ne peut pas être vide");
  }

  if (name.length > maxLength) {
    throw new Error(`Le nom est trop long (max ${maxLength} caractères)`);
  }

  // Vérifier caractères interdits
  if (/[<>:"|?*\\/]/.test(name)) {
    throw new Error("Le nom contient des caractères interdits");
  }

  return true;
}

// ========================================
// Validation de Fichiers
// ========================================

/**
 * Valide le nom d'un fichier
 * @param {string} filename - Nom du fichier
 * @throws {Error} Si le nom est invalide
 */
export function validateFileName(filename) {
  if (!filename || filename.trim() === '') {
    throw new Error(ERROR_MESSAGES.INVALID_FILENAME);
  }

  if (filename.length > MAX_FILENAME_LENGTH) {
    throw new Error(`Nom de fichier trop long (max ${MAX_FILENAME_LENGTH} caractères)`);
  }

  // Vérifier path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new Error("Path traversal détecté dans le nom de fichier");
  }

  return true;
}

/**
 * Valide le type d'un fichier
 * @param {string} filename - Nom du fichier
 * @param {string[]} allowedTypes - Extensions autorisées
 * @throws {Error} Si le type n'est pas autorisé
 */
export function validateFileType(filename, allowedTypes) {
  const ext = filename.split('.').pop().toLowerCase();

  if (!allowedTypes.includes(ext)) {
    throw new Error(
      `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`
    );
  }

  return true;
}

/**
 * Valide la taille d'un fichier
 * @param {number} size - Taille en octets
 * @param {number} maxSize - Taille maximale en octets
 * @throws {Error} Si le fichier est trop volumineux
 */
export function validateFileSize(size, maxSize = MAX_FILE_SIZE) {
  if (size > maxSize) {
    throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
  }

  return true;
}

/**
 * Valide un objet File
 * @param {File} file - Fichier à valider
 * @param {Object} options - Options de validation
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateFile(file, options = {}) {
  const errors = [];
  const {
    allowedTypes = [],
    maxSize = MAX_FILE_SIZE
  } = options;

  // Vérifier que c'est bien un fichier
  if (!(file instanceof File)) {
    errors.push("Objet File invalide");
    return { valid: false, errors };
  }

  // Valider le nom
  try {
    validateFileName(file.name);
  } catch (error) {
    errors.push(error.message);
  }

  // Valider le type
  if (allowedTypes.length > 0) {
    try {
      validateFileType(file.name, allowedTypes);
    } catch (error) {
      errors.push(error.message);
    }
  }

  // Valider la taille
  try {
    validateFileSize(file.size, maxSize);
  } catch (error) {
    errors.push(error.message);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ========================================
// Sanitization (Sécurité XSS)
// ========================================

/**
 * Échappe les caractères HTML pour prévenir XSS
 * @param {string} text - Texte à échapper
 * @returns {string} Texte échappé
 */
export function sanitizeHTML(text) {
  if (!text) return '';

  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Échappe les caractères pour utilisation dans une regex
 * @param {string} text - Texte à échapper
 * @returns {string} Texte échappé
 */
export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Supprime les caractères de contrôle d'une chaîne
 * @param {string} text - Texte à nettoyer
 * @returns {string} Texte nettoyé
 */
export function removeControlCharacters(text) {
  if (!text) return '';
  return text.replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Valide et nettoie une chaîne JSON
 * @param {string} text - Texte à valider
 * @returns {string} Texte nettoyé
 */
export function sanitizeJSONString(text) {
  if (!text) return '';

  // Limiter longueur
  if (text.length > MAX_DESCRIPTION_LENGTH) {
    text = text.slice(0, MAX_DESCRIPTION_LENGTH);
  }

  // Supprimer caractères de contrôle
  return removeControlCharacters(text);
}

// ========================================
// Helpers de Validation
// ========================================

/**
 * Vérifie si une valeur est vide
 * @param {any} value - Valeur à vérifier
 * @returns {boolean}
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Vérifie si une valeur est un nombre valide
 * @param {any} value - Valeur à vérifier
 * @returns {boolean}
 */
export function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Vérifie si une valeur est un entier valide
 * @param {any} value - Valeur à vérifier
 * @returns {boolean}
 */
export function isInteger(value) {
  return Number.isInteger(Number(value));
}

/**
 * Valide qu'une valeur est dans une plage
 * @param {number} value - Valeur à vérifier
 * @param {number} min - Minimum (inclusif)
 * @param {number} max - Maximum (inclusif)
 * @returns {boolean}
 */
export function isInRange(value, min, max) {
  const num = Number(value);
  return num >= min && num <= max;
}

// ========================================
// Export par défaut
// ========================================

export default {
  validateCampaignData,
  validateDeliverableData,
  validateDateRange,
  validateURL,
  validateName,
  validateFileName,
  validateFileType,
  validateFileSize,
  validateFile,
  sanitizeHTML,
  sanitizeJSONString,
  isEmpty,
  isNumeric,
  isInteger,
  isInRange
};
