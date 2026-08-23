# Deployment

## Production address

Laters is intended to run at `https://laters.dustyb.in/` using GitHub Pages. The custom subdomain gives the PWA its own browser origin, keeping its IndexedDB data and service worker separate from other sites.

Current status: the production workflow is active, the custom domain resolves to GitHub Pages, the GitHub-issued certificate is approved, and HTTPS is enforced.

## Automated deployment

`.github/workflows/deploy-pages.yml` verifies pull requests and deploys `dist/` after a successful push to `main`. The workflow:

1. installs the locked dependencies;
2. runs the automated tests;
3. type-checks and builds the production application;
4. audits `dist/` for common sensitive content, local paths, source maps and unintended external resources; and
5. publishes only the generated `dist/` directory to GitHub Pages.

The repository source, memory and evidence files are not part of the deployed artifact.

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

Record the tested Chrome version and any clipboard permission behaviour before release closure.

Commit `17970d0` published the `v0.4.0` production candidate. GitHub Actions run
`32634392394` passed, and a clean production browser applied the offered app update and confirmed the
deployed **Paste a link** control and current Laters presentation at 320px. Clipboard success and
permission fallback remain maintainer-controlled physical-device acceptance checks.

Commit `6583438` published the accepted HTTPS-defaulting, URL-validation and focus-treatment
correction. GitHub Actions run `32635078636` passed, and the production JavaScript and CSS
fingerprints matched the verified build. Clipboard behaviour remains part of the same physical gate.

## Application updates and saved data

A newly deployed worker installs its complete application-shell cache, then waits. An open Laters app announces that the update is ready and shows an **Update** button. Selecting it activates the worker and reloads the app once; failure to register or check for an update does not prevent the reading list from opening.

The first deployment of this update mechanism is transitional: the previously deployed app has no
update listener, so it cannot display the new button. This also applies to a desktop tab that has
remained on that old pre-redesign shell. Close every Laters app window or tab and reopen the site to
allow the waiting worker to become active; do not clear site data because that can remove the local
reading list. Later deployments use the in-app **Update** button normally.

The transitional activation, retention of existing saved data and visible **Update** action passed on Chrome for Android `151.0.7922.173` across later application-bundle deployments.

Normal deployments replace application files and service-worker caches without clearing the `laters` IndexedDB database. Saved articles therefore remain available across updates on the same `https://laters.dustyb.in` origin. Clearing site data, browser storage eviction, some uninstall behaviour or a faulty future database migration can still remove local-only data.
