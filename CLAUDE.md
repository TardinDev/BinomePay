# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## User Preferences

### Language

- The user speaks French. Respond in French.

### File Modification Confirmation

- **CONFIRM_FILE_CHANGES**: `true`
- When set to `true`, Claude must ask for user confirmation before saving any file modifications
- After each file edit, Claude should ask: "Do you want to keep these changes? (y/n)"
- If user responds with "n" or "no", revert the changes
- If user responds with "y" or "yes", keep the changes

---

## Project Overview

**BinomePay** is a React Native mobile app that facilitates peer-to-peer currency exchanges. Users create exchange intentions (SEND or RECEIVE money), and the app matches compatible users who can then communicate and complete the exchange locally.

**Target platforms:** Android (Play Store) & iOS (App Store)
**Current version:** 1.0.2

---

## Tech Stack

| Layer          | Technology                            | Version                  |
| -------------- | ------------------------------------- | ------------------------ |
| Framework      | Expo SDK                              | ~53.0.23                 |
| Language       | TypeScript                            | ~5.8.3 (strict mode)     |
| Navigation     | Expo Router                           | ~5.1.7 (file-based)      |
| Styling        | NativeWind (Tailwind CSS)             | ^4.1.23                  |
| State (client) | Zustand                               | ^5.0.7                   |
| State (server) | TanStack React Query                  | ^5.87.1                  |
| Auth           | Supabase Auth (@supabase/supabase-js) | ^2.55.0                  |
| Database       | Supabase (PostgreSQL)                 | ^2.55.0                  |
| Validation     | Zod                                   | ^4.1.5                   |
| Animations     | React Native Reanimated               | ~3.17.4                  |
| Runtime        | React 19 + React Native 0.79.6        | New Architecture enabled |

---

## Development Commands

```bash
npm start                    # Start Expo dev server
npm run android              # Run on Android
npm run ios                  # Run on iOS
npm run web                  # Run on web

npm run type-check           # TypeScript check (tsc --noEmit)
npm run lint                 # ESLint check
npm run lint:fix             # ESLint auto-fix
npm run format               # Prettier format
npm run validate             # type-check + lint + format:check

npm run build:android:preview     # EAS build (APK, internal)
npm run build:android:production  # EAS build (AAB, production)
npm run deploy:production         # Build + submit to Play Store
npm run security-check            # Run security validation script
npm run pre-deploy-check          # Run pre-deployment checks
```

---

## Project Structure

```
src/
├── app/                              # Expo Router - file-based routing
│   ├── _layout.tsx                   # Root: AuthProvider > QueryProvider > SafeAreaView > Slot
│   ├── (auth)/                       # Public auth screens
│   │   ├── _layout.tsx               # Auth layout with login/register switcher tabs
│   │   ├── login.tsx                 # Sign in via Supabase Auth (signInWithPassword)
│   │   ├── register.tsx              # Sign up via Supabase Auth + email verification
│   │   ├── verify.tsx                # Email OTP verification (verifyOtp signup)
│   │   ├── forgot-password.tsx       # Password reset (2-step: email then OTP+new password)
│   │   └── terms.tsx                 # Terms of service (CGU)
│   └── (Protected)/                  # Authenticated screens (redirects to login if not signed in)
│       ├── _layout.tsx               # Auth guard via useAuth() + data init
│       ├── (tabs)/                   # Bottom tab navigation
│       │   ├── _layout.tsx           # Tab bar with gradient + badge for unread messages
│       │   ├── index.tsx             # Home: matches + my intentions + suggestions from others
│       │   ├── messages.tsx          # Conversations list with unread counts
│       │   └── profile.tsx           # Quick profile access (tab)
│       ├── new-intention.tsx         # Create intention form (SEND/RECEIVE toggle, amount, currency, countries)
│       ├── intention-success.tsx     # Success screen after creation
│       ├── suggested/[id].tsx        # Suggestion detail + accept match
│       ├── messages/[id].tsx         # Chat conversation
│       ├── profile.tsx               # Full profile: avatar, KYC status, rating, logout
│       └── history.tsx               # Transaction history + summary stats
│
├── components/
│   ├── AnimatedSplash.tsx            # Splash screen with Reanimated scale/fade
│   ├── ConnectionStatus.tsx          # Network connectivity indicator
│   ├── ErrorBoundary.tsx             # React error boundary
│   ├── LoadingSpinner.tsx            # Loading states + LoadingScreen
│   ├── QueryProvider.tsx             # TanStack Query provider with error handling
│   ├── ToastProvider.tsx             # Toast notification system
│   ├── ConfirmationDialog.tsx        # Reusable confirmation modal
│   ├── ReportUserModal.tsx           # Report user functionality
│   ├── SearchableSelector.tsx        # Searchable dropdown component
│   ├── SkeletonLoader.tsx            # Skeleton loading placeholders
│   └── home/                         # Home screen components
│       ├── HomeHeader.tsx            # User greeting header
│       ├── KycBadge.tsx              # KYC verification status badge
│       ├── CreateIntentionButton.tsx  # CTA to create new intention
│       ├── CountryFilter.tsx         # Country filter for suggestions
│       ├── SuggestedCard.tsx         # Suggestion card component
│       ├── SuggestedList.tsx         # Suggestions list
│       ├── RecentMatchCard.tsx       # Match card component
│       └── RecentMatchesList.tsx     # Horizontal matches list
│
├── services/
│   ├── apiService.ts                 # Main API layer: Supabase queries + REST fallback + offline queue
│   ├── dataService.ts                # Lit le profil Supabase pour l'utilisateur courant
│   ├── syncService.ts                # Periodic data sync (30s interval) + connectivity aware
│   ├── notificationService.ts        # Push notifications via expo-notifications
│   ├── ratingService.ts              # User rating system
│   ├── historyService.ts             # Transaction history
│   ├── offlineStorage.ts             # Offline data persistence
│   ├── storageService.ts             # AsyncStorage wrapper
│   └── errorReporting.ts             # Error tracking/reporting
│
├── store/
│   └── useAppStore.ts                # Zustand store: user, requests, matches, suggestions, conversations
│                                     # Optimistic updates, offline queue, loading/error states
│
├── lib/
│   ├── auth.tsx                      # AuthProvider + useAuth() wrapper around supabase.auth
│   ├── supabase.ts                   # Supabase client initialization (AsyncStorage persisted)
│   ├── schemas/                      # Zod validation schemas
│   │   ├── user.ts                   # User profile schema
│   │   ├── exchange.ts               # RequestItem + SuggestedItem schemas
│   │   ├── conversation.ts           # Message + conversation schemas
│   │   └── index.ts                  # Schema exports
│   └── queries/                      # TanStack Query setup
│       ├── queryClient.ts            # Query client config
│       ├── keys.ts                   # Query key factory
│       └── hooks/                    # Query hooks
│           ├── useExchanges.ts       # useRequests, useSuggestions, useAcceptSuggestion
│           ├── useUser.ts            # useUserProfile
│           └── index.ts
│
├── hooks/
│   ├── useAppInitialization.ts       # App startup initialization
│   ├── useDataSync.ts                # Data synchronization hook
│   ├── useRealtimeSubscription.ts    # Supabase real-time subscriptions
│   ├── useToast.ts                   # Toast notifications hook
│   ├── useBiometricAuth.ts           # Biometric authentication
│   ├── useRateLimit.ts               # Rate limiting for actions
│   ├── useRetry.ts                   # Retry logic with exponential backoff
│   └── useSessionTimeout.ts          # Session timeout management
│
├── utils/
│   ├── dateUtils.ts                  # Date formatting (useFormattedDate hook)
│   ├── validation.ts                 # Input validation helpers
│   └── security.ts                   # Security utilities
│
└── config/
    └── app.ts                        # Feature flags + app configuration
```

---

## Architecture & Data Flow

### Authentication Flow

```
App Launch → AuthProvider (root _layout.tsx, wraps supabase.auth)
  → (auth)/ screens if not signed in
  → (Protected)/_layout.tsx if signed in
    → useAuth() exposes { isLoaded, isSignedIn, user, session }
    → initializeUserData(authUser.id) loads all data
    → Tab navigation renders
```

### Auth API mapping

- Sign in: `supabase.auth.signInWithPassword({ email, password })`
- Sign up: `supabase.auth.signUp({ email, password, options: { data: { firstName } } })`
- Verify signup OTP: `supabase.auth.verifyOtp({ email, token, type: 'signup' })`
- Reset password: `resetPasswordForEmail` → `verifyOtp(type:'recovery')` → `updateUser({ password })`
- Sign out: `supabase.auth.signOut()`
- A SQL trigger `handle_new_user` creates `profiles` + `users` rows on every new `auth.users` insert.
- Account deletion goes through the `delete-account` Edge Function (service role bypasses RLS).

### Intention Creation Flow

```
User fills form (new-intention.tsx)
  → Validates with isValid()
  → supabase.from('intents').insert({...})     # Server persistence
  → addRequest() in Zustand store               # Optimistic local update
  → Navigate to intention-success
```

### Data Visibility (Critical for matching)

- **My intentions:** `supabase.from('intents').eq('user_id', userId)` → shown in "Mes intentions"
- **Others' intentions:** `supabase.from('intents').neq('user_id', userId).eq('status', 'OPEN')` → shown in "Propositions pour vous"
- Users ONLY see other users' open intentions as suggestions

### Offline Support

```
Action fails → ApiService.queueOfflineAction() → AsyncStorage
  → syncService detects connectivity → processOfflineQueue()
  → Retries queued actions (CREATE_REQUEST, SEND_MESSAGE, ACCEPT_SUGGESTION, UPDATE_PROFILE)
```

### State Management Strategy

- **Zustand** (`useAppStore`): Client state, UI state, optimistic updates
- **TanStack Query** (configured but Zustand is primary): Server state caching
- **Supabase Auth**: Session + JWT (stored in AsyncStorage, auto-refresh on app foreground)
- **Supabase**: Database source of truth, real-time subscriptions (configurable)

---

## Key Types

```typescript
type User = { id; name; kycStatus: 'unverified' | 'pending' | 'verified'; ratingAvg; avatarUrl? }
type RequestItem = {
  id
  type: 'SEND' | 'RECEIVE'
  amount
  currency
  originCountry
  destCountry
  status: 'OPEN' | 'MATCHED' | 'CLOSED'
}
type SuggestedItem = {
  id
  amount
  currency
  originCountryName
  destCountryName
  senderName
  note?
  createdAt
  isAccepted?
}
type MatchItem = {
  id
  counterpartName
  amount
  currency
  corridor
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED'
}
type Conversation = { id; counterpartName; lastMessage; updatedAt; unreadCount; matchDetails? }
```

---

## Styling Conventions

- **NativeWind** (Tailwind CSS classes) used throughout
- **Dark theme**: black backgrounds (`bg-black`, `bg-neutral-900`)
- **Accent colors**: yellow (`#EAB308`, `#FDE68A`) for primary actions, blue (`#3B82F6`, `#60A5FA`) for secondary
- **Tab bar**: Custom gradient background (`#0B1220` → `#0B0F1A`) with rounded top corners
- **Cards**: `border border-gray-800 rounded-xl bg-neutral-900`
- **Buttons**: Yellow gradient for primary, gray for disabled

---

## Environment Configuration

| File              | Purpose                                    |
| ----------------- | ------------------------------------------ |
| `.env`            | Development (MOCK_API=true, localhost API) |
| `.env.preview`    | Staging/preview builds                     |
| `.env.production` | Production (MOCK_API=false, real API)      |

**Key env vars:**

- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase connection (auth + DB)
- `EXPO_PUBLIC_API_URL` - Backend API URL
- `EXPO_PUBLIC_MOCK_API` - Toggle mock data (true/false)

---

## Build & Deploy

- **EAS Build** configured in `eas.json`
- Android production: AAB (app-bundle) format for Play Store
- Android preview: APK format for internal testing
- Submit via `eas submit --platform android`
- Service account key: `./service-account-key.json` (gitignored)
- App identifiers: `com.binomepay.app` (both Android package and iOS bundleIdentifier)

---

## Path Aliases

- `@/*` → `src/*` (configured in tsconfig.json + babel.config.js)

---

## Important Notes

- All `console.log/warn/error` are wrapped in `if (__DEV__)` guards
- The `CAMERA` permission is declared for future KYC photo verification
- Intentions are inserted directly into Supabase (not through REST API) for real-time visibility
- The store uses `nanoid` for temporary IDs during optimistic updates, replaced by real IDs on server response
- Feature flags in `src/config/app.ts` control which features are enabled
- Supabase real-time is configurable but currently disabled (sync service polls every 30s)
