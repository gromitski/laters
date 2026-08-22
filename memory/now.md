# Current project truth

## Purpose

Track the current state and next safe action for the Laters personal read-later PWA.

## Lifecycle

Slices 1 to 4 are complete and published at `https://laters.dustyb.in/`.

## What exists now

- The committed AI Project Foundation baseline and local no-AI-attribution guards.
- Canonical product intent in `memory/intent.md`.
- Detailed MVP behaviour, acceptance criteria and delivery slices in `docs/mvp-definition.md`.
- The original idea archived in `evidence/origin/2026-08-21-origin.md`.
- A framework-free TypeScript application built with Vite 8.
- A small `ReadingListStore` contract with a native IndexedDB implementation.
- An accessible responsive reading list with newest-first ordering, original-link opening, immediate deletion and clear empty, success and failure states.
- Focused automated tests for input validation, saved-time formatting, IndexedDB persistence, deterministic ordering and deletion.
- A complete installable-PWA manifest with 192px and 512px app icons.
- A precaching service worker that serves the application shell offline.
- A `POST` Android Web Share Target that validates shared data, supports URLs embedded in Android's text field, saves through the existing IndexedDB boundary and redirects to an accessible result state.
- Accepted deployment and interaction decisions recorded in canonical intent and the MVP definition.
- A GitHub Pages deployment workflow that tests, builds, audits and publishes only `dist/`.
- The repository's Pages source is configured for GitHub Actions and the production workflow has deployed successfully.
- A repeatable public-build audit covering common secrets, personal data, local paths, source maps, repository documents, binary metadata and unintended external resources.
- Duplicate shares refresh one item at the top, deletion offers an accessible seven-second undo action, relative times refresh on foregrounding, and persistent storage is requested non-fatally.
- Maintained deployment guidance for `laters.dustyb.in` without recording the maintainer's personal DNS provider or account setup.
- A live custom-domain deployment with an approved GitHub certificate and enforced HTTPS.
- Routine changes may be committed directly to `main`; pull requests are optional unless requested or useful for separate review.
- Physical-device installation, standalone launch, Android Share-menu discovery and valid capture verified on Chrome for Android `151.0.7922.173`.
- A user-controlled service-worker update flow that preserves same-origin IndexedDB data and reloads only after the **Update** action is selected.

## Active focus

Complete the remaining real-device Chrome for Android acceptance checks and verify the update action after deployment.

## Active slice

Slice 5 real-device Android acceptance is partially complete; update handling is implemented and awaiting deployed-device verification.

## Blockers

None.

## Uncertainties

- A minimum Chrome for Android version is not yet evidenced.
- Duplicate refresh, reopening persistence, deletion, undo and offline-shell behaviour still need physical-device acceptance.
- The new update-available action still needs a deployed-version acceptance check.
- The replacement visual design and favicon package have not yet been supplied.

## Next safe action

After the update-flow deployment, close and reopen the installed Android app once for the transitional activation. Then verify later updates through the in-app action and complete duplicate, persistence, deletion, undo and offline-shell checks.

## Last meaningful update

2026-08-22 — Installation, standalone launch, Share-menu discovery and valid capture passed on Chrome for Android `151.0.7922.173`. A user-controlled update action is implemented and locally verified; normal same-origin deployments retain saved articles in IndexedDB.

## Pointers

- [Working agreements](agreements.md)
- [Product intent](intent.md)
- [Original project idea](../evidence/origin/2026-08-21-origin.md)
- [MVP definition](../docs/mvp-definition.md)
- [Deployment](../docs/deployment.md)
