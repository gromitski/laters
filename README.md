# Laters

A minimal Android-first read-later PWA. Share an article to Laters, then return to a quiet local list when you have time to read it.

**Live app:** [laters.dustyb.in](https://laters.dustyb.in/)

## What it does

- Installs as a standalone PWA and appears in Android's Share menu.
- Stores links locally in IndexedDB, newest first.
- Opens the original article and supports accessible Delete and seven-second Undo actions.
- Keeps the application shell available offline and offers an explicit **Update** action for new versions.

There is no account, backend, analytics or sync. Publishing this source does not publish or connect anyone's saved list: every installation keeps its data in that browser. Clearing browser data may remove it.

## Development

```bash
npm ci
npm test
npm run build
npm run audit:public-build
```

See the completed [MVP definition](docs/mvp-definition.md), accepted [MVP 2.0 definition](docs/mvp-2-definition.md), [current project truth](memory/now.md) and remaining [exploratory future ideas](docs/future-ideas.md).

## Licence

Laters is released under the [MIT Licence](LICENSE). Bricolage Grotesque is distributed separately under the [SIL Open Font License 1.1](public/fonts/OFL.txt).
