# BinomePay Web — Design Spec (Next.js)

**Date:** 2026-06-07
**Statut:** Validé en brainstorming, en attente de relecture utilisateur
**Périmètre:** App web complète (port 1:1 de l'app mobile Expo), dans `web/`

---

## 1. Objectif

Créer une version web **de production** de BinomePay en Next.js, répondant aux standards 2026
(SSR, performance Core Web Vitals, SEO, accessibilité), partageant le **même backend Supabase**
que l'app mobile, avec une identité visuelle **cohérente** (thème sombre + accent jaune).

L'app web est un **port 1:1** : auth, création d'intentions SEND/RECEIVE, matching/suggestions,
chat, profil/KYC, historique.

## 2. Décisions arrêtées

| Décision               | Choix                                                                        |
| ---------------------- | ---------------------------------------------------------------------------- |
| Portée                 | App web complète (port 1:1 du mobile)                                        |
| Backend                | Même projet Supabase (Postgres, auth, RLS, données partagés)                 |
| Design                 | Dark + jaune `#EAB308`, cohérent avec le mobile                              |
| Déploiement            | Vercel (Root Directory = `web/`)                                             |
| Emplacement code       | Dossier `web/` autonome dans ce repo                                         |
| Package manager (web)  | **pnpm** (mobile reste sur npm, non modifié)                                 |
| Temps réel             | Polling React Query (`refetchInterval` ~20-30s), parité mobile               |
| Architecture data/auth | **Hybride SSR** : `@supabase/ssr` (cookies) + middleware + RSC + React Query |
| Schémas Zod            | **Copiés** dans `web/src/lib/schemas` (web 100% autonome)                    |

## 3. Stack technique (web/)

- **Next.js 15** (App Router) + **React 19** + **TypeScript strict**
- **Tailwind CSS v4** — design tokens dark + jaune
- **@supabase/ssr** — auth par cookies (clients browser / serveur / middleware)
- **@tanstack/react-query** — cache serveur + polling
- **zod** — validation (schémas copiés du mobile)
- **react-hook-form** + `@hookform/resolvers` — formulaires
- Composants UI **maison** (pas de template générique) — design distinctif via skill `frontend-design`
- ESLint + Prettier (cohérents avec le repo), TypeScript strict

## 4. Structure de dossiers

```
web/
├── package.json                  # deps web, scripts (dev/build/lint/type-check)
├── pnpm-lock.yaml
├── next.config.ts
├── tailwind.config.ts            # tokens dark + jaune
├── tsconfig.json                 # paths: @/* → web/src/*
├── middleware.ts                 # garde d'auth Supabase (refresh + redirections)
├── .env.local / .env.example     # NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY
└── src/
    ├── app/
    │   ├── layout.tsx            # racine: providers (Query), <html> dark, metadata
    │   ├── globals.css
    │   ├── page.tsx              # landing marketing (RSC, indexable)
    │   ├── opengraph-image.tsx   # OG image
    │   ├── (auth)/
    │   │   ├── layout.tsx
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   ├── verify/page.tsx
    │   │   ├── forgot-password/page.tsx
    │   │   └── terms/page.tsx
    │   └── (protected)/
    │       └── app/
    │           ├── layout.tsx            # shell connecté (nav, garde session)
    │           ├── page.tsx              # accueil: matches + mes intentions + suggestions
    │           ├── new-intention/page.tsx
    │           ├── suggested/[id]/page.tsx
    │           ├── messages/page.tsx
    │           ├── messages/[id]/page.tsx
    │           ├── profile/page.tsx
    │           └── history/page.tsx
    ├── components/
    │   ├── ui/                   # Button, Card, Input, Badge, Avatar, Skeleton, Toast…
    │   ├── marketing/            # Hero, Features, HowItWorks, CTA, Footer
    │   └── app/                  # IntentionCard, SuggestedCard, MatchCard, ChatBubble…
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts         # createBrowserClient
    │   │   ├── server.ts         # createServerClient (cookies)
    │   │   └── middleware.ts     # helper updateSession
    │   ├── queries/              # hooks React Query (miroir du mobile)
    │   │   ├── keys.ts
    │   │   ├── useRequests.ts
    │   │   ├── useSuggestions.ts
    │   │   ├── useConversations.ts
    │   │   └── useUserProfile.ts
    │   ├── actions/              # Server Actions (createIntention, acceptMatch, sendMessage…)
    │   └── schemas/              # copie des Zod schemas (user, exchange, conversation)
    └── hooks/                    # useToast, useDebounce, etc.
```

**Isolation :** `web/` a son propre build et son lockfile pnpm. **Aucun impact** sur le build
Expo mobile. `.gitignore` racine étendu pour `web/node_modules` et `web/.next`.

## 5. Authentification (cœur SSR)

Le mobile stocke la session dans AsyncStorage ; le web utilise des **cookies** pour que le
serveur (RSC + middleware) connaisse l'utilisateur.

- `@supabase/ssr` → clients navigateur, serveur (RSC/Server Actions), middleware.
- `middleware.ts` : rafraîchit la session à chaque requête et **protège `(protected)/app/*`**.
  - Non connecté sur route protégée → redirect `/login`.
  - Connecté arrivant sur `/login` ou `/register` → redirect `/app`.
- Mapping auth **identique au mobile** :
  - Connexion : `signInWithPassword({ email, password })`
  - Inscription : `signUp({ email, password, options: { data: { firstName } } })`
  - Vérif OTP : `verifyOtp({ email, token, type: 'signup' })`
  - Reset : `resetPasswordForEmail` → `verifyOtp(type:'recovery')` → `updateUser({ password })`
  - Déconnexion : `signOut()`
- Le trigger SQL `handle_new_user` (création `profiles` + `users`) fonctionne déjà côté DB.
- Suppression de compte : même Edge Function `delete-account`.

## 6. Flux de données

- **Lecture initiale** (accueil, profil, historique) : Server Component lit Supabase côté
  serveur → HTML pré-rendu rapide.
- **Interactivité + polling** : Client Components + React Query, `refetchInterval` ~20-30s
  pour suggestions / matches / messages.
- **Règle de visibilité matching (critique, conservée à l'identique) :**
  - Mes intentions : `intents.select().eq('user_id', userId)`
  - Suggestions des autres : `intents.select().neq('user_id', userId).eq('status', 'OPEN')`
- **Mutations** via Server Actions → insert/update Supabase → `revalidatePath` +
  invalidation React Query :
  - `createIntention` (SEND/RECEIVE, montant, devise, pays)
  - `acceptSuggestion` / `acceptMatch`
  - `sendMessage`
  - `updateProfile`
  - `deleteAccount` (Edge Function)

## 7. Carte des écrans

**Public (indexable) :**

- `/` — Landing marketing (Hero, fonctionnement, fonctionnalités, CTA, footer)
- `/login`, `/register`, `/verify`, `/forgot-password`, `/terms`

**Protégé (`/app`) :**

- `/app` — Accueil : matches récents + mes intentions + suggestions des autres + filtre pays
- `/app/new-intention` — Formulaire (toggle SEND/RECEIVE, montant, devise, pays origine/destination)
- `/app/suggested/[id]` — Détail suggestion + accepter le match
- `/app/messages` — Liste des conversations + compteurs non lus
- `/app/messages/[id]` — Conversation (chat)
- `/app/profile` — Profil complet : avatar, statut KYC, note, déconnexion, suppression compte
- `/app/history` — Historique des transactions + stats récapitulatives

## 8. Design system

- **Tokens :** fonds `#000` / `neutral-900` ; accent jaune `#EAB308` / `#FDE68A` ;
  bleu secondaire `#3B82F6` / `#60A5FA`. Cards `border border-gray-800 rounded-xl bg-neutral-900`.
  Boutons : gradient jaune (primaire), gris (désactivé).
- **Touches 2026 maîtrisées :** typographie variable soignée, micro-interactions
  (transitions, hover/focus), gradients subtils, glassmorphism léger sur la nav.
- **Responsive :** mobile-first → desktop. La landing exploite le grand écran ; l'app reste
  lisible en colonne centrée.
- **Accessibilité :** contrastes AA, focus visibles, navigation clavier, ARIA,
  `prefers-reduced-motion`.
- Composants **maison** ; variantes de landing présentées avant de figer (skill `frontend-design`).

## 9. Erreurs, perf & qualité

- `error.tsx` / `not-found.tsx` / `loading.tsx` par segment ; ErrorBoundary ;
  états vides + squelettes (parité mobile).
- **SEO :** metadata par page, OpenGraph, `sitemap.ts`, `robots.ts`.
- **Perf :** Server Components par défaut, `next/image`, code-splitting ; objectif
  Core Web Vitals verts (vérifiable via skill `/benchmark`).
- **Qualité :** TypeScript strict, ESLint, Prettier ; scripts `type-check` / `lint`.
- **Tests :** tests des composants clés + 1 parcours e2e (login → créer intention →
  voir suggestion) ; QA via skill `/qa` sur le déploiement preview Vercel.

## 10. Déploiement Vercel

- Root Directory = `web/`, détection pnpm via lockfile.
- Variables d'env : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (mêmes valeurs que le mobile), + clés serveur si nécessaire (service role pour Edge Functions
  côté serveur uniquement, jamais exposées au client).
- Domaine de preview pour la QA, puis domaine de prod.

## 11. Hors périmètre (YAGNI)

- Pas de monorepo / workspaces (web autonome).
- Pas de Supabase Realtime (polling, parité mobile) — réévaluable plus tard.
- Pas de refonte du design mobile.
- Pas de fonctionnalités web nouvelles non présentes sur mobile.

## 12. Risques & points d'attention

- **Parité de la logique métier** : reproduire fidèlement les requêtes Supabase du mobile
  (notamment la règle de visibilité matching) — référence = `src/services/apiService.ts`,
  `src/store/useAppStore.ts`.
- **Cookies vs AsyncStorage** : bien isoler les clients `@supabase/ssr` (jamais mélanger
  client navigateur et serveur).
- **RLS** : les policies existantes doivent autoriser les mêmes accès depuis le web
  (même anon key, mêmes règles) — à vérifier au premier branchement.
- **Synchro des schémas Zod** : copie à maintenir si le mobile évolue (changement rare).
- **Secret service role** : jamais dans un bundle client ; uniquement en Server Action/route.

```

```
