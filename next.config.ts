import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  productionBrowserSourceMaps: false,
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = "eval-source-map";
    }
    return config;
  },
};

export default nextConfig;
