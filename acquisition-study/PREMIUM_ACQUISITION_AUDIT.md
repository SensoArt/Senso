# Senso — premium art acquisition audit

**Date:** 17 November 2026 · **Scope:** acquisition proposal preview, artwork photo selection, `catalogue.html`, `index.html`, and representative artist pages. **Working branch:** `test/premium-art-acquisition-20261116`. No changes to `main`, production pages, SEO, analytics, payment settings, or domains; no merge or deployment.

## Recommendation

Advance **Senso Collect** as the hybrid design for review: keep A Editorial’s space and artwork-first hierarchy, use B Collect’s discovery affordances only after metadata is verified, and provide C Private Viewing as a discreet option on selected artwork details. The photo filter leaves two suitable existing artwork images for this prototype. The homepage banner remains unverified and is not reused. The recommendation is visual and source-based; it is not a browser-tested winner.

## Prioritised findings

| Priority | Finding | Evidence / buyer impact | Recommendation |
|---|---|---|---|
| P0 | No purchase-ready inventory | The public catalogue labels selected works “Price on request · Availability on request.” No approved public price or current stock state is present in the reviewed public source. | Approve one physical unit, title, sale authority, image rights, price, stock, terms and fulfilment owner before offering direct purchase. |
| P0 | Enquiry is not checkout | Production catalogue CTAs use `mailto:`; sampled artist pages contain Formspree forms. No inspected page provides a confirmed reservation, payment, receipt or fulfilment flow. | Keep consultation available. Only prepare a SumUp link after commercial approval, then test its receipt, settlement, refund and fulfilment path. |
| P1 | Catalogue hierarchy and discovery | The catalogue has a long grid and no active filters/search/sort in the reviewed source. Details and availability are not consistently separated. | Improve scannable artwork details and add accessible filters only when their data is verified. |
| P1 | Artwork detail path | Catalogue actions do not provide a consistent work-specific detail URL with previous/next navigation and enquiry context. | Use a durable artwork detail state, artist link and work-specific enquiry context. |
| P1 | Enquiry confidence | Source inspection does not prove form delivery, ownership, spam handling or response time. | Name an enquiry owner and SLA; verify delivery in an authorized staging environment before launch. |
| P2 | Performance and responsive risk | Existing catalogue images are lazy-loaded without intrinsic dimensions on sampled cards; artist pages include large inline CSS/JS and image sliders. | Reserve image dimensions, optimize approved image sources and verify network weight/LCP on real mobile widths. |
| P2 | Accessibility and conversion evidence | Small utility labels, contrast, keyboard focus trapping and measured target sizes remain unverified. No payment-complete event was observed. | Check contrast, focus behavior and touch targets; after authorization, define consent-aware enquiry and payment events without changing current analytics in this proposal. |

## Strict photo review

The preview retains two current catalogue/artist-page image assets. Both were inspected at their original dimensions. No people, ceramic objects, studio tools, visible prohibited names or readable labels appear in either selected image. The same full compositions are used on desktop and mobile; the card, feature, and detail views use `object-fit: contain`. The two source files total about 1.10 MB; the grid lazy-loads its images, while Senso Collect loads its featured image eagerly. No crop, retouch, object removal or generated photography was applied.

| Candidate | Review | Decision |
|---|---|---|
| Raúl del Chano · `fotos_obras/raul1.jpg` | 1199 × 1369 px; 693,964 bytes. Three round woven works on a rough stone-textured wall; no person, ceramic object, tool or visible text. This is an existing artist-profile image; the match to the exact catalogue unit is not confirmed. | Retained as a clearly labelled image reference, pending unit match |
| Davide Ciaramella · `Assets/Catalogue/obradavide_2.jpeg` / *Sguardo su Fiore* | 960 × 1280 px; 459,251 bytes. Painting on a textured wall; no visible person, ceramic object, tool or readable text. | Retained |
| Carlotta Valentinis · *Guifal*, `obracarlotta_2.jpeg` | 960 × 1280 px. Gallery label present; text cannot be checked reliably at source resolution. | Excluded |
| Carlotta Valentinis · *Keylan*, `obracarlotta_3.jpeg` | 960 × 1280 px. Gallery label present; text cannot be checked reliably at source resolution. | Excluded |
| Carlotta Valentinis · *Kintu*, `obracarlotta.jpeg` | 960 × 1280 px. Gallery label present; text cannot be checked reliably at source resolution. | Excluded |
| Raúl del Chano · *Ciscla Series*, `obraraul.jpeg` | 960 × 1280 px. Three woven works; gallery labels are too small to verify. | Excluded; use the profile photo only with the image-to-unit caveat above |
| Davide Ciaramella · *Distaccato*, `obradavidei.jpeg` | 960 × 1280 px. Figurative portrait; sitter identity could not be confidently checked. No inference from skin tone. | Excluded |
| Lucía Cheves Dauber · *Tokoyol Boogie*, `obra lucia_3.jpeg` | 960 × 1280 px. Human figure and grid-patterned wall; identity and wall material cannot be confidently resolved. | Excluded |
| Lucía Cheves Dauber · *Lieber Leser* innen, `obralucia_2.jpeg` | 960 × 1280 px. Collage includes small photographic people and text; figures and text cannot all be checked confidently. | Excluded |

The current home source references a separate banner asset and a flyer. The banner could not be visually reviewed: the GitHub binary fetch returned no image data and Chromium displayed a black capture. It remains **unverified** and is excluded from the proposal. The flyer was previously visually identified as containing disallowed text and is also excluded from the proposal. Neither production asset was changed. The preview includes no studio/activity-photo cover or human-photo carousel.

## Four comparable proposals

The responsive comparison is `acquisition-proposals.html`. It uses the existing Senso Futura/Behind pairing, logo and navigation. It contains two screened artworks only. A, B and C show the same two full images; D features the Raúl image reference once and hides its duplicate grid card. The device control switches desktop/mobile layout without resetting the selected proposal.

- **A · Editorial:** spacious, artwork-led grid and quieter enquiry path.
- **B · Collect:** denser cards and visible discovery controls, with filters marked “Demonstration filters · not interactive.”
- **C · Private Viewing:** more contextual layout and consultation CTA; full source images remain uncropped.
- **D · Senso Collect:** A’s editorial hierarchy, B’s discovery affordances and C’s private-view path, with an explicit image/unit-match note and confirmation-only availability status.

In D, the displayed catalogue facts are limited to *Ciscla Series*, Raúl del Chano, iron/wicker/acrylic and 2026. The narrative paraphrases the artist context already published by Senso. “Availability and sale status: to be confirmed with Senso” is shown without a price. The direct-purchase button is disabled pending commercial approval.

## Catalogue-to-inventory reconciliation

The displayed catalogue title, artist-profile photograph and a separate internal commercial record have not been proven to refer to the same physical unit. No approved price or current stock state is implied. Confirm the unit and image mapping before offering the work.

## Commercial checklist for Ciscla

- Confirm that the public title, physical artwork, selected photograph and commercial record all refer to one unit; assign a durable work/inventory ID.
- Confirm artist/Senso sale authority and image-use rights.
- Confirm dimensions, medium, year, condition, edition/uniqueness, provenance and care/framing details.
- Confirm current physical availability, reservation status and location.
- Approve public price and currency, VAT/tax, commission, shipping, insurance, delivery and installation.
- Approve geography, timing, packaging, returns/cancellation, buyer terms and the fulfilment owner.
- Decide whether the work is direct sale or private-viewing led; do not assume a price threshold.
- Only after approval, configure and test a SumUp link, payment confirmation, receipt, reconciliation, refund and fulfilment. No payment link or payment action is in the preview.

## Prototype behavior and review limits

The HTML initializes A and marks it selected with `aria-pressed`. Selecting A/B/C/D updates the active button while preserving the device mode. Artwork details open in a dialog with previous/next navigation, artist link, enquiry and private-view actions. The inquiry form is demonstration-only; submit is intercepted locally and reports that nothing was sent. It does not call Formspree, email, analytics or SumUp. Production Formspree forms remain untouched. Filters are static demonstration labels.

Static source review covers the 800px and 480px layout rules, full-image containment, semantic labels, dialog names, Escape handling, focus return, disabled purchase action, lazy-loaded cards and eager featured image. Color contrast, focus trapping, broken links in Chromium, touch-target dimensions, real mobile overflow, network waterfall and live form delivery were not verified.

The controlled Chromium browser blocked the local `file:` preview and prohibits reaching that same preview through a local HTTP server or alternate surface. No server was started. Six screenshots, interactive Chromium validation and a browser performance trace are **not available**; no such validation is claimed. The raw banner capture was black, so that image also remains unverified.

## First-sale plan

1. Confirm one work’s identity, physical unit, sale authority, image rights, condition, price/currency, taxes, delivery, returns and fulfilment owner in writing.
2. Decide direct sale versus private viewing. For an approved direct sale, create a SumUp payment link and verify payment confirmation, receipt, reconciliation, refund and fulfilment; never enable checkout from a calculated scenario.
3. Publish one accessible work detail page with truthful status, approved total price and terms, clear CTA and manual contact fallback.
4. Verify desktop/mobile layout, image loading, keyboard/focus, form delivery and payment success/cancel/refund in an authorized environment.
5. Only after approval, publish the change and wire consent-aware conversion events.

## Branch scope

The proposal and this audit are committed only to the requested test branch. Production pages, `main`, SEO, analytics, payment settings and domains are unchanged. No merge or deployment was performed.
