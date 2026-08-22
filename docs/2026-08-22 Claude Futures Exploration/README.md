# Laters — futures exploration, 22 August 2026

> **Current status:** this is a dated design exploration, not current implementation authority.
> Bookmarks, source markers and whole-row opening shipped in `v0.2.0`; the mobile interaction shell
> shipped in `v0.3.0`; and **Share this article** was subsequently published as a generic system-share
> action carrying the URL only. Use [`../../memory/now.md`](../../memory/now.md),
> [`../../memory/intent.md`](../../memory/intent.md) and the linked delivery records for current truth.

Eight UI explorations of the maintainer's post-MVP ideas list: the original six screens plus
the later 4a/4b bookmark and in-app sharing addendum. They use the accepted MVP
brand (the "4c" direction: white page, ink type, lime `#d0ff4f` as a marker pen, Bricolage
Grotesque, hairline rules, the 30px X control).

**These are ideas, not a roadmap.** Each screen is independently adoptable, in any order,
or never. Nothing here changes the accepted MVP handoff in
[`../2026-08-22 Claude MVP Handoff/`](../2026-08-22%20Claude%20MVP%20Handoff/); where the two disagree, the MVP handoff wins
until an idea is deliberately picked up.

Bookmarks, source favicons and whole-row pointer opening have since been selected for MVP 2.0.
[`../mvp-2-definition.md`](../mvp-2-definition.md) is authoritative for their accepted scope;
the screenshots remain end-state explorations and do not select adjacent features.

The selected row anatomy is explicit: favicon/fallback, title and Delete on the primary line;
star, hostname and saved time on the metadata line. The hostname is not placed beside the icon.

The live design canvas is `Laters Futures.dc.html` in the design project.

## Contents

| File | What it covers |
| --- | --- |
| `01-screens.md` | Per-screen functionality: 1a–1f, interaction detail, accessibility, dependencies |
| `02-star-and-publisher-tile.md` | Accepted bookmark-star artwork and rounded-square publisher fallback treatment |
| `screens/` | A PNG of each screen (2x, captured from the live design canvas) |
| `assets/` | Source hollow and bright-filled bookmark-star SVGs |

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
- The article title stays the loudest thing on the page; lime is primarily an action colour. The
  subtle bookmark-row wash in the later 4a/4b addendum is the accepted exception.
- Deletion always ends in the in-row undo with the 7 s ring, whatever started it.
- Every control keeps a ≥44px hit area and a text accessible name; state is never colour alone.
- Local-first: the list lives in the browser until the user explicitly syncs or exports.

## Decisions that need the maintainer's sign-off

### 1. Read times need article content; favicons need a failure-safe source policy

Read times require article content and remain outside MVP 2.0. The selected favicon approach
tries the publisher origin's conventional `/favicon.ico` without a central service and uses the
lettered tile on any failure. The visual design therefore works without a proxy or article-page
extraction.

### 2. Sync stays out of the repository

The maintainer flagged that a public repo must never link to their data. 1e's sync is therefore
an **encrypted export file in storage the user chooses** (Drive, iCloud, a synced folder), not a
hosted database. The repo gains code only, never data or credentials.

### 3. Share-to-LLM is the platform share sheet

The delivered label is the provider-neutral **Share this article**. It invokes the Web Share API
with the article URL alone: no saved title or text, vendor SDK, API key or destination-specific
behaviour. NotebookLM is one possible receiving app, not something Laters selects or observes.

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

- **4a** — bookmarked rows get the supplied bright-lime filled star with an ink outline in the
  meta line plus a ~10% lime wash
  over the row. Unbookmarked rows show a resting hollow grey star. No left stripe. MVP 2.0 makes
  that star a direct button until a gesture shell is deliberately selected.
- **4b** — a long-press bottom sheet per article: Read now, **Bookmark** (star symbol, word
  "Bookmark"; toggles to "Remove bookmark"), **Share…** (system share sheet, straight from the
  list), Copy link, Delete (same in-row undo path as the X).

Full exploratory behaviour is in `01-screens.md`. MVP 2.0 resolved the bookmark path with a direct
star button. The long-press sheet shipped in `v0.3.0`, and the maintainer later accepted Share as a
long-press-only personal-app exception. The delivered action opens Android's generic chooser with
the URL alone.
