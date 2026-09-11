# FLOW.md — Gemostone Backend Reference

What this is: a complete reference to the Supabase (Postgres) backend behind the
Gemostone admin panel, written for whoever builds the customer-facing storefront
app against the same database. It documents every table, column, relationship,
enum, and access-control rule as they actually exist in the live database as of
**2026-07-28**, verified directly against the live project (not just migration
files, which have drifted from reality before).

If something here looks wrong once you're building against it, trust the live
database over this document and flag the mismatch — schemas move faster than
docs.

---

## 1. Stack & connection

- **Database**: Supabase (hosted Postgres) with Row Level Security (RLS) as the
  real access-control boundary — not an application-layer check. Every table
  below has RLS enabled; what a query returns depends entirely on who's asking.
- **Auth**: Supabase Auth (`auth.users`), extended by a `public.profiles` table
  (see §3). Email/password and OAuth (Google/Apple) both work the same way —
  a `profiles` row is auto-created for every new `auth.users` row via trigger.
- **Storage**: one public bucket, `media` (see §7).
- **Client setup**: use `@supabase/supabase-js` with the project URL and the
  **anon (public) key** only. Never ship the service-role key to a frontend
  app — it bypasses RLS entirely and is admin-panel-server-only.
- **Do NOT** query `information_schema` / `pg_catalog` from the client; use the
  tables below directly through the normal PostgREST-backed client.

---

## 2. The one rule that explains most access decisions

Every table's RLS policy follows the same shape:

- **Anonymous / not signed in**: can read only what's meant to be public —
  active products, active categories, active banners, approved reviews, and
  reference/taxonomy tables. Nothing else.
- **Signed in, role = `customer`** (every storefront shopper): same public
  read access as anonymous, **plus** their own rows in `profiles`, `addresses`,
  `orders`, `order_items`. A customer can never read another customer's data,
  and can never read admin-only tables (media library, coupons' internal
  fields, unapproved reviews) even though they're "authenticated."
- **Signed in, admin-panel role** (`viewer` / `editor` / `admin` / `super_admin`):
  this is the admin panel, not the storefront — irrelevant to a storefront
  build except to know these roles exist and see everything.

If a query returns an empty array with no error, that's almost always RLS
correctly filtering rows, not a bug — check whether the row you expected is
`is_active`/`status='active'`/`is_approved`, and whether you're signed in as
the row's owner.

---

## 3. Auth & roles

### `profiles`
Extends `auth.users` 1:1 (`profiles.id` = `auth.users.id`, cascade-deletes with it).

| Column | Type | Null? | Notes |
|---|---|---|---|
| `id` | uuid (PK, FK → auth.users) | no | same id as the Supabase Auth user |
| `full_name` | text | yes | |
| `phone` | text | yes | |
| `avatar_url` | text | yes | |
| `role` | `user_role` enum | no, default `customer` | see below |
| `created_at` | timestamptz | no, default now() | |

**`user_role` enum**: `customer`, `viewer`, `editor`, `admin`, `super_admin`.
Every new sign-up (password or OAuth) lands as `customer` unless invited by an
admin with a different role baked into the invite (admin-panel-only flow — not
something a storefront sign-up ever sets).

**RLS on `profiles`**:
- A user can `SELECT` their own row. Admin-panel roles (`admin`/`super_admin`)
  can `SELECT` all rows.
- `UPDATE` is restricted to `super_admin` only (role changes are an
  admin-panel-only action). **There is no self-service profile-edit policy** —
  if the storefront needs "edit my name/phone," that policy doesn't exist yet
  and will need to be added (narrowly — allow a user to update their own row
  but not their own `role` column).
- No `INSERT`/`DELETE` policy for regular users — rows are created only by the
  `on_auth_user_created` trigger on sign-up.

---

## 4. Catalog

### `collections` (shown as "Categories" in the admin panel)

| Column | Type | Null? | Notes |
|---|---|---|---|
| `id` | uuid (PK) | no | |
| `title` | text | no | |
| `slug` | text (unique) | no | use for URLs: `/collections/{slug}` |
| `description` | text | yes | |
| `image_url` | text | yes | from the media library |
| `parent_id` | uuid (FK → collections.id) | yes | self-referencing; **not currently used by the admin UI** — every category today is top-level, but the column exists for future subcategories |
| `sort_order` | int | no, default 0 | |
| `is_active` | boolean | no, default true | anon/customer only ever see `is_active = true` rows |
| `created_at` / `updated_at` | timestamptz | no | |

RLS: public read (active only) · admin-panel editor+ read all/write · admin+ delete.

### `products`

| Column | Type | Null? | Notes |
|---|---|---|---|
| `id` | uuid (PK) | no | |
| `title` | text | no | |
| `slug` | text (unique) | no | use for URLs: `/products/{slug}` |
| `short_description` | text | yes | |
| `description` | text | yes | |
| `status` | text, check in (`draft`,`active`,`archived`) | no, default `draft` | **not an enum** — a plain text CHECK constraint |
| `material_id` | uuid (FK → materials.id) | yes | Phase 2 |
| `origin_id` | uuid (FK → origins.id) | yes | Phase 2 |
| `mukhi_type_id` | uuid (FK → mukhi_types.id) | yes | Phase 2, rudraksha-specific |
| `is_energized` | boolean | no, default false | Phase 2 |
| `energization_addon_price` | numeric(10,2) | yes | Phase 2 — extra charge if a customer opts into energization |
| `seo_title` / `seo_description` | text | yes | |
| `created_at` / `updated_at` | timestamptz | no | |

RLS: public read (`status = 'active'` only) · editor+ read all/write · admin+ delete.

### `product_images`
`id`, `product_id` (FK, cascade), `url`, `alt_text` (nullable), `position` (int, display order).
RLS: public read only for images of an **active** parent product (checked via
`EXISTS` against `products.status`) · editor+ manage.

### `product_options` and `product_variants`
A product can have 1+ variants distinguished by up to 3 option axes
(`option1_value`/`option2_value`/`option3_value` on the variant — e.g. Size,
Color). `product_options` names those axes (`name`, `position`); most current
products have zero rows here and exactly one implicit variant.

`product_variants` columns: `id`, `product_id` (FK, cascade), `sku` (nullable,
not unique-enforced across variants of different products), `option1_value` /
`option2_value` / `option3_value` (nullable text), `price` (numeric, **not
null — every variant must have a price**), `compare_at_price` (nullable — set
only when there's a genuine higher "was" price, don't fabricate one),
`inventory_quantity` (int, default 0), `low_stock_threshold` (int, default 5),
`weight_grams` (nullable numeric — used for shipping calc), `is_active`
(boolean, default true), `created_at`.

For a product's **display price**, use the lowest active variant's price; for
a price range, min–max across variants.

RLS (both tables): public read only via active-parent-product `EXISTS` check ·
editor+ manage.

### `product_collections` (junction: product ↔ category, many-to-many)
`product_id`, `collection_id` — composite PK, both FK cascade. No `updated_at`;
rows are added/removed, not edited. RLS: public read via active-product
`EXISTS` · editor+ insert · admin+ delete.

---

## 5. Astrology taxonomy (Phase 2)

> **Status as of this document: the migration that creates this section
> (`20260728050000_product_phase2.sql`) has been written but had NOT yet been
> applied to the live database as of this writing.** The admin panel's own
> code already queries these tables, so until the migration is run, product
> edit/create in the admin panel — and any frontend code written against this
> section — will fail with "table not found." Confirm with the backend team
> that it's been applied before building against anything in this section.

Reference/lookup tables, all public-read, no active/inactive distinction:

| Table | Columns | Notes |
|---|---|---|
| `purposes` | `id`, `name` (unique), `slug` (unique), `description`, `icon_url` | "Wealth", "Love", "Career", etc. — used by the recommendation quiz |
| `zodiac_signs` | `id`, `name` (unique), `name_hindi`, `slug` (unique), `date_range`, `sort_order` | the 12 signs |
| `planets` | `id`, `name` (unique), `name_hindi`, `slug` (unique) | the 9 Vedic grahas (Sun–Ketu) |
| `materials` | `id`, `name` (unique), `slug` (unique), `description` | Rudraksha, Pyrite, Karungali, gemstone types, etc. |
| `origins` | `id`, `name` (unique), `description` | Nepal, Ceylon, Burma, etc. |
| `mukhi_types` | `id`, `mukhi_count` (nullable int), `special_name` (nullable), `ruling_planet_id` (FK → planets), `mythology`, `benefits` | 1–14 mukhi + named special forms (Gauri Shankar, etc.) — `mukhi_count` is null for special-named forms |
| `moolanks` | `number` (PK, 1–9), `description` | numerology root-number lookup |
| `temples` | `id`, `name`, `city`, `state`, `image_url`, `description`, `created_at` | **seeded empty on purpose** — real partner temples are added manually, not fabricated |

A product links to this taxonomy via junction tables, each shaped the same way
(`product_id` + `<thing>_id`, composite PK, cascade delete, no update — rows
are added/removed): `product_purposes`, `product_zodiac_signs`,
`product_planets`, `product_moolanks` (references `moolanks.number`, not a
uuid), `product_temples`. RLS on all of them: public read via active-product
`EXISTS` · editor+ insert · admin+ delete — same pattern as `product_collections`.

### `product_specifications`
Real per-row data (edited in place, unlike the junctions above): `id`,
`product_id` (FK, cascade), `spec_key`, `spec_value`, `position`. Free-form
key/value pairs for a product's spec sheet (e.g. "Weight" / "5g",
"Certification" / "IGI"). RLS: public read (active-product) · editor+ full manage.

### `product_certifications`
`id`, `product_id` (FK, cascade), `variant_id` (nullable FK → product_variants
— set when a cert applies to one specific variant, not the whole product),
`lab_name`, `certificate_number`, `issued_at` (date), `file_url`. RLS: public
read (active-product) · editor+ full manage.

---

## 6. Content & marketing

### `banners`

| Column | Type | Null? | Notes |
|---|---|---|---|
| `id` | uuid (PK) | no | |
| `title` | text | yes | internal label, not always shown to users |
| `image_url` | text | no | |
| `mobile_image_url` | text | yes | optional separate crop for small screens — fall back to `image_url` if null |
| `link_url` | text | yes | where the banner navigates on click/tap — **see the URL convention below**; null is valid (e.g. a newsletter-signup banner that opens an inline form instead of navigating) |
| `placement` | `banner_placement` enum | no | `homepage_hero`, `announcement_bar`, `category_top`, `popup` |
| `sort_order` | int | no, default 0 | |
| `starts_at` / `ends_at` | timestamptz | yes | scheduling window — **not enforced by RLS**, `is_active` is the only hard gate; if you need "only currently-in-window" banners, filter `starts_at`/`ends_at` client-side or ask for a policy update |
| `is_active` | boolean | no, default true | |
| `created_at` | timestamptz | no | |

RLS: public read (`is_active = true` only) · editor+ write/delete (no separate
admin-only delete tier, unlike collections).

**`link_url` convention in use today** (so the frontend knows what routes to
build): `/collections/{slug}`, `/products/{slug}`, `/offers` (general
promotions/sales), `/new-arrivals`, `/about/certification`. These aren't
enforced by the schema — they're just the convention the admin-entered data
currently follows.

### `content_pages`
Simple CMS pages: `id`, `slug` (unique — use for `/pages/{slug}` or similar),
`title`, `body` (text — currently plain text/markdown, not structured), `updated_at`.
RLS: public read (all rows, no draft/published split — anything here is
meant to be live) · editor+ write.

### `recommendation_quiz_questions` / `recommendation_quiz_options`
Powers a "help me choose" quiz. Questions: `id`, `question`, `position`.
Options: `id`, `question_id` (FK, cascade), `label`, and up to three optional
mapping FKs (`maps_to_purpose_id`, `maps_to_zodiac_sign_id`,
`maps_to_planet_id`) — an answer can point at zero, one, or more of these to
drive a recommendation. RLS: public read · editor+ write. **No scoring/recommendation
endpoint exists yet** — the frontend will need to implement the actual
"pick a purpose/sign/planet, filter products by matching junction table" logic itself.

---

## 7. Media & storage

### `media_assets`
The **admin panel's own media library** — not something a storefront should
ever query directly. `id`, `usage` (`media_usage` enum: `category` / `banner`),
`kind` (`media_kind` enum: `image` / `video`), `storage_path`, `public_url`,
`file_name`, `alt_text`, `width`/`height`/`file_size_bytes` (nullable),
`uploaded_by` (FK → profiles), `created_at`.

RLS: **admin-panel roles only** (`viewer`/`editor`/`admin`/`super_admin`) —
not public, unlike almost everything else. A storefront should read images via
`collections.image_url` / `banners.image_url` / `product_images.url` directly
— those are already-resolved public URLs, not references into this table.

### Storage bucket: `media`
Public bucket (`storage.buckets.public = true`). Files are readable by anyone
via their public URL regardless of the `media_assets` RLS above (Storage and
table RLS are separate systems) — write/delete on the bucket itself is
editor-panel-role-gated the same way `media_assets` is.

---

## 8. Orders & commerce

> **This is the section with the biggest gaps for a storefront build — read
> the callouts carefully.**

### `addresses`
`id`, `customer_id` (FK → profiles, cascade), `full_name`, `phone`, `line1`,
`line2` (nullable), `city`, `state`, `pincode`, `country` (default `'India'`),
`is_default` (boolean), `created_at`.

RLS: a customer can fully manage (`select`/`insert`/`update`/`delete`) **their
own** addresses (`customer_id = auth.uid()`). Admin-panel `viewer`+ can read all.
**This one is ready to build against as-is.**

### `orders`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `order_number` | text (unique) | e.g. `ORD-2026-0001` |
| `customer_id` | uuid (FK → profiles) | nullable |
| `status` | `order_status` enum | `pending`, `confirmed`, `processing`, `shipped`, `out_for_delivery`, `delivered`, `cancelled`, `returned`, `refunded` |
| `payment_method` | `payment_method` enum | `prepaid`, `cod` |
| `payment_status` | `payment_status` enum | `pending`, `paid`, `failed`, `refunded` |
| `subtotal`, `discount_amount`, `shipping_amount`, `tax_amount`, `total`, `cashback_amount` | numeric(10,2) | `discount_amount`/`shipping_amount`/`tax_amount`/`cashback_amount` default 0 |
| `coupon_code` | text | nullable, plain text — not a FK to `coupons` |
| `shipping_address_id` / `billing_address_id` | uuid (FK → addresses) | nullable |
| `tracking_number` / `tracking_url` | text | nullable |
| `notes` | text | nullable |
| `placed_at` | timestamptz | default now() |
| `delivered_at` | timestamptz | nullable |

### `order_items`
`id`, `order_id` (FK, cascade), `product_id` (FK → products, nullable),
`variant_id` (FK → product_variants, nullable), `product_title` /
`variant_title` (text snapshot at time of order — doesn't update if the
product changes later), `quantity`, `unit_price`, `is_energization_addon`
(boolean), `temple_id` (uuid, **no FK constraint** — the `temples` table
didn't exist when this column was added; a real FK needs to be added now that
Phase 2 is in), `total_price`.

**RLS gap — read this before building checkout**: `orders` and `order_items`
have **read-only** RLS policies. A customer can `SELECT` their own orders; there
is **no `INSERT` policy on either table** — nothing in the current schema lets
a storefront actually create an order. Checkout is not buildable against this
schema as-is. Before building checkout, the backend needs either:
- an `INSERT` policy scoped so a customer can only insert an order with
  `customer_id = auth.uid()` (and similarly for its items via the parent
  order), or
- a Postgres function (`SECURITY DEFINER`) that validates and creates an
  order+items atomically, called via RPC — generally the safer option for
  anything involving price calculation, stock decrement, and coupon
  validation together.

Flag this to the backend team rather than trying to work around it with the
service-role key from a frontend context (never do that — it bypasses all RLS).

---

## 9. Coupons

### `coupons`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `code` | text (unique) | |
| `description` | text | nullable |
| `discount_type` | `discount_type` enum | `percentage`, `fixed_amount`, `free_shipping`, `free_gift` |
| `discount_value` | numeric(10,2) | |
| `max_discount_amount` | numeric(10,2) | nullable — cap for percentage discounts |
| `min_order_amount` | numeric(10,2) | default 0 |
| `requires_prepaid` | boolean | default false |
| `is_auto_apply` | boolean | default false — applies without the customer entering a code |
| `usage_limit_total` | int | nullable = unlimited |
| `usage_limit_per_customer` | int | default 1 |
| `times_used` | int | default 0 — **not atomically incremented by any trigger**; whatever creates orders is responsible for updating this |
| `applies_to_all` | boolean | default true |
| `starts_at` / `ends_at` | timestamptz | nullable |
| `is_active` | boolean | default true |

`coupon_products` / `coupon_collections`: junction tables scoping a coupon to
specific products/categories when `applies_to_all = false`. Same
composite-PK, no-update shape as the catalog junctions.

**RLS gap**: all three tables are **admin-panel-roles-only** for `SELECT` (this
was deliberately tightened — see §11). A customer/storefront **cannot read
coupon data at all** right now, including just checking whether a code is
valid. Coupon-code validation at checkout needs a new, narrowly-scoped
mechanism (e.g. an RPC function that takes a code + order total and returns
"valid, this much off" without exposing the full row, including inactive
codes or internal usage counters) — don't widen the blanket read policy back
open to fix this, per the audit note already in the migration history.

---

## 10. Reviews

### `reviews`
`id`, `product_id` (FK → products, cascade, not null), `customer_id` (FK →
profiles, nullable), `order_item_id` (FK → order_items, nullable — links a
review to a verified purchase when present), `rating` (int, 1–5, checked),
`title` / `body` (nullable text), `source` (`review_source` enum: `organic` /
`imported`), `is_approved` (boolean, default false), `helpful_count` (int,
default 0), `created_at`.

`review_images`: `id`, `review_id` (FK, cascade), `url`.

RLS: public (and customer) read is **`is_approved = true` only** — even a
signed-in customer cannot see other people's pending reviews, or their own
pending review reflected back differently than anyone else's view. Admin-panel
`viewer`+ can read all (including pending, for moderation). `editor`+ can
`UPDATE` (approve/reject).

**RLS gap**: like orders, there's **no `INSERT` policy** — a customer cannot
submit a new review through RLS as it stands today. "Leave a review" needs an
`INSERT` policy (customer can insert with `customer_id = auth.uid()`, probably
requiring `order_item_id` to reference a real completed purchase of theirs) or
an RPC function, before that feature is buildable.

---

## 11. Security model detail (for context, not usually needed day-to-day)

Every policy that needs to check "what role is the calling user" uses a
shared helper, `private.current_role()` — a `SECURITY DEFINER` SQL function
that reads the caller's own `profiles.role`. It exists specifically so a
policy on `profiles` itself doesn't recursively re-trigger RLS when checking
a user's own role. You'll never call this directly from a frontend — it's
internal to how policies are written — but it's why every "admin panel roles"
check in this doc behaves consistently.

This schema has been through one full RLS audit pass (fixing four real
over-exposures — `media_assets` was fully public, `coupons`/`reviews` let any
signed-in customer read internal/unapproved data with no role check at all,
`addresses` under-granted `viewer`) plus a second verification pass on
2026-07-28 that re-confirmed: anonymous access is correctly scoped table-by-table,
a signed-in `customer` cannot read anything admin-only (re-tested directly,
not just reviewed), and a `customer` cannot escalate their own `role` via a
direct table update (also re-tested directly). Nothing found in that second
pass required a fix — the three gaps flagged in §8–§10 (no order/review
`INSERT` policy, no coupon-validation path) are **missing functionality**, not
**security holes**: they fail closed (nobody can do the thing at all) rather
than failing open (the wrong people can do it).

---

## 12. What's deliberately not built

Carried over from earlier project decisions, not oversights:
- **Wishlists** and **wallet/cashback balance** — explicitly out of scope for
  the current build.
- Product `parent_id` (subcategories) — column exists, unused.
- Coupon usage isn't atomically tracked (`times_used` needs manual/application
  updates).
- No email/notification system — nothing here sends order confirmations,
  shipping updates, etc.
