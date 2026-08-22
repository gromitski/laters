# Deployment and domain setup

## Production address

Laters is intended to run at `https://laters.dustyb.in/` using GitHub Pages. The custom subdomain gives the PWA its own browser origin, keeping its IndexedDB data and service worker separate from other sites.

Current status: the production workflow is active, `laters.dustyb.in` resolves through Gandi to GitHub Pages, the GitHub-issued certificate is approved, and HTTPS is enforced.

## Automated deployment

`.github/workflows/deploy-pages.yml` verifies pull requests and deploys `dist/` after a successful push to `main`. The workflow:

1. installs the locked dependencies;
2. runs the automated tests;
3. type-checks and builds the production application;
4. audits `dist/` for common sensitive content, local paths, source maps and unintended external resources; and
5. publishes only the generated `dist/` directory to GitHub Pages.

The repository source, memory and evidence files are not part of the deployed artifact.

## One-time manual setup

Complete these steps in order. Keep any GitHub domain-verification TXT record permanently.

### 1. Verify `dustyb.in` with GitHub

1. Open GitHub **Settings** for the `gromitski` account.
2. Open **Pages**, then **Add a domain** under **Verified domains**.
3. Enter `dustyb.in` and copy the exact TXT record name and value GitHub provides.
4. In Gandi, open **Domain** → **dustyb.in** → **DNS Records**.
5. Add the TXT record using the name and value supplied by GitHub.
6. Wait for DNS propagation, then return to GitHub and select **Verify**.

### 2. Configure the custom domain

1. Open the `gromitski/laters` repository on GitHub.
2. Open **Settings** → **Pages**.
3. Confirm that **GitHub Actions** is shown as the build source; this source is already configured.
4. Set the custom domain to `laters.dustyb.in` and save it before adding the CNAME at Gandi.

### 3. Point the subdomain to GitHub Pages

1. In Gandi, return to **Domain** → **dustyb.in** → **DNS Records**.
2. Add a `CNAME` record with:
   - name: `laters`
   - value: `gromitski.github.io.`
   - TTL: Gandi's default value
3. Do not point the CNAME to `gromitski.github.io/laters` and do not add a wildcard record.

### 4. Enable and verify HTTPS

1. Wait for GitHub's DNS check and certificate provisioning to finish.
2. In repository **Settings** → **Pages**, enable **Enforce HTTPS** when the option becomes available.
3. Confirm that `https://laters.dustyb.in/` loads without a certificate warning.

DNS propagation and certificate provisioning can take time. Do not remove the GitHub Pages custom domain while its CNAME remains active.

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
