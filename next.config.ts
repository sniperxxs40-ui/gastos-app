import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  // Required to silence Turbopack/webpack conflict warning
  turbopack: {},
};

export default nextConfig;

