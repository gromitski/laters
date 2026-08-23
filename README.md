# Laters

A minimal Android-first read-later PWA. Share an article to Laters, then return to a quiet local list when you have time to read it.

**Live app:** [laters.dustyb.in](https://laters.dustyb.in/)

## What it does

- Installs as a standalone PWA, offers **Install** when a supporting browser reports that installation
  is available, and appears in Android's Share menu.
- Adds copied or manually entered article URLs through a persistent **Paste a link** row, defaulting
  bare web addresses to HTTPS.
- Stores links locally in IndexedDB, newest first, with optional private Google Drive sync.
- Keeps Google Drive sync and Privacy in a bottom drawer opened from the top-right menu control.
- Shows Drive state on that control: pale green when connected, white while checking or sending,
  and pale red when disconnected or after a failed check.
- Provides persistent per-article bookmarks without changing queue order.
- Shows publisher favicons with deterministic local fallback tiles.
- Opens the original article from its title or other non-interactive row space.
- Renames an article title from the long-press menu without changing its saved URL.
- Shows a desktop-only **More actions** control for the same article menu while retaining right-click
  and keyboard access.
- Swipes right to Bookmark or Remove and left to reveal warning-red Delete.
- Opens a focused Read, Edit title, Bookmark, Share and Delete action sheet on touch long press.
- Shares only the original article URL through the system chooser, without adding the saved title
  or depending on a specific receiving app.
- Supports accessible visible controls and a seven-second in-place Undo without losing scroll position.
- Keeps the application shell available offline and offers an explicit **Update** action for new versions.

There is no Laters account, backend or analytics. Optional Google Drive sync stores the reading-list
base and immutable add, edit, restore and deletion records in Laters' private application-data
folder using the narrow `drive.appdata` permission. Connected devices combine those records and
check for changes every 20 seconds while Laters is visible. Publishing this source does not publish
or connect anyone's saved list. Without Drive, every installation remains local to that browser and
clearing browser data may remove it. Laters directly
attempts the conventional favicon on each saved publisher's origin; this can reveal the device IP
address and request timing to that publisher, but no central favicon service receives the reading
list or source domains. See the public [privacy policy](https://laters.dustyb.in/privacy/).

## Optional Google Drive sync

Google Drive sync is currently a private experiment: the OAuth app remains in Google's **Testing**
state and is not available as a general public sign-in. The rest of Laters remains fully usable
without it.

After a permitted user selects **Connect Google Drive** and approves the narrow permission, Laters
stores its sync files in Drive's hidden application-data area. It cannot browse or alter ordinary
Drive files. Local additions, edits, bookmarks, restores and deletions are journalled and exchanged
with other connected Laters installations. A visible connected app checks when it opens, returns to
the foreground or comes online, and every 20 seconds while it remains visible.

The Google access token is short lived and is held only in page memory, never persistent browser
storage. A reload, full close or expiry therefore leaves local changes waiting safely for **Resume
Google Drive**. **Disconnect** stops the live session and asks Google to revoke the active permission;
it does not delete existing hidden Drive data. This is visible-app sync, not OS background execution:
a closed or suspended PWA cannot promise polling. To avoid an ever-growing stockpile, Laters
automatically folds each 100 Drive changes into the current reading list and records exactly which
change files are covered. A later check adopts that settled checkpoint before removing those files,
so two open devices cannot clean from competing drafts. Interrupted cleanup does not block syncing
and is retried again later.

## Development

```bash
npm ci
npm test
npm run typecheck
npm run audit:repository-privacy
npm run build
npm run audit:public-build
```

See the completed [MVP definition](docs/mvp-definition.md), completed
[MVP 2.0 definition](docs/mvp-2-definition.md), [`v0.2.0` release record](docs/releases/v0.2.0.md),
[mobile interaction shell record](docs/planning/mobile-interaction-shell-plan.md),
[`v0.3.0` release record](docs/releases/v0.3.0.md),
[`v0.4.2` release record](docs/releases/v0.4.2.md),
[`v0.5.0` release record](docs/releases/v0.5.0.md),
[Google Drive live-sync record](docs/planning/google-drive-live-sync-plan.md),
[application-menu record](docs/planning/application-menu-drawer-plan.md),
[accepted roadmap through Export](docs/roadmap.md), [current project truth](memory/now.md) and
remaining [exploratory future ideas](docs/future-ideas.md).

## Licence

Laters is released under the [MIT Licence](LICENSE). Bricolage Grotesque is distributed separately under the [SIL Open Font License 1.1](public/fonts/OFL.txt).
