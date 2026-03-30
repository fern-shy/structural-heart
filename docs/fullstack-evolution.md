# Full-Stack Evolution Roadmap

This document describes how to evolve the current mobile app into a production-grade full-stack system.

## Current state

- Client app contains bundled domain content in [`data/content.ts`](../data/content.ts).
- Media is loaded directly from remote URLs by the mobile client.
- No server-side API, auth model, or analytics pipeline exists yet.

## Target state

- Mobile app consumes typed backend APIs.
- Content and media metadata are managed server-side with versioning.
- Media access is controlled via signed URLs and policy-based authorization.
- Product usage and reliability metrics are collected for continuous improvement.

## Proposed backend capabilities

### 1) Content manifest API

- `GET /v1/content/manifest?version=current`
- Returns categories, subtopics, and typed slide metadata.
- Includes `manifestVersion` and `publishedAt` for cache invalidation and rollback.

### 2) Media access service

- `POST /v1/media/sign`
- Input: requested media keys and client context.
- Output: short-lived signed URLs for private object storage assets.

### 3) Content authoring and publication

- Database entities:
  - `Category`
  - `Subtopic`
  - `Slide`
  - `ManifestRelease`
- Workflow:
  - draft -> review -> publish
  - immutable release snapshots for rollback.

### 4) Analytics events

- Track key events:
  - `screen_view`
  - `search_performed`
  - `media_play_started`
  - `media_play_completed`
  - `media_load_error`
- Add event metadata: `procedureId`, `subtopicId`, `slideId`, app version, platform.

## Mobile client changes

- Replace direct content import with API bootstrap + local caching.
- Keep strict TypeScript contracts between backend DTOs and client domain types.
- Introduce feature flags for staged rollout of backend-driven content.

## Suggested implementation milestones

1. Implement read-only manifest endpoint and static published manifest.
2. Switch client to manifest for one procedure category.
3. Add signed URL flow for private media.
4. Add analytics capture and dashboarding.
5. Move all categories to backend-driven content and retire local content source.
