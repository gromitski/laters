# Product intent

## Purpose

Provide an extremely simple personal read-later app that accepts shared article links on Android and keeps them available locally for later reading.

## Audience and value

The initial audience is one person using an Android phone. The app removes the overhead of a bookmarking or knowledge-management system: share an article to Laters, then open a short newest-first list and continue to the original page.

The core job is intentionally narrow: capture a link at the moment it is discovered without interrupting the current activity, then make that small queue easy to consume or clear later. Success is fewer interesting articles being lost without creating a second organisational system to maintain.

## Principles

- Keep the experience fast, minimal and focused on saving, opening and deleting links.
- Work as an installable PWA with Android Web Share Target support.
- Store saved items locally in IndexedDB and request persistent browser storage where supported.
- Keep storage access behind a small, explicit abstraction so a future storage mechanism can be introduced without coupling it to presentation code.
- Make the local-only retention model honest: browser storage can be cleared or evicted and the MVP offers no backup.
- Keep the application shell usable offline while treating original articles as external network destinations.
- Preserve accessibility, maintainability and proportionate resilience despite the deliberately small scope.
- Reach a useful personal MVP before considering expansion.

## Non-goals

- Backend services, cloud storage or cross-device sync.
- Authentication, accounts or multi-user support.
- Tags, folders or archive workflows.
- AI features, article summarisation or knowledge-management features.
- Saving or rendering full article content.
- Analytics, advertising or transmitting the reading list to third parties.
- Import, export and backup in the initial release.
- A public multi-user product in the initial release.

## Assumptions and uncertainties

- Accepted: this is a rapid personal MVP focused on Android.
- Accepted: each item needs the original URL, a useful title, its saved time and a delete action.
- Accepted: the list is ordered newest first and opening an item navigates to the original URL.
- Accepted: saved-item data remains on the device and IndexedDB is its initial source of truth.
- Accepted: Web Share Target input is untrusted and only valid HTTP or HTTPS article URLs may be saved.
- Accepted: the app shell may work offline, but Laters does not make external articles available offline.
- Assumed: the shared page title may be used when Android supplies it; fallback title behaviour remains to be decided.
- Unknown: supported Android browser and minimum browser version.
- Unknown: behaviour for duplicate URLs.
- Unknown: whether deletion needs confirmation or a short undo opportunity.
- Unknown: visual direction beyond a minimal, accessible interface.
- Unknown: what screen or acknowledgement should follow a successful Android share.
- Unknown: whether saved times update continuously or when the list is rendered or revisited.

Detailed MVP behaviour, acceptance criteria and delivery slices live in `docs/mvp-definition.md`.
