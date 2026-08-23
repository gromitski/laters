# Exploratory future ideas

## Status

These are observations collected after the successful personal MVP, not an accepted roadmap, promised features or permission to expand the product. Each idea needs its own evidence, privacy review and bounded release decision before implementation.

The MVP should remain fast, local-first and focused. Public source code must never imply a public reading list, shared database or committed credentials.

Bookmarks, source favicons and a non-conflicting whole-row pointer action were delivered and
accepted in `v0.2.0`; their contract is governed by [`mvp-2-definition.md`](mvp-2-definition.md).
Bidirectional Bookmark/Delete swipes and the long-press action sheet were delivered and accepted in
`v0.3.0`; their contract is governed by the
[mobile interaction shell record](planning/mobile-interaction-shell-plan.md). Their appearance in the
broader futures exploration does not bring the adjacent reading-time or sorting concepts into scope.
User-initiated sharing was subsequently selected as a small extension to that sheet: it opens the
system share chooser with only the saved URL, without a provider integration. The URL-only build is
published and passed its focused Android chooser, NotebookLM import and cancellation checks on
2026-08-23. A single pasted or manually entered URL was subsequently selected as the bounded
`v0.4.0` capture-path slice; bulk intake and every other entry below remain exploratory.
Manual title editing was then selected as the bounded `v0.4.1` follow-up; remote title enrichment
remains exploratory.

## Possibilities

| Idea | Potential value | Questions and constraints to resolve first |
| --- | --- | --- |
| Approximate reading time | Helps choose an article that fits the time available. | A reliable estimate usually needs article content or trustworthy metadata. Cross-origin access, extraction quality, privacy and failure fallbacks need investigation. |
| Order by reading time | Makes quick reads easy to prioritise. | Depends on credible reading-time data. Newest-first should remain available and the default must not change without evidence. |
| Cross-device sync | Makes the same list available elsewhere and reduces dependence on one browser. | Requires separate private identity and data infrastructure, migration and conflict handling. A public repository must contain neither user data nor live credentials. |
| Dark mode with a toggle | Improves comfort and personal preference. | Consider system preference plus a local override, while preserving contrast, icons, theme metadata and splash behaviour. |
| Folders and archive | Supports a larger or longer-lived collection. | Explicitly much later: both features risk turning a temporary reading tray into a system that needs organisation and maintenance. |
| Export | Provides portability and a recovery route before sync exists. | Choose a durable, privacy-safe format and define whether re-import, duplicates and timestamps are supported. Export must be explicitly user initiated. |
| Optional article images | Adds visual recognition. | Must be controlled by one global toggle. Remote image fetching can add tracking, bandwidth, layout and caching concerns; useful fallbacks are required. |
| Source favicons | Gives a quick source cue and was delivered in `v0.2.0`. | The accepted approach tries the publisher origin's `/favicon.ico` directly, never uses a central service and generates a stable hostname-derived fallback on any failure. See the MVP 2.0 definition. |
| More capture paths and bulk intake | A single pasted or manually entered URL is selected for `v0.4.0`; desktop capture and bulk intake otherwise remain exploratory. | The selected slice reads the clipboard only on activation, validates through the existing capture contract and falls back to inline entry. Extensions, import and bulk handling still require separate evidence and decisions. |

## Related opportunity

Some Android news-feed shares do not provide a useful article title. `v0.4.1` provides deliberate
local title editing without fetching anything. Automatic title enrichment remains a separate
possibility because fetching or extracting metadata has the same privacy, security and reliability
implications as reading-time and image enrichment.

## Selected idea retained for context

Bookmarking was added late to the visual exploration rather than the original possibilities table.
Release `v0.2.0` delivers only a persistent per-row bookmark toggle and its accepted hollow-star,
filled-star and subtle-wash states. It does not select bookmark filtering, sorting, a separate view,
or future automatic-tidy behaviour. Release `v0.3.0` adds a second route to the same bookmark toggle
through right swipe and the long-press action sheet; it does not expand bookmark scope.
