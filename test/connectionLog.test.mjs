/**
 * Tests du journal des connexions (js/connectionLog-standalone.js).
 *
 * Le module est un script navigateur qui s'attache à window.ImpulsionMarketing et
 * s'appuie sur IM.directoryStorage (File System Access API). On le charge en
 * shimmant `window` + un faux directoryStorage/FileSystemDirectoryHandle AVEC
 * ÉTAT PERSISTANT (contrairement au faux dossier des tests e2e, ici on doit
 * pouvoir écrire puis relire le même fichier entre deux appels de record()).
 *
 * Lancer avec : npm test
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
globalThis.window = globalThis.window || {};
const src = await readFile(join(ROOT, 'Application', 'js', 'connectionLog-standalone.js'), 'utf8');

// Faux FileSystemDirectoryHandle/FileHandle en mémoire, avec état persistant
// entre les appels (contrairement au faux dossier de e2e/custom-fields.spec.js,
// suffisant pour Campagnes/ mais qui recrée un dossier vide à chaque
// getDirectoryHandle() — ici on doit relire ce qu'on vient d'écrire).
function makeFakeRoot() {
  var files = {}; // nom de fichier -> contenu texte
  function makeFakeFile(name) {
    return {
      getFile: function () { return Promise.resolve({ text: function () { return Promise.resolve(files[name] || ''); } }); },
      createWritable: function () {
        return Promise.resolve({
          write: function (data) { files[name] = data; return Promise.resolve(); },
          close: function () { return Promise.resolve(); }
        });
      }
    };
  }
  var donneesDir = {
    getFileHandle: function (name, opts) {
      if (files[name] === undefined && !(opts && opts.create)) return Promise.reject(new Error('not found: ' + name));
      if (files[name] === undefined) files[name] = '';
      return Promise.resolve(makeFakeFile(name));
    }
  };
  return {
    files: files,
    handle: {
      getDirectoryHandle: function (name) { return name === 'Données' ? Promise.resolve(donneesDir) : Promise.reject(new Error('unexpected dir: ' + name)); }
    }
  };
}

function withFakeDirectoryStorage(status, fn) {
  var prevIM = globalThis.window.ImpulsionMarketing;
  var fakeRoot = makeFakeRoot();
  globalThis.window.ImpulsionMarketing = {
    directoryStorage: {
      getRootHandleWithCheck: function () {
        return Promise.resolve(status === 'success' ? { status: 'success', handle: fakeRoot.handle } : { status: 'no_handle' });
      }
    }
  };
  new Function(src)();
  return Promise.resolve(fn(globalThis.window.ImpulsionMarketing.connectionLog, fakeRoot))
    .finally(function () { globalThis.window.ImpulsionMarketing = prevIM; });
}

test('record — ajoute une entrée (date, name, role, roleLabel) dans Données/connexions.json', async () => {
  await withFakeDirectoryStorage('success', async (log, fakeRoot) => {
    await log.record({ name: 'Alice Dupont', role: 'marketing', roleLabel: 'Marketing' });
    const saved = JSON.parse(fakeRoot.files['connexions.json']);
    assert.equal(saved.length, 1);
    assert.equal(saved[0].name, 'Alice Dupont');
    assert.equal(saved[0].role, 'marketing');
    assert.equal(saved[0].roleLabel, 'Marketing');
    assert.match(saved[0].date, /^\d{4}-\d{2}-\d{2}T/);
  });
});

test('record — s\'ajoute aux entrées déjà présentes (append), ne les écrase pas', async () => {
  await withFakeDirectoryStorage('success', async (log, fakeRoot) => {
    fakeRoot.files['connexions.json'] = JSON.stringify([{ date: '2026-01-01T00:00:00.000Z', name: 'Ancien', role: 'com', roleLabel: 'Com' }]);
    await log.record({ name: 'Bob Martin', role: 'ebf', roleLabel: 'EBF' });
    const saved = JSON.parse(fakeRoot.files['connexions.json']);
    assert.equal(saved.length, 2);
    assert.equal(saved[0].name, 'Ancien');
    assert.equal(saved[1].name, 'Bob Martin');
  });
});

test('record — fichier absent ou JSON corrompu : repart d\'une liste vide plutôt que d\'échouer', async () => {
  await withFakeDirectoryStorage('success', async (log, fakeRoot) => {
    fakeRoot.files['connexions.json'] = 'pas du json valide {{{';
    await log.record({ name: 'Alice', role: 'data', roleLabel: 'Data' });
    const saved = JSON.parse(fakeRoot.files['connexions.json']);
    assert.equal(saved.length, 1);
    assert.equal(saved[0].name, 'Alice');
  });
});

test('record — sans utilisateur (name manquant) : ne fait rien, ne rejette pas', async () => {
  await withFakeDirectoryStorage('success', async (log, fakeRoot) => {
    await log.record(null);
    await log.record({});
    assert.equal(fakeRoot.files['connexions.json'], undefined);
  });
});

test('record — dossier de travail non chargé : rejette (l\'appelant doit ignorer l\'erreur, cf. login.html)', async () => {
  await withFakeDirectoryStorage('no_handle', async (log) => {
    await assert.rejects(() => log.record({ name: 'Alice', role: 'data', roleLabel: 'Data' }));
  });
});

test('getAll — trie du plus récent au plus ancien', async () => {
  await withFakeDirectoryStorage('success', async (log, fakeRoot) => {
    fakeRoot.files['connexions.json'] = JSON.stringify([
      { date: '2026-01-01T08:00:00.000Z', name: 'Premier' },
      { date: '2026-03-15T08:00:00.000Z', name: 'Dernier' },
      { date: '2026-02-10T08:00:00.000Z', name: 'Milieu' }
    ]);
    const all = await log.getAll();
    assert.deepEqual(all.map(e => e.name), ['Dernier', 'Milieu', 'Premier']);
  });
});
