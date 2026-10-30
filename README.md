# Carto Process — immersion sur un poste

Mini-logiciel (HTML, CSS, JS, sans dépendance) qui accompagne une immersion auprès d'une personne, de la première tâche relevée jusqu'au dossier de restitution.

## Utilisation

Ouvrir `index.html` dans le navigateur (double-clic). Pas d'installation, pas de serveur, fonctionne hors ligne.

La page d'accueil « Mes immersions » liste toutes les immersions (une par poste accompagné) et donne le bilan par année : temps gagné par service et par mois, avant / après poste par poste, risque « personne clé ». On ouvre une immersion pour la mener en 4 phases.

## Enregistrement des données

Au premier lancement (Edge ou Chrome), choisir une fois le dossier `donnees-production` situé à côté de `index.html` (« Mes immersions » → « Dossier de données »). Ensuite :

- chaque immersion a son sous-dossier `AAAA-MM - Poste - Prénom` avec `immersion.json`, enregistré automatiquement pendant la saisie ;
- les exports (PowerPoint, schémas, CSV) sont déposés dans ce sous-dossier ;
- au démarrage, l'outil relit le dossier (un clic « Ouvrir le dossier » si le navigateur le demande).

Sans dossier connecté, les données restent dans le navigateur : exporter alors une sauvegarde chaque jour. Le contenu de `donnees-production/` est exclu de Git (`.gitignore`).

## Les 4 phases

1. **Immersion** (avec la personne) : une fiche par tâche, remplie de haut en bas — nom, description, fréquence, déclencheur, résultat, puis le déroulé étape par étape (qui, outil, données, minutes, attente avant la suite, ce qui coince, choix entre plusieurs chemins) et le risque « personne clé ». Le schéma se dessine tout seul et se fait valider par la personne.
2. **Réflexion** (seul) : pour chaque étape qui coince, choisir une idée proposée ou écrire sa solution. Aucun temps à saisir.
3. **Validation** (avec la personne) : pour chaque solution, elle estime le nouveau temps, les manipulations évitées et la nouvelle attente ; les gains se calculent automatiquement. On réévalue le risque « personne clé ».
4. **Restitution** : gain en heures, ETP et euros, pénibilité et erreurs avant / après, plan d'action (effort, coût et retour sur investissement, porteur, échéance, statut, matrice effort / gain, suivi du gain réel mesuré après mise en place) et dossier imprimable (PDF) ou exportable en PowerPoint, avec une version anonyme pour la vitrine.

## Fichiers

- `index.html` — structure
- `style.css` — mise en forme (écran et impression)
- `app.js` — logique, calculs, schémas, données de démonstration
- `lib/pptxgen.bundle.js` — bibliothèque PptxGenJS (licence MIT) pour l'export PowerPoint, embarquée pour fonctionner hors ligne. Garder le dossier `lib` à côté de `index.html`.
