# Media Migration Plan: Google Drive to CDN

This plan replaces Google Drive-hosted assets with a production-safe storage and delivery model.

## Why migrate

- Drive share links can fail due to quota, redirects, auth gates, or response format changes.
- Clinical media needs predictable availability, performance, and lifecycle controls.
- CDN-backed object storage gives stable URLs, cache controls, and stronger governance.

## Target architecture

- **Storage:** S3-compatible bucket (or GCS/R2 equivalent)
- **Delivery:** CDN front door (CloudFront/Cloud CDN)
- **Metadata source:** Manifest API (or signed static manifest) consumed by app
- **Security:** Private bucket + signed URLs for restricted content

## Migration phases

1. **Inventory and normalize**
   - Enumerate all media entries in [`data/content.ts`](../data/content.ts).
   - Create canonical naming convention: `{procedure}/{topic}/{sequence}_{slug}.{ext}`.
   - Define target specs (image size, video bitrate, poster image requirement).

2. **Upload and verify**
   - Upload assets to object storage by environment (`dev`, `preview`, `prod`).
   - Validate MIME types, cache headers, and CORS policy.
   - Run playback checks on iOS/Android real devices.

3. **Introduce manifest contract**
   - Add a content manifest schema with media URL, media type, poster URL, checksum, and version.
   - Keep app-side typing aligned with `Slide`.

4. **App compatibility period**
   - Continue using `driveToDirectUrl` for legacy links as fallback.
   - Prefer manifest/CDN URLs when available.
   - Instrument errors for fallback hit rate.

5. **Cutover and cleanup**
   - Replace remaining Drive links.
   - Remove Drive transformation utility once migration is complete and stable.

## Immediate app-level hardening completed

- Image rendering now uses explicit cache policy.
- Image and video slides now provide user-visible error states and retry actions.

## Definition of done

- 100% of production media served from CDN origin.
- No Drive URLs in content manifests.
- Error rate threshold agreed and observed in production telemetry.
