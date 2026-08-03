// Configuration ESLint — outil de DÉVELOPPEMENT uniquement (`npm run lint`).
// N'a aucun impact sur le code déployé : ni bundle, ni dépendance runtime.
// Format « flat config » (ESLint 9+). Voir docs/DEVELOPER_GUIDE.md.
import html from 'eslint-plugin-html';

// Globals navigateur communs à tous les fichiers/pages de l'app (vanilla JS,
// pas de framework). Complète les globals « browser » standard d'ESLint pour
// les API spécifiques utilisées ici (File System Access, notifications, etc.).
const browserGlobals = {
  window: 'readonly', document: 'readonly', navigator: 'readonly', location: 'readonly',
  console: 'readonly', alert: 'readonly', confirm: 'readonly', prompt: 'readonly',
  localStorage: 'readonly', sessionStorage: 'readonly', indexedDB: 'readonly',
  FileReader: 'readonly', Blob: 'readonly', File: 'readonly', FormData: 'readonly', URL: 'readonly',
  URLSearchParams: 'readonly', DOMParser: 'readonly', TextDecoder: 'readonly', TextEncoder: 'readonly',
  atob: 'readonly', btoa: 'readonly', Image: 'readonly', performance: 'readonly',
  fetch: 'readonly', Notification: 'readonly', AudioContext: 'readonly',
  webkitAudioContext: 'readonly', showDirectoryPicker: 'readonly',
  setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly', clearInterval: 'readonly',
  requestAnimationFrame: 'readonly', getComputedStyle: 'readonly',
  CustomEvent: 'readonly', Event: 'readonly', MutationObserver: 'readonly',
  WeakMap: 'readonly', Promise: 'readonly',
  XLSX: 'readonly' // fourni par js/suivi-xlsx.js (chargé séparément, hors bundle)
};

// Beaucoup de fonctions top-niveau (par page) ne sont appelées que depuis des
// attributs HTML (onclick="..."), invisibles pour l'analyse JS pure — les
// signaler comme « non utilisées » serait du bruit constant, pas un vrai bug.
// `vars: 'local'` ne vérifie donc que les variables de portée imbriquée ;
// `caughtErrors: 'none'` ignore le très fréquent `.catch(function(e) {...})`
// où l'erreur est volontairement absorbée sans être lue.
const unusedVarsRule = ['warn', { args: 'none', caughtErrors: 'none', vars: 'local', varsIgnorePattern: '^_' }];

export default [
  {
    // bundle.js est un fichier GÉNÉRÉ (npm run build) — jamais édité/linté à la main.
    // « Données de production/ » et docs/ ne contiennent pas de code applicatif.
    ignores: [
      'Application/js/bundle.js',
      'Application/js/suivi-xlsx.js', // bibliothèque tierce vendorisée, non maintenue ici
      'node_modules/**',
      'docs/**',
      'Données de production/**'
    ]
  },

  // ── Modules JS navigateur (js/*-standalone.js) : IIFE window.ImpulsionMarketing.*,
  // pas d'import/export, style ES5 volontaire (compat file:// / simplicité). ──
  {
    files: ['Application/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: browserGlobals
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': unusedVarsRule,
      'no-redeclare': 'warn',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-fallthrough': 'warn',
      'no-var': 'off',      // convention volontaire du projet
      'no-console': 'off'
    }
  },

  // ── Scripts inline des pages HTML (login/dashboard/pages/*.html). ──
  // Chaque page a ses propres variables ; no-undef reste actif mais moins
  // strict (warn) car eslint-plugin-html peut lier plusieurs <script> d'une
  // même page sans toujours partager parfaitement le scope réel du navigateur.
  {
    files: ['Application/**/*.html'],
    plugins: { html },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: browserGlobals
    },
    rules: {
      'no-undef': 'warn',
      'no-unused-vars': unusedVarsRule,
      'no-redeclare': 'warn',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-var': 'off',
      'no-console': 'off'
    }
  },

  // ── Outillage de développement Node (ESM). ──
  {
    files: ['build-bundle.mjs', 'test/**/*.mjs', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { process: 'readonly', console: 'readonly' }
    },
    rules: {
      'no-unused-vars': 'warn'
    }
  }
];
