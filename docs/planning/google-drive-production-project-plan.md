# Google Drive production project and client transition

## Status

Implemented, published and accepted as the bounded `v0.5.5` client-transition slice and the
configuration-only `v0.5.6` public-approval slice. The OAuth app is **In production** and available
to any Google Account.

## Google project boundary

- Project name: `Laters Production`.
- Project ID: `laters-production-2026`.
- Organisation: none.
- Billing account: not linked.
- Google Drive API: enabled. Google also enabled its normal foundational project services; Laters
  does not call them.
- The previous personal project and client remain unchanged as the rollback boundary.

## OAuth boundary

- User type: External.
- Publishing status: **In production**.
- Audience: any Google Account.
- App name: `Laters`.
- Public application home page: `https://laters.dustyb.in/`.
- Public privacy policy: `https://laters.dustyb.in/privacy/`.
- Public Terms: `https://laters.dustyb.in/terms/`.
- Authorised domain: `dustyb.in`.
- Scope: exactly `https://www.googleapis.com/auth/drive.appdata`, classified by Google as
  non-sensitive. No other requested scope is configured.
- Web client name: `Laters Production PWA`.
- Authorised JavaScript origin: exactly `https://laters.dustyb.in`.
- Authorised redirect URIs: none.
- No client secret is used, downloaded, copied into application storage or retained in the
  repository. The public client ID is intentionally compiled into the static application and
  explicitly allowlisted by the public-build audit.

## Quota, cost and failure boundary

The new project's console exposed legacy Drive request-rate controls rather than the quota-unit
controls described by Google's current general Drive documentation. The configured limits are:

- 10,000 requests per minute for the project;
- 5,000 requests per minute per user; and
- automatic quota increases disabled.

These are rate caps, not spending limits. Laters' ordinary foreground sync is expected to remain far
below them. If a cap is reached, Google rejects or throttles requests. Laters keeps the local list and
pending changes and can retry after the rate window clears; hitting a cap does not delete local data.

No billing account or paid service is authorised. A Cloud Monitoring quota-usage alert was inspected
but not saved because the console states that alert metric references are planned to become chargeable
in September 2026. The hard rate caps and disabled automatic increases provide the no-billing
safeguard without creating that future cost risk.

## Controlled transition

The new project's hidden Drive application-data area must be treated as empty until proved otherwise.
The published candidate must therefore be connected first on one installation whose complete local
list has already been verified. Laters' existing initialisation path uploads that complete local list
when no remote snapshot exists and reads it back before reporting success.

After publication:

1. update only the verified seed installation;
2. connect it to the new client and confirm the exact local list is unchanged;
3. add one disposable article and confirm the connected state remains healthy;
4. only then update and connect the second installation;
5. confirm both installations show the same complete list; and
6. perform one cross-device add and delete check.

During `v0.5.5`, any mismatch would have stopped the transition and prevented public publication.
The old project remains unchanged as a conservative rollback boundary after desktop and Android
acceptance passed.

## Automated evidence

- The focused production-client, exact-scope and empty-remote seed-path run passed 14 tests across
  two files.
- The complete suite passed 137 tests across 23 files.
- Type checking and the production build passed. The generated public build contains 21 files.
- Repository privacy and public-build audits passed. A focused search found no old client ID, client
  secret or private maintainer address in the candidate files.
- The no-attribution self-test passed.
- Production-only and full dependency audits each reported zero known vulnerabilities.

## Publication and physical acceptance

Commit `5e039da` published the new public client ID. GitHub Actions run `32742790944` passed every
build, test, dependency, repository-privacy and public-build gate and deployed successfully. The
live `index-C21iVQwq.js` asset matched the locally audited asset byte for byte.

The installed desktop seed retained its complete 17-item local list across the update. It connected
first, uploaded and read back the new project's initial snapshot, cleared one pending local change
and reported **Up to date in Google Drive** without changing that list. Android then connected to the
same project. Its one newer, previously unsynchronised local item brought both distinct lists to 18;
the desktop contained no duplicate URL or title.

A disposable `example.com` item added on desktop appeared on Android as item 19. Deleting only that
item on desktop propagated to Android, and both installations returned to the same 18-item list with
**Up to date in Google Drive**. This completes the seed, second-device, cross-device add/delete and
local-change-retention acceptance gates. The previous project remains unchanged as a conservative
rollback boundary; it is not used by the published application.

## Public OAuth approval and acceptance

On 2026-08-24, Google Search Console verified ownership of `dustyb.in` through the domain's DNS
provider. The Google verification TXT record must remain in DNS. The registered
`hello@dustyb.in` Google identity was added to the project as **Editor** and **OAuth Config Editor
(beta)** so Google would permit it to be saved as both the public user-support address and developer
contact. The maintainer's private address is not the configured public support contact.

The OAuth audience was then moved from **Testing** to **In production**. The project remains External,
uses the same production-only JavaScript origin, has no redirect URI, requests only the non-sensitive
`drive.appdata` scope, has no linked billing account and retains the accepted request caps. Google's
Verification Centre confirms that no data-access verification is required.

Google currently shows the verified domain `dustyb.in`, rather than the configured app name
`Laters`, on the account chooser and consent screen. Its Verification Centre says branding is not
shown, but neither the project owner nor OAuth Config Editor is offered a **Verify branding** action
on the Branding page. No logo was added merely to trigger verification. This is a recorded Google
presentation limitation, not a broader permission or an application failure.

Fresh desktop consent displayed the exact permission to see, create and delete only the app's own
configuration data in Drive. The account address shown beside that consent was the signed-in user's
own Google Account, not a public maintainer contact. Desktop reconnected with all 18 items and
reported **Up to date in Google Drive**. The maintainer also confirmed that the production connection
works on mobile. This completes the `v0.5.6` domain, support-contact, public-audience, exact-scope and
real-device acceptance gates.
