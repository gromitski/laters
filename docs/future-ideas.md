# Exploratory future ideas

## Status

These are observations collected after the successful personal MVP, not a promise to expand the
product. The selected public-readiness sequence through Export now lives in the
[accepted roadmap](roadmap.md); every other idea here still needs its own evidence, privacy review
and bounded release decision before implementation.

## Before any public Google Drive access

- The OAuth support contact is now `hello@dustyb.in`, and mailbox ownership was confirmed on
  2026-08-23. The public privacy policy is live and registered in the OAuth branding configuration.
- Google's Verification Centre reports that verification is not required while the OAuth app is in
  **Testing**. Before public access, make a separate decision to move to **In production** and
  complete any brand checks Google then requests.
- Keep the OAuth application in **Testing** with only the maintainer admitted until that decision.
- The accepted next step is `v0.5.5`: create a separate production project and client, keep it in
  **Testing**, configure safeguards and complete a controlled data-preserving transition. Public
  OAuth publication remains the separate `v0.5.6` gate.

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
remains exploratory. A visible desktop route to the existing article menu and a modest wide-screen
shell expansion were selected as the bounded `v0.4.2` follow-up; no general desktop redesign is
selected. These accepted post-`v0.3.0` slices are consolidated in release `v0.4.2`; the remaining
table is still exploratory rather than an accepted roadmap.

## Possibilities

| Idea | Potential value | Questions and constraints to resolve first |
| --- | --- | --- |
| Approximate reading time | Helps choose an article that fits the time available. | A reliable estimate usually needs article content or trustworthy metadata. Cross-origin access, extraction quality, privacy and failure fallbacks need investigation. |
| Order by reading time | Makes quick reads easy to prioritise. | Depends on credible reading-time data. Newest-first should remain available and the default must not change without evidence. |
| Cross-device sync | Private Google Drive article sync is released in `v0.5.0`, with automatic 100-change housekeeping released in `v0.5.1`. Phone/desktop add, delete and Undo propagation are accepted. | `v0.5.5` covers the separate production project and safe client transition; `v0.5.6` is the explicit public OAuth gate. |
| Dark mode with a toggle | Intended after Import, but not yet defined as a bounded release. | Consider system preference plus a local override, while preserving contrast, icons, theme metadata and splash behaviour. |
| Folders and archive | Supports a larger or longer-lived collection. | Explicitly much later: both features risk turning a temporary reading tray into a system that needs organisation and maintenance. |
| Export | Selected as `v0.6.0` in the accepted roadmap. | Choose a durable, privacy-safe format. Export must be explicitly user initiated; Import remains a later slice. |
| Optional article images | Adds visual recognition. | Must be controlled by one global toggle. Remote image fetching can add tracking, bandwidth, layout and caching concerns; useful fallbacks are required. |
| Source favicons | Gives a quick source cue and was delivered in `v0.2.0`. | The accepted approach tries the publisher origin's `/favicon.ico` directly, never uses a central service and generates a stable hostname-derived fallback on any failure. See the MVP 2.0 definition. |
| More capture paths and bulk intake | A single pasted or manually entered URL was delivered in `v0.4.0`; desktop capture and bulk intake otherwise remain exploratory. | The delivered slice reads the clipboard only on activation, validates through the existing capture contract and falls back to inline entry. Extensions, import and bulk handling still require separate evidence and decisions. |

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
