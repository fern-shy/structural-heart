# Structural Heart

Mobile-first educational app for structural heart procedures, built with Expo Router and React Native.

## What this app demonstrates

- Clear mobile information architecture: `Procedures -> Subtopics -> Slides`
- Mixed-media clinical learning experience (text, image, video)
- Offline-friendly packaged content model with remote media delivery
- iOS/Android release path via Expo Application Services (EAS)

## Quick start

```bash
npm install
cp .env.example .env   # fill in your Firebase project values
npx expo start
```

## Backend (Firebase)

Content is served from **Firestore**, media from **Firebase Storage**, and edited
by non-coders directly in the Firebase console.

1. Create a Firebase project and a Web app; copy its config into `.env`
   (`EXPO_PUBLIC_FIREBASE_*`, see `.env.example`).
2. Deploy the security rules: `firestore.rules`, `storage.rules`
   (e.g. `firebase deploy --only firestore:rules,storage`).
3. Add content with the content editor below. The app needs Firebase: it
   keeps a copy of the last content it loaded for offline use, but has no
   built-in content of its own.

### Content editor (for non-coders)

A login-gated web editor lets the client manage categories, procedures, and
slides without touching Firestore directly.

1. Create the editor account: Firebase console -> Authentication -> add a user
   (and enable the Email/Password provider).
2. Grant it edit access: `npm run set-admin -- their@email.com`.
3. Upgrade the Firebase project to **Blaze** (pay-as-you-go; usage normally
   stays inside the no-cost Storage tier) and enable Storage so the editor can
   accept drag-and-drop image/video uploads. Then deploy rules:
   `npm run deploy:rules`.
4. Open the app on web (`npx expo start`, press `w`) and navigate to `/admin`.

The editor asks you to type **Yes** before any delete, lets you drag procedures
into one another, previews slides as they will look on a phone, and uploads
files from the computer to Firebase Storage.

See [`docs/content-editing-guide.md`](docs/content-editing-guide.md) for the full
walkthrough. Editing is gated by the `admin` custom claim (see `firestore.rules`),
so the public app stays read-only.

### Deploy the editor to a URL (Firebase Hosting)

```bash
npx firebase login     # one time
npm run deploy         # exports the web build and deploys hosting
```

The editor is then reachable at `https://structural-heart.web.app/admin`. Rules
can be deployed separately with `npm run deploy:rules`.

## Project documentation

- Architecture and system walkthrough: [`docs/architecture.md`](docs/architecture.md)
- Content editing guide for non-coders: [`docs/content-editing-guide.md`](docs/content-editing-guide.md)
- Media storage (Firebase Storage; Google Drive support removed in 1.1.0): [`docs/media-migration.md`](docs/media-migration.md)

## Current tech stack

- Expo SDK 54 + Expo Router
- React Native 0.81 + React 19
- Backend: Firebase Firestore (content) + Firebase Storage (media)
- Media: `expo-image`, `expo-video`
- Search: `fuse.js` ... much love to Ian Brash for teaching me about fuse!
- OTA updates: `expo-updates` with EAS channels

## Core code paths

- App shell: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`
- Procedure screens: `app/(tabs)/procedures/*`
- Search: `app/(tabs)/search/index.tsx`
- Firebase init: `lib/firebase.ts`
- Content layer: `lib/content/*` (schema, fetch, cache), `context/ContentProvider.tsx`
- Content types: `types/content.ts`, `types/media.ts`
- Media handling: `components/MediaCarousel.tsx`, `components/SlideFallback.tsx`, `utils/videoPlayerCache.ts`
