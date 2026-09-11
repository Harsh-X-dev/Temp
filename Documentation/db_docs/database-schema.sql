-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.media_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usage USER-DEFINED NOT NULL,
  kind USER-DEFINED NOT NULL DEFAULT 'image'::media_kind,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  file_name text NOT NULL,
  alt_text text,
  width integer,
  height integer,
  file_size_bytes integer,
  uploaded_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT media_assets_pkey PRIMARY KEY (id),
  CONSTRAINT media_assets_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.members(id)
);
CREATE TABLE public.collections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  parent_id uuid,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT collections_pkey PRIMARY KEY (id),
  CONSTRAINT collections_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.collections(id)
);
CREATE TABLE public.banners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  mobile_image_url text,
  link_url text,
  placement USER-DEFINED NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT banners_pkey PRIMARY KEY (id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text,
  description text,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text])),
  seo_title text,
  seo_description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  material_id uuid UNIQUE,
  origin_id uuid,
  mukhi_type_id uuid,
  is_energized boolean NOT NULL DEFAULT false,
  energization_addon_price numeric,
  tags ARRAY NOT NULL DEFAULT '{}'::text[],
  options jsonb DEFAULT '{"option1_name": null, "option2_name": null, "option3_name": null}'::jsonb,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id),
  CONSTRAINT products_origin_id_fkey FOREIGN KEY (origin_id) REFERENCES public.origins(id),
  CONSTRAINT products_mukhi_type_id_fkey FOREIGN KEY (mukhi_type_id) REFERENCES public.mukhi_types(id)
);
CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  url text NOT NULL,
  alt_text text,
  position integer NOT NULL DEFAULT 0,
  CONSTRAINT product_images_pkey PRIMARY KEY (id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.product_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  CONSTRAINT product_options_pkey PRIMARY KEY (id),
  CONSTRAINT product_options_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.product_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  sku text UNIQUE,
  option1_value text,
  option2_value text,
  option3_value text,
  price numeric NOT NULL,
  compare_at_price numeric,
  inventory_quantity integer NOT NULL DEFAULT 0,
  low_stock_threshold integer DEFAULT 5,
  weight_grams numeric,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.product_collections (
  product_id uuid NOT NULL,
  collection_id uuid NOT NULL,
  CONSTRAINT product_collections_pkey PRIMARY KEY (product_id, collection_id),
  CONSTRAINT product_collections_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_collections_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  address_info jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  email_id text,
  profile_image jsonb,
  gender text,
  birth_date date,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::order_status,
  payment_status USER-DEFINED NOT NULL DEFAULT 'pending'::payment_status,
  tracking_number text,
  tracking_url text,
  notes text,
  placed_at timestamp with time zone NOT NULL DEFAULT now(),
  delivered_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  shipped_at timestamp with time zone,
  out_for_delivery_at timestamp with time zone,
  shipping_address jsonb,
  billing_address jsonb,
  user_id uuid,
  payment_info jsonb DEFAULT '{}'::jsonb,
  product_info jsonb DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.purposes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon_url text,
  CONSTRAINT purposes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.zodiac_signs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_hindi text,
  slug text NOT NULL UNIQUE,
  date_range text,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT zodiac_signs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.planets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_hindi text,
  slug text NOT NULL UNIQUE,
  CONSTRAINT planets_pkey PRIMARY KEY (id)
);
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type USER-DEFINED NOT NULL,
  discount_value numeric NOT NULL,
  max_discount_amount numeric,
  min_order_amount numeric DEFAULT 0,
  requires_prepaid boolean NOT NULL DEFAULT false,
  is_auto_apply boolean NOT NULL DEFAULT false,
  usage_limit_total integer,
  usage_limit_per_customer integer DEFAULT 1,
  times_used integer NOT NULL DEFAULT 0,
  applies_to_all boolean NOT NULL DEFAULT true,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT coupons_pkey PRIMARY KEY (id)
);
CREATE TABLE public.coupon_products (
  coupon_id uuid NOT NULL,
  product_id uuid NOT NULL,
  CONSTRAINT coupon_products_pkey PRIMARY KEY (coupon_id, product_id),
  CONSTRAINT coupon_products_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id),
  CONSTRAINT coupon_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.coupon_collections (
  coupon_id uuid NOT NULL,
  collection_id uuid NOT NULL,
  CONSTRAINT coupon_collections_pkey PRIMARY KEY (coupon_id, collection_id),
  CONSTRAINT coupon_collections_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id),
  CONSTRAINT coupon_collections_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  user_id uuid,
  order_id uuid,
  is_approved boolean NOT NULL DEFAULT false,
  helpful_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  image_urls jsonb DEFAULT '{}'::jsonb,
  user_name text,
  review_content jsonb,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (user_id) REFERENCES public.members(id)
);
CREATE TABLE public.content_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  body text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT content_pages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.recommendation_quiz_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  CONSTRAINT recommendation_quiz_questions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.recommendation_quiz_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL,
  label text NOT NULL,
  maps_to_purpose_id uuid,
  maps_to_zodiac_sign_id uuid,
  maps_to_planet_id uuid,
  CONSTRAINT recommendation_quiz_options_pkey PRIMARY KEY (id),
  CONSTRAINT recommendation_quiz_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.recommendation_quiz_questions(id),
  CONSTRAINT recommendation_quiz_options_maps_to_purpose_id_fkey FOREIGN KEY (maps_to_purpose_id) REFERENCES public.purposes(id),
  CONSTRAINT recommendation_quiz_options_maps_to_zodiac_sign_id_fkey FOREIGN KEY (maps_to_zodiac_sign_id) REFERENCES public.zodiac_signs(id),
  CONSTRAINT recommendation_quiz_options_maps_to_planet_id_fkey FOREIGN KEY (maps_to_planet_id) REFERENCES public.planets(id)
);
CREATE TABLE public.materials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  CONSTRAINT materials_pkey PRIMARY KEY (id)
);
CREATE TABLE public.origins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  CONSTRAINT origins_pkey PRIMARY KEY (id)
);
CREATE TABLE public.mukhi_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mukhi_count integer,
  special_name text,
  ruling_planet_id uuid,
  mythology text,
  benefits text,
  CONSTRAINT mukhi_types_pkey PRIMARY KEY (id),
  CONSTRAINT mukhi_types_ruling_planet_id_fkey FOREIGN KEY (ruling_planet_id) REFERENCES public.planets(id)
);
CREATE TABLE public.moolanks (
  number integer NOT NULL CHECK (number >= 1 AND number <= 9),
  description text,
  CONSTRAINT moolanks_pkey PRIMARY KEY (number)
);
CREATE TABLE public.temples (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  state text,
  image_url text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT temples_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_purposes (
  product_id uuid NOT NULL,
  purpose_id uuid NOT NULL,
  CONSTRAINT product_purposes_pkey PRIMARY KEY (product_id, purpose_id),
  CONSTRAINT product_purposes_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_purposes_purpose_id_fkey FOREIGN KEY (purpose_id) REFERENCES public.purposes(id)
);
CREATE TABLE public.product_zodiac_signs (
  product_id uuid NOT NULL,
  zodiac_sign_id uuid NOT NULL,
  CONSTRAINT product_zodiac_signs_pkey PRIMARY KEY (product_id, zodiac_sign_id),
  CONSTRAINT product_zodiac_signs_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_zodiac_signs_zodiac_sign_id_fkey FOREIGN KEY (zodiac_sign_id) REFERENCES public.zodiac_signs(id)
);
CREATE TABLE public.product_planets (
  product_id uuid NOT NULL,
  planet_id uuid NOT NULL,
  CONSTRAINT product_planets_pkey PRIMARY KEY (product_id, planet_id),
  CONSTRAINT product_planets_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_planets_planet_id_fkey FOREIGN KEY (planet_id) REFERENCES public.planets(id)
);
CREATE TABLE public.product_moolanks (
  product_id uuid NOT NULL,
  moolank_number integer NOT NULL,
  CONSTRAINT product_moolanks_pkey PRIMARY KEY (product_id, moolank_number),
  CONSTRAINT product_moolanks_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_moolanks_moolank_number_fkey FOREIGN KEY (moolank_number) REFERENCES public.moolanks(number)
);
CREATE TABLE public.product_temples (
  product_id uuid NOT NULL,
  temple_id uuid NOT NULL,
  CONSTRAINT product_temples_pkey PRIMARY KEY (product_id, temple_id),
  CONSTRAINT product_temples_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_temples_temple_id_fkey FOREIGN KEY (temple_id) REFERENCES public.temples(id)
);
CREATE TABLE public.product_specifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  spec_key text NOT NULL,
  spec_value text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  CONSTRAINT product_specifications_pkey PRIMARY KEY (id),
  CONSTRAINT product_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.product_certifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  variant_id uuid,
  lab_name text,
  certificate_number text,
  issued_at date,
  file_url text,
  CONSTRAINT product_certifications_pkey PRIMARY KEY (id),
  CONSTRAINT product_certifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_certifications_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.wishlists (
  customer_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT wishlists_pkey PRIMARY KEY (customer_id, product_id),
  CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT wishlists_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.members(id)
);
CREATE TABLE public.members (
  id uuid NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'customer'::user_role,
  full_name text,
  phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT members_pkey PRIMARY KEY (id),
  CONSTRAINT members_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.product_materials (
  product_id uuid NOT NULL,
  material_id uuid NOT NULL,
  CONSTRAINT product_materials_pkey PRIMARY KEY (product_id, material_id),
  CONSTRAINT product_materials_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_materials_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id)
);