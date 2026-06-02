/**
 * Fonctions Utilitaires
 * Interface Impulsion Marketing
 *
 * Collection de fonctions réutilisables pour toute l'application
 */

// ========================================
// DOM Utilities
// ========================================

/**
 * Raccourci pour document.querySelector
 * @param {string} selector - Sélecteur CSS
 * @returns {Element|null} Premier élément correspondant
 */
export const $ = (selector) => document.querySelector(selector);

/**
 * Raccourci pour document.querySelectorAll
 * @param {string} selector - Sélecteur CSS
 * @returns {NodeList} Liste de tous les éléments correspondants
 */
export const $$ = (selector) => document.querySelectorAll(selector);

// ========================================
// File Name Utilities
// ========================================

/**
 * Nettoie un nom de fichier pour le rendre sûr pour tous les systèmes
 * @param {string} name - Nom de fichier à nettoyer
 * @returns {string} Nom de fichier nettoyé
 * @throws {Error} Si le nom est invalide
 */
export function sanitizeFileName(name) {
  if (typeof name !== 'string') {
    throw new Error('Filename must be a string');
  }

  // 1. Décoder URL encoding (sécurité)
  try {
    name = decodeURIComponent(name);
  } catch (e) {
    // Si décodage échoue, continuer avec nom original
  }

  // 2. Bloquer path traversal explicitement
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    throw new Error('Invalid filename: path traversal detected');
  }

  // 3. Remplacer caractères interdits Windows/macOS/Linux
  name = name.replace(/[<>:"|?*\\\/()\[\]{}]/g, '_');

  // 4. Remplacer espaces multiples par underscores
  name = name.replace(/\s+/g, '_');

  // 5. Supprimer points au début/fin (cachés sur Unix)
  name = name.replace(/^\.+|\.+$/g, '');

  // 6. Limiter longueur (Windows: 255 caractères max)
  if (name.length > 255) {
    name = name.slice(0, 255);
  }

  // 7. Vérifier noms réservés Windows
  const reserved = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];

  if (reserved.includes(name.toUpperCase())) {
    name += '_file';
  }

  // 8. Vérifier que le nom n'est pas vide après sanitization
  if (!name || name.trim() === '') {
    throw new Error('Filename cannot be empty after sanitization');
  }

  return name;
}

/**
 * Crée une hiérarchie de dossiers récursivement
 * @param {FileSystemDirectoryHandle} parentHandle - Handle du dossier parent
 * @param {string} path - Chemin relatif (ex: "assets/css/fonts")
 * @returns {Promise<FileSystemDirectoryHandle>} Handle du dernier dossier créé
 */
export async function createDirectories(parentHandle, path) {
  const parts = path.split('/').filter(p => p);
  let currentHandle = parentHandle;

  for (const part of parts) {
    const sanitizedPart = sanitizeFileName(part);
    currentHandle = await currentHandle.getDirectoryHandle(sanitizedPart, {
      create: true
    });
  }

  return currentHandle;
}

// ========================================
// Object URL Management
// ========================================

// Tracking des Object URLs pour éviter les memory leaks
const objectUrls = new Set();

/**
 * Crée un Object URL et le track pour nettoyage ultérieur
 * @param {Blob|File} blob - Fichier ou blob
 * @returns {string} Object URL
 */
export function createObjectURL(blob) {
  const url = URL.createObjectURL(blob);
  objectUrls.add(url);
  return url;
}

/**
 * Révoque un Object URL spécifique
 * @param {string} url - Object URL à révoquer
 */
export function revokeObjectURL(url) {
  if (objectUrls.has(url)) {
    URL.revokeObjectURL(url);
    objectUrls.delete(url);
  }
}

/**
 * Révoque tous les Object URLs trackés
 * À appeler lors du cleanup (fermeture modal, changement de page, etc.)
 */
export function revokeAllObjectURLs() {
  objectUrls.forEach(url => URL.revokeObjectURL(url));
  objectUrls.clear();
}

/**
 * Obtient le nombre d'Object URLs actifs
 * Utile pour debug et monitoring
 * @returns {number} Nombre d'URLs actifs
 */
export function getObjectURLCount() {
  return objectUrls.size;
}

// ========================================
// UI Feedback
// ========================================

/**
 * Affiche ou cache le loader
 * @param {boolean} show - true pour afficher, false pour cacher
 * @param {string} text - Texte à afficher dans le loader
 */
export function showLoader(show, text = 'Traitement en cours...') {
  const loader = $('.loader');
  const loaderText = $('.loader-text');

  if (loader) {
    loader.style.display = show ? 'block' : 'none';
    if (loaderText && text) {
      loaderText.textContent = text;
    }
  }
}

/**
 * Affiche une notification toast
 * @param {string} message - Message à afficher
 * @param {string} type - Type: 'info', 'success', 'warning', 'error'
 * @param {number} duration - Durée d'affichage en ms (défaut: 5000)
 */
export function showNotification(message, type = 'info', duration = 5000) {
  const notif = document.createElement('div');
  notif.className = `notification notification-${type}`;
  notif.textContent = message;

  // Styles inline pour garantir l'affichage
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-weight: 500;
    z-index: 10000;
    opacity: 0;
    transform: translateX(400px);
    transition: all 0.3s ease;
  `;

  // Couleurs selon le type
  const colors = {
    info: { bg: '#3b82f6', color: '#ffffff' },
    success: { bg: '#10b981', color: '#ffffff' },
    warning: { bg: '#f59e0b', color: '#ffffff' },
    error: { bg: '#ef4444', color: '#ffffff' }
  };

  const color = colors[type] || colors.info;
  notif.style.backgroundColor = color.bg;
  notif.style.color = color.color;

  document.body.appendChild(notif);

  // Animation d'entrée
  setTimeout(() => {
    notif.style.opacity = '1';
    notif.style.transform = 'translateX(0)';
  }, 10);

  // Animation de sortie et suppression
  setTimeout(() => {
    notif.style.opacity = '0';
    notif.style.transform = 'translateX(400px)';
    setTimeout(() => notif.remove(), 300);
  }, duration);
}

/**
 * Raccourci pour afficher une notification d'erreur
 * @param {string} message - Message d'erreur
 */
export function showError(message) {
  showNotification(message, 'error');
}

/**
 * Raccourci pour afficher une notification de succès
 * @param {string} message - Message de succès
 */
export function showSuccess(message) {
  showNotification(message, 'success');
}

/**
 * Raccourci pour afficher un avertissement
 * @param {string} message - Message d'avertissement
 */
export function showWarning(message) {
  showNotification(message, 'warning');
}

// ========================================
// Progress Bar
// ========================================

/**
 * Met à jour une barre de progression
 * @param {number} percent - Pourcentage (0-100)
 * @param {string} text - Texte optionnel à afficher
 */
export function updateProgress(percent, text = '') {
  const progressBar = $('#progressBar');
  const progressText = $('#progressText');

  if (progressBar) {
    progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  }

  if (progressText) {
    progressText.textContent = text || `${Math.round(percent)}%`;
  }
}

/**
 * Affiche ou cache le conteneur de progression
 * @param {boolean} show - true pour afficher, false pour cacher
 */
export function showProgress(show) {
  const container = $('.progress-container');
  if (container) {
    container.style.display = show ? 'block' : 'none';
  }
}

// ========================================
// Formatting Helpers
// ========================================

/**
 * Formate une date en format français
 * @param {Date|string|number} date - Date à formater
 * @returns {string} Date formatée (ex: "30/01/2026")
 */
export function formatDate(date) {
  if (!date) return 'N/A';

  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Date invalide';

  return d.toLocaleDateString('fr-FR');
}

/**
 * Formate une taille de fichier en unité lisible
 * @param {number} bytes - Taille en octets
 * @returns {string} Taille formatée (ex: "1.5 MB")
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Tronque un texte à une longueur maximale
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @param {string} suffix - Suffixe à ajouter (défaut: "...")
 * @returns {string} Texte tronqué
 */
export function truncate(text, maxLength, suffix = '...') {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

// ========================================
// Debounce / Throttle
// ========================================

/**
 * Debounce: retarde l'exécution d'une fonction jusqu'à ce que
 * l'utilisateur arrête de déclencher l'événement pendant X ms
 * @param {Function} fn - Fonction à debouncer
 * @param {number} delay - Délai en ms
 * @returns {Function} Fonction debouncée
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle: limite le nombre d'exécutions d'une fonction dans le temps
 * @param {Function} fn - Fonction à throttler
 * @param {number} delay - Délai minimum entre exécutions en ms
 * @returns {Function} Fonction throttlée
 */
export function throttle(fn, delay = 300) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

// ========================================
// Clipboard
// ========================================

/**
 * Copie du texte dans le presse-papiers
 * @param {string} text - Texte à copier
 * @returns {Promise<void>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showSuccess('Copié dans le presse-papiers !');
  } catch (error) {
    showError('Échec de la copie : ' + error.message);
    throw error;
  }
}

// ========================================
// Browser Detection
// ========================================

/**
 * Vérifie si le navigateur supporte l'API File System Access
 * @returns {boolean} true si supporté
 */
export function supportsFileSystemAPI() {
  return typeof window.showDirectoryPicker === 'function';
}

/**
 * Obtient le nom du navigateur
 * @returns {string} Nom du navigateur
 */
export function getBrowserName() {
  const ua = navigator.userAgent;

  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
    return 'Chrome';
  } else if (ua.indexOf('Edg') > -1) {
    return 'Edge';
  } else if (ua.indexOf('Firefox') > -1) {
    return 'Firefox';
  } else if (ua.indexOf('Safari') > -1) {
    return 'Safari';
  }

  return 'Unknown';
}
