/**
 * build-bundle.mjs — Génération de js/bundle.js
 *
 * Concatène, dans l'ordre, les 10 modules standalone en un seul fichier chargé
 * par les pages. Remplace l'ancienne concaténation manuelle (cat / rebuild-bundle.bat)
 * pour éviter toute dérive entre les sources et le bundle.
 *
 * Usage : `npm run build` (ou `node build-bundle.mjs`). Aucune dépendance externe.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const JS_DIR = join(ROOT, 'js');
const OUTPUT = join(JS_DIR, 'bundle.js');

// Ordre de concaténation — NE PAS modifier sans raison (dépendances entre modules).
const MODULES = [
  'config-standalone.js',
  'security-standalone.js',
  'errors-standalone.js',
  'performance-standalone.js',
  'directoryStorage-standalone.js',
  'users-standalone.js',
  'workflow-standalone.js',
  'help-standalone.js',
];

const HEADER =
  '/**\n' +
  ' * bundle.js — FICHIER GÉNÉRÉ. NE PAS ÉDITER À LA MAIN.\n' +
  ' * Régénérer avec : npm run build (concatène les js/*-standalone.js).\n' +
  ' */\n';

async function build() {
  const parts = [];
  for (const name of MODULES) {
    parts.push(await readFile(join(JS_DIR, name), 'utf8'));
  }
  // Concaténation brute (identique à l'ancien `cat`), précédée d'un en-tête.
  await writeFile(OUTPUT, HEADER + parts.join(''), 'utf8');
  console.error(`bundle.js généré (${MODULES.length} modules).`);
}

build().catch((err) => {
  console.error('Échec de la génération du bundle :', err);
  process.exit(1);
});
