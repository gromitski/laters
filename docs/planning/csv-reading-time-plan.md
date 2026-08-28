# `v1.1.0` CSV reading-time plan

## Status

Accepted, implemented, published, maintainer-accepted and released as `v1.1.0` from exact verified
commit `1e95804`. Feature commit `537d765` passed GitHub Pages workflow `33204432044`; release
workflow `33206076911` passed before the lightweight tag and GitHub release were published.

## Product outcome

Laters accepts optional reading-time estimates already supplied in imported article-list CSV files.
An estimate helps a person judge whether an article fits the time available without Laters fetching
the article, contacting its publisher or introducing its own estimation service.

## Import and validation

- Recognise an optional, case-insensitive `readtime` column in any header position.
- Accept a trimmed positive whole number of minutes. Missing headers and blank cells mean unknown.
- Validate every row before review, including duplicates and URLs already saved. An invalid non-blank
  value blocks the complete file through the existing row-numbered Import error.
- Keep the existing file-size, row-count, named-column, review, cancellation, add-only and atomic
  commit contracts.
- Existing canonical URLs and later duplicate rows remain skipped without enriching or overwriting
  any saved data.

## Data, sync and export

The saved article gains one optional `readTimeMinutes` property. Existing records remain valid and
need no IndexedDB database migration. New imported records use the existing atomic store and pending
add operation. Whole-object Drive snapshots and operations retain the field under the existing
schema, validation, merge and cleanup rules.

Version-2 CSV Export adds `readtime` after `tags`, writes the positive whole minute value when known
and an empty cell otherwise. Import continues to accept original version-1 exports and simpler CSV
files without the column. Export remains local, newest first and read-only.

## Interface and accessibility

Recent saved ages use compact **Nmins old** or **Nhrs old** wording. When an estimate exists, append
**· ≈ N min read** to the existing hostname and age metadata. When it does not exist, omit only the
estimate. Reuse the established wrapping metadata layout at narrow widths and retain the title,
Bookmark, Delete, gestures, menus and whole-row action. The separator is decorative; the readable
estimate remains normal text.

## Explicit exclusions

No automatic estimation, article-content or metadata fetch, publisher request, manual editing,
reading-time filter or sort, queue total, new setting, backend, account, analytics or paid service.

## Verification

Focused checks cover optional article validation, importing populated and blank values, rejecting
invalid values, version-2 export and complete round-trip, IndexedDB retention and Drive snapshot
retention. The complete existing test suite, type checking, production build, privacy audits,
dependency audits and no-attribution checks must pass. Rendered narrow and desktop checks must prove
the optional label is quiet, readable and free of horizontal overflow while rows without estimates
remain unchanged.
