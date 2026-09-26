# Marée Gujan-Mestras — choix de la source (diagnostic du 2026-09-27)

Ticket : `_inbox/tickets/2026-06-26-2019-maree-gujan-homeboard.md`.
Session de nuit **sans shell** (pas de `npm run build`, pas de `curl`) : les
mesures ci-dessous viennent de `WebFetch`, qui résume la page par un petit
modèle. À **rejouer avec `curl`** en session de jour avant de s'appuyer
dessus. Aucun code de l'app n'a été modifié.

## 1. Ce qui existe déjà dans le code

Une ligne « 🌊 ⬆ haute HH:MM · ⬇ basse HH:MM » est déjà rendue dans la carte
d'identité du proche sélectionné :
- `src/app/page.tsx` ~116-143 : `extractTides` (extrema locaux + interpolation
  parabolique sur la hauteur horaire).
- `src/app/page.tsx` ~460-476 : effet qui appelle Open-Meteo Marine
  (`sea_level_height_msl`, `forecast_days=2`), masque si amplitude < 0,4 m.
- `src/app/page.tsx` ~1334-1345 : rendu (3 prochains extrema).

Elle donne l'heure seule : ni hauteur, ni coefficient, ni station nommée.
Ce n'est pas le widget demandé par le ticket.

## 2. Mesures sur le Bassin d'Arcachon

**Test 1 — Open-Meteo Marine, point Gujan (44.638, -1.068), 2026-06-27,
sélection de cellule par défaut.**
- Cellule servie : **44.625, -1.2083**, donc au large (~10 km à l'ouest),
  pas dans le Bassin.
- Hauteurs horaires : max 0,67 m (03:00) / 0,65 (04:00) puis 0,78 (15:00) /
  0,83 (16:00) / 0,59 (17:00) ; min −1,42 (09:00) et −1,53 (22:00).
- Pleines mers déduites avec la méthode du code : **≈ 03:25 et ≈ 15:40**.
- Référence du ticket (jetée d'Eyrac, mareespeche / horaire-maree.fr, non
  revérifiée) : **04:38 et 16:56**. Écart : **≈ −73 et −76 min** ; avec le
  décalage annoncé de +10-15 min pour les ports de Gujan : **≈ −85 à −90 min**.
- Amplitude du modèle sur la journée : 2,36 m (−1,53 → +0,83). Pas de
  coefficient dans la réponse.

**Test 2 — même API, `cell_selection=nearest`, 2026-09-28 → 10-01.**
Cellule 44.625, -1.0417 : **96 valeurs sur 96 à `null`** (cellule terre /
lagune, non modélisée).

**Test 3 — scraping horaire-maree.fr.** La page servie pour « Arcachon » était
celle de Royan, table sans valeurs (rendu par JavaScript). Le scraping est
fragile en pratique ; les conditions de réutilisation sont **à sourcer**.

**Test 4 — piste officielle.** Recherche `data.gouv.fr` « marée shom » : 0 jeu
de données ; `maree.shom.fr/harbor/ARCACHON` : rien d'exploitable sans
navigateur. Licence et accès API du SHOM : **à sourcer** (aucune assertion
faite ici).

## 3. Conclusion

Open-Meteo Marine **ne convient pas au Bassin** : grille de ~0,08°, le Bassin
tient dans 1-2 cellules ; en sélection par défaut on obtient la marée du
large (avance d'environ 1 h 15 sur Eyrac, amplitude sous-estimée), en
sélection « nearest » on n'obtient rien. Un décalage fixe corrigerait la
phase mais pas l'amplitude, et le retard réel dépend du coefficient : à
utiliser seulement si ±15 min suffisent (cf. question ouverte 1 du compte
rendu de nuit).

**Défaut en production à noter** : la ligne 🌊 actuelle affichera des
horaires ~1 h 15 trop tôt pour un proche dans le Bassin. Correctif rapide
possible : l'API renvoie les coordonnées de la cellule utilisée → masquer la
ligne si la cellule est à plus de ~0,1° du point demandé (Gujan : ~0,14°).

## 4. Options de source

| Option | Verdict | Réserves |
|---|---|---|
| Open-Meteo Marine + décalage calibré | Repli, ±15 min | Phase variable avec le coef., amplitude fausse, pas de coefficient |
| Scraping mareespeche / horaire-maree | Écartée | Rendu JS, casse sans prévenir, licence à sourcer |
| **SHOM (port de référence Arcachon-Eyrac + correction Gujan)** | **Recommandée** | Accès / licence / clé **à sourcer** (source officielle) |
| API à clé (StormGlass, WorldTides…) | Possible | Compte + clé à créer par Didier ; quota et tarif **à sourcer** |
| Prédiction harmonique locale (constantes SHOM) | Idéale à terme | Constantes officielles à obtenir ; zéro réseau, zéro quota |

## 5. Plan de mise en œuvre (session de jour, avec shell)

- [ ] Sourcer l'accès SHOM (licence de réutilisation, clé éventuelle,
  correction Gujan vs Eyrac) ; sinon retomber sur l'option API à clé.
- [ ] Route `src/app/api/tide/route.ts` (`revalidate` ~6 h, jamais de valeur
  périmée servie sans date) → `{ station, decalageMin, events:[{type, heure,
  hauteur, coef?}] }`. Clé (si besoin) en env Vercel, jamais committée ;
  ajouter au `.env.example`.
- [ ] Widget : prochaine PM / BM + 2 suivantes, heure, hauteur, coefficient,
  mention « calé Eyrac +N min », lisible à distance (écran mural), masqué si
  source indisponible.
- [ ] Traiter la ligne 🌊 générique (garde de distance de cellule, ou retrait
  une fois le widget livré).
- [ ] Recette : ≥ 30 jours de prédictions comparés à la table officielle
  (écart ≤ 5 min visé), `npm run build` vert, page qui rend.
- [ ] Pulse retour au core (sobre : « port du Bassin d'Arcachon »).

Décision produit encore ouverte : widget **suivi du proche sélectionné**
(cohérent avec le pivot villes → proches) ou **bandeau fixe Gujan**.
