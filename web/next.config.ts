import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    config.cache = false; // Disable persistent cache to avoid file system issues
    return config;
  },
};

export default nextConfig;
