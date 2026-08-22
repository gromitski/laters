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

Complete final physical Android confirmation of the published post-acceptance visual correction
for MVP 2.0 Slice 1.

## Active slice

MVP 2.0 Slice 1, persistent bookmarks and the metadata-line foundation, is published on `main` at
commit `1f1d0e1`. Its automated and physical Android behaviour passed acceptance. Acceptance found
two visual issues: touch-retained row hover obscured the true bookmark background, and the
provisional star did not match the intended supplied artwork. The correction is published from
commit `6f8a527`: hover treatments require real hover/fine-pointer capability, and the new Claude
handoff's hollow and bright-lime filled star assets are integrated while its 22px rounded-square
publisher fallback is retained for Slice 2. Publisher favicons and whole-row pointer opening
remain later accepted slices.

## Blockers

None.

## Uncertainties

- A minimum Chrome for Android version is not yet evidenced.
- Android's news feed may provide distinct rotating or tracking URLs for the same apparent article; exact-URL deduplication correctly retains these as separate items.
- Some Android news-feed shares do not supply a useful article title. Remote title enrichment is a possible later product slice with privacy, security and reliability implications; it is not part of the current design handoff.

## Next safe action

Confirm the deployment workflow, then perform final Android checks for the corrected touch
background and supplied star artwork before beginning Slice 2.

## Last meaningful update

2026-08-22 — Physical Android acceptance passed the Slice 1 functional checks and found two visual
defects. Correction commit `6f8a527` prevents sticky touch-hover backgrounds and uses the
designer's supplied hollow/bright-lime star SVGs. The supplied 22px rounded-square fallback
treatment is accepted for Slice 2; unsound caching, origin and registrable-domain advice was not
adopted. The maintainer authorised commit and push for deployment and final Android confirmation.

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
- Published GitHub release: `v0.1.0`
