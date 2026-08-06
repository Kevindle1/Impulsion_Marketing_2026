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
