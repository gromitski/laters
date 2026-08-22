# 01 — Visual system

Everything below is expressed as custom properties. Define once on `:root` in
`src/styles.css` and reference them; do not scatter raw hex values through the stylesheet.

```css
:root {
  /* Canvas and surface */
  --canvas: #ffffff;
  --surface-hover: #fcffef;      /* row hover tint, lime at ~4% */

  /* Ink */
  --text: #101014;               /* titles, wordmark, controls        21.0:1 on canvas */
  --text-muted: #56525e;         /* status text, footnote              8.0:1 */
  --text-meta: #6f6879;          /* saved time, section heading        5.7:1 */

  /* Line */
  --hairline: rgb(16 16 20 / 12%);
  --hairline-strong: rgb(16 16 20 / 32%);

  /* Accent — lime is a fill and a marker, never body text */
  --accent: #d0ff4f;             /* chips, count pill, hover fill, ring on dark */
  --accent-ink: #8fbf00;         /* the wordmark full stop, ring on light      3.1:1 */
  --accent-text: #5b6b00;         /* the only lime that may carry text          5.4:1 */

  /* Feedback */
  --focus: #101014;              /* focus ring, 3px solid, 2–3px offset */
  --success-bg: #f4ffd6;
  --success-line: #8fbf00;
  --error: #a01b0b;              /* 6.3:1 on canvas */
  --error-bg: #fff5f3;
  --error-line: rgb(160 27 11 / 45%);

  /* Type */
  --font: "Bricolage Grotesque", system-ui, -apple-system, "Segoe UI", sans-serif;

  /* Space */
  --gutter: 1.375rem;            /* 22px — the single horizontal margin */
  --row-y: 1.0625rem;            /* 17px — article row vertical padding */
  --gap: 0.75rem;                /* 12px — title block to control */

  /* Radius */
  --r-chip: 3px;
  --r-band: 10px;
  --r-pill: 999px;

  /* Target */
  --target: 2.75rem;             /* 44px — never smaller, even when the visual is 30px */
}
```

## Colour roles in use

| Role | Token | Applied to |
| --- | --- | --- |
| Canvas | `--canvas` | page background; also the manifest `background_color` and `theme_color` |
| Surface | `--surface-hover` | article row hover only — there are no cards |
| Text | `--text` | wordmark, article titles, control labels, update band text |
| Muted text | `--text-muted` | ghost/undo message, footnote, empty and loading copy |
| Meta text | `--text-meta` | `Saved 2h ago`, `SAVED ARTICLES` heading |
| Border | `--hairline` | row separators, resting X circle |
| Link | `--text` + marker | titles are ink; the lime marker is the hover/focus affordance |
| Focus | `--focus` | 3px solid ring, 2px offset on links, 3px on the X |
| Success | `--success-bg` / `--success-line` | share-saved status band |
| Warning / update | `--success-bg` + 1.5px `--text` border | update-ready band |
| Error | `--error` / `--error-bg` / `--error-line` | invalid share, storage failure, delete and restore failure |

Contrast: every text pairing above meets or exceeds WCAG 2.1 AA (4.5:1 body, 3:1 non-text).
The resting X stroke `#8b8892` is non-text UI at 3.5:1. The lime full stop in the wordmark is
logotype and exempt, but it still sits at 3.1:1.

## Type scale

One family, six roles. Sizes are px for clarity; use `rem` in implementation.

| Role | Size | Weight | Tracking | Leading | Case |
| --- | --- | --- | --- | --- | --- |
| Product wordmark | 78 | 800 | −0.06em | 0.8 | as written, with the full stop |
| Section heading | 12 | 700 | 0.18em | 1.2 | uppercase |
| Article title | 17.5 | 600 | −0.014em | 1.32 | sentence |
| Supporting meta | 11 | 600 | 0.14em | 1.2 | uppercase |
| Controls, status, bands | 13.5 | 650–800 | 0.03em | 1.35 | sentence |
| Footnote | 11.5 | 400 | 0 | 1.55 | sentence |

Minimum body size on the screen is 11px uppercase meta; everything a user reads for content is
14px or larger. `text-wrap: pretty` on titles and multi-line copy; `overflow-wrap: anywhere`
on titles so a 240-character title or a bare URL cannot break the layout.

## Space, line and shape

- One horizontal gutter: 22px. Nothing insets further; the list runs edge to edge.
- Article row: 17px top and bottom, 12px gap between the title block and the control.
- Separators: 1px `--hairline` on the top edge of each row. No card, no radius, no shadow on the list.
- Bands (update, status, error): 10px radius, 11–13px padding, 1px border except the update band which takes 1.5px `--text` so it reads as an action, not a message.
- Chips and pills: lime chip behind the eyebrow at 3px radius; the count pill at 999px with `white-space: nowrap`.
- **No elevation anywhere.** Depth is carried by the hairlines and the lime.

## Responsive rules

- Single column at every width; `min-width: 20rem` holds.
- Wordmark may scale `clamp(3.25rem, 17vw, 4.875rem)`; nothing else changes size.
- Above ~34rem, cap the content column at `34rem` and centre it — keep the hairlines full-bleed so it still reads as one page, not a card.
- The article row never becomes a column: title block flexes, the 30px control is `flex: none`.
