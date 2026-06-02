# Guide utilisateur — Impulsion Marketing

---

## Premier lancement

1. Ouvrir `Impulsion-Marketing.html` dans **Edge** ou **Chrome**
2. Cliquer **"Charger le dossier racine"** → sélectionner le dossier `Impulsion Marketing` sur `V://`
3. Cliquer sur son **nom** dans le menu déroulant en haut à droite

Le dossier est mémorisé : les prochaines fois, il se charge automatiquement.

---

## Tableau de bord

Le tableau de bord affiche deux sections selon l'utilisateur sélectionné :

- **À produire** : campagnes où une action vous est demandée maintenant
- **Toutes mes campagnes** : toutes les campagnes auxquelles vous êtes rattaché

### Notifications

La cloche 🔔 en haut à droite affiche le nombre de notifications non lues. Cliquer dessus pour voir le détail (conflits de zones, approbations…). Cliquer sur une notification la marque comme lue et ouvre la campagne concernée.

### Tri et filtres

Les campagnes sont triées par **urgence** (date de mise en ligne la plus proche en premier). Utilisez :
- La **barre de recherche** pour filtrer par nom, description ou PO
- Le filtre **"Toutes les étapes"** pour afficher uniquement une étape du workflow
- Le filtre **"Statut"** pour inclure ou exclure les campagnes inactives

> Si des campagnes semblent manquer, cliquer **"Reconstruire l'index"** (icône ↺ dans la barre de recherche).

---

## Créer une campagne

1. Cliquer **"Créer une campagne"** dans le menu latéral
2. **Étape 1 — Informations générales** :
   - PO responsable, description, date de mise en ligne
   - Typologie, marché, récurrence
   - Campagne liée (optionnel) : lien vers une autre campagne associée
   - Validation juridique requise ? (cocher pour activer l'encart ⚖️)
3. **Étape 2 — Segmentation** :
   - Segments cibles, univers de besoin, produit cible, persona
4. **Étape 3 — Canaux** :
   - Ajouter un ou plusieurs canaux (MAIL, MDC, SMS, Site web…)
   - Pour chaque canal : objet email, type COM, volume cible, URLs Comstore
   - Si canal **Site web** : sélectionner la zone, le marché, l'univers/emplacement et les dates
     - Les dates sont automatiquement ajustées au lundi de la semaine
     - Si conflit : soumission en attente d'approbation manager
5. Cliquer **Enregistrer la campagne**

La campagne est créée et le workflow démarre en attente d'affectation manager.

---

## Workflow de production

Chaque campagne passe par une série d'étapes dans un ordre précis. La page **Détail** de la campagne montre l'avancement dans l'onglet **Infos campagne** (timeline verticale).

---

### Rôle : Manager

#### Affecter les équipes

Quand une campagne vient d'être créée :

1. Ouvrir la campagne → onglet **Infos campagne**
2. Dans le formulaire d'affectation : sélectionner un ou plusieurs responsables pour **COM**, **EBF** et **Data** (cases à cocher multi-sélection)
3. Cliquer **✅ Valider l'affectation**

Une fois validée, le workflow passe à l'étape Kick-off.

> Si vous êtes manager d'équipe (COM, EBF ou Data), vous ne remplissez que votre propre ligne. L'étape est validée globalement quand les trois lignes sont complétées.

#### Réaffecter ou ajouter un membre

À tout moment (même après le démarrage) :
1. Onglet **Infos campagne** → icône ✏️ à côté de l'équipe concernée
2. Modifier les cases à cocher → **Enregistrer**

---

### Étape : Kick-off (`po_kickoff`)

Organisée après l'affectation, avant le démarrage des équipes.

1. Onglet **Infos campagne** → section **Kick-off**
2. Renseigner la **date du kick-off**
3. Ajouter une **note par participant** (champ texte par personne assignée)
4. Optionnel : cliquer **Créer un Teams** pour générer un lien de réunion Microsoft Teams
5. Cliquer **✅ Valider le Kick-off**

---

### Rôle : COM (Chargé de Communication)

#### Déposer la maquette

1. Ouvrir la campagne → cliquer sur l'onglet du canal à traiter (ex : `📡 MAIL`)
2. Dans la section **🎨 Maquette Com** :
   - Renseigner l'**URL Figma**
   - Indiquer le nombre d'images et leurs URLs
   - Joindre le **fichier PDF ou image** de la maquette
3. Cliquer **💾 Enregistrer** pour sauvegarder sans soumettre
4. Cliquer **📤 Soumettre ce canal** quand le canal est prêt

Répéter pour chaque canal. Quand tous les canaux sont soumis, la demande de validation est envoyée au PO.

#### Traiter une demande de modification

Si le PO demande une modification, un badge **"Révision demandée"** et le commentaire du PO apparaissent. Modifier la maquette et soumettre à nouveau.

---

### Rôle : EBF (Webmaster / Réalisation)

Le rôle EBF intervient en deux temps : le **BAT** puis le **Test en production**.

#### Déposer le BAT

1. Ouvrir la campagne → cliquer sur l'onglet du canal
2. Dans la section **🖨️ Réalisation BAT** :
   - Sélectionner le **Webmaster** responsable
   - Renseigner le **Code Com**, la **Ref Paracom** (14 caractères max)
   - Indiquer le nombre de CTA et leurs URLs
   - Joindre le **fichier BAT** (PDF ou image)
3. Cliquer **📤 Déposer et soumettre**

#### Déposer le test en production

Une fois le BAT validé par le PO et le ciblage Data validé :

1. Onglet du canal → section **🔬 Test en production**
2. Joindre la **capture d'écran** ou le fichier de test
3. Cliquer **📤 Déposer et soumettre**

---

### Rôle : Data

#### Déposer le ciblage

1. Ouvrir la campagne → cliquer sur l'onglet du canal
2. Dans la section **🎯 Ciblage Data** :
   - Renseigner **Code Projet**, **Code Action**, **Code MK**
   - Indiquer le **chemin de la requête**
3. Cliquer **📤 Déposer et soumettre**

#### Lancement test (`data_lancement_test`)

Étape intermédiaire entre la validation ciblage et le test EBF :

1. Onglet du canal → section **🚀 Lancement test**
2. Renseigner la **cible de test** (description de l'échantillon)
3. Cliquer **📤 Déposer et soumettre**

#### Confirmer la mise en production (MEP)

Quand toutes les étapes précédentes sont validées :

1. Onglet du canal → section **🚀 Mise en production**
2. Renseigner la **date effective de MEP** et un commentaire si nécessaire
3. Cliquer **🚀 Confirmer la mise en production**

Quand tous les canaux sont confirmés, la campagne passe en statut **Terminée 🏁**.

---

### Rôle : PO (Product Owner / Responsable campagne)

Le PO valide ou demande des modifications à chaque étape clé.

#### Où trouver les validations en attente

- Depuis le **tableau de bord** : les campagnes avec une action PO apparaissent dans "À produire"
- Depuis la campagne → onglet **Infos campagne** : des bandeaux orange indiquent les validations en attente avec un bouton direct vers le canal concerné

#### Valider ou demander une modification

1. Ouvrir la campagne → cliquer sur le canal à valider
2. Le bloc de validation apparaît en bas de la section concernée :
   - **✅ Valider** : le workflow passe à l'étape suivante
   - **🔄 Demander modification** : saisir un commentaire puis cliquer **📤 Envoyer la demande**

La personne concernée (COM, EBF ou Data) voit le badge "Révision demandée" à sa prochaine connexion.

#### Étapes soumises à validation PO

| Étape | Soumise par | Action PO |
|-------|-------------|-----------|
| Maquette Com | COM | Valider ou demander modification |
| Réalisation BAT | EBF | Valider ou demander modification |
| Ciblage Data | Data | Valider ou demander modification |
| Test en production | EBF | Valider (capture d'écran obligatoire) |

#### Validation juridique (si activée)

Si la campagne nécessite une validation juridique (cochée lors de la création) :
- Un encart ⚖️ **Juridique** apparaît dans l'onglet **Infos campagne**
- Le PO peut y ajouter ses commentaires et cocher la validation

---

## Espace documentaire

Chaque campagne dispose d'un espace documentaire accessible via l'onglet **📁 Documents** dans la page détail.

- **Créer un sous-dossier** : saisir le nom et cliquer "+ Dossier"
- **Uploader des fichiers** : sélectionner le dossier cible, cliquer "+ Fichiers" et sélectionner un ou plusieurs fichiers
- **Parcourir** : cliquer sur un dossier pour naviguer, sur un fichier pour l'ouvrir

Les fichiers sont stockés directement dans `V://Campagnes/<Nom>/documents/`.

---

## Comité Éditorial (managers uniquement)

La page **Comité Éditorial** affiche le planning des zones site web sous forme de Gantt.

### Lire le Gantt

- **Lignes** = zones du site web (chaque emplacement est une ligne séparée pour Menu Burger et Zone Authentification)
- **Colonnes** = semaines
- **Blocs colorés** = campagnes occupant une zone sur une période
  - 🟢 Vert = zone confirmée
  - 🟠 Orange = en attente d'approbation
  - ⬜ Gris = campagne inactive

### Filtres

- **Tabs Particuliers / Banque Privée / Pro / Agri** : filtrer par marché
- **Navigation ◀ ▶** : naviguer dans le temps (par périodes de ~10 semaines)
- **Statut** : afficher tout, uniquement les confirmées, ou uniquement les en attente

### Consulter et approuver une zone

Cliquer sur un bloc → un **panel latéral** s'ouvre avec :
- Les détails de la campagne (période, statut, PO, canal)
- La liste des conflits détectés (si applicable)
- Les boutons **Approuver** / **Refuser** si la zone est en attente

### Résoudre un conflit

Si une campagne est en conflit avec une autre :

1. Cliquer sur le bloc en conflit (bordure rouge clignotante)
2. Le panel affiche la liste des campagnes en conflit
3. Cliquer **Repositionner →** sur la campagne à déplacer
4. Modifier la **zone**, les **dates** ou l'**emplacement**
5. Cliquer **Sauvegarder**
6. Le panel revient automatiquement au détail avec les conflits recalculés

---

## Discussion

Chaque campagne dispose d'un fil de discussion accessible depuis l'onglet **Infos campagne**, en bas de page. Vous pouvez :

- Écrire un commentaire visible par toute l'équipe
- Liker un message avec 👍

---

## Questions fréquentes

**Je ne vois pas mes campagnes sur le tableau de bord.**
→ Vérifier que votre nom est bien sélectionné en haut à droite. Si le problème persiste, cliquer "Reconstruire l'index".

**Je ne peux pas soumettre un canal.**
→ Vérifier que vous êtes bien la personne assignée à ce canal (votre nom doit figurer dans l'affectation faite par le Manager).

**Mon dépôt a disparu après navigation.**
→ Normal si vous venez de changer d'onglet — les données sont rechargées depuis `V://`. Si le fichier n'apparaît plus du tout, vérifier qu'il existe dans `V://Campagnes/<Nom>/<Canal>/`.

**Les dates de zone site web se décalent automatiquement.**
→ Normal — les dates sont snappées au lundi de la semaine sélectionnée (contrainte de planning hebdomadaire).

**L'app ne répond plus / page blanche.**
→ Consulter le [plan de régression](REGRESSION_PLAN.md).
