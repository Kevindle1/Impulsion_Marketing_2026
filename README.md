# Impulsion Marketing

Outil interne de pilotage des campagnes marketing du Crédit Agricole Toulouse 31.

Il centralise la création des campagnes, le suivi du workflow de production (COM → EBF → Data → PO) et le pilotage global, le tout sans serveur — les données sont stockées directement sur le lecteur réseau partagé `V://`.

---

## Lancer l'application

1. **Double-cliquer `Impulsion Marketing.vbs`** — l'app s'ouvre en **mode application** (fenêtre dédiée, sans barre d'adresse ni onglets), via Google Chrome (ou Edge). Ne pas ouvrir le `.html` directement : il s'afficherait dans un onglet de navigateur classique.
2. Sur l'écran de connexion : choisir son **service** puis son **nom**, et cliquer **« Se connecter »**
3. Au tout premier lancement uniquement : sélectionner le dossier `Impulsion Marketing` sur `V://` lorsque le navigateur le demande

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

## Structure du dossier

```
Impulsion Marketing/
├── Impulsion-Marketing.html   ← page d'accueil
├── pages/                     ← autres pages de l'app
├── css/                       ← styles
├── js/                        ← code JavaScript
├── docs/                      ← documentation
└── Campagnes/                 ← données (créées automatiquement)
    ├── _index.json
    └── <Nom Campagne>/
        ├── campagne.json
        └── <Canal>/
```

---

## Documentation

| Document | Contenu |
|----------|---------|
| [Guide utilisateur](docs/USER_GUIDE.md) | Comment utiliser l'app selon son rôle |
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
