# Senso — premium art acquisition audit

**Date:** 16 November 2026 · **Scope:** `catalogue.html`, `index.html`, representative artist pages and the acquisition journey. **Working branch:** `test/premium-art-acquisition-20261116` (created from `main`). No edits to `main`, production, SEO metadata, analytics, domain settings, or payment credentials.

## Executive finding

The public catalogue currently signals that works are available, while every inspected card says **“Price on request · Availability on request.”** The catalogue and artist pages support an enquiry, but no inspected work has an approved public price, confirmed inventory, direct-sale terms, or a prepared SumUp checkout. A trustworthy direct purchase cannot be enabled from the repository evidence alone. The first sale is presently blocked by missing commercial/product data and a completed payment/fulfilment path, not by lack of artwork presentation.

## Prioritised findings

| Priority | Finding | Evidence / buyer impact | Recommendation |
|---|---|---|---|
| P0 | No purchase-ready inventory | All eight sampled catalogue cards use request-only price and availability; no approved price or stock state is present. | Obtain per-work owner approval for price, availability, edition, condition, delivery, taxes, returns and sale authority. Until then use enquiry / private viewing only. |
| P0 | Enquiry is not checkout | Catalogue actions open `mailto:`. Sample artist pages submit to the same Formspree endpoint; no visible cart, reservation, payment, receipt or fulfilment flow. | Choose a named human owner and response SLA; test enquiry delivery. Use SumUp payment links only for approved, direct-sale-ready works, with amount and work reference reconciled. |
| P1 | Catalogue hierarchy and legibility | Three-column grid at desktop, fixed 480px image wells, small uppercase artist/title/meta/action text, long metadata in the card; price/status sits inside `.meta`. | Give artwork title and artist a clear type scale; make details scannable; separate material/size/year from status and action; provide consistent image framing and whitespace. |
| P1 | No focused discovery controls | 48 items are declared in JSON-LD; the visible grid is long. No active filters/search/sort controls were observed in the inspected catalogue source. | Add accessible artist/medium filters, result count, clear-all, and useful sorting once metadata has been verified. Keep filters functional and URL-shareable. |
| P1 | Artwork detail path is inconsistent | Catalogue CTA requests enquiry directly. Artist pages show artist bio, artwork carousel/lightbox and a generic inquiry form, but no stable artwork-specific details URL/selection context was confirmed across pages. | Give each selected work a durable detail state/URL, artist link, previous/next navigation and work-specific enquiry context. Keep attribution and data source explicit. |
| P1 | Form feedback and operational confidence | Artist templates contain Formspree POST forms and success copy. Repository inspection does not prove delivery, spam handling, consent treatment, confirmation email or ownership. | Submit controlled QA enquiries in staging, verify receipt and reply path; add clear privacy/consent treatment only after policy review. Keep a real error state. |
| P2 | Performance and responsive risk | Catalogue lazy-loads images but specifies no intrinsic dimensions on sampled cards; artist pages include large inline CSS/JS and image sliders. | Add accurate width/height or aspect-ratio reservations; serve responsive modern formats only when rights/source workflow supports it; preload only the true hero; audit font loading and total transfer on mobile. |
| P2 | Accessibility | Small .58–.7rem utility text, low opacity metadata, image-only affordances and custom modal controls require contrast, keyboard and screen-reader checks. | Aim for readable body/metadata sizes and contrast; semantic buttons/links, visible focus, descriptive image alt, labeled fields, keyboard-close/focus return, reduced-motion and touch targets. |
| P2 | Conversion measurement | The existing site has analytics code, but this proposal intentionally changes no analytics. The reviewed purchase path offers no verified payment-complete event. | After authorization, define consent-aware events for artwork view, enquiry start/submit/success, private-view request, checkout start, payment success/refund. Do not count mailto clicks as confirmed enquiries or payment. |

## Sampled works

Eight actual records copied from the public catalogue with their displayed names, artists, image references and displayed attributes: *Guifal*, *Keylan*, *Kintu*, *Ciscla Series*, *Distaccato*, *Sguardo su Fiore*, *Tokoyol Boogie*, and *Lieber Leser* innen*. The preview labels all eight **“Price on request · Availability on request.”** No direct-buy button, fabricated price, inventory claim, edition, provenance or new artwork fact was added. Images/fonts are referenced from the repository’s existing published assets. Public presence is evidence that Senso publishes these assets; it does not establish third-party rights or current stock, so rights and stock should be reconfirmed before sale or reuse outside the site.

## Four comparable directions

Interactive visual comparison is in [`acquisition-proposals.html`](acquisition-proposals.html). A, B and C use the same eight artworks; D features Ciscla as its main case. All four retain the Senso typography, logo and navigation. Use the top controls to switch variants and toggle a mobile viewport.

- **A · Editorial:** generous whitespace, art-led staggered grid, quieter hierarchy and artist-led discovery. Best fit for identity; conversion relies on a clear enquiry path.
- **B · Collect:** compact four-column desktop grid, scannable product cards and filter affordances. Most transactional; only make filters live when controlled artwork metadata exists.
- **C · Private Viewing:** larger two-column presentation, editorial story and consultation CTA. Strong for high-value or context-led works; slower to scan a broad inventory.

## Technical differences in the prototype

The comparison is a standalone, reversible design study. Artwork cards open an individual work-detail view with previous/next navigation, artist-profile link and enquiry handoff; variant selection and viewport toggling are local presentation controls. Artwork enquiry opens an illustrative form whose submit is intercepted locally and sends nothing; it is **not** connected to Formspree, email, SumUp or analytics. No payment is taken, no real availability is implied and no SEO/structured-data/analytics/domain settings are changed. Images/fonts load from the public GitHub asset URLs, so local preview requires network access. The source catalogue itself has not been overwritten by this design study.



## D · Senso Collect: featured-work case

The fourth direction combines A’s editorial grid and typography, B’s discovery affordances (filters remain marked as demonstration-only), and C’s private-viewing route on the individual work detail. The featured card uses an image and displayed artwork facts already present in the public catalogue. Its short artist narrative is based on the artist context published by Senso.

### Commercial checklist

- Confirm the displayed title, physical unit and durable catalogue/inventory identifier before offering a work.
- Confirm sale authority and image-use rights for product presentation.
- Verify dimensions, condition, edition or uniqueness, provenance, and any care or framing details before publishing them.
- Confirm current physical availability and reservation status.
- Approve public price, currency, taxes, commissions, shipping, insurance, delivery and installation terms.
- Approve returns/cancellation, buyer terms, and who owns order fulfilment.
- Decide if direct sale is appropriate. Only after approval, prepare and test a payment-provider link, receipt, reconciliation, refund and fulfilment path. This preview has no payment link or payment action.
- Choose a private-viewing route only when Senso confirms it is appropriate for the work.

The preview does not display a price or assert availability. The purchase control is disabled pending commercial approval. Enquiry and private-view CTAs use a demonstration-only form; submit is intercepted locally and sends nothing. Production Formspree endpoints remain unchanged.

## Visual recommendation

Use **Senso Collect** as the leading hybrid concept for review: retain A’s space and art-first composition, use B’s filters once artist/medium metadata is verified, and add C’s discreet private-view path on selected work details when Senso confirms that context is appropriate. Keep artwork status and enquiry prominent. Hold direct purchase disabled until the Ciscla identity, availability, public price and terms are approved and payments are configured. This recommendation is based on source review and interaction design; Chromium screenshot testing remains unverified because the browser policy blocks the local preview and disallows reaching it through an alternate route.

## Refinement requested for review

The comparison preview initializes A explicitly and preserves the current viewport mode while switching A/B/C; the selected proposal is reflected by `aria-pressed`. Filter labels are marked as demonstration-only and are not interactive. The enquiry modal is also demonstration-only: its submit is intercepted locally and displays “Nothing was sent.” It does not call Formspree, email, analytics or payment services, and the production artist forms remain unchanged.

**Earlier visual hypothesis:** combine A’s editorial hierarchy, verified discovery controls from B and C’s private-viewing route. The Ciscla-specific Senso Collect refinement and recommendation are documented above; neither is presented as a measured winner from screenshot testing.

**Requested Chromium evidence is pending.** The available browser surface currently has the local `file:` preview blocked by its URL policy. The policy also prohibits opening the same file through a workaround or another browser surface. I therefore did not claim six viewport checks or fabricate screenshots. Once the preview is opened in a permitted Chromium session, capture A/B/C/D at desktop and mobile and inspect the detail view, previous/next controls, enquiry modal, selected-button state and console.

## Minimum plan for the first online sale

1. Select one work and record written approval from the artist/rights holder and Senso sale owner; confirm title, image rights, unique inventory/edition, condition, price and currency, VAT/taxes, shipping, insurance, delivery, returns/cancellation, buyer terms and who handles fulfilment.
2. Decide whether this work is direct sale or consultation-led. For a direct sale, create a SumUp product/payment link only after the amount and terms are approved; do not collect card data on Senso. Verify fee/settlement, payment confirmation, receipt, refund path and order reconciliation with a low-risk internal transaction or provider sandbox if available.
3. Build one accessible work detail page with accurate status, total price and delivery/returns terms, one clear action, and a manual fallback contact. For higher-value/context-sensitive work, use “Request a private viewing” and capture work ID plus contact details.
4. Test desktop/mobile, image failures, keyboard/focus, field validation, form receipt, payment success/cancel/refund, confirmation email and fulfilment handoff. Verify links/assets and establish a response owner/SLA.
5. Only after explicit authorization, publish the approved page and wire consent-aware conversion events. Compare enquiry-to-sale outcomes before scaling the catalogue.

## Limits and next inputs

This review was performed against repository source through the connected GitHub read API because the provided workspace contained no local clone. The branch was created remotely from `main`; no source page changes have yet been made on the branch. Live browser, network waterfall, real form submission, SumUp account readiness, inventory, sale contracts, image rights and current production behavior were not independently verified. The preview is a responsive HTML view with desktop/mobile toggles, not a live production preview. A browser visual run could not be completed because the controlled browser blocks local `file:` URLs and explicitly disallows opening the same preview by an alternate route. No HTTP server was started. The files received static integrity checks only.
