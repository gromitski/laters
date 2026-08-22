# Current project truth

## Purpose

Track the current state and next safe action for the Laters personal read-later PWA.

## Lifecycle

Slices 1 to 6 are implemented, published and accepted at `https://laters.dustyb.in/`. The public GitHub repository and first release, `v0.1.0`, record the complete personal MVP baseline.

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
- A public source repository whose README links directly to the installable live application and explains that every installation keeps its saved list locally.
- Routine changes may be committed directly to `main`; pull requests are optional unless requested or useful for separate review.
- Physical-device installation, standalone launch, Android Share-menu discovery and valid capture verified on Chrome for Android `151.0.7922.173`.
- A user-controlled service-worker update flow that preserves same-origin IndexedDB data and reloads only after the **Update** action is selected.
- Complete physical-device MVP acceptance on Chrome for Android `151.0.7922.173`, including exact-URL duplicate refresh, persistence, deletion, Undo and the offline shell.
- A Claude Design handoff that defines the implemented feature and state contract, icon deliverables, accessibility requirements and strict MVP scope boundary.
- The accepted white/ink/lime identity, self-hosted Bricolage Grotesque typeface, supplied icon family, accessible icon-only Delete control and in-row seven-second Undo state.
- A published `v0.1.0` GitHub release tagged at verified rewritten commit `0178fc9`.

## Active focus

Publish MVP 2.0 Slice 2 through the GitHub Pages workflow, then complete focused maintainer testing
against the live application.

## Active slice

MVP 2.0 Slice 2 is complete and approved for end-of-slice publication. Every normal row now renders
the accepted 22px rounded-square deterministic source tile immediately and attempts
the saved article origin's `/favicon.ico` with a no-referrer policy. A successfully decoded favicon
fades over the tile; missing, blocked, slow or invalid icons leave the fallback visible. The stable
fallback uses the first two ASCII letters or digits from the canonical hostname and FNV-1a UTF-8
hashing into the accepted six-colour palette. No favicon cache, proxy, publisher mapping or stored
data was added. Whole-row pointer opening remains the later accepted Slice 3.

## Blockers

None.

## Uncertainties

- A minimum Chrome for Android version is not yet evidenced.
- Android's news feed may provide distinct rotating or tracking URLs for the same apparent article; exact-URL deduplication correctly retains these as separate items.
- Some Android news-feed shares do not supply a useful article title. Remote title enrichment is a possible later product slice with privacy, security and reliability implications; it is not part of the current design handoff.

## Next safe action

Confirm the authorised GitHub push and Pages workflow, then provide the short physical Android
checks for favicon success, deterministic fallback, offline behaviour and unchanged row actions.

## Last meaningful update

2026-08-22 — Source markers, deterministic identity tests and controlled favicon loading tests are
complete. The full suite passes with 61 tests, the production build succeeds and the public-build
audit passes. The maintainer clarified that every completed slice must be committed and pushed so
testing can take place against the published application; the working agreement now records that
standing end-of-slice workflow and the current Slice 2 push is authorised.

## Pointers

- [Working agreements](agreements.md)
- [Product intent](intent.md)
- [Original project idea](../evidence/origin/2026-08-21-origin.md)
- [MVP definition](../docs/mvp-definition.md)
- [MVP 2.0 definition](../docs/mvp-2-definition.md)
- [Exploratory future ideas](../docs/future-ideas.md)
- [Deployment](../docs/deployment.md)
- [Claude Design handoff](../docs/claude-design-handoff.md)
- [Slice 6 implementation plan](../docs/planning/slice-6-mvp-design-implementation-plan.md)
- [MVP 2.0 Slice 1 bookmark plan](../docs/planning/mvp-2-slice-1-bookmarks-plan.md)
- [MVP 2.0 Slice 2 source marker plan](../docs/planning/mvp-2-slice-2-source-markers-plan.md)
- Published GitHub release: `v0.1.0`
