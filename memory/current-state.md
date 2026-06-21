# memory/current-state.md — homeboard

Top of mind du domaine `homeboard`.

Dernière mise à jour : 2026-06-21

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
