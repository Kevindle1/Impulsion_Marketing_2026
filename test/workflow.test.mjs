/**
 * Tests de la logique pure du workflow (js/workflow-standalone.js).
 *
 * Le module est un script navigateur qui s'attache à window.ImpulsionMarketing.
 * On le charge en shimmant `window`, puis on teste les fonctions pures
 * (transitions d'état, déverrouillages, complétion) — sans toucher au FS.
 *
 * Lancer avec : npm test
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// ── Chargement du module dans un shim window ──
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
globalThis.window = globalThis.window || {};
const src = await readFile(join(ROOT, 'js', 'workflow-standalone.js'), 'utf8');
// eslint-disable-next-line no-new-func
new Function(src)();
const workflow = globalThis.window.ImpulsionMarketing.workflow;

// ── Helpers ──
function makeCampaign(requiredTeams, channels) {
  return {
    po: 'Testeur',
    channels: channels || [{ deliverableName: 'Canal 0' }],
    requiredTeams: requiredTeams,
  };
}
function ch0(data) {
  return data.workflow.channelSteps[0];
}

// ─────────────────────────────────────────────────────────
test('isTeamRequired — sans requiredTeams, toutes les équipes sont requises', () => {
  assert.equal(workflow.isTeamRequired(undefined, 'Com'), true);
  assert.equal(workflow.isTeamRequired(null, 'Data'), true);
});

test('isTeamRequired — respecte la liste fournie', () => {
  assert.equal(workflow.isTeamRequired(['Com'], 'Com'), true);
  assert.equal(workflow.isTeamRequired(['Com'], 'EBF'), false);
  assert.equal(workflow.isTeamRequired(['Com', 'Data'], 'Data'), true);
});

test('initWorkflow — crée les étapes globales et canal par défaut', () => {
  const data = makeCampaign(['Com', 'EBF', 'Data']);
  workflow.initWorkflow(data);
  assert.equal(data.workflow.steps.po_saisie, 'validated');
  assert.equal(data.workflow.steps.manager_affectation, 'pending');
  assert.equal(data.workflow.steps.po_kickoff, 'locked');
  assert.ok(data.workflow.channelSteps[0], 'le canal 0 doit être initialisé');
  assert.equal(ch0(data).com_maquette, 'locked');
});

test('flux Com+EBF+Data — kick-off déverrouille maquette et ciblage, pas le BAT', () => {
  const data = makeCampaign(['Com', 'EBF', 'Data']);
  workflow.advanceStep(data, 'manager_affectation', 'validated');
  assert.equal(data.workflow.steps.po_kickoff, 'pending', 'kickoff doit passer en pending');

  workflow.advanceStep(data, 'po_kickoff', 'validated');
  assert.equal(ch0(data).com_maquette, 'pending');
  assert.equal(ch0(data).data_ciblage, 'pending');
  assert.equal(ch0(data).ebf_bat, 'locked', 'le BAT attend la validation de la maquette');
});

test('flux Com — maquette soumise déverrouille la validation PO, qui déverrouille le BAT', () => {
  const data = makeCampaign(['Com', 'EBF', 'Data']);
  workflow.advanceStep(data, 'manager_affectation', 'validated');
  workflow.advanceStep(data, 'po_kickoff', 'validated');

  workflow.advanceChannelStep(data, 0, 'com_maquette', 'submitted');
  assert.equal(ch0(data).po_validation_maquette, 'pending');

  workflow.validateChannelStep(data, 'po_validation_maquette', 0);
  assert.equal(ch0(data).ebf_bat, 'pending', 'le BAT se débloque après validation maquette');
});

test('flux Data seul — ciblage validé déverrouille directement la mise en prod', () => {
  const data = makeCampaign(['Data']);
  workflow.advanceStep(data, 'manager_affectation', 'validated');
  workflow.advanceStep(data, 'po_kickoff', 'validated');
  assert.equal(ch0(data).data_ciblage, 'pending');

  workflow.advanceChannelStep(data, 0, 'data_ciblage', 'submitted');
  assert.equal(ch0(data).po_validation_ciblage, 'pending');

  workflow.validateChannelStep(data, 'po_validation_ciblage', 0);
  assert.equal(ch0(data).data_mise_en_prod, 'pending', 'MEP directe pour Data seul (sans EBF)');
});

test('requestChannelRevision — repasse l’étape source en révision et reverrouille la validation', () => {
  const data = makeCampaign(['Com', 'EBF', 'Data']);
  workflow.advanceStep(data, 'manager_affectation', 'validated');
  workflow.advanceStep(data, 'po_kickoff', 'validated');
  workflow.advanceChannelStep(data, 0, 'com_maquette', 'submitted');

  workflow.requestChannelRevision(data, 'po_validation_maquette', 'com_maquette', 0, 'À revoir');
  assert.equal(ch0(data).com_maquette, 'revision_requested');
  assert.equal(ch0(data).po_validation_maquette, 'locked');
  assert.equal(data.workflow.channelRevisionComments[0].com_maquette, 'À revoir');
});

test('isChannelCompleted — selon les équipes requises', () => {
  // Com+EBF+Data : terminé quand data_mise_en_prod = completed
  assert.equal(
    workflow.isChannelCompleted({ data_mise_en_prod: 'completed' }, ['Com', 'EBF', 'Data']),
    true
  );
  assert.equal(
    workflow.isChannelCompleted({ data_mise_en_prod: 'pending' }, ['Com', 'EBF', 'Data']),
    false
  );
  // Com seul : terminé quand po_validation_maquette validée
  assert.equal(
    workflow.isChannelCompleted({ po_validation_maquette: 'validated' }, ['Com']),
    true
  );
});

test('isCompleted — vrai uniquement quand tous les canaux sont terminés', () => {
  const data = makeCampaign(['Data'], [{ deliverableName: 'A' }, { deliverableName: 'B' }]);
  workflow.initWorkflow(data);
  data.workflow.channelSteps[0].data_mise_en_prod = 'completed';
  assert.equal(workflow.isCompleted(data), false, 'le canal B n’est pas terminé');
  data.workflow.channelSteps[1].data_mise_en_prod = 'completed';
  assert.equal(workflow.isCompleted(data), true);
});

test('getCurrentStepLabel — libellés d’état clés', () => {
  const fresh = makeCampaign(['Com', 'EBF', 'Data']);
  workflow.initWorkflow(fresh);
  assert.equal(workflow.getCurrentStepLabel(fresh), 'Affectation');

  const done = makeCampaign(['Data']);
  workflow.initWorkflow(done);
  done.workflow.channelSteps[0].data_mise_en_prod = 'completed';
  assert.equal(workflow.getCurrentStepLabel(done), 'Terminée');
});
