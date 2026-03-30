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
npx expo start
```

## Project documentation

- Architecture and system walkthrough: [`docs/architecture.md`](docs/architecture.md)
- Media storage migration plan (Google Drive -> CDN): [`docs/media-migration.md`](docs/media-migration.md)

## Current tech stack

- Expo SDK 54 + Expo Router
- React Native 0.81 + React 19
- Media: `expo-image`, `expo-video`
- Search: `fuse.js` ... much love to Ian Brash for teaching me about fuse!
- OTA updates: `expo-updates` with EAS channels

## Core code paths

- App shell: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`
- Procedure screens: `app/(tabs)/procedures/*`
- Search: `app/(tabs)/search/index.tsx`
- Content model: `data/content.ts`, `types/media.ts`
- Media handling: `components/MediaCarousel.tsx`, `utils/drive.ts`, `utils/videoPlayerCache.ts`
