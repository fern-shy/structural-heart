# Structural Heart App Architecture

This app is a mobile-first Expo Router client that serves procedural education content with mixed media.

## Major mechanics

- **Routing and navigation**
  - Root stack and theming: [`app/_layout.tsx`](../app/_layout.tsx)
  - Tab layout (`Procedures`, `Search`, `References`): [`app/(tabs)/_layout.tsx`](<../app/(tabs)/_layout.tsx>)
  - Procedure path: `Category -> Subtopic -> Detail`: [`app/(tabs)/procedures/index.tsx`](<../app/(tabs)/procedures/index.tsx>), [`app/(tabs)/procedures/[categoryId].tsx`](<../app/(tabs)/procedures/[categoryId].tsx>), [`app/(tabs)/procedures/[categoryId]/[subtopicId].tsx`](<../app/(tabs)/procedures/[categoryId]/[subtopicId].tsx>)

- **Content and data model**
  - Content is sourced from **Firebase Firestore** at runtime and assembled into the domain tree.
  - Firestore model: `categories/{id}` -> `subtopics/{id}` (subcollection) -> `slides/{id}` (subcollection). Nesting of subtopics uses a `parentId` field; sibling order uses an `order` number. See [`lib/content/schema.ts`](../lib/content/schema.ts).
  - Fetch + tree assembly: [`lib/content/fetchContent.ts`](../lib/content/fetchContent.ts). Loaded once and shared via [`context/ContentProvider.tsx`](../context/ContentProvider.tsx) (`useContent()`), mounted in [`app/_layout.tsx`](../app/_layout.tsx).
  - Offline/first-run: last fetch is cached in AsyncStorage ([`lib/content/contentCache.ts`](../lib/content/contentCache.ts)); the bundled snapshot [`data/content.ts`](../data/content.ts) is the final fallback.
  - Types: [`types/media.ts`](../types/media.ts) (`Slide`), [`types/content.ts`](../types/content.ts) (`Category`/`Subtopic`/`Content`).
  - Relationship: `Category[] -> Subtopic[] -> Slide[]` with optional nested `children`.
  - Editing: a login-gated web editor under [`app/admin/`](../app/admin) (categories, procedures, slides; create/edit/reorder/delete) writes via [`lib/content/adminApi.ts`](../lib/content/adminApi.ts). Auth is Firebase Auth email/password ([`context/AuthProvider.tsx`](../context/AuthProvider.tsx)); write access is gated by an `admin` custom claim granted with [`scripts/set-admin.ts`](../scripts/set-admin.ts) and enforced in [`firestore.rules`](../firestore.rules). The Firebase console remains a fallback. See [`content-editing-guide.md`](content-editing-guide.md).

- **Media delivery and playback**
  - Carousel rendering for image/video/text slides: [`components/MediaCarousel.tsx`](../components/MediaCarousel.tsx)
  - Drive URL normalization to direct links: [`utils/drive.ts`](../utils/drive.ts)
  - Player reuse between inline and fullscreen to reduce restart/download churn: [`utils/videoPlayerCache.ts`](../utils/videoPlayerCache.ts)
  - Fullscreen and orientation transitions in detail screen and hook: [`app/(tabs)/procedures/[categoryId]/[subtopicId].tsx`](<../app/(tabs)/procedures/[categoryId]/[subtopicId].tsx>), [`hooks/useOrientationFullscreen.ts`](../hooks/useOrientationFullscreen.ts)

- **Search behavior**
  - Client-side fuzzy search using Fuse over flattened category subtopics: [`app/(tabs)/search/index.tsx`](<../app/(tabs)/search/index.tsx>)

## Mobile-first design choices

- Uses native tabs and stack transitions instead of web-first navigation.
- Uses fullscreen media modal and orientation-aware behavior for procedural videos.
- Keeps content local for fast startup and deterministic UX in low-connectivity environments.

## Current limitations

- Content is managed directly in the Firebase console (no draft/publish/versioning workflow yet).
- Media is migrating from Google Drive links to Firebase Storage; both are supported during the transition (`driveToDirectUrl` passes Storage URLs through unchanged).
- Search index does not currently recurse into all nested child levels.
