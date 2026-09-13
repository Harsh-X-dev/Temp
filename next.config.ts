import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.29.126'],
  
  images: {
    // Enable modern formats: AVIF (best compression) with WebP fallback.
    // Next.js will serve AVIF to browsers that support it, WebP otherwise.
    formats: ["image/avif", "image/webp"],

    // Allow specific quality props used in components
    qualities: [25, 50, 75, 80, 85, 90, 100],

    // Cache optimised images for 7 days (604800 seconds).
    // Product images rarely change; long TTL avoids redundant re-optimisation.
    minimumCacheTTL: 604800,

    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3845",
        pathname: "/assets/**",
      },
      {
        // Supabase Storage — public object access (category icons, product images)
        protocol: "https",
        hostname: "fmicaqhqxtarktowgfic.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Supabase Image Transformation API — allows requesting resized images
        // via the /storage/v1/render/image/public/** path.
        // Example: ?width=400&quality=80&format=webp
        protocol: "https",
        hostname: "fmicaqhqxtarktowgfic.supabase.co",
        pathname: "/storage/v1/render/image/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/backend-api/v1/:path*",
        destination: "https://gemo-stone-backend-web-app.vercel.app/api/v1/:path*",
      },
    ];
  },
  experimental: {
    staleTimes: {
      dynamic: 300,
      static: 300,
    },
  },
};


export default nextConfig;


