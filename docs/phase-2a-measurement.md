# Senso · Phase 2A measurement audit and handoff

Base audited: `main` at `ab92a0c4466e7f70e8d5d3f297fe1900e5505b55`, 6 October 2026. This document covers source code and local browser QA. It does not claim access to the GA4, Search Console, Meta or Formspree admin dashboards.

## Initial state

- GA4 `G-6KCBPBC06L` and Meta Pixel `2442677362880993` were already loaded by `senso-analytics.js` after the corresponding cookie choices. The production HTML files each referenced the shared script once. No GTM container, second GA4 snippet, second Pixel snippet, or Search Console HTML verification tag was found in code. Search Console DNS verification and dashboard state cannot be inferred from HTML.
- The consent UI, footer settings link, 24-month renewal, consent-gated storage, attribution fields, GA4 page views and generic engagement events already existed. No visual cookie change was made.
- The shared script counted every successful Formspree POST as `generate_lead`; this mixed artwork, Studio, Consulting and newsletter submissions. It also sent raw click identifiers and a full referrer string as custom event parameters. Conversion status inside GA4 was not verifiable.
- Sixteen production Formspree forms were found, plus an unlisted contact preview form. The production Contacts form is a newsletter subscription, not a general contact enquiry. Paolo Agostini's form used native navigation, so its success state was not measurable by the shared fetch instrumentation.
- Davide Di Sena's form left its submit button disabled after a non-2xx response. Its existing error message was never shown in that case.
- `contact-extra-gold-preview.html` is unlisted and has no shared analytics script. It is excluded from production conversion reporting until approved as a live route.

## Implemented events

| Event | Trigger | Revenue use |
| --- | --- | --- |
| GA4 `page_view` | GA4 config after analytics consent | Acquisition and navigation |
| `senso_section_view` | Page load | Interest by site area |
| `senso_artist_view`, `senso_artist_click` | Artist page / artist link | Artist demand |
| `senso_artwork_view` | Catalogue card at least 50% visible | Artwork exposure |
| `senso_artwork_click`, `senso_artwork_enquiry_open`, `senso_form_open` | Artwork CTA / enquiry opened | Commercial intent |
| `senso_studio_interest`, `senso_commercial_click` | Studio drawer / commercial link | Service intent |
| `senso_form_start`, `senso_form_submit_attempt` | First form field focus / submit attempt | Funnel abandonment; neither is a conversion |
| `senso_contact_click`, `senso_social_click`, `senso_outbound_click`, `senso_scroll_depth`, `senso_language_change` | Relevant interaction | Secondary diagnostics |

Successful Formspree responses emit exactly one of `artwork_enquiry`, `artist_enquiry`, `studio_enquiry`, `consulting_enquiry`, `general_contact`, or `newsletter_signup` per form in a short duplicate window. Failed requests emit none. `newsletter_signup` is secondary and should not be included in commercial lead totals. `general_contact` is coded but has no active production form; the existing Contacts form is only newsletter signup.

Conversion payloads include `page_path`, `language`, `conversion_type`, `business_area`, `landing_page`, `utm_source`, `utm_medium`, `utm_campaign`, `referrer_domain`, and available `artist`, `artwork`, `service`, form and controlled request fields. Standard GA4 acquisition dimensions should be used alongside these. Emails, names, phone numbers, message text, click IDs and query strings are excluded from GA4 event parameters. Formspree still receives form fields needed to process the enquiry.

## Data quality and consent

- Tracking and tag loading remain consent-gated. Previews and local development do not load GA4/Meta. `?senso_internal=1` suppresses analytics for that browser tab's session; `?senso_qa=1` suppresses analytics on that page. QA submissions carry `senso_test_submission=true` to distinguish them in Formspree. Do not submit real test forms on production for routine QA.
- `window.sensoDebugEvents` records sanitized local/QA events for inspection without external analytics requests.
- GA4's own bot filtering remains an admin setting; no client-side heuristic can reliably exclude all bots. The site has no server-side attribution layer.

## QA performed

- Chrome headless, 1440×900 and 390×844. Local Formspree responses were intercepted and simulated; no real enquiry was sent.
- Catalogue: enquiry opening, 500 error followed by 200 success; zero conversion on error, one on success, correct artwork event.
- Art Consulting, Studio, Contacts newsletter and Paolo Agostini: 200 success states and one correctly typed event on both viewports; no JavaScript errors.
- All 16 production Formspree forms were also exercised with simulated HTTP 200 responses on desktop and mobile: one POST, one correctly typed conversion or newsletter event, and zero JavaScript errors per form. This broad pass used programmatic `requestSubmit`; the five visible user flows above received separate interaction QA.
- Davide Di Sena: simulated HTTP 500 showed the existing error message, restored the button, and produced zero conversions; retry with HTTP 200 showed the success state and produced one conversion on both viewports.
- Ten main routes smoke-tested on both viewports, including EN/ES controls where present; no JavaScript errors. Consent tested with the production hostname simulated locally: zero GA4/Meta requests before consent or after rejection; one GA4 load after analytics consent, one Meta load after marketing consent, one GA4 config.
- `node --check` and `git diff --check` passed. Page content, CSS and responsive styles were not edited.

## Remaining admin work before reporting revenue from GA4

1. In GA4 Admin, mark `artwork_enquiry`, `artist_enquiry`, `studio_enquiry`, `consulting_enquiry`, and `general_contact` as key events. Do not mark `newsletter_signup`, form starts, form opens, email clicks or `generate_lead` as commercial key events. Check whether the old `generate_lead` key event needs removal to prevent double counting historical and new leads.
2. Register only the custom dimensions needed for reporting: `business_area`, `language`, `landing_page`, `artist`, `artwork`, `service`, `conversion_type`, `acquisition_channel`, and campaign fields if standard GA4 dimensions do not suffice. Verify in GA4 DebugView and Realtime on an authorized production QA session, without a real Formspree submission.
3. Verify Search Console property ownership, sitemap status, GA4 stream ownership, Meta Pixel diagnostics and Formspree delivery in their respective admin interfaces. The connected GSC Wizard tool returned `payment_required`, so these states remain unverified here.
4. To activate `general_contact`, choose an approved contact route and form UX. A newsletter submission must never be relabeled as a sales enquiry.
