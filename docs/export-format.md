# Laters CSV export format

## Status

This is the public export contract released in `v0.6.0`. Export is available from
the main application menu. Import remains a separate later release and is not implemented by this
contract.

## File

Laters creates a UTF-8 CSV file with an RFC 4180-style comma separator, double-quoted data cells,
CRLF row endings and a final row ending. The filename is:

`laters-export-v1-YYYY-MM-DDTHH-mm-ssZ.csv`

The timestamp is UTC. `v1` is the format version. The fixed header also identifies version 1; later
compatible revisions may add columns, while an incompatible contract requires a new version.

## Columns

The exact version-1 header is:

```text
url,title,created,tags
```

Each later row represents one currently saved article, newest first.

| Column | Meaning |
| --- | --- |
| `url` | The canonical HTTP or HTTPS article address. |
| `title` | The stored article title, with the spreadsheet-safety rule below. |
| `created` | The saved time as an ISO 8601 UTC timestamp with millisecond precision. |
| `tags` | A comma-separated set of the namespaced Laters tags described below. |

An empty reading list produces the header and final row ending with no article rows.

## Recovery tags

- `laters-bookmarked` means the article was bookmarked.
- `laters-title-edited` means its title was deliberately edited in Laters.
- `laters-protected-title` means the exported title has one leading apostrophe added for spreadsheet
  safety. A future Laters Import may remove exactly that added apostrophe only when this tag is
  present.

The first two tags preserve stable user-visible state without exporting private sync machinery. The
third makes the safety transformation reversible.

## Spreadsheet safety and CSV escaping

Article titles originate outside Laters and are untrusted. If a title begins with `=`, `+`, `-` or
`@`, Laters prefixes one apostrophe before writing it and adds `laters-protected-title`. This prevents
the exported value from being interpreted as a spreadsheet formula while preserving enough metadata
for exact later recovery.

Commas, quotation marks and line breaks are preserved by standard CSV quoting. Embedded quotation
marks are doubled. URLs are already restricted by the saved-article contract to canonical HTTP or
HTTPS addresses without credentials.

## Portability

The `url`, `title`, `created` and `tags` shape is deliberately useful outside Laters. It can be opened
as a spreadsheet and follows the documented custom-CSV columns accepted by Raindrop. Other tools
that accept a CSV of URLs can use the `url` column even if they ignore Laters tags. A receiving tool
still controls its own duplicate, tag and date behaviour; this contract cannot promise how every
third-party importer will interpret additional state.

## Privacy and exclusions

The export is created only after the user selects **Download CSV**. It contains potentially private
article addresses and titles. The browser starts a local download and chooses its normal download
location. Laters does not upload the file or send it to Google Drive.

The export contains no:

- Google credential, token, account or OAuth configuration;
- remembered connection time or current connection state;
- local article identifier;
- pending sync operation, operation identifier or operation time;
- deleted-article record or restore history;
- Drive file identifier, checkpoint time or cleanup identifier;
- database, device, filesystem or application implementation metadata.

The resolved local reading list already reflects saved additions, edits, bookmarks and deletions.
Export reads that list through the store's read-only boundary and does not mutate it or the pending
sync queue. It represents what the current device knows at that moment and does not force or promise
a Google Drive refresh.

## Compatibility boundary

A later Laters Import is expected to validate this version-1 header, accept the documented rows,
restore bookmark and title-edit state from the namespaced tags, reverse protected titles only when
marked and create fresh internal article identifiers. Import merge, duplicate, deletion and Google
Drive reconciliation rules remain deliberately undefined until that release is agreed.
