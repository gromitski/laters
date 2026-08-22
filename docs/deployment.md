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

Android's news feed was observed sharing distinct URLs for what appeared to be the same article, producing separate saved items. Laters intentionally deduplicates only the exact normalised URL; it does not currently follow redirects or guess that different tracking or rotating URLs identify the same article.

## Application updates and saved data

A newly deployed worker installs its complete application-shell cache, then waits. An open Laters app announces that the update is ready and shows an **Update** button. Selecting it activates the worker and reloads the app once; failure to register or check for an update does not prevent the reading list from opening.

The first deployment of this update mechanism is transitional: the previously deployed app has no update listener, so it cannot display the new button. Close the installed app after that deployment and reopen it to allow the waiting worker to become active. Later deployments use the in-app **Update** button normally.

The transitional activation, retention of existing saved data and visible **Update** action passed on Chrome for Android `151.0.7922.173` across later application-bundle deployments.

Normal deployments replace application files and service-worker caches without clearing the `laters` IndexedDB database. Saved articles therefore remain available across updates on the same `https://laters.dustyb.in` origin. Clearing site data, browser storage eviction, some uninstall behaviour or a faulty future database migration can still remove local-only data.
