import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/og/**": ["./assets/og/NotoSansKR-Share.otf", "./public/jibnun-logo-symbol.png"],
    "/opengraph-image": ["./assets/og/NotoSansKR-Share.otf", "./public/jibnun-logo-symbol.png"],
  },
  images: {
    qualities: [90, 28, 62, 68, 72, 74, 75, 78, 80, 88],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
