# 05 — Icons

## The mark

A lime **L** with a white full stop on near-black. It is the wordmark reduced to two characters,
which is why the full stop matters: it is the piece of the identity that survives at 16px.

## Files in this folder

| File | Size | Purpose | Notes |
| --- | --- | --- | --- |
| `icons/laters-512.png` | 512×512 | `purpose: "any"` | 112px corner radius baked in |
| `icons/laters-maskable-512.png` | 512×512 | `purpose: "maskable"` | full-bleed square, mark inside the 80% safe circle |
| `icons/laters-192.png` | 192×192 | `purpose: "any"`, also `apple-touch-icon` | 42px corner radius |
| `icons/favicon-32.png` | 32×32 | browser tab | **L** only, no full stop — the dot silts up below 24px |

All four are rendered from the live design at 1× with the real typeface, so they match the app
exactly. They replace the current `public/icons/` assets of the same names.

## Still to produce

- **`laters.svg`** — the SVG favicon `index.html` already references. Produce it by setting
  the same **L** in Bricolage Grotesque 800 on a `#101014` rounded square and **converting the
  glyph to outlines** so it does not depend on a font at render time. Do not ship an SVG with a
  live `<text>` element and a font-family; it will render in whatever the browser has.
- A dark-chrome favicon variant is *nice to have*: lime tile, ink **L**, served via
  `<link rel="icon" media="(prefers-color-scheme: dark)">`. Skip it if it adds noise.

## Manifest changes — `vite.config.ts`

Only the theme and background values change; icon paths and `purpose` values stay as they are.

```ts
background_color: "#ffffff",
theme_color: "#ffffff",
```

## Head changes — `index.html`

```html
<meta name="theme-color" content="#ffffff" />
<link rel="icon" href="/icons/laters.svg" type="image/svg+xml" />
<link rel="icon" href="/icons/favicon-32.png" sizes="32x32" type="image/png" />
<link rel="apple-touch-icon" href="/icons/laters-192.png" />
```

## Checks before this is done

- Install on Chrome for Android and confirm the home-screen icon is the maskable variant, not a
  white-bordered square
- Confirm the splash uses `#ffffff` and does not flash the old warm paper colour
- Confirm the tab favicon is legible at 16px in both light and dark browser chrome
- Confirm no icon file carries EXIF or author metadata — the public-build audit checks for it
