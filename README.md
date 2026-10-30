# Carto Process — diagnostic de poste

Mini-logiciel (HTML, CSS, JS, sans dépendance) pour cartographier les processus d'un poste, repérer les irritants, chiffrer les temps et proposer des améliorations.

## Utilisation

Ouvrir `index.html` dans le navigateur (double-clic). Pas d'installation, pas de serveur, fonctionne hors ligne.

Les données restent dans le navigateur du poste (localStorage). Pensez à exporter régulièrement une sauvegarde JSON (*Mission & poste → Données*).

## Démarche (5 temps)

1. **Inventaire** : répertorier tous les processus du poste (volume, criticité, statut).
2. **Cadrage** : finalité, début/fin, vue SIPOC, acteurs, outils, notes d'entretien.
3. **Relevé des étapes** : qui, quel outil, quelles données, durée (min), % des cas, irritants (R ressaisie, M retraitement manuel, S suivi).
4. **Cartographie actuelle** : diagramme BPMN simplifié en couloirs, généré automatiquement ; export PNG, SVG et CSV pour Visio (Data Visualizer).
5. **Analyse & cible** : pistes d'amélioration, matrice effort/gain, cartographie cible, gains annuels (temps, ETP, manipulations évitées, traçabilité, contrôles).

La page **Synthèse** rassemble tout dans une vue imprimable (PDF) pour la restitution.

## Fichiers

- `index.html` — structure
- `style.css` — mise en forme (écran et impression)
- `app.js` — logique, calculs, diagrammes, données de démonstration
