# SENSO-WEB-002: staging foundation

## Boundary

This branch is **staging only**. Never merge it to `main`, deploy it to a production domain, or use its forms for real customer enquiries. Its HTML deliberately sends all 16 current forms to an in-memory simulator and its CSP blocks external scripts, form submissions, connections and images. Its globally applied `noindex` headers would be inappropriate for production.

The reviewed base is `dd8fde841b309be239e2516b405dc4770962342d`. Changes are confined to the staging branch: a safety marker, CSP and guard script in each HTML; Formspree actions replaced by `/__senso_staging_mock__/form`; staging-only `_headers`; and the scripts and documentation in `staging/`, `tests/` and `docs/`. No editorial copy, official home title or assets are intentionally changed. A visible badge identifies the site and warns that forms are simulated.

The mock records only status and delay in page memory, never form values. Its default result is simulated success. Tests can enqueue simulated statuses and delays with `window.sensoStagingQA`; this interface is only for staging. A page without JavaScript cannot submit to Formspree: its form action is local. The local server rejects native POST requests. Avoid entering customer information in a preview regardless.

`senso-analytics.js` is unchanged. It already declines to load GA4/Meta on non-production hosts. The staging CSP and guard add a separate block. The mock route does not match the production Formspree URL detector, so these tests **do not establish that successful submissions would create correct conversion events in GA4 or Meta**. Production analytics and delivery must be tested separately with explicit authorization and suitable isolation.

## Apply protections to future pages and build

Run only from a `staging/` branch and preserve all current work:

```sh
python3 staging/isolate.py --apply
python3 staging/isolate.py --check
python3 staging/build.py
python3 staging/serve.py 8765
```

The check fails when an HTML page lacks its exact protection, has a literal Formspree endpoint, or has an external form action; it also checks `_headers` and the guard file. CSP is the additional browser enforcement for dynamic actions. Reapply/check after introducing pages or changing forms. This is not a substitute for reviewing new custom network code and running browser tests.

The build copies tracked and nonignored untracked site inputs into `.staging-build/site`, including all current assets; it excludes internal tests/docs and records SHA-256 hashes in `.staging-build/manifest.json`. It refuses to overwrite an existing artifact. The manifest identifies the source commit and whether the worktree was dirty. Preserve or explicitly remove only the generated `.staging-build` directory before rebuilding. Never upload a raw, unprotected checkout as a staging site.

The existing `senso-preview` project is Git-connected. Its branch control was observed to include all non-production branches, with `main` as the production branch. A push of this staging branch can therefore initiate a public **preview deployment** automatically; it is not a production deployment, but it requires the explicit deployment approval in `AGENTS.md`. The project currently builds from the repository root, so a Git-triggered preview includes the guarded branch source (including staging documentation/tests), while the local artifact excludes those internal files. No Cloudflare configuration change is required for this route. Recheck the settings and account immediately before any push.

## Local QA

With the bundled Node/Playwright and Chrome paths on this Mac, while the server is running:

```sh
PLAYWRIGHT_MODULE='/Users/javier/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright' \
CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
'/Users/javier/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' tests/staging-qa.cjs
```

The browser runner aborts every request outside the local origin. It exercises each form with simulated error and success, a slow response, concurrent responses, a JavaScript-disabled form, and selected pages at 390 and 1440 px. Most form events are dispatched programmatically; these are not complete keyboard, accessibility, analytics or inbox-delivery tests. It checks selected navigation/language behavior, response status, loaded images and horizontal overflow, rather than certifying every pixel or every lazy-loaded image. Results are written to ignored `staging-test-results/`.

Before publication, independently verify the preview's actual HTTP `X-Robots-Tag`, CSP, effective URL, assets, form destination, blocked analytics and EN/ES behavior. A local HTTP response does not establish which headers Cloudflare actually serves. Preview URLs are public by default unless Access is configured; `noindex` is not access control.

## Reversal

The source base remains the recorded `main` commit; production was not touched. To discard this staging approach, stop using the staging branch and generated preview and start a new branch from verified `main`. For a previously deployed preview, retire only the authorized preview deployment through Cloudflare after identifying it; do not roll back `main`, the public domain, or another preview. Do not delete the local branch, artifact or user assets without an explicit decision. A separate, confirmed production hosting/rollback procedure is required for any future production release.
