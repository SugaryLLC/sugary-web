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
};

export default nextConfig;
