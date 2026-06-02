# Backlog — Impulsion Marketing
> Dernière mise à jour : 2026-03-12

---

## Tableau complet des fonctionnalités

| Statut | Fonctionnalité |
|--------|----------------|
| **TABLEAU DE BORD** | |
| ✅ Fait | Affichage de la liste des campagnes (cards) |
| ✅ Fait | Recherche / filtre par nom, description, PO |
| ✅ Fait | Filtre par étape du workflow |
| ✅ Fait | Filtre actif/inactif |
| ✅ Fait | Tri par urgence (date de mise en ligne) |
| ✅ Fait | Badge délai avant mise en ligne (Dans X j / Dépassé) |
| ✅ Fait | Badge alerte volume élevé (> 100 000) |
| ✅ Fait | Bouton Reconstruire l'index |
| ✅ Fait | Sélecteur d'utilisateur connecté (header) |
| ✅ Fait | Cloche de notifications (badge non-lu) |
| ✅ Fait | Panel notifications (liste filtrée par utilisateur, marquage lu) |
| ✅ Fait | Charger / mémoriser le dossier racine V:// |
| ✅ Fait | Activation / désactivation d'une campagne |
| ✅ Fait | Suppression d'une campagne (avec confirmation) |
| 💬 En réflexion | Score de valeur automatique par campagne (critères + poids à arbitrer) |
| **CRÉATION DE CAMPAGNE** | |
| ✅ Fait | Formulaire multi-étapes (4 étapes + indicateur de progression) |
| ✅ Fait | Étape 1 — Nom, PO, description, date lancement, typologie, marché, récurrence |
| ✅ Fait | Étape 1 — Produit cible, URL produit, date validité offre |
| ✅ Fait | Étape 1 — Campagne liée (lien vers une autre campagne) |
| ✅ Fait | Étape 1 — Validation juridique conditionnelle (checkbox + commentaire) |
| ✅ Fait | Étape 2 — Segments cibles (multi-sélection, 25 segments) |
| ✅ Fait | Étape 2 — Univers de besoin (multi-sélection, 8 univers) |
| ✅ Fait | Étape 2 — Persona |
| ✅ Fait | Étape 3 — Ajout de canaux (jusqu'à 10 canaux) |
| ✅ Fait | Étape 3 — Type canal (17 types : MAIL, SMS, MDC, Site web, etc.) |
| ✅ Fait | Étape 3 — Objet email par canal |
| ✅ Fait | Étape 3 — Type de COM, date d'envoi, critères ciblage |
| ✅ Fait | Étape 3 — Volume cible par canal (alerte si > 100 000) |
| ✅ Fait | Étape 3 — URLs Comstore multiples par canal |
| ✅ Fait | Étape 3 — Zone site web + marché + univers/emplacement + dates (si canal site web) |
| ✅ Fait | Étape 3 — Snap automatique des dates au lundi (timezone-safe) |
| ✅ Fait | Détection de conflit de zone au moment de la création |
| ✅ Fait | Soumission en attente si conflit détecté |
| ✅ Fait | Validation des champs requis + messages d'erreur toasts |
| ✅ Fait | Création du dossier campagne sur V:// + mise à jour index |
| ✅ Fait | Redirection automatique vers la page détail après création |
| 💬 En réflexion | Duplication de campagne (clone) |
| **DÉTAIL CAMPAGNE** | |
| ✅ Fait | Affichage des infos générales (PO, description, marché, dates…) |
| ✅ Fait | Affichage campagne liée (lien cliquable vers la campagne associée) |
| ✅ Fait | Encart juridique ⚖️ (si activé) avec commentaire et validation PO |
| ✅ Fait | Timeline workflow verticale avec statut de chaque étape |
| ✅ Fait | Navigation par onglets (Infos + un onglet par canal + Documents) |
| ✅ Fait | Bouton éditer la campagne |
| ✅ Fait | Activation / désactivation de la campagne |
| ✅ Fait | Suppression de la campagne |
| ✅ Fait | Suppression d'un canal individuel |
| ✅ Fait | Fil de discussion (commentaires + likes 👍) |
| **WORKFLOW — ÉTAPES** | |
| ✅ Fait | Étape : Affectation manager (multi-membres par équipe) |
| ✅ Fait | Étape : Kick-off (date + notes par participant + lien Teams) |
| ✅ Fait | Étape : Dépôt maquette COM (Figma, images, PDF) |
| ✅ Fait | Étape : Validation maquette PO (par canal) |
| ✅ Fait | Étape : Réalisation BAT EBF (Code Com, Paracom, CTAs, PDF) |
| ✅ Fait | Étape : Validation BAT PO (par canal) |
| ✅ Fait | Étape : Ciblage Data (Code Projet, Code Action, Code MK, requête) |
| ✅ Fait | Étape : Lancement test Data (cible de test, dépôt depotdata_test.json) |
| ✅ Fait | Étape : Validation ciblage PO (par canal) |
| ✅ Fait | Étape : Test en production EBF (capture d'écran) |
| ✅ Fait | Étape : Validation test PO (par canal) |
| ✅ Fait | Étape : Mise en production Data (date MEP + commentaire) |
| ✅ Fait | Déverrouillage automatique des étapes selon dépendances |
| ✅ Fait | Système de demande de révision PO → équipe (commentaire par canal) |
| ✅ Fait | Validation PO scopée par canal (channelValidations) |
| ✅ Fait | Rétrocompatibilité avec les données legacy (anciens formats JSON) |
| **WORKFLOW — RÔLES ET AFFECTATION** | |
| ✅ Fait | Affectation multi-membres par équipe (cases à cocher) |
| ✅ Fait | Réaffectation à tout moment par le manager |
| ✅ Fait | Ajout d'un membre à une équipe à tout moment |
| ✅ Fait | Manager général (Resp. Marketing) : voit les 3 équipes |
| ✅ Fait | Manager d'équipe (COM / EBF / Data) : gère uniquement son équipe |
| ✅ Fait | PO : actions de validation sur les étapes clés |
| 💬 En réflexion | Règle de changement d'équipe après affectation (historique, droits) |
| **ESPACE DOCUMENTAIRE** | |
| ✅ Fait | Onglet 📁 Documents dans la page détail |
| ✅ Fait | Arborescence de dossiers (navigation hiérarchique) |
| ✅ Fait | Création de sous-dossiers |
| ✅ Fait | Upload multi-fichiers (FileSystem API) |
| ✅ Fait | Ouverture de fichiers directement depuis le navigateur |
| 💬 En réflexion | Restriction des types de fichiers uploadables |
| 💬 En réflexion | Génération automatique d'un PDF bilan de campagne |
| **COMITÉ ÉDITORIAL — GANTT** | |
| ✅ Fait | Vue Gantt zones site web × semaines |
| ✅ Fait | Filtres par marché (tabs : Particuliers / Banque Privée / Pro / Agri) |
| ✅ Fait | Navigation temporelle (périodes de ~10 semaines) |
| ✅ Fait | Filtre par statut (Tous / Confirmé / En attente) |
| ✅ Fait | Zones multi-lignes : Menu Burger (4 univers) |
| ✅ Fait | Zones multi-lignes : Zone Authentification (5 emplacements simultanés) |
| ✅ Fait | Color-coding par campagne (couleur unique par campagne) |
| ✅ Fait | Affichage différencié : confirmée / en attente / inactive / refusée |
| ✅ Fait | Légende des statuts |
| ✅ Fait | Bouton Actualiser |
| **COMITÉ ÉDITORIAL — CONFLITS** | |
| ✅ Fait | Détection automatique des conflits (même zone + marché + univers + dates) |
| ✅ Fait | Bordure rouge clignotante sur les blocs en conflit |
| ✅ Fait | Lane stacking (empilage vertical des blocs en conflit) |
| ✅ Fait | Panel latéral : détail campagne au clic |
| ✅ Fait | Panel latéral : liste des conflits avec badges statut |
| ✅ Fait | Formulaire de repositionnement inline (zone + emplacement + dates) |
| ✅ Fait | Sauvegarde du repositionnement (mémoire + filesystem) |
| ✅ Fait | Retour automatique au détail avec conflits recalculés après repositionnement |
| ✅ Fait | Approbation de zone (manager) |
| ✅ Fait | Refus de zone (manager) |
| **PAGE CAMPAGNES (VISUALIZATION)** | |
| ✅ Fait | Liste de toutes les campagnes avec recherche et filtres |
| ✅ Fait | Filtre par univers de besoin, canal, typologie |
| ✅ Fait | Bascule "Mes campagnes" |
| ✅ Fait | Barre de progression (avancement workflow) |
| ✅ Fait | Cache IndexedDB des métadonnées (TTL 5 min) |
| **PILOTAGE (MANAGERS)** | |
| ✅ Fait | Cartes KPI : total, actives, terminées, taux moyen |
| ✅ Fait | Répartition par marché |
| ✅ Fait | Répartition par typologie |
| ✅ Fait | Répartition par canal |
| ✅ Fait | Tableau des campagnes récentes avec progression |
| 💬 En réflexion | Indicateur : nombre de campagnes par segment |
| **NOTIFICATIONS** | |
| ✅ Fait | _notifications.json sur V:// (fichier central) |
| ✅ Fait | Cloche dashboard avec badge compteur non-lu |
| ✅ Fait | Panel notifications filtré par utilisateur connecté |
| ✅ Fait | Marquage lu au clic + réécriture du fichier |
| ✅ Fait | Type : conflit zone en attente d'approbation |
| ✅ Fait | Type : zone approuvée |
| ✅ Fait | Type : zone refusée |
| **PERFORMANCE & CACHE** | |
| ✅ Fait | IndexedDB IndexCache (_index.json, TTL 60 s) |
| ✅ Fait | IndexedDB MetadataCache (campagne.json, TTL 5 min) |
| ✅ Fait | Stratégie stale-while-revalidate |
| ✅ Fait | Chargement parallèle (×20 concurrence) |
| ✅ Fait | Reconstruction complète de l'index depuis V:// |
| **SÉCURITÉ** | |
| ✅ Fait | Échappement HTML systématique (escapeHtml) |
| ✅ Fait | Sanitisation des noms de fichiers (sanitizeName) |
| ✅ Fait | Validation des URLs (https:// ou http:// uniquement) |
| ✅ Fait | Gestion des JSON corrompus (try/catch, données vides par défaut) |
| **INTÉGRATIONS EXTERNES** | |
| ✅ Fait | Lien Microsoft Planner (sidebar) |
| ✅ Fait | Lien Galerie média Crédit Agricole (sidebar) |
| ✅ Fait | Génération lien réunion Microsoft Teams (Kick-off) |
| ✅ Fait | URLs Figma par canal (maquette COM) |
| ✅ Fait | URLs Comstore par canal (multiples) |
| ✅ Fait | URL TicTac par canal |
| 💬 En réflexion | Intégration BAT et test en prod sans ciblage final validé |
| **EVOLUTIONS EN RÉFLEXION** | |
| 💬 En réflexion | Score de valeur automatique (critères + poids + gouvernance à arbitrer) |
| 💬 En réflexion | Module AB Test natif (variantes + comparaison de résultats) |
| 💬 En réflexion | Génération automatique d'un PDF bilan (template à définir) |
| 💬 En réflexion | Affichage du chemin vers l'échantillon de ciblage |
| 💬 En réflexion | Règle de changement d'équipe après affectation (historique) |
| 💬 En réflexion | Indicateur nombre de campagnes par segment dans pilotage.html |
| 💬 En réflexion | Gestion spécifique ZDG / Perso (poids de zone, règles métier à préciser) |

---

## Sprints livrés

| Sprint | Période | Items |
|--------|---------|-------|
| Sprint 1 | 2026-03-02 | Items 1–6 — Corrections UI + champs formulaire |
| Sprint 2 | 2026-03-02 | Items 7, 8, 9, 12 — Tri, filtres, délai, volumes |
| Sprint 3 | 2026-03-02 | Items 10, 11, 13, 14 — Validation PO par canal, suppressions |
| Sprint 4 | 2026-03-02 | Items 15, 16, 17, 20 — Affectation multi-membres, réaffectation |
| Sprint 5 | 2026-03-03 | Items 18, 19 — Kick-off + Lancement test |
| Sprint 6 | 2026-03-12 | Items 21, 22, 23, 24 — Documentaire, campagne liée, Comstore, Juridique |
| Sprint 7 | 2026-03-12 | Items 26, 27 — Comité Éditorial complet + Notifications + Fix snapToMonday |
