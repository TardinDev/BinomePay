# BinomePay Web (Next.js) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire une web app Next.js de production (port 1:1 de l'app mobile BinomePay), dans `web/`, partageant le même backend Supabase, déployée sur Vercel.

**Architecture:** Hybride SSR — `@supabase/ssr` (auth par cookies) + middleware Next.js qui protège `(protected)/app/*`. Données initiales en Server Components, interactivité + polling en Client Components avec React Query. Mutations via Server Actions. Design dark + jaune cohérent avec le mobile.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS v4, @supabase/ssr, @tanstack/react-query, zod, react-hook-form, pnpm.

**Référence métier (mobile) :** `src/services/apiService.ts`, `src/store/useAppStore.ts`, `src/lib/auth.tsx`, `src/lib/schemas/*`, `src/app/(auth)/*`, `src/app/(Protected)/*`.

---

## Schéma de base de données (VÉRIFIÉ dans le code mobile)

> Source : `src/services/apiService.ts` + `src/services/dataService.ts` + `src/services/historyService.ts`.
> **Pièges confirmés :** la colonne de sens est **`direction`** (PAS `type`) avec valeurs `'SEND'|'RECEIVE'` ; la table `users` se joint via **`auth_id`** (= id de l'utilisateur auth), PAS `id`.

| Table                       | Colonnes utilisées                                                                                                                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intents`                   | `id`, `user_id` (auth id), `user_name`, `direction` (`SEND`/`RECEIVE`), `amount`, `currency`, `origin_country`, `dest_country`, `status` (`OPEN`/`MATCHED`/`CLOSED`), `note`, `created_at`, `updated_at` |
| `matches`                   | `id`, `intent_a`, `intent_b`, `status` (`ACCEPTED`/`PENDING`/`EXPIRED`), `created_at`                                                                                                                    |
| `conversations`             | `id`, `match_id`, `updated_at`                                                                                                                                                                           |
| `conversation_participants` | `conversation_id`, `user_id` (auth id), `unread_count`, `last_read_at`                                                                                                                                   |
| `messages`                  | `id`, `conversation_id`, `sender_id` (auth id), `content`, `created_at`                                                                                                                                  |
| `users`                     | `auth_id` (= id auth, clé de jointure), `name`, `kyc_status`, `rating_avg`, `avatar_url`                                                                                                                 |
| `transaction_history`       | `id`, `type`, `user_id`, `counterpart_id`, `counterpart_name`, `amount`, `currency`, `corridor`, `status`, `created_at`                                                                                  |
| RPC                         | `increment_unread_count({ conv_id, sender })` (incrément atomique unread de l'autre participant)                                                                                                         |
| Edge Function               | `delete-account` (service role, bypass RLS)                                                                                                                                                              |
| Storage                     | bucket `avatars`, chemin `avatars/${userId}_${timestamp}.jpg`                                                                                                                                            |

**Règles de lecture (à reproduire à l'identique) :**

- Mes intentions : `intents.select('id, direction, amount, currency, origin_country, dest_country, status').eq('user_id', userId).in('status', ['OPEN','MATCHED']).order('created_at', desc)`
- Suggestions (autres) : `intents.select('id, amount, currency, origin_country, dest_country, user_name, note, created_at').neq('user_id', userId).eq('status', 'OPEN').order('created_at', desc)`
- Mapping renvoyé au front : `direction → type`, `origin_country → originCountry`, `dest_country → destCountry`, `user_name → senderName`.

---

## File Structure

```
web/
├── package.json, pnpm-lock.yaml, next.config.ts, tsconfig.json, tailwind.config.ts
├── postcss.config.mjs, .eslintrc / eslint.config.mjs, .prettierrc
├── .env.local, .env.example
├── middleware.ts
└── src/
    ├── app/
    │   ├── layout.tsx, globals.css, page.tsx (landing), sitemap.ts, robots.ts
    │   ├── (auth)/layout.tsx + login|register|verify|forgot-password|terms/page.tsx
    │   └── (protected)/app/layout.tsx + page.tsx + new-intention|suggested/[id]|messages|messages/[id]|profile|history
    ├── components/ui/, components/marketing/, components/app/
    ├── lib/supabase/{client,server,middleware}.ts
    ├── lib/queries/{keys,useRequests,useSuggestions,useConversations,useMessages,useUserProfile}.ts
    ├── lib/actions/{intentions,matches,messages,profile}.ts
    ├── lib/schemas/{user,exchange,conversation,index}.ts
    └── hooks/
```

**Découpage par responsabilité :** un fichier = une responsabilité claire. Les écrans restent fins (orchestration) ; la logique data vit dans `lib/queries` et `lib/actions` ; les primitives visuelles dans `components/ui`.

---

## Phase 0 — Scaffold du projet web/

### Task 0.1: Initialiser l'app Next.js dans web/

**Files:**

- Create: `web/` (via create-next-app)

- [ ] **Step 1: Créer l'app**

```bash
cd /Users/tardindavy/Documents/Projects/My_Projects/App_Mobile/BinomePay
pnpm create next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --no-turbopack
```

Répondre "No" si demandé pour customizing defaults.

- [ ] **Step 2: Vérifier le démarrage**

Run: `cd web && pnpm dev`
Expected: serveur Next.js démarre sur http://localhost:3000, page par défaut s'affiche. Couper avec Ctrl-C.

- [ ] **Step 3: Étendre le .gitignore racine**

Modifier `/.gitignore` (racine du repo), ajouter à la fin :

```
# Web (Next.js)
web/node_modules
web/.next
web/out
web/.vercel
web/.env*.local
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore web
git commit -m "chore(web): scaffold Next.js app in web/"
```

### Task 0.2: Installer les dépendances applicatives

**Files:**

- Modify: `web/package.json`

- [ ] **Step 1: Installer**

```bash
cd web
pnpm add @supabase/ssr @supabase/supabase-js @tanstack/react-query zod react-hook-form @hookform/resolvers
pnpm add -D @tanstack/eslint-plugin-query
```

- [ ] **Step 2: Ajouter scripts qualité dans web/package.json**

Dans `"scripts"` ajouter :

```json
"type-check": "tsc --noEmit",
"format": "prettier --write \"src/**/*.{ts,tsx,css}\""
```

- [ ] **Step 3: Vérifier**

Run: `pnpm type-check`
Expected: pas d'erreur.

- [ ] **Step 4: Commit**

```bash
git add web/package.json web/pnpm-lock.yaml
git commit -m "chore(web): add supabase, react-query, zod, react-hook-form"
```

### Task 0.3: Variables d'environnement

**Files:**

- Create: `web/.env.local`, `web/.env.example`

- [ ] **Step 1: Créer web/.env.example**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 2: Créer web/.env.local avec les VRAIES valeurs**

Reprendre `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` depuis `/.env.production` (racine), les renommer en `NEXT_PUBLIC_*`.

- [ ] **Step 3: Commit (sans .env.local)**

```bash
git add web/.env.example
git commit -m "chore(web): add env example"
```

---

## Phase 1 — Schémas + types partagés

### Task 1.1: Copier les schémas Zod du mobile

**Files:**

- Create: `web/src/lib/schemas/user.ts`, `exchange.ts`, `conversation.ts`, `index.ts`

- [ ] **Step 1: Copier les 4 fichiers à l'identique**

Copier le contenu de `/src/lib/schemas/{user,exchange,conversation,index}.ts` (racine mobile) vers `web/src/lib/schemas/`. Contenu identique (voir le spec, section Key Types). Ces fichiers n'ont aucune dépendance React Native, juste `zod`.

```bash
mkdir -p web/src/lib/schemas
cp src/lib/schemas/user.ts src/lib/schemas/exchange.ts src/lib/schemas/conversation.ts src/lib/schemas/index.ts web/src/lib/schemas/
```

- [ ] **Step 2: Ajouter un en-tête de synchro en haut de index.ts**

Ajouter en première ligne de `web/src/lib/schemas/index.ts` :

```ts
// SYNCED COPY from /src/lib/schemas — source of truth is the mobile app.
// If you change a schema here, mirror it in the mobile app and vice-versa.
```

- [ ] **Step 3: Vérifier le typecheck**

Run: `cd web && pnpm type-check`
Expected: pas d'erreur.

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/schemas
git commit -m "feat(web): copy shared Zod schemas from mobile"
```

---

## Phase 2 — Auth Supabase SSR + middleware

### Task 2.1: Clients Supabase (browser + serveur)

**Files:**

- Create: `web/src/lib/supabase/client.ts`, `web/src/lib/supabase/server.ts`

- [ ] **Step 1: client.ts (navigateur)**

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: server.ts (RSC / Server Actions)**

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — middleware refreshes the session instead.
          }
        },
      },
    }
  )
}
```

- [ ] **Step 3: Vérifier**

Run: `cd web && pnpm type-check`
Expected: pas d'erreur.

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/supabase
git commit -m "feat(web): add Supabase SSR browser and server clients"
```

### Task 2.2: Middleware (refresh session + garde de routes)

**Files:**

- Create: `web/src/lib/supabase/middleware.ts`, `web/middleware.ts`

- [ ] **Step 1: lib/supabase/middleware.ts**

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/register', '/verify', '/forgot-password', '/terms']

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected = path.startsWith('/app')
  const isAuthPage = ['/login', '/register'].includes(path)

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/app'
    return NextResponse.redirect(url)
  }

  return response
}
```

- [ ] **Step 2: middleware.ts (racine web/)**

```ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 3: Vérifier le démarrage**

Run: `cd web && pnpm dev` puis visiter http://localhost:3000/app
Expected: redirection vers `/login` (route protégée, pas encore de session). Couper.

- [ ] **Step 4: Commit**

```bash
git add web/middleware.ts web/src/lib/supabase/middleware.ts
git commit -m "feat(web): add auth middleware with route guard"
```

---

## Phase 3 — Design system & providers

### Task 3.1: Tokens Tailwind + globals (dark + jaune)

**Files:**

- Modify: `web/tailwind.config.ts`, `web/src/app/globals.css`

- [ ] **Step 1: Étendre le thème dans tailwind.config.ts**

Dans `theme.extend.colors`, ajouter :

```ts
colors: {
  brand: {
    yellow: '#EAB308',
    yellowSoft: '#FDE68A',
    blue: '#3B82F6',
    blueSoft: '#60A5FA',
  },
}
```

- [ ] **Step 2: globals.css — fond noir par défaut + reduced-motion**

Ajouter :

```css
:root {
  color-scheme: dark;
}
body {
  @apply bg-black text-neutral-100 antialiased;
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: layout.tsx racine — html dark + metadata**

Dans `web/src/app/layout.tsx`, mettre `<html lang="fr" className="dark">`, et `metadata` = `{ title: 'BinomePay', description: '...', openGraph: {...} }`.

- [ ] **Step 4: Commit**

```bash
git add web/tailwind.config.ts web/src/app/globals.css web/src/app/layout.tsx
git commit -m "feat(web): dark + yellow design tokens and root layout"
```

### Task 3.2: Provider React Query

**Files:**

- Create: `web/src/components/QueryProvider.tsx`
- Modify: `web/src/app/layout.tsx`

- [ ] **Step 1: QueryProvider.tsx (Client Component)**

```tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 15_000, refetchOnWindowFocus: true } },
      })
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

- [ ] **Step 2: Envelopper children dans layout.tsx**

Dans `web/src/app/layout.tsx`, importer et wrapper `{children}` avec `<QueryProvider>`.

- [ ] **Step 3: Vérifier**

Run: `cd web && pnpm type-check && pnpm build`
Expected: build réussit.

- [ ] **Step 4: Commit**

```bash
git add web/src/components/QueryProvider.tsx web/src/app/layout.tsx
git commit -m "feat(web): add React Query provider"
```

### Task 3.3: Primitives UI maison

**Files:**

- Create: `web/src/components/ui/Button.tsx`, `Card.tsx`, `Input.tsx`, `Badge.tsx`, `Avatar.tsx`, `Skeleton.tsx`

- [ ] **Step 1: Implémenter les primitives**

Composants stylés NativeWind→Tailwind équivalents au mobile :

- `Button` : variants `primary` (gradient jaune), `secondary` (bleu), `ghost`, `disabled` (gris) ; props `loading`, `disabled` ; focus-visible ring.
- `Card` : `border border-gray-800 rounded-xl bg-neutral-900 p-4`.
- `Input` : label, erreur, focus ring jaune.
- `Badge` : pour statuts (OPEN/MATCHED/CLOSED, KYC).
- `Avatar` : initiales fallback + image.
- `Skeleton` : `animate-pulse bg-neutral-800 rounded`.

Chaque composant : un fichier, typé, accessible (roles/aria), responsive. Détail visuel produit via le skill `frontend-design` à l'exécution.

- [ ] **Step 2: Vérifier**

Run: `cd web && pnpm type-check`
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add web/src/components/ui
git commit -m "feat(web): UI primitives (Button, Card, Input, Badge, Avatar, Skeleton)"
```

---

## Phase 4 — Écrans d'authentification

> Mapping auth identique au mobile (voir spec §5). Chaque écran : formulaire `react-hook-form` + `zodResolver`, appel Supabase via le client navigateur, redirections via `router.push`. Référence visuelle : `src/app/(auth)/*` du mobile.

### Task 4.1: Layout auth + écran de connexion

**Files:**

- Create: `web/src/app/(auth)/layout.tsx`, `web/src/app/(auth)/login/page.tsx`

- [ ] **Step 1: (auth)/layout.tsx** — conteneur centré, fond noir, logo, lien vers register.

- [ ] **Step 2: login/page.tsx** (Client Component)

Logique :

```tsx
'use client'
// email + password via react-hook-form + zod
// const supabase = createClient()
// const { error } = await supabase.auth.signInWithPassword({ email, password })
// si ok: router.push('/app') ; sinon: afficher l'erreur
```

- [ ] **Step 3: Test manuel**

Run: `cd web && pnpm dev`, se connecter avec un compte existant.
Expected: redirection vers `/app` (qui affichera 404 pour l'instant — normal, créé en Phase 5).

- [ ] **Step 4: Commit**

```bash
git add web/src/app/\(auth\)
git commit -m "feat(web): auth layout and login screen"
```

### Task 4.2: Inscription + vérification OTP

**Files:**

- Create: `web/src/app/(auth)/register/page.tsx`, `web/src/app/(auth)/verify/page.tsx`

- [ ] **Step 1: register/page.tsx** — `firstName`, `email`, `password`, acceptation CGU.

```tsx
// await supabase.auth.signUp({ email, password, options: { data: { firstName } } })
// puis router.push(`/verify?email=${encodeURIComponent(email)}`)
```

- [ ] **Step 2: verify/page.tsx** — champ OTP.

```tsx
// const email = useSearchParams().get('email')
// await supabase.auth.verifyOtp({ email, token, type: 'signup' })
// si ok: router.push('/app')
```

- [ ] **Step 3: Test manuel** — créer un compte test, recevoir l'OTP par email, vérifier.
      Expected: compte créé, session active, redirection `/app`.

- [ ] **Step 4: Commit**

```bash
git add web/src/app/\(auth\)/register web/src/app/\(auth\)/verify
git commit -m "feat(web): register and OTP verification screens"
```

### Task 4.3: Mot de passe oublié + CGU

**Files:**

- Create: `web/src/app/(auth)/forgot-password/page.tsx`, `web/src/app/(auth)/terms/page.tsx`

- [ ] **Step 1: forgot-password/page.tsx** — 2 étapes :

```tsx
// étape 1: await supabase.auth.resetPasswordForEmail(email)
// étape 2: await supabase.auth.verifyOtp({ email, token, type: 'recovery' })
//          puis await supabase.auth.updateUser({ password: newPassword })
```

- [ ] **Step 2: terms/page.tsx** — contenu CGU (reprendre le texte de `src/app/(auth)/terms.tsx` mobile).

- [ ] **Step 3: Test manuel** — parcours reset complet.
      Expected: mot de passe changé, connexion possible.

- [ ] **Step 4: Commit**

```bash
git add web/src/app/\(auth\)/forgot-password web/src/app/\(auth\)/terms
git commit -m "feat(web): forgot-password flow and terms page"
```

---

## Phase 5 — Shell connecté + accueil

### Task 5.1: Query keys + hooks de lecture

**Files:**

- Create: `web/src/lib/queries/keys.ts`, `useRequests.ts`, `useSuggestions.ts`, `useUserProfile.ts`

- [ ] **Step 1: keys.ts**

```ts
export const queryKeys = {
  requests: (userId: string) => ['requests', userId] as const,
  suggestions: (userId: string) => ['suggestions', userId] as const,
  conversations: (userId: string) => ['conversations', userId] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  profile: (userId: string) => ['profile', userId] as const,
}
```

- [ ] **Step 2: useRequests.ts** — mes intentions

```ts
'use client'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from './keys'

import type { RequestItem } from '@/lib/schemas'

export function useRequests(userId: string) {
  return useQuery({
    queryKey: queryKeys.requests(userId),
    queryFn: async (): Promise<RequestItem[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('intents')
        .select('id, direction, amount, currency, origin_country, dest_country, status')
        .eq('user_id', userId)
        .in('status', ['OPEN', 'MATCHED'])
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((row) => ({
        id: row.id,
        type: row.direction as RequestItem['type'],
        amount: Number(row.amount),
        currency: row.currency,
        originCountry: row.origin_country,
        destCountry: row.dest_country,
        status: row.status as RequestItem['status'],
      }))
    },
    refetchInterval: 25_000,
  })
}
```

- [ ] **Step 3: useSuggestions.ts** — intentions des AUTRES (règle critique)

```ts
'use client'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from './keys'
import type { SuggestedItem } from '@/lib/schemas'

export function useSuggestions(userId: string) {
  return useQuery({
    queryKey: queryKeys.suggestions(userId),
    queryFn: async (): Promise<SuggestedItem[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('intents')
        .select('id, amount, currency, origin_country, dest_country, user_name, note, created_at')
        .neq('user_id', userId)
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((row) => ({
        id: row.id,
        amount: Number(row.amount),
        currency: row.currency,
        originCountryName: row.origin_country,
        destCountryName: row.dest_country,
        senderName: row.user_name ?? 'Utilisateur',
        note: row.note ?? undefined,
        createdAt: new Date(row.created_at).getTime(),
      }))
    },
    refetchInterval: 25_000,
  })
}
```

- [ ] **Step 4: useUserProfile.ts** — profil de l'utilisateur courant (table `profiles`/`users`, voir `src/services/dataService.ts`).

- [ ] **Step 5: Vérifier**

Run: `cd web && pnpm type-check`
Expected: pas d'erreur.

- [ ] **Step 6: Commit**

```bash
git add web/src/lib/queries
git commit -m "feat(web): read query hooks (requests, suggestions, profile)"
```

### Task 5.2: Shell de l'app connectée

**Files:**

- Create: `web/src/app/(protected)/app/layout.tsx`

- [ ] **Step 1: layout.tsx (Server Component)** — vérifie la session, charge l'utilisateur, rend la nav (liens : Accueil, Messages, Profil, Historique + bouton "Nouvelle intention" + déconnexion).

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <div className="min-h-screen bg-black">
      {/* Nav glassmorphism, badge non-lus, responsive */}
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/app/\(protected\)/app/layout.tsx
git commit -m "feat(web): protected app shell with nav"
```

### Task 5.3: Page d'accueil (matches + mes intentions + suggestions)

**Files:**

- Create: `web/src/app/(protected)/app/page.tsx`, `web/src/components/app/IntentionCard.tsx`, `SuggestedCard.tsx`, `CountryFilter.tsx`

- [ ] **Step 1: Cartes** — `IntentionCard` (type, montant, devise, corridor, statut badge), `SuggestedCard` (montant, devise, pays origine→destination, expéditeur, note, bouton "Voir"), `CountryFilter` (filtre pays sur suggestions). Référence : `src/components/home/*`.

- [ ] **Step 2: page.tsx** (Client Component) — récupère `user.id` (via un petit hook `useSessionUser` ou prop du layout), utilise `useRequests` + `useSuggestions`, sections "Mes intentions" et "Propositions pour vous", squelettes pendant le chargement, états vides.

- [ ] **Step 3: Test manuel** — se connecter, voir ses intentions et les suggestions.
      Expected: données réelles Supabase affichées ; règle de visibilité respectée (jamais ses propres intentions dans les suggestions).

- [ ] **Step 4: Commit**

```bash
git add web/src/app/\(protected\)/app/page.tsx web/src/components/app
git commit -m "feat(web): home screen (intentions + suggestions)"
```

---

## Phase 6 — Création d'intention

### Task 6.1: Server Action createIntention

**Files:**

- Create: `web/src/lib/actions/intentions.ts`

- [ ] **Step 1: intentions.ts**

```ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const InputSchema = z.object({
  type: z.enum(['SEND', 'RECEIVE']),
  amount: z.number().positive(),
  currency: z.string().length(3),
  originCountry: z.string().min(1),
  destCountry: z.string().min(1),
})

export async function createIntention(input: z.infer<typeof InputSchema>) {
  const parsed = InputSchema.parse(input)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  // Récupérer le nom (table users jointe via auth_id) pour renseigner intents.user_name,
  // que la lecture des suggestions affiche comme senderName.
  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('auth_id', user.id)
    .maybeSingle()

  const { error } = await supabase.from('intents').insert({
    user_id: user.id,
    user_name: profile?.name ?? 'Utilisateur',
    direction: parsed.type, // colonne DB = `direction`, PAS `type`
    amount: parsed.amount,
    currency: parsed.currency,
    origin_country: parsed.originCountry,
    dest_country: parsed.destCountry,
    status: 'OPEN',
  })
  if (error) throw error
  revalidatePath('/app')
}
```

> Vérifié contre `src/services/apiService.ts:createRequest` + `dataService.ts:createIntention`. Le `user_name` est ajouté (amélioration fidèle au chemin de lecture des suggestions ; le mobile s'appuie sinon sur le fallback 'Utilisateur').

- [ ] **Step 2: Commit**

```bash
git add web/src/lib/actions/intentions.ts
git commit -m "feat(web): createIntention server action"
```

### Task 6.2: Écran new-intention + succès

**Files:**

- Create: `web/src/app/(protected)/app/new-intention/page.tsx`

- [ ] **Step 1: page.tsx** — toggle SEND/RECEIVE, montant, sélecteur devise, pays origine/destination (composant searchable), validation, appel `createIntention`, puis état succès + retour accueil (intégré dans la même route ou via `?success=1`).

- [ ] **Step 2: Test manuel** — créer une intention SEND.
      Expected: insérée dans Supabase, visible dans "Mes intentions" sur l'accueil.

- [ ] **Step 3: Commit**

```bash
git add web/src/app/\(protected\)/app/new-intention
git commit -m "feat(web): new intention form"
```

---

## Phase 7 — Détail suggestion + acceptation

### Task 7.1: Server Action acceptSuggestion

**Files:**

- Create: `web/src/lib/actions/matches.ts`

- [ ] **Step 1: matches.ts** — séquence VÉRIFIÉE contre `apiService.ts:acceptSuggestion` (8 étapes).

```ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function acceptSuggestion(
  suggestionId: string
): Promise<{ conversationId: string; matchId: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')
  const userId = user.id

  // 1. Récupérer l'intent de la suggestion (encore ouvert)
  const { data: suggestion, error: suggErr } = await supabase
    .from('intents')
    .select('id, user_id, direction, amount, currency, origin_country, dest_country, user_name')
    .eq('id', suggestionId)
    .eq('status', 'OPEN')
    .single()
  if (suggErr || !suggestion) throw new Error('Suggestion introuvable ou déjà acceptée')

  // 2. Nom de l'utilisateur acceptant (jointure via auth_id)
  const { data: acceptingUser } = await supabase
    .from('users')
    .select('name')
    .eq('auth_id', userId)
    .single()
  const acceptingUserName = acceptingUser?.name ?? 'Utilisateur'

  // 3. Créer l'intent complémentaire (sens inverse), déjà MATCHED
  const complementaryDirection = suggestion.direction === 'SEND' ? 'RECEIVE' : 'SEND'
  const { data: myIntent, error: myIntentErr } = await supabase
    .from('intents')
    .insert({
      user_id: userId,
      user_name: acceptingUserName,
      direction: complementaryDirection,
      amount: suggestion.amount,
      currency: suggestion.currency,
      origin_country: suggestion.origin_country,
      dest_country: suggestion.dest_country,
      status: 'MATCHED',
    })
    .select('id')
    .single()
  if (myIntentErr || !myIntent) throw myIntentErr ?? new Error("Erreur création d'intent")

  // 4. Créer le match
  const { data: match, error: matchErr } = await supabase
    .from('matches')
    .insert({ intent_a: suggestion.id, intent_b: myIntent.id, status: 'ACCEPTED' })
    .select('id')
    .single()
  if (matchErr || !match) throw matchErr ?? new Error('Erreur création match')

  // 5. Créer la conversation
  const { data: conversation, error: convErr } = await supabase
    .from('conversations')
    .insert({ match_id: match.id })
    .select('id')
    .single()
  if (convErr || !conversation) throw convErr ?? new Error('Erreur création conversation')

  // 6. Ajouter les 2 participants (l'autre démarre avec 1 non-lu)
  const { error: partErr } = await supabase.from('conversation_participants').insert([
    { conversation_id: conversation.id, user_id: userId, unread_count: 0 },
    { conversation_id: conversation.id, user_id: suggestion.user_id, unread_count: 1 },
  ])
  if (partErr) throw partErr

  // 7. Passer l'intent suggéré en MATCHED
  await supabase
    .from('intents')
    .update({ status: 'MATCHED', updated_at: new Date().toISOString() })
    .eq('id', suggestion.id)

  // 8. Message système d'ouverture
  await supabase.from('messages').insert({
    conversation_id: conversation.id,
    sender_id: userId,
    content: `Match créé ! ${acceptingUserName} a accepté la proposition de ${suggestion.amount} ${suggestion.currency}.`,
  })

  revalidatePath('/app')
  return { conversationId: conversation.id, matchId: match.id }
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/lib/actions/matches.ts
git commit -m "feat(web): acceptSuggestion server action (aligned with mobile)"
```

### Task 7.2: Écran suggested/[id]

**Files:**

- Create: `web/src/app/(protected)/app/suggested/[id]/page.tsx`

- [ ] **Step 1: page.tsx** — charge l'intention par `id` (Server Component), affiche détails (montant, devise, corridor, expéditeur, note), bouton "Accepter" → `acceptSuggestion` → redirige vers `/app/messages/[conversationId]`.

- [ ] **Step 2: Test manuel** — ouvrir une suggestion, accepter.
      Expected: conversation créée, redirection vers le chat.

- [ ] **Step 3: Commit**

```bash
git add web/src/app/\(protected\)/app/suggested
git commit -m "feat(web): suggestion detail + accept"
```

---

## Phase 8 — Messagerie

### Task 8.1: Hooks conversations + messages

**Files:**

- Create: `web/src/lib/queries/useConversations.ts`, `useMessages.ts`

- [ ] **Step 1: useConversations.ts** — liste des conversations de l'utilisateur (counterpart, dernier message, non-lus). `refetchInterval: 20_000`.

- [ ] **Step 2: useMessages.ts** — messages d'une conversation, triés. `refetchInterval: 10_000`.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/queries/useConversations.ts web/src/lib/queries/useMessages.ts
git commit -m "feat(web): conversations and messages query hooks"
```

### Task 8.2: Server Action sendMessage

**Files:**

- Create: `web/src/lib/actions/messages.ts`

- [ ] **Step 1: messages.ts**

```ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(conversationId: string, content: string) {
  const trimmed = content.trim()
  if (!trimmed) throw new Error('Message vide')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  // 1. Insérer le message
  const { error: msgErr } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: trimmed,
  })
  if (msgErr) throw msgErr

  // 2. Toucher le timestamp de la conversation (tri de la liste)
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  // 3. Incrémenter atomiquement le non-lu de l'autre participant (RPC)
  await supabase.rpc('increment_unread_count', { conv_id: conversationId, sender: user.id })

  revalidatePath(`/app/messages/${conversationId}`)
}

export async function markConversationAsRead(conversationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')
  const { error } = await supabase
    .from('conversation_participants')
    .update({ unread_count: 0, last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
  if (error) throw error
  revalidatePath('/app/messages')
}
```

> Séquence VÉRIFIÉE contre `apiService.ts:sendMessage` + `markConversationAsRead`. La RPC `increment_unread_count` prend `{ conv_id, sender }`.

- [ ] **Step 2: Commit**

```bash
git add web/src/lib/actions/messages.ts
git commit -m "feat(web): sendMessage server action"
```

### Task 8.3: Écrans messages + chat

**Files:**

- Create: `web/src/app/(protected)/app/messages/page.tsx`, `web/src/app/(protected)/app/messages/[id]/page.tsx`, `web/src/components/app/ChatBubble.tsx`

- [ ] **Step 1: messages/page.tsx** — liste conversations (`useConversations`), badge non-lus, lien vers chat.

- [ ] **Step 2: messages/[id]/page.tsx** — fil de messages (`useMessages`), `ChatBubble` (aligné gauche/droite selon `senderId === user.id`), champ de saisie + `sendMessage`, scroll bas auto, marquage comme lu.

- [ ] **Step 3: Test manuel** — ouvrir une conversation, envoyer un message.
      Expected: message inséré, visible, polling rafraîchit l'autre côté.

- [ ] **Step 4: Commit**

```bash
git add web/src/app/\(protected\)/app/messages web/src/components/app/ChatBubble.tsx
git commit -m "feat(web): messages list and chat conversation"
```

---

## Phase 9 — Profil + historique

### Task 9.1: Server Actions profil

**Files:**

- Create: `web/src/lib/actions/profile.ts`

- [ ] **Step 1: profile.ts** — `updateProfile` (nom, avatar) + `deleteAccount` (appel Edge Function `delete-account` via `supabase.functions.invoke`), + `signOut`.

```ts
'use server'
import { createClient } from '@/lib/supabase/server'

export async function deleteAccount() {
  const supabase = await createClient()
  const { error } = await supabase.functions.invoke('delete-account')
  if (error) throw error
  await supabase.auth.signOut()
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/lib/actions/profile.ts
git commit -m "feat(web): profile server actions (update, delete, signout)"
```

### Task 9.2: Écran profil

**Files:**

- Create: `web/src/app/(protected)/app/profile/page.tsx`

- [ ] **Step 1: page.tsx** — avatar, nom, badge KYC (`unverified|pending|verified`), note moyenne, bouton déconnexion, suppression compte (avec confirmation). Référence : `src/app/(Protected)/profile.tsx`.

- [ ] **Step 2: Test manuel** — afficher profil, se déconnecter.
      Expected: données correctes, déconnexion redirige `/login`.

- [ ] **Step 3: Commit**

```bash
git add web/src/app/\(protected\)/app/profile
git commit -m "feat(web): profile screen"
```

### Task 9.3: Écran historique

**Files:**

- Create: `web/src/app/(protected)/app/history/page.tsx`

- [ ] **Step 1: page.tsx** — historique des transactions + stats récap. Référence : `src/services/historyService.ts` et `src/app/(Protected)/history.tsx`. Server Component qui lit Supabase.

- [ ] **Step 2: Test manuel** — afficher l'historique.
      Expected: transactions et stats affichées.

- [ ] **Step 3: Commit**

```bash
git add web/src/app/\(protected\)/app/history
git commit -m "feat(web): transaction history screen"
```

---

## Phase 10 — Landing marketing + SEO

### Task 10.1: Landing page

**Files:**

- Create: `web/src/app/page.tsx`, `web/src/components/marketing/{Hero,Features,HowItWorks,CTA,Footer}.tsx`

- [ ] **Step 1: Sections** — Hero (proposition de valeur + CTA "Commencer"), Features (échange P2P, matching, chat, sécurité), HowItWorks (3 étapes), CTA final, Footer (liens CGU, confidentialité). Server Components, dark + jaune, responsive, animations légères. Design distinctif via skill `frontend-design`.

- [ ] **Step 2: page.tsx** — assemble les sections, liens vers `/register` et `/login`.

- [ ] **Step 3: Test manuel** — visiter `/`.
      Expected: landing complète, responsive, CTA mènent à l'auth.

- [ ] **Step 4: Commit**

```bash
git add web/src/app/page.tsx web/src/components/marketing
git commit -m "feat(web): marketing landing page"
```

### Task 10.2: SEO (metadata, sitemap, robots, OG)

**Files:**

- Create: `web/src/app/sitemap.ts`, `web/src/app/robots.ts`, `web/src/app/opengraph-image.tsx`
- Modify: metadata par page publique

- [ ] **Step 1: sitemap.ts** — routes publiques (`/`, `/login`, `/register`, `/terms`).

- [ ] **Step 2: robots.ts** — autoriser public, `disallow: /app`.

- [ ] **Step 3: opengraph-image.tsx** — image OG dark + jaune avec le nom BinomePay.

- [ ] **Step 4: Vérifier**

Run: `cd web && pnpm build`
Expected: build réussit, sitemap/robots générés.

- [ ] **Step 5: Commit**

```bash
git add web/src/app/sitemap.ts web/src/app/robots.ts web/src/app/opengraph-image.tsx
git commit -m "feat(web): SEO (sitemap, robots, OpenGraph)"
```

---

## Phase 11 — Robustesse, QA & déploiement

### Task 11.1: États error / loading / not-found

**Files:**

- Create: `web/src/app/(protected)/app/loading.tsx`, `error.tsx`, `web/src/app/not-found.tsx`

- [ ] **Step 1: loading.tsx** — squelettes. **error.tsx** (Client Component) — message + bouton "Réessayer". **not-found.tsx** — 404 stylée.

- [ ] **Step 2: Commit**

```bash
git add web/src/app
git commit -m "feat(web): error, loading and not-found boundaries"
```

### Task 11.2: Validation finale + QA

- [ ] **Step 1: Qualité**

Run: `cd web && pnpm type-check && pnpm lint && pnpm build`
Expected: tout passe.

- [ ] **Step 2: QA fonctionnelle** — utiliser le skill `/qa` (ou `/browse`) sur `pnpm dev` : parcours login → créer intention → voir suggestion → accepter → chat → profil. Corriger les bugs trouvés.

- [ ] **Step 3: Perf** — skill `/benchmark` sur la landing et `/app` ; viser Core Web Vitals verts.

- [ ] **Step 4: Commit des correctifs éventuels.**

### Task 11.3: Déploiement Vercel

- [ ] **Step 1: Config Vercel** — projet pointant sur ce repo, **Root Directory = `web/`**, framework Next.js auto-détecté, package manager pnpm.

- [ ] **Step 2: Variables d'env Vercel** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (mêmes valeurs que le mobile).

- [ ] **Step 3: Déploiement preview** — vérifier que l'auth par cookies fonctionne en prod (HTTPS), tester un parcours complet.
      Expected: app fonctionnelle sur l'URL preview.

- [ ] **Step 4: Vérifier RLS** — confirmer que les policies Supabase autorisent les mêmes accès depuis le web (même anon key). Ajuster si un accès est bloqué.

- [ ] **Step 5: Promotion en production** quand validé.

---

## Self-Review (couverture du spec)

- §3 Stack : Phases 0–2 ✓ | §4 Structure : Phase 0–10 ✓ | §5 Auth : Phases 2, 4 ✓
- §6 Flux données : Phases 5–9 (queries + actions) ✓ | §7 Écrans : Phases 4–10 (tous mappés) ✓
- §8 Design system : Phase 3 + frontend-design à l'exécution ✓ | §9 Erreurs/perf/qualité : Phase 11 ✓
- §10 Déploiement Vercel : Task 11.3 ✓ | §12 Risques : alignement métier signalé (Tasks 6.1, 7.1, 8.2), RLS (11.3), schémas synchro (1.1)

**Schéma DB verrouillé** : noms de colonnes et séquences (`createIntention`, `acceptSuggestion` 8 étapes, `sendMessage` + RPC `increment_unread_count`, `markConversationAsRead`) vérifiés contre le code mobile et intégrés en dur dans le plan (voir section « Schéma de base de données »). Piège majeur capturé : colonne `direction` (≠ `type`) et jointure `users.auth_id` (≠ `id`). Restent à confirmer au branchement : policies RLS autorisant les mêmes accès depuis le web (Task 11.3) et synchro des schémas Zod si le mobile évolue (Task 1.1).

```

```
