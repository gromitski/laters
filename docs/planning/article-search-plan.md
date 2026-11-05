# `v1.3.0` article search slice

## Status and authority

The maintainer authorised documenting both feature slices and starting Search on 2026-11-03.
Implement a complete bounded first Search candidate using the sprint proposal's conservative
defaults below. This supersedes the sprint's planning-only status for Search. Publisher organisation
remains a documented follow-on slice. Version `1.3.0` identifies the Search candidate; implementation
verification and published human acceptance are separate. No tag or GitHub release is authorised.
Current status: on 2026-11-05 the maintainer selected the first, Shared tool space concept and
authorised implementation with smooth state transitions. This supplies the agreed hierarchy after
the rejected refinements below. The complete bounded candidate remains `1.3.0`; published visual
and physical-device acceptance follow technical verification.

## User outcome and interface

Find a saved article by a remembered title or publisher without leaving the local reading queue.
The accepted Shared tool space has visible icon-and-label **Add link** and **Search** buttons above
the list. Add link is selected on load and shows the existing Paste action/manual fallback. Search
replaces that panel with a focused input in the same space; Paste is unavailable while searching.
Returning to Add link clears the query and preserves the all/bookmarked view. An unfinished manual
URL entry survives tool switches. Inputs are not rebuilt on result updates.

Place **Saved articles** (or **Bookmarked articles**) and its count directly above the articles,
with an independent **Bookmarks** toggle alongside. Its label stays Bookmarks; pressed state and
the star treatment indicate the active filter. Keep existing article actions, typography and colours.
The search input retains its accessible **Search articles** label and **Search titles or publishers**
placeholder. Tool buttons expose their controlled panel and pressed state; hidden panels leave the
tab order and accessibility tree. There is no separate page or navigation system.

Provide a visible **Clear** button whenever the input contains text. Clear and Escape empty the
query and leave focus in the search field. Enter does not navigate or submit data. Escape with an
empty query selects Add link and focuses that action.
Search is temporary page state: reload returns to the ordinary newest-first full list with Add link
selected. Query updates preserve typing and cursor position.

Crossfade both tool panels over 240ms with 4px of gentle movement, while retaining the accepted
button/selection underline transition. Panels share one grid slot; the outgoing surface remains
painted until its fade finishes, then becomes invisible. Only the selected panel accepts input or
appears in the accessibility tree: set the other inert and aria-hidden immediately. Focus and input
availability do not wait for the fade. Do not animate results on each keystroke or move the list.
Both ordinary surfaces retain their 52px slot, including manual URL-validation feedback. Rapid
switches reverse the CSS transition without queued timers. Reduced motion removes panel and
underline/selection transitions. No dependency, navigation timer or new storage is needed.

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
  clearing or changing the query; the bookmarked case explains turning off **Bookmarks**.
- Queries are bounded to 240 characters in the field and are never persisted, synced, exported,
  placed in the address, logged, sent to an index or transmitted to a publisher.

## Interaction and preservation

- Successful Paste clears Search and retains the existing bookmark-view reveal rules. Committed
  CSV and add-link imports clear Search, select Add link and return to the full list before reveal.
  Invalid input and cancelled reviews preserve the query. Duplicate-only committed imports keep
  their existing completion semantics. Android Share Target navigation starts a fresh page.
- Title edits, bookmark changes and resolved sync data update the same derived results and count.
  Preserve focus on a surviving article action after re-render; if a focused result disappears,
  move to the next/previous result or the active Search field when none remains.
- A pending-deletion ghost remains visible even if Search or Bookmark filtering changes, so its
  existing seven-second Undo action stays usable. It never contributes to saved/matching counts.
  Undo respects the current query and bookmark view; if the restored item no longer matches, it
  stays saved outside the results and focus returns to Search.
- Keep Paste available through Add link, and retain gestures, menus, sharing and original navigation. Search
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
desktop layouts were checked. The maintainer's saved collection and pairing settings were not changed.
All 262 existing tests across 34 files, type checking, production build, public-build/repository
privacy audits and attribution self-test pass. The dependency gate reports no high/critical
findings; the current full audit reports 3 low and 7 moderate development findings, production zero.
Candidate commit `37afd27` passed [Pages workflow `41906585865`](https://github.com/gromitski/laters/actions/runs/41906585865).
The public HTML, both JavaScript assets and stylesheet exactly match the checked production build.
The normal public Update prompt applied the refinement and retained the isolated browser's existing
fictional article. Search started collapsed, found that article and closed back to the unchanged list.
Maintainer visual and physical-device acceptance remain separate; no tag or release was created.

### Layout review — 2026-11-04

The maintainer reports that the page is cluttered: Saved articles is separated from its articles,
opening Search pushes Paste down, and Paste is unnecessary during Search. The previous refinement
has not passed visual acceptance. Stop incremental production adjustments and review the overall
hierarchy before another implementation attempt.

Explore a shared Add link/Search space above the list: Add link is selected initially and shows
Paste; Search replaces that surface instead of adding a second field. Keep Saved articles directly
above the actual articles. Explore the shorter Bookmarks label as an independent list filter, with
search composition retained. Compare visible icon-and-label controls with compact icons and
supplementary reveal; essential touch actions must remain understandable without hover. Future
list controls need a coherent placement rather than an ever-growing line of links.

Two interactive concepts are being reviewed outside the application. These are proposals, not
accepted product decisions or authorisation for another production change. Matching, capture,
Bookmark, Delete/Undo, local storage, sync and privacy contracts remain the implementation boundary.

### Accepted Shared tool space — 2026-11-05

The maintainer selected the first concept and authorised implementation plus smooth transitions.
The candidate now implements the current interface contract above. Paste/manual capture lives
outside the article list, so Saved articles directly labels the actual saved rows. Selected tools
and Bookmarks expose pressed state; only the active tool panel is available.

All 262 tests across 34 files, type checking, production build, repository/public-build privacy
audits and attribution self-test pass. The high/critical dependency gate passes, production
dependencies have zero findings, and the development tree retains 3 low and 7 moderate findings.
No dependency, article schema, storage, Drive or CSV changes were introduced.

An isolated fictional collection checked safe clipboard fallback, invalid/manual capture, draft
preservation across tool switches, title/publisher matching, query and cursor focus, Clear/Escape/
Enter, hidden-panel tab order, Bookmark composition, empty-state guidance, Delete/Undo across tool
changes, import reveal, rapid switching and reload reset. At 320px in Light/Dark and on desktop,
there is no horizontal overflow. Tool switches retain a 52px slot and unchanged article-heading
position; controls retain 44px touch height. The computed incoming animation is 180ms, initial
load has no tool animation, and reduced-motion disabling rules are included in the production CSS.
Browser automation does not establish physical Android or maintainer motion/visual acceptance.

Candidate commit `56ac48a` passed [Pages workflow `42001408407`](https://github.com/gromitski/laters/actions/runs/42001408407).
The public HTML, both JavaScript assets and stylesheet exactly match the checked production build.
The normal Update prompt retained the isolated production browser's existing fictional article,
selected Add link on load, found that article through Search without showing Paste, and returned
to the unchanged list when Add link was selected. No production reading data or pairing settings
were altered. Maintainer visual/motion and physical-device acceptance remain; no tag or release.

### Panel crossfade follow-up — 2026-11-05

The maintainer accepts the layout and subtle button transition, but finds that Paste/Search boxes
still appear to switch abruptly. The authorised correction retains the accepted buttons and uses
a 240ms crossfade/4px movement for both panels in a shared grid slot. The outgoing panel becomes
inert and aria-hidden immediately, remains painted while fading, then becomes invisible. Keyboard
focus and typing remain immediate. CSS transitions reverse naturally on rapid changes; no timers
or dependencies were added. Empty manual-entry cleanup must not replace a panel after Search has
already been selected. Existing draft, query, Bookmark, Undo and capture/import behaviour remains.

Browser checks sampled intermediate opacity in both directions, including approximately 0.02/0.98
and 0.30/0.70 pairs, rather than checking only that an animation name exists. The inactive search
field was absent from accessible controls while still painted; focus/typing, rapid reversals,
non-empty manual drafts, Bookmark composition and Undo/focus recovery passed. At 320px the slot
stayed 52px and the heading position was unchanged. Light/Dark appearance checks passed. Reduced
motion disables the panel transitions. All 262 tests, type/build, privacy/attribution and dependency
gates pass; production dependencies have zero findings and the unchanged development tree has
3 low and 7 moderate findings. Compiled reduced-motion overrides were checked. Publication and
maintainer fade/device acceptance remain; no tag or release is authorised.
