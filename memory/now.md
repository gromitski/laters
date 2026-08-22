# Current project truth

## Purpose

Track the current state and next safe action for the Laters personal read-later PWA.

## Lifecycle

Slices 1 to 5 are complete and published at `https://laters.dustyb.in/`.

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
- Complete physical-device MVP acceptance on Chrome for Android `151.0.7922.173`, including exact-URL duplicate refresh, persistence, deletion, Undo and the offline shell.

## Active focus

Use the accepted personal MVP and verify the visible update action on the next deployment that changes the public application bundle.

## Active slice

Slice 5 real-device Android acceptance is complete. Slice 6 design and launch readiness is deferred until the maintainer supplies the planned design and favicon package.

## Blockers

None.

## Uncertainties

- A minimum Chrome for Android version is not yet evidenced.
- The new update-available action still needs a deployed-version acceptance check.
- Android's news feed may provide distinct rotating or tracking URLs for the same apparent article; exact-URL deduplication correctly retains these as separate items.
- The replacement visual design and favicon package have not yet been supplied.

## Next safe action

Continue using the personal MVP. On the next public-bundle deployment, confirm that Laters shows the **Update** action and retains saved data after applying it. Await the supplied design and favicon package before starting Slice 6.

## Last meaningful update

2026-08-22 — Full real-device MVP acceptance passed on Chrome for Android `151.0.7922.173`. Exact normalised URLs deduplicate correctly; distinct Android news-feed URLs remain separate by design. The offline shell, persistence, deletion and Undo all passed, and saved data survived the transitional update deployment.

## Pointers

- [Working agreements](agreements.md)
- [Product intent](intent.md)
- [Original project idea](../evidence/origin/2026-08-21-origin.md)
- [MVP definition](../docs/mvp-definition.md)
- [Deployment](../docs/deployment.md)
