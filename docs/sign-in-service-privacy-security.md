# Sign-in service: privacy and security explained

## Status — proposed, 2026-11-08

Read this with the [sign-in service plan](planning/sign-in-service-plan.md). This is a design and
review baseline, not a description of a deployed service or a completed security assessment.
Current **1.6.3** still has no Laters backend or server-held refresh credentials. Its public Privacy
and Terms continue to describe that shipped behaviour. Changes below require an agreed design and
implementation before they can become public promises.

## What changes, in plain language

Today the browser temporarily holds Google permission, and the maintainer has no server holding
that permission. In the proposal, a Worker could renew a person's access after they close Laters.
To do that it would keep a powerful renewal credential, encrypted in a database.

**The reading list would remain in the user's Google Drive, Dropbox or OneDrive, but the sign-in
service could obtain permission to read, change or delete Laters data in the authorised app area.**
The operator would technically have that ability too. Normal operation would not inspect lists,
and there would be no browse-users'-lists administration feature, but that is a policy and access
control boundary, not a cryptographic impossibility.

Encryption of stored credentials protects against some database leaks. The Worker needs the
decryption key to use them, so it does not protect against compromise of both the service and its
key, nor a malicious authorised deployment. This is not end-to-end encryption or zero-knowledge
storage. A separate design would be required to hide article content from a credential holder.

In the direct-sync proposal, article files normally bypass the Worker. In a full BFF, the Worker
also processes them in transit. That choice changes data handling and must be settled before launch.
App-folder permission also permits reading other files a user deliberately puts in that folder;
it is not a promise of access only to individual files originally created by Laters.

## Proposed data inventory

Article URLs and titles can reveal sensitive interests. They must not become diagnostic or usage
data just because the sync mechanism can access them.

| Data | Where / who can access it | Purpose and limits |
| --- | --- | --- |
| Articles, URLs, titles, saved dates, bookmarks, change records | Device and selected provider; Worker also sees payloads if BFF is chosen | Normal reading-list sync. No article database, search index, analytics or copies in D1. Either service design has the capability to access the authorised app data. |
| Provider/account/list binding | D1, accessible to the service/operator | Prevent one account's credentials or queue being used for another. Use opaque identifiers; do not link accounts by email. |
| Refresh credential and any persisted access token | Application-encrypted D1 record; decrypted briefly by Worker | Renew the selected connection. Never expose refresh credentials to browser code, diagnostics, URLs or exports. Any persisted access-token cache gets the same protection. |
| Session secret | Secure, HttpOnly browser cookie; only its hash in D1 | Identify this installation's session. It is itself a credential even though page JavaScript cannot read it. |
| Temporary provider access token | Worker; browser memory only if mediation is chosen | Short-lived sync access. Never local storage, IndexedDB, service-worker cache, CSV or chat add-links. With BFF it stays server-side. |
| Provider client secrets and credential-encryption key | Separate built-in Worker secrets, not D1, source or static build | Authenticate the application and decrypt credentials. Separate production/test values and access. |
| OAuth transaction state / verifier | Short-lived server record and protected browser binding | Match a callback to the initiating browser/provider and prevent replay; delete after use/expiry. |
| Minimal operational events | Restricted service logs, only if deliberately enabled | Bounded event code, coarse time, provider and random correlation ID. No tokens, cookies, callback query strings, article content or raw provider responses. |
| Request metadata | Hosting/provider infrastructure | IP address, user agent and traffic timing can be processed even if Laters avoids retaining them. Verify actual platform logging, retention and subprocessors; never claim no metadata processing. |

No provider password is collected by Laters. Provider sign-in happens on that provider's page.
Profile/email scopes are not a default requirement. If an SDK returns extra identity information,
discard what is unnecessary and document anything retained. Local articles remain readable to
someone using the same browser profile: account separation prevents accidental mixing; it does
not add a local screen lock or encrypt the existing IndexedDB database.

## Disconnect, deletion and offline use

- **Online Disconnect:** stop local sync/renewal, abort requests, notify other windows, invalidate
  this installation's broker session and remove its renewable credential reference, then clear its
  cookie. Do not revoke a shared provider grant or affect another device. Use generation/version
  checks so a concurrent callback/refresh cannot recreate the disconnected session.
  If acknowledgement fails, show that local sync has stopped and retain the same pending server
  invalidation marker as an offline Disconnect; don't report server deletion as confirmed.
- **Offline Disconnect:** stop this installation immediately and persist a local no-auto-connect
  marker across reopen. Queue authenticated server invalidation before any later renewal. The
  server cannot be told while offline; its record remains until contact or expiry. Clearing site
  data before queued invalidation is delivered also cannot erase the remote record.
- **Temporary credentials:** an already-issued access token may remain accepted by its provider
  until expiry. Local cancellation and broker invalidation cannot promise immediate invalidation
  of a stolen token. An already-sent operation may also have reached the provider.
- **Cloud/local articles:** Disconnect deletes neither. Deleting an article remains a sync operation;
  clearing local site data and deleting provider app data are separate user actions.
- **Full provider revocation:** use the provider's account permissions. Explain that this can stop
  other devices using the same application grant. Do not use it as routine device Disconnect.
- **Server erasure:** remove the targeted installation's credentials/sessions/transactions; if a
  grant is legitimately shared, remove only its reference and purge the credential when unreferenced.
  Authenticate requests and define a recovery route for a lost device/session. Never demand a
  refresh token or reading list in a support message. No unprotected delete-by-email endpoint.

Do not assume each device receives an independent provider grant or refresh token. Prove the
provider's grant semantics and bind device sessions to the appropriate scoped connection. Local
device Disconnect must not call a provider revocation endpoint that can invalidate shared access.

## Proposed retention defaults — for agreement before implementation

| Record | Proposed rule |
| --- | --- |
| Browser/broker session | 30 days inactivity; 90 days absolute lifetime, or earlier provider expiry/revocation. Confirm this usability/security balance before code; do not call it indefinite sign-in. |
| Renewal credential | Keep only while referenced by an unexpired, authorised installation session. Purge after Disconnect or expiry; bound cleanup lag to 24 hours when service is healthy. |
| Incomplete sign-in transaction | 10 minutes maximum; consume once; scheduled cleanup within 24 hours. |
| Application operational events | No per-user event log by default. If necessary, allowlisted events retained at most 7 days; confirm actual platform settings/limits before enabling. |
| Hosting backups | Cloudflare currently documents a 7-day D1 Time Travel window on Free. Deleted rows can remain in recoverable history during that period. No extra credential exports/backups in this initial design. |

[D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/) documents that backup
window. Live deletion is not immediate erasure from backups. Restore must occur behind a disabled
auth service and clear all restored grants/sessions before reopening, requiring new sign-in; never
resurrect a disconnected session from a historical database. Existing access tokens are subject to
their provider's own expiry rules. Confirm platform retention outside D1 separately.

## Required technical controls and what they cannot guarantee

The following are proposed acceptance requirements, not implemented controls.

| Threat | Required control / evidence | Remaining limitation |
| --- | --- | --- |
| Wrong account's list or credential | Authorise every lookup by server-owned session → provider → account/list binding; opaque IDs never grant access by themselves; negative tests for A/B and provider swaps | Display names and email matches are not identity proof. Provider claims/identifiers require validation. |
| Forged/replayed sign-in callback | Authorisation code with PKCE S256, unpredictable state bound to the browser, exact redirect/provider/issuer validation, short expiry, single use; nonce/claim validation if OIDC is used | No dynamic callback URL or open redirect. Keep callback logs/referrers clean. |
| Session theft/fixation | Random server-generated session ID, hash at rest, rotate after connection, explicit expiry and revocation, Secure/HttpOnly host-only cookie | A stolen valid cookie can still authorise requests; HttpOnly does not defeat malicious code making requests through a victim's browser. |
| Cross-site requests or hostile sibling site | Exact Origin allowlist, CSRF protection and credentialed CORS for approved app origins only; reject wildcard/reflected origins and unauthenticated token retrieval | CORS alone is not CSRF protection; same-site subdomains are not mutually trusted. |
| Browser script compromise | Preserve narrow CSP, safe text rendering, dependency checks; temporary access stays memory-only in mediation; assess BFF as stronger alternative | Mediation still exposes access tokens to malicious app code; BFF still permits some actions through a compromised browser. |
| Database dump | Authenticated encryption such as AES-GCM with unique nonces, key version and binding to provider/account/record; key separate from database | Key or deployment compromise defeats this boundary. No claim that storage encryption hides data from the operator. |
| Concurrent renewal / rotation / Disconnect | One renewal at a time per grant, atomic replacement of returned credentials, generation checks and expiry/error classification | Provider rotation rules differ. Never overwrite a refresh token with an omitted value or retry permanent rejection forever. |
| Open proxy / excessive cloud permissions | Hard-coded provider endpoints/resource/scope limits, no arbitrary fetch URL; app-folder access only; validate redirected download destinations where required | Provider API compromises and deliberately added app-folder files remain within that permission boundary. |
| Credential leakage in caches/logs | No-store token/session/callback responses, no referrer, redact headers and query strings before capture, disable sensitive body logging; don't service-worker-cache auth routes | Hosting metadata/support systems may still process data; verify their configuration. |
| Abuse / quota exhaustion | Bounded bodies, per-session/global throttles, indexed queries and bounded retries; fail closed; cheap expiry cleanup and no paid dependency | Free allowance can still be exhausted. Local use must continue; security checks cannot be skipped to save quota. |
| Hosting/deployment account compromise | MFA, least-privilege maintainer/deploy access, reviewed dependencies, separate test/prod secrets and bindings, auditable changes and an auth kill switch | The authorised operator and hosting platform remain trust dependencies. |

Design basis: [OWASP OAuth](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html),
[session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html),
[CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html),
[cryptographic storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html).
The architecture comparison in the plan applies
[RFC 10017](https://www.rfc-editor.org/rfc/rfc10017.html#section-6.2); citing guidance does not
establish compliance or a security sign-off.

### Browser-origin and cookie decision

Use a dedicated same-site auth hostname as the candidate, keeping its cookie host-only (no Domain
attribute), Secure and HttpOnly, with a `__Host-` prefix and Path `/`. Candidate session SameSite
policy is Strict. The OAuth callback is a cross-site navigation: a separate short-lived Lax
transaction cookie for a top-level GET callback may be needed to bind state. Do not weaken the
long-lived cookie or state validation to make a redirect work. Test actual callback method,
privacy restrictions, standalone PWA, ordinary browser and other tabs before choosing the settings.
Unrelated preview origins must not receive production cookies or credentials.

The Worker can set security response headers. The app still on GitHub Pages retains its current
header limitations; adding a Worker on another hostname does not silently secure every app page.
No third-party scripts, analytics or permissive CSP additions on the authentication surface.

### Encryption-key handling

Use [built-in Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/),
not a newly purchased secret-management service. Restrict access to production deployments.
Store a key version with ciphertext; test rotation with old/new keys and recover from a failed
rotation. Never log a plaintext test credential to prove encryption. A lost key means reconnecting,
not attempting to reconstruct secrets from logs. Retire old keys after live migration and the
relevant recovery window, and document how restored backups are handled. No real keys in this plan.

## Processing location and privacy information

Before any public rollout, record the actual operator/contact, applicable controller/processor
roles, purpose and legal basis, data categories, recipients, retention, rights/contact route and
international-transfer arrangements. Review Cloudflare's applicable
[DPA](https://www.cloudflare.com/cloudflare-customer-dpa/) and
[subprocessors](https://www.cloudflare.com/gdpr/subprocessors/cloudflare-services/), plus each
provider's requirements. The [ICO's transparency guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-be-informed/)
explains purposes, recipients and retention disclosures. These are launch decisions to evidence,
not a determination here that the proposed service is legally compliant.

Cloudflare's [D1 location documentation](https://developers.cloudflare.com/d1/configuration/data-location/)
distinguishes enforceable database jurisdictions from non-guaranteed location hints. Verify the
selected Free-plan options before creating a database. Even an EU database does not establish
EU-only Worker execution, support, logs or provider processing. Make no UK-only/EU-only promise
without evidence covering the complete service, and don't silently enable a paid location feature.

Before enabling persistent connections, revise current claims in `public/privacy/index.html`,
README and SECURITY about no backend/server-held access and the maintainer being unable to see
lists. Explain the new processing before consent and provide the reviewed policy. Update CSP,
support instructions and provider registration URLs to match the deployed endpoints. Keep the
current public statements accurate until actual behaviour changes; this document is not a live
privacy notice. Public support details must remain privacy-safe.

Suggested meaning for future user wording, still subject to architecture/retention decisions:
“Laters keeps your list on your device and with your chosen storage provider. To keep this device
connected, our sign-in service stores encrypted credentials that can access your Laters app data.
Disconnect stops this device's connection without deleting your articles.” Do not publish this as
a complete policy or imply encryption prevents operator access.

## Proportionate incident and recovery plan

Before launch, provide one tested operating runbook: disable sign-in/token issuance; determine
whether sessions, tokens, keys or deployment access were exposed; invalidate affected broker
sessions; use provider revocation where necessary, explaining possible effects on other devices;
rotate affected keys/client secrets; preserve only redacted necessary evidence; communicate with
affected people and assess any applicable notification duties; restore clean service and require
fresh sign-in. Service shutdown must leave local lists/queues usable. Do not clear reading lists
or restore old credentials as an incident shortcut.

Owner review must cover the privacy trade-off as well as usability. Technical evidence must cover
forged callbacks, stolen/wrong sessions, renewal/Disconnect races, offline stopping, provider
revocation, secret-free logs, expiry/cleanup, backup restoration and free-tier exhaustion. Use
fictional fixtures for automated checks; real accounts require bounded authorised testing. Keep
this proportional to the chosen slice and distinguish simulated checks from provider/device acceptance.
