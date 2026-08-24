# Google Drive connection security

## Status

Implemented, published and accepted as the bounded `v0.5.2` slice. The maintainer reported the
desktop/Android connection-security behaviour working correctly on 2026-08-24. This prepares the
existing private Google Drive experiment for later public review but does not move OAuth out of
Testing or create a `v0.5.2` tag or GitHub release.

## User-visible contract

- Connecting still uses Google's permission screen and the narrow `drive.appdata` scope.
- Sync remains active while the current Laters page is open and the Google token is valid.
- Reloading or fully closing Laters discards the token. The reading list and queued local changes stay
  safe, and **Resume Google Drive** obtains another short-lived token.
- **Disconnect** stops sync locally before making the revocation request. A successful request also
  revokes the active Google permission.
- Disconnecting or revoking access does not delete existing Laters hidden application data in Drive.
  The privacy policy points to Drive's separate hidden-data deletion control.

## Security boundary

- Access tokens exist only in JavaScript memory and request headers. They are not written to local
  storage, IndexedDB, service-worker caches, Drive files, logs or repository content.
- Startup removes the legacy local-storage credential key used before `v0.5.2`.
- A restrictive meta Content Security Policy limits application scripts, frames and network requests
  to the app origin, the Google Identity service and the Google Drive API required by sync.
- A no-referrer policy prevents Laters URLs from being sent as referrer data.

GitHub Pages does not provide project-defined response headers, so this static deployment uses a
meta policy. Direct article and favicon requests remain deliberate existing behaviour; favicons are
restricted to HTTPS by the policy and continue to fall back locally on failure.

## Exclusions

- No Laters backend, account, refresh token or server-held credential.
- No public OAuth status or production Google project in this slice. Terms and acceptable-use
  wording were subsequently delivered in `v0.5.3`; code-only hardening followed in `v0.5.4`.
- No deletion of user Drive data during disconnect.

## Acceptance

- Focused tests prove expiry calculation does not accept or persist a token, legacy credential
  cleanup preserves unrelated preferences, and Google revocation success and failure are handled.
- Repository search and public-build audit find no committed or generated credential.
- The complete automated test, type, build, privacy and public-build gates pass.
- After publication, reconnect once on desktop and Android, confirm the green connected state, then
  test **Disconnect** on one device. A reload must show the white/red disconnected state and require
  **Resume Google Drive** before changes sync again.
- The maintainer completed the published check and reported the resulting behaviour working
  correctly on 2026-08-24, closing the physical acceptance gate.
