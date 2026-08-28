# Roadmap

## Status

The accepted delivery roadmap includes an implemented and maintainer-accepted `v1.1.0` release for
optional CSV-supplied reading-time estimates. Release closure is authorised and final verification,
tagging and publication remain. The version sections below preserve the bounded delivery record:
completing one never silently authorised work from the next. Laters remains a local-first personal
tool with no Laters account, backend or public database. No later product slice is approved or
versioned.

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
two screenshots use only fictional `example.com`, `example.org` and `example.net` articles in an
isolated local preview; they contain no browser chrome, accounts, email addresses, tokens or real
reading-list content. The accepted public-readiness sequence was consolidated as the latest GitHub
release, tagged `v0.5.7` at exact verified commit `3d4f980`.

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

Status: released as `v0.6.0` from exact verified commit `60794b0`. The main menu creates a
user-initiated, versioned CSV with `url`, `title`, `created` and `tags` columns. Namespaced tags
preserve bookmark and deliberate title-edit state without exposing local identifiers, pending
operations, Drive metadata, credentials or connection information. **Download CSV** starts a normal
local browser download on every supported platform; whole-list export does not use the
operating-system share chooser. Automated verification and published macOS Chrome acceptance
passed. Import is outside this release.

## `v0.7.0` — Import

- Add an explicit, local CSV import beside Export in the main menu.
- Accept a compatible named-column CSV with required `url` and optional `title`, `created` and
  `tags`, including complete round-trip support for the version-1 Laters export.
- Validate the whole file, show a review and require confirmation before one atomic add-only merge.
- Skip exact canonical URL duplicates without overwriting existing user data.
- Queue ordinary add operations for the existing private Drive sync without uploading the CSV file.

Status: released as `v0.7.0` from exact verified commit `d13a08b` after published maintainer
acceptance. Import accepts at most 1,000 article rows and 10 MB,
reports ignored columns and unsupported tags, and blocks the whole file on invalid data. Google
Drive is refreshed before review when connected; a disconnected remembered connection produces a
clear local-only duplicate warning. Initial published acceptance identified that an older imported
article could remain hidden behind the open menu. The corrected candidate closes the menu and
reveals the first imported article while preserving its saved time and normal list order. A second
published Chrome acceptance showed that Ionic could reject dismissal while Import controls were
still disabled. The current correction restores those controls before dismissing on the next frame,
provides an explicit fallback and shows the package version in the menu. Published human acceptance
passed for update visibility, menu dismissal and revealing imported articles in their preserved
saved-time positions. The final visual correction restored the success mark from a downward-looking
chevron to an accepted unambiguous tick.

## `v0.8.0` — Dark mode

- Add System, Light and Dark choices at the bottom of the existing main menu, after Google Drive and
  Import and Export, with Experimental sync remaining first and System as the default.
- Keep the manual preference local to that browser and outside article storage, CSV files and Drive.
- Apply a token-based theme across the app, overlays, Privacy and Terms without changing layout,
  typography, motion or existing interactions.
- Update runtime browser theme colour while retaining the static light manifest launch background.

Status: implemented, published, maintainer-accepted and released as `v0.8.0` from exact verified
commit `5be7553`. The final menu hierarchy retains Experimental sync first and places Appearance at
the bottom. All 189 tests, type checking, build, privacy and dependency audits pass; release Pages
workflow `32963690674` passed. Reading-time estimates shown in exploratory handoff imagery are
explicitly outside this release, as are theme sync, scheduling, custom palettes and other product
additions.

## `v1.0.0` — Bookmark filter

- Add one subtle **Show bookmarks** action beside the existing list summary, changing to **Show all**
  in the filtered view. Do not add tabs, a toolbar, filter panel or another visually dominant area.
- Keep **Saved articles** as the default full newest-first queue. The temporary bookmarked view
  preserves that order and adds no stored preference or article state.
- Keep Paste available and preserve the accepted reveal behaviour for capture and Import. Existing
  bookmark, Delete/Undo, swipe, article-menu and URL-only sharing contracts remain unchanged.
- Add no IndexedDB migration, Drive or pending-operation behaviour, CSV field, network request,
  content fetching, account, backend or analytics.

Status: implemented, published, maintainer-accepted and released as `v1.0.0` from exact verified
commit `565cd59`. Candidate commit `3690512` passed Pages workflows `32967338184` and `32967338912`;
release workflow `32967914059` passed. All 195 tests across 29 files, type checking, build, privacy
and dependency audits pass. The detailed contract and evidence are in
[`bookmark-filter-plan.md`](planning/bookmark-filter-plan.md).

## After `v1.0.0`

Laters moved to a complete, maintenance-focused state after the accepted Bookmark filter release.
The maintainer later accepted one bounded `v1.1.0` compatibility slice: optional reading-time
estimates supplied in imported CSV files. Laters stores, syncs, exports and quietly displays a valid
estimate while every existing capture and CSV shape continues to work without one. Laters does not
fetch article content, calculate estimates, sort by time or add queue totals.

Grouping and tagging may be explored later but are not currently necessary, approved or versioned.
Folders, archive, analytics, a Laters backend and other exploratory ideas remain outside this
roadmap until separately defined.
