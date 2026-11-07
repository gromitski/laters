# Google account switching — 1.6.1

## Authority and evidence

On 2026-11-07 the maintainer reported a successful second-account test: connect in an incognito
window, add and sync one link, close the window, verify the normal account was unaffected, reopen
incognito, reconnect the second account and retrieve the single link. This is maintainer evidence
for independent accounts and durable Drive storage, not independent-user usability or Android
acceptance of account switching.

The maintainer then authorised fixing the missing Disconnect button and easy account switching
without mixing reading lists. This is a complete bounded compatible feature candidate, **1.6.0**.
End-of-slice verification, commit and push to main follow the standing working agreement. No tag,
release, additional provider, backend, billing, Google scope or persistent credential is authorised.

## Current decision — 1.6.1, 2026-11-07

The maintainer rejected the published `1.6.0` adoption question as unusable. A proposed simpler
confirmation was also rejected, followed by the explicit instruction: keep lists entirely separate
with their accounts. This provides agreement for the bounded correction after reassessing the
failed interaction. The first-adoption design below is historical, not accepted current behaviour.

## User-visible contract

- **Connect Google Drive** or **Switch account** → choose a Google account → its own list opens.
  There is no linking, adoption, merge or separate-list question and no device-only mode control.
- Every new account starts with a separate local database before its Drive list loads. Never seed
  it with the device's old unassigned list or queue. Existing account associations created by
  `1.6.0` remain valid, so already-bound lists and pending operations remain with their account.
- Disconnect remains available for an active or remembered/paused connection. It stops local sync,
  retains the current account's local list and queue, forgets the connection hint and attempts Google
  revocation only if a live access token is available. Google Account permissions remain the remote
  revocation route when no live token is available.
- Switching back opens that account's local list and resumes only its own queued changes. Failed
  or cancelled switching keeps the displayed list and restores a still-valid previous session
  when possible. The active list changes only after successful sync and an atomic registry commit.
- Older unassigned articles and operations remain on the device as a separate backup and are never
  uploaded into an account. A collapsed **Previous local backup** under Import/export offers a
  recovery CSV of those articles when the backup is non-empty. It does not open, link or activate
  a list. CSV excludes pending operations; those stay retained locally and are not automatically
  replayed, including old deletions. Recovering a particular unsynced change is a separate deliberate
  recovery action, not part of normal Connect or Switch.
- Google displays the selected account. No email/profile permission, persistent credential, backend,
  provider expansion, billing or tag/release is included. Access tokens remain page-memory-only.
- Android sharing and accepted chat/CSV imports target the active account list. Switching resets
  transient views, Undo presentation and prepared imports; stale completions retain their original
  store and cannot update the new list. Other updated windows reload after a different list becomes
  active and check the registry on foreground. Unsaved input can be dismissed by that reload.
- Local account separation is not a device security boundary: someone with the same browser profile
  can view locally retained articles. Separate OS/browser profiles remain appropriate for shared devices.

## Implementation boundary

A small separate IndexedDB registry records the active database, the retained unassigned database
and account/list associations. Each account uses the existing article and pending-operation stores
in its own database. There is no new adoption API; registering an unknown account always creates
its own database. Atomic registry transactions/revisions reject competing creation or activation.
Existing `1.6.0` metadata remains readable without a schema migration or data deletion.

The account key is the opaque ID of `laters-connection.json` in that account's existing hidden Drive
app-data area, resolved before article sync. Ambiguous probes fail closed. No new identity endpoint,
Google scope, article file format or operation schema is needed. If the connection file is deleted
and recreated, its new ID is treated separately; previous local data is retained and never uploaded
silently. Automatic recovery of orphaned associations remains outside this slice.

Each in-flight operation/session keeps its original store. Android's worker resolves the active
store once per share request; an already-running share stays in its original list. The registry,
backup association and connection hints stay outside Drive uploads, CSV and diagnostics.

## Verification and acceptance

- Verify strict isolation with a populated unassigned list and queue: both newly chosen accounts
  must start independently, and neither may receive an old article or operation. Preserve exact
  account-specific queues and the backup, including compatibility with existing `1.6.0` associations.
- Preserve the existing tests for edits/bookmarks/deletions with matching IDs, capture isolation,
  persistent Disconnect, competing registry changes, cancellation/failure and explicit Google chooser.
- Browser-check direct A → B → A with no list question, retained backup download and normal Update.
  Use fictional articles and simulated Google responses; do not touch maintainer credentials/data.
- Run the existing test/build, dependency, privacy and attribution checks. Publish under the standing
  end-of-slice agreement, then ask for direct real-account switching and Android sharing acceptance.

## Historical 1.6.0 technical verification — 2026-11-07

- 282 tests across 36 files pass, including the ten added isolation/chooser/probe cases.
- Type checking, production build, repository privacy, public-build privacy and attribution self-tests pass.
- Dependency gate passes: 3 low and 7 moderate development findings; production dependencies have zero findings. No dependency upgrades were included.
- Isolated production-build UI checks pass: paused Disconnect after reopening; legacy adoption;
  A → B → A with an unsent A addition retained and uploaded only to A; B-only additions; cancellation
  and network failure with the previous valid connection retained; another window reloading onto
  the newly active list; cancellation of initial adoption; opening a separate empty account list
  and returning to the retained device-only list; reviewed CSV import into that list.
- Browser inspection used a desktop viewport. The browser viewport override did not alter its actual
  dimensions, so a narrow-screen rendering check is not claimed. Physical Android acceptance remains.
- No real Google authorisation, permission revocation or maintainer reading-list mutation was performed.

## Historical 1.6.0 publication — 2026-11-07

Implementation commit `8dd4c284636c4dbfd1d34223dfba99ee9b564352` was pushed to main and passed
[Pages workflow 42413892504](https://github.com/gromitski/laters/actions/runs/42413892504).
The published HTML, both application JavaScript assets, CSS, service worker and privacy page match
the local production build byte for byte. On an isolated public-origin browser installation,
the normal **Update** action advanced the menu from **Version 1.5.0** to **Version 1.6.0** while
retaining its existing single fictional article and metadata.

Documentation, canonical project memory and the public privacy policy are updated. No tag or
GitHub release was created. The earlier incognito round trip is maintainer-reported evidence for
the previous connection flow; real-account switching and physical Android acceptance of this
new feature remain pending. No maintainer account was connected or modified during agent checks.

## 1.6.1 correction status

Implementation passes 283 tests across 36 files, type/build, repository/public-build privacy,
attribution self-tests and the dependency gate (3 low/7 moderate development findings; zero
production findings). An isolated production-build browser test started with an old unassigned
article and queued addition: account A opened empty, account B opened its one remote article,
and switching back opened A empty again. No list question appeared and neither account received
an upload. The local recovery CSV contained only the old unassigned article, which remained outside
both account lists. Paused Disconnect and the simplified menu were also observed.

Implementation `c156989b0134548bea114a56bc621b9989ff7a73` was pushed to main and passed
[Pages workflow 42414882856](https://github.com/gromitski/laters/actions/runs/42414882856).
Published HTML, application JavaScript, CSS, service worker and privacy page match the tested build
byte for byte; the rejected list-association controls are absent. Normal **Update** on the isolated
public-origin installation advanced **Version 1.6.0** to **Version 1.6.1**, preserving its single
existing fictional article and metadata.

The rejected `1.6.0` historical technical receipts do not establish product acceptance. Real-account
switching and Android acceptance of `1.6.1` remain pending. No tag or GitHub release was created.
