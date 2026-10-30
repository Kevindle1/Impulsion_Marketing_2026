# Carto Process — immersion sur un poste

Mini-logiciel (HTML, CSS, JS, sans dépendance) qui accompagne une immersion auprès d'une personne, de la première tâche relevée jusqu'au dossier de restitution.

## Utilisation

Ouvrir `index.html` dans le navigateur (double-clic). Pas d'installation, pas de serveur, fonctionne hors ligne.

Les données restent dans le navigateur du poste. Exporter une sauvegarde chaque soir (page d'accueil → Sauvegarde).

## Les 4 phases

1. **Immersion** (avec la personne) : une fiche par tâche, remplie de haut en bas — nom, description, fréquence, déclencheur, résultat, puis le déroulé étape par étape (qui, outil, minutes, ce qui coince) et le risque « personne clé ». Le schéma se dessine tout seul.
2. **Réflexion** (seul) : pour chaque étape qui coince, choisir une idée proposée ou écrire sa solution. Aucun temps à saisir.
3. **Validation** (avec la personne) : pour chaque solution, elle estime le nouveau temps ; le gain se calcule automatiquement. On réévalue le risque « personne clé ».
4. **Restitution** : dossier imprimable (PDF) — temps gagné, tâches simplifiées, irritants levés, risque personne clé, schémas avant/après.

## Fichiers

- `index.html` — structure
- `style.css` — mise en forme (écran et impression)
- `app.js` — logique, calculs, schémas, données de démonstration
