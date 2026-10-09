# memory/current-state.md — homeboard

Top of mind du domaine `homeboard`.

Dernière mise à jour : 2026-09-27 (marée : code écrit, build à lancer)

---

## État : roadmap produit A/B/C livrée et déployée (Vercel)

homeboard a basculé d'un **widget météo multi-villes** vers un **tableau
familial centré sur les personnes** (« le tableau qui te garde proche de
ceux que tu aimes »). Pivot clé : **villes → proches**.

### A — Le proche au centre
- FTUE d'accueil (nouvel utilisateur démarre vide, plus d'injection des 9 villes).
- Carte d'identité par proche : avatar/photo (upload compressé local),
  surnom/relation, **anniversaire (J-/âge)**, **heure locale + fuseau + soleil**,
  **fête du prénom** (dataset `namedays.ts`), **« parlé il y a X » + bouton 1-tap**,
  boutons **WhatsApp / appel**, **édition** de fiche.

### B — La famille
- **Mur familial temporel** : messages Telegram accumulés côté client,
  à l'affiche 3 j → archives repliables (30 j). (getUpdates n'expose que le récent.)
- **Événement familial partagé** : bandeau compte à rebours « J-X ».

### C — Le modèle économique
- **Mode don Ko-fi** (pas de gate) : bouton « 💛 Soutenir », montants ancrés,
  badge « Merci » honor-based. Paywall Gumroad + route `/api/license` supprimés.

### Transverse
- Tout est **local** (localStorage) + **partageable par lien** (`#b=` base64url)
  + **synchronisable gratuitement via Telegram** (message épinglé d'un canal
  dédié, route `/api/board`). Dernier-écrit-gagne ; photos non synchronisées.

## Réglages humains en attente (Didier, dans Vercel)
1. **Sync** : créer un canal Telegram DÉDIÉ + bot admin → `TELEGRAM_BOARD_CHAT_ID`.
2. **Don** : compte Ko-fi → `NEXT_PUBLIC_KOFI_URL`.
3. Ménage : dépingler le message test laissé dans le chat famille (cf. pulse).

## Widget marée Gujan (ticket 2026-06-26) — source tranchée, code non livré
- Nuit du 2026-09-27 (sans shell) : source évaluée, plan écrit dans
  `reference/maree-gujan-choix-source.md`. Aucun code modifié, build non lancé.
- Constat : la ligne 🌊 déjà en prod (Open-Meteo Marine) est ~75 min en avance
  pour le Bassin.
- **Décisions de Didier (2026-09-27)** : source **officielle** (260927-01) ;
  le widget **suit le proche choisi** (260927-02).
- **Accès/licence SHOM sourcés le 2026-09-27** (jour, sans shell ; détail §6 de
  la fiche de référence) : vignette « horaires de marées » du SHOM **gratuite**,
  sans clé, insérable dans un site (heures, hauteurs, coefficient) ; API SPM
  **payante** (clé boutique, prix non public). Gujan n'est **pas** un port SHOM :
  on affiche Arcachon-Eyrac, sans décalage inventé. Retenu : la vignette gratuite.
- **Code écrit le 2026-09-27 (jour, sans shell, ticket 260927-02, build NON lancé)** :
  `src/app/TideBassin.tsx` + branchement dans `page.tsx` — quand le proche choisi
  est dans le Bassin (boîte approximative, à valider sur carte), bloc « Marée »
  (lien officiel SHOM par défaut ; vignette derrière `NEXT_PUBLIC_SHOM_VIGNETTE=1`)
  et ligne 🌊 Open-Meteo masquée. Hors Bassin : inchangé. Détail : §8 de la fiche.
- 2026-10-10 (nuit, sans shell) : page portail SHOM relue, aucune condition d'usage
  de la vignette dedans (renvoie à Mentions légales / CGV / Répertoire et licences) ;
  vignette laissée éteinte. Toujours bloqué sur shell + navigateur.
- Reste à faire (session avec shell, fiche §8) : `npm run build`, rendu réel,
  lire les conditions d'utilisation de la vignette (illisibles par WebFetch),
  valider la boîte sur carte, tester la vignette, pulse. Aucune dépense engagée.

## À venir / déféré
- **A2b distance** « de toi » (géoloc + notion « chez moi ») — déféré.
- **Réseau d'entraide par expertise** — INCUBÉ (cf. `projects/reseau-entraide-expertise.md`,
  revue 2026-08-15). Gros sujet d'après : backend + consentement + RGPD + cold-start.
  À activer seulement après avoir laissé vivre la version actuelle.

## Décisions récentes
- Rail de don = **Ko-fi** (0% sur dons ponctuels), abandon de Gumroad
  (setup Stripe Connect cassé + KYC lourd inadapté au don).
- Sync = **Telegram** (réutilise le bot, gratuit, sans nouveau compte) plutôt
  que GitHub (hack) ou Ethereum testnet (mauvais outil : éphémère, public, RGPD).
- Domaine = **satellite applicatif** (code + brain), distinct de meteomar/van/boatmon.
