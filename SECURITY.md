# Security policy

## Supported version

Security fixes are applied to the current version on `main`. Older releases are historical records
and are not maintained as separate supported branches.

## Reporting a problem

Please report a suspected vulnerability privately to [hello@dustyb.in](mailto:hello@dustyb.in).
Describe the affected page or feature, the result you observed and the smallest safe reproduction
you can provide. Do not include access tokens, private reading lists, account details or another
person's data, and do not test against accounts or devices you do not control.

Please allow reasonable time to investigate before publishing a working exploit. This is a small,
free, open-source personal project rather than a staffed security service, but credible reports will
be assessed and addressed proportionately.

## Security model

- Laters has no application account, backend, database or analytics service.
- Reading lists stay in browser storage unless the user deliberately connects Google Drive.
- Drive access uses Google's short-lived browser token and the narrow `drive.appdata` permission.
- Access tokens remain in page memory and are not written to browser storage, Drive or the repository.
- Article, share-target and Drive data are validated and rendered as text, not executable markup.
- Automated tests, repository privacy checks, dependency auditing and public-build checks run before
  GitHub Pages deployment.
- Dependency update proposals are configured for npm packages and GitHub Actions.

## Maintained limitations

GitHub Pages does not allow this repository to define custom HTTP response headers. Laters therefore
uses an in-document Content Security Policy and a code-level anti-framing guard, but cannot set HSTS,
`X-Content-Type-Options`, `Permissions-Policy` or an HTTP `frame-ancestors` directive without moving
host or adding a proxy. That infrastructure is intentionally outside the current project boundary.

The code-level guard is defence in depth rather than a substitute for browser-enforced response
headers. Users remain responsible for securing their browser, device and Google Account.
