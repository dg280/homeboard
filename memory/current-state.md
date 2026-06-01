# memory/current-state.md — homeboard

Top of mind du domaine `homeboard`.

Dernière mise à jour : 2026-06-01

---

## En cours

— **Satellite créé (01/06/2026)** : repo applicatif `dg280/homeboard`
  (existant depuis 2026-03-26) attaché au brain comme submodule, puis
  scaffoldé (CLAUDE.md, memory, projects).
— App à l'état initial : météo multi-villes (Open-Meteo) + flux
  messages Telegram (`/api/messages`).

## À venir (prochaines étapes)

1. Vérifier que l'app build et tourne en local (`npm install` puis
   `npm run dev` / `npm run build`).
2. Décider de l'hébergement (Vercel ?) et câbler les secrets Telegram.
3. Backlog de widgets (agenda, photos, todo familial…) → `projects/`.

## Décisions récentes

— Domaine traité comme **satellite applicatif** (code + brain), distinct
  de `meteomar` (météo marine) et `van`/`boatmon` (sécurité embarquée).
