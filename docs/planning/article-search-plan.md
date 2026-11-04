# `v1.3.0` article search slice

## Status and authority

The maintainer authorised documenting both feature slices and starting Search on 2026-11-03.
Implement a complete bounded first Search candidate using the sprint proposal's conservative
defaults below. This supersedes the sprint's planning-only status for Search. Publisher organisation
remains a documented follow-on slice. Version `1.3.0` identifies the Search candidate; implementation
verification and published human acceptance are separate. No tag or GitHub release is authorised.
Current status: implemented, technically verified and published as a candidate; real Android and
desktop maintainer acceptance remains.

## User outcome and interface

Find a saved article by a remembered title or publisher without leaving the local reading queue.
The maintainer accepted the matching behaviour but rejected the permanently visible Search field
as visually overpowering on 2026-11-04. The authorised refinement replaces that initial placement
with one subtle **Search** action beside **Show bookmarks** in the existing heading. The field is
hidden initially and occupies no space. Activating Search reveals and focuses it below the heading,
above Paste; the action becomes **Close search**. Closing clears the query, restores the selected
all/bookmarked view and returns focus to the action. The input retains its accessible **Search
articles** label without a separate visible label; its placeholder is **Search titles or publishers**.
Expose the disclosure state and relationship to assistive technology. Keep the established typography,
colour tokens, Bookmark filter and article actions; no new toolbar, page, tab or navigation system.

Provide a visible **Clear** button whenever the input contains text. Clear and Escape empty the
query and leave focus in the search field. Escape with an empty field closes Search. Enter does not
navigate or submit data. Search is temporary page state: reload returns to the ordinary newest-first
full list with Search collapsed. The field is not
replaced when the results render, so typing and cursor position remain stable.

Reconsider the presentation of heading actions when more list functionality arrives; this refinement
does not prescribe a general controls/menu design or implement publisher organisation.

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

Candidate commit `abe6795` passed [Pages workflow `41809072005`](https://github.com/gromitski/laters/actions/runs/41809072005).
The public HTML, both JavaScript assets and stylesheet exactly match the verified production build.
A production browser offered the normal **Update** action; applying it retained its existing
fictional article, displayed the Search field and showed **Version 1.3.0** in the menu. A local
title query on that public candidate returned **1 match**, and Clear restored the initial list.

Real Android/desktop maintainer acceptance remains. Live Google Drive, offline device behaviour
and real triage-generated links were not exercised; Search does not change their existing
contracts. No tag or GitHub release was created.

### Quieter Search refinement — 2026-11-04

The authorised refinement is implemented with the existing matching and storage behaviour. Search
starts collapsed, opens with input focus, and Close search clears/hides it and restores focus to
the disclosure. Clear and Escape clear in place; a second Escape closes the empty field. Heading
actions retain 44px touch targets. At narrow widths the heading/count stay together above the two
quiet text actions, avoiding cramped controls or horizontal overflow. Focus recovery after an
out-of-view Undo now chooses the visible Search action when its field is collapsed.

An isolated fictional list checked keyboard opening, title/publisher matching, Clear, both Escape
steps, closing an active query within bookmarks, Delete/Undo across closing and view changes,
visible focus recovery, and collapsed/empty query state after reload. Light/Dark 320px and 1024px
desktop layouts were checked. No production articles or pairing settings were used or changed.
All 262 existing tests across 34 files, type checking, production build, public-build/repository
privacy audits and attribution self-test pass. The dependency gate reports no high/critical
findings; the current full audit reports 3 low and 7 moderate development findings, production zero.
Publication is pending; maintainer visual and physical-device acceptance remain separate.
