/**
 * Module d'Aide Contextuel - Interface Impulsion Marketing
 *
 * Gère l'affichage des modals d'instructions pour chaque page de l'application.
 *
 * @namespace window.ImpulsionMarketing.help
 */

(function() {
    'use strict';

    // Initialiser le namespace
    if (typeof window.ImpulsionMarketing === 'undefined') {
        window.ImpulsionMarketing = {};
    }

    /**
     * Instructions pour chaque page de l'application
     */
    var pageInstructions = {
        'index': {
            title: 'Bienvenue',
            icon: '🏠',
            content: [
                {
                    subtitle: 'Première utilisation',
                    text: 'Cliquez sur "Charger le dossier racine" et sélectionnez le dossier contenant vos campagnes marketing. L\'application gardera cet accès en mémoire.'
                },
                {
                    subtitle: 'Navigation',
                    text: 'Utilisez les boutons pour accéder aux différentes fonctionnalités : créer une campagne, visualiser les campagnes existantes, ou déposer des livrables.'
                },
                {
                    subtitle: 'Personnalisation',
                    text: 'Changez le thème de l\'application avec le sélecteur en haut à droite (13 thèmes disponibles).'
                }
            ]
        },
        'saisie-campagne': {
            title: 'Créer une Campagne',
            icon: '✍️',
            content: [
                {
                    subtitle: 'Informations générales',
                    text: 'Remplissez tous les champs obligatoires : nom de la campagne, dates, segment, UB, type de communication, etc.'
                },
                {
                    subtitle: 'Canaux',
                    text: 'Sélectionnez un ou plusieurs canaux de communication. Chaque canal créera un dossier de livrable associé.'
                },
                {
                    subtitle: 'Sauvegarde',
                    text: 'Cliquez sur "Créer la Campagne" pour sauvegarder. Un dossier sera créé avec la structure complète (campagne.json + dossiers livrables).'
                }
            ]
        },
        'visualization': {
            title: 'Visualiser les Campagnes',
            icon: '📊',
            content: [
                {
                    subtitle: 'Recherche',
                    text: 'Utilisez la barre de recherche pour trouver une campagne par son nom ou ses mots-clés.'
                },
                {
                    subtitle: 'Filtres',
                    text: 'Filtrez les campagnes par UB, Canal ou Type de communication. Combinez plusieurs filtres pour affiner votre recherche.'
                },
                {
                    subtitle: 'Tri',
                    text: 'Triez les résultats par date (plus récent/ancien) ou par nom (A-Z/Z-A).'
                },
                {
                    subtitle: 'Accès aux détails',
                    text: 'Cliquez sur une carte de campagne pour voir tous ses détails et ses livrables.'
                }
            ]
        },
        'details': {
            title: 'Détails de la Campagne',
            icon: '📋',
            content: [
                {
                    subtitle: 'Informations complètes',
                    text: 'Consultez toutes les informations de la campagne : dates, segments, UB, type, canaux, etc.'
                },
                {
                    subtitle: 'Livrables',
                    text: 'La liste des canaux affiche l\'état de chaque livrable (vide, en cours, ou complet). Cliquez sur un canal pour voir ses dépôts.'
                },
                {
                    subtitle: 'Navigation',
                    text: 'Utilisez les boutons pour accéder directement au dépôt d\'un livrable ou retourner à la liste des campagnes.'
                }
            ]
        },
        'channel-depot': {
            title: 'Consultation d\'un Dépôt',
            icon: '📁',
            content: [
                {
                    subtitle: 'Onglets Com/EBF/Data',
                    text: 'Utilisez les onglets pour naviguer entre les différents types de dépôts du livrable.'
                },
                {
                    subtitle: 'Informations affichées',
                    text: 'Consultez toutes les informations déposées : fichiers PDF, URLs Figma, images, CTAs, codes projets, etc.'
                },
                {
                    subtitle: 'PDF',
                    text: 'Cliquez sur l\'aperçu du PDF pour l\'ouvrir en plein écran dans une modal.'
                },
                {
                    subtitle: 'Compléter un dépôt',
                    text: 'Si le dépôt est vide ou incomplet, utilisez les boutons de navigation pour accéder aux pages de dépôt correspondantes.'
                }
            ]
        },
        'com': {
            title: 'Dépôt Com',
            icon: '💬',
            content: [
                {
                    subtitle: 'Fichiers requis',
                    text: 'PDF (obligatoire) : Le fichier du livrable de communication.'
                },
                {
                    subtitle: 'Informations additionnelles',
                    text: 'URL Figma (optionnelle), URLs d\'images (optionnelles), validation juridique (Oui/Non).'
                },
                {
                    subtitle: 'Sauvegarde',
                    text: 'Cliquez sur "Déposer le Livrable Com". Le fichier PDF sera copié dans le dossier du canal et un fichier depot_com.json sera créé.'
                }
            ]
        },
        'ebf': {
            title: 'Dépôt EBF',
            icon: '🏦',
            content: [
                {
                    subtitle: 'Initialisation',
                    text: 'Remplissez les informations d\'initialisation : nom webmaster, code com, référence Paracom, CTAs.'
                },
                {
                    subtitle: 'BAT',
                    text: 'Déposez le fichier PDF du BAT (Bon À Tirer) une fois disponible.'
                },
                {
                    subtitle: 'Test en prod',
                    text: 'Déposez le fichier PDF du test en production une fois réalisé.'
                },
                {
                    subtitle: 'Étapes',
                    text: 'Suivez les 3 étapes dans l\'ordre : Initialisation, puis BAT, puis Test en prod. Chaque étape sauvegarde un fichier JSON distinct.'
                }
            ]
        },
        'data': {
            title: 'Dépôt Data',
            icon: '📊',
            content: [
                {
                    subtitle: 'Codes et informations',
                    text: 'Renseignez le code projet, le code action, le nom du responsable CRM et le chemin de la requête.'
                },
                {
                    subtitle: 'Sauvegarde',
                    text: 'Cliquez sur "Déposer le Livrable Data". Le fichier PDF sera copié et un fichier depot_data.json sera créé.'
                }
            ]
        },
        'pilotage': {
            title: 'Pilotage des Campagnes',
            icon: '🎯',
            content: [
                {
                    subtitle: 'Vue d\'ensemble',
                    text: 'Consultez les statistiques globales : nombre total de campagnes, campagnes actives, terminées et le taux de complétion moyen.'
                },
                {
                    subtitle: 'Répartitions',
                    text: 'Analysez la distribution de vos campagnes par marché (Particuliers/Spécialisés), par typologie (PR/Campagne) et par canal de communication.'
                },
                {
                    subtitle: 'Campagnes récentes',
                    text: 'Visualisez les 10 dernières campagnes créées avec leur progression et leurs informations clés.'
                },
                {
                    subtitle: 'Indicateurs',
                    text: 'Le taux de complétion indique le pourcentage moyen des livrables déposés (Com, EBF, Data) pour l\'ensemble des campagnes.'
                }
            ]
        }
    };

    /**
     * Initialise le système d'aide pour la page courante
     * @param {string} pageKey - Clé de la page (ex: 'index', 'saisie-campagne', etc.)
     */
    function initHelp(pageKey) {
        var instructions = pageInstructions[pageKey];
        if (!instructions) {
            console.warn('[ImpulsionMarketing.help] Aucune instruction trouvée pour la page:', pageKey);
            return;
        }

        // Créer la modal d'aide si elle n'existe pas
        createHelpModal(instructions);

        // Créer le bouton d'aide
        createHelpButton();

        console.log('[ImpulsionMarketing.help] Système d\'aide initialisé pour:', pageKey);
    }

    /**
     * Crée la modal d'aide
     * @param {object} instructions - Instructions de la page
     */
    function createHelpModal(instructions) {
        // Vérifier si la modal existe déjà
        if (document.getElementById('help-modal')) {
            return;
        }

        var modal = document.createElement('div');
        modal.id = 'help-modal';
        modal.className = 'help-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'help-modal-title');
        modal.setAttribute('aria-hidden', 'true');

        var security = window.ImpulsionMarketing.security;
        var html = '';

        html += '<div class="help-modal-overlay"></div>';
        html += '<div class="help-modal-content">';
        html += '  <div class="help-modal-header">';
        html += '    <h2 id="help-modal-title">' + instructions.icon + ' ' + security.escapeHtml(instructions.title) + '</h2>';
        html += '    <button class="help-modal-close" aria-label="Fermer">&times;</button>';
        html += '  </div>';
        html += '  <div class="help-modal-body">';

        instructions.content.forEach(function(section) {
            html += '    <div class="help-section">';
            html += '      <h3>' + security.escapeHtml(section.subtitle) + '</h3>';
            html += '      <p>' + security.escapeHtml(section.text) + '</p>';
            html += '    </div>';
        });

        html += '  </div>';
        html += '</div>';

        modal.innerHTML = html;
        document.body.appendChild(modal);

        // Event listeners
        var closeBtn = modal.querySelector('.help-modal-close');
        var overlay = modal.querySelector('.help-modal-overlay');

        closeBtn.addEventListener('click', closeHelpModal);
        overlay.addEventListener('click', closeHelpModal);

        // ESC pour fermer
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeHelpModal();
            }
        });
    }

    /**
     * Crée le bouton d'aide
     */
    function createHelpButton() {
        // Vérifier si le bouton existe déjà
        if (document.getElementById('help-button')) {
            return;
        }

        var button = document.createElement('button');
        button.id = 'help-button';
        button.className = 'help-button';
        button.setAttribute('aria-label', 'Ouvrir l\'aide');
        button.setAttribute('title', 'Instructions de la page');
        button.innerHTML = '?';

        button.addEventListener('click', openHelpModal);

        document.body.appendChild(button);
    }

    /**
     * Ouvre la modal d'aide
     */
    function openHelpModal() {
        var modal = document.getElementById('help-modal');
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            // Focus sur le bouton de fermeture
            var closeBtn = modal.querySelector('.help-modal-close');
            if (closeBtn) {
                closeBtn.focus();
            }
        }
    }

    /**
     * Ferme la modal d'aide
     */
    function closeHelpModal() {
        var modal = document.getElementById('help-modal');
        if (modal) {
            modal.classList.add('closing');
            modal.setAttribute('aria-hidden', 'true');

            setTimeout(function() {
                modal.classList.remove('active');
                modal.classList.remove('closing');
            }, 300);

            // Redonner le focus au bouton d'aide
            var helpBtn = document.getElementById('help-button');
            if (helpBtn) {
                helpBtn.focus();
            }
        }
    }

    // Exposer l'API publique
    window.ImpulsionMarketing.help = {
        initHelp: initHelp,
        openHelpModal: openHelpModal,
        closeHelpModal: closeHelpModal
    };

})();
