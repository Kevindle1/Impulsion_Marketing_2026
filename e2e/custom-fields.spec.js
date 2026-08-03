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
    function campagnesDir() {
      return {
        getDirectoryHandle: function (name) { return Promise.resolve(campaignDir(name)); },
        getFileHandle: function () { return Promise.reject(new Error('n/a')); }
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
