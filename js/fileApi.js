/**
 * Wrapper pour File System Access API
 * Interface Impulsion Marketing
 *
 * Classe singleton pour gérer toutes les opérations de fichiers
 * Simplifie l'utilisation de l'API et ajoute la gestion d'erreurs
 */

import { sanitizeFileName, createDirectories } from './utils.js';
import { validateFileName } from './validators.js';
import { ERROR_MESSAGES, DEFAULT_ROOT_PATH } from './config.js';

// Instance singleton
let instance = null;

/**
 * Gestionnaire du Système de Fichiers
 * Pattern Singleton pour garantir une seule instance
 */
export class FileSystemManager {
  constructor() {
    // Retourner l'instance existante si déjà créée
    if (instance) {
      return instance;
    }

    this.rootHandle = null;
    this.permissionState = 'prompt';

    instance = this;
  }

  // ========================================
  // Sélection et Permissions
  // ========================================

  /**
   * Affiche le dialog de sélection de dossier
   * @param {Object} options - Options pour showDirectoryPicker
   * @returns {Promise<FileSystemDirectoryHandle>}
   */
  async pickDirectory(options = {}) {
    // Vérifier support API
    if (!window.showDirectoryPicker) {
      throw new Error(ERROR_MESSAGES.BROWSER_NOT_SUPPORTED);
    }

    try {
      this.rootHandle = await window.showDirectoryPicker({
        id: 'impulsion-marketing-root',
        mode: 'readwrite',
        startIn: 'desktop',
        ...options
      });

      // Tentative de persistence (metadata uniquement)
      await this.persistPermission();

      return this.rootHandle;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error("Sélection annulée par l'utilisateur");
      }
      throw error;
    }
  }

  /**
   * Tente de persister les métadonnées du dossier sélectionné
   * Note: Les permissions ne peuvent pas être persistées (limitation API)
   */
  async persistPermission() {
    try {
      if (this.rootHandle) {
        localStorage.setItem('lastRootName', this.rootHandle.name);
        localStorage.setItem('lastRootTime', new Date().toISOString());
      }
    } catch (error) {
      console.warn('Cannot persist permission metadata:', error);
    }
  }

  /**
   * Restaure les informations du dernier dossier utilisé
   * @returns {Object|null} Métadonnées du dernier dossier
   */
  getLastRootInfo() {
    try {
      const name = localStorage.getItem('lastRootName');
      const time = localStorage.getItem('lastRootTime');

      if (name && time) {
        return { name, time: new Date(time) };
      }
    } catch (error) {
      console.warn('Cannot restore permission metadata:', error);
    }

    return null;
  }

  /**
   * Vérifie et demande les permissions si nécessaire
   * @param {string} mode - 'read' ou 'readwrite'
   * @returns {Promise<boolean>} true si permission accordée
   */
  async ensurePermission(mode = 'readwrite') {
    if (!this.rootHandle) {
      throw new Error(ERROR_MESSAGES.NO_ROOT_SELECTED);
    }

    // Vérifier permission actuelle
    let permission = await this.rootHandle.queryPermission({ mode });

    // Demander si nécessaire
    if (permission !== 'granted') {
      permission = await this.rootHandle.requestPermission({ mode });
    }

    this.permissionState = permission;
    return permission === 'granted';
  }

  /**
   * Vérifie si connecté à un dossier racine
   * @returns {boolean}
   */
  isConnected() {
    return this.rootHandle !== null;
  }

  /**
   * Obtient le handle du dossier racine
   * @returns {FileSystemDirectoryHandle|null}
   */
  getRootHandle() {
    return this.rootHandle;
  }

  // ========================================
  // Navigation
  // ========================================

  /**
   * Obtient un handle de dossier (avec création optionnelle)
   * @param {string} path - Chemin relatif (ex: "campagne/MAIL")
   * @param {Object} options - Options { create: boolean }
   * @returns {Promise<FileSystemDirectoryHandle>}
   */
  async getDirectoryHandle(path, options = {}) {
    if (!this.rootHandle) {
      throw new Error(ERROR_MESSAGES.NO_ROOT_SELECTED);
    }

    // Si path vide, retourner root
    if (!path || path === '.' || path === '/') {
      return this.rootHandle;
    }

    // Utiliser helper pour créer hiérarchie
    if (options.create) {
      return await createDirectories(this.rootHandle, path);
    }

    // Sinon naviguer manuellement
    const parts = path.split('/').filter(p => p);
    let currentHandle = this.rootHandle;

    for (const part of parts) {
      try {
        currentHandle = await currentHandle.getDirectoryHandle(part, options);
      } catch (error) {
        if (error.name === 'NotFoundError') {
          throw new Error(`Dossier introuvable: ${path}`);
        }
        throw error;
      }
    }

    return currentHandle;
  }

  /**
   * Obtient un handle de fichier
   * @param {FileSystemDirectoryHandle} dirHandle - Handle du dossier parent
   * @param {string} filename - Nom du fichier
   * @param {Object} options - Options { create: boolean }
   * @returns {Promise<FileSystemFileHandle>}
   */
  async getFileHandle(dirHandle, filename, options = {}) {
    try {
      validateFileName(filename);
      return await dirHandle.getFileHandle(filename, options);
    } catch (error) {
      if (error.name === 'NotFoundError') {
        throw new Error(`Fichier introuvable: ${filename}`);
      }
      throw error;
    }
  }

  // ========================================
  // Lecture
  // ========================================

  /**
   * Lit un fichier JSON
   * @param {FileSystemDirectoryHandle} dirHandle - Handle du dossier
   * @param {string} filename - Nom du fichier JSON
   * @returns {Promise<Object|null>} Données JSON ou null si non trouvé
   */
  async readJSON(dirHandle, filename) {
    try {
      const fileHandle = await this.getFileHandle(dirHandle, filename);
      const file = await fileHandle.getFile();
      const text = await file.text();
      return JSON.parse(text);
    } catch (error) {
      if (error.name === 'NotFoundError') {
        return null;
      }
      if (error instanceof SyntaxError) {
        throw new Error(`${ERROR_MESSAGES.JSON_PARSE_ERROR}: ${filename}`);
      }
      throw error;
    }
  }

  /**
   * Lit un fichier texte
   * @param {FileSystemFileHandle} fileHandle - Handle du fichier
   * @returns {Promise<string>} Contenu du fichier
   */
  async readFile(fileHandle) {
    const file = await fileHandle.getFile();
    return await file.text();
  }

  /**
   * Lit un fichier en ArrayBuffer
   * @param {FileSystemFileHandle} fileHandle - Handle du fichier
   * @returns {Promise<ArrayBuffer>} Contenu binaire
   */
  async readFileBuffer(fileHandle) {
    const file = await fileHandle.getFile();
    return await file.arrayBuffer();
  }

  /**
   * Obtient l'objet File
   * @param {FileSystemFileHandle} fileHandle - Handle du fichier
   * @returns {Promise<File>} Objet File
   */
  async getFile(fileHandle) {
    return await fileHandle.getFile();
  }

  // ========================================
  // Écriture
  // ========================================

  /**
   * Écrit un objet en JSON
   * @param {FileSystemDirectoryHandle} dirHandle - Handle du dossier
   * @param {string} filename - Nom du fichier
   * @param {Object} data - Données à écrire
   * @param {number} spaces - Nombre d'espaces pour indentation (défaut: 2)
   */
  async writeJSON(dirHandle, filename, data, spaces = 2) {
    validateFileName(filename);

    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();

    try {
      const jsonString = JSON.stringify(data, null, spaces);
      await writable.write(jsonString);
      await writable.close();
    } catch (error) {
      // En cas d'erreur, annuler les changements
      await writable.abort();
      throw error;
    }
  }

  /**
   * Écrit du contenu dans un fichier
   * @param {FileSystemDirectoryHandle} dirHandle - Handle du dossier
   * @param {string} filename - Nom du fichier
   * @param {string|ArrayBuffer|Blob} content - Contenu à écrire
   */
  async writeFile(dirHandle, filename, content) {
    validateFileName(filename);

    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();

    try {
      await writable.write(content);
      await writable.close();
    } catch (error) {
      await writable.abort();
      throw error;
    }
  }

  // ========================================
  // Listage
  // ========================================

  /**
   * Liste tous les dossiers d'un répertoire
   * @param {FileSystemDirectoryHandle} dirHandle - Handle du dossier
   * @returns {Promise<Object[]>} Array de { name, handle }
   */
  async listDirectories(dirHandle) {
    const directories = [];

    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === 'directory') {
        directories.push({ name, handle });
      }
    }

    return directories.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Liste tous les fichiers d'un répertoire
   * @param {FileSystemDirectoryHandle} dirHandle - Handle du dossier
   * @param {Function} filter - Fonction de filtrage optionnelle
   * @returns {Promise<Object[]>} Array de { name, handle, file }
   */
  async listFiles(dirHandle, filter = null) {
    const files = [];

    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === 'file') {
        if (!filter || filter(name)) {
          const file = await handle.getFile();
          files.push({ name, handle, file });
        }
      }
    }

    return files.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Liste tous les éléments d'un répertoire
   * @param {FileSystemDirectoryHandle} dirHandle - Handle du dossier
   * @returns {Promise<Object[]>} Array de { name, kind, handle }
   */
  async listAll(dirHandle) {
    const items = [];

    for await (const [name, handle] of dirHandle.entries()) {
      items.push({
        name,
        kind: handle.kind,
        handle
      });
    }

    return items.sort((a, b) => a.name.localeCompare(b.name));
  }

  // ========================================
  // Scan Récursif
  // ========================================

  /**
   * Scanne un dossier récursivement
   * @param {FileSystemDirectoryHandle} dirHandle - Handle du dossier
   * @param {string} basePath - Chemin de base (pour récursion)
   * @param {Object} options - Options { maxDepth, filter }
   * @returns {Promise<Object[]>} Array de { path, name, kind, handle }
   */
  async scanDirectory(dirHandle, basePath = '', options = {}) {
    const {
      maxDepth = Infinity,
      filter = null,
      currentDepth = 0
    } = options;

    const results = [];

    if (currentDepth >= maxDepth) {
      return results;
    }

    for await (const [name, handle] of dirHandle.entries()) {
      const fullPath = basePath ? `${basePath}/${name}` : name;

      // Appliquer filtre si fourni
      if (filter && !filter(name, handle.kind)) {
        continue;
      }

      results.push({
        path: fullPath,
        name,
        kind: handle.kind,
        handle
      });

      // Récursion pour dossiers
      if (handle.kind === 'directory') {
        const subResults = await this.scanDirectory(
          handle,
          fullPath,
          { ...options, currentDepth: currentDepth + 1 }
        );
        results.push(...subResults);
      }
    }

    return results;
  }

  // ========================================
  // Suppression
  // ========================================

  /**
   * Supprime un fichier ou dossier
   * @param {FileSystemDirectoryHandle} dirHandle - Handle du dossier parent
   * @param {string} name - Nom de l'élément à supprimer
   * @param {boolean} recursive - true pour supprimer récursivement
   */
  async remove(dirHandle, name, recursive = false) {
    try {
      await dirHandle.removeEntry(name, { recursive });
    } catch (error) {
      if (error.name === 'NotFoundError') {
        throw new Error(`Élément introuvable: ${name}`);
      }
      throw error;
    }
  }

  // ========================================
  // Helpers
  // ========================================

  /**
   * Vérifie si un fichier existe
   * @param {FileSystemDirectoryHandle} dirHandle - Handle du dossier
   * @param {string} filename - Nom du fichier
   * @returns {Promise<boolean>}
   */
  async fileExists(dirHandle, filename) {
    try {
      await this.getFileHandle(dirHandle, filename);
      return true;
    } catch (error) {
      if (error.message.includes('introuvable')) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Vérifie si un dossier existe
   * @param {FileSystemDirectoryHandle} dirHandle - Handle du dossier parent
   * @param {string} name - Nom du dossier
   * @returns {Promise<boolean>}
   */
  async directoryExists(dirHandle, name) {
    try {
      await dirHandle.getDirectoryHandle(name);
      return true;
    } catch (error) {
      if (error.name === 'NotFoundError') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Obtient les informations d'un fichier
   * @param {FileSystemFileHandle} fileHandle - Handle du fichier
   * @returns {Promise<Object>} { name, size, lastModified, type }
   */
  async getFileInfo(fileHandle) {
    const file = await fileHandle.getFile();
    return {
      name: file.name,
      size: file.size,
      lastModified: new Date(file.lastModified),
      type: file.type
    };
  }
}

// Export de l'instance unique
export default new FileSystemManager();
