/**
 * Gestionnaire de Stockage Persistant du Dossier Racine
 * Interface Impulsion Marketing
 *
 * Utilise IndexedDB pour stocker le FileSystemDirectoryHandle
 * entre les sessions et les pages
 */

const DB_NAME = 'ImpulsionMarketingDB';
const DB_VERSION = 1;
const STORE_NAME = 'settings';
const HANDLE_KEY = 'rootDirectoryHandle';

/**
 * Classe singleton pour gérer le stockage du handle de dossier
 */
class DirectoryStorage {
  constructor() {
    this.db = null;
    this.cachedHandle = null;
  }

  /**
   * Initialise la connexion IndexedDB
   * @returns {Promise<IDBDatabase>}
   */
  async initDB() {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Créer le store s'il n'existe pas
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  /**
   * Sauvegarde le handle du dossier racine dans IndexedDB
   * @param {FileSystemDirectoryHandle} handle - Handle à sauvegarder
   * @returns {Promise<void>}
   */
  async saveRootHandle(handle) {
    if (!handle) {
      throw new Error('Le handle du dossier ne peut pas être null');
    }

    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // Sauvegarder le handle et des métadonnées
      const data = {
        handle: handle,
        name: handle.name,
        savedAt: new Date().toISOString()
      };

      const request = store.put(data, HANDLE_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.cachedHandle = handle;
        console.log(`✅ Dossier "${handle.name}" sauvegardé avec succès`);
        resolve();
      };
    });
  }

  /**
   * Récupère le handle du dossier racine depuis IndexedDB
   * @returns {Promise<FileSystemDirectoryHandle|null>}
   */
  async loadRootHandle() {
    // Retourner le cache si disponible
    if (this.cachedHandle) {
      return this.cachedHandle;
    }

    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(HANDLE_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const data = request.result;

        if (data && data.handle) {
          this.cachedHandle = data.handle;
          console.log(`✅ Dossier "${data.name}" chargé depuis le cache`);
          resolve(data.handle);
        } else {
          console.log('ℹ️ Aucun dossier sauvegardé trouvé');
          resolve(null);
        }
      };
    });
  }

  /**
   * Vérifie les permissions du handle et les redemande si nécessaire
   * @param {FileSystemDirectoryHandle} handle - Handle à vérifier
   * @param {string} mode - 'read' ou 'readwrite'
   * @returns {Promise<boolean>} true si permission accordée
   */
  async checkPermission(handle, mode = 'readwrite') {
    if (!handle) {
      return false;
    }

    try {
      // Vérifier permission actuelle
      let permission = await handle.queryPermission({ mode });

      // Si déjà accordée
      if (permission === 'granted') {
        return true;
      }

      // Sinon, demander la permission
      permission = await handle.requestPermission({ mode });
      return permission === 'granted';
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }

  /**
   * Vérifie si le handle est toujours valide
   * (le dossier existe toujours et on peut y accéder)
   * @param {FileSystemDirectoryHandle} handle - Handle à vérifier
   * @returns {Promise<boolean>}
   */
  async isHandleValid(handle) {
    if (!handle) {
      return false;
    }

    try {
      // Tenter une opération simple pour vérifier la validité
      await handle.queryPermission({ mode: 'read' });
      return true;
    } catch (error) {
      console.warn('Le handle n\'est plus valide:', error);
      return false;
    }
  }

  /**
   * Récupère le handle avec vérification complète
   * Charge le handle, vérifie sa validité et les permissions
   * @param {string} mode - 'read' ou 'readwrite'
   * @returns {Promise<{handle: FileSystemDirectoryHandle|null, status: string, message: string}>}
   */
  async getRootHandleWithCheck(mode = 'readwrite') {
    try {
      // Charger le handle depuis IndexedDB
      const handle = await this.loadRootHandle();

      if (!handle) {
        return {
          handle: null,
          status: 'no_handle',
          message: 'Aucun dossier n\'a été sélectionné. Veuillez retourner à l\'accueil pour charger le dossier.'
        };
      }

      // Vérifier que le handle est toujours valide
      const isValid = await this.isHandleValid(handle);
      if (!isValid) {
        await this.clearRootHandle();
        return {
          handle: null,
          status: 'invalid_handle',
          message: 'Le dossier précédemment sélectionné n\'est plus accessible. Veuillez retourner à l\'accueil pour charger le dossier.'
        };
      }

      // Vérifier les permissions
      const hasPermission = await this.checkPermission(handle, mode);
      if (!hasPermission) {
        return {
          handle: null,
          status: 'no_permission',
          message: 'Les permissions d\'accès au dossier ont été refusées. Veuillez retourner à l\'accueil pour recharger le dossier.'
        };
      }

      // Tout est OK
      return {
        handle: handle,
        status: 'success',
        message: `Dossier "${handle.name}" prêt à être utilisé`
      };

    } catch (error) {
      console.error('Erreur lors de la récupération du handle:', error);
      return {
        handle: null,
        status: 'error',
        message: `Erreur: ${error.message}`
      };
    }
  }

  /**
   * Supprime le handle sauvegardé
   * @returns {Promise<void>}
   */
  async clearRootHandle() {
    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(HANDLE_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.cachedHandle = null;
        console.log('🗑️ Handle du dossier supprimé');
        resolve();
      };
    });
  }

  /**
   * Obtient les métadonnées du dossier sauvegardé (sans charger le handle)
   * @returns {Promise<{name: string, savedAt: string}|null>}
   */
  async getRootInfo() {
    await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(HANDLE_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
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
  }

  /**
   * Demande à l'utilisateur de sélectionner un dossier
   * et le sauvegarde automatiquement
   * @returns {Promise<FileSystemDirectoryHandle>}
   */
  async promptAndSaveDirectory() {
    if (!window.showDirectoryPicker) {
      throw new Error('Votre navigateur ne supporte pas l\'API File System Access. Utilisez Chrome ou Edge.');
    }

    try {
      const handle = await window.showDirectoryPicker({
        id: 'impulsion-marketing-root',
        mode: 'readwrite',
        startIn: 'desktop'
      });

      // Sauvegarder automatiquement
      await this.saveRootHandle(handle);

      return handle;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Sélection du dossier annulée');
      }
      throw error;
    }
  }
}

// Export de l'instance unique
export default new DirectoryStorage();
