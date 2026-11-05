# Search and publisher organisation sprint plan

## Status and outcome

Planning priorities selected by the maintainer on 2026-11-03: search and sorting are the next two
features; publisher grouping or sorting is the preferred organisation direction. Optional article
images are low priority. Search first, then publisher organisation, is the proposed delivery order.

Sprint goal: find a saved article quickly, then browse the reading queue by publisher without
manually filing every link. Plan two small, independently reviewable feature slices. The proposed
depth is a complete, bounded first version of each feature, rather than a prototype or a general
filing system. Exact controls, behaviour, versions and implementation remain to be agreed. This
document originally authorised planning only; it sets no delivery dates or release commitments.

Update, 2026-11-03: the maintainer authorised documenting the slices and starting Search. Its
bounded contract and delivery evidence now live in [the Search slice](article-search-plan.md).
[Publisher organisation](publisher-organisation-plan.md) is documented as the follow-on slice;
its final presentation remains open. The proposal below is context; the slice documents govern
their current status and detailed behaviour.

## Current delivery status — 2026-11-05

Search candidate `1.3.0` is implemented, technically verified and published. The maintainer accepts
matching, the Shared tool space hierarchy and its final 500ms panel fade/movement. The
[Search plan](article-search-plan.md) owns the current contract and acceptance record; the
proposal below is historical planning context for Search, not a request to re-decide its controls
or matching. Remaining physical-device scenarios stay distinct from accepted visual/motion feedback.
The maintainer then selected grouping and authorised the `1.4.0` publisher slice, retaining Newest
first as the default view. Its current plan supersedes the flat-sort proposal below. Implementation, technical checks
and publication are complete; the publisher plan records the receipts. Maintainer visual/device
acceptance remains. Optional images remain low priority. No tag or
release is authorised; triage routing is deferred under its separate plan.

## Scope decisions before implementation

Agree these together using a small mobile and desktop layout proposal, not a broad redesign:

- Search: confirm title and displayed publisher hostname as the initial searchable fields, whether
  the full saved URL should also match, and simple case-insensitive matching rather than fuzzy or
  full-text search. Confirm query clearing and its interaction with the Bookmark filter.
- Publisher organisation: choose a flat publisher sort or a grouped view with publisher headings.
  The proposed smallest first version is a publisher A–Z sort with newest-first articles within
  each publisher. Headings are an alternative if they make the collection easier to scan.
- Keep newest-first as the normal starting view unless the maintainer chooses otherwise. Propose
  temporary search and sort state, with no stored or synced preference in this first version.
- Agree how Paste, CSV Import and an add-link arrival reveal newly added articles when the active
  search or publisher view would otherwise hide them. Preserve an explicit, truthful success state.

## Slice 1 — Search saved articles

User outcome: enter a remembered title or publisher, see matching saved articles, open the intended
article, then clear the query to return to the current queue.

Proposed work:

1. Add a restrained, labelled search control that fits the existing reading-list hierarchy on
   narrow mobile and desktop layouts. Keep Paste and Bookmark filtering easy to reach.
2. Match the agreed existing saved fields locally. Combine the query with the current Bookmark
   filter; search should not fetch article pages or send queries elsewhere.
3. Distinguish an empty library, no bookmarks and no search matches. Show an accurate visible count
   and a straightforward way to clear the search, without losing keyboard focus while typing.
4. Keep results current after title edits, bookmark changes, capture, Import, sync and Delete/Undo.
   Define focus recovery when an action removes the focused result.

Acceptance:

- A fictional mixed collection demonstrates the agreed matching rules, case handling, blank-query
  behaviour and no-results recovery, both in all articles and bookmarks.
- Clearing the query restores the underlying view; existing stored articles are unchanged.
- Searching and clearing work with keyboard and touch, offline, in Light and Dark. Opening a
  result retains the original external-page navigation; reading that page still needs network
  access unless the publisher/browser independently makes it available offline.
- Capture and Import completion remain discoverable; Delete retains its seven-second Undo route
  even if the query or filter changes while Undo is available.

## Slice 2 — Browse by publisher

User outcome: bring articles from the same publisher together, find a useful article, and easily
return to the ordinary newest-first queue.

Proposed work:

1. Implement the agreed publisher sort or grouped presentation using the existing source-hostname
   identity. Its normalisation already ignores case, a trailing dot and an initial `www.`.
   Other subdomains remain distinct; do not guess publisher brands, follow redirects or merge
   unrelated hosts. Explain this boundary in the agreed user-facing wording where needed.
2. Preserve newest-first ordering within a publisher, with deterministic ties. Derive the view
   from the saved collection rather than changing saved times or rewriting stored list order.
3. Combine publisher organisation with search and the Bookmark filter. If headings are selected,
   display only groups with visible results and keep article and group counts unambiguous.
4. Preserve article actions, Delete/Undo, focus and scroll behaviour when publisher ordering
   changes. Sync updates must refresh the derived view without creating sort-specific operations.

Acceptance:

- Repeated publishers appear together and the agreed ordering is predictable across re-renders.
  Verify equal saved times, `www.` variants, distinct subdomains and a single-publisher collection.
- Search and bookmarks work within the publisher view; clearing search and returning to the
  normal queue preserve the expected context and saved article data.
- Undo restores the article in the correct current position. View changes never hide the only
  usable Undo route. Visible counts exclude pending-deletion ghost rows.
- Export still covers the complete collection in its existing format and order; Import still
  checks duplicates against the complete collection, regardless of the current visible results.

## Implementation boundaries and risks

Current entry points are `src/main.ts`, `src/ui/readingListFilter.ts`,
`src/ui/readingListPresentation.ts` and `src/domain/sourceIdentity.ts`. Saved titles, URLs, saved
times and optional reading-time estimates already exist. Publisher identity is derived from the
saved URL; full article text and a verified publisher-brand catalogue are not stored.

The proposed approach extends local presentation helpers and their focused tests. Rendering and
summary counts must use the same derived view. The current presentation helper also positions
pending-deletion ghost rows, so filtering, sorting and Undo must be designed together. No new
dependency or storage architecture is anticipated; investigate a measured limitation before
introducing an index, caching layer or large performance harness.

The main risks are crowding the mobile heading, losing focus while results change, hiding newly
saved articles, and making Undo inaccessible. Check these early with fictional data at 320px and
desktop width. Use a representative larger local fixture for responsiveness; agree its size and
record the measured result rather than inventing a performance guarantee.

These slices do not include tags, folders, manual filing, archive, reading-time sorting, images,
automatic enrichment, full article search, a backend, analytics or new cloud services. The broader
filing need and reading-time ordering stay in the future-ideas backlog.

## Verification and delivery sequence

1. Agree the decisions above and the bounded first-version depth before implementation.
2. Implement search; run focused matching, view-state and interaction checks plus the existing
   test suite, type checking, production build, repository/public-build privacy audits and full
   and production dependency audits. Record actual results, not inherited test counts.
3. For an accepted implementation slice, follow `memory/agreements.md`: verify clean attribution
   and privacy-safe commit metadata, commit and push the bounded change to `main` for Pages
   publication. The authorised Search implementation follows this workflow; planning alone did not.
4. Verify the published build and visible version/update route, then obtain a short Android and
   desktop acceptance check for finding, opening and clearing results. Resolve failures before
   proceeding to the publisher slice.
5. Implement publisher organisation through the same checks and publication/acceptance sequence,
   including combined search, bookmarks, capture, Import, sync and Delete/Undo checks. Human
   acceptance includes the visual hierarchy and usefulness of the chosen publisher presentation.

Do not bundle unrelated connection repairs or the unresolved newsletter-triage transfer defect
into these feature slices. That defect remains open in `docs/roadmap.md`; it is not assumed fixed
and is not an automatic prerequisite for local search or publisher ordering. If it prevents a
required combined acceptance check, record that limitation and agree separate defect work before
calling that check complete. Tags and GitHub releases require separate authorisation.
