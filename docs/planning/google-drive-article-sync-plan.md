# Google Drive article sync

> Historical snapshot-sync record. The accepted
> [Google Drive live-sync plan](google-drive-live-sync-plan.md) supersedes its source-of-truth,
> token-persistence, merge and polling rules without changing the private OAuth Testing boundary.

## Status

Implemented and accepted for private testing on 2026-08-23. OAuth remains in Google's **Testing**
publishing state with only the maintainer admitted. This slice does not authorise a tag, release or
public OAuth access.

## Source-of-truth contract

- Laters continues to work entirely from IndexedDB without Google Drive.
- Sync uses one hidden `laters-reading-list.json` file in Laters' `appDataFolder`, alongside the
  existing `laters-connection.json` probe.
- If no Drive reading-list file exists, first connection uploads the complete local list.
- If the Drive file exists, its complete valid snapshot atomically replaces the local list.
- While connected, each successful add, re-save, title edit, bookmark change, delete or Undo queues
  the latest complete local snapshot for Drive.
- Snapshot writes are serialized and pending changes collapse to the newest version so an older
  request cannot finish after and overwrite a newer request.
- If an upload fails, the local change remains and the app clearly warns that Drive is older.
- Access tokens and Drive file identifiers remain in memory only. Closing the app requires a new
  connection; the existing Drive snapshot is then authoritative again.
- There is no item merge, conflict resolution or background refresh in this slice.

## Stored Drive data

The article file contains schema version `1`, an ISO update time and the complete list. Each article
contains its existing local identifier, canonical HTTP(S) URL, title, numeric saved time, optional
bookmark state and optional title-edit marker. The reader rejects unsupported schemas, malformed
articles, duplicate identifiers or URLs, multiple matching files, more than 10,000 articles, or a
snapshot larger than 5 MiB before replacing local data. The initial metadata and content are created
in one multipart upload so a failed first write cannot leave an empty snapshot file behind.

## Destructive boundary

Choosing **Connect Google Drive** states before authorisation that an existing Drive list replaces
the browser list. The accepted private-test flow applies that rule directly without a second merge
or confirmation screen. A failed or invalid Drive read never clears local data. Replacement uses one
IndexedDB transaction and happens only after the complete remote snapshot passes validation.

## Privacy and repository safety

The public app copy, privacy policy and README must disclose article upload before deployment. The
OAuth scope remains only `drive.appdata`; the client secret remains unused and absent. A repeatable
repository audit checks tracked text for common credentials, private paths, private network
addresses and unapproved emails, and checks the current commit uses the privacy-safe GitHub noreply
identity.

The repository-history review found one real-name author entry on the initial Laters commit. The
maintainer explicitly accepted leaving that legacy metadata unchanged because rewriting published
history would invalidate existing commits, tags and records. The new audit protects current and
future work rather than rewriting history.

## Excluded

- Merge rules, per-item conflict decisions, tombstones or remote change polling.
- Refresh tokens, background sync, a Laters backend or account system.
- User-selected Drive folders, ordinary Drive files, Dropbox, OneDrive, Sheets or arbitrary URLs.
- Public OAuth publication, verification changes, a release number or a claim of multi-device
  acceptance before it is physically tested.

## Acceptance

- Unit tests cover first upload, Drive-authoritative loading, invalid data, atomic local replacement,
  serialized latest-wins writes, upload failure and retry.
- All tests, type checking, production build, repository privacy audit, public-build audit,
  dependency audit and attribution checks pass.
- Browser acceptance confirms the pre-connect warning, initial local upload, remote replacement,
  add/edit/bookmark/delete/Undo uploads, failure copy and local-only operation.
- Cross-device Android acceptance confirms that a change saved from one connected device becomes the
  complete list after reconnecting the other, with no merge implied.

## Production evidence

Commit `147390c` was deployed by GitHub Actions run `32649721658`; its build and Pages jobs passed,
including 106 automated tests, the repository privacy audit, production build and public-build
audit. The live homepage served the matching `index-Bf8gx-Ch.js` application bundle and the updated
privacy policy before article sync was exercised.

The Android device then created the first authoritative snapshot by uploading 17 articles. A Chrome
installation with three different local items reconnected and replaced them with the same 17-item
Drive snapshot. Chrome changed one existing bookmark and reported **Up to date in Google Drive**;
after reconnecting, Android loaded 17 articles and showed the changed bookmark. Chrome restored the
bookmark, uploaded the restored snapshot, and a final Android reconnect loaded 17 articles with the
original bookmark state. No article titles, URLs or Google account details are recorded in this
repository evidence.
