# memory/long-term.md — homeboard

Faits stables du domaine `homeboard` (tableau de bord maison / familial).

---

## Contexte du domaine

App **Next.js** = **tableau familial centré sur les personnes** (« le
tableau qui te garde proche de ceux que tu aimes »). L'utilisateur ajoute
ses **proches** (prénom + ville + carte d'identité), chacun avec sa météo,
son anniversaire, son heure locale, sa fête, et des boutons pour le
contacter. Plus un **mur familial** (messages Telegram) et un **événement
familial** partagé. Modèle = **don** (Ko-fi), pas de paywall.

## Stack technique

— Next.js 14 (App Router), React 18, TypeScript. Déployé sur **Vercel**
  (https://homeboard-omega.vercel.app).
— Front : `src/app/page.tsx` (gros monolithe client) + `src/app/namedays.ts`
  (calendrier des prénoms). Routes API :
  — `/api/messages` — flux Telegram (getUpdates).
  — `/api/board` — sync du board (lit/écrit un message épinglé d'un canal
    Telegram dédié, via le bot). `force-dynamic`.
— **Données 100% locales** (localStorage) + partage par lien (`#b=` base64url)
  + sync optionnelle via Telegram. Pas de base de données.
— Secrets/env (jamais committés, cf. `.env.example`) : `TELEGRAM_BOT_TOKEN`,
  `TELEGRAM_CHAT_ID` (messages), `TELEGRAM_BOARD_CHAT_ID` (sync, canal dédié,
  bot admin), `NEXT_PUBLIC_KOFI_URL` (don).

## Modèle de données « proche »

`Proche = { id, name, lat, lon, city, emoji?, photo?, relation?, birthday?,
phone?, lastContact? }`. Board-level : `familyEvent { title, date }`.
Les villes ne sont plus codées en dur (l'ancien `CITIES` a été retiré) :
chacun saisit ses proches via la recherche geocoding Open-Meteo.

## Acteurs / personnes

[à compléter : qui regarde ce dashboard, quels proches correspondent à
quelles villes, qui poste sur le canal Telegram.]

## Décisions structurantes

— **Marée : Open-Meteo Marine est inadapté au Bassin d'Arcachon** (constat du
  2026-09-27, à rejouer au shell). Grille ~0,08° : la cellule servie pour
  Gujan est au large (44.625, -1.208), pleines mers ~75 min trop tôt vs la
  jetée d'Eyrac ; en `cell_selection=nearest` → que des `null`. Détail et
  plan : `reference/maree-gujan-choix-source.md`.
— **Marée : source officielle SHOM, via la vignette gratuite** (décision de
  Didier 260927-01 du 2026-09-27 ; accès sourcé le même jour, §6 de la fiche).
  La vignette « horaires de marées » du SHOM est gratuite et insérable dans un
  site (heures, hauteurs, coefficient) ; l'API SPM est payante (clé boutique,
  prix non public) et n'est pas retenue. **Gujan-Mestras n'est pas un port
  SHOM** : la référence du Bassin est Arcachon (Jetée d'Eyrac) ; le +10-15 min
  vient de mareespeche, non sourcé SHOM — ne pas le coder comme officiel. Le
  widget suit le proche choisi (260927-02). Conditions d'utilisation de la
  vignette : à lire avant mise en prod. Côté code (2026-09-27, non buildé) :
  `TideBassin.tsx`, boîte du Bassin approximative, vignette éteinte par défaut
  (`NEXT_PUBLIC_SHOM_VIGNETTE`), ligne 🌊 Open-Meteo masquée dans le Bassin.
