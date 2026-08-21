# Working agreements

Universal rules for humans and agents working on this project. Canonical vendor-neutral guidance lives here — not in Cursor rules alone.

## Repository truth

- Inspect repository state before making claims about files, branches, configuration or behaviour.
- Current repository evidence overrides remembered assumptions or chat history.
- Record uncertainty honestly. Use states such as unknown, assumed, proposed, investigating, accepted, rejected, superseded or deferred.
- Do not invent architecture, deployment, product decisions or infrastructure that does not exist in the repository.

## Repository identity

- Do not include personal identity in repository content unless it is deliberately public and relevant to the project.
- Use neutral role language by default, such as the maintainer, the project owner or the user.
- Do not write Git commit email addresses into documentation.
- Prefer a privacy-safe no-reply address for public repositories where the Git host supports one.
- Do not commit unnecessary personally identifiable information.
- Do not include private or unnecessary real names, personal emails, private addresses, telephone numbers, family details or private employment information.
- Do not include local usernames, filesystem paths, device names, hardware specifications, hostnames, private IP addresses or private service URLs.
- Redact logs and diagnostics before committing them.
- Private repositories are not exempt from privacy discipline.

## Secrets and security

- Never commit secrets, credentials or real environment values.
- Use ignored local configuration, secret stores and safe example files.
- Validate untrusted input.
- Use least privilege where relevant.
- Treat security as proportionate but never optional.
- Consider privacy and retention when processing user data.

## Git identity and authority

- Use the maintainer's configured privacy-safe Git identity for commits.
- Inspect the complete commit subject, body, trailers, author and committer metadata after every commit and every amend, before the first push.
- Warn if the configured identity appears to expose a personal email address.
- Do not print unsafe identity values in full.
- Do not commit using an unreviewed privacy-unsafe identity.
- Do not commit, push, merge, tag, release, deploy, rewrite history or perform destructive Git operations unless explicitly authorised for that task.
- Inspect branch and working-tree state first.
- Use descriptive commit messages.
- Do not add Cursor, cursoragent, ChatGPT, Claude, Copilot, Gemini, Grok, OpenAI or another AI identity as author, committer or co-author.
- Do not add AI attribution in a commit subject, body or trailer, including `Co-authored-by`, `Generated-by`, `Authored-by`, `Assisted-by` or equivalent declarations.
- Ordinary technical references to AI tools in commit prose are allowed when they describe the project rather than claim authorship.
- Do not expose PII through commit metadata.
- In every fresh clone, run `node scripts/no-ai-attribution.mjs install` before the first commit or push, then run `node scripts/no-ai-attribution.mjs self-test`.
- Run `node scripts/no-ai-attribution.mjs commit HEAD` after committing or amending. An attribution failure is a hard stop before push.
- If an editor or agent automatically adds attribution, do not push it. Recreate or amend the commit with clean human authorship metadata and verify it again.
- Never accept an attribution-check failure as a harmless warning.

## Scope and implementation

- Make the smallest useful, testable change.
- Investigate before risky, broad or ambiguous implementation.
- Avoid unrelated refactors.
- Prefer clear maintainable code over clever code.
- Remove dead code and avoid unnecessary duplication.
- Refactor while context is fresh when it directly supports the active work.
- Do not introduce speculative abstractions merely because a project may grow.

## Human collaboration and delivery

- The maintainer or project owner owns product decisions, priorities, scope, trade-offs, acceptance and authorisation. The agent should support those decisions rather than burying them under implementation procedure.
- Before substantial implementation, explain the user-visible effect, proposed technical approach, material risks, likely effort or cost and expected result in plain language.
- When tool access permits, the coding agent owns implementation mechanics: repository inspection, terminal commands, builds, linting, type checks, automated tests, diagnostics and diff review. Do not offload long technical command sequences to the maintainer by default.
- Ask the maintainer only for short acceptance checks that genuinely require human judgement, physical devices, private access or product preference. State what to do, what should happen and what would count as failure.
- When asked for an implementation prompt, provide one complete, copy-pasteable Markdown prompt in a single response or artefact. Do not split it across messages, truncate it or require the maintainer to reconstruct it.
- Treat money, tokens, time, attention and enthusiasm as real project constraints. Flag broad repository scans, large generated test suites, multi-agent reviews or other potentially expensive work before starting them, and explain the cheaper focused alternative.
- Keep testing proportionate to the changed surface. Do not turn a feature, maintenance task or defect fix into a test-infrastructure programme without a concrete risk and explicit approval.
- Do not introduce a new architecture layer, broad refactor or substantial test harness unless there is a reproducible failure or measured problem, evidence that focused existing mechanisms are inadequate, a plain-language cost-benefit explanation and explicit approval.
- After two materially failed or substantially corrected attempts in the same area, stop. Summarise the evidence, reassess the approach and obtain agreement before issuing another implementation attempt.
- Before substantial feature or version work, establish the intended delivery depth — for example MVP, prototype or complete build — and scale scope and verification accordingly.
- Keep release and hardening work focused on proving and publishing the agreed change. Do not introduce speculative product architecture, broad refactors or unrelated test infrastructure during release preparation without explicit approval.
- Prefer a steady rhythm: product decision, bounded slice, complete implementation prompt where needed, agent-owned technical verification, concise outcome review, limited human acceptance and then documentation or release work.

## Accessibility and usability

- User interfaces should aim for WCAG AA.
- Apply semantic structure, keyboard access, visible focus, accessible names, readable contrast and usable error handling from the start.
- Accessibility is not a later bolt-on.
- Usability includes responsive, speedy performance.
- Avoid unnecessary dependencies and payload.
- Measure performance before complex optimisation.

## Data separation

- Keep maintained data and content separate from presentation and executable logic where practical.
- JSON, YAML, Markdown, text files, APIs or databases may be appropriate.
- Do not hard-code significant maintainable data into UI or business logic without a good reason.

## Testing and verification

- Every implementation should have a repeatable way to verify it.
- Add automated tests where they provide value.
- Use build, lint, type, accessibility, integration or manual checks proportionately.
- Do not create a large test suite for ceremony.
- Do not leave the project in a state where testing would later require a structural rebuild.
- Run the checks available to the agent and report the exact result. Never imply that a check passed when it was not run.
- Keep automated verification and human acceptance distinct: automation proves repeatable technical behaviour; human checks confirm product judgement and real-world experience.

## Documentation and memory

- Keep canonical memory concise.
- One durable fact should have one authoritative home.
- Historical evidence should remain retrievable but outside normal context.
- Update current memory when meaningful reality changes.
- Do not create permanent files for trivial tasks or decisions.

## Specialist guidance

Deeper project-specific guidance may appear under `specialist/` only when a real need exists. Follow relevant specialist guidance when it exists and when current project truth points to it for the active task.
