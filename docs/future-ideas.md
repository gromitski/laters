# Exploratory future ideas

## Status

The subtle Bookmark filter was released as the final MVP slice in `v1.0.0`; its accepted contract
and evidence are maintained in [`bookmark-filter-plan.md`](planning/bookmark-filter-plan.md).
Published acceptance passed and the exact verified release is complete. Search (`1.3.0`), publisher
groups (`1.4.0`), chronological views (`1.5.0`) and sync usability (`1.6.3`) have since been delivered.
Their plans and canonical memory own acceptance evidence and remaining device checks. Persistent
sign-in and additional sync providers are selected for documentation/planning only. Other open ideas
are not implementation authority or assigned releases. Each later idea needs evidence, a privacy and
compatibility review, clear exclusions, acceptance criteria and a separately agreed bounded release
before work begins.

Laters should remain a fast, local-first reading product. A future idea must not silently add
a Laters account, public reading list, shared database, analytics, committed credential, automatic
cloud upload or paid service.

Priority update, 2026-11-03: search and publisher-based organisation are selected for the next
feature sprint. The maintainer subsequently authorised documenting the slices and starting
[Search](planning/article-search-plan.md). [Publisher organisation](planning/publisher-organisation-plan.md)
was delivered as candidate `1.4.0`; the accepted picker/motion and published `1.5.0` oldest-first
addition share its linked plan, with Newest → Oldest remaining the default. The [sprint plan](planning/search-and-publisher-sprint-plan.md)
records the sequence. Optional article images are low priority and outside this sprint.

## Open possibilities

| Idea | Potential value | Questions and constraints to resolve first |
| --- | --- | --- |
| Persistent sign-in and more sync providers | Selected for documentation/planning on 2026-11-08: open Laters and sync without routine reconnects; Google Drive, Dropbox and OneDrive, with Dropbox the first new provider. | The [sign-in service plan](planning/sign-in-service-plan.md) and [privacy/security explanation](sign-in-service-privacy-security.md) own free-tier limits, credential/operator access, architecture and delivery decisions. Planning only; no implementation or billing authorised. |
| Article search | Published candidate `1.3.0`: find saved articles by title or publisher. Matching, shared layout and 500ms panel motion accepted on 2026-11-05. | The Search plan records delivery and remaining device scenarios. Temporary local matching composes with bookmarks and preserves Undo; no full-content fetching or backend. No tag/release authorised. |
| Filing, organisation and sorting | Publisher groups delivered in `1.4.0`, followed by the three chronological/grouped views in `1.5.0`, addressing the selected publisher-organisation slice. | The [publisher plan](planning/publisher-organisation-plan.md) retains Newest → Oldest as the load default and records Search/Bookmark composition and acceptance. Tags, folders and manual filing remain open possibilities, not selected designs. |
| Order by reading time | Makes quick reads easier to prioritise; remains a later sorting possibility outside the publisher-focused sprint. | `v1.1.0` can store supplied estimates, but many articles may have none. Newest-first must remain available, and its default must not change without evidence. |
| Archive | Retains completed or deferred links outside the active queue. | Needs a clear distinction from Delete and Bookmark, plus storage, sync, export/import and list-growth rules. |
| More capture paths and bulk intake | Makes desktop and multi-link capture easier beyond Paste, CSV Import and the selected `v1.2.0` add-link candidate. | Browser extensions and other capture routes require separate security, maintenance and distribution decisions. Existing add-only CSV Import remains bounded to 1,000 rows and 10 MB. The bounded add-link handoff is governed separately by the roadmap. |
| Automatic title enrichment | Improves Android news-feed shares that provide weak titles. | Fetching or extracting metadata has the same privacy, security, cross-origin and reliability concerns as reading-time and image enrichment. Manual title editing already provides a local fallback. |
| Automatic tidy rules | Reduces long-term list growth. | Automatic movement or deletion could undermine the local-first recovery model. Any rule would need explicit control, reversibility and sync semantics. |
| Optional article images | Low priority; deferred beyond search and publisher organisation. Could add visual recognition later. | Must be controlled by one global setting. Remote fetching can introduce tracking, bandwidth, layout, caching and unreliable-image concerns. |

## Delivered context

Bookmarks and source favicons were released in `v0.2.0`; mobile gestures in `v0.3.0`; URL-only
article sharing, Paste, manual title editing and desktop article actions in `v0.4.2`; private Google
Drive sync in `v0.5.0` and `v0.5.1`; portable CSV Export in `v0.6.0`; reviewed add-only CSV Import
in `v0.7.0`; and System, Light and Dark appearance in `v0.8.0`.

The subtle Bookmark filter was released in `v1.0.0`, completing the personal-reading-queue MVP.
Optional CSV-supplied reading-time estimates were released in `v1.1.0` without publisher fetching,
automatic estimation, sorting or totals.

Those delivered features remain governed by the accepted roadmap, release records and canonical
project memory. Their presence here as context does not reopen their contracts or bring adjacent
ideas into scope.
