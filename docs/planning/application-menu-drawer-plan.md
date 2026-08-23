# Application menu drawer

## Status

Accepted, implemented and deployed as a bounded interface move after the private Google Drive
live-sync candidate. Desktop placement, state indication, page stability and pointer focus treatment
are maintainer-accepted. Android drawer acceptance remains. This slice does not change sync storage,
timing, authorization or merge behaviour.

## User-visible contract

- A permanent circular **Open menu** control sits at the top right of the masthead.
- When browser installation is available, **Install** remains immediately beside the menu control.
- The control opens a bottom drawer headed **Menu**.
- The menu control doubles as a compact Drive indicator: pale green means the latest Drive check
  succeeded, white means Laters is connecting, checking or sending, and pale red means disconnected,
  offline, expired, waiting to reconnect or failed on its latest attempt.
- The accessible name states the same connected, checking or disconnected condition, so the colour
  is not the only indication.
- The existing Experimental sync card moves into the drawer without visual or behavioural redesign.
- The existing local/Drive storage disclosure and **Privacy** link move into the same drawer.
- The long article list no longer has to be traversed to reach sync or privacy controls.
- Backdrop selection, Escape, downward sheet dismissal and the visible **Close menu** control dismiss
  the drawer. Focus returns to **Open menu**.
- Opening the drawer must not move the centred application shell when desktop scrollbar space is
  released by the modal scroll lock.
- Reduced-motion preference removes the drawer animation.

## Accessibility and responsive behaviour

The trigger exposes a dialog relationship and an explicit accessible name. The maintained Ionic
modal supplies the modal focus boundary, backdrop, Escape handling and swipe-down sheet gesture. The
drawer content scrolls independently when vertical space is limited and includes safe-area padding.
At the narrowest supported width, the wordmark scales modestly only when both Install and Menu are
present so all masthead actions remain within the viewport. Pointer-triggered focus restoration does
not add a persistent outline to the circular controls; keyboard-triggered focus retains a clear,
deliberate olive ring.

## Deliberately deferred

- A more detailed sync badge, timestamp or error message outside the drawer.
- New settings or placeholder menu rows.
- Changes to polling, token lifetime, pending-operation or deletion-record behaviour.
- A tag, release or public OAuth publication.

The menu colour communicates the broad state without adding another header control. Detailed waiting,
expired or failed text remains inside the drawer. Local changes remain queued under the existing
live-sync contract.

## Acceptance

- Automated checks cover drawer configuration, reduced motion, close control, focus return and all
  three accessible sync states, including pointer- and keyboard-origin focus treatment.
- Browser checks cover placement, unchanged sync-card styling, Privacy visibility, close, Escape and
  a stable shell position while the drawer is open.
- Physical Android acceptance should confirm top-right reachability, sheet scrolling and swipe-down
  dismissal without interfering with the article list.

## Production evidence

Commit `2a8e329` deployed the menu and drawer through GitHub Actions run `32658437608`. Commit
`4cc5c0b` added the pale green, white and pale red Drive states through run `32659008341`.

Desktop screenshots then exposed two browser-level presentation defects: Ionic's scroll lock
released the desktop scrollbar gutter and shifted the centred shell, while pointer-triggered focus
restoration could inherit Chrome's thick `:focus-visible` outline. Commit `6146e96` corrected both;
122 tests and all typecheck, privacy, production-build, public-build and dependency gates passed, and
run `32659745917` deployed the exact verified assets. The maintainer accepted the corrected desktop
behaviour. The repository status record was then brought current in `54829bc` and run `32659850471`.
