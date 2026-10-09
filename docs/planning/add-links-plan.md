# Add-links candidate

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
