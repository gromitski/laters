# Paste-to-add plan and implementation record

## Status

Accepted as the bounded `v0.4.0` feature slice on 2026-08-23. Implementation and production
acceptance are in progress. This version designation does not authorise a tag or GitHub release.

## Product outcome

A persistent **Paste a link** control sits at the top of the existing saved-article list. Activating
it deliberately reads clipboard text and immediately saves the first valid HTTP(S) URL. When the
clipboard cannot be read or contains no valid link, the same row becomes an inline labelled URL field
with a real **Add** button. The existing Laters screen remains otherwise unchanged.

The repository handoff at `docs/2026-08-23 Paste To Add Handoff/` is authoritative only for this new
feature's relative placement, states and interaction. Its surrounding screen is illustrative and
does not supersede the current implementation or visual system.

## Behaviour contract

- Clipboard access occurs only after **Paste a link** is activated; Laters never reads on load,
  foregrounding or a timer.
- Clipboard text may contain surrounding prose; the existing share parser selects the first valid
  HTTP(S) URL and uses useful surrounding text or the hostname as the title.
- Manual entry requires a complete HTTP(S) URL. Invalid input remains visible with an inline error.
- An exact-URL duplicate uses the current refresh contract: keep its identifier and bookmark state,
  update its useful title and saved time, move it to the top, and do not create another item.
- Successful new and refreshed items use the current lime row flash and polite saved-count
  announcement.
- Clipboard absence, permission denial and unreadable content are ordinary reasons to reveal the
  manual field rather than global application errors.
- No database migration, remote request, new service, analytics or third-party dependency is added.

## Visual and accessibility contract

- The paste invitation is the first visual row beneath the current **Saved articles** heading and
  remains available when the queue is empty.
- Its dashed full-width button is at least 52px high and uses current Laters tokens, type and focus
  treatment. The clipboard icon is decorative.
- The invitation's list wrapper is presentational so assistive technology does not count it as a
  saved article.
- The fallback has a programmatic **Article URL** label, URL keyboard hint, real **Add** button,
  inline validation association and visible keyboard focus.
- Escape or leaving an empty field returns to the invitation without losing non-empty input.

## Explicit exclusions

- Reading-time estimation or an aggregate minute count.
- Remote title or metadata enrichment.
- Changes to existing masthead, count wording, article rows, footer or local-storage disclosure.
- Multiple URL import, files, browser extensions, sync or another capture platform.

## Verification gates

- Focused automated checks cover clipboard success/failure, existing URL parsing, new capture and
  duplicate refresh with bookmark preservation.
- Type checking, production build, public-build audit and no-attribution guards pass.
- Browser checks cover populated and empty queues, manual field, invalid input, keyboard focus,
  current desktop layout and the 320px minimum width.
- Published Android acceptance covers clipboard success, denied/unavailable fallback, invalid input,
  duplicate refresh, persistence and regression checks for existing interactions.

## Implementation record

- Commit `17970d0` implements the accepted production candidate.
- GitHub Actions run `32634392394` passed automated tests, the production build, the public-build
  privacy audit and GitHub Pages deployment.
- Production browser verification applied the offered app update and confirmed the deployed control
  and current Laters presentation at 320px without activating clipboard access.
- Physical Android clipboard and fallback acceptance remains pending; no tag or GitHub release is
  authorised yet.
