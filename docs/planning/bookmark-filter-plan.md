# `v1.0.0` bookmark-filter plan

## Status

Accepted and implemented as the local `v1.0.0` candidate. Package metadata remains `0.8.0`; a tag
and release remain unauthorised closure steps after published maintainer acceptance.

## Product outcome

`v1.0.0` adds one temporary **Bookmarked articles** filter to the existing reading queue. It helps a
person return to deliberately marked articles without adding search, folders, archive, general tags
or another stored collection. The normal newest-first list remains the default and source of truth.

This is intended to close the Laters MVP. After accepted implementation and release, the project can
move to maintenance rather than assuming another feature roadmap. Grouping and tagging remain
unversioned possibilities for later exploration, not unfinished `v1.0.0` work.

## Interface and hierarchy

The articles must remain the visual focus. Add one restrained, link-style text button in the existing
list-heading row near the item count:

- **Show bookmarks** in the normal **Saved articles** view;
- **Show all** in the filtered **Bookmarked articles** view.

Do not add tabs, a segmented control, toolbar, filter panel, prominent pill, new card or persistent
menu section. Reuse the current typography, spacing and colour tokens. The control may use
transparent padding to retain a full accessible touch target without gaining visual weight. It must
fit without crowding or wrapping the heading at the supported narrow mobile width and must remain
clear in System, Light and Dark appearance.

The existing count describes the visible view: for example, **12 items** in the full list and
**3 bookmarks** in the filtered list. The changed heading, command label and count together make
the active state understandable without decorative emphasis.

## Behaviour

- Laters always opens in **Saved articles**. The filter is transient page state and is not retained
  across reloads, installations or devices.
- **Show bookmarks** derives a subset from the already resolved local list. Bookmarked articles keep
  their existing newest-first order; filtering never changes `savedAt` or queue position.
- **Show all** immediately restores the complete list without reading from or writing to storage.
- The **Paste a link** row remains available in both views because capture is a primary Laters job.
- Saving a new unbookmarked article through Paste returns to **Saved articles** so the existing
  highlight and visible confirmation remain truthful. Exact-URL recapture continues to preserve an
  existing bookmark under the established capture contract.
- A successful CSV Import returns to **Saved articles** before revealing the first imported article,
  preserving the accepted Import completion behaviour regardless of imported bookmark state.
- Android Share Target navigation starts a fresh page in the default full view.
- Drive refreshes update the derived filtered view without creating a filter-specific operation. A
  remote bookmark addition makes an article eligible; a remote bookmark removal removes it.
- Removing a bookmark while filtered hides that article only after the existing bookmark update
  succeeds. A failed write leaves it visible and restores the current bookmarked presentation.
- When a focused row disappears after successful unbookmarking, focus moves predictably to the next
  visible article action, the previous one if there is no next article, or **Show all** if no
  bookmarked article remains. The status message explains that the article remains saved but is no
  longer shown by the filter.
- Delete retains the current seven-second Undo contract. A deleted bookmarked article remains as its
  existing Ghost/Undo row in its deterministic filtered position until Undo or expiry; Undo restores
  it without changing the selected view.
- Swipe left remains Delete. Swipe right remains Bookmark or Remove bookmark. The title link, Star,
  visible Delete control, long-press menu and desktop article menu remain available and unchanged.
- Article sharing remains long-press or the existing article menu and sends exactly `{ url }`.

## Empty and failure states

The existing whole-list empty state remains unchanged when no articles are saved. When articles
exist but none are bookmarked, the filtered view shows a concise state such as **No bookmarked
articles yet. Bookmark one to keep it easy to find.** The **Show all** action and Paste row remain
available.

Filtering itself cannot fail because it is a pure local presentation operation. Existing storage,
Import, capture and sync errors retain their established handling. A refresh or application update
safely returns to the full list rather than attempting to restore obsolete filter state.

## Data, sync, privacy and compatibility

The filter adds no article field, IndexedDB store, database migration, local-storage preference,
Drive file, sync operation, CSV column or recovery tag. It performs no network request and works
fully offline.

Existing articles, identifiers, URLs, titles, deliberate-title markers, saved times, bookmarks,
pending operations, deletion records, checkpoints, credentials and connection state remain
unchanged. Export continues to include every saved article, not merely the visible subset. Import
continues to compare and merge against the complete resolved list.

No publisher is contacted and no article content, image or metadata is fetched. The release adds no
Laters backend, account, analytics, public list, automatic upload or paid service.

## Accessibility

- Use a native button with a visible command label, a minimum accessible touch target, an accessible
  name matching its purpose and a visible keyboard focus indicator.
- Keep the filter operable without swipe, long press, hover or colour perception.
- Update the semantic list heading and accessible list label with the visible view.
- Let the existing polite count/status presentation announce meaningful result changes without
  producing duplicate announcements.
- Preserve logical focus when filtering, unbookmarking, deleting, undoing, importing and saving.
- Retain WCAG AA contrast, reduced-motion behaviour and current target sizing in Light and Dark.

## Verification and acceptance

Focused automated checks should cover:

- full view as the default and no filter persistence;
- bookmarked-only derivation with deterministic newest-first ordering;
- visible counts, headings, command labels and both empty states;
- bookmark addition and removal, including write failure and focus recovery;
- bookmarked deletion Ghost/Undo behaviour;
- Paste and Import returning to the full view when their existing reveal behaviour requires it;
- Drive-driven list changes while filtered;
- Export reading the complete stored list regardless of the visible view;
- keyboard and accessible-name behaviour.

All existing tests, type checking, production build, service-worker generation, repository and
public-build privacy audits, full and production dependency audits and no-attribution checks must
pass. Published acceptance must cover the subtle hierarchy and complete interaction on narrow
installed Android and macOS browser layouts in Light and Dark, including the existing visible
feature-update path.

## Explicit exclusions

`v1.0.0` does not add search, sorting, folders, grouping, general tags, archive, automatic tidy
rules, reading time, remote title enrichment, images, bulk actions, bookmark pinning, a bookmarked
database, a remembered default view or changes to article capture, sharing, swipe or sync contracts.

Package metadata, release documentation, the `v1.0.0` tag and GitHub release remain later closure
steps after the bounded implementation is accepted and separately authorised where required.

## Candidate verification

All 195 automated tests pass across 29 files, including six focused filter tests. Type checking, the
production build, service-worker generation, repository and public-build privacy audits, full and
production-only dependency audits with zero vulnerabilities and the no-attribution self-test pass.

Local rendered checks cover the 320px minimum and desktop width in Dark appearance. The heading,
text action and count fit without horizontal overflow; pointer focus remains quiet while keyboard
focus remains visible. The full and bookmarked views, filtered empty state, unbookmark announcement
and next-article focus recovery passed. The fictional local test bookmark state was restored after
the check. Published installed-Android and macOS acceptance remains.
