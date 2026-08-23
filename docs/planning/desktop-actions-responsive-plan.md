# Desktop actions and responsive-width plan

## Status

Accepted as the bounded `v0.4.2` feature slice on 2026-08-23. This designation does not authorise a
tag, GitHub release or broader desktop redesign.

## Product outcome

Desktop users receive a visible route to the existing per-article action menu. On wide screens the
focused reading column gains a little more room while retaining the established Laters identity and
single-column hierarchy.

## Behaviour contract

- A circular horizontal-three-dot button sits immediately before visible Delete on normal article
  rows when the viewport is at least 48rem and the primary input supports fine-pointer hover.
- Its accessible name is `More actions for “{title}”`, updates after title editing, advertises a
  dialog and uses the existing focus treatment and effective pointer target.
- Clicking it opens the unchanged action sheet. Dismissal and title editing return focus to the
  button while it remains present.
- Existing right-click, `Shift+F10`, touch/pen long press, swipes, whole-row opening, Bookmark and
  Delete routes remain unchanged.
- The control is absent from the mobile presentation; it is not merely visually transparent or an
  extra mobile tab stop.

## Responsive presentation

- Below 48rem, the existing shell remains capped at 34rem with all existing spacing and row sizing.
- From 48rem, the shell grows fluidly from 34rem at 70% of the viewport up to a 42rem cap, retaining
  four rem of total page breathing room where needed.
- No grid, side navigation, secondary panel, desktop-only content or other makeover is introduced.

## Verification gates

- Automated tests, type checking, production build, public-build privacy audit and attribution guard
  remain green.
- Browser verification covers 1280px proportions, control order and appearance, menu opening, focus
  restoration, title-dependent accessible naming, the unchanged action order and an error-free
  console.
- A 320px browser check confirms the More actions control is absent and the existing mobile row and
  interaction presentation is unchanged.
- Production acceptance confirms the published proportions and action route before release closure.
