# Current project truth

## Purpose

Track the current state and next safe action for the Laters personal read-later PWA.

## Lifecycle

Slices 1 to 6 are implemented and published at `https://laters.dustyb.in/`. Physical-device acceptance of the Slice 6 design remains pending.

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
- A Claude Design handoff that defines the implemented feature and state contract, icon deliverables, accessibility requirements and strict MVP scope boundary.
- The accepted white/ink/lime identity, self-hosted Bricolage Grotesque typeface, supplied icon family, accessible icon-only Delete control and in-row seven-second Undo state.

## Active focus

Complete the focused physical-device acceptance of the deployed Slice 6 design.

## Active slice

Slice 5 real-device Android acceptance is complete. Slice 6A visual identity, Slice 6B in-row Undo and Slice 6C local verification are committed, deployed and documented in `docs/planning/slice-6-mvp-design-implementation-plan.md`; focused Android acceptance remains.

## Blockers

None.

## Uncertainties

- A minimum Chrome for Android version is not yet evidenced.
- The update-available action still needs physical-device acceptance on the next public-bundle deployment.
- Android's news feed may provide distinct rotating or tracking URLs for the same apparent article; exact-URL deduplication correctly retains these as separate items.
- Some Android news-feed shares do not supply a useful article title. Remote title enrichment is a possible later product slice with privacy, security and reliability implications; it is not part of the current design handoff.

## Next safe action

On the installed Android PWA, apply the available update and confirm the retained list, new design, home-screen icon, white splash, Delete, Undo and expiry behaviour.

## Last meaningful update

2026-08-22 — Slice 6 was implemented, verified, committed and deployed: self-hosted typography and licence, supplied icons, white/ink/lime identity, accessible icon controls, and an in-row seven-second Undo state. All 35 tests, the production build, public-build audit, 320px long-title checks, wide layout, update flow, share status, invalid-share error and ghost-row presentation passed. GitHub's verification and Pages deployment workflow completed successfully.

## Pointers

- [Working agreements](agreements.md)
- [Product intent](intent.md)
- [Original project idea](../evidence/origin/2026-08-21-origin.md)
- [MVP definition](../docs/mvp-definition.md)
- [Deployment](../docs/deployment.md)
- [Claude Design handoff](../docs/claude-design-handoff.md)
- [Slice 6 implementation plan](../docs/planning/slice-6-mvp-design-implementation-plan.md)
