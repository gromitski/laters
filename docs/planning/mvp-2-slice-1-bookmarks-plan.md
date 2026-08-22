# MVP 2.0 Slice 1 — persistent bookmarks

## Status

Implemented, verified and published on 2026-08-22 as the first bounded MVP 2.0 delivery slice.
Commit `1f1d0e1` passed the automated test, build, public-audit and GitHub Pages deployment workflow.
Focused physical Android acceptance passed the functional contract and identified the visual
correction recorded below. That correction is verified and authorised for a local commit; push and
deployment remain separately controlled.

This slice adds persistent bookmark state and the metadata-line foundation. Publisher favicon
loading and whole-row pointer opening remain separate later slices.

## User-visible outcome

- Every normal article row has a direct hollow or filled star button.
- The metadata line begins with the star, followed by the normalised source hostname and saved
  time.
- Bookmarked rows use the accepted bright-lime filled star with an ink outline and subtle lime wash.
- Bookmarking changes neither list order nor article identity, title, URL or saved time.
- A failed update restores the last confirmed state and reports an accessible error.

## Data compatibility

`SavedItem.bookmarked` is optional. An absent value is valid and means unbookmarked, so existing
IndexedDB records need no rewrite. Database version 1 and the existing object store remain
unchanged because no IndexedDB structural migration is required.

The storage boundary gains one focused `setBookmarked(id, bookmarked)` operation. Its read and
write happen in one transaction so only bookmark state changes and current stored article data
is retained.

Exact-URL re-sharing preserves the existing optional bookmark state while refreshing the title
and saved time. The existing Delete and Undo path retains and restores the complete item.

## Accessibility and failure behaviour

- Bookmark is a native button with an article-specific accessible name and accurate
  `aria-pressed` state.
- The interaction target is 44px square even though the visible star is smaller.
- Filled shape as well as colour distinguishes bookmarked state.
- Focus remains visible and the button has hover, active and disabled treatments.
- The UI changes optimistically; storage failure restores the prior state and announces
  `Laters could not update that bookmark. Please try again.` through the existing error region.
- Bookmark and Delete are temporarily disabled while the bookmark write is pending, preventing
  Delete/Undo from capturing stale bookmark state.

## Verification gates

Automated coverage must prove:

- legacy, false and true bookmark states validate correctly while corrupt states do not;
- bookmark updates preserve all other stored fields and newest-first ordering;
- missing identifiers do not create records;
- duplicate re-sharing preserves false, true and absent bookmark state;
- ghost-row presentation retains the complete bookmarked item; and
- accessible button names and pressed states match the current state.

The full test suite, type-check, production build and public-build audit must pass. Focused local
browser inspection must cover a 320px viewport, target size, accessible state, visual treatment,
horizontal overflow and persistence across reload. Physical Android acceptance remains distinct
and is required after an authorised deployment.

## Explicitly deferred

- Publisher favicon requests and deterministic source tiles.
- Whole-row pointer opening.
- Bookmark filters, pinning, priority sorting, archive protection or another view.
- Long press, action sheets, swipe gestures or framework selection.

## Post-acceptance visual correction

Physical Android acceptance found that Chrome retained row `:hover` styling after touch, layering
the hover tint over both bookmarked and unbookmarked states. Hover-only row and control treatments
must therefore be restricted to devices with genuine hover and fine-pointer capability. The
supplied hollow and bright-filled star SVGs replace the provisional inline star path; their source
handoff remains under the futures exploration and runtime copies live with the public icon assets.
