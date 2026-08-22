# MVP 2.0 Slice 2: source markers

## Status

Implemented and published on 2026-08-22 in commit `d807cba`. Focused Android testing accepted the
favicon and deterministic fallback behaviour. Follow-up optical-alignment corrections culminated in
the accepted 4px first-title-line offset in commit `6dc1771`. This slice is complete and included in
release `v0.2.0`.

## User-visible outcome

Every normal article row gains a fixed 22px rounded-square source marker before the title. A
deterministic local tile is present on first paint and remains when a publisher icon is missing,
blocked, slow or invalid. When the conventional publisher favicon loads and decodes, it fades over
the tile without moving the row.

Ghost and Undo rows remain unchanged. This slice does not add whole-row opening, a favicon service,
article-page discovery or any new stored data.

## Implementation decisions

- Use the existing canonical hostname normalisation: lower case, no trailing dot and one leading
  `www.` removed.
- Derive display characters from the first two ASCII letters or digits in that normalised hostname,
  uppercased. For example, `theverge.com` becomes `TH` and `x.com` becomes `XC`.
- Select the accepted six-colour palette with 32-bit FNV-1a over the UTF-8 bytes of the same
  normalised hostname. The unsigned hash modulo six selects the palette entry. This is stable and
  does not depend on row order, time or browser randomness.
- Derive the attempted favicon URL as `/favicon.ico` on the saved article's exact origin, preserving
  its scheme and port while excluding its path, query and fragment.
- Render the fallback before starting the image request. Set the image request's referrer policy to
  `no-referrer`; reveal the image only after its load event and successful decode.
- Let the browser apply the publisher's ordinary caching rules. Add no application cache, failure
  cache, IndexedDB field or service-worker route for favicons.
- Keep the marker decorative and out of the accessibility tree because the normalised hostname
  remains visible in the metadata line.

## Verification

- Focused tests cover normalisation, characters, stable hashing, palette selection and exact-origin
  favicon URL construction.
- Favicon loading tests use a controlled image double, not live publisher requests, and cover
  successful decode, failed decode and ordinary load failure.
- Run the full automated test suite, type-check/build and public-build audit.
- Inspect the final diff for scope, privacy, accessibility and absence of explicit favicon caching.
- After a separately authorised commit and deployment, physical Android acceptance should confirm
  a successful publisher icon, a fallback, narrow-row layout, offline fallback and unchanged
  Bookmark/Delete behaviour.

## Stop conditions

Stop and report before broadening scope if reliable decoded-image handling requires a proxy,
publisher-specific mapping, article HTML fetching, service-worker image caching or a new UI
framework.
