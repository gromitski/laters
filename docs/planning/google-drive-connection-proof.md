# Google Drive connection proof

## Public-access blockers — resolve first

1. Replace the temporary test-only OAuth support contact with `hello@dustyb.in`.
2. Confirm that the public support mailbox works and publish an accurate privacy policy.
3. Complete any required Google brand checks before changing the OAuth application from **Testing**.

## Status

Accepted as a private, connection-only experiment. This is not an accepted article-sync feature or
release number.

## User-visible result

Laters offers an **Experimental sync** card with **Connect Google Drive**. The maintainer can approve
the narrow Google permission and verify that Laters can create, update and read its own private
application-data file. The card states explicitly that articles remain local.

## Included

- Google Drive only, through the browser-only Google Identity Services token flow.
- The non-sensitive `drive.appdata` scope only.
- One hidden `laters-connection.json` probe containing only a schema version and connection time.
- Testing-mode OAuth access restricted to the maintainer's Google account.
- A remembered local timestamp for the last successful connection test; no token is persisted.
- Clear local-only, connecting, connected, cancelled, blocked-popup and unavailable states.

## Excluded

- Article URLs, titles, saved times, bookmarks or deletion state in Google Drive.
- Moving the source of truth away from IndexedDB.
- Merge, overwrite, conflict or deletion rules.
- Background sync, refresh tokens or a Laters backend.
- Dropbox, OneDrive, arbitrary URLs, Sheets or a general provider framework.
- Public OAuth access, brand verification or a release number.

## Privacy, security and compatibility

Google's identity script is requested only after deliberate activation of **Connect Google Drive**.
The access token stays in memory for the active connection attempt and is not written to IndexedDB,
local storage or the repository. The OAuth client ID is public by design; the generated client secret
is unused and must never enter the repository or public build. Existing saved articles and database
schema remain unchanged.

## Acceptance

- Automation proves the exact scope and the connection-only upload payload.
- The normal test, type-check, build, public-build and dependency gates pass.
- A clean browser proves that local article data remains intact before and after connection.
- Physical Android testing records the initial consent flow, successful private round trip, safe
  cancellation, closing/reopening behaviour and the real reconnection experience.
