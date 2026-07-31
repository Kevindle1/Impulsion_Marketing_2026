# Impulsion Marketing

Outil interne de pilotage des campagnes marketing (Crédit Agricole).

Il centralise la création des campagnes, le suivi du workflow de production (COM → EBF → Data → PO) et le pilotage global, le tout sans serveur — les données sont stockées directement sur le lecteur réseau partagé `V://`.

---

## Lancer l'application

1. **Double-cliquer `Impulsion Marketing.vbs`** (dans `Application/`) — l'app s'ouvre en **mode application** (fenêtre dédiée, sans barre d'adresse ni onglets), via Google Chrome (ou Edge). Ne pas ouvrir le `.html` directement : il s'afficherait dans un onglet de navigateur classique.
2. Sur l'écran de connexion : choisir son **service** puis son **nom**, et cliquer **« Se connecter »**
3. Au tout premier lancement uniquement : sélectionner le dossier `Données de production` sur `V://` lorsque le navigateur le demande

> Le dossier est mémorisé automatiquement — les connexions suivantes le rechargent en un clic.
> Pour changer d'utilisateur, cliquer sur **« Se déconnecter »** dans l'en-tête (retour à l'écran de connexion).

---

## Pages disponibles

| Page | Rôle |
|------|------|
| **Tableau de bord** | Campagnes à traiter et toutes mes campagnes |
| **Créer une campagne** | Formulaire de création / édition |
| **Campagnes** | Liste complète avec filtres |
| **Pilotage** | Vue globale manager et statistiques |
| **Détails** | Workflow complet d'une campagne par canal |

---

## Structure du dossier (sur `V://`)

Le déploiement est volontairement scindé en **deux dossiers indépendants**, pour qu'une montée de version ne touche jamais aux données réelles :

```
Impulsion Marketing/
├── Application/                     ← LIVRÉ / remplacé intégralement à chaque montée de version
│   ├── Impulsion Marketing.vbs      ← lanceur (double-clic)
│   ├── login.html
│   ├── Impulsion-Marketing.html     ← page d'accueil
│   ├── impulsion.ico
│   ├── pages/                       ← autres pages de l'app
│   ├── css/                         ← styles
│   └── js/                          ← code JavaScript
│
└── Données de production/           ← NE CHANGE JAMAIS lors d'une montée de version
    ├── _config.json                 ← paramétrage (Administration)
    ├── docs/
    │   └── USER_GUIDE.md            ← guide utilisateur, lu en direct par l'app (page Guide)
    ├── Campagnes/                   ← données (créées automatiquement)
    │   ├── _index.json
    │   └── <Nom Campagne>/
    │       ├── campagne.json
    │       └── <Canal>/
    └── Données/                     ← signalements (créé automatiquement)
```

**Pour livrer une nouvelle version** : remplacer intégralement le contenu de `Application/` par la nouvelle version (le contenu de `Données de production/` n'est jamais touché). Le lanceur `.vbs` retrouve toujours son dossier automatiquement, quel que soit son emplacement — aucune configuration à refaire après un remplacement.

**Pour amorcer un nouveau déploiement** (ex. une autre caisse régionale) : copier le contenu de `Application/` tel quel, et copier le contenu du dossier `Données de production/` de ce dépôt (dépourvu de vraies données — `_config.json` de base + `docs/USER_GUIDE.md`) comme point de départ, avant de le personnaliser depuis l'espace Administration.

Dans **ce dépôt de code**, les outils de développement (`test/`, `build-bundle.mjs`, `package.json`, `docs/` — hors `USER_GUIDE.md`) restent à la racine : ils ne font partie ni de `Application/` ni de `Données de production/` et ne sont jamais déployés sur `V://`.

---

## Documentation

| Document | Contenu |
|----------|---------|
| [Guide utilisateur](Données%20de%20production/docs/USER_GUIDE.md) | Comment utiliser l'app selon son rôle (déployé avec les données, lu en direct par l'app) |
| [Plan de continuité](docs/CONTINUITY_PLAN.md) | Que faire si l'app est indisponible |
| [Plan de régression](docs/REGRESSION_PLAN.md) | Résoudre un problème technique |
| [Architecture](docs/ARCHITECTURE.md) | Structure technique du projet |
| [Guide développeur](docs/DEVELOPER_GUIDE.md) | Modifier et déployer le code |
| [Sécurité](docs/SECURITY.md) | Règles de sécurité pour les développeurs |

---

## Navigateurs compatibles

| Navigateur | Compatibilité |
|------------|--------------|
| Microsoft Edge (Chromium) | ✅ Recommandé |
| Google Chrome | ✅ Compatible |
| Firefox | ❌ Non supporté (API File System non disponible) |
| Safari | ❌ Non supporté |
