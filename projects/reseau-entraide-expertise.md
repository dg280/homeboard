---
slug: reseau-entraide-expertise
status: idea
quadrant: Q2
autonomy: propose
next-action: 2026-08-15 — revue idée-forge : finir homeboard (A2/B/C) d'abord, puis décider lancement preuve "tribu"
blocked-on: WIP — derrière la finition de homeboard (A2 + mur familial + don)
created: 2026-06-21
updated: 2026-06-21
tags: [homeboard, reseau, entraide, expertise, constellation, backend, rgpd, idea]
---

# Réseau d'entraide par expertise — "constellation de familles/tribus"

## L'idée (en 1 phrase)
Pour des familles/tribus dispersées, faire un **réseau d'entraide par
expertise** : chacun déclare **métier · loisirs · expertises** et **consent
à être sollicité** dans le cadre de son expertise → mise en relation et
entraide entre proches (et proches de proches). La valeur réseau
**remplacerait la monétisation par don** envisagée jusqu'ici.

## Verdict idée-forge (2026-06-21)
- Créatif : **FORT** · Business : moyen (potentiel fort, non prouvé) ·
  Faisable : faible→moyen (selon périmètre) · Pull : **FORT**
- **ACTIVER la preuve d'hypothèse · INCUBER la plateforme.**
- Décision de Didier : **INCUBER** — finir homeboard d'abord (anti-dispersion).

## Risque clé
Archétype du piège du générateur divergent : une idée plus grande/plus belle
qui ferait abandonner l'artefact FINI (le dashboard) pour une plateforme
réseau jamais finie. Trois vérités dures :
1. **Backend obligatoire** ("consolider en base") → franchit la ligne
   "pas de piège SaaS" : infra qui coûte + maintenance perpétuelle.
2. **RGPD** : métier/expertise + consentement à être sollicité = données
   perso + consentement traçable/révocable + droit à l'oubli. Connecter des
   familles entre elles → Didier devient **responsable de traitement**
   (concerne le satellite `admin`).
3. **Cold-start** : un réseau d'entraide est inutile sans densité. "Remplace
   la monétisation" déplace la question du revenu, ne la résout pas (l'infra
   recoûte de l'argent).

## Existence proof (le test le plus court, SANS backend)
Réutilise les briques déjà construites dans homeboard (board partagé par lien,
carte d'identité du proche, bouton contacter) :
- Étendre la carte d'identité : **métier · loisirs · expertises (tags)** +
  flag **"OK pour être sollicité·e sur : […]"**.
- Vue **"Qui peut m'aider ?"** = recherche par expertise dans la tribu →
  résultat → bouton contacter (déjà là).
- 1 tribu = 1 board partagé (sync par lien). **Zéro backend, RGPD minimal.**
- Tester sur la vraie famille de Didier : les gens remplissent-ils leur
  expertise ? acceptent-ils d'être sollicités ? un match crée-t-il de la valeur ?

## Phase 2 (seulement si la preuve montre de la traction)
Base/constellation multi-familles : backend (Supabase = Postgres + auth + RLS),
consentement traçable, RGPD (minimisation, opt-in par domaine, révocable,
effacement), stratégie cold-start (démarrer par UNE constellation = la tribu
de Didier, croissance par invitation).

## Condition de reprise
homeboard "fini" (A2 heure locale/fête du prénom/distance + B mur familial +
C don livrés et testés), OU pull spontané fort qui justifie de réprioriser.
Revue prévue : **2026-08-15**.
