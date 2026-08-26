# Product intent

## Purpose

Provide an extremely simple personal read-later app that accepts shared article links on Android and keeps them available locally for later reading.

## Audience and value

The initial audience is one person using an Android phone. The app removes the overhead of a bookmarking or knowledge-management system: share an article to Laters, then open a short newest-first list and continue to the original page.

The core job is intentionally narrow: capture a link at the moment it is discovered without interrupting the current activity, then make that small queue easy to consume or clear later. Success is fewer interesting articles being lost without creating a second organisational system to maintain.

## Principles

- Keep the experience fast, minimal and focused on saving, opening and deleting links.
- Work as an installable PWA with Android Web Share Target support.
- Store saved items locally in IndexedDB and request persistent browser storage where supported.
- Keep storage access behind a small, explicit abstraction so a future storage mechanism can be introduced without coupling it to presentation code.
- Make the local-only retention model honest: browser storage can be cleared or evicted and the MVP offers no backup.
- Keep the application shell usable offline while treating original articles as external network destinations.
- Preserve accessibility, maintainability and proportionate resilience despite the deliberately small scope.
- Reach a useful personal MVP before considering expansion.

## Initial-MVP non-goals

- A Laters-operated backend, database or account service.
- Authentication, accounts or multi-user support.
- Tags, folders or archive workflows.
- AI features, article summarisation or knowledge-management features.
- Saving or rendering full article content.
- Analytics, advertising or transmitting the reading list to third parties.
- Import, export and backup in the initial release.
- A public multi-user product in the initial release.

## Assumptions and uncertainties

- Accepted: this is a rapid personal MVP focused on Android.
- Accepted: each item needs the original URL, a useful title, its saved time and a delete action.
- Accepted: the list is ordered newest first and opening an item navigates to the original URL.
- Accepted: saved-item data remains on the device and IndexedDB is its initial source of truth.
- Accepted: Web Share Target input is untrusted and only valid HTTP or HTTPS article URLs may be saved.
- Accepted: the app shell may work offline, but Laters does not make external articles available offline.
- Accepted: the initial browser target is the current stable Chrome for Android; the minimum version remains evidence-led.
- Accepted: shared titles fall back to useful surrounding text and then the hostname without fetching page metadata.
- Accepted: successful shares open the full reading list with an accessible status message.
- Accepted: sharing an existing URL refreshes the existing item, updates its useful title and moves it to the top rather than creating a duplicate.
- Accepted: deletion is immediate and offers a brief accessible undo action rather than requiring confirmation.
- Accepted: relative saved times update when the list is rendered and when the app returns to the foreground; continuous timers are unnecessary.
- Accepted: the MVP uses the maintainer-approved white/ink/lime design, self-hosted Bricolage Grotesque typeface and supplied icon family.
- Accepted: the personal MVP targets the current stable Chrome for Android; device acceptance records the tested version without promising older releases.
- Accepted: production uses GitHub Pages at `https://laters.dustyb.in/`, with automated deployment of the generated public build only.
- Accepted: no sensitive data, repository memory, local paths, source maps or unintended third-party resources may enter the deployed build.
- Accepted: normal deployments must preserve saved articles in the same-origin IndexedDB database; application updates do not clear or replace reading-list data.
- Accepted: when a new service worker is ready, Laters offers an accessible user-controlled update action rather than silently leaving the running interface stale or reloading during an interaction.
- Accepted: duplicate identity is the exact normalised URL; Laters does not follow redirects or guess that distinct feed, tracking or rotating URLs represent the same article.

Detailed MVP behaviour, acceptance criteria and delivery slices live in `docs/mvp-definition.md`.

## Delivered post-MVP direction

- Accepted and delivered in `v0.2.0`: persistent per-item bookmarks, publisher favicons with a deterministic local fallback, and a non-conflicting whole-row pointer action while preserving the title as the semantic link.
- Accepted: bookmarks remain a state within the single newest-first queue; they do not add filtering, pinning, sorting, archive protection or another view.
- Accepted: favicon attempts go directly to the saved publisher's conventional icon URL, never through a central favicon service; ordinary failures use a stable hostname-derived fallback.
- Accepted and retained: a direct star button provides the accessible bookmark interaction; gestures must never be the only action route.
- Accepted: do not build a bespoke multi-slice native-style gesture shell and do not introduce a general framework unless it demonstrably reduces the total complexity of the required interactions.

## Delivered v0.3.0 direction

- Accepted and released: a pinned, selectively registered Ionic
  Core swipe-row and action-sheet shell, with no application-framework migration.
- Accepted interactions: right swipe routes to the existing Bookmark or Remove bookmark behaviour;
  left swipe routes to the existing Delete/Undo behaviour; touch long press opens Read, Bookmark or
  Remove bookmark, Delete and Cancel.
- Accepted boundary: the existing title link, Star and visible Delete controls remain available, and
  no action may require a gesture.
- Accepted personal-app exception after `v0.3.0`: **Share this article** may live only in the
  long-press/context menu. It opens the system share sheet with only the saved URL; the title is
  deliberately omitted because receiving apps may misinterpret it. Laters does not integrate with,
  select or observe NotebookLM or another destination.
- Accepted post-MVP desktop exception: the responsive browser page retains the same white, ink and
  lime identity as the installed PWA and may show a right-aligned **Install** action beside the
  wordmark only when the browser reports that this installation is available. The action invokes
  the browser's native PWA installation prompt; it is not a separate desktop application flow.

## Accepted v0.4.0 direction

- Add one persistent **Paste a link** row at the top of the saved-article list as a second deliberate
  capture path.
- Read clipboard text only after the user activates that control. If clipboard reading is unavailable,
  denied, empty or contains no valid HTTP(S) URL, open an inline labelled URL field with **Add**.
- Treat a bare domain or article address as HTTPS. Canonicalise every new capture through the same
  URL boundary; reject non-HTTP(S) schemes, credentials, malformed escapes, control characters,
  embedded whitespace and excessive length rather than trying to repair unsafe input.
- Reuse the current validation, hostname-title fallback, exact-URL refresh, bookmark preservation,
  newest-first ordering, source marker and IndexedDB contracts.
- Keep the existing screen, item count, article presentation and local-storage disclosure unchanged.
  Reading time, remote title enrichment, bulk intake and other surrounding mockup content remain out
  of scope.

## Accepted v0.4.1 direction

- Add **Edit title** immediately after **Read now** in the existing long-press/context menu.
- Present one labelled title field using the existing white, ink and lime visual language. The saved
  URL is immutable and no existing page or row layout changes.
- Persist the trimmed title locally without changing the URL, saved time, queue position or bookmark
  state. Empty values are rejected and the existing 240-character title limit remains.
- Mark a deliberate title edit so an exact-URL re-capture refreshes the saved time without replacing
  the remembered title. Sharing remains URL-only.

## Accepted v0.4.2 direction

- Add a permanently visible, circular three-dot **More actions** control beside visible Delete on
  desktop mouse/trackpad layouts. It opens the existing article action sheet; right-click and
  `Shift+F10` remain available.
- Give the control an article-specific accessible name, visible keyboard focus and focus restoration
  after menu dismissal. It updates when a title is edited and is not shown on the mobile layout.
- Let the existing 34rem content shell grow fluidly to a modest 42rem maximum from the desktop
  breakpoint. Preserve all mobile dimensions, gestures, data behaviour and the established visual
  language; this is responsiveness rather than a desktop redesign.
- Release closure: the maintainer accepted the final production mobile and desktop behaviour and
  authorised the consolidated `v0.4.2` tag and GitHub release. `v0.4.0` and `v0.4.1` remain candidate
  version numbers within this line rather than separate historical releases.

## Accepted private Google Drive direction

- Local IndexedDB remains fully usable without Google Drive. Laters has no backend, account database
  or refresh-token service.
- Optional sync uses only Google's narrow `drive.appdata` permission and hidden Laters-owned files.
- Each local add, edit, restore or deletion is saved atomically with a pending operation. Connected
  devices combine additions; a retained deletion record prevents an older device from reviving an
  article unless the user explicitly chooses Undo.
- Laters checks for Drive changes when opened, foregrounded or brought online and every 20 seconds
  while visible. It does not promise OS background execution after the app is closed.
- A short-lived Google access token remains only in page memory until Google's supplied expiry,
  with a safety margin. Reload, full close, disconnect, expiry or rejection discards it; local
  changes then wait for one deliberate resume action.
- OAuth is public and **In production** after the accepted `v0.5.6` gate. Google currently presents
  the verified `dustyb.in` domain rather than the unverified `Laters` brand.
- Automatic Drive housekeeping starts at 100 operation files. Laters must write the resolved list
  and exact covered operation identifiers, then wait for a later check to adopt that settled
  checkpoint before deleting only those files. Every active device must read the latest checkpoint
  before uploading; interrupted deletion must leave the list safe, allow normal sync to continue and
  retry later. No cleanup setting, device registry or account service is introduced.
- Accepted interface placement: a permanent top-right menu opens a bottom drawer containing the
  unchanged sync card and Privacy link. Its pale green, white and pale red backgrounds respectively
  mean connected, checking and disconnected, with the same state exposed in its accessible name.
- Accepted drawer presentation: modal scroll locking must not shift the centred page; pointer focus
  restoration must not leave a thick outline, while keyboard focus remains visibly indicated.
- Release closure: the maintainer authorised `v0.5.0` as the private Google Drive sync release with
  its Testing-only OAuth, visible-app polling, retained-operation and then-incomplete physical-
  acceptance boundaries stated explicitly. This does not authorise public OAuth access.
- Post-release acceptance: the maintainer confirmed the Android drawer and cross-platform add,
  delete and Undo sequence are working, closing the remaining human acceptance gates. Automated
  expiry, rejected-credential and failed-upload checks remain the evidence for those failure paths.

## Accepted public-readiness direction

- Keep public preparation in bounded `v0.5.x` slices before Export becomes `v0.6.0`.
- Harden the connection first: access tokens are memory-only, old stored tokens are removed, users
  can disconnect and attempt permission revocation in-app, and the static PWA gains a restrictive
  Content Security Policy.
- Publish Terms and acceptable-use wording before configuring a separate production Google project
  with conservative quota and cost safeguards.
- Keep the code-only `v0.5.4` hardening boundary: reject cross-site and oversized Share Target
  requests, prevent framing in application code, audit dependencies during deployment and keep
  automated dependency update proposals active without adding a proxy or changing hosting.
- Treat the production-project client transition as a data-preservation operation. Seed a
  potentially empty application-data area from one verified complete installation, confirm the
  exact list before connecting another device, and retain the testing project as rollback until
  acceptance passes.
- Inspect the new project's actual 2026 Drive quotas, alerts and billing state before use. Billing
  must remain disabled or unlinked unless a later explicit decision accepts a defined cost boundary.
- The production OAuth move passed those gates and its consent flow was accepted on desktop and
  Android on 2026-08-24. The exact scope remains non-sensitive `drive.appdata`.
- Make the README welcoming to non-technical users with privacy-safe screenshots before public
  promotion.
- Deliver Export as `v0.6.0`; consider Import next and dark mode after it. Neither later slice is
  authorised for implementation by this sequence alone.
- Accepted `v0.5.3` policy boundary: the hosted app states that it is a free, open-source personal
  project used at the user's own risk; users remain responsible for their devices, Google Account,
  saved links and acceptable use; data and third-party risks are allocated specifically rather than
  through a blanket waiver; and every legal right or responsibility that cannot be excluded remains.

## Accepted v0.6.0 Export direction

- Add **Download CSV** to the existing main application menu as an explicit user action available
  with or without Google Drive.
- Export the resolved local reading list as version-1 UTF-8 CSV with `url`, `title`, `created` and
  `tags` columns. Keep the rows newest first and use a sortable UTC filename.
- Preserve bookmark and deliberate-title state with `laters-bookmarked` and
  `laters-title-edited` tags. Protect untrusted titles that could be interpreted as spreadsheet
  formulas with a reversible `laters-protected-title` marker.
- Do not export local article identifiers, pending or remote operation identifiers, deletion
  history, checkpoint cleanup state, Google credentials, account data, connection state or other
  implementation bookkeeping.
- Start a conventional local browser download on every supported platform. Do not use the
  operating-system share chooser for whole-list export: its destinations do not reliably include a
  save location. Export itself performs no network or Drive request and does not mutate the list or
  sync queue.
- The CSV is useful as a spreadsheet and follows common link-import columns. A future Laters Import
  may consume it, but Import behaviour, merge rules and Drive reconciliation remain outside this
  release.

## Accepted v0.7.0 Import direction

- Add **Import CSV** beside **Download CSV** in the existing main application menu.
- Accept a local UTF-8 CSV of no more than 1,000 article rows or 10 MB. Require a case-insensitive
  `url` header; recognise optional `title`, `created` and `tags` columns in any order; report and
  ignore additional named columns and unsupported tags.
- Round-trip the `v0.6.0` Laters export exactly. Also accept simpler URL-only or URL-and-title CSVs,
  using the hostname for a missing title and import time in file order for a missing saved time.
- Validate the complete file and present new, existing, duplicate and ignored-data counts before
  confirmation. Invalid data blocks the whole file; picker or review cancellation creates no import
  changes, although a connected pre-review Drive refresh may apply existing remote changes.
- Merge add-only. Skip exact canonical URLs already on the device and repeated rows without
  overwriting existing article data. Generate fresh private identifiers for new articles.
- Commit accepted articles and normal pending add operations in one local transaction, then invoke
  the existing Drive sync once. Refresh Drive before duplicate review when connected; when a prior
  connection is currently disconnected, warn that duplicate checking covers only this device.
- Never upload the CSV or accept internal identifiers, operations, credentials, account details,
  connection state, deletion history or Drive bookkeeping. Do not add replace, overwrite, delete or
  rollback modes in this release.
- Release closure: the maintainer accepted the published file selection, review, add-only merge,
  preserved ordering, menu dismissal, version label and success presentation, then authorised the
  exact verified `v0.7.0` release.

## Accepted v0.8.0 dark-mode direction

- Add an **Appearance** radio group to the bottom of the existing main menu, after Google Drive and
  Import and Export, with **System**, **Light** and **Dark**. Experimental sync remains the first menu
  section. System is the default, follows the current operating-system preference and reacts while
  selected.
- Retain a manual override only in that browser. Do not sync, import or export it, and do not touch
  article storage or the Drive operation queue.
- Apply the supplied semantic dark token map across the app, Ionic overlays, Privacy and Terms while
  preserving layout, typography, motion, accessibility and every existing interaction contract.
- Update runtime browser theme colour and apply the effective theme before the shell becomes visible.
  Retain the static white manifest launch background as the explicit PWA compatibility boundary.
- Keep reading-time data from the illustrative handoff screenshot, theme sync, schedules, custom
  palettes, OLED variants, content fetching, new icons and unrelated product work outside `v0.8.0`.
- Require focused preference and interaction tests, complete existing tests, type checking, build,
  privacy and dependency audits, no-attribution checks and published macOS and Android acceptance.
- Release closure: the maintainer accepted the published theme and corrected menu hierarchy, then
  explicitly authorised the exact verified `v0.8.0` tag and GitHub release.

## Accepted `v1.0.0` closing direction

- Make a subtle Bookmark filter the final MVP product slice and intended `v1.0.0` release. Laters
  then moves to a complete, maintenance-focused state rather than assuming another feature roadmap.
- Keep articles visually dominant. Use one restrained **Show bookmarks** or **Show all** text action
  in the existing list-heading area; do not add tabs, a segmented control, toolbar, filter panel or
  another prominent interface section.
- Keep the complete newest-first queue as the default. The filtered view is transient presentation
  state, preserves saved order and adds no stored preference, article field, migration, Drive or CSV
  behaviour.
- Preserve Paste, capture and Import reveal behaviour, accessibility, Delete/Undo, swipe directions,
  bookmark actions, article menus and exact URL-only sharing.
- Grouping and tagging may be explored after `v1.0.0`, but they are not currently necessary,
  approved or versioned. Search, sorting, archive, automatic tidy rules and other future ideas remain
  outside the closing MVP slice.
- The detailed contract in `docs/planning/bookmark-filter-plan.md` is accepted and implemented as
  the published candidate. The maintainer accepted the installed Android and macOS result and
  authorised `v1.0.0` release closure.
- Release commit `565cd59` passed Pages workflow `32967914059`; the lightweight `v1.0.0` tag
  resolves exactly to that commit and `v1.0.0` is the latest public GitHub release. Laters now moves
  to maintenance rather than assuming another product slice.

Completed MVP 2.0 scope, acceptance evidence and delivery records live in
`docs/mvp-2-definition.md` and `docs/releases/v0.2.0.md`.
The accepted interaction architecture and implementation record live in
`docs/planning/mobile-interaction-shell-plan.md`; release closure is recorded in
`docs/releases/v0.3.0.md`. The post-v0.3 capture, sharing and desktop work is recorded in
`docs/releases/v0.4.2.md`. Private Google Drive sync and its application-menu interface are recorded
in `docs/releases/v0.5.0.md`.
