# Roadmap

## Status

This is the accepted delivery order after the private Google Drive sync release. Each version is a
bounded slice: completing one does not silently authorise work from the next. Laters remains a
local-first personal tool with no Laters account, backend or public database.

## `v0.5.x` — prepare for public use

### `v0.5.2` — connection security

- Keep Google access tokens in memory only. Do not persist them in IndexedDB, local storage, the
  service-worker cache or the Drive files.
- Remove any token left by an earlier Laters version. A reload, full close, expiry or failed
  credential requires the user to select **Resume Google Drive** again.
- Add an in-app disconnect action that stops sync locally and attempts to revoke the active Google
  permission. Explain that disconnecting does not delete Laters data already stored in Drive.
- Add a restrictive Content Security Policy compatible with the static PWA and Google sign-in.
- Update the privacy policy, README, current project truth and focused automated checks for the
  changed connection contract.

This slice does not make OAuth public, add accounts, introduce a backend or create refresh tokens.

Status: implemented, published and accepted in `v0.5.2`.

### `v0.5.3` — terms and acceptable use

- Publish plain-English Terms covering the open-source, at-your-own-risk nature of the service,
  acceptable use and lawful limitations of liability.
- State that users are responsible for their saved links, devices, Google account and use of the
  software, while retaining every protection that cannot legally be excluded.
- Recheck the privacy policy against the shipped application and link both documents clearly.

This slice is documentation and product policy. It does not claim that wording can override
applicable law or remove responsibilities that cannot legally be excluded.

Status: implemented, published and accepted in `v0.5.3`.

### `v0.5.4` — code-only security hardening

- Reject website-generated cross-site submissions to the Android Share Target while preserving
  browser-generated Android shares.
- Bound share-request size before performing expensive parsing or writes.
- Add a code-level anti-framing guard as defence in depth for GitHub Pages.
- Run dependency auditing during deployment and configure automated dependency update proposals.
- Document the response-header protections that cannot be added without leaving GitHub Pages.

This slice does not add a proxy, backend, paid service or new hosting configuration. The frame guard
does not claim to be equivalent to an HTTP `frame-ancestors` policy.

Status: implemented, published and accepted in `v0.5.4`.

### `v0.5.5` — production project and safeguards

- Separate the public production Google Cloud project and OAuth client from personal testing.
- Restrict authorised web origins and redirect behaviour to the production Laters domain.
- Keep the new project in **Testing** with only the maintainer admitted throughout this slice;
  publication remains `v0.5.6`.
- Set conservative API quotas and any available budget or usage alerts before admitting public
  users; record the actual controls offered to the newly created project and what happens if a
  limit is reached. Google's Drive quota and charging model changed in 2026 and must be checked at
  configuration time rather than copied from an older assumption.
- Keep billing disabled unless Google makes it a deliberate requirement and the maintainer accepts
  the cost boundary first.
- Protect the existing list during the client transition. Treat the new project's hidden Drive area
  as empty until proved otherwise, connect one verified complete seed installation first, confirm
  exact content, then connect the second installation. Preserve the old project as rollback until
  desktop and Android acceptance passes.

This slice requires maintainer access to the Google console. No billing commitment or paid service
is authorised by this roadmap.

Status: implemented, published and accepted. The separate no-billing project, Testing-only OAuth
client, exact production origin, `drive.appdata` scope and conservative request caps are configured.
The controlled desktop/Android transition retained the complete list and passed a cross-device
add/delete round trip.

### `v0.5.6` — public OAuth approval

- Complete the required domain, brand, support-contact and privacy/terms checks.
- Move the production OAuth application out of Testing only after the earlier security and quota
  gates have passed.
- Verify the published consent flow and Drive connection on a real desktop and Android device.

Public availability is an explicit acceptance gate, not an automatic consequence of merging code.

Status: implemented and accepted on 2026-08-24. The production OAuth app is **In production** and
available to any Google Account. `dustyb.in` ownership is verified, `hello@dustyb.in` is the public
support and developer contact, and Google confirms that the sole non-sensitive `drive.appdata`
scope needs no data-access verification. Google's consent flow currently identifies the app as
`dustyb.in`: the Verification Centre says branding is not shown and the Branding page exposes no
**Verify branding** action without a logo or another verification trigger. Fresh desktop consent and
desktop/Android reconnection retained the complete 18-item list and reported Drive up to date.

### `v0.5.7` — non-technical introduction

- Reshape the README for people who simply want to use Laters, with screenshots and short guidance
  for opening, installing, connecting, disconnecting and deleting data.
- Keep developer setup and architecture available without making them the first thing a new user
  must understand.
- Ensure screenshots contain no private articles, accounts, email addresses, tokens or browser
  details.

This slice changes documentation and presentation material, not application behaviour.

Status: implemented, published and maintainer-accepted on 2026-08-24. Commit `13c61ef` published the
candidate through successful GitHub Actions run `32783130212`. The README now leads with opening,
installation, capture, optional sync, everyday controls, disconnection and deletion guidance. Its
two screenshots
use only fictional `example.com`, `example.org` and `example.net` articles in an isolated local
preview; they contain no browser chrome, accounts, email addresses, tokens or real reading-list
content.

## `v0.6.0` — Export

- Add an explicit, user-initiated export of the user's Laters data in a durable, documented format.
- Include enough stable data to support later recovery or import without exposing Google credentials
  or requiring a Laters service.
- Keep export local to the user's device unless they deliberately choose a destination through the
  browser or operating system.
- Define and test the handling of article URLs, titles, saved times, bookmarks and relevant sync
  state before release.

Import is deliberately not bundled into this release. The export format should make a later import
possible without promising it in `v0.6.0`.

## After `v0.6.0`

- Import is the next intended product slice.
- Dark mode follows Import.

Their exact version numbers, behaviour and acceptance criteria remain to be agreed when each becomes
the active slice. Folders, archive, analytics, a Laters backend and other exploratory ideas remain
outside this roadmap.
