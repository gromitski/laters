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
