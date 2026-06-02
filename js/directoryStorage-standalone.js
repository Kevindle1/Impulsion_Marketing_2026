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
   * Récupère le handle avec vérification complète
   * @param {string} mode - 'read' ou 'readwrite'
   * @returns {Promise<Object>}
   */
  function getRootHandleWithCheck(mode) {
    mode = mode || 'readwrite';

    // Charger le handle depuis IndexedDB
    return loadRootHandle()
      .then(function(handle) {
        if (!handle) {
          return {
            handle: null,
            status: 'no_handle',
            message: 'Aucun dossier n\'a été sélectionné. Veuillez retourner à l\'accueil pour charger le dossier.'
          };
        }

        // Vérifier que le handle est toujours valide
        return isHandleValid(handle)
          .then(function(isValid) {
            if (!isValid) {
              return clearRootHandle().then(function() {
                return {
                  handle: null,
                  status: 'invalid_handle',
                  message: 'Le dossier précédemment sélectionné n\'est plus accessible. Veuillez retourner à l\'accueil pour charger le dossier.'
                };
              });
            }

            // Vérifier les permissions
            return checkPermission(handle, mode)
              .then(function(hasPermission) {
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
                  message: 'Dossier "' + handle.name + '" prêt à être utilisé'
                };
              });
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

  // API Publique
  return {
    initDB: initDB,
    saveRootHandle: saveRootHandle,
    loadRootHandle: loadRootHandle,
    checkPermission: checkPermission,
    isHandleValid: isHandleValid,
    getRootHandleWithCheck: getRootHandleWithCheck,
    clearRootHandle: clearRootHandle,
    getRootInfo: getRootInfo,
    promptAndSaveDirectory: promptAndSaveDirectory
  };
})();
