# Current project truth

## Purpose

Track the current state and next safe action for the Laters personal read-later PWA.

## Lifecycle

Slices 1 and 2 implemented; Slice 1 is published and Slice 2 awaits maintainer review.

## What exists now

- The committed AI Project Foundation baseline and local no-AI-attribution guards.
- Canonical product intent in `memory/intent.md`.
- Detailed MVP behaviour, acceptance criteria and delivery slices in `docs/mvp-definition.md`.
- The original idea archived in `evidence/origin/2026-08-21-origin.md`.
- A framework-free TypeScript application built with Vite 8.
- A small `ReadingListStore` contract with a native IndexedDB implementation.
- An accessible responsive reading list with newest-first ordering, original-link opening, immediate deletion and clear empty, success and failure states.
- Focused automated tests for input validation, saved-time formatting, IndexedDB persistence, deterministic ordering and deletion.
- A complete installable-PWA manifest with 192px and 512px app icons.
- A precaching service worker that serves the application shell offline.
- A `POST` Android Web Share Target that validates shared data, supports URLs embedded in Android's text field, saves through the existing IndexedDB boundary and redirects to an accessible result state.
- No deployment configuration or live HTTPS environment yet.

## Active focus

Review and accept Slice 2 before deployment selection or persistent-storage hardening.

## Active slice

Slice 2 is implemented and locally verified but not committed.

## Blockers

None.

## Uncertainties

- A minimum Chrome for Android version is not yet evidenced.
- Duplicate-save and delete-recovery behaviour are undecided.
- Android Share-menu registration and capture still need acceptance on an installed HTTPS build on a physical device.
- The current PWA plugin emits a known upstream Vite 8 deprecation warning from its internal service-worker build configuration; the production build remains verified.

## Next safe action

Review and commit Slice 2 if accepted. Then select an explicitly authorised HTTPS hosting route so the PWA can be installed for real-device Android acceptance; deployment is not yet authorised. Persistent-storage requesting and final resilience checks remain Slice 3.

## Last meaningful update

2026-08-22 — Slice 1 published. Slice 2 implemented with an installable manifest, offline shell and POST Android share capture; 24 automated tests, production build and offline browser reload passed.

## Pointers

- [Working agreements](agreements.md)
- [Product intent](intent.md)
- [Original project idea](../evidence/origin/2026-08-21-origin.md)
- [MVP definition](../docs/mvp-definition.md)
