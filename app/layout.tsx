import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

import StoreRehydrator from "@/components/StoreRehydrator";
import AuthProvider from "@/components/providers/AuthProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import { config } from "@/lib/constants/config";

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: "GemoStone — Certified Rudraksha, Pyrite & Spiritual Gemstones",
    template: "%s | GemoStone",
  },
  description:
    "Buy 100% lab-certified Rudraksha, Pyrite, Natural Gemstones, and Spiritual Accessories online at GemoStone. Fast nationwide delivery across India.",
  keywords: [
    "Certified Rudraksha India",
    "Original Pyrite Bracelet",
    "Natural Gemstones Online",
    "Siddha Beads",
    "Spiritual Gemstones Mumbai",
    "Neelam Gemstone",
    "Gemstone Shop Online",
    "GemoStone",
  ],
  authors: [{ name: "GemoStone", url: config.siteUrl }],
  creator: "GemoStone",
  publisher: "GemoStone",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: config.siteUrl,
    siteName: "GemoStone",
    title: "GemoStone — Certified Rudraksha, Pyrite & Spiritual Gemstones",
    description:
      "Buy 100% lab-certified Rudraksha, Pyrite, Natural Gemstones, and Spiritual Accessories online at GemoStone. Fast nationwide delivery across India.",
    images: [
      {
        url: `${config.siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "GemoStone — Certified Rudraksha & Spiritual Gemstones",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GemoStone — Certified Rudraksha, Pyrite & Spiritual Gemstones",
    description:
      "Buy 100% lab-certified Rudraksha, Pyrite, Natural Gemstones, and Spiritual Accessories online at GemoStone.",
    images: [`${config.siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: config.siteUrl,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

// JSON-LD Structured Data Schema for Organization & OnlineStore
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: "GemoStone",
  url: config.siteUrl,
  logo: `${config.siteUrl}/assets/logo/GemoStoneLogo.png`,
  image: `${config.siteUrl}/og-image.png`,
  description:
    "Buy 100% lab-certified Rudraksha, Pyrite, Natural Gemstones, and Spiritual Accessories online at GemoStone.",
  telephone: "+91-8080737803",
  email: "dekhane.yuvaraj01@gmail.com",
  address: {
    "@type": "PostalAddress",
    "streetAddress": "Mumbai",
    "addressLocality": "Mumbai",
    "addressRegion": "Maharashtra",
    "postalCode": "400001",
    "addressCountry": "IN",
  },
  sameAs: [
    "https://www.instagram.com/astro_vedansh/?hl=en",
    "https://www.facebook.com/astrovedansh/",
    "https://www.youtube.com/@Astrovedansh",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full max-w-full overflow-x-hidden">
      <head>
        {/* Google Tag Manager */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NNDW5SZQ');`,
          }}
        />
        {/* End Google Tag Manager */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-surface-subtle font-sans antialiased ${montserrat.variable}`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NNDW5SZQ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <AuthProvider>
          <StoreRehydrator />
          <ToastProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
