# Laters

A minimal Android-first read-later PWA. Share an article to Laters, then return to a quiet local list when you have time to read it.

**Live app:** [laters.dustyb.in](https://laters.dustyb.in/)

## What it does

- Installs as a standalone PWA and appears in Android's Share menu.
- Stores links locally in IndexedDB, newest first.
- Provides persistent per-article bookmarks without changing queue order.
- Shows publisher favicons with deterministic local fallback tiles.
- Opens the original article from its title or other non-interactive row space.
- Supports accessible Delete and seven-second Undo actions.
- Keeps the application shell available offline and offers an explicit **Update** action for new versions.

There is no account, backend, analytics or sync. Publishing this source does not publish or connect
anyone's saved list: every installation keeps its data in that browser. Clearing browser data may
remove it. Laters directly attempts the conventional favicon on each saved publisher's origin; this
can reveal the device IP address and request timing to that publisher, but no central favicon service
receives the reading list or source domains.

## Development

```bash
npm ci
npm test
npm run build
npm run audit:public-build
```

See the completed [MVP definition](docs/mvp-definition.md), completed
[MVP 2.0 definition](docs/mvp-2-definition.md), [`v0.2.0` release record](docs/releases/v0.2.0.md),
[current project truth](memory/now.md) and remaining [exploratory future ideas](docs/future-ideas.md).

## Licence

Laters is released under the [MIT Licence](LICENSE). Bricolage Grotesque is distributed separately under the [SIL Open Font License 1.1](public/fonts/OFL.txt).
