# Publisher organisation slice

## Status

Documented follow-on slice on 2026-11-03. The maintainer selected grouping or sorting by publisher
as the useful organisation direction. Implementation has not started and no version is assigned.
Search is delivered and reviewed first. Flat sorting versus grouped headings remains a product
choice before this slice begins.

## User outcome and proposed scope

Bring articles from the same publisher together, find a useful article, and easily return to the
ordinary newest-first queue. The proposed smallest complete first version offers publisher A–Z
ordering with newest-first articles within each publisher and deterministic ties. A grouped view
with publisher headings is an alternative if it makes the collection easier to scan.

Agree a restrained mobile/desktop control and whether headings are useful before implementation.
Keep newest-first as the initial view and propose temporary sort state without a persisted or
synced preference. No manual filing, tags, folders or publisher-management screen is proposed.

## Behaviour and data boundaries

- Reuse the existing source-hostname normalisation: case, trailing dot and initial `www.` are
  ignored; other subdomains remain distinct. No brand catalogue, redirects or external lookup.
- Derive presentation from the complete saved list without changing saved times or stored order.
  Search and Bookmark filtering compose with publisher ordering. If headings are selected, hide
  groups without visible results and make article/group counts unambiguous.
- Preserve Search query and focus when changing ordering. Returning to newest-first keeps the
  agreed Search/Bookmark context. Agree capture and Import reveal behaviour explicitly.
- Keep Delete/Undo available across query, filter and ordering changes; restored articles appear
  in the correct current position when eligible. Ghost rows do not count as saved articles.
- Resolved Drive changes update the view without new sort operations. Export remains whole-list
  in its existing format/order; Import deduplicates against the complete collection.
- No schema migration, publisher metadata fetching, backend, new account, analytics, automatic
  upload, image work, reading-time sorting or changes to the triage handoff.

## Verification and acceptance

Test repeated publishers, deterministic ties, `www.` variants, distinct subdomains, empty and
single-publisher collections, combined Search/bookmark views, resolved updates and Undo position.
Check the chosen control/headings with keyboard and touch, at 320px and desktop width in Light
and Dark. Confirm counts, focus and capture/Import reveal behaviour.

Run the existing test, type, build, privacy, dependency and attribution gates. Follow the normal
checked implementation-slice commit/push and Pages verification workflow, then obtain Android
and desktop human acceptance of the publisher presentation. Tags/releases need separate authority.

The unresolved newsletter-triage defect remains separate; do not claim it is fixed or make this
slice depend on a wider filing system. Optional images remain low priority.
