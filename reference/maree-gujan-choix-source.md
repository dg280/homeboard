# Marée Gujan-Mestras — choix de la source (diagnostic du 2026-09-27)

Ticket : `_inbox/tickets/2026-06-26-2019-maree-gujan-homeboard.md`.
Session de nuit **sans shell** (pas de `npm run build`, pas de `curl`) : les
mesures ci-dessous viennent de `WebFetch`, qui résume la page par un petit
modèle. À **rejouer avec `curl`** en session de jour avant de s'appuyer
dessus. Aucun code de l'app n'a été modifié.

**Mise à jour 2026-09-27 (jour, WebSearch/WebFetch, toujours sans shell)** :
Didier a tranché « source officielle » (décision 260927-01). L'accès et la
licence SHOM sont maintenant sourcés : voir **§6** (faits) et **§7** (plan
révisé, qui remplace le §5). Les mesures de ce fichier restent à rejouer en
`curl`.

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
| **SHOM — vignette gratuite, port Arcachon-Eyrac** | **Retenue (2026-09-27)** | Bloc visuel non restylable, pas de données brutes ; Gujan n'est pas un port SHOM (§6) |
| SHOM — API payante (SPM, clé à acheter) | Écartée sauf accord de Didier | Dépense ; prix non public ; hors de proportion pour un tableau familial (§6) |
| API à clé (StormGlass, WorldTides…) | Possible | Compte + clé à créer par Didier ; quota et tarif **à sourcer** |
| Prédiction harmonique locale (constantes SHOM) | Idéale à terme | Constantes officielles à obtenir ; zéro réseau, zéro quota |

## 5. Plan initial (nuit du 2026-09-27) — remplacé par le §7

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
*(Tranchée depuis : « suit le proche », décision 260927-02.)*

## 6. Accès et licence SHOM — vérifié le 2026-09-27

Méthode : `WebSearch` + `WebFetch` sur les pages officielles du SHOM. Les
pages `maree.shom.fr` sont rendues en JavaScript, donc illisibles par cet
outil ; les valeurs chiffrées et les citations viennent d'un résumé par petit
modèle → **à rejouer en `curl` / navigateur** avant mise en prod. Ce qui n'a
pas pu être lu est marqué « à sourcer ».

### 6.1 Deux voies officielles, l'une gratuite, l'autre payante

**Voie gratuite — vignette « Horaires de marées » du SHOM.**
- Le portail officiel dit : « Insérer gratuitement une vignette des horaires
  des marées du Shom dans votre site Internet », et « Il vous est possible
  d'intégrer dans vos publications (papiers et/ou numériques), les horaires des
  marées du Shom ». Deux formats : petite (24 h) et grande (7 jours + courbe).
  Source : <https://diffusion.shom.fr/marees/portail-horaires-des-marees.html>.
- Pas de compte, pas de clé. Le code d'intégration est généré sur
  <https://maree.shom.fr/vignette> (page JS : code exact **non lu**).
- URL de la petite vignette, port de référence du Bassin :
  `https://services.data.shom.fr/hdm/vignette/petite/ARCACHON_EYRAC?locale=fr`.
  Le résumé de cette réponse (27/09/2026, heure légale) : PM 06:33 · 4,29 m ·
  coef 95 ; BM 12:46 · 0,53 m ; PM 18:50 · 4,50 m · coef 97 ; BM 28/09 01:07 ·
  0,48 m. Heures, hauteurs **et coefficient** y sont donc.
- Nature technique : un script qui écrit une `iframe` par `document.write()`,
  logo SHOM + lien « Tous les horaires de marées du Shom » inclus. C'est un
  bloc visuel : pas de JSON, pas de style libre.
- Réserve du SHOM : la hauteur réelle peut différer de la prédiction de
  « plusieurs dizaines de centimètres » selon la pression atmosphérique
  (prédictions calculées à ~1013 hPa).
- **À sourcer** : les conditions d'utilisation détaillées de la vignette
  (page `maree.shom.fr/vignette`) et le statut d'un site qui accepte des dons
  (mode Ko-fi) au regard de « gratuit ». Ne pas prétendre à un droit sans les
  avoir lues.

**Voie payante — API « Services de Prédiction de Marée » (SPM / SAPM).**
- Accès « only available to authenticated users with a valid subscription
  key », clé **achetée sur la boutique du SHOM** ; TLS 1.2 minimum. Prédictions
  1700-2100, 20 ans max par requête, formats **TXT et XML** (pas de JSON),
  heures et hauteurs PM/BM, coefficient pour les ports métropolitains de la
  Manche et de l'Atlantique. Sources :
  <https://services.data.shom.fr/support/en/services/spm>,
  <https://diffusion.shom.fr/services-numeriques/api-shom.html>.
- Prix : **non public** sur les pages lues. Indications : « à partir de
  65,74 € HT/unité » (Marées à la carte) ; abonnement « conseillé » au-delà de
  4 601,74 € HT (hors droits de reproduction). Source :
  <https://diffusion.shom.fr/marees/horaires-des-marees/marees_a_la_carte.html>.
- Licence : numéro d'autorisation de reproduction dans « Mes commandes » ;
  prédictions officielles « pour l'année courante et la suivante » ; mention
  de reproduction obligatoire (texte rapporté par un résumé de recherche :
  « non vérifiée par le Shom et réalisée sous la seule responsabilité de
  l'éditeur » — **à relire dans la source**) ; « dans certains cas
  particuliers », un contrat de licence peut être exigé.
- Conclusion : achat + contrat éventuel = dépense et démarche tierce, donc
  décision de Didier ; disproportionné pour ce tableau.

**Gratuit aussi, mais autre chose** : REFMAR (marégraphe Arcachon-Eyrac,
<https://refmar.shom.fr/donnees/190>) = *observations* du niveau réel, accès
gratuit avec nom + e-mail. Pas des prédictions ; utile plus tard pour afficher
la surcote (réel − prédit), pas pour ce ticket.

### 6.2 Gujan-Mestras n'est pas un port SHOM

- Ports rattachés à Arcachon (Jetée d'Eyrac) listés par maree.info (source
  annoncée « SHOM, mise à jour 06/2016 ») : Le Grand Piquey, Cap Ferret, Pilat
  Plage. **Ni Gujan-Mestras, ni Larros, ni Meyran.** Source :
  <https://maree.info/136/ports-rattaches> (site tiers, à confirmer sur
  `maree.shom.fr`).
- Un identifiant `GUJAN_MESTRAS` deviné dans l'URL de la vignette renvoie une
  page d'erreur (non concluant : l'identifiant réel est peut-être différent).
- Conséquence : la marée « officielle » de Gujan **est celle d'Arcachon-Eyrac**.
  Le décalage de +10-15 min vient de la demande initiale (mareespeche) et n'est
  **pas sourcé SHOM** : ne pas l'afficher comme officiel, ne pas le coder en
  dur.

## 7. Plan révisé (session de jour, avec shell) — remplace le §5

Choix retenu : **vignette officielle gratuite, port Arcachon-Eyrac**, affichée
chez un proche dont la position est dans le Bassin. Zéro dépense, zéro clé,
zéro secret.

- [ ] **Rejouer en `curl`** l'URL de la vignette : relever le code exact
  (`src` de l'iframe interne), les mentions SHOM, comparer les valeurs à
  `https://maree.shom.fr/harbor/ARCACHON_EYRAC` dans un navigateur.
- [ ] **Lire les conditions d'utilisation** de `maree.shom.fr/vignette`
  (navigateur) : usage sur un site avec dons, obligations de crédit. Si un
  contrat est exigé → stop, retour à Didier.
- [ ] **Composant** `TideVignette` (client) : `document.write()` ne marche pas
  dans le DOM de React → charger le script dans une `iframe` (`srcDoc`) ou
  pointer l'`iframe` interne si son URL est stable. À tester au build. Garder
  intact le logo et le lien SHOM. Pas de CSP dans `next.config.js` (aucun
  blocage d'iframe attendu).
- [ ] **Affichage** : sous la carte d'identité du proche sélectionné, si sa
  position est dans le Bassin (boîte lat/lon à fixer avec Gujan 44.638 / -1.068
  comme témoin, à valider sur carte — pas de coordonnées de mémoire). Légende :
  « Port de référence : Arcachon (Jetée d'Eyrac). Le fond du Bassin est en
  léger décalage. » — sans chiffre tant qu'il n'est pas sourcé.
  Extension à d'autres côtes plus tard : il faudra la liste officielle des
  ports SHOM (source à trouver).
- [ ] **Ligne 🌊 existante** (Open-Meteo, `page.tsx` ~460-476 et ~1334-1345) :
  ~75 min trop tôt dans le Bassin. La masquer quand la cellule servie est à
  plus de ~0,1° du point, et la retirer pour le Bassin dès que la vignette est
  en place (deux marées différentes à l'écran = confusion).
- [ ] **Recette** : la vignette et `maree.shom.fr` donnent les mêmes heures sur
  3 jours ; `npm run build` vert ; page qui rend ; lisible à distance (écran
  mural).
- [ ] **Pulse** au core citant 260927-01 et 260927-02 (sobre : « port du Bassin
  d'Arcachon »).

Hors périmètre du plan : l'API payante. Elle ne se réouvre que si Didier veut
un style libre ou la donnée brute *et* accepte la dépense (prix à demander au
SHOM — démarche que seul Didier peut faire).
