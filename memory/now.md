# Current project truth

## Purpose

Track the current state and next safe action for the Laters personal read-later PWA.

## Lifecycle

The original personal MVP and all three MVP 2.0 slices are implemented, published and accepted at
`https://laters.dustyb.in/`. Release `v0.1.0` records the first-MVP baseline; `v0.2.0` records the
completed bookmark, source-marker and whole-row-opening release; and `v0.3.0` records the accepted
mobile interaction shell.

## What exists now

- Vendor-neutral canonical project memory and local no-AI-attribution guards. The redundant Cursor
  bootstrap rule has been removed; editor-specific rules are not required by the app or deployment.
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
- The same white/ink/lime identity on the normal desktop browser page, with a wordmark-aligned
  **Install** action that appears only when the browser exposes native PWA installation.
- An accepted `v0.4.0` Paste-to-add slice that adds copied or manually entered HTTP(S) URLs through
  the existing local capture and duplicate-refresh contracts.
- An accepted `v0.4.1` title-edit slice that renames a saved title from the long-press menu while
  locking its URL and preserving the edit across reopen and exact-URL re-capture.
- A published `v0.1.0` GitHub release tagged at verified rewritten commit `0178fc9`.
- Published and maintainer-accepted MVP 2.0 bookmarks with the bright-lime supplied star treatment.
- Published and maintainer-accepted 22px publisher source markers with exact-origin favicon attempts,
  deterministic local fallbacks and the refined 4px first-title-line alignment.
- Published and maintainer-accepted whole-row pointer opening that preserves the semantic title
  link and excludes Bookmark, Delete, selection, scrolling and Ghost/Undo interactions.
- A complete `v0.2.0` release record covering scope, privacy, data compatibility, verification,
  physical Android acceptance and deliberately deferred work.
- An accepted Ionic Core mobile interaction shell with right-swipe Bookmark or Remove, warning-red
  left-swipe Delete and a long-press action sheet, while all visible gesture-free controls remain.
- In-place lower-page Delete/Undo that preserves viewport position, touch-only selection suppression
  for long press, designed link focus and the accepted white-centred Undo countdown presentation.
- A complete `v0.3.0` release record covering architecture, interaction safety, accessibility,
  compatibility, verification and physical Android acceptance.

## Active focus

Complete, publish and physically verify the bounded `v0.4.1` **Edit title** slice. No other future
idea is selected.

## Active slice

The post-v0.2.0 mobile interaction shell and its focused corrections are accepted for `v0.3.0`.
Right swipe toggles Bookmark or Remove, left swipe reveals warning-red Delete, and long press opens
the focused action sheet. The first Android test's native outline, dictionary-selection and
lower-page scroll-jump failures were corrected. The accepted Undo presentation is a white centre,
neon-lime outside countdown ring and black glyph. No data migration, backend or new remote service
was introduced. The published post-release extension adds **Share this article** to that same menu
and routes only the saved URL to Android's system share sheet. The maintainer explicitly accepts its
long-press-only placement for this personal app. It is published in commit `8753b67`; GitHub Actions
run `32597495286` passed and the public origin serves the matching production bundle. Physical
testing found that receivers could misinterpret a combined title-and-URL payload; commit `69faadc`
now shares only the URL and protects that contract with a regression test. GitHub Actions run
`32598149427` passed and the corrected bundle is public. Physical Android acceptance passed on
2026-08-23: the generic chooser opened, NotebookLM added a representative public article from the
URL without the saved title contaminating the payload, and cancelling the chooser returned safely
to Laters.

The accepted desktop-parity slice keeps the existing responsive white, ink and lime presentation
and adds **Install** beside the wordmark. The control remains absent unless the browser emits its
native install-availability event, disappears after use or successful installation, and adds no
installer, account, backend or platform-specific package. A clean production check confirmed that
the reported cream and serif desktop page was a stale pre-redesign service-worker shell rather than
the current deployed presentation. Commit `5296776` published the contextual install action;
GitHub Actions run `32632687610` passed. A clean production browser loaded the matching JavaScript
and CSS, displayed the accepted branding, received the browser's install-availability event and
showed the 44px **Install** action vertically centred beside the wordmark at desktop width. The
maintainer subsequently accepted the native installation flow on 2026-08-23.

The maintainer accepted the published desktop branding and native Install flow on 2026-08-23. The
next accepted slice is `v0.4.0`: a persistent **Paste a link** row reads clipboard text only on user
activation and falls back to inline manual URL entry. It reuses existing HTTP(S) validation,
hostname fallback, exact-URL refresh with bookmark preservation, newest-first order, local storage,
source markers and visible feedback. The surrounding design mockup is placement guidance only;
reading times, remote title enrichment and changes to existing screen presentation are excluded.
The accepted hardening correction defaults bare article addresses to HTTPS, removes the input's
generic heavy outline while retaining a visible container focus state, and centralises canonical URL
validation for every capture path. Unsafe schemes, credentials, malformed escapes, control
characters, embedded whitespace and excessive length are rejected.

The maintainer confirmed the current mobile Paste-to-add implementation is working well on
2026-08-23. The next accepted candidate is `v0.4.1`: **Edit title** appears in the existing
long-press/context menu, persists only a deliberate title change and leaves the URL, saved time,
queue position, bookmark state and surrounding layout unchanged. A deliberate edit is retained when
the exact URL is captured again; sharing remains URL-only.

## Blockers

None.

## Uncertainties

- A minimum Chrome for Android version is not yet evidenced.
- Android's news feed may provide distinct rotating or tracking URLs for the same apparent article; exact-URL deduplication correctly retains these as separate items.
- Some Android news-feed shares do not supply a useful article title. Remote title enrichment is a possible later product slice with privacy, security and reliability implications; it is not part of the current design handoff.

## Next safe action

Finish agent-owned verification and publish the exact `v0.4.1` candidate, then test **Edit title**
from the physical Android long-press menu, including persistence and exact-URL re-capture.

## Last meaningful update

2026-08-23 — The maintainer confirmed the mobile Paste-to-add implementation is working well and
accepted `v0.4.1` **Edit title** as the next bounded candidate. Implementation and production
verification are in progress; no tag or GitHub release is authorised.

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
- [MVP 2.0 Slice 3 whole-row opening plan](../docs/planning/mvp-2-slice-3-whole-row-opening-plan.md)
- [Mobile interaction shell plan](../docs/planning/mobile-interaction-shell-plan.md)
- [Paste-to-add plan](../docs/planning/paste-to-add-plan.md)
- [Edit-title plan](../docs/planning/edit-title-plan.md)
- [`v0.2.0` release record](../docs/releases/v0.2.0.md)
- [`v0.3.0` release record](../docs/releases/v0.3.0.md)
- Published GitHub releases: `v0.1.0`, `v0.2.0`, `v0.3.0`
