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

test('getFields — canalType fourni mais vide (\'\') : un champ restreint reste exclu (formulaire de création, aucun type encore choisi)', () => {
  // Régression : contrairement à canalType OMIS (undefined, contexte admin —
  // permissif), une chaîne vide est un contexte utilisateur réel où rien n'est
  // encore sélectionné. Un champ ne devrait pas apparaître puis disparaître au
  // premier choix de canal dans campaign.html.
  withConfig({ CUSTOM_FIELDS: { 'creation.step3.canal': [
    { id: 'mdcOnly', label: 'Champ MDC', type: 'text', canalTypes: ['MDC'] },
    { id: 'tous', label: 'Champ général', type: 'text' }
  ] } }, () => {
    assert.deepEqual(cf.getFields('creation.step3.canal', '').map(f => f.id), ['tous']);
    assert.deepEqual(cf.getFields('creation.step3.canal', 'MDC').map(f => f.id), ['mdcOnly', 'tous']);
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

test('renderFields — idPrefix explicitement vide (\'\') : id DOM = field.id tel quel (migration d\'un champ existant, référencé par ailleurs)', () => {
  withConfig({ CUSTOM_FIELDS: { 'creation.step1': [{ id: 'launchDate', label: 'Date Envoi client', type: 'date' }] } }, () => {
    const html = cf.renderFields('creation.step1', {}, { idPrefix: '' });
    assert.match(html, /id="launchDate"/);
    assert.doesNotMatch(html, /id="cf-/);
  });
});

test('renderFields — idPrefix omis : préfixe auto-généré (comportement par défaut, nouveaux champs perso)', () => {
  withConfig({ CUSTOM_FIELDS: { com_maquette: [{ id: 'x', label: 'X', type: 'text' }] } }, () => {
    const html = cf.renderFields('com_maquette', {});
    assert.match(html, /id="cf-com-maquette-x"/);
  });
});

test('renderFields — idSuffix : id DOM = field.id + suffixe, sans séparateur (migration d\'un champ répété par canal)', () => {
  withConfig({ CUSTOM_FIELDS: { 'creation.step3.canal': [{ id: 'channelContent', label: 'Type de livrable', type: 'select', options: ['MAIL'] }] } }, () => {
    const html = cf.renderFields('creation.step3.canal', {}, { idSuffix: '2' });
    assert.match(html, /id="channelContent2"/);
    assert.doesNotMatch(html, /id="channelContent-2"/);
  });
});

test('getFields — creation.step3.canal.base : repli DEFAULT_FIELDS (6 champs socle) sans config sauvegardée, jamais filtré par canalType', () => {
  withConfig({}, () => {
    var ids = cf.getFields('creation.step3.canal.base').map(f => f.id);
    assert.deepEqual(ids, ['channelContent', 'deliverableLabel', 'comType', 'targetingCriteria', 'comTypology', 'urlLccx']);
    // Pas de canalTypes sur ces champs socle : présents même avec un canalType précis.
    assert.deepEqual(cf.getFields('creation.step3.canal.base', 'MDC').map(f => f.id), ids);
  });
});

test('renderFields — creation.step3.canal.base avec idSuffix : tous les id/name DOM matchent la convention existante (pas de préfixe)', () => {
  withConfig({ COM_TYPOLOGIES: ['Création Caisse', 'Reprise Natio'] }, () => {
    const html = cf.renderFields('creation.step3.canal.base', {}, { idSuffix: 3 });
    assert.match(html, /id="channelContent3"/);
    assert.match(html, /id="deliverableLabel3"/);
    assert.match(html, /id="comType3"/);
    assert.match(html, /id="targetingCriteria3"/);
    assert.match(html, /name="comTypology3"/);
    assert.match(html, /id="urlLccx3"/);
  });
});

test('getFields — data_mise_en_prod / ebf_mise_en_prod : repli DEFAULT_FIELDS sans config sauvegardée (étapes de production, details.html)', () => {
  withConfig({}, () => {
    assert.deepEqual(cf.getFields('data_mise_en_prod').map(f => f.id), ['data-mepdate-', 'data-mepfirstsend-', 'data-mepcomment-']);
    assert.deepEqual(cf.getFields('ebf_mise_en_prod').map(f => f.id), ['ebf-mepdate-', 'ebf-mepcomment-']);
  });
});

test('renderFields — data_mise_en_prod avec idSuffix : id DOM = id complet déjà référencé par collectDataMepDepot (document.getElementById direct)', () => {
  withConfig({}, () => {
    const html = cf.renderFields('data_mise_en_prod', {}, { idSuffix: 2 });
    assert.match(html, /id="data-mepdate-2"/);
    assert.match(html, /id="data-mepfirstsend-2"/);
    assert.match(html, /id="data-mepcomment-2"/);
  });
});

test('renderFields — l\'attribut data-cf-showif (JSON, plein de guillemets) reste bien formé', () => {
  // Régression : IM.security.escapeHtml échappe <, > et & mais PAS les guillemets
  // doubles (safe pour du texte, pas pour une valeur d'attribut) — un
  // JSON.stringify(showIf) brut y romprait l'attribut HTML et ferait fuir le
  // reste du JSON comme attributs bidon sur la balise.
  withConfig({ CUSTOM_FIELDS: { com_maquette: [
    { id: 'note', label: 'Note', type: 'text', showIf: { field: 'avecNote', op: 'eq', value: 'Oui "spécial"' } }
  ] } }, () => {
    const html = cf.renderFields('com_maquette', {});
    const m = html.match(/data-cf-showif="([^"]*)"/);
    assert.ok(m, 'attribut data-cf-showif bien délimité par des guillemets (pas rompu en plein milieu)');
    const parsed = JSON.parse(m[1].replace(/&quot;/g, '"'));
    assert.deepEqual(parsed, { field: 'avecNote', op: 'eq', value: 'Oui "spécial"' });
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
