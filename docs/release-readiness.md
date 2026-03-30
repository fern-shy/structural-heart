# Release Readiness Checklist (iOS + Android)

This checklist is tailored to the current Expo/EAS setup in [`app.json`](../app.json) and [`eas.json`](../eas.json).

## 1) Product and compliance

- Define app positioning and medical disclaimer language.
- Complete App Store Connect privacy questionnaire.
- Confirm content rights and hosting agreements for all clinical media.
- Prepare support URL, privacy policy URL, and contact email.

## 2) Configuration and identifiers

- Verify iOS bundle identifier in `app.json` matches App Store Connect app.
- Set explicit Android package name in `app.json` before Play Store release.
- Confirm `runtimeVersion` policy and EAS channels are aligned to rollout strategy.
- Confirm `expo.owner` and `eas.projectId` match intended org/project.

## 3) Build and signing

- Run lint and smoke tests before each release.
- Build preview candidate:
  - `eas build --platform ios --profile preview`
- Build production candidate:
  - `eas build --platform ios --profile production`
- Ensure signing credentials are healthy in EAS.

## 4) Device validation

- Test on physical iPhone devices, not simulator only.
- Validate media playback quality and error fallback behavior on real networks.
- Validate orientation/fullscreen transitions on image and video slides.
- Validate search and deep links for all major procedure paths.
- Validate behavior under New Architecture (`newArchEnabled`).

## 5) OTA and release controls

- Define channel policy:
  - `development` for engineers
  - `preview` for testers
  - `production` for store users
- Define rollback strategy for bad OTA updates.
- Tag and document each production release version.

## 6) Submission and post-release

- Submit iOS build (manual or `eas submit`) with release notes.
- Monitor crashes, media load errors, and user feedback in first 24-72 hours.
- Keep a rollback candidate and hotfix path ready.

## Suggested runbook commands

```bash
npm run lint
eas build --platform ios --profile preview
eas build --platform ios --profile production
```
