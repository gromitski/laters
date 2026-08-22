# Laters MVP definition

## Outcome

Laters should let the maintainer save an article from Android's Share menu in a few seconds, then return later to a minimal list and open or remove the saved link. It should feel closer to a temporary reading tray than a bookmark manager.

The MVP proves that this local-only workflow is useful and reliable enough for personal use. It does not attempt to establish a public product or a general-purpose knowledge system.

## Primary user journey

1. The maintainer finds an article in an Android app or browser.
2. They open Android's Share menu and choose Laters.
3. Laters validates and saves the shared HTTP or HTTPS URL locally.
4. The saved item becomes visible in the app with a useful title and saved time.
5. Later, the maintainer opens Laters and sees saved items ordered newest first.
6. Selecting an item's title opens the original URL.
7. Selecting its delete action removes the item from local storage and the list.

The normal path should require no account, form filling, categorisation or follow-up organisation.

## MVP capabilities

### Installable application

- Laters is an installable PWA with an appropriate name, icon set, display mode and theme metadata.
- The application shell remains usable when the device is offline.
- Opening an original article still depends on that external page and the device's network connection.
- Failure to install or register PWA features must not make the basic browser experience unusable.
- When a deployed application update is ready, the running app exposes an accessible update action that activates it and reloads once.

### Android share capture

- Laters registers as an Android Web Share Target in supporting browsers.
- It accepts a shared article URL and uses a shared title when one is available and trustworthy.
- It accepts only valid `http:` or `https:` destinations for saved article links.
- Missing or invalid share data produces a clear, accessible failure state and does not create a corrupt item.
- It receives form-encoded `POST` shares in the service worker, checks the explicit URL before Android-style text and title fallbacks, and redirects to an accessible result state.

### Local storage

- IndexedDB is the initial source of truth for saved items.
- Each saved item contains an opaque identifier, original URL, display title and saved timestamp.
- Saved data is not sent to a backend or third-party storage service.
- Laters requests persistent browser storage where supported, but refusal or lack of support is non-fatal.
- Normal application and service-worker deployments preserve the same-origin IndexedDB reading list.
- The interface explains the local-only constraint where it materially affects trust: clearing browser data, uninstalling in some environments or browser eviction may remove saved items.

### Small storage boundary

Presentation and share-target handling depend on a small storage contract rather than calling IndexedDB directly throughout the app. The initial contract needs only to:

- save one validated item;
- return all items in newest-first order; and
- delete one item by its opaque identifier.

The boundary exists to keep UI and browser storage concerns separate. It is not permission to build repository layers, sync machinery, provider factories or speculative infrastructure.

### Reading list

- The default view is a single compact list with no folders, filters or alternative views.
- Each row exposes the article title as the primary link, a human-readable saved time and an unambiguous delete control.
- Ordering is deterministic: newest saved timestamp first, with a stable tie-breaker if timestamps match.
- The empty state briefly explains how to add the first item using Android Share.
- Loading, storage failure, invalid data and empty states are distinct.
- Long titles and URLs must not break the mobile layout.

### Opening and deleting

- Opening an item follows its original URL without proxying or reproducing the article.
- The interface must make external navigation predictable.
- Deletion updates both IndexedDB and the visible list.
- A failed deletion leaves the item visible and reports the failure accessibly.
- Deletion is immediate and leaves a temporary ghost row with a seven-second accessible undo action.
- The compact X and Undo controls retain explicit accessible names and at least a 44px interaction target.
- Restoring an item preserves its original saved position.

## Quality boundaries

- Use semantic HTML and support keyboard operation, visible focus, accessible names and screen-reader announcements for meaningful status changes.
- Aim for WCAG 2.1 AA contrast and interaction behaviour from the first slice.
- Keep initial JavaScript and dependency weight proportionate to a tiny personal tool.
- Validate all share-target input at the application boundary.
- Do not log saved URLs or titles to third-party services.
- Avoid analytics, advertising and unnecessary network requests.
- Provide focused automated coverage for storage ordering, validation and deletion behaviour, plus an installability/build check supported by the selected tooling.
- Reserve real-device Android checks for behaviour that desktop automation cannot prove, especially installation and Share menu integration.

## MVP acceptance criteria

The MVP is successful when, on the agreed supported Android browser:

1. Laters can be installed and appears as a target for a shared article URL.
2. A valid shared URL is stored once and appears in the list without requiring an account or network-backed service; sharing it again refreshes that item at the top without duplication.
3. Several items remain available after closing and reopening the app and are ordered newest first.
4. Each item has a useful title, saved time, original destination and accessible delete action.
5. Opening an item navigates to the original URL.
6. Deleting an item removes it from both the list and IndexedDB.
7. Empty, invalid-share and storage-failure states are understandable and keyboard accessible.
8. The app requests persistent storage when supported and continues safely when the request is unavailable or refused.
9. No saved-item data is transmitted to a Laters backend because no backend exists.

## Explicitly deferred

- Accounts, authentication and multiple users.
- Cloud persistence, backup, import/export or cross-device sync.
- Tags, folders, search, filtering, archive or reading-status workflows.
- Offline copies of article content, reader mode or content extraction.
- Summaries, recommendations or any AI capability.
- Browser extensions, desktop share integrations and non-Android platform optimisation.
- Public launch features, analytics, monetisation and administration.

Deferred items are not implied future commitments. They require evidence of a real need before entering scope.

## Accepted interaction decisions

- Sharing an existing URL updates that item's useful title and saved time, moving it to the top without creating a duplicate.
- Deletion is immediate and offers a brief accessible undo action.
- Relative saved times update when the app loads and returns to the foreground, not on a continuous timer.
- The accepted MVP identity uses the self-hosted Bricolage Grotesque typeface, a white/near-black/lime visual system, the **Laters.** wordmark and the supplied icon family.
- The list remains a single edge-to-edge column without cards, navigation or decorative product features beyond the accepted MVP scope.
- The X changes to an in-row Undo control for seven seconds after deletion; live announcements and focus recovery remain part of the interaction contract.
- Application updates are user-controlled: Laters announces a ready version and applies it through an explicit update action.
- Duplicate identity is the exact normalised URL. Distinct redirect, tracking or rotating URLs are kept separately rather than merged using unreliable heuristics.

## Accepted Slice 2 decisions

- The initial support target is the current stable Chrome for Android; a minimum version will be recorded only when real-device or deployment evidence requires one.
- Link shares use a `POST` Web Share Target handled by the service worker, followed by a `303` redirect to the reading list.
- Android-style payloads may place the link in the shared text field, so Laters checks the explicit URL first and then extracts the first valid HTTP or HTTPS URL from text or title.
- Titles use the shared title when useful, then useful surrounding text, then the hostname. Laters does not fetch page metadata.
- A successful share opens the full reading list with an accessible confirmation. Invalid or failed shares show an accessible error without placing shared content in the redirect URL.

## Delivery slices

### Slice 1 — local reading-list proof

Select the smallest suitable frontend/PWA tooling, establish the saved-item type and storage contract, implement IndexedDB persistence, and build the accessible newest-first list using a temporary in-app way to add representative links. Verify ordering, persistence, opening and deletion without yet depending on Android Share integration.

### Slice 2 — install and share

Add the web app manifest, service worker/application shell behaviour and Android Web Share Target. Validate incoming payloads and connect successful capture to the existing storage boundary.

### Slice 3 — deployment and public-build safety

Build and test through GitHub Actions, publish only the generated `dist/` artifact to GitHub Pages, and configure the dedicated `laters.dustyb.in` origin. Add a repeatable build audit for common secrets, personal data, local paths, source maps and unintended third-party resources.

### Slice 4 — resilience and interaction completion

Request persistent storage non-fatally, refresh duplicate shares rather than creating copies, provide immediate deletion with a brief undo action, and update relative saved times when the app returns to the foreground.

### Slice 5 — real-device Android acceptance

Verify the production HTTPS installation, Share menu discovery, initial capture, duplicate refresh, reopening, persistence, offline shell, deletion and undo on the current stable Chrome for Android. Record the tested version and retain any unresolved platform limitation honestly.

### Slice 6 — design and launch readiness

Integrate the maintainer's supplied design and favicon package without weakening accessibility or the established interaction behaviour. Run a full repository public-readiness review, plus focused accessibility, performance and installability checks, before changing repository visibility.
