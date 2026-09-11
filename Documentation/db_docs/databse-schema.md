## Table `media_assets`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `usage` | `media_usage` |  |
| `kind` | `media_kind` |  |
| `storage_path` | `text` |  |
| `public_url` | `text` |  |
| `file_name` | `text` |  |
| `alt_text` | `text` |  Nullable |
| `width` | `int4` |  Nullable |
| `height` | `int4` |  Nullable |
| `file_size_bytes` | `int4` |  Nullable |
| `uploaded_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `collections`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `slug` | `text` |  Unique |
| `description` | `text` |  Nullable |
| `image_url` | `text` |  Nullable |
| `parent_id` | `uuid` |  Nullable |
| `sort_order` | `int4` |  |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `banners`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  Nullable |
| `image_url` | `text` |  |
| `mobile_image_url` | `text` |  Nullable |
| `link_url` | `text` |  Nullable |
| `placement` | `banner_placement` |  |
| `sort_order` | `int4` |  |
| `starts_at` | `timestamptz` |  Nullable |
| `ends_at` | `timestamptz` |  Nullable |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Table `products`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `slug` | `text` |  Unique |
| `short_description` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `status` | `text` |  |
| `seo_title` | `text` |  Nullable |
| `seo_description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `material_id` | `uuid` |  Nullable Unique |
| `origin_id` | `uuid` |  Nullable |
| `mukhi_type_id` | `uuid` |  Nullable |
| `is_energized` | `bool` |  |
| `energization_addon_price` | `numeric` |  Nullable |
| `tags` | `_text` |  |
| `options` | `jsonb` |  Nullable |

## Table `product_images`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `product_id` | `uuid` |  |
| `url` | `text` |  |
| `alt_text` | `text` |  Nullable |
| `position` | `int4` |  |

## Table `product_options`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `product_id` | `uuid` |  |
| `name` | `text` |  |
| `position` | `int4` |  |

## Table `product_variants`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `product_id` | `uuid` |  |
| `sku` | `text` |  Nullable Unique |
| `option1_value` | `text` |  Nullable |
| `option2_value` | `text` |  Nullable |
| `option3_value` | `text` |  Nullable |
| `price` | `numeric` |  |
| `compare_at_price` | `numeric` |  Nullable |
| `inventory_quantity` | `int4` |  |
| `low_stock_threshold` | `int4` |  Nullable |
| `weight_grams` | `numeric` |  Nullable |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Table `product_collections`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `product_id` | `uuid` | Primary |
| `collection_id` | `uuid` | Primary |

## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `full_name` | `text` |  |
| `phone` | `text` |  |
| `created_at` | `timestamptz` |  |
| `address_info` | `jsonb` |  |
| `updated_at` | `timestamptz` |  |
| `email_id` | `text` |  Nullable |
| `profile_image` | `jsonb` |  Nullable |
| `gender` | `text` |  Nullable |
| `birth_date` | `date` |  Nullable |

## Table `orders`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `order_number` | `text` |  Unique |
| `status` | `order_status` |  |
| `payment_status` | `payment_status` |  |
| `tracking_number` | `text` |  Nullable |
| `tracking_url` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `placed_at` | `timestamptz` |  |
| `delivered_at` | `timestamptz` |  Nullable |
| `confirmed_at` | `timestamptz` |  Nullable |
| `shipped_at` | `timestamptz` |  Nullable |
| `out_for_delivery_at` | `timestamptz` |  Nullable |
| `shipping_address` | `jsonb` |  Nullable |
| `billing_address` | `jsonb` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `payment_info` | `jsonb` |  Nullable |
| `product_info` | `jsonb` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `purposes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  Unique |
| `slug` | `text` |  Unique |
| `description` | `text` |  Nullable |
| `icon_url` | `text` |  Nullable |

## Table `zodiac_signs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  Unique |
| `name_hindi` | `text` |  Nullable |
| `slug` | `text` |  Unique |
| `date_range` | `text` |  Nullable |
| `sort_order` | `int4` |  |

## Table `planets`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  Unique |
| `name_hindi` | `text` |  Nullable |
| `slug` | `text` |  Unique |

## Table `coupons`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `code` | `text` |  Unique |
| `description` | `text` |  Nullable |
| `discount_type` | `discount_type` |  |
| `discount_value` | `numeric` |  |
| `max_discount_amount` | `numeric` |  Nullable |
| `min_order_amount` | `numeric` |  Nullable |
| `requires_prepaid` | `bool` |  |
| `is_auto_apply` | `bool` |  |
| `usage_limit_total` | `int4` |  Nullable |
| `usage_limit_per_customer` | `int4` |  Nullable |
| `times_used` | `int4` |  |
| `applies_to_all` | `bool` |  |
| `starts_at` | `timestamptz` |  Nullable |
| `ends_at` | `timestamptz` |  Nullable |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Table `coupon_products`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `coupon_id` | `uuid` | Primary |
| `product_id` | `uuid` | Primary |

## Table `coupon_collections`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `coupon_id` | `uuid` | Primary |
| `collection_id` | `uuid` | Primary |

## Table `reviews`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `product_id` | `uuid` |  |
| `user_id` | `uuid` |  Nullable |
| `order_id` | `uuid` |  Nullable |
| `is_approved` | `bool` |  |
| `helpful_count` | `int4` |  |
| `created_at` | `timestamptz` |  |
| `image_urls` | `jsonb` |  Nullable |
| `user_name` | `text` |  Nullable |
| `review_content` | `jsonb` |  Nullable |

## Table `content_pages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `title` | `text` |  |
| `body` | `text` |  |
| `updated_at` | `timestamptz` |  |

## Table `recommendation_quiz_questions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `question` | `text` |  |
| `position` | `int4` |  |

## Table `recommendation_quiz_options`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `question_id` | `uuid` |  |
| `label` | `text` |  |
| `maps_to_purpose_id` | `uuid` |  Nullable |
| `maps_to_zodiac_sign_id` | `uuid` |  Nullable |
| `maps_to_planet_id` | `uuid` |  Nullable |

## Table `materials`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  Unique |
| `slug` | `text` |  Unique |
| `description` | `text` |  Nullable |

## Table `origins`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  Unique |
| `description` | `text` |  Nullable |

## Table `mukhi_types`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `mukhi_count` | `int4` |  Nullable |
| `special_name` | `text` |  Nullable |
| `ruling_planet_id` | `uuid` |  Nullable |
| `mythology` | `text` |  Nullable |
| `benefits` | `text` |  Nullable |

## Table `moolanks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `number` | `int4` | Primary |
| `description` | `text` |  Nullable |

## Table `temples`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `city` | `text` |  Nullable |
| `state` | `text` |  Nullable |
| `image_url` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `product_purposes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `product_id` | `uuid` | Primary |
| `purpose_id` | `uuid` | Primary |

## Table `product_zodiac_signs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `product_id` | `uuid` | Primary |
| `zodiac_sign_id` | `uuid` | Primary |

## Table `product_planets`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `product_id` | `uuid` | Primary |
| `planet_id` | `uuid` | Primary |

## Table `product_moolanks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `product_id` | `uuid` | Primary |
| `moolank_number` | `int4` | Primary |

## Table `product_temples`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `product_id` | `uuid` | Primary |
| `temple_id` | `uuid` | Primary |

## Table `product_specifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `product_id` | `uuid` |  |
| `spec_key` | `text` |  |
| `spec_value` | `text` |  |
| `position` | `int4` |  |

## Table `product_certifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `product_id` | `uuid` |  |
| `variant_id` | `uuid` |  Nullable |
| `lab_name` | `text` |  Nullable |
| `certificate_number` | `text` |  Nullable |
| `issued_at` | `date` |  Nullable |
| `file_url` | `text` |  Nullable |

## Table `wishlists`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `customer_id` | `uuid` | Primary |
| `product_id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  |

## Table `members`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `role` | `user_role` |  |
| `full_name` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `product_materials`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `product_id` | `uuid` | Primary |
| `material_id` | `uuid` | Primary |

## Custom Types / Enums

### `otp_status`

`pending` | `verified` | `expired` | `superseded`

### `admin_role`

`superadmin` | `manager`

### `principal_type`

`User` | `Admin`

### `audit_status`

`success` | `failure`

### `user_role`

`customer` | `viewer` | `editor` | `admin` | `super_admin`

### `media_kind`

`image` | `video`

### `media_usage`

`category` | `banner`

### `banner_placement`

`homepage_hero` | `announcement_bar` | `category_top` | `popup` | `testimonials_section` | `two_up_story_grid` | `split_story_banner`

### `order_status`

`pending` | `confirmed` | `processing` | `shipped` | `out_for_delivery` | `delivered` | `cancelled` | `returned` | `refunded`

### `payment_method`

`prepaid` | `cod`

### `payment_status`

`pending` | `paid` | `failed` | `refunded`

### `discount_type`

`percentage` | `fixed_amount` | `free_shipping` | `free_gift`

### `review_source`

`organic` | `imported`

### `address_type`

`home` | `work` | `other`

## RLS Policies

### `media_assets`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin panel roles can read media_assets` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['viewer'::user_role, 'editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can delete media_assets` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can write media_assets` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |

### `collections`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can delete collections` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert collections` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can read all collections` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can update collections` | UPDATE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read active collections` | SELECT | public | PERMISSIVE | `(is_active = true)` | — |

### `banners`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `editor and above can write banners` | ALL | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `public can read active banners` | SELECT | public | PERMISSIVE | `(is_active = true)` | — |

### `materials`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable read access for all users` | SELECT | public | PERMISSIVE | `true` | — |
| `admin and above can delete materials` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert materials` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can update materials` | UPDATE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read materials` | SELECT | public | PERMISSIVE | `true` | — |

### `products`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can delete products` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert products` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can read all products` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can update products` | UPDATE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read active products` | SELECT | public | PERMISSIVE | `(status = 'active'::text)` | — |

### `product_images`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can delete product_images` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert product_images` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can read all product_images` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can update product_images` | UPDATE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read images of active products` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM products   WHERE ((products.id = product_images.product_id) AND (products.status = 'active'::text))))` | — |

### `product_options`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can delete product_options` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert product_options` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can read all product_options` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can update product_options` | UPDATE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read options of active products` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM products   WHERE ((products.id = product_options.product_id) AND (products.status = 'active'::text))))` | — |

### `product_variants`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can delete product_variants` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert product_variants` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can read all product_variants` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can update product_variants` | UPDATE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read variants of active products` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM products   WHERE ((products.id = product_variants.product_id) AND (products.status = 'active'::text))))` | — |

### `product_collections`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can delete product_collections` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert product_collections` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can read all product_collections` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read collections of active products` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM products   WHERE ((products.id = product_collections.product_id) AND (products.status = 'active'::text))))` | — |

### `origins`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable read access for all users` | SELECT | public | PERMISSIVE | `true` | — |
| `admin and above can delete origins` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert origins` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can update origins` | UPDATE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read origins` | SELECT | public | PERMISSIVE | `true` | — |

### `moolanks`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can delete moolanks` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert moolanks` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can update moolanks` | UPDATE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read moolanks` | SELECT | public | PERMISSIVE | `true` | — |

### `temples`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can delete temples` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert temples` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can update temples` | UPDATE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read temples` | SELECT | public | PERMISSIVE | `true` | — |

### `profiles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can read own profile` | SELECT | authenticated | PERMISSIVE | `(id = auth.uid())` | — |
| `viewer and above can read all addresses` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['viewer'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |

### `members`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins can read all members` | SELECT | authenticated | PERMISSIVE | `(private."current_role"() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `super_admin can update member role` | UPDATE | authenticated | PERMISSIVE | `(private."current_role"() = 'super_admin'::user_role)` | `(private."current_role"() = 'super_admin'::user_role)` |
| `users can read own member record` | SELECT | authenticated | PERMISSIVE | `(id = ( SELECT auth.uid() AS uid))` | — |

### `product_purposes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can delete product_purposes` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert product_purposes` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can read all product_purposes` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read purposes of active products` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM products   WHERE ((products.id = product_purposes.product_id) AND (products.status = 'active'::text))))` | — |

### `product_zodiac_signs`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can delete product_zodiac_signs` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert product_zodiac_signs` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can read all product_zodiac_signs` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read zodiac_signs of active products` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM products   WHERE ((products.id = product_zodiac_signs.product_id) AND (products.status = 'active'::text))))` | — |

### `product_planets`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can delete product_planets` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert product_planets` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can read all product_planets` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read planets of active products` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM products   WHERE ((products.id = product_planets.product_id) AND (products.status = 'active'::text))))` | — |

### `product_moolanks`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can delete product_moolanks` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert product_moolanks` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can read all product_moolanks` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read moolanks of active products` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM products   WHERE ((products.id = product_moolanks.product_id) AND (products.status = 'active'::text))))` | — |

### `product_temples`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can delete product_temples` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert product_temples` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can read all product_temples` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read temples of active products` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM products   WHERE ((products.id = product_temples.product_id) AND (products.status = 'active'::text))))` | — |

### `product_specifications`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can delete product_specifications` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert product_specifications` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can read all product_specifications` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can update product_specifications` | UPDATE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read specifications of active products` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM products   WHERE ((products.id = product_specifications.product_id) AND (products.status = 'active'::text))))` | — |

### `product_certifications`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can delete product_certifications` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert product_certifications` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can read all product_certifications` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can update product_certifications` | UPDATE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read certifications of active products` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM products   WHERE ((products.id = product_certifications.product_id) AND (products.status = 'active'::text))))` | — |

### `coupons`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable read access for all users` | SELECT | public | PERMISSIVE | `true` | — |
| `admin and above can write coupons` | ALL | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` |
| `admin panel roles can read coupons` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['viewer'::user_role, 'editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |

### `coupon_products`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can write coupon_products` | ALL | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` |
| `admin panel roles can read coupon_products` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['viewer'::user_role, 'editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |

### `coupon_collections`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can write coupon_collections` | ALL | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` |
| `admin panel roles can read coupon_collections` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['viewer'::user_role, 'editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |

### `reviews`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can insert their own reviews` | INSERT | authenticated | PERMISSIVE | — | `(user_id = auth.uid())` |
| `Users can read their own reviews` | SELECT | authenticated | PERMISSIVE | `(user_id = auth.uid())` | — |
| `admin panel roles can read all reviews` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['viewer'::user_role, 'editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can moderate reviews` | UPDATE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read approved reviews` | SELECT | public | PERMISSIVE | `(is_approved = true)` | — |

### `content_pages`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `editor and above can write content_pages` | ALL | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `public can read content_pages` | SELECT | public | PERMISSIVE | `true` | — |

### `purposes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `editor and above can write purposes` | ALL | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `public can read purposes` | SELECT | public | PERMISSIVE | `true` | — |

### `zodiac_signs`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `editor and above can write zodiac_signs` | ALL | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `public can read zodiac_signs` | SELECT | public | PERMISSIVE | `true` | — |

### `planets`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `editor and above can write planets` | ALL | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `public can read planets` | SELECT | public | PERMISSIVE | `true` | — |

### `recommendation_quiz_questions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `editor and above can write quiz questions` | ALL | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `public can read quiz questions` | SELECT | public | PERMISSIVE | `true` | — |

### `recommendation_quiz_options`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `editor and above can write quiz options` | ALL | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `public can read quiz options` | SELECT | public | PERMISSIVE | `true` | — |

### `wishlists`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin panel roles can read all wishlists` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['viewer'::user_role, 'editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `customers can manage their own wishlist` | ALL | authenticated | PERMISSIVE | `(( SELECT auth.uid() AS uid) = customer_id)` | `(( SELECT auth.uid() AS uid) = customer_id)` |

### `product_materials`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable read access for all users` | SELECT | public | PERMISSIVE | `true` | — |

### `orders`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Service role full access on orders` | ALL | public | PERMISSIVE | `true` | `true` |
| `Service role has full access to orders` | ALL | service_role | PERMISSIVE | `true` | `true` |
| `Users can create orders` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `Users can view own orders` | SELECT | public | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `Users can view their own orders` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `admin and above can update orders` | UPDATE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `viewer and above can read all orders` | SELECT | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['viewer'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |

### `mukhi_types`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin and above can delete mukhi_types` | DELETE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))` | — |
| `editor and above can insert mukhi_types` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` |
| `editor and above can update mukhi_types` | UPDATE | authenticated | PERMISSIVE | `(( SELECT private."current_role"() AS "current_role") = ANY (ARRAY['editor'::user_role, 'admin'::user_role, 'super_admin'::user_role]))` | — |
| `public can read mukhi_types` | SELECT | public | PERMISSIVE | `true` | — |

