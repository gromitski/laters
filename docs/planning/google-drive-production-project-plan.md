# Google Drive production project and client transition

## Status

Implemented, published and accepted as the bounded `v0.5.5` slice. The OAuth app remains in
**Testing**, with only the maintainer admitted, until the separate `v0.5.6` public approval gate.

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
- Publishing status: **Testing**.
- Test users: the maintainer only.
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

Any mismatch stops the transition. Do not connect another installation, delete the old project or
move OAuth out of Testing. The old project remains the rollback boundary until desktop and Android
acceptance passes.

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
