# Slice 6 MVP design implementation plan

## Outcome

Apply the approved 22 August 2026 MVP design handoff to the existing Laters application without expanding the product beyond its accepted one-screen, local-only read-later purpose.

The design package lives in [`../2026-08-22 Claude MVP Handoff/`](../2026-08-22%20Claude%20MVP%20Handoff/). It is design evidence rather than an instruction to weaken repository agreements, accessibility, privacy, testing or deployment safeguards.

## Authorised direction

The maintainer's instruction to proceed authorises these handoff decisions for Slice 6:

- self-host the Bricolage Grotesque variable font and its licence;
- adopt the white, near-black and lime visual system;
- use the **Laters.** wordmark and supplied app-icon direction;
- remove the masthead intro sentence and the **Newest first** kicker;
- replace visible **Delete** and **Undo** words with an X/undo icon treatment while preserving explicit accessible names; and
- move the seven-second Undo affordance into a temporary ghost row while retaining live-region announcements and focus recovery.

These decisions do not authorise new product features, navigation, data collection, external services or deployment.

## Corrections and implementation judgements

- The supplied `#8fbf00` colour measures `2.18:1` against white, not the documented `3.1:1`. It must not be the sole light-background boundary or state indicator. Use near-black for required focus/control boundaries and reserve the lime tones for fills, decoration or reinforced states.
- The supplied icon package does not include the SVG favicon. Create it from geometric outlined shapes; do not use a live text glyph or external font reference.
- The proposed `220px` collapsing-row ceiling is not accepted without measurement against a 240-character title at the `20rem` minimum viewport. Prefer a layout-independent collapse technique or derive a safe measured value.
- Entry motion must run only on the initial successful list render. It must not replay whenever the app returns to the foreground, after deletion, or after Undo.
- Row staggering must be capped so a long local list does not create an extended delay.
- The in-row Undo design requires explicit transient presentation state. Storage semantics remain unchanged: deletion happens immediately, Undo saves the original item, and the saved timestamp continues to restore deterministic position.

## Slice 6A — visual foundation and identity

### User-visible result

Laters adopts the approved white/ink/lime identity, typography, edge-to-edge list, responsive spacing, status bands and supplied icon family without changing capture, storage, update or deletion behaviour.

### Work

- Add the approved Bricolage Grotesque Latin variable `woff2` and SIL Open Font License from an authoritative source.
- Define the design tokens once as CSS custom properties.
- Restyle the masthead, wordmark, list heading, count, article rows, links, metadata, state messages, update notice, errors, footer and skip link.
- Preserve the hidden update notice behaviour and existing semantic structure.
- Remove the intro and kicker markup only; keep all operational copy unchanged.
- Replace the public PNG icons with the supplied files.
- Create the missing outlined SVG favicon and add the 32px PNG fallback;
- update manifest and HTML theme colours; and
- include local font files in the service-worker precache without introducing external requests.

### Likely files

- `index.html`
- `src/styles.css`
- `vite.config.ts`
- `public/icons/*`
- `public/fonts/*`

### Acceptance

- No external font, image, script or analytics request.
- Interface remains usable from `20rem` upwards and stays a centred single column at larger widths.
- All text and required non-text boundaries meet WCAG 2.1 AA contrast.
- Long titles wrap without obscuring the control.
- Update, loading, empty, status and error states remain distinguishable.
- Installed and maskable icon files have correct dimensions and no sensitive metadata.

## Slice 6B — Delete and in-row Undo

### User-visible result

Each article has a compact X control with a 44px target. After deletion, the row remains temporarily as a ghost with an undo arrow and seven-second progress ring. Undo restores the article and focus; expiry collapses the row and safely recovers focus.

### Work

- Render inline SVG X and undo icons with `aria-hidden="true"`.
- Keep the button's accessible name as `Delete “{title}”`; change it to `Undo delete` only during the ghost state.
- Track one pending deletion in memory, including the original item and expiry state.
- Keep `#status-message` as the announcement channel while avoiding duplicated visible copy.
- Preserve deletion failure, restoration failure and busy behaviour.
- Implement the X/undo morph, progress ring and row collapse.
- Preserve immediate deletion from IndexedDB and timestamp-based restoration.
- Move focus to the undo control, restored title or list heading according to the existing contract.
- Disable expressive motion under `prefers-reduced-motion`, while retaining an understandable undo state.

### Likely files

- `src/main.ts`
- `src/styles.css`
- focused UI/domain tests under `src/`

### Acceptance

- Delete, Undo, expiry and both failure paths retain their current storage semantics.
- The visible disc may be 30px, but the interactive target is at least 44px in both dimensions.
- Shape, copy and focus communicate state without relying on colour.
- A 240-character title at `20rem` does not clip during normal, ghost or collapse states.
- Initial row motion does not replay on foreground refresh, deletion or Undo.
- Reduced-motion users receive immediate state changes without losing the seven-second opportunity to Undo.

## Slice 6C — verification and handoff

### Automated and local checks

- Run the complete existing test suite and focused new tests.
- Run TypeScript production build and the public-build audit.
- Verify the generated build contains the local font, new icons, manifest values and no unintended external resource.
- Inspect default, empty, populated, long-title, status, error, update, ghost, restored and expired states at mobile and wider viewports.
- Check keyboard order, visible focus, accessible names, live announcements and reduced motion.
- Measure contrast from the implemented values rather than trusting the handoff labels.

### Physical-device checks after an authorised deployment

- Confirm the installed PWA shows the new **Update** action.
- Apply the update and confirm existing IndexedDB articles remain.
- Confirm the maskable home-screen icon and white splash/theme colour.
- Recheck share capture, original-link opening, Delete, Undo, expiry and offline shell on the supported Android Chrome version.

## Exclusions

- Title enrichment, redirect following or news-feed URL canonicalisation.
- Backend, authentication, sync, backup, import/export, tags, folders, archive, search or AI.
- New navigation, menus, tabs, thumbnails, article previews or manual URL entry.
- Repository visibility changes, commit, push or deployment without separate authorisation.

## Documentation updates on completion

- Update `memory/now.md` with implemented and verified reality.
- Update `docs/mvp-definition.md` only for accepted interaction details that changed.
- Keep this plan as the scoped rationale and the supplied handoff as design evidence.

## Local implementation record

- Bricolage Grotesque was sourced on 22 August 2026 from the official Google Fonts `ofl/bricolagegrotesque` directory under the included SIL Open Font License 1.1.
- The shipped Latin `woff2` pins optical size to 14 and width to 100, retains the variable weight range 400–800, and has SHA-256 `c4857b925b149578539b3afe45832e8f9732e691582aeb6682e2cd1cece731bc`.
- The four supplied PNGs were copied byte-for-byte; the missing SVG favicon was drawn with geometric shapes and contains no live text or external reference.
- The implemented collapse measures the actual ghost-row height before transitioning to zero. The narrow-browser check measured a 240-character representative row at approximately 265px, confirming that the handoff's fixed 220px ceiling would have clipped valid content.
- All text-role contrast checks pass AA against white. The handoff's `#8fbf00` remains decorative only at its measured `2.18:1`; required success boundaries and the Undo ring use a darker token.
