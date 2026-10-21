# Senso — Repository Instructions

## Project

Senso is an independent contemporary art company based in Barcelona. This repository contains its public-facing static website.

The website supports artwork sales, collector acquisition, art consulting, Senso Studio, hospitality partnerships and qualified B2B enquiries.

Business goal: contribute to sustainable revenue growth toward €30,000/month, without compromising artistic quality, brand identity, performance or reliability.

## Non-negotiable rules

- Modify only what Claudia or Adrià explicitly authorize.
- Do not make opportunistic improvements, refactors or unrelated fixes.
- Preserve existing content, design, typography, imagery, layout, responsive behavior, metadata, SEO, analytics and functionality unless directly authorized.
- The homepage title must remain exactly: `Senso | Contemporary Art Expression`.
- Never modify production or publish changes without explicit deployment authorization.
- Never expose credentials, customer information or private business data.
- If an additional issue is discovered, report it separately without changing it.

## Verified repository context

- Repository: `SensoArt/Senso`.
- Main branch: `main`.
- Primarily a static HTML website.
- `_headers` contains security and preview-indexing rules.
- `_redirects` contains permanent redirects for legacy routes.
- `CNAME` specifies `senso-art.com`.
- `README.md` currently provides minimal documentation.
- Cloudflare Pages has been used for branch previews; GitHub Pages is documented as a historical production reference.
- Verify which platform currently serves `senso-art.com` before any deployment.
- Do not assume that a package manager, build system or Cloudflare configuration exists without checking.

## Before every task

1. Read this file and inspect the current repository state.
2. Identify the exact requested change and authorized files.
3. Check Git status and preserve existing work.
4. Identify dependencies and possible effects on mobile, desktop, SEO and tracking.
5. Choose the smallest safe, reversible implementation.
6. If essential information is unavailable, request only what is necessary.

## Implementation

- Preserve the established Senso visual identity: contemporary, minimal, sophisticated and independent.
- Avoid unnecessary frameworks, packages, paid services and architectural complexity.
- Keep changes localized and readable.
- Do not change content or translations without permission.
- Do not silently replace images, fonts, links or external integrations.
- Preserve existing redirect, canonical and indexing behavior.
- Do not assume a successful local test proves production behavior.

## Verification

Apply relevant checks based on the requested change:

- Inspect the exact Git diff.
- Validate HTML, CSS and JavaScript where applicable.
- Check links, asset paths and redirects.
- Verify responsive behavior on desktop and mobile when affected.
- Check forms, tracking and consent behavior when affected.
- Verify metadata, structured data and indexability when affected.
- Test in preview before production when available.
- Record anything that could not be tested.

## Deployment

- Prefer isolated development or preview work.
- Never deploy to production without explicit authorization.
- Do not interpret permission to edit as permission to deploy.
- After an authorized deployment, verify the actual production result.
- If verification fails, report the failure and prepare a rollback.

## Reporting

Every task must end with:

- Requested scope.
- Files modified.
- Exact changes.
- Tests completed and results.
- Tests not completed.
- Preview URL, if verified.
- Deployment status.
- Risks or blockers.
- Next action.

Use precise states: ANALYZED, PREPARED, MODIFIED, TESTED, PREVIEWED, DEPLOYED, PRODUCTION VERIFIED or BLOCKED.

Never claim a change is live, fixed or verified without evidence.

## Business priorities

When asked to recommend technical improvements, prioritize:

1. Broken lead capture or conversion paths.
2. Reliability of forms and enquiries.
3. Measurement of qualified inbound opportunities.
4. Technical SEO and indexation.
5. Mobile usability, accessibility and performance.
6. CRM integration and useful automation.
7. Maintainability and operational efficiency.

Recommendations do not authorize implementation.
