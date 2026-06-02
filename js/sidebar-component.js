/**
 * Composant Sidebar réutilisable pour toutes les pages
 */
(function() {
    'use strict';

    // Créer un namespace global si nécessaire
    window.ImpulsionMarketing = window.ImpulsionMarketing || {};

    /**
     * Génère le HTML de la sidebar
     * @param {string} currentPage - Page actuelle pour la navigation active
     * @returns {string} HTML de la sidebar
     */
    function generateSidebarHTML(currentPage) {
        return `
            <aside class="sidebar">
                <div class="sidebar-header">
                    <a href="../Impulsion-Marketing.html" class="brand" style="text-decoration: none; color: inherit;">
                        <svg class="brand-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="url(#gradient1)" stroke="white" stroke-width="1.5"/>
                            <defs>
                                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#0d6efd"/>
                                    <stop offset="100%" style="stop-color:#0b5ed7"/>
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
                        <a href="../pages/campaign.html" class="nav-link ${currentPage === 'campaign' ? 'active' : ''}">
                            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                            <span>Créer une campagne</span>
                        </a>
                        <a href="../pages/pilotage.html" class="nav-link ${currentPage === 'pilotage' ? 'active' : ''}">
                            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="7" height="7"/>
                                <rect x="14" y="3" width="7" height="7"/>
                                <rect x="14" y="14" width="7" height="7"/>
                                <rect x="3" y="14" width="7" height="7"/>
                            </svg>
                            <span>Pilotage</span>
                        </a>
                        <a href="../pages/visualization.html" class="nav-link ${currentPage === 'visualization' ? 'active' : ''}">
                            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 3v18h18"/>
                                <path d="M18 9l-5 5-4-4-4 4"/>
                            </svg>
                            <span>Campagnes</span>
                        </a>
                    </div>

                    <div class="nav-section">
                        <span class="nav-section-title">Espaces</span>
                        <a href="../pages/com.html" class="nav-link ${currentPage === 'com' ? 'active' : ''}">
                            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span>Com</span>
                        </a>
                        <a href="../pages/ebf.html" class="nav-link ${currentPage === 'ebf' ? 'active' : ''}">
                            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <span>EBF</span>
                        </a>
                        <a href="../pages/data.html" class="nav-link ${currentPage === 'data' ? 'active' : ''}">
                            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                            </svg>
                            <span>Data</span>
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

    /**
     * Génère le CSS de la sidebar
     * @returns {string} CSS de la sidebar
     */
    function generateSidebarCSS() {
        return `
        /* Sidebar Styles */
        .sidebar {
            width: 280px;
            background: linear-gradient(180deg, #1a1f36 0%, #0f1419 100%);
            color: #ffffff;
            display: flex;
            flex-direction: column;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
            z-index: 1000;
        }

        .sidebar-header {
            padding: 32px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .brand-icon {
            flex-shrink: 0;
        }

        .brand-text h1 {
            font-size: 20px;
            font-weight: 700;
            color: #ffffff;
            line-height: 1.2;
        }

        .brand-text span {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .sidebar-nav {
            padding: 24px 0;
            flex: 1;
        }

        .nav-section {
            margin-bottom: 32px;
        }

        .nav-section-title {
            display: block;
            padding: 0 24px 12px 24px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: rgba(255, 255, 255, 0.4);
        }

        .nav-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 24px;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            transition: all 0.2s;
            position: relative;
            font-size: 14px;
            font-weight: 500;
        }

        .nav-link::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: #0d6efd;
            transform: scaleY(0);
            transition: transform 0.2s;
        }

        .nav-link:hover {
            background: rgba(255, 255, 255, 0.05);
            color: #ffffff;
        }

        .nav-link:hover::before {
            transform: scaleY(1);
        }

        .nav-link.active {
            background: rgba(13, 110, 253, 0.15);
            color: #ffffff;
        }

        .nav-link.active::before {
            transform: scaleY(1);
        }

        .nav-icon {
            flex-shrink: 0;
            opacity: 0.8;
        }

        /* Main Container with Sidebar */
        .dashboard-layout {
            display: flex;
            min-height: 100vh;
        }

        .main-container {
            margin-left: 280px;
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }

        /* Responsive */
        @media (max-width: 1024px) {
            .sidebar {
                width: 240px;
            }

            .main-container {
                margin-left: 240px;
            }
        }

        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
                transition: transform 0.3s;
            }

            .sidebar.open {
                transform: translateX(0);
            }

            .main-container {
                margin-left: 0;
            }
        }
        `;
    }

    /**
     * Initialise la sidebar sur la page
     * @param {string} currentPage - Page actuelle pour la navigation active
     * @param {string} containerId - ID du conteneur où insérer la sidebar (optionnel)
     */
    function initSidebar(currentPage, containerId) {
        // Injecter le CSS
        var styleId = 'sidebar-component-styles';
        if (!document.getElementById(styleId)) {
            var style = document.createElement('style');
            style.id = styleId;
            style.textContent = generateSidebarCSS();
            document.head.appendChild(style);
        }

        // Injecter le HTML
        var sidebarHTML = generateSidebarHTML(currentPage);

        if (containerId) {
            var container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = sidebarHTML + container.innerHTML;
            }
        } else {
            // Si pas de conteneur spécifié, créer le layout par défaut
            document.body.innerHTML = '<div class="dashboard-layout">' + sidebarHTML + '<div class="main-container">' + document.body.innerHTML + '</div></div>';
        }
    }

    // Exposer les fonctions
    window.ImpulsionMarketing.sidebar = {
        init: initSidebar,
        generateHTML: generateSidebarHTML,
        generateCSS: generateSidebarCSS
    };

})();
