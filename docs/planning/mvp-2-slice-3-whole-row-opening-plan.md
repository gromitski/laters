# MVP 2.0 Slice 3: whole-row opening

## Status

Implementation authorised on 2026-08-22. The repository's standing end-of-slice workflow
authorises commit and push after verification so maintainer testing can use the published app.

## User-visible outcome

A primary tap or click on otherwise non-interactive space in a normal article row opens the same
original article in a new tab as the title link. This includes the source marker, hostname, saved
time and blank row space.

The title remains a real link and the only keyboard and assistive-technology route to that
destination. Bookmark and Delete remain independent buttons. Ghost/Undo rows do not open articles.

## Event model

- Use the ordinary `click` event for activation. Rely on the browser to distinguish a completed
  tap/click from scrolling instead of adding custom pointer thresholds or gesture tracking.
- On `pointerdown`, remember only whether the row already contains selected text. This prevents the
  subsequent click from opening an article when the pointer action merely collapses an existing
  selection before `click` fires. Clear that snapshot on `pointercancel` or after the next click.
- Ignore a row click when it is not the primary button, its default action was already prevented,
  it originated within an interactive descendant, or the row contains a non-collapsed text
  selection.
- Treat links, buttons, form controls and explicit button/link roles as interactive descendants.
  This protects current controls and keeps the exclusion safe for small future markup changes.
- For an accepted row click, invoke the existing title link. This reuses its exact `href`, `_blank`
  target and `noopener noreferrer` relationship rather than maintaining a second navigation policy.
- Do not add `tabindex`, link/button semantics, keyboard handlers or an anchor around the row.
- Add only a pointer cursor as the visual desktop affordance. Preserve existing hover, active,
  focus, bookmark and delete treatments.

## Verification

- Focused tests cover the pure activation decision for a primary non-interactive click and every
  rejection condition.
- Run the full automated test suite, production build and public-build audit.
- Inspect the final diff for nested-interactive markup, redundant tab stops, gesture machinery and
  scope expansion.
- Published Android acceptance should check the source marker, hostname and blank row space; the
  title link; Bookmark; Delete; text selection; scrolling; and Ghost/Undo.

## Stop conditions

Stop and report before broadening scope if reliable activation requires pointer-distance tracking,
long-press handling, swipe arbitration, a gesture framework or replacement of the semantic title
link.
