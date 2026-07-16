# ElectroStore — Frontend PRD & Antigravity Build Prompt

**Project:** Task 1 — Simple E-commerce Store (Electronics/Gadgets niche)
**Scope of this doc:** Frontend only (HTML/CSS/JS), built to slot into an existing Django backend later.

---

## 1. Product Overview

A clean, bright, minimal e-commerce storefront for electronic gadgets (phones, laptops, audio, wearables, accessories). Visual language borrows from modern DTC/Shopify-style stores — lots of whitespace, confident product photography, restrained color, no clutter. It needs to read as a real product, not a template or an AI-generated demo.

**Why this matters for the internship:** reviewers will see dozens of submissions. Most will look like Bootstrap templates or obviously AI-scaffolded (generic hero + 3 icon cards + gradient blob). This build needs to feel intentional — like a small team designed it around one product category (gadgets), not a generic "shop everything" template.

## 2. Goals

- Fully clickable, realistic-feeling storefront covering the full purchase flow.
- Structured so it can be ported into Django templates with minimal rework (this is critical — see Section 6).
- Visually distinct enough to stand out in a batch review, without being gimmicky.
- Clean, semantic, maintainable code — reviewers may read the source, not just click through.

## 3. Target Pages / Sitemap

1. **Home** — hero, featured/new arrivals, category shortcuts, trust strip (shipping/warranty/returns), newsletter signup.
2. **Product Listing (Category/Search)** — filter sidebar (category, price range, brand), sort dropdown, grid of product cards, pagination.
3. **Product Detail** — image gallery, title/price/rating, variant selector (color/storage), quantity, add-to-cart, description tabs (specs / reviews / shipping), related products.
4. **Cart** — line items with qty controls, subtotal, promo code field, empty-state, checkout CTA.
5. **Checkout** — shipping info form, payment method (UI only), order summary, place-order button.
6. **Order Confirmation** — order number, summary, estimated delivery.
7. **Login / Register** — two forms (can be tabs or separate pages), validation states.
8. **Account / Order History** — simple list of past orders with status.
9. **404 / Empty states**.

## 4. Core Features (frontend behavior, pre-backend)

- **Cart:** persisted in `localStorage` for now (structured so it's trivial to swap for a real API call later — see prompt below). Add/remove/update qty, live subtotal.
- **Product filtering/sorting:** client-side on static/mock data to start.
- **Form validation:** inline, real-time (email format, password rules, required fields) — no `alert()` popups.
- **Responsive:** mobile-first, breakpoints at ~480px / 768px / 1024px / 1280px.
- **Micro-interactions:** hover states, add-to-cart confirmation (toast, not alert), skeleton/loading states for cards.

## 5. Design System (Clean, Bright, Minimal — Shopify-adjacent)

Give Antigravity concrete tokens, not vague adjectives — this is what keeps it from defaulting to generic AI output.

- **Palette:** near-white background (`#FAFAFA` / `#F7F7F5`), near-black text (`#111111`), one confident accent color of your choice (e.g. a deep amber, cobalt, or forest green — pick something that isn't purple/indigo, since that's the most overused "AI app" tell), neutral grays for borders (`#E5E5E5`).
- **Typography:** one grotesk/sans for everything, e.g. **Inter, General Sans, or Söhne-alike** — but vary *weight and scale* aggressively (big confident headings, tight body copy) rather than leaning on a second display font. Avoid the Poppins-headline + Inter-body combo; it's the most common AI-tool default pairing.
- **Spacing:** generous, consistent scale (8px base — 8/16/24/32/48/64/96).
- **Corners/shadows:** pick ONE radius value and reuse it everywhere (don't mix pill buttons with sharp cards with 12px images). Shadows subtle or none — flat + whitespace reads more premium than drop-shadow soup.
- **Buttons:** one primary style (solid, accent color), one secondary (outline or ghost). No gradient buttons.
- **Imagery:** product shots on plain/light backgrounds, consistent crop ratio.

## 6. Technical Structure (important — this is what makes the Django hand-off painless)

Even though you're writing plain HTML/CSS/JS now, structure it to mirror Django conventions so porting later is close to copy-paste:

```
/frontend
  /templates          → each "page" as its own HTML file, named like Django templates will be:
      base.html         (shared header/footer/nav — treat like Django's {% extends %} base)
      index.html
      product_list.html
      product_detail.html
      cart.html
      checkout.html
      order_confirmation.html
      login.html
      register.html
      account.html
      404.html
  /static
      /css
          base.css        (resets, variables, typography)
          components.css  (buttons, cards, forms, nav)
          pages.css       (or one file per page if it gets large)
      /js
          cart.js          (all cart logic, isolated — this becomes your API layer later)
          filters.js
          validation.js
          main.js
      /images
  /data
      products.json       (mock product data — mirrors what a Django serializer/context would output)
```

- Use `fetch('/data/products.json')` to populate pages instead of hardcoding product data inline — this mirrors how Django will later pass context/JSON to templates, so swapping the data source is a one-line change, not a rewrite.
- Keep all cart state logic in one `cart.js` module with clear functions (`addItem`, `removeItem`, `updateQty`, `getCartTotal`) — later you just swap the internals from `localStorage` to real API calls without touching the UI code.
- Avoid inline `onclick=""` — use `addEventListener` from JS files, since Django template rendering plays better with clean separation of markup and behavior.
- Use semantic HTML5 (`<nav>`, `<main>`, `<section>`, `<article>`) — helps you later replace repeated blocks with `{% include %}` partials in Django.

## 7. Explicit "Don't Look AI-Generated" Guardrails

- No purple-to-blue gradient hero backgrounds.
- No centered hero headline + subhead + two pill buttons + floating 3D illustration (the single most common AI-tool homepage pattern).
- No glassmorphism cards, no overuse of blur/backdrop-filter.
- No generic "Feature 1 / Feature 2 / Feature 3" three-icon-column section unless genuinely reworked with real content.
- No emoji as icons — use a real icon set (Lucide/Feather/Phosphor via SVG) or none at all.
- Don't center-align every section — real designed sites use asymmetry and varied grid layouts.
- Vary section layouts across the homepage (don't repeat the same card-grid pattern 4 times down the page).
- Product data should feel real: real-sounding names, realistic prices, realistic specs — not "Product 1", "Product 2", "Lorem ipsum".

## 8. Acceptance Criteria

- All 9 pages built, linked, and navigable end-to-end (home → browse → PDP → cart → checkout → confirmation).
- Fully responsive down to 375px width.
- Cart persists across page reloads (localStorage).
- All forms have real client-side validation with visible error states.
- No console errors.
- Passes a quick "does this look like a template" gut check — no default Bootstrap/AI-tool tells from Section 7.

---

