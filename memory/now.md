# Current project truth

## Purpose

Track the current state and next safe action for the Laters personal read-later PWA.

## Lifecycle

Slices 1 and 2 complete. Slices 3 and 4 are implemented and locally verified on `deploy/github-pages`.

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
- The repository's Pages source is configured for GitHub Actions; no workflow deployment has run yet.
- A repeatable public-build audit covering common secrets, personal data, local paths, source maps, repository documents, binary metadata and unintended external resources.
- Duplicate shares refresh one item at the top, deletion offers an accessible seven-second undo action, relative times refresh on foregrounding, and persistent storage is requested non-fatally.
- Maintained deployment guidance for `laters.dustyb.in` without recording the maintainer's personal DNS provider or account setup.

## Active focus

Publish the verified feature branch for review before the manual domain setup and Android acceptance pass.

## Active slice

Slices 3 and 4 are implemented and locally verified but not committed.

## Blockers

None.

## Uncertainties

- A minimum Chrome for Android version is not yet evidenced.
- Android Share-menu registration and capture still need acceptance on an installed HTTPS build on a physical device.
- GitHub domain verification, DNS and the production TLS certificate require manual completion.
- The replacement visual design and favicon package have not yet been supplied.

## Next safe action

Commit and publish the feature branch for review. Then walk the maintainer through GitHub domain verification, the DNS record and HTTPS activation before Slice 5 Android acceptance.

## Last meaningful update

2026-08-22 — Slices 3 and 4 implemented locally for `laters.dustyb.in`; 29 automated tests, warning-free production build, workflow lint, public-build audit and offline browser reload passed.

## Pointers

- [Working agreements](agreements.md)
- [Product intent](intent.md)
- [Original project idea](../evidence/origin/2026-08-21-origin.md)
- [MVP definition](../docs/mvp-definition.md)
- [Deployment](../docs/deployment.md)
