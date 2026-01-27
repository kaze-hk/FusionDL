import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.hdslb.com',
      },
      {
        protocol: 'http',
        hostname: '**.hdslb.com',
      },
      {
        protocol: 'https',
        hostname: 'i0.hdslb.com',
      },
      {
        protocol: 'https',
        hostname: 'i1.hdslb.com',
      },
      {
        protocol: 'https',
        hostname: 'i2.hdslb.com',
      },
      {
        protocol: 'https',
        hostname: '**.ytimg.com',
      },
    ],
  },
};

export default nextConfig;
