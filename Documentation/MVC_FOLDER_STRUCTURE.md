# GemoStone Next.js — MVC Architecture & Folder Structure Reference

This document is the **planning artifact** for restructuring this codebase, written against the pattern in `MVC_FolderStruture.md` (the Flutter/GetX reference you shared). It proposes a target folder structure, explains how each Flutter concept maps onto this Next.js project, and lists every concrete cleanup found while auditing the current code.

**Status: implemented.** §3 through §7 below are now applied to the codebase — verified with `tsc --noEmit`, `eslint`, and a live browser render after every phase. The one deliberate exception is the tail end of §5: the *new* token files (`colors.ts`, `typography.ts`, `radius.ts`, `spacing.ts`) exist and are ready to use, but the ~200-file sweep to swap existing hardcoded values onto them was intentionally left for a separate pass, exactly as flagged below — that's still open.

**Hard constraint honored throughout:** zero UI/visual/behavioral changes. Every item below is either (a) moving a file to a better location, (b) renaming a file/export for consistency, (c) replacing a hardcoded literal with the exact same value read from a constant/env var, or (d) deleting code with zero references. Nothing here changes what the app looks like or does.

---

## 1. Why this isn't a literal copy of the Flutter structure

Flutter/GetX and Next.js solve routing differently, so the two trees can't be identical:

- **Flutter has no framework-mandated routing folder** — `routes/app_routes.dart` is just a plain Dart file GetX reads. So Flutter is free to put `screens/` anywhere under `features/`.
- **Next.js's App Router *is* the routing system** — a file's *path* under `app/` literally determines the URL. `app/` cannot be renamed, nested under a `features/` folder, or reorganized Flutter-style without breaking every route in the site. This is the "some file difference here" between the two frameworks.

So the approach here is: **keep `app/` exactly as Next.js requires (routing only), and apply the Flutter document's organizational *discipline* — domain grouping, no loose files, purpose-subfolders, centralized tokens, zero hardcoded paths — to everything Next.js *does* let us arrange freely** (`components/`, `services/`, `lib/`, `store/`, `hooks/`, `types/`).

---

## 2. Terminology mapping (Flutter/GetX → this project)

| Flutter/GetX concept | This project's equivalent | Why |
|---|---|---|
| `features/<x>/screens/` (View) | `app/**/page.tsx` (route) + `components/<x>/` (the actual UI) | Next.js splits "the URL" from "the UI" — a page.tsx is usually a thin shell that renders components |
| `features/<x>/controllers/` (GetxController — reactive state + logic) | `store/*.store.ts` (Zustand — reactive state) + `hooks/use*.ts` (orchestration logic) | This project already uses **Zustand**, not GetX. Zustand stores are the reactive-state half of a Controller; hooks are the logic half (form validation, submit flows, etc.) |
| `bindings/` (GetX dependency injection) | *(not applicable)* | Zustand stores are module-level singletons — there is no DI container to configure. Nothing replaces this folder. |
| `data/models/` | `types/*.types.ts` | Same job (typed data shapes), TS-idiomatic name |
| `data/repositories/` + `data/services/` | `services/*.service.ts` | This project already merges "repository" (data access) and "service" (API calls) into one `services/` layer — that's correct for a project this size; splitting them further would be over-engineering |
| `utils/constants/` | `lib/constants/` *(new, consolidated — see §5)* | Design tokens (color/type/spacing/radius) |
| `utils/widgets/` | `components/ui/` *(reorganized into subfolders — see §4)* | Global reusable UI |
| `utils/formatters/`, `utils/validators/`, `utils/helper/` | `lib/formatters/`, `lib/validators.ts`, `lib/*.ts` | Same job |
| `routes/app_routes.dart` | *(not applicable — Next.js App Router)* | File-based routing replaces named-route constants entirely |

**Naming convention note:** the Flutter doc mandates `snake_case` for every file (`order_details.dart`). That is a **Dart convention**, not a general rule — this is already a 100%-consistent TypeScript/React codebase using `PascalCase.tsx` for components and `camelCase.ts` for everything else. Forcing `snake_case` here would fight React/Next.js/TypeScript tooling and every ecosystem convention. **This plan keeps the existing PascalCase/camelCase convention** and only takes the *organizational* rules from the Flutter doc (group by domain, group by purpose, no loose files, one settings home).

---

## 3. Target top-level structure

```
GemoStone_Frontend_WebApp/
├── app/                      # UNCHANGED — Next.js App Router owns this, routing only
│   ├── (auth)/
│   ├── (shop)/
│   ├── layout.tsx
│   ├── robots.ts
│   └── sitemap.ts
│
├── components/                # VIEW layer — reorganized, see §4
│   ├── ui/                    # global design-system components, grouped by purpose
│   ├── layout/                # Navbar, BottomNav, Container, NavIcon
│   ├── auth/
│   ├── account/
│   ├── cart/
│   ├── checkout/
│   ├── home/
│   ├── orders/
│   ├── payment/
│   ├── product/
│   ├── productDetailPage/
│   ├── reviews/
│   ├── legal/
│   └── providers/             # ToastProvider + AuthProvider consolidated here (see §5)
│
├── store/                     # Zustand reactive state (Controller-equivalent, state half)
│   ├── auth.store.ts
│   ├── cart.store.ts          # renamed from cart.ts — matches the other 3 stores
│   ├── checkout.store.ts
│   └── wishlist.store.ts
│
├── hooks/                     # orchestration logic (Controller-equivalent, logic half)
│   ├── useAddressForm.ts
│   ├── useAuth.ts
│   ├── useBodyScrollLock.ts
│   ├── useEscapeKey.ts
│   ├── useHasMounted.ts
│   └── useLoginFlow.ts
│
├── services/                  # data/repository + API layer
│   ├── http.ts                # was lib/api.ts — the one axios instance every service must use
│   ├── supabase/              # was lib/supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── auth.service.ts
│   ├── banner.service.ts
│   ├── checkout.service.ts
│   ├── collection.service.ts
│   ├── orders.service.ts
│   ├── payment.service.ts
│   ├── product.service.ts
│   ├── profile.service.ts
│   ├── reviews.service.ts
│   ├── search.client.service.ts
│   └── testimonial.service.ts
│   # services/oldWishlist/ — DELETED, see §6 (zero references anywhere)
│
├── types/                     # data/models — every *.types.ts lives here, nowhere else
│   ├── auth.types.ts
│   ├── banner.types.ts
│   ├── checkout.types.ts
│   ├── payment.types.ts
│   ├── product.types.ts
│   └── shared.types.ts        # was lib/types.ts — merged in so types/ is the single home
│
└── lib/                       # utils/ — design tokens, formatters, small helpers
    ├── constants/              # NEW — see §5, the actual ask: colors/sizes/typography in ONE place
    │   ├── colors.ts
    │   ├── typography.ts
    │   ├── spacing.ts
    │   ├── radius.ts
    │   ├── config.ts           # NEW — every NEXT_PUBLIC_* env read, in one place (see §7)
    │   ├── india.ts             # moved from constants/
    │   └── auth.ts              # moved from constants/
    ├── formatters/
    │   └── price.ts             # NEW — extracted from components/ui/Price.tsx (see §5)
    ├── validators.ts
    ├── cn.ts
    ├── toast.ts
    ├── navigation.ts
    └── assets.ts

(top-level constants/ folder is retired — everything in it moves into lib/constants/,
 so there is exactly one place for "shared static values," matching Flutter's
 single utils/constants/ home instead of this project's current 3 scattered locations:
 constants/, lib/, and inline literals in components.)
```

---

## 4. `components/` — grouping by purpose (the Flutter doc's Rule #1)

The Flutter doc's standing rule: *"No loose files inside a `widgets/` folder. Group widgets into domain subfolders."* Applying that same rule here, using the actual file counts from this codebase today:

### `components/ui/` — 20 files, currently flat → group by purpose
```
components/ui/
├── buttons/       Button.tsx, IconButton.tsx, BackButton.tsx, CartButton.tsx, WishlistButton.tsx
├── inputs/        Input.tsx, Select.tsx, FormField.tsx
├── overlays/       Sheet.tsx, VariantSelectionModal.tsx
├── feedback/       EmptyState.tsx, Skeleton.tsx
├── layout/         Card.tsx, StickyFooterBar.tsx, PageHeader.tsx, SectionHeading.tsx
├── data-display/    Badge.tsx, Price.tsx, ProductGrid.tsx
└── navigation/      ClientLink.tsx
```

### `components/orders/` — 19 files → group by purpose
```
components/orders/
├── headers/    OrdersPageHeader.tsx, OrderDetailPageHeader.tsx, CancelOrderHeader.tsx
├── cards/      OrderHistoryCard.tsx, OrderSummaryCard.tsx, PaymentSummaryCard.tsx,
│               RefundSummaryCard.tsx, CancellationSummaryCard.tsx, DeliveryAddressCard.tsx
├── states/     OrderStates.tsx, OrderStatusBadge.tsx, OrderStatusFilter.tsx
├── timeline/   OrderTrackingTimeline.tsx, TrackingTimelineItem.tsx
└── (page-level, stay flat): OrderItemRow.tsx, CancelOrderButton.tsx, CancelSuccess.tsx,
     CancellationReasonList.tsx, RefundInformationNotice.tsx
```

### `components/home/` — 19 files → group by purpose
```
components/home/
├── banners/     AnnouncementBar.tsx, BannerCarousel.tsx, BannerSlide.tsx, BannerSlider.tsx,
│                SplitStoryBanner.tsx, TrustBanner.tsx, TwoUpStoryGrid.tsx
├── sections/    BestsellersSection.tsx, TestimonialsSection.tsx, FeaturedProducts.tsx,
│                GetInTouch.tsx
├── sheets/      CategoryFilterSheet.tsx, SortFilterSheet.tsx
└── (page-level, stay flat): BestsellerCard.tsx, Categories.tsx, CategoryBar.tsx,
     CategoryGrid.tsx, FilterBar.tsx, TestimonialCarousel.tsx
```

### `components/checkout/` — 15 files → group by purpose
```
components/checkout/
├── sheets/      AddressFormSheet.tsx, AddressPickerSheet.tsx, CouponSheet.tsx
├── cards/       CouponCard.tsx, CheckoutItemCard.tsx, BillSummary.tsx
├── sections/    AddressSection.tsx, CouponSection.tsx, CheckoutItems.tsx
├── (page-level, stay flat): CheckoutHeader.tsx, CheckoutPageClient.tsx,
│    CheckoutPaymentClient.tsx, PaymentFooter.tsx, OrderSuccessfulClient.tsx
└── index.ts     (barrel export — already exists, keeps working unchanged)
```

### `components/productDetailPage/` — 13 files → group by purpose
```
components/productDetailPage/
├── sections/    ProductDescription.tsx, ReviewsSection.tsx, CrossSell.tsx,
│                CertificationBlock.tsx
├── cards/       SpecificationsTable.tsx
└── (page-level, stay flat): ProductDetails.tsx, ProductGallery.tsx, ProductHeader.tsx,
     ProductPurchaseCard.tsx, SectionTabs.tsx, TopNavigation.tsx, WriteReviewClient.tsx, Icons.tsx
```

**Smaller domains stay flat as-is** (`auth/` 8, `reviews/` 7, `product/` 7, `cart/` 5, `layout/` 4, `payment/` 2, `legal/` 2) — the Flutter doc only forces subgrouping once a folder actually gets crowded; these aren't there yet, and adding subfolders to a 2-4 file domain would be the "premature abstraction" your own CLAUDE.md tells me to avoid.

---

## 5. The actual ask: colors, typography, spacing pulled into `lib/constants/`

This is the concrete version of *"utils constant, text/font size from utils, colors also in utils, those used 3-4 times."* Current state, measured directly from the code:

| Value type | Occurrences | Files affected | Already has a partial home? |
|---|---|---|---|
| Hardcoded hex colors (`#ff5400`, `#211e1a`, `#e5e0da`, `#6b6459`, ...) | **808** | ~110 | Partially — `app/globals.css` defines 8 CSS custom properties, but 808 call sites still bypass them with raw hex |
| Arbitrary font sizes (`text-[13px]`, `text-[14px]`, ...) | **401**, 15 distinct values | ~90 | No — `--text-*` CSS vars exist in `globals.css` but nothing references them yet |
| Arbitrary spacing (`px-[16px]`, `gap-[8px]`, ...) | **368** | ~80 | No |
| Arbitrary radius (`rounded-[12px]`, `rounded-[999px]`, ...) | **137**, 15 distinct values | ~70 | Partially — `--radius-*` CSS vars exist, unused |
| `formatPrice()` / `₹...toLocaleString("en-IN")` | 42 raw `₹` + 32 `toLocaleString` calls | 18 | Yes — `components/ui/Price.tsx` already has `formatPrice()`, but it's not imported anywhere yet |

**Plan:** `lib/constants/colors.ts`, `typography.ts`, `spacing.ts`, `radius.ts` become the single typed source for these values (reading the *same* numbers already sitting in `globals.css`'s CSS custom properties, so there's zero visual drift). `lib/formatters/price.ts` becomes the one place `formatPrice()` lives — `components/ui/Price.tsx` imports it instead of defining it inline (today it does both, which is itself a small duplication).

This is a big surface area (roughly 200+ files touch *some* hardcoded value), so it should be executed in the same way every other cleanup in this project has been: one bounded, verified batch at a time — not one 200-file sweep with no checkpoint. Suggested batching in §8.

---

## 6. Dead code confirmed for removal

| File | Evidence |
|---|---|
| `services/oldWishlist/wishlist.service.ts` | Zero references anywhere in `app/`, `components/`, `hooks/`, `lib/`, `providers/`, `store/` — confirmed by grep just now |

(All other previously-found dead files — `SearchBar.tsx`, `ProductCardSkeleton.tsx`, `DeliveryBlock.tsx`, `LeadCaptureForm.tsx`, `FAQSection.tsx`, `FeatureBanners.tsx`, `DeliveryEnergization.tsx`, `PromotionsModule.tsx`, `ui/ProductCard.tsx` — were already deleted in an earlier pass and are gone from the tree.)

---

## 7. Hardcoded paths — the "get it from ENV" ask

You said you're confident `.env` is already correct and up to date, and don't want any hardcoded path bypassing it. Two real instances found:

1. **`services/reviews.service.ts:23`** re-derives its own backend base URL independently:
   ```ts
   const root = (process.env.NEXT_PUBLIC_API_URL || 'https://gemo-stone-backend-web-app.vercel.app').replace(/\/+$/, '');
   ```
   Every other service imports the shared `api` client from `lib/api.ts` (→ `services/http.ts` in the new structure), which already centralizes this exact logic in `getNormalizedBaseUrl()`. This file should do the same — one function reads `NEXT_PUBLIC_API_URL`, not two.

2. **`https://gemostone.com`** is hardcoded **10 times** across `app/layout.tsx`, `app/sitemap.ts`, and `app/robots.ts` (canonical URL, Open Graph images, JSON-LD, social links' domain). None of this reads from `.env`. Proposed fix: add `NEXT_PUBLIC_SITE_URL=https://gemostone.com` to `.env`/`.env.example`, expose it as `SITE_URL` from the new `lib/constants/config.ts`, and have all 10 call sites import that one constant instead of retyping the domain.

   *(Not flagged: `components/payment/RazorpayCheckout.tsx`'s `https://checkout.razorpay.com/v1/checkout.js` — that's a fixed third-party SDK URL, not a backend path. Hardcoding a CDN script URL is normal and correct; there's nothing to move to ENV there.)*

`lib/constants/config.ts` becomes the **one file** that calls `process.env.NEXT_PUBLIC_*` — every other file imports typed constants from it instead of touching `process.env` directly. That's the actual guarantee against "hardcoded paths": not just moving the two issues above, but making it structurally awkward to introduce a new one later.

---

## 8. Suggested execution order (once you approve this plan)

Given the size, doing this as one giant mechanical pass isn't verifiable — the same discipline used everywhere else in this project applies here too (small batch → typecheck → lint → browser-verify → next batch). Suggested phases:

1. **Zero-risk deletions & renames** — delete `services/oldWishlist/`, rename `store/cart.ts` → `store/cart.store.ts`, consolidate the two `providers/` locations into one.
2. **`lib/` consolidation** — merge top-level `constants/` into `lib/constants/`, move `lib/types.ts` → `types/shared.types.ts`, move `lib/api.ts` → `services/http.ts`, move `lib/supabase/` → `services/supabase/`. Update every import path this breaks (mechanical, verified by `tsc --noEmit` — a broken import fails the build immediately, so this phase is self-checking).
3. **Design tokens** — build `lib/constants/{colors,typography,spacing,radius}.ts` from the existing `globals.css` values, wire `formatPrice()` from `Price.tsx` into `lib/formatters/price.ts`. No consumers changed yet in this phase — just building the source of truth.
4. **Fix the two hardcoded-path issues** in §7.
5. **`components/ui/` and the 4 large domain folders** — subfolder regrouping from §4. Every import path updated, verified the same way as phase 2.
6. **Swap call sites onto the tokens** from phase 3, in batches per value-type (colors first, then spacing, then radius, then font-size) — this is the largest phase (~200 files) and the one most worth doing incrementally with verification between batches.

I'd recommend confirming this structure with you before starting phase 1, and checking in again before phase 6 specifically (it's the biggest and most mechanical).
