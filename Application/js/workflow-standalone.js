/**
 * Gestionnaire de Workflow Campagnes — Impulsion Marketing
 * Gère les étapes, statuts et transitions du workflow de production
 *
 * v2 — Étapes par canal indépendantes (channelSteps)
 * Chaque canal de communication progresse indépendamment.
 * Les étapes globales (po_saisie, manager_affectation, po_kickoff) restent communes.
 */

window.ImpulsionMarketing = window.ImpulsionMarketing || {};

window.ImpulsionMarketing.workflow = (function () {
  'use strict';

  // Définition complète des étapes (pour affichage / STEPS.forEach)
  var STEPS = [
    { id: 'po_saisie',              label: 'Saisie projet',       actor: 'po',      icon: '📝', description: 'Le PO a créé la campagne' },
    { id: 'manager_affectation',    label: 'Affectation',         actor: 'manager', icon: '👥', description: 'Le manager affecte les équipes' },
    { id: 'po_kickoff',             label: 'Kick-off',            actor: 'po',      icon: '🚀', description: 'Le PO organise le kick-off avec les équipes affectées' },
    { id: 'com_maquette',           label: 'Maquette Com',        actor: 'com',     icon: '🎨', description: 'La Com réalise la maquette' },
    { id: 'po_validation_maquette', label: 'Validation maquette', actor: 'po',      icon: '✅', description: 'Le PO valide la maquette' },
    { id: 'com_juridique',          label: 'Validation juridique', actor: 'com',     icon: '⚖️', description: 'La Com valide juridiquement la maquette (si requis)' },
    { id: 'ebf_bat',                label: 'Réalisation BAT',     actor: 'ebf',     icon: '🖨️', description: "L'EBF réalise le BAT" },
    { id: 'po_validation_bat',      label: 'Validation BAT',      actor: 'po',      icon: '✅', description: 'Le PO valide le BAT' },
    { id: 'data_ciblage',           label: 'Ciblage Data',        actor: 'data',    icon: '🎯', description: 'La Data réalise le ciblage (parallèle possible)' },
    { id: 'po_validation_ciblage',  label: 'Validation ciblage',  actor: 'po',      icon: '✅', description: 'Le PO valide le ciblage' },
    { id: 'data_lancement_test',    label: 'Lancement test',      actor: 'data',    icon: '🧪', description: 'La Data lance le test en production' },
    { id: 'ebf_test_prod',          label: 'Test en prod',        actor: 'ebf',     icon: '🔬', description: "L'EBF dépose le test en production" },
    { id: 'po_validation_test_prod',label: 'Validation test',     actor: 'po',      icon: '✅', description: 'Le PO valide les tests en production' },
    { id: 'data_mise_en_prod',      label: 'Mise en prod',        actor: 'data',    icon: '🚀', description: 'La Data met en production' },
    { id: 'ebf_mise_en_prod',       label: 'Mise en prod LP',     actor: 'ebf',     icon: '🚀', description: "L'EBF met la landing page en production" }
  ];

  // IDs des étapes globales (partagées par tous les canaux)
  var GLOBAL_STEP_IDS = ['po_saisie', 'manager_affectation', 'po_kickoff'];

  // IDs des étapes par canal (chaque canal a sa propre progression)
  var CHANNEL_STEP_IDS = [
    'com_maquette', 'po_validation_maquette', 'com_juridique',
    'ebf_bat', 'po_validation_bat',
    'data_ciblage', 'po_validation_ciblage',
    'data_lancement_test',
    'ebf_test_prod', 'po_validation_test_prod',
    'data_mise_en_prod',
    'ebf_mise_en_prod'
  ];

  // Valeurs par défaut pour les étapes globales
  var DEFAULT_GLOBAL_STEPS = {
    po_saisie:           'validated',
    manager_affectation: 'pending',
    po_kickoff:          'locked'
  };

  // Valeurs par défaut pour les étapes par canal
  var DEFAULT_CHANNEL_STEPS = {
    com_maquette:           'locked',
    po_validation_maquette: 'locked',
    com_juridique:          'locked',
    ebf_bat:                'locked',
    po_validation_bat:      'locked',
    data_ciblage:           'locked',
    po_validation_ciblage:  'locked',
    data_lancement_test:    'locked',
    ebf_test_prod:          'locked',
    po_validation_test_prod:'locked',
    data_mise_en_prod:      'locked',
    ebf_mise_en_prod:       'locked'
  };

  var DEFAULT_ASSIGNMENTS = { manager: '', com: '', ebf: '', data: '' };

  // ─────────────────────────────────────────────────────────
  // CONFIGURATION DU WORKFLOW (Administration ▸ Workflow)
  // ─────────────────────────────────────────────────────────
  // Le libellé/acteur/ordre de chaque étape et l'applicabilité de chaque étape
  // par canal sont pilotés par _config.json (clé "workflow"), éditables depuis
  // l'Administration — avec repli complet sur STEPS/CHANNEL_STEP_IDS ci-dessus
  // si la config est absente. C'est notamment le cas en environnement de test
  // (test/workflow.test.mjs charge ce module isolément, sans IM.config).
  function _cfg() {
    return (window.ImpulsionMarketing && window.ImpulsionMarketing.config) || null;
  }
  // Étape « effective » (fusion base + surcharge admin) pour un id donné.
  // L'id, l'icône et la description restent fixes (structurels) ; le libellé,
  // l'acteur et l'ordre d'affichage sont surchargeables.
  function _stepDef(id) {
    var base = null, baseIdx = -1;
    for (var i = 0; i < STEPS.length; i++) { if (STEPS[i].id === id) { base = STEPS[i]; baseIdx = i; break; } }
    var c = _cfg();
    var overrides = (c && Array.isArray(c.WORKFLOW_STEPS)) ? c.WORKFLOW_STEPS : null;
    var o = null;
    if (overrides) {
      for (var j = 0; j < overrides.length; j++) { if (overrides[j] && overrides[j].id === id) { o = overrides[j]; break; } }
    }
    return {
      id: id,
      label: (o && o.label) || (base && base.label) || id,
      actor: (o && o.actor) || (base && base.actor),
      icon: base && base.icon,
      description: base && base.description,
      order: (o && typeof o.order === 'number') ? o.order : baseIdx
    };
  }
  function stepLabel(id) { return _stepDef(id).label; }
  // Acteur d'une étape — éventuellement surchargé pour un canal donné (ex. la
  // Com peut déposer le test en prod pour le canal Courrier, en plus de l'EBF).
  // Piloté par _config.json workflow.canalActorOverrides : { canal: { stepId: actor } }.
  // N'affecte QUE qui peut agir — aucun impact sur le déblocage des étapes.
  function stepActor(id, channelContent) {
    if (channelContent) {
      var c = _cfg();
      var overrides = c && c.CANAL_ACTOR_OVERRIDES;
      if (overrides && overrides[channelContent] && overrides[channelContent][id]) {
        return overrides[channelContent][id];
      }
    }
    return _stepDef(id).actor;
  }

  // Applicabilité d'une étape pour un CANAL donné (channel.content, ex. « MAIL »,
  // « ZAC », « LP »…) — pilotée par _config.json workflow.canalSteps. Un canal
  // absent de la config (ou config elle-même absente) applique TOUTES les
  // étapes : réglage par défaut le plus sûr, un nouveau canal (ou une nouvelle
  // caisse régionale qui n'a pas encore paramétré ses canaux) garde le flux complet.
  function isStepApplicable(channelContent, stepId) {
    var c = _cfg();
    var cs = c && c.CANAL_STEPS;
    if (!cs || !channelContent || !Object.prototype.hasOwnProperty.call(cs, channelContent)) return true;
    var list = cs[channelContent];
    return Array.isArray(list) ? (list.indexOf(stepId) !== -1) : true;
  }

  // ─────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────

  /**
   * Vérifie si une équipe est requise pour cette campagne
   * Si requiredTeams absent → toutes équipes requises (rétrocompat)
   */
  function isTeamRequired(requiredTeams, team) {
    if (!requiredTeams || !Array.isArray(requiredTeams)) return true;
    return requiredTeams.indexOf(team) !== -1;
  }

  /**
   * La campagne nécessite-t-elle une validation juridique et conformité ?
   * (flag posé à la création — étape com_juridique insérée dans le workflow)
   */
  function juridiqueRequired(campaignData) {
    return !!(campaignData && campaignData.juridique && campaignData.juridique.required);
  }

  // ─────────────────────────────────────────────────────────
  // MIGRATION ancien format → channelSteps
  // ─────────────────────────────────────────────────────────

  /**
   * Convertit l'ancien format (steps plats) vers channelSteps.
   * Les étapes canal sont copiées dans tous les canaux existants.
   * Idempotent : ne fait rien si channelSteps déjà présent.
   */
  function migrateToChannelSteps(campaignData) {
    var wf = campaignData.workflow;
    if (!wf || !wf.steps) return;
    if (wf.channelSteps) return; // déjà migré

    var numChannels = Math.max((campaignData.channels || []).length, 1);
    wf.channelSteps = {};

    for (var i = 0; i < numChannels; i++) {
      wf.channelSteps[i] = {};
      CHANNEL_STEP_IDS.forEach(function (id) {
        wf.channelSteps[i][id] = (wf.steps[id] !== undefined) ? wf.steps[id] : DEFAULT_CHANNEL_STEPS[id];
      });
    }

    // Supprimer les étapes canal du steps global
    CHANNEL_STEP_IDS.forEach(function (id) {
      delete wf.steps[id];
    });
  }

  // ─────────────────────────────────────────────────────────
  // INITIALISATION
  // ─────────────────────────────────────────────────────────

  /**
   * Initialise les champs workflow dans une campagne (rétrocompatibilité)
   * Si workflow absent, l'ajoute avec valeurs par défaut
   */
  function initWorkflow(campaignData) {
    if (!campaignData.workflow) {
      campaignData.workflow = {
        assignments:              Object.assign({}, DEFAULT_ASSIGNMENTS),
        steps:                    Object.assign({}, DEFAULT_GLOBAL_STEPS),
        channelSteps:             {},
        revisionComments:         {},
        channelRevisionComments:  {}
      };
    } else {
      if (!campaignData.workflow.assignments) {
        campaignData.workflow.assignments = Object.assign({}, DEFAULT_ASSIGNMENTS);
      }
      if (!campaignData.workflow.steps) {
        campaignData.workflow.steps = Object.assign({}, DEFAULT_GLOBAL_STEPS);
      }
      if (!campaignData.workflow.revisionComments) {
        campaignData.workflow.revisionComments = {};
      }
      if (!campaignData.workflow.channelRevisionComments) {
        campaignData.workflow.channelRevisionComments = {};
      }
    }

    // Migration ancien format → channelSteps
    migrateToChannelSteps(campaignData);

    // Compléter les étapes globales manquantes
    GLOBAL_STEP_IDS.forEach(function (key) {
      if (campaignData.workflow.steps[key] === undefined) {
        campaignData.workflow.steps[key] = DEFAULT_GLOBAL_STEPS[key];
      }
    });

    // Rétrocompat kick-off : détecter si les équipes ont déjà commencé (via channelSteps)
    var s = campaignData.workflow.steps;
    var anyChannelStarted = false;
    var cs = campaignData.workflow.channelSteps || {};
    Object.keys(cs).forEach(function (i) {
      if (cs[i] && (cs[i].com_maquette !== 'locked' || cs[i].data_ciblage !== 'locked' || cs[i].ebf_bat !== 'locked')) {
        anyChannelStarted = true;
      }
    });

    // Kick-off conditionné (M7) : si la campagne n'a pas de kick-off
    // (kickoffNeeded === 'Non'), l'étape est validée automatiquement (on ne
    // demande rien au PO). Rétro-compat : un champ absent garde l'ancien
    // comportement (kick-off requis).
    var kickoffSkipped = campaignData.kickoffNeeded === 'Non';
    if (s.po_kickoff === 'locked' && s.manager_affectation === 'validated' && !anyChannelStarted) {
      s.po_kickoff = kickoffSkipped ? 'validated' : 'pending';
    }
    if (kickoffSkipped && s.po_kickoff === 'pending') {
      s.po_kickoff = 'validated';
    }
    if ((s.po_kickoff === 'locked' || s.po_kickoff === 'pending') && anyChannelStarted) {
      s.po_kickoff = 'validated';
    }

    // Init channelSteps pour chaque canal (y compris nouveaux canaux ajoutés)
    if (!campaignData.workflow.channelSteps) {
      campaignData.workflow.channelSteps = {};
    }
    cs = campaignData.workflow.channelSteps;
    var numChannels = Math.max((campaignData.channels || []).length, 1);

    for (var i = 0; i < numChannels; i++) {
      if (!cs[i]) {
        cs[i] = Object.assign({}, DEFAULT_CHANNEL_STEPS);
      } else {
        // Compléter les étapes canal manquantes
        CHANNEL_STEP_IDS.forEach(function (id) {
          if (cs[i][id] === undefined) cs[i][id] = DEFAULT_CHANNEL_STEPS[id];
        });
      }

      // Rétrocompat Sprint 5 — data_lancement_test
      var csi = cs[i];
      if (csi.data_lancement_test === 'locked' && csi.ebf_test_prod !== 'locked') {
        csi.data_lancement_test = 'validated';
      }

      // Recalculer les déblocages pour ce canal
      var chContent = campaignData.channels && campaignData.channels[i] && campaignData.channels[i].content;
      cs[i] = recalcChannelUnlocks(cs[i], campaignData.workflow.steps, campaignData.requiredTeams, chContent, juridiqueRequired(campaignData));
    }

    if (!campaignData.kickoffDate) campaignData.kickoffDate = '';
    if (!campaignData.kickoffPersonNotes) campaignData.kickoffPersonNotes = {};

    return campaignData;
  }

  // ─────────────────────────────────────────────────────────
  // RECALCUL DES DÉBLOCAGES
  // ─────────────────────────────────────────────────────────

  /**
   * Recalcule les déverrouillages globaux
   * (po_saisie → manager_affectation → po_kickoff)
   */
  function recalcGlobalUnlocks(steps) {
    var s = steps;
    if (s.po_saisie === 'validated' && s.manager_affectation === 'locked') {
      s.manager_affectation = 'pending';
    }
    if (s.manager_affectation === 'validated' && s.po_kickoff === 'locked') {
      s.po_kickoff = 'pending';
    }
    return s;
  }

  /**
   * Recalcule les déverrouillages pour UN canal selon les requiredTeams.
   *
   * Matrice des flux selon les équipes requises :
   *
   * Com+EBF+Data : kickoff → maquette → val.maquette → BAT → val.BAT
   *                        → ciblage → val.ciblage (parallèle)
   *                        → lancement test → test prod → val.test → MEP
   *
   * Com+EBF (sans Data) : kickoff → maquette → val.maquette → BAT → val.BAT → fin
   *
   * Com+Data (sans EBF) : kickoff → maquette → val.maquette
   *                              → ciblage → val.ciblage → MEP (parallèle)
   *
   * EBF+Data (sans Com) : kickoff → BAT → val.BAT
   *                              → ciblage → val.ciblage
   *                              → lancement test → test prod → val.test → MEP
   *
   * Com seul           : kickoff → maquette → val.maquette → fin
   * EBF seul (sans Data): kickoff → BAT → val.BAT → fin
   * Data seul          : kickoff → ciblage → val.ciblage → MEP
   */
  function recalcChannelUnlocks(cs, globalSteps, requiredTeams, channelContent, juridiqueRequired) {
    var reqCom  = isTeamRequired(requiredTeams, 'Com');
    var reqEbf  = isTeamRequired(requiredTeams, 'EBF');
    var reqData = isTeamRequired(requiredTeams, 'Data');
    function ok(id) { return isStepApplicable(channelContent, id); }

    var kickoffDone = globalSteps && (globalSteps.po_kickoff === 'validated');

    // ── Après kickoff : débloquer les premières étapes ──
    if (kickoffDone) {
      if (reqCom  && ok('com_maquette') && cs.com_maquette === 'locked') cs.com_maquette = 'pending';
      if (reqData && ok('data_ciblage') && cs.data_ciblage === 'locked') cs.data_ciblage = 'pending';
      // EBF sans Com (ou Com non applicable à ce canal) → BAT se débloque directement après kickoff
      if (reqEbf && (!reqCom || !ok('com_maquette')) && ok('ebf_bat') && cs.ebf_bat === 'locked') cs.ebf_bat = 'pending';
    }

    // ── Chaîne Com ──
    if (reqCom && ok('po_validation_maquette') && cs.com_maquette === 'submitted' && cs.po_validation_maquette === 'locked') {
      cs.po_validation_maquette = 'pending';
    }
    // Validation juridique (Com) : débloquée après validation PO de la maquette,
    // uniquement si la campagne requiert une validation juridique et conformité
    // ET si cette étape s'applique à ce canal.
    if (reqCom && juridiqueRequired && ok('com_juridique')) {
      var maquetteValForJur = cs.po_validation_maquette === 'validated' || cs.po_validation_maquette === 'completed';
      if (maquetteValForJur && cs.com_juridique === 'locked') cs.com_juridique = 'pending';
    }

    // ── Chaîne EBF ──
    // ebf_bat se débloque quand :
    // - Com requise (et applicable) sans juridique : après po_validation_maquette validée
    // - Com requise (et applicable) avec juridique (et applicable) : après com_juridique validée
    // - Com non requise ou non applicable à ce canal : déjà géré ci-dessus (après kickoff)
    if (reqEbf && reqCom && ok('com_maquette') && ok('ebf_bat')) {
      var comValidated = cs.po_validation_maquette === 'validated' || cs.po_validation_maquette === 'completed';
      var needsJuridiqueGate = juridiqueRequired && ok('com_juridique');
      var canStartBat = needsJuridiqueGate
        ? (cs.com_juridique === 'validated' || cs.com_juridique === 'completed')
        : comValidated;
      if (canStartBat && cs.ebf_bat === 'locked') cs.ebf_bat = 'pending';
      // Gate juridique : tant que la validation juridique requise n'est pas faite,
      // le BAT ne doit pas être ouvert. On re-verrouille un ebf_bat resté/passé
      // à 'pending' (état hérité d'avant l'ajout du juridique, ou recalcul) —
      // sans toucher un BAT déjà commencé (submitted/validated/completed).
      if (needsJuridiqueGate && !canStartBat && cs.ebf_bat === 'pending') {
        cs.ebf_bat = 'locked';
      }
    }
    if (reqEbf && ok('po_validation_bat') && cs.ebf_bat === 'submitted' && cs.po_validation_bat === 'locked') {
      cs.po_validation_bat = 'pending';
    }

    // ── Chaîne Data (ciblage) ──
    if (reqData && ok('po_validation_ciblage') && cs.data_ciblage === 'submitted' && cs.po_validation_ciblage === 'locked') {
      cs.po_validation_ciblage = 'pending';
    }

    // ── Test en prod : le BAT et/ou le ciblage alimentent le test en prod selon
    // ce qui s'applique à ce canal (un volet non applicable est considéré acquis
    // d'office — il ne bloque pas les autres). Flux standard (lancement test
    // applicable) : lancement test → test en prod, une fois le(s) volet(s) amont
    // validé(s). Flux réduit (lancement test non applicable à ce canal, ex. LP ou
    // canal sans étape de ciblage) : test en prod débloqué directement dès que
    // le(s) volet(s) amont applicable(s) (BAT et/ou ciblage) sont validés.
    var batApplicable = reqEbf && ok('po_validation_bat');
    var batDone = !batApplicable || cs.po_validation_bat === 'validated' || cs.po_validation_bat === 'completed';
    var ciblageApplicable = reqData && ok('data_ciblage');
    var ciblageDone = !ciblageApplicable || cs.po_validation_ciblage === 'validated' || cs.po_validation_ciblage === 'completed';
    // Si ni le BAT ni le ciblage ne s'appliquent à ce canal, le seul verrou
    // restant est le kick-off (sinon le test en prod se débloquerait sans
    // aucune condition, dès l'initialisation du canal).
    var upstreamDone = (batApplicable || ciblageApplicable) ? (batDone && ciblageDone) : kickoffDone;

    if (ok('data_lancement_test')) {
      if (reqEbf && reqData && upstreamDone && cs.data_lancement_test === 'locked') {
        cs.data_lancement_test = 'pending';
      }
      var ltDone = cs.data_lancement_test === 'submitted' || cs.data_lancement_test === 'validated' || cs.data_lancement_test === 'completed';
      if (reqEbf && ok('ebf_test_prod') && ltDone && cs.ebf_test_prod === 'locked') {
        cs.ebf_test_prod = 'pending';
      }
    } else if (reqEbf && ok('ebf_test_prod') && upstreamDone && cs.ebf_test_prod === 'locked') {
      cs.ebf_test_prod = 'pending';
    }

    if (reqEbf && ok('po_validation_test_prod') && cs.ebf_test_prod === 'submitted' && cs.po_validation_test_prod === 'locked') {
      cs.po_validation_test_prod = 'pending';
    }
    var testProdValidated = cs.po_validation_test_prod === 'validated' || cs.po_validation_test_prod === 'completed';

    // ── Mise en production : Data et/ou EBF, selon les étapes applicables à ce canal ──
    if (reqData && ok('data_mise_en_prod') && testProdValidated && cs.data_mise_en_prod === 'locked') {
      cs.data_mise_en_prod = 'pending';
    }
    if (reqEbf && ok('ebf_mise_en_prod') && testProdValidated && cs.ebf_mise_en_prod === 'locked') {
      cs.ebf_mise_en_prod = 'pending';
    }

    // ── MEP : flux réduit Data (EBF non requis, OU le test en prod EBF ne
    // s'applique pas à ce canal — ex. canal sans étape de fabrication/test) →
    // mise en prod directement après le(s) volet(s) amont applicable(s), sans
    // attendre un test en prod qui ne surviendra jamais pour ce canal.
    if (reqData && ok('data_mise_en_prod') && (!reqEbf || !ok('ebf_test_prod')) && !testProdValidated) {
      if (upstreamDone && cs.data_mise_en_prod === 'locked') {
        cs.data_mise_en_prod = 'pending';
      }
    }

    return cs;
  }

  /**
   * Alias pour rétrocompatiblité (appelé depuis advanceStep global)
   */
  function recalcUnlocks(steps) {
    return recalcGlobalUnlocks(steps);
  }

  // ─────────────────────────────────────────────────────────
  // AVANCEMENT DES ÉTAPES
  // ─────────────────────────────────────────────────────────

  /**
   * Avance une étape GLOBALE (po_kickoff, manager_affectation, po_saisie)
   * puis recalcule les déblocages canal (ex : kickoff validé → unlock canaux)
   */
  function advanceStep(campaignData, stepId, newStatus) {
    initWorkflow(campaignData);
    campaignData.workflow.steps[stepId] = newStatus;
    campaignData.workflow.steps = recalcGlobalUnlocks(campaignData.workflow.steps);

    // Recalculer les déblocages canal après changement global
    var cs = campaignData.workflow.channelSteps;
    var numChannels = Math.max((campaignData.channels || []).length, 1);
    for (var i = 0; i < numChannels; i++) {
      if (cs[i]) {
        var chContentG = campaignData.channels && campaignData.channels[i] && campaignData.channels[i].content;
        cs[i] = recalcChannelUnlocks(cs[i], campaignData.workflow.steps, campaignData.requiredTeams, chContentG, juridiqueRequired(campaignData));
      }
    }
    return campaignData;
  }

  /**
   * Avance une étape d'UN CANAL spécifique
   * puis recalcule les déblocages de ce canal
   */
  function advanceChannelStep(campaignData, channelIdx, stepId, newStatus) {
    initWorkflow(campaignData);
    var cs = campaignData.workflow.channelSteps;
    if (!cs[channelIdx]) cs[channelIdx] = Object.assign({}, DEFAULT_CHANNEL_STEPS);
    cs[channelIdx][stepId] = newStatus;
    var chContentC = campaignData.channels && campaignData.channels[channelIdx] && campaignData.channels[channelIdx].content;
    cs[channelIdx] = recalcChannelUnlocks(cs[channelIdx], campaignData.workflow.steps, campaignData.requiredTeams, chContentC, juridiqueRequired(campaignData));
    return campaignData;
  }

  // Historique des demandes de modification par canal (M16) — append-only :
  // un événement par demande (étape concernée, demandeur, date/heure,
  // description), pour affichage dans la card « Historique des modifications »
  // + compteur d'allers-retours. Alimenté par requestChannelRevision,
  // reopenChannelStep et refuseChannelJuridique. author/when sont fournis par
  // l'appelant (page) : le moteur reste une fonction pure, sans horloge/identité.
  function _pushRevisionLog(campaignData, channelIdx, stepId, comment, author, when) {
    if (!campaignData.workflow.channelRevisionLog) campaignData.workflow.channelRevisionLog = {};
    if (!campaignData.workflow.channelRevisionLog[channelIdx]) campaignData.workflow.channelRevisionLog[channelIdx] = [];
    campaignData.workflow.channelRevisionLog[channelIdx].push({
      stepId: stepId, author: author || '', date: when || '', comment: comment || ''
    });
  }
  function getChannelRevisionLog(campaignData, channelIdx) {
    var log = campaignData.workflow && campaignData.workflow.channelRevisionLog;
    return (log && log[channelIdx]) ? log[channelIdx] : [];
  }

  /**
   * Demande une modification sur une étape canal (PO → acteur)
   * Met à jour channelSteps[channelIdx] et stocke le commentaire
   */
  function requestChannelRevision(campaignData, poStepId, sourceStepId, channelIdx, comment, author, when) {
    initWorkflow(campaignData);
    var cs = campaignData.workflow.channelSteps;
    if (!cs || !cs[channelIdx]) return campaignData;
    cs[channelIdx][sourceStepId] = 'revision_requested';
    cs[channelIdx][poStepId]     = 'locked';
    if (!campaignData.workflow.channelRevisionComments) {
      campaignData.workflow.channelRevisionComments = {};
    }
    if (!campaignData.workflow.channelRevisionComments[channelIdx]) {
      campaignData.workflow.channelRevisionComments[channelIdx] = {};
    }
    campaignData.workflow.channelRevisionComments[channelIdx][sourceStepId] = comment || '';
    _pushRevisionLog(campaignData, channelIdx, sourceStepId, comment, author, when);
    return campaignData;
  }

  // Carte des dépendances : pour chaque étape, les étapes qui EN DÉPENDENT
  // (descendantes, transitivement). Sert au retour à une étape antérieure :
  // seules les descendantes sont à refaire ; les branches indépendantes sont
  // conservées. Les deux chaînes Com→BAT et Data→ciblage sont indépendantes
  // jusqu'à leur jonction au lancement test. C'est un sur-ensemble statique :
  // recalcChannelUnlocks ne ré-ouvre que les étapes réellement requises.
  var STEP_DESCENDANTS = {
    com_maquette:            ['po_validation_maquette', 'com_juridique', 'ebf_bat', 'po_validation_bat', 'data_lancement_test', 'ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    po_validation_maquette:  ['com_juridique', 'ebf_bat', 'po_validation_bat', 'data_lancement_test', 'ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    com_juridique:           ['ebf_bat', 'po_validation_bat', 'data_lancement_test', 'ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    ebf_bat:                 ['po_validation_bat', 'data_lancement_test', 'ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    po_validation_bat:       ['data_lancement_test', 'ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    data_ciblage:            ['po_validation_ciblage', 'data_lancement_test', 'ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    po_validation_ciblage:   ['data_lancement_test', 'ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    data_lancement_test:     ['ebf_test_prod', 'po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    ebf_test_prod:           ['po_validation_test_prod', 'data_mise_en_prod', 'ebf_mise_en_prod'],
    po_validation_test_prod: ['data_mise_en_prod', 'ebf_mise_en_prod'],
    data_mise_en_prod:       [],
    ebf_mise_en_prod:        []
  };

  /**
   * Renvoie un canal à une étape antérieure (L2 : « revenir en arrière »).
   * - L'étape cible redevient éditable (revision_requested) → l'acteur la refait.
   * - Sa validation PO associée et toutes ses étapes DESCENDANTES repassent à
   *   'locked' : elles seront à refaire dans l'ordre. Les branches indépendantes
   *   (ex. le ciblage Data quand on revient au BAT) sont conservées.
   * - Le motif est obligatoire (stocké + affiché en « Modification demandée »).
   * Utilisable par l'acteur sur sa propre étape, ou par le PO sur toute étape.
   */
  function reopenChannelStep(campaignData, channelIdx, targetStepId, reason, author, when) {
    initWorkflow(campaignData);
    var cs = campaignData.workflow.channelSteps;
    if (!cs || !cs[channelIdx] || CHANNEL_STEP_IDS.indexOf(targetStepId) === -1) return campaignData;
    var ch = cs[channelIdx];
    ch[targetStepId] = 'revision_requested';
    var v = _DEPOT_VALIDATION[targetStepId];
    if (v && ch[v] !== undefined) ch[v] = 'locked';
    (STEP_DESCENDANTS[targetStepId] || []).forEach(function (sid) {
      if (ch[sid] !== undefined) ch[sid] = 'locked';
    });
    if (!campaignData.workflow.channelRevisionComments) campaignData.workflow.channelRevisionComments = {};
    if (!campaignData.workflow.channelRevisionComments[channelIdx]) campaignData.workflow.channelRevisionComments[channelIdx] = {};
    campaignData.workflow.channelRevisionComments[channelIdx][targetStepId] = reason || '';
    _pushRevisionLog(campaignData, channelIdx, targetStepId, reason, author, when);
    var chContentR = campaignData.channels && campaignData.channels[channelIdx] && campaignData.channels[channelIdx].content;
    cs[channelIdx] = recalcChannelUnlocks(ch, campaignData.workflow.steps, campaignData.requiredTeams, chContentR, juridiqueRequired(campaignData));
    return campaignData;
  }

  /**
   * Alias rétrocompat — demande de révision globale (utilisé par requestRevision)
   */
  function requestRevision(campaignData, validationStepId, sourceStepId, comment) {
    initWorkflow(campaignData);
    campaignData.workflow.revisionComments[sourceStepId] = comment || '';
    return campaignData;
  }

  // ─────────────────────────────────────────────────────────
  // VALIDATION PAR CANAL (PO)
  // ─────────────────────────────────────────────────────────

  /**
   * Valide un step PO pour un canal spécifique → avance channelSteps[channelIdx]
   */
  function validateChannelStep(campaignData, poStepId, channelIdx) {
    return advanceChannelStep(campaignData, channelIdx, poStepId, 'validated');
  }

  /**
   * Refus de la validation juridique (par la Com) pour un canal.
   * On rejoue la séquence : retour à la maquette Com (révision demandée),
   * la validation PO et la validation juridique sont reverrouillées, le motif
   * est conservé. Quand la Com redépose, la séquence repart automatiquement.
   */
  function refuseChannelJuridique(campaignData, channelIdx, reason, author, when) {
    initWorkflow(campaignData);
    var cs = campaignData.workflow.channelSteps;
    if (!cs || !cs[channelIdx]) return campaignData;
    cs[channelIdx].com_juridique          = 'locked';
    cs[channelIdx].po_validation_maquette = 'locked';
    cs[channelIdx].com_maquette           = 'revision_requested';
    var fullReason = '⚖️ Refus juridique : ' + (reason || '');
    if (!campaignData.workflow.channelRevisionComments) campaignData.workflow.channelRevisionComments = {};
    if (!campaignData.workflow.channelRevisionComments[channelIdx]) campaignData.workflow.channelRevisionComments[channelIdx] = {};
    campaignData.workflow.channelRevisionComments[channelIdx].com_maquette = fullReason;
    _pushRevisionLog(campaignData, channelIdx, 'com_maquette', fullReason, author, when);
    return campaignData;
  }

  /**
   * Initialise channelValidations (conservé pour rétrocompat, non utilisé en v2)
   */
  function initChannelValidations(campaignData, numChannels) {
    initWorkflow(campaignData);
    if (!campaignData.workflow.channelValidations) {
      campaignData.workflow.channelValidations = {};
    }
  }

  // ─────────────────────────────────────────────────────────
  // ÉTAT DE LA CAMPAGNE
  // ─────────────────────────────────────────────────────────

  /**
   * Vérifie si UN canal est terminé selon les requiredTeams
   */
  function isChannelCompleted(channelSteps, requiredTeams, channelContent, juridiqueRequired) {
    var reqCom  = isTeamRequired(requiredTeams, 'Com');
    var reqEbf  = isTeamRequired(requiredTeams, 'EBF');
    var reqData = isTeamRequired(requiredTeams, 'Data');
    function ok(id) { return isStepApplicable(channelContent, id); }

    // Flux type LP : la mise en production est portée par l'EBF (pas par la
    // Data) — canal dont l'étape « Mise en prod LP » s'applique mais pas
    // « Mise en prod » (Data). Généralise l'ancien cas spécial isLP.
    if (reqEbf && ok('ebf_mise_en_prod') && !ok('data_mise_en_prod')) {
      return channelSteps.ebf_mise_en_prod === 'completed';
    }
    if (reqData && ok('data_mise_en_prod')) {
      return channelSteps.data_mise_en_prod === 'completed';
    }
    if (reqEbf && ok('po_validation_bat')) {
      return channelSteps.po_validation_bat === 'validated' || channelSteps.po_validation_bat === 'completed';
    }
    if (reqCom && ok('po_validation_maquette')) {
      // Canal Com seul (sans EBF ni Data applicables) : terminé après
      // validation de la maquette par le PO — et, si requis, après la
      // validation juridique Com.
      var maquetteOk = channelSteps.po_validation_maquette === 'validated' || channelSteps.po_validation_maquette === 'completed';
      if (juridiqueRequired && ok('com_juridique')) {
        return maquetteOk && (channelSteps.com_juridique === 'validated' || channelSteps.com_juridique === 'completed');
      }
      return maquetteOk;
    }
    return true;
  }

  /**
   * Vérifie si la campagne est terminée (tous les canaux terminés)
   */
  function isCompleted(campaignData) {
    if (!campaignData.workflow) return false;
    var cs = campaignData.workflow.channelSteps;
    if (!cs) return false;
    var numChannels = Math.max((campaignData.channels || []).length, 1);
    for (var i = 0; i < numChannels; i++) {
      var chContentI = campaignData.channels && campaignData.channels[i] && campaignData.channels[i].content;
      if (!cs[i] || !isChannelCompleted(cs[i], campaignData.requiredTeams, chContentI, juridiqueRequired(campaignData))) return false;
    }
    return true;
  }

  /**
   * Retourne le libellé de l'étape courante (pour badges dashboard)
   * Retourne l'étape la moins avancée parmi tous les canaux
   */
  function getCurrentStepLabel(campaignData) {
    if (!campaignData.workflow) return 'En attente d\'affectation';
    if (isCompleted(campaignData)) return 'Terminée';

    var globalSteps = campaignData.workflow.steps;
    if (!globalSteps) return 'En attente d\'affectation';

    // Étapes globales en priorité
    if (globalSteps.manager_affectation === 'pending') return 'Affectation';
    if (globalSteps.po_kickoff === 'pending')          return 'Kick-off';
    if (globalSteps.po_kickoff !== 'validated')        return 'En attente d\'affectation';

    // Chercher la première étape active parmi tous les canaux (la moins avancée)
    var cs = campaignData.workflow.channelSteps || {};
    var numChannels = Math.max((campaignData.channels || []).length, 1);

    for (var si = 3; si < STEPS.length; si++) { // index 0,1,2 = étapes globales
      var stepId = STEPS[si].id;
      var vId = _DEPOT_VALIDATION[stepId];
      for (var ci = 0; ci < numChannels; ci++) {
        if (!cs[ci]) continue;
        var status = cs[ci][stepId];
        // Fusion dépôt→validation : une étape de dépôt reste 'submitted' après
        // que le PO a validé l'étape de validation associée. On la considère
        // alors terminée (sinon on affiche « En validation : … » à tort).
        if (status === 'submitted' && vId && (cs[ci][vId] === 'validated' || cs[ci][vId] === 'completed')) continue;
        if (status === 'pending' || status === 'submitted' || status === 'revision_requested') {
          if (status === 'submitted')          return 'En validation : ' + stepLabel(stepId);
          if (status === 'revision_requested') return 'Révision : ' + stepLabel(stepId);
          return stepLabel(stepId);
        }
      }
    }
    return 'En cours';
  }

  // ─────────────────────────────────────────────────────────
  // PROGRESSION PAR CANAL (cartes du tableau de bord — option multi-canal)
  // ─────────────────────────────────────────────────────────
  var _STEP_LABEL = {};
  STEPS.forEach(function (s) { _STEP_LABEL[s.id] = s.label; });

  // Étapes pertinentes pour un canal selon les équipes requises, le juridique,
  // et l'applicabilité de l'étape à ce canal (Administration ▸ Workflow).
  // Source UNIQUE de « quelles étapes s'appliquent » — utilisée par le moteur
  // (recalcChannelUnlocks/isChannelCompleted en découlent) ET par l'interface
  // (pages/details.html), pour éviter toute divergence entre les deux.
  function _channelStepIds(requiredTeams, channelContent, juridiqueReq) {
    var reqCom  = isTeamRequired(requiredTeams, 'Com');
    var reqEbf  = isTeamRequired(requiredTeams, 'EBF');
    var reqData = isTeamRequired(requiredTeams, 'Data');
    function ok(id) { return isStepApplicable(channelContent, id); }
    var ids = CHANNEL_STEP_IDS.filter(function (id) {
      if (!ok(id)) return false;
      switch (id) {
        case 'com_maquette': case 'po_validation_maquette': return reqCom;
        case 'com_juridique': return reqCom && !!juridiqueReq;
        case 'ebf_bat': case 'po_validation_bat': return reqEbf;
        case 'data_ciblage': case 'po_validation_ciblage': return reqData;
        case 'data_lancement_test': return reqEbf && reqData;
        // Le test en prod (et sa validation/MEP LP) n'est atteignable que par le
        // flux standard (lancement test applicable à ce canal ET Data requise)
        // ou le flux réduit (lancement test non applicable à ce canal, ex. LP) —
        // sinon (EBF seul, sans Data, canal à flux standard) il n'y a pas de
        // test en prod du tout (le flux s'arrête au BAT).
        case 'ebf_test_prod': case 'po_validation_test_prod': case 'ebf_mise_en_prod':
          return reqEbf && (!ok('data_lancement_test') || reqData);
        case 'data_mise_en_prod': return reqData;
        default: return true;
      }
    });
    return ids.sort(function (a, b) { return _stepDef(a).order - _stepDef(b).order; });
  }

  // Une étape de dépôt est "faite" dès que sa validation PO associée est acquise.
  var _DEPOT_VALIDATION = {
    com_maquette: 'po_validation_maquette', ebf_bat: 'po_validation_bat',
    data_ciblage: 'po_validation_ciblage', data_lancement_test: 'po_validation_test_prod',
    ebf_test_prod: 'po_validation_test_prod'
  };
  function _stepColorKey(id) {
    if (/validation/.test(id)) return 'valid';
    if (/maquette|juridique/.test(id)) return 'maq';
    return 'prod'; // bat, ciblage, lancement, test, mise_en_prod
  }

  /**
   * Progression par canal : pour chaque canal, où en est-il.
   * Retourne [{ name, content, label, key, pct, done }]. Stocké dans l'index pour
   * que le tableau de bord affiche le détail par canal sans relire les campagne.json.
   */
  function getChannelProgress(campaignData) {
    initWorkflow(campaignData);
    var cs = campaignData.workflow.channelSteps || {};
    var jur = juridiqueRequired(campaignData);
    var channels = campaignData.channels || [];
    return channels.map(function (ch, i) {
      var steps = cs[i] || {};
      var content = ch && ch.content;
      var done  = isChannelCompleted(steps, campaignData.requiredTeams, content, jur);
      var ids   = _channelStepIds(campaignData.requiredTeams, content, jur);
      function eff(id) {
        var raw = steps[id] || 'locked';
        var v = _DEPOT_VALIDATION[id];
        if (raw === 'submitted' && v && (steps[v] === 'validated' || steps[v] === 'completed')) return 'completed';
        return raw;
      }
      var doneCount = 0, total = ids.length, label = '', key = 'maq';
      for (var k = 0; k < ids.length; k++) {
        var stt = eff(ids[k]);
        if (stt === 'validated' || stt === 'completed') { doneCount++; continue; }
        if (!label) {
          var lbl = stepLabel(ids[k]);
          if (stt === 'submitted')               { label = 'En validation : ' + lbl; key = 'valid'; }
          else if (stt === 'revision_requested') { label = 'Révision : ' + lbl;       key = 'urgent'; }
          else                                   { label = lbl;                        key = _stepColorKey(ids[k]); }
        }
      }
      var pct = done ? 100 : (total ? Math.round(doneCount / total * 100) : 0);
      if (done) { label = 'Terminé'; key = 'done'; }
      else if (!label) { label = 'En cours'; }
      return {
        name:    (ch && (ch.deliverableName || ch.content)) || ('Canal ' + (i + 1)),
        content: (ch && ch.content) || '',
        label: label, key: key, pct: pct, done: done
      };
    });
  }

  /**
   * Retourne la liste des étapes disponibles pour un utilisateur sur une campagne
   * Agrège toutes les étapes actives de tous les canaux
   */
  // Manager général (marketing) ou super-admin : a la main sur toute l'étape
  // d'affectation jusqu'à sa validation.
  function isGeneralManager(currentUser) {
    return !!currentUser && (
      (currentUser.role === 'marketing' && currentUser.isManager === true) ||
      currentUser.isSuperAdmin === true
    );
  }

  // #14 — Un manager de SERVICE (com/ebf/data) a terminé sa part d'affectation
  // dès qu'au moins une personne de son équipe est affectée — ou si son équipe
  // n'est pas requise par la campagne. On cesse alors de lui proposer l'action
  // d'affectation : la carte disparaît du tableau de bord « à produire » et le
  // bloc d'affectation n'est plus présenté. Le manager général garde la main
  // jusqu'à la validation de l'étape globale.
  function managerAffectationDone(currentUser, campaignData) {
    if (!currentUser || currentUser.isManager !== true || !campaignData) return false;
    if (isGeneralManager(currentUser)) return false;
    var role = currentUser.role;
    var teamLabel = role === 'com' ? 'Com' : (role === 'ebf' ? 'EBF' : (role === 'data' ? 'Data' : null));
    if (!teamLabel) return false; // rôle non concerné par l'affectation d'équipe
    var requiredTeams = campaignData.requiredTeams || [];
    if (!isTeamRequired(requiredTeams, teamLabel)) return true; // rien à affecter pour ce service
    var assignments = (campaignData.workflow && campaignData.workflow.assignments) || {};
    var assigned = assignments[role];
    var arr = Array.isArray(assigned) ? assigned : (assigned ? [assigned] : []);
    return arr.length > 0;
  }

  // Assignés EFFECTIFS d'un rôle sur un canal donné = équipe de base (campagne)
  // + renforts propres à ce canal (channelAssignments). Additif : un renfort
  // ajouté sur un canal n'affecte pas les autres canaux (L2 #15).
  function _asArr(v) { return Array.isArray(v) ? v : (v ? [v] : []); }
  // PO effectif : le PO principal OU un co-PO (suppléance congés).
  function isPoName(campaignData, name) {
    if (!name || !campaignData) return false;
    if (name === (campaignData.po || '')) return true;
    return _asArr(campaignData.coPo).indexOf(name) !== -1;
  }
  function channelAssignees(campaignData, channelIdx, role) {
    var wf = campaignData.workflow || {};
    var base = _asArr((wf.assignments || {})[role]);
    var extra = [];
    if (wf.channelAssignments && wf.channelAssignments[channelIdx]) {
      extra = _asArr(wf.channelAssignments[channelIdx][role]);
    }
    var seen = {}, out = [];
    base.concat(extra).forEach(function (n) { if (n && !seen[n]) { seen[n] = 1; out.push(n); } });
    return out;
  }

  // ─────────────────────────────────────────────────────────
  // AFFECTATION AUTOMATIQUE (règles paramétrables — L2 #21)
  // ─────────────────────────────────────────────────────────
  // Valeur d'un champ de condition pour une campagne / un canal donné.
  function _autoFieldValue(campaignData, ch, field) {
    switch (field) {
      case 'comType':      return ch && ch.comType;
      case 'volumeCible':  return ch && ch.volumeCible;
      case 'content':      return ch && ch.content;
      case 'comTypology':  return ch && ch.comTypology;
      case 'market':       return campaignData.market;
      case 'typology':     return campaignData.typology;
      case 'recurrence':   return campaignData.recurrence;
      case 'ubs':          return campaignData.ubs; // tableau
      default:             return undefined;
    }
  }
  function _autoCondMatch(actual, op, value) {
    var arr = Array.isArray(actual) ? actual.map(function (x) { return String(x).toLowerCase(); }) : null;
    var a = (actual == null) ? '' : String(actual);
    var v = (value == null) ? '' : String(value);
    switch (op) {
      case 'equals':    return arr ? arr.indexOf(v.toLowerCase()) !== -1 : a === v;
      case 'notEquals': return arr ? arr.indexOf(v.toLowerCase()) === -1 : a !== v;
      case 'contains':  return arr ? arr.indexOf(v.toLowerCase()) !== -1 : a.toLowerCase().indexOf(v.toLowerCase()) !== -1;
      case 'gt':        return parseFloat(a) >  parseFloat(v);
      case 'gte':       return parseFloat(a) >= parseFloat(v);
      case 'lt':        return parseFloat(a) <  parseFloat(v);
      case 'lte':       return parseFloat(a) <= parseFloat(v);
      case 'in':        return v.split(',').map(function (s) { return s.trim().toLowerCase(); }).indexOf(a.toLowerCase()) !== -1;
      default:          return false;
    }
  }
  function _addPeople(target, role, people) {
    var cur = _asArr(target[role]);
    var seen = {}; cur.forEach(function (n) { seen[n] = 1; });
    people.forEach(function (n) { if (n && !seen[n]) { seen[n] = 1; cur.push(n); } });
    target[role] = cur;
  }
  /**
   * Applique les règles d'affectation automatique à une campagne.
   * Une règle = { name, conditions:[{field,op,value}] (toutes vraies), role,
   * people:[], replaceManagerAffectation:bool }.
   *  - replaceManagerAffectation = true  → affecte l'équipe de la CAMPAGNE
   *    (le manager du service est ainsi dispensé de l'étape d'affectation) ;
   *  - false → ajoute un renfort sur le(s) canal(aux) concerné(s).
   * Toujours ADDITIF (n'écrase jamais une affectation existante).
   */
  function applyAutoAssignments(campaignData, rules) {
    if (!rules || !rules.length) return campaignData;
    initWorkflow(campaignData);
    var wf = campaignData.workflow;
    var channels = campaignData.channels || [];
    rules.forEach(function (rule) {
      if (!rule || !rule.role || !(rule.people && rule.people.length)) return;
      var conds = rule.conditions || [];
      var matched = [];
      channels.forEach(function (ch, idx) {
        var ok = conds.every(function (c) { return _autoCondMatch(_autoFieldValue(campaignData, ch, c.field), c.op, c.value); });
        if (ok) matched.push(idx);
      });
      if (!matched.length) return;
      if (rule.replaceManagerAffectation) {
        _addPeople(wf.assignments, rule.role, rule.people);
      } else {
        if (!wf.channelAssignments) wf.channelAssignments = {};
        matched.forEach(function (idx) {
          if (!wf.channelAssignments[idx]) wf.channelAssignments[idx] = {};
          _addPeople(wf.channelAssignments[idx], rule.role, rule.people);
        });
      }
    });
    return campaignData;
  }

  function getAvailableActions(currentUser, campaignData) {
    if (!currentUser || !campaignData) return [];
    initWorkflow(campaignData);

    var actions = [];
    var globalSteps = campaignData.workflow.steps;

    // Étapes globales
    STEPS.slice(0, 3).forEach(function (step) {
      var status = globalSteps[step.id] || 'locked';
      if (status !== 'pending' && status !== 'revision_requested') return;
      var actorMatch = false;
      if (step.actor === 'po') {
        actorMatch = isPoName(campaignData, currentUser.name);
      } else if (step.actor === 'manager') {
        actorMatch = currentUser.isManager === true;
        // #14 : un manager de service ayant déjà affecté son équipe n'a plus
        // l'action d'affectation (la carte quitte le tableau de bord « à produire »).
        if (actorMatch && step.id === 'manager_affectation' && managerAffectationDone(currentUser, campaignData)) {
          actorMatch = false;
        }
      }
      if (actorMatch) actions.push({ step: step, status: status });
    });

    // Étapes canal — agrégées (une seule occurrence par stepId)
    var cs = campaignData.workflow.channelSteps || {};
    var numChannels = Math.max((campaignData.channels || []).length, 1);
    var seenSteps = {};

    STEPS.slice(3).forEach(function (step) {
      if (seenSteps[step.id]) return;
      for (var ci = 0; ci < numChannels; ci++) {
        if (!cs[ci]) continue;
        var status = cs[ci][step.id] || 'locked';
        if (status !== 'pending' && status !== 'revision_requested') continue;
        // Acteur résolu PAR CANAL (surcharge admin éventuelle — Administration ▸
        // Workflow) : deux canaux du même step.id peuvent avoir un acteur différent.
        var chContentAA = campaignData.channels && campaignData.channels[ci] && campaignData.channels[ci].content;
        var actor = stepActor(step.id, chContentAA);
        var actorMatch = false;
        if (actor === 'po') {
          actorMatch = isPoName(campaignData, currentUser.name);
        } else {
          // Assignés effectifs de CE canal (base campagne + renfort du canal).
          actorMatch = channelAssignees(campaignData, ci, actor).indexOf(currentUser.name) !== -1;
        }
        if (actorMatch) {
          seenSteps[step.id] = true;
          actions.push({ step: step, status: status });
          break;
        }
      }
    });

    return actions;
  }

  // ─────────────────────────────────────────────────────────
  // SAUVEGARDE
  // ─────────────────────────────────────────────────────────

  // Le dossier Campagnes/ est partagé (OneDrive/SharePoint) : plusieurs
  // utilisateurs peuvent éditer la même campagne en parallèle. Comme chaque
  // sauvegarde réécrit tout campagne.json, un « dernier qui écrit gagne »
  // écrasait les modifications des autres (notes kick-off, validations, canaux…).
  //
  // On corrige par une fusion 3-way : à l'ouverture on mémorise l'état lu sur
  // disque (baseline) ; à la sauvegarde on relit le disque et on n'applique que
  // les champs que CET utilisateur a réellement modifiés, par-dessus la version
  // disque (qui peut contenir les modifs concurrentes des autres).
  var _baselines = (typeof WeakMap !== 'undefined') ? new WeakMap() : null;

  function _isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
  }
  function _deepClone(v) {
    return (v === undefined || v === null) ? v : JSON.parse(JSON.stringify(v));
  }
  function _deepEqual(a, b) {
    return JSON.stringify(a === undefined ? null : a) === JSON.stringify(b === undefined ? null : b);
  }

  /**
   * Fusion 3-way : repart de `theirs` (version disque la plus récente) et
   * applique uniquement les changements de `mine` par rapport à `base`.
   * - objets : fusion récursive clé par clé
   * - tableaux / scalaires : si je l'ai modifié vs base → ma valeur gagne,
   *   sinon on garde la valeur disque (celle des autres)
   */
  function threeWayMerge(base, mine, theirs) {
    if (!_isPlainObject(mine)) {
      // Valeur non-objet : ma valeur si je l'ai changée, sinon celle du disque
      return _deepEqual(mine, base) ? _deepClone(theirs) : _deepClone(mine);
    }
    base = _isPlainObject(base) ? base : {};
    var result = _isPlainObject(theirs) ? _deepClone(theirs) : {};

    Object.keys(mine).forEach(function (k) {
      var mv = mine[k], bv = base[k], tv = result[k];
      if (_isPlainObject(mv) && (_isPlainObject(tv) || tv === undefined)) {
        result[k] = threeWayMerge(bv, mv, tv);
      } else if (!_deepEqual(mv, bv)) {
        result[k] = _deepClone(mv);            // je l'ai modifié → ma valeur gagne
      } else if (tv === undefined) {
        result[k] = _deepClone(mv);            // inchangé mais absent du disque
      }
      // sinon : inchangé par moi → on garde la valeur disque déjà présente
    });

    // Clés que j'ai supprimées (présentes dans base, absentes de mine) :
    // on ne les retire que si le disque ne les a pas modifiées entre-temps.
    Object.keys(base).forEach(function (k) {
      if (!(k in mine) && (k in result) && _deepEqual(base[k], result[k])) {
        delete result[k];
      }
    });
    return result;
  }

  /**
   * Mémorise l'état de référence d'une campagne (à appeler juste après le
   * chargement depuis le disque). Permet la fusion 3-way à la sauvegarde.
   */
  function captureBaseline(campaignData) {
    if (_baselines && _isPlainObject(campaignData)) {
      _baselines.set(campaignData, _deepClone(campaignData));
    }
  }

  // Remplace en place le contenu de `target` par celui de `source`
  // (conserve la référence objet utilisée ailleurs dans la page).
  function _replaceInPlace(target, source) {
    Object.keys(target).forEach(function (k) { if (!(k in source)) delete target[k]; });
    Object.keys(source).forEach(function (k) { target[k] = _deepClone(source[k]); });
  }

  /**
   * Sauvegarde campagne.json avec le workflow mis à jour.
   * Relit le disque et fusionne (3-way) pour ne pas écraser les modifications
   * concurrentes d'autres utilisateurs. En cas d'échec de relecture/fusion,
   * on retombe sur l'écriture directe (comportement historique) pour ne jamais
   * bloquer une sauvegarde.
   */
  function saveCampaignWorkflow(rootHandle, campaignName, campaignData) {
    var campaignDirRef;
    return rootHandle.getDirectoryHandle('Campagnes')
      .then(function (campagnesDir) {
        return campagnesDir.getDirectoryHandle(campaignName);
      })
      .then(function (campaignDir) {
        campaignDirRef = campaignDir;
        // Relecture de la version disque pour fusion (non bloquante)
        return campaignDir.getFileHandle('campagne.json', { create: false })
          .then(function (fh) { return fh.getFile(); })
          .then(function (f) { return f.text(); })
          .then(function (txt) { try { return JSON.parse(txt); } catch (e) { return null; } })
          .catch(function () { return null; });
      })
      .then(function (diskData) {
        var baseline = _baselines ? _baselines.get(campaignData) : null;
        if (diskData && baseline) {
          var merged = threeWayMerge(baseline, campaignData, diskData);
          _replaceInPlace(campaignData, merged); // l'objet en mémoire reflète la fusion
        }
        // Nouvelle référence = ce qu'on vient d'écrire
        if (_baselines) _baselines.set(campaignData, _deepClone(campaignData));
        return campaignDirRef.getFileHandle('campagne.json', { create: false });
      })
      .then(function (fileHandle) {
        return fileHandle.createWritable();
      })
      .then(function (writable) {
        var json = JSON.stringify(campaignData, null, 2);
        return writable.write(json).then(function () {
          return writable.close();
        });
      })
      .then(function () {
        invalidateMetadataCache(campaignName);
        // L'index est un fichier dérivé (reconstructible) : un échec ici n'est pas bloquant
        // car campagne.json a déjà été écrit. On le signale sans interrompre.
        return updateCampaignIndex(rootHandle, campaignName, campaignData).catch(function (err) {
          console.warn('Mise à jour de _index.json échouée (non bloquant) :', err);
        });
      });
  }

  /**
   * Invalide l'entrée d'une campagne dans l'IndexedDB 'ImpulsionMetaCache'
   */
  function invalidateMetadataCache(campaignName) {
    try {
      var req = indexedDB.open('ImpulsionMetaCache', 1);
      req.onsuccess = function (e) {
        try {
          var tx = e.target.result.transaction('meta', 'readwrite');
          tx.objectStore('meta').delete(campaignName);
        } catch (err) { /* silencieux */ }
      };
    } catch (e) { /* silencieux */ }
  }

  // ─────────────────────────────────────────────────────────
  // INDEX DE CAMPAGNES (_index.json dans Campagnes/)
  // ─────────────────────────────────────────────────────────

  // Seuil d'alerte volume : piloté par _config.json (settings.volumeAlertThreshold).
  function volumeAlertSeuil() {
    var s = window.ImpulsionMarketing && window.ImpulsionMarketing.config && window.ImpulsionMarketing.config.APP_SETTINGS;
    return (s && typeof s.volumeAlertThreshold === 'number') ? s.volumeAlertThreshold : 100000;
  }

  /**
   * Construit un objet steps synthétique pour la rétrocompatibilité de l'index
   * (global steps + premier canal pour le dashboard)
   */
  function getEffectiveStepsForIndex(campaignData) {
    var globalSteps = campaignData.workflow.steps || {};
    var cs = campaignData.workflow.channelSteps || {};
    var firstCs = cs[0] || DEFAULT_CHANNEL_STEPS;
    return Object.assign({}, DEFAULT_CHANNEL_STEPS, firstCs, globalSteps);
  }

  // #27 — Agrège tous les champs cherchables (références canaux + champs
  // campagne) en une chaîne minuscule, pour la recherche du tableau de bord.
  function buildSearchBlob(campaignData) {
    var parts = [];
    function add(v) {
      if (!v) return;
      if (Array.isArray(v)) { v.forEach(add); return; }
      parts.push(String(v));
    }
    add(campaignData.id);
    add(campaignData.po);
    add(campaignData.coPo);
    // Personnes affectées (manager + Com/EBF/Data) : permet de rechercher par le
    // nom d'une personne et de retrouver TOUTES ses campagnes (pas que le PO).
    var _asn = (campaignData.workflow && campaignData.workflow.assignments) || {};
    add(_asn.manager); add(_asn.com); add(_asn.ebf); add(_asn.data);
    add(campaignData.description);
    add(campaignData.market);
    add(campaignData.typology);
    add(campaignData.recurrence);
    add(campaignData.segments);
    add(campaignData.ubs);
    add(campaignData.campagneLiee);
    add(campaignData.targetProducts);
    add(campaignData.targetProduct);
    add(campaignData.prospectSource);
    (campaignData.channels || []).forEach(function (c) {
      add(c.deliverableName); add(c.content); add(c.emailObject);
      add(c.comType); add(c.comTypology); add(c.targetingCriteria); add(c.ubs);
      add(c.codeCom); add(c.refParacom); add(c.codeProjet); add(c.codeAction); add(c.codeMK);
      add(c.urlTicTac); add(c.urlComStore); add(c.urlsComStore); add(c.urlLccx);
    });
    return parts.join(' ').toLowerCase();
  }

  function extractIndexEntry(campaignData) {
    initWorkflow(campaignData);
    var volumeAlert = false;
    if (campaignData.channels && campaignData.channels.length > 0) {
      for (var i = 0; i < campaignData.channels.length; i++) {
        if ((campaignData.channels[i].volumeCible || 0) > volumeAlertSeuil()) {
          volumeAlert = true;
          break;
        }
      }
    }
    var chs = (campaignData.channels || []).map(function (c) {
      return {
        deliverableName: c.deliverableName,
        content: c.content,
        comType: c.comType || '',
        siteWebDateFin: (c.siteWeb && c.siteWeb.dateFin) ? c.siteWeb.dateFin : null,
        ebfWebmaster: (c.siteWeb && c.siteWeb.webmaster) ? c.siteWeb.webmaster : null
      };
    });
    return {
      id:          campaignData.id || '',
      po:          campaignData.po || '',
      copo:        campaignData.coPo || null,
      desc:        campaignData.description || '',
      launch:      campaignData.launchDate || '',
      mkt:         campaignData.market || '',
      typ:         campaignData.typology || '',
      chs:         chs,
      mod:         Date.now(),
      asn:         Object.assign({}, campaignData.workflow.assignments),
      casn:        campaignData.workflow.channelAssignments || null,
      steps:       getEffectiveStepsForIndex(campaignData),
      // Étapes réelles par canal : indispensables pour que le tableau de bord
      // sache, canal par canal, ce qu'il reste à produire (« à produire ») —
      // `steps` ci-dessus ne résume que le canal 0.
      csteps:      campaignData.workflow.channelSteps || null,
      done:        isCompleted(campaignData),
      actif:       campaignData.actif !== false,
      volumeAlert: volumeAlert,
      requiredTeams: campaignData.requiredTeams || null,
      chprog:      getChannelProgress(campaignData),
      srch:        buildSearchBlob(campaignData)
    };
  }

  function readIndexFromDir(campaignsDir) {
    return campaignsDir.getFileHandle('_index.json', { create: false })
      .then(function (fh) { return fh.getFile(); })
      .then(function (f)  { return f.text(); })
      .then(function (text) {
        var idx = JSON.parse(text);
        if (!idx.campaigns) idx.campaigns = {};
        return idx;
      })
      .catch(function () { return { v: 1, campaigns: {} }; });
  }

  function writeIndexToDir(campaignsDir, index) {
    return campaignsDir.getFileHandle('_index.json', { create: true })
      .then(function (fh) { return fh.createWritable(); })
      .then(function (writable) {
        return writable.write(JSON.stringify(index)).then(function () {
          return writable.close();
        });
      });
  }

  function updateCampaignIndex(rootHandle, campaignName, campaignData) {
    var entry = extractIndexEntry(campaignData);
    return rootHandle.getDirectoryHandle('Campagnes')
      .then(function (dir) {
        return readIndexFromDir(dir).then(function (index) {
          index.campaigns[campaignName] = entry;
          return writeIndexToDir(dir, index).then(function () {
            var ic = window.ImpulsionMarketing &&
                     window.ImpulsionMarketing.performance &&
                     window.ImpulsionMarketing.performance.IndexCache;
            if (ic) ic.set(rootHandle.name, index);
          });
        });
      });
  }

  function updateCampaignIndexFromDir(campaignsDir, campaignName, campaignData) {
    var entry = extractIndexEntry(campaignData);
    return readIndexFromDir(campaignsDir).then(function (index) {
      index.campaigns[campaignName] = entry;
      return writeIndexToDir(campaignsDir, index);
    });
  }

  function buildFullIndex(rootHandle) {
    return rootHandle.getDirectoryHandle('Campagnes')
      .then(function (campaignsDir) {
        function collectDirs(iterator, dirs) {
          return iterator.next().then(function (res) {
            if (res.done) return dirs;
            var name   = res.value[0];
            var handle = res.value[1];
            if (handle.kind === 'directory') dirs.push({ name: name, handle: handle });
            return collectDirs(iterator, dirs);
          });
        }
        return collectDirs(campaignsDir.entries(), [])
          .then(function (dirs) {
            return Promise.all(dirs.map(function (d) {
              return d.handle.getFileHandle('campagne.json')
                .then(function (fh) { return fh.getFile(); })
                .then(function (f) {
                  return f.text().then(function (text) {
                    try { return { name: d.name, data: JSON.parse(text) }; }
                    catch (e) { return null; }
                  });
                })
                .catch(function () { return null; });
            }));
          })
          .then(function (results) {
            var index = { v: 1, campaigns: {} };
            results.filter(Boolean).forEach(function (c) {
              initWorkflow(c.data);
              index.campaigns[c.name] = extractIndexEntry(c.data);
            });
            return writeIndexToDir(campaignsDir, index).then(function () { return index; });
          });
      });
  }

  // ─────────────────────────────────────────────────────────
  // EXPORTS
  // ─────────────────────────────────────────────────────────

  return {
    STEPS:                    STEPS,
    CHANNEL_STEP_IDS:         CHANNEL_STEP_IDS,
    GLOBAL_STEP_IDS:          GLOBAL_STEP_IDS,
    isStepApplicable:         isStepApplicable,
    stepLabel:                stepLabel,
    stepActor:                stepActor,
    channelStepIds:           _channelStepIds,
    depotValidationMap:       _DEPOT_VALIDATION,
    isTeamRequired:           isTeamRequired,
    isChannelCompleted:       isChannelCompleted,
    buildSearchBlob:          buildSearchBlob,
    initWorkflow:             initWorkflow,
    advanceStep:              advanceStep,
    advanceChannelStep:       advanceChannelStep,
    requestRevision:          requestRevision,
    requestChannelRevision:   requestChannelRevision,
    reopenChannelStep:        reopenChannelStep,
    getChannelRevisionLog:    getChannelRevisionLog,
    channelAssignees:         channelAssignees,
    applyAutoAssignments:     applyAutoAssignments,
    initChannelValidations:   initChannelValidations,
    validateChannelStep:      validateChannelStep,
    refuseChannelJuridique:   refuseChannelJuridique,
    juridiqueRequired:        juridiqueRequired,
    recalcUnlocks:            recalcUnlocks,
    recalcChannelUnlocks:     recalcChannelUnlocks,
    isCompleted:              isCompleted,
    getCurrentStepLabel:      getCurrentStepLabel,
    getChannelProgress:       getChannelProgress,
    saveCampaignWorkflow:     saveCampaignWorkflow,
    captureBaseline:          captureBaseline,
    threeWayMerge:            threeWayMerge,
    getAvailableActions:      getAvailableActions,
    managerAffectationDone:   managerAffectationDone,
    updateCampaignIndex:      updateCampaignIndex,
    updateCampaignIndexFromDir: updateCampaignIndexFromDir,
    buildFullIndex:           buildFullIndex
  };
})();
