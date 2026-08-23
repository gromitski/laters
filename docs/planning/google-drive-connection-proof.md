# Google Drive connection proof

## Public-access blockers — resolve first

The OAuth support contact was changed to `hello@dustyb.in` on 2026-08-23 after its mailbox and
Google identity were confirmed. Temporary project access used to make the address selectable was
removed after the saved setting was verified.

1. Publish an accurate privacy policy.
2. Complete any required Google brand checks before changing the OAuth application from **Testing**.

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

## Production evidence

The connection proof was published from commit `c810476` on 2026-08-23. GitHub Actions run
`32641479949` passed its build and Pages deployment jobs, and the public origin served the matching
application bundle.

The initial Google consent flow then passed in Chrome using the sole configured OAuth test user.
Google presented only permission to see, create and delete Laters' own configuration data in Drive.
Laters created, updated and read back the private connection probe, reported success, and uploaded
no article data. All three pre-existing local articles remained present and unchanged.

After a full page reload, Laters displayed the remembered connection time. Reconnect required an
account choice but no repeat permission approval; the second private round trip passed and the same
three local articles again remained unchanged.

Physical Android acceptance then passed in the installed PWA. The maintainer completed the initial
connection, confirmed the local articles remained present, fully closed and reopened Laters, saw the
remembered connection state, reconnected without repeating the full permission warning, and safely
cancelled a subsequent connection attempt without affecting the reading list. This closes the
connection-only experiment's acceptance gates; it does not authorise article sync, public OAuth
access, a tag or a release.
