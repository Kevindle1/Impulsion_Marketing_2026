// Config Playwright — tests de fumée UI (outil de DÉVELOPPEMENT uniquement,
// `npm run test:e2e`). Aucun impact sur le code déployé.
//
// Chromium préinstallé de l'environnement : on force executablePath pour ne
// jamais déclencher un téléchargement de navigateur (`npx playwright install`
// est proscrit ici — voir docs/DEVELOPER_GUIDE.md).
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium'
    }
  }
});
