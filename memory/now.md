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
Release `v0.5.7` consolidates the accepted code, configuration and documentation delivered after
`v0.5.1`. Package metadata and the deployed application are `0.5.7`; the configuration-only public
OAuth gate is accepted as `v0.5.6`, and the documentation-only `v0.5.7` non-technical introduction
is published and maintainer-accepted. `v0.5.7` is the latest tagged GitHub release and resolves to
exact verified commit `3d4f980`.

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
- Accepted `v0.5.2` connection hardening with memory-only Google access tokens, deliberate resume,
  in-app disconnect and revocation, restrictive browser policies and no-referrer behaviour.
- Accepted `v0.5.3` public Terms and acceptable-use wording, alongside the existing privacy policy
  and public `hello@dustyb.in` support address.
- Accepted `v0.5.4` code-only security hardening covering the Share Target request boundary,
  bounded request bodies, code-level anti-framing, deployment-time dependency auditing, Dependabot
  and a public security-reporting policy.
- An accepted user-first `v0.5.7` README with concise opening, installation, capture, optional sync,
  everyday-use, disconnection and data-deletion guidance plus two privacy-safe sample screenshots.

## Active focus

`v0.5.7` is released. The next work is to define the bounded `v0.6.0` Export format, behaviour and
acceptance checks before implementation. No Export work has begun.

## Active slice

The next roadmap slice is `v0.6.0` Export. Its data format, precise behaviour and acceptance checks
must be agreed before implementation. No Export work has begun.

## Blockers

- No current implementation blocker.

## Uncertainties

- A minimum Chrome for Android version is not yet evidenced.
- Android's news feed may provide distinct rotating or tracking URLs for the same apparent article; exact-URL deduplication correctly retains these as separate items.
- Some Android news-feed shares do not supply a useful article title. Remote title enrichment is a possible later product slice with privacy, security and reliability implications; it is not part of the current design handoff.
- The 100-operation housekeeping threshold and interruption path are covered by deterministic
  automation rather than manually manufacturing 100 changes or a forced Drive failure.
- Whether Google treats the new production project as the same `appDataFolder` application identity
  is not documented precisely enough to assume; the controlled seed-device transition is the gate.
- Google currently shows `dustyb.in`, rather than `Laters`, on public consent. Its Verification
  Centre says branding is not shown, but the Branding page exposes no **Verify branding** action for
  the current no-logo, one-domain, non-sensitive configuration.

## Next safe action

Define and agree the bounded `v0.6.0` Export format, behaviour and acceptance checks before
implementation. Import remains explicitly outside that release.

## Last meaningful update

2026-08-24 — `v0.5.7` was published as the latest GitHub release from exact verified commit
`3d4f980` after GitHub Pages workflow `32785880312` passed. The remote lightweight tag resolves to
that commit. This consolidated release covers the accepted connection security, Terms, code-only
hardening, separate production Google project, public OAuth and non-technical introduction slices
delivered after `v0.5.1`. Package metadata is aligned to `0.5.7`; no new application behaviour,
Google permission, billing commitment or data migration was added during release preparation.

2026-08-24 — The documentation-only `v0.5.7` candidate reshaped the README around non-technical
opening, installation, capture, optional Google Drive sync, everyday controls, disconnection and
data deletion. Developer setup, architecture and security limitations remain available below the
user guidance. Two screenshots were created in an isolated local preview using only fictional
`example.com`, `example.org` and `example.net` articles; visual inspection found no personal
articles, accounts, email addresses, tokens or browser details. Application code, bundle version,
OAuth configuration, billing and data behaviour are unchanged. Commit `13c61ef` published the
candidate through successful GitHub Actions run `32783130212`. The maintainer subsequently approved
the rendered README and screenshots, closing `v0.5.7`.

2026-08-24 — `v0.5.6` public OAuth approval completed. Google verified `dustyb.in` ownership, saved
`hello@dustyb.in` as the public support and developer contact, and moved the External production
client to **In production** for any Google Account. Data-access verification is not required for the
sole non-sensitive `drive.appdata` scope. Fresh desktop consent showed the exact application-data
permission, retained all 18 items and returned Drive to up to date; the maintainer also accepted the
production connection on mobile. Google currently presents the app as `dustyb.in`, not `Laters`, and
offers no brand-verification action for the current configuration. Billing, quotas and the old
rollback project remain unchanged.

2026-08-24 — `v0.5.5` production project and safeguards was implemented, published in commit
`5e039da` through successful GitHub Actions run `32742790944`, and accepted on desktop and Android.
The desktop seed retained 17 items; Android contributed one newer distinct local item and both
settled at 18. A disposable desktop addition appeared on Android as item 19, and its deletion returned
both devices to 18 with an up-to-date Drive state. OAuth remains Testing-only, billing unlinked,
automatic quota increases off and the previous project unchanged as rollback.

2026-08-24 — The maintainer updated the published `v0.5.4` app, confirmed that normal Android Share
Target capture still saves an ordinary article correctly, and accepted the result. This closes the
physical-device gate for the cross-site request boundary and completes the code-only security slice.
The next bounded slice is `v0.5.5` production project and safeguards; OAuth remains in Testing.

2026-08-24 — A focused OWASP Top 10:2025 review identified two bounded code-level opportunities and
two repository-process gaps. The `v0.5.4` candidate rejects website-generated cross-site and
oversized Android Share Target submissions, adds a code-level anti-framing guard, runs dependency
auditing during deployment, configures automated npm and GitHub Actions update proposals, and
publishes a security-reporting policy. GitHub Pages cannot provide project-defined HSTS,
`X-Content-Type-Options`, `Permissions-Policy` or header-level `frame-ancestors`; changing host or
adding a proxy remains explicitly outside the project boundary. Production-project, public OAuth
and non-technical README slices move to `v0.5.5`, `v0.5.6` and `v0.5.7`; Export remains `v0.6.0`.

2026-08-24 — The accepted `v0.5.3` policy slice adds public Terms and acceptable-use rules for the
hosted app, while distinguishing separately licensed source code. Both public policies state plainly
that the maintainer cannot see a user's reading list; optional sync stores it only in that user's private
Google Drive application data. Users are responsible for their devices, Google Account, saved links,
backups and acceptable use; loss and disclosure risks are allocated to the user, third parties or
the maintainer according to cause rather than an absolute waiver; and non-excludable consumer,
reasonable-care, negligence and fraud protections remain. Terms are linked from the app drawer,
privacy policy and README. OAuth and application behaviour are unchanged. The maintainer confirmed
that the published wording reads well.

2026-08-24 — The maintainer completed the published `v0.5.2` desktop/Android check and reported that
the connection-security behaviour appears good. This closes physical acceptance for memory-only
tokens, deliberate resume and in-app disconnect/revocation. No `v0.5.2` tag or GitHub release has
been created. The next bounded slice is `v0.5.3` Terms and acceptable use.

2026-08-23 — The bounded `v0.5.2` connection-security candidate is implemented. Google access tokens
now remain only in page memory; startup removes the earlier local-storage credential record;
**Disconnect** immediately stops the live session and asks Google to revoke the active permission;
and app and privacy pages carry restrictive Content Security Policies plus no-referrer rules. The
README, privacy policy and Google Drive planning record describe the new resume and deletion
boundaries. All 131 tests, type checking, production build, repository privacy audit, public-build
audit and both dependency audits pass. A local real-page check found no browser policy warnings and
confirmed the disconnected drawer and privacy page presentation. Published desktop/Android
acceptance subsequently passed on 2026-08-24.

2026-08-23 — The maintainer accepted a bounded public-readiness roadmap beginning with connection
security and Terms before production-project, public OAuth, non-technical README and `v0.6.0`
Export. The later insertion of code-only security hardening renumbered the remaining `v0.5.x`
slices without changing that order. Import and dark mode follow but remain undefined. The
authoritative sequence and exclusions are in `docs/roadmap.md`.

2026-08-23 — `v0.5.1` was published as the latest GitHub release from exact deployed commit
`83928cc` after Pages workflow `32668321345` passed. The remote lightweight tag resolves to that
commit. This backward-compatible maintenance release adds automatic 100-operation Drive
housekeeping while preserving Testing-only OAuth, visible-app polling and local-only operation.

Release `v0.5.0` remains the private Google Drive live-sync feature baseline: local pending
operations, the top-right drawer, three-state indicator, privacy policy and security audits.
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
- [Accepted roadmap](../docs/roadmap.md)
- [`v0.5.5` new-task handoff](../docs/handoffs/v0.5.5-start.md)
- [Deployment](../docs/deployment.md)
- [Claude Design handoff](../docs/claude-design-handoff.md)
- [Slice 6 implementation plan](../docs/planning/slice-6-mvp-design-implementation-plan.md)
- [MVP 2.0 Slice 1 bookmark plan](../docs/planning/mvp-2-slice-1-bookmarks-plan.md)
- [MVP 2.0 Slice 2 source marker plan](../docs/planning/mvp-2-slice-2-source-markers-plan.md)
- [`v0.4.2` release record](../docs/releases/v0.4.2.md)
- [`v0.5.0` release record](../docs/releases/v0.5.0.md)
- [`v0.5.1` release record](../docs/releases/v0.5.1.md)
- [`v0.5.7` release record](../docs/releases/v0.5.7.md)
- [Google Drive connection security plan](../docs/planning/google-drive-connection-security-plan.md)
- [Code security hardening plan](../docs/planning/code-security-hardening-plan.md)
- [Desktop actions and responsive-width plan](../docs/planning/desktop-actions-responsive-plan.md)
- [MVP 2.0 Slice 3 whole-row opening plan](../docs/planning/mvp-2-slice-3-whole-row-opening-plan.md)
- [Mobile interaction shell plan](../docs/planning/mobile-interaction-shell-plan.md)
- [Paste-to-add plan](../docs/planning/paste-to-add-plan.md)
- [Edit-title plan](../docs/planning/edit-title-plan.md)
- [Google Drive live-sync plan](../docs/planning/google-drive-live-sync-plan.md)
- [Application menu drawer plan](../docs/planning/application-menu-drawer-plan.md)
- [`v0.2.0` release record](../docs/releases/v0.2.0.md)
- [`v0.3.0` release record](../docs/releases/v0.3.0.md)
- Published GitHub releases: `v0.1.0`, `v0.2.0`, `v0.3.0`, `v0.4.2`, `v0.5.0`, `v0.5.1`, `v0.5.7`.
