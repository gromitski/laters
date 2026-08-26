# `v0.8.0` dark mode plan

## Product contract

`v0.8.0` adds an **Appearance** control to the bottom of the existing main menu, after Google Drive
and Import and Export, with three choices: **System**, **Light** and **Dark**. Experimental Google
Drive sync remains the first menu section. System is the default. A manual choice applies
immediately and is retained only in that browser. It is not synced through Google Drive or included
in CSV Import or Export.

The effective theme covers the reading list, application menu, article action sheet, title dialog,
status and error presentation, Privacy and Terms. It changes colour only: layout, typography,
spacing, motion and the existing interaction contracts remain unchanged.

## Theme system

The accepted light identity remains the current white, ink and lime palette. Dark mode maps the
same semantic tokens to a `#101014` canvas, near-white text, muted lavender-grey metadata and
darkened status surfaces. Lime and danger action fills retain dark `#101014` content. Publisher
fallback colours remain stable, letter tiles gain a subtle inset edge, and favicon plates remain
white.

A small same-origin bootstrap reads `laters-theme-preference` before the visible shell is shown,
resolves System with `prefers-color-scheme`, sets the effective `data-theme` and updates the browser
theme colour. The application controller then owns the accessible menu radio group, immediate
changes and live operating-system changes while System is selected. Storage failure leaves System
as the next-launch default while still applying a manual choice for the current session.

The web-app manifest keeps its static white launch background. Runtime application and browser
chrome follow the effective theme, but a per-user installed-app launch splash cannot be represented
reliably by one static manifest.

## Privacy and compatibility

The preference contains only `system`, `light` or `dark`. Theme selection reads or writes no
article, IndexedDB, sync-queue, Google credential, account, connection or Drive state. No network
request is introduced. Existing stored articles, CSV files, private Drive files and service-worker
update behaviour remain compatible.

This release adds no reading-time data, theme syncing, scheduled switching, custom palette,
OLED-specific theme, content fetching, icon redesign, layout change, backend, account, analytics,
folders or archive.

## Acceptance

- The menu exposes one labelled radio group with System, Light and Dark choices and full keyboard
  operation.
- System resolves the operating-system preference and reacts to changes while selected; Light and
  Dark override it immediately and persist across reloads.
- Invalid, absent or inaccessible local preference data safely resolves to System.
- The application, Ionic overlays, status states, Privacy, Terms and runtime browser theme colour
  use the effective theme without changing application data.
- Focus, text, controls and status states meet WCAG AA contrast; reduced-motion behaviour remains
  unchanged.
- Existing interaction tests, the focused theme tests, type checking, production build, service
  worker generation, privacy audits, dependency audits and no-attribution checks pass.
- Published acceptance covers macOS browser switching and persistence plus the installed Android
  update path, menu, list, overlays and documented static launch-splash boundary.

## Candidate verification

All 189 automated tests pass across 28 files, including six focused preference tests. Type checking,
the production build, service-worker generation, repository and public-build privacy audits, full
and production-only dependency audits with zero vulnerabilities, and the no-attribution self-test
pass. Local rendered-browser checks cover the narrow and desktop menu, persisted Dark selection,
runtime theme metadata, action contrast, the Ionic action sheet, the title dialog, and the
production-built Privacy and Terms pages. Published macOS and installed-Android acceptance remains.
