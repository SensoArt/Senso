# Senso — Codex operating rules

## Scope and authority
- This repository powers Senso's public website. Treat `main` and any deployed site as production-sensitive.
- Follow the latest explicit instruction from Claudia or Adrià. Change **only** the requested files, elements and behavior. Do not opportunistically improve copy, design, layout, navigation, prices, SEO, metadata, analytics, domain configuration or unrelated code.
- The home/site title must remain exactly: `Senso | Contemporary Art Expression`. Never alter it without explicit authorization.
- Preserve the contemporary, sophisticated, conceptual, minimal and independent identity of Senso.
- If instructions conflict, or an action could affect unrelated pages, stop and explain the conflict before proceeding.

## Workflow
1. Inspect the relevant files and dependencies before editing. Identify the exact scope and expected outcome.
2. Work on a separate branch or local working tree whenever feasible. Do not directly modify `main` for routine changes.
3. Make the smallest reversible diff; preserve existing assets, fonts, content, URLs, language variants and responsive behavior unless specifically authorized.
4. Validate links, paths, assets, desktop/mobile behavior and relevant language versions. For PDFs and catalogues, verify the correct files are linked and accessible; never silently replace a different edition.
5. Review the final diff for unintended changes. Report what changed, what was tested, and any limitations or unverified claims.
6. Obtain explicit approval **before** merging, publishing, deploying, or changing production settings. Authorization to edit or prepare a preview is not authorization to deploy.

## Data and safety
- Never overwrite or delete original assets, local media, catalogue sources or business data without explicit authorization. Keep backups where appropriate.
- Never expose credentials, tokens, private client data or unpublished business material. Do not upload local originals to third-party services without permission.
- Do not change DNS, Cloudflare, hosting, redirects, analytics, pixels, structured data or SEO as a side effect of an unrelated task.
- Do not claim a fix is live, mobile-verified, deployed or tested unless it was actually verified. Distinguish local tests, preview and production.
- If access or testing is unavailable, state the limitation and give the exact next step.

## Definition of done
A task is done only when its authorized change is implemented, relevant checks pass, unintended changes are absent, and the result is clearly reported. Production publication requires its own explicit approval.
