# Claude Design handoff

This is the completed first-MVP design brief and remains authoritative for that baseline. For selected post-MVP behaviour, read [`mvp-2-definition.md`](mvp-2-definition.md); its explicit scope supersedes the exclusions below only for MVP 2.0 work.

## How to use this brief

This is the authoritative design brief for the Laters MVP. Before proposing or implementing design work, read these repository sources in order:

1. [`memory/agreements.md`](../memory/agreements.md)
2. [`memory/now.md`](../memory/now.md)
3. [`memory/intent.md`](../memory/intent.md)
4. [`docs/mvp-definition.md`](mvp-definition.md)
5. this handoff

Inspect the existing interface and implementation rather than designing from this document alone. The main presentation files are `index.html` and `src/styles.css`; behaviour lives in `src/main.ts`, `src/pwa/registerServiceWorker.ts` and the storage/share modules under `src/`.

Do not commit, push, deploy or change repository visibility unless the maintainer explicitly authorises that action.

## Design outcome

Create a polished, distinctive and calm mobile-first visual treatment for the existing Laters personal read-later PWA, plus a coherent favicon and installable-app icon set.

The design should make saving, recognising, opening and removing a small queue of articles feel effortless. It should remain intentionally smaller and quieter than a bookmarking, productivity or knowledge-management product.

This is a visual and interaction-design renewal of the accepted MVP, not a product expansion. Preserve the implemented user journey, information architecture, behaviours and local-only model.

## Product context

- Primary user: one person using an Android phone.
- Primary entry point: Android's Share sheet.
- Primary job: capture an article without interrupting the current activity, then return later to a short reading queue.
- Production address: `https://laters.dustyb.in/`.
- Technical shape: framework-free TypeScript, semantic HTML, CSS, IndexedDB, Web App Manifest and service worker.
- Current styling and icons are temporary. They may be replaced completely, provided behaviour, accessibility and public-build constraints remain intact.

## Current feature contract

The design must support all of the following implemented behaviour.

### Installation and application updates

- Laters installs as a standalone PWA on Chrome for Android.
- The application shell and saved list remain available offline; original articles still require their external sites to be reachable.
- When a newly deployed version is ready, an accessible notice appears with the message **A new version of Laters is ready.** and an **Update** button.
- Selecting **Update** disables the button, changes its label to **Updating…**, activates the waiting service worker and reloads once.
- The update notice is absent during normal use and must not reserve empty space.

### Capturing articles

- Android shares valid HTTP or HTTPS article URLs to Laters.
- A successful share opens the full reading list and announces **Article saved to Laters.**
- Invalid share data announces **That shared item did not contain a valid article link.**
- A storage failure announces **Laters could not save that article. Please try again.**
- Shared titles use the useful title supplied by Android when available, then useful surrounding shared text, then the source hostname. Laters does not fetch remote page metadata.
- Sharing the same exact normalised URL again updates its useful title and saved time, moves it to the top and does not add another item.
- Distinct feed, redirect, tracking or rotating URLs remain separate items even when they appear to reference the same article.

### Reading list

- Articles appear in deterministic newest-first order.
- The list heading includes the current item count.
- Each item contains:
  - a useful title linking directly to the original article in a new browser tab;
  - a relative saved time such as **Saved 2h ago**; and
  - a clearly labelled **Delete** action.
- Relative times refresh when the app opens and returns to the foreground.
- Titles may be up to 240 characters. Long titles and URLs must wrap safely without breaking the layout.
- An empty list displays: **Nothing saved yet. On Android, share an article and choose Laters.**
- Loading, empty, invalid-share, storage-failure and deletion-failure states are distinct.

### Delete and Undo

- **Delete** removes an item immediately without a confirmation dialog.
- A status message announces the deleted title and presents an **Undo** action for seven seconds.
- **Undo** restores the item in its original saved position and returns focus to its title.
- When Undo expires while focused, focus moves safely to the reading-list heading.
- A failed deletion leaves the item visible and announces an accessible error.

### Local-only data

- Saved items live only in same-origin IndexedDB; no backend, account or cloud service exists.
- Normal application updates preserve saved items.
- The interface must continue to communicate: **Stored only in this browser. Clearing its data may remove your list.**
- Laters requests persistent browser storage where supported, but refusal is non-fatal and needs no additional UI.

## Required states

The final design must account for these states rather than showing only an ideal populated list:

| Area | Required states |
| --- | --- |
| Application | first load, normal online use, offline shell, update ready, updating |
| Reading list | loading, empty, one item, several items, very long title, storage failure |
| Share result | saved, invalid shared item, storage failure |
| Article row | default, link hover/focus/active, Delete hover/focus/active/disabled |
| Deletion | item removed, Undo available, Undo focused, Undo expired, restored, deletion failure, restoration failure |

## Accessibility and interaction constraints

- Maintain WCAG 2.1 AA contrast as a minimum.
- Preserve semantic headings, list structure, links and native buttons.
- Preserve visible keyboard focus and a logical focus order.
- Interactive targets must remain comfortable for one-handed mobile use; the current minimum target height is `2.75rem`.
- Do not rely on colour alone for status, errors or actions.
- Keep status and error announcements compatible with the existing live regions.
- Preserve the visually hidden **opens in a new tab** hint attached to article links.
- Respect `prefers-reduced-motion`. Motion should clarify state change, not decorate routine use.
- Do not replace clear labels with icon-only controls unless the accessible name and visual meaning remain unambiguous. **Delete**, **Undo** and **Update** are deliberately explicit.
- Validate the result at a minimum viewport width of `20rem` and across typical Android phone widths. The layout may expand on larger screens but should remain a focused single-column experience.

## Visual-system deliverables

Define and apply a small coherent token system rather than scattering new values through the stylesheet. Document the final tokens or make their roles evident in CSS custom properties.

Cover at least:

- colour roles for canvas, surface, text, muted text, border, link, focus, success, warning and error;
- typography roles for product title, section heading, article title, supporting text and controls;
- spacing, radius, border and elevation roles;
- interactive states for links and all button variants;
- responsive rules for article rows, status messages and the update notice; and
- restrained motion durations and easing where motion is used.

Supply replacement local assets for:

- the browser favicon;
- a `192 × 192` install icon;
- a `512 × 512` install icon; and
- a `512 × 512` maskable icon with an appropriate safe zone.

Update manifest and HTML theme colours to match the approved visual system. Do not load remote fonts, images, scripts, analytics or other third-party resources. Prefer system fonts or repository-hosted assets; justify any added dependency or bundled font before introducing it.

## MVP scope boundary

Do not add, imply or design navigation for features outside the accepted MVP. In particular, do not introduce:

- accounts, authentication or user profiles;
- a backend, cloud persistence, backup or cross-device sync;
- tags, folders, collections, archive, favourites or reading-status workflows;
- search, filtering, sorting controls or multiple list views;
- article previews, thumbnails, fetched metadata, full-text storage or reader mode;
- AI summaries, recommendations or categorisation;
- analytics, advertising, sharing history or social features;
- manual URL entry, import/export or browser extensions; or
- desktop-specific product flows beyond a sound responsive presentation.

Avoid decorative controls, tabs, menus, floating actions or empty placeholders that suggest deferred features. The MVP should still read as one direct screen: brand/context, optional update notice, reading list, transient status and local-storage explanation.

## Known future product opportunity — not part of this handoff

Some Android news-feed shares do not provide a useful article title, leaving Laters to display a source hostname or surrounding feed text. The maintainer has identified richer title capture as a possible future improvement.

Do not solve or visually mask this during the design slice. Reliable enrichment may involve redirect handling, remote metadata retrieval, privacy and security boundaries, offline behaviour, failure states and misleading page metadata. It requires a separate product and technical decision before implementation.

Likewise, do not attempt to merge distinct news-feed URLs heuristically. Exact-URL duplicate handling is the current accepted contract.

## Implementation and validation boundaries

- Prefer focused changes to `index.html`, `src/styles.css`, local icon assets and the relevant theme/manifest values in `vite.config.ts`.
- Do not rewrite storage, share-target, update or deletion logic merely to fit a visual concept.
- If a design genuinely requires markup changes, preserve existing element IDs, accessible roles and behavioural hooks unless the corresponding TypeScript and tests are deliberately updated.
- Avoid adding a component framework, CSS framework or runtime design dependency for this single-screen application.
- Preserve the public-build rule: only generated `dist/` output is deployed, with no sensitive information, local paths, source maps, repository documents or unintended external requests.
- Run the repository's automated tests, production build and public-build audit after implementation.
- Report any requested design behaviour that conflicts with this handoff before implementing it.

## Acceptance criteria for the design slice

The design work is ready for maintainer review when:

1. the populated list and every required state above have a coherent treatment;
2. the interface remains fast, legible and comfortable on Android;
3. all existing capture, open, duplicate, delete, Undo, update, persistence and offline behaviour remains intact;
4. keyboard, focus, screen-reader and reduced-motion behaviour is preserved;
5. the new favicon and installable icons are complete and technically valid;
6. no out-of-scope feature or implied navigation has been added;
7. tests, production build and public-build audit pass; and
8. the maintainer receives a concise summary of the visual direction, tokens, assets, files changed and any remaining design decisions.
