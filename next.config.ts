// Fixed next.config.ts - Remove COOP headers that block Google OAuth
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allow any hostname
      },
      {
        protocol: "http",
        hostname: "**", // optional if you want http images
      },
    ],
  },

  async headers() {
    return [
      {
        // Only apply to specific routes if needed, not all routes
        source: "/api/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
