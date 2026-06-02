# Architecture — Impulsion Marketing

## Vue d'ensemble

Impulsion Marketing est une **SPA (Single Page Application) 100 % client**, sans serveur backend. Elle tourne dans le navigateur (Chromium Edge recommandé) et accède directement au système de fichiers réseau `V://` via l'API **File System Access API** (OPFS non utilisée — accès au vrai FS).

Pas de Node.js, pas de build step, pas de bundler automatique. Le déploiement consiste simplement à copier le dossier sur le lecteur réseau.

---

## Structure des dossiers

```
Impulsion Marketing/         ← racine de l'app (= lecteur réseau V://)
│
├── Impulsion-Marketing.html ← tableau de bord (page d'entrée)
├── rebuild-bundle.bat       ← script de maintenance bundle.js
│
├── pages/
│   ├── campaign.html        ← création / édition de campagne (multi-étapes)
│   ├── details.html         ← détail d'une campagne + workflow acteurs + documents
│   ├── visualization.html   ← liste filtrée de toutes les campagnes
│   ├── pilotage.html        ← vue manager / statistiques globales
│   └── comite-editorial.html ← Gantt zones site web, gestion conflits
│
├── css/
│   ├── dashboard-layout.css ← layout principal (sidebar fixe 280px, top-header sticky)
│   ├── styles.css           ← typographie, variables CSS
│   ├── components.css       ← boutons, badges, cartes
│   └── theme.css            ← couleurs de thème
│
├── js/
│   ├── bundle.js                    ← ⚠️ FICHIER GÉNÉRÉ — ne pas éditer manuellement
│   ├── config-standalone.js         ← constantes, liste utilisateurs
│   ├── security-standalone.js       ← escapeHtml, sanitizeName
│   ├── errors-standalone.js         ← toasts, gestion erreurs
│   ├── performance-standalone.js    ← MetadataCache, IndexCache (IndexedDB)
│   ├── directoryStorage-standalone.js ← handle FS, IndexedDB
│   ├── users-standalone.js          ← utilisateur courant, rôles
│   ├── user-selector-standalone.js  ← composant sélecteur utilisateur
│   ├── workflow-standalone.js       ← machine à états, index, sauvegarde
│   ├── themes-standalone.js         ← gestion thèmes visuels
│   └── help-standalone.js           ← aide contextuelle
│
├── docs/                    ← documentation développeur
│
└── Campagnes/               ← données (créé par l'utilisateur sur V://)
    ├── _index.json          ← index léger de toutes les campagnes
    ├── _notifications.json  ← notifications inter-utilisateurs (conflits, validations)
    └── <Nom Campagne>/
        ├── campagne.json    ← données complètes de la campagne
        ├── discussion.json  ← fil de discussion
        ├── documents/       ← espace documentaire (sous-dossiers libres + fichiers)
        └── <Canal>/         ← un sous-dossier par canal
            ├── depotcom.json
            ├── depotebf.json
            ├── depotebf_test.json
            ├── depotdata.json
            ├── depotdata_test.json   ← données lancement test (data_lancement_test)
            ├── depotdata_mep.json
            ├── maquette_canal_0.pdf
            ├── bat_canal_0.pdf
            └── testprod_canal_0.png
```

---

## Modules JS (bundle.js)

Tous les modules sont exposés sous `window.ImpulsionMarketing.*`. Le `bundle.js` est la concaténation ordonnée des **10 fichiers standalone** (dans cet ordre exact) :

| Ordre | Module | Namespace | Rôle |
|-------|--------|-----------|------|
| 1 | `config-standalone.js` | `config` | Constantes globales, liste des utilisateurs, rôles |
| 2 | `security-standalone.js` | `security` | `escapeHtml`, `sanitizeName`, validation XSS |
| 3 | `errors-standalone.js` | `errors` | Notifications toast, gestion centralisée des erreurs |
| 4 | `performance-standalone.js` | `performance` | `MetadataCache` (campagne.json), `IndexCache` (_index.json) |
| 5 | `directoryStorage-standalone.js` | `directoryStorage` | Handle racine FS, persistance IndexedDB |
| 6 | `users-standalone.js` | `users` | Utilisateur courant, `isManager`, `isCurrentUserTeamManager` |
| 7 | `user-selector-standalone.js` | `userSelector` | Composant de sélection d'utilisateur (header) |
| 8 | `workflow-standalone.js` | `workflow` | Machine à états, `STEPS`, `advanceStep`, `extractIndexEntry` |
| 9 | `themes-standalone.js` | `themes` | Gestion des thèmes visuels |
| 10 | `help-standalone.js` | `help` | Système d'aide contextuelle |

> **Après toute modification d'un fichier standalone**, régénérer `bundle.js` :
> ```bash
> cd "c:/Users/kevin/OneDrive/Bureau/DEV/IM" && cat js/config-standalone.js js/security-standalone.js js/errors-standalone.js js/performance-standalone.js js/directoryStorage-standalone.js js/users-standalone.js js/user-selector-standalone.js js/workflow-standalone.js js/themes-standalone.js js/help-standalone.js > js/bundle.js
> ```

---

## Modèle de données

### `campagne.json` (données complètes)

```json
{
  "id": "PLANNER-123",
  "po": "Prénom Nom",
  "description": "...",
  "typology": "Transactionnel",
  "market": "Particuliers",
  "recurrence": "One-shot",
  "launchDate": "2026-06-01",
  "segments": ["Jeunes", "Actifs"],
  "ubs": ["Épargne"],
  "targetProduct": "Livret A",
  "campagneLiee": "Nom Autre Campagne",
  "juridique": {
    "active": true,
    "commentaire": "Validation juridique requise — contact Maître X"
  },
  "kickoffDate": "2026-04-15",
  "kickoffPersonNotes": {
    "Prénom Nom": "Note spécifique à cette personne"
  },
  "channels": [
    {
      "deliverableName": "Email Jeunes",
      "content": "Email",
      "sendDate": "2026-06-01",
      "comType": "Promotionnel",
      "targetingCriteria": "Age < 30",
      "emailObject": "Objet de l'email",
      "persona": "Jeune actif",
      "cibleVolume": 50000,
      "urlsComStore": ["https://comstore.ca-toulouse31.fr/item/123"],
      "siteWeb": {
        "zone": "Bandeau Hero",
        "marche": "part",
        "univers": null,
        "dateDebut": "2026-06-01",
        "dateFin": "2026-06-15",
        "status": "confirmed"
      }
    }
  ],
  "workflow": {
    "steps": {
      "manager_affectation": "validated",
      "po_kickoff": "validated",
      "com_maquette": "pending",
      "po_validation_maquette": "locked",
      "ebf_bat": "locked",
      "po_validation_bat": "locked",
      "data_ciblage": "locked",
      "data_lancement_test": "locked",
      "po_validation_ciblage": "locked",
      "ebf_test_prod": "locked",
      "po_validation_test_prod": "locked",
      "data_mise_en_prod": "locked"
    },
    "assignments": {
      "manager": ["Prénom Nom"],
      "com": ["Prénom Nom"],
      "ebf": ["Prénom Nom"],
      "data": ["Prénom Nom"]
    },
    "channelValidations": {
      "po_validation_maquette": [null, "validated"],
      "po_validation_bat": ["revision_requested", null],
      "po_validation_ciblage": [null, null],
      "po_validation_test_prod": [null, null]
    },
    "revisionComments": {}
  }
}
```

**Notes sur les champs :**
- `campagneLiee` : nom (folderName) d'une autre campagne liée, affiché comme lien cliquable dans details.html
- `juridique.active` : si true, affiche l'encart ⚖️ Juridique dans details.html avec validation PO dédiée
- `kickoffDate` + `kickoffPersonNotes` : étape `po_kickoff` — réunion de lancement formalisée
- `channels[].urlsComStore` : tableau (remplace l'ancien champ `urlComStore` string — rétrocompat assurée)
- `channels[].siteWeb` : présent uniquement si le canal est de type site web
- `channels[].siteWeb.status` : `confirmed` | `pending` | `en_attente` | `refused` | `refusee`
- `workflow.assignments[role]` : **tableau** de strings (multi-membres) — rétrocompat string via `getAssignees()`
- `workflow.channelValidations[poStepId][channelIdx]` : `validated` | `revision_requested` | `null`

### `_index.json` (index léger)

Fichier unique à la racine de `Campagnes/`, contenant une entrée par campagne avec uniquement les métadonnées nécessaires au dashboard. Permet de charger 1000 campagnes en **1 seule lecture FS** au lieu de 1000.

```json
{
  "v": 1,
  "campaigns": {
    "Nom Campagne": {
      "po": "Prénom Nom",
      "desc": "Description courte",
      "launch": "2026-06-01",
      "mod": "2026-05-20T14:00:00.000Z",
      "asn": { "com": ["X"], "ebf": ["Y"], "data": ["Z"] },
      "steps": { "manager_affectation": "validated", "...": "..." },
      "done": false,
      "inactive": false,
      "volume": 50000
    }
  }
}
```

### `_notifications.json` (notifications globales)

```json
[
  {
    "id": "notif-001",
    "type": "zone_conflit_attente",
    "destinataire": "manager@ca31.fr",
    "campagneId": "Nom Campagne",
    "campagneTitre": "Campagne Épargne Printemps",
    "zone": "Bandeau Hero",
    "marche": "part",
    "dateCreation": "2026-04-01T10:32:00",
    "lu": false
  }
]
```

Types : `zone_conflit_attente` | `zone_approuvee` | `zone_refusee`

### `depotdata_test.json` (données lancement test)

```json
{
  "cibleTest": "Segment test 200 clients",
  "dateDepot": "2026-05-10T09:00:00.000Z",
  "depose_par": "Prénom Nom"
}
```

---

## Hiérarchie de cache

Le chargement du dashboard suit une stratégie **stale-while-revalidate** à 3 niveaux :

```
1. IndexedDB IndexCache (< 5 ms)
   └─ TTL 60 s — sert l'UI immédiatement
   └─ rafraîchi en arrière-plan depuis V://

2. _index.json réseau (~100–200 ms, 1 lecture)
   └─ mis en cache dans IndexCache après lecture

3. Scan complet (buildFullIndex)
   └─ uniquement si _index.json absent ou corrompu
   └─ lit tous les campagne.json en Promise.all (parallèle)
```

`MetadataCache` (IndexedDB, TTL 5 min) est utilisé séparément dans `visualization.html` et `pilotage.html` pour mettre en cache les `campagne.json` individuels.

---

## Machine à états Workflow

Les étapes suivent un ordre défini dans `workflow.STEPS`. Les transitions sont gérées par `workflow.advanceStep(data, stepId, newStatus)`.

```
manager_affectation (pending → validated)
        ↓
po_kickoff (pending → validated)          ← réunion de lancement + notes
        ↓
com_maquette (pending → submitted)
        ↓
po_validation_maquette (pending → validated | revision_requested)
        ↓
ebf_bat + data_ciblage  [en parallèle]
        ↓
data_lancement_test (pending → submitted)  ← après ciblage, avant test EBF
        ↓
po_validation_bat + po_validation_ciblage  [en parallèle]
        ↓
ebf_test_prod (pending → submitted)
        ↓
po_validation_test_prod (pending → validated)
        ↓
data_mise_en_prod (pending → completed)
```

Statuts possibles : `locked` | `pending` | `submitted` | `validated` | `completed` | `revision_requested`

Les validations PO sont **scopées par canal** via `channelValidations` : un canal peut être validé indépendamment des autres.

---

## Page Comité Éditorial (`comite-editorial.html`)

Vue Gantt des zones site web, accessible uniquement aux managers. Fonctionnement :

- **Lecture** : parcourt tous les `campagne.json` via le FileSystem et extrait les `channels[].siteWeb`
- **Affichage** : Gantt par zone (lignes) × semaines (colonnes), filtrable par marché (tabs) et statut
- **Zones multi-lignes** : Menu Burger (4 univers) et Zone de Gauche Authentification (5 emplacements)
- **Détection de conflits** : deux campagnes sur même zone + marché + univers/emplacement avec dates qui se chevauchent
- **Panel latéral** : clic sur un bloc → détail + liste des conflits → formulaire de repositionnement inline
- **Approbation** : le manager peut approuver ou refuser les zones "en attente" directement depuis le panel

**Zones disponibles :**

| Zone | Marché | Sous-lignes |
|------|--------|-------------|
| Zone de Gauche (Synthese des comptes) | Part / BP | — |
| Zone de Gauche (Authentification) | Part / BP | Emplacement 1 à 5 |
| Bandeau Hero | Part / BP | — |
| ZAC HOME PAGE Gauche | Part / BP | — |
| ZAC HOME PAGE Droite | Part / BP | — |
| Zone de Droite (Synthese des comptes) | Part / BP | — |
| Menu Burger | Part / BP | 4 univers |
| ZAC HOME PAGE (BP uniquement) | BP | — |

---

## Navigation dans `details.html`

La page détail utilise une navigation secondaire horizontale (onglets) :

- **Infos campagne** : timeline workflow, affectation manager (multi-membres), kick-off, juridique, campagne liée, discussion
- **📁 Documents** : arborescence du dossier `documents/`, création sous-dossiers, upload multi-fichiers
- **Un onglet par canal** : sections COM / EBF-BAT / Data-ciblage / Data-lancement-test / EBF-test-prod / Data-MEP

La navigation est gérée par `navigateTo(pageKey)` qui injecte le HTML dans `#details-panel` sans rechargement de page. Les dépôts par canal sont mis en cache dans `loadedDepots[idx]` pour éviter les relectures lors des aller-retours entre onglets.

---

## Fonctions clés (helpers globaux)

| Fonction | Fichier | Rôle |
|----------|---------|------|
| `getAssignees(assignments, role)` | details.html | Retourne `string[]` (rétrocompat string legacy) |
| `assigneesDisplay(assignments, role)` | details.html | Retourne HTML échappé joint par virgule |
| `validateChannelStep(data, poStepId, channelIdx)` | workflow-standalone.js | Valide un canal spécifique |
| `requestChannelRevision(data, poStepId, srcStepId, channelIdx, comment)` | workflow-standalone.js | Demande révision sur un canal |
| `initChannelValidations(data, numChannels)` | workflow-standalone.js | Initialise channelValidations |
| `isCurrentUserTeamManager(role)` | users-standalone.js | Teste si l'utilisateur est manager d'une équipe |
