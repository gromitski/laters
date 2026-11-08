# Current project truth

## Purpose

Track the current state and next safe action for the Laters free, local-first read-later product.

## Lifecycle

The original personal MVP and all three MVP 2.0 slices are implemented, published and accepted at
`https://laters.dustyb.in/`. Release `v0.1.0` records the first-MVP baseline; `v0.2.0` records the
completed bookmark, source-marker and whole-row-opening release; and `v0.3.0` records the accepted
mobile interaction shell. Release `v0.4.2` consolidates the accepted sharing, desktop-install,
paste-to-add, title-edit and desktop-responsiveness work delivered after `v0.3.0`. Release `v0.5.0`
records private Google Drive live sync, and `v0.5.1` records its automatic housekeeping follow-up.
Release `v0.5.7` consolidates the accepted code, configuration and documentation delivered after
`v0.5.1`. Release `v0.6.0` records the accepted portable CSV Export, release `v0.7.0` records the
accepted reviewed CSV Import, and release `v0.8.0` records the accepted System, Light and Dark
appearance. Release `v1.0.0` records the accepted subtle Bookmark filter that completes the intended
personal reading queue. Release `v1.1.0` adds optional CSV-supplied reading-time estimates. Package
metadata is now `1.6.3` for the authorised product sync-usability correction, retaining the add-link pairing,
diagnostics and progress-label maintenance work. `v1.1.0` remains the latest tagged
GitHub release; its tag resolves to verified release commit `1e95804`.

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
- An accepted `v0.6.0` Export implementation in the main menu that creates a versioned CSV of local
  article URLs, titles, saved times, bookmark state and deliberate-title state without exposing
  credentials, connection data, internal identifiers or sync operations.
- A released `v0.7.0` Import beside Export that validates and reviews a local named-column CSV,
  atomically adds only new canonical URLs and queues ordinary Drive additions without uploading the
  selected file.
- An accepted and published `v0.8.0` dark-mode implementation with System, Light and Dark choices in
  the main menu, a local-only override, pre-paint theme application, runtime theme metadata and
  matching application, overlay, Privacy and Terms presentation.
- A released `v1.0.0` with one subtle **Show bookmarks** or **Show all** action in the existing
  list-heading row. The transient filtered view preserves newest-first order and adds no stored,
  synced, imported or exported state.
- A released `v1.1.0` that recognises optional positive whole-minute
  `readtime` CSV values, preserves them through IndexedDB, private Drive sync and version-2 Export,
  and quietly displays **≈ N min read** beside a compact saved age without changing rows whose
  estimate is unknown.
- A published maintenance correction that downloads existing Google Drive operation records in
  deterministic batches of no more than four instead of waiting for every small record in turn.
  A failed batch leaves local pending changes untouched and is retried in full; Drive formats,
  housekeeping thresholds and application behaviour are unchanged.

## Active focus

Candidate **1.6.3** implements the maintainer's explicit 2026-11-08 approval after reassessment:
remove Switch account; Connect only while disconnected; Disconnect only with a live connection;
Disconnect stops local sync without revoking Google permission; all account lists and queues remain
entirely separate. Menu section **Sync** replaces experimental wording. In-flight cancellation,
expiry, offline and same-profile window transitions follow the
[product interaction contract](../docs/planning/google-account-switching-plan.md).
Usability is EVERYTHING for this free product: the maintainer's reputation depends on it. This is
now a durable working agreement, including full-journey verification before delivery. Implementation
passes 288 tests/37 files, build and privacy/attribution gates. Isolated browser checks cover
account/queue separation, request cancellation, same-profile windows, stale callbacks, offline,
expiry, rejection, retry and reopen. Published from `ea3e837` through successful Pages run
`42474639900`; seven public assets match the build. Normal Update 1.6.2 → 1.6.3 retained the existing
fictional article and showed Version 1.6.3. Owner usability/real-account/Android acceptance remains.
No new provider, scope, credential persistence, backend or billing.
Older 1.6.0–1.6.2 delivery evidence and rejected controls are preserved in
[historical evidence](../evidence/delivery/google-drive-usability-1.6.0-1.6.2.md), not current instructions.

Search matching, the Shared tool space layout and the final 500ms panel animation are accepted
by the maintainer as of 2026-11-05. The maintainer describes half a second as visually quick but
noticeable. Candidate `1.3.0` is published; `v1.1.0` remains the latest tagged release. The
[Search plan](../docs/planning/article-search-plan.md) is the authoritative interface contract and
publication/acceptance record. Earlier always-visible and disclosure-only Search layouts are
superseded; do not restore them or treat their rejected visual reviews as pending work.

[Article views and publisher organisation](../docs/planning/publisher-organisation-plan.md)
are now candidate **1.5.0**. The maintainer accepted the styled picker, tight right-aligned label,
checked menu and 500ms list fade/movement, then authorised **Oldest → Newest** alongside
**Newest → Oldest** (the load default) and **Publisher groups**. Flat chronological order is
transient and composes with Search/Bookmarks/Undo; groups stay A–Z with newest-first rows.
The accepted Add link/Search space and 500ms panel motion remain. No storage/CSV/Drive changes.
Oldest-first implementation passes 272 tests/35 files, type/build, privacy/attribution and
dependency gates. Isolated checks cover ascending order, filtering, Undo, unchanged grouping,
three-option keyboard/320px layout, reload default and visible Version 1.5.0. Implementation `7aea0f8` passed
Pages workflow `42113481269`; exact public assets/service worker and normal Update were verified.
The live footer shows Version 1.5.0, all three choices work and reload returns to the default.
Maintainer oldest-first/device acceptance remains. Earlier `1.4.0` receipts and remaining checks are in the plan.

The owner explicitly requests advancing application versions. Search moved to `1.3.0`, grouping
to `1.4.0`, and its polish stayed at `1.4.0`; this new feature moves to `1.5.0`. Working agreements
now require a version increment per delivered app-code slice (minor features, patch fixes/polish),
aligned package/lockfile and visible footer verification. Docs-only receipts need no bump.
`v1.1.0` remains the latest tagged release; no new tag/release authority is implied.
Optional images remain low priority; tags, folders, archive, manual filing and reading-time sorting
are outside the delivered article-view work. Flat publisher sorting was not selected.

The real-chat Chrome triage handoff is verified. Automatic Chrome routing from the desktop chat
remains unresolved; the maintainer chose to leave the setup as it is. Further routing work is
deferred unless reopened. Phone routing/pairing remains unverified. Failure retains accepted
selections in the sending workflow until saving is confirmed; use the original chat link for a
retry, since the receiver clears its fragment. Details and evidence belong in the
[add-link plan](../docs/planning/add-links-plan.md#real-chat-desktop-handoff-verified).

Preserve local-first storage, add-only imports and memory-only Google credentials. The separate
connection investigation remains open: desktop/Android reconnection after 15–20 minutes is
reported, but its cause is unknown. Search and UI acceptance do not resolve that investigation.

## Retained Search baseline — accepted interface, published

- Visible icon-and-label **Add link** and **Search** controls share one panel above the list.
  Add link is the load default; Search replaces Paste. The article heading/count directly label
  the saved rows; **Bookmarks** is an independent list filter.
- Both panels crossfade with 4px movement over **500ms** in a stable 52px grid slot. Button timing
  is retained. Inactive panels become inert/aria-hidden immediately; focus and typing do not wait
  for motion. Reduced-motion settings remove the transitions. Manual drafts, query clearing,
  Bookmark composition, capture/import reveal and Delete/Undo are preserved.
- Latest implementation `bc5cc0e` passed
  [Pages workflow `42094753747`](https://github.com/gromitski/laters/actions/runs/42094753747).
  All 262 tests across 34 files, type/build, public-build/repository privacy, attribution and
  dependency gates passed. The last audit reports zero production findings and 3 low/7 moderate
  development findings; no dependency change was part of the timing refinement.
- The published stylesheet exactly matches the checked build. The normal Update path retained
  the isolated browser's fictional article; live computed fade/movement durations are 0.5s and
  outgoing visibility waits 0.5s. Earlier checks cover intermediate opacity, rapid switching,
  exclusive accessible controls, drafts, Undo/focus and desktop/320px Light/Dark layout.
- Maintainer acceptance covers matching, layout, subtle buttons and final panel timing. It does
  not establish a completed physical Android/desktop scenario matrix, live Drive/offline device
  checks or a new release. Remaining checks are listed below. No tag/release was authorised.

### Published add-link candidate

The `v1.2.1` candidate extends collapsed **Add from a chat** under Import and export. Users enable a
private revocable add-only code for their browser and copy generic instructions into a trusted
private chat once. Opening a correctly encoded authorised link saves only new validated URLs with
no second review. **Copy code for another device** and **Use code from another device** deliberately
pair phone and desktop to use one triage chat. Pairing replaces the local code without changing
articles or Google credentials. Disabling here leaves other paired browsers enabled; revoke on
each device when necessary. Codes are not Google credentials and stay outside repository content,
logs, Drive sync, CSV and diagnostics. Disabled, revoked, malformed and oversized links
make no changes. Ordinary CSV review and the existing Google connection behaviour remain.
The public contract is in `docs/add-link-format.md` and the bounded plan in
`docs/planning/add-links-plan.md`. Automated and isolated-browser verification is recorded below;
`v1.2.1` candidate commit `7e924c5` passed Pages workflow `37984824896`; live HTML and application
assets match the verified build. The configured Chrome real-chat route is verified as described
in the add-link plan; phone checks remain unverified and further routing work is deferred. No tag or release is authorised.

### Retained progress-label maintenance

The `v1.1.2` maintenance candidate changes the Google Drive button to **Reconnecting…** during
an attempt or automatic Drive check for an existing connection, then restores its idle action when
the check completes or fails. First-time connection still says **Connecting…** and the explicit
Disconnect flow keeps its existing presentation. At that candidate stage the menu footer showed **Version 1.1.2**; the current footer is **Version 1.3.0**.
The maintainer reported the diagnostics working and requested this small progress-label correction;
the root cause of the original background interruption is still unconfirmed. No Google permission,
credential, storage, sync or retry behaviour changes. All 225 tests, type checking, production
build, service-worker generation, privacy audits and dependency audits pass with zero reported
vulnerabilities. Publication follows the normal Pages workflow; device acceptance of the new
progress wording remains.

### Connection diagnostics baseline

The published `v1.1.1` candidate adds collapsed **Connection details** in the Google Drive menu card and
showed **Version 1.1.1** in the menu footer at that stage. The current footer is **Version 1.3.0**. It keeps at most eight local tab-session
events through reloads, plus the last supplied access lifetime and planned expiry. It distinguishes
new/reloaded/discarded pages, background returns, planned expiry, Google request rejection and
interruption. HTTP status and allowlisted Drive error reasons are recorded without credentials,
account details, article content or free-text Google errors. Diagnostics never change the Google
permission flow, token persistence, retry policy, reading-list storage, sync format or CSV contract.
All 225 tests across 32 files, type checking, production build, service-worker generation and
public-build audit pass. Both dependency audits report zero vulnerabilities after compatible fixes
for existing indirect build dependencies: brace-expansion, source-map-js and fast-uri. Browser
checks confirm the footer version, persisted reload evidence, keyboard-native disclosure and
no horizontal overflow at 320px in Light and Dark appearances. Candidate commit `97bc3b0`
passed Pages workflow `37831620980`; live HTML, JavaScript and CSS match the verified build.
The offered update was applied in the production browser, which then displayed **Version 1.1.1**,
the diagnostics panel and reload evidence without warnings or errors. Maintainer observation of
the 15–20 minute interruption on both devices remains.

### Accepted release baseline

The released `v1.1.0` slice recognises optional positive whole-minute `readtime` CSV values,
retains files and articles without them, and preserves supplied estimates through local storage,
private Drive sync and version-2 Export. Recent saved ages use compact **Nmins old** or **Nhrs old**
wording, and rows with an estimate append **≈ N min read**. No automatic estimation, publisher
fetch, editing, sorting or totals are added. All 215
tests across 30 files, type checking, production build, service-worker generation, privacy audits,
both dependency audits with zero vulnerabilities and no-attribution checks pass. Local rendered
checks at 320px, desktop width and in Dark appearance show no horizontal overflow and confirm that
unknown estimates leave the old row presentation unchanged. Candidate commit `537d765` passed Pages
workflow `33204432044`; the live visible update path applied and then reported **Version 1.1.0**
without browser warnings or errors. Release commit `1e95804` passed Pages workflow `33206076911`;
the remote lightweight tag resolves exactly to it and the GitHub release is published as Latest.

## Blockers

- No current implementation blocker.

## Uncertainties

- A minimum Chrome for Android version is not yet evidenced.
- The published four-at-a-time operation download reduced the observed Google Drive reconnect time,
  but one maintainer check still felt closer to 30 seconds. The exact split between Google's
  permission flow and Laters' Drive work remains unmeasured.
- Android's news feed may provide distinct rotating or tracking URLs for the same apparent article; exact-URL deduplication correctly retains these as separate items.
- Some Android news-feed shares do not supply a useful article title. Remote title enrichment is a possible later product slice with privacy, security and reliability implications; it is not part of the current design handoff.
- The 100-operation housekeeping threshold and interruption path are covered by deterministic
  automation rather than manually manufacturing 100 changes or a forced Drive failure.
- General cross-project `appDataFolder` identity must not be assumed. The controlled production
  client transition is already accepted; it is not an outstanding gate. Evidence is in the
  [production project plan](../docs/planning/google-drive-production-project-plan.md).
- At the last recorded consent check, Google showed `dustyb.in`, rather than `Laters`. Its Verification
  Centre says branding is not shown, but the Branding page exposes no **Verify branding** action for
  the current no-logo, one-domain, non-sensitive configuration.
- At the last recorded check, GitHub had not displayed the repository Sponsor button even though Sponsorships was enabled and
  `.github/FUNDING.yml` contains the same valid Buy Me a Coffee entry as working repositories. This
  is a GitHub indexing or repository-administration issue, not unfinished application work.

## Next safe action

Published 1.6.3 passes technical, isolated-browser and normal Update verification. Obtain short
owner/real-account acceptance: Connect → Sync now → Disconnect → Connect another account → return to the first.
Only that account's list should appear; no extra linking decisions, premature Disconnect or
experimental copy. Physical Android share checks remain owner checks, not automated acceptance.

Obtain maintainer oldest-first/device acceptance of published `1.5.0`: apply Update, confirm
Version 1.5.0, try Oldest → Newest with Search/Bookmarks and Undo, then reload to confirm the
Newest → Oldest default. Technical checks, exact live assets and the normal Update path pass. Maintainer acceptance of the preceding
menu/layout/motion is already recorded; oldest-first and physical-device scenarios remain separate.
Do not re-open grouping versus flat publisher sorting or persist the temporary view selection.
Keep the accepted 500ms transitions and all existing article/data behaviour.

Leave triage routing/setup as requested. If the maintainer reopens it, preserve accepted selections
until saving is confirmed, retry with the original chat link in the configured browser, and keep
private codes/payloads out of repository material. Adding locally does not establish Drive sync.
Do not resume browser-forcing experiments, pair another browser or change defaults unasked.

For the separate connection issue, collect the existing **Connection details** after the usual
background interval before proposing behaviour changes. Distinguish a restarted page, expired
access lifetime and rejected requests. No backend or credential-persistence change is approved.

## Last meaningful update

2026-11-08 — The maintainer approved the simplified local-only Disconnect/account model and
made product usability a permanent top-level requirement. Version 1.6.3 implements it and is
published from `ea3e837` after successful Pages run `42474639900`. All 288 tests/37 files and the
required gates pass. Browser tests covered account/queue isolation, offline/retry/expiry/rejection,
in-flight cancellation, same-profile windows and ignored late callbacks. Seven public assets match
the build; normal Update from 1.6.2 retained the existing fictional article and showed Version 1.6.3.
Owner usability/real-account/Android acceptance remains. Older dated entries below are historical and do not override the
current interaction contract.


2026-11-07 — Corrected the long-standing connection/sync wording as `1.6.2`: connected Sync now
runs data sync with the current session, active sync says Syncing…, and Connect/Resume describe
permission work only. Retry sync preserves valid credentials; expired/rejected permission restores
Resume. Published from `fee259f` with successful Pages run `42415939411`; normal Update retained
the isolated article and showed Version 1.6.2. Technical/browser checks pass; owner acceptance remains.


2026-11-07 — The maintainer rejected the `1.6.0` adoption interface and a proposed replacement
confirmation, then explicitly selected entirely separate account lists. The `1.6.1` correction
removes adoption/linking and device-only mode controls, always gives each new account its own
store, retains existing associations and preserves unassigned data as a local recovery backup.
Published from `c156989` with successful Pages run `42414882856`; normal Update to 1.6.1 retained
the isolated existing article. Technical verification passes; real-account/device acceptance remains.


2026-11-07 — Implemented the authorised `1.6.0` Google account separation and paused Disconnect
candidate. The plan records the maintainer's independent second-account sync/reopen evidence,
local registry/list isolation, deliberate legacy adoption, technical verification and publication
from `8dd4c28`/Pages `42413892504`. Normal Update retained the isolated existing article and showed
Version 1.6.0; real-account/device acceptance remains. No new provider, Google scope, backend or token
persistence was introduced.


2026-11-05 — The maintainer accepted the polished picker/list animation and authorised oldest-first
chronological order. Candidate 1.5.0 adds Oldest → Newest, relabels the default Newest → Oldest and
retains Publisher groups. Documented version progression and a per-app-code-slice bump rule;
package/lockfile now agree on 1.5.0. All 272 tests/35 files and type/build/privacy/attribution/dependency gates pass. Isolated UI checks
verified oldest-first/filter/Undo/grouping/default and visible Version 1.5.0. Commit `7aea0f8`
passed Pages `42113481269`; live assets/service worker match and normal Update retained the
isolated article. Three choices, reload default and Version 1.5.0 were verified publicly. No tag/release.

2026-11-05 — Authorised the Article view picker polish and 500ms Newest first/Publisher groups
transition. Implemented a right-aligned label/tight chevron, styled accessible native-popover menu
and list-only snapshot fade/movement, with interruption handling and reduced motion. Kept `1.4.0`
and all feature/data contracts. All 270 tests/35 files, type/build, privacy/attribution and dependency gates pass. Isolated
browser checks include actual intermediate fade frames on a 105-article fictional library,
rapid changes, quick Undo, menu keys/dismissal and 320px Light/Dark layouts. Publication
verification passed: `6459048` / Pages `42112112847`, exact assets/service worker and normal
Update retained the isolated article. Live 0.5s fade frames and 6px gap were checked; reload
returns to Newest first. Maintainer motion/polish/device acceptance remains.

2026-11-05 — The maintainer selected Publisher grouping after comparing the two concepts and
authorised implementation with Newest first as the default. The bounded `1.4.0` plan records
controls, grouping/count rules, transient state, Undo/focus and capture/import reveal behaviour.
Implementation passes 266 tests/34 files, type/build, privacy/attribution and dependency gates.
Isolated browser checks cover groups/counts, Search/Bookmarks, Undo/expiry/focus, title edits,
capture/Import reveal and Light/Dark 320px/desktop layouts. Reload resets to Newest first.
Implementation commit `0997c47` passed Pages workflow `42109442120`; exact live assets and
normal Update retained the isolated browser's fictional article. Grouped Search worked; reload
returned to Newest first and the menu showed Version 1.4.0. Maintainer visual/device acceptance
remains; no tag or release is authorised.

Dated entries retain the status at the time; the current sections above supersede older pending
acceptance, timing and planning statements. Detailed implementation receipts live in the slice plans.

2026-11-05 — Recorded maintainer acceptance of Search matching, the Shared tool space hierarchy,
subtle button motion and final 500ms panel fade/movement. The timing refinement `bc5cc0e` passed
Pages workflow `42094753747`; the published stylesheet and live computed durations were verified
through the normal Update path. The earlier shared-layout (`56ac48a`) and crossfade (`5aeeaef`)
checks are retained in the Search plan. Updated current context, intent, roadmap and sprint links
so rejected layouts and earlier timings no longer appear as active work. No tag or release.

2026-11-05 — Recorded the maintainer's decision to leave triage routing as it is. The configured
Chrome route works, automatic desktop-chat-to-Chrome routing remains unresolved, and further
routing work is deferred. Phone routing is unverified; retained selections and original-link
retry guidance remain. Publisher organisation is the unstarted follow-on and images stay low priority.

2026-11-04 — Recovered a fresh two-article batch after an embedded-browser code mismatch. Opened
the original link in configured Chrome: **Added 2 articles**, with the list increasing 100 to 102.
Confirmed success back to triage. Documented that normal in-app clicks may choose a separate list
and that retry needs the ORIGINAL chat link, not the consumed error-page address. No code/version,
pairing or global-browser-preference change; Drive additions remain local until normal resume.

2026-11-04 — Repaired the authorised private triage completion setup and exercised its actual
three-article link in the intended Chrome browser. It reported zero additions and three duplicates
because the earlier manual import had already saved them. The 100-item list and visible
titles/bookmarks were preserved; the private fragment was cleared. Confirmed the result back to
the triage chat. No app-code/version change; phone and next-fresh-batch checks remain.

2026-11-04 — Published Search candidate `abe6795` through the successful checked Pages workflow.
Exact live HTML/assets match the verified build. Production Update retained the fictional local
article and displayed **Version 1.3.0**; Search and Clear worked. Real Android/desktop maintainer
acceptance remains. Publisher organisation is documented but not started; no tag/release created.

2026-11-04 — Implemented the Search candidate and passed 262 tests, type/build/public-build checks,
focused local browser interaction checks and Light/Dark layouts. The 1,000-match narrow-heading
overflow is corrected. Updated only Vite to its compatible `8.2.4` patch for the high-severity gate;
remaining low/moderate development-tool advisories are recorded in the Search plan. Publication
and human acceptance remain.

2026-11-03 — The maintainer authorised documenting both slices and starting Search. Added the
bounded `v1.3.0` Search contract and separate publisher follow-on document. Search implementation
and verification are in progress; earlier planning-only statements are superseded for Search.

2026-11-03 — The maintainer prioritised search and sorting, chose publisher grouping or sorting,
and deprioritised optional article images. Added the proposed two-slice sprint plan and updated
the existing backlog priorities. This is planning only; implementation and version choices remain.

2026-11-03 — Recorded the user's unresolved newsletter triage-transfer defect against the existing
add-link candidate. Expanded the existing organisation idea to cover filing and sorting, and added
article search to the exploratory backlog. This is documentation-only backlog maintenance;
implementation, product design, versioning and release decisions remain separate.

2026-10-09 — The maintainer authorised manual pairing after clarifying that one triage chat should
work on phone and desktop. Version `1.2.1` adds explicit code copying/pasting with strict validation,
clipboard fallback and clear browser-local revocation. Pairing changes no articles or Google
credentials; replaced codes are rechecked before pending imports commit. All 257 tests across 34
files pass, including paired imports and ordinary pending sync operations without codes. Type
checking, production build, privacy audits, dependency audits and attribution self-test pass.
Two separately stored local browser origins accepted the same fictional batch fragment after
pairing; invalid input was rejected and disabling one left the other accepting additions.
320px Light/Dark checks found no horizontal overflow. A password-manager prompt caught during
testing was avoided by using an ordinary code field. The normal Update path applied that correction.
Candidate commit `7e924c5` passed Pages workflow `37984824896`; live HTML, JavaScript and CSS
match the tested build. Real phone/desktop/chat acceptance remains; no tag or release was created.

2026-10-09 — The maintainer selected the one-click handoff and required public usability. The
`v1.2.0` candidate implements browser-local revocable authorisation, generic copyable chat
instructions, bounded fragment CSV input and reuse of the atomic add-only import. Focused checks
cover authorisation, revocation during asynchronous preparation, strict decoding, Unicode and URL
preservation, malformed and oversized batches, existing article preservation and normal queued
sync. An isolated browser verified setup, copying, later-fragment and fresh-page delivery,
duplicate skips, reload without replay, wrong and revoked codes, and 320px Light/Dark layout without
horizontal overflow. The privacy policy and public documentation explain the capability and browser
boundaries. All 249 tests across 34 files, type checking, production build, service-worker generation,
public-build and repository privacy audits pass; both dependency audits report zero vulnerabilities.
The browser's normal Update path retained all fictional articles. Candidate commit `2dfa4e3`
passed Pages workflow `37980471971`; live HTML, JavaScript, CSS and policy date were verified.
The real triage flow remains unaccepted. No tag or GitHub release was created.

2026-10-08 — The maintainer reported the connection diagnostics working and requested
**Reconnecting…** while the app is attempting reconnection. The bounded `v1.1.2` correction updates
the button from the same checking/connected/disconnected state used by the menu indicator, covering
manual attempts and automatic Drive checks. The menu version is updated; the connection and data
contracts are unchanged. Publication follows the normal checked Pages workflow.

2026-10-08 — The maintainer authorised a small connection-diagnostics update following frequent
reconnection on desktop and Android, and required a new menu version to identify the installed
build. The published `v1.1.1` candidate preserves the existing connection behaviour and records only
bounded local diagnostic metadata. All 225 tests and the build/privacy checks pass; dependency
audits report zero vulnerabilities after the narrow indirect build dependency updates. Commit
`97bc3b0` passed Pages workflow `37831620980` and its exact assets are public. Production browser
update acceptance confirmed the visible version and diagnostic panel; actual background interruption
evidence and any connection-behaviour correction remain. No tag or GitHub release was requested.

2026-09-07 — Reviewed and integrated the two Dependabot maintenance proposals: Ionic Core
9.0.0 to 9.0.2 and Vitest 4.1.11 to 5.0.0. The existing indirect build dependency
fast-uri was updated from 3.1.5 to 3.1.7 to clear the high-severity audit finding.
All 215 tests pass on Node 24; type checking, production build, service-worker generation
and both privacy audits pass, with zero reported dependency vulnerabilities. An isolated
browser check passed article capture, menu opening/dismissal and action-sheet bookmarking
with focus restored. Application version, data formats and sync behaviour are unchanged.
Publication verification follows the normal Pages workflow; no new release is requested.

2026-08-28 — `v1.1.0` was published as the latest GitHub release from exact verified commit
`1e95804` after GitHub Pages workflow `33206076911` passed. The remote lightweight tag resolves to
that commit. The release records accepted optional CSV-supplied reading times, compact saved-age
copy and manual CSV guidance while preserving existing articles and capture paths without an
estimate.

2026-08-28 — The maintainer accepted the published `v1.1.0` result and explicitly authorised the
GitHub release. Package metadata is aligned to `1.1.0`; the durable release record is being prepared
before final verification, the exact lightweight tag and release publication.

2026-08-28 — The maintainer accepted and requested implementation of `v1.1.0` CSV-supplied reading
times. The candidate recognises optional positive whole-minute `readtime`, preserves it through
IndexedDB, private Drive sync and version-2 Export, and appends **≈ N min read** only when present.
Recent saved ages use compact **Nmins old** or **Nhrs old** wording. All
215 tests across 30 files, type checking, production build, privacy and dependency audits and
no-attribution checks pass. Rendered 320px, desktop and Dark checks passed without overflow.
Candidate commit `537d765` passed Pages workflow `33204432044`; the live visible update path applied
and reported **Version 1.1.0** without browser warnings or errors. Installed-application maintainer
acceptance remains.

2026-08-27 — The Google Drive reconnect correction was published from commit `49242b1` after Pages
workflow `32997513632` passed. It retains complete validation and local pending-change safety while
downloading at most four existing operation records together. The maintainer observed a quicker
reconnect, although one attempt still felt closer to 30 seconds. A later repository-only funding
commit was repaired to privacy-safe commit `c2d34d6`; Pages workflow `33060132454` passed. GitHub's
Sponsor button remains unindexed despite valid configuration and is separate from application
completion.

2026-08-26 — A repeated production reconnect taking roughly 88 seconds was traced to dozens of
small Drive operation records being downloaded sequentially, rather than repeated housekeeping or
large data transfer. The maintainer approved a bounded correction. The candidate downloads at most
four records together, validates the complete set before updating the session cache and preserves
authorisation handling, deterministic operation application and local pending-change safety. All
197 tests across 29 files, type checking, production build, service-worker generation, repository
and public-build privacy audits, both dependency audits with zero vulnerabilities and the
no-attribution self-test pass. Drive formats, compaction thresholds, UI and package metadata remain
unchanged; published reconnect acceptance remains.

2026-08-26 — `v1.0.0` was published as the latest GitHub release from exact verified commit
`565cd59` after GitHub Pages workflow `32967914059` passed. The remote lightweight tag resolves to
that commit. The release records the accepted subtle Bookmark filter, closes the intended MVP and
moves the project to maintenance; no later product slice is approved or versioned.

2026-08-26 — The maintainer accepted the published Bookmark filter on installed Android and macOS
and authorised release closure. Candidate commit `3690512` passed Pages workflows `32967338184` and
`32967338912`; the public app exposed and successfully applied the visible feature-update path.
Package metadata is aligned to `1.0.0` and the durable release record is being prepared. No tag or
GitHub release exists yet.

2026-08-26 — The maintainer accepted the detailed `v1.0.0` Bookmark-filter contract. The local
candidate uses one quiet text action beside the existing count, retains the full newest-first queue
as the default and derives the bookmarked view without storage, Drive, CSV or network changes. All
195 tests across 29 files, type checking, build, service-worker generation, privacy audits, both
dependency audits with zero vulnerabilities and attribution checks pass. Rendered checks at the
320px minimum and desktop width cover hierarchy, no horizontal overflow, pointer and keyboard focus,
the filtered empty state, unbookmark messaging and next-article focus recovery. Publication remains.

2026-08-26 — The maintainer selected a subtle Bookmark filter as the final MVP product slice and
intended `v1.0.0` release, with articles retaining visual priority and grouping or tagging left as
unnecessary, unversioned post-1.0 possibilities. The proposed bounded contract uses one restrained
**Show bookmarks** or **Show all** action in the existing list-heading area, retains the complete
newest-first list as the default and adds no stored, synced, imported or exported filter state.
Application implementation remains unstarted pending review of the detailed plan.

2026-08-26 — `v0.8.0` was published as the latest GitHub release from exact verified commit
`5be7553` after GitHub Pages workflow `32963690674` passed. The remote lightweight tag resolves to
that commit. The release records accepted local System, Light and Dark appearance with Experimental
sync retained first and Appearance at the bottom of the menu.

2026-08-26 — The maintainer accepted the corrected published menu hierarchy and explicitly
authorised the `v0.8.0` release. The durable release record and cleaned, unversioned futures list are
being prepared before tagging the exact Pages-verified release commit.

2026-08-26 — Maintainer acceptance of the theme itself passed, with one requested hierarchy
correction: Experimental sync must remain at the top and Appearance belongs at the bottom. The
candidate now orders Experimental sync, Import and Export, then Appearance above the footer. All
189 tests, type checking, build, service-worker generation, both privacy audits, dependency audits
with zero vulnerabilities and no-attribution checks pass. Publication of this correction remains.

2026-08-26 — The agreed `v0.8.0` candidate adds System, Light and Dark in the main menu and applies a
local-only theme across the app, Ionic overlays, Privacy and Terms. All 189 automated tests across
28 files, type checking, production build, service-worker generation, repository and public-build
privacy audits, both dependency audits with zero vulnerabilities and the no-attribution self-test
pass. Local rendered checks cover narrow and desktop menus, persistence, dark list/action contrast,
the Ionic action sheet, title dialog and production-built legal pages. Publication remains.

2026-08-26 — `v0.7.0` was published as the latest GitHub release from exact verified commit
`d13a08b` after GitHub Pages workflow `32956771733` passed. The remote lightweight tag resolves to
that commit. The release records the accepted reviewed, local, add-only CSV Import, package-derived
menu version and corrected completion presentation.

2026-08-26 — The maintainer verified the corrected success tick, closing published `v0.7.0` Import
acceptance, and explicitly authorised release. The release record is prepared from the exact
accepted add-only CSV contract; package metadata is already `0.7.0`. No tag or release exists yet.

2026-08-26 — Published Chrome acceptance passed after the sequenced Import correction: the new
worker activated, the menu showed **Version 0.7.0**, a confirmed two-article import closed the menu
and the first imported article was revealed in its preserved saved-time position. The remaining
success icon looked like a downward chevron because its CSS width and height were reversed before a
45-degree rotation. Swapping those proportions produces the intended conventional tick; isolated
visual inspection passes and publication remains.

2026-08-26 — The maintainer's open Chrome tab was read-only inspected after the first correction
still failed. It was already running the exact corrected public bundle, proving that the missing
update prompt was expected and stale caching was not the cause. The remaining failure is consistent
with Ionic rejecting dismissal while the Import controls are still disabled. The next bounded
correction restores all controls before invoking the completion callback, dismisses on the next
rendered frame, keeps an explicit manual-close fallback, and adds a package-derived **Version 0.7.0**
label to the menu for future support diagnosis. All 183 tests across 27 files, type-checking,
production build and service-worker generation,
repository and public-build privacy audits, full and production dependency audits with zero
vulnerabilities, attribution-guard checks and the isolated browser interaction pass. Publication
remains.

2026-08-26 — Published Import acceptance returned a successful committed response but did not show
the imported article. Repository inspection confirmed that the atomic write and list render ran, but
the menu remained open and an article retaining an older saved time could sit below newer items.
The bounded correction closes the menu after success, scrolls to and focuses the first imported
article, and shows visible completion feedback without changing saved-time ordering, article data or
sync operations. All 183 tests across 27 files, type-checking, production build and service-worker
generation, repository and public-build privacy audits, full and production dependency audits with
zero vulnerabilities, and attribution-guard checks pass. An isolated browser import dated 2020
verified menu dismissal, bottom-of-list reveal, focus and visible status; publication remains.

2026-08-26 — The bounded `v0.7.0` Import candidate adds **Import CSV** beside Export. It accepts a
10 MB, 1,000-row UTF-8 named-column CSV, round-trips Laters exports, supports simpler URL-based
spreadsheets, reports duplicates and ignored data, and requires review confirmation. New articles
and normal pending add operations commit atomically; existing URLs are never overwritten and the
selected file is never uploaded. A connected Drive list refreshes before duplicate review, while a
disconnected remembered connection produces a local-only warning. Focused parser, interaction and
IndexedDB tests pass. All 182 tests across 27 files, type-checking, the production build,
service-worker generation and repository and public-build privacy audits pass; published acceptance
remains.

2026-08-25 — `v0.6.0` was published as the latest GitHub release from exact verified commit
`60794b0` after GitHub Pages workflow `32847501931` passed. The remote lightweight tag resolves to
that commit. The release records the accepted portable CSV Export; Import remains unimplemented and
is proposed as the separately defined `v0.7.0` slice.

2026-08-25 — The maintainer authorised the `v0.6.0` tag and GitHub release after successful Export
acceptance, and selected Import as the proposed `v0.7.0` slice. The durable release record is
prepared; Import remains unimplemented pending product definition.

2026-08-25 — Published macOS Chrome acceptance passed after the direct-download correction: the
**Download CSV** action saved the export successfully. This closes the bounded `v0.6.0` Export
implementation slice. No tag or GitHub release was created.

2026-08-25 — Published Mac acceptance showed that Chrome's file-share capability opened a macOS
share sheet without a reliable save destination. The bounded correction renames the action
**Download CSV** and always starts a conventional local browser download. Article-level URL sharing
is unchanged.

2026-08-25 — The bounded `v0.6.0` Export candidate adds **Download CSV** to the main menu. It creates
a versioned UTF-8 CSV with `url`, `title`, `created` and `tags` columns, preserves bookmark and
deliberate-title state with namespaced tags, and reversibly protects titles that could be interpreted
as spreadsheet formulas. The action starts a local browser download on every supported platform.
Focused tests prove formatting, escaping, filename, direct download delivery, accessible interaction
states and that export does not mutate IndexedDB articles or pending sync
operations. Credentials, accounts, connection details, local identifiers and Drive operation or
checkpoint state are excluded. Import remains deferred.

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
- [`v0.6.0` release record](../docs/releases/v0.6.0.md)
- [`v0.7.0` release record](../docs/releases/v0.7.0.md)
- [`v1.0.0` release record](../docs/releases/v1.0.0.md)
- [`v1.1.0` release record](../docs/releases/v1.1.0.md)
- [CSV export format](../docs/export-format.md)
- [CSV import contract](../docs/import-format.md)
- [Google Drive connection security plan](../docs/planning/google-drive-connection-security-plan.md)
- [Code security hardening plan](../docs/planning/code-security-hardening-plan.md)
- [`v1.0.0` Bookmark-filter plan](../docs/planning/bookmark-filter-plan.md)
- [`v1.1.0` CSV reading-time plan](../docs/planning/csv-reading-time-plan.md)
- [Desktop actions and responsive-width plan](../docs/planning/desktop-actions-responsive-plan.md)
- [MVP 2.0 Slice 3 whole-row opening plan](../docs/planning/mvp-2-slice-3-whole-row-opening-plan.md)
- [Mobile interaction shell plan](../docs/planning/mobile-interaction-shell-plan.md)
- [Paste-to-add plan](../docs/planning/paste-to-add-plan.md)
- [Edit-title plan](../docs/planning/edit-title-plan.md)
- [Google Drive live-sync plan](../docs/planning/google-drive-live-sync-plan.md)
- [Application menu drawer plan](../docs/planning/application-menu-drawer-plan.md)
- [`v0.2.0` release record](../docs/releases/v0.2.0.md)
- [`v0.3.0` release record](../docs/releases/v0.3.0.md)
- Published GitHub releases: `v0.1.0`, `v0.2.0`, `v0.3.0`, `v0.4.2`, `v0.5.0`, `v0.5.1`, `v0.5.7`, `v0.6.0`, `v0.7.0`, `v0.8.0`, `v1.0.0`, `v1.1.0`.
