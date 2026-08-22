# Current project truth

## Purpose

Track the current state and next safe action for the Laters personal read-later PWA.

## Lifecycle

Slices 1 to 6 are implemented, published and accepted at `https://laters.dustyb.in/`. The first GitHub release, `v0.1.0`, records the complete personal MVP baseline.

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
- Maintained deployment behaviour and physical-device acceptance guidance for `laters.dustyb.in` without recording the maintainer's personal DNS provider or account setup.
- A live custom-domain deployment with an approved GitHub certificate and enforced HTTPS.
- Routine changes may be committed directly to `main`; pull requests are optional unless requested or useful for separate review.
- Physical-device installation, standalone launch, Android Share-menu discovery and valid capture verified on Chrome for Android `151.0.7922.173`.
- A user-controlled service-worker update flow that preserves same-origin IndexedDB data and reloads only after the **Update** action is selected.
- Complete physical-device MVP acceptance on Chrome for Android `151.0.7922.173`, including exact-URL duplicate refresh, persistence, deletion, Undo and the offline shell.
- A Claude Design handoff that defines the implemented feature and state contract, icon deliverables, accessibility requirements and strict MVP scope boundary.
- The accepted white/ink/lime identity, self-hosted Bricolage Grotesque typeface, supplied icon family, accessible icon-only Delete control and in-row seven-second Undo state.
- A published `v0.1.0` GitHub release tagged at verified commit `de86359`.

## Active focus

Use the accepted MVP and evaluate possible additions only when normal use provides enough evidence for a new bounded slice.

## Active slice

All current files and reachable history have been cleaned of personal hosting-provider and unnecessary GitHub-account setup details. Obsolete merged or superseded branches have been removed, and the rewritten `main` and `v0.1.0` histories are ready for final public-readiness verification.

## Blockers

None.

## Uncertainties

- A minimum Chrome for Android version is not yet evidenced.
- Android's news feed may provide distinct rotating or tracking URLs for the same apparent article; exact-URL deduplication correctly retains these as separate items.
- Some Android news-feed shares do not supply a useful article title. Remote title enrichment is a possible later product slice with privacy, security and reliability implications; it is not part of the current design handoff.

## Next safe action

Complete the final public-readiness review before changing repository visibility. Treat `docs/future-ideas.md` as exploratory input rather than an active roadmap until the maintainer selects another bounded slice.

## Last meaningful update

2026-08-22 — Current documentation and reachable Git history were sanitised for possible public visibility, obsolete repository branches were removed, and the `v0.1.0` release history was repaired without changing the application build.

## Pointers

- [Working agreements](agreements.md)
- [Product intent](intent.md)
- [Original project idea](../evidence/origin/2026-08-21-origin.md)
- [MVP definition](../docs/mvp-definition.md)
- [Exploratory future ideas](../docs/future-ideas.md)
- [Deployment](../docs/deployment.md)
- [Claude Design handoff](../docs/claude-design-handoff.md)
- [Slice 6 implementation plan](../docs/planning/slice-6-mvp-design-implementation-plan.md)
- Published GitHub release: `v0.1.0`
