# Edit-title plan

## Status

Accepted as the bounded `v0.4.1` feature slice on 2026-08-23. This version designation does not
authorise a tag or GitHub release.

## Product outcome

An article's existing long-press/context menu adds **Edit title** immediately after **Read now**.
Selecting it opens one labelled text field containing the current title. Saving replaces only the
local title; the article URL remains locked.

## Behaviour contract

- Action-sheet order: Read now, Edit title, Bookmark/Remove bookmark, Share this article, Delete,
  Cancel.
- The editor starts with the complete current title selected and enforces the existing 240-character
  limit. Empty or whitespace-only titles remain in the editor with a clear error.
- Saving updates the existing IndexedDB item in place. It does not change the identifier, URL, saved
  time, queue position or bookmark state.
- A deliberate edit is marked in the backward-compatible saved record. Reopening Laters and
  capturing the same exact URL preserve that title; the normal duplicate refresh still updates saved
  time and queue position.
- Share this article remains exactly URL-only.
- Cancel, Escape and backdrop dismissal make no change and return focus to the article title.
- A storage failure keeps the editor open with retry guidance.

## Presentation and accessibility

- The existing page, masthead, rows and controls do not move or change appearance.
- The modal reuses the current white, ink, lime, typography, focus and button language.
- It has a programmatic heading and label, visible focus, native modal focus containment, keyboard
  dismissal and real Cancel and Save buttons.
- Successful editing updates the visible semantic link and every title-dependent accessible name,
  then announces the change politely.

## Verification gates

- Focused automated checks cover title validation, storage persistence, preservation of URL/time/
  bookmark state and exact-URL re-capture.
- Browser checks cover action order, dialog styling, prefilled/selectable input, empty-title error,
  successful rename, locked URL, accessible names, cancel and persistence at 320px.
- Production physical Android acceptance covers long press, rename, reopening persistence and
  exact-URL re-capture before release closure.

## Implementation record

Commit `b5d663f` published the `v0.4.1` production candidate on 2026-08-23. The local release gate
passed 96 automated tests across 17 files, type checking, the production build, the public-build
privacy audit and the no-attribution guard. A 320px browser check confirmed the action order, styled
editor, locked URL, persistence, exact-URL re-capture and updated accessible names with no browser
errors. GitHub Actions run `32636593819` passed and deployed, and the public origin served the exact
verified JavaScript and CSS fingerprints. Physical Android acceptance remains outstanding; no tag or
GitHub release is authorised.
