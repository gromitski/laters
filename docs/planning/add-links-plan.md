# Add-links candidate

## Current status — recorded 2026-11-05

The sending workflow now supplies direct add-only links and retains accepted selections until
saving is confirmed. Real-chat duplicate-only and fresh-batch imports into the configured Chrome
installation are verified below. Automatic Chrome routing from the desktop chat remains
unresolved; the maintainer chose to leave the setup as it is because the route is too cumbersome.
Further routing work is deferred unless reopened. Phone routing/pairing remains unverified.
Do not change defaults, pair another browser or introduce a browser-forcing mechanism unasked.
This decision retains the working handoff and original-link retry guidance; it does not claim a
one-click desktop route or cross-device acceptance.

## Historical triage investigation — 2026-11-04

The following investigation and repair authority record is historical. Its completed steps are
not instructions to message the chat again or repeat private setup transfer.

The maintainer prioritised removing the CSV download/import steps from completed newsletter
triage. Inspection of the current sending chat found that its final-batch request still asks for
a downloadable CSV, and its completion supplies that file rather than an add-link. The intended
Chrome Laters installation already has add-links enabled. This establishes a sending-workflow
gap; it does not establish a failure in the receiver's add-only import implementation.

Repair the current private triage completion instructions using the existing browser setup, then
generate a correctly encoded link for an explicitly accepted batch and verify its handoff in that
browser. Preserve the existing newsletter intake/review rules and accepted article metadata.
Keep selections recoverable until successful saving is confirmed; generating a link is not proof
of import. CSV remains a deliberate fallback, not the normal completion.

Changing another chat requires explicit permission to message it, including permission to transfer
the existing private add-only instructions to that named private chat. No code, live link, private
article list or chat identifier belongs in this repository. Do not rotate or enable a new code,
alter Google permissions, introduce a backend or change newsletter schedules to repair this gap.
Real-chat/browser acceptance remains open until the generated link has been exercised; phone
routing/pairing is a separate check.

The maintainer explicitly authorised that private setup transfer and a test of the latest accepted
batch on 2026-11-04. The current triage chat has been sent the existing browser setup and updated
completion rules, including retained accepted selections until handoff is confirmed. It was asked
to check any saved recurring completion instruction without changing intake rules or timing.

### Real-chat desktop handoff verified

The triage chat generated a direct link for the latest three explicitly accepted articles rather
than a download. Independent decoding verified the exact `url,title,readtime` header, three rows,
the expected titles, reading-time values of 5, 6 and blank, valid HTTP(S) article URLs, complete CSV
termination and a 459-character fragment. The link's private prefix matched the intended browser's
existing setup. No new code, application feature or Google permission was needed.

Opening that actual chat-generated link in the configured Chrome installation reported:
**Added 0 articles. 3 already saved or repeated.** The articles were already present from the
earlier manual import. The saved list remained at 100 items, and all visible article titles and
bookmark states were preserved. The private fragment was removed from the address. No CSV file,
file picker or import-review confirmation was used. This verifies the real chat-to-browser route
and duplicate preservation; it does not claim three new records were added or prove phone routing.

The triage chat reports reading back the saved recurring instructions with direct links as the
default, retaining its existing timing and intake/review rules. That recurring configuration is
reported by the triage chat; it is not independently inspectable through this repository. The
browser result was confirmed back to the chat, which acknowledged the test batch as handed off
and read back the saved completion rule with its private prefix redacted.

No private code, generated URL or accepted article payload is retained here. The application
remains Version `1.3.0`; this was a private sending-workflow repair, not an application-code change.
Phone routing/pairing remains a practical acceptance check.

### Fresh batch and in-app browser mismatch

The next two-article accepted batch exposed a user-route gap: clicking its link in the desktop
chat opened the separate in-app browser, which held a fictional one-item test list and did not
have the configured Chrome add-link authorisation. Its rejection was correct. The earlier
Chrome-directed test did not cover that normal in-app click path.

The same original chat link was validated and opened in the intended Chrome installation. It
reported **Added 2 articles**, increasing the list from 100 to 102 without a CSV file or picker.
The accepted batch remained awaiting handoff after rejection and was confirmed back to the chat
only after Chrome saving succeeded. Google Drive was paused; the new local additions await normal
deliberate resume rather than being claimed as synced.

Completion guidance now distinguishes the original chat import link from the consumed error-page
address. If a click opens the embedded browser, copy the ORIGINAL link from the chat and paste it
into the configured Chrome profile. Copying the failed page's address only opens Laters because
its fragment has already been cleared. Pairing an embedded browser authorises additions there but
does not make it the Chrome list. Ordinary in-app link clicks are not proven to route to Chrome;
no global browser preference, new pairing or browser-forcing mechanism was introduced.

## Agreed scope

The maintainer selected a one-click handoff after explicit article triage and required it to be
usable by others. Deliver a complete bounded `v1.2.0` candidate, retaining the `v1.1.2` maintenance
behaviour. A tag or release is not authorised. Public device acceptance follows publication.

Anyone can enable **Add from a chat** in the existing menu and copy instructions into a private
triage chat. Each browser creates its own revocable random add-only code. A valid handoff link
opens Laters and adds only new articles, with no second confirmation. Disabled, wrong-browser,
revoked, malformed and oversized links make no changes. Ordinary CSV review remains unchanged.

## Contract and boundaries

- Use the root-page fragment `#add=v1&key=CODE&data=ENCODED_CSV`. The data is UTF-8 named-column
  CSV encoded with `encodeURIComponent` plus Markdown-safe escaping of `!'()*`, using the existing
  public import columns and validation.
- Limit each link to 8,000 fragment characters and 25 article rows. Generators must calculate and
  split longer batches; they must never truncate articles or guess encoded output. CSV remains the
  fallback when the sending chat cannot generate a reliable clickable link.
- Set up only after a deliberate local action; use 32 cryptographically random bytes, stored in
  local browser preferences. This code is independent of Google credentials, never synced or
  exported. Disabling removes it; enabling again creates a different code. It grants additions
  only and must be shared only with trusted private chats, never published.
- Remove the fragment from the address before processing. It is not sent to the hosting server,
  but the sending chat and browser can see the complete link. Do not claim encryption or secrecy
  from the chat provider. No payload or code logging, telemetry or diagnostic entries.
- Authenticate before CSV parsing, check authorisation again immediately before the local write,
  validate the entire batch, then reuse atomic add-only IndexedDB import and ordinary pending
  sync operations. Existing titles, times, bookmarks and estimates are never overwritten.
- Refresh an already-connected Drive session before duplicate planning. A newly opened page does
  not acquire Google credentials automatically; imports remain local and safely queued until
  the user resumes sync. Show this boundary in completion feedback when relevant.
- Consume startup links and later fragment navigations, serialize them, remove consumed address
  data and do not re-import on reload. Duplicates are harmless; re-opening a link after deliberately
  deleting its articles can add them again. There is no receipt registry or automatic rollback.
- Links must open in the browser/profile where setup was completed. Other browser profiles,
  in-app webviews and self-hosted origins do not share that authorisation or reading list. Installed
  PWA routing is platform-controlled; do not promise the standalone window always opens.
- Keep setup collapsed in the existing data menu with accessible controls, a selectable copy
  fallback and visible status. No permanent reading-list toolbar or redesign.

## Verification

Focused tests cover code setup/revocation, wrong and disabled authorisation, strict fragment
decoding, limits, invalid whole-batch rejection, URL/title safety, atomic storage and duplicate
preservation. Verify the actual rendered setup and startup/fragment handoff in an isolated browser
with fictional articles, including reload, bad-code rejection and narrow Light/Dark layout.
Run the existing test, type, build, privacy, dependency and attribution gates; review and publish
the complete slice through the repository's normal end-of-slice workflow. The maintainer then
checks a real triage-generated link in the intended browser.

## Candidate delivery evidence

All 249 tests across 34 files, type checking, production build, service-worker generation and both
privacy audits pass. Full and production dependency audits report zero vulnerabilities. Isolated
browser checks proved setup, copying, later-fragment and fresh-page import, preservation of Unicode,
query strings and supplied reading time, duplicates, reload without replay, wrong and revoked codes,
320px Light/Dark layout and the ordinary Update path retaining the test list. Candidate commit
`2dfa4e3` passed Pages workflow `37980471971`; live HTML, JavaScript, CSS and privacy date match the
verified build. The real newsletter chat's clickable output and physical-device routing remain
human acceptance gates. No live add-only code or private articles are retained in repository evidence.

## Authorised device-pairing correction — v1.2.1

The maintainer clarified that one ChatGPT triage chat must generate links usable on both phone and
desktop, with normal optional article sync. The maintainer authorised a complete bounded manual
pairing addition: **Copy code for another device** on the configured installation and **Use code
from another device** on the target. Keep fresh random codes for each person; there is no shared
public or built-in key. This explicit manual transfer extends the original browser-local setup,
without automatically syncing authorisation or including codes in CSV, Drive or diagnostics.

Accept only a full 64-character lowercase hexadecimal code, trimming surrounding whitespace.
Invalid input preserves existing authorisation. Deliberate submission can enable an unconfigured
browser or replace an existing code; it changes no articles or Google credentials. Replacement
must block pending imports still carrying the previous code. Show private-code clipboard fallback
and explain local-only revocation: disabling here leaves other paired browsers enabled. To revoke
everywhere, disable each paired browser; re-enable, pair a replacement and update chat instructions.

Verify the same fictional handoff in two separately stored local installations, local disabling,
replacement, invalid input, selectable clipboard fallback and narrow Light/Dark layout. Run the
existing delivery gates and publish version 1.2.1 for real-device acceptance, with no tag or release.

All 257 tests across 34 files, type checking, build, both privacy audits and attribution self-test
pass. Full and production dependency audits report zero vulnerabilities. Two separately stored
local browser origins accepted the same fictional batch fragment after pairing, rejected invalid
codes and kept revocation local. 320px Light/Dark checks showed no horizontal overflow. A normal
code field avoids an observed password-manager paste prompt. Physical phone/desktop routing and
the real triage chat remain acceptance gates; no live code is retained in repository evidence.
Candidate commit `7e924c5` passed Pages workflow `37984824896`; live HTML, JavaScript and CSS
match the tested build. No tag or GitHub release was created.
