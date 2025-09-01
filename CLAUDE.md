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
└── store/
    └── useAppStore.ts           # Zustand store with mock data
```

### State Management

The app uses Zustand with a single store (`useAppStore`) containing:
- User profile and KYC status
- Money transfer requests and matches
- Conversations with unread counts
- Suggested exchanges with filtering

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

### Styling Conventions

- Uses NativeWind classes throughout
- Custom gradient backgrounds for tab bar and components
- Dark theme with blue/yellow accent colors
- Tailwind path configured for `src/app/**` and `src/components/**`

### Path Aliases

- `@/*` resolves to `src/*` (configured in tsconfig.json)

### Mock Data

Currently uses mock data in the Zustand store. All user profiles, conversations, matches, and suggestions are hardcoded for development.