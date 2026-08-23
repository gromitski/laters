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

## Application updates and saved data

A newly deployed worker installs its complete application-shell cache, then waits. An open Laters app announces that the update is ready and shows an **Update** button. Selecting it activates the worker and reloads the app once; failure to register or check for an update does not prevent the reading list from opening.

The first deployment of this update mechanism is transitional: the previously deployed app has no
update listener, so it cannot display the new button. This also applies to a desktop tab that has
remained on that old pre-redesign shell. Close every Laters app window or tab and reopen the site to
allow the waiting worker to become active; do not clear site data because that can remove the local
reading list. Later deployments use the in-app **Update** button normally.

The transitional activation, retention of existing saved data and visible **Update** action passed on Chrome for Android `151.0.7922.173` across later application-bundle deployments.

Normal deployments replace application files and service-worker caches without clearing the `laters` IndexedDB database. Saved articles therefore remain available across updates on the same `https://laters.dustyb.in` origin. Clearing site data, browser storage eviction, some uninstall behaviour or a faulty future database migration can still remove local-only data.
