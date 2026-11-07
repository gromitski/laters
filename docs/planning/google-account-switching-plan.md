# Google account switching — 1.6.0

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

## User-visible contract

- Disconnect is available for an active or remembered/paused connection. It stops the local session,
  retains the list and its pending changes, forgets the connection hint and attempts Google
  revocation only when a live access token is available. Without one it explains local disconnection;
  Google Account permissions remain the explicit remote revocation path.
- Switch account opens Google's explicit account chooser. The chosen account's existing local
  list and queue are reused, or a separate empty local list is prepared before loading its Drive
  list. No articles or pending operations are carried automatically between accounts.
- The active list changes only after the selected account's initial sync and registry commit
  succeed. A cancelled/failed connection keeps the displayed list. A still-valid previous session
  is restored when possible; otherwise the previous list stays local and can be resumed.
- Initial adoption: older versions never recorded account identity. An unlinked non-empty list,
  including a pending-only queue, gets a one-time choice: **Open separate list** (focused default),
  **Link existing list**, or **Cancel**. Linking is deliberate adoption, and the copy explicitly says
  to choose the list's original account. Laters cannot infer the original account retroactively.
- The unlinked list remains available through **Open device-only list**. Disconnect keeps the
  current account's list on screen; switching back restores that account's local changes.
- Google displays the selected account. Laters adds no email/profile permission and stores no
  email address. Shared capture, CSV import/export and chat add-links target the active list.
- Switching resets transient Search/Bookmark/order state, ends Undo presentation and invalidates
  a prepared import. In-flight actions retain their original store; stale completions cannot
  update a new list. Other updated open windows reload after an active-list change, with a registry
  check on foreground as well. Unsaved input in those windows can be dismissed by that reload.
- Account partitioning is not a device security boundary: someone with access to the same browser
  profile can still view locally retained articles. Separate browser/OS profiles remain appropriate
  for people sharing a device.

## Implementation boundary

The original `laters` IndexedDB stays intact. A small separate IndexedDB registry records the active
database, the unlinked local database and account/list associations. Dedicated list databases use
the existing article and pending-operation stores unchanged. Adoption associates the original
database once, without copying, clearing or regenerating pending operations. Atomic registry
transactions and revision checks reject competing adoption or activation.

The account key is the opaque ID of `laters-connection.json` in the selected account's existing
hidden Drive app-data area. Resolve it before initialising any article sync. Ambiguous connection
files fail closed. No new Google permission, identity endpoint, Drive article format or sync
operation schema is needed. If that remote connection file is deleted/recreated, its new ID is
treated as a separate workspace; no old list is silently uploaded. Older local account databases
are retained, but automatic recovery of an orphaned association is outside this slice.

The page holds a fixed store for each in-flight operation/session and changes its active store
only after successful connection. Android's worker resolves the active database once per share
request; a share already underway remains in its original list. The registry and connection hints
are local metadata, excluded from CSV, Drive uploads and diagnostics. All access tokens remain
page-memory-only and are discarded on reload; routine Resume is unchanged by this feature.

## Verification and acceptance

- Focused tests cover original-list preservation; exact queue retention through adoption and return;
  independent articles/edits/bookmarks/deletions even with matching IDs; active share routing and
  in-flight capture isolation; retained device-only lists; persistent Disconnect; competing
  adoption/stale activation; prepared-but-failed connection; chooser prompt and ambiguous probes.
- Production-build browser checks use fictional articles and simulated Google responses on an
  isolated local origin. Real credentials/accounts and the maintainer's installed list are untouched.
- Run the complete existing test suite, type/build checks, dependency audits, repository/build
  privacy audits and attribution guards. Verify the published version through normal Update.
- Maintainer acceptance after publication: resume the original account and choose **Link existing
  list** only for that account; switch to the tested second account, confirm its one-link list;
  switch back and confirm the original list. Also check Disconnect after reopening and an Android
  share after switching. These real-account and physical-device checks remain owner acceptance.

## Technical verification — 2026-11-07

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

## Publication — 2026-11-07

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
