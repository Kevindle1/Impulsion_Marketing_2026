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
    'com_maquette', 'po_validation_maquette',
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

    if (s.po_kickoff === 'locked' && s.manager_affectation === 'validated' && !anyChannelStarted) {
      s.po_kickoff = 'pending';
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
      var chType = campaignData.channels && campaignData.channels[i] && campaignData.channels[i].type;
      cs[i] = recalcChannelUnlocks(cs[i], campaignData.workflow.steps, campaignData.requiredTeams, chType);
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
  function recalcChannelUnlocks(cs, globalSteps, requiredTeams, channelType) {
    var reqCom  = isTeamRequired(requiredTeams, 'Com');
    var reqEbf  = isTeamRequired(requiredTeams, 'EBF');
    var reqData = isTeamRequired(requiredTeams, 'Data');
    var isLP    = channelType === 'LP';

    var kickoffDone = globalSteps && (globalSteps.po_kickoff === 'validated');

    // ── Après kickoff : débloquer les premières étapes ──
    if (kickoffDone) {
      if (reqCom  && cs.com_maquette === 'locked') cs.com_maquette = 'pending';
      if (reqData && cs.data_ciblage === 'locked') cs.data_ciblage = 'pending';
      // EBF sans Com → BAT se débloque directement après kickoff
      if (reqEbf && !reqCom && cs.ebf_bat === 'locked') cs.ebf_bat = 'pending';
    }

    // ── Chaîne Com ──
    if (reqCom && cs.com_maquette === 'submitted' && cs.po_validation_maquette === 'locked') {
      cs.po_validation_maquette = 'pending';
    }

    // ── Chaîne EBF ──
    // ebf_bat se débloque quand :
    // - Com requise : après po_validation_maquette validée
    // - Com non requise : déjà géré ci-dessus (après kickoff)
    if (reqEbf && reqCom) {
      var comValidated = cs.po_validation_maquette === 'validated' || cs.po_validation_maquette === 'completed';
      if (comValidated && cs.ebf_bat === 'locked') cs.ebf_bat = 'pending';
    }
    if (reqEbf && cs.ebf_bat === 'submitted' && cs.po_validation_bat === 'locked') {
      cs.po_validation_bat = 'pending';
    }

    // ── Chaîne Data ──
    if (reqData && cs.data_ciblage === 'submitted' && cs.po_validation_ciblage === 'locked') {
      cs.po_validation_ciblage = 'pending';
    }

    // ── Canal LP : Test en prod EBF déverrouillé directement après BAT, puis MEP EBF ──
    if (isLP && reqEbf) {
      var batDoneLP = cs.po_validation_bat === 'validated' || cs.po_validation_bat === 'completed';
      if (batDoneLP && cs.ebf_test_prod === 'locked') cs.ebf_test_prod = 'pending';
      if (cs.ebf_test_prod === 'submitted' && cs.po_validation_test_prod === 'locked') {
        cs.po_validation_test_prod = 'pending';
      }
      var testProdValidatedLP = cs.po_validation_test_prod === 'validated' || cs.po_validation_test_prod === 'completed';
      if (testProdValidatedLP && cs.ebf_mise_en_prod === 'locked') cs.ebf_mise_en_prod = 'pending';
    }

    // ── Étapes communes EBF+Data (hors LP) ──
    if (reqEbf && reqData && !isLP) {
      var batDone     = cs.po_validation_bat     === 'validated' || cs.po_validation_bat     === 'completed';
      var ciblageDone = cs.po_validation_ciblage === 'validated' || cs.po_validation_ciblage === 'completed';
      if (batDone && ciblageDone && cs.data_lancement_test === 'locked') {
        cs.data_lancement_test = 'pending';
      }
      var ltDone = cs.data_lancement_test === 'submitted' || cs.data_lancement_test === 'validated' || cs.data_lancement_test === 'completed';
      if (ltDone && cs.ebf_test_prod === 'locked') {
        cs.ebf_test_prod = 'pending';
      }
      if (cs.ebf_test_prod === 'submitted' && cs.po_validation_test_prod === 'locked') {
        cs.po_validation_test_prod = 'pending';
      }
      var testProdValidated = cs.po_validation_test_prod === 'validated' || cs.po_validation_test_prod === 'completed';
      if (testProdValidated && cs.data_mise_en_prod === 'locked') {
        cs.data_mise_en_prod = 'pending';
      }
    }

    // ── MEP : Data seul (sans EBF) → après po_validation_ciblage ──
    if (reqData && !reqEbf) {
      var ciblageDone2 = cs.po_validation_ciblage === 'validated' || cs.po_validation_ciblage === 'completed';
      if (ciblageDone2 && cs.data_mise_en_prod === 'locked') {
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
        var chTypeG = campaignData.channels && campaignData.channels[i] && campaignData.channels[i].type;
        cs[i] = recalcChannelUnlocks(cs[i], campaignData.workflow.steps, campaignData.requiredTeams, chTypeG);
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
    var chTypeC = campaignData.channels && campaignData.channels[channelIdx] && campaignData.channels[channelIdx].type;
    cs[channelIdx] = recalcChannelUnlocks(cs[channelIdx], campaignData.workflow.steps, campaignData.requiredTeams, chTypeC);
    return campaignData;
  }

  /**
   * Demande une modification sur une étape canal (PO → acteur)
   * Met à jour channelSteps[channelIdx] et stocke le commentaire
   */
  function requestChannelRevision(campaignData, poStepId, sourceStepId, channelIdx, comment) {
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
  function isChannelCompleted(channelSteps, requiredTeams, channelType) {
    var reqCom  = isTeamRequired(requiredTeams, 'Com');
    var reqEbf  = isTeamRequired(requiredTeams, 'EBF');
    var reqData = isTeamRequired(requiredTeams, 'Data');
    var isLP    = channelType === 'LP';

    if (isLP && reqEbf) {
      return channelSteps.ebf_mise_en_prod === 'completed';
    }
    if (reqData) {
      return channelSteps.data_mise_en_prod === 'completed';
    }
    if (reqEbf) {
      return channelSteps.po_validation_bat === 'validated' || channelSteps.po_validation_bat === 'completed';
    }
    if (reqCom) {
      return channelSteps.po_validation_maquette === 'validated' || channelSteps.po_validation_maquette === 'completed';
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
      var chTypeI = campaignData.channels && campaignData.channels[i] && campaignData.channels[i].type;
      if (!cs[i] || !isChannelCompleted(cs[i], campaignData.requiredTeams, chTypeI)) return false;
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
      for (var ci = 0; ci < numChannels; ci++) {
        if (!cs[ci]) continue;
        var status = cs[ci][stepId];
        if (status === 'pending' || status === 'submitted' || status === 'revision_requested') {
          if (status === 'submitted')          return 'En validation : ' + STEPS[si].label;
          if (status === 'revision_requested') return 'Révision : ' + STEPS[si].label;
          return STEPS[si].label;
        }
      }
    }
    return 'En cours';
  }

  /**
   * Retourne la liste des étapes disponibles pour un utilisateur sur une campagne
   * Agrège toutes les étapes actives de tous les canaux
   */
  function getAvailableActions(currentUser, campaignData) {
    if (!currentUser || !campaignData) return [];
    initWorkflow(campaignData);

    var actions = [];
    var globalSteps = campaignData.workflow.steps;
    var assignments = campaignData.workflow.assignments || {};

    // Étapes globales
    STEPS.slice(0, 3).forEach(function (step) {
      var status = globalSteps[step.id] || 'locked';
      if (status !== 'pending' && status !== 'revision_requested') return;
      var actorMatch = false;
      if (step.actor === 'po') {
        actorMatch = currentUser.name === campaignData.po;
      } else if (step.actor === 'manager') {
        actorMatch = currentUser.isManager === true;
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
        var actorMatch = false;
        if (step.actor === 'po') {
          actorMatch = currentUser.name === campaignData.po;
        } else {
          var assigned = assignments[step.actor];
          var assignedArr = Array.isArray(assigned) ? assigned : (assigned ? [assigned] : []);
          actorMatch = assignedArr.indexOf(currentUser.name) !== -1;
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

  /**
   * Sauvegarde campagne.json avec le workflow mis à jour
   */
  function saveCampaignWorkflow(rootHandle, campaignName, campaignData) {
    return rootHandle.getDirectoryHandle('Campagnes')
      .then(function (campagnesDir) {
        return campagnesDir.getDirectoryHandle(campaignName);
      })
      .then(function (campaignDir) {
        return campaignDir.getFileHandle('campagne.json', { create: false });
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

  var VOLUME_ALERT_SEUIL = 100000;

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

  function extractIndexEntry(campaignData) {
    initWorkflow(campaignData);
    var volumeAlert = false;
    if (campaignData.channels && campaignData.channels.length > 0) {
      for (var i = 0; i < campaignData.channels.length; i++) {
        if ((campaignData.channels[i].volumeCible || 0) > VOLUME_ALERT_SEUIL) {
          volumeAlert = true;
          break;
        }
      }
    }
    var chs = (campaignData.channels || []).map(function (c) {
      return {
        deliverableName: c.deliverableName,
        content: c.content,
        siteWebDateFin: (c.siteWeb && c.siteWeb.dateFin) ? c.siteWeb.dateFin : null,
        ebfWebmaster: (c.siteWeb && c.siteWeb.webmaster) ? c.siteWeb.webmaster : null
      };
    });
    return {
      id:          campaignData.id || '',
      po:          campaignData.po || '',
      desc:        campaignData.description || '',
      launch:      campaignData.launchDate || '',
      mkt:         campaignData.market || '',
      typ:         campaignData.typology || '',
      chs:         chs,
      mod:         Date.now(),
      asn:         Object.assign({}, campaignData.workflow.assignments),
      steps:       getEffectiveStepsForIndex(campaignData),
      done:        isCompleted(campaignData),
      actif:       campaignData.actif !== false,
      volumeAlert: volumeAlert,
      requiredTeams: campaignData.requiredTeams || null
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
    isTeamRequired:           isTeamRequired,
    isChannelCompleted:       isChannelCompleted,
    initWorkflow:             initWorkflow,
    advanceStep:              advanceStep,
    advanceChannelStep:       advanceChannelStep,
    requestRevision:          requestRevision,
    requestChannelRevision:   requestChannelRevision,
    initChannelValidations:   initChannelValidations,
    validateChannelStep:      validateChannelStep,
    recalcUnlocks:            recalcUnlocks,
    recalcChannelUnlocks:     recalcChannelUnlocks,
    isCompleted:              isCompleted,
    getCurrentStepLabel:      getCurrentStepLabel,
    saveCampaignWorkflow:     saveCampaignWorkflow,
    getAvailableActions:      getAvailableActions,
    updateCampaignIndex:      updateCampaignIndex,
    updateCampaignIndexFromDir: updateCampaignIndexFromDir,
    buildFullIndex:           buildFullIndex
  };
})();
