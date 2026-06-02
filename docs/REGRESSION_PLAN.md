# Plan de régression — Que faire si l'app ne fonctionne plus ?

---

## Étape 1 — Identifier le symptôme

### L'app ne s'ouvre pas / page blanche

1. Vérifier que le navigateur est **Edge ou Chrome** (Firefox ne supporte pas File System Access API)
2. Ouvrir les DevTools (F12) → onglet **Console** → noter l'erreur exacte
3. Vérifier que `bundle.js` se charge : onglet **Network** → chercher `bundle.js` → statut 200

### Le dossier racine n'est plus reconnu

1. DevTools → **Application** → **IndexedDB** → `ImpulsionStorage` → `handles`
2. Si l'entrée `handle` est absente → normal, cliquer "Charger le dossier racine"
3. Si l'entrée est présente mais l'accès échoue → supprimer l'entrée, recharger, resélectionner le dossier
4. Vérifier que le lecteur réseau `V://` est bien monté

### Le dashboard est vide alors que des campagnes existent

→ Aller à **Étape 2**

### Une action workflow ne se sauvegarde pas

→ Aller à **Étape 3**

### Les données affichées sont obsolètes

→ Aller à **Étape 4**

### Le Comité Éditorial est vide ou ne se charge pas

→ Aller à **Étape 5**

---

## Étape 2 — Dashboard vide

**Cause probable : `_index.json` absent ou corrompu**

1. Cliquer le bouton **"Reconstruire l'index"** dans la barre du dashboard
2. Attendre la notification de confirmation (ex : "Index reconstruit — 85 campagnes indexées")
3. Si le bouton n'apparaît pas → sélectionner d'abord un utilisateur dans le menu déroulant

**Cause probable : aucun utilisateur sélectionné**

Le dashboard ne montre des campagnes que si un utilisateur est sélectionné. Vérifier le sélecteur en haut à droite.

**Cause probable : IndexedDB corrompue**

1. DevTools → Application → IndexedDB → **supprimer toutes les bases** (`ImpulsionStorage`, `ImpulsionMetaCache`, `ImpulsionIndexCache`)
2. Recharger la page (F5)
3. Resélectionner le dossier racine
4. Cliquer "Reconstruire l'index"

---

## Étape 3 — Une action ne se sauvegarde pas (erreur à l'écriture)

1. Vérifier que le lecteur `V://` est accessible (ouvrir l'explorateur de fichiers)
2. Vérifier les droits en écriture : tenter de créer manuellement un fichier texte dans `Campagnes/`
3. Si droits OK → ouvrir la Console DevTools et noter le message d'erreur exact
4. Vérifier que le dossier de la campagne existe bien dans `Campagnes/<Nom>/`
5. Si le nom de la campagne contient des caractères inhabituels (emoji, slashes…), le dossier peut ne pas être trouvé → renommer le dossier en supprimant ces caractères

---

## Étape 4 — Données obsolètes affichées

**Le dashboard affiche d'anciennes données**

→ Attendre 60 secondes (TTL du cache) et recharger, OU :
→ DevTools → Application → IndexedDB → `ImpulsionIndexCache` → supprimer l'entrée → recharger

**La page détail d'une campagne affiche d'anciennes données**

→ Le fichier `campagne.json` sur `V://` fait foi. Vérifier son contenu directement dans l'explorateur.

**Après une action workflow, rien n'a changé**

→ Vérifier dans `campagne.json` si le champ `workflow.steps` a bien été mis à jour
→ Si non : l'écriture a échoué silencieusement → voir Étape 3

---

## Étape 5 — Comité Éditorial vide ou incorrect

**Aucune campagne n'apparaît dans le Gantt**

1. Vérifier que le dossier racine est bien sélectionné (même procédure que dashboard)
2. Vérifier que des campagnes ont bien un canal avec `siteWeb.zone` renseigné dans `campagne.json`
3. Vérifier que le marché sélectionné (tabs en haut) correspond au marché des zones (`part` = Particuliers, `bp` = Banque Privée, etc.)

**Les blocs apparaissent dans la mauvaise période**

→ Utiliser les flèches de navigation pour aller à la bonne période
→ Vérifier les dates `dateDebut` / `dateFin` dans `campagne.json` — elles doivent être au format `YYYY-MM-DD`

**Un conflit n'est pas détecté ou est détecté à tort**

→ Vérifier que les deux campagnes ont le même `zone`, `marche` ET `univers` (pour Menu Burger et Zone Authentification)
→ La détection utilise `d1 <= od2 && d2 >= od1` — deux campagnes qui se touchent exactement sur un même jour sont en conflit

**Le repositionnement ne sauvegarde pas**

→ C'est normal si `V://` n'est pas accessible — la mise à jour UI est quand même effectuée (le toast l'indique)
→ Pour persister : vérifier l'accès réseau et resauvegarder manuellement depuis la page détail de la campagne

---

## Étape 6 — Erreur JS (console rouge)

### `X is not a function` ou `Cannot read property of undefined`

Cause la plus fréquente : **`bundle.js` obsolète** après une modification d'un fichier standalone.

**Correction :**
1. Ouvrir un terminal dans le dossier du projet
2. Exécuter : `npm run build` (ou double-cliquer `rebuild-bundle.bat`)
3. Recharger l'application

### `SecurityError` ou `NotAllowedError`

Le navigateur a révoqué l'autorisation d'accès au dossier (peut arriver après une mise en veille prolongée ou un changement de chemin réseau).

**Correction :**
1. Recharger la page (F5)
2. Si la demande d'autorisation réapparaît → cliquer "Autoriser"
3. Si le picker s'ouvre → resélectionner le dossier `V://`

### `SyntaxError: Unexpected token` dans un fichier JSON

Un fichier JSON sur `V://` est corrompu (écriture incomplète lors d'une coupure réseau).

**Correction :**
1. Identifier le fichier en cause depuis la stack trace (Console DevTools)
2. Ouvrir le fichier dans un éditeur de texte
3. Corriger le JSON ou supprimer le fichier (il sera recréé vide au prochain dépôt)

### Les notifications ne s'affichent pas

1. Vérifier que `_notifications.json` existe à la racine de `Campagnes/`
2. Si absent → il sera créé automatiquement lors du prochain événement déclencheur (conflit forcé, approbation…)
3. Si présent mais malformé → le remplacer par `[]` (tableau vide)

---

## Étape 7 — Dernier recours

Si aucune des étapes précédentes ne résout le problème :

1. **Vider tout le cache navigateur** : `Ctrl+Shift+Suppr` → cocher "Données de site" → Effacer
2. Recharger et resélectionner le dossier racine
3. Cliquer "Reconstruire l'index"
4. Si le problème persiste après ça → il s'agit d'un bug dans le code → noter l'erreur exacte de la console et contacter le développeur
