# 03 — Experience guide

## The journey this design serves

The user is elsewhere — a feed, a browser, a chat. They share a link to Laters and carry on with
what they were doing. Later, they open Laters to a short list, tap a title, and read. When they
are done with an item they flick it away with one thumb. The app should feel like clearing a
tray, not managing a library.

Three consequences for the design:

1. **The title is the interface.** It is the largest, darkest thing in every row. Metadata is
   small and uppercase so it reads as a label, not as competing content.
2. **Deleting must be one confident tap** with a graceful way back. No dialog, no confirmation.
3. **Nothing implies a bigger product.** No tabs, no menus, no search, no counts of things the
   user cannot act on.

## Screen anatomy, top to bottom

1. Masthead — lime eyebrow chip, wordmark **Laters.**
2. Update notice — present only when a new service worker is waiting; absent, it reserves no space
3. List heading row — `SAVED ARTICLES` and the lime count pill
4. Article rows — newest first, hairline separated, edge to edge
5. Transient status or error band
6. Local-storage footnote

## Required states

### Application

| State | Treatment |
| --- | --- |
| First load | Masthead and heading paint immediately; rows animate in as the IndexedDB read resolves |
| Normal online use | The populated list |
| Offline shell | **Identical to normal use.** The list is local; there is nothing honest to indicate. Do not add an offline badge |
| Update ready | Lime band below the masthead, 1.5px ink border, explicit **Update** button |
| Updating | Same band; button disabled, label **Updating…**, 55% opacity, `cursor: wait` |

### Reading list

| State | Treatment |
| --- | --- |
| Loading | `Loading your saved articles…` centred and muted under the heading row; count pill absent |
| Empty | `Nothing saved yet. On Android, share an article and choose Laters.` centred, 14.5px, muted; count pill shows `0 items` |
| One item | Count pill reads `1 item` — the existing singular logic is unchanged |
| Several items | Rows in deterministic newest-first order |
| Very long title | Wraps to as many lines as it needs; `overflow-wrap: anywhere` guards bare URLs. The row grows, the control stays vertically centred |
| Hostname-only title | Rendered exactly like any other title. **Do not style it as degraded** — enrichment is explicitly out of scope |
| Storage failure | Error band replaces the list; heading row stays; count pill absent |

### Share result

| Result | Message | Treatment |
| --- | --- | --- |
| Saved | `Article saved to Laters.` | Status band, lime tick, appears with the full list behind it |
| Invalid | `That shared item did not contain a valid article link.` | Error band, `!` disc |
| Storage failure | `Laters could not save that article. Please try again.` | Error band, `!` disc |

### Article row

| State | Treatment |
| --- | --- |
| Default | Ink title, muted uppercase meta, hairline X at 30px |
| Link hover | Lime marker wipes in left to right over 300ms; row tints `--surface-hover` |
| Link focus | 3px ink ring at 2px offset **and** the marker wipes in |
| Link active | Marker held at full width |
| X hover | Disc fills lime, icon goes ink, scales to 1.1 |
| X focus | 3px ink ring at 3px offset |
| X active | Disc fills `--accent-ink`, scales to 0.94 |
| X disabled | 45% opacity, `cursor: wait` — this is the existing `setBusy` behaviour during a refresh |

### Deletion and undo

| Step | What the user sees | What must still be true |
| --- | --- | --- |
| Tap X | Row becomes a ghost **in place**: title block swaps to `Deleted “Title”.`, X morphs to the undo arrow over 440ms, lime ring begins draining for 7s | The item is already deleted from IndexedDB. `#status-message` still announces `Deleted “Title”.` |
| Undo available | Ring draining, arrow lit, row still occupying its slot | The undo control receives focus, exactly as the current implementation focuses its Undo button |
| Undo focused | Ink focus ring around the arrow | — |
| Undo pressed | Ghost text and arrow morph back; the row returns to normal in its original position | `store.save(item)` restores it; announce `Restored “Title”.`; focus moves to the restored title |
| Undo expired | Row collapses over 460ms — max-height to 0, fades, drifts up 6px, blurs 3px; rows below slide up into the gap | If the undo control held focus, move focus to `#list-heading`. Status settles to `Deleted “Title”.` with no action |
| Deletion failure | Row does not become a ghost; it stays as it was; error band appears | The X returns to enabled |
| Restoration failure | Error band `This article could not be restored.` | — |

### Implementing in-row undo without rewriting deletion

The existing flow already does the hard part. Suggested minimal change:

- keep `deleteArticle` exactly as it is: delete from the store, then refresh
- have `refreshList` render an item that is inside its undo window as a ghost row rather than omitting it — the pending item and its original index are already held in memory by `showUndoStatus`
- keep `#status-message` as the announcement channel; it may be visually hidden while the ghost row is showing so the message is not said twice on screen
- the seven-second timer, the focus handoff to `#list-heading` on expiry, and the restore-to-original-position behaviour are unchanged

If that turns out to fight the current render loop, fall back to the page-level status band with
these tokens applied. The visual language survives; only the location of the undo changes.

## Accessibility contract

- Semantic structure unchanged: `main`, `header`, `h1`, `section`, `h2`, `ul`/`li`, native `a` and `button`
- `role="status"` / `aria-live="polite"` regions untouched; `role="alert"` for errors untouched
- The visually hidden **(opens in a new tab)** hint stays inside every article link
- Every interactive target is at least 44px in both dimensions, including the 30px X
- Focus order follows the DOM; the skip link still lands on `#saved-articles`
- No meaning is carried by colour alone: the X/arrow differ in shape, bands carry a mark and their own copy, the count pill carries a number
- Contrast meets AA throughout; see `01-visual-system.md` for measured ratios
- Motion is expressive by default and reduced to 1ms under `prefers-reduced-motion: reduce`

## Copy

Every user-facing string is taken verbatim from the current implementation. Nothing has been
reworded. The only copy **removed** is the masthead intro line and the "Newest first" kicker.
