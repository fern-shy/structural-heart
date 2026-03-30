# Interview Script (2-3 Minutes)

## One-liner

I built a mobile-first structural heart education app with Expo Router that organizes procedures into a hierarchical learning flow and supports mixed-media teaching content.

## Problem and users

- Clinical teams need fast, visual access to procedural knowledge during learning and case preparation.
- The product goal is to make complex interventions easy to navigate on a phone or tablet.

## Architecture summary

- Presentation layer: React Native + Expo Router tabs and nested stacks for predictable mobile UX.
- Domain layer: Typed local content model in `data/content.ts` with `Category -> Subtopic -> Slide`.
- Media layer: Carousel for text/image/video, with inline-to-fullscreen continuity via `VideoPlayerCache`.
- Search layer: Client-side Fuse.js for quick lookup by title/description.

## Tradeoffs I made

- **Chosen now:** Local typed content for speed and low operational complexity.
- **Tradeoff:** Content updates require app updates unless delivered via OTA or future backend manifest.
- **Chosen now:** Remote media via shared links for early iteration speed.
- **Tradeoff:** Google Drive reliability and control are limited for production-scale use.

## What I improved for production readiness

- Added explicit image caching and media fallback/retry behavior in the carousel.
- Created a migration plan to move media to object storage + CDN and remove Drive dependency.
- Defined a release checklist for EAS channels, App Store privacy metadata, and rollout controls.

## What I would build next (full-stack evolution)

- Backend manifest API with signed URLs and content versioning.
- Analytics pipeline for screen/search/media engagement.
- Role-based access controls and audit-friendly content governance.

## Strong close

This project shows that I can take a focused mobile product from prototype architecture to a production hardening roadmap, including platform release, reliability, and backend evolution decisions.
