# `v1.4.0` publisher organisation slice

## Status and authority

On 2026-11-05 the maintainer compared publisher sorting and grouping in the accepted Shared tool
space layout, selected **grouping**, and authorised implementation with **newest first still the
default view**. Deliver a complete bounded candidate `1.4.0`; this supersedes the earlier
planning-only status and flat-sort proposal. The two-slice sprint's Search work is retained.
Publication and maintainer device acceptance follow technical verification; no tag/release authority.

## User outcome and interface

Browse saved articles under publisher headings, then return to the ordinary newest-first queue.
Use a restrained native **Article view** select beside Bookmarks in the article-heading area:
**Newest first** and **Publisher groups**. Newest first is selected on every fresh load/reload.
The choice is temporary page state, never stored, synced or exported. Keep Add link/Search in
their existing shared space, with the accepted 500ms panel transitions unchanged.

Publisher groups run A–Z by normalised hostname. Each group has a hostname heading and the number
of visible saved articles in that group, with newest-first articles and the existing deterministic
ID tie-break within it. Reuse the existing source identity: hostname case, a trailing dot and
initial `www.` are ignored; other subdomains remain distinct. No publisher brand inference or lookup.
In grouped view, omit the repeated publisher text/separator from row metadata; the group heading,
source marker and existing article action sheet retain publisher context. Newest first retains
the existing row metadata. Groups remain expanded; no collapse or publisher-management controls.

## Behaviour and preservation

- Filter using Search and Bookmarks before grouping. Show only groups with visible entries, and
  update group counts after changes. The main count remains an article/bookmark/match count.
- A pending deletion is the sole exception to hiding groups without saved results: keep its
  ghost/Undo route within its publisher until expiry, showing zero saved articles when necessary.
  Ghosts never contribute to group or main counts. Remove an empty group when its ghost expires.
- Changing Article view preserves Search query, Bookmark state and focus on the select. Typing
  never replaces the search input or animates the article list. Returning to Add link clears Search
  under the accepted contract and retains the current article view.
- Delete/Undo retains the seven-second in-place behaviour. Restore into the current publisher
  position if visible; if filtering excludes the restored article, keep it saved and recover focus
  using the existing active-tool fallback. Focus beside an expired ghost can cross publisher groups.
- Title/bookmark edits and resolved Drive updates refresh the same derived view. Preserve semantic
  article links, row actions, gestures, menus and focus recovery. Do not rewrite article data/order.
- Successful Paste clears Search and applies existing Bookmark reveal rules, retaining Article view
  and revealing/highlighting the saved row in its group. Committed CSV/add-link Import clears
  Search, selects Add link and the all-articles filter, retains Article view, and reveals the first
  imported article. Invalid/cancelled input preserves the selected view/query. Share-target navigation
  begins a fresh page in Newest first.
- Export covers the complete collection in its existing order/format; Import deduplicates against
  the complete collection. No storage/schema, credential, Drive-operation or CSV changes.

## Scope limits

No separate flat publisher sort, stored preference, manual filing, tags, folders, archive, publisher
metadata fetching, article images, reading-time sorting, new dependency, backend or analytics.
Triage routing remains deferred under its own plan. The latest accepted tagged release stays
`v1.1.0`; this candidate does not authorise a tag or GitHub release.

## Verification and acceptance

Focused tests cover normalised/ordered publishers, distinct subdomains, newest-first ties, no input
mutation, Search/Bookmark composition, ghost-only groups, restored ordering, empty/single-publisher
and no-match collections. Browser checks use fictional articles in an isolated origin and cover
initial/reload default, view switching with Search/Bookmarks, group/main counts, Delete/Undo,
expiry/empty-group cleanup and cross-group focus, title edits, capture/Import reveal and cancellation.
Check keyboard and 320px/desktop layouts in Light/Dark with reduced-motion rules retained.

Run the existing full test, type/build, public-build/repository privacy, dependency and attribution
gates. Follow the standing implementation-slice commit/push and Pages verification workflow.
Verify the normal public Update path; maintainer Android/desktop usability acceptance remains
separate from automated and isolated-browser evidence.

## Implementation verification — 2026-11-05

The bounded candidate is implemented. All **266 tests across 34 files** pass, including four
focused grouping tests. Type checking, production build/service-worker generation, repository
and public-build privacy, no-attribution self-test and dependency gates pass. Production
dependencies have zero findings; the unchanged development tree retains 3 low/7 moderate.

An isolated local browser verified empty/default and reload state, grouped A–Z headings/counts,
normalised `www.` versus distinct subdomains, Search/Bookmark composition and no-match recovery.
It also checked Undo across query/view changes, restoration outside the current results, ghost-only
zero counts, expiry/removal of empty groups and focus crossing to the neighbouring publisher.
A focus-boundary defect found during that check was corrected and the expiry route rechecked.
Unbookmarking and editing a title out of a search removed the now-empty group and recovered focus.

Manual capture retained grouping and revealed the new publisher/row. Cancelled CSV review retained
the query/view; completed Import retained grouping, cleared Search, selected Add link and revealed
the first imported row. Review deduplicated against the whole saved collection despite an empty
search result. Reload returned to Newest first, Add link and the full list with saved data retained.
Light/Dark 320px layouts and desktop were checked; the document stayed 320px wide at 320px and
heading actions fit without overlap. Native select and group headings expose accessible names.
The accepted 500ms tool-panel CSS and reduced-motion overrides are unchanged.

These checks used fictional articles and local storage isolated from the maintainer's installation.
They do not establish physical Android gesture/motion acceptance, VoiceOver conformance, live
Drive interaction or a new tag/release. Pages publication and the normal Update path follow.
