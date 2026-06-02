# Sécurité — Impulsion Marketing

## Modèle de sécurité général

L'application est **100 % client-side** et s'exécute dans un contexte de réseau d'entreprise privé (lecteur réseau `V://`). Il n'y a pas de serveur, pas d'API exposée sur Internet, pas de base de données distante.

La surface d'attaque principale est donc :
1. **XSS** via l'injection de données utilisateur dans le DOM
2. **Données corrompues** dans les fichiers JSON lus depuis V://
3. **Accès non autorisé** au lecteur réseau (géré par le SI, hors périmètre app)

---

## Protection XSS

### `security.escapeHtml(str)`

Toute donnée provenant de fichiers JSON (noms de campagnes, descriptions, commentaires utilisateurs, etc.) **doit** passer par `security.escapeHtml()` avant d'être insérée dans le DOM via `innerHTML`.

```javascript
// ✅ Correct
h += '<span>' + security.escapeHtml(data.po) + '</span>';

// ❌ Dangereux
h += '<span>' + data.po + '</span>';
```

La fonction échappe les caractères `&`, `<`, `>`, `"`, `'`.

### Règle de codage

- **innerHTML** : toujours avec `escapeHtml` sur les données dynamiques
- **textContent / innerText** : pas d'échappement nécessaire (sûr par nature)
- **href / src** : valider que l'URL commence par `https://` ou `http://` avant insertion (pour les URLs Figma, Comstore, CTA, etc.)
- **Attributs onclick inline** : échapper les paramètres avec `escHtml()` (alias local de escapeHtml dans les pages HTML) avant injection dans des attributs onclick

Exemple pour les attributs onclick :
```javascript
// ✅ Correct
html += '<button onclick="approveZone(\'' + escHtml(folderName) + '\', \'' + escHtml(zone) + '\')">';

// ❌ Dangereux — peut injecter du JS si folderName contient des quotes
html += '<button onclick="approveZone(\'' + folderName + '\', \'' + zone + '\')">';
```

### Injection via noms de fichiers

Les noms de campagnes et de canaux sont utilisés comme noms de dossiers. La fonction `sanitizeName(name)` remplace tout caractère hors `[a-zA-Z0-9\u00C0-\u017E \-_]` par `_` avant toute opération de lecture/écriture FS.

```javascript
function sanitizeName(name) {
    return (name || '').replace(/[^a-zA-Z0-9\u00C0-\u017E \-_]/g, '_').trim();
}
```

---

## Validation des données JSON

Toute lecture de fichier JSON depuis V:// est enveloppée dans un `try/catch` ou un `.catch()`. Un JSON malformé ou absent ne crashe pas l'application — il est traité comme "données vides" ou "erreur récupérable".

Les champs critiques du workflow (`steps`, `assignments`, `channelValidations`) sont initialisés via `workflow.initWorkflow(data)` qui garantit la présence de tous les champs attendus, même si le fichier JSON est partiel.

Les assignations multi-membres (`assignments[role]` = tableau) sont lues via `getAssignees()` qui gère la rétrocompat avec l'ancien format string.

---

## File System Access API

L'accès au système de fichiers est demandé **une seule fois** via `showDirectoryPicker()` (à l'initialisation). Le handle obtenu est persisté en IndexedDB (`directoryStorage`). Les accès suivants utilisent ce handle sans redemander d'autorisation.

Le navigateur impose que `showDirectoryPicker()` soit appelé dans un contexte de geste utilisateur (clic) — il n'est pas possible de l'invoquer silencieusement.

L'utilisateur accorde l'accès en lecture/écriture au dossier racine. L'app ne peut accéder qu'aux fichiers sous ce dossier — elle n'a pas accès au reste du système de fichiers.

### Upload de fichiers (espace documentaire)

L'upload de fichiers dans l'espace documentaire (`details.html`) passe par `<input type="file" multiple>`. Aucun filtre de type MIME n'est imposé côté UI (tous types de fichiers acceptés). Les fichiers sont écrits tels quels dans le dossier `documents/` via `FileSystemFileHandle.createWritable()`.

> **Note** : si des restrictions sur les types de fichiers sont souhaitées à l'avenir, ajouter un filtre sur `file.type` ou l'extension avant l'écriture.

---

## Authentification et autorisation

Il n'y a **pas d'authentification dans l'app**. L'identité est sélectionnée sur l'écran de connexion (`login.html`) au démarrage, puis figée pour la session (stockée dans `localStorage`). Cette approche est intentionnelle dans le contexte d'entreprise (réseau interne, accès V:// contrôlé par le SI). Le changement d'identité se fait via « Se déconnecter » (retour au login).

Les contrôles d'autorisation dans l'app sont de la **mise en forme UX** (afficher ou masquer des boutons selon le rôle) — ils ne constituent pas une protection de sécurité au sens strict.

Pour une sécurité réelle sur les actions sensibles (validation PO, affectation manager, approbation zones), le contrôle d'accès est délégué au lecteur réseau (droits NTFS).

> ℹ️ **Espace Manager supprimé.** L'ancien espace manager (`manager-login.html` / `manager-pilotage.html`),
> protégé par un mot de passe **codé en clair côté client**, a été **supprimé** : ce point de sécurité
> n'existe plus. Le pilotage manager reste accessible via `pages/pilotage.html`. Tant qu'il n'existe pas
> de serveur, **aucune** protection purement client ne peut être considérée comme fiable : la vraie
> protection des données reste les **droits du partage réseau `V://`**. Toute authentification réelle
> (mot de passe par utilisateur, rôles opposables) nécessiterait l'introduction d'un **backend**.

### Données figées dans le code

La liste des utilisateurs (noms, rôles, responsables de service) est **codée en dur** dans
`js/users-standalone.js` (et donc dans `bundle.js`). Si le dépôt devient accessible au-delà de
l'équipe, considérer le déplacement de cette liste vers un fichier de configuration **non versionné**
chargé depuis `V://`.

---

## IndexedDB

Trois bases IndexedDB sont utilisées :

| Base | Store | Contenu | TTL |
|------|-------|---------|-----|
| `ImpulsionStorage` | `handles` | Handle racine FS | Permanent |
| `ImpulsionMetaCache` | `meta` | Entrées campagne.json | 5 min |
| `ImpulsionIndexCache` | `idx` | _index.json complet | 60 s |

Ces données sont stockées **localement dans le navigateur de l'utilisateur**. Elles ne contiennent aucune donnée sensible (pas de mots de passe, pas de données personnelles clients — uniquement des métadonnées de campagnes marketing internes).

---

## Points d'attention pour les évolutions futures

- **Ne jamais utiliser `eval()`** sur du contenu lu depuis les fichiers JSON
- **Ne jamais construire de chemin de fichier** en concaténant directement une entrée utilisateur sans `sanitizeName()`
- **Ne jamais insérer dans `innerHTML`** une chaîne provenant d'un fichier JSON sans `escapeHtml()`
- **Pour les dates** : utiliser les méthodes locales (`getFullYear/getMonth/getDate`) plutôt que `toISOString()` pour éviter les décalages de timezone (bug documenté dans `snapToMonday`)
- Si une fonctionnalité d'**import de fichiers externes** est ajoutée, valider le type MIME côté client avant tout traitement
- Les URLs utilisateur (Figma, produit, CTA, Comstore) sont affichées dans des `<a href>` — s'assurer qu'elles commencent par `http://` ou `https://` pour éviter les schémas `javascript:` ou `data:`
