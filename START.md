# Start here

Read these in order before repository-dependent work:

- [Working agreements](memory/agreements.md)
- [Current project truth](memory/now.md)
- [Product intent](memory/intent.md)
- [Accepted roadmap](docs/roadmap.md)
- [Exploratory future ideas](docs/future-ideas.md) when discussing later product scope

Current application candidate: **1.6.2**. [Strict Google account separation](docs/planning/google-account-switching-plan.md)
separates connection/permission from data sync: connected **Sync now**, active **Syncing…**, and
Connect/Resume only when authorisation is needed. Technical checks pass; publication is pending.
It retains strict account separation from **1.6.1**, which
opens only the chosen account's list, with no linking/merging question or device-only mode. The
maintainer rejected the `1.6.0` adoption interface. Older unassigned data stays local, available
as a recovery CSV outside the sync flow. Technical, publication and normal Update checks pass. No new scope,
persistent credential, backend or billing is included. Real-account/device acceptance remains.

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
It retains the connection diagnostics; `1.6.2` supersedes the old **Reconnecting…** progress copy.
Device investigation of the original interruption remains. Dated design packages,
release records and handoffs preserve historical evidence; they do not override the current memory
files. The original project idea is archived under `evidence/origin/`.
