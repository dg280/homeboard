# CLAUDE.md — homeboard (satellite)

Point d'entrée pour tout agent Claude Code lancé dans ce satellite via
`brain homeboard`.

---

## Périmètre

`homeboard` = **tableau de bord maison / familial** (app Next.js).
Un écran d'information domestique qui agrège, en un coup d'œil :

— **Météo multi-villes** : les villes où vivent les proches et où
  Didier a un point d'ancrage (Gujan-Mestras, Nailloux, Paimpol,
  Savigny-le-Temple, Nice, Montpellier, Saint-Romain-de-Lerps,
  Marseille, Clairac). Source : Open-Meteo (pas de clé).
— **Flux de messages** : derniers messages d'un canal **Telegram**
  (texte, photo, voix/audio) via un bot, route API `/api/messages`.

C'est un satellite **applicatif** : il porte du code (front + API) en
plus de la mémoire/projets brain.

### Dans le périmètre
— Le code de l'app (`src/app/`, route API, déploiement Vercel).
— Les fonctionnalités du dashboard : météo, messages, futurs widgets
  (agenda, photos, todo familial, etc.).
— L'ergonomie « écran mural » (lisibilité à distance, rafraîchissement).

### Hors périmètre
— Le routage météo voile/marine → `meteomar`.
— La domotique/alarme van → `van`. La sécurité bateau → `boatmon`.
— Tout ce qui relève d'un autre domaine : ici on reste sur le foyer.

## Stack & lancement

— **Next.js 14** (App Router) + React 18 + TypeScript.
— `npm run dev` (dev), `npm run build` / `npm start` (prod).
— Déploiement pressenti : **Vercel**.
— Secrets via env (jamais committés) : `TELEGRAM_BOT_TOKEN`,
  `TELEGRAM_CHAT_ID`. Cf. `.env.local` (gitignoré).

## Permissions

— Par défaut, ce satellite ne lit aucun autre satellite.
— Aucun accès à `health-ops`. Pas de devinage inter-domaines.
— Cloisonnement Ubisoft↔GG respecté (sans objet ici, domaine perso).

## À charger en début de session

— `memory/long-term.md` — nature de l'app, stack, villes, secrets
— `memory/current-state.md` — top of mind
— Les `projects/` pertinents quand il y en a (roadmap, widgets…)

## Skills

— Skills core activées : `skills.activate`. Locales : `skills/<nom>/`.
— `.claude/skills/` régénéré à chaque `brain homeboard` (gitignoré).

## Règles opérationnelles

Voir `core/principles.md` (plan-first, vérification avant « done »,
doctrine §7, quadrants §10, moteur d'achèvement §11) et
`core/guardrails.md`. Pour le code : tester (`npm run build`) avant de
cocher une case « fait ».
