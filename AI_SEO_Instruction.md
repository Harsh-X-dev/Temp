# AI Instructions: On-Page SEO Setup for Any Website

> **How to use:** Give this file to an AI (Claude, ChatGPT, Cursor, etc.) working on any website codebase. Fill in the PROJECT INFO section first. The AI must complete every step below in the code.

---

## PROJECT INFO (fill this before giving to AI)

```
BRAND_NAME     = GemoStone (by AstroVedansh)
DOMAIN         = https://gemostone.com
CITY           = Mumbai
COUNTRY        = India
SERVICES       = Certified Rudraksha, Pyrite, Gemstones, Spiritual Accessories
MAIN_KEYWORD   = Certified Rudraksha & Spiritual Gemstones in India
PHONE / EMAIL  = +91-8080737803 / dekhane.yuvaraj01@gmail.com
ADDRESS        = Mumbai, Maharashtra, 400001
SOCIAL_LINKS   = https://www.instagram.com/astro_vedansh/?hl=en, https://www.facebook.com/astrovedansh/, https://www.youtube.com/@Astrovedansh
LOGO_PATH      = /public/assets/logo/GemoStoneLogo.png
```

**Keyword rule:** keywords = SERVICE + CITY (what customers search), never just the brand name.
Pattern: `<service> company in <city>`, `<service> agency <city>`, `best <service> company <city>`, `<service> cost in <country>`.

---

## STEP 1 — Title & Meta (every page, unique)

```html
<title>PRIMARY KEYWORD | BRAND_NAME</title>                     <!-- max 60 chars, keyword first -->
<meta name="description" content="...">                         <!-- 150-160 chars, include keyword + city + one proof point + CTA -->
<link rel="canonical" href="DOMAIN/current-page-url" />         <!-- MUST match the page's own URL, never all pointing to homepage -->
<meta name="robots" content="index, follow" />                  <!-- noindex on thank-you/admin pages -->
```

- One unique title + description + canonical PER PAGE. Never share one set across all pages.
- Do NOT add `<meta name="keywords">` — Google ignores it; it only reveals strategy to competitors.

## STEP 2 — Favicon & App Icons

Place in `/public/`, link in `<head>`:

```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="icon" href="/favicon.ico" />
```

Generate all sizes from the logo (use realfavicongenerator.net or resize programmatically).

## STEP 3 — Social Cover Banner (OG image)

Create ONE banner image `1200x630px` (`/public/og-image.png`): logo + tagline + main service, readable text. This shows when the link is shared on WhatsApp/LinkedIn/X. Do NOT use a square logo as the banner.

```html
<meta property="og:type" content="website" />
<meta property="og:title" content="same as page title" />
<meta property="og:description" content="same as meta description" />
<meta property="og:url" content="DOMAIN/current-page-url" />
<meta property="og:image" content="DOMAIN/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="DOMAIN/og-image.png" />
```

## STEP 4 — Structured Data (JSON-LD in `<head>`)

Every page — Organization; homepage/contact — add LocalBusiness:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "BRAND_NAME",
  "url": "DOMAIN",
  "logo": "DOMAIN/LOGO_PATH",
  "description": "BRAND_NAME is a SERVICES company in CITY, COUNTRY.",
  "telephone": "PHONE",
  "email": "EMAIL",
  "address": { "@type": "PostalAddress", "streetAddress": "ADDRESS", "addressLocality": "CITY", "addressCountry": "IN" },
  "sameAs": ["SOCIAL_LINKS"]
}
</script>
```

Validate at validator.schema.org. Blog posts get `Article` schema with real author name.

## STEP 5 — robots.txt & sitemap.xml

Static files in `/public/` (must return the actual file, not the app HTML — check hosting rewrite rules):

```
User-agent: *
Allow: /
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /

Sitemap: DOMAIN/sitemap.xml
```

sitemap.xml lists every real page URL. Regenerate when pages are added.

## STEP 6 — Content Structure (every page)

- Exactly ONE `<h1>` containing the page's keyword.
- First paragraph under H1: direct 40–60 word answer of what/who/where (AI engines quote this).
- H2/H3 subheadings covering: services included, process, proof (case studies with real numbers), FAQ (5+ real questions as H3s), CTA.
- 3–6 internal links to related pages with descriptive anchor text (not "click here").
- Every `<img>` has descriptive `alt` text; hero image is not lazy-loaded, below-fold images are.

## STEP 7 — If the site is React/Vue SPA (critical)

Client-rendered apps are INVISIBLE to AI crawlers (they don't run JavaScript) and slow for Google:

1. Add prerendering/SSG so every route ships full HTML at build time (vite prerender plugin / Next.js SSG / Astro).
2. Per-route meta via react-helmet-async or framework equivalent — only works combined with prerendering.
3. Unknown URLs must return real 404, not 200.

## STEP 8 — Performance

- Max 2–3 font families, `font-display: swap`.
- Compress images (WebP), set width/height attributes.
- Target: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 — verify with PageSpeed Insights.

## FINAL CHECK (AI must verify before finishing)

- [ ] Every page: unique title (≤60 chars) + description + self-canonical
- [ ] Favicon set + 1200x630 OG banner, tags on every page
- [ ] JSON-LD present and valid
- [ ] robots.txt + sitemap.xml served as real files
- [ ] One H1 with keyword per page, FAQ section, alt texts
- [ ] SPA: prerendered HTML contains the content (view-source shows text, not empty div)
- [ ] PageSpeed score checked
