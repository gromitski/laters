# Current project truth

## Purpose

Track the current state and next safe action for the Laters personal read-later PWA.

## Lifecycle

The original personal MVP and all three MVP 2.0 slices are implemented, published and accepted at
`https://laters.dustyb.in/`. Release `v0.1.0` records the first-MVP baseline; `v0.2.0` records the
completed bookmark, source-marker and whole-row-opening release; and `v0.3.0` records the accepted
mobile interaction shell. Release `v0.4.2` consolidates the accepted sharing, desktop-install,
paste-to-add, title-edit and desktop-responsiveness work delivered after `v0.3.0`. Release `v0.5.0`
records private Google Drive live sync, and `v0.5.1` records its automatic housekeeping follow-up.

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
- An accepted `v0.4.2` desktop-responsiveness slice that exposes the existing article menu through a
  visible three-dot control and lets the focused content shell grow modestly on wide screens.
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
- A complete `v0.4.2` release record covering post-v0.3 capture, sharing, desktop access, security,
  compatibility, verification and maintainer acceptance.

## Active focus

Release `v0.5.0` closes the private Google Drive live-sync slice: local pending
operations, retained deletion records, short-lived credential recovery and checks every 20 seconds
while Laters is visible. Its first interface follow-up moves the unchanged sync card and Privacy link
into a permanent top-right menu drawer. The drawer and its three-state indicator are deployed; a
focused correction for desktop page stability and focus outlines is deployed and accepted. Android
drawer and multi-device add/delete/Undo acceptance are complete. The selected post-release follow-up
adds automatic housekeeping after 100 Drive operations and is deployed in `b3f4fcf`; its ordinary
phone/desktop add/delete round trip is accepted and the work is packaged as `v0.5.1`. Public OAuth
remains explicitly open.

## Active slice

The selected interface follow-up adds a permanent circular top-right menu trigger and an Ionic bottom
drawer. The existing sync card and footer disclosure move into it unchanged, keeping those controls
reachable without traversing the article list. Backdrop, Escape, swipe-down and a visible close
control dismiss the sheet with focus returned to the trigger. The trigger itself now reports broad
Drive state: pale green for a successful latest check, white while connecting/checking/sending, and
pale red when disconnected, offline, expired or failed. Its accessible name carries the same state.
No sync data or authorization behaviour changes in this interface slice.

The accepted private live-sync candidate builds on the published Drive snapshot proof without a
Laters backend. IndexedDB version 2 records each add, update, restore and deletion atomically with a
pending operation. Drive stores immutable hidden operation files; connected devices replay them over
the accepted base snapshot so additions combine and deletion records remain effective. Confirmed
local operations are cleared after upload. The post-release housekeeping follow-up folds 100 remote
operations into a version-2 checkpoint containing the resolved list and exact covered identifiers,
then waits for a later check to adopt the settled checkpoint before deleting only those files. Active
devices read the latest checkpoint before upload; interrupted deletion is ignored safely and retried
without blocking normal sync. A Google token is kept locally only until its reported expiry with a safety
margin, and visible installations poll every 20 seconds plus open, focus and online events. OAuth
remains in Testing with only the maintainer admitted. Release `v0.5.0` packages this accepted private
candidate without authorising public OAuth access.

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
the exact URL is captured again; sharing remains URL-only. Commit `b5d663f` published this candidate;
96 automated tests across 17 files and every local release gate passed, a 320px browser check passed
without errors, GitHub Actions run `32636593819` passed and deployed, and the public origin served
the matching verified JavaScript and CSS assets.

The maintainer confirmed on 2026-08-23 that the production mobile `v0.4.1` title editor works
perfectly, closing its physical acceptance gate. The accepted `v0.4.2` follow-up adds one circular,
desktop-only three-dot **More actions** button beside Delete, reusing the existing action sheet and
retaining right-click and `Shift+F10`. At the 48rem desktop breakpoint the existing 34rem shell may
grow fluidly to a 42rem maximum. Mobile presentation and interactions remain unchanged; this is not
a general desktop redesign. Commit `2639185` published this candidate; all local release gates and
desktop/mobile browser checks passed, GitHub Actions run `32637456916` passed and deployed, and the
public origin served the matching verified assets. A production browser applied the update without
losing its two saved articles and confirmed the new proportions, menu route, focus restoration and
error-free console.

The maintainer accepted the final production presentation on 2026-08-23 and authorised release
hardening, the consolidated `v0.4.2` tag and a GitHub release. Full and production-only dependency
audits reported zero known vulnerabilities. Release `v0.4.2` intentionally includes all accepted
work since `v0.3.0`; no `v0.4.0` or `v0.4.1` tag or release was created.

## Blockers

None.

## Uncertainties

- A minimum Chrome for Android version is not yet evidenced.
- Android's news feed may provide distinct rotating or tracking URLs for the same apparent article; exact-URL deduplication correctly retains these as separate items.
- Some Android news-feed shares do not supply a useful article title. Remote title enrichment is a possible later product slice with privacy, security and reliability implications; it is not part of the current design handoff.
- The 100-operation housekeeping threshold and interruption path are covered by deterministic
  automation rather than manually manufacturing 100 changes or a forced Drive failure.

## Next safe action

Review the remaining roadmap and choose the next bounded slice. Moving Google OAuth from Testing to
public production access remains a separate explicit decision.

## Last meaningful update

2026-08-23 — `v0.5.0` was published as the latest GitHub release from exact deployed commit
`8af5fca` after Pages workflow `32661778183` passed. The remote lightweight tag resolves to that
commit. The private Google Drive sync release includes the live-sync model, top-right drawer,
three-state indicator, privacy policy and security audits while preserving the Testing-only OAuth,
visible-app polling and retained-operation boundaries.
Post-release, the maintainer confirmed the Android drawer and the cross-platform add, delete and Undo
sequence are working, closing both remaining human acceptance gates. Failure-path evidence for token
expiry, rejected credentials and retained failed uploads remains automated.

Automatic Drive housekeeping at 100 operation files is published in commit `b3f4fcf` through GitHub
Actions run `32667577633`. It writes the resolved version-2 checkpoint with exact covered operation
identifiers, waits for a later check to adopt that settled checkpoint before deletion, lets active
devices refresh before uploading, and safely retries interrupted cleanup. All 129 tests and local
release/privacy/security gates passed; the public origin serves matching asset
`index-D329XvN-.js`.

On 2026-08-23 the maintainer updated both phone and desktop installations, added an article on one,
observed it on the other, deleted it there and watched the deletion synchronize back. This closes
the final physical acceptance check for automatic Drive housekeeping.

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
- [`v0.4.2` release record](../docs/releases/v0.4.2.md)
- [`v0.5.0` release record](../docs/releases/v0.5.0.md)
- [`v0.5.1` release record](../docs/releases/v0.5.1.md)
- [Desktop actions and responsive-width plan](../docs/planning/desktop-actions-responsive-plan.md)
- [MVP 2.0 Slice 3 whole-row opening plan](../docs/planning/mvp-2-slice-3-whole-row-opening-plan.md)
- [Mobile interaction shell plan](../docs/planning/mobile-interaction-shell-plan.md)
- [Paste-to-add plan](../docs/planning/paste-to-add-plan.md)
- [Edit-title plan](../docs/planning/edit-title-plan.md)
- [Google Drive live-sync plan](../docs/planning/google-drive-live-sync-plan.md)
- [Application menu drawer plan](../docs/planning/application-menu-drawer-plan.md)
- [`v0.2.0` release record](../docs/releases/v0.2.0.md)
- [`v0.3.0` release record](../docs/releases/v0.3.0.md)
- Published GitHub releases: `v0.1.0`, `v0.2.0`, `v0.3.0`, `v0.4.2`, `v0.5.0`, `v0.5.1`.
