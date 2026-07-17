# Marketplace professionalism roadmap

Feedback captured for Jmax Builders marketplace. Use this to prioritize later work.

**Context:** The UI shell is solid. Biggest gaps are catalog quality and buyer confidence.

---

## Highest impact

| # | Item | Status |
|---|------|--------|
| 1 | **Retire seed/demo products from production** — Show DB products only (or mark samples clearly). Sample plans next to real listings feels unfinished. | Done — marketplace + homepage featured use active DB products only; seeds remain in Admin for import |
| 2 | **Richer product specs on cards** — Bedrooms, bathrooms, plot size, floors, and “Architectural / Structural / BOQ available” — not just tags like “PDF.” | Done — cards show beds/baths/floors/plot + deliverable tags |
| 3 | **Real floor-plan / elevation previews** — At least one sheet preview (watermarked). Exterior renders alone look like a portfolio, not a plans shop. | Done — Admin “Drawing sheet previews” with labels; product page “Drawing previews” section; softer corner Preview mark |
| 4 | **Trust strip on listing + detail** — “Used by our site teams · Instant download · Single-site license · WhatsApp support” with links to terms/disclaimer. | Todo |
| 5 | **Sort + better filters** — Price, newest, bedrooms; filter by beds/plot. Sticky mobile filter sheet. | Todo |

---

## Product page

| # | Item | Status |
|---|------|--------|
| 6 | **Softer watermark** — Corner mark instead of big diagonal stamp. | Done (with #3) |
| 7 | **Sample sheet pack** — “What’s in the download” with titled thumbnails (ground floor, elevations, section). | Partially done via labeled drawing sheets; can expand copy/layout |
| 8 | **Bundle pricing clarity** — “Save X% when you buy Architectural + Structural + BOQ.” | Todo |
| 9 | **Ask before buy** — WhatsApp / consult CTA with product prefilled. | Todo |
| 10 | **Verified reviews + purchase count** — Even a few real reviews change perceived quality. | Todo (reviews UI exists; needs real verified volume) |

---

## Catalog ops

| # | Item | Status |
|---|------|--------|
| 11 | **Consistent naming & copy** — Same format for titles; no mismatched descriptions. | Todo (ops / Admin discipline) |
| 12 | **Featured / new / bestseller** — Small curated row above the grid. | Todo |
| 13 | **Related products that actually match** — Same beds/style, or Plan ↔ matching BOQ. | Partial — related by category from DB; can refine matching |
| 14 | **PDF sample download** (1–2 watermarked pages) before checkout. | Todo |

---

## Nice later

| # | Item | Status |
|---|------|--------|
| 15 | Plot size filter (50×100, 40×80), county suitability notes, M-Pesa-first checkout messaging, compare 2 plans. | Todo |

---

## Suggested next priorities

After 1–3, highest leverage remaining:

1. Trust strip (#4)
2. Sort + bedroom/plot filters (#5)
3. Ask-before-buy WhatsApp/consult CTA (#9)
4. Bundle savings messaging (#8)
5. Featured / new row (#12)

---

## Admin notes (for #3)

When editing a product in **Admin → Products**:

- **Product images** — up to 5 photos (first = marketplace cover)
- **Drawing sheet previews** — up to 5 labeled sheets (Ground floor, Elevations, etc.)
- **Plot size / floors** — shown on cards and detail
- Click **Save** after uploads so the gallery manifest persists

---

## Deliverable files (Architectural / Structural / BOQ)

- Each option is a **separate private file** uploaded in Admin → Products.
- Buyers select one or more on the product page; cart/order stores the license kind.
- Library + checkout downloads call `getDownloadUrl` with **slug + license** and only that file is signed.
- After Paystack verify, `sendOrderDeliveryEmail` emails only the purchased deliverable links (requires `RESEND_API_KEY` + `RESEND_FROM_EMAIL` on Vercel).

*Saved from marketplace feedback discussion — Jul 2026*
