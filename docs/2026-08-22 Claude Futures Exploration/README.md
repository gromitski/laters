# Laters — futures exploration, 22 August 2026

Six UI explorations of the maintainer's post-MVP ideas list, designed on the accepted MVP
brand (the "4c" direction: white page, ink type, lime `#d0ff4f` as a marker pen, Bricolage
Grotesque, hairline rules, the 30px X control).

**These are ideas, not a roadmap.** Each screen is independently adoptable, in any order,
or never. Nothing here changes the accepted MVP handoff in
`docs/designs/2026-08-22 Claude MVP Handoff/`; where the two disagree, the MVP handoff wins
until an idea is deliberately picked up.

The live design canvas is `Laters Futures.dc.html` in the design project.

## Contents

| File | What it covers |
| --- | --- |
| `01-screens.md` | Per-screen functionality: 1a–1f, interaction detail, accessibility, dependencies |
| `screens/` | A PNG of each screen (2x, captured from the live design canvas) |

## The screens at a glance

| Id | Idea | Ideas-list items covered |
| --- | --- | --- |
| 1a | Informed queue | read time, sort by read time, favicons |
| 1b | Swipe away | swipe-to-delete alongside the X |
| 1c | Long-press actions | share to NotebookLM / an LLM, per-article actions |
| 1d | Dark mode | dark mode toggling |
| 1e | Settings sheet | sync, export, global images toggle, bulk add |
| 1f | Folders, later | folders and an archive |
| 4a | Bookmarked rows | starring/bookmarking with a subtle row tag |
| 4b | Long-press sheet | bookmark + share directly from the app |

## The brand contract every screen keeps

- One screen, no navigation bar, no floating action button, no search.
- The article title stays the loudest thing on the page; lime is an action colour, never a wash.
- Deletion always ends in the in-row undo with the 7 s ring, whatever started it.
- Every control keeps a ≥44px hit area and a text accessible name; state is never colour alone.
- Local-first: the list lives in the browser until the user explicitly syncs or exports.

## Decisions that need the maintainer's sign-off

### 1. Read times and favicons mean fetching article pages

Both are computed **once, at save time**. Cross-origin fetches from a PWA will fail for many
sites without a proxy; the design assumes graceful absence (no time shown, lettered tile shown)
rather than a service dependency. If a proxy is unacceptable, 1a still works — it just shows
fewer read times.

### 2. Sync stays out of the repository

The maintainer flagged that a public repo must never link to their data. 1e's sync is therefore
an **encrypted export file in storage the user chooses** (Drive, iCloud, a synced folder), not a
hosted database. The repo gains code only, never data or credentials.

### 3. Share-to-LLM is the platform share sheet

"Send to NotebookLM" is the Web Share API with the article URL. No vendor SDK, no API key,
and it works identically for any installed target. The label can name NotebookLM because that
is the maintainer's stated use; the mechanism is generic.

## Suggested adoption order (if any)

1. **1a** read times + favicons — pure enrichment, no new surfaces.
2. **1d** dark mode — token swap plus a toggle.
3. **1b** swipe delete — rides on the existing deletion path.
4. **1e** settings sheet — becomes necessary once 1d/1a add preferences.
5. **1c** long-press actions — the home for share/copy, and later folders.
6. **1f** folders + archive — last; it is the only one that changes the information architecture.

## Addendum — bookmarking and in-app sharing (4a, 4b)

Added after review. The maintainer explored star/stripe/wash treatments (turns 2–3 on the
design canvas) and settled on **4a/4b**:

- **4a** — bookmarked rows get a lime-ink filled star in the meta line plus a ~10% lime wash
  over the row. Unbookmarked rows show a resting hollow grey star. No left stripe.
- **4b** — a long-press bottom sheet per article: Read now, **Bookmark** (star symbol, word
  "Bookmark"; toggles to "Remove bookmark"), **Share…** (system share sheet, straight from the
  list), Copy link, Delete (same in-row undo path as the X).

Full behaviour in `01-screens.md`. Open question flagged there: bookmark and share currently
have no gesture-free path — the long-press sheet needs a conventional entry point (or those
two actions a second home) before this ships.
