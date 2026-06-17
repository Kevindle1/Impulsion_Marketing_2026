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

// ─────────────────────────────────────────────────────────
// FUSION 3-WAY (sauvegarde concurrente — dossier partagé)
// ─────────────────────────────────────────────────────────
test('threeWayMerge — ne touche pas aux champs modifiés par les autres', () => {
  const base   = { titre: 'A', statut: 'pending' };
  const mine   = { titre: 'A', statut: 'validated' };     // je change le statut
  const theirs = { titre: 'B', statut: 'pending' };        // un autre a changé le titre
  const merged = workflow.threeWayMerge(base, mine, theirs);
  assert.equal(merged.statut, 'validated', 'mon changement est conservé');
  assert.equal(merged.titre, 'B', 'le changement de l’autre est préservé');
});

test('threeWayMerge — notes kick-off : deux participants ne s’écrasent pas', () => {
  // Chacun a chargé un objet vide, puis a ajouté SA note.
  const base   = { kickoffPersonNotes: {} };
  const mine   = { kickoffPersonNotes: { Alice: 'note Alice' } };
  const theirs = { kickoffPersonNotes: { Bob: 'note Bob' } }; // Bob a sauvegardé entre-temps
  const merged = workflow.threeWayMerge(base, mine, theirs);
  assert.equal(merged.kickoffPersonNotes.Alice, 'note Alice');
  assert.equal(merged.kickoffPersonNotes.Bob, 'note Bob', 'la note de Bob survit');
});

test('threeWayMerge — la validation PO n’efface pas une note saisie après coup', () => {
  // Le PO a ouvert avec un objet vide et ne renseigne aucune note participant.
  const base   = { kickoffPersonNotes: {}, kickoffDate: '' };
  const mine   = { kickoffPersonNotes: {}, kickoffDate: '2026-06-20' }; // PO pose la date
  const theirs = { kickoffPersonNotes: { Carla: 'ma note' }, kickoffDate: '' };
  const merged = workflow.threeWayMerge(base, mine, theirs);
  assert.equal(merged.kickoffDate, '2026-06-20', 'la date posée par le PO est écrite');
  assert.equal(merged.kickoffPersonNotes.Carla, 'ma note', 'la note de Carla n’est pas écrasée');
});

test('threeWayMerge — sans baseline équivalent, ma valeur inchangée laisse celle du disque', () => {
  const base   = { x: 1 };
  const mine   = { x: 1 };       // je n’ai pas touché x
  const theirs = { x: 2 };       // un autre a changé x
  const merged = workflow.threeWayMerge(base, mine, theirs);
  assert.equal(merged.x, 2, 'champ non modifié par moi → valeur disque conservée');
});

test('threeWayMerge — suppression respectée seulement si le disque n’a pas changé la clé', () => {
  const base   = { a: 1, b: 2 };
  const mine   = { a: 1 };               // j’ai supprimé b
  const theirs = { a: 1, b: 2 };         // disque inchangé
  assert.equal('b' in workflow.threeWayMerge(base, mine, theirs), false, 'b supprimé');

  const theirs2 = { a: 1, b: 99 };       // un autre a modifié b
  assert.equal(workflow.threeWayMerge(base, mine, theirs2).b, 99, 'b conservé car modifié ailleurs');
});

// ─────────────────────────────────────────────────────────
// VALIDATION JURIDIQUE PAR CANAL (#8)
// ─────────────────────────────────────────────────────────
function makeJurCampaign(required) {
  const data = makeCampaign(['Com', 'EBF', 'Data']);
  data.juridique = { required: required };
  workflow.initWorkflow(data);
  workflow.advanceStep(data, 'manager_affectation', 'validated');
  workflow.advanceStep(data, 'po_kickoff', 'validated');
  workflow.advanceChannelStep(data, 0, 'com_maquette', 'submitted');
  workflow.advanceChannelStep(data, 0, 'po_validation_maquette', 'validated');
  return data;
}

test('juridique requise — la validation PO maquette débloque com_juridique, pas le BAT', () => {
  const data = makeJurCampaign(true);
  assert.equal(ch0(data).com_juridique, 'pending', 'la validation juridique est à faire');
  assert.equal(ch0(data).ebf_bat, 'locked', 'le BAT reste verrouillé tant que le juridique n’est pas validé');
});

test('juridique requise — valider le juridique débloque le BAT', () => {
  const data = makeJurCampaign(true);
  workflow.advanceChannelStep(data, 0, 'com_juridique', 'validated');
  assert.equal(ch0(data).ebf_bat, 'pending', 'le BAT se débloque après validation juridique');
});

test('juridique requise — refus : retour maquette + reverrouillage + motif', () => {
  const data = makeJurCampaign(true);
  workflow.refuseChannelJuridique(data, 0, 'Mention légale manquante');
  assert.equal(ch0(data).com_maquette, 'revision_requested');
  assert.equal(ch0(data).po_validation_maquette, 'locked');
  assert.equal(ch0(data).com_juridique, 'locked');
  assert.match(data.workflow.channelRevisionComments[0].com_maquette, /Mention légale manquante/);
  // On rejoue : nouveau dépôt maquette → la validation PO se redébloque
  workflow.advanceChannelStep(data, 0, 'com_maquette', 'submitted');
  assert.equal(ch0(data).po_validation_maquette, 'pending');
});

test('juridique NON requise — le BAT se débloque directement (com_juridique ignoré)', () => {
  const data = makeJurCampaign(false);
  assert.equal(ch0(data).ebf_bat, 'pending', 'sans juridique, le BAT se débloque après validation PO');
  assert.equal(ch0(data).com_juridique, 'locked', 'l’étape juridique reste verrouillée et n’est pas utilisée');
});

test('juridique requise — canal Com seul : non terminé tant que le juridique n’est pas validé', () => {
  const data = makeCampaign(['Com']);
  data.juridique = { required: true };
  workflow.initWorkflow(data);
  workflow.advanceStep(data, 'manager_affectation', 'validated');
  workflow.advanceStep(data, 'po_kickoff', 'validated');
  workflow.advanceChannelStep(data, 0, 'com_maquette', 'submitted');
  workflow.advanceChannelStep(data, 0, 'po_validation_maquette', 'validated');
  assert.equal(workflow.isChannelCompleted(ch0(data), data.requiredTeams, undefined, true), false, 'pas terminé : juridique en attente');
  workflow.advanceChannelStep(data, 0, 'com_juridique', 'validated');
  assert.equal(workflow.isChannelCompleted(ch0(data), data.requiredTeams, undefined, true), true, 'terminé après validation juridique');
});

test('juridique requise — un ebf_bat ouvert par erreur est re-verrouillé tant que le juridique n’est pas validé', () => {
  const data = makeJurCampaign(true); // maquette validée, com_juridique pending
  // Simule un état hérité : BAT ouvert avant l'ajout du juridique
  data.workflow.channelSteps[0].ebf_bat = 'pending';
  // Tout recalcul (rendu, action) doit re-verrouiller le BAT
  workflow.initWorkflow(data);
  assert.equal(ch0(data).ebf_bat, 'locked', 'le BAT est re-verrouillé tant que le juridique n’est pas validé');
  assert.equal(ch0(data).com_juridique, 'pending', 'la validation juridique reste à faire');
  // Après validation juridique, le BAT s’ouvre
  workflow.advanceChannelStep(data, 0, 'com_juridique', 'validated');
  assert.equal(ch0(data).ebf_bat, 'pending', 'le BAT s’ouvre une fois le juridique validé');
});

test('juridique requise — un BAT déjà commencé (submitted) n’est PAS re-verrouillé', () => {
  const data = makeJurCampaign(true);
  data.workflow.channelSteps[0].com_juridique = 'validated';
  data.workflow.channelSteps[0].ebf_bat = 'submitted';
  workflow.initWorkflow(data);
  assert.equal(ch0(data).ebf_bat, 'submitted', 'le travail EBF en cours est préservé');
});

// ─────────────────────────────────────────────────────────
// RECHERCHE MULTI-CHAMPS / PAR RÉFÉRENCES (#27)
// ─────────────────────────────────────────────────────────
test('buildSearchBlob agrège codes canaux + champs campagne (minuscule)', () => {
  const data = {
    id: 'Campagne Été', po: 'Alice', description: 'Promo fibre',
    market: 'Particuliers', typology: 'Acquisition',
    segments: ['Jeunes', 'Urbains'], ubs: ['Mobilité'], campagneLiee: 'REF-2025-001',
    channels: [
      { deliverableName: 'Email', content: 'MAIL', emailObject: 'Offre spéciale',
        codeCom: 'COM-123', refParacom: 'PARA-XYZ', codeProjet: 'PROJ-789', codeAction: 'ACT-456' }
    ]
  };
  const blob = workflow.buildSearchBlob(data);
  // tout est présent et en minuscule
  ['campagne été','alice','promo fibre','particuliers','acquisition','jeunes','urbains',
   'mobilité','ref-2025-001','email','offre spéciale','com-123','para-xyz','proj-789','act-456']
    .forEach(t => assert.ok(blob.includes(t), 'blob doit contenir : ' + t));
});

test('buildSearchBlob — un terme absent n’est pas trouvé', () => {
  const blob = workflow.buildSearchBlob({ id: 'X', po: 'Bob', channels: [] });
  assert.ok(!blob.includes('proj-789'));
});

// ─────────────────────────────────────────────────────────
// #14 — managerAffectationDone : un manager de service n'a plus l'action
// d'affectation dès que son équipe est affectée (ou non requise).
test('managerAffectationDone — manager Com sans affectation : pas encore fait', () => {
  const data = makeCampaign(['Com', 'Data']);
  workflow.initWorkflow(data);
  const comMgr = { name: 'Chef Com', role: 'com', isManager: true };
  assert.equal(workflow.managerAffectationDone(comMgr, data), false);
});

test('managerAffectationDone — manager Com après avoir affecté son équipe : fait', () => {
  const data = makeCampaign(['Com', 'Data']);
  workflow.initWorkflow(data);
  data.workflow.assignments.com = ['Agent Com'];
  const comMgr = { name: 'Chef Com', role: 'com', isManager: true };
  assert.equal(workflow.managerAffectationDone(comMgr, data), true);
});

test('managerAffectationDone — équipe non requise : rien à affecter, considéré fait', () => {
  const data = makeCampaign(['Com']); // Data non requis
  workflow.initWorkflow(data);
  const dataMgr = { name: 'Chef Data', role: 'data', isManager: true };
  assert.equal(workflow.managerAffectationDone(dataMgr, data), true);
});

test('managerAffectationDone — manager général (marketing) jamais "fait"', () => {
  const data = makeCampaign(['Com', 'Data']);
  workflow.initWorkflow(data);
  data.workflow.assignments.com = ['Agent Com'];
  const genMgr = { name: 'Sébastien', role: 'marketing', isManager: true };
  assert.equal(workflow.managerAffectationDone(genMgr, data), false);
});

test('managerAffectationDone — super-admin jamais "fait"', () => {
  const data = makeCampaign(['Com']);
  workflow.initWorkflow(data);
  const admin = { name: 'Admin', role: 'com', isManager: true, isSuperAdmin: true };
  assert.equal(workflow.managerAffectationDone(admin, data), false);
});

test('managerAffectationDone — non-manager : false', () => {
  const data = makeCampaign(['Com']);
  workflow.initWorkflow(data);
  const agent = { name: 'Agent Com', role: 'com', isManager: false };
  assert.equal(workflow.managerAffectationDone(agent, data), false);
});

test('getAvailableActions — manager Com déjà affecté : plus d\'action d\'affectation', () => {
  const data = makeCampaign(['Com', 'Data']);
  workflow.initWorkflow(data);
  data.workflow.steps.manager_affectation = 'pending';
  data.workflow.assignments.com = ['Agent Com'];
  const comMgr = { name: 'Chef Com', role: 'com', isManager: true };
  const actions = workflow.getAvailableActions(comMgr, data);
  assert.ok(!actions.some(a => a.step.id === 'manager_affectation'),
    'le manager Com déjà affecté ne doit plus avoir l\'action manager_affectation');
});

test('getAvailableActions — manager Data non encore affecté : action d\'affectation présente', () => {
  const data = makeCampaign(['Com', 'Data']);
  workflow.initWorkflow(data);
  data.workflow.steps.manager_affectation = 'pending';
  data.workflow.assignments.com = ['Agent Com']; // Com fait, Data pas encore
  const dataMgr = { name: 'Chef Data', role: 'data', isManager: true };
  const actions = workflow.getAvailableActions(dataMgr, data);
  assert.ok(actions.some(a => a.step.id === 'manager_affectation'),
    'le manager Data non affecté doit garder l\'action manager_affectation');
});
