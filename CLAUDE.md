# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## User Preferences

### File Modification Confirmation
- **CONFIRM_FILE_CHANGES**: `true`
- When set to `true`, Claude must ask for user confirmation before saving any file modifications
- After each file edit, Claude should ask: "Do you want to keep these changes? (y/n)"
- If user responds with "n" or "no", revert the changes
- If user responds with "y" or "yes", keep the changes

## Development Commands

- `npm start` - Start the Expo development server
- `npm run android` - Start the app on Android device/emulator  
- `npm run ios` - Start the app on iOS device/simulator
- `npm run web` - Start the app in web browser

## Architecture Overview

BinomePay is a React Native mobile app built with Expo Router and NativeWind (Tailwind CSS). The app facilitates peer-to-peer currency exchanges by matching users who want to exchange money locally.

### Key Technologies
- **Expo SDK 53** with new architecture enabled
- **Expo Router** for file-based navigation with protected routes
- **NativeWind** for styling (Tailwind CSS for React Native)
- **Zustand** for state management
- **TypeScript** with strict mode enabled
- **React Native Reanimated** for animations
- **Zod** for schema validation and type safety
- **TanStack Query** for server state management and data fetching
- **Clerk** for authentication and user management
- **Supabase** for database and backend services

### Project Structure

```
src/
├── app/                          # Expo Router pages
│   ├── _layout.tsx              # Root layout with AnimatedSplash
│   └── (Protected)/             # Protected route group
│       ├── (tabs)/              # Tab navigation group
│       │   ├── _layout.tsx      # Tab bar layout with gradient
│       │   ├── index.tsx        # Home page (intentions)
│       │   └── messages.tsx     # Messages tab
│       ├── new-intention.tsx    # Create new intention
│       ├── intention-success.tsx
│       ├── profile.tsx
│       └── suggested/[id].tsx   # Dynamic route for suggestions
├── components/                   # Reusable components
│   ├── AnimatedSplash.tsx       # Custom splash screen
│   └── home/                    # Home screen components
├── lib/                         # Utility libraries
│   ├── supabase.ts             # Supabase client configuration
│   ├── schemas/                # Zod schemas for validation
│   └── queries/                # TanStack Query hooks
└── store/
    └── useAppStore.ts           # Zustand store with mock data
```

### State Management

The app uses a combination of state management solutions:
- **Zustand** for client-side state (UI state, temporary data)
- **TanStack Query** for server state management (API calls, caching)
- **Clerk** for authentication state
- **Supabase** for real-time subscriptions and database state

### Data Layer

- **Supabase**: PostgreSQL database with real-time subscriptions
- **Zod**: Schema validation for API responses and form data
- **TanStack Query**: Caching, synchronization, and background updates
- **Clerk**: User authentication, session management, and user metadata

### Authentication Flow

- **Clerk** handles sign-up, sign-in, and user session management
- Protected routes require authenticated user
- User profile data synced between Clerk and Supabase
- KYC status and verification managed through Clerk user metadata

### Navigation Structure

- Root layout handles splash screen animation
- Protected routes group for authenticated screens
- Tab navigation with custom gradient styling
- Dynamic routing for suggestion details

### Key Features

- **Intentions**: Users create money exchange requests (SEND/RECEIVE)
- **Matching**: Algorithm matches compatible users
- **Messaging**: In-app conversations with unread indicators
- **KYC Integration**: User verification status affects UI
- **Country Filtering**: Filter suggestions by destination country
- **Real-time Updates**: Supabase subscriptions for live data
- **Form Validation**: Zod schemas ensure data integrity

### Styling Conventions

- Uses NativeWind classes throughout
- Custom gradient backgrounds for tab bar and components
- Dark theme with blue/yellow accent colors
- Tailwind path configured for `src/app/**` and `src/components/**`

### Path Aliases

- `@/*` resolves to `src/*` (configured in tsconfig.json)

### Data Validation

All data structures are validated using Zod schemas:
- User profiles and authentication data
- Money transfer requests and matches  
- Message and conversation schemas
- API request/response validation

### Development Notes

- TanStack Query handles API caching and background sync
- Supabase provides real-time updates for messages and matches
- Clerk manages authentication state across app restarts
- Zod schemas ensure type safety between client and server