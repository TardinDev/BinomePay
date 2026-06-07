# BinomePay Web

Version web (Next.js) de BinomePay — port 1:1 de l'app mobile Expo, partageant le **même backend Supabase**.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript strict**
- **Tailwind CSS v4** (config CSS-first via `@theme` dans `src/app/globals.css`)
- **@supabase/ssr** — auth par cookies (clients browser / serveur / proxy)
- **@tanstack/react-query** — cache + polling (parité mobile)
- **zod** + **react-hook-form** — validation et formulaires
- **pnpm** (le mobile reste sur npm — les deux apps sont indépendantes)

> **Note Next 16 :** le fichier `middleware` a été renommé **`proxy`** (`src/proxy.ts`, export `proxy`). `cookies()` et les `params` de routes dynamiques sont **asynchrones**. Voir `node_modules/next/dist/docs/` (et `AGENTS.md`).

## Développement

```bash
cd web
pnpm install
pnpm dev            # http://localhost:3000
pnpm type-check     # tsc --noEmit
pnpm lint
pnpm build && pnpm start
```

## Variables d'environnement

Copier `.env.example` → `.env.local` et renseigner (mêmes valeurs que le mobile) :

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=https://binomepay.com   # utilisé par sitemap/robots/OG (optionnel en dev)
```

## Architecture

- `src/app/(auth)/` — écrans publics : login, register, verify (OTP), forgot-password, terms.
- `src/app/(protected)/app/` — espace connecté : accueil, new-intention, suggested/[id], messages, messages/[id], profile, history. Protégé par `src/proxy.ts`.
- `src/lib/supabase/` — clients SSR (`client.ts` navigateur, `server.ts` RSC/actions, `proxy.ts` refresh + garde de routes).
- `src/lib/queries/` — hooks React Query (lecture, polling).
- `src/lib/actions/` — Server Actions (createIntention, acceptSuggestion, sendMessage, profile…).
- `src/lib/schemas/` — **copie synchronisée** des schémas Zod du mobile (`/src/lib/schemas`). Toute modif doit être répercutée des deux côtés.
- `src/components/ui/` — primitives maison ; `src/components/marketing/` — landing ; `src/components/app/` — composants métier.

## Déploiement Vercel

1. Nouveau projet Vercel pointant sur ce dépôt, **Root Directory = `web/`**. Framework Next.js et pnpm auto-détectés (via `pnpm-lock.yaml`).
2. Variables d'env : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`.
3. Déployer une **preview**, vérifier que l'auth par cookies fonctionne en HTTPS (login → /app), puis tester un parcours complet.
4. Vérifier que les **policies RLS** Supabase autorisent les mêmes accès depuis le web (même anon key que le mobile).
5. Promouvoir en production.

## État de la QA

Vérifié (build prod + navigateur) : landing (responsive, 0 erreur console), pages auth (rendu + validation de formulaire), garde de routes (`/app` → `/login`), `type-check`/`lint`/`build` au vert (17 routes).

**Reste à valider avec un compte réel** (nécessite des identifiants Supabase) : accueil (intentions/suggestions/matches), création d'intention, acceptation de match, messagerie, profil, historique. Le code de ces écrans est un port fidèle du mobile (mêmes tables/colonnes/séquences) et compile proprement, mais n'a pas encore été exercé contre des données live côté web.
