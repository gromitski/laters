# Exploratory future ideas

## Status

The subtle Bookmark filter was released as the final MVP slice in `v1.0.0`; its accepted contract
and evidence are maintained in [`bookmark-filter-plan.md`](planning/bookmark-filter-plan.md).
Published acceptance passed and the exact verified release is complete. Nothing remaining in this
file is approved for implementation or assigned a version. Each idea needs evidence, a privacy and
compatibility review, clear exclusions, acceptance criteria and a separately agreed bounded release
before work begins.

Laters should remain a fast, local-first personal reading queue. A future idea must not silently add
a Laters account, public reading list, shared database, analytics, committed credential, automatic
cloud upload or paid service.

## Open possibilities

| Idea | Potential value | Questions and constraints to resolve first |
| --- | --- | --- |
| Order by reading time | Makes quick reads easier to prioritise. | `v1.1.0` can store supplied estimates, but many articles may have none. Newest-first must remain available, and its default must not change without evidence. |
| Grouping and tagging | Groups a larger collection by subject, purpose or a small user-defined label. | This is the only direction currently identified for possible post-1.0 exploration, but it is not considered necessary. It risks turning a temporary reading queue into a filing system that needs naming, moving, sync, import/export and empty-group rules. |
| Archive | Retains completed or deferred links outside the active queue. | Needs a clear distinction from Delete and Bookmark, plus storage, sync, export/import and list-growth rules. |
| Optional article images | Adds visual recognition. | Must be controlled by one global setting. Remote fetching can introduce tracking, bandwidth, layout, caching and unreliable-image concerns. |
| More capture paths and bulk intake | Makes desktop and multi-link capture easier beyond Paste and CSV Import. | Browser extensions and other capture routes require separate security, maintenance and distribution decisions. Existing add-only CSV Import remains bounded to 1,000 rows and 10 MB. |
| Automatic title enrichment | Improves Android news-feed shares that provide weak titles. | Fetching or extracting metadata has the same privacy, security, cross-origin and reliability concerns as reading-time and image enrichment. Manual title editing already provides a local fallback. |
| Automatic tidy rules | Reduces long-term list growth. | Automatic movement or deletion could undermine the local-first recovery model. Any rule would need explicit control, reversibility and sync semantics. |

## Delivered context

Bookmarks and source favicons were released in `v0.2.0`; mobile gestures in `v0.3.0`; URL-only
article sharing, Paste, manual title editing and desktop article actions in `v0.4.2`; private Google
Drive sync in `v0.5.0` and `v0.5.1`; portable CSV Export in `v0.6.0`; reviewed add-only CSV Import
in `v0.7.0`; and System, Light and Dark appearance in `v0.8.0`.

The subtle Bookmark filter was released in `v1.0.0`, completing the personal-reading-queue MVP.
Optional CSV-supplied reading-time estimates are implemented, published and maintainer-accepted for
`v1.1.0` without publisher fetching, automatic estimation, sorting or totals. Release closure is
authorised.

Those delivered features remain governed by the accepted roadmap, release records and canonical
project memory. Their presence here as context does not reopen their contracts or bring adjacent
ideas into scope.
