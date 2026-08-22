# Exploratory future ideas

## Status

These are observations collected after the successful personal MVP, not an accepted roadmap, promised features or permission to expand the product. Each idea needs its own evidence, privacy review and bounded release decision before implementation.

The MVP should remain fast, local-first and focused. Public source code must never imply a public reading list, shared database or committed credentials.

## Possibilities

| Idea | Potential value | Questions and constraints to resolve first |
| --- | --- | --- |
| Approximate reading time | Helps choose an article that fits the time available. | A reliable estimate usually needs article content or trustworthy metadata. Cross-origin access, extraction quality, privacy and failure fallbacks need investigation. |
| Order by reading time | Makes quick reads easy to prioritise. | Depends on credible reading-time data. Newest-first should remain available and the default must not change without evidence. |
| User-initiated sharing to NotebookLM or another LLM | Makes optional summarisation or further work convenient. | Prefer the device Share sheet or another explicit handoff. Never transmit saved URLs, titles or content automatically; provider capabilities and privacy terms vary. |
| Cross-device sync | Makes the same list available elsewhere and reduces dependence on one browser. | Requires separate private identity and data infrastructure, migration and conflict handling. A public repository must contain neither user data nor live credentials. |
| Dark mode with a toggle | Improves comfort and personal preference. | Consider system preference plus a local override, while preserving contrast, icons, theme metadata and splash behaviour. |
| Folders and archive | Supports a larger or longer-lived collection. | Explicitly much later: both features risk turning a temporary reading tray into a system that needs organisation and maintenance. |
| Swipe-away deletion | Makes clearing a phone list faster. | Must supplement rather than replace the visible X, preserve Undo, avoid accidental activation and work with scrolling, keyboard and assistive technology. |
| Export | Provides portability and a recovery route before sync exists. | Choose a durable, privacy-safe format and define whether re-import, duplicates and timestamps are supported. Export must be explicitly user initiated. |
| Optional article images | Adds visual recognition. | Must be controlled by one global toggle. Remote image fetching can add tracking, bandwidth, layout and caching concerns; useful fallbacks are required. |
| Source favicons | Gives a quick source cue and is a plausible nearer-term enhancement. | Loading icons from every publisher—or a central favicon service—can leak the reading list and fail unpredictably. Source, caching and fallback policy need a privacy-led design. |
| More capture paths and bulk intake | Supports desktop use, manual capture, import or adding several links at once. | Identify a real workflow before choosing between browser sharing, an extension, paste/import or another platform integration. Bulk capture must validate input and explain duplicates and failures. |

## Related opportunity

Some Android news-feed shares do not provide a useful article title. Title enrichment remains a separate possible slice because fetching or extracting metadata has the same privacy, security and reliability implications as reading-time and image enrichment.
