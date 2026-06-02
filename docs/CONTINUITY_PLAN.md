# Plan de continuité — Maintenir la production si l'app est indisponible

Ce document s'adresse aux utilisateurs (COM, EBF, Data, Manager, PO). Il décrit comment continuer à travailler manuellement pendant une indisponibilité de l'application Impulsion Marketing.

---

## Ce que l'app fait, et comment le faire à la main

### 1. Suivre l'avancement des campagnes

**Dans l'app :** tableau de bord avec statut de chaque campagne et étape en cours.

**En mode dégradé :**
- Utiliser le fichier de suivi Excel partagé sur `V://` (si existant) ou en créer un temporairement
- Colonnes minimales : Nom campagne | PO | COM | EBF | Data | Étape en cours | Statut
- Mettre à jour manuellement après chaque action

---

### 2. Déposer une maquette COM

**Dans l'app :** formulaire de dépôt avec URL Figma, images, fichier PDF.

**En mode dégradé :**
1. Déposer directement le fichier maquette (PDF ou image) dans le dossier de la campagne sur `V://` :
   `V://Campagnes/<Nom Campagne>/<Nom Canal>/`
2. Envoyer un email au PO de la campagne avec :
   - Objet : `[MAQUETTE] <Nom Campagne> — <Nom Canal>`
   - Corps : URL Figma, nombre d'images, validation juridique (Oui/Non), chemin du fichier déposé
3. Copier le Manager en CC

---

### 3. Valider une maquette (PO)

**Dans l'app :** bouton de validation ou demande de modification avec commentaire.

**En mode dégradé :**
- **Validation** : répondre à l'email du COM avec `✅ VALIDÉ`
- **Demande de modification** : répondre avec `🔄 MODIFICATION DEMANDÉE` + description précise de la modification

---

### 4. Déposer un BAT EBF

**Dans l'app :** formulaire avec webmaster, code com, ref paracom, fichier BAT.

**En mode dégradé :**
1. Déposer le fichier BAT dans `V://Campagnes/<Nom Campagne>/<Nom Canal>/`
2. Envoyer un email au PO avec :
   - Objet : `[BAT] <Nom Campagne> — <Nom Canal>`
   - Corps : Webmaster, Code Com, Ref Paracom, nombre de CTA, URLs CTA, chemin du fichier

---

### 5. Déposer le ciblage Data

**En mode dégradé :**
1. Envoyer un email au PO avec :
   - Objet : `[CIBLAGE] <Nom Campagne> — <Nom Canal>`
   - Corps : Code Projet, Code Action, Code MK, Chemin de la requête

---

### 6. Confirmer le test en production (EBF)

**En mode dégradé :**
1. Déposer la capture d'écran dans `V://Campagnes/<Nom Campagne>/<Nom Canal>/`
2. Envoyer email au PO :
   - Objet : `[TEST PROD] <Nom Campagne> — <Nom Canal>`
   - Corps : confirmation + chemin de la capture

---

### 7. Confirmer la MEP Data

**En mode dégradé :**
- Envoyer email à l'équipe (Manager + PO) :
  - Objet : `[MEP] <Nom Campagne> — <Nom Canal>`
  - Corps : Date effective de mise en production + commentaire éventuel

---

## Reprendre dans l'app quand elle est de nouveau disponible

Une fois l'application rétablie, il faut **resynchroniser** les actions réalisées manuellement.

### Ordre de reprise

1. **Reconstruire l'index** : cliquer "Reconstruire l'index" sur le dashboard pour s'assurer que toutes les campagnes sont visibles
2. **Pour chaque campagne traitée manuellement** :
   - Ouvrir la campagne dans `details.html`
   - **Rejouer les actions dans l'ordre du workflow** : si la maquette a été validée par email, le PO doit cliquer ✅ Valider dans l'app pour faire avancer le workflow
   - Déposer les fichiers via les formulaires de l'app (même si les fichiers sont déjà dans le dossier `V://`)
3. **Vérifier la timeline** : dans "Infos campagne", la timeline doit refléter l'état réel de la campagne

### Important

- Ne pas sauter d'étapes dans l'app même si elles ont déjà été réalisées par email — chaque étape doit être complétée dans l'ordre pour que le workflow avance correctement
- Conserver les emails envoyés pendant la période de dégradation comme preuve de traçabilité

---

## Contacts en cas de problème technique

| Rôle | Action |
|------|--------|
| Utilisateur bloqué | Suivre le [plan de régression](REGRESSION_PLAN.md) d'abord |
| Problème non résolu | Contacter le développeur de l'application |
| Urgence production | Appliquer ce plan de continuité et informer le Manager |
