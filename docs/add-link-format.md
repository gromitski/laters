# Laters add-link format

## Status and use

The `v1.2.1` candidate adds manual device pairing to the optional one-click batch handoff.
Users explicitly enable it in
**Add from a chat**, copy their browser's private instructions once, then open a link for articles
they accepted. It works with any generator able to encode UTF-8 CSV reliably. CSV Import remains
available with its existing review; no chat provider or newsletter account is built into Laters.

To use one triage chat across devices, select **Copy code for another device** on the configured
installation. On the other installation, open **Use code from another device**, paste the complete
code and select **Use this code**. Both then accept the same links. Pairing works before or after
local enabling, replaces the target's previous code and leaves articles and Drive credentials alone.
Input must be exactly 64 lowercase hexadecimal characters after surrounding whitespace is trimmed;
invalid input leaves the current code unchanged. No link can enable or pair a browser automatically.

## Format

Use the current installation's root URL followed by this fragment:

`#add=v1&key=CODE&data=ENCODED_CSV`

`CODE` is the exact browser-generated 64-character lowercase hexadecimal code. Never use a code
from public examples. `ENCODED_CSV` is `encodeURIComponent(csv)`, not form encoding, base64 or
manually guessed escaping. For a Markdown destination, additionally percent-encode `!'()*` (these
are left literal by `encodeURIComponent`) so unmatched parentheses cannot break the clickable link.
There must be exactly one each of `add`, `key` and `data`, with no
other fields. The parser strictly rejects malformed percent escapes and invalid UTF-8.

The CSV uses the [existing import contract](import-format.md): required `url`, optional `title`,
`created`, `tags` and `readtime`. Generators should normally use `url,title,readtime`, with a blank
reading time when unknown. CSV quoting must protect commas, quotes and line breaks. Percent-encode
the complete CSV, including `+`, `&`, `#`, newlines and Unicode. Do not put article data or codes in
the query string or path. Render the resulting URL as a conventional clickable Markdown link.

Each fragment, counting the leading `#`, may contain no more than 8,000 characters and 1–25 article
rows, including duplicates. Calculate encoded lengths and split larger batches into numbered
links; do not truncate articles. If one row will not fit, use CSV for it. Do not say a batch has
been saved merely because a link was generated, and do not open or fetch the link in the generator.

## Authorisation and privacy

Enabling creates 32 cryptographically random bytes stored in local browser preferences. A valid
code permits only add-only imports in that browser/profile/origin. It cannot read the list,
replace existing data, delete articles, change Google permissions or obtain Google tokens. The
code is independent of Google credentials and excluded from Drive, CSV and connection diagnostics.
Users can deliberately copy this add-only code between their own browsers through the pairing
controls; it is not automatically distributed through Drive. Disabling removes it immediately in
that browser only; other paired browsers remain enabled. To revoke a shared code everywhere,
disable each paired installation. Enabling again produces a different code: pair the replacement
on the other installations and copy fresh chat instructions. Clearing site data
also disables it. Opening an unauthorised link does not enable the feature or save its articles.

Treat the instructions and links as private capabilities. Anyone who obtains the code can make
links that add articles when opened in the authorised browser. This is not a signature binding a
link to a particular triage decision. Share only with trusted private chats and turn off/re-enable
if exposed. Do not publish instructions or links with a live code in issues, screenshots or logs.

The fragment is not sent to the hosting server. Laters removes it with `history.replaceState`
before processing it and does not log it. The sending chat, link-handling software, browser and
extensions may still see the full link; this is not encrypted transport from the chat provider.
Failed links are consumed too: correct the problem and open the original link again.

## Saving and compatibility

Laters validates the whole batch before preparing an import and rechecks authorisation after
asynchronous preparation. New canonical URLs and ordinary pending add operations commit in one
IndexedDB transaction. Existing URLs are never overwritten. Successful completion reports added,
duplicate and ignored-data counts and reveals the first added article. Titles are rendered as text.

An already-connected Drive session refreshes before planning. A newly opened page has no saved
Google token: additions work locally, with pending changes retained until deliberate resume. A
remembered disconnected connection produces local-only completion wording. Links do not perform
background delivery while Laters is closed or automatically synchronise authorisation across devices.

Reloading a consumed page does not replay its batch. Re-opening the original link skips existing
URLs; after deliberate deletion, opening it again can add those URLs again. No replay ledger,
batch deletion or automatic Undo mode is introduced.

The installed PWA and an ordinary tab can share storage in the same browser/profile/origin, but
window routing is browser-controlled. In-app webviews, private browsing, other profiles, other
devices and self-hosted origins have separate storage and need deliberate enabling or pairing. A
shared code does not share reading lists or change the link's destination host. The copyable
instructions use the current host, so a root-hosted fork does not need the public service's origin
or the maintainer's code.
