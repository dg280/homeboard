---
from: core
to: homeboard
created: 2026-06-26T20:19:15+0200
status: open
priority: normal
task: "Ajouter un widget marée (Gujan-Mestras / Bassin d'Arcachon) au dashboard homeboard"
context: "Demande de Didier en conversation core 2026-06-26. homeboard affiche déjà la météo multi-villes (dont Gujan-Mestras) ; la marée est l'info domestique manquante. Réf horaires : mareespeche.com / horaire-maree.fr, calés jetée d'Eyrac (Arcachon) avec ~10-15 min de décalage sur les ports de Gujan."
due:
source: "conversation utilisateur 2026-06-26 ~20:15"
---

# Widget marée Gujan-Mestras dans homeboard

## Demande de Didier (paraphrase)

> Ajouter l'affichage de la marée (Gujan-Mestras, Bassin d'Arcachon)
> dans homeboard.

## Contexte capté par le core

- homeboard affiche déjà la météo multi-villes via Open-Meteo, dont
  Gujan-Mestras fait partie (cf. `domains/homeboard/CLAUDE.md`,
  périmètre « tableau de bord maison »).
- La marée est l'info domestique/locale qui manque pour le point
  d'ancrage Bassin d'Arcachon.
- Lors de la conversation, les horaires de marée trouvés (sam. 27 juin :
  PM 4h38 coef. 57, PM 16h56) provenaient de mareespeche.com /
  horaire-maree.fr, calés sur la **jetée d'Eyrac (Arcachon)** avec un
  **décalage ~10-15 min** sur les ports de Gujan-Mestras — à garder en
  tête pour le choix de source / station.

## Suggestion d'angle (l'agent satellite arbitre)

- Côté données : vérifier si une source marée gratuite et sans clé
  existe (à la manière d'Open-Meteo pour la météo) ; sinon évaluer SHOM /
  WorldTides / scraping mareespeche. Privilégier une source stable,
  affichage « écran mural » lisible à distance.
- Côté UI : prochaine pleine/basse mer + heure + coefficient + hauteur,
  cohérent avec le reste du dashboard.
- Pas de décision pré-câblée : laisser l'agent homeboard choisir source
  et implémentation avec sa mémoire chargée.

## À produire

- [ ] Choix de la source de données marée (et station de référence).
- [ ] Route API + widget marée intégrés au dashboard.
- [ ] `npm run build` OK avant de cocher « fait ».
- [ ] **Pulse retour** vers `core/_inbox/satellite-pulse/` une fois
  résolu (skill `satellite-pulse`).

## Critère de résolution

Le dashboard homeboard affiche la marée de Gujan-Mestras (prochaine
pleine/basse mer) en local, build vert, et un pulse a été remonté au core.
