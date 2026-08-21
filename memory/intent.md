# Product intent

## Purpose

Provide an extremely simple personal read-later app that accepts shared article links on Android and keeps them available locally for later reading.

## Audience and value

The initial audience is one person using an Android phone. The app removes the overhead of a bookmarking or knowledge-management system: share an article to Laters, then open a short newest-first list and continue to the original page.

## Principles

- Keep the experience fast, minimal and focused on saving, opening and deleting links.
- Work as an installable PWA with Android Web Share Target support.
- Store saved items locally in IndexedDB and request persistent browser storage where supported.
- Keep storage access behind a small, explicit abstraction so a future storage mechanism can be introduced without coupling it to presentation code.
- Preserve accessibility, maintainability and proportionate resilience despite the deliberately small scope.
- Reach a useful personal MVP before considering expansion.

## Non-goals

- Backend services, cloud storage or cross-device sync.
- Authentication, accounts or multi-user support.
- Tags, folders or archive workflows.
- AI features, article summarisation or knowledge-management features.
- Saving or rendering full article content.
- A public multi-user product in the initial release.

## Assumptions and uncertainties

- Accepted: this is a rapid personal MVP focused on Android.
- Accepted: each item needs the original URL, a useful title, its saved time and a delete action.
- Accepted: the list is ordered newest first and opening an item navigates to the original URL.
- Assumed: the shared page title may be used when Android supplies it; fallback title behaviour remains to be decided.
- Unknown: supported Android browser and minimum browser version.
- Unknown: behaviour for duplicate URLs.
- Unknown: whether deletion needs confirmation or a short undo opportunity.
- Unknown: visual direction beyond a minimal, accessible interface.
