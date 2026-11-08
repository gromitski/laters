# Google Drive sync — product interaction contract (1.6.3)

## Authority and product standard

On 2026-11-08 the maintainer approved one coherent correction after the usability reassessment:
remove Switch account; show Disconnect only when actually connected; make Disconnect stop syncing
on this device without revoking provider permission; keep every account's list entirely separate.
The maintainer explicitly states that usability is everything, Laters is a product being given away,
and their reputation depends on it. It is no longer experimental. These are acceptance requirements,
not optional presentation preferences. The working agreements carry the durable product policy.

This is a bounded complete correction, candidate **1.6.3**, with end-of-slice publication authorised
under the standing agreement. No new provider, scope, credential persistence, backend, billing,
tag or GitHub release is included. Historical 1.6.0–1.6.2 records and rejected designs are preserved
in [delivery evidence](../../evidence/delivery/google-drive-usability-1.6.0-1.6.2.md); they do not
override this contract. The maintainer's renewed explicit agreement ends the prior reassessment pause.

## Complete user journey

| Situation | Primary control | Disconnect | Expected outcome |
| --- | --- | --- | --- |
| First visit / no connection | Connect Google Drive | Hidden | Google account chooser, then only that account's list. |
| Reopen / remembered account but no live permission | Connect Google Drive | Hidden | Same chooser; local articles and pending changes remain intact. |
| Asking Google for permission | Connecting… (disabled) | Hidden | No premature account controls; cancellation returns to Connect. |
| First list load after permission | Syncing… (disabled) | Hidden | Become connected only after the account's list has loaded successfully. |
| Connected and up to date | Sync now | Visible | Manual sync uses the current session, without another Google login. |
| Connected and syncing | Syncing… (disabled) | Visible | Connection remains active; Disconnect can stop the ongoing sync. |
| Temporary network/server failure, permission valid | Retry sync | Visible | Retry using the same account/session. |
| Offline, live connection retained | Sync now / Retry sync (disabled) | Visible | Clear Offline status; save locally and sync when online. Disconnect works locally. |
| Offline, no active connection | Connect Google Drive (disabled) | Hidden | Clear Offline status; articles stay usable locally. |
| Permission expires / is rejected | Connect Google Drive | Hidden | Stop polling and requests; preserve local changes for that same account. |
| Disconnecting locally | Disconnecting… briefly (disabled) | Hidden immediately | Abort this installation's work and return to Connect. |
| Cancelled or failed connection | Connect Google Drive | Hidden | Keep the previous local list; no partial active connection or stuck busy controls. |

The menu section is **Sync**, headed Google Drive. There is no Switch account, Resume, Reconnect,
linking/adoption question or device-only list mode. To choose another account, Disconnect → Connect.
The chooser is explicit on every connection. A stored account association is never an active
connection and cannot cause a Disconnect button to appear.

## Local Disconnect and cancellation

- Disconnect clears the page's credential, stops polling/expiry timers and aborts ongoing Drive
  requests. Every later request on that old session is refused. Already-sent requests may have
  reached Google; Disconnect cannot undo a server-confirmed operation. Immutable operation IDs
  retain safe retry behaviour.
- It does not call Google's revoke API, delete Drive files, clear local articles, remove pending
  operations, erase an account/list association or affect another device's Google permission.
- Other open Laters windows in the same browser profile receive the local disconnect signal and
  stop their sessions too. A late Google popup callback cannot silently restart sync. Other browser
  profiles/installations are independent; this is not an account-wide sign-out.
- Full provider-permission revocation is a separate deliberate action in Google Account permissions,
  linked from the privacy policy. It is not part of routine Disconnect or changing accounts.

## Account and data safety

Each account continues to have its own IndexedDB articles and pending-operation store, selected
using its opaque private Drive connection-file ID. New accounts never adopt an unassigned list.
Selecting A, then B, then A restores A's list and only A's queued changes. Existing 1.6.0 associations
remain readable; older unassigned data stays in its separate local recovery backup. CSV/import,
chat add-links and Android shares keep their established active-list boundaries. Neither Disconnect
nor Connect exports, copies or merges another account's list. No new email/profile permission.

Failure and cancellation leave the currently displayed local list intact. The active list changes
only after the selected account's initial sync and registry activation succeed. Cancellation,
expiry and other-window signals invalidate pending connection attempts, so stale callbacks cannot
replace a later state. Access tokens remain in page memory only; reload/close still requires Connect.
This slice does not introduce durable sign-in or promise OS background sync while the app is closed.

## Implementation and verification

A small control presenter takes only current connection validity, connectivity and activity.
Stored history is deliberately absent from its inputs. Focused tests cover first/reopened/expired,
authorising/loading, active/syncing/retry, offline and disconnect/cancel transitions. The new
abortable request boundary is used by the probe, initial load and every subsequent sync. Tests
verify cancellation of an in-flight request and refusal to start a later one. Existing isolation,
queue retention, import and capture tests remain required.

Before publication, exercise the full table using the production build with fictional accounts:
first and remembered visits, cancelled/failed login, manual/automatic sync, network errors,
permission rejection/expiry, offline use, local Disconnect during a running request, other open
windows, ignored late callbacks, A/B/A with queued changes, and reconnect/reopen. Assert zero
provider revocation calls and no upload to the wrong account. Verify keyboard controls and narrow
layout where the browser permits, and record actual dimensions rather than assuming emulation.

Run the repository's test/type/build, dependency, public/repository privacy and attribution gates.
Verify the published assets and normal Update/version with an existing fictional local article.
Keep technical and simulated-provider evidence distinct from real-account and physical Android
acceptance. Do not equate removal of experimental wording with proof that every device scenario
has passed. No maintainer credential or reading list is to be used in automated fixtures.

## Status

Candidate **1.6.3** passes **288 tests in 37 files**, TypeScript/build and the public-build,
repository-privacy and attribution checks. Production dependencies have zero audit findings.
The production build was exercised in isolated browser profiles with fictional provider responses:

- A remembered legacy installation showed only Connect; authorising and initial loading kept
  Disconnect hidden. Cancel and initial connection failure returned to usable Connect.
- Connected manual sync showed Syncing… with Disconnect available; temporary failure showed
  Retry sync without another Google login; rejected permission and timed expiry returned to Connect.
- Offline before connection disabled Connect; returning online enabled it. Offline while connected
  retained local Disconnect. An offline bookmark queued for A uploaded only after returning to A,
  with B's remote queue empty and its own article intact. Older unassigned data was not uploaded.
- A → B → A restored the correct articles and bookmark. Reopening retained A's local list and
  presented Connect only, without requesting Google permission automatically.
- Disconnect during a delayed request aborted it. Another same-profile window also aborted and
  made no later requests during the observation interval (more than one polling period). A stale
  Google popup callback after the other window disconnected made zero Drive requests.
- Provider revocation calls remained zero. Actual maintainer accounts and articles were untouched.

The README screenshot is captured from the actual built UI with fictional saved data and a
collapsed fixture panel. It shows the disconnected state without premature controls. Desktop
browser verification does not establish physical Android, narrow-screen, keyboard or real-provider
acceptance; those remain explicit limits. Existing semantic buttons/focus styles are retained.
Publication and normal Update receipt pending. No tag/release is authorised. The agreed contract
requires no further design confirmation.
