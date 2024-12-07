/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
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
      bodySizeLimit: "10mb", // Erhöhe das Body-Limit auf 10 MB
    },
  },
};

module.exports = nextConfig;
