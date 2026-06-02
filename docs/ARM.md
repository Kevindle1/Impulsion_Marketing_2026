# ARM — Analyse de Risques et Mesures
## 831-2026-004 — Impulsion Marketing | 831 - Toulouse

> Type : **Évolution** | Catégorie : **SSI / RGPD**
> Statut formulaire : En cours de saisie (80 % des champs obligatoires complétés)

---

## 1. Description du périmètre à analyser ✅

### Questions préliminaires

| Question | Réponse |
|---|---|
| Des données sont-elles externalisées (échangées, traitées, stockées) par un prestataire externe ? | **Non** |
| L'évolution ou le service mis en place concerne-t-il une externalisation ? | **Non** |
| L'évolution concerne-t-elle une fonctionnalité exposée sur internet (SELI/RALI) ? | **Non** |
| L'évolution modifie-t-elle une ou des Infrastructure(s) existante(s) ? | **Non** |
| L'évolution concerne-t-elle la création / modification d'APIs ? | **Non** |

### Descriptif général du périmètre et résultats produits

Cette solution permet l'archivage de nos campagnes marketing ainsi que des livrables qui les composent (maquettes COM, BAT EBF, ciblages Data, fichiers de dépôt). Elle est utilisée exclusivement en interne par les équipes Marketing, Communication, EBF et Data de Crédit Agricole Toulouse 31.

**Ce qui est inclus dans le périmètre :**
- Création et gestion de campagnes marketing (formulaire multi-étapes)
- Suivi du workflow de production par canal (COM → EBF → Data)
- Dépôt et consultation de livrables (maquettes, BAT, fichiers ciblage)
- Planning éditorial des zones site web (Comité Éditorial)
- Tableau de pilotage et indicateurs pour les managers

**Ce qui est exclu du périmètre :**
- Tout traitement de données clients ou prospects
- Toute exposition sur internet ou réseau externe
- Tout système de paiement ou traitement financier

**Scénarios de risques identifiés :**
- *Indisponibilité du lecteur réseau V://* : perte d'accès temporaire à l'outil → impact faible, les campagnes continuent via les outils existants
- *Altération accidentelle d'un fichier campagne.json* : données incorrectes affichées → impact faible, corrigeable manuellement
- *Accès non autorisé au lecteur réseau* : déjà couvert par les droits d'accès réseau du SI

---

## 2. Obligations, contraintes et politiques de sécurité ✅

| Question | Réponse |
|---|---|
| Une (des) Politique(s) de sécurité s'applique(nt)-elle(s) à l'évolution analysée ? | **Oui** |
| Existe-t-il des mesures de sécurité mises en place pour l'archivage légal ? | **Non** |

**Politiques applicables :** Politique de sécurité du SI Crédit Agricole Toulouse 31 — accès réseau interne, gestion des habilitations collaborateurs.

---

## 3. Analyse des enjeux par grandes fonctionnalités ✅

### Fonctionnalité 1 — Création et dépôt de campagne

**Description :** Interface de création d'une campagne ainsi que 3 interfaces de dépôt de livrables demandées lors de la création de la campagne (maquette COM, BAT EBF, ciblage Data).

#### Tableau DICPNR

| Critère | Et si… | Impacts métier | Niveau d'impact |
|---|---|---|---|
| **D** — Disponibilité | …ne fonctionne plus | Faible / Nul sur tous les axes (Financier, Disciplinaire, Pénal, Activité, Image) | **1** |
| **I** — Intégrité | …produit/contient des résultats faux | Faible / Nul sur tous les axes | **1** |
| **C** — Confidentialité | …des informations sont indûment divulguées | Faible / Nul sur tous les axes | **1** |
| **P** — Preuve | …les traces ne sont pas fournies ou exactes | Faible / Nul sur tous les axes | **1** |
| **NR** — Numérique Responsable | …le service n'est pas sobre et accessible | Faible / Nul sur tous les axes | **1** |

---

### Fonctionnalité 2 — Visualisation d'une campagne

**Description :** Cette fonctionnalité permet de voir une campagne marketing et les livrables qui la constituent (onglets par canal, documents, workflow, fil de discussion).

#### Tableau DICPNR

| Critère | Et si… | Impacts métier | Niveau d'impact |
|---|---|---|---|
| **D** — Disponibilité | …ne fonctionne plus | Faible / Nul sur tous les axes | **1** |
| **I** — Intégrité | …produit/contient des résultats faux | Faible / Nul sur tous les axes | **1** |
| **C** — Confidentialité | …des informations sont indûment divulguées | Faible / Nul sur tous les axes | **1** |
| **P** — Preuve | …les traces ne sont pas fournies ou exactes | Faible / Nul sur tous les axes | **1** |
| **NR** — Numérique Responsable | …le service n'est pas sobre et accessible | Faible / Nul sur tous les axes | **1** |

---

## 4. Objectifs de sécurité ⚠️ (à compléter)

| Critère | Cotation | Justification |
|---|---|---|
| **D** — Disponibilité | **1** | Outil interne non critique : les processus métier peuvent fonctionner sans l'outil sur courte durée |
| **I** — Intégrité | **1** | Les données sont des métadonnées de campagnes internes sans impact financier direct |
| **C** — Confidentialité | **1** | Données internes non sensibles, accessibles uniquement aux collaborateurs habilités sur le réseau |
| **P** — Preuve | **1** | Pas d'obligation réglementaire de traçabilité sur cet outil |
| **NR** — Numérique Responsable | **1** | Application légère (SPA statique), sans serveur, sans traitement batch lourd |

---

## 5. Objectifs de continuité ✅

| Question | Réponse |
|---|---|
| L'évolution contribue-t-elle à un processus essentiel défini par le Groupe (DRG/SCA) ? | **Non** |

| Paramètre | Valeur | Justification |
|---|---|---|
| **DIMA** | **1 semaine (>1s)** | Disponibilité cotée à 1 — l'outil peut être indisponible sans impact significatif sur l'activité |
| **PDMA** | **1 journée** | Les données sont sauvegardées sur le lecteur réseau V:// avec sauvegarde journalière |

**Justification DIMA/PDMA :** RAS — outil de pilotage interne non critique pour la continuité d'activité immédiate.

**Solutions de continuité et procédures de contournement :**
- Enregistrement des campagnes et livrables qui les composent via les outils bureautiques existants (SharePoint, emails)
- Visualisation des campagnes et communications via les fichiers source sur le lecteur réseau

**Commentaire sur le cadre de sécurité :**
Dans un premier temps, la solution est déployée sur un lecteur réseau V:// accessible uniquement aux collaborateurs habilités. L'accès est contrôlé par les droits AD (Active Directory) existants du SI Crédit Agricole Toulouse 31.

Par la suite, il serait possible de déployer la solution sur un serveur interne avec accès restreint par adresse IP.

---

## 6. Identification et traitement des risques ⚠️ (en cours)

### Mesures de sécurité en place

| Mesure | Statut | Détail |
|---|---|---|
| Authentification applicative | ✅ Partielle | Sélecteur utilisateur côté client (sans authentification forte — accès conditionné par les droits réseau) |
| Habilitation (profils et rôles) | ✅ En place | Système de rôles : Super Admin, Manager, Marketing/PO, Com, EBF, Data — droits différenciés par rôle |
| Chiffrement (stockage, flux, données) | ➖ Non applicable | Données stockées sur lecteur réseau interne chiffré par le SI — pas de flux externes |
| Intégrité (contrôles d'intégrité) | ✅ Partielle | Validation des JSON, gestion des fichiers corrompus (try/catch), sanitisation des noms de fichiers |
| Traçabilité et preuves | ➖ Limitée | Pas de logs applicatifs formels — les fichiers JSON sur V:// font office de trace |
| Sécurité dans le développement | ✅ En place | Échappement HTML systématique (XSS), validation des URLs, pas de dépendances externes |
| Scan de sécurité | ➖ Non réalisé | Application statique sans backend — surface d'attaque limitée |
| Revue de sécurité | ➖ À planifier | |
| Mesures organisationnelles | ✅ En place | Accès limité aux collaborateurs du service Marketing / équipes concernées |
| Sauvegarde des données | ✅ En place | Sauvegarde journalière du lecteur réseau V:// par le SI |
| Revue d'habilitations | ➖ À planifier | Revue annuelle des droits d'accès réseau recommandée |
| Workflow de validation | ✅ En place | Validation multi-niveaux par canal (COM → EBF → Data → PO) avec traçabilité dans campagne.json |

---

## 7. Informations complémentaires

| Champ | Valeur |
|---|---|
| Référence ARM | 831-2026-004 |
| Entité | 831 — Toulouse |
| Date de création | 05/02/2026 |
| Dernière modification | 05/02/2026 à 16:06 |
| Version | Version 1 |

---

*Document préparé dans le cadre de la démarche SSI/RGPD de Crédit Agricole Toulouse 31. Les informations saisies restent objectives et ne contiennent pas de données sensibles au sens RGPD.*
