/**
 * Script d'initialisation automatique de la sidebar pour toutes les pages
 * À inclure dans chaque page avant la fermeture du body
 */
(function() {
    'use strict';

    // Déterminer la page actuelle basée sur le nom du fichier
    var currentPath = window.location.pathname;
    var currentPage = '';

    if (currentPath.includes('campaign.html')) currentPage = 'campaign';
    else if (currentPath.includes('pilotage.html')) currentPage = 'pilotage';
    else if (currentPath.includes('visualization.html')) currentPage = 'visualization';
    else if (currentPath.includes('com.html')) currentPage = 'com';
    else if (currentPath.includes('ebf.html')) currentPage = 'ebf';
    else if (currentPath.includes('data.html')) currentPage = 'data';
    else if (currentPath.includes('manager')) currentPage = 'manager';

    // Fonction pour générer le HTML de la sidebar
    function getSidebarHTML() {
        var basePath = currentPath.includes('/pages/') ? '' : 'pages/';
        var homeLink = currentPath.includes('/pages/') ? '../Impulsion-Marketing.html' : 'Impulsion-Marketing.html';

        return `
        <aside class="sidebar">
            <div class="sidebar-header">
                <a href="${homeLink}" class="brand">
                    <svg class="brand-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="url(#gradient1)" stroke="white" stroke-width="1.5"/>
                        <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#ffa500"/>
                                <stop offset="100%" style="stop-color:#ff6600"/>
                            </linearGradient>
                        </defs>
                    </svg>
                    <div class="brand-text">
                        <h1>Impulsion</h1>
                        <span>Marketing</span>
                    </div>
                </a>
            </div>

            <nav class="sidebar-nav">
                <div class="nav-section">
                    <span class="nav-section-title">Principal</span>
                    <a href="${basePath}campaign.html" class="nav-link ${currentPage === 'campaign' ? 'active' : ''}">
                        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        <span>Créer une campagne</span>
                    </a>
                    <a href="${basePath}pilotage.html" class="nav-link ${currentPage === 'pilotage' ? 'active' : ''}">
                        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"/>
                            <rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        <span>Pilotage</span>
                    </a>
                    <a href="${basePath}visualization.html" class="nav-link ${currentPage === 'visualization' ? 'active' : ''}">
                        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 3v18h18"/>
                            <path d="M18 9l-5 5-4-4-4 4"/>
                        </svg>
                        <span>Campagnes</span>
                    </a>
                </div>

                <div class="nav-section">
                    <span class="nav-section-title">Espaces</span>
                    <a href="${basePath}com.html" class="nav-link ${currentPage === 'com' ? 'active' : ''}">
                        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span>Com</span>
                    </a>
                    <a href="${basePath}ebf.html" class="nav-link ${currentPage === 'ebf' ? 'active' : ''}">
                        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <span>EBF</span>
                    </a>
                    <a href="${basePath}data.html" class="nav-link ${currentPage === 'data' ? 'active' : ''}">
                        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <ellipse cx="12" cy="5" rx="9" ry="3"/>
                            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                        </svg>
                        <span>Data</span>
                    </a>
                    <a href="${basePath}manager-login.html" class="nav-link ${currentPage === 'manager' ? 'active' : ''}">
                        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                        <span>Espace Manager</span>
                    </a>
                </div>

                <div class="nav-section">
                    <span class="nav-section-title">Externe</span>
                    <a href="https://planner.cloud.microsoft/webui/plan/uXiTJltzhU6XQYaLldFGMZcAEYzY/view/board?tid=fb3baf17-c313-474c-8d5d-577a3ec97a32" class="nav-link" target="_blank" rel="noopener">
                        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <line x1="9" y1="3" x2="9" y2="21"/>
                        </svg>
                        <span>Planner</span>
                    </a>
                    <a href="https://e.ca-toulouse31.fr/images/index.php" class="nav-link" target="_blank" rel="noopener">
                        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <path d="M21 15l-5-5L5 21"/>
                        </svg>
                        <span>Galerie</span>
                    </a>
                </div>
            </nav>
        </aside>
        `;
    }

    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        var dashboardLayout = document.querySelector('.dashboard-layout');

        // Si le body n'a pas déjà la structure dashboard-layout
        if (!dashboardLayout) {
            // Wrapper tout le contenu existant du body
            var bodyContent = document.body.innerHTML;

            // Créer la nouvelle structure
            document.body.innerHTML = `
                <div class="dashboard-layout">
                    ${getSidebarHTML()}
                    <div class="main-container">
                        ${bodyContent}
                    </div>
                </div>
            `;

            // Ajouter la classe au body si nécessaire
            document.body.classList.add('has-sidebar');
        } else {
            // Si dashboard-layout existe mais pas de sidebar, l'injecter
            var existingSidebar = dashboardLayout.querySelector('.sidebar');
            if (!existingSidebar) {
                // Créer un élément temporaire pour parser le HTML
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = getSidebarHTML();
                var sidebar = tempDiv.firstElementChild;

                // Insérer la sidebar au début de dashboard-layout
                dashboardLayout.insertBefore(sidebar, dashboardLayout.firstChild);

                // Ajouter la classe au body si nécessaire
                document.body.classList.add('has-sidebar');
            }
        }
    }

})();
