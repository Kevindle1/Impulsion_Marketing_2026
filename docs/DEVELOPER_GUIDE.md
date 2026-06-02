# Guide développeur — Impulsion Marketing

## Prérequis

- **Navigateur** : Microsoft Edge (Chromium) ou Google Chrome — requis pour l'API File System Access
- **Éditeur** : VS Code recommandé
- **Accès réseau** : lecteur `V://` monté (ou dossier local pour développement)
- Aucun Node.js, aucun build tool, aucune dépendance NPM

---

## Lancer l'application en développement

1. Ouvrir le dossier `Impulsion Marketing/` dans VS Code
2. Lancer l'extension **Live Server** (ou tout serveur HTTP local)
3. Ouvrir `http://localhost:5500/Impulsion-Marketing.html`
4. Au premier lancement, cliquer sur "Charger le dossier racine" et sélectionner le dossier `Impulsion Marketing/`

> **Pourquoi un serveur HTTP ?** L'API File System Access ne fonctionne pas sur `file://` (protocole bloqué par les navigateurs). Un serveur local (`localhost`) est nécessaire.

---

## Structure du code JS

### Règle de syntaxe par contexte

| Contexte | Syntaxe autorisée |
|----------|-------------------|
| `js/*-standalone.js` | **ES5 strict** — pas de `const`/`let`, pas d'arrow functions, pas de template literals, pas de classes |
| `pages/*.html` (scripts inline) | ES6+ autorisé (const, arrow, template literals, async/await) |
| `Impulsion-Marketing.html` | ES6+ autorisé |

### Namespace global

Tous les modules s'exposent sous `window.ImpulsionMarketing` :

```javascript
var workflow = window.ImpulsionMarketing.workflow;
var security = window.ImpulsionMarketing.security;
var users    = window.ImpulsionMarketing.users;
// etc.
```

### Pattern module (IIFE) — pour les *-standalone.js

```javascript
(function() {
    'use strict';

    // ... code privé ...

    function maFonction() { ... }

    // API publique
    window.ImpulsionMarketing = window.ImpulsionMarketing || {};
    window.ImpulsionMarketing.monModule = {
        maFonction: maFonction
    };
})();
```

---

## Régénérer bundle.js

Après toute modification d'un fichier `*-standalone.js`, régénérer `bundle.js` :

```bash
cd "c:/Users/kevin/OneDrive/Bureau/DEV/IM" && cat js/config-standalone.js js/security-standalone.js js/errors-standalone.js js/performance-standalone.js js/directoryStorage-standalone.js js/users-standalone.js js/user-selector-standalone.js js/workflow-standalone.js js/themes-standalone.js js/help-standalone.js > js/bundle.js
```

Ordre de concaténation (respecter les dépendances) :
1. `config-standalone.js`
2. `security-standalone.js`
3. `errors-standalone.js`
4. `performance-standalone.js`
5. `directoryStorage-standalone.js`
6. `users-standalone.js`
7. `user-selector-standalone.js`
8. `workflow-standalone.js`
9. `themes-standalone.js`
10. `help-standalone.js`

> **Ne jamais éditer `bundle.js` directement** — les modifications seraient écrasées à la prochaine régénération.

---

## Ajouter une nouvelle page HTML

1. Créer `pages/ma-page.html` en copiant la structure d'une page existante (ex: `visualization.html`)
2. Le `<script src="../js/bundle.js">` est déjà présent dans le template
3. Ajouter le lien dans la sidebar (`<nav class="sidebar-nav">`) de **toutes les pages existantes**
4. Initialiser les modules en début de script :

```javascript
var directoryStorage = window.ImpulsionMarketing.directoryStorage;
var security         = window.ImpulsionMarketing.security;
var errors           = window.ImpulsionMarketing.errors;
var users            = window.ImpulsionMarketing.users;
var workflow         = window.ImpulsionMarketing.workflow;
```

---

## Ajouter un champ à `campagne.json`

1. **`pages/campaign.html`** : ajouter le champ dans le formulaire de création/édition (step approprié)
2. **`pages/details.html`** : afficher le champ dans `renderInfoPage()` ou `renderChannelPage()`
3. **`js/workflow-standalone.js`** : si le champ doit apparaître dans l'index, l'ajouter dans `extractIndexEntry()` et mettre à jour `indexToEntries()` dans `Impulsion-Marketing.html`
4. Régénérer `bundle.js`
5. Lancer un **rebuild de l'index** via le bouton "Reconstruire l'index" du dashboard pour que les campagnes existantes soient mises à jour

---

## Modifier le workflow

Le workflow est défini dans `js/workflow-standalone.js`.

### Ajouter une étape

1. Ajouter l'entrée dans le tableau `STEPS` :

```javascript
var STEPS = [
    // ...
    { id: 'ma_nouvelle_etape', label: 'Mon étape', description: 'Description', role: 'com' }
];
```

2. Ajouter la valeur initiale dans `initWorkflow()` :

```javascript
if (!steps.ma_nouvelle_etape) steps.ma_nouvelle_etape = 'locked';
```

3. Gérer le déverrouillage dans `recalcUnlocks()` si l'étape dépend d'une autre

4. Ajouter le rendu dans `pages/details.html` (builder ou section dans `renderChannelPage` / `renderInfoPage`)

5. Régénérer `bundle.js` + rebuild de l'index

---

## Gestion des assignations multi-membres

Les assignations `workflow.assignments[role]` sont des **tableaux** depuis le Sprint 4 :

```javascript
// Lecture — toujours passer par getAssignees() pour la rétrocompat string legacy
var assignees = getAssignees(data.workflow.assignments, 'com'); // string[]

// Écriture
data.workflow.assignments.com = ['Prénom A', 'Prénom B'];
```

La fonction `getAssignees(assignments, role)` est définie globalement dans `details.html` et gère la rétrocompat automatique (si assignments[role] est une string, elle renvoie `[string]`).

---

## Dates et snap au lundi

Les dates de zones site web sont **snappées au lundi précédent** dans `campaign.html` et `comite-editorial.html`.

```javascript
// ⚠️ Utiliser les fonctions locales — NE PAS utiliser toISOString() qui retourne UTC
// et provoque un décalage de -1 jour en timezone Europe/Paris (UTC+1/+2)
var snapToMonday = function(dateStr) {
    if (!dateStr) return dateStr;
    var d = new Date(dateStr + 'T00:00:00');
    var day = d.getDay();
    if (day !== 1) {
        var diff = (day === 0) ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
    }
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + dd;  // ✅ local, pas UTC
};
```

---

## Ajouter un utilisateur

Les utilisateurs sont définis dans `js/config-standalone.js` :

```javascript
var USERS = [
    { name: 'Prénom Nom', role: 'com',     email: 'prenom.nom@ca-toulouse31.fr' },
    { name: 'Prénom Nom', role: 'ebf',     email: '...' },
    { name: 'Prénom Nom', role: 'data',    email: '...' },
    { name: 'Prénom Nom', role: 'manager', isManager: true, managerOf: 'com', email: '...' },
    // PO : défini au niveau de chaque campagne (champ "po" dans campagne.json)
];
```

Managers :
- `isGeneralManager: true` + `role: 'marketing'` → voit les 3 colonnes de pilotage
- `isManager: true` + `managerOf: 'com'|'ebf'|'data'` → accès Comité Éditorial + approbations

Après modification : régénérer `bundle.js`.

---

## Debugging

### Inspecter le cache IndexedDB

Dans DevTools → Application → IndexedDB :
- `ImpulsionStorage` → `handles` : handle racine persisté
- `ImpulsionMetaCache` → `meta` : cache des campagne.json
- `ImpulsionIndexCache` → `idx` : cache de _index.json

Pour forcer un rechargement depuis V://, supprimer l'entrée correspondante ou attendre l'expiration du TTL.

### Forcer la reconstruction de l'index

Si le dashboard ne montre pas toutes les campagnes ou affiche des données obsolètes :
1. Cliquer sur "Reconstruire l'index" dans la barre du dashboard
2. Le bouton relit tous les `campagne.json` depuis V://, réécrit `_index.json` et rafraîchit l'affichage

### Tester le Comité Éditorial sans données réelles

Pour tester sans accès à V://, injecter des données dans la console :

```javascript
window.loadAndRender = async function() {}; // bloquer le rechargement auto
state.campaigns = [
    {
        folderName: 'Camp-Test',
        data: {
            id: 'Campagne Test',
            po: 'PO',
            channels: [{
                deliverableName: 'Site Web',
                siteWeb: { zone: 'Bandeau Hero', marche: 'part', dateDebut: '2026-04-07', dateFin: '2026-04-27' }
            }]
        }
    }
];
renderGantt();
```

### Erreurs File System Access

Si l'accès au dossier racine est perdu (changement de chemin réseau, permission révoquée) :
1. DevTools → Application → IndexedDB → `ImpulsionStorage` → supprimer l'entrée `handle`
2. Recharger la page et resélectionner le dossier

### Campagne non trouvée dans details.html

`details.html?name=NomCampagne` — le nom dans l'URL doit correspondre **exactement** au nom du dossier dans `Campagnes/`. Vérifier la casse et les caractères spéciaux.

---

## Conventions de code

- **Vanilla JS ES5** dans les `*-standalone.js` — compatibilité maximale Edge entreprise
- **ES6+ autorisé** dans les pages HTML (scripts inline `<script>` non bundlés)
- **innerHTML avec escapeHtml** obligatoire pour les données dynamiques (voir [SECURITY.md](SECURITY.md))
- **Nommage** : camelCase pour les fonctions et variables, UPPER_CASE pour les constantes

---

## Déploiement

Le déploiement consiste simplement à copier le dossier sur le lecteur réseau `V://`. Aucune compilation, aucun build.

Checklist avant déploiement :
- [ ] `bundle.js` est à jour (lancer le rebuild)
- [ ] Tester en ouvrant `Impulsion-Marketing.html` depuis Edge pointant sur `V://`
- [ ] Vérifier que le dossier `Campagnes/` est accessible et que `_index.json` existe (sinon, cliquer "Reconstruire l'index" au premier lancement)
- [ ] Vérifier `_notifications.json` à la racine de `Campagnes/` (créé automatiquement si absent)
