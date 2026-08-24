# Deployment

## Production address

Laters is intended to run at `https://laters.dustyb.in/` using GitHub Pages. The custom subdomain gives the PWA its own browser origin, keeping its IndexedDB data and service worker separate from other sites.

Current status: the production workflow is active, the custom domain resolves to GitHub Pages, the GitHub-issued certificate is approved, and HTTPS is enforced.

## Automated deployment

`.github/workflows/deploy-pages.yml` verifies pull requests and deploys `dist/` after a successful push to `main`. The workflow:

1. installs the locked dependencies;
2. runs the automated tests;
3. rejects known high or critical dependency vulnerabilities;
4. audits tracked source and the current commit identity for common private data and credentials;
5. type-checks and builds the production application;
6. audits `dist/` for common sensitive content, local paths, source maps and unintended external resources; and
7. publishes only the generated `dist/` directory to GitHub Pages.

The repository source, memory and evidence files are not part of the deployed artifact.
Dependabot is separately configured in repository code to propose weekly npm updates and monthly
GitHub Actions updates.

## Public-readiness security acceptance

Connection hardening was published in `v0.5.2` and accepted on desktop and Android. Google access
tokens are memory-only, stale legacy credentials are removed, sync requires deliberate resume after
reload or expiry, and the drawer provides disconnect with a revocation attempt. The hosted pages use
restrictive browser policies compatible with Google Identity and Drive.

The accepted `v0.5.4` code-only hardening rejects website-generated cross-site and oversized Share
Target requests, adds defence-in-depth anti-framing, runs high/critical dependency auditing during
deployment, enables automated dependency update proposals and publishes `SECURITY.md`. GitHub
Actions run `32726439817` passed for the final acceptance record at commit `34c08d0`; the maintainer
then confirmed ordinary Android Share Target capture still worked after updating.

GitHub Pages still cannot provide repository-defined HSTS, `X-Content-Type-Options`,
`Permissions-Policy` or response-header `frame-ancestors`. Adding a proxy, backend or different host
is outside the accepted project boundary. The separate production Google project and client have
not yet been created; that controlled transition is `v0.5.5`.

## Android acceptance

Once HTTPS is active:

1. Open `https://laters.dustyb.in/` in the current stable Chrome for Android.
2. Install Laters when Chrome offers installation, or use Chrome's install action.
3. Open an article in Chrome, use **Share**, and choose **Laters**.
4. Confirm that the article appears once at the top of the list.
5. Share the same article again and confirm that it moves to the top without creating a duplicate.
6. Close and reopen Laters and confirm that saved items remain.
7. Delete an item, use **Undo**, and confirm that it returns.
8. Delete it again without undoing and confirm that it remains deleted after reopening.
9. Turn connectivity off and confirm that the Laters shell still opens; original article links are expected to need a connection.

Record the tested Chrome version and any failure before expanding the browser-support claim.

Physical-device acceptance passed on Chrome for Android `151.0.7922.173`: installation, standalone launch, Share-menu discovery, valid capture, exact-URL duplicate refresh, newest-first ordering, reopening persistence, deletion, Undo and offline-shell behaviour all worked as intended. Original article navigation resumed normally after connectivity was restored.

MVP 2.0 physical Android acceptance passed on 2026-08-22. It covered bookmark persistence and
re-share retention, Delete/Undo with bookmarked items, publisher favicons and deterministic/offline
fallbacks, narrow multi-line rows, corrected source-marker alignment, whole-row opening, the title
link, Bookmark and Delete separation, scrolling, text selection and Ghost/Undo behaviour. The exact
browser version was not separately re-recorded, so this does not broaden the existing support claim.

The v0.3.0 mobile interaction shell was physically accepted on Android on 2026-08-22. Testing covered
quick row opening, vertical scrolling, long press without Android selection or dictionary UI,
action-sheet actions and dismissal, right-swipe Bookmark or Remove, warning-red left-swipe Delete,
lower-page in-place Delete/Undo without a viewport jump, and the final white-centred Undo control
with its neon-lime countdown ring and black glyph. The exact browser version was not separately
re-recorded, so the established Chrome for Android support claim remains unchanged.

After v0.3.0, **Share this article** was added to the long-press action sheet as a small personal-app
extension. It invokes Android's generic system chooser and shares only the saved article URL; Laters
does not name, select or observe NotebookLM or any other destination. An initial title-and-URL
payload was rejected after physical testing showed that NotebookLM and other receivers could
misinterpret it. Commit `69faadc` corrects the contract to URL only and adds a regression test;
GitHub Actions run `32598149427` passed and the matching bundle is public. Focused physical Android
acceptance passed on 2026-08-23: the generic chooser opened, NotebookLM added a representative public
article from its URL without the saved title contaminating the payload, and cancelling returned
safely to Laters.

Android's news feed was observed sharing distinct URLs for what appeared to be the same article, producing separate saved items. Laters intentionally deduplicates only the exact normalised URL; it does not currently follow redirects or guess that different tracking or rotating URLs identify the same article.

## Contextual installation

The normal browser page and installed PWA use the same white, ink and lime application shell. When a
supporting browser reports that the PWA is currently installable, Laters shows a 44px **Install**
action vertically aligned to the right of the wordmark. Selecting it invokes the browser's native
installation prompt. The action remains absent when installation is unsupported or the PWA is
already installed, and disappears after the prompt is used or installation completes.

Commit `5296776` added this contextual action without introducing a desktop package or separate app.
GitHub Actions run `32632687610` passed, and the public origin served the matching branded assets.
A production browser received the install-availability event and displayed the aligned action; final
acceptance of the native installation dialog passed on 2026-08-23.

## Paste-to-add acceptance

For the `v0.4.0` production candidate:

1. Copy a representative public article URL, select **Paste a link**, and confirm the article is
   saved directly below the control.
2. Deny or otherwise make clipboard reading unavailable, then confirm the inline URL field and
   **Add** action appear. Confirm both a complete HTTP(S) URL and a bare address such as
   `example.com/article` save, with the bare address stored as HTTPS.
3. Enter invalid text and confirm the field stays open with **That doesn't look like a link**.
4. Paste an already saved exact URL and confirm the existing item is refreshed at the top without a
   duplicate and retains its bookmark state.
5. Reopen Laters and confirm pasted items persist. Check that Share capture, row opening, gestures,
   Delete/Undo and the local-storage disclosure remain unchanged.
6. Confirm `javascript:`, `data:`, `file:`, credential-bearing URLs and malformed or excessively long
   values are rejected and the typed value remains available for correction.

Record the tested Chrome version and any clipboard permission behaviour when separately observed.

Commit `17970d0` published the `v0.4.0` production candidate. GitHub Actions run
`32634392394` passed, and a clean production browser applied the offered app update and confirmed the
deployed **Paste a link** control and current Laters presentation at 320px. Clipboard success and
permission fallback remain maintainer-controlled physical-device acceptance checks.

Commit `6583438` published the accepted HTTPS-defaulting, URL-validation and focus-treatment
correction. GitHub Actions run `32635078636` passed, and the production JavaScript and CSS
fingerprints matched the verified build. The maintainer confirmed on 2026-08-23 that the current
mobile paste-to-add flow works well. Successful clipboard intake therefore has physical acceptance;
the denied/unavailable fallback is covered by focused automation and browser verification rather
than a separately recorded physical permission denial.

## Google Drive live-sync acceptance

For the private live-sync candidate:

1. Update Laters on Android and desktop, then connect once on each device if no valid short-lived
   Google permission remains.
2. With Laters closed on Android, share a new representative article to Laters. Open Laters and
   confirm that the change uploads or is clearly shown as waiting to sync.
3. Keep desktop Laters visible and confirm the new article appears within 20 seconds without a
   manual reconnect.
4. Delete that article on desktop without Undo. Keep Android Laters visible and confirm the article
   disappears within 20 seconds.
5. Add another temporary article, delete it and choose Undo. Confirm the restored item remains on
   both devices after the next check, then delete the temporary item on one device and confirm the
   final deletion reaches the other.
6. Reload one connected installation before the permission expires and confirm sync resumes without
   account selection. Expiry and rejected-token cleanup remain deterministic automated checks rather
   than a test that waits for a live token to age.
7. Confirm local-only use still works and that failed uploads leave pending local changes intact.

Record the deployed commit and workflow run. Do not claim multi-device live-sync acceptance until
the maintainer confirms the add and delete propagation checks above.

Post-release acceptance completed on 2026-08-23: the maintainer confirmed the documented
cross-platform sequence works, including additions, deletions and Undo alignment between phone and
desktop. Expiry, rejected-token cleanup and failed-upload retention remain deterministic automated
checks rather than manually forced failure conditions.

## Google Drive housekeeping acceptance

1. Confirm automation proves that fewer than 100 operation files do not trigger housekeeping and
   that the threshold is exactly 100.
2. Confirm the resolved version-2 checkpoint names the exact covered operation identifiers and is
   successfully written without deleting files in that same pass. Confirm a later check first reads
   the settled checkpoint and only then deletes the matching files.
3. Confirm an interrupted deletion leaves the checkpoint authoritative, does not block normal sync
   and is retried on the next check.
4. Confirm an already-open device adopts a newer checkpoint before upload and acknowledges a pending
   operation already covered by it without uploading a duplicate.
5. Confirm existing version-1 snapshots remain readable and malformed or duplicate covered-operation
   identifiers fail safely.
6. After deployment, complete one ordinary phone/desktop add or delete round trip. Do not create 100
   manual changes: the boundary and failure paths are deterministic automated checks.

Record the deployed commit and workflow run. This maintenance path has no new interface or visual
acceptance gate.

Automatic evidence passed for commit `b3f4fcf`: 129 tests, type checking, production build,
repository and public-build privacy audits, the no-attribution guard, and production/full dependency
audits. GitHub Actions run `32667577633` deployed successfully and the public origin serves its
matching `index-D329XvN-.js` asset.

Physical acceptance completed on 2026-08-23 after both installations updated: the maintainer added
an article on one device, observed it on the other, deleted it there and watched the deletion sync
back successfully. This closes the final housekeeping acceptance check.

## Application menu drawer acceptance

1. On Android, confirm the circular menu control appears at the top right without clipping the
   wordmark or an available **Install** action.
2. Open it and confirm the unchanged Experimental sync card and **Privacy** link are visible in the
   bottom drawer without scrolling through the article list.
3. Confirm the menu button is pale green after a successful Drive check, white while connecting or
   checking, and pale red when disconnected or offline. Its accessible name must report the same
   state.
4. Close with the visible close control, the backdrop and a downward swipe. Confirm the menu trigger
   remains usable, the article-list position does not change and the centred page does not move
   sideways when the drawer opens or closes.
5. On desktop, confirm the same bottom drawer opens from keyboard focus, closes with Escape and
   returns focus to **Open menu**. Pointer opening, closing and window refocus must not leave a thick
   black outline on either circular control; keyboard focus must retain the slimmer olive outline.

A more detailed top-level badge or status message remains deferred.

The menu was published in `2a8e329`, its three-state Drive indicator in `4cc5c0b`, and the desktop
scrollbar/focus correction in `6146e96`. GitHub Actions runs `32658437608`, `32659008341` and
`32659745917` completed successfully. The maintainer accepted the corrected desktop behaviour on
2026-08-23. Android reachability, scrolling and dismissal were the remaining menu acceptance checks
and are recorded as complete below.

Post-release Android acceptance completed on 2026-08-23: the maintainer confirmed the drawer is
working well. This closes the remaining physical menu acceptance gate.

## Edit-title acceptance

For the `v0.4.1` production candidate:

1. Long-press an article and confirm the order is **Read now**, **Edit title**, Bookmark/Remove
   bookmark, **Share this article**, **Delete**, **Cancel**.
2. Select **Edit title** and confirm the current title is selected in one styled field and the dialog
   explains that the URL will not change.
3. Cancel once and confirm nothing changes. Reopen, enter only spaces and confirm **Enter a title.**
   appears without closing or losing the value.
4. Save a new title and confirm the visible title and the Bookmark, Delete and menu labels use it,
   while the original link, source, saved time, position and bookmark state remain unchanged.
5. Reopen Laters and confirm the title persists. Capture the same exact URL again and confirm the
   title remains while the item refreshes at the top without a duplicate.
6. Confirm **Share this article** still sends only the locked saved URL.

Commit `b5d663f` published the `v0.4.1` production candidate. GitHub Actions run `32636593819`
passed, and the public origin served the matching verified JavaScript and CSS fingerprints. The
320px browser acceptance passed. On 2026-08-23 the maintainer confirmed that the production mobile
implementation works perfectly, closing the physical acceptance gate.

## Desktop actions and responsive-width acceptance

For the `v0.4.2` production candidate:

1. At a desktop mouse/trackpad width, confirm the reading-list shell is moderately wider without
   becoming a full-width desktop layout.
2. Confirm every normal row shows a circular three-dot **More actions** control immediately before
   the existing Delete control.
3. Select it and confirm the unchanged action menu opens. Cancel and confirm focus returns to the
   three-dot control.
4. Edit a title and confirm the three-dot control's accessible name follows the new title.
5. Confirm row opening, Bookmark, Delete, right-click and `Shift+F10` remain independent routes.
6. At mobile width, confirm the three-dot control is absent and touch long press, swipes and the
   existing row dimensions remain unchanged.

Commit `2639185` published the `v0.4.2` production candidate. GitHub Actions run `32637456916`
passed, and the public origin served the matching verified JavaScript and CSS fingerprints. A
production browser applied the offered update without losing its saved articles, confirmed the
wider 1280px presentation, opened the unchanged menu from **More actions**, restored focus on Cancel
and reported no errors. The maintainer accepted the final production presentation on 2026-08-23,
closing the visual acceptance gate for release `v0.4.2`.

## Application updates and saved data

A newly deployed worker installs its complete application-shell cache, then waits. An open Laters app announces that the update is ready and shows an **Update** button. Selecting it activates the worker and reloads the app once; failure to register or check for an update does not prevent the reading list from opening.

The first deployment of this update mechanism is transitional: the previously deployed app has no
update listener, so it cannot display the new button. This also applies to a desktop tab that has
remained on that old pre-redesign shell. Close every Laters app window or tab and reopen the site to
allow the waiting worker to become active; do not clear site data because that can remove the local
reading list. Later deployments use the in-app **Update** button normally.

The transitional activation, retention of existing saved data and visible **Update** action passed on Chrome for Android `151.0.7922.173` across later application-bundle deployments.

Normal deployments replace application files and service-worker caches without clearing the `laters` IndexedDB database. Saved articles therefore remain available across updates on the same `https://laters.dustyb.in` origin. Clearing site data, browser storage eviction, some uninstall behaviour or a faulty future database migration can still remove local-only data.

## Production Google project transition acceptance

Commit `5e039da` published the bounded `v0.5.5` client transition. GitHub Actions run
`32742790944` passed and deployed the matching `index-C21iVQwq.js` asset. The separate production
Google project has no linked billing account, uses only `drive.appdata`, admits only the maintainer
while in **Testing**, accepts JavaScript only from `https://laters.dustyb.in` and has no redirect URI.

The desktop seed retained 17 items across the update, connected first and reported the initial Drive
snapshot up to date. Android then contributed one distinct local item that had not recently synced;
both installations converged on 18 with no duplicate URL or title. A disposable item added on desktop
appeared on Android as item 19, and its desktop deletion returned both installations to 18. The
maintainer confirmed both devices were up to date on 2026-08-24, completing the production-project
data-preservation and cross-device acceptance gate. Public OAuth remains the separate `v0.5.6`
decision.

## Public Google OAuth acceptance

The configuration-only `v0.5.6` gate completed on 2026-08-24 without changing the deployed
application bundle. The production project is now **In production** and available to any Google
Account. Domain ownership for `dustyb.in` is verified, `hello@dustyb.in` is the saved public support
and developer contact, billing remains unlinked, the request caps are unchanged and `drive.appdata`
remains the only requested scope. Google reports that this non-sensitive scope requires no
data-access verification.

Google currently identifies the consent request as `dustyb.in`, not `Laters`. The Verification
Centre says branding is not shown, while the Branding page provides no **Verify branding** action
for the current no-logo, one-domain, non-sensitive configuration. A logo was not added solely to
trigger review.

After the existing grant was removed from the maintainer's Google Account, fresh desktop consent
showed the exact application-data permission. The Google Account address visible on that screen was
the consenting user's own address; it is not exposed to other users. Reconnection retained all 18
items and returned to **Up to date in Google Drive**. The maintainer also accepted the production
connection on mobile.
