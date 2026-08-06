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
const src = await readFile(join(ROOT, 'Application', 'js', 'workflow-standalone.js'), 'utf8');
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

test('requestChannelRevision — M17 : le webmaster EBF renvoie la maquette à la Com depuis le dépôt BAT', () => {
  // Même mécanisme que la demande de modification PO→BAT, appliqué en sens
  // inverse (EBF→Com) au moment du dépôt BAT.
  const data = makeCampaign(['Com', 'EBF']);
  workflow.advanceStep(data, 'manager_affectation', 'validated');
  workflow.advanceStep(data, 'po_kickoff', 'validated');
  workflow.advanceChannelStep(data, 0, 'com_maquette', 'validated');
  workflow.advanceChannelStep(data, 0, 'po_validation_maquette', 'validated');
  workflow.initWorkflow(data); // débloque ebf_bat (BAT éditable, comme au moment du dépôt)
  assert.equal(ch0(data).ebf_bat, 'pending', 'le BAT doit être éditable au moment de la demande');

  workflow.requestChannelRevision(data, 'po_validation_maquette', 'com_maquette', 0, 'Logo manquant', 'Webmaster EBF', '26/07/26 11:00');
  assert.equal(ch0(data).com_maquette, 'revision_requested');
  assert.equal(ch0(data).po_validation_maquette, 'locked');
  const log = workflow.getChannelRevisionLog(data, 0);
  assert.equal(log[log.length - 1].author, 'Webmaster EBF');
  assert.equal(log[log.length - 1].stepId, 'com_maquette');
});

test('getChannelRevisionLog — historique cumulé (append-only) + auteur/date (M16)', () => {
  const data = makeCampaign(['Com', 'EBF', 'Data']);
  workflow.advanceStep(data, 'manager_affectation', 'validated');
  workflow.advanceStep(data, 'po_kickoff', 'validated');
  workflow.advanceChannelStep(data, 0, 'com_maquette', 'submitted');

  workflow.requestChannelRevision(data, 'po_validation_maquette', 'com_maquette', 0, 'Manque le logo', 'Sébastien (PO)', '24/07/26 10:00');
  // La Com redépose, puis un second aller-retour a lieu.
  workflow.advanceChannelStep(data, 0, 'com_maquette', 'submitted');
  workflow.requestChannelRevision(data, 'po_validation_maquette', 'com_maquette', 0, 'Couleur à revoir', 'Sébastien (PO)', '24/07/26 14:30');

  const log = workflow.getChannelRevisionLog(data, 0);
  assert.equal(log.length, 2, 'les deux demandes doivent être cumulées, pas écrasées');
  assert.deepEqual(log.map(e => e.comment), ['Manque le logo', 'Couleur à revoir']);
  assert.equal(log[0].author, 'Sébastien (PO)');
  assert.equal(log[0].date, '24/07/26 10:00');
  assert.equal(log[0].stepId, 'com_maquette');
  // Canal sans historique → tableau vide, jamais undefined.
  assert.deepEqual(workflow.getChannelRevisionLog(data, 1), []);
});

test('getChannelRevisionLog — reopenChannelStep et refuseChannelJuridique alimentent aussi le journal', () => {
  const data = makeCampaign(['Com']);
  workflow.advanceStep(data, 'manager_affectation', 'validated');
  workflow.advanceStep(data, 'po_kickoff', 'validated');
  workflow.advanceChannelStep(data, 0, 'com_maquette', 'validated');
  workflow.reopenChannelStep(data, 0, 'com_maquette', 'Erreur de date', 'Marie (Com manager)', '25/07/26 09:00');
  workflow.refuseChannelJuridique(data, 0, 'Mention légale manquante', 'Paul (Juridique)', '25/07/26 09:05');

  const log = workflow.getChannelRevisionLog(data, 0);
  assert.equal(log.length, 2);
  assert.equal(log[0].author, 'Marie (Com manager)');
  assert.equal(log[1].author, 'Paul (Juridique)');
  assert.ok(log[1].comment.indexOf('Mention légale manquante') !== -1);
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

test('getCurrentStepLabel — dépôt « submitted » validé par le PO n’affiche plus « En validation »', () => {
  // Un canal Com+EBF : le BAT est déposé (submitted) mais le PO l’a déjà validé.
  // L’étape de dépôt reste "submitted" (fusion dépôt→validation) : le libellé
  // ne doit PAS rester bloqué sur « En validation : Réalisation BAT ».
  const data = makeCampaign(['Com', 'EBF']);
  workflow.initWorkflow(data);
  const cs = data.workflow.channelSteps[0];
  cs.com_maquette = 'validated';
  cs.po_validation_maquette = 'validated';
  cs.com_juridique = 'validated';
  cs.ebf_bat = 'submitted';
  cs.po_validation_bat = 'validated';
  const label = workflow.getCurrentStepLabel(data);
  assert.ok(!/en validation\s*:\s*réalisation bat/i.test(label),
    'ne doit pas rester « En validation : Réalisation BAT » après validation PO');
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

test('buildSearchBlob — inclut les personnes affectées (recherche par nom)', () => {
  const data = {
    id: 'Camp', po: 'Alice', channels: [],
    workflow: { assignments: { manager: 'Manuela', com: ['Camille Com'], ebf: 'Éric EBF', data: ['Dora Data'] } }
  };
  const blob = workflow.buildSearchBlob(data);
  ['alice', 'manuela', 'camille com', 'éric ebf', 'dora data']
    .forEach(t => assert.ok(blob.includes(t), 'blob doit contenir la personne : ' + t));
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

test('getAvailableActions — co-PO : mêmes actions PO que le PO principal (M12)', () => {
  const data = makeCampaign(['EBF']);
  data.coPo = ['Suppléant'];
  workflow.initWorkflow(data);
  data.workflow.steps.manager_affectation = 'validated';
  workflow.initWorkflow(data); // recalcul : kick-off passe à pending
  const co = { name: 'Suppléant', role: 'marketing' };
  assert.ok(workflow.getAvailableActions(co, data).some(a => a.step.id === 'po_kickoff'),
    'le co-PO doit avoir l\'action kick-off');
  const autre = { name: 'Quelqu\'un d\'autre', role: 'marketing' };
  assert.ok(!workflow.getAvailableActions(autre, data).some(a => a.step.id === 'po_kickoff'),
    'un non-PO ne doit pas avoir l\'action kick-off');
});

// ─────────────────────────────────────────────────────────
// Affectation automatique (L2 #21)
test('applyAutoAssignments — case cochée → équipe campagne (dispense le manager)', () => {
  const data = makeCampaign(['Com'], [{ deliverableName: 'Mail', content: 'MAIL', comType: 'Commerciales', volumeCible: 80000 }]);
  const rules = [{
    name: 'Marc gros volume', role: 'com', people: ['Marc Favre'],
    replaceManagerAffectation: true,
    conditions: [{ field: 'comType', op: 'equals', value: 'Commerciales' }, { field: 'volumeCible', op: 'gt', value: 50000 }]
  }];
  workflow.applyAutoAssignments(data, rules);
  assert.deepEqual(workflow.channelAssignees(data, 0, 'com'), ['Marc Favre']);
  assert.ok((data.workflow.assignments.com || []).indexOf('Marc Favre') !== -1, 'affecté à l\'équipe campagne');
});

test('applyAutoAssignments — volume sous le seuil → règle non appliquée', () => {
  const data = makeCampaign(['Com'], [{ deliverableName: 'Mail', comType: 'Commerciales', volumeCible: 20000 }]);
  const rules = [{ role: 'com', people: ['Marc'], replaceManagerAffectation: true,
    conditions: [{ field: 'volumeCible', op: 'gt', value: 50000 }] }];
  workflow.applyAutoAssignments(data, rules);
  assert.equal((data.workflow.assignments.com || []).length, 0);
});

test('applyAutoAssignments — case décochée → renfort sur le canal concerné uniquement', () => {
  const data = makeCampaign(['EBF'], [
    { deliverableName: 'A', content: 'MAIL', comType: 'Commerciales' },
    { deliverableName: 'B', content: 'SMS', comType: 'Gestion' }
  ]);
  const rules = [{ role: 'ebf', people: ['Kevin'], replaceManagerAffectation: false,
    conditions: [{ field: 'comType', op: 'equals', value: 'Commerciales' }] }];
  workflow.applyAutoAssignments(data, rules);
  assert.deepEqual(workflow.channelAssignees(data, 0, 'ebf'), ['Kevin'], 'canal 0 (commercial) reçoit le renfort');
  assert.deepEqual(workflow.channelAssignees(data, 1, 'ebf'), [], 'canal 1 (gestion) non concerné');
  assert.equal((data.workflow.assignments.ebf || []).length, 0, 'équipe campagne intacte');
});

test('applyAutoAssignments — additif : n\'écrase pas une affectation existante', () => {
  const data = makeCampaign(['Com'], [{ deliverableName: 'M', comType: 'Commerciales' }]);
  workflow.initWorkflow(data);
  data.workflow.assignments.com = ['Alice'];
  const rules = [{ role: 'com', people: ['Marc'], replaceManagerAffectation: true,
    conditions: [{ field: 'comType', op: 'equals', value: 'Commerciales' }] }];
  workflow.applyAutoAssignments(data, rules);
  assert.deepEqual(data.workflow.assignments.com.sort(), ['Alice', 'Marc'].sort());
});

test('channelAssignees — renfort par canal additif, sans propagation (L2 #15)', () => {
  const data = makeCampaign(['EBF'], [{ deliverableName: 'Mail' }, { deliverableName: 'SMS' }]);
  workflow.initWorkflow(data);
  data.workflow.assignments.ebf = ['Base EBF'];
  data.workflow.channelAssignments = { 0: { ebf: ['Renfort Canal0'] } };
  // Canal 0 : base + renfort ; canal 1 : base seule (pas de propagation)
  assert.deepEqual(workflow.channelAssignees(data, 0, 'ebf').sort(), ['Base EBF', 'Renfort Canal0'].sort());
  assert.deepEqual(workflow.channelAssignees(data, 1, 'ebf'), ['Base EBF']);
});

test('getAvailableActions — renfort canal : action visible sur son canal seulement', () => {
  const data = makeCampaign(['EBF'], [{ deliverableName: 'Mail' }, { deliverableName: 'SMS' }]);
  workflow.initWorkflow(data);
  data.workflow.steps.manager_affectation = 'validated';
  data.workflow.steps.po_kickoff = 'validated';
  data.workflow.assignments.ebf = ['Base EBF'];
  data.workflow.channelAssignments = { 0: { ebf: ['Renfort'] } };
  workflow.initWorkflow(data);
  data.workflow.channelSteps[0].ebf_bat = 'pending';
  data.workflow.channelSteps[1].ebf_bat = 'pending';
  const renfort = { name: 'Renfort', role: 'ebf' };
  assert.ok(workflow.getAvailableActions(renfort, data).some(a => a.step.id === 'ebf_bat'),
    'le renfort du canal 0 doit avoir l\'action ebf_bat');
});

test('getAvailableActions — canaux indépendants : un canal terminé n\'efface pas l\'action de l\'autre', () => {
  const data = makeCampaign(['EBF'], [{ deliverableName: 'Mail' }, { deliverableName: 'SMS' }]);
  workflow.initWorkflow(data);
  data.workflow.steps.manager_affectation = 'validated';
  data.workflow.steps.po_kickoff = 'validated';
  data.workflow.assignments.ebf = ['Agent EBF'];
  workflow.initWorkflow(data); // recalcule les déverrouillages par canal
  // Canal 0 : BAT déposé puis validé par le PO → terminé.
  data.workflow.channelSteps[0].ebf_bat = 'submitted';
  data.workflow.channelSteps[0].po_validation_bat = 'validated';
  // Canal 1 : BAT encore à produire.
  data.workflow.channelSteps[1].ebf_bat = 'pending';
  const ebf = { name: 'Agent EBF', role: 'ebf' };
  const actions = workflow.getAvailableActions(ebf, data);
  assert.ok(actions.some(a => a.step.id === 'ebf_bat'),
    'tant qu\'un canal a un BAT à produire, l\'action ebf_bat doit rester disponible');
});

// ─────────────────────────────────────────────────────────
// getChannelProgress : progression par canal (cartes multi-canal du tableau de bord)
test('getChannelProgress — un canal, démarrage à 0 % puis progression', () => {
  const data = makeCampaign(['Com', 'EBF', 'Data']);
  workflow.initWorkflow(data);
  let p = workflow.getChannelProgress(data)[0];
  assert.equal(p.pct, 0);
  assert.equal(p.done, false);
  // On valide les premières étapes du canal 0
  const cs = data.workflow.channelSteps[0];
  cs.com_maquette = 'validated';
  cs.po_validation_maquette = 'validated';
  p = workflow.getChannelProgress(data)[0];
  assert.ok(p.pct > 0 && p.pct < 100, 'progression partielle attendue, obtenu ' + p.pct);
  assert.equal(p.done, false);
});

test('getChannelProgress — étape de dépôt validée par le PO compte comme faite', () => {
  const data = makeCampaign(['Com']); // canal Com seul → maquette + validation
  workflow.initWorkflow(data);
  const cs = data.workflow.channelSteps[0];
  // La maquette est "submitted" mais la validation PO est acquise → doit compter comme faite
  cs.com_maquette = 'submitted';
  cs.po_validation_maquette = 'validated';
  const p = workflow.getChannelProgress(data)[0];
  assert.equal(p.done, true, 'canal Com terminé après validation maquette');
  assert.equal(p.pct, 100);
});

test('getChannelProgress — plusieurs canaux indépendants', () => {
  const data = makeCampaign(['Com', 'EBF', 'Data'], [
    { deliverableName: 'Mail', content: 'MAIL' },
    { deliverableName: 'SMS', content: 'SMS' }
  ]);
  workflow.initWorkflow(data);
  // On fait avancer uniquement le canal 0
  data.workflow.channelSteps[0].com_maquette = 'validated';
  data.workflow.channelSteps[0].po_validation_maquette = 'validated';
  const arr = workflow.getChannelProgress(data);
  assert.equal(arr.length, 2);
  assert.ok(arr[0].pct > arr[1].pct, 'le canal 0 doit être plus avancé que le canal 1');
});

// ─────────────────────────────────────────────────────────
// reopenChannelStep : retour à une étape antérieure (L2 #2/#12/#18)
function fullyAdvancedChannel() {
  const data = makeCampaign(['Com', 'EBF', 'Data']);
  workflow.initWorkflow(data);
  data.workflow.steps.manager_affectation = 'validated';
  data.workflow.steps.po_kickoff = 'validated';
  const cs = data.workflow.channelSteps[0];
  cs.com_maquette = 'validated'; cs.po_validation_maquette = 'validated';
  cs.ebf_bat = 'validated'; cs.po_validation_bat = 'validated';
  cs.data_ciblage = 'validated'; cs.po_validation_ciblage = 'validated';
  cs.data_lancement_test = 'validated'; cs.ebf_test_prod = 'validated'; cs.po_validation_test_prod = 'validated';
  return data;
}

test('reopenChannelStep — retour au BAT : Data conservée, test prod à refaire', () => {
  const data = fullyAdvancedChannel();
  workflow.reopenChannelStep(data, 0, 'ebf_bat', 'Corriger le code com');
  const cs = data.workflow.channelSteps[0];
  // Cible ré-éditable + sa validation reverrouillée
  assert.equal(cs.ebf_bat, 'revision_requested');
  assert.equal(cs.po_validation_bat, 'locked');
  // Branche Data conservée (indépendante du BAT)
  assert.equal(cs.data_ciblage, 'validated', 'le ciblage Data doit être conservé');
  assert.equal(cs.po_validation_ciblage, 'validated');
  // Test en prod (et suite) à refaire
  assert.equal(cs.data_lancement_test, 'locked');
  assert.equal(cs.ebf_test_prod, 'locked', 'le test en prod doit être à refaire');
  assert.equal(cs.po_validation_test_prod, 'locked');
  // Motif conservé
  assert.equal(data.workflow.channelRevisionComments[0].ebf_bat, 'Corriger le code com');
});

test('reopenChannelStep — retour à la maquette : BAT à refaire, ciblage conservé', () => {
  const data = fullyAdvancedChannel();
  workflow.reopenChannelStep(data, 0, 'com_maquette', 'Visuel à revoir');
  const cs = data.workflow.channelSteps[0];
  assert.equal(cs.com_maquette, 'revision_requested');
  assert.equal(cs.po_validation_maquette, 'locked');
  assert.equal(cs.ebf_bat, 'locked', 'le BAT doit être à refaire');
  assert.equal(cs.po_validation_bat, 'locked');
  assert.equal(cs.data_ciblage, 'validated', 'le ciblage Data (indépendant) doit être conservé');
  assert.equal(cs.ebf_test_prod, 'locked');
});

test('reopenChannelStep — motif obligatoire enregistré, autres canaux intacts', () => {
  const data = makeCampaign(['Com', 'EBF', 'Data'], [{ deliverableName: 'A' }, { deliverableName: 'B' }]);
  workflow.initWorkflow(data);
  data.workflow.steps.manager_affectation = 'validated';
  data.workflow.steps.po_kickoff = 'validated';
  data.workflow.channelSteps[0].ebf_bat = 'validated';
  data.workflow.channelSteps[0].po_validation_bat = 'validated';
  data.workflow.channelSteps[1].ebf_bat = 'validated';
  data.workflow.channelSteps[1].po_validation_bat = 'validated';
  workflow.reopenChannelStep(data, 0, 'ebf_bat', 'motif canal 0');
  assert.equal(data.workflow.channelSteps[0].ebf_bat, 'revision_requested');
  // Le canal 1 ne doit pas être affecté
  assert.equal(data.workflow.channelSteps[1].ebf_bat, 'validated', 'le canal 1 doit rester intact');
});

// ─────────────────────────────────────────────────────────
// WORKFLOW CONFIGURABLE PAR CANAL (Administration ▸ Workflow)
// ─────────────────────────────────────────────────────────
function withConfig(cfg, fn) {
  const prev = globalThis.window.ImpulsionMarketing.config;
  globalThis.window.ImpulsionMarketing.config = cfg;
  try { fn(); } finally { globalThis.window.ImpulsionMarketing.config = prev; }
}

test('isStepApplicable — sans config, toute étape est applicable à tout canal', () => {
  assert.equal(workflow.isStepApplicable('MAIL', 'data_ciblage'), true);
  assert.equal(workflow.isStepApplicable(undefined, 'ebf_bat'), true);
});

test('isStepApplicable — un canal non configuré reste à flux complet par défaut', () => {
  withConfig({ CANAL_STEPS: { MAIL: ['ebf_bat', 'po_validation_bat'] } }, () => {
    assert.equal(workflow.isStepApplicable('MAIL', 'data_ciblage'), false, 'MAIL est explicitement restreint');
    assert.equal(workflow.isStepApplicable('SMS', 'data_ciblage'), true, 'SMS non configuré = flux complet (sécurité pour un nouveau canal)');
  });
});

test('canal restreint type LP — test en prod débloqué directement après le BAT, sans ciblage', () => {
  const cfg = { CANAL_STEPS: { LP: ['com_maquette', 'po_validation_maquette', 'ebf_bat', 'po_validation_bat', 'ebf_test_prod', 'po_validation_test_prod', 'ebf_mise_en_prod'] } };
  withConfig(cfg, () => {
    const data = makeCampaign(['Com', 'EBF', 'Data'], [{ deliverableName: 'Landing', content: 'LP' }]);
    workflow.advanceStep(data, 'manager_affectation', 'validated');
    workflow.advanceStep(data, 'po_kickoff', 'validated');
    assert.equal(ch0(data).data_ciblage, 'locked', 'le ciblage ne doit jamais se débloquer pour ce canal');
    workflow.advanceChannelStep(data, 0, 'com_maquette', 'submitted');
    workflow.validateChannelStep(data, 'po_validation_maquette', 0);
    workflow.advanceChannelStep(data, 0, 'ebf_bat', 'submitted');
    workflow.validateChannelStep(data, 'po_validation_bat', 0);
    let cs = ch0(data);
    assert.equal(cs.ebf_test_prod, 'pending', 'le test en prod doit se débloquer directement après le BAT');
    assert.equal(cs.data_lancement_test, 'locked', 'le lancement test ne s\'applique pas à ce canal');
    workflow.advanceChannelStep(data, 0, 'ebf_test_prod', 'submitted');
    workflow.validateChannelStep(data, 'po_validation_test_prod', 0);
    cs = ch0(data);
    assert.equal(cs.ebf_mise_en_prod, 'pending');
    assert.equal(cs.data_mise_en_prod, 'locked', 'la mise en prod Data ne s\'applique pas à ce canal');
    cs.ebf_mise_en_prod = 'completed';
    assert.equal(workflow.isChannelCompleted(ch0(data), data.requiredTeams, 'LP', false), true);
  });
});

test('canal restreint type MDC — ciblage débloqué dès le kick-off, mise en prod directe après le ciblage', () => {
  const cfg = { CANAL_STEPS: { MDC: ['data_ciblage', 'po_validation_ciblage', 'data_mise_en_prod'] } };
  withConfig(cfg, () => {
    const data = makeCampaign(['Com', 'EBF', 'Data'], [{ deliverableName: 'Message MDC', content: 'MDC' }]);
    workflow.advanceStep(data, 'manager_affectation', 'validated');
    workflow.advanceStep(data, 'po_kickoff', 'validated');
    const cs = ch0(data);
    assert.equal(cs.data_ciblage, 'pending', 'le ciblage doit se débloquer dès le kick-off pour ce canal');
    assert.equal(cs.com_maquette, 'locked', 'la maquette ne s\'applique pas à ce canal');
    assert.equal(cs.ebf_bat, 'locked', 'le BAT ne s\'applique pas à ce canal');
    workflow.advanceChannelStep(data, 0, 'data_ciblage', 'submitted');
    workflow.validateChannelStep(data, 'po_validation_ciblage', 0);
    assert.equal(ch0(data).data_mise_en_prod, 'pending', 'la mise en prod doit se débloquer directement après le ciblage (pas de test en prod pour ce canal)');
  });
});

test('channelStepIds — EBF seul (sans Data), canal non restreint : pas d\'étape de test en prod', () => {
  // Flux « EBF seul » : kickoff → BAT → val.BAT → fin (pas de ciblage, pas de
  // lancement test, pas de test en prod — cf. commentaire de recalcChannelUnlocks).
  const ids = workflow.channelStepIds(['EBF'], undefined, false);
  assert.deepEqual(ids, ['ebf_bat', 'po_validation_bat']);
});

test('channelStepIds — flux complet inclut bien le test en prod (EBF+Data)', () => {
  const ids = workflow.channelStepIds(['Com', 'EBF', 'Data'], undefined, false);
  assert.ok(ids.indexOf('ebf_test_prod') !== -1, 'ebf_test_prod doit être atteignable quand EBF et Data sont requis');
  assert.ok(ids.indexOf('data_lancement_test') !== -1);
});

test('canal restreint sans BAT (type « relevé de compte ») — ciblage requis mais pas le BAT avant le test en prod', () => {
  const cfg = { CANAL_STEPS: { RELEVE: ['data_ciblage', 'po_validation_ciblage', 'ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod'] } };
  withConfig(cfg, () => {
    const data = makeCampaign(['Com', 'EBF', 'Data'], [{ deliverableName: 'Relevé', content: 'RELEVE' }]);
    workflow.advanceStep(data, 'manager_affectation', 'validated');
    workflow.advanceStep(data, 'po_kickoff', 'validated');
    let cs = ch0(data);
    assert.equal(cs.com_maquette, 'locked', 'la maquette ne s\'applique pas à ce canal');
    assert.equal(cs.ebf_bat, 'locked', 'le BAT ne s\'applique pas à ce canal');
    assert.equal(cs.data_ciblage, 'pending', 'le ciblage doit se débloquer dès le kick-off');
    // Le test en prod ne doit PAS se débloquer avant le ciblage, même sans BAT.
    assert.equal(cs.ebf_test_prod, 'locked');
    workflow.advanceChannelStep(data, 0, 'data_ciblage', 'submitted');
    workflow.validateChannelStep(data, 'po_validation_ciblage', 0);
    cs = ch0(data);
    assert.equal(cs.ebf_test_prod, 'pending', 'le test en prod doit se débloquer directement après le ciblage (pas de BAT pour ce canal)');
  });
});

test('stepLabel / stepActor — surchargeables depuis la config (Administration ▸ Workflow)', () => {
  withConfig({ WORKFLOW_STEPS: [{ id: 'ebf_bat', label: 'Fabrication BAT', actor: 'data' }] }, () => {
    assert.equal(workflow.stepLabel('ebf_bat'), 'Fabrication BAT');
    assert.equal(workflow.stepActor('ebf_bat'), 'data');
    assert.equal(workflow.stepLabel('data_ciblage'), 'Ciblage Data', 'les étapes non surchargées gardent leur libellé par défaut');
  });
});

test('stepActor — surchargeable par canal (ex. Com autorisée en plus de l\'EBF pour le Courrier), sans affecter les autres canaux', () => {
  withConfig({ CANAL_ACTOR_OVERRIDES: { COURRIER: { ebf_test_prod: 'com' } } }, () => {
    assert.equal(workflow.stepActor('ebf_test_prod', 'COURRIER'), 'com');
    assert.equal(workflow.stepActor('ebf_test_prod', 'MAIL'), 'ebf', 'un canal non concerné par la surcharge garde l\'acteur par défaut');
    assert.equal(workflow.stepActor('ebf_test_prod'), 'ebf', 'sans canal précisé, acteur par défaut');
  });
});

test('getAvailableActions — acteur surchargé par canal : la Com voit l\'action sur le canal Courrier, pas sur MAIL', () => {
  withConfig({ CANAL_ACTOR_OVERRIDES: { COURRIER: { ebf_bat: 'com' } } }, () => {
    const data = makeCampaign(['Com', 'EBF', 'Data'], [
      { deliverableName: 'Lettre', content: 'COURRIER' },
      { deliverableName: 'Mail', content: 'MAIL' }
    ]);
    workflow.advanceStep(data, 'manager_affectation', 'validated');
    workflow.advanceStep(data, 'po_kickoff', 'validated');
    workflow.initWorkflow(data);
    data.workflow.assignments.com = ['Alice'];
    data.workflow.channelSteps[0].ebf_bat = 'pending'; // Courrier — surchargé Com
    data.workflow.channelSteps[1].ebf_bat = 'locked';  // MAIL — reste EBF
    const alice = { name: 'Alice', isManager: false };
    const actions = workflow.getAvailableActions(alice, data);
    assert.ok(actions.some(function (a) { return a.step.id === 'ebf_bat'; }), 'Alice (Com) doit voir l\'action ebf_bat sur le canal Courrier');
  });
});
