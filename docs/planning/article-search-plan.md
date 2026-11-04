# `v1.3.0` article search slice

## Status and authority

The maintainer authorised documenting both feature slices and starting Search on 2026-11-03.
Implement a complete bounded first Search candidate using the sprint proposal's conservative
defaults below. This supersedes the sprint's planning-only status for Search. Publisher organisation
remains a documented follow-on slice. Version `1.3.0` identifies the Search candidate; implementation
verification and published human acceptance are separate. No tag or GitHub release is authorised.

## User outcome and interface

Find a saved article by a remembered title or publisher without leaving the local reading queue.
Place a labelled **Search articles** field below the list heading and above the existing Paste row.
Its placeholder is **Search titles or publishers**. Keep the established typography, colour tokens,
Bookmark filter and article actions; no new toolbar, page, tab or navigation system is needed.

Provide a visible **Clear** button whenever the input contains text. Clear and Escape empty the
query and leave focus in the search field. Enter does not navigate or submit data. Search is
temporary page state: reload returns to the ordinary newest-first full list. The field is not
replaced when the results render, so typing and cursor position remain stable.

## Matching and presentation

- Search saved titles and the displayed normalised publisher hostname only, not full URL paths,
  query parameters or article content. Reuse the existing source-hostname identity.
- Trim outer whitespace, ignore case, split on whitespace and require every term to appear in
  the title/publisher combination. Terms are literal substrings, not regular expressions or fuzzy
  matches. Accents are not folded; no ranking or reordering is added.
- Combine Search with the existing all/bookmarked view. Clearing search preserves that view.
  Results retain their existing deterministic newest-first order.
- Show **1 match** or **N matches** while a non-blank query is active, using the existing polite
  count announcement. Keep the list heading and Bookmark action appropriate to the selected view.
- Distinguish the empty library, no bookmarks and no search matches. No-match guidance explains
  clearing or changing the query; the bookmarked case also offers the existing **Show all** path.
- Queries are bounded to 240 characters in the field and are never persisted, synced, exported,
  placed in the address, logged, sent to an index or transmitted to a publisher.

## Interaction and preservation

- Successful Paste clears Search and retains the existing bookmark-view reveal rules. Committed
  CSV and add-link imports clear Search and return to the full list before the normal reveal.
  Invalid input and cancelled reviews preserve the query. Duplicate-only committed imports keep
  their existing completion semantics. Android Share Target navigation starts a fresh page.
- Title edits, bookmark changes and resolved sync data update the same derived results and count.
  Preserve focus on a surviving article action after re-render; if a focused result disappears,
  move to the next/previous result or the active Search field when none remains.
- A pending-deletion ghost remains visible even if Search or Bookmark filtering changes, so its
  existing seven-second Undo action stays usable. It never contributes to saved/matching counts.
  Undo respects the current query and bookmark view; if the restored item no longer matches, it
  stays saved outside the results and focus returns to Search.
- Keep Paste, existing gestures, menus, sharing and original article navigation available. Search
  works offline over local data; external articles retain their existing network requirements.
- No article schema, identifier, saved time, bookmark, credential, Drive operation or CSV contract
  changes. Export covers the complete saved collection; Import deduplicates against the complete
  resolved collection rather than Search results.

## Implementation and verification

Extend the existing presentation/filter helpers and application wiring, with no new dependency,
backend, index service or storage migration. Keep publisher grouping, tags, folders, reading-time
sorting, images, enrichment and the separately tracked triage-transfer defect outside this slice.

Focused tests cover literal title/publisher matching, terms, case/whitespace, excluding URL-only
matches, bookmark composition, deterministic order, data preservation, updates, Undo visibility
and truthful counts/empty states. Browser checks cover typing focus, Clear/Escape, Enter, title
editing, capture/import reveal, Delete/Undo across view changes, reload and 320px/desktop layouts
in Light/Dark. Use fictional local data; do not touch the user's production collection.

Run the complete existing tests, type checking, production build, repository and public-build
privacy audits, full/production dependency audits and attribution gates. At the end of the checked
slice, follow the standing commit/push-to-main workflow, verify Pages publication and the visible
version/update path, then obtain Android and desktop human acceptance. Do not claim that technical
verification establishes real-device usability or that Search repairs triage transfer.

## Delivery evidence

The implemented candidate passes all 262 tests across 34 files, type checking, production build,
service-worker generation, public-build audit and no-attribution self-test. Repository privacy
and commit metadata are checked again before publication. The required high-severity dependency
gate passes after the narrow Vite `8.2.2` to `8.2.4` patch. Production dependencies report zero
vulnerabilities; the full development tree retains 14 findings (3 low, 11 moderate). Broader tooling
upgrades, including changes for advisories that suggest breaking PWA-tool downgrades, are deferred.

An isolated local browser checked title/publisher terms, bookmarks/no matches, Clear/Escape/Enter,
title-edit removal and focus recovery, unbookmark focus, query changes during Delete/Undo,
Paste reveal, cancelled Import preservation, whole-collection duplicate review and committed
Import reveal. Reload clears Search. No browser warnings/errors were recorded in that session.
Light and Dark checks at 320px and desktop passed. A 1,005-item fictional collection exposed
overflow at **1000 matches**; wrapping the heading controls corrected it, with both all/bookmarked
views then measuring 320px document width at a 320px viewport. A separate 1,000-entry filtering
measurement over 25 runs gave a 0.46 ms median and 1.26 ms maximum with unchanged input data;
this measures filtering only, not DOM rendering or physical-device performance.

Publication verification and real Android/desktop human acceptance remain. Live Google Drive,
offline device behaviour and real triage-generated links were not exercised in the isolated
browser; Search does not change the existing connection or handoff contracts.
