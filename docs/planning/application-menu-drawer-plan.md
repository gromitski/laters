# Application menu drawer

## Status

Accepted and implemented as a bounded interface move after the private Google Drive live-sync
candidate. This slice does not change sync storage, timing, authorization or merge behaviour.

## User-visible contract

- A permanent circular **Open menu** control sits at the top right of the masthead.
- When browser installation is available, **Install** remains immediately beside the menu control.
- The control opens a bottom drawer headed **Menu**.
- The existing Experimental sync card moves into the drawer without visual or behavioural redesign.
- The existing local/Drive storage disclosure and **Privacy** link move into the same drawer.
- The long article list no longer has to be traversed to reach sync or privacy controls.
- Backdrop selection, Escape, downward sheet dismissal and the visible **Close menu** control dismiss
  the drawer. Focus returns to **Open menu**.
- Reduced-motion preference removes the drawer animation.

## Accessibility and responsive behaviour

The trigger exposes a dialog relationship and an explicit accessible name. The maintained Ionic
modal supplies the modal focus boundary, backdrop, Escape handling and swipe-down sheet gesture. The
drawer content scrolls independently when vertical space is limited and includes safe-area padding.
At the narrowest supported width, the wordmark scales modestly only when both Install and Menu are
present so all masthead actions remain within the viewport.

## Deliberately deferred

- A persistent top-level visual sync indicator.
- New settings or placeholder menu rows.
- Changes to polling, token lifetime, pending-operation or deletion-record behaviour.
- A tag, release or public OAuth publication.

Until the separate indicator is designed, waiting, expired or failed sync state is visible after
opening the drawer. Local changes remain queued under the existing live-sync contract.

## Acceptance

- Automated checks cover drawer configuration, reduced motion, close control and focus return.
- Browser checks cover placement, unchanged sync-card styling, Privacy visibility, close and Escape.
- Physical Android acceptance should confirm top-right reachability, sheet scrolling and swipe-down
  dismissal without interfering with the article list.
