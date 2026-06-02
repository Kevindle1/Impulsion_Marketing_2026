/**
 * Système de Gestion des Thèmes
 * Interface Impulsion Marketing
 *
 * Ce module gère les 13 thèmes visuels de l'application.
 * Chaque thème définit des variables CSS qui sont appliquées dynamiquement.
 */

// Définition des 13 thèmes avec leurs variables CSS
export const themes = {
  default: {
    '--ink': '#006A4E',
    '--muted': '#009597',
    '--line': '#e0f2f1',
    '--primary': '#009597',
    '--primary-hover': '#007a7a',
    '--bg': '#ffffff',
    '--bg-card': '#ffffff',
    '--bg-header': '#ffffff',
    '--accent': '#f0f9f9',
    '--gradient': 'linear-gradient(135deg, #006A4E 0%, #009597 100%)',
    '--gold': '#d4af37',
    '--bg-image': 'none'
  },

  christmas: {
    '--ink': '#004d00',
    '--muted': '#006600',
    '--line': '#ccffcc',
    '--primary': '#008000',
    '--primary-hover': '#004d00',
    '--bg': '#fff8f0',
    '--bg-card': '#ffffff',
    '--bg-header': '#e6f2e6',
    '--accent': '#ccffcc',
    '--gradient': 'linear-gradient(135deg, #008000 0%, #00cc00 100%)',
    '--gold': '#d4af37',
    '--bg-image': 'url(https://cdn.photoroom.com/v2/image-cache?path=gs://background-7ef44.appspot.com/backgrounds_v3/christmas/35_-_christmas.jpg)'
  },

  halloween: {
    '--ink': '#4b2e00',
    '--muted': '#7a4b00',
    '--line': '#f0e6cc',
    '--primary': '#ff6600',
    '--primary-hover': '#cc5200',
    '--bg': '#fff8f0',
    '--bg-card': '#fff3e6',
    '--bg-header': '#ffe6cc',
    '--accent': '#ffcc99',
    '--gradient': 'linear-gradient(135deg, #ff6600 0%, #ff9933 100%)',
    '--gold': '#d4af37',
    '--bg-image': 'url(https://i.etsystatic.com/16491596/r/il/475efe/5284946173/il_fullxfull.5284946173_4tjg.jpg)'
  },

  summer: {
    '--ink': '#1e3a8a',
    '--muted': '#3b82f6',
    '--line': '#dbeafe',
    '--primary': '#3b82f6',
    '--primary-hover': '#2563eb',
    '--bg': '#f0f9ff',
    '--bg-card': '#ffffff',
    '--bg-header': '#e0f2fe',
    '--accent': '#dbeafe',
    '--gradient': 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    '--gold': '#fbbf24',
    '--bg-image': 'url(http://e.ca-toulouse31.fr/images/image2025/été/palmier.jpeg)'
  },

  winter: {
    '--ink': '#1e293b',
    '--muted': '#475569',
    '--line': '#e2e8f0',
    '--primary': '#64748b',
    '--primary-hover': '#475569',
    '--bg': '#f8fafc',
    '--bg-card': '#ffffff',
    '--bg-header': '#f1f5f9',
    '--accent': '#e2e8f0',
    '--gradient': 'linear-gradient(135deg, #1e293b 0%, #64748b 100%)',
    '--gold': '#f1f5f9',
    '--bg-image': 'url(http://e.ca-toulouse31.fr/images/image2025/hiver/Neige_arbre.jpeg)'
  },

  dark: {
    '--ink': '#f1f5f9',
    '--muted': '#94a3b8',
    '--line': '#475569',
    '--primary': '#60a5fa',
    '--primary-hover': '#3b82f6',
    '--bg': '#0f172a',
    '--bg-card': '#1e293b',
    '--bg-header': '#1e293b',
    '--accent': '#334155',
    '--gradient': 'linear-gradient(135deg, #0f172a 0%, #60a5fa 100%)',
    '--gold': '#fbbf24',
    '--bg-image': 'none'
  },

  retro: {
    '--ink': '#7c3aed',
    '--muted': '#a855f7',
    '--line': '#e9d5ff',
    '--primary': '#a855f7',
    '--primary-hover': '#9333ea',
    '--bg': '#faf5ff',
    '--bg-card': '#ffffff',
    '--bg-header': '#f3e8ff',
    '--accent': '#e9d5ff',
    '--gradient': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    '--gold': '#f59e0b',
    '--bg-image': 'none'
  },

  minimalist: {
    '--ink': '#374151',
    '--muted': '#6b7280',
    '--line': '#d1d5db',
    '--primary': '#6b7280',
    '--primary-hover': '#4b5563',
    '--bg': '#f9fafb',
    '--bg-card': '#ffffff',
    '--bg-header': '#f3f4f6',
    '--accent': '#d1d5db',
    '--gradient': 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
    '--gold': '#9ca3af',
    '--bg-image': 'none'
  },

  ocean: {
    '--ink': '#0c4a6e',
    '--muted': '#0369a1',
    '--line': '#bae6fd',
    '--primary': '#0369a1',
    '--primary-hover': '#0284c7',
    '--bg': '#f0f9ff',
    '--bg-card': '#ffffff',
    '--bg-header': '#e0f2fe',
    '--accent': '#bae6fd',
    '--gradient': 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
    '--gold': '#0ea5e9',
    '--bg-image': 'url(http://e.ca-toulouse31.fr/images/image2025/autres/ocean.jpeg)'
  },

  forest: {
    '--ink': '#14532d',
    '--muted': '#166534',
    '--line': '#bbf7d0',
    '--primary': '#166534',
    '--primary-hover': '#15803d',
    '--bg': '#f0fdf4',
    '--bg-card': '#ffffff',
    '--bg-header': '#dcfce7',
    '--accent': '#bbf7d0',
    '--gradient': 'linear-gradient(135deg, #14532d 0%, #166534 100%)',
    '--gold': '#22c55e',
    '--bg-image': 'url(http://e.ca-toulouse31.fr/images/image2025/autres/foret.jpeg)'
  },

  sunset: {
    '--ink': '#7c2d12',
    '--muted': '#dc2626',
    '--line': '#fecaca',
    '--primary': '#dc2626',
    '--primary-hover': '#b91c1c',
    '--bg': '#fef2f2',
    '--bg-card': '#ffffff',
    '--bg-header': '#fee2e2',
    '--accent': '#fecaca',
    '--gradient': 'linear-gradient(135deg, #7c2d12 0%, #dc2626 100%)',
    '--gold': '#f97316',
    '--bg-image': 'url(http://e.ca-toulouse31.fr/images/image2025/autres/sunset.jpeg)'
  },

  neon: {
    '--ink': '#ec4899',
    '--muted': '#f97316',
    '--line': '#fce7f3',
    '--primary': '#ec4899',
    '--primary-hover': '#db2777',
    '--bg': '#fdf2f8',
    '--bg-card': '#ffffff',
    '--bg-header': '#fce7f3',
    '--accent': '#fce7f3',
    '--gradient': 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
    '--gold': '#eab308',
    '--bg-image': 'url(http://e.ca-toulouse31.fr/images/image2025/autres/neon.jpeg)'
  },

  vintage: {
    '--ink': '#92400e',
    '--muted': '#d97706',
    '--line': '#fed7aa',
    '--primary': '#d97706',
    '--primary-hover': '#b45309',
    '--bg': '#fffbeb',
    '--bg-card': '#ffffff',
    '--bg-header': '#fef3c7',
    '--accent': '#fed7aa',
    '--gradient': 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
    '--gold': '#f59e0b',
    '--bg-image': 'url(http://e.ca-toulouse31.fr/images/image2025/autres/AdobeStock_381973776.jpeg)'
  }
};

/**
 * Applique un thème en mettant à jour les variables CSS du document
 * @param {string} themeName - Nom du thème à appliquer
 */
export function applyTheme(themeName) {
  // Ajouter classe de transition
  document.body.classList.add('theme-switching');

  // Appliquer le thème après un court délai pour l'effet de transition
  setTimeout(() => {
    const theme = themes[themeName] || themes.default;

    // Appliquer toutes les variables CSS
    Object.entries(theme).forEach(([varName, value]) => {
      document.documentElement.style.setProperty(varName, value);
    });

    // Sauvegarder le choix dans localStorage
    localStorage.setItem('selectedTheme', themeName);

    // Retirer classe de transition
    document.body.classList.remove('theme-switching');
  }, 300);
}

/**
 * Récupère le thème actuellement appliqué
 * @returns {string} Nom du thème actuel
 */
export function getCurrentTheme() {
  return localStorage.getItem('selectedTheme') || 'default';
}

/**
 * Initialise le sélecteur de thème sur la page
 * Charge le thème sauvegardé et configure l'événement de changement
 */
export function initThemeSelector() {
  const themeSelect = document.getElementById('theme-select');

  if (!themeSelect) {
    console.warn('Theme selector not found on page');
    return;
  }

  // Charger et appliquer le thème sauvegardé
  const savedTheme = getCurrentTheme();
  themeSelect.value = savedTheme;
  applyTheme(savedTheme);

  // Écouter les changements de thème
  themeSelect.addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });
}

/**
 * Précharge les images de fond des thèmes
 * Améliore l'expérience utilisateur lors du changement de thème
 */
export function preloadThemeImages() {
  Object.values(themes).forEach(theme => {
    const bgImage = theme['--bg-image'];

    if (bgImage && bgImage !== 'none') {
      // Extraire l'URL de la chaîne CSS url(...)
      const match = bgImage.match(/url\((.*?)\)/);

      if (match && match[1]) {
        const img = new Image();
        img.src = match[1];
      }
    }
  });
}

/**
 * Obtient la liste de tous les noms de thèmes disponibles
 * @returns {string[]} Array des noms de thèmes
 */
export function getAvailableThemes() {
  return Object.keys(themes);
}

/**
 * Obtient un thème par son nom
 * @param {string} themeName - Nom du thème
 * @returns {Object|null} Objet thème ou null si non trouvé
 */
export function getTheme(themeName) {
  return themes[themeName] || null;
}
