# Start here

Read these in order before repository-dependent work:

- [Working agreements](memory/agreements.md)
- [Current project truth](memory/now.md)
- [Product intent](memory/intent.md)
- [Accepted roadmap](docs/roadmap.md)
- [Exploratory future ideas](docs/future-ideas.md) when discussing later product scope

Current planning focus: [persistent sign-in service](docs/planning/sign-in-service-plan.md) and its
[privacy/security explanation](docs/sign-in-service-privacy-security.md), requested on 2026-11-08.
Plan support for Google Drive, Dropbox and OneDrive within Workers/D1 Free; connect once per device
and renew automatically, with separate account lists. Documentation only is authorised. Architecture,
retention, privacy changes and implementation remain decisions; no service or credential is provisioned.
The maintainer authorised committing and pushing the documentation on 2026-11-08.

Current application version: **1.6.3**. The maintainer explicitly approved the
[Google Drive product interaction contract](docs/planning/google-account-switching-plan.md):
Connect only while disconnected; Sync now and Disconnect only with a live connection; no Switch
account. Disconnect stops this installation's work, including other windows in the same browser
profile, without revoking Google permission. Every account retains its own list and pending queue.
Usability is EVERYTHING: Laters is a free product, no longer experimental, and the maintainer's
reputation depends on it. Apply the complete-journey requirements in the working agreements.
Published from `ea3e837` after Pages run `42474639900`; 288 tests/37 files, privacy/build gates,
isolated browser journeys and normal Update 1.6.2 → 1.6.3 pass. Existing articles were retained.
The maintainer subsequently said the sync interface is much better; real-account/Android checks
remain separate. The rest of the menu UI is deferred; see current project truth.
No new scope, persistent credential, backend or billing is included.

Retained accepted article-view baseline: **1.5.0**. [Article views and publisher organisation](docs/planning/publisher-organisation-plan.md)
provide Newest → Oldest (load default), Oldest → Newest and Publisher groups. Implementation, technical checks
and publication verification pass; maintainer oldest-first/device acceptance remains.
The maintainer accepts the styled picker, tight label/chevron, shared Add link/Search layout and
500ms panel/list transitions. [Search](docs/planning/article-search-plan.md) is retained.
App-code slices must advance the version under the working agreements; docs-only receipts do not.
`v1.1.0` remains the latest accepted tagged release. No new tag or release is authorised.
The `v1.2.1` candidate adds manual device
pairing to the optional private add-link handoff after article triage. Its sending workflow was
repaired and a [real-chat Chrome handoff](docs/planning/add-links-plan.md#real-chat-desktop-handoff-verified)
verified on 2026-11-04. The maintainer chose to leave routing as it is; automatic Chrome routing
from the desktop chat is unresolved and further routing work is deferred. Phone checks remain
unverified, rather than an active instruction to change setup.
It retains the connection diagnostics; `1.6.3` supersedes the old **Reconnecting…** progress copy.
Device investigation of the original interruption remains. Dated design packages,
release records and handoffs preserve historical evidence; they do not override the current memory
files. The original project idea is archived under `evidence/origin/`.
