# `v1.4.0` publisher organisation slice

## Status and authority

On 2026-11-05 the maintainer compared publisher sorting and grouping in the accepted Shared tool
space layout, selected **grouping**, and authorised implementation with **newest first still the
default view**. Deliver a complete bounded candidate `1.4.0`; this supersedes the earlier
planning-only status and flat-sort proposal. The two-slice sprint's Search work is retained.
Publication and maintainer device acceptance follow technical verification; no tag/release authority.

## User outcome and interface

Browse saved articles under publisher headings, then return to the ordinary newest-first queue.
Use a restrained, right-aligned **Article view** button beside Bookmarks in the article-heading
area. A closely spaced chevron opens a styled two-choice menu with a selected checkmark:
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
- Changing Article view preserves Search query, Bookmark state and focus on the trigger. Typing
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
heading actions fit without overlap. The original native select and group headings exposed accessible names; the refinement below
supersedes the select.
The accepted 500ms tool-panel CSS and reduced-motion overrides are unchanged.

These checks used fictional articles and local storage isolated from the maintainer's installation.
They do not establish physical Android gesture/motion acceptance, VoiceOver conformance, live
Drive interaction or a new tag/release. Pages publication and the normal Update path follow.

### Published candidate

Implementation commit `0997c47` passed
[Pages workflow `42109442120`](https://github.com/gromitski/laters/actions/runs/42109442120).
The public HTML, both JavaScript assets and stylesheet exactly match the checked `1.4.0` build.
The normal public Update path retained the isolated browser's existing fictional article and
started in Newest first. Publisher groups showed its hostname and one-article count; a title
search found it within that group. Reload reset to Newest first, Add link and the full list.
The menu displayed **Version 1.4.0**. No maintainer reading data or pairing settings were changed.
Maintainer visual and physical-device acceptance remains; no tag or release was created.

## View-picker and transition refinement — 2026-11-05

The maintainer requested a smooth 500ms transition between Newest first and Publisher groups,
a right-aligned label without excess space before the chevron, and polished dropdown options.
This authorises a focused presentation refinement within candidate `1.4.0`; matching, ordering,
defaults, data and the accepted Add link/Search panel transition stay unchanged.

Replace the native select with a labelled button and small opaque, theme-aware menu. Keep a
constant trigger width, align its text to the right and keep a 6px chevron gap. The popup has two
44px options, a clear selected checkmark, quiet lime selection, rounded corners and a restrained
shadow. It aligns to the trigger's right edge, clamps to the viewport, and closes on selection,
outside click, Escape, Tab, resize or scroll. Native popover handles top-layer placement and light
dismissal. Menu radio semantics expose selection; arrow keys, Home/End and Enter/Space support
keyboard use. Escape/selection return focus to the trigger; Tab continues to the next control.

Crossfade only the article-list paint snapshots over 500ms with 4px movement in each direction.
Use the browser's [same-document View Transition API](https://developer.chrome.com/docs/web-platform/view-transitions/same-document),
without duplicating article DOM/IDs or fading the tools, heading or picker. Reuse existing article
and Undo controls during view-only reparenting so a keypress cannot lose its target between
capture and repaint. Rapid choices replace the previous animation; ordinary result updates,
keyboard focus entering the list and article actions finish it. Search input stays immediate;
never animate each keystroke. Browsers without native snapshots receive a 500ms entrance fallback.
Reduced motion skips list animation and removes menu/chevron motion. No new dependency, stored
preference, version bump, navigation delay or broader redesign.

### Refinement verification

All **270 tests across 35 files**, type checking/build, public-build/repository privacy, attribution
self-test and dependency gates pass. The four added transition-controller tests cover reduced
motion, native callback/cancellation, superseded completion and the interruptible 500ms fallback.
Production dependencies have zero findings; the development tree remains 3 low/7 moderate.

An isolated browser sampled actual old/new snapshot opacity and movement, including approximately
0.86/0.14 and 0.60/0.40 opacity pairs, with computed 0.5s durations. A 105-article fictional library
retained all 105 links and produced three correct publisher groups during the fade. This is a
representative interaction check, not a general performance guarantee. No duplicate interactive
DOM is introduced by the snapshots.

Menu checks cover selection/checkmarks, Arrow/Home/Tab/Escape navigation, focus return, outside
dismissal, query/Bookmark preservation, typing mid-transition, rapid reversal and reload default.
A quick keyboard Undo interruption initially lost its target; reusing existing row controls and
restoring ghost focus corrected it, and that exact fast-switch/Undo sequence now restores and
focuses the article. Light/Dark menu surfaces and 320px viewport placement/overflow passed.
Compiled reduced-motion overrides and the reduced-motion controller path were checked; no physical
OS motion setting, Android gesture or VoiceOver acceptance is claimed. A screenshot uses only the
fictional test collection. Publication verification follows; no tag/release or version bump.
