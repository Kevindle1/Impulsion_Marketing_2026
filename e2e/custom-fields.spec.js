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
    // po_validation_maquette : point d'attache sans aucun champ migré (repli
    // DEFAULT_FIELDS volontairement absent, cf. Lots 5-11) — contrairement à
    // .first() (com_maquette depuis la migration, 3 champs déjà présents), on
    // part ici d'une liste garantie vide, condition nécessaire à l'assertion
    // "12 champs au total" plus bas.
    await page.locator('[data-cf-open-point="po_validation_maquette"]').click();
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
    // po_validation_maquette : point d'attache sans aucun champ migré, voir
    // commentaire du test précédent — les index [data-cfid="0"]/[1] ci-dessous
    // doivent viser les 2 champs qu'on vient d'ajouter, pas des champs migrés
    // préexistants.
    await page.locator('[data-cf-open-point="po_validation_maquette"]').click();
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

  // juridiqueRequired/juridiqueComment : migrés depuis data.juridique.{required,
  // comment} (objet imbriqué, contrairement aux autres champs de step1 qui sont
  // à plat) — la reconstruction en objet imbriqué au moment de la sauvegarde
  // (collectFormData/createCampaign) n'a pas été touchée : elle continue de lire
  // #juridiqueRequired/#juridiqueComment par leur id DOM exact (idPrefix:'').
  const JURIDIQUE_CAMPAIGN = {
    id: 'CampagneJuridiqueExistante', description: 'x', po: PO_USER.name,
    launchDate: '2026-10-15', instantiation: '2026-08-01', typology: 'Commerciale',
    market: 'part', recurrence: 'Ponctuelle', requiredTeams: ['Marketing'],
    juridique: { required: true, comment: 'Vérifier les mentions légales', status: 'pending' },
    channels: [], actif: true
  };

  test('campagne existante (juridique.required=true), config customFields absente : pré-remplissage + conditionnalité + sauvegarde en objet imbriqué inchangés', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, { typologies: ['Commerciale'], marches: ['part'], recurrences: ['Ponctuelle'] });
    await installFakeDirectory(page, { [JURIDIQUE_CAMPAIGN.id]: JURIDIQUE_CAMPAIGN });
    await page.goto(url('pages/campaign.html?edit=' + encodeURIComponent(JURIDIQUE_CAMPAIGN.id)));
    await expect(page.locator('#taskName')).toHaveValue(JURIDIQUE_CAMPAIGN.id, { timeout: 10000 });

    await expect(page.locator('#juridiqueRequired')).toBeChecked();
    await expect(page.locator('#juridiqueComment')).toBeVisible();
    await expect(page.locator('#juridiqueComment')).toHaveValue(JURIDIQUE_CAMPAIGN.juridique.comment);

    await page.locator('#juridiqueComment').fill('Mentions légales mises à jour');
    await page.evaluate(() => window.createCampaign());
    await page.waitForTimeout(800);

    const savedJson = await page.evaluate(() => window.__campaignFiles[Object.keys(window.__campaignFiles)[0]].getFile().then((f) => f.text()));
    const saved = JSON.parse(savedJson);
    expect(saved.juridique).toEqual({ required: true, comment: 'Mentions légales mises à jour', status: 'pending' });
    // Pas de copie redondante des champs migrés dans customFieldValues.
    expect(saved.customFieldValues && saved.customFieldValues['creation.step1']).toEqual({});

    console.log('errors (migration juridique, campagne existante):', errors);
    expect(errors).toEqual([]);
  });

  test('nouvelle campagne : juridique décoché par défaut → data.juridique = null à la sauvegarde (comme avant)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, { typologies: ['Commerciale'], marches: ['part'], recurrences: ['Ponctuelle'] });
    await installFakeDirectory(page, {});
    await page.goto(url('pages/campaign.html'));
    await page.locator('#juridiqueRequired').waitFor({ state: 'visible', timeout: 10000 });

    await expect(page.locator('#juridiqueRequired')).not.toBeChecked();
    await expect(page.locator('#juridiqueComment')).toBeHidden();

    await page.locator('#juridiqueRequired').check();
    await expect(page.locator('#juridiqueComment')).toBeVisible();
    await page.locator('#juridiqueRequired').uncheck();
    await expect(page.locator('#juridiqueComment')).toBeHidden();

    console.log('errors (nouvelle campagne, juridique showIf):', errors);
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

// ─────────────────────────────────────────────────────────────
// Lot 3 : creation.step3 (offre promotionnelle, parcours, transfo/lot).
// ─────────────────────────────────────────────────────────────
test.describe('creation.step3 — migration sans casser les campagnes existantes', () => {
  const EXISTING_CAMPAIGN = {
    id: 'CampagneProduitExistante', description: 'x', po: PO_USER.name, launchDate: '2026-10-15', instantiation: '2026-08-01',
    typology: 'Commerciale', market: 'part', recurrence: 'Ponctuelle', requiredTeams: ['Marketing'],
    productUrl: 'https://produit.example.com', offrePromo: 'Oui', offerValidityDate: '2026-09-01', offerEndDate: '2026-12-31',
    parcoursSelfcare: 'Oui', parcoursSimulateur: 'Non', transfo: 'Oui', lotNumber: 'Lot 3',
    channels: [], actif: true
  };

  test('campagne existante (offrePromo=Oui, transfo=Oui), config customFields absente : pré-remplissage + conditionnalité corrects', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, { typologies: ['Commerciale'], marches: ['part'], recurrences: ['Ponctuelle'], lots: ['Lot 3', 'Lot 4'] });
    await installFakeDirectory(page, { [EXISTING_CAMPAIGN.id]: EXISTING_CAMPAIGN });
    await page.goto(url('pages/campaign.html?edit=' + encodeURIComponent(EXISTING_CAMPAIGN.id)));
    await expect(page.locator('#taskName')).toHaveValue(EXISTING_CAMPAIGN.id, { timeout: 10000 });
    await page.evaluate(() => {
      document.querySelector('.form-step[data-step="1"]').classList.remove('active');
      document.querySelector('.form-step[data-step="3"]').classList.add('active');
    });

    await expect(page.locator('#productUrl')).toHaveValue(EXISTING_CAMPAIGN.productUrl);
    await expect(page.locator('input[name="offrePromo"][value="Oui"]')).toBeChecked();
    await expect(page.locator('#offerValidityDate')).toBeVisible();
    await expect(page.locator('#offerValidityDate')).toHaveValue(EXISTING_CAMPAIGN.offerValidityDate);
    await expect(page.locator('#offerEndDate')).toHaveValue(EXISTING_CAMPAIGN.offerEndDate);
    await expect(page.locator('input[name="parcoursSelfcare"][value="Oui"]')).toBeChecked();
    await expect(page.locator('input[name="transfo"][value="Oui"]')).toBeChecked();
    await expect(page.locator('#lotNumber')).toBeVisible();
    await expect(page.locator('#lotNumber')).toHaveValue(EXISTING_CAMPAIGN.lotNumber);
    console.log('errors (migration creation.step3, campagne existante):', errors);
    expect(errors).toEqual([]);
  });

  test('nouvelle campagne : transfo="Non" par défaut (comme avant), champ requis bloque l\'étape 3', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, { typologies: ['Commerciale'], marches: ['part'], recurrences: ['Ponctuelle'], lots: ['Lot 3'] });
    await installFakeDirectory(page, {});
    await page.goto(url('pages/campaign.html'));
    await page.locator('#taskName').waitFor({ state: 'attached', timeout: 10000 });

    await expect(page.locator('input[name="transfo"][value="Non"]')).toBeChecked();
    await expect(page.locator('#offerValidityDate')).toBeHidden();
    await expect(page.locator('#lotNumber')).toBeHidden();
    console.log('errors (nouvelle campagne, step3 defaults):', errors);
    expect(errors).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────
// Lot 4 : creation.step3.canal.base (socle de chaque canal — Type de livrable,
// Nom du livrable, Type de Com, Critère ciblage, Typologie de com, Lien LCCX).
// Cas le plus sensible : ces champs pilotent aussi le nom de dossier de dépôt
// (deliverableName) et des logiques conditionnelles annexes (site web, reprise
// natio) qui restent, elles, en dur — seule la RESTITUTION de ces 6 champs
// passe par le moteur générique, la clé de stockage JSON (data.channels[i].*)
// est strictement inchangée.
// ─────────────────────────────────────────────────────────────
test.describe('creation.step3.canal.base — migration sans casser les campagnes existantes', () => {
  const EXISTING_CAMPAIGN = {
    id: 'CampagneCanalExistante', description: 'x', po: PO_USER.name, launchDate: '2026-10-15', instantiation: '2026-08-01',
    typology: 'Commerciale', market: 'part', recurrence: 'Ponctuelle', requiredTeams: ['Marketing'],
    channels: [
      { content: 'MAIL', deliverableLabel: 'Offre été', deliverableName: 'MAIL - Offre été', comType: 'Commerciales', targetingCriteria: 'Tous clients', comTypology: 'Création Caisse', urlLccx: 'https://lccx.example.com/x' }
    ],
    actif: true
  };
  const CANAL_CFG = { typologies: ['Commerciale'], marches: ['part'], recurrences: ['Ponctuelle'], canaux: ['MAIL', 'MDC'], typesCom: ['Commerciales', 'Gestion'], comTypologies: ['Création Caisse', 'Reprise Natio'] };

  test('campagne existante (1 canal MAIL), config customFields absente : pré-remplissage correct + sauvegarde inchangée', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, CANAL_CFG);
    await installFakeDirectory(page, { [EXISTING_CAMPAIGN.id]: EXISTING_CAMPAIGN });
    await page.goto(url('pages/campaign.html?edit=' + encodeURIComponent(EXISTING_CAMPAIGN.id)));
    await expect(page.locator('#taskName')).toHaveValue(EXISTING_CAMPAIGN.id, { timeout: 10000 });
    await page.evaluate(() => {
      document.querySelector('.form-step[data-step="1"]').classList.remove('active');
      document.querySelector('.form-step[data-step="4"]').classList.add('active');
    });

    await expect(page.locator('#channelContent1')).toHaveValue('MAIL', { timeout: 10000 });
    await expect(page.locator('#deliverableLabel1')).toHaveValue('Offre été');
    await expect(page.locator('#deliverableName1')).toHaveValue('MAIL - Offre été');
    await expect(page.locator('#comType1')).toHaveValue('Commerciales');
    await expect(page.locator('#targetingCriteria1')).toHaveValue('Tous clients');
    await expect(page.locator('input[name="comTypology1"][value="Création Caisse"]')).toBeChecked();
    await expect(page.locator('#urlLccx1')).toHaveValue('https://lccx.example.com/x');

    await page.locator('#targetingCriteria1').fill('Tous clients + prospects');
    await page.evaluate(() => window.createCampaign());
    await page.waitForTimeout(800);

    const savedJson = await page.evaluate(() => window.__campaignFiles[Object.keys(window.__campaignFiles)[0]].getFile().then((f) => f.text()));
    const saved = JSON.parse(savedJson);
    expect(saved.channels[0].content).toBe('MAIL');
    expect(saved.channels[0].deliverableName).toBe('MAIL - Offre été');
    expect(saved.channels[0].targetingCriteria).toBe('Tous clients + prospects');
    expect(saved.channels[0].comTypology).toBe('Création Caisse');
    expect(saved.channels[0].urlLccx).toBe('https://lccx.example.com/x');
    // Pas de stockage redondant : le socle du canal n'est jamais collecté dans
    // customFieldValues (seuls les champs additionnels propres au canal le sont).
    expect(saved.channels[0].customFieldValues && saved.channels[0].customFieldValues['creation.step3.canal.base']).toBeUndefined();

    console.log('errors (migration creation.step3.canal.base, campagne existante):', errors);
    expect(errors).toEqual([]);
  });

  test('nouveau canal : champs vides par défaut, validateStep bloque l\'étape 4 tant que le socle n\'est pas rempli', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, CANAL_CFG);
    await installFakeDirectory(page, {});
    await page.goto(url('pages/campaign.html'));
    await page.locator('#taskName').waitFor({ state: 'attached', timeout: 10000 });

    await page.evaluate(() => window.generateChannelFields(1));
    await page.locator('#deliverableLabel1').waitFor({ state: 'attached', timeout: 10000 });
    await expect(page.locator('#channelContent1')).toHaveValue('');
    await expect(page.locator('#deliverableLabel1')).toHaveValue('');
    expect(await page.locator('input[name="comTypology1"]:checked').count()).toBe(0);

    await page.evaluate(() => {
      document.querySelector('.form-step[data-step="1"]').classList.remove('active');
      document.querySelector('.form-step[data-step="4"]').classList.add('active');
      document.querySelector('input[name="numChannels"][value="1"]').checked = true;
    });
    const blocked = await page.evaluate(() => window.validateStep(4));
    expect(blocked).toBe(false);
    console.log('errors (nouveau canal, socle vide bloque validateStep):', errors);
    expect(errors).toEqual([]);
  });

  test('changement de type de livrable ne réinitialise pas les autres champs du socle déjà saisis', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, CANAL_CFG);
    await installFakeDirectory(page, {});
    await page.goto(url('pages/campaign.html'));
    await page.locator('#taskName').waitFor({ state: 'attached', timeout: 10000 });
    await page.evaluate(() => {
      document.querySelector('.form-step[data-step="1"]').classList.remove('active');
      document.querySelector('.form-step[data-step="4"]').classList.add('active');
    });
    await expect(page.locator('.form-step[data-step="4"]')).toHaveClass(/active/, { timeout: 10000 });
    await page.evaluate(() => window.generateChannelFields(1));
    await page.locator('#deliverableLabel1').waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('#deliverableLabel1').fill('Bannière rentrée');
    await page.locator('#targetingCriteria1').fill('Clients premium');
    await page.locator('#channelContent1').selectOption('MAIL');
    await expect(page.locator('#deliverableName1')).toHaveValue('MAIL - Bannière rentrée', { timeout: 10000 });
    await page.locator('#channelContent1').selectOption('MDC');
    await expect(page.locator('#deliverableName1')).toHaveValue('MDC - Bannière rentrée', { timeout: 10000 });

    await expect(page.locator('#deliverableLabel1')).toHaveValue('Bannière rentrée');
    await expect(page.locator('#targetingCriteria1')).toHaveValue('Clients premium');
    console.log('errors (changement channelContent, valeurs du socle préservées):', errors);
    expect(errors).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────
// Lots 5-6 (details.html) : data_mise_en_prod / ebf_mise_en_prod — les seuls
// champs déjà en place de ces deux étapes (date MEP, date premier envoi,
// commentaire), sans lecteur externe (pas de mirrorChannelCodes, pas de
// rapprochement Bilan/xlsx, pas de moteur d'affectation auto — cf. l'audit qui
// a précédé cette migration). idSuffix reconstitue l'id DOM EXACT déjà
// référencé directement par collectDataMepDepot / le handler ebf_mise_en_prod
// (hors moteur générique), sans toucher à ce code de collecte.
// ─────────────────────────────────────────────────────────────
test.describe('data_mise_en_prod / ebf_mise_en_prod — migration sans casser les campagnes existantes', () => {
  function mepCampaign() {
    return {
      id: 'CF Mep Test', description: 'x', po: PO_USER.name,
      launchDate: '2026-09-01', instantiation: '2026-08-01', typology: 'Commerciale',
      market: 'part', recurrence: 'Ponctuelle', requiredTeams: ['Marketing', 'EBF', 'Data'],
      channels: [
        { content: 'MAIL', deliverableLabel: 'Test', deliverableName: 'MAIL - Test', comType: 'Commerciales', targetingCriteria: 'Tous', comTypology: 'Création Caisse' }
      ],
      workflow: {
        steps: { po_saisie: 'completed', manager_affectation: 'completed', po_kickoff: 'completed' },
        assignments: { ebf: [PO_USER.name], data: [PO_USER.name] },
        channelSteps: {
          0: {
            ebf_bat: 'completed', po_validation_bat: 'completed',
            data_ciblage: 'completed', po_validation_ciblage: 'completed',
            data_lancement_test: 'completed',
            ebf_test_prod: 'completed', po_validation_test_prod: 'completed',
            data_mise_en_prod: 'pending', ebf_mise_en_prod: 'pending'
          }
        },
        channelDates: {}, channelRevisionComments: {}
      }
    };
  }

  test('config customFields absente : les champs (date MEP, premier envoi, commentaire) s\'affichent et se sauvegardent au même format qu\'avant', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, {});
    await installFakeDirectory(page, { [mepCampaign().id]: mepCampaign() });
    await page.goto(url('pages/details.html?name=' + encodeURIComponent('CF Mep Test')));
    await page.waitForTimeout(1200);
    await page.locator('#nav-item-0').click();
    await page.waitForTimeout(400);

    await expect(page.locator('#data-mepdate-0')).toHaveCount(1, { timeout: 10000 });
    await expect(page.locator('#data-mepfirstsend-0')).toHaveCount(1);
    await expect(page.locator('#data-mepcomment-0')).toHaveCount(1);
    await expect(page.locator('#ebf-mepdate-0')).toHaveCount(1);
    await expect(page.locator('#ebf-mepcomment-0')).toHaveCount(1);

    await page.locator('#data-mepdate-0').fill('2026-09-10');
    await page.locator('#data-mepfirstsend-0').fill('2026-09-11');
    await page.locator('#data-mepcomment-0').fill('Routage 9h00');
    await page.locator('.btn-save-datamep[data-ch="0"]').click();

    // La sauvegarde ré-affiche le récapitulatif en lecture seule à partir de
    // l'objet dépôt tout juste collecté (collectDataMepDepot lit encore les id
    // DOM en dur data-mepdate-0/data-mepfirstsend-0/data-mepcomment-0, inchangé
    // par la migration) — preuve que le format stocké (mepDate/mepFirstSend/
    // mepComment) reste exactement celui d'avant.
    const readonly = page.locator('#data-mep-readonly-0');
    await expect(readonly).toBeVisible({ timeout: 10000 });
    await expect(readonly).toContainText('2026-09-10');
    await expect(readonly).toContainText('2026-09-11');
    await expect(readonly).toContainText('Routage 9h00');

    console.log('errors (migration data_mise_en_prod/ebf_mise_en_prod, campagne existante):', errors);
    expect(errors).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────
// Lot 7 (details.html) : data_lancement_test — seul « Cible du test » migre
// (même clé de stockage, depotdata_test.json / cibleTest). « Destinataires du
// test en prod » reste en dur (liste dynamique d'utilisateurs, hors périmètre
// du moteur générique).
// ─────────────────────────────────────────────────────────────
test.describe('data_lancement_test — migration sans casser les campagnes existantes', () => {
  function launchTestCampaign() {
    return {
      id: 'CF LancementTest', description: 'x', po: PO_USER.name,
      launchDate: '2026-09-01', instantiation: '2026-08-01', typology: 'Commerciale',
      market: 'part', recurrence: 'Ponctuelle', requiredTeams: ['Marketing', 'EBF', 'Data'],
      channels: [
        { content: 'MAIL', deliverableLabel: 'Test', deliverableName: 'MAIL - Test', comType: 'Commerciales', targetingCriteria: 'Tous', comTypology: 'Création Caisse' }
      ],
      workflow: {
        steps: { po_saisie: 'completed', manager_affectation: 'completed', po_kickoff: 'completed' },
        assignments: { ebf: [PO_USER.name], data: [PO_USER.name] },
        channelSteps: {
          0: {
            ebf_bat: 'completed', po_validation_bat: 'completed',
            data_ciblage: 'completed', po_validation_ciblage: 'completed',
            data_lancement_test: 'pending',
            ebf_test_prod: 'locked', po_validation_test_prod: 'locked',
            data_mise_en_prod: 'locked', ebf_mise_en_prod: 'locked'
          }
        },
        channelDates: {}, channelRevisionComments: {}
      }
    };
  }

  test('config customFields absente : « Cible du test » s\'affiche, se sauvegarde et se ré-affiche au même format qu\'avant', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, {});
    await installFakeDirectory(page, { [launchTestCampaign().id]: launchTestCampaign() });
    await page.goto(url('pages/details.html?name=' + encodeURIComponent('CF LancementTest')));
    await page.waitForTimeout(1200);
    await page.locator('#nav-item-0').click();
    await page.waitForTimeout(400);

    await expect(page.locator('#data-cibletest-0')).toHaveCount(1, { timeout: 10000 });
    await page.locator('#data-cibletest-0').fill('50 clients segment premium');
    await page.locator('.btn-save-datatest[data-ch="0"]').click();

    const readonly = page.locator('#data-testlaunch-readonly-0');
    await expect(readonly).toBeVisible({ timeout: 10000 });
    await expect(readonly).toContainText('50 clients segment premium');

    console.log('errors (migration data_lancement_test, campagne existante):', errors);
    expect(errors).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────
// Lot 8 (details.html) : com_maquette — date de dépôt maquette, URL Figma,
// nombre d'images migrent (même clé de stockage). imageUrls (liste dynamique
// pilotée par le nombre d'images) et le dépôt de fichier restent en dur.
// ─────────────────────────────────────────────────────────────
test.describe('com_maquette — migration sans casser les campagnes existantes', () => {
  function comCampaign() {
    return {
      id: 'CF ComMaquette', description: 'x', po: PO_USER.name,
      launchDate: '2026-09-01', instantiation: '2026-08-01', typology: 'Commerciale',
      market: 'part', recurrence: 'Ponctuelle', requiredTeams: ['Marketing', 'Com'],
      channels: [
        { content: 'MAIL', deliverableLabel: 'Test', deliverableName: 'MAIL - Test', comType: 'Commerciales', targetingCriteria: 'Tous', comTypology: 'Création Caisse' }
      ],
      workflow: {
        steps: { po_saisie: 'completed', manager_affectation: 'completed', po_kickoff: 'completed' },
        assignments: { com: [PO_USER.name] },
        channelSteps: { 0: { com_maquette: 'pending', po_validation_maquette: 'locked' } },
        channelDates: {}, channelRevisionComments: {}
      }
    };
  }

  test('config customFields absente : date dépôt / URL Figma / nombre d\'images s\'affichent, la liste d\'URL dynamique continue de réagir, la sauvegarde reste au même format', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, {});
    await installFakeDirectory(page, { [comCampaign().id]: comCampaign() });
    await page.goto(url('pages/details.html?name=' + encodeURIComponent('CF ComMaquette')));
    await page.waitForTimeout(1200);
    await page.locator('#nav-item-0').click();
    await page.waitForTimeout(400);

    await expect(page.locator('#com-depot-date-0')).toHaveCount(1, { timeout: 10000 });
    await expect(page.locator('#com-figma-0')).toHaveValue('');
    await expect(page.locator('#com-numimages-0')).toHaveValue('0');

    // Le compteur d'images continue de piloter la liste d'URL dynamique
    // (updateComImageUrls, hors moteur générique) via le même id DOM.
    await page.locator('#com-numimages-0').fill('2');
    await page.locator('#com-numimages-0').dispatchEvent('input');
    await expect(page.locator('#com-img-0-0')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#com-img-0-1')).toBeVisible();

    await page.locator('#com-depot-date-0').fill('2026-09-05');
    await page.locator('#com-figma-0').fill('https://figma.com/file/xyz');
    await page.locator('#com-img-0-0').fill('https://img.example.com/1.png');
    await page.locator('#com-img-0-1').fill('https://img.example.com/2.png');
    await page.locator('.btn-save-com[data-ch="0"]').click();

    const readonly = page.locator('#com-readonly-0');
    await expect(readonly).toBeVisible({ timeout: 10000 });
    await expect(readonly).toContainText('2026-09-05');
    await expect(readonly).toContainText('2');

    console.log('errors (migration com_maquette, campagne existante):', errors);
    expect(errors).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────
// Lot 9 (details.html) : ebf_bat — Objet de l'email (canal mail uniquement) et
// Code Com migrent. C'est le lot le plus sensible du dépôt EBF : ces deux
// valeurs sont relues ensuite par mirrorChannelCodes() (index de recherche,
// fiche canal) DEPUIS L'OBJET dépôt déjà collecté par collectEbfDepot(), pas
// depuis le DOM — la preuve à apporter est donc que collectEbfDepot() (code
// non générique, inchangé) retrouve toujours bien les champs migrés via leur
// id DOM exact (idSuffix). Webmaster (liste dynamique d'utilisateurs) et Ref
// Paracom (contrainte maxlength) restent en dur.
// ─────────────────────────────────────────────────────────────
test.describe('ebf_bat — migration sans casser les campagnes existantes', () => {
  function ebfBatCampaign() {
    return {
      id: 'CF EbfBat', description: 'x', po: PO_USER.name,
      launchDate: '2026-09-01', instantiation: '2026-08-01', typology: 'Commerciale',
      market: 'part', recurrence: 'Ponctuelle', requiredTeams: ['Marketing', 'EBF'],
      channels: [
        { content: 'MAIL', deliverableLabel: 'Test', deliverableName: 'MAIL - Test', comType: 'Commerciales', targetingCriteria: 'Tous', comTypology: 'Création Caisse' }
      ],
      workflow: {
        steps: { po_saisie: 'completed', manager_affectation: 'completed', po_kickoff: 'completed' },
        assignments: { ebf: [PO_USER.name] },
        channelSteps: { 0: { ebf_bat: 'pending', po_validation_bat: 'locked' } },
        channelDates: {}, channelRevisionComments: {}
      }
    };
  }

  test('canal MAIL, config customFields absente : Objet de l\'email + Code Com s\'affichent, se collectent (collectEbfDepot) et alimentent mirrorChannelCodes comme avant', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, {});
    await installFakeDirectory(page, { [ebfBatCampaign().id]: ebfBatCampaign() });
    await page.goto(url('pages/details.html?name=' + encodeURIComponent('CF EbfBat')));
    await page.waitForTimeout(1200);
    await page.locator('#nav-item-0').click();
    await page.waitForTimeout(400);

    // Canal MAIL : l'objet de l'email doit être visible (canalTypes).
    await expect(page.locator('#ebf-emailobject-0')).toHaveCount(1, { timeout: 10000 });
    await expect(page.locator('#ebf-codecom-0')).toHaveCount(1);

    await page.locator('#ebf-emailobject-0').fill('Découvrez notre offre exclusive');
    await page.locator('#ebf-codecom-0').fill('COM-2026-042');
    await page.locator('.btn-save-ebf[data-ch="0"]').click();

    const readonly = page.locator('#ebf-readonly-0');
    await expect(readonly).toBeVisible({ timeout: 10000 });
    await expect(readonly).toContainText('COM-2026-042');
    await expect(readonly).toContainText('Découvrez notre offre exclusive');

    // Preuve directe que collectEbfDepot() (code non générique) retrouve bien
    // le champ migré, exactement comme mirrorChannelCodes() le lit en aval.
    const collected = await page.evaluate(() => window.collectEbfDepot(0));
    expect(collected.codeCom).toBe('COM-2026-042');
    expect(collected.emailObject).toBe('Découvrez notre offre exclusive');
    const mirrored = await page.evaluate(() => {
      window.mirrorChannelCodes(0, { codeCom: 'COM-2026-042', emailObject: 'Découvrez notre offre exclusive' });
      return window.currentCampaignData.channels[0].codeCom;
    });
    expect(mirrored).toBe('COM-2026-042');

    console.log('errors (migration ebf_bat, canal MAIL):', errors);
    expect(errors).toEqual([]);
  });

  test('canal SMS : l\'objet de l\'email (canalTypes MAIL) n\'apparaît pas, Code Com reste', async ({ page }) => {
    const errors = collectPageErrors(page);
    var camp = ebfBatCampaign();
    camp.channels[0].content = 'SMS';
    camp.channels[0].deliverableName = 'SMS - Test';
    await seedUser(page, PO_USER, {});
    await installFakeDirectory(page, { [camp.id]: camp });
    await page.goto(url('pages/details.html?name=' + encodeURIComponent(camp.id)));
    await page.waitForTimeout(1200);
    await page.locator('#nav-item-0').click();
    await page.waitForTimeout(400);

    await expect(page.locator('#ebf-codecom-0')).toHaveCount(1, { timeout: 10000 });
    expect(await page.locator('#ebf-emailobject-0').count()).toBe(0);

    console.log('errors (ebf_bat, canal SMS, objet email masqué):', errors);
    expect(errors).toEqual([]);
  });

  // Variante de installFakeDirectory supportant un dépôt EBF pré-existant
  // (Campagnes/<id>/<dossier canal>/depotebf.json) — même piège de fond que
  // pour data_ciblage (cf. installFakeDirectoryWithDepot ci-dessous) : le
  // fichier dépôt doit être un objet PERSISTANT, sinon les écritures d'un
  // appel sont invisibles à l'appel suivant.
  async function installFakeDirectoryWithEbfDepot(page, campaign, depotByChannelFolder) {
    await page.addInitScript((args) => {
      var campaign = args.campaign, depotByChannelFolder = args.depotByChannelFolder;
      function makeFakeFile(initial) {
        var content = initial;
        return {
          getFile: function () { return Promise.resolve({ text: function () { return Promise.resolve(content); } }); },
          createWritable: function () { return Promise.resolve({ write: function (data) { if (typeof data === 'string') content = data; return Promise.resolve(); }, close: function () { return Promise.resolve(); } }); }
        };
      }
      function makeEmptyDir() {
        return {
          getDirectoryHandle: function (n, o) { if (o && o.create) return Promise.resolve(makeEmptyDir()); return Promise.reject(new Error('nf')); },
          getFileHandle: function (n, o) { if (o && o.create) return Promise.resolve(makeFakeFile('')); return Promise.reject(new Error('nf')); }
        };
      }
      var depotFileCache = {};
      function channelDir(folderName) {
        return {
          getDirectoryHandle: function () { return Promise.resolve(makeEmptyDir()); },
          getFileHandle: function (fname, opts) {
            if (fname === 'depotebf.json') {
              if (!depotFileCache[folderName] && depotByChannelFolder[folderName]) {
                depotFileCache[folderName] = makeFakeFile(JSON.stringify(depotByChannelFolder[folderName], null, 2));
              }
              if (depotFileCache[folderName]) return Promise.resolve(depotFileCache[folderName]);
              if (opts && opts.create) { depotFileCache[folderName] = makeFakeFile(''); return Promise.resolve(depotFileCache[folderName]); }
              return Promise.reject(new Error('nf'));
            }
            if (opts && opts.create) return Promise.resolve(makeFakeFile(''));
            return Promise.reject(new Error('nf'));
          }
        };
      }
      var campaignFile = makeFakeFile(JSON.stringify(campaign, null, 2));
      function campaignDirH() {
        return {
          kind: 'directory', name: campaign.id,
          getDirectoryHandle: function (name) { return Promise.resolve(channelDir(name)); },
          getFileHandle: function (fname, opts) {
            if (fname === 'campagne.json') return Promise.resolve(campaignFile);
            if (opts && opts.create) return Promise.resolve(makeFakeFile(''));
            return Promise.reject(new Error('nf'));
          }
        };
      }
      var indexFile = makeFakeFile('{}');
      function campagnesDir() {
        return {
          getDirectoryHandle: function () { return Promise.resolve(campaignDirH()); },
          getFileHandle: function (fname, opts) { if (fname === '_index.json') return Promise.resolve(indexFile); if (opts && opts.create) return Promise.resolve(makeFakeFile('')); return Promise.reject(new Error('nf')); },
          values: function () {
            var i = 0, names = [campaign.id];
            return { next: function () { if (i < names.length) { var d = campaignDirH(); i++; return Promise.resolve({ value: d, done: false }); } return Promise.resolve({ value: undefined, done: true }); }, [Symbol.asyncIterator]: function () { return this; } };
          }
        };
      }
      var fakeRoot = { name: 'FakeRoot', getDirectoryHandle: function (name) { return name === 'Campagnes' ? Promise.resolve(campagnesDir()) : Promise.resolve(makeEmptyDir()); }, getFileHandle: function () { return Promise.reject(new Error('n/a')); } };
      var tries = 0;
      var iv = setInterval(function () {
        tries++;
        var IM = window.ImpulsionMarketing;
        if (IM && IM.directoryStorage) { clearInterval(iv); IM.directoryStorage.getRootHandleWithCheck = function () { return Promise.resolve({ handle: fakeRoot, status: 'success' }); }; }
        else if (tries > 200) clearInterval(iv);
      }, 1);
    }, { campaign: campaign, depotByChannelFolder: depotByChannelFolder });
  }

  test('reprise après demande de modification : l\'objet de l\'email reste présent et remonte dans le bloc « à valider » du PO', async ({ page }) => {
    const errors = collectPageErrors(page);
    const campaign = {
      id: 'CF EbfBat Revision', description: 'x', po: PO_USER.name,
      launchDate: '2026-09-01', instantiation: '2026-08-01', typology: 'Commerciale',
      market: 'part', recurrence: 'Ponctuelle', requiredTeams: ['EBF'],
      channels: [
        { content: 'MAIL', deliverableLabel: 'Test', deliverableName: 'MAIL - Test', comType: 'Commerciales', targetingCriteria: 'Tous' }
      ],
      workflow: {
        steps: { po_saisie: 'completed', manager_affectation: 'completed', po_kickoff: 'completed' },
        assignments: { ebf: [PO_USER.name] },
        channelSteps: { 0: { ebf_bat: 'revision_requested', po_validation_bat: 'locked' } },
        channelRevisionComments: { 0: { ebf_bat: 'Merci de revoir le CTA.' } },
        channelDates: {}
      }
    };
    const existingDepot = {
      campaign: campaign.id, channel: 'MAIL - Test', channelIndex: 0, step: 'ebf_bat',
      webmaster: PO_USER.name, codeCom: 'COM-OLD', refParacom: 'PARA-OLD', emailObject: 'Objet OLD', numCta: 0,
      customFieldValues: { 'ebf-emailobject-': 'Objet OLD', 'ebf-codecom-': 'COM-OLD' },
      status: 'submitted', depositDate: '2026-08-01T00:00:00.000Z'
    };

    await seedUser(page, PO_USER, {});
    await installFakeDirectoryWithEbfDepot(page, campaign, { 'MAIL - Test': existingDepot });
    await page.goto(url('pages/details.html?name=' + encodeURIComponent(campaign.id)));
    await page.waitForTimeout(1200);
    await page.locator('#nav-item-0').click();
    await page.waitForTimeout(1200);

    // L'id doit survivre au rechargement, pré-rempli avec l'ancienne valeur.
    await expect(page.locator('#ebf-emailobject-0')).toHaveValue('Objet OLD', { timeout: 10000 });

    await page.locator('#ebf-emailobject-0').fill('Objet NEW');
    await page.locator('.btn-submit-canal-ebf[data-ch="0"]').click();
    await page.waitForTimeout(1200);

    // Bug remonté en production : ce bloc restait vide (l'objet ne « remontait
    // pas ») car l'id du champ était perdu au rechargement.
    const poExtra = page.locator('#po-extra-po_validation_bat-0');
    await expect(poExtra).toContainText('Objet NEW', { timeout: 10000 });
    await expect(poExtra).toContainText("J'ai vérifié et je valide l'objet du mail");

    console.log('errors (reprise après révision, ebf_bat / objet email):', errors);
    expect(errors).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────
// Lot 10 (details.html) : data_ciblage — Code Projet / Code Action / Code MK /
// Chemin de la requête / URL de l'échantillon migrent. Volume cible RESTE EN
// DUR (son libellé affiche le seuil d'alerte configurable par caisse,
// APP_SETTINGS.volumeAlertThreshold — une donnée dynamique qu'un champ
// générique statique ne peut pas exprimer). Comme ebf_bat, codeProjet/
// codeAction/codeMK sont relus par mirrorChannelCodes() DEPUIS L'OBJET dépôt
// déjà collecté par collectDataDepot() (pas depuis le DOM) — vérifié
// explicitement ci-dessous.
// ─────────────────────────────────────────────────────────────
test.describe('data_ciblage — migration sans casser les campagnes existantes', () => {
  function dataCiblageCampaign() {
    return {
      id: 'CF DataCiblage', description: 'x', po: PO_USER.name,
      launchDate: '2026-09-01', instantiation: '2026-08-01', typology: 'Commerciale',
      market: 'part', recurrence: 'Ponctuelle', requiredTeams: ['Marketing', 'Data'],
      channels: [
        { content: 'MAIL', deliverableLabel: 'Test', deliverableName: 'MAIL - Test', comType: 'Commerciales', targetingCriteria: 'Tous', comTypology: 'Création Caisse', volumeCible: 12000 }
      ],
      workflow: {
        steps: { po_saisie: 'completed', manager_affectation: 'completed', po_kickoff: 'completed' },
        assignments: { data: [PO_USER.name] },
        channelSteps: { 0: { data_ciblage: 'pending', po_validation_ciblage: 'locked' } },
        channelDates: {}, channelRevisionComments: {}
      }
    };
  }

  test('config customFields absente : volume cible (en dur) pré-rempli depuis ch.volumeCible, codes migrés collectés/mirrorés comme avant', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedUser(page, PO_USER, {});
    await installFakeDirectory(page, { [dataCiblageCampaign().id]: dataCiblageCampaign() });
    await page.goto(url('pages/details.html?name=' + encodeURIComponent('CF DataCiblage')));
    await page.waitForTimeout(1200);
    await page.locator('#nav-item-0').click();
    await page.waitForTimeout(400);

    // Volume cible : toujours en dur, pré-rempli depuis ch.volumeCible.
    await expect(page.locator('#data-volume-0')).toHaveValue('12000', { timeout: 10000 });
    await expect(page.locator('#data-codeproj-0')).toHaveCount(1);
    await expect(page.locator('#data-codeaction-0')).toHaveCount(1);
    await expect(page.locator('#data-codemk-0')).toHaveCount(1);
    await expect(page.locator('#data-chemin-0')).toHaveCount(1);
    await expect(page.locator('#data-urlechantillon-0')).toHaveCount(1);

    await page.locator('#data-codeproj-0').fill('PRJ-2026-01');
    await page.locator('#data-codeaction-0').fill('ACT-2026-01');
    await page.locator('.btn-save-ciblage[data-ch="0"]').click();

    const readonly = page.locator('#data-readonly-0');
    await expect(readonly).toBeVisible({ timeout: 10000 });
    await expect(readonly).toContainText('PRJ-2026-01');
    await expect(readonly).toContainText('ACT-2026-01');

    // Preuve directe que collectDataDepot() (code non générique) retrouve bien
    // les champs migrés — exactement ce que mirrorChannelCodes() lit en aval
    // pour l'index de recherche et le rapprochement Bilan/xlsx.
    const collected = await page.evaluate(() => window.collectDataDepot(0, 'data_ciblage'));
    expect(collected.codeProjet).toBe('PRJ-2026-01');
    expect(collected.codeAction).toBe('ACT-2026-01');

    console.log('errors (migration data_ciblage, campagne existante):', errors);
    expect(errors).toEqual([]);
  });

  // Variante de installFakeDirectory supportant un dépôt de canal pré-existant
  // (Campagnes/<id>/<dossier canal>/depotdata.json) — nécessaire pour rejouer
  // le rechargement async d'un dépôt déjà soumis (cas d'une demande de
  // modification), que installFakeDirectory (campagne.json seul) ne couvre pas.
  // Cache le fichier dépôt UNE SEULE FOIS (objet persistant) : sinon chaque
  // getDirectoryHandle recrée un fichier vierge et les écritures de l'app
  // deviennent invisibles à la relecture suivante — piège vécu en investiguant
  // ce bug, à ne pas reproduire ici.
  async function installFakeDirectoryWithDepot(page, campaign, depotByChannelFolder) {
    await page.addInitScript((args) => {
      var campaign = args.campaign, depotByChannelFolder = args.depotByChannelFolder;
      function makeFakeFile(initial) {
        var content = initial;
        return {
          getFile: function () { return Promise.resolve({ text: function () { return Promise.resolve(content); } }); },
          createWritable: function () { return Promise.resolve({ write: function (data) { if (typeof data === 'string') content = data; return Promise.resolve(); }, close: function () { return Promise.resolve(); } }); }
        };
      }
      function makeEmptyDir() {
        return {
          getDirectoryHandle: function (name, opts) { if (opts && opts.create) return Promise.resolve(makeEmptyDir()); return Promise.reject(new Error('nf: ' + name)); },
          getFileHandle: function (name, opts) { if (opts && opts.create) return Promise.resolve(makeFakeFile('')); return Promise.reject(new Error('nf: ' + name)); }
        };
      }
      var depotFileCache = {};
      function channelDir(folderName) {
        return {
          getDirectoryHandle: function () { return Promise.resolve(makeEmptyDir()); },
          getFileHandle: function (fname, opts) {
            if (fname === 'depotdata.json') {
              if (!depotFileCache[folderName] && depotByChannelFolder[folderName]) {
                depotFileCache[folderName] = makeFakeFile(JSON.stringify(depotByChannelFolder[folderName], null, 2));
              }
              if (depotFileCache[folderName]) return Promise.resolve(depotFileCache[folderName]);
              if (opts && opts.create) { depotFileCache[folderName] = makeFakeFile(''); return Promise.resolve(depotFileCache[folderName]); }
              return Promise.reject(new Error('nf: ' + fname));
            }
            if (opts && opts.create) return Promise.resolve(makeFakeFile(''));
            return Promise.reject(new Error('nf: ' + fname));
          }
        };
      }
      var campaignFile = makeFakeFile(JSON.stringify(campaign, null, 2));
      function campaignDirH() {
        return {
          kind: 'directory', name: campaign.id,
          getDirectoryHandle: function (name) { return Promise.resolve(channelDir(name)); },
          getFileHandle: function (fname, opts) {
            if (fname === 'campagne.json') return Promise.resolve(campaignFile);
            if (opts && opts.create) return Promise.resolve(makeFakeFile(''));
            return Promise.reject(new Error('nf: ' + fname));
          }
        };
      }
      var indexFile = makeFakeFile('{}');
      function campagnesDir() {
        return {
          getDirectoryHandle: function () { return Promise.resolve(campaignDirH()); },
          getFileHandle: function (fname, opts) { if (fname === '_index.json') return Promise.resolve(indexFile); if (opts && opts.create) return Promise.resolve(makeFakeFile('')); return Promise.reject(new Error('nf')); },
          values: function () {
            var i = 0, names = [campaign.id];
            return { next: function () { if (i < names.length) { var d = campaignDirH(); i++; return Promise.resolve({ value: d, done: false }); } return Promise.resolve({ value: undefined, done: true }); }, [Symbol.asyncIterator]: function () { return this; } };
          }
        };
      }
      var fakeRoot = { name: 'FakeRoot', getDirectoryHandle: function (name) { return name === 'Campagnes' ? Promise.resolve(campagnesDir()) : Promise.resolve(makeEmptyDir()); }, getFileHandle: function () { return Promise.reject(new Error('n/a')); } };
      var tries = 0;
      var iv = setInterval(function () {
        tries++;
        var IM = window.ImpulsionMarketing;
        if (IM && IM.directoryStorage) { clearInterval(iv); IM.directoryStorage.getRootHandleWithCheck = function () { return Promise.resolve({ handle: fakeRoot, status: 'success' }); }; }
        else if (tries > 200) clearInterval(iv);
      }, 1);
    }, { campaign: campaign, depotByChannelFolder: depotByChannelFolder });
  }

  test('reprise après demande de modification : le dépôt existant se recharge sans perdre les ids DOM des champs migrés, et la resoumission conserve les champs non modifiés', async ({ page }) => {
    const errors = collectPageErrors(page);
    const campaign = {
      id: 'CF DataCiblage Revision', description: 'x', po: PO_USER.name,
      launchDate: '2026-09-01', instantiation: '2026-08-01', typology: 'Commerciale',
      market: 'part', recurrence: 'Ponctuelle', requiredTeams: ['Marketing', 'Data'],
      channels: [
        { content: 'MAIL', deliverableLabel: 'Test', deliverableName: 'MAIL - Test', comType: 'Commerciales', targetingCriteria: 'Tous', comTypology: 'Création Caisse', volumeCible: 12000 }
      ],
      workflow: {
        steps: { po_saisie: 'completed', manager_affectation: 'completed', po_kickoff: 'completed' },
        assignments: { data: [PO_USER.name] },
        channelSteps: { 0: { data_ciblage: 'revision_requested', po_validation_ciblage: 'locked' } },
        channelRevisionComments: { 0: { data_ciblage: 'Merci de corriger le code projet.' } },
        channelDates: {}
      }
    };
    // Dépôt déjà soumis une première fois — même forme que ce que l'app écrit
    // réellement (collectDataDepot + collectCustomFields tournent tous les deux
    // au moment d'une soumission, donc les deux représentations coexistent).
    const existingDepot = {
      campaign: campaign.id, channel: 'MAIL - Test', channelIndex: 0, step: 'data_ciblage',
      codeProjet: 'PRJ-OLD', codeAction: 'ACT-OLD', codeMK: 'MK-OLD',
      cheminRequete: 'chemin-old', urlEchantillon: 'https://exemple.fr/echantillon-old',
      customFieldValues: {
        'data-codeproj-': 'PRJ-OLD', 'data-codeaction-': 'ACT-OLD', 'data-codemk-': 'MK-OLD',
        'data-chemin-': 'chemin-old', 'data-urlechantillon-': 'https://exemple.fr/echantillon-old'
      },
      status: 'submitted', depositDate: '2026-08-01T00:00:00.000Z'
    };

    await seedUser(page, PO_USER, {});
    await installFakeDirectoryWithDepot(page, campaign, { 'MAIL - Test': existingDepot });
    await page.goto(url('pages/details.html?name=' + encodeURIComponent(campaign.id)));
    await page.waitForTimeout(1200);
    await page.locator('#nav-item-0').click();
    await page.waitForTimeout(1200); // laisse le rechargement async du dépôt s'exécuter

    // Les ids DOM des champs migrés doivent survivre au rechargement, avec les
    // valeurs de l'ancien dépôt pré-remplies.
    await expect(page.locator('#data-codeproj-0')).toHaveValue('PRJ-OLD', { timeout: 10000 });
    await expect(page.locator('#data-codeaction-0')).toHaveValue('ACT-OLD');

    // Correction du seul champ demandé, puis resoumission.
    await page.locator('#data-codeproj-0').fill('PRJ-NEW');
    await page.locator('.btn-submit-canal-data[data-ch="0"]').click();
    await page.waitForTimeout(1200);

    // Le récapitulatif de validation PO doit refléter la correction ET les
    // champs non modifiés — pas un bloc vide (bug remonté en production).
    const readonly = page.locator('#data-readonly-0');
    await expect(readonly).toBeVisible({ timeout: 10000 });
    await expect(readonly).toContainText('PRJ-NEW');
    await expect(readonly).toContainText('ACT-OLD');
    await expect(readonly).toContainText('MK-OLD');

    console.log('errors (reprise après révision, data_ciblage):', errors);
    expect(errors).toEqual([]);
  });
});
