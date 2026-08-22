# Laters MVP 2.0 definition

## Status

MVP 2.0 was implemented in three bounded slices, published and accepted on 2026-08-22. It is
released as `v0.2.0`; the durable release summary is in [`releases/v0.2.0.md`](releases/v0.2.0.md).

The original MVP remains the accepted baseline in [`mvp-definition.md`](mvp-definition.md). The broader concepts under [`2026-08-22 Claude Futures Exploration`](2026-08-22%20Claude%20Futures%20Exploration/README.md) remain exploratory except where this document explicitly selects or supersedes them.

MVP 2.0 began as a product-stage name rather than a promised semantic version. Release closure
subsequently selected the backward-compatible minor release `v0.2.0`.

## Outcome

Make a short reading queue easier to scan and selectively retain without turning Laters into a bookmark manager or committing to a native-style gesture framework.

MVP 2.0 delivered three closely bounded improvements:

1. persistent per-article bookmarks with an immediately usable star button;
2. recognisable source icons with a deterministic local fallback; and
3. pointer-based whole-row opening that cannot conflict with Bookmark or Delete.

The release must preserve the existing local-only model, newest-first queue, direct article navigation, exact-URL duplicate refresh, Delete and seven-second Undo, update flow, offline application shell and Android share capture.

## User-visible scope

### Accepted row anatomy

Each normal article row has two clear visual lines:

1. source favicon or generated fallback, article title, then Delete; and
2. bookmark star, visible source hostname, then saved time.

The hostname belongs in the metadata line beside the star and saved time, not beside the favicon. The existing title fallback remains unchanged: when Android supplies no useful page title or surrounding text, the hostname becomes the title.

### Bookmark toggle

- Every normal article row exposes a visible star button.
- The star is the first item in the metadata line, followed by the visible hostname and saved time.
- The button has at least a 44px interaction target and an accessible name that includes the article title.
- An unbookmarked article shows the accepted hollow-star treatment.
- A bookmarked article shows the accepted bright-lime filled star with an ink outline and the
  subtle lime row wash from exploration 4a.
- Activating the button toggles the state immediately and persists it locally.
- The accessible name and pressed state change with the bookmark state; colour is not the only indicator.
- Bookmarking does not open the article. Opening, Bookmark and Delete are separate actions.
- A bookmark does not move, pin, sort, filter, archive or protect an item in this release.
- There is no bookmarks screen, bookmarked-only view or new navigation.
- Delete and Undo behave identically for bookmarked and unbookmarked items.

The star button is the accepted interim interaction for MVP 2.0. A future long-press action sheet may become another route to the same operation, but the persisted bookmark state and toggle behaviour must not depend on that later shell.

### Source favicon and deterministic fallback

- Each normal row displays a fixed-size decorative source marker at the start of the title line. The visible hostname remains in the separate metadata line.
- Laters attempts the conventional `/favicon.ico` URL on the saved article's own origin.
- The request contains the source origin only, never the saved article path, query or fragment.
- Laters must not use Google or another central favicon service, proxy or repository-hosted publisher mapping.
- A direct publisher request is an accepted trade-off. It may disclose the device IP address, request timing and normal browser request context to that publisher, but it does not aggregate the reading list with a new third party.
- The request should use a no-referrer policy where the browser supports it.
- Missing, blocked, mixed-content, invalid or slow icons are ordinary failure states. They must fall back without an error message, layout shift or broken-image indicator.
- Laters does not fetch or parse article HTML merely to discover a declared favicon in this release.
- The browser may cache successful icons normally and may revalidate them according to the publisher's cache policy on later renders. MVP 2.0 does not add a favicon proxy, binary IndexedDB cache or service-worker image cache.
- Offline use must remain sound: a favicon that is not already available may fall back while the reading list itself continues to work.

The fallback is generated locally and consistently:

- normalise the source hostname to lower case, remove a trailing dot and remove one leading `www.`;
- derive one or two display characters deterministically from that normalised hostname;
- map the same hostname through a documented stable hash into a small fixed palette with verified text/background contrast; and
- use the same normalisation for the visible source text, fallback characters and palette selection.

The precise hash function and palette values belong in the implementation plan, but they must be stable rather than dependent on item order, current time or random selection.

### Whole-row pointer opening

- A quick tap or click on otherwise non-interactive space in a normal article row opens the original article using the same destination and new-tab behaviour as the title link.
- The title remains a real semantic link and the primary keyboard and assistive-technology path.
- The row must not wrap the Star or Delete buttons inside an anchor and must not create invalid nested interactive content.
- Activating Star or Delete must never open the article or trigger another row action.
- Keyboard users must not receive a redundant second tab stop for the row when the title link already provides the same destination.
- Text selection, focus movement and existing link behaviour must not unexpectedly open the article.
- Ghost/Undo rows are never article-opening surfaces.

The intended implementation is a small pointer convenience around the existing semantic controls, not the first part of a bespoke gesture framework. If focused implementation proves unreliable or materially complicates accessibility, retain title-only opening and report the conflict before broadening scope.

## Data and storage contract

- Bookmark state belongs to the saved item and remains local in IndexedDB.
- Existing records without bookmark state must remain valid and behave as unbookmarked; upgrading must not clear or invalidate the current list.
- Toggling a bookmark must not change the article's URL, title, identifier or saved timestamp and must not reorder the list.
- Re-sharing the same exact normalised URL continues to refresh its title and saved time at the top without duplication, while preserving its existing bookmark state.
- Delete followed by Undo restores the complete item, including bookmark state.
- Favicon URLs, fetched image bytes and fallback colours do not need to become persisted saved-item data in MVP 2.0; they are derived from the article URL at presentation time.
- Keep storage behind the existing `ReadingListStore` boundary. Extend it only as required by the selected behaviour; do not add provider or repository layers for speculative sync.

## Interaction-shell and framework decision

The eventual target interaction model is similar to a native mobile list:

- quick tap opens an article;
- long press opens an article action menu;
- horizontal swipe initiates Delete; and
- visible or otherwise conventional alternatives keep every action accessible without gestures.

MVP 2.0 deliberately does not choose or introduce that shell. Bookmark uses a direct button and whole-row opening remains a small pointer enhancement.

Before implementing long press, an action sheet or swipe-to-delete, run a bounded architecture investigation. It should compare maintained frameworks or focused interaction libraries against:

- genuine swipe-row and long-press/action-sheet support rather than general component rendering;
- touch-versus-scroll arbitration and accidental-action prevention;
- accessible dialog semantics, focus trapping and focus restoration;
- gesture-free keyboard and assistive-technology alternatives;
- compatibility with the existing framework-free TypeScript, Vite, PWA, service worker and IndexedDB code;
- ability to preserve the accepted Laters visual identity rather than imposing an unrelated component style;
- bundle weight, maintenance health, browser support and migration cost; and
- whether adoption can be incremental or requires an application rewrite.

Do not build a custom multi-slice gesture system merely to avoid a dependency. Equally, do not migrate the application to a general framework unless the selected tool demonstrably solves the required interactions at lower total complexity.

This gate was subsequently completed for the post-v0.2.0 mobile-shell work. The selected approach is
a pinned, incremental use of Ionic Core's swipe-row and action-sheet custom elements, with no
application-framework rewrite. Its implementation record, measured bundle cost, safeguards and
pending physical-device acceptance are documented in the
[mobile interaction shell plan](planning/mobile-interaction-shell-plan.md). This does not change the
historical MVP 2.0 exclusions or the contents of release `v0.2.0`.

## Privacy, security and public-build boundaries

- Saved URLs, titles and bookmark state remain local and are not logged or transmitted to Laters infrastructure.
- The only newly accepted external request is the direct attempt to load a favicon from the saved publisher's origin.
- Never send the source hostname or URL to a central favicon service.
- Treat all publisher-controlled image responses as untrusted display content. Do not inject returned SVG or HTML into the document and do not execute publisher-provided markup.
- Favicon failure must not affect article opening, bookmark state, list rendering or share capture.
- The production audit must continue rejecting unintended external resources. Tests and audit documentation must distinguish the deliberate runtime publisher-favicon request from forbidden static third-party dependencies.
- No backend, account, analytics, API key, secret or new paid service enters scope.

## Accessibility and interaction states

MVP 2.0 must cover:

- bookmarked and unbookmarked rows;
- bookmark hover, focus, active, disabled, persistence failure and successful toggle states;
- successful favicon, deterministic fallback, loading and failed favicon states;
- row pointer activation without Star/Delete collision;
- long titles and narrow Android viewports with the additional source marker and star control;
- loading, empty, error, ghost/Undo and update-ready states from the original MVP; and
- reduced-motion behaviour for any bookmark background transition.

Bookmark persistence failure must leave or restore the last confirmed state and announce an understandable error. Favicon failure is decorative and silent.

## Explicit exclusions

- Reading-time calculation, queue-time totals and Quickest sorting.
- Long press, bottom sheets, swipe-to-delete or a selected interaction framework.
- Sharing, Copy link or NotebookLM-specific UI.
- Bookmark filtering, pinning, prioritisation, separate views or automatic tidy protection.
- Article-page parsing, title enrichment, thumbnails or full-content extraction.
- Settings, dark mode, folders, archive, export, bulk import or sync.
- Central favicon services, a Laters proxy or a curated source-icon database.

These remain exploratory and require later decisions. Visual proximity in the futures screens does not bring them into MVP 2.0.

## Acceptance criteria and result

The maintainer accepted MVP 2.0 after these criteria were met:

1. every normal row has a usable hollow/filled bookmark control with the accepted visual treatment;
2. bookmark state survives closing, reopening and application updates without affecting ordering;
3. exact-URL re-sharing preserves bookmark state while refreshing title and saved time;
4. Delete and Undo preserve the complete bookmark state contract;
5. each row shows either a publisher favicon or a deterministic source fallback without broken layout;
6. no central service receives the reading list or source domains;
7. tapping non-interactive row space opens the same original destination as the title without Star/Delete collisions, or a focused implementation report demonstrates why title-only opening was retained;
8. semantic links, native buttons, visible focus, accessible names, pressed state, 44px targets and live error announcements remain correct;
9. all original MVP capture, update, offline, duplicate, Delete and Undo behaviour remains intact;
10. focused automated tests, the full existing test suite, type-check/build and public-build audit pass; and
11. physical-device acceptance covers row tap, Bookmark, Delete, Undo, favicon success/fallback, persistence, re-share and update retention on the supported Android Chrome version.

## Delivery record

The planning boundary was satisfied before implementation. The maintainer accepted three bounded
delivery slices:

1. [persistent bookmarks](planning/mvp-2-slice-1-bookmarks-plan.md), initially published in
   `1f1d0e1` with its accepted star and touch-hover correction in `6f8a527`;
2. [publisher source markers](planning/mvp-2-slice-2-source-markers-plan.md), published in
   `d807cba` with final first-title-line alignment in `6dc1771`; and
3. [whole-row opening](planning/mvp-2-slice-3-whole-row-opening-plan.md), published in `c2c41f3`.

The final release gate passed 66 automated tests, TypeScript and production builds, the public-build
audit and GitHub Pages deployment. Focused physical Android testing accepted bookmark persistence
and visuals, favicon and fallback behaviour, corrected source-marker alignment, row opening and the
non-conflicting Bookmark, Delete, selection, scrolling and Undo paths.
