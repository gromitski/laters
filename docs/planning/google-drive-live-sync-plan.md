# Google Drive live sync

## Status

Implemented, released in `v0.5.0` and accepted for private maintainer use on 2026-08-23. OAuth
remains in Google's **Testing** state; the release does not authorise public OAuth access. Automated
and browser gates pass. The maintainer subsequently completed and accepted the physical
phone/desktop add, delete and Undo propagation sequence.

## Product contract

- A local add, duplicate capture, title edit, bookmark change, delete or Undo is visible immediately
  and records an atomic pending sync operation in IndexedDB.
- When a valid Google token is available, pending operations upload immediately as immutable hidden
  Drive operation files. Devices never overwrite one another's operation files.
- Every visible connected app checks Drive every 20 seconds, and immediately after opening,
  reconnecting, returning to the foreground or regaining connectivity.
- Each check downloads unseen operations, replays them over the original Drive snapshot, replaces
  the local visible list and updates the interface.
- Additions are combined. A delete operation hides the matching article on every device and remains
  as its durable tombstone. Ordinary stale edits cannot revive it. Undo is an explicit restore.
- Re-adding a previously deleted URL after a device has received the deletion creates a new article
  identifier, so it is an intentional new addition rather than a resurrection.
- Exact duplicate URL capture on a stale device is an update, not a restore, so a remote deletion
  still wins.

## Authorization and cold starts

The narrow `drive.appdata` access token is stored on the device only until Google's returned expiry
time, with a safety margin. This lets a Share-target page reload or a recently closed PWA resume sync
without another account choice. It is removed when expired or rejected. When no valid token exists,
local operations remain visibly **Waiting to sync** and one deliberate Google action resumes them.

This is not indefinite background authorization. A fully unattended refresh token would require a
backend. While the PWA is closed or suspended, exact polling intervals are not promised.

## Drive files and cleanup

- `laters-reading-list.json` remains the compact base snapshot and keeps the accepted 17-item state
  compatible during migration.
- Each mutation uses one immutable `laters-operation-<uuid>.json` file containing only its operation
  identifier, type, occurrence time, affected article identifier and the existing article fields
  required for an add, update or restore.
- A successfully uploaded pending operation is removed from the local pending queue. Failed uploads
  remain queued.
- Remote tombstones and operation files are intentionally retained in this slice; deleting them
  without a safe compaction boundary could resurrect data on an old device. A later compactor may
  fold acknowledged operations into a new base snapshot and delete only the exact folded files.
  Until that exists, retention is cleanup safety, not an accidental leak.
- The app caps operation counts and file sizes and reports rather than silently discarding data when
  those limits are reached.

## Conflict rules

- Operations sort by occurrence time and then unique operation identifier for deterministic replay.
- Delete wins over ordinary updates for the same article.
- Only an explicit restore can remove a deletion tombstone for the same identifier.
- Title or bookmark changes on an active article use the last replayed update.
- Immutable per-operation files prevent simultaneous device uploads from erasing each other. Device
  clock differences can affect the order of competing edits, but cannot make a normal update defeat
  a deletion.

## Acceptance

- Automated tests cover atomic local journalling, pending-operation persistence and removal,
  deterministic add/update/delete/restore replay, immutable Drive uploads, unseen-operation polling,
  token expiry and serialized sync checks.
- Existing 17-article Drive data loads without migration loss.
- Android cold Share capture uploads when authorization remains valid and waits safely when it does
  not.
- Phone and desktop additions and deletions reach the other visible device on its next check.
- All existing interaction, sharing, storage, privacy, build and repository-security gates pass.

## Implementation and production evidence

Commit `1b4be42` implemented the immutable-operation live-sync model and was deployed by GitHub
Actions run `32652077562`. Its automated tests, typecheck, repository privacy audit, production build
and public-build audit passed. The maintainer connected phone and desktop installations and confirmed
that the live-sync connection was working.

The top-right application menu and three-state Drive indicator were deployed separately in
`2a8e329` and `4cc5c0b`. Their presentation correction was deployed in `6146e96`; it reserves desktop
scrollbar space, suppresses pointer-restored outlines and retains visible keyboard focus. See the
[application-menu record](application-menu-drawer-plan.md).

After `v0.5.0` publication, the maintainer completed the documented Android/desktop sequence and
confirmed additions, deletions and Undo restores remained aligned across both visible installations.
This closes the physical multi-device acceptance gate. Token expiry, rejected-credential cleanup and
failed-upload retention remain deterministic automated checks rather than claims that those failure
conditions were manually forced.
