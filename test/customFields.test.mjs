/**
 * Tests de la logique pure du moteur de champs personnalisés (js/customFields-standalone.js).
 *
 * Le module est un script navigateur qui s'attache à window.ImpulsionMarketing.
 * On le charge en shimmant `window`, puis on teste les fonctions pures (lecture des
 * définitions, conditionnalité, validation, rendu HTML) — sans DOM réel (wireFields/
 * collectValues, qui manipulent le DOM, ne sont pas testables ici).
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
const src = await readFile(join(ROOT, 'Application', 'js', 'customFields-standalone.js'), 'utf8');
new Function(src)();
const cf = globalThis.window.ImpulsionMarketing.customFields;

// Le vrai security.escapeHtml (chargé en 1er dans le bundle) s'appuie sur le DOM
// navigateur (document.createElement) — indisponible ici. On fournit un équivalent
// minimal pour vérifier que le module échappe bien via IM.security quand il est présent.
globalThis.window.ImpulsionMarketing.security = {
  escapeHtml: (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
};

function withConfig(cfg, fn) {
  const prev = globalThis.window.ImpulsionMarketing.config;
  globalThis.window.ImpulsionMarketing.config = cfg;
  try { fn(); } finally { globalThis.window.ImpulsionMarketing.config = prev; }
}

// ── getFields ──

test('getFields — renvoie [] pour un point d\'attache absent de la config', () => {
  withConfig({ CUSTOM_FIELDS: {} }, () => {
    assert.deepEqual(cf.getFields('ebf_bat'), []);
  });
});

test('getFields — trie par order croissant', () => {
  withConfig({ CUSTOM_FIELDS: { ebf_bat: [
    { id: 'b', label: 'B', type: 'text', order: 2 },
    { id: 'a', label: 'A', type: 'text', order: 1 }
  ] } }, () => {
    const ids = cf.getFields('ebf_bat').map(f => f.id);
    assert.deepEqual(ids, ['a', 'b']);
  });
});

test('getFields — filtre par canalTypes (champ restreint à certains canaux)', () => {
  withConfig({ CUSTOM_FIELDS: { data_ciblage: [
    { id: 'mdcOnly', label: 'Champ MDC', type: 'text', canalTypes: ['MDC'] },
    { id: 'tous', label: 'Champ général', type: 'text' }
  ] } }, () => {
    assert.deepEqual(cf.getFields('data_ciblage', 'MDC').map(f => f.id), ['mdcOnly', 'tous']);
    assert.deepEqual(cf.getFields('data_ciblage', 'MAIL').map(f => f.id), ['tous']);
    assert.deepEqual(cf.getFields('data_ciblage').map(f => f.id), ['mdcOnly', 'tous'], 'sans canalType précisé (ex. listing admin), tous les champs sont renvoyés — repli permissif, cohérent avec CANAL_STEPS');
  });
});

// ── fieldOptions ──

test('fieldOptions — options en dur', () => {
  assert.deepEqual(cf.fieldOptions({ options: ['Oui', 'Non'] }), ['Oui', 'Non']);
});

test('fieldOptions — configRef pointe vers une liste déjà pilotée par l\'admin', () => {
  withConfig({ CANAUX: ['MAIL', 'SMS', 'MDC'] }, () => {
    assert.deepEqual(cf.fieldOptions({ configRef: 'CANAUX' }), ['MAIL', 'SMS', 'MDC']);
  });
});

test('fieldOptions — configRef inconnu renvoie []', () => {
  withConfig({}, () => {
    assert.deepEqual(cf.fieldOptions({ configRef: 'INCONNU' }), []);
  });
});

// ── evalShowIf ──

test('evalShowIf — pas de condition = toujours visible', () => {
  assert.equal(cf.evalShowIf({}, {}), true);
});

test('evalShowIf — eq', () => {
  const f = { showIf: { field: 'kickoffNeeded', op: 'eq', value: 'Oui' } };
  assert.equal(cf.evalShowIf(f, { kickoffNeeded: 'Oui' }), true);
  assert.equal(cf.evalShowIf(f, { kickoffNeeded: 'Non' }), false);
});

test('evalShowIf — neq', () => {
  const f = { showIf: { field: 'statut', op: 'neq', value: 'annulee' } };
  assert.equal(cf.evalShowIf(f, { statut: 'active' }), true);
  assert.equal(cf.evalShowIf(f, { statut: 'annulee' }), false);
});

test('evalShowIf — in (liste de valeurs, ex. typologies déclenchant les champs site web)', () => {
  const f = { showIf: { field: 'comTypology', op: 'in', value: ['Reprise Natio', 'CA Nous'] } };
  assert.equal(cf.evalShowIf(f, { comTypology: 'Reprise Natio' }), true);
  assert.equal(cf.evalShowIf(f, { comTypology: 'Création Caisse' }), false);
});

test('evalShowIf — checked / unchecked', () => {
  const checked = { showIf: { field: 'juridiqueRequired', op: 'checked' } };
  const unchecked = { showIf: { field: 'juridiqueRequired', op: 'unchecked' } };
  assert.equal(cf.evalShowIf(checked, { juridiqueRequired: true }), true);
  assert.equal(cf.evalShowIf(checked, { juridiqueRequired: false }), false);
  assert.equal(cf.evalShowIf(unchecked, { juridiqueRequired: false }), true);
  assert.equal(cf.evalShowIf(unchecked, { juridiqueRequired: true }), false);
});

// ── isSimpleRequired / requiredGroup ──

test('isSimpleRequired / requiredGroup', () => {
  assert.equal(cf.isSimpleRequired({ required: true }), true);
  assert.equal(cf.isSimpleRequired({ required: { group: 'g1' } }), false);
  assert.equal(cf.requiredGroup({ required: { group: 'g1' } }), 'g1');
  assert.equal(cf.requiredGroup({ required: true }), null);
  assert.equal(cf.requiredGroup({}), null);
});

// ── validateValues ──

test('validateValues — champ requis manquant', () => {
  withConfig({ CUSTOM_FIELDS: { ebf_bat: [{ id: 'ref', label: 'Référence', type: 'text', required: true }] } }, () => {
    const errors = cf.validateValues('ebf_bat', {});
    assert.equal(errors.length, 1);
    assert.equal(errors[0].fieldId, 'ref');
  });
});

test('validateValues — champ requis mais masqué (showIf faux) n\'est pas bloquant', () => {
  withConfig({ CUSTOM_FIELDS: { ebf_bat: [
    { id: 'motif', label: 'Motif', type: 'text', required: true, showIf: { field: 'refus', op: 'checked' } }
  ] } }, () => {
    assert.deepEqual(cf.validateValues('ebf_bat', { refus: false }), []);
    assert.equal(cf.validateValues('ebf_bat', { refus: true }).length, 1);
  });
});

test('validateValues — groupe « au moins un » (ex. bloc ciblage Data)', () => {
  withConfig({ CUSTOM_FIELDS: { data_ciblage: [
    { id: 'codeProjet', label: 'Code Projet', type: 'text', required: { group: 'ciblage' } },
    { id: 'codeAction', label: 'Code Action', type: 'text', required: { group: 'ciblage' } }
  ] } }, () => {
    assert.equal(cf.validateValues('data_ciblage', {}).length, 1, 'aucun des deux rempli → 1 erreur groupée');
    assert.deepEqual(cf.validateValues('data_ciblage', { codeProjet: 'PRJ-1' }), [], 'un seul rempli suffit');
  });
});

test('validateValues — format URL invalide', () => {
  withConfig({ CUSTOM_FIELDS: { com_maquette: [{ id: 'figma', label: 'URL Figma', type: 'url' }] } }, () => {
    assert.equal(cf.validateValues('com_maquette', { figma: 'pas-une-url' }).length, 1);
    assert.deepEqual(cf.validateValues('com_maquette', { figma: 'https://figma.com/x' }), []);
    assert.deepEqual(cf.validateValues('com_maquette', {}), [], 'url non requise et vide : pas d\'erreur');
  });
});

test('validateValues — liste (type list) : chaque URL est vérifiée', () => {
  withConfig({ CUSTOM_FIELDS: { ebf_bat: [{ id: 'ctas', label: 'URLs CTA', type: 'list' }] } }, () => {
    assert.equal(cf.validateValues('ebf_bat', { ctas: ['https://ok.fr', 'invalide'] }).length, 1);
    assert.deepEqual(cf.validateValues('ebf_bat', { ctas: ['https://ok.fr', 'https://ok2.fr'] }), []);
  });
});

// ── renderFields (rendu HTML pur, sans DOM) ──

test('renderFields — [] si aucun champ défini pour ce point d\'attache', () => {
  withConfig({ CUSTOM_FIELDS: {} }, () => {
    assert.equal(cf.renderFields('ebf_bat', {}), '');
  });
});

test('renderFields — un champ masqué (showIf faux) est rendu avec display:none', () => {
  withConfig({ CUSTOM_FIELDS: { com_maquette: [
    { id: 'note', label: 'Note', type: 'text', showIf: { field: 'avecNote', op: 'checked' } }
  ] } }, () => {
    const html = cf.renderFields('com_maquette', { avecNote: false });
    assert.match(html, /display:none/);
  });
});

test('renderFields — un champ requis affiche un marqueur *', () => {
  withConfig({ CUSTOM_FIELDS: { com_maquette: [{ id: 'x', label: 'Champ requis', type: 'text', required: true }] } }, () => {
    const html = cf.renderFields('com_maquette', {});
    assert.match(html, /cf-required/);
  });
});

test('renderFields — échappe le HTML des valeurs (anti-XSS)', () => {
  withConfig({ CUSTOM_FIELDS: { com_maquette: [{ id: 'x', label: 'Champ', type: 'text' }] } }, () => {
    const html = cf.renderFields('com_maquette', { x: '"><script>alert(1)</script>' });
    assert.doesNotMatch(html, /<script>/);
  });
});
