# Laters — Dark mode handoff

Implementation handoff for the dark colour scheme. Grounded in the shipped `src/styles.css` (all theming is CSS custom properties on `:root`), `index.html` and `src/ui/applicationMenu.ts` at v0.7.0.

Screenshots (2×): `screens/7a-dark-list.png` (reading list), `screens/7b-token-map.png` (full token table), `screens/7c-dark-menu.png` (main menu sheet).

## Principle

The ink becomes the canvas; lime stays lime. Every light token maps one-for-one to a dark value on `:root[data-theme="dark"]` (or inside `@media (prefers-color-scheme: dark)` for the system default). No layout, type or spacing changes.

## Token map

All AA ratios are against dark canvas #101014.

| Token | Light | Dark | AA |
| --- | --- | --- | --- |
| --canvas | #ffffff | #101014 | — |
| --surface-hover | #fcffef | #181b10 | — |
| --text | #101014 | #f4f3f6 | 17.2 |
| --text-muted | #56525e | #a9a4b2 | 7.8 |
| --text-meta | #6f6879 | #8b8695 | 5.3 |
| --hairline | rgb(16 16 20 / 12%) | rgb(244 243 246 / 14%) | — |
| --hairline-strong | rgb(16 16 20 / 32%) | rgb(244 243 246 / 34%) | — |
| --paste-border | rgb(16 16 20 / 22%) | rgb(244 243 246 / 26%) | — |
| --accent | #d0ff4f | unchanged | 16.3 |
| --accent-ink | #8fbf00 | unchanged | 8.7 |
| --accent-text | #5b6b00 | #bfe45b | 12.9 |
| --danger-action | #ff645c | unchanged | — |
| --bookmark-wash | lime / 10% | lime / 8% | — |
| --bookmark-wash-hover | lime / 24% | lime / 16% | — |
| --focus | #101014 | #d0ff4f | 16.3 |
| --success-bg | #f4ffd6 | #1c220c | — |
| --success-line | #5b6b00 | #bfe45b | 12.9 |
| --error | #a01b0b | #ff8a7a | 8.3 |
| --error-bg | #fff5f3 | #26120e | — |
| --error-line | #a01b0b / 45% | #ff8a7a / 45% | — |
| --sync-connected | #eaffbd | #24310e | — |
| --sync-disconnected | #ffe3df | #3a1712 | — |

## Prerequisite: tokenise four hard-coded values

styles.css uses literals that must become tokens before theming:

- `#fff` on `.skip-link`, `.update-action`/`.install-action` text, menu-button hover fills → new `--canvas-inverse-text` (#fff light, #101014 dark — inverted fills use `--text` as bg, so their text uses the opposite pole).
- `#2b2b33` update/install hover → `--button-hover` (#2b2b33 light, #dddce2 dark).
- `#ececf0` title-cancel hover → `--surface-dim` (#ececf0 light, #26262c dark).
- `#77727f` bookmark/delete icon grey → `--icon-muted` (#77727f light, #8b8695 dark).

## Component notes

- **Theme-invariant pairs (no change):** eyebrow chip, count pill, wordmark stop, swipe Bookmark/Delete actions, primary lime buttons — all lime or `--danger-action` with #101014 content.
- **Title underline:** new `--link-underline` = `var(--accent)` light, `rgb(208 255 79 / 32%)` dark. Full-strength lime under light text glows; the 32% band reads as the same gesture. Applies to `.article-link` background gradient.
- **Publisher tiles:** keep the exact six fallback colours (chosen for white text, which doesn't change). Extend the favicon's existing 1px inset ring — `box-shadow: inset 0 0 0 1px rgb(244 243 246 / 10%)` — to the letter tiles in dark so slate/plum don't dissolve into the canvas. Favicon plate stays #fff in both themes.
- **Bookmarked row:** 8% lime wash over canvas (10% light); `.is-menu-open` 16% + the existing 4px `--accent-ink` inset stripe unchanged.
- **Menu sheet (7c):** surface stays `--canvas`; separation comes from the unchanged 0.48 backdrop, a deeper shadow, and a top hairline the light theme doesn't need. Shadows generally: raise ink shadows to `rgb(0 0 0 / 55%)` — 18–24% ink vanishes on dark (`.application-menu-modal --box-shadow`, action sheet, title dialog + its backdrop).
- **Secondary buttons** (`.secondary`, Download CSV, Cancel): `--text` label, `--hairline-strong` border, transparent bg, hover `--surface-hover`.
- **Close/menu burger:** `--text` border/icon on `--canvas`, press inverts (light fill, dark glyph). Sync tints on the burger: connected #24310e, disconnected #3a1712, checking `--canvas`.
- **Focus:** `--focus` becomes lime; keep the `--accent-text` outlines on menu buttons (now #bfe45b, 12.9:1).
- **Ionic:** `.application-menu-modal` and `.article-action-sheet` are driven entirely by CSS vars already in styles.css — dark tokens flow through with no TypeScript changes.

## Switching behaviour

- Default: follow `prefers-color-scheme`.
- Manual override in the main menu: System / Light / Dark, stored locally (same storage boundary as everything else — no sync).
- Set `color-scheme: light dark` on `:root` so form controls, scrollbars and the file picker follow.
- Update `<meta name="theme-color">` per theme (#ffffff / #101014) — it's currently hard-coded in index.html; swap via JS on theme change so the Android status bar matches.
- Honour `prefers-reduced-motion` as now; no new motion is introduced by theming.

## Contrast summary

All text tokens clear WCAG AA 4.5:1 on #101014; --text-meta (5.3:1) is used only for 11px/600/uppercase meta, which also clears it. Lime-on-ink pairs are 16.3:1 in both themes.
