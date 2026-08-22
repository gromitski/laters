# Bookmark star + publisher fallback tile

## Status

This is the accepted visual handoff for the bookmark star and the 22px rounded-square publisher
fallback. Engineering behaviour remains governed by `../mvp-2-definition.md`; the visual handoff
does not introduce publisher mappings, explicit favicon caches or a different source-origin rule.

## Star icon (assets/star-hollow.svg, assets/star-filled.svg)
- 24×24 viewBox, five-point star, outer Ø 19px, inner/outer ratio 0.43 (slightly fat — holds up at 16px).
- Stroke 1.75px, `stroke-linejoin: round`, `stroke-linecap: round`; stroke is `currentColor` so it tints with text.
- Hollow: no fill. Filled: bright-lime fill `#d0ff4f` + the same ink stroke. This restores the
  original selected treatment and supersedes the later darker lime-ink fill description.
- Usage sizes: 16px (row meta), 20px (long-press sheet), 24px (buttons). Never below 16px.

## Publisher fallback tile
Deterministic, rendered synchronously — no network needed. Matches the tiles shipped in 4a.

**Geometry**
- 22×22px, corner radius 6px (rounded box; circle variant = radius 50%, use only if row avatars ever grow ≥32px).
- In list rows: 13px gap to the title block, vertically centered in the row (rows are `align-items: center`, padding 16px 22px).
- Export @2x = 44×44, radius 12.

**Typography**
- Bricolage Grotesque 800 (fallback system-ui bold), uppercase, white, grid-centered.
- One character: 11px. Two characters: 9px, letter-spacing 0.01em.

**Characters (deterministic)**
- Use the canonical normalised hostname: lower case, no trailing dot and one leading `www.`
  removed.
- Derive one or two stable uppercase characters from that value. The implementation plan owns the
  exact algorithm; it must not require an unreliable guessed registrable-domain boundary.

**Colour palette**
Use a documented stable hostname hash to select one of these six colours. The implementation plan
owns the hash function. All pass WCAG AA with white text:
1. `#223a5e` slate — 11.2:1
2. `#5e2b52` plum — 10.5:1
3. `#b2451f` rust — 5.5:1
4. `#2e5339` forest — 8.6:1
5. `#145a64` teal — 7.8:1
6. `#4a3a75` indigo — 9.7:1

**Loading / success**
- t=0: tile renders immediately (offline-safe, no spinner, no empty box). The app requests
  `/favicon.ico` on the saved article's exact origin, preserving its scheme and port.
- Success means the browser loaded and decoded the image. Cross-fade it over the tile — opacity
  0→1, 160ms ease-out. Show it at 22×22 with `object-fit: contain` on `#fff`, clipped to the same
  6px radius, with a 1px inset border `rgba(16,16,20,.08)` so white icons do not vanish. Zero
  layout shift.
- Failure, blocking, invalid data or slow loading leaves the tile visible without an error.
  Ordinary browser caching applies; MVP 2.0 adds no explicit positive, negative, binary or
  service-worker favicon cache.
- Both tile and favicon are `aria-hidden="true"` — the hostname is already read in the row meta line.
