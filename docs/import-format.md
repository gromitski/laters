# Laters CSV import contract

## Status

This is the public import contract released in `v0.7.0` and extended in `v1.1.0` with optional
reading-time estimates. Import is available from
the main application menu. It adds new articles to the current device; it never replaces or deletes
the existing reading list.

## File and limits

Laters accepts a local `.csv` file encoded as valid UTF-8. A UTF-8 byte-order mark is accepted. CSV
values may use RFC 4180-style quotation, including doubled quotation marks and line breaks inside a
quoted value. CRLF, LF and CR row endings are accepted.

One file may contain at most 1,000 non-empty article rows and may be no larger than 10 MB. The file
is read only after the user chooses **Import CSV** and selects it in the browser or operating-system
file picker.

## Columns

The header must contain `url`. Header matching is case-insensitive, and columns may appear in any
order. Laters recognises:

| Column | Required | Import behaviour |
| --- | --- | --- |
| `url` | Yes | Must be a complete HTTP or HTTPS address without credentials; Laters normalises it canonically. |
| `title` | No | Limited to 240 characters. A missing title falls back to the URL hostname. |
| `created` | No | A valid ISO 8601 date preserves the saved time. Missing times use the import time in file order. |
| `tags` | No | A comma-separated set of the recognised Laters tags below. |
| `readtime` | No | A positive whole number of estimated reading minutes. A missing or blank value leaves the estimate unknown. |

Additional named columns are allowed and reported in the review, but their values are ignored.
Every column must have a name, and duplicate column names are rejected.

This named-column boundary lets a Laters export round-trip fully while also accepting a simple
spreadsheet or another system's CSV containing only `url`, or `url` and `title`. CSV files without
`readtime` retain their existing behaviour.

## Recognised tags

- `laters-bookmarked` restores the bookmark state.
- `laters-title-edited` restores the deliberate-title marker.
- `laters-protected-title` removes exactly one leading spreadsheet-safety apostrophe. The row is
  rejected if the marker is present without that apostrophe.

Other tags are counted in the review and ignored because Laters has no general tagging feature. A
title beginning with an apostrophe remains unchanged unless `laters-protected-title` is present.

## Validation, review and cancellation

Laters validates the complete file before offering an import. Malformed CSV, unsafe or invalid
URLs, invalid dates, invalid non-blank reading times, oversized values, inconsistent protection
markers and row or file limit breaches block the whole file. The error identifies up to the first
five affected row numbers and reports any remaining count without echoing article content.

The review reports new articles, URLs already on the current device, duplicate rows, ignored columns
and unsupported tags. No data from the selected file is saved until the user confirms. Cancelling
the picker or review creates no articles or pending operations from that file. A connected pre-review
Drive refresh may still apply existing changes made on another device.

After a successful confirmed import, Laters closes the menu and reveals the first imported article.
Imported articles still retain their original saved times and remain in the normal newest-first list
order, so the revealed article may be below more recently saved items.

## Merge and identity rules

- Import is add-only.
- Exact canonical URLs already on the current device are skipped without changing their title,
  saved time, reading-time estimate, bookmark state or deliberate-title marker.
- For a URL repeated in the file, the first row wins and later rows are skipped.
- Every new article receives a fresh private Laters identifier.
- Re-importing the same file is safe because its URLs are then already present.
- The accepted new rows and their pending add operations are committed in one IndexedDB
  transaction. A local write failure commits neither articles nor operations.

## Google Drive boundary

If Google Drive is connected, Laters refreshes the resolved Drive list before calculating duplicate
URLs. After the confirmed atomic local import it asks the existing sync session to process the new
add operations once. The CSV file itself is never uploaded to Drive.

If the device remembers a prior Drive connection but is currently disconnected, the review warns
that duplicate checking covers only the current device and suggests resuming Drive first. Import may
still proceed locally, and its normal add operations remain queued safely for later sync.

Import accepts no local identifiers, sync-operation fields, Google credentials, account data,
connection state, deletion history, Drive metadata or other implementation bookkeeping.

## Compatibility boundary

Import does not calculate reading times or map arbitrary third-party column names, folders,
archives, general tags, article content or attachments. It does not offer replace, overwrite,
deletion or rollback modes. Those
behaviours would materially expand the data-loss and sync contract and require separate agreement.
