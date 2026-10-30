# Carto Process — immersion sur un poste

Mini-logiciel (HTML, CSS, JS, sans dépendance) qui accompagne une immersion auprès d'une personne, de la première tâche relevée jusqu'au dossier de restitution.

## Utilisation

Ouvrir `index.html` dans le navigateur (double-clic). Pas d'installation, pas de serveur, fonctionne hors ligne.

La page d'accueil « Mes immersions » liste toutes les immersions (une par poste accompagné) et donne le bilan par année : temps gagné par service et par mois, avant / après poste par poste, risque « personne clé ». On ouvre une immersion pour la mener en 4 phases.

Les données restent dans le navigateur du poste. Exporter une sauvegarde chaque soir (page d'accueil → Sauvegarde).

## Les 4 phases

1. **Immersion** (avec la personne) : une fiche par tâche, remplie de haut en bas — nom, description, fréquence, déclencheur, résultat, puis le déroulé étape par étape (qui, outil, données, minutes, attente avant la suite, ce qui coince, choix entre plusieurs chemins) et le risque « personne clé ». Le schéma se dessine tout seul et se fait valider par la personne.
2. **Réflexion** (seul) : pour chaque étape qui coince, choisir une idée proposée ou écrire sa solution. Aucun temps à saisir.
3. **Validation** (avec la personne) : pour chaque solution, elle estime le nouveau temps, les manipulations évitées et la nouvelle attente ; les gains se calculent automatiquement. On réévalue le risque « personne clé ».
4. **Restitution** : plan d'action (effort, porteur, échéance, statut, matrice effort / gain, suivi du gain réel mesuré après mise en place) et dossier imprimable (PDF) ou exportable en PowerPoint.

## Fichiers

- `index.html` — structure
- `style.css` — mise en forme (écran et impression)
- `app.js` — logique, calculs, schémas, données de démonstration
- `lib/pptxgen.bundle.js` — bibliothèque PptxGenJS (licence MIT) pour l'export PowerPoint, embarquée pour fonctionner hors ligne. Garder le dossier `lib` à côté de `index.html`.
