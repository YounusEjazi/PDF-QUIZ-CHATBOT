import type { NextConfig } from 'next';

const config: NextConfig = {
  webpack: (config: any) => {
    config.resolve.alias.canvas = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    return config;
  },
  images: {
    domains: ['www.gravatar.com', 'lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default config;
