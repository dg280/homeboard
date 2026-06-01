# memory/long-term.md — homeboard

Faits stables du domaine `homeboard` (tableau de bord maison / familial).

---

## Contexte du domaine

App **Next.js** servant de **tableau de bord domestique** (écran d'info
du foyer). Deux briques actuelles :

1. **Météo multi-villes** — Open-Meteo (sans clé), villes des proches
   et points d'ancrage de Didier.
2. **Messages** — derniers messages d'un canal **Telegram** (texte,
   photo, voix) via un bot, exposés par la route `/api/messages`.

## Stack technique

— Next.js 14 (App Router), React 18, TypeScript.
— Front client : `src/app/page.tsx`. API : `src/app/api/messages/route.ts`.
— Déploiement pressenti : Vercel.
— Secrets (env, jamais committés) : `TELEGRAM_BOT_TOKEN`,
  `TELEGRAM_CHAT_ID`.

## Villes suivies (météo)

Gujan-Mestras, Nailloux, Paimpol, Savigny-le-Temple, Nice, Montpellier,
Saint-Romain-de-Lerps, Marseille, Clairac.
(Liste codée en dur dans `page.tsx` → `CITIES` ; à faire évoluer selon
les proches.)

## Acteurs / personnes

[à compléter : qui regarde ce dashboard, quels proches correspondent à
quelles villes, qui poste sur le canal Telegram.]

## Décisions structurantes

[à créer au premier besoin — ex. choix d'hébergement, ajout de widgets,
gestion des secrets.]
