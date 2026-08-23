# Laters — Paste-to-add: Ghost row (option 6c)

Handoff for implementation. One new UI element lets users add a URL they have copied elsewhere. Chosen for its clean clipboard-privacy story, built-in gesture-free fallback, and minimal standing chrome.

Screenshot: `screens/6c-ghost-paste-row.png` (Android frame, 2× resolution).

## Summary

A single dashed "ghost" row sits at the **top of the Saved articles list**, before the first article — matching where new saves land and always reachable without scrolling. Tapping it reads the clipboard and saves the URL instantly; if the clipboard has no URL it flips inline to a text field. The rest of the screen is pixel-identical to the MVP.

## Placement

- First `<li>` of the Saved articles list, above the newest article.
- Separated from the "Saved articles" header by the standard list hairline: 1px solid rgba(16,16,20,.12) on the row's top edge — it reads as a proper list row, not a floating button.
- Row padding: 14px vertical, 22px horizontal (list rows use 16/22; the ghost row is slightly tighter because the dashed box carries its own visual weight).

## Anatomy of the ghost row

- Full-width button inside the row, min-height 52px, corner radius 12px.
- Border: 1.5px **dashed** rgba(16,16,20,.22). No fill at rest.
- Content, centered, 9px gap: clipboard icon (15×15, stroke 2px, round caps/joins, currentColor) + label "Paste a link".
- Label: Bricolage Grotesque 600, 13.5px, letter-spacing 0.02em, colour #6f6879 (muted grey — same as list meta text).
- Deliberately a non-row: no publisher tile, no delete button, dashed not solid — the queue still reads as N real articles plus an invitation.
- Hover/pressed: border-colour #8fbf00, text #101014, background #fcffef.

## Behaviour

1. **Tap** → read clipboard (user-initiated; on Android 12+ the system "pasted from your clipboard" toast maps to a deliberate act — the cleanest privacy story of the options considered).
2. **Clipboard contains a URL** → save immediately: new article row inserts directly below the ghost row with the standard lime (#d0ff4f) background flash, count chip ("N saved · M min") updates. No confirmation step.
3. **Clipboard has no URL** → the ghost row flips inline to a bare text field (same box, dashed border becomes solid, field focused, keyboard up) with a lime "Add" button. Supports typed URLs and paste-by-keyboard. Escape/blur with empty field reverts to the ghost row.
4. **Duplicate URL** → don't add twice; briefly flash the existing row and scroll it into view.
5. **Invalid input in the field** → keep the field open, hint "That doesn't look like a link" in 11px muted text below; never lose typed input.
6. After saving, fetch title and read-time estimate in the background; until resolved show the hostname as the title placeholder. Publisher tile renders synchronously per the deterministic-tile spec (hostname-derived letter + colour), favicon cross-fades in if `https://{host}/favicon.ico` resolves.

## Accessibility

- The ghost row is a real `<button>`, label "Paste a link", ≥44px target — no gesture required. This doubles as the gesture-free add path.
- The inline field is a labelled text input; Add is a real button.
- On successful add, announce politely: "Saved. N articles."
- Hover/press states change border colour and background, not colour alone; all text meets AA on white (#6f6879 = 4.9:1).

## Design tokens used

- Ink #101014 · muted #6f6879 · lime #d0ff4f · lime-ink #8fbf00 · hover wash #fcffef · hairline rgba(16,16,20,.12) · dashed border rgba(16,16,20,.22).
- Type: Bricolage Grotesque (Google Fonts), weights 600/800.

## Honest costs

- ~66px of standing UI (the only always-visible chrome this feature family adds).
- Clipboard is read only on tap — never proactively on app foreground.
