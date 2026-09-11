// Tests de fumée UI (Playwright) — outil de DÉVELOPPEMENT uniquement.
//
// L'app n'a pas de backend : toute donnée réelle vient d'un dossier sélectionné
// via l'API File System Access (showDirectoryPicker), impossible à simuler en
// automatisation headless (nécessite un vrai geste utilisateur + un vrai
// FileSystemDirectoryHandle). Ces tests ne visent donc PAS un scénario complet
// bout-en-bout, mais un vrai filet de sécurité : chaque page charge son
// bundle.js sans erreur JS, et la garde de session (redirection vers
// login.html si aucun utilisateur n'est connecté) fonctionne bien partout.
//
// Lancer avec : npm run test:e2e
import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'Application');
const url = (p) => 'file://' + join(ROOT, p);

// Un utilisateur « super admin » cohérent avec le cache lu de façon synchrone par
// users-standalone.js / config-standalone.js au chargement du bundle (localStorage
// im_config_cache) — permet de dépasser la garde « utilisateur connecté » sans
// dossier réel. La garde « dossier accessible » (IndexedDB, jamais peuplée en
// headless) reste elle active : les pages protégées redirigent malgré tout vers
// login.html, ce qui est le comportement attendu et testé plus bas.
const FAKE_USER = { name: 'Test Smoke', role: 'superadmin', roleLabel: 'Super Admin', isSuperAdmin: true, isManager: true };
const FAKE_CONFIG = { users: [FAKE_USER] };

async function seedLoggedInUser(page) {
  await page.addInitScript(([user, cfg]) => {
    window.localStorage.setItem('im_current_user', JSON.stringify(user));
    window.localStorage.setItem('im_config_cache', JSON.stringify(cfg));
  }, [FAKE_USER, FAKE_CONFIG]);
}

function collectPageErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  return errors;
}

test.describe('login.html', () => {
  // Connexion en deux étapes : tant qu'aucun utilisateur n'est en cache (poste
  // jamais connecté), seule l'étape « connecter le dossier » est affichée — le
  // bouton qui l'actionne ne doit jamais être confondu avec « Se connecter »
  // (même bouton, même place que par le passé, corrigé ici).
  test('premier lancement (aucun utilisateur en cache) : affiche l\'étape de connexion du dossier, pas le formulaire de connexion', async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto(url('login.html'));
    await expect(page.locator('#login-step-folder')).toHaveClass(/active/);
    await expect(page.locator('#btn-connect-folder')).toBeVisible();
    await expect(page.locator('#login-team')).toBeHidden();
    await expect(page.locator('#btn-connect')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('charge sans erreur JS et affiche le formulaire de connexion (dossier déjà connu)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await seedLoggedInUser(page);
    await page.goto(url('login.html'));
    await expect(page.locator('#login-step-form')).toHaveClass(/active/);
    await expect(page.locator('#login-team')).toBeVisible();
    await expect(page.locator('#login-name')).toBeVisible();
    await expect(page.locator('#btn-connect')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('sélectionner un service peuple la liste des noms', async ({ page }) => {
    await seedLoggedInUser(page);
    await page.goto(url('login.html'));
    await page.locator('#login-team').selectOption('superadmin');
    await expect(page.locator('#login-name')).toBeEnabled();
    await expect(page.locator('#login-name option')).toContainText(['Test Smoke']);
  });

  test('un utilisateur déjà connu est pré-sélectionné au rechargement', async ({ page }) => {
    await seedLoggedInUser(page);
    await page.goto(url('login.html'));
    await expect(page.locator('#login-team')).toHaveValue('superadmin');
    await expect(page.locator('#login-name')).toHaveValue('Test Smoke');
  });

  test('chemin du dossier à sélectionner (Administration ▸ Paramètres généraux) : masqué si non renseigné', async ({ page }) => {
    await page.goto(url('login.html'));
    await expect(page.locator('#root-path-hint')).toBeHidden();
  });

  test('chemin du dossier à sélectionner : affiché à l\'étape 1 si renseigné en Administration', async ({ page }) => {
    // Ce repère n'a de sens que tant qu'aucun dossier n'est encore connu (étape 1) —
    // pas de FAKE_USER ici, sinon l'étape 2 (formulaire de connexion) s'affiche
    // directement et l'indice, propre à l'étape 1, resterait masqué (comportement
    // voulu, cf. login.html).
    await page.addInitScript((cfg) => {
      window.localStorage.setItem('im_config_cache', JSON.stringify(cfg));
    }, { users: [], settings: { defaultRootPath: 'V://Impulsion_Marketing/Données de production' } });
    await page.goto(url('login.html'));
    await expect(page.locator('#login-step-folder')).toHaveClass(/active/);
    await expect(page.locator('#root-path-hint')).toBeVisible();
    await expect(page.locator('#root-path-hint')).toContainText('V://Impulsion_Marketing/Données de production');
  });
});

// Pages nécessitant une session : sans dossier de travail réel (impossible en
// headless), elles doivent rediriger proprement vers login.html — jamais planter.
const PROTECTED_PAGES = [
  ['Impulsion-Marketing.html', 'Impulsion-Marketing.html'],
  ['pages/admin.html', 'pages/admin.html'],
  ['pages/campaign.html', 'pages/campaign.html'],
  ['pages/details.html', 'pages/details.html'],
  ['pages/pilotage.html', 'pages/pilotage.html'],
  ['pages/comite-editorial.html', 'pages/comite-editorial.html'],
  ['pages/visualization.html', 'pages/visualization.html'],
  ['pages/guide.html', 'pages/guide.html']
];

for (const [path, label] of PROTECTED_PAGES) {
  test(`${label} redirige vers login.html sans utilisateur connecté`, async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto(url(path));
    await page.waitForURL(/login\.html$/, { timeout: 5000 });
    expect(errors).toEqual([]);
  });
}

test('Impulsion-Marketing.html : utilisateur connecté mais sans dossier accessible → redirige aussi vers login.html', async ({ page }) => {
  // Confirme que la garde « dossier » (IndexedDB) protège bien la page même
  // quand la garde « utilisateur » est franchie — pas de rendu partiel ni d'erreur.
  const errors = collectPageErrors(page);
  await seedLoggedInUser(page);
  await page.goto(url('Impulsion-Marketing.html'));
  await page.waitForURL(/login\.html$/, { timeout: 5000 });
  expect(errors).toEqual([]);
});
