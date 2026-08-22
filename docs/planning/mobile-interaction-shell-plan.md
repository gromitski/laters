# Mobile interaction shell plan and implementation record

## Status

The bounded architecture investigation and first implementation were completed on the `dev` branch
on 2026-08-22, then promoted unchanged to `main` in commit `72c44f7`. GitHub Actions passed every
build and deployment gate and published the shell at `https://laters.dustyb.in/`. The change is not
part of release `v0.2.0` and has not yet passed physical Android acceptance.

## Product outcome

Normal article rows keep all of their existing visible controls and gain two native-style shortcuts:

- a horizontal swipe from right to left reveals a bright-lime Delete action, while a complete swipe
  requests the same existing Delete operation;
- a touch long press opens a bottom action sheet containing Read now, Bookmark or Remove bookmark,
  Delete and Cancel.

Quick tap still opens the article. The visible title link, Star and Delete button remain the primary,
gesture-free ways to perform those actions. The action sheet deliberately does not add Share or Copy
link because neither action has an accepted visible alternative or existing application behaviour.

## Architecture decision

Use a small, pinned subset of Ionic Core 9 web components rather than migrating Laters to a UI
framework:

- `ion-item-sliding`, `ion-item-options` and `ion-item-option` provide the maintained swipe-row
  primitive and touch-versus-scroll arbitration;
- `ion-action-sheet` provides the maintained modal presentation, focus trap, Escape handling,
  backdrop dismissal and focus restoration;
- Laters retains its framework-free TypeScript entry point, DOM rendering, IndexedDB store, Vite
  build and service worker;
- only the selected custom elements are registered, and their presentation is reset to the existing
  white, ink and bright-lime visual language.

This is lower-risk than a bespoke swipe recogniser and modal focus system, and substantially smaller
than rewriting the application around Ionic, React, Vue or another application framework. The
dependency is pinned exactly at `@ionic/core` 9.0.0 so an install cannot silently move the gesture
behaviour to a new release.

## Interaction and safety contract

- Touch or pen long press waits 500 ms and cancels after more than 12 px of movement, on pointer
  cancellation, or when a swipe begins. It does not start on the Star or visible Delete control.
- A long press consumes the following synthetic click so it cannot also open the article.
- Swipe movement greater than 6 px suppresses the row click that could otherwise follow the drag.
- Partial swipe reveals Delete and leaves the user in control. Full swipe and tapping the revealed
  action both call the existing `deleteArticle` path, including the existing seven-second Undo.
- While a bookmark mutation is pending, the row buttons and sliding action are disabled together.
- Only one action sheet may be open at a time. Its Bookmark label reflects current state when opened.
- Right-click or the browser context-menu gesture opens the same menu outside touch use. Shift+F10
  and the Context Menu key provide a keyboard route from the semantic article link.
- Reduced-motion preference disables action-sheet animation and retains the existing reduced-motion
  treatment for row state changes.

## Data, privacy and compatibility

The shell adds no storage fields, migration, network service, analytics or remote API. Read,
Bookmark, Delete and Undo continue through the existing functions and `ReadingListStore` boundary.
Existing IndexedDB records and the same-origin update contract are unchanged. Ionic code is bundled
locally; the public build does not load a component library from a CDN.

## Accessibility contract

- The saved articles remain a named list and each shell remains a list item.
- The title remains a real link, and Star and visible Delete remain native buttons with their current
  accessible names and target sizes.
- The action sheet has the article title and hostname as its accessible name and description context.
- Focus enters the modal, is trapped among its actions, Escape and Cancel dismiss it, and dismissal
  returns focus to the article title.
- Delete is exposed as destructive; swipe is an enhancement and never the only deletion route.
- Long press is an enhancement and never the only route to Read, Bookmark or Delete.

## Measured implementation cost

The verified production build contains approximately 51 KB of compressed application JavaScript
and CSS. The build remains comfortably small, but the interaction shell adds roughly 43 KB compressed
over the pre-shell application. That is an explicit trade-off for maintained swipe and modal
primitives rather than hidden framework growth.

## Agent-owned verification completed

- TypeScript type-check passed.
- All 68 automated tests passed across 13 files, including focused long-press policy tests.
- Production build and service-worker generation passed.
- Public-build audit passed with no unintended secret, local-path, source-map or static third-party
  resource finding.
- At a 360 px browser viewport, normal rows retained the accepted appearance and vertical page scroll.
- Shift+F10 opened the correctly named action sheet; its four actions, focus containment, Escape
  dismissal and focus restoration were verified.
- Partial swipe revealed the bright-lime Delete action. Selecting it used the existing deletion path,
  and Undo restored the complete item.
- Existing Bookmark state was changed through the sheet and restored during testing.
- No browser console error or warning remained after component initialisation.

Browser emulation cannot prove physical touch long-press timing, finger scroll arbitration or Ionic's
full-swipe threshold. Those are explicit device gates, not inferred passes.

## First physical Android findings and correction

The first published Android check confirmed the shell works but found three acceptance failures:

- focused or selected title text could acquire an unrelated black browser outline;
- the 500 ms hold also allowed Android text selection and dictionary UI to appear beneath the action
  sheet; and
- deleting further down a long queue could rebuild the complete Ionic list, move the viewport to the
  top and leave the time-limited Undo control off-screen.

The focused correction keeps the existing keyboard-accessible link but replaces its default outline
with the designed lime band and a high-contrast underline. On coarse-pointer devices only, article
text selection and the native touch callout are disabled because hold is now an application gesture;
fine-pointer desktop text selection remains available.

Delete, expiry and Undo now mutate only the affected row instead of replacing every list child. Focus
moves to Undo, the restored article or an adjacent article with `preventScroll`, so the browser has no
reason to move the viewport. Dismissed action sheets are removed before their chosen action mutates
the row, preventing a hidden overlay focus trap from competing with Undo. Browser regression checks
confirmed that lower-page Delete leaves Undo in place, Undo restores the same row in place, restored
focus uses the Laters underline rather than a black box, and action-sheet deletion leaves no hidden
dialog host. The coarse-pointer selection correction still requires the physical Android recheck.

## Physical Android acceptance after promotion to `main`

Use the published GitHub Pages build in current stable Chrome for Android and confirm:

1. a quick row tap opens the article exactly once;
2. a normal vertical drag scrolls without opening the menu or revealing Delete;
3. holding title or non-control row space opens the sheet without also opening the article;
4. small finger movement during the hold is tolerated, while deliberate movement cancels it;
5. Star and visible Delete still work directly and do not trigger the long-press menu;
6. a partial left swipe reveals Delete and can be closed without deleting;
7. a complete left swipe deletes once and Undo restores the complete item;
8. sheet Read, Bookmark or Remove bookmark, Delete, Cancel and backdrop dismissal all behave once;
9. long titles, bookmarked rows and favicon fallback rows keep their accepted alignment and colour;
10. closing and reopening the installed PWA preserves the existing list and bookmark state.

Any accidental open/delete during scroll, double action, stuck row, inaccessible control, lost data,
or persistent visual state is a failure and blocks release.
