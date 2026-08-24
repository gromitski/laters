# Code-only security hardening

## Status

Implemented, published and accepted as the bounded `v0.5.4` slice after a focused OWASP Top 10:2025
review. This slice uses only application and repository code. It does not add a backend, proxy, paid
service or hosting configuration beyond the existing GitHub Pages workflow.

## Threats addressed

### Cross-site Share Target submissions

The Android Share Target remains a browser-generated form POST. Before reading or saving it, the
service worker now:

- accepts only the manifest's `application/x-www-form-urlencoded` format;
- rejects `cross-site` and `same-site` browser submissions using Fetch Metadata;
- rejects conflicting origins and non-navigation request metadata when those headers are present;
- keeps compatibility with browsers that omit Fetch Metadata; and
- rejects excessive declared request sizes and excessive individual fields.

The browser-provided `Sec-Fetch-*` headers cannot be set by page JavaScript. A normal Android share
is expected to be a directly user-initiated navigation with `Sec-Fetch-Site: none`; a hostile web
form identifies its source as `cross-site` or `same-site`. The published Android Share flow remains
a physical-device acceptance gate because browser-generated request details cannot be fully proved
by a synthetic unit test.

References: [W3C Fetch Metadata](https://www.w3.org/TR/fetch-metadata/) and
[Chrome Web Share Target guidance](https://developer.chrome.com/docs/capabilities/web-apis/web-share-target).

### Framed display

The main page starts hidden and a small same-origin script reveals it only when Laters is the
top-level page. When embedded, the script clears the document and stops loading. If a framing page
disables scripts, the page remains hidden.

This reduces practical clickjacking exposure on GitHub Pages, but it is deliberately documented as
defence in depth. JavaScript cannot provide the same browser-enforced guarantee as the HTTP
`Content-Security-Policy: frame-ancestors 'none'` response header.

### Software supply chain

- Deployment now runs `npm audit --audit-level=high` against the locked dependency tree.
- Dependabot proposes weekly npm updates and monthly GitHub Actions updates from repository code.
- Existing GitHub Actions remain pinned to immutable commit identifiers with minimal workflow
  permissions.

GitHub vulnerability alerts and branch protection are repository settings rather than code. They
remain recommended but are not required to operate Laters or its GitHub Pages deployment.

## Explicit boundary

GitHub Pages does not expose project-defined response headers. This slice therefore does not claim
to add HSTS, `X-Content-Type-Options`, `Permissions-Policy` or a header-level anti-framing policy.
Adding those controls would require a different host or proxy and is not part of the accepted Laters
architecture.

## Verification and acceptance

- Focused tests cover browser-generated, cross-site, same-site, malformed and oversized share
  requests, including the no-write failure contract.
- The public-build audit requires the frame guard and its early page bootstrap.
- The complete test, type, build, repository privacy, public-build and dependency gates must pass.
- After publication, open Laters normally on desktop and Android and confirm the app is visible and
  usable. Then share one ordinary public article from Android and confirm it is saved once. Failure
  means the Share Target metadata boundary needs correction before release.

The maintainer completed that published Android check on 2026-08-24 and accepted the result, closing
the final physical-device gate.
