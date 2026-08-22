# Laters — design handoff, 22 August 2026

This package records the implemented first-MVP design baseline. The selected post-MVP bookmark, source-icon and whole-row interaction direction lives in [`../mvp-2-definition.md`](../mvp-2-definition.md); this package should not be read as prohibiting that separately accepted scope.

Visual and interaction design for the accepted Laters MVP (Slice 6). Produced against
`docs/claude-design-handoff.md` and the reading order it sets out.

This package is **design intent plus assets**. No repository file outside this folder has
been created, altered or deleted, and nothing has been committed, pushed or deployed.

## Contents

| File | What it covers |
| --- | --- |
| `01-visual-system.md` | Colour, type, space, radius, border tokens as CSS custom properties |
| `02-components.md` | Per-element markup and CSS: masthead, list heading, article row, X control, bands |
| `03-experience.md` | The user-experience guide: journey, every required state, focus and announcement rules |
| `04-motion.md` | Keyframes, durations, easing, the undo ring, reduced-motion fallback |
| `05-icons.md` | Icon assets, manifest and `index.html` head changes |
| `icons/` | `laters-512.png`, `laters-maskable-512.png`, `laters-192.png`, `favicon-32.png` |

## The direction in one paragraph

White page, near-black ink, one accent: a lime `#d0ff4f` used as a marker pen rather than a
background. The wordmark is **Laters.** — the full stop is the identity, and it carries into the
app icon as a lime **L** with a white dot on near-black. The list runs edge to edge with hairline
rules and no cards. The loudest thing on screen is the article title; the delete control is a
30px hairline circle that only lights up lime on hover, press or focus. Type is Bricolage
Grotesque throughout, tight and heavy for the wordmark, quieter for everything else.

## Decisions that need the maintainer's sign-off

### 1. Bundled font — Bricolage Grotesque

The design depends on Bricolage Grotesque (SIL Open Font License 1.1). The handoff forbids
remote resources, so it must be **self-hosted in the repository**, not loaded from Google Fonts:

- subset to Latin, weights 400–800 (variable `wght` axis preferred, one file)
- `woff2` only, in `public/fonts/`
- `@font-face` with `font-display: swap` in `src/styles.css`
- expect roughly 30–45 kB subset; this is the only added payload

If that is rejected, the fallback is `system-ui` with the same tokens. The layout survives; the
wordmark loses most of its character. Nothing else in the design depends on the typeface.

### 2. The X replaces the word "Delete"

The handoff deliberately protects the explicit **Delete**, **Undo** and **Update** labels. The
maintainer asked for an icon-only X that morphs into an undo arrow. That deviation is applied to
**Delete and Undo only** — **Update** keeps its word.

What preserves accessibility:

- the button keeps `aria-label="Delete “{title}”"`, and swaps to `aria-label="Undo delete"`
- the existing live regions still announce `Deleted “{title}”.` and `Restored “{title}”.`
- the hit area stays 44px (2.75rem) even though the visible disc is 30px
- state is never carried by colour alone: the icon shape changes, the ring appears, the row text changes

Recommend recording this in `memory/agreements.md` or the MVP definition as an accepted
interaction decision when it lands.

### 3. Undo moves into the row

Currently the undo action lives in the page-level `#status-message` region. The design puts the
undo control **in the row that was just deleted**, which is where the user's finger already is.
`03-experience.md` sets out how to do that **without rewriting the deletion logic** and while
keeping the existing live region announcements. If that is more churn than you want, the design
degrades cleanly: keep the bottom status message and simply restyle it with these tokens.

## What is deliberately unchanged

No new features, navigation, tabs, menus, floating actions, search, tags, thumbnails or
placeholders. Copy strings are taken verbatim from `index.html` and `src/main.ts`. The
information architecture is still one screen: brand, optional update notice, reading list,
transient status, local-storage explanation.

## Suggested implementation order

1. Add the font and the token block; ship it with the current markup and confirm nothing breaks.
2. Restyle masthead, list heading and row typography.
3. Replace the Delete button with the X control (markup + `aria-label` swap only).
4. Add the morph, ring and collapse motion.
5. Move the undo control into the row, keeping the live region intact.
6. Swap the icon assets, manifest and theme colours.
7. Run tests, production build and the public-build audit.
