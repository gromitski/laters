# Current project truth

## Purpose

Track the current state and next safe action for the Laters personal read-later PWA.

## Lifecycle

Slices 1 and 2 complete. Slices 3 and 4 are implemented and verified on `deploy/github-pages` in draft PR #1.

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

Merge draft PR #1 to create the first Actions deployment, then complete certificate activation and Android acceptance.

## Active slice

Slices 3 and 4 are committed, published and passing pull-request verification.

## Blockers

None.

## Uncertainties

- A minimum Chrome for Android version is not yet evidenced.
- Android Share-menu registration and capture still need acceptance on an installed HTTPS build on a physical device.
- GitHub domain verification and the DNS record are complete; the production TLS certificate is awaiting the first Actions deployment and GitHub provisioning.
- The replacement visual design and favicon package have not yet been supplied.

## Next safe action

Obtain explicit approval to merge draft PR #1 and trigger the first Pages deployment. Then verify the custom-domain certificate, enforce HTTPS and complete Slice 5 Android acceptance.

## Last meaningful update

2026-08-22 — Slices 3 and 4 published in draft PR #1; `dustyb.in` is verified, `laters.dustyb.in` is attached to Pages, and its DNS record resolves publicly. The first workflow deployment and certificate remain pending.

## Pointers

- [Working agreements](agreements.md)
- [Product intent](intent.md)
- [Original project idea](../evidence/origin/2026-08-21-origin.md)
- [MVP definition](../docs/mvp-definition.md)
- [Deployment](../docs/deployment.md)
