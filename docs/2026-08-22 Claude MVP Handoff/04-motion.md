# 04 — Motion

Motion is deliberately expressive here — the maintainer asked for it. It still earns its place:
every animation below describes a state change, and all of it collapses under reduced motion.

```css
@keyframes rise-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}
@keyframes pop-in {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: none; }
}
@keyframes ring-drain {
  from { stroke-dashoffset: 0; }
  to   { stroke-dashoffset: 100.6; }   /* 2πr, r = 16 */
}
```

## The set

| Moment | Property | Duration | Easing |
| --- | --- | --- | --- |
| Row enters on load | `rise-in` | 500ms, staggered 60ms per row | `ease` |
| Masthead enters | `rise-in` | 500ms / 550ms with 50ms delay on the wordmark | `ease` |
| Marker wipe on title | `background-size` | 300ms | `cubic-bezier(.3,.9,.3,1)` |
| Row hover tint | `background-color` | 200ms | `ease` |
| X hover / press | `background-color`, `border-color`, `color`, `transform` | 220ms | `ease` / `cubic-bezier(.3,.9,.3,1)` |
| **X → undo arrow** | `opacity` 280ms, `transform` 440ms | 440ms | `cubic-bezier(.3,.9,.3,1)` |
| Ghost text appears | `pop-in` | 300ms | `ease` |
| Undo ring drains | `ring-drain` | 7000ms — must equal `UNDO_WINDOW_MS` | `linear` |
| **Row collapse on expiry** | `max-height`, `opacity`, `transform`, `filter` | 460ms | `cubic-bezier(.4,0,.2,1)` |
| Rows below closing the gap | consequence of the collapse | 460ms | same |

## The morph, precisely

Both icons occupy the same grid cell. They cross-fade while counter-rotating through 135°, so the
X appears to unwind into the arrow rather than swap for it.

| | X | Undo arrow |
| --- | --- | --- |
| Resting | `opacity: 1; transform: none` | `opacity: 0; transform: rotate(135deg) scale(.55)` |
| Ghost | `opacity: 0; transform: rotate(-135deg) scale(.55)` | `opacity: 1; transform: none` |

The reverse plays automatically on undo, because it is the same two transitions running back.

## The collapse, precisely

```css
.article-row {
  overflow: hidden;
  max-height: 220px;              /* generous; a long title still fits */
  transition: max-height 460ms cubic-bezier(.4,0,.2,1),
              opacity    340ms ease,
              transform  460ms cubic-bezier(.4,0,.2,1),
              filter     340ms ease;
}
.article-row.is-leaving {
  max-height: 0; opacity: 0;
  transform: translateY(-6px);
  filter: blur(3px);
}
```

Sequence on expiry: add `.is-leaving`, wait 460ms, then remove the item from the rendered list.
The blur is what makes it read as dissolving rather than sliding; it is subtle at 3px and it is
the detail most likely to be lost if someone "simplifies" this later.

A `max-height` transition needs a fixed ceiling. 220px covers a wrapped 240-character title at
the smallest supported width; raise it if the type scale changes. A CSS grid `1fr → 0fr`
transition on the row's content wrapper is the tidier modern alternative if you prefer it.

## Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-delay: 0ms !important;
    transition-duration: 1ms !important;
  }
}
```

Everything still *happens* — rows appear, the icon changes, the row goes — it just happens at
once. The undo ring is the one exception worth considering: it communicates remaining time, so
if you would rather keep it honest under reduced motion, let it run and drop only the visual
flourishes. Either is defensible; the blanket rule above is the simpler contract.
