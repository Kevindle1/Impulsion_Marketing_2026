// Tests de fumée UI (Playwright) — moteur de champs personnalisés (Administration
// ▸ Champs personnalisés + intégration dans details.html et campaign.html).
//
// Comme pour smoke.spec.js, l'app n'a pas de backend réel : ces tests simulent
// le dossier de travail via un faux FileSystemDirectoryHandle (lecture/écriture
// en mémoire), suffisant pour exercer le rendu, la conditionnalité (showIf), la
// validation et la persistance en mémoire — mais pas pour valider le comportement
// réel sur un partage réseau V:// avec plusieurs utilisateurs concurrents.
//
// Lancer avec : npm run test:e2e
import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'Application');
const url = (p) => 'file://' + join(ROOT, p);

const ADMIN_USER = { name: 'Test Admin', role: 'superadmin', roleLabel: 'Super Admin', isSuperAdmin: true, isManager: true };
const PO_USER = { name: 'Alice PO', role: 'marketing', roleLabel: 'Marketing', isSuperAdmin: true, isManager: true };

function collectPageErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  return errors;
}

async function seedUser(page, user, extraConfig) {
  await page.addInitScript(([u, cfg]) => {
    window.localStorage.setItem('im_current_user', JSON.stringify(u));
    window.localStorage.setItem('im_config_cache', JSON.stringify(Object.assign({ users: [u] }, cfg)));
  }, [user, extraConfig || {}]);
}

// Installe un faux directoryStorage.getRootHandleWithCheck() qui réussit toujours,
// avec un FileSystemDirectoryHandle en mémoire : Campagnes/<name>/campagne.json
// pré-rempli si fourni, toute autre lecture échoue proprement (dossier vide),
// toute écriture (create:true) réussit silencieusement en mémoire.
async function installFakeDirectory(page, campaignsByName) {
  await page.addInitScript((campaigns) => {
    function makeFakeFile(initial) {
      var content = initial;
      return {
        getFile: function () { return Promise.resolve({ text: function () { return Promise.resolve(content); } }); },
        createWritable: function () {
          return Promise.resolve({
            write: function (data) { if (typeof data === 'string') content = data; return Promise.resolve(); },
            close: function () { return Promise.resolve(); }
          });
        }
      };
    }
    function makeEmptyDir() {
      return {
        getDirectoryHandle: function () { return Promise.resolve(makeEmptyDir()); },
        getFileHandle: function (name, opts) {
          if (opts && opts.create) return Promise.resolve(makeFakeFile(''));
          return Promise.reject(new Error('not found: ' + name));
        }
      };
    }
    var campaignFiles = {};
    Object.keys(campaigns || {}).forEach(function (name) {
      campaignFiles[name] = makeFakeFile(JSON.stringify(campaigns[name], null, 2));
    });
    window.__campaignFiles = campaignFiles;
    function campaignDir(name) {
      return {
        getDirectoryHandle: function () { return Promise.resolve(makeEmptyDir()); },
        getFileHandle: function (fname, opts) {
          if (fname === 'campagne.json' && campaignFiles[name]) return Promise.resolve(campaignFiles[name]);
          if (opts && opts.create) return Promise.resolve(makeFakeFile(''));
          return Promise.reject(new Error('not found: ' + fname));
        }
      };
    }
    var indexFile = makeFakeFile('{}');
    function campagnesDir() {
      return {
        getDirectoryHandle: function (name) { return Promise.resolve(campaignDir(name)); },
        getFileHandle: function (fname, opts) {
          if (fname === '_index.json') return Promise.resolve(indexFile);
          if (opts && opts.create) return Promise.resolve(makeFakeFile(''));
          return Promise.reject(new Error('not found: ' + fname));
        }
      };
    }
    var fakeRoot = {
      name: 'FakeRoot',
      getDirectoryHandle: function (name) { return name === 'Campagnes' ? Promise.resolve(campagnesDir()) : Promise.resolve(makeEmptyDir()); },
      getFileHandle: function () { return Promise.reject(new Error('n/a')); }
    };
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      var IM = window.ImpulsionMarketing;
      if (IM && IM.directoryStorage) {
        clearInterval(iv);
        IM.directoryStorage.getRootHandleWithCheck = function () { return Promise.resolve({ handle: fakeRoot, status: 'success' }); };
      } else if (tries > 200) clearInterval(iv);
    }, 1);
  }, campaignsByName || {});
}

// ─────────────────────────────────────────────────────────────
// Admin : Champs personnalisés
// ─────────────────────────────────────────────────────────────
test.describe('Administration ▸ Champs personnalisés', () => {
  test('ajoute un champ de chaque type sur un point d\'attache sans erreur', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, ADMIN_USER);
    await installFakeDirectory(page, {});
    await page.goto(url('pages/admin.html'));
    await page.waitForTimeout(1200);

    await page.locator('[data-tab="customfields"]').click();
    await page.waitForTimeout(300);
    await page.locator('[data-cf-open-point]').first().click();
    await page.waitForTimeout(200);

    const types = ['text', 'textarea', 'url', 'number', 'date', 'select', 'radio', 'checkbox', 'checkbox-group', 'list', 'richtext', 'file'];
    for (let i = 0; i < types.length; i++) {
      await page.locator('#cf-add-field').click();
      await page.waitForTimeout(80);
      const idInput = page.locator(`[data-cfid="${i}"]`);
      await idInput.fill('champ_' + types[i]);
      await page.locator(`[data-cfl="${i}"]`).fill('Champ ' + types[i]);
      await page.locator(`[data-cft="${i}"]`).selectOption(types[i]);
      await page.waitForTimeout(50);
    }
    console.log('errors after adding 12 field types:', errors);
    expect(errors).toEqual([]);
    expect(await page.locator('[data-cfid]').count()).toBe(types.length);
  });

  test('bloque l\'enregistrement sur un identifiant technique en double', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, ADMIN_USER);
    await installFakeDirectory(page, {});
    await page.goto(url('pages/admin.html'));
    await page.waitForTimeout(1200);
    await page.locator('[data-tab="customfields"]').click();
    await page.waitForTimeout(300);
    await page.locator('[data-cf-open-point]').first().click();
    await page.waitForTimeout(200);

    for (let i = 0; i < 2; i++) {
      await page.locator('#cf-add-field').click();
      await page.waitForTimeout(80);
      await page.locator(`[data-cfid="${i}"]`).fill('meme_id');
      await page.locator(`[data-cfl="${i}"]`).fill('Champ ' + i);
    }

    let dialogMessage = '';
    page.once('dialog', async (d) => { dialogMessage = d.message(); await d.accept(); });
    await page.locator('#save-customfields').click();
    await page.waitForTimeout(300);
    console.log('message d\'alerte doublon:', dialogMessage);
    expect(dialogMessage).toMatch(/double/i);
    expect(errors).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────
// details.html : rendu réel des champs perso par étape, showIf, liste répétable,
// filtrage par type de canal.
// ─────────────────────────────────────────────────────────────
test.describe('details.html — champs personnalisés', () => {
  function baseCampaign(channelContent) {
    return {
      id: 'CF Details Test', description: 'x', po: PO_USER.name,
      launchDate: '2026-09-01', instantiation: '2026-08-01', typology: 'Commerciale',
      market: 'part', recurrence: 'Ponctuelle', requiredTeams: ['Marketing', 'Com', 'Data'],
      channels: [
        { content: channelContent, deliverableLabel: 'Test', deliverableName: channelContent + ' - Test', comType: 'Commerciales', targetingCriteria: 'Tous', comTypology: 'Création Caisse' }
      ],
      workflow: {
        steps: { po_saisie: 'completed', manager_affectation: 'completed', po_kickoff: 'completed' },
        assignments: { com: [PO_USER.name], ebf: [PO_USER.name], data: [PO_USER.name] },
        channelSteps: { 0: { com_maquette: 'pending', po_validation_maquette: 'locked', ebf_bat: 'locked', po_validation_bat: 'locked', data_ciblage: 'pending', po_validation_ciblage: 'locked' } },
        channelDates: {}, channelRevisionComments: {}
      }
    };
  }

  test('showIf : le champ dépendant apparaît/disparaît en direct selon le champ déclencheur', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, {
      customFields: {
        com_maquette: [
          { id: 'avecNote', label: 'Ajouter une note', type: 'checkbox', order: 1 },
          { id: 'noteTexte', label: 'Texte de la note', type: 'text', order: 2, showIf: { field: 'avecNote', op: 'checked' } }
        ]
      }
    });
    await installFakeDirectory(page, { 'Test Campagne CF': baseCampaign('MAIL') });
    await page.goto(url('pages/details.html?name=' + encodeURIComponent('Test Campagne CF')));
    await page.waitForTimeout(1200);
    await page.locator('#nav-item-0').click();
    await page.waitForTimeout(400);

    const noteField = page.locator('[data-cf-field="noteTexte"]');
    // Le champ existe dans le DOM (rendu) mais sa carte est masquée (showIf faux).
    await expect(noteField).toHaveCount(1);
    const row = page.locator('[data-cf-row="noteTexte"]');
    await expect(row).toBeHidden();

    await page.locator('[data-cf-field="avecNote"]').check();
    await page.waitForTimeout(200);
    await expect(row).toBeVisible();

    await page.locator('[data-cf-field="avecNote"]').uncheck();
    await page.waitForTimeout(200);
    await expect(row).toBeHidden();
    console.log('errors (showIf com_maquette):', errors);
    expect(errors).toEqual([]);
  });

  test('liste répétable (type list) : ajout/suppression de lignes', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, {
      customFields: { com_maquette: [{ id: 'refs', label: 'Références', type: 'list', itemType: 'text', order: 1 }] }
    });
    await installFakeDirectory(page, { 'Test Campagne CF': baseCampaign('MAIL') });
    await page.goto(url('pages/details.html?name=' + encodeURIComponent('Test Campagne CF')));
    await page.waitForTimeout(1200);
    await page.locator('#nav-item-0').click();
    await page.waitForTimeout(400);

    const list = page.locator('.cf-list[data-cf-list="refs"]');
    await expect(list.locator('.cf-list-row')).toHaveCount(1);
    await list.locator('.cf-list-add').click();
    await list.locator('.cf-list-add').click();
    await expect(list.locator('.cf-list-row')).toHaveCount(3);
    const items = list.locator('.cf-list-item');
    await items.nth(0).fill('Réf 1');
    await items.nth(1).fill('Réf 2');
    await list.locator('.cf-list-remove').nth(1).click();
    await expect(list.locator('.cf-list-row')).toHaveCount(2);
    console.log('errors (list add/remove):', errors);
    expect(errors).toEqual([]);
  });

  test('restriction par type de canal : un champ MDC-only n\'apparaît pas sur un canal MAIL', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, {
      customFields: {
        data_ciblage: [
          { id: 'mdcOnly', label: 'Spécifique MDC', type: 'text', order: 1, canalTypes: ['MDC'] },
          { id: 'general', label: 'Champ général', type: 'text', order: 2 }
        ]
      }
    });
    await installFakeDirectory(page, { 'Test Campagne CF': baseCampaign('MAIL') });
    await page.goto(url('pages/details.html?name=' + encodeURIComponent('Test Campagne CF')));
    await page.waitForTimeout(1200);
    await page.locator('#nav-item-0').click();
    await page.waitForTimeout(400);

    expect(await page.locator('[data-cf-field="mdcOnly"]').count()).toBe(0);
    expect(await page.locator('[data-cf-field="general"]').count()).toBe(1);
    console.log('errors (canalTypes filter, data_ciblage/MAIL):', errors);
    expect(errors).toEqual([]);
  });

  test('checkbox-group : sélection multiple collectée correctement (pas d\'erreur JS)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, {
      customFields: { com_maquette: [{ id: 'options', label: 'Options', type: 'checkbox-group', options: ['A', 'B', 'C'], order: 1 }] }
    });
    await installFakeDirectory(page, { 'Test Campagne CF': baseCampaign('MAIL') });
    await page.goto(url('pages/details.html?name=' + encodeURIComponent('Test Campagne CF')));
    await page.waitForTimeout(1200);
    await page.locator('#nav-item-0').click();
    await page.waitForTimeout(400);

    await page.locator('[data-cf-field="options"][data-cf-group-value="A"]').check();
    await page.locator('[data-cf-field="options"][data-cf-group-value="C"]').check();
    await page.locator('.btn-save-com[data-ch="0"]').click();
    await page.waitForTimeout(600);
    console.log('errors (checkbox-group save):', errors);
    expect(errors).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────
// campaign.html : filtrage par type de canal dans le formulaire de création.
// ─────────────────────────────────────────────────────────────
test.describe('campaign.html — champs personnalisés', () => {
  test('un champ restreint à MDC n\'apparaît que pour ce type de canal', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, {
      customFields: { 'creation.step3.canal': [{ id: 'mdcField', label: 'Champ MDC', type: 'text', order: 1, canalTypes: ['MDC'] }] },
      canaux: ['MAIL', 'MDC']
    });
    await installFakeDirectory(page, {});
    await page.goto(url('pages/campaign.html'));
    await page.waitForTimeout(1200);

    await page.evaluate(() => (window.generateChannelFields ? window.generateChannelFields(1) : generateChannelFields(1)));
    await page.waitForTimeout(300);
    expect(await page.locator('[data-cf-field="mdcField"]').count()).toBe(0);

    // L'étape 4 (canaux) n'est pas l'étape active du wizard ici (on a généré ses
    // champs directement, sans naviguer) — le <select> existe mais n'est pas
    // "visible" au sens Playwright ; on pilote donc sa valeur par JS, comme le
    // ferait un vrai choix utilisateur une fois l'étape affichée (même événement
    // 'change' déclenché).
    await page.evaluate(() => {
      var el = document.getElementById('channelContent1');
      el.value = 'MDC';
      el.dispatchEvent(new Event('change'));
    });
    await page.waitForTimeout(300);
    expect(await page.locator('[data-cf-field="mdcField"]').count()).toBe(1);

    await page.evaluate(() => {
      var el = document.getElementById('channelContent1');
      el.value = 'MAIL';
      el.dispatchEvent(new Event('change'));
    });
    await page.waitForTimeout(300);
    expect(await page.locator('[data-cf-field="mdcField"]').count()).toBe(0);
    console.log('errors (campaign.html canalTypes filter):', errors);
    expect(errors).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────
// Sécurité de la migration des champs déjà en place (creation.step1) : le
// scénario le plus critique — une campagne réelle, créée AVANT ce chantier, sur
// une config _config.json qui n'a JAMAIS entendu parler de customFields (« Données
// de production » ne se redéploie pas avec le code). Elle doit continuer à
// s'ouvrir, s'afficher et se sauvegarder EXACTEMENT comme avant.
// ─────────────────────────────────────────────────────────────
test.describe('creation.step1 — migration sans casser les campagnes existantes', () => {
  const EXISTING_CAMPAIGN = {
    id: 'CampagneExistanteProd',
    description: 'Une vraie campagne déjà créée avant la migration',
    po: PO_USER.name,
    launchDate: '2026-10-15',
    instantiation: '2026-08-01',
    kickoffDate: '2026-09-01',
    typology: 'Commerciale',
    market: 'part',
    recurrence: 'Ponctuelle',
    requiredTeams: ['Marketing', 'Com'],
    channels: [],
    actif: true
  };

  test('une campagne au format à plat (sans customFieldValues), config customFields absente, se pré-remplit et se sauvegarde à l\'identique', async ({ page }) => {
    const errors = collectPageErrors(page);
    // Aucune clé "customFields" dans la config — simule un _config.json de prod
    // qui n'a jamais été mis à jour pour cette fonctionnalité.
    await seedUser(page, PO_USER, { typologies: ['Commerciale', 'Gestion'], marches: ['part', 'pro'], recurrences: ['Ponctuelle', 'Récurrente'] });
    await installFakeDirectory(page, { [EXISTING_CAMPAIGN.id]: EXISTING_CAMPAIGN });
    await page.goto(url('pages/campaign.html?edit=' + encodeURIComponent(EXISTING_CAMPAIGN.id)));
    // Attend le champ généré (plutôt qu'un délai fixe) : plus robuste sous charge
    // (exécution parallèle de la suite complète).
    await expect(page.locator('#taskName')).toHaveValue(EXISTING_CAMPAIGN.id, { timeout: 10000 });
    await expect(page.locator('#description')).toHaveValue(EXISTING_CAMPAIGN.description);
    await expect(page.locator('#launchDate')).toHaveValue(EXISTING_CAMPAIGN.launchDate);
    await expect(page.locator('#kickoffDate')).toHaveValue(EXISTING_CAMPAIGN.kickoffDate);
    await expect(page.locator('#typology')).toHaveValue(EXISTING_CAMPAIGN.typology);
    await expect(page.locator('#market')).toHaveValue(EXISTING_CAMPAIGN.market);
    await expect(page.locator('#recurrence')).toHaveValue(EXISTING_CAMPAIGN.recurrence);
    await expect(page.locator('input[name="kickoffNeeded"][value="Oui"]')).toBeChecked();
    await expect(page.locator('#kickoffDate')).toBeVisible();

    await page.locator('#description').fill('Description modifiée par le test');
    await page.evaluate(() => window.createCampaign());
    await page.waitForTimeout(800);

    const savedJson = await page.evaluate(() => window.__campaignFiles[Object.keys(window.__campaignFiles)[0]].getFile().then((f) => f.text()));
    const saved = JSON.parse(savedJson);
    expect(saved.description).toBe('Description modifiée par le test');
    expect(saved.id).toBe(EXISTING_CAMPAIGN.id);
    expect(saved.launchDate).toBe(EXISTING_CAMPAIGN.launchDate);
    expect(saved.typology).toBe(EXISTING_CAMPAIGN.typology);
    // Pas de copie redondante des champs migrés dans customFieldValues.
    expect(saved.customFieldValues && saved.customFieldValues['creation.step1']).toEqual({});

    console.log('errors (migration creation.step1, campagne existante):', errors);
    expect(errors).toEqual([]);
  });

  test('nouvelle campagne (création) : kick-off "Non" pré-coché par défaut, champs vides', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, { typologies: ['Commerciale'], marches: ['part'], recurrences: ['Ponctuelle'] });
    await installFakeDirectory(page, {});
    await page.goto(url('pages/campaign.html'));
    await page.locator('#taskName').waitFor({ state: 'attached', timeout: 10000 });

    await expect(page.locator('input[name="kickoffNeeded"][value="Non"]')).toBeChecked({ timeout: 10000 });
    await expect(page.locator('#kickoffDate')).toBeHidden();
    await expect(page.locator('#taskName')).toHaveValue('');
    console.log('errors (nouvelle campagne, defaults):', errors);
    expect(errors).toEqual([]);
  });

  test('validateStep bloque toujours l\'étape 1 si un champ migré obligatoire est vide', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, { typologies: ['Commerciale'], marches: ['part'], recurrences: ['Ponctuelle'] });
    await installFakeDirectory(page, {});
    await page.goto(url('pages/campaign.html'));
    await page.locator('#taskName').waitFor({ state: 'attached', timeout: 10000 });

    // taskName vide → doit rester bloqué sur l'étape 1.
    await page.locator('.form-step[data-step="1"] button.btn-next').click({ timeout: 10000 });
    await page.waitForTimeout(300);
    await expect(page.locator('.form-step[data-step="1"]')).toHaveClass(/active/);
    console.log('errors (validateStep blocage champ migré):', errors);
    expect(errors).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────
// Lot 2 : creation.step2 (cibleProspect, prospectSource, persona).
// ─────────────────────────────────────────────────────────────
test.describe('creation.step2 — migration sans casser les campagnes existantes', () => {
  const EXISTING_CAMPAIGN = {
    id: 'CampagneSegExistante',
    description: 'x', po: PO_USER.name, launchDate: '2026-10-15', instantiation: '2026-08-01',
    typology: 'Commerciale', market: 'part', recurrence: 'Ponctuelle', requiredTeams: ['Marketing'],
    cibleProspect: true, prospectSource: 'Courriers refus EER', persona: 'Primo-accédant',
    channels: [], actif: true
  };

  test('campagne existante (cibleProspect=true), config customFields absente : pré-remplissage + conditionnalité corrects', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, { typologies: ['Commerciale'], marches: ['part'], recurrences: ['Ponctuelle'] });
    await installFakeDirectory(page, { [EXISTING_CAMPAIGN.id]: EXISTING_CAMPAIGN });
    await page.goto(url('pages/campaign.html?edit=' + encodeURIComponent(EXISTING_CAMPAIGN.id)));
    await expect(page.locator('#taskName')).toHaveValue(EXISTING_CAMPAIGN.id, { timeout: 10000 });
    // Étape 2 pas encore active par défaut (la page ouvre sur l'étape 1) — un champ
    // sur une étape inactive est masqué par le CSS du wizard, sans rapport avec la
    // conditionnalité (showIf) qu'on veut vérifier ici.
    await page.locator('.form-step[data-step="1"] button.btn-next').click();

    await expect(page.locator('#cibleProspect')).toBeChecked();
    await expect(page.locator('#prospectSource')).toBeVisible();
    await expect(page.locator('#prospectSource')).toHaveValue(EXISTING_CAMPAIGN.prospectSource);
    await expect(page.locator('#persona')).toHaveValue(EXISTING_CAMPAIGN.persona);
    console.log('errors (migration creation.step2, campagne existante):', errors);
    expect(errors).toEqual([]);
  });

  test('la restauration de brouillon (new Event("change") sans bubbles) déclenche bien la conditionnalité (phase de capture)', async ({ page }) => {
    // Reproduit exactement le mécanisme existant de applyDraft() (autosave) :
    // el.dispatchEvent(new Event('change')) SANS {bubbles:true} — vérifie que la
    // correction (écoute en phase de capture dans wireFields) fonctionne pour un
    // événement déclenché par du code externe au moteur, pas par un vrai clic.
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, { typologies: ['Commerciale'], marches: ['part'], recurrences: ['Ponctuelle'] });
    await installFakeDirectory(page, {});
    await page.goto(url('pages/campaign.html'));
    await page.locator('#cibleProspect').waitFor({ state: 'attached', timeout: 10000 });
    // Active directement l'étape 2 (on ne teste pas ici la navigation du wizard,
    // seulement la conditionnalité showIf — l'étape 1 est vide et bloquerait un
    // vrai clic sur "Suivant").
    await page.evaluate(() => {
      document.querySelector('.form-step[data-step="1"]').classList.remove('active');
      document.querySelector('.form-step[data-step="2"]').classList.add('active');
    });

    await expect(page.locator('#prospectSource')).toBeHidden();
    await page.evaluate(() => {
      var el = document.getElementById('cibleProspect');
      el.checked = true;
      el.dispatchEvent(new Event('change')); // pas de {bubbles:true}, comme applyDraft()
    });
    await expect(page.locator('#prospectSource')).toBeVisible();
    console.log('errors (dispatchEvent non-bouillonnant, phase de capture):', errors);
    expect(errors).toEqual([]);
  });
});
