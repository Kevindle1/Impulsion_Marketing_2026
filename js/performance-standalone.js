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

    console.log('[Performance] ' + label + ': ' + duration.toFixed(2) + 'ms');

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
      console.log('[Performance] ' + label + ': ' + duration.toFixed(2) + 'ms');
      return result;
    }).catch(function(error) {
      var duration = performance.now() - start;
      console.log('[Performance] ' + label + ' (error): ' + duration.toFixed(2) + 'ms');
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
